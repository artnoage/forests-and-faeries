//! Tape format shared with the natural20 recorder (`validation/n20_record.py`).
//!
//! One JSON object per line, in the order natural20 produced them. See
//! `docs/DESIGN.md` §4 for the meaning of each event.

use serde::{Deserialize, Serialize};
use std::io::{BufRead, Write};
use std::path::Path;

/// Value of one primitive draw: `random.randint(1, sides)` or, for
/// advantage/disadvantage, `random.sample(range(1, sides + 1), 2)`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum DrawVal {
    One(i32),
    Two([i32; 2]),
}

impl DrawVal {
    pub fn one(self) -> i32 {
        match self {
            DrawVal::One(v) => v,
            DrawVal::Two(_) => panic!("expected a single die, got a pair"),
        }
    }
    pub fn pair(self) -> [i32; 2] {
        match self {
            DrawVal::Two(v) => v,
            DrawVal::One(_) => panic!("expected a pair of dice, got one"),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Placement {
    pub id: String,
    pub x: i32,
    pub y: i32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Header {
    #[serde(default)]
    pub version: i32,
    #[serde(default)]
    pub n20_commit: String,
    pub units: Vec<String>,
    pub placements: Vec<Placement>,
    pub seed: i64,
    pub max_rounds: i32,
    /// Scripted preferences (`kind:attack`, `kind:move_oa`); empty = native AI.
    #[serde(default)]
    pub prefer: Vec<String>,
    #[serde(default)]
    pub meta: serde_json::Value,
    #[serde(default)]
    pub stats: serde_json::Value,
    /// The map rows (`H` / `.`) of a fight off the Ember Vault; absent for
    /// the vault itself (every tape before G2).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub map: Option<Vec<String>>,
    /// Off-policy tapes (`n20_record.py --chooser`, G4a): each team's chooser
    /// name and the chooser seed. Absent on native tapes.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub chooser: Option<ChooserHdr>,
}

/// The header's `chooser` field: `{"heroes": NAME, "monsters": NAME, "seed": S}`,
/// plus `"units": {uid: NAME}` for creatures with their own chooser (G6).
/// A team whose chooser is not `native` is external; so is a listed creature
/// whose chooser is not `native`, whatever its team.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct ChooserHdr {
    #[serde(default = "native_name")]
    pub heroes: String,
    #[serde(default = "native_name")]
    pub monsters: String,
    #[serde(default, skip_serializing_if = "std::collections::BTreeMap::is_empty")]
    pub units: std::collections::BTreeMap<String, String>,
    /// The chooser seed (dice seed x 1000003 + salt: may exceed 64 bits).
    #[serde(default)]
    pub seed: serde_json::Value,
}

fn native_name() -> String {
    "native".into()
}

impl ChooserHdr {
    /// Which teams (0 heroes, 1 monsters) are external.
    pub fn external(&self) -> [bool; 2] {
        [self.heroes != "native", self.monsters != "native"]
    }

    /// The creatures external by their own chooser (unit ids).
    pub fn external_units(&self) -> Vec<&str> {
        self.units.iter().filter(|(_, n)| n.as_str() != "native").map(|(u, _)| u.as_str()).collect()
    }
}

/// The `ext` block of an external creature's `dec` event (G4a): the decision
/// as `GeneralArena._decide` returns it and the row executed.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct DecExt {
    /// Row descriptors: the canonical deduplicated candidates, then `end_turn`.
    pub legal: Vec<String>,
    /// Native score per row (`null` inside the list = End Turn's -inf);
    /// `null` when nothing was scored (flee step, Stand first, scores off).
    pub raw: Option<Vec<Option<f64>>>,
    /// Removed by the controller before choosing; `null` exactly when `raw` is.
    pub dropped: Option<Vec<bool>>,
    /// The native choice (`null` only with scores off on a scored decision).
    pub native: Option<usize>,
    /// The row executed.
    pub exec: usize,
    /// `flee` or `end_turn` on a forced decision.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub forced: Option<String>,
    /// `stand` on a Stand-first decision (offered, unscored).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unscored: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct UnitDigest {
    pub id: String,
    pub pos: Option<[i32; 2]>,
    pub hp: i32,
    pub mhp: i32,
    pub thp: i32,
    pub st: Vec<String>,
    pub fx: Vec<String>,
    pub bst: Vec<String>,
    pub res: [i32; 4],
    pub ds: [i32; 2],
    #[serde(rename = "str")]
    pub strength: i32,
    /// Spell slots (levels 1, 2).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sl: Option<[i32; 2]>,
    /// Concentration (spell name).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub conc: Option<String>,
    /// Channel Divinity uses.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cd: Option<i32>,
    /// Resource pools (`entity.resources`) that exist.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pools: Option<std::collections::BTreeMap<String, i32>>,
    /// Sorcery Points, Innate Sorcery uses and its end (game time).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sp: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub isc: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub isu: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sw: Option<i32>,
    #[serde(default, rename = "as", skip_serializing_if = "Option::is_none")]
    pub action_surge: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub asu: Option<bool>,
    /// Barbarian: [Rage uses left, raging, rage entered or extended this
    /// turn, Reckless Attack declared, the turn's first attack roll made, the
    /// turn's Frenzy hit made] (0/1 flags).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rg: Option<[i32; 6]>,
    /// Cleave: `"used"` once the turn's Cleave is spent (else `"-"`), then the
    /// open window's candidates (unit ids). Only while either is set.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cv: Option<Vec<String>>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct StateDigest {
    pub round: i32,
    pub cur: Option<String>,
    pub units: Vec<UnitDigest>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "t")]
pub enum Ev {
    #[serde(rename = "hdr")]
    Hdr(Header),
    #[serde(rename = "start")]
    Start {},
    #[serde(rename = "draw")]
    Draw {
        who: String,
        tag: String,
        sides: i32,
        mode: String,
        v: DrawVal,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        expr: Option<String>,
    },
    #[serde(rename = "turn")]
    Turn { who: String, round: i32 },
    #[serde(rename = "dec")]
    Dec {
        ctx: String,
        who: String,
        cands: Vec<String>,
        scores: Vec<Option<f64>>,
        order: Vec<i64>,
        adj: Vec<f64>,
        chosen: String,
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        multi_sort: bool,
        /// Present on the decisions of an external creature (off-policy tapes).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        ext: Option<DecExt>,
    },
    #[serde(rename = "act")]
    Act { who: String, a: String },
    #[serde(rename = "state")]
    State(StateDigest),
    #[serde(rename = "endturn")]
    EndTurn { who: String },
    #[serde(rename = "end")]
    End {
        winner: Option<String>,
        finished: bool,
        round: i32,
        #[serde(default)]
        turns: i64,
        #[serde(default)]
        decisions: i64,
        #[serde(default)]
        wall_s: f64,
        #[serde(default)]
        tally: serde_json::Value,
        /// Off-policy tapes: counts of the external decisions (`decisions`,
        /// `differ`, `forced_flee`, `forced_end_turn`, `stand`; non-zero keys only).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        ext: Option<std::collections::BTreeMap<String, i64>>,
    },
}

impl Ev {
    pub fn kind(&self) -> &'static str {
        match self {
            Ev::Hdr(_) => "hdr",
            Ev::Start {} => "start",
            Ev::Draw { .. } => "draw",
            Ev::Turn { .. } => "turn",
            Ev::Dec { .. } => "dec",
            Ev::Act { .. } => "act",
            Ev::State(_) => "state",
            Ev::EndTurn { .. } => "endturn",
            Ev::End { .. } => "end",
        }
    }

