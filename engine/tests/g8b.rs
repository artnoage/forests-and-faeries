//! G8b: the SRD 5.2.1 goblins (Minion, Warrior, Boss) and their mechanics
//! (docs/GENERAL_ENV.md, "G8b Rust mirror status"): content as natural20
//! derives it, Nimble Escape (and the native AI's Hide value, N20-040 fixed),
//! 2024 Hide and the hidden status, the per-team visibility mask of the
//! observation, the Minion's daggers (N20-041 fixed), Redirect Attack, and fail-closed
//! loading. Exact parity with natural20 is checked by the fixture tapes
//! (`tests/fixtures.rs`, `fixtures/g8b_*`).

use std::sync::Arc;

use ember_rs::content::{embedded_files, ContentPool, Dice};
use ember_rs::encode::{masked_from, Obs, Objective};
use ember_rs::engine::{Act, Fight, Notes};
use ember_rs::env::{Controller, Env};
use ember_rs::map::Grid;
use ember_rs::tape::Placement;
use ember_rs::trace::Trace;

const EXT: Controller = Controller::External;

fn placements(list: &[(&str, i32, i32)]) -> (Vec<String>, Vec<Placement>) {
    (
        list.iter().map(|(id, _, _)| id.to_string()).collect(),
        list.iter().map(|&(id, x, y)| Placement { id: id.into(), x, y }).collect(),
    )
}

fn fight(units: &[(&str, i32, i32)], seed: u64) -> Fight {
    let (ids, pl) = placements(units);
    Fight::on_map(ContentPool::global(), Grid::ember_vault(), &ids, &pl, 50, Trace::free(seed)).unwrap()
}

/// Two sealed corridors (no line of sight or path between them).
fn sealed() -> Arc<Grid> {
    let mut rows = vec!["H".repeat(30)];
    rows.extend((0..3).map(|_| format!("H{}H", ".".repeat(28))));
    rows.push("H".repeat(30));
    rows.extend((0..2).map(|_| format!("H{}H", ".".repeat(28))));
    rows.push("H".repeat(30));
    Arc::new(Grid::from_rows(&rows).unwrap())
}

fn env_on(grid: Arc<Grid>, units: &[(&str, i32, i32)], seed: u64) -> Env {
    let (ids, pl) = placements(units);
    Env::from_units(ContentPool::global(), grid, &ids, &pl, 50, seed, [EXT, EXT], true).unwrap()
}

fn row_of(env: &Env, want: &Act) -> Option<usize> {
    env.decision().unwrap().legal.iter().position(|a| a == want)
}

fn end_turn(env: &mut Env) {
    let n = env.decision().unwrap().legal.len();
    env.step(n - 1).unwrap();
}

#[test]
fn goblin_content() {
    let pool = ContentPool::global();
    let t = |id: &str| pool.template(pool.tid(id).unwrap());
    let (min, war, boss) = (t("goblin_minion"), t("goblin_warrior"), t("goblin_boss"));
    for g in [min, war, boss] {
        assert_eq!((g.size, g.speed, g.passive_perception, g.nimble_escape, g.init_bonus), ("small", 30, 9, Some(6), 2));
    }
    assert_eq!((min.ac, min.max_hp, war.ac, war.max_hp, boss.ac, boss.max_hp), (12, 7, 15, 10, 17, 21));
    assert_eq!(t("mara").passive_perception, 13);
    assert_eq!(t("ilyra").passive_perception, 13);

    // the Minion's dagger: a melee row and its thrown row, both spending
    // nothing but needing a dagger; three daggers
    let rows: Vec<(&str, bool, bool, bool, i32, i32)> =
        min.attacks.iter().map(|a| (a.name, a.ranged, a.melee_type, a.thrown, a.range, a.range_max)).collect();
    assert_eq!(rows, vec![("dagger", false, true, false, 5, 5), ("dagger", true, true, true, 20, 60)]);
    assert!(min.attacks.iter().all(|a| a.npc_item == Some(0) && a.to_hit == 4 && a.damage == Dice::new(1, 4, 2)));
    assert_eq!(min.inventory, vec![("dagger", 3)]);
    assert!(min.swap_retarget.is_none() && war.inventory.is_empty());

    // Warrior and Boss: +1d4 of the weapon's type only with Advantage
    for g in [war, boss] {
        let names: Vec<&str> = g.attacks.iter().map(|a| a.name).collect();
        assert_eq!(names, vec!["scimitar", "shortbow"]);
        for a in &g.attacks {
            assert_eq!((a.to_hit, a.damage), (4, Dice::new(1, 6, 2)));
            assert!(a.additional.is_empty());
            assert_eq!(a.additional_adv, vec![(Dice::new(1, 4, 0), a.damage_type)]);
            assert_eq!(a.npc_item, None);
        }
    }
    assert!(war.multiattack.is_empty());
    assert_eq!(
        boss.multiattack,
        vec![vec!["scimitar", "scimitar"], vec!["scimitar", "shortbow"], vec!["shortbow", "shortbow"]]
    );
    let r = boss.swap_retarget.as_ref().unwrap();
    assert_eq!((r.name, r.requires_sight, r.range, r.ally_sizes.clone()), ("redirect_attack", true, 5, vec!["small", "medium"]));
    assert!(war.swap_retarget.is_none());
}

