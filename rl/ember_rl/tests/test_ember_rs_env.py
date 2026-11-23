"""The real environment: ember_rs.BatchEnv (ember-rs stage G6) against the BatchEnv contract.

Needs the `ember_rs` module (ember-rs `ember-py`, `maturin develop --release` into the
torch venv); skipped without it. The tape round trip also needs the `ember` binary
(EMBER_BIN, default engine/target/release/ember).
"""
import os
import random
import re
import subprocess
from pathlib import Path

import numpy as np
import pytest

ember_rs = pytest.importorskip('ember_rs')

from ember_rl.general_env import (  # noqa: E402
    DEFAULT_DIMS, FEATURE_VERSION, TEAMS, VALUE_INPUTS, BatchEnv, EpisodeSpec, SpecSource, check_contract, encounter_units,
    info_row, normalize_dims, validate_info, validate_obs,
)

EXTERNAL = {'heroes': 'external', 'monsters': 'external'}
NATIVE = {'heroes': 'native', 'monsters': 'native'}
MAPS = ('vault', 'room_12x10', 'two_rooms_24x18', 'hall_32x32')
EMBER_BIN = Path(os.environ.get('EMBER_BIN', Path(__file__).resolve().parents[3] / 'engine/target/release/ember'))


def make(n, **kw):
    kw.setdefault('threads', 4)
    return ember_rs.BatchEnv(n_slots=n, **kw)


def rows_by(env):
    return {r['id']: r for r in env.catalog}


def spec_for(encounter, k, offset=-1):
    rng = random.Random(f'{encounter}:{k}')
    return EpisodeSpec(encounter, 0, rng.randrange(2**31), rng.randrange(2**31), offset, offset)


def controller_forms(row, k):
    """Team forms, plus per-creature forms by index and by unit id."""
    units = encounter_units(row)
    forms = [EXTERNAL, dict(heroes='external', monsters='native'), dict(heroes='native', monsters='external'),
             dict(NATIVE, external_units=[k % len(units)]),
             dict(NATIVE, external_units=[units[-1 - k % len(units)]['id']]),
             dict(heroes='external', monsters='native', external_units=[len(units) - 1])]
    return forms[k % len(forms)]


def play(env, slots, rng, *, check=True, scores=True, max_calls=10_000):
    """Uniform rows until every slot is done; validates every observation and info."""
    finals = {}
    for _ in range(max_calls):
        info = env.info(slots)
        live = [s for i, s in enumerate(slots) if not info['done'][i]]
        if not live:
            break
        obs = env.observe(live)
        if check:
            validate_obs(obs, env.dims, scores=scores)
        legal = obs['cand_mask'].sum(1)
        rows = np.array([rng.integers(0, n) for n in legal], np.int32)
        out = env.step(live, rows)
        if check:
            validate_info(out, len(live))
    else:
        raise AssertionError('games did not end')
    info = env.info(slots)
    for i, s in enumerate(slots):
        finals[s] = info_row(info, i)
        if check:
            for team in (0, 1):
                validate_obs(env.observe([s], team=[team]), env.dims, live=[False], scores=scores)
    return finals


@pytest.mark.parametrize('version', ['ember-gen-v1', 'ember-gen-v2', 'ember-gen-v3'])
@pytest.mark.parametrize('moves', ['step', 'dest'])
def test_critic_observation_matches_active_and_final_views(version, moves):
    env = make(2, feature_version=version, moves=moves, max_steps=1)
    env.reset([0, 1], [spec_for('vault-undead-skel3', k) for k in range(2)], [EXTERNAL] * 2)
    snapshot = env.snapshot(0)
    full = env.observe([0, 1])
    legal = full['cand_mask'].sum(axis=1)
    before = env.describe(0)
    with pytest.raises(ValueError):
        env.step([0, 1], [0, int(legal[1])])
    assert env.describe(0) == before
    assert env.step([0], [0])['truncated'][0]
    actor_team = int(env.info([1])['team'][0])
    slots, teams = [1, 0, 1, 0], [actor_team, 0, actor_team, 1]
    full = env.observe(slots, team=teams)
    values = env.observe_value(slots, team=teams)
    assert set(values) == set(VALUE_INPUTS).intersection(full)
    for name, actual in values.items():
        np.testing.assert_array_equal(actual, full[name])
    with pytest.raises(ValueError):
        env.observe_value([1], team=[1 - actor_team])
    env.restore(0, snapshot, dice_seed=93)
    assert env.describe(0) == before
    full = env.observe([0])
    for name, actual in env.observe_value([0]).items():
        np.testing.assert_array_equal(actual, full[name])


