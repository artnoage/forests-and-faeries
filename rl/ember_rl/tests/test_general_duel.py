"""duel.py --backend ember on FakeBatchEnv: distillation (teacher-forced + DAgger), PPO schedules, resume."""
import json

import numpy as np
import pytest

torch = pytest.importorskip('torch')

from ember_rl import duel

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
TINY = ['--backend', 'ember', '--ember-env', 'fake', '--slots', '8', '--device', DEVICE, '--d-model', '32',
        '--heads', '2', '--encoder-layers', '1', '--decoder-layers', '1', '--cnn-channels', '16', '--cnn-layers', '2',
        '--objective', 'health_score', '--standing-weight', '.5', '--time-unit', 'round', '--gamma', '1',
        '--max-rounds', '6', '--log-seconds', '1', '--hours', '0.2']
PPO = ['--rollout', '64', '--minibatch', '32', '--micro-batch', '16', '--epochs', '1', '--eval-episodes', '2']


def rows(path, name):
    return [json.loads(line) for line in (path / name).read_text().splitlines()]


@pytest.fixture(scope='module')
def distilled(tmp_path_factory):
    out = tmp_path_factory.mktemp('distill')
    duel.main(['--mode', 'distill', '--output', str(out), '--tf-decisions', '240', '--dagger-decisions', '240',
               '--distill-every', '80', '--distill-steps', '2', '--distill-batch', '32', '--eval-episodes', '3',
               '--critic-states', '12', '--critic-k', '2', '--critic-steps', '2', '--critic-sample-prob', '.3',
               '--distill-eval-every', '300', *TINY])
    return out


def test_distill_runs_teacher_forced_then_dagger_with_critic_and_validation(distilled):
    log = rows(distilled, 'distill.jsonl')
    betas = [r['beta'] for r in log if r['type'] == 'distill']
    assert betas[0] == 1. and betas[-1] < 1. and betas == sorted(betas, reverse=True)
    trained = [r for r in log if r['type'] == 'distill']
    assert all(np.isfinite(t['ce']) for r in trained for t in r['teams'].values())
    # Teacher-forced games are native-vs-native, so they carry Monte Carlo value targets.
    assert any(t['value_targets'] > 0 for r in trained for t in r['teams'].values())
    critic = [r for r in log if r['type'] == 'critic']
    assert critic and sum(t['roots'] for t in critic[0]['teams'].values()) == 12
    validations = [r for r in log if r['type'] == 'validation']
    assert len(validations) == 2                     # one mid-run, one final
    table = validations[-1]['matchups']
    assert set(table) == {'native-native', 'greedy-native', 'native-greedy', 'greedy-greedy', 'sampled-sampled'}
    assert all(row['n'] == 3 and 'per_encounter' in row and 'excess' in row for row in table.values())
    assert 'within_3pp' in table['greedy-native'] and 'within_3pp' not in table['sampled-sampled']
    decision = validations[-1]['decision_level']
    assert set(decision) == {'heroes', 'monsters'} and all(0 <= d['top1'] <= d['top1_tie'] <= 1 for d in decision.values())
    for team in ('heroes', 'monsters'):
        payload = torch.load(distilled / f'distilled-{team}.pt', weights_only=False)
        assert payload['model_config']['arch'] == 'general'
        assert payload['extra']['feature_version'] == 'ember-gen-v2' and payload['extra']['team'] == team


def test_distill_resume_continues_counters(distilled, tmp_path):
    out = tmp_path / 'more'
    duel.main(['--mode', 'distill', '--output', str(out), '--resume', str(distilled / 'distill-checkpoint.pt'),
               '--tf-decisions', '240', '--dagger-decisions', '400', '--distill-every', '80', '--distill-steps', '1',
               '--distill-batch', '16', '--eval-episodes', '1', *TINY])
    log = rows(out, 'distill.jsonl')
    assert [r for r in log if r['type'] == 'distill'][0]['decisions'] > 480


