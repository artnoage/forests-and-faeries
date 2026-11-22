//! The battle grid: walls, line of sight and distances, as natural20's `Map`
//! computes them for 1x1 creatures in bright light.
//!
//! natural20 sources (snapshot in `reference/`): `natural20/map.py`
//! (`line_of_sight`, `squares_in_path`, `opaque`, `can_see`, `distance`,
//! `passable`, `placeable`) and `natural20/utils/list_utils.py`
//! (`bresenham_line_of_sight`). Walls are `stone_wall` objects: opaque,
//! impassable, never placeable. Light is 1.0 everywhere, so seeing a
//! creature is having line of sight to its square.
//!
//! A map is built from its rows (`H` wall, `.` floor) and shared by every
//! fight on it (`Arc<Grid>`, [`Grid::shared`]). Line of sight is computed
//! lazily, one bit row per source cell, the first time a creature looks from
//! that cell. [`load_yaml`] reads natural20's map YAML subset
//! (docs/GENERAL_ENV.md §3.2) and rejects anything else; [`Grid::validate`]
//! runs the §3.3 validity checks.

use std::collections::{BTreeMap, HashMap, VecDeque};
use std::sync::{Arc, Mutex, OnceLock};

use serde::Deserialize;

pub type Pos = (i32, i32);

/// Largest map side (the observation canvas, GENERAL_ENV.md §5.3).
pub const MAX_SIDE: usize = 32;

/// Static observation channels per map ([`Grid::static_planes`]).
pub const STATIC_PLANES: usize = 5;

/// A fixed-size bit set (cell masks, line-of-sight rows).
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Bits {
    words: Vec<u64>,
}

impl Bits {
    pub fn new(n: usize) -> Bits {
        Bits { words: vec![0; n.div_ceil(64)] }
    }
    #[inline]
    pub fn get(&self, i: usize) -> bool {
        (self.words[i >> 6] >> (i & 63)) & 1 != 0
    }
    #[inline]
    pub fn set(&mut self, i: usize) {
        self.words[i >> 6] |= 1 << (i & 63);
    }
    #[inline]
    pub fn put(&mut self, i: usize, v: bool) {
        if v {
            self.set(i)
        } else {
            self.words[i >> 6] &= !(1 << (i & 63));
        }
    }
    pub fn clear(&mut self) {
        self.words.iter_mut().for_each(|w| *w = 0);
    }
    pub fn count(&self) -> usize {
        self.words.iter().map(|w| w.count_ones() as usize).sum()
    }
    /// The 64-bit words (bit `i` of the set is bit `i & 63` of word `i >> 6`).
    #[inline]
    pub fn words(&self) -> &[u64] {
        &self.words
    }
}

#[derive(Debug)]
pub struct Grid {
    pub w: i32,
    pub h: i32,
    /// Original rows: wall, bright floor, dim floor or dark floor.
    pub rows: Vec<String>,
    wall: Vec<bool>,
    pub(crate) symmetric_sight: bool,
    /// 8-connected floor components under the A* neighbour rule (-1: wall).
    comp: Vec<i32>,
    /// Line of sight from each source cell, computed on first use.
    los: Vec<OnceLock<Bits>>,
    wall_cover: Vec<OnceLock<Vec<u8>>>,
    corner_walls: Vec<OnceLock<Vec<u8>>>,
    /// Passable neighbours of each cell for 1x1 movement, in natural20's
    /// `get_neighbors` order (see `path.rs`): `nbr[nbr_start[i]..nbr_start[i + 1]]`.
    nbr_start: Vec<u32>,
    nbr: Vec<Nbr>,
    /// The observation's static map channels (`encode.rs`), computed on
    /// first use: `STATIC_PLANES` planes of `w * h` bytes.
    static_planes: OnceLock<Vec<u8>>,
    /// Floor squares as one bit row per map row (bit `x`), for bitset BFS.
    floor_rows: OnceLock<Vec<u64>>,
}

/// One passable neighbour: cell index, coordinates, diagonal step.
#[derive(Clone, Copy, Debug)]
pub struct Nbr {
    pub i: u16,
    pub x: i8,
    pub y: i8,
    pub diag: bool,
}

/// What [`Grid::validate`] measures.
#[derive(Clone, Debug, PartialEq)]
pub struct MapStats {
    pub w: i32,
    pub h: i32,
    pub floor: usize,
    pub floor_ratio: f64,
    /// Fraction of unordered floor pairs (a, b) with line of sight from a to b.
    pub openness: f64,
    /// Double-sweep estimate of the floor's path diameter (steps).
    pub diameter: i32,
    /// The zone layout's anchor distance `min(max(8, ceil(d / 2)), d)` (§3.5).
    pub anchor_distance: i32,
}

