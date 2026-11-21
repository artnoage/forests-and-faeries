//! One slot of the batched environment (GENERAL_ENV.md §8; the Python
//! `ember_rs.BatchEnv` in `ember-py/` holds one [`Game`] per slot): an
//! episode built from a catalog encounter and an [`EpisodeSpec`], its
//! controllers (per team and per creature), the trainer's objective and
//! potential (§8.4, natural20 `ember_rl/duel_env.py`), the step cap, and the
//! log that `record` replays into a tape.
//!
//! The `info` fields follow natural20 `ember_rl/general_env.py`
//! (`INFO_LAYOUT`, `validate_info`):
//! - `terminated`: native elimination (`task_end` 1) or, with the health
//!   objective, the horizon (`task_end` 2);
//! - `truncated`: the horizon under the native objective, or the step cap
//!   (`max_steps` external decisions);
//! - `winner` only at native elimination; `round` 1-based (natural20's
//!   `battle.round + 1`; at the horizon `max_rounds + 1`);
//! - `score` = `(1 - w)(H/H0 - M/M0) + w(standing_h/N_h - standing_m/N_m)`,
//!   with each creature's HP clamped to `[0, its starting HP]` (natural20
//!   `objectives.health_result`) and standing = alive with HP > 0
//!   (`duel_env._standing`); `potential` = 0.3 · score, 0 at any terminal;
//! - `moved`: squares actually walked by the deciding creature during the call.
//!
//! Destination moves ([`MoveMode::Dest`], GENERAL_ENV.md "Destination
//! moves"): the one-square move rows are replaced by one row per square the
//! actor can reach with the movement it has left (the shortest path, see
//! [`destinations`]). Each legal landing is one external move on the tape.
//! A crossing traverses consecutive occupied squares in that move. Reactions
//! and newly visible enemies can interrupt the walk ([`Game::step`]).

use std::sync::Arc;

use serde_json::{json, Value};

use crate::catalog::{Entry, Placed};
use crate::content::ContentPool;
use crate::encode::{encode_decision, masked_from, random_offset, Encoded, ObsSlot, Objective, S};
use crate::engine::{team_name, Act, Fight};
use crate::env::{CallCounts, Control, Controller, Decision, Env};
use crate::map::Pos;
use crate::tape::{ChooserHdr, Ev, Header, Tape};
use crate::trace::Trace;

/// `ember_rl/env.py` `POTENTIAL_SCALE`.
pub const POTENTIAL_SCALE: f64 = 0.3;

/// The natural20 commit whose rules this engine mirrors (written into the
/// header of tapes the environment records).
pub const NATURAL20_COMMIT: &str = include_str!("../reference/NATURAL20_COMMIT");

/// The environment's configuration (the `BatchEnv` constructor).
#[derive(Clone, Copy, Debug)]
pub struct EnvConfig {
    pub scores: bool,
    /// Objective `health_score` (true) or `native` (false).
    pub health: bool,
    /// The default horizon; a catalog encounter may override it.
    pub max_rounds: i32,
    pub standing_weight: f64,
    /// External decisions per game before a safety truncation.
    pub max_steps: u64,
}

impl EnvConfig {
    pub fn objective(&self) -> Objective {
        Objective { standing_weight: self.standing_weight as f32, health: self.health }
    }
}

/// One episode (natural20 `general_env.EpisodeSpec`). An offset below 0
/// means `random_offset(w, h, layout_seed)`, fixed for the episode.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EpisodeSpec {
    pub encounter: String,
    pub map_seed: u64,
    pub layout_seed: u64,
    pub dice_seed: u64,
    pub offset_x: i32,
    pub offset_y: i32,
}

/// A creature listed as external: by token index (registration order) or
/// by unit id.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum UnitRef {
    Index(usize),
    Id(String),
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum LogEntry {
    Row(u32),
    Reseed(u64),
    /// The controllers changed (`set_control`): the game no longer records.
    Control,
}

