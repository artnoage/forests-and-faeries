"""Training-recipe options of 2026-11-25 on FakeBatchEnv: the mixed search opponent and its schedule, the gate
relative to the phase's baseline, the learner-balance target, and the strict check of the fixed spec lists."""
import json
import math
import random
from collections import Counter
from types import SimpleNamespace

import numpy as np
import pytest

torch = pytest.importorskip('torch')

from ember_rl import duel
from ember_rl.general_env import EpisodeSpec, SpecSource, write_specs

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
TINY = ['--backend', 'ember', '--ember-env', 'fake', '--slots', '8', '--device', DEVICE, '--d-model', '32',
        '--heads', '2', '--encoder-layers', '1', '--decoder-layers', '1', '--cnn-channels', '16', '--cnn-layers', '2',
        '--objective', 'health_score', '--standing-weight', '.5', '--time-unit', 'round', '--gamma', '1',
        '--max-rounds', '3', '--log-seconds', '1', '--hours', '0.2']
PPO = ['--rollout', '64', '--minibatch', '32', '--micro-batch', '16', '--epochs', '1', '--eval-episodes', '2']
SEARCH = ['--search', 'k=2,seeds=2,horizon=turns:1,tau=0.1,scratch=64']
GATED_SEARCH = ['--schedule', 'gated', '--dev-every', '128', '--dev-episodes', '4', '--min-phase-decisions', '0',
                '--gate-threshold', '-1', '--eval-slot-fraction', '.5', '--eval-every', '1000', '--search-prob', '1']
TRIO = ('guy', 'elion', 'curogana')


def rows(path, name='metrics.jsonl'):
    return [json.loads(line) for line in (path / name).read_text().splitlines()]


def catalog_rows(parties=(TRIO, ('guy', 'elion'), ('guy',)), families=('generated', 'fixed', 'mausoleum'), train=4, dev=2):
    """Rows like the run catalogs: party, roster, map (its family), native p and split."""
    def map_of(family, k):
        if family == 'fixed':
            return ['vault', 'room_12x10'][k % 2]
        if family == 'generated':
            return dict(name=f'gen-open-v2-{k:06d}', rows=['...'], ember=dict(family='open', generator='open/v2'))
        return dict(name=f'mausoleum-room{k}', rows=['...'], ember=dict(family='hand', hand_made=True))
    out = []
    for party in parties:
        for family in families:
            for split, count in (('train', train), ('dev', dev)):
                for k in range(count):
                    out.append(dict(id=f'{family}-{"+".join(party)}-{split}-{k}', split=split, party=list(party),
                                    roster=['zombie', 'ghoul', 'wight'][:1 + k % 3], map=map_of(family, k), p=.5,
                                    truncation=0., tier='S'))
    return out


def write_catalog(path, items):
    path.write_text(''.join(json.dumps(r) + '\n' for r in items))
    return path


# --------------------------------------------------------------------------- A: the search opponent

def _record_search_roots(monkeypatch):
    """Record, for every root a training search receives: the schedule's view of the other team in that game
    (its controller key and model) and what the forks got (Root.controllers, Root.models)."""
    from ember_rl.general_duel import GeneralTrainer
    from ember_rl.search import Lookahead
    holder, seen = {}, []
    original_learner, original_search = GeneralTrainer.search_learner, Lookahead.search

    def learner(self, team, live, index, sub):
        holder['trainer'] = self
        return original_learner(self, team, live, index, sub)

    def search(self, env, roots, explore=False):
        trainer = holder['trainer']
        for root in roots:
            other = duel.OTHER[root.team]
            key = trainer.slot_state[root.slot]['controllers'][other]
            game_model = None if key[0] == 'native' else trainer.policies.model_for(key)
            seen.append(dict(team=root.team, key=key, game_model=game_model, fork_model=root.models[other],
                             controllers=root.controllers, trainer=trainer))
        return original_search(self, env, roots, explore=explore)

    monkeypatch.setattr(GeneralTrainer, 'search_learner', learner)
    monkeypatch.setattr(Lookahead, 'search', search)
    return seen


