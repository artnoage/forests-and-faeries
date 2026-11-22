//! The observation encoder (`src/encode.rs`, GENERAL_ENV.md §5, §9.4; G5):
//! shapes and padding, pointers, permutation and offset invariance, team
//! views, the final view, determinism, snapshot parity, reference checks of
//! the map channels and rules estimates, the feature list and golden digests.
//! `ember-gen-v2` (the default): the relation array against the engine state,
//! the token summaries of the relations, and `ember-gen-v1` as the exact
//! prefix of every v2 array.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use ember_rs::content::ContentPool;
use ember_rs::dice::prob_at_least;
use ember_rs::dump::{Dump, DumpOpts, Offset};
use ember_rs::encode::{self, find, Obs, Objective, Version, CAND_FEATURES, CELLS, CREATURE_FEATURES, F_A, F_A_V1, F_C,
                       F_C_V1, F_G, F_G_V1, GLOBAL_FEATURES, MAP_C, MAP_C_V1, MAP_CHANNELS, N, R, RELATIONS, S, T};
use ember_rs::engine::{Act, Fight, MAX_ROUNDS};
use ember_rs::env::{Chooser, Controller, Env};
use ember_rs::map::{Grid, Pos};
use ember_rs::replay::fight_for;
use ember_rs::tape::{Placement, Tape};
use ember_rs::trace::Trace;

const EXT: Controller = Controller::External;
const NAT: Controller = Controller::Native;
const OBJ: Objective = Objective { standing_weight: 0.5, health: true };

#[derive(Clone)]
struct Setup {
    name: String,
    grid: Arc<Grid>,
    units: Vec<String>,
    placements: Vec<Placement>,
}

fn fixture_files() -> Vec<PathBuf> {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("fixtures");
    let mut files: Vec<PathBuf> = std::fs::read_dir(&dir)
        .unwrap()
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == "jsonl"))
        .collect();
    files.sort();
    files
}

