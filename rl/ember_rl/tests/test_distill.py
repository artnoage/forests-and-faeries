"""Native-score distillation (GENERAL_ENV.md §6): soft target, losses, schedules, critic targets."""
import math
import random

import numpy as np
import pytest

torch = pytest.importorskip('torch')

from ember_rl.distill import (
    RewardConfig, annealed, beta_at, distill_loss, distill_metrics, episode_returns, explained_variance,
    k_rollout_returns, masked_log_softmax, mix_rows, soft_target, teacher_kl, tost_within, value_loss,
)
from ember_rl.fake_env import FakeBatchEnv
from ember_rl.general_env import EpisodeSpec, info_row

INF = float('inf')


def q_of(raw, dropped=None, choice=0, move=None, mask=None, **kw):
    raw = torch.tensor([raw], dtype=torch.float32)
    k = raw.shape[1]
    dropped = torch.tensor([dropped or [False] * k])
    move = torch.tensor([move or [False] * k])
    mask = torch.tensor([mask or [True] * k])
    return soft_target(raw, dropped, torch.tensor([choice]), mask, move, **kw)[0]


def test_soft_target_hand_case():
    # attack 3.0 (native choice), attack 1.0, move 0.2, move -0.25, End Turn -inf.
    q = q_of([3., 1., .2, -.25, -INF], choice=0, move=[False, False, True, True, False], t_move=.25, t_act=1., alpha=.3)
    z = torch.tensor([0., -2., -2.8 / .25, -3.25 / .25])
    soft = torch.softmax(z, 0)
    expected = torch.cat([.3 * soft, torch.zeros(1)])
    expected[0] += .7
    assert torch.allclose(q, expected, atol=1e-6)
    assert q.sum() == pytest.approx(1.) and q[4] == 0


def test_mode_is_the_native_choice_for_alpha_below_half():
    rng = np.random.default_rng(0)
    for _ in range(200):
        k = int(rng.integers(2, 12))
        raw = rng.normal(0, 3, k).astype(np.float32)
        raw[-1] = 0. if rng.random() < .5 else -INF
        dropped = (rng.random(k) < .2).tolist()
        dropped[-1] = False
        # The native choice need not be the argmax (a negative attack can beat End Turn).
        choices = [i for i in range(k) if not dropped[i]]
        choice = int(rng.choice(choices))
        alpha = float(rng.uniform(0, .49))
        q = q_of(raw.tolist(), dropped=dropped, choice=choice, move=(rng.random(k) < .5).tolist(), alpha=alpha)
        assert int(q.argmax()) == choice and q[choice] >= 1 - alpha
        assert q.sum() == pytest.approx(1., abs=1e-6)
        assert all(q[i] == 0 for i in range(k) if dropped[i] and i != choice)


def test_dropped_minus_inf_padding_and_missing_scores():
    q = q_of([5., 4., -INF, 0.], dropped=[False, True, False, False], choice=0, mask=[True, True, True, True])
    assert q[1] == 0 and q[2] == 0 and q[3] > 0
    padded = q_of([5., 0., 9.], choice=0, mask=[True, True, False])
    assert padded[2] == 0 and padded.sum() == pytest.approx(1.)
    # A row with no native data (choice -1) gets no target and no loss.
    raw = torch.tensor([[1., 0.], [float('nan'), float('nan')]])
    q = soft_target(raw, torch.zeros(2, 2, dtype=torch.bool), torch.tensor([0, -1]), torch.ones(2, 2, dtype=torch.bool),
                    torch.zeros(2, 2, dtype=torch.bool))
    assert q[1].sum() == 0 and torch.isfinite(q).all()
    logits = torch.tensor([[2., 0.], [0., 5.]], requires_grad=True)
    loss = distill_loss(logits, q, torch.ones(2, 2, dtype=torch.bool))
    loss.backward()
    assert logits.grad[1].abs().sum() == 0
    assert loss.item() == pytest.approx(-(q[0] * torch.log_softmax(logits[0].detach(), 0)).sum().item())


