"""Trainer-side contract for the ember-rs general environment (GENERAL_ENV.md §5, §8.1).

This module defines, without torch:

- `BatchEnv`: the Python protocol that the pyo3 `ember_rs.BatchEnv` (stage G6)
  must implement, with the exact array names, shapes, dtypes and semantics.
- `EpisodeSpec`: what a reset takes instead of an integer seed.
- `validate_obs` / `validate_info`: executable versions of the contract, used
  by the tests of `FakeBatchEnv` and meant for G6's Python suite as well.
- the catalog readers (`load_catalog`, `load_catalogs` for several tagged files) and
  `SpecSource`: train sampling by tier or nested by party, map family and balance
  band; fixed, stratified dev and eval spec lists with coverage reports; native
  baselines for `excess`.

Arrays (B = number of slots asked for, N = creature cap, K = candidate rows,
T = target slots per candidate; legal candidate rows and real creatures are
always a prefix, padding comes after):

    creatures      f32  [B, N, F_c]        creature tokens (§5.2)
    creature_ids   i16  [B, N, 3]          kind id, character id or -1, concentration spell id or -1
    creature_mask  bool [B, N]             real creature (dead ones stay, flagged)
    map            u8   [B, C, S, S]       map channels on the S x S canvas (§5.3)
    global         f32  [B, F_g]           (§5.4)
    cands          f32  [B, K, F_a]        candidate rows (§5.5)
    cand_ids       i16  [B, K, 3]          action-kind id, spell id or -1, attack-name id or -1
    cand_tgt       i16  [B, K, T]          creature token index or -1
    cand_tgt_n     u8   [B, K, T]          multiplicity of each target (0 where cand_tgt = -1)
    cand_cell      i16  [B, K]             canvas cell y*S + x, or -1
    cand_mask      bool [B, K]             legal row
    actor          i16  [B]                creature token index of the actor (-1: no decision)
    native_raw     f32  [B, K]             native score per row (End Turn: 0 or -inf; NaN if scores are off)
    native_dropped bool [B, K]             row removed by GeneralController before choosing
    native_choice  i16  [B]                row the native AI takes (-1 if scores are off)
    creature_rel   u8   [B, N, N, R]       pairwise relations (ember-gen-v2; absent in v1), 0/1:
                                           r0 frightened_of (j is a source of i's fear), r1 save_immune
                                           (i is immune to j's save effect), r2 effect_from (i is under an
                                           effect j caused), r3 sees (i can see j), r4 in_reach (i is within
                                           j's melee reach). 0 on the diagonal, on padding and whenever i or
                                           j is dead; r3 and r4 are 0 in the row and column of a creature
                                           hidden from the view team (GENERAL_ENV.md §10).

Model inputs (`MODEL_INPUTS`): the twelve arrays from creatures to actor, plus creature_rel when the
feature version has relations; the three native arrays are distillation targets and never enter
the network.

Feature versions (`FEATURE_DIMS`): ember-gen-v2 (the default, `FEATURE_VERSION`) extends every
ember-gen-v1 array by a suffix (creature 160 -> 183, global 32 -> 34, cand 112 -> 122, map channels
16 -> 17) and adds creature_rel; the v1 columns keep their meaning and position.
"""
from __future__ import annotations

import itertools
import json
import random
import zlib
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any, NamedTuple, Protocol, runtime_checkable

import numpy as np

FEATURE_VERSION = 'ember-gen-v2'
TEAMS = ('heroes', 'monsters')
TEAM_CODE = {'heroes': 0, 'monsters': 1}
TASK_END = {0: None, 1: 'native', 2: 'health'}
CONTROLLERS = ('external', 'native')

# Default dimensions (GENERAL_ENV.md §5.1-§5.5, §10): those of FEATURE_VERSION. An env reports its
# own in `env.dims` and the model reads every input size there.
DEFAULT_DIMS = dict(N=24, T=8, creature=183, global_=34, cand=122, map_channels=17, canvas=32, relations=5)
FEATURE_DIMS = {
    'ember-gen-v1': dict(N=24, T=8, creature=160, global_=32, cand=112, map_channels=16, canvas=32, relations=0),
    'ember-gen-v2': dict(DEFAULT_DIMS),
    'ember-gen-v3': dict(DEFAULT_DIMS),
}
RELATIONS = ('frightened_of', 'save_immune', 'effect_from', 'sees', 'in_reach')
ID_SLOTS = 256           # ids 0..255 per vocabulary section (public 0-199, private 200-255)
UNKNOWN_ID = -2          # id dropout ("unknown" kind or character); never produced by the env
NONE_ID = -1

# Action-kind ids from content/vocab.json (`action_kinds`); used to tell moves
# from other rows (per-class temperature) and to find End Turn.
MOVE_KIND = 0
SPELL_KIND = 7
END_TURN_KIND = 14
SCORCHING_RAY_ID = 20

MODEL_INPUTS = ('creatures', 'creature_ids', 'creature_mask', 'map', 'global', 'cands', 'cand_ids',
                'cand_tgt', 'cand_tgt_n', 'cand_cell', 'cand_mask', 'actor', 'creature_rel')
OPTIONAL_INPUTS = ('creature_rel',)      # only with relations (ember-gen-v2)
CREATURE_FIELDS = ('creatures', 'creature_ids', 'creature_mask')   # second axis is N
PAIR_FIELDS = ('creature_rel',)          # second and third axes are N
VALUE_INPUTS = ('map', 'global', *CREATURE_FIELDS, *PAIR_FIELDS)
NATIVE_FIELDS = ('native_raw', 'native_dropped', 'native_choice')
CAND_FIELDS = ('cands', 'cand_ids', 'cand_tgt', 'cand_tgt_n', 'cand_cell', 'cand_mask',
               'native_raw', 'native_dropped')   # second axis is K


def obs_layout(dims: Mapping[str, int]) -> dict[str, tuple[np.dtype, tuple]]:
    """Field -> (dtype, shape after the batch axis), with 'K' for the candidate axis."""
    d = normalize_dims(dims)
    n, t, s = d['N'], d['T'], d['canvas']
    return {
        'creatures': (np.dtype(np.float32), (n, d['creature'])),
        'creature_ids': (np.dtype(np.int16), (n, 3)),
        'creature_mask': (np.dtype(np.bool_), (n,)),
        'map': (np.dtype(np.uint8), (d['map_channels'], s, s)),
        'global': (np.dtype(np.float32), (d['global_'],)),
        'cands': (np.dtype(np.float32), ('K', d['cand'])),
        'cand_ids': (np.dtype(np.int16), ('K', 3)),
        'cand_tgt': (np.dtype(np.int16), ('K', t)),
        'cand_tgt_n': (np.dtype(np.uint8), ('K', t)),
        'cand_cell': (np.dtype(np.int16), ('K',)),
        'cand_mask': (np.dtype(np.bool_), ('K',)),
        'actor': (np.dtype(np.int16), ()),
        'native_raw': (np.dtype(np.float32), ('K',)),
        'native_dropped': (np.dtype(np.bool_), ('K',)),
        'native_choice': (np.dtype(np.int16), ()),
        **({'creature_rel': (np.dtype(np.uint8), (n, n, d['relations']))} if d['relations'] > 0 else {}),
    }


