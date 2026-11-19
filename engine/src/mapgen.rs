//! Generated maps (GENERAL_ENV.md §3.1, §3.3; stage G3): walls and floor only,
//! from a seed, in four families.
//!
//! | Family | Construction |
//! |---|---|
//! | `open` | a rectangle (wall rim in half the maps), 0-4 small wall blocks |
//! | `pillars` | an open hall with 1x1 / 2x2 pillars on a jittered lattice |
//! | `rooms` | BSP split into 2-5 rooms by 1-thick walls with gaps (no doors): 1-3 squares in v1, 2-3 in v2 |
//! | `caves` | cellular automaton (4-5 rule), largest floor component kept (v2: pockets walled, necks widened), cropped |
//!
//! Generators are versioned (`<family>/v<k>`, [`VERSIONS`]). v2 (the default,
//! [`LATEST`]) adds the cut-square rule to every family: no floor square
//! whose loss splits the floor under one-square moves ([`Cut`] explains why
//! 4-adjacency), so a single corpse never plugs a doorway or neck. v1 (G3)
//! stays available and reproduces its maps byte for byte.
//!
//! The generator is data, not a rule, so it has no natural20 counterpart
//! (§3.1). What natural20 must do is load the output: a map is written as a
//! natural20 `EncounterSpec` (format 1, `scenarios/general/spec.py`) that has
//! only its map, the state after the encounter builder's size and obstacle
//! steps (§11):
//!
//! ```text
//! {"version": 1,
//!  "map": {"name": "gen-caves-v2-000017", "rows": ["HHH.....", ...],
//!          "ember": {"family": "caves", "generator": "caves/v2", "seed": 17, "attempt": 0,
//!                    "params": {...}, "stats": {...}}},
//!  "heroes": [], "monsters": []}
//! ```
//!
//! natural20 `EncounterSpec.from_dict` rebuilds it through the builder steps
//! (size at most 32x32, walls keeping the floor one component) and carries
//! `ember` as is; catalog rows take the same `map` object inline
//! (`catalog.rs`), and tape headers carry the rows.
//!
//! Every map passes [`check`]: at most 32x32, `H` / `.` only, one floor
//! component under natural20's A* neighbour rule, the family's minimum floor
//! ratio and openness band ([`map::openness_band`]), from v2 no cut square,
//! the zone layout's anchors, and room for the layouts: [`layout::auto_place`] places every
//! `GenConfig::layout_sides` roster with and without `require_sight` for each
//! of `layout_seeds` seeds. A failed attempt draws a new map from the same
//! stream (`ember.attempt` counts them), so a (generator, seed, size range)
//! always gives the same map. The stream is xoshiro256** ([`FastRng`]) seeded
//! from the seed and the generator id (`caves/v2`); changing a generator's
//! output means a new version (`tests/mapgen.rs` pins digests per version).
//!
//! [`map::openness_band`]: crate::map::openness_band
//! [`layout::auto_place`]: crate::layout::auto_place

use std::sync::Arc;

use serde_json::{json, Value};

use crate::layout::{auto_place, TRIES};
use crate::map::{openness_band, Grid, MapStats, MAX_SIDE};
use crate::trace::FastRng;

/// Generator versions: a map is named by its generator id `<family>/v<k>`
/// and seed, so a change to any output is a new version and the old one
/// stays available (old maps, catalogs and tapes reproduce).
/// - **v1** (G3): the constructions below.
/// - **v2** (no cut squares, 2026-11-16): every family must also pass the
///   cut-square check ([`cut_squares`]): no single floor square whose loss
///   (a corpse, which no one-square move can end on) splits the floor.
///   `rooms/v2` cuts gaps of 2-3 squares instead of 1-3; `caves/v2` repairs
///   the automaton's output (fills small pockets, widens necks) before the
///   check; `open/v2` and `pillars/v2` redraw a map that fails it. Names get
///   the version: `gen-rooms-v2-000017` (v1 keeps `gen-rooms-000017`).
pub const VERSIONS: [u32; 2] = [1, 2];

/// The version [`GenConfig::for_family`] and `ember mapgen` use by default.
pub const LATEST: u32 = 2;

/// Smallest generated side (a cropped cave below it is rejected).
pub const MIN_SIDE: i32 = 10;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub enum Family {
    Open,
    Pillars,
    Rooms,
    Caves,
}

pub const FAMILIES: [Family; 4] = [Family::Open, Family::Pillars, Family::Rooms, Family::Caves];

impl Family {
    pub fn name(self) -> &'static str {
        match self {
            Family::Open => "open",
            Family::Pillars => "pillars",
            Family::Rooms => "rooms",
            Family::Caves => "caves",
        }
    }

    pub fn from_name(s: &str) -> Option<Family> {
        FAMILIES.into_iter().find(|f| f.name() == s)
    }

    /// `<family>/v<version>`, the generator id in `ember.generator`.
    pub fn generator(self, version: u32) -> String {
        format!("{}/v{version}", self.name())
    }

    /// The family and version of a generator id (`rooms/v2`).
    pub fn parse_generator(id: &str) -> Option<(Family, u32)> {
        let (f, v) = id.split_once("/v")?;
        let v: u32 = v.parse().ok()?;
        Some((Family::from_name(f)?, v)).filter(|_| VERSIONS.contains(&v))
    }

    /// Default width and height ranges (inclusive). Rooms and caves need more
    /// area for several rooms or an irregular cave.
    pub fn default_size(self) -> ((i32, i32), (i32, i32)) {
        match self {
            Family::Open => ((10, 24), (10, 24)),
            Family::Pillars => ((12, 24), (12, 24)),
            Family::Rooms => ((14, 24), (14, 24)),
            Family::Caves => ((16, 26), (16, 26)),
        }
    }

    /// Minimum floor ratio (§3.3: 0.55; caves are cropped to their floor's
    /// bounding box and keep irregular wall masses, so they get 0.5).
    pub fn min_floor_ratio(self) -> f64 {
        match self {
            Family::Caves => 0.5,
            _ => 0.55,
        }
    }
}

