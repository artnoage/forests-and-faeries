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


def test_v19_hidden_monster_game_replays_from_recorded_draws():
    """Verify reed_lock/l3_the_final_passage_v3 (seed 5, where Goblin Minion 1 hides)
    redacts hidden-monster turns on the wire and replays verbatim from recorded_draws."""
    level = _all_levels()[('reed_lock', 'l3_the_final_passage_v3')]
    live = FFArena(level, seed=5)
    initial = live.wire(live.state())
    steps = [('start', live.wire(live.start()))]
    saw_hidden_turn = False
    all_goblins = {p['id'] for p in level.suggested_placements() if p['id'].startswith('goblin')}
    for _ in range(60):
        if live.finished:
            break
        w = live.wire(live.advance(autoplay=True))
        steps.append(('advance', w))
        # Whenever a goblin is hidden during the battle, verify its unit id is absent from wire.
        if not live.finished:
            visible_ids = {u['id'] for u in w['units']}
            hidden_ids = all_goblins - visible_ids
            if hidden_ids:
                saw_hidden_turn = True
                wire_text = json.dumps(w)
                for hid in hidden_ids:
                    assert hid not in wire_text, f'hidden id {hid} leaked into wire'
                for rec in w['timeline']:
                    assert all(d.get('who') not in hidden_ids and d.get('who') != '' for d in rec.get('draws', []))
    assert saw_hidden_turn, 'expected at least one hidden-monster step in reed_lock seed 5'

    draws = live.recorded_draws
    replay = FFArena(level, replay_draws=draws, replay_version=ember_rs.WEB_REPLAY_VERSION)
    assert_full_wire_parity('setup', replay.wire(replay.state()), initial)
    for idx, (op, expected) in enumerate(steps):
        got = replay.wire(replay.start() if op == 'start' else replay.advance(autoplay=True))
        assert_full_wire_parity(f'step[{idx}]({op})', got, expected)
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
    env = ember_rs.BatchEnv(
        n_slots=1,
        catalog=[row],
        objective='native',
        max_rounds=10_000,
        threads=1,
        rule_version=ember_rs.CURRENT_RULE_VERSION,
    )

    for seed in (1, 2, 3):
        game = FFArena(level, seed=seed)
        game.start()
        while not game.finished:
            game.advance(autoplay=True)
        web_draws = [_draw_tuple(d) for d in game.recorded_draws]
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


def _token_mentioned(text: str, needle: str, visible_needles: list[str]) -> bool:
    if not needle:
        return False
    tok = lambda ch: ch.isalnum() or ch in ('_', '-')
    pos = 0
    while True:
        idx = text.find(needle, pos)
        if idx < 0:
            return False
        end = idx + len(needle)
        left_ok = idx == 0 or not tok(text[idx - 1])
        right_ok = end == len(text) or not tok(text[end])
        if left_ok and right_ok:
            shadowed = False
            for vis in visible_needles:
                if len(vis) <= len(needle) or needle not in vis:
                    continue
                vpos = 0
                while True:
                    vidx = text.find(vis, vpos)
                    if vidx < 0:
                        break
                    vend = vidx + len(vis)
                    if vidx <= idx and end <= vend:
                        vl = vidx == 0 or not tok(text[vidx - 1])
                        vr = vend == len(text) or not tok(text[vend])
                        if vl and vr:
                            shadowed = True
                            break
                    vpos = vidx + 1
                if shadowed:
                    break
            if not shadowed:
                return True
        pos = idx + 1


