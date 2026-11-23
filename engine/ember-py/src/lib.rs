//! `ember_rs`: Python bindings for ember-rs (GENERAL_ENV.md §8.1, "G6 status").
//!
//! - `ContentPool(paths=None)`: the embedded public pack plus private packs.
//! - `BatchEnv(n_slots, content=None, threads=12, scores=True,
//!   objective='health_score', max_rounds=30, standing_weight=0.5,
//!   max_steps=4096, catalog=None, feature_version='ember-gen-v2',
//!   moves='step')`: the in-process batched environment of
//!   natural20 `ember_rl/general_env.py` (`BatchEnv` protocol): one game per
//!   slot, one rayon task per slot, the GIL released while games run and
//!   observations are encoded. Observation arrays are zero-copy numpy views of
//!   two buffer sets used in turn: valid until the next mutating call
//!   (`reset`, `step`, `restore`, `fork`) or two further observation calls
//!   (`observe` and `observe_value` share these buffers).
//!   `snapshot`/`restore` copy one slot's game; `fork` copies many in one
//!   parallel call, optionally reseeded and with other controllers (search).
//! - `place(row, layout_seed)`: a catalog row placed by the Rust zone-layout
//!   sampler, as a natural20 `EncounterSpec` dict.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, OnceLock};

use numpy::ndarray::{ArrayView, IxDyn};
use numpy::{Element, PyArray1, PyArrayDyn, PyReadonlyArrayDyn};
use pyo3::exceptions::{PyIOError, PyRuntimeError, PyValueError};
use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList, PyString};
use rayon::prelude::*;

use ember::batch::{dest_decision, EnvConfig, EpisodeSpec, Game, Info, MoveMode, RowKind, UnitRef, NATURAL20_COMMIT};
use ember::catalog::Catalog;
use ember::content::{embedded_files, ContentPool as CorePool};
use ember::encode::{encode_decision, encode_value, ObsSlot, Version, CELLS, FEATURE_VERSION, N, S, T};
use ember::env::{Controller, Decision};

fn verr(msg: impl Into<String>) -> PyErr {
    PyValueError::new_err(msg.into())
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

/// A flat list of ints from a numpy integer array (any shape) or a sequence.
fn ints(obj: &Bound<'_, PyAny>, what: &str) -> PyResult<Vec<i64>> {
    macro_rules! try_dtype {
        ($t:ty) => {
            if let Ok(a) = obj.extract::<PyReadonlyArrayDyn<'_, $t>>() {
                return Ok(a.as_array().iter().map(|&v| v as i64).collect());
            }
        };
    }
    try_dtype!(i32);
    try_dtype!(i64);
    try_dtype!(i16);
    try_dtype!(i8);
    try_dtype!(u8);
    try_dtype!(u16);
    try_dtype!(u32);
    try_dtype!(u64);
    if let Ok(v) = obj.extract::<i64>() {
        return Ok(vec![v]);
    }
    obj.extract::<Vec<i64>>().map_err(|_| verr(format!("{what} must be integers (a 1-D array or a sequence)")))
}

fn seed(v: i64, what: &str) -> PyResult<u64> {
    u64::try_from(v).map_err(|_| verr(format!("{what} must be >= 0, not {v}")))
}

/// Field `k` (dict) or item `i` (sequence of 4 or 6) of an episode spec.
fn field<'py>(obj: &Bound<'py, PyAny>, k: &str, i: usize) -> PyResult<Option<Bound<'py, PyAny>>> {
    if let Ok(d) = obj.downcast::<PyDict>() {
        return d.get_item(k);
    }
    let n = obj.len().map_err(|_| verr("an episode spec is an EpisodeSpec, a tuple or a dict"))?;
    if n != 4 && n != 6 {
        return Err(verr(format!("an episode spec has 4 or 6 fields, not {n}")));
    }
    if i < n {
        obj.get_item(i).map(Some)
    } else {
        Ok(None)
    }
}

fn field_int(obj: &Bound<'_, PyAny>, k: &str, i: usize, default: i64) -> PyResult<i64> {
    match field(obj, k, i)? {
        None => Ok(default),
        Some(v) => v.extract::<i64>().map_err(|_| verr(format!("episode spec {k} must be an int"))),
    }
}

/// `EpisodeSpec` (a NamedTuple), a 4- or 6-tuple/list, or a dict.
fn episode(obj: &Bound<'_, PyAny>) -> PyResult<EpisodeSpec> {
    let encounter: String = field(obj, "encounter", 0)?
        .ok_or_else(|| verr("episode spec without encounter"))?
        .extract()
        .map_err(|_| verr("episode spec encounter must be a string"))?;
    let off = |k: &str, i: usize| -> PyResult<i32> {
        let v = field_int(obj, k, i, -1)?;
        i32::try_from(v).map_err(|_| verr(format!("{k} out of range")))
    };
    Ok(EpisodeSpec {
        encounter,
        map_seed: seed(field_int(obj, "map_seed", 1, 0)?, "map_seed")?,
        layout_seed: seed(field_int(obj, "layout_seed", 2, 0)?, "layout_seed")?,
        dice_seed: seed(field_int(obj, "dice_seed", 3, 0)?, "dice_seed")?,
        offset_x: off("offset_x", 4)?,
        offset_y: off("offset_y", 5)?,
    })
}

