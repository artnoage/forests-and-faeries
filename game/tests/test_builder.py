"""SRD 5.2.1 Character Builder & Level-Up (Step 1) tests.

Tests server-side SRD validation, exact arithmetic, equipment/STR bounds,
spell-source edge cases, API/CSRF/Story isolation, dynamic Rust inspect,
and zero-leak intern-table stability over 200 distinct custom sessions.
"""
from __future__ import annotations

import copy
import json

import ember_rs
import pytest

from game import builder, catalogue
from game.arena import FFArena
from game.server import create_app


@pytest.fixture
def ff_app(monkeypatch):
    monkeypatch.setenv('EMBER_UI', 'ff')
    monkeypatch.delenv('FF_PRIVATE_ENCOUNTERS', raising=False)
    return create_app()


def post(client, path, state, body, token=None):
    return client.post(
        path,
        data=json.dumps(body),
        content_type='application/json',
        headers={'X-CSRF-Token': state['csrf_token'] if token is None else token},
    )


def base_fighter(level=1, **overrides):
    r = {
        'name': 'Toren',
        'model_key': 'guy',
        'level': level,
        'class_id': 'fighter',
        'species': 'human',
        'size': 'medium',
        'background': 'soldier',
        'bg_asi_mode': '2_1',
        'bg_asi': {'str': 2, 'con': 1},
        'ability_method': 'standard_array',
        'base_abilities': {'str': 15, 'dex': 12, 'con': 13, 'int': 8, 'wis': 10, 'cha': 14},
        'class_skills': ['perception', 'survival'],
        'species_skill': 'insight',
        'versatile_feat': 'alert',
        'fighting_style': 'defense',
        'weapon_masteries': ['greatsword', 'longsword', 'halberd'],
        'class_equip_choice': 'A',
        'bg_equip_choice': 'A',
        'purchases': [],
        'equipped_armor': 'chain_mail',
        'equipped_shield': False,
        'equipped_weapons': ['greatsword'],
    }
    r.update(overrides)
    return r


def base_barbarian(level=1, **overrides):
    r = {
        'name': 'Krag',
        'model_key': 'chruna',
        'level': level,
        'class_id': 'barbarian',
        'species': 'human',
        'size': 'medium',
        'background': 'soldier',
        'bg_asi_mode': '2_1',
        'bg_asi': {'str': 2, 'con': 1},
        'ability_method': 'standard_array',
        'base_abilities': {'str': 15, 'dex': 13, 'con': 14, 'int': 8, 'wis': 12, 'cha': 10},
        'class_skills': ['perception', 'survival'],
        'species_skill': 'insight',
        'versatile_feat': 'alert',
        'weapon_masteries': ['greataxe', 'halberd'],
        'class_equip_choice': 'A',
        'bg_equip_choice': 'A',
        'purchases': [],
        'equipped_armor': None,
        'equipped_shield': False,
        'equipped_weapons': ['greataxe'],
    }
    if level >= 3:
        r['primal_knowledge_skill'] = 'nature'
    r.update(overrides)
    return r


def base_cleric(level=1, **overrides):
    prep_by_lv = {
        1: ['bless', 'cure_wounds', 'guiding_bolt', 'shield_of_faith'],
        2: ['bless', 'cure_wounds', 'guiding_bolt', 'shield_of_faith', 'command'],
        # Level 3 Life Domain auto-prepares aid, bless, cure_wounds, lesser_restoration
        3: ['guiding_bolt', 'shield_of_faith', 'command', 'sanctuary', 'spiritual_weapon', 'detect_magic'],
    }
    r = {
        'name': 'Sera',
        'model_key': 'elion',
        'level': level,
        'class_id': 'cleric',
        'species': 'human',
        'size': 'medium',
        'background': 'acolyte',
        'bg_asi_mode': '2_1',
        'bg_asi': {'wis': 2, 'cha': 1},
        'ability_method': 'standard_array',
        'base_abilities': {'str': 14, 'dex': 10, 'con': 13, 'int': 8, 'wis': 15, 'cha': 12},
        'class_skills': ['medicine', 'persuasion'],
        'species_skill': 'perception',
        'versatile_feat': 'alert',
        'divine_order': 'protector',
        'class_cantrips': ['sacred_flame', 'spare_the_dying', 'guidance'],
        'class_prepared': prep_by_lv[level],
        'mi_cleric_cantrips': ['thaumaturgy', 'resistance'],
        'mi_cleric_spell': 'healing_word',
        'class_equip_choice': 'A',
        'bg_equip_choice': 'A',
        'purchases': [],
        'equipped_armor': 'chain_shirt',
        'equipped_shield': True,
        'equipped_weapons': ['mace'],
    }
    r.update(overrides)
    return r


def base_wizard(level=1, **overrides):
    sb_by_lv = {
        1: ['burning_hands', 'mage_armor', 'magic_missile', 'shield', 'thunderwave', 'detect_magic'],
        2: ['burning_hands', 'mage_armor', 'magic_missile', 'shield', 'thunderwave', 'detect_magic', 'ray_of_sickness', 'disguise_self'],
        3: ['burning_hands', 'mage_armor', 'magic_missile', 'shield', 'thunderwave', 'detect_magic', 'ray_of_sickness', 'disguise_self', 'scorching_ray', 'shatter', 'blur', 'invisibility'],
    }
    prep_by_lv = {
        1: ['mage_armor', 'magic_missile', 'shield', 'burning_hands'],
        2: ['mage_armor', 'magic_missile', 'shield', 'burning_hands', 'thunderwave'],
        3: ['mage_armor', 'magic_missile', 'shield', 'scorching_ray', 'shatter', 'invisibility'],
    }
    r = {
        'name': 'Mirel',
        'model_key': 'ilyra',
        'level': level,
        'class_id': 'wizard',
        'species': 'human',
        'size': 'medium',
        'background': 'sage',
        'bg_asi_mode': '2_1',
        'bg_asi': {'int': 2, 'con': 1},
        'ability_method': 'standard_array',
        'base_abilities': {'str': 8, 'dex': 14, 'con': 13, 'int': 15, 'wis': 12, 'cha': 10},
        'class_skills': ['investigation', 'insight'],
        'species_skill': 'perception',
        'versatile_feat': 'alert',
        'class_cantrips': ['firebolt', 'ray_of_frost', 'acid_splash'],
        'wizard_spellbook': sb_by_lv[level],
        'class_prepared': prep_by_lv[level],
        'mi_wizard_cantrips': ['mage_hand', 'minor_illusion'],
        'mi_wizard_spell': 'protection_from_evil_and_good',
        'class_equip_choice': 'A',
        'bg_equip_choice': 'A',
        'purchases': [],
        'equipped_armor': None,
        'equipped_shield': False,
        'equipped_weapons': ['quarterstaff', 'dagger'],
    }
    if level >= 2:
        r['scholar_skill'] = 'arcana'
    if level >= 3:
        r['evocation_savant'] = ['scorching_ray', 'shatter']
    r.update(overrides)
    return r