def test_module_contract():
    env = make(2)
    assert isinstance(env, BatchEnv)
    check_contract(env)
    assert ember_rs.FEATURE_VERSION == FEATURE_VERSION == env.feature_version
    assert normalize_dims(ember_rs.DIMS) == normalize_dims(DEFAULT_DIMS) == normalize_dims(env.dims)
    assert env.n_slots == 2 and env.scores and env.objective == 'health_score' and env.max_rounds == 30
    assert len(env.catalog) == 144 and {r['map'] for r in env.catalog} == set(MAPS)
    pool = ember_rs.ContentPool(['content/srd'])
    assert {'guy', 'elion', 'curogana', 'mara', 'ilyra'} <= set(pool.heroes) and 'wight' in pool.monsters
    with pytest.raises(ValueError):
        ember_rs.ContentPool(['/nonexistent/pack'])
    with pytest.raises(ValueError):
        make(2, objective='elimination')


@pytest.mark.parametrize('scores', [True, False])
def test_contract_on_every_map_party_and_controller_form(scores):
    env = make(48, scores=scores, threads=6)
    by = rows_by(env)
    picks = []
    for m in MAPS:
        for party in ('undead', 'level2'):
            ids = sorted(i for i, r in by.items() if r['map'] == m and i.split('-')[1] == party)
            picks += ids[:6]
    specs = [spec_for(e, k, offset=-1 if k % 2 else 0) for k, e in enumerate(picks)]
    ctrls = [controller_forms(by[e], k) for k, e in enumerate(picks)]
    info = env.reset(range(len(picks)), specs, ctrls)
    validate_info(info, len(picks))
    finals = play(env, list(range(len(picks))), np.random.default_rng(3), scores=scores)
    for f in finals.values():
        assert f['done'] and (f['terminated'] != f['truncated'])
        assert f['task_end'] in ('native', 'health') or f['truncated']
    for s, e in enumerate(picks):
        units = env.units(s)
        assert [u[0] for u in units] == [u['id'] for u in encounter_units(by[e])]


def test_per_creature_control_surfaces_only_that_creature():
    env = make(16)
    by = rows_by(env)
    ids = sorted(by)[::9][:16]
    specs = [spec_for(e, 7) for e in ids]
    ks = [k % len(encounter_units(by[e])) for k, e in enumerate(ids)]
    env.reset(range(16), specs, [dict(NATIVE, external_units=[k]) for k in ks])
    seen = {s: set() for s in range(16)}
    rng = np.random.default_rng(0)
    for _ in range(5000):
        info = env.info(range(16))
        live = [s for s in range(16) if not info['done'][s]]
        if not live:
            break
        obs = env.observe(live)
        for i, s in enumerate(live):
            seen[s].add(int(obs['actor'][i]))
            assert int(env.info([s])['actor'][0]) == ks[s]
        env.step(live, [rng.integers(0, int(m.sum())) for m in obs['cand_mask']])
    assert all(seen[s] <= {ks[s]} for s in range(16)) and sum(map(len, seen.values())) >= 8
    for s in range(16):
        assert [u[3] for u in env.units(s)].count(True) == 1
    with pytest.raises(ValueError):
        env.reset([0], specs[:1], [dict(NATIVE, external_units=[24])])
    with pytest.raises(ValueError):
        env.reset([0], specs[:1], [dict(NATIVE, external_units=['dragon-1'])])
    with pytest.raises(ValueError):
        env.reset([0], specs[:1], [dict(NATIVE, other=[1])])


