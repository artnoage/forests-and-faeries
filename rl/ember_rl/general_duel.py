"""The duel trainer's ember backend: PPO and native distillation on the general `BatchEnv`.

    python -m ember_rl.duel --backend ember --mode distill --output runs/distill ...
    python -m ember_rl.duel --backend ember --schedule gated --output runs/ppo \
        --init-heroes runs/distill/distilled-heroes.pt --init-monsters runs/distill/distilled-monsters.pt ...

GeneralTrainer subclasses duel.Trainer and keeps its schedules (simultaneous,
alternating, gated with the absolute development gate and frozen phase-best
opponents), benchmarks, evaluation, best-<team>.pt and checkpoints. It
replaces the natural20 parts:
- the WorkerPool by the in-process BatchEnv (GENERAL_ENV.md §8.2): every
  ready slot is observed in one call, each controller key runs one batched
  forward pass, and all slots are stepped in one call;
- integer seeds by EpisodeSpecs: training draws from the catalog's train split
  (by tier), development and evaluation use fixed spec lists;
- the V3 models by general_model, with id dropout on learner decisions;
- PPO gains --native-kl (§6.5), a value-only warm-up (§6.3) and λ per round.
Dev and eval rows gain per-encounter and per-tier results plus `excess` (§7.4).

--schedule single-creature (experiment 3, GENERAL_ENV.md G6 status): each
training game picks a side 50/50, then one creature of that side uniformly
(token order of `encounter_units(row)`), and resets the slot with
{'heroes': 'native', 'monsters': 'native', 'external_units': [k]}. That
creature's decisions go to its team's learner (`info['team']`); every other
creature is the native AI. Both learners train continuously (PPO, optional
--native-kl), with no gate and no pool. Evaluation adds, per team, the same
single-creature setting against the native AI on the fixed eval specs (a
fixed creature per spec, cycling through the side's creatures per encounter),
reported as `<team>-single-vs-native` with `excess` and a per-creature-kind
breakdown, next to the standard full-team evaluations. best-single-<team>.pt
keeps the policy with the best single-creature mean score; best-<team>.pt stays
the full-team rule, so it is comparable across schedules.

DistillTrainer is --mode distill (§6.3): teacher-forced play, then DAgger with
β annealed from 1, training both students on the soft target q; Monte Carlo
value targets from purely native games; an optional K-rollout critic stage;
and the §6.4 validation (decision agreement and outcome matchups).
"""
from __future__ import annotations

import copy
import json
import math
import random
import time
from collections import Counter, defaultdict, deque
from pathlib import Path

import numpy as np

from ember_rl.duel import DEV_SEED_BASE, EVAL_SEED_BASE, OTHER, TEAMS, Policies, Trainer, run_deadline
from ember_rl.general_env import (
    FEATURE_VERSION, MOVE_KIND, OUTCOME_KINDS, TEAM_CODE, BatchEnv, SpecSource, breakdown, check_contract, encounter_units, info_row,
    load_catalogs, load_specs, parse_tier_weights, parse_weights, team_tokens, write_specs,
)


# --------------------------------------------------------------------------- environment and models

def needs_scores(args) -> bool:
    wanted = args.mode == 'distill' or args.native_kl > 0 or args.native_kl_final > 0
    if args.env_scores == 'off' and wanted:
        raise SystemExit('native scores are required by --mode distill and --native-kl')
    return args.env_scores == 'on' or (args.env_scores == 'auto' and wanted)


def make_batch_env(args, scores: bool):
    kwargs = dict(scores=scores, objective=args.objective, max_rounds=args.max_rounds,
                  standing_weight=args.standing_weight, max_steps=args.max_steps, threads=args.env_threads)
    if args.catalog:   # the env plays the catalog's encounters (ember_rs G6); else its own catalog
        kwargs['catalog'] = load_catalogs(catalog_entries(args))[0]     # several files: one merged list
    version = getattr(args, 'feature_version', FEATURE_VERSION)
    n_slots = args.slots + getattr(args, 'eval_slots', 0)     # --eval-slots: extra slots for evaluation games
    if args.ember_env == 'fake':
        from ember_rl.fake_env import FakeBatchEnv
        env = FakeBatchEnv(n_slots, feature_version=version, moves=getattr(args, 'moves', 'step'), **kwargs)
    elif args.ember_env == 'ember_rs':
        try:
            import ember_rs
        except ImportError as error:
            raise SystemExit('the ember_rs module (ember-rs stage G6) is not importable in this environment; '
                             'use --ember-env fake for tests') from error
        moves = getattr(args, 'moves', 'step')
        if moves != 'step':                             # ember-rs 9abcae2+: BatchEnv(moves='dest')
            if 'moves' not in (getattr(ember_rs.BatchEnv, '__text_signature__', None) or ''):
                raise SystemExit(f'--moves {moves}: this ember_rs wheel has no destination moves '
                                 '(install a wheel of ember-rs 9abcae2 or later)')
            kwargs['moves'] = moves
        if hasattr(ember_rs, 'FEATURE_VERSIONS'):       # ember-rs 596b2a6+: one wheel, several versions
            if version not in ember_rs.FEATURE_VERSIONS:
                raise SystemExit(f'this ember_rs wheel has no feature version {version!r} '
                                 f'(it has {sorted(ember_rs.FEATURE_VERSIONS)})')
            kwargs['feature_version'] = version
        elif version != ember_rs.FEATURE_VERSION:
            raise SystemExit(f'this ember_rs wheel only has {ember_rs.FEATURE_VERSION!r}, not {version!r}: '
                             'install a wheel of ember-rs 596b2a6 or later')
        env = ember_rs.BatchEnv(n_slots=n_slots, content=ember_rs.ContentPool(list(args.content)), **kwargs)
    else:
        import importlib
        module, _, name = args.ember_env.partition(':')
        env = getattr(importlib.import_module(module), name or 'BatchEnv')(n_slots, **kwargs)
    check_env(env, scores, version)
    if getattr(env, 'moves', 'step') != getattr(args, 'moves', 'step'):
        raise SystemExit(f'the environment plays moves={getattr(env, "moves", "step")!r}, not {args.moves!r}')
    return env


def check_env(env, scores: bool, feature_version: str | None = None) -> None:
    if not isinstance(env, BatchEnv):
        raise TypeError(f'{type(env).__name__} does not implement general_env.BatchEnv')
    check_contract(env, feature_version or env.feature_version)   # a known version and its dims
    if scores and not env.scores:
        raise ValueError('this run needs native scores but the environment has scores off')


def catalog_entries(args) -> list[str]:
    catalog = args.catalog
    return [catalog] if isinstance(catalog, str) else list(catalog or [])


def spec_source(args, env) -> SpecSource:
    if args.catalog:
        rows, tags = load_catalogs(catalog_entries(args))
    else:
        rows, tags = getattr(env, 'catalog', None), {}
    if rows is None:
        raise SystemExit('--catalog is required with this environment')
    try:
        return SpecSource(rows, train_split=args.train_split, tier_weights=parse_tier_weights(args.tier_weights),
                          party_weights=parse_weights(getattr(args, 'party_weights', '')),
                          family_weights=parse_weights(getattr(args, 'family_weights', '')),
                          band_weights=parse_weights(getattr(args, 'band_weights', '')),
                          balanced_range=getattr(args, 'balanced_range', '.40,.60'),
                          wide_range=getattr(args, 'wide_range', '.25,.75'), tags=tags)
    except ValueError as error:
        raise SystemExit(f'encounter sampling: {error}') from error


def fixed_specs(args, specs: SpecSource):
    """(development specs, evaluation specs, coverage reports): the --dev-specs / --eval-specs files, or lists
    stratified by cell (map family x party) from --dev-split / --eval-split rows in --fixed-bands
    (SpecSource.stratified). A cell that training draws but a list does not cover stops the run unless
    --allow-uncovered."""
    bands = [b.strip() for b in getattr(args, 'fixed_bands', '').split(',') if b.strip()] or None
    options = dict(bands=bands, min_per_cell=getattr(args, 'min_cell_episodes', 0),
                   weights=getattr(args, 'fixed_cell_weights', 'train'))
    reports = {}
    if args.dev_specs:
        dev = load_specs(args.dev_specs)
    else:
        dev, reports['dev'] = specs.stratified(args.dev_split, args.dev_episodes, DEV_SEED_BASE, **options)
    n_eval = max(args.eval_episodes, args.eval_native_episodes or 0)
    if getattr(args, 'schedule', None) == 'single-creature':
        n_eval = max(n_eval, args.eval_single_episodes or 0)
    if args.eval_specs:
        evaluation = load_specs(args.eval_specs)
    else:
        evaluation, reports['eval'] = specs.stratified(args.eval_split, n_eval, EVAL_SEED_BASE, **options)
    if not dev or not evaluation:
        raise ValueError('empty development or evaluation spec list')
    gaps = {name: r['uncovered'] for name, r in reports.items() if r['uncovered']}
    if gaps and not getattr(args, 'allow_uncovered', False):
        raise SystemExit(f'cells that training draws have no development/evaluation games: {gaps} '
                         '(add rows to those splits, raise the episode counts, or pass --allow-uncovered)')
    return dev, evaluation, reports


def model_config(args, env) -> dict:
    from ember_rl.general_model import general_config
    return general_config(env.dims, vocab=args.vocab or None, d_model=args.d_model, heads=args.heads,
                          encoder_layers=args.encoder_layers, decoder_layers=args.decoder_layers,
                          cnn_channels=args.cnn_channels, cnn_layers=args.cnn_layers, patch=args.patch)


