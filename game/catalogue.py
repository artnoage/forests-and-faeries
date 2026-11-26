"""The Forests and Faeries encounter catalogue: the levels the start screen offers.

Each encounter is a data file ``encounters/<id>.json`` (private ones in
``encounters/private/``):

* ``id``, ``name``, ``blurb``, ``order`` and ``private`` (served only when the
  server is started with ``FF_PRIVATE_ENCOUNTERS=1``);
* ``map``: a walls-only map file ``maps/<id>.json`` (``maps/private/`` for a
  private encounter) in the EncounterSpec format with only its map
  (``{"version": 1, "map": {"name", "rows"}, "scene": {...}}``), whose
  ``scene`` (display props over wall cells, wall height) is presentation only;
* ``theme``: the board theme (a preset may override it);
* ``presets``: the levels, each with ``id``, ``name``, ``difficulty``,
  ``blurb``, ``party`` (hero content ids), ``roster`` (monster content ids, in
  order: ``<content>-<n>`` unit ids are numbered per content), optional
  ``names`` (unit id -> display name), ``placements`` (unit id -> [x, y], the
  suggested layout) and optional ``balance`` notes;
* a preset with ``story`` (a story id) is that story's own chapter level: it is
  loaded and playable like any other, but the start screen's Practice lists leave
  it out (``catalogue_view`` puts it under ``story_presets``).

Rules come only from the map rows and the content ids compiled into
``ember_rs.ContentPool``: zero ``natural20`` imports at runtime.
"""
from __future__ import annotations

from collections import deque
from copy import deepcopy
from functools import lru_cache
import json
from pathlib import Path

import ember_rs

ROOT = Path(__file__).resolve().parent
ENCOUNTERS = ROOT / 'encounters'
MAPS = ROOT / 'maps'
THEMES = ('ossuary', 'catacombs', 'caverns', 'reliquary', 'sanctum', 'crucible', 'forged_hall',
          'woodland', 'mausoleum', 'mausoleum_crypt', 'mausoleum_caves')
DIFFICULTIES = ('Easy', 'Medium', 'Hard', 'Unbeatable')
PROP_KINDS = ('pillar', 'brazier', 'table', 'bench', 'shelf', 'barrel', 'crate', 'rug',
              'sarcophagus', 'altar', 'stained_glass', 'bell', 'lantern_post', 'ore_vein', 'water_lock', 'kiln')
MAX_SIZE = 32
MAX_CREATURES = 24
CONTENT_NAMES = {
    'goblin_minion': 'Goblin Minion',
    'goblin_warrior': 'Goblin Warrior',
    'goblin_boss': 'Goblin Boss',
    'will_o_wisp': "Will-o'-Wisp",
}


class CatalogueError(ValueError):
    pass


def join_names(items):
    items = list(items)
    if len(items) <= 1:
        return items[0] if items else ''
    if len(items) == 2:
        return f'{items[0]} and {items[1]}'
    return f"{', '.join(items[:-1])} and {items[-1]}"


def _title(content):
    return CONTENT_NAMES.get(content) or content.replace('_', ' ').title()


@lru_cache(maxsize=1)
def _pool():
    return ember_rs.ContentPool()


def hero_ids():
    return frozenset(_pool().heroes)


PRACTICE_HERO_ORDER = ('guy', 'elion', 'curogana', 'chruna', 'mara', 'ilyra', 'vesper')
PRACTICE_HERO_CLASSES = {
    'guy': 'Fighter',
    'elion': 'Cleric',
    'curogana': 'Sorcerer',
    'chruna': 'Barbarian',
    'mara': 'Fighter',
    'ilyra': 'Wizard',
    'vesper': 'Bard',
}


def practice_heroes():
    """Playable hero base sheets available to Practice party selection."""
    available = hero_ids()
    out = []
    for base in PRACTICE_HERO_ORDER:
        if base in available:
            info = _hero_sheet(base)
            out.append({
                'base_id': info['base_id'],
                'name': info['name'],
                'class_label': PRACTICE_HERO_CLASSES.get(base, 'Hero'),
                'default_content': info['content'],
            })
    return out


def monster_ids():
    return frozenset(_pool().monsters)


