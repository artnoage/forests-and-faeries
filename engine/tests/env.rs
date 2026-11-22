//! The decision API (`src/env.rs`, GENERAL_ENV.md §4; G4b): native play
//! through the API, snapshots, reseeded restores, scores off, Rust-recorded
//! off-policy games replayed, the EncounterSpec reader and invalid calls.
//! natural20's off-policy tapes (`fixtures/g4a_*`) are replayed by
//! `tests/fixtures.rs`.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use ember_rs::content::ContentPool;
use ember_rs::engine::{Act, Fight, MAX_ROUNDS};
use ember_rs::env::{Chooser, Controller, Decision, Env, Forced};
use ember_rs::map::{builtin_map, Grid};
use ember_rs::replay::{fight_for, install_quiet_hook, replay_fight, Outcome};
use ember_rs::spec::EncounterSpec;
use ember_rs::tape::{Ev, Placement, Tape};
use ember_rs::trace::Trace;

const EXT: Controller = Controller::External;
const NAT: Controller = Controller::Native;

/// A setup: map, units, placements (from a fixture tape header).
#[derive(Clone)]
struct Setup {
    name: String,
    grid: Arc<Grid>,
    units: Vec<String>,
    placements: Vec<Placement>,
}

fn fixture_setups() -> Vec<Setup> {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("fixtures");
    let mut files: Vec<PathBuf> = std::fs::read_dir(&dir)
        .unwrap()
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == "jsonl"))
        .collect();
    files.sort();
    files
        .iter()
        .map(|f| {
            let t = Tape::load(f).unwrap();
            let fight = fight_for(&t.header, ContentPool::global(), Trace::free(0)).unwrap();
            Setup {
                name: f.file_name().unwrap().to_string_lossy().into_owned(),
                grid: fight.grid.clone(),
                units: t.header.units.clone(),
                placements: t.header.placements.clone(),
            }
        })
        .collect()
}

/// A spread of setups: every fourth fixture (vault, maps, both parties).
fn some_setups() -> Vec<Setup> {
    fixture_setups().into_iter().step_by(4).collect()
}

fn fight(s: &Setup, trace: Trace) -> Fight {
    Fight::on_map(ContentPool::global(), s.grid.clone(), &s.units, &s.placements, MAX_ROUNDS, trace).unwrap()
}

/// Play to the end with `pick`; returns the executed rows.
fn play(env: &mut Env, pick: &mut Chooser) -> Vec<usize> {
    let mut rows = Vec::new();
    while let Some(d) = env.decision() {
        check_decision(env, d);
        let row = pick.pick(d);
        rows.push(row);
        env.step(row).unwrap();
    }
    rows
}

/// Invariants of every offered decision (GENERAL_ENV.md §4.1, §6.1).
fn check_decision(env: &Env, d: &Decision) {
    let f = &env.fight;
    assert_eq!(d.actor, f.current());
    assert_eq!(d.team, f.units[d.actor].team);
    assert_eq!(env.controllers()[d.team as usize], EXT);
    assert!(d.forced.is_none(), "forced decisions are never offered");
    assert!(!d.legal.is_empty());
    if d.end_turn_row().is_some() {
        assert!(d.legal.len() >= 2);
        assert_eq!(d.legal.iter().filter(|a| **a == Act::EndTurn).count(), 1);
    } else {
        assert!(d.legal.iter().all(|a| matches!(a, Act::Spell(c) if c.spell == ember_rs::content::SpellId::ScorchingRay)));
    }
    let descs = env.describe();
    let mut sorted = descs.clone();
    sorted.sort();
    sorted.dedup();
    assert_eq!(sorted.len(), descs.len(), "rows are deduplicated: {descs:?}");
    match (&d.native_raw, &d.native_dropped) {
        (Some(raw), Some(dropped)) => {
            assert!(env.scores() && d.unscored.is_none());
            assert_eq!(raw.len(), d.legal.len());
            assert_eq!(dropped.len(), d.legal.len());
            if let Some(end) = d.end_turn_row() {
                assert_eq!(raw[end], if f.enemy_in_melee_range(d.actor) { 0.0 } else { f64::NEG_INFINITY });
                assert!(!dropped[end]);
            }
            for (k, v) in raw.iter().enumerate().take(d.end_turn_row().unwrap_or(raw.len())) {
                if matches!(&d.legal[k], Act::Move(path) if path.len() > 2 && (f.units[d.actor].t.pc || f.rule_version() < 6)) {
                    assert_eq!(*v, f64::NEG_INFINITY, "external-only paths have no native score");
                } else {
                    assert!(v.is_finite(), "row {k} {} score {v}", descs[k]);
                }
            }
            let n = d.native_choice.unwrap();
            assert!(!dropped[n], "the native choice is never a dropped row");
        }
        (None, None) => {
            assert!(!env.scores() || d.unscored.is_some());
            if d.unscored.is_some() {
                assert_eq!(d.legal[d.native_choice.unwrap()], Act::Stand);
            } else {
                assert!(d.native_choice.is_none());
            }
        }
        _ => panic!("raw and dropped come together"),
    }
}

