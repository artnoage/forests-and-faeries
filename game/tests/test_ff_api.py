"""Forests and Faeries backend: catalogue, API protections, encounters, records.

Real Rust engine (ember_rs.WebGame), no mocked outcomes.
"""
import json
import re
import struct

import pytest

from game import catalogue
from game.arena import FFArena
from game.server import COOKIE, CSP, MODEL_FILES, PUBLIC_FILES, STATIC, create_app

FORBIDDEN = re.compile('|'.join(['be' + 'holder', 'ember' + '-eye', 'baby' + r'[ _-]eye']), re.I)
PACK_RE = re.compile('|'.join(['quater' + 'nius', 'Warrior_' + 'Texture', 'Rogue_' + 'Texture', 'Wizard_' + 'Texture']), re.I)


@pytest.fixture
def ff_app(monkeypatch):
    monkeypatch.setenv('EMBER_UI', 'ff')
    monkeypatch.delenv('FF_PRIVATE_ENCOUNTERS', raising=False)
    return create_app()


@pytest.fixture
def private_app(monkeypatch):
    monkeypatch.setenv('EMBER_UI', 'ff')
    monkeypatch.setenv('FF_PRIVATE_ENCOUNTERS', '1')
    return create_app()


def post(client, path, state, body, token=None):
    return client.post(path, data=json.dumps(body), content_type='application/json',
                       headers={'X-CSRF-Token': state['csrf_token'] if token is None else token})


def expand(state):
    defs = state['action_defs']
    return [dict(defs[row['d']], **{k: v for k, v in row.items() if k != 'd'}) for row in state['actions']]


def new_game(client, encounter, preset):
    state = client.get('/api/state').get_json()
    response = post(client, '/api/new', state, {'encounter': encounter, 'preset': preset})
    assert response.status_code == 200, response.get_json()
    return response.get_json()


def custom_level(party, roster, placements, rows=None, theme='ossuary'):
    rows = rows or ['HHHHHHHHHH', 'H........H', 'H........H', 'H........H', 'H........H', 'HHHHHHHHHH']
    encounter = {'id': 'test', 'name': 'Test', 'map': 'test', 'theme': theme, 'blurb': '', 'presets': []}
    preset = {'id': 'p', 'name': 'P', 'difficulty': 'Easy', 'blurb': '', 'party': party, 'roster': roster,
              'placements': placements}
    return catalogue.Level(encounter, preset, rows, {'props': []}, 'test')


def test_the_web_app_is_forests_and_faeries(monkeypatch):
    monkeypatch.delenv('EMBER_UI', raising=False)
    assert 'ff_games' in create_app().extensions
    health = create_app().test_client().get('/healthz').get_json()
    assert health['ui'] == 'forests-and-faeries'
    assert health['engine'] == 'ember-rs'


@pytest.mark.parametrize('ui', ['classic', 'bogus'])
def test_other_uis_are_refused(monkeypatch, ui):
    monkeypatch.setenv('EMBER_UI', ui)
    with pytest.raises(RuntimeError):
        create_app()


def test_store_capacity_is_configurable_and_checked(monkeypatch):
    monkeypatch.setenv('EMBER_UI', 'ff')
    monkeypatch.setenv('FF_CAPACITY', '12')
    assert create_app().extensions['ff_games'].capacity == 12
    for bad in ('0', '-1', '300', 'many'):
        monkeypatch.setenv('FF_CAPACITY', bad)
        with pytest.raises(RuntimeError):
            create_app()


def test_public_catalogue_has_the_crypt_and_the_vault_and_no_private_room(ff_app):
    data = ff_app.test_client().get('/api/encounters').get_json()['encounters']
    ids = [e['id'] for e in data]
    assert ids[:2] == ['crypt', 'vault']
    assert not any(e['private'] or e['id'].startswith('mausoleum') for e in data)
    crypt = data[0]['presets']
    assert [p['id'] for p in crypt] == ['bone_patrol', 'ghoul_pack', 'haunting', 'wights_retinue', 'two_wights',
                                       'whole_crypt', 'mummies_tomb']
    assert [h['content'] for h in crypt[-1]['party']] == ['guy', 'elion', 'curogana', 'chruna']
    vault = data[1]['presets']
    assert all({'mara', 'ilyra'} <= {h['content'] for h in p['party']} <= {'mara', 'ilyra', 'chruna'} for p in vault)
    assert [p['id'] for p in vault if 'chruna' in {h['content'] for h in p['party']}] == ['three_bosses']
    contents = {r['content'] for p in vault for r in p['roster']}
    assert {'goblin_boss', 'ogre'} <= contents and contents <= {'goblin_minion', 'goblin_warrior', 'goblin_boss', 'skeleton', 'ogre'}
    glade = next(e['presets'] for e in data if e['id'] == 'whispering_glade')
    assert 'owlbear' in {r['content'] for p in glade for r in p['roster']}