# StepInfo: every field is a 1-D array with one entry per slot asked for.
INFO_LAYOUT = {
    'done': np.dtype(np.bool_),           # no decision pending (terminated or truncated)
    'terminated': np.dtype(np.bool_),     # native elimination, or the health-score horizon
    'truncated': np.dtype(np.bool_),      # safety cap; never set together with terminated
    'reset_terminal': np.dtype(np.bool_),  # finished during reset, before any external decision
    'task_end': np.dtype(np.int8),        # 0 not ended / truncated, 1 native elimination, 2 horizon
    'winner': np.dtype(np.int8),          # -1 none (draw, horizon, running), 0 heroes, 1 monsters
    'team': np.dtype(np.int8),            # team of the pending decision, -1 when done
    'actor': np.dtype(np.int16),          # creature token index of the pending decision, -1 when done
    'round': np.dtype(np.int32),          # current round (1-based)
    'score': np.dtype(np.float32),        # heroes-perspective objective score (§8.4)
    'potential': np.dtype(np.float32),    # heroes-perspective shaping potential, 0 at any terminal
    'forced': np.dtype(np.int32),         # forced steps auto-executed in this call (§4.2)
    'native_actions': np.dtype(np.int32),  # actions of native-controlled creatures in this call
}
# Reported by newer environments (ember-rs 9abcae2+, FakeBatchEnv); checked when present.
OPTIONAL_INFO = {
    'moved': np.dtype(np.int32),          # squares the deciding creature walked in this step (0 after reset)
}
MOVE_MODES = ('step', 'dest')             # BatchEnv(moves=...): one-square rows, or one row per reachable square


def normalize_dims(dims: Mapping[str, int] | None) -> dict[str, int]:
    """Dims with every key (`global` as `global_`); missing keys from DEFAULT_DIMS, except that an env
    whose dims do not name `relations` has none (ember-gen-v1)."""
    out = dict(DEFAULT_DIMS)
    if dims is not None and 'relations' not in dims:
        out['relations'] = 0
    for key, value in (dims or {}).items():
        out['global_' if key == 'global' else key] = int(value)
    return out


class EpisodeSpec(NamedTuple):
    """One episode: encounter id from the catalog plus the three seeds.

    offset_x/offset_y place the map on the canvas (§5.3). -1 means a random
    offset drawn from the layout seed (training); evaluation uses (0, 0).
    A NamedTuple, so the bindings can take it as a plain tuple.
    """
    encounter: str
    map_seed: int
    layout_seed: int
    dice_seed: int
    offset_x: int = -1
    offset_y: int = -1

    def to_json(self) -> dict:
        return self._asdict()

    @classmethod
    def from_json(cls, row: Mapping[str, Any]) -> 'EpisodeSpec':
        return cls(str(row['encounter']), int(row['map_seed']), int(row['layout_seed']), int(row['dice_seed']),
                   int(row.get('offset_x', 0)), int(row.get('offset_y', 0)))


@runtime_checkable
class BatchEnv(Protocol):
    """The in-process batched environment (GENERAL_ENV.md §8.1); `ember_rs.BatchEnv` implements it.

    Construction (not part of the protocol; ember_rs G6):
        BatchEnv(n_slots, content=None, threads=12, scores=True, objective='health_score',
                 max_rounds=30, standing_weight=.5, max_steps=4096, catalog=None)
    `max_rounds` is the default horizon: `max_rounds` rounds are played; a catalog
    encounter may override it (`max_rounds` in its row). `max_steps` is the safety cap
    on external decisions per game (truncation). `catalog`: an encounters.jsonl path or
    a list of row dicts (`load_catalog` format below); None = the env's own catalog
    (ember_rs: the embedded provisional smoke-test catalog). `env.catalog` holds the
    rows; the trainer passes `--catalog` through.

    Slots are ints in [0, n_slots). `slots` arguments are int32 1-D arrays (or
    sequences) of distinct slots; every result array follows that order.

    Semantics:
    - `reset(slots, specs, controllers)`: start a game in each slot. `specs` is
      one `EpisodeSpec` per slot; `controllers` one mapping per slot,
      {'heroes': 'external'|'native', 'monsters': 'external'|'native'}, optionally
      with 'external_units': [creature, ...] (per-creature control, `check_controllers`):
      a creature is external when its team is or when it is listed, by creature
      token index (registration order: heroes, then monsters, as
      `encounter_units(row)` lists them) or by unit id. Experiment 3 (one random
      creature per game played by the network) is {'heroes': 'native', 'monsters':
      'native', 'external_units': [k]}. A listed creature's decisions are exactly a
      team-external creature's (natural20 `GeneralArena.set_external(units=...)`);
      `team` in info and observations is still the creature's team. Native turns
      run until the first external decision, so a slot may come back done
      (`reset_terminal`, which stays set for that game). Everything is checked
      first: an unknown encounter, bad controllers or an unplaceable layout raise
      ValueError and no slot changes. Returns StepInfo.
    - `observe(slots, team=None)`: the observation arrays (module docstring)
      for each slot, from the perspective of its deciding creature. K is the
      largest legal count among the slots (at least 1 when any slot has a
      decision). For a done slot, `team[i]` (int8, 0/1) must name a team: the
      result is that team's view of the final state for value bootstrapping,
      with no legal rows, actor -1, and actor-relative features at their
      no-actor values. For a slot with a decision, `team[i]` must be -1 or its
      deciding team. Arrays may be views into preallocated buffers, valid
      until the next mutating call (reset, step, restore); copy what you keep.
    - The Rust backend also provides `observe_value(slots, team=None)` for
      critics. It returns the available `VALUE_INPUTS` with the same team
      perspectives and buffer lifetime as `observe`.
    - `step(slots, rows)`: execute row `rows[i]` (int32) for each slot, then
      forced steps and native turns until the next external decision or the
      end. Every row is checked first: a done slot, a padded or out-of-range
      row raises ValueError and no slot changes. Returns StepInfo.
    - `info(slots)`: the current StepInfo without changing anything
      (`forced`/`native_actions` are those of the last mutating call).
    - `snapshot(slot)` / `restore(slot, snapshot, dice_seed=None)`: opaque
      clone of the whole game (controllers, shadow memory, dice stream). With
      `dice_seed`, the restored game's dice stream is reseeded, which gives
      independent continuations from one state (critic targets, §6.3).
    - `describe(slot)`: one tape-style descriptor string per legal row.
    - `record(slot, path)`: write the slot's game as a tape (§9.3).

    End Turn is always the last legal row. A decision whose only legal row is
    End Turn, and a turned creature's flee step, are executed automatically
    and counted in `forced` (§4.2); they never surface.

    StepInfo `round` is natural20's `battle.round + 1`: at the horizon it is
    `max_rounds + 1`. `score` is the heroes-perspective objective (§8.4): (1 - w)
    (H/H0 - M/M0) + w (standing_h/N_h - standing_m/N_m), each creature's HP clamped
    to [0, its starting HP], standing = alive with HP > 0; `potential` is
    0.3 * score (0 at any terminal) for both objectives.
    """
    n_slots: int
    feature_version: str      # 'ember-gen-v1'
    dims: Mapping[str, int]   # keys N, T, creature, global, cand, map_channels, canvas
    scores: bool              # native scores computed (native_raw / native_choice valid)

    def reset(self, slots, specs: Sequence[EpisodeSpec], controllers: Sequence[Mapping[str, str]]) -> dict[str, np.ndarray]: ...
    def observe(self, slots, team=None) -> dict[str, np.ndarray]: ...
    def step(self, slots, rows) -> dict[str, np.ndarray]: ...
    def info(self, slots) -> dict[str, np.ndarray]: ...
    def snapshot(self, slot: int) -> Any: ...
    def restore(self, slot: int, snapshot: Any, dice_seed: int | None = None) -> None: ...
    def describe(self, slot: int) -> list[str]: ...
    def record(self, slot: int, path: str) -> None: ...


