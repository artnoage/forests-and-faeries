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
    def __init__(self, specs, *, floor=.25, window=32, prior=8., fit_games=4096, refresh=64, min_fit=256, l2=1.):
        self.specs = specs
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
        for _ in range(8):               # Newton steps on the mean cross-entropy + L2 / n
            p = 1. / (1. + np.exp(-x @ w))
            grad = x.T @ (p - y) + reg @ w
            hess = (x * (p * (1 - p))[:, None]).T @ x + reg + 1e-6 * np.eye(x.shape[1])
            step = np.linalg.solve(hess, grad)
            w -= step
            if np.abs(step).max() < 1e-6:
                break
        self.coef[key] = w.tolist()

    def fitted(self, key: str, encounter: str) -> float:
        w = self.coef.get(key)
        if w is None:
            return .5
        return float(1. / (1. + np.exp(-self.x[self.index[encounter]] @ np.asarray(w))))

    def p(self, key: str, encounter: str) -> float:
        n, s = self.tables.get(key, {}).get(encounter, (0., 0.))
        return (s + self.prior * self.fitted(key, encounter)) / (n + self.prior)

    def weight_of(self, p: float) -> float:
        return self.floor + (1. - self.floor) * 4. * p * (1. - p)

    def weights(self, key: str) -> tuple[tuple, dict]:
        """(cache key, {encounter: weight}) for sampling; recomputed every `refresh` games of `key`."""
        cached = self._weights.get(key)
        if cached is None:
            version = (key, self.seen.get(key, 0) // self.refresh)
            cached = (version, {e: self.weight_of(self.p(key, e)) for e in self.rows})
            self._weights[key] = cached
        return cached

    # ---- reports and checkpoints ----
    def report(self, key: str) -> dict:
        ps = np.array([self.p(key, e) for e in self.rows])
        ws = self.floor + (1 - self.floor) * 4 * ps * (1 - ps)
        return dict(rows=len(self.rows), rows_played=len(self.tables.get(key, {})), games=self.seen.get(key, 0),
                    fitted=self.coef.get(key) is not None, mean_p=round(float(ps.mean()), 4),
                    outside_20_80=round(float(np.mean((ps < .2) | (ps > .8))), 4),
                    weight_mean=round(float(ws.mean()), 4), weight_min=round(float(ws.min()), 4))

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