/// Nimble Escape offers both bonus actions (Disengage first in canonical
/// order). In plain view the native AI scores both 0 and Disengage wins the
/// tie; out of every enemy's sight it scores Hide P(success) x the gain from
/// Advantage on the next attack (`HideBonusAction.ai_value`, N20-040 fixed)
/// and hides.
#[test]
fn nimble_escape_rows_and_the_native_hide_value() {
    let mut env = env_on(Grid::ember_vault(), &[("mara", 2, 6), ("ilyra", 2, 7), ("goblin_warrior-1", 6, 6)], 3);
    while env.fight.units[env.decision().unwrap().actor].id != "goblin_warrior-1" {
        end_turn(&mut env);
    }
    let d = env.decision().unwrap();
    let rd = row_of(&env, &Act::DisengageBonus).expect("disengage_bonus row");
    let rh = row_of(&env, &Act::HideBonus).expect("hide_bonus row");
    assert!(rd < rh, "canonical order: disengage_bonus first");
    let raw = d.native_raw.as_ref().unwrap();
    assert_eq!((raw[rd], raw[rh]), (0.0, 0.0));
    // spent: no Nimble Escape rows any more this turn
    env.step(rd).unwrap();
    assert!(row_of(&env, &Act::HideBonus).is_none() && row_of(&env, &Act::DisengageBonus).is_none());

    // out of sight (the other sealed corridor): DC 15 above passive
    // Perception 13, P(d20 + 6 >= 15) = 0.6; best target Ilyra (AC 12), +4
    // hits 13/20 straight and 1 - (7/20)^2 with Advantage; the Warrior's
    // 1d6+2 gains the 1d4 rider, the Minion's 1d4+2 dagger only the hit
    // chance, and a Minion without a dagger has no attack to gain anything
    let warrior = 0.6 * ((1.0 - 0.35f64 * 0.35) * (5.5 + 2.5) - 0.65 * 5.5);
    let minion = 0.6 * ((1.0 - 0.35f64 * 0.35) - 0.65) * 4.5;
    for (id, daggers, want) in [("goblin_warrior-1", None, warrior), ("goblin_minion-1", Some(3), minion), ("goblin_minion-1", Some(0), 0.0)] {
        let mut env = env_on(sealed(), &[("mara", 2, 2), ("ilyra", 3, 2), (id, 8, 5)], 1);
        if let Some(n) = daggers {
            env.fight.units[2].items[0] = n;
        }
        while env.fight.units[env.decision().unwrap().actor].id != id {
            end_turn(&mut env);
        }
        let d = env.decision().unwrap();
        let rh = row_of(&env, &Act::HideBonus).unwrap();
        let got = d.native_raw.as_ref().unwrap()[rh];
        assert!((got - want).abs() < 1e-12, "{id} {daggers:?}: {got} vs {want}");
        if want > 0.0 {
            assert_eq!(d.native_choice, Some(rh), "{id} hides first");
        }
    }

    let mut notes = Notes::default();
    for seed in 0..20u64 {
        let mut f = fight(
            &[("mara", 3, 7), ("ilyra", 2, 6), ("goblin_warrior-1", 12, 2), ("goblin_minion-1", 12, 6), ("skeleton-1", 13, 4)],
            seed,
        );
        f.run();
        notes.add(&f.notes);
    }
    assert!(notes.disengage_bonus > 0, "{notes:?}");
}