def test_private_catalogue_adds_the_seven_mausoleum_rooms_with_neutral_names(private_app):
    data = private_app.test_client().get('/api/encounters').get_json()['encounters']
    rooms = [e for e in data if e['private']]
    assert len(rooms) == 7 and all(e['id'].startswith('mausoleum-') for e in rooms)
    from game.release.make_ff_release import find_private_term_hashes
    text = json.dumps(rooms).lower()
    assert find_private_term_hashes(text) == []
    for word in ('region', 'crop', 'overlay', '/' + 'home/'):
        assert word not in text
    assert all(len(e['presets']) >= 1 for e in rooms)


@pytest.mark.parametrize('hero_level', [1, 2, 3])
def test_play_at_selected_hero_level(ff_app, hero_level):
    client = ff_app.test_client()
    first = client.get('/api/state').get_json()
    new = post(client, '/api/new', first, {'hero_level': hero_level})
    assert new.status_code == 200, new.get_json()
    setup = new.get_json()
    party = setup['level']['party']
    assert all(hero['level'] == hero_level for hero in party)
    assert len({hero['base_id'] for hero in party}) == len(party)
    for hero in party:
        unit = next(u for u in setup['units'] if u['id'] == hero['content'])
        assert (unit['base_id'], unit['level']) == (hero['base_id'], hero_level)
    placed = post(client, '/api/setup', setup, {'revision': setup['revision'],
                  'placements': setup['setup']['suggested_placements'], 'monster_control': 'ai'}).get_json()
    started = post(client, '/api/start', placed, {'revision': placed['revision']})
    assert started.status_code == 200, started.get_json()
    assert started.get_json()['phase'] != 'setup'


def test_every_level_builds_and_validates():
    levels = catalogue.load(include_private=True)
    assert len(levels) >= 6 + 2 + 7
    for level in levels.values():
        assert level.check() == []
        assert level.theme in catalogue.THEMES


def test_catalogue_props_stand_only_on_wall_cells():
    for level in catalogue.load(include_private=True).values():
        rows = level.rows
        for prop in level.scene.get('props', []):
            if prop['kind'] in ('rug', 'stained_glass'):
                continue
            for y in range(prop['y'], prop['y'] + prop.get('depth', 1)):
                for x in range(prop['x'], prop['x'] + prop.get('width', 1)):
                    assert rows[y][x] == 'H', (level.encounter_id, prop)


def test_no_non_srd_creature_is_reachable_through_the_api(private_app):
    client = private_app.test_client()
    catalogue_text = client.get('/api/encounters').get_data(as_text=True)
    assert not FORBIDDEN.search(catalogue_text)
    bad_unit = ('be' + 'holder') + '-1'
    for level in catalogue.load(include_private=True).values():
        state = new_game(client, level.encounter_id, level.preset_id)
        assert not FORBIDDEN.search(json.dumps(state)), level.preset_id
        bad = post(client, '/api/setup', state, {'revision': state['revision'], 'monster_control': 'ai',
                                                 'placements': [{'id': bad_unit, 'x': 10, 'y': 6}]})
        assert bad.status_code == 400
    for path in (catalogue.ROOT / 'static').glob('*'):
        if path.suffix in ('.js', '.html', '.css', '.txt'):
            assert not FORBIDDEN.search(path.read_text(encoding='utf-8')), path.name


def test_security_headers_and_cookie_flags(ff_app, monkeypatch):
    monkeypatch.setenv('EMBER_SECURE_COOKIE', '1')
    client = ff_app.test_client()
    for path in ('/', '/api/state', '/healthz', '/api/encounters', '/app.js', '/nope'):
        response = client.get(path)
        assert response.headers['Content-Security-Policy'] == CSP
        assert "style-src 'self'" in CSP and 'unsafe-inline' not in CSP
        assert response.headers['X-Frame-Options'] == 'DENY'
        assert response.headers['X-Content-Type-Options'] == 'nosniff'
        assert response.headers['Referrer-Policy'] == 'no-referrer'
        assert 'camera=()' in response.headers['Permissions-Policy']
    cookie = ff_app.test_client().get('/api/state').headers['Set-Cookie']
    assert f'{COOKIE}=' in cookie and 'HttpOnly' in cookie and 'SameSite=Strict' in cookie and 'Secure' in cookie
    assert client.get('/api/state').headers['Cache-Control'] == 'no-store'


def test_static_allowlist_only(ff_app):
    client = ff_app.test_client()
    for path in ('/encounters/crypt.json', '/maps/vault.json', '/arena.py', '/../server.py', '/static/app.js',
                 '/encounters/private/mausoleum-hall.json', '/models/wizard.glb'):
        assert client.get(path).status_code == 404, path
    assert client.get('/').status_code == 200
    assert set(PUBLIC_FILES) >= {'app.js', 'style.css', 'scene3d.js', 'licenses.html', 'models/mummy.glb'}