def test_ppo_from_distilled_students_with_native_kl_value_warmup_and_round_lambda(distilled, tmp_path):
    out = tmp_path / 'ppo'
    duel.main(['--output', str(out), '--init-heroes', str(distilled / 'distilled-heroes.pt'),
               '--init-monsters', str(distilled / 'distilled-monsters.pt'), '--max-updates', '8', '--eval-every', '4',
               '--eval-slot-fraction', '.5', '--native-kl', '.5', '--native-kl-decay-updates', '4',
               '--value-warmup-updates', '2', '--lambda-unit', 'round', *PPO, *TINY])
    updates = [r for r in rows(out, 'metrics.jsonl') if r['type'] == 'update']
    for team in ('heroes', 'monsters'):
        mine = [r for r in updates if r['team'] == team]
        assert [r['phase'] for r in mine[:2]] == ['value_warmup', 'value_warmup']
        assert all('native_ce' not in r and r['native_kl_coef'] == 0 for r in mine[:2])
        ppo = [r for r in mine if r['phase'] == 'ppo']
        if ppo:
            assert ppo[0]['native_kl_coef'] == .5 and 'native_ce' in ppo[0]
            coefs = [r['native_kl_coef'] for r in ppo]
            assert coefs == sorted(coefs, reverse=True)
    assert all(np.isfinite(r['loss']) for r in updates)
    # Warm start: the learner began as the distilled student.
    first = torch.load(distilled / 'distilled-heroes.pt', weights_only=False)['policy']
    payload = torch.load(out / 'checkpoint.pt', weights_only=False)
    assert payload['backend'] == 'ember' and set(payload['value_warmup']) == {'heroes', 'monsters'}
    assert payload['learner']['heroes'].keys() == first.keys()
    # Resume keeps the warm-up state and continues.
    duel.main(['--output', str(out), '--resume', str(out / 'checkpoint.pt'), '--max-updates', '10',
               '--value-warmup-updates', '2', '--lambda-unit', 'round', *PPO, *TINY])
    payload = torch.load(out / 'checkpoint.pt', weights_only=False)
    assert sum(payload['updates'].values()) >= 10
    assert not any(w['active'] for w in payload['value_warmup'].values())


def test_ppo_eval_rows_have_per_encounter_results_and_best_checkpoints(tmp_path):
    out = tmp_path / 'eval'
    duel.main(['--output', str(out), '--max-updates', '10', '--eval-every', '4', '--eval-slot-fraction', '1',
               '--eval-native-episodes', '2', '--schedule', 'alternating', '--phase-updates', '1', *PPO, *TINY])
    evals = rows(out, 'eval.jsonl')
    assert evals
    result = evals[0]['results']['heroes-vs-native']
    assert result['n'] == 2 and 'per_encounter' in result and 'per_tier' in result
    assert result['excess'] is not None and result['excess_n'] == 2
    assert (out / 'best-heroes.pt').exists() and (out / 'latest-monsters.pt').exists()
    teams = [r['team'] for r in rows(out, 'metrics.jsonl') if r['type'] == 'update']
    assert teams[:3] == ['heroes', 'monsters', 'heroes']