def test_v19_hidden_monsters_never_leak_on_wire_across_all_levels():
    """Play hidden-monster games across every public level (including bell_court seed 23
    and split_kiln/l3_the_shattered_glaze_v3 seed 10) and grep the wire for any hidden
    unit's id or display name, plus verify hidden turns send blank menu/resources."""
    levels = catalogue.load(include_private=False)
    hiding_contents = {'goblin_minion', 'goblin_warrior', 'goblin_boss', 'shadow'}
    targeted_seeds: dict[tuple[str, str], list[int]] = {
        ('bell_court', 'l1_the_side_gate_v3'): [23, 5],
        ('split_kiln', 'l3_the_shattered_glaze_v3'): [10, 5],
        ('reed_lock', 'l3_the_final_passage_v3'): [5, 1],
    }
    cases: list[tuple[tuple[str, str], list[int]]] = []
    for key, level in sorted(levels.items()):
        roster = set(level.preset.get('roster') or [])
        if key in targeted_seeds:
            cases.append((key, targeted_seeds[key]))
        elif roster & hiding_contents:
            cases.append((key, [1, 5, 10]))
        else:
            cases.append((key, [1]))

    blank_res = {'action': 0, 'bonus_action': 0, 'reaction': 0, 'movement': 0}
    hidden_steps_checked = 0
    hidden_turns_checked = 0

    for key, seeds in cases:
        level = levels[key]
        for seed in seeds:
            game = FFArena(level, seed=seed)
            init_wire = game.wire(game.state())
            roster_monsters = {
                u['id']: u['name']
                for u in init_wire['setup']['roster']
                if u['team'] != 'heroes'
            }
            w = game.wire(game.start())
            prev_hidden: set[str] = set()
            prev_log_id = max((e['id'] for e in w['log']), default=0)

            for step in range(80):
                if w.get('phase') == 'finished' or game.finished:
                    break
                visible_ids = {u['id'] for u in w['units'] if u['team'] != 'heroes'}
                hidden_now = set(roster_monsters) - visible_ids
                visible_names = [u['name'] for u in w['units']] + [u['id'] for u in w['units']]

                if hidden_now:
                    hidden_steps_checked += 1
                    # Leak E: whenever turn_id is null on a live turn, menu & resources must be blank.
                    if w['turn_id'] is None:
                        hidden_turns_checked += 1
                        assert w['actions'] == [], f'{key} s{seed} step {step}: hidden turn leaked actions'
                        assert w['action_defs'] == [], f'{key} s{seed} step {step}: hidden turn leaked action_defs'
                        assert w['resources'] == blank_res, f'{key} s{seed} step {step}: hidden turn leaked resources={w["resources"]}'

                    # Dynamic wire payload (everything except historical `log` and static
                    # catalogue `level` metadata) must contain NO hidden id or display name.
                    non_log = {k: v for k, v in w.items() if k not in ('log', 'level')}
                    body_str = json.dumps(non_log, sort_keys=True)
                    new_logs = [e['text'] for e in w['log'] if e['id'] > prev_log_id]
                    for hid in sorted(hidden_now):
                        hname = roster_monsters[hid]
                        assert hid not in body_str, f'{key} s{seed} step {step}: hidden id {hid} leaked in wire'
                        assert not _token_mentioned(body_str, hname, visible_names), (
                            f'{key} s{seed} step {step}: hidden name {hname!r} leaked in wire'
                        )
                        if hid in prev_hidden:
                            for line in new_logs:
                                assert hid not in line, f'{key} s{seed} step {step}: hidden id {hid} leaked in log: {line}'
                                assert not _token_mentioned(line, hname, visible_names), (
                                    f'{key} s{seed} step {step}: hidden name {hname!r} leaked in log: {line}'
                                )
                        else:
                            # Monster transitioned visible -> hidden during this turn: once it
                            # slips out of sight, no subsequent line on this turn may name it,
                            # and its Stealth roll total ("vs DC 15") must never appear.
                            slipped = False
                            for line in new_logs:
                                if _token_mentioned(line, hname, visible_names):
                                    assert 'vs DC 15' not in line, (
                                        f'{key} s{seed} step {step}: Hide leaked Stealth roll for {hname!r}: {line}'
                                    )
                                    if slipped:
                                        raise AssertionError(
                                            f'{key} s{seed} step {step}: {hname!r} named after slipping out of sight: {line}'
                                        )
                                    if 'slips out of sight.' in line:
                                        slipped = True

                prev_hidden = hidden_now
                prev_log_id = max((e['id'] for e in w['log']), default=prev_log_id)
                w = game.wire(game.advance(autoplay=True))

    assert hidden_steps_checked > 0, 'sweep must exercise hidden-monster steps across levels'
    assert hidden_turns_checked > 0, 'sweep must exercise hidden-monster turns (Leak E)'