def load_general(path, device, feature_version, team=None):
    """A frozen general-model policy from a trusted checkpoint (latest-, best-, distilled-<team>.pt)."""
    import torch
    from ember_rl.model import build_model, load_checkpoint
    payload = torch.load(path, map_location='cpu', weights_only=False)   # trusted local file only
    config = payload['model_config']
    if config.get('arch') != 'general' or config.get('feature_version') != feature_version:
        raise ValueError(f'{path}: not a general-model policy for {feature_version}')
    extra_team = (payload.get('extra') or {}).get('team')
    if team is not None and extra_team not in (None, team):
        raise ValueError(f'{path}: policy is for {extra_team}, not {team}')
    model = build_model(config)
    load_checkpoint(path, model, restore_rng=False, expected_feature_version=feature_version)
    return model.to(device).eval().requires_grad_(False)


class GeneralPolicies(Policies):
    """duel.Policies for general models: learners, pool snapshots, frozen benchmarks."""

    def __init__(self, args, device, config, feature_version):
        import torch
        from ember_rl.general_model import build_general
        self.torch, self.device, self.args = torch, device, args
        self.config, self.feature_version = config, feature_version
        transfer = getattr(args, 'transfer_v2_weights', False)
        if transfer and feature_version != 'ember-gen-v3':
            raise ValueError('--transfer-v2-weights requires --feature-version ember-gen-v3')
        if transfer and not (args.init_heroes or args.init_monsters):
            raise ValueError('--transfer-v2-weights requires an initial policy')
        self.initial = {} if transfer else {team: self.load_frozen(path, team)
                        for team, path in (('heroes', args.init_heroes), ('monsters', args.init_monsters)) if path}
        self.make = lambda: self.configure(build_general(config).to(device))
        self.learner = {team: self.make() for team in TEAMS}
        if transfer:
            for team, path in (('heroes', args.init_heroes), ('monsters', args.init_monsters)):
                if path:
                    source = load_general(path, device, 'ember-gen-v2', team)
                    self.learner[team].load_state_dict(source.state_dict(), strict=True)
        for team, model in self.initial.items():
            if model.full_config() == self.learner[team].full_config():
                self.learner[team].load_state_dict(model.state_dict())     # warm start (e.g. a distilled student)
            elif args.teacher_kl <= 0:
                print(f'WARNING: {team} learner starts from scratch (architecture differs from --init-{team}) '
                      'and --teacher-kl is 0, so the initial policy is only an evaluation benchmark.', flush=True)
        self.optimizer = {team: torch.optim.Adam(self.learner[team].parameters(), lr=args.lr, eps=1e-5) for team in TEAMS}
        self.pool = {team: [] for team in TEAMS}
        self.frozen = {}

    def configure(self, model):
        model.compile_policy = getattr(self.args, 'compile_policy', False)
        model.graph_leaves = getattr(self.args, 'cuda_graph_leaves', False)
        return model

    def load_frozen(self, path, team):
        return self.configure(load_general(path, self.device, self.feature_version, team))


def controller_names(controllers, units=None) -> dict:
    """The env's controller mapping of one slot. `units` (token indices): per-creature
    control, every team native and only the listed creatures external."""
    if units:
        return dict(heroes='native', monsters='native', external_units=[int(k) for k in units])
    return {team: 'native' if controllers[team][0] == 'native' else 'external' for team in TEAMS}


# --------------------------------------------------------------------------- PPO on BatchEnv

