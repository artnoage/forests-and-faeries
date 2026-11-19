"""ember_rl.search: batched lookahead on forks (FakeBatchEnv, and ember_rs.BatchEnv when importable)."""
import numpy as np
import pytest

torch = pytest.importorskip('torch')

from ember_rl.fake_env import FakeBatchEnv  # noqa: E402
from ember_rl.general_env import TEAMS, EpisodeSpec, info_row  # noqa: E402
from ember_rl.general_model import build_general, general_config, select, to_batch  # noqa: E402
from ember_rl.search import Lookahead, Root, SearchConfig, parse_search, root_hidden  # noqa: E402

DEVICE = torch.device('cpu')
EXTERNAL = dict(heroes='external', monsters='external')
HEROES_ONLY = dict(heroes='external', monsters='native')


def tiny_models(seed=0, dims=None):
    torch.manual_seed(seed)
    config = general_config(dims, d_model=32, heads=2, encoder_layers=1, decoder_layers=1, cnn_channels=16, cnn_layers=2)
    return {team: build_general(config).eval().requires_grad_(False) for team in TEAMS}


def start(env, n, controllers, seed=0):
    specs = [EpisodeSpec(f'fake-train-{k % 3}', k, 100 + k + seed, 1000 + k + seed, 0, 0) for k in range(n)]
    info = env.reset(list(range(n)), specs, [controllers] * n)
    return [info_row(info, i) for i in range(n)]


def roots_of(env, infos, models, slots, rollout_models):
    live = [g for g in slots if not infos[g]['done']]
    obs = env.observe(live)
    roots = []
    for i, g in enumerate(live):
        team = infos[g]['team']
        sub = select(obs, [i])
        logits, values = models[team](to_batch(sub, DEVICE))
        legal = int(sub['cand_mask'][0].sum())
        roots.append(Root(slot=g, team=team, logits=logits[0, :legal].numpy(), value=float(values[0]),
                          round=infos[g]['round'], actor=infos[g]['actor'], potential=infos[g]['potential'],
                          models=rollout_models, hidden=root_hidden(sub, 0)))
    return roots


def test_parse_search_and_config_checks():
    c = parse_search('k=3,seeds=2,horizon=rounds:1,select=mix,tau=0.05,skip_p=0.9')
    assert (c.k, c.seeds, c.horizon_kind, c.horizon_n, c.select, c.tau, c.skip_p) == (3, 2, 'rounds', 1, 'mix', .05, .9)
    assert parse_search(c.to_text()) == c and parse_search('') is None and parse_search('off') is None
    for bad in ('k=0', 'horizon=turns', 'horizon=depth:2', 'select=best', 'nope=1', 'tau=0'):
        with pytest.raises(ValueError):
            parse_search(bad)


@pytest.mark.parametrize('horizon', ['steps:1', 'turns:1', 'rounds:1'])
def test_search_leaves_the_game_alone_and_returns_valid_targets(horizon):
    env = FakeBatchEnv(6)
    infos = start(env, 6, EXTERNAL)
    models = tiny_models()
    la = Lookahead(env, SearchConfig(k=3, seeds=2, horizon=horizon, scratch=16), DEVICE, seed=1)
    roots = roots_of(env, infos, models, range(6), models)
    before = env.observe([r.slot for r in roots])
    before = {k: v.copy() for k, v in before.items()}
    info_before = env.info([r.slot for r in roots])
    results = la.search(env, roots, explore=False)
    after = env.observe([r.slot for r in roots])
    assert all(np.array_equal(before[k], after[k], equal_nan=True) for k in before)
    assert all(np.array_equal(info_before[k], env.info([r.slot for r in roots])[k]) for k in info_before)
    assert len(results) == len(roots)
    for root, res in zip(roots, results):
        L = len(root.logits)
        assert 0 <= res.row < L
        if res.searched:
            assert res.row in res.cands and len(res.cands) == min(3, L) and res.q.shape == (len(res.cands),)
            assert res.u.shape == (len(res.cands), 2) and np.isfinite(res.u).all()
            assert res.target.shape == (L,) and abs(res.target.sum() - 1) < 1e-5 and (res.target > 0).all()
            assert res.row == res.cands[int(np.argmax(res.q))]      # select=q
            assert np.all(np.abs(res.q) <= 2)
    s = la.summary()
    assert s['leaves'] == s['forks'] == sum(len(r.cands) * 2 for r in results if r.searched)
    assert s['hidden_roots'] == 0