/// `{'heroes': 'external'|'native', 'monsters': ..., 'external_units': [index or uid, ...]}`.
fn controllers(obj: &Bound<'_, PyAny>) -> PyResult<([Controller; 2], Vec<UnitRef>)> {
    let d = obj.downcast::<PyDict>().map_err(|_| verr("controllers must be one dict per slot"))?;
    let mut teams = [None, None];
    let mut units = Vec::new();
    for (k, v) in d.iter() {
        let key: String = k.extract().map_err(|_| verr("controller keys are strings"))?;
        match key.as_str() {
            "heroes" | "monsters" => {
                let name: String = v.extract().map_err(|_| verr(format!("controller {key} must be a string")))?;
                let c = Controller::parse(&name).map_err(verr)?;
                teams[(key == "monsters") as usize] = Some(c);
            }
            "external_units" => {
                for u in v.try_iter().map_err(|_| verr("external_units must be a list"))? {
                    let u = u?;
                    if let Ok(i) = u.extract::<i64>() {
                        let i = usize::try_from(i).map_err(|_| verr(format!("external unit index {i} < 0")))?;
                        units.push(UnitRef::Index(i));
                    } else if let Ok(s) = u.extract::<String>() {
                        units.push(UnitRef::Id(s));
                    } else {
                        return Err(verr("external_units holds token indices (int) or unit ids (str)"));
                    }
                }
            }
            other => return Err(verr(format!("unknown controller key {other:?} (heroes, monsters, external_units)"))),
        }
    }
    match teams {
        [Some(h), Some(m)] => Ok(([h, m], units)),
        _ => Err(verr(format!("controllers need 'heroes' and 'monsters': {d}"))),
    }
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

/// Is `p` the public pack (`content/srd`), which is compiled in?
fn public_pack(p: &Path) -> bool {
    let s = p.to_string_lossy().replace('\\', "/");
    let s = s.trim_end_matches('/');
    s == "srd" || s.ends_with("content/srd")
}

fn load_pool(paths: &[String]) -> Result<&'static CorePool, String> {
    static POOLS: OnceLock<Mutex<HashMap<Vec<String>, &'static CorePool>>> = OnceLock::new();
    let cache = POOLS.get_or_init(Default::default);
    if let Some(p) = cache.lock().unwrap().get(paths) {
        return Ok(p);
    }
    let mut extra: Vec<PathBuf> = Vec::new();
    for raw in paths {
        let p = PathBuf::from(raw);
        if public_pack(&p) {
            // the embedded copy is used; a checkout on disk must be the same
            if p.is_dir() {
                for entry in std::fs::read_dir(&p).map_err(|e| format!("{raw}: {e}"))? {
                    let f = entry.map_err(|e| e.to_string())?.path();
                    if f.extension().is_some_and(|x| x == "json") {
                        let name = format!("srd/{}", f.file_name().unwrap().to_string_lossy());
                        let disk = std::fs::read_to_string(&f).map_err(|e| format!("{}: {e}", f.display()))?;
                        match embedded_files().iter().find(|(q, _)| *q == name) {
                            Some((_, text)) if *text == disk => {}
                            _ => return Err(format!("{} differs from the pack compiled into ember_rs; rebuild it", f.display())),
                        }
                    }
                }
            }
            continue;
        }
        if !p.is_dir() {
            return Err(format!("content pack {raw}: not a directory"));
        }
        extra.push(p);
    }
    let pool = CorePool::load(&extra)?.leak();
    cache.lock().unwrap().insert(paths.to_vec(), pool);
    Ok(pool)
}

/// The creatures the engine can play: the embedded SRD 5.2.1 pack
/// (`content/srd`, always included; a path naming it is checked against the
/// compiled copy) plus private packs by directory.
#[pyclass(module = "ember_rs", frozen)]
struct ContentPool {
    pool: &'static CorePool,
    paths: Vec<String>,
}

#[pymethods]
impl ContentPool {
    #[new]
    #[pyo3(signature = (paths=None))]
    fn new(paths: Option<Vec<String>>) -> PyResult<Self> {
        let paths = paths.unwrap_or_default();
        Ok(ContentPool { pool: load_pool(&paths).map_err(verr)?, paths })
    }

    /// Content ids: heroes then monsters, each sorted.
    #[getter]
    fn ids(&self) -> Vec<String> {
        let mut h: Vec<String> = self.pool.templates.iter().filter(|t| t.pc).map(|t| t.id.to_string()).collect();
        let mut m: Vec<String> = self.pool.templates.iter().filter(|t| !t.pc).map(|t| t.id.to_string()).collect();
        h.sort();
        m.sort();
        h.extend(m);
        h
    }

    #[getter]
    fn heroes(&self) -> Vec<String> {
        self.ids().into_iter().filter(|i| self.pool.template(self.pool.tid(i).unwrap()).pc).collect()
    }

    /// Canonical sheet, shared hero identity, character level and display name.
    fn hero_sheet(&self, content: &str) -> PyResult<(&str, &str, i32, &str)> {
        let t = self.pool.tid(content).map(|id| self.pool.template(id))
            .filter(|t| t.pc).ok_or_else(|| verr(format!("unknown hero {content}")))?;
        Ok((t.id, t.base_id, t.level, t.name))
    }

    #[getter]
    fn monsters(&self) -> Vec<String> {
        self.ids().into_iter().filter(|i| !self.pool.template(self.pool.tid(i).unwrap()).pc).collect()
    }

    #[getter]
    fn paths(&self) -> Vec<String> {
        self.paths.clone()
    }

    fn __repr__(&self) -> String {
        format!("ContentPool({} creatures, paths={:?})", self.pool.templates.len(), self.paths)
    }
}

// ---------------------------------------------------------------------------
// Observation buffers
// ---------------------------------------------------------------------------

/// One set of observation buffers (layout `[B, ...]` with the call's K).
#[derive(Default)]
struct Bufs {
    creatures: Vec<f32>,
    creature_ids: Vec<i16>,
    creature_mask: Vec<bool>,
    map: Vec<u8>,
    global: Vec<f32>,
    cands: Vec<f32>,
    cand_ids: Vec<i16>,
    cand_tgt: Vec<i16>,
    cand_tgt_n: Vec<u8>,
    cand_cell: Vec<i16>,
    cand_mask: Vec<bool>,
    actor: Vec<i16>,
    native_raw: Vec<f32>,
    native_dropped: Vec<bool>,
    native_choice: Vec<i16>,
    creature_rel: Vec<u8>,
}

fn fit<X: Clone + Default>(v: &mut Vec<X>, n: usize) {
    let n = n.max(1);
    if v.len() < n {
        *v = vec![X::default(); n.next_power_of_two()];
    }
}

#[derive(Clone, Copy)]
struct Ptrs {
    creatures: *mut f32,
    creature_ids: *mut i16,
    creature_mask: *mut bool,
    map: *mut u8,
    global: *mut f32,
    cands: *mut f32,
    cand_ids: *mut i16,
    cand_tgt: *mut i16,
    cand_tgt_n: *mut u8,
    cand_cell: *mut i16,
    cand_mask: *mut bool,
    actor: *mut i16,
    native_raw: *mut f32,
    native_dropped: *mut bool,
    native_choice: *mut i16,
    creature_rel: *mut u8,
    version: Version,
}

// Each rayon task writes only its own row of every buffer.
unsafe impl Send for Ptrs {}
unsafe impl Sync for Ptrs {}

