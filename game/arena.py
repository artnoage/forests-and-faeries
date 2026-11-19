"""Python adapter around ``ember_rs.WebGame`` matching ``FFArena``."""
from __future__ import annotations

import json
import secrets

import ember_rs


class FFArena:
    """One Forests and Faeries game session backed by ``ember_rs.WebGame``."""

    def __init__(self, level, seed=None, revision=0, csrf_token=None, replay_draws=None):
        self.level = level
        actual_seed = secrets.randbelow(2**31) if seed is None else int(seed)
        token = csrf_token or secrets.token_urlsafe(32)
        encounter_token = secrets.token_urlsafe(24)
        replay_json = json.dumps(replay_draws) if replay_draws is not None else None
        self._game = ember_rs.WebGame(
            level.to_rust_json(),
            seed=actual_seed,
            revision=int(revision),
            csrf_token=token,
            encounter_id=encounter_token,
            replay_draws_json=replay_json,
        )
        self._in_setup = True
        counts: dict[str, int] = {}
        monsters = []
        for kind in level.preset['roster']:
            counts[kind] = counts.get(kind, 0) + 1
            monsters.append(f'{kind}-{counts[kind]}')
        self._unit_ids = frozenset([*level.preset['party'], *monsters])
        self._height = len(level.rows)
        self._width = len(level.rows[0]) if self._height else 0

    @property
    def revision(self):
        return self._game.revision

    @property
    def csrf_token(self):
        return self._game.csrf_token

    @property
    def encounter_id(self):
        return self._game.encounter_id

    @property
    def finished(self):
        return self._game.finished

    @property
    def winner(self):
        return self._game.winner

    @property
    def timeline(self):
        return self.state()['timeline']

    @property
    def initiative_draws(self):
        return self.state()['initiative_draws']

    def remaining_replay_draws(self):
        return self._game.remaining_replay_draws()

    def state(self):
        return self._game.state()

    def wire(self, payload):
        return self._game.wire_json(json.dumps(payload))

    def _prevalidate_setup(self, placements, monster_control):
        """Match live ``Arena._validate_placements`` before JSON serialization so
        non-standard JSON values (NaN, Infinity, huge integers, lone surrogates)
        produce identical domain ValueError messages."""
        if not self._in_setup:
            raise ValueError('Placement is only available during setup.')
        if not isinstance(monster_control, str) or monster_control not in ('ai', 'manual'):
            raise ValueError('monster_control must be ai or manual.')
        if not isinstance(placements, list) or len(placements) > len(self._unit_ids):
            raise ValueError(f'placements must be a list of at most {len(self._unit_ids)} figures.')
        seen = set()
        for placement in placements:
            if not isinstance(placement, dict) or set(placement) != {'id', 'x', 'y'}:
                raise ValueError('Each placement requires only id, x and y.')
            uid, x, y = placement['id'], placement['x'], placement['y']
            if not isinstance(uid, str) or uid not in self._unit_ids or uid in seen:
                raise ValueError('Unknown or duplicate figure.')
            if type(x) is not int or type(y) is not int or not (0 <= x < self._width and 0 <= y < self._height):
                raise ValueError('Placement coordinates must be in-bounds integers.')
            seen.add(uid)

    def configure(self, placements, monster_control):
        self._prevalidate_setup(placements, monster_control)
        return self._game.configure(json.dumps(placements), json.dumps(monster_control))

    def start(self):
        result = self._game.start()
        self._in_setup = False
        return result

    def perform(self, action_id):
        if not isinstance(action_id, str):
            raise ValueError('Unknown or unavailable action.')
        try:
            action_id.encode('utf-8')
        except UnicodeEncodeError:
            if not self.state().get('can_act'):
                raise ValueError('It is not a human-controlled combat turn.') from None
            raise ValueError('Unknown or unavailable action.') from None
        return self._game.perform(action_id)

    def end_turn(self):
        return self._game.end_turn()

    def advance(self, autoplay=False):
        return self._game.advance(autoplay=bool(autoplay))