CONTROLLER_KEYS = ('heroes', 'monsters', 'external_units')


def check_controllers(ctrl: Mapping) -> tuple[dict[str, str], list]:
    """One slot's controller mapping -> ({team: 'external'|'native'}, external_units).

    Keys: 'heroes' and 'monsters' (required), 'external_units' (optional list of
    creature token indices >= 0 or unit ids). Raises ValueError otherwise; the
    environment checks the indices and ids against the encounter."""
    if not isinstance(ctrl, Mapping):
        raise ValueError(f'controllers must be one mapping per slot, not {ctrl!r}')
    unknown = set(ctrl) - set(CONTROLLER_KEYS)
    if unknown or not set(TEAMS) <= set(ctrl):
        raise ValueError(f'bad controllers {dict(ctrl)!r}: keys {CONTROLLER_KEYS}, heroes and monsters required')
    teams = {team: ctrl[team] for team in TEAMS}
    if any(c not in CONTROLLERS for c in teams.values()):
        raise ValueError(f'bad controllers {dict(ctrl)!r}: each team is one of {CONTROLLERS}')
    units = list(ctrl.get('external_units', ()))
    for u in units:
        if isinstance(u, bool) or not (isinstance(u, (int, np.integer)) and u >= 0 or isinstance(u, str)):
            raise ValueError(f'external_units holds token indices >= 0 or unit ids, not {u!r}')
    return teams, units


def check_contract(env, feature_version: str = FEATURE_VERSION) -> None:
    """The environment's schema is the one this trainer was asked for: `feature_version` (default
    FEATURE_VERSION) and its dims in FEATURE_DIMS."""
    if feature_version not in FEATURE_DIMS:
        raise ValueError(f'unknown feature version {feature_version!r}; known: {sorted(FEATURE_DIMS)}')
    if env.feature_version != feature_version:
        raise ValueError(f'environment feature version {env.feature_version!r} != {feature_version!r}')
    if normalize_dims(env.dims) != normalize_dims(FEATURE_DIMS[feature_version]):
        raise ValueError(f'environment dims {dict(env.dims)} != {FEATURE_DIMS[feature_version]}')


def as_slots(slots) -> np.ndarray:
    return np.asarray(slots, dtype=np.int32).reshape(-1)


def info_row(info: Mapping[str, np.ndarray], i: int) -> dict:
    """One slot's StepInfo as the dict the duel trainer reads (team and winner by name)."""
    team, winner = int(info['team'][i]), int(info['winner'][i])
    return dict(team=TEAMS[team] if team >= 0 else None, winner=TEAMS[winner] if winner >= 0 else None,
                terminated=bool(info['terminated'][i]), truncated=bool(info['truncated'][i]),
                done=bool(info['done'][i]), reset_terminal=bool(info['reset_terminal'][i]),
                task_end=TASK_END[int(info['task_end'][i])], round=int(info['round'][i]),
                score=float(info['score'][i]), potential=float(info['potential'][i]),
                actor=int(info['actor'][i]), forced=int(info['forced'][i]),
                native_actions=int(info['native_actions'][i]),
                moved=int(info['moved'][i]) if 'moved' in info else None)


# --------------------------------------------------------------------------- validation

class ContractError(ValueError):
    pass


def _require(condition, message):
    if not condition:
        raise ContractError(message)


def validate_info(info: Mapping[str, np.ndarray], n: int) -> None:
    for name, dtype in {**INFO_LAYOUT, **{k: v for k, v in OPTIONAL_INFO.items() if k in info}}.items():
        _require(name in info, f'info lacks {name}')
        array = np.asarray(info[name])
        _require(array.dtype == dtype and array.shape == (n,), f'info {name}: {array.dtype}{array.shape} != {dtype}({n},)')
    done, term, trunc = info['done'], info['terminated'], info['truncated']
    _require(np.array_equal(done, term | trunc), 'done must equal terminated | truncated')
    _require(not np.any(term & trunc), 'terminated and truncated are exclusive')
    _require(np.all((info['team'] >= 0) == ~done) and np.all((info['actor'] >= 0) == ~done),
             'team/actor must be set exactly when a decision is pending')
    _require(np.all(info['task_end'][~term] == 0) and np.all(np.isin(info['task_end'][term], (1, 2))),
             'task_end is 1 or 2 exactly at termination')
    _require(np.all(info['winner'][info['task_end'] != 1] == -1), 'winner only at native elimination')
    _require(np.all(info['potential'][term] == 0), 'potential must be 0 at any terminal')
    _require(np.all(np.isfinite(info['score'])) and np.all(np.isfinite(info['potential'])), 'non-finite score/potential')
    _require(np.all(info['round'] >= 1), 'round is 1-based')


