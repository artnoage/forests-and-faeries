//! Turn Undead's turn ends on time (natural20 N20-046, `53bc0cb1`). The
//! battle ends lapsed and cleric-down turn and fear entries when a turn starts
//! (before and after its processing) and ends and after every committed action
//! (`timed_conditions.expire_timed_conditions`); reads, AI scoring included,
//! change nothing.
//!
//! Regression for the l3-open replay divergence of 2026-11-18 (`a3-breadth`,
//! dev row `l3pg-elion+curogana-caves-v2-000121-sight-ghast1+wight1+mummy1`):
//! the ghast and the wight were turned in round 1. Natural20 `de027005` ended
//! the lapsed turn only when Elion's Turn Undead was scored at decision 772
//! (so Command on them scored 2.475 and 3.9325 there), ember-rs not at all
//! before their own turns (Command −1). Now the turn ends at the top of round
//! 11, before Elion's first decision of that round (770).

use ember_rs::content::ContentPool;
use ember_rs::engine::St;
use ember_rs::env::{Controller, Env};
use ember_rs::map::Grid;
use ember_rs::tape::Placement;

const EXT: Controller = Controller::External;

/// The generated caves map of the tape (`gen-caves-v2-000121`, 25×18).
const MAP: [&str; 18] = [
    "H........HHHHHHH........H",
    "..........HHHH...........",
    "......H..................",
    "H.....H.................H",
    "H.......................H",
    "HH...............H.......",
    "HHH.............HHH......",
    "HHHH.....................",
    "HHH........HH............",
    "HH........HHHH...........",
    "H........HHHHH...........",
    "........HHHHH............",
    "........HHHH........H....",
    "H.......HHH........HHH...",
    "H.......HH..........HHHHH",
    ".......HHH..........HHHHH",
    "......HHHHH........HHHHHH",
    "H...HHHHHHHHHHHHHHHHHHHHH",
];
const UNITS: [(&str, i32, i32); 5] =
    [("elion", 13, 4), ("curogana", 14, 5), ("ghast-1", 0, 2), ("wight-1", 0, 1), ("mummy-1", 3, 0)];
const DICE_SEED: u64 = 1215784755;
/// The rows the tape executed at its first 192 unforced external decisions
/// (both teams external); the 192nd is decision 770, the 193rd decision 772.
const ROWS: [usize; 192] = [
    5, 5, 5, 10, 9, 6, 22, 3, 3, 6, 9, 9, 9, 9, 0, 4, 4, 4, 5, 10, 8, 2, 59, 6, 10, 11, 6, 1, 8, 1, 3, 2, 2, 7, 7, 5, 6,
    5, 3, 6, 12, 13, 12, 4, 2, 1, 2, 8, 2, 2, 5, 5, 5, 3, 50, 8, 9, 9, 6, 6, 6, 14, 7, 4, 2, 7, 9, 5, 6, 44, 4, 8, 9, 9,
    9, 9, 4, 5, 2, 2, 2, 2, 2, 5, 50, 10, 10, 10, 10, 10, 9, 3, 6, 4, 2, 5, 9, 9, 9, 45, 4, 8, 9, 9, 9, 9, 5, 6, 4, 2, 3,
    4, 8, 9, 44, 9, 10, 10, 10, 10, 9, 3, 6, 4, 6, 4, 2, 8, 9, 44, 4, 8, 9, 9, 9, 9, 4, 5, 2, 4, 2, 5, 8, 8, 44, 10, 10,
    10, 10, 10, 9, 3, 6, 2, 4, 3, 5, 9, 5, 44, 4, 8, 9, 9, 8, 8, 4, 5, 4, 6, 2, 5, 8, 8, 44, 10, 10, 10, 10, 10, 9, 3, 6,
    3, 5, 4, 6, 10, 6, 2, 43, 4,
];

/// The game after the first `n` rows (native scores on or off).
fn game(scores: bool, n: usize) -> Env {
    let ids: Vec<String> = UNITS.iter().map(|u| u.0.to_string()).collect();
    let placements: Vec<Placement> = UNITS.iter().map(|&(id, x, y)| Placement { id: id.into(), x, y }).collect();
    let grid = Grid::shared(&MAP).unwrap();
    // The stored row numbers and native scores came from this historical ruleset.
    let mut fight = ember_rs::engine::Fight::on_map(ContentPool::global(), grid, &ids, &placements, 30, ember_rs::trace::Trace::free(DICE_SEED)).unwrap();
    fight.set_rule_version(3);
    let mut env = Env::new(fight, [EXT, EXT], scores);
    for (i, &r) in ROWS[..n].iter().enumerate() {
        env.step(r).unwrap_or_else(|e| panic!("decision {i}: {e}"));
    }
    env
}

fn turned_state(env: &Env, u: usize) -> (bool, bool, bool, bool) {
    let unit = &env.fight.units[u];
    (!unit.turned_by.is_empty(), unit.has(St::Incapacitated), !unit.frightened_by.is_empty(), unit.has(St::Frightened))
}

fn score(env: &Env, key: &str) -> (f64, bool) {
    let d = env.decision().unwrap();
    let r = env.describe().iter().position(|l| l == key).unwrap_or_else(|| panic!("no row {key}"));
    (d.native_raw.as_ref().unwrap()[r], d.native_dropped.as_ref().unwrap()[r])
}

#[test]
fn the_lapsed_turn_ends_at_the_top_of_the_round() {
    let (elion, ghast, wight) = (0, 2, 3);
    // decision 770: Elion's first of round 11; the turn ended when the round began
    let env = game(true, 191);
    let d = env.decision().unwrap();
    assert_eq!((d.actor, env.fight.round, env.fight.units[elion].pos), (elion, 11, (4, 7)));
    for u in [ghast, wight] {
        assert_eq!(turned_state(&env, u), (false, false, false, false), "{}", env.fight.units[u].id);
    }
    // so Command on them counts (it was pointless while they stayed Incapacitated)
    for key in ["spell:command:L1:>ghast-1", "spell:command:L1:>wight-1"] {
        let (s, dropped) = score(&env, key);
        assert!(s > 0.0 && !dropped, "{key}: {s}");
    }
    // decision 772: the scores natural20 de027005 gave once its scoring had ended the turn
    let env = game(true, 192);
    assert_eq!((env.decision().unwrap().actor, env.fight.units[elion].pos), (elion, (4, 6)));
    for (key, value) in [
        ("channel_divinity_turn_undead", 20.175000000000004),
        ("spell:command:L1:>ghast-1", 2.475),
        ("spell:command:L1:>wight-1", 3.9325000000000006),
        ("spell:guiding_bolt:L1:>ghast-1", 10.450000000000001),
    ] {
        assert_eq!(score(&env, key), (value, false), "{key}");
    }
}

/// Scoring changes nothing, so the game is the same with native scores off.
#[test]
fn native_scores_do_not_change_the_game() {
    let on = game(true, 192);
    let off = game(false, 192);
    assert_eq!(on.fight.digest(), off.fight.digest());
    assert!(off.decision().unwrap().native_raw.is_none());
}