/// What to generate: size ranges (inclusive, at most 32) and the layout
/// check. The defaults depend on the family ([`GenConfig::for_family`]).
#[derive(Clone, Debug, PartialEq)]
pub struct GenConfig {
    pub width: (i32, i32),
    pub height: (i32, i32),
    /// Rosters (heroes, monsters) that zone layouts must place, with and
    /// without `require_sight`. Default: (3, 9), the undead party against the
    /// largest baseline roster, and (2, 6), the level-2 pair against the
    /// largest catalog roster.
    pub layout_sides: Vec<(usize, usize)>,
    /// Layout seeds `0..layout_seeds` tried per roster and sight rule.
    pub layout_seeds: u64,
    pub max_attempts: u32,
    /// Generator version ([`VERSIONS`]; default [`LATEST`]).
    pub version: u32,
}

impl GenConfig {
    pub fn for_family(family: Family) -> GenConfig {
        let (width, height) = family.default_size();
        GenConfig { width, height, layout_sides: vec![(3, 9), (2, 6)], layout_seeds: 4, max_attempts: 200, version: LATEST }
    }

    /// Choose the generator version (one of [`VERSIONS`]).
    pub fn with_version(mut self, version: u32) -> Result<GenConfig, String> {
        if !VERSIONS.contains(&version) {
            return Err(format!("generator version {version} (one of {VERSIONS:?})"));
        }
        self.version = version;
        Ok(self)
    }

    /// Override the size ranges (each `lo..=hi` inside `1..=32`).
    pub fn with_size(mut self, width: Option<(i32, i32)>, height: Option<(i32, i32)>) -> Result<GenConfig, String> {
        for (r, label) in [(width, "width"), (height, "height")] {
            if let Some((lo, hi)) = r {
                if lo < 1 || hi > MAX_SIDE as i32 || lo > hi {
                    return Err(format!("{label} range {lo}-{hi} (within 1-{MAX_SIDE}, low <= high)"));
                }
            }
        }
        if let Some(w) = width {
            self.width = w;
        }
        if let Some(h) = height {
            self.height = h;
        }
        Ok(self)
    }

    fn sizes_are_default(&self, family: Family) -> bool {
        (self.width, self.height) == family.default_size()
    }
}

/// A generated map that passed [`check`].
#[derive(Clone, Debug)]
pub struct GenMap {
    pub family: Family,
    /// Generator version ([`VERSIONS`]).
    pub version: u32,
    pub seed: u64,
    pub name: String,
    /// Rejected draws before this one.
    pub attempt: u32,
    /// Why they were rejected ([`reject_reason`]: size, floor, openness,
    /// cuts, layout, other), counts per reason.
    pub rejected: std::collections::BTreeMap<&'static str, u32>,
    /// The sampled parameters (`ember.params`).
    pub params: Value,
    /// The configured size ranges, when not the family default.
    pub size_range: Option<((i32, i32), (i32, i32))>,
    pub grid: Arc<Grid>,
    pub stats: MapStats,
}

fn round4(x: f64) -> f64 {
    (x * 10_000.0).round() / 10_000.0
}

/// `stats` as written in `ember.stats`; `los_pairs` is the exact number of
/// floor pairs (a, b), a before b in row order, with line of sight from a to b
/// (openness = los_pairs / (floor (floor - 1) / 2)), for cross-checks against
/// natural20's `Map.line_of_sight`.
pub fn stats_json(st: &MapStats) -> Value {
    let pairs = (st.floor * (st.floor - 1) / 2) as f64;
    json!({"w": st.w, "h": st.h, "floor": st.floor, "floor_ratio": round4(st.floor_ratio),
           "openness": round4(st.openness), "los_pairs": (st.openness * pairs).round() as u64, "diameter": st.diameter})
}

impl GenMap {
    pub fn rows(&self) -> &[String] {
        &self.grid.rows
    }

    /// The generator id (`rooms/v2`).
    pub fn generator(&self) -> String {
        self.family.generator(self.version)
    }

    /// The `ember` metadata block.
    pub fn ember(&self) -> Value {
        let mut v = json!({
            "family": self.family.name(),
            "generator": self.generator(),
            "seed": self.seed,
            "attempt": self.attempt,
            "params": self.params,
            "stats": stats_json(&self.stats),
        });
        if let Some((w, h)) = self.size_range {
            v["size_range"] = json!({"width": [w.0, w.1], "height": [h.0, h.1]});
        }
        v
    }

    /// The `map` object of an `EncounterSpec` (and of a catalog row).
    pub fn map_json(&self) -> Value {
        json!({"name": self.name, "rows": self.rows(), "ember": self.ember()})
    }

    /// The map file: an `EncounterSpec` (format 1) with no creatures yet.
    pub fn spec_json(&self) -> Value {
        json!({"version": crate::spec::FORMAT_VERSION, "map": self.map_json(), "heroes": [], "monsters": []})
    }

