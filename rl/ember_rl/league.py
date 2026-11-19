"""The archive of selected phase policies and the league opponent sampler (gated schedule).

Archive (every gated run, `Archive`):
- At each phase switch, the finishing team's selected (phase-best) policy, when it is a new one, is saved
  to `<run>/archive/phase-<n>-<team>.pt` (n: the phase that trained and selected it; an ordinary frozen
  policy file, usable as --init-<team>) and listed in `<run>/archive/index.json`.
- A phase that kept its baseline (no candidate beat it) adds no file; its row in `phases` names the policy
  it kept (an earlier entry, or `initial-<team>` for the run's starting policy, which is not archived).
- Each entry carries its selection record and `stats`: the other team's learner results against it in
  training games (counts per outcome, plus counts decayed by 1 - 1/--pfsp-window per game for PFSP).
- `checkpoint.pt` holds the index (paths and stats), never the archived weights. On resume, entries the
  checkpoint does not know (written after it) are moved to `archive/dropped/`: the resumed run redoes
  those phases.

League (`--league`, `League`):
- At each phase start a panel of the other team's policies is built: the latest selected policy (the
  gate's opponent) plus up to --league-size - 1 archived policies of that team, drawn without
  replacement with PFSP weights. Only the panel is resident on the GPU.
- Each training game draws one opponent: the latest with probability --league-latest, otherwise a panel
  member with PFSP weight (1 - x)^--pfsp-power, x = the learner's decayed native-win rate against it
  (Beta(1, 1) smoothed). The opponent plays greedily and stays the same for the whole episode (the
  controller key holds the model and a unique name).
- With --league-dev-fraction f, a share f of the development games (spread evenly over the dev specs)
  plays the panel's --league-dev-opponents hardest archived members (lowest x at phase start) instead of
  the latest; the dev opponents are fixed for the phase, so candidates stay paired.
"""
from __future__ import annotations

import copy
import json
import math
import os
import re
import time
from pathlib import Path

OUTCOMES = ('win', 'loss', 'draw', 'horizon_win', 'horizon_loss', 'horizon_draw', 'truncation')
INDEX_VERSION = 1
ENTRY_FILE = re.compile(r'^phase-\d+-(heroes|monsters)\.pt$')


def empty_stats() -> dict:
    return dict(games=0, **{k: 0 for k in OUTCOMES}, decayed_games=0., decayed_wins=0.)


class Archive:
    def __init__(self, out, feature_version: str, window: int = 256):
        self.out = Path(out)
        self.dir = self.out / 'archive'
        self.feature_version = feature_version
        self.decay = 1. - 1. / window if window and window > 0 else 1.
        self.entries: dict[str, dict] = {}      # id -> entry, in creation order
        self.phases: list[dict] = []

    # ---- entries ----
    def add(self, team: str, phase: int, model, *, selection: dict, created: dict, save) -> dict:
        """Save `model` as the selected policy of `team` from `phase`; `save(path, model, extra)` writes it."""
        eid = f'phase-{phase}-{team}'
        if eid in self.entries:
            raise RuntimeError(f'archive entry {eid} exists already')
        rel = f'archive/{eid}.pt'
        save(self.out / rel, model, dict(feature_version=self.feature_version, team=team, export='phase-selected',
                                        archive_id=eid, phase=phase, selection=selection, created=created))
        entry = dict(id=eid, team=team, phase=phase, path=rel, created=created, selection=selection,
                     stats=empty_stats())
        self.entries[eid] = entry
        self.write_index()
        return entry

    def record_phase(self, row: dict) -> None:
        self.phases.append(row)
        self.write_index()

    def members(self, team: str) -> list[dict]:
        return [e for e in self.entries.values() if e['team'] == team]

    # ---- results ----
    def observe(self, eid: str, outcome: str) -> None:
        """One finished training game of the other team's learner against entry `eid` (learner's outcome)."""
        entry = self.entries.get(eid)
        if entry is None:
            return
        s = entry['stats']
        s['games'] += 1
        s[outcome] += 1
        s['decayed_games'] = s['decayed_games'] * self.decay + 1.
        s['decayed_wins'] = s['decayed_wins'] * self.decay + float(outcome == 'win')

    def win_rate(self, eid: str) -> float:
        """The learner's smoothed native-win rate against `eid`: (decayed wins + 1) / (decayed games + 2)."""
        s = self.entries[eid]['stats']
        return (s['decayed_wins'] + 1.) / (s['decayed_games'] + 2.)

    # ---- files ----
    def index(self) -> dict:
        entries = []
        for e in self.entries.values():
            row = copy.deepcopy(e)
            row['stats']['learner_win_rate'] = round(self.win_rate(e['id']), 4)
            row['stats']['decayed_games'] = round(row['stats']['decayed_games'], 3)
            row['stats']['decayed_wins'] = round(row['stats']['decayed_wins'], 3)
            entries.append(row)
        return dict(version=INDEX_VERSION, feature_version=self.feature_version, updated=round(time.time(), 1),
                    stats_note='stats: results of the other team\'s learner in training games against this policy; '
                               'decayed counts weigh the latest games most (PFSP)',
                    entries=entries, phases=self.phases)

    def write_index(self) -> None:
        self.dir.mkdir(parents=True, exist_ok=True)
        tmp = self.dir / 'index.json.tmp'
        tmp.write_text(json.dumps(self.index(), indent=1) + '\n')
        os.replace(tmp, self.dir / 'index.json')

    def state(self) -> dict:
        return dict(entries=copy.deepcopy(self.entries), phases=copy.deepcopy(self.phases))

    def load_state(self, state: dict | None) -> list[str]:
        """Restore from a checkpoint; returns the files moved to archive/dropped/ (unknown to it)."""
        state = state or {}
        self.entries = copy.deepcopy(state.get('entries') or {})
        self.phases = copy.deepcopy(state.get('phases') or [])
        return self.reconcile()

    def reconcile(self) -> list[str]:
        """Move archived policy files this archive does not list to archive/dropped/ and rewrite the index."""
        moved = []
        if self.dir.is_dir():
            known = {Path(e['path']).name for e in self.entries.values()}
            for path in sorted(self.dir.iterdir()):
                if path.is_file() and ENTRY_FILE.match(path.name) and path.name not in known:
                    target = self.dir / 'dropped' / f'{path.stem}.{int(time.time())}{path.suffix}'
                    target.parent.mkdir(exist_ok=True)
                    os.replace(path, target)
                    moved.append(str(target.relative_to(self.out)))
        if self.entries or moved or self.dir.is_dir():
            self.write_index()
        return moved