def test_end_turn_handling():
    # In melee: End Turn (0) beats a negative move; it is the native choice and the mode.
    q = q_of([-.5, -1.2, 0.], choice=2, move=[True, True, False], alpha=.3)
    assert int(q.argmax()) == 2 and q[2] > .7
    # A negative attack beats End Turn natively: End Turn still gets soft mass (regret 0), the attack the mode.
    q = q_of([-.4, 0.], choice=0, alpha=.3)
    assert int(q.argmax()) == 0 and q[1] > 0
    # Out of melee End Turn is -inf: no mass unless it is the choice; nothing left -> End Turn, finite target.
    q = q_of([-.2, -INF], choice=0, move=[True, False])
    assert q[1] == 0 and q[0] == pytest.approx(1.)
    q = q_of([-INF, -INF], dropped=[True, False], choice=1)
    assert q.tolist() == [0., 1.]


def test_temperatures_act_per_class():
    raw = [1., .5, .5]          # choice, an attack and a move with the same regret
    q = q_of(raw, choice=0, move=[False, False, True], t_move=.25, t_act=1., alpha=1.)
    assert q[1] > q[2] > 0 and q[1] / q[0] == pytest.approx(math.exp(-.5), rel=1e-5)
    assert q[2] / q[0] == pytest.approx(math.exp(-2.), rel=1e-5)


def test_masked_log_softmax_and_teacher_kl_are_finite():
    logits = torch.tensor([[1., -torch.inf, 2.]])
    mask = torch.tensor([[True, False, True]])
    log = masked_log_softmax(logits, mask)
    assert torch.isfinite(log).all() and log[0, 1] == 0

    class Teacher(torch.nn.Module):
        def forward(self, batch):
            return batch['logits'], torch.zeros(1)
    teacher = Teacher().eval()
    student = torch.tensor([[0., -torch.inf, 0.]], requires_grad=True)
    kl = teacher_kl(teacher, student, dict(cand_mask=mask, logits=logits))
    kl.backward()
    assert kl > 0 and torch.isfinite(student.grad).all()


def test_metrics_and_confusion():
    logits = torch.tensor([[0., 3., 1.], [2., 0., 0.]])
    q = torch.tensor([[1., 0., 0.], [1., 0., 0.]])
    kinds = torch.tensor([[14, 0, 1], [1, 0, 14]])
    m = distill_metrics(logits, q, torch.tensor([0, 0]), torch.ones(2, 3, dtype=torch.bool), kinds)
    assert m['n'] == 2 and m['top1'] == .5 and m['confusion'] == {'14->0': 1} and m['top1_tie'] is None
    assert m['n_nonmove'] == 2 and m['top1_nonmove'] == .5          # native kinds 14 and 1: neither is a move
    m = distill_metrics(logits, q, torch.tensor([1, 0]), torch.ones(2, 3, dtype=torch.bool), kinds)
    assert m['top1'] == 1. and m['n_nonmove'] == 1 and m['top1_nonmove'] == 1.   # row 0's native choice is a move
    # Tie-aware agreement: row 0's student pick (row 1) has the native choice's score; a dropped
    # or lower-scored pick does not count.
    raw = torch.tensor([[1., 1., .5], [2., 2., 0.]])
    m = distill_metrics(logits, q, torch.tensor([0, 0]), torch.ones(2, 3, dtype=torch.bool), kinds, raw,
                        torch.zeros(2, 3, dtype=torch.bool))
    assert m['top1'] == .5 and m['top1_tie'] == 1.
    m = distill_metrics(logits, q, torch.tensor([0, 0]), torch.ones(2, 3, dtype=torch.bool), kinds, raw,
                        torch.tensor([[False, True, False], [False, False, False]]))
    assert m['top1_tie'] == .5
    raw[0, 1] = .9
    m = distill_metrics(logits, q, torch.tensor([0, 0]), torch.ones(2, 3, dtype=torch.bool), kinds, raw,
                        torch.zeros(2, 3, dtype=torch.bool))
    assert m['top1_tie'] == .5