    /// The map file as one line of JSON.
    pub fn to_json_line(&self) -> String {
        serde_json::to_string(&self.spec_json()).expect("map JSON")
    }
}

// ----------------------------------------------------------------------------
// random helpers
// ----------------------------------------------------------------------------

/// The generator stream: splitmix of the seed, xored with an FNV-1a hash of
/// the generator id, so families and versions draw independent streams.
fn stream_seed(family: Family, version: u32, seed: u64) -> u64 {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for b in family.generator(version).bytes() {
        h ^= b as u64;
        h = h.wrapping_mul(0x0100_0000_01b3);
    }
    let mut z = seed.wrapping_add(0x9E37_79B9_7F4A_7C15);
    z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
    z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
    (z ^ (z >> 31)) ^ h
}

/// Uniform integer in `lo..=hi`.
fn range(rng: &mut FastRng, lo: i32, hi: i32) -> i32 {
    if hi <= lo {
        return lo;
    }
    lo + rng.die(hi - lo + 1) - 1
}

/// True with probability `num / den`.
fn chance(rng: &mut FastRng, num: i32, den: i32) -> bool {
    rng.die(den) <= num
}

// ----------------------------------------------------------------------------
// canvas
// ----------------------------------------------------------------------------

struct Canvas {
    w: i32,
    h: i32,
    wall: Vec<bool>,
}

impl Canvas {
    fn new(w: i32, h: i32, rim: bool) -> Canvas {
        let mut c = Canvas { w, h, wall: vec![false; (w * h) as usize] };
        if rim {
            for x in 0..w {
                c.set(x, 0, true);
                c.set(x, h - 1, true);
            }
            for y in 0..h {
                c.set(0, y, true);
                c.set(w - 1, y, true);
            }
        }
        c
    }

    fn inside(&self, x: i32, y: i32) -> bool {
        x >= 0 && y >= 0 && x < self.w && y < self.h
    }

    /// Out of bounds counts as a wall (as natural20's map).
    fn get(&self, x: i32, y: i32) -> bool {
        !self.inside(x, y) || self.wall[(y * self.w + x) as usize]
    }

    fn set(&mut self, x: i32, y: i32, v: bool) {
        if self.inside(x, y) {
            self.wall[(y * self.w + x) as usize] = v;
        }
    }

    fn rect(&mut self, x: i32, y: i32, w: i32, h: i32, v: bool) {
        for yy in y..y + h {
            for xx in x..x + w {
                self.set(xx, yy, v);
            }
        }
    }

    fn rows(&self) -> Vec<String> {
        (0..self.h).map(|y| (0..self.w).map(|x| if self.get(x, y) { 'H' } else { '.' }).collect()).collect()
    }
}

// ----------------------------------------------------------------------------
// families
// ----------------------------------------------------------------------------

fn size(rng: &mut FastRng, cfg: &GenConfig) -> (i32, i32) {
    (range(rng, cfg.width.0, cfg.width.1), range(rng, cfg.height.0, cfg.height.1))
}

/// `open/v1`: a rectangle, a wall rim with probability 1/2, 0-4 wall blocks
/// of 1x1 to 2x3 at least one square from the edge or rim.
fn gen_open(rng: &mut FastRng, cfg: &GenConfig) -> (Canvas, Value) {
    let (w, h) = size(rng, cfg);
    let rim = chance(rng, 1, 2);
    let mut c = Canvas::new(w, h, rim);
    let margin = rim as i32 + 1;
    let k = range(rng, 0, 4);
    let mut blocks = Vec::new();
    for _ in 0..k {
        let (mut bw, mut bh) = (range(rng, 1, 2), range(rng, 1, 3));
        if chance(rng, 1, 2) {
            std::mem::swap(&mut bw, &mut bh);
        }
        let x = range(rng, margin, w - margin - bw);
        let y = range(rng, margin, h - margin - bh);
        if x < margin || y < margin || x + bw > w - margin || y + bh > h - margin {
            continue;
        }
        c.rect(x, y, bw, bh, true);
        blocks.push(json!([x, y, bw, bh]));
    }
    (c, json!({"w": w, "h": h, "rim": rim, "blocks": blocks}))
}

/// `pillars/v1`: an open hall (rim with probability 1/2) with pillars on a
/// lattice of spacing 3-5, a random lattice offset, jitter 0-1, 2x2 pillars
/// with probability 0, 1/4 or 1/2 and each lattice point kept with
/// probability 6/10 to 10/10.
fn gen_pillars(rng: &mut FastRng, cfg: &GenConfig) -> (Canvas, Value) {
    let (w, h) = size(rng, cfg);
    let rim = chance(rng, 1, 2);
    let mut c = Canvas::new(w, h, rim);
    let margin = rim as i32 + 1;
    let spacing = range(rng, 3, 5);
    let big = range(rng, 0, 2);
    let jitter = range(rng, 0, 1);
    let keep = range(rng, 6, 10);
    let (ox, oy) = (range(rng, 0, spacing - 1), range(rng, 0, spacing - 1));
    let mut pillars = 0;
    let mut gy = margin + oy;
    while gy < h - margin {
        let mut gx = margin + ox;
        while gx < w - margin {
            if chance(rng, keep, 10) {
                let s = if big > 0 && chance(rng, big, 4) { 2 } else { 1 };
                let (dx, dy) = (range(rng, -jitter, jitter), range(rng, -jitter, jitter));
                let (x, y) = (gx + dx, gy + dy);
                if x >= margin && y >= margin && x + s <= w - margin && y + s <= h - margin {
                    c.rect(x, y, s, s, true);
                    pillars += 1;
                }
            }
            gx += spacing;
        }
        gy += spacing;
    }
    let params = json!({"w": w, "h": h, "rim": rim, "spacing": spacing, "big_quarters": big, "jitter": jitter,
                        "keep_tenths": keep, "offset": [ox, oy], "pillars": pillars});
    (c, params)
}

