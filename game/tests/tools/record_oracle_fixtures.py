#!/usr/bin/env python3
"""Record deterministic natural20 FFArena oracle fixtures and verify per-fixture mechanics.

Runs against a checkout of the reference natural20 repository (passed via
``--reference-root``) and writes unstripped full-wire session JSON fixtures for
``game/tests/test_ff_parity.py`` and ``game/tests/tools/verify_replay.py``.

Usage:
    # Regenerate the entire public + private fixture suite from scratch:
    python3 game/tests/tools/record_oracle_fixtures.py \\
        --reference-root /path/to/reference-repo \\
        --out-dir game/tests/fixtures \\
        --suite all

    # Record only the targeted mechanic fixtures:
    python3 game/tests/tools/record_oracle_fixtures.py \\
        --reference-root /path/to/reference-repo \\
        --out-dir game/tests/fixtures \\
        --suite targeted
"""
from __future__ import annotations

import argparse
import collections
from concurrent.futures import ProcessPoolExecutor
import json
from pathlib import Path
import random
import shutil
import sys

_REF_CATALOGUE = None
_REF_ARENA_CLS = None


def _init_ref(reference_root: str) -> None:
    global _REF_CATALOGUE, _REF_ARENA_CLS
    if _REF_ARENA_CLS is not None:
        return
    if reference_root not in sys.path:
        sys.path.insert(0, reference_root)
    from webgame.ff import catalogue as cat_mod  # type: ignore
    from webgame.ff.arena import FFArena as arena_cls  # type: ignore

    _REF_CATALOGUE = cat_mod
    _REF_ARENA_CLS = arena_cls


def box(w: int, h: int) -> list[str]:
    return ['H' * w] + ['H' + '.' * (w - 2) + 'H' for _ in range(h - 2)] + ['H' * w]


def cat(enc: str, preset: str) -> dict:
    return {'kind': 'catalogue', 'encounter': enc, 'preset': preset}


def level_of(spec_lvl: dict):
    assert _REF_CATALOGUE is not None
    if spec_lvl['kind'] == 'catalogue':
        return _REF_CATALOGUE.load(include_private=True)[(spec_lvl['encounter'], spec_lvl['preset'])]
    encounter = {
        'id': spec_lvl.get('encounter_id', 'audit'),
        'name': 'Audit',
        'map': 'audit',
        'theme': spec_lvl.get('theme', 'ossuary'),
        'blurb': '',
        'presets': [],
    }
    preset = {
        'id': 'p',
        'name': 'P',
        'difficulty': 'Easy',
        'blurb': '',
        'party': spec_lvl['party'],
        'roster': spec_lvl['roster'],
        'placements': spec_lvl['placements'],
    }
    return _REF_CATALOGUE.Level(encounter, preset, spec_lvl['rows'], {'props': []}, 'audit')


def expand_rows(wire: dict) -> list[dict]:
    defs = wire.get('action_defs') or []
    out = []
    for r in wire.get('actions') or []:
        d = dict(defs[r['d']])
        for k, v in r.items():
            if k != 'd':
                d[k] = v
        if 'target_id' not in d and d.get('target_ids'):
            d['target_id'] = d['target_ids'][0]
        out.append(d)
    return out