def test_horizons_order_rollout_depth_and_mix_follows_the_prior_for_large_tau():
    env = FakeBatchEnv(8)
    infos = start(env, 8, EXTERNAL, seed=4)
    models = tiny_models(1)
    depth = {}
    for horizon in ('steps:1', 'turns:1', 'rounds:2'):
        la = Lookahead(env, SearchConfig(k=2, seeds=2, horizon=horizon, scratch=64), DEVICE, seed=2)
        la.search(env, roots_of(env, infos, models, range(8), models))
        depth[horizon] = la.summary()['mean_depth']
    assert depth['steps:1'] <= depth['turns:1'] <= depth['rounds:2']
    la = Lookahead(env, SearchConfig(k=3, seeds=2, select='mix', tau=1e6, scratch=64), DEVICE, seed=2)
    roots = roots_of(env, infos, models, range(8), models)
    for root, res in zip(roots, la.search(env, roots)):
        assert res.row == int(np.argmax(root.logits))   # Q/tau vanishes: the prior's choice


def test_common_seeds_make_identical_candidates_agree_and_explore_samples_gumbel_candidates():
    env = FakeBatchEnv(4)
    infos = start(env, 4, EXTERNAL, seed=9)
    models = tiny_models(2)
    roots = roots_of(env, infos, models, range(4), models)
    la = Lookahead(env, SearchConfig(k=1, seeds=3, scratch=64), DEVICE, seed=5)
    # k=1: one candidate, three seeds; a second search with the same rng state repeats it exactly
    state = la.rng.bit_generator.state
    first = la.search(env, roots)
    la.rng.bit_generator.state = state
    again = la.search(env, roots)
    for a, b in zip(first, again):
        if a.searched:
            assert np.array_equal(a.u, b.u)
    la = Lookahead(env, SearchConfig(k=2, seeds=2, scratch=64), DEVICE, seed=6)
    chosen = set()
    for _ in range(6):
        for res in la.search(env, roots, explore=True):
            if res.searched:
                chosen.add(tuple(res.cands))
    assert len(chosen) > 1     # Gumbel-top-k varies the candidates


def test_skip_p_and_native_opponents_with_and_without_a_policy_model():
    env = FakeBatchEnv(6)
    infos = start(env, 6, HEROES_ONLY, seed=3)
    models = tiny_models(3)
    roots = roots_of(env, infos, models, range(6), dict(heroes=models['heroes'], monsters=None))
    assert all(r.team == 'heroes' for r in roots)
    la = Lookahead(env, SearchConfig(k=2, seeds=2, skip_p=0., scratch=64), DEVICE)
    assert not any(r.searched for r in la.search(env, roots)) and la.stats['skipped'] == len(roots)
    # the env plays the native monsters in the forks
    la = Lookahead(env, SearchConfig(k=2, seeds=2, horizon='rounds:1', scratch=64), DEVICE)
    assert any(r.searched for r in la.search(env, roots))
    # opponent=policy hands them to a policy: one must be given
    la = Lookahead(env, SearchConfig(k=2, seeds=2, horizon='rounds:1', opponent='policy', scratch=64), DEVICE)
    with pytest.raises(RuntimeError, match='monsters'):
        la.search(env, roots)
    roots = roots_of(env, infos, models, range(6), models)
    assert any(r.searched for r in la.search(env, roots))
    assert la.stats['forward_rows'] > 0