/// Half-open rectangle `[x0, x1) x [y0, y1)`.
#[derive(Clone, Copy, Debug)]
struct Rect {
    x0: i32,
    y0: i32,
    x1: i32,
    y1: i32,
}

impl Rect {
    fn w(&self) -> i32 {
        self.x1 - self.x0
    }
    fn h(&self) -> i32 {
        self.y1 - self.y0
    }
}

/// Smallest room side (interior squares).
const ROOM_MIN_SIDE: i32 = 3;

/// `rooms/v1`: binary space partition of the interior (rim with probability
/// 1/2) into 2-5 rooms (at most one per 40 interior squares). The leaf to
/// split is the largest (or, with probability 1/2, a random splittable one);
/// a leaf splits across its longer side (either way when nearly square) by a
/// wall line one square thick at a random position leaving rooms of at least
/// 3 squares and not ending next to an earlier gap. Each line gets a gap of
/// 1-3 squares (not at either end of the line when it is long enough); lines
/// of 10+ squares get a second gap with probability 1/3.
///
/// `rooms/v2` is the same with gaps of 2-3 squares (`min_gap` 2), so no
/// single square of a gap is a cut square.
fn gen_rooms(rng: &mut FastRng, cfg: &GenConfig, min_gap: i32) -> (Canvas, Value) {
    let (w, h) = size(rng, cfg);
    let rim = chance(rng, 1, 2);
    let mut c = Canvas::new(w, h, rim);
    let interior = if rim { Rect { x0: 1, y0: 1, x1: w - 1, y1: h - 1 } } else { Rect { x0: 0, y0: 0, x1: w, y1: h } };
    let max_rooms = ((interior.w() * interior.h()) / 40).clamp(2, 5);
    let target = range(rng, 2, max_rooms) as usize;
    let splittable = |len: i32| len >= 2 * ROOM_MIN_SIDE + 1;
    let mut leaves = vec![interior];
    let mut stuck: Vec<bool> = vec![false];
    let mut lines = Vec::new();
    while leaves.len() < target {
        let cands: Vec<usize> =
            (0..leaves.len()).filter(|&i| !stuck[i] && (splittable(leaves[i].w()) || splittable(leaves[i].h()))).collect();
        if cands.is_empty() {
            break;
        }
        let i = if chance(rng, 1, 2) {
            cands[range(rng, 0, cands.len() as i32 - 1) as usize]
        } else {
            *cands.iter().max_by_key(|&&i| (leaves[i].w() * leaves[i].h(), std::cmp::Reverse(i))).unwrap()
        };
        let r = leaves[i];
        let (can_v, can_h) = (splittable(r.w()), splittable(r.h()));
        let vertical = match (can_v, can_h) {
            (true, false) => true,
            (false, true) => false,
            _ => {
                if r.w() * 4 > r.h() * 5 {
                    true
                } else if r.h() * 4 > r.w() * 5 {
                    false
                } else {
                    chance(rng, 1, 2)
                }
            }
        };
        // a vertical line is the column x = p, a horizontal one the row y = p
        let (lo, hi) = if vertical { (r.x0, r.x1) } else { (r.y0, r.y1) };
        let positions: Vec<i32> = (lo + ROOM_MIN_SIDE..=hi - ROOM_MIN_SIDE - 1)
            .filter(|&p| {
                // the squares beyond both ends of the line (and their two
                // neighbours along the boundary) are walls or off the map:
                // a line never ends next to an earlier gap
                (-1..=1).all(|d| {
                    if vertical {
                        c.get(p + d, r.y0 - 1) && c.get(p + d, r.y1)
                    } else {
                        c.get(r.x0 - 1, p + d) && c.get(r.x1, p + d)
                    }
                })
            })
            .collect();
        if positions.is_empty() {
            stuck[i] = true;
            continue;
        }
        let p = positions[range(rng, 0, positions.len() as i32 - 1) as usize];
        let (a, b) = if vertical { (r.y0, r.y1) } else { (r.x0, r.x1) };
        let len = b - a;
        let cell = |t: i32| if vertical { (p, t) } else { (t, p) };
        for t in a..b {
            let (x, y) = cell(t);
            c.set(x, y, true);
        }
        let n_gaps = if len >= 10 && chance(rng, 1, 3) { 2 } else { 1 };
        let mut gaps = Vec::new();
        for _ in 0..n_gaps {
            let g = range(rng, min_gap, 3.min(len));
            // away from the line's ends when there is room, so walls meet the boundary
            let q = if len - 2 >= g { range(rng, a + 1, b - 1 - g) } else { range(rng, a, b - g) };
            for t in q..q + g {
                let (x, y) = cell(t);
                c.set(x, y, false);
            }
            gaps.push(json!([q, g]));
        }
        lines.push(json!({"axis": if vertical { "x" } else { "y" }, "at": p, "from": a, "to": b, "gaps": gaps}));
        let (left, right) = if vertical {
            (Rect { x1: p, ..r }, Rect { x0: p + 1, ..r })
        } else {
            (Rect { y1: p, ..r }, Rect { y0: p + 1, ..r })
        };
        leaves[i] = left;
        leaves.push(right);
        stuck[i] = false;
        stuck.push(false);
    }
    let params = json!({"w": w, "h": h, "rim": rim, "target_rooms": target, "rooms": leaves.len(), "lines": lines});
    (c, params)
}