def test_native_choice_equals_native_play():
    """External creatures that always take native_choice play the all-native game."""
    env = make(24)
    by = rows_by(env)
    ids = sorted(by)[::6][:8]
    specs = [spec_for(e, 11) for e in ids]
    native = env.reset(range(8), specs, [NATIVE] * 8)
    assert native['done'].all() and native['reset_terminal'].all()
    forms = [EXTERNAL, dict(NATIVE, external_units=[0]), dict(heroes='native', monsters='external', external_units=[1])]
    for j, form in enumerate(forms):
        slots = list(range(8 + 8 * (j % 2), 16 + 8 * (j % 2)))
        env.reset(slots, specs, [form] * 8)
        while True:
            info = env.info(slots)
            live = [s for i, s in enumerate(slots) if not info['done'][i]]
            if not live:
                break
            obs = env.observe(live)
            env.step(live, np.asarray(obs['native_choice'], np.int32))
        final = env.info(slots)
        for key in ('terminated', 'truncated', 'task_end', 'winner', 'round', 'score'):
            assert np.array_equal(final[key], native[key]), (form, key)


def test_snapshot_restore_and_reseed():
    env = make(4)
    spec = spec_for('two_rooms_24x18-level2-ghoul1_skel2', 2)
    env.reset([0], [spec], [EXTERNAL])
    rng = np.random.default_rng(5)
    for _ in range(10):
        obs = env.observe([0])
        env.step([0], [rng.integers(0, int(obs['cand_mask'][0].sum()))])
    snap = env.snapshot(0)
    assert snap.encounter == spec.encounter and snap.steps == 10

    def continue_from(slot, seed=None, rows_seed=9):
        env.restore(slot, snap, dice_seed=seed)
        assert env.info([slot])['forced'][0] == 0
        r = np.random.default_rng(rows_seed)
        trace = []
        while not env.info([slot])['done'][0]:
            obs = env.observe([slot])
            trace.append((obs['creatures'].copy(), obs['cands'].copy(), obs['native_raw'].copy()))
            env.step([slot], [r.integers(0, int(obs['cand_mask'][0].sum()))])
        return trace, {k: v.copy() for k, v in env.info([slot]).items()}

    a, fa = continue_from(1)
    b, fb = continue_from(2)
    assert len(a) == len(b) and all(all(np.array_equal(x, y, equal_nan=True) for x, y in zip(p, q)) for p, q in zip(a, b))
    assert all(np.array_equal(fa[k], fb[k]) for k in fa)
    c, fc = continue_from(1, seed=123)
    d, fd = continue_from(2, seed=123)
    assert all(np.array_equal(fc[k], fd[k]) for k in fc) and len(c) == len(d)
    outcomes = {tuple(continue_from(3, seed=s)[1]['score'].tolist()) + (len(continue_from(3, seed=s)[0]),) for s in range(6)}
    assert len(outcomes) > 1      # reseeded continuations differ
    assert env.describe(0) and env.describe(0)[-1] == 'end_turn'


def _native_play(env, slots):
    """Native-choice rows until every slot is done; returns (team of each surfaced decision, final info)."""
    teams = []
    while True:
        info = env.info(slots)
        live = [s for i, s in enumerate(slots) if not info['done'][i]]
        if not live:
            return teams, {k: v.copy() for k, v in info.items()}
        obs = env.observe(live)
        teams += env.info(live)['team'].tolist()
        env.step(live, np.asarray(obs['native_choice'], np.int32))


