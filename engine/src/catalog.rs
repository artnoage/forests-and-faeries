//! The encounter catalog (GENERAL_ENV.md §7.3; the trainer's reader is
//! natural20 `ember_rl/general_env.py` `load_catalog`): `encounters.jsonl`,
//! one encounter per line. Besides the trainer's fields (`id`, `tier`,
//! `split`, `baseline` or `p` and `truncation`) a row says what to play:
//!
//! ```text
//! {"id": "vault-skel3", "tier": "T0", "split": "train",
//!  "map": "vault",                          a fixed map (content/maps/<stem>.yml) or {"name": ..., "rows": [...]}
//!  "party": ["guy", "elion", "curogana"],   hero content ids (unit id = content id)
//!  "roster": ["skeleton", "skeleton"],      monster content ids (unit ids <content>-<n> in order)
//!  "layout": {"rule": "zone", "require_sight": true},
//!  "max_rounds": 30}                        optional: overrides the environment's horizon
//! ```
//!
//! or, instead of `map`/`party`/`roster`, `"spec": {...}`: a natural20
//! `EncounterSpec` (format 1, `scenarios/general/spec.py`) whose units may
//! carry squares. Layout rules:
//! - `zone` (default): `auto_place(layout_seed)` ([`crate::layout`]) for the
//!   unplaced creatures; `require_sight` (default false, as natural20) and
//!   `tries` (default 200). If a seed finds no layout, up to seven derived
//!   seeds are tried (recorded in the layout's `seed`).
//! - `fixed`: every creature already placed (in `spec`, or by `placements`:
//!   `[{"id", "x", "y"}, ...]`).
//!
//! Units register heroes first, then monsters, each in list order: the
//! creature token order of the observation and the initiative tie order.

use std::collections::HashMap;
use std::sync::Arc;

use serde_json::Value;

use crate::content::ContentPool;
use crate::layout::{auto_place_sized, TRIES};
use crate::map::{builtin_map, Grid, Pos};
use crate::spec::{EncounterSpec, MAX_CREATURES};
use crate::tape::Placement;

/// The smoke-test catalog compiled into the crate (`catalogs/g6-smoke.jsonl`;
/// not under `content/`, which holds only the licensed content pack).
pub const DEFAULT_CATALOG: &str = "catalogs/g6-smoke.jsonl";
const DEFAULT_CATALOG_TEXT: &str = include_str!("../catalogs/g6-smoke.jsonl");

#[derive(Clone, Debug, PartialEq)]
pub enum LayoutRule {
    Zone { require_sight: bool, tries: usize },
    Fixed,
}

/// One catalog row, validated: map, units, layout rule.
#[derive(Clone, Debug)]
pub struct Entry {
    pub id: String,
    pub map_name: Option<String>,
    pub grid: Arc<Grid>,
    pub rows: Vec<String>,
    /// Unit ids in registration order (heroes, then monsters), their content
    /// ids, sides (0 heroes, 1 monsters), footprint sizes (1/2/3) and fixed squares.
    pub units: Vec<String>,
    pub contents: Vec<String>,
    pub sides: Vec<u8>,
    pub sizes: Vec<u8>,
    pub fixed: Vec<Option<Pos>>,
    pub layout: LayoutRule,
    pub max_rounds: Option<i32>,
    /// The row as given (JSON text).
    pub raw: String,
}

/// An encounter with every creature placed.
#[derive(Clone, Debug)]
pub struct Placed {
    pub placements: Vec<Placement>,
    /// natural20's `layout` record (`null` for a fixed layout).
    pub layout: Value,
}

fn rows_of(grid: &Grid) -> Vec<String> {
    grid.rows.clone()
}

fn str_list(v: &Value, what: &str) -> Result<Vec<String>, String> {
    v.as_array()
        .ok_or_else(|| format!("{what} must be a list"))?
        .iter()
        .map(|x| x.as_str().map(str::to_string).ok_or_else(|| format!("{what} must hold strings")))
        .collect()
}

impl Entry {
    pub fn from_json(row: &Value, pool: &ContentPool) -> Result<Entry, String> {
        let id = row.get("id").and_then(Value::as_str).ok_or("catalog row without a string id")?.to_string();
        Entry::parse(&id, row, pool).map_err(|e| format!("encounter {id}: {e}"))
    }