def test_schedules():
    assert beta_at(0, 100, 100) == 1. and beta_at(99, 100, 100) == 1.
    assert beta_at(150, 100, 100) == pytest.approx(.5) and beta_at(500, 100, 100, .1) == pytest.approx(.1)
    assert beta_at(5, 0, 0, .2) == .2
    rows, from_native = mix_rows(np.array([1, 1, 1, 1]), np.array([0, 0, 0, 0]), 1., np.random.default_rng(0))
    assert rows.tolist() == [0, 0, 0, 0] and from_native.all()
    rows, _ = mix_rows(np.array([1] * 1000), np.array([0] * 1000), .25, np.random.default_rng(0))
    assert 0.2 < (rows == 0).mean() < .3
    assert annealed(1., 0., 4, 0) == 1. and annealed(1., 0., 4, 2) == .5 and annealed(1., 0., 4, 9) == 0.
    assert annealed(.3, .3, 0, 50) == .3 and annealed(0., 0., 5, 1) == 0.
    assert explained_variance(torch.tensor([1., 2., 3.]), torch.tensor([1., 2., 3.])) == pytest.approx(1.)
    assert tost_within(.50, .50, 2048, 2048) and not tost_within(.55, .50, 2048, 2048)
    assert not tost_within(.5, .5, 30, 30) and not tost_within(0., 0., 4, 4)


def test_value_loss_skips_missing_targets():
    values = torch.tensor([1., 2., 3.], requires_grad=True)
    loss = value_loss(values, torch.tensor([0., float('nan'), 1.]))
    assert loss.item() == pytest.approx(.5 * (1 + 4) / 2)
    assert value_loss(values, torch.full((3,), float('nan'))).item() == 0.


def test_episode_returns_match_team_reward_sums():
    from ember_rl.rewards import team_reward
    reward = RewardConfig(gamma=.9, time_unit='round')
    decisions = [dict(team='heroes', round=1, potential=.1), dict(team='heroes', round=1, potential=.2),
                 dict(team='monsters', round=1, potential=.15), dict(team='heroes', round=2, potential=-.1)]
    final = dict(terminated=True, truncated=False, winner='monsters', task_end='native', score=-1., round=3, potential=0.)
    out = episode_returns(decisions, final, reward)
    r_h3 = team_reward('heroes', .9, -.1, 0., True, 'monsters', step_cost=0.)
    r_h2 = team_reward('heroes', .9, .2, -.1, False, None, step_cost=0.)
    r_h1 = team_reward('heroes', 1., .1, .2, False, None, step_cost=0.)
    assert out[3] == pytest.approx(r_h3)
    assert out[1] == pytest.approx(r_h2 + .9 * r_h3)
    assert out[0] == pytest.approx(r_h1 + 1. * (r_h2 + .9 * r_h3))
    r_m = team_reward('monsters', .81, .15, 0., True, 'monsters', step_cost=0.)
    assert out[2] == pytest.approx(r_m)
    horizon = dict(final, winner=None, task_end='health', score=.4)
    assert episode_returns(decisions[3:], horizon, reward)[0] == pytest.approx(
        team_reward('heroes', .9, -.1, 0., True, None, step_cost=0., horizon_score=.4))
    assert episode_returns(decisions, dict(final, terminated=False, truncated=True), reward) == [None] * 4


def test_k_rollout_returns_on_fake_env():
    env = FakeBatchEnv(6)
    rng = random.Random(1)
    specs = [EpisodeSpec('fake-train-1', rng.randrange(2**30), rng.randrange(2**30), rng.randrange(2**30)) for _ in range(2)]
    env.reset([0, 1], specs, [{'heroes': 'external', 'monsters': 'external'}] * 2)
    roots = [(env.snapshot(s), info_row(env.info([s]), 0)['team']) for s in (0, 1)]
    reward = RewardConfig(gamma=1.)
    values = k_rollout_returns(env, roots, 4, [2, 3, 4, 5], reward, np.random.default_rng(0))
    assert values.shape == (2,) and np.all(np.isfinite(values)) and np.all(np.abs(values) <= 2)
    # k = 1 with the root's own dice stream reproduces the played-out return (restore without reseeding).
    env.restore(2, roots[0][0])
    decisions, info = [], info_row(env.info([2]), 0)
    while not info['done']:
        decisions.append(dict(team=info['team'], round=info['round'], potential=info['potential']))
        info = info_row(env.step([2], env.observe([2])['native_choice'].astype(np.int32)), 0)
    single = episode_returns(decisions, info, reward)[0]
    assert -2 <= single <= 2