impl Bufs {
    fn prepare(&mut self, b: usize, k: usize, version: Version) -> Ptrs {
        let (f_c, f_g, f_a, r) = (version.creature(), version.global(), version.cand(), version.relations());
        let mc = version.map_channels();
        fit(&mut self.creatures, b * N * f_c);
        fit(&mut self.creature_ids, b * N * 3);
        fit(&mut self.creature_mask, b * N);
        fit(&mut self.map, b * mc * CELLS);
        fit(&mut self.global, b * f_g);
        fit(&mut self.cands, b * k * f_a);
        fit(&mut self.cand_ids, b * k * 3);
        fit(&mut self.cand_tgt, b * k * T);
        fit(&mut self.cand_tgt_n, b * k * T);
        fit(&mut self.cand_cell, b * k);
        fit(&mut self.cand_mask, b * k);
        fit(&mut self.actor, b);
        fit(&mut self.native_raw, b * k);
        fit(&mut self.native_dropped, b * k);
        fit(&mut self.native_choice, b);
        fit(&mut self.creature_rel, b * N * N * r);
        Ptrs {
            creatures: self.creatures.as_mut_ptr(),
            creature_ids: self.creature_ids.as_mut_ptr(),
            creature_mask: self.creature_mask.as_mut_ptr(),
            map: self.map.as_mut_ptr(),
            global: self.global.as_mut_ptr(),
            cands: self.cands.as_mut_ptr(),
            cand_ids: self.cand_ids.as_mut_ptr(),
            cand_tgt: self.cand_tgt.as_mut_ptr(),
            cand_tgt_n: self.cand_tgt_n.as_mut_ptr(),
            cand_cell: self.cand_cell.as_mut_ptr(),
            cand_mask: self.cand_mask.as_mut_ptr(),
            actor: self.actor.as_mut_ptr(),
            native_raw: self.native_raw.as_mut_ptr(),
            native_dropped: self.native_dropped.as_mut_ptr(),
            native_choice: self.native_choice.as_mut_ptr(),
            creature_rel: self.creature_rel.as_mut_ptr(),
            version,
        }
    }
}

impl Ptrs {
    /// Row `i` of every buffer as an encoder slot.
    ///
    /// # Safety
    /// The buffers hold at least `i + 1` rows at this `k`, and no other live
    /// slot aliases row `i`.
    unsafe fn slot<'a>(&self, i: usize, k: usize) -> ObsSlot<'a> {
        use std::slice::from_raw_parts_mut as s;
        let v = self.version;
        let (f_c, f_g, f_a, r) = (v.creature(), v.global(), v.cand(), v.relations());
        let mc = v.map_channels();
        ObsSlot {
            version: v,
            creatures: s(self.creatures.add(i * N * f_c), N * f_c),
            creature_ids: s(self.creature_ids.add(i * N * 3), N * 3),
            creature_mask: s(self.creature_mask.add(i * N), N),
            map: s(self.map.add(i * mc * CELLS), mc * CELLS),
            global: s(self.global.add(i * f_g), f_g),
            cands: s(self.cands.add(i * k * f_a), k * f_a),
            cand_ids: s(self.cand_ids.add(i * k * 3), k * 3),
            cand_tgt: s(self.cand_tgt.add(i * k * T), k * T),
            cand_tgt_n: s(self.cand_tgt_n.add(i * k * T), k * T),
            cand_cell: s(self.cand_cell.add(i * k), k),
            cand_mask: s(self.cand_mask.add(i * k), k),
            actor: &mut *self.actor.add(i),
            native_raw: s(self.native_raw.add(i * k), k),
            native_dropped: s(self.native_dropped.add(i * k), k),
            native_choice: &mut *self.native_choice.add(i),
            creature_rel: s(self.creature_rel.add(i * N * N * r), N * N * r),
        }
    }
}

/// A numpy view of `len(shape)` elements at `ptr`, kept alive by `owner`.
unsafe fn view<'py, X: Element>(py: Python<'py>, ptr: *const X, shape: &[usize], owner: &Bound<'py, PyAny>) -> Bound<'py, PyAny> {
    let _ = py;
    let a = ArrayView::from_shape_ptr(IxDyn(shape), ptr);
    PyArrayDyn::<X>::borrow_from_array(&a, owner.clone()).into_any()
}

// ---------------------------------------------------------------------------
// BatchEnv
// ---------------------------------------------------------------------------

/// An opaque copy of one slot's game (`BatchEnv.snapshot`).
#[pyclass(module = "ember_rs", frozen)]
struct Snapshot {
    game: Game,
}

#[pymethods]
impl Snapshot {
    #[getter]
    fn encounter(&self) -> String {
        self.game.entry.id.clone()
    }

    #[getter]
    fn steps(&self) -> u64 {
        self.game.steps
    }

    #[getter]
    fn done(&self) -> bool {
        self.game.done()
    }

    fn __repr__(&self) -> String {
        format!("Snapshot({}, {} steps, done={})", self.game.entry.id, self.game.steps, self.game.done())
    }
}

/// A menu belongs to one pending decision. Snapshots contain the game alone.
/// Search forks share a resolved menu until their first step.
struct Slot {
    game: Game,
    destinations: OnceLock<Option<Arc<(Decision, Vec<RowKind>)>>>,
}

impl Slot {
    fn new(game: Game) -> Self {
        Self { game, destinations: OnceLock::new() }
    }

    fn destinations(&self) -> Option<&(Decision, Vec<RowKind>)> {
        self.destinations.get_or_init(|| dest_decision(&self.game.env).map(Arc::new)).as_deref()
    }

    fn decision(&self) -> Option<&Decision> {
        match self.game.moves {
            MoveMode::Step => self.game.env.decision(),
            MoveMode::Dest => self.destinations().map(|(d, _)| d),
        }
    }

    fn step(&mut self, row: usize, cfg: &EnvConfig) -> Result<(), String> {
        let kind = match self.game.moves {
            MoveMode::Step => RowKind::Native(row),
            MoveMode::Dest => self.destinations().and_then(|(_, kinds)| kinds.get(row)).ok_or("no such destination row")?.clone(),
        };
        self.destinations.take();
        self.game.step_kind(kind, cfg)
    }
}

#[pyclass(module = "ember_rs")]
struct BatchEnv {
    n_slots: usize,
    cfg: EnvConfig,
    objective: String,
    threads: usize,
    pool: &'static CorePool,
    content: Py<ContentPool>,
    catalog: Arc<Catalog>,
    rt: rayon::ThreadPool,
    games: Vec<Option<Slot>>,
    bufs: [Bufs; 2],
    cur: usize,
    /// The observation schema of `observe` (`feature_version`).
    version: Version,
    /// How the policy moves (`moves`): one-square rows or destination rows.
    moves: MoveMode,
}

impl BatchEnv {
    fn slots(&self, obj: &Bound<'_, PyAny>, distinct: bool) -> PyResult<Vec<usize>> {
        let raw = ints(obj, "slots")?;
        let mut seen = vec![false; self.n_slots];
        let mut out = Vec::with_capacity(raw.len());
        for v in raw {
            let s = usize::try_from(v).ok().filter(|&s| s < self.n_slots).ok_or_else(|| verr(format!("slot {v} out of range [0, {})", self.n_slots)))?;
            if distinct {
                if seen[s] {
                    return Err(verr(format!("slot {s} given twice")));
                }
                seen[s] = true;
            }
            out.push(s);
        }
        Ok(out)
    }

