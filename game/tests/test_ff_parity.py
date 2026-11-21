"""Full-wire lockstep parity suite between recorded natural20 FFArena sessions and ember_rs.WebGame,
plus free-play lockstep verification between WebGame and BatchEnv.

Asserts exact step-by-step agreement across the ENTIRE wire payload (ignoring only
per-session random `csrf_token`, `encounter_id`, and the `"engine": "ember-rs"` tag):
- initial state and every step's `log` (including dice strings, saves, hit rolls, death saves,
  Turn Undead expiry, Graze, Aid, Strength Drain, Rage/Reckless/Frenzy/Cleave),
- `setup`, `objects`, `map`, `level`, `resources`, `forces`, `areas`, `initiative_draws`,
- full `units` on every step (`x`, `y`, `sheet`, `model`, `description`, `marks`,
  `conditions`, `hp`, `max_hp`, `ac`, `alive`, `dead`, `str_loss`, `initiative`),
- `actions` and `action_defs`,
- every `timeline` record (exact key set, `before`, `after`, `moves`, `draws`, `effects`),
- exact `ValueError` message strings and unchanged `revision` on rejected requests,
- all seven private mausoleum rooms (`fixtures/private/`),
- and exact free-play agreement between `FFArena` (`WebGame`) and `ember_rs.BatchEnv`
  (every drawn die `(who, sides, mode, value)`, every unit's final HP, `winner`, and `round`).
"""
from __future__ import annotations

from functools import lru_cache
import json
import os
from pathlib import Path

import ember_rs
import pytest

from game import catalogue
from game.arena import FFArena

FIXTURES_DIR = Path(__file__).resolve().parent / 'fixtures'
IGNORE_TOP_KEYS = frozenset({'csrf_token', 'encounter_id', 'engine'})
PRIVATE_ROOMS = (
    'mausoleum-catacombs-northeast',
    'mausoleum-catacombs-southwest',
    'mausoleum-chapel',
    'mausoleum-crypts',
    'mausoleum-forecourt',
    'mausoleum-hall',
    'mausoleum-rotunda',
)


def discover_fixtures() -> list[Path]:
    paths = sorted((FIXTURES_DIR / 'public').glob('*.json'))
    priv_dir = FIXTURES_DIR / 'private'
    if priv_dir.is_dir():
        paths += sorted(priv_dir.glob('*.json'))
    return paths


@lru_cache(maxsize=1)
def _all_levels():
    return catalogue.load(include_private=True)


def build_replay_level(doc: dict) -> catalogue.Level:
    spec_level = doc['spec']['level'] if 'spec' in doc else doc['level_source']
    if spec_level['kind'] == 'catalogue':
        level = _all_levels()[(spec_level['encounter'], spec_level['preset'])]
        # Older recordings stored the catalogue label only in their initial state.
        difficulty = (spec_level['difficulty'] if 'difficulty' in spec_level
                      else doc['initial_wire']['level']['difficulty'])
        preset = dict(level.preset, difficulty=difficulty)
        return catalogue.Level(level.encounter, preset, level.rows, level.scene, level.map_name)
    encounter = (
        spec_level['encounter']
        if isinstance(spec_level.get('encounter'), dict)
        else {
            'id': spec_level.get('encounter_id', 'audit'),
            'name': 'Audit',
            'map': 'audit',
            'theme': spec_level.get('theme', 'ossuary'),
            'blurb': '',
            'presets': [],
        }
    )
    preset = (
        spec_level['preset']
        if isinstance(spec_level.get('preset'), dict)
        else {
            'id': 'p',
            'name': 'P',
            'difficulty': 'Easy',
            'blurb': '',
            'party': spec_level['party'],
            'roster': spec_level['roster'],
            'placements': spec_level['placements'],
        }
    )
    scene = spec_level.get('scene') or {'props': []}
    return catalogue.Level(encounter, preset, spec_level['rows'], scene, 'audit')


def collect_all_draws(doc: dict) -> list[dict]:
    if 'draws' in doc:
        return doc['draws']
    draws: list[dict] = []
    for step in doc['steps']:
        w = step.get('wire')
        if not w:
            continue
        if step['op'] == 'start':
            draws.extend(w.get('initiative_draws', []))
        for rec in w.get('timeline', []):
            draws.extend(rec.get('draws', []))
    draws.extend(doc.get('trailing_draws', []))
    return draws


