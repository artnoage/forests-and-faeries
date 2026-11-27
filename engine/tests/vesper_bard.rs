//! Integration tests for Vesper the Tiefling College of Lore Bard (Levels 1–3),
//! Faerie Fire, See Invisibility (Curogana L3), Vicious Mockery, Starry Wisp,
//! Poison Spray, Bardic Inspiration, Cutting Words, `ember-gen-v5`, and the
//! rule-version-18 fixed-damage `attack_profiles` fix.

use std::sync::Arc;

use ember_rs::batch::{
    natural20_commit_for_rule_version, DEFAULT_BATCH_RULE_VERSION, NATURAL20_COMMIT, NATURAL20_COMMIT_RULE_17,
};
use ember_rs::content::{Ability, ContentPool, Dmg, SpellId};
use ember_rs::effects::EffKey;
use ember_rs::encode::{Obs, Objective, Version, F_A_V5, F_C_V5};
use ember_rs::engine::{Act, Fight, St, CURRENT_RULE_VERSION};
use ember_rs::env::{Controller, Env};
use ember_rs::map::Grid;
use ember_rs::present::{parse_draw_json, LevelInput, WebArena, CURRENT_WEB_REPLAY_VERSION};
use ember_rs::spells::Cast;
use ember_rs::tape::Placement;
use ember_rs::trace::Trace;
use ember_rs::web_events::{SaveOutcome, WebEv};
use serde_json::{json, Value};

fn open_fight(units: &[(&str, i32, i32)], rows: &[&str], seed: u64) -> Fight {
    let pool = ContentPool::global();
    let grid = Arc::new(Grid::from_rows(&rows.iter().map(|s| s.to_string()).collect::<Vec<_>>()).unwrap());
    let ids: Vec<String> = units.iter().map(|(id, _, _)| (*id).to_string()).collect();
    let placements: Vec<Placement> = units
        .iter()
        .map(|(id, x, y)| Placement { id: (*id).to_string(), x: *x, y: *y })
        .collect();
    let mut f = Fight::on_map(pool, grid, &ids, &placements, 50, Trace::free(seed)).unwrap();
    f.set_rule_version(CURRENT_RULE_VERSION);
    f
}

#[test]
fn vesper_l1_l2_l3_srd_5_2_1_sheets_and_traits() {
    let pool = ContentPool::global();
    let l1 = &pool.templates[pool.tid("vesper_l1").unwrap() as usize];
    let l2 = &pool.templates[pool.tid("vesper_l2").unwrap() as usize];
    let l3 = &pool.templates[pool.tid("vesper").unwrap() as usize];

    // Core stats across levels 1–3 (Tiefling Abyssal Legacy, Acolyte +2 CHA / +1 WIS)
    for (t, lvl, hp, pp, med, ath, acr) in [
        (l1, 1, 9, 14, 2, -1, 2),
        (l2, 2, 15, 16, 3, 0, 3),
        (l3, 3, 21, 16, 4, 0, 3),
    ] {
        assert_eq!(t.level, lvl);
        assert_eq!(t.base_id, "vesper");
        assert_eq!(t.max_hp, hp);
        assert_eq!(t.ac, 14);
        assert_eq!(t.abil, [8, 14, 12, 10, 14, 17]);
        assert_eq!(t.darkvision, 60);
        assert_ne!(t.resist & Dmg::Poison.bit(), 0, "Abyssal Legacy Poison Resistance");
        assert!(t.bard);
        assert_eq!(t.bardic_inspiration_uses, 3);
        assert_eq!(t.bardic_inspiration_die.sides, 6);
        assert_eq!(t.passive_perception, pp);
        assert_eq!(t.skills, [med, ath, acr]);
        assert_eq!(t.init_bonus, 2, "Initiative is +2 DEX (no Alert, no Jack of All Trades on Initiative)");
        assert!(!t.init_adv);
    }

    assert!(!l1.cutting_words && !l2.cutting_words && l3.cutting_words);

    let c1 = l1.caster.as_ref().unwrap();
    let c2 = l2.caster.as_ref().unwrap();
    let c3 = l3.caster.as_ref().unwrap();
    assert_eq!(c1.slots, [0, 2, 0]);
    assert_eq!(c2.slots, [0, 3, 0]);
    assert_eq!(c3.slots, [0, 4, 2]);
    assert!(c1.spells.contains(&SpellId::FaerieFire));
    assert!(c1.spells.contains(&SpellId::ViciousMockery));
    assert!(c1.spells.contains(&SpellId::StarryWisp));
    assert!(c1.spells.contains(&SpellId::PoisonSpray));
    assert!(c1.spells.contains(&SpellId::Command));
    assert!(c1.free_casts.contains(&SpellId::Bless));
    assert!(!c1.free_casts.contains(&SpellId::RayOfSickness));
    assert!(c2.spells.contains(&SpellId::CureWounds));
    assert!(c3.spells.contains(&SpellId::Shatter));
    assert!(c3.spells.contains(&SpellId::Aid));
    assert!(!c3.spells.contains(&SpellId::CureWounds));
    assert!(c3.spells.contains(&SpellId::RayOfSickness));
    assert!(c3.free_casts.contains(&SpellId::RayOfSickness));
}

#[test]
fn faerie_fire_cancels_invisibility_grants_advantage_and_casts_dim_light() {
    let rows = ["DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD"];
    let mut f = open_fight(&[("vesper", 1, 2), ("guy", 2, 2), ("sprite-1", 4, 2)], &rows, 42);
    f.units[2].add_status(St::Invisible);
    // Before Faerie Fire: Guy cannot see invisible Sprite in Darkness; Darkness square is level 0.
    assert!(!f.can_see(1, 2));
    assert_eq!(f.effective_light_level((4, 2)), 0);

    // Cast Faerie Fire covering (4, 2) until the sprite fails its DEX save (deterministic across seeds).
    let mut outlined = false;
    for seed in 1..40u64 {
        let mut t = open_fight(&[("vesper", 1, 2), ("guy", 2, 2), ("sprite-1", 4, 2)], &rows, seed);
        t.units[2].add_status(St::Invisible);
        t.units[0].action = 1;
        let cast = Cast {
            spell: SpellId::FaerieFire,
            at_level: 1,
            free: false,
            mm: None,
            dt: None,
            targets: Vec::new(),
            multi: false,
            point: Some((3, 1)),
        };
        t.execute_action(0, &Act::Spell(Box::new(cast)));
        if t.has_effect(2, EffKey::FaerieFire) {
            outlined = true;
            // 1) Cancels Invisible benefit: Guy sees Sprite (Darkness raised to Dim Light within 10 ft!)
            assert_eq!(t.effective_light_level((4, 2)), 1, "Faerie Fire sheds 10-ft Dim Light in Darkness");
            assert_eq!(t.effective_light_level((6, 2)), 1, "10-ft radius reaches 2 squares away");
            assert!(t.can_see(1, 2), "Guy sees Faerie-Fire-outlined invisible Sprite");
            // 2) Grants Advantage on attacks by visible attackers
            let (adv, dis) = t.advantage(1, 2, &t.units[1].t.attacks[0]);
            assert!(adv && !dis, "Guy must attack Faerie-Fire-outlined invisible Sprite with Advantage");
            // 3) Dropping Vesper's concentration ends Faerie Fire and restores Sprite's Invisible benefit
            let conc = t.units[0].concentration.expect("Faerie Fire uses concentration");
            t.dismiss_effect(0, conc);
            assert!(!t.has_effect(2, EffKey::FaerieFire));
            assert!(!t.can_see(1, 2), "Invisible resumes once Faerie Fire concentration ends");
            break;
        }
    }
    assert!(outlined, "Sprite should fail DEX save on at least one seed");
}