    fn slot(&self, slot: usize) -> PyResult<&Slot> {
        self.games.get(slot).and_then(Option::as_ref).ok_or_else(|| verr(format!("slot {slot} was never reset")))
    }

    fn game(&self, slot: usize) -> PyResult<&Game> {
        Ok(&self.slot(slot)?.game)
    }

    fn info_dict<'py>(&self, py: Python<'py>, slots: &[usize]) -> PyResult<Bound<'py, PyDict>> {
        let infos: Vec<Info> = slots.iter().map(|&s| self.game(s).map(|g| g.info(&self.cfg))).collect::<PyResult<_>>()?;
        let d = PyDict::new(py);
        macro_rules! field {
            ($name:literal, $f:ident) => {
                d.set_item($name, PyArray1::from_vec(py, infos.iter().map(|i| i.$f).collect::<Vec<_>>()))?;
            };
        }
        field!("done", done);
        field!("terminated", terminated);
        field!("truncated", truncated);
        field!("reset_terminal", reset_terminal);
        field!("task_end", task_end);
        field!("winner", winner);
        field!("team", team);
        field!("actor", actor);
        field!("round", round);
        field!("score", score);
        field!("potential", potential);
        field!("forced", forced);
        field!("native_actions", native_actions);
        field!("moved", moved);
        Ok(d)
    }
}

