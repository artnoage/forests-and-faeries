//! Static display metadata for `present::WebArena`: spell names, creature
//! descriptions, miniature fallback recipes, and SRD 5.2.1 inspect sheets
//! (`webgame/undead_text.py` + `webgame/ff/arena.py`).

use serde_json::{json, Value};

pub fn spell_display_name(key: &str) -> String {
    match key {
        "firebolt" => "Fire Bolt".to_string(),
        "dragons_breath" => "Dragon's Breath".to_string(),
        "protection_from_evil_and_good" => "Protection from Evil and Good".to_string(),
        "ray_of_frost" => "Ray of Frost".to_string(),
        "shield_of_faith" => "Shield of Faith".to_string(),
        "spare_the_dying" => "Spare the Dying".to_string(),
        _ => title_words(key),
    }
}

pub fn title_words(raw: &str) -> String {
    raw.split('_')
        .map(|w| {
            let mut chars = w.chars();
            match chars.next() {
                None => String::new(),
                Some(first) => first.to_uppercase().collect::<String>() + &chars.as_str().to_lowercase(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

pub fn default_hero_name(content: &str) -> &'static str {
    match content {
        "mara" => "Mara",
        "ilyra" => "Ilyra",
        "guy" => "Guy",
        "elion" => "Elion",
        "curogana" => "Curogana",
        "chruna" => "Chruna",
        _ => "Hero",
    }
}

pub fn hero_class_meta(content: &str) -> Option<(i32, &'static str, Option<&'static str>)> {
    match content {
        "mara" => Some((2, "fighter", None)),
        "ilyra" => Some((2, "wizard", None)),
        "guy" => Some((3, "fighter", Some("champion"))),
        "elion" => Some((3, "cleric", Some("life"))),
        "curogana" => Some((3, "sorcerer", Some("draconic"))),
        "chruna" => Some((3, "barbarian", Some("path_of_the_berserker"))),
        _ => None,
    }
}

pub fn creature_description(content: &str) -> &'static str {
    match content {
        "mara" => "A human soldier with longsword and shield.",
        "ilyra" => "A human sage who studies the arcane.",
        "guy" => "A human champion with a greatsword.",
        "elion" => "A human priest of life in heavy plate.",
        "curogana" => "A high elf sorcerer with draconic scales.",
        "chruna" => "A human berserker in scale mail with a halberd, and a spare on her back.",
        "ghast" => "A ghoul-like undead wreathed in a sickening stench.",
        "ghoul" => "A gaunt, ravenous undead with a paralyzing claw.",
        "goblin_boss" => "A goblin chief who fights with scimitar and shortbow and hides behind its underlings.",
        "goblin_minion" => "A small, sly goblin armed with a handful of daggers.",
        "goblin_warrior" => "A small goblin fighter with scimitar, shield and shortbow.",
        "mummy" => "A desiccated undead in grave wrappings whose touch curses and whose glare terrifies.",
        "shadow" => "A living darkness that drains the strength of the living.",
        "skeleton" => "Animated bones that fight with a shortsword and a shortbow.",
        "specter" => "The angry spirit of a creature denied its rest.",
        "wight" => "An armored undead warrior that drains life with blade, bow and touch.",
        "zombie" => "A rotting corpse animated by necromancy that lurches toward the living.",
        _ => "",
    }
}

pub fn creature_type_label(content: &str) -> &'static str {
    match content {
        "skeleton" | "zombie" | "ghoul" | "ghast" | "specter" | "shadow" | "wight" | "mummy" => "Undead",
        "goblin_minion" | "goblin_warrior" | "goblin_boss" => "Fey (goblinoid)",
        _ => "Monster",
    }
}

pub fn model_recipe(content: &str) -> Value {
    match content {
        "guy" => json!({"base": "fighter", "tint": "#e8e2d0", "scale": 1.04}),
        "elion" => json!({"base": "fighter", "tint": "#f4f0d8", "scale": 1.0, "accent": "#e8c96a"}),
        "curogana" => json!({"base": "mage", "tint": "#d8a0a0", "scale": 1.0, "accent": "#e0603a"}),
        "chruna" => json!({"base": "fighter", "tint": "#ffffff", "scale": 1.0}),
        "skeleton" => json!({"base": "skeleton", "tint": "#ffffff", "scale": 1.0}),
        "zombie" => json!({"base": "goblin", "tint": "#8fa07a", "scale": 1.2}),
        "ghoul" => json!({"base": "goblin", "tint": "#a7a28a", "scale": 1.12}),
        "ghast" => json!({"base": "goblin", "tint": "#8a7f9a", "scale": 1.25}),
        "specter" => json!({"base": "mage", "tint": "#a8c8ff", "scale": 1.0, "ghost": 0.55}),
        "shadow" => json!({"base": "skeleton", "tint": "#33283f", "scale": 1.0, "ghost": 0.5}),
        "wight" => json!({"base": "fighter", "tint": "#5c6a66", "scale": 1.12, "accent": "#6ff0b0"}),
        "mummy" => json!({"base": "fighter", "tint": "#a89270", "scale": 1.1}),
        "mara" => json!({"base": "fighter", "tint": "#ffffff", "scale": 1.0}),
        "ilyra" => json!({"base": "mage", "tint": "#ffffff", "scale": 1.0}),
        "goblin_minion" => json!({"base": "goblin", "tint": "#e6edcf", "scale": 0.9}),
        "goblin_warrior" => json!({"base": "goblin", "tint": "#ffffff", "scale": 1.0}),
        "goblin_boss" => json!({"base": "goblin", "tint": "#e0b8a8", "scale": 1.1}),
        _ => json!({}),
    }
}

fn pairs(items: &[(&str, &str)]) -> Vec<Value> {
    items.iter().map(|(n, t)| json!({"name": n, "text": t})).collect()
}

pub fn unit_sheet(content: &str, pc: bool, hp: i32, ac: i32) -> Option<Value> {
    if pc && content.contains("_l") {
        let pool = crate::content::ContentPool::global();
        let doc = &pool.docs[pool.tid(content)? as usize];
        let mut features: Vec<_> = doc.attacks.iter().filter(|a| !a.thrown).map(|a| json!({
            "name": title_words(&a.name), "text": format!("{:+} to hit, {} {}.", a.to_hit.unwrap_or_default(), a.damage, a.damage_type.as_deref().unwrap_or(""))
        })).collect();
        features.extend(doc.features.iter().map(|f| {
            let detail = match f.id.as_str() {
                "remarkable_athlete" => "Advantage on initiative and Athletics. A critical hit permits half-speed movement without opportunity attacks.",
                "potent_cantrip" => "Missed cantrip attacks and successful saves still deal half damage with no additional effects.",
                "evocation_savant" => "Adds two evocations to the spellbook.",
                _ => "",
            };
            json!({"name": title_words(&f.id), "text": detail})
        }));
        let spells: Vec<_> = doc.spellcasting.iter().flat_map(|s| s.spells.iter().chain(s.reaction_spells.iter()))
            .map(|name| json!({"name": spell_display_name(name), "text": ""})).collect();
        return Some(json!({"stats": format!("HP {hp} · AC {ac} · Speed {} ft", doc.speed), "features": features, "spells": spells}));
    }
    if pc {
        let (stats, features, spells): (&str, &[(&str, &str)], &[(&str, &str)]) = match content {
            "mara" => (
                "Human · STR 17 DEX 14 CON 14 · Speed 30 ft",
                &[
                    ("Longsword", "+5, 1d8+3 slashing. Mastery: Sap gives the target Disadvantage on its next attack roll."),
                    ("Defense", "+1 AC while wearing armor (AC 19 with chain mail and shield)."),
                    ("Savage Attacker", "Once per turn, roll a weapon hit's damage dice twice and keep the higher total."),
                    ("Second Wind", "Bonus action: regain 1d10+2 HP. Two uses."),
                    ("Action Surge", "Take one extra action this turn. One use."),
                    ("Alert", "Add your proficiency bonus to initiative."),
                ],
                &[],
            ),
            "ilyra" => (
                "Human · INT 17 DEX 14 CON 14 · Spell save DC 13, attack +5 · Speed 30 ft",
                &[
                    ("Dagger", "+4, 1d4+2 piercing; thrown 20/60 ft. She carries two."),
                    ("Quarterstaff", "+1, 1d6-1 bludgeoning."),
                    ("Alert", "Add your proficiency bonus to initiative."),
                ],
                &[
                    ("Fire Bolt", "Cantrip. Ranged attack, 1d10 fire."),
                    ("Ray of Frost", "Cantrip. Ranged attack, 1d8 cold; the target loses 10 ft of speed."),
                    ("Acid Splash", "Cantrip. 5-ft sphere within 60 ft; DEX save or 1d6 acid."),
                    ("Mage Armor", "Level 1. AC becomes 13 + DEX while unarmoured."),
                    ("Magic Missile", "Level 1. Three darts of 1d4+1 force that never miss; split them as you like. One free cast."),
                    ("Chromatic Orb", "Level 1. Ranged attack, 3d8 damage of a type you pick."),
                    ("Burning Hands", "Level 1. 15-ft cone, DEX save, 3d6 fire (half on a success)."),
                    ("Thunderwave", "Level 1. 15-ft cube from you, CON save, 2d8 thunder and a 10-ft push."),
                    ("Shield", "Level 1 reaction (automatic): +5 AC against the triggering hit."),
                ],
            ),
            "guy" => (
                "Human · STR 17 DEX 14 CON 12 · Speed 30 ft",
                &[
                    ("Greatsword", "+5, 2d6+3 slashing. Heavy and two-handed. Mastery: Graze deals 3 damage on a miss."),
                    ("Great Weapon Fighting", "Damage dice that roll a 1 or 2 count as 3."),
                    ("Savage Attacker", "Once per turn, roll a weapon hit's damage dice twice and keep the higher total."),
                    ("Second Wind", "Bonus action: regain 1d10+3 HP. Two uses."),
                    ("Action Surge", "Take one extra action this turn. One use."),
                    ("Improved Critical", "Champion: critical hits on a natural 19 or 20."),
                    ("Remarkable Athlete", "Advantage on initiative and Athletics. Immediately after a critical hit, move up to half your speed without provoking opportunity attacks."),
                    ("Alert", "Add your proficiency bonus to initiative."),
                ],
                &[],
            ),
            "elion" => (
                "Human · WIS 17 CON 16 · Spell save DC 13, attack +5 · Speed 30 ft",
                &[
                    ("Warhammer", "+4, 1d8+2 bludgeoning."),
                    ("Divine Spark", "Channel Divinity: a creature within 30 ft regains 1d8+3 HP, or makes a CON save against 1d8+3 radiant or necrotic damage (half on a success)."),
                    ("Turn Undead", "Channel Divinity: each undead within 30 ft makes a WIS save or is Frightened and Incapacitated, and flees. Damage ends it."),
                    ("Preserve Life", "Channel Divinity: divide 15 HP among Bloodied allies within 30 ft, up to half their maximum."),
                    ("Disciple of Life", "Healing spells cast with a slot heal an extra 2 + the slot level."),
                    ("Channel Divinity", "Two uses."),
                ],
                &[
                    ("Sacred Flame", "Cantrip. DEX save or 1d8 radiant. Ignores cover."),
                    ("Guiding Bolt", "Level 1. Ranged attack, 4d6 radiant; the next attack against the target has Advantage."),
                    ("Bless", "Level 1. Up to three creatures add 1d4 to attacks and saves. Concentration."),
                    ("Cure Wounds", "Level 1. Touch: heal 2d8 + WIS."),
                    ("Healing Word", "Level 1, bonus action. Heal 2d4 + WIS at range. One free cast."),
                    ("Shield of Faith", "Level 1, bonus action. +2 AC. Concentration."),
                    ("Command", "Level 1. WIS save or the target falls Prone (Grovel)."),
                    ("Protection from Evil and Good", "Level 1. Undead attack the target with Disadvantage. Uses the Holy Water flask."),
                    ("Sanctuary", "Level 1, bonus action. Attackers must save before targeting the warded creature."),
                    ("Aid", "Level 2. Up to three allies raise their maximum and current HP by 5."),
                    ("Lesser Restoration", "Level 2, bonus action. End a condition."),
                    ("Spiritual Weapon", "Level 2, bonus action. A force weapon strikes (1d8 + WIS force); strike again each turn as a bonus action."),
                    ("Spare the Dying", "Cantrip. Stabilise a dying creature."),
                ],
            ),
            "curogana" => (
                "High elf · CHA 18 CON 20 · Spell save DC 14, attack +6 · Speed 30 ft",
                &[
                    ("Innate Sorcery", "Bonus action, two uses: spell save DC +1 and Advantage on sorcerer spell attacks for a minute."),
                    ("Font of Magic", "Three sorcery points, spent on Metamagic."),
                    ("Empowered Spell", "Metamagic (1 point): reroll some low damage dice."),
                    ("Heightened Spell", "Metamagic (2 points): one target has Disadvantage on its save."),
                    ("Draconic Resilience", "+3 HP, and AC 10 + DEX + CHA while unarmoured."),
                ],
                &[
                    ("Sorcerous Burst", "Cantrip. Ranged attack, 1d8 damage; an 8 explodes into another d8."),
                    ("Fire Bolt", "Cantrip. Ranged attack, 1d10 fire."),
                    ("Ray of Frost", "Cantrip. Ranged attack, 1d8 cold, slows the target."),
                    ("Acid Splash", "Cantrip. 5-ft sphere within 60 ft; DEX save or 1d6 acid."),
                    ("Chromatic Orb", "Level 1. Ranged attack, 3d8 damage of a type you pick."),
                    ("Magic Missile", "Level 1. Three darts of 1d4+1 force that never miss; split them as you like. One free cast."),
                    ("Burning Hands", "Level 1. 15-ft cone, DEX save, 3d6 fire (half on a success)."),
                    ("Thunderwave", "Level 1. 15-ft cube from you, CON save, 2d8 thunder and a 10-ft push."),
                    ("Shatter", "Level 2. 10-ft sphere within 60 ft, CON save, 3d8 thunder (half on a success)."),
                    ("Scorching Ray", "Level 2. Three fire rays, 2d6 each; split them as you like."),
                    ("Dragon's Breath", "Level 2, bonus action, concentration. A willing creature may exhale a 15-ft cone of damage as an action."),
                    ("Blur", "Level 2, concentration. Attackers have Disadvantage against you."),
                    ("Command", "Level 1. WIS save or the target falls Prone."),
                    ("Shield", "Level 1 reaction (automatic): +5 AC against the triggering hit."),
                ],
            ),
            "chruna" => (
                "Human · STR 17 DEX 14 CON 14 · Speed 30 ft",
                &[
                    ("Halberd", "+5, 1d10+3 slashing. Heavy, reach 10 ft, two-handed. Mastery: Cleave."),
                    ("Cleave", "After a melee hit on her turn: one free attack on a second creature within 5 ft of the first and within reach, without her ability modifier on the damage. Once per turn."),
                    ("Rage", "Bonus action, three uses: Resistance to bludgeoning, piercing and slashing damage, +2 damage with Strength attacks, Advantage on Strength checks and saves, no spells. It lasts until the end of her next turn; attacking an enemy, or a bonus action, keeps it going. It ends if she is Incapacitated."),
                    ("Reckless Attack", "Before her first attack roll on her turn: Advantage on Strength attack rolls until her next turn, but attack rolls against her have Advantage too."),
                    ("Frenzy", "Path of the Berserker: while raging and reckless, the first creature she hits with a Strength attack on her turn takes an extra 2d6."),
                    ("Danger Sense", "Advantage on Dexterity saves unless Incapacitated."),
                    ("Savage Attacker", "Once per turn, roll a weapon hit's damage dice twice and keep the higher total."),
                    ("Alert", "Add your proficiency bonus to initiative."),
                ],
                &[],
            ),
            _ => return None,
        };
        return Some(json!({
            "stats": stats,
            "features": pairs(features),
            "spells": pairs(spells),
        }));
    }

    let features: &[(&str, &str)] = match content {
        "mummy" => &[
            ("Rotting Fist (x2)", "+5, 1d10+3 bludgeoning plus 3d6 necrotic. The target is cursed: it cannot regain HP. A creature this attack drops to 0 HP dies."),
            ("Dreadful Glare", "One creature within 60 ft makes a WIS save (DC 11) or is Frightened until the end of the mummy's next turn. On a success it is immune to this mummy's Glare."),
            ("Defenses", "Vulnerable to fire. Immune to necrotic and poison. Speed 20 ft."),
        ],
        "goblin_minion" => &[
            ("Dagger", "+4, 1d4+2 piercing; thrown 20/60 ft."),
            ("Nimble Escape", "Bonus action: Disengage or Hide."),
        ],
        "goblin_warrior" => &[
            ("Scimitar", "+4, 1d6+2 slashing, plus 1d4 with Advantage."),
            ("Shortbow", "+4, 1d6+2 piercing (80/320 ft), plus 1d4 with Advantage."),
            ("Nimble Escape", "Bonus action: Disengage or Hide."),
        ],
        "goblin_boss" => &[
            ("Multiattack", "Two attacks with its scimitar or shortbow: +4, 1d6+2, plus 1d4 with Advantage."),
            ("Redirect Attack", "Reaction: when an attack would hit it, it swaps places with a goblin ally within 5 ft, which becomes the target."),
            ("Nimble Escape", "Bonus action: Disengage or Hide."),
        ],
        "skeleton" => &[
            ("Shortsword / Shortbow", "+5, 1d6+3 piercing; bow 80/320 ft."),
            ("Vulnerable: bludgeoning", "Takes double damage from bludgeoning."),
        ],
        "zombie" => &[
            ("Slam", "+3, 1d8+1 bludgeoning."),
            ("Undead Fortitude", "At 0 HP, a CON save (DC 5 + damage) leaves it on 1 HP. Radiant damage and critical hits bypass it."),
        ],
        "ghoul" => &[
            ("Bite (x2)", "+4, 1d6+2 piercing plus 1d6 necrotic."),
            ("Claw", "+4, 1d4+2 slashing. A non-undead, non-elf target makes a CON save or is Paralyzed until the end of its next turn."),
        ],
        "ghast" => &[
            ("Bite", "+5, 1d8+3 piercing plus 2d8 necrotic."),
            ("Claw", "+5, 2d6+3 slashing. A non-undead target makes a CON save or is Paralyzed until the end of its next turn."),
            ("Stench", "A creature starting its turn within 5 ft makes a CON save or is Poisoned until its next turn."),
        ],
        "specter" => &[
            ("Life Drain", "+4, 2d6 necrotic; the target's HP maximum drops by the damage taken."),
            ("Resistances", "Resists most physical and elemental damage. Immune to necrotic."),
        ],
        "shadow" => &[
            ("Draining Swipe", "+4, 1d6+2 necrotic; the target loses 1d4 Strength."),
            ("Vulnerable: radiant", "Takes double radiant damage. Resists acid, cold, fire, lightning and thunder."),
        ],
        "wight" => &[
            ("Necrotic Sword / Bow", "+4, 1d8+2 plus 1d8 necrotic. Two attacks per action."),
            ("Life Drain", "CON save or 1d8+2 necrotic and the HP maximum drops by that much."),
            ("Resists necrotic", "Takes half necrotic damage."),
        ],
        _ => return None,
    };
    Some(json!({
        "stats": format!("{} · {} HP · AC {}", creature_type_label(content), hp, ac),
        "features": pairs(features),
        "spells": [],
    }))
}
