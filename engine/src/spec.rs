//! `EncounterSpec` JSON (natural20 `scenarios/general/spec.py`, format
//! version 1): the map rows inline, heroes and monsters with content ids and
//! squares. The balancing catalog and tape headers use it (GENERAL_ENV.md
//! §3.2, §11).
//!
//! natural20 rebuilds a spec through its builder steps, so every rule is
//! checked; `EncounterSpec::validate` checks the same rules (and `check()`'s
//! rules for a fight: every creature placed, at least one per side). Keys
//! natural20 ignores are ignored here too (`record`, `layout`, `ember`).

use std::sync::Arc;

use serde::Deserialize;

use crate::content::ContentPool;
use crate::map::{Grid, MAX_SIDE};
use crate::tape::Placement;

pub const FORMAT_VERSION: i64 = 1;
/// `spec.MAX_CREATURES`.
pub const MAX_CREATURES: usize = 24;

#[derive(Clone, Debug, Deserialize)]
pub struct SpecMap {
    #[serde(default)]
    pub name: Option<String>,
    pub rows: Vec<String>,
    /// Generator metadata (`ember:`), carried as is.
    #[serde(default)]
    pub ember: Option<serde_json::Value>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct SpecUnit {
    pub id: String,
    pub content: String,
    #[serde(default)]
    pub x: Option<i32>,
    #[serde(default)]
    pub y: Option<i32>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct EncounterSpec {
    pub version: i64,
    pub map: SpecMap,
    #[serde(default)]
    pub heroes: Vec<SpecUnit>,
    #[serde(default)]
    pub monsters: Vec<SpecUnit>,
    /// `auto_place` record (`{rule, seed, ...}`), carried as is.
    #[serde(default)]
    pub layout: Option<serde_json::Value>,
}

/// A validated spec: the shared map, unit ids in registration order
/// (heroes, then monsters, each in list order: `Battle.add` and the
/// initiative dice follow it) and their squares.
#[derive(Clone, Debug)]
pub struct Encounter {
    pub name: Option<String>,
    pub grid: Arc<Grid>,
    pub rows: Vec<String>,
    pub units: Vec<String>,
    pub placements: Vec<Placement>,
}

impl EncounterSpec {
    pub fn from_json(text: &str) -> Result<EncounterSpec, String> {
        serde_json::from_str(text).map_err(|e| format!("encounter spec: {e}"))
    }

    pub fn load(path: &std::path::Path) -> Result<EncounterSpec, String> {
        let text = std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?;
        EncounterSpec::from_json(&text).map_err(|e| format!("{}: {e}", path.display()))
    }

    /// natural20 `EncounterSpec.from_dict` + `check(sight=False)`: the rules
    /// of every builder step and of a complete encounter.
    pub fn validate(&self, pool: &ContentPool) -> Result<Encounter, String> {
        if self.version != FORMAT_VERSION {
            return Err(format!("unsupported encounter format version {}", self.version));
        }
        let rows = &self.map.rows;
        if rows.is_empty() || rows.iter().any(|r| r.len() != rows[0].len()) {
            return Err("map rows must be non-empty and of equal length".into());
        }
        if let Some(c) = rows.iter().flat_map(|r| r.chars()).find(|&c| c != 'H' && c != '.') {
            return Err(format!("map rows may only use 'H' and '.', not {c:?}"));
        }
        let (w, h) = (rows[0].len(), rows.len());
        if w > MAX_SIDE || h > MAX_SIDE {
            return Err(format!("map {w}x{h}: width and height must be at most {MAX_SIDE}"));
        }
        let grid = Grid::shared(rows)?;
        if grid.components() > 1 {
            return Err("the floor is not one connected component".into());
        }
        let n = self.heroes.len() + self.monsters.len();
        if n > MAX_CREATURES {
            return Err(format!("{n} creatures (at most {MAX_CREATURES})"));
        }
        if self.heroes.is_empty() || self.monsters.is_empty() {
            return Err("place at least one hero and one monster".into());
        }
        let mut units: Vec<String> = Vec::with_capacity(n);
        let mut placements: Vec<Placement> = Vec::with_capacity(n);
        for (side, list) in [("heroes", &self.heroes), ("monsters", &self.monsters)] {
            for u in list {
                let tid = pool.tid(&u.content).ok_or_else(|| format!("unknown content id {:?}", u.content))?;
                let pc = pool.template(tid).pc;
                if pc != (side == "heroes") {
                    return Err(format!("{}: content {:?} is not a {}", u.id, u.content, &side[..side.len() - 1]));
                }
                // A hero's unit id is its content id; a monster's is
                // `<content>-<n>` (`content.monster_content`).
                if pool.unit_tid(&u.id) != Some(tid) {
                    return Err(format!("unit id {:?} does not match content {:?}", u.id, u.content));
                }
                if units.contains(&u.id) {
                    return Err(format!("duplicate unit id {:?}", u.id));
                }
                let (Some(x), Some(y)) = (u.x, u.y) else {
                    return Err(format!("unplaced creature {}", u.id));
                };
                if x < 0 || y < 0 || x as usize >= w || y as usize >= h || grid.is_wall(x, y) {
                    return Err(format!("{} must stand on a free floor square, not ({x}, {y})", u.id));
                }
                if let Some(o) = placements.iter().find(|p| p.x == x && p.y == y) {
                    return Err(format!("({x}, {y}) is taken by {}", o.id));
                }
                units.push(u.id.clone());
                placements.push(Placement { id: u.id.clone(), x, y });
            }
        }
        Ok(Encounter { name: self.map.name.clone(), grid, rows: rows.clone(), units, placements })
    }
}