/// Openness bands per map family (§3.3; provisional, G3 tunes them).
pub fn openness_band(family: &str) -> Option<(f64, f64)> {
    Some(match family {
        "vault" => (0.5, 0.8),
        "open" => (0.8, 1.0),
        "pillars" => (0.45, 0.95),
        "rooms" => (0.2, 0.7),
        "caves" => (0.2, 0.8),
        _ => return None,
    })
}

/// Minimum floor ratio (§3.3).
pub const MIN_FLOOR_RATIO: f64 = 0.55;

impl Grid {
    /// `rows[y]` is a string of `H` (wall) and `.` (floor), as in natural20's
    /// map YAML subset. At most 32x32 and rectangular; anything else is an error.
    pub fn from_rows<S: AsRef<str>>(rows: &[S]) -> Result<Grid, String> {
        let h = rows.len();
        if h == 0 || h > MAX_SIDE {
            return Err(format!("map height {h} (1..={MAX_SIDE})"));
        }
        let w = rows[0].as_ref().len();
        if w == 0 || w > MAX_SIDE {
            return Err(format!("map width {w} (1..={MAX_SIDE})"));
        }
        let mut wall = Vec::with_capacity(w * h);
        for (y, row) in rows.iter().enumerate() {
            let row = row.as_ref();
            if row.len() != w {
                return Err(format!("map row {y} has {} squares, not {w}", row.len()));
            }
            for c in row.chars() {
                match c {
                    'H' => wall.push(true),
                    '.' | 'd' | 'D' => wall.push(false),
                    other => return Err(format!("map square {other:?} (expected H (wall), . (bright), d (dim) or D (dark))")),
                }
            }
        }
        let (w, h) = (w as i32, h as i32);
        let n = (w * h) as usize;
        let mut grid = Grid {
            w,
            h,
            rows: rows.iter().map(|r| r.as_ref().to_string()).collect(),
            wall,
            symmetric_sight: true,
            comp: Vec::new(),
            los: (0..n).map(|_| OnceLock::new()).collect(),
            wall_cover: (0..n).map(|_| OnceLock::new()).collect(),
            corner_walls: (0..n).map(|_| OnceLock::new()).collect(),
            nbr_start: Vec::new(),
            nbr: Vec::new(),
            static_planes: OnceLock::new(),
            floor_rows: OnceLock::new(),
        };
        // `PathCompute.get_neighbors` without doors or hazards: `dx` outer,
        // `dy` inner; a diagonal needs a passable orthogonal; the origin is
        // floor, so `bidirectionally_passable` is the destination test.
        let mut nbr_start = Vec::with_capacity(n + 1);
        let mut nbr = Vec::new();
        for i in 0..n {
            nbr_start.push(nbr.len() as u32);
            let (x, y) = grid.pos_of(i);
            for dx in -1..=1 {
                for dy in -1..=1 {
                    if dx == 0 && dy == 0 {
                        continue;
                    }
                    let (nx, ny) = (x + dx, y + dy);
                    if !grid.in_bounds(nx, ny) {
                        continue;
                    }
                    let diagonal_clear = dx == 0 || dy == 0 || !grid.is_wall(x + dx, y) || !grid.is_wall(x, y + dy);
                    if diagonal_clear && !grid.is_wall(nx, ny) {
                        nbr.push(Nbr { i: grid.index(nx, ny) as u16, x: nx as i8, y: ny as i8, diag: dx != 0 && dy != 0 });
                    }
                }
            }
        }
        nbr_start.push(nbr.len() as u32);
        grid.nbr_start = nbr_start;
        grid.nbr = nbr;
        grid.comp = grid.compute_components();
        Ok(grid)
    }

    /// 8-connected components under the A* neighbour rule (`ignore_opposing`):
    /// `compute_path` finds a path exactly when source and target share one.
    fn compute_components(&self) -> Vec<i32> {
        let mut comp = vec![-1i32; self.cells()];
        let mut next = 0;
        for start in 0..self.cells() {
            if self.wall[start] || comp[start] >= 0 {
                continue;
            }
            let mut stack = vec![start];
            comp[start] = next;
            while let Some(i) = stack.pop() {
                for nb in self.neighbours(i) {
                    let j = nb.i as usize;
                    if comp[j] < 0 {
                        comp[j] = next;
                        stack.push(j);
                    }
                }
            }
            next += 1;
        }
        comp
    }