def base_sorcerer(level=1, **overrides):
    prep_by_lv = {
        1: ['burning_hands', 'shield'],
        2: ['burning_hands', 'shield', 'mage_armor', 'thunderwave'],
        # Level 3 Draconic auto-prepares alter_self, chromatic_orb, command, dragons_breath
        3: ['burning_hands', 'shield', 'mage_armor', 'thunderwave', 'scorching_ray', 'see_invisibility'],
    }
    r = {
        'name': 'Zara',
        'model_key': 'curogana',
        'level': level,
        'class_id': 'sorcerer',
        'species': 'elf',
        'lineage': 'high_elf',
        'size': 'medium',
        'background': 'sage',
        'bg_asi_mode': '2_1',
        'bg_asi': {'con': 2, 'wis': 1},
        'ability_method': 'point_buy',
        'base_abilities': {'str': 8, 'dex': 14, 'con': 12, 'int': 10, 'wis': 13, 'cha': 15},
        'class_skills': ['deception', 'persuasion'],
        'species_skill': 'perception',
        'high_elf_cantrip': 'prestidigitation',
        'class_cantrips': ['sorcerous_burst', 'firebolt', 'ray_of_frost', 'acid_splash'],
        'class_prepared': prep_by_lv[level],
        'mi_wizard_cantrips': ['mage_hand', 'minor_illusion'],
        'mi_wizard_spell': 'magic_missile',
        'class_equip_choice': 'A',
        'bg_equip_choice': 'B',
        'purchases': [{'id': 'diamond_50gp', 'qty': 1}],
        'equipped_armor': None,
        'equipped_shield': False,
        'equipped_weapons': ['dagger'],
    }
    if level >= 2:
        r['metamagic'] = ['empowered_spell', 'heightened_spell']
    r.update(overrides)
    return r


def base_bard(level=1, **overrides):
    prep_by_lv = {
        1: ['faerie_fire', 'healing_word', 'thunderwave', 'command'],
        2: ['faerie_fire', 'healing_word', 'thunderwave', 'command', 'cure_wounds'],
        3: ['faerie_fire', 'healing_word', 'thunderwave', 'command', 'shatter', 'invisibility'],
    }
    r = {
        'name': 'Lyra',
        'model_key': 'vesper',
        'level': level,
        'class_id': 'bard',
        'species': 'tiefling',
        'lineage': 'abyssal',
        'size': 'medium',
        'background': 'acolyte',
        'bg_asi_mode': '2_1',
        'bg_asi': {'cha': 2, 'wis': 1},
        'ability_method': 'standard_array',
        'base_abilities': {'str': 8, 'dex': 14, 'con': 12, 'int': 13, 'wis': 10, 'cha': 15},
        'class_skills': ['arcana', 'persuasion', 'stealth'],
        'class_cantrips': ['vicious_mockery', 'starry_wisp'],
        'class_prepared': prep_by_lv[level],
        'mi_cleric_cantrips': ['guidance', 'spare_the_dying'],
        'mi_cleric_spell': 'bless',
        'class_equip_choice': 'A',
        'bg_equip_choice': 'A',
        'purchases': [],
        'equipped_armor': 'leather_armor',
        'equipped_shield': False,
        'equipped_weapons': ['dagger'],
    }
    if level >= 2:
        r['expertise'] = ['arcana', 'persuasion']
    if level >= 3:
        r['lore_skills'] = ['history', 'nature', 'performance']
    r.update(overrides)
    return r


# ---------------------------------------------------------------------------
# 1. All 6 classes L1 -> L2 -> L3 + exact Codex arithmetic
# ---------------------------------------------------------------------------

@pytest.mark.parametrize('factory', [
    base_fighter, base_barbarian, base_cleric, base_wizard, base_sorcerer, base_bard,
])
@pytest.mark.parametrize('level', [1, 2, 3])
def test_all_six_classes_validate_through_rust(factory, level):
    res = builder.validate_and_derive(factory(level=level), unit_id=f'custom_{level}')
    doc = res['content_doc']
    assert doc['schema'] == 1
    assert doc['pc'] is True
    assert doc['classes'][factory.__name__.removeprefix('base_')] == level
    assert res['summary']['max_hp'] == doc['max_hp']
    assert res['summary']['ac'] == doc['ac']


def test_codex_fighter_and_draconic_sorcerer_hp_progression():
    # Fighter CON 14 (+2): L1=12, L2=20, L3=28; also tests Soldier +1/+1/+1 mode
    f_hps = []
    for lv in (1, 2, 3):
        res = builder.validate_and_derive(base_fighter(
            level=lv,
            bg_asi_mode='1_1_1',
            bg_asi={'str': 1, 'dex': 1, 'con': 1},
            base_abilities={'str': 15, 'dex': 12, 'con': 13, 'int': 8, 'wis': 10, 'cha': 14},
        ))
        assert res['summary']['abilities']['str'] == 16
        assert res['summary']['abilities']['dex'] == 13
        assert res['summary']['abilities']['con'] == 14
        f_hps.append(res['summary']['max_hp'])
    assert f_hps == [12, 20, 28]

    # Draconic Sorcerer CON 14 (+2): L1=8, L2=14, L3=23 (+3 Draconic Resilience)
    s_hps = []
    for lv in (1, 2, 3):
        res = builder.validate_and_derive(base_sorcerer(level=lv))
        assert res['summary']['abilities']['con'] == 14
        s_hps.append(res['summary']['max_hp'])
    assert s_hps == [8, 14, 23]
    # L3 Draconic Resilience unarmored AC = 10 + DEX(+2) + CHA(+2) = 14
    s3 = builder.validate_and_derive(base_sorcerer(level=3))
    assert s3['summary']['ac'] == 14


# ---------------------------------------------------------------------------
# 2. STR boundaries (12/13/14/15), starting equipment packages, CP math, TWF
# ---------------------------------------------------------------------------

