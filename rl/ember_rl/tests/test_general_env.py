"""The BatchEnv contract (general_env) and FakeBatchEnv, which the trainer tests rely on."""
import random

import numpy as np
import pytest

from ember_rl.fake_env import FakeBatchEnv, fake_catalog
from ember_rl.general_env import (
    DEFAULT_DIMS, BatchEnv, ContractError, EpisodeSpec, SpecSource, TEAMS, breakdown, info_row, load_specs, validate_info,
    validate_obs, write_specs,
)

EXTERNAL = {'heroes': 'external', 'monsters': 'external'}


def _specs(n, seed=0, offset=-1):
    rng = random.Random(seed)
    return [EpisodeSpec(f'fake-train-{i % 6}', rng.randrange(2**30), rng.randrange(2**30), rng.randrange(2**30),
                        offset, offset) for i in range(n)]


def _play(env, slots, choose, check=True):
    """Play every slot to the end with choose(obs) -> rows; returns final info rows by slot."""
    info = env.info(slots)
    finals = {}
    while True:
        live = [s for s in slots if not env.info([s])['done'][0]]
        for s in slots:
            if s not in live and s not in finals:
                finals[s] = info_row(env.info([s]), 0)
        if not live:
            return finals
        obs = env.observe(live)
        if check:
            validate_obs(obs, env.dims)
        info = env.step(live, choose(obs))
        if check:
            validate_info(info, len(live))


def test_fake_env_implements_the_protocol_and_layout():
    env = FakeBatchEnv(4)
    assert isinstance(env, BatchEnv)
    info = env.reset(range(4), _specs(4), [EXTERNAL] * 4)
    validate_info(info, 4)
    obs = env.observe(range(4))
    validate_obs(obs, env.dims)
    d = DEFAULT_DIMS
    assert obs['map'].shape == (4, d['map_channels'], 32, 32) and obs['creatures'].shape == (4, 24, d['creature'])
    assert obs['cands'].shape[2] == d['cand'] and obs['cand_tgt'].shape[2] == 8
    assert obs['creature_rel'].shape == (4, 24, 24, d['relations'])


def test_fake_env_serves_both_feature_versions():
    from ember_rl.general_env import FEATURE_DIMS, check_contract, normalize_dims
    for version, dims in FEATURE_DIMS.items():
        env = FakeBatchEnv(2, feature_version=version)
        check_contract(env, version)
        assert normalize_dims(env.dims) == normalize_dims(dims)
        env.reset(range(2), _specs(2), [EXTERNAL] * 2)
        obs = env.observe(range(2))
        validate_obs(obs, env.dims)
        assert ('creature_rel' in obs) == (dims['relations'] > 0)
        assert obs['creatures'].shape[2] == dims['creature'] and obs['map'].shape[1] == dims['map_channels']
    with pytest.raises(ValueError):
        check_contract(FakeBatchEnv(1, feature_version='ember-gen-v1'))     # the trainer's default is v2
    obs = FakeBatchEnv(2)
    obs.reset(range(2), _specs(2), [EXTERNAL] * 2)
    bad = obs.observe(range(2))
    bad['creature_rel'][0, 0, 0, 3] = 1
    with pytest.raises(ContractError):
        validate_obs(bad, obs.dims)


def test_random_and_native_play_respect_the_contract():
    env = FakeBatchEnv(6)
    controllers = [EXTERNAL] * 2 + [{'heroes': 'native', 'monsters': 'external'}] * 2 + \
        [{'heroes': 'external', 'monsters': 'native'}] * 2
    info = env.reset(range(6), _specs(6, 1), controllers)
    rng = np.random.default_rng(0)
    surfaced = {s: set() for s in range(6)}

    def choose(obs):
        legal = obs['cand_mask'].sum(1)
        return (rng.random(len(legal)) * legal).astype(np.int32)

    while True:
        live = [s for s in range(6) if not env.info([s])['done'][0]]
        if not live:
            break
        for i, s in enumerate(live):
            surfaced[s].add(int(env.info([s])['team'][0]))
        obs = env.observe(live)
        validate_obs(obs, env.dims)
        info = env.step(live, choose(obs))
        validate_info(info, len(live))
    assert surfaced[2] <= {1} and surfaced[3] <= {1} and surfaced[4] <= {0} and surfaced[5] <= {0}
    for s in range(6):
        final = info_row(env.info([s]), 0)
        assert final['done'] and (final['truncated'] or final['potential'] == 0.)
        for team in (0, 1):
            validate_obs(env.observe([s], team=[team]), env.dims, live=[False])