@lru_cache(maxsize=None)
def _hero_sheet(content):
    pool = _pool()
    if hasattr(pool, 'hero_sheet'):
        sheet, base, level, name = pool.hero_sheet(content)
    else:
        # Older installed engines can still serve their original six sheets.
        base, sep, requested = content.rpartition('_l')
        sheet = content if content in pool.heroes else base
        if sheet not in pool.heroes:
            raise CatalogueError(f'Unknown hero sheet {content}.')
        doc = _read(ROOT.parent / 'engine' / 'content' / 'srd' / f'{sheet}.json')
        base, level, name = doc.get('base_id', sheet), sum(doc['classes'].values()), doc['name']
        if sep and requested != str(level):
            raise CatalogueError(f'The installed engine does not contain {content}.')
    return {'content': sheet, 'base_id': base, 'level': level, 'name': name}


def _connected_floor(rows):
    height = len(rows)
    width = len(rows[0]) if height else 0
    floor = {(x, y) for y, row in enumerate(rows) for x, ch in enumerate(row) if ch in '.dD'}
    if len(floor) < 2:
        return False
    start = min(floor)
    seen = {start}
    queue = deque([start])
    while queue:
        x, y = queue.popleft()
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if dx == 0 and dy == 0:
                    continue
                nx, ny = x + dx, y + dy
                if (nx, ny) not in floor or (nx, ny) in seen:
                    continue
                if dx != 0 and dy != 0 and (x + dx, y) not in floor and (x, y + dy) not in floor:
                    continue
                seen.add((nx, ny))
                queue.append((nx, ny))
    return len(seen) == len(floor)


def validate_rows(rows, name='map'):
    if not isinstance(rows, list) or not (1 <= len(rows) <= MAX_SIZE):
        raise CatalogueError(f'{name}: height must be 1..{MAX_SIZE}')
    if not all(isinstance(r, str) for r in rows):
        raise CatalogueError(f'{name}: rows must be strings')
    width = len(rows[0])
    if not (1 <= width <= MAX_SIZE) or any(len(r) != width for r in rows):
        raise CatalogueError(f'{name}: rows must be rectangular within 1..{MAX_SIZE}')
    if any(ch not in '.dDHT' for r in rows for ch in r):
        raise CatalogueError(f'{name}: expected H (wall), T (tree), . (bright), d (dim) or D (dark)')
    if not _connected_floor(rows):
        raise CatalogueError(f'{name}: floor must be one connected component')