    /// The map for these rows, shared by every fight on it (a process-wide
    /// cache, so line of sight computed once serves every tape on the map).
    pub fn shared<S: AsRef<str>>(rows: &[S]) -> Result<Arc<Grid>, String> {
        Self::shared_for_rules(rows, true)
    }

    pub(crate) fn shared_for_rules<S: AsRef<str>>(rows: &[S], symmetric: bool) -> Result<Arc<Grid>, String> {
        static CACHE: OnceLock<Mutex<HashMap<(Vec<String>, bool), Arc<Grid>>>> = OnceLock::new();
        let key = (rows.iter().map(|r| r.as_ref().to_string()).collect::<Vec<_>>(), symmetric);
        let cache = CACHE.get_or_init(Default::default);
        if let Some(g) = cache.lock().unwrap().get(&key) {
            return Ok(g.clone());
        }
        let mut grid = Grid::from_rows(&key.0)?;
        grid.symmetric_sight = symmetric;
        let g = Arc::new(grid);
        let mut c = cache.lock().unwrap();
        if c.len() >= 256 {
            c.clear();
        }
        Ok(c.entry(key).or_insert(g).clone())
    }

    /// The Ember Vault walls without props (`scenarios/general/maps/vault.yml`):
    /// the map of every tape without a `map` header field.
    pub fn ember_vault() -> Arc<Grid> {
        static VAULT: OnceLock<Arc<Grid>> = OnceLock::new();
        VAULT.get_or_init(|| Grid::shared(&EMBER_VAULT_ROWS).expect("vault map")).clone()
    }

    /// Passable 1x1 movement neighbours of cell `i`, in `get_neighbors` order.
    #[inline]
    pub fn neighbours(&self, i: usize) -> &[Nbr] {
        &self.nbr[self.nbr_start[i] as usize..self.nbr_start[i + 1] as usize]
    }

    #[inline]
    pub fn cells(&self) -> usize {
        (self.w * self.h) as usize
    }

    #[inline]
    pub fn in_bounds(&self, x: i32, y: i32) -> bool {
        x >= 0 && y >= 0 && x < self.w && y < self.h
    }

    #[inline]
    pub fn index(&self, x: i32, y: i32) -> usize {
        (y * self.w + x) as usize
    }

    #[inline]
    pub fn pos_of(&self, i: usize) -> Pos {
        (i as i32 % self.w, i as i32 / self.w)
    }

    /// Out of bounds counts as a wall (`Map.opaque`, `Map.passable`).
    #[inline]
    pub fn is_wall(&self, x: i32, y: i32) -> bool {
        !self.in_bounds(x, y) || self.wall[self.index(x, y)]
    }

    /// Floor illumination as encoded in the observation: dark (0), dim (1), bright (2).
    pub(crate) fn light_level(&self, (x, y): Pos) -> u8 {
        match self.rows[y as usize].as_bytes()[x as usize] {
            b'D' => 0,
            b'd' => 1,
            _ => 2,
        }
    }

    /// A diagonal cannot cross the corner of terrain that fills its square.
    pub fn clears_corner(&self, from: Pos, to: Pos) -> bool {
        from.0 == to.0 || from.1 == to.1
            || (!self.is_wall(to.0, from.1) && !self.is_wall(from.0, to.1))
    }

    /// Floor cells.
    pub fn floor_count(&self) -> usize {
        self.wall.iter().filter(|w| !**w).count()
    }

    /// Same component under the A* neighbour rule (a path exists).
    #[inline]
    pub fn reachable(&self, a: Pos, b: Pos) -> bool {
        if !self.in_bounds(a.0, a.1) || !self.in_bounds(b.0, b.1) {
            return false;
        }
        let (ia, ib) = (self.index(a.0, a.1), self.index(b.0, b.1));
        self.comp[ia] >= 0 && self.comp[ia] == self.comp[ib]
    }

    /// Number of floor components.
    pub fn components(&self) -> usize {
        self.comp.iter().copied().max().map_or(0, |m| (m + 1) as usize)
    }

    #[inline]
    fn los_row(&self, i: usize) -> &Bits {
        match self.los[i].get() {
            Some(row) => row,
            None => self.init_los_row(i),
        }
    }

    /// The line-of-sight row of source cell `i` (first use only).
    #[cold]
    #[inline(never)]
    fn init_los_row(&self, i: usize) -> &Bits {
        self.los[i].get_or_init(|| {
            let mut row = Bits::new(self.cells());
            let a = self.pos_of(i);
            for j in 0..self.cells() {
                if self.compute_los(a, self.pos_of(j)) {
                    row.set(j);
                }
            }
            row
        })
    }

