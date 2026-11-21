"""Build the L1–L3 generated encounter catalog with independent native screening dice.

Run from the repository root with --ember pointing to a release build of the CLI.
Intermediate maps and both rounds of native games are written under --work.
Use --export-game-levels ENCOUNTER_DIR JSONL to export a hand-authored test pool on its own.
"""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
import random
import subprocess
from pathlib import Path


HEROES = ('guy', 'elion', 'curogana', 'mara', 'ilyra', 'chruna')
PARTIES = [(h,) for h in HEROES] + [
    ('guy', 'elion'), ('elion', 'mara'), ('mara', 'chruna'), ('chruna', 'ilyra'),
    ('ilyra', 'curogana'), ('curogana', 'guy'), ('guy', 'elion', 'curogana'),
    ('chruna', 'mara', 'ilyra'), ('elion', 'chruna', 'curogana'), ('guy', 'mara', 'ilyra'),
]
# Proposal weights only. Acceptance uses measured native elimination wins.
COST = dict(kobold_warrior=.48, goblin_minion=.5, skeleton=.92, zombie=.83,
            goblin_warrior=1.15, shadow=1.55, ghoul=1.9, specter=2.2,
            animated_armor=2.25, ghast=2.9, goblin_boss=3.0, wight=4.0, mummy=5.0)
SPLITS = dict(train=(0, 20), dev=(20, 24), test=(24, 28), diag=(28, 32))
TARGETS = dict(train=12, dev=4, test=4, diag=4)
FAMILIES = ('open', 'pillars', 'rooms', 'caves')
CATALOG = 'level-roster-gen-v1.jsonl'
GAME_CATALOG = 'game-levels-test-v1.jsonl'


def read_rows(path):
    with path.open() as source:
        return [json.loads(line) for line in source if line.strip() and not line.lstrip().startswith('#')]


def write_rows(path, rows):
    temp = path.with_suffix('.tmp')
    with temp.open('w') as out:
        for row in rows:
            out.write(json.dumps(row, separators=(',', ':'), sort_keys=True) + '\n')
    temp.replace(path)


def game_levels(encounters=Path('game/encounters')):
    rows = []
    for path in sorted(encounters.glob('*.json')):
        book = json.loads(path.read_text())
        grid = json.loads((Path('game/maps') / (book['map'] + '.json')).read_text())['map']
        for preset in book['presets']:
            actors = list(preset['party'])
            counts = Counter()
            for name in preset['roster']:
                counts[name] += 1
                actors.append(f'{name}-{counts[name]}')
            placements = [dict(id=a, x=preset['placements'][a][0], y=preset['placements'][a][1]) for a in actors]
            row = dict(id=f"{book['id']}/{preset['id']}", split='test', name=preset['name'],
                       difficulty=preset['difficulty'], party=preset['party'], roster=preset['roster'],
                       map=dict(name=grid['name'], rows=grid['rows']),
                       layout=dict(rule='fixed', placements=placements), max_rounds=30)
            for field in ('hero_level', 'variant_of'):
                if field in preset:
                    row[field] = preset[field]
            if 'grading_status' in book:
                row['grading_status'] = book['grading_status']
                row['recorded'] = preset.get('balance')
            rows.append(row)
    return rows


def maps_for_splits(args, presets):
    used = {tuple(row['map']['rows']) for row in presets}
    for path in sorted(Path('catalogs').glob('*.jsonl')):
        if path.name in (CATALOG, GAME_CATALOG):
            continue
        for row in read_rows(path):
            grid = row.get('map')
            if isinstance(grid, dict) and 'rows' in grid:
                used.add(tuple(grid['rows']))
    index = args.work / 'maps' / 'maps.jsonl'
    if not index.exists():
        subprocess.run([args.ember, 'mapgen', 'gen', '--family', 'all', '--version', '2',
                        '--seeds', '4000..4032', '--out', index.parent, '--threads', str(args.threads)], check=True)
    by_split = defaultdict(list)
    for meta in sorted(read_rows(index), key=lambda r: (r['family'], r['seed'])):
        seed = meta['seed'] - 4000
        split = next(s for s, (lo, hi) in SPLITS.items() if lo <= seed < hi)
        source = json.loads((index.parent / meta['file']).read_text())['map']
        geometry = tuple(source['rows'])
        if geometry in used:
            continue
        used.add(geometry)
        keys = ('family', 'generator', 'seed')
        grid = dict(name=source['name'], rows=source['rows'], ember={k: source['ember'][k] for k in keys})
        by_split[split].append(grid)
    for split in SPLITS:
        if {g['ember']['family'] for g in by_split[split]} != set(FAMILIES):
            raise ValueError(f'missing map family in {split}')
    return by_split


def sheet(hero, level):
    return hero if level == (2 if hero in ('ilyra', 'mara') else 3) else f'{hero}_l{level}'


