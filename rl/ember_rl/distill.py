"""Native-score distillation (GENERAL_ENV.md §6): soft target, losses, DAgger mixing, critic targets.

Soft target (§6.2), per decision with native scores s_k:

    r_k = s_max - s_k              s_max over legal, non-dropped rows with finite s
    z_k = -r_k / T_move (moves)  or  -r_k / T_act (everything else, End Turn included)
    z_k = -inf                     if dropped or s_k = -inf (or NaN)
    z_c = 0                        for c = native_choice
    q   = (1 - alpha) onehot(c) + alpha softmax(z)
    CE  = -sum_k q_k log pi(k)

For alpha < 0.5 the mode of q is exactly the native choice. Rows without
native data (native_choice = -1) get q = 0 and are left out of every mean.

Critic targets (§6.3): Monte Carlo returns of the training objective under
native-vs-native play, either from the played game itself (teacher-forced
games) or averaged over K continuations of a snapshot with fresh dice.
"""
from __future__ import annotations

import math
from collections import Counter, deque
from collections.abc import Mapping, Sequence
from dataclasses import dataclass

import numpy as np
import torch
from torch import Tensor
from torch.nn import functional as F

from ember_rl.general_env import MOVE_KIND, TEAMS, as_slots, info_row


# --------------------------------------------------------------------------- soft target and losses

def soft_target(native_raw: Tensor, native_dropped: Tensor, native_choice: Tensor, cand_mask: Tensor,
                is_move: Tensor, *, t_move: float = .25, t_act: float = 1., alpha: float = .3) -> Tensor:
    """q [B,K] from native scores; all inputs [B,K] except native_choice [B] (int64, -1 = no data)."""
    if not (t_move > 0 and t_act > 0 and 0 <= alpha <= 1):
        raise ValueError('temperatures must be positive and alpha in [0, 1]')
    raw = native_raw.float()
    valid = native_choice >= 0
    choice = native_choice.clamp(min=0).long()
    usable = cand_mask & ~native_dropped & torch.isfinite(raw)
    s_max = raw.masked_fill(~usable, -torch.inf).amax(-1, keepdim=True)
    temperature = torch.where(is_move, float(t_move), float(t_act))   # Python scalars: no host-device copy
    z = ((raw - s_max) / temperature).masked_fill(~usable, -torch.inf)
    z = z.scatter(1, choice[:, None], 0.)
    soft = torch.softmax(z, -1)
    onehot = F.one_hot(choice, raw.shape[1]).to(soft.dtype)
    q = (1 - alpha) * onehot + alpha * soft
    return q * valid[:, None].to(q.dtype)


def masked_log_softmax(logits: Tensor, mask: Tensor) -> Tensor:
    """log pi over legal rows; 0 (not -inf) on masked rows so products with q stay finite."""
    return logits.float().masked_fill(~mask, -torch.inf).log_softmax(-1).masked_fill(~mask, 0.)


def distill_loss(logits: Tensor, q: Tensor, mask: Tensor) -> Tensor:
    """Mean cross-entropy -sum_k q_k log pi(k) over rows that have a target (sum q = 1);
    0 when no row has one. No host sync: with every row targeted (native scores on) the
    result is exactly ce.mean(), otherwise the mean over the targeted rows."""
    has = q.sum(-1) > .5
    ce = -(q * masked_log_softmax(logits, mask)).sum(-1)
    partial = (ce * has).sum() / has.sum().clamp(min=1)
    return torch.where(has.all(), ce.mean(), partial)


def teacher_kl(teacher, logits: Tensor, batch: Mapping[str, Tensor]) -> Tensor:
    """Mean KL(teacher || learner) for general models on identical candidate sets."""
    if teacher.training or any(p.requires_grad for p in teacher.parameters()):
        raise ValueError('Teacher must be frozen and in eval mode')
    mask = batch['cand_mask']
    with torch.no_grad():
        teacher_logits, _ = teacher(batch)
        teacher_log = masked_log_softmax(teacher_logits, mask)
        probabilities = teacher_log.exp().masked_fill(~mask, 0.)
    loss = (probabilities * (teacher_log - masked_log_softmax(logits, mask))).sum(-1).mean()
    if not bool(torch.isfinite(loss)):
        raise FloatingPointError('Nonfinite teacher KL')
    return loss