def validate_obs(obs: Mapping[str, np.ndarray], dims: Mapping[str, int] | None = None, *,
                 live: Sequence[bool] | np.ndarray | None = None, scores: bool = True,
                 end_turn_kind: int = END_TURN_KIND) -> None:
    """Check one batched observation against the contract. `live[i]` False marks a done slot's final view."""
    d = normalize_dims(dims)
    layout = obs_layout(d)
    _require(set(layout) <= set(obs), f'observation lacks {sorted(set(layout) - set(obs))}')
    b = np.asarray(obs['actor']).shape[0] if np.ndim(obs['actor']) else None
    _require(b is not None and b > 0, 'actor must be [B] with B > 0')
    k = np.asarray(obs['cand_mask']).shape[1]
    for name, (dtype, shape) in layout.items():
        array = np.asarray(obs[name])
        want = (b,) + tuple(k if s == 'K' else s for s in shape)
        _require(array.dtype == dtype and array.shape == want, f'{name}: {array.dtype}{array.shape} != {dtype}{want}')
    live = np.ones(b, bool) if live is None else np.asarray(live, bool)
    n, s = d['N'], d['canvas']
    cmask, mask = obs['creature_mask'], obs['cand_mask']
    for name in ('creatures', 'global', 'cands'):
        _require(np.all(np.isfinite(obs[name])), f'{name} must be finite')
    for i in range(b):
        real = int(cmask[i].sum())
        _require(cmask[i, :real].all(), f'slot {i}: creature_mask must be a prefix')
        _require(not obs['creatures'][i, real:].any() and np.all(obs['creature_ids'][i, real:] == -1),
                 f'slot {i}: creature padding must be zero / -1')
        if 'creature_rel' in layout:
            rel = obs['creature_rel'][i]
            _require(np.all(rel <= 1), f'slot {i}: creature_rel must be 0/1')
            _require(not rel[real:].any() and not rel[:, real:].any(), f'slot {i}: creature_rel padding must be 0')
            _require(not rel[np.arange(n), np.arange(n)].any(), f'slot {i}: creature_rel diagonal must be 0')
        ids = obs['creature_ids'][i, :real]
        _require(np.all((ids >= -1) & (ids < ID_SLOTS)) and np.all(ids[:, 0] >= 0), f'slot {i}: creature ids out of range')
        inside = obs['map'][i, 0].astype(bool)
        legal = int(mask[i].sum())
        _require(mask[i, :legal].all(), f'slot {i}: cand_mask must be a prefix')
        pad = slice(legal, None)
        _require(not obs['cands'][i, pad].any() and np.all(obs['cand_ids'][i, pad] == -1)
                 and np.all(obs['cand_tgt'][i, pad] == -1) and not obs['cand_tgt_n'][i, pad].any()
                 and np.all(obs['cand_cell'][i, pad] == -1) and not obs['native_dropped'][i, pad].any()
                 and not obs['native_raw'][i, pad].any(), f'slot {i}: candidate padding must be zero / -1')
        actor = int(obs['actor'][i])
        if not live[i]:
            _require(legal == 0 and actor == -1 and int(obs['native_choice'][i]) == -1,
                     f'slot {i}: a final view has no rows, no actor and no native choice')
            continue
        _require(legal >= 1, f'slot {i}: a live slot needs a legal row')
        _require(0 <= actor < real, f'slot {i}: actor {actor} is not a real creature')
        cids = obs['cand_ids'][i, :legal]
        aiming_rays = np.all((cids[:, 0] == SPELL_KIND) & (cids[:, 1] == SCORCHING_RAY_ID))
        _require(aiming_rays or (cids[-1, 0] == end_turn_kind and not np.any(cids[:-1, 0] == end_turn_kind)),
                 f'slot {i}: End Turn must be last unless choosing the next Scorching Ray')
        _require(np.all((cids >= -1) & (cids < ID_SLOTS)) and np.all(cids[:, 0] >= 0), f'slot {i}: candidate ids out of range')
        tgt, tn = obs['cand_tgt'][i, :legal].astype(int), obs['cand_tgt_n'][i, :legal]
        _require(np.all((tgt >= -1) & (tgt < real)), f'slot {i}: pointer outside the real creatures')
        _require(np.all((tgt >= 0) == (tn > 0)), f'slot {i}: multiplicity must be > 0 exactly for set targets')
        cells = obs['cand_cell'][i, :legal].astype(int)
        _require(np.all((cells >= -1) & (cells < s * s)), f'slot {i}: cand_cell out of range')
        on = cells[cells >= 0]
        _require(np.all(inside.reshape(-1)[on]), f'slot {i}: cand_cell outside the map')
        raw, dropped, choice = obs['native_raw'][i, :legal], obs['native_dropped'][i, :legal], int(obs['native_choice'][i])
        if scores:
            _require(0 <= choice < legal, f'slot {i}: native_choice {choice} not a legal row')
            _require(not dropped[choice], f'slot {i}: native_choice is a dropped row')
            _require(not np.any(np.isnan(raw)) and not np.any(raw == np.inf), f'slot {i}: native_raw must be finite or -inf')
            if aiming_rays:
                _require(not np.any(dropped[:legal]), f'slot {i}: a mandatory ray target cannot be dropped')
            else:
                _require(not dropped[legal - 1], f'slot {i}: End Turn is never dropped')
        else:
            _require(choice == -1, f'slot {i}: native_choice must be -1 without scores')
    _require(np.all(obs['creature_mask'].sum(1) <= n), 'too many creatures')


# --------------------------------------------------------------------------- catalog and specs

def load_jsonl(path) -> list[dict]:
    rows = []
    for line in Path(path).read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#'):
            rows.append(json.loads(line))
    return rows


def load_catalog(path) -> list[dict]:
    """encounters.jsonl (GENERAL_ENV.md §7.3). Fields read here: id (required), tier
    (default 'T0'), split (default 'train'), and the native baseline as either
    `baseline: {heroes, monsters}` or `p` (hero win probability) plus optional
    `truncation` (monster baseline = 1 - p - truncation).

    The environment reads what to play (ember_rs `catalog.rs`):
    - `map`: a fixed map name (vault, room_12x10, two_rooms_24x18, hall_32x32) or
      {name, rows}; `party`: hero content ids; `roster`: monster content ids (unit ids
      `<content>-<n>` numbered per content in order);
    - or instead `spec`: a natural20 EncounterSpec dict (format 1) whose units may
      carry squares;
    - `layout`: {'rule': 'zone', 'require_sight': bool (default false), 'tries': 200}
      (the default; natural20 `EncounterSpec.auto_place`, unplaced creatures only) or
      {'rule': 'fixed', 'placements': [{id, x, y}, ...]} (or every square in `spec`);
    - `max_rounds`: optional horizon override.
    Rows without them (the fake env's) are fine for the trainer."""
    rows = load_jsonl(path)
    seen = set()
    for row in rows:
        if 'id' not in row:
            raise ValueError(f'{path}: catalog row without id')
        if row['id'] in seen:
            raise ValueError(f'{path}: duplicate encounter {row["id"]}')
        seen.add(row['id'])
    return rows


