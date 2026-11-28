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
        "ray_of_sickness" => "Ray of Sickness".to_string(),
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
        "vesper" => "Vesper",
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
        "vesper" => Some((3, "bard", Some("college_of_lore"))),
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
        "vesper" => "A tiefling College of Lore bard armed with daggers and a darkwood lute.",
        "animated_armor" => "An empty suit of plate armor that strikes with its gauntlets.",
        "kobold_warrior" => "A small dragon that fights alongside its allies with daggers.",
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
        "ogre" => "A towering, hulking giant wielding an iron-banded greatclub and heavy javelins.",
        "owlbear" => "A ferocious, feathered woodland predator with an owl's beak and a bear's claws.",
        _ => "",
    }
}

pub fn creature_type_label(content: &str) -> &'static str {
    match content {
        "skeleton" | "zombie" | "ghoul" | "ghast" | "specter" | "shadow" | "wight" | "mummy" => "Undead",
        "goblin_minion" | "goblin_warrior" | "goblin_boss" => "Fey (goblinoid)",
        "animated_armor" => "Construct",
        "kobold_warrior" => "Dragon",
        "ogre" => "Giant",
        "owlbear" => "Monstrosity",
        _ => "Monster",
    }
}

pub fn model_recipe(content: &str) -> Value {
    match content {
        "guy" => json!({"base": "fighter", "tint": "#e8e2d0", "scale": 1.04}),
        "elion" => json!({"base": "fighter", "tint": "#f4f0d8", "scale": 1.0, "accent": "#e8c96a"}),
        "curogana" => json!({"base": "mage", "tint": "#d8a0a0", "scale": 1.0, "accent": "#e0603a"}),
        "chruna" => json!({"base": "fighter", "tint": "#ffffff", "scale": 1.0}),
        "vesper" => json!({"base": "vesper", "tint": "#ffffff", "scale": 1.0}),
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
        "ogre" => json!({"base": "goblin", "tint": "#8d8a78", "scale": 1.9}),
        "owlbear" => json!({"base": "goblin", "tint": "#7d6044", "scale": 1.85}),
        _ => json!({}),
    }
}

fn pairs(items: &[(&str, &str)]) -> Vec<Value> {
    items.iter().map(|(n, t)| json!({"name": n, "text": t})).collect()
}

pub fn unit_sheet(content: &str, pc: bool, hp: i32, ac: i32) -> Option<Value> {
    unit_sheet_for_replay(content, pc, hp, ac, crate::present::CURRENT_WEB_REPLAY_VERSION)
}