def test_str_bounds_heavy_weapon_and_heavy_armor():
    # STR 12 Fighter owning Package A (Chain Mail + Greatsword + 8 Javelins):
    # cannot equip Chain Mail (STR 13) or Greatsword (STR 13), but STILL OWNS them
    str12_base = {'str': 10, 'dex': 14, 'con': 15, 'int': 8, 'wis': 12, 'cha': 13}
    with pytest.raises(builder.BuilderError) as e_arm:
        builder.validate_and_derive(base_fighter(
            base_abilities=str12_base,
            bg_asi={'str': 2, 'con': 1},
            equipped_armor='chain_mail',
            equipped_weapons=['javelin'],
        ))
    assert any(x['field'] == 'equipped_armor' and '13' in x['message'] for x in e_arm.value.errors)

    with pytest.raises(builder.BuilderError) as e_wep:
        builder.validate_and_derive(base_fighter(
            base_abilities=str12_base,
            bg_asi={'str': 2, 'con': 1},
            equipped_armor=None,
            equipped_weapons=['greatsword'],
        ))
    assert any(x['field'] == 'equipped_weapons' and '13' in x['message'] for x in e_wep.value.errors)

    # Owning Package A at STR 12 and equipping only Javelin succeeds, and keeps Chain Mail/Greatsword/Flail in pack
    ok12 = builder.validate_and_derive(base_fighter(
        base_abilities=str12_base,
        bg_asi={'str': 2, 'con': 1},
        equipped_armor=None,
        equipped_weapons=['javelin'],
    ))
    assert ok12['summary']['owned_counts']['greatsword'] == 1
    assert ok12['summary']['owned_counts']['chain_mail'] == 1
    assert ok12['summary']['owned_counts']['flail'] == 1
    assert ok12['content_doc']['loadout']['spares'] == {'javelin': 7}

    # STR 13 allows both Chain Mail and Greatsword
    ok13 = builder.validate_and_derive(base_fighter(
        base_abilities={'str': 12, 'dex': 14, 'con': 15, 'int': 8, 'wis': 10, 'cha': 13},
        bg_asi={'str': 1, 'con': 2},
        equipped_armor='chain_mail',
        equipped_weapons=['greatsword'],
    ))
    assert ok13['summary']['abilities']['str'] == 13
    assert ok13['summary']['ac'] == 17  # 16 + Defense +1

    # Splint Armor (200 GP): affordable with Fighter C (155 GP) + Soldier B (50 GP) = 205 GP
    # Blocked at STR 14, allowed at STR 15 (pair with Quarterstaff, 2 SP)
    splint_recipe = base_fighter(
        class_equip_choice='C',
        bg_equip_choice='B',
        purchases=[{'id': 'splint', 'qty': 1}, {'id': 'quarterstaff', 'qty': 1}],
        equipped_armor='splint',
        equipped_weapons=['quarterstaff'],
        base_abilities={'str': 13, 'dex': 12, 'con': 15, 'int': 8, 'wis': 10, 'cha': 14},
        bg_asi={'str': 1, 'con': 2},
    )
    with pytest.raises(builder.BuilderError) as e_sp:
        builder.validate_and_derive(splint_recipe)
    assert any(x['field'] == 'equipped_armor' and '15' in x['message'] for x in e_sp.value.errors)

    splint_recipe['bg_asi'] = {'str': 2, 'con': 1}
    ok15 = builder.validate_and_derive(splint_recipe)
    assert ok15['summary']['abilities']['str'] == 15
    assert ok15['summary']['ac'] == 18  # 17 + Defense +1
    assert ok15['summary']['remaining_cp'] == 480  # 205 GP - 200 GP 2 SP = 4 GP 8 SP


def test_equipment_packs_cp_math_and_twf_cap():
    # Fighter Package B owns Longbow + Scimitar + Shortsword + Studded Leather;
    # cannot equip Longbow (sheet item) or two Light weapons (Scimitar + Shortsword)
    with pytest.raises(builder.BuilderError):
        builder.validate_and_derive(base_fighter(
            class_equip_choice='B',
            equipped_armor='studded_leather',
            equipped_weapons=['scimitar', 'shortsword'],
        ))
    with pytest.raises(builder.BuilderError):
        builder.validate_and_derive(base_fighter(
            class_equip_choice='B',
            equipped_armor='studded_leather',
            equipped_weapons=['longbow'],
        ))
    # Exact CP math: Fighter A (4 GP) + Soldier A (14 GP) = 18 GP = 1800 CP;
    # Buy Greatclub (2 SP = 20 CP) + 3 Javelins (15 SP = 150 CP) => 1630 CP = 16 GP, 3 SP
    res = builder.validate_and_derive(base_fighter(
        purchases=[{'id': 'greatclub', 'qty': 1}, {'id': 'javelin', 'qty': 3}],
    ))
    assert res['summary']['remaining_cp'] == 1630
    assert res['summary']['coins_label'] == '16 GP, 3 SP'
    assert res['summary']['owned_counts']['shortbow'] == 1

    # Overspending fails cleanly
    with pytest.raises(builder.BuilderError) as e_over:
        builder.validate_and_derive(base_fighter(
            purchases=[{'id': 'greatsword', 'qty': 1}],  # 50 GP > 18 GP
        ))
    assert any(x['field'] == 'purchases' for x in e_over.value.errors)


# ---------------------------------------------------------------------------
# 3. Codex 11:03 Recheck Edge Cases (#1 Bard L2/MI swap, #2 Barbarian L3, #3 Chromatic Orb)
# ---------------------------------------------------------------------------

