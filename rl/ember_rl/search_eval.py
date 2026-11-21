"""Measure decision-time lookahead (ember_rl.search) on paired held-out games (evaluation only).

One run plays one matchup on fixed paired specs (the crossplay specs: `SpecSource.fixed(split, n,
EVAL_SEED_BASE)`, map at offset 0), all games in flight at once:

    python -m ember_rl.search_eval play --out DIR --catalog CAT --split test --episodes 1024 \
        --policy heroes=best-heroes.pt --policy monsters=best-monsters.pt \
        --heroes search --monsters native --search k=4,seeds=4,horizon=turns:1 [--name NAME]
    python -m ember_rl.search_eval report DIR [DIR ...]

A side is `native` (the env's native AI), `net` (its --policy, greedy) or `search` (its --policy as prior,
evaluator and rollout policy, plus the other side's --policy when that side decides in the forks).
Rows are hero-relative and keep native wins, losses, draws, horizon adjudications and truncations apart.
`report` pairs every run with the run of the same matchup without search (same specs) and gives the win
rate difference with a paired standard error, plus the cost: searched decisions, forks and network rows
per searched decision, and wall seconds per searched decision.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np

OUTCOMES = ('win', 'loss', 'draw', 'horizon_win', 'horizon_loss', 'horizon_draw', 'truncation')
# content/vocab.json action_kinds (ember-rs encode.rs ACTION_KINDS), for the changed-decision breakdown
KIND_NAMES = dict(enumerate(('move', 'attack', 'dash', 'dodge', 'stand', 'second_wind', 'action_surge', 'spell',
                             'turn_undead', 'divine_spark', 'preserve_life', 'spiritual_weapon', 'innate_sorcery',
                             'dragons_breath', 'end_turn', 'disengage_bonus', 'hide_bonus', 'redirect_attack',
                             'rage', 'extend_rage', 'reckless_attack', 'cleave', 'disengage', 'spiritual_weapon_move',
                             'create_spell_slot', 'convert_spell_slot')))
MODES = ('native', 'net', 'search')


def play(args):
    import torch
    import ember_rs
    from ember_rl.duel import EVAL_SEED_BASE, TEAMS, Trainer
    from ember_rl.general_duel import load_general
    from ember_rl.general_env import SpecSource, info_row, load_catalog
    from ember_rl.general_model import forward_in_chunks, select, to_batch
    from ember_rl.search import Lookahead, Root, parse_search, root_hidden

    torch.manual_seed(args.seed)
    device = torch.device(args.device)
    mode = dict(heroes=args.heroes, monsters=args.monsters)
    paths = dict(p.split('=', 1) for p in args.policy)
    config = parse_search(args.search) if 'search' in mode.values() else None
    env = ember_rs.BatchEnv(n_slots=args.slots, content=ember_rs.ContentPool(['content/srd']), scores=False,
                            objective='health_score', max_rounds=args.max_rounds, standing_weight=args.standing_weight,
                            max_steps=args.max_steps, threads=args.threads, catalog=args.catalog)
    models = {t: load_general(paths[t], 'cpu', env.feature_version, t).to(device).eval() for t in TEAMS if t in paths}
    for t in TEAMS:
        if mode[t] != 'native' and t not in models:
            raise SystemExit(f'--{t} {mode[t]} needs --policy {t}=PATH')
    search_team = [t for t in TEAMS if mode[t] == 'search']
    if len(search_team) > 1:
        raise SystemExit('search on one side at a time')
    lookahead = None
    rollout_models = {}
    if search_team:
        lookahead = Lookahead(env, config, device, seed=args.seed, threads=args.threads)
        for t in TEAMS:
            if mode[t] != 'native' or config.opponent == 'policy':
                if t not in models:
                    raise SystemExit(f'search with opponent=policy needs --policy {t}=PATH')
                rollout_models[t] = models[t]
            else:
                rollout_models[t] = None
    specs = SpecSource(load_catalog(args.catalog)).fixed(args.split, args.episodes, EVAL_SEED_BASE)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    name = args.name or f'{args.heroes}-vs-{args.monsters}'
    controllers = {t: 'native' if mode[t] == 'native' else 'external' for t in TEAMS}
    shard, shards = (int(x) for x in args.shard.split('/'))
    mine = [k for k in range(len(specs)) if k % shards == shard]
    if shards > 1:
        name = f'{name}@{shard}of{shards}'
    n = min(args.slots, len(mine))
    state = [None] * args.slots
    queue = mine[::-1]
    decisions = Counter()
    changed, changed_kinds = 0, Counter()
    started = time.time()
    rows_out = []

    def start(slots):
        ks = [queue.pop() for _ in slots]
        info = env.reset(slots, [specs[k] for k in ks], [controllers] * len(slots))
        for i, g in enumerate(slots):
            state[g] = dict(k=ks[i], info=info_row(info, i))

    start(list(range(n)))
    while any(s is not None for s in state):
        for g, s in enumerate(state):
            if s is not None and s['info']['done']:
                outcome, score = Trainer.eval_outcome('heroes', s['info'])
                rows_out.append(dict(k=s['k'], encounter=specs[s['k']].encounter, outcome=outcome,
                                     score=round(score, 5), rounds=s['info']['round']))
                state[g] = None
        free = [g for g, s in enumerate(state) if s is None]
        if queue and free:
            start(free[:len(queue)])
            continue
        live = [g for g, s in enumerate(state) if s is not None]
        if not live:
            break
        obs = env.observe(live)
        rows = np.zeros(len(live), np.int32)
        groups = defaultdict(list)
        for i, g in enumerate(live):
            groups[state[g]['info']['team']].append(i)
        for team, idx in groups.items():
            if mode[team] == 'native':
                raise RuntimeError('a native side surfaced a decision')
            sub = select(obs, idx)
            with torch.no_grad():
                logits, values = forward_in_chunks(models[team], sub, device)
            decisions[team] += len(idx)
            if mode[team] == 'net':
                rows[idx] = logits.argmax(-1).cpu().numpy()
                continue
            legal = sub['cand_mask'].sum(1)
            logits, values = logits.float().cpu().numpy(), values.float().cpu().numpy()
            roots = []
            for j, i in enumerate(idx):
                g = live[i]
                info = state[g]['info']
                roots.append(Root(slot=g, team=team, logits=logits[j, :legal[j]], value=float(values[j]),
                                  round=info['round'], actor=info['actor'], potential=info['potential'],
                                  models=rollout_models, hidden=root_hidden(sub, j),
                                  kinds=sub['cand_ids'][j, :legal[j], 0]))
            results = lookahead.search(env, roots)
            for j, (i, res) in enumerate(zip(idx, results)):
                rows[i] = res.row
                greedy = int(np.argmax(logits[j, :legal[j]]))
                if res.row != greedy:
                    changed += 1
                    kinds = sub['cand_ids'][j, [greedy, res.row], 0]
                    changed_kinds[f'{KIND_NAMES.get(int(kinds[0]), kinds[0])}>{KIND_NAMES.get(int(kinds[1]), kinds[1])}'] += 1
        info = env.step(live, rows)
        for i, g in enumerate(live):
            state[g]['info'] = info_row(info, i)
    wall = time.time() - started
    rows_out.sort(key=lambda r: r['k'])
    with (out / f'games-{name}.jsonl').open('w') as stream:
        for r in rows_out:
            stream.write(json.dumps(r) + '\n')
    counts = Counter(r['outcome'] for r in rows_out)
    summary = dict(name=name, group=args.name or f'{args.heroes}-vs-{args.monsters}', shard=args.shard, heroes=args.heroes, monsters=args.monsters, search=config.to_text() if config else None,
                   search_team=search_team[0] if search_team else None, split=args.split, episodes=len(rows_out),
                   hero_win_rate=round(counts['win'] / len(rows_out), 4),
                   mean_score=round(float(np.mean([r['score'] for r in rows_out])), 4),
                   mean_rounds=round(float(np.mean([r['rounds'] for r in rows_out])), 3),
                   outcomes={k: counts[k] for k in OUTCOMES}, decisions=dict(decisions), changed=changed,
                   changed_kinds=dict(changed_kinds.most_common(12)),
                   wall_seconds=round(wall, 1), device=str(device),
                   gpu=torch.cuda.get_device_name(device) if device.type == 'cuda' else None,
                   threads=args.threads, slots=args.slots, policies=paths,
                   search_stats=lookahead.summary() if lookahead else None)
    if lookahead and lookahead.stats['searched']:
        s = lookahead.stats
        summary['seconds_per_searched_decision'] = round(s['seconds'] / s['searched'], 5)
        summary['searched_decisions_per_s'] = round(s['searched'] / s['seconds'], 2)
    (out / f'summary-{name}.json').write_text(json.dumps(summary, indent=1) + '\n')
    print(json.dumps(summary), flush=True)
    return summary


def wilson(p, n):
    return math.sqrt(max(p * (1 - p), 1e-12) / n) if n else float('nan')


def merge_shards(runs):
    """Runs of one matchup played in shards (--shard i/n, same group) become one run: games joined,
    counts and search statistics summed, wall time the slowest shard's."""
    groups = defaultdict(list)
    for s, games in runs:
        groups[s.get('group', s['name'])].append((s, games))
    out = []
    for group, parts in groups.items():
        if len(parts) == 1:
            out.append(parts[0])
            continue
        s = dict(parts[0][0], name=group, shard='merged')
        games = {k: g for _, gs in parts for k, g in gs.items()}
        rows = list(games.values())
        counts = Counter(r['outcome'] for r in rows)
        stats = Counter()
        for p, _ in parts:
            stats.update({k: v for k, v in (p.get('search_stats') or {}).items()
                          if k in ('roots', 'hidden_roots', 'searched', 'skipped', 'candidates', 'forks', 'forward_rows',
                                   'value_rows', 'leaves', 'depth', 'terminal_leaves', 'changed', 'seconds')})
        if stats['searched']:
            stats['forks_per_search'] = round(stats['forks'] / stats['searched'], 2)
            stats['rows_per_search'] = round((stats['forward_rows'] + stats['value_rows']) / stats['searched'], 1)
            stats['mean_depth'] = round(stats['depth'] / stats['leaves'], 2)
            stats['terminal_fraction'] = round(stats['terminal_leaves'] / stats['leaves'], 4)
        s.update(episodes=len(rows), hero_win_rate=round(counts['win'] / len(rows), 4),
                 mean_score=round(float(np.mean([r['score'] for r in rows])), 4),
                 mean_rounds=round(float(np.mean([r['rounds'] for r in rows])), 3),
                 outcomes={k: counts[k] for k in OUTCOMES}, changed=sum(p['changed'] for p, _ in parts),
                 wall_seconds=max(p['wall_seconds'] for p, _ in parts), search_stats=dict(stats) or None,
                 gpu=' + '.join(sorted({str(p.get('gpu')) for p, _ in parts})))
        if stats['searched']:
            s['seconds_per_searched_decision'] = None     # shards ran on different GPUs: see each shard's summary
        out.append((s, games))
    return out