def test_mixed_search_opponent_draws_the_games_opponent_or_native_per_search(tmp_path, monkeypatch):
    """--search-opponent mixed on the gated schedule: every search plays its forks either against the phase's
    frozen opponent (the game's controllers, as `game`) or against the native AI (as `native`); the progress
    rows log the probability and the realised shares."""
    seen = _record_search_roots(monkeypatch)
    out = tmp_path / 'mixed'
    duel.main(['--output', str(out), '--max-updates', '4', '--search-opponent', 'mixed', '--search-trained-prob', '.5',
               *GATED_SEARCH, *SEARCH, *PPO, *TINY])
    assert seen
    trained = [r for r in seen if r['controllers'] is None]
    native = [r for r in seen if r['controllers'] is not None]
    assert trained and native
    for r in trained:       # the frozen opponent of the phase: the other team's selected policy
        assert r['key'][0] == 'frozen' and r['fork_model'] is r['game_model'] is r['key'][2]
    for r in native:
        other = duel.OTHER[r['team']]
        assert r['controllers'] == {r['team']: 'external', other: 'native'} and r['fork_model'] is None
    progress = [r['search']['opponent'] for r in rows(out, 'metrics.jsonl') if r['type'] == 'progress' and 'search' in r]
    assert progress and all(o['mode'] == 'mixed' for o in progress)
    counted = [o for o in progress if 'trained_fraction' in o]
    assert counted and all(set(o['p'].values()) <= {.5} for o in counted)
    total = {k: sum(o.get(t, {}).get(k, 0) for o in counted for t in duel.TEAMS) for k in ('trained', 'native')}
    assert total['trained'] > 0 and total['native'] > 0
    assert 0 < sum(o['trained_fraction'] for o in counted) / len(counted) < 1


@pytest.mark.parametrize('prob, kind', [('1', 'trained'), ('0', 'native')])
def test_mixed_search_opponent_at_its_ends_is_game_or_native(tmp_path, monkeypatch, prob, kind):
    seen = _record_search_roots(monkeypatch)
    out = tmp_path / kind
    duel.main(['--output', str(out), '--max-updates', '2', '--search-opponent', 'mixed', '--search-trained-prob', prob,
               *GATED_SEARCH, *SEARCH, *PPO, *TINY])
    assert seen and all((r['controllers'] is None) == (kind == 'trained') for r in seen)
    counted = [r['search']['opponent'] for r in rows(out, 'metrics.jsonl')
               if r['type'] == 'progress' and 'trained_fraction' in r.get('search', {}).get('opponent', {})]
    assert counted and all(o['trained_fraction'] == (1. if kind == 'trained' else 0.) for o in counted)


def test_search_trained_opponent_is_the_league_opponent_of_the_game(tmp_path, monkeypatch):
    """League runs: the trained opponent in the forks is the league member drawn for that game; a game against
    the native AI (--league-native) is searched against the native AI whatever the draw."""
    seen = _record_search_roots(monkeypatch)
    out = tmp_path / 'league'
    duel.main(['--output', str(out), '--max-updates', '8', '--search-opponent', 'mixed', '--search-trained-prob', '1',
               '--league', '--league-size', '3', '--league-latest', '.3', '--league-native', '.3',
               *GATED_SEARCH, *SEARCH, *PPO, *TINY])
    policies = [r for r in seen if r['key'][0] != 'native']
    natives = [r for r in seen if r['key'][0] == 'native']
    assert policies and natives
    for r in policies:
        assert r['key'][1].startswith('opp:') and r['fork_model'] is r['key'][2] and r['controllers'] is None
    assert all(r['fork_model'] is None and r['controllers'] is None for r in natives)
    assert len({id(r['fork_model']) for r in policies}) > 1         # more than one league opponent was searched
    counted = [r['search']['opponent'] for r in rows(out, 'metrics.jsonl') if r['type'] == 'progress' and 'search' in r]
    assert sum(o.get(t, {}).get('native_game', 0) for o in counted for t in duel.TEAMS) > 0
    assert sum(o.get(t, {}).get('native', 0) for o in counted for t in duel.TEAMS) == 0