#[test]
fn see_invisibility_replaces_burning_hands_only_at_v18_and_shows_per_active_hero_in_web() {
    let rows = ["........", "........", "........", "........"];
    // Rule version 17 preserves Burning Hands for legacy parity; rule version 18 uses See Invisibility.
    let mut legacy = open_fight(&[("curogana", 1, 1), ("will_o_wisp-1", 4, 1)], &rows, 1);
    legacy.set_rule_version(17);
    assert!(legacy.effective_spells(0).contains(&SpellId::BurningHands));
    assert!(!legacy.effective_spells(0).contains(&SpellId::SeeInvisibility));

    let cur = open_fight(&[("curogana", 1, 1), ("will_o_wisp-1", 4, 1)], &rows, 1);
    assert!(!cur.effective_spells(0).contains(&SpellId::BurningHands));
    assert!(cur.effective_spells(0).contains(&SpellId::SeeInvisibility));

    // WebArena v20: Curogana casts See Invisibility (no Concentration!) -> solid on Curogana's turn,
    // shimmering on Guy's turn, solid for everyone once Vesper outlines the Wisp with Faerie Fire!
    let level = LevelInput {
        encounter_id: "see_invis_v20".into(),
        preset_id: "test".into(),
        theme: "woodland".into(),
        map_name: "fen".into(),
        rows: rows.iter().map(|s| (*s).to_string()).collect(),
        scene: json!({}),
        level_view: json!({}),
        heroes: vec!["curogana".into(), "guy".into(), "vesper".into()],
        monsters: vec![("will_o_wisp-1".into(), "will_o_wisp".into(), "Will-o'-Wisp".into())],
        suggested_placements: vec![
            Placement { id: "curogana".into(), x: 1, y: 1 },
            Placement { id: "guy".into(), x: 2, y: 1 },
            Placement { id: "vesper".into(), x: 1, y: 2 },
            Placement { id: "will_o_wisp-1".into(), x: 5, y: 1 },
        ],
    };
    let mut game = WebArena::new(level, 5, 0, "csrf".into(), "enc".into()).unwrap();
    assert_eq!(CURRENT_WEB_REPLAY_VERSION, 21);
    game.start().unwrap();

    // Advance to Curogana's turn via public API? We can use Fight directly via WebArena state by forcing turns cleanly:
    // Verify Curogana's sheet at v20 lists See Invisibility and not Burning Hands.
    let st0 = game.state();
    let curo_v = st0["units"].as_array().unwrap().iter().find(|u| u["id"] == "curogana").unwrap();
    let spells: Vec<&str> = curo_v["sheet"]["spells"].as_array().unwrap().iter()
        .filter_map(|s| s["name"].as_str()).collect();
    assert!(spells.contains(&"See Invisibility"));
    assert!(!spells.contains(&"Burning Hands"));

    // Play through turns in manual mode so we directly control Curogana & Guy and inspect invisible_to_heroes!
    let level2 = LevelInput {
        encounter_id: "see_invis_v20_turns".into(),
        preset_id: "test".into(),
        theme: "woodland".into(),
        map_name: "fen".into(),
        rows: rows.iter().map(|s| (*s).to_string()).collect(),
        scene: json!({}),
        level_view: json!({}),
        heroes: vec!["curogana".into(), "guy".into()],
        monsters: vec![("will_o_wisp-1".into(), "will_o_wisp".into(), "Will-o'-Wisp".into())],
        suggested_placements: vec![
            Placement { id: "curogana".into(), x: 1, y: 1 },
            Placement { id: "guy".into(), x: 2, y: 1 },
            Placement { id: "will_o_wisp-1".into(), x: 5, y: 1 },
        ],
    };
    // Keep AI monster_control so invisible_to_heroes is active!
    let mut arena = WebArena::new(level2, 7, 0, "csrf".into(), "enc".into()).unwrap();
    arena.start().unwrap();
    let mut saw_solid_on_curogana = false;
    let mut saw_shimmer_on_guy = false;
    let mut curo_cast_see_invis = false;
    for _ in 0..16 {
        let st = arena.state();
        if st["phase"] == "finished" {
            break;
        }
        let turn_id = st["turn_id"].as_str().unwrap_or("").to_string();
        if turn_id == "will_o_wisp-1" {
            arena.advance(false).unwrap();
            continue;
        }
        let wisp = st["units"].as_array().unwrap().iter().find(|u| u["id"] == "will_o_wisp-1").unwrap();
        let wisp_invis_cond = wisp["conditions"].as_array().unwrap().iter().any(|c| c == "invisible");
        let shimmer = wisp.get("invisible_to_heroes").and_then(Value::as_bool).unwrap_or(false);
        if turn_id == "curogana" && !curo_cast_see_invis {
            if let Some(act) = st["actions"].as_array().unwrap().iter()
                .find(|a| a.get("spell").and_then(Value::as_str) == Some("see_invisibility"))
            {
                let aid = act["id"].as_str().unwrap().to_string();
                let after = arena.perform(&aid).unwrap();
                curo_cast_see_invis = true;
                let wisp_after = after["units"].as_array().unwrap().iter().find(|u| u["id"] == "will_o_wisp-1").unwrap();
                if wisp_after["conditions"].as_array().unwrap().iter().any(|c| c == "invisible") {
                    assert!(
                        !wisp_after.get("invisible_to_heroes").and_then(Value::as_bool).unwrap_or(false),
                        "Invisible Wisp must render SOLID on Curogana's turn after See Invisibility"
                    );
                    saw_solid_on_curogana = true;
                }
            }
        } else if turn_id == "curogana" && curo_cast_see_invis && wisp_invis_cond {
            assert!(!shimmer, "Invisible Wisp must render SOLID on Curogana's turn");
            saw_solid_on_curogana = true;
        } else if turn_id == "guy" && curo_cast_see_invis && wisp_invis_cond {
            assert!(shimmer, "Invisible Wisp must render SHIMMERING on Guy's turn");
            saw_shimmer_on_guy = true;
        }
        if saw_solid_on_curogana && saw_shimmer_on_guy {
            break;
        }
        arena.end_turn().unwrap();
    }
    assert!(curo_cast_see_invis, "Curogana should be able to cast See Invisibility");
    assert!(saw_solid_on_curogana && saw_shimmer_on_guy, "Per-active-hero See Invisibility display verified");
}