/// Recorded events without the `ext` blocks of decision events and without
/// the `end` event (native and API runs count turns differently there).
fn strip(events: Vec<Ev>) -> Vec<Ev> {
    events
        .into_iter()
        .filter(|e| !matches!(e, Ev::End { .. }))
        .map(|e| match e {
            Ev::Dec { ctx, who, cands, scores, order, adj, chosen, multi_sort, .. } => {
                Ev::Dec { ctx, who, cands, scores, order, adj, chosen, multi_sort, ext: None }
            }
            other => other,
        })
        .collect()
}

fn json(events: &[Ev]) -> Vec<String> {
    events.iter().map(|e| serde_json::to_string(e).unwrap()).collect()
}

#[test]
fn native_choice_through_the_api_is_native_play() {
    for s in some_setups() {
        for seed in [1u64, 2] {
            let mut native = fight(&s, Trace::recording(seed));
            native.run();
            let want = json(&strip(native.trace.recorded()));
            for ctrl in [[EXT, EXT], [EXT, NAT], [NAT, EXT]] {
                let mut env = Env::new(fight(&s, Trace::recording(seed)), ctrl, true);
                let mut pick = Chooser::parse("native", 0).unwrap();
                play(&mut env, &mut pick);
                env.finish_trace();
                assert_eq!(env.counts.differ, 0);
                let got = json(&strip(env.fight.trace.recorded()));
                if got != want {
                    let i = got.iter().zip(&want).position(|(a, b)| a != b).unwrap_or(got.len().min(want.len()));
                    panic!(
                        "{} seed {seed} {ctrl:?}: event {i} differs\n  native {}\n  api    {}",
                        s.name,
                        want.get(i).map_or("<end>", String::as_str),
                        got.get(i).map_or("<end>", String::as_str)
                    );
                }
            }
        }
    }
}

#[test]
fn snapshots_continue_identically() {
    for s in some_setups() {
        let seed = 7;
        let mut env = Env::new(fight(&s, Trace::recording(seed)), [EXT, EXT], true);
        let mut pick = Chooser::parse("eps:0.5", 11).unwrap();
        for _ in 0..12 {
            let Some(d) = env.decision() else { break };
            let row = pick.pick(d);
            env.step(row).unwrap();
        }
        let snap = env.snapshot();
        let pick_snap = pick.clone();
        let before = env.fight.trace.position();
        play(&mut env, &mut pick);
        env.finish_trace();
        let a = env.fight.trace.recorded();
        let mut env2 = snap.snapshot();
        let mut pick2 = pick_snap;
        play(&mut env2, &mut pick2);
        env2.finish_trace();
        let b = env2.fight.trace.recorded();
        assert_eq!(json(&a[before..]), json(&b[before..]), "{}", s.name);
        assert_eq!(env.fight.digest(), env2.fight.digest());
        assert_eq!(env.outcome(), env2.outcome());
        assert_eq!(env.counts, env2.counts);
    }
}