class Level:
    """One playable preset of one encounter."""

    def __init__(self, encounter, preset, rows, scene, map_name):
        self.encounter = encounter
        self.encounter_id = encounter['id']
        self.preset = preset
        self.preset_id = preset['id']
        self.private = bool(encounter.get('private'))
        self.theme = preset.get('theme') or encounter['theme']
        self.rows = list(rows)
        self.scene = scene
        self.map_name = map_name
        self.units = list(preset['party']) + self._monster_ids()
        self.names = self._names()
        self._rust_json = None

    def with_hero_level(self, level):
        if type(level) is not int or level not in (1, 2, 3):
            raise ValueError('Hero level must be 1, 2 or 3.')
        party = self.preset['party']
        keys = {hero: _hero_sheet(f"{_hero_sheet(hero)['base_id']}_l{level}")['content'] for hero in party}
        preset = dict(self.preset, party=[keys[hero] for hero in party], hero_level=level)
        for field in ('names', 'placements'):
            preset[field] = {keys.get(uid, uid): value for uid, value in self.preset.get(field, {}).items()}
        return Level(self.encounter, preset, self.rows, self.scene, self.map_name)

    def with_party(self, party_bases, hero_level=None):
        """Return a Practice variant using the requested hero base IDs (unique, 1..6)."""
        if self.preset.get('story'):
            raise ValueError('Story chapters use their fixed party.')
        if not isinstance(party_bases, list) or not (1 <= len(party_bases) <= 6):
            raise ValueError('party must be a list of 1 to 6 hero ids.')
        if any(not isinstance(h, str) for h in party_bases):
            raise ValueError('party entries must be hero id strings.')
        valid_bases = {h['base_id'] for h in practice_heroes()}
        seen = set()
        bases = []
        for raw in party_bases:
            base = _hero_sheet(raw)['base_id'] if raw in hero_ids() else raw
            if base not in valid_bases:
                raise ValueError(f'Unknown hero {raw!r}.')
            if base in seen:
                raise ValueError(f'Duplicate hero {base!r} in party.')
            seen.add(base)
            bases.append(base)
        if len(bases) + len(self.preset['roster']) > MAX_CREATURES:
            raise ValueError(f'At most {MAX_CREATURES} creatures allowed.')
        if hero_level is not None:
            if type(hero_level) is not int or hero_level not in (1, 2, 3):
                raise ValueError('Hero level must be 1, 2 or 3.')
            chosen_level = hero_level
        else:
            preset_lvl = self.preset.get('hero_level')
            chosen_level = int(preset_lvl) if preset_lvl in (1, 2, 3) else _hero_sheet(self.preset['party'][0])['level']
        new_party = [_hero_sheet(f'{base}_l{chosen_level}')['content'] for base in bases]

        orig_party = list(self.preset['party'])
        orig_at = dict(self.preset.get('placements') or {})
        new_placements = {uid: pos for uid, pos in orig_at.items() if uid not in orig_party}
        occupied = {tuple(pos) for pos in new_placements.values() if pos is not None}

        # Preserve squares of heroes that stayed in the party, reuse vacated hero slots first.
        orig_by_base = {_hero_sheet(h)['base_id']: orig_at.get(h) for h in orig_party}
        free_slots = [orig_at[h] for h in orig_party if h in orig_at and _hero_sheet(h)['base_id'] not in seen]
        hero_coords = []
        pending = []
        for base, content in zip(bases, new_party):
            pos = orig_by_base.get(base)
            if pos is not None and tuple(pos) not in occupied:
                new_placements[content] = list(pos)
                occupied.add(tuple(pos))
                hero_coords.append(tuple(pos))
            else:
                pending.append(content)
        for content in pending:
            if free_slots:
                pos = free_slots.pop(0)
                new_placements[content] = list(pos)
                occupied.add(tuple(pos))
                hero_coords.append(tuple(pos))
            else:
                # BFS from existing hero cluster for nearest open floor square.
                h, w = len(self.rows), len(self.rows[0])
                seeds = hero_coords or [(x, y) for y in range(h) for x in range(w) if self.rows[y][x] in '.dD'][:1]
                q = deque(seeds)
                vis = set(seeds)
                found = None
                while q and found is None:
                    cx, cy = q.popleft()
                    for dx, dy in ((0, -1), (0, 1), (-1, 0), (1, 0), (-1, -1), (1, -1), (-1, 1), (1, 1)):
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in vis and self.rows[ny][nx] in '.dD':
                            vis.add((nx, ny))
                            if (nx, ny) not in occupied:
                                found = (nx, ny)
                                break
                            q.append((nx, ny))
                if found is None:
                    raise ValueError('Not enough open floor squares for this party.')
                new_placements[content] = [found[0], found[1]]
                occupied.add(found)
                hero_coords.append(found)

        preset = dict(self.preset, party=new_party, hero_level=chosen_level, placements=new_placements)
        out = Level(self.encounter, preset, self.rows, self.scene, self.map_name)
        out.check()
        return out

    def _monster_ids(self):
        counts, ids = {}, []
        for content in self.preset['roster']:
            counts[content] = counts.get(content, 0) + 1
            ids.append(f'{content}-{counts[content]}')
        return ids

    def _names(self):
        totals = {}
        for content in self.preset['roster']:
            totals[content] = totals.get(content, 0) + 1
        names = {}
        for uid in self._monster_ids():
            content, _, number = uid.rpartition('-')
            names[uid] = _title(content) if totals[content] == 1 else f'{_title(content)} {number}'
        names.update(self.preset.get('names') or {})
        return names

    def display_name(self, uid):
        """The shown name of a monster unit (heroes keep their sheet names: None)."""
        return self.names.get(uid)

    def suggested_placements(self):
        """Suggested placements in arena registration order (heroes, then monsters)."""
        at = self.preset.get('placements') or {}
        out = []
        for uid in self.units:
            if uid in at and at[uid] is not None:
                x, y = at[uid]
                out.append({'id': uid, 'x': int(x), 'y': int(y)})
        return out

    def check(self):
        validate_rows(self.rows, f'{self.encounter_id}/{self.preset_id}')
        heroes, monsters = hero_ids(), monster_ids()
        party = list(self.preset['party'])
        roster = list(self.preset['roster'])
        if not party or any(h not in heroes for h in party):
            raise CatalogueError(f'{self.encounter_id}/{self.preset_id}: unknown hero in {party}')
        if not roster or any(m not in monsters for m in roster):
            raise CatalogueError(f'{self.encounter_id}/{self.preset_id}: unknown monster in {roster}')
        if len(party) + len(roster) > MAX_CREATURES:
            raise CatalogueError(f'{self.encounter_id}/{self.preset_id}: at most {MAX_CREATURES} creatures')
        at = self.preset.get('placements') or {}
        unknown = set(at) - set(self.units)
        if unknown:
            raise CatalogueError(f'{self.encounter_id}/{self.preset_id}: placements for unknown units {sorted(unknown)}')
        width, height = len(self.rows[0]), len(self.rows)
        occupied = set()
        for item in self.suggested_placements():
            x, y = item['x'], item['y']
            if not (0 <= x < width and 0 <= y < height) or self.rows[y][x] in ('H', 'T'):
                raise CatalogueError(f'{self.encounter_id}/{self.preset_id}: {item["id"]} not on floor at {(x, y)}')
            if (x, y) in occupied:
                raise CatalogueError(f'{self.encounter_id}/{self.preset_id}: duplicate placement at {(x, y)}')
            occupied.add((x, y))
        return []

    def view(self):
        preset = self.preset
        roster = {}
        for content in preset['roster']:
            roster[content] = roster.get(content, 0) + 1
        return {'id': self.preset_id, 'encounter': self.encounter_id, 'name': preset['name'],
                'encounter_name': self.encounter['name'], 'difficulty': preset['difficulty'],
                'blurb': preset['blurb'], 'theme': self.theme, 'private': self.private,
                'map': {'name': self.map_name, 'width': len(self.rows[0]), 'height': len(self.rows)},
                'hero_level': preset.get('hero_level'),
                **({'story': preset['story']} if preset.get('story') else {}),
                'party': [dict(_hero_sheet(h)) for h in preset['party']],
                'roster': [{'content': c, 'name': _title(c), 'count': n} for c, n in roster.items()]}

    def to_rust_json(self):
        if self._rust_json is None:
            monsters = []
            for uid in self._monster_ids():
                content, _, _ = uid.rpartition('-')
                monsters.append([uid, content, self.display_name(uid) or _title(content)])
            payload = {
                'encounter_id': self.encounter_id,
                'preset_id': self.preset_id,
                'theme': self.theme,
                'map_name': self.map_name,
                'rows': self.rows,
                'scene': self.scene,
                'level_view': self.view(),
                'heroes': list(self.preset['party']),
                'monsters': monsters,
                'suggested_placements': self.suggested_placements(),
            }
            self._rust_json = json.dumps(payload)
        return self._rust_json


