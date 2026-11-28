"""SRD 5.2.1 Character Builder & Level-Up engine (Step 1: Levels 1–3).

Pure-Python validator and deterministic schema-1 ``ContentDoc`` generator for
Practice custom heroes. Zero ``natural20`` imports at runtime; every combat
number is derived server-side from the validated recipe and cross-checked with
``ember_rs.validate_custom_hero_doc`` (fail closed, zero interning / memory
leaks).

This work includes material from the System Reference Document 5.2.1
("SRD 5.2.1") by Wizards of the Coast LLC, available at
https://www.dndbeyond.com/srd. Licensed under CC BY 4.0.
"""
from __future__ import annotations

import json
import re
from typing import Any

import ember_rs

# ---------------------------------------------------------------------------
# Constants & SRD 5.2.1 Reference Tables
# ---------------------------------------------------------------------------

ABILITIES = ('str', 'dex', 'con', 'int', 'wis', 'cha')
ABILITY_LABELS = {
    'str': 'Strength',
    'dex': 'Dexterity',
    'con': 'Constitution',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma',
}
STANDARD_ARRAY = (15, 14, 13, 12, 10, 8)
POINT_BUY_COSTS = {8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9}
POINT_BUY_BUDGET = 27
PROFICIENCY_BONUS_L1_3 = 2

SKILL_ABILITY = {
    'acrobatics': 'dex',
    'animal_handling': 'wis',
    'arcana': 'int',
    'athletics': 'str',
    'deception': 'cha',
    'history': 'int',
    'insight': 'wis',
    'intimidation': 'cha',
    'investigation': 'int',
    'medicine': 'wis',
    'nature': 'int',
    'perception': 'wis',
    'performance': 'cha',
    'persuasion': 'cha',
    'religion': 'int',
    'sleight_of_hand': 'dex',
    'stealth': 'dex',
    'survival': 'wis',
}
ALL_SKILLS = tuple(sorted(SKILL_ABILITY))

ALLOWED_MODELS = (
    {'id': 'guy', 'label': 'Fighter (Greatsword)', 'default_class': 'fighter'},
    {'id': 'mara', 'label': 'Fighter (Sword & Shield)', 'default_class': 'fighter'},
    {'id': 'chruna', 'label': 'Barbarian (Halberd)', 'default_class': 'barbarian'},
    {'id': 'elion', 'label': 'Cleric (Hammer & Shield)', 'default_class': 'cleric'},
    {'id': 'ilyra', 'label': 'Wizard (Staff & Grimoire)', 'default_class': 'wizard'},
    {'id': 'curogana', 'label': 'Sorcerer (Draconic)', 'default_class': 'sorcerer'},
    {'id': 'vesper', 'label': 'Bard (Lute & Dagger)', 'default_class': 'bard'},
)
ALLOWED_MODEL_IDS = frozenset(m['id'] for m in ALLOWED_MODELS)

CASTER_CLASSES = frozenset({'cleric', 'wizard', 'sorcerer', 'bard'})
NON_CASTER_CLASSES = frozenset({'fighter', 'barbarian'})

# Exact SRD 5.2.1 classes (Levels 1-3, zero new combat rules)
CLASSES: dict[str, dict[str, Any]] = {
    'fighter': {
        'id': 'fighter',
        'name': 'Fighter',
        'hit_die': 10,
        'saves': ('str', 'con'),
        'armor_training': ('light', 'medium', 'heavy', 'shield'),
        'weapon_proficiencies': ('simple', 'martial'),
        'skill_count': 2,
        'skills': (
            'acrobatics', 'animal_handling', 'athletics', 'history', 'insight',
            'intimidation', 'perception', 'persuasion', 'survival',
        ),
        'subclass_id': 'champion',
        'subclass_name': 'Champion',
        'weapon_mastery_count': 3,
        'default_model': 'guy',
        'recommended_array': {'str': 15, 'dex': 14, 'con': 13, 'int': 8, 'wis': 10, 'cha': 12},
        'starting_equipment': {
            'A': {
                'label': 'Package A: Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer\'s Pack, 4 GP',
                'items': [
                    ('chain_mail', 1), ('greatsword', 1), ('flail', 1),
                    ('javelin', 8), ('dungeoneers_pack', 1),
                ],
                'cp': 400,
            },
            'B': {
                'label': 'Package B: Studded Leather, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Dungeoneer\'s Pack, 11 GP',
                'items': [
                    ('studded_leather', 1), ('scimitar', 1), ('shortsword', 1),
                    ('longbow', 1), ('arrows', 20), ('quiver', 1), ('dungeoneers_pack', 1),
                ],
                'cp': 1100,
            },
            'C': {
                'label': 'Package C: 155 GP (buy your own gear)',
                'items': [],
                'cp': 15500,
            },
        },
    },
    'barbarian': {
        'id': 'barbarian',
        'name': 'Barbarian',
        'hit_die': 12,
        'saves': ('str', 'con'),
        'armor_training': ('light', 'medium', 'shield'),
        'weapon_proficiencies': ('simple', 'martial'),
        'skill_count': 2,
        'skills': ('animal_handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'),
        'subclass_id': 'path_of_the_berserker',
        'subclass_name': 'Path of the Berserker',
        'weapon_mastery_count': 2,
        'default_model': 'chruna',
        'recommended_array': {'str': 15, 'dex': 13, 'con': 14, 'int': 10, 'wis': 12, 'cha': 8},
        'starting_equipment': {
            'A': {
                'label': 'Package A: Greataxe, 4 Handaxes, Explorer\'s Pack, 15 GP',
                'items': [('greataxe', 1), ('handaxe', 4), ('explorers_pack', 1)],
                'cp': 1500,
            },
            'B': {
                'label': 'Package B: 75 GP (buy your own gear)',
                'items': [],
                'cp': 7500,
            },
        },
    },
    'cleric': {
        'id': 'cleric',
        'name': 'Cleric',
        'hit_die': 8,
        'saves': ('wis', 'cha'),
        'armor_training': ('light', 'medium', 'shield'),
        'weapon_proficiencies': ('simple',),
        'skill_count': 2,
        'skills': ('history', 'insight', 'medicine', 'persuasion', 'religion'),
        'subclass_id': 'life',
        'subclass_name': 'Life Domain',
        'casting_ability': 'wis',
        'cantrip_counts': {1: 3, 2: 3, 3: 3},
        'prepared_counts': {1: 4, 2: 5, 3: 6},
        'always_prepared_l3': ('aid', 'bless', 'cure_wounds', 'lesser_restoration'),
        'default_model': 'elion',
        'recommended_array': {'str': 14, 'dex': 8, 'con': 13, 'int': 10, 'wis': 15, 'cha': 12},
        'starting_equipment': {
            'A': {
                'label': 'Package A: Chain Shirt, Shield, Mace, Holy Symbol, Priest\'s Pack, 7 GP',
                'items': [
                    ('chain_shirt', 1), ('shield', 1), ('mace', 1),
                    ('holy_symbol', 1), ('priests_pack', 1),
                ],
                'cp': 700,
            },
            'B': {
                'label': 'Package B: 110 GP (buy your own gear)',
                'items': [],
                'cp': 11000,
            },
        },
    },
    'wizard': {
        'id': 'wizard',
        'name': 'Wizard',
        'hit_die': 6,
        'saves': ('int', 'wis'),
        'armor_training': (),
        'weapon_proficiencies': ('simple',),
        'skill_count': 2,
        'skills': ('arcana', 'history', 'insight', 'investigation', 'medicine', 'nature', 'religion'),
        'scholar_skills': ('arcana', 'history', 'investigation', 'medicine', 'nature', 'religion'),
        'subclass_id': 'evoker',
        'subclass_name': 'Evoker',
        'casting_ability': 'int',
        'cantrip_counts': {1: 3, 2: 3, 3: 3},
        'prepared_counts': {1: 4, 2: 5, 3: 6},
        'spellbook_counts': {1: 6, 2: 8, 3: 12},
        'default_model': 'ilyra',
        'recommended_array': {'str': 8, 'dex': 12, 'con': 13, 'int': 15, 'wis': 14, 'cha': 10},
        'starting_equipment': {
            'A': {
                'label': 'Package A: 2 Daggers, Quarterstaff (Arcane Focus), Robe, Spellbook, Scholar\'s Pack, 5 GP',
                'items': [
                    ('dagger', 2), ('quarterstaff', 1), ('robe', 1),
                    ('spellbook', 1), ('scholars_pack', 1),
                ],
                'cp': 500,
            },
            'B': {
                'label': 'Package B: 55 GP (buy your own gear)',
                'items': [],
                'cp': 5500,
            },
        },
    },
    'sorcerer': {
        'id': 'sorcerer',
        'name': 'Sorcerer',
        'hit_die': 6,
        'saves': ('con', 'cha'),
        'armor_training': (),
        'weapon_proficiencies': ('simple',),
        'skill_count': 2,
        'skills': ('arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'),
        'subclass_id': 'draconic',
        'subclass_name': 'Draconic Sorcery',
        'casting_ability': 'cha',
        'cantrip_counts': {1: 4, 2: 4, 3: 4},
        'prepared_counts': {1: 2, 2: 4, 3: 6},
        'always_prepared_l3': ('alter_self', 'chromatic_orb', 'command', 'dragons_breath'),
        'default_model': 'curogana',
        'recommended_array': {'str': 10, 'dex': 13, 'con': 14, 'int': 8, 'wis': 12, 'cha': 15},
        'starting_equipment': {
            'A': {
                'label': 'Package A: Spear, 2 Daggers, Arcane Focus (Crystal), Dungeoneer\'s Pack, 28 GP',
                'items': [
                    ('spear', 1), ('dagger', 2), ('arcane_focus', 1), ('dungeoneers_pack', 1),
                ],
                'cp': 2800,
            },
            'B': {
                'label': 'Package B: 50 GP (buy your own gear)',
                'items': [],
                'cp': 5000,
            },
        },
    },
    'bard': {
        'id': 'bard',
        'name': 'Bard',
        'hit_die': 8,
        'saves': ('dex', 'cha'),
        'armor_training': ('light',),
        'weapon_proficiencies': ('simple',),
        'skill_count': 3,
        'skills': ALL_SKILLS,
        'subclass_id': 'college_of_lore',
        'subclass_name': 'College of Lore',
        'casting_ability': 'cha',
        'cantrip_counts': {1: 2, 2: 2, 3: 2},
        'prepared_counts': {1: 4, 2: 5, 3: 6},
        'default_model': 'vesper',
        'recommended_array': {'str': 8, 'dex': 14, 'con': 12, 'int': 13, 'wis': 10, 'cha': 15},
        'starting_equipment': {
            'A': {
                'label': 'Package A: Leather Armor, 2 Daggers, Musical Instrument (Lute), Entertainer\'s Pack, 19 GP',
                'items': [
                    ('leather_armor', 1), ('dagger', 2), ('lute', 1), ('entertainers_pack', 1),
                ],
                'cp': 1900,
            },
            'B': {
                'label': 'Package B: 90 GP (buy your own gear)',
                'items': [],
                'cp': 9000,
            },
        },
    },
}

SPECIES: dict[str, dict[str, Any]] = {
    'human': {
        'id': 'human',
        'name': 'Human',
        'sizes': ('medium', 'small'),
        'speed': 30,
        'darkvision': 0,
        'caster_only': False,
        'lineages': {},
        'notes': ('Resourceful (Heroic Inspiration) is sheet-only in Practice.',),
    },
    'elf': {
        'id': 'elf',
        'name': 'Elf',
        'sizes': ('medium',),
        'speed': 30,
        'darkvision': 60,
        'caster_only': True,
        'keen_senses_skills': ('insight', 'perception', 'survival'),
        'lineages': {
            'high_elf': {
                'id': 'high_elf',
                'name': 'High Elf',
                'darkvision': 60,
                'summary': 'Fey Ancestry, Keen Senses, 1 Wizard cantrip (L1), Detect Magic (L3, sheet-only).',
            },
        },
        'notes': ('Trance is sheet-only in Practice. Drow and Wood Elf are deferred to a later step.',),
    },
    'tiefling': {
        'id': 'tiefling',
        'name': 'Tiefling',
        'sizes': ('medium', 'small'),
        'speed': 30,
        'darkvision': 60,
        'caster_only': True,
        'lineages': {
            'abyssal': {
                'id': 'abyssal',
                'name': 'Abyssal Legacy',
                'resistances': ('poison',),
                'cantrips': ('poison_spray', 'thaumaturgy'),
                'l3_spell': 'ray_of_sickness',
                'summary': 'Poison Resistance, Poison Spray & Thaumaturgy (L1), Ray of Sickness (L3, 1 free cast).',
            },
        },
        'notes': ('Thaumaturgy has no effect in combat. Infernal and Chthonic legacies are deferred.',),
    },
}