def test_csrf_revision_expiry_and_body_rules(ff_app):
    client = ff_app.test_client()
    state = client.get('/api/state').get_json()
    assert post(client, '/api/start', state, {'revision': state['revision']}, token='wrong').status_code == 403
    assert post(client, '/api/start', state, {'revision': state['revision'] - 1}).status_code == 409
    assert post(client, '/api/start', state, {'revision': state['revision'], 'x': 1}).status_code == 400
    assert client.post('/api/start', data='[1]', content_type='application/json',
                       headers={'X-CSRF-Token': state['csrf_token']}).status_code == 400
    assert client.post('/api/start', data='x' * 20000, content_type='application/json',
                       headers={'X-CSRF-Token': state['csrf_token']}).status_code == 413
    assert client.post('/api/start', data='{}', content_type='text/plain').status_code == 400
    stranger = ff_app.test_client()
    expired = stranger.post('/api/start', data='{"revision": 1}', content_type='application/json',
                            headers={'X-CSRF-Token': 'x'})
    assert expired.status_code == 410 and expired.get_json()['code'] == 'expired'
    assert 'Traceback' not in expired.get_data(as_text=True)


def test_private_encounters_need_the_private_switch(ff_app):
    client = ff_app.test_client()
    state = client.get('/api/state').get_json()
    response = post(client, '/api/new', state, {'encounter': 'mausoleum-hall', 'preset': 'p1'})
    assert response.status_code == 400