def test_gated_schedule_keeps_the_absolute_gate_with_spec_dev_sets(tmp_path):
    out = tmp_path / 'gated'
    duel.main(['--output', str(out), '--schedule', 'gated', '--dev-every', '64', '--dev-episodes', '4',
               '--min-phase-decisions', '0', '--gate-threshold', '-1', '--eval-slot-fraction', '1',
               '--eval-every', '1000', '--max-updates', '6', *PPO, *TINY, '--max-rounds', '3'])
    log = rows(out, 'metrics.jsonl')
    devs = [r for r in log if r['type'] == 'dev']
    phases = [r for r in log if r['type'] == 'phase']
    assert devs[0]['label'] == 'baseline' and devs[0]['team'] == 'heroes' and not devs[0]['gate']
    assert all(d['n'] == 4 and sum(e['n'] for e in d['per_encounter'].values()) == 4 for d in devs)
    assert all('excess' in d for d in devs)
    assert phases and phases[0]['finished'] == 'heroes' and phases[0]['reason'] == 'development_gate'
    active = 'heroes'
    for r in log:
        if r['type'] == 'phase':
            active = r['active']
        elif r['type'] == 'update':
            assert r['team'] == active
    # The same dev specs are replayed for every candidate (paired comparisons).
    specs = {tuple(sorted(d['per_encounter'])) for d in devs if d['team'] == 'heroes'}
    assert len(specs) == 1


def test_native_opponent_and_dev_specs_file(tmp_path):
    from ember_rl.general_env import EpisodeSpec, write_specs
    specs = tmp_path / 'dev.jsonl'
    write_specs(specs, [EpisodeSpec('fake-test-0', 1, 2, 3, 0, 0), EpisodeSpec('fake-test-1', 4, 5, 6, 0, 0)])
    out = tmp_path / 'native'
    duel.main(['--output', str(out), '--schedule', 'gated', '--dev-every', '64', '--dev-specs', str(specs),
               '--min-phase-decisions', '0', '--gate-threshold', '1', '--phase-budget', '0', '--first-team', 'monsters',
               '--native-opponent', 'heroes', '--eval-slot-fraction', '1', '--eval-every', '1000', '--max-updates', '3',
               *PPO, *TINY, '--max-rounds', '3'])
    log = rows(out, 'metrics.jsonl')
    devs = [r for r in log if r['type'] == 'dev']
    assert devs and all(set(d['per_encounter']) == {'fake-test-0', 'fake-test-1'} for d in devs)
    kinds = {k for r in log if r['type'] == 'progress' for k in r['episodes']}
    assert kinds <= {'heroes=native'}


def test_ember_backend_rejects_hp_handicap_and_natural20_rejects_distill(tmp_path):
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'h'), '--hp-handicap', '1.5', *TINY])
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'd'), '--backend', 'legacy', '--mode', 'distill', '--device', 'cpu'])
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'l'), '--lambda-unit', 'round', '--device', 'cpu'])
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 's'), '--mode', 'distill', '--env-scores', 'off', *TINY])


def test_missing_ember_rs_module_is_a_clear_error(tmp_path, monkeypatch):
    import builtins
    real_import = builtins.__import__

    def fake_import(name, *args, **kwargs):
        if name == 'ember_rs':
            raise ImportError('no ember_rs')
        return real_import(name, *args, **kwargs)
    monkeypatch.setattr(builtins, '__import__', fake_import)
    argv = [a for a in TINY if a not in ('--ember-env', 'fake')]
    with pytest.raises(SystemExit, match='ember_rs'):
        duel.main(['--output', str(tmp_path / 'x'), *argv])


class RecordingEnv:
    """Wraps FakeBatchEnv: records every reset's controllers and checks that only the
    listed creature ever surfaces a decision in a per-creature game."""

    def __init__(self, env):
        self.env, self.resets, self.external = env, [], {}

    def __getattr__(self, name):
        return getattr(self.env, name)

    def _check(self, slots, info):
        for i, g in enumerate(np.asarray(slots).reshape(-1)):
            units = self.external.get(int(g))
            if units is not None and not info['done'][i]:
                assert int(info['actor'][i]) in units

    def reset(self, slots, specs, controllers):
        info = self.env.reset(slots, specs, controllers)
        for g, spec, ctrl in zip(np.asarray(slots).reshape(-1), specs, controllers):
            self.resets.append((spec, dict(ctrl)))
            self.external[int(g)] = set(ctrl['external_units']) if 'external_units' in ctrl else None
        self._check(slots, info)
        return info

    def step(self, slots, rows):
        info = self.env.step(slots, rows)
        self._check(slots, info)
        return info


