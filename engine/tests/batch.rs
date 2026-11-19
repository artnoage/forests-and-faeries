//! The batched environment's slot logic (`batch.rs`), the catalog
//! (`catalog.rs`), zone layouts (`layout.rs`) and per-creature control
//! (GENERAL_ENV.md "G6 status").

use std::sync::Arc;

use ember_rs::batch::{EnvConfig, EpisodeSpec, Game, UnitRef};
use ember_rs::catalog::{Catalog, Entry};
use ember_rs::content::ContentPool;
use ember_rs::env::{Chooser, Controller};
use ember_rs::replay::{install_quiet_hook, replay_tape, Outcome};
use ember_rs::spec::EncounterSpec;

const EXT: Controller = Controller::External;
const NAT: Controller = Controller::Native;

fn cfg(scores: bool, health: bool, max_steps: u64) -> EnvConfig {
    EnvConfig { scores, health, max_rounds: 30, standing_weight: 0.5, max_steps }
}

fn spec(id: &str, seed: u64) -> EpisodeSpec {
    EpisodeSpec { encounter: id.into(), map_seed: 0, layout_seed: seed * 7 + 1, dice_seed: seed * 13 + 5, offset_x: -1, offset_y: -1 }
}

fn catalog() -> Catalog {
    Catalog::builtin(ContentPool::global()).unwrap()
}

fn play(game: &mut Game, cfg: &EnvConfig, pick: &mut Chooser) -> usize {
    let mut n = 0;
    while !game.done() {
        let row = pick.pick(game.env.decision().unwrap());
        game.step(row, cfg).unwrap();
        n += 1;
    }
    n
}

fn replays(game: &Game) {
    let tape = game.record(ContentPool::global()).unwrap();
    match replay_tape(&tape) {
        Outcome::Match { .. } => {}
        Outcome::Diverged(d) => panic!("{} diverged: {d}", game.entry.id),
        Outcome::Incomplete { consumed, remaining } => panic!("{}: incomplete {consumed} {remaining}", game.entry.id),
        Outcome::Crashed(e) | Outcome::Setup(e) => panic!("{}: {e}", game.entry.id),
    }
}

#[test]
fn builtin_catalog_places_valid_specs() {
    let pool = ContentPool::global();
    let cat = catalog();
    assert_eq!(cat.entries.len(), 144);
    for e in &cat.entries {
        for seed in 0..12u64 {
            let placed = e.place(seed * 1_000_003).unwrap();
            let json = e.spec_json(&placed);
            let spec: EncounterSpec = serde_json::from_value(json.clone()).unwrap();
            let enc = spec.validate(pool).unwrap();
            assert_eq!(enc.units, e.units);
            let sides: Vec<u8> = e.sides.clone();
            let pos: Vec<Option<(i32, i32)>> = placed.placements.iter().map(|p| Some((p.x, p.y))).collect();
            assert!(ember_rs::layout::any_hero_sees_monster(&e.grid, &sides, &pos), "{} seed {seed}", e.id);
            assert_eq!(json["layout"]["rule"], "zone");
        }
    }
}