pub(crate) fn unit_sheet_for_replay(content: &str, pc: bool, hp: i32, ac: i32, replay_version: u8) -> Option<Value> {
    let legacy_replay = replay_version == 1;
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
                _ if replay_version < 14 => "",
                "savage_attacker" => "Once per turn on a weapon hit, roll the weapon’s damage dice twice and use either roll.",
                "alert" => "Add your Proficiency Bonus to Initiative.",
                "defense" => "Gain +1 AC while wearing armor.",
                "resourceful" => "Gain Heroic Inspiration when you finish a Long Rest.",
                "skillful" => "Gain proficiency in one skill of your choice.",
                "versatile" => "Gain an Origin feat of your choice.",
                "second_wind" => "As a Bonus Action, regain 1d10 HP plus your Fighter level.",
                "weapon_mastery" => "Use the mastery properties of your chosen weapons.",
                "action_surge" => "Once per Short or Long Rest, take one extra action on your turn, except the Magic action.",
                "martial_archetype" => "Your Fighter subclass is Champion.",
                "improved_critical" => "Your weapon attacks and Unarmed Strikes score a Critical Hit on a natural 19 or 20.",
                _ if replay_version < 20 => "",
                "bardic_inspiration" => "Bonus Action (3 uses, Long Rest): grant an ally within 60 ft a d6 die for 1 hour. Auto-triggers when the ally misses an attack or fails a saving throw by 1–6.",
                "cutting_words" => "College of Lore Reaction (spends 1 Bardic Inspiration die): subtract 1d6 from an enemy within 60 ft. Auto-triggers when a non-critical enemy hit beats AC by 0–5 (so 1–6 can turn it into a miss) or deals 8+ / lethal damage to an ally.",
                "expertise" => "Double your Proficiency Bonus for Perception and Stealth.",
                "jack_of_all_trades" => "Add half your Proficiency Bonus (+1) to ability checks you aren't proficient in (does not apply to Initiative).",
                "college_of_lore" => "Your Bard subclass is College of Lore.",
                "bonus_proficiencies" => "Gain proficiency in Arcana, Investigation, and Medicine.",
                "abyssal_legacy" => "Tiefling Fiendish Legacy (Abyssal): Poison Resistance, Poison Spray cantrip, and at level 3 Ray of Sickness always prepared with one free cast per Long Rest.",
                "otherworldly_presence" => "You know the Thaumaturgy cantrip.",
                "darkvision" => "See in Dim Light within 60 ft as Bright Light, and in Darkness as Dim Light.",
                "magic_initiate_cleric" => "You know Guidance and Spare the Dying, and have Bless prepared with one free cast per Long Rest.",
                _ => "",
            };
            json!({"name": title_words(&f.id), "text": detail})
        }));
        let spells: Vec<_> = doc.spellcasting.iter().flat_map(|s| s.spells.iter().chain(s.reaction_spells.iter()))
            .map(|name| json!({"name": spell_display_name(name), "text": ""})).collect();
        return Some(json!({"stats": format!("HP {hp} · AC {ac} · Speed {} ft", doc.speed), "features": features, "spells": spells}));
    }
    if pc {
        let remarkable_athlete = if legacy_replay {
            "Champion: Advantage on initiative."
        } else {
            "Advantage on initiative and Athletics. Immediately after a critical hit, move up to half your speed without provoking opportunity attacks."
        };
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
                    ("Remarkable Athlete", remarkable_athlete),
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
                    ("Spiritual Weapon", if replay_version >= 7 {
                        "Level 2, bonus action, concentration. A force weapon strikes for 1d8 + WIS force damage. Strike again each turn as a bonus action."
                    } else {
                        "Level 2, bonus action. A force weapon strikes (1d8 + WIS force); strike again each turn as a bonus action."
                    }),
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
                if replay_version >= 20 {
                    &[
                        ("Sorcerous Burst", "Cantrip. Ranged attack, 1d8 damage; an 8 explodes into another d8."),
                        ("Fire Bolt", "Cantrip. Ranged attack, 1d10 fire."),
                        ("Ray of Frost", "Cantrip. Ranged attack, 1d8 cold, slows the target."),
                        ("Acid Splash", "Cantrip. 5-ft sphere within 60 ft; DEX save or 1d6 acid."),
                        ("Chromatic Orb", "Level 1. Ranged attack, 3d8 damage of a type you pick."),
                        ("Magic Missile", "Level 1. Three darts of 1d4+1 force that never miss; split them as you like. One free cast."),
                        ("Thunderwave", "Level 1. 15-ft cube from you, CON save, 2d8 thunder and a 10-ft push."),
                        ("See Invisibility", "Level 2 (1 hour, no concentration). You see Invisible creatures and objects as if they were visible."),
                        ("Shatter", "Level 2. 10-ft sphere within 60 ft, CON save, 3d8 thunder (half on a success)."),
                        ("Scorching Ray", "Level 2. Three fire rays, 2d6 each; split them as you like."),
                        ("Dragon's Breath", "Level 2, bonus action, concentration. A willing creature may exhale a 15-ft cone of damage as an action."),
                        ("Blur", "Level 2, concentration. Attackers have Disadvantage against you unless they perceive you with Blindsight or Truesight."),
                        ("Command", "Level 1. WIS save or the target falls Prone."),
                        ("Shield", "Level 1 reaction (automatic): +5 AC against the triggering hit."),
                    ]
                } else {
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
                        ("Blur", "Level 2, concentration. Attackers have Disadvantage against you unless they perceive you with Blindsight or Truesight."),
                        ("Command", "Level 1. WIS save or the target falls Prone."),
                        ("Shield", "Level 1 reaction (automatic): +5 AC against the triggering hit."),
                    ]
                },
            ),
            "vesper" => (
                "Tiefling (Abyssal) · CHA 17 DEX 14 WIS 14 CON 12 · Spell save DC 13, attack +5 · Poison Resistance · Darkvision 60 ft · Speed 30 ft",
                &[
                    ("Dagger", "+4, 1d4+2 piercing; thrown 20/60 ft. Carries two."),
                    ("Bardic Inspiration", "Bonus action, 3 uses (d6, Long Rest): grant an ally within 60 ft a d6 die for 1 hour. Auto-triggers when the ally misses an attack or fails a saving throw by 1–6."),
                    ("Cutting Words", "College of Lore reaction (spends 1 Bardic Inspiration die): subtract 1d6 from an enemy within 60 ft. Auto-triggers when a non-critical enemy hit beats AC by 0–5 (so 1–6 can turn it into a miss) or when enemy damage would drop a standing ally and subtracting up to 6 can keep them standing (applied once to an area spell's shared roll before saves halve it)."),
                    ("Jack of All Trades & Expertise", "+1 to non-proficient ability checks (excluding Initiative); double proficiency in Perception (Passive 16) and Stealth; Bonus Proficiencies in Arcana, Investigation, and Medicine."),
                    ("Abyssal Legacy & Darkvision", "Resistance to Poison damage, Darkvision 60 ft, Poison Spray cantrip, and Ray of Sickness always prepared (one free cast)."),
                    ("Magic Initiate (Cleric)", "Knows Guidance and Spare the Dying, and has Bless prepared with one free cast."),
                ],
                &[
                    ("Vicious Mockery", "Cantrip. 60 ft, creature you can see or hear (works on invisible foes who aren't hidden): WIS save or 1d6 psychic and Disadvantage on its next attack roll before the end of its next turn."),
                    ("Starry Wisp", "Cantrip. 60 ft ranged spell attack, 1d8 radiant; target sheds 10-ft Dim Light and can't benefit from Invisible until the end of your next turn."),
                    ("Poison Spray", "Cantrip (Abyssal Legacy). 30 ft ranged spell attack, 1d12 poison."),
                    ("Spare the Dying", "Cantrip (Magic Initiate). Stabilise a dying creature."),
                    ("Faerie Fire", "Level 1, concentration. 20-ft cube within 60 ft: DEX save or outlined in dim light, can't benefit from Invisible, and attacks against it have Advantage."),
                    ("Healing Word", "Level 1, bonus action. Heal 2d4 + CHA at range."),
                    ("Thunderwave", "Level 1. 15-ft cube from you, CON save, 2d8 thunder and a 10-ft push."),
                    ("Command", "Level 1. WIS save or the target falls Prone (Grovel)."),
                    ("Bless", "Level 1, concentration (Magic Initiate, one free cast). Up to three creatures add 1d4 to attacks and saves."),
                    ("Ray of Sickness", "Level 1 (Abyssal Legacy, one free cast). 60 ft ranged spell attack, 2d8 poison and Poisoned until the end of your next turn."),
                    ("Shatter", "Level 2. 10-ft sphere within 60 ft, CON save, 3d8 thunder (half on a success)."),
                    ("Aid", "Level 2. Up to three allies raise their maximum and current HP by 5."),
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
        "animated_armor" => &[
            ("Slam", "Two attacks, +4 to hit, 1d6+2 bludgeoning each."),
            ("Blindsight", "Perceives creatures within 60 ft unless total cover blocks them."),
            ("Immunities", "Poison and psychic damage. Immune to Charmed, Deafened, Exhaustion, Frightened, Paralyzed, Petrified and Poisoned."),
        ],
        "kobold_warrior" => &[
            ("Dagger", "+4 to hit, 1d4+2 piercing, thrown 20/60 ft. Carries three."),
            ("Pack Tactics", "Advantage on attacks against a target within 5 ft of an ally that can act."),
            ("Sunlight Sensitivity", "Disadvantage on checks and attacks in sunlight."),
        ],
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
            ("Redirect Attack", if replay_version >= 13 {
                "When a creature it can see makes an attack roll against it, the boss can use its reaction to swap places with a Small or Medium ally within 5 ft. The ally becomes the target."
            } else if replay_version >= 3 {
                "Reaction: when an attack would hit it, it swaps places with a Small or Medium ally within 5 ft, which becomes the target."
            } else { "Reaction: when an attack would hit it, it swaps places with a goblin ally within 5 ft, which becomes the target." }),
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
            ("Vulnerable: radiant", if replay_version >= 9 {
                "Takes double radiant damage. Resists acid, cold, fire, lightning and thunder. Immune to necrotic and poison damage."
            } else { "Takes double radiant damage. Resists acid, cold, fire, lightning and thunder." }),
        ],
        "wight" => &[
            ("Necrotic Sword / Bow", "+4, 1d8+2 plus 1d8 necrotic. Two attacks per action."),
            ("Life Drain", "CON save or 1d8+2 necrotic and the HP maximum drops by that much."),
            ("Resists necrotic", "Takes half necrotic damage."),
        ],
        "ogre" => &[
            ("Greatclub", "+6 to hit, 2d8+4 bludgeoning."),
            ("Javelin", "+6 to hit, 2d6+4 piercing; melee 5 ft or thrown 30/120 ft. Carries three."),
            ("Large (2x2)", "Occupies a 10-ft space. Speed 40 ft. Darkvision 60 ft."),
        ],
        "owlbear" => &[
            ("Multiattack", "Makes two Rend attacks."),
            ("Rend", "+7 to hit, 2d8+5 slashing."),
            ("Large (2x2)", "Occupies a 10-ft space. Speed 40 ft, Climb 40 ft. Darkvision 60 ft."),
        ],
        _ => return None,
    };
    let mut features = pairs(features);
    if replay_version >= 10 {
        let traits: &[(&str, &str)] = match content {
            "specter" => &[
                ("Incorporeal Movement", "Moves through creatures and solid objects as difficult terrain. Ending its turn inside an object deals 1d10 force damage to it."),
                ("Sunlight Sensitivity", "Sunlight imposes Disadvantage on its ability checks and attack rolls."),
            ],
            "shadow" => &[
                ("Shadow Stealth", "In dim light or darkness, can take the Hide action as a Bonus Action. Stealth +6."),
                ("Sunlight Weakness", "Sunlight imposes Disadvantage on its ability checks, attack rolls and saving throws."),
            ],
            "wight" => &[("Sunlight Sensitivity", "Sunlight imposes Disadvantage on its ability checks and attack rolls.")],
            _ => &[],
        };
        features.extend(pairs(traits));
    }
    Some(json!({
        "stats": format!("{} · {} HP · AC {}", creature_type_label(content), hp, ac),
        "features": features,
        "spells": [],
    }))
}