@torch.no_grad()
def distill_metrics(logits: Tensor, q: Tensor, native_choice: Tensor, mask: Tensor, kinds: Tensor,
                    native_raw: Tensor | None = None, native_dropped: Tensor | None = None, eps: float = 1e-6) -> dict:
    """Decision-level agreement (§6.4): top-1, q at the student's argmax, KL(q || pi), counts.

    kinds [B,K] are action-kind ids; `confusion` counts (native kind, student kind)
    pairs where the student's greedy row differs from the native choice. `top1_nonmove` is
    top-1 over decisions whose native choice is not a move: native move scores also depend
    on per-creature memory (visited squares, recent destinations, GENERAL_ENV.md §4.2) that
    the observation does not encode.

    With native_raw and native_dropped, also `top1_tie`: the student's greedy row is the
    native choice or another usable row with the same native score (within eps). The native
    AI breaks exact ties by candidate order, which the network does not see (16% of native
    decisions on l2-undead-v1 are tied, mostly moves), so strict top-1 is capped below 1."""
    has = native_choice >= 0
    n = int(has.sum())
    if n == 0:
        return dict(n=0, top1=None, top1_tie=None, top1_nonmove=None, n_nonmove=0, q_agree=None, kl=None,
                    confusion={})
    greedy = logits.argmax(-1)
    choice = native_choice.clamp(min=0)
    agree = (greedy == choice) & has
    log_pi = masked_log_softmax(logits, mask)
    kl = (q * (torch.log(q.clamp(min=1e-12)) - log_pi)).masked_fill(q <= 0, 0.).sum(-1)
    native_kind = kinds.gather(1, choice[:, None]).squeeze(1)
    student_kind = kinds.gather(1, greedy[:, None]).squeeze(1)
    wrong = has & ~agree
    confusion = Counter(zip(native_kind[wrong].tolist(), student_kind[wrong].tolist()))
    nonmove = has & (native_kind != MOVE_KIND)
    n_nonmove = int(nonmove.sum())
    out = dict(n=n, top1=float(agree.sum()) / n,
               n_nonmove=n_nonmove, top1_nonmove=float((agree & nonmove).sum()) / n_nonmove if n_nonmove else None,
               q_agree=float(q.gather(1, greedy[:, None]).squeeze(1)[has].sum()) / n,
               kl=float(kl[has].sum()) / n, confusion={f'{a}->{b}': c for (a, b), c in sorted(confusion.items())})
    if native_raw is not None and native_dropped is not None:
        raw = native_raw.float()
        picked, chosen = raw.gather(1, greedy[:, None]).squeeze(1), raw.gather(1, choice[:, None]).squeeze(1)
        usable = mask.gather(1, greedy[:, None]).squeeze(1) & ~native_dropped.gather(1, greedy[:, None]).squeeze(1)
        tie = usable & torch.isfinite(picked) & torch.isfinite(chosen) & ((picked - chosen).abs() <= eps)
        out['top1_tie'] = float((agree | (tie & has)).sum()) / n
    else:
        out['top1_tie'] = None
    return out


# --------------------------------------------------------------------------- schedules

def beta_at(decisions: int, teacher_forced: int, dagger: int, final: float = 0.) -> float:
    """Probability of executing the native choice: 1 for the teacher-forced warm-up,
    then linear from 1 to `final` over `dagger` decisions, then `final`."""
    if decisions < teacher_forced:
        return 1.
    if dagger <= 0:
        return float(final)
    progress = min(1., (decisions - teacher_forced) / dagger)
    return 1. + progress * (final - 1.)