def assert_exact_json(ctx: str, got, exp) -> None:
    if type(got) is not type(exp):
        raise AssertionError(f'{ctx}: type {type(got).__name__} != {type(exp).__name__}: got={got!r} exp={exp!r}')
    if isinstance(got, dict):
        if set(got.keys()) != set(exp.keys()):
            only_got = sorted(set(got.keys()) - set(exp.keys()))
            only_exp = sorted(set(exp.keys()) - set(got.keys()))
            raise AssertionError(f'{ctx}: dict keys differ: only_got={only_got} only_exp={only_exp}')
        for k in exp:
            assert_exact_json(f'{ctx}.{k}', got[k], exp[k])
        return
    if isinstance(got, list):
        if len(got) != len(exp):
            raise AssertionError(f'{ctx}: list len {len(got)} != {len(exp)}: got={got[:3]!r} exp={exp[:3]!r}')
        for i, (g, e) in enumerate(zip(got, exp)):
            assert_exact_json(f'{ctx}[{i}]', g, e)
        return
    if got != exp:
        raise AssertionError(f'{ctx}: got={got!r} != exp={exp!r}')


def assert_full_wire_parity(ctx: str, got: dict, exp: dict) -> None:
    assert got.get('engine', '').startswith('ember-rs'), f'{ctx}: missing engine=ember-rs*: {got.get("engine")!r}'
    got_clean = {k: v for k, v in got.items() if k not in IGNORE_TOP_KEYS}
    exp_clean = {k: v for k, v in exp.items() if k not in IGNORE_TOP_KEYS}
    # Fast C-serialized equality check (distinguishes int/float/bool/None, exact dict keys, and list order);
    # falls through to recursive assert_exact_json on any difference for pinpoint path diagnostics.
    if json.dumps(got_clean, sort_keys=True) != json.dumps(exp_clean, sort_keys=True):
        assert_exact_json(ctx, got_clean, exp_clean)


def test_current_web_replay_preserves_selected_hero_level():
    level = _all_levels()[('crypt', 'bone_patrol')].with_hero_level(3)
    live = FFArena(level, seed=4)
    initial = live.wire(live.state())
    started = live.wire(live.start())
    draws = collect_all_draws({'steps': [{'op': 'start', 'wire': started}]})
    replay = FFArena(level, replay_draws=draws, replay_version=ember_rs.WEB_REPLAY_VERSION)
    assert_full_wire_parity('setup', replay.wire(replay.state()), initial)
    assert_full_wire_parity('start', replay.wire(replay.start()), started)
    assert replay.remaining_replay_draws() == 0


def test_replay_difficulty_comes_from_the_recorded_spec():
    live = _all_levels()[('crypt', 'ghoul_pack')]
    current = live.preset['difficulty']
    archived = next(label for label in catalogue.DIFFICULTIES if label != current)
    source = {'kind': 'catalogue', 'encounter': 'crypt', 'preset': 'ghoul_pack', 'difficulty': archived}
    replay = build_replay_level({'spec': {'level': source}, 'initial_wire': {'level': live.view()}})
    assert replay.view()['difficulty'] == archived
    assert live.view()['difficulty'] == current


def test_private_parity_fixtures_cover_all_seven_mausoleum_rooms():
    priv_dir = FIXTURES_DIR / 'private'
    priv_files = sorted(priv_dir.glob('*.json')) if priv_dir.is_dir() else []
    if os.environ.get('FF_PRIVATE_ENCOUNTERS') == '1':
        assert len(priv_files) >= 7, 'FF_PRIVATE_ENCOUNTERS=1 requires parity fixtures for all 7 private rooms'
    assert len(priv_files) >= 7, f'expected >= 7 private fixtures, found {len(priv_files)}'
    seen_rooms = set()
    for p in priv_files:
        doc = json.loads(p.read_text(encoding='utf-8'))
        lvl = doc.get('spec', {}).get('level') or doc.get('level_source', {})
        if lvl.get('kind') == 'catalogue':
            seen_rooms.add(lvl['encounter'])
    assert set(PRIVATE_ROOMS) <= seen_rooms, f'missing private room fixtures: {set(PRIVATE_ROOMS) - seen_rooms}'


@pytest.mark.parametrize('fixture_path', discover_fixtures(), ids=lambda p: f'{p.parent.name}/{p.stem}')
def test_oracle_session_full_wire_lockstep_parity(fixture_path: Path):
    doc = json.loads(fixture_path.read_text(encoding='utf-8'))
    seed = doc['spec']['seed'] if 'spec' in doc else doc['seed']
    level = build_replay_level(doc)
    draws = collect_all_draws(doc)
    game = FFArena(level, seed=seed, revision=0, csrf_token='oracle-csrf', replay_draws=draws,
                   replay_version=doc.get('replay_version', 1))

    init_got = game.wire(game.state())
    assert_full_wire_parity(f'{fixture_path.stem}:initial', init_got, doc['initial_wire'])

    for si, step in enumerate(doc['steps']):
        op = step['op']
        args = step['args']
        ctx = f'{fixture_path.stem}:step[{si}]({op})'
        if 'error' in step:
            rev_before = game.revision
            with pytest.raises(ValueError) as exc_info:
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
            assert str(exc_info.value) == step['error'], (
                f'{ctx}: error message got={str(exc_info.value)!r} != exp={step["error"]!r}'
            )
            assert game.revision == rev_before, f'{ctx}: rejected op mutated revision'
            continue

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
        got = game.wire(raw)
        assert_full_wire_parity(ctx, got, step['wire'])

    assert game.remaining_replay_draws() == 0, (
        f'{fixture_path.stem}: {game.remaining_replay_draws()} replay draws were left unconsumed'
    )