def test_search_trained_opponent_is_the_other_learner_in_simultaneous_games(tmp_path, monkeypatch):
    seen = _record_search_roots(monkeypatch)
    out = tmp_path / 'simul'
    duel.main(['--output', str(out), '--max-updates', '4', '--schedule', 'simultaneous', '--self-play-prob', '1',
               '--search-opponent', 'mixed', '--search-trained-prob', '1', '--search-prob', '1',
               '--eval-slot-fraction', '.5', '--eval-every', '1000', *SEARCH, *PPO, *TINY])
    assert {r['team'] for r in seen} == set(duel.TEAMS)
    for r in seen:
        other = duel.OTHER[r['team']]
        assert r['key'] == ('learner', other) and r['controllers'] is None
        assert r['fork_model'] is r['trainer'].policies.learner[other]


def test_search_trained_prob_schedule_fades_the_native_ai_out():
    from ember_rl.general_duel import GeneralTrainer
    args = SimpleNamespace(search_trained_prob=.2, search_trained_prob_final=1., search_trained_prob_decisions=1000,
                           search_start_decisions=500)
    stub = SimpleNamespace(args=args, search_since={'heroes': 500}, decisions=dict(heroes=500, monsters=0))
    p = lambda team: GeneralTrainer.search_trained_prob(stub, team)
    assert p('heroes') == pytest.approx(.2)
    stub.decisions['heroes'] = 1000
    assert p('heroes') == pytest.approx(.6)
    stub.decisions['heroes'] = 5000
    assert p('heroes') == pytest.approx(1.)
    assert p('monsters') == pytest.approx(.2)          # not searching yet: the start value
    args.search_trained_prob_final = None               # no final value: constant
    assert p('heroes') == pytest.approx(.2)
    args.search_trained_prob_final, args.search_trained_prob_decisions = .9, 0
    assert p('heroes') == pytest.approx(.9)
    with pytest.raises(SystemExit):
        duel.main(['--output', 'unused', '--search-opponent', 'mixed', '--search-trained-prob', '1.5', *SEARCH, *PPO, *TINY])




# --------------------------------------------------------------------------- C: the fixed spec lists