#[test]
fn bardic_inspiration_and_cutting_words_automatic_triggers() {
    let rows = ["........", "........", "........"];
    // 1) Bardic Inspiration grants 1d6, triggers on near-miss attack/save, never wasted when >6 short.
    let mut f = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("skeleton-1", 3, 1)], &rows, 9);
    f.units[0].bonus = 1;
    assert_eq!(f.units[0].bardic_inspiration_count, 3);
    f.execute_action(0, &Act::BardicInspiration { target: 1 });
    assert_eq!(f.units[0].bardic_inspiration_count, 2);
    assert!(f.has_effect(1, EffKey::BardicInspiration));

    // Near-miss by 8 (> 6) MUST NOT spend Bardic Inspiration!
    let mut f_far = f.clone();
    // Simulate a save vs DC 30 where Guy (+2 DEX) cannot reach even with +6
    let (tot_far, _) = f_far.save_with_dc(1, Ability::Dex, 30, false, 0, false, false, false);
    assert!(tot_far < 30);
    assert!(f_far.has_effect(1, EffKey::BardicInspiration), "BI must not be wasted when >6 short");

    // Near-miss by 1..=6 triggers BI automatically across seeds!
    let mut triggered = false;
    for seed in 1..40u64 {
        let mut t = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("skeleton-1", 3, 1)], &rows, seed);
        t.units[0].bonus = 1;
        t.execute_action(0, &Act::BardicInspiration { target: 1 });
        let _ = t.save_with_dc(1, Ability::Dex, 15, false, 0, false, false, false);
        if !t.has_effect(1, EffKey::BardicInspiration) {
            triggered = true;
            break;
        }
    }
    assert!(triggered, "Bardic Inspiration should auto-trigger on a near-miss save");

    // 2) Cutting Words (L3 Vesper) turns enemy hits into misses or blunts heavy damage
    let mut cw_used = false;
    for seed in 1..50u64 {
        let mut t = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("bugbear_warrior-1", 3, 1)], &rows, seed);
        t.units[0].reaction = 1;
        t.units[2].action = 1;
        let before_bi = t.units[0].bardic_inspiration_count;
        t.execute_action(2, &Act::Attack { atk: 0, target: 1, reaction: false });
        if t.units[0].bardic_inspiration_count < before_bi {
            assert_eq!(t.units[0].reaction, 0, "Cutting Words spends Vesper's reaction");
            cw_used = true;
            break;
        }
    }
    assert!(cw_used, "Cutting Words should auto-trigger against Bugbear hits on Guy");
}

#[test]
fn vicious_mockery_hits_invisible_heard_foe_and_starry_wisp_cancels_invisibility() {
    let rows = ["........", "........", "........"];
    // Vicious Mockery targets a creature you can "see or hear" -> legal against invisible-not-hidden Sprite!
    let mut f = open_fight(&[("vesper", 1, 1), ("sprite-1", 4, 1)], &rows, 3);
    f.units[0].action = 1;
    f.units[1].add_status(St::Invisible);
    assert!(!f.can_see(0, 1));
    let mut cands = Vec::new();
    f.human_spell_candidates(0, &mut cands);
    assert!(
        cands.iter().any(|a| matches!(a, Act::Spell(c) if c.spell == SpellId::ViciousMockery && c.targets == vec![1])),
        "Vicious Mockery must target an invisible (not hidden) creature Vesper can hear"
    );

    // If Sprite is Hidden too, Vesper cannot hear it -> Vicious Mockery NOT offered!
    f.units[1].add_status(St::Hidden);
    f.units[1].hidden_stealth = Some(30);
    let mut cands_hidden = Vec::new();
    f.human_spell_candidates(0, &mut cands_hidden);
    assert!(
        !cands_hidden.iter().any(|a| matches!(a, Act::Spell(c) if c.spell == SpellId::ViciousMockery)),
        "Vicious Mockery must not target a Hidden creature"
    );

    // Starry Wisp hit applies EffKey::StarryWisp and cancels Invisible
    let mut wisp_hit = false;
    for seed in 1..40u64 {
        let mut t = open_fight(&[("vesper", 1, 1), ("sprite-1", 4, 1)], &rows, seed);
        t.units[1].add_status(St::Invisible);
        t.units[0].action = 1;
        t.execute_action(
            0,
            &Act::Spell(Box::new(Cast {
                spell: SpellId::StarryWisp,
                at_level: 0,
                free: false,
                mm: None,
                dt: None,
                targets: vec![1],
                multi: false,
                point: None,
            })),
        );
        if t.has_effect(1, EffKey::StarryWisp) {
            assert!(t.can_see(0, 1), "Starry Wisp cancels Invisible benefit");
            wisp_hit = true;
            break;
        }
    }
    assert!(wisp_hit, "Starry Wisp should hit and reveal Sprite on at least one seed");
}

#[test]
fn ai_never_wastes_see_invisibility_without_invisible_foes_and_fixed_damage_v18_fix() {
    let rows = ["........", "........", "........", "........"];
    // 1) Normal fight (Skeletons): Curogana MUST NOT pick See Invisibility
    for seed in 1..15u64 {
        let mut f = open_fight(&[("curogana", 1, 1), ("guy", 2, 1), ("skeleton-1", 5, 1), ("skeleton-2", 5, 2)], &rows, seed);
        f.units[0].action = 1;
        let act = f.move_for(0);
        assert!(
            !matches!(act, Some(Act::Spell(ref c)) if c.spell == SpellId::SeeInvisibility),
            "Curogana must never waste See Invisibility against non-invisible skeletons"
        );
    }

    // 2) Claude's Finding A: fixed-damage Sprite attack profile is 1.0 on rule_version 18, 0.5 on 17
    let mut f17 = open_fight(&[("curogana", 1, 1), ("sprite-1", 3, 1)], &rows, 1);
    f17.set_rule_version(17);
    let p17 = f17.attack_profiles(1);
    assert!(p17.iter().any(|&(_, dmg, _, _)| (dmg - 0.5).abs() < 1e-6), "v17 preserves legacy 0.5 profile");

    let mut f18 = open_fight(&[("curogana", 1, 1), ("sprite-1", 3, 1)], &rows, 1);
    f18.set_rule_version(18);
    let p18 = f18.attack_profiles(1);
    assert!(p18.iter().any(|&(_, dmg, _, _)| (dmg - 1.0).abs() < 1e-6), "v18 fixes Sprite fixed-1 damage to 1.0");
}