def encounter_units(row: Mapping) -> list[dict] | None:
    """A catalog row's creatures in token order (heroes, then monsters), as
    [{id, content, team}], from `party`/`roster` or `spec`; `n_units` rows (the fake
    env's catalog) give anonymous creatures; None if the row does not say."""
    if 'spec' in row:
        spec = row['spec']
        return [dict(id=u['id'], content=u['content'], team=team)
                for team in TEAMS for u in spec.get(team, [])]
    if 'party' in row and 'roster' in row:
        out = [dict(id=c, content=c, team='heroes') for c in row['party']]
        numbers = {}
        for c in row['roster']:
            numbers[c] = numbers.get(c, 0) + 1
            out.append(dict(id=f'{c}-{numbers[c]}', content=c, team='monsters'))
        return out
    if 'n_units' in row:
        n, heroes = int(row['n_units']), row.get('n_heroes')
        return [dict(id=None, content=None, team=None if heroes is None else TEAMS[int(k >= int(heroes))])
                for k in range(n)]
    return None


def team_tokens(row: Mapping) -> dict[str, list[int]]:
    """Token indices per team of a catalog row (single-creature control); raises
    ValueError if the row does not say which creature is on which side."""
    units = encounter_units(row)
    if not units or any(u['team'] not in TEAMS for u in units):
        raise ValueError(f'catalog row {row.get("id")!r} does not list its creatures by team '
                         '(party/roster, spec or n_units + n_heroes)')
    out = {team: [k for k, u in enumerate(units) if u['team'] == team] for team in TEAMS}
    if not all(out.values()):
        raise ValueError(f'catalog row {row.get("id")!r} has an empty side')
    return out


def load_specs(path) -> list[EpisodeSpec]:
    return [EpisodeSpec.from_json(row) for row in load_jsonl(path)]


def write_specs(path, specs: Sequence[EpisodeSpec]) -> None:
    Path(path).write_text(''.join(json.dumps(s.to_json()) + '\n' for s in specs))


def parse_tier_weights(text: str | None) -> dict[str, float] | None:
    if not text:
        return None
    weights = {}
    for part in text.split(','):
        tier, _, weight = part.partition('=')
        weights[tier.strip()] = float(weight) if weight else 1.
    return weights


def parse_weights(text: str | None) -> dict[str, float] | None:
    """'key=weight,key=weight' (a bare key weighs 1); None or '' -> None. Weights must be >= 0."""
    weights = parse_tier_weights(text)
    if weights and any(w < 0 or not np.isfinite(w) for w in weights.values()):
        raise ValueError(f'weights must be finite and >= 0: {text!r}')
    return weights


def parse_range(text) -> tuple[float, float]:
    """'.40,.60' -> (0.4, 0.6), a closed interval of win probabilities."""
    if isinstance(text, (tuple, list)):
        lo, hi = text
    else:
        lo, _, hi = str(text).partition(',')
    lo, hi = float(lo), float(hi)
    if not 0 <= lo <= hi <= 1:
        raise ValueError(f'a range is lo,hi with 0 <= lo <= hi <= 1, not {text!r}')
    return lo, hi


def _seed(*parts) -> int:
    return zlib.crc32(json.dumps(parts).encode()) & 0x7fffffff


# --------------------------------------------------------------------------- strata: party, map family, balance band

CATALOG_TAGS = ('family', 'band')
GENERATOR_FAMILIES = frozenset(('open', 'pillars', 'rooms', 'caves'))   # ember-rs mapgen families
BALANCED, WIDE = (.40, .60), (.25, .75)


def split_catalog_entry(entry) -> tuple[str, dict[str, str]]:
    """'path' or 'path#family=mausoleum,band=wide' -> (path, tags)."""
    path, sep, text = str(entry).partition('#')
    tags = {}
    if sep:
        for part in text.split(','):
            key, eq, value = part.partition('=')
            key, value = key.strip(), value.strip()
            if not eq or key not in CATALOG_TAGS or not value:
                raise ValueError(f'bad catalog tag {part!r} in {entry!r}: use path#family=<name>,band=<name>')
            tags[key] = value
    return path, tags


def load_catalogs(entries) -> tuple[list[dict], dict[str, dict[str, str]]]:
    """Several encounters.jsonl files as one catalog: (rows in file order, {encounter id: file tags}).

    An entry is a path, optionally with tags for its rows (`path#family=mausoleum`, `path#band=wide`);
    a row's own `family` / `band` field wins over its file's tag. Encounter ids must be unique across
    the files (the variable-party catalogs put the party in the id). The rows go to the environment
    unchanged; the tags only matter to the trainer (`SpecSource`)."""
    if isinstance(entries, (str, Path)):
        entries = [entries]
    rows, tags, origin = [], {}, {}
    for entry in entries:
        path, file_tags = split_catalog_entry(entry)
        for row in load_catalog(path):
            if row['id'] in origin:
                raise ValueError(f'encounter {row["id"]} is in both {origin[row["id"]]} and {path}')
            origin[row['id']] = path
            rows.append(row)
            if file_tags:
                tags[row['id']] = dict(file_tags)
    if not rows:
        raise ValueError(f'no encounters in {list(entries)}')
    return rows, tags


def encounter_party(row: Mapping) -> tuple[str, ...] | None:
    """Hero content ids of a catalog row (`party`, or the heroes of `spec`); None if the row does not say."""
    if 'party' in row:
        return tuple(str(c) for c in row['party'])
    if isinstance(row.get('spec'), Mapping):
        return tuple(str(u['content']) for u in row['spec'].get('heroes', []))
    return None


def party_key(party) -> str:
    """Canonical party name: hero ids sorted and joined by '+', so 'guy+curogana' and 'curogana+guy'
    are the same party; '?' when unknown."""
    if not party:
        return '?'
    if isinstance(party, str):
        party = party.split('+')
    return '+'.join(sorted(str(p).strip() for p in party))


def roster_counts(row: Mapping) -> tuple[int, int] | None:
    """(heroes, monsters) of a catalog row, or None if the row does not list its creatures by team."""
    units = encounter_units(row)
    if not units or any(u['team'] not in TEAMS for u in units):
        return None
    heroes = sum(u['team'] == 'heroes' for u in units)
    return heroes, len(units) - heroes