/// The `info` of one slot.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Info {
    pub done: bool,
    pub terminated: bool,
    pub truncated: bool,
    pub reset_terminal: bool,
    pub task_end: i8,
    pub winner: i8,
    pub team: i8,
    pub actor: i16,
    pub round: i32,
    pub score: f32,
    pub potential: f32,
    pub forced: i32,
    pub native_actions: i32,
    /// One-square moves of the deciding creature executed by the last call.
    pub moved: i32,
}

/// How the policy moves (`BatchEnv(moves=...)`).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum MoveMode {
    /// The native rows: one-square moves (natural20's action space).
    #[default]
    Step,
    /// One row per reachable square, walked as one-square moves.
    Dest,
}

impl MoveMode {
    pub fn parse(s: &str) -> Result<MoveMode, String> {
        match s {
            "step" => Ok(MoveMode::Step),
            "dest" => Ok(MoveMode::Dest),
            other => Err(format!("moves {other:?}: step or dest")),
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            MoveMode::Step => "step",
            MoveMode::Dest => "dest",
        }
    }
}

/// What a presented row does.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum RowKind {
    /// A row of the pending decision.
    Native(usize),
    /// Walk this path (start square first) as one-square moves.
    Walk(Vec<Pos>),
}

/// The pending decision with destination rows (`MoveMode::Dest`) and what
/// each row does: first the destinations ([`destinations`] order), then the
/// decision's other rows in their order, End Turn last. The native arrays
/// follow their rows. Native moves, including occupied-space crossings,
/// retain their scores. Routes built only for the external controller have no score.
pub fn dest_decision(env: &Env) -> Option<(Decision, Vec<RowKind>)> {
    let d = env.decision()?;
    let f = &env.fight;
    let native_row = |path: &[Pos]| d.legal.iter().position(|a| matches!(a, Act::Move(p) if p.as_slice() == path));
    let dests = destinations(f, d.actor, d.team, &d.legal);
    let mut legal = Vec::with_capacity(dests.len() + d.legal.len());
    let mut kinds = Vec::with_capacity(legal.capacity());
    let mut native: Vec<Option<usize>> = Vec::with_capacity(legal.capacity());
    let chosen_path = d.native_choice.and_then(|i| match &d.legal[i] {
        Act::Move(path) if f.rule_version() >= 6 && !f.units[d.actor].t.pc => Some(path),
        _ => None,
    });
    for mut path in dests {
        // One row per endpoint. Retain the controller's exact chosen route
        // when a cheaper path could reach the same tile with different reactions.
        if let Some(chosen) = chosen_path.filter(|p| p.last() == path.last() && **p != path) {
            path.clone_from(chosen);
        }
        native.push(if path.len() == 2 || f.rule_version() >= 6 && !f.units[d.actor].t.pc { native_row(&path) } else { None });
        legal.push(Act::Move(path.clone()));
        kinds.push(RowKind::Walk(path));
    }
    for (r, a) in d.legal.iter().enumerate() {
        if !matches!(a, Act::Move(_)) {
            native.push(Some(r));
            legal.push(a.clone());
            kinds.push(RowKind::Native(r));
        }
    }
    let raw = d.native_raw.as_ref().map(|raw| native.iter().map(|n| n.map_or(f64::NEG_INFINITY, |r| raw[r])).collect());
    let dropped = d.native_dropped.as_ref().map(|dr| native.iter().map(|n| n.is_some_and(|r| dr[r])).collect());
    let choice = d.native_choice.map(|c| native.iter().position(|n| *n == Some(c)).expect("the native choice is a presented row"));
    Some((d.with_rows(legal, raw, dropped, choice), kinds))
}

/// Reachable endpoints for the deciding team. First-step rows remain the
/// native rows. Beyond them an unseen blocker stops execution on contact.
pub fn destinations(f: &Fight, a: usize, team: u8, legal: &[Act]) -> Vec<Vec<Pos>> {
    movement_paths(f, a, masked_from(f, team), false, Some(legal))
}