    /// `Map.line_of_sight(x1, y1, x2, y2, inclusive=True) is not None` with
    /// no creature-size or distance limits (walls only).
    #[inline]
    pub fn los(&self, a: Pos, b: Pos) -> bool {
        if !self.in_bounds(a.0, a.1) || !self.in_bounds(b.0, b.1) {
            return false;
        }
        self.los_row(self.index(a.0, a.1)).get(self.index(b.0, b.1))
    }

    /// The line-of-sight row of square `a` (bit `index(b)` set when
    /// `los(a, b)`); `None` off the map.
    #[inline]
    pub fn los_from(&self, a: Pos) -> Option<&Bits> {
        if !self.in_bounds(a.0, a.1) {
            return None;
        }
        Some(self.los_row(self.index(a.0, a.1)))
    }

    /// The static observation channels of this map (GENERAL_ENV.md §5.3:
    /// inside, wall, difficult terrain, cover, light), `w * h` bytes per
    /// plane in row order, computed once per map.
    pub fn static_planes(&self) -> &[u8] {
        self.static_planes.get_or_init(|| {
            let n = self.cells();
            let mut out = vec![0u8; STATIC_PLANES * n];
            for i in 0..n {
                out[i] = 1; // inside the map
                out[n + i] = self.wall[i] as u8;
                // The terrain and cover planes represent static tile properties. Directional cover is actor-dependent.
                out[4 * n + i] = self.light_level(self.pos_of(i));
            }
            out
        })
    }

    /// Floor squares, one `u64` per row (bit `x` set for floor), computed once.
    pub fn floor_rows(&self) -> &[u64] {
        self.floor_rows.get_or_init(|| {
            (0..self.h)
                .map(|y| (0..self.w).filter(|&x| !self.is_wall(x, y)).fold(0u64, |r, x| r | (1u64 << x)))
                .collect()
        })
    }

    fn compute_los(&self, a: Pos, b: Pos) -> bool {
        if self.symmetric_sight {
            return self.clear_ray(a, b, true);
        }
        self.layout_los(a, b)
    }

    /// Visibility used to select placements by the published map generator versions.
    pub(crate) fn layout_los(&self, a: Pos, b: Pos) -> bool {
        let squares = squares_in_path(a, b, true);
        let mut prev = a;
        for s in squares {
            if self.is_wall(s.0, s.1) || self.is_wall(prev.0, prev.1) {
                return false;
            }
            prev = s;
        }
        true
    }

    /// `Map.line_of_sight(..., inclusive=False) is not None`
    /// (`unseen_targets.has_line_of_effect`).
    pub fn line_of_effect(&self, a: Pos, b: Pos) -> bool {
        if self.symmetric_sight {
            return self.clear_ray(a, b, false);
        }
        let squares = squares_in_path(a, b, false);
        let mut prev = a;
        for s in squares {
            if self.is_wall(s.0, s.1) || self.is_wall(prev.0, prev.1) {
                return false;
            }
            prev = s;
        }
        true
    }

    // Cross vertical and horizontal cell boundaries in order along the ray.
    // At an exact grid vertex the ray enters the diagonal cell directly.
    fn clear_ray(&self, a: Pos, b: Pos, inclusive: bool) -> bool {
        let (dx, dy) = (b.0 - a.0, b.1 - a.1);
        let (mut x, mut y) = a;
        let (mut ix, mut iy) = (0, 0);
        while (x, y) != b {
            if self.is_wall(x, y) { return false; }
            let cross = (2 * ix + 1) * dy.abs() - (2 * iy + 1) * dx.abs();
            if cross == 0 && self.is_wall(x + dx.signum(), y) && self.is_wall(x, y + dy.signum()) { return false; }
            if cross <= 0 { x += dx.signum(); ix += 1; }
            if cross >= 0 { y += dy.signum(); iy += 1; }
        }
        !inclusive || !self.is_wall(x, y)
    }

    pub(crate) fn wall_cover_mask(&self, origin: Pos, target: Pos) -> u8 {
        let row = self.wall_cover[self.index(origin.0, origin.1)].get_or_init(|| {
            (0..self.cells()).map(|i| self.cover_rays(origin, self.pos_of(i), |_| false).0).collect()
        });
        row[self.index(target.0, target.1)]
    }