def choose(rng: random.Random, wire: dict, policy: dict, step_idx: int) -> tuple[str, dict]:
    rows = expand_rows(wire)
    kind = policy['kind']
    if kind == 'native':
        return ('advance', {'autoplay': True})
    if kind == 'prefer':
        for want in policy['prefer']:
            for r in rows:
                if r.get('kind') == want or r.get('spell') == want or r.get('label') == want:
                    return ('perform', {'action_id': r['id']})
        if policy.get('then') == 'native':
            return ('advance', {'autoplay': True})
        return ('end_turn', {})
    if kind == 'chruna_showcase':
        if wire.get('turn_id') == 'chruna':
            if wire.get('round', 0) == 1:
                ext = next((r for r in rows if r.get('kind') == 'extend_rage'), None)
                return ('perform', {'action_id': ext['id']}) if ext else ('end_turn', {})
            for want in ('cleave', 'rage', 'reckless_attack', 'attack'):
                cand = next((r for r in rows if r.get('kind') == want), None)
                if cand:
                    return ('perform', {'action_id': cand['id']})
            return ('end_turn', {})
        return ('advance', {'autoplay': True})
    if kind == 'chruna_move_closes_cleave':
        if wire.get('turn_id') == 'chruna':
            if any(r.get('kind') == 'cleave' for r in rows):
                mv = next((r for r in rows if r.get('kind') == 'move'), None)
                if mv:
                    return ('perform', {'action_id': mv['id']})
            for want in ('rage', 'attack'):
                cand = next((r for r in rows if r.get('kind') == want), None)
                if cand:
                    return ('perform', {'action_id': cand['id']})
            return ('end_turn', {})
        return ('advance', {'autoplay': True})
    if kind == 'redirect_hunt':
        if wire.get('round', 0) == 0:
            dodge = next((r for r in rows if r.get('kind') == 'dodge'), None)
            return ('perform', {'action_id': dodge['id']}) if dodge else ('end_turn', {})
        for pred in (
            lambda r: r.get('kind') == 'attack' and r.get('target_id') == 'goblin_boss-1',
            lambda r: r.get('spell') == 'firebolt' and r.get('target_id') == 'goblin_boss-1',
        ):
            cand = next((r for r in rows if pred(r)), None)
            if cand:
                return ('perform', {'action_id': cand['id']})
        return ('advance', {'autoplay': True})
    if kind == 'redirect_ray_of_frost':
        tid = wire.get('turn_id', '')
        logs = [e['text'] for e in wire.get('log', [])]
        boss_acted = any('Goblin Boss — turn begins.' in t for t in logs)
        already_cast = any('Ilyra casts Ray of Frost.' in t for t in logs)
        if tid == 'goblin_boss-1' and wire.get('round', 0) == 0:
            bow = next(
                (r for r in rows if r.get('kind') == 'attack' and r.get('label') == 'Shortbow' and r.get('target_id') == 'mara'),
                None,
            )
            if bow:
                return ('perform', {'action_id': bow['id']})
        if tid == 'ilyra' and boss_acted and not already_cast:
            rof = next((r for r in rows if r.get('spell') == 'ray_of_frost' and r.get('target_id') == 'goblin_boss-1'), None)
            if rof:
                return ('perform', {'action_id': rof['id']})
        return ('end_turn', {})
    if kind == 'aid_double':
        aid = next((r for r in rows if r.get('spell') == 'aid'), None)
        return ('perform', {'action_id': aid['id']}) if aid else ('advance', {'autoplay': True})
    if kind == 'sorcerer_showcase':
        tid = wire.get('turn_id')
        if tid == 'curogana':
            for pred in (
                lambda r: r.get('kind') == 'innate_sorcery',
                lambda r: r.get('kind') == 'dragons_breath_exhale',
                lambda r: r.get('kind') == 'spiritual_weapon_attack',
                lambda r: r.get('spell') == 'dragons_breath' and wire.get('round') == 0,
                lambda r: r.get('spell') == 'spiritual_weapon',
                lambda r: r.get('spell') == 'chromatic_orb' and r.get('metamagic') == 'empowered',
                lambda r: r.get('spell') == 'sorcerous_burst' and r.get('metamagic') == 'empowered',
                lambda r: r.get('spell') == 'burning_hands' and r.get('metamagic') == 'heightened',
                lambda r: r.get('spell') == 'acid_splash',
                lambda r: r.get('spell') == 'sorcerous_burst',
            ):
                cand = next((r for r in rows if pred(r)), None)
                if cand:
                    return ('perform', {'action_id': cand['id']})
            return ('end_turn', {})
        if tid == 'elion':
            for pred in (
                lambda r: r.get('kind') == 'preserve_life',
                lambda r: r.get('spell') == 'bless' and wire.get('round') == 0,
                lambda r: r.get('spell') == 'guiding_bolt',
                lambda r: r.get('kind') == 'divine_spark',
                lambda r: r.get('spell') == 'sacred_flame',
            ):
                cand = next((r for r in rows if pred(r)), None)
                if cand:
                    return ('perform', {'action_id': cand['id']})
            return ('end_turn', {})
        return ('advance', {'autoplay': True})
    if kind == 'goblin_nimble_shield':
        tid = wire.get('turn_id', '')
        if tid in ('ilyra', 'mara'):
            return ('end_turn', {})
        # goblin_minion-1 starts behind a wall out of sight (uses Hide immediately);
        # goblin_boss-1 and goblin_warrior-1 use Disengage and attack Ilyra (AC 12) to trigger Shield!
        if tid == 'goblin_minion-1':
            hid = next((r for r in rows if r.get('kind') == 'hide_bonus'), None)
            if hid:
                return ('perform', {'action_id': hid['id']})
        else:
            dis = next((r for r in rows if r.get('kind') == 'disengage_bonus'), None)
            if dis:
                return ('perform', {'action_id': dis['id']})
        atk_ilyra = [r for r in rows if r.get('kind') == 'attack' and r.get('target_id') == 'ilyra']
        if atk_ilyra:
            return ('perform', {'action_id': atk_ilyra[0]['id']})
        return ('end_turn', {})
    if kind == 'deathsaves_wakeup_stand':
        tid = wire.get('turn_id', '')
        logs = [e['text'] for e in wire.get('log', [])]
        saw_death_save = any('Mara: death save' in t for t in logs)
        if tid == 'mara':
            st = next((r for r in rows if r.get('kind') == 'stand'), None)
            if st and saw_death_save:
                return ('perform', {'action_id': st['id']})
            return ('end_turn', {})
        if tid == 'elion':
            mara = next(u for u in wire.get('units', []) if u['id'] == 'mara')
            if not mara['alive'] and not mara['dead'] and saw_death_save:
                heal = next(
                    (r for r in rows if (r.get('spell') in ('healing_word', 'cure_wounds') and r.get('target_id') == 'mara')
                     or r.get('kind') == 'preserve_life'),
                    None,
                )
                if heal:
                    return ('perform', {'action_id': heal['id']})
            return ('end_turn', {})
        return ('advance', {'autoplay': True})

    if not rows or rng.random() < policy.get('end_prob', 0.15):
        return ('end_turn', {})
    non_move = [r for r in rows if r.get('kind') != 'move']
    if non_move and rng.random() < policy.get('act_bias', 0.65):
        return ('perform', {'action_id': rng.choice(non_move)['id']})
    return ('perform', {'action_id': rng.choice(rows)['id']})