const DIRECTIONS: [Pos; 8] = [(0, -1), (0, 1), (-1, 0), (1, 0), (-1, -1), (1, -1), (-1, 1), (1, 1)];

/// Count terrain and crawling while searching. In crossings-only mode the
/// first free square after occupied space ends the atomic move. Free
/// neighbours are already represented by the native one-square rows.
pub(crate) fn movement_paths(f: &Fight, a: usize, masked: u32, crossings_only: bool, first_rows: Option<&[Act]>) -> Vec<Vec<Pos>> {
    movement_paths_with_budget(f, a, masked, crossings_only, first_rows, f.units[a].available_movement() / 5)
}

pub(crate) fn movement_paths_with_budget(f: &Fight, a: usize, masked: u32, crossings_only: bool, first_rows: Option<&[Act]>, budget: i32) -> Vec<Vec<Pos>> {
    use std::cmp::Reverse;
    use std::collections::BinaryHeap;
    let g = &f.grid;
    let u = &f.units[a];
    let start = u.pos;
    if budget < if crossings_only { 2 } else { 1 } {
        return Vec::new();
    }
    if crossings_only && !DIRECTIONS.iter().any(|&(dx, dy)| f.token_at((start.0 + dx, start.1 + dy)).is_some()) {
        return Vec::new();
    }
    let hidden = |p| masked != 0 && f.token_at(p).is_some_and(|o| masked & (1 << o) != 0);
    let free = |p| hidden(p) || f.placeable(a, p);
    let mut best = vec![i32::MAX; g.cells()];
    let mut parent = vec![start; g.cells()];
    let mut frontier = BinaryHeap::new();
    let mut order = 0;
    let mut result = Vec::new();
    best[g.index(start.0, start.1)] = 0;
    // Seed the walk with actual native rows and whole legal crossings.
    // A hidden token can mask a later square, never the first action.
    let mut initial = vec![None; g.cells()];
    if let Some(rows) = first_rows.filter(|_| masked == 0 || f.rule_version < 7) {
        let mut seeds: Vec<_> = rows.iter().filter_map(|act| match act {
            Act::Move(p) if p.len() > 1 && p[0] == start => Some(p),
            _ => None,
        }).collect();
        seeds.sort_by_key(|p| DIRECTIONS.iter().position(|&(dx, dy)| (start.0 + dx, start.1 + dy) == p[1]));
        for path in seeds {
            let q = *path.last().unwrap();
            let idx = g.index(q.0, q.1);
            let cost = path[1..].iter().map(|&p| f.step_cost(a, p)).sum();
            if cost <= budget && cost < best[idx] {
                best[idx] = cost;
                initial[idx] = Some(path.as_slice());
                order += 1;
                frontier.push(Reverse((cost, order, q)));
            }
        }
    } else {
        frontier.push(Reverse((0, order, start)));
    }
    while let Some(Reverse((cost, _, p))) = frontier.pop() {
        if cost != best[g.index(p.0, p.1)] {
            continue;
        }
        if p != start && free(p) {
            let mut path = vec![p];
            let mut q = p;
            while q != start {
                let idx = g.index(q.0, q.1);
                if let Some(seed) = initial[idx] {
                    path.extend(seed[..seed.len() - 1].iter().rev().copied());
                    break;
                }
                q = parent[idx];
                path.push(q);
            }
            if !crossings_only || path.len() > 2 {
                path.reverse();
                result.push(path);
            }
            if crossings_only {
                continue;
            }
        }
        if cost >= budget {
            continue;
        }
        for (dx, dy) in DIRECTIONS {
            let q = (p.0 + dx, p.1 + dy);
            if !g.in_bounds(q.0, q.1) || (!hidden(q) && !f.passable(a, q)) {
                continue;
            }
            if f.rule_version >= 5 {
                if !g.clears_corner(p, q) { continue; }
            } else if u.t.pc && dx != 0 && dy != 0 && !(free((p.0 + dx, p.1)) && free((p.0, p.1 + dy))) {
                continue;
            }
            let next = cost + if hidden(q) { 1 + u.prone() as i32 } else { f.step_cost(a, q) };
            let idx = g.index(q.0, q.1);
            if next > budget || next >= best[idx] || f.step_toward_fear(a, p, q) {
                continue;
            }
            best[idx] = next;
            parent[idx] = p;
            initial[idx] = None;
            order += 1;
            frontier.push(Reverse((next, order, q)));
        }
    }
    result
}

