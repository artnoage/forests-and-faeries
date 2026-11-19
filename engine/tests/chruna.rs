//! Chruna, the level-3 SRD 5.2.1 Barbarian (Path of the Berserker;
//! docs/GENERAL_ENV.md "Chruna (the Barbarian)"): content as natural20
//! derives it, the 2024 Rage (resistance, Rage Damage, Strength save
//! Advantage, duration and extension, the end on Incapacitated), Reckless
//! Attack, Danger Sense, Frenzy and the Cleave mastery, and the native AI's
//! use of them. Exact parity with natural20 is checked by the fixture tapes
//! (`tests/fixtures.rs`, `fixtures/chruna_*`).

use std::sync::Arc;

use ember_rs::content::{embedded_files, Ability, ContentPool, Dice, Dmg};
use ember_rs::encode::{feature_names, Obs, Objective};
use ember_rs::engine::{Act, Fight, Notes, St};
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

/// An open 16x10 room.
fn room() -> Arc<Grid> {
    let mut rows = vec!["H".repeat(16)];
    rows.extend((0..8).map(|_| format!("H{}H", ".".repeat(14))));
    rows.push("H".repeat(16));
    Arc::new(Grid::from_rows(&rows).unwrap())
}

fn fight(units: &[(&str, i32, i32)], seed: u64) -> Fight {
    let (ids, pl) = placements(units);
    Fight::on_map(ContentPool::global(), room(), &ids, &pl, 50, Trace::free(seed)).unwrap()
}

fn env_on(units: &[(&str, i32, i32)], seed: u64) -> Env {
    let (ids, pl) = placements(units);
    Env::from_units(ContentPool::global(), room(), &ids, &pl, 50, seed, [EXT, EXT], true).unwrap()
}

fn end_turn(env: &mut Env) {
    let n = env.decision().unwrap().legal.len();
    env.step(n - 1).unwrap();
}

fn unit(f: &Fight, id: &str) -> usize {
    f.units.iter().position(|u| u.id == id).unwrap()
}

fn to_turn_of(env: &mut Env, id: &str) {
    while env.fight.units[env.decision().unwrap().actor].id != id {
        end_turn(env);
    }
}

fn row_of(env: &Env, pred: impl Fn(&Act) -> bool) -> Option<usize> {
    env.decision().unwrap().legal.iter().position(pred)
}

#[test]
fn chruna_content() {
    let pool = ContentPool::global();
    let c = pool.template(pool.tid("chruna").unwrap());
    assert_eq!((c.ac, c.max_hp, c.speed, c.init_bonus, c.init_adv, c.melee_ft), (16, 32, 30, 4, false, Some(10)));
    assert_eq!(c.abil, [17, 14, 14, 10, 12, 8]);
    assert!(c.barbarian && c.reckless_attack && c.danger_sense && c.frenzy && c.savage_attacker);
    assert_eq!((c.rage_uses, c.rage_damage, c.heavy_armor), (3, 2, false));
    assert!(!c.fighter && c.caster.is_none());
    let names: Vec<&str> = c.attacks.iter().map(|a| a.name).collect();
    assert_eq!(names, vec!["halberd", "unarmed_attack"]);
    let h = &c.attacks[0];
    assert_eq!((h.to_hit, h.damage, h.range, h.range_max, h.damage_type), (5, Dice::new(1, 10, 3), 10, 10, Dmg::Slashing));
    assert!(h.cleave && h.savage && !h.gwf && !h.thrown && h.graze.is_none() && !h.sap);
    assert!(!c.attacks[1].cleave);
}

