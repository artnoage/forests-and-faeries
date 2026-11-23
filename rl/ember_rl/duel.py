"""Simultaneous two-team PPO, distillation, lookahead & league trainer on ember_rs BatchEnv.

    python -m ember_rl.duel --output runs/duel-1 --hours 8 \
        --init-heroes initial-heroes.pt --init-monsters initial-monsters.pt

Design (see docs/EMBER_DUEL.md):
- Workers are pure simulators. Each spawned process pins one CPU and hosts
  several DuelEnv games; it never runs a neural network.
- The parent serves whichever workers are ready (no lockstep), batches every
  pending decision into GPU forward passes, and records transitions.
- Both teams learn at once: in a self-play game every decision trains the team
  that made it. Some games instead pit a learner against a past snapshot from
  that team's pool, or against the native Arena AI, to prevent cycling and
  forgetting; only learner decisions are trained on.
- Each team gets ordinary PPO (the audited `ember_rl.model` primitives) on its
  own transitions, using the same reward as SelfPlayEnv (`duel_env.team_reward`).
- Evaluation games (greedy, fixed seeds, fixed benchmark opponents) run in the
  same worker slots, interleaved with training, and never pause it.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import multiprocessing as mp
import os
import random
import signal
import threading
import time
import traceback
from collections import defaultdict, deque
from multiprocessing.connection import wait
from pathlib import Path

import numpy as np

TEAMS = ('heroes', 'monsters')
OTHER = {'heroes': 'monsters', 'monsters': 'heroes'}
TRAIN_SEEDS = (50_000_000, 60_000_000)
EVAL_SEED_BASE = 60_000_000
DEV_SEED_BASE = 61_000_000   # gated-schedule development games
FEATURE_VERSION = 'ember-native-v3-selfplay-repo-init-v2'  # == selfplay_env.FEATURE_VERSION


def run_deadline(started, args):
    """Wall-clock end of a run: --hours after `started`, or the absolute --deadline if earlier;
    never with --until-stopped (the run ends on <run>/STOP, SIGTERM or --max-updates)."""
    if getattr(args, 'until_stopped', False):
        return math.inf
    deadline = started + args.hours * 3600
    absolute = float(getattr(args, 'deadline', 0) or 0)
    return min(deadline, absolute) if absolute > 0 else deadline


# --------------------------------------------------------------------------- policies

class Policies:
    """Base policy container (learners, pool snapshots, frozen benchmarks); subclassed by GeneralPolicies."""

    def snapshot(self, team, label):
        """A pool snapshot of the learner (simultaneous schedule only)."""
        if getattr(self.args, 'schedule', 'simultaneous') != 'simultaneous':
            return None
        model = copy.deepcopy(self.learner[team]).eval().requires_grad_(False)
        self.pool[team].append((label, model))
        del self.pool[team][:-self.args.pool_size]
        return model

    def model_for(self, key):
        if key[0] == 'learner':
            return self.learner[key[1]]
        if key[0] == 'pool':
            return key[3]
        if len(key) > 2:
            return key[2]
        return self.frozen[key[1]]


# --------------------------------------------------------------------------- trainer

class Trainer:
    feature_version = FEATURE_VERSION     # the ember backend sets the env's version

    def __init__(self, args):
        import torch
        self.args = args
        self.torch = torch
        self.device = torch.device(args.device)
        if self.device.type == 'cuda':
            # Variable rollout shapes otherwise trigger repeated cuDNN attention planning.
            torch.backends.cuda.enable_cudnn_sdp(getattr(args, 'cudnn_sdp', False))
        torch.manual_seed(args.seed)
        self.rng = random.Random(args.seed)
        self.np_rng = np.random.default_rng(args.seed)
        self.out = Path(args.output)
        self.out.mkdir(parents=True, exist_ok=True)
        self.policies = self.make_policies()
        self.decisions = {team: 0 for team in TEAMS}       # learner decisions collected
        self.total_decisions = 0                           # every surfaced decision (incl. opponents)
        self.updates = {team: 0 for team in TEAMS}
        self.buffer = {team: [] for team in TEAMS}         # completed transitions
        self.streams = defaultdict(list)                   # (slot, team, episode) -> transitions in order
        self.episode_stats = defaultdict(lambda: defaultdict(int))
        self.eval_queue = deque()
        self.eval_rounds = {}
        self.eval_index = 0
        self.best = {team: dict(score=-math.inf) for team in TEAMS}
        # Adaptive monster-HP handicap (training games only; evaluation and development
        # games use --monster-hp-scale, 1 = the real encounter). See adapt_handicap().
        # Training games use handicap * --monster-hp-scale.
        self.handicap = float(args.hp_handicap)
        self.handicap_results = []
        self.started = time.time()
        self.elapsed_before = 0.
        # Alternating schedule: one team trains while the other plays a frozen
        # greedy copy of itself; swap every --phase-updates active-team updates.
        self.active_team = 'heroes'
        self.phase = 0
        self.phase_start_updates = 0
        # Gated schedule (the maintainer's longrun rules, ember_rl/longrun.py): the active team
        # trains against the other team's *selected* (phase-best) policy; development
        # games against that opponent decide when to switch. See start_gated().
        self.selected = {}            # team -> frozen model
        self.selected_id = {}         # team -> id of the selected policy ('initial-<team>' or an archive id)
        self.gate = None              # current phase bookkeeping (JSON-able)
        self._gated_resume = None     # saved gated state from a checkpoint
        self._eval_resume = None      # saved pending evaluation rounds
        self.resume_info = None
        # Open-ended runs: <run>/STOP or SIGTERM end the run cleanly (see stop_requested).
        self._stop, self._stop_checked = None, 0.
        self.opponent_stats = defaultdict(lambda: defaultdict(int))
        # Gated schedule: every selected phase policy is archived; --league draws opponents from it.
        self.archive = self.league = None
        if args.schedule == 'gated':
            from ember_rl.league import Archive, League
            self.archive = Archive(self.out, self.feature_version, window=getattr(args, 'pfsp_window', 256))
            if getattr(args, 'league', False):
                self.league = League(self.archive, size=args.league_size, latest=args.league_latest,
                                     power=args.pfsp_power, dev_opponents=args.league_dev_opponents,
                                     load=lambda entry: self.policies.load_frozen(self.out / entry['path'],
                                                                                  entry['team']))
        if args.resume:
            self.load(args.resume)
        elif self.archive is not None:
            moved = self.archive.reconcile()     # a fresh run in a used directory: old phase files go aside
            if moved:
                print(f'archive: moved {len(moved)} unlisted policy files to archive/dropped/', flush=True)
        for team in TEAMS:
            if not self.policies.pool[team]:
                self.policies.snapshot(team, f'{team}-u{self.updates[team]}')
        if args.schedule == 'alternating':
            self.freeze_phase_opponent()
        elif args.schedule == 'gated':
            self.start_gated()
        self.benchmarks = {}
        for team in TEAMS:
            if team in self.policies.initial:
                self.policies.frozen[f'initial-{team}'] = self.policies.initial[team]
                self.benchmarks.setdefault(team, []).append(('frozen', f'initial-{team}'))
            self.benchmarks.setdefault(team, []).append(('native',))
        self.restore_evaluations()
        self.restore_rng()        # last: rebuilding frozen models above draws from the torch RNG
        if self.resume_info is not None:
            self.log_row(dict(type='resume', **self.resume_info), 'RESUME')

    def make_policies(self):
        return Policies(self.args, self.device)

    # ---- episode setup ----
    def takes_eval(self, gslot):
        """Slot gslot starts the next queued evaluation or development game (within --eval-slot-fraction)."""
        return bool(self.eval_queue) and self.slots_in_eval < self.args.eval_slot_fraction * self.total_slots

    def new_episode(self, gslot):
        """Return (controllers, reset job, eval item). controllers: team -> controller key or ('native',)."""
        args = self.args
        if self.takes_eval(gslot):
            item = self.eval_queue.popleft()
            self.slots_in_eval += 1
            return item['controllers'], self.eval_job(item), item
        if args.schedule in ('alternating', 'gated'):
            inactive = OTHER[self.active_team]
            opponent = self.training_opponent(inactive) if args.schedule == 'gated' else self.phase_opponent(inactive)
            controllers = {self.active_team: ('learner', self.active_team), inactive: opponent}
            return controllers, self.training_job(controllers), None
        roll = self.rng.random()
        controllers = {team: ('learner', team) for team in TEAMS}
        if roll >= args.self_play_prob:
            team = self.rng.choice(TEAMS)  # this team is the non-learning opponent
            if roll < args.self_play_prob + args.native_prob:
                controllers[team] = ('native',)
            else:
                label, model = self.choose_pool(team)
                # Hold the model itself: the pool may drop this snapshot mid-game.
                controllers[team] = ('pool', team, label, model)
        return controllers, self.training_job(controllers), None

    def eval_job(self, item):
        """Reset job of an evaluation or development game (natural20: a fixed seed)."""
        return dict(reset=(item['seed'], item['native'], False, self.args.monster_hp_scale))

    def training_job(self, controllers):
        """Reset job of a training game (natural20: a random seed, start and HP handicap)."""
        args = self.args
        native = tuple(t for t, c in controllers.items() if c[0] == 'native')
        seed = self.rng.randrange(*TRAIN_SEEDS)
        return dict(reset=(seed, native, self.rng.random() < args.authored_start_prob,
                           self.handicap * args.monster_hp_scale))

    def dev_episodes(self):
        """Per-game fields of the development set (natural20: DEV_SEED_BASE + k)."""
        return [dict(seed=DEV_SEED_BASE + k) for k in range(self.args.dev_episodes)]

    def eval_episode(self, k, native_bench):
        """Per-game fields of evaluation game k (natural20: EVAL_SEED_BASE + k)."""
        return dict(seed=EVAL_SEED_BASE + k)

    def breakdown(self, items, results):
        """Extra dev/eval row fields from the finished games (ember backend: per encounter)."""
        return {}

    def freeze_phase_opponent(self):
        import copy
        inactive = OTHER[self.active_team]
        self.policies.frozen[f'phase-{inactive}'] = copy.deepcopy(
            self.policies.learner[inactive]).eval().requires_grad_(False)

    def maybe_switch_phase(self):
        args = self.args
        if args.schedule != 'alternating':
            return
        if self.updates[self.active_team] - self.phase_start_updates < args.phase_updates:
            return
        self.active_team = OTHER[self.active_team]
        self.phase += 1
        self.phase_start_updates = self.updates[self.active_team]
        self.freeze_phase_opponent()
        # Transitions of the now-inactive team are never trained on.
        inactive = OTHER[self.active_team]
        self.buffer[inactive] = []
        for key in [k for k in self.streams if k[1] == inactive]:
            del self.streams[key]
        row = dict(type='phase', phase=self.phase, active=self.active_team,
                   updates=dict(self.updates), decisions=dict(self.decisions), elapsed=round(self.elapsed(), 1))
        with (self.out / 'metrics.jsonl').open('a') as stream:
            stream.write(json.dumps(row) + '\n')
        print('PHASE', json.dumps(row), flush=True)

    # ---- gated schedule (the maintainer's longrun rules) ----
    def _frozen_copy(self, model):
        import copy
        return copy.deepcopy(model).eval().requires_grad_(False)

    def start_gated(self):
        """Set up the gated schedule, fresh or from a checkpoint.

        Rules follow ember_rl/longrun.py:
        - the active learner keeps its latest weights; the frozen opponent is the
          other team's selected policy (its phase best, initially its starting weights);
        - at phase start a baseline development evaluation scores the active team's
          selected policy; then every --dev-every learner decisions a greedy copy of
          the learner is evaluated on --dev-episodes fixed seeds against the opponent;
        - the phase best is the candidate with strictly more native elimination wins
          (baseline first); at a switch it becomes that team's selected policy;
        - switch when a candidate taken after >= --min-phase-decisions wins strictly
          more than --gate-threshold of its games, or (if --phase-budget > 0) once a
          candidate taken at >= --phase-budget decisions has been evaluated.
        Every new selected policy is archived (ember_rl/league.py); with --league the training
        opponents come from a panel of archived policies, the gate's opponent stays the latest.
        A development evaluation in progress at a checkpoint resumes where it stopped: its
        candidate, finished results and unfinished games are saved (`gated_state`).
        """
        args, saved = self.args, self._gated_resume
        if saved:
            for team, weights in saved['selected'].items():
                model = self.policies.make()
                model.load_state_dict(weights)
                self.selected[team] = model.eval().requires_grad_(False)
            self.selected_id = dict(saved.get('selected_id') or {t: f'initial-{t}' for t in TEAMS})
            self.gate = saved['gate']
            digest = self.dev_digest()
            if self.gate.get('dev_digest') not in (None, digest):
                # Resumed with other development games (a changed --catalog or --dev-specs): the phase's
                # baseline, best and pending round were scored on the old set, so the phase starts its
                # comparisons again (baseline first); its learner, decisions and schedule continue.
                print('RESUME WARNING: the development games changed; the phase reruns its baseline', flush=True)
                self.gate.update(best=None, last=None, baseline_done=False, baseline_results=None)
                saved = dict(saved, best_state=None, pending=None)
                if self.resume_info is not None:
                    self.resume_info['dev_games_changed'] = True
            self.gate['dev_digest'] = digest
            if saved.get('best_state') is not None:
                model = self.policies.make()
                model.load_state_dict(saved['best_state'])
                self.policies.frozen[self.gate['best']['key']] = model.eval().requires_grad_(False)
            elif self.gate.get('best'):
                self.policies.frozen[self.gate['best']['key']] = self.selected[self.gate['team']]
        else:
            # Fresh, or resuming a run that used another schedule: the latest weights
            # of both teams become their selected policies.
            for team in TEAMS:
                self.selected[team] = self._frozen_copy(self.policies.learner[team])
            self.selected_id = {t: f'initial-{t}' for t in TEAMS}
            self.active_team = args.first_team
        inactive = OTHER[self.active_team]
        self.policies.frozen[f'phase-{inactive}'] = self.selected[inactive]
        self.buffer[inactive] = []
        if not saved:
            self.new_gate_phase()
            return
        if self.league is not None:
            if saved.get('league'):
                self.league.restore(saved['league'], self.selected[inactive])
                self.install_league_panel(log=False)
            else:
                self.build_league_panel()
        pending = saved.get('pending')
        if pending is not None:
            meta = copy.deepcopy(pending['meta'])
            if meta['learner']:
                model = self.policies.make()
                model.load_state_dict(pending['model'])
                self.policies.frozen[meta['key']] = model.eval().requires_grad_(False)
            else:
                self.policies.frozen[meta['key']] = self.selected[self.gate['team']]
            meta['results'] = list(pending['results'])
            meta['items'] = list(pending['items'])
            if all(self.playable(it) for it in pending['unfinished']):
                self.gate['pending'] = meta
                self.eval_queue.extendleft(reversed(pending['unfinished']))
                if self.resume_info is not None:
                    self.resume_info['requeued_dev_games'] = len(pending['unfinished'])
            else:      # an opponent of the round is missing (resumed without --league): run it again
                self.policies.frozen.pop(meta['key'], None)
                if meta['learner']:
                    self.gate['next_dev'] = meta['phase_decisions']
                else:
                    self.gate['baseline_done'] = False
                if self.resume_info is not None:
                    self.resume_info['restarted_dev_round'] = meta['label']

    def phase_opponent(self, team):
        """Controller of the frozen side in development games: its selected policy, or the native AI
        (--native-opponent)."""
        if self.args.schedule == 'gated' and self.args.native_opponent == team:
            return ('native',)
        return ('frozen', f'phase-{team}')

    def training_opponent(self, team):
        """Gated training games: the frozen side's controller for one episode. The native AI
        (--native-opponent), a league draw (--league), or the selected policy; a policy key holds
        the model and a unique name ('opp:<policy id>'), plus the league panel version."""
        if self.args.native_opponent == team:
            return ('native',)
        if self.league is not None:
            if self.args.league_native > 0 and self.rng.random() < self.args.league_native:
                return ('native',)          # --league-native: the built-in AI as one more league opponent
            eid, model, version = self.league.choose(self.rng)
            return ('frozen', f'opp:{eid}', model, version)
        return ('frozen', f'opp:{self.selected_id[team]}', self.selected[team], 0)

    def dev_digest(self):
        """Identity of the development games (their specs or seeds): a phase compares its candidates and
        its baseline on one set only."""
        return hashlib.sha1(json.dumps(self.dev_episodes(), default=str, sort_keys=True).encode()).hexdigest()[:16]

    def new_gate_phase(self):
        self.gate = dict(team=self.active_team, phase=self.phase, start=self.decisions[self.active_team],
                         next_dev=self.per_team('dev_every', self.active_team), best=None, last=None,
                         baseline_done=False,
                         pending=None, dev_digest=self.dev_digest())
        if self.league is not None:
            self.build_league_panel()

    # ---- league (--league; ember_rl/league.py) ----
    def build_league_panel(self):
        team = OTHER[self.active_team]
        self.league.build(team, self.selected_id[team], self.selected[team], self.rng)
        self.install_league_panel()

    def install_league_panel(self, log=True):
        """Make the panel's development opponents resident under 'league-<id>' (and drop the old ones)."""
        for key in [k for k in self.policies.frozen if k.startswith('league-')]:
            del self.policies.frozen[key]
        for eid in self.league.panel['dev']:
            self.policies.frozen[f'league-{eid}'] = self.league.cache[eid]
        if log:
            self.log_row(dict(type='league', phase=self.phase, active=self.active_team, **self.league.describe(),
                              decisions=dict(self.decisions), updates=dict(self.updates),
                              elapsed=round(self.elapsed(), 1)), 'LEAGUE')

    def record_opponent(self, controllers, info):
        """A finished gated training game: per-opponent results (progress rows) and the archive's
        PFSP statistics. The learner's outcome is counted against the frozen side's policy id."""
        if self.args.schedule != 'gated':
            return
        learner = next((t for t, c in controllers.items() if c[0] == 'learner'), None)
        if learner is None:
            return
        key = controllers[OTHER[learner]]
        if key[0] == 'native':
            name = 'native'
        elif len(key) > 2 and str(key[1]).startswith('opp:'):
            name = key[1][4:]
        else:
            return
        outcome, _ = self.eval_outcome(learner, info)
        label = f'{name}@v{key[3]}' if len(key) > 3 and key[3] else name
        stats = self.opponent_stats[label]
        stats['episodes'] += 1
        stats[outcome] += 1
        if self.archive is not None and name in self.archive.entries:
            self.archive.observe(name, outcome)

    # ---- development games ----
    def gate_paused(self, team):
        """No PPO update of the active team while a development round runs: a learner candidate's, and
        also the phase's baseline round (Fable, l3-open idea 4). Before, the learner went on training
        during the baseline round (a median of 168k-353k decisions in gen-lookahead), so the first
        candidate came far later than --dev-every. On the ember backend collection stops too once a
        rollout is buffered (GeneralTrainer.collection_paused)."""
        g = self.gate
        return self.args.schedule == 'gated' and team == self.active_team and g['pending'] is not None

    def maybe_gate(self):
        if self.args.schedule != 'gated' or self.gate['pending'] is not None:
            return
        g, team = self.gate, self.active_team
        if not g['baseline_done']:
            self.schedule_dev('baseline', self.selected[team], 0, learner=False)
            return
        done = self.decisions[team] - g['start']
        if done >= g['next_dev']:
            every = self.per_team('dev_every', team)
            g['next_dev'] = (done // every + 1) * every
            self.schedule_dev(f'd{done}', self._frozen_copy(self.policies.learner[team]), done, learner=True)

    def dev_opponents(self, n):
        """(controller, policy id) of the opponent in each of n development games: the gate's opponent
        (the selected policy, or native), or with --league-dev-fraction f a share f of the games, spread
        evenly over the list, against the panel's hardest archived policies in turn."""
        team = OTHER[self.active_team]
        base = self.phase_opponent(team)
        base_id = 'native' if base[0] == 'native' else self.selected_id[team]
        dev = self.league.panel['dev'] if self.league is not None and self.league.panel else []
        f = getattr(self.args, 'league_dev_fraction', 0.) if dev else 0.
        out, j = [], 0
        for k in range(n):
            if f > 0 and math.floor((k + 1) * f) > math.floor(k * f):
                eid = dev[j % len(dev)]
                j += 1
                out.append((('frozen', f'league-{eid}'), eid))
            else:
                out.append((base, base_id))
        return out

    def schedule_dev(self, label, model, phase_decisions, learner):
        g, team = self.gate, self.active_team
        opponent = OTHER[team]
        key = f'dev-p{g["phase"]}-{label}'
        self.policies.frozen[key] = model
        episodes = self.dev_episodes()
        items = []
        for k, (fields, (controller, oid)) in enumerate(zip(episodes, self.dev_opponents(len(episodes)))):
            controllers = {team: ('frozen', key), opponent: controller}
            native = (opponent,) if controller[0] == 'native' else ()
            items.append(dict(controllers=controllers, native=native, dev=True, learner_team=team, dev_index=k,
                              opponent=oid, **fields))
        self.eval_queue.extendleft(reversed(items))      # ahead of benchmark evaluations
        g['pending'] = dict(label=label, key=key, phase_decisions=phase_decisions, learner=learner,
                            n=len(items), results=[])

    def per_team(self, name, team):
        """--<name>-<team> if set, else --<name> (gated: phase_budget, dev_every, min_phase_decisions)."""
        own = getattr(self.args, f'{name}_{team}', None)
        return getattr(self.args, name) if own is None else own

    def phase_budget(self, team):
        """--phase-budget-<team> if set, else --phase-budget (0 = no budget)."""
        return self.per_team('phase_budget', team)

    @staticmethod
    def paired_diff(results, items, baseline):
        """Candidate minus baseline on the same development specs (by dev_index): native wins (count and
        rate, with the paired standard error of the count) and mean score."""
        pairs = [(float(o == 'win'), s, baseline[it['dev_index']]) for it, (o, s) in zip(items, results)
                 if it.get('dev_index') in baseline]
        if not pairs:
            return None
        wins = np.array([w - float(b[0] == 'win') for w, _, b in pairs])
        scores = np.array([s - b[1] for _, s, b in pairs])
        n = len(pairs)
        se = lambda x: float(x.std(ddof=1) / math.sqrt(n)) if n > 1 else None
        win_se = se(wins)
        return dict(n=n, wins=int(round(wins.sum())), win_rate=round(float(wins.mean()), 4),
                    wins_se=None if win_se is None else round(win_se * n, 2),
                    score=round(float(scores.mean()), 4), score_se=None if se(scores) is None else round(se(scores), 4))

    def finish_dev(self, item, info):
        args, g = self.args, self.gate
        p = g['pending']
        p['results'].append(self.eval_outcome(item['learner_team'], info))
        p.setdefault('items', []).append(item)
        if len(p['results']) < p['n']:
            return
        outcomes = [o for o, _ in p['results']]
        kinds = ('win', 'loss', 'draw', 'horizon_win', 'horizon_loss', 'horizon_draw', 'truncation')
        wins = outcomes.count('win')                        # native eliminations only, as in longrun
        row = dict(type='dev', phase=g['phase'], team=g['team'], label=p['label'],
                   phase_decisions=p['phase_decisions'], n=p['n'], **{k: outcomes.count(k) for k in kinds},
                   mean_score=round(float(np.mean([s for _, s in p['results']])), 4),
                   decisions=dict(self.decisions), updates=dict(self.updates), elapsed=round(self.elapsed(), 1),
                   **self.breakdown(p['items'], p['results']))
        by_opponent = defaultdict(lambda: dict(n=0, **{k: 0 for k in kinds}))
        for it, (outcome, _) in zip(p['items'], p['results']):
            entry = by_opponent[it.get('opponent', '?')]
            entry['n'] += 1
            entry[outcome] += 1
        if len(by_opponent) > 1:
            row['per_opponent'] = dict(by_opponent)
        if p['label'] == 'baseline':     # kept for the paired differences of the phase's candidates
            g['baseline_results'] = {it['dev_index']: (o, s) for it, (o, s) in zip(p['items'], p['results'])
                                     if 'dev_index' in it}
        elif g.get('baseline_results'):
            row['paired_diff'] = self.paired_diff(p['results'], p['items'], g['baseline_results'])
        previous = g['best']
        if previous is None or wins > previous['wins']:
            g['best'] = dict(wins=wins, n=p['n'], label=p['label'], key=p['key'],
                             phase_decisions=p['phase_decisions'])
            if previous is not None:
                self.policies.frozen.pop(previous['key'], None)
        else:
            self.policies.frozen.pop(p['key'], None)
        g['pending'] = None
        if p['label'] == 'baseline':
            g['baseline_done'] = True
            passed = budget = False
        else:
            g['last'] = dict(wins=wins, n=p['n'], phase_decisions=p['phase_decisions'])
            passed = (p['phase_decisions'] >= self.per_team('min_phase_decisions', g['team'])
                      and wins > args.gate_threshold * p['n'])
            limit = self.phase_budget(g['team'])
            budget = bool(limit) and p['phase_decisions'] >= limit
        row.update(gate=passed, best=g['best']['label'])
        for name in ('metrics.jsonl', 'dev.jsonl'):
            with (self.out / name).open('a') as stream:
                stream.write(json.dumps(row) + '\n')
        print('DEV', json.dumps(row), flush=True)
        if passed or budget:
            self.switch_gated('development_gate' if passed else 'training_budget')

    def switch_gated(self, reason):
        g, team = self.gate, self.active_team
        best = g['best']
        if best is not None:
            self.selected[team] = self.policies.frozen[best['key']]
        if self.archive is not None:
            if best is not None and best['label'] != 'baseline':
                from ember_rl.model import save_checkpoint
                created = dict(time=round(time.time(), 1), elapsed=round(self.elapsed(), 1),
                               decisions=dict(self.decisions), updates=dict(self.updates))
                selection = dict(reason=reason, label=best['label'], wins=best['wins'], n=best['n'],
                                 phase_decisions=best['phase_decisions'], opponent=self.selected_id[OTHER[team]],
                                 previous=self.selected_id[team])
                entry = self.archive.add(team, g['phase'], self.selected[team], selection=selection, created=created,
                                         save=lambda path, model, extra: save_checkpoint(path, model, extra=extra))
                self.selected_id[team] = entry['id']
            self.archive.record_phase(dict(phase=g['phase'], team=team, reason=reason, selected=self.selected_id[team],
                                           best=best, last=g['last'], elapsed=round(self.elapsed(), 1),
                                           decisions=dict(self.decisions), updates=dict(self.updates)))
        for key in [k for k in self.policies.frozen if k.startswith('dev-')]:
            del self.policies.frozen[key]
        self.active_team = OTHER[team]
        self.phase += 1
        # The team that just finished is now the frozen opponent, as its selected policy.
        self.policies.frozen[f'phase-{team}'] = self.selected[team]
        self.buffer[team] = []
        for key in [k for k in self.streams if k[1] == team]:
            del self.streams[key]
        row = dict(type='phase', schedule='gated', phase=self.phase, active=self.active_team,
                   finished=team, reason=reason, selected=best, selected_id=self.selected_id[team], last=g['last'],
                   updates=dict(self.updates), decisions=dict(self.decisions), elapsed=round(self.elapsed(), 1))
        with (self.out / 'metrics.jsonl').open('a') as stream:
            stream.write(json.dumps(row) + '\n')
        print('PHASE', json.dumps(row), flush=True)
        self.new_gate_phase()

    def choose_pool(self, team):
        pool = self.policies.pool[team]
        # Favour recent snapshots but keep old ones in play (recency-weighted).
        weights = [1. + i for i in range(len(pool))]
        return self.rng.choices(pool, weights=weights)[0]

    def schedule_eval(self):
        """Greedy learner vs each fixed benchmark, same seeds every round."""
        args, round_id = self.args, self.eval_index
        self.eval_index += 1
        frozen = {}
        for team in TEAMS:
            import copy
            key = f'eval-{round_id}-{team}'
            self.policies.frozen[key] = copy.deepcopy(self.policies.learner[team]).eval().requires_grad_(False)
            frozen[team] = ('frozen', key)
        matchups = []
        for learner_team in TEAMS:
            opponent_team = OTHER[learner_team]
            for bench in self.benchmarks[opponent_team]:
                matchups.append((learner_team, bench))
        record = dict(round=round_id, updates=dict(self.updates), decisions=dict(self.decisions),
                      elapsed=self.elapsed(), results=defaultdict(list), items=defaultdict(list), pending=0)
        for learner_team, bench in matchups:
            name = f'{learner_team}-vs-' + ('native' if bench[0] == 'native' else bench[1])
            episodes = (args.eval_native_episodes or args.eval_episodes) if bench[0] == 'native' else args.eval_episodes
            for k in range(episodes):
                controllers = {learner_team: frozen[learner_team], OTHER[learner_team]: bench}
                native = tuple(t for t, c in controllers.items() if c[0] == 'native')
                self.eval_queue.append(dict(controllers=controllers, native=native, round=round_id, name=name,
                                            learner_team=learner_team, **self.eval_episode(k, bench[0] == 'native')))
                record['pending'] += 1
        for item in self.extra_eval_items(round_id, frozen):
            self.eval_queue.append(item)
            record['pending'] += 1
        self.eval_rounds[round_id] = record

    def extra_eval_items(self, round_id, frozen):
        """Backend-specific evaluation games of a round (ember single-creature mode); none here."""
        return []

    @staticmethod
    def eval_outcome(learner_team, info):
        """(outcome, learner-relative score) of one finished evaluation game.

        Native wins/losses/draws, horizon (health-score) adjudications and safety
        truncations are kept apart. The score is +1/-1/0 for a native end, and the
        objective's score otherwise (at the horizon, or where a truncation stopped).
        """
        sign = 1. if learner_team == 'heroes' else -1.
        relative = sign * float(info.get('score', 0.))
        if info['terminated'] and info.get('task_end') == 'health':
            outcome = 'horizon_win' if relative > 0 else 'horizon_loss' if relative < 0 else 'horizon_draw'
            return outcome, relative
        if info['terminated']:
            winner = info['winner']
            if winner is None:
                return 'draw', 0.
            return ('win', 1.) if winner == learner_team else ('loss', -1.)
        return 'truncation', relative

    def finish_eval(self, item, info):
        record = self.eval_rounds[item['round']]
        outcome, score = self.eval_outcome(item['learner_team'], info)
        record['results'][item['name']].append((outcome, score))
        record['items'][item['name']].append(item)
        record['pending'] -= 1
        if record['pending'] == 0:
            self.complete_eval_round(item['round'])

    def complete_eval_round(self, round_id):
        """Write the eval row of a round whose games are all in (none: the round is dropped)."""
        record = self.eval_rounds[round_id]
        if record['results']:
            kinds = ('win', 'loss', 'draw', 'horizon_win', 'horizon_loss', 'horizon_draw', 'truncation')
            summary = {}
            for name, rows in record['results'].items():
                outcomes = [o for o, _ in rows]
                summary[name] = {k: outcomes.count(k) for k in kinds}
                summary[name].update(n=len(rows), mean_score=round(float(np.mean([s for _, s in rows])), 4))
                summary[name].update(self.breakdown(record['items'][name], rows))
            row = dict(type='eval', round=record['round'], updates=record['updates'],
                       decisions=record['decisions'], elapsed=record['elapsed'], results=summary)
            row['best'] = self.update_best(record['round'], summary)    # reads the round's counters
            with (self.out / 'eval.jsonl').open('a') as stream:
                stream.write(json.dumps(row) + '\n')
            print('EVAL', json.dumps(row), flush=True)
        for team in TEAMS:
            self.policies.frozen.pop(f'eval-{record["round"]}-{team}', None)
        del self.eval_rounds[round_id]

    def playable(self, item):
        """Every policy an evaluation or development game names is loaded (a resumed run may lack a
        benchmark, e.g. without its --init-<team>, or league opponents, without --league)."""
        return all(c[0] != 'frozen' or len(c) > 2 or c[1] in self.policies.frozen
                   for c in item['controllers'].values())

    def update_best(self, round_id, summary):
        """Keep best-<team>.pt: the evaluated policy with the highest mean score vs the native AI (the
        native-best export; it is not a league best, see docs/EMBER_DUEL.md "Exports")."""
        from ember_rl.model import save_checkpoint
        saved = []
        for team in TEAMS:
            result = summary.get(f'{team}-vs-native')
            if result is None or result['mean_score'] <= self.best[team]['score']:
                continue
            model = self.policies.frozen[f'eval-{round_id}-{team}']
            record = self.eval_rounds.get(round_id, {})
            self.best[team] = dict(score=result['mean_score'], round=round_id,
                                   updates=record.get('updates', {}).get(team, self.updates[team]),
                                   decisions=record.get('decisions', {}).get(team, self.decisions[team]),
                                   n=result['n'], win=result.get('win'), excess=result.get('excess'))
            save_checkpoint(self.out / f'best-{team}.pt', model,
                            extra={'feature_version': self.feature_version, 'team': team, 'export': 'native-best',
                                   'selected_by': 'mean score vs native AI (greedy, eval specs)', **self.best[team]})
            saved.append(team)
        return saved

    # ---- shared time & episode helpers ----
    def elapsed(self):
        return self.elapsed_before + time.time() - self.started

    def trace_lambda(self, round_before, round_after):
        if getattr(self.args, 'lambda_unit', 'decision') != 'round':
            return self.args.gae_lambda
        return self.args.gae_lambda ** max(0, int(round_after) - int(round_before))

    def time_terms(self, round_before, round_after, team=None):
        args = self.args
        if args.time_unit == 'decision':
            from ember_rl.rewards import STEP_COST
            return args.gamma, STEP_COST
        rounds = max(0, int(round_after) - int(round_before))
        cost = args.round_cost if team is None or team in args.round_cost_teams else 0.
        return args.gamma ** rounds, cost * rounds

    def record_episode(self, controllers, info, kind=None):
        if kind is None:
            kind = 'self' if all(c[0] == 'learner' for c in controllers.values()) else \
                '+'.join(f'{t}={c[0]}' for t, c in controllers.items() if c[0] != 'learner')
        stats = self.episode_stats[kind]
        stats['episodes'] += 1
        stats['rounds'] += info['round']
        if info['terminated'] and info.get('task_end') == 'health':
            point = 'heroes' if info['score'] > 0 else 'monsters' if info['score'] < 0 else None
            stats[f'horizon={point}'] += 1
        elif info['terminated']:
            stats[f'winner={info["winner"]}'] += 1
        else:
            stats['truncated'] += 1

    def teacher_coef(self, team):
        """KL weight to the --init policy: constant, or linearly annealed (kickstarting)."""
        args = self.args
        if args.teacher_kl <= 0 or team not in self.policies.initial:
            return 0.
        if args.teacher_kl_decay_updates <= 0:
            return args.teacher_kl
        progress = min(1., self.updates[team] / args.teacher_kl_decay_updates)
        return args.teacher_kl + progress * (args.teacher_kl_final - args.teacher_kl)

    def log_progress(self, rate):
        row = dict(type='progress', elapsed=round(self.elapsed(), 1), decisions=dict(self.decisions),
                   learner_decisions_per_s=round(rate, 1), total_decisions=self.total_decisions, updates=dict(self.updates),
                   episodes={k: dict(v) for k, v in self.episode_stats.items()},
                   pool={t: len(p) for t, p in self.policies.pool.items()},
                   schedule=self.args.schedule, active=self.active_team if self.args.schedule in ('alternating', 'gated') else 'both')
        if self.opponent_stats:
            row['opponents'] = {k: dict(v) for k, v in sorted(self.opponent_stats.items())}
        if self.league is not None and self.league.panel:
            row['league'] = dict(version=self.league.panel['version'], latest=self.league.panel['latest'],
                                 members=len(self.league.panel['members']))
        row.update(self.extra_progress())
        self.episode_stats.clear()
        self.opponent_stats.clear()
        with (self.out / 'metrics.jsonl').open('a') as stream:
            stream.write(json.dumps(row) + '\n')
        print('PROGRESS', json.dumps(row), flush=True)

    def log_row(self, row, tag=None):
        with (self.out / 'metrics.jsonl').open('a') as stream:
            stream.write(json.dumps(row) + '\n')
        if tag:
            print(tag, json.dumps(row), flush=True)

    # ---- ending a run: deadline, --max-updates, <run>/STOP, SIGTERM ----
    def stop_requested(self):
        """True once <run>/STOP exists (checked at most once a second) or SIGTERM arrived. The trainer
        never deletes STOP: whoever restarts the run removes it first."""
        if self._stop is not None:
            return True
        now = time.monotonic()
        if now - self._stop_checked >= 1.:
            self._stop_checked = now
            if (self.out / 'STOP').exists():
                self._stop = 'stop_file'
        return self._stop is not None

    def should_end(self, deadline):
        args = self.args
        return (time.time() >= deadline or bool(args.max_updates and sum(self.updates.values()) >= args.max_updates)
                or self.stop_requested())

    def end_reason(self, deadline):
        if self._stop is not None:
            return self._stop
        if self.args.max_updates and sum(self.updates.values()) >= self.args.max_updates:
            return 'max_updates'
        return 'deadline'

    def install_stop_signal(self):
        """SIGTERM (a watcher, `kill`, a shutdown) ends the run like STOP, but exits with 143."""
        if threading.current_thread() is not threading.main_thread():
            return None

        def handler(signum, frame):
            self._stop = 'sigterm'
        previous = signal.getsignal(signal.SIGTERM)
        signal.signal(signal.SIGTERM, handler)
        return previous

    def finish_run(self, reason, previous_handler):
        """Final checkpoint and an `end` row. Exit status (duel.main): 0 after STOP, a deadline or
        --max-updates; 143 after SIGTERM; a crash or SIGINT propagates its exception (non-zero; the save
        is marked unclean, reason crash / interrupt)."""
        try:
            self.save(reason)
        except Exception:
            if reason not in ('crash', 'interrupt'):
                raise
            traceback.print_exc()        # keep the original error, which is propagating
        finally:
            if previous_handler is not None:
                signal.signal(signal.SIGTERM, previous_handler)
        self.log_row(dict(type='end', reason=reason, elapsed=round(self.elapsed(), 1), updates=dict(self.updates),
                          decisions=dict(self.decisions), phase=self.phase), 'END')
        if reason == 'sigterm':
            raise SystemExit(128 + signal.SIGTERM)

    # ---- checkpoints ----
    def _slot_states(self):
        """Slot states of the games in flight. The ember loop resets finished slots at the next
        iteration, so a finished slot's state (and its evaluation item) is left out here."""
        states = getattr(self, 'slot_state', None) or []
        if isinstance(states, dict):
            return [s for s in states.values() if s is not None]
        infos = getattr(self, 'infos', None) or [None] * len(states)
        return [s for s, info in zip(states, infos) if s is not None and not (info is not None and info['done'])]

    def dropped_work(self):
        """What a resume from this checkpoint loses (live games and unused transitions are not saved)."""
        states = self._slot_states()
        return dict(training_games=sum(1 for s in states if s.get('eval') is None),
                    pending_decisions=sum(len(s.get('pending', ())) for s in states if s.get('eval') is None),
                    buffered_transitions={t: len(self.buffer[t]) for t in TEAMS},
                    stream_transitions=sum(len(v) for v in self.streams.values()))

    def evaluation_state(self):
        """Pending evaluation rounds: the frozen learner copies, the finished results and the games still to
        play (queued or in flight; evaluation games are deterministic, so replaying an interrupted one gives
        the same result)."""
        in_flight = [s['eval'] for s in self._slot_states() if s.get('eval') is not None]
        waiting = in_flight + list(self.eval_queue)
        rounds = {}
        for rid, record in self.eval_rounds.items():
            rounds[rid] = dict(
                record=dict(round=record['round'], updates=record['updates'], decisions=record['decisions'],
                            elapsed=record['elapsed'], results={k: list(v) for k, v in record['results'].items()},
                            items={k: list(v) for k, v in record['items'].items()}),
                models={t: self.policies.frozen[f'eval-{rid}-{t}'].state_dict() for t in TEAMS
                        if f'eval-{rid}-{t}' in self.policies.frozen},
                unfinished=[it for it in waiting if not it.get('dev') and it.get('round') == rid])
        return rounds

    def restore_evaluations(self):
        saved, self._eval_resume = self._eval_resume, None
        requeued = dropped = 0
        for rid, state in sorted((saved or {}).items()):
            for team, weights in state['models'].items():
                model = self.policies.make()
                model.load_state_dict(weights)
                self.policies.frozen[f'eval-{rid}-{team}'] = model.eval().requires_grad_(False)
            record = dict(state['record'])
            record['results'] = defaultdict(list, {k: list(v) for k, v in record['results'].items()})
            record['items'] = defaultdict(list, {k: list(v) for k, v in record['items'].items()})
            unfinished = [it for it in state['unfinished'] if self.playable(it)]
            dropped += len(state['unfinished']) - len(unfinished)
            record['pending'] = len(unfinished)
            self.eval_rounds[rid] = record
            self.eval_queue.extend(unfinished)
            requeued += len(unfinished)
            if not unfinished:
                self.complete_eval_round(rid)
        if self.resume_info is not None:
            self.resume_info.update(requeued_eval_games=requeued, dropped_eval_games=dropped)

    def restore_rng(self):
        """The checkpoint's RNG states, applied after everything that builds models during a resume."""
        saved, self._rng_resume = getattr(self, '_rng_resume', None), None
        if saved is None:
            return
        torch = self.torch
        self.rng.setstate(saved['python'])
        self.np_rng.bit_generator.state = saved['numpy']
        torch.set_rng_state(saved['torch'])
        if saved.get('cuda') is not None and self.device.type == 'cuda':
            torch.cuda.set_rng_state(saved['cuda'], self.device)

    def save(self, reason='periodic'):
        """checkpoint.pt (the previous one becomes checkpoint.prev.pt), checkpoint.json (metadata for
        watchers, no torch needed), latest-<team>.pt and the archive index."""
        torch = self.torch
        from ember_rl.model import save_checkpoint
        cuda = self.device.type == 'cuda'
        payload = dict(
            version=2, args=vars(self.args), decisions=self.decisions, updates=self.updates,
            schedule=dict(active_team=self.active_team, phase=self.phase,
                          phase_start_updates=self.phase_start_updates, schedule=self.args.schedule),
            elapsed=self.elapsed(), eval_index=self.eval_index, best=self.best,
            gated=self.gated_state(), handicap=self.handicap,
            learner={t: m.state_dict() for t, m in self.policies.learner.items()},
            optimizer={t: o.state_dict() for t, o in self.policies.optimizer.items()},
            pool={t: [(label, m.state_dict()) for label, m in p] for t, p in self.policies.pool.items()},
            rng=dict(python=self.rng.getstate(), numpy=self.np_rng.bit_generator.state,
                     torch=torch.get_rng_state(), cuda=torch.cuda.get_rng_state(self.device) if cuda else None),
            total_decisions=self.total_decisions, evaluations=self.evaluation_state(),
            archive=self.archive.state() if self.archive is not None else None,
            dropped=self.dropped_work(), saved=dict(time=time.time(), reason=reason))
        payload.update(self.extra_state())
        tmp = self.out / 'checkpoint.pt.tmp'
        torch.save(payload, tmp)
        with open(tmp, 'rb') as stream:
            os.fsync(stream.fileno())
        current = self.out / 'checkpoint.pt'
        if current.exists():
            os.replace(current, self.out / 'checkpoint.prev.pt')
        os.replace(tmp, current)
        meta = dict(time=round(time.time(), 1), reason=reason, clean=reason not in ('crash', 'interrupt'),
                    elapsed=round(self.elapsed(), 1),
                    updates=dict(self.updates), decisions=dict(self.decisions), phase=self.phase,
                    active=self.active_team, eval_index=self.eval_index, dropped=payload['dropped'],
                    selected=dict(self.selected_id), archive_entries=len(self.archive.entries) if self.archive else 0)
        tmp_meta = self.out / 'checkpoint.json.tmp'
        tmp_meta.write_text(json.dumps(meta, indent=1) + '\n')
        os.replace(tmp_meta, self.out / 'checkpoint.json')
        # Frozen-policy files compatible with selfplay_runner.FrozenPolicy / --init-*.
        for team, model in self.policies.learner.items():
            save_checkpoint(self.out / f'latest-{team}.pt', model,
                            extra={'feature_version': self.feature_version, 'team': team, 'export': 'latest',
                                   'decisions': self.decisions[team], 'updates': self.updates[team]})
        if self.archive is not None:
            self.archive.write_index()

    def extra_state(self):
        """Backend-specific checkpoint fields (none for natural20)."""
        return {}

    def extra_progress(self):
        """Backend-specific progress-row fields (ember --search: search statistics); none here."""
        return {}

    def load_extra_state(self, payload):
        pass

    def gated_state(self):
        if self.args.schedule != 'gated' or self.gate is None:
            return None
        gate = copy.deepcopy({k: v for k, v in self.gate.items() if k != 'pending'})
        gate['pending'] = None
        pending, saved_pending = self.gate['pending'], None
        if pending is not None:          # resumed exactly: candidate, finished results, games still to play
            waiting = [s['eval'] for s in self._slot_states() if s.get('eval') is not None] + list(self.eval_queue)
            saved_pending = dict(
                meta={k: v for k, v in pending.items() if k not in ('results', 'items')},
                results=list(pending['results']), items=list(pending.get('items', [])),
                unfinished=[it for it in waiting if it.get('dev')],
                model=self.policies.frozen[pending['key']].state_dict() if pending['learner'] else None)
        best = gate.get('best')
        best_state = None
        if best is not None and best['label'] != 'baseline':
            best_state = self.policies.frozen[best['key']].state_dict()
        return dict(gate=gate, best_state=best_state, pending=saved_pending,
                    selected={t: m.state_dict() for t, m in self.selected.items()},
                    selected_id=dict(self.selected_id),
                    league=self.league.state() if self.league is not None else None)

    # Flags a resume may change with a logged warning (the plateau rule's steps: new catalogs, adding search):
    # encounter sampling and specs, the search arm, and run control. A change of the model's schema
    # (RESUME_FIXED) is refused; any other changed flag is logged too.
    RESUME_CATALOG = ('catalog', 'train_split', 'dev_split', 'eval_split', 'tier_weights', 'party_weights',
                      'family_weights', 'band_weights', 'balanced_range', 'wide_range', 'fixed_bands',
                      'min_cell_episodes', 'fixed_cell_weights', 'allow_uncovered', 'dev_specs', 'eval_specs')
    RESUME_SEARCH = ('search', 'search_mode', 'search_prob', 'search_step_prob', 'search_coef',
                     'search_start_decisions', 'search_start_ev', 'search_opponent', 'eval_substeps')
    RESUME_QUIET = ('resume', 'output', 'max_updates', 'hours', 'deadline', 'until_stopped', 'log_seconds',
                    'checkpoint_minutes', 'workers', 'env_threads')
    RESUME_FIXED = ('backend', 'arch', 'feature_version', 'd_model', 'heads', 'encoder_layers', 'decoder_layers',
                    'cnn_channels', 'cnn_layers', 'patch', 'hidden', 'vocab')

    def resume_changes(self, saved_args):
        """{group: {flag: [saved, now]}} of the flags this resume changes; refuses schema changes."""
        if not saved_args:
            return {}
        now = vars(self.args)
        changed = {k: [saved_args.get(k), now.get(k)] for k in sorted(set(saved_args) | set(now))
                   if k not in self.RESUME_QUIET and saved_args.get(k) != now.get(k)}
        fixed = {k: v for k, v in changed.items() if k in self.RESUME_FIXED and k in saved_args}
        if fixed:
            raise SystemExit(f'--resume cannot change the model schema: {fixed}')
        groups = defaultdict(dict)
        for k, v in changed.items():
            group = 'catalog' if k in self.RESUME_CATALOG else 'search' if k in self.RESUME_SEARCH else 'other'
            groups[group][k] = v
        return dict(groups)

    def load(self, path):
        torch = self.torch
        payload = torch.load(path, map_location='cpu', weights_only=False)  # trusted local file only
        changes = self.resume_changes(payload.get('args'))
        if changes:
            print(f'RESUME WARNING: changed flags {json.dumps(changes, default=str)}', flush=True)
        for team in TEAMS:
            self.policies.learner[team].load_state_dict(payload['learner'][team])
            self.policies.optimizer[team].load_state_dict(payload['optimizer'][team])
            self.policies.pool[team] = []
            for label, weights in payload['pool'][team]:
                model = self.policies.make()
                model.load_state_dict(weights)
                self.policies.pool[team].append((label, model.eval().requires_grad_(False)))
        self.decisions, self.updates = payload['decisions'], payload['updates']
        self.elapsed_before, self.eval_index = payload['elapsed'], payload['eval_index']
        self.total_decisions = payload.get('total_decisions', 0)
        self.best = payload.get('best') or self.best
        # Restore the adapted scale only from a run that itself used the handicap;
        # resuming a run without one starts at this run's --hp-handicap.
        saved_initial = float((payload.get('args') or {}).get('hp_handicap', 1.))
        if payload.get('handicap') is not None and saved_initial != 1. and self.args.hp_handicap != 1.:
            self.handicap = float(payload['handicap'])
        schedule = payload.get('schedule') or {}
        self.active_team = schedule.get('active_team', 'heroes')
        self.phase = schedule.get('phase', 0)
        self.phase_start_updates = schedule.get('phase_start_updates', 0)
        if self.args.schedule == 'gated' and schedule.get('schedule') == 'gated':
            self._gated_resume = payload.get('gated')
        if self.archive is not None:
            moved = self.archive.load_state(payload.get('archive'))
        else:
            moved = []
        self._eval_resume = payload.get('evaluations')
        self._rng_resume = payload['rng']
        cuda_restored = payload['rng'].get('cuda') is not None and self.device.type == 'cuda'
        self.load_extra_state(payload)
        saved = payload.get('saved') or {}
        self.resume_info = dict(
            checkpoint=str(path), saved_reason=saved.get('reason'), saved_time=saved.get('time'),
            updates=dict(self.updates), decisions=dict(self.decisions), phase=self.phase,
            dropped=payload.get('dropped'), cuda_rng_restored=cuda_restored, archive_files_moved=moved,
            changed_args=changes,
            not_restored=['live environment games (training games restart; their partial episodes are lost)',
                          'rollout buffers and pending learner decisions (see dropped)',
                          'progress-row statistics since the last progress row'])


def parser():
    p = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    p.add_argument('--output', required=True)
    p.add_argument('--hours', type=float, default=1.)
    p.add_argument('--deadline', type=float, default=0.,
                   help='absolute stop time (UNIX seconds); the run ends at this or after --hours, whichever is '
                        'first. Launch scripts fix it once, so a resumed run keeps the original deadline')
    p.add_argument('--until-stopped', action='store_true',
                   help='open-ended: no deadline (--hours is ignored, --deadline is rejected). The run ends when '
                        '<output>/STOP exists (save, exit 0), on SIGTERM (save, exit 143) or at --max-updates')
    p.add_argument('--workers', type=int, default=max(1, (os.cpu_count() or 2) - 1))
    p.add_argument('--cpus', default='', help='comma-separated CPU ids, one worker each (overrides --workers)')
    p.add_argument('--envs-per-worker', type=int, default=4)
    p.add_argument('--device', default='cuda')
    p.add_argument('--seed', type=int, default=1)
    p.add_argument('--resume', default='')
    p.add_argument('--transfer-v2-weights', action='store_true',
                   help='Initialize fresh v3 general learners from v2 policy weights. Requires matching architecture.')
    p.add_argument('--init-heroes', default='')
    p.add_argument('--init-monsters', default='')
    p.add_argument('--arch', choices=('mlp', 'transformer'), default='mlp',
                   help='mlp: original CandidateActorCritic; transformer: ~10M-param entity transformer')
    p.add_argument('--hidden', type=int, default=128, help='mlp width')
    p.add_argument('--d-model', type=int, default=384)
    p.add_argument('--heads', type=int, default=6)
    p.add_argument('--encoder-layers', type=int, default=3)
    p.add_argument('--decoder-layers', type=int, default=2)
    # PPO (defaults match the audited self-play trainer where it had one)
    p.add_argument('--rollout', type=int, default=8192, help='learner transitions per team per update')
    p.add_argument('--epochs', type=int, default=4)
    p.add_argument('--minibatch', type=int, default=1024)
    p.add_argument('--micro-batch', type=int, default=None,
                   help='gradient-accumulation chunk (default: whole minibatch for mlp, 128 for transformer)')
    p.add_argument('--lr', type=float, default=None, help='default 3e-4 (mlp) / 1e-4 (transformer)')
    p.add_argument('--clip', type=float, default=.2)
    p.add_argument('--value-coef', type=float, default=.5)
    p.add_argument('--entropy-coef', type=float, default=.01)
    p.add_argument('--max-grad-norm', type=float, default=.5)
    p.add_argument('--target-kl', type=float, default=.03)
    p.add_argument('--gamma', type=float, default=.995)
    p.add_argument('--gae-lambda', type=float, default=.95)
    p.add_argument('--teacher-kl', type=float, default=0., help='KL weight to the --init policy (retention / kickstarting)')
    p.add_argument('--teacher-kl-final', type=float, default=0.)
    p.add_argument('--teacher-kl-decay-updates', type=int, default=0,
                   help='anneal --teacher-kl to --teacher-kl-final over this many updates per team (0 = constant)')
    # Opponents / schedule
    p.add_argument('--schedule', choices=('simultaneous', 'alternating', 'gated', 'single-creature'),
                   default='simultaneous',
                   help='simultaneous: both teams learn every game (with pool/native opponents); '
                        'alternating: one team learns vs a frozen greedy copy of the other, swapping every '
                        '--phase-updates updates (a simplification, NOT the longrun rules); '
                        'gated: the maintainer\'s longrun rules - learner vs the other team\'s phase-best policy, '
                        'switching on a development-win gate (see Trainer.start_gated); '
                        'single-creature (ember backend only): each game one random creature is played by its '
                        'team\'s learner and every other creature by the native AI (see general_duel)')
    p.add_argument('--phase-updates', type=int, default=8, help='alternating: active-team updates per phase')
    p.add_argument('--first-team', choices=TEAMS, default='heroes', help='gated: team that trains first')
    p.add_argument('--gate-threshold', type=float, default=.8,
                   help='gated: switch when native elimination wins > this fraction of development games')
    p.add_argument('--dev-every', type=int, default=65536, help='gated: learner decisions between development evaluations')
    p.add_argument('--dev-episodes', type=int, default=32, help='gated: games per development evaluation (longrun: 12)')
    p.add_argument('--min-phase-decisions', type=int, default=65536, help='gated: no gate switch before this')
    p.add_argument('--hp-handicap', type=float, default=1.,
                   help='initial monster HP scale in training games (1 = off); adapted towards '
                        '--hp-handicap-target; evaluation and development games use --monster-hp-scale')
    p.add_argument('--monster-hp-scale', type=float, default=1.,
                   help='fixed monster max-HP multiplier for EVERY game (training, development, evaluation): '
                        'an encounter-balance setting; the adaptive --hp-handicap multiplies on top in training')
    p.add_argument('--hp-handicap-target', type=float, default=.5, help='target monster win rate in training games')
    p.add_argument('--hp-handicap-band', type=float, default=.1, help='no change while |rate - target| <= band')
    p.add_argument('--hp-handicap-step', type=float, default=.05)
    p.add_argument('--hp-handicap-window', type=int, default=200, help='training games per adjustment')
    p.add_argument('--hp-handicap-min', type=float, default=1.)
    p.add_argument('--hp-handicap-max', type=float, default=3.)
    p.add_argument('--native-opponent', choices=TEAMS, default=None,
                   help='gated: whenever this team is the frozen side, the native AI plays it instead of its '
                        'selected policy (training and development games alike)')
    p.add_argument('--phase-budget', type=int, default=262144,
                   help='gated: switch anyway after the evaluation at this many phase decisions (0 = never)')
    p.add_argument('--phase-budget-heroes', type=int, default=None,
                   help='gated: the phase budget of the heroes\' phases (default: --phase-budget)')
    p.add_argument('--phase-budget-monsters', type=int, default=None,
                   help='gated: the phase budget of the monsters\' phases (default: --phase-budget)')
    for team in TEAMS:
        p.add_argument(f'--dev-every-{team}', type=int, default=None,
                       help=f'gated: --dev-every of the {team}\' phases (default: --dev-every)')
        p.add_argument(f'--min-phase-decisions-{team}', type=int, default=None,
                       help=f'gated: --min-phase-decisions of the {team}\' phases (default: --min-phase-decisions)')
    p.add_argument('--league', action='store_true',
                   help='gated: training opponents come from a league of the other team\'s archived phase policies '
                        '(PFSP), not only its latest selected policy (ember_rl/league.py); the gate is unchanged')
    p.add_argument('--league-size', type=int, default=8,
                   help='league: opponents resident on the GPU per phase (the latest selected one included)')
    p.add_argument('--league-latest', type=float, default=.5,
                   help='league: probability that a training game plays the latest selected opponent')
    p.add_argument('--league-native', type=float, default=0.,
                   help='league: probability that a training game plays the native AI as the frozen side (drawn '
                        'before --league-latest; 0 = never). Development games are unchanged')
    p.add_argument('--pfsp-power', type=float, default=2.,
                   help='league: an archived opponent weighs (1 - x)^p, x = the learner\'s win rate against it')
    p.add_argument('--pfsp-window', type=int, default=256,
                   help='games over which the archive\'s win rates decay (1 - 1/window per game)')
    p.add_argument('--league-dev-fraction', type=float, default=0.,
                   help='league: share of the development games played against the panel\'s hardest archived '
                        'policies instead of the latest selected one (0 = all against the latest)')
    p.add_argument('--league-dev-opponents', type=int, default=2,
                   help='league: how many of the hardest archived policies the development games cycle through')
    p.add_argument('--self-play-prob', type=float, default=.6)
    p.add_argument('--native-prob', type=float, default=.1)
    p.add_argument('--pool-size', type=int, default=20)
    p.add_argument('--snapshot-every', type=int, default=5, help='updates between pool snapshots')
    p.add_argument('--authored-start-prob', type=float, default=.25)
    # Episodes / evaluation / bookkeeping
    # Objective and time (defaults reproduce the original duel reward exactly)
    p.add_argument('--objective', choices=('native', 'health_score'), default='native',
                   help='native: elimination, round cap = safety truncation; '
                        'health_score: finite horizon at --max-rounds, scored by team HP fractions')
    p.add_argument('--standing-weight', type=float, default=0.,
                   help='weight of the creatures-standing fraction in the score and shaping potential')
    p.add_argument('--time-unit', choices=('decision', 'round'), default='decision',
                   help='decision: --gamma and STEP_COST per decision; '
                        'round: --gamma per round elapsed and --round-cost per round')
    p.add_argument('--round-cost', type=float, default=0., help='reward per round elapsed (time-unit round)')
    p.add_argument('--round-cost-teams', nargs='+', choices=TEAMS, default=list(TEAMS),
                   help='teams whose reward includes --round-cost (default: both)')
    p.add_argument('--move-penalty', type=float, default=0.,
                   help='subtracted from the reward of an own decision once per square it walks (ember backend; '
                        'outcome rewards are +-1, so .001 is a tenth of a percent of a win per square)')
    p.add_argument('--moves', choices=('step', 'dest'), default='step',
                   help='ember backend: step = one row per adjacent square; dest = one row per reachable square, '
                        'walked by the shortest path (ember-rs 9abcae2+; candidate counts grow 5-10x)')
    p.add_argument('--max-rounds', type=int, default=50)
    p.add_argument('--max-steps', type=int, default=4096)
    p.add_argument('--eval-every', type=int, default=20, help='total updates (both teams) between eval rounds')
    p.add_argument('--eval-episodes', type=int, default=32, help='per matchup')
    p.add_argument('--eval-native-episodes', type=int, default=None,
                   help='per matchup against the native AI (default: --eval-episodes)')
    p.add_argument('--eval-slot-fraction', type=float, default=.25)
    p.add_argument('--checkpoint-minutes', type=float, default=15.)
    p.add_argument('--log-seconds', type=float, default=60.)
    p.add_argument('--max-updates', type=int, default=0, help='stop after this many total updates (0 = no limit)')
    p.add_argument('--lambda-unit', choices=('decision', 'round'), default='decision',
                   help='round: GAE lambda ** rounds elapsed per transition, like gamma under --time-unit round '
                        '(decisions inside a turn do not shorten the trace); needs --time-unit round')
    p.add_argument('--backend', default='ember',
                   help='ember (alias ember-rs): the '
                        'in-process general BatchEnv (GENERAL_ENV.md §8), general_model and episode specs')
    add_ember_arguments(p)
    return p


def add_ember_arguments(p):
    """Flags of the ember backend (ember_rl/general_duel.py, docs/EMBER_DUEL.md "General backend")."""
    g = p.add_argument_group('ember backend')
    g.add_argument('--mode', choices=('ppo', 'distill'), default='ppo',
                   help='ppo: the duel schedules on BatchEnv; distill: native-score distillation (§6.3), no PPO')
    g.add_argument('--ember-env', default='ember_rs',
                   help="ember_rs (the pyo3 module), fake (ember_rl.fake_env.FakeBatchEnv) or 'module:callable'")
    g.add_argument('--content', nargs='*', default=['content/srd'], help='ember_rs content pack directories')
    g.add_argument('--feature-version', default='ember-gen-v2', choices=('ember-gen-v1', 'ember-gen-v2', 'ember-gen-v3'),
                   help='observation schema the env encodes (general_env.FEATURE_DIMS); new runs use ember-gen-v2')
    g.add_argument('--slots', type=int, default=256, help='BatchEnv slots (games in flight)')
    g.add_argument('--env-threads', type=int, default=12)
    g.add_argument('--eval-slots', type=int, default=0,
                   help='ember PPO: extra environment slots that hold only evaluation and development games, so a '
                        'development round never waits for training games to end (0: they share --slots under '
                        '--eval-slot-fraction)')
    g.add_argument('--group-search-actions', action='store_true',
                   help='group greedy search forwards by legal action count to reduce decoder padding')
    g.add_argument('--compile-policy', action='store_true',
                   help='compile bucketed general-model policy, critic and PPO forwards on CUDA')
    g.add_argument('--cudnn-sdp', action='store_true',
                   help='allow cuDNN attention for CUDA PPO (default off for variable rollout shapes). '
                        'Use a fresh Inductor cache when changing this option.')
    g.add_argument('--cuda-graph-leaves', action='store_true',
                   help='replay small inference-only value batches with bounded CUDA graphs')
    g.add_argument('--env-scores', choices=('auto', 'on', 'off'), default='auto',
                   help='native scores at every decision; auto = on for distill or --native-kl > 0')
    g.add_argument('--catalog', nargs='*', default=[],
                   help='encounters.jsonl files (§7.3), merged (ids must be unique); a file may carry tags for its '
                        'rows: PATH#family=mausoleum,band=wide. The fake env brings its own catalog')
    g.add_argument('--train-split', default='train')
    g.add_argument('--tier-weights', default='', help="training tier weights, e.g. 'T0=1,T1=2' (default: uniform over encounters)")
    g.add_argument('--party-weights', default='',
                   help="nested training sampling by party (*=1 gives every training party equal weight): sizes and/or parties, e.g. '3=.6,2=.32,1=.08,elion=0' "
                        "(a size's weight is split evenly over its parties that are not named; see "
                        "general_env.SpecSource)")
    g.add_argument('--family-weights', default='',
                   help="nested sampling by map family, e.g. 'generated=.5,fixed=.25,mausoleum=.25' "
                        "(general_env.map_family; default: by encounter count)")
    g.add_argument('--band-weights', default='',
                   help="nested sampling by balance band, e.g. 'balanced=.75,wide=.25' (default: by encounter count)")
    g.add_argument('--balanced-range', default='.40,.60', help='native hero win rate p of a balanced row')
    g.add_argument('--wide-range', default='.25,.75', help='p of a wide-band row (outside the balanced range)')
    g.add_argument('--fixed-bands', default='balanced,unknown',
                   help='bands of the rows that development and evaluation specs are drawn from')
    g.add_argument('--min-cell-episodes', type=int, default=8,
                   help='development/evaluation: episodes per cell (map family x party) when the list is long '
                        'enough; the rest goes by training probability')
    g.add_argument('--fixed-cell-weights', choices=('train', 'rows', 'equal'), default='train',
                   help='development/evaluation cell weights: the training probability, encounter counts or equal')
    g.add_argument('--allow-uncovered', action='store_true',
                   help='start even if a cell that training draws has no development or evaluation games')
    g.add_argument('--learner-balance', action='store_true',
                   help='draw train rows (within the drawn party/family/band cell) with weight floor + (1 - floor) '
                        '4p(1 - p), p = the running hero result of the current learner\'s training games on the row '
                        '(ember_rl/balance.py; Fable, l3-open idea 3)')
    g.add_argument('--balance-floor', type=float, default=.25, help='learner balance: the weight of a decided row')
    g.add_argument('--balance-window', type=int, default=32, help='learner balance: games over which a row\'s result decays')
    g.add_argument('--balance-prior', type=float, default=8.,
                   help='learner balance: games of weight of the logistic fit (roster, party, family) in a row\'s p')
    g.add_argument('--balance-fit-games', type=int, default=4096, help='learner balance: recent games in the fit')
    g.add_argument('--balance-refresh', type=int, default=64, help='learner balance: games between refits / new weights')
    g.add_argument('--dev-split', default='dev')
    g.add_argument('--dev-specs', default='', help='JSONL of fixed development specs (default: --dev-episodes from --dev-split)')
    g.add_argument('--specs-only', action='store_true',
                   help='write dev-specs.jsonl, eval-specs.jsonl and specs-coverage.json to --output and stop '
                        '(shared lists for several arms)')
    g.add_argument('--eval-split', default='dev')
    g.add_argument('--eval-specs', default='', help='JSONL of fixed evaluation specs (default: from --eval-split)')
    g.add_argument('--vocab', default='', help='content/vocab.json: checks every id fits the 256-slot tables')
    g.add_argument('--cnn-channels', type=int, default=64)
    g.add_argument('--cnn-layers', type=int, default=4, help='3x3 convolutions in the map CNN (stem + residual)')
    g.add_argument('--patch', type=int, default=4, help='map patch size for patch tokens')
    g.add_argument('--p-id', type=float, default=.25,
                   help='id dropout: probability that a creature\'s kind and character ids read "unknown" (training only)')
    g.add_argument('--native-kl', type=float, default=0., help='weight c of c*CE(q, pi) on learner decisions (§6.5)')
    g.add_argument('--native-kl-final', type=float, default=0.)
    g.add_argument('--native-kl-decay-updates', type=int, default=0,
                   help='anneal --native-kl to --native-kl-final over this many updates per team (0 = constant)')
    g.add_argument('--t-move', type=float, default=.25, help='soft-target temperature for moves (§6.2)')
    g.add_argument('--t-act', type=float, default=1., help='soft-target temperature for every other row')
    g.add_argument('--alpha', type=float, default=.3, help='soft-target weight of the softmax part (< 0.5)')
    g.add_argument('--value-warmup-updates', type=int, default=0,
                   help='PPO: at most this many value-only updates per team at the start (policy frozen; 0 = off)')
    g.add_argument('--value-warmup-min', type=int, default=2, help='value-only updates before the early stop may apply')
    g.add_argument('--value-warmup-ev-tol', type=float, default=.02,
                   help='end the value-only warm-up once explained variance changes by less than this')
    g.add_argument('--tf-decisions', type=int, default=1_000_000, help='distill: teacher-forced decisions (beta = 1)')
    g.add_argument('--dagger-decisions', type=int, default=1_000_000,
                   help='distill: decisions over which beta falls linearly from 1 to --beta-final')
    g.add_argument('--beta-final', type=float, default=0.)
    g.add_argument('--distill-buffer', type=int, default=65_536,
                   help='distill: replay capacity per team (decisions; about 25 KB each, the map is 16 KB)')
    g.add_argument('--distill-batch', type=int, default=256)
    g.add_argument('--distill-every', type=int, default=4096, help='distill: new decisions between training rounds')
    g.add_argument('--distill-steps', type=int, default=16, help='distill: optimizer steps per team per round')
    g.add_argument('--critic-coef', type=float, default=.5, help='distill: weight of the value regression')
    g.add_argument('--critic-k', type=int, default=8, help='distill: native continuations per critic root state')
    g.add_argument('--critic-states', type=int, default=0,
                   help='distill: root states for the K-rollout critic stage after the policy stages (0 = skip)')
    g.add_argument('--critic-steps', type=int, default=1000, help='distill: optimizer steps per team in the critic stage')
    g.add_argument('--critic-sample-prob', type=float, default=.05,
                   help='distill: probability that a teacher-forced decision becomes a critic root')
    g.add_argument('--distill-eval-every', type=int, default=0,
                   help='distill: decisions between validations (0 = only at the end)')
    g.add_argument('--eval-single-episodes', type=int, default=None,
                   help='single-creature: evaluation games per team in the single-creature setting against the '
                        'native AI (default: --eval-native-episodes)')
    g.add_argument('--search', default='',
                   help="decision-time lookahead for learner decisions in training games (ember_rl/search.py), e.g. "
                        "'k=4,seeds=4,horizon=turns:1,tau=0.1'; off by default. Development, evaluation and frozen "
                        "opponents always play the raw policy, greedy")
    g.add_argument('--search-mode', choices=('act', 'advise'), default='act',
                   help='act (expert iteration): a searched decision plays the search\'s action (Gumbel AlphaZero '
                        'choice), trains the policy towards the search target and is left out of the PPO policy '
                        'loss; advise: the learner keeps acting with its own policy (PPO unchanged) and the search '
                        'target is an extra loss term')
    g.add_argument('--search-prob', type=float, default=1.,
                   help='probability that a learner decision is searched (playout cap randomization); the others '
                        'act with the policy and train by PPO')
    g.add_argument('--search-step-prob', type=float, default=1.,
                   help='probability that a step of the training loop searches at all; within such a step each '
                        'learner decision is searched with --search-prob. A search costs about one sequential '
                        'rollout per step whatever the number of roots, so searching every root of a quarter of '
                        'the steps (--search-step-prob .25 --search-prob 1) is much faster than a quarter of the '
                        'roots of every step')
    g.add_argument('--search-coef', type=float, default=1.,
                   help='weight of the cross-entropy between the search target and the policy')
    g.add_argument('--search-opponent', choices=('game', 'native'), default='game',
                   help='game: forks keep the game\'s controllers (a frozen opponent net plays in the rollouts); '
                        'native: forks hand the other team to the native AI (fewer network rows per search)')
    g.add_argument('--search-threads', type=int, default=1,
                   help='worker threads of one training search: its forks are split by root over this many scratch '
                        'envs, whose engine calls overlap; network calls take turns. Speed only (default 1)')
    g.add_argument('--pipeline-search', action='store_true',
                   help='overlap greedy GPU rollouts on one scratch half with engine steps on the other')
    g.add_argument('--search-start-decisions', type=int, default=0,
                   help='PPO-only warm-up: a team\'s learner decisions are searched only after this many of them')
    g.add_argument('--search-start-ev', type=float, default=None,
                   help='PPO-only warm-up: ... and once the team\'s critic explained variance (last update) is >= this')
    g.add_argument('--eval-substeps', type=int, default=8,
                   help='--search: after a loop step that searched, step the evaluation and development games alone '
                        'up to this many more times, so their wall-clock pace does not follow the searched steps')


def prepare_args(args):
    """Defaults that depend on other flags (shared by main and tests)."""
    if args.backend == 'ember-rs':
        args.backend = 'ember'
    if args.backend != 'ember':
        raise SystemExit(f'--backend {args.backend!r} is unsupported; use --backend ember')
    large = args.arch == 'transformer' or args.backend == 'ember'
    if args.lr is None:
        args.lr = 1e-4 if large else 3e-4
    if args.micro_batch is None:
        args.micro_batch = 128 if large else 0
    if args.eval_native_episodes is None:
        args.eval_native_episodes = args.eval_episodes
    if args.eval_single_episodes is None:
        args.eval_single_episodes = args.eval_native_episodes
    if args.lambda_unit == 'round' and args.time_unit != 'round':
        raise SystemExit('--lambda-unit round needs --time-unit round')
    if args.move_penalty < 0 or (args.move_penalty and args.backend != 'ember'):
        raise SystemExit('--move-penalty must be >= 0 and needs --backend ember')
    if args.moves != 'step' and args.backend != 'ember':
        raise SystemExit('--moves dest needs --backend ember')
    if args.eval_slots < 0 or (args.eval_slots and (args.backend != 'ember' or args.mode != 'ppo')):
        raise SystemExit('--eval-slots must be >= 0 and needs --backend ember --mode ppo')
    for team in TEAMS:
        every = getattr(args, f'dev_every_{team}')
        if args.dev_every < 1 or (every is not None and every < 1):
            raise SystemExit('--dev-every and --dev-every-<team> must be >= 1')
        for name in ('min_phase_decisions', 'phase_budget'):
            value = getattr(args, f'{name}_{team}')
            if getattr(args, name) < 0 or (value is not None and value < 0):
                raise SystemExit(f'--{name.replace("_", "-")} and its per-team forms must be >= 0')
    if args.search and (args.backend != 'ember' or args.mode != 'ppo'):
        raise SystemExit('--search needs --backend ember --mode ppo')
    if args.pipeline_search and (not args.search or args.search_threads != 1):
        raise SystemExit('--pipeline-search needs --search and --search-threads 1')
    if not 0 <= args.search_prob <= 1 or not 0 <= args.search_step_prob <= 1 or args.search_coef < 0:
        raise SystemExit('--search-prob and --search-step-prob must be in [0, 1] and --search-coef >= 0')
    if args.search_start_decisions < 0 or args.eval_substeps < 0:
        raise SystemExit('--search-start-decisions and --eval-substeps must be >= 0')
    if not 0 <= args.balance_floor <= 1 or args.balance_window < 1 or args.balance_prior < 0 \
            or args.balance_fit_games < 1 or args.balance_refresh < 1:
        raise SystemExit('learner balance: --balance-floor in [0, 1], window, fit games and refresh >= 1, prior >= 0')
    if args.until_stopped and args.deadline:
        raise SystemExit('--until-stopped has no deadline: drop --deadline')
    if args.league:
        if args.schedule != 'gated':
            raise SystemExit('--league needs --schedule gated')
        if args.native_opponent:
            raise SystemExit('--league and --native-opponent exclude each other')
    if args.league_native and not args.league:
        raise SystemExit('--league-native needs --league')
    if args.league_size < 1 or not 0 <= args.league_latest <= 1 or not 0 <= args.league_dev_fraction <= 1 \
            or not 0 <= args.league_native <= 1 \
            or args.league_dev_opponents < 1 or args.pfsp_power < 0 or args.pfsp_window < 1:
        raise SystemExit('league: --league-size >= 1, --league-latest, --league-native and --league-dev-fraction in [0, 1], '
                         '--league-dev-opponents >= 1, --pfsp-power >= 0, --pfsp-window >= 1')
    return args


def main(argv=None):
    args = prepare_args(parser().parse_args(argv))
    from ember_rl.general_duel import run
    return run(args)


if __name__ == '__main__':
    main()