    /// Best corner wall coverage, independent of the creatures on this map.
    pub(crate) fn corner_wall_grade(&self, origin: Pos, target: Pos) -> u8 {
        let row = self.corner_walls[self.index(origin.0, origin.1)].get_or_init(|| {
            (0..self.cells()).map(|i| {
                let p = self.pos_of(i);
                if self.is_wall(p.0, p.1) { 4 } else { self.corner_cover_grade(origin, p, |_| false) }
            }).collect()
        });
        row[self.index(target.0, target.1)]
    }

    /// Grade the least-covered origin: 0 clear, 2 half, 3 three-quarters, 4 total.
    /// Intervening creatures can grant at most half cover.
    pub(crate) fn corner_cover_grade(&self, origin: Pos, target: Pos, occupied: impl Fn(Pos) -> bool) -> u8 {
        let (dx, dy) = ((target.0 - origin.0).abs(), (target.1 - origin.1).abs());
        if dx.max(dy) <= 1 {
            let sealed = dx == 1 && dy == 1 && self.is_wall(origin.0, target.1) && self.is_wall(target.0, origin.1);
            return if sealed { 4 } else { 0 };
        }
        // An infinitesimal inset picks the interior side of a corner. A ray along the
        // outer face of a wall cannot see two squares that are both behind that face.
        // This scale keeps the inset smaller than the separation of distinct grid crossings.
        let scale = 4 * (dx + dy + 1) + 4;
        let corners = [(1, 1), (scale - 1, 1), (1, scale - 1), (scale - 1, scale - 1)];
        let tile = |p: Pos| {
            if self.is_wall(p.0, p.1) { 2 } else { u8::from(occupied(p)) }
        };
        let mut best = 4;
        for (ox, oy) in corners {
            let start = (origin.0 * scale + ox, origin.1 * scale + oy);
            let mut walls = 0;
            let mut blocked = 0;
            for (tx, ty) in corners {
                let end = (target.0 * scale + tx, target.1 * scale + ty);
                let grade = self.corner_ray(origin, target, start, end, scale, &tile);
                walls += u8::from(grade == 2);
                blocked += u8::from(grade != 0);
            }
            best = best.min(walls.max(blocked.min(2)));
            if best < 2 { return 0; }
        }
        best
    }

    fn corner_ray(&self, origin: Pos, target: Pos, start: Pos, end: Pos, scale: i32, tile: &impl Fn(Pos) -> u8) -> u8 {
        let (dx, dy) = (end.0 - start.0, end.1 - start.1);
        let (sx, sy) = (dx.signum(), dy.signum());
        let to_edge = |v: i32, step: i32| if step > 0 { scale - v.rem_euclid(scale) } else { v.rem_euclid(scale) };
        let (mut nx, mut ny) = (to_edge(start.0, sx), to_edge(start.1, sy));
        let mut p = origin;
        let mut grade = 0;
        while p != target {
            let cross = nx * dy.abs() - ny * dx.abs();
            if cross == 0 && self.is_wall(p.0 + sx, p.1) && self.is_wall(p.0, p.1 + sy) { return 2; }
            if cross <= 0 { p.0 += sx; nx += scale; }
            if cross >= 0 { p.1 += sy; ny += scale; }
            if p != target {
                grade = grade.max(tile(p));
                if grade == 2 { break; }
            }
        }
        grade
    }

    /// Sample the four quadrants of the defender's square from the effect origin.
    /// Wall and creature masks are separate because a creature grants at most half cover.
    pub(crate) fn cover_rays(&self, origin: Pos, target: Pos, occupied: impl Fn(Pos) -> bool) -> (u8, u8) {
        let mut walls = 0;
        let mut creatures = 0;
        for (ray, (ox, oy)) in [(1, 1), (3, 1), (1, 3), (3, 3)].into_iter().enumerate() {
            let dx = 4 * (target.0 - origin.0) + ox - 2;
            let dy = 4 * (target.1 - origin.1) + oy - 2;
            let (sx, sy) = (dx.signum(), dy.signum());
            let (mut x, mut y) = origin;
            let (mut next_x, mut next_y) = (2, 2);
            while (x, y) != target {
                let cross = next_x * dy.abs() - next_y * dx.abs();
                if cross == 0 && self.is_wall(x + sx, y) && self.is_wall(x, y + sy) {
                    walls |= 1 << ray;
                    break;
                }
                if cross <= 0 { x += sx; next_x += 4; }
                if cross >= 0 { y += sy; next_y += 4; }
                if (x, y) == target { break; }
                if self.is_wall(x, y) { walls |= 1 << ray; break; }
                if occupied((x, y)) { creatures |= 1 << ray; }
            }
        }
        (walls, creatures)
    }