fn setups() -> Vec<Setup> {
    fixture_files()
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

/// Every fifth fixture setup (vault and the three maps, both parties).
fn some_setups() -> Vec<Setup> {
    setups().into_iter().step_by(5).collect()
}

fn env_for(s: &Setup, seed: u64, ctrl: [Controller; 2], scores: bool) -> Env {
    Env::from_units(ContentPool::global(), s.grid.clone(), &s.units, &s.placements, MAX_ROUNDS, seed, ctrl, scores)
        .unwrap()
}

fn obs(env: &Env) -> Obs {
    Obs::of(env, None, (0, 0), &OBJ).unwrap()
}

const fn c(name: &str) -> usize {
    find(&CREATURE_FEATURES, name)
}
const fn a(name: &str) -> usize {
    find(&CAND_FEATURES, name)
}
const fn g(name: &str) -> usize {
    find(&GLOBAL_FEATURES, name)
}

fn canvas(p: Pos, off: (i32, i32)) -> i16 {
    ((p.1 + off.1) * S as i32 + p.0 + off.0) as i16
}

fn chan(o: &Obs, ch: usize, x: usize, y: usize) -> u8 {
    o.map[ch * CELLS + y * S + x]
}

/// Visit decisions of a both-external game played with `chooser`, at most
/// `cap` of them.
fn play(env: &mut Env, chooser: &str, seed: u64, cap: usize, mut visit: impl FnMut(&Env, usize)) {
    let mut pick = Chooser::parse(chooser, seed).unwrap();
    let mut k = 0;
    while let Some(d) = env.decision() {
        if k >= cap {
            break;
        }
        visit(env, k);
        let row = pick.pick(d);
        env.step(row).unwrap();
        k += 1;
    }
}

// ----------------------------------------------------------------------------
// Invariants of one observation
// ----------------------------------------------------------------------------

/// Shapes, prefixes, padding, ranges, pointers and the native arrays (and
/// the v2 relations).
fn check_obs(env: &Env, o: &Obs, off: (i32, i32)) {
    check_obs_v1(env, o, off);
    check_relations(env, o);
    check_trail(env, o, off);
}

/// The actor's trail (map channel 16: every square it stood on this turn)
/// and the move rows' `dest_visited`.
fn check_trail(env: &Env, o: &Obs, off: (i32, i32)) {
    let f = &env.fight;
    let plane = &o.map[16 * CELLS..17 * CELLS];
    let Some(d) = env.decision() else {
        assert!(plane.iter().all(|&v| v == 0), "no trail without an actor");
        return;
    };
    let u = &f.units[d.actor];
    assert_eq!(u.trail.last(), Some(&u.pos), "the trail ends where the actor stands");
    let mut want = vec![0u8; CELLS];
    for &p in &u.trail {
        want[canvas(p, off) as usize] = 1;
    }
    assert_eq!(plane, &want[..], "trail channel");
    for (r, act) in d.legal.iter().enumerate() {
        let (want, steps) = match act {
            Act::Move(path) => {
                assert_eq!(path[0], u.pos, "a move path starts on the mover's square");
                (u.trail.contains(path.last().unwrap()) as u8 as f32, (path.len() - 1) as f32 / 12.0)
            }
            _ => (0.0, 0.0),
        };
        assert_eq!(o.cands[r * F_A + a("dest_visited")], want, "dest_visited {act:?}");
        assert_eq!(o.cands[r * F_A + a("path_steps_div12")], steps, "path_steps_div12 {act:?}");
    }
}

fn check_obs_v1(env: &Env, o: &Obs, off: (i32, i32)) {
    let f = &env.fight;
    let n = f.units.len();
    let (w, h) = (f.grid.w as usize, f.grid.h as usize);
    assert_eq!(o.creatures.len(), N * F_C);
    assert_eq!(o.global.len(), F_G);
    assert_eq!(o.map.len(), MAP_C * CELLS);
    assert_eq!(o.cands.len(), o.k * F_A);
    assert_eq!(o.cand_tgt.len(), o.k * T);
    for i in 0..N {
        assert_eq!(o.creature_mask[i], i < n, "creature mask prefix");
        if i >= n {
            assert!(o.creatures[i * F_C..(i + 1) * F_C].iter().all(|&v| v == 0.0), "creature padding");
            assert!(o.creature_ids[i * 3..i * 3 + 3].iter().all(|&v| v == -1), "creature id padding");
        } else {
            assert!(o.creature_ids[i * 3] >= 0, "kind id");
            assert_eq!(o.creature_ids[i * 3 + 1] >= 0, f.units[i].t.pc, "character id only for heroes");
            assert_eq!(o.creature_ids[i * 3 + 2] >= 0, f.units[i].concentration.is_some(), "concentration id");
        }
    }
    assert!(o.creatures.iter().chain(o.global.iter()).chain(o.cands.iter()).all(|v| v.is_finite()), "finite");
    // map: inside the map region only, padding like the outside
    let (ox, oy) = (off.0 as usize, off.1 as usize);
    for y in 0..S {
        for x in 0..S {
            let inside = x >= ox && x < ox + w && y >= oy && y < oy + h;
            assert_eq!(chan(o, 0, x, y), inside as u8);
            if !inside {
                for ch in 1..MAP_C {
                    let want = if ch == 13 { 255 } else { 0 };
                    assert_eq!(chan(o, ch, x, y), want, "padding channel {ch}");
                }
            }
        }
    }
    let ones = |ch: usize| o.map[ch * CELLS..(ch + 1) * CELLS].iter().filter(|&&v| v == 1).count();
    // A creature masked from the view team (G8b) shows no square, its corpse
    // included: a goblin that dies while hidden keeps the status, and natural20
    // does not see it either (reachable in native play since N20-040).
    let masked = env.decision().map_or(0, |d| ember_rs::encode::masked_from(f, d.team));
    // A fatal reaction can leave two bodies on one transit square. The plane marks cells.
    let dead = f.units.iter().enumerate().filter(|&(i, u)| u.dead() && masked & (1 << i) == 0)
        .map(|(_, u)| u.pos).collect::<std::collections::HashSet<_>>().len();
    assert_eq!(ones(10), dead, "corpses");
    match env.decision() {
        None => {
            assert_eq!(o.actor, -1);
            assert_eq!(o.native_choice, -1);
            assert_eq!(ones(5), 0);
        }
        Some(d) => {
            assert_eq!(o.actor as usize, d.actor);
            assert_eq!(ones(5), 1, "one actor square");
            assert_eq!(chan(o, 5, (f.units[d.actor].pos.0 as usize) + ox, f.units[d.actor].pos.1 as usize + oy), 1);
            // hidden enemies the view does not see (G8b mask): no token, no position
            let masked = ember_rs::encode::masked_from(f, d.team);
            for i in (0..n).filter(|&i| masked & (1 << i) != 0) {
                let p = f.units[i].pos;
                for ch in 6..=9 {
                    assert_eq!(chan(o, ch, p.0 as usize + ox, p.1 as usize + oy), 0, "masked token channel {ch}");
                }
                assert_eq!(o.creatures[i * F_C + c("x_div32")], 0.0, "masked position");
                assert_eq!(o.creatures[i * F_C + c("hidden")], 1.0);
            }
            let legal = d.legal.len();
            assert!(legal <= o.k);
            for r in 0..o.k {
                assert_eq!(o.cand_mask[r], r < legal, "cand mask prefix");
                if r >= legal {
                    assert!(o.cands[r * F_A..(r + 1) * F_A].iter().all(|&v| v == 0.0));
                    assert!(o.cand_ids[r * 3..r * 3 + 3].iter().all(|&v| v == -1));
                    assert!(o.cand_tgt[r * T..(r + 1) * T].iter().all(|&v| v == -1));
                    assert!(o.cand_tgt_n[r * T..(r + 1) * T].iter().all(|&v| v == 0));
                    assert_eq!(o.cand_cell[r], -1);
                    assert_eq!(o.native_raw[r], 0.0);
                    assert!(!o.native_dropped[r]);
                }
            }
            if let Some(end) = d.end_turn_row() {
                assert_eq!(o.cand_ids[end * 3], 14, "End Turn last");
            } else {
                for r in 0..legal {
                    assert_eq!(&o.cand_ids[r * 3..r * 3 + 2], &[7, 20], "Scorching Ray target choice");
                    assert_eq!(o.cands[r * F_A + a("no_cost")], 1.0);
                    assert_eq!(o.cands[r * F_A + a("uses_action")], 0.0);
                }
            }
            for (r, act) in d.legal.iter().enumerate() {
                check_row(env, o, r, act, off);
            }
            // native arrays as the decision has them
            match &d.native_raw {
                Some(raw) => {
                    for r in 0..legal {
                        assert_eq!(o.native_raw[r], raw[r] as f32);
                        assert_eq!(o.native_dropped[r], d.native_dropped.as_ref().unwrap()[r]);
                    }
                    assert_eq!(o.native_choice as usize, d.native_choice.unwrap());
                    assert!(!o.native_dropped[o.native_choice as usize] && !o.native_dropped[legal - 1]);
                }
                None if env.scores() => {
                    // Stand first: Stand 0, every other row -inf
                    let s = o.native_choice as usize;
                    assert!(matches!(d.legal[s], Act::Stand));
                    for r in 0..legal {
                        assert_eq!(o.native_raw[r], if r == s { 0.0 } else { f32::NEG_INFINITY });
                    }
                }
                None => {
                    assert_eq!(o.native_choice, -1);
                    assert!(o.native_raw[..legal].iter().all(|v| v.is_nan()));
                }
            }
        }
    }
}

/// One candidate row: its pointers and the descriptors that identify it.
fn check_row(env: &Env, o: &Obs, r: usize, act: &Act, off: (i32, i32)) {
    let f = &env.fight;
    let n = f.units.len();
    let row = &o.cands[r * F_A..(r + 1) * F_A];
    let tg: Vec<(i16, u8)> = (0..T).map(|j| (o.cand_tgt[r * T + j], o.cand_tgt_n[r * T + j])).collect();
    for &(t, m) in &tg {
        assert!(t >= -1 && (t as i64) < n as i64, "pointer in range");
        assert_eq!(t >= 0, m > 0, "multiplicity exactly where set");
    }
    let set: Vec<(usize, u8)> = tg.iter().filter(|e| e.0 >= 0).map(|&(t, m)| (t as usize, m)).collect();
    let cell = o.cand_cell[r];
    if cell >= 0 {
        let (x, y) = (cell as i32 % S as i32 - off.0, cell as i32 / S as i32 - off.1);
        assert!(f.grid.in_bounds(x, y), "cell inside the map");
    }
    let p = row[a("p_success")];
    assert!((0.0..=1.0 + 1e-6).contains(&p), "p_success {p}");
    assert!(row[a("p_crit")] <= p + 1e-6);
    let d = env.decision().unwrap();
    match act {
        Act::Move(path) => {
            assert_eq!(cell, canvas(*path.last().unwrap(), off));
            assert!(set.is_empty());
            let dirs: f32 = row[a("dir_nw")..a("dir_nw") + 8].iter().sum();
            assert_eq!(dirs, 1.0, "one direction");
            assert_eq!(o.cand_ids[r * 3], 0);
        }
        Act::Attack { atk, target, .. } => {
            assert_eq!(set, vec![(*target, 1)]);
            assert_eq!(cell, -1);
            assert_eq!(row[a("weapon_attack")], 1.0);
            let def = &f.units[d.actor].t.attacks[*atk];
            assert_eq!(row[a("thrown")], def.thrown as u8 as f32);
            if def.save_attack.is_none() {
                // AttackAction.ai_value's hit chance
                let (to_hit, _, _) = f.attack_numbers(d.actor, *atk);
                let (adv, dis) = f.advantage(d.actor, *target, def);
                let want = prob_at_least(20, to_hit, f.armor_class(*target) + f.cover_bonus_from(f.units[d.actor].pos, *target), Fight::mode_of(adv, dis));
                assert!((p - want as f32).abs() < 1e-6, "attack P(hit) {p} != {want}");
            }
        }
        Act::BlindAttack { square, .. } => {
            assert_eq!(cell, canvas(*square, off));
            assert_eq!(row[a("blind")], 1.0);
        }
        Act::Spell(c) => {
            assert_eq!(o.cand_ids[r * 3 + 1] >= 0, true);
            if let Some(pt) = c.point {
                assert_eq!(cell, canvas(pt, off));
            } else {
                assert_eq!(cell, -1);
                let mut want: Vec<(usize, u8)> = Vec::new();
                for &t in &c.targets {
                    match want.iter_mut().find(|e| e.0 == t) {
                        Some(e) => e.1 += 1,
                        None => want.push((t, 1)),
                    }
                }
                want.truncate(T);
                assert_eq!(set, want, "spell targets with multiplicity");
            }
        }
        Act::DivineSpark { target, .. } | Act::SpiritualWeaponAttack { target } => assert_eq!(set, vec![(*target, 1)]),
        Act::PreserveLife(alloc) => {
            let want: Vec<(usize, u8)> = alloc.iter().map(|e| (e.0, 1)).take(T).collect();
            assert_eq!(set, want);
        }
        Act::EndTurn => {
            assert_eq!(row[a("is_end_turn")], 1.0);
            assert!(set.is_empty() && cell == -1);
        }
        _ => {}
    }
}

/// The actor BFS, threat, exposure and the move rows' enemy steps against
/// direct computations (`map.rs`, `Grid::bfs`).
fn check_reference(env: &Env, o: &Obs) {
    let f = &env.fight;
    let g = &f.grid;
    let Some(d) = env.decision() else { return };
    let actor = d.actor;
    let view = d.team;
    // the per-team visibility mask (G8b): hidden enemies the view team
    // does not see are not on the map, block no path and threaten nothing
    let masked = ember_rs::encode::masked_from(f, view);
    let hid = |u: usize| masked & (1 << u) != 0;
    let enemies: Vec<usize> =
        (0..f.units.len()).filter(|&e| f.units[e].team != view && f.units[e].conscious() && !hid(e)).collect();
    // threat and exposure
    for y in 0..g.h {
        for x in 0..g.w {
            let mut threat = 0;
            let mut exposure = 0;
            for &e in &enemies {
                let u = &f.units[e];
                if let Some(r) = u.t.melee_ft {
                    if r > 0 && u.has_reaction() && (u.pos.0 - x).abs().max((u.pos.1 - y).abs()) * 5 <= r {
                        threat += 1;
                    }
                }
                exposure += g.los(u.pos, (x, y)) as u8;
            }
            assert_eq!(chan(o, 11, x as usize, y as usize), threat, "threat at ({x}, {y})");
            assert_eq!(chan(o, 12, x as usize, y as usize), exposure, "exposure at ({x}, {y})");
        }
    }
    // the actor's moves: straightforward BFS (a Frightened actor never steps
    // closer to a source of its fear, N20-042: `Fight::step_toward_fear`)
    let free = |p: Pos| !g.is_wall(p.0, p.1) && f.token_at(p).is_none_or(|t| t == actor || hid(t));
    let pc = f.units[actor].t.pc;
    let mut steps = vec![u16::MAX; g.cells()];
    let start = f.units[actor].pos;
    steps[g.index(start.0, start.1)] = 0;
    if f.rule_version() >= 9 && f.units[actor].t.incorporeal {
        // Independent relaxation for the Specter's weighted paths through solid and occupied squares.
        loop {
            let mut changed = false;
            for i in 0..g.cells() {
                if steps[i] == u16::MAX { continue; }
                let (x, y) = g.pos_of(i);
                for nx in x - 1..=x + 1 {
                    for ny in y - 1..=y + 1 {
                        if !g.in_bounds(nx, ny) || f.step_toward_fear(actor, (x, y), (nx, ny)) { continue; }
                        let cost = 1 + u16::from(g.is_wall(nx, ny) || f.token_at((nx, ny)).is_some_and(|u| u != actor && !hid(u)));
                        let next = steps[i] + cost;
                        let j = g.index(nx, ny);
                        if next < steps[j] { steps[j] = next; changed = true; }
                    }
                }
            }
            if !changed { break; }
        }
        for (i, unit) in f.units.iter().enumerate() {
            if i != actor && !unit.dead() && !hid(i) { steps[g.index(unit.pos.0, unit.pos.1)] = u16::MAX; }
        }
    } else {
        let mut queue = std::collections::VecDeque::from([start]);
        while let Some((x, y)) = queue.pop_front() {
            let s = steps[g.index(x, y)];
            for dx in -1..=1 {
                for dy in -1..=1 {
                    let q = (x + dx, y + dy);
                    if (dx == 0 && dy == 0) || !free(q) {
                        continue;
                    }
                    if pc && dx != 0 && dy != 0 && !(free((x + dx, y)) && free((x, y + dy))) {
                        continue;
                    }
                    if f.step_toward_fear(actor, (x, y), q) {
                        continue;
                    }
                    if steps[g.index(q.0, q.1)] == u16::MAX {
                        steps[g.index(q.0, q.1)] = s + 1;
                        queue.push_back(q);
                    }
                }
            }
        }
    }
    let u = &f.units[actor];
    let step = 1 + u.prone() as i32;
    let budget = u.available_movement() / 5;
    let dash = if u.action > 0 { (u.available_movement() + f.speed_of(actor)) / 5 } else { budget };
    for y in 0..g.h {
        for x in 0..g.w {
            let s = steps[g.index(x, y)];
            let (want_path, want_reach) = if s == u16::MAX {
                (255, 0)
            } else {
                let c = s as i32 * step;
                (c.min(254) as u8, if c <= budget { 2 } else if c <= dash { 1 } else { 0 })
            };
            assert_eq!(chan(o, 13, x as usize, y as usize), want_path, "path cost at ({x}, {y})");
            assert_eq!(chan(o, 14, x as usize, y as usize), want_reach, "reachable at ({x}, {y})");
            assert_eq!(chan(o, 15, x as usize, y as usize), g.los(start, (x, y)) as u8);
        }
    }
    // the move rows' steps to the nearest enemy (A* neighbour rule)
    let dist: Vec<Vec<i32>> = enemies.iter().map(|&e| g.bfs(f.units[e].pos)).collect();
    let near = |p: Pos| -> f32 {
        let best = dist.iter().map(|d| d[g.index(p.0, p.1)]).filter(|&v| v >= 0).min();
        best.map_or(1.0, |b| (b.min(32)) as f32 / 32.0)
    };
    for (r, act) in d.legal.iter().enumerate() {
        if let Act::Move(path) = act {
            let row = &o.cands[r * F_A..(r + 1) * F_A];
            assert_eq!(row[a("enemy_steps_before_div32")], near(start), "enemy steps before");
            assert_eq!(row[a("enemy_steps_after_div32")], near(*path.last().unwrap()), "enemy steps after");
        }
    }
    // the creature tokens' path cost (a free square next to it, plus a step)
    for (i, t) in f.units.iter().enumerate() {
        let got = o.creatures[i * F_C + c("path_cost_div32")];
        let want = if i == actor {
            0.0
        } else if hid(i) {
            -1.0
        } else {
            let mut best: Option<i32> = None;
            for dx in -1..=1 {
                for dy in -1..=1 {
                    let q = (t.pos.0 + dx, t.pos.1 + dy);
                    if (dx, dy) != (0, 0) && g.in_bounds(q.0, q.1) && steps[g.index(q.0, q.1)] != u16::MAX {
                        let cst = (steps[g.index(q.0, q.1)] as i32 + 1) * step;
                        best = Some(best.map_or(cst, |b: i32| b.min(cst)));
                    }
                }
            }
            best.map_or(-1.0, |b| b as f32 / 32.0)
        };
        assert_eq!(got, want, "path cost token {i}");
    }
}

/// Unit index `i` of `e` becomes `perm[i]` of the permuted env: tokens move,
/// pointers follow, everything else is the same.
fn check_permuted(env: &Env, o: &Obs) {
    let n = env.fight.units.len();
    let perm: Vec<usize> = (0..n).map(|i| (i * 7 + 3) % n).collect();
    let mut seen = vec![false; n];
    let perm: Vec<usize> = if perm.iter().all(|&p| !std::mem::replace(&mut seen[p], true)) {
        perm
    } else {
        (0..n).rev().collect()
    };
    let e2 = env.permuted(&perm);
    let o2 = Obs::of(&e2, None, (0, 0), &OBJ).unwrap();
    let close = |x: f32, y: f32| (x - y).abs() <= 1e-5 * (1.0 + x.abs());
    for i in 0..n {
        let j = perm[i];
        assert_eq!(&o.creatures[i * F_C..(i + 1) * F_C], &o2.creatures[j * F_C..(j + 1) * F_C], "token {i} -> {j}");
        assert_eq!(&o.creature_ids[i * 3..i * 3 + 3], &o2.creature_ids[j * 3..j * 3 + 3]);
    }
    assert_eq!(o.map, o2.map, "map unchanged");
    for k in 0..F_G {
        assert!(close(o.global[k], o2.global[k]), "global {}", GLOBAL_FEATURES[k]);
    }
    assert_eq!(o.k, o2.k);
    for k in 0..o.k * F_A {
        assert!(close(o.cands[k], o2.cands[k]), "cand {} row {}: {} vs {}", CAND_FEATURES[k % F_A], k / F_A, o.cands[k], o2.cands[k]);
    }
    assert_eq!(o.cand_ids, o2.cand_ids);
    assert_eq!(o.cand_cell, o2.cand_cell);
    assert_eq!(o2.actor as usize, perm[o.actor as usize]);
    for r in 0..o.k {
        let mut a1: Vec<(i16, u8)> = (0..T)
            .map(|j| (o.cand_tgt[r * T + j], o.cand_tgt_n[r * T + j]))
            .map(|(t, m)| (if t >= 0 { perm[t as usize] as i16 } else { -1 }, m))
            .collect();
        let mut a2: Vec<(i16, u8)> = (0..T).map(|j| (o2.cand_tgt[r * T + j], o2.cand_tgt_n[r * T + j])).collect();
        a1.sort();
        a2.sort();
        assert_eq!(a1, a2, "row {r} pointers remapped");
    }
    assert_eq!(o.native_choice, o2.native_choice);
    assert_eq!(o.native_dropped, o2.native_dropped);
    assert!(o.native_raw.iter().zip(&o2.native_raw).all(|(x, y)| x.to_bits() == y.to_bits()));
    for i in 0..n {
        for j in 0..n {
            let (a1, a2) = ((i * N + j) * R, (perm[i] * N + perm[j]) * R);
            assert_eq!(&o.creature_rel[a1..a1 + R], &o2.creature_rel[a2..a2 + R], "relations ({i}, {j}) permuted");
        }
    }
}

/// The map at another canvas offset: the same arrays, shifted.
fn check_offset(env: &Env, o: &Obs) {
    let gr = &env.fight.grid;
    let off = (S as i32 - gr.w, S as i32 - gr.h);
    let off = if off == (0, 0) { (0, 0) } else { off };
    let o2 = Obs::of(env, None, off, &OBJ).unwrap();
    check_obs(env, &o2, off);
    for ch in 0..MAP_C {
        for y in 0..gr.h as usize {
            for x in 0..gr.w as usize {
                assert_eq!(chan(o, ch, x, y), chan(&o2, ch, x + off.0 as usize, y + off.1 as usize), "channel {ch}");
            }
        }
    }
    let view = env.decision().unwrap().team;
    let masked = ember_rs::encode::masked_from(&env.fight, view);
    for i in 0..env.fight.units.len() {
        for k in 0..F_C {
            let (x, y) = (o.creatures[i * F_C + k], o2.creatures[i * F_C + k]);
            if masked & (1 << i) != 0 {
                // a hidden creature's position is not written (G8b mask)
                assert_eq!(x, y, "{} (masked)", CREATURE_FEATURES[k]);
            } else if k == c("x_div32") {
                assert_eq!(y, x + off.0 as f32 / 32.0);
            } else if k == c("y_div32") {
                assert_eq!(y, x + off.1 as f32 / 32.0);
            } else {
                assert_eq!(x, y, "{}", CREATURE_FEATURES[k]);
            }
        }
    }
    for r in 0..o.k {
        let want = if o.cand_cell[r] < 0 { -1 } else { o.cand_cell[r] + (off.1 * S as i32 + off.0) as i16 };
        assert_eq!(o2.cand_cell[r], want);
    }
    assert_eq!(o.cands, o2.cands);
    assert_eq!(o.global, o2.global);
    assert_eq!(o.cand_tgt, o2.cand_tgt);
    assert_eq!(o.creature_rel, o2.creature_rel, "relations do not depend on the offset");
}

/// The view team of an observation (the deciding team, or a final view's).
fn view_of(o: &Obs) -> u8 {
    if o.global[g("view_heroes")] == 1.0 {
        0
    } else {
        1
    }
}

/// `creature_rel` against the engine state (computed here from the unit
/// fields and the effect API), and the token features that summarize it.
fn check_relations(env: &Env, o: &Obs) {
    assert_eq!(o.version, Version::V2);
    assert_eq!(o.creature_rel.len(), N * N * R);
    let f = &env.fight;
    let n = f.units.len();
    let gt = f.gt();
    let view = view_of(o);
    let masked = encode::masked_from(f, view);
    let hid = |u: usize| masked & (1 << u) != 0;
    let rel = |i: usize, j: usize, r: usize| o.creature_rel[(i * N + j) * R + r];
    assert!(o.creature_rel.iter().all(|&v| v <= 1), "relations are 0/1");
    for i in 0..N {
        for j in 0..N {
            for r in 0..R {
                let v = rel(i, j, r);
                if i >= n || j >= n || i == j {
                    assert_eq!(v, 0, "padding or diagonal ({i}, {j}, {})", RELATIONS[r]);
                    continue;
                }
                let (ui, uj) = (&f.units[i], &f.units[j]);
                let live = !ui.dead() && !uj.dead();
                let want = live
                    && match RELATIONS[r] {
                        "frightened_of" => {
                            ui.frightened_by.iter().any(|&(s, until)| s == j && gt < until)
                                || ui.source_fear.iter().any(|&(s, _)| s == j)
                        }
                        "save_immune" => ui.save_immune_to.iter().any(|&(s, _)| s == j) || ui.stench_immune.contains(&j),
                        "effect_from" => {
                            ui.effects.iter().any(|(key, _)| {
                                f.active_effects(i, *key).iter().any(|&ob| {
                                    let x = &f.objs[ob as usize];
                                    x.source == j && !x.ended
                                })
                            }) || ui.sap == Some(j)
                                || ui.stench_poison.contains(&j)
                                || ui.turned_by.iter().any(|&(s, until, _)| s == j && gt < until && !uj.incapacitated())
                        }
                        "sees" => !hid(i) && !hid(j) && f.can_see(i, j),
                        "in_reach" => {
                            !hid(i) && !hid(j) && uj.t.melee_ft.is_some_and(|rch| rch > 0 &&
                                (uj.pos.0 - ui.pos.0).abs().max((uj.pos.1 - ui.pos.1).abs()) * 5 <= rch)
                        }
                        other => panic!("{other}"),
                    };
                assert_eq!(v, want as u8, "{} ({i} -> {j})", RELATIONS[r]);
            }
        }
    }
    // token summaries of the relations
    let actor = (o.actor >= 0).then_some(o.actor as usize);
    for i in 0..n {
        let row = &o.creatures[i * F_C..(i + 1) * F_C];
        let out: u32 = (0..n).map(|j| rel(i, j, 0) as u32).sum();
        let into: u32 = (0..n).map(|j| rel(j, i, 0) as u32).sum();
        assert_eq!(row[c("fear_sources_div4")], out as f32 / 4.0);
        assert_eq!(row[c("frightens_div4")], into as f32 / 4.0);
        assert_eq!(row[c("cursed")], f.units[i].cursed as u8 as f32);
        let dis = !hid(i) && (0..n).any(|j| rel(i, j, 0) == 1 && f.can_see(i, j));
        assert_eq!(row[c("fear_disadvantage")], dis as u8 as f32, "fear_disadvantage {i}");
        let (fa, fb, ia, ib) = match actor {
            Some(a) => (rel(i, a, 0), rel(a, i, 0), rel(i, a, 1), rel(a, i, 1)),
            None => (0, 0, 0, 0),
        };
        assert_eq!(row[c("fears_actor")], fa as f32);
        assert_eq!(row[c("feared_by_actor")], fb as f32);
        assert_eq!(row[c("save_immune_to_actor")], ia as f32);
        assert_eq!(row[c("actor_save_immune")], ib as f32);
    }
    // party levels: mean (v1), min and max (v2)
    let levels: Vec<i32> =
        f.units.iter().filter(|u| u.t.pc).map(|u| u.t.fighter_level.max(u.t.caster.as_ref().map_or(0, |c| c.level))).collect();
    if let (Some(lo), Some(hi)) = (levels.iter().min(), levels.iter().max()) {
        assert_eq!(o.global[g("party_level_min_div5")], *lo as f32 / 5.0);
        assert_eq!(o.global[g("party_level_max_div5")], *hi as f32 / 5.0);
    }
}

/// `ember-gen-v1` is the prefix of every v2 array (and has no relations).
fn check_v1_prefix(env: &Env, o: &Obs, team: Option<u8>, off: (i32, i32)) {
    let v1 = Obs::of_version(env, team, off, &OBJ, Version::V1).unwrap();
    assert_eq!(v1.version, Version::V1);
    assert!(v1.creature_rel.is_empty());
    assert_eq!((v1.creatures.len(), v1.global.len(), v1.cands.len()), (N * F_C_V1, F_G_V1, o.k * F_A_V1));
    for i in 0..N {
        assert_eq!(&v1.creatures[i * F_C_V1..(i + 1) * F_C_V1], &o.creatures[i * F_C..i * F_C + F_C_V1], "token {i}");
    }
    assert_eq!(&v1.global[..], &o.global[..F_G_V1]);
    for r in 0..o.k {
        let (x, y) = (&v1.cands[r * F_A_V1..(r + 1) * F_A_V1], &o.cands[r * F_A..r * F_A + F_A_V1]);
        assert!(x.iter().zip(y).all(|(a, b)| a.to_bits() == b.to_bits()), "row {r}");
    }
    assert_eq!(v1.map.len(), MAP_C_V1 * CELLS);
    assert_eq!(&v1.map[..], &o.map[..MAP_C_V1 * CELLS]);
    assert_eq!((&v1.creature_ids, &v1.creature_mask), (&o.creature_ids, &o.creature_mask));
    assert_eq!((&v1.cand_ids, &v1.cand_tgt, &v1.cand_tgt_n, &v1.cand_cell), (&o.cand_ids, &o.cand_tgt, &o.cand_tgt_n, &o.cand_cell));
    assert_eq!((v1.actor, v1.native_choice, &v1.native_dropped), (o.actor, o.native_choice, &o.native_dropped));
    assert!(v1.native_raw.iter().zip(&o.native_raw).all(|(a, b)| a.to_bits() == b.to_bits()));
}

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

/// Off-policy games on every fifth fixture setup: every decision passes the
/// invariants; sampled ones the reference, permutation and offset checks.
#[test]
fn invariants_on_played_games() {
    let mut checked = 0;
    for (k, s) in some_setups().iter().enumerate() {
        for (seed, chooser) in [(11u64 + k as u64, "eps:0.3"), (500 + k as u64, "uniform")] {
            // scores off only with the uniform chooser (eps needs native choices)
            let scores = chooser != "uniform" || seed % 2 == 1;
            let mut env = env_for(s, seed, [EXT, EXT], scores);
            play(&mut env, chooser, seed, 250, |env, i| {
                let o = obs(env);
                check_obs(env, &o, (0, 0));
                checked += 1;
                if i % 3 == 0 {
                    check_v1_prefix(env, &o, None, (0, 0));
                }
                if i % 9 == 0 {
                    check_reference(env, &o);
                    check_permuted(env, &o);
                    check_offset(env, &o);
                }
            });
        }
    }
    assert!(checked > 2000, "only {checked} decisions");
}

/// Off-policy fixture tapes replayed through the dump path (natural20's own
/// states): every row passes the invariants of a decision or final view.
#[test]
fn replayed_offpolicy_fixtures() {
    let files: Vec<PathBuf> =
        fixture_files().into_iter().filter(|f| f.file_name().unwrap().to_string_lossy().starts_with("g4a_")).collect();
    assert!(!files.is_empty());
    for f in &files {
        let mut dump = Dump::default();
        dump.add_source(f, &DumpOpts::default()).unwrap_or_else(|e| panic!("{e}"));
        let s = &dump.sources[0];
        assert!(s.replayed, "{}", f.display());
        assert_eq!(dump.live.iter().filter(|&&l| !l).count(), 2, "two final views");
        assert_eq!(dump.live.iter().filter(|&&l| l).count() as u64, s.decisions[0] + s.decisions[1]);
        for (o, live) in dump.rows.iter().zip(&dump.live) {
            assert_eq!(o.actor >= 0, *live);
            assert_eq!(o.cand_mask.iter().filter(|&&m| m).count() > 0, *live);
        }
    }
}

/// The final view: no rows, no actor, actor-relative features at their
/// no-actor values; both teams' views mirror each other.
#[test]
fn final_view_and_team_views() {
    for (k, s) in some_setups().iter().enumerate().take(8) {
        let env = env_for(s, 77 + k as u64, [NAT, NAT], true);
        assert!(env.decision().is_none(), "a native game runs to the end in reset");
        assert!(Obs::of(&env, None, (0, 0), &OBJ).is_err(), "a final view needs a team");
        let oh = Obs::of(&env, Some(0), (0, 0), &OBJ).unwrap();
        let om = Obs::of(&env, Some(1), (0, 0), &OBJ).unwrap();
        for o in [&oh, &om] {
            check_obs(&env, o, (0, 0));
            assert_eq!(o.k, 0);
            for i in 0..env.fight.units.len() {
                let row = &o.creatures[i * F_C..(i + 1) * F_C];
                for name in ["is_actor", "dx_div32", "dy_div32", "dist_div32", "cheb_div32", "in_actor_reach", "actor_sees",
                             "sees_actor", "is_current", "fears_actor", "feared_by_actor", "save_immune_to_actor",
                             "actor_save_immune"] {
                    assert_eq!(row[c(name)], 0.0, "{name}");
                }
                assert_eq!(row[c("path_cost_div32")], -1.0);
            }
            assert_eq!(o.global[g("has_actor")], 0.0);
            assert!(o.map[13 * CELLS..14 * CELLS].iter().all(|&v| v == 255));
            assert!(o.map[14 * CELLS..17 * CELLS].iter().all(|&v| v == 0), "no reach, LOS or trail without an actor");
            check_v1_prefix(&env, o, Some(view_of(o)), (0, 0));
        }
        // the two views: ally and enemy swap, nothing else about the creatures
        for i in 0..env.fight.units.len() {
            let (rh, rm) = (&oh.creatures[i * F_C..(i + 1) * F_C], &om.creatures[i * F_C..(i + 1) * F_C]);
            assert_eq!(rh[c("ally")], rm[c("enemy")]);
            assert_eq!(rh[c("enemy")], rm[c("ally")]);
            for k in (0..F_C).filter(|&k| k != c("ally") && k != c("enemy")) {
                assert_eq!(rh[k], rm[k], "{}", CREATURE_FEATURES[k]);
            }
        }
        for (x, y) in [(6, 7), (8, 9)] {
            assert_eq!(oh.map[x * CELLS..(x + 1) * CELLS], om.map[y * CELLS..(y + 1) * CELLS]);
        }
        for (x, y) in [("ally_hp_frac", "enemy_hp_frac"), ("ally_standing_frac", "enemy_standing_frac"),
                       ("ally_count_div16", "enemy_count_div16"), ("ally_hp_div100", "enemy_hp_div100"),
                       ("ally_dpr_div50", "enemy_dpr_div50")] {
            assert_eq!(oh.global[g(x)], om.global[g(y)], "{x}");
        }
        assert_eq!(oh.global[g("view_heroes")], 1.0);
        assert_eq!(om.global[g("view_heroes")], 0.0);
    }
    // a live decision is seen from the deciding team only
    let s = &some_setups()[0];
    let env = env_for(s, 5, [EXT, EXT], true);
    let d = env.decision().unwrap();
    let mine = Obs::of(&env, Some(d.team), (0, 0), &OBJ).unwrap();
    assert_eq!(mine.digest(), obs(&env).digest());
    assert!(Obs::of(&env, Some(1 - d.team), (0, 0), &OBJ).is_err());
    // offsets that do not fit are refused
    let gw = env.fight.grid.w;
    assert!(Obs::of(&env, None, (S as i32 - gw + 1, 0), &OBJ).is_err());
    assert!(Obs::of(&env, None, (-1, 0), &OBJ).is_err());
}

/// Bit-identical observations for the same game, on any thread; encoding
/// changes nothing in the game.
#[test]
fn determinism_and_no_side_effects() {
    let s = some_setups()[3].clone();
    let run = move || {
        let s = &s;
        let mut env = env_for(s, 9, [EXT, EXT], true);
        let mut digests = Vec::new();
        play(&mut env, "eps:0.5", 9, 200, |env, _| {
            let before = format!("{:?}{:?}", env.fight.units, env.fight.objs);
            let o = obs(env);
            assert_eq!(format!("{:?}{:?}", env.fight.units, env.fight.objs), before, "encode changed the game");
            assert_eq!(o.digest(), obs(env).digest(), "encode twice");
            digests.push(o.digest());
        });
        digests
    };
    let run2 = run.clone();
    let a = run();
    let b = std::thread::spawn(run2).join().unwrap();
    assert_eq!(a, b);
    assert!(a.len() > 50);
}

/// A snapshot restored and continued with the same rows encodes exactly as
/// the uninterrupted game.
#[test]
fn snapshot_parity() {
    for s in some_setups().iter().take(6) {
        let mut env = env_for(s, 21, [EXT, EXT], true);
        let mut pick = Chooser::parse("eps:0.4", 21).unwrap();
        for _ in 0..12 {
            let Some(d) = env.decision() else { break };
            let row = pick.pick(d);
            env.step(row).unwrap();
        }
        let snap = env.snapshot();
        let pick_snap = pick.clone();
        let cont = |env: &mut Env, pick: &mut Chooser| {
            let mut out = Vec::new();
            for _ in 0..40 {
                let Some(d) = env.decision() else { break };
                out.push(obs(env).digest());
                let row = pick.pick(d);
                env.step(row).unwrap();
            }
            if env.decision().is_none() {
                out.push(Obs::of(env, Some(0), (0, 0), &OBJ).unwrap().digest());
            }
            out
        };
        let first = cont(&mut env, &mut pick);
        let mut restored = env.clone();
        restored.restore(&snap, None);
        let mut pick2 = pick_snap;
        assert_eq!(first, cont(&mut restored, &mut pick2), "{}", s.name);
    }
}

/// The scores flag: off gives NaN rows and no native choice; the other
/// arrays are the same as with scores on.
#[test]
fn scores_off_arrays() {
    let s = &some_setups()[1];
    let on = env_for(s, 3, [EXT, EXT], true);
    let off = env_for(s, 3, [EXT, EXT], false);
    let (a1, a2) = (obs(&on), obs(&off));
    check_obs(&off, &a2, (0, 0));
    assert_eq!(a1.cands, a2.cands);
    assert_eq!(a1.map, a2.map);
    assert_eq!(a1.creatures, a2.creatures);
    assert!(a1.native_choice >= 0);
    assert_eq!(a2.native_choice, -1);
}

/// Feature names: counts, uniqueness, groups in `Dmg` and `Ability` order,
/// `docs/FEATURES.md` up to date; vocabulary ids for every pool entry and
/// the trainer's fixed action-kind ids.
#[test]
fn feature_names_and_vocab() {
    use ember_rs::content::{Ability, Dmg};
    let names = encode::feature_names();
    assert_eq!((names.creature.len(), names.global.len(), names.cand.len(), names.map.len(), names.relations.len()),
               (F_C, F_G, F_A, MAP_C, R));
    for list in [names.creature, names.global, names.cand, names.map, names.relations] {
        let mut v = list.to_vec();
        v.sort();
        v.dedup();
        assert_eq!(v.len(), list.len(), "duplicate names");
    }
    for (k, d) in Dmg::ALL.iter().enumerate() {
        assert_eq!(CREATURE_FEATURES[c("resist_acid") + k], format!("resist_{}", d.name()));
        assert_eq!(CREATURE_FEATURES[c("vuln_acid") + k], format!("vuln_{}", d.name()));
        assert_eq!(CREATURE_FEATURES[c("immune_acid") + k], format!("immune_{}", d.name()));
        assert_eq!(CAND_FEATURES[a("dmg_acid") + k], format!("dmg_{}", d.name()));
    }
    for ab in Ability::ALL {
        assert_eq!(CREATURE_FEATURES[c("str_mod_div5") + ab.idx()], format!("{}_mod_div5", ab.short()));
        assert_eq!(CREATURE_FEATURES[c("save_str_div10") + ab.idx()], format!("save_{}_div10", ab.short()));
        assert_eq!(CAND_FEATURES[a("save_vs_str") + ab.idx()], format!("save_vs_{}", ab.short()));
    }
    let doc = std::fs::read_to_string(Path::new(env!("CARGO_MANIFEST_DIR")).join("docs/FEATURES.md")).unwrap();
    assert_eq!(doc, encode::features_markdown(), "docs/FEATURES.md is stale: ember features --markdown >| docs/FEATURES.md");
    let pool = ContentPool::global();
    let ids = encode::EncIds::of(pool);
    assert!(ids.missing(pool).is_empty(), "{:?}", ids.missing(pool));
    for (k, name) in encode::ACTION_KINDS.iter().enumerate() {
        assert_eq!(pool.vocab.id("action_kinds", name), Some(k as u16), "{name}");
    }
    assert_eq!(encode::FEATURE_VERSION, "ember-gen-v2");
    // the versions: v1 names are the v2 prefixes; dims follow
    let v1 = Version::V1.names();
    assert_eq!((v1.creature.len(), v1.global.len(), v1.cand.len(), v1.map.len(), v1.relations.len()),
               (F_C_V1, F_G_V1, F_A_V1, MAP_C_V1, 0));
    assert_eq!((MAP_CHANNELS[MAP_C_V1 - 1], MAP_CHANNELS[MAP_C_V1]), ("actor_los", "actor_trail"));
    assert_eq!(v1.creature, &CREATURE_FEATURES[..F_C_V1]);
    assert_eq!(v1.global, &GLOBAL_FEATURES[..F_G_V1]);
    assert_eq!(v1.cand, &CAND_FEATURES[..F_A_V1]);
    assert_eq!((CREATURE_FEATURES[F_C_V1 - 1], CREATURE_FEATURES[F_C_V1]), ("stench_dc_div20", "cursed"));
    assert_eq!((GLOBAL_FEATURES[F_G_V1 - 1], GLOBAL_FEATURES[F_G_V1]), ("reserved_31", "party_level_min_div5"));
    assert_eq!((CAND_FEATURES[F_A_V1 - 1], CAND_FEATURES[F_A_V1]), ("stand", "rider_curse"));
    assert_eq!(c("hidden"), 98, "natural20 ember_rl/search.py HIDDEN_FEATURE");
    for v in Version::ALL {
        assert_eq!(Version::parse(v.name()), Ok(v));
        let d: std::collections::BTreeMap<&str, usize> = v.dims().iter().copied().collect();
        assert_eq!((d["creature"], d["global"], d["cand"], d["map_channels"]), (v.creature(), v.global(), v.cand(), v.map_channels()));
        assert_eq!(d.get("relations").copied().unwrap_or(0), v.relations());
    }
    assert_eq!(Version::default(), Version::V2);
    assert_eq!(Version::parse("ember-gen-v3").unwrap(), Version::V3);
    assert!(Version::parse("ember-gen-v4").is_err());
}

/// Golden digests: the first and last decision and the two final views of
/// every off-policy fixture (replayed). A change needs a `FEATURE_VERSION`
/// decision; regenerate with `EMBER_BLESS=1 cargo test --test encode golden`.
#[test]
fn golden_digests() {
    golden_digests_of(Version::V2, "tests/golden/encode-digests.txt", "EMBER_BLESS");
}

/// `ember-gen-v1` on the same states: the digests the v1 encoder wrote
/// (`tests/golden/encode-digests-v1.txt`, the G8b/Mummy-era file; never
/// re-blessed).
#[test]
fn golden_digests_v1() {
    golden_digests_of(Version::V1, "tests/golden/encode-digests-v1.txt", "EMBER_BLESS_V1");
}

fn golden_digests_of(version: Version, file: &str, bless: &str) {
    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join(file);
    let mut lines = Vec::new();
    for f in fixture_files().iter().filter(|f| f.file_name().unwrap().to_string_lossy().starts_with("g4a_")) {
        let mut dump = Dump::default();
        let opts = DumpOpts { offset: Offset::Fixed(0, 0), version, ..DumpOpts::default() };
        dump.add_source(f, &opts).unwrap();
        let live: Vec<usize> = (0..dump.len()).filter(|&i| dump.live[i]).collect();
        let fin: Vec<usize> = (0..dump.len()).filter(|&i| !dump.live[i]).collect();
        let pick = [live[0], *live.last().unwrap(), fin[0], fin[1]];
        let d: Vec<String> = pick.iter().map(|&i| format!("{:016x}", dump.rows[i].digest())).collect();
        lines.push(format!("{} {}", f.file_name().unwrap().to_string_lossy(), d.join(" ")));
    }
    let text = lines.join("\n") + "\n";
    if std::env::var(bless).is_ok() {
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(&path, &text).unwrap();
        return;
    }
    let want = std::fs::read_to_string(&path).unwrap_or_else(|_| panic!("{file} ({bless}=1 to create)"));
    assert_eq!(text, want, "{} output changed (bump FEATURE_VERSION if a feature changed meaning)", version.name());
}

/// A hand-built state on a small map: threat, exposure, path cost and the
/// creature features of a known setup.
#[test]
fn hand_built_state() {
    let rows = ["......", "..H...", "......", "......"];
    let grid = Grid::shared(&rows).unwrap();
    let units: Vec<String> = ["mara", "ilyra", "zombie-1", "ghoul-1"].iter().map(|s| s.to_string()).collect();
    let pl = |id: &str, x: i32, y: i32| Placement { id: id.into(), x, y };
    let placements = vec![pl("mara", 0, 0), pl("ilyra", 0, 3), pl("zombie-1", 4, 0), pl("ghoul-1", 5, 3)];
    let pool = ContentPool::global();
    // both external: find a hero decision
    for seed in 0..40u64 {
        let env = Env::from_units(pool, grid.clone(), &units, &placements, MAX_ROUNDS, seed, [EXT, EXT], true).unwrap();
        let Some(d) = env.decision() else { continue };
        if env.fight.units[d.actor].id != "mara" {
            continue;
        }
        let o = obs(&env);
        check_obs(&env, &o, (0, 0));
        check_reference(&env, &o);
        // the zombie (reach 5 ft) threatens its 8 neighbours while it has a
        // reaction (from its first turn on)
        let z = env.fight.units[2].has_reaction() as u8;
        assert_eq!(chan(&o, 11, 3, 0), z);
        assert_eq!(chan(&o, 11, 4, 1), z);
        assert_eq!(chan(&o, 11, 2, 0), 0);
        assert_eq!(chan(&o, 0, 6, 0), 0, "outside the 6x4 map");
        let row = |i: usize| &o.creatures[i * F_C..(i + 1) * F_C];
        assert_eq!(row(0)[c("is_actor")], 1.0);
        assert_eq!(row(1)[c("ally")], 1.0);
        assert_eq!(row(2)[c("enemy")], 1.0);
        assert_eq!(row(2)[c("undead_fortitude")], 1.0);
        assert_eq!(row(2)[c("dx_div32")], 4.0 / 32.0);
        assert_eq!(row(0)[c("ac_div20")], 19.0 / 20.0);
        assert_eq!(row(1)[c("thrown_left_div2")], 1.0, "Ilyra holds a dagger and has a spare");
        assert_eq!(row(1)[c("hand_slots_div2")], 0.75, "quarterstaff and a dagger held");
        assert_eq!(row(1)[c("free_casts_div2")], 0.5, "Magic Initiate: Magic Missile");
        assert_eq!(row(0)[c("action_surge_uses")], 1.0);
        assert_eq!(row(3)[c("cimm_poisoned")], 1.0);
        // Mara's longsword rows carry Sap
        let sap = d.legal.iter().enumerate().find(|(_, x)| matches!(x, Act::Attack { .. })).map(|(r, _)| r);
        if let Some(r) = sap {
            assert_eq!(o.cands[r * F_A + a("rider_sap")], 1.0);
        }
        return;
    }
    panic!("no hero decision for mara");
}

/// The trail (`ember-gen-v2`): a hero steps east, then the row back west is
/// a revisit; the trail covers both squares; the next turn starts a new
/// trail.
#[test]
fn trail_and_revisits() {
    let rows = ["........", "........", "........", "........"];
    let grid = Grid::shared(&rows).unwrap();
    let units: Vec<String> = ["guy", "zombie-1"].iter().map(|s| s.to_string()).collect();
    let pl = |id: &str, x: i32, y: i32| Placement { id: id.into(), x, y };
    let placements = vec![pl("guy", 1, 1), pl("zombie-1", 7, 3)];
    let mut env = Env::from_units(ContentPool::global(), grid, &units, &placements, MAX_ROUNDS, 6, [EXT, EXT], true).unwrap();
    let step = |env: &mut Env, to: Pos| {
        let d = env.decision().unwrap();
        let r = d.legal.iter().position(|x| matches!(x, Act::Move(p) if p.last() == Some(&to))).unwrap();
        env.step(r).unwrap();
    };
    let end = |env: &mut Env| {
        let n = env.decision().unwrap().legal.len();
        env.step(n - 1).unwrap();
    };
    while env.fight.units[env.decision().unwrap().actor].id != "guy" {
        end(&mut env);
    }
    let o = obs(&env);
    check_obs(&env, &o, (0, 0));
    assert_eq!(o.map[16 * CELLS..17 * CELLS].iter().filter(|&&v| v == 1).count(), 1, "the start square");
    step(&mut env, (2, 1));
    let o = obs(&env);
    check_obs(&env, &o, (0, 0));
    assert_eq!((chan(&o, 16, 1, 1), chan(&o, 16, 2, 1), chan(&o, 16, 3, 1)), (1, 1, 0));
    let d = env.decision().unwrap();
    for (r, act) in d.legal.iter().enumerate() {
        if let Act::Move(p) = act {
            let back = *p.last().unwrap() == (1, 1);
            assert_eq!(o.cands[r * F_A + a("dest_visited")], back as u8 as f32, "{act:?}");
        }
    }
    step(&mut env, (1, 1));
    step(&mut env, (2, 2));
    assert_eq!(env.fight.units[0].trail, vec![(1, 1), (2, 1), (1, 1), (2, 2)]);
    let o = obs(&env);
    check_obs(&env, &o, (0, 0));
    assert_eq!(o.map[16 * CELLS..17 * CELLS].iter().filter(|&&v| v == 1).count(), 3);
    // the v1 view has no trail
    let v1 = Obs::of_version(&env, None, (0, 0), &OBJ, Version::V1).unwrap();
    assert_eq!(v1.map.len(), 16 * CELLS);
    // a new turn: a new trail
    end(&mut env);
    while env.fight.units[env.decision().unwrap().actor].id != "guy" {
        end(&mut env);
    }
    assert_eq!(env.fight.units[0].trail, vec![(2, 2)]);
    let o = obs(&env);
    check_obs(&env, &o, (0, 0));
    assert_eq!(o.map[16 * CELLS..17 * CELLS].iter().filter(|&&v| v == 1).count(), 1);
}

/// Mixed party levels (`ember-gen-v2`): level-2 Mara with the level-3 Guy
/// and Elion: the mean (v1), the lowest and the highest level, and each
/// hero's own level.
#[test]
fn mixed_party_levels() {
    let rows = ["........", "........", "........", "........"];
    let grid = Grid::shared(&rows).unwrap();
    let units: Vec<String> = ["mara", "guy", "elion", "zombie-1"].iter().map(|s| s.to_string()).collect();
    let pl = |id: &str, x: i32, y: i32| Placement { id: id.into(), x, y };
    let placements = vec![pl("mara", 0, 0), pl("guy", 0, 2), pl("elion", 1, 3), pl("zombie-1", 7, 1)];
    let env = Env::from_units(ContentPool::global(), grid, &units, &placements, MAX_ROUNDS, 4, [EXT, EXT], true).unwrap();
    let o = obs(&env);
    check_obs(&env, &o, (0, 0));
    assert_eq!(o.global[g("party_level_div5")], (2.0 + 3.0 + 3.0) / 3.0 / 5.0);
    assert_eq!(o.global[g("party_level_min_div5")], 2.0 / 5.0);
    assert_eq!(o.global[g("party_level_max_div5")], 3.0 / 5.0);
    let level = |i: usize| o.creatures[i * F_C + c("level_div5")];
    assert_eq!((level(0), level(1), level(2), level(3)), (0.4, 0.6, 0.6, 0.0));
    let row = |i: usize| &o.creatures[i * F_C..(i + 1) * F_C];
    assert_eq!(row(2)[c("turn_undead")], 1.0, "Elion's Turn Undead");
    assert_eq!(row(0)[c("atk_sap")], 1.0, "Mara's longsword has Sap");
    assert_eq!(row(3)[c("pfeg_protected")], 1.0, "undead are warded by Protection from Evil and Good");
    assert_eq!(row(3)[c("passive_perception_div20")], ContentPool::global().template(env.fight.units[3].tid).passive_perception as f32 / 20.0);
}

/// `ember encode`'s npz: the arrays numpy reads (shape check through the
/// header) and the per-row metadata.
#[test]
fn npz_dump_shapes() {
    let f = fixture_files().into_iter().find(|f| f.file_name().unwrap().to_string_lossy().starts_with("g4a_room")).unwrap();
    let mut dump = Dump::default();
    dump.add_source(&f, &DumpOpts { steps: Some(30), ..DumpOpts::default() }).unwrap();
    let live = dump.live.iter().filter(|&&l| l).count();
    assert!(live > 0 && live <= 30);
    let bytes = dump.to_npz().finish();
    assert_eq!(&bytes[..4], b"PK\x03\x04");
    let text = String::from_utf8_lossy(&bytes);
    let k = dump.rows.iter().map(|o| o.k).max().unwrap();
    assert!(text.contains(&format!("'shape': ({}, {}, {}),", dump.len(), N, F_C)));
    assert!(text.contains(&format!("'shape': ({}, {}, {}),", dump.len(), k, F_A)));
    assert!(text.contains(&format!("'shape': ({}, {}, {}, {}),", dump.len(), MAP_C, S, S)));
    assert!(text.contains(&format!("'shape': ({}, {}, {}, {}),", dump.len(), N, N, R)), "creature_rel");
    assert!(text.contains("\"feature_version\":\"ember-gen-v2\""));
    // a v1 dump has v1 widths and no relations
    let mut d1 = Dump::default();
    d1.add_source(&f, &DumpOpts { steps: Some(5), version: Version::V1, ..DumpOpts::default() }).unwrap();
    let t1 = String::from_utf8_lossy(&d1.to_npz().finish()).into_owned();
    assert!(t1.contains(&format!("'shape': ({}, {}, {}),", d1.len(), N, F_C_V1)));
    assert!(!t1.contains("creature_rel") && t1.contains("\"feature_version\":\"ember-gen-v1\""));
}

#[allow(dead_code)]
fn unused(_: Fight) {}