def test_fork_copies_reseeds_and_switches_controllers(tmp_path):
    """BatchEnv.fork (search): a batched, reseeded restore, also from another env; a native team
    switched to external that plays the native choice plays the native game; errors change nothing."""
    env = make(16)
    specs = [spec_for('two_rooms_24x18-level2-ghoul1_skel2', 3), spec_for('vault-undead-skel3', 1)]
    heroes_only = dict(heroes='external', monsters='native')
    env.reset([0, 1], specs, [heroes_only] * 2)
    for _ in range(2):
        live = [s for s in (0, 1) if not env.info([s])['done'][0]]
        env.step(live, np.asarray(env.observe(live)['native_choice'], np.int32))
    assert not env.info([0, 1])['done'].any()
    info = env.fork([0, 0, 1], [2, 3, 4], dice_seeds=[7, 8, 7])
    validate_info(info, 3)
    assert not info['done'].any() and (info['forced'] == 0).all() and (info['native_actions'] == 0).all()
    env.restore(5, env.snapshot(0), dice_seed=7)
    env.restore(6, env.snapshot(1), dice_seed=7)
    _, a = _native_play(env, [2, 4])
    _, b = _native_play(env, [5, 6])
    assert all(np.array_equal(a[k], b[k]) for k in a)
    # without seeds a fork continues the same dice stream
    env.fork([0], [7])
    _, c = _native_play(env, [7])
    env.restore(8, env.snapshot(0))
    _, d = _native_play(env, [8])
    assert all(np.array_equal(c[k], d[k]) for k in c)
    # from another env
    other = make(4)
    other.fork([0, 1], [0, 1], dice_seeds=[7, 7], source=env)
    _, e = _native_play(other, [0, 1])
    assert all(np.array_equal(e[k], a[k]) for k in a)
    # monsters modeled externally: their decisions surface, native-choice play is the native game
    env.fork([0], [9], dice_seeds=[7], controllers=[dict(heroes='external', monsters='external')])
    teams, f = _native_play(env, [9])
    assert 1 in teams and all(np.array_equal(f[k], a[k][:1]) for k in a if k not in ('forced', 'native_actions'))
    with pytest.raises(Exception):
        env.record(9, tmp_path / 'switched.jsonl')
    env.record(2, tmp_path / 'forked.jsonl')
    # errors change nothing
    before = env.info(range(10))
    for call in (lambda: env.fork([0], [0]),                                  # source and target
                 lambda: env.fork([0, 1], [10, 10]),                         # duplicate targets
                 lambda: env.fork([11], [12]),                               # never reset
                 lambda: env.fork([0, 1], [10, 11], dice_seeds=[1]),         # seeds per target
                 lambda: env.fork([0], [10], dice_seeds=[-1]),
                 lambda: env.fork([0], [10], controllers=[dict(heroes='native', monsters='native')]),  # actor must stay external
                 lambda: env.fork([0], [16])):
        with pytest.raises(ValueError):
            call()
    after = env.info(range(10))
    assert all(np.array_equal(before[k], after[k]) for k in before)
    with pytest.raises(ValueError):
        env.info([10])                                                       # still never reset


def test_invalid_calls_raise_and_change_nothing():
    env = make(6)
    specs = [spec_for('vault-undead-skel3', k) for k in range(6)]
    env.reset(range(6), specs, [EXTERNAL] * 6)
    before = {k: v.copy() for k, v in env.info(range(6)).items()}
    desc = [env.describe(s) for s in range(6)]
    obs = env.observe(range(6))
    legal = obs['cand_mask'].sum(1).astype(np.int32)
    good = np.zeros(6, np.int32)
    for bad_rows in (np.where(np.arange(6) == 3, legal, good), np.where(np.arange(6) == 5, -1, good),
                     np.where(np.arange(6) == 0, 10_000, good)):
        with pytest.raises(ValueError):
            env.step(range(6), bad_rows)
    with pytest.raises(ValueError):
        env.step([0, 0], [0, 0])
    with pytest.raises(ValueError):
        env.step([0, 9], [0, 0])
    with pytest.raises(ValueError):
        env.reset([0, 1], [specs[0], EpisodeSpec('no-such-encounter', 0, 0, 0)], [EXTERNAL] * 2)
    with pytest.raises(ValueError):
        env.observe([0], team=[1 - int(before['team'][0])])
    after = env.info(range(6))
    assert all(np.array_equal(before[k], after[k]) for k in before)
    assert [env.describe(s) for s in range(6)] == desc
    # a done slot: step raises, observe needs a team
    env.reset([0], [spec_for('vault-undead-skel3', 0)], [NATIVE])
    assert env.info([0])['done'][0]
    with pytest.raises(ValueError):
        env.step([0], [0])
    with pytest.raises(ValueError):
        env.observe([0])
    with pytest.raises(ValueError):
        make(2).info([0])     # never reset


def test_step_cap_horizon_and_objectives():
    for objective in ('health_score', 'native'):
        env = make(8, objective=objective, max_rounds=2, max_steps=10_000)
        specs = [spec_for('hall_32x32-undead-ghast1', k) for k in range(8)]
        env.reset(range(8), specs, [EXTERNAL] * 8)
        # End Turn at every decision: nobody dies unless natively, the round cap decides
        while True:
            info = env.info(range(8))
            live = [s for s in range(8) if not info['done'][s]]
            if not live:
                break
            obs = env.observe(live)
            env.step(live, obs['cand_mask'].sum(1).astype(np.int32) - 1)
        info = env.info(range(8))
        for s in range(8):
            row = info_row(info, s)
            if row['task_end'] == 'native':
                continue
            assert row['round'] == 3 and row['winner'] is None
            assert row['terminated'] == (objective == 'health_score') and row['truncated'] == (objective == 'native')
    env = make(2, max_steps=3)
    env.reset([0, 1], [spec_for('room_12x10-level2-zomb2', k) for k in range(2)], [EXTERNAL] * 2)
    finals = play(env, [0, 1], np.random.default_rng(2))
    assert all(f['truncated'] and not f['terminated'] and f['task_end'] is None for f in finals.values())