def test_strict_specs_refuses_short_or_single_family_lists(tmp_path, capsys):
    """--strict-specs: a development or evaluation list shorter than the episodes asked for, or without a game on
    a map family that training draws, stops the run before it starts; without the flag it is a warning."""
    catalog = write_catalog(tmp_path / 'catalog.jsonl', catalog_rows())
    source = SpecSource(catalog_rows(), family_weights=dict(generated=.6, fixed=.25, mausoleum=.15))
    sampling = ['--catalog', str(catalog), '--family-weights', 'generated=.6,fixed=.25,mausoleum=.15',
                '--min-cell-episodes', '1', '--schedule', 'gated']
    # The lists this run would write itself: 18 games over all three families.
    good = tmp_path / 'good'
    duel.main(['--output', str(good), '--specs-only', '--strict-specs', '--dev-episodes', '18', '--eval-episodes', '18',
               *sampling, *TINY])
    families = Counter(source.meta[json.loads(line)['encounter']]['family']
                       for line in (good / 'dev-specs.jsonl').read_text().splitlines())
    assert set(families) == {'generated', 'fixed', 'mausoleum'} and sum(families.values()) == 18
    files = ['--dev-specs', str(good / 'dev-specs.jsonl'), '--eval-specs', str(good / 'eval-specs.jsonl')]
    duel.main(['--output', str(tmp_path / 'check'), '--specs-only', '--strict-specs', '--dev-episodes', '18',
               '--eval-episodes', '18', *files, *sampling, *TINY])
    # Asked for more than the files hold: refused.
    with pytest.raises(SystemExit, match='strict-specs'):
        duel.main(['--output', str(tmp_path / 'short'), '--specs-only', '--strict-specs', '--dev-episodes', '32',
                   '--eval-episodes', '18', *files, *sampling, *TINY])
    # One family only (what 32 default specs gave on 2026-11-22): a warning, and refused when strict.
    one = tmp_path / 'one.jsonl'
    generated = [e for e in sorted(source.rows) if source.meta[e]['family'] == 'generated' and '-dev-' in e]
    write_specs(one, [EpisodeSpec(generated[k % len(generated)], k, k + 1, k + 2, 0, 0) for k in range(18)])
    single = ['--dev-specs', str(one), '--eval-specs', str(one), '--dev-episodes', '18', '--eval-episodes', '18']
    capsys.readouterr()
    duel.main(['--output', str(tmp_path / 'warned'), '--specs-only', *single, *sampling, *TINY])
    printed = capsys.readouterr().out
    assert "WARNING: the dev list has no game on map families ['fixed', 'mausoleum']" in printed
    coverage = json.loads((tmp_path / 'warned' / 'specs-coverage.json').read_text())
    assert coverage['missing_families'] == dict(eval=['fixed', 'mausoleum'], dev=['fixed', 'mausoleum'])
    with pytest.raises(SystemExit, match="map families without games"):
        duel.main(['--output', str(tmp_path / 'refused'), '--max-updates', '1', '--strict-specs', *single, *sampling,
                   *PPO, *TINY])
    assert not (tmp_path / 'refused' / 'checkpoint.pt').exists()


# --------------------------------------------------------------------------- D: the gate relative to the baseline

def test_paired_gate_statistic():
    stub = SimpleNamespace(args=SimpleNamespace(gate_margin=0., gate_margin_heroes=None, gate_margin_monsters=.05,
                                                gate_z=1.645),
                           per_team=lambda name, team: duel.Trainer.per_team(stub, name, team))
    gate = lambda diff, team='heroes': duel.Trainer.paired_gate(stub, diff, team)
    # 512 games, per-game sd 0.54: the standard error of the rate is 0.0239, so +4.0 points pass and +3.5 do not.
    diff = lambda rate, n=512, sd=.54: dict(n=n, win_rate=rate, wins_se=round(sd * math.sqrt(n), 2))
    assert gate(diff(.040))['passed'] and not gate(diff(.035))['passed']
    assert gate(diff(.040))['statistic'] == pytest.approx(.040 / (round(.54 * math.sqrt(512), 2) / 512), abs=1e-3)
    assert not gate(diff(0.))['passed'] and not gate(diff(-.1))['passed']
    # Per team: the monsters' margin of 5 points moves the bar.
    assert not gate(diff(.08), 'monsters')['passed'] and gate(diff(.09), 'monsters')['passed']
    assert gate(diff(.08), 'monsters')['margin'] == .05
    # Identical paired results (no spread): the sign of the difference against the margin decides.
    assert gate(dict(n=8, win_rate=.25, wins_se=0.))['passed'] and not gate(dict(n=8, win_rate=0., wins_se=0.))['passed']
    assert not gate(None)['passed'] and not gate(dict(n=1, win_rate=1., wins_se=None))['passed']


