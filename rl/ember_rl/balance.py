"""Balance for the learners: training rows weighted by how close the current matchup is on them.

Fable's l3-open idea 3. A catalog row is balanced for the native AI, not for the trained players (on the
fixed l2 test maps trained heroes won between 20% and 82% per encounter). With --learner-balance a train
row is drawn with weight

    w = floor + (1 - floor) * 4 p (1 - p)

where p is the current hero result on that row in training games of the current learner (one table per
learner team: in the gated schedule the heroes' table describes the learning heroes against the frozen
monsters, and the other way round). The party / map family / band levels of `SpecSource` still apply on
top: the weights only choose among the rows of a drawn cell.

p of a row: a hero result r per finished training game (native hero win 1, monster win 0, anything else
- draw, horizon, truncation - 0.5), counted with decay 1 - 1/window per game on that row, and shrunk
toward a prior with the strength of `prior` games:

    p = (decayed sum + prior * q) / (decayed count + prior)

q is a logistic fit over the team's last `fit_games` games on the row's features (monster counts by kind,
the party, the map family; L2-regularised Newton steps), refitted every `refresh` games once `min_fit`
games are in; 0.5 before. So with few rows a row's own results dominate, and with thousands of rows
(a few games each) the fit carries the estimate. Weights are recomputed every `refresh` games of a team.

--balance-target T (recipe-20261125, option E). The weight above is symmetric around p = 0.5: when one side
loses most of its training games on nearly every row (the monster learner against improved heroes lost 60-68%),
it prefers the close rows but does not move the learner's mean result. With a target the weights are tilted:

    w = (floor + (1 - floor) * 4 p (1 - p)) * exp(t * (p - goal))

goal is the hero result that gives the learner T (heroes: T, monsters: 1 - T, self-play: 0.5), and t is solved
by bisection in [-tilt_max, tilt_max] so that the expected hero result of a training draw equals goal, or comes
as close as the limit allows. The expectation is exact for the nested sampling: sum over the cells (the leaves
of `SpecSource`'s tree, with their fixed probabilities) of the cell's weighted mean p. Only rows inside a drawn
cell are reweighted, so the party, map family and band shares of training stay as configured, and no stat
block or roster changes: the learner just meets its harder or easier existing rows more or less often.

The tables are kept (and logged) even without --learner-balance, so a control run reports the same
health numbers: the share of training decisions in horizon games and on rows outside 20-80%.
"""
from __future__ import annotations

import copy
from collections import deque

import numpy as np

from ember_rl.general_env import encounter_units


def hero_result(info) -> float:
    """1 for a native hero win, 0 for a monster win, 0.5 otherwise (draw, horizon, truncation)."""
    if info['terminated'] and info.get('task_end') == 'native':
        if info['winner'] == 'heroes':
            return 1.
        if info['winner'] == 'monsters':
            return 0.
    return .5