#[test]
fn reseeded_restores_differ_only_in_the_dice() {
    let mut diverged = 0;
    for s in some_setups() {
        let mut env = Env::new(fight(&s, Trace::recording(3)), [EXT, NAT], true);
        let mut pick = Chooser::parse("eps:0.3", 5).unwrap();
        for _ in 0..6 {
            let Some(d) = env.decision() else { break };
            let row = pick.pick(d);
            env.step(row).unwrap();
        }
        let snap = env.snapshot();
        let at = snap.fight.trace.position();
        let run = |seed: u64| {
            let mut e = env.snapshot();
            e.restore(&snap, Some(seed));
            assert_eq!(e.fight.digest(), snap.fight.digest());
            let mut p = pick.clone();
            play(&mut e, &mut p);
            e.finish_trace();
            e.fight.trace.recorded()[at..].to_vec()
        };
        let (a, a2, b) = (run(100), run(100), run(200));
        assert_eq!(json(&a), json(&a2), "{}: same seed, same continuation", s.name);
        let Some(i) = a.iter().zip(&b).position(|(x, y)| serde_json::to_string(x).unwrap() != serde_json::to_string(y).unwrap())
        else {
            assert_eq!(a.len(), b.len());
            continue;
        };
        // The first difference is a die: same roller, tag, die and mode.
        match (&a[i], &b[i]) {
            (Ev::Draw { who: w1, tag: t1, sides: s1, mode: m1, v: v1, .. }, Ev::Draw { who: w2, tag: t2, sides: s2, mode: m2, v: v2, .. }) => {
                assert_eq!((w1, t1, s1, m1), (w2, t2, s2, m2), "{}", s.name);
                assert_ne!(v1, v2);
                diverged += 1;
            }
            (x, y) => panic!("{}: first difference is not a die: {} | {}", s.name, x.brief(), y.brief()),
        }
    }
    assert!(diverged > 0, "reseeding never changed a game");
}

#[test]
fn scores_off_is_the_same_game() {
    for s in some_setups() {
        for ctrl in [[EXT, EXT], [EXT, NAT]] {
            let seed = 21;
            let mut on = Env::new(fight(&s, Trace::free(seed)), ctrl, true);
            let mut off = Env::new(fight(&s, Trace::free(seed)), ctrl, false);
            let mut pick = Chooser::parse("uniform", 9).unwrap();
            loop {
                let (d1, d2) = (on.decision(), off.decision());
                assert_eq!(d1.is_some(), d2.is_some(), "{}", s.name);
                let (Some(d1), Some(d2)) = (d1, d2) else { break };
                check_decision(&on, d1);
                check_decision(&off, d2);
                assert_eq!(d1.legal, d2.legal);
                assert_eq!(d1.unscored, d2.unscored);
                assert!(d2.native_raw.is_none());
                assert_eq!(on.fight.digest(), off.fight.digest());
                // the native memory (later scores depend on it)
                for (a, b) in on.fight.units.iter().zip(&off.fight.units) {
                    assert_eq!(a.mem.known, b.mem.known, "{} {}", s.name, a.id);
                    assert_eq!(a.mem.investigate, b.mem.investigate, "{} {}", s.name, a.id);
                    assert_eq!(a.mem.recent, b.mem.recent);
                    assert!(a.mem.visited == b.mem.visited);
                    assert_eq!(a.unseen, b.unseen);
                    assert_eq!(a.pools_init, b.pools_init);
                }
                let row = pick.pick(d1);
                on.step(row).unwrap();
                off.step(row).unwrap();
                assert_eq!(on.last, off.last);
            }
            assert_eq!(on.outcome(), off.outcome());
            assert_eq!(on.fight.trace.draws, off.fight.trace.draws);
            assert_eq!(on.counts.decisions, off.counts.decisions);
            assert_eq!(on.counts.forced_flee + on.counts.forced_end_turn, off.counts.forced_flee + off.counts.forced_end_turn);
        }
    }
}

#[test]
fn rust_off_policy_games_replay() {
    install_quiet_hook();
    for s in some_setups() {
        for (ctrl, chooser) in [([EXT, EXT], "uniform"), ([EXT, NAT], "softmax:1"), ([NAT, EXT], "eps:0.5")] {
            let mut env = Env::new(fight(&s, Trace::recording(13)), ctrl, true);
            let mut pick = Chooser::parse(chooser, 17).unwrap();
            play(&mut env, &mut pick);
            env.finish_trace();
            let events = env.fight.trace.recorded();
            assert!(events.iter().any(|e| matches!(e, Ev::Dec { ext: Some(_), .. })));
            match replay_fight(fight(&s, Trace::replay(events)), ctrl) {
                Outcome::Match { .. } => {}
                Outcome::Diverged(d) => panic!("{} {ctrl:?}: {d}", s.name),
                Outcome::Incomplete { consumed, remaining } => panic!("{}: {consumed} consumed, {remaining} left", s.name),
                Outcome::Crashed(m) | Outcome::Setup(m) => panic!("{}: {m}", s.name),
            }
        }
    }
}