def test_health_objective_ends_at_the_horizon_and_native_objective_truncates():
    for objective, flag in (('health_score', 'terminated'), ('native', 'truncated')):
        env = FakeBatchEnv(4, objective=objective, max_rounds=2)
        env.reset(range(4), _specs(4, 2), [EXTERNAL] * 4)
        # End Turn at every decision: nobody dies, so the round cap decides.
        finals = _play(env, list(range(4)), lambda obs: obs['cand_mask'].sum(1).astype(np.int32) - 1)
        for row in finals.values():
            assert row[flag] and row['round'] == 3      # max_rounds rounds played, round = max_rounds + 1
            assert (row['task_end'] == 'health') == (objective == 'health_score')
            assert row['winner'] is None


def test_safety_truncation_by_step_cap_and_forced_steps():
    env = FakeBatchEnv(2, max_steps=3)
    env.reset(range(2), _specs(2, 3), [EXTERNAL] * 2)
    finals = _play(env, [0, 1], lambda obs: obs['cand_mask'].sum(1).astype(np.int32) - 1)
    assert all(r['truncated'] and not r['terminated'] for r in finals.values())
    env = FakeBatchEnv(8)
    env.reset(range(8), _specs(8, 4), [EXTERNAL] * 8)
    forced = 0
    while True:
        live = [s for s in range(8) if not env.info([s])['done'][0]]
        if not live:
            break
        obs = env.observe(live)
        info = env.step(live, obs['native_choice'].astype(np.int32))
        forced += int(info['forced'].sum())
    assert forced > 0   # End-Turn-only decisions never surface


def test_invalid_rows_raise_before_any_slot_changes():
    env = FakeBatchEnv(2)
    env.reset(range(2), _specs(2, 5), [EXTERNAL] * 2)
    obs = env.observe([0, 1])
    before = [env.snapshot(s).history[:] for s in (0, 1)]
    legal = obs['cand_mask'].sum(1)
    with pytest.raises(ValueError):
        env.step([0, 1], [0, int(legal[1])])          # second row is padding
    assert [env.snapshot(s).history for s in (0, 1)] == before
    with pytest.raises(ValueError):
        env.step([0, 0], [0, 0])
    with pytest.raises(ValueError):
        env.observe([0], team=[1 - int(env.info([0])['team'][0])])


def test_snapshot_restore_is_deterministic_and_reseeding_changes_dice():
    env = FakeBatchEnv(3)
    env.reset([0], _specs(1, 6), [EXTERNAL])
    obs = env.observe([0])
    env.step([0], obs['native_choice'].astype(np.int32))
    snap = env.snapshot(0)
    native = lambda o: o['native_choice'].astype(np.int32)
    env.restore(1, snap)
    env.restore(2, snap)
    a, b = _play(env, [1], native), _play(env, [2], native)
    assert a[1] == b[2] and env.snapshot(1).history == env.snapshot(2).history
    outcomes = set()
    for seed in range(12):
        env.restore(1, snap, dice_seed=seed)
        final = _play(env, [1], native, check=False)[1]
        outcomes.add((final['round'], round(final['score'], 6), tuple(env.snapshot(1).history)))
    assert len(outcomes) > 1


def test_eval_offset_and_random_training_offsets():
    env = FakeBatchEnv(4)
    env.reset(range(4), _specs(4, 7, offset=0), [EXTERNAL] * 4)
    obs = env.observe(range(4))
    assert np.all(obs['map'][:, 0, 0, 0] == 1)        # maps start at the canvas corner
    env.reset(range(4), _specs(4, 8, offset=-1), [EXTERNAL] * 4)
    origins = {(g.ox, g.oy) for g in env.games}
    assert len(origins) > 1


def test_validator_rejects_broken_observations():
    env = FakeBatchEnv(2)
    env.reset(range(2), _specs(2, 9), [EXTERNAL] * 2)
    good = env.observe([0, 1])
    breakers = [
        lambda o: o['cand_tgt'].__setitem__((0, 0, 0), 23),            # pointer to a padded creature
        lambda o: o['cand_ids'].__setitem__((0, int(o['cand_mask'][0].sum()) - 1, 0), 1),   # End Turn not last
        lambda o: o['native_dropped'].__setitem__((0, int(o['native_choice'][0])), True),  # choice dropped
        lambda o: o['cands'].__setitem__((0, 0, 0), np.nan),
        lambda o: o.__setitem__('map', o['map'].astype(np.int16)),
    ]
    for breaker in breakers:
        obs = {k: v.copy() for k, v in good.items()}
        breaker(obs)
        with pytest.raises(ContractError):
            validate_obs(obs, env.dims)