class GeneralTrainer(Trainer):
    def __init__(self, args, env=None):
        from ember_rl.distill import RewardConfig
        scores = needs_scores(args)
        self.env = env if env is not None else make_batch_env(args, scores)
        check_env(self.env, scores, getattr(args, 'feature_version', FEATURE_VERSION))
        self.feature_version = self.env.feature_version
        self.specs = spec_source(args, self.env)
        self.dev_specs, self.eval_specs, self.spec_reports = fixed_specs(args, self.specs)
        self.model_config = model_config(args, self.env)
        self.reward = RewardConfig.from_args(args)
        self.warmup = {team: dict(active=args.value_warmup_updates > 0, updates=0, ev=None, ended=None) for team in TEAMS}
        self.single = args.schedule == 'single-creature'
        self.best_single = {team: dict(score=-math.inf) for team in TEAMS}
        self.tokens = {}
        if self.single:
            # Every encounter a game can draw must say which creature is on which side.
            encounters = {spec.encounter for spec in self.dev_specs + self.eval_specs}
            encounters |= set(self.specs.train_encounters())
            for encounter in sorted(encounters):
                self.team_tokens(encounter)
        from ember_rl.search import parse_search
        self.search_config = parse_search(args.search)
        if self.search_config is not None and not hasattr(self.env, 'fork'):
            raise SystemExit('--search needs BatchEnv.fork (ember-rs 2989a56 or later)')
        self.lookahead, self._search_resume, self._search_logged = None, None, Counter()
        self.eval_only = getattr(args, 'eval_slots', 0)       # --eval-slots (see run)
        self.train_slots = args.slots
        # --search-start-decisions / --search-start-ev: a team searches only after its PPO-only warm-up.
        self.search_on = {team: False for team in TEAMS}
        self.last_ev = {}
        self._searched = False
        self.search_counts = Counter()      # learner decisions in training games, eval substeps
        self._search_counts_logged = Counter()
        # Per-cell (map family / party) episodes and learner transitions, and movement by roster size.
        self.strata_stats = defaultdict(lambda: dict(episodes=0, rounds=0, transitions={t: 0 for t in TEAMS},
                                                     **{f'heroes_{k}': 0 for k in OUTCOME_KINDS}))
        self.movement_stats = defaultdict(lambda: defaultdict(Counter))
        # Learner balance (--learner-balance; ember_rl/balance.py): the tables are always kept for the logs.
        from ember_rl.balance import LearnerBalance
        self.balance = LearnerBalance(self.specs, floor=getattr(args, 'balance_floor', .25),
                                      window=getattr(args, 'balance_window', 32), prior=getattr(args, 'balance_prior', 8.),
                                      fit_games=getattr(args, 'balance_fit_games', 4096),
                                      refresh=getattr(args, 'balance_refresh', 64))
        self.balance_stats = Counter()
        super().__init__(args)
        if self.search_config is not None:
            from dataclasses import replace
            from ember_rl.search import Lookahead
            # The search scores the training return: the move penalty is part of it.
            self.search_config = replace(self.search_config, move_penalty=getattr(args, 'move_penalty', 0.))
            self.lookahead = Lookahead(self.env, self.search_config, self.device, seed=args.seed + 7919,
                                       group_actions=getattr(args, 'group_search_actions', False), threads=args.env_threads,
                                       search_threads=getattr(args, 'search_threads', 1))
            if self._search_resume:
                self.lookahead.rng.bit_generator.state = self._search_resume['rng']
                self.lookahead.stats.update(self._search_resume['stats'])
                self._search_logged.update(self._search_resume['stats'])
        self.write_spec_files()

    def write_spec_files(self):
        """dev-specs.jsonl and eval-specs.jsonl (the exact lists, usable as --dev-specs / --eval-specs
        elsewhere) and specs-coverage.json (training probabilities by stratum and the coverage of both lists);
        a `sampling` row in metrics.jsonl."""
        write_specs(self.out / 'dev-specs.jsonl', self.dev_specs)
        write_specs(self.out / 'eval-specs.jsonl', self.eval_specs)
        report = dict(sampling=self.specs.report(), **self.spec_reports)
        (self.out / 'specs-coverage.json').write_text(json.dumps(report, indent=1) + '\n')
        self.log_row(dict(type='sampling', **report), 'SAMPLING')

    def make_policies(self):
        return GeneralPolicies(self.args, self.device, self.model_config, self.feature_version)

    # ---- single-creature schedule ----
    def team_tokens(self, encounter):
        """{team: [token index, ...]} of an encounter, from its catalog row (cached)."""
        if encounter not in self.tokens:
            row = self.specs.rows.get(encounter)
            if row is None:
                raise SystemExit(f'single-creature: encounter {encounter!r} is not in the catalog')
            try:
                self.tokens[encounter] = team_tokens(row)
            except ValueError as error:
                raise SystemExit(f'single-creature: {error}') from error
        return self.tokens[encounter]

    def takes_eval(self, gslot):
        if self.eval_only:
            return gslot >= self.train_slots and bool(self.eval_queue)
        return super().takes_eval(gslot)

    def new_episode(self, gslot):
        if not self.single or self.takes_eval(gslot):
            return super().new_episode(gslot)
        spec = self.specs.sample_train(self.rng)
        team = self.rng.choice(TEAMS)                                  # the side, 50/50
        k = self.rng.choice(self.team_tokens(spec.encounter)[team])    # then one of its creatures
        controllers = {team: ('learner', team), OTHER[team]: ('native',)}
        return controllers, dict(spec=spec, native=(OTHER[team],), units=(k,)), None

    def extra_eval_items(self, round_id, frozen):
        """Single-creature games vs the native AI: per team, eval spec j with a fixed creature
        (the encounter's n-th spec plays the side's n-th creature, cyclically)."""
        if not self.single:
            return []
        items = []
        for team in TEAMS:
            seen = Counter()
            for j in range(self.args.eval_single_episodes):
                spec = self.eval_specs[j % len(self.eval_specs)]
                tokens = self.team_tokens(spec.encounter)[team]
                k = tokens[seen[spec.encounter] % len(tokens)]
                seen[spec.encounter] += 1
                unit = encounter_units(self.specs.rows[spec.encounter])[k]
                item = dict(controllers={team: frozen[team], OTHER[team]: ('native',)}, native=(OTHER[team],),
                            round=round_id, name=f'{team}-single-vs-native', learner_team=team, spec=spec, units=(k,))
                if unit.get('content') is not None:
                    item['unit'] = unit['content']
                items.append(item)
        return items

    def update_best(self, round_id, summary):
        saved = super().update_best(round_id, summary)
        if not self.single:
            return saved
        from ember_rl.model import save_checkpoint
        for team in TEAMS:
            result = summary.get(f'{team}-single-vs-native')
            if result is None or result['mean_score'] <= self.best_single[team]['score']:
                continue
            self.best_single[team] = dict(score=result['mean_score'], excess=result.get('excess'), round=round_id,
                                          updates=self.updates[team], decisions=self.decisions[team])
            save_checkpoint(self.out / f'best-single-{team}.pt', self.policies.frozen[f'eval-{round_id}-{team}'],
                            extra={'feature_version': self.feature_version, 'team': team,
                                   'selected_by': 'mean score vs native AI, single-creature games',
                                   **self.best_single[team]})
            saved.append(f'single-{team}')
        return saved

    # ---- spec hooks (duel.Trainer) ----
    def eval_job(self, item):
        return dict(spec=item['spec'], native=item['native'], units=item.get('units'))

    @staticmethod
    def balance_key(controllers):
        """The learner-balance table of a game: its one learner team, or 'both' (self-play)."""
        learners = [t for t, c in controllers.items() if c[0] == 'learner']
        return learners[0] if len(learners) == 1 else 'both'

    def training_job(self, controllers):
        key = self.balance_key(controllers)
        weights = self.balance.weights(key) if getattr(self.args, 'learner_balance', False) else None
        spec = self.specs.sample_train(self.rng, weights)
        return dict(spec=spec, native=tuple(t for t, c in controllers.items() if c[0] == 'native'),
                    balance=(key, self.balance.p(key, spec.encounter)))

    def dev_episodes(self):
        return [dict(spec=spec) for spec in self.dev_specs]

    def playable(self, item):
        """Also: the game's encounter is in this run's catalog (a resume may change --catalog)."""
        spec = item.get('spec')
        return super().playable(item) and (spec is None or spec[0] in self.specs.meta)

    def eval_episode(self, k, native_bench):
        return dict(spec=self.eval_specs[k % len(self.eval_specs)])

    def breakdown(self, items, results):
        return breakdown(items, results, self.specs)

    def extra_state(self):
        state = dict(backend='ember', value_warmup=copy.deepcopy(self.warmup), best_single=copy.deepcopy(self.best_single),
                     last_ev=dict(self.last_ev), search_on=dict(self.search_on), balance=self.balance.state())
        if self.lookahead is not None:
            state['search'] = dict(config=self.search_config.to_text(), rng=self.lookahead.rng.bit_generator.state,
                                   stats=dict(self.lookahead.stats))
        return state

    def load_extra_state(self, payload):
        if payload.get('value_warmup'):
            self.warmup = copy.deepcopy(payload['value_warmup'])
        if payload.get('best_single'):
            self.best_single = copy.deepcopy(payload['best_single'])
        self.last_ev.update(payload.get('last_ev') or {})
        self.search_on.update(payload.get('search_on') or {})
        self.balance.load_state(payload.get('balance'))
        if payload.get('search') and self.search_config is not None:
            self._search_resume = copy.deepcopy(payload['search'])

    def extra_progress(self):
        """Per-cell training statistics, movement by roster size and (--search) the search's statistics,
        all since the last progress row."""
        out = dict(strata=self.strata_progress(), movement=self.movement_progress(), balance=self.balance_progress())
        if self.lookahead is None:
            return out
        now = Counter(self.lookahead.stats)
        delta = {k: v - self._search_logged.get(k, 0) for k, v in now.items()}
        self._search_logged = now
        counts = Counter(self.search_counts)
        cdelta = {k: v - self._search_counts_logged.get(k, 0) for k, v in counts.items()}
        self._search_counts_logged = counts
        row = {k: (round(v, 2) if isinstance(v, float) else v) for k, v in delta.items() if v}
        train = sum(cdelta.get(f'train_decisions_{t}', 0) for t in TEAMS)
        row.update(active=dict(self.search_on), train_decisions=train,
                   eval_substeps=cdelta.get('eval_substeps', 0),
                   eval_substep_decisions=cdelta.get('eval_substep_decisions', 0))
        if train:     # the share of learner decisions in training games that the search decided
            row['searched_fraction'] = round(delta.get('searched', 0) / train, 4)
        if delta.get('searched'):
            row['changed_fraction'] = round(delta.get('changed', 0) / delta['searched'], 4)
            row['rows_per_search'] = round((delta.get('forward_rows', 0) + delta.get('value_rows', 0)) / delta['searched'], 1)
            row['ms_per_search'] = round(1000 * delta.get('seconds', 0.) / delta['searched'], 2)
        if delta.get('value_err_n'):     # critic V + potential at the root vs the rollouts' prior-weighted Q
            row['value_mae'] = round(delta['value_err_abs'] / delta['value_err_n'], 4)
            row['value_rmse'] = round(math.sqrt(delta['value_err_sq'] / delta['value_err_n']), 4)
            row['value_bias'] = round(delta.get('value_err_sum', 0.) / delta['value_err_n'], 4)
        if delta.get('seconds'):         # model = forward passes incl. the GPU sync; env = fork/step/observe
            row['model_fraction'] = round(delta.get('model_seconds', 0.) / delta['seconds'], 4)
            row['env_fraction'] = round(delta.get('env_seconds', 0.) / delta['seconds'], 4)
        if delta.get('leaves'):
            row['mean_depth'] = round(delta['depth'] / delta['leaves'], 2)
        out['search'] = row
        return out

    def balance_progress(self):
        """Training games since the last row: the share of learner decisions in horizon games and on rows
        whose learner-balance estimate p was outside 20-80% when the game was drawn, the mean sampling
        weight; plus the table of the active learner (all rows, current estimates)."""
        b, self.balance_stats = self.balance_stats, Counter()
        n = b['decisions']
        key = self.active_team if self.args.schedule in ('alternating', 'gated') else 'both'
        return dict(sampling='learner' if getattr(self.args, 'learner_balance', False) else 'uniform',
                    games=b['games'], decisions=n,
                    horizon_share=round(b['horizon_decisions'] / n, 4) if n else None,
                    outside_20_80_share=round(b['outside_20_80_decisions'] / n, 4) if n else None,
                    mean_weight=round(b['weight_sum'] / b['games'], 4) if b['games'] else None,
                    table=self.balance.report(key))

    def strata_progress(self):
        if not self.strata_stats:
            return {}
        cells = {k: dict(v, transitions=dict(v['transitions'])) for k, v in sorted(self.strata_stats.items())}
        self.strata_stats.clear()
        return cells

    def movement_progress(self):
        """{roster 'HvM': {team: episodes, moves (squares walked), walks (move decisions), decisions, mean
        squares, walks, decisions and movement penalty per episode, mean outcome (+1/-1, or the score at the
        horizon or a truncation) and outcome counts}}."""
        penalty = getattr(self.args, 'move_penalty', 0.)
        out = {}
        for roster, teams in sorted(self.movement_stats.items()):
            out[roster] = {}
            for team, m in teams.items():
                n = m['episodes']
                out[roster][team] = dict(episodes=n, moves=m['moves'], walks=m['walks'], decisions=m['decisions'],
                                         mean_moves=round(m['moves'] / n, 2), mean_walks=round(m['walks'] / n, 2),
                                         mean_decisions=round(m['decisions'] / n, 2),
                                         mean_move_penalty=round(penalty * m['moves'] / n, 5),
                                         mean_outcome=round(m['outcome_sum'] / n, 4),
                                         **{k: m[k] for k in OUTCOME_KINDS if m[k]})
        self.movement_stats.clear()
        return out

    def ppo_updates(self, team):
        return self.updates[team] - self.warmup[team]['updates']

    def native_kl_coef(self, team):
        from ember_rl.distill import annealed
        args = self.args
        return annealed(args.native_kl, args.native_kl_final, args.native_kl_decay_updates, self.ppo_updates(team))

    # ---- main loop ----
    def run(self):
        args, env = self.args, self.env
        n = env.n_slots
        self.total_slots, self.slots_in_eval = n, 0
        self.slot_state = [None] * n
        self.infos = [None] * n
        # --eval-slots E: the last E slots hold only evaluation and development games, which then never
        # wait for a training game to finish; an eval slot without a game idles (done, never stepped).
        self.train_slots = n - self.eval_only
        idle = set(range(self.train_slots, n))
        for g in idle:
            self.infos[g] = dict(done=True)
        next_checkpoint = time.time() + args.checkpoint_minutes * 60
        last_log, log_decisions = time.time(), sum(self.decisions.values())
        deadline = run_deadline(self.started, args)
        if not args.resume:      # a resumed run keeps its evaluation cadence (pending rounds are restored)
            self.schedule_eval()
        to_reset, stalls = list(range(self.train_slots)), 0
        reason, previous_handler = 'crash', self.install_stop_signal()

        def release(slots):             # finished games: training slots restart, eval slots idle
            for g in slots:
                (idle.add(g) if g >= self.train_slots else to_reset.append(g))

        try:
            while not self.should_end(deadline):
                if to_reset:
                    again, to_reset[:] = self.reset_slots(to_reset), []
                    release(again)
                if idle and self.eval_queue:
                    take = sorted(idle)[:len(self.eval_queue)]
                    idle.difference_update(take)
                    release(self.reset_slots(take))
                live = [g for g in range(n) if not self.infos[g]['done']]
                if self.collection_paused():
                    # Only evaluation and development games move; training slots wait, unchanged.
                    live = [g for g in live if self.slot_state[g]['eval'] is not None] or live
                if live:
                    stalls = 0
                    self._searched = False
                    obs = env.observe(live)
                    rows = self.decide_batch(live, obs)
                    deciders = [self.infos[g]['team'] for g in live]
                    info = env.step(live, rows)
                    finished = []
                    for i, g in enumerate(live):
                        self.infos[g] = info_row(info, i)
                        if self.infos[g]['done']:
                            finished.append(g)
                    self.record_moves(live, obs, rows, deciders)
                    if finished:
                        self.finish_games(finished)
                        release(finished)
                    if self._searched and args.eval_substeps:
                        release(self.eval_substeps(args.eval_substeps))
                else:
                    stalls += 1
                    if stalls > 10_000:
                        raise RuntimeError('every reset ends before an external decision')
                for team in TEAMS:
                    if len(self.buffer[team]) >= args.rollout and not self.gate_paused(team):
                        self.update(team)
                        self.maybe_switch_phase()
                self.maybe_gate()
                if time.time() - last_log > args.log_seconds:
                    total = sum(self.decisions.values())
                    self.log_progress((total - log_decisions) / (time.time() - last_log))
                    last_log, log_decisions = time.time(), total
                if time.time() >= next_checkpoint:
                    self.save()
                    next_checkpoint = time.time() + args.checkpoint_minutes * 60
                if not self.eval_queue and not self.eval_rounds and \
                        sum(self.updates.values()) >= (self.eval_index * args.eval_every):
                    self.schedule_eval()
            reason = self.end_reason(deadline)
        except KeyboardInterrupt:       # SIGINT (a watcher's hang recovery): saved, but not a clean save
            reason = 'interrupt'
            raise
        finally:
            self.finish_run(reason, previous_handler)

    def eval_substeps(self, k):
        """--search: after a loop step that searched (one batched search takes seconds), step the
        evaluation and development games alone up to k more times. They never search and use frozen
        greedy policies, so this only changes their wall-clock pace (look2 finished 7 evaluation rounds
        in 19 h because they moved one decision per searched step). Returns the slots that finished."""
        done = []
        for _ in range(k):
            live = [g for g in range(self.env.n_slots)
                    if not self.infos[g]['done'] and self.slot_state[g]['eval'] is not None]
            if not live:
                break
            obs = self.env.observe(live)
            rows = self.decide_batch(live, obs)
            info = self.env.step(live, rows)
            finished = []
            for i, g in enumerate(live):
                self.infos[g] = info_row(info, i)
                if self.infos[g]['done']:
                    finished.append(g)
            self.search_counts['eval_substeps'] += 1
            self.search_counts['eval_substep_decisions'] += len(live)
            if finished:
                self.finish_games(finished)
                done.extend(finished)
        return done

    def collection_paused(self):
        """Gated schedule: while a learner candidate's development games run, PPO updates of the
        active team pause (`gate_paused`). Once its buffer holds a full rollout, training games
        stop stepping until the result is in, unless development games still wait for a slot
        that a finishing training game could free (evaluation slots below their share).
        The policy cannot change during the pause, so this only bounds the buffer (at Rust speed
        it otherwise grew by hundreds of thousands of transitions, about 25 KB each, per
        development round) and frees the loop for the development games."""
        team = self.active_team
        if not (self.gate_paused(team) and len(self.buffer[team]) >= self.args.rollout):
            return False
        if self.eval_only:              # development games wait for eval slots, never for training games
            return True
        waiting = bool(self.eval_queue) and self.eval_queue[0].get('dev')
        return not waiting or self.slots_in_eval >= self.args.eval_slot_fraction * self.total_slots

    def reset_slots(self, slots):
        """New episodes in `slots`; returns the slots that ended during reset (they need another)."""
        specs, controllers = [], []
        for g in slots:
            previous = self.slot_state[g]
            ctrl, job, item = self.new_episode(g)
            self.slot_state[g] = dict(controllers=ctrl, pending={}, eval=item, spec=job['spec'],
                                      episode=previous['episode'] + 1 if previous else 0, units=job.get('units'),
                                      moves=Counter(), walks=Counter(), decided=Counter(), balance=job.get('balance'))
            specs.append(job['spec'])
            controllers.append(controller_names(ctrl, job.get('units')))
        info = self.env.reset(slots, specs, controllers)
        listing = getattr(self.env, 'units', None)
        again = []
        for i, g in enumerate(slots):
            self.infos[g] = info_row(info, i)
            units = self.slot_state[g]['units']
            if units and listing is not None:
                self.check_single(g, units, listing(g))
            if self.infos[g]['done']:
                again.append(g)
        if again:
            self.finish_games(again)
        return again

    def check_single(self, g, units, listing):
        """The env placed the creature the trainer picked: right team, external, and (when the
        catalog did not name it) its content id for the per-kind breakdown."""
        state = self.slot_state[g]
        learner = next(t for t, c in state['controllers'].items() if c[0] != 'native')
        for k in units:
            uid, content, team, external = listing[k]
            if team != learner or not external:
                raise RuntimeError(f'slot {g}: creature {k} ({uid}) is {team}/external={external}, '
                                   f'expected an external {learner} creature')
            if state['eval'] is not None and 'unit' not in state['eval']:
                state['eval']['unit'] = content

    def decide_batch(self, live, obs):
        """One forward pass per controller key; records learner transitions; returns int32 rows."""
        from ember_rl.general_model import act_in_chunks, drop_ids, select, split_obs
        groups = defaultdict(list)
        for i, g in enumerate(live):
            key = self.slot_state[g]['controllers'][self.infos[g]['team']]
            if key[0] == 'native':
                raise RuntimeError('A native-controlled team surfaced a decision')
            groups[key].append(i)
        rows = np.zeros(len(live), np.int32)
        with self.torch.no_grad():
            for key, index in groups.items():
                sub = select(obs, index)
                learner = key[0] == 'learner'
                searched = (self.search_learner(key[1], live, index, sub)
                            if learner and self.lookahead is not None and self.search_active(key[1]) else {})
                if learner and self.args.p_id > 0:
                    sub['creature_ids'] = drop_ids(sub['creature_ids'], self.args.p_id, self.np_rng)
                model = self.policies.model_for(key)
                # Frozen keys drive development, evaluation and phase-opponent games: greedy.
                chosen, log_probs, values = act_in_chunks(model, sub, self.device, greedy=key[0] == 'frozen')
                for j, (i, choice, log_prob, value) in enumerate(zip(index, chosen.tolist(), log_probs.tolist(), values.tolist())):
                    g = live[i]
                    slot_state, info = self.slot_state[g], self.infos[g]
                    self.total_decisions += 1
                    if learner:
                        team = key[1]
                        if team in slot_state['pending']:
                            self.complete(g, slot_state, team, info, next_value=value)
                        pending = dict(obs=split_obs(sub, j), choice=choice, log_prob=log_prob,
                                       value=value, potential=info['potential'], round=info['round'])
                        result = searched.get(j)
                        if result is not None:          # --search: target, and in act mode the search's action
                            pending['target'] = result.target
                            if self.args.search_mode == 'act':
                                choice = pending['choice'] = result.row
                                pending['ppo'] = False
                        slot_state['pending'][team] = pending
                        self.decisions[team] += 1
                        if slot_state['eval'] is None:
                            self.search_counts[f'train_decisions_{team}'] += 1
                            slot_state['decided'][team] += 1
                    rows[i] = choice
        return rows

    def search_learner(self, team, live, index, sub):
        """--search: in a random --search-step-prob share of the loop steps, search a random --search-prob share
        of this team's learner decisions in training games (development and evaluation games never search). Returns {position in index: search Result} for the
        searched roots; roots the search skips (one row, a confident prior) are left to the policy."""
        from ember_rl.general_model import forward_in_chunks, select
        from ember_rl.search import Root
        la = self.lookahead
        if self.args.search_step_prob < 1 and la.rng.random() >= self.args.search_step_prob:
            return {}
        pick = [j for j, i in enumerate(index)
                if self.slot_state[live[i]]['eval'] is None and la.rng.random() < self.args.search_prob]
        if not pick:
            return {}
        part = select(sub, pick)
        started = time.time()
        logits, values = forward_in_chunks(self.policies.learner[team], part, self.device)
        logits, values = logits.float().cpu().numpy(), values.float().cpu().numpy()
        la.stats['root_model_seconds'] += time.time() - started
        legal = part['cand_mask'].sum(1)
        roots = []
        for p, j in enumerate(pick):
            g = live[index[j]]
            info = self.infos[g]
            models = {t: None if c[0] == 'native' else self.policies.model_for(c)
                      for t, c in self.slot_state[g]['controllers'].items()}
            controllers = None
            if self.args.search_opponent == 'native' and not self.slot_state[g].get('units'):
                # Forks hand the other team to the native AI (Fable, l3-open idea 7 / M8): its decisions no
                # longer surface in the rollouts, about a third of the network rows.
                controllers = {team: 'external', OTHER[team]: 'native'}
                models[OTHER[team]] = None
            roots.append(Root(slot=g, team=team, logits=logits[p, :legal[p]], value=float(values[p]),
                              round=info['round'], actor=info['actor'], potential=info['potential'], models=models,
                              controllers=controllers, kinds=part['cand_ids'][p, :legal[p], 0]))
        results = la.search(self.env, roots, explore=True)
        self._searched = True
        return {j: r for j, r in zip(pick, results) if r.searched}

    def search_active(self, team):
        """--search for `team`: on once its PPO-only warm-up is over (--search-start-decisions learner
        decisions and, with --search-start-ev, the explained variance of its last update), then for good.
        A `search_on` row records the moment."""
        if self.search_on[team]:
            return True
        args = self.args
        if self.decisions[team] < args.search_start_decisions:
            return False
        if args.search_start_ev is not None:
            ev = self.last_ev.get(team)
            if ev is None or not ev >= args.search_start_ev:
                return False
        self.search_on[team] = True
        self.log_row(dict(type='search_on', team=team, decisions=dict(self.decisions), updates=dict(self.updates),
                          explained_variance=self.last_ev.get(team), elapsed=round(self.elapsed(), 1)), 'SEARCH_ON')
        return True

    def finish_games(self, slots):
        from ember_rl.general_model import to_batch
        need = defaultdict(list)
        for g in slots:
            info = self.infos[g]
            if info['truncated'] and not info['terminated']:
                for team in self.slot_state[g]['pending']:
                    need[team].append(g)
        values = {}
        with self.torch.no_grad():
            for team, group in need.items():
                # Safety truncation: bootstrap from this team's view of the final state.
                final = self.env.observe(group, team=np.full(len(group), TEAM_CODE[team], np.int8))
                for g, value in zip(group, self.policies.learner[team].value(to_batch(final, self.device)).tolist()):
                    values[(g, team)] = value
        for g in slots:
            slot_state, info = self.slot_state[g], self.infos[g]
            for team in list(slot_state['pending']):
                self.complete(g, slot_state, team, info, next_value=values.get((g, team), 0.), terminal=True)
            if slot_state['eval'] is not None:
                if slot_state['eval'].get('dev'):
                    self.finish_dev(slot_state['eval'], info)
                else:
                    self.finish_eval(slot_state['eval'], info)
                self.slots_in_eval -= 1
            elif not info['reset_terminal']:
                learner = next((t for t, c in slot_state['controllers'].items() if c[0] == 'learner'), None)
                self.record_episode(slot_state['controllers'], info,
                                    kind=f'single-{learner}' if slot_state.get('units') else None)
                self.record_opponent(slot_state['controllers'], info)
                self.record_strata(slot_state, info)

    def complete(self, g, slot_state, team, info, next_value, terminal=False):
        from ember_rl.rewards import team_reward
        pending = slot_state['pending'].pop(team)
        truncated = bool(info['truncated'] and not info['terminated']) if terminal else False
        discount, step_cost = self.time_terms(pending['round'], info['round'], team)
        step_cost -= self.move_penalty(pending)
        ended = bool(terminal and info['terminated'])
        reward = team_reward(team, discount, pending['potential'], info['potential'], ended,
                             info['winner'] if terminal else None, step_cost=step_cost,
                             horizon_score=info['score'] if ended and info.get('task_end') == 'health' else None)
        transition = dict(obs=pending['obs'], choice=pending['choice'], log_prob=pending['log_prob'],
                          value=pending['value'], reward=reward,
                          next_value=0. if (terminal and not truncated) else next_value,
                          terminated=ended, truncated=truncated, discount=discount,
                          lam=self.trace_lambda(pending['round'], info['round']))
        if 'target' in pending:     # --search
            transition.update(target=pending['target'], ppo=pending.get('ppo', True))
        if self.args.schedule in ('alternating', 'gated') and team != self.active_team:
            return  # leftover games from the previous phase; this team is frozen now
        key = (g, team, slot_state['episode'])
        self.streams[key].append(transition)
        self.buffer[team].append((key, len(self.streams[key]) - 1))
        self.strata_stats[self.specs.stratum(slot_state['spec'][0])]['transitions'][team] += 1

    def record_strata(self, slot_state, info):
        """A finished training game: its cell's episode and outcome counts (heroes' view), and per roster
        size each learner side's moves, movement penalty and outcome."""
        encounter = slot_state['spec'][0]
        stats = self.strata_stats[self.specs.stratum(encounter)]
        stats['episodes'] += 1
        stats['rounds'] += info['round']
        stats[f'heroes_{self.eval_outcome("heroes", info)[0]}'] += 1
        # Learner balance: the row's hero result, and the health of the training mix in decisions.
        from ember_rl.balance import hero_result
        key = self.balance_key(slot_state['controllers'])
        self.balance.observe(key, encounter, hero_result(info))
        decided = sum(slot_state['decided'].values())
        b = self.balance_stats
        b['games'] += 1
        b['decisions'] += decided
        if info['terminated'] and info.get('task_end') == 'health':
            b['horizon_decisions'] += decided
        if slot_state.get('balance') is not None:
            p = slot_state['balance'][1]
            if p < .2 or p > .8:
                b['outside_20_80_decisions'] += decided
            b['weight_sum'] += self.balance.weight_of(p)
        roster = self.specs.meta.get(encounter, {}).get('roster', '?')
        for team, controller in slot_state['controllers'].items():
            if controller[0] != 'learner':
                continue
            outcome, score = self.eval_outcome(team, info)
            m = self.movement_stats[roster][team]
            m['episodes'] += 1
            m['moves'] += slot_state['moves'][team]
            m['walks'] += slot_state.get('walks', Counter())[team]
            m['decisions'] += slot_state['decided'][team]
            m['outcome_sum'] += score
            m[outcome] += 1

    def record_moves(self, live, obs, rows, deciders):
        """After a step: the squares each learner decision of a training game walked (info['moved'];
        an environment without it walked one square per MOVE_KIND row), kept on the pending decision for
        its move penalty and counted per game (squares and walks)."""
        rows = np.asarray(rows)
        kinds = obs['cand_ids'][np.arange(len(live)), rows, 0]
        for i, g in enumerate(live):
            slot_state, team = self.slot_state[g], deciders[i]
            if slot_state['eval'] is not None or team is None or slot_state['controllers'][team][0] != 'learner':
                continue
            moved = self.infos[g]['moved']
            if moved is None:
                moved = int(kinds[i] == MOVE_KIND)
            pending = slot_state['pending'].get(team)
            if pending is not None:
                pending['moved'] = moved
            slot_state['moves'][team] += moved
            slot_state['walks'][team] += moved > 0

    def move_penalty(self, pending):
        """--move-penalty: subtracted from the reward of a decision once per square it walked (a one-square
        move row: 1; --moves dest: the squares of the walk, info['moved']). Movement is otherwise free under
        the outcome objective, so value-neutral steps are not discouraged and trained creatures walk back
        and forth."""
        penalty = getattr(self.args, 'move_penalty', 0.)
        if not penalty:
            return 0.
        moved = pending.get('moved')
        if moved is None:               # not stepped through record_moves (cannot happen in a training game)
            moved = int(int(pending['obs']['cand_ids'][pending['choice'], 0]) == MOVE_KIND)
        return penalty * moved

    def value_of(self, team, *_):
        raise NotImplementedError('the ember backend bootstraps through finish_games')

    # ---- PPO ----
    def update(self, team):
        """PPO on the team's buffer. The micro-batch loop never waits for the GPU: inputs
        replay observations the model already checked when acting, copies go through pinned
        memory, and the legality, finiteness and metric reads happen once per minibatch,
        before the optimizer step. The arithmetic is unchanged."""
        torch, args = self.torch, self.args
        from torch.distributions import Categorical
        from ember_rl.distill import distill_loss, explained_variance, soft_target, teacher_kl
        from ember_rl.general_model import collate, finite
        from ember_rl.model import clipped_ppo_loss, compute_gae, compute_gae_streams
        started = time.time()
        if self.device.type == 'cuda':
            torch.cuda.reset_peak_memory_stats(self.device)
        model, optimizer = self.policies.learner[team], self.policies.optimizer[team]
        entries, self.buffer[team] = self.buffer[team], []
        by_stream = defaultdict(list)
        for key, index in entries:
            by_stream[key].append(index)
        samples, lengths, advantages, returns = [], [], [], []
        batched = args.time_unit == 'round' and args.lambda_unit == 'round'
        for key, indices in by_stream.items():
            stream = self.streams[key]
            items = [stream[i] for i in indices]
            if not batched:
                tensor = lambda name, dtype=torch.float32: torch.tensor([t[name] for t in items], dtype=dtype)
                adv, ret = compute_gae(tensor('reward'), tensor('value'), tensor('next_value'),
                                       tensor('terminated', torch.bool), tensor('truncated', torch.bool),
                                       gamma=args.gamma, lam=args.gae_lambda,
                                       discounts=None if args.time_unit == 'decision' else tensor('discount'),
                                       lambdas=tensor('lam') if args.lambda_unit == 'round' else None)
                advantages.append(adv)
                returns.append(ret)
            samples.extend(items)
            lengths.append(len(items))
            if items[-1]['terminated'] or items[-1]['truncated']:
                del self.streams[key]
            else:
                self.streams[key] = []
        if batched:   # every stream at once; bit-identical to compute_gae per stream
            column = lambda name, dtype=np.float32: np.array([t[name] for t in samples], dtype)
            adv, ret = compute_gae_streams(column('reward'), column('value'), column('next_value'),
                                           column('terminated', np.bool_), column('truncated', np.bool_),
                                           column('discount'), column('lam'), lengths)
            advantages, returns = torch.from_numpy(adv), torch.from_numpy(ret)
        else:
            advantages, returns = torch.cat(advantages), torch.cat(returns)
        ev = explained_variance(torch.tensor([t['value'] for t in samples], dtype=torch.float32), returns)
        advantages = (advantages - advantages.mean()) / (advantages.std(unbiased=False) + 1e-8)
        choices = torch.tensor([t['choice'] for t in samples], dtype=torch.long)
        old_log_probs = torch.tensor([t['log_prob'] for t in samples], dtype=torch.float32)
        warm = self.warmup[team]['active']
        coef = 0. if warm else self.teacher_coef(team)
        teacher = self.policies.initial.get(team) if coef > 0 else None
        native_coef = 0. if warm else self.native_kl_coef(team)
        # The search loss only once the batch holds search targets (plain PPO during the warm-up).
        search = self.lookahead is not None and not warm and any(t.get('target') is not None for t in samples)
        metrics = []
        model.train()
        micro = args.micro_batch or args.minibatch
        device = self.device
        pin = device.type == 'cuda'
        on_device = {name: tensor.to(device) for name, tensor in
                     (('returns', returns), ('advantages', advantages), ('choices', choices), ('old', old_log_probs))}
        if search:
            on_device['ppo'] = torch.tensor([t.get('ppo', True) for t in samples], dtype=torch.bool).to(device)
        for _ in range(args.epochs):
            permutation = self.np_rng.permutation(len(samples))
            kls = []
            for start in range(0, len(samples), args.minibatch):
                idx = sorted(permutation[start:start + args.minibatch], key=lambda i: samples[i]['obs']['cand_mask'].shape[0])
                if search:   # PPO rows and search-target rows of the minibatch: the terms are means over them
                    counts = (sum(samples[i].get('ppo', True) for i in idx),
                              sum(samples[i].get('target') is not None for i in idx))
                optimizer.zero_grad(set_to_none=True)
                parts, legal, finite_flags, metric_flags = [], [], [], []
                for offset in range(0, len(idx), micro):
                    chunk = idx[offset:offset + micro]
                    batch, native = collate([samples[i]['obs'] for i in chunk], device, native=True, pin=pin)
                    tidx = torch.as_tensor(np.asarray(chunk, dtype=np.int64))
                    tidx = (tidx.pin_memory() if pin else tidx).to(device, non_blocking=True)
                    target = on_device['returns'][tidx]
                    if warm:
                        values = model.value(batch, detach_trunk=True, check=False)
                        value_loss = .5 * (values - target).square().mean()
                        loss = args.value_coef * value_loss
                        detail = dict(loss=loss.detach(), value_loss=value_loss.detach())
                    else:
                        chosen = on_device['choices'][tidx]
                        legal.append(batch['cand_mask'].gather(1, chosen[:, None]).all())
                        logits, values = model(batch, check=False)
                        distribution = Categorical(logits=logits, validate_args=False)
                        log_prob, entropy = distribution.log_prob(chosen), distribution.entropy()
                        finite_flags.append(finite(logits, values, batch['cand_mask'])
                                            & torch.isfinite(log_prob).all() & torch.isfinite(entropy).all())
                        if search:
                            loss, detail = search_ppo_loss(
                                log_prob, on_device['old'][tidx], on_device['advantages'][tidx], values, target, entropy,
                                logits, batch['cand_mask'], on_device['ppo'][tidx],
                                search_targets([samples[i] for i in chunk], batch['cand_mask'].shape[1], device, pin),
                                weight=len(chunk) / len(idx), n_ppo=counts[0], n_target=counts[1], clip=args.clip,
                                vf=args.value_coef, ent=args.entropy_coef, coef=args.search_coef)
                        else:
                            loss, detail = clipped_ppo_loss(log_prob, on_device['old'][tidx], on_device['advantages'][tidx],
                                                            values, target, entropy, clip=args.clip, vf=args.value_coef,
                                                            ent=args.entropy_coef, validate=False)
                        metric_flags.append(torch.isfinite(torch.stack(list(detail.values()))).all())
                        if teacher is not None:
                            prior = teacher_kl(teacher, logits, batch)
                            loss = loss + coef * prior
                            detail['teacher_kl'] = prior.detach()
                        if native_coef > 0:
                            q = soft_target(native['native_raw'], native['native_dropped'], native['native_choice'],
                                            batch['cand_mask'], native['is_move'], t_move=args.t_move,
                                            t_act=args.t_act, alpha=args.alpha)
                            ce = distill_loss(logits, q, batch['cand_mask'])
                            loss = loss + native_coef * ce
                            detail['native_ce'] = ce.detach()
                    weight = len(chunk) / len(idx)
                    (loss * weight).backward()
                    parts.append((weight, detail))
                # One host sync per minibatch, before the optimizer step.
                if legal and not bool(torch.stack(legal).all()):
                    raise ValueError('PPO sample refers to an illegal candidate')
                if finite_flags and not bool(torch.stack(finite_flags).all()):
                    raise FloatingPointError('non-finite logits, values, log-probabilities or entropies')
                if metric_flags and not bool(torch.stack(metric_flags).all()):
                    raise ValueError('PPO loss metrics must contain only finite values')
                keys = list(parts[0][1])
                read = torch.stack([torch.stack([d[k] for k in keys]) for _, d in parts]).tolist()
                parts = [(w, dict(zip(keys, row))) for (w, _), row in zip(parts, read)]
                params = model.value_parameters() if warm else list(model.parameters())
                norm = torch.nn.utils.clip_grad_norm_(params, args.max_grad_norm)
                optimizer.step()
                entry = {k: sum(w * d[k] for w, d in parts) for k in parts[0][1]}
                entry['grad_norm'] = float(norm)
                metrics.append(entry)
                if not warm:
                    kls.append(entry['approx_kl'])
            if kls and np.mean(kls) > args.target_kl:
                break
        model.eval()
        self.updates[team] += 1
        self.last_ev[team] = ev if math.isfinite(ev) else None
        phase = 'value_warmup' if warm else 'ppo'
        if warm:
            w = self.warmup[team]
            w['updates'] += 1
            previous, w['ev'] = w['ev'], ev
            settled = (previous is not None and math.isfinite(ev) and math.isfinite(previous)
                       and abs(ev - previous) < args.value_warmup_ev_tol and w['updates'] >= args.value_warmup_min)
            if settled or w['updates'] >= args.value_warmup_updates:
                w['active'], w['ended'] = False, 'explained_variance_settled' if settled else 'max_updates'
        if self.updates[team] % args.snapshot_every == 0:
            self.policies.snapshot(team, f'{team}-u{self.updates[team]}')
        row = dict(type='update', team=team, update=self.updates[team], phase=phase, samples=len(samples),
                   decisions=dict(self.decisions), elapsed=round(self.elapsed(), 1), optimizer_steps=len(metrics),
                   **{k: round(float(np.mean([m[k] for m in metrics])), 5) for k in metrics[0]},
                   explained_variance=round(ev, 5) if math.isfinite(ev) else None,
                   teacher_coef=round(coef, 5), native_kl_coef=round(native_coef, 5),
                   **(dict(search_coef=args.search_coef, search_mode=args.search_mode, search_active=self.search_on[team],
                           searched_samples=sum(t.get('target') is not None for t in samples),
                           ppo_samples=sum(t.get('ppo', True) for t in samples)) if self.lookahead is not None else {}),
                   update_seconds=round(time.time() - started, 2),
                   peak_gpu_mb=(round(torch.cuda.max_memory_allocated(self.device) / 2**20)
                                if self.device.type == 'cuda' else None),
                   mean_reward=round(float(np.mean([t['reward'] for t in samples])), 5),
                   mean_return=round(float(returns.mean()), 5))
        if warm and not self.warmup[team]['active']:
            row['value_warmup_ended'] = self.warmup[team]['ended']
        with (self.out / 'metrics.jsonl').open('a') as stream:
            stream.write(json.dumps(row) + '\n')