def test_batch_env_rule_version_isolation_and_rule17_curogana_compat(tmp_path: Path):
    """BatchEnv defaults to rule 17 (r4 parity), supports explicit rule 18, accepts
    the frozen rule-17 curogana.json pack for rule 17 only, and stamps each tape
    header with the matching Natural20 commit."""
    assert ember_rs.DEFAULT_BATCH_RULE_VERSION == 17
    assert ember_rs.CURRENT_RULE_VERSION >= 19

    row = {
        'id': 'rule-version-smoke',
        'tier': 'T0',
        'split': 'test',
        'spec': {
            'version': 1,
            'map': {'name': 'open', 'rows': ['........', '........', '........', '........']},
            'heroes': [{'id': 'curogana', 'content': 'curogana', 'x': 1, 'y': 1}],
            'monsters': [{'id': 'skeleton-1', 'content': 'skeleton', 'x': 5, 'y': 1}],
        },
        'layout': {'rule': 'fixed'},
        'max_rounds': 30,
    }
    spec = [{'encounter': row['id'], 'map_seed': 0, 'layout_seed': 0, 'dice_seed': 1, 'offset_x': 0, 'offset_y': 0}]
    ctrl = [{'heroes': 'native', 'monsters': 'native'}]

    # Default BatchEnv runs rule 17 and stamps the r4 First Aid pin on recorded tapes.
    env17 = ember_rs.BatchEnv(n_slots=1, catalog=[row], threads=1)
    assert env17.rule_version == 17
    env17.reset([0], spec, ctrl)
    tape17 = tmp_path / 'r17.jsonl'
    env17.record(0, str(tape17))
    hdr17 = json.loads(tape17.read_text(encoding='utf-8').splitlines()[0])
    assert hdr17['version'] == 17
    assert hdr17['n20_commit'] == 'ef91112bf07b933734bff12a94d7e724ca8f3fee'

    # Explicit rule 18/19 preserve c0025a88; rule 20 preserves ddb92d5a; rule 21 stamps the current pin.
    rule_pins = {
        17: 'ef91112bf07b933734bff12a94d7e724ca8f3fee',
        18: 'c0025a88679950621baa29a64a66e1aadcd40ea9',
        19: 'c0025a88679950621baa29a64a66e1aadcd40ea9',
        20: 'ddb92d5a0cd6401e27530ccb1e5b956c7771dfbf',
        21: ember_rs.NATURAL20_COMMIT,
    }
    for rv in (18, 19, 20, 21):
        expected_commit = rule_pins[rv]
        env_v = ember_rs.BatchEnv(n_slots=1, catalog=[row], threads=1, rule_version=rv)
        assert env_v.rule_version == rv
        env_v.reset([0], spec, ctrl)
        tape_v = tmp_path / f'r{rv}.jsonl'
        env_v.record(0, str(tape_v))
        hdr_v = json.loads(tape_v.read_text(encoding='utf-8').splitlines()[0])
        assert hdr_v['version'] == rv
        assert hdr_v['n20_commit'] == expected_commit

    # Every rule-version pin must match real provenance / reference history (never a typo or made-up hash).
    repo_root = Path(__file__).resolve().parents[2]
    ref_pin = (repo_root / 'engine' / 'reference' / 'NATURAL20_COMMIT').read_text(encoding='utf-8').strip()
    assert rule_pins[21] == ref_pin
    srd_commits = {
        json.loads(p.read_text(encoding='utf-8')).get('provenance', {}).get('natural20_commit')
        for p in (repo_root / 'engine' / 'content' / 'srd').glob('*.json')
    }
    assert rule_pins[18] in srd_commits, f'rule 18/19 pin {rule_pins[18]} not found in engine/content/srd provenance'
    assert rule_pins[21] in srd_commits, f'rule 21 pin {rule_pins[21]} not found in engine/content/srd provenance'
    if (repo_root / '.git').exists():
        import subprocess
        hist = subprocess.check_output(
            ['git', '-C', str(repo_root), 'log', '--format=', '-p', 'engine/reference/NATURAL20_COMMIT'],
            text=True,
        )
        for rv, sha in rule_pins.items():
            assert len(sha) == 40 and all(c in '0123456789abcdef' for c in sha), f'rule {rv} pin malformed: {sha}'
            if rv < 21:
                assert sha in hist, f'rule {rv} pin {sha} not found in engine/reference/NATURAL20_COMMIT git history'
    priv_repo = repo_root.parent / 'forests-and-faeries-private'
    if (priv_repo / '.git').exists():
        import subprocess
        for rv, sha in rule_pins.items():
            rc = subprocess.run(
                ['git', '-C', str(priv_repo), 'cat-file', '-e', f'{sha}^{{commit}}'],
                capture_output=True,
            ).returncode
            assert rc == 0, f'rule {rv} pin {sha} does not resolve in reference repository'

    # Rule-17 content/srd directory containing the 09bec740 curogana.json (burning_hands)
    # loads cleanly for rule_version=17 and is rejected for rule_version=18.
    srd_dir = tmp_path / 'content' / 'srd'
    srd_dir.mkdir(parents=True)
    cur_curo = json.loads((repo_root / 'engine' / 'content' / 'srd' / 'curogana.json').read_text(encoding='utf-8'))
    cur_curo['provenance']['natural20_commit'] = '09bec740a7c0da50ab6618a233fd635eb1169334'
    cur_curo['spellcasting']['spells'] = [
        'burning_hands' if s == 'see_invisibility' else s for s in cur_curo['spellcasting']['spells']
    ]
    cur_curo['spellcasting']['spell_info'] = [
        {
            'id': 'burning_hands',
            'name': 'Burning Hands',
            'level': 1,
            'casting_time': '1:action',
            'concentration': False,
            'sorcerer_spell': True,
        }
        if d.get('id') == 'see_invisibility'
        else d
        for d in cur_curo['spellcasting']['spell_info']
    ]
    (srd_dir / 'curogana.json').write_text(json.dumps(cur_curo, indent=1) + '\n', encoding='utf-8')
    pool17 = ember_rs.ContentPool([str(srd_dir)])
    assert pool17.max_rule_version == 17
    env_from_17 = ember_rs.BatchEnv(n_slots=1, content=pool17, catalog=[row], threads=1)
    assert env_from_17.rule_version == 17
    with pytest.raises(ValueError, match='rule-18 content pack'):
        ember_rs.BatchEnv(n_slots=1, content=pool17, catalog=[row], threads=1, rule_version=18)
    with pytest.raises(ValueError, match='rule-19 content pack'):
        ember_rs.BatchEnv(n_slots=1, content=pool17, catalog=[row], threads=1, rule_version=19)
