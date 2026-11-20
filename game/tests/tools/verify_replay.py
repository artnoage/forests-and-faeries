#!/usr/bin/env python3
"""Replay recorded natural20 FFArena sessions against game.arena.FFArena on the full wire.

Usage:
    PYTHONPATH=. python3 game/tests/tools/verify_replay.py game/tests/fixtures
    PYTHONPATH=. python3 game/tests/tools/verify_replay.py /path/to/sessions --json-out summary.jsonl
"""
from __future__ import annotations

import argparse
from concurrent.futures import ProcessPoolExecutor
import json
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from game.arena import FFArena  # noqa: E402
from game.tests.test_ff_parity import (  # noqa: E402
    assert_full_wire_parity,
    build_replay_level,
    collect_all_draws,
)


def iter_session_files(targets: list[str]) -> list[Path]:
    files: list[Path] = []
    for raw in targets:
        p = Path(raw)
        if p.is_file():
            files.append(p)
        elif p.is_dir():
            files.extend(sorted(p.rglob('*.json')))
        else:
            raise FileNotFoundError(f'no such session path: {raw}')
    return files


def verify_one(path: Path) -> dict:
    doc = json.loads(path.read_text(encoding='utf-8'))
    seed = doc['spec']['seed'] if 'spec' in doc else doc['seed']
    level = build_replay_level(doc)
    draws = collect_all_draws(doc)
    game = FFArena(level, seed=seed, revision=0, csrf_token='replay-csrf', replay_draws=draws,
                   replay_version=doc.get('replay_version', 1))

    try:
        assert_full_wire_parity(f'{path.stem}:initial', game.wire(game.state()), doc['initial_wire'])
        for si, step in enumerate(doc['steps']):
            op = step['op']
            args = step['args']
            ctx = f'{path.stem}:step[{si}]({op})'
            if 'error' in step:
                rev_before = game.revision
                try:
                    if op == 'configure':
                        game.configure(args['placements'], args['monster_control'])
                    elif op == 'start':
                        game.start()
                    elif op == 'perform':
                        game.perform(args['action_id'])
                    elif op == 'end_turn':
                        game.end_turn()
                    elif op == 'advance':
                        game.advance(autoplay=args['autoplay'])
                    else:
                        raise AssertionError(f'unknown step op {op!r}')
                except ValueError as exc:
                    if str(exc) != step['error']:
                        return {'session': path.name, 'ok': False, 'step': si,
                                'reason': f'{ctx}: error {str(exc)!r} != {step["error"]!r}'}
                    if game.revision != rev_before:
                        return {'session': path.name, 'ok': False, 'step': si,
                                'reason': f'{ctx}: rejected op mutated revision'}
                    continue
                return {'session': path.name, 'ok': False, 'step': si,
                        'reason': f'{ctx}: expected ValueError({step["error"]!r}), got 200'}

            if op == 'configure':
                raw = game.configure(args['placements'], args['monster_control'])
            elif op == 'start':
                raw = game.start()
            elif op == 'perform':
                raw = game.perform(args['action_id'])
            elif op == 'end_turn':
                raw = game.end_turn()
            elif op == 'advance':
                raw = game.advance(autoplay=args['autoplay'])
            else:
                raise AssertionError(f'unknown step op {op!r}')
            assert_full_wire_parity(ctx, game.wire(raw), step['wire'])

        rem = game.remaining_replay_draws()
        if rem != 0:
            return {'session': path.name, 'ok': False, 'step': len(doc['steps']),
                    'reason': f'{rem} unconsumed replay draws'}
        return {'session': path.name, 'ok': True, 'steps': len(doc['steps']), 'draws': len(draws)}
    except Exception as exc:
        return {'session': path.name, 'ok': False, 'reason': f'{type(exc).__name__}: {exc}'}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('paths', nargs='+', help='Session JSON files or directories')
    ap.add_argument('--json-out', help='Optional JSONL path for per-session results')
    ap.add_argument('--workers', type=int, default=8, help='Parallel worker processes (default: 8)')
    args = ap.parse_args()

    files = iter_session_files(args.paths)
    if not files:
        print('No session JSON files found.', file=sys.stderr)
        return 1

    ok = 0
    failures: list[dict] = []
    out_lines: list[str] = []
    if args.workers > 1 and len(files) > 1:
        with ProcessPoolExecutor(max_workers=args.workers) as pool:
            results = list(pool.map(verify_one, files, chunksize=8))
    else:
        results = [verify_one(p) for p in files]

    for res in results:
        out_lines.append(json.dumps(res, sort_keys=True))
        if res['ok']:
            ok += 1
        else:
            failures.append(res)

    if args.json_out:
        Path(args.json_out).write_text('\n'.join(out_lines) + '\n', encoding='utf-8')

    print(f'Verified {ok}/{len(files)} sessions exact on full wire (including log).')
    for fail in failures[:20]:
        print(f"  FAIL {fail['session']}: {fail['reason']}", file=sys.stderr)
    return 0 if not failures else 1


if __name__ == '__main__':
    raise SystemExit(main())