def search_targets(samples, k, device, pin):
    """[B, K] search policy targets of a chunk (zero rows for samples without one)."""
    import torch
    from ember_rl.general_model import _device
    q = np.zeros((len(samples), k), np.float32)
    for row, sample in enumerate(samples):
        target = sample.get('target')
        if target is not None:
            q[row, :len(target)] = target
    return _device(q, device, pin)


def search_ppo_loss(newlog, oldlog, advantages, values, returns, entropy, logits, mask, ppo, q, *, weight, n_ppo,
                    n_target, clip, vf, ent, coef):
    """--search: the clipped PPO loss on the policy's own samples (`ppo` rows) plus coef * CE(q, pi) on the
    rows with a search target, for one micro-batch of a minibatch.

    The policy and cross-entropy terms are means over the minibatch's PPO rows (n_ppo) and target rows
    (n_target); the value and entropy terms are means over every row, as in clipped_ppo_loss. The trainer
    multiplies the returned loss by `weight` (the micro-batch's share of the minibatch), so the sum over
    micro-batches is exactly those means. Rows outside `ppo` (searched decisions in act mode, whose action
    the policy did not sample) get ratio 1 and no policy gradient. Metrics: policy_loss, approx_kl and
    clip_fraction over the micro-batch's PPO rows, search_ce over its target rows, and the two fractions."""
    import torch
    from ember_rl.distill import masked_log_softmax
    m = ppo.to(values.dtype)
    log_ratio = torch.where(ppo, newlog - oldlog.detach(), torch.zeros_like(newlog))
    ratio = log_ratio.exp()
    targets = advantages.detach()
    surrogate = -torch.minimum(ratio * targets, ratio.clamp(1 - clip, 1 + clip) * targets)
    policy_sum = (surrogate * m).sum()
    value_loss = .5 * (values - returns.detach()).square().mean()
    mean_entropy = entropy.mean()
    has = q.sum(-1) > .5
    ce = -(q * masked_log_softmax(logits, mask)).sum(-1)
    ce_sum = (ce * has).sum()
    total = (weight * (vf * value_loss - ent * mean_entropy) + policy_sum / max(1, n_ppo)
             + coef * ce_sum / max(1, n_target))
    rows = m.sum().clamp(min=1)
    metrics = {
        'loss': (total / weight).detach(),
        'policy_loss': (policy_sum / rows).detach(),
        'value_loss': value_loss.detach(),
        'entropy': mean_entropy.detach(),
        'approx_kl': ((((ratio - 1) - log_ratio) * m).sum() / rows).detach(),
        'clip_fraction': ((((ratio - 1).abs() > clip).to(values.dtype) * m).sum() / rows).detach(),
        'search_ce': (ce_sum / has.sum().clamp(min=1)).detach(),
        'ppo_fraction': m.mean().detach(),
        'target_fraction': has.to(values.dtype).mean().detach(),
    }
    return total / weight, metrics