def _record_worker(args: tuple[str, dict]) -> tuple[str, str, dict]:
    ref_root, spec = args
    _init_ref(ref_root)
    assert _REF_ARENA_CLS is not None
    level = level_of(spec['level'])
    if spec['level']['kind'] == 'catalogue':
        spec = dict(spec, level=dict(spec['level'], difficulty=level.preset['difficulty']))
    game = _REF_ARENA_CLS(level, seed=spec['seed'], revision=0, csrf_token='oracle-csrf')
    record_draws: list[dict] = []
    orig = game._record_action

    def rec(action, before, first_effect, moves):
        orig(action, before, first_effect, moves)
        record_draws.extend(dict(d) for d in game.timeline[-1]['draws'])

    game._record_action = rec
    rng = random.Random(spec.get('policy_seed', 0))
    policy = spec['policy']
    out = {'spec': spec, 'initial_wire': game.wire(game.state()), 'steps': []}

    def do(op: str, op_args: dict):
        try:
            if op == 'configure':
                raw = game.configure(op_args['placements'], op_args['monster_control'])
            elif op == 'start':
                raw = game.start()
            elif op == 'perform':
                raw = game.perform(op_args['action_id'])
            elif op == 'end_turn':
                raw = game.end_turn()
            elif op == 'advance':
                raw = game.advance(autoplay=op_args['autoplay'])
            else:
                raise AssertionError(op)
            w = game.wire(raw)
            out['steps'].append({'op': op, 'args': op_args, 'wire': w})
            return w
        except ValueError as e:
            out['steps'].append({'op': op, 'args': op_args, 'error': str(e)})
            return None

    for probe in spec.get('pre_probes', []):
        do(probe['op'], probe['args'])
    if 'configure' in spec:
        cfg = spec['configure']
        placements = cfg.get('placements') or out['initial_wire']['setup']['suggested_placements']
        do('configure', {'placements': placements, 'monster_control': cfg['monster_control']})
    w = do('start', {})
    max_steps = spec.get('max_steps', 50)
    while w is not None and not game.finished and len(out['steps']) < max_steps:
        if spec.get('probe_errors') and rng.random() < 0.08:
            kind = rng.choice(['bad_id', 'adv_human', 'end_enemy'])
            if kind == 'bad_id':
                do('perform', {'action_id': 'r999999-0'})
            elif kind == 'adv_human' and w.get('can_act'):
                do('advance', {'autoplay': False})
            elif kind == 'end_enemy' and not w.get('can_act'):
                do('end_turn', {})
        if w.get('can_act'):
            op, op_args = choose(rng, w, policy, len(out['steps']))
        else:
            op, op_args = 'advance', {'autoplay': False}
        nw = do(op, op_args)
        if nw is None:
            nw = do('end_turn', {}) if w.get('can_act') else do('advance', {'autoplay': True})
        if nw is None:
            break
        w = nw

    out['trailing_draws'] = [dict(d) for d in game._draws]
    out['draws'] = list(game.initiative_draws) + record_draws + out['trailing_draws']
    out['finished'] = game.finished
    out['winner'] = game.winner
    return (spec['bucket'], spec['name'], out)