/// `caves/v1`: walls with probability 38-46% (the rest floor), then the
/// two-phase cellular automaton: 3-4 steps of "wall when 5+ of the 3x3 block
/// around the square are walls, or 2 or fewer of the 5x5 block" (the second
/// rule seeds pillars inside large open areas), then 2-3 steps of the 3x3
/// rule alone (off the map counts as wall). The largest floor component under
/// the A* neighbour rule is kept (ties: the first in row order), the rest
/// walled, and the map cropped to the floor's bounding box (at least 10x10,
/// else the draw is rejected).
///
/// `caves/v2` repairs the kept component before cropping ([`repair_cuts`]):
/// while a cut square exists, the first in row order is resolved: the part
/// it cuts off is walled when it has at most [`POCKET`] squares (a nook or
/// dead end), else the 3x3 block around it is opened (a neck widened). The
/// draw is rejected if cut squares remain after [`REPAIR_STEPS`] steps.
fn gen_caves(rng: &mut FastRng, cfg: &GenConfig, repair: bool) -> (Canvas, Value) {
    let (w, h) = size(rng, cfg);
    let fill = range(rng, 38, 46);
    let seed_steps = range(rng, 3, 4);
    let smooth_steps = range(rng, 2, 3);
    let mut c = Canvas::new(w, h, false);
    for y in 0..h {
        for x in 0..w {
            let v = rng.die(100) <= fill;
            c.set(x, y, v);
        }
    }
    let walls_in = |c: &Canvas, x: i32, y: i32, r: i32| -> i32 {
        let mut n = 0;
        for dy in -r..=r {
            for dx in -r..=r {
                n += c.get(x + dx, y + dy) as i32;
            }
        }
        n
    };
    for step in 0..seed_steps + smooth_steps {
        let mut next = c.wall.clone();
        for y in 0..h {
            for x in 0..w {
                let wall = walls_in(&c, x, y, 1) >= 5 || (step < seed_steps && walls_in(&c, x, y, 2) <= 2);
                next[(y * w + x) as usize] = wall;
            }
        }
        c.wall = next;
    }
    // largest component (A* neighbour rule, as Grid)
    if let Ok(g) = Grid::from_rows(&c.rows()) {
        let mut best: Option<(usize, Vec<i32>)> = None;
        let mut seen = vec![false; g.cells()];
        for i in 0..g.cells() {
            let (x, y) = g.pos_of(i);
            if g.is_wall(x, y) || seen[i] {
                continue;
            }
            let d = g.bfs((x, y));
            let n = d.iter().filter(|&&v| v >= 0).count();
            for (j, &v) in d.iter().enumerate() {
                if v >= 0 {
                    seen[j] = true;
                }
            }
            if best.as_ref().is_none_or(|(m, _)| n > *m) {
                best = Some((n, d));
            }
        }
        if let Some((_, d)) = best {
            for (j, &v) in d.iter().enumerate() {
                if v < 0 {
                    c.wall[j] = true;
                }
            }
        }
    }
    let repaired = repair.then(|| repair_cuts(&mut c));
    // crop to the floor's bounding box
    let floor: Vec<(i32, i32)> = (0..h).flat_map(|y| (0..w).map(move |x| (x, y))).filter(|&(x, y)| !c.get(x, y)).collect();
    let mut cropped = c;
    if !floor.is_empty() {
        let (x0, x1) = (floor.iter().map(|p| p.0).min().unwrap(), floor.iter().map(|p| p.0).max().unwrap());
        let (y0, y1) = (floor.iter().map(|p| p.1).min().unwrap(), floor.iter().map(|p| p.1).max().unwrap());
        let mut out = Canvas::new(x1 - x0 + 1, y1 - y0 + 1, false);
        for y in y0..=y1 {
            for x in x0..=x1 {
                out.set(x - x0, y - y0, cropped.get(x, y));
            }
        }
        cropped = out;
    }
    let mut params = json!({"w": w, "h": h, "fill_percent": fill, "seed_steps": seed_steps, "smooth_steps": smooth_steps,
                            "cropped": [cropped.w, cropped.h]});
    if let Some(r) = repaired {
        params["repair"] = json!({"steps": r.steps, "filled": r.filled, "carved": r.carved, "pockets": r.pockets,
                                  "necks": r.necks, "done": r.done});
    }
    (cropped, params)
}

// ----------------------------------------------------------------------------
// cut squares (v2)
// ----------------------------------------------------------------------------

/// A cut square: a floor square whose loss disconnects the floor under
/// orthogonal adjacency (an articulation point of the 4-neighbour floor
/// graph).
///
/// Why this graph: a corpse square is passable but never placeable, and the
/// native AI moves one square at a time, so no move ends on it. A hero's
/// diagonal step needs both orthogonal squares free and placeable
/// (natural20 `PlayerCharacter.available_actions`, no corner cutting), so a
/// diagonal step can always be replaced by two orthogonal ones: with any set
/// of corpses, the squares a hero can reach are exactly the 4-connected
/// component of the remaining floor. A monster's step has no corner rule, so
/// it reaches at least as much. A floor without cut squares (2-connected
/// under 4-adjacency) therefore never lets one corpse (or one creature
/// standing still) split the map for either side; one corpse in a one-square
/// doorway or cave neck, or in front of a one-square nook, can.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Cut {
    pub x: i32,
    pub y: i32,
    /// Floor squares of the smallest part the cut separates from the rest.
    pub piece: usize,
}

