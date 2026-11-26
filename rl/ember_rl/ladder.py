"""League ladder of the l3-open runs: one Bradley-Terry fit over the archived snapshots of every arm
(evaluation only; nothing here trains or writes into a trainer's files except best-league-<team>.pt).

Model (Fable's review, l3-open PLAN.md §10, idea 2): for a game of hero policy h against monster
policy m on encounter e,
    P(hero native-elimination win) = sigmoid(theta_h - phi_m + beta_e),
with the native AI fixed at theta = phi = 0 on both sides. theta and phi are in logits: sigmoid(theta)
is the hero's win rate against native monsters on an encounter where native beats native half the
time. A residual check per (hero, monster) cell (observed minus fitted wins, as z-scores) is the cycle
test: z spread well above 1 means one number per policy no longer explains the payoff matrix.

Data, under <root>/ladder/ (root = the experiment's RUN_ROOT on the training host):
    specsets/<set>.jsonl, .json, .catalog.jsonl   frozen paired specs (`specs`); never rebuilt
    entities.json   every policy the ladder knows: native, and archived phase policies of the runs
                    (<run>/archive/phase-<n>-<team>.pt, from archive/index.json); with --snapshot-runs also
                    the hourly copies <run>/snapshots/latest-<team>-<stamp>.pt of a run that has no archive
                    (the simultaneous schedule archives nothing: without the flag it never enters)
    panel.json      the versioned anchor panel: snapshots chosen at fixed run ages (copied to policies/)
    games.sqlite    every game played (set, hero, monster, spec index, mode, outcome, movement)
    <stamp>.json, <stamp>.txt, latest.json        the result of each round
    daily.json      the latest daily extras (diag set, unseen-kind probe, search headroom)

A round (`round`, every 6 h by the l3open-ladder timer):
  1. registers new archive entries; per run and team the newest one not yet rated "enters";
  2. adds anchors (ops.json ladder.anchor_hours: the last entry of each team at those run ages);
  3. each entrant plays native and --opponents spread-out snapshots of the other side (the newest of
     every run, then anchors, then older snapshots, evenly over time) on every spec of the dev set;
     unfinished pairs carry over; the round stops starting pairs after --minutes;
  4. once a day (--daily auto: if the last daily is older than 20 h): the newest snapshot of every
     run and team against native on the diag set, with test-time search on the first --search-specs
     dev specs (the headroom), and on the probe set of unseen creature kinds, monsters both with the
     network playing every monster and with the unseen kinds handed to the native AI;
     With --native-pair the native AI also plays itself (native heroes against native monsters) on every
     spec of the set: no policy has a parameter in those games, so they measure the encounter offsets, the
     zero that every rating is relative to, instead of leaving it to be inferred from games against policies;
     the report's `native_pair` block has its result next to the catalog's recorded baseline, and each
     headline entry gains `vs_native_pair`: the policy's win rate against the native AI minus the native AI's
     own on the same specs, paired, with its interval (no model; on fx4's games the fitted monster ratings
     of about +0.1 logits stood next to a paired gain of 6 to 8 points).
  5. fits the model on all dev games and writes the ratings (headline: each run's newest snapshot,
     greedy and with search), the payoff matrix with residuals, results by stratum (party size x map
     family) against native with `excess`, movement, the plateau test (the mean rating of a run's
     snapshots of the last 24 h against the 24 h before), and <run>/best-league-<team>.pt: the
     run's snapshot with the highest lower 95% bound (<run>/best-league-<team>.json says which).
The sealed set (generated test, fixed test, held-out mausoleum rooms) is played only by `sealed
--milestone NAME`, which the maintainer asks for; `round` refuses it.

`record` plays and records tapes (env.record) for the reverse-replay check and for fight videos;
--no-step-back is Fable's play-time rule (a move may not return to the square the actor just left
in this turn) for showing trained policies.

    python -m ember_rl.ladder specs  --root R --name dev --catalog A.jsonl B.jsonl --splits dev --n 512
    python -m ember_rl.ladder round  --root R [--minutes 12] [--daily auto] [--device cuda]
    python -m ember_rl.ladder sealed --root R --milestone NAME
    python -m ember_rl.ladder record --root R --heroes P|native --monsters P|native --set dev --n 32 --out DIR
    python -m ember_rl.ladder show   --root R
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import random
import shutil
import sqlite3
import sys
import time
from collections import Counter, defaultdict, deque
from pathlib import Path

import numpy as np

from ember_rl.general_env import (END_TURN_KIND, FEATURE_VERSION, MOVE_KIND, EpisodeSpec, _seed, encounter_units,
                                  info_row, load_jsonl, map_family)

TEAMS = ('heroes', 'monsters')
OTHER = {'heroes': 'monsters', 'monsters': 'heroes'}
NATIVE = {'heroes': 'native-heroes', 'monsters': 'native-monsters'}
OUTCOMES = ('win', 'loss', 'draw', 'horizon_win', 'horizon_loss', 'horizon_draw', 'truncation')
SEED_BASE = 62_000_000           # trainer eval 60M, dev 61M; the ladder's specs never coincide with them
Z95 = 1.959964
GEN_FAMILIES = ('open', 'pillars', 'rooms', 'caves')
DAILY_EVERY_S = 20 * 3600


def utc(t=None):
    return time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime(time.time() if t is None else t))


def stamp(t=None):
    return time.strftime('%Y%m%dT%H%M%SZ', time.gmtime(time.time() if t is None else t))


def read_json(path, default=None):
    try:
        return json.loads(Path(path).read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json(path, data):
    path = Path(path)
    tmp = path.with_name(f'.{path.name}.tmp{os.getpid()}')
    tmp.write_text(json.dumps(data, indent=1, default=float) + '\n')
    os.replace(tmp, path)


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as stream:
        for block in iter(lambda: stream.read(1 << 22), b''):
            h.update(block)
    return h.hexdigest()


def sigmoid(x):
    return 1. / (1. + np.exp(-x))


# --------------------------------------------------------------------------- catalog strata

def family_of(row) -> str:
    """Map family group of a catalog row: gen-<open|pillars|rooms|caves> for generated maps; otherwise the
    trainer's family (general_env.map_family): fixed for the authored maps, the map-name prefix for a hand-made
    map set (the campaign rooms: mausoleum); an explicit `ladder_family` wins."""
    if row.get('ladder_family'):
        return str(row['ladder_family'])
    family = map_family(row)
    if family == 'generated':
        m = row.get('map')
        ember = (m.get('ember') or {}) if isinstance(m, dict) else {}
        gen = ember.get('family') or row.get('map_family')
        return f'gen-{gen}' if gen and gen != 'hand' else 'generated'
    return family


def party_of(row) -> list:
    units = encounter_units(row) or []
    heroes = [u['content'] for u in units if u.get('team') == 'heroes']
    if heroes and all(h is not None for h in heroes):
        return sorted(heroes)
    return [f'hero{k}' for k in range(int(row.get('n_heroes') or len(heroes) or 0))]


def kinds_of(row) -> dict:
    units = encounter_units(row) or []
    return dict(Counter(u['content'] for u in units if u.get('team') == 'monsters' and u.get('content')))


def slice_of(row) -> str | None:
    if row.get('test_slice'):
        return str(row['test_slice'])
    if 'map_split' in row or 'roster_holdout' in row:
        return f'map-{row.get("map_split", "?")}/roster-{"held-out" if row.get("roster_holdout") else "seen"}'
    return None


def baseline(row, team) -> float | None:
    if isinstance(row.get('baseline'), dict) and team in row['baseline']:
        return float(row['baseline'][team])
    if row.get('p') is None:
        return None
    p = float(row['p'])
    return p if team == 'heroes' else 1. - p - float(row.get('truncation', 0.))


# --------------------------------------------------------------------------- spec sets

def cmd_specs(args):
    """A frozen spec set: --n paired specs spread evenly over the strata (party size x map family) of the
    catalog rows in --splits, round-robin over each stratum's encounters (sorted by id)."""
    out = Path(args.root) / 'ladder' / 'specsets'
    out.mkdir(parents=True, exist_ok=True)
    base = out / args.name
    if base.with_suffix('.jsonl').exists() and not args.force:
        raise SystemExit(f'{base}.jsonl exists: spec sets are frozen (use a new --name, e.g. {args.name}-v2)')
    rows, sources = [], {}
    seen = {}
    for path in args.catalog:
        data = Path(path).read_bytes()
        sources[str(Path(path).resolve())] = hashlib.sha256(data).hexdigest()
        for row in load_jsonl(path):
            if row['id'] in seen:
                raise SystemExit(f'duplicate encounter id {row["id"]} ({path} and {seen[row["id"]]})')
            seen[row['id']] = path
            rows.append(row)
    splits = set(args.splits)
    chosen = [r for r in rows if r.get('split', 'train') in splits or 'all' in splits]
    if not chosen:
        raise SystemExit(f'no catalog rows in splits {sorted(splits)}')
    strata = defaultdict(list)
    for r in chosen:
        strata[f'{len(party_of(r))}h/{family_of(r)}'].append(r)
    names = sorted(strata)
    quota = {s: args.n // len(names) + (1 if i < args.n % len(names) else 0) for i, s in enumerate(names)}
    specs = []
    salt = int(hashlib.sha256(args.name.encode()).hexdigest()[:6], 16)
    for s in names:
        members = sorted(strata[s], key=lambda r: r['id'])
        for j in range(quota[s]):
            r = members[j % len(members)]
            seed = SEED_BASE + salt + len(specs)
            specs.append(dict(encounter=r['id'], map_seed=_seed('map', r['id'], seed), layout_seed=_seed('layout', r['id'], seed),
                              dice_seed=_seed('dice', r['id'], seed), offset_x=0, offset_y=0, stratum=s,
                              party='+'.join(party_of(r)), family=family_of(r), slice=slice_of(r), kinds=kinds_of(r),
                              b_heroes=baseline(r, 'heroes'), b_monsters=baseline(r, 'monsters')))
    with open(f'{base}.catalog.jsonl', 'w') as stream:
        for r in rows:
            stream.write(json.dumps(r) + '\n')
    with open(f'{base}.jsonl', 'w') as stream:
        for k, s in enumerate(specs):
            stream.write(json.dumps(dict(k=k, **s)) + '\n')
    manifest = dict(name=args.name, created=utc(), splits=sorted(splits), n=len(specs), sealed=bool(args.sealed),
                    catalogs=sources, encounters=len({s['encounter'] for s in specs}),
                    strata={s: dict(specs=quota[s], encounters=len(strata[s])) for s in names})
    write_json(f'{base}.json', manifest)
    print(json.dumps(manifest, indent=1))


def load_specset(root, name):
    base = Path(root) / 'ladder' / 'specsets' / name
    manifest = read_json(f'{base}.json')
    if manifest is None:
        raise SystemExit(f'no spec set {name} under {base.parent} (ladder.py specs)')
    for path, digest in manifest['catalogs'].items():
        if Path(path).exists() and sha256(path) != digest:
            raise SystemExit(f'catalog {path} changed since spec set {name} was frozen')
    specs = load_jsonl(f'{base}.jsonl')
    return manifest, specs, f'{base}.catalog.jsonl'


def episode(spec) -> EpisodeSpec:
    return EpisodeSpec(spec['encounter'], spec['map_seed'], spec['layout_seed'], spec['dice_seed'],
                       spec.get('offset_x', 0), spec.get('offset_y', 0))


# --------------------------------------------------------------------------- entities and panel

class Registry:
    def __init__(self, root, include_smoke=False, snapshots=False):
        self.root = Path(root)
        self.snapshots = snapshots
        self.dir = self.root / 'ladder'
        self.dir.mkdir(parents=True, exist_ok=True)
        (self.dir / 'policies').mkdir(exist_ok=True)
        self.include_smoke = include_smoke
        self.entities = read_json(self.dir / 'entities.json', {}) or {}
        for team in TEAMS:
            self.entities.setdefault(NATIVE[team], dict(id=NATIVE[team], team=team, kind='native', run=None,
                                                        created=0., status='ok'))
        self.panel = read_json(self.dir / 'panel.json', None) or dict(
            versions=[dict(version=1, created=utc(), members=list(NATIVE.values()), added=list(NATIVE.values()),
                           reason='native on both sides')])

    def save(self):
        write_json(self.dir / 'entities.json', self.entities)
        write_json(self.dir / 'panel.json', self.panel)

    def runs(self):
        bases = [self.root] + ([self.root / 'smoke'] if self.include_smoke else [])
        out = []
        for base in bases:
            for info_path in sorted(base.glob('*/RUN.json')):
                info = read_json(info_path, {}) or {}
                if info.get('mode') in ('real', 'smoke', 'test') and (info.get('mode') == 'real' or self.include_smoke):
                    out.append((info_path.parent, info))
        return out

    def discover(self):
        """Register the runs' archive entries; mark entries whose file vanished (archive/dropped/)."""
        new = []
        for run, info in self.runs():
            index = read_json(run / 'archive' / 'index.json', {}) or {}
            for entry in index.get('entries', []):
                eid = f'{run.name}/{entry["id"]}'
                path = run / entry['path']
                created = entry.get('created') or {}
                if eid not in self.entities:
                    self.entities[eid] = dict(
                        id=eid, team=entry['team'], kind='archive', run=run.name, run_dir=str(run), arm=info.get('arm'),
                        phase=entry.get('phase'), path=str(path),
                        created=float(created.get('time') or (path.stat().st_mtime if path.exists() else time.time())),
                        elapsed=float(created.get('elapsed') or 0.), selection=entry.get('selection'),
                        status='ok' if path.exists() else 'dropped', registered=utc())
                    new.append(eid)
            if self.snapshots and not (run / 'archive' / 'index.json').exists():
                new += self.discover_snapshots(run, info)
            for e in self.entities.values():
                if e.get('run') == run.name and e['kind'] == 'archive' and e['status'] == 'ok' and \
                        not Path(e['path']).exists():
                    e['status'] = 'dropped'
        return new

    def discover_snapshots(self, run, info):
        """--snapshot-runs: a run without an archive (the simultaneous schedule selects no phase policies)
        enters with the ops' hourly copies of its learners, <run>/snapshots/latest-<team>-<stamp>.pt. They are
        registered like archive entries ('<run>/snap-<stamp>-<team>', source 'snapshot', no phase): created =
        the file's time (the copy keeps the checkpoint's), elapsed = created minus the run's start (RUN.json),
        which counts stops as training time. Retention thins the copies; a vanished one is marked dropped and
        anchors are copied to ladder/policies/ as for archive entries."""
        new = []
        started = float(info.get('created') or 0.)
        for team in TEAMS:
            for path in sorted((run / 'snapshots').glob(f'latest-{team}-*.pt')):
                tag = path.stem[len(f'latest-{team}-'):]
                eid = f'{run.name}/snap-{tag}-{team}'
                if eid in self.entities:
                    continue
                created = path.stat().st_mtime
                self.entities[eid] = dict(
                    id=eid, team=team, kind='archive', source='snapshot', run=run.name, run_dir=str(run),
                    arm=info.get('arm'), phase=None, path=str(path), created=float(created),
                    elapsed=max(0., created - started) if started else 0., selection=None, status='ok',
                    registered=utc())
                new.append(eid)
        return new

    def run_age(self, run_dir):
        """Training time of a run in seconds (checkpoint.json, else its newest archive entry)."""
        meta = read_json(Path(run_dir) / 'checkpoint.json', {}) or {}
        ages = [e.get('elapsed', 0.) for e in self.entities.values() if e.get('run_dir') == str(run_dir)]
        return max([float(meta.get('elapsed') or 0.)] + ages)

    def update_panel(self, anchor_hours):
        """Anchors at fixed run ages: per run, team and hour H, the last entry created at or before H hours
        of training, once the run is older than H. Anchors are copied to ladder/policies/ (an archive file
        may later move to archive/dropped/ on a resume). Each change is a new panel version."""
        members = list(self.panel['versions'][-1]['members'])
        added = []
        for run, info in self.runs():
            age = self.run_age(run)
            for hours in anchor_hours:
                if age < hours * 3600:
                    continue
                for team in TEAMS:
                    tag = f'{run.name}@{hours}h-{team}'
                    if any(self.entities.get(m, {}).get('anchor') == tag for m in members):
                        continue
                    pool = [e for e in self.entities.values() if e.get('run') == run.name and e['team'] == team
                            and e['kind'] == 'archive' and e['status'] == 'ok' and e['elapsed'] <= hours * 3600]
                    if not pool:
                        continue
                    pick = max(pool, key=lambda e: (e['elapsed'], e.get('phase') or 0))
                    if pick['id'] in members:
                        continue
                    copy = self.dir / 'policies' / (pick['id'].replace('/', '__') + '.pt')
                    if not copy.exists():
                        shutil.copy2(pick['path'], copy)
                    pick.update(anchor=tag, source=pick['path'], path=str(copy), sha256=sha256(copy))
                    members.append(pick['id'])
                    added.append(pick['id'])
        if added:
            self.panel['versions'].append(dict(version=len(self.panel['versions']) + 1, created=utc(),
                                               members=members, added=added, reason='anchors at fixed run ages'))
        return added

    @property
    def panel_members(self):
        return self.panel['versions'][-1]['members']

    @property
    def panel_version(self):
        return self.panel['versions'][-1]['version']


# --------------------------------------------------------------------------- games database

SCHEMA = """CREATE TABLE IF NOT EXISTS games (
    set_name TEXT, h TEXT, m TEXT, k INTEGER, mode TEXT, encounter TEXT, stratum TEXT,
    outcome TEXT, score REAL, rounds INTEGER, hmv TEXT, mmv TEXT, round_id TEXT, played REAL,
    PRIMARY KEY (set_name, h, m, k, mode))"""


def open_db(path):
    db = sqlite3.connect(str(path), timeout=60)
    db.execute(SCHEMA)
    db.execute('CREATE INDEX IF NOT EXISTS games_hm ON games (set_name, mode, h, m)')
    return db


def played_ks(db, set_name, h, m, mode='full'):
    return {k for (k,) in db.execute('SELECT k FROM games WHERE set_name=? AND h=? AND m=? AND mode=?',
                                     (set_name, h, m, mode))}


# --------------------------------------------------------------------------- playing games

class Models:
    """Lazily loaded frozen policies (greedy) keyed by entity id; '<id>+search' shares <id>'s model."""

    def __init__(self, registry, device, feature_version, paths=None):
        self.registry, self.device, self.feature_version = registry, device, feature_version
        self.paths = paths or {}
        self.cache = {}

    def base(self, eid):
        return eid[:-len('+search')] if eid.endswith('+search') else eid

    def get(self, eid):
        eid = self.base(eid)
        if eid not in self.cache:
            from ember_rl.general_duel import load_general
            if eid in self.paths:
                path, team = self.paths[eid]
            else:
                e = self.registry.entities[eid]
                path, team = e['path'], e['team']
            self.cache[eid] = load_general(path, 'cpu', self.feature_version, team).to(self.device).eval()
        return self.cache[eid]

    def release(self, keep):
        keep_base = {self.base(k) for k in keep}
        dropped = [e for e in self.cache if e not in keep_base]
        for eid in dropped:
            del self.cache[eid]
        if dropped and str(self.device).startswith('cuda'):
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()


class Player:
    """Plays queued (hero, monster) pairs on fixed specs in one BatchEnv, all games in flight at once.
    A side is 'native-<team>' (the env's native AI), an entity id (its policy, greedy) or '<id>+search'
    (test-time lookahead with the policy as prior; needs env.fork). Records per game: hero-relative
    outcome and score, rounds, and per side the movement of its policy-controlled turns."""

    def __init__(self, env, models, device, *, search=None, noback=False, seed=0, threads=None, micro_batch=128,
                 forward_rows=1 << 16, max_models=6):
        self.env, self.models, self.device = env, models, device
        self.noback = noback
        self.micro_batch = max(1, int(micro_batch))     # games per forward pass (the GPU is shared with an arm)
        self.forward_rows = int(forward_rows)            # and at most this many candidate rows (games x widest K)
        self.max_models = max(0, int(max_models)) if max_models is not None else 0
        self.lookahead = None
        if search:
            from ember_rl.search import Lookahead, parse_search
            self.search_cfg = parse_search(search)
            self.lookahead = Lookahead(env, self.search_cfg, device, seed=seed, threads=threads)

    def _pair_models(self, pair):
        return {self.models.base(s) for s in (pair['h'], pair['m']) if not s.startswith('native-')}

    def _active_models(self, state, queue):
        active = set()
        for s in state:
            if s is not None:
                active |= self._pair_models(s['pair'])
        for pair, _ in queue:
            active |= self._pair_models(pair)
        return active

    def play(self, jobs, on_game, budget_s=None, started=None):
        """jobs: iterable of pairs dict(h, m, ks, specs, mode, controllers (spec -> mapping) or None,
        record (dir) or None, tag). Returns (games played, pairs started). With budget_s: no new game starts
        after it, and games still running at budget_s + grace (the larger of 2 min and a quarter of the
        budget) are abandoned unrecorded; specs are deterministic, so a later round replays them."""
        import torch
        from ember_rl.general_model import forward_in_chunks, select
        from ember_rl.search import Root, root_hidden
        env = self.env
        started = started or time.time()
        pairs = deque(jobs)
        queue = deque()
        state = [None] * env.n_slots
        free = list(range(env.n_slots))
        n_games = n_pairs = 0
        hard_stop = None if budget_s is None else started + budget_s + max(120., budget_s / 4)

        def reap():
            nonlocal n_games
            for g in range(env.n_slots):
                s = state[g]
                if s is None or not s['info']['done']:
                    continue
                self.close_turn(s)
                pair = s['pair']
                if pair.get('record'):
                    spec = pair['specs'][s['k']]
                    name = f'{spec["encounter"]}__{s["k"]}'
                    env.record(g, str(Path(pair['record']) / 'tapes' / f'{name}.jsonl'))
                outcome, score = outcome_of(s['info'])
                on_game(pair, s['k'], outcome, score, s['info']['round'], s['mv'])
                n_games += 1
                state[g] = None
                free.append(g)

        while pairs or queue or any(s is not None for s in state):
            if hard_stop is not None and time.time() > hard_stop:
                abandoned = sum(s is not None for s in state)
                if abandoned:
                    print(f'ladder: time budget exceeded; {abandoned} running games abandoned (replayed later)',
                          flush=True)
                break
            active = self._active_models(state, queue) if self.max_models else None
            while len(queue) < len(free) and pairs:
                if budget_s is not None and time.time() - started > budget_s:
                    pairs.clear()           # unfinished pairs are queued again by the next round
                    break
                if self.max_models:
                    nxt = self._pair_models(pairs[0])
                    if active and len(active | nxt) > self.max_models:
                        break
                pair = pairs.popleft()
                n_pairs += 1
                for k in pair['ks']:
                    queue.append((pair, k))
                if self.max_models and pair['ks']:
                    active |= nxt
            starting = []
            if budget_s is not None and time.time() - started > budget_s:
                queue.clear()               # games not started yet are played by the next round
                pairs.clear()
            while queue and free:
                g = free.pop()
                pair, k = queue.popleft()
                # mv per side: turns, squares walked, revisited destinations, decisions, move decisions
                state[g] = dict(pair=pair, k=k, mv={t: [0, 0, 0, 0, 0] for t in TEAMS}, actor=None, trail=[],
                                seen=set(), tteam=None)
                starting.append(g)
            if starting:
                ctrls = [self.controllers(state[g]['pair'], state[g]['k']) for g in starting]
                info = env.reset(starting, [episode(state[g]['pair']['specs'][state[g]['k']]) for g in starting], ctrls)
                for i, g in enumerate(starting):
                    state[g]['info'] = info_row(info, i)
                reap()
            if self.max_models and self.models.cache:
                keep = self._active_models(state, queue)
                if any(e not in keep for e in self.models.cache):
                    self.models.release(keep)
            live = [g for g in range(env.n_slots) if state[g] is not None]
            if not live:
                continue
            obs = env.observe(live)
            rows = np.zeros(len(live), np.int32)
            actor_map = obs['map'][:, 5].reshape(len(live), -1)
            here = np.where(actor_map.any(1), actor_map.argmax(1), -1)
            groups = defaultdict(list)
            for i, g in enumerate(live):
                s = state[g]
                team = s['info']['team']
                side = s['pair']['h'] if team == 'heroes' else s['pair']['m']
                if side.startswith('native-'):
                    raise RuntimeError(f'a native side surfaced a decision ({side})')
                if s['actor'] is not None and int(obs['actor'][i]) != s['actor']:
                    self.close_turn(s)
                if s['actor'] is None:
                    s.update(actor=int(obs['actor'][i]), tteam=team, trail=[], seen=set())
                cell = int(here[i])
                s['seen'].add(cell)
                if not s['trail'] or s['trail'][-1] != cell:
                    s['trail'].append(cell)
                groups[(team, side)].append(i)
            chunks = [(key, idx[c:c + self.micro_batch]) for key, idx in groups.items()
                      for c in range(0, len(idx), self.micro_batch)]
            for (team, side), idx in chunks:
                sub = select(obs, idx)
                with torch.no_grad():   # row chunks: destination moves make K reach several hundred
                    logits, values = forward_in_chunks(self.models.get(side), sub, self.device, max_rows=self.forward_rows)
                logits = logits.float().cpu().numpy().astype(np.float64)
                legal = np.asarray(sub['cand_mask'], bool)
                logits[~legal] = -np.inf
                kinds = np.asarray(sub['cand_ids'])[..., 0]
                if self.noback:
                    for j, i in enumerate(idx):
                        trail = state[live[i]]['trail']
                        if len(trail) >= 2:
                            back = (kinds[j] == MOVE_KIND) & (np.asarray(sub['cand_cell'])[j] == trail[-2]) & legal[j]
                            if back.any() and (~back & legal[j]).any():
                                logits[j, back] = -np.inf
                if not side.endswith('+search'):
                    rows[idx] = logits.argmax(-1)
                    continue
                if self.lookahead is None:
                    raise RuntimeError(f'{side}: no --search configuration')
                values = values.float().cpu().numpy()
                n_legal = legal.sum(1)
                roots = []
                for j, i in enumerate(idx):
                    s = state[live[i]]
                    opp = s['pair']['m'] if team == 'heroes' else s['pair']['h']
                    root_models = {team: self.models.get(side),
                                   OTHER[team]: None if opp.startswith('native-') else self.models.get(opp)}
                    roots.append(Root(slot=live[i], team=team, logits=logits[j, :n_legal[j]], value=float(values[j]),
                                      round=s['info']['round'], actor=s['info']['actor'], potential=s['info']['potential'],
                                      models=root_models, hidden=root_hidden(sub, j), kinds=kinds[j, :n_legal[j]]))
                for j, res in enumerate(self.lookahead.search(env, roots)):
                    rows[idx[j]] = res.row
                roots = root_models = None
            cost_map = obs['map'][:, 13].reshape(len(live), -1) if obs['map'].shape[1] > 13 else None
            walked = np.zeros(len(live))
            movers = [None] * len(live)
            for i, g in enumerate(live):
                s = state[g]
                kind = int(obs['cand_ids'][i, rows[i], 0])
                mv = s['mv'][s['tteam']]
                mv[3] += 1
                if kind == MOVE_KIND:
                    cell = int(obs['cand_cell'][i, rows[i]])
                    mv[4] += 1
                    mv[2] += int(cell in s['seen'])
                    s['seen'].add(cell)
                    s['trail'].append(cell)
                    cost = int(cost_map[i, cell]) if cost_map is not None and 0 <= cell < cost_map.shape[1] else 0
                    walked[i] = cost if 0 < cost < 255 else 1    # path cost to the destination (channel 13)
                    movers[i] = mv
                if kind == END_TURN_KIND:
                    self.close_turn(s)
            info = env.step(live, rows)
            moved = info.get('moved')          # squares walked in this step, from environments that report it
            for i, g in enumerate(live):
                if movers[i] is not None:
                    movers[i][1] += int(moved[i]) if moved is not None else walked[i]
                state[g]['info'] = info_row(info, i)
            reap()
        return n_games, n_pairs

    @staticmethod
    def close_turn(s):
        if s.get('actor') is not None:
            s['mv'][s['tteam']][0] += 1
        s.update(actor=None, trail=[], seen=set(), tteam=None)

    def controllers(self, pair, k):
        if pair.get('controllers'):
            return pair['controllers'](pair['specs'][k])
        return {'heroes': 'native' if pair['h'].startswith('native-') else 'external',
                'monsters': 'native' if pair['m'].startswith('native-') else 'external'}


def outcome_of(info):
    """Hero-relative (outcome, score), as duel.Trainer.eval_outcome('heroes', info)."""
    relative = float(info.get('score', 0.))
    if info['terminated'] and info.get('task_end') == 'health':
        return ('horizon_win' if relative > 0 else 'horizon_loss' if relative < 0 else 'horizon_draw'), relative
    if info['terminated']:
        winner = info['winner']
        if winner is None:
            return 'draw', 0.
        return ('win', 1.) if winner == 'heroes' else ('loss', -1.)
    return 'truncation', relative


def make_env(args, catalog, n_slots=None):
    kwargs = dict(scores=False, objective='health_score', max_rounds=args.max_rounds, standing_weight=.5,
                  max_steps=4096, threads=args.threads, catalog=catalog)
    n = n_slots or args.slots
    version = getattr(args, 'feature_version', None)
    if args.ember_env == 'fake' or version:
        kwargs['feature_version'] = version or FEATURE_VERSION
    if getattr(args, 'moves', 'step') != 'step':      # destination moves (ember-rs 9abcae2+): as the policies trained
        kwargs['moves'] = args.moves
    if args.ember_env == 'fake':
        from ember_rl.fake_env import FakeBatchEnv
        return FakeBatchEnv(n, **kwargs)
    import ember_rs
    if not hasattr(ember_rs, 'FEATURE_VERSIONS'):   # a wheel before ember-rs 596b2a6 serves ember-gen-v1 only
        kwargs.pop('feature_version', None)
    rule_version = getattr(args, 'rule_version', 17)
    if 'rule_version' in (getattr(ember_rs.BatchEnv, '__text_signature__', None) or ''):
        kwargs['rule_version'] = rule_version
    elif rule_version != 17:
        raise SystemExit(f'--rule-version {rule_version}: this ember_rs wheel has no rule_version parameter')
    return ember_rs.BatchEnv(n_slots=n, content=ember_rs.ContentPool(['content/srd']), **kwargs)


# --------------------------------------------------------------------------- the fit

def fit(cells, ridge=1e-3, ridge_encounter=.05, iterations=60):
    """Bradley-Terry with encounter offsets on aggregated cells (h, m, e, n, wins); native = 0.
    Returns dict(theta, phi, beta: {id: value}, se: {id: se} for heroes and monsters, cov diag, cells info)."""
    heroes = sorted({c[0] for c in cells} - {NATIVE['heroes']})
    monsters = sorted({c[1] for c in cells} - {NATIVE['monsters']})
    encounters = sorted({c[2] for c in cells})
    hi = {h: i for i, h in enumerate(heroes)}
    mi = {m: len(heroes) + i for i, m in enumerate(monsters)}
    ei = {e: len(heroes) + len(monsters) + i for i, e in enumerate(encounters)}
    P = len(heroes) + len(monsters) + len(encounters)
    n_cells = len(cells)
    idx = np.full((n_cells, 3), -1, np.int64)
    coef = np.zeros((n_cells, 3))
    n = np.zeros(n_cells)
    wins = np.zeros(n_cells)
    for r, (h, m, e, count, w) in enumerate(cells):
        if h in hi:
            idx[r, 0], coef[r, 0] = hi[h], 1.
        if m in mi:
            idx[r, 1], coef[r, 1] = mi[m], -1.
        idx[r, 2], coef[r, 2] = ei[e], 1.
        n[r], wins[r] = count, w
    ridge_vec = np.full(P, ridge)
    ridge_vec[len(heroes) + len(monsters):] = ridge_encounter
    w = np.zeros(P)
    valid = idx >= 0

    def linear(w):
        out = np.zeros(n_cells)
        for c in range(3):
            out += np.where(valid[:, c], coef[:, c] * w[np.maximum(idx[:, c], 0)], 0.)
        return out

    def objective(w):
        d = linear(w)
        return float(np.sum(wins * d - n * np.logaddexp(0., d)) - .5 * np.sum(ridge_vec * w * w))

    current = objective(w)
    it = 0
    for it in range(1, iterations + 1):
        d = linear(w)
        p = sigmoid(d)
        resid = wins - n * p
        weight = n * p * (1 - p)
        grad = -ridge_vec * w
        hess = np.diag(ridge_vec).astype(float)
        for a in range(3):
            ok = valid[:, a]
            np.add.at(grad, idx[ok, a], coef[ok, a] * resid[ok])
            for b in range(3):
                both = ok & valid[:, b]
                np.add.at(hess, (idx[both, a], idx[both, b]), coef[both, a] * coef[both, b] * weight[both])
        step = np.linalg.solve(hess, grad)
        scale = 1.
        while scale > 1e-4:
            trial = w + scale * step
            value = objective(trial)
            if value >= current - 1e-9:
                break
            scale /= 2
        w, current = w + scale * step, value
        if np.abs(scale * step).max() < 1e-7:
            break
    cov_diag = np.diag(np.linalg.inv(hess))
    se = np.sqrt(np.maximum(cov_diag, 0.))
    fitted = sigmoid(linear(w))
    out = dict(theta={h: float(w[i]) for h, i in hi.items()}, phi={m: float(w[i]) for m, i in mi.items()},
               beta={e: float(w[i]) for e, i in ei.items()},
               se={**{h: float(se[i]) for h, i in hi.items()}, **{m: float(se[i]) for m, i in mi.items()}},
               iterations=it, loglik=current, fitted=fitted, n=n, wins=wins)
    out['theta'][NATIVE['heroes']] = 0.
    out['phi'][NATIVE['monsters']] = 0.
    out['se'][NATIVE['heroes']] = out['se'][NATIVE['monsters']] = 0.
    return out


def residuals(cells, result):
    """Per (hero, monster) cell: observed and fitted wins, z = (obs - fit) / sqrt(sum p(1-p))."""
    agg = defaultdict(lambda: [0., 0., 0., 0.])     # n, wins, fitted, variance
    for (h, m, *_), n, w, p in zip(cells, result['n'], result['wins'], result['fitted']):
        a = agg[(h, m)]
        a[0] += n
        a[1] += w
        a[2] += n * p
        a[3] += n * p * (1 - p)
    rows = []
    for (h, m), (n, w, f, v) in agg.items():
        z = (w - f) / math.sqrt(v) if v > 0 else 0.
        rows.append(dict(h=h, m=m, n=int(n), observed=round(w / n, 4), fitted=round(f / n, 4), z=round(z, 3)))
    big = [r for r in rows if r['n'] >= 50]
    zs = np.array([r['z'] for r in big]) if big else np.zeros(0)
    return dict(cells=len(rows), cells_n50=len(big), z_sd=round(float(zs.std()), 3) if len(zs) else None,
                z_rms=round(float(np.sqrt((zs ** 2).mean())), 3) if len(zs) else None,
                max_abs_pp=round(100 * max([abs(r['observed'] - r['fitted']) for r in big] or [0.]), 2),
                worst=sorted(big, key=lambda r: -abs(r['z']))[:8],
                note='z_rms near 1: sampling noise, one number per policy explains the matrix; well above 1: '
                     'non-transitive structure (a cycle) or a model misfit')


# --------------------------------------------------------------------------- the round

def spread(pool, k):
    """k entries of pool (sorted by creation time) at evenly spaced positions."""
    if k <= 0 or not pool:
        return []
    pool = sorted(pool, key=lambda e: (e['created'], e['id']))
    if len(pool) <= k:
        return pool
    picks = sorted({int(round(x)) for x in np.linspace(0, len(pool) - 1, k)})
    return [pool[i] for i in picks]


def stratified_order(specs):
    """Spec indices round-robin over the strata (sorted by name), so any prefix is spread over every stratum
    (the spec sets are stored stratum by stratum)."""
    by = defaultdict(list)
    for k, spec in enumerate(specs):
        by[str(spec.get('stratum'))].append(k)
    names = sorted(by)
    out = []
    for i in range(max((len(v) for v in by.values()), default=0)):
        out.extend(by[n][i] for n in names if i < len(by[n]))
    return out


def opponents_for(reg, entrant, rated, k):
    """Native plus k spread-out snapshots of the other side: the newest rated one of every run, then panel
    anchors evenly over time, then other rated snapshots evenly over time."""
    side = OTHER[entrant['team']]
    pool = [reg.entities[e] for e in rated if reg.entities[e]['team'] == side and reg.entities[e]['kind'] != 'native'
            and reg.entities[e]['status'] == 'ok']
    newest = {}
    for e in pool:
        if e['run'] not in newest or (e['created'], e['id']) > (newest[e['run']]['created'], newest[e['run']]['id']):
            newest[e['run']] = e
    chosen = sorted(newest.values(), key=lambda e: e['id'])[:k]
    ids = {e['id'] for e in chosen}
    anchors = [e for e in pool if e['id'] in reg.panel_members and e['id'] not in ids]
    chosen += spread(anchors, k - len(chosen))
    ids = {e['id'] for e in chosen}
    chosen += spread([e for e in pool if e['id'] not in ids], k - len(chosen))
    return [NATIVE[side]] + [e['id'] for e in chosen]


def newest_rated(reg, state):
    """Per run and team, the newest entity that has entered the ladder."""
    out = {}
    for eid in state.get('entered', {}):
        e = reg.entities.get(eid)
        if not e or e['status'] != 'ok':
            continue
        key = (e['run'], e['team'])
        if key not in out or (e['created'], eid) > (reg.entities[out[key]]['created'], out[key]):
            out[key] = eid
    return out


def cmd_round(args):
    started = time.time()
    root = Path(args.root)
    (root / 'ladder').mkdir(parents=True, exist_ok=True)
    import fcntl
    lock = open(root / 'ladder' / '.round.lock', 'w')
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        raise SystemExit('another ladder round is running')
    cfg = (read_json(root / 'ops.json', {}) or {}).get('ladder', {})
    anchor_hours = args.anchor_hours or cfg.get('anchor_hours') or [12, 24, 48, 96, 168, 336, 720, 1440]
    reg = Registry(root, include_smoke=args.include_smoke, snapshots=getattr(args, 'snapshot_runs', False))
    new = reg.discover()
    state = read_json(reg.dir / 'state.json', {}) or {}
    state.setdefault('entered', {})
    manifest, specs, catalog = load_specset(root, args.set)
    if manifest.get('sealed'):
        raise SystemExit(f'{args.set} is sealed: only `ladder.py sealed --milestone NAME` plays it')
    round_id = stamp(started)
    added = reg.update_panel(anchor_hours)
    # 1. entrants: the newest archive entry per run and team that has not entered yet
    entrants = []
    latest = {}
    for e in reg.entities.values():
        if e['kind'] != 'archive' or e['status'] != 'ok':
            continue
        key = (e['run'], e['team'])
        if key not in latest or (e['created'], e['id']) > (latest[key]['created'], latest[key]['id']):
            latest[key] = e
    entrants = [e['id'] for e in latest.values() if e['id'] not in state['entered']]
    entrants += [a for a in added if a not in state['entered'] and a not in entrants]
    rated = set(state['entered']) | set(entrants)
    for eid in entrants:
        state['entered'][eid] = dict(round=round_id, opponents=opponents_for(reg, reg.entities[eid], rated, args.opponents))
    reg.save()
    write_json(reg.dir / 'state.json', state)
    # 2. pairs to play: every entered entity against its opponents, missing specs only. Each pair plays the first
    # --pair-specs specs of the stratified order; pairs go by opponent rank (every entrant's native pair first,
    # then its first snapshot opponent, ...), newest entrant first within a rank.
    db = open_db(reg.dir / 'games.sqlite')
    nominations = []
    order = sorted(state['entered'], key=lambda e: -reg.entities[e]['created'])
    for eid in order:
        if reg.entities[eid]['status'] != 'ok':
            continue
        team = reg.entities[eid]['team']
        for rank, opp in enumerate(state['entered'][eid]['opponents']):
            if reg.entities.get(opp, {}).get('status', 'ok') != 'ok':
                continue
            matchup = (eid, opp) if team == 'heroes' else (opp, eid)
            nominations.append((rank, matchup))
    # Both entrants can nominate the same matchup. Keep its highest-priority nomination.
    nominations.sort(key=lambda item: item[0])
    matchups = dict.fromkeys(matchup for _, matchup in nominations)
    pair_ks = stratified_order(specs)[:max(1, args.pair_specs)]
    # --native-specs: a policy's games against the native AI (the headline cells) may use more specs than
    # the policy-against-policy pairs; they are the cheapest games, half of them without a network.
    native_specs = getattr(args, 'native_specs', None)
    native_ks = pair_ks if native_specs is None else stratified_order(specs)[:max(1, native_specs)]
    pairs = []
    if getattr(args, 'native_pair', False):         # native against native on every spec: the measured zero
        done = played_ks(db, args.set, NATIVE['heroes'], NATIVE['monsters'])
        missing = [k for k in range(len(specs)) if k not in done]
        if missing:
            pairs.append(dict(h=NATIVE['heroes'], m=NATIVE['monsters'], ks=missing, specs=specs, set=args.set, mode='full'))
    for h, m in matchups:
        done = played_ks(db, args.set, h, m)
        ks = native_ks if h == NATIVE['heroes'] or m == NATIVE['monsters'] else pair_ks
        missing = [k for k in ks if k not in done]
        if missing:
            pairs.append(dict(h=h, m=m, ks=missing, specs=specs, set=args.set, mode='full'))
    pairs = pairs[:args.max_pairs]
    env = make_env(args, catalog)
    import torch
    device = torch.device(args.device)
    models = Models(reg, device, env.feature_version)
    rows_buffer = []

    def on_game(pair, k, outcome, score, rounds, mv):
        spec = pair['specs'][k]
        rows_buffer.append((pair['set'], pair['h'], pair['m'], k, pair['mode'], spec['encounter'], spec.get('stratum'),
                            outcome, round(score, 5), rounds, json.dumps(mv['heroes']), json.dumps(mv['monsters']),
                            round_id, time.time()))
        if len(rows_buffer) >= 512:
            flush()

    def flush():
        db.executemany('INSERT OR REPLACE INTO games VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', rows_buffer)
        db.commit()
        rows_buffer.clear()

    player = Player(env, models, device, threads=args.threads, micro_batch=args.micro_batch,
                    forward_rows=args.forward_rows, max_models=args.max_models)
    budget = args.minutes * 60
    games, n_pairs = player.play(pairs, on_game, budget_s=budget, started=started)
    flush()
    models.release([])
    report = dict(time=utc(started), stamp=round_id, set=args.set, panel_version=reg.panel_version,
                  panel_added=added, new_entities=len(new), entrants=entrants, games_played=games,
                  pairs_started=n_pairs, pairs_queued=len(pairs), budget_minutes=args.minutes,
                  main_seconds=round(time.time() - started, 1))
    # 3. daily extras
    daily = read_json(reg.dir / 'daily.json', {}) or {}
    due = args.daily == 'yes' or (args.daily == 'auto' and time.time() - daily.get('time_unix', 0) > DAILY_EVERY_S)
    if due:
        try:
            daily = run_daily(args, reg, state, db, round_id, models_device=device)
        except Exception as exc:
            import traceback
            traceback.print_exc()
            daily = dict(daily, error=repr(exc)[:500], failed=utc())
        write_json(reg.dir / 'daily.json', daily)
    # 4. fit and report
    report.update(analyse(args, reg, state, db, specs))
    report['daily'] = daily
    report['seconds'] = round(time.time() - started, 1)
    write_json(reg.dir / f'{round_id}.json', report)
    write_json(reg.dir / 'latest.json', report)
    text = summary_text(report)
    (reg.dir / f'{round_id}.txt').write_text(text)
    print(text)
    write_best_league(reg, report)


def run_daily(args, reg, state, db, round_id, models_device):
    """Diag set vs native, test-time search headroom on dev, and the unseen-kind probe."""
    started = time.time()
    newest = newest_rated(reg, state)
    out = dict(time=utc(started), time_unix=started, round=round_id, newest={f'{r}/{t}': e for (r, t), e in newest.items()})
    parts = [(args.set, 'search'), (args.probe_set, 'probe'), (args.diag_set, 'diag')]
    parts = [(n, k) for n, k in parts if n and (Path(args.root) / 'ladder' / 'specsets' / f'{n}.json').exists()]
    for kind in {'search', 'probe', 'diag'} - {k for _, k in parts}:
        out[kind] = dict(skipped='no spec set')
    # search has its own budget (every decision searched is costly); probe and diag share the daily budget
    share = args.daily_minutes * 60 / max(1, len([k for _, k in parts if k != 'search']))
    for set_name, kind in parts:
        budget = args.search_minutes * 60 if kind == 'search' else share
        try:
            out[kind] = daily_part(args, reg, db, round_id, models_device, newest, set_name, kind, budget)
        except Exception as exc:          # a failed extra must not cost the round its report
            import traceback
            traceback.print_exc()
            out[kind] = dict(error=repr(exc)[:500])
        finally:
            try:
                import torch
                torch.cuda.empty_cache()
            except Exception:
                pass
    out['seconds'] = round(time.time() - started, 1)
    return out


def daily_part(args, reg, db, round_id, models_device, newest, set_name, kind, budget):
    """One daily extra (search headroom, probe or diag) for the newest snapshot of every run and team."""
    started = time.time()
    manifest, specs, catalog = load_specset(args.root, set_name)
    if manifest.get('sealed'):
        return dict(skipped='sealed set')
    n = min(len(specs), args.search_specs) if kind == 'search' else len(specs)
    ks = stratified_order(specs)[:n]           # a stratified subset for the search headroom
    pairs = []
    catalog_rows = {r['id']: r for r in load_jsonl(catalog)}
    probe_kinds = set(args.probe_kinds or [])
    for (run, team), eid in sorted(newest.items()):
        native = NATIVE[OTHER[team]]
        side = f'{eid}+search' if kind == 'search' else eid
        h, m = (side, native) if team == 'heroes' else (native, side)
        modes = ['full']
        if kind == 'probe' and team == 'monsters' and probe_kinds:
            modes.append('kind-native')
        for mode in modes:
            done = played_ks(db, set_name, h, m, mode)
            missing = [k for k in ks if k not in done]
            if not missing:
                continue
            ctrl = None
            if mode == 'kind-native':
                def ctrl(spec, rows=catalog_rows):
                    units = encounter_units(rows[spec['encounter']]) or []
                    keep = [i for i, u in enumerate(units) if u['team'] == 'monsters' and u['content'] not in probe_kinds]
                    return dict(heroes='native', monsters='native', external_units=keep) if keep else \
                        dict(heroes='native', monsters='native')
            pairs.append(dict(h=h, m=m, ks=missing, specs=specs, set=set_name, mode=mode, controllers=ctrl))
    if kind == 'search' and not args.search:
        return dict(skipped='no --search configuration')
    if pairs:
        env = make_env(args, catalog, n_slots=args.search_slots if kind == 'search' else None)
        models = Models(reg, models_device, env.feature_version)
        player = Player(env, models, models_device, search=args.search if kind == 'search' else None,
                        threads=args.threads, micro_batch=args.micro_batch, forward_rows=args.forward_rows,
                        max_models=args.max_models)
        rows = []

        def on_game(pair, k, outcome, score, rounds, mv, rows=rows):
            spec = pair['specs'][k]
            rows.append((pair['set'], pair['h'], pair['m'], k, pair['mode'], spec['encounter'], spec.get('stratum'),
                         outcome, round(score, 5), rounds, json.dumps(mv['heroes']), json.dumps(mv['monsters']),
                         round_id, time.time()))
        player.play(pairs, on_game, budget_s=budget, started=started)
        db.executemany('INSERT OR REPLACE INTO games VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', rows)
        db.commit()
        models.release([])
    return daily_summary(kind, set_name, newest, specs, db, args, reg)


def team_win(outcome, team):
    return outcome == ('win' if team == 'heroes' else 'loss')


def side_rows(db, set_name, eid, team, mode='full', opponent=None):
    col, other = ('h', 'm') if team == 'heroes' else ('m', 'h')
    q = f'SELECT k, {other}, outcome, score, stratum, hmv, mmv FROM games WHERE set_name=? AND mode=? AND {col}=?'
    params = [set_name, mode, eid]
    if opponent is not None:
        q += f' AND {other}=?'
        params.append(opponent)
    return db.execute(q, params).fetchall()


def strata_table(rows, specs, team, key='stratum'):
    """Results of `team` by spec field `key`: n, win rate, excess over the native baseline, horizon and
    truncation shares, mean team-relative score."""
    table = defaultdict(lambda: dict(n=0, wins=0, base=0., based=0, horizon=0, truncation=0, score=0.))
    sign = 1. if team == 'heroes' else -1.
    for k, _, outcome, score, _, _, _ in rows:
        spec = specs[k]
        for label in ('all', str(spec.get(key))):
            t = table[label]
            t['n'] += 1
            t['wins'] += team_win(outcome, team)
            b = spec.get('b_heroes' if team == 'heroes' else 'b_monsters')
            if b is not None:
                t['base'] += b
                t['based'] += 1
            t['horizon'] += outcome.startswith('horizon')
            t['truncation'] += outcome == 'truncation'
            t['score'] += sign * score
    out = {}
    for label, t in table.items():
        n = t['n']
        out[label] = dict(n=n, win=round(t['wins'] / n, 4),
                          excess=round(t['wins'] / n - t['base'] / t['based'], 4) if t['based'] == n else None,
                          horizon=round(t['horizon'] / n, 4), truncation=round(t['truncation'] / n, 4),
                          score=round(t['score'] / n, 4))
    return out


def movement(rows, team):
    """Per turn of the side's policy: squares walked, move decisions, revisited destinations, decisions."""
    tot = np.zeros(5)
    for *_, hmv, mmv in rows:
        values = json.loads(hmv if team == 'heroes' else mmv)
        if len(values) == 4:                       # rows written before move decisions were counted apart
            values = values + [values[1]]
        tot += np.array(values, float)
    turns = max(tot[0], 1.)
    return dict(turns=int(tot[0]), squares_per_turn=round(tot[1] / turns, 3), moves_per_turn=round(tot[4] / turns, 3),
                revisits_per_turn=round(tot[2] / turns, 3), decisions_per_turn=round(tot[3] / turns, 3))


def share_bin(spec, kinds):
    roster = spec.get('kinds') or {}
    total = sum(roster.values())
    if not total:
        return '?'
    share = sum(v for c, v in roster.items() if c in kinds) / total
    # 'only', not 'all': strata_table keeps its total under 'all', and a bin of that name was added into it
    # (the probe's "all" row counted the all-probe-kind rosters twice: 638 games on 512 specs).
    return 'none' if share == 0 else 'only' if share == 1 else 'under-half' if share < .5 else 'half-or-more'


def trains_on(run_dir, kinds):
    """Whether a run's training catalog (<run>/catalog.jsonl, train split) has any of these creature kinds."""
    path = Path(run_dir or '') / 'catalog.jsonl'
    if not kinds or not path.exists():
        return None
    for row in load_jsonl(path):
        if row.get('split', 'train') == 'train' and set(kinds_of(row)) & set(kinds):
            return True
    return False


def daily_summary(kind, set_name, newest, specs, db, args, reg=None):
    out = dict(set=set_name)
    for (run, team), eid in sorted(newest.items()):
        key = f'{run}/{team}'
        if kind == 'diag':
            rows = side_rows(db, set_name, eid, team, opponent=NATIVE[OTHER[team]])
            out[key] = dict(entity=eid, by_stratum=strata_table(rows, specs, team),
                            by_slice=strata_table(rows, specs, team, 'slice'), movement=movement(rows, team))
        elif kind == 'search':
            greedy = {r[0]: r for r in side_rows(db, args.set, eid, team, opponent=NATIVE[OTHER[team]])}
            searched = {r[0]: r for r in side_rows(db, set_name, f'{eid}+search', team, opponent=NATIVE[OTHER[team]])}
            common = sorted(set(greedy) & set(searched))
            if not common:
                continue
            d = np.array([team_win(searched[k][2], team) - team_win(greedy[k][2], team) for k in common], float)
            out[key] = dict(entity=eid, n=len(common), greedy=round(float(np.mean([team_win(greedy[k][2], team) for k in common])), 4),
                            search=round(float(np.mean([team_win(searched[k][2], team) for k in common])), 4),
                            headroom=round(float(d.mean()), 4),
                            ci95=round(float(Z95 * d.std(ddof=1) / math.sqrt(len(d))), 4) if len(d) > 1 else None,
                            movement_search=movement([searched[k] for k in common], team))
        elif kind == 'probe':
            kinds = set(args.probe_kinds or [])
            run_dir = (reg.entities.get(eid, {}) if reg else {}).get('run_dir')
            seen = trains_on(run_dir, kinds)
            entry = dict(entity=eid, kinds=sorted(kinds), trained_on_kinds=seen,
                         note=('these kinds are in this run\'s training catalog' if seen else
                               'unseen kinds: no training row of this run has them') if seen is not None else None)
            for mode in (('full', 'kind-native') if team == 'monsters' else ('full',)):
                rows = side_rows(db, set_name, eid, team, mode=mode, opponent=NATIVE[OTHER[team]])
                if not rows:
                    continue
                for spec in specs:
                    spec['_share'] = share_bin(spec, kinds)
                entry[mode] = strata_table(rows, specs, team, '_share')
            out[key] = entry
    return out


def analyse(args, reg, state, db, specs):
    rows = db.execute("SELECT h, m, encounter, COUNT(*), SUM(outcome = 'win') FROM games "
                      "WHERE set_name=? AND mode='full' GROUP BY h, m, encounter", (args.set,)).fetchall()
    usable = {e for e, v in reg.entities.items() if v['status'] == 'ok'} | {f'{e}+search' for e in reg.entities}
    cells = [r for r in rows if r[0] in usable and r[1] in usable]
    out = dict(fit=None)
    if not cells:
        return out
    result = fit(cells)
    games = Counter()
    for h, m, _, n, _ in cells:
        games[h] += n
        games[m] += n
    ratings = {t: {} for t in TEAMS}
    for team, table in (('heroes', result['theta']), ('monsters', result['phi'])):
        for eid, value in table.items():
            se = result['se'].get(eid, 0.)
            base = eid[:-7] if eid.endswith('+search') else eid
            e = reg.entities.get(base, {})
            ratings[team][eid] = dict(rating=round(value, 4), se=round(se, 4), lo=round(value - Z95 * se, 4),
                                      hi=round(value + Z95 * se, 4), vs_native_50=round(float(sigmoid(value)), 4),
                                      games=int(games[eid]), run=e.get('run'), arm=e.get('arm'), phase=e.get('phase'),
                                      created=e.get('created'), age_h=round(e.get('elapsed', 0.) / 3600, 2),
                                      anchor=e.get('anchor'), search=eid.endswith('+search'))
    beta = np.array(list(result['beta'].values()))
    out['fit'] = dict(games=int(sum(c[3] for c in cells)), cells=len(cells), encounters=len(beta),
                      iterations=result['iterations'], beta_mean=round(float(beta.mean()), 3),
                      beta_sd=round(float(beta.std()), 3),
                      note='rating in logits; native = 0 on both sides; vs_native_50 = win rate against the native AI '
                           'on an encounter where native beats native half the time')
    out['ratings'] = ratings
    out['residuals'] = residuals(cells, result)
    pair = native_pair(db, args.set, specs, result)
    if pair is not None:
        out['native_pair'] = pair
    # headline: each run's newest snapshot per team, greedy and with search
    newest = newest_rated(reg, state)
    headline = defaultdict(dict)
    for (run, team), eid in sorted(newest.items()):
        r = ratings[team].get(eid)
        headline[run][team] = dict(entity=eid, greedy=r, search=ratings[team].get(f'{eid}+search'))
        if pair is not None:        # the model-free number: against the native AI's own result on the same specs
            headline[run][team]['vs_native_pair'] = vs_native_pair(db, args.set, eid, team)
    out['headline'] = dict(headline)
    # best-league: highest lower bound per run and team (enough games)
    best = defaultdict(dict)
    for team in TEAMS:
        for eid, r in ratings[team].items():
            if r['search'] or r['run'] is None or r['games'] < args.min_games:
                continue
            if team not in best[r['run']] or r['lo'] > best[r['run']][team]['lo']:
                best[r['run']][team] = dict(entity=eid, **r)
    out['best_league'] = dict(best)
    # payoff matrix: native, anchors, each run's newest and best-league snapshots
    show = {t: [NATIVE[t]] for t in TEAMS}
    for team in TEAMS:
        extra = [m for m in reg.panel_members if reg.entities.get(m, {}).get('team') == team and m != NATIVE[team]]
        extra += [eid for (run, t), eid in sorted(newest.items()) if t == team]
        extra += [b[team]['entity'] for b in best.values() if team in b]
        for eid in extra:
            if eid not in show[team] and eid in ratings[team]:
                show[team].append(eid)
        show[team] = show[team][:args.matrix_size]
    agg = defaultdict(Counter)
    for h, m, outcome, score, n in db.execute(
            "SELECT h, m, outcome, SUM(score), COUNT(*) FROM games WHERE set_name=? AND mode='full' GROUP BY h, m, outcome",
            (args.set,)):
        if h in show['heroes'] and m in show['monsters']:
            agg[(h, m)][outcome] += n
            agg[(h, m)]['_score'] += score
    payoff = {}
    for (h, m), c in agg.items():
        n = sum(v for k, v in c.items() if not k.startswith('_'))
        payoff[f'{h}|{m}'] = dict(n=n, hero_win=round(c['win'] / n, 4), monster_win=round(c['loss'] / n, 4),
                                  horizon=round(sum(c[k] for k in OUTCOMES if k.startswith('horizon')) / n, 4),
                                  truncation=round(c['truncation'] / n, 4), hero_score=round(c['_score'] / n, 4),
                                  fitted=round(float(sigmoid(ratings['heroes'][h]['rating'] - ratings['monsters'][m]['rating']
                                                             + float(beta.mean()))), 4))
    out['payoff'] = dict(heroes=show['heroes'], monsters=show['monsters'], cells=payoff,
                         note='fitted: at the mean encounter offset; the residuals block has the exact fitted values')
    # strata and movement of the headline snapshots against native
    strata, moves = {}, {}
    for (run, team), eid in sorted(newest.items()):
        rows_ = side_rows(db, args.set, eid, team, opponent=NATIVE[OTHER[team]])
        if rows_:
            strata[eid] = dict(by_stratum=strata_table(rows_, specs, team), by_party=strata_table(rows_, specs, team, 'party'))
            moves[eid] = movement(rows_, team)
    out['strata_vs_native'] = strata
    out['movement'] = moves
    out['plateau'] = plateau(reg, ratings)
    return out


def native_pair(db, set_name, specs, result):
    """Native heroes against native monsters on the set (--native-pair): games, hero and monster native-win
    rates, the catalog's recorded hero baseline on the same specs, and the fit's mean prediction for these
    games, sigmoid(beta_e): the zero of the rating scale as measured. None when the pair has not played."""
    rows = db.execute("SELECT k, encounter, outcome FROM games WHERE set_name=? AND mode='full' AND h=? AND m=?",
                      (set_name, NATIVE['heroes'], NATIVE['monsters'])).fetchall()
    if not rows:
        return None
    n = len(rows)
    counts = Counter(outcome for _, _, outcome in rows)
    based = [specs[k].get('b_heroes') for k, _, _ in rows if k < len(specs)]
    based = [b for b in based if b is not None]
    fitted = [float(sigmoid(result['beta'][e])) for _, e, _ in rows if e in result['beta']]
    hero = counts['win'] / n
    return dict(n=n, hero_win=round(hero, 4), monster_win=round(counts['loss'] / n, 4),
                other=round(1 - (counts['win'] + counts['loss']) / n, 4),
                hero_win_se=round(math.sqrt(max(hero * (1 - hero), 0.) / n), 4),
                catalog_hero_baseline=round(float(np.mean(based)), 4) if based else None,
                fitted_hero_win=round(float(np.mean(fitted)), 4) if fitted else None,
                note='native = 0 on both sides by definition; these games estimate the encounter offsets directly')


def vs_native_pair(db, set_name, eid, team):
    """A policy against the native AI next to the native AI against itself, on the same specs (--native-pair):
    the paired difference in the team's native-win rate (policy minus native AI of its team) with its standard
    error and 95% interval. No model: where the fitted rating says how one number per policy explains every
    cell, this says how much better than the native AI the policy plays against the native AI. None when the
    policy and the native pair share no spec."""
    col, other = ('h', 'm') if team == 'heroes' else ('m', 'h')
    rows = db.execute(
        f"SELECT g.outcome, n.outcome FROM games g JOIN games n ON n.set_name = g.set_name AND n.mode = g.mode "
        f"AND n.k = g.k AND n.h = ? AND n.m = ? WHERE g.set_name = ? AND g.mode = 'full' AND g.{col} = ? AND g.{other} = ?",
        (NATIVE['heroes'], NATIVE['monsters'], set_name, eid, NATIVE[OTHER[team]])).fetchall()
    if not rows:
        return None
    d = np.array([team_win(mine, team) - team_win(native, team) for mine, native in rows], float)
    n = len(d)
    se = float(d.std(ddof=1) / math.sqrt(n)) if n > 1 else None
    return dict(n=n, win=round(float(np.mean([team_win(mine, team) for mine, _ in rows])), 4),
                native_win=round(float(np.mean([team_win(native, team) for _, native in rows])), 4),
                diff=round(float(d.mean()), 4), se=None if se is None else round(se, 4),
                lo=None if se is None else round(float(d.mean()) - Z95 * se, 4),
                hi=None if se is None else round(float(d.mean()) + Z95 * se, 4))


def plateau(reg, ratings, now=None):
    """Per run and team: the mean rating of its rated snapshots created in the last 24 h against the 24 h
    before; flat when the difference is not above its 95% interval."""
    now = now or time.time()
    out = defaultdict(dict)
    for team in TEAMS:
        by_run = defaultdict(lambda: ([], []))
        for eid, r in ratings[team].items():
            if r['search'] or r['run'] is None or r['created'] is None:
                continue
            age = now - r['created']
            if age < 86400:
                by_run[r['run']][0].append(r)
            elif age < 2 * 86400:
                by_run[r['run']][1].append(r)
        for run, (last, prev) in by_run.items():
            entry = dict(last24=len(last), prev24=len(prev))
            if last and prev:
                m1, m0 = np.mean([r['rating'] for r in last]), np.mean([r['rating'] for r in prev])
                se = math.sqrt(sum(r['se'] ** 2 for r in last) / len(last) ** 2 + sum(r['se'] ** 2 for r in prev) / len(prev) ** 2)
                entry.update(mean_last24=round(float(m1), 4), mean_prev24=round(float(m0), 4),
                             diff=round(float(m1 - m0), 4), ci95=round(Z95 * se, 4), flat=bool(m1 - m0 <= Z95 * se))
            else:
                entry.update(flat=None, note='needs snapshots in both windows')
            out[run][team] = entry
    return dict(out)


def write_best_league(reg, report):
    """<run>/best-league-<team>.pt (atomic copy) and .json, when the pick changed."""
    for run, teams in (report.get('best_league') or {}).items():
        run_dir = next((Path(e['run_dir']) for e in reg.entities.values() if e.get('run') == run and e.get('run_dir')), None)
        if run_dir is None or not run_dir.exists():
            continue
        for team, pick in teams.items():
            meta_path = run_dir / f'best-league-{team}.json'
            meta = read_json(meta_path, {}) or {}
            e = reg.entities[pick['entity']]
            if meta.get('source_entity') == pick['entity'] and (run_dir / f'best-league-{team}.pt').exists():
                meta.update(rating=pick['rating'], lo=pick['lo'], se=pick['se'], ladder=report['stamp'])
                write_json(meta_path, meta)
                continue
            target = run_dir / f'best-league-{team}.pt'
            tmp = run_dir / f'.best-league-{team}.pt.tmp'
            shutil.copy2(e['path'], tmp)
            os.replace(tmp, target)
            write_json(meta_path, dict(source_entity=pick['entity'], source_path=e['path'], sha256=sha256(target),
                                       rating=pick['rating'], lo=pick['lo'], se=pick['se'], games=pick['games'],
                                       ladder=report['stamp'], set=report['set'], rule='highest lower 95% bound',
                                       elo=round(pick['rating'] * 400 / math.log(10), 1)))


def label(eid):
    """Short name of an entity for tables: native, or <run>:p<phase> with the run's aN prefix (a0-base -> a0:p12),
    +s with search."""
    if eid.startswith('native-'):
        return 'native'
    search = eid.endswith('+search')
    base = eid[:-7] if search else eid
    run, _, rest = base.partition('/')
    parts = rest.split('-')
    head = run.split('-')[0]
    run = head if len(head) >= 2 and head[0] == 'a' and head[1:].isdigit() else run
    short = f'{run}:p{parts[1]}' if len(parts) >= 2 and parts[0] == 'phase' else base
    if len(parts) >= 2 and parts[0] == 'snap' and len(parts[1]) >= 11:      # snap-20261125T010203Z -> s1125T01
        short = f'{run}:s{parts[1][4:8]}T{parts[1][9:11]}'
    return short + ('+s' if search else '')


def summary_text(report):
    lines = [f'ladder {report["stamp"]} set {report["set"]}: panel v{report["panel_version"]}'
             f' (+{len(report.get("panel_added") or [])}), {len(report["entrants"])} entrants, '
             f'{report["games_played"]} games in {report.get("main_seconds", report.get("seconds"))} s '
             f'(round {report.get("seconds")} s with the daily part; {report["pairs_started"]} of '
             f'{report["pairs_queued"]} queued pairs started)']
    fitd = report.get('fit')
    if not fitd:
        return '\n'.join(lines + ['no games yet']) + '\n'
    lines.append(f'fit: {fitd["games"]} games, {fitd["cells"]} cells, {fitd["encounters"]} encounters, '
                 f'beta sd {fitd["beta_sd"]}; residual z rms {report["residuals"]["z_rms"]} over '
                 f'{report["residuals"]["cells_n50"]} cells (1 = noise)')
    pair = report.get('native_pair')
    if pair:
        lines.append(f'native against native: heroes win {100 * pair["hero_win"]:.1f}% ± {100 * Z95 * pair["hero_win_se"]:.1f}, '
                     f'monsters {100 * pair["monster_win"]:.1f}% of {pair["n"]} games (catalog baseline '
                     + ('n/a' if pair['catalog_hero_baseline'] is None else f'{100 * pair["catalog_hero_baseline"]:.1f}%')
                     + '): the measured zero of the ratings')
    lines.append('headline (newest snapshot per run; rating in logits, native = 0; [95% interval]):')
    for run, teams in sorted(report['headline'].items()):
        for team, h in sorted(teams.items()):
            g, s = h['greedy'], h['search']
            text = f'  {run:14} {team:8} {h["entity"]:34}'
            if g:
                text += f' {g["rating"]:+.3f} [{g["lo"]:+.3f}, {g["hi"]:+.3f}] ({100 * g["vs_native_50"]:.1f}% vs native)'
            if s:
                text += f'  search {s["rating"]:+.3f} [{s["lo"]:+.3f}, {s["hi"]:+.3f}]'
            v = h.get('vs_native_pair')
            if v and v['se'] is not None:   # points of win rate over the native AI of its team, same specs
                text += f'  vs native pair {100 * v["diff"]:+.1f} [{100 * v["lo"]:+.1f}, {100 * v["hi"]:+.1f}] pts (n {v["n"]})'
            lines.append(text)
    lines.append('best-league (highest lower bound):')
    for run, teams in sorted(report['best_league'].items()):
        for team, b in sorted(teams.items()):
            lines.append(f'  {run:14} {team:8} {b["entity"]:34} {b["rating"]:+.3f} (lo {b["lo"]:+.3f}, {b["games"]} games)')
    lines.append('plateau (mean rating, last 24 h vs the 24 h before):')
    for run, teams in sorted(report['plateau'].items()):
        for team, p in sorted(teams.items()):
            if p.get('diff') is None:
                lines.append(f'  {run:14} {team:8} n/a ({p["last24"]} / {p["prev24"]} snapshots)')
            else:
                lines.append(f'  {run:14} {team:8} {p["diff"]:+.3f} ± {p["ci95"]:.3f} -> {"FLAT" if p["flat"] else "rising"}')
    pay = report['payoff']
    lines.append('payoff (hero native-win rate; rows heroes, columns monsters; n; a0:p8 = run a0-..., phase 8):')
    width = 12
    lines.append(' ' * 16 + ''.join(f'{label(m):>{width + 2}}' for m in pay['monsters']))
    for h in pay['heroes']:
        row = f'  {label(h):14}'
        for m in pay['monsters']:
            c = pay['cells'].get(f'{h}|{m}')
            row += f'{"-":>{width + 2}}' if not c else f'{c["hero_win"]:>{width - 5}.3f}({c["n"]:4d})'
        lines.append(row)
    worst = report['residuals']['worst'][:3]
    if worst:
        lines.append('largest residuals: ' + '; '.join(f'{w["h"]} vs {w["m"]} obs {w["observed"]:.3f} fit {w["fitted"]:.3f} '
                                                       f'z {w["z"]:+.1f}' for w in worst))
    return '\n'.join(lines) + '\n'


# --------------------------------------------------------------------------- sealed, record, show

def cmd_sealed(args):
    """Every given (or each run's best-league and newest) snapshot against native on the sealed set.
    Only at milestones the maintainer asks for; logged in ladder/sealed/LOG."""
    root = Path(args.root)
    manifest, specs, catalog = load_specset(root, args.set)
    if not manifest.get('sealed'):
        raise SystemExit(f'{args.set} is not a sealed set')
    reg = Registry(root, include_smoke=args.include_smoke, snapshots=getattr(args, 'snapshot_runs', False))
    reg.discover()
    state = read_json(reg.dir / 'state.json', {}) or {}
    picks = args.entities or sorted(set(newest_rated(reg, state).values()) | {
        (read_json(Path(e['run_dir']) / f'best-league-{e["team"]}.json', {}) or {}).get('source_entity')
        for e in reg.entities.values() if e.get('run_dir')} - {None})
    out_dir = reg.dir / 'sealed' / args.milestone
    out_dir.mkdir(parents=True, exist_ok=True)
    with open(reg.dir / 'sealed' / 'LOG', 'a') as stream:
        stream.write(f'{utc()} milestone {args.milestone}: {len(picks)} policies on {args.set} ({len(specs)} specs)\n')
    env = make_env(args, catalog)
    import torch
    device = torch.device(args.device)
    models = Models(reg, device, env.feature_version)
    db = open_db(out_dir / 'games.sqlite')
    pairs = []
    for eid in picks:
        team = reg.entities[eid]['team']
        h, m = (eid, NATIVE['monsters']) if team == 'heroes' else (NATIVE['heroes'], eid)
        pairs.append(dict(h=h, m=m, ks=list(range(len(specs))), specs=specs, set=args.set, mode='full'))
    rows = []
    Player(env, models, device, threads=args.threads, micro_batch=args.micro_batch, forward_rows=args.forward_rows,
           max_models=args.max_models).play(
        pairs, lambda p, k, o, s, r, mv: rows.append((p['set'], p['h'], p['m'], k, p['mode'], p['specs'][k]['encounter'],
                                                      p['specs'][k].get('stratum'), o, s, r, json.dumps(mv['heroes']),
                                                      json.dumps(mv['monsters']), args.milestone, time.time())))
    models.release([])
    db.executemany('INSERT OR REPLACE INTO games VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', rows)
    db.commit()
    result = {}
    for eid in picks:
        team = reg.entities[eid]['team']
        r = side_rows(db, args.set, eid, team)
        result[eid] = dict(team=team, by_stratum=strata_table(r, specs, team), by_slice=strata_table(r, specs, team, 'slice'),
                           movement=movement(r, team))
    write_json(out_dir / 'result.json', dict(milestone=args.milestone, time=utc(), set=args.set, results=result))
    print(json.dumps(result, indent=1))


def cmd_record(args):
    """Plays --n games of the given sides on a spec set (or catalog rows) and records every tape
    (OUT/tapes/<encounter>__<k>.jsonl) plus OUT/games.jsonl, for replay_n20.py and fight videos."""
    root = Path(args.root)
    manifest, specs, catalog = load_specset(root, args.set)
    pool = [s for s in specs if not args.ids or s['encounter'] in set(args.ids.split(','))]
    rng = random.Random(args.seed)
    ks = sorted(rng.sample(range(len(pool)), min(args.n, len(pool))))
    chosen = [pool[k] for k in ks]
    out = Path(args.out)
    (out / 'tapes').mkdir(parents=True, exist_ok=True)
    env = make_env(args, catalog, n_slots=min(args.slots, max(1, len(chosen))))
    import torch
    device = torch.device(args.device)
    paths = {}
    sides = {}
    for team in TEAMS:
        value = getattr(args, team)
        if value == 'native':
            sides[team] = NATIVE[team]
        else:
            sides[team] = f'file:{team}'
            paths[sides[team]] = (value, team)
    models = Models(None, device, env.feature_version, paths=paths)
    rows = []

    def on_game(pair, k, outcome, score, rounds, mv):
        spec = pair['specs'][k]
        rows.append(dict(name=f'{spec["encounter"]}__{k}', encounter=spec['encounter'], k=k, stratum=spec.get('stratum'),
                         outcome=outcome, score=round(score, 5), rounds=rounds, movement=mv,
                         tape=str(out / 'tapes' / f'{spec["encounter"]}__{k}.jsonl'), heroes=getattr(args, 'heroes'),
                         monsters=getattr(args, 'monsters'), no_step_back=args.no_step_back))
    pair = dict(h=sides['heroes'], m=sides['monsters'], ks=list(range(len(chosen))), specs=chosen, set=args.set,
                mode='record', record=str(out))
    Player(env, models, device, noback=args.no_step_back, threads=args.threads, micro_batch=args.micro_batch,
           forward_rows=args.forward_rows, max_models=args.max_models).play([pair], on_game)
    models.release([])
    with open(out / 'games.jsonl', 'w') as stream:
        for r in sorted(rows, key=lambda r: r['k']):
            stream.write(json.dumps(r) + '\n')
    write_json(out / 'record.json', dict(time=utc(), set=args.set, catalog=catalog, games=len(rows), heroes=args.heroes,
                                         monsters=args.monsters, no_step_back=args.no_step_back,
                                         feature_version=env.feature_version))
    print(f'recorded {len(rows)} games in {out}')


def cmd_show(args):
    report = read_json(args.json or Path(args.root) / 'ladder' / 'latest.json')
    if not report:
        raise SystemExit('no ladder round yet')
    print(summary_text(report))


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split('\n\n')[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest='command', required=True)

    def env_args(a):
        a.add_argument('--root', required=True)
        a.add_argument('--ember-env', choices=('ember_rs', 'fake'), default='ember_rs')
        a.add_argument('--device', default='cuda')
        a.add_argument('--threads', type=int, default=8)
        a.add_argument('--slots', type=int, default=1024)
        a.add_argument('--max-rounds', type=int, default=30)
        a.add_argument('--include-smoke', action='store_true', help='also rate runs under <root>/smoke (tests)')
        a.add_argument('--micro-batch', type=int, default=128, help='games per forward pass')
        a.add_argument('--forward-rows', type=int, default=1 << 16,
                       help='candidate rows per forward pass at most (games x widest K; destination moves)')
        a.add_argument('--max-models', type=int, default=6,
                       help='maximum distinct policy models resident on device at once (0 = unlimited)')
        a.add_argument('--feature-version', default=FEATURE_VERSION,
                       help='observation version of the policies (BatchEnv(feature_version=...))')
        a.add_argument('--snapshot-runs', action='store_true',
                       help='also enter runs that have no archive (the simultaneous schedule) with the hourly copies '
                            'of their learners in <run>/snapshots/ (Registry.discover_snapshots)')
        a.add_argument('--moves', choices=('step', 'dest'), default='step',
                       help='the move interface the policies were trained with (BatchEnv(moves=...))')
        a.add_argument('--rule-version', type=int, default=17,
                       help='engine rule version for BatchEnv (default: 17; pass 18 for Vesper / 2024 updates)')

    a = sub.add_parser('specs')
    a.add_argument('--root', required=True)
    a.add_argument('--name', required=True)
    a.add_argument('--catalog', nargs='+', required=True)
    a.add_argument('--splits', nargs='+', required=True, help="catalog splits, or 'all'")
    a.add_argument('--n', type=int, default=512)
    a.add_argument('--sealed', action='store_true')
    a.add_argument('--force', action='store_true')
    a.set_defaults(func=cmd_specs)
    a = sub.add_parser('round')
    env_args(a)
    a.add_argument('--set', default='dev')
    a.add_argument('--minutes', type=float, default=12., help='stop starting pairs after this')
    a.add_argument('--opponents', type=int, default=8)
    a.add_argument('--max-pairs', type=int, default=400)
    a.add_argument('--pair-specs', type=int, default=512,
                   help='specs per pair: the first N of the stratified order (all by default)')
    a.add_argument('--native-specs', type=int, default=None,
                   help='specs of a pair against the native AI, the headline cells (default: --pair-specs)')
    a.add_argument('--native-pair', action='store_true',
                   help='also play native heroes against native monsters on every spec of the set, once: the '
                        'measured zero of the ratings (report block native_pair)')
    a.add_argument('--min-games', type=int, default=2048, help='best-league candidates need this many dev games')
    a.add_argument('--matrix-size', type=int, default=14)
    a.add_argument('--anchor-hours', type=float, nargs='*')
    a.add_argument('--daily', choices=('auto', 'yes', 'no'), default='auto')
    a.add_argument('--daily-minutes', type=float, default=15.)
    a.add_argument('--diag-set', default='diag')
    a.add_argument('--probe-set', default='probe')
    a.add_argument('--probe-kinds', nargs='*', default=['goblin_minion', 'goblin_warrior', 'goblin_boss'])
    a.add_argument('--search', default='k=4,seeds=4,horizon=rounds:1,tau=0.1,skip_p=0.95,scratch=4096,select=mix,'
                                        'move_penalty=0.001')
    a.add_argument('--search-specs', type=int, default=128)
    a.add_argument('--search-minutes', type=float, default=20., help='daily budget of the search headroom')
    a.add_argument('--search-slots', type=int, default=256)
    a.set_defaults(func=cmd_round)
    a = sub.add_parser('sealed')
    env_args(a)
    a.add_argument('--set', default='sealed')
    a.add_argument('--milestone', required=True)
    a.add_argument('--entities', nargs='*')
    a.set_defaults(func=cmd_sealed)
    a = sub.add_parser('record')
    env_args(a)
    a.add_argument('--set', default='dev')
    a.add_argument('--ids', default='')
    a.add_argument('--n', type=int, default=32)
    a.add_argument('--seed', type=int, default=0)
    a.add_argument('--heroes', default='native')
    a.add_argument('--monsters', default='native')
    a.add_argument('--out', required=True)
    a.add_argument('--no-step-back', action='store_true',
                   help="play-time rule for showing policies: no move back to the square the actor just left this turn")
    a.set_defaults(func=cmd_record)
    a = sub.add_parser('show')
    a.add_argument('--root', required=True)
    a.add_argument('--json')
    a.set_defaults(func=cmd_show)
    args = p.parse_args(argv)
    return args.func(args)


if __name__ == '__main__':
    sys.exit(main())