#[pymethods]
impl BatchEnv {
    #[new]
    #[pyo3(signature = (n_slots, content=None, threads=12, scores=true, objective="health_score", max_rounds=30,
                        standing_weight=0.5, max_steps=4096, catalog=None, feature_version=FEATURE_VERSION,
                        moves="step"))]
    #[allow(clippy::too_many_arguments)]
    fn new(
        py: Python<'_>,
        n_slots: usize,
        content: Option<Py<ContentPool>>,
        threads: usize,
        scores: bool,
        objective: &str,
        max_rounds: i32,
        standing_weight: f64,
        max_steps: u64,
        catalog: Option<Bound<'_, PyAny>>,
        feature_version: &str,
        moves: &str,
    ) -> PyResult<Self> {
        if n_slots == 0 {
            return Err(verr("n_slots must be at least 1"));
        }
        let version = Version::parse(feature_version).map_err(verr)?;
        let moves = MoveMode::parse(moves).map_err(verr)?;
        let health = match objective {
            "health_score" => true,
            "native" => false,
            other => return Err(verr(format!("objective must be health_score or native, not {other:?}"))),
        };
        if max_rounds < 1 {
            return Err(verr("max_rounds must be at least 1"));
        }
        if !(0.0..=1.0).contains(&standing_weight) {
            return Err(verr("standing_weight must be in [0, 1]"));
        }
        let content = match content {
            Some(c) => c,
            None => Py::new(py, ContentPool::new(None)?)?,
        };
        let pool = content.get().pool;
        let catalog = match catalog {
            None => Catalog::builtin(pool),
            Some(c) if c.is_none() => Catalog::builtin(pool),
            Some(c) => {
                if let Ok(rows) = c.downcast::<PyList>() {
                    let json = py.import("json")?;
                    let mut values = Vec::with_capacity(rows.len());
                    for row in rows.iter() {
                        let text: String = json.call_method1("dumps", (row,))?.extract()?;
                        values.push(serde_json::from_str(&text).map_err(|e| verr(e.to_string()))?);
                    }
                    Catalog::from_rows(&values, pool)
                } else {
                    let path: PathBuf = c.extract().map_err(|_| verr("catalog must be a path, a list of row dicts or None"))?;
                    Catalog::load(&path, pool)
                }
            }
        }
        .map_err(verr)?;
        let threads = threads.max(1);
        let rt = rayon::ThreadPoolBuilder::new()
            .num_threads(threads)
            .thread_name(|i| format!("ember-env-{i}"))
            .build()
            .map_err(|e| PyRuntimeError::new_err(e.to_string()))?;
        Ok(BatchEnv {
            n_slots,
            cfg: EnvConfig { scores, health, max_rounds, standing_weight, max_steps },
            objective: objective.to_string(),
            threads,
            pool,
            content,
            catalog: Arc::new(catalog),
            rt,
            games: (0..n_slots).map(|_| None).collect(),
            bufs: [Bufs::default(), Bufs::default()],
            cur: 0,
            version,
            moves,
        })
    }

    #[getter]
    fn n_slots(&self) -> usize {
        self.n_slots
    }

    #[getter]
    fn feature_version(&self) -> &'static str {
        self.version.name()
    }

    #[getter]
    fn dims<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyDict>> {
        dims(py, self.version)
    }

    /// `step` (one-square move rows) or `dest` (destination rows).
    #[getter]
    fn moves(&self) -> &'static str {
        self.moves.name()
    }

    #[getter]
    fn scores(&self) -> bool {
        self.cfg.scores
    }

    #[getter]
    fn threads(&self) -> usize {
        self.threads
    }

    #[getter]
    fn objective(&self) -> String {
        self.objective.clone()
    }

    #[getter]
    fn max_rounds(&self) -> i32 {
        self.cfg.max_rounds
    }

    #[getter]
    fn standing_weight(&self) -> f64 {
        self.cfg.standing_weight
    }

    #[getter]
    fn max_steps(&self) -> u64 {
        self.cfg.max_steps
    }

    #[getter]
    fn content(&self, py: Python<'_>) -> Py<ContentPool> {
        self.content.clone_ref(py)
    }

    /// The catalog rows (dicts), as `general_env.load_catalog` returns them.
    #[getter]
    fn catalog<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyList>> {
        let json = py.import("json")?;
        let rows: Vec<Bound<'py, PyAny>> =
            self.catalog.entries.iter().map(|e| json.call_method1("loads", (e.raw.as_str(),))).collect::<PyResult<_>>()?;
        PyList::new(py, rows)
    }

    /// Start a game in each slot (native turns and forced steps run to the
    /// first external decision). Everything is checked first: on an error no
    /// slot changes.
    fn reset<'py>(
        &mut self,
        py: Python<'py>,
        slots: &Bound<'py, PyAny>,
        specs: &Bound<'py, PyAny>,
        controllers: &Bound<'py, PyAny>,
    ) -> PyResult<Bound<'py, PyDict>> {
        let slots = self.slots(slots, true)?;
        let specs: Vec<EpisodeSpec> = specs.try_iter()?.map(|s| episode(&s?)).collect::<PyResult<_>>()?;
        let ctrls: Vec<([Controller; 2], Vec<UnitRef>)> = controllers.try_iter()?.map(|c| self::controllers(&c?)).collect::<PyResult<_>>()?;
        if specs.len() != slots.len() || ctrls.len() != slots.len() {
            return Err(verr(format!("{} slots, {} specs, {} controller mappings: one each per slot", slots.len(), specs.len(), ctrls.len())));
        }
        let mut entries = Vec::with_capacity(specs.len());
        for s in &specs {
            entries.push(self.catalog.get(&s.encounter).cloned().ok_or_else(|| verr(format!("unknown encounter {:?}", s.encounter)))?);
        }
        let (cfg, pool, rt) = (self.cfg, self.pool, &self.rt);
        let built: Vec<Result<Game, String>> = py.allow_threads(|| {
            rt.install(|| {
                (0..specs.len())
                    .into_par_iter()
                    .map(|i| Game::new(&entries[i], &specs[i], ctrls[i].0, &ctrls[i].1, &cfg, pool))
                    .collect()
            })
        });
        let mut games = Vec::with_capacity(built.len());
        for (i, g) in built.into_iter().enumerate() {
            games.push(g.map_err(|e| verr(format!("slot {}: {e}", slots[i])))?);
        }
        for (&s, mut g) in slots.iter().zip(games) {
            g.moves = self.moves;
            self.games[s] = Some(Slot::new(g));
        }
        self.info_dict(py, &slots)
    }

    /// Execute `rows[i]` in `slots[i]`, then forced steps and native turns to
    /// the next external decision. Every row is checked first (a done slot,
    /// a row out of range): on an error no slot changes.
    fn step<'py>(&mut self, py: Python<'py>, slots: &Bound<'py, PyAny>, rows: &Bound<'py, PyAny>) -> PyResult<Bound<'py, PyDict>> {
        let slots = self.slots(slots, true)?;
        let rows = ints(rows, "rows")?;
        if rows.len() != slots.len() {
            return Err(verr(format!("{} slots but {} rows", slots.len(), rows.len())));
        }
        for (&s, &r) in slots.iter().zip(&rows) {
            let slot = self.slot(s)?;
            if slot.game.done() {
                return Err(verr(format!("slot {s} is done")));
            }
            let legal = slot.decision().map_or(0, |d| d.legal.len());
            if r < 0 || r as usize >= legal {
                return Err(verr(format!("slot {s}: row {r} is not legal ({legal} rows)")));
            }
        }
        let cfg = self.cfg;
        let mut index = vec![usize::MAX; self.n_slots];
        for (i, &s) in slots.iter().enumerate() {
            index[s] = i;
        }
        let mut work: Vec<(usize, &mut Slot, usize)> = self
            .games
            .iter_mut()
            .enumerate()
            .filter(|(s, _)| index[*s] != usize::MAX)
            .map(|(s, g)| (s, g.as_mut().unwrap(), rows[index[s]] as usize))
            .collect();
        let rt = &self.rt;
        let errors: Vec<String> = py.allow_threads(|| {
            rt.install(|| work.par_iter_mut().filter_map(|(s, g, r)| g.step(*r, &cfg).err().map(|e| format!("slot {s}: {e}"))).collect())
        });
        if let Some(e) = errors.first() {
            return Err(PyRuntimeError::new_err(e.clone()));
        }
        self.info_dict(py, &slots)
    }

    /// The current info without changing anything (`forced` and
    /// `native_actions` are those of the last mutating call).
    fn info<'py>(&self, py: Python<'py>, slots: &Bound<'py, PyAny>) -> PyResult<Bound<'py, PyDict>> {
        let slots = self.slots(slots, false)?;
        self.info_dict(py, &slots)
    }

    /// The observation arrays (numpy views; see the module doc).
    #[pyo3(signature = (slots, team=None))]
    fn observe<'py>(slf: Bound<'py, Self>, slots: &Bound<'py, PyAny>, team: Option<Bound<'py, PyAny>>) -> PyResult<Bound<'py, PyDict>> {
        Self::observations(slf, slots, team, false)
    }

    /// The critic's state fields, with the same team and buffer lifetime as `observe`.
    #[pyo3(signature = (slots, team=None))]
    fn observe_value<'py>(slf: Bound<'py, Self>, slots: &Bound<'py, PyAny>, team: Option<Bound<'py, PyAny>>) -> PyResult<Bound<'py, PyDict>> {
        Self::observations(slf, slots, team, true)
    }

    /// An opaque copy of the slot's whole game.
    fn snapshot(&self, slot: usize) -> PyResult<Snapshot> {
        let s = self.slots_one(slot)?;
        Ok(Snapshot { game: self.game(s)?.clone() })
    }

    /// Put `snapshot` (from any slot) into `slot`; with `dice_seed` its dice
    /// stream restarts from that seed.
    #[pyo3(signature = (slot, snapshot, dice_seed=None))]
    fn restore(&mut self, slot: usize, snapshot: PyRef<'_, Snapshot>, dice_seed: Option<i64>) -> PyResult<()> {
        let s = self.slots_one(slot)?;
        let seed = dice_seed.map(|d| seed(d, "dice_seed")).transpose()?;
        let mut game = snapshot.game.fork(seed);
        game.moves = self.moves;
        self.games[s] = Some(Slot::new(game));
        Ok(())
    }

    /// Copy games into other slots in one parallel call (search, counterfactual
    /// rollouts): slot `targets[i]` becomes a copy of slot `sources[i]` of
    /// `source` (another BatchEnv with the same content and configuration;
    /// default this one), exactly as `restore(targets[i],
    /// snapshot(sources[i]), dice_seeds[i])` would make it. `dice_seeds`
    /// (None, or one int >= 0 per target) restarts each copy's dice stream.
    /// `controllers` (None, or one reset-style mapping or None per target)
    /// changes who plays each creature of that copy from now on, e.g. a
    /// native opponent modeled by a policy; the pending decision's actor must
    /// stay external, and such a copy has no tape (`record` errors).
    /// Sources may repeat; targets are distinct and, within one env, never
    /// sources. Everything is checked first: on an error no slot changes.
    /// Returns the targets' info (`forced` and `native_actions` 0).
    #[pyo3(signature = (sources, targets, dice_seeds=None, controllers=None, source=None))]
    fn fork<'py>(
        slf: &Bound<'py, Self>,
        sources: &Bound<'py, PyAny>,
        targets: &Bound<'py, PyAny>,
        dice_seeds: Option<Bound<'py, PyAny>>,
        controllers: Option<Bound<'py, PyAny>>,
        source: Option<Bound<'py, BatchEnv>>,
    ) -> PyResult<Bound<'py, PyDict>> {
        let py = slf.py();
        let other = match &source {
            Some(s) if !s.is(slf) => Some(s.try_borrow().map_err(|_| verr("source BatchEnv is busy"))?),
            _ => None,
        };
        let mut me = slf.borrow_mut();
        let targets = me.slots(targets, true)?;
        let sources = match &other {
            Some(o) => o.slots(sources, false)?,
            None => me.slots(sources, false)?,
        };
        let n = targets.len();
        if sources.len() != n {
            return Err(verr(format!("{} sources but {n} targets", sources.len())));
        }
        if let Some(o) = &other {
            let (a, b) = (&me.cfg, &o.cfg);
            let same = std::ptr::eq(me.pool, o.pool)
                && (a.scores, a.health, a.max_rounds, a.max_steps) == (b.scores, b.health, b.max_rounds, b.max_steps)
                && a.standing_weight == b.standing_weight;
            if !same {
                return Err(verr("source BatchEnv has another content pool or configuration"));
            }
        } else {
            let mut is_source = vec![false; me.n_slots];
            for &s in &sources {
                is_source[s] = true;
            }
            if let Some(&t) = targets.iter().find(|&&t| is_source[t]) {
                return Err(verr(format!("slot {t} is both a source and a target")));
            }
        }
        let seeds: Vec<Option<u64>> = match &dice_seeds {
            Some(d) if !d.is_none() => {
                let v = ints(d, "dice_seeds")?;
                if v.len() != n {
                    return Err(verr(format!("{} dice seeds for {n} targets", v.len())));
                }
                v.into_iter().map(|x| seed(x, "dice_seeds").map(Some)).collect::<PyResult<_>>()?
            }
            _ => vec![None; n],
        };
        let ctrls: Vec<Option<([Controller; 2], Vec<UnitRef>)>> = match &controllers {
            Some(c) if !c.is_none() => {
                let v: Vec<Option<([Controller; 2], Vec<UnitRef>)>> = c
                    .try_iter()
                    .map_err(|_| verr("controllers must be a list (one mapping or None per target)"))?
                    .map(|x| {
                        let x = x?;
                        if x.is_none() {
                            Ok(None)
                        } else {
                            self::controllers(&x).map(Some)
                        }
                    })
                    .collect::<PyResult<_>>()?;
                if v.len() != n {
                    return Err(verr(format!("{} controller mappings for {n} targets", v.len())));
                }
                v
            }
            _ => vec![None; n],
        };
        let moves = me.moves;
        let built: Vec<Result<Slot, String>> = {
            let games = match &other {
                Some(o) => &o.games,
                None => &me.games,
            };
            for &s in &sources {
                if games[s].is_none() {
                    return Err(verr(format!("slot {s} was never reset")));
                }
            }
            let rt = &me.rt;
            py.allow_threads(|| {
                rt.install(|| {
                    (0..n)
                        .into_par_iter()
                        .map(|i| {
                            let source = games[sources[i]].as_ref().unwrap();
                            let mut g = Slot::new(source.game.fork(seeds[i]));
                            if let Some((teams, units)) = &ctrls[i] {
                                g.game.set_control(*teams, units).map_err(|e| format!("slot {} (copy of {}): {e}", targets[i], sources[i]))?;
                            }
                            if moves == MoveMode::Dest {
                                // Reseeding affects future rolls and set_control affects future decisions.
                                // Both leave this pending decision and its board position intact.
                                g.destinations = source.destinations.clone();
                            }
                            g.game.moves = moves;
                            Ok(g)
                        })
                        .collect()
                })
            })
        };
        let mut games = Vec::with_capacity(n);
        for g in built {
            games.push(g.map_err(verr)?);
        }
        for (&t, g) in targets.iter().zip(games) {
            me.games[t] = Some(g);
        }
        me.info_dict(py, &targets)
    }

    /// Tape descriptors of the pending decision's rows (`end_turn` last when offered);
    /// empty when the slot is done.
    fn describe(&self, slot: usize) -> PyResult<Vec<String>> {
        let s = self.slots_one(slot)?;
        let slot = self.slot(s)?;
        Ok(slot.game.describe_decision(slot.decision()))
    }

    /// Write the slot's game as a tape `ember replay` accepts (GENERAL_ENV.md
    /// §9.3). A running or step-capped game gives a partial tape.
    fn record(&self, py: Python<'_>, slot: usize, path: PathBuf) -> PyResult<()> {
        let s = self.slots_one(slot)?;
        let g = self.game(s)?;
        let pool = self.pool;
        let tape = py.allow_threads(|| g.record(pool)).map_err(PyRuntimeError::new_err)?;
        tape.save(&path).map_err(|e| PyIOError::new_err(format!("{}: {e}", path.display())))
    }

    /// The slot's placed encounter as a natural20 `EncounterSpec` dict.
    fn spec<'py>(&self, py: Python<'py>, slot: usize) -> PyResult<Bound<'py, PyAny>> {
        let s = self.slots_one(slot)?;
        let text = self.game(s)?.spec_json().to_string();
        py.import("json")?.call_method1("loads", (text,))
    }

    /// The slot's creatures in token order: (unit id, content id, team, external).
    fn units(&self, slot: usize) -> PyResult<Vec<(String, String, String, bool)>> {
        let s = self.slots_one(slot)?;
        let g = self.game(s)?;
        let e = &g.entry;
        Ok((0..e.units.len())
            .map(|i| {
                let team = if e.sides[i] == 0 { "heroes" } else { "monsters" };
                (e.units[i].clone(), e.contents[i].clone(), team.to_string(), g.env.is_external(i))
            })
            .collect())
    }

    fn __repr__(&self) -> String {
        format!(
            "BatchEnv(n_slots={}, threads={}, scores={}, objective={:?}, max_rounds={}, standing_weight={}, max_steps={}, \
             feature_version={:?}, moves={:?}, {} encounters)",
            self.n_slots, self.threads, self.cfg.scores, self.objective, self.cfg.max_rounds, self.cfg.standing_weight,
            self.cfg.max_steps, self.version.name(), self.moves.name(), self.catalog.entries.len()
        )
    }
}