/// Cut squares of the floor (`wall(x, y)` for `0 <= x < w`, `0 <= y < h`),
/// in row order. Tarjan's articulation points, iterative.
fn cuts_in(w: i32, h: i32, wall: impl Fn(i32, i32) -> bool) -> Vec<Cut> {
    let n = (w * h) as usize;
    let floor: Vec<bool> = (0..n).map(|i| !wall(i as i32 % w, i as i32 / w)).collect();
    let nb = |i: usize, k: u8| -> Option<usize> {
        let (x, y) = (i as i32 % w, i as i32 / w);
        let (nx, ny) = match k {
            0 => (x - 1, y),
            1 => (x + 1, y),
            2 => (x, y - 1),
            _ => (x, y + 1),
        };
        if nx < 0 || ny < 0 || nx >= w || ny >= h {
            return None;
        }
        let j = (ny * w + nx) as usize;
        floor[j].then_some(j)
    };
    const NONE: usize = usize::MAX;
    let mut disc = vec![u32::MAX; n];
    let mut low = vec![0u32; n];
    let mut size = vec![0usize; n];
    let mut kids = vec![0u32; n];
    let mut sep_n = vec![0u32; n];
    let mut sep_sum = vec![0usize; n];
    let mut sep_min = vec![usize::MAX; n];
    let mut out = Vec::new();
    let mut t = 0u32;
    for root in 0..n {
        if !floor[root] || disc[root] != u32::MAX {
            continue;
        }
        let mut order = vec![root];
        let mut stack: Vec<(usize, usize, u8)> = vec![(root, NONE, 0)];
        disc[root] = t;
        low[root] = t;
        size[root] = 1;
        t += 1;
        while let Some(top) = stack.last_mut() {
            let (v, p) = (top.0, top.1);
            if top.2 < 4 {
                let k = top.2;
                top.2 += 1;
                if let Some(u) = nb(v, k) {
                    if disc[u] == u32::MAX {
                        disc[u] = t;
                        low[u] = t;
                        size[u] = 1;
                        t += 1;
                        order.push(u);
                        stack.push((u, v, 0));
                    } else if u != p {
                        low[v] = low[v].min(disc[u]);
                    }
                }
            } else {
                stack.pop();
                if p != NONE {
                    low[p] = low[p].min(low[v]);
                    size[p] += size[v];
                    kids[p] += 1;
                    if low[v] >= disc[p] {
                        sep_n[p] += 1;
                        sep_sum[p] += size[v];
                        sep_min[p] = sep_min[p].min(size[v]);
                    }
                }
            }
        }
        let total = size[root];
        for &v in &order {
            let piece = if v == root {
                (kids[v] >= 2).then_some(sep_min[v])
            } else {
                (sep_n[v] >= 1).then(|| sep_min[v].min(total - 1 - sep_sum[v]))
            };
            if let Some(piece) = piece {
                out.push(Cut { x: v as i32 % w, y: v as i32 / w, piece });
            }
        }
    }
    out.sort_by_key(|c| (c.y, c.x));
    out
}

/// The cut squares of a map (see [`Cut`]), in row order.
pub fn cut_squares(grid: &Grid) -> Vec<Cut> {
    cuts_in(grid.w, grid.h, |x, y| grid.is_wall(x, y))
}

/// Largest part a single cut square separates (0: none).
pub fn max_cut_piece(cuts: &[Cut]) -> usize {
    cuts.iter().map(|c| c.piece).max().unwrap_or(0)
}

/// `caves/v2`: a cut-off part of at most this many squares is walled (a nook
/// or a dead end), a larger one gets its neck widened.
pub const POCKET: usize = 8;

/// Repair steps before a `caves/v2` draw is rejected.
pub const REPAIR_STEPS: u32 = 400;

/// What [`repair_cuts`] did.
#[derive(Clone, Copy, Debug, Default)]
pub struct Repair {
    pub steps: u32,
    /// Squares walled (pocket fills) and opened (neck widenings).
    pub filled: usize,
    pub carved: usize,
    pub pockets: u32,
    pub necks: u32,
    /// No cut square left.
    pub done: bool,
}

/// Squares of the smallest part `(x, y)` cuts off (4-adjacency).
fn smallest_part(c: &Canvas, x: i32, y: i32) -> Vec<(i32, i32)> {
    let mut seen = vec![false; (c.w * c.h) as usize];
    seen[(y * c.w + x) as usize] = true;
    let mut best: Option<Vec<(i32, i32)>> = None;
    for (sx, sy) in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)] {
        if c.get(sx, sy) || seen[(sy * c.w + sx) as usize] {
            continue;
        }
        let mut part = vec![(sx, sy)];
        seen[(sy * c.w + sx) as usize] = true;
        let mut k = 0;
        while k < part.len() {
            let (px, py) = part[k];
            k += 1;
            for (qx, qy) in [(px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)] {
                if !c.get(qx, qy) && !seen[(qy * c.w + qx) as usize] {
                    seen[(qy * c.w + qx) as usize] = true;
                    part.push((qx, qy));
                }
            }
        }
        if best.as_ref().is_none_or(|b| part.len() < b.len()) {
            best = Some(part);
        }
    }
    best.unwrap_or_default()
}

