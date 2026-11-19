"""Mirror a trainer's metrics.jsonl into Weights & Biases.

The trainer (`ember_rl.duel`) writes one JSON row per event to `<run>/metrics.jsonl`:
`update` (PPO statistics per team), `progress` (throughput), `dev` (development
evaluations and the gate) and `phase` (phase switches). This script follows such a file
and logs every numeric scalar of every row to one W&B run, with `hours` (the row's
`elapsed` time) as the x-axis. Nested fields (per-encounter tables) are skipped.

It only reads the file, so it can follow a running experiment without touching it, for
example the hourly local copy of a remote run. The API key is read from a file inside
this program, so it never appears on a command line, and it stays on the machine that
runs this script. Restart-safe: the number of rows already uploaded is kept in --state,
and the W&B run is resumed by its fixed --run-id.

Usage:
  python scripts/wandb_follow.py --metrics RUN/metrics.jsonl --key-file KEYFILE \
      --project forests-and-faeries --run-id ID --name NAME [--group G] [--args RUN/ARGS] \
      [--state STATE.json] [--poll 60] [--once]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

SKIP_KEYS = {'type', 'team', 'elapsed'}


def flatten(row: dict) -> dict:
    """The row's numeric scalars, named `<type>/<team>/<field>` (or `<type>/<field>` without a team)."""
    kind = row.get('type', 'row')
    prefix = f"{kind}/{row['team']}/" if isinstance(row.get('team'), str) else f'{kind}/'
    out = {}
    for key, value in row.items():
        if key in SKIP_KEYS:
            continue
        if isinstance(value, bool):
            out[prefix + key] = int(value)
        elif isinstance(value, (int, float)):
            out[prefix + key] = value
    n = row.get('n')
    if isinstance(n, (int, float)) and n > 0:  # dev rows count wins, losses and draws out of n games
        for key in ('win', 'loss', 'draw', 'truncation'):
            if isinstance(row.get(key), (int, float)):
                out[f'{prefix}{key}_rate'] = row[key] / n
    return out


def read_args(path: Path) -> dict:
    """The trainer's ARGS file (one token per line) as a config dict."""
    tokens = [t for t in path.read_text().split('\n') if t]
    config, i = {}, 0
    while i < len(tokens):
        flag = tokens[i]
        if not flag.startswith('--'):
            i += 1
            continue
        values = []
        i += 1
        while i < len(tokens) and not tokens[i].startswith('--'):
            values.append(tokens[i])
            i += 1
        config[flag[2:]] = True if not values else values[0] if len(values) == 1 else values
    return config


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--metrics', required=True, type=Path)
    ap.add_argument('--key-file', required=True, type=Path, help='file holding the W&B API key (one line)')
    ap.add_argument('--project', required=True)
    ap.add_argument('--entity', default=None, help='W&B entity (default: the key owner\'s default)')
    ap.add_argument('--run-id', required=True, help='fixed W&B run id, so a restart resumes the same run')
    ap.add_argument('--name', required=True)
    ap.add_argument('--group', default=None)
    ap.add_argument('--args', type=Path, default=None, help="the trainer's ARGS file, logged as the run config")
    ap.add_argument('--state', type=Path, default=None, help='where to keep the number of uploaded rows')
    ap.add_argument('--poll', type=float, default=60., help='seconds between reads of the metrics file')
    ap.add_argument('--once', action='store_true', help='upload what is there and exit')
    args = ap.parse_args(argv)

    os.environ['WANDB_API_KEY'] = args.key_file.read_text().strip()
    os.environ.setdefault('WANDB_SILENT', 'true')
    import wandb

    state_path = args.state or args.metrics.with_name('.wandb-follow.json')
    done = json.loads(state_path.read_text())['rows'] if state_path.exists() else 0
    config = read_args(args.args) if args.args and args.args.exists() else {}
    run = wandb.init(project=args.project, entity=args.entity, id=args.run_id, name=args.name, group=args.group,
                     config=config, resume='allow')
    run.define_metric('hours')
    run.define_metric('*', step_metric='hours')
    try:
        while True:
            if args.metrics.exists():
                with args.metrics.open() as stream:
                    lines = stream.read().split('\n')
                complete = lines[:-1]  # the last piece may be a row still being written
                for line in complete[done:]:
                    try:
                        row = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    data = flatten(row)
                    if data and isinstance(row.get('elapsed'), (int, float)):
                        data['hours'] = row['elapsed'] / 3600
                        run.log(data)
                if len(complete) > done:
                    done = len(complete)
                    state_path.parent.mkdir(parents=True, exist_ok=True)
                    tmp = state_path.with_suffix('.tmp')
                    tmp.write_text(json.dumps({'rows': done, 'metrics': str(args.metrics)}) + '\n')
                    tmp.replace(state_path)
                    print(f'{time.strftime("%H:%M:%S")} {args.name}: {done} rows uploaded', flush=True)
            if args.once:
                return 0
            time.sleep(args.poll)
    finally:
        run.finish()


if __name__ == '__main__':
    sys.exit(main())