def test_spec_source_tiers_fixed_lists_and_baselines(tmp_path):
    catalog = fake_catalog()
    catalog[0]['baseline'] = {'heroes': .7, 'monsters': .2}
    specs = SpecSource(catalog, tier_weights={'T1': 1.})
    rng = random.Random(0)
    drawn = {specs.sample_train(rng).encounter for _ in range(200)}
    assert drawn == {r['id'] for r in catalog if r['split'] == 'train' and r['tier'] == 'T1'}
    dev = specs.fixed('dev', 7, 1000)
    assert dev == specs.fixed('dev', 7, 1000) and all(s.offset_x == 0 for s in dev)
    assert {s.encounter for s in dev} == {r['id'] for r in catalog if r['split'] == 'dev'}
    path = tmp_path / 'dev.jsonl'
    write_specs(path, dev)
    assert load_specs(path) == dev
    assert specs.baseline('fake-train-0', 'monsters') == .2 and specs.baseline('fake-dev-0', 'monsters') == .5
    items = [dict(spec=dev[0], learner_team='heroes'), dict(spec=dev[1], learner_team='heroes')]
    out = breakdown(items, [('win', 1.), ('loss', -1.)], specs)
    assert out['excess'] == pytest.approx(0.) and set(out['per_encounter']) == {dev[0].encounter, dev[1].encounter}
    assert sum(r['n'] for r in out['per_tier'].values()) == 2
    with pytest.raises(ValueError):
        SpecSource(catalog, tier_weights={'T9': 1.})


def test_per_creature_control_and_controller_checks():
    """{'heroes': 'native', 'monsters': 'native', 'external_units': [k]}: only creature
    k decides (experiment 3); by unit id too; bad mappings raise and change nothing."""
    from ember_rl.general_env import check_controllers, encounter_units
    env = FakeBatchEnv(6)
    specs = _specs(6, 5)
    sizes = [len(encounter_units(next(r for r in env.catalog if r['id'] == s.encounter))) for s in specs]
    controllers = [dict(heroes='native', monsters='native', external_units=[k % n]) for k, n in enumerate(sizes)]
    env.reset(range(6), specs, controllers)
    for slot, n in enumerate(sizes):
        units = env.units(slot)
        assert len(units) == n and [u[3] for u in units].count(True) == 1 and units[slot % n][3]
    seen = {s: set() for s in range(6)}
    rng = np.random.default_rng(1)

    def choose(obs):
        for i, s in enumerate(live):
            seen[s].add(int(obs['actor'][i]))
        return np.array([rng.integers(0, int(m.sum())) for m in obs['cand_mask']], np.int32)
    while True:
        live = [s for s in range(6) if not env.info([s])['done'][0]]
        if not live:
            break
        obs = env.observe(live)
        validate_obs(obs, env.dims)
        validate_info(env.step(live, choose(obs)), len(live))
    assert all(seen[s] <= {s % sizes[s]} for s in range(6)) and any(seen.values())
    uid = env.units(0)[0][0]
    env.reset([0], specs[:1], [dict(heroes='native', monsters='native', external_units=[uid])])
    assert [u[3] for u in env.units(0)] == [True] + [False] * (sizes[0] - 1)
    before = env.snapshot(1).history
    for bad in (dict(heroes='native'), dict(heroes='native', monsters='native', other=1),
                dict(heroes='bot', monsters='native'), dict(heroes='native', monsters='native', external_units=[-1]),
                dict(heroes='native', monsters='native', external_units=[99]),
                dict(heroes='native', monsters='native', external_units=['dragon-1'])):
        with pytest.raises(ValueError):
            env.reset([1, 2], specs[1:3], [EXTERNAL, bad])
    assert env.snapshot(1).history == before
    assert check_controllers(dict(heroes='external', monsters='native')) == ({'heroes': 'external', 'monsters': 'native'}, [])


def test_breakdown_per_kind_for_single_creature_items():
    from ember_rl.general_env import breakdown
    from ember_rl.fake_env import fake_catalog
    source = SpecSource(fake_catalog())
    spec = EpisodeSpec('fake-dev-0', 1, 2, 3, 0, 0)
    items = [dict(spec=spec, learner_team='heroes', unit='mara'), dict(spec=spec, learner_team='heroes', unit='mara'),
             dict(spec=spec, learner_team='heroes', unit='ilyra')]
    out = breakdown(items, [('win', 1.), ('loss', -1.), ('horizon_win', .2)], source)
    assert out['per_kind']['mara']['n'] == 2 and out['per_kind']['mara']['excess'] == 0.
    assert out['per_kind']['ilyra']['excess'] == -.5 and out['excess'] == round((.5 - .5 - .5) / 3, 4)
    assert 'per_kind' not in breakdown([dict(spec=spec, learner_team='heroes')], [('win', 1.)], source)
