//! Destination moves (`batch::MoveMode::Dest`, GENERAL_ENV.md "Destination
//! moves"): the presented rows (every native non-move row, one row per
//! reachable square, End Turn last), the paths (start square first, one
//! square per step, inside the movement left, never toward a source of
//! fear), the native arrays on the presented rows, the encoder on them, the
//! walk's interruptions, and the tape: a game played with destination rows is
//! a sequence of native one-square decisions, so `record` reproduces it and
//! `ember replay` matches it.

use std::path::Path;
use std::sync::Arc;

use ember_rs::batch::{dest_decision, EnvConfig, EpisodeSpec, Game, MoveMode, RowKind};
use ember_rs::catalog::{Catalog, Entry};
use ember_rs::content::ContentPool;
use ember_rs::encode::{Obs, Objective, F_A, S};
use ember_rs::engine::Act;
use ember_rs::env::Controller;
use ember_rs::map::Pos;
use ember_rs::replay::{replay_tape, Outcome};
use ember_rs::trace::FastRng;

const EXT: Controller = Controller::External;
const OBJ: Objective = Objective { standing_weight: 0.5, health: true };

fn cfg() -> EnvConfig {
    EnvConfig { scores: true, health: true, max_rounds: 30, standing_weight: 0.5, max_steps: 600 }
}

fn spec(id: &str, seed: u64) -> EpisodeSpec {
    EpisodeSpec { encounter: id.into(), map_seed: 0, layout_seed: seed * 7 + 1, dice_seed: seed * 13 + 5, offset_x: -1, offset_y: -1 }
}