def test_single_creature_schedule_routes_one_random_creature_per_game_to_its_team(tmp_path):
    from ember_rl.fake_env import FakeBatchEnv, fake_catalog
    from ember_rl.general_duel import run
    from ember_rl.general_env import team_tokens
    catalog = {r['id']: r for r in fake_catalog()}
    out = tmp_path / 'single'
    argv = ['--output', str(out), '--schedule', 'single-creature', '--max-updates', '8', '--eval-every', '4',
            '--eval-slot-fraction', '.5', '--eval-native-episodes', '2', '--eval-single-episodes', '6',
            '--native-kl', '.2', '--value-warmup-updates', '1', *PPO, *TINY]
    args = duel.prepare_args(duel.parser().parse_args(argv))
    env = RecordingEnv(FakeBatchEnv(args.slots, scores=True, objective=args.objective, max_rounds=args.max_rounds,
                                    standing_weight=args.standing_weight, max_steps=args.max_steps))
    run(args, env=env)
    training = [(spec, ctrl) for spec, ctrl in env.resets if spec[4] == -1]      # random offset = training game
    assert len(training) > 20
    sides = []
    for spec, ctrl in training:
        assert ctrl['heroes'] == 'native' and ctrl['monsters'] == 'native' and len(ctrl['external_units']) == 1
        tokens = team_tokens(catalog[spec[0]])
        k = ctrl['external_units'][0]
        sides.append('heroes' if k in tokens['heroes'] else 'monsters')
        assert k in tokens[sides[-1]]
    assert {'heroes', 'monsters'} == set(sides)                     # both sides are drawn
    log = rows(out, 'metrics.jsonl')
    updates = [r for r in log if r['type'] == 'update']
    assert {r['team'] for r in updates} == {'heroes', 'monsters'}   # both learners train
    assert any(r['phase'] == 'ppo' and 'native_ce' in r for r in updates)
    kinds = {k for r in log if r['type'] == 'progress' for k in r['episodes']}
    assert kinds and kinds <= {'single-heroes', 'single-monsters'}
    evals = rows(out, 'eval.jsonl')
    assert evals
    results = evals[0]['results']
    assert {'heroes-single-vs-native', 'monsters-single-vs-native', 'heroes-vs-native', 'monsters-vs-native'} <= set(results)
    for team in ('heroes', 'monsters'):
        single = results[f'{team}-single-vs-native']
        assert single['n'] == 6 and single['excess_n'] == 6 and single['excess'] is not None
        assert sum(row['n'] for row in single['per_kind'].values()) == 6
        assert all('excess' in row for row in single['per_kind'].values())
        assert 'per_kind' not in results[f'{team}-vs-native']
        assert (out / f'best-single-{team}.pt').exists() and (out / f'best-{team}.pt').exists()
    payload = torch.load(out / 'checkpoint.pt', weights_only=False)
    assert all(payload['best_single'][t]['score'] > -np.inf for t in ('heroes', 'monsters'))
    # The fixed single-creature eval games: the same spec and creature every round.
    evaluated = [(spec, tuple(ctrl['external_units'])) for spec, ctrl in env.resets
                 if spec[4] == 0 and 'external_units' in ctrl]
    rounds = [evaluated[i:i + 12] for i in range(0, len(evaluated) - len(evaluated) % 12, 12)]
    assert rounds and all(sorted(r) == sorted(rounds[0]) for r in rounds)
    # Resume keeps the single-creature best scores and continues.
    argv = ['--output', str(out), '--resume', str(out / 'checkpoint.pt'), '--schedule', 'single-creature',
            '--max-updates', '10', '--eval-every', '4', '--eval-single-episodes', '6', *PPO, *TINY]
    duel.main(argv)
    again = torch.load(out / 'checkpoint.pt', weights_only=False)
    assert sum(again['updates'].values()) >= 10
    assert again['best_single']['heroes']['score'] >= payload['best_single']['heroes']['score']