#[test]
fn encoder_v5_extends_v4_and_encodes_vesper_and_new_spells() {
    assert_eq!(Version::parse("ember-gen-v5").unwrap(), Version::V5);
    assert_eq!(Version::V5.creature(), F_C_V5);
    assert_eq!(Version::V5.cand(), F_A_V5);

    let rows = ["........", "........", "........", "........"];
    let pool = ContentPool::global();
    let grid = Arc::new(Grid::from_rows(&rows.iter().map(|s| s.to_string()).collect::<Vec<_>>()).unwrap());
    let ids = vec!["vesper".to_string(), "guy".to_string(), "sprite-1".to_string()];
    let placements = vec![
        Placement { id: "vesper".into(), x: 1, y: 1 },
        Placement { id: "guy".into(), x: 2, y: 1 },
        Placement { id: "sprite-1".into(), x: 5, y: 1 },
    ];
    let env = Env::from_units(
        pool,
        grid,
        &ids,
        &placements,
        50,
        1,
        [Controller::External, Controller::Native],
        true,
    )
    .unwrap();
    let o_v4 = Obs::of_version(&env, None, (0, 0), &Objective::default(), Version::V4).unwrap();
    let o_v5 = Obs::of_version(&env, None, (0, 0), &Objective::default(), Version::V5).unwrap();
    assert_eq!(o_v4.creatures.len(), 24 * Version::V4.creature());
    assert_eq!(o_v5.creatures.len(), 24 * F_C_V5);
    // V5 creature prefix [0..F_C_V4] agrees with V4 on non-V5-only features and sets V5 bard feature = 1.0!
    let v5_names = Version::V5.names();
    let bard_idx = v5_names.creature.iter().position(|&n| n == "bard").unwrap();
    let cw_idx = v5_names.creature.iter().position(|&n| n == "cutting_words").unwrap();
    assert_eq!(o_v5.creatures[bard_idx], 1.0);
    assert_eq!(o_v5.creatures[cw_idx], 1.0);
}

#[test]
fn bardic_inspiration_see_or_hear_and_ability_check_inspiration_and_cutting_words() {
    let rows = ["........", "........", "........", "........"];
    let bi_cands = |f: &Fight, u: usize| -> Vec<Act> { f.bardic_inspiration_candidates(u) };

    // 1) Bardic Inspiration requires recipient to see OR hear the Bard (invisible Bard + deafened ally blocked).
    let mut f = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("skeleton-1", 6, 1)], &rows, 1);
    f.units[0].bonus = 1;
    // Invisible Bard + hearing ally -> allowed (can hear)
    f.units[0].add_status(St::Invisible);
    assert!(
        bi_cands(&f, 0).iter().any(|a| matches!(a, Act::BardicInspiration { target: 1 })),
        "hearing ally can be inspired by an invisible Bard"
    );
    // Invisible Bard + deafened ally -> NOT allowed (can neither see nor hear)
    f.units[1].add_status(St::Deafened);
    assert!(
        !bi_cands(&f, 0).iter().any(|a| matches!(a, Act::BardicInspiration { target: 1 })),
        "deafened ally cannot be inspired by an invisible Bard"
    );
    // Visible Bard + deafened ally -> allowed (can see)
    f.units[0].remove_status(St::Invisible);
    assert!(
        bi_cands(&f, 0).iter().any(|a| matches!(a, Act::BardicInspiration { target: 1 })),
        "deafened ally who can see the Bard can be inspired"
    );

    // 2) Failed inspired ability check (First Aid Medicine check, DC 10) spends Bardic Inspiration and flips failure to success!
    let mut bi_check_flipped = false;
    for seed in 1..120u64 {
        let mut t = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("mara", 3, 1), ("skeleton-1", 6, 1)], &rows, seed);
        t.units[0].bonus = 1;
        t.execute_action(0, &Act::BardicInspiration { target: 1 });
        assert!(t.has_bardic_inspiration(1));
        // Make Mara unconscious at 0 HP so Guy attempts First Aid (Medicine DC 10)
        t.units[2].hp = 0;
        t.units[2].add_status(St::Unconscious);
        t.units[2].add_status(St::Prone);
        t.units[1].action = 1;
        t.execute_action(1, &Act::FirstAid { target: 2 });
        if !t.has_bardic_inspiration(1) && t.units[2].has(St::Stable) {
            bi_check_flipped = true;
            break;
        }
    }
    assert!(bi_check_flipped, "Bardic Inspiration must trigger on a failed Medicine ability check and turn it into success");

    // 3) Successful hostile ability check (enemy Escape Grapple vs DC 13) triggers Vesper's Cutting Words reaction and turns success to failure!
    let mut cw_check_flipped = false;
    for seed in 1..120u64 {
        let mut t = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("goblin_warrior-1", 3, 1)], &rows, seed);
        t.units[0].reaction = 1;
        let bi_before = t.units[0].bardic_inspiration_count;
        // Goblin is grappled by Guy with fixed escape DC 13
        t.units[2].grappled_by.push((1, Some(13)));
        t.units[2].add_status(St::Grappled);
        t.units[2].action = 1;
        t.execute_action(2, &Act::EscapeGrapple { target: 1 });
        if t.units[0].reaction == 0
            && t.units[0].bardic_inspiration_count == bi_before - 1
            && t.units[2].has(St::Grappled)
        {
            cw_check_flipped = true;
            break;
        }
    }
    assert!(cw_check_flipped, "Cutting Words must trigger on a hostile ability check and turn success into failure");
}

