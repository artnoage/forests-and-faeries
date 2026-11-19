//! Observation dumps (`ember encode`): play or replay games through the
//! decision API, encode every external decision (and the final state from
//! each team's view) and write the arrays as an `.npz` for the Python
//! contract checks (`validation/check_encode.py`).
//!
//! Sources:
//! - an off-policy tape (a `chooser` header with an external team, natural20's
//!   `n20_record.py --chooser`): replayed with the tape's dice and rows, so
//!   the states are exactly natural20's, off-policy ones included;
//! - a native tape: its setup (map, units, placements) played in free mode;
//! - an `EncounterSpec` JSON: likewise.
//!
//! In free mode the controllers, the row chooser and the dice seed come from
//! [`DumpOpts`].

use std::panic::{catch_unwind, AssertUnwindSafe};
use std::path::Path;

use crate::content::ContentPool;
use crate::encode::{encode, random_offset, Obs, Objective, Version, N, S, T};
use crate::engine::MAX_ROUNDS;
use crate::env::{Chooser, Controller, Env};
use crate::npz::Npz;
use crate::replay::{controllers_for, fight_for, tape_row};
use crate::spec::EncounterSpec;
use crate::tape::Tape;
use crate::trace::Trace;

/// Where the map goes on the canvas.
#[derive(Clone, Copy, Debug)]
pub enum Offset {
    Fixed(i32, i32),
    /// [`random_offset`] from the dump seed and the source's name (one
    /// offset per game).
    Random,
}

#[derive(Clone, Debug)]
pub struct DumpOpts {
    /// Teams whose decisions are encoded (`[heroes, monsters]`).
    pub teams: [bool; 2],
    /// Encode at most this many decisions per source.
    pub steps: Option<usize>,
    /// Also encode the final state from each selected team's view.
    pub finals: bool,
    pub offset: Offset,
    pub objective: Objective,
    // free mode (native tapes and specs)
    pub ctrl: [Controller; 2],
    pub chooser: String,
    pub seed: u64,
    pub scores: bool,
    /// The observation schema (`ember-gen-v2` by default).
    pub version: Version,
}

impl Default for DumpOpts {
    fn default() -> DumpOpts {
        DumpOpts {
            teams: [true, true],
            steps: None,
            finals: true,
            offset: Offset::Fixed(0, 0),
            objective: Objective::default(),
            ctrl: [Controller::External, Controller::External],
            chooser: "native".into(),
            seed: 0,
            scores: true,
            version: Version::default(),
        }
    }
}

/// Encoded observations with their per-row metadata.
#[derive(Default)]
pub struct Dump {
    pub rows: Vec<Obs>,
    pub live: Vec<bool>,
    pub scores: Vec<bool>,
    pub team: Vec<i8>,
    pub source: Vec<i32>,
    pub round: Vec<i32>,
    /// The external decision's index in its game (-1 for a final view).
    pub step: Vec<i32>,
    pub sources: Vec<SourceInfo>,
}

#[derive(Clone, Debug, Default, serde::Serialize)]
pub struct SourceInfo {
    pub path: String,
    pub map: String,
    pub units: Vec<String>,
    pub offset: (i32, i32),
    pub replayed: bool,
    pub decisions: [u64; 2],
    pub finals: u32,
    pub winner: Option<u8>,
    pub finished: bool,
    pub round: i32,
}

/// The fixed map (`content/maps/<stem>.yml`) with these walls, else `custom`.
pub fn map_name(g: &crate::map::Grid) -> String {
    for stem in ["vault", "room_12x10", "two_rooms_24x18", "hall_32x32"] {
        if let Some(Ok(m)) = crate::map::builtin_map(stem) {
            if m.grid.rows == g.rows {
                return stem.to_string();
            }
        }
    }
    "custom".to_string()
}

fn hash_str(s: &str) -> u64 {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for b in s.bytes() {
        h ^= b as u64;
        h = h.wrapping_mul(0x0000_0100_0000_01b3);
    }
    h
}

impl Dump {
    pub fn len(&self) -> usize {
        self.rows.len()
    }

    pub fn is_empty(&self) -> bool {
        self.rows.is_empty()
    }