def report(args):
    runs = []
    for d in args.dirs:
        for f in sorted(Path(d).glob('summary-*.json')):
            s = json.loads(f.read_text())
            games = {}
            for line in (f.parent / f'games-{s["name"]}.jsonl').read_text().splitlines():
                r = json.loads(line)
                games[r['k']] = r
            runs.append((s, games))
    runs = merge_shards(runs)
    base = {}
    for s, games in runs:
        if s['search'] is None:
            base[(s['heroes'], s['monsters'], s['split'])] = (s, games)
    lines = ['matchup (heroes vs monsters), search side and config, hero win rate, mean score, '
             'difference from the same matchup without search (paired, ± s.e.), cost', '']
    for s, games in sorted(runs, key=lambda x: (x[0]['heroes'], x[0]['monsters'], x[0]['search'] or '')):
        team = s['search_team']
        line = (f"{s['heroes']:>6} vs {s['monsters']:<6} n {s['episodes']:5d}  hero win {s['hero_win_rate']:.3f} "
                f"(±{wilson(s['hero_win_rate'], s['episodes']):.3f})  score {s['mean_score']:+.3f}  "
                f"rounds {s['mean_rounds']:.1f}")
        if team:
            plain = dict(heroes='net' if s['heroes'] == 'search' else s['heroes'],
                         monsters='net' if s['monsters'] == 'search' else s['monsters'])
            ref = base.get((plain['heroes'], plain['monsters'], s['split']))
            if ref:
                common = sorted(set(games) & set(ref[1]))
                d = np.array([float(games[k]['outcome'] == 'win') - float(ref[1][k]['outcome'] == 'win') for k in common])
                ds = np.array([games[k]['score'] - ref[1][k]['score'] for k in common])
                sign = 1 if team == 'heroes' else -1
                line += (f"  [{team} search] win {sign * d.mean():+.3f} ± {d.std(ddof=1) / math.sqrt(len(d)):.3f}"
                         f"  score {sign * ds.mean():+.3f} ± {ds.std(ddof=1) / math.sqrt(len(ds)):.3f}")
            st = s.get('search_stats') or {}
            line += (f"\n{'':18}{s['search']}\n{'':18}searched {st.get('searched', 0)} of {st.get('roots', 0)} roots, "
                     f"changed {s['changed']}, {st.get('forks_per_search', 0)} forks and {st.get('rows_per_search', 0)} "
                     f"net rows per search, depth {st.get('mean_depth', 0)}, terminal {st.get('terminal_fraction', 0)}, "
                     f"{(s.get('seconds_per_searched_decision') or 0) * 1000:.1f} ms per searched decision "
                     f"({s['wall_seconds']:.0f} s wall, {s.get('gpu')}), hidden roots {st.get('hidden_roots', 0)}")
        lines.append(line)
    text = '\n'.join(lines) + '\n'
    if args.write:
        Path(args.write).write_text(text)
    print(text)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest='command', required=True)
    a = sub.add_parser('play')
    a.add_argument('--out', required=True)
    a.add_argument('--name', default='')
    a.add_argument('--catalog', required=True)
    a.add_argument('--split', default='test')
    a.add_argument('--episodes', type=int, default=1024)
    a.add_argument('--shard', default='0/1', help='i/n: play only specs k with k %% n == i (report merges the shards)')
    a.add_argument('--policy', action='append', default=[], help='heroes=PATH or monsters=PATH')
    a.add_argument('--heroes', choices=MODES, required=True)
    a.add_argument('--monsters', choices=MODES, required=True)
    a.add_argument('--search', default='', help='ember_rl.search.SearchConfig options, e.g. k=4,seeds=4,horizon=turns:1')
    a.add_argument('--device', default='cuda')
    a.add_argument('--seed', type=int, default=0)
    a.add_argument('--slots', type=int, default=1024)
    a.add_argument('--threads', type=int, default=6)
    a.add_argument('--max-rounds', type=int, default=30)
    a.add_argument('--standing-weight', type=float, default=.5)
    a.add_argument('--max-steps', type=int, default=4096)
    r = sub.add_parser('report')
    r.add_argument('dirs', nargs='+')
    r.add_argument('--write', default='')
    args = p.parse_args(argv)
    if args.command == 'play':
        play(args)
    else:
        report(args)


if __name__ == '__main__':
    sys.exit(main())