def test_codex_recheck1_bard_l1_to_l2_and_cleric_6_cantrips():
    # Human Acolyte Bard with MI(Cleric) healing_word at L1 -> L2:
    # (a) Advance to L2 keeping MI healing_word using Bard L1 inert spells
    b1 = base_bard(
        level=1,
        species='human',
        lineage=None,
        species_skill='insight',  # wait: acolyte grants insight+religion, pick acrobatics
        versatile_feat='alert',
        mi_cleric_spell='healing_word',
        class_prepared=['faerie_fire', 'thunderwave', 'command', 'cure_wounds'],
    )
    b1['species_skill'] = 'acrobatics'
    assert builder.validate_and_derive(b1)['summary']['level'] == 1

    b2_inert = copy.deepcopy(b1)
    b2_inert['level'] = 2
    b2_inert['expertise'] = ['arcana', 'persuasion']
    b2_inert['class_prepared'] = ['faerie_fire', 'thunderwave', 'command', 'cure_wounds', 'detect_magic']
    res_b2 = builder.validate_and_derive(b2_inert)
    assert 'detect_magic' in res_b2['content_doc']['spellcasting']['inert_spells']

    # (b) Or advance to L2 via MI Spell Change (healing_word -> bless) and prepare healing_word as Bard
    b2_swap = copy.deepcopy(b1)
    b2_swap['level'] = 2
    b2_swap['expertise'] = ['arcana', 'persuasion']
    b2_swap['mi_cleric_spell'] = 'bless'
    b2_swap['class_prepared'] = ['faerie_fire', 'thunderwave', 'command', 'cure_wounds', 'healing_word']
    res_swap = builder.validate_and_derive(b2_swap)
    assert 'bless' in [fc['spell'] for fc in res_swap['content_doc']['spellcasting']['free_casts']]

    # (c) Acolyte Thaumaturge Cleric needs 4 class cantrips + 2 MI(Cleric) cantrips = 6 distinct Cleric cantrips
    c_thau = base_cleric(
        level=1,
        divine_order='thaumaturge',
        class_cantrips=['sacred_flame', 'spare_the_dying', 'guidance', 'mending'],
        mi_cleric_cantrips=['thaumaturgy', 'resistance'],
    )
    res_thau = builder.validate_and_derive(c_thau)
    assert len(res_thau['summary']['spellcasting']['all_sheet_spells']) >= 6

    # (d) Cleric L3 Life Domain collision with MI(Cleric) cure_wounds rejected with swap hint
    with pytest.raises(builder.BuilderError) as e_col:
        builder.validate_and_derive(base_cleric(level=3, mi_cleric_spell='cure_wounds'))
    assert any('Spell Change' in x['message'] for x in e_col.value.errors)


def test_codex_recheck2_barbarian_l3_primal_knowledge_reservation():
    # Soldier grants athletics + intimidation (2 Barbarian skills).
    # Class picks 2 more: perception + survival (4 of 6).
    # Human Skillful + Skilled picking the remaining 2 (animal_handling + nature) leaves 0 for L3!
    exhausted = base_barbarian(
        level=1,
        versatile_feat='skilled',
        species_skill='animal_handling',
        skilled_skills=['nature', 'acrobatics', 'stealth'],
    )
    with pytest.raises(builder.BuilderError) as e_res:
        builder.validate_and_derive(exhausted)
    assert any('Primal Knowledge' in x['message'] for x in e_res.value.errors)

    # Leaving 'nature' unproficient succeeds at L1 and unlocks Primal Knowledge at L3
    reserved = base_barbarian(
        level=1,
        versatile_feat='skilled',
        species_skill='animal_handling',
        skilled_skills=['insight', 'acrobatics', 'stealth'],
    )
    assert builder.validate_and_derive(reserved)['summary']['level'] == 1
    reserved['level'] = 3
    reserved['primal_knowledge_skill'] = 'nature'
    res3 = builder.validate_and_derive(reserved)
    assert 'nature' in res3['summary']['proficient_skills']


def test_codex_recheck3_chromatic_orb_diamond_50gp_gate():
    # Draconic Sorcerer L3: Package A (28 GP) + Acolyte A (8 GP) = 36 GP -> cannot buy 50 GP diamond
    no_diamond = base_sorcerer(
        level=3,
        background='acolyte',
        bg_asi={'cha': 2, 'con': 0} if False else {'cha': 2, 'wis': 1},
        base_abilities={'str': 8, 'dex': 14, 'con': 14, 'int': 10, 'wis': 12, 'cha': 13},
        bg_equip_choice='A',
        purchases=[],
        mi_cleric_cantrips=['guidance', 'thaumaturgy'],
        mi_cleric_spell='bless',
        mi_wizard_cantrips=None,
        mi_wizard_spell=None,
    )
    no_diamond.pop('mi_wizard_cantrips')
    no_diamond.pop('mi_wizard_spell')
    res_no = builder.validate_and_derive(no_diamond)
    sc_no = res_no['content_doc']['spellcasting']
    assert 'chromatic_orb' in sc_no['inert_spells']
    assert 'chromatic_orb' not in sc_no['spells']
    assert 'chromatic_orb' in res_no['custom_hero_input']['inert_spell_reasons']
    assert any('50 GP Diamond' in w for w in res_no['warnings'])

    # Package A (28 GP) + Sage B (50 GP) = 78 GP -> buys diamond_50gp -> Chromatic Orb IS active!
    with_diamond = base_sorcerer(level=3)
    res_yes = builder.validate_and_derive(with_diamond)
    sc_yes = res_yes['content_doc']['spellcasting']
    assert 'chromatic_orb' in sc_yes['spells']
    assert 'chromatic_orb' not in sc_yes['inert_spells']

    # MI(Wizard) Chromatic Orb without diamond: omitted from free_casts & placed in inert_spells
    wiz_mi_orb = base_wizard(
        level=1,
        mi_wizard_spell='chromatic_orb',
    )
    res_mi = builder.validate_and_derive(wiz_mi_orb)
    sc_mi = res_mi['content_doc']['spellcasting']
    assert 'chromatic_orb' in sc_mi['inert_spells']
    assert 'chromatic_orb' not in [fc['spell'] for fc in sc_mi['free_casts']]


# ---------------------------------------------------------------------------
# 4. Spell sources, Point Buy bounds, non-caster restrictions
# ---------------------------------------------------------------------------