    #[allow(clippy::too_many_arguments)]
    fn push(&mut self, env: &Env, team: Option<u8>, offset: (i32, i32), obj: &Objective, version: Version, source: i32,
            step: i32) -> Result<u8, String> {
        let k = env.decision().map_or(0, |d| d.legal.len());
        let mut o = Obs::with_version(k, version);
        let e = encode(env, team, offset, obj, &mut o.slot())?;
        self.rows.push(o);
        self.live.push(env.decision().is_some());
        self.scores.push(env.scores());
        self.team.push(e.team as i8);
        self.source.push(source);
        self.round.push(env.fight.round + 1);
        self.step.push(step);
        Ok(e.team)
    }

    /// Run one source (tape or spec) and append its observations.
    pub fn add_source(&mut self, path: &Path, opts: &DumpOpts) -> Result<(), String> {
        let name = path.display().to_string();
        let pool = ContentPool::global();
        let src = self.sources.len() as i32;
        let mut info = SourceInfo { path: name.clone(), ..Default::default() };
        let is_spec = path.extension().is_some_and(|e| e == "json");
        let (mut env, replayed) = if is_spec {
            let spec = EncounterSpec::load(path)?;
            let enc = spec.validate(pool)?;
            info.map = enc.name.clone().unwrap_or_default();
            (Env::unstarted(crate::engine::Fight::on_map(pool, enc.grid, &enc.units, &enc.placements, MAX_ROUNDS,
                                                          Trace::free(opts.seed))?, opts.ctrl, opts.scores), false)
        } else {
            let tape = Tape::load(path).map_err(|e| format!("{name}: {e}"))?;
            let h = &tape.header;
            let ctrl = controllers_for(h);
            if !ctrl.all_native() {
                let fight = fight_for(h, pool, Trace::replay(tape.events.clone()))?;
                (Env::unstarted(fight, ctrl, true), true)
            } else {
                let fight = fight_for(h, pool, Trace::free(opts.seed))?;
                (Env::unstarted(fight, opts.ctrl, opts.scores), false)
            }
        };
        info.replayed = replayed;
        if info.map.is_empty() {
            info.map = map_name(&env.fight.grid);
        }
        info.units = env.fight.units.iter().map(|u| u.id.clone()).collect();
        let g = env.fight.grid.clone();
        let offset = match opts.offset {
            Offset::Fixed(x, y) => (x, y),
            Offset::Random => random_offset(g.w, g.h, opts.seed ^ hash_str(&name)),
        };
        info.offset = offset;
        let mut chooser = Chooser::parse(&opts.chooser, opts.seed ^ 0x5EED_0F_C40053)?;
        let start = self.rows.len();
        let result = catch_unwind(AssertUnwindSafe(|| -> Result<(), String> {
            env.begin();
            let mut step = 0i32;
            while let Some(d) = env.decision() {
                let team = d.team;
                let room = opts.steps.is_none_or(|n| (self.rows.len() - start) < n);
                if opts.teams[team as usize] && room {
                    self.push(&env, None, offset, &opts.objective, opts.version, src, step)?;
                    info.decisions[team as usize] += 1;
                }
                let row = if replayed { tape_row(&env) } else { chooser.pick(d) };
                env.step(row)?;
                step += 1;
            }
            if replayed {
                env.finish_trace();
            }
            Ok(())
        }));
        match result {
            Ok(r) => r?,
            Err(p) => {
                let msg = p
                    .downcast_ref::<crate::trace::Divergence>()
                    .map(|d| d.to_string())
                    .or_else(|| p.downcast_ref::<String>().cloned())
                    .or_else(|| p.downcast_ref::<&str>().map(|s| s.to_string()))
                    .unwrap_or_else(|| "panic".into());
                return Err(format!("{name}: {msg}"));
            }
        }
        if replayed && env.fight.trace.remaining() != 0 {
            return Err(format!("{name}: replay ended with {} tape events left", env.fight.trace.remaining()));
        }
        if opts.finals {
            for team in 0..2u8 {
                if opts.teams[team as usize] {
                    self.push(&env, Some(team), offset, &opts.objective, opts.version, src, -1)?;
                    info.finals += 1;
                }
            }
        }
        let o = env.outcome();
        info.winner = o.winner;
        info.finished = o.finished;
        info.round = o.round;
        self.sources.push(info);
        Ok(())
    }