def test_single_creature_needs_teams_in_the_catalog_and_the_ember_backend(tmp_path):
    from ember_rl.general_env import team_tokens
    with pytest.raises(ValueError):
        team_tokens(dict(id='x', n_units=3))                        # no side information
    with pytest.raises(ValueError):
        team_tokens(dict(id='x', party=['mara'], roster=[]))         # an empty side
    assert team_tokens(dict(id='x', party=['mara', 'ilyra'], roster=['zombie', 'zombie'])) == \
        dict(heroes=[0, 1], monsters=[2, 3])
    catalog = tmp_path / 'c.jsonl'
    catalog.write_text(json.dumps(dict(id='fake-train-0', split='train', n_units=3)) + '\n'
                       + json.dumps(dict(id='fake-dev-0', split='dev', n_units=3, n_heroes=1)) + '\n')
    with pytest.raises(SystemExit, match='single-creature'):
        duel.main(['--output', str(tmp_path / 's'), '--schedule', 'single-creature', '--catalog', str(catalog),
                   *PPO, *TINY])
    with pytest.raises(SystemExit, match='ember'):
        duel.main(['--output', str(tmp_path / 'n'), '--backend', 'legacy', '--schedule', 'single-creature', '--device', 'cpu'])


def test_absolute_deadline_ends_the_run(tmp_path):
    import time
    out = tmp_path / 'deadline'
    started = time.time()
    duel.main(['--output', str(out), '--deadline', str(time.time() + 3), '--hours', '1', *PPO, *TINY])
    assert time.time() - started < 120
    assert (out / 'checkpoint.pt').exists()


def test_gated_development_pause_bounds_the_learner_buffer(tmp_path):
    """While a candidate's dev games run, updates pause; once a full rollout is buffered the
    training slots stop stepping (only dev and eval games move), so the buffer stays bounded."""
    from ember_rl.fake_env import FakeBatchEnv
    from ember_rl.general_duel import GeneralTrainer
    argv = ['--output', str(tmp_path / 'pause'), '--schedule', 'gated', '--dev-every', '64', '--dev-episodes', '4',
            '--min-phase-decisions', '0', '--gate-threshold', '2', '--phase-budget', '0', '--eval-slot-fraction', '.5',
            '--eval-every', '1000', '--max-updates', '40', *PPO, *TINY, '--slots', '16', '--max-rounds', '3']
    args = duel.prepare_args(duel.parser().parse_args(argv))
    sizes, paused_steps = [], []

    class Probe(GeneralTrainer):
        def update(self, team):
            sizes.append(len(self.buffer[team]))
            return super().update(team)

        def decide_batch(self, live, obs):
            if self.collection_paused():
                paused_steps.append(all(self.slot_state[g]['eval'] is not None for g in live))
            return super().decide_batch(live, obs)

    env = FakeBatchEnv(args.slots, scores=True, objective=args.objective, max_rounds=args.max_rounds,
                       standing_weight=args.standing_weight, max_steps=args.max_steps)
    Probe(args, env).run()
    devs = [r for r in rows(tmp_path / 'pause', 'metrics.jsonl') if r['type'] == 'dev']
    assert len(devs) >= 2 and paused_steps and all(paused_steps)
    # Without the pause this setup feeds updates about 15 rollouts each; with it the buffer only grows
    # while development games wait for a slot that a finishing training game could free.
    assert sizes and max(sizes) <= 4 * args.rollout


