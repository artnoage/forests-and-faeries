"""FakeBatchEnv: a tiny pure-Python skirmish game that honours the `BatchEnv` contract.

It stands in for `ember_rs.BatchEnv` (stage G6) in the trainer tests. Nothing
about its rules matters except that it produces valid, consistent arrays:
- creature tokens, map channels, candidate rows with pointers and cells, all
  laid out as in GENERAL_ENV.md §5.1 (feature meanings are only loosely
  modelled on §5.2-§5.5);
- native scores with the §6.1 structure (attacks in expected hit points, moves
  on a small heuristic scale, End Turn 0 in melee else -inf, a droppable
  Dodge), and a native choice that is the first argmax over non-dropped rows;
- forced steps, native-controlled teams and per-creature control
  (`external_units`), elimination, the health-score horizon (`max_rounds`
  rounds played, `round` = max_rounds + 1 there) and safety truncation,
  snapshot/restore with reseeded dice, as `ember_rs.BatchEnv` (G6) does.

The native scores are simple functions of features that appear in the
candidate rows (expected damage, progress), so a student can learn them.
"""
from __future__ import annotations

import copy
import json
import zlib
from pathlib import Path

import numpy as np

from ember_rl.general_env import (
    DEFAULT_DIMS, END_TURN_KIND, FEATURE_DIMS, FEATURE_VERSION, INFO_LAYOUT, MOVE_MODES, OPTIONAL_INFO, TEAM_CODE, TEAMS,
    EpisodeSpec, as_slots,
    check_controllers, load_catalog, normalize_dims, obs_layout,
)

POTENTIAL_SCALE = .3
TURN_CAP = 24
# Action kinds (content/vocab.json action_kinds)
MOVE, ATTACK, DODGE, SPELL = 0, 1, 3, 7
MAGIC_MISSILE, BURNING_HANDS = 22, 17
DIRECTIONS = ((-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1))

# kind id -> (character id, hp, ac, to_hit, damage mean, reach, speed, spell, attack id)
STATS = {
    0: (0, 28, 18, 6, 9., 1, 6, None, 0),            # guy
    1: (1, 22, 16, 4, 6., 1, 6, BURNING_HANDS, 2),   # elion
    2: (2, 16, 13, 5, 5., 12, 6, MAGIC_MISSILE, 3),  # curogana
    3: (-1, 13, 13, 4, 5.5, 16, 6, None, 5),         # skeleton (bow)
    4: (-1, 22, 8, 3, 4.5, 1, 4, None, 6),           # zombie
    5: (-1, 22, 12, 4, 7., 1, 6, None, 8),           # ghoul
    6: (-1, 36, 13, 5, 8., 1, 6, None, 8),           # ghast
    7: (-1, 22, 12, 4, 10., 1, 10, None, 9),         # specter
    8: (-1, 16, 12, 4, 9., 1, 8, None, 10),          # shadow
    9: (-1, 45, 14, 4, 6.5, 1, 6, None, 11),         # wight
}


HERO_NAMES = ('guy', 'elion', 'curogana')
MONSTER_NAMES = ('skeleton', 'zombie', 'ghoul', 'ghast', 'specter', 'shadow', 'wight')