fn dest_game(e: &Arc<Entry>, s: &EpisodeSpec) -> Game {
    let mut g = Game::new(e, s, [EXT, EXT], &[], &cfg(), ContentPool::global()).unwrap();
    g.moves = MoveMode::Dest;
    g
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

fn canvas(p: Pos, off: (i32, i32)) -> i16 {
    ((p.1 + off.1) * S as i32 + p.0 + off.0) as i16
}

/// Everything about one presented decision; returns (native rows,
/// presented rows).
fn check_presented(game: &Game) -> (usize, usize) {
    let env = &game.env;
    let f = &env.fight;
    let d = env.decision().unwrap();
    let (p, kinds) = dest_decision(env).unwrap();
    assert_eq!((p.actor, p.team, p.step), (d.actor, d.team, d.step));
    assert_eq!(p.legal.len(), kinds.len());
    assert!(matches!(p.legal.last(), Some(Act::EndTurn)), "End Turn last");
    // the native non-move rows, in their order
    let others: Vec<usize> = (0..d.legal.len()).filter(|&r| !matches!(d.legal[r], Act::Move(_))).collect();
    let natives: Vec<usize> = kinds.iter().filter_map(|k| if let RowKind::Native(r) = k { Some(*r) } else { None }).collect();
    assert_eq!(natives, others);
    // one-step destinations are exactly the native move rows
    let mut steps: Vec<Pos> = d.legal.iter().filter_map(|a| match a { Act::Move(p) if p.len() == 2 => Some(p[1]), _ => None }).collect();
    let mut ones: Vec<Pos> = kinds.iter().filter_map(|k| match k {
        RowKind::Walk(p) if p.len() == 2 => Some(p[1]),
        _ => None,
    }).collect();
    steps.sort();
    ones.sort();
    assert_eq!(steps, ones, "one-step destinations = the native one-square rows");
    let u = &f.units[d.actor];
    let step_cost = 1 + u.prone() as usize;
    let budget = (u.available_movement() / 5) as usize;
    let mut dests: Vec<Pos> = Vec::new();
    for (r, k) in kinds.iter().enumerate() {
        if let RowKind::Walk(path) = k {
            assert_eq!(p.legal[r], Act::Move(path.clone()));
            assert_eq!(path[0], u.pos, "a path starts on the walker's square");
            assert!((path.len() - 1) * step_cost <= budget, "within the movement left");
            for w in path.windows(2) {
                assert_eq!((w[0].0 - w[1].0).abs().max((w[0].1 - w[1].1).abs()), 1, "one square per step");
                assert!(!f.step_toward_fear(d.actor, w[0], w[1]), "never toward a source of fear");
            }
            let mut sq = path.clone();
            sq.sort();
            sq.dedup();
            assert_eq!(sq.len(), path.len(), "a shortest path visits a square once");
            dests.push(*path.last().unwrap());
        }
    }
    let n = dests.len();
    dests.sort();
    dests.dedup();
    assert_eq!(dests.len(), n, "one row per destination");
    // the native arrays follow the rows
    if let (Some(raw), Some(choice)) = (&p.native_raw, p.native_choice) {
        assert_eq!(raw.len(), p.legal.len());
        let dn = d.native_choice.unwrap();
        match &kinds[choice] {
            RowKind::Native(r) => assert_eq!(*r, dn),
            RowKind::Walk(path) => assert_eq!(d.legal[dn], Act::Move(path.clone())),
        }
        for (r, k) in kinds.iter().enumerate() {
            match k {
                RowKind::Walk(path) if path.len() > 2 => assert_eq!(raw[r], f64::NEG_INFINITY),
                RowKind::Native(q) => assert_eq!(raw[r].to_bits(), d.native_raw.as_ref().unwrap()[*q].to_bits()),
                _ => {}
            }
        }
    }
    // the observation of the presented rows
    assert_eq!(game.legal(), p.legal.len());
    let mut o = Obs::new(p.legal.len());
    let e = game.encode(None, &OBJ, &mut o.slot()).unwrap();
    assert_eq!(e.legal, p.legal.len());
    for (r, k) in kinds.iter().enumerate() {
        if let RowKind::Walk(path) = k {
            assert_eq!(o.cand_cell[r], canvas(*path.last().unwrap(), game.offset));
            assert_eq!(o.cands[r * F_A + ember_rs::encode::find(&ember_rs::encode::CAND_FEATURES, "path_steps_div12")],
                       (path.len() - 1) as f32 / 12.0);
            assert_eq!(o.cand_ids[r * 3], 0, "move kind");
        }
    }
    (d.legal.len(), p.legal.len())
}

fn load(name: &str) -> Catalog {
    Catalog::load(&Path::new(env!("CARGO_MANIFEST_DIR")).join("catalogs").join(name), ContentPool::global()).unwrap()
}

/// Games on three catalogs (both parties, fixed and generated maps), both
/// teams external, rows drawn uniformly from the presented ones: every
/// decision passes `check_presented`, every walk ends on its path, `moved`
/// counts the squares, and the tape `record` writes replays.
#[test]
fn presented_rows_walks_and_tapes() {
    let mut rng = FastRng::new(17);
    let (mut native_rows, mut dest_rows, mut decisions, mut walks, mut walked, mut cut) = (0, 0, 0, 0, 0, 0);
    for (cat, every) in [("g6-smoke.jsonl", 6), ("l3-undead-v2.jsonl", 9), ("l2-undead-gen-v1.jsonl", 60)] {
        let c = load(cat);
        for (k, e) in c.entries.iter().enumerate().step_by(every) {
            let mut g = dest_game(e, &spec(&e.id, k as u64));
            while !g.done() {
                let (nr, pr) = check_presented(&g);
                native_rows += nr;
                dest_rows += pr;
                decisions += 1;
                let (_, kinds) = g.presented().unwrap();
                let row = (rng.next_u64() % kinds.len() as u64) as usize;
                let a = g.env.decision().unwrap().actor;
                let reactions: Vec<i32> = g.env.fight.units.iter().map(|u| u.reaction).collect();
                let before = (g.env.fight.units[a].hp, g.env.fight.units[a].statuses.len());
                g.step(row, &cfg()).unwrap();
                let moved = g.info(&cfg()).moved as usize;
                // an interrupted walk may end off its path: a reaction can move the walker
                // (Redirect Attack swaps squares) or drop it before its step lands
                let u = &g.env.fight.units[a];
                let reacted = g.env.fight.units.iter().zip(&reactions).any(|(u, &r)| u.reaction < r)
                    || (u.hp, u.statuses.len()) != before
                    || g.env.decision().is_none_or(|d| d.actor != a);
                match &kinds[row] {
                    RowKind::Walk(path) => {
                        walks += 1;
                        walked += moved;
                        assert!(moved < path.len() && (moved > 0 || reacted), "a reaction can stop the first step");
                        if !reacted {
                            assert_eq!(g.env.fight.units[a].pos, path[moved], "the walk ends on its path");
                        }
                        cut += (moved + 1 < path.len()) as usize;
                    }
                    RowKind::Native(_) => assert_eq!(moved, 0),
                }
            }
            replays(&g);
        }
    }
    eprintln!(
        "{decisions} decisions: mean rows native {:.1}, destination {:.1}; {walks} walks, {:.2} squares each, {cut} cut short",
        native_rows as f64 / decisions as f64,
        dest_rows as f64 / decisions as f64,
        walked as f64 / walks.max(1) as f64
    );
    assert!(decisions > 2000 && walks > 500 && cut > 0);
}

/// The step mode is the native decision itself.
#[test]
fn step_mode_is_the_native_decision() {
    let c = load("l3-undead-v2.jsonl");
    let e = &c.entries[0];
    let mut g = Game::new(e, &spec(&e.id, 1), [EXT, EXT], &[], &cfg(), ContentPool::global()).unwrap();
    let d = g.env.decision().unwrap().clone();
    let (p, kinds) = g.presented().unwrap();
    assert_eq!(p.legal, d.legal);
    assert!(kinds.iter().enumerate().all(|(r, k)| *k == RowKind::Native(r)));
    let mv = d.legal.iter().position(|a| matches!(a, Act::Move(_))).unwrap();
    g.step(mv, &cfg()).unwrap();
    assert_eq!(g.info(&cfg()).moved, 1);
}

/// A fixed one-row catalog entry on `rows` with the given creatures.
fn fixed(rows: &[&str], heroes: &[(&str, i32, i32)], monsters: &[(&str, i32, i32)]) -> Arc<Entry> {
    let unit = |&(id, x, y): &(&str, i32, i32)| {
        let content = id.split('-').next().unwrap();
        serde_json::json!({"id": id, "content": content, "x": x, "y": y})
    };
    let row = serde_json::json!({
        "id": "t", "layout": {"rule": "fixed"},
        "spec": {"version": 1, "map": {"name": "t", "rows": rows},
                 "heroes": heroes.iter().map(unit).collect::<Vec<_>>(),
                 "monsters": monsters.iter().map(unit).collect::<Vec<_>>()},
    });
    let c = Catalog::from_jsonl(&row.to_string(), ContentPool::global()).unwrap();
    c.entries[0].clone()
}

fn end_turn(g: &mut Game) {
    let n = g.legal();
    g.step(n - 1, &cfg()).unwrap();
}

fn dest_row(g: &Game, to: Pos) -> usize {
    let (_, kinds) = g.presented().unwrap();
    kinds.iter().position(|k| matches!(k, RowKind::Walk(p) if p.last() == Some(&to))).unwrap_or_else(|| panic!("no row to {to:?}"))
}

#[test]
fn crosses_an_occupied_corridor_without_overwriting_tokens_and_replays() {
    let e = fixed(&["HHHHHHHH", "H......H", "HHHHHHHH"], &[("guy", 1, 1), ("elion", 2, 1)], &[("zombie-1", 6, 1)]);
    let mut g = dest_game(&e, &spec("t", 4));
    while g.env.fight.units[g.env.decision().unwrap().actor].id != "guy" {
        end_turn(&mut g);
    }
    let a = g.env.decision().unwrap().actor;
    let ally = g.env.fight.token_at((2, 1)).unwrap();
    let (_, kinds) = g.presented().unwrap();
    assert!(!kinds.iter().any(|k| matches!(k, RowKind::Walk(p) if p.last() == Some(&(2, 1)))));
    let row = dest_row(&g, (4, 1));
    let movement = g.env.fight.units[a].movement;
    g.step(row, &cfg()).unwrap();
    assert_eq!(g.env.fight.units[a].pos, (4, 1));
    assert_eq!(g.env.fight.units[a].movement, movement - 15);
    assert_eq!(g.env.fight.token_at((2, 1)), Some(ally));
    replays(&g);

    // Along the same corridor, a downed ally or corpse costs one square.
    // A living incapacitated enemy costs two and a conscious enemy bars passage.
    use ember_rs::engine::St;
    let mut f = g.env.fight.clone();
    f.units[a].movement = 15;
    for (ally_side, status, expected) in [(true, St::Unconscious, 2), (false, St::Unconscious, 3), (false, St::Dead, 2)] {
        f.units[ally].team = if ally_side { f.units[a].team } else { 1 - f.units[a].team };
        f.units[ally].statuses = vec![status];
        let path = [(4, 1), (3, 1), (2, 1), (1, 1)];
        let (actual, left) = f.compute_actual_moves(a, &path[1..], 3);
        assert_eq!(actual, path[1..]);
        assert_eq!(3 - left, expected);
    }
    f.units[ally].statuses.clear();
    assert!(!f.passable(a, (2, 1)));
}

/// An opportunity attack (a reaction) stops the walk after the step that
/// provoked it.
#[test]
fn an_opportunity_attack_stops_the_walk() {
    let rows = ["........", "........", "........"];
    let mut stopped = 0;
    for seed in 0..12u64 {
        let e = fixed(&rows, &[("guy", 3, 1)], &[("zombie-1", 4, 1)]);
        let mut g = dest_game(&e, &EpisodeSpec { dice_seed: seed, ..spec("t", seed) });
        // the zombie reacts only after its first turn
        while !g.done() {
            let d = g.env.decision().unwrap();
            let f = &g.env.fight;
            if f.units[d.actor].id == "guy" && f.units[1].has_reaction() {
                break;
            }
            end_turn(&mut g);
        }
        if g.done() {
            continue;
        }
        let row = dest_row(&g, (0, 1));
        g.step(row, &cfg()).unwrap();
        let f = &g.env.fight;
        assert_eq!(g.info(&cfg()).moved, 1, "seed {seed}: stopped after leaving the zombie's reach");
        assert_eq!(f.units[0].pos, (2, 1));
        assert!(!f.units[1].has_reaction(), "the zombie used its reaction");
        stopped += 1;
        replays(&g);
    }
    assert!(stopped > 0);
}

/// A conscious enemy coming into view stops the walk after the step that
/// shows it; without an enemy to see, the same row walks to its end.
#[test]
fn a_new_enemy_in_sight_stops_the_walk() {
    // guy above a wall; the skeleton below it, out of his sight
    let rows = ["..........", ".HHHHHHHHH", ".........."];
    let e = fixed(&rows, &[("guy", 3, 0)], &[("skeleton-1", 7, 2)]);
    let mut g = dest_game(&e, &spec("t", 3));
    while g.env.fight.units[g.env.decision().unwrap().actor].id != "guy" {
        end_turn(&mut g);
    }
    let f = &g.env.fight;
    assert!(!f.can_see(0, 1), "the wall hides the skeleton");
    let row = dest_row(&g, (1, 2));
    let (_, kinds) = g.presented().unwrap();
    let RowKind::Walk(path) = kinds[row].clone() else { panic!() };
    let first_seen = path.iter().position(|&p| g.env.fight.grid.los(p, (7, 2))).unwrap();
    assert!(first_seen > 0 && first_seen + 1 < path.len(), "the skeleton comes into view before the end: {path:?}");
    g.step(row, &cfg()).unwrap();
    assert_eq!(g.info(&cfg()).moved as usize, first_seen, "stopped where it came into view");
    assert_eq!(g.env.fight.units[0].pos, path[first_seen]);
    assert!(g.env.fight.can_see(0, 1));
    replays(&g);
}