    /// One-line summary for divergence reports.
    pub fn brief(&self) -> String {
        match self {
            Ev::Draw { who, tag, sides, mode, v, .. } => {
                let v = match v {
                    DrawVal::One(a) => format!("{a}"),
                    DrawVal::Two([a, b]) => format!("[{a},{b}]"),
                };
                format!("draw {who} {tag} d{sides}{mode} = {v}")
            }
            Ev::Turn { who, round } => format!("turn {who} round {round}"),
            Ev::Dec { ctx, who, cands, chosen, ext, .. } => match ext {
                None => format!("dec[{ctx}] {who}: {} candidates -> {chosen}", cands.len()),
                Some(x) => format!(
                    "dec[{ctx}] {who}: {} candidates -> {chosen}; ext {} rows, exec {}",
                    cands.len(),
                    x.legal.len(),
                    x.legal.get(x.exec).map(String::as_str).unwrap_or("?")
                ),
            },
            Ev::Act { who, a } => format!("act {who} {a}"),
            Ev::State(s) => format!("state round {} cur {:?}", s.round, s.cur),
            Ev::EndTurn { who } => format!("endturn {who}"),
            Ev::End { winner, round, .. } => format!("end winner {winner:?} round {round}"),
            Ev::Hdr(_) => "hdr".into(),
            Ev::Start {} => "start".into(),
        }
    }
}

pub struct Tape {
    pub header: Header,
    /// Every event after the header, in order.
    pub events: Vec<Ev>,
}

impl Tape {
    pub fn load(path: &Path) -> anyhow_lite::Result<Tape> {
        let file = std::fs::File::open(path).map_err(|e| anyhow_lite::err(format!("{}: {e}", path.display())))?;
        let reader = std::io::BufReader::new(file);
        let mut header = None;
        let mut events = Vec::new();
        for (n, line) in reader.lines().enumerate() {
            let line = line.map_err(|e| anyhow_lite::err(e.to_string()))?;
            if line.trim().is_empty() {
                continue;
            }
            let ev: Ev = serde_json::from_str(&line)
                .map_err(|e| anyhow_lite::err(format!("{}:{}: {e}", path.display(), n + 1)))?;
            match ev {
                Ev::Hdr(h) => header = Some(h),
                other => events.push(other),
            }
        }
        let header = header.ok_or_else(|| anyhow_lite::err(format!("{}: no header", path.display())))?;
        Ok(Tape { header, events })
    }

    pub fn save(&self, path: &Path) -> std::io::Result<()> {
        let mut out = std::io::BufWriter::new(std::fs::File::create(path)?);
        writeln!(out, "{}", serde_json::to_string(&Ev::Hdr(self.header.clone())).unwrap())?;
        for ev in &self.events {
            writeln!(out, "{}", serde_json::to_string(ev).unwrap())?;
        }
        Ok(())
    }
}

/// Minimal error type (no external error crate).
pub mod anyhow_lite {
    #[derive(Debug)]
    pub struct Error(pub String);
    impl std::fmt::Display for Error {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            f.write_str(&self.0)
        }
    }
    impl std::error::Error for Error {}
    pub type Result<T> = std::result::Result<T, Error>;
    pub fn err(msg: impl Into<String>) -> Error {
        Error(msg.into())
    }
}