/// Concise SRD 5.2.1 combat summary for custom hero inspect sheets.
pub fn spell_short_summary(key: &str) -> &'static str {
    match key {
        "sacred_flame" => "Cantrip. 60 ft, DEX save or 1d8 radiant (ignores cover).",
        "spare_the_dying" => "Cantrip. 15 ft, stabilise a dying creature.",
        "sorcerous_burst" => "Cantrip. 120 ft spell attack, 1d8 chosen damage; an 8 explodes into another d8.",
        "firebolt" => "Cantrip. 120 ft spell attack, 1d10 fire.",
        "ray_of_frost" => "Cantrip. 60 ft spell attack, 1d8 cold and -10 ft speed until your next turn.",
        "acid_splash" => "Cantrip. 5-ft sphere within 60 ft, DEX save or 1d6 acid.",
        "poison_spray" => "Cantrip. 30 ft spell attack, 1d12 poison.",
        "vicious_mockery" => "Cantrip. 60 ft, WIS save or 1d6 psychic and Disadvantage on its next attack.",
        "starry_wisp" => "Cantrip. 60 ft spell attack, 1d8 radiant; outlines target and cancels Invisible.",
        "bless" => "Level 1, concentration. Up to 3 allies add 1d4 to attacks and saves.",
        "command" => "Level 1. 60 ft, WIS save or fall Prone (Grovel).",
        "cure_wounds" => "Level 1. Touch: heal 2d8 + spellcasting modifier.",
        "guiding_bolt" => "Level 1. 120 ft spell attack, 4d6 radiant; next attack against target has Advantage.",
        "healing_word" => "Level 1, bonus action. 60 ft: heal 2d4 + spellcasting modifier.",
        "protection_from_evil_and_good" => "Level 1, concentration (uses Holy Water). Aberrations/Fey/Undead etc. have Disadvantage against target.",
        "sanctuary" => "Level 1, bonus action. Attackers must make a WIS save before targeting the warded creature.",
        "shield_of_faith" => "Level 1, bonus action, concentration. +2 AC.",
        "burning_hands" => "Level 1. 15-ft cone, DEX save, 3d6 fire (half on success).",
        "chromatic_orb" => "Level 1. 90 ft spell attack, 3d8 damage of a chosen type (leaps on matching dice).",
        "mage_armor" => "Level 1. Touch unarmored creature: base AC becomes 13 + DEX.",
        "magic_missile" => "Level 1. 120 ft: three 1d4+1 force darts that automatically hit.",
        "ray_of_sickness" => "Level 1. 60 ft spell attack, 2d8 poison and Poisoned until end of your next turn.",
        "shield" => "Level 1, reaction (automatic): +5 AC against the triggering hit.",
        "thunderwave" => "Level 1. 15-ft cube, CON save, 2d8 thunder and 10-ft push (half on success).",
        "faerie_fire" => "Level 1, concentration. 20-ft cube: DEX save or outlined, cancels Invisible, attacks have Advantage.",
        "aid" => "Level 2. Up to 3 allies raise max and current HP by 5.",
        "lesser_restoration" => "Level 2, bonus action. Touch: end Paralyzed or Poisoned.",
        "spiritual_weapon" => "Level 2, bonus action, concentration. Force weapon strikes for 1d8 + spellcasting modifier force.",
        "blur" => "Level 2, concentration. Attackers have Disadvantage unless they use Blindsight or Truesight.",
        "dragons_breath" => "Level 2, bonus action, concentration. Willing creature exhales a 15-ft cone of 3d6 elemental damage.",
        "invisibility" => "Level 2, concentration. Touch: target becomes Invisible until it attacks or casts a spell.",
        "scorching_ray" => "Level 2. 120 ft: three fire rays, 2d6 fire each.",
        "see_invisibility" => "Level 2 (1 hour, no concentration). See Invisible creatures and objects clearly.",
        "shatter" => "Level 2. 10-ft sphere within 60 ft, CON save, 3d8 thunder (half on success).",
        _ => "",
    }
}