BACKGROUNDS: dict[str, dict[str, Any]] = {
    'acolyte': {
        'id': 'acolyte',
        'name': 'Acolyte',
        'abilities': ('int', 'wis', 'cha'),
        'skills': ('insight', 'religion'),
        'tool': 'Calligrapher\'s Supplies',
        'feat': 'magic_initiate_cleric',
        'caster_only': True,
        'equipment': {
            'A': {
                'label': 'Package A: Calligrapher\'s Supplies, Book (Prayers), Holy Symbol, 10 Parchment, Robe, 8 GP',
                'items': [
                    ('calligraphers_supplies', 1), ('book_prayers', 1),
                    ('holy_symbol', 1), ('parchment', 10), ('robe', 1),
                ],
                'cp': 800,
            },
            'B': {'label': 'Package B: 50 GP', 'items': [], 'cp': 5000},
        },
    },
    'criminal': {
        'id': 'criminal',
        'name': 'Criminal',
        'abilities': ('dex', 'con', 'int'),
        'skills': ('sleight_of_hand', 'stealth'),
        'tool': 'Thieves\' Tools',
        'feat': 'alert',
        'caster_only': False,
        'equipment': {
            'A': {
                'label': 'Package A: 2 Daggers, Thieves\' Tools, Crowbar, 2 Pouches, Traveler\'s Clothes, 16 GP',
                'items': [
                    ('dagger', 2), ('thieves_tools', 1), ('crowbar', 1),
                    ('pouch', 2), ('travelers_clothes', 1),
                ],
                'cp': 1600,
            },
            'B': {'label': 'Package B: 50 GP', 'items': [], 'cp': 5000},
        },
    },
    'sage': {
        'id': 'sage',
        'name': 'Sage',
        'abilities': ('con', 'int', 'wis'),
        'skills': ('arcana', 'history'),
        'tool': 'Calligrapher\'s Supplies',
        'feat': 'magic_initiate_wizard',
        'caster_only': True,
        'equipment': {
            'A': {
                'label': 'Package A: Quarterstaff, Calligrapher\'s Supplies, Book (History), 8 Parchment, Robe, 8 GP',
                'items': [
                    ('quarterstaff', 1), ('calligraphers_supplies', 1),
                    ('book_history', 1), ('parchment', 8), ('robe', 1),
                ],
                'cp': 800,
            },
            'B': {'label': 'Package B: 50 GP', 'items': [], 'cp': 5000},
        },
    },
    'soldier': {
        'id': 'soldier',
        'name': 'Soldier',
        'abilities': ('str', 'dex', 'con'),
        'skills': ('athletics', 'intimidation'),
        'tool': 'Gaming Set',
        'feat': 'savage_attacker',
        'caster_only': False,
        'equipment': {
            'A': {
                'label': 'Package A: Spear, Shortbow, 20 Arrows, Gaming Set, Healer\'s Kit, Quiver, Traveler\'s Clothes, 14 GP',
                'items': [
                    ('spear', 1), ('shortbow', 1), ('arrows', 20), ('gaming_set', 1),
                    ('healers_kit', 1), ('quiver', 1), ('travelers_clothes', 1),
                ],
                'cp': 1400,
            },
            'B': {'label': 'Package B: 50 GP', 'items': [], 'cp': 5000},
        },
    },
}

ORIGIN_FEATS: dict[str, dict[str, Any]] = {
    'alert': {
        'id': 'alert',
        'name': 'Alert',
        'caster_only': False,
        'summary': '+PB to Initiative (Initiative Swap is sheet-only in Practice).',
    },
    'savage_attacker': {
        'id': 'savage_attacker',
        'name': 'Savage Attacker',
        'caster_only': False,
        'summary': 'Once per turn on a weapon hit, roll weapon damage dice twice and pick either.',
    },
    'skilled': {
        'id': 'skilled',
        'name': 'Skilled',
        'caster_only': False,
        'summary': 'Gain proficiency in 3 skills (supported 3-skill subset of SRD\'s 3 skills or tools).',
    },
    'magic_initiate_cleric': {
        'id': 'magic_initiate_cleric',
        'name': 'Magic Initiate (Cleric)',
        'caster_only': True,
        'spell_list': 'cleric',
        'summary': '2 Cleric cantrips and 1 Level 1 Cleric spell (1 free cast/Long Rest, castable with slots).',
    },
    'magic_initiate_wizard': {
        'id': 'magic_initiate_wizard',
        'name': 'Magic Initiate (Wizard)',
        'caster_only': True,
        'spell_list': 'wizard',
        'summary': '2 Wizard cantrips and 1 Level 1 Wizard spell (1 free cast/Long Rest, castable with slots).',
    },
}

FIGHTING_STYLES = {
    'defense': {'id': 'defense', 'name': 'Defense', 'summary': '+1 AC while wearing Light, Medium, or Heavy armor.'},
    'great_weapon_fighting': {
        'id': 'great_weapon_fighting',
        'name': 'Great Weapon Fighting',
        'summary': 'Treat 1 or 2 as 3 on Two-Handed / Versatile-in-two-hands melee damage dice.',
    },
}

DIVINE_ORDERS = {
    'protector': {
        'id': 'protector',
        'name': 'Protector',
        'summary': 'Training with Heavy armor and proficiency with Martial weapons.',
    },
    'thaumaturge': {
        'id': 'thaumaturge',
        'name': 'Thaumaturge',
        'summary': '+1 extra Cleric cantrip (+WIS to Arcana/Religion is sheet-only in Practice).',
    },
}

METAMAGIC_OPTIONS = {
    'empowered_spell': {'id': 'empowered_spell', 'name': 'Empowered Spell', 'summary': '1 SP: reroll low spell damage dice.'},
    'heightened_spell': {'id': 'heightened_spell', 'name': 'Heightened Spell', 'summary': '2 SP: impose Disadvantage on one target\'s save.'},
}

# Supported equippable SRD 5.2.1 melee weapons (cost in CP)
WEAPONS: dict[str, dict[str, Any]] = {
    # Simple melee
    'dagger': {
        'id': 'dagger', 'name': 'Dagger', 'category': 'simple', 'cost_cp': 200,
        'damage': '1d4', 'damage_type': 'piercing', 'range': 5,
        'properties': ('finesse', 'light', 'thrown'), 'thrown_range': (20, 60),
        'hand_slots': 0.5, 'mastery': 'nick',
    },
    'greatclub': {
        'id': 'greatclub', 'name': 'Greatclub', 'category': 'simple', 'cost_cp': 20,
        'damage': '1d8', 'damage_type': 'bludgeoning', 'range': 5,
        'properties': ('two_handed',), 'hand_slots': 2.0, 'mastery': 'push',
    },
    'handaxe': {
        'id': 'handaxe', 'name': 'Handaxe', 'category': 'simple', 'cost_cp': 500,
        'damage': '1d6', 'damage_type': 'slashing', 'range': 5,
        'properties': ('light', 'thrown'), 'thrown_range': (20, 60),
        'hand_slots': 0.5, 'mastery': 'vex',
    },
    'javelin': {
        'id': 'javelin', 'name': 'Javelin', 'category': 'simple', 'cost_cp': 50,
        'damage': '1d6', 'damage_type': 'piercing', 'range': 5,
        'properties': ('thrown',), 'thrown_range': (30, 120),
        'hand_slots': 1.0, 'mastery': 'slow',
    },
    'light_hammer': {
        'id': 'light_hammer', 'name': 'Light Hammer', 'category': 'simple', 'cost_cp': 200,
        'damage': '1d4', 'damage_type': 'bludgeoning', 'range': 5,
        'properties': ('light', 'thrown'), 'thrown_range': (20, 60),
        'hand_slots': 0.5, 'mastery': 'nick',
    },
    'mace': {
        'id': 'mace', 'name': 'Mace', 'category': 'simple', 'cost_cp': 500,
        'damage': '1d6', 'damage_type': 'bludgeoning', 'range': 5,
        'properties': (), 'hand_slots': 1.0, 'mastery': 'sap',
    },
    'quarterstaff': {
        'id': 'quarterstaff', 'name': 'Quarterstaff', 'category': 'simple', 'cost_cp': 20,
        'damage': '1d6', 'damage_2': '1d8', 'damage_type': 'bludgeoning', 'range': 5,
        'properties': ('versatile',), 'hand_slots': 1.0, 'mastery': 'topple',
    },
    'spear': {
        'id': 'spear', 'name': 'Spear', 'category': 'simple', 'cost_cp': 100,
        'damage': '1d6', 'damage_2': '1d8', 'damage_type': 'piercing', 'range': 5,
        'properties': ('thrown', 'versatile'), 'thrown_range': (20, 60),
        'hand_slots': 1.0, 'mastery': 'sap',
    },
    # Martial melee
    'battleaxe': {
        'id': 'battleaxe', 'name': 'Battleaxe', 'category': 'martial', 'cost_cp': 1000,
        'damage': '1d8', 'damage_2': '1d10', 'damage_type': 'slashing', 'range': 5,
        'properties': ('versatile',), 'hand_slots': 1.0, 'mastery': 'topple',
    },
    'greataxe': {
        'id': 'greataxe', 'name': 'Greataxe', 'category': 'martial', 'cost_cp': 3000,
        'damage': '1d12', 'damage_type': 'slashing', 'range': 5,
        'properties': ('heavy', 'two_handed'), 'hand_slots': 2.0, 'mastery': 'cleave',
    },
    'greatsword': {
        'id': 'greatsword', 'name': 'Greatsword', 'category': 'martial', 'cost_cp': 5000,
        'damage': '2d6', 'damage_type': 'slashing', 'range': 5,
        'properties': ('heavy', 'two_handed'), 'hand_slots': 2.0, 'mastery': 'graze',
    },
    'halberd': {
        'id': 'halberd', 'name': 'Halberd', 'category': 'martial', 'cost_cp': 2000,
        'damage': '1d10', 'damage_type': 'slashing', 'range': 10,
        'properties': ('heavy', 'reach', 'two_handed'), 'hand_slots': 2.0, 'mastery': 'cleave',
    },
    'longsword': {
        'id': 'longsword', 'name': 'Longsword', 'category': 'martial', 'cost_cp': 1500,
        'damage': '1d8', 'damage_2': '1d10', 'damage_type': 'slashing', 'range': 5,
        'properties': ('versatile',), 'hand_slots': 1.0, 'mastery': 'sap',
    },
    'rapier': {
        'id': 'rapier', 'name': 'Rapier', 'category': 'martial', 'cost_cp': 2500,
        'damage': '1d8', 'damage_type': 'piercing', 'range': 5,
        'properties': ('finesse',), 'hand_slots': 1.0, 'mastery': 'vex',
    },
    'scimitar': {
        'id': 'scimitar', 'name': 'Scimitar', 'category': 'martial', 'cost_cp': 2500,
        'damage': '1d6', 'damage_type': 'slashing', 'range': 5,
        'properties': ('finesse', 'light'), 'hand_slots': 0.5, 'mastery': 'nick',
    },
    'shortsword': {
        'id': 'shortsword', 'name': 'Shortsword', 'category': 'martial', 'cost_cp': 1000,
        'damage': '1d6', 'damage_type': 'piercing', 'range': 5,
        'properties': ('finesse', 'light'), 'hand_slots': 0.5, 'mastery': 'vex',
    },
    'warhammer': {
        'id': 'warhammer', 'name': 'Warhammer', 'category': 'martial', 'cost_cp': 1500,
        'damage': '1d8', 'damage_2': '1d10', 'damage_type': 'bludgeoning', 'range': 5,
        'properties': ('versatile',), 'hand_slots': 1.0, 'mastery': 'push',
    },
}

IMPLEMENTED_MASTERIES = frozenset({'graze', 'sap', 'cleave'})
MASTERY_WEAPONS = tuple(sorted(wid for wid, w in WEAPONS.items() if w['mastery'] in IMPLEMENTED_MASTERIES))