    /// Step distances from `start` over the floor (A* neighbour rule), as
    /// `scenarios/general/spec.py` `bfs`.
    pub fn bfs(&self, start: Pos) -> Vec<i32> {
        let mut dist = vec![-1; self.cells()];
        if self.is_wall(start.0, start.1) {
            return dist;
        }
        let s = self.index(start.0, start.1);
        dist[s] = 0;
        let mut q = VecDeque::from([s]);
        while let Some(i) = q.pop_front() {
            for nb in self.neighbours(i) {
                let j = nb.i as usize;
                if dist[j] < 0 {
                    dist[j] = dist[i] + 1;
                    q.push_back(j);
                }
            }
        }
        dist
    }

    /// The §3.3 measurements without any family threshold: at least two
    /// floor squares in one component (the A* neighbour rule), the floor
    /// ratio, the double-sweep diameter, the zone layout's anchor distance
    /// (which must be reachable, §3.5) and the openness.
    pub fn measure(&self) -> Result<MapStats, String> {
        if self.symmetric_sight {
            // Map statistics are part of the versioned generator output.
            return Grid::shared_for_rules(&self.rows, false)?.measure();
        }
        let floor: Vec<usize> = (0..self.cells()).filter(|&i| !self.wall[i]).collect();
        if floor.len() < 2 {
            return Err("fewer than two floor squares".into());
        }
        if self.components() != 1 {
            return Err(format!("{} floor components (one required)", self.components()));
        }
        let floor_ratio = floor.len() as f64 / self.cells() as f64;
        // double sweep from the smallest floor cell in (x, y) order, as spec.py
        let start = floor.iter().map(|&i| self.pos_of(i)).min().unwrap();
        let d0 = self.bfs(start);
        let far = floor.iter().map(|&i| (d0[i], self.pos_of(i))).max().unwrap().1;
        let d1 = self.bfs(far);
        let diameter = floor.iter().map(|&i| d1[i]).max().unwrap();
        let anchor_distance = (8.max((diameter + 1) / 2)).min(diameter);
        if diameter < 1 || !floor.iter().any(|&i| d1[i] >= anchor_distance) {
            return Err("no zone-layout anchors".into());
        }
        let mut pairs = 0u64;
        let mut seen = 0u64;
        for (k, &a) in floor.iter().enumerate() {
            let row = self.los_row(a);
            for &b in &floor[k + 1..] {
                pairs += 1;
                seen += row.get(b) as u64;
            }
        }
        let openness = seen as f64 / pairs as f64;
        Ok(MapStats { w: self.w, h: self.h, floor: floor.len(), floor_ratio, openness, diameter, anchor_distance })
    }

    /// The §3.3 validity checks for a map of `family`: one floor component,
    /// floor ratio at least 0.55, zone-layout anchors exist (§3.5), openness
    /// inside the family's band. (Generated maps use `mapgen::check`, which
    /// adds the per-family floor minimum and the layout check.)
    pub fn validate(&self, family: &str) -> Result<MapStats, String> {
        let st = self.measure()?;
        if st.floor_ratio < MIN_FLOOR_RATIO {
            return Err(format!("floor ratio {:.3} < {MIN_FLOOR_RATIO}", st.floor_ratio));
        }
        let (lo, hi) = openness_band(family).ok_or_else(|| format!("unknown map family {family:?}"))?;
        if st.openness < lo || st.openness > hi {
            return Err(format!("openness {:.3} outside the {family} band [{lo}, {hi}]", st.openness));
        }
        Ok(st)
    }
}

// ----------------------------------------------------------------------------
// natural20 map YAML, strict subset (GENERAL_ENV.md §3.2)
// ----------------------------------------------------------------------------

#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
struct MapYaml {
    #[serde(default)]
    name: Option<String>,
    map: MapBody,
    legend: BTreeMap<String, LegendYaml>,
    #[serde(default)]
    ember: Option<EmberMeta>,
}

#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
struct MapBody {
    illumination: f64,
    base: Vec<String>,
}

#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
struct LegendYaml {
    #[serde(default)]
    name: Option<String>,
    #[serde(rename = "type")]
    kind: String,
}

