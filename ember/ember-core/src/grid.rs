//! Immutable battle grid (`Arc<Grid>`): walls, trees, illumination, symmetric
//! ray line of sight, corner cover grading, and movement neighbour tables.
//!
//! Shared across forks via `Arc` (atomic refcount bump only; never deep-copied).

use std::sync::{Arc, OnceLock};

use crate::types::Pos;

/// Maximum side length of a tactical map (`32x32` = 1024 cells).
pub const MAX_SIDE: usize = 32;
pub const MAX_CELLS: usize = MAX_SIDE * MAX_SIDE;

/// Fixed-size inline bitset covering up to 1024 grid cells (128 bytes, `Copy`).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct CellBits {
    words: [u64; 16],
}

impl CellBits {
    #[inline]
    pub const fn empty() -> Self {
        Self { words: [0; 16] }
    }

    #[inline]
    pub const fn get(&self, i: usize) -> bool {
        (self.words[i >> 6] >> (i & 63)) & 1 != 0
    }

    #[inline]
    pub fn set(&mut self, i: usize) {
        self.words[i >> 6] |= 1u64 << (i & 63);
    }
}

/// One passable 8-connected neighbour.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Neighbour {
    pub idx: u16,
    pub pos: Pos,
    pub diag: bool,
}

/// Read-only grid shared via `Arc<Grid>`.
#[derive(Debug)]
pub struct Grid {
    pub w: i16,
    pub h: i16,
    pub rows: Vec<String>,
    wall: Vec<bool>,
    tree: Vec<bool>,
    light: Vec<u8>,
    nbr_start: Vec<u32>,
    nbr: Vec<Neighbour>,
    los: Vec<OnceLock<CellBits>>,
    wall_cover: Vec<OnceLock<Vec<u8>>>,
    corner_walls: Vec<OnceLock<Vec<u8>>>,
}

impl Grid {
    pub fn from_rows<S: AsRef<str>>(rows: &[S]) -> Result<Grid, String> {
        let h = rows.len();
        if h == 0 || h > MAX_SIDE {
            return Err(format!("map height {h} out of range 1..={MAX_SIDE}"));
        }
        let w = rows[0].as_ref().len();
        if w == 0 || w > MAX_SIDE {
            return Err(format!("map width {w} out of range 1..={MAX_SIDE}"));
        }
        let n = w * h;
        let mut wall = Vec::with_capacity(n);
        let mut tree = Vec::with_capacity(n);
        let mut light = Vec::with_capacity(n);
        for (y, row) in rows.iter().enumerate() {
            let row = row.as_ref();
            if row.len() != w {
                return Err(format!("map row {y} has length {}, expected {w}", row.len()));
            }
            for ch in row.chars() {
                match ch {
                    'H' => {
                        wall.push(true);
                        tree.push(false);
                        light.push(2);
                    }
                    'T' => {
                        wall.push(true);
                        tree.push(true);
                        light.push(2);
                    }
                    '.' => {
                        wall.push(false);
                        tree.push(false);
                        light.push(2);
                    }
                    'd' => {
                        wall.push(false);
                        tree.push(false);
                        light.push(1);
                    }
                    'D' => {
                        wall.push(false);
                        tree.push(false);
                        light.push(0);
                    }
                    other => {
                        return Err(format!(
                            "invalid map tile {other:?} (expected H, T, ., d, or D)"
                        ));
                    }
                }
            }
        }
        let mut grid = Grid {
            w: w as i16,
            h: h as i16,
            rows: rows.iter().map(|r| r.as_ref().to_string()).collect(),
            wall,
            tree,
            light,
            nbr_start: Vec::with_capacity(n + 1),
            nbr: Vec::new(),
            los: (0..n).map(|_| OnceLock::new()).collect(),
            wall_cover: (0..n).map(|_| OnceLock::new()).collect(),
            corner_walls: (0..n).map(|_| OnceLock::new()).collect(),
        };
        for i in 0..n {
            grid.nbr_start.push(grid.nbr.len() as u32);
            let p = grid.pos_of(i);
            for dx in -1..=1i16 {
                for dy in -1..=1i16 {
                    if dx == 0 && dy == 0 {
                        continue;
                    }
                    let np = Pos::new(p.x + dx, p.y + dy);
                    if !grid.in_bounds(np) {
                        continue;
                    }
                    let diag_clear = dx == 0
                        || dy == 0
                        || !grid.is_wall(Pos::new(p.x + dx, p.y))
                        || !grid.is_wall(Pos::new(p.x, p.y + dy));
                    if diag_clear && !grid.is_wall(np) {
                        grid.nbr.push(Neighbour {
                            idx: grid.index(np) as u16,
                            pos: np,
                            diag: dx != 0 && dy != 0,
                        });
                    }
                }
            }
        }
        grid.nbr_start.push(grid.nbr.len() as u32);
        Ok(grid)
    }

    pub fn ember_vault() -> Arc<Grid> {
        static VAULT: OnceLock<Arc<Grid>> = OnceLock::new();
        VAULT
            .get_or_init(|| Arc::new(Grid::from_rows(&EMBER_VAULT_ROWS).expect("valid vault")))
            .clone()
    }

