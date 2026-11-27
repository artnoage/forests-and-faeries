//! Salvaged from `ember-engine` (`crates/ember/src/n20path.rs`, ours).
//!
//! Exact port of natural20's A* (`natural20/ai/path_compute.py`, `PathCompute`)
//! as native-v1 uses it: `ignore_opposing=True`, no movement budget, no doors,
//! no hazards.
//!
//! With `ignore_opposing=True`, natural20's `bidirectionally_passable` lets a
//! path cross every creature (allies always, hostiles because they are
//! ignored, incapacitated ones always), so only walls and the map edge block
//! (`map.py` `passable`, lines 2137-2198). For a 1x1 creature the "squeeze"
//! branch of `get_neighbors` tests the same predicate and never adds a step.
//!
//! What is reproduced bit for bit, because native-v1's movement scores depend
//! on which of several equal-length paths A* returns:
//! - neighbour order `dx` in (-1, 0, 1) outer, `dy` inner (`get_neighbors`, l.553);
//! - a diagonal needs at least one passable orthogonal (`diagonal_clear`, l.536);
//! - step cost 1, +1 prone, +2 instead of 1 on difficult terrain, +0.1 diagonal
//!   (`base_move_cost`, l.583). natural20's `Map.difficult_terrain`
//!   (map.py l.1307-1370) counts a square holding another creature that is not
//!   dead (any side, downed included) as difficult terrain, so entering it,
//!   including the target creature's own square, costs 2;
//! - Euclidean heuristic (`heuristic`, l.597), which overestimates diagonal
//!   moves (1.1 cost for 1.414 distance), so results depend on search order;
//! - heap entries `(f, g, (x, y))` compared lexicographically (Python `heapq`);
//! - strict-improvement parent updates; the 1024-node cap of `compute_path`;
//! - `compute_paths_to_multiple_destinations` (l.367): the min-heuristic over
//!   unfound destinations, the early `break` once all are found, and path
//!   reconstruction from the final parent table.

use std::cmp::{Ordering, Reverse};
use std::collections::BinaryHeap;

use crate::map::{Bits, Grid, Nbr};

/// `MAX_DISTANCE` in path_compute.py.
const MAX_DISTANCE: f64 = 4_000_000.0;
const SQRT_LEN: usize = 1024;
static SQRT: std::sync::OnceLock<Vec<f64>> = std::sync::OnceLock::new();

/// `MAX_NODES` default in path_compute.py.
const MAX_NODES: usize = 1024;

pub type Cell = (i32, i32);

#[derive(Clone, Copy, Debug)]
struct Entry {
    f: f64,
    g: f64,
    x: i32,
    y: i32,
}

impl PartialEq for Entry {
    fn eq(&self, other: &Self) -> bool {
        self.cmp(other) == Ordering::Equal
    }
}
impl Eq for Entry {}
impl PartialOrd for Entry {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}
impl Ord for Entry {
    fn cmp(&self, other: &Self) -> Ordering {
        self.f
            .total_cmp(&other.f)
            .then(self.g.total_cmp(&other.g))
            .then(self.x.cmp(&other.x))
            .then(self.y.cmp(&other.y))
    }
}

/// natural20 `PathCompute` for one mover.
pub struct PathCompute<'a> {
    grid: &'a Grid,
    pub(crate) solid_wall_corners: bool,
    pub(crate) incorporeal: bool,
    /// Footprint side length in 5-ft squares (1 = Tiny/Small/Medium, 2 = Large, 3 = Huge).
    pub(crate) token_size: u8,
    /// Current effective footprint side length (for `difficult_terrain` checks while squeezed).
    pub(crate) eff_size: u8,
    /// Allow squeeze edges (`token_size - 1`) for `token_size > 1` (rule >= 21).
    pub(crate) allow_squeeze: bool,
    prone: bool,
    /// `is_flying()`: difficult terrain costs 1 (`base_move_cost`).
    flying: bool,
    /// Cells holding another creature that is not dead (difficult terrain).
    occupied: Bits,
    dist: Vec<f64>,
    parent: Vec<Option<Cell>>,
    heap: BinaryHeap<Reverse<Entry>>,
}

impl<'a> PathCompute<'a> {
    /// `occupied.get(i)`: cell `i` holds another creature that is not dead.
    pub fn new(grid: &'a Grid, prone: bool, flying: bool, occupied: Bits) -> Self {
        let n = grid.cells();
        Self {
            grid,
            solid_wall_corners: false,
            incorporeal: false,
            token_size: 1,
            eff_size: 1,
            allow_squeeze: false,
            prone,
            flying,
            occupied,
            dist: vec![MAX_DISTANCE; n],
            parent: vec![None; n],
            heap: BinaryHeap::new(),
        }
    }