#[test]
fn vesper_spell_targeting_matches_natural20_perception_and_clear_path() {
    let has_spell = |ms: &[Act], s: SpellId, tgt: usize| {
        ms.iter().any(|a| matches!(a, Act::Spell(c) if c.spell == s && c.targets == vec![tgt]))
    };
    let spell_sets = |f: &mut Fight, u: usize| -> (Vec<Act>, Vec<Act>) {
        let (mut ai, mut hum) = (Vec::new(), Vec::new());
        f.spell_candidates(u, &mut ai);
        f.human_spell_candidates(u, &mut hum);
        (ai, hum)
    };

    // 1) Audible invisible (non-hidden) enemy in clear path: StarryWisp, PoisonSpray, and ViciousMockery are offered.
    let open = ["........", "........", "........", "........"];
    let mut f = open_fight(&[("vesper", 1, 1), ("sprite-1", 4, 1)], &open, 1);
    f.units[0].action = 1;
    f.units[1].add_status(St::Invisible);
    let (ai, hum) = spell_sets(&mut f, 0);
    for moves in [&ai, &hum] {
        assert!(has_spell(moves, SpellId::StarryWisp, 1), "Starry Wisp must target audible invisible enemy");
        assert!(has_spell(moves, SpellId::PoisonSpray, 1), "Poison Spray must target audible invisible enemy");
        assert!(has_spell(moves, SpellId::ViciousMockery, 1), "Vicious Mockery must target audible invisible enemy");
    }

    // 2) Hidden invisible enemy: none of the three may be offered.
    f.units[1].add_status(St::Hidden);
    f.units[1].hidden_stealth = Some(20);
    let (ai_h, hum_h) = spell_sets(&mut f, 0);
    for hidden_moves in [&ai_h, &hum_h] {
        assert!(!has_spell(hidden_moves, SpellId::StarryWisp, 1), "Starry Wisp must not target hidden enemy");
        assert!(!has_spell(hidden_moves, SpellId::PoisonSpray, 1), "Poison Spray must not target hidden enemy");
        assert!(!has_spell(hidden_moves, SpellId::ViciousMockery, 1), "Vicious Mockery must not target hidden enemy");
    }

    // 3) Solid wall between Vesper and enemy (total cover / obstructed path): ViciousMockery, StarryWisp, PoisonSpray blocked.
    let walled = [
        "...H....",
        "...H....",
        "...H....",
        "...H....",
    ];
    let mut fw = open_fight(&[("vesper", 1, 1), ("blink_dog-1", 5, 1)], &walled, 1);
    fw.units[0].action = 1;
    let (ai_w, hum_w) = spell_sets(&mut fw, 0);
    for wall_moves in [&ai_w, &hum_w] {
        assert!(!has_spell(wall_moves, SpellId::ViciousMockery, 1), "Vicious Mockery must require clear path (no targeting through solid wall)");
        assert!(!has_spell(wall_moves, SpellId::StarryWisp, 1), "Starry Wisp must require clear path");
        assert!(!has_spell(wall_moves, SpellId::PoisonSpray, 1), "Poison Spray must require clear path");
    }

    // 4) Ray of Sickness AI estimate at v18 includes Bless (`ceil(ac - 2.5) == ac - 2`), matching Natural20 `DieRolls.prob`.
    let mut fb = open_fight(&[("vesper", 1, 1), ("sea_hag-1", 2, 1)], &open, 1);
    fb.units[0].action = 1;
    let ros = Cast {
        spell: SpellId::RayOfSickness,
        at_level: 1,
        free: true,
        targets: vec![1],
        multi: false,
        point: None,
        mm: None,
        dt: None,
    };
    // Adjacent Sea Hag (AC 14) -> ranged spell attack at Disadvantage, +5 to hit: 0.60^2 * 9.0 = 3.24
    let v_unblessed = fb.spell_ai_value(0, &ros);
    assert!((v_unblessed - 3.24).abs() < 1e-6, "unblessed Ray of Sickness score should be 3.24, got {v_unblessed}");
    // With Bless active -> ceil(14 - 2.5) = 12, +5 needs 7 -> 0.70^2 * 9.0 = 4.41
    let bless = Cast {
        spell: SpellId::Bless,
        at_level: 1,
        free: true,
        targets: vec![0],
        multi: true,
        point: None,
        mm: None,
        dt: None,
    };
    fb.execute_action(0, &Act::Spell(Box::new(bless)));
    let v_blessed = fb.spell_ai_value(0, &ros);
    assert!((v_blessed - 4.41).abs() < 1e-6, "blessed Ray of Sickness score should be 4.41, got {v_blessed}");
}

#[test]
fn blind_attack_skips_bardic_inspiration_and_cutting_words_on_unseen_squares() {
    let rows = ["........", "........", "........", "........"];

    // 1) Inspired Guy making a BlindAttack against a hidden goblin's square must NEVER spend BI
    //    or emit a BI event (identical to an empty square, no occupancy/AC leak).
    let mut saw_miss_hidden = false;
    for seed in 1..80u64 {
        let mut f = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("goblin_warrior-1", 3, 1)], &rows, seed);
        f.units[0].bonus = 1;
        f.execute_action(0, &Act::BardicInspiration { target: 1 });
        assert!(f.has_bardic_inspiration(1));
        f.units[2].add_status(St::Hidden);
        f.units[2].hidden_stealth = Some(30);
        f.units[1].action = 1;
        f.web_events = Some(Vec::new());
        f.execute_action(1, &Act::BlindAttack { atk: 0, square: (3, 1), heard: false });
        let evs = f.web_events.as_ref().unwrap();
        assert!(
            !evs.iter().any(|e| matches!(e, WebEv::BardicInspirationSpent { .. })),
            "seed {seed}: BlindAttack on hidden square must never spend Bardic Inspiration"
        );
        assert!(
            f.has_bardic_inspiration(1),
            "seed {seed}: Guy must retain Bardic Inspiration die on BlindAttack against hidden square"
        );
        if evs.iter().any(|e| matches!(e, WebEv::BlindMiss { .. })) {
            saw_miss_hidden = true;
        }
    }
    assert!(saw_miss_hidden, "expected at least one BlindAttack miss on hidden goblin");

    // 2) Audible invisible occupant targeted via BlindAttack (square attack) must also skip BI,
    //    while a direct Attack against that audible invisible target still spends BI on near-miss.
    let mut direct_spent_bi = false;
    for seed in 1..80u64 {
        let mut f_blind = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("sprite-1", 3, 1)], &rows, seed);
        f_blind.units[0].bonus = 1;
        f_blind.execute_action(0, &Act::BardicInspiration { target: 1 });
        f_blind.units[2].add_status(St::Invisible);
        f_blind.units[1].action = 1;
        f_blind.web_events = Some(Vec::new());
        f_blind.execute_action(1, &Act::BlindAttack { atk: 0, square: (3, 1), heard: true });
        assert!(
            f_blind.has_bardic_inspiration(1),
            "seed {seed}: BlindAttack on audible invisible square must not spend Bardic Inspiration"
        );

        let mut f_direct = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("sprite-1", 3, 1)], &rows, seed);
        f_direct.units[0].bonus = 1;
        f_direct.execute_action(0, &Act::BardicInspiration { target: 1 });
        f_direct.units[2].add_status(St::Invisible);
        f_direct.units[1].action = 1;
        f_direct.execute_action(1, &Act::Attack { atk: 0, target: 2, reaction: false });
        if !f_direct.has_bardic_inspiration(1) {
            direct_spent_bi = true;
        }
    }
    assert!(direct_spent_bi, "direct Attack against audible invisible target must still spend BI on near-miss");

    // 3) Cutting Words on a BlindAttack targeting an unseen ally square is also skipped.
    for seed in 1..80u64 {
        let mut f = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("goblin_warrior-1", 3, 1)], &rows, seed);
        f.units[1].add_status(St::Invisible);
        f.units[1].add_status(St::Hidden);
        f.units[1].hidden_stealth = Some(30);
        f.units[0].reaction = 1;
        let bi_before = f.units[0].bardic_inspiration_count;
        f.units[2].action = 1;
        f.web_events = Some(Vec::new());
        f.execute_action(2, &Act::BlindAttack { atk: 0, square: (2, 1), heard: false });
        let evs = f.web_events.as_ref().unwrap();
        assert!(
            !evs.iter().any(|e| matches!(e, WebEv::CuttingWordsAttack { .. })),
            "seed {seed}: Cutting Words attack reaction must not trigger on a square attack"
        );
        if !evs.iter().any(|e| matches!(e, WebEv::CuttingWordsDamage { .. })) {
            assert_eq!(f.units[0].bardic_inspiration_count, bi_before);
        }
    }
}