    #[inline]
    pub fn cells(&self) -> usize {
        (self.w as usize) * (self.h as usize)
    }

    #[inline]
    pub fn in_bounds(&self, p: Pos) -> bool {
        p.x >= 0 && p.y >= 0 && p.x < self.w && p.y < self.h
    }

    #[inline]
    pub fn index(&self, p: Pos) -> usize {
        (p.y as usize) * (self.w as usize) + (p.x as usize)
    }

    #[inline]
    pub fn pos_of(&self, i: usize) -> Pos {
        Pos::new((i % self.w as usize) as i16, (i / self.w as usize) as i16)
    }

    #[inline]
    pub fn is_wall(&self, p: Pos) -> bool {
        !self.in_bounds(p) || self.wall[self.index(p)]
    }

    #[inline]
    pub fn is_tree(&self, p: Pos) -> bool {
        self.in_bounds(p) && self.tree[self.index(p)]
    }

    #[inline]
    pub fn light_level(&self, p: Pos) -> u8 {
        if self.in_bounds(p) {
            self.light[self.index(p)]
        } else {
            2
        }
    }

    /// A diagonal move cannot squeeze past an orthogonal wall corner.
    #[inline]
    pub fn clears_corner(&self, from: Pos, to: Pos) -> bool {
        from.x == to.x
            || from.y == to.y
            || (!self.is_wall(Pos::new(to.x, from.y)) && !self.is_wall(Pos::new(from.x, to.y)))
    }

    #[inline]
    pub fn neighbours(&self, i: usize) -> &[Neighbour] {
        &self.nbr[self.nbr_start[i] as usize..self.nbr_start[i + 1] as usize]
    }

    /// Symmetric grid-ray line of sight (`inclusive = true`, rule-18 canonical).
    #[inline]
    pub fn los(&self, a: Pos, b: Pos) -> bool {
        if !self.in_bounds(a) || !self.in_bounds(b) {
            return false;
        }
        let ia = self.index(a);
        let row = self.los[ia].get_or_init(|| {
            let mut bits = CellBits::empty();
            for j in 0..self.cells() {
                if self.clear_ray(a, self.pos_of(j), true) {
                    bits.set(j);
                }
            }
            bits
        });
        row.get(self.index(b))
    }

    fn clear_ray(&self, a: Pos, b: Pos, inclusive: bool) -> bool {
        let (dx, dy) = ((b.x - a.x) as i32, (b.y - a.y) as i32);
        let (mut x, mut y) = (a.x as i32, a.y as i32);
        let (bx, by) = (b.x as i32, b.y as i32);
        let (mut ix, mut iy) = (0i32, 0i32);
        while (x, y) != (bx, by) {
            if self.is_wall(Pos::new(x as i16, y as i16)) {
                return false;
            }
            let cross = (2 * ix + 1) * dy.abs() - (2 * iy + 1) * dx.abs();
            if cross == 0
                && self.is_wall(Pos::new((x + dx.signum()) as i16, y as i16))
                && self.is_wall(Pos::new(x as i16, (y + dy.signum()) as i16))
            {
                return false;
            }
            if cross <= 0 {
                x += dx.signum();
                ix += 1;
            }
            if cross >= 0 {
                y += dy.signum();
                iy += 1;
            }
        }
        !inclusive || !self.is_wall(Pos::new(x as i16, y as i16))
    }

    /// Cached 4-quadrant wall cover mask from `origin` to `target`.
    pub fn wall_cover_mask(&self, origin: Pos, target: Pos) -> u8 {
        let io = self.index(origin);
        let row = self.wall_cover[io].get_or_init(|| {
            (0..self.cells())
                .map(|i| self.cover_rays(origin, self.pos_of(i), |_| false).0)
                .collect()
        });
        row[self.index(target)]
    }

    /// Cached best corner wall coverage (`0` clear, `2` half, `3` three-quarters, `4` total).
    pub fn corner_wall_grade(&self, origin: Pos, target: Pos) -> u8 {
        let io = self.index(origin);
        let row = self.corner_walls[io].get_or_init(|| {
            (0..self.cells())
                .map(|i| {
                    let p = self.pos_of(i);
                    if self.is_wall(p) {
                        4
                    } else {
                        self.corner_cover_grade(origin, p, |_| false)
                    }
                })
                .collect()
        });
        row[self.index(target)]
    }