def test_update_still_rejects_illegal_samples_and_non_finite_outputs_before_stepping(tmp_path):
    """The update reads its checks once per minibatch; they must still fire before that minibatch's
    optimizer.step. One minibatch per update here: with several, the earlier minibatches have stepped
    before the one holding the bad sample, so which one it falls in (the shuffle) would decide."""
    from ember_rl.fake_env import FakeBatchEnv
    from ember_rl.general_duel import GeneralTrainer
    args = duel.prepare_args(duel.parser().parse_args(['--output', str(tmp_path / 'checks'), '--max-updates', '1',
                                                       '--eval-slot-fraction', '.01', *PPO, *TINY,
                                                       '--minibatch', '1000000']))
    caught = {}

    class Probe(GeneralTrainer):
        def update(self, team):
            if caught:
                return super().update(team)
            model = self.policies.learner[team]
            before = {k: v.clone() for k, v in model.state_dict().items()}
            buffer, streams = list(self.buffer[team]), {k: list(v) for k, v in self.streams.items()}
            key, index = buffer[-1]
            sample = self.streams[key][index]
            choice, obs = sample['choice'], sample['obs']

            def restore():
                self.buffer[team] = list(buffer)
                self.streams.update({k: list(v) for k, v in streams.items()})
            sample['choice'] = obs['cand_mask'].shape[0] + 3          # a padded row
            with pytest.raises(ValueError, match='illegal'):
                super().update(team)
            restore()
            sample['choice'] = 0
            sample['obs'] = dict(obs, cands=np.full_like(obs['cands'], np.inf))
            with pytest.raises(FloatingPointError):
                super().update(team)
            restore()
            caught['unchanged'] = all(torch.equal(before[k], v) for k, v in model.state_dict().items())
            sample['choice'], sample['obs'] = choice, obs
            return super().update(team)

    env = FakeBatchEnv(args.slots, scores=True, objective=args.objective, max_rounds=args.max_rounds,
                       standing_weight=args.standing_weight, max_steps=args.max_steps)
    Probe(args, env).run()
    assert caught == {'unchanged': True}


SEARCH = ['--search', 'k=2,seeds=2,horizon=turns:1,tau=0.1,scratch=64']


@pytest.mark.parametrize('mode', ['act', 'advise'])
def test_search_training_modes_targets_checkpoints_and_resume(tmp_path, mode):
    """--search on the gated schedule: learner decisions in training games are searched (half of them),
    acted on (act) or only advised (advise); updates add the search cross-entropy; development and
    evaluation still run, and a resumed run keeps the search RNG and counters."""
    out = tmp_path / mode
    # dev-every two rollouts: development rounds (the baseline included) pause the learner, and a phase that
    # passes its gate at its first round would otherwise switch before its buffer reached one rollout.
    argv = ['--output', str(out), '--schedule', 'gated', '--dev-every', '128', '--dev-episodes', '4',
            '--min-phase-decisions', '0', '--gate-threshold', '-1', '--eval-slot-fraction', '.5', '--eval-every', '3',
            '--max-updates', '4', '--search-mode', mode, '--search-prob', '.5', '--move-penalty', '.001',
            *SEARCH, *PPO, *TINY, '--max-rounds', '3']
    duel.main(argv)
    log = rows(out, 'metrics.jsonl')
    updates = [r for r in log if r['type'] == 'update']
    assert len(updates) == 4
    for r in updates:
        assert r['search_mode'] == mode and 0 < r['searched_samples'] < r['samples'] and np.isfinite(r['search_ce'])
        if mode == 'act':
            assert r['ppo_samples'] == r['samples'] - r['searched_samples'] and r['ppo_fraction'] < 1
        else:
            assert r['ppo_samples'] == r['samples'] and r['ppo_fraction'] == 1
    progress = [r for r in log if r['type'] == 'progress']
    assert progress and any(r.get('search', {}).get('searched', 0) > 0 for r in progress)
    payload = torch.load(out / 'checkpoint.pt', map_location='cpu', weights_only=False)
    assert payload['search']['stats']['searched'] > 0 and payload['search']['config'].startswith('k=2,')
    assert 'move_penalty=0.001' in payload['search']['config']     # the search scores the training return
    duel.main([*argv[:argv.index('--max-updates')], '--max-updates', '10', *argv[argv.index('--max-updates') + 2:],
               '--resume', str(out / 'checkpoint.pt')])
    log = rows(out, 'metrics.jsonl')
    updates = [r for r in log if r['type'] == 'update']
    assert len(updates) == 10 and sum(updates[-1]['decisions'].values()) > sum(updates[3]['decisions'].values())
    assert any(r['type'] == 'dev' for r in log) and rows(out, 'eval.jsonl')
    again = torch.load(out / 'checkpoint.pt', map_location='cpu', weights_only=False)
    assert again['search']['stats']['searched'] > payload['search']['stats']['searched']