@pytest.mark.parametrize('margin, reason', [('-1', 'development_gate'), ('1', 'training_budget')])
def test_paired_gate_rule_replaces_the_absolute_threshold(tmp_path, margin, reason):
    """--gate-rule paired: the absolute threshold (1 = unreachable here) is not consulted; a candidate passes on
    its paired difference to the phase's baseline (margin -1: always; margin 1: never, the budget ends the phase)."""
    out = tmp_path / 'paired'
    duel.main(['--output', str(out), '--schedule', 'gated', '--gate-rule', 'paired', '--gate-margin', margin,
               '--gate-z', '0', '--gate-threshold', '1', '--dev-every', '64', '--dev-episodes', '6',
               '--min-phase-decisions', '0', '--phase-budget', '128', '--eval-slot-fraction', '.5',
               '--eval-every', '1000', '--max-updates', '8', *PPO, *TINY])
    log = rows(out)
    candidates = [r for r in log if r['type'] == 'dev' and r['label'] != 'baseline']
    assert candidates
    for d in candidates:
        test = d['gate_test']
        assert test['rule'] == 'paired' and test['margin'] == float(margin) and test['n'] == d['paired_diff']['n']
        assert d['gate'] == test['passed'] == (margin == '-1')
    assert all('gate_test' not in r for r in log if r['type'] == 'dev' and r['label'] == 'baseline')
    phases = [r for r in log if r['type'] == 'phase']
    assert phases and all(p['reason'] == reason for p in phases)


def test_absolute_gate_rows_are_unchanged_by_default(tmp_path):
    out = tmp_path / 'absolute'
    duel.main(['--output', str(out), '--schedule', 'gated', '--gate-threshold', '-1', '--dev-every', '64',
               '--dev-episodes', '4', '--min-phase-decisions', '0', '--eval-slot-fraction', '.5', '--eval-every', '1000',
               '--max-updates', '4', *PPO, *TINY])
    devs = [r for r in rows(out) if r['type'] == 'dev']
    assert devs and all('gate_test' not in r for r in devs)
    assert all(r['gate'] for r in devs if r['label'] != 'baseline')


# --------------------------------------------------------------------------- E: the learner-balance target

def lopsided_balance(target=None, **kwargs):
    """Two cells (parties), six train rows each; the heroes win 80% on half of each cell's rows and 55% on the rest."""
    from ember_rl.balance import LearnerBalance
    source = SpecSource(catalog_rows(parties=(TRIO, ('guy',)), families=('fixed',), train=6, dev=1),
                        party_weights={'*': 1.})
    balance = LearnerBalance(source, floor=.25, window=10_000, prior=0., refresh=10_000, target=target, **kwargs)
    rng = random.Random(0)
    truth = {}
    for i, e in enumerate(source.train_encounters()):
        truth[e] = .8 if i % 2 else .55
        for _ in range(400):
            balance.observe('monsters', e, float(rng.random() < truth[e]))
    return source, balance, truth


def test_balance_target_steers_the_expected_result_within_cells():
    source, plain, truth = lopsided_balance()
    p, w, t = plain.row_weights('monsters')
    assert t == 0. and plain.expected(p, w) > .64               # the symmetric weights leave the heroes at 65%
    assert 'target' not in plain.report('monsters')
    source, balance, truth = lopsided_balance(target=.4)        # the monster learner should win 40%: heroes 60%
    key, weights = balance.weights('monsters')
    p, w, t = balance.row_weights('monsters')
    assert t < 0 and balance.expected(p, w) == pytest.approx(.6, abs=1e-3)
    report = balance.report('monsters')
    assert report['goal'] == pytest.approx(.6) and report['expected_p'] == pytest.approx(.6, abs=1e-3)
    assert report['uniform_p'] == pytest.approx(np.mean(list(truth.values())), abs=.03) and report['tilt'] == round(t, 4)
    # The draws follow: the realised hero result is the goal, and each cell (party) keeps its half of the games.
    rng = random.Random(1)
    draws = [source.sample_train(rng, (key, weights)).encounter for _ in range(20_000)]
    assert np.mean([truth[e] for e in draws]) == pytest.approx(.6, abs=.02)
    by_party = Counter(source.meta[e]['party'] for e in draws)
    assert all(abs(n / len(draws) - .5) < .02 for n in by_party.values())
    assert balance.weight_of(.55, 'monsters') > balance.weight_of(.8, 'monsters')
    # The heroes' table has its own goal (their target directly); self-play aims at an even game.
    assert balance.goal('heroes') == .4 and balance.goal('both') == .5
    # A goal out of reach stops at the tilt limit: the closest rows the catalog has.
    source, capped, _ = lopsided_balance(target=.9, tilt_max=2.)
    p, w, t = capped.row_weights('monsters')
    assert t == -2. and .55 < capped.expected(p, w) < .65