#[test]
fn forced_steps_are_counted_not_offered() {
    // Over many uniform games: forced End Turn decisions occur and are
    // counted per call; the turn cap never needs more than 24 actions.
    let (mut forced, mut calls) = (0u64, 0u64);
    for s in some_setups() {
        let mut env = Env::new(fight(&s, Trace::free(4)), [EXT, EXT], true);
        let mut pick = Chooser::parse("uniform", 4).unwrap();
        let mut sum = env.last.forced as u64;
        while let Some(d) = env.decision() {
            assert!(d.step < 24);
            let row = pick.pick(d);
            env.step(row).unwrap();
            sum += env.last.forced as u64;
            assert_eq!(env.last.native_actions, 0);
            calls += 1;
        }
        assert_eq!(sum, env.counts.forced_flee + env.counts.forced_end_turn);
        forced += sum;
    }
    assert!(calls > 0 && forced > 0);
}

#[test]
fn invalid_steps_change_nothing() {
    let s = &fixture_setups()[0];
    let mut env = Env::new(fight(s, Trace::free(1)), [EXT, EXT], true);
    let n = env.decision().unwrap().legal.len();
    let digest = env.fight.digest();
    assert!(env.step(n).is_err());
    assert_eq!(env.fight.digest(), digest);
    assert_eq!(env.decision().unwrap().legal.len(), n);
    let mut pick = Chooser::parse("native", 0).unwrap();
    play(&mut env, &mut pick);
    assert!(env.done());
    assert!(env.step(0).is_err());
    let o = env.outcome();
    assert!(o.finished != o.horizon);
    if let Some(w) = o.winner {
        assert_eq!(o.standing[w as usize ^ 1], 0);
    }
    assert!(Chooser::parse("eps:2", 0).is_err() && Chooser::parse("softmax:0", 0).is_err());
    assert!(Controller::parse("native").is_ok() && Controller::parse("policy").is_err());
    let _ = Forced::Flee.name();
}