#[test]
fn chruna_content_fails_closed() {
    let (_, text) = embedded_files().iter().find(|(p, _)| *p == "srd/chruna.json").unwrap();
    let (_, vocab) = embedded_files().iter().find(|(p, _)| *p == "vocab.json").unwrap();
    let v = vec![("vocab.json".to_string(), vocab.to_string())];
    let ok = ContentPool::from_sources(&[("srd/chruna.json".into(), text.to_string())], &v);
    assert!(ok.is_ok(), "{:?}", ok.err());
    for (from, to) in [
        ("\"model\": \"2024\"", "\"model\": \"2014\""),
        ("\"id\": \"frenzy\"", "\"id\": \"mindless_rage\""),
        ("\"cleave\"", "\"topple\""),
        ("\"heavy_armor\": false", "\"heavy_armor\": null"),
    ] {
        let bad = text.replacen(from, to, 1);
        assert_ne!(&bad, text, "pattern {from} not found");
        let r = ContentPool::from_sources(&[("srd/chruna.json".into(), bad)], &v);
        assert!(r.is_err(), "{from} -> {to} loaded");
    }
}

/// Native fights: Chruna rages, attacks recklessly, rolls Frenzy dice and
/// cleaves; rages end when not extended or when she drops.
#[test]
fn native_chruna_fights() {
    let mut notes = Notes::default();
    for seed in 0..60u64 {
        let mut f = fight(
            &[("chruna", 3, 5), ("elion", 2, 4), ("skeleton-1", 11, 4), ("skeleton-2", 11, 6), ("zombie-1", 12, 5), ("ghoul-1", 12, 3)],
            seed,
        );
        f.run();
        notes.add(&f.notes);
    }
    assert!(notes.rages > 0 && notes.reckless > 0 && notes.frenzy_hits > 0, "{notes:?}");
    assert!(notes.cleave_windows > 0 && notes.cleaves > 0, "{notes:?}");
    assert!(notes.rage_lapsed + notes.rage_incapacitated > 0, "{notes:?}");
}

/// Rage: a bonus action (a use spent), Resistance to bludgeoning, piercing
/// and slashing, +2 damage on Strength attacks, Advantage on Strength saves;
/// it lapses at the end of a turn without an attack roll on an enemy or the
/// Extend Rage bonus action, and ends at once when she drops.
#[test]
fn rage_rules() {
    let mut env = env_on(&[("chruna", 3, 5), ("skeleton-1", 12, 5)], 5);
    to_turn_of(&mut env, "chruna");
    let c = unit(&env.fight, "chruna");
    assert!(row_of(&env, |a| matches!(a, Act::ExtendRage)).is_none());
    let (_, d0, _) = env.fight.attack_numbers(c, 0);
    let r = row_of(&env, |a| matches!(a, Act::Rage)).expect("rage row");
    env.step(r).unwrap();
    let u = &env.fight.units[c];
    assert!(u.raging && u.rage_extended && u.rage_count == 2 && u.bonus == 0);
    assert!(env.fight.is_raging(c));
    assert!(row_of(&env, |a| matches!(a, Act::Rage | Act::ExtendRage)).is_none(), "bonus action spent");
    let (_, d1, _) = env.fight.attack_numbers(c, 0);
    assert_eq!(d1.modifier, d0.modifier + 2);
    // Cleave's extra attack: no positive ability modifier, Rage Damage kept
    assert_eq!(env.fight.attack_numbers_ex(c, 0, true).1.modifier, 2);
    assert!(env.fight.resists(c, Dmg::Slashing) && env.fight.resists(c, Dmg::Piercing) && !env.fight.resists(c, Dmg::Fire));
    let hp = env.fight.units[c].hp;
    env.fight.take_damage(c, 7, Dmg::Bludgeoning, false, None, None);
    assert_eq!(env.fight.units[c].hp, hp - 3);
    // her next turn: no attack roll, no Extend Rage -> the rage lapses at its end
    end_turn(&mut env);
    to_turn_of(&mut env, "chruna");
    assert!(env.fight.units[c].raging && !env.fight.units[c].rage_extended);
    let mut lapsed = env.clone();
    end_turn(&mut lapsed);
    assert!(!lapsed.fight.units[c].raging, "not extended");
    // Extend Rage keeps it
    let r = row_of(&env, |a| matches!(a, Act::ExtendRage)).expect("extend_rage row");
    env.step(r).unwrap();
    end_turn(&mut env);
    assert!(env.fight.units[c].raging);
    // Incapacitated ends it at once
    env.fight.units[c].hp = 1;
    env.fight.take_damage(c, 5, Dmg::Fire, false, None, None);
    assert!(env.fight.units[c].has(St::Unconscious));
    assert!(!env.fight.units[c].raging);
}