impl BatchEnv {
    fn observations<'py>(
        slf: Bound<'py, Self>, slots: &Bound<'py, PyAny>, team: Option<Bound<'py, PyAny>>, value_only: bool,
    ) -> PyResult<Bound<'py, PyDict>> {
        let py = slf.py();
        let (b, k, p) = {
            let mut me = slf.borrow_mut();
            let slots = me.slots(slots, false)?;
            let teams: Vec<i64> = match &team {
                Some(t) if !t.is_none() => ints(t, "team")?,
                _ => vec![-1; slots.len()],
            };
            if teams.len() != slots.len() {
                return Err(verr(format!("{} slots but {} teams", slots.len(), teams.len())));
            }
            let mut views = Vec::with_capacity(slots.len());
            for (&s, &t) in slots.iter().zip(&teams) {
                let g = me.game(s)?;
                let view = match (g.env.decision(), t) {
                    (None, 0 | 1) => Some(t as u8),
                    (None, _) => return Err(verr(format!("slot {s} is done: observe it with team 0 or 1, not {t}"))),
                    (Some(_), -1) => None,
                    (Some(d), t) if t == d.team as i64 => None,
                    (Some(d), t) => return Err(verr(format!("slot {s}: the decision belongs to team {}, not {t}", d.team))),
                };
                views.push(view);
            }
            let me = &mut *me;
            // Build cold menus in parallel; duplicate slot indices share the same decision.
            let k = if value_only { 0 } else {
                py.allow_threads(|| me.rt.install(|| slots.par_iter().filter_map(|&s| {
                    me.games[s].as_ref().unwrap().decision().map(|d| d.legal.len())
                }).max().unwrap_or(0)))
            };
            let b = slots.len();
            me.cur ^= 1;
            let cur = me.cur;
            let obj = me.cfg.objective();
            let p = me.bufs[cur].prepare(b, k, me.version);
            let games = &me.games;
            let errors: Vec<String> = py.allow_threads(|| {
                me.rt.install(|| {
                    (0..b)
                        .into_par_iter()
                        .filter_map(|i| {
                            let g = games[slots[i]].as_ref().unwrap();
                            // SAFETY: row i of buffers sized for b rows at this k; rows are disjoint.
                            let mut out = unsafe { p.slot(i, k) };
                            let encoded = if value_only {
                                encode_value(&g.game.env, views[i], g.game.offset, &obj, &mut out)
                            } else {
                                encode_decision(&g.game.env, g.decision(), views[i], g.game.offset, &obj, &mut out)
                            };
                            encoded.err().map(|e| format!("slot {}: {e}", slots[i]))
                        })
                        .collect()
                })
            });
            if let Some(e) = errors.first() {
                return Err(PyRuntimeError::new_err(e.clone()));
            }
            (b, k, p)
        };
        let owner = slf.as_any();
        let d = PyDict::new(py);
        // SAFETY: the buffers live in `slf` (kept alive by every view) and
        // hold these shapes; they are rewritten only by a later observe.
        let v = p.version;
        unsafe {
            d.set_item("creatures", view(py, p.creatures, &[b, N, v.creature()], owner))?;
            d.set_item("creature_ids", view(py, p.creature_ids, &[b, N, 3], owner))?;
            d.set_item("creature_mask", view(py, p.creature_mask, &[b, N], owner))?;
            d.set_item("map", view(py, p.map, &[b, v.map_channels(), S, S], owner))?;
            d.set_item("global", view(py, p.global, &[b, v.global()], owner))?;
            if !value_only {
                d.set_item("cands", view(py, p.cands, &[b, k, v.cand()], owner))?;
                d.set_item("cand_ids", view(py, p.cand_ids, &[b, k, 3], owner))?;
                d.set_item("cand_tgt", view(py, p.cand_tgt, &[b, k, T], owner))?;
                d.set_item("cand_tgt_n", view(py, p.cand_tgt_n, &[b, k, T], owner))?;
                d.set_item("cand_cell", view(py, p.cand_cell, &[b, k], owner))?;
                d.set_item("cand_mask", view(py, p.cand_mask, &[b, k], owner))?;
                d.set_item("actor", view(py, p.actor, &[b], owner))?;
                d.set_item("native_raw", view(py, p.native_raw, &[b, k], owner))?;
                d.set_item("native_dropped", view(py, p.native_dropped, &[b, k], owner))?;
                d.set_item("native_choice", view(py, p.native_choice, &[b], owner))?;
            }
            if v.relations() > 0 {
                d.set_item("creature_rel", view(py, p.creature_rel, &[b, N, N, v.relations()], owner))?;
            }
        }
        Ok(d)
    }

    fn slots_one(&self, slot: usize) -> PyResult<usize> {
        if slot >= self.n_slots {
            return Err(verr(format!("slot {slot} out of range [0, {})", self.n_slots)));
        }
        Ok(slot)
    }
}