/// 2024 Hide: one Stealth d20 (+6); it fails in sight of a conscious enemy
/// or below 15. The bonus action is spent either way. A hidden goblin is not
/// seen by a hero (passive Perception 13 < the Stealth total) but by its
/// own side.
#[test]
fn hide_needs_cover_from_sight_and_dc_15() {
    // in plain view: never hidden
    for seed in 0..10u64 {
        let mut env = env_on(sealed(), &[("mara", 2, 2), ("ilyra", 3, 2), ("goblin_minion-1", 8, 2)], seed);
        while env.fight.units[env.decision().unwrap().actor].id != "goblin_minion-1" {
            end_turn(&mut env);
        }
        let g = env.decision().unwrap().actor;
        env.step(row_of(&env, &Act::HideBonus).unwrap()).unwrap();
        assert!(!env.fight.units[g].hidden() && env.fight.units[g].bonus == 0);
        assert_eq!(env.fight.notes.hide_attempts, 1);
    }
    // out of sight: hidden on a total of 15 or more
    let (mut hidden, mut failed) = (0, 0);
    for seed in 0..30u64 {
        let mut env = env_on(sealed(), &[("mara", 2, 2), ("ilyra", 3, 2), ("goblin_minion-1", 8, 5)], seed);
        while env.fight.units[env.decision().unwrap().actor].id != "goblin_minion-1" {
            end_turn(&mut env);
        }
        let g = env.decision().unwrap().actor;
        env.step(row_of(&env, &Act::HideBonus).unwrap()).unwrap();
        let u = &env.fight.units[g];
        assert_eq!(u.bonus, 0);
        if u.hidden() {
            hidden += 1;
            assert!(u.hidden_stealth.unwrap() >= 15);
            let f = &env.fight;
            for h in 0..2 {
                assert!(!f.can_see(h, g), "a hero sees a hidden goblin");
            }
            assert_eq!(masked_from(f, 0), 1 << g);
            assert_eq!(masked_from(f, 1), 0);
        } else {
            failed += 1;
            assert_eq!(u.hidden_stealth, None);
            assert_eq!(masked_from(&env.fight, 0), 0);
        }
    }
    assert!(hidden > 0 && failed > 0, "{hidden} hidden, {failed} failed");
}

/// The heroes' observation does not depend on where a hidden goblin is (the
/// per-team visibility mask); the goblins' own does, and so does the heroes'
/// when the goblin is not hidden (`ember-gen-v1` shows every position).
#[test]
fn hidden_goblin_positions_are_masked_from_the_heroes() {
    let obj = Objective::default();
    // the heroes' first decision after the goblin's turn (Hide or End Turn),
    // and the goblin's own view at its decision
    let views = |gx: i32, gy: i32, hide: bool, seed: u64| -> Option<(Obs, Obs, bool)> {
        let mut env =
            env_on(sealed(), &[("mara", 2, 2), ("ilyra", 3, 2), ("goblin_minion-1", gx, gy), ("goblin_warrior-1", 26, 5)], seed);
        let g = 2;
        let mut own = None;
        loop {
            let d = env.decision()?;
            if d.actor == g && own.is_none() {
                own = Some(Obs::of(&env, None, (0, 0), &obj).unwrap());
                if hide {
                    env.step(row_of(&env, &Act::HideBonus).unwrap()).unwrap();
                }
                end_turn(&mut env);
            } else if d.team == 0 && own.is_some() {
                let hero = Obs::of(&env, None, (0, 0), &obj).unwrap();
                return Some((hero, own.unwrap(), env.fight.units[g].hidden()));
            } else {
                end_turn(&mut env);
            }
        }
    };
    let player = |o: &Obs| {
        (o.creatures.clone(), o.creature_ids.clone(), o.creature_mask.clone(), o.map.clone(), o.global.clone(), o.cands.clone(),
         o.cand_ids.clone(), o.cand_tgt.clone(), o.cand_cell.clone(), o.creature_rel.clone())
    };
    let mut checked = 0;
    for seed in 0..40u64 {
        let (Some((ha, oa, hid_a)), Some((hb, ob, hid_b))) = (views(8, 5, true, seed), views(20, 6, true, seed)) else { continue };
        assert_eq!(hid_a, hid_b, "same dice, same Stealth total");
        assert_ne!(player(&oa), player(&ob), "the goblins see their own positions");
        if hid_a {
            // the policy inputs; the native arrays (`native_raw`,
            // `native_choice`: the native AI's scores, teacher targets
            // only) may read hidden positions, as natural20's AI does
            assert_eq!(player(&ha), player(&hb), "seed {seed}: a hidden goblin's square leaks into the heroes' view");
            assert_eq!(ha.actor, hb.actor);
            checked += 1;
        }
    }
    assert!(checked > 0);
    // not hidden: the heroes' view shows the goblin where it is
    let (ha, _, hid_a) = views(8, 5, false, 0).unwrap();
    let (hb, _, hid_b) = views(20, 6, false, 0).unwrap();
    assert!(!hid_a && !hid_b);
    assert_ne!(player(&ha), player(&hb));
}