# Supported SRD 5.2.1 armors affordable within L1 starting wealth (<= 205 GP)
ARMORS: dict[str, dict[str, Any]] = {
    'padded': {
        'id': 'padded', 'name': 'Padded Armor', 'category': 'light', 'ac': 11,
        'cost_cp': 500, 'min_str': 0, 'stealth_disadvantage': True,
    },
    'leather_armor': {
        'id': 'leather_armor', 'name': 'Leather Armor', 'category': 'light', 'ac': 11,
        'cost_cp': 1000, 'min_str': 0, 'stealth_disadvantage': False,
    },
    'studded_leather': {
        'id': 'studded_leather', 'name': 'Studded Leather Armor', 'category': 'light', 'ac': 12,
        'cost_cp': 4500, 'min_str': 0, 'stealth_disadvantage': False,
    },
    'hide_armor': {
        'id': 'hide_armor', 'name': 'Hide Armor', 'category': 'medium', 'ac': 12,
        'cost_cp': 1000, 'min_str': 0, 'stealth_disadvantage': False,
    },
    'chain_shirt': {
        'id': 'chain_shirt', 'name': 'Chain Shirt', 'category': 'medium', 'ac': 13,
        'cost_cp': 5000, 'min_str': 0, 'stealth_disadvantage': False,
    },
    'scale_mail': {
        'id': 'scale_mail', 'name': 'Scale Mail', 'category': 'medium', 'ac': 14,
        'cost_cp': 5000, 'min_str': 0, 'stealth_disadvantage': True,
    },
    'ring_mail': {
        'id': 'ring_mail', 'name': 'Ring Mail', 'category': 'heavy', 'ac': 14,
        'cost_cp': 3000, 'min_str': 0, 'stealth_disadvantage': True,
    },
    'chain_mail': {
        'id': 'chain_mail', 'name': 'Chain Mail', 'category': 'heavy', 'ac': 16,
        'cost_cp': 7500, 'min_str': 13, 'stealth_disadvantage': True,
    },
    'splint': {
        'id': 'splint', 'name': 'Splint Armor', 'category': 'heavy', 'ac': 17,
        'cost_cp': 20000, 'min_str': 15, 'stealth_disadvantage': True,
    },
}

EXTRA_SHOP_ITEMS: dict[str, dict[str, Any]] = {
    'shield': {'id': 'shield', 'name': 'Shield (+2 AC)', 'kind': 'shield', 'cost_cp': 1000},
    'holy_water': {
        'id': 'holy_water', 'name': 'Holy Water (flask)', 'kind': 'component', 'cost_cp': 2500,
        'note': 'Consumed when casting Protection from Evil and Good.',
    },
    'diamond_50gp': {
        'id': 'diamond_50gp', 'name': 'Diamond (50 GP component)', 'kind': 'component', 'cost_cp': 5000,
        'note': 'Required (not consumed) to cast Chromatic Orb.',
    },
}

PACK_ITEM_LABELS: dict[str, str] = {
    'flail': 'Flail (sheet item; not equippable in Step 1)',
    'longbow': 'Longbow (sheet item; no Practice action)',
    'shortbow': 'Shortbow (sheet item; no Practice action)',
    'arrows': 'Arrows',
    'quiver': 'Quiver',
    'dungeoneers_pack': "Dungeoneer's Pack",
    'explorers_pack': "Explorer's Pack",
    'priests_pack': "Priest's Pack",
    'scholars_pack': "Scholar's Pack",
    'entertainers_pack': "Entertainer's Pack",
    'holy_symbol': 'Holy Symbol',
    'arcane_focus': 'Arcane Focus (Crystal)',
    'spellbook': 'Spellbook',
    'robe': 'Robe',
    'lute': 'Musical Instrument (Lute)',
    'calligraphers_supplies': "Calligrapher's Supplies",
    'book_prayers': 'Book (Prayers)',
    'book_history': 'Book (History)',
    'parchment': 'Parchment',
    'thieves_tools': "Thieves' Tools",
    'crowbar': 'Crowbar',
    'pouch': 'Pouch',
    'travelers_clothes': "Traveler's Clothes",
    'gaming_set': 'Gaming Set',
    'healers_kit': "Healer's Kit",
}