fn dims(py: Python<'_>, version: Version) -> PyResult<Bound<'_, PyDict>> {
    let d = PyDict::new(py);
    for &(k, v) in version.dims() {
        d.set_item(k, v)?;
    }
    Ok(d)
}

/// A catalog row (dict) placed with `layout_seed` by the Rust zone-layout
/// sampler: a natural20 `EncounterSpec` dict (format 1, with `layout`).
#[pyfunction]
#[pyo3(signature = (row, layout_seed, content=None))]
fn place<'py>(py: Python<'py>, row: &Bound<'py, PyAny>, layout_seed: i64, content: Option<Py<ContentPool>>) -> PyResult<Bound<'py, PyAny>> {
    let pool = match content {
        Some(c) => c.get().pool,
        None => load_pool(&[]).map_err(verr)?,
    };
    let json = py.import("json")?;
    let text: String = json.call_method1("dumps", (row,))?.extract()?;
    let value: serde_json::Value = serde_json::from_str(&text).map_err(|e| verr(e.to_string()))?;
    let entry = ember::catalog::Entry::from_json(&value, pool).map_err(verr)?;
    let placed = entry.place(seed(layout_seed, "layout_seed")?).map_err(verr)?;
    json.call_method1("loads", (entry.spec_json(&placed).to_string(),))
}


fn json_to_py<'py>(py: Python<'py>, val: &serde_json::Value) -> PyResult<Bound<'py, PyAny>> {
    let text = serde_json::to_string(val).map_err(|e| PyRuntimeError::new_err(e.to_string()))?;
    py.import("json")?.call_method1("loads", (text,))
}

fn panic_payload_message(payload: Box<dyn std::any::Any + Send>) -> String {
    if let Some(s) = payload.downcast_ref::<&str>() {
        format!("internal engine panic: {s}")
    } else if let Some(s) = payload.downcast_ref::<String>() {
        format!("internal engine panic: {s}")
    } else {
        "internal engine panic".to_string()
    }
}

/// Interactive Forests and Faeries web game session (`ember::present::WebArena`).
///
/// Every entry point wraps Rust execution in `std::panic::catch_unwind` and
/// permanently marks the game broken (`None`) on any panic so a bug in one
/// session raises a normal Python `RuntimeError` (`Exception`, HTTP 500 + game
/// eviction) instead of poisoning a mutex or killing a gunicorn worker thread.
#[pyclass(module = "ember_rs")]
struct WebGame {
    inner: Mutex<Option<ember::present::WebArena>>,
}