def propose(maps, split, level, party, attempt):
    key = f"level-roster-v1/{split}/{'+'.join(party)}/{attempt}"
    rng = random.Random(int.from_bytes(hashlib.sha256(key.encode()).digest()[:8], 'little'))
    grid = rng.choice(maps)
    budget = (.95, 2.35, 4.25)[level - 1] * len(party) * 2 ** rng.uniform(-1.7, 1.6)
    # Include the two new monsters in both single-type and mixed rosters.
    primary = rng.choice([*COST, 'kobold_warrior', 'animated_armor'])
    pool = [primary, *rng.sample(list(COST), k=rng.randrange(4))]
    roster = [primary]
    remaining = budget - COST[primary]
    while len(roster) < 14 and remaining > .2:
        options = [name for name in pool if COST[name] <= remaining * 1.25]
        if not options:
            break
        name = rng.choice(options)
        roster.append(name)
        remaining -= COST[name]
    return dict(id=f"lvl-v1-{split}-{'+'.join(party)}-{attempt:04d}", tier='S', split=split,
                party=list(party), party_size=len(party), roster=sorted(roster), map=grid,
                map_family=grid['ember']['family'], map_split=split,
                layout=dict(rule='zone', require_sight=rng.random() < .75, tries=200), max_rounds=30)


def measure(args, name, rows, games, seed):
    if not rows:
        return []
    inputs = args.work / f'{name}-input.jsonl'
    outputs = args.work / f'{name}-output.jsonl'
    write_rows(inputs, rows)
    with (args.work / f'{name}.log').open('w') as log:
        subprocess.run([args.ember, 'balance', 'eval', inputs, '--games', str(games), '--seed', str(seed),
                        '--threads', str(args.threads), '--out', outputs], check=True, stdout=log)
    return read_rows(outputs)


def select(rows, count):
    # Spread each party's retained encounters over maps, monster types and layouts.
    chosen, maps, monsters = [], Counter(), Counter()
    while rows and len(chosen) < count:
        index = min(range(len(rows)), key=lambda i: (
            maps[rows[i]['map']['ember']['family']], maps[rows[i]['map']['name']],
            min(monsters[m] for m in rows[i]['roster']), abs(rows[i]['p'] - .5), rows[i]['id']))
        row = rows.pop(index)
        chosen.append(row)
        maps.update([row['map']['ember']['family'], row['map']['name']])
        monsters.update(set(row['roster']))
    return chosen


def build(args):
    presets = game_levels()
    maps = maps_for_splits(args, presets)
    groups = {(s, tuple(sheet(h, lvl) for h in base)): lvl
              for s in SPLITS for lvl in (1, 2, 3) for base in PARTIES}
    accepted, seen = defaultdict(list), defaultdict(set)
    for wave in range(6):
        batch = []
        for key, level in groups.items():
            split, party = key
            if len(accepted[key]) >= TARGETS[split]:
                continue
            width = 96 if split == 'train' else 48
            for i in range(wave * width, (wave + 1) * width):
                row = propose(maps[split], split, level, party, i)
                signature = (row['map']['name'], tuple(row['roster']), row['layout']['require_sight'])
                if signature not in seen[key]:
                    seen[key].add(signature)
                    batch.append(row)
        if not batch:
            break
        print(f'wave {wave}: screening {len(batch)} candidates', flush=True)
        quick = measure(args, f'screen-{wave}', batch, 16, 2026112001)
        original = {r['id']: r for r in batch}
        likely = defaultdict(list)
        for row in quick:
            if not row['balance']['errors'] and .18 <= row['p'] <= .82 and row['truncation'] <= .18:
                likely[(row['split'], tuple(row['party']))].append(row)
        refine = []
        for key, rows in likely.items():
            n = TARGETS[key[0]] - len(accepted[key])
            refine.extend(original[r['id']] for r in select(rows, n * 3 + 3))
        print(f'wave {wave}: refining {len(refine)} candidates', flush=True)
        for row in measure(args, f'refine-{wave}', refine, 200, 2026112002):
            if not row['balance']['errors'] and .25 <= row['p'] <= .75 and row['truncation'] <= .1:
                row['band'] = 'balanced' if .4 <= row['p'] <= .6 else 'wide'
                accepted[(row['split'], tuple(row['party']))].append(row)
        print('remaining party/split groups:', sum(len(accepted[k]) < TARGETS[k[0]] for k in groups), flush=True)
    missing = {k: len(accepted[k]) for k in groups if len(accepted[k]) < TARGETS[k[0]]}
    if missing:
        raise ValueError(f'insufficient screened encounters: {missing}')
    result = [r for k in groups for r in select(accepted[k], TARGETS[k[0]])]
    for split in SPLITS:
        rows = [r for r in result if r['split'] == split]
        if {m for r in rows for m in r['roster']} != set(COST):
            raise ValueError(f'incomplete monster coverage in {split}')
    args.output.mkdir(parents=True, exist_ok=True)
    write_rows(args.output / CATALOG, result)
    write_rows(args.output / GAME_CATALOG, presets)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ember', default='ember')
    parser.add_argument('--threads', type=int, default=8)
    parser.add_argument('--work', type=Path)
    parser.add_argument('--output', type=Path, default=Path('catalogs'))
    parser.add_argument('--export-game-levels', nargs=2, type=Path, metavar=('ENCOUNTER_DIR', 'JSONL'),
                        help='export just the game presets in this directory as fixed, test-only catalog rows')
    options = parser.parse_args()
    if options.export_game_levels:
        directory, output = options.export_game_levels
        rows = game_levels(directory)
        if not rows:
            parser.error(f'no game presets found in {directory}')
        write_rows(output, rows)
    elif options.work is None:
        parser.error('--work is required to build the generated encounter catalog')
    else:
        options.work.mkdir(parents=True, exist_ok=True)
        build(options)