/// Reckless Attack: before the turn's first attack roll; Advantage on her
/// Strength attack rolls and on attack rolls against her.
#[test]
fn reckless_attack_rules() {
    let mut env = env_on(&[("chruna", 3, 5), ("skeleton-1", 5, 5)], 7);
    to_turn_of(&mut env, "chruna");
    let (c, s) = (unit(&env.fight, "chruna"), unit(&env.fight, "skeleton-1"));
    let h = &env.fight.units[c].t.attacks[0];
    assert_eq!(env.fight.advantage(c, s, h), (false, false));
    let r = row_of(&env, |a| matches!(a, Act::RecklessAttack)).expect("reckless row");
    env.step(r).unwrap();
    assert!(env.fight.units[c].reckless);
    let h = &env.fight.units[c].t.attacks[0];
    assert_eq!(env.fight.advantage(c, s, h), (true, false));
    let sk = &env.fight.units[s].t.attacks[0];
    assert_eq!(env.fight.advantage(s, c, sk).0, true, "attacks against her have Advantage");
    assert!(row_of(&env, |a| matches!(a, Act::RecklessAttack)).is_none());
}

/// Danger Sense: Advantage on Dexterity saves; Rage: on Strength saves.
#[test]
fn save_advantages() {
    let mut f = fight(&[("chruna", 3, 5), ("skeleton-1", 12, 5)], 3);
    f.start();
    let c = unit(&f, "chruna");
    let draws = |f: &mut Fight, ab: Ability| {
        let mut g = f.clone();
        g.trace = Trace::recording(11);
        g.save_throw(c, ab);
        g.trace
            .recorded()
            .into_iter()
            .filter_map(|e| match e {
                ember_rs::tape::Ev::Draw { mode, .. } => Some(mode),
                _ => None,
            })
            .collect::<Vec<_>>()
    };
    assert_eq!(draws(&mut f, Ability::Dex), vec!["a"]);
    assert_eq!(draws(&mut f, Ability::Str), vec!["n"]);
    f.units[c].raging = true;
    assert_eq!(draws(&mut f, Ability::Str), vec!["a"]);
    assert_eq!(draws(&mut f, Ability::Con), vec!["n"]);
}

/// Cleave: a hit opens one free attack on a second creature within 5 ft of
/// the first and within her 10 ft reach; any other action closes the window.
#[test]
fn cleave_window() {
    let mut opened = 0;
    for seed in 0..40u64 {
        let mut env = env_on(&[("chruna", 3, 5), ("skeleton-1", 5, 5), ("skeleton-2", 5, 6), ("skeleton-3", 9, 5)], seed);
        to_turn_of(&mut env, "chruna");
        let c = unit(&env.fight, "chruna");
        let s1 = unit(&env.fight, "skeleton-1");
        let Some(r) = row_of(&env, |a| matches!(a, Act::Attack { atk: 0, target, .. } if *target == s1)) else { continue };
        env.step(r).unwrap();
        let Some((atk, cands)) = env.fight.units[c].cleave.clone() else { continue };
        opened += 1;
        assert_eq!(atk, 0);
        assert_eq!(cands, vec![unit(&env.fight, "skeleton-2")], "skeleton-3 is out of reach");
        let rows: Vec<String> =
            env.decision().unwrap().legal.iter().filter(|a| matches!(a, Act::Cleave { .. })).map(|a| env.fight.describe(c, a)).collect();
        assert_eq!(rows, vec!["cleave:>skeleton-2".to_string()]);
        // a move closes it
        let mut moved = env.clone();
        if let Some(m) = row_of(&moved, |a| matches!(a, Act::Move(_))) {
            moved.step(m).unwrap();
            assert!(moved.fight.units[c].cleave.is_none());
        }
        let r = row_of(&env, |a| matches!(a, Act::Cleave { .. })).unwrap();
        let action = env.fight.units[c].action;
        env.step(r).unwrap();
        let u = &env.fight.units[c];
        assert!(u.cleave.is_none() && u.cleave_used && u.action == action, "free, once per turn");
    }
    assert!(opened > 5, "{opened}");
}