/// Remove the canvas's cut squares (`caves/v2`, [`gen_caves`]): walls the
/// part a cut separates when it has at most [`POCKET`] squares, else opens
/// the 3x3 block around the cut square; one cut at a time, in row order.
fn repair_cuts(c: &mut Canvas) -> Repair {
    let mut r = Repair::default();
    while r.steps < REPAIR_STEPS {
        let cuts = cuts_in(c.w, c.h, |x, y| c.get(x, y));
        let Some(cut) = cuts.first().copied() else {
            r.done = true;
            return r;
        };
        r.steps += 1;
        if cut.piece <= POCKET {
            for (x, y) in smallest_part(c, cut.x, cut.y) {
                c.set(x, y, true);
                r.filled += 1;
            }
            r.pockets += 1;
        } else {
            for dy in -1..=1 {
                for dx in -1..=1 {
                    let (x, y) = (cut.x + dx, cut.y + dy);
                    if c.inside(x, y) && c.get(x, y) {
                        c.set(x, y, false);
                        r.carved += 1;
                    }
                }
            }
            r.necks += 1;
        }
    }
    r.done = cuts_in(c.w, c.h, |x, y| c.get(x, y)).is_empty();
    r
}

// ----------------------------------------------------------------------------
// generation and checks
// ----------------------------------------------------------------------------

/// Map name: `gen-<family>-<seed:06>` for v1, `gen-<family>-v<k>-<seed:06>`
/// for later versions (with the size ranges before the seed when they are
/// not the family default).
pub fn map_name(family: Family, seed: u64, cfg: &GenConfig) -> String {
    let stem = if cfg.version == 1 { family.name().to_string() } else { format!("{}-v{}", family.name(), cfg.version) };
    if cfg.sizes_are_default(family) {
        format!("gen-{stem}-{seed:06}")
    } else {
        format!("gen-{stem}-w{}-{}-h{}-{}-{seed:06}", cfg.width.0, cfg.width.1, cfg.height.0, cfg.height.1)
    }
}

/// The class of a rejected draw's error (for statistics only).
pub fn reject_reason(err: &str) -> &'static str {
    if err.contains("below") || err.starts_with("map ") && err.contains("above") {
        "size"
    } else if err.starts_with("floor ratio") {
        "floor"
    } else if err.starts_with("openness") {
        "openness"
    } else if err.contains("cut squares") {
        "cuts"
    } else if err.starts_with("layout") {
        "layout"
    } else {
        "other"
    }
}

/// The map of `family` for `seed`: deterministic for (family, seed, cfg).
pub fn generate(family: Family, seed: u64, cfg: &GenConfig) -> Result<GenMap, String> {
    if !VERSIONS.contains(&cfg.version) {
        return Err(format!("generator version {} (one of {VERSIONS:?})", cfg.version));
    }
    let v2 = cfg.version >= 2;
    let mut rng = FastRng::new(stream_seed(family, cfg.version, seed));
    let mut last = String::new();
    let mut rejected = std::collections::BTreeMap::new();
    for attempt in 0..cfg.max_attempts.max(1) {
        if attempt > 0 {
            *rejected.entry(reject_reason(&last)).or_insert(0) += 1;
        }
        let (canvas, params) = match family {
            Family::Open => gen_open(&mut rng, cfg),
            Family::Pillars => gen_pillars(&mut rng, cfg),
            Family::Rooms => gen_rooms(&mut rng, cfg, if v2 { 2 } else { 1 }),
            Family::Caves => gen_caves(&mut rng, cfg, v2),
        };
        if canvas.w < MIN_SIDE || canvas.h < MIN_SIDE {
            last = format!("{}x{} below {MIN_SIDE}x{MIN_SIDE}", canvas.w, canvas.h);
            continue;
        }
        let grid = match Grid::from_rows(&canvas.rows()) {
            Ok(g) => Arc::new(g),
            Err(e) => {
                last = e;
                continue;
            }
        };
        match check(&grid, family, cfg) {
            Ok(stats) => {
                return Ok(GenMap {
                    family,
                    version: cfg.version,
                    seed,
                    name: map_name(family, seed, cfg),
                    attempt,
                    rejected,
                    params,
                    size_range: (!cfg.sizes_are_default(family)).then_some((cfg.width, cfg.height)),
                    grid,
                    stats,
                })
            }
            Err(e) => last = e,
        }
    }
    Err(format!("{} seed {seed}: no valid map in {} attempts (last: {last})", family.generator(cfg.version), cfg.max_attempts))
}

