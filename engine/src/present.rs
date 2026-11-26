//! Forests and Faeries web game presentation engine (`FFArena` in pure Rust).
//!
//! Wraps [`crate::engine::Fight`] and [`crate::trace::Trace`] to produce the
//! exact JSON state and `wire()` responses expected by `game/static/app.js`
//! and `game/frontend/scene3d.js`:
//! - Setup phase, placement validation, manual vs AI monster control;
//! - Human candidate enumeration (`auto_target=False` area placements, target
//!   splits, cardinal BFS + native 1-step movement paths, aimed Dragon's Breath
//!   exhales) sorted in `FFArena` canonical order with `r{revision}-{i}` IDs;
//! - Per-action timeline records (`id`, `revision`, `kind`, `source_id`,
//!   `effects`, `moves`, `before`, `after`, `descriptor`, `draws`, and
//!   standalone `opportunity: true` records inside movement);
//! - `wire()` compaction (`actions` + `action_defs`, recent `timeline`).
//!
//! Supports both `Trace::web_free(seed)` for live play and
//! `Trace::web_replay_draws(draws)` for lockstep parity tests against recorded
//! `FFArena` oracle sessions.

use std::collections::{BTreeMap, HashMap, HashSet, VecDeque};
use std::sync::Arc;

use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};

use crate::content::{ContentPool, SpellId, Template};
use crate::effects::{EffKey, MarkSlot, ObjKind};
use crate::engine::{Act, Fight, St};
use crate::map::{Grid, Pos};
use crate::present_text;
use crate::spells::Cast;
use crate::tape::{DrawVal, Ev, Placement};
use crate::trace::Trace;
use crate::web_events::{DeathSave, SaveOutcome, WebEv};

pub const CURRENT_WEB_REPLAY_VERSION: u8 = 19;
const MAX_LOG: usize = 180;
const MAX_TIMELINE: usize = 64;
const MAX_EFFECTS: usize = 96;
const ACTION_CAP: usize = 24;