class LearnerBalance:
    def __init__(self, specs, *, floor=.25, window=32, prior=8., fit_games=4096, refresh=64, min_fit=256, l2=1.,
                 target=None, tilt_max=6.):
        self.specs = specs
        self.target = None if target is None else float(target)
        self.tilt_max = float(tilt_max)
        self.tilt = {}          # key -> t of the last weights (--balance-target)
        self.floor, self.prior, self.l2 = float(floor), float(prior), float(l2)
        self.decay = 1. - 1. / window if window and window > 0 else 1.
        self.fit_games, self.refresh, self.min_fit = int(fit_games), int(refresh), int(min_fit)
        self.rows = specs.train_encounters()
        self.index = {e: i for i, e in enumerate(self.rows)}
        self.x = self._features()
        self.tables = {}        # key -> {encounter: [decayed count, decayed hero result sum]}
        self.games = {}         # key -> deque of (row index, r)
        self.coef = {}          # key -> logistic coefficients or None
        self.seen = {}          # key -> games observed
        self._weights = {}      # key -> (version, {encounter: weight})
        self.leaf, self.leaf_prob = self._leaves()

    def _leaves(self):
        """(leaf index per row, probability per leaf) of the training draw: the cells of the nested sampling
        tree (or the tiers), within which a row is drawn by weight."""
        nodes = []

        def walk(node):
            if node and isinstance(node[0], tuple):
                for _, _, child in node:
                    walk(child)
            else:
                nodes.append(node)
        if getattr(self.specs, 'nested', False):
            walk(self.specs.tree)
        else:
            nodes = [ids for _, _, ids in self.specs.tiers]
        leaf = np.zeros(len(self.rows), int)
        prob = np.zeros(len(nodes))
        for k, ids in enumerate(nodes):
            for e in ids:
                leaf[self.index[e]] = k
                prob[k] += self.specs.train_prob[e]
        return leaf, prob

    def goal(self, key: str, target='own') -> float | None:
        """The hero result that gives the learner of `key` its --balance-target (None: no target)."""
        target = self.target if target == 'own' else target
        if target is None:
            return None
        return float(target) if key == 'heroes' else 1. - float(target) if key == 'monsters' else .5

    def expected(self, p: np.ndarray, w: np.ndarray) -> float:
        """The expected hero result of one training draw with row weights w (exact for the nested sampling)."""
        total = np.bincount(self.leaf, weights=w, minlength=len(self.leaf_prob))
        mean = np.bincount(self.leaf, weights=w * p, minlength=len(self.leaf_prob)) / np.maximum(total, 1e-300)
        return float((self.leaf_prob * mean).sum() / self.leaf_prob.sum())

    def probabilities(self, w: np.ndarray) -> np.ndarray:
        """The probability of each row in one training draw with row weights w."""
        total = np.bincount(self.leaf, weights=w, minlength=len(self.leaf_prob))
        return self.leaf_prob[self.leaf] / self.leaf_prob.sum() * w / np.maximum(total[self.leaf], 1e-300)

    def solve_tilt(self, p: np.ndarray, base: np.ndarray, goal: float) -> float:
        """t in [-tilt_max, tilt_max] whose weights base * exp(t (p - goal)) give expected(p, w) = goal; the
        nearest end when the goal is out of reach (the expectation rises with t)."""
        value = lambda t: self.expected(p, base * np.exp(t * (p - goal)))
        lo, hi = -self.tilt_max, self.tilt_max
        if value(lo) >= goal:
            return lo
        if value(hi) <= goal:
            return hi
        for _ in range(40):
            mid = .5 * (lo + hi)
            if value(mid) < goal:
                lo = mid
            else:
                hi = mid
        return .5 * (lo + hi)

    def row_weights(self, key: str, floor: float | None = None, target='own') -> tuple[np.ndarray, np.ndarray, float]:
        """(p, weight, t) of every train row for `key` now; `floor` and `target` override the configured ones
        (for reports and what-if tables)."""
        floor = self.floor if floor is None else float(floor)
        p = np.array([self.p(key, e) for e in self.rows])
        base = floor + (1. - floor) * 4. * p * (1. - p)
        goal = self.goal(key, target)
        if goal is None:
            return p, base, 0.
        t = self.solve_tilt(p, np.maximum(base, 1e-12), goal)
        return p, np.maximum(base, 1e-12) * np.exp(t * (p - goal)), t

    def _features(self) -> np.ndarray:
        """Row features: monster counts by content id, party one-hot, map family one-hot, bias."""
        kinds, parties, families = set(), set(), set()
        units = {}
        for e in self.rows:
            row = self.specs.rows[e]
            listed = encounter_units(row) or []
            units[e] = [u['content'] for u in listed if u.get('team') == 'monsters' and u.get('content')]
            kinds.update(units[e])
            parties.add(self.specs.meta[e]['party'])
            families.add(self.specs.meta[e]['family'])
        columns = ([('kind', k) for k in sorted(kinds)] + [('party', p) for p in sorted(parties)]
                   + [('family', f) for f in sorted(families)])
        col = {c: i for i, c in enumerate(columns)}
        x = np.zeros((len(self.rows), len(columns) + 1))
        for i, e in enumerate(self.rows):
            for k in units[e]:
                x[i, col[('kind', k)]] += 1.
            x[i, col[('party', self.specs.meta[e]['party'])]] = 1.
            x[i, col[('family', self.specs.meta[e]['family'])]] = 1.
        x[:, -1] = 1.
        return x

    # ---- results ----
    def observe(self, key: str, encounter: str, r: float) -> None:
        i = self.index.get(encounter)
        if i is None:
            return
        table = self.tables.setdefault(key, {})
        entry = table.setdefault(encounter, [0., 0.])
        entry[0] = entry[0] * self.decay + 1.
        entry[1] = entry[1] * self.decay + float(r)
        self.games.setdefault(key, deque(maxlen=self.fit_games)).append((i, float(r)))
        self.seen[key] = self.seen.get(key, 0) + 1
        if self.seen[key] % self.refresh == 0:
            self._refit(key)
            self._weights.pop(key, None)

    def _refit(self, key):
        games = self.games.get(key)
        if not games or len(games) < self.min_fit:
            self.coef[key] = None
            return
        idx = np.fromiter((i for i, _ in games), int, len(games))
        y = np.fromiter((r for _, r in games), float, len(games))
        x = self.x[idx]
        w = self.coef.get(key)
        w = np.zeros(x.shape[1]) if w is None or len(w) != x.shape[1] else np.array(w)
        reg = self.l2 * np.eye(x.shape[1])
        reg[-1, -1] = 0.                 # no penalty on the bias
        sane = lambda v: bool(np.all(np.isfinite(v)) and np.abs(v).max() <= self.COEF_LIMIT)
        if not sane(w):                  # never warm-start from a diverged fit
            w = np.zeros(x.shape[1])
        with np.errstate(over='ignore', invalid='ignore'):
            for _ in range(8):           # Newton steps on the mean cross-entropy + L2 / n
                p = 1. / (1. + np.exp(-x @ w))
                grad = x.T @ (p - y) + reg @ w
                hess = (x * (p * (1 - p))[:, None]).T @ x + reg + 1e-6 * np.eye(x.shape[1])
                step = np.linalg.solve(hess, grad)
                w -= step
                if np.abs(step).max() < 1e-6:
                    break
        if not sane(w):
            # Undamped Newton steps can run away once the fit saturates (f4-oldleague's monster table on
            # 2026-11-25: coefficients of 1e9, every row's fitted estimate 1.0, and the warm start kept it
            # there). Fit again from zero with step halving on the penalised loss; failing that, no fit.
            w = self._damped_fit(x, y, reg)
        self.coef[key] = None if w is None else w.tolist()

    COEF_LIMIT = 30.        # a logistic coefficient beyond this is a diverged fit, not an estimate

    def _damped_fit(self, x, y, reg):
        def loss(w):
            z = x @ w
            return float(np.sum(np.logaddexp(0., z) - y * z) + .5 * w @ reg @ w)
        w = np.zeros(x.shape[1])
        current = loss(w)
        for _ in range(50):
            p = 1. / (1. + np.exp(-np.clip(x @ w, -50., 50.)))
            grad = x.T @ (p - y) + reg @ w
            hess = (x * (p * (1 - p))[:, None]).T @ x + reg + 1e-6 * np.eye(x.shape[1])
            step = np.linalg.solve(hess, grad)
            scale = 1.
            while scale > 1e-6 and not loss(w - scale * step) <= current:
                scale /= 2.
            if scale <= 1e-6:
                break
            w = w - scale * step
            current = loss(w)
            if np.abs(scale * step).max() < 1e-6:
                break
        return w if np.all(np.isfinite(w)) and np.abs(w).max() <= self.COEF_LIMIT else None

    def fitted(self, key: str, encounter: str) -> float:
        w = self.coef.get(key)
        if w is None:
            return .5
        return float(1. / (1. + np.exp(-self.x[self.index[encounter]] @ np.asarray(w))))

    def p(self, key: str, encounter: str) -> float:
        n, s = self.tables.get(key, {}).get(encounter, (0., 0.))
        return (s + self.prior * self.fitted(key, encounter)) / (n + self.prior)

    def weight_of(self, p: float, key: str | None = None) -> float:
        """The sampling weight of a row with estimate p (for `key` with --balance-target: tilted by the
        team's current t)."""
        w = self.floor + (1. - self.floor) * 4. * p * (1. - p)
        goal = self.goal(key) if key is not None else None
        if goal is not None:
            w = max(w, 1e-12) * float(np.exp(self.tilt.get(key, 0.) * (p - goal)))
        return w

    def weights(self, key: str) -> tuple[tuple, dict]:
        """(cache key, {encounter: weight}) for sampling; recomputed every `refresh` games of `key`."""
        cached = self._weights.get(key)
        if cached is None:
            version = (key, self.seen.get(key, 0) // self.refresh)
            if self.target is None:
                cached = (version, {e: self.weight_of(self.p(key, e)) for e in self.rows})
            else:
                _, w, self.tilt[key] = self.row_weights(key)
                cached = (version, dict(zip(self.rows, w.tolist())))
            self._weights[key] = cached
        return cached

    # ---- reports and checkpoints ----
    def report(self, key: str) -> dict:
        ps, ws, t = self.row_weights(key)
        out = dict(rows=len(self.rows), rows_played=len(self.tables.get(key, {})), games=self.seen.get(key, 0),
                   fitted=self.coef.get(key) is not None, mean_p=round(float(ps.mean()), 4),
                   outside_20_80=round(float(np.mean((ps < .2) | (ps > .8))), 4),
                   weight_mean=round(float(ws.mean()), 4), weight_min=round(float(ws.min()), 4))
        if self.target is not None:
            # The hero result a training draw expects with these weights and with uniform rows, and the tilt.
            out.update(target=self.target, goal=self.goal(key), tilt=round(t, 4),
                       expected_p=round(self.expected(ps, ws), 4), uniform_p=round(self.expected(ps, np.ones(len(ps))), 4))
        return out

    def state(self) -> dict:
        return dict(tables=copy.deepcopy(self.tables), games={k: list(v) for k, v in self.games.items()},
                    coef=copy.deepcopy(self.coef), seen=dict(self.seen), rows=list(self.rows))

    def load_state(self, state: dict | None) -> None:
        if not state:
            return
        known = set(self.index)
        self.tables = {k: {e: list(v) for e, v in t.items() if e in known} for k, t in state['tables'].items()}
        same_rows = state.get('rows') == self.rows
        self.games = {k: deque(((i, r) for i, r in v if same_rows), maxlen=self.fit_games)
                      for k, v in state['games'].items()}
        self.coef = copy.deepcopy(state['coef']) if same_rows else {}
        self.seen = dict(state['seen'])
        self._weights = {}