/// One episode in one slot. `Clone` is a snapshot.
#[derive(Clone)]
pub struct Game {
    pub env: Env,
    pub spec: EpisodeSpec,
    pub entry: Arc<Entry>,
    pub placed: Arc<Placed>,
    /// Canvas offset of the map (§5.3).
    pub offset: (i32, i32),
    pub max_rounds: i32,
    start_hp: Vec<i32>,
    /// External decisions executed (`step` calls).
    pub steps: u64,
    /// Ended by the step cap.
    pub step_capped: bool,
    pub reset_terminal: bool,
    last: CallCounts,
    /// One-square moves of the deciding creature in the last call.
    moved: i32,
    log: Vec<LogEntry>,
    /// How the policy moves (destination rows or one-square moves).
    pub moves: MoveMode,
}

impl Game {
    /// Start an episode: place the encounter, run native turns and forced
    /// steps to the first external decision (or the end).
    pub fn new(
        entry: &Arc<Entry>,
        spec: &EpisodeSpec,
        teams: [Controller; 2],
        units: &[UnitRef],
        cfg: &EnvConfig,
        pool: &'static ContentPool,
    ) -> Result<Game, String> {
        Self::with_rule_version(entry, spec, teams, units, cfg, pool, crate::engine::CURRENT_RULE_VERSION)
    }

    /// Start on the rules of a recorded game, before the first decision.
    pub fn with_rule_version(
        entry: &Arc<Entry>,
        spec: &EpisodeSpec,
        teams: [Controller; 2],
        units: &[UnitRef],
        cfg: &EnvConfig,
        pool: &'static ContentPool,
        version: i32,
    ) -> Result<Game, String> {
        let placed = entry.place(spec.layout_seed)?;
        let max_rounds = entry.max_rounds.unwrap_or(cfg.max_rounds);
        let external_units = resolve_units(entry, units)?;
        let g = &entry.grid;
        let offset = if spec.offset_x < 0 || spec.offset_y < 0 {
            random_offset(g.w, g.h, spec.layout_seed)
        } else {
            if spec.offset_x + g.w > S as i32 || spec.offset_y + g.h > S as i32 {
                return Err(format!("a {}x{} map does not fit the {S}x{S} canvas at ({}, {})", g.w, g.h, spec.offset_x, spec.offset_y));
            }
            (spec.offset_x, spec.offset_y)
        };
        if spec.dice_seed > i64::MAX as u64 {
            return Err("dice_seed must be below 2**63".into());
        }
        let mut fight = Fight::on_map(pool, entry.grid.clone(), &entry.units, &placed.placements, max_rounds, Trace::free(spec.dice_seed))?;
        fight.set_rule_version(version);
        let start_hp = fight.units.iter().map(|u| u.hp).collect();
        let env = Env::new(fight, Control { teams, external_units }, cfg.scores);
        let mut game = Game {
            last: env.last,
            env,
            spec: spec.clone(),
            entry: entry.clone(),
            placed: Arc::new(placed),
            offset,
            max_rounds,
            start_hp,
            steps: 0,
            step_capped: false,
            reset_terminal: false,
            moved: 0,
            log: Vec::new(),
            moves: MoveMode::Step,
        };
        game.cap(cfg);
        game.reset_terminal = game.done();
        Ok(game)
    }