def summarize(doc: dict) -> dict:
    descs: list[str] = []
    logs: list[str] = []
    marks: set[str] = set()
    effect_texts: set[str] = set()
    offered_kinds: list[set[str]] = []
    for step in doc['steps']:
        w = step.get('wire')
        if not w:
            continue
        for r in w.get('timeline', []):
            descs.append(r.get('descriptor', ''))
            for eff in r.get('effects', []):
                if eff.get('text'):
                    effect_texts.add(eff['text'])
        if w.get('log'):
            logs = [e['text'] for e in w['log']]
        for u in w.get('units', []):
            marks.update(u.get('marks', []))
        offered_kinds.append({d['kind'] for d in w.get('action_defs', [])})
    last_w = next((s['wire'] for s in reversed(doc['steps']) if 'wire' in s), {})
    return {
        'descs': descs,
        'logs': logs,
        'marks': marks,
        'effect_texts': effect_texts,
        'offered_kinds': offered_kinds,
        'last_wire': last_w,
    }


BAD_SETUP_PROBES = [
    {'op': 'advance', 'args': {'autoplay': False}},
    {'op': 'perform', 'args': {'action_id': 'r0-0'}},
    {'op': 'end_turn', 'args': {}},
    {'op': 'configure', 'args': {'placements': 'x', 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [], 'monster_control': 'bogus'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'guy', 'x': 1}], 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'guy', 'x': True, 'y': 1}], 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'guy', 'x': 0, 'y': 0}], 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'guy', 'x': 4294967299, 'y': 3}], 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'nobody', 'x': 2.5, 'y': 2}], 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'guy', 'x': 2, 'y': 2}, {'id': 'guy', 'x': 3, 'y': 2}], 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'nobody', 'x': 2, 'y': 2}], 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'guy', 'x': 2, 'y': 2, 'z': 1}], 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'guy', 'x': 2.0, 'y': 2}], 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'guy', 'x': 2, 'y': 2}], 'monster_control': None}},
    {'op': 'configure', 'args': {'placements': None, 'monster_control': 'ai'}},
    {'op': 'configure', 'args': {'placements': [{'id': 'guy', 'x': 2, 'y': 4}], 'monster_control': 'ai'}},
    {'op': 'start', 'args': {}},
]


def check_move_closed_cleave(s: dict) -> bool:
    # Must offer Cleave on one step, perform a move next, and NOT offer Cleave right after that move!
    offered = s['offered_kinds']
    for i in range(len(offered) - 1):
        if 'cleave' in offered[i] and 'cleave' not in offered[i + 1]:
            return any(d.startswith('move:') for d in s['descs']) and not any(d.startswith('cleave:') for d in s['descs'])
    return False


def check_redirect_ray_of_frost(s: dict) -> bool:
    if 'spell:ray_of_frost:L0:>goblin_boss-1' not in s['descs']:
        return False
    if not any('ray of frost hits Goblin Warrior' in t for t in s['logs']):
        return False
    if not any('Goblin Warrior falls dead.' in t for t in s['logs']):
        return False
    cast_idx = next((i for i, t in enumerate(s['logs']) if 'Ilyra casts Ray of Frost.' in t), None)
    if cast_idx is None or not any('Ilyra — turn begins.' in t for t in s['logs'][cast_idx + 1:]):
        return False
    gw = next((u for u in s['last_wire'].get('units', []) if u['id'] == 'goblin_warrior-1'), {})
    return 'slowed' in gw.get('marks', [])


def check_goblins_nimble_shield(s: dict) -> bool:
    return (
        'disengage_bonus' in s['descs']
        and 'hide_bonus' in s['descs']
        and 'SHIELD +5 AC' in s['effect_texts']
    )