def test_terminal_utilities_are_in_the_searching_teams_terms():
    cur = dict(task_end=np.array([1, 1, 1, 2]), winner=np.array([0, 1, -1, -1]), score=np.array([0., 0., 0., .4]))
    assert [Lookahead._terminal(cur, g, 0) for g in range(4)] == [1., -1., 0., .4]
    assert [Lookahead._terminal(cur, g, 1) for g in range(4)] == [-1., 1., 0., -.4]


def test_search_on_ember_rs():
    ember_rs = pytest.importorskip('ember_rs')
    if not hasattr(ember_rs.BatchEnv, 'fork'):
        pytest.skip('ember_rs without BatchEnv.fork')
    env = ember_rs.BatchEnv(n_slots=4, threads=2, scores=False)
    ids = sorted(r['id'] for r in env.catalog)[::40][:4]
    specs = [EpisodeSpec(e, 0, 11 + k, 21 + k, 0, 0) for k, e in enumerate(ids)]
    info = env.reset(range(4), specs, [HEROES_ONLY] * 4)
    infos = [info_row(info, i) for i in range(4)]
    models = tiny_models(4, env.dims)       # the wheel's own feature version
    roots = roots_of(env, infos, models, range(4), dict(heroes=models['heroes'], monsters=None))
    before = env.info(range(4))
    la = Lookahead(env, SearchConfig(k=2, seeds=2, horizon='turns:1', scratch=32), DEVICE, threads=2)
    results = la.search(env, roots)
    assert all(np.array_equal(before[k], env.info(range(4))[k]) for k in before)
    assert any(r.searched for r in results) and all(0 <= r.row < len(root.logits) for r, root in zip(results, roots))
    la = Lookahead(env, SearchConfig(k=2, seeds=2, horizon='turns:1', opponent='policy', scratch=32), DEVICE, threads=2)
    roots = roots_of(env, infos, models, range(4), models)
    la.search(env, roots, explore=True)
    assert la.stats['forward_rows'] > 0


def test_move_penalty_charges_own_moves_between_root_and_leaf():
    from ember_rl.general_env import MOVE_KIND
    env = FakeBatchEnv(6)
    infos = start(env, 6, EXTERNAL, seed=11)
    models = tiny_models(5)
    roots = roots_of(env, infos, models, range(6), models)
    obs = env.observe([r.slot for r in roots])
    for i, r in enumerate(roots):
        r.kinds = obs['cand_ids'][i, :len(r.logits), 0]
    runs = {}
    for penalty in (0., .25):
        la = Lookahead(env, SearchConfig(k=3, seeds=2, horizon='rounds:1', scratch=64, move_penalty=penalty), DEVICE, seed=4)
        runs[penalty] = la.search(env, roots)
    moved = 0
    for root, a, b in zip(roots, runs[0.], runs[.25]):
        if not a.searched:
            continue
        assert a.cands == b.cands
        assert np.all(b.u <= a.u + 1e-9)           # same rollouts (same seeds), minus the penalties
        for c, row in enumerate(a.cands):
            if root.kinds[row] == MOVE_KIND:
                assert np.all(b.u[c] <= a.u[c] - .25 + 1e-9)    # the candidate's own step at least
                moved += 1
    assert moved
    # The penalty counts the squares each step walked (info['moved']); only an environment without that
    # field needs Root.kinds (one square per move row).
    for r in roots:
        r.kinds = None
    Lookahead(env, SearchConfig(k=2, seeds=1, move_penalty=.1, scratch=64), DEVICE).search(env, roots)

    class NoMoved(FakeBatchEnv):
        def info(self, slots):
            out = super().info(slots)
            out.pop('moved')
            return out

    la = Lookahead(env, SearchConfig(k=2, seeds=1, move_penalty=.1, scratch=64), DEVICE, scratch=NoMoved(64))
    with pytest.raises(ValueError, match='kinds'):
        la.search(env, roots)