fn cell_label(p: Pos) -> String {
    let x = p.0.max(0) as u32;
    let mut col = String::new();
    if x >= 26 {
        col.push(char::from_u32(u32::from(b'A') + (x / 26 - 1)).unwrap_or('A'));
    }
    col.push(char::from_u32(u32::from(b'A') + (x % 26)).unwrap_or('A'));
    format!("{col}{}", p.1 + 1)
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct LevelInput {
    pub encounter_id: String,
    pub preset_id: String,
    pub theme: String,
    pub map_name: String,
    pub rows: Vec<String>,
    pub scene: Value,
    pub level_view: Value,
    pub heroes: Vec<String>,
    /// `(unit_id, content_id, display_name)`
    pub monsters: Vec<(String, String, String)>,
    pub suggested_placements: Vec<Placement>,
}

#[derive(Clone, Debug)]
struct RosterUnit {
    id: String,
    content: String,
    team: &'static str, // "heroes" | "monsters"
    name: String,
    t: &'static Template,
}

#[derive(Clone, Debug)]
struct HumanCandidate {
    act: Act,
    /// When `act == Act::DragonsBreathExhale`, the player's chosen cone aim.
    exhale_aim: Option<Pos>,
}

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
struct FFArenaKey {
    action_type: String,
    spell_or_weapon: String,
    target_ids: Vec<String>,
    destination: String,
    point: String,
    at_level: String,
    metamagic: String,
    mode: String,
    thrown: String,
    path: String,
}

struct InterruptedMove {
    champion: usize,
    mover: usize,
    requested: Vec<Pos>,
    moves: Vec<Pos>,
    opportunities: Vec<(usize, usize)>,
}

pub struct WebArena {
    level: LevelInput,
    replay_version: u8,
    grid: Arc<Grid>,
    roster: Vec<RosterUnit>,
    roster_by_id: HashMap<String, usize>,
    placements: Vec<Placement>,
    monster_control: String, // "ai" | "manual"
    in_setup: bool,
    pub finished: bool,
    pub winner: Option<String>,
    pub revision: i64,
    pub csrf_token: String,
    pub encounter_id: String,
    trace_init: Trace,
    fight: Option<Fight>,
    interrupted_move: Option<InterruptedMove>,
    /// Map from `fight.units` index -> `roster` index, plus reverse.
    fight_to_roster: Vec<usize>,
    roster_to_fight: Vec<Option<usize>>,
    initiative_rolls: HashMap<String, i32>,
    initiative_draws: Vec<Value>,
    pending_draws: Vec<Value>,
    pending_effects: Vec<Value>,
    effects: VecDeque<Value>,
    effect_counter: i64,
    timeline: VecDeque<Value>,
    action_counter: i64,
    log: VecDeque<Value>,
    log_counter: i64,
    cache_revision: Option<i64>,
    candidates: HashMap<String, HumanCandidate>,
    action_views: Vec<Value>,
    areas: BTreeMap<String, Vec<[i32; 2]>>,
}

fn py_point_str(p: Option<Pos>) -> String {
    match p {
        Some((x, y)) => format!("[{x}, {y}]"),
        None => "None".to_string(),
    }
}

fn py_dest_str(p: Option<Pos>) -> String {
    match p {
        Some((x, y)) => format!("[{x}, {y}]"),
        None => "[None, None]".to_string(),
    }
}

fn py_path_str(path: Option<&[Pos]>) -> String {
    match path {
        None => "None".to_string(),
        Some(cells) => {
            let parts: Vec<String> = cells.iter().map(|(x, y)| format!("[{x}, {y}]")).collect();
            format!("[{}]", parts.join(", "))
        }
    }
}

fn py_bool_opt_str(b: Option<bool>) -> String {
    match b {
        None => "None".to_string(),
        Some(true) => "True".to_string(),
        Some(false) => "False".to_string(),
    }
}

fn ev_to_draw_json(ev: &Ev) -> Option<Value> {
    match ev {
        Ev::Draw { who, tag, sides, mode, v, .. } => {
            let val = match v {
                DrawVal::One(x) => json!(*x),
                DrawVal::Two([a, b]) => json!([*a, *b]),
            };
            Some(json!({
                "who": who,
                "tag": tag,
                "sides": *sides,
                "mode": mode,
                "v": val,
            }))
        }
        _ => None,
    }
}

pub fn parse_draw_json(v: &Value) -> Result<Ev, String> {
    let who = v.get("who").and_then(Value::as_str).unwrap_or("").to_string();
    let tag = v.get("tag").and_then(Value::as_str).ok_or("draw missing tag")?.to_string();
    let sides = v.get("sides").and_then(Value::as_i64).ok_or("draw missing sides")? as i32;
    let mode = v.get("mode").and_then(Value::as_str).ok_or("draw missing mode")?.to_string();
    let raw_v = v.get("v").ok_or("draw missing v")?;
    let dv = if let Some(n) = raw_v.as_i64() {
        DrawVal::One(n as i32)
    } else if let Some(arr) = raw_v.as_array() {
        if arr.len() != 2 {
            return Err("draw array v must have 2 elements".to_string());
        }
        let a = arr[0].as_i64().ok_or("draw v[0] int")? as i32;
        let b = arr[1].as_i64().ok_or("draw v[1] int")? as i32;
        DrawVal::Two([a, b])
    } else {
        return Err("invalid draw v".to_string());
    };
    Ok(Ev::Draw { who, tag, sides, mode, v: dv, expr: None })
}

impl WebArena {
    pub fn new(
        level: LevelInput,
        seed: u64,
        revision: i64,
        csrf_token: String,
        encounter_token: String,
    ) -> Result<Self, String> {
        Self::with_trace(level, Trace::web_free(seed), revision, csrf_token, encounter_token, CURRENT_WEB_REPLAY_VERSION)
    }

    pub fn with_replay_draws(
        level: LevelInput,
        draws: Vec<Ev>,
        revision: i64,
        csrf_token: String,
        encounter_token: String,
    ) -> Result<Self, String> {
        Self::with_versioned_replay_draws(level, draws, revision, csrf_token, encounter_token, 1)
    }

    pub fn with_versioned_replay_draws(
        level: LevelInput,
        draws: Vec<Ev>,
        revision: i64,
        csrf_token: String,
        encounter_token: String,
        version: u8,
    ) -> Result<Self, String> {
        if !(1..=CURRENT_WEB_REPLAY_VERSION).contains(&version) {
            return Err(format!("unsupported web replay version {version}"));
        }
        Self::with_trace(level, Trace::web_replay_draws(draws), revision, csrf_token, encounter_token, version)
    }

    fn with_trace(
        mut level: LevelInput,
        trace: Trace,
        revision: i64,
        csrf_token: String,
        encounter_token: String,
        replay_version: u8,
    ) -> Result<Self, String> {
        if replay_version == 1 {
            if let Some(view) = level.level_view.as_object_mut() {
                view.remove("hero_level");
                if let Some(party) = view.get_mut("party").and_then(Value::as_array_mut) {
                    for hero in party.iter_mut().filter_map(Value::as_object_mut) {
                        hero.remove("base_id");
                        hero.remove("level");
                    }
                }
            }
        }
        let pool = ContentPool::global();
        let grid = Arc::new(Grid::from_rows(&level.rows)?);
        let mut roster = Vec::new();
        let mut roster_by_id = HashMap::new();

        for hero in &level.heroes {
            let tid = pool.unit_tid(hero).ok_or_else(|| format!("unknown hero {hero}"))?;
            let t = &pool.templates[tid as usize];
            let idx = roster.len();
            roster_by_id.insert(hero.clone(), idx);
            roster.push(RosterUnit {
                id: hero.clone(),
                content: t.id.to_string(),
                team: "heroes",
                name: t.name.to_string(),
                t,
            });
        }
        for (uid, content, display_name) in &level.monsters {
            let tid = pool.unit_tid(uid).ok_or_else(|| format!("unknown monster {uid}"))?;
            let t = &pool.templates[tid as usize];
            let idx = roster.len();
            roster_by_id.insert(uid.clone(), idx);
            roster.push(RosterUnit {
                id: uid.clone(),
                content: content.clone(),
                team: "monsters",
                name: display_name.clone(),
                t,
            });
        }

        let placements = level.suggested_placements.clone();
        let mut arena = WebArena {
            level,
            replay_version,
            grid,
            roster,
            roster_by_id,
            placements,
            monster_control: "ai".to_string(),
            in_setup: true,
            finished: false,
            winner: None,
            revision,
            csrf_token,
            encounter_id: encounter_token,
            trace_init: trace,
            fight: None,
            interrupted_move: None,
            fight_to_roster: Vec::new(),
            roster_to_fight: Vec::new(),
            initiative_rolls: HashMap::new(),
            initiative_draws: Vec::new(),
            pending_draws: Vec::new(),
            pending_effects: Vec::new(),
            effects: VecDeque::new(),
            effect_counter: 0,
            timeline: VecDeque::new(),
            action_counter: 0,
            log: VecDeque::new(),
            log_counter: 0,
            cache_revision: None,
            candidates: HashMap::new(),
            action_views: Vec::new(),
            areas: BTreeMap::new(),
        };
        arena.validate_placements_struct(&arena.placements.clone(), "ai")?;
        arena.push_log("Place figures, then Start combat. Each square is 5 feet.", "info", 0);
        Ok(arena)
    }

    pub fn remaining_replay_draws(&self) -> usize {
        match &self.fight {
            Some(f) => f.trace.remaining(),
            None => self.trace_init.remaining(),
        }
    }

    fn current_round(&self) -> i32 {
        self.fight.as_ref().map_or(0, |f| f.round)
    }

    fn push_log(&mut self, text: &str, tone: &str, round: i32) {
        self.log_counter += 1;
        if self.log.len() >= MAX_LOG {
            self.log.pop_front();
        }
        self.log.push_back(json!({
            "id": self.log_counter,
            "round": round,
            "text": text,
            "tone": tone,
        }));
    }

    fn push_effect(&mut self, mut eff: Map<String, Value>) -> Value {
        self.effect_counter += 1;
        eff.insert("id".to_string(), json!(self.effect_counter));
        let val = Value::Object(eff);
        if self.effects.len() >= MAX_EFFECTS {
            self.effects.pop_front();
        }
        self.effects.push_back(val.clone());
        val
    }

    fn validate_placements_json(&self, placements: &Value, monster_control: &Value) -> Result<(Vec<Placement>, String), String> {
        let mc = monster_control
            .as_str()
            .filter(|&s| s == "ai" || s == "manual")
            .ok_or_else(|| "monster_control must be ai or manual.".to_string())?
            .to_string();
        let arr = placements
            .as_array()
            .ok_or_else(|| format!("placements must be a list of at most {} figures.", self.roster.len()))?;
        if arr.len() > self.roster.len() {
            return Err(format!("placements must be a list of at most {} figures.", self.roster.len()));
        }
        let mut parsed = Vec::with_capacity(arr.len());
        let mut seen_ids = HashSet::new();
        let mut seen_cells = HashSet::new();
        for item in arr {
            let obj = item.as_object().ok_or_else(|| "Each placement requires only id, x and y.".to_string())?;
            if obj.len() != 3 || !obj.contains_key("id") || !obj.contains_key("x") || !obj.contains_key("y") {
                return Err("Each placement requires only id, x and y.".to_string());
            }
            // Check figure ID and duplicates BEFORE coordinates (`webgame/arena.py:222-231`).
            let uid = obj["id"]
                .as_str()
                .filter(|&id| self.roster_by_id.contains_key(id))
                .ok_or_else(|| "Unknown or duplicate figure.".to_string())?;
            if !seen_ids.insert(uid.to_string()) {
                return Err("Unknown or duplicate figure.".to_string());
            }
            let xv = &obj["x"];
            let yv = &obj["y"];
            if xv.is_boolean() || yv.is_boolean() {
                return Err("Placement coordinates must be in-bounds integers.".to_string());
            }
            let x = xv
                .as_i64()
                .and_then(|v| i32::try_from(v).ok())
                .ok_or_else(|| "Placement coordinates must be in-bounds integers.".to_string())?;
            let y = yv
                .as_i64()
                .and_then(|v| i32::try_from(v).ok())
                .ok_or_else(|| "Placement coordinates must be in-bounds integers.".to_string())?;
            if !self.grid.in_bounds(x, y) {
                return Err("Placement coordinates must be in-bounds integers.".to_string());
            }
            if self.grid.is_wall(x, y) || !seen_cells.insert((x, y)) {
                return Err("Figures must occupy distinct native walkable cells.".to_string());
            }
            parsed.push(Placement { id: uid.to_string(), x, y });
        }
        Ok((parsed, mc))
    }

    fn validate_placements_struct(&self, placements: &[Placement], monster_control: &str) -> Result<(), String> {
        if monster_control != "ai" && monster_control != "manual" {
            return Err("monster_control must be ai or manual.".to_string());
        }
        if placements.len() > self.roster.len() {
            return Err(format!("placements must be a list of at most {} figures.", self.roster.len()));
        }
        let mut seen_ids = HashSet::new();
        let mut seen_cells = HashSet::new();
        for p in placements {
            if !self.roster_by_id.contains_key(&p.id) || !seen_ids.insert(p.id.clone()) {
                return Err("Unknown or duplicate figure.".to_string());
            }
            if !self.grid.in_bounds(p.x, p.y) {
                return Err("Placement coordinates must be in-bounds integers.".to_string());
            }
            if self.grid.is_wall(p.x, p.y) || !seen_cells.insert((p.x, p.y)) {
                return Err("Figures must occupy distinct native walkable cells.".to_string());
            }
        }
        Ok(())
    }

    fn can_start(&self) -> bool {
        let mut has_hero = false;
        let mut has_monster = false;
        for p in &self.placements {
            if let Some(&ri) = self.roster_by_id.get(&p.id) {
                if self.roster[ri].team == "heroes" {
                    has_hero = true;
                } else {
                    has_monster = true;
                }
            }
        }
        has_hero && has_monster
    }

    fn human_controlled_fight(&self, u: usize) -> bool {
        let f = self.fight.as_ref().unwrap();
        f.units[u].team == 0 || self.monster_control == "manual"
    }

    fn concealed_from_heroes(&self, u: usize) -> bool {
        if self.replay_version < 6 || self.finished || self.monster_control == "manual" { return false; }
        let f = self.fight.as_ref().unwrap();
        f.units[u].team != 0 && f.units[u].hidden() && !(0..f.units.len()).any(|hero|
            f.units[hero].team == 0 && f.units[hero].conscious() && f.can_see(hero, u))
    }

    /// SRD 5.2.1 ("Invisible" & "Unseen Attackers and Targets"): an invisible
    /// creature that has not taken the Hide action cannot be seen (without
    /// Blindsight/Truesight), yet its location is still known (heard/sensed).
    fn invisible_unseen_by_heroes(&self, u: usize) -> bool {
        if self.replay_version < 19 || self.finished || self.monster_control == "manual" {
            return false;
        }
        let f = self.fight.as_ref().unwrap();
        let unit = &f.units[u];
        unit.team != 0
            && unit.conscious()
            && unit.invisible()
            && !self.concealed_from_heroes(u)
            && !(0..f.units.len()).any(|hero| {
                f.units[hero].team == 0 && f.units[hero].conscious() && f.can_see(hero, u)
            })
    }

    fn acting_unit(&self, fight: &Fight) -> usize {
        self.interrupted_move.as_ref().map_or_else(|| fight.current(), |m| m.champion)
    }

    fn resume_interrupted_move(&mut self) {
        if let Some(m) = self.interrupted_move.take() {
            self.fight.as_mut().unwrap().units[m.champion].champion_movement = 0;
            self.continue_move(m.mover, &m.requested, m.moves, m.opportunities);
            self.finish_if_needed();
        }
    }

    fn can_act(&self) -> bool {
        if self.in_setup || self.finished {
            return false;
        }
        let Some(f) = &self.fight else { return false };
        if f.order.is_empty() {
            return false;
        }
        self.human_controlled_fight(self.acting_unit(f))
    }

    fn phase(&self) -> &'static str {
        if self.in_setup {
            return "setup";
        }
        if self.finished {
            return "finished";
        }
        let f = self.fight.as_ref().unwrap();
        if f.units[self.acting_unit(f)].team == 0 {
            "hero"
        } else {
            "enemy"
        }
    }

    // ------------------------------------------------------------------
    // Public API mutations (`configure`, `start`, `perform`, `end_turn`, `advance`)
    // ------------------------------------------------------------------

    pub fn configure(&mut self, placements: &Value, monster_control: &Value) -> Result<Value, String> {
        if !self.in_setup {
            return Err("Placement is only available during setup.".to_string());
        }
        let (parsed, mc) = self.validate_placements_json(placements, monster_control)?;
        self.placements = parsed;
        self.monster_control = mc;
        self.revision += 1;
        Ok(self.state())
    }

    pub fn start(&mut self) -> Result<Value, String> {
        if !self.in_setup {
            return Err("Combat has already started.".to_string());
        }
        self.validate_placements_struct(&self.placements.clone(), &self.monster_control)?;
        if !self.can_start() {
            return Err("Place at least one hero and one monster before Start.".to_string());
        }

        let by_id: HashMap<&str, &Placement> = self.placements.iter().map(|p| (p.id.as_str(), p)).collect();
        let mut unit_ids = Vec::new();
        let mut ordered_placements = Vec::new();
        let mut fight_to_roster = Vec::new();
        let mut roster_to_fight = vec![None; self.roster.len()];

        for (ri, ru) in self.roster.iter().enumerate() {
            if let Some(&p) = by_id.get(ru.id.as_str()) {
                let fi = unit_ids.len();
                unit_ids.push(ru.id.clone());
                ordered_placements.push(p.clone());
                fight_to_roster.push(ri);
                roster_to_fight[ri] = Some(fi);
            }
        }

        let mut fight = Fight::on_map(
            ContentPool::global(),
            Arc::clone(&self.grid),
            &unit_ids,
            &ordered_placements,
            crate::engine::MAX_ROUNDS,
            self.trace_init.clone(),
        )?;
        fight.set_rule_version(match self.replay_version {
            1..=3 => i32::from(self.replay_version),
            4 => 3,
            5..=18 => i32::from(self.replay_version - 1),
            _ => 17,
        });
        fight.web_events = Some(Vec::new());
        self.in_setup = false;
        self.fight_to_roster = fight_to_roster;
        self.roster_to_fight = roster_to_fight;

        self.fight = Some(fight);

        // Shared `Fight::roll_initiative()` (`F4.6`), logging between `Battle.start()` and `_open_turn()`.
        self.fight.as_mut().unwrap().roll_initiative();
        let init_events = self.fight.as_mut().unwrap().take_web_events();
        self.process_non_action_events(init_events);
        self.push_log("Combat begins — native initiative rolled.", "info", 0);

        self.open_turn_loop();

        let all_draws = self.take_raw_draws();
        let mut init_draws = Vec::new();
        let mut leftover = Vec::new();
        for d in all_draws {
            let is_init = d.get("tag").and_then(Value::as_str).map_or(false, |t| t.contains("initiative"));
            if is_init {
                init_draws.push(d);
            } else {
                leftover.push(d);
            }
        }
        self.initiative_draws = init_draws;
        self.pending_draws.extend(leftover);

        self.revision += 1;
        Ok(self.state())
    }

    pub fn perform(&mut self, action_id: &str) -> Result<Value, String> {
        if !self.can_act() {
            return Err("It is not a human-controlled combat turn.".to_string());
        }
        self.build_candidates();
        let Some(cand) = self.candidates.get(action_id).cloned() else {
            return Err("Unknown or unavailable action.".to_string());
        };
        let actor = self.acting_unit(self.fight.as_ref().unwrap());
        let interrupt = self.interrupted_move.is_some();
        self.execute_candidate(actor, &cand);
        if interrupt {
            self.resume_interrupted_move();
        }
        if !self.finished && !self.fight.as_ref().unwrap().units[actor].conscious() {
            self.end_turn_flow();
        }
        self.revision += 1;
        Ok(self.state())
    }

    pub fn end_turn(&mut self) -> Result<Value, String> {
        if !self.can_act() {
            return Err("It is not a human-controlled combat turn.".to_string());
        }
        if let Some(f) = &self.fight {
            if f.pending_rays(self.acting_unit(f)).is_some() {
                return Err("Choose a target for the next Scorching Ray.".to_string());
            }
        }
        if self.interrupted_move.is_some() {
            self.resume_interrupted_move();
        } else {
            self.end_turn_flow();
        }
        self.revision += 1;
        Ok(self.state())
    }

    pub fn advance(&mut self, autoplay: bool) -> Result<Value, String> {
        if self.in_setup {
            return Err("Start combat before advancing turns.".to_string());
        }
        if self.finished {
            return Err("The battle has finished.".to_string());
        }
        if self.interrupted_move.is_some() {
            if !autoplay {
                return Err("Choose the Champion's move or stay here.".to_string());
            }
            self.resume_interrupted_move();
            self.revision += 1;
            return Ok(self.state());
        }
        let actor = self.fight.as_ref().unwrap().current();
        if self.human_controlled_fight(actor) && !autoplay {
            return Err("Use autoplay=true to automate a human-controlled figure.".to_string());
        }
        let mut hit_cap = true;
        let mut actions_taken = 0;
        while actions_taken < ACTION_CAP || self.fight.as_ref().unwrap().pending_rays(actor).is_some() {
            actions_taken += 1;
            if self.finished {
                hit_cap = false;
                break;
            }
            let can_take = self.fight.as_mut().unwrap().can_take_turn(actor);
            if !can_take {
                hit_cap = false;
                break;
            }
            let chosen = self.fight.as_mut().unwrap().move_for(actor);
            let Some(act) = chosen else {
                hit_cap = false;
                break;
            };
            let cand = HumanCandidate { act, exhale_aim: None };
            self.execute_candidate(actor, &cand);
            if self.interrupted_move.is_some() {
                self.revision += 1;
                return Ok(self.state());
            }
        }
        if hit_cap && !self.finished {
            let r = self.current_round();
            self.push_log("Controller action limit reached; ending this turn.", "info", r);
        }
        if !self.finished {
            self.end_turn_flow();
        }
        self.revision += 1;
        Ok(self.state())
    }

    // ------------------------------------------------------------------
    // Turn flow & action execution
    // ------------------------------------------------------------------

    fn unit_display_name(&self, u: usize) -> &str {
        &self.roster[self.fight_to_roster[u]].name
    }

    fn unit_content<'a>(&'a self, u: usize) -> &'a str {
        &self.roster[self.fight_to_roster[u]].content
    }

    fn take_raw_draws(&mut self) -> Vec<Value> {
        let Some(f) = &mut self.fight else { return Vec::new() };
        f.trace.take_captured().iter().filter_map(ev_to_draw_json).collect()
    }

    fn drain_record_draws(&mut self) -> Vec<Value> {
        let fresh = self.take_raw_draws();
        let mut out = std::mem::take(&mut self.pending_draws);
        out.extend(fresh);
        out
    }

    fn finish_if_needed(&mut self) -> bool {
        let was_finished = self.finished;
        let mut done = self.fight.as_mut().unwrap().finish_if_needed();
        let mut round_cap = false;
        if !done && self.replay_version >= 18 {
            let f = self.fight.as_mut().unwrap();
            if f.max_rounds > 0 && f.round >= f.max_rounds {
                f.finished = true;
                done = true;
                round_cap = true;
            }
        }
        if done && !was_finished {
            self.finished = true;
            let winner_team = if round_cap {
                None
            } else {
                self.fight.as_ref().unwrap().winner.map(|t| if t == 0 { "heroes" } else { "monsters" })
            };
            self.winner = winner_team.map(str::to_string);
            let text = if round_cap {
                let lim = self.fight.as_ref().unwrap().max_rounds;
                format!("The battle ends after {lim} rounds with no winner.")
            } else {
                match winner_team {
                    Some("heroes") => "The heroes are victorious.".to_string(),
                    Some("monsters") => "The monsters are victorious.".to_string(),
                    _ => "No one is left standing.".to_string(),
                }
            };
            let r = self.current_round();
            self.push_log(&text, "end", r);
        }
        done
    }

    fn open_turn_loop(&mut self) {
        while !self.finish_if_needed() {
            let (actor, acted_ready) = self.fight.as_mut().unwrap().open_turn_step();
            let evs = self.fight.as_mut().unwrap().take_web_events();
            let round = self.current_round();
            let who = self.unit_display_name(actor).to_string();
            if acted_ready && self.replay_version >= 15 {
                self.push_log(&format!("{who} — turn begins."), "turn", round);
            }
            self.process_non_action_events(evs);
            if acted_ready {
                if self.replay_version < 15 {
                    self.push_log(&format!("{who} — turn begins."), "turn", round);
                }
                return;
            }
            self.push_log(&format!("{who} cannot act; turn skipped."), "turn", round);
            self.battle_end_and_next_turn();
        }
    }

    fn battle_end_and_next_turn(&mut self) {
        self.fight.as_mut().unwrap().end_and_next_turn();
        let evs = self.fight.as_mut().unwrap().take_web_events();
        self.process_non_action_events(evs);
    }

    fn end_turn_flow(&mut self) {
        self.battle_end_and_next_turn();
        self.open_turn_loop();
    }

    fn execute_candidate(&mut self, src: usize, cand: &HumanCandidate) {
        let round = self.current_round();
        let who = self.unit_display_name(src).to_string();

        // Pre-action chronicle line (`FFArena._execute`, lines 159-172)
        match &cand.act {
            Act::Spell(c) if self.fight.as_ref().unwrap().pending_rays(src).is_some() => {
                let rays = self.fight.as_ref().unwrap().pending_rays(src).unwrap();
                self.push_log(&format!("{who} aims Scorching Ray {} of {}.", rays.next, crate::spells::ScorchingRays::count(c.at_level)), "spell", round);
            }
            Act::Spell(c) => {
                let name = present_text::spell_display_name(c.spell.key());
                let mut extra = Vec::new();
                if c.at_level > c.spell.level() && c.spell.level() >= 0 && c.at_level > 0 {
                    extra.push(format!("at level {}", c.at_level));
                }
                if let Some(mm) = c.mm {
                    extra.push(mm.key().replace('_', " "));
                }
                let suffix = if extra.is_empty() { String::new() } else { format!(" ({})", extra.join(", ")) };
                self.push_log(&format!("{who} casts {name}{suffix}."), "spell", round);
            }
            Act::TurnUndead => self.push_log(&format!("{who} uses Turn Undead."), "spell", round),
            Act::DivineSpark { .. } => self.push_log(&format!("{who} uses Divine Spark."), "spell", round),
            Act::PreserveLife(_) => self.push_log(&format!("{who} uses Preserve Life."), "spell", round),
            Act::CreateSpellSlot { level } => self.push_log(&format!("{who} uses Font of Magic to create a level {level} spell slot."), "spell", round),
            Act::ConvertSpellSlot { level } => self.push_log(&format!("{who} converts a level {level} spell slot into sorcery points."), "spell", round),
            Act::InnateSorcery => self.push_log(&format!("{who} uses Innate Sorcery."), "spell", round),
            Act::ActionSurge => self.push_log(&format!("{who} uses Action Surge."), "spell", round),
            Act::DragonsBreathExhale => self.push_log(&format!("{who} uses Dragon's Breath: exhale."), "spell", round),
            Act::SpiritualWeaponMove { to } => self.push_log(&format!("{who} moves Spiritual Weapon to [{}, {}].", to.0, to.1), "spell", round),
            Act::SpiritualWeaponAttack { .. } => self.push_log(&format!("{who} uses Spiritual Weapon: strike."), "spell", round),
            Act::Disengage => self.push_log(&format!("{who} uses Disengage."), "info", round),
            Act::DisengageBonus => self.push_log(&format!("{who} uses Disengage (bonus action)."), "info", round),
            Act::HideBonus => self.push_log(&format!("{who} uses Hide (bonus action)."), "info", round),
            Act::Rage => self.push_log(&format!("{who} uses Rage (bonus action)."), "info", round),
            Act::ExtendRage => self.push_log(&format!("{who} uses Extend Rage (bonus action)."), "info", round),
            Act::RecklessAttack => self.push_log(&format!("{who} attacks recklessly."), "info", round),
            Act::Cleave { target, .. } => {
                let tname = self.unit_display_name(*target).to_string();
                self.push_log(&format!("{who} cleaves on into {tname}."), "info", round);
            }
            _ => {}
        }

        if let Act::Move(path) = &cand.act {
            self.execute_move_with_oas(src, path);
        } else {
            let before = self.presentation_snapshot();
            let first_effect = self.effect_counter;
            self.fight.as_mut().unwrap().decisions += 1;
            if let (Act::DragonsBreathExhale, Some(aim)) = (&cand.act, cand.exhale_aim) {
                self.fight.as_mut().unwrap().lapse_cleave(src);
                self.fight.as_mut().unwrap().do_exhale_at(src, aim);
                self.fight.as_mut().unwrap().expire_timed_conditions();
            } else {
                self.fight.as_mut().unwrap().execute_action(src, &cand.act);
            }
            let evs = self.fight.as_mut().unwrap().take_web_events();
            let (moves, blind_hit_tgt) = self.process_action_events(src, &cand.act, cand.exhale_aim, evs);
            self.record_action(src, &cand.act, cand.exhale_aim, blind_hit_tgt, before, first_effect, moves, false);
        }

        self.finish_if_needed();
    }

    fn execute_move_with_oas(&mut self, mover: usize, path: &[Pos]) {
        self.fight.as_mut().unwrap().decisions += 1;
        let f = self.fight.as_ref().unwrap();
        let hidden_contact = |path: &[Pos]| path.iter().skip(1).position(|&p|
            f.token_at(p).is_some_and(|i| self.concealed_from_heroes(i)));
        let mut contact = if self.replay_version >= 8 && f.units[mover].team == 0 {
            hidden_contact(path)
        } else { None };
        // The menu offers destinations using what the party can see. Honor a reachable
        // destination via an open route even if the preview's tie-break hit a hidden enemy.
        let alternative = if self.replay_version >= 9 && contact.is_some() {
            crate::batch::movement_paths(f, mover, 0, false, None).into_iter()
                .find(|route| route.last() == path.last() && hidden_contact(route).is_none())
        } else { None };
        let path = if let Some(ref route) = alternative {
            contact = None;
            route.as_slice()
        } else { path };
        let limit = contact.map_or(path.len(), |i| i + 1);
        let moves = f.prepare_move(mover, &path[..limit]);
        if contact.is_some() { self.push_log("The route is blocked.", "info", self.current_round()); }
        let f = self.fight.as_mut().unwrap();
        let oas = if f.champion_move_fits(mover, path) {
            Vec::new()
        } else {
            f.units[mover].champion_movement = 0;
            f.opportunity_attacks(mover, &moves)
        };

        self.continue_move(mover, path, moves, oas);
    }

    fn continue_move(&mut self, mover: usize, path: &[Pos], mut moves: Vec<Pos>, oas: Vec<(usize, usize)>) {
        let mut cursor = 0;
        let mut oas = oas.into_iter();
        while let Some((reactor, index)) = oas.next() {
            if self.replay_version >= 8 && index - 1 > cursor {
                let before = self.presentation_snapshot();
                let effect = self.effect_counter;
                let prefix = moves[cursor..index].to_vec();
                let action = Act::Move(prefix.clone());
                let f = self.fight.as_mut().unwrap();
                f.commit_move_prefix(mover, prefix, true);
                let events = f.take_web_events();
                let (trail, hidden) = self.process_action_events(mover, &action, None, events);
                self.record_action(mover, &action, None, hidden, before, effect, trail, false);
                cursor = index - 1;
            }
            let original: Vec<Pos> = moves[cursor..index].to_vec();
            let was_prone = self.fight.as_ref().unwrap().units[mover].prone();
            let oa_act = self.fight.as_mut().unwrap().opportunity_attack_listener(reactor, mover);
            if let Some(Act::Attack { atk, target, .. }) = oa_act {
                let oa = Act::Attack { atk, target, reaction: true };
                if self.replay_version >= 7 && !self.concealed_from_heroes(mover) && !self.concealed_from_heroes(reactor) {
                    let (x, y) = moves[index - 1];
                    let name = self.unit_display_name(mover);
                    let enemy = self.unit_display_name(reactor);
                    self.push_log(&format!("{enemy} makes an opportunity attack as {name} tries to leave [{x}, {y}]."), "info", self.current_round());
                }
                let oa_before = self.presentation_snapshot();
                let oa_first_effect = self.effect_counter;
                let interactive = self.human_controlled_fight(reactor);
                let f = self.fight.as_mut().unwrap();
                f.interactive_champion = interactive.then_some(reactor);
                f.execute_oa_attack(reactor, atk, target);
                f.interactive_champion = None;
                let oa_evs = self.fight.as_mut().unwrap().take_web_events();
                let (oa_moves, oa_blind_tgt) = self.process_action_events(reactor, &oa, None, oa_evs);
                self.record_action(reactor, &oa, None, oa_blind_tgt, oa_before, oa_first_effect, oa_moves, true);
            }
            let stop = {
                let f = self.fight.as_ref().unwrap();
                !f.units[mover].conscious() || (f.units[mover].prone() && (!was_prone || !f.creature_space_rules))
            };
            if self.fight.as_ref().unwrap().units[reactor].champion_movement > 0 {
                let remaining = if stop { Vec::new() } else { oas.map(|(r, i)| (r, i - cursor)).collect() };
                self.interrupted_move = Some(InterruptedMove {
                    champion: reactor, mover, requested: path.to_vec(),
                    moves: if stop { original } else { moves[cursor..].to_vec() }, opportunities: remaining,
                });
                let name = self.unit_display_name(reactor).to_owned();
                self.push_log(&format!("{name} can move up to half speed after the critical hit."), "info", self.current_round());
                return;
            }
            if stop {
                moves.truncate(index);
                break;
            }
        }

        // `move_action.py:159-162`: `MoveAction.resolve` sets `movement = 0` when an OA dropped the mover,
        // BEFORE `MoveAction.resolve` returns and BEFORE `PresentationBattle` captures `before` (`F5.5`)!
        {
            let f = self.fight.as_mut().unwrap();
            if f.units[mover].unconscious() {
                f.units[mover].movement = 0;
            }
        }
        let move_before = self.presentation_snapshot();
        let move_first_effect = self.effect_counter;
        {
            let f = self.fight.as_mut().unwrap();
            f.lapse_cleave(mover);
            f.commit_move_segment(mover, moves[cursor..].to_vec());
            f.expire_timed_conditions();
        }
        let mv_evs = self.fight.as_mut().unwrap().take_web_events();
        let mv_act = Act::Move(path.to_vec());
        let (executed_moves, mv_blind_tgt) = self.process_action_events(mover, &mv_act, None, mv_evs);
        self.record_action(mover, &mv_act, None, mv_blind_tgt, move_before, move_first_effect, executed_moves, false);
    }

    // ------------------------------------------------------------------
    // Event -> Visual Effects + Chronicle Lines
    // ------------------------------------------------------------------

    fn nearest_stench_source(&self, victim: usize) -> usize {
        let f = self.fight.as_ref().unwrap();
        let vpos = f.units[victim].pos;
        let mut best: Option<(i32, usize)> = None;
        for o in 0..f.units.len() {
            if o == victim || f.units[o].t.stench_dc.is_none() || f.units[o].dead() {
                continue;
            }
            let d = f.square_distance(f.units[o].pos, vpos);
            if best.map_or(true, |b| d < b.0) {
                best = Some((d, o));
            }
        }
        best.map_or(victim, |b| b.1)
    }

    fn nearest_cleric(&self, victim: usize) -> usize {
        let f = self.fight.as_ref().unwrap();
        let vpos = f.units[victim].pos;
        let mut best: Option<(i32, usize)> = None;
        for o in 0..f.units.len() {
            if f.units[o].team == 0 && f.units[o].conscious() && self.unit_content(o) == "elion" {
                let d = f.square_distance(f.units[o].pos, vpos);
                if best.map_or(true, |b| d < b.0) {
                    best = Some((d, o));
                }
            }
        }
        best.map_or(victim, |b| b.1)
    }

    fn log_death_save(&mut self, u: usize, outcome: DeathSave, round: i32) {
        let name = self.unit_display_name(u);
        let text = match outcome {
            DeathSave::Roll { passed, description } => {
                let label = if passed { "death save" } else { "death fail" };
                format!("{name}: {label} {description}.")
            }
            DeathSave::Damage { .. } if self.replay_version < 4 => format!("{name}: death fail ."),
            DeathSave::Damage { failures: 2 } => format!("{name} takes a critical hit: 2 death-save failures."),
            DeathSave::Damage { .. } => format!("{name} takes damage while unconscious: 1 death-save failure."),
        };
        self.push_log(&text, "info", round);
    }

    fn process_non_action_events(&mut self, evs: Vec<WebEv>) {
        for ev in evs {
            match ev {
                WebEv::RageEnded { target } => {
                    if !self.concealed_from_heroes(target) {
                        let who = self.unit_display_name(target);
                        self.push_log(&format!("{who}’s Rage ends."), "status", self.current_round());
                    }
                }
                WebEv::Initiative { u, roll_total } => {
                    let uid = self.fight.as_ref().unwrap().units[u].id.clone();
                    self.initiative_rolls.insert(uid, roll_total);
                }
                WebEv::StenchSave { source, victim, victim_pos, total, dc, passed } => {
                    let ghast = if self.replay_version >= 6 { source } else { self.nearest_stench_source(victim) };
                    if self.replay_version >= 6 {
                        let who = self.unit_display_name(victim);
                        let name = self.unit_display_name(ghast);
                        let result = if passed { "succeeds" } else { "fails" };
                        let effect = if passed { "immune to this Stench for 24 hours" } else { "Poisoned until the start of its next turn" };
                        self.push_log(&format!("{who} {result} on the Constitution save against {name}'s Stench ({total} vs DC {dc}) and is {effect}."), "status", self.current_round());
                    }
                    let (src_id, sp, tgt_id) = {
                        let f = self.fight.as_ref().unwrap();
                        (f.units[ghast].id.clone(), f.units[ghast].pos, f.units[victim].id.clone())
                    };
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("style".into(), json!("undead"));
                    m.insert("variant".into(), json!("stench"));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(tgt_id));
                    m.insert("outcome".into(), json!("hit"));
                    m.insert("amount".into(), json!(0));
                    m.insert("text".into(), json!(if passed { "RESISTS STENCH" } else { "POISONED" }));
                    m.insert("source".into(), json!({"x": sp.0, "y": sp.1}));
                    m.insert("target".into(), json!({"x": victim_pos.0, "y": victim_pos.1}));
                    let eff = self.push_effect(m);
                    self.pending_effects.push(eff);
                }
                WebEv::IncorporealDamage { target, roll, applied, round } => {
                    if !self.concealed_from_heroes(target) {
                        let name = self.unit_display_name(target);
                        self.push_log(&format!("{name} ends its turn inside a wall and takes {applied} force damage (d10({roll}) = {roll})."), "damage", round);
                    }
                }
                WebEv::DeathSave { u, outcome, round } => self.log_death_save(u, outcome, round),
                WebEv::Died { u, pos, monster } => {
                    if monster {
                        let uid = self.fight.as_ref().unwrap().units[u].id.clone();
                        let mut m = Map::new();
                        m.insert("type".into(), json!("attack"));
                        m.insert("style".into(), json!("touch"));
                        m.insert("variant".into(), json!("dissolve"));
                        m.insert("source_id".into(), json!(uid));
                        m.insert("target_id".into(), json!(uid));
                        m.insert("outcome".into(), json!("hit"));
                        m.insert("amount".into(), json!(0));
                        m.insert("text".into(), json!(" "));
                        m.insert("source".into(), json!({"x": pos.0, "y": pos.1}));
                        m.insert("target".into(), json!({"x": pos.0, "y": pos.1}));
                        let eff = self.push_effect(m);
                        self.pending_effects.push(eff);
                    }
                    let r = self.current_round();
                    let name = self.unit_display_name(u).to_string();
                    self.push_log(&format!("{name} falls dead."), "end", r);
                }
                WebEv::TurnEnded { u, reason } => {
                    let r = self.current_round();
                    let name = self.unit_display_name(u).to_string();
                    self.push_log(&format!("{name} recovers from being turned ({reason})."), "info", r);
                }
                _ => {}
            }
        }
    }

    fn effect_style_for(&self, action_src: usize, act: &Act, ev_src: usize, attack_name: &str, spell_style: Option<&str>, ranged_weapon: bool) -> &'static str {
        let own_spell = action_src == ev_src
            && matches!(act, Act::Spell(_) | Act::DragonsBreathExhale | Act::SpiritualWeaponAttack { .. } | Act::DivineSpark { .. });
        if !own_spell {
            match attack_name {
                "rotting_fist" => return "rotting_fist",
                "dreadful_glare" => return "dreadful_glare",
                _ => {}
            }
        }
        if own_spell {
            let key = match act {
                Act::Spell(c) => c.spell.key(),
                Act::DragonsBreathExhale => "dragons_breath_exhale",
                Act::SpiritualWeaponAttack { .. } => "spiritual_weapon_attack",
                Act::DivineSpark { .. } => "divine_spark",
                _ => "",
            };
            return match key {
                "firebolt" => "firebolt",
                "scorching_ray" => "scorching_ray",
                "magic_missile" => "magic_missile",
                "sorcerous_burst" => "sorcerous_burst",
                "sacred_flame" => "sacred_flame",
                "guiding_bolt" => "guiding_bolt",
                "divine_spark" => "divine_spark",
                "burning_hands" => "burning_hands",
                "thunderwave" => "thunderwave",
                "shatter" => "shatter",
                "acid_splash" => "acid_splash",
                "dragons_breath_exhale" => "dragons_breath",
                "chromatic_orb" => "chromatic_orb",
                "ray_of_frost" => "ray_of_frost",
                "spiritual_weapon" | "spiritual_weapon_attack" => "spiritual_weapon",
                "command" => "command",
                _ => "generic",
            };
        }
        match attack_name {
            "life_drain" => "life_drain",
            "necrotic_sword" | "necrotic_bow" => "necrotic",
            "draining_swipe" => "draining_swipe",
            "burning_hands" => "burning_hands",
            "thunderwave" => "thunderwave",
            "shatter" => "shatter",
            "acid_splash" => "acid_splash",
            "sacred_flame" => "sacred_flame",
            "guiding_bolt" => "guiding_bolt",
            "chromatic_orb" => "chromatic_orb",
            _ => {
                if let Some(s) = spell_style {
                    match s {
                        "spiritual_weapon" => "spiritual_weapon",
                        _ => if ranged_weapon { "arrow" } else { "slash" },
                    }
                } else if ranged_weapon {
                    "arrow"
                } else {
                    "slash"
                }
            }
        }
    }

    fn action_area_info(&self, src: usize, act: &Act, exhale_aim: Option<Pos>) -> Option<(Pos, Vec<[i32; 2]>)> {
        let f = self.fight.as_ref()?;
        let origin = f.units[src].pos;
        match act {
            Act::DragonsBreathExhale => {
                let aim = exhale_aim?;
                let sq = f.squares_in_cone(origin, aim, 3, true);
                if sq.is_empty() {
                    None
                } else {
                    Some((aim, sq.into_iter().map(|(x, y)| [x, y]).collect()))
                }
            }
            Act::Spell(c) => {
                let p = c.point?;
                let sq = match c.spell {
                    SpellId::BurningHands => f.squares_in_cone(origin, p, 3, true),
                    SpellId::Thunderwave => f.cube_squares(origin, p, 3),
                    SpellId::AcidSplash => f.squares_in_radius(p, 5, true),
                    SpellId::Shatter => f.squares_in_radius(p, 10, true),
                    _ => return None,
                };
                if sq.is_empty() {
                    None
                } else {
                    Some((p, sq.into_iter().map(|(x, y)| [x, y]).collect()))
                }
            }
            _ => None,
        }
    }

    fn process_action_events(
        &mut self,
        action_src: usize,
        act: &Act,
        exhale_aim: Option<Pos>,
        evs: Vec<WebEv>,
    ) -> (Vec<Value>, Option<usize>) {
        let round = self.current_round();
        let mut moves = Vec::new();
        let mut blind_hit_target = None;
        let mut last_hit_effect_id: HashMap<usize, i64> = HashMap::new();
        let mut area_attached = false;
        let area_data = self.action_area_info(action_src, act, exhale_aim);

        // Action-level chronicle events (`dodge`, `dash`, `stand`)
        match act {
            Act::Dash => {
                let who = self.unit_display_name(action_src).to_string();
                self.push_log(&format!("{who} uses Dash."), "info", round);
            }
            Act::Dodge => {
                let who = self.unit_display_name(action_src).to_string();
                self.push_log(&format!("{who} uses Dodge."), "info", round);
            }
            Act::Stand => {
                let who = self.unit_display_name(action_src).to_string();
                self.push_log(&format!("{who} stands up."), "info", round);
            }
            _ => {}
        }

        // Magic Missile's darts strike simultaneously. Show every dart before a resulting fall.
        let evs = if self.replay_version >= 6 && matches!(act, Act::Spell(c) if c.spell == SpellId::MagicMissile) {
            let (mut darts, consequences): (Vec<_>, Vec<_>) = evs.into_iter().partition(|e|
                !matches!(e, WebEv::Died { .. } | WebEv::Unconscious { .. } | WebEv::DeathSave { .. }));
            darts.extend(consequences);
            darts
        } else { evs };
        for ev in evs {
            match ev {
                WebEv::RageEnded { target } => {
                    if !self.concealed_from_heroes(target) {
                        let who = self.unit_display_name(target);
                        self.push_log(&format!("{who}’s Rage ends."), "status", self.current_round());
                    }
                }
                WebEv::HiddenFound { target } => {
                    let who = self.unit_display_name(target);
                    self.push_log(&format!("{who} is spotted and loses Hidden."), "status", round);
                }
                WebEv::HideResult { actor, total, seen } if self.replay_version >= 6 => {
                    let who = self.unit_display_name(actor);
                    let result = if seen { "an enemy can see the attempt" } else if total < 15 { "the check falls short" } else { "the creature is hidden" };
                    self.push_log(&format!("{who} attempts to hide (Stealth {total} vs DC 15), and {result}."), "status", round);
                }
                WebEv::SapApplied { source, target } if self.replay_version >= 6 => {
                    let name = self.unit_display_name(target);
                    let who = self.unit_display_name(source);
                    self.push_log(&format!("{who}'s Sap gives {name} Disadvantage on its next attack roll before {who}'s next turn."), "status", round);
                }
                WebEv::EmpoweredReroll { caster, sides, old, new } if self.replay_version >= 6 => {
                    let who = self.unit_display_name(caster);
                    self.push_log(&format!("{who} uses Empowered Spell to reroll a d{sides} from {old} to {new}."), "spell", round);
                }
                WebEv::Redirected { boss, ally } if self.replay_version >= 3 => {
                    let text = format!("{} uses Redirect Attack. {} becomes the target.",
                                       self.unit_display_name(boss), self.unit_display_name(ally));
                    self.push_log(&text, "info", round);
                }
                WebEv::BlindHitTarget { target } => {
                    blind_hit_target = Some(target);
                }
                WebEv::BlindMiss { src, src_pos, square, attack_name, ranged_weapon, atk_roll_fmt }
                    if self.replay_version >= 19 =>
                {
                    let src_name = self.unit_display_name(src).to_string();
                    let pretty_atk = attack_name.replace('_', " ");
                    let cell = cell_label(square);
                    let check = atk_roll_fmt.as_deref().map(|r| format!(" (attack {r})")).unwrap_or_default();
                    self.push_log(&format!("{src_name}: {pretty_atk} misses at {cell}{check}."), "miss", round);
                    let style = self.effect_style_for(action_src, act, src, attack_name, None, ranged_weapon);
                    let src_id = self.fight.as_ref().unwrap().units[src].id.clone();
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(null));
                    m.insert("style".into(), json!(style));
                    m.insert("outcome".into(), json!("miss"));
                    m.insert("amount".into(), json!(0));
                    m.insert("text".into(), json!("MISS"));
                    m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    m.insert("target".into(), json!({"x": square.0, "y": square.1}));
                    m.insert("attack".into(), json!(attack_name));
                    self.push_effect(m);
                }
                WebEv::SavageRoll { source, sides, kept, discarded } => {
                    let who = self.unit_display_name(source);
                    let show = |dice: &[i32]| crate::web_events::fmt_dice_roll(sides, dice, 0, false, dice.iter().sum());
                    self.push_log(&format!("{who} uses Savage Attacker. Kept {}, discarded {}.", show(&kept), show(&discarded)), "info", round);
                }
                WebEv::LifeDrainMaximum { target, before, after } => {
                    let who = self.unit_display_name(target);
                    self.push_log(&format!("Life Drain reduces {who}'s maximum HP from {before} to {after}."), "status", round);
                }
                WebEv::RayAtCorpse { src, target } => {
                    let caster = self.unit_display_name(src);
                    let name = self.unit_display_name(target);
                    self.push_log(&format!("{caster}'s next Scorching Ray strikes {name}, who is already dead."), "info", round);
                }
                WebEv::FirstAid { src, tgt, src_pos, tgt_pos, roll_fmt, dc, success } => {
                    let who = self.unit_display_name(src).to_string();
                    let ally = self.unit_display_name(tgt).to_string();
                    let (src_id, tgt_id) = {
                        let f = self.fight.as_ref().unwrap();
                        (f.units[src].id.clone(), f.units[tgt].id.clone())
                    };
                    if success {
                        self.push_log(&format!("{who} stabilizes {ally} with First Aid (Medicine {roll_fmt} vs DC {dc})."), "status", round);
                    } else {
                        self.push_log(&format!("{who} fails to stabilize {ally} with First Aid (Medicine {roll_fmt} vs DC {dc})."), "miss", round);
                    }
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("style".into(), json!(if success { "heal" } else { "touch" }));
                    m.insert("variant".into(), json!("first_aid"));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(tgt_id));
                    m.insert("outcome".into(), json!(if success { "hit" } else { "miss" }));
                    m.insert("amount".into(), json!(0));
                    m.insert("text".into(), json!(if success { "STABILIZED" } else { "FIRST AID FAILED" }));
                    m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    m.insert("target".into(), json!({"x": tgt_pos.0, "y": tgt_pos.1}));
                    self.push_effect(m);
                }
                WebEv::EscapeGrapple { src, grappler, src_pos, grappler_pos: _, skill, roll_fmt, dc_text, success } => {
                    let who = self.unit_display_name(src).to_string();
                    let foe = self.unit_display_name(grappler).to_string();
                    let src_id = self.fight.as_ref().unwrap().units[src].id.clone();
                    if success {
                        self.push_log(&format!("{who} escapes {foe}'s grapple ({skill} {roll_fmt} vs {dc_text})."), "status", round);
                    } else {
                        self.push_log(&format!("{who} fails to escape {foe}'s grapple ({skill} {roll_fmt} vs {dc_text})."), "miss", round);
                    }
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("style".into(), json!(if success { "buff" } else { "touch" }));
                    m.insert("variant".into(), json!("escape_grapple"));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(src_id));
                    m.insert("outcome".into(), json!(if success { "hit" } else { "miss" }));
                    m.insert("amount".into(), json!(0));
                    m.insert("text".into(), json!(if success { "ESCAPED" } else { "GRAPPLED" }));
                    m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    m.insert("target".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    self.push_effect(m);
                }
                WebEv::BreakFree { src, src_pos, roll_fmt, dc, success } => {
                    let who = self.unit_display_name(src).to_string();
                    let src_id = self.fight.as_ref().unwrap().units[src].id.clone();
                    if success {
                        self.push_log(&format!("{who} breaks free from restraint (Athletics {roll_fmt} vs DC {dc})."), "status", round);
                    } else {
                        self.push_log(&format!("{who} fails to break free from restraint (Athletics {roll_fmt} vs DC {dc})."), "miss", round);
                    }
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("style".into(), json!(if success { "buff" } else { "touch" }));
                    m.insert("variant".into(), json!("break_free"));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(src_id));
                    m.insert("outcome".into(), json!(if success { "hit" } else { "miss" }));
                    m.insert("amount".into(), json!(0));
                    m.insert("text".into(), json!(if success { "BROKE FREE" } else { "RESTRAINED" }));
                    m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    m.insert("target".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    self.push_effect(m);
                }
                WebEv::AttackOutcome {
                    src,
                    tgt,
                    src_pos,
                    tgt_pos,
                    attack_name,
                    spell_style,
                    ranged_weapon,
                    hit,
                    crit,
                    reaction,
                    save,
                    dt,
                    raw_damage,
                    applied_damage,
                    atk_roll_fmt,
                    dmg_roll_fmt,
                } => {
                    let src_name = self.unit_display_name(src).to_string();
                    let tgt_name = tgt.map(|t| self.unit_display_name(t).to_string()).unwrap_or_else(|| "creature".to_string());
                    let pretty_atk = if self.replay_version >= 7 && spell_style.is_some() {
                        present_text::spell_display_name(spell_style.unwrap())
                    } else { attack_name.replace('_', " ") };
                    let check = atk_roll_fmt.as_deref().map(|r| format!(" (attack {r})")).unwrap_or_default();
                    let current_text = self.replay_version >= 4;
                    if let Some(result) = save.filter(|_| current_text) {
                        let verb = match result {
                            SaveOutcome::Made => "makes its save",
                            SaveOutcome::Failed => "fails its save",
                            SaveOutcome::AutomaticFailure => "automatically fails its save",
                        };
                        let name = present_text::title_words(attack_name.trim_start_matches("spell."));
                        let damage = dt.map(|ty| {
                            let roll = dmg_roll_fmt.as_deref().map(|r| format!(" ({r})")).unwrap_or_default();
                            format!(" and takes {applied_damage} {} damage{roll}", ty.name())
                        }).unwrap_or_default();
                        let potent = self.replay_version >= 15 && matches!(result, SaveOutcome::Made)
                            && matches!(spell_style, Some("acid_splash" | "sacred_flame"))
                            && self.fight.as_ref().unwrap().units[src].t.potent_cantrip && dt.is_some();
                        let feature = if potent { " (Potent Cantrip)" } else { "" };
                        self.push_log(&format!("{tgt_name} {verb} against {src_name}'s {name}{damage}{feature}."), if hit { "hit" } else { "miss" }, round);
                    } else if !hit && dt.is_some() && self.replay_version >= 7 {
                        let damage_type = dt.unwrap().name();
                        let roll = dmg_roll_fmt.as_deref().unwrap_or("");
                        self.push_log(&format!("{src_name}: {pretty_atk} misses {tgt_name}{check}. Potent Cantrip deals {applied_damage} {damage_type} damage ({roll})."), "miss", round);
                    } else if hit {
                        let dt_str = dt.map_or("", |d| d.name());
                        let dmg_str = dmg_roll_fmt.as_deref().unwrap_or("");
                        let amount = if current_text { applied_damage } else { raw_damage };
                        let verb = if crit && self.replay_version >= 15 { "critically hits" } else { "hits" };
                        self.push_log(
                            &format!("{src_name}: {pretty_atk} {verb} {tgt_name}{check}; {dmg_str} → {amount} {dt_str} damage."),
                            "hit",
                            round,
                        );
                    } else if self.replay_version >= 3 && attack_name == "aid" {
                        let reason = if tgt.is_some_and(|t| self.fight.as_ref().unwrap().aid_effect(t).is_some()) {
                            "already has Aid of equal or greater strength"
                        } else { "is unaffected by Aid" };
                        self.push_log(&format!("{tgt_name} {reason}."), "info", round);
                    } else {
                        self.push_log(&format!("{src_name}: {pretty_atk} misses {tgt_name}{check}."), "miss", round);
                    }

                    if let Some(t) = tgt {
                        let style = self.effect_style_for(action_src, act, src, attack_name, spell_style, ranged_weapon);
                        let (src_id, tgt_id) = {
                            let f = self.fight.as_ref().unwrap();
                            (f.units[src].id.clone(), f.units[t].id.clone())
                        };
                        let mut m = Map::new();
                        m.insert("type".into(), json!("attack"));
                        m.insert("source_id".into(), json!(src_id));
                        m.insert("target_id".into(), json!(tgt_id));
                        m.insert("style".into(), json!(style));
                        m.insert("outcome".into(), json!(if hit { "hit" } else { "miss" }));
                        m.insert("amount".into(), json!(applied_damage.max(0)));
                        m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                        m.insert("target".into(), json!({"x": tgt_pos.0, "y": tgt_pos.1}));
                        m.insert("damage_type".into(), json!(dt.map_or("", |d| d.name())));
                        m.insert("attack".into(), json!(attack_name));
                        if style == "command" {
                            m.insert("text".into(), json!(if hit { "GROVEL" } else { "RESISTS" }));
                        }
                        if !area_attached {
                            if let Some((aim, ref cells)) = area_data {
                                area_attached = true;
                                m.insert("area".into(), json!({"aim": [aim.0, aim.1], "cells": cells}));
                            }
                        }
                        if hit {
                            m.insert("crit".into(), json!(crit));
                        }
                        if reaction {
                            m.insert("reaction".into(), json!(true));
                        }
                        if let Some(result) = save.filter(|s| current_text || *s != SaveOutcome::AutomaticFailure) {
                            // Earlier web recordings used the presence of damage to infer a failed save.
                            let made = if current_text { result == SaveOutcome::Made } else { !hit };
                            m.insert("save".into(), json!(if made { "made" } else { "failed" }));
                            if !hit && style == "dreadful_glare" {
                                m.insert("text".into(), json!("RESISTS"));
                            }
                        }
                        let created = self.push_effect(m);
                        if hit {
                            if let Some(eid) = created.get("id").and_then(Value::as_i64) {
                                last_hit_effect_id.insert(t, eid);
                            }
                        }
                    }
                }
                WebEv::RiderDamage { tgt, applied_damage, dt, plain_roll, advantage_roll } => {
                    if self.replay_version >= 4 {
                        let name = self.unit_display_name(tgt);
                        let rider = match (advantage_roll, plain_roll) {
                            (Some(roll), _) => format!(" from the advantage rider ({roll})"),
                            (_, Some(roll)) => format!(" ({roll})"),
                            _ => String::new(),
                        };
                        self.push_log(&format!("{name} takes {applied_damage} additional {} damage{rider}.", dt.name()), "hit", round);
                    }
                    if let Some(&eid) = last_hit_effect_id.get(&tgt) {
                        for eff in self.effects.iter_mut().rev() {
                            if eff.get("id").and_then(Value::as_i64) == Some(eid) {
                                if let Some(obj) = eff.as_object_mut() {
                                    let prev = obj.get("rider").and_then(Value::as_i64).unwrap_or(0);
                                    obj.insert("rider".into(), json!(prev + applied_damage.max(0) as i64));
                                    let types = obj.entry("rider_types").or_insert_with(|| json!([]));
                                    if let Some(arr) = types.as_array_mut() {
                                        arr.push(json!(dt.name()));
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                WebEv::SanctuarySave { attacker, warded, total, dc } => {
                    if self.replay_version >= 5 {
                        let name = self.unit_display_name(attacker);
                        let target = self.unit_display_name(warded);
                        let result = if total >= dc { "makes" } else { "fails" };
                        let effect = if total >= dc { "The attack proceeds" } else { "The attack is lost" };
                        self.push_log(&format!("{name} {result} the Wisdom save against Sanctuary on {target} ({total} vs DC {dc}). {effect}."), "status", round);
                    }
                }
                WebEv::ShieldCast { u, pos, slot_level, attacker, attack_name, total, ac } => {
                    if self.replay_version >= 7 {
                        let name = self.unit_display_name(u);
                        let source = self.unit_display_name(attacker);
                        let attack = present_text::title_words(attack_name);
                        self.push_log(&format!("{name} casts Shield against {source}'s {attack} (attack {total} vs AC {ac}), spending a level {slot_level} slot. AC rises to {}.", ac + 5), "status", round);
                    } else if self.replay_version >= 5 {
                        let name = self.unit_display_name(u);
                        self.push_log(&format!("{name} casts Shield as a reaction, spending a level {slot_level} slot for +5 AC."), "status", round);
                    }
                    let uid = self.fight.as_ref().unwrap().units[u].id.clone();
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("style".into(), json!("touch"));
                    m.insert("variant".into(), json!("shield"));
                    m.insert("source_id".into(), json!(uid));
                    m.insert("target_id".into(), json!(uid));
                    m.insert("outcome".into(), json!("hit"));
                    m.insert("amount".into(), json!(0));
                    m.insert("text".into(), json!("SHIELD +5 AC"));
                    m.insert("source".into(), json!({"x": pos.0, "y": pos.1}));
                    m.insert("target".into(), json!({"x": pos.0, "y": pos.1}));
                    self.push_effect(m);
                }
                WebEv::DragonsBreathBuff { caster, target, src_pos, tgt_pos } => {
                    let (src_id, tgt_id) = {
                        let f = self.fight.as_ref().unwrap();
                        (f.units[caster].id.clone(), f.units[target].id.clone())
                    };
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("style".into(), json!("dragons_breath"));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(tgt_id));
                    m.insert("outcome".into(), json!("hit"));
                    m.insert("amount".into(), json!(0));
                    m.insert("text".into(), json!("BREATH"));
                    m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    m.insert("target".into(), json!({"x": tgt_pos.0, "y": tgt_pos.1}));
                    self.push_effect(m);
                }
                WebEv::MassiveDamage { target, excess, maximum } if self.replay_version >= 7 => {
                    let name = self.unit_display_name(target);
                    self.push_log(&format!("{name} suffers massive damage ({excess} damage beyond 0 HP, maximum {maximum} HP)."), "damage", round);
                }
                WebEv::ConcentrationReplaced { caster, prior } => {
                    if !self.concealed_from_heroes(caster) {
                        let who = self.unit_display_name(caster);
                        let old = present_text::spell_display_name(prior.key());
                        self.push_log(&format!("{who}’s concentration on {old} ends."), "spell", round);
                    }
                }
                WebEv::HealingBlocked { target } => {
                    if !self.concealed_from_heroes(target) {
                        let who = self.unit_display_name(target);
                        self.push_log(&format!("Mummy Rot prevents {who} from regaining hit points."), "info", round);
                    }
                }
                WebEv::ThunderwavePush { target, from, to } => {
                    if !self.concealed_from_heroes(target) {
                        let who = self.unit_display_name(target);
                        let feet = (from.0 - to.0).abs().max((from.1 - to.1).abs()) * 5;
                        let text = if feet == 0 {
                            format!("Thunderwave cannot push {who} out of [{}, {}].", from.0, from.1)
                        } else {
                            format!("Thunderwave pushes {who} {feet} ft from [{}, {}] to [{}, {}].", from.0, from.1, to.0, to.1)
                        };
                        self.push_log(&text, "spell", round);
                    }
                }
                WebEv::ConcentrationEnded { target, spell } => {
                    let who = self.unit_display_name(target);
                    let name = present_text::spell_display_name(spell.key());
                    self.push_log(&format!("{who} loses concentration on {name} at 0 HP."), "status", round);
                }
                WebEv::ConcentrationSave { target, spell, roll, dc, passed } if self.replay_version >= 7 => {
                    let who = self.unit_display_name(target);
                    let name = present_text::spell_display_name(spell.key());
                    let outcome = if passed { "maintains" } else { "loses" };
                    self.push_log(&format!("{who} {outcome} concentration on {name} (CON save {roll} vs DC {dc})."), "status", round);
                }
                WebEv::OrbLeap { from, to } if self.replay_version >= 7 => {
                    self.push_log(&format!("Chromatic Orb leaps from {} to {}.", self.unit_display_name(from), self.unit_display_name(to)), "spell", round);
                }
                WebEv::Graze { src, tgt, src_pos, tgt_pos, dmg, dt } => {
                    if self.replay_version >= 7 {
                        self.push_log(&format!("{} deals {dmg} {} damage to {} with Graze on the miss.",
                            self.unit_display_name(src), dt.name(), self.unit_display_name(tgt)), "hit", round);
                    }
                    let (src_id, tgt_id) = {
                        let f = self.fight.as_ref().unwrap();
                        (f.units[src].id.clone(), f.units[tgt].id.clone())
                    };
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("style".into(), json!("touch"));
                    m.insert("variant".into(), json!("graze"));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(tgt_id));
                    m.insert("outcome".into(), json!("hit"));
                    m.insert("amount".into(), json!(0));
                    m.insert("text".into(), json!(if dmg > 0 { format!("GRAZE −{dmg}") } else { "GRAZE".to_string() }));
                    m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    m.insert("target".into(), json!({"x": tgt_pos.0, "y": tgt_pos.1}));
                    self.push_effect(m);
                }
                WebEv::SecondWind { u, pos, roll_fmt, healed } => {
                    let who = self.unit_display_name(u).to_string();
                    if self.replay_version >= 9 && self.fight.as_ref().unwrap().units[u].cursed {
                        self.push_log(&format!("{who} uses Second Wind."), "info", round);
                        continue;
                    }
                    self.push_log(&format!("{who} uses Second Wind: {roll_fmt} healing."), "info", round);
                    let uid = self.fight.as_ref().unwrap().units[u].id.clone();
                    let mut m = Map::new();
                    m.insert("type".into(), json!("heal"));
                    m.insert("source_id".into(), json!(uid));
                    m.insert("target_id".into(), json!(uid));
                    m.insert("style".into(), json!("touch"));
                    m.insert("variant".into(), json!("second_wind"));
                    m.insert("outcome".into(), json!("heal"));
                    m.insert("amount".into(), json!(healed.max(0)));
                    m.insert("source".into(), json!({"x": pos.0, "y": pos.1}));
                    m.insert("target".into(), json!({"x": pos.0, "y": pos.1}));
                    self.push_effect(m);
                }
                WebEv::SpellHeal { caster, target, src_pos, tgt_pos, style_key, healed, roll } => {
                    if self.replay_version >= 6 {
                        let name = self.unit_display_name(target);
                        let spell = present_text::title_words(style_key);
                        let roll = roll.map(|r| format!(" ({r})")).unwrap_or_default();
                        self.push_log(&format!("{name} regains {healed} HP from {spell}{roll}."), "spell", round);
                    }
                    let style = match style_key {
                        "divine_spark" => "divine_spark",
                        "cure_wounds" => "cure_wounds",
                        "healing_word" => "healing_word",
                        "preserve_life" => "preserve_life",
                        _ => "heal",
                    };
                    let (src_id, tgt_id) = {
                        let f = self.fight.as_ref().unwrap();
                        (f.units[caster].id.clone(), f.units[target].id.clone())
                    };
                    let mut m = Map::new();
                    m.insert("type".into(), json!("heal"));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(tgt_id));
                    m.insert("style".into(), json!(style));
                    m.insert("outcome".into(), json!("heal"));
                    m.insert("amount".into(), json!(healed.max(0)));
                    m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    m.insert("target".into(), json!({"x": tgt_pos.0, "y": tgt_pos.1}));
                    self.push_effect(m);
                }
                WebEv::TurnUndeadNoTargets { cleric } => {
                    let who = self.unit_display_name(cleric).to_string();
                    self.push_log(&format!("{who} channels divine energy, but no undead are within 30 ft."), "spell", round);
                }
                WebEv::TurnUndeadSave { cleric, target, src_pos, tgt_pos, passed, destroyed, roll_fmt, dc } => {
                    let (src_id, tgt_id) = {
                        let f = self.fight.as_ref().unwrap();
                        (f.units[cleric].id.clone(), f.units[target].id.clone())
                    };
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("style".into(), json!("turn_undead"));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(tgt_id));
                    m.insert("outcome".into(), json!(if passed { "miss" } else { "hit" }));
                    m.insert("amount".into(), json!(0));
                    m.insert("destroyed".into(), json!(destroyed));
                    m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    m.insert("target".into(), json!({"x": tgt_pos.0, "y": tgt_pos.1}));
                    self.push_effect(m);

                    let tname = self.unit_display_name(target).to_string();
                    let outcome = if destroyed {
                        "is destroyed"
                    } else if passed {
                        "resists"
                    } else {
                        "fails the save"
                    };
                    self.push_log(&format!("{tname} {outcome} (WIS save {roll_fmt} vs DC {dc})."), "spell", round);
                }
                WebEv::Turned { target } => {
                    let tname = self.unit_display_name(target).to_string();
                    self.push_log(&format!("{tname} is turned and flees."), "spell", round);
                }
                WebEv::TurnEnded { u, reason } => {
                    let name = self.unit_display_name(u).to_string();
                    self.push_log(&format!("{name} recovers from being turned ({reason})."), "info", round);
                }
                WebEv::UndeadFortitude { u, pos, success, roll, dc } => {
                    if self.replay_version >= 7 {
                        let name = self.unit_display_name(u);
                        let outcome = if success { "succeeds and stays at 1 HP" } else { "fails" };
                        self.push_log(&format!("{name} {outcome} on Undead Fortitude (CON save {roll} vs DC {dc})."), "status", round);
                    }
                    if success {
                        let uid = self.fight.as_ref().unwrap().units[u].id.clone();
                        let mut m = Map::new();
                        m.insert("type".into(), json!("attack"));
                        m.insert("style".into(), json!("undead"));
                        m.insert("variant".into(), json!("fortitude"));
                        m.insert("source_id".into(), json!(uid));
                        m.insert("target_id".into(), json!(uid));
                        m.insert("outcome".into(), json!("hit"));
                        m.insert("amount".into(), json!(0));
                        m.insert("text".into(), json!("UNDEAD FORTITUDE"));
                        m.insert("source".into(), json!({"x": pos.0, "y": pos.1}));
                        m.insert("target".into(), json!({"x": pos.0, "y": pos.1}));
                        self.push_effect(m);
                    }
                    let name = self.unit_display_name(u).to_string();
                    let msg = if success { "keeps it standing at 1 HP" } else { "fails" };
                    self.push_log(&format!("{name}'s Undead Fortitude {msg}."), "info", round);
                }
                WebEv::StrengthDrain { attacker, target, src_pos, tgt_pos, drain, strength_before, died } => {
                    if self.replay_version >= 13 {
                        let source = self.unit_display_name(attacker);
                        let who = self.unit_display_name(target);
                        let remaining = (strength_before - drain).max(0);
                        let text = format!("{source}'s Strength Drain rolls 1d4 = {drain}, reducing {who}'s Strength from {strength_before} to {remaining}.");
                        self.push_log(&text, "status", round);
                    }
                    let (src_id, tgt_id) = {
                        let f = self.fight.as_ref().unwrap();
                        (f.units[attacker].id.clone(), f.units[target].id.clone())
                    };
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("style".into(), json!("undead"));
                    m.insert("variant".into(), json!("strength_drain"));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(tgt_id));
                    m.insert("outcome".into(), json!("hit"));
                    m.insert("amount".into(), json!(0));
                    m.insert("text".into(), json!(if died { "STR 0".to_string() } else { format!("STR −{drain}") }));
                    m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                    m.insert("target".into(), json!({"x": tgt_pos.0, "y": tgt_pos.1}));
                    self.push_effect(m);
                }
                WebEv::Died { u, pos, monster } => {
                    if monster {
                        let uid = self.fight.as_ref().unwrap().units[u].id.clone();
                        let mut m = Map::new();
                        m.insert("type".into(), json!("attack"));
                        m.insert("style".into(), json!("touch"));
                        m.insert("variant".into(), json!("dissolve"));
                        m.insert("source_id".into(), json!(uid));
                        m.insert("target_id".into(), json!(uid));
                        m.insert("outcome".into(), json!("hit"));
                        m.insert("amount".into(), json!(0));
                        m.insert("text".into(), json!(" "));
                        m.insert("source".into(), json!({"x": pos.0, "y": pos.1}));
                        m.insert("target".into(), json!({"x": pos.0, "y": pos.1}));
                        self.push_effect(m);
                    }
                    let name = self.unit_display_name(u).to_string();
                    self.push_log(&format!("{name} falls dead."), "end", round);
                }
                WebEv::DeathSave { u, outcome, .. } => self.log_death_save(u, outcome, round),
                WebEv::Unconscious { u } => {
                    let name = self.unit_display_name(u).to_string();
                    self.push_log(&format!("{name} falls unconscious."), "end", round);
                }
                WebEv::MoveExecuted { u, path } => {
                    if self.concealed_from_heroes(u) { continue; }
                    let cells: Vec<[i32; 2]> = path.iter().map(|&(x, y)| [x, y]).collect();
                    if cells.len() >= 2 && cells[0] != *cells.last().unwrap() {
                        let name = self.unit_display_name(u).to_string();
                        let a = cells[0];
                        let b = *cells.last().unwrap();
                        if self.replay_version >= 7 && !self.fight.as_ref().unwrap().units[u].conscious() {
                            self.push_log(&format!("{name}'s movement ended at [{}, {}].", b[0], b[1]), "info", round);
                        } else {
                            self.push_log(&format!("{name} moves from [{}, {}] to [{}, {}].", a[0], a[1], b[0], b[1]), "info", round);
                        }
                    }
                    let uid = self.fight.as_ref().unwrap().units[u].id.clone();
                    moves.push(json!({"source_id": uid, "path": cells}));
                }
                _ => {}
            }
        }
        (moves, blind_hit_target)
    }

    fn record_action(
        &mut self,
        src: usize,
        act: &Act,
        exhale_aim: Option<Pos>,
        blind_hit_target: Option<usize>,
        before: Value,
        first_effect: i64,
        moves: Vec<Value>,
        opportunity: bool,
    ) {
        // 1. `_glare_effects`: failed save on a `save_attack` with `no_damage` (Dreadful Glare)
        if let Act::Attack { atk, target, .. } = *act {
            let (is_glare, atk_name, sp, tp, frightened, src_id, tgt_id, t_display) = {
                let f = self.fight.as_ref().unwrap();
                let def = &f.units[src].t.attacks[atk];
                (
                    def.save_attack.is_some() && def.no_damage,
                    def.name,
                    f.units[src].pos,
                    f.units[target].pos,
                    f.units[target].has(St::Frightened),
                    f.units[src].id.clone(),
                    f.units[target].id.clone(),
                    self.unit_display_name(target).to_string(),
                )
            };
            if is_glare {
                let already_shown = self.effects.iter().any(|e| {
                    e.get("id").and_then(Value::as_i64).unwrap_or(0) > first_effect
                        && e.get("attack").and_then(Value::as_str) == Some(atk_name)
                        && e.get("target_id").and_then(Value::as_str) == Some(tgt_id.as_str())
                });
                if !already_shown {
                    let style = if atk_name == "dreadful_glare" { "dreadful_glare" } else { "generic" };
                    let mut m = Map::new();
                    m.insert("type".into(), json!("attack"));
                    m.insert("style".into(), json!(style));
                    m.insert("attack".into(), json!(atk_name));
                    m.insert("outcome".into(), json!("hit"));
                    m.insert("amount".into(), json!(0));
                    m.insert("save".into(), json!("failed"));
                    m.insert("text".into(), json!(if frightened { "FRIGHTENED" } else { "SAVE FAILED" }));
                    m.insert("source_id".into(), json!(src_id));
                    m.insert("target_id".into(), json!(tgt_id));
                    m.insert("source".into(), json!({"x": sp.0, "y": sp.1}));
                    m.insert("target".into(), json!({"x": tp.0, "y": tp.1}));
                    self.push_effect(m);
                    let r = self.current_round();
                    let extra = if frightened { " and is frightened" } else { "" };
                    self.push_log(
                        &format!("{t_display} fails the save against {}{extra}.", atk_name.replace('_', " ")),
                        "hit",
                        r,
                    );
                }
            }
        }

        // 2. `_flourish` (`UndeadWebArena._flourish`)
        self.emit_flourishes(src, act, first_effect);

        // 3. `_ff_flourish` (`FFArena._ff_flourish`)
        self.emit_ff_flourishes(src, act);

        // 4. `_condition_flourishes` (`UndeadWebArena._condition_flourishes`)
        self.emit_condition_flourishes(&before);

        // 5. Assemble record (`Arena._record_action` + `FFArena._record_action`)
        self.action_counter += 1;
        let mut rec_effects: Vec<Value> = self
            .effects
            .iter()
            .filter(|e| e.get("id").and_then(Value::as_i64).unwrap_or(0) > first_effect)
            .cloned()
            .collect();
        if !self.pending_effects.is_empty() {
            let mut combined = std::mem::take(&mut self.pending_effects);
            combined.extend(rec_effects);
            rec_effects = combined;
        }
        if opportunity {
            for eff in &mut rec_effects {
                if let Some(obj) = eff.as_object_mut() {
                    obj.insert("opportunity".into(), json!(true));
                }
            }
        }

        let descriptor = self.describe_candidate(src, act, exhale_aim, blind_hit_target);
        let draws = self.drain_record_draws();
        let src_id = self.fight.as_ref().unwrap().units[src].id.clone();
        let after = self.presentation_snapshot();

        let mut rec = Map::new();
        rec.insert("id".into(), json!(self.action_counter));
        rec.insert("revision".into(), json!(self.revision + 1));
        rec.insert("kind".into(), json!(act.kind()));
        rec.insert("source_id".into(), json!(src_id));
        rec.insert("effects".into(), json!(rec_effects));
        rec.insert("moves".into(), json!(moves));
        rec.insert("before".into(), before);
        rec.insert("after".into(), after);
        rec.insert("descriptor".into(), json!(descriptor));
        rec.insert("draws".into(), json!(draws));
        if opportunity {
            rec.insert("opportunity".into(), json!(true));
        }
        if self.timeline.len() >= MAX_TIMELINE {
            self.timeline.pop_front();
        }
        self.timeline.push_back(Value::Object(rec));
    }

    fn describe_candidate(&self, src: usize, act: &Act, exhale_aim: Option<Pos>, blind_hit_target: Option<usize>) -> String {
        if let (Act::DragonsBreathExhale, Some((x, y))) = (act, exhale_aim) {
            return format!("dragons_breath_exhale:@{x},{y}");
        }
        if let (Act::BlindAttack { atk, .. }, Some(tgt)) = (act, blind_hit_target) {
            let f = self.fight.as_ref().unwrap();
            let def = &f.units[src].t.attacks[*atk];
            let thrown = if def.thrown { ":thrown" } else { "" };
            return format!("attack:{}{thrown}:>{}", def.name, f.units[tgt].id);
        }
        self.fight.as_ref().unwrap().describe(src, act)
    }

    fn emit_flourishes(&mut self, src: usize, act: &Act, first_effect: i64) {
        let mut buff_list: Vec<(usize, &'static str, String)> = Vec::new();
        if let Act::Spell(c) = act {
            let buff_txt = match c.spell {
                SpellId::Bless => Some(("bless", "BLESSED")),
                SpellId::Aid => Some(("aid", "AID +5")),
                SpellId::ShieldOfFaith => Some(("shield_of_faith", "SHIELDED")),
                SpellId::Sanctuary => Some(("sanctuary", "SANCTUARY")),
                SpellId::ProtectionFromEvilAndGood => Some(("protection_from_evil_and_good", "WARDED")),
                SpellId::Blur => Some(("blur", "BLUR")),
                SpellId::LesserRestoration => Some(("lesser_restoration", "CLEANSED")),
                _ => None,
            };
            if let Some((variant, text)) = buff_txt {
                let tgts: Vec<usize> = if c.targets.is_empty() { vec![src] } else { c.targets.clone() };
                for t in tgts {
                    buff_list.push((t, variant, text.to_string()));
                }
            }
            if c.spell == SpellId::Command {
                let (src_id, sp) = {
                    let f = self.fight.as_ref().unwrap();
                    (f.units[src].id.clone(), f.units[src].pos)
                };
                for &t in &c.targets {
                    let (tgt_id, tp) = {
                        let f = self.fight.as_ref().unwrap();
                        (f.units[t].id.clone(), f.units[t].pos)
                    };
                    let shown = self.effects.iter().any(|e| {
                        e.get("id").and_then(Value::as_i64).unwrap_or(0) > first_effect
                            && e.get("style").and_then(Value::as_str) == Some("command")
                            && e.get("target_id").and_then(Value::as_str) == Some(tgt_id.as_str())
                    });
                    if !shown {
                        if self.replay_version >= 4 {
                            let caster = self.unit_display_name(src);
                            let target = self.unit_display_name(t);
                            self.push_log(&format!("{target} fails its save against {caster}'s Command."), "spell", self.current_round());
                        }
                        let mut m = Map::new();
                        m.insert("type".into(), json!("attack"));
                        m.insert("style".into(), json!("command"));
                        m.insert("outcome".into(), json!("hit"));
                        m.insert("amount".into(), json!(0));
                        m.insert("text".into(), json!("GROVEL"));
                        m.insert("source_id".into(), json!(src_id));
                        m.insert("target_id".into(), json!(tgt_id));
                        m.insert("source".into(), json!({"x": sp.0, "y": sp.1}));
                        m.insert("target".into(), json!({"x": tp.0, "y": tp.1}));
                        self.push_effect(m);
                    }
                }
            }
            if let Some(mm) = c.mm {
                let txt = mm.key().replace("_spell", "").to_uppercase();
                buff_list.push((src, "metamagic", txt));
            }
        }
        if matches!(act, Act::InnateSorcery) {
            buff_list.push((src, "innate_sorcery", "INNATE SORCERY".to_string()));
        }
        if matches!(act, Act::ActionSurge) {
            buff_list.push((src, "action_surge", "ACTION SURGE".to_string()));
        }
        if matches!(act, Act::Move(_)) && self.fight.as_ref().unwrap().is_turned(src) {
            let cleric = self.nearest_cleric(src);
            let (cid, cp, tid, tp) = {
                let f = self.fight.as_ref().unwrap();
                (f.units[cleric].id.clone(), f.units[cleric].pos, f.units[src].id.clone(), f.units[src].pos)
            };
            let mut m = Map::new();
            m.insert("type".into(), json!("attack"));
            m.insert("style".into(), json!("touch"));
            m.insert("variant".into(), json!("flee"));
            m.insert("source_id".into(), json!(cid));
            m.insert("target_id".into(), json!(tid));
            m.insert("outcome".into(), json!("hit"));
            m.insert("amount".into(), json!(0));
            m.insert("text".into(), json!("FLEES"));
            m.insert("source".into(), json!({"x": cp.0, "y": cp.1}));
            m.insert("target".into(), json!({"x": tp.0, "y": tp.1}));
            self.push_effect(m);
        }

        let (src_id, sp) = {
            let f = self.fight.as_ref().unwrap();
            (f.units[src].id.clone(), f.units[src].pos)
        };
        for (entity, variant, text) in buff_list {
            let (tgt_id, tp) = {
                let f = self.fight.as_ref().unwrap();
                (f.units[entity].id.clone(), f.units[entity].pos)
            };
            let mut m = Map::new();
            m.insert("type".into(), json!("attack"));
            m.insert("style".into(), json!("buff"));
            m.insert("variant".into(), json!(variant));
            m.insert("source_id".into(), json!(src_id));
            m.insert("target_id".into(), json!(tgt_id));
            m.insert("outcome".into(), json!("hit"));
            m.insert("amount".into(), json!(0));
            m.insert("text".into(), json!(text));
            m.insert("source".into(), json!({"x": sp.0, "y": sp.1}));
            m.insert("target".into(), json!({"x": tp.0, "y": tp.1}));
            self.push_effect(m);
        }
    }

    fn emit_ff_flourishes(&mut self, src: usize, act: &Act) {
        let mut items: Vec<(usize, &'static str, &'static str)> = Vec::new();
        if let Act::Spell(c) = act {
            if c.spell == SpellId::MageArmor {
                let tgts: Vec<usize> = if c.targets.is_empty() { vec![src] } else { c.targets.clone() };
                for t in tgts {
                    items.push((t, "mage_armor", "MAGE ARMOR"));
                }
            }
            if self.replay_version >= 19 && c.spell == SpellId::Invisibility {
                let tgts: Vec<usize> = if c.targets.is_empty() { vec![src] } else { c.targets.clone() };
                for t in tgts {
                    if !self.concealed_from_heroes(t) {
                        let who = self.unit_display_name(t).to_string();
                        self.push_log(&format!("{who} becomes invisible."), "status", self.current_round());
                        items.push((t, "invisibility", "INVISIBLE"));
                    }
                }
            }
        }
        match act {
            Act::Dodge => items.push((src, "dodge", "DODGE")),
            Act::Dash => items.push((src, "dash", "DASH")),
            Act::Disengage => items.push((src, "disengage", "DISENGAGE")),
            Act::DisengageBonus => items.push((src, "disengage_bonus", "DISENGAGE")),
            Act::HideBonus => items.push((src, "hide_bonus", "HIDE")),
            Act::Stand => items.push((src, "stand", "STAND")),
            Act::Rage => items.push((src, "rage", "RAGE")),
            Act::ExtendRage => items.push((src, "extend_rage", "RAGE")),
            Act::RecklessAttack => items.push((src, "reckless_attack", "RECKLESS")),
            Act::NpcVanish if self.replay_version >= 19 => {
                if !self.concealed_from_heroes(src) {
                    let who = self.unit_display_name(src).to_string();
                    self.push_log(&format!("{who} vanishes from sight."), "status", self.current_round());
                    items.push((src, "invisibility", "INVISIBLE"));
                }
            }
            _ => {}
        }
        let (src_id, sp) = {
            let f = self.fight.as_ref().unwrap();
            (f.units[src].id.clone(), f.units[src].pos)
        };
        for (entity, variant, text) in items {
            let (tgt_id, tp) = {
                let f = self.fight.as_ref().unwrap();
                (f.units[entity].id.clone(), f.units[entity].pos)
            };
            let mut m = Map::new();
            m.insert("type".into(), json!("attack"));
            m.insert("style".into(), json!("buff"));
            m.insert("variant".into(), json!(variant));
            m.insert("source_id".into(), json!(src_id));
            m.insert("target_id".into(), json!(tgt_id));
            m.insert("outcome".into(), json!("hit"));
            m.insert("amount".into(), json!(0));
            m.insert("text".into(), json!(text));
            m.insert("source".into(), json!({"x": sp.0, "y": sp.1}));
            m.insert("target".into(), json!({"x": tp.0, "y": tp.1}));
            self.push_effect(m);
        }
    }

    fn emit_condition_flourishes(&mut self, before: &Value) {
        let mut had: HashMap<String, HashSet<String>> = HashMap::new();
        if let Some(arr) = before.get("units").and_then(Value::as_array) {
            for u in arr {
                if let Some(id) = u.get("id").and_then(Value::as_str) {
                    let set: HashSet<String> = u
                        .get("conditions")
                        .and_then(Value::as_array)
                        .map(|cs| cs.iter().filter_map(Value::as_str).map(str::to_string).collect())
                        .unwrap_or_default();
                    had.insert(id.to_string(), set);
                }
            }
        }
        let order: Vec<usize> = self.fight.as_ref().unwrap().order.clone();
        for u in order {
            let (uid, pos, is_paralyzed) = {
                let f = self.fight.as_ref().unwrap();
                (f.units[u].id.clone(), f.units[u].pos, f.units[u].has(St::Paralyzed))
            };
            let prev = had.get(&uid);
            if is_paralyzed && !prev.map_or(false, |s| s.contains("paralyzed")) {
                let mut m = Map::new();
                m.insert("type".into(), json!("attack"));
                m.insert("style".into(), json!("undead"));
                m.insert("variant".into(), json!("paralyzed"));
                m.insert("source_id".into(), json!(uid));
                m.insert("target_id".into(), json!(uid));
                m.insert("outcome".into(), json!("hit"));
                m.insert("amount".into(), json!(0));
                m.insert("text".into(), json!("PARALYZED"));
                m.insert("source".into(), json!({"x": pos.0, "y": pos.1}));
                m.insert("target".into(), json!({"x": pos.0, "y": pos.1}));
                self.push_effect(m);
            }
        }
    }

    // ------------------------------------------------------------------
    // Human Candidate List (`FFArena._build_candidates`)
    // ------------------------------------------------------------------

    fn movement_candidates(&self, actor: usize) -> Vec<Act> {
        let f = self.fight.as_ref().unwrap();
        let budget = f.units[actor].available_movement().div_euclid(5);
        if budget <= 0 {
            return Vec::new();
        }
        if self.replay_version >= 3 {
            let masked = if self.replay_version >= 8 && f.units[actor].team == 0 {
                (0..f.units.len()).filter(|&i| self.concealed_from_heroes(i)).fold(0, |m, i| m | 1 << i)
            } else { 0 };
            return crate::batch::movement_paths(f, actor, masked, false, None).into_iter().map(Act::Move).collect();
        }
        let origin = f.units[actor].pos;
        let mut results: Vec<Vec<Pos>> = Vec::new();

        // 1. Native 8-neighbour one-step moves (`autobuild(MoveAction)`)
        for dx in -1..=1 {
            for dy in -1..=1 {
                if dx == 0 && dy == 0 {
                    continue;
                }
                let next = (origin.0 + dx, origin.1 + dy);
                if !self.bidir_passable(f, actor, origin, next) || !f.placeable(actor, next) {
                    continue;
                }
                let trial = [origin, next];
                let (moves, _) = f.compute_actual_moves(actor, &trial, budget);
                if moves.len() > 1 {
                    results.push(moves);
                }
            }
        }

        // 2. Cardinal BFS (`(0, -1), (-1, 0), (1, 0), (0, 1)`) keeping distinct paths
        let mut queue: VecDeque<Vec<Pos>> = VecDeque::new();
        let mut visited: HashSet<Pos> = HashSet::new();
        queue.push_back(vec![origin]);
        visited.insert(origin);

        while let Some(path) = queue.pop_front() {
            let (x, y) = *path.last().unwrap();
            for (dx, dy) in [(0, -1), (-1, 0), (1, 0), (0, 1)] {
                let (nx, ny) = (x + dx, y + dy);
                if visited.contains(&(nx, ny)) || !f.grid.in_bounds(nx, ny) {
                    continue;
                }
                if !self.bidir_passable(f, actor, (x, y), (nx, ny)) || !f.placeable(actor, (nx, ny)) {
                    continue;
                }
                let mut trial = path.clone();
                trial.push((nx, ny));
                let (actual, _) = f.compute_actual_moves(actor, &trial, budget);
                if actual != trial {
                    continue;
                }
                visited.insert((nx, ny));
                if !results.iter().any(|r| r == &trial) {
                    results.push(trial.clone());
                }
                queue.push_back(trial);
            }
        }

        results.into_iter().map(Act::Move).collect()
    }

    fn bidir_passable(&self, f: &Fight, actor: usize, from: Pos, to: Pos) -> bool {
        f.grid.in_bounds(to.0, to.1) && f.passable(actor, to) && f.passable(actor, from)
    }

    fn build_candidates(&mut self) {
        if self.cache_revision == Some(self.revision) {
            return;
        }
        self.candidates.clear();
        self.action_views.clear();
        self.areas.clear();
        self.cache_revision = Some(self.revision);
        if self.in_setup || self.finished {
            return;
        }
        let Some(f_ref) = &self.fight else { return };
        let actor = self.acting_unit(f_ref);

        let mut raw_cands: Vec<HumanCandidate> = Vec::new();
        let incap = self.fight.as_ref().unwrap().units[actor].incapacitated();
        if self.interrupted_move.is_some() {
            raw_cands.extend(self.movement_candidates(actor).into_iter().filter(|act|
                matches!(act, Act::Move(path) if f_ref.champion_move_fits(actor, path)))
                .map(|act| HumanCandidate { act, exhale_aim: None }));
        } else if let Some(rays) = f_ref.pending_rays(actor) {
            raw_cands.extend(f_ref.ray_choices(actor, rays).into_iter()
                .map(|act| HumanCandidate { act, exhale_aim: None }));
        } else if incap {
            if let Some(step) = self.fight.as_mut().unwrap().flee_step(actor) {
                raw_cands.push(HumanCandidate { act: Act::Move(step), exhale_aim: None });
            }
        } else {
            // 1. Attacks & BlindAttacks
            let mut non_spell = Vec::new();
            {
                let f = self.fight.as_mut().unwrap();
                let refresh = !f.units[actor].t.pc
                    || (0..f.units[actor].t.attacks.len()).any(|a| f.can_attack(actor, a))
                    || (f.units[actor].bonus > 0 && f.units[actor].two_weapon);
                let sensed = if self.replay_version < 19 && refresh {
                    let (entries, heard) = f.sensed_split(actor);
                    Some(
                        entries
                            .into_iter()
                            .enumerate()
                            .filter(|&(_, (c, _))| !f.allies(actor, c))
                            .map(|(k, (_, p))| (p, k < heard))
                            .collect::<Vec<_>>(),
                    )
                } else {
                    None
                };
                // For replay_version >= 19 (web human turns only; batch trainer & AI untouched):
                // every weapon attack can target any legal square in reach/range without Total
                // Cover, regardless of whether an unseen creature is there (SRD 5.2.1 "Unseen
                // Attackers and Targets"). Squares holding a visible conscious creature (ally or
                // enemy already targeted by Act::Attack) are excluded so visible targets use
                // direct attacks and allies aren't misclicked.
                let visible_conscious_squares: HashSet<Pos> = if self.replay_version >= 19 {
                    (0..f.units.len())
                        .filter(|&u| u != actor && f.units[u].conscious() && f.can_see(actor, u))
                        .map(|u| f.units[u].pos)
                        .collect()
                } else {
                    HashSet::new()
                };
                for (ai, def) in f.units[actor].t.attacks.iter().enumerate() {
                    if !f.can_attack(actor, ai) || !f.attack_available(actor, ai) {
                        continue;
                    }
                    let mut visible_target_squares: HashSet<Pos> = HashSet::new();
                    for t in 0..f.units.len() {
                        if t == actor || !f.opposing(actor, t) || f.units[t].dead() || !f.can_see(actor, t) {
                            continue;
                        }
                        if f.dist(actor, t) * 5 > def.range_max {
                            continue;
                        }
                        if def.save_immune && f.units[t].save_immune_to.contains(&(actor, def.name)) {
                            continue;
                        }
                        visible_target_squares.insert(f.units[t].pos);
                        non_spell.push(Act::Attack { atk: ai, target: t, reaction: false });
                    }
                    if self.replay_version >= 19 {
                        if def.save_attack.is_none() && !def.no_damage {
                            let here = f.units[actor].pos;
                            let reach_sq = (def.range_max / 5).max(1);
                            let x0 = (here.0 - reach_sq).max(0);
                            let x1 = (here.0 + reach_sq).min(self.grid.w - 1);
                            let y0 = (here.1 - reach_sq).max(0);
                            let y1 = (here.1 + reach_sq).min(self.grid.h - 1);
                            for y in y0..=y1 {
                                for x in x0..=x1 {
                                    let sq = (x, y);
                                    if visible_target_squares.contains(&sq) || visible_conscious_squares.contains(&sq) {
                                        continue;
                                    }
                                    if f.can_blind_attack_square(here, sq, def.range_max) {
                                        non_spell.push(Act::BlindAttack { atk: ai, square: sq, heard: false });
                                    }
                                }
                            }
                        }
                    } else if let Some(ref s_list) = sensed {
                        if def.save_attack.is_none() {
                            let here = f.units[actor].pos;
                            let mut seen = Vec::new();
                            for &(sq, heard) in s_list {
                                if seen.contains(&sq) {
                                    continue;
                                }
                                seen.push(sq);
                                if f.can_blind_attack_square(here, sq, def.range_max) {
                                    non_spell.push(Act::BlindAttack { atk: ai, square: sq, heard });
                                }
                            }
                        }
                    }
                }

                let unit = &f.units[actor];
                if unit.action > 0 {
                    non_spell.push(Act::Dodge);
                    non_spell.push(Act::Dash);
                    if f.rule_version() >= 6 { non_spell.push(Act::Disengage); }
                    if f.rule_version() >= 16 {
                        if f.units[actor].t.pc {
                            for t in 0..f.units.len() {
                                if t != actor
                                    && f.allies(actor, t)
                                    && !f.units[t].dead()
                                    && f.units[t].unconscious()
                                    && !f.units[t].has(St::Stable)
                                    && f.dist(actor, t) == 1
                                    && f.can_see(actor, t)
                                {
                                    non_spell.push(Act::FirstAid { target: t });
                                }
                            }
                        }
                        if f.units[actor].is_grappled() {
                            let grapplers: Vec<usize> = f.units[actor].grappled_by.iter().map(|&(g, _)| g).collect();
                            for g in grapplers {
                                non_spell.push(Act::EscapeGrapple { target: g });
                            }
                        }
                        if f.units[actor].conscious() && !f.active_effects(actor, EffKey::EscapableRestraint).is_empty() {
                            non_spell.push(Act::BreakFree { target: actor });
                        }
                    }
                }
                if unit.t.second_wind_uses > 0 && unit.bonus > 0 && unit.second_wind_count > 0 && unit.hp < f.max_hp_of(actor) {
                    non_spell.push(Act::SecondWind);
                }
                if unit.t.action_surge_uses > 0 && !unit.action_surge_flag && unit.action_surge_count > 0 {
                    non_spell.push(Act::ActionSurge);
                }
                if unit.t.nimble_escape.is_some() && unit.bonus > 0 {
                    non_spell.push(Act::DisengageBonus);
                }
                if unit.bonus > 0 && (unit.t.nimble_escape.is_some() || f.shadow_can_hide(actor)) {
                    non_spell.push(Act::HideBonus);
                }
                let speed = f.speed_of(actor);
                if f.units[actor].prone() && speed > 0 && f.units[actor].available_movement() >= speed / 2 {
                    non_spell.push(Act::Stand);
                }
                if f.units[actor].t.pc {
                    f.feature_candidates(actor, &mut non_spell);
                    f.barbarian_candidates(actor, &mut non_spell);
                }
                non_spell.retain(|a| !matches!(a, Act::DragonsBreathExhale));
            }
            for a in non_spell {
                raw_cands.push(HumanCandidate { act: a, exhale_aim: None });
            }

            // 2. Spells (`auto_target=False`)
            let mut spells = Vec::new();
            {
                let f = self.fight.as_mut().unwrap();
                if f.units[actor].t.caster.is_some() {
                    f.units[actor].pools_init = true;
                    f.human_spell_candidates(actor, &mut spells);
                }
            }
            for a in spells {
                raw_cands.push(HumanCandidate { act: a, exhale_aim: None });
            }

            // 3. Aimed `DragonsBreathExhale` (`_exhale_actions`)
            {
                let f = self.fight.as_ref().unwrap();
                if f.active_breath(actor).is_some() && f.units[actor].action > 0 {
                    let origin = f.units[actor].pos;
                    for aim in f.cone_aims(origin) {
                        if !f.squares_in_cone(origin, aim, 3, true).is_empty() {
                            raw_cands.push(HumanCandidate { act: Act::DragonsBreathExhale, exhale_aim: Some(aim) });
                        }
                    }
                }
            }

            // 4. Movement (`_movement_actions`)
            for m in self.movement_candidates(actor) {
                raw_cands.push(HumanCandidate { act: m, exhale_aim: None });
            }
        }

        // Filter (`_human_filter`) and build sort keys (`FFArena._build_candidates`)
        let mut keyed: Vec<(FFArenaKey, HumanCandidate, Vec<usize>, Vec<String>, Option<Pos>, &'static str, Option<Pos>)> = Vec::new();
        for cand in raw_cands {
            let (targets, target_ids, dest, weapon, point, spell_opt, at_lvl_str, mm_str, mode_str, thrown_str, path_str) = {
                let f = self.fight.as_ref().unwrap();
                match &cand.act {
                    Act::Move(path) => {
                        let d = path.last().copied();
                        (Vec::new(), Vec::new(), d, "", None, None, "None".into(), "None".into(), "None".into(), "None".into(), py_path_str(Some(path)))
                    }
                    Act::Attack { atk, target, .. } => {
                        let def = &f.units[actor].t.attacks[*atk];
                        let thrown = if f.units[actor].t.pc { Some(def.thrown) } else { def.thrown.then_some(true) };
                        let thrown_s = if f.units[actor].t.pc { py_bool_opt_str(Some(def.thrown)) } else { py_bool_opt_str(if def.thrown { Some(true) } else { Some(false) }) };
                        let _ = thrown;
                        (
                            vec![*target],
                            vec![f.units[*target].id.clone()],
                            None,
                            def.name,
                            None,
                            None,
                            "None".into(),
                            "None".into(),
                            "None".into(),
                            thrown_s,
                            "None".into(),
                        )
                    }
                    Act::BlindAttack { atk, square, .. } => {
                        let def = &f.units[actor].t.attacks[*atk];
                        let thrown_s = py_bool_opt_str(Some(def.thrown));
                        // In v19+, sort square attacks deterministically by coordinate AFTER
                        // direct visible-target attacks (never revealing hidden occupancy).
                        let sort_tids = if self.replay_version >= 19 {
                            vec![format!("~{:02},{:02}", square.0, square.1)]
                        } else {
                            Vec::new()
                        };
                        (Vec::new(), sort_tids, None, def.name, None, None, "None".into(), "None".into(), "None".into(), thrown_s, "None".into())
                    }
                    Act::Cleave { atk, target } => {
                        let def = &f.units[actor].t.attacks[*atk];
                        (
                            vec![*target],
                            vec![f.units[*target].id.clone()],
                            None,
                            def.name,
                            None,
                            None,
                            "None".into(),
                            "None".into(),
                            "None".into(),
                            py_bool_opt_str(Some(def.thrown)),
                            "None".into(),
                        )
                    }
                    Act::Spell(c) => {
                        let tids: Vec<String> = c.targets.iter().map(|&t| f.units[t].id.clone()).collect();
                        let mm = c.mm.map_or("None".to_string(), |m| m.key().to_string());
                        (
                            c.targets.clone(),
                            tids,
                            None,
                            "",
                            c.point,
                            Some(c.spell),
                            c.at_level.to_string(),
                            mm,
                            "None".into(),
                            "None".into(),
                            "None".into(),
                        )
                    }
                    Act::CreateSpellSlot { level } | Act::ConvertSpellSlot { level } => (
                        Vec::new(), Vec::new(), None, "", None, None, level.to_string(),
                        "None".into(), "None".into(), "None".into(), "None".into(),
                    ),
                    Act::DivineSpark { target, heal, .. } => {
                        let mode = if *heal { "heal" } else { "harm" };
                        (
                            vec![*target],
                            vec![f.units[*target].id.clone()],
                            None,
                            "",
                            None,
                            None,
                            "None".into(),
                            "None".into(),
                            mode.into(),
                            "None".into(),
                            "None".into(),
                        )
                    }
                    Act::PreserveLife(_) => (
                        Vec::new(),
                        Vec::new(),
                        None,
                        "",
                        None,
                        None,
                        "None".into(),
                        "None".into(),
                        "None".into(),
                        "None".into(),
                        "None".into(),
                    ),
                    Act::SpiritualWeaponMove { to } => (Vec::new(), Vec::new(), None, "", Some(*to), None, "None".into(), "None".into(), "None".into(), "None".into(), "None".into()),
                    Act::SpiritualWeaponAttack { target } => (
                        vec![*target],
                        vec![f.units[*target].id.clone()],
                        None,
                        "",
                        None,
                        None,
                        "None".into(),
                        "None".into(),
                        "None".into(),
                        "None".into(),
                        "None".into(),
                    ),
                    Act::DragonsBreathExhale => (
                        Vec::new(),
                        Vec::new(),
                        None,
                        "",
                        cand.exhale_aim,
                        None,
                        "None".into(),
                        "None".into(),
                        "None".into(),
                        "None".into(),
                        "None".into(),
                    ),
                    Act::FirstAid { target } | Act::EscapeGrapple { target } => (
                        vec![*target],
                        vec![f.units[*target].id.clone()],
                        None,
                        "",
                        None,
                        None,
                        "None".into(),
                        "None".into(),
                        "None".into(),
                        "None".into(),
                        "None".into(),
                    ),
                    Act::BreakFree { .. } => (
                        Vec::new(),
                        Vec::new(),
                        None,
                        "",
                        None,
                        None,
                        "None".into(),
                        "None".into(),
                        "None".into(),
                        "None".into(),
                        "None".into(),
                    ),
                    _ => (Vec::new(), Vec::new(), None, "", None, None, "None".into(), "None".into(), "None".into(), "None".into(), "None".into()),
                }
            };

            // Earlier recordings filtered aim points by actual enemy occupancy.
            // Current players can aim at any legal square without learning who is hidden there.
            if let Some(pt) = point.filter(|_| self.replay_version < 7) {
                if matches!(cand.act, Act::Spell(_) | Act::DragonsBreathExhale) && spell_opt != Some(SpellId::DragonsBreath) {
                    if let Some((_, cells)) = self.action_area_info(actor, &cand.act, Some(pt)) {
                        let f = self.fight.as_ref().unwrap();
                        let has_foe = cells.iter().any(|&[x, y]| {
                            f.token_at((x, y))
                                .map_or(false, |e| e != actor && f.opposing(actor, e) && (self.replay_version < 3 || !f.units[e].dead()))
                        });
                        if !has_foe {
                            continue;
                        }
                    }
                }
            }

            let spell_or_weapon = match spell_opt {
                Some(s) => s.key().to_string(),
                None => weapon.to_string(),
            };
            let sort_key = FFArenaKey {
                action_type: cand.act.kind().to_string(),
                spell_or_weapon,
                target_ids: target_ids.clone(),
                destination: py_dest_str(dest),
                point: py_point_str(point),
                at_level: at_lvl_str,
                metamagic: mm_str,
                mode: mode_str,
                thrown: thrown_str,
                path: path_str,
            };
            keyed.push((sort_key, cand, targets, target_ids, dest, weapon, point));
        }

        keyed.sort_by(|a, b| a.0.cmp(&b.0));

        for (idx, (_, cand, targets, target_ids, dest, weapon, point)) in keyed.into_iter().enumerate() {
            let view = self.build_action_view(idx, actor, &cand, &targets, &target_ids, dest, weapon, point);
            let aid = view.get("id").and_then(Value::as_str).unwrap().to_string();
            self.candidates.insert(aid, cand);
            self.action_views.push(view);
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn build_action_view(
        &mut self,
        index: usize,
        actor: usize,
        cand: &HumanCandidate,
        targets: &[usize],
        target_ids: &[String],
        dest: Option<Pos>,
        weapon: &'static str,
        point: Option<Pos>,
    ) -> Value {
        let kind = cand.act.kind();
        let spell_opt: Option<&Cast> = match &cand.act {
            Act::Spell(c) => Some(c),
            _ => None,
        };
        let spell_key = spell_opt.map(|c| c.spell.key());

        let category = match kind {
            "move" => "move",
            "attack" | "cleave" => "attack",
            "spell" | "dragons_breath_exhale" | "spiritual_weapon_attack" | "spiritual_weapon_move" => "spell",
            "dodge" => "dodge",
            "dash" => "dash",
            "stand" => "stand",
            _ => "feature",
        };

        let mut label = match kind {
            "second_wind" => "Second Wind".to_string(),
            "action_surge" => "Action Surge".to_string(),
            "divine_spark" => "Divine Spark".to_string(),
            "channel_divinity_turn_undead" => "Turn Undead".to_string(),
            "preserve_life" if self.replay_version >= 7 => {
                if let Act::PreserveLife(alloc) = &cand.act {
                    let splits = alloc.iter().map(|&(target, hp)| format!("{} +{hp} HP", self.unit_display_name(target)))
                        .collect::<Vec<_>>().join(", ");
                    format!("Preserve Life ({splits})")
                } else { "Preserve Life".to_string() }
            }
            "preserve_life" => "Preserve Life".to_string(),
            "innate_sorcery" => "Innate Sorcery".to_string(),
            "dragons_breath_exhale" => "Dragon's Breath: exhale".to_string(),
            "spiritual_weapon_attack" => "Spiritual Weapon: strike".to_string(),
            "spiritual_weapon_move" => "Spiritual Weapon: move".to_string(),
            "disengage" | "disengage_bonus" => "Disengage".to_string(),
            "hide_bonus" => "Hide".to_string(),
            "rage" => "Rage".to_string(),
            "extend_rage" => "Extend Rage".to_string(),
            "reckless_attack" => "Reckless Attack".to_string(),
            "cleave" => "Cleave".to_string(),
            "first_aid" => "First Aid".to_string(),
            "escape_grapple" => "Escape Grapple".to_string(),
            "break_free" => "Break Free".to_string(),
            _ if spell_key.is_some() => present_text::spell_display_name(spell_key.unwrap()),
            "attack" => present_text::title_words(weapon),
            _ => present_text::title_words(kind),
        };

        match &cand.act {
            Act::CreateSpellSlot { level } => label = format!("Font of Magic: create level {level} spell slot ({} sorcery points)", Fight::slot_creation_cost(*level)),
            Act::ConvertSpellSlot { level } => label = format!("Font of Magic: convert level {level} spell slot to sorcery points"),
            _ => {}
        }

        if self.replay_version >= 7 {
            if self.replay_version < 19 {
                if let Act::BlindAttack { square: (x, y), heard, .. } = &cand.act {
                    let sense = if *heard { "heard" } else { "last known" };
                    label.push_str(&format!(" at unseen square {x},{y} ({sense})"));
                }
            }
            if let Some(c) = spell_opt.filter(|c| matches!(c.spell, SpellId::ChromaticOrb | SpellId::SorcerousBurst) || self.replay_version >= 8 && c.spell == SpellId::DragonsBreath) {
                if let Some(dt) = c.dt { label.push_str(&format!(" ({})", dt.name())); }
            }
        }
        if self.replay_version >= 6 && spell_key == Some("mage_armor") {
            let f = self.fight.as_ref().unwrap();
            if targets.first().is_some_and(|&t| f.has_spell_effect(t, EffKey::AcOverride, SpellId::MageArmor)) {
                label.push_str(" (already active)");
            }
        }

        let f = self.fight.as_ref().unwrap();
        let ray = spell_opt.filter(|c| self.replay_version >= 15 && c.spell == SpellId::ScorchingRay).map(|c| {
            let number = f.pending_rays(actor).map_or(1, |rays| rays.next);
            (number, crate::spells::ScorchingRays::count(c.at_level))
        });
        let mut aid_no_hp = Vec::new();
        if let Some(c) = spell_opt.filter(|c| self.replay_version >= 15 && c.spell == SpellId::Aid) {
            let bonus = 5 * (1 + (c.at_level - 2).max(0));
            for &t in targets {
                if f.units[t].hp == 0 && f.aid_effect(t).is_some_and(|old| old >= bonus) {
                    aid_no_hp.push(t);
                }
            }
        }
        let mode_opt: Option<&str> = match &cand.act {
            Act::DivineSpark { heal, .. } => Some(if *heal { "heal" } else { "harm" }),
            _ => None,
        };
        let mm_opt: Option<&str> = spell_opt.and_then(|c| c.mm.map(|m| m.key()));

        let mut option_parts: Vec<String> = Vec::new();
        if let Some(m) = mode_opt {
            option_parts.push(m.replace('_', " "));
        }
        if let Some(mm) = mm_opt {
            option_parts.push(mm.replace('_', " "));
        }

        // Exact `UndeadWebArena._cost` + `FFArena._action_view`
        let cost = match kind {
            "spell" if ray.is_some_and(|(number, _)| number > 1) => "part of the same cast".to_string(),
            "move" => {
                if let Act::Move(p) = &cand.act {
                    let steps = if self.replay_version >= 3 {
                        let f = self.fight.as_ref().unwrap();
                        p.iter().skip(1).map(|&q| {
                            if self.replay_version >= 9 && f.token_at(q).is_some_and(|i| self.concealed_from_heroes(i)) {
                                1 + f.units[actor].prone() as i32
                            } else { f.step_cost(actor, q) }
                        }).sum()
                    } else {
                        p.len() as i32 - 1
                    };
                    format!("{} ft", steps * 5)
                } else {
                    "0 ft".to_string()
                }
            }
            "stand" => {
                let speed = self.fight.as_ref().unwrap().speed_of(actor);
                format!("{} ft of movement", speed / 2)
            }
            "create_spell_slot" | "disengage_bonus" | "hide_bonus" | "rage" | "extend_rage" => "bonus action".to_string(),
            "convert_spell_slot" | "reckless_attack" | "cleave" => "free".to_string(),
            _ => {
                let bonus = matches!(kind, "second_wind" | "spiritual_weapon_attack" | "spiritual_weapon_move" | "innate_sorcery")
                    || (self.replay_version < 3 && kind == "dragons_breath_exhale")
                    || (self.replay_version >= 3 && spell_opt.is_some_and(|c| c.spell.bonus_action()));
                let mut text = if bonus {
                    "bonus action".to_string()
                } else if kind == "action_surge" {
                    "free".to_string()
                } else if matches!(kind, "divine_spark" | "channel_divinity_turn_undead" | "preserve_life") {
                    "action · Channel Divinity".to_string()
                } else {
                    "action".to_string()
                };
                if let Some(c) = spell_opt {
                    if self.replay_version >= 3 && c.free {
                        text.push_str(" + Magic Initiate free cast");
                    } else if c.at_level > 0 {
                        text.push_str(&format!(" + level {} slot", c.at_level));
                    }
                    if c.mm.is_some() {
                        text.push_str(" + sorcery points");
                    }
                }
                text
            }
        };

        let mut description = label.clone();
        if !option_parts.is_empty() {
            description.push_str(&format!(" ({})", option_parts.join(", ")));
        }
        if !targets.is_empty() {
            let names: Vec<&str> = targets.iter().map(|&t| self.unit_display_name(t)).collect();
            description.push_str(" → ");
            description.push_str(&names.join(", "));
        } else if let Act::BlindAttack { square, .. } = &cand.act {
            if self.replay_version >= 19 {
                description.push_str(&format!(" → {} (Disadvantage — unseen target)", cell_label(*square)));
            }
        } else if let Some((px, py)) = point {
            if category == "spell" {
                let col = (b'A' + (px as u8)) as char;
                description.push_str(&format!(" → {col}{}", py + 1));
            }
        }
        if let Some((dx, dy)) = dest {
            if kind == "move" {
                description = format!("Move to {dx}, {dy}");
            }
        }
        if kind == "stand" {
            description = "Stand up from prone".to_string();
        }

        let is_thrown = match &cand.act {
            Act::Attack { atk, .. } | Act::BlindAttack { atk, .. } => self.fight.as_ref().unwrap().units[actor].t.attacks[*atk].thrown,
            _ => false,
        };
        let mut option_str = if option_parts.is_empty() { None } else { Some(option_parts.join(" · ")) };
        if kind == "attack" && is_thrown {
            option_str = Some("thrown".to_string());
            label = format!("{label} (thrown)");
        }

        let aim = match &cand.act {
            Act::BlindAttack { square, .. } if self.replay_version >= 7 => Some(*square),
            Act::Move(_) => dest,
            _ => point,
        };
        let is_square_attack = self.replay_version >= 19 && matches!(&cand.act, Act::BlindAttack { .. });
        let mut view = Map::new();
        view.insert("id".into(), json!(format!("r{}-{index}", self.revision)));
        view.insert("kind".into(), json!(kind));
        view.insert("category".into(), json!(category));
        view.insert("label".into(), json!(label));
        if !(kind != "move" && (target_ids.len() > 1 || point.is_some())) {
            view.insert("description".into(), json!(description));
        }
        if !target_ids.is_empty() && !is_square_attack {
            view.insert("target_id".into(), json!(target_ids[0]));
            view.insert("target_ids".into(), json!(target_ids));
        }
        if is_square_attack {
            view.insert("square_attack".into(), json!(true));
            view.insert("disadvantage".into(), json!(true));
        }
        if let Some((ax, ay)) = aim {
            view.insert("x".into(), json!(ax));
            view.insert("y".into(), json!(ay));
        }
        view.insert("cost".into(), json!(cost));
        if let Some((number, count)) = ray {
            view.insert("ray_number".into(), json!(number));
            view.insert("ray_count".into(), json!(count));
        }
        if !aid_no_hp.is_empty() {
            view.insert("aid_no_hp_targets".into(), json!(aid_no_hp.iter().map(|&t| &f.units[t].id).collect::<Vec<_>>()));
        }
        if let Act::CreateSpellSlot { level } | Act::ConvertSpellSlot { level } = &cand.act {
            view.insert("at_level".into(), json!(level));
        }
        if let Some(c) = spell_opt {
            view.insert("spell".into(), json!(c.spell.key()));
            if self.replay_version >= 10 && c.free { view.insert("free_cast".into(), json!(true)); }
            view.insert("spell_level".into(), json!(c.spell.level()));
            view.insert("at_level".into(), json!(c.at_level));
            if let Some(mm) = c.mm {
                view.insert("metamagic".into(), json!(mm.key()));
            }
        }
        if let Some(m) = mode_opt {
            view.insert("mode".into(), json!(m));
        }
        if let Some(opt) = option_str {
            view.insert("option".into(), json!(opt));
        }
        if let Act::Move(p) = &cand.act {
            let path_json: Vec<[i32; 2]> = p.iter().map(|&(x, y)| [x, y]).collect();
            view.insert("path".into(), json!(path_json));
        }

        if let Some((px, py)) = point {
            let akey = format!("{}@{px},{py}", spell_key.unwrap_or(kind));
            if !self.areas.contains_key(&akey) {
                let cells = self.action_area_info(actor, &cand.act, Some((px, py))).map(|(_, c)| c).unwrap_or_default();
                self.areas.insert(akey.clone(), cells);
            }
            let cells = self.areas.get(&akey).cloned().unwrap_or_default();
            if !cells.is_empty() {
                view.insert("area".into(), json!(akey));
                let f = self.fight.as_ref().unwrap();
                let caught = if self.replay_version >= 3 {
                    let exclude = if matches!(&cand.act, Act::Spell(c) if matches!(c.spell, SpellId::AcidSplash | SpellId::Shatter)) {
                        None
                    } else {
                        Some(actor)
                    };
                    let squares: Vec<Pos> = cells.iter().map(|&[x, y]| (x, y)).collect();
                    f.creatures_in_squares(&squares, exclude)
                } else {
                    let mut occupants = Vec::new();
                    for [x, y] in cells {
                        if let Some(u) = f.token_at((x, y)) {
                            if u != actor && !occupants.contains(&u) { occupants.push(u); }
                        }
                    }
                    occupants
                };
                let hits: Vec<String> = caught.iter()
                    .filter(|&&u| f.opposing(actor, u) && (self.replay_version < 6 || !f.units[u].hidden() || f.can_see(actor, u)))
                    .map(|&u| f.units[u].id.clone()).collect();
                let allies: Vec<String> = caught.iter().filter(|&&u| !f.opposing(actor, u)).map(|&u| f.units[u].id.clone()).collect();
                if self.replay_version >= 7 || !hits.is_empty() {
                    view.insert("hits".into(), json!(hits));
                }
                if self.replay_version >= 7 || !allies.is_empty() {
                    view.insert("allies".into(), json!(allies));
                }
            }
        }

        if self.replay_version >= 10 {
            let f = self.fight.as_ref().unwrap();
            let here = f.units[actor].pos;
            let origin = match &cand.act {
                Act::Attack { atk, .. } | Act::Cleave { atk, .. }
                    if f.units[actor].t.attacks[*atk].save_attack.is_none_or(|(ab, _)| ab == crate::content::Ability::Dex) => Some(here),
                Act::DragonsBreathExhale => Some(here),
                Act::SpiritualWeaponAttack { target } => Some(f.force_attack_origin(actor, *target, f.active_force(actor))),
                Act::Spell(c) => match c.spell {
                    SpellId::AcidSplash => c.point,
                    SpellId::SpiritualWeapon => c.targets.first().map(|&t| f.force_attack_origin(actor, t, None)),
                    SpellId::BurningHands | SpellId::GuidingBolt | SpellId::RayOfFrost | SpellId::Firebolt
                    | SpellId::SorcerousBurst | SpellId::ScorchingRay | SpellId::ChromaticOrb => Some(here),
                    _ => None,
                },
                _ => None,
            };
            if let Some(origin) = origin {
                let hidden = crate::encode::masked_from(f, f.units[actor].team);
                let mut bonuses = serde_json::Map::new();
                let affected = ["hits", "allies"].into_iter().flat_map(|key| view.get(key).and_then(Value::as_array))
                    .flatten().filter_map(Value::as_str);
                for id in target_ids.iter().map(String::as_str).chain(affected) {
                    if let Some(t) = f.units.iter().position(|unit| unit.id == id) {
                        let area = matches!(&cand.act, Act::DragonsBreathExhale)
                            || matches!(&cand.act, Act::Spell(c) if matches!(c.spell, SpellId::AcidSplash | SpellId::BurningHands));
                        let bonus = if area { f.known_point_cover(origin, t, hidden) } else { f.known_cover(origin, t, hidden) };
                        if bonus > 0 && hidden & (1 << t) == 0 { bonuses.insert(id.to_owned(), json!(bonus)); }
                    }
                }
                if !bonuses.is_empty() { view.insert("cover".into(), Value::Object(bonuses)); }
            }
        }
        Value::Object(view)
    }

    // ------------------------------------------------------------------
    // State, Snapshots & `wire()`
    // ------------------------------------------------------------------

    fn unit_marks(&self, u: usize) -> Vec<&'static str> {
        let f = self.fight.as_ref().unwrap();
        let unit = &f.units[u];
        let gt = f.gt();
        let mut marks: Vec<&'static str> = Vec::new();

        for slot in &unit.effect_key_order {
            match *slot {
                MarkSlot::StrengthOverride => {
                    if unit.str_drain.is_some() && !marks.contains(&"strength_drain") {
                        marks.push("strength_drain");
                    }
                }
                MarkSlot::HealOverride => {
                    if unit.cursed && !marks.contains(&"cursed") {
                        marks.push("cursed");
                    }
                }
                MarkSlot::Eff(key) => {
                    let Some((_, list)) = unit.effects.iter().find(|(k, _)| *k == key) else { continue };
                    for entry in list {
                        if !entry.exp.map_or(true, |x| x > gt) {
                            continue;
                        }
                        let obj = &f.objs[entry.obj as usize];
                        if obj.ended {
                            continue;
                        }
                        let name = match key {
                            EffKey::TargetedAdvantageOverride => Some("guiding_bolt"),
                            EffKey::SpeedOverride => Some("slowed"),
                            EffKey::Bless => Some("bless"),
                            EffKey::AcBonus if obj.spell == SpellId::ShieldOfFaith => Some("shield_of_faith"),
                            EffKey::TargetingWard => Some("sanctuary"),
                            EffKey::AttackedAdvantageModifier => match obj.kind {
                                ObjKind::Blur => Some("blur"),
                                _ if obj.spell == SpellId::ProtectionFromEvilAndGood => Some("protection"),
                                _ => None,
                            },
                            EffKey::HitPointMaxOverride => Some("aid"),
                            _ => None,
                        };
                        if let Some(n) = name {
                            if !marks.contains(&n) {
                                marks.push(n);
                            }
                        }
                    }
                }
            }
        }
        for (st, name) in [(St::Paralyzed, "paralyzed"), (St::Frightened, "frightened")] {
            if unit.has(st) && !marks.contains(&name) {
                marks.push(name);
            }
        }
        if unit.t.stench_dc.is_some() && !unit.dead() {
            marks.push("stench");
        }
        if unit.t.sorcerer && f.innate_active(u) {
            marks.push("innate_sorcery");
        }
        marks
    }

    fn forces_view(&self) -> Vec<Value> {
        let Some(f) = &self.fight else { return Vec::new() };
        let mut out = Vec::new();
        for (ri, ru) in self.roster.iter().enumerate() {
            if ru.team != "heroes" {
                continue;
            }
            let Some(u) = self.roster_to_fight.get(ri).copied().flatten() else { continue };
            if let Some(force) = f.active_force(u) {
                if let ObjKind::Force { pos, .. } = f.objs[force as usize].kind {
                    out.push(json!({
                        "id": format!("force-{}", ru.id),
                        "owner_id": ru.id,
                        "kind": "spiritual_weapon",
                        "x": pos.0,
                        "y": pos.1,
                    }));
                }
            }
        }
        out
    }

    fn resources_view(&self, actor: Option<usize>) -> Value {
        let Some(u) = actor else {
            return json!({"action": 0, "bonus_action": 0, "reaction": 0, "movement": 0});
        };
        let f = self.fight.as_ref().unwrap();
        let unit = &f.units[u];
        let mut pools: Vec<Value> = Vec::new();
        if let Some(c) = unit.t.caster.as_ref() {
            if self.replay_version >= 3 {
                for &spell in &c.free_casts {
                    let text = spell.key().replace('_', " ");
                    pools.push(json!({"label": format!("Magic Initiate ({text})"), "value": i32::from(unit.free_casts.contains(&spell)), "max": 1}));
                }
            }
            for lvl in 1..=2 {
                if c.slots[lvl] > 0 {
                    pools.push(json!({
                        "label": format!("Level {lvl} slots"),
                        "value": unit.slots[lvl],
                        "max": c.slots[lvl],
                    }));
                }
            }
        }
        if unit.t.fighter {
            pools.push(json!({"label": "Second Wind", "value": unit.second_wind_count, "max": null}));
            pools.push(json!({"label": "Action Surge", "value": unit.action_surge_count, "max": null}));
        }
        if unit.t.channel_divinity {
            let max_cd = unit.t.caster.as_ref().map(|c| c.channel_divinity);
            pools.push(json!({"label": "Channel Divinity", "value": unit.cd, "max": max_cd}));
        }
        if unit.t.sorcerer {
            let max_sp = unit.t.caster.as_ref().map_or(0, |c| c.sorcery_points);
            pools.push(json!({"label": "Sorcery points", "value": unit.sorcery_points, "max": max_sp}));
            pools.push(json!({"label": "Innate Sorcery", "value": unit.innate_sorcery, "max": null}));
            if f.innate_active(u) {
                pools.push(json!({"label": "Innate Sorcery", "value": "active", "max": null}));
            }
        }
        if unit.t.barbarian {
            pools.push(json!({"label": "Rage", "value": unit.rage_count, "max": null}));
            if f.is_raging(u) {
                pools.push(json!({"label": "Raging", "value": "active", "max": null}));
            }
            if unit.reckless {
                pools.push(json!({"label": "Reckless", "value": "active", "max": null}));
            }
        }
        let mut resources = json!({
            "action": unit.action,
            "bonus_action": unit.bonus,
            "reaction": unit.reaction,
            "movement": unit.movement,
            "pools": pools,
        });
        if self.replay_version >= 13 && unit.champion_movement > 0 {
            resources["champion_movement"] = json!(unit.champion_movement);
        }
        resources
    }

    fn with_interrupt_state(&self, mut state: Value) -> Value {
        if self.replay_version >= 2 {
            state["champion_interrupt"] = json!(self.interrupted_move.is_some());
        }
        state
    }

    fn presentation_snapshot(&self) -> Value {
        let f = self.fight.as_ref().unwrap();
        let actor = if self.in_setup || self.finished { None } else { Some(self.acting_unit(f)) };
        let mut units = Vec::with_capacity(f.order.len());
        for &u in &f.order {
            let unit = &f.units[u];
            let mut conds: Vec<&str> = unit.statuses.iter().map(|s| s.name()).collect();
            if self.replay_version >= 9 && unit.poisoned() && !conds.contains(&"poisoned") { conds.push("poisoned"); }
            conds.sort_unstable();
            let mut uobj = json!({
                "id": unit.id,
                "x": unit.pos.0,
                "y": unit.pos.1,
                "hp": unit.hp,
                "max_hp": f.max_hp_of(u),
                "alive": unit.conscious(),
                "active": Some(u) == actor,
                "conditions": conds,
                "marks": self.unit_marks(u),
                "str_loss": unit.str_drain.unwrap_or(0),
                "dead": unit.dead(),
            });
            if self.replay_version >= 19 {
                uobj["invisible_to_heroes"] = json!(self.invisible_unseen_by_heroes(u));
            }
            units.push(uobj);
        }
        let base_res = match actor {
            Some(u) => json!({
                "action": f.units[u].action,
                "bonus_action": f.units[u].bonus,
                "reaction": f.units[u].reaction,
                "movement": f.units[u].movement,
            }),
            None => json!({"action": 0, "bonus_action": 0, "reaction": 0, "movement": 0}),
        };
        self.with_interrupt_state(json!({
            "units": units,
            "objects": [],
            "resources": base_res,
            "turn_id": actor.map(|u| f.units[u].id.clone()),
            "round": f.round,
            "winner": self.winner,
            "phase": self.phase(),
            "can_act": self.can_act(),
            "log_id": self.log_counter,
            "forces": self.forces_view(),
        }))
    }

    fn roster_unit_view(&self, ri: usize, position: Option<Pos>) -> Value {
        let ru = &self.roster[ri];
        let hp = ru.t.max_hp;
        let ac = ru.t.ac;
        let controlled_by = if ru.team == "heroes" || self.monster_control == "manual" { "human" } else { "ai" };
        let mut m = Map::new();
        m.insert("id".into(), json!(ru.id));
        m.insert("kind".into(), json!(ru.content));
        m.insert("team".into(), json!(ru.team));
        m.insert("name".into(), json!(ru.name));
        m.insert("hp".into(), json!(hp));
        m.insert("max_hp".into(), json!(hp));
        m.insert("ac".into(), json!(ac));
        m.insert("alive".into(), json!(true));
        m.insert("active".into(), json!(false));
        m.insert("description".into(), json!(present_text::creature_description(ru.t.base_id)));
        m.insert("conditions".into(), json!([]));
        m.insert("controlled_by".into(), json!(controlled_by));
        m.insert("initiative_roll".into(), json!(self.initiative_rolls.get(&ru.id)));
        m.insert("initiative".into(), json!(null));
        if let Some((_, cls, sub)) = present_text::hero_class_meta(ru.t.base_id) {
            let lvl = ru.t.level;
            let sub = if lvl < 3 { None } else { match ru.t.base_id { "mara" => Some("champion"), "ilyra" => Some("evoker"), _ => sub } };
            if self.replay_version >= 2 {
                m.insert("base_id".into(), json!(ru.t.base_id));
            }
            let mut classes = Map::new();
            classes.insert(cls.to_string(), json!(lvl));
            m.insert("level".into(), json!(lvl));
            m.insert("classes".into(), Value::Object(classes));
            m.insert("class".into(), json!(cls));
            m.insert("subclass".into(), json!(sub));
        }
        if let Some((x, y)) = position {
            m.insert("x".into(), json!(x));
            m.insert("y".into(), json!(y));
        }
        m.insert("content".into(), json!(ru.content));
        m.insert("dead".into(), json!(false));
        m.insert("model".into(), present_text::model_recipe(ru.t.base_id));
        m.insert("marks".into(), if ru.content == "ghast" { json!(["stench"]) } else { json!([]) });
        m.insert("str_loss".into(), json!(0));
        if let Some(sheet) = present_text::unit_sheet_for_replay(&ru.content, ru.t.pc, hp, ac, self.replay_version) {
            m.insert("sheet".into(), sheet);
        }
        Value::Object(m)
    }

    fn fight_unit_view(&self, u: usize, actor: Option<usize>, include_pos: bool) -> Value {
        let f = self.fight.as_ref().unwrap();
        let unit = &f.units[u];
        let ri = self.fight_to_roster[u];
        let ru = &self.roster[ri];
        let hp = unit.hp;
        let max_hp = f.max_hp_of(u);
        let ac = f.armor_class(u);
        let controlled_by = if self.human_controlled_fight(u) { "human" } else { "ai" };
        let mut conds: Vec<&str> = unit.statuses.iter().map(|s| s.name()).collect();
        if self.replay_version >= 9 && unit.poisoned() && !conds.contains(&"poisoned") { conds.push("poisoned"); }
        if self.replay_version >= 18 && f.is_restrained(u) && !conds.contains(&"restrained") { conds.push("restrained"); }
        conds.sort_unstable();

        let mut m = Map::new();
        m.insert("id".into(), json!(ru.id));
        m.insert("kind".into(), json!(ru.content));
        m.insert("team".into(), json!(ru.team));
        m.insert("name".into(), json!(ru.name));
        m.insert("hp".into(), json!(hp));
        m.insert("max_hp".into(), json!(max_hp));
        m.insert("ac".into(), json!(ac));
        m.insert("alive".into(), json!(unit.conscious()));
        m.insert("active".into(), json!(Some(u) == actor));
        m.insert("description".into(), json!(present_text::creature_description(ru.t.base_id)));
        m.insert("conditions".into(), json!(conds));
        if self.concealed_from_heroes(u) {
            m.insert("hidden_from_heroes".into(), json!(true));
        }
        if self.invisible_unseen_by_heroes(u) {
            m.insert("invisible_to_heroes".into(), json!(true));
        }
        m.insert("controlled_by".into(), json!(controlled_by));
        m.insert("initiative_roll".into(), json!(self.initiative_rolls.get(&ru.id)));
        m.insert("initiative".into(), if self.in_setup { json!(null) } else { json!(unit.initiative) });
        if let Some((_, cls, sub)) = present_text::hero_class_meta(ru.t.base_id) {
            let lvl = ru.t.level;
            let sub = if lvl < 3 { None } else { match ru.t.base_id { "mara" => Some("champion"), "ilyra" => Some("evoker"), _ => sub } };
            if self.replay_version >= 2 {
                m.insert("base_id".into(), json!(ru.t.base_id));
            }
            let mut classes = Map::new();
            classes.insert(cls.to_string(), json!(lvl));
            m.insert("level".into(), json!(lvl));
            m.insert("classes".into(), Value::Object(classes));
            m.insert("class".into(), json!(cls));
            m.insert("subclass".into(), json!(sub));
        }
        if include_pos {
            m.insert("x".into(), json!(unit.pos.0));
            m.insert("y".into(), json!(unit.pos.1));
        }
        m.insert("content".into(), json!(ru.content));
        m.insert("dead".into(), json!(unit.dead()));
        m.insert("model".into(), present_text::model_recipe(ru.t.base_id));
        m.insert("marks".into(), json!(self.unit_marks(u)));
        m.insert("str_loss".into(), json!(unit.str_drain.unwrap_or(0)));
        if let Some(mut sheet) = present_text::unit_sheet_for_replay(&ru.content, ru.t.pc, hp, ac, self.replay_version) {
            if self.replay_version >= 8 && unit.str_drain.unwrap_or(0) > 0 {
                if self.replay_version >= 9 {
                    if let Some(features) = sheet["features"].as_array_mut() {
                        for (atk, def) in unit.t.attacks.iter().enumerate().filter(|(_, d)| !d.thrown) {
                            let name = present_text::title_words(def.name);
                            let Some(feature) = features.iter_mut().find(|line| line["name"] == name) else { continue };
                            let Some((hit, damage_line)) = feature["text"].as_str().and_then(|s| s.split_once(", ")) else { continue };
                            let Some((_, detail)) = damage_line.split_once(' ') else { continue };
                            let (bonus, damage, graze) = f.attack_numbers_ex(u, atk, false);
                            let hit_suffix = if hit.ends_with(" to hit") { " to hit" } else { "" };
                            let mut detail = detail.to_owned();
                            if let (Some(old), Some(new)) = (def.graze, graze) {
                                detail = detail.replace(&format!("Graze deals {old} damage"), &format!("Graze deals {} damage", new.max(0)));
                            }
                            feature["text"] = json!(format!("{bonus:+}{hit_suffix}, {} {detail}", damage.text()));
                        }
                    }
                }
                if let Some(stats) = sheet["stats"].as_str() {
                    let old = format!("STR {}", unit.t.abil[0]);
                    sheet["stats"] = json!(if stats.contains(&old) {
                        stats.replacen(&old, &format!("STR {}", unit.strength()), 1)
                    } else { format!("{stats} · STR {}", unit.strength()) });
                }
            }
            m.insert("sheet".into(), sheet);
        }
        Value::Object(m)
    }

    fn map_view(&self) -> Value {
        let tiles: Vec<String> = self.level.rows.iter().map(|r| r.replace('H', "#")).collect();
        json!({
            "width": self.grid.w,
            "height": self.grid.h,
            "tiles": tiles,
            "name": self.level.map_name,
            "theme": self.level.theme,
            "scene": self.level.scene,
        })
    }

    pub fn state(&mut self) -> Value {
        self.build_candidates();
        let actor = if self.in_setup || self.finished {
            None
        } else {
            self.fight.as_ref().map(|f| self.acting_unit(f))
        };
        let resources = self.resources_view(actor);
        let units: Vec<Value> = if self.in_setup {
            self.placements
                .iter()
                .map(|p| {
                    let ri = self.roster_by_id[&p.id];
                    self.roster_unit_view(ri, Some((p.x, p.y)))
                })
                .collect()
        } else {
            let order = self.fight.as_ref().unwrap().order.clone();
            order.into_iter().map(|u| self.fight_unit_view(u, actor, true)).collect()
        };

        let setup_roster: Vec<Value> = (0..self.roster.len())
            .map(|ri| match self.roster_to_fight.get(ri).copied().flatten() {
                Some(u) if !self.in_setup => self.fight_unit_view(u, None, false),
                _ => self.roster_unit_view(ri, None),
            })
            .collect();

        let turn_id = actor.map(|u| self.fight.as_ref().unwrap().units[u].id.clone());
        let log_vec: Vec<Value> = self.log.iter().cloned().collect();
        let tl_vec: Vec<Value> = self.timeline.iter().cloned().collect();
        let eff_vec: Vec<Value> = self.effects.iter().cloned().collect();

        self.with_interrupt_state(json!({
            "revision": self.revision,
            "csrf_token": self.csrf_token,
            "encounter_id": self.encounter_id,
            "effects": eff_vec,
            "timeline": tl_vec,
            "round": self.current_round(),
            "turn_id": turn_id,
            "phase": self.phase(),
            "can_act": self.can_act(),
            "setup": {
                "roster": setup_roster,
                "placements": self.placements,
                "monster_control": self.monster_control,
                "suggested_placements": self.level.suggested_placements,
                "can_start": self.in_setup && self.can_start(),
                "encounter": self.level.encounter_id,
                "preset": self.level.preset_id,
            },
            "objects": [],
            "winner": self.winner,
            "map": self.map_view(),
            "units": units,
            "resources": resources,
            "actions": self.action_views,
            "log": log_vec,
            "engine": "ember-rs · 5e-2024 (SRD 5.2.1)",
            "encounter": self.level.encounter_id,
            "level": self.level.level_view,
            "theme": self.level.theme,
            "areas": self.areas,
            "forces": self.forces_view(),
            "initiative_draws": self.initiative_draws,
            "last_action_id": self.action_counter,
        }))
    }

    pub fn wire(&self, mut state: Value) -> Value {
        let Some(obj) = state.as_object_mut() else { return state };
        let Some(actions) = obj.get("actions").and_then(Value::as_array).cloned() else { return state };

        let static_keys = ["kind", "category", "label", "cost", "spell", "spell_level", "at_level", "free_cast", "metamagic", "mode", "option", "ray_number", "ray_count", "square_attack", "disadvantage"];
        let row_keys = ["target_ids", "x", "y", "area", "hits", "allies", "path", "cover", "aid_no_hp_targets"];

        let mut defs: Vec<Value> = Vec::new();
        let mut def_index: HashMap<String, usize> = HashMap::new();
        let mut rows: Vec<Value> = Vec::with_capacity(actions.len());

        for view in &actions {
            let Some(vobj) = view.as_object() else { continue };
            let is_move = vobj.get("kind").and_then(Value::as_str) == Some("move");
            let mut def = Map::new();
            for &k in &static_keys {
                if is_move && k == "cost" {
                    continue;
                }
                if let Some(val) = vobj.get(k) {
                    def.insert(k.to_string(), val.clone());
                }
            }
            let key_json = serde_json::to_string(&def).unwrap();
            let d_idx = match def_index.get(&key_json) {
                Some(&i) => i,
                None => {
                    let i = defs.len();
                    def_index.insert(key_json, i);
                    defs.push(Value::Object(def));
                    i
                }
            };
            let mut row = Map::new();
            if let Some(id_val) = vobj.get("id") {
                row.insert("id".into(), id_val.clone());
            }
            row.insert("d".into(), json!(d_idx));
            for &k in &row_keys {
                if let Some(val) = vobj.get(k) {
                    row.insert(k.to_string(), val.clone());
                }
            }
            if is_move {
                if let Some(cval) = vobj.get("cost") {
                    row.insert("cost".into(), cval.clone());
                }
            }
            rows.push(Value::Object(row));
        }

        let rev = obj.get("revision").and_then(Value::as_i64).unwrap_or(0);
        if let Some(tl) = obj.get_mut("timeline").and_then(Value::as_array_mut) {
            tl.retain(|r| r.get("revision").and_then(Value::as_i64).unwrap_or(0) >= rev);
        }
        obj.remove("effects");
        obj.insert("actions".into(), Value::Array(rows));
        obj.insert("action_defs".into(), Value::Array(defs));
        state
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn manual_shortbow_menu_replays_the_recorded_cover_rule() {
        let level = LevelInput {
            encounter_id: "range".into(), preset_id: "test".into(), theme: "ossuary".into(),
            map_name: "range".into(), rows: ["...............", "..H............", "..............."]
                .into_iter().map(String::from).collect(), scene: json!({}), level_view: json!({}),
            heroes: vec!["guy".into()], monsters: vec![("skeleton-1".into(), "skeleton".into(), "Skeleton".into())],
            suggested_placements: vec![Placement { id: "guy".into(), x: 0, y: 0 },
                                       Placement { id: "skeleton-1".into(), x: 1, y: 1 }],
        };
        for version in [15, CURRENT_WEB_REPLAY_VERSION] {
            let mut game = WebArena::with_trace(level.clone(), Trace::web_free(1), 0, "csrf".into(), "enc".into(), version).unwrap();
            game.monster_control = "manual".into();
            game.start().unwrap();
            let f = game.fight.as_mut().unwrap();
            let skeleton = f.units.iter().position(|u| u.id == "skeleton-1").unwrap();
            let hero = f.units.iter().position(|u| u.id == "guy").unwrap();
            f.turn_idx = f.order.iter().position(|&u| u == skeleton).unwrap();
            f.units[hero].hidden_stealth = Some(40);
            f.units[hero].statuses.push(St::Hidden);
            f.units[skeleton].action = 1;
            f.units[skeleton].unseen.push((hero, (13, 2), f.round));
            game.cache_revision = None;
            game.build_candidates();
            let f = game.fight.as_ref().unwrap();
            let offered = game.candidates.values().any(|c| f.describe(skeleton, &c.act) == "attack:shortbow:@13,2");
            assert_eq!(offered, version >= 16);
        }
    }

    #[test]
    fn concealed_adjacent_token_has_the_same_routes_as_empty_floor() {
        let level = LevelInput {
            encounter_id: "preview".into(), preset_id: "test".into(), theme: "ossuary".into(),
            map_name: "room".into(), rows: ["........", "........", "........", "........", "....D...", "........", "........", ".......D"]
                .into_iter().map(String::from).collect(), scene: json!({}), level_view: json!({}),
            heroes: vec!["ilyra_l1".into()],
            monsters: vec![("goblin_warrior-1".into(), "goblin_warrior".into(), "Goblin".into())],
            suggested_placements: vec![Placement { id: "ilyra_l1".into(), x: 3, y: 3 },
                                       Placement { id: "goblin_warrior-1".into(), x: 4, y: 4 }],
        };
        let mut game = WebArena::new(level, 1, 0, "csrf".into(), "enc".into()).unwrap();
        game.start().unwrap();
        let f = game.fight.as_mut().unwrap();
        let actor = f.units.iter().position(|u| u.id == "ilyra_l1").unwrap();
        let goblin = 1 - actor;
        f.units[goblin].statuses.push(St::Hidden);
        f.units[goblin].hidden_stealth = Some(30);
        f.units[actor].movement = 30;
        let offered = game.movement_candidates(actor);
        assert!(offered.contains(&Act::Move(vec![(3, 3), (4, 4)])));
        game.fight.as_mut().unwrap().move_to(goblin, (7, 7));
        assert_eq!(offered, game.movement_candidates(actor));
        game.fight.as_mut().unwrap().move_to(goblin, (4, 4));
        // A physically occupied destination still stops the mover.
        game.execute_move_with_oas(actor, &[(3, 3), (4, 4)]);
        assert_eq!(game.fight.as_ref().unwrap().units[actor].pos, (3, 3));
        game.execute_move_with_oas(actor, &[(3, 3), (4, 4), (5, 5)]);
        let f = game.fight.as_ref().unwrap();
        assert_eq!(f.units[actor].pos, (5, 5));
        assert_eq!(f.token_at((4, 4)), Some(goblin));
        assert_eq!(f.units[actor].movement, 15);
    }

    #[test]
    fn web_arena_enforces_max_rounds_cap() {
        let level = LevelInput {
            encounter_id: "cap".into(), preset_id: "test".into(), theme: "ossuary".into(),
            map_name: "room".into(), rows: ["......", "......", "......"].into_iter().map(String::from).collect(),
            scene: json!({}), level_view: json!({}),
            heroes: vec!["guy".into()],
            monsters: vec![("skeleton-1".into(), "skeleton".into(), "Skeleton".into())],
            suggested_placements: vec![Placement { id: "guy".into(), x: 1, y: 1 },
                                       Placement { id: "skeleton-1".into(), x: 4, y: 1 }],
        };
        let mut game = WebArena::new(level, 1, 0, "csrf".into(), "enc".into()).unwrap();
        game.start().unwrap();
        assert!(!game.finished);
        game.fight.as_mut().unwrap().round = crate::engine::MAX_ROUNDS;
        assert!(game.finish_if_needed());
        assert!(game.finished);
        assert_eq!(game.winner, None);
        assert!(game.log.iter().any(|e| e.get("text").and_then(Value::as_str)
            .is_some_and(|t| t.contains("50 rounds with no winner"))));
    }

    #[test]
    fn human_action_bar_and_events_for_first_aid_escape_grapple_and_break_free() {
        let level = LevelInput {
            encounter_id: "remedies".into(), preset_id: "test".into(), theme: "woodland".into(),
            map_name: "glade".into(), rows: ["........", "........", "........", "........"].into_iter().map(String::from).collect(),
            scene: json!({}), level_view: json!({}),
            heroes: vec!["guy".into(), "ilyra".into()],
            monsters: vec![
                ("bugbear_warrior-1".into(), "bugbear_warrior".into(), "Bugbear Warrior".into()),
                ("dryad-1".into(), "dryad".into(), "Dryad".into()),
            ],
            suggested_placements: vec![
                Placement { id: "guy".into(), x: 2, y: 2 },
                Placement { id: "ilyra".into(), x: 2, y: 1 },
                Placement { id: "bugbear_warrior-1".into(), x: 3, y: 2 },
                Placement { id: "dryad-1".into(), x: 5, y: 2 },
            ],
        };
        let mut game = WebArena::new(level, 7, 0, "csrf".into(), "enc".into()).unwrap();
        game.start().unwrap();
        let f = game.fight.as_mut().unwrap();
        let guy = f.units.iter().position(|u| u.id == "guy").unwrap();
        let ilyra = f.units.iter().position(|u| u.id == "ilyra").unwrap();
        let bugbear = f.units.iter().position(|u| u.id == "bugbear_warrior-1").unwrap();
        let dryad = f.units.iter().position(|u| u.id == "dryad-1").unwrap();
        f.turn_idx = f.order.iter().position(|&u| u == guy).unwrap();
        f.units[guy].action = 3;
        // 1) Adjacent dying ally -> First Aid
        f.units[ilyra].hp = 0;
        f.units[ilyra].statuses.push(St::Unconscious);
        // 2) Grappled by Bugbear -> Escape Grapple
        f.apply_grapple(bugbear, guy, Some(12));
        // 3) Restrained by Dryad Entangle -> Break Free
        let zone_obj = f.new_obj(
            SpellId::Entangle,
            ObjKind::Entangle { squares: vec![(2, 2)], dc: 12, restraints: Vec::new(), expires_at: 99 },
            dryad,
            Vec::new(),
            true,
        );
        let r_obj = f.new_obj(
            SpellId::Entangle,
            ObjKind::EntangleRestraint { target: guy, dc: 12, zone: zone_obj },
            dryad,
            vec![guy],
            true,
        );
        f.register_effect(guy, EffKey::RestrainedOverride, r_obj, Some(10));
        f.register_effect(guy, EffKey::EscapableRestraint, r_obj, Some(10));

        game.cache_revision = None;
        let state = game.state();
        let acts = state.get("actions").and_then(Value::as_array).unwrap();
        let fa_id = acts.iter()
            .find(|a| a.get("kind").and_then(Value::as_str) == Some("first_aid")
                && a.get("target_id").and_then(Value::as_str) == Some("ilyra"))
            .and_then(|a| a.get("id").and_then(Value::as_str))
            .expect("First Aid offered for adjacent dying ally")
            .to_string();
        let eg_id = acts.iter()
            .find(|a| a.get("kind").and_then(Value::as_str) == Some("escape_grapple")
                && a.get("target_id").and_then(Value::as_str) == Some("bugbear_warrior-1"))
            .and_then(|a| a.get("id").and_then(Value::as_str))
            .expect("Escape Grapple offered for grappler")
            .to_string();
        let bf_id = acts.iter()
            .find(|a| a.get("kind").and_then(Value::as_str) == Some("break_free")
                && a.get("target_id").is_none())
            .and_then(|a| a.get("id").and_then(Value::as_str))
            .expect("Break Free offered as self action")
            .to_string();

        // Execute First Aid and confirm chronicle log + 3D cue emitted
        let after_fa = game.perform(&fa_id).unwrap();
        let logs = after_fa.get("log").and_then(Value::as_array).unwrap();
        assert!(logs.iter().any(|e| e.get("text").and_then(Value::as_str).is_some_and(|t| t.contains("First Aid (Medicine"))));
        let effects = after_fa.get("effects").and_then(Value::as_array).unwrap();
        assert!(effects.iter().any(|e| e.get("variant").and_then(Value::as_str) == Some("first_aid")));

        // Execute Escape Grapple
        let st2 = game.state();
        let eg_id2 = st2.get("actions").and_then(Value::as_array).unwrap().iter()
            .find(|a| a.get("kind").and_then(Value::as_str) == Some("escape_grapple"))
            .and_then(|a| a.get("id").and_then(Value::as_str))
            .unwrap().to_string();
        let _ = eg_id;
        let after_eg = game.perform(&eg_id2).unwrap();
        assert!(after_eg.get("log").and_then(Value::as_array).unwrap().iter()
            .any(|e| e.get("text").and_then(Value::as_str).is_some_and(|t| t.contains("grapple ("))));
        assert!(after_eg.get("effects").and_then(Value::as_array).unwrap().iter()
            .any(|e| e.get("variant").and_then(Value::as_str) == Some("escape_grapple")));

        // Execute Break Free
        let st3 = game.state();
        let bf_id2 = st3.get("actions").and_then(Value::as_array).unwrap().iter()
            .find(|a| a.get("kind").and_then(Value::as_str) == Some("break_free"))
            .and_then(|a| a.get("id").and_then(Value::as_str))
            .unwrap().to_string();
        let _ = bf_id;
        let after_bf = game.perform(&bf_id2).unwrap();
        assert!(after_bf.get("log").and_then(Value::as_array).unwrap().iter()
            .any(|e| e.get("text").and_then(Value::as_str).is_some_and(|t| t.contains("break free from restraint") || t.contains("breaks free from restraint"))));
        assert!(after_bf.get("effects").and_then(Value::as_array).unwrap().iter()
            .any(|e| e.get("variant").and_then(Value::as_str) == Some("break_free")));
    }

    #[test]
    fn ai_v17_first_aid_scoring_and_corpse_investigate_pruning() {
        let level = LevelInput {
            encounter_id: "ai17".into(), preset_id: "test".into(), theme: "ossuary".into(),
            map_name: "room".into(), rows: ["........", "........", "........", "........"].into_iter().map(String::from).collect(),
            scene: json!({}), level_view: json!({}),
            heroes: vec!["elion".into(), "guy".into()],
            monsters: vec![("ghast-1".into(), "ghast".into(), "Ghast".into())],
            suggested_placements: vec![
                Placement { id: "elion".into(), x: 2, y: 2 },
                Placement { id: "guy".into(), x: 2, y: 1 },
                Placement { id: "ghast-1".into(), x: 3, y: 2 },
            ],
        };
        let mut game = WebArena::new(level, 3, 0, "csrf".into(), "enc".into()).unwrap();
        game.start().unwrap();
        let f = game.fight.as_mut().unwrap();
        let elion = f.units.iter().position(|u| u.id == "elion").unwrap();
        let guy = f.units.iter().position(|u| u.id == "guy").unwrap();
        let ghast = f.units.iter().position(|u| u.id == "ghast-1").unwrap();
        // 1) Adjacent dying ally with heal spell available -> FirstAid scored -0.5
        f.units[guy].hp = 0;
        f.units[guy].statuses.push(St::Unconscious);
        f.units[elion].action = 1;
        f.units[elion].bonus = 1;
        let cands = f.available_moves(elion);
        let (scores, _) = f.sort_with_scores(elion, &cands, None);
        let fa_idx = cands.iter().position(|a| matches!(a, Act::FirstAid { target } if *target == guy)).unwrap();
        assert_eq!(scores[fa_idx], -0.5);

        // 2) Ghast sees Guy, then Guy dies -> Ghast must prune Guy's corpse from known & investigate
        f.units[guy].hp = 10;
        f.units[guy].statuses.retain(|s| *s != St::Unconscious);
        let _ = f.observe_enemies(ghast);
        assert!(f.units[ghast].mem.known.iter().any(|(k, _)| *k == guy));
        f.units[guy].hp = 0;
        f.units[guy].statuses.push(St::Dead);
        let _ = f.observe_enemies(ghast);
        assert!(!f.units[ghast].mem.known.iter().any(|(k, _)| *k == guy));
        assert!(!f.units[ghast].mem.investigate.iter().any(|(p, _)| *p == (2, 1)));
    }

    #[test]
    fn web_v19_invisibility_shimmer_flag_and_attack_any_square_without_leaking_hidden() {
        let level = LevelInput {
            encounter_id: "unseen_v19".into(), preset_id: "test".into(), theme: "woodland".into(),
            map_name: "glade".into(),
            rows: [
                "........",
                "........",
                "........",
                "........",
                "........",
            ].into_iter().map(String::from).collect(),
            scene: json!({}), level_view: json!({}),
            heroes: vec!["ilyra".into()],
            monsters: vec![
                ("sprite-1".into(), "sprite".into(), "Sprite".into()),
                ("goblin_warrior-1".into(), "goblin_warrior".into(), "Goblin Warrior".into()),
            ],
            suggested_placements: vec![
                Placement { id: "ilyra".into(), x: 2, y: 2 },
                Placement { id: "sprite-1".into(), x: 3, y: 2 },
                Placement { id: "goblin_warrior-1".into(), x: 4, y: 2 },
            ],
        };
        let mut game = WebArena::new(level, 11, 0, "csrf".into(), "enc".into()).unwrap();
        game.start().unwrap();
        let f = game.fight.as_mut().unwrap();
        let ilyra = f.units.iter().position(|u| u.id == "ilyra").unwrap();
        let sprite = f.units.iter().position(|u| u.id == "sprite-1").unwrap();
        let goblin = f.units.iter().position(|u| u.id == "goblin_warrior-1").unwrap();
        f.turn_idx = f.order.iter().position(|&u| u == ilyra).unwrap();
        f.units[ilyra].action = 1;
        // 1) Sprite is invisible, NOT hidden -> location known, invisible_to_heroes = true, not hidden_from_heroes
        f.units[sprite].add_status(St::Invisible);
        // 2) Goblin is hidden (and invisible, so it stays concealed in open floor when moved) -> hidden_from_heroes = true
        f.units[goblin].add_status(St::Invisible);
        f.units[goblin].add_status(St::Hidden);
        f.units[goblin].hidden_stealth = Some(30);

        // Verify Fight::available_moves (batch trainer / AI path) does NOT offer empty squares!
        let ai_moves = f.available_moves(ilyra);
        assert!(
            !ai_moves.iter().any(|a| matches!(a, Act::BlindAttack { square: (1, 1), .. })),
            "batch trainer/AI action list must remain unchanged (no empty-square blind attacks)"
        );

        game.cache_revision = None;
        let st = game.state();
        let units = st.get("units").and_then(Value::as_array).unwrap();
        let sprite_v = units.iter().find(|u| u["id"] == "sprite-1").unwrap();
        let goblin_v = units.iter().find(|u| u["id"] == "goblin_warrior-1").unwrap();
        assert_eq!(sprite_v.get("invisible_to_heroes"), Some(&json!(true)));
        assert!(sprite_v.get("hidden_from_heroes").is_none());
        assert_eq!(goblin_v.get("hidden_from_heroes"), Some(&json!(true)));
        assert!(goblin_v.get("invisible_to_heroes").is_none());

        // Compare web actions with Goblin at (4, 2) vs Goblin moved to (7, 4):
        // Attack-a-square menu MUST be 100% identical (zero leak of hidden Goblin!).
        let acts_here: Vec<(String, i64, i64, bool)> = st["actions"].as_array().unwrap().iter()
            .filter(|a| a.get("square_attack") == Some(&json!(true)))
            .map(|a| (
                a["label"].as_str().unwrap().to_string(),
                a["x"].as_i64().unwrap(),
                a["y"].as_i64().unwrap(),
                a["disadvantage"].as_bool().unwrap_or(false),
            ))
            .collect();
        // Adjacent melee dagger & thrown dagger offered on empty square (1, 1), invisible Sprite (3, 2), and hidden Goblin (4, 2)
        assert!(acts_here.iter().any(|(l, x, y, dis)| l == "Dagger" && (*x, *y) == (1, 1) && *dis));
        assert!(acts_here.iter().any(|(l, x, y, dis)| l == "Dagger" && (*x, *y) == (3, 2) && *dis));
        assert!(acts_here.iter().any(|(l, x, y, dis)| l == "Dagger (thrown)" && (*x, *y) == (4, 2) && *dis));
        assert!(acts_here.iter().any(|(l, x, y, dis)| l == "Dagger (thrown)" && (*x, *y) == (5, 2) && *dis));

        game.fight.as_mut().unwrap().move_to(goblin, (7, 4));
        game.cache_revision = None;
        let st_moved = game.state();
        let acts_moved: Vec<(String, i64, i64, bool)> = st_moved["actions"].as_array().unwrap().iter()
            .filter(|a| a.get("square_attack") == Some(&json!(true)))
            .map(|a| (
                a["label"].as_str().unwrap().to_string(),
                a["x"].as_i64().unwrap(),
                a["y"].as_i64().unwrap(),
                a["disadvantage"].as_bool().unwrap_or(false),
            ))
            .collect();
        assert_eq!(acts_here, acts_moved, "hidden creature position must not alter square-attack menu");

        // Throw a Dagger at empty square (5, 2): spends action + spare dagger, logs miss at F3 with no leak
        let spares_before = game.fight.as_ref().unwrap().units[ilyra].spares.clone();
        let throw_empty_id = st_moved["actions"].as_array().unwrap().iter()
            .find(|a| a["label"] == "Dagger (thrown)" && a.get("square_attack") == Some(&json!(true))
                && a["x"] == 5 && a["y"] == 2)
            .unwrap()["id"].as_str().unwrap().to_string();
        let after = game.perform(&throw_empty_id).unwrap();
        assert_eq!(after["resources"]["action"], json!(0));
        let spares_after = game.fight.as_ref().unwrap().units[ilyra].spares.clone();
        assert_ne!(spares_before, spares_after, "thrown weapon ammo/spare must be spent on empty-square miss");
        assert!(after["log"].as_array().unwrap().iter().any(|e| {
            let t = e["text"].as_str().unwrap_or("");
            t.contains("Ilyra: dagger misses at F3") && t.contains("Disadvantage from unseen target")
        }), "empty-square attack must log miss without leaking");
        assert!(after["effects"].as_array().unwrap().iter().any(|e| {
            e["outcome"] == "miss" && e["target"]["x"] == 5 && e["target"]["y"] == 2
        }));
    }
}