def _read(path):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except (OSError, ValueError) as error:
        raise CatalogueError(f'{path.name}: {error}') from error


def _check_scene(scene, rows, name):
    width, height = len(rows[0]), len(rows)
    for x, y in scene.get('chasm', []):
        if not (0 <= x < width and 0 <= y < height and rows[y][x] == 'H'):
            raise CatalogueError(f'{name}: chasm cell {(x, y)} is not a wall')
    for prop in scene.get('props', []):
        kind = prop.get('kind')
        if kind not in PROP_KINDS:
            raise CatalogueError(f'{name}: unknown prop kind {kind!r}')
        x, y, w, d = prop['x'], prop['y'], prop.get('width', 1), prop.get('depth', 1)
        if not (0 <= x and 0 <= y and x + w <= width and y + d <= height):
            raise CatalogueError(f'{name}: prop {prop} is outside the map')
        if kind in ('rug', 'stained_glass'):
            continue
        for yy in range(y, y + d):
            for xx in range(x, x + w):
                if rows[yy][xx] not in ('H', 'T'):
                    raise CatalogueError(f'{name}: prop {kind} at {(xx, yy)} covers a floor cell')


def _load_map(map_id, private):
    folder = MAPS / 'private' if private else MAPS
    data = _read(folder / f'{map_id}.json')
    if data.get('version') != 1 or not isinstance(data.get('map'), dict):
        raise CatalogueError(f'map {map_id}: unsupported format')
    rows = data['map']['rows']
    validate_rows(rows, f'map {map_id}')
    scene = deepcopy(data.get('scene') or {'props': []})
    _check_scene(scene, rows, f'map {map_id}')
    return rows, scene, data['map'].get('display_name') or data['map'].get('name') or map_id