# --------------------------------------------------------------------------- distillation

class _Ring:
    """Fixed-capacity replay of samples with O(1) random access."""

    def __init__(self, capacity):
        self.capacity, self.items, self.next = int(capacity), [], 0

    def __len__(self):
        return len(self.items)

    def append(self, item):
        if len(self.items) < self.capacity:
            self.items.append(item)
        else:
            self.items[self.next] = item
            self.next = (self.next + 1) % self.capacity

    def sample(self, rng, n):
        return [self.items[i] for i in rng.integers(0, len(self.items), size=n)]


MATCHUPS = (('native', 'native'), ('greedy', 'native'), ('native', 'greedy'), ('greedy', 'greedy'),
            ('sampled', 'sampled'))


class DistillTrainer:
    """--mode distill: GENERAL_ENV.md §6.3 steps 1-3 and the §6.4 validation."""

    def __init__(self, args, env=None):
        import torch
        from ember_rl.distill import RewardConfig
        from ember_rl.general_model import build_general
        self.args, self.torch = args, torch
        self.device = torch.device(args.device)
        torch.manual_seed(args.seed)
        self.rng = random.Random(args.seed)
        self.np_rng = np.random.default_rng(args.seed)
        needs_scores(args)                # distillation always needs native scores (--env-scores off exits)
        self.env = env if env is not None else make_batch_env(args, True)
        check_env(self.env, True, getattr(args, 'feature_version', FEATURE_VERSION))
        self.feature_version = self.env.feature_version
        self.specs = spec_source(args, self.env)
        _, self.eval_specs, _ = fixed_specs(args, self.specs)
        self.config = model_config(args, self.env)
        self.reward = RewardConfig.from_args(args)
        self.students = {team: build_general(self.config).to(self.device) for team in TEAMS}
        for team, path in (('heroes', args.init_heroes), ('monsters', args.init_monsters)):
            if path:
                version = self.feature_version
                if getattr(args, 'transfer_v2_weights', False):
                    if version != 'ember-gen-v3':
                        raise ValueError('--transfer-v2-weights requires --feature-version ember-gen-v3')
                    version = 'ember-gen-v2'
                self.students[team].load_state_dict(load_general(path, 'cpu', version, team).state_dict())
        for model in self.students.values():
            model.eval()
        self.optimizers = {team: torch.optim.Adam(self.students[team].parameters(), lr=args.lr, eps=1e-5) for team in TEAMS}
        self.buffer = {team: _Ring(args.distill_buffer) for team in TEAMS}
        self.decisions, self.steps = 0, {team: 0 for team in TEAMS}
        self.team_decisions = {team: 0 for team in TEAMS}
        self.out = Path(args.output)
        self.out.mkdir(parents=True, exist_ok=True)
        self.started, self.elapsed_before = time.time(), 0.
        self.validations = 0
        if args.resume:
            self.load(args.resume)

    def elapsed(self):
        return self.elapsed_before + time.time() - self.started

    def log(self, row):
        row = dict(row, decisions=self.decisions, elapsed=round(self.elapsed(), 1))
        with (self.out / 'distill.jsonl').open('a') as stream:
            stream.write(json.dumps(row) + '\n')
        print(row['type'].upper(), json.dumps(row), flush=True)

    # ---- play ----
    def _reset(self, slots, state, controllers=None, specs=None):
        specs = specs or [self.specs.sample_train(self.rng) for _ in slots]
        controllers = controllers or [{t: 'external' for t in TEAMS}] * len(slots)
        info = self.env.reset(slots, specs, controllers)
        for i, g in enumerate(slots):
            state[g] = dict(info=info_row(info, i), decisions=[], pure=True, spec=specs[i])
        return [g for g in slots if state[g]['info']['done']]

    def _student_rows(self, obs, index_by_team, greedy=False, p_id=0.):
        """Student choices for the given rows of obs, per team."""
        from ember_rl.general_model import act_in_chunks, drop_ids, select, to_batch
        rows = {}
        with self.torch.no_grad():
            for team, index in index_by_team.items():
                if not index:
                    continue
                sub = select(obs, index)
                if p_id > 0:
                    sub['creature_ids'] = drop_ids(sub['creature_ids'], p_id, self.np_rng)
                chosen, _, _ = act_in_chunks(self.students[team], sub, self.device, greedy=greedy)
                rows.update(zip(index, chosen.tolist()))
        return rows

    def run(self):
        from ember_rl.distill import beta_at, episode_returns, mix_rows
        from ember_rl.general_model import split_obs
        args, env = self.args, self.env
        n = env.n_slots
        target = args.tf_decisions + args.dagger_decisions
        deadline = run_deadline(self.started, args)
        state = [None] * n
        pending = self._reset(list(range(n)), state)
        since_train, next_eval = 0, args.distill_eval_every or None
        next_checkpoint = time.time() + args.checkpoint_minutes * 60
        last_log, log_decisions = time.time(), self.decisions
        while self.decisions < target and time.time() < deadline:
            if pending:
                pending = self._reset(pending, state)
            live = [g for g in range(n) if not state[g]['info']['done']]
            if not live:
                continue
            obs = env.observe(live)
            native = np.asarray(obs['native_choice'], np.int32)
            beta = beta_at(self.decisions, args.tf_decisions, args.dagger_decisions, args.beta_final)
            if beta >= 1:
                rows = native.copy()
            else:
                by_team = defaultdict(list)
                for i, g in enumerate(live):
                    by_team[state[g]['info']['team']].append(i)
                student = self._student_rows(obs, by_team, greedy=False, p_id=args.p_id)
                rows, _ = mix_rows(np.array([student[i] for i in range(len(live))], np.int32), native, beta, self.np_rng)
            for i, g in enumerate(live):
                info = state[g]['info']
                sample = split_obs(obs, i)
                sample['target'] = np.nan
                self.buffer[info['team']].append(sample)
                self.team_decisions[info['team']] += 1
                state[g]['decisions'].append(dict(team=info['team'], round=info['round'], potential=info['potential'],
                                                  sample=sample))
                if rows[i] != native[i]:
                    state[g]['pure'] = False
            info = env.step(live, rows)
            self.decisions += len(live)
            since_train += len(live)
            for i, g in enumerate(live):
                row = info_row(info, i)
                state[g]['info'] = row
                if row['done']:
                    if state[g]['pure']:   # a native-vs-native game: Monte Carlo value targets
                        for decision, value in zip(state[g]['decisions'], episode_returns(state[g]['decisions'], row, self.reward)):
                            if value is not None:
                                decision['sample']['target'] = value
                    pending.append(g)
            if since_train >= args.distill_every:
                self.train_round(beta)
                since_train = 0
            if next_eval is not None and self.decisions >= next_eval:
                self.validate()           # uses every slot: the games in flight are abandoned
                next_eval += args.distill_eval_every
                pending = self._reset(list(range(n)), state)
            if time.time() - last_log > args.log_seconds:
                self.log(dict(type='progress', beta=round(beta, 4),
                              decisions_per_s=round((self.decisions - log_decisions) / (time.time() - last_log), 1),
                              team_decisions=dict(self.team_decisions), buffer={t: len(b) for t, b in self.buffer.items()}))
                last_log, log_decisions = time.time(), self.decisions
            if time.time() >= next_checkpoint:
                self.save()
                next_checkpoint = time.time() + args.checkpoint_minutes * 60
        if args.critic_states > 0:
            self.critic_stage()
        result = self.validate()
        self.save()
        return result

    # ---- training ----
    def distill_step(self, team, samples):
        """One optimizer step on CE(q, pi) + critic_coef * value regression (NaN targets skipped)."""
        torch, args = self.torch, self.args
        from ember_rl.distill import distill_loss, soft_target, value_loss
        from ember_rl.general_model import collate, drop_ids
        model, optimizer = self.students[team], self.optimizers[team]
        model.train()
        optimizer.zero_grad(set_to_none=True)
        samples = sorted(samples, key=lambda s: s['cand_mask'].shape[0])
        micro = args.micro_batch or len(samples)
        totals = defaultdict(float)
        for offset in range(0, len(samples), micro):
            chunk = samples[offset:offset + micro]
            if args.p_id > 0:
                chunk = [dict(s, creature_ids=drop_ids(s['creature_ids'], args.p_id, self.np_rng)) for s in chunk]
            batch, native = collate(chunk, self.device, native=True)
            logits, values = model(batch)
            q = soft_target(native['native_raw'], native['native_dropped'], native['native_choice'], batch['cand_mask'],
                            native['is_move'], t_move=args.t_move, t_act=args.t_act, alpha=args.alpha)
            ce = distill_loss(logits, q, batch['cand_mask'])
            targets = torch.tensor([s['target'] for s in chunk], dtype=torch.float32, device=self.device)
            vl = value_loss(values, targets)
            loss = ce + args.critic_coef * vl
            weight = len(chunk) / len(samples)
            (loss * weight).backward()
            agree = (logits.argmax(-1) == native['native_choice']).float().mean()
            for name, value in (('ce', ce), ('value_loss', vl), ('top1', agree)):
                totals[name] += weight * float(value.detach())
            totals['value_targets'] += float(torch.isfinite(targets).sum())
        torch.nn.utils.clip_grad_norm_(model.parameters(), args.max_grad_norm)
        optimizer.step()
        model.eval()
        self.steps[team] += 1
        return dict(totals)

    def train_round(self, beta):
        rows = {}
        for team in TEAMS:
            buffer = self.buffer[team]
            if not len(buffer):
                continue
            parts = [self.distill_step(team, buffer.sample(self.np_rng, min(self.args.distill_batch, len(buffer))))
                     for _ in range(self.args.distill_steps)]
            rows[team] = {k: round(float(np.mean([p[k] for p in parts])), 5) for k in parts[0]}
        if rows:
            self.log(dict(type='distill', beta=round(beta, 4), steps=dict(self.steps), teams=rows,
                          buffer={t: len(b) for t, b in self.buffer.items()}))

    def critic_stage(self):
        """§6.3 step 3: K-rollout V_native targets on states sampled across the catalog and the fight."""
        from ember_rl.distill import k_rollout_returns
        from ember_rl.general_model import split_obs
        args, env = self.args, self.env
        n = env.n_slots
        state = [None] * n
        roots = []
        pending = self._reset(list(range(n)), state)
        while len(roots) < args.critic_states:
            if pending:
                pending = self._reset(pending, state)
            live = [g for g in range(n) if not state[g]['info']['done']]
            if not live:
                continue
            obs = env.observe(live)
            for i, g in enumerate(live):
                if len(roots) < args.critic_states and self.np_rng.random() < args.critic_sample_prob:
                    sample = split_obs(obs, i)
                    roots.append((env.snapshot(g), state[g]['info']['team'], sample))
            info = env.step(live, np.asarray(obs['native_choice'], np.int32))
            for i, g in enumerate(live):
                state[g]['info'] = info_row(info, i)
                if state[g]['info']['done']:
                    pending.append(g)
        targets = k_rollout_returns(env, [(snap, team) for snap, team, _ in roots], args.critic_k, list(range(n)),
                                    self.reward, self.np_rng)
        by_team = defaultdict(list)
        for (_, team, sample), value in zip(roots, targets):
            sample['target'] = float(value)
            by_team[team].append(sample)
        rows = {}
        for team, samples in by_team.items():
            ring = _Ring(len(samples))
            for sample in samples:
                ring.append(sample)
            parts = [self.distill_step(team, ring.sample(self.np_rng, min(args.distill_batch, len(ring))))
                     for _ in range(args.critic_steps)]
            rows[team] = dict(roots=len(samples), first=parts[0], last=parts[-1],
                              target_mean=round(float(np.nanmean([s['target'] for s in samples])), 4))
        self.log(dict(type='critic', k=args.critic_k, teams=rows))

    # ---- validation (§6.4) ----
    def validate(self, specs=None, matchups=MATCHUPS):
        """Paired matchups on the evaluation specs: decision agreement and outcome rates."""
        from ember_rl.distill import distill_metrics, soft_target
        from ember_rl.general_model import collate, split_obs
        args, env = self.args, self.env
        specs = specs or self.eval_specs
        jobs = deque((m, spec) for m in matchups for spec in specs)
        n = env.n_slots
        state = [None] * n
        outcomes = defaultdict(list)            # matchup -> [(item, (outcome, score), rounds)]
        kinds = defaultdict(Counter)            # (matchup, team) -> executed action kinds
        agreement = defaultdict(list)           # (matchup, team) -> distill_metrics rows
        free = list(range(n))
        while jobs or any(s is not None for s in state):
            starting = []
            while jobs and free:
                g = free.pop()
                matchup, spec = jobs.popleft()
                state[g] = dict(matchup=matchup, spec=spec)
                starting.append(g)
            if starting:
                info = env.reset(starting, [state[g]['spec'] for g in starting], [{t: 'external' for t in TEAMS}] * len(starting))
                for i, g in enumerate(starting):
                    state[g]['info'] = info_row(info, i)
            done = [g for g in range(n) if state[g] is not None and state[g]['info']['done']]
            for g in done:
                s = state[g]
                outcomes[s['matchup']].append((dict(spec=s['spec'], learner_team='heroes'),
                                               Trainer.eval_outcome('heroes', s['info']), s['info']['round']))
                state[g] = None
                free.append(g)
            live = [g for g in range(n) if state[g] is not None]
            if not live:
                continue
            obs = env.observe(live)
            rows = np.asarray(obs['native_choice'], np.int32).copy()   # native sides execute the native choice
            groups = defaultdict(list)       # (matchup, team) -> positions in live
            for i, g in enumerate(live):
                groups[(state[g]['matchup'], state[g]['info']['team'])].append(i)
            for (matchup, team), index in groups.items():
                mode = matchup[TEAM_CODE[team]]
                if mode == 'native':
                    continue
                batch, native = collate([split_obs(obs, i) for i in index], self.device, native=True)
                with self.torch.no_grad():
                    logits, _ = self.students[team](batch)
                    q = soft_target(native['native_raw'], native['native_dropped'], native['native_choice'],
                                    batch['cand_mask'], native['is_move'], t_move=args.t_move, t_act=args.t_act,
                                    alpha=args.alpha)
                    agreement[(matchup, team)].append(distill_metrics(logits, q, native['native_choice'], batch['cand_mask'],
                                                                      batch['cand_ids'][..., 0].long(), native['native_raw'],
                                                                      native['native_dropped']))
                    chosen = logits.argmax(-1) if mode == 'greedy' else self.torch.distributions.Categorical(logits=logits).sample()
                rows[index] = chosen.cpu().numpy()
            for i, g in enumerate(live):
                team = state[g]['info']['team']
                kinds[(state[g]['matchup'], team)][int(obs['cand_ids'][i, rows[i], 0])] += 1
            info = env.step(live, rows)
            for i, g in enumerate(live):
                state[g]['info'] = info_row(info, i)
        return self._report(outcomes, kinds, agreement, matchups)

    def _report(self, outcomes, kinds, agreement, matchups):
        from ember_rl.distill import tost_within
        base = outcomes.get(('native', 'native'), [])
        base_n = len(base)
        base_p = sum(o == 'win' for _, (o, _), _ in base) / base_n if base_n else None
        table = {}
        for matchup in matchups:
            games = outcomes.get(matchup, [])
            n = len(games)
            if not n:
                continue
            labels = [o for _, (o, _), _ in games]
            p = labels.count('win') / n
            row = dict(n=n, hero_win_rate=round(p, 4), **{k: labels.count(k) for k in
                       ('win', 'loss', 'draw', 'horizon_win', 'horizon_loss', 'horizon_draw', 'truncation')},
                       mean_rounds=round(float(np.mean([r for _, _, r in games])), 3),
                       mean_score=round(float(np.mean([s for _, (_, s), _ in games])), 4),
                       kinds={team: dict(sorted(kinds[(matchup, team)].items())) for team in TEAMS})
            row.update(breakdown([item for item, _, _ in games], [res for _, res, _ in games], self.specs))
            if base_p is not None and matchup != ('native', 'native'):
                row['diff_vs_native'] = round(p - base_p, 4)
                if 'sampled' not in matchup:
                    row['within_3pp'] = tost_within(p, base_p, n, base_n)
            table['-'.join(matchup)] = row
        decisions = {}
        for team in TEAMS:
            rows = [m for (matchup, t), ms in agreement.items() if t == team for m in ms if m['n']]
            total = sum(m['n'] for m in rows)
            if not total:
                continue
            confusion = Counter()
            for m in rows:
                confusion.update(m['confusion'])
            top1 = sum(m['top1'] * m['n'] for m in rows) / total
            tied = [m for m in rows if m.get('top1_tie') is not None]
            top1_tie = sum(m['top1_tie'] * m['n'] for m in tied) / sum(m['n'] for m in tied) if tied else None
            n_nonmove = sum(m.get('n_nonmove', 0) for m in rows)
            top1_nonmove = (sum(m['top1_nonmove'] * m['n_nonmove'] for m in rows if m.get('n_nonmove'))
                            / n_nonmove if n_nonmove else None)
            decisions[team] = dict(n=total, top1=round(top1, 5),
                                   top1_tie=None if top1_tie is None else round(top1_tie, 5),
                                   top1_nonmove=None if top1_nonmove is None else round(top1_nonmove, 5),
                                   n_nonmove=n_nonmove,
                                   q_agree=round(sum(m['q_agree'] * m['n'] for m in rows) / total, 5),
                                   kl=round(sum(m['kl'] * m['n'] for m in rows) / total, 5),
                                   passes_97=top1 >= .97, passes_97_tie=top1_tie is not None and top1_tie >= .97,
                                   confusion=dict(confusion.most_common(12)))
        self.validations += 1
        result = dict(type='validation', index=self.validations, matchups=table, decision_level=decisions)
        self.log(result)
        return result

    # ---- checkpoints ----
    def save(self):
        torch = self.torch
        from ember_rl.model import save_checkpoint
        for team, model in self.students.items():
            save_checkpoint(self.out / f'distilled-{team}.pt', model,
                            extra={'feature_version': self.feature_version, 'team': team, 'decisions': self.decisions,
                                   'team_decisions': self.team_decisions[team], 'steps': self.steps[team],
                                   'source': 'native distillation'})
        payload = dict(version=1, args=vars(self.args), decisions=self.decisions, steps=self.steps,
                       team_decisions=self.team_decisions, elapsed=self.elapsed(), validations=self.validations,
                       students={t: m.state_dict() for t, m in self.students.items()},
                       optimizers={t: o.state_dict() for t, o in self.optimizers.items()},
                       rng=dict(python=self.rng.getstate(), numpy=self.np_rng.bit_generator.state,
                                torch=torch.get_rng_state()))
        tmp = self.out / 'distill-checkpoint.pt.tmp'
        torch.save(payload, tmp)
        tmp.replace(self.out / 'distill-checkpoint.pt')

    def load(self, path):
        torch = self.torch
        payload = torch.load(path, map_location='cpu', weights_only=False)   # trusted local file only
        for team in TEAMS:
            self.students[team].load_state_dict(payload['students'][team])
            self.optimizers[team].load_state_dict(payload['optimizers'][team])
        self.decisions, self.steps = payload['decisions'], payload['steps']
        self.team_decisions, self.validations = payload['team_decisions'], payload['validations']
        self.elapsed_before = payload['elapsed']
        self.rng.setstate(payload['rng']['python'])
        self.np_rng.bit_generator.state = payload['rng']['numpy']
        torch.set_rng_state(payload['rng']['torch'])