def check_deathsaves_wakeup_stand(s: dict) -> bool:
    return (
        any('Mara: death save' in t for t in s['logs'])
        and ('preserve_life' in s['descs'] or any('healing_word' in d or 'cure_wounds' in d for d in s['descs']))
        and 'stand' in s['descs']
        and any('Mara stands up.' in t for t in s['logs'])
    )


SEARCHED_TARGETED_SPECS = [
    (
        'mech_chruna_move_closes_cleave',
        {
            'bucket': 'public',
            'level': {
                'kind': 'custom',
                'party': ['chruna'],
                'roster': ['zombie', 'zombie'],
                'placements': {'chruna': [2, 3], 'zombie-1': [3, 3], 'zombie-2': [3, 4]},
                'rows': box(10, 7),
            },
            'policy': {'kind': 'chruna_move_closes_cleave'},
            'max_steps': 14,
        },
        check_move_closed_cleave,
    ),
    (
        'mech_goblin_redirect_ray_of_frost',
        {
            'bucket': 'public',
            'level': {
                'kind': 'custom',
                'party': ['mara', 'ilyra'],
                'roster': ['goblin_boss', 'goblin_warrior', 'goblin_minion'],
                'placements': {
                    'ilyra': [2, 2],
                    'mara': [6, 2],
                    'goblin_boss-1': [7, 2],
                    'goblin_warrior-1': [7, 3],
                    'goblin_minion-1': [5, 4],
                },
                'rows': box(12, 7),
            },
            'configure': {'monster_control': 'manual'},
            'policy': {'kind': 'redirect_ray_of_frost'},
            'max_steps': 26,
        },
        check_redirect_ray_of_frost,
    ),
    (
        'mech_goblins_manual_nimble_shield',
        {
            'bucket': 'public',
            'level': {
                'kind': 'custom',
                'party': ['mara', 'ilyra'],
                'roster': ['goblin_boss', 'goblin_warrior', 'goblin_minion'],
                'placements': {
                    'mara': [2, 2],
                    'ilyra': [3, 3],
                    'goblin_boss-1': [4, 3],
                    'goblin_warrior-1': [4, 4],
                    'goblin_minion-1': [9, 2],
                },
                'rows': [
                    'HHHHHHHHHHHH',
                    'H......H...H',
                    'H......H...H',
                    'H......H...H',
                    'H......H...H',
                    'H..........H',
                    'HHHHHHHHHHHH',
                ],
            },
            'configure': {'monster_control': 'manual'},
            'policy': {'kind': 'goblin_nimble_shield'},
            'max_steps': 30,
        },
        check_goblins_nimble_shield,
    ),
    (
        'mech_deathsaves_wakeup_stand',
        {
            'bucket': 'public',
            'level': {
                'kind': 'custom',
                'party': ['mara', 'elion'],
                'roster': ['wight', 'ghast'],
                'placements': {'mara': [5, 3], 'elion': [1, 3], 'wight-1': [6, 3], 'ghast-1': [6, 4]},
                'rows': box(10, 7),
            },
            'policy': {'kind': 'deathsaves_wakeup_stand'},
            'max_steps': 36,
            'probe_errors': True,
        },
        check_deathsaves_wakeup_stand,
    ),
]