#[test]
fn cutting_words_damage_keeps_standing_ally_and_applies_once_to_shared_area_roll() {
    let rows = ["........", "........", "........", "........", "........"];

    // 1) Ally at 0 HP (unconscious): Cutting Words damage reaction must NEVER trigger.
    let mut f0 = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("goblin_warrior-1", 3, 1)], &rows, 1);
    f0.units[0].reaction = 1;
    f0.units[1].hp = 0;
    f0.units[1].add_status(St::Unconscious);
    f0.units[2].action = 1;
    for raw in [1, 4, 8, 12] {
        let before = f0.units[0].bardic_inspiration_count;
        assert!(f0.try_cutting_words_damage(2, 1, raw).is_none(), "must skip 0-HP ally for raw={raw}");
        assert_eq!(f0.units[0].bardic_inspiration_count, before);
        assert_eq!(f0.units[0].reaction, 1);
    }

    // 2) Ally at 2 HP vs 10 damage (10 - 6 = 4 >= 2, still drops): must NOT trigger.
    //    Ally at 20 HP vs 10 damage (10 < 20, wouldn't drop): must NOT trigger.
    //    Ally at 7 HP vs 10 damage (10 >= 7 && 10 - 6 = 4 < 7, can stay standing): MUST trigger.
    let mut f_sub = open_fight(&[("vesper", 1, 1), ("guy", 2, 1), ("goblin_warrior-1", 3, 1)], &rows, 7);
    f_sub.units[0].reaction = 1;
    f_sub.units[1].hp = 2;
    assert!(f_sub.try_cutting_words_damage(2, 1, 10).is_none(), "must skip unavoidable lethal hit (10 - 6 >= 2)");
    f_sub.units[1].hp = 20;
    assert!(f_sub.try_cutting_words_damage(2, 1, 10).is_none(), "must skip non-lethal hit (10 < 20)");
    f_sub.units[1].hp = 7;
    let res = f_sub.try_cutting_words_damage(2, 1, 10);
    assert!(res.is_some(), "must trigger when subtracting up to 6 keeps standing ally alive (10 - 6 < 7)");
    assert_eq!(f_sub.units[0].reaction, 0);

    // 3) Shared simultaneous-save area spell (Shatter): Cutting Words subtracts ONCE from the
    //    shared damage roll BEFORE each target applies its save/halving, benefiting BOTH allies!
    let mut verified_shared = false;
    for seed in 1..250u64 {
        let mut f = open_fight(&[("vesper", 1, 1), ("guy", 4, 1), ("mara", 5, 1), ("curogana", 4, 3)], &rows, seed);
        // Make Curogana an opposing caster so she casts Shatter on Guy & Mara.
        f.units[3].team = 1;
        f.units[0].reaction = 1;
        f.units[1].hp = 10;
        f.units[2].hp = 6;
        f.units[3].action = 1;
        f.web_events = Some(Vec::new());
        let bi_before = f.units[0].bardic_inspiration_count;
        let shatter = Cast {
            spell: SpellId::Shatter,
            at_level: 2,
            free: false,
            mm: None,
            dt: None,
            targets: Vec::new(),
            multi: false,
            point: Some((4, 1)),
        };
        f.execute_action(3, &Act::Spell(Box::new(shatter)));
        let evs = f.web_events.as_ref().unwrap();
        let cw_evs: Vec<_> = evs.iter().filter_map(|e| match e {
            WebEv::CuttingWordsDamage { roll, old_damage, new_damage, shared_roll, .. } => {
                Some((*roll, *old_damage, *new_damage, *shared_roll))
            }
            _ => None,
        }).collect();
        let atk_evs: Vec<_> = evs.iter().filter_map(|e| match e {
            WebEv::AttackOutcome { tgt: Some(t), save: Some(sv), raw_damage, .. } if *t == 1 || *t == 2 => {
                Some((*t, *sv, *raw_damage))
            }
            _ => None,
        }).collect();
        if let [(cw_roll, old_raw, new_raw, shared_roll)] = cw_evs.as_slice() {
            assert_eq!(f.units[0].reaction, 0);
            assert_eq!(f.units[0].bardic_inspiration_count, bi_before - 1);
            assert!(*shared_roll, "Shatter hitting two targets must mark shared_roll=true");
            assert_eq!(*new_raw, (*old_raw - *cw_roll).max(0));
            let has_made = atk_evs.iter().any(|&(_, sv, _)| sv == SaveOutcome::Made);
            let has_fail = atk_evs.iter().any(|&(_, sv, _)| sv == SaveOutcome::Failed);
            for &(t, sv, dmg) in &atk_evs {
                let expected = if sv == SaveOutcome::Made { new_raw.div_euclid(2) } else { *new_raw };
                assert_eq!(dmg, expected, "seed {seed}: target {t} (save={sv:?}) must get pre-halving shared subtraction");
            }
            if has_made && has_fail {
                verified_shared = true;
                break;
            }
        } else {
            assert!(cw_evs.is_empty(), "Cutting Words must fire at most once per shared Shatter roll");
        }
    }
    assert!(verified_shared, "must observe Shatter with one saving and one failing ally both sharing one Cutting Words subtraction");
}