/// Build a completely data-driven inspect sheet for a Practice custom hero,
/// derived from its actual `Template`, `ContentDoc`, and builder metadata
/// (never reusing built-in hero hardcoded strings).
pub(crate) fn custom_hero_sheet(
    meta: &crate::present::CustomHeroMeta,
    t: &crate::content::Template,
    hp: i32,
    ac: i32,
) -> Value {
    let mut stats_parts: Vec<String> = Vec::new();
    if !meta.species_label.is_empty() {
        stats_parts.push(meta.species_label.clone());
    }
    if !meta.background_label.is_empty() {
        stats_parts.push(meta.background_label.clone());
    }
    stats_parts.push(format!(
        "STR {} DEX {} CON {} INT {} WIS {} CHA {}",
        t.abil[0], t.abil[1], t.abil[2], t.abil[3], t.abil[4], t.abil[5]
    ));
    if let Some(c) = &t.caster {
        stats_parts.push(format!("Spell save DC {}, attack {:+}", c.dc, c.spell_attack));
    }
    if t.darkvision > 0 {
        stats_parts.push(format!("Darkvision {} ft", t.darkvision));
    }
    if t.resist & crate::content::Dmg::Poison.bit() != 0 {
        stats_parts.push("Poison Resistance".to_string());
    }
    stats_parts.push(format!("HP {hp} · AC {ac} · Speed {} ft", t.speed));
    let stats = stats_parts.join(" · ");

    let mut features: Vec<Value> = Vec::new();
    for def in t.attacks.iter().filter(|a| !a.thrown) {
        let mut detail = format!("{:+}, {} {}", def.to_hit, def.damage.text(), def.damage_type.name());
        if let Some(thrown_def) = t.attacks.iter().find(|a| a.thrown && a.name == def.name) {
            detail.push_str(&format!("; thrown {}/{} ft", thrown_def.range, thrown_def.range_max));
        }
        if def.range > 5 && !def.ranged {
            detail.push_str(&format!("; reach {} ft", def.range));
        }
        if let Some(g) = def.graze {
            detail.push_str(&format!(". Mastery: Graze deals {} damage on a miss", g.max(0)));
        }
        if def.sap {
            detail.push_str(". Mastery: Sap gives target Disadvantage on its next attack");
        }
        if def.cleave {
            detail.push_str(". Mastery: Cleave grants one free attack on an adjacent second foe within reach");
        }
        detail.push('.');
        features.push(json!({"name": title_words(def.name), "text": detail}));
    }

    let doc = &meta.doc;
    for f in &doc.features {
        let fid = f.id.as_str();
        let text: String = match fid {
            "second_wind" => format!(
                "Bonus action: regain {}+{} HP. {} {}.",
                t.second_wind_die.text(),
                t.fighter_level,
                t.second_wind_uses,
                if t.second_wind_uses == 1 { "use" } else { "uses" }
            ),
            "action_surge" => format!(
                "Take one extra action this turn (except Magic). {} {}.",
                t.action_surge_uses,
                if t.action_surge_uses == 1 { "use" } else { "uses" }
            ),
            "improved_critical" => "Champion: critical hits on a natural 19 or 20.".into(),
            "remarkable_athlete" => "Advantage on Initiative and Athletics; after a critical hit, move up to half your speed without provoking Opportunity Attacks.".into(),
            "great_weapon_fighting" => "Treat any 1 or 2 on a two-handed or versatile-in-two-hands melee weapon damage die as a 3.".into(),
            "defense" => "+1 AC while wearing armor.".into(),
            "savage_attacker" => "Once per turn on a weapon hit, roll the weapon's damage dice twice and use either roll.".into(),
            "alert" => format!("+{0} to Initiative (Initiative Swap is sheet-only in Practice).", t.prof_bonus),
            "skilled" => "Proficiency in three chosen skills (3-skill subset of SRD skills or tools).".into(),
            "channel_divinity" => {
                let uses = t.caster.as_ref().map_or(0, |c| c.channel_divinity);
                format!("{uses} {} (Divine Spark, Turn Undead{}).", if uses == 1 { "use" } else { "uses" }, if t.preserve_life { ", Preserve Life" } else { "" })
            }
            "divine_spark" => {
                let wis_mod = crate::content::ability_mod(t.abil[4]);
                format!("Channel Divinity (30 ft): heal 1d8+{wis_mod} HP, or CON save vs 1d8+{wis_mod} radiant/necrotic damage.")
            }
            "channel_divinity_turn_undead" => "Channel Divinity (30 ft): undead make a WIS save or are Frightened, Incapacitated, and flee.".into(),
            "preserve_life" => {
                let pool = 5 * t.caster.as_ref().map_or(t.level, |c| c.level);
                format!("Channel Divinity (30 ft): divide {pool} HP among Bloodied allies up to half their max HP.")
            }
            "disciple_of_life" => "Healing spells cast with a spell slot restore an extra 2 + slot level HP.".into(),
            "divine_order" => {
                if let Some(order) = f.params.get("order").and_then(|v| v.as_str()) {
                    if order == "thaumaturge" {
                        "Thaumaturge: +1 Cleric cantrip (+WIS to Arcana/Religion is sheet-only in Practice).".into()
                    } else {
                        "Protector: Heavy armor and Martial weapon training.".into()
                    }
                } else {
                    "Cleric Divine Order applied.".into()
                }
            }
            "innate_sorcery" => {
                let uses = t.caster.as_ref().map_or(0, |c| c.innate_sorcery);
                format!("Bonus action, {uses} uses: +1 spell save DC and Advantage on Sorcerer spell attacks for 1 minute.")
            }
            "font_of_magic" => {
                let sp = t.caster.as_ref().map_or(0, |c| c.sorcery_points);
                format!("{sp} Sorcery Points (Metamagic and slot conversions).")
            }
            "metamagic" => {
                let opts = t.caster.as_ref().map(|c| {
                    c.metamagic.iter().map(|m| title_words(m.key())).collect::<Vec<_>>().join(", ")
                }).unwrap_or_default();
                format!("Known Metamagic: {opts}.")
            }
            "draconic_resilience" => format!("+{} max HP and unarmored AC 10 + DEX + CHA.", t.level),
            "potent_cantrip" => "Missed cantrip attacks and saved cantrips still deal half damage with no additional effect.".into(),
            "evocation_savant" => "Added two Evocation spells (levels 1–2) to the spellbook.".into(),
            "rage" => format!(
                "Bonus action, {} {}: B/P/S resistance, +{} STR melee damage, Advantage on STR checks/saves, no spells.",
                t.rage_uses,
                if t.rage_uses == 1 { "use" } else { "uses" },
                t.rage_damage
            ),
            "reckless_attack" => "Before first attack roll on turn: Advantage on STR attacks until next turn, and attacks against you have Advantage.".into(),
            "danger_sense" => "Advantage on Dexterity saving throws unless Incapacitated.".into(),
            "frenzy" => format!("Path of the Berserker: while raging and reckless, first STR hit of the turn deals +{}d6 extra damage.", t.rage_damage),
            "unarmored_defense_barbarian" => "Unarmored AC 10 + DEX + CON (shield permitted).".into(),
            "primal_knowledge" => "Extra Barbarian skill proficiency (using STR for five skills while raging is sheet-only in Practice).".into(),
            "bardic_inspiration" => format!(
                "Bonus action, {} {} ({}, Long Rest): grant an ally within 60 ft a {} die for 1 hour.",
                t.bardic_inspiration_uses,
                if t.bardic_inspiration_uses == 1 { "use" } else { "uses" },
                t.bardic_inspiration_die.text(),
                t.bardic_inspiration_die.text()
            ),
            "cutting_words" => format!(
                "College of Lore reaction (spends 1 Bardic Inspiration): subtract {} from an enemy attack or damage roll within 60 ft.",
                t.bardic_inspiration_die.text()
            ),
            "expertise" => {
                if meta.expertise.is_empty() {
                    "Double proficiency bonus on two chosen proficient skills.".into()
                } else {
                    let list = meta.expertise.iter().map(|s| title_words(s)).collect::<Vec<_>>().join(" and ");
                    format!("Double proficiency bonus in {list}.")
                }
            }
            "jack_of_all_trades" => "+1 to non-proficient ability checks (excluding Initiative).".into(),
            "bonus_proficiencies" => {
                if meta.bonus_proficiencies.is_empty() {
                    "College of Lore: three extra skill proficiencies.".into()
                } else {
                    let list = meta.bonus_proficiencies.iter().map(|s| title_words(s)).collect::<Vec<_>>().join(", ");
                    format!("College of Lore bonus skill proficiencies: {list}.")
                }
            }
            "fey_ancestry" => "Advantage on saving throws to avoid or end the Charmed condition.".into(),
            "fiendish_legacy" => "Abyssal Legacy: Poison Resistance, Poison Spray cantrip, and at level 3 Ray of Sickness (1 free cast per Long Rest).".into(),
            "magic_initiate_cleric" => "Magic Initiate (Cleric): 2 Cleric cantrips and 1 Level 1 Cleric spell (1 free cast per Long Rest).".into(),
            "magic_initiate_wizard" => "Magic Initiate (Wizard): 2 Wizard cantrips and 1 Level 1 Wizard spell (1 free cast per Long Rest).".into(),
            "resourceful" => "Heroic Inspiration on Long Rest (sheet-only in Practice).".into(),
            "trance" => "4-hour meditative Long Rest (sheet-only in Practice).".into(),
            "ritual_adept" => "Ritual spellcasting outside combat (sheet-only in Practice).".into(),
            "arcane_recovery" => "Recover spell slots on a Short Rest (sheet-only in Practice).".into(),
            "scholar" => "Skill Expertise recorded on sheet (sheet-only in Practice).".into(),
            "otherworldly_presence" => "Knows Thaumaturgy cantrip (no effect in combat).".into(),
            "spellcasting" | "martial_archetype" | "divine_domain" | "sorcerer_subclass"
            | "wizard_subclass" | "primal_path" | "bard_subclass" | "draconic_spells"
            | "weapon_mastery" | "skillful" | "versatile" | "keen_senses" | "elven_lineage" => continue,
            _ => String::new(),
        };
        features.push(json!({"name": title_words(fid), "text": text}));
    }

    if !meta.owned_equipment.is_empty() || !meta.coins_label.is_empty() {
        let mut gear_text = meta.owned_equipment.join(", ");
        if !meta.coins_label.is_empty() {
            if !gear_text.is_empty() {
                gear_text.push_str(" · ");
            }
            gear_text.push_str(&meta.coins_label);
        }
        features.push(json!({"name": "Equipment & Coins", "text": gear_text}));
    }

    for note in &meta.notes {
        features.push(json!({"name": "Practice Note", "text": note}));
    }

    let mut spells: Vec<Value> = Vec::new();
    if let Some(sc) = &doc.spellcasting {
        let free_set: std::collections::HashSet<&str> = sc.free_casts.iter().map(|f| f.spell.as_str()).collect();
        for sid in sc.spells.iter().chain(sc.reaction_spells.iter()) {
            let mut txt = spell_short_summary(sid).to_string();
            if free_set.contains(sid.as_str()) {
                if !txt.is_empty() {
                    txt.push(' ');
                }
                txt.push_str("One free cast.");
            }
            spells.push(json!({"name": spell_display_name(sid), "text": txt}));
        }
        for sid in &sc.inert_spells {
            let reason = meta
                .inert_spell_reasons
                .get(sid)
                .map(|s| s.as_str())
                .unwrap_or("No effect in combat.");
            spells.push(json!({"name": spell_display_name(sid), "text": reason}));
        }
    }

    json!({
        "stats": stats,
        "features": features,
        "spells": spells,
    })
}