def test_threads_and_batch_composition_do_not_change_games():
    def run(threads, order):
        env = make(8, threads=threads)
        specs = [spec_for(e, 4) for e in ('vault-undead-skel6', 'hall_32x32-level2-skel3', 'room_12x10-undead-ghoul3',
                                         'two_rooms_24x18-undead-mix_ghast_2ghoul')]
        env.reset(order, specs, [EXTERNAL] * 4)
        digests = []
        for _ in range(60):
            info = env.info(order)
            live = [s for i, s in enumerate(order) if not info['done'][i]]
            if not live:
                break
            obs = env.observe(live)
            digests.append({s: (obs['creatures'][i].tobytes(), obs['cands'][i, :int(obs['cand_mask'][i].sum())].tobytes())
                            for i, s in enumerate(live)})
            rows = [int(obs['cand_mask'][i].sum()) // 2 for i in range(len(live))]
            env.step(live, rows)
        return [{order.index(s): v for s, v in d.items()} for d in digests]
    assert run(1, [0, 1, 2, 3]) == run(6, [7, 2, 5, 0])


def _replay(directory):
    out = subprocess.run([str(EMBER_BIN), 'replay', str(directory)], capture_output=True, text=True, timeout=600)
    m = re.search(r'replayed (\d+) tapes: (\d+) match, (\d+) differ', out.stdout + out.stderr)
    assert m, out.stdout[-2000:] + out.stderr[-2000:]
    return int(m.group(1)), int(m.group(2)), int(m.group(3)), out.stdout


@pytest.mark.skipif(not EMBER_BIN.exists(), reason='no ember binary')
def test_record_replays_with_zero_divergences(tmp_path):
    env = make(16, scores=False, max_steps=40)
    by = rows_by(env)
    ids = sorted(by)[1::10][:12]
    specs = [spec_for(e, 21) for e in ids]
    ctrls = [controller_forms(by[e], k) for k, e in enumerate(ids)]
    env.reset(range(12), specs, ctrls)
    rng = np.random.default_rng(8)
    # a reseeded restore in slot 12 and a game left running in slot 13
    for _ in range(3):
        live = [s for s in range(12) if not env.info([s])['done'][0]]
        obs = env.observe(live)
        env.step(live, [rng.integers(0, int(m.sum())) for m in obs['cand_mask']])
    live = [s for s in range(12) if not env.info([s])['done'][0]]
    env.restore(12, env.snapshot(live[0]), dice_seed=99)
    env.restore(13, env.snapshot(live[-1]))
    play(env, list(range(13)), rng, scores=False)
    for s in range(14):
        env.record(s, tmp_path / f'g{s:02d}.jsonl')
    n, match, differ, text = _replay(tmp_path)
    assert (n, match, differ) == (14, 14, 0), text[-3000:]


def test_natural20_accepts_rust_layouts():
    """Optional cross-check when scenarios.general.spec is installed."""
    EncounterSpec = pytest.importorskip('scenarios.general.spec').EncounterSpec
    env = make(4)
    rows = env.catalog
    checked = 0
    for k, row in enumerate(rows):
        for seed in (k, 10_000 + 7 * k):
            d = ember_rs.place(row, seed)
            spec = EncounterSpec.from_dict(d)
            warnings = spec.check()
            assert not warnings, (row['id'], seed, warnings)
            assert spec.any_hero_sees_monster()
            assert [u['id'] for u in d['heroes'] + d['monsters']] == [u['id'] for u in encounter_units(row)]
            checked += 1
    env.reset([0], [spec_for('hall_32x32-undead-zomb9', 3)], [EXTERNAL])
    assert not EncounterSpec.from_dict(env.spec(0)).check()
    assert checked == 2 * len(rows)


def test_trainer_specs_from_the_real_catalog():
    env = make(4)
    source = SpecSource(env.catalog)
    dev = source.fixed('dev', 8, 1000)
    rng = random.Random(0)
    train = [source.sample_train(rng) for _ in range(4)]
    env.reset(range(4), train, [EXTERNAL] * 4)
    env.reset(range(4), dev[:4], [EXTERNAL] * 4)
    obs = env.observe([s for s in range(4) if not env.info([s])['done'][0]])
    validate_obs(obs, env.dims)
    assert {r['split'] for r in env.catalog} == {'train', 'dev', 'test'} and set(TEAMS) == {'heroes', 'monsters'}


# ember-rs G8b: the SRD 5.2.1 goblins (Minion, Warrior, Boss) with Mara + Ilyra.
GOBLIN_ROWS = [
    {'id': f'g8b-{m}-{name}', 'tier': 'T0', 'split': 'train', 'map': m, 'party': ['mara', 'ilyra'],
     'roster': roster, 'layout': {'rule': 'zone', 'require_sight': sight}}
    for m, sight in (('vault', True), ('room_12x10', False))
    for name, roster in (('war-skel1', ['goblin_warrior', 'skeleton']),
                         ('min2-zomb1', ['goblin_minion', 'goblin_minion', 'zombie']),
                         ('boss-min-war', ['goblin_boss', 'goblin_minion', 'goblin_warrior']))
]


def test_goblin_rosters_end_to_end():
    """Goblin rosters run end to end through the bindings: every controller form, valid
    observations at every step and both final views, natural20 accepts the Rust layouts."""
    env = make(12, catalog=GOBLIN_ROWS)
    assert [r['id'] for r in env.catalog] == [r['id'] for r in GOBLIN_ROWS]
    ids = [r['id'] for r in GOBLIN_ROWS] * 2
    specs = [spec_for(e, k) for k, e in enumerate(ids)]
    by = rows_by(env)
    ctrls = [controller_forms(by[e], k) for k, e in enumerate(ids)]
    env.reset(range(12), specs, ctrls)
    finals = play(env, list(range(12)), np.random.default_rng(3))
    assert len(finals) == 12
    for k, row in enumerate(GOBLIN_ROWS):
        d = ember_rs.place(row, 100 + k)
        assert [u['id'] for u in d['heroes'] + d['monsters']] == [u['id'] for u in encounter_units(row)]


MUMMY_ROWS = [
    {'id': f'mummy-{m}-{name}', 'tier': 'T0', 'split': 'train', 'map': m, 'party': party,
     'roster': roster, 'layout': {'rule': 'zone', 'require_sight': sight}}
    for m, sight in (('vault', True), ('room_12x10', False))
    for name, party, roster in (('trio-mum2', ['guy', 'elion', 'curogana'], ['mummy', 'mummy']),
                                ('trio-mum1-boss', ['guy', 'elion', 'curogana'], ['mummy', 'goblin_boss']),
                                ('pair-mum1-skel1', ['mara', 'ilyra'], ['mummy', 'skeleton']))
]


def test_mummy_rosters_end_to_end():
    """Mummy rosters (ember-rs "Mummy status") run end to end through the bindings, as the
    goblin rosters do: every controller form, valid observations at every step, natural20
    accepts the Rust layouts. Skipped with a wheel that predates the Mummy (ember-rs 41331be)."""
    if 'mummy' not in ember_rs.ContentPool(['content/srd']).ids:
        pytest.skip('ember_rs wheel without the Mummy')
    env = make(12, catalog=MUMMY_ROWS)
    ids = [r['id'] for r in MUMMY_ROWS] * 2
    specs = [spec_for(e, k) for k, e in enumerate(ids)]
    by = rows_by(env)
    ctrls = [controller_forms(by[e], k) for k, e in enumerate(ids)]
    env.reset(range(12), specs, ctrls)
    finals = play(env, list(range(12)), np.random.default_rng(5))
    assert len(finals) == 12
    for k, row in enumerate(MUMMY_ROWS):
        d = ember_rs.place(row, 200 + k)
        assert [u['id'] for u in d['heroes'] + d['monsters']] == [u['id'] for u in encounter_units(row)]