#[test]
fn faerie_fire_prefers_ally_free_placement_and_penalizes_allies() {
    let rows = [
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
    ];
    // Vesper at (1, 4), Guy at (4, 4), invisible heard Sprite at (5, 4),
    // and three visible goblins clustered next to Guy at (3, 3), (3, 4), (3, 5).
    // A greedy cube covering Sprite + all 3 goblins catches Guy; an ally-free cube
    // shifted right catches the Sprite with zero allies.
    let mut f = open_fight(
        &[
            ("vesper", 1, 4),
            ("guy", 4, 4),
            ("sprite-1", 5, 4),
            ("goblin_warrior-1", 3, 3),
            ("goblin_warrior-2", 3, 4),
            ("goblin_warrior-3", 3, 5),
        ],
        &rows,
        1,
    );
    f.units[2].add_status(St::Invisible);
    f.units[0].action = 1;
    let mut cands = Vec::new();
    f.spell_candidates(0, &mut cands);
    let ff = cands
        .iter()
        .find_map(|a| match a {
            Act::Spell(c) if c.spell == SpellId::FaerieFire => c.point,
            _ => None,
        })
        .expect("Vesper must propose a Faerie Fire placement");
    let in_cube = |origin: (i32, i32), pos: (i32, i32)| {
        pos.0 >= origin.0 && pos.0 < origin.0 + 4 && pos.1 >= origin.1 && pos.1 < origin.1 + 4
    };
    assert!(in_cube(ff, (5, 4)), "Faerie Fire cube {ff:?} must cover the invisible Sprite at (5, 4)");
    assert!(!in_cube(ff, (4, 4)), "Faerie Fire cube {ff:?} must avoid catching ally Guy at (4, 4)");
}

#[test]
fn ray_of_sickness_presentation_is_version_gated_on_replay_v20() {
    // Intervening creature (Mara at (2, 1)) between Green Hag (4, 1) and Guy (1, 1)
    // gives Guy half cover (+2 AC), so Ray of Sickness emits `cover` on v20 and omits it on v19.
    let rows = ["........", "........", "........", "........"];
    let make_level = || LevelInput {
        encounter_id: "ros_v19_v20".into(),
        preset_id: "test".into(),
        theme: "woodland".into(),
        map_name: "glade".into(),
        rows: rows.iter().map(|s| (*s).to_string()).collect(),
        scene: json!({}),
        level_view: json!({}),
        heroes: vec!["guy".into(), "mara".into()],
        monsters: vec![("green_hag-1".into(), "green_hag".into(), "Green Hag".into())],
        suggested_placements: vec![
            Placement { id: "guy".into(), x: 1, y: 1 },
            Placement { id: "mara".into(), x: 2, y: 1 },
            Placement { id: "green_hag-1".into(), x: 4, y: 1 },
        ],
    };

    let placements_json = json!([
        {"id": "guy", "x": 1, "y": 1},
        {"id": "mara", "x": 2, "y": 1},
        {"id": "green_hag-1", "x": 4, "y": 1}
    ]);

    // Record a Green Hag Ray of Sickness turn in manual mode at v20.
    let mut rec = WebArena::new(make_level(), 3, 0, "csrf".into(), "enc".into()).unwrap();
    rec.configure(&placements_json, &json!("manual")).unwrap();
    let mut st = rec.start().unwrap();
    while st["turn_id"] != "green_hag-1" {
        st = rec.end_turn().unwrap();
    }
    assert_eq!(st["turn_id"], "green_hag-1");
    let ros_row_v20 = st["actions"]
        .as_array()
        .unwrap()
        .iter()
        .find(|a| {
            a.get("spell").and_then(Value::as_str) == Some("ray_of_sickness")
                && a.get("target_id").and_then(Value::as_str) == Some("guy")
        })
        .expect("Green Hag must have ray_of_sickness action targeting Guy")
        .clone();
    assert!(ros_row_v20.get("cover").is_some(), "v20 Ray of Sickness row must include cover");
    let wire_v20 = rec.wire(st.clone());
    let ros_def_v20 = wire_v20["action_defs"]
        .as_array()
        .unwrap()
        .iter()
        .find(|d| d.get("spell").and_then(Value::as_str) == Some("ray_of_sickness"))
        .unwrap();
    assert!(
        ros_def_v20["label"].as_str().unwrap().contains("Ray of Sickness"),
        "v20 label must use 'Ray of Sickness', got {:?}",
        ros_def_v20["label"]
    );
    let aid = ros_row_v20["id"].as_str().unwrap().to_string();
    let after_v20 = rec.perform(&aid).unwrap();
    assert!(
        after_v20["log"].as_array().unwrap().iter().any(|e| e["text"].as_str().unwrap_or("").contains("Ray of Sickness")),
        "v20 log must use 'Ray of Sickness'"
    );
    assert!(
        after_v20["effects"].as_array().unwrap().iter().any(|e| e.get("style").and_then(Value::as_str) == Some("ray_of_sickness")),
        "v20 effect style must be 'ray_of_sickness'"
    );

    // Replay the exact same draws at replay_version = 19: must preserve legacy presentation!
    let draws: Vec<_> = rec.recorded_draws().iter().map(|v| parse_draw_json(v).unwrap()).collect();
    let mut v19 = WebArena::with_versioned_replay_draws(make_level(), draws, 0, "csrf".into(), "enc".into(), 19).unwrap();
    v19.configure(&placements_json, &json!("manual")).unwrap();
    let mut st19 = v19.start().unwrap();
    while st19["turn_id"] != "green_hag-1" {
        st19 = v19.end_turn().unwrap();
    }
    let ros_row_v19 = st19["actions"]
        .as_array()
        .unwrap()
        .iter()
        .find(|a| {
            a.get("spell").and_then(Value::as_str) == Some("ray_of_sickness")
                && a.get("target_id").and_then(Value::as_str) == Some("guy")
        })
        .expect("v19 Green Hag must have ray_of_sickness action targeting Guy")
        .clone();
    assert!(ros_row_v19.get("cover").is_none(), "v19 Ray of Sickness row must omit cover");
    let wire_v19 = v19.wire(st19.clone());
    let ros_def_v19 = wire_v19["action_defs"]
        .as_array()
        .unwrap()
        .iter()
        .find(|d| d.get("spell").and_then(Value::as_str) == Some("ray_of_sickness"))
        .unwrap();
    assert!(
        ros_def_v19["label"].as_str().unwrap().contains("Ray Of Sickness"),
        "v19 label must preserve 'Ray Of Sickness', got {:?}",
        ros_def_v19["label"]
    );
    let aid19 = ros_row_v19["id"].as_str().unwrap().to_string();
    let after_v19 = v19.perform(&aid19).unwrap();
    assert!(
        after_v19["log"].as_array().unwrap().iter().any(|e| e["text"].as_str().unwrap_or("").contains("Ray Of Sickness")),
        "v19 log must preserve 'Ray Of Sickness'"
    );
    assert!(
        after_v19["effects"].as_array().unwrap().iter().any(|e| e.get("style").and_then(Value::as_str) == Some("generic")),
        "v19 effect style must preserve 'generic'"
    );
    assert!(
        !after_v19["effects"].as_array().unwrap().iter().any(|e| e.get("style").and_then(Value::as_str) == Some("ray_of_sickness")),
        "v19 must not emit 'ray_of_sickness' effect style"
    );
}

