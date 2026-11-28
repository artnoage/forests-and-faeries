#![recursion_limit = "256"]
use std::collections::BTreeMap;

use serde_json::json;

use ember_rs::content::{intern_count, ContentPool};
use ember_rs::present::{CustomHeroInput, LevelInput, WebArena};
use ember_rs::tape::Placement;

fn sample_custom_bard(unit_id: &str, name: &str) -> CustomHeroInput {
    let doc = json!({
        "schema": 1,
        "id": unit_id,
        "base_id": "vesper",
        "source": "srd-5.2.1",
        "licence": "CC-BY-4.0",
        "attribution": "SRD 5.2.1 (CC BY 4.0).",
        "provenance": {"natural20_commit": "custom-builder-step1", "exporter": "test", "files": {}},
        "name": name,
        "side": "heroes",
        "pc": true,
        "size": "medium",
        "races": ["humanoid"],
        "classes": {"bard": 3},
        "ac": 13,
        "max_hp": 21,
        "speed": 30,
        "climb_speed": 0,
        "fly": false,
        "hover": false,
        "abilities": {"str": 8, "dex": 14, "con": 12, "int": 12, "wis": 10, "cha": 15},
        "saves": {"str": -1, "dex": 4, "con": 1, "int": 1, "wis": 0, "cha": 4},
        "skills": {
            "acrobatics": 3, "animal_handling": 1, "arcana": 5, "athletics": 0,
            "deception": 3, "history": 3, "insight": 2, "intimidation": 3,
            "investigation": 2, "medicine": 1, "nature": 2, "perception": 2,
            "performance": 4, "persuasion": 6, "religion": 2, "sleight_of_hand": 3,
            "stealth": 3, "survival": 1
        },
        "proficiency_bonus": 2,
        "initiative": {"bonus": 2, "advantage": false},
        "passive_perception": 12,
        "darkvision": 0,
        "blindsight": 0,
        "truesight": 0,
        "damage": {"resistances": [], "vulnerabilities": [], "immunities": []},
        "condition_immunities": [],
        "tags": {"undead": false, "elf": false, "object": false},
        "attacks": [
            {
                "name": "dagger",
                "type": "melee_attack",
                "range": 5,
                "range_max": 5,
                "to_hit": 4,
                "damage": "1d4+2",
                "damage_type": "piercing",
                "ability": "finesse",
                "proficient": true,
                "additional": [],
                "on_hit": [],
                "save_attack": null,
                "multiattack_group": null,
                "masteries": [],
                "riders": [],
                "thrown": false,
                "item": "dagger"
            },
            {
                "name": "dagger",
                "type": "melee_attack",
                "range": 20,
                "range_max": 60,
                "to_hit": 4,
                "damage": "1d4+2",
                "damage_type": "piercing",
                "ability": "finesse",
                "proficient": true,
                "additional": [],
                "on_hit": [],
                "save_attack": null,
                "multiattack_group": null,
                "masteries": [],
                "riders": [],
                "thrown": true,
                "item": "dagger"
            },
            {
                "name": "unarmed_attack",
                "type": "melee_attack",
                "range": 5,
                "range_max": 5,
                "to_hit": 1,
                "damage": "1-1",
                "damage_type": "bludgeoning",
                "ability": "str",
                "proficient": true,
                "additional": [],
                "on_hit": [],
                "save_attack": null,
                "multiattack_group": null,
                "masteries": [],
                "riders": [],
                "thrown": false,
                "item": null
            }
        ],
        "multiattack": [],
        "melee_reach": 5,
        "loadout": {
            "equipment": [
                {"id": "dagger", "type": "melee_attack", "hand_slots": 0.5},
                {"id": "leather_armor", "type": "armor", "hand_slots": 0.0}
            ],
            "spares": {"dagger": 1},
            "wearing_armor": true
        },
        "features": [
            {"id": "bardic_inspiration", "uses": 2, "die": "1d6"},
            {"id": "cutting_words"},
            {"id": "expertise"},
            {"id": "jack_of_all_trades"},
            {"id": "bonus_proficiencies"},
            {"id": "bard_subclass"},
            {"id": "spellcasting"},
            {"id": "resourceful"},
            {"id": "skillful"},
            {"id": "versatile"},
            {"id": "magic_initiate_cleric"}
        ],
        "traits": [],
        "spellcasting": {
            "class": "bard",
            "level": 3,
            "ability": "cha",
            "attack": 4,
            "dc": 12,
            "slots": [0, 4, 2],
            "spells": ["vicious_mockery", "starry_wisp", "faerie_fire", "healing_word", "thunderwave", "command", "shatter", "aid", "bless"],
            "reaction_spells": [],
            "inert_spells": ["guidance", "thaumaturgy"],
            "spell_info": [
                {"id": "vicious_mockery", "name": "Vicious Mockery", "level": 0, "casting_time": "1:action", "concentration": false},
                {"id": "starry_wisp", "name": "Starry Wisp", "level": 0, "casting_time": "1:action", "concentration": false},
                {"id": "faerie_fire", "name": "Faerie Fire", "level": 1, "casting_time": "1:action", "concentration": true},
                {"id": "healing_word", "name": "Healing Word", "level": 1, "casting_time": "1:bonus_action", "concentration": false},
                {"id": "thunderwave", "name": "Thunderwave", "level": 1, "casting_time": "1:action", "concentration": false},
                {"id": "command", "name": "Command", "level": 1, "casting_time": "1:action", "concentration": false},
                {"id": "shatter", "name": "Shatter", "level": 2, "casting_time": "1:action", "concentration": false},
                {"id": "aid", "name": "Aid", "level": 2, "casting_time": "1:action", "concentration": false},
                {"id": "bless", "name": "Bless", "level": 1, "casting_time": "1:action", "concentration": true}
            ],
            "free_casts": [{"spell": "bless", "pool": "magic_initiate_cleric", "uses": 1}],
            "resources": {}
        }
    });
    let mut inert_reasons = BTreeMap::new();
    inert_reasons.insert("guidance".to_string(), "No effect in combat.".to_string());
    inert_reasons.insert("thaumaturgy".to_string(), "No effect in combat.".to_string());
    CustomHeroInput {
        unit_id: unit_id.to_string(),
        model_key: "vesper".to_string(),
        description: "A human College of Lore bard.".to_string(),
        class_id: "bard".to_string(),
        subclass_id: Some("college_of_lore".to_string()),
        species_label: "Human".to_string(),
        background_label: "Acolyte".to_string(),
        expertise: vec!["arcana".to_string(), "persuasion".to_string()],
        bonus_proficiencies: vec!["history".to_string(), "nature".to_string(), "performance".to_string()],
        owned_equipment: vec!["Leather Armor".to_string(), "Dagger x2".to_string(), "Lute".to_string()],
        coins_label: "27 GP".to_string(),
        notes: vec!["Resourceful is sheet-only in Practice.".to_string()],
        inert_spell_reasons: inert_reasons,
        doc,
    }
}

