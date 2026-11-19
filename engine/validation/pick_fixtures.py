"""Pick a small set of tapes that covers the mechanics of larger tape sets.

Usage: python3 pick_fixtures.py OUT_DIR [--max-kb 200] [--max-tapes N] [--prefix P] [--depth N] TAPE_DIR...

Each tape's features are its draw tags, executed action kinds (spells with
metamagic, class features, reactions, thrown attacks, blind attacks on a
square), decision contexts, off-policy decision markers (forced, Stand first
declined, executed rows unlike the native choice by kind, dropped rows
executed, early End Turn), statuses and effect names, keyed by creature kind,
plus hero weapon damage expressions (a versatile weapon's die) and the map. A greedy set cover over
the tapes under the size limit picks tapes (most new features first, smaller
tape on ties) until nothing new is covered or ``--max-tapes`` are picked; they
are copied to OUT_DIR as `<prefix><set>_<tape>.jsonl` (`<set>` is
`<parent>_<set>` when two given directories share a name, or the last N
path components joined by `_` with `--depth N`).
"""
import json
import shutil
import sys
from pathlib import Path


def features(path):
    f = set()
    heroes = set()
    for line in path.read_text().splitlines():
        e = json.loads(line)
        t = e['t']
        who = e.get('who', '').split('-')[0]
        if t == 'hdr':
            f.add(f"map:{(e.get('meta') or {}).get('map', 'vault' if 'map' not in e else 'other')}")
            heroes = {u for u, st in (e.get('stats') or {}).items() if not st.get('npc')}
        elif t == 'draw':
            f.add(f"draw:{who}:{e['tag']}:{e['mode']}")
            if e['tag'] == 'damage' and e.get('who') in heroes:
                f.add(f"damage:{who}:{e['expr']}")
        elif t == 'act':
            a = e['a'].split(':')
            if a[0] == 'spell':
                f.add(f"spell:{who}:{a[1]}:{a[2]}")
                f.update(f"spell:{who}:{p}" for p in a if p.startswith('mm='))
            elif a[0] == 'attack':
                if a[-1].startswith('@'):
                    f.add(f"blind_attack:{who}")  # a square, not a creature
                f.add(f"attack:{who}:{a[1]}{':thrown' if a[2] == 'thrown' else ''}"
                      f"{':reaction' if a[-1] == 'reaction' else ''}")
            else:
                f.add(f"act:{who}:{a[0]}")
        elif t == 'dec':
            f.add(f"dec:{e['ctx']}:{who}:{e['chosen'].split(':')[0]}")
            x = e.get('ext')
            if x is not None:
                # off-policy decisions (G4a/G4b): markers, and executed rows the
                # native AI would not take (by kind)
                legal, ex, nat = x['legal'], x['exec'], x.get('native')
                kind = legal[ex].split(':')[0]
                for marker in ('forced', 'unscored'):
                    if x.get(marker):
                        f.add(f"ext:{marker}:{who}:{x[marker]}")
                if ex != nat and not x.get('forced'):
                    f.add(f"ext:exec:{who}:{kind}")
                    if x.get('unscored'):
                        f.add(f"ext:declined:{who}:{x['unscored']}")
                    if kind == 'end_turn':
                        f.add(f"ext:early_end:{who}")
                if x.get('dropped') and x['dropped'][ex]:
                    f.add(f"ext:dropped:{who}:{kind}")

        elif t == 'state':
            for u in e['units']:
                k = u['id'].split('-')[0]
                f.update(f"status:{k}:{s}" for s in u['st'])
                f.update(f"fx:{k}:{x.split(':')[0]}" for x in u['fx'])
                if u['hp'] == 0 and 'dead' not in u['st']:
                    f.add(f"downed:{k}")
        elif t == 'end':
            f.add(f"end:{e.get('winner')}")
    return f


def main(argv):
    max_kb = 200
    max_tapes = None
    prefix = ''
    if '--max-kb' in argv:
        i = argv.index('--max-kb')
        max_kb = int(argv[i + 1])
        del argv[i:i + 2]
    if '--max-tapes' in argv:
        i = argv.index('--max-tapes')
        max_tapes = int(argv[i + 1])
        del argv[i:i + 2]
    if '--prefix' in argv:
        i = argv.index('--prefix')
        prefix = argv[i + 1]
        del argv[i:i + 2]
    depth = None
    if '--depth' in argv:
        i = argv.index('--depth')
        depth = int(argv[i + 1])
        del argv[i:i + 2]
    out, dirs = Path(argv[0]), [Path(d) for d in argv[1:]]
    names = [d.name for d in dirs]
    cands = []
    for d in dirs:
        # sets of the same name in different trees (tapes-maps/<map>/p_armor)
        # are told apart by their parent directory; --depth N names a set by
        # its last N path components (offpolicy/tapes/<map>/<party>/<config>)
        if depth is not None:
            set_name = '_'.join(d.parts[-depth:])
        else:
            set_name = f'{d.parent.name}_{d.name}' if names.count(d.name) > 1 else d.name
        for p in sorted(d.glob('*.jsonl')):
            size = p.stat().st_size
            if size <= max_kb * 1024 and p.name not in ('mech.jsonl', 'results.jsonl'):
                cands.append((p, set_name, size, features(p)))
    covered, picked = set(), []
    while True:
        best = max(cands, key=lambda c: (len(c[3] - covered), -c[2]), default=None)
        if best is None or not (best[3] - covered) or (max_tapes is not None and len(picked) >= max_tapes):
            break
        covered |= best[3]
        picked.append(best)
        cands.remove(best)
    out.mkdir(parents=True, exist_ok=True)
    total = 0
    for p, set_name, size, feats in picked:
        shutil.copy(p, out / f"{prefix}{set_name}_{p.name}")
        total += size
    left = set().union(*(c[3] for c in cands)) - covered if cands else set()
    print(f"{len(picked)} tapes, {total / 1e6:.2f} MB, {len(covered)} features covered, {len(left)} not covered")


if __name__ == '__main__':
    main(sys.argv[1:])