def test_spell_sources_point_buy_and_caster_guards():
    # Human Sage + Versatile MI(Cleric) cannot duplicate protection_from_evil_and_good
    dup_fc = base_wizard(
        level=1,
        versatile_feat='magic_initiate_cleric',
        mi_cleric_cantrips=['guidance', 'spare_the_dying'],
        mi_cleric_spell='protection_from_evil_and_good',
        mi_wizard_spell='protection_from_evil_and_good',
    )
    with pytest.raises(builder.BuilderError):
        builder.validate_and_derive(dup_fc)

    # Distinct free casts succeed
    dup_fc['mi_cleric_spell'] = 'bless'
    ok_fc = builder.validate_and_derive(dup_fc)
    assert len(ok_fc['content_doc']['spellcasting']['free_casts']) == 2

    # Sorcerer + MI(Wizard): class/Draconic spells carry sorcerer_spell=True, MI spells do NOT
    s3 = builder.validate_and_derive(base_sorcerer(level=3))
    by_id = {x['id']: x for x in s3['content_doc']['spellcasting']['spell_info']}
    assert by_id['burning_hands'].get('sorcerer_spell') is True
    assert by_id['chromatic_orb'].get('sorcerer_spell') is True
    assert by_id['magic_missile'].get('sorcerer_spell') is None

    # Cross-list attack-mod parity guard: Wizard INT 12 (+1) with MI(Cleric) Guiding Bolt & WIS 16 (+3) rejected
    cross_bad = base_wizard(
        level=1,
        versatile_feat='magic_initiate_cleric',
        base_abilities={'str': 8, 'dex': 13, 'con': 14, 'int': 10, 'wis': 15, 'cha': 12},
        bg_asi={'int': 2, 'wis': 1},
        mi_cleric_cantrips=['guidance', 'spare_the_dying'],
        mi_cleric_spell='guiding_bolt',
    )
    with pytest.raises(builder.BuilderError) as e_cb:
        builder.validate_and_derive(cross_bad)
    assert any('casting ability' in x['message'] for x in e_cb.value.errors)

    # Point Buy: < 27 accepted with warning, > 27 rejected, < 8 / > 15 rejected
    pb_under = builder.validate_and_derive(base_fighter(
        ability_method='point_buy',
        base_abilities={'str': 14, 'dex': 12, 'con': 13, 'int': 8, 'wis': 10, 'cha': 8},
    ))
    assert any('unspent' in w for w in pb_under['warnings'])

    with pytest.raises(builder.BuilderError):
        builder.validate_and_derive(base_fighter(
            ability_method='point_buy',
            base_abilities={'str': 15, 'dex': 15, 'con': 15, 'int': 10, 'wis': 8, 'cha': 8},
        ))
    with pytest.raises(builder.BuilderError):
        builder.validate_and_derive(base_fighter(
            ability_method='point_buy',
            base_abilities={'str': 16, 'dex': 10, 'con': 10, 'int': 8, 'wis': 8, 'cha': 8},
        ))

    # Non-caster rejects Elf / Tiefling / Acolyte / Sage / Magic Initiate
    for patch in [
        {'species': 'elf', 'lineage': 'high_elf'},
        {'species': 'tiefling', 'lineage': 'abyssal'},
        {'background': 'acolyte', 'bg_asi': {'wis': 2, 'cha': 1}},
        {'versatile_feat': 'magic_initiate_wizard'},
    ]:
        with pytest.raises(builder.BuilderError):
            builder.validate_and_derive(base_fighter(**patch))


# ---------------------------------------------------------------------------
# 5. API endpoints, Story-mode isolation, dynamic Bard inspect, 200-session leak test
# ---------------------------------------------------------------------------

def test_api_builder_options_preview_security_and_story_rejection(ff_app):
    client = ff_app.test_client()
    state = client.get('/api/state').get_json()

    opts = client.get('/api/builder/options')
    assert opts.status_code == 200
    odata = opts.get_json()
    assert set(odata['classes']) == {'fighter', 'barbarian', 'cleric', 'wizard', 'sorcerer', 'bard'}

    # Preview requires CSRF
    no_csrf = post(client, '/api/builder/preview', state, {'recipe': base_bard(level=3)}, token='bad')
    assert no_csrf.status_code == 403

    # Valid preview returns derived summary
    prev = post(client, '/api/builder/preview', state, {'recipe': base_bard(level=2)})
    assert prev.status_code == 200, prev.get_json()
    pdata = prev.get_json()
    assert pdata['summary']['name'] == 'Lyra'
    assert pdata['summary']['next_level_preview']['next_level'] == 3

    # Tampered/injected fields or XSS names return 400
    tampered = base_fighter(level=1)
    tampered['ac'] = 99
    assert post(client, '/api/builder/preview', state, {'recipe': tampered}).status_code == 400
    assert post(client, '/api/builder/preview', state, {'recipe': base_fighter(name='<script>alert(1)</script>')}).status_code == 400
    assert post(client, '/api/builder/preview', state, {'recipe': base_fighter(name='A' * 33)}).status_code == 400

    # Launch Practice encounter with custom non-Vesper Bard (CHA 15 -> +2 -> 2 BI uses) + Guy
    custom_bard = base_bard(
        level=3,
        name='Tamsin',
        model_key='guy',
        bg_asi={'wis': 2, 'int': 1},
        base_abilities={'str': 8, 'dex': 14, 'con': 12, 'int': 13, 'wis': 10, 'cha': 15},
        expertise=['arcana', 'persuasion'],
        lore_skills=['history', 'nature', 'performance'],
    )
    new_resp = post(client, '/api/new', state, {
        'encounter': 'crypt',
        'preset': 'bone_patrol',
        'party': ['custom:0', 'guy'],
        'custom_heroes': [custom_bard],
    })
    assert new_resp.status_code == 200, new_resp.get_json()
    setup = new_resp.get_json()
    tamsin = next(u for u in setup['units'] if u['id'] == 'custom_1')
    assert tamsin['name'] == 'Tamsin'
    assert tamsin['base_id'] == 'guy'
    sheet_text = json.dumps(tamsin['sheet'])
    assert '2 uses' in sheet_text
    assert 'Arcana' in sheet_text and 'Persuasion' in sheet_text
    assert 'History' in sheet_text and 'Nature' in sheet_text and 'Performance' in sheet_text
    assert 'Vesper' not in sheet_text

    # Setup & start real combat with the custom hero
    placed = post(client, '/api/setup', setup, {
        'revision': setup['revision'],
        'placements': setup['setup']['suggested_placements'],
        'monster_control': 'ai',
    })
    assert placed.status_code == 200, placed.get_json()
    pdata2 = placed.get_json()
    started = post(client, '/api/start', pdata2, {'revision': pdata2['revision']})
    assert started.status_code == 200, started.get_json()
    assert started.get_json()['phase'] != 'setup'

    # Story presets MUST reject custom_heroes with 400
    levels = catalogue.load(include_private=False)
    story_levels = [lv for lv in levels.values() if lv.preset.get('story')]
    assert story_levels, 'Expected Story presets in catalogue'
    for slv in story_levels:
        bad = post(client, '/api/new', state, {
            'encounter': slv.encounter_id,
            'preset': slv.preset_id,
            'party': ['custom:0'],
            'custom_heroes': [custom_bard],
        })
        assert bad.status_code == 400, (slv.encounter_id, slv.preset_id, bad.get_json())


def test_200_distinct_custom_hero_sessions_zero_intern_leak():
    levels = catalogue.load(include_private=False)
    base_lv = levels[('crypt', 'bone_patrol')]
    # Warm up once
    w_lv = base_lv.with_party(['custom:0', 'guy'], custom_heroes=[base_bard(level=3, name='Warmup Hero')])
    _ = FFArena(w_lv, seed=1)

    before = ember_rs.intern_table_size()
    for i in range(200):
        lv = base_lv.with_party(['custom:0', 'guy'], custom_heroes=[base_bard(level=3, name=f'Hero {i}')])
        arena = FFArena(lv, seed=100 + i)
        assert arena.state()['units'][0]['name'] == f'Hero {i}'
    after = ember_rs.intern_table_size()
    assert after == before, f'intern table grew from {before} to {after} across 200 custom hero sessions'