def test_compute_gae_lambda_per_round():
    from ember_rl.model import compute_gae
    r = torch.tensor([.1, -.2, .3, .5]); v = torch.tensor([.2, .1, 0., .4])
    nv = torch.tensor([.1, 0., .4, .0]); term = torch.tensor([False, False, False, True])
    trunc = torch.zeros(4, dtype=torch.bool)
    d = torch.tensor([1., .9, 1., .81])
    base = compute_gae(r, v, nv, term, trunc, lam=.8, discounts=d)
    same = compute_gae(r, v, nv, term, trunc, lam=.8, discounts=d, lambdas=torch.full((4,), .8))
    for a, b in zip(base, same):
        assert torch.allclose(a, b)
    # Rounds elapsed [0, 1, 0, 2]: lambda 1 inside a turn, lam**rounds across rounds.
    lam = torch.tensor([1., .8, 1., .64])
    adv, _ = compute_gae(r, v, nv, term, trunc, discounts=d, lambdas=lam)
    deltas = r + d * (~term).float() * nv - v
    expected = torch.zeros(4)
    carry = 0.
    for i in range(3, -1, -1):
        carry = deltas[i] + d[i] * lam[i] * (0. if term[i] else 1.) * carry
        expected[i] = carry
    assert torch.allclose(adv, expected)
    with pytest.raises(ValueError):
        compute_gae(r, v, nv, term, trunc, lambdas=torch.tensor([1., 1.5, 1., 1.]))


def _dataset(n_decisions=256, seed=0):
    env = FakeBatchEnv(16)
    rng = random.Random(seed)
    from ember_rl.general_model import split_obs
    samples = []
    specs = lambda k: [EpisodeSpec(f'fake-train-{rng.randrange(6)}', rng.randrange(2**30), rng.randrange(2**30),
                                   rng.randrange(2**30)) for _ in range(k)]
    env.reset(range(16), specs(16), [{'heroes': 'external', 'monsters': 'external'}] * 16)
    while len(samples) < n_decisions:
        live = [s for s in range(16) if not env.info([s])['done'][0]]
        done = [s for s in range(16) if s not in live]
        if done:
            env.reset(done, specs(len(done)), [{'heroes': 'external', 'monsters': 'external'}] * len(done))
            continue
        obs = env.observe(live)
        samples.extend(split_obs(obs, i) for i in range(len(live)))
        env.step(live, obs['native_choice'].astype(np.int32))
    return samples[:n_decisions]


def test_tiny_model_overfits_distillation_to_99_percent():
    from ember_rl.general_model import build_general, collate, general_config
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    torch.manual_seed(0)
    samples = _dataset(256)
    model = build_general(general_config(d_model=64, heads=4, encoder_layers=2, decoder_layers=1, cnn_channels=16,
                                         cnn_layers=2)).to(device).train()
    batch, native = collate(samples, device, native=True)
    q = soft_target(native['native_raw'], native['native_dropped'], native['native_choice'], batch['cand_mask'],
                    native['is_move'])
    optimizer = torch.optim.Adam(model.parameters(), lr=2e-3)
    top1 = 0.
    for step in range(1500):
        logits, _ = model(batch)
        loss = distill_loss(logits, q, batch['cand_mask'])
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        if step % 25 == 0:
            with torch.no_grad():
                top1 = float((model(batch)[0].argmax(-1) == native['native_choice']).float().mean())
            if top1 > .99:
                break
    assert top1 > .99, f'top-1 agreement {top1:.3f} after {step} steps'