/// A Minion throws its three daggers (hit or miss) and then has no Dagger
/// attack at all; a hero's thrown dagger that hits it lands at its square and
/// adds nothing (N20-041 fixed).
#[test]
fn minion_daggers() {
    let mut f = fight(&[("mara", 3, 6), ("ilyra", 2, 6), ("goblin_minion-1", 12, 4)], 0);
    let g = 2;
    assert_eq!(f.units[g].items, vec![3]);
    assert!(f.attack_available(g, 0) && f.attack_available(g, 1));
    f.units[g].items[0] = 0;
    assert!(!f.attack_available(g, 0) && !f.attack_available(g, 1), "no dagger: no melee row either");

    let (mut throws, mut empty) = (0, 0);
    let minions = ["goblin_minion-1", "goblin_minion-2", "goblin_minion-3", "goblin_minion-4"];
    for seed in 0..40u64 {
        let mut f = fight(
            &[("mara", 2, 7), ("ilyra", 2, 6), (minions[0], 12, 2), (minions[1], 13, 6), (minions[2], 14, 4), (minions[3], 14, 7)],
            seed,
        );
        f.prefer = vec!["goblin_minion:dagger".into()];
        // one dagger each (they rarely live to throw three)
        for u in 2..6 {
            f.units[u].items[0] = 1;
        }
        f.run();
        throws += f.notes.npc_throws;
        empty += (2..6).filter(|&u| f.units[u].items[0] == 0).count();
        let left: i32 = (2..6).map(|u| f.units[u].items[0]).sum();
        assert_eq!(left as u64 + f.notes.npc_throws, 4, "seed {seed}");
    }
    assert!(throws > 0 && empty > 0, "{throws} throws, {empty} out of daggers");

    // N20-041 fixed: Ilyra's thrown daggers (on these seeds they gave the
    // Minions daggers before the fix) never add to a Minion's count
    let thrown: u64 = (0..40u64)
        .map(|seed| {
            let mut f = fight(&[("mara", 3, 7), ("ilyra", 2, 6), ("goblin_minion-1", 12, 2), ("goblin_minion-2", 13, 6)], seed);
            f.prefer = vec!["ilyra:dagger".into()];
            f.run();
            let left: i32 = [2, 3].iter().map(|&u| f.units[u].items[0]).sum();
            assert_eq!(left as u64 + f.notes.npc_throws, 6, "seed {seed}");
            assert_eq!(f.notes.items_gained, 0);
            f.notes.thrown_spare + f.notes.thrown_held
        })
        .sum();
    assert!(thrown > 0);
}

/// Redirect Attack: a Boss next to a Small or Medium ally swaps places when
/// an attack roll would hit it; the ally becomes the target.
#[test]
fn redirect_attack() {
    let mut notes = Notes::default();
    for seed in 0..60u64 {
        let mut f = fight(&[("mara", 3, 6), ("ilyra", 2, 6), ("goblin_boss-1", 4, 6), ("goblin_minion-1", 5, 6)], seed);
        f.prefer = vec!["mara:longsword".into(), "ilyra:firebolt".into()];
        f.run();
        notes.add(&f.notes);
    }
    assert!(notes.redirects > 0, "{notes:?}");
    // no ally within 5 ft: never
    let mut notes = Notes::default();
    for seed in 0..30u64 {
        let mut f = fight(&[("mara", 3, 6), ("ilyra", 2, 6), ("goblin_boss-1", 4, 6)], seed);
        f.run();
        notes.add(&f.notes);
    }
    assert_eq!(notes.redirects, 0);
}

#[test]
fn goblin_mechanics_fail_closed() {
    let file = |p: &str| embedded_files().iter().find(|(q, _)| *q == p).unwrap().1;
    let vocab = vec![("vocab.json".to_string(), file("vocab.json").to_string())];
    for (id, from, to) in [
        ("goblin_warrior", "\"condition\": \"advantage\"", "\"condition\": \"flanking\""),
        ("goblin_boss", "\"id\": \"swap_retarget\"", "\"id\": \"parry\""),
        ("goblin_boss", "\"trigger\": \"attack_roll\"", "\"trigger\": \"damage\""),
        ("goblin_minion", "\"item\": \"dagger\"", "\"item\": \"sling\""),
        ("goblin_minion", "\"id\": \"nimble_escape\"", "\"id\": \"nimble_escape_x\""),
        ("goblin_minion", "\"thrown\": true", "\"thrown\": false"),
    ] {
        let path = format!("srd/{id}.json");
        let text = file(&path);
        let ok = ContentPool::from_sources(&[(path.clone(), text.to_string())], &vocab);
        assert!(ok.is_ok(), "{:?}", ok.err());
        let bad = text.replacen(from, to, 1);
        assert_ne!(bad, text, "{id}: pattern {from} not found");
        assert!(ContentPool::from_sources(&[(path, bad)], &vocab).is_err(), "{id}: {from} -> {to} loaded");
    }
}