def _draw_tuple(d: dict) -> tuple:
    v = d['v']
    return (d.get('who') or '', int(d['sides']), d['mode'], tuple(v) if isinstance(v, list) else v)


@pytest.mark.parametrize('encounter,preset', [
    ('crypt', 'bone_patrol'),
    ('crypt', 'whole_crypt'),
    ('crypt', 'mummies_tomb'),
    ('vault', 'goblin_raiders'),
    ('vault', 'warband'),
    ('vault', 'three_bosses'),
])
def test_web_game_free_play_matches_batch_env_lockstep(encounter: str, preset: str, tmp_path: Path):
    levels = catalogue.load(include_private=False)
    level = levels[(encounter, preset)]
    at = {p['id']: (p['x'], p['y']) for p in level.suggested_placements()}
    heroes = [{'id': h, 'content': h, 'x': at[h][0], 'y': at[h][1]} for h in level.preset['party']]
    monsters = []
    counts: dict[str, int] = {}
    for c in level.preset['roster']:
        counts[c] = counts.get(c, 0) + 1
        uid = f'{c}-{counts[c]}'
        monsters.append({'id': uid, 'content': c, 'x': at[uid][0], 'y': at[uid][1]})
    row = {
        'id': f'{encounter}-{preset}',
        'tier': 'T0',
        'split': 'test',
        'spec': {
            'version': 1,
            'map': {'name': level.map_name, 'rows': level.rows},
            'heroes': heroes,
            'monsters': monsters,
        },
        'layout': {'rule': 'fixed'},
        'max_rounds': 10_000,
    }
    env = ember_rs.BatchEnv(n_slots=1, catalog=[row], objective='native', max_rounds=10_000, threads=1)

    for seed in (1, 2, 3):
        game = FFArena(level, seed=seed)
        st = game.start()
        web_draws = [_draw_tuple(d) for d in st['initiative_draws']]
        seen_rec_ids: set[int] = set()

        def harvest(state_dict: dict) -> None:
            for rec in state_dict['timeline']:
                if rec['id'] not in seen_rec_ids:
                    seen_rec_ids.add(rec['id'])
                    web_draws.extend(_draw_tuple(d) for d in rec['draws'])

        harvest(st)
        while not game.finished:
            harvest(game.advance(autoplay=True))
        final_state = game.state()
        web_hp = {u['id']: u['hp'] for u in final_state['units']}

        info = env.reset(
            [0],
            [{'encounter': row['id'], 'map_seed': 0, 'layout_seed': 0, 'dice_seed': seed, 'offset_x': 0, 'offset_y': 0}],
            [{'heroes': 'native', 'monsters': 'native'}],
        )
        assert bool(info['done'][0]) and bool(info['terminated'][0])

        tape_file = tmp_path / f'{encounter}_{preset}_s{seed}.jsonl'
        env.record(0, str(tape_file))
        env_draws = []
        env_hp: dict[str, int] = {}
        for line in tape_file.read_text(encoding='utf-8').splitlines():
            ev = json.loads(line)
            if ev.get('t') == 'draw':
                env_draws.append(_draw_tuple(ev))
            elif ev.get('t') == 'state':
                env_hp = {u['id']: u['hp'] for u in ev.get('units', [])}

        assert web_draws == env_draws, (
            f'{encounter}/{preset} seed={seed}: dice diverged ({len(web_draws)} vs {len(env_draws)} draws)'
        )
        assert web_hp == {k: v for k, v in env_hp.items() if k in web_hp}, (
            f'{encounter}/{preset} seed={seed}: final HP diverged: web={web_hp} env={env_hp}'
        )
        w_code = int(info['winner'][0])
        env_winner = 'heroes' if w_code == 0 else ('monsters' if w_code == 1 else None)
        assert final_state['winner'] == env_winner, (encounter, preset, seed, final_state['winner'], env_winner)
        # FFArena's wire `round` is natural20's 0-based `battle.current_round()`; BatchEnv's `info['round']` is 1-based (`round + 1`).
        assert final_state['round'] + 1 == int(info['round'][0]), (
            encounter, preset, seed, final_state['round'], int(info['round'][0])
        )