def test_unhashable_and_wrong_type_fields_return_400_and_preserve_session(ff_app):
    client = ff_app.test_client()
    initial = client.get('/api/state').get_json()
    orig_csrf = initial['csrf_token']
    orig_rev = initial['revision']

    # Fuzz EVERY allowed recipe key across multiple class/species bases so every
    # branch of validate_and_derive is hit with unhashable lists/dicts & bad scalars.
    bases = [
        base_fighter(level=3),
        base_barbarian(level=3),
        base_cleric(level=3),
        base_wizard(level=3),
        base_bard(level=3),
    ]
    bad_values = [[], {}, ['x'], {'k': 'v'}, 123, True]
    for base in bases:
        for key in sorted(builder.RECIPE_ALLOWED_KEYS):
            for bad in bad_values:
                if key == 'equipped_shield' and bad is True:
                    continue
                if key == 'version' and bad == 123:
                    continue
                if key in ('purchases', 'class_skills', 'skilled_skills', 'lore_skills',
                           'expertise', 'metamagic', 'weapon_masteries', 'equipped_weapons',
                           'class_cantrips', 'class_prepared', 'wizard_spellbook', 'prior_spellbook',
                           'evocation_savant', 'mi_cleric_cantrips', 'mi_wizard_cantrips') and bad == []:
                    continue
                rec = copy.deepcopy(base)
                rec[key] = bad
                resp = post(client, '/api/builder/preview', initial, {'recipe': rec})
                assert resp.status_code == 400, (
                    f'/api/builder/preview {base["class_id"]}.{key}={bad!r} -> {resp.status_code} {resp.get_json()}'
                )
                body = resp.get_json()
                assert body['valid'] is False and body['errors']

    # Specifically verify Claude's listed fields on /api/new return 400 AND do NOT drop the caller's game
    targeted = [
        (base_fighter(level=1), 'class_id', []),
        (base_fighter(level=1), 'species', {}),
        (base_fighter(level=1), 'background', ['soldier']),
        (base_wizard(level=1), 'lineage', {'x': 1}),
        (base_fighter(level=1), 'model_key', ['guy']),
        (base_fighter(level=1), 'class_equip_choice', {}),
        (base_fighter(level=1), 'bg_equip_choice', []),
        (base_fighter(level=1), 'equipped_armor', ['chain_mail']),
        (base_cleric(level=1), 'mi_cleric_spell', ['bless']),
        (base_wizard(level=1), 'mi_wizard_spell', {}),
        (base_wizard(level=3), 'scholar_skill', []),
        (base_barbarian(level=3), 'primal_knowledge_skill', {}),
    ]
    for base, field, bad in targeted:
        rec = copy.deepcopy(base)
        rec[field] = bad
        resp = post(client, '/api/new', initial, {
            'encounter': 'crypt',
            'preset': 'bone_patrol',
            'party': ['custom:0'],
            'custom_heroes': [rec],
        })
        assert resp.status_code == 400, f'/api/new {field}={bad!r} -> {resp.status_code}'
        # Caller's active session must remain intact (same CSRF token & revision, never 410/reset)
        after = client.get('/api/state').get_json()
        assert after['csrf_token'] == orig_csrf, f'/api/new dropped session on {field}={bad!r}'
        assert after['revision'] == orig_rev, f'/api/new altered revision on {field}={bad!r}'


# ---------------------------------------------------------------------------
# 7. Codex 16:33 Audit Fixes (MI Shield, Thrown Spear, Evocation Savant, Tiefling+Acolyte+Thaumaturge)
# ---------------------------------------------------------------------------