    /// The arrays (batch axis first; K = the widest legal row count, at least
    /// 1), in the rows' version (the first row's; a dump holds one version).
    pub fn to_npz(&self) -> Npz {
        let b = self.rows.len();
        let k = self.rows.iter().map(|o| o.k).max().unwrap_or(0).max(1);
        let version = self.rows.first().map_or(Version::default(), |o| o.version);
        assert!(self.rows.iter().all(|o| o.version == version), "a dump holds one feature version");
        let names = version.names();
        let (f_c, f_g, f_a) = (version.creature(), version.global(), version.cand());
        let mut z = Npz::new();
        macro_rules! cat {
            ($field:ident, $width:expr, $fill:expr, $t:ty) => {{
                let mut v: Vec<$t> = Vec::with_capacity(b * k * $width);
                for o in &self.rows {
                    v.extend_from_slice(&o.$field);
                    v.extend(std::iter::repeat($fill).take((k - o.k) * $width));
                }
                v
            }};
        }
        let fixed = |f: &dyn Fn(&Obs) -> &[u8]| -> Vec<u8> { self.rows.iter().flat_map(|o| f(o).iter().copied()).collect() };
        let creatures: Vec<f32> = self.rows.iter().flat_map(|o| o.creatures.iter().copied()).collect();
        z.add("creatures", &[b, N, f_c], &creatures);
        let cids: Vec<i16> = self.rows.iter().flat_map(|o| o.creature_ids.iter().copied()).collect();
        z.add("creature_ids", &[b, N, 3], &cids);
        let cmask: Vec<bool> = self.rows.iter().flat_map(|o| o.creature_mask.iter().copied()).collect();
        z.add("creature_mask", &[b, N], &cmask);
        z.add("map", &[b, version.map_channels(), S, S], &fixed(&|o: &Obs| &o.map));
        let glob: Vec<f32> = self.rows.iter().flat_map(|o| o.global.iter().copied()).collect();
        z.add("global", &[b, f_g], &glob);
        z.add("cands", &[b, k, f_a], &cat!(cands, f_a, 0.0f32, f32));
        z.add("cand_ids", &[b, k, 3], &cat!(cand_ids, 3, -1i16, i16));
        z.add("cand_tgt", &[b, k, T], &cat!(cand_tgt, T, -1i16, i16));
        z.add("cand_tgt_n", &[b, k, T], &cat!(cand_tgt_n, T, 0u8, u8));
        z.add("cand_cell", &[b, k], &cat!(cand_cell, 1, -1i16, i16));
        z.add("cand_mask", &[b, k], &cat!(cand_mask, 1, false, bool));
        let actor: Vec<i16> = self.rows.iter().map(|o| o.actor).collect();
        z.add("actor", &[b], &actor);
        z.add("native_raw", &[b, k], &cat!(native_raw, 1, 0.0f32, f32));
        z.add("native_dropped", &[b, k], &cat!(native_dropped, 1, false, bool));
        let choice: Vec<i16> = self.rows.iter().map(|o| o.native_choice).collect();
        z.add("native_choice", &[b], &choice);
        if version.relations() > 0 {
            z.add("creature_rel", &[b, N, N, version.relations()], &fixed(&|o: &Obs| &o.creature_rel));
        }
        z.add("live", &[b], &self.live);
        z.add("scores", &[b], &self.scores);
        z.add("team", &[b], &self.team);
        z.add("source", &[b], &self.source);
        z.add("round", &[b], &self.round);
        z.add("step", &[b], &self.step);
        let mut feature_names = serde_json::json!({
            "creature": names.creature, "global": names.global, "cand": names.cand, "map": names.map,
        });
        if version.relations() > 0 {
            feature_names["relations"] = serde_json::json!(names.relations);
        }
        let meta = serde_json::json!({
            "feature_version": version.name(),
            "dims": version.dims().iter().map(|(k, v)| (k.to_string(), *v)).collect::<std::collections::BTreeMap<_, _>>(),
            "feature_names": feature_names,
            "sources": self.sources,
        });
        z.add("meta", &[meta.to_string().len()], meta.to_string().as_bytes());
        z
    }
}