#[test]
fn batch_defaults_to_rule_17_and_maps_n20_commit_per_rule_version() {
    assert_eq!(DEFAULT_BATCH_RULE_VERSION, 17);
    assert_eq!(CURRENT_RULE_VERSION, 19);
    assert_eq!(natural20_commit_for_rule_version(17), NATURAL20_COMMIT_RULE_17);
    assert_eq!(natural20_commit_for_rule_version(18), NATURAL20_COMMIT.trim());
    assert_eq!(natural20_commit_for_rule_version(19), NATURAL20_COMMIT.trim());
    assert_ne!(NATURAL20_COMMIT_RULE_17, NATURAL20_COMMIT.trim());
}

#[test]
fn web_v21_ends_dodge_when_grappled_while_v20_preserves_rule_18() {
    let rows = vec!["......".to_string(); 3];
    let make_level = |id: &str| LevelInput {
        encounter_id: id.into(),
        preset_id: "test".into(),
        theme: "woodland".into(),
        map_name: "open".into(),
        rows: rows.clone(),
        scene: json!({}),
        level_view: json!({}),
        heroes: vec!["guy".into()],
        monsters: vec![
            ("bugbear_warrior-1".into(), "bugbear_warrior".into(), "Bugbear Warrior 1".into()),
            ("bugbear_warrior-2".into(), "bugbear_warrior".into(), "Bugbear Warrior 2".into()),
        ],
        suggested_placements: vec![
            Placement { id: "guy".into(), x: 2, y: 1 },
            Placement { id: "bugbear_warrior-1".into(), x: 1, y: 1 },
            Placement { id: "bugbear_warrior-2".into(), x: 3, y: 1 },
        ],
    };

    // Initiative: Guy acts first (20 -> 25), Bugbear 1 second (15 -> 17), Bugbear 2 third (10 -> 12).
    // Guy takes Dodge; Bugbear 1's Grab hits with Disadvantage [17, 12] -> 12+4=16 >= 16 and grapples Guy.
    // Bugbear 2's Grab rolls d20d in v20 (rule 18: Dodge retained) vs d20n in v21 (rule 19: Dodge ended).
    let base_draws = vec![
        // Guy Remarkable Athlete initiative (advantage)
        json!({"who": "guy", "tag": "initiative", "sides": 20, "mode": "a", "v": [20, 18]}),
        json!({"who": "bugbear_warrior-1", "tag": "initiative", "sides": 20, "mode": "n", "v": 15}),
        json!({"who": "bugbear_warrior-2", "tag": "initiative", "sides": 20, "mode": "n", "v": 10}),
        // Bugbear 1 Grab vs dodging Guy -> Disadvantage [17, 12], hits (12+4=16 == AC 16), 2d6+2 dmg = 8
        json!({"who": "bugbear_warrior-1", "tag": "attack", "sides": 20, "mode": "d", "v": [17, 12]}),
        json!({"who": "bugbear_warrior-1", "tag": "damage", "sides": 6, "mode": "n", "v": 3}),
        json!({"who": "bugbear_warrior-1", "tag": "damage", "sides": 6, "mode": "n", "v": 3}),
    ];

    let mut draws_v20 = base_draws.clone();
    draws_v20.push(json!({"who": "bugbear_warrior-2", "tag": "attack", "sides": 20, "mode": "d", "v": [15, 2]}));
    draws_v20.push(json!({"who": "bugbear_warrior-2", "tag": "damage", "sides": 6, "mode": "n", "v": 1}));
    draws_v20.push(json!({"who": "bugbear_warrior-2", "tag": "damage", "sides": 6, "mode": "n", "v": 1}));
    let mut draws_v21 = base_draws;
    draws_v21.push(json!({"who": "bugbear_warrior-2", "tag": "attack", "sides": 20, "mode": "n", "v": 2}));
    draws_v21.push(json!({"who": "bugbear_warrior-2", "tag": "damage", "sides": 6, "mode": "n", "v": 1}));
    draws_v21.push(json!({"who": "bugbear_warrior-2", "tag": "damage", "sides": 6, "mode": "n", "v": 1}));

    let placements_json = json!([
        {"id": "guy", "x": 2, "y": 1},
        {"id": "bugbear_warrior-1", "x": 1, "y": 1},
        {"id": "bugbear_warrior-2", "x": 3, "y": 1},
    ]);

    for (ver, draws, expect_mode) in [(20u8, draws_v20, "d"), (21u8, draws_v21, "n")] {
        let parsed: Vec<_> = draws.iter().map(|v| parse_draw_json(v).unwrap()).collect();
        let mut game = WebArena::with_versioned_replay_draws(
            make_level(&format!("grab_dodge_v{ver}")),
            parsed,
            0,
            "csrf".into(),
            "enc".into(),
            ver,
        ).unwrap();
        game.configure(&placements_json, &json!("manual")).unwrap();
        game.start().unwrap();
        let st = game.state();
        let dodge_id = st["actions"].as_array().unwrap().iter()
            .find(|a| a["kind"] == "dodge")
            .expect("guy must have dodge action")["id"].as_str().unwrap().to_string();
        game.perform(&dodge_id).unwrap();
        game.end_turn().unwrap();

        // Bugbear 1 grabs Guy
        let st_b1 = game.state();
        let grab1_id = st_b1["actions"].as_array().unwrap().iter()
            .find(|a| a["kind"] == "attack" && a["label"].as_str().unwrap_or("").to_lowercase().contains("grab"))
            .expect("bugbear 1 must have grab action")["id"].as_str().unwrap().to_string();
        game.perform(&grab1_id).unwrap();
        game.end_turn().unwrap();

        // Bugbear 2 attacks Guy: mode must be "d" at v20 (rule 18) and "n" at v21 (rule 19)
        let st_b2 = game.state();
        let atk2_id = st_b2["actions"].as_array().unwrap().iter()
            .find(|a| a["kind"] == "attack" && a["label"].as_str().unwrap_or("").to_lowercase().contains("grab"))
            .expect("bugbear 2 must have grab action")["id"].as_str().unwrap().to_string();
        let after = game.perform(&atk2_id).unwrap();
        let last_rec = after["timeline"].as_array().unwrap().last().expect("timeline record");
        let roll_mode = last_rec["draws"].as_array().unwrap().iter()
            .find(|d| d["tag"] == "attack")
            .and_then(|d| d["mode"].as_str())
            .expect("bugbear 2 attack draw");
        assert_eq!(roll_mode, expect_mode, "web replay_version {ver} follow-up attack roll mode");
    }
}