class League:
    def __init__(self, archive: Archive, *, size: int = 8, latest: float = .5, power: float = 2.,
                 dev_opponents: int = 2, load=None):
        self.archive, self.size, self.latest_p, self.power = archive, int(size), float(latest), float(power)
        self.dev_opponents, self.load = int(dev_opponents), load
        self.version = 0
        self.panel = None          # dict(version, team, latest, members, dev)
        self.latest_model = None
        self.cache = {}            # archive id -> resident model

    def weight(self, eid: str) -> float:
        return (1. - self.archive.win_rate(eid)) ** self.power

    def build(self, team: str, latest_id: str, latest_model, rng) -> dict:
        """A new panel of `team` policies for the next phase (see the module docstring)."""
        members = [e['id'] for e in self.archive.members(team) if e['id'] != latest_id]
        k = min(max(0, self.size - 1), len(members))
        # Weighted sampling without replacement (Efraimidis-Spirakis): the k largest u^(1/w).
        keys = []
        for eid in members:
            w = max(self.weight(eid), 1e-12)
            keys.append((math.log(max(rng.random(), 1e-300)) / w, eid))
        chosen = [eid for _, eid in sorted(keys, reverse=True)[:k]]
        return self._install(team, latest_id, latest_model, chosen, next_version=True)

    def restore(self, panel: dict, latest_model) -> dict:
        """The saved panel again (its members reloaded from the archive), without drawing anything."""
        self.version = int(panel['version']) - 1
        return self._install(panel['team'], panel['latest'], latest_model, list(panel['members']),
                             next_version=True, dev=list(panel['dev']))

    def _install(self, team, latest_id, latest_model, chosen, *, next_version, dev=None):
        cache = {}
        for eid in chosen:
            cache[eid] = self.cache.get(eid)
            if cache[eid] is None:
                cache[eid] = self.load(self.archive.entries[eid])
        self.cache = cache
        if dev is None:
            dev = sorted(chosen, key=lambda e: (self.archive.win_rate(e), e))[:self.dev_opponents]
        if next_version:
            self.version += 1
        self.latest_model = latest_model
        self.panel = dict(version=self.version, team=team, latest=latest_id, members=chosen, dev=dev)
        return self.panel

    def choose(self, rng):
        """(id, model, panel version) of one training game's opponent."""
        p = self.panel
        members = p['members']
        if not members or rng.random() < self.latest_p:
            return p['latest'], self.latest_model, p['version']
        eid = rng.choices(members, weights=[self.weight(e) for e in members])[0]
        return eid, self.cache[eid], p['version']

    def describe(self) -> dict:
        p = self.panel
        return dict(version=p['version'], team=p['team'], latest=p['latest'], dev=p['dev'],
                    members={e: dict(learner_win_rate=round(self.archive.win_rate(e), 4),
                                     weight=round(self.weight(e), 4),
                                     games=self.archive.entries[e]['stats']['games']) for e in p['members']})

    def state(self) -> dict | None:
        return copy.deepcopy(self.panel)