def test_search_step_prob_searches_every_root_of_some_steps(tmp_path, monkeypatch):
    """--search-step-prob .5 --search-prob 1: a loop step searches all of its training-game learner roots or none."""
    from ember_rl.general_duel import GeneralTrainer
    from ember_rl.search import Lookahead
    calls, searched = [], []
    original_learner, original_search = GeneralTrainer.search_learner, Lookahead.search

    def learner(self, team, live, index, sub):
        eligible = sum(self.slot_state[live[i]]['eval'] is None for i in index)
        before = len(searched)
        out = original_learner(self, team, live, index, sub)
        calls.append((eligible, searched[before] if len(searched) > before else 0))
        return out

    def search(self, env, roots, explore=False):
        searched.append(len(roots))
        return original_search(self, env, roots, explore=explore)

    monkeypatch.setattr(GeneralTrainer, 'search_learner', learner)
    monkeypatch.setattr(Lookahead, 'search', search)
    out = tmp_path / 'steps'
    duel.main(['--output', str(out), '--max-updates', '2', '--eval-slot-fraction', '.5', '--search-prob', '1',
               '--search-step-prob', '.5', *SEARCH, *PPO, *TINY, '--max-rounds', '3'])
    stepped = [c for c in calls if c[0]]
    assert all(n in (0, eligible) for eligible, n in stepped)
    assert any(n == 0 for _, n in stepped) and any(n for _, n in stepped)
    updates = [r for r in rows(out, 'metrics.jsonl') if r['type'] == 'update']
    assert all(0 < r['searched_samples'] < r['samples'] for r in updates)


def test_without_search_the_trainer_records_no_search_fields(tmp_path):
    out = tmp_path / 'plain'
    duel.main(['--output', str(out), '--max-updates', '2', '--eval-slot-fraction', '.5', *PPO, *TINY])
    log = rows(out, 'metrics.jsonl')
    assert all('search' not in r and 'search_ce' not in r and 'searched_samples' not in r for r in log)
    assert 'search' not in torch.load(out / 'checkpoint.pt', map_location='cpu', weights_only=False)


def test_search_flags_need_the_ember_ppo_backend(tmp_path):
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'x'), '--mode', 'distill', *SEARCH, *TINY])
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'y'), '--search-prob', '2', *PPO, *TINY])
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'z'), '--search-step-prob', '-.1', *SEARCH, *PPO, *TINY])


def test_move_penalty_applies_to_move_decisions_only():
    from types import SimpleNamespace

    import numpy as np

    from ember_rl.general_duel import GeneralTrainer
    from ember_rl.general_env import MOVE_KIND

    cand_ids = np.array([[MOVE_KIND, 0, 0], [MOVE_KIND + 1, 0, 0]], np.int64)
    trainer = SimpleNamespace(args=SimpleNamespace(move_penalty=.001))
    move = dict(obs=dict(cand_ids=cand_ids), choice=0)
    other = dict(obs=dict(cand_ids=cand_ids), choice=1)
    assert GeneralTrainer.move_penalty(trainer, move) == .001
    assert GeneralTrainer.move_penalty(trainer, other) == 0.
    trainer.args.move_penalty = 0.
    assert GeneralTrainer.move_penalty(trainer, move) == 0.