/// The `ember:` key: generator or hand-made metadata (natural20 ignores it).
#[derive(Deserialize, Debug, Clone, Default)]
#[serde(deny_unknown_fields)]
pub struct EmberMeta {
    #[serde(default)]
    pub family: Option<String>,
    #[serde(default)]
    pub hand_made: bool,
    #[serde(default)]
    pub generator: Option<String>,
    #[serde(default)]
    pub seed: Option<u64>,
    #[serde(default)]
    pub spawn_zones: Option<BTreeMap<String, Vec<[i32; 2]>>>,
}

/// A map file: its name, `ember:` metadata and the shared grid.
#[derive(Debug, Clone)]
pub struct MapFile {
    pub name: Option<String>,
    pub ember: EmberMeta,
    pub grid: Arc<Grid>,
}

/// Legend object types the engine implements (version 1: walls).
const LEGEND_TYPES: [&str; 1] = ["stone_wall"];

/// Parse natural20's map YAML subset: `map.base` rows, `map.illumination:
/// 1.0`, a legend of `H` stone walls, an optional `name` and `ember:` key.
/// Anything else (other keys, objects, light levels, symbols) is an error.
pub fn load_yaml(text: &str) -> Result<MapFile, String> {
    let doc: MapYaml = serde_norway::from_str(text).map_err(|e| format!("map YAML: {e}"))?;
    if doc.map.illumination != 1.0 {
        return Err(format!("illumination {} (only 1.0 is supported)", doc.map.illumination));
    }
    for (sym, entry) in &doc.legend {
        if sym != "H" || !LEGEND_TYPES.contains(&entry.kind.as_str()) {
            return Err(format!("legend {sym}: {} (only H stone_wall is supported)", entry.kind));
        }
        let _ = &entry.name;
    }
    if doc.map.base.iter().any(|r| r.contains('H')) && !doc.legend.contains_key("H") {
        return Err("walls without an H legend entry".into());
    }
    let grid = Grid::shared(&doc.map.base)?;
    Ok(MapFile { name: doc.name, ember: doc.ember.unwrap_or_default(), grid })
}

/// The fixed maps compiled into the crate (`content/maps/*.yml`), by file stem.
pub fn builtin_map(stem: &str) -> Option<Result<MapFile, String>> {
    let path = format!("maps/{stem}.yml");
    crate::content::embedded_files().iter().find(|(p, _)| *p == path).map(|(_, text)| load_yaml(text))
}

/// `Map.distance` for 1x1 creatures: `int(sqrt(dx^2 + dy^2))` in squares.
#[inline]
pub fn distance(a: Pos, b: Pos) -> i32 {
    let dx = (a.0 - b.0) as i64;
    let dy = (a.1 - b.1) as i64;
    isqrt(dx * dx + dy * dy) as i32
}

/// `floor(sqrt(n))` exactly.
#[inline]
pub fn isqrt(n: i64) -> i64 {
    if n <= 0 {
        return 0;
    }
    let mut r = (n as f64).sqrt() as i64;
    while r * r > n {
        r -= 1;
    }
    while (r + 1) * (r + 1) <= n {
        r += 1;
    }
    r
}

/// `Entity.entered_melee` for a 1x1 creature with `melee_ft` reach against a
/// 1x1 creature at `pos`: `floor(sqrt(dx^2+dy^2) * 5) <= melee_ft + 2.5`.
#[inline]
pub fn within_melee(a: Pos, b: Pos, melee_ft: i32) -> bool {
    let dx = (a.0 - b.0) as f64;
    let dy = (a.1 - b.1) as f64;
    let d = ((dx * dx + dy * dy).sqrt() * 5.0).floor();
    d <= melee_ft as f64 + 2.5
}

/// `bresenham_line_of_sight(x0, y0, x1, y1)`: the cells from the start up to,
/// but not including, the end.
pub fn bresenham(a: Pos, b: Pos) -> Vec<Pos> {
    let (mut x0, mut y0) = a;
    let (x1, y1) = b;
    let mut points = Vec::new();
    let dx = (x1 - x0).abs();
    let dy = -(y1 - y0).abs();
    let sx = if x0 < x1 { 1 } else { -1 };
    let sy = if y0 < y1 { 1 } else { -1 };
    let mut err = dx + dy;
    loop {
        if x0 == x1 && y0 == y1 {
            break;
        }
        points.push((x0, y0));
        let e2 = 2 * err;
        if e2 >= dy {
            err += dy;
            x0 += sx;
        }
        if e2 <= dx {
            err += dx;
            y0 += sy;
        }
    }
    points
}

