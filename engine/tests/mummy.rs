//! The SRD 5.2.1 Mummy (docs/GENERAL_ENV.md, "Mummy status"): content as
//! natural20 derives it, Rotting Fist's curse and death at 0 HP, Dreadful
//! Glare (a no-damage save action with immunity on success) and the
//! source-linked Frightened it applies until the end of the mummy's next
//! turn, Frightened's "can't approach" (N20-042), and the observation slots.
//! Exact parity with natural20 is checked by the fixture tapes
//! (`tests/fixtures.rs`, `fixtures/mummy_*`).

use std::sync::Arc;

use ember_rs::content::{embedded_files, ContentPool, Dice, OnHit};
use ember_rs::encode::{feature_names, Obs, Objective};
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

fn env_on(grid: Arc<Grid>, units: &[(&str, i32, i32)], seed: u64) -> Env {
    let (ids, pl) = placements(units);
    Env::from_units(ContentPool::global(), grid, &ids, &pl, 50, seed, [EXT, EXT], true).unwrap()
}

fn end_turn(env: &mut Env) {
    let n = env.decision().unwrap().legal.len();
    env.step(n - 1).unwrap();
}

fn unit(f: &Fight, id: &str) -> usize {
    f.units.iter().position(|u| u.id == id).unwrap()
}

#[test]
fn mummy_content() {
    let pool = ContentPool::global();
    let m = pool.template(pool.tid("mummy").unwrap());
    assert_eq!((m.ac, m.max_hp, m.speed, m.init_bonus, m.size), (11, 58, 20, -1, "medium"));
    assert!(m.undead && m.pfeg_protected && m.immune_frightened && m.immune_paralyzed);
    let names: Vec<&str> = m.attacks.iter().map(|a| a.name).collect();
    assert_eq!(names, vec!["rotting_fist", "dreadful_glare"]);
    let (fist, glare) = (&m.attacks[0], &m.attacks[1]);
    assert_eq!((fist.to_hit, fist.damage, fist.kill_at_zero, fist.no_damage), (5, Dice::new(1, 10, 3), true, false));
    assert_eq!(fist.additional.len(), 1);
    assert_eq!(fist.additional[0].0, Dice::new(3, 6, 0));
    assert!(matches!(fist.on_hit.as_slice(), [OnHit::Curse]));
    assert_eq!((glare.range, glare.no_damage, glare.save_immune, glare.kill_at_zero), (60, true, true, false));
    assert!(glare.save_attack.is_some_and(|(_, dc)| dc == 11));
    assert!(matches!(glare.on_hit.as_slice(), [OnHit::Frighten]));
    assert_eq!(m.multiattack, vec![vec!["rotting_fist", "rotting_fist", "dreadful_glare"]]);
    // only the two fists count towards the expected round damage
    assert_eq!(m.erd.1, 2);
}

/// Native fights: the mummies use Rotting Fist and Dreadful Glare (saves made
/// and failed), curse the heroes they hit and kill some at 0 HP; a cursed
/// creature regains nothing.
#[test]
fn native_mummy_fights() {
    let mut notes = Notes::default();
    for seed in 0..40u64 {
        let mut f = fight(&[("guy", 3, 7), ("elion", 2, 6), ("curogana", 2, 8), ("mummy-1", 12, 3), ("mummy-2", 12, 6)], seed);
        f.run();
        notes.add(&f.notes);
    }
    assert!(notes.glare_fail > 0 && notes.glare_save > 0, "{notes:?}");
    assert!(notes.curses > 0 && notes.kill_at_zero > 0, "{notes:?}");

    let mut f = fight(&[("guy", 3, 7), ("mummy-1", 12, 3)], 1);
    let g = unit(&f, "guy");
    f.units[g].hp = 10;
    f.units[g].cursed = true;
    f.heal(g, 5);
    assert_eq!(f.units[g].hp, 10);
    assert!(f.digest().units[g].fx.contains(&"heal_override:1".to_string()));
}

/// An open 16x10 room.
fn room() -> Arc<Grid> {
    let mut rows = vec!["H".repeat(16)];
    rows.extend((0..8).map(|_| format!("H{}H", ".".repeat(14))));
    rows.push("H".repeat(16));
    Arc::new(Grid::from_rows(&rows).unwrap())
}