def build_fixed_specs() -> list[dict]:
    specs: list[dict] = []
    public_runs = [
        ('pub_crypt_bone_patrol_badsetup', 'crypt', 'bone_patrol', 5, {'kind': 'native'}, 36, BAD_SETUP_PROBES, True),
        ('pub_crypt_ghoul_pack', 'crypt', 'ghoul_pack', 2, {'kind': 'native'}, 36, [], False),
        ('pub_crypt_haunting', 'crypt', 'haunting', 1, {'kind': 'native'}, 36, [], False),
        ('pub_crypt_wights_retinue', 'crypt', 'wights_retinue', 1, {'kind': 'native'}, 36, [], False),
        ('pub_crypt_two_wights', 'crypt', 'two_wights', 2, {'kind': 'native'}, 36, [], False),
        ('pub_crypt_whole_crypt', 'crypt', 'whole_crypt', 1, {'kind': 'native'}, 36, [], False),
        ('pub_crypt_mummies_tomb_chruna', 'crypt', 'mummies_tomb', 2, {'kind': 'native'}, 40, [], False),
        ('pub_vault_goblin_raiders', 'vault', 'goblin_raiders', 1, {'kind': 'native'}, 36, [], False),
        ('pub_vault_boss_guard', 'vault', 'boss_guard', 3, {'kind': 'native'}, 36, [], False),
        ('pub_vault_warband', 'vault', 'warband', 2, {'kind': 'native'}, 36, [], False),
        ('pub_vault_three_bosses_chruna', 'vault', 'three_bosses', 1, {'kind': 'native'}, 40, [], False),
    ]
    for name, enc, preset, seed, pol, msteps, probes, perr in public_runs:
        s = {
            'bucket': 'public',
            'name': name,
            'level': cat(enc, preset),
            'seed': seed,
            'policy_seed': seed,
            'policy': pol,
            'max_steps': msteps,
            'probe_errors': perr,
        }
        if probes:
            s['pre_probes'] = probes
            s['configure'] = {'monster_control': 'ai'}
        specs.append(s)

    private_runs = [
        ('priv_catacombs_ne_p1', 'mausoleum-catacombs-northeast', 'p1', 1, {'kind': 'native'}, 30),
        ('priv_catacombs_sw_p2_graze', 'mausoleum-catacombs-southwest', 'p2', 1, {'kind': 'native'}, 28),
        ('priv_chapel_p1', 'mausoleum-chapel', 'p1', 2, {'kind': 'native'}, 30),
        ('priv_crypts_p1', 'mausoleum-crypts', 'p1', 1, {'kind': 'native'}, 30),
        ('priv_forecourt_p1', 'mausoleum-forecourt', 'p1', 1, {'kind': 'native'}, 30),
        ('priv_hall_p1', 'mausoleum-hall', 'p1', 1, {'kind': 'native'}, 30),
        ('priv_rotunda_p1', 'mausoleum-rotunda', 'p1', 1, {'kind': 'native'}, 30),
    ]
    for name, enc, preset, seed, pol, msteps in private_runs:
        specs.append({
            'bucket': 'private',
            'name': name,
            'level': cat(enc, preset),
            'seed': seed,
            'policy': pol,
            'max_steps': msteps,
        })

    for s in (1, 2):
        specs.append({
            'bucket': 'public',
            'name': f'mech_chruna_rage_reckless_cleave_s{s}',
            'seed': s,
            'level': {
                'kind': 'custom',
                'party': ['chruna', 'elion'],
                'roster': ['zombie', 'zombie', 'zombie', 'mummy'],
                'placements': {
                    'chruna': [3, 3],
                    'elion': [2, 5],
                    'zombie-1': [4, 2],
                    'zombie-2': [4, 3],
                    'zombie-3': [4, 4],
                    'mummy-1': [9, 4],
                },
                'rows': box(12, 8),
            },
            'policy': {'kind': 'chruna_showcase'},
            'max_steps': 30,
        })

    specs.extend([
        {
            'bucket': 'public',
            'name': 'mech_goblin_redirect_attack_s1',
            'seed': 1,
            'level': {
                'kind': 'custom',
                'party': ['mara'],
                'roster': ['goblin_boss', 'goblin_minion'],
                'placements': {'mara': [1, 1], 'goblin_boss-1': [2, 1], 'goblin_minion-1': [3, 1]},
                'rows': ['HHHHH', 'H...H', 'HHHHH'],
            },
            'policy': {'kind': 'redirect_hunt'},
            'max_steps': 16,
        },
        {
            'bucket': 'public',
            'name': 'mech_shadow_str_0',
            'seed': 1,
            'level': {
                'kind': 'custom',
                'party': ['ilyra'],
                'roster': ['shadow', 'shadow', 'shadow'],
                'placements': {'ilyra': [2, 2], 'shadow-1': [1, 2], 'shadow-2': [3, 2], 'shadow-3': [2, 1]},
                'rows': box(5, 5),
            },
            'policy': {'kind': 'prefer', 'prefer': []},
            'max_steps': 24,
        },
        {
            'bucket': 'public',
            'name': 'mech_turn_undead_expiry',
            'seed': 1,
            'level': {
                'kind': 'custom',
                'party': ['elion'],
                'roster': ['zombie', 'zombie', 'skeleton'],
                'placements': {'elion': [2, 3], 'zombie-1': [6, 3], 'zombie-2': [6, 4], 'skeleton-1': [7, 2]},
                'rows': box(22, 7),
            },
            'policy': {'kind': 'prefer', 'prefer': ['channel_divinity_turn_undead']},
            'max_steps': 62,
        },
        {
            'bucket': 'public',
            'name': 'mech_turn_undead_no_targets',
            'seed': 1,
            'level': {
                'kind': 'custom',
                'party': ['elion'],
                'roster': ['zombie'],
                'placements': {'elion': [1, 1], 'zombie-1': [20, 2]},
                'rows': box(22, 5),
            },
            'policy': {'kind': 'prefer', 'prefer': ['channel_divinity_turn_undead'], 'then': 'native'},
            'max_steps': 14,
        },
        {
            'bucket': 'public',
            'name': 'mech_mummy_curse_glare_and_aid_miss',
            'seed': 2,
            'level': {
                'kind': 'custom',
                'party': ['guy', 'elion'],
                'roster': ['mummy', 'mummy'],
                'placements': {'guy': [4, 3], 'elion': [3, 4], 'mummy-1': [5, 3], 'mummy-2': [5, 4]},
                'rows': box(10, 7),
            },
            'policy': {'kind': 'aid_double'},
            'max_steps': 36,
        },
    ])

    for s in (1, 3):
        specs.append({
            'bucket': 'public',
            'name': f'mech_sorcerer_cleric_spells_s{s}',
            'seed': 20 + s,
            'policy_seed': 30 + s,
            'level': {
                'kind': 'custom',
                'party': ['curogana', 'elion'],
                'roster': ['zombie', 'zombie', 'ghoul', 'shadow', 'specter'],
                'placements': {
                    'curogana': [3, 3],
                    'elion': [3, 4],
                    'zombie-1': [5, 3],
                    'zombie-2': [5, 4],
                    'ghoul-1': [6, 3],
                    'shadow-1': [7, 4],
                    'specter-1': [8, 2],
                },
                'rows': box(12, 7),
            },
            'policy': {'kind': 'sorcerer_showcase'},
            'max_steps': 36,
        })

    return specs


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--reference-root', required=True, help='Path to checkout of the reference natural20 repository')
    ap.add_argument('--out-dir', required=True, help='Fixtures output directory (containing public/ and private/)')
    ap.add_argument('--suite', choices=('all', 'targeted'), default='all')
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--max-seed', type=int, default=400)
    args = ap.parse_args()

    ref_root = str(Path(args.reference_root).resolve())
    out_dir = Path(args.out_dir)
    if args.suite == 'all' and out_dir.exists():
        shutil.rmtree(out_dir)
    (out_dir / 'public').mkdir(parents=True, exist_ok=True)
    (out_dir / 'private').mkdir(parents=True, exist_ok=True)

    recorded: list[tuple[str, str, dict]] = []
    if args.suite == 'all':
        fixed = build_fixed_specs()
        with ProcessPoolExecutor(max_workers=args.workers) as pool:
            recorded.extend(pool.map(_record_worker, [(ref_root, s) for s in fixed]))

    candidate_seeds = [514, *[s for s in range(1, args.max_seed + 1) if s != 514]]
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        for name, template, check_fn in SEARCHED_TARGETED_SPECS:
            found = None
            batch_size = max(8, args.workers * 2)
            for offset in range(0, len(candidate_seeds), batch_size):
                batch = candidate_seeds[offset : offset + batch_size]
                jobs = [(ref_root, {'name': name, 'seed': seed, 'policy_seed': seed, **template}) for seed in batch]
                for seed, (bucket, _, doc) in zip(batch, pool.map(_record_worker, jobs)):
                    if check_fn(summarize(doc)):
                        found = (bucket, name, doc)
                        print(f'Recorded {name} at seed={seed} ({len(doc["steps"])} steps, {len(doc["draws"])} draws)', flush=True)
                        break
                if found is not None:
                    break
            if found is None:
                raise RuntimeError(f'failed to find a seed satisfying {name} in {len(candidate_seeds)} seeds')
            recorded.append(found)

    record_kinds: collections.Counter[str] = collections.Counter()
    for bucket, name, doc in recorded:
        dest = out_dir / bucket / f'{name}.json'
        txt = json.dumps(doc, separators=(',', ':')) + '\n'
        dest.write_text(txt, encoding='utf-8')
        for st in doc['steps']:
            if 'wire' in st:
                for r in st['wire'].get('timeline', []):
                    record_kinds[r['kind']] += 1

    print(f'Wrote {len(recorded)} fixtures to {out_dir}. Record kinds: {dict(record_kinds.most_common())}', flush=True)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