def map_family(row: Mapping, tag: str | None = None) -> str:
    """The encounter's map family for sampling and reports: 'fixed', 'generated' or a hand-drawn map set.

    In order: the row's `family` field; the catalog file's tag; a fixed map name (`map` is a string) is
    'fixed'; a hand-made map (`map.ember.hand_made`, or generator family 'hand') is named after its map
    name's prefix ('mausoleum-chapel' -> 'mausoleum'); a map with generator metadata (`map.ember.generator`,
    the row's `generator`, or an ember-rs mapgen family) is 'generated'; anything else 'other'.
    Not ember-rs's `map_family` row field, which is the generator family (open, pillars, rooms, caves)."""
    if row.get('family'):
        return str(row['family'])
    if tag:
        return str(tag)
    m = row.get('map')
    if m is None and isinstance(row.get('spec'), Mapping):
        m = row['spec'].get('map')
    if isinstance(m, str):
        return 'fixed'
    if isinstance(m, Mapping):
        ember = m.get('ember') if isinstance(m.get('ember'), Mapping) else {}
        family = ember.get('family', row.get('map_family'))
        if ember.get('hand_made') or family == 'hand':
            return str(m.get('name') or 'hand').split('-')[0] or 'hand'
        if ember.get('generator') or row.get('generator') or family in GENERATOR_FAMILIES:
            return 'generated'
    return 'other'


def balance_band(row: Mapping, balanced=BALANCED, wide=WIDE, tag: str | None = None) -> str:
    """'balanced' | 'wide' | 'outside' | 'unknown': the row's `band` field, its file's tag, else from
    the native hero win probability p (balanced: p in `balanced`; wide: p in `wide` but not `balanced`)."""
    if row.get('band'):
        return str(row['band'])
    if tag:
        return str(tag)
    if row.get('p') is None:
        return 'unknown'
    p = float(row['p'])
    if balanced[0] <= p <= balanced[1]:
        return 'balanced'
    return 'wide' if wide[0] <= p <= wide[1] else 'outside'


def resolve_party_weights(spec: Mapping[str, float], parties: Mapping[str, int]) -> tuple[dict[str, float], list[str]]:
    """{party: weight} for `parties` ({party key: size}) from --party-weights entries.

    An entry names a party ('guy+curogana', any order; weight 0 excludes it) or a party size ('2'): a size's
    weight is split evenly over the parties of that size that no entry names. An optional * gives every
    remaining party the same fallback weight (default 0).
    Returns the weights and notes on entries that match no party (catalogs may still be incomplete)."""
    explicit, sizes, notes = {}, {}, []
    for key, weight in spec.items():
        if weight < 0:
            raise ValueError(f'party weight {key}={weight} is negative')
        if str(key).strip().isdigit():
            sizes[int(key)] = float(weight)
        else:
            explicit[party_key(key)] = float(weight)
    fallback = explicit.pop('*', 0.)
    out = dict.fromkeys(parties, fallback)
    for p, w in explicit.items():
        if p in out:
            out[p] = w
        elif w > 0:
            notes.append(f'party {p} (weight {w}) has no train encounters')
    for size, w in sorted(sizes.items()):
        free = sorted(p for p, n in parties.items() if n == size and p not in explicit)
        if not free:
            if w > 0:
                notes.append(f'party size {size} (weight {w}) has no train encounters')
            continue
        for p in free:
            out[p] = w / len(free)
    uncovered = sorted(p for p, w in out.items() if w == 0 and p not in explicit)
    if uncovered:
        notes.append(f'parties without a weight (never drawn): {uncovered}')
    return out, notes


def _allocate(n: int, weights: Sequence[float], floor: int) -> list[int]:
    """n items over len(weights) cells: `floor` each when n allows, the rest by weight (largest remainder)."""
    c = len(weights)
    base = [floor] * c if floor > 0 and n >= floor * c else [0] * c
    rest, total = n - sum(base), float(sum(weights))
    quotas = [rest * w / total for w in weights]
    counts = [int(np.floor(q)) for q in quotas]
    for i in sorted(range(c), key=lambda i: (-(quotas[i] - counts[i]), i))[:rest - sum(counts)]:
        counts[i] += 1
    return [b + k for b, k in zip(base, counts)]


def _interleave(counts: Sequence[int]) -> list[int]:
    """Cell index per position, len = sum(counts): position k goes to the cell furthest behind its share,
    so every prefix of the list is close to the proportions of `counts` (ties: the lower cell)."""
    n = sum(counts)
    taken = [0] * len(counts)
    out = []
    for k in range(n):
        best = max((c for c in range(len(counts)) if taken[c] < counts[c]),
                   key=lambda c: (counts[c] * (k + 1) / n - taken[c], -c))
        taken[best] += 1
        out.append(best)
    return out