def test_one_client_cannot_evict_other_clients_games(ff_app):
    store = ff_app.extensions['ff_games']
    victim = ff_app.test_client()
    victim.get('/api/state', environ_base={'REMOTE_ADDR': '198.51.100.9'})
    victim_key = next(iter(store.games))
    for _ in range(store.capacity // 8):
        ff_app.test_client().get('/api/state', environ_base={'REMOTE_ADDR': '198.51.100.7'})
    assert victim_key in store.games
    assert sum(1 for _, client, _ in store.games.values() if client == '198.51.100.7') == store.per_client


def test_proxy_address_is_trusted_only_over_loopback(ff_app):
    store = ff_app.extensions['ff_games']
    ff_app.test_client().get('/api/state', environ_base={'REMOTE_ADDR': '127.0.0.1'},
                             headers={'X-Real-IP': '203.0.113.5'})
    ff_app.test_client().get('/api/state', environ_base={'REMOTE_ADDR': '198.51.100.3'},
                             headers={'X-Real-IP': '203.0.113.6'})
    clients = {client for _, client, _ in store.games.values()}
    assert '203.0.113.5' in clients and '198.51.100.3' in clients and '203.0.113.6' not in clients


def test_every_figure_is_a_rigged_original_and_served_as_is(ff_app, monkeypatch):
    monkeypatch.setenv('FF_PLACEHOLDER_MODELS', '1')
    client = create_app().test_client()
    for name in MODEL_FILES:
        data = client.get('/' + name).get_data()
        assert data == (STATIC / name).read_bytes(), name
        doc = json.loads(data[20:20 + struct.unpack('<I', data[12:16])[0]])
        clips = {a['name'] for a in doc.get('animations', [])}
        assert {'idle', 'walk', 'hit', 'death'} <= clips, (name, sorted(clips))
        assert not PACK_RE.search(json.dumps(doc))


@pytest.mark.parametrize('encounter,preset', [('crypt', 'two_wights'), ('crypt', 'wights_retinue'),
                                              ('crypt', 'mummies_tomb'), ('vault', None), ('vault', 'three_bosses'),
                                              ('mausoleum-catacombs-southwest', 'p2')])
def test_a_game_of_each_encounter_type_plays_to_the_end(private_app, encounter, preset):
    client = private_app.test_client()
    if preset is None:
        preset = next(p for e, p in catalogue.load(True) if e == encounter)
    state = new_game(client, encounter, preset)
    assert state['phase'] == 'setup' and state['setup']['can_start']
    assert state['level']['id'] == preset and state['encounter'] == encounter
    state = post(client, '/api/start', state, {'revision': state['revision']}).get_json()
    assert state['initiative_draws'] and all(d['sides'] == 20 for d in state['initiative_draws'])
    acted = False
    for _ in range(300):
        if state['phase'] == 'finished':
            break
        if state['can_act'] and not acted:
            actions = expand(state)
            pick = next((a for a in actions if a['kind'] == 'attack'), None) or actions[0]
            state = post(client, '/api/action', state, {'revision': state['revision'], 'action_id': pick['id']}).get_json()
            acted = True
            continue
        state = post(client, '/api/advance', state, {'revision': state['revision'], 'autoplay': True}).get_json()
        assert 'error' not in state, state
    assert state['phase'] == 'finished' and acted
    assert state['winner'] in ('heroes', 'monsters', None)


def test_records_carry_draws_descriptors_and_last_action_id(private_app):
    client = private_app.test_client()
    state = new_game(client, 'crypt', 'ghoul_pack')
    state = post(client, '/api/start', state, {'revision': state['revision']}).get_json()
    seen = 0
    for _ in range(12):
        state = post(client, '/api/advance', state, {'revision': state['revision'], 'autoplay': True}).get_json()
        for record in state['timeline']:
            assert record['revision'] == state['revision']
            assert isinstance(record['descriptor'], str) and isinstance(record['draws'], list)
            for draw in record['draws']:
                assert set(draw) == {'who', 'tag', 'sides', 'mode', 'v'}
            seen += 1
        assert state['last_action_id'] >= seen or state['timeline'] == []
        if state['phase'] == 'finished':
            break
    assert seen > 0 and 'effects' not in state


def test_move_rows_carry_the_native_path_and_cost():
    level = custom_level(['guy'], ['zombie'], {'guy': [2, 2], 'zombie-1': [8, 4]})
    game = FFArena(level, seed=1)
    game.start()
    while game.state()['turn_id'] != 'guy':
        game.advance(autoplay=True)
    moves = [a for a in game.state()['actions'] if a['kind'] == 'move']
    assert moves and all(a['path'][0] == [2, 2] and a['path'][-1] == [a['x'], a['y']] for a in moves)
    assert all(a['cost'] == f"{(len(a['path']) - 1) * 5} ft" for a in moves)
    diagonal = [a for a in moves if (a['x'], a['y']) == (1, 1)]
    assert sorted(len(a['path']) for a in diagonal)[0] == 2, 'the native one-square diagonal step is offered'


def play_until(game, predicate, turns=40):
    for _ in range(turns):
        if game.finished:
            break
        for record in game.timeline:
            found = predicate(record)
            if found:
                return found
        game.advance(autoplay=True)
    return None


def test_rotting_fist_rider_crit_flag_and_dreadful_glare():
    level = custom_level(['guy', 'elion'], ['mummy'], {'guy': [4, 2], 'elion': [4, 4], 'mummy-1': [5, 3]})
    for seed in range(1, 16):
        game = FFArena(level, seed=seed)
        game.start()
        fist = play_until(game, lambda r: next((e for e in r['effects'] if e.get('style') == 'rotting_fist'
                                               and e['outcome'] == 'hit'), None))
        if fist is None:
            continue
        assert 'crit' in fist and fist.get('rider', 0) > 0 and fist['rider_types'] == ['necrotic']
        glares = [e for r in game.timeline for e in r['effects'] if e.get('style') == 'dreadful_glare']
        assert glares, 'the mummy uses Dreadful Glare in its multiattack'
        assert all(e.get('save') in ('made', 'failed') for e in glares)
        assert not any(e.get('text') == 'MUMMY ROT' for e in glares)
        return
    raise AssertionError('no Rotting Fist hit across tested seeds')


def test_opportunity_attacks_are_recorded_on_the_move():
    level = custom_level(['guy'], ['ghoul'], {'guy': [4, 2], 'ghoul-1': [5, 2]})
    for seed in range(1, 16):
        game = FFArena(level, seed=seed)
        game.start()
        state = game.state()
        ghoul_acted = False
        while (state['turn_id'] != 'guy' or not ghoul_acted) and not game.finished:
            ghoul_acted = ghoul_acted or state['turn_id'] == 'ghoul-1'
            game.advance(autoplay=True)
            state = game.state()
        if game.finished:
            continue
        away = next((a for a in state['actions'] if a['kind'] == 'move' and a['x'] <= 2), None)
        if away is None:
            continue
        state = game.perform(away['id'])
        records = [r for r in state['timeline'] if r['revision'] == state['revision']]
        kinds = [(r['kind'], r['source_id'], bool(r.get('opportunity'))) for r in records]
        assert kinds[-1] == ('move', 'guy', False)
        assert ('attack', 'ghoul-1', True) in kinds[:-1], kinds
        oa = next(r for r in records if r.get('opportunity'))
        assert oa['effects'] and all(e['opportunity'] for e in oa['effects'])
        return
    raise AssertionError('no move away from the ghoul was available')


def test_dead_and_unconscious_heroes_differ_in_the_pose():
    level = custom_level(['guy'], ['wight', 'wight'], {'guy': [4, 2], 'wight-1': [5, 2], 'wight-2': [3, 2]})
    for seed in range(1, 12):
        game = FFArena(level, seed=seed)
        game.start()
        for _ in range(80):
            if game.finished:
                break
            game.advance(autoplay=True)
        units = {u['id']: u for u in game.state()['units']}
        guy = units['guy']
        if guy['alive'] is False:
            assert guy['dead'] == ('dead' in guy['conditions'])
            assert 'dead' in units['guy'] and all('dead' in u for u in units.values())
            return
    raise AssertionError('hero was not downed across tested seeds')


def elions_turn(game):
    state = game.state()
    while state['turn_id'] != 'elion' and not game.finished:
        game.advance(autoplay=True)
        state = game.state()
    return state


@pytest.mark.parametrize('zombie_at,expected', [([20, 3], 'no undead are within 30 ft'),
                                                ([3, 2], 'WIS save')])
def test_turn_undead_with_and_without_undead_in_range(zombie_at, expected):
    rows = ['H' * 22] + ['H' + '.' * 20 + 'H'] * 3 + ['H' * 22]
    level = custom_level(['elion'], ['zombie'], {'elion': [1, 1], 'zombie-1': zombie_at}, rows=rows)
    game = FFArena(level, seed=1)
    game.start()
    state = elions_turn(game)
    turn = next(a for a in state['actions'] if a['kind'] == 'channel_divinity_turn_undead')
    state = game.perform(turn['id'])
    assert any(expected in line['text'] for line in state['log'][-3:]), state['log'][-3:]
    record = next(r for r in state['timeline'] if r['revision'] == state['revision'] and r['source_id'] == 'elion')
    styles = [e.get('style') for e in record['effects']]
    assert ('turn_undead' in styles) == (expected == 'WIS save'), styles


def test_turn_undead_through_the_api(private_app):
    client = private_app.test_client()
    state = new_game(client, 'crypt', 'haunting')   # the trio, so Elion plays
    state = post(client, '/api/start', state, {'revision': state['revision']}).get_json()
    for _ in range(60):
        if state['turn_id'] == 'elion' or state['phase'] == 'finished':
            break
        state = post(client, '/api/advance', state, {'revision': state['revision'], 'autoplay': True}).get_json()
    assert state['turn_id'] == 'elion'
    turn = next(a for a in expand(state) if a['kind'] == 'channel_divinity_turn_undead')
    response = post(client, '/api/action', state, {'revision': state['revision'], 'action_id': turn['id']})
    assert response.status_code == 200, response.get_json()
    assert any('Turn Undead' in line['text'] for line in response.get_json()['log'])


def test_catalogue_texts_join_names_with_commas():
    assert catalogue.join_names(['Guy']) == 'Guy'
    assert catalogue.join_names(['Guy', 'Elion']) == 'Guy and Elion'
    assert catalogue.join_names(['Guy', 'Elion', 'Curogana']) == 'Guy, Elion and Curogana'
    for (encounter, preset), level in catalogue.load(True).items():
        blurb = level.preset['blurb']
        assert not re.search(r'\b\w+ and \w+ and \w+', blurb), (encounter, preset, blurb)
        assert 'mummys' not in blurb


def test_chruna_rage_reckless_attack_and_cleave():
    level = custom_level(['chruna'], ['zombie', 'zombie'], {'chruna': [2, 2], 'zombie-1': [3, 2], 'zombie-2': [3, 3]})
    for seed in range(1, 12):
        game = FFArena(level, seed=seed)
        game.start()
        state = game.state()
        while state['turn_id'] != 'chruna' and not game.finished:
            game.advance(autoplay=True)
            state = game.state()
        if game.finished:
            continue
        unit = next(u for u in state['units'] if u['id'] == 'chruna')
        assert unit['subclass'] == 'path_of_the_berserker' and unit['sheet']['features'][0]['name'] == 'Halberd'
        rage = next(a for a in state['actions'] if a['kind'] == 'rage')
        assert (rage['label'], rage['category'], rage['cost']) == ('Rage', 'feature', 'bonus action')
        state = game.perform(rage['id'])
        pools = {p['label']: p['value'] for p in state['resources']['pools']}
        assert pools['Rage'] == 2 and pools['Raging'] == 'active' and 'Reckless' not in pools
        reckless = next(a for a in state['actions'] if a['kind'] == 'reckless_attack')
        assert (reckless['label'], reckless['category'], reckless['cost']) == ('Reckless Attack', 'feature', 'free')
        state = game.perform(reckless['id'])
        assert {p['label']: p['value'] for p in state['resources']['pools']}['Reckless'] == 'active'
        attack = next(a for a in state['actions'] if a['kind'] == 'attack' and a['label'] == 'Halberd'
                      and a['target_id'] == 'zombie-1')
        state = game.perform(attack['id'])
        cleaves = [a for a in state['actions'] if a['kind'] == 'cleave']
        if not cleaves:
            continue
        assert [(a['label'], a['category'], a['cost'], a['target_id']) for a in cleaves] == [
            ('Cleave', 'attack', 'free', 'zombie-2')
        ]
        state = game.perform(cleaves[0]['id'])
        assert not any(a['kind'] == 'cleave' for a in state['actions'])
        record = [r for r in state['timeline'] if r['revision'] == state['revision']][-1]
        assert record['kind'] == 'cleave' and record['descriptor'] == 'cleave:>zombie-2'
        assert any(line['text'] == 'Chruna cleaves on into Zombie 2.' for line in state['log'])
        return
    raise AssertionError('no halberd hit in eleven seeds')


def test_placement_validation_rejects_64bit_overflow_and_checks_id_before_coords(ff_app):
    client = ff_app.test_client()
    state = new_game(client, 'crypt', 'bone_patrol')
    rev = state['revision']
    overflow = post(client, '/api/setup', state, {
        'revision': rev,
        'monster_control': 'ai',
        'placements': [{'id': 'guy', 'x': 4294967299, 'y': 3}],
    })
    assert overflow.status_code == 400
    assert overflow.get_json() == {'error': 'Placement coordinates must be in-bounds integers.'}

    bad_id_and_coord = post(client, '/api/setup', state, {
        'revision': rev,
        'monster_control': 'ai',
        'placements': [{'id': 'nobody', 'x': 2.5, 'y': 3}],
    })
    assert bad_id_and_coord.status_code == 400
    assert bad_id_and_coord.get_json() == {'error': 'Unknown or duplicate figure.'}

    # Neither failed setup request may advance revision.
    cur = client.get('/api/state').get_json()
    assert cur['revision'] == rev


def test_rust_panic_returns_500_evicts_game_and_preserves_other_clients(ff_app):
    store = ff_app.extensions['ff_games']
    bystander = ff_app.test_client()
    b_state = bystander.get('/api/state', environ_base={'REMOTE_ADDR': '198.51.100.11'}).get_json()
    b_started = post(bystander, '/api/start', b_state, {'revision': b_state['revision']})
    assert b_started.status_code == 200

    victim = ff_app.test_client()
    v_state = victim.get('/api/state', environ_base={'REMOTE_ADDR': '198.51.100.12'}).get_json()
    victim_key = next(k for k, (_, owner, _) in store.games.items() if owner == '198.51.100.12')
    _, _, old_game = store.games[victim_key]
    # Replace victim's game with one whose replay draw stream is empty so start() panics inside Rust.
    broken = FFArena(old_game.level, seed=1, revision=old_game.revision, csrf_token=old_game.csrf_token, replay_draws=[])
    store.put(victim_key, '198.51.100.12', broken)

    crash = post(victim, '/api/start', v_state, {'revision': v_state['revision']})
    assert crash.status_code == 500
    assert crash.headers['Content-Security-Policy'] == CSP
    assert crash.get_json() == {'error': 'Internal error; reconnect to continue.'}
    assert victim_key not in store.games

    # Next mutation on the evicted cookie gets 410 expired; GET /api/state recovers cleanly with 200.
    stale_mut = post(victim, '/api/end-turn', v_state, {'revision': v_state['revision']})
    assert stale_mut.status_code == 410 and stale_mut.get_json()['code'] == 'expired'

    recovered = victim.get('/api/state', environ_base={'REMOTE_ADDR': '198.51.100.12'})
    assert recovered.status_code == 200 and recovered.get_json()['phase'] == 'setup'

    # Bystander and /healthz remain completely healthy.
    assert bystander.get('/api/state', environ_base={'REMOTE_ADDR': '198.51.100.11'}).status_code == 200
    assert bystander.get('/healthz').status_code == 200


def test_chruna_move_closes_cleave_window():
    level = custom_level(['chruna'], ['zombie', 'zombie'], {'chruna': [2, 2], 'zombie-1': [3, 2], 'zombie-2': [3, 3]})
    for seed in range(1, 20):
        game = FFArena(level, seed=seed)
        game.start()
        state = game.state()
        while state['turn_id'] != 'chruna' and not game.finished:
            game.advance(autoplay=True)
            state = game.state()
        if game.finished:
            continue
        attack = next((a for a in state['actions'] if a['kind'] == 'attack' and a['label'] == 'Halberd'
                       and a['target_id'] == 'zombie-1'), None)
        if attack is None:
            continue
        state = game.perform(attack['id'])
        if not any(a['kind'] == 'cleave' for a in state['actions']):
            continue
        step = next(a for a in state['actions'] if a['kind'] == 'move' and len(a['path']) == 2)
        state = game.perform(step['id'])
        assert not any(a['kind'] == 'cleave' for a in state['actions']), '5-ft move must close Cleave window'
        return
    raise AssertionError('no Halberd hit opening Cleave found across seeds')


def test_nonstandard_json_and_surrogates_match_live_400_messages(ff_app):
    client = ff_app.test_client()
    state = new_game(client, 'crypt', 'bone_patrol')
    rev = state['revision']
    headers = {'X-CSRF-Token': state['csrf_token']}

    def raw_post(path: str, raw_body: str):
        return client.open(path, method='POST', data=raw_body, content_type='application/json', headers=headers)

    for expr in ('NaN', 'Infinity', '-Infinity', '1e400', str(10**400)):
        r = raw_post('/api/setup', f'{{"revision": {rev}, "monster_control": "ai", "placements": [{{"id": "guy", "x": {expr}, "y": 3}}]}}')
        assert r.status_code == 400 and r.get_json() == {'error': 'Placement coordinates must be in-bounds integers.'}

    for bad_id_body in (
        f'{{"revision": {rev}, "monster_control": "ai", "placements": [{{"id": "\\ud800", "x": 2, "y": 2}}]}}',
        f'{{"revision": {rev}, "monster_control": "ai", "placements": [{{"id": "nobody", "x": NaN, "y": 2}}]}}',
    ):
        r = raw_post('/api/setup', bad_id_body)
        assert r.status_code == 400 and r.get_json() == {'error': 'Unknown or duplicate figure.'}

    for bad_mc in ('NaN', '"\\ud800"'):
        r = raw_post('/api/setup', f'{{"revision": {rev}, "monster_control": {bad_mc}, "placements": []}}')
        assert r.status_code == 400 and r.get_json() == {'error': 'monster_control must be ai or manual.'}

    # Revision unchanged after all invalid setup calls.
    assert client.get('/api/state').get_json()['revision'] == rev

    # Lone surrogate in action_id during setup / non-human turn vs human turn.
    r_setup_act = raw_post('/api/action', f'{{"revision": {rev}, "action_id": "\\ud800"}}')
    assert r_setup_act.status_code == 400 and r_setup_act.get_json() == {'error': 'It is not a human-controlled combat turn.'}

    started = post(client, '/api/start', state, {'revision': rev}).get_json()
    while not started['can_act'] and started['phase'] != 'finished':
        started = post(client, '/api/advance', started, {'revision': started['revision'], 'autoplay': True}).get_json()
    assert started['can_act']
    r_human_act = raw_post('/api/action', f'{{"revision": {started["revision"]}, "action_id": "\\ud800"}}')
    assert r_human_act.status_code == 400 and r_human_act.get_json() == {'error': 'Unknown or unavailable action.'}


@pytest.mark.parametrize('take_move', [False, True])
def test_champion_choice_interrupts_an_enemy_move(take_move):
    level = custom_level(['mara_l3'], ['zombie'], {'mara_l3': [3, 2], 'zombie-1': [4, 2]})
    game = FFArena(level, seed=4)  # Mara scores a critical opportunity attack.
    game.configure(level.suggested_placements(), 'manual')
    state = game.start()
    if state['turn_id'] != 'zombie-1':
        state = game.end_turn()
    away = next(a for a in state['actions'] if a['kind'] == 'move' and (a.get('x'), a.get('y')) == (6, 2))
    state = game.perform(away['id'])
    assert state['champion_interrupt'] and state['turn_id'] == 'mara_l3'
    assert all(a['kind'] == 'move' for a in state['actions'])
    if take_move:
        free_move = next(a for a in state['actions'] if (a.get('x'), a.get('y')) == (2, 2))
        state = game.perform(free_move['id'])
    else:
        state = game.end_turn()
    assert not state['champion_interrupt'] and state['turn_id'] == 'zombie-1'
    coords = {u['id']: [u['x'], u['y']] for u in state['units']}
    assert coords == {'mara_l3': [2 if take_move else 3, 2], 'zombie-1': [6, 2]}


def test_vesper_practice_party_picker_and_fey_presets(ff_app):
    client = ff_app.test_client()
    enc = client.get('/api/encounters').get_json()
    heroes = {h['base_id'] for h in enc['heroes']}
    assert 'vesper' in heroes
    practice = {(g['id'], p['id']) for g in enc['encounters'] for p in g['presets']}
    assert ('whispering_glade', 'vesper_sprite_ring') in practice
    assert ('whispering_glade', 'vesper_glade_ambush') in practice
    assert ('mire_crossing', 'vesper_wisp_fen') in practice

    # Vesper selectable in ANY Practice fight at levels 1, 2 and 3.
    state = client.get('/api/state').get_json()
    for lvl in (1, 2, 3):
        resp = post(client, '/api/new', state, {
            'encounter': 'crypt',
            'preset': 'bone_patrol',
            'hero_level': lvl,
            'party': ['vesper', 'guy', 'curogana'],
        })
        assert resp.status_code == 200, resp.get_json()
        state = resp.get_json()
        party_bases = [h['base_id'] for h in state['level']['party']]
        assert party_bases == ['vesper', 'guy', 'curogana']
        assert all(h['level'] == lvl for h in state['level']['party'])
        expected_id = 'vesper' if lvl == 3 else f'vesper_l{lvl}'
        assert any(u['id'] == expected_id and u['class'] == 'bard' for u in state['units'])

    # Story presets refuse custom party overrides; unknown/duplicate heroes return 400.
    story_bad = post(client, '/api/new', state, {
        'encounter': 'whispering_glade',
        'preset': 'l1_spore_ring',
        'party': ['vesper', 'guy'],
    })
    assert story_bad.status_code == 400
    dup_bad = post(client, '/api/new', state, {
        'encounter': 'crypt',
        'preset': 'bone_patrol',
        'party': ['vesper', 'vesper'],
    })
    assert dup_bad.status_code == 400
    unk_bad = post(client, '/api/new', state, {
        'encounter': 'crypt',
        'preset': 'bone_patrol',
        'party': ['nobody'],
    })
    assert unk_bad.status_code == 400


def test_multisquare_ogre_and_owlbear_web_arena_and_catalogue():
    import ember_rs
    from game.catalogue import CatalogueError, Level

    pool = ember_rs.ContentPool()
    assert 'ogre' in pool.monsters and 'owlbear' in pool.monsters
    assert pool.token_size('ogre') == 2 and pool.token_size('owlbear') == 2
    assert pool.token_size('guy') == 1 and pool.token_size('goblin_minion') == 1

    rows = [
        'HHHHHHHHHHHH',
        'H..........H',
        'H..........H',
        'H..........H',
        'H..........H',
        'H..........H',
        'H..........H',
        'HHHHHHHHHHHH',
    ]
    enc = {'id': 'test_large', 'name': 'Test Large', 'theme': 'woodland', 'blurb': 'Large test'}
    preset = {
        'id': 'ogre_owlbear_test',
        'name': 'Ogre & Owlbear',
        'difficulty': 'Medium',
        'blurb': 'Two Large monsters.',
        'party': ['guy', 'elion'],
        'roster': ['ogre', 'owlbear'],
        'placements': {'guy': [2, 2], 'elion': [2, 4], 'ogre-1': [6, 2], 'owlbear-1': [6, 4]},
    }
    lvl = Level(enc, preset, rows, {'props': []}, 'open_test')
    lvl.check()
    # Adding a third hero via with_party must never collide with any of the 2x2 cells.
    lvl3 = lvl.with_party(['guy', 'elion', 'vesper'], hero_level=3)
    placed = {p['id']: (p['x'], p['y']) for p in lvl3.suggested_placements()}
    large_cells = {(6 + ox, 2 + oy) for ox in range(2) for oy in range(2)} | {(6 + ox, 4 + oy) for ox in range(2) for oy in range(2)}
    assert placed['vesper'] not in large_cells

    # Overlapping a Large monster's non-anchor cell fails catalogue validation.
    bad_preset = dict(preset, placements={'guy': [7, 3], 'elion': [2, 4], 'ogre-1': [6, 2], 'owlbear-1': [6, 4]})
    with pytest.raises(CatalogueError):
        Level(enc, bad_preset, rows, {'props': []}, 'open_test').check()

    # WebArena v22 emits token_size, 4 cells, and Owlbear climb_speed=40; setup rejects footprint overlaps/walls.
    arena = FFArena(lvl, seed=7)
    st = arena.start()
    by_id = {u['id']: u for u in st['units']}
    assert by_id['ogre-1']['token_size'] == 2
    assert by_id['ogre-1']['cells'] == [[6, 2], [6, 3], [7, 2], [7, 3]]
    assert 'climb_speed' not in by_id['ogre-1']
    assert by_id['owlbear-1']['token_size'] == 2
    assert by_id['owlbear-1']['cells'] == [[6, 4], [6, 5], [7, 4], [7, 5]]
    assert by_id['owlbear-1']['climb_speed'] == 40
    assert 'Climb 40 ft' in str(by_id['owlbear-1']['sheet'])

    arena_setup = FFArena(lvl, seed=7)
    with pytest.raises(ValueError):
        arena_setup.configure([
            {'id': 'guy', 'x': 7, 'y': 3},
            {'id': 'ogre-1', 'x': 6, 'y': 2},
        ], 'ai')
    with pytest.raises(ValueError):
        arena_setup.configure([
            {'id': 'guy', 'x': 2, 'y': 2},
            {'id': 'ogre-1', 'x': 10, 'y': 2},  # x=11 is wall
        ], 'ai')


