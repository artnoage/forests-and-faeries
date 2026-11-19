//! Zone layouts (GENERAL_ENV.md §3.5): natural20 `EncounterSpec.auto_place`
//! (`scenarios/general/spec.py`) ported rule for rule, with this crate's
//! random stream instead of Python's `random.Random`. A placement is valid
//! under exactly natural20's rules (and natural20's `EncounterSpec` accepts
//! it; `ember_rl/tests/test_ember_rs_env.py` checks that), but the same seed
//! gives different squares in the two implementations.
//!
//! The rule: two anchor floor cells A (monsters) and B (heroes) at path
//! distance at least `min(max(8, ceil(diameter / 2)), diameter)` (the floor's
//! double-sweep BFS diameter, A* neighbours, walls only). Each side takes
//! distinct free cells within radius `r` of its anchor: the smallest `r >= 1`
//! whose ball holds `min(2 * count, available)` free cells. With
//! `require_sight`, layouts are resampled until some hero has line of sight
//! to some monster (`Map.line_of_sight(..., inclusive=True)`, walls only).
//! Creatures already placed keep their squares and block theirs.

use crate::map::{Grid, Pos};
use crate::trace::FastRng;

/// natural20 `auto_place(tries=200)`.
pub const TRIES: usize = 200;

/// What a zone layout chose (natural20's `spec.layout` record).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ZoneLayout {
    pub seed: u64,
    /// Anchors: monsters (A), heroes (B).
    pub anchors: [Pos; 2],
    /// Ball radius per side: monsters, heroes.
    pub radius: [i32; 2],
    pub min_anchor_distance: i32,
}

impl ZoneLayout {
    /// natural20's JSON form (`{"rule": "zone", "seed", "anchors", "radius",
    /// "min_anchor_distance"}`), plus `"sampler": "ember-rs"` (the squares
    /// differ from Python's for the same seed).
    pub fn to_json(&self) -> serde_json::Value {
        serde_json::json!({
            "rule": "zone",
            "seed": self.seed,
            "anchors": {"monsters": [self.anchors[0].0, self.anchors[0].1], "heroes": [self.anchors[1].0, self.anchors[1].1]},
            "radius": {"monsters": self.radius[0], "heroes": self.radius[1]},
            "min_anchor_distance": self.min_anchor_distance,
            "sampler": "ember-rs",
        })
    }
}

/// Uniform index in `0..n` (`n > 0`).
fn below(rng: &mut FastRng, n: usize) -> usize {
    (rng.die(n as i32) - 1) as usize
}

/// `spec._diameter`: double-sweep BFS from the smallest floor cell in (x, y)
/// order; the far end is the largest (distance, cell).
pub fn diameter(grid: &Grid, floor: &[Pos]) -> i32 {
    let Some(&start) = floor.iter().min() else { return 0 };
    let d0 = grid.bfs(start);
    let far = floor.iter().map(|&p| (d0[grid.index(p.0, p.1)], p)).max().unwrap().1;
    let d1 = grid.bfs(far);
    floor.iter().map(|&p| d1[grid.index(p.0, p.1)]).max().unwrap_or(0)
}

/// `any_hero_sees_monster`: some placed hero has line of sight to some
/// placed monster.
pub fn any_hero_sees_monster(grid: &Grid, sides: &[u8], pos: &[Option<Pos>]) -> bool {
    for (h, hp) in pos.iter().enumerate() {
        let (Some(hp), 0) = (hp, sides[h]) else { continue };
        for (m, mp) in pos.iter().enumerate() {
            if let (Some(mp), 1) = (mp, sides[m]) {
                if grid.los(*hp, *mp) {
                    return true;
                }
            }
        }
    }
    false
}