    fn reset(&mut self) {
        self.dist.iter_mut().for_each(|d| *d = MAX_DISTANCE);
        self.parent.iter_mut().for_each(|p| *p = None);
        self.heap.clear();
    }

    /// Euclidean distance. `a * a + b * b` is an exact integer, so a table
    /// of square roots by that integer gives the same bits as `sqrt`.
    #[inline]
    fn heuristic(cx: i32, cy: i32, dx: i32, dy: i32) -> f64 {
        let (a, b) = (cx - dx, cy - dy);
        let n = (a * a + b * b) as usize;
        let table = SQRT.get_or_init(|| (0..SQRT_LEN).map(|k| (k as f64).sqrt()).collect());
        if n < SQRT_LEN {
            table[n]
        } else {
            (n as f64).sqrt()
        }
    }

    /// `base_move_cost(x, y, src)` for a step onto neighbour `nb`.
    #[inline]
    fn base_move_cost(&self, nb: &Nbr) -> f64 {
        let difficult = self.occupied.get(nb.i as usize);
        let mut cost: f64 = if difficult && !self.flying { 2.0 } else { 1.0 };
        if self.prone {
            cost += 1.0;
        }
        if nb.diag {
            cost += 0.1;
        }
        cost
    }

    /// Terrain passability for a multi-square footprint (`s x s`).
    #[inline]
    fn footprint_passable(&self, x: i32, y: i32, s: i32) -> bool {
        if x < 0 || y < 0 || x + s > self.grid.w || y + s > self.grid.h {
            return false;
        }
        if self.incorporeal {
            return true;
        }
        for ox in 0..s {
            for oy in 0..s {
                if self.grid.is_wall(x + ox, y + oy) {
                    return false;
                }
            }
        }
        true
    }

    #[inline]
    fn footprint_difficult(&self, x: i32, y: i32, s: i32) -> bool {
        for ox in 0..s {
            for oy in 0..s {
                let cx = x + ox;
                let cy = y + oy;
                if cx < 0 || cy < 0 || cx >= self.grid.w || cy >= self.grid.h {
                    continue;
                }
                if self.occupied.get(self.grid.index(cx, cy))
                    || (self.incorporeal && self.grid.is_wall(cx, cy))
                {
                    return true;
                }
            }
        }
        false
    }

    #[cold]
    #[inline(never)]
    fn neighbours_multisquare(&self, x: i32, y: i32, out: &mut Vec<(Cell, f64)>) {
        let s = i32::from(self.token_size);
        let eff_s = i32::from(self.eff_size.max(1));
        if !self.allow_squeeze {
            if !self.footprint_passable(x, y, s) {
                return;
            }
            for dx in -1..=1 {
                for dy in -1..=1 {
                    if dx == 0 && dy == 0 {
                        continue;
                    }
                    let nx = x + dx;
                    let ny = y + dy;
                    if !self.footprint_passable(nx, ny, s) {
                        continue;
                    }
                    if dx != 0 && dy != 0 {
                        let ax_ok = self.footprint_passable(nx, y, s);
                        let ay_ok = self.footprint_passable(x, ny, s);
                        let clear = if self.solid_wall_corners {
                            ax_ok && ay_ok
                        } else {
                            ax_ok || ay_ok
                        };
                        if !clear {
                            continue;
                        }
                    }
                    let difficult = self.footprint_difficult(nx, ny, s);
                    let mut cost = if difficult && (!self.flying || self.incorporeal) { 2.0 } else { 1.0 };
                    if self.prone {
                        cost += 1.0;
                    }
                    if dx != 0 && dy != 0 {
                        cost += 0.1;
                    }
                    out.push(((nx, ny), cost));
                }
            }
            return;
        }
        // Rule >= 21 (`path_compute.py:571-623`): try normal passable first, then squeeze passable.
        let sq_s = (s - 1).max(1);
        let normal_from_ok = self.footprint_passable(x, y, s);
        let squeeze_from_ok = normal_from_ok || self.footprint_passable(x, y, sq_s);
        if !squeeze_from_ok {
            return;
        }
        for dx in -1..=1 {
            for dy in -1..=1 {
                if dx == 0 && dy == 0 {
                    continue;
                }
                let nx = x + dx;
                let ny = y + dy;
                if nx < 0 || ny < 0 || nx >= self.grid.w || ny >= self.grid.h {
                    continue;
                }
                let diag_clear_normal = if dx == 0 || dy == 0 {
                    true
                } else if self.solid_wall_corners {
                    normal_from_ok && self.footprint_passable(nx, y, s) && self.footprint_passable(x, ny, s)
                } else {
                    normal_from_ok && (self.footprint_passable(nx, y, s) || self.footprint_passable(x, ny, s))
                };
                let base_cost = || {
                    let difficult = self.footprint_difficult(nx, ny, eff_s);
                    let mut cost = if difficult && (!self.flying || self.incorporeal) { 2.0 } else { 1.0 };
                    if self.prone {
                        cost += 1.0;
                    }
                    if dx != 0 && dy != 0 {
                        cost += 0.1;
                    }
                    cost
                };
                if diag_clear_normal && normal_from_ok && self.footprint_passable(nx, ny, s) {
                    out.push(((nx, ny), base_cost()));
                } else {
                    let diag_clear_squeeze = if dx == 0 || dy == 0 {
                        true
                    } else if self.solid_wall_corners {
                        // 5e-2024 `clears_terrain_corner` always uses `allow_squeeze=False`.
                        normal_from_ok && self.footprint_passable(nx, y, s) && self.footprint_passable(x, ny, s)
                    } else {
                        self.footprint_passable(nx, y, sq_s) || self.footprint_passable(x, ny, sq_s)
                    };
                    if diag_clear_squeeze && self.footprint_passable(nx, ny, sq_s) {
                        // Exact mirror of `path_compute.py:619-621` (adds +1 squeeze and +1 if prone).
                        let mut cost = base_cost() + 1.0;
                        if self.prone {
                            cost += 1.0;
                        }
                        out.push(((nx, ny), cost));
                    }
                }
            }
        }
    }