fn level_with_custom(ch: CustomHeroInput) -> LevelInput {
    let uid = ch.unit_id.clone();
    LevelInput {
        encounter_id: "practice_test".to_string(),
        preset_id: "practice".to_string(),
        theme: "crypt".to_string(),
        map_name: "Test Room".to_string(),
        rows: vec![
            "HHHHHHHH".to_string(),
            "H......H".to_string(),
            "H......H".to_string(),
            "H......H".to_string(),
            "H......H".to_string(),
            "HHHHHHHH".to_string(),
        ],
        scene: json!({}),
        level_view: json!({"id": "practice_test", "preset": "practice"}),
        heroes: vec![uid.clone()],
        monsters: vec![("goblin_minion-1".to_string(), "goblin_minion".to_string(), "Goblin 1".to_string())],
        suggested_placements: vec![
            Placement { id: uid, x: 2, y: 2 },
            Placement { id: "goblin_minion-1".to_string(), x: 5, y: 2 },
        ],
        custom_heroes: vec![ch],
    }
}

#[test]
fn custom_bard_dynamic_inspect_and_200_session_no_leak() {
    // Warm the global pool first so baseline intern_count and global template count are fixed.
    let global_templates_before = ContentPool::global().templates.len();
    let intern_before = intern_count();

    // 1. Verify dynamic custom Bard inspect sheet (CHA 15 -> 2 uses, Arcana & Persuasion expertise — NOT Vesper's 3 uses / Perception & Stealth!).
    let ch = sample_custom_bard("custom_bard_1", "Lyra Songweaver");
    let mut arena = WebArena::new(level_with_custom(ch), 42, 0, "csrf".into(), "enc".into()).unwrap();
    let st_setup = arena.state();
    let hero_setup = st_setup["units"].as_array().unwrap().iter().find(|u| u["id"] == "custom_bard_1").unwrap();
    assert_eq!(hero_setup["name"], "Lyra Songweaver");
    assert_eq!(hero_setup["class"], "bard");
    assert_eq!(hero_setup["subclass"], "college_of_lore");
    assert_eq!(hero_setup["custom"], true);
    let sheet_str = hero_setup["sheet"].to_string();
    assert!(sheet_str.contains("2 uses"), "expected 2 Bardic Inspiration uses, got: {sheet_str}");
    assert!(!sheet_str.contains("3 uses"), "must not hardcode Vesper's 3 uses: {sheet_str}");
    assert!(sheet_str.contains("Arcana and Persuasion"), "expected custom expertise, got: {sheet_str}");
    assert!(!sheet_str.contains("Perception and Stealth"), "must not hardcode Vesper's expertise: {sheet_str}");
    assert!(sheet_str.contains("History, Nature, Performance"), "expected custom Lore skills: {sheet_str}");
    assert!(sheet_str.contains("No effect in combat."), "expected inert cantrip label: {sheet_str}");

    // Start combat and confirm fight_unit_view also serves the dynamic sheet cleanly.
    let st_fight = arena.start().unwrap();
    let hero_fight = st_fight["units"].as_array().unwrap().iter().find(|u| u["id"] == "custom_bard_1").unwrap();
    let fight_sheet_str = hero_fight["sheet"].to_string();
    assert!(fight_sheet_str.contains("2 uses"));
    assert!(fight_sheet_str.contains("Arcana and Persuasion"));
    drop(arena);

    // 2. Create & drop 200 distinct custom hero sessions with unique ids & names:
    // global pool and intern table must not grow by a single entry.
    for i in 0..200 {
        let uid = format!("custom_leak_test_{i}");
        let name = format!("Wanderer Number {i} of the Glade");
        let mut a = WebArena::new(level_with_custom(sample_custom_bard(&uid, &name)), i as u64 + 1, 0, "c".into(), "e".into()).unwrap();
        let _ = a.start().unwrap();
    }

    assert_eq!(ContentPool::global().templates.len(), global_templates_before, "global ContentPool mutated!");
    assert_eq!(intern_count(), intern_before, "intern table grew from custom hero sessions (memory leak)!");
}
