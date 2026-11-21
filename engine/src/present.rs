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
use crate::map::{distance, Grid, Pos};
use crate::present_text;
use crate::spells::Cast;
use crate::tape::{DrawVal, Ev, Placement};
use crate::trace::Trace;
use crate::web_events::{DeathSave, SaveOutcome, WebEv};

const CURRENT_WEB_REPLAY_VERSION: u8 = 4;
const MAX_LOG: usize = 180;
const MAX_TIMELINE: usize = 64;
const MAX_EFFECTS: usize = 96;
const ACTION_CAP: usize = 24;

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
        fight.champion_moves_enabled = self.replay_version >= 2;
        fight.creature_space_rules = self.replay_version >= 3;
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
        for _ in 0..ACTION_CAP {
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
        let done = self.fight.as_mut().unwrap().finish_if_needed();
        if done && !was_finished {
            self.finished = true;
            let winner_team = self.fight.as_ref().unwrap().winner.map(|t| if t == 0 { "heroes" } else { "monsters" });
            self.winner = winner_team.map(str::to_string);
            let text = match winner_team {
                Some("heroes") => "The heroes are victorious.",
                Some("monsters") => "The monsters are victorious.",
                _ => "No one is left standing.",
            };
            let r = self.current_round();
            self.push_log(text, "end", r);
        }
        done
    }

    fn open_turn_loop(&mut self) {
        while !self.finish_if_needed() {
            let (actor, acted_ready) = self.fight.as_mut().unwrap().open_turn_step();
            let evs = self.fight.as_mut().unwrap().take_web_events();
            self.process_non_action_events(evs);
            let round = self.current_round();
            let who = self.unit_display_name(actor).to_string();
            if acted_ready {
                self.push_log(&format!("{who} — turn begins."), "turn", round);
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
            Act::InnateSorcery => self.push_log(&format!("{who} uses Innate Sorcery."), "spell", round),
            Act::ActionSurge => self.push_log(&format!("{who} uses Action Surge."), "spell", round),
            Act::DragonsBreathExhale => self.push_log(&format!("{who} uses Dragon's Breath: exhale."), "spell", round),
            Act::SpiritualWeaponAttack { .. } => self.push_log(&format!("{who} uses Spiritual Weapon: strike."), "spell", round),
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
        let moves = self.fight.as_ref().unwrap().prepare_move(mover, path);
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
        let mut oas = oas.into_iter();
        while let Some((reactor, index)) = oas.next() {
            let original: Vec<Pos> = moves[..index].to_vec();
            let was_prone = self.fight.as_ref().unwrap().units[mover].prone();
            let oa_act = self.fight.as_mut().unwrap().opportunity_attack_listener(reactor, mover);
            if let Some(Act::Attack { atk, target, .. }) = oa_act {
                let oa = Act::Attack { atk, target, reaction: true };
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
                let remaining = if stop { Vec::new() } else { oas.collect() };
                self.interrupted_move = Some(InterruptedMove {
                    champion: reactor, mover, requested: path.to_vec(),
                    moves: if stop { original } else { moves }, opportunities: remaining,
                });
                let name = self.unit_display_name(reactor).to_owned();
                self.push_log(&format!("{name} can move up to half speed after the critical hit."), "info", self.current_round());
                return;
            }
            if stop {
                moves = original;
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
            f.commit_move_segment(mover, moves);
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
            let d = distance(f.units[o].pos, vpos);
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
                let d = distance(f.units[o].pos, vpos);
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
                WebEv::Initiative { u, roll_total } => {
                    let uid = self.fight.as_ref().unwrap().units[u].id.clone();
                    self.initiative_rolls.insert(uid, roll_total);
                }
                WebEv::StenchSave { victim, victim_pos, passed } => {
                    let ghast = self.nearest_stench_source(victim);
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

        for ev in evs {
            match ev {
                WebEv::Redirected { boss, ally } if self.replay_version >= 3 => {
                    let text = format!("{} uses Redirect Attack. {} becomes the target.",
                                       self.unit_display_name(boss), self.unit_display_name(ally));
                    self.push_log(&text, "info", round);
                }
                WebEv::BlindHitTarget { target } => {
                    blind_hit_target = Some(target);
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
                    let pretty_atk = attack_name.replace('_', " ");
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
                        self.push_log(&format!("{tgt_name} {verb} against {src_name}'s {name}{damage}."), if hit { "hit" } else { "miss" }, round);
                    } else if hit {
                        let dt_str = dt.map_or("", |d| d.name());
                        let dmg_str = dmg_roll_fmt.as_deref().unwrap_or("");
                        let amount = if current_text { applied_damage } else { raw_damage };
                        self.push_log(
                            &format!("{src_name}: {pretty_atk} hits {tgt_name}{check}; {dmg_str} → {amount} {dt_str} damage."),
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
                        m.insert("amount".into(), json!(if hit { applied_damage.max(0) } else { 0 }));
                        m.insert("source".into(), json!({"x": src_pos.0, "y": src_pos.1}));
                        m.insert("target".into(), json!({"x": tgt_pos.0, "y": tgt_pos.1}));
                        m.insert("damage_type".into(), json!(if hit { dt.map_or("", |d| d.name()) } else { "" }));
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
                WebEv::RiderDamage { tgt, applied_damage, dt } => {
                    if self.replay_version >= 4 {
                        let name = self.unit_display_name(tgt);
                        self.push_log(&format!("{name} takes {applied_damage} additional {} damage.", dt.name()), "hit", round);
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
                WebEv::ShieldCast { u, pos } => {
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
                WebEv::Graze { src, tgt, src_pos, tgt_pos, dmg } => {
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
                WebEv::SpellHeal { caster, target, src_pos, tgt_pos, style_key, healed } => {
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
                WebEv::UndeadFortitude { u, pos, success } => {
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
                WebEv::StrengthDrain { attacker, target, src_pos, tgt_pos, drain, died } => {
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
                    let cells: Vec<[i32; 2]> = path.iter().map(|&(x, y)| [x, y]).collect();
                    if cells.len() >= 2 && cells[0] != *cells.last().unwrap() {
                        let name = self.unit_display_name(u).to_string();
                        let a = cells[0];
                        let b = *cells.last().unwrap();
                        self.push_log(&format!("{name} moves from [{}, {}] to [{}, {}].", a[0], a[1], b[0], b[1]), "info", round);
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
        }
        match act {
            Act::Dodge => items.push((src, "dodge", "DODGE")),
            Act::Dash => items.push((src, "dash", "DASH")),
            Act::DisengageBonus => items.push((src, "disengage_bonus", "DISENGAGE")),
            Act::HideBonus => items.push((src, "hide_bonus", "HIDE")),
            Act::Stand => items.push((src, "stand", "STAND")),
            Act::Rage => items.push((src, "rage", "RAGE")),
            Act::ExtendRage => items.push((src, "extend_rage", "RAGE")),
            Act::RecklessAttack => items.push((src, "reckless_attack", "RECKLESS")),
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
            return crate::batch::movement_paths(f, actor, 0, false, None).into_iter().map(Act::Move).collect();
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
                let sensed = if refresh {
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
                for (ai, def) in f.units[actor].t.attacks.iter().enumerate() {
                    if !f.can_attack(actor, ai) || !f.attack_available(actor, ai) {
                        continue;
                    }
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
                        non_spell.push(Act::Attack { atk: ai, target: t, reaction: false });
                    }
                    if let Some(ref s_list) = sensed {
                        if def.save_attack.is_none() {
                            let here = f.units[actor].pos;
                            let mut seen = Vec::new();
                            for &(sq, heard) in s_list {
                                if seen.contains(&sq) {
                                    continue;
                                }
                                seen.push(sq);
                                if !f.grid.in_bounds(sq.0, sq.1) || f.grid.is_wall(sq.0, sq.1) || sq == here {
                                    continue;
                                }
                                if distance(here, sq) * 5 > def.range_max || !f.grid.line_of_effect(here, sq) {
                                    continue;
                                }
                                non_spell.push(Act::BlindAttack { atk: ai, square: sq, heard });
                            }
                        }
                    }
                }

                let unit = &f.units[actor];
                if unit.action > 0 {
                    non_spell.push(Act::Dodge);
                    non_spell.push(Act::Dash);
                }
                if unit.t.second_wind_uses > 0 && unit.bonus > 0 && unit.second_wind_count > 0 && unit.hp < f.max_hp_of(actor) {
                    non_spell.push(Act::SecondWind);
                }
                if unit.t.action_surge_uses > 0 && !unit.action_surge_flag && unit.action_surge_count > 0 {
                    non_spell.push(Act::ActionSurge);
                }
                if unit.t.nimble_escape.is_some() && unit.bonus > 0 {
                    non_spell.push(Act::DisengageBonus);
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
                    Act::BlindAttack { atk, .. } => {
                        let def = &f.units[actor].t.attacks[*atk];
                        let thrown_s = py_bool_opt_str(Some(def.thrown));
                        (Vec::new(), Vec::new(), None, def.name, None, None, "None".into(), "None".into(), "None".into(), thrown_s, "None".into())
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
                    _ => (Vec::new(), Vec::new(), None, "", None, None, "None".into(), "None".into(), "None".into(), "None".into(), "None".into()),
                }
            };

            // `_human_filter`: area options need at least one opposing token on the map in the area!
            if let Some(pt) = point {
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
            "spell" | "dragons_breath_exhale" | "spiritual_weapon_attack" => "spell",
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
            "preserve_life" => "Preserve Life".to_string(),
            "innate_sorcery" => "Innate Sorcery".to_string(),
            "dragons_breath_exhale" => "Dragon's Breath: exhale".to_string(),
            "spiritual_weapon_attack" => "Spiritual Weapon: strike".to_string(),
            "disengage_bonus" => "Disengage".to_string(),
            "hide_bonus" => "Hide".to_string(),
            "rage" => "Rage".to_string(),
            "extend_rage" => "Extend Rage".to_string(),
            "reckless_attack" => "Reckless Attack".to_string(),
            "cleave" => "Cleave".to_string(),
            _ if spell_key.is_some() => present_text::spell_display_name(spell_key.unwrap()),
            "attack" => present_text::title_words(weapon),
            _ => present_text::title_words(kind),
        };

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
            "move" => {
                if let Act::Move(p) = &cand.act {
                    let steps = if self.replay_version >= 3 {
                        p.iter().skip(1).map(|&q| self.fight.as_ref().unwrap().step_cost(actor, q)).sum()
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
            "disengage_bonus" | "hide_bonus" | "rage" | "extend_rage" => "bonus action".to_string(),
            "reckless_attack" | "cleave" => "free".to_string(),
            _ => {
                let bonus = matches!(kind, "second_wind" | "spiritual_weapon_attack" | "innate_sorcery")
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

        let aim = point.or_else(|| if kind == "move" { dest } else { None });
        let mut view = Map::new();
        view.insert("id".into(), json!(format!("r{}-{index}", self.revision)));
        view.insert("kind".into(), json!(kind));
        view.insert("category".into(), json!(category));
        view.insert("label".into(), json!(label));
        if !(kind != "move" && (target_ids.len() > 1 || point.is_some())) {
            view.insert("description".into(), json!(description));
        }
        if !target_ids.is_empty() {
            view.insert("target_id".into(), json!(target_ids[0]));
            view.insert("target_ids".into(), json!(target_ids));
        }
        if let Some((ax, ay)) = aim {
            view.insert("x".into(), json!(ax));
            view.insert("y".into(), json!(ay));
        }
        view.insert("cost".into(), json!(cost));
        if let Some(c) = spell_opt {
            view.insert("spell".into(), json!(c.spell.key()));
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
                let hits: Vec<String> = caught.iter().filter(|&&u| f.opposing(actor, u)).map(|&u| f.units[u].id.clone()).collect();
                let allies: Vec<String> = caught.iter().filter(|&&u| !f.opposing(actor, u)).map(|&u| f.units[u].id.clone()).collect();
                if !hits.is_empty() {
                    view.insert("hits".into(), json!(hits));
                }
                if !allies.is_empty() {
                    view.insert("allies".into(), json!(allies));
                }
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
        json!({
            "action": unit.action,
            "bonus_action": unit.bonus,
            "reaction": unit.reaction,
            "movement": unit.movement,
            "pools": pools,
        })
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
            conds.sort_unstable();
            units.push(json!({
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
            }));
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
        if let Some(sheet) = present_text::unit_sheet_for_replay(&ru.content, ru.t.pc, hp, ac, self.replay_version) {
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

        let static_keys = ["kind", "category", "label", "cost", "spell", "spell_level", "at_level", "metamagic", "mode", "option"];
        let row_keys = ["target_ids", "x", "y", "area", "hits", "allies", "path"];

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