def test_codex_audit_1633_four_rules_fixes():
    # 1. Magic Initiate (Wizard) excludes Shield (reaction free cast not yet supported in Rust),
    #    while Wizard & Sorcerer characters can still learn and cast Shield normally with spell slots.
    with pytest.raises(builder.BuilderError) as e_mi_sh:
        builder.validate_and_derive(base_wizard(
            level=1,
            mi_wizard_spell='shield',
            class_prepared=['burning_hands', 'mage_armor', 'magic_missile', 'thunderwave'],
        ))
    assert any(x['field'] == 'mi_wizard_spell' and 'Shield' in x['message'] for x in e_mi_sh.value.errors)
    assert builder.builder_options()['spells']['shield']['mi_excluded'] is True
    # Normal Wizard preparing Shield with slots still succeeds
    ok_wiz = builder.validate_and_derive(base_wizard(level=1))
    assert 'shield' in ok_wiz['content_doc']['spellcasting']['reaction_spells']

    # 2. Versatile + Thrown Spear requires a Shield or non-thrown off-hand weapon so thrown Spear
    #    always uses SRD 1d6 (never 1d8 from empty off-hand or after throwing an off-hand Dagger).
    with pytest.raises(builder.BuilderError) as e_sp_alone:
        builder.validate_and_derive(base_fighter(equipped_weapons=['spear'], equipped_shield=False))
    assert any(x['field'] == 'equipped_weapons' and '1d6' in x['message'] for x in e_sp_alone.value.errors)

    # Spear + thrown Dagger still rejected (throwing Dagger frees off-hand mid-combat)
    with pytest.raises(builder.BuilderError) as e_sp_dag:
        builder.validate_and_derive(base_sorcerer(equipped_weapons=['spear', 'dagger']))
    assert any(x['field'] == 'equipped_weapons' and '1d6' in x['message'] for x in e_sp_dag.value.errors)

    # Spear + Shield (bought for 10 GP from Fighter A + Soldier A 18 GP) -> ALLOWED, 1d6 melee & 1d6 thrown!
    sp_shield = builder.validate_and_derive(base_fighter(
        purchases=[{'id': 'shield', 'qty': 1}],
        equipped_shield=True,
        equipped_weapons=['spear'],
    ))
    spear_atks = [a for a in sp_shield['content_doc']['attacks'] if a['name'] == 'spear']
    assert len(spear_atks) == 2
    assert all(a['damage'].startswith('1d6') for a in spear_atks)

    # Spear + non-thrown off-hand (Quarterstaff, 2 SP) -> ALLOWED, 1d6 melee & 1d6 thrown!
    sp_staff = builder.validate_and_derive(base_sorcerer(
        purchases=[{'id': 'quarterstaff', 'qty': 1}],
        equipped_weapons=['spear', 'quarterstaff'],
    ))
    sorc_spear = [a for a in sp_staff['content_doc']['attacks'] if a['name'] == 'spear']
    assert len(sorc_spear) == 2 and all(a['damage'].startswith('1d6') for a in sorc_spear)

    # 3. Evocation Savant MUST add 2 newly learned Evocations (cannot tag already-known L1 spells to
    #    smuggle 4 non-evocation L2 spells, or tag spells from saved L2 prior_spellbook).
    l2_wiz = base_wizard(level=2)
    l2_sb = list(l2_wiz['wizard_spellbook'])
    assert builder.validate_and_derive(l2_wiz)['summary']['level'] == 2

    # (a) Codex exact stateless reproducer: retain 8 L1 spells + add 4 non-evocation L2 spells,
    #     tag existing burning_hands + magic_missile as Evocation Savant -> REJECTED!
    cheat_stateless = base_wizard(
        level=3,
        wizard_spellbook=l2_sb + ['blur', 'dragons_breath', 'see_invisibility', 'invisibility'],
        evocation_savant=['burning_hands', 'magic_missile'],
        class_prepared=['mage_armor', 'magic_missile', 'shield', 'blur', 'invisibility', 'see_invisibility'],
    )
    with pytest.raises(builder.BuilderError) as e_ev1:
        builder.validate_and_derive(cheat_stateless)
    assert any(x['field'] == 'evocation_savant' for x in e_ev1.value.errors)

    # (b) Saved L2 -> L3 transition with prior_spellbook: adding 2 L1 non-evocations + 2 L2 non-evocations
    #     and tagging already-known L1 evocations as Savant -> REJECTED!
    l2_alt_sb = ['burning_hands', 'mage_armor', 'magic_missile', 'shield', 'thunderwave', 'chromatic_orb', 'ray_of_sickness', 'protection_from_evil_and_good']
    cheat_l2_l3 = base_wizard(
        level=3,
        prior_spellbook=l2_alt_sb,
        wizard_spellbook=l2_alt_sb + ['detect_magic', 'disguise_self', 'blur', 'invisibility'],
        evocation_savant=['burning_hands', 'magic_missile'],
        class_prepared=['mage_armor', 'magic_missile', 'shield', 'blur', 'invisibility', 'thunderwave'],
    )
    with pytest.raises(builder.BuilderError) as e_ev2:
        builder.validate_and_derive(cheat_l2_l3)
    assert any(x['field'] == 'evocation_savant' and 'already in your Level 2 spellbook' in x['message'] for x in e_ev2.value.errors)

    # (c) Legitimate saved L2 -> L3 path: retain all 8 L2 spells + 2 normal L3 (blur, invisibility) +
    #     2 NEW Evocation Savant spells (scorching_ray, shatter) -> ACCEPTED!
    legit_l2_l3 = base_wizard(
        level=3,
        prior_spellbook=l2_sb,
        wizard_spellbook=l2_sb + ['blur', 'invisibility', 'scorching_ray', 'shatter'],
        evocation_savant=['scorching_ray', 'shatter'],
    )
    assert builder.validate_and_derive(legit_l2_l3)['summary']['level'] == 3

    # 4. Abyssal Tiefling + Acolyte + Thaumaturge explicitly gated (needs 7 Cleric cantrips, Step 1 has 6),
    #    while Abyssal Tiefling + Acolyte + Protector and Abyssal Tiefling + Criminal + Thaumaturge succeed.
    bad_tief_thau = base_cleric(
        level=1,
        species='tiefling',
        lineage='abyssal',
        species_skill=None,
        versatile_feat=None,
        divine_order='thaumaturge',
        mi_cleric_cantrips=['guidance', 'resistance'],
        class_cantrips=['sacred_flame', 'spare_the_dying', 'mending', 'thaumaturgy'],
    )
    with pytest.raises(builder.BuilderError) as e_tief:
        builder.validate_and_derive(bad_tief_thau)
    assert any(x['field'] == 'divine_order' and '7 distinct Cleric cantrips' in x['message'] for x in e_tief.value.errors)

    ok_tief_prot = base_cleric(
        level=1,
        species='tiefling',
        lineage='abyssal',
        species_skill=None,
        versatile_feat=None,
        divine_order='protector',
        mi_cleric_cantrips=['guidance', 'resistance'],
        class_cantrips=['sacred_flame', 'spare_the_dying', 'mending'],
    )
    assert builder.validate_and_derive(ok_tief_prot)['summary']['species_label'] == 'Tiefling (Abyssal Legacy)'

    ok_tief_crim_thau = base_cleric(
        level=1,
        species='tiefling',
        lineage='abyssal',
        species_skill=None,
        versatile_feat=None,
        background='criminal',
        bg_asi={'con': 2, 'dex': 1},
        divine_order='thaumaturge',
        class_cantrips=['sacred_flame', 'spare_the_dying', 'guidance', 'mending'],
        mi_cleric_cantrips=[],
        mi_cleric_spell=None,
    )
    assert builder.validate_and_derive(ok_tief_crim_thau)['summary']['level'] == 1