#[test]
fn catalog_rows_are_checked() {
    let pool = ContentPool::global();
    let ok = r#"{"id":"a","map":"room_12x10","party":["mara"],"roster":["zombie","skeleton","zombie"]}"#;
    let cat = Catalog::from_jsonl(ok, pool).unwrap();
    assert_eq!(cat.get("a").unwrap().units, ["mara", "zombie-1", "skeleton-1", "zombie-2"]);
    let fixed = r#"{"id":"f","spec":{"version":1,"map":{"name":"m","rows":["......","......"]},
        "heroes":[{"id":"guy","content":"guy","x":0,"y":0}],"monsters":[{"id":"zombie-1","content":"zombie","x":5,"y":1}]},
        "layout":{"rule":"fixed"},"max_rounds":7}"#
        .replace('\n', "");
    let cat = Catalog::from_jsonl(&fixed, pool).unwrap();
    let e = cat.get("f").unwrap();
    assert_eq!(e.max_rounds, Some(7));
    assert_eq!(e.place(99).unwrap().placements[1].x, 5);
    for bad in [
        r#"{"id":"b","map":"nowhere","party":["mara"],"roster":["zombie"]}"#,
        r#"{"id":"b","map":"vault","party":["zombie"],"roster":["zombie"]}"#,
        r#"{"id":"b","map":"vault","party":["mara"],"roster":["dragon"]}"#,
        r#"{"id":"b","map":"vault","party":["mara"],"roster":[]}"#,
        r#"{"id":"b","map":"vault","party":["mara","mara"],"roster":["zombie"]}"#,
        r#"{"id":"b","map":"vault","party":["mara"],"roster":["zombie"],"layout":{"rule":"scatter"}}"#,
        r#"{"id":"b","map":"vault","party":["mara"],"roster":["zombie"],"layout":{"rule":"fixed"}}"#,
        r#"{"id":"b","map":{"rows":["..H..", "..H.."]},"party":["mara"],"roster":["zombie"]}"#,
    ] {
        assert!(Catalog::from_jsonl(bad, pool).is_err(), "{bad}");
    }
    let dup = format!("{ok}\n{ok}");
    assert!(Catalog::from_jsonl(&dup, pool).is_err());
}

/// One external creature per game, all maps, both parties: only its
/// decisions surface, the info invariants hold, and the game records to a
/// tape that replays.
#[test]
fn per_creature_control_plays_and_records() {
    install_quiet_hook();
    let pool = ContentPool::global();
    let cat = catalog();
    let c = cfg(true, true, 4096);
    let mut games = 0;
    for (k, e) in cat.entries.iter().enumerate().filter(|(k, _)| k % 9 == 0) {
        let n = e.units.len();
        let unit = k % n;
        let s = spec(&e.id, k as u64);
        let mut game = Game::new(e, &s, [NAT, NAT], &[UnitRef::Index(unit)], &c, pool).unwrap();
        let mut pick = Chooser::parse(if k % 2 == 0 { "uniform" } else { "eps:0.3" }, k as u64).unwrap();
        while !game.done() {
            let d = game.env.decision().unwrap();
            assert_eq!(d.actor, unit);
            let info = game.info(&c);
            assert_eq!((info.team, info.actor), (e.sides[unit] as i8, unit as i16));
            let row = pick.pick(d);
            game.step(row, &c).unwrap();
        }
        let info = game.info(&c);
        assert!(info.done && (info.terminated ^ info.truncated) && info.potential == 0.0);
        assert!(info.task_end == 1 || (info.task_end == 2 && info.round == 31));
        replays(&game);
        // the same creature by unit id
        let by_id = Game::new(e, &s, [NAT, NAT], &[UnitRef::Id(e.units[unit].clone())], &c, pool).unwrap();
        assert_eq!(by_id.env.decision().map(|d| d.actor), Game::new(e, &s, [NAT, NAT], &[UnitRef::Index(unit)], &c, pool).unwrap().env.decision().map(|d| d.actor));
        games += 1;
    }
    assert!(games >= 16);
    let e = cat.get("vault-undead-skel3").unwrap();
    assert!(Game::new(e, &spec(&e.id, 0), [NAT, NAT], &[UnitRef::Index(6)], &c, pool).is_err());
    assert!(Game::new(e, &spec(&e.id, 0), [NAT, NAT], &[UnitRef::Id("dragon-1".into())], &c, pool).is_err());
}

/// External creatures taking the native choice play exactly the all-native
/// game (same outcome, draws and actions).
#[test]
fn native_choice_equals_native_play() {
    let pool = ContentPool::global();
    let cat = catalog();
    let c = cfg(true, true, 1 << 20);
    for (k, e) in cat.entries.iter().enumerate().filter(|(k, _)| k % 11 == 0) {
        let s = spec(&e.id, 100 + k as u64);
        let native = Game::new(e, &s, [NAT, NAT], &[], &c, pool).unwrap();
        assert!(native.done() && native.reset_terminal);
        for (teams, units) in [([EXT, EXT], vec![]), ([NAT, NAT], vec![UnitRef::Index(k % e.units.len())]), ([EXT, NAT], vec![UnitRef::Index(e.units.len() - 1)])] {
            let mut g = Game::new(e, &s, teams, &units, &c, pool).unwrap();
            let mut pick = Chooser::parse("native", 0).unwrap();
            play(&mut g, &c, &mut pick);
            assert_eq!(g.env.outcome(), native.env.outcome(), "{}", e.id);
            assert_eq!(g.env.fight.trace.draws, native.env.fight.trace.draws);
            assert_eq!(g.env.counts.turns, native.env.counts.turns);
            assert_eq!(g.info(&c).score, native.info(&c).score);
        }
    }
}