# Exact SRD 5.2.1 spells supported in Step 1 (combat-active + inert utility).
# native_abilities lists mental abilities of classes on each spell's Natural20 list
# so we can guard Natural20 entity.py:4013's max() attack-modifier parity rule.
SPELLS: dict[str, dict[str, Any]] = {
    # Cantrips (combat-active)
    'sacred_flame': {'name': 'Sacred Flame', 'level': 0, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('cleric',), 'combat': True, 'attack_roll': False},
    'spare_the_dying': {'name': 'Spare the Dying', 'level': 0, 'school': 'necromancy', 'casting_time': '1:action', 'concentration': False, 'lists': ('cleric',), 'combat': True, 'attack_roll': False},
    'acid_splash': {'name': 'Acid Splash', 'level': 0, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': False},
    'firebolt': {'name': 'Fire Bolt', 'level': 0, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': True, 'native_abilities': ('int', 'cha')},
    'poison_spray': {'name': 'Poison Spray', 'level': 0, 'school': 'necromancy', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': True, 'native_abilities': ('int', 'wis', 'cha')},
    'ray_of_frost': {'name': 'Ray of Frost', 'level': 0, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': True, 'native_abilities': ('int', 'cha')},
    'sorcerous_burst': {'name': 'Sorcerous Burst', 'level': 0, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('sorcerer',), 'combat': True, 'attack_roll': True, 'native_abilities': ('cha',)},
    'starry_wisp': {'name': 'Starry Wisp', 'level': 0, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('bard',), 'combat': True, 'attack_roll': True, 'native_abilities': ('cha', 'wis')},
    'vicious_mockery': {'name': 'Vicious Mockery', 'level': 0, 'school': 'enchantment', 'casting_time': '1:action', 'concentration': False, 'lists': ('bard',), 'combat': True, 'attack_roll': False},
    # Cantrips (sheet-only / inert)
    'guidance': {'name': 'Guidance', 'level': 0, 'school': 'divination', 'casting_time': '1:action', 'concentration': True, 'lists': ('cleric',), 'combat': False, 'attack_roll': False},
    'thaumaturgy': {'name': 'Thaumaturgy', 'level': 0, 'school': 'transmutation', 'casting_time': '1:action', 'concentration': False, 'lists': ('cleric',), 'combat': False, 'attack_roll': False},
    'resistance': {'name': 'Resistance', 'level': 0, 'school': 'abjuration', 'casting_time': '1:action', 'concentration': True, 'lists': ('cleric',), 'combat': False, 'attack_roll': False},
    'mending': {'name': 'Mending', 'level': 0, 'school': 'transmutation', 'casting_time': '1:minute', 'concentration': False, 'lists': ('cleric', 'wizard', 'sorcerer', 'bard'), 'combat': False, 'attack_roll': False},
    'mage_hand': {'name': 'Mage Hand', 'level': 0, 'school': 'conjuration', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer', 'bard'), 'combat': False, 'attack_roll': False},
    'minor_illusion': {'name': 'Minor Illusion', 'level': 0, 'school': 'illusion', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer', 'bard'), 'combat': False, 'attack_roll': False},
    'elementalism': {'name': 'Elementalism', 'level': 0, 'school': 'transmutation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': False, 'attack_roll': False},
    'prestidigitation': {'name': 'Prestidigitation', 'level': 0, 'school': 'transmutation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer', 'bard'), 'combat': False, 'attack_roll': False},
    # Level 1 (combat-active)
    'bless': {'name': 'Bless', 'level': 1, 'school': 'enchantment', 'casting_time': '1:action', 'concentration': True, 'lists': ('cleric',), 'combat': True, 'attack_roll': False},
    'command': {'name': 'Command', 'level': 1, 'school': 'enchantment', 'casting_time': '1:action', 'concentration': False, 'lists': ('cleric', 'bard'), 'combat': True, 'attack_roll': False},
    'cure_wounds': {'name': 'Cure Wounds', 'level': 1, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('cleric', 'bard'), 'combat': True, 'attack_roll': False},
    'guiding_bolt': {'name': 'Guiding Bolt', 'level': 1, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('cleric',), 'combat': True, 'attack_roll': True, 'native_abilities': ('wis',)},
    'healing_word': {'name': 'Healing Word', 'level': 1, 'school': 'evocation', 'casting_time': '1:bonus_action', 'concentration': False, 'lists': ('cleric', 'bard'), 'combat': True, 'attack_roll': False},
    'protection_from_evil_and_good': {'name': 'Protection from Evil and Good', 'level': 1, 'school': 'abjuration', 'casting_time': '1:action', 'concentration': True, 'lists': ('cleric', 'wizard'), 'combat': True, 'attack_roll': False},
    'sanctuary': {'name': 'Sanctuary', 'level': 1, 'school': 'abjuration', 'casting_time': '1:bonus_action', 'concentration': False, 'lists': ('cleric',), 'combat': True, 'attack_roll': False},
    'shield_of_faith': {'name': 'Shield of Faith', 'level': 1, 'school': 'abjuration', 'casting_time': '1:bonus_action', 'concentration': True, 'lists': ('cleric',), 'combat': True, 'attack_roll': False},
    'burning_hands': {'name': 'Burning Hands', 'level': 1, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': False},
    'chromatic_orb': {'name': 'Chromatic Orb', 'level': 1, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': True, 'native_abilities': ('int', 'cha'), 'requires_diamond_50gp': True},
    'mage_armor': {'name': 'Mage Armor', 'level': 1, 'school': 'abjuration', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': False},
    'magic_missile': {'name': 'Magic Missile', 'level': 1, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': False},
    'ray_of_sickness': {'name': 'Ray of Sickness', 'level': 1, 'school': 'necromancy', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': True, 'native_abilities': ('int', 'cha')},
    'shield': {'name': 'Shield', 'level': 1, 'school': 'abjuration', 'casting_time': '1:reaction', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'reaction': True, 'attack_roll': False},
    'thunderwave': {'name': 'Thunderwave', 'level': 1, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer', 'bard'), 'combat': True, 'attack_roll': False},
    'faerie_fire': {'name': 'Faerie Fire', 'level': 1, 'school': 'evocation', 'casting_time': '1:action', 'concentration': True, 'lists': ('bard',), 'combat': True, 'attack_roll': False},
    # Level 1 (sheet-only / inert)
    'detect_magic': {'name': 'Detect Magic', 'level': 1, 'school': 'divination', 'casting_time': '1:action', 'concentration': True, 'lists': ('cleric', 'wizard', 'bard'), 'combat': False, 'attack_roll': False},
    'disguise_self': {'name': 'Disguise Self', 'level': 1, 'school': 'illusion', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer', 'bard'), 'combat': False, 'attack_roll': False},
    'animal_friendship': {'name': 'Animal Friendship', 'level': 1, 'school': 'enchantment', 'casting_time': '1:action', 'concentration': False, 'lists': ('bard',), 'combat': False, 'attack_roll': False},
    # Level 2 (combat-active)
    'aid': {'name': 'Aid', 'level': 2, 'school': 'abjuration', 'casting_time': '1:action', 'concentration': False, 'lists': ('cleric', 'bard'), 'combat': True, 'attack_roll': False},
    'lesser_restoration': {'name': 'Lesser Restoration', 'level': 2, 'school': 'abjuration', 'casting_time': '1:bonus_action', 'concentration': False, 'lists': ('cleric', 'bard'), 'combat': True, 'attack_roll': False},
    'spiritual_weapon': {'name': 'Spiritual Weapon', 'level': 2, 'school': 'evocation', 'casting_time': '1:bonus_action', 'concentration': True, 'lists': ('cleric',), 'combat': True, 'attack_roll': True, 'native_abilities': ('wis',)},
    'blur': {'name': 'Blur', 'level': 2, 'school': 'illusion', 'casting_time': '1:action', 'concentration': True, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': False},
    'dragons_breath': {'name': "Dragon's Breath", 'level': 2, 'school': 'transmutation', 'casting_time': '1:bonus_action', 'concentration': True, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': False},
    'invisibility': {'name': 'Invisibility', 'level': 2, 'school': 'illusion', 'casting_time': '1:action', 'concentration': True, 'lists': ('wizard', 'sorcerer', 'bard'), 'combat': True, 'attack_roll': False},
    'scorching_ray': {'name': 'Scorching Ray', 'level': 2, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer'), 'combat': True, 'attack_roll': True, 'native_abilities': ('int', 'cha')},
    'see_invisibility': {'name': 'See Invisibility', 'level': 2, 'school': 'divination', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer', 'bard'), 'combat': True, 'attack_roll': False},
    'shatter': {'name': 'Shatter', 'level': 2, 'school': 'evocation', 'casting_time': '1:action', 'concentration': False, 'lists': ('wizard', 'sorcerer', 'bard'), 'combat': True, 'attack_roll': False},
    # Level 2 (sheet-only / inert)
    'alter_self': {'name': 'Alter Self', 'level': 2, 'school': 'transmutation', 'casting_time': '1:action', 'concentration': True, 'lists': ('wizard', 'sorcerer'), 'combat': False, 'attack_roll': False},
}

RECIPE_ALLOWED_KEYS = frozenset({
    'version', 'id', 'name', 'model_key', 'level', 'class_id', 'species', 'lineage', 'size',
    'background', 'bg_asi_mode', 'bg_asi', 'ability_method', 'base_abilities',
    'class_skills', 'species_skill', 'versatile_feat', 'skilled_skills',
    'primal_knowledge_skill', 'lore_skills', 'expertise', 'scholar_skill',
    'fighting_style', 'divine_order', 'metamagic', 'weapon_masteries',
    'class_equip_choice', 'bg_equip_choice', 'purchases',
    'equipped_armor', 'equipped_shield', 'equipped_weapons',
    'class_cantrips', 'class_prepared', 'wizard_spellbook', 'evocation_savant',
    'high_elf_cantrip', 'mi_cleric_cantrips', 'mi_cleric_spell',
    'mi_wizard_cantrips', 'mi_wizard_spell',
})

NAME_RE = re.compile(r"^[A-Za-z0-9 '\-\.,]{1,32}$")


class BuilderError(ValueError):
    """Structured SRD 5.2.1 validation error."""

    def __init__(self, errors: list[dict[str, str]]):
        self.errors = errors
        msg = '; '.join(f"{e['field']}: {e['message']}" for e in errors)
        super().__init__(msg)


def ability_mod(score: int) -> int:
    return (int(score) - 10) // 2


def format_coins(cp: int) -> str:
    cp = max(0, int(cp))
    gp, rem = divmod(cp, 100)
    sp, rem_cp = divmod(rem, 10)
    parts = []
    if gp:
        parts.append(f'{gp} GP')
    if sp:
        parts.append(f'{sp} SP')
    if rem_cp or not parts:
        parts.append(f'{rem_cp} CP')
    return ', '.join(parts)


def _fmt_mod(val: int) -> str:
    return f'+{val}' if val >= 0 else str(val)


def _fmt_damage(die: str, mod: int) -> str:
    return f'{die}{_fmt_mod(mod)}'


def _item_display_name(item_id: str) -> str:
    if item_id in WEAPONS:
        return WEAPONS[item_id]['name']
    if item_id in ARMORS:
        return ARMORS[item_id]['name']
    if item_id in EXTRA_SHOP_ITEMS:
        return EXTRA_SHOP_ITEMS[item_id]['name']
    return PACK_ITEM_LABELS.get(item_id, item_id.replace('_', ' ').title())


def _shop_price_cp(item_id: str) -> int | None:
    if item_id in WEAPONS:
        return WEAPONS[item_id]['cost_cp']
    if item_id in ARMORS:
        return ARMORS[item_id]['cost_cp']
    if item_id in EXTRA_SHOP_ITEMS:
        return EXTRA_SHOP_ITEMS[item_id]['cost_cp']
    return None


def _clean_str_list(raw: Any, field: str, errors: list[dict[str, str]], max_len: int = 32) -> list[str]:
    if raw is None:
        return []
    if not isinstance(raw, list) or len(raw) > max_len or any(not isinstance(x, str) for x in raw):
        errors.append({'field': field, 'message': f'{field} must be a list of strings.'})
        return []
    return list(raw)


def _spells_for_class(class_id: str, level: int) -> list[str]:
    return sorted(
        sid for sid, sp in SPELLS.items()
        if sp['level'] == level and class_id in sp['lists']
    )


def builder_options() -> dict[str, Any]:
    """Static SRD 5.2.1 options catalog served by ``GET /api/builder/options``."""
    shop = []
    for wid, w in sorted(WEAPONS.items()):
        shop.append({
            'id': wid, 'name': w['name'], 'group': 'weapon', 'category': w['category'],
            'cost_cp': w['cost_cp'], 'cost_label': format_coins(w['cost_cp']),
            'damage': w['damage'], 'damage_2': w.get('damage_2'), 'damage_type': w['damage_type'],
            'range': w['range'], 'properties': list(w['properties']),
            'thrown_range': list(w['thrown_range']) if 'thrown_range' in w else None,
            'hand_slots': w['hand_slots'], 'mastery': w['mastery'],
            'mastery_implemented': w['mastery'] in IMPLEMENTED_MASTERIES,
        })
    for aid, a in sorted(ARMORS.items(), key=lambda kv: (['light', 'medium', 'heavy'].index(kv[1]['category']), kv[1]['ac'])):
        shop.append({
            'id': aid, 'name': a['name'], 'group': 'armor', 'category': a['category'],
            'ac': a['ac'], 'cost_cp': a['cost_cp'], 'cost_label': format_coins(a['cost_cp']),
            'min_str': a['min_str'], 'stealth_disadvantage': a['stealth_disadvantage'],
        })
    for eid, e in EXTRA_SHOP_ITEMS.items():
        shop.append({
            'id': eid, 'name': e['name'], 'group': e['kind'],
            'cost_cp': e['cost_cp'], 'cost_label': format_coins(e['cost_cp']),
            'note': e.get('note', ''),
        })

    spells_view = {}
    for sid, sp in sorted(SPELLS.items()):
        spells_view[sid] = {
            'id': sid,
            'name': sp['name'],
            'level': sp['level'],
            'school': sp['school'],
            'casting_time': sp['casting_time'],
            'concentration': sp['concentration'],
            'lists': list(sp['lists']),
            'combat': sp['combat'],
            'reaction': bool(sp.get('reaction')),
            'requires_diamond_50gp': bool(sp.get('requires_diamond_50gp')),
            'requires_holy_water': sid == 'protection_from_evil_and_good',
            'combat_note': '' if sp['combat'] else 'No effect in combat',
        }

    return {
        'abilities': [{'id': a, 'label': ABILITY_LABELS[a]} for a in ABILITIES],
        'standard_array': list(STANDARD_ARRAY),
        'point_buy': {'budget': POINT_BUY_BUDGET, 'costs': {str(k): v for k, v in POINT_BUY_COSTS.items()}},
        'skills': [{'id': s, 'label': s.replace('_', ' ').title(), 'ability': SKILL_ABILITY[s]} for s in ALL_SKILLS],
        'models': list(ALLOWED_MODELS),
        'classes': {
            cid: {
                **{k: (list(v) if isinstance(v, tuple) else v) for k, v in c.items() if k != 'starting_equipment'},
                'starting_equipment': {
                    opt: {'label': pkg['label'], 'cp': pkg['cp'], 'items': [[i, q] for i, q in pkg['items']]}
                    for opt, pkg in c['starting_equipment'].items()
                },
            }
            for cid, c in CLASSES.items()
        },
        'species': {
            sid: {
                'id': sp['id'], 'name': sp['name'], 'sizes': list(sp['sizes']),
                'speed': sp['speed'], 'darkvision': sp['darkvision'], 'caster_only': sp['caster_only'],
                'keen_senses_skills': list(sp.get('keen_senses_skills', ())),
                'lineages': sp['lineages'], 'notes': list(sp['notes']),
            }
            for sid, sp in SPECIES.items()
        },
        'backgrounds': {
            bid: {
                'id': bg['id'], 'name': bg['name'], 'abilities': list(bg['abilities']),
                'skills': list(bg['skills']), 'tool': bg['tool'], 'feat': bg['feat'],
                'caster_only': bg['caster_only'],
                'equipment': {
                    opt: {'label': pkg['label'], 'cp': pkg['cp'], 'items': [[i, q] for i, q in pkg['items']]}
                    for opt, pkg in bg['equipment'].items()
                },
            }
            for bid, bg in BACKGROUNDS.items()
        },
        'origin_feats': ORIGIN_FEATS,
        'fighting_styles': FIGHTING_STYLES,
        'divine_orders': DIVINE_ORDERS,
        'metamagic': METAMAGIC_OPTIONS,
        'mastery_weapons': list(MASTERY_WEAPONS),
        'shop': shop,
        'spells': spells_view,
    }


def _level_hp_gain(hit_die: int, con_mod: int, level: int, draconic_l3: bool = False) -> int:
    if level == 1:
        return max(1, hit_die + con_mod)
    gain = max(1, hit_die // 2 + 1 + con_mod)
    if draconic_l3 and level == 3:
        gain += 3
    return gain


def _compute_max_hp(class_id: str, level: int, con_mod: int) -> int:
    hd = CLASSES[class_id]['hit_die']
    hp = _level_hp_gain(hd, con_mod, 1)
    for lv in range(2, level + 1):
        hp += _level_hp_gain(hd, con_mod, lv, draconic_l3=(class_id == 'sorcerer'))
    return hp


def validate_and_derive(
    recipe: Any,
    *,
    unit_id: str = 'custom_1',
    validate_rust: bool = True,
) -> dict[str, Any]:
    """Validate an SRD 5.2.1 build recipe and derive its exact schema-1 ``ContentDoc``
    and ``CustomHeroInput`` payload. Raises ``BuilderError`` on any violation."""
    errors: list[dict[str, str]] = []
    warnings: list[str] = []

    def err(field: str, message: str) -> None:
        errors.append({'field': field, 'message': message})

    if not isinstance(recipe, dict):
        raise BuilderError([{'field': 'recipe', 'message': 'Recipe must be a JSON object.'}])

    unknown = sorted(set(recipe) - RECIPE_ALLOWED_KEYS)
    if unknown:
        err('recipe', f'Unexpected recipe fields: {", ".join(unknown)}.')

    # --- Identity ---
    raw_name = recipe.get('name', '')
    name = raw_name.strip() if isinstance(raw_name, str) else ''
    if not name or not NAME_RE.match(name):
        err('name', 'Name must be 1–32 printable characters (letters, digits, spaces, apostrophe, hyphen, period, comma).')

    level = recipe.get('level', 1)
    if type(level) is not int or level not in (1, 2, 3):
        err('level', 'Level must be an integer: 1, 2, or 3.')
        level = 1

    class_id = recipe.get('class_id')
    if class_id not in CLASSES:
        err('class_id', f'Unsupported class {class_id!r}.')
        raise BuilderError(errors)
    cls = CLASSES[class_id]
    is_caster = class_id in CASTER_CLASSES

    model_key = recipe.get('model_key') or cls['default_model']
    if model_key not in ALLOWED_MODEL_IDS:
        err('model_key', f'Unsupported appearance {model_key!r}.')
        model_key = cls['default_model']

    # --- Species & Lineage ---
    species_id = recipe.get('species')
    if species_id not in SPECIES:
        err('species', f'Unsupported species {species_id!r}.')
        raise BuilderError(errors)
    sp = SPECIES[species_id]
    if sp['caster_only'] and not is_caster:
        err('species', f"{sp['name']} spellcasting lineages are restricted to spellcasting classes in Step 1.")

    lineage_id = recipe.get('lineage')
    if sp['lineages']:
        if lineage_id not in sp['lineages']:
            err('lineage', f"Choose a supported lineage for {sp['name']}: {', '.join(sp['lineages'])}.")
            lineage_id = next(iter(sp['lineages']))
    else:
        if lineage_id not in (None, ''):
            err('lineage', f"{sp['name']} does not take a lineage.")
        lineage_id = None

    size = recipe.get('size') or sp['sizes'][0]
    if size not in sp['sizes']:
        err('size', f"{sp['name']} size must be one of {', '.join(sp['sizes'])}.")
        size = sp['sizes'][0]

    # --- Background & Origin Feats ---
    bg_id = recipe.get('background')
    if bg_id not in BACKGROUNDS:
        err('background', f'Unsupported background {bg_id!r}.')
        raise BuilderError(errors)
    bg = BACKGROUNDS[bg_id]
    if bg['caster_only'] and not is_caster:
        err('background', f"{bg['name']} ({ORIGIN_FEATS[bg['feat']]['name']}) is restricted to spellcasting classes in Step 1.")

    feats: list[str] = [bg['feat']]
    versatile_feat = recipe.get('versatile_feat')
    if species_id == 'human':
        if versatile_feat not in ORIGIN_FEATS:
            err('versatile_feat', 'Human Versatile requires choosing a supported Origin feat.')
        else:
            if ORIGIN_FEATS[versatile_feat]['caster_only'] and not is_caster:
                err('versatile_feat', f"{ORIGIN_FEATS[versatile_feat]['name']} is restricted to spellcasting classes in Step 1.")
            elif versatile_feat == bg['feat']:
                err('versatile_feat', f"Cannot take {ORIGIN_FEATS[versatile_feat]['name']} twice (take Magic Initiate with a different spell list or another Origin feat).")
            else:
                feats.append(versatile_feat)
    elif versatile_feat not in (None, ''):
        err('versatile_feat', 'Only Humans gain a Versatile Origin feat.')

    # --- Ability Scores (Standard Array / Point Buy + Background ASI) ---
    method = recipe.get('ability_method', 'standard_array')
    if method not in ('standard_array', 'point_buy'):
        err('ability_method', 'ability_method must be "standard_array" or "point_buy".')

    base_raw = recipe.get('base_abilities')
    base_scores: dict[str, int] = {a: 10 for a in ABILITIES}
    point_buy_spent = 0
    if not isinstance(base_raw, dict) or set(base_raw) != set(ABILITIES):
        err('base_abilities', 'base_abilities must specify all six abilities (str, dex, con, int, wis, cha).')
    else:
        bad_type = False
        for a in ABILITIES:
            v = base_raw[a]
            if type(v) is not int:
                err('base_abilities', f'{ABILITY_LABELS[a]} base score must be an integer.')
                bad_type = True
            else:
                base_scores[a] = v
        if not bad_type:
            if method == 'standard_array':
                if sorted(base_scores.values(), reverse=True) != list(STANDARD_ARRAY):
                    err('base_abilities', 'Standard Array must assign 15, 14, 13, 12, 10, 8 exactly once each.')
            elif method == 'point_buy':
                for a, v in base_scores.items():
                    if v not in POINT_BUY_COSTS:
                        err('base_abilities', f'Point Buy {ABILITY_LABELS[a]} score must be between 8 and 15 (got {v}).')
                    else:
                        point_buy_spent += POINT_BUY_COSTS[v]
                if point_buy_spent > POINT_BUY_BUDGET:
                    err('base_abilities', f'Point Buy spent {point_buy_spent} points (maximum {POINT_BUY_BUDGET}).')
                elif point_buy_spent < POINT_BUY_BUDGET:
                    warnings.append(f'Point Buy has {POINT_BUY_BUDGET - point_buy_spent} unspent point(s).')

    bg_asi_mode = recipe.get('bg_asi_mode', '2_1')
    bg_asi_raw = recipe.get('bg_asi')
    asi: dict[str, int] = {}
    if bg_asi_mode not in ('2_1', '1_1_1'):
        err('bg_asi_mode', 'Background ability bonus mode must be "2_1" (+2/+1) or "1_1_1" (+1/+1/+1).')
    elif not isinstance(bg_asi_raw, dict):
        err('bg_asi', 'Background ability bonuses must be an object mapping abilities to bonuses.')
    else:
        allowed_bg_ab = set(bg['abilities'])
        for k, v in bg_asi_raw.items():
            if k not in allowed_bg_ab:
                err('bg_asi', f"{bg['name']} only improves {', '.join(a.upper() for a in bg['abilities'])} (got {k!r}).")
            elif type(v) is not int or v <= 0:
                err('bg_asi', f'Background bonus for {k} must be a positive integer.')
            else:
                asi[k] = v
        if not any(e['field'] == 'bg_asi' for e in errors):
            if bg_asi_mode == '2_1':
                if sorted(asi.values()) != [1, 2]:
                    err('bg_asi', 'Mode +2/+1 requires +2 to one background ability and +1 to another.')
            else:
                if set(asi) != allowed_bg_ab or any(v != 1 for v in asi.values()):
                    err('bg_asi', 'Mode +1/+1/+1 requires +1 to all three background abilities.')

    final_scores = {a: base_scores[a] + asi.get(a, 0) for a in ABILITIES}
    for a, v in final_scores.items():
        if v > 20:
            err('bg_asi', f'{ABILITY_LABELS[a]} cannot exceed 20 after background bonuses.')
    mods = {a: ability_mod(final_scores[a]) for a in ABILITIES}

    # --- Class-specific features (Fighting Style, Divine Order, Metamagic, Masteries) ---
    fighting_style = recipe.get('fighting_style')
    if class_id == 'fighter':
        if fighting_style not in FIGHTING_STYLES:
            err('fighting_style', 'Fighter must choose Defense or Great Weapon Fighting.')
        else:
            feats.append(fighting_style)
    elif fighting_style not in (None, ''):
        err('fighting_style', 'Only Fighters choose a Fighting Style.')

    divine_order = recipe.get('divine_order')
    if class_id == 'cleric':
        if divine_order not in DIVINE_ORDERS:
            err('divine_order', 'Cleric must choose Protector or Thaumaturge.')
    elif divine_order not in (None, ''):
        err('divine_order', 'Only Clerics choose a Divine Order.')

    metamagic: list[str] = []
    if class_id == 'sorcerer' and level >= 2:
        mm_raw = _clean_str_list(recipe.get('metamagic'), 'metamagic', errors, max_len=4)
        if not mm_raw:
            mm_raw = ['empowered_spell', 'heightened_spell']
        if len(mm_raw) != 2 or len(set(mm_raw)) != 2 or any(m not in METAMAGIC_OPTIONS for m in mm_raw):
            err('metamagic', 'Level 2–3 Sorcerer must pick 2 distinct Metamagic options (Empowered Spell, Heightened Spell).')
        else:
            metamagic = mm_raw
    elif recipe.get('metamagic'):
        err('metamagic', 'Metamagic is available only to Level 2–3 Sorcerers.')

    weapon_masteries: list[str] = []
    if class_id in ('fighter', 'barbarian'):
        need_m = cls['weapon_mastery_count']
        wm_raw = _clean_str_list(recipe.get('weapon_masteries'), 'weapon_masteries', errors, max_len=6)
        if len(wm_raw) != need_m or len(set(wm_raw)) != need_m or any(w not in MASTERY_WEAPONS for w in wm_raw):
            err('weapon_masteries', f"{cls['name']} must choose {need_m} distinct mastery weapons from {', '.join(MASTERY_WEAPONS)}.")
        else:
            weapon_masteries = wm_raw
    elif recipe.get('weapon_masteries'):
        err('weapon_masteries', 'Only Fighters and Barbarians choose Weapon Masteries.')

    # --- Skills (source-specific, no duplicates, Barbarian L3 reservation) ---
    skills: list[str] = []
    for s in bg['skills']:
        if s not in skills:
            skills.append(s)

    class_skills = _clean_str_list(recipe.get('class_skills'), 'class_skills', errors, max_len=6)
    allowed_cls_skills = set(cls['skills'])
    if len(class_skills) != cls['skill_count'] or len(set(class_skills)) != cls['skill_count']:
        err('class_skills', f"{cls['name']} must choose {cls['skill_count']} distinct class skills.")
    else:
        for s in class_skills:
            if s not in allowed_cls_skills:
                err('class_skills', f'{s} is not on the {cls["name"]} skill list.')
            elif s in skills:
                err('class_skills', f'{s} is already granted by {bg["name"]}; choose another {cls["name"]} skill.')
            else:
                skills.append(s)

    species_skill = recipe.get('species_skill')
    if species_id == 'human':
        if species_skill not in ALL_SKILLS:
            err('species_skill', 'Human Skillful requires choosing 1 skill proficiency.')
        elif species_skill in skills:
            err('species_skill', f'{species_skill} is already proficient; choose another skill for Skillful.')
        else:
            skills.append(species_skill)
    elif species_id == 'elf':
        if species_skill not in sp['keen_senses_skills']:
            err('species_skill', 'Elf Keen Senses must choose Insight, Perception, or Survival.')
        elif species_skill in skills:
            err('species_skill', f'{species_skill} is already proficient; choose another Keen Senses skill.')
        else:
            skills.append(species_skill)
    elif species_skill not in (None, ''):
        err('species_skill', f"{sp['name']} does not pick a species skill.")

    skilled_skills = _clean_str_list(recipe.get('skilled_skills'), 'skilled_skills', errors, max_len=6)
    if 'skilled' in feats:
        if len(skilled_skills) != 3 or len(set(skilled_skills)) != 3:
            err('skilled_skills', 'Skilled requires 3 distinct skills.')
        else:
            for s in skilled_skills:
                if s not in ALL_SKILLS:
                    err('skilled_skills', f'Unknown skill {s!r}.')
                elif s in skills:
                    err('skilled_skills', f'{s} is already proficient; choose another skill for Skilled.')
                else:
                    skills.append(s)
    elif skilled_skills:
        err('skilled_skills', 'skilled_skills requires the Skilled Origin feat.')

    # Barbarian L3 Primal Knowledge (and L1-2 reservation so L3 never dead-ends)
    primal_skill = recipe.get('primal_knowledge_skill')
    if class_id == 'barbarian':
        remaining_barb = [s for s in CLASSES['barbarian']['skills'] if s not in skills]
        if level < 3:
            if not remaining_barb:
                err('skilled_skills' if 'skilled' in feats else 'species_skill',
                    'Leave at least one Barbarian class skill unproficient so Level 3 Primal Knowledge remains available.')
            if primal_skill not in (None, ''):
                err('primal_knowledge_skill', 'Primal Knowledge is gained at Barbarian level 3.')
        else:
            if primal_skill not in CLASSES['barbarian']['skills']:
                err('primal_knowledge_skill', 'Level 3 Barbarian must pick 1 Primal Knowledge skill from the Barbarian skill list.')
            elif primal_skill in skills:
                err('primal_knowledge_skill', f'{primal_skill} is already proficient; leave or choose another Barbarian skill.')
            else:
                skills.append(primal_skill)
    elif primal_skill not in (None, ''):
        err('primal_knowledge_skill', 'Only Level 3 Barbarians choose Primal Knowledge.')

    # Bard L2 Expertise & L3 College of Lore Bonus Proficiencies
    expertise: list[str] = []
    lore_skills: list[str] = []
    if class_id == 'bard':
        if level >= 2:
            exp_raw = _clean_str_list(recipe.get('expertise'), 'expertise', errors, max_len=4)
            if len(exp_raw) != 2 or len(set(exp_raw)) != 2:
                err('expertise', 'Level 2–3 Bard must choose 2 distinct proficient skills for Expertise.')
            else:
                for s in exp_raw:
                    if s not in skills:
                        err('expertise', f'Expertise requires proficiency in {s}.')
                    else:
                        expertise.append(s)
        elif recipe.get('expertise'):
            err('expertise', 'Bard Expertise is gained at level 2.')
        if level >= 3:
            lore_raw = _clean_str_list(recipe.get('lore_skills'), 'lore_skills', errors, max_len=6)
            if len(lore_raw) != 3 or len(set(lore_raw)) != 3:
                err('lore_skills', 'Level 3 College of Lore Bard must choose 3 distinct bonus skills.')
            else:
                for s in lore_raw:
                    if s not in ALL_SKILLS:
                        err('lore_skills', f'Unknown skill {s!r}.')
                    elif s in skills:
                        err('lore_skills', f'{s} is already proficient; choose another skill for Bonus Proficiencies.')
                    else:
                        lore_skills.append(s)
                        skills.append(s)
        elif recipe.get('lore_skills'):
            err('lore_skills', 'College of Lore Bonus Proficiencies are gained at level 3.')
    else:
        if recipe.get('expertise'):
            err('expertise', 'Only Level 2–3 Bards select Expertise here.')
        if recipe.get('lore_skills'):
            err('lore_skills', 'Only Level 3 College of Lore Bards select lore_skills.')

    # Wizard L2 Scholar (sheet-only Expertise)
    scholar_skill = recipe.get('scholar_skill')
    if class_id == 'wizard' and level >= 2:
        if scholar_skill:
            if scholar_skill not in CLASSES['wizard']['scholar_skills'] or scholar_skill not in skills:
                err('scholar_skill', 'Wizard Scholar must pick a proficient skill from Arcana, History, Investigation, Medicine, Nature, or Religion.')
            else:
                expertise.append(scholar_skill)
        else:
            eligible_scholar = [s for s in CLASSES['wizard']['scholar_skills'] if s in skills]
            if eligible_scholar:
                scholar_skill = eligible_scholar[0]
                expertise.append(scholar_skill)
    elif scholar_skill not in (None, ''):
        err('scholar_skill', 'Scholar is gained at Wizard level 2.')

    # --- Starting Equipment, Shop Purse & Ownership ---
    cls_pkg_key = recipe.get('class_equip_choice', 'A')
    if cls_pkg_key not in cls['starting_equipment']:
        err('class_equip_choice', f"Class starting equipment must be one of {', '.join(cls['starting_equipment'])}.")
        cls_pkg_key = 'A'
    bg_pkg_key = recipe.get('bg_equip_choice', 'A')
    if bg_pkg_key not in bg['equipment']:
        err('bg_equip_choice', 'Background starting equipment must be A or B.')
        bg_pkg_key = 'A'

    owned: dict[str, int] = {}
    for item_id, qty in cls['starting_equipment'][cls_pkg_key]['items']:
        owned[item_id] = owned.get(item_id, 0) + qty
    for item_id, qty in bg['equipment'][bg_pkg_key]['items']:
        owned[item_id] = owned.get(item_id, 0) + qty
    starting_cp = cls['starting_equipment'][cls_pkg_key]['cp'] + bg['equipment'][bg_pkg_key]['cp']
    spent_cp = 0

    purchases_raw = recipe.get('purchases')
    if purchases_raw is None:
        purchases_raw = []
    if not isinstance(purchases_raw, list) or len(purchases_raw) > 24:
        err('purchases', 'purchases must be a list of at most 24 items.')
    else:
        for entry in purchases_raw:
            if not isinstance(entry, dict) or set(entry) != {'id', 'qty'}:
                err('purchases', 'Each purchase entry must contain only id and qty.')
                continue
            pid, qty = entry['id'], entry['qty']
            price = _shop_price_cp(pid) if isinstance(pid, str) else None
            if price is None:
                err('purchases', f'Unknown shop item {pid!r}.')
                continue
            if type(qty) is not int or not (1 <= qty <= 20):
                err('purchases', f'Purchase qty for {pid} must be an integer from 1 to 20.')
                continue
            spent_cp += price * qty
            owned[pid] = owned.get(pid, 0) + qty

    remaining_cp = starting_cp - spent_cp
    if remaining_cp < 0:
        err('purchases', f'Purchases cost {format_coins(spent_cp)}, exceeding starting purse {format_coins(starting_cp)}.')

    # --- Armor / Weapon Proficiencies & Equipped Practice Loadout ---
    armor_profs = set(cls['armor_training'])
    weapon_profs = set(cls['weapon_proficiencies'])
    if class_id == 'cleric' and divine_order == 'protector':
        armor_profs.add('heavy')
        weapon_profs.add('martial')

    eq_armor = recipe.get('equipped_armor')
    if eq_armor == '':
        eq_armor = None
    if eq_armor is not None:
        if eq_armor not in ARMORS:
            err('equipped_armor', f'Unsupported armor {eq_armor!r}.')
            eq_armor = None
        else:
            arm = ARMORS[eq_armor]
            if owned.get(eq_armor, 0) < 1:
                err('equipped_armor', f'You do not own {arm["name"]}; choose a package or buy it with starting coins.')
            if arm['category'] not in armor_profs:
                err('equipped_armor', f"{cls['name']} does not have {arm['category']} armor training.")
            if arm['min_str'] and final_scores['str'] < arm['min_str']:
                err('equipped_armor', f"{arm['name']} requires Strength {arm['min_str']} to equip in Step 1 (full-speed limitation; you still own it in your pack).")

    eq_shield = bool(recipe.get('equipped_shield', False))
    if type(recipe.get('equipped_shield', False)) is not bool:
        err('equipped_shield', 'equipped_shield must be a boolean.')
        eq_shield = False
    if eq_shield:
        if owned.get('shield', 0) < 1:
            err('equipped_shield', 'You do not own a Shield; choose a package or buy one (10 GP).')
        if 'shield' not in armor_profs:
            err('equipped_shield', f"{cls['name']} does not have Shield training.")

    eq_weapons = _clean_str_list(recipe.get('equipped_weapons'), 'equipped_weapons', errors, max_len=4)
    if len(eq_weapons) > 2:
        err('equipped_weapons', 'Equip at most 2 weapons.')
    if len(set(eq_weapons)) != len(eq_weapons):
        err('equipped_weapons', 'Equip each weapon type at most once (extra owned copies of thrown weapons are carried as spares automatically).')
    light_count = 0
    hand_slots = 1.0 if eq_shield else 0.0
    valid_eq_weapons: list[str] = []
    for wid in eq_weapons:
        if wid not in WEAPONS:
            err('equipped_weapons', f'{_item_display_name(wid)} cannot be equipped in Practice in Step 1.')
            continue
        w = WEAPONS[wid]
        if owned.get(wid, 0) < 1:
            err('equipped_weapons', f'You do not own a {w["name"]}; choose a package or buy one.')
            continue
        if w['category'] not in weapon_profs:
            err('equipped_weapons', f"{cls['name']} is not proficient with {w['name']}.")
            continue
        if 'heavy' in w['properties'] and final_scores['str'] < 13:
            err('equipped_weapons', f"{w['name']} is Heavy and requires Strength 13 to equip in Step 1 (you still own it in your pack).")
            continue
        if 'light' in w['properties']:
            light_count += 1
        hand_slots += w['hand_slots']
        valid_eq_weapons.append(wid)
    if light_count > 1:
        err('equipped_weapons', 'Step 1 allows at most 1 Light melee weapon equipped at a time (Two-Weapon Fighting is not yet in Practice).')
    if hand_slots > 2.0 + 1e-9:
        err('equipped_weapons', f'Equipped weapons and shield require {hand_slots:g} hand slots (maximum 2).')

    # --- Spells & Sources (caster classes only in Step 1) ---
    has_mi_cleric = 'magic_initiate_cleric' in feats
    has_mi_wizard = 'magic_initiate_wizard' in feats
    has_diamond = owned.get('diamond_50gp', 0) >= 1
    holy_water_qty = owned.get('holy_water', 0)

    origin_cantrips: list[str] = []
    origin_l1_spells: list[str] = []
    free_cast_sources: list[tuple[str, str]] = []  # (spell_id, pool_name)
    origin_spell_ids: set[str] = set()
    inert_spell_reasons: dict[str, str] = {}

    if is_caster:
        cast_ab = cls['casting_ability']

        # Species spells
        if species_id == 'elf' and lineage_id == 'high_elf':
            he_c = recipe.get('high_elf_cantrip') or 'prestidigitation'
            if he_c not in _spells_for_class('wizard', 0):
                err('high_elf_cantrip', 'High Elf lineage cantrip must be a supported Wizard cantrip.')
            else:
                origin_cantrips.append(he_c)
                origin_spell_ids.add(he_c)
            if level >= 3:
                origin_l1_spells.append('detect_magic')
                origin_spell_ids.add('detect_magic')
                inert_spell_reasons['detect_magic'] = 'No effect in combat (High Elf L3).'
        elif species_id == 'tiefling' and lineage_id == 'abyssal':
            origin_cantrips.extend(['poison_spray', 'thaumaturgy'])
            origin_spell_ids.update(('poison_spray', 'thaumaturgy'))
            if level >= 3:
                origin_l1_spells.append('ray_of_sickness')
                origin_spell_ids.add('ray_of_sickness')
                free_cast_sources.append(('ray_of_sickness', 'fiendish_legacy'))

        # Magic Initiate (Cleric)
        if has_mi_cleric:
            mic_c = _clean_str_list(recipe.get('mi_cleric_cantrips'), 'mi_cleric_cantrips', errors, max_len=4)
            mic_s = recipe.get('mi_cleric_spell')
            valid_c0 = set(_spells_for_class('cleric', 0))
            valid_c1 = set(_spells_for_class('cleric', 1))
            if len(mic_c) != 2 or len(set(mic_c)) != 2 or any(s not in valid_c0 for s in mic_c):
                err('mi_cleric_cantrips', 'Magic Initiate (Cleric) requires 2 distinct Cleric cantrips.')
            else:
                for s in mic_c:
                    if s in origin_spell_ids:
                        err('mi_cleric_cantrips', f'{SPELLS[s]["name"]} is already granted by another origin source.')
                    else:
                        origin_cantrips.append(s)
                        origin_spell_ids.add(s)
            if mic_s not in valid_c1:
                err('mi_cleric_spell', 'Magic Initiate (Cleric) requires 1 supported Level 1 Cleric spell.')
            else:
                if mic_s in origin_spell_ids:
                    err('mi_cleric_spell', f'{SPELLS[mic_s]["name"]} is already granted by another origin free-cast source; choose a distinct spell.')
                else:
                    origin_l1_spells.append(mic_s)
                    origin_spell_ids.add(mic_s)
                    free_cast_sources.append((mic_s, 'magic_initiate_cleric'))

        # Magic Initiate (Wizard)
        if has_mi_wizard:
            miw_c = _clean_str_list(recipe.get('mi_wizard_cantrips'), 'mi_wizard_cantrips', errors, max_len=4)
            miw_s = recipe.get('mi_wizard_spell')
            valid_w0 = set(_spells_for_class('wizard', 0))
            valid_w1 = set(_spells_for_class('wizard', 1))
            if len(miw_c) != 2 or len(set(miw_c)) != 2 or any(s not in valid_w0 for s in miw_c):
                err('mi_wizard_cantrips', 'Magic Initiate (Wizard) requires 2 distinct Wizard cantrips.')
            else:
                for s in miw_c:
                    if s in origin_spell_ids:
                        err('mi_wizard_cantrips', f'{SPELLS[s]["name"]} is already granted by another origin source.')
                    else:
                        origin_cantrips.append(s)
                        origin_spell_ids.add(s)
            if miw_s not in valid_w1:
                err('mi_wizard_spell', 'Magic Initiate (Wizard) requires 1 supported Level 1 Wizard spell.')
            else:
                if miw_s in origin_spell_ids:
                    err('mi_wizard_spell', f'{SPELLS[miw_s]["name"]} is already granted by another origin free-cast source; choose a distinct spell.')
                else:
                    origin_l1_spells.append(miw_s)
                    origin_spell_ids.add(miw_s)
                    free_cast_sources.append((miw_s, 'magic_initiate_wizard'))

        # Class Cantrips
        need_cantrips = cls['cantrip_counts'][level] + (1 if class_id == 'cleric' and divine_order == 'thaumaturge' else 0)
        class_cantrips = _clean_str_list(recipe.get('class_cantrips'), 'class_cantrips', errors, max_len=10)
        valid_cls_c0 = set(_spells_for_class(class_id, 0))
        if len(class_cantrips) != need_cantrips or len(set(class_cantrips)) != need_cantrips:
            err('class_cantrips', f"{cls['name']} must choose {need_cantrips} distinct cantrips.")
        else:
            for s in class_cantrips:
                if s not in valid_cls_c0:
                    err('class_cantrips', f'{s} is not on the {cls["name"]} cantrip list.')
                elif s in origin_spell_ids:
                    err('class_cantrips', f'{SPELLS[s]["name"]} is already granted by your species/Origin feat; pick a different class cantrip (or swap via Magic Initiate Spell Change on level-up).')

        # Always-prepared subclass spells at L3
        always_prepared: list[str] = list(cls.get('always_prepared_l3', ())) if level >= 3 else []
        for s in always_prepared:
            if s in origin_spell_ids:
                err('mi_wizard_spell' if has_mi_wizard else 'mi_cleric_spell',
                    f'{SPELLS[s]["name"]} is always prepared by {cls["subclass_name"]} at level 3; swap your Magic Initiate spell via Spell Change.')

        # Wizard Spellbook & Evocation Savant
        max_spell_lvl = 2 if level >= 3 else 1
        valid_cls_leveled = set()
        for lv in range(1, max_spell_lvl + 1):
            valid_cls_leveled.update(_spells_for_class(class_id, lv))

        wizard_spellbook: list[str] = []
        evocation_savant: list[str] = []
        if class_id == 'wizard':
            need_sb = cls['spellbook_counts'][level]
            sb_raw = _clean_str_list(recipe.get('wizard_spellbook'), 'wizard_spellbook', errors, max_len=16)
            if len(sb_raw) != need_sb or len(set(sb_raw)) != need_sb:
                err('wizard_spellbook', f'Level {level} Wizard spellbook must contain {need_sb} distinct Wizard spells.')
            else:
                l2_count = 0
                for s in sb_raw:
                    if s not in valid_cls_leveled:
                        err('wizard_spellbook', f'{s} is not a legal Level 1–{max_spell_lvl} Wizard spell.')
                    elif SPELLS[s]['level'] == 2:
                        l2_count += 1
                if level == 3 and l2_count > 4:
                    err('wizard_spellbook', 'At Level 3, at most 4 spellbook spells can be Level 2 (the first 8 spells learned at Levels 1–2 are Level 1).')
                wizard_spellbook = sb_raw
            if level >= 3:
                ev_raw = _clean_str_list(recipe.get('evocation_savant'), 'evocation_savant', errors, max_len=4)
                if len(ev_raw) != 2 or len(set(ev_raw)) != 2:
                    err('evocation_savant', 'Level 3 Evoker must pick 2 distinct Wizard Evocation spells (levels 1–2) for Evocation Savant.')
                else:
                    for s in ev_raw:
                        if s not in valid_cls_leveled or SPELLS[s]['school'] != 'evocation':
                            err('evocation_savant', f'{s} is not a Level 1–2 Wizard Evocation spell.')
                        elif s not in wizard_spellbook:
                            err('evocation_savant', f'Evocation Savant spell {SPELLS[s]["name"]} must be included in wizard_spellbook.')
                    evocation_savant = ev_raw
        elif recipe.get('wizard_spellbook') or recipe.get('evocation_savant'):
            err('wizard_spellbook', 'Only the Wizard class has a spellbook / Evocation Savant.')

        # Class Prepared Spells
        need_prep = cls['prepared_counts'][level]
        class_prepared = _clean_str_list(recipe.get('class_prepared'), 'class_prepared', errors, max_len=12)
        if len(class_prepared) != need_prep or len(set(class_prepared)) != need_prep:
            err('class_prepared', f"{cls['name']} level {level} must prepare {need_prep} distinct class spells.")
        else:
            for s in class_prepared:
                if s not in valid_cls_leveled:
                    err('class_prepared', f'{s} is not a legal Level 1–{max_spell_lvl} {cls["name"]} spell.')
                elif class_id == 'wizard' and s not in wizard_spellbook:
                    err('class_prepared', f'Wizard can only prepare spells from their spellbook ({SPELLS[s]["name"]} missing).')
                elif s in always_prepared:
                    err('class_prepared', f'{SPELLS[s]["name"]} is already always prepared by {cls["subclass_name"]}; choose another spell.')
                elif s in origin_spell_ids:
                    err('class_prepared', f'{SPELLS[s]["name"]} is already granted by your species/Origin feat; pick another class spell (or swap via Magic Initiate Spell Change on level-up).')

        # Natural20 entity.py:4013 cross-list attack-modifier parity guard:
        # For any attack-roll spell granted by an origin (Magic Initiate / lineage),
        # class casting modifier must be >= the modifier of every native mental ability
        # of that spell so Natural20 and Rust compute identical spell_attack & DC.
        cast_mod = mods[cast_ab]
        for s in list(origin_cantrips) + list(origin_l1_spells):
            sp_info = SPELLS.get(s)
            if sp_info and sp_info.get('combat') and sp_info.get('attack_roll'):
                for nat_ab in sp_info.get('native_abilities', ()):
                    if mods[nat_ab] > cast_mod:
                        err('base_abilities',
                            f"Cross-list origin attack spell {sp_info['name']} requires your class casting ability ({cast_ab.upper()} {_fmt_mod(cast_mod)}) to be at least as high as {nat_ab.upper()} ({_fmt_mod(mods[nat_ab])}) in Step 1.")
    else:
        class_cantrips = []
        class_prepared = []
        always_prepared = []
        wizard_spellbook = []
        evocation_savant = []
        for fld in ('class_cantrips', 'class_prepared', 'wizard_spellbook', 'evocation_savant',
                    'high_elf_cantrip', 'mi_cleric_cantrips', 'mi_cleric_spell',
                    'mi_wizard_cantrips', 'mi_wizard_spell'):
            if recipe.get(fld):
                err(fld, f"{cls['name']} does not use spell choices in Step 1.")

    if errors:
        raise BuilderError(errors)

    # -----------------------------------------------------------------------
    # Deterministic Derivation of Schema-1 ContentDoc + CustomHeroInput
    # -----------------------------------------------------------------------
    pb = PROFICIENCY_BONUS_L1_3
    max_hp = _compute_max_hp(class_id, level, mods['con'])

    # AC
    if eq_armor is not None:
        arm = ARMORS[eq_armor]
        if arm['category'] == 'light':
            ac = arm['ac'] + mods['dex']
        elif arm['category'] == 'medium':
            ac = arm['ac'] + min(mods['dex'], 2)
        else:
            ac = arm['ac']
        if 'defense' in feats:
            ac += 1
    else:
        if class_id == 'barbarian':
            ac = 10 + mods['dex'] + mods['con']
        elif class_id == 'sorcerer' and level >= 3:
            ac = 10 + mods['dex'] + mods['cha']
        else:
            ac = 10 + mods['dex']
    if eq_shield:
        ac += 2

    # Saves & Skills
    saves_map = {
        a: mods[a] + (pb if a in cls['saves'] else 0)
        for a in ABILITIES
    }
    skills_map: dict[str, int] = {}
    joat = (class_id == 'bard' and level >= 2)
    for sk in ALL_SKILLS:
        base_m = mods[SKILL_ABILITY[sk]]
        if sk in skills:
            skills_map[sk] = base_m + (pb * 2 if sk in expertise else pb)
        elif joat:
            skills_map[sk] = base_m + (pb // 2)
        else:
            skills_map[sk] = base_m

    init_bonus = mods['dex'] + (pb if 'alert' in feats else 0)
    init_adv = (class_id == 'fighter' and level >= 3)
    passive_perception = 10 + skills_map['perception']

    # Equipment loadout & spares
    loadout_equipment: list[dict[str, Any]] = []
    spares_map: dict[str, int] = {}
    for wid in valid_eq_weapons:
        w = WEAPONS[wid]
        loadout_equipment.append({'id': wid, 'type': 'melee_attack', 'hand_slots': w['hand_slots']})
        if 'thrown' in w['properties'] and owned.get(wid, 0) > 1:
            spares_map[wid] = owned[wid] - 1
    if eq_shield:
        loadout_equipment.append({'id': 'shield', 'type': 'shield', 'hand_slots': 1.0})
    if eq_armor is not None:
        loadout_equipment.append({'id': eq_armor, 'type': 'armor', 'hand_slots': 0.0})
    wearing_armor = bool(eq_armor is not None or eq_shield)

    # Attacks
    attacks: list[dict[str, Any]] = []
    savage = 'savage_attacker' in feats
    gwf = 'great_weapon_fighting' in feats
    for wid in valid_eq_weapons:
        w = WEAPONS[wid]
        props = w['properties']
        is_finesse = 'finesse' in props
        atk_ability = 'finesse' if is_finesse else 'str'
        atk_mod = max(mods['str'], mods['dex']) if is_finesse else mods['str']
        two_hand_use = ('two_handed' in props) or ('versatile' in props and hand_slots <= 1.0 + 1e-9)
        die = w['damage_2'] if ('versatile' in props and hand_slots <= 1.0 + 1e-9) else w['damage']

        riders = []
        if savage:
            riders.append('savage_attacker')
        if gwf and two_hand_use:
            riders.append('great_weapon_fighting')

        masteries = []
        if class_id in ('fighter', 'barbarian') and wid in weapon_masteries and w['mastery'] in IMPLEMENTED_MASTERIES:
            masteries.append(w['mastery'])

        row = {
            'name': wid,
            'type': 'melee_attack',
            'range': w['range'],
            'range_max': w['range'],
            'to_hit': atk_mod + pb,
            'damage': _fmt_damage(die, atk_mod),
            'damage_type': w['damage_type'],
            'ability': atk_ability,
            'proficient': True,
            'additional': [],
            'on_hit': [],
            'save_attack': None,
            'multiattack_group': None,
            'masteries': masteries,
            'riders': riders,
            'thrown': False,
            'item': wid,
        }
        if 'versatile' in props:
            row['versatile'] = w['damage_2']
        attacks.append(row)

        if 'thrown' in props:
            t_min, t_max = w['thrown_range']
            t_riders = ['savage_attacker'] if savage else []
            # Cleave is melee-only; Sap applies on hit with Spear
            t_masteries = [m for m in masteries if m != 'cleave']
            t_row = {
                'name': wid,
                'type': 'melee_attack',
                'range': t_min,
                'range_max': t_max,
                'to_hit': atk_mod + pb,
                'damage': _fmt_damage(die, atk_mod),
                'damage_type': w['damage_type'],
                'ability': atk_ability,
                'proficient': True,
                'additional': [],
                'on_hit': [],
                'save_attack': None,
                'multiattack_group': None,
                'masteries': t_masteries,
                'riders': t_riders,
                'thrown': True,
                'item': wid,
            }
            if 'versatile' in props:
                t_row['versatile'] = w['damage_2']
            attacks.append(t_row)

    attacks.append({
        'name': 'unarmed_attack',
        'type': 'melee_attack',
        'range': 5,
        'range_max': 5,
        'to_hit': mods['str'] + pb,
        'damage': _fmt_damage('1', mods['str']),
        'damage_type': 'bludgeoning',
        'ability': 'str',
        'proficient': True,
        'additional': [],
        'on_hit': [],
        'save_attack': None,
        'multiattack_group': None,
        'masteries': [],
        'riders': [],
        'thrown': False,
        'item': None,
    })

    # Features
    features: list[dict[str, Any]] = []
    if class_id == 'fighter':
        features.append({'id': 'second_wind', 'uses': 2, 'level': level, 'die': f'1d10+{level}'})
        features.append({'id': 'weapon_mastery'})
        if level >= 2:
            features.append({'id': 'action_surge', 'uses': 1})
        if level >= 3:
            features.append({'id': 'martial_archetype'})
            features.append({'id': 'improved_critical'})
            features.append({'id': 'remarkable_athlete'})
    elif class_id == 'barbarian':
        heavy_worn = bool(eq_armor and ARMORS[eq_armor]['category'] == 'heavy')
        features.append({
            'id': 'rage', 'uses': 3 if level >= 3 else 2, 'damage': 2,
            'model': '2024', 'heavy_armor': heavy_worn,
        })
        features.append({'id': 'unarmored_defense_barbarian'})
        features.append({'id': 'weapon_mastery'})
        if level >= 2:
            features.append({'id': 'danger_sense'})
            features.append({'id': 'reckless_attack'})
        if level >= 3:
            features.append({'id': 'primal_path'})
            features.append({'id': 'frenzy'})
            features.append({'id': 'primal_knowledge'})
    elif class_id == 'cleric':
        features.append({'id': 'spellcasting'})
        features.append({'id': 'divine_order'})
        if level >= 2:
            features.append({'id': 'channel_divinity', 'uses': 2})
            features.append({'id': 'channel_divinity_turn_undead'})
            features.append({'id': 'divine_spark'})
        if level >= 3:
            features.append({'id': 'divine_domain'})
            features.append({'id': 'disciple_of_life'})
            features.append({'id': 'preserve_life', 'level': level})
    elif class_id == 'wizard':
        features.append({'id': 'spellcasting'})
        features.append({'id': 'ritual_adept'})
        features.append({'id': 'arcane_recovery'})
        if level >= 2:
            features.append({'id': 'scholar'})
        if level >= 3:
            features.append({'id': 'wizard_subclass'})
            features.append({'id': 'evocation_savant'})
            features.append({'id': 'potent_cantrip'})
    elif class_id == 'sorcerer':
        features.append({'id': 'spellcasting'})
        features.append({'id': 'innate_sorcery', 'uses': 2})
        if level >= 2:
            features.append({'id': 'font_of_magic', 'sorcery_points': level})
            features.append({'id': 'metamagic', 'options': metamagic})
        if level >= 3:
            features.append({'id': 'sorcerer_subclass'})
            features.append({'id': 'draconic_resilience'})
            features.append({'id': 'draconic_spells'})
    elif class_id == 'bard':
        bi_uses = max(1, mods['cha'])
        features.append({'id': 'bardic_inspiration', 'uses': bi_uses, 'die': '1d6'})
        features.append({'id': 'spellcasting'})
        if level >= 2:
            features.append({'id': 'expertise'})
            features.append({'id': 'jack_of_all_trades'})
        if level >= 3:
            features.append({'id': 'bard_subclass'})
            features.append({'id': 'bonus_proficiencies'})
            features.append({'id': 'cutting_words'})

    # Feat features
    for fid in feats:
        if fid == 'great_weapon_fighting':
            features.append({'id': 'great_weapon_fighting', 'model': 'treat_1_2_as_3'})
        else:
            features.append({'id': fid})

    # Species features
    if species_id == 'human':
        features.extend([{'id': 'resourceful'}, {'id': 'skillful'}, {'id': 'versatile'}])
    elif species_id == 'elf':
        features.extend([{'id': 'elven_lineage'}, {'id': 'fey_ancestry'}, {'id': 'keen_senses'}, {'id': 'trance'}])
    elif species_id == 'tiefling':
        features.extend([{'id': 'fiendish_legacy'}, {'id': 'otherworldly_presence'}])

    # Spellcasting doc
    spellcasting_doc = None
    notes: list[str] = list(sp['notes'])
    if 'alert' in feats:
        notes.append('Alert Initiative Swap is sheet-only in Practice.')
    if class_id == 'barbarian' and level >= 3:
        notes.append('Primal Knowledge STR-for-5-skills while raging is sheet-only in Practice.')
    if class_id == 'cleric' and divine_order == 'thaumaturge':
        notes.append('Thaumaturge +WIS to Arcana/Religion is sheet-only in Practice.')
    if class_id == 'fighter' and level >= 2:
        notes.append('Tactical Mind is sheet-only in Practice.')

    all_sheet_spells: list[str] = []
    if is_caster:
        cast_ab = cls['casting_ability']
        cast_atk = pb + mods[cast_ab]
        cast_dc = 8 + cast_atk
        c0_cnt = cls['cantrip_counts'][level]
        slots = [c0_cnt, 2] if level == 1 else ([c0_cnt, 3] if level == 2 else [c0_cnt, 4, 2])

        ordered_spells: list[str] = []
        for s in list(class_cantrips) + list(origin_cantrips) + list(class_prepared) + list(always_prepared) + list(origin_l1_spells):
            if s not in ordered_spells:
                ordered_spells.append(s)
        all_sheet_spells = list(ordered_spells)

        action_spells: list[str] = []
        reaction_spells: list[str] = []
        inert_spells: list[str] = []
        for s in ordered_spells:
            info = SPELLS[s]
            if info.get('requires_diamond_50gp') and not has_diamond:
                # SRD p. 113 + Codex 11:03 #3: kept on sheet, unavailable in Practice without 50 GP diamond
                inert_spells.append(s)
                inert_spell_reasons[s] = 'Requires a 50 GP diamond (not owned) — unavailable in Practice.'
                warnings.append('Chromatic Orb is on your sheet, but requires buying a 50 GP Diamond to cast in Practice.')
                continue
            if not info['combat']:
                inert_spells.append(s)
                inert_spell_reasons.setdefault(s, 'No effect in combat.')
                continue
            if info.get('reaction'):
                reaction_spells.append(s)
            else:
                action_spells.append(s)

        if 'protection_from_evil_and_good' in action_spells and holy_water_qty < 1:
            warnings.append('Protection from Evil and Good requires Holy Water (25 GP) to cast in combat.')

        spell_info_list = []
        for s in action_spells + reaction_spells:
            info = SPELLS[s]
            entry: dict[str, Any] = {
                'id': s,
                'name': info['name'],
                'level': info['level'],
                'casting_time': info['casting_time'],
                'concentration': info['concentration'],
            }
            if class_id == 'sorcerer' and s not in origin_spell_ids:
                # Class spell or Draconic Spell (never origin/MI spell)
                entry['sorcerer_spell'] = True
            spell_info_list.append(entry)

        free_casts_doc = []
        for f_spell, f_pool in free_cast_sources:
            if f_spell in inert_spells:
                # e.g., Chromatic Orb via MI(Wizard) without a 50 GP diamond: unavailable in Practice
                continue
            free_casts_doc.append({'spell': f_spell, 'pool': f_pool, 'uses': 1})

        resources: dict[str, int] = {}
        if class_id == 'cleric' and level >= 2:
            resources['channel_divinity'] = 2
        if holy_water_qty > 0:
            resources['holy_water'] = holy_water_qty
        if class_id == 'sorcerer':
            resources['innate_sorcery'] = 2
            if level >= 2:
                resources['sorcery_points'] = level

        spellcasting_doc = {
            'class': class_id,
            'level': level,
            'ability': cast_ab,
            'attack': cast_atk,
            'dc': cast_dc,
            'slots': slots,
            'spells': action_spells,
            'reaction_spells': reaction_spells,
            'inert_spells': inert_spells,
            'spell_info': spell_info_list,
            'free_casts': free_casts_doc,
            'resources': resources,
        }

    resistances: list[str] = []
    if species_id == 'tiefling' and lineage_id == 'abyssal':
        resistances.append('poison')
    darkvision = sp['darkvision']
    if lineage_id and lineage_id in sp['lineages']:
        darkvision = sp['lineages'][lineage_id].get('darkvision', darkvision)

    content_doc = {
        'schema': 1,
        'id': unit_id,
        'base_id': model_key,
        'source': 'srd-5.2.1',
        'licence': 'CC-BY-4.0',
        'attribution': (
            'This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") '
            'by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. '
            'The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License.'
        ),
        'provenance': {
            'natural20_commit': 'custom-builder-step1',
            'exporter': 'game/builder.py',
            'files': {},
        },
        'name': name,
        'side': 'heroes',
        'pc': True,
        'size': size,
        'races': [species_id, lineage_id] if lineage_id else [species_id],
        'classes': {class_id: level},
        'ac': ac,
        'max_hp': max_hp,
        'speed': sp['speed'],
        'climb_speed': 0,
        'fly': False,
        'hover': False,
        'abilities': final_scores,
        'saves': saves_map,
        'skills': skills_map,
        'proficiency_bonus': pb,
        'initiative': {'bonus': init_bonus, 'advantage': init_adv},
        'passive_perception': passive_perception,
        'darkvision': darkvision,
        'blindsight': 0,
        'truesight': 0,
        'damage': {'resistances': resistances, 'vulnerabilities': [], 'immunities': []},
        'condition_immunities': [],
        'tags': {'undead': False, 'elf': species_id == 'elf', 'object': False},
        'attacks': attacks,
        'multiattack': [],
        'melee_reach': max((a['range'] for a in attacks if not a['thrown']), default=5),
        'loadout': {
            'equipment': loadout_equipment,
            'spares': spares_map,
            'wearing_armor': wearing_armor,
        },
        'features': features,
        'traits': [],
        'spellcasting': spellcasting_doc,
    }

    if validate_rust:
        try:
            ember_rs.validate_custom_hero_doc(json.dumps(content_doc))
        except ValueError as exc:
            raise BuilderError([{'field': 'engine', 'message': str(exc)}]) from exc

    species_label = sp['name'] if not lineage_id else f"{sp['name']} ({sp['lineages'][lineage_id]['name']})"
    subclass_id = cls['subclass_id'] if level >= 3 else None
    subclass_label = cls['subclass_name'] if level >= 3 else None
    desc = f"A {species_label.lower()} {bg['name'].lower()} {cls['name'].lower()}"
    if subclass_label:
        desc += f" ({subclass_label})"
    desc += '.'

    owned_summary = [
        f'{_item_display_name(iid)} x{qty}' if qty > 1 else _item_display_name(iid)
        for iid, qty in sorted(owned.items())
    ]
    coins_label = format_coins(remaining_cp)

    custom_hero_input = {
        'unit_id': unit_id,
        'model_key': model_key,
        'description': desc,
        'class_id': class_id,
        'subclass_id': subclass_id,
        'species_label': species_label,
        'background_label': bg['name'],
        'expertise': list(expertise),
        'bonus_proficiencies': list(lore_skills),
        'owned_equipment': owned_summary,
        'coins_label': coins_label,
        'notes': notes,
        'inert_spell_reasons': inert_spell_reasons,
        'doc': content_doc,
    }

    # Level-up preview (if level < 3)
    next_level_preview = None
    if level < 3:
        nxt = level + 1
        next_hp = _compute_max_hp(class_id, nxt, mods['con'])
        gained: list[str] = [f'+{next_hp - max_hp} max HP ({max_hp} → {next_hp})']
        if class_id == 'fighter':
            gained.append('Action Surge (1 use), Tactical Mind (sheet-only)' if nxt == 2 else 'Champion: Improved Critical (19–20), Remarkable Athlete')
        elif class_id == 'barbarian':
            gained.append('Danger Sense, Reckless Attack' if nxt == 2 else 'Path of the Berserker: Frenzy, Rage (3 uses), Primal Knowledge (+1 Barbarian skill)')
        elif class_id == 'cleric':
            gained.append('Channel Divinity (2 uses: Divine Spark, Turn Undead), +1 L1 slot (3), +1 prepared spell (5)' if nxt == 2
                          else 'Life Domain: Disciple of Life, Preserve Life, 4 Domain Spells, +1 L1 slot (4), +2 L2 slots, +1 prepared spell (6)')
        elif class_id == 'wizard':
            gained.append('Scholar (Expertise), +2 spellbook spells (8), +1 L1 slot (3), +1 prepared spell (5)' if nxt == 2
                          else 'Evoker: Potent Cantrip, Evocation Savant (+2 Evocation spells), +2 spellbook spells (12 total), +1 L1 slot (4), +2 L2 slots, +1 prepared spell (6)')
        elif class_id == 'sorcerer':
            gained.append('Font of Magic (2 SP), Metamagic (2 options), +1 L1 slot (3), +2 prepared spells (4)' if nxt == 2
                          else 'Draconic Sorcery: Draconic Resilience (+3 HP, unarmored AC 10+DEX+CHA), 4 Draconic Spells, 3 SP, +1 L1 slot (4), +2 L2 slots, +2 prepared spells (6)')
        elif class_id == 'bard':
            gained.append('Expertise (2 skills), Jack of All Trades (+1 non-proficient checks), +1 L1 slot (3), +1 prepared spell (5)' if nxt == 2
                          else 'College of Lore: Cutting Words, Bonus Proficiencies (+3 skills), +1 L1 slot (4), +2 L2 slots, +1 prepared spell (6)')
        if has_mi_cleric or has_mi_wizard:
            gained.append('Magic Initiate Spell Change: may swap 1 feat spell for another of the same level.')
        if nxt == 3 and species_id == 'tiefling' and lineage_id == 'abyssal':
            gained.append('Abyssal Legacy: Ray of Sickness always prepared (1 free cast/Long Rest).')
        if nxt == 3 and species_id == 'elf' and lineage_id == 'high_elf':
            gained.append('High Elf Lineage: Detect Magic always prepared (sheet-only).')
        next_level_preview = {'next_level': nxt, 'next_max_hp': next_hp, 'hp_gain': next_hp - max_hp, 'gains': gained}

    summary = {
        'name': name,
        'level': level,
        'class_id': class_id,
        'class_name': cls['name'],
        'subclass_id': subclass_id,
        'subclass_name': subclass_label,
        'species_label': species_label,
        'background_label': bg['name'],
        'size': size,
        'model_key': model_key,
        'max_hp': max_hp,
        'ac': ac,
        'speed': sp['speed'],
        'proficiency_bonus': pb,
        'initiative': init_bonus,
        'initiative_adv': init_adv,
        'passive_perception': passive_perception,
        'abilities': final_scores,
        'modifiers': mods,
        'saves': saves_map,
        'skills': skills_map,
        'proficient_skills': list(skills),
        'expertise': list(expertise),
        'feats': list(feats),
        'owned_equipment': owned_summary,
        'owned_counts': dict(owned),
        'starting_cp': starting_cp,
        'spent_cp': spent_cp,
        'remaining_cp': remaining_cp,
        'coins_label': coins_label,
        'equipped_armor': eq_armor,
        'equipped_shield': eq_shield,
        'equipped_weapons': list(valid_eq_weapons),
        'spares': dict(spares_map),
        'attacks': [
            {
                'name': _item_display_name(a['name']) if a['name'] != 'unarmed_attack' else 'Unarmed Strike',
                'thrown': a['thrown'],
                'to_hit': a['to_hit'],
                'damage': a['damage'],
                'damage_type': a['damage_type'],
                'range': f"{a['range']}/{a['range_max']} ft" if a['thrown'] else f"{a['range']} ft",
                'masteries': a['masteries'],
                'riders': a['riders'],
            }
            for a in attacks
        ],
        'spellcasting': {
            'ability': spellcasting_doc['ability'],
            'attack': spellcasting_doc['attack'],
            'dc': spellcasting_doc['dc'],
            'slots': spellcasting_doc['slots'],
            'active_spells': [SPELLS[s]['name'] for s in spellcasting_doc['spells'] + spellcasting_doc['reaction_spells']],
            'inert_spells': [{'id': s, 'name': SPELLS[s]['name'], 'reason': inert_spell_reasons.get(s, 'No effect in combat.')} for s in spellcasting_doc['inert_spells']],
            'all_sheet_spells': all_sheet_spells,
            'free_casts': [SPELLS[f['spell']]['name'] for f in spellcasting_doc['free_casts']],
        } if spellcasting_doc else None,
        'warnings': warnings,
        'notes': notes,
        'next_level_preview': next_level_preview,
    }

    return {
        'content_doc': content_doc,
        'custom_hero_input': custom_hero_input,
        'summary': summary,
        'warnings': warnings,
    }