class SpecSource:
    """Episode specs for training (sampled), development and evaluation (fixed, stratified lists).

    Every encounter has strata (`meta`): its party (canonical key and size), map family (`map_family`),
    balance band (`balance_band`), tier and roster size ('3v5'); its cell is '<family>/<party>'.

    Training: without party, family and band weights, a tier is drawn by its weight (default: its number of
    train encounters, i.e. uniform over encounters), then an encounter uniformly: the original rule, with
    the same random draws. With any of them, sampling is nested: a party by --party-weights (see
    `resolve_party_weights`), then a map family by --family-weights, a balance band by --band-weights and a
    tier by --tier-weights, each among the values that still have train encounters (a level without weights
    weighs its values by encounter count), then an encounter uniformly. A missing combination renormalizes
    at the level above, so the party mix is exact. `report()` gives the exact probabilities."""

    LEVELS = ('party', 'family', 'band', 'tier')

    def __init__(self, catalog: Sequence[Mapping], *, train_split='train', tier_weights=None, party_weights=None,
                 family_weights=None, band_weights=None, balanced_range=BALANCED, wide_range=WIDE, tags=None):
        self.rows = {row['id']: dict(row) for row in catalog}
        if not self.rows:
            raise ValueError('empty encounter catalog')
        tags = tags or {}
        self.balanced_range, self.wide_range = parse_range(balanced_range), parse_range(wide_range)
        self.meta = {}
        for eid, row in self.rows.items():
            tag = tags.get(eid, {})
            party, counts = encounter_party(row), roster_counts(row)
            size = len(party) if party else (counts[0] if counts else 0)
            self.meta[eid] = dict(party=party_key(party), size=size, family=map_family(row, tag.get('family')),
                                  band=balance_band(row, self.balanced_range, self.wide_range, tag.get('band')),
                                  tier=str(row.get('tier', 'T0')),
                                  roster='?' if counts is None else f'{counts[0]}v{counts[1]}')
        self.train_split = train_split
        self._cumulative = {}
        train = sorted(r['id'] for r in self.rows.values() if r.get('split', 'train') == train_split)
        if not train:
            raise ValueError(f'catalog has no encounters in split {train_split!r}')
        self.notes = []
        self.nested = bool(party_weights or family_weights or band_weights)
        if self.nested:
            weights = dict(party=self._party_weights(party_weights, train), family=family_weights, band=band_weights,
                           tier=tier_weights)
            for level in ('family', 'band', 'tier'):
                named = set(weights[level] or ()) - {self.meta[e][level] for e in train}
                if named:
                    self.notes.append(f'{level} weights name values without train encounters: {sorted(named)}')
            self.tree = self._build(train, 0, weights)
            if self.tree is None:
                raise ValueError('no train encounter has a positive weight at every level')
            self.train_prob = {}
            self._probabilities(self.tree, 1., self.train_prob)
            by_tier = {}
            for eid in sorted(self.train_prob):
                by_tier.setdefault(self.meta[eid]['tier'], []).append(eid)
            self.tiers = [(t, sum(self.train_prob[e] for e in ids), ids) for t, ids in sorted(by_tier.items())]
        else:
            by_tier = {}
            for eid in train:
                by_tier.setdefault(self.meta[eid]['tier'], []).append(eid)
            if tier_weights:
                unknown = set(tier_weights) - set(by_tier)
                if unknown:
                    raise ValueError(f'tier weights name tiers without train encounters: {sorted(unknown)}')
                self.tiers = [(t, float(w), sorted(by_tier[t])) for t, w in tier_weights.items() if w > 0]
            else:   # uniform over encounters
                self.tiers = [(t, float(len(ids)), sorted(ids)) for t, ids in sorted(by_tier.items())]
            if not self.tiers:
                raise ValueError('no tier with positive weight')
            total = sum(w for _, w, _ in self.tiers)
            self.train_prob = {e: w / total / len(ids) for _, w, ids in self.tiers for e in ids}

    def _party_weights(self, spec, train):
        if not spec:
            return None
        parties = {self.meta[e]['party']: self.meta[e]['size'] for e in train}
        weights, notes = resolve_party_weights(spec, parties)
        self.notes += notes
        return weights

    def _build(self, ids, level, weights):
        """Sampling tree over `ids` from LEVELS[level] down: [(value, weight, child), ...] or, below the last
        level, the sorted ids; None when nothing below can be drawn."""
        if level == len(self.LEVELS):
            return sorted(ids)
        name = self.LEVELS[level]
        given = weights.get(name)
        groups = {}
        for eid in ids:
            groups.setdefault(self.meta[eid][name], []).append(eid)
        children = []
        for value in sorted(groups):
            w = float(len(groups[value])) if given is None else float(given.get(value, 0.))
            if w <= 0:
                continue
            child = self._build(groups[value], level + 1, weights)
            if child is not None:
                children.append((value, w, child))
        return children or None

    def _probabilities(self, node, p, out):
        if node and isinstance(node[0], tuple):
            total = sum(w for _, w, _ in node)
            for _, w, child in node:
                self._probabilities(child, p * w / total, out)
        else:
            for eid in node:
                out[eid] = out.get(eid, 0.) + p / len(node)

    def sample_train(self, rng: random.Random, weights=None) -> EpisodeSpec:
        """One training spec. `weights`: None (an encounter uniformly within the drawn cell or tier, the
        original rule) or (cache key, {encounter: weight}) from `balance.LearnerBalance.weights`: the
        encounter of the drawn cell or tier is then drawn by weight (cumulative sums cached per key)."""
        if self.nested:
            node = self.tree
            while isinstance(node[0], tuple):
                node = rng.choices(node, weights=[w for _, w, _ in node])[0][2]
        else:
            node = rng.choices(self.tiers, weights=[w for _, w, _ in self.tiers])[0][2]
        if weights is None:
            encounter = rng.choice(node)
        else:
            key, table = weights
            cache = self._cumulative.setdefault(key, {})
            cumulative = cache.get(id(node))
            if cumulative is None:
                cumulative = cache[id(node)] = list(itertools.accumulate(table.get(e, 1.) for e in node))
            while len(self._cumulative) > 8:          # only the newest weight versions stay cached
                self._cumulative.pop(next(iter(self._cumulative)))
            encounter = rng.choices(node, cum_weights=cumulative)[0]
        return EpisodeSpec(encounter, rng.randrange(2**31), rng.randrange(2**31), rng.randrange(2**31), -1, -1)

    def train_encounters(self) -> list[str]:
        """The train encounters that sampling can draw."""
        return sorted(self.train_prob)

    def stratum(self, encounter: str) -> str:
        """'<map family>/<party>' of an encounter ('?' if it is not in the catalog)."""
        m = self.meta.get(encounter)
        return '?' if m is None else f"{m['family']}/{m['party']}"

    def report(self) -> dict:
        """Exact training probabilities by party, party size, map family, band and cell, plus notes."""
        def marginal(key, fmt=str):
            out = {}
            for eid, p in self.train_prob.items():
                k = fmt(self.meta[eid][key])
                out[k] = out.get(k, 0.) + p
            return {k: round(v, 5) for k, v in sorted(out.items())}
        cells = {}
        for eid, p in self.train_prob.items():
            cells[self.stratum(eid)] = cells.get(self.stratum(eid), 0.) + p
        train = [e for e, r in self.rows.items() if r.get('split', 'train') == self.train_split]
        excluded = {}
        for eid in train:
            if eid not in self.train_prob:
                key = f"{self.stratum(eid)}/{self.meta[eid]['band']}"
                excluded[key] = excluded.get(key, 0) + 1
        return dict(nested=self.nested, train_encounters=len(train), drawable=len(self.train_prob),
                    party=marginal('party'), size=marginal('size', lambda s: f'size{s}'), family=marginal('family'),
                    band=marginal('band'), cells={k: round(v, 5) for k, v in sorted(cells.items())},
                    excluded=dict(sorted(excluded.items())), notes=list(self.notes))

    def fixed(self, split: str, n: int, seed_base: int, **kwargs) -> list[EpisodeSpec]:
        """n paired specs of `split` at offset (0, 0): `stratified` without its report."""
        return self.stratified(split, n, seed_base, **kwargs)[0]

    def stratified(self, split: str, n: int, seed_base: int, *, bands=None, min_per_cell: int = 0,
                   weights: str = 'train') -> tuple[list[EpisodeSpec], dict]:
        """n paired specs of `split` (offset (0, 0)), stratified by cell ('<map family>/<party>').

        Rows whose band is not in `bands` (None: any band) are left out. Cell weights: 'train' (the cell's
        training probability; cells the training never draws are left out, unless no cell of the split is
        drawn in training, then 'rows'), 'rows' (its number of encounters) or 'equal'. Each kept cell gets
        `min_per_cell` episodes when n allows, the rest in proportion to its weight (largest remainder), and
        the list is interleaved so that every prefix is close to those proportions (the first
        --eval-episodes of a longer list are stratified too). Within a cell, encounters go round-robin in id
        order, and episode k takes its seeds from seed_base + k. With one cell this is the original rule
        exactly: round-robin over the split's sorted ids.

        Returns (specs, report). The report lists per cell, party size and map family the episodes, rows and
        training probability, `uncovered` (cells the training draws that get no episode here) and
        `untrained` (cells of the split left out because training never draws them)."""
        if weights not in ('train', 'rows', 'equal'):
            raise ValueError(f'cell weights are train, rows or equal, not {weights!r}')
        bands = None if bands is None else set(bands)
        ids = sorted(r['id'] for r in self.rows.values() if r.get('split', 'train') == split
                     and (bands is None or self.meta[r['id']]['band'] in bands))
        if not ids:
            raise ValueError(f'catalog has no encounters in split {split!r}'
                             + (f' with bands {sorted(bands)}' if bands is not None else ''))
        cells = {}
        for eid in ids:
            cells.setdefault(self.stratum(eid), []).append(eid)
        trained = {}
        for eid, p in self.train_prob.items():
            trained[self.stratum(eid)] = trained.get(self.stratum(eid), 0.) + p
        mode = weights
        if mode == 'train' and not any(trained.get(c, 0.) > 0 for c in cells):
            mode = 'rows'
        weight = {c: trained.get(c, 0.) if mode == 'train' else float(len(cells[c])) if mode == 'rows' else 1.
                  for c in cells}
        kept = [c for c in sorted(cells) if weight[c] > 0]
        counts = _allocate(n, [weight[c] for c in kept], int(min_per_cell))
        out, taken = [], [0] * len(kept)
        for k, ci in enumerate(_interleave(counts)):
            pool = cells[kept[ci]]
            encounter = pool[taken[ci] % len(pool)]
            taken[ci] += 1
            seed = seed_base + k
            out.append(EpisodeSpec(encounter, _seed('map', encounter, seed), _seed('layout', encounter, seed),
                                   _seed('dice', encounter, seed), 0, 0))
        episodes = dict(zip(kept, counts))
        by_size, by_family = {}, {}
        for c, k in episodes.items():
            m = self.meta[cells[c][0]]
            by_size[f"size{m['size']}"] = by_size.get(f"size{m['size']}", 0) + k
            by_family[m['family']] = by_family.get(m['family'], 0) + k
        report = dict(split=split, n=n, weights=mode, bands=None if bands is None else sorted(bands),
                      min_per_cell=int(min_per_cell),
                      cells={c: dict(episodes=episodes.get(c, 0), encounters=len(cells[c]),
                                     train_probability=round(trained.get(c, 0.), 5)) for c in sorted(cells)},
                      sizes=dict(sorted(by_size.items())), families=dict(sorted(by_family.items())),
                      uncovered=sorted(c for c, p in trained.items() if p > 0 and not episodes.get(c)),
                      untrained=sorted(c for c in cells if c not in episodes))
        return out, report

    def tier(self, encounter: str) -> str:
        return str(self.rows.get(encounter, {}).get('tier', '?'))

    def baseline(self, encounter: str, team: str) -> float | None:
        """Native-vs-native win probability of `team` in this encounter (native eliminations)."""
        row = self.rows.get(encounter)
        if row is None:
            return None
        if isinstance(row.get('baseline'), Mapping) and team in row['baseline']:
            return float(row['baseline'][team])
        if row.get('p') is None:
            return None
        p = float(row['p'])
        return p if team == 'heroes' else 1. - p - float(row.get('truncation', 0.))