def test_balance_target_run_logs_tilt_and_expected_result(tmp_path):
    catalog = write_catalog(tmp_path / 'catalog.jsonl', catalog_rows())
    out = tmp_path / 'target'
    argv = ['--output', str(out), '--max-updates', '4', '--learner-balance', '--balance-target', '.5',
            '--balance-refresh', '4', '--catalog', str(catalog), '--family-weights', 'generated=.6,fixed=.25,mausoleum=.15',
            '--schedule', 'gated', '--dev-every', '64', '--dev-episodes', '9', '--min-cell-episodes', '1',
            '--min-phase-decisions', '0', '--eval-slot-fraction', '.5', '--eval-every', '1000', *PPO, *TINY,
            '--eval-episodes', '9']
    duel.main(argv)
    progress = [r['balance'] for r in rows(out) if r['type'] == 'progress' and r['balance']['decisions']]
    assert progress and all(b['sampling'] == 'learner' for b in progress)
    table = progress[-1]['table']
    assert table['target'] == .5 and table['goal'] == .5 and abs(table['tilt']) <= 6 and 0 <= table['expected_p'] <= 1
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'x'), '--balance-target', '.5', *PPO, *TINY])      # needs --learner-balance
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'y'), '--learner-balance', '--balance-target', '1.2', *PPO, *TINY])


def test_balance_fit_recovers_from_a_diverged_warm_start():
    """The logistic fit of a learner table once ran away (coefficients of 1e9, every row's fitted estimate 1.0)
    and its warm start kept it there. A diverged fit is now refitted from zero with damped steps."""
    from ember_rl.balance import LearnerBalance
    source = SpecSource(catalog_rows(parties=(TRIO, ('guy',)), families=('fixed', 'generated'), train=6, dev=1))
    balance = LearnerBalance(source, prior=8., refresh=64, min_fit=64)
    rng = random.Random(3)
    encounters = source.train_encounters()
    for _ in range(256):
        e = rng.choice(encounters)
        balance.observe('monsters', e, float(rng.random() < (.75 if 'guy+elion' in e else .55)))
    healthy = np.array(balance.coef['monsters'])
    assert np.abs(healthy).max() < 5
    balance.coef['monsters'] = (healthy + 2.75e9).tolist()          # what the checkpoint of the run held
    assert np.mean([balance.fitted('monsters', e) for e in encounters]) > .99
    for _ in range(64):
        e = rng.choice(encounters)
        balance.observe('monsters', e, float(rng.random() < (.75 if 'guy+elion' in e else .55)))
    coef = np.array(balance.coef['monsters'])
    assert np.all(np.isfinite(coef)) and np.abs(coef).max() < 5
    fitted = {e: balance.fitted('monsters', e) for e in encounters}
    trio = np.mean([v for e, v in fitted.items() if 'guy+elion' in e])
    solo = np.mean([v for e, v in fitted.items() if 'guy+elion' not in e])
    assert .6 < trio < .9 and .4 < solo < .7 and trio > solo
    # The damped fit alone reaches the same answer as the plain one on healthy data.
    idx = np.array([i for i, _ in balance.games['monsters']])
    y = np.array([r for _, r in balance.games['monsters']])
    reg = np.eye(balance.x.shape[1])
    reg[-1, -1] = 0.
    assert np.allclose(balance._damped_fit(balance.x[idx], y, reg), coef, atol=1e-3)