    /// `get_neighbors(x, y)` without doors or hazards, in natural20's order
    /// (the static part is precomputed in `Grid::neighbours` for 1x1 movers).
    #[inline(always)]
    fn neighbours(&self, x: i32, y: i32, out: &mut Vec<(Cell, f64)>) {
        out.clear();
        if self.token_size > 1 {
            self.neighbours_multisquare(x, y, out);
            return;
        }
        if self.incorporeal {
            for nx in x - 1..=x + 1 {
                for ny in y - 1..=y + 1 {
                    if (x, y) == (nx, ny) || !self.grid.in_bounds(nx, ny) { continue; }
                    let difficult = self.grid.is_wall(nx, ny) || self.occupied.get(self.grid.index(nx, ny));
                    let diagonal = if nx != x && ny != y { 0.1 } else { 0.0 };
                    out.push(((nx, ny), 1.0 + f64::from(difficult) + diagonal));
                }
            }
            return;
        }
        for nb in self.grid.neighbours(self.grid.index(x, y)) {
            let to = (nb.x as i32, nb.y as i32);
            if !self.solid_wall_corners || self.grid.clears_corner((x, y), to) {
                out.push((to, self.base_move_cost(nb)));
            }
        }
    }

    fn reconstruct(&self, dest: Cell) -> Vec<Cell> {
        let mut path = Vec::new();
        let mut node = Some(dest);
        while let Some(cell) = node {
            path.push(cell);
            node = self.parent[self.grid.index(cell.0, cell.1)];
        }
        path.reverse();
        path
    }

    /// `compute_path(sx, sy, dx, dy)` with no budget: the path including both
    /// ends, or `None` when unreachable (or the node cap was hit first).
    pub fn compute_path(&mut self, source: Cell, dest: Cell) -> Option<Vec<Cell>> {
        if !self.grid.in_bounds(source.0, source.1) || !self.grid.in_bounds(dest.0, dest.1) {
            return None;
        }
        self.reset();
        let si = self.grid.index(source.0, source.1);
        self.dist[si] = 0.0;
        self.heap.push(Reverse(Entry {
            f: Self::heuristic(source.0, source.1, dest.0, dest.1),
            g: 0.0,
            x: source.0,
            y: source.1,
        }));
        let mut explored = 0usize;
        let mut neighbours = Vec::with_capacity(8);
        while let Some(Reverse(entry)) = {
            if explored >= MAX_NODES {
                None
            } else {
                self.heap.pop()
            }
        } {
            explored += 1;
            let ci = self.grid.index(entry.x, entry.y);
            if entry.g > self.dist[ci] {
                continue;
            }
            if (entry.x, entry.y) == dest {
                break;
            }
            self.neighbours(entry.x, entry.y, &mut neighbours);
            for &((nx, ny), cost) in &neighbours {
                let new_g = entry.g + cost;
                let ni = self.grid.index(nx, ny);
                if new_g < self.dist[ni] {
                    self.dist[ni] = new_g;
                    self.parent[ni] = Some((entry.x, entry.y));
                    let f = new_g + Self::heuristic(nx, ny, dest.0, dest.1);
                    self.heap.push(Reverse(Entry { f, g: new_g, x: nx, y: ny }));
                }
            }
        }
        if self.dist[self.grid.index(dest.0, dest.1)] == MAX_DISTANCE {
            return None;
        }
        Some(self.reconstruct(dest))
    }