/// A spec in natural20's JSON form (`EncounterSpec.to_json`).
fn spec_json(map: &str, heroes: &str, monsters: &str) -> String {
    format!(r#"{{"version": 1, "map": {{"name": "t", "rows": {map}}}, "heroes": {heroes}, "monsters": {monsters}, "record": {{"seed": 1}}}}"#)
}

#[test]
fn encounter_specs() {
    let pool = ContentPool::global();
    let room = builtin_map("room_12x10").unwrap().unwrap();
    let rows: Vec<String> = (0..room.grid.h)
        .map(|y| (0..room.grid.w).map(|x| if room.grid.is_wall(x, y) { 'H' } else { '.' }).collect())
        .collect();
    let map = serde_json::to_string(&rows).unwrap();
    let heroes = r#"[{"id": "mara", "content": "mara", "x": 1, "y": 1}, {"id": "ilyra", "content": "ilyra", "x": 2, "y": 1}]"#;
    let monsters = r#"[{"id": "zombie-1", "content": "zombie", "x": 9, "y": 7}, {"id": "skeleton-2", "content": "skeleton", "x": 10, "y": 8}]"#;
    let spec = EncounterSpec::from_json(&spec_json(&map, heroes, monsters)).unwrap();
    let enc = spec.validate(pool).unwrap();
    assert_eq!(enc.units, ["mara", "ilyra", "zombie-1", "skeleton-2"]);
    assert!(Arc::ptr_eq(&enc.grid, &room.grid));
    let mut env = Env::from_spec(&spec, pool, MAX_ROUNDS, 5, [EXT, NAT], true).unwrap();
    let mut pick = Chooser::parse("uniform", 5).unwrap();
    play(&mut env, &mut pick);
    assert!(env.done());

    let bad = |map: &str, heroes: &str, monsters: &str| {
        EncounterSpec::from_json(&spec_json(map, heroes, monsters)).and_then(|s| s.validate(pool).map(|_| ()))
    };
    let z = r#"[{"id": "zombie-1", "content": "zombie", "x": 9, "y": 7}]"#;
    let m = r#"[{"id": "mara", "content": "mara", "x": 1, "y": 1}]"#;
    assert!(bad(&map, m, z).is_ok());
    for (what, err) in [
        ("unknown content", bad(&map, m, r#"[{"id": "dragon-1", "content": "dragon", "x": 9, "y": 7}]"#)),
        ("id/content", bad(&map, m, r#"[{"id": "ghoul-1", "content": "zombie", "x": 9, "y": 7}]"#)),
        ("hero as monster", bad(&map, m, r#"[{"id": "ilyra", "content": "ilyra", "x": 9, "y": 7}]"#)),
        ("wall", bad(&map, m, r#"[{"id": "zombie-1", "content": "zombie", "x": 0, "y": 0}]"#)),
        ("unplaced", bad(&map, m, r#"[{"id": "zombie-1", "content": "zombie"}]"#)),
        ("overlap", bad(&map, m, r#"[{"id": "zombie-1", "content": "zombie", "x": 1, "y": 1}]"#)),
        ("no heroes", bad(&map, "[]", z)),
        ("ragged rows", bad(r#"["HHH", "H.", "HHH"]"#, m, z)),
        ("symbol", bad(r#"["HHHH", "H.xH", "HHHH"]"#, m, z)),
        ("two components", bad(r#"["HHHHH", "H.H.H", "HHHHH"]"#, r#"[{"id": "mara", "content": "mara", "x": 1, "y": 1}]"#, r#"[{"id": "zombie-1", "content": "zombie", "x": 3, "y": 1}]"#)),
    ] {
        assert!(err.is_err(), "{what} must be rejected");
    }
    let v2 = spec_json(&map, m, z).replace(r#""version": 1"#, r#""version": 2"#);
    assert!(EncounterSpec::from_json(&v2).unwrap().validate(pool).is_err());
}

#[test]
fn env_can_move_between_threads() {
    // G6 runs slots on worker threads (rayon): an Env and its snapshots must
    // be Send (and Sync for shared reads).
    fn send_sync<T: Send + Sync>() {}
    send_sync::<Env>();
    send_sync::<Decision>();
    let s = fixture_setups().remove(0);
    let env = Env::new(fight(&s, Trace::free(2)), [EXT, EXT], true);
    let snap = env.snapshot();
    let done = std::thread::spawn(move || {
        let mut e = snap;
        let mut pick = Chooser::parse("uniform", 2).unwrap();
        play(&mut e, &mut pick);
        e.outcome()
    })
    .join()
    .unwrap();
    let mut e = env;
    let mut pick = Chooser::parse("uniform", 2).unwrap();
    play(&mut e, &mut pick);
    assert_eq!(e.outcome(), done);
}

/// The two equivalence checks above over every fixture setup and more seeds
/// (`cargo test --release --test env -- --ignored`).
#[test]
#[ignore]
fn equivalences_on_every_fixture_setup() {
    for s in fixture_setups() {
        for seed in 1u64..=4 {
            let mut native = fight(&s, Trace::recording(seed));
            native.run();
            let want = json(&strip(native.trace.recorded()));
            let mut env = Env::new(fight(&s, Trace::recording(seed)), [EXT, EXT], true);
            play(&mut env, &mut Chooser::parse("native", 0).unwrap());
            assert!(json(&strip(env.fight.trace.recorded())) == want, "{} seed {seed}: native choice != native play", s.name);
            for ctrl in [[EXT, EXT], [NAT, EXT]] {
                let mut on = Env::new(fight(&s, Trace::free(seed)), ctrl, true);
                let mut off = Env::new(fight(&s, Trace::free(seed)), ctrl, false);
                let mut pick = Chooser::parse("uniform", seed).unwrap();
                while let Some(d) = on.decision() {
                    let row = pick.pick(d);
                    assert_eq!(Some(&d.legal), off.decision().map(|d| &d.legal), "{} seed {seed}", s.name);
                    on.step(row).unwrap();
                    off.step(row).unwrap();
                }
                assert!(off.done(), "{}", s.name);
                assert_eq!(on.fight.digest(), off.fight.digest(), "{} seed {seed}", s.name);
                assert_eq!(on.fight.trace.draws, off.fight.trace.draws);
            }
        }
    }
}