impl WebGame {
    fn with_game<T>(&self, f: impl FnOnce(&mut ember::present::WebArena) -> PyResult<T>) -> PyResult<T> {
        let mut guard = match self.inner.lock() {
            Ok(g) => g,
            Err(poisoned) => poisoned.into_inner(),
        };
        let Some(mut arena) = guard.take() else {
            return Err(PyRuntimeError::new_err("game state broken by an earlier internal error"));
        };
        match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| f(&mut arena))) {
            Ok(res) => {
                *guard = Some(arena);
                res
            }
            Err(payload) => Err(PyRuntimeError::new_err(panic_payload_message(payload))),
        }
    }
}

#[pymethods]
impl WebGame {
    #[new]
    #[pyo3(signature = (level_json, seed=0, revision=0, csrf_token=String::new(), encounter_id=String::new(), replay_draws_json=None, replay_version=1))]
    fn new(
        level_json: &str,
        seed: i64,
        revision: i64,
        csrf_token: String,
        encounter_id: String,
        replay_draws_json: Option<&str>,
        replay_version: u8,
    ) -> PyResult<Self> {
        let built = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| -> PyResult<ember::present::WebArena> {
            let level: ember::present::LevelInput =
                serde_json::from_str(level_json).map_err(|e| verr(format!("invalid level_json: {e}")))?;
            if let Some(raw_draws) = replay_draws_json {
                let arr: Vec<serde_json::Value> =
                    serde_json::from_str(raw_draws).map_err(|e| verr(format!("invalid replay_draws_json: {e}")))?;
                let draws: Vec<ember::tape::Ev> =
                    arr.iter().map(ember::present::parse_draw_json).collect::<Result<_, _>>().map_err(verr)?;
                ember::present::WebArena::with_versioned_replay_draws(level, draws, revision, csrf_token, encounter_id, replay_version).map_err(verr)
            } else {
                let s = crate::seed(seed, "seed")?;
                ember::present::WebArena::new(level, s, revision, csrf_token, encounter_id).map_err(verr)
            }
        }));
        match built {
            Ok(Ok(arena)) => Ok(WebGame { inner: Mutex::new(Some(arena)) }),
            Ok(Err(err)) => Err(err),
            Err(payload) => Err(PyRuntimeError::new_err(panic_payload_message(payload))),
        }
    }

    #[getter]
    fn revision(&self) -> PyResult<i64> {
        self.with_game(|g| Ok(g.revision))
    }

    #[getter]
    fn csrf_token(&self) -> PyResult<String> {
        self.with_game(|g| Ok(g.csrf_token.clone()))
    }

    #[getter]
    fn encounter_id(&self) -> PyResult<String> {
        self.with_game(|g| Ok(g.encounter_id.clone()))
    }

    #[getter]
    fn finished(&self) -> PyResult<bool> {
        self.with_game(|g| Ok(g.finished))
    }

    #[getter]
    fn winner(&self) -> PyResult<Option<String>> {
        self.with_game(|g| Ok(g.winner.clone()))
    }

    fn remaining_replay_draws(&self) -> PyResult<usize> {
        self.with_game(|g| Ok(g.remaining_replay_draws()))
    }

    fn state<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyAny>> {
        let val = self.with_game(|g| Ok(g.state()))?;
        json_to_py(py, &val)
    }

    fn wire_state<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyAny>> {
        let val = self.with_game(|g| {
            let s = g.state();
            Ok(g.wire(s))
        })?;
        json_to_py(py, &val)
    }

    fn wire_json<'py>(&self, py: Python<'py>, state_json: &str) -> PyResult<Bound<'py, PyAny>> {
        let parsed: serde_json::Value =
            serde_json::from_str(state_json).map_err(|e| verr(format!("invalid state_json: {e}")))?;
        let val = self.with_game(|g| Ok(g.wire(parsed)))?;
        json_to_py(py, &val)
    }

    fn configure<'py>(&self, py: Python<'py>, placements_json: &str, monster_control_json: &str) -> PyResult<Bound<'py, PyAny>> {
        let placements: serde_json::Value =
            serde_json::from_str(placements_json).map_err(|e| verr(format!("invalid placements: {e}")))?;
        let mc: serde_json::Value =
            serde_json::from_str(monster_control_json).map_err(|e| verr(format!("invalid monster_control: {e}")))?;
        let val = self.with_game(|g| g.configure(&placements, &mc).map_err(verr))?;
        json_to_py(py, &val)
    }

    fn start<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyAny>> {
        let val = self.with_game(|g| g.start().map_err(verr))?;
        json_to_py(py, &val)
    }

    fn perform<'py>(&self, py: Python<'py>, action_id: &str) -> PyResult<Bound<'py, PyAny>> {
        let val = self.with_game(|g| g.perform(action_id).map_err(verr))?;
        json_to_py(py, &val)
    }

    fn end_turn<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyAny>> {
        let val = self.with_game(|g| g.end_turn().map_err(verr))?;
        json_to_py(py, &val)
    }

    #[pyo3(signature = (autoplay=false))]
    fn advance<'py>(&self, py: Python<'py>, autoplay: bool) -> PyResult<Bound<'py, PyAny>> {
        let val = self.with_game(|g| g.advance(autoplay).map_err(verr))?;
        json_to_py(py, &val)
    }
}

#[pymodule]
fn ember_rs(m: &Bound<'_, PyModule>) -> PyResult<()> {
    let py = m.py();
    m.add("__version__", env!("CARGO_PKG_VERSION"))?;
    m.add("FEATURE_VERSION", FEATURE_VERSION)?;
    m.add("DIMS", dims(py, Version::default())?)?;
    // every schema `BatchEnv(feature_version=...)` accepts, with its dims
    let versions = PyDict::new(py);
    for v in Version::ALL {
        versions.set_item(v.name(), dims(py, v)?)?;
    }
    m.add("FEATURE_VERSIONS", versions)?;
    m.add("NATURAL20_COMMIT", NATURAL20_COMMIT.trim())?;
    m.add("WEB_REPLAY_VERSION", ember::present::CURRENT_WEB_REPLAY_VERSION)?;
    m.add("DEFAULT_CATALOG", PyString::new(py, ember::catalog::DEFAULT_CATALOG))?;
    m.add_class::<ContentPool>()?;
    m.add_class::<BatchEnv>()?;
    m.add_class::<Snapshot>()?;
    m.add_class::<WebGame>()?;
    m.add_function(wrap_pyfunction!(place, m)?)?;
    Ok(())
}