OUTCOME_KINDS = ('win', 'loss', 'draw', 'horizon_win', 'horizon_loss', 'horizon_draw', 'truncation')


def breakdown(items: Sequence[Mapping], results: Sequence[tuple[str, float]], specs: SpecSource | None) -> dict:
    """Per-encounter, per-tier, per-cell and per-party-size results plus `excess` (GENERAL_ENV.md §7.4).

    items carry `spec` and `learner_team`; results are (outcome, score) from
    Trainer.eval_outcome. excess = mean(win_i - b_i) over games with a known
    baseline b_i (the learner side's native win probability).

    `per_stratum` ('<map family>/<party>') and `per_size` ('size<n>', heroes in the party) each carry
    their own `excess`, so a strong small-party score cannot hide a weak trio. Single-creature games
    (items with `unit`, the externally played creature's content id) also get `per_kind`, the same
    counts per creature kind with their own `excess`."""
    tables = dict(per_encounter={}, per_tier={}, per_stratum={}, per_size={}, per_kind={})
    with_excess = ('per_stratum', 'per_size', 'per_kind')
    deltas, keyed = [], {name: {} for name in with_excess}
    for item, (outcome, score) in zip(items, results):
        spec = item.get('spec')
        if spec is None:
            continue
        encounter = spec[0]
        keys = dict(per_encounter=encounter, per_tier=specs.tier(encounter) if specs else '?')
        if specs is not None and encounter in specs.meta:
            keys['per_stratum'] = specs.stratum(encounter)
            keys['per_size'] = f"size{specs.meta[encounter]['size']}"
        if 'unit' in item:
            keys['per_kind'] = str(item['unit'])
        for name, key in keys.items():
            row = tables[name].setdefault(key, dict(n=0, score=0., **{k: 0 for k in OUTCOME_KINDS}))
            row['n'] += 1
            row[outcome] += 1
            row['score'] += score
        base = specs.baseline(encounter, item['learner_team']) if specs else None
        if base is not None:
            deltas.append(float(outcome == 'win') - base)
            for name in with_excess:
                if name in keys:
                    keyed[name].setdefault(keys[name], []).append(deltas[-1])
    if not tables['per_encounter']:
        return {}
    for table in tables.values():
        for row in table.values():
            row['mean_score'] = round(row.pop('score') / row['n'], 4)
    for name in with_excess:
        for key, row in tables[name].items():
            values = keyed[name].get(key)
            row['excess'] = round(float(np.mean(values)), 4) if values else None
    out = dict(per_encounter=tables['per_encounter'], per_tier=tables['per_tier'],
               excess=round(float(np.mean(deltas)), 4) if deltas else None, excess_n=len(deltas))
    for name in ('per_stratum', 'per_size', 'per_kind'):
        if tables[name]:
            out[name] = tables[name]
    return out