def _validate(encounter, path):
    for key in ('id', 'name', 'map', 'theme', 'presets', 'blurb'):
        if key not in encounter:
            raise CatalogueError(f'{path.name}: missing {key!r}')
    if encounter['id'] != path.stem:
        raise CatalogueError(f'{path.name}: id must equal the file name')
    if encounter['theme'] not in THEMES:
        raise CatalogueError(f'{path.name}: unknown theme {encounter["theme"]!r}')
    seen = set()
    heroes, monsters = hero_ids(), monster_ids()
    for preset in encounter['presets']:
        for key in ('id', 'name', 'difficulty', 'blurb', 'party', 'roster'):
            if key not in preset:
                raise CatalogueError(f'{path.name}: preset missing {key!r}')
        if preset['id'] in seen:
            raise CatalogueError(f'{path.name}: duplicate preset {preset["id"]!r}')
        seen.add(preset['id'])
        if 'story' in preset and not (isinstance(preset['story'], str) and preset['story']):
            raise CatalogueError(f'{path.name}: preset {preset["id"]!r}: story must be a story id')
        if preset['difficulty'] not in DIFFICULTIES:
            raise CatalogueError(f'{path.name}: difficulty must be one of {DIFFICULTIES}')
        if preset.get('theme') and preset['theme'] not in THEMES:
            raise CatalogueError(f'{path.name}: unknown theme {preset["theme"]!r}')
        if not preset['party'] or any(h not in heroes for h in preset['party']):
            raise CatalogueError(f'{path.name}: unknown hero in {preset["party"]}')
        if not preset['roster'] or any(m not in monsters for m in preset['roster']):
            raise CatalogueError(f'{path.name}: unknown monster in {preset["roster"]}')


@lru_cache(maxsize=4)
def load(include_private=False):
    """{(encounter id, preset id): Level}, in start-screen order."""
    paths = sorted(ENCOUNTERS.glob('*.json'))
    if include_private:
        paths += sorted((ENCOUNTERS / 'private').glob('*.json'))
    encounters = []
    for path in paths:
        encounter = _read(path)
        _validate(encounter, path)
        private = path.parent.name == 'private'
        if bool(encounter.get('private')) != private:
            raise CatalogueError(f'{path.name}: private encounters live in encounters/private/ and say so')
        encounters.append((encounter.get('order', 100), encounter['id'], encounter, private))
    levels = {}
    for _, _, encounter, private in sorted(encounters, key=lambda e: (e[0], e[1])):
        rows, scene, map_name = _load_map(encounter['map'], private)
        if encounter.get('scene') is not None:
            scene = deepcopy(encounter['scene'])
            _check_scene(scene, rows, encounter['id'])
        for preset in encounter['presets']:
            level = Level(encounter, preset, rows, scene, encounter.get('map_name') or map_name)
            level.check()
            levels[(encounter['id'], preset['id'])] = level
    return levels


def default_level(include_private=False):
    return next(iter(load(include_private).values()))


def catalogue_view(include_private=False):
    """The start screen's list: encounters with their presets, in order. A story's own
    chapter levels go under ``story_presets``, out of the Practice lists."""
    groups = []
    for level in load(include_private).values():
        if not groups or groups[-1]['id'] != level.encounter_id:
            enc = level.encounter
            groups.append({'id': enc['id'], 'name': enc['name'], 'blurb': enc['blurb'],
                           'private': level.private, 'presets': [], 'story_presets': []})
        groups[-1]['story_presets' if level.preset.get('story') else 'presets'].append(level.view())
    return groups