/// Frightened (N20-042): once a mummy frightens the hero, no move row brings
/// it closer (grid distance) to that mummy, step by step; the observation's
/// global slot shows Frightened's Disadvantage.
#[test]
fn frightened_heroes_cannot_approach() {
    let mut env = env_on(room(), &[("guy", 3, 5), ("mummy-1", 11, 5)], 2);
    while env.fight.units[env.decision().unwrap().actor].id != "guy" {
        end_turn(&mut env);
    }
    let names = feature_names();
    let gi = |n: &str| names.global.iter().position(|x| *x == n).unwrap();
    let (g, m) = (unit(&env.fight, "guy"), unit(&env.fight, "mummy-1"));
    let src = env.fight.units[m].pos;
    let cheb = |a: (i32, i32)| (a.0 - src.0).abs().max((a.1 - src.1).abs());
    let approaches = |p: &Vec<(i32, i32)>| p.windows(2).any(|w| cheb(w[1]) < cheb(w[0]));
    let obs_free = Obs::of(&env, None, (0, 0), &Objective::default()).unwrap();
    assert_eq!(obs_free.global[gi("actor_fear_disadvantage")], 0.0);
    let free = env.fight.clone().external_decision(g, false, 0).legal;
    assert!(free.iter().any(|a| matches!(a, Act::Move(p) if approaches(p))));

    let mut env2 = env.clone();
    env2.fight.apply_source_fear(g, m);
    assert!(!env2.fight.units[g].source_fear.is_empty());
    let rows = env2.fight.clone().external_decision(g, false, 0).legal;
    assert!(rows.iter().any(|a| matches!(a, Act::Move(_))));
    for a in &rows {
        if let Act::Move(p) = a {
            assert!(!approaches(p), "{a:?}");
        }
    }
    let obs = Obs::of(&env2, None, (0, 0), &Objective::default()).unwrap();
    assert_eq!(obs.global[gi("actor_fear_disadvantage")], 1.0);
    assert_ne!(obs.digest(), obs_free.digest());
}

#[test]
fn mummy_mechanics_fail_closed() {
    let (_, text) = embedded_files().iter().find(|(p, _)| *p == "srd/mummy.json").unwrap();
    let (_, vocab) = embedded_files().iter().find(|(p, _)| *p == "vocab.json").unwrap();
    let v = vec![("vocab.json".to_string(), vocab.to_string())];
    let ok = ContentPool::from_sources(&[("srd/mummy.json".into(), text.to_string())], &v);
    assert!(ok.is_ok(), "{:?}", ok.err());
    for (from, to) in [
        ("\"id\": \"frighten\"", "\"id\": \"terrify\""),
        ("\"no_damage\": true", "\"no_damage\": false"),
        ("\"damage\": \"0\"", "\"damage\": \"1d4\""),
        ("\"id\": \"curse\"", "\"id\": \"frighten\""),
    ] {
        let bad = text.replacen(from, to, 1);
        assert_ne!(&bad, text, "pattern {from} not found");
        let r = ContentPool::from_sources(&[("srd/mummy.json".into(), bad)], &v);
        assert!(r.is_err(), "{from} -> {to} loaded");
    }
}