def roster_size(encounter: str, n_cap: int = DEFAULT_DIMS['N']) -> tuple[int, int]:
    """(heroes, monsters) of a fake encounter: a function of its id only."""
    code = zlib.crc32(encounter.encode())
    n_heroes = 1 + code % 3
    return n_heroes, min(1 + (code // 3) % 5, n_cap - n_heroes)


def fake_catalog(n_per_split=(6, 3, 2)) -> list[dict]:
    """Synthetic encounter catalog rows (train, dev, test) for FakeBatchEnv."""
    rows = []
    for split, count in zip(('train', 'dev', 'test'), n_per_split):
        for k in range(count):
            eid = f'fake-{split}-{k}'
            n_heroes, n_monsters = roster_size(eid)
            rows.append(dict(id=eid, tier=f'T{k % 2}', split=split, p=.5, truncation=0., n_units=n_heroes + n_monsters,
                             n_heroes=n_heroes))
    return rows


def _phit(to_hit, ac, disadvantage=False):
    p = min(.95, max(.05, (21 + to_hit - ac) / 20))
    return p * p if disadvantage else p


class _Unit:
    __slots__ = ('uid', 'team', 'kind', 'char', 'x', 'y', 'hp', 'max_hp', 'ac', 'to_hit', 'dmg', 'reach', 'speed',
                 'spell', 'attack', 'slots', 'dodging', 'conc')

    def __init__(self, uid, team, kind, x, y):
        char, hp, ac, to_hit, dmg, reach, speed, spell, attack = STATS[kind]
        self.uid, self.team, self.kind, self.char, self.x, self.y = uid, team, kind, char, x, y
        self.hp = self.max_hp = hp
        self.ac, self.to_hit, self.dmg, self.reach, self.speed = ac, to_hit, dmg, reach, speed
        self.spell, self.attack, self.slots = spell, attack, 2 if spell is not None else 0
        self.dodging, self.conc = False, -1

    @property
    def alive(self):
        return self.hp > 0


def _cheb(a, b):
    return max(abs(a[0] - b[0]), abs(a[1] - b[1]))


class _Game:
    def __init__(self, spec: EpisodeSpec, controllers, cfg):
        self.spec, self.cfg = spec, cfg
        teams, external_units = check_controllers(controllers)
        self.controllers = teams
        s = cfg['canvas']
        mrng = np.random.default_rng([spec.map_seed, 1])
        self.w, self.h = int(mrng.integers(6, min(s, 16) + 1)), int(mrng.integers(6, min(s, 12) + 1))
        walls = mrng.random((self.h, self.w)) < .08
        lrng = np.random.default_rng([spec.layout_seed, 2])
        if spec.offset_x < 0:
            self.ox, self.oy = int(lrng.integers(0, s - self.w + 1)), int(lrng.integers(0, s - self.h + 1))
        else:
            self.ox, self.oy = int(spec.offset_x), int(spec.offset_y)
            if self.ox + self.w > s or self.oy + self.h > s:
                raise ValueError('map does not fit the canvas at this offset')
        n_heroes, n_monsters = roster_size(spec.encounter, cfg['N'])
        heroes = [int(k) for k in lrng.choice(3, n_heroes, replace=False)]
        monsters = [3 + int(k) for k in lrng.integers(0, 7, n_monsters)]
        third = max(1, self.w // 3)
        self.units = []
        taken = set()
        numbers = {}
        for team, kinds, cols in (('heroes', heroes, range(0, third)), ('monsters', monsters, range(self.w - third, self.w))):
            cells = [(x, y) for x in cols for y in range(self.h)]
            order = lrng.permutation(len(cells))
            placed = 0
            for index in order:
                if placed == len(kinds):
                    break
                x, y = cells[int(index)]
                if (x, y) in taken:
                    continue
                walls[y, x] = False
                taken.add((x, y))
                kind = kinds[placed]
                if team == 'heroes':
                    uid = HERO_NAMES[kind]
                else:
                    name = MONSTER_NAMES[kind - 3]
                    numbers[name] = numbers.get(name, 0) + 1
                    uid = f'{name}-{numbers[name]}'
                self.units.append(_Unit(uid, team, kind, x, y))
                placed += 1
        self.walls = walls
        ids = [u.uid for u in self.units]
        self.external_units = set()
        for u in external_units:
            if isinstance(u, str):
                if u not in ids:
                    raise ValueError(f'{spec.encounter} has no unit {u!r}')
                self.external_units.add(ids.index(u))
            elif int(u) >= len(self.units):
                raise ValueError(f'external unit {u} out of range: {spec.encounter} has {len(self.units)} creatures')
            else:
                self.external_units.add(int(u))
        self.dice = np.random.default_rng(spec.dice_seed)
        self.order = [int(i) for i in self.dice.permutation(len(self.units))]
        self.start_hp = {t: sum(u.max_hp for u in self.units if u.team == t) for t in TEAMS}
        self.count = {t: sum(u.team == t for u in self.units) for t in TEAMS}
        self.round, self.turn, self.steps = 1, 0, 0
        self.terminated = self.truncated = False
        self.task_end, self.winner = 0, -1
        self.forced = self.native_actions = 0
        self.history = []
        self.pending = None
        self.reset_terminal = False
        self._start_turn()

    # ---- state ----
    @property
    def done(self):
        return self.terminated or self.truncated

    def actor_index(self):
        return self.order[self.turn]

    def is_external(self, index):
        return self.controllers[self.units[index].team] == 'external' or index in self.external_units

    def team_hp(self, team):
        return sum(u.hp for u in self.units if u.team == team)

    def score(self):
        w = self.cfg['standing_weight']
        hp = self.team_hp('heroes') / self.start_hp['heroes'] - self.team_hp('monsters') / self.start_hp['monsters']
        standing = {t: sum(u.alive for u in self.units if u.team == t) / self.count[t] for t in TEAMS}
        return (1 - w) * hp + w * (standing['heroes'] - standing['monsters'])

    def potential(self):
        return 0. if self.terminated else POTENTIAL_SCALE * self.score()

    def occupied(self, x, y):
        return any(u.alive and u.x == x and u.y == y for u in self.units)

    def free(self, x, y):
        return 0 <= x < self.w and 0 <= y < self.h and not self.walls[y, x] and not self.occupied(x, y)

    # ---- turns ----
    def _start_turn(self):
        a = self.units[self.actor_index()]
        a.dodging = False
        self.movement, self.action, self.turn_decisions = a.speed, True, 0

    def _end_turn(self):
        for _ in range(len(self.order) + 1):
            self.turn += 1
            if self.turn == len(self.order):
                self.turn, self.round = 0, self.round + 1
            if self.units[self.actor_index()].alive:
                break
        self._start_turn()

    def _check_end(self):
        alive = {t: any(u.alive for u in self.units if u.team == t) for t in TEAMS}
        if all(alive.values()):
            return
        self.terminated, self.task_end = True, 1
        self.winner = -1 if not any(alive.values()) else TEAM_CODE['heroes' if alive['heroes'] else 'monsters']

    def candidates(self):
        """Legal rows of the current actor, canonical order, End Turn last."""
        ai = self.actor_index()
        a = self.units[ai]
        enemies = [(i, u) for i, u in enumerate(self.units) if u.alive and u.team != a.team]
        allies = [(i, u) for i, u in enumerate(self.units) if u.alive and u.team == a.team]
        here = (a.x, a.y)
        rows = []
        if self.action:
            for i, e in enumerate(enemies):
                index, u = e
                if _cheb(here, (u.x, u.y)) <= a.reach:
                    p = _phit(a.to_hit, u.ac, u.dodging)
                    rows.append(dict(kind=ATTACK, spell=-1, attack=a.attack, targets=[(index, 1)], cell=-1,
                                     score=p * a.dmg, dropped=False, p=p, dmg=a.dmg, ally_dmg=0.))
            near = any(_cheb(here, (u.x, u.y)) <= 6 for _, u in enemies)
            rows.append(dict(kind=DODGE, spell=-1, attack=-1, targets=[], cell=-1, score=.1,
                             dropped=a.dodging or not near, p=0., dmg=0., ally_dmg=0.))
        if self.movement >= 1 and enemies:
            before = min(_cheb(here, (u.x, u.y)) for _, u in enemies)
            for d, (dx, dy) in enumerate(DIRECTIONS):
                nx, ny = a.x + dx, a.y + dy
                if not self.free(nx, ny):
                    continue
                after = min(_cheb((nx, ny), (u.x, u.y)) for _, u in enemies)
                progress = before - after
                provokes = sum(1 for _, u in enemies if _cheb(here, (u.x, u.y)) <= 1 < _cheb((nx, ny), (u.x, u.y)))
                score = (.45 * progress if progress > 0 else -.2) - provokes
                rows.append(dict(kind=MOVE, spell=-1, attack=-1, targets=[], cell=(ny + self.oy) * self.cfg['canvas'] + nx + self.ox,
                                 score=score, dropped=False, p=0., dmg=0., ally_dmg=0., direction=d,
                                 before=before, after=after, provokes=provokes))
        if self.action and a.slots > 0 and enemies:
            if a.spell == MAGIC_MISSILE:
                in_range = [(i, u) for i, u in enemies if _cheb(here, (u.x, u.y)) <= 24][:3]
                for j, (i, u) in enumerate(in_range):
                    rows.append(dict(kind=SPELL, spell=a.spell, attack=-1, targets=[(i, 3)], cell=-1,
                                     score=3 * 3.5 * .9, dropped=False, p=1., dmg=10.5, ally_dmg=0.))
                    for i2, _ in in_range[j + 1:]:
                        rows.append(dict(kind=SPELL, spell=a.spell, attack=-1, targets=[(i, 2), (i2, 1)], cell=-1,
                                         score=3 * 3.5 * .9 - .05, dropped=False, p=1., dmg=10.5, ally_dmg=0.))
            elif a.spell == BURNING_HANDS:
                for i, u in enemies:
                    if _cheb(here, (u.x, u.y)) > 3:
                        continue
                    hit = [(j, v) for j, v in enumerate(self.units)
                           if v.alive and j != ai and _cheb((u.x, u.y), (v.x, v.y)) <= 1]
                    foes = sum(1 for _, v in hit if v.team != a.team)
                    friends = sum(1 for _, v in hit if v.team == a.team)
                    rows.append(dict(kind=SPELL, spell=a.spell, attack=-1, targets=[(j, 1) for j, _ in hit],
                                     cell=(u.y + self.oy) * self.cfg['canvas'] + u.x + self.ox,
                                     score=.7 * 10.5 * foes - 1.5 * .7 * 10.5 * friends, dropped=False,
                                     p=.7, dmg=10.5 * foes, ally_dmg=10.5 * friends))
        in_melee = any(_cheb(here, (u.x, u.y)) <= 1 for _, u in enemies)
        rows.append(dict(kind=END_TURN_KIND, spell=-1, attack=-1, targets=[], cell=-1,
                         score=0. if in_melee else -np.inf, dropped=False, p=0., dmg=0., ally_dmg=0.))
        return rows

    def presented(self, rows):
        """The rows an external decision shows. moves='dest' (as ember-rs 9abcae2): one MOVE row per square
        the actor can reach with its movement left, by its shortest path, breadth-first (the one-step rows
        first, unchanged), then the other rows, End Turn last; farther squares score -inf."""
        if self.cfg.get('moves', 'step') != 'dest':
            return rows
        steps = [r for r in rows if r['kind'] == MOVE]
        others = [r for r in rows if r['kind'] != MOVE]
        a = self.units[self.actor_index()]
        enemies = [u for u in self.units if u.alive and u.team != a.team]
        start = (a.x, a.y)
        out = [dict(r, path=(DIRECTIONS[r['direction']],)) for r in steps]
        seen = {start} | {(a.x + DIRECTIONS[r['direction']][0], a.y + DIRECTIONS[r['direction']][1]) for r in steps}
        frontier = [((a.x + p[0][0], a.y + p[0][1]), p) for p in (r['path'] for r in out)]
        before = min((_cheb(start, (u.x, u.y)) for u in enemies), default=0)
        for _ in range(int(self.movement) - 1):
            nxt = []
            for (x, y), path in frontier:
                for dx, dy in DIRECTIONS:
                    sq = (x + dx, y + dy)
                    if sq in seen or not self.free(*sq):
                        continue
                    seen.add(sq)
                    walk = path + ((dx, dy),)
                    nxt.append((sq, walk))
                    sx, sy = int(np.sign(sq[0] - a.x)), int(np.sign(sq[1] - a.y))
                    after = min((_cheb(sq, (u.x, u.y)) for u in enemies), default=0)
                    provokes = sum(1 for u in enemies if _cheb(start, (u.x, u.y)) <= 1 < _cheb(sq, (u.x, u.y)))
                    out.append(dict(kind=MOVE, spell=-1, attack=-1, targets=[],
                                    cell=(sq[1] + self.oy) * self.cfg['canvas'] + sq[0] + self.ox, score=-np.inf,
                                    dropped=False, p=0., dmg=0., ally_dmg=0.,
                                    direction=DIRECTIONS.index((sx, sy)) if (sx, sy) in DIRECTIONS else 0,
                                    before=before, after=after, provokes=provokes, path=walk))
            frontier = nxt
        end = [r for r in others if r['kind'] == END_TURN_KIND]
        return out + [r for r in others if r['kind'] != END_TURN_KIND] + end

    @staticmethod
    def native_choice(rows):
        best, choice = -np.inf, len(rows) - 1
        for k, row in enumerate(rows):
            if not row['dropped'] and row['score'] > best:
                best, choice = row['score'], k
        return choice

    def _attack_roll(self, attacker, target, to_hit):
        roll = int(self.dice.integers(1, 21))
        if target.dodging:
            roll = min(roll, int(self.dice.integers(1, 21)))
        return roll == 20 or (roll != 1 and roll + to_hit >= target.ac)

    def _damage(self, mean):
        return int(self.dice.integers(max(1, int(mean * .5)), int(mean * 1.5) + 1))

    def execute(self, rows, k):
        row = rows[k]
        a = self.units[self.actor_index()]
        self.history.append(int(k))
        self.turn_decisions += 1
        self.last_moved = 0
        if row['kind'] == END_TURN_KIND:
            self._end_turn()
            return
        if row['kind'] == MOVE:
            # Walk the path one square at a time; stop after a step that drew an opportunity attack (a
            # reaction), and before a step into a square that is no longer free.
            for dx, dy in row.get('path', (DIRECTIONS[row['direction']],)):
                if self.movement < 1 or not self.free(a.x + dx, a.y + dy):
                    break
                reacted = False
                for u in self.units:
                    if u.alive and u.team != a.team and _cheb((a.x, a.y), (u.x, u.y)) <= 1 < _cheb((a.x + dx, a.y + dy), (u.x, u.y)):
                        reacted = True
                        if self._attack_roll(u, a, u.to_hit):
                            a.hp = max(0, a.hp - self._damage(u.dmg))
                a.x, a.y = a.x + dx, a.y + dy
                self.movement -= 1
                self.last_moved += 1
                if reacted or not a.alive:
                    break
        elif row['kind'] == ATTACK:
            target = self.units[row['targets'][0][0]]
            if self._attack_roll(a, target, a.to_hit):
                target.hp = max(0, target.hp - self._damage(a.dmg))
            self.action = False
        elif row['kind'] == DODGE:
            a.dodging, self.action = True, False
        elif row['kind'] == SPELL:
            a.slots -= 1
            self.action = False
            for index, darts in row['targets']:
                target = self.units[index]
                if a.spell == MAGIC_MISSILE:
                    damage = sum(int(self.dice.integers(1, 5)) + 1 for _ in range(darts))
                else:
                    damage = sum(int(self.dice.integers(1, 7)) for _ in range(3))
                    if int(self.dice.integers(1, 21)) + 2 >= 13:
                        damage //= 2
                target.hp = max(0, target.hp - damage)
        self._check_end()
        if not self.done and not a.alive:
            self._end_turn()          # dropped during its own action: the turn ends

    def advance(self):
        """Run forced steps and native turns until an external decision or the end."""
        self.pending = None
        for _ in range(100_000):
            if self.done:
                return
            if self.round > self.cfg['max_rounds']:
                if self.cfg['objective'] == 'health_score':
                    self.terminated, self.task_end = True, 2
                else:
                    self.truncated = True
                return
            if self.steps >= self.cfg['max_steps']:
                self.truncated = True
                return
            rows = self.candidates()
            if self.turn_decisions >= TURN_CAP:
                self._end_turn()
                continue
            if len(rows) == 1:
                self.forced += 1
                self.execute(rows, 0)
                continue
            if not self.is_external(self.actor_index()):
                self.native_actions += 1
                self.execute(rows, self.native_choice(rows))
                continue
            self.pending = self.presented(rows)
            return
        raise RuntimeError('fake game did not reach a decision')


class FakeBatchEnv:
    """In-process batched fake environment implementing `general_env.BatchEnv`.

    `feature_version` picks the array widths (FEATURE_DIMS; default the trainer's FEATURE_VERSION). The
    fake fills the v1 columns it models; v2's extra columns and map channel stay 0, and its creature_rel
    has r3 sees (every living other creature) and r4 in_reach (within one square of a living j)."""

    def __init__(self, n_slots, *, scores=True, objective='health_score', max_rounds=30, standing_weight=.5,
                 max_steps=4096, threads=1, dims=None, content=None, catalog=None, feature_version=FEATURE_VERSION,
                 moves='step'):
        if objective not in ('health_score', 'native'):
            raise ValueError('objective must be health_score or native')
        if moves not in MOVE_MODES:
            raise ValueError(f'moves {moves!r}: step or dest')
        self.moves = moves
        if feature_version not in FEATURE_DIMS:
            raise ValueError(f'unknown feature version {feature_version!r}')
        self.feature_version = feature_version
        self.n_slots, self.scores = int(n_slots), bool(scores)
        dims = normalize_dims(dims or FEATURE_DIMS[feature_version])
        self.dims = {('global' if k == 'global_' else k): v for k, v in dims.items()
                     if k != 'relations' or v > 0}
        d = normalize_dims(self.dims)
        self.cfg = dict(objective=objective, max_rounds=int(max_rounds), standing_weight=float(standing_weight),
                        max_steps=int(max_steps), canvas=d['canvas'], N=d['N'], T=d['T'], moves=moves)
        self._d = d
        self.games = [None] * self.n_slots
        if catalog is None:
            self.catalog = fake_catalog()
        else:   # any ids work: a fake encounter is a function of its id
            self.catalog = [dict(r) for r in catalog] if isinstance(catalog, (list, tuple)) else load_catalog(catalog)

    # ---- protocol ----
    def reset(self, slots, specs, controllers):
        slots = as_slots(slots)
        specs, controllers = list(specs), list(controllers)
        if len(specs) != len(slots) or len(controllers) != len(slots):
            raise ValueError('one spec and one controller mapping per slot')
        if len(set(slots.tolist())) != len(slots):
            raise ValueError('distinct slots')
        for slot in slots:
            self._check_slot(slot)
        games = [_Game(EpisodeSpec(*spec), ctrl, self.cfg) for spec, ctrl in zip(specs, controllers)]
        for slot, game in zip(slots, games):
            game.advance()
            game.reset_terminal = game.done
            self.games[slot] = game
        return self.info(slots)

    def step(self, slots, rows):
        slots = as_slots(slots)
        rows = np.asarray(rows).reshape(-1)
        if rows.shape != slots.shape or len(set(slots.tolist())) != len(slots):
            raise ValueError('one row per distinct slot')
        for slot, row in zip(slots, rows):
            game = self._game(slot)
            if game.pending is None:
                raise ValueError(f'slot {slot} has no pending decision')
            if not 0 <= int(row) < len(game.pending):
                raise ValueError(f'slot {slot}: row {row} is not legal ({len(game.pending)} rows)')
        for slot, row in zip(slots, rows):
            game = self.games[slot]
            game.forced = game.native_actions = 0
            game.execute(game.pending, int(row))
            game.moved = game.last_moved
            game.steps += 1
            game.advance()
        return self.info(slots)

    def info(self, slots):
        slots = as_slots(slots)
        out = {name: np.zeros(len(slots), dtype) for name, dtype in {**INFO_LAYOUT, **OPTIONAL_INFO}.items()}
        for i, slot in enumerate(slots):
            g = self._game(slot)
            out['done'][i], out['terminated'][i], out['truncated'][i] = g.done, g.terminated, g.truncated
            out['reset_terminal'][i] = g.reset_terminal
            out['task_end'][i], out['winner'][i] = g.task_end, g.winner
            live = g.pending is not None
            out['team'][i] = TEAM_CODE[g.units[g.actor_index()].team] if live else -1
            out['actor'][i] = g.actor_index() if live else -1
            out['round'][i], out['score'][i], out['potential'][i] = g.round, g.score(), g.potential()
            out['forced'][i], out['native_actions'][i] = g.forced, g.native_actions
            out['moved'][i] = getattr(g, 'moved', 0)
        return out

    def observe(self, slots, team=None):
        slots = as_slots(slots)
        team = np.full(len(slots), -1, np.int8) if team is None else np.asarray(team, np.int8).reshape(-1)
        encoded = []
        for slot, view in zip(slots, team):
            g = self._game(slot)
            if g.pending is None:
                if view < 0:
                    raise ValueError(f'slot {slot} is done: observe it with a team perspective')
                encoded.append(self._encode(g, TEAMS[view], None, []))
            else:
                actor = g.actor_index()
                own = g.units[actor].team
                if view >= 0 and TEAMS[view] != own:
                    raise ValueError(f'slot {slot}: the decision belongs to {own}')
                encoded.append(self._encode(g, own, actor, g.pending))
        k = max(e['cands'].shape[0] for e in encoded)
        layout = obs_layout(self._d)
        out = {}
        for name, (dtype, shape) in layout.items():
            full = (len(slots),) + tuple(k if s == 'K' else s for s in shape)
            fill = -1 if name in ('creature_ids', 'cand_ids', 'cand_tgt', 'cand_cell') else 0
            out[name] = np.full(full, fill, dtype)
            for i, e in enumerate(encoded):
                value = e[name]
                if shape and shape[0] == 'K':
                    out[name][i, :value.shape[0]] = value
                else:
                    out[name][i] = value
        return out

    def snapshot(self, slot):
        return copy.deepcopy(self._game(slot))

    def restore(self, slot, snapshot, dice_seed=None):
        self._check_slot(slot)
        game = copy.deepcopy(snapshot)
        if dice_seed is not None:
            game.dice = np.random.default_rng(int(dice_seed))
        game.forced = game.native_actions = game.moved = 0
        if game.cfg.get('moves', 'step') != self.cfg['moves']:
            game.cfg = dict(game.cfg, moves=self.cfg['moves'])
            if game.pending is not None:
                game.pending = game.presented(game.candidates())
        self.games[slot] = game

    def fork(self, sources, targets, dice_seeds=None, controllers=None, source=None):
        """ember_rs.BatchEnv.fork: targets[i] becomes a copy of sources[i] (of `source`, default this
        env), reseeded by dice_seeds[i] and with controllers[i] (None keeps the game's) from now on.
        Everything is checked first; on an error no slot changes."""
        src_env = self if source is None else source
        sources, targets = as_slots(sources), as_slots(targets)
        n = len(targets)
        if len(sources) != n or len(set(targets.tolist())) != n:
            raise ValueError('one source per distinct target')
        for t in targets:
            self._check_slot(t)
        if src_env is self and set(sources.tolist()) & set(targets.tolist()):
            raise ValueError('a slot is both a source and a target')
        seeds = [None] * n if dice_seeds is None else [int(s) for s in np.asarray(dice_seeds).reshape(-1)]
        ctrls = [None] * n if controllers is None else list(controllers)
        if len(seeds) != n or len(ctrls) != n or any(s is not None and s < 0 for s in seeds):
            raise ValueError('one dice seed >= 0 and one controller mapping (or None) per target')
        games = []
        for s, seed, ctrl in zip(sources, seeds, ctrls):
            game = copy.deepcopy(src_env._game(s))
            if seed is not None:
                game.dice = np.random.default_rng(seed)
            if ctrl is not None:
                teams, units = check_controllers(ctrl)
                ids = [u.uid for u in game.units]
                ext = {ids.index(u) if isinstance(u, str) else int(u) for u in units}
                game.controllers, game.external_units = teams, ext
                if game.pending is not None and not game.is_external(game.actor_index()):
                    raise ValueError(f'slot {s}: the pending actor must stay external')
            game.forced = game.native_actions = game.moved = 0
            if game.cfg.get('moves', 'step') != self.cfg['moves']:    # the target env's move mode
                game.cfg = dict(game.cfg, moves=self.cfg['moves'])
                if game.pending is not None:
                    game.pending = game.presented(game.candidates())
            games.append(game)
        for t, game in zip(targets, games):
            self.games[t] = game
        return self.info(targets)

    def describe(self, slot):
        g = self._game(slot)
        names = {MOVE: 'move', ATTACK: 'attack', DODGE: 'dodge', SPELL: 'spell', END_TURN_KIND: 'end_turn'}
        return [f"{names[r['kind']]}:{r['targets']}:{r['cell']}" for r in (g.pending or [])]

    def record(self, slot, path):
        g = self._game(slot)
        Path(path).write_text(json.dumps(dict(spec=g.spec._asdict(), controllers=g.controllers,
                                              external_units=sorted(g.external_units), rows=g.history,
                                              terminated=g.terminated, truncated=g.truncated, winner=g.winner,
                                              round=g.round)))

    def units(self, slot):
        """The slot's creatures in token order: (unit id, content, team, external), as ember_rs."""
        g = self._game(slot)
        return [(u.uid, u.uid.rpartition('-')[0] or u.uid, u.team, g.is_external(i)) for i, u in enumerate(g.units)]

    # ---- helpers ----
    def _check_slot(self, slot):
        if not 0 <= int(slot) < self.n_slots:
            raise ValueError(f'slot {slot} out of range')

    def _game(self, slot):
        self._check_slot(slot)
        game = self.games[int(slot)]
        if game is None:
            raise ValueError(f'slot {slot} was never reset')
        return game

    def _encode(self, g: _Game, team, actor, rows):
        d, s = self._d, self._d['canvas']
        n, t = d['N'], d['T']
        creatures = np.zeros((n, d['creature']), np.float32)
        ids = np.full((n, 3), -1, np.int16)
        mask = np.zeros(n, bool)
        a = g.units[actor] if actor is not None else None
        for i, u in enumerate(g.units):
            row = creatures[i]
            mask[i] = True
            ids[i] = (u.kind, u.char, u.conc)
            row[0] = float(i == actor)
            row[1], row[2] = float(u.team == team), float(u.team != team)
            row[3], row[4] = float(u.team == 'heroes'), float(u.char >= 0)
            row[5], row[6] = (u.x + g.ox) / 32, (u.y + g.oy) / 32
            if a is not None:
                row[7], row[8] = (u.x - a.x) / 32, (u.y - a.y) / 32
                row[9] = row[10] = _cheb((u.x, u.y), (a.x, a.y)) / 32
                row[12] = float(_cheb((u.x, u.y), (a.x, a.y)) <= a.reach)
                row[13] = row[14] = 1.
            row[15], row[16], row[17] = u.hp / 100, u.max_hp / 100, u.hp / u.max_hp
            row[19], row[22] = float(u.alive), float(not u.alive)
            row[26], row[27] = u.ac / 20, u.speed * 5 / 60
            row[50], row[51], row[52] = u.to_hit / 10, u.dmg / 20, u.reach / 10
            row[53], row[54] = float(u.spell is not None), u.slots / 4
            row[60] = float(u.dodging)
            if i == actor:
                row[100], row[101] = float(g.action), g.movement * 5 / 60
        canvas = np.zeros((d['map_channels'], s, s), np.uint8)
        ys, xs = slice(g.oy, g.oy + g.h), slice(g.ox, g.ox + g.w)
        canvas[0, ys, xs] = 1
        canvas[1, ys, xs] = g.walls
        canvas[4, ys, xs] = 2
        enemies = [u for u in g.units if u.alive and u.team != team]
        for i, u in enumerate(g.units):
            cx, cy = u.x + g.ox, u.y + g.oy
            if not u.alive:
                canvas[10, cy, cx] = 1
            elif i == actor:
                canvas[5, cy, cx] = 1
            else:
                canvas[6 if u.team == team else 7, cy, cx] = 1
        grid_y, grid_x = np.mgrid[0:g.h, 0:g.w]
        threat = np.zeros((g.h, g.w), np.uint8)
        for u in enemies:
            threat += (np.maximum(abs(grid_x - u.x), abs(grid_y - u.y)) <= 1).astype(np.uint8)
        canvas[11, ys, xs] = threat
        canvas[12, ys, xs] = len(enemies)
        open_ = ~g.walls
        if a is not None:
            cost = np.maximum(abs(grid_x - a.x), abs(grid_y - a.y))
            canvas[13, ys, xs] = np.where(open_, np.minimum(cost, 254), 255)
            reach = np.where(cost <= g.movement, 2, np.where(cost <= g.movement + a.speed, 1, 0))
            canvas[14, ys, xs] = np.where(open_, reach, 0)
            canvas[15, ys, xs] = open_
        else:
            canvas[13] = 255
        canvas[13][canvas[0] == 0] = 255
        glob = np.zeros(d['global_'], np.float32)
        own = team
        other = 'monsters' if team == 'heroes' else 'heroes'
        glob[0], glob[1] = g.round / 30, (g.cfg['max_rounds'] - g.round) / 30
        glob[2], glob[3] = g.cfg['standing_weight'], float(g.cfg['objective'] == 'health_score')
        glob[4], glob[5] = g.team_hp(own) / g.start_hp[own], g.team_hp(other) / g.start_hp[other]
        glob[6] = sum(u.alive for u in g.units if u.team == own) / g.count[own]
        glob[7] = sum(u.alive for u in g.units if u.team == other) / g.count[other]
        glob[8], glob[9] = g.count[own] / 16, g.count[other] / 16
        glob[10] = g.turn_decisions / 24 if a is not None else 0.
        glob[11], glob[12] = g.w / 32, g.h / 32
        k = len(rows)
        cands = np.zeros((k, d['cand']), np.float32)
        cids = np.full((k, 3), -1, np.int16)
        tgt = np.full((k, t), -1, np.int16)
        tgt_n = np.zeros((k, t), np.uint8)
        cell = np.full(k, -1, np.int16)
        for r, row in enumerate(rows):
            c = cands[r]
            cids[r] = (row['kind'], row['spell'], row['attack'])
            c[0] = float(row['kind'] in (ATTACK, DODGE, SPELL))
            steps = len(row.get('path', (0,))) if row['kind'] == MOVE else 0
            c[3] = steps / 12                                  # move squares
            if d['cand'] > 121:
                c[121] = steps / 12                            # path_steps_div12 (ember-gen-v2)
            c[5] = float(row['kind'] == END_TURN_KIND)
            c[8] = float(row['kind'] == ATTACK and a.reach <= 1)
            c[9] = float(row['kind'] == ATTACK and a.reach > 1)
            c[17] = row['dmg'] / 20
            c[66], c[67], c[69] = row['p'], row['p'] * row['dmg'] / 40, row['ally_dmg'] / 40
            c[70] = sum(1 for i, _ in row['targets'] if g.units[i].team != team) / 4
            c[71] = sum(1 for i, _ in row['targets'] if g.units[i].team == team) / 4
            if row['kind'] == MOVE:
                c[78 + row['direction']] = 1.
                c[86], c[87], c[88] = row['before'] / 32, row['after'] / 32, row['provokes'] / 4
                c[89] = float(row['after'] < row['before'])
            if row['kind'] == END_TURN_KIND:
                c[90] = float(np.isfinite(row['score']))   # an enemy is in melee range
            if row['kind'] == DODGE:
                c[91] = float(row['dropped'])
            for j, (index, count) in enumerate(row['targets'][:t]):
                tgt[r, j], tgt_n[r, j] = index, count
            cell[r] = row['cell']
        raw = np.array([row['score'] for row in rows], np.float32) if rows else np.zeros(0, np.float32)
        dropped = np.array([row['dropped'] for row in rows], bool) if rows else np.zeros(0, bool)
        choice = _Game.native_choice(rows) if rows else -1
        if not self.scores:
            raw = np.full(k, np.nan, np.float32)
            dropped = np.zeros(k, bool)
            choice = -1
        relations = {}
        if d['relations'] > 0:
            rel = np.zeros((n, n, d['relations']), np.uint8)
            for i, u in enumerate(g.units):
                for j, v in enumerate(g.units):
                    if i != j and u.alive and v.alive:
                        rel[i, j, 3] = 1                                              # sees
                        rel[i, j, 4] = _cheb((u.x, u.y), (v.x, v.y)) <= 1             # in j's melee reach
            relations['creature_rel'] = rel
        return dict(creatures=creatures, creature_ids=ids, creature_mask=mask, map=canvas, global_=glob, **relations,
                    **{'global': glob}, cands=cands, cand_ids=cids, cand_tgt=tgt, cand_tgt_n=tgt_n, cand_cell=cell,
                    cand_mask=np.ones(k, bool), actor=-1 if actor is None else actor,
                    native_raw=raw, native_dropped=dropped, native_choice=choice)