#[test]
fn snapshots_reseeds_step_cap_and_partial_tapes() {
    install_quiet_hook();
    let pool = ContentPool::global();
    let cat = catalog();
    let e: &Arc<Entry> = cat.get("room_12x10-level2-ghoul1_skel2").unwrap();
    let c = cfg(true, true, 4096);
    let s = spec(&e.id, 3);
    let mut game = Game::new(e, &s, [EXT, EXT], &[], &c, pool).unwrap();
    let mut pick = Chooser::parse("uniform", 1).unwrap();
    for _ in 0..15 {
        let row = pick.pick(game.env.decision().unwrap());
        game.step(row, &c).unwrap();
    }
    replays(&game); // partial: still running
    let snap = game.clone();
    // a restored game continues identically
    let mut a = game.clone();
    let mut b = game.clone();
    b.restore(&snap, None);
    let mut pa = Chooser::parse("uniform", 9).unwrap();
    let mut pb = pa.clone();
    play(&mut a, &c, &mut pa);
    play(&mut b, &c, &mut pb);
    assert_eq!(a.env.outcome(), b.env.outcome());
    assert_eq!(a.info(&c), b.info(&c));
    // reseeded restores: replayable, deterministic per seed
    let mut r1 = game.clone();
    r1.restore(&snap, Some(77));
    let mut r2 = game.clone();
    r2.restore(&snap, Some(77));
    assert_eq!(r1.info(&c).forced, 0);
    let mut p1 = Chooser::parse("eps:0.2", 4).unwrap();
    let mut p2 = p1.clone();
    play(&mut r1, &c, &mut p1);
    play(&mut r2, &c, &mut p2);
    assert_eq!(r1.env.outcome(), r2.env.outcome());
    replays(&r1);
    // the step cap truncates, keeps the outcome, and records partially
    let capped_cfg = cfg(true, true, 5);
    let mut capped = Game::new(e, &s, [EXT, EXT], &[], &capped_cfg, pool).unwrap();
    let mut pc = Chooser::parse("uniform", 1).unwrap();
    let n = play(&mut capped, &capped_cfg, &mut pc);
    assert_eq!(n, 5);
    let info = capped.info(&capped_cfg);
    assert!(info.done && info.truncated && !info.terminated && info.task_end == 0 && info.actor == -1);
    assert!((info.potential - 0.3 * info.score).abs() < 1e-6);
    assert!(capped.step(0, &capped_cfg).is_err());
    replays(&capped);
    let tape = capped.record(pool).unwrap();
    assert_eq!(tape.header.meta["partial"], true);
    assert_eq!(tape.header.chooser.as_ref().unwrap().external(), [true, true]);
}

#[test]
fn horizon_under_both_objectives() {
    let pool = ContentPool::global();
    let cat = catalog();
    let e = cat.get("hall_32x32-undead-ghast1").unwrap();
    for health in [true, false] {
        let c = EnvConfig { scores: false, health, max_rounds: 2, standing_weight: 0.5, max_steps: 1 << 20 };
        let mut g = Game::new(e, &spec(&e.id, 1), [EXT, EXT], &[], &c, pool).unwrap();
        let mut pick = Chooser::parse("uniform", 2).unwrap();
        play(&mut g, &c, &mut pick);
        let info = g.info(&c);
        if g.env.fight.finished {
            continue;
        }
        assert_eq!(info.round, 3);
        assert_eq!((info.terminated, info.truncated, info.task_end), (health, !health, if health { 2 } else { 0 }));
        assert_eq!(info.winner, -1);
        assert_eq!(info.potential == 0.0, health || info.score == 0.0);
    }
}