    fn parse(id: &str, row: &Value, pool: &ContentPool) -> Result<Entry, String> {
        let (mut units, mut contents, mut sides, mut fixed) = (Vec::new(), Vec::new(), Vec::new(), Vec::new());
        let (map_name, grid) = if let Some(spec) = row.get("spec") {
            for key in ["map", "party", "roster"] {
                if row.get(key).is_some() {
                    return Err(format!("give either spec or {key}, not both"));
                }
            }
            let spec: EncounterSpec = serde_json::from_value(spec.clone()).map_err(|e| format!("spec: {e}"))?;
            if spec.version != crate::spec::FORMAT_VERSION {
                return Err(format!("unsupported encounter format version {}", spec.version));
            }
            let grid = Grid::shared(&spec.map.rows)?;
            for (side, list) in [(0u8, &spec.heroes), (1u8, &spec.monsters)] {
                for u in list {
                    units.push(u.id.clone());
                    contents.push(u.content.clone());
                    sides.push(side);
                    fixed.push(match (u.x, u.y) {
                        (Some(x), Some(y)) => Some((x, y)),
                        (None, None) => None,
                        _ => return Err(format!("{}: give both x and y or neither", u.id)),
                    });
                }
            }
            (spec.map.name.clone(), grid)
        } else {
            let (name, grid) = match row.get("map") {
                Some(Value::String(stem)) => {
                    let m = builtin_map(stem).ok_or_else(|| format!("unknown fixed map {stem:?}"))??;
                    (Some(m.name.unwrap_or_else(|| stem.clone())), m.grid)
                }
                Some(m @ Value::Object(_)) => {
                    let rows = str_list(m.get("rows").ok_or("map without rows")?, "map rows")?;
                    (m.get("name").and_then(Value::as_str).map(str::to_string), Grid::shared(&rows)?)
                }
                _ => return Err("map must be a fixed map name or {name, rows}".into()),
            };
            let party = str_list(row.get("party").ok_or("no party")?, "party")?;
            let roster = str_list(row.get("roster").ok_or("no roster")?, "roster")?;
            for c in &party {
                units.push(c.clone());
                contents.push(c.clone());
                sides.push(0);
            }
            let mut numbers: HashMap<&str, u32> = HashMap::new();
            for c in &roster {
                let n = numbers.entry(c.as_str()).or_insert(0);
                *n += 1;
                units.push(format!("{c}-{n}"));
                contents.push(c.clone());
                sides.push(1);
            }
            fixed = vec![None; units.len()];
            (name, grid)
        };
        let layout = match row.get("layout") {
            None | Some(Value::Null) => LayoutRule::Zone { require_sight: false, tries: TRIES },
            Some(l) => match l.get("rule").and_then(Value::as_str).unwrap_or("zone") {
                "zone" => LayoutRule::Zone {
                    require_sight: l.get("require_sight").map_or(Ok(false), |v| v.as_bool().ok_or("require_sight must be a bool"))?,
                    tries: l.get("tries").map_or(Ok(TRIES), |v| v.as_u64().map(|t| t as usize).ok_or("tries must be an integer"))?,
                },
                "fixed" => {
                    if let Some(list) = l.get("placements") {
                        let list: Vec<Placement> = serde_json::from_value(list.clone()).map_err(|e| format!("placements: {e}"))?;
                        for p in list {
                            let i = units.iter().position(|u| *u == p.id).ok_or_else(|| format!("placement for unknown unit {}", p.id))?;
                            fixed[i] = Some((p.x, p.y));
                        }
                    }
                    if let Some(i) = fixed.iter().position(Option::is_none) {
                        return Err(format!("fixed layout leaves {} unplaced", units[i]));
                    }
                    LayoutRule::Fixed
                }
                other => return Err(format!("unknown layout rule {other:?} (zone, fixed)")),
            },
        };
        let max_rounds = match row.get("max_rounds") {
            None | Some(Value::Null) => None,
            Some(v) => Some(v.as_i64().filter(|&r| r >= 1).ok_or("max_rounds must be a positive integer")? as i32),
        };
        // The builder's rules (EncounterSpec.validate) on a spec with every
        // fixed square; the unplaced creatures are checked after placement.
        if grid.components() > 1 {
            return Err("the floor is not one connected component".into());
        }
        if units.len() > MAX_CREATURES {
            return Err(format!("{} creatures (at most {MAX_CREATURES})", units.len()));
        }
        if !sides.contains(&0) || !sides.contains(&1) {
            return Err("at least one hero and one monster".into());
        }
        let mut sizes = Vec::with_capacity(units.len());
        let mut fixed_occ: Vec<Option<usize>> = vec![None; grid.cells()];
        for (i, uid) in units.iter().enumerate() {
            let tid = pool.tid(&contents[i]).ok_or_else(|| format!("unknown content id {:?}", contents[i]))?;
            let tmpl = pool.template(tid);
            if tmpl.pc != (sides[i] == 0) {
                return Err(format!("{uid}: content {:?} is on the wrong side", contents[i]));
            }
            if pool.unit_tid(uid) != Some(tid) {
                return Err(format!("unit id {uid:?} does not match content {:?}", contents[i]));
            }
            if units[..i].contains(uid) {
                return Err(format!("duplicate unit id {uid:?}"));
            }
            let sz = tmpl.token_size;
            sizes.push(sz);
            if let Some(p) = fixed[i] {
                for dx in 0..i32::from(sz) {
                    for dy in 0..i32::from(sz) {
                        let (cx, cy) = (p.0 + dx, p.1 + dy);
                        if !grid.in_bounds(cx, cy) || grid.is_wall(cx, cy) {
                            return Err(format!("{uid} must stand on a free {sz}x{sz} floor footprint, not {p:?} (blocked at ({cx}, {cy}))"));
                        }
                        let idx = grid.index(cx, cy);
                        if let Some(other) = fixed_occ[idx] {
                            return Err(format!("{uid} at {p:?} overlaps {} at ({cx}, {cy})", units[other]));
                        }
                        fixed_occ[idx] = Some(i);
                    }
                }
            }
        }
        let rows = rows_of(&grid);
        let entry = Entry { id: id.to_string(), map_name, grid, rows, units, contents, sides, sizes, fixed, layout, max_rounds, raw: row.to_string() };
        entry.place(0)?; // a row that cannot be placed fails at load time
        Ok(entry)
    }