def run(args, env=None):
    """Entry point of `duel.py --backend ember`."""
    if args.hp_handicap != 1. or args.monster_hp_scale != 1.:
        raise SystemExit('--hp-handicap and --monster-hp-scale are rejected with the ember backend: '
                         'balance comes from the encounter catalog')
    if args.alpha >= .5:
        print('WARNING: --alpha >= 0.5: the soft target\'s mode is no longer guaranteed to be the native choice',
              flush=True)
    if getattr(args, 'specs_only', False):
        return write_specs_only(args)
    if args.mode == 'distill':
        return DistillTrainer(args, env).run()
    return GeneralTrainer(args, env).run()


def write_specs_only(args):
    """--specs-only: write dev-specs.jsonl, eval-specs.jsonl and specs-coverage.json for these flags to
    --output and stop (no environment, no model): the shared development and evaluation lists several
    arms then load with --dev-specs / --eval-specs. Needs --catalog."""
    if not args.catalog:
        raise SystemExit('--specs-only needs --catalog')
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    specs = spec_source(args, None)
    dev, evaluation, reports = fixed_specs(args, specs)
    write_specs(out / 'dev-specs.jsonl', dev)
    write_specs(out / 'eval-specs.jsonl', evaluation)
    report = dict(sampling=specs.report(), **reports)
    (out / 'specs-coverage.json').write_text(json.dumps(report, indent=1) + '\n')
    print(f'specs: {len(dev)} development and {len(evaluation)} evaluation games in {out}', flush=True)
    return 0
