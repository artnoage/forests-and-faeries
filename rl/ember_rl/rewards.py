"""Reward constants and two-team potential shaping for general-backend RL."""
from __future__ import annotations

STEP_COST = -0.002


def team_reward(team, gamma, potential_before, potential_after, terminated, winner, *,
                step_cost=STEP_COST, horizon_score=None):
    """One team's transition reward between two of its own decisions."""
    sign = 1. if team == 'heroes' else -1.
    base = 0.
    if terminated:
        if horizon_score is not None:
            base = sign * horizon_score
        else:
            base = 0. if winner is None else (1. if winner == team else -1.)
    return base + step_cost + gamma * sign * potential_after - sign * potential_before