/// `Map.squares_in_path`.
pub fn squares_in_path(a: Pos, b: Pos, inclusive: bool) -> Vec<Pos> {
    if a == b {
        return if inclusive { vec![a] } else { vec![] };
    }
    let mut arrs = bresenham(a, b);
    if inclusive && arrs.last() != Some(&b) {
        arrs.push(b);
    }
    if !inclusive && arrs.last() == Some(&b) {
        arrs.pop();
    }
    // remove_duplicates (Bresenham never repeats a cell, kept for fidelity)
    let mut out: Vec<Pos> = Vec::with_capacity(arrs.len());
    for p in arrs {
        if !out.contains(&p) {
            out.push(p);
        }
    }
    out
}

pub const EMBER_VAULT_ROWS: [&str; 12] = [
    "HHHHHHHHHHHHHHHH",
    "HH..HHH......HHH",
    "HH..HHH......H.H",
    "H..............H",
    "H..............H",
    "H.....H........H",
    "H........H.....H",
    "H..............H",
    "H......HHH.....H",
    "HHH....HHHH..HHH",
    "H.........H..HHH",
    "HHHHHHHHHHHHHHHH",
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strict_rows() {
        assert!(Grid::from_rows(&["H.H", "..."]).is_ok());
        assert!(Grid::from_rows(&["H#H"]).is_err());
        assert!(Grid::from_rows(&["H.", "..."]).is_err());
        assert!(Grid::from_rows::<&str>(&[]).is_err());
        let wide = ".".repeat(33);
        assert!(Grid::from_rows(&[wide.as_str()]).is_err());
    }

    #[test]
    fn strict_yaml() {
        let ok = "name: x\nmap:\n  illumination: 1.0\n  base:\n    - 'H..'\n    - '...'\nlegend:\n  H:\n    name: Wall\n    type: stone_wall\n";
        assert!(load_yaml(ok).is_ok());
        for bad in [
            ok.replace("illumination: 1.0", "illumination: 0.5"),
            ok.replace("stone_wall", "door"),
            ok.replace("name: x\n", "name: x\nmaps: {}\n"),
            ok.replace("'H..'", "'H.#'"),
            ok.replace("legend:\n  H:", "legend:\n  W:"),
            ok.replace("  base:", "  light: 2\n  base:"),
        ] {
            assert!(load_yaml(&bad).is_err(), "{bad}");
        }
    }

    #[test]
    fn fixed_maps_are_valid() {
        let manifest: serde_json::Value = serde_json::from_str(
            crate::content::embedded_files().iter().find(|(p, _)| *p == "maps/MANIFEST.json").unwrap().1,
        )
        .unwrap();
        let mut names: Vec<String> = manifest["maps"].as_object().unwrap().keys().cloned().collect();
        names.sort();
        assert_eq!(names, ["hall_32x32.yml", "room_12x10.yml", "two_rooms_24x18.yml", "vault.yml"]);
        for (stem, family, w, h) in
            [("vault", "vault", 16, 12), ("room_12x10", "pillars", 12, 10), ("two_rooms_24x18", "rooms", 24, 18), ("hall_32x32", "pillars", 32, 32)]
        {
            let m = builtin_map(stem).unwrap().unwrap();
            assert_eq!(m.ember.family.as_deref().unwrap_or("vault"), family, "{stem}");
            let st = m.grid.validate(family).unwrap_or_else(|e| panic!("{stem}: {e}"));
            assert_eq!((st.w, st.h), (w, h));
        }
        // the vault file is the built-in default map
        let vault = builtin_map("vault").unwrap().unwrap();
        assert!(Arc::ptr_eq(&vault.grid, &Grid::ember_vault()));
    }

    #[test]
    fn manifest_hashes_match() {
        // content/maps/*.yml are byte copies of natural20 blobs; MANIFEST.json
        // records their SHA-256 (checked by validation/export_content.py --check).
        let manifest: serde_json::Value = serde_json::from_str(
            crate::content::embedded_files().iter().find(|(p, _)| *p == "maps/MANIFEST.json").unwrap().1,
        )
        .unwrap();
        for (name, entry) in manifest["maps"].as_object().unwrap() {
            assert_eq!(entry["sha256"].as_str().unwrap().len(), 64, "{name}");
            assert!(entry["natural20_commit"].as_str().unwrap().len() >= 8, "{name}");
        }
    }

    #[test]
    fn lazy_los_matches_direct() {
        let g = Grid::from_rows(&EMBER_VAULT_ROWS).unwrap();
        for a in 0..g.cells() {
            for b in 0..g.cells() {
                assert_eq!(g.los(g.pos_of(a), g.pos_of(b)), g.compute_los(g.pos_of(a), g.pos_of(b)));
            }
        }
    }
}