/// Search forks (`Game::fork`, `Game::set_control`, `BatchEnv.fork`): a fork
/// is a reseeded restore; a fork whose native team is switched to external
/// and then plays the native choice plays exactly the native game; the
/// pending actor must stay external; a fork with changed controllers has no
/// tape.
#[test]
fn forks_reseed_and_switch_controllers() {
    install_quiet_hook();
    let pool = ContentPool::global();
    let cat = catalog();
    let c = cfg(true, true, 4096);
    let mut checked = 0;
    for (k, e) in cat.entries.iter().enumerate().filter(|(k, _)| k % 13 == 0) {
        let s = spec(&e.id, 300 + k as u64);
        let mut game = Game::new(e, &s, [EXT, NAT], &[], &c, pool).unwrap();
        let mut pick = Chooser::parse("native", 0).unwrap();
        for _ in 0..3 {
            if game.done() {
                break;
            }
            let row = pick.pick(game.env.decision().unwrap());
            game.step(row, &c).unwrap();
        }
        if game.done() {
            continue;
        }
        // a fork without a seed continues the same dice stream
        let mut same = game.fork(None);
        let mut copy = game.clone();
        play(&mut same, &c, &mut Chooser::parse("eps:0.2", 3).unwrap());
        play(&mut copy, &c, &mut Chooser::parse("eps:0.2", 3).unwrap());
        assert_eq!(same.env.outcome(), copy.env.outcome());
        assert_eq!(same.env.fight.trace.draws, copy.env.fight.trace.draws);
        // a reseeded fork is a reseeded restore
        let mut forked = game.fork(Some(91));
        let mut restored = game.clone();
        restored.restore(&game, Some(91));
        assert_eq!(forked.info(&c).forced, 0);
        play(&mut forked, &c, &mut Chooser::parse("native", 0).unwrap());
        play(&mut restored, &c, &mut Chooser::parse("native", 0).unwrap());
        assert_eq!(forked.env.outcome(), restored.env.outcome());
        assert_eq!(forked.env.fight.trace.draws, restored.env.fight.trace.draws);
        replays(&forked);
        // monsters switched to external, every row the native choice: the native game
        let mut switched = game.fork(Some(91));
        switched.set_control([EXT, EXT], &[]).unwrap();
        let mut monster_decisions = 0;
        let mut p = Chooser::parse("native", 0).unwrap();
        while !switched.done() {
            let d = switched.env.decision().unwrap();
            monster_decisions += (d.team == 1) as usize;
            let row = p.pick(d);
            switched.step(row, &c).unwrap();
        }
        assert_eq!(switched.env.outcome(), forked.env.outcome(), "{}", e.id);
        assert_eq!(switched.env.fight.trace.draws, forked.env.fight.trace.draws);
        assert_eq!(switched.info(&c).score, forked.info(&c).score);
        let finished_early = forked.env.fight.finished && forked.env.fight.round == game.env.fight.round;
        assert!(monster_decisions > 0 || finished_early, "{}: no monster decision surfaced", e.id);
        assert!(switched.record(pool).is_err());
        // the pending actor (a hero) must stay external; an error changes nothing
        let mut bad = game.fork(None);
        let before = bad.env.decision().map(|d| (d.actor, d.legal.len()));
        assert!(bad.set_control([NAT, NAT], &[]).is_err());
        assert!(bad.set_control([NAT, EXT], &[]).is_err());
        assert_eq!(bad.env.decision().map(|d| (d.actor, d.legal.len())), before);
        assert!(bad.env.is_external(before.unwrap().0));
        replays(&bad);
        // listing the actor keeps it external with both teams native
        let actor = before.unwrap().0;
        let mut solo = game.fork(Some(5));
        solo.set_control([NAT, NAT], &[UnitRef::Index(actor)]).unwrap();
        while !solo.done() {
            let d = solo.env.decision().unwrap();
            assert_eq!(d.actor, actor);
            let row = Chooser::parse("native", 0).unwrap().pick(d);
            solo.step(row, &c).unwrap();
        }
        checked += 1;
    }
    assert!(checked >= 8, "only {checked} encounters checked");
}