    /// `compute_paths_to_multiple_destinations(sx, sy, destinations)`: one path
    /// (or `None`) per entry of `destinations`, in the same order.
    pub fn compute_paths_to_multiple(&mut self, source: Cell, destinations: &[Cell]) -> Vec<Option<Vec<Cell>>> {
        let mut result = vec![None; destinations.len()];
        if !self.search_multiple(source, destinations) {
            return result;
        }
        for (slot, &dest) in destinations.iter().enumerate() {
            if !self.grid.in_bounds(dest.0, dest.1) {
                continue;
            }
            if self.dist[self.grid.index(dest.0, dest.1)] == MAX_DISTANCE {
                continue;
            }
            result[slot] = Some(self.reconstruct(dest));
        }
        result
    }

    /// The same search as `compute_paths_to_multiple`, returning only the
    /// shortest path length in steps (`len(path) - 1`) over the reachable
    /// destinations, without building the paths.
    pub fn min_steps_to_multiple(&mut self, source: Cell, destinations: &[Cell]) -> Option<i32> {
        if !self.search_multiple(source, destinations) {
            return None;
        }
        let mut best: Option<i32> = None;
        for &dest in destinations {
            if !self.grid.in_bounds(dest.0, dest.1) {
                continue;
            }
            let mut i = self.grid.index(dest.0, dest.1);
            if self.dist[i] == MAX_DISTANCE {
                continue;
            }
            let mut steps = 0i32;
            while let Some(p) = self.parent[i] {
                steps += 1;
                i = self.grid.index(p.0, p.1);
            }
            best = Some(best.map_or(steps, |b| b.min(steps)));
        }
        best
    }

    /// Runs the multi-destination search, leaving `dist` and `parent` filled.
    /// Returns false when nothing was searched (source off the map or no
    /// destination on it).
    fn search_multiple(&mut self, source: Cell, destinations: &[Cell]) -> bool {
        if !self.grid.in_bounds(source.0, source.1) {
            return false;
        }
        let mut set: Vec<Cell> = destinations
            .iter()
            .copied()
            .filter(|&(x, y)| self.grid.in_bounds(x, y))
            .collect();
        set.sort_unstable();
        set.dedup();
        if set.is_empty() {
            return false;
        }
        self.reset();
        let mut found: Vec<bool> = vec![false; set.len()];
        let mut found_count = 0usize;
        let si = self.grid.index(source.0, source.1);
        self.dist[si] = 0.0;
        let min_h = set
            .iter()
            .map(|&(dx, dy)| Self::heuristic(source.0, source.1, dx, dy))
            .fold(f64::INFINITY, f64::min);
        self.heap.push(Reverse(Entry {
            f: min_h,
            g: 0.0,
            x: source.0,
            y: source.1,
        }));
        let mut neighbours = Vec::with_capacity(8);
        while found_count < destinations.len() {
            let Some(Reverse(entry)) = self.heap.pop() else {
                break;
            };
            let ci = self.grid.index(entry.x, entry.y);
            if entry.g > self.dist[ci] {
                continue;
            }
            if let Ok(k) = set.binary_search(&(entry.x, entry.y)) {
                if !found[k] {
                    found[k] = true;
                    found_count += 1;
                }
            }
            self.neighbours(entry.x, entry.y, &mut neighbours);
            for &((nx, ny), cost) in &neighbours {
                let new_g = entry.g + cost;
                let ni = self.grid.index(nx, ny);
                if new_g < self.dist[ni] {
                    self.dist[ni] = new_g;
                    self.parent[ni] = Some((entry.x, entry.y));
                    if found_count < set.len() {
                        let mut h = f64::INFINITY;
                        for (k, &(dx, dy)) in set.iter().enumerate() {
                            if !found[k] {
                                h = h.min(Self::heuristic(nx, ny, dx, dy));
                            }
                        }
                        self.heap.push(Reverse(Entry { f: new_g + h, g: new_g, x: nx, y: ny }));
                    } else {
                        break;
                    }
                }
            }
        }
        true
    }
}
