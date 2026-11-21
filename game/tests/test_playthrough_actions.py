"""Player-facing costs and area previews use the same resources and targets as combat."""
from game.arena import FFArena
from game.catalogue import Level


def arena(actor, seed=1):
    positions = {actor: [2, 2], 'guy': [2, 3], 'goblin_minion-1': [3, 2], 'goblin_minion-2': [4, 2]}
    level = Level(dict(id='room', name='Room', theme='crypt'),
                  dict(id='test', name='Test', difficulty='Easy', blurb='', hero_level=3,
                       party=[actor, 'guy'], roster=['goblin_minion'] * 2, placements=positions),
                  ['HHHHHHH', 'H.....H', 'H.....H', 'H.....H', 'HHHHHHH'], {}, 'room')
    game = FFArena(level, seed=seed)
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
    lines = [entry['text'] for entry in after['log']]
    darts = [j for j, line in enumerate(lines) if 'Magic Missile hits Goblin Minion 1' in line]
    assert len(darts) == 3 and max(darts) < lines.index('Goblin Minion 1 falls dead.')
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
    assert any(a.get('spell') == 'acid_splash' and (a.get('x'), a.get('y')) == (1, 1)
               and a.get('hits') == [] and 'ilyra_l3' in a.get('allies', [])
               for a in state['actions'])
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


def test_shatter_reports_the_actual_save_and_damage_for_each_target():
    outcomes = set()
    for seed in (1, 2, 3, 4):
        game, before = arena('ilyra_l3', seed=seed)
        casts = [a for a in before['actions'] if a.get('spell') == 'shatter']
        cast = max(casts, key=lambda a: len(a.get('hits', [])) + len(a.get('allies', [])))
        after = game.perform(cast['id'])
        old = {u['id']: u for u in before['units']}
        for effect in after['effects']:
            if effect.get('attack') != 'shatter':
                continue
            target = old[effect['target_id']]
            save = effect['save']
            outcomes.add(save)
            verb = 'makes its save' if save == 'made' else 'fails its save'
            assert any(f"{target['name']} {verb}" in line['text'] and
                       f"takes {effect['amount']} thunder damage" in line['text'] for line in after['log'])
            remaining = next(u['hp'] for u in after['units'] if u['id'] == target['id'])
            assert remaining == max(0, target['hp'] - effect['amount'])
        if outcomes == {'made', 'failed'}:
            break
    assert outcomes == {'made', 'failed'}


def test_magic_initiate_and_a_slot_spell_in_either_order():
    def cast_action(state, spell, target):
        return next(a for a in state['actions'] if a.get('spell') == spell and a.get('target_id') == target)

    def slots(state):
        return next(p['value'] for p in state['resources']['pools'] if p['label'] == 'Level 1 slots')

    for first, second in [('healing_word', 'guiding_bolt'), ('guiding_bolt', 'healing_word')]:
        game, state = arena('elion')
        targets = {'healing_word': 'guy', 'guiding_bolt': 'goblin_minion-1'}
        initial = slots(state)
        for spell in (first, second):
            action = cast_action(state, spell, targets[spell])
            if spell == 'healing_word':
                assert 'free cast' in action['cost'].lower()
            state = game.perform(action['id'])
        assert slots(state) == initial - 1

    game, state = arena('elion')
    state = game.perform(cast_action(state, 'sanctuary', 'guy')['id'])
    assert state['resources']['action'] == 1
    assert all(a.get('spell') != 'guiding_bolt' for a in state['actions'])


def test_defensive_spells_report_the_reaction_and_both_ward_outcomes():
    outcomes = set()
    for hero in ('elion', 'ilyra_l3'):
        game, state = arena(hero, seed=1)
        if hero == 'elion':
            ward = next(a for a in state['actions'] if a.get('spell') == 'sanctuary' and a.get('target_id') == hero)
            state = game.perform(ward['id'])
        for _ in range(22):
            for entry in state['log']:
                text = entry['text']
                if 'makes the Wisdom save against Sanctuary' in text and 'The attack proceeds.' in text:
                    outcomes.add('ward passed')
                if 'fails the Wisdom save against Sanctuary' in text and 'The attack is lost.' in text:
                    outcomes.add('ward failed')
                if 'casts Shield against' in text:
                    assert 'attack ' in text and 'vs AC ' in text
                    assert 'spending a level 1 slot. AC rises to ' in text
                    outcomes.add('shield')
            if state['winner'] or state['phase'] == 'finished':
                break
            attack = next((a for a in state['actions'] if state['turn_id'].startswith('goblin_minion')
                           and a.get('target_id') == hero and 'dagger' in a['label'].lower()), None)
            state = game.perform(attack['id']) if attack else game.end_turn()
    assert outcomes == {'shield', 'ward passed', 'ward failed'}


def test_potent_cantrip_miss_reports_half_damage_and_the_roll_modifiers():
    for seed in range(1, 20):
        game, state = arena('ilyra_l3', seed)
        bolt = next(a for a in state['actions'] if a.get('spell') == 'firebolt' and a.get('target_id') == 'goblin_minion-1')
        state = game.perform(bolt['id'])
        effect = next(e for e in reversed(state['effects']) if e.get('attack') == 'firebolt')
        if effect['outcome'] == 'miss':
            assert effect['amount'] > 0
            assert any('Fire Bolt misses' in l['text'] and 'Potent Cantrip deals' in l['text']
                       and 'enemy in close combat' in l['text'] for l in state['log'])
            return
    raise AssertionError('the fixed seeds should include a Potent Cantrip miss')


def test_spell_payments_debit_the_selected_resource_and_survive_wire_encoding():
    resources = ['Magic Initiate (magic missile)', 'Level 1 slots', 'Level 2 slots']
    for at_level, free, spent in [(1, True, resources[0]), (1, False, resources[1]), (2, False, resources[2])]:
        game, before = arena('curogana')
        actions = {(a['at_level'], bool(a.get('free_cast'))): a for a in before['actions']
                   if a.get('spell') == 'magic_missile' and not a.get('metamagic')
                   and set(a.get('target_ids', [])) == {'goblin_minion-2'}}
        assert set(actions) == {(1, True), (1, False), (2, False)}
        selected = actions[at_level, free]
        wire = game.wire(before)
        rows = {a['id']: a for a in wire['actions']}
        encoded = wire['action_defs'][rows[selected['id']]['d']]
        assert (encoded['at_level'], bool(encoded.get('free_cast'))) == (at_level, free)
        game.perform(selected['id'])
        previous = {p['label']: p['value'] for p in before['resources']['pools']}
        current = {p['label']: p['value'] for p in game.state()['resources']['pools']}
        assert {key: previous[key] - current[key] for key in resources} == {
            key: int(key == spent) for key in resources
        }


def test_attack_preview_reports_only_the_intervening_creatures_cover():
    game, state = arena('curogana')
    wire = game.wire(state)
    rows = {a['id']: a for a in wire['actions']}
    frost = [a for a in state['actions'] if a.get('spell') == 'ray_of_frost' and not a.get('metamagic')]
    assert {a['target_id'] for a in frost} == {'goblin_minion-1', 'goblin_minion-2'}
    for a in frost:
        expected = {'goblin_minion-2': 2} if a['target_id'] == 'goblin_minion-2' else {}
        assert a.get('cover', {}) == rows[a['id']].get('cover', {}) == expected