/// Place every unplaced creature (`fixed[i] == None`; `sides[i]` 0 heroes,
/// 1 monsters) by the zone rule. Returns every creature's square (fixed ones
/// unchanged) and the layout. Errors as natural20 does: not enough free
/// floor, or no layout in `tries` attempts.
pub fn auto_place(
    grid: &Grid,
    sides: &[u8],
    fixed: &[Option<Pos>],
    seed: u64,
    require_sight: bool,
    tries: usize,
) -> Result<(Vec<Pos>, ZoneLayout), String> {
    assert_eq!(sides.len(), fixed.len());
    let mut floor: Vec<Pos> = Vec::new();
    for x in 0..grid.w {
        for y in 0..grid.h {
            if !grid.is_wall(x, y) {
                floor.push((x, y)); // sorted (x, y), as Python's sorted(floor)
            }
        }
    }
    let n = grid.cells();
    let mut fixed_cell = vec![false; n];
    for p in fixed.iter().flatten() {
        fixed_cell[grid.index(p.0, p.1)] = true;
    }
    let todo: [Vec<usize>; 2] = [0u8, 1].map(|s| (0..sides.len()).filter(|&i| sides[i] == s && fixed[i].is_none()).collect());
    let free = floor.iter().filter(|p| !fixed_cell[grid.index(p.0, p.1)]).count();
    if todo[0].len() + todo[1].len() > free {
        return Err("not enough free floor for every creature".into());
    }
    let far = diameter(grid, &floor);
    let need = 8.max((far + 1) / 2).min(far);
    let mut rng = FastRng::new(seed);
    let mut pos: Vec<Option<Pos>> = fixed.to_vec();
    for _ in 0..tries.max(1) {
        let a = floor[below(&mut rng, floor.len())];
        let dist_a = grid.bfs(a);
        let options: Vec<Pos> = floor.iter().copied().filter(|p| dist_a[grid.index(p.0, p.1)] >= need).collect();
        if options.is_empty() {
            continue;
        }
        let b = options[below(&mut rng, options.len())];
        let mut taken = fixed_cell.clone();
        let mut chosen: [Vec<Pos>; 2] = [Vec::new(), Vec::new()];
        let mut radius = [0i32; 2];
        let mut ok = true;
        // monsters around A first, then heroes around B (natural20's order)
        for (side, anchor) in [(1usize, a), (0usize, b)] {
            let count = todo[side].len();
            let dist = grid.bfs(anchor);
            // sorted((d, c) for c, d in dist.items() if c not in taken)
            let mut avail: Vec<(i32, Pos)> = floor
                .iter()
                .filter_map(|&p| {
                    let i = grid.index(p.0, p.1);
                    (dist[i] >= 0 && !taken[i]).then_some((dist[i], p))
                })
                .collect();
            avail.sort();
            let want = (2 * count).min(avail.len());
            let mut r = 1;
            while avail.iter().filter(|(d, _)| *d <= r).count() < want {
                r += 1;
            }
            let mut ball: Vec<Pos> = avail.iter().filter(|(d, _)| *d <= r).map(|&(_, p)| p).collect();
            if ball.len() < count {
                ok = false;
                break;
            }
            // random.sample(ball, count): partial Fisher-Yates
            for k in 0..count {
                let j = k + below(&mut rng, ball.len() - k);
                ball.swap(k, j);
            }
            ball.truncate(count);
            for p in &ball {
                taken[grid.index(p.0, p.1)] = true;
            }
            chosen[side] = ball;
            radius[side] = r;
        }
        if !ok {
            continue;
        }
        for side in 0..2 {
            for (&u, &p) in todo[side].iter().zip(chosen[side].iter()) {
                pos[u] = Some(p);
            }
        }
        if !require_sight || any_hero_sees_monster(grid, sides, &pos) {
            let layout = ZoneLayout { seed, anchors: [a, b], radius: [radius[1], radius[0]], min_anchor_distance: need };
            return Ok((pos.into_iter().map(Option::unwrap).collect(), layout));
        }
        for side in 0..2 {
            for &u in &todo[side] {
                pos[u] = None;
            }
        }
    }
    Err(format!("no zone layout found{}", if require_sight { " with a hero seeing a monster" } else { "" }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn places_validly_and_deterministically() {
        let rows = ["HHHHHHHHHHHH", "H..........H", "H..........H", "H...H..H...H", "H..........H", "H..........H",
                    "H...H..H...H", "H..........H", "H..........H", "HHHHHHHHHHHH"];
        let grid = Grid::shared(&rows).unwrap();
        let sides = [0, 0, 1, 1, 1, 1];
        let fixed = [None, Some((1, 1)), None, None, None, None];
        for seed in 0..200 {
            let (pos, layout) = auto_place(&grid, &sides, &fixed, seed, true, TRIES).unwrap();
            assert_eq!(pos[1], (1, 1));
            let mut seen = std::collections::HashSet::new();
            for p in &pos {
                assert!(!grid.is_wall(p.0, p.1) && seen.insert(*p));
            }
            let opt: Vec<Option<Pos>> = pos.iter().copied().map(Some).collect();
            assert!(any_hero_sees_monster(&grid, &sides, &opt));
            let d = grid.bfs(layout.anchors[0]);
            assert!(d[grid.index(layout.anchors[1].0, layout.anchors[1].1)] >= layout.min_anchor_distance);
            for (i, p) in pos.iter().enumerate() {
                if fixed[i].is_some() {
                    continue;
                }
                let side = sides[i] as usize;
                let anchor = layout.anchors[1 - side];
                let r = layout.radius[1 - side];
                assert!(grid.bfs(anchor)[grid.index(p.0, p.1)] <= r);
            }
            assert_eq!(auto_place(&grid, &sides, &fixed, seed, true, TRIES).unwrap(), (pos, layout));
        }
        let crowded = vec![1u8; 120];
        assert!(auto_place(&grid, &crowded, &vec![None; 120], 0, false, TRIES).is_err());
    }
}