/// `ember-gen-v2` (GENERAL_ENV.md "ember-gen-v2"): the per-creature curse,
/// who is frightened of whom, Glare immunity per (creature, mummy), what
/// each creature's attacks inflict, and the rider descriptors and estimates
/// of Rotting Fist and Dreadful Glare rows; a frightened hero's move rows
/// say whether the destination still sees the mummy.
#[test]
fn v2_observes_curse_fear_and_riders() {
    use ember_rs::encode::{Version, N, R};
    let names = feature_names();
    let pos = |list: &[&str], n: &str| list.iter().position(|x| *x == n).unwrap_or_else(|| panic!("{n}"));
    let (fc, fa) = (names.creature.len(), names.cand.len());
    let tok = |o: &Obs, i: usize, n: &str| o.creatures[i * fc + pos(names.creature, n)];
    let cand = |o: &Obs, r: usize, n: &str| o.cands[r * fa + pos(names.cand, n)];
    let rel = |o: &Obs, i: usize, j: usize, n: &str| o.creature_rel[(i * N + j) * R + pos(names.relations, n)];
    // mummy-1 next to Guy and Elion; mummy-2 across the room
    let mut env = env_on(room(), &[("guy", 3, 5), ("elion", 3, 4), ("mummy-1", 4, 5), ("mummy-2", 11, 5)], 3);
    while env.fight.units[env.decision().unwrap().actor].id != "mummy-1" {
        end_turn(&mut env);
    }
    let (g, e, m1, m2) = (unit(&env.fight, "guy"), unit(&env.fight, "elion"), unit(&env.fight, "mummy-1"), unit(&env.fight, "mummy-2"));
    let clean = Obs::of(&env, None, (0, 0), &Objective::default()).unwrap();
    assert_eq!(clean.version, Version::V2);
    assert!(clean.creature_rel.chunks(R).all(|x| x[0] == 0 && x[1] == 0), "no fear, no immunity yet");
    // Guy cursed and frightened of mummy-2; Elion saved against mummy-1's Glare
    env.fight.units[g].cursed = true;
    env.fight.apply_source_fear(g, m2);
    env.fight.units[e].save_immune_to.push((m1, "dreadful_glare"));
    let o = Obs::of(&env, None, (0, 0), &Objective::default()).unwrap();
    assert_eq!((tok(&o, g, "cursed"), tok(&o, e, "cursed"), tok(&o, m1, "cursed")), (1.0, 0.0, 0.0));
    assert_eq!(rel(&o, g, m2, "frightened_of"), 1);
    assert_eq!(rel(&o, g, m1, "frightened_of"), 0);
    assert_eq!((tok(&o, g, "fear_sources_div4"), tok(&o, m2, "frightens_div4"), tok(&o, m1, "frightens_div4")), (0.25, 0.25, 0.0));
    assert_eq!(tok(&o, g, "fear_disadvantage"), 1.0, "mummy-2 in sight");
    assert_eq!(tok(&o, g, "fears_actor"), 0.0, "frightened of mummy-2, not the actor");
    assert_eq!(rel(&o, e, m1, "save_immune"), 1);
    assert_eq!(rel(&o, e, m2, "save_immune"), 0);
    assert_eq!((tok(&o, e, "save_immune_to_actor"), tok(&o, g, "save_immune_to_actor")), (1.0, 0.0));
    for (i, want) in [(g, 0.0), (e, 0.0), (m1, 1.0), (m2, 1.0)] {
        for n in ["atk_curse", "atk_frighten", "atk_kill_at_zero", "atk_save"] {
            assert_eq!(tok(&o, i, n), want, "{n} of {i}");
        }
    }
    assert_eq!(rel(&o, g, m1, "in_reach"), 1);
    assert_eq!(rel(&o, g, m2, "in_reach"), 0);
    assert_eq!(rel(&o, g, m2, "sees"), 1);
    assert_eq!(o.global[pos(names.global, "enemy_cursed_div4")], 0.25);
    // the rows: Rotting Fist curses and kills at 0 HP (no curse estimate on
    // the cursed Guy); Dreadful Glare frightens, deals no damage, and a save
    // makes the target immune
    let d = env.decision().unwrap();
    let (mut fists, mut glares) = (0, 0);
    for (r, act) in d.legal.iter().enumerate() {
        let Act::Attack { atk, target, .. } = act else {
            for n in ["rider_curse", "rider_frighten", "kill_at_zero", "no_damage", "immune_on_save", "p_curse", "p_frighten"] {
                assert_eq!(cand(&o, r, n), 0.0, "{n} on {act:?}");
            }
            continue;
        };
        let p = cand(&o, r, "p_success");
        match env.fight.units[m1].t.attacks[*atk].name {
            "rotting_fist" => {
                fists += 1;
                assert_eq!((cand(&o, r, "rider_curse"), cand(&o, r, "kill_at_zero"), cand(&o, r, "rider_frighten")), (1.0, 1.0, 0.0));
                assert_eq!((cand(&o, r, "no_damage"), cand(&o, r, "immune_on_save")), (0.0, 0.0));
                assert_eq!(cand(&o, r, "p_curse"), if *target == g { 0.0 } else { p }, "target {target}");
                assert!(p > 0.0);
            }
            "dreadful_glare" => {
                glares += 1;
                assert_eq!((cand(&o, r, "rider_frighten"), cand(&o, r, "no_damage"), cand(&o, r, "immune_on_save")), (1.0, 1.0, 1.0));
                assert_eq!((cand(&o, r, "rider_curse"), cand(&o, r, "kill_at_zero"), cand(&o, r, "p_curse")), (0.0, 0.0, 0.0));
                assert_eq!(cand(&o, r, "p_frighten"), p);
                assert!(p > 0.0);
            }
            other => panic!("{other}"),
        }
    }
    assert!(fists >= 2 && glares >= 1, "{fists} fists, {glares} glares");

    // a frightened hero: its move rows say whether the destination sees the
    // mummy (a wall in the middle of the room hides it from some squares)
    let mut rows = vec!["H".repeat(16)];
    for y in 1..9 {
        let mid = if (3..=6).contains(&y) { "HH" } else { ".." };
        rows.push(format!("H{}{}{}H", ".".repeat(6), mid, ".".repeat(6)));
    }
    rows.push("H".repeat(16));
    let walled = Arc::new(Grid::from_rows(&rows).unwrap());
    let mut env = env_on(walled, &[("guy", 6, 2), ("mummy-1", 11, 5)], 2);
    while env.fight.units[env.decision().unwrap().actor].id != "guy" {
        end_turn(&mut env);
    }
    let (g, m) = (unit(&env.fight, "guy"), unit(&env.fight, "mummy-1"));
    let free = Obs::of(&env, None, (0, 0), &Objective::default()).unwrap();
    for r in 0..free.k {
        assert_eq!(cand(&free, r, "dest_sees_fear_source"), 0.0, "not frightened");
    }
    env.fight.apply_source_fear(g, m);
    let o = Obs::of(&env, None, (0, 0), &Objective::default()).unwrap();
    assert_eq!(rel(&o, g, m, "frightened_of"), 1);
    assert_eq!(tok(&o, m, "feared_by_actor"), 1.0);
    let src = env.fight.units[m].pos;
    let (mut seen, mut hidden) = (0, 0);
    for (r, act) in env.decision().unwrap().legal.iter().enumerate() {
        let want = match act {
            Act::Move(path) => {
                let s = env.fight.grid.los(*path.last().unwrap(), src);
                if s { seen += 1 } else { hidden += 1 }
                s as u8 as f32
            }
            _ => 0.0,
        };
        assert_eq!(cand(&o, r, "dest_sees_fear_source"), want, "{act:?}");
    }
    assert!(seen > 0 && hidden > 0, "{seen} seen, {hidden} hidden");
}