    /// Place the encounter with `layout_seed` (ignored by a fixed layout).
    pub fn place(&self, layout_seed: u64) -> Result<Placed, String> {
        let (pos, layout) = match self.layout {
            LayoutRule::Fixed => (self.fixed.iter().map(|p| p.unwrap()).collect::<Vec<_>>(), Value::Null),
            LayoutRule::Zone { require_sight, tries } => {
                let mut last = String::new();
                let mut found = None;
                for k in 0..8u64 {
                    let seed = if k == 0 { layout_seed } else { layout_seed ^ k.wrapping_mul(0x9E37_79B9_7F4A_7C15) };
                    match auto_place_sized(&self.grid, &self.sides, &self.sizes, &self.fixed, seed, require_sight, tries) {
                        Ok((pos, z)) => {
                            let mut j = z.to_json();
                            j["require_sight"] = Value::Bool(require_sight);
                            found = Some((pos, j));
                            break;
                        }
                        Err(e) => last = e,
                    }
                }
                found.ok_or(last)?
            }
        };
        let placements = self.units.iter().zip(pos).map(|(id, (x, y))| Placement { id: id.clone(), x, y }).collect();
        Ok(Placed { placements, layout })
    }

    /// The placed encounter as natural20 `EncounterSpec.to_dict()` (format 1).
    pub fn spec_json(&self, placed: &Placed) -> Value {
        let unit = |i: usize| {
            let p = &placed.placements[i];
            serde_json::json!({"id": self.units[i], "content": self.contents[i], "x": p.x, "y": p.y})
        };
        let mut v = serde_json::json!({
            "version": crate::spec::FORMAT_VERSION,
            "map": {"name": self.map_name, "rows": self.rows},
            "heroes": (0..self.units.len()).filter(|&i| self.sides[i] == 0).map(unit).collect::<Vec<_>>(),
            "monsters": (0..self.units.len()).filter(|&i| self.sides[i] == 1).map(unit).collect::<Vec<_>>(),
        });
        if !placed.layout.is_null() {
            v["layout"] = placed.layout.clone();
        }
        v
    }
}

/// Every encounter by id.
#[derive(Clone, Debug, Default)]
pub struct Catalog {
    pub entries: Vec<Arc<Entry>>,
    by_id: HashMap<String, usize>,
}

impl Catalog {
    /// JSON lines (blank lines and `#` comments skipped), as `load_catalog`.
    pub fn from_jsonl(text: &str, pool: &ContentPool) -> Result<Catalog, String> {
        let mut rows = Vec::new();
        for (n, line) in text.lines().enumerate() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            rows.push(serde_json::from_str::<Value>(line).map_err(|e| format!("catalog line {}: {e}", n + 1))?);
        }
        Catalog::from_rows(&rows, pool)
    }

    pub fn from_rows(rows: &[Value], pool: &ContentPool) -> Result<Catalog, String> {
        let mut cat = Catalog::default();
        for row in rows {
            let e = Entry::from_json(row, pool)?;
            if cat.by_id.insert(e.id.clone(), cat.entries.len()).is_some() {
                return Err(format!("duplicate encounter {}", e.id));
            }
            cat.entries.push(Arc::new(e));
        }
        if cat.entries.is_empty() {
            return Err("empty encounter catalog".into());
        }
        Ok(cat)
    }

    pub fn load(path: &std::path::Path, pool: &ContentPool) -> Result<Catalog, String> {
        let text = std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?;
        Catalog::from_jsonl(&text, pool).map_err(|e| format!("{}: {e}", path.display()))
    }

    /// The embedded smoke-test catalog (provisional, unbalanced; G7's
    /// `ember balance` writes the real one).
    pub fn builtin(pool: &ContentPool) -> Result<Catalog, String> {
        Catalog::from_jsonl(DEFAULT_CATALOG_TEXT, pool)
    }

    pub fn get(&self, id: &str) -> Option<&Arc<Entry>> {
        self.by_id.get(id).map(|&i| &self.entries[i])
    }
}