    fn cap(&mut self, cfg: &EnvConfig) {
        if !self.env.done() && self.steps >= cfg.max_steps {
            self.env.truncate();
            self.step_capped = true;
        }
    }

    pub fn done(&self) -> bool {
        self.env.done()
    }

    /// Rows the policy sees at the pending decision (0 when done).
    pub fn legal(&self) -> usize {
        match self.moves {
            MoveMode::Step => self.env.decision().map_or(0, |d| d.legal.len()),
            MoveMode::Dest => dest_decision(&self.env).map_or(0, |(d, _)| d.legal.len()),
        }
    }

    /// The pending decision as the policy sees it (`MoveMode::Dest`: the
    /// destination rows) and what each row does.
    pub fn presented(&self) -> Option<(Decision, Vec<RowKind>)> {
        match self.moves {
            MoveMode::Step => self.env.decision().map(|d| (d.clone(), (0..d.legal.len()).map(RowKind::Native).collect())),
            MoveMode::Dest => dest_decision(&self.env),
        }
    }

    /// Execute row `row` of the presented decision, then forced steps and
    /// native turns to the next external decision; the step cap applies
    /// after it (one policy decision, however many squares it walks).
    ///
    /// A destination row walks to each legal stopping square in turn,
    /// crossing occupied squares within a single move. It can stop
    /// earlier, after a step when the decision is no longer the walker's
    /// (its turn ended, the fight is over), when any creature used a
    /// reaction (an opportunity attack, Shield, Redirect Attack), when the
    /// walker's hit points, temporary hit points or conditions changed, or
    /// when it now sees a conscious enemy it did not see when the walk began;
    /// and before a step whose one-square move is not a row (blocked, a
    /// hidden creature, the can't-approach rule, no movement left).
    pub fn step(&mut self, row: usize, cfg: &EnvConfig) -> Result<(), String> {
        let kind = match self.moves {
            MoveMode::Step => RowKind::Native(row),
            MoveMode::Dest => {
                let (_, kinds) = dest_decision(&self.env).ok_or("no pending decision")?;
                let n = kinds.len();
                kinds.into_iter().nth(row).ok_or_else(|| format!("row {row} out of range (0..{})", n.max(1) - 1))?
            }
        };
        match kind {
            RowKind::Native(r) => {
                let movement = self.env.decision().and_then(|d| match d.legal.get(r) {
                    Some(Act::Move(path)) => Some((d.actor, path.clone())),
                    _ => None,
                });
                self.env.step(r)?;
                self.log.push(LogEntry::Row(r as u32));
                self.last = self.env.last;
                self.moved = movement.map_or(0, |(a, path)| {
                    path.iter().position(|&p| p == self.env.fight.units[a].pos).unwrap_or(0) as i32
                });
            }
            RowKind::Walk(path) => self.walk(&path)?,
        }
        self.steps += 1;
        self.cap(cfg);
        Ok(())
    }