def test_every_offered_origin_class_combination_is_completable_l1_to_l3():
    """Exhaustively prove zero uncompletable dead-end combinations remain across Step 1."""
    checked = 0
    for cid, cls in builder.CLASSES.items():
        is_caster = cid in builder.CASTER_CLASSES
        orders = list(builder.DIVINE_ORDERS) if cid == 'cleric' else [None]
        for sid, sp in builder.SPECIES.items():
            if sp['caster_only'] and not is_caster:
                continue
            lineages = list(sp['lineages']) if sp['lineages'] else [None]
            for lin in lineages:
                for bid, bg in builder.BACKGROUNDS.items():
                    if bg['caster_only'] and not is_caster:
                        continue
                    vfeats = (
                        [f for f, fi in builder.ORIGIN_FEATS.items() if f != bg['feat'] and (is_caster or not fi['caster_only'])]
                        if sid == 'human' else [None]
                    )
                    for vf in vfeats:
                        for order in orders:
                            feats = [bg['feat']] + ([vf] if vf else [])
                            # Skip the explicitly gated Abyssal Tiefling + MI(Cleric) + Thaumaturge combination
                            if cid == 'cleric' and order == 'thaumaturge' and sid == 'tiefling' and 'magic_initiate_cleric' in feats:
                                continue
                            # Construct a clean legal L3 build (strictest level for slots/cantrips/skills/spells)
                            base_ab = dict(cls['recommended_array'])
                            # Align bg_asi with class casting ability if possible, else first two bg abilities
                            cast_ab = cls.get('casting_ability')
                            ab1 = cast_ab if (cast_ab and cast_ab in bg['abilities']) else bg['abilities'][0]
                            ab2 = next(a for a in bg['abilities'] if a != ab1)
                            # Ensure cross-list attack parity if caster: casting ability gets highest score (15)
                            if is_caster and base_ab[cast_ab] < 15:
                                high_ab = max(base_ab, key=lambda a: base_ab[a])
                                base_ab[cast_ab], base_ab[high_ab] = base_ab[high_ab], base_ab[cast_ab]
                            bg_asi = {ab1: 2, ab2: 1}

                            # Skills
                            taken = list(bg['skills'])
                            cls_sk = [s for s in cls['skills'] if s not in taken][:cls['skill_count']]
                            taken.extend(cls_sk)
                            sp_sk = None
                            if sid == 'human':
                                pool = [s for s in builder.ALL_SKILLS if s not in taken and (cid != 'barbarian' or s not in cls['skills'])]
                                sp_sk = pool[0]
                                taken.append(sp_sk)
                            elif sid == 'elf':
                                sp_sk = next(s for s in sp['keen_senses_skills'] if s not in taken)
                                taken.append(sp_sk)
                            skd_sk = []
                            if 'skilled' in feats:
                                pool = [s for s in builder.ALL_SKILLS if s not in taken and (cid != 'barbarian' or s not in cls['skills'])]
                                skd_sk = pool[:3]
                                taken.extend(skd_sk)
                            primal_sk = None
                            if cid == 'barbarian':
                                primal_sk = next(s for s in cls['skills'] if s not in taken)
                                taken.append(primal_sk)
                            expertise = taken[:2] if cid == 'bard' else []
                            lore_sk = [s for s in builder.ALL_SKILLS if s not in taken][:3] if cid == 'bard' else []
                            scholar_sk = next((s for s in cls['scholar_skills'] if s in taken), None) if cid == 'wizard' else None

                            # Spells
                            origin_ids: set[str] = set()
                            he_c = None
                            if sid == 'elf' and lin == 'high_elf':
                                he_c = 'prestidigitation'
                                origin_ids.update(('prestidigitation', 'detect_magic'))
                            elif sid == 'tiefling' and lin == 'abyssal':
                                origin_ids.update(('poison_spray', 'thaumaturgy', 'ray_of_sickness'))
                            always_p = set(cls.get('always_prepared_l3', ()))
                            mic_c, mic_s = [], None
                            if 'magic_initiate_cleric' in feats:
                                c0 = [s for s in builder._spells_for_class('cleric', 0) if s not in origin_ids]
                                mic_c = c0[:2]
                                origin_ids.update(mic_c)
                                c1 = [s for s in builder._spells_for_class('cleric', 1) if s not in origin_ids and s not in always_p]
                                mic_s = c1[0]
                                origin_ids.add(mic_s)
                            miw_c, miw_s = [], None
                            if 'magic_initiate_wizard' in feats:
                                w0 = [s for s in builder._spells_for_class('wizard', 0) if s not in origin_ids and s != 'mending']
                                miw_c = w0[:2]
                                origin_ids.update(miw_c)
                                w1 = [s for s in builder._spells_for_class('wizard', 1)
                                      if s not in origin_ids and s not in always_p and s not in builder.MI_WIZARD_EXCLUDED_L1]
                                miw_s = w1[0]
                                origin_ids.add(miw_s)
                            cls_c0, cls_prep, wiz_sb, ev_sav = [], [], [], []
                            if is_caster:
                                need_c0 = cls['cantrip_counts'][3] + (1 if cid == 'cleric' and order == 'thaumaturge' else 0)
                                cls_c0 = [s for s in builder._spells_for_class(cid, 0) if s not in origin_ids][:need_c0]
                                l1 = builder._spells_for_class(cid, 1)
                                l2 = builder._spells_for_class(cid, 2)
                                if cid == 'wizard':
                                    ev_sav = ['scorching_ray', 'shatter']
                                    norm_l2 = [s for s in l2 if s not in ev_sav][:2]
                                    wiz_sb = l1[:8] + norm_l2 + ev_sav
                                    cls_prep = [s for s in wiz_sb if s not in origin_ids and s not in always_p][:cls['prepared_counts'][3]]
                                else:
                                    cls_prep = [s for s in (l1 + l2) if s not in origin_ids and s not in always_p][:cls['prepared_counts'][3]]

                            rec = {
                                'name': 'Combo Hero',
                                'level': 3,
                                'class_id': cid,
                                'species': sid,
                                'lineage': lin,
                                'background': bid,
                                'bg_asi_mode': '2_1',
                                'bg_asi': bg_asi,
                                'ability_method': 'standard_array',
                                'base_abilities': base_ab,
                                'class_skills': cls_sk,
                                'species_skill': sp_sk,
                                'versatile_feat': vf,
                                'skilled_skills': skd_sk,
                                'primal_knowledge_skill': primal_sk,
                                'expertise': expertise,
                                'lore_skills': lore_sk,
                                'scholar_skill': scholar_sk,
                                'fighting_style': 'defense' if cid == 'fighter' else None,
                                'divine_order': order,
                                'metamagic': ['empowered_spell', 'heightened_spell'] if cid == 'sorcerer' else [],
                                'weapon_masteries': list(builder.MASTERY_WEAPONS[:cls['weapon_mastery_count']]) if cid in ('fighter', 'barbarian') else [],
                                'class_equip_choice': 'A',
                                'bg_equip_choice': 'A',
                                'purchases': [],
                                'equipped_armor': None,
                                'equipped_shield': False,
                                'equipped_weapons': [],
                                'class_cantrips': cls_c0,
                                'class_prepared': cls_prep,
                                'wizard_spellbook': wiz_sb,
                                'evocation_savant': ev_sav,
                                'high_elf_cantrip': he_c,
                                'mi_cleric_cantrips': mic_c,
                                'mi_cleric_spell': mic_s,
                                'mi_wizard_cantrips': miw_c,
                                'mi_wizard_spell': miw_s,
                            }
                            res = builder.validate_and_derive(rec, validate_rust=False)
                            assert res['summary']['level'] == 3
                            checked += 1
    assert checked >= 120, f'Expected >=120 valid origin/class combinations, checked {checked}'