/// The observation (v2 layout unchanged): the new kinds have their own
/// vocabulary ids; a Cleave row is a weapon row with no cost.
#[test]
fn chruna_rows_in_the_observation() {
    let names = feature_names();
    let fa = names.cand.len();
    let pos = |n: &str| names.cand.iter().position(|x| *x == n).unwrap();
    let mut env = env_on(&[("chruna", 3, 5), ("skeleton-1", 5, 5)], 9);
    to_turn_of(&mut env, "chruna");
    let o = Obs::of(&env, None, (0, 0), &Objective::default()).unwrap();
    let d = env.decision().unwrap();
    let r = d.legal.iter().position(|a| matches!(a, Act::Rage)).unwrap();
    assert_eq!((o.cands[r * fa + pos("uses_bonus_action")], o.cands[r * fa + pos("buff")]), (1.0, 1.0));
    let r = d.legal.iter().position(|a| matches!(a, Act::RecklessAttack)).unwrap();
    assert_eq!(o.cands[r * fa + pos("no_cost")], 1.0);
}

#[test]
fn web_arena_move_closes_cleave_window() {
    use ember_rs::present::{LevelInput, WebArena};
    use serde_json::json;

    let mut rows = vec!["H".repeat(10)];
    rows.extend((0..5).map(|_| format!("H{}H", ".".repeat(8))));
    rows.push("H".repeat(10));
    let level = LevelInput {
        encounter_id: "test".into(),
        preset_id: "p".into(),
        theme: "ossuary".into(),
        map_name: "test".into(),
        rows,
        scene: json!({"props": []}),
        level_view: json!({"id": "test", "preset": "p"}),
        heroes: vec!["chruna".into()],
        monsters: vec![
            ("zombie-1".into(), "zombie".into(), "Zombie 1".into()),
            ("zombie-2".into(), "zombie".into(), "Zombie 2".into()),
        ],
        suggested_placements: vec![
            Placement { id: "chruna".into(), x: 2, y: 3 },
            Placement { id: "zombie-1".into(), x: 3, y: 3 },
            Placement { id: "zombie-2".into(), x: 3, y: 4 },
        ],
    };

    let mut closed = 0;
    for seed in 1..30u64 {
        let mut arena = WebArena::new(level.clone(), seed, 0, "csrf".into(), "enc".into()).unwrap();
        let mut st = arena.start().unwrap();
        while st["turn_id"].as_str() != Some("chruna") && !arena.finished {
            st = arena.advance(true).unwrap();
        }
        if arena.finished {
            continue;
        }
        let acts = st["actions"].as_array().unwrap().clone();
        let Some(atk_id) = acts.iter().find_map(|a| {
            (a["kind"] == "attack" && a["target_id"] == "zombie-1").then(|| a["id"].as_str().unwrap().to_string())
        }) else {
            continue;
        };
        st = arena.perform(&atk_id).unwrap();
        let acts_after_hit = st["actions"].as_array().unwrap();
        if !acts_after_hit.iter().any(|a| a["kind"] == "cleave") {
            continue;
        }
        let move_id = acts_after_hit
            .iter()
            .find_map(|a| (a["kind"] == "move").then(|| a["id"].as_str().unwrap().to_string()))
            .expect("5-ft move available");
        st = arena.perform(&move_id).unwrap();
        let acts_after_move = st["actions"].as_array().unwrap();
        assert!(!acts_after_move.iter().any(|a| a["kind"] == "cleave"), "move must close Cleave window");
        closed += 1;
    }
    assert!(closed >= 3, "expected at least 3 seeds opening Cleave; got {closed}");
}