    /// Execute each legal landing along the path. Contiguous occupied
    /// squares belong to a single move ending on the next free square.
    fn walk(&mut self, path: &[Pos]) -> Result<(), String> {
        let a = self.env.decision().ok_or("no pending decision")?.actor;
        let sees = |f: &Fight| -> u32 {
            let mut m = 0u32;
            for (e, u) in f.units.iter().enumerate() {
                if f.opposing(a, e) && u.conscious() && f.can_see(a, e) {
                    m |= 1 << e;
                }
            }
            m
        };
        let state = |f: &Fight| {
            let u = &f.units[a];
            let mut st: Vec<&'static str> = u.statuses.iter().map(|s| s.name()).collect();
            st.sort_unstable();
            (u.hp, u.temp_hp, st)
        };
        let reactions = |f: &Fight| -> Vec<i32> { f.units.iter().map(|u| u.reaction).collect() };
        let seen0 = sees(&self.env.fight);
        let mut counts = CallCounts::default();
        let mut moved = 0;
        let mut start = 0;
        let mut attempted = false;
        let hidden = if self.env.fight.rule_version() >= 7 {
            masked_from(&self.env.fight, self.env.fight.units[a].team)
        } else { 0 };
        let contact = |f: &Fight, p: Pos| f.token_at(p).is_some_and(|u| hidden & (1 << u) != 0);
        let limit = path.iter().skip(1).position(|&p| contact(&self.env.fight, p)).map_or(path.len(), |i| i + 1);
        let blocked = limit < path.len();
        let path = &path[..limit];
        while start + 1 < path.len() {
            let Some(d) = self.env.decision() else { break };
            if d.actor != a { break; }
            // A run of occupied squares is one MoveAction. Reactions resolve
            // along its whole path; the actor never overwrites another token.
            let f = &self.env.fight;
            let mut end = start + 1;
            while end < path.len() && f.passable(a, path[end]) && !f.placeable(a, path[end]) {
                end += 1;
            }
            if end == path.len() { break; }
            let segment = &path[start..=end];
            let Some(r) = d.legal.iter().position(|act| matches!(act, Act::Move(p) if p.as_slice() == segment)) else { break };
            attempted = true;
            let before = (state(&self.env.fight), reactions(&self.env.fight));
            self.env.step(r)?;
            self.log.push(LogEntry::Row(r as u32));
            counts.forced += self.env.last.forced;
            counts.native_actions += self.env.last.native_actions;
            let reached = self.env.fight.units[a].pos;
            moved += segment.iter().position(|&p| p == reached).unwrap_or(0) as i32;
            start = end;
            if reached != path[end] { break; }
            let f = &self.env.fight;
            let reacted = reactions(f).iter().zip(&before.1).any(|(now, was)| now < was);
            if self.env.decision().is_none_or(|d| d.actor != a) || reacted || state(f) != before.0 || sees(f) & !seen0 != 0 {
                break;
            }
        }
        if !attempted && !blocked {
            return Err("a destination row whose first step is not a row".into());
        }
        self.last = counts;
        self.moved = moved;
        Ok(())
    }

    /// Become `snap` (any slot's snapshot); with `dice_seed` the dice stream
    /// restarts from it. The last call's counters are cleared.
    pub fn restore(&mut self, snap: &Game, dice_seed: Option<u64>) {
        self.clone_from(snap);
        if let Some(seed) = dice_seed {
            self.env.fight.trace.reseed(seed);
            self.log.push(LogEntry::Reseed(seed));
        }
        self.last = CallCounts::default();
        self.moved = 0;
    }

    /// A copy of this game, as `restore` into an empty slot makes it: with
    /// `dice_seed` the copy's dice stream restarts from it (independent
    /// continuations of one state for search); the last call's counters are
    /// cleared.
    pub fn fork(&self, dice_seed: Option<u64>) -> Game {
        let mut g = self.clone();
        if let Some(seed) = dice_seed {
            g.env.fight.trace.reseed(seed);
            g.log.push(LogEntry::Reseed(seed));
        }
        g.last = CallCounts::default();
        g.moved = 0;
        g
    }

    /// Change who plays each creature from now on ([`Env::set_control`]):
    /// a search fork may model a native opponent with a policy. The pending
    /// decision's actor must stay external. Such a game no longer records a
    /// tape (`record` errors). An error changes nothing.
    pub fn set_control(&mut self, teams: [Controller; 2], units: &[UnitRef]) -> Result<(), String> {
        let external_units = resolve_units(&self.entry, units)?;
        self.env.set_control(Control { teams, external_units })?;
        self.log.push(LogEntry::Control);
        Ok(())
    }