    /// Directional corner cover grade (`0` clear, `2` half, `3` three-quarters, `4` total).
    pub fn corner_cover_grade(
        &self,
        origin: Pos,
        target: Pos,
        occupied: impl Fn(Pos) -> bool,
    ) -> u8 {
        let dx = (target.x as i32 - origin.x as i32).abs();
        let dy = (target.y as i32 - origin.y as i32).abs();
        if dx.max(dy) <= 1 {
            let sealed = dx == 1
                && dy == 1
                && self.is_wall(Pos::new(origin.x, target.y))
                && self.is_wall(Pos::new(target.x, origin.y));
            return if sealed { 4 } else { 0 };
        }
        let scale = 4 * (dx + dy + 1) + 4;
        let corners = [
            (1, 1),
            (scale - 1, 1),
            (1, scale - 1),
            (scale - 1, scale - 1),
        ];
        let tile = |p: Pos| if self.is_wall(p) { 2 } else { u8::from(occupied(p)) };
        let mut best = 4u8;
        for (ox, oy) in corners {
            let start = (origin.x as i32 * scale + ox, origin.y as i32 * scale + oy);
            let mut walls = 0u8;
            let mut blocked = 0u8;
            for (tx, ty) in corners {
                let end = (target.x as i32 * scale + tx, target.y as i32 * scale + ty);
                let grade = self.corner_ray(origin, target, start, end, scale, &tile);
                walls += u8::from(grade == 2);
                blocked += u8::from(grade != 0);
            }
            best = best.min(walls.max(blocked.min(2)));
            if best < 2 {
                return 0;
            }
        }
        best
    }

    fn corner_ray(
        &self,
        origin: Pos,
        target: Pos,
        start: (i32, i32),
        end: (i32, i32),
        scale: i32,
        tile: &impl Fn(Pos) -> u8,
    ) -> u8 {
        let (dx, dy) = (end.0 - start.0, end.1 - start.1);
        let (sx, sy) = (dx.signum(), dy.signum());
        let to_edge = |v: i32, step: i32| {
            if step > 0 {
                scale - v.rem_euclid(scale)
            } else {
                v.rem_euclid(scale)
            }
        };
        let (mut nx, mut ny) = (to_edge(start.0, sx), to_edge(start.1, sy));
        let (mut px, mut py) = (origin.x as i32, origin.y as i32);
        let (tx, ty) = (target.x as i32, target.y as i32);
        let mut grade = 0u8;
        while (px, py) != (tx, ty) {
            let cross = nx * dy.abs() - ny * dx.abs();
            if cross == 0
                && self.is_wall(Pos::new((px + sx) as i16, py as i16))
                && self.is_wall(Pos::new(px as i16, (py + sy) as i16))
            {
                return 2;
            }
            if cross <= 0 {
                px += sx;
                nx += scale;
            }
            if cross >= 0 {
                py += sy;
                ny += scale;
            }
            if (px, py) != (tx, ty) {
                grade = grade.max(tile(Pos::new(px as i16, py as i16)));
                if grade == 2 {
                    break;
                }
            }
        }
        grade
    }

    /// 4-quadrant cover rays from `origin` to `target` (walls and creatures separated).
    pub fn cover_rays(
        &self,
        origin: Pos,
        target: Pos,
        occupied: impl Fn(Pos) -> bool,
    ) -> (u8, u8) {
        let mut walls = 0u8;
        let mut creatures = 0u8;
        let (ox0, oy0) = (origin.x as i32, origin.y as i32);
        let (tx0, ty0) = (target.x as i32, target.y as i32);
        for (ray, (ox, oy)) in [(1, 1), (3, 1), (1, 3), (3, 3)].into_iter().enumerate() {
            let dx = 4 * (tx0 - ox0) + ox - 2;
            let dy = 4 * (ty0 - oy0) + oy - 2;
            let (sx, sy) = (dx.signum(), dy.signum());
            let (mut x, mut y) = (ox0, oy0);
            let (mut next_x, mut next_y) = (2, 2);
            while (x, y) != (tx0, ty0) {
                let cross = next_x * dy.abs() - next_y * dx.abs();
                if cross == 0
                    && self.is_wall(Pos::new((x + sx) as i16, y as i16))
                    && self.is_wall(Pos::new(x as i16, (y + sy) as i16))
                {
                    walls |= 1 << ray;
                    break;
                }
                if cross <= 0 {
                    x += sx;
                    next_x += 4;
                }
                if cross >= 0 {
                    y += sy;
                    next_y += 4;
                }
                if (x, y) == (tx0, ty0) {
                    break;
                }
                let p = Pos::new(x as i16, y as i16);
                if self.is_wall(p) {
                    walls |= 1 << ray;
                    break;
                }
                if occupied(p) {
                    creatures |= 1 << ray;
                }
            }
        }
        (walls, creatures)
    }

    /// Clear line of effect (symmetric ray OR non-total 4-quadrant wall cover).
    #[inline]
    pub fn clear_effect(&self, a: Pos, b: Pos) -> bool {
        if self.los(a, b) {
            return true;
        }
        !self.is_wall(a) && !self.is_wall(b) && self.wall_cover_mask(a, b) != 15
    }

    /// Clear sight between `a` and `b` (symmetric, including corner peeks < total cover).
    #[inline]
    pub fn clear_sight(&self, a: Pos, b: Pos) -> bool {
        self.clear_effect(a, b)
            || self.clear_effect(b, a)
            || (!self.is_wall(a) && !self.is_wall(b) && self.corner_wall_grade(a, b) < 4)
    }
}

/// Default Ember Vault map (used by fixtures without an explicit `map` field).
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