def mix_rows(student: np.ndarray, native: np.ndarray, beta: float, rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    """DAgger: per decision, the native row with probability beta, else the student's.
    Returns (executed rows, from_native flags)."""
    from_native = rng.random(len(student)) < beta
    return np.where(from_native, native, student).astype(np.int32), from_native


def annealed(start: float, final: float, decay_updates: int, updates: int) -> float:
    """Linear annealing from start to final over decay_updates (0 = constant start)."""
    if start <= 0 and final <= 0:
        return 0.
    if decay_updates <= 0:
        return float(start)
    progress = min(1., updates / decay_updates)
    return float(start + progress * (final - start))


def explained_variance(values: Tensor, returns: Tensor) -> float:
    variance = float(returns.var(unbiased=False))
    if variance <= 1e-12:
        return float('nan')
    return 1. - float((returns - values).var(unbiased=False)) / variance


# --------------------------------------------------------------------------- returns

@dataclass(frozen=True)
class RewardConfig:
    """The training objective's time terms, as in duel.Trainer.time_terms."""
    gamma: float = 1.
    time_unit: str = 'round'
    round_cost: float = 0.
    round_cost_teams: tuple = TEAMS

    @classmethod
    def from_args(cls, args) -> 'RewardConfig':
        return cls(float(args.gamma), args.time_unit, float(args.round_cost), tuple(args.round_cost_teams))

    def time_terms(self, round_before: int, round_after: int, team: str) -> tuple[float, float]:
        if self.time_unit == 'decision':
            from ember_rl.rewards import STEP_COST
            return self.gamma, STEP_COST
        rounds = max(0, int(round_after) - int(round_before))
        cost = self.round_cost if team in self.round_cost_teams else 0.
        return self.gamma ** rounds, cost * rounds


def episode_returns(decisions: Sequence[Mapping], final: Mapping, reward: RewardConfig) -> list[float | None]:
    """Return-to-go of each decision for its own team (same rewards as duel `team_reward`).

    decisions: game-ordered dicts with team, round, potential (info at the decision).
    final: the info dict at the end (terminated, truncated, winner, task_end, score,
    round, potential). A safety truncation has no bootstrap here, so its returns are None."""
    from ember_rl.rewards import team_reward
    out: list[float | None] = [None] * len(decisions)
    if final['truncated'] and not final['terminated']:
        return out
    if not final['terminated']:
        raise ValueError('episode_returns needs a finished game')
    horizon = final['score'] if final.get('task_end') == 'health' else None
    for team in TEAMS:
        own = [i for i, d in enumerate(decisions) if d['team'] == team]
        g = 0.
        for j in range(len(own) - 1, -1, -1):
            current = decisions[own[j]]
            last = j == len(own) - 1
            after = final if last else decisions[own[j + 1]]
            discount, cost = reward.time_terms(current['round'], after['round'], team)
            r = team_reward(team, discount, current['potential'], after['potential'] if not last else 0.,
                            last, final['winner'] if last else None, step_cost=cost,
                            horizon_score=horizon if last else None)
            g = r if last else r + discount * g
            out[own[j]] = g
    return out


def k_rollout_returns(env, roots: Sequence[tuple[object, str]], k: int, slots: Sequence[int],
                      reward: RewardConfig, rng: np.random.Generator) -> np.ndarray:
    """V_native estimates: each root (snapshot taken at a decision of `team`) is continued
    k times with fresh dice, both sides executing the native choice. Returns the mean
    return per root (NaN when every continuation was a safety truncation).

    Uses `env.restore(slot, snapshot, dice_seed)`, `observe` and `step` on the given
    slots, which the caller must not use meanwhile."""
    if k < 1 or not slots:
        raise ValueError('need k >= 1 and at least one slot')
    jobs = deque((r, j) for r in range(len(roots)) for j in range(k))
    results = [[] for _ in roots]
    free = list(slots)
    active = {}                      # slot -> (root index, decisions list)
    while jobs or active:
        while jobs and free:
            slot = free.pop()
            root, _ = jobs.popleft()
            env.restore(slot, roots[root][0], dice_seed=int(rng.integers(2**62)))
            info = info_row(env.info([slot]), 0)
            if info['done']:
                raise ValueError('k_rollout_returns roots must be decision states')
            if info['team'] != roots[root][1]:
                raise ValueError('root team does not match the snapshot')
            active[slot] = (root, [dict(team=info['team'], round=info['round'], potential=info['potential'])])
        live = sorted(active)
        obs = env.observe(live)
        rows = np.asarray(obs['native_choice'], np.int32)
        if np.any(rows < 0):
            raise ValueError('k_rollout_returns needs an environment with native scores')
        info = env.step(live, rows)
        for i, slot in enumerate(live):
            row = info_row(info, i)
            root, decisions = active[slot]
            if row['done']:
                value = episode_returns(decisions, row, reward)[0]
                if value is not None:
                    results[root].append(value)
                del active[slot]
                free.append(slot)
            else:
                decisions.append(dict(team=row['team'], round=row['round'], potential=row['potential']))
    return np.array([np.mean(r) if r else np.nan for r in results], np.float64)


def value_loss(values: Tensor, targets: Tensor) -> Tensor:
    """0.5 * MSE over finite targets (NaN = no target); 0 when there is none."""
    has = torch.isfinite(targets)
    if not bool(has.any()):
        return values.sum() * 0.
    return .5 * (values[has] - targets[has]).square().mean()


def tost_within(p: float, p0: float, n: int, n0: int, margin: float = .03, z: float = 1.645) -> bool:
    """Two one-sided tests at 5% each: is |p - p0| < margin? (unpaired normal approximation,
    conservative for paired specs; variances use (x + .5) / (n + 1) so that 0/n or n/n
    rates do not claim zero variance)."""
    if n == 0 or n0 == 0:
        return False
    shrunk = lambda rate, count: (rate * count + .5) / (count + 1)
    a, b = shrunk(p, n), shrunk(p0, n0)
    se = math.sqrt(a * (1 - a) / n + b * (1 - b) / n0)
    diff = p - p0
    return diff - z * se > -margin and diff + z * se < margin


__all__ = ['soft_target', 'masked_log_softmax', 'distill_loss', 'teacher_kl', 'distill_metrics', 'beta_at',
           'mix_rows', 'annealed', 'explained_variance', 'RewardConfig', 'episode_returns', 'k_rollout_returns',
           'value_loss', 'tost_within', 'as_slots']