/// The validity checks of a map of `family` (GENERAL_ENV.md §3.3, G3):
/// size at most 32x32 and `H` / `.` only (the grid), one floor component
/// under the A* neighbour rule, the family's minimum floor ratio and openness
/// band, from version 2 no cut square ([`cut_squares`]), zone-layout anchors,
/// and room for the layouts (`cfg.layout_sides` placed by [`auto_place`] with
/// and without sight for each layout seed).
pub fn check(grid: &Grid, family: Family, cfg: &GenConfig) -> Result<MapStats, String> {
    if grid.w > MAX_SIDE as i32 || grid.h > MAX_SIDE as i32 {
        return Err(format!("map {}x{} above {MAX_SIDE}x{MAX_SIDE}", grid.w, grid.h));
    }
    if let Some(c) = grid.rows.iter().flat_map(|r| r.chars()).find(|&c| c != 'H' && c != '.') {
        return Err(format!("map square {c:?} (walls only: H and .)"));
    }
    let st = grid.measure()?;
    if st.floor_ratio < family.min_floor_ratio() {
        return Err(format!("floor ratio {:.3} < {}", st.floor_ratio, family.min_floor_ratio()));
    }
    let (lo, hi) = openness_band(family.name()).expect("family band");
    if st.openness < lo || st.openness > hi {
        return Err(format!("openness {:.3} outside the {} band [{lo}, {hi}]", st.openness, family.name()));
    }
    if cfg.version >= 2 {
        let cuts = cut_squares(grid);
        if let Some(c) = cuts.first() {
            return Err(format!(
                "{} cut squares, first ({}, {}) cutting off {} squares (largest {})",
                cuts.len(),
                c.x,
                c.y,
                c.piece,
                max_cut_piece(&cuts)
            ));
        }
    }
    for &(heroes, monsters) in &cfg.layout_sides {
        let sides: Vec<u8> = std::iter::repeat_n(0u8, heroes).chain(std::iter::repeat_n(1u8, monsters)).collect();
        let fixed = vec![None; sides.len()];
        for sight in [false, true] {
            for s in 0..cfg.layout_seeds {
                auto_place(grid, &sides, &fixed, s, sight, TRIES)
                    .map_err(|e| format!("layout {heroes}+{monsters} seed {s} sight {sight}: {e}"))?;
            }
        }
    }
    Ok(st)
}

/// A map file written by [`GenMap::spec_json`] (or any `EncounterSpec` JSON:
/// creatures are ignored): the name, the `ember` block and the grid. The map
/// is checked as natural20's builder checks it (rows of `H` / `.`, at most
/// 32x32, one floor component); a map whose `ember.family` names a generated
/// family is also checked by [`check`] with that family's default layout
/// check and the version of `ember.generator` (`rooms/v2`; v1 when absent).
pub struct MapDoc {
    pub name: Option<String>,
    pub ember: Option<Value>,
    pub grid: Arc<Grid>,
    pub family: Option<Family>,
    /// Generator version (`ember.generator`), for a generated family.
    pub version: Option<u32>,
    pub stats: MapStats,
}

pub fn load_map_json(text: &str) -> Result<MapDoc, String> {
    let spec = crate::spec::EncounterSpec::from_json(text)?;
    if spec.version != crate::spec::FORMAT_VERSION {
        return Err(format!("unsupported encounter format version {}", spec.version));
    }
    let rows = &spec.map.rows;
    if rows.is_empty() || rows.iter().any(|r| r.len() != rows[0].len()) {
        return Err("map rows must be non-empty and of equal length".into());
    }
    let grid = Arc::new(Grid::from_rows(rows)?);
    if grid.components() != 1 {
        return Err("the floor is not one connected component".into());
    }
    let ember = spec.map.ember.as_ref();
    let family = ember.and_then(|e| e.get("family")).and_then(Value::as_str).and_then(Family::from_name);
    let version = match (family, ember.and_then(|e| e.get("generator"))) {
        (None, _) => None,
        (Some(_), None) => Some(1),
        (Some(f), Some(g)) => {
            let g = g.as_str().ok_or("ember.generator must be a string")?;
            match Family::parse_generator(g) {
                Some((gf, v)) if gf == f => Some(v),
                _ => return Err(format!("ember.generator {g:?} is not a {} generator", f.name())),
            }
        }
    };
    let stats = match (family, version) {
        (Some(f), Some(v)) => check(&grid, f, &GenConfig::for_family(f).with_version(v)?)?,
        _ => grid.measure()?,
    };
    Ok(MapDoc { name: spec.map.name.clone(), ember: spec.map.ember.clone(), grid, family, version, stats })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn helpers() {
        let mut rng = FastRng::new(1);
        for _ in 0..1000 {
            let v = range(&mut rng, -1, 1);
            assert!((-1..=1).contains(&v));
            assert_eq!(range(&mut rng, 3, 3), 3);
        }
        assert!(!chance(&mut rng, 0, 4));
        assert!(chance(&mut rng, 4, 4));
        assert_ne!(stream_seed(Family::Open, 1, 0), stream_seed(Family::Caves, 1, 0));
        assert_ne!(stream_seed(Family::Open, 1, 0), stream_seed(Family::Open, 1, 1));
        assert_ne!(stream_seed(Family::Open, 1, 0), stream_seed(Family::Open, 2, 0));
    }

    #[test]
    fn size_overrides() {
        let cfg = GenConfig::for_family(Family::Open);
        assert!(cfg.clone().with_size(Some((10, 33)), None).is_err());
        assert!(cfg.clone().with_size(Some((12, 10)), None).is_err());
        assert!(cfg.clone().with_size(None, Some((0, 10))).is_err());
        let c2 = cfg.clone().with_size(Some((16, 16)), Some((12, 12))).unwrap();
        let m = generate(Family::Open, 3, &c2).unwrap();
        assert_eq!((m.grid.w, m.grid.h), (16, 12));
        assert_eq!(m.name, "gen-open-v2-w16-16-h12-12-000003");
        assert_eq!(generate(Family::Open, 3, &cfg).unwrap().name, "gen-open-v2-000003");
        let v1 = cfg.clone().with_version(1).unwrap();
        assert_eq!(generate(Family::Open, 3, &v1).unwrap().name, "gen-open-000003");
        let m = generate(Family::Open, 3, &c2.with_version(1).unwrap()).unwrap();
        assert_eq!(m.name, "gen-open-w16-16-h12-12-000003");
    }
}
