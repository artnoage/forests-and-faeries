"""Player-facing costs and area previews use the same resources and targets as combat."""
from game.arena import FFArena
from game.catalogue import Level


def arena(actor):
    positions = {actor: [2, 2], 'guy': [2, 3], 'goblin_minion-1': [3, 2], 'goblin_minion-2': [4, 2]}
    level = Level(dict(id='room', name='Room', theme='crypt'),
                  dict(id='test', name='Test', difficulty='Easy', blurb='', hero_level=3,
                       party=[actor, 'guy'], roster=['goblin_minion'] * 2, placements=positions),
                  ['HHHHHHH', 'H.....H', 'H.....H', 'H.....H', 'HHHHHHH'], {}, 'room')
    game = FFArena(level, seed=1)
    game.configure(level.suggested_placements(), 'manual')
    game.start()
    return game, turn(game, actor)


def turn(game, actor):
    for _ in range(8):
        state = game.state()
        if state['turn_id'] == actor:
            return state
        game.end_turn()
    raise AssertionError(f'No turn for {actor}')


def test_area_preview_uses_living_targets_and_the_spells_caster_rule():
    game, before = arena('ilyra_l3')
    missiles = next(a for a in before['actions'] if a.get('spell') == 'magic_missile'
                    and set(a.get('target_ids', [])) == {'goblin_minion-1'})
    assert 'Magic Initiate free cast' in missiles['cost']
    pools = lambda st: {p['label']: p['value'] for p in st['resources']['pools']}
    assert pools(before)['Magic Initiate (magic missile)'] == 1
    game.perform(missiles['id'])
    after = game.state()
    assert pools(after)['Magic Initiate (magic missile)'] == 0
    assert pools(after)['Level 1 slots'] == pools(before)['Level 1 slots']
    assert next(u for u in after['units'] if u['id'] == 'goblin_minion-1')['dead']
    game.end_turn()
    state = turn(game, 'ilyra_l3')
    units = state['units']
    seen, self_hits = set(), set()
    for a in state['actions']:
        spell = a.get('spell')
        if spell not in ('acid_splash', 'shatter', 'burning_hands', 'thunderwave') or 'area' not in a:
            continue
        seen.add(spell)
        cells = {tuple(p) for p in state['areas'][a['area']]}
        affected = [u for u in units if (u['x'], u['y']) in cells and not u['dead']
                    and (u['id'] != 'ilyra_l3' or spell in ('acid_splash', 'shatter'))]
        assert set(a.get('hits', [])) == {u['id'] for u in affected if u['team'] == 'monsters'}
        assert set(a.get('allies', [])) == {u['id'] for u in affected if u['team'] == 'heroes'}
        if 'ilyra_l3' in a.get('allies', []):
            self_hits.add(spell)
    assert {'shatter', 'burning_hands'} <= seen
    assert 'shatter' in self_hits
    paid = next(a for a in state['actions'] if a.get('spell') == 'magic_missile')
    assert 'level 1 slot' in paid['cost']


def test_divine_bonus_spells_show_their_actual_cost():
    game, state = arena('elion')
    heal = next(a for a in state['actions'] if a.get('spell') == 'healing_word' and a['target_id'] == 'guy')
    sanctuary = next(a for a in state['actions'] if a.get('spell') == 'sanctuary')
    assert heal['cost'] == 'bonus action + Magic Initiate free cast'
    assert sanctuary['cost'] == 'bonus action + level 1 slot'
    game.perform(heal['id'])
    assert game.state()['resources']['bonus_action'] == 0
    assert game.state()['resources']['action'] == 1