    /// The heroes-perspective objective score (module doc).
    pub fn score(&self, standing_weight: f64) -> f64 {
        let f = &self.env.fight;
        let (mut hp, mut hp0, mut standing, mut count) = ([0i64; 2], [0i64; 2], [0i64; 2], [0i64; 2]);
        for (i, u) in f.units.iter().enumerate() {
            let t = u.team as usize;
            let start = self.start_hp[i] as i64;
            hp[t] += if u.dead() { 0 } else { (u.hp.max(0) as i64).min(start) };
            hp0[t] += start;
            standing[t] += (!u.dead() && u.hp > 0) as i64;
            count[t] += 1;
        }
        let frac = |a: i64, b: i64| if b > 0 { a as f64 / b as f64 } else { 0.0 };
        let health = frac(hp[0], hp0[0]) - frac(hp[1], hp0[1]);
        let stand = frac(standing[0], count[0]) - frac(standing[1], count[1]);
        (1.0 - standing_weight) * health + standing_weight * stand
    }

    pub fn info(&self, cfg: &EnvConfig) -> Info {
        let o = self.env.outcome();
        let terminated = o.finished || (o.horizon && cfg.health);
        let truncated = !terminated && (o.horizon || self.step_capped);
        let dec = self.env.decision();
        debug_assert_eq!(self.env.done(), terminated || truncated);
        let score = self.score(cfg.standing_weight);
        Info {
            done: terminated || truncated,
            terminated,
            truncated,
            reset_terminal: self.reset_terminal,
            task_end: if o.finished { 1 } else if terminated { 2 } else { 0 },
            winner: if o.finished { o.winner.map_or(-1, |w| w as i8) } else { -1 },
            team: dec.map_or(-1, |d| d.team as i8),
            actor: dec.map_or(-1, |d| d.actor as i16),
            round: o.round + 1,
            score: score as f32,
            potential: if terminated { 0.0 } else { (POTENTIAL_SCALE * score) as f32 },
            forced: self.last.forced as i32,
            native_actions: self.last.native_actions as i32,
            moved: self.moved,
        }
    }

    /// The observation (§5) of the presented decision (`team` `None` or its
    /// team) or a done game's final view of `team`, into `out`.
    pub fn encode(&self, team: Option<u8>, obj: &Objective, out: &mut ObsSlot) -> Result<Encoded, String> {
        match self.moves {
            MoveMode::Step => encode_decision(&self.env, self.env.decision(), team, self.offset, obj, out),
            MoveMode::Dest => {
                let pres = dest_decision(&self.env);
                encode_decision(&self.env, pres.as_ref().map(|p| &p.0), team, self.offset, obj, out)
            }
        }
    }

    /// Descriptors of the presented rows (a destination row: natural20's
    /// move descriptor of its whole path).
    pub fn describe(&self) -> Vec<String> {
        match self.presented() {
            None => Vec::new(),
            Some((d, _)) => d.legal.iter().map(|a| self.env.fight.describe(d.actor, a)).collect(),
        }
    }

    /// The placed encounter as a natural20 `EncounterSpec` dict (format 1).
    pub fn spec_json(&self) -> Value {
        self.entry.spec_json(&self.placed)
    }

    /// This game as a tape `ember replay` accepts: the episode is played
    /// again in record mode (same dice seed, rows and reseeds, scores on),
    /// checked against this game, and given a header with the units, squares,
    /// map rows, content `stats` and the `chooser` field (external teams and
    /// creatures: `"external"`). A game still running or ended by the step cap
    /// gives a partial tape (`meta.partial`: it stops at the pending decision).
    pub fn record(&self, pool: &'static ContentPool) -> Result<Tape, String> {
        if self.log.contains(&LogEntry::Control) {
            return Err("the game's controllers were changed mid-game (set_control, BatchEnv.fork with controllers): \
                        it has no tape"
                .into());
        }
        let e = &self.entry;
        let mut fight = Fight::on_map(pool, e.grid.clone(), &e.units, &self.placed.placements, self.max_rounds, Trace::recording(self.spec.dice_seed))?;
        fight.set_rule_version(self.env.fight.rule_version());
        let control = self.env.control().clone();
        let mut env = Env::new(fight, control.clone(), true);
        let mut reseeds = 0;
        for entry in &self.log {
            match *entry {
                LogEntry::Row(r) => env.step(r as usize)?,
                LogEntry::Reseed(s) => {
                    env.fight.trace.reseed(s);
                    reseeds += 1;
                }
                LogEntry::Control => unreachable!("checked above"),
            }
        }
        // `differ` depends on native scores (off in the played game), the rest must agree
        let key = |c: &crate::env::Counts| (c.decisions, c.forced_flee, c.forced_end_turn, c.stand, c.turns, c.external_actions, c.native_actions);
        if env.outcome() != self.env.outcome() || env.fight.trace.draws != self.env.fight.trace.draws || key(&env.counts) != key(&self.env.counts) {
            return Err("the recorded game differs from the played one".into());
        }
        let partial = !env.done();
        if !partial {
            env.finish_trace();
        }
        let events: Vec<Ev> = env.fight.trace.recorded();
        let mut stats = serde_json::Map::new();
        for uid in &e.units {
            stats.insert(uid.clone(), pool.stats_row(uid)?);
        }
        let name = |c: Controller| if c == Controller::External { "external" } else { "native" }.to_string();
        let chooser = (!control.all_native()).then(|| ChooserHdr {
            heroes: name(control.teams[0]),
            monsters: name(control.teams[1]),
            units: control.external_units.iter().map(|&u| (e.units[u].clone(), "external".to_string())).collect(),
            seed: Value::Null,
        });
        let s = &self.spec;
        let header = Header {
            version: self.env.fight.rule_version(),
            n20_commit: NATURAL20_COMMIT.trim().to_string(),
            units: e.units.clone(),
            placements: self.placed.placements.clone(),
            seed: s.dice_seed as i64,
            max_rounds: self.max_rounds,
            prefer: Vec::new(),
            meta: json!({
                "source": "ember_rs.BatchEnv",
                "ember_rs": env!("CARGO_PKG_VERSION"),
                "encounter": e.id,
                "map": e.map_name,
                "episode": {"encounter": s.encounter, "map_seed": s.map_seed, "layout_seed": s.layout_seed,
                            "dice_seed": s.dice_seed, "offset_x": s.offset_x, "offset_y": s.offset_y},
                "layout": self.placed.layout,
                "teams": {"heroes": name(control.teams[0]), "monsters": name(control.teams[1])},
                "external_units": control.external_units.iter().map(|&u| e.units[u].clone()).collect::<Vec<_>>(),
                "steps": self.steps,
                "reseeds": reseeds,
                "partial": partial,
                "step_capped": self.step_capped,
                "winner": if env.fight.finished { env.fight.winner.map(|t| team_name(t)) } else { None },
            }),
            stats: Value::Object(stats),
            map: Some(e.rows.clone()),
            chooser,
        };
        Ok(Tape { header, events })
    }
}

/// External creatures by token index (registration order), deduplicated;
/// errors on an index out of range or an unknown unit id.
fn resolve_units(entry: &Entry, units: &[UnitRef]) -> Result<Vec<usize>, String> {
    let n = entry.units.len();
    let mut external_units = Vec::with_capacity(units.len());
    for u in units {
        let i = match u {
            UnitRef::Index(i) if *i < n => *i,
            UnitRef::Index(i) => return Err(format!("external unit {i} out of range: {} has {n} creatures", entry.id)),
            UnitRef::Id(id) => entry.units.iter().position(|x| x == id).ok_or_else(|| format!("{} has no unit {id:?}", entry.id))?,
        };
        if !external_units.contains(&i) {
            external_units.push(i);
        }
    }
    Ok(external_units)
}
