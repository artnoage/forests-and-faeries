//! The decision API (GENERAL_ENV.md §4, §6.1): each creature is native (its
//! turns run through `Fight::advance`, the native AI) or external (a policy
//! picks every action). [`Control`] says which: a controller per team, plus
//! creatures that are external whatever their team's controller
//! (per-creature control, G6).
//!
//! This mirrors natural20 `GeneralArena.set_external(teams, units=...)` /
//! `decision()` / `step(row)` (G4a, G6, `scenarios/general/arena.py`),
//! decision for decision:
//!
//! * One decision = one native action of an external creature. Its rows are
//!   the native candidate list (`_compute_available_moves`) in canonical
//!   order, deduplicated, then End Turn.
//! * The decision runs `GenericController.move_for`'s code path up to the
//!   choice (`Fight::external_decision`), with the same side effects on the
//!   native memory (known enemies, investigation markers and their ageing,
//!   the unseen-creature memory), so the native scores at every state are
//!   the ones natural20 computes: `native_raw` (the adjusted score, End Turn
//!   0 in melee range else -inf), `native_dropped`, `native_choice`.
//! * A turned creature's flee step and a decision whose only row is End
//!   Turn are executed automatically (forced). Stand first is offered but
//!   not scored (the native AI stands before scoring).
//! * The executed move gets `move_for`'s bookkeeping (visited squares, the
//!   last four destinations), whatever the native choice was.
//! * The turn loop is `advance`'s: at most 24 executed actions, the turn
//!   ends when the actor can no longer act or the fight is over.
//! * With scores off only the memory updates of the scoring pass run (the
//!   second `_observe_enemies`, the marker ageing); no row, rule or die
//!   changes.
//!
//! `Env: Clone`: a clone is a snapshot, restoring is assignment
//! (`restore` can reseed the dice). In record and replay mode the external
//! decisions are written as natural20's off-policy `dec` events (an `ext`
//! block after the native fields), so `ember replay` checks a Rust game
//! against natural20 and an off-policy tape against Rust.

use std::collections::BTreeMap;
use std::sync::Arc;

use crate::ai::simplify_path;
use crate::content::ContentPool;
use crate::engine::{team_name, Act, Fight};
use crate::map::Grid;
use crate::spec::EncounterSpec;
use crate::tape::{DecExt, Ev, Placement};
use crate::trace::{FastRng, Trace};

/// Actions per turn, native and external alike (`GeneralArena.ACTION_CAP`).
pub const ACTION_CAP: u32 = 24;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum Controller {
    /// The native AI (`GeneralController.move_for`).
    #[default]
    Native,
    /// Every action is a decision for the caller.
    External,
}

impl Controller {
    pub fn parse(name: &str) -> Result<Controller, String> {
        match name {
            "native" => Ok(Controller::Native),
            "external" => Ok(Controller::External),
            _ => Err(format!("unknown controller {name:?} (native, external)")),
        }
    }
}

/// Who plays each creature: a controller per team (`[heroes, monsters]`),
/// plus creatures (unit indices, registration order) that are external
/// whatever their team's controller (natural20 `set_external(teams,
/// units=...)`). A creature is external when its team is or when it is
/// listed. `[Controller; 2]` converts into a `Control` with no listed units.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Control {
    pub teams: [Controller; 2],
    pub external_units: Vec<usize>,
}

impl Control {
    /// Only these creatures are external (both teams native).
    pub fn units(external_units: Vec<usize>) -> Control {
        Control { teams: [Controller::Native; 2], external_units }
    }

    /// Every creature is native.
    pub fn all_native(&self) -> bool {
        self.teams == [Controller::Native; 2] && self.external_units.is_empty()
    }

    /// Per creature (by unit index): external or not, for `teams[u]` the
    /// creatures' teams. Errors on a listed index out of range.
    pub fn resolve(&self, teams: &[u8]) -> Result<Vec<bool>, String> {
        let mut ext: Vec<bool> = teams.iter().map(|&t| self.teams[t as usize] == Controller::External).collect();
        for &u in &self.external_units {
            match ext.get_mut(u) {
                Some(e) => *e = true,
                None => return Err(format!("external unit {u} out of range (0..{})", teams.len())),
            }
        }
        Ok(ext)
    }
}

impl From<[Controller; 2]> for Control {
    fn from(teams: [Controller; 2]) -> Control {
        Control { teams, external_units: Vec::new() }
    }
}

/// A decision executed without asking (GENERAL_ENV.md §4.2).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Forced {
    /// A turned creature's flee step (rows: the step, End Turn).
    Flee,
    /// End Turn is the only row.
    EndTurn,
}

impl Forced {
    pub fn name(self) -> &'static str {
        match self {
            Forced::Flee => "flee",
            Forced::EndTurn => "end_turn",
        }
    }
}

/// An offered decision the native AI takes without scoring.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Unscored {
    /// Prone and able to stand: `move_for` stands first.
    Stand,
}

impl Unscored {
    pub fn name(self) -> &'static str {
        match self {
            Unscored::Stand => "stand",
        }
    }
}

/// One decision of an external creature (natural20 `Decision`).
#[derive(Clone, Debug)]
pub struct Decision {
    /// The deciding creature (index into `Fight::units`) and its team.
    pub actor: usize,
    pub team: u8,
    /// Actions already executed in this turn (the cap is `ACTION_CAP`).
    pub step: u32,
    /// The rows: native candidates in canonical order, deduplicated, then
    /// `Act::EndTurn` (always last).
    pub legal: Vec<Act>,
    /// Native score per row after the scenario adjustments (the value the
    /// controller sorts by); End Turn 0.0 if an enemy is in melee range of
    /// the actor, else -inf. `None` when nothing was scored: a flee step,
    /// Stand first, or scores off.
    pub native_raw: Option<Vec<f64>>,
    /// Rows the controller removes before choosing (a negative score on a
    /// kind other than move and attack); End Turn never. `None` with `native_raw`.
    pub native_dropped: Option<Vec<bool>>,
    /// The row `move_for` returns (End Turn for none). `None` only with
    /// scores off on a scored decision.
    pub native_choice: Option<usize>,
    pub forced: Option<Forced>,
    pub unscored: Option<Unscored>,
    /// The native `dec` fields, kept in record and replay mode only.
    tape: Option<Box<DecTape>>,
}

/// The native fields of the `dec` event (`cands`, `scores`, `order`, `adj`).
#[derive(Clone, Debug, Default)]
struct DecTape {
    cands: Vec<String>,
    scores: Vec<f64>,
    order: Vec<i64>,
    adj: Vec<f64>,
}

impl Decision {
    /// Number of rows (End Turn included).
    pub fn len(&self) -> usize {
        self.legal.len()
    }

    pub fn is_empty(&self) -> bool {
        self.legal.is_empty()
    }

    /// The End Turn row (the last).
    pub fn end_turn_row(&self) -> usize {
        self.legal.len() - 1
    }

    /// The same decision with other rows (`ember_rs.BatchEnv(moves='dest')`:
    /// destination rows in place of the one-square moves) and the native
    /// arrays mapped onto them. Not a decision `Env::step` takes: only the
    /// encoder and the caller's row mapping read it.
    pub fn with_rows(
        &self,
        legal: Vec<Act>,
        native_raw: Option<Vec<f64>>,
        native_dropped: Option<Vec<bool>>,
        native_choice: Option<usize>,
    ) -> Decision {
        Decision { legal, native_raw, native_dropped, native_choice, tape: None, ..self.clone() }
    }
}

impl Fight {
    /// `GeneralArena._decide`: `GenericController.move_for` up to the choice
    /// for creature `u` (the current actor), with `step` actions already
    /// taken this turn. Runs the same calls in the same order as a native
    /// decision, so the native memory changes exactly as natively; draws no
    /// dice.
    pub fn external_decision(&mut self, u: usize, scores: bool, step: u32) -> Decision {
        let team = self.units[u].team;
        let on = self.trace.on();
        let blank = |legal: Vec<Act>| Decision {
            actor: u,
            team,
            step,
            legal,
            native_raw: None,
            native_dropped: None,
            native_choice: None,
            forced: None,
            unscored: None,
            tape: on.then(Default::default),
        };
        if self.units[u].incapacitated() {
            // A turned creature: its flee step (forced), else nothing to do.
            return match self.flee_step(u) {
                Some(path) => Decision {
                    native_choice: Some(0),
                    forced: Some(Forced::Flee),
                    ..blank(vec![Act::Move(path), Act::EndTurn])
                },
                None => Decision { native_choice: Some(0), forced: Some(Forced::EndTurn), ..blank(vec![Act::EndTurn]) },
            };
        }
        // Escape plans, grapple releases and must-flee fear come before the
        // list in move_for; no mirrored content has them (natural20 fails
        // closed for external creatures).
        let cands = self.available_moves(u);
        let stand = cands.iter().any(|a| matches!(a, Act::Stand));
        let (cands, row_of) = self.canonical(u, cands, true);
        let rows = row_of.last().map_or(0, |r| r + 1);
        let mut first = Vec::with_capacity(rows);
        for (i, &r) in row_of.iter().enumerate() {
            if r == first.len() {
                first.push(i);
            }
        }
        let descs: Option<Vec<String>> = on.then(|| cands.iter().map(|a| self.describe(u, a)).collect());
        if let Some(descs) = &descs {
            // Rows are deduplicated by canonical key; natural20 by descriptor.
            // They agree on every list (checked in record and replay mode).
            let mut seen: Vec<&str> = Vec::new();
            for (i, d) in descs.iter().enumerate() {
                let same_row = i > 0 && row_of[i] == row_of[i - 1];
                if same_row != (i > 0 && descs[i - 1] == *d) || (!same_row && seen.contains(&d.as_str())) {
                    panic!("{}: canonical keys and descriptors group candidates differently at {d}", self.units[u].id);
                }
                if !same_row {
                    seen.push(d);
                }
            }
        }
        let mut legal: Vec<Act> = first.iter().map(|&i| cands[i].clone()).collect();
        if self.creature_space_rules && (self.rule_version < 6 || self.units[u].t.pc) {
            legal.extend(crate::batch::movement_paths(self, u, 0, true, None).into_iter().map(Act::Move));
        }
        legal.push(Act::EndTurn);
        let end = legal.len() - 1;
        if stand {
            // move_for stands up before scoring anything (no second
            // _observe_enemies, no marker ageing).
            let row = legal.iter().position(|a| matches!(a, Act::Stand)).unwrap();
            return Decision { native_choice: Some(row), unscored: Some(Unscored::Stand), ..blank(legal) };
        }
        if !scores {
            // The scoring pass's memory updates without the scoring.
            self.observe_enemies(u);
            for m in self.units[u].mem.investigate.iter_mut() {
                m.1 += 1;
            }
            if legal.len() == 1 {
                return Decision { native_choice: Some(0), forced: Some(Forced::EndTurn), ..blank(legal) };
            }
            return blank(legal);
        }
        let mut adjusted = Vec::new();
        let (generic, fin) = self.sort_with_scores(u, &cands, Some(&mut adjusted));
        let mut raw = Vec::with_capacity(legal.len());
        let mut dropped = Vec::with_capacity(legal.len());
        for &i in &first {
            raw.push(adjusted[i].0);
            dropped.push(adjusted[i].1);
        }
        for (i, &r) in row_of.iter().enumerate() {
            let (s, d) = adjusted[i];
            if s != raw[r] || d != dropped[r] {
                panic!("{}: duplicate candidate {} with different scores", self.units[u].id, self.describe(u, &cands[i]));
            }
        }
        let melee = self.enemy_in_melee_range(u);
        raw.resize(end, f64::NEG_INFINITY);
        dropped.resize(end, false);
        raw.push(if melee { 0.0 } else { f64::NEG_INFINITY });
        dropped.push(false);
        // The native choice (move_for after scoring).
        let native = match fin.first() {
            None => end,
            Some(&(i, score)) => match &cands[i] {
                Act::Move(path) if (score < 0.0 && melee) || simplify_path(path).len() < 2 => end,
                _ => row_of[i],
            },
        };
        let tape = descs.map(|cands| {
            Box::new(DecTape {
                cands,
                scores: generic,
                order: fin.iter().map(|&(i, _)| i as i64).collect(),
                adj: fin.iter().map(|&(_, s)| s).collect(),
            })
        });
        Decision {
            native_raw: Some(raw),
            native_dropped: Some(dropped),
            native_choice: Some(native),
            forced: (legal.len() == 1).then_some(Forced::EndTurn),
            tape,
            ..blank(legal)
        }
    }
}

/// Counters over a whole game (the off-policy `end.ext` block plus turns
/// and actions).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Counts {
    /// Offered decisions, and those where the executed row was not the
    /// native choice.
    pub decisions: u64,
    pub differ: u64,
    pub forced_flee: u64,
    pub forced_end_turn: u64,
    /// Offered Stand-first decisions.
    pub stand: u64,
    /// Turns begun (`GeneralArena.turns_run`, the tape's `end.turns`).
    pub turns: u64,
    /// Actions executed by external creatures (forced flee steps included)
    /// and by native creatures.
    pub external_actions: u64,
    pub native_actions: u64,
}

/// What one `reset`/`step` call ran besides the chosen row.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct CallCounts {
    /// Forced decisions executed (flee steps and End-Turn-only decisions).
    pub forced: u32,
    /// Actions of native-controlled creatures.
    pub native_actions: u32,
}

/// The state of the game for terminal and truncation handling.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Outcome {
    /// Native elimination: one side has no conscious creature.
    pub finished: bool,
    /// The side left standing (`None` while running, at the horizon, or if
    /// both fell together).
    pub winner: Option<u8>,
    /// The round cap was reached with both sides standing.
    pub horizon: bool,
    /// The current round (0-based, as natural20's `battle.round`).
    pub round: i32,
    /// Per team: current hit points (dead creatures count 0), maximum hit
    /// points, conscious creatures, creatures.
    pub hp: [i32; 2],
    pub max_hp: [i32; 2],
    pub standing: [u32; 2],
    pub creatures: [u32; 2],
}

/// A game with native and external creatures (GENERAL_ENV.md §4.3).
#[derive(Clone)]
pub struct Env {
    pub fight: Fight,
    ctrl: Control,
    /// Per unit: external (resolved from `ctrl`).
    ext: Vec<bool>,
    scores: bool,
    /// The external turn in progress: (actor, actions executed).
    turn: Option<(usize, u32)>,
    pending: Option<Decision>,
    pub counts: Counts,
    /// Counts of the last `begin`/`step` call.
    pub last: CallCounts,
}

impl Env {
    /// Wrap a fight that has not started; `begin` starts it. (Replay builds
    /// the env first so a divergence during the start is still reported.)
    /// Panics on a listed external unit out of range.
    pub fn unstarted(fight: Fight, ctrl: impl Into<Control>, scores: bool) -> Env {
        assert!(fight.order.is_empty(), "Env needs a fight that has not started");
        let ctrl = ctrl.into();
        let teams: Vec<u8> = fight.units.iter().map(|u| u.team).collect();
        let ext = ctrl.resolve(&teams).unwrap_or_else(|e| panic!("{e}"));
        Env { fight, ctrl, ext, scores, turn: None, pending: None, counts: Counts::default(), last: CallCounts::default() }
    }

    /// `Arena.start` (initiative), then native turns and forced steps up
    /// to the first external decision.
    pub fn begin(&mut self) {
        self.fight.start();
        self.last = CallCounts::default();
        self.run_to_decision();
    }

    /// A started env on a fight that has not started.
    pub fn new(fight: Fight, ctrl: impl Into<Control>, scores: bool) -> Env {
        let mut env = Env::unstarted(fight, ctrl, scores);
        env.begin();
        env
    }

    /// Units by id (`<content>` for heroes, `<content>-<n>` for monsters, in
    /// registration order) on a map, with a free-mode dice stream.
    #[allow(clippy::too_many_arguments)]
    pub fn from_units(
        pool: &'static ContentPool,
        grid: Arc<Grid>,
        units: &[String],
        placements: &[Placement],
        max_rounds: i32,
        dice_seed: u64,
        ctrl: impl Into<Control>,
        scores: bool,
    ) -> Result<Env, String> {
        let ctrl = ctrl.into();
        let fight = Fight::on_map(pool, grid, units, placements, max_rounds, Trace::free(dice_seed))?;
        ctrl.resolve(&fight.units.iter().map(|u| u.team).collect::<Vec<_>>())?;
        Ok(Env::new(fight, ctrl, scores))
    }

    /// An `EncounterSpec` (natural20 JSON), validated.
    pub fn from_spec(
        spec: &EncounterSpec,
        pool: &'static ContentPool,
        max_rounds: i32,
        dice_seed: u64,
        ctrl: impl Into<Control>,
        scores: bool,
    ) -> Result<Env, String> {
        let enc = spec.validate(pool)?;
        Env::from_units(pool, enc.grid, &enc.units, &enc.placements, max_rounds, dice_seed, ctrl, scores)
    }

    /// The team controllers (creatures listed in [`Control::external_units`]
    /// are external whatever these say; see [`Env::is_external`]).
    pub fn controllers(&self) -> [Controller; 2] {
        self.ctrl.teams
    }

    pub fn control(&self) -> &Control {
        &self.ctrl
    }

    /// Whether unit `u`'s decisions go to the caller.
    pub fn is_external(&self, u: usize) -> bool {
        self.ext[u]
    }

    /// Change who plays each creature from now on (search: a fork may model
    /// a native opponent with a policy, or hand a team back to the native
    /// AI). Native memory is kept for external and native creatures alike
    /// (§4.2), so the switch changes no game state. The actor of an external
    /// turn in progress (the pending decision's) must stay external; native
    /// turns run whole inside `step`, so no other turn is in progress. An
    /// error changes nothing.
    pub fn set_control(&mut self, ctrl: impl Into<Control>) -> Result<(), String> {
        let ctrl = ctrl.into();
        let teams: Vec<u8> = self.fight.units.iter().map(|u| u.team).collect();
        let ext = ctrl.resolve(&teams)?;
        if let Some((actor, _)) = self.turn {
            if !ext[actor] {
                return Err(format!("unit {actor} is taking an external turn and must stay external"));
            }
        }
        self.ctrl = ctrl;
        self.ext = ext;
        Ok(())
    }

    pub fn scores(&self) -> bool {
        self.scores
    }

    /// Native scoring on or off from the next decision on (the pending one
    /// keeps what it has).
    pub fn set_scores(&mut self, scores: bool) {
        self.scores = scores;
    }

    /// The pending decision; `None` when the fight is over or the round cap
    /// is reached.
    pub fn decision(&self) -> Option<&Decision> {
        self.pending.as_ref()
    }

    pub fn done(&self) -> bool {
        self.pending.is_none()
    }

    /// Tape descriptors of the pending decision's rows (`end_turn` last).
    pub fn describe(&self) -> Vec<String> {
        match &self.pending {
            None => Vec::new(),
            Some(d) => d.legal.iter().map(|a| self.fight.describe(d.actor, a)).collect(),
        }
    }

    /// Execute row `row` of the pending decision, then forced steps and
    /// native turns until the next external decision or the end. An invalid
    /// call changes nothing.
    pub fn step(&mut self, row: usize) -> Result<(), String> {
        let n = match &self.pending {
            None => return Err("no pending decision".into()),
            Some(d) => d.legal.len(),
        };
        if row >= n {
            return Err(format!("row {row} out of range (0..{})", n - 1));
        }
        let d = self.pending.take().unwrap();
        self.last = CallCounts::default();
        self.apply(d, row);
        self.run_to_decision();
        Ok(())
    }

    /// Drop the pending decision: the game ends here (a trainer's step cap,
    /// `ember_rs.BatchEnv`'s `max_steps`). Later `step`s fail; `outcome`
    /// is unchanged.
    pub fn truncate(&mut self) {
        self.pending = None;
    }

    /// A snapshot (the whole game: fight, controllers, native memory, dice
    /// stream, pending decision).
    pub fn snapshot(&self) -> Env {
        self.clone()
    }

    /// Go back to `snap`; with `dice_seed`, the dice stream restarts from
    /// that seed (independent continuations of one state).
    pub fn restore(&mut self, snap: &Env, dice_seed: Option<u64>) {
        self.clone_from(snap);
        if let Some(seed) = dice_seed {
            self.fight.trace.reseed(seed);
        }
    }

    /// The same game with the units registered in another order: unit `i`
    /// becomes unit `perm[i]`, and every unit index in the state (map tokens,
    /// initiative order, native memory, effects, the pending decision) is
    /// remapped. For the observation encoder's invariance tests: the state
    /// is equivalent, but later play can differ (many loops run in unit
    /// order).
    pub fn permuted(&self, perm: &[usize]) -> Env {
        let n = self.fight.units.len();
        let mut seen = vec![false; n];
        assert_eq!(perm.len(), n, "permutation size");
        for &p in perm {
            assert!(p < n && !seen[p], "not a permutation");
            seen[p] = true;
        }
        let m = |i: usize| perm[i];
        let mut e = self.clone();
        let f = &mut e.fight;
        let mut units: Vec<Option<crate::engine::Unit>> = vec![None; n];
        for (old, u) in self.fight.units.iter().enumerate() {
            let mut u = u.clone();
            for k in u.mem.known.iter_mut() {
                k.0 = m(k.0);
            }
            for s in u.stench_poison.iter_mut().chain(u.stench_immune.iter_mut()) {
                *s = m(*s);
            }
            for c in u.casted.iter_mut() {
                c.0 = m(c.0);
            }
            for t in u.turned_by.iter_mut() {
                t.0 = m(t.0);
            }
            for t in u.frightened_by.iter_mut() {
                t.0 = m(t.0);
            }
            for t in u.source_fear.iter_mut() {
                t.0 = m(t.0);
            }
            for t in u.save_immune_to.iter_mut() {
                t.0 = m(t.0);
            }
            for x in u.unseen.iter_mut() {
                x.0 = m(x.0);
            }
            u.sap = u.sap.map(m);
            if let Some((_, cands)) = u.cleave.as_mut() {
                for c in cands.iter_mut() {
                    *c = m(*c);
                }
            }
            units[m(old)] = Some(u);
        }
        f.units = units.into_iter().map(Option::unwrap).collect();
        for o in f.occ.iter_mut() {
            *o = o.map(|x| m(x as usize) as u8);
        }
        for o in f.order.iter_mut() {
            *o = m(*o);
        }
        f.heightened = f.heightened.map(|(c, used)| (m(c), used));
        for obj in f.objs.iter_mut() {
            obj.source = m(obj.source);
            for t in obj.targets.iter_mut() {
                *t = m(*t);
            }
            use crate::effects::ObjKind;
            match &mut obj.kind {
                ObjKind::Aid { target, .. }
                | ObjKind::Command { target, .. }
                | ObjKind::Sanctuary { target, .. }
                | ObjKind::Breath { target, .. } => *target = m(*target),
                ObjKind::Spell | ObjKind::Force { .. } | ObjKind::Blur => {}
            }
        }
        f.move_cache = Default::default();
        for (old, &x) in self.ext.iter().enumerate() {
            e.ext[m(old)] = x;
        }
        for u in e.ctrl.external_units.iter_mut() {
            *u = m(*u);
        }
        e.turn = e.turn.map(|(a, k)| (m(a), k));
        if let Some(d) = e.pending.as_mut() {
            d.actor = m(d.actor);
            for act in d.legal.iter_mut() {
                match act {
                    Act::Attack { target, .. }
                    | Act::DivineSpark { target, .. }
                    | Act::Cleave { target, .. }
                    | Act::SpiritualWeaponAttack { target } => *target = m(*target),
                    Act::Spell(c) => {
                        for t in c.targets.iter_mut() {
                            *t = m(*t);
                        }
                    }
                    Act::PreserveLife(alloc) => {
                        for a in alloc.iter_mut() {
                            a.0 = m(a.0);
                        }
                    }
                    _ => {}
                }
            }
        }
        e
    }

    pub fn outcome(&self) -> Outcome {
        let f = &self.fight;
        let mut o = Outcome {
            finished: f.finished,
            winner: if f.finished { f.winner } else { None },
            horizon: !f.finished && f.round >= f.max_rounds,
            round: f.round,
            hp: [0; 2],
            max_hp: [0; 2],
            standing: [0; 2],
            creatures: [0; 2],
        };
        for (i, u) in f.units.iter().enumerate() {
            let t = u.team as usize;
            o.hp[t] += if u.dead() { 0 } else { u.hp.max(0) };
            o.max_hp[t] += f.max_hp_of(i);
            o.standing[t] += u.conscious() as u32;
            o.creatures[t] += 1;
        }
        o
    }

    /// The tape's `end` event (record and replay mode): the result, the turn
    /// count and, when a team is external, the decision counters.
    pub fn finish_trace(&mut self) {
        if !self.fight.trace.on() {
            return;
        }
        let ext = self.ext.contains(&true).then(|| {
            let c = &self.counts;
            let mut m = BTreeMap::new();
            for (k, v) in [
                ("decisions", c.decisions),
                ("differ", c.differ),
                ("forced_end_turn", c.forced_end_turn),
                ("forced_flee", c.forced_flee),
                ("stand", c.stand),
            ] {
                if v > 0 {
                    m.insert(k.to_string(), v as i64);
                }
            }
            m
        });
        let f = &self.fight;
        let ev = Ev::End {
            winner: if f.finished { f.winner.map(|t| team_name(t).to_string()) } else { None },
            finished: f.finished,
            round: f.round,
            turns: self.counts.turns as i64,
            decisions: 0,
            wall_s: 0.0,
            tally: serde_json::Value::Null,
            ext,
        };
        self.fight.trace.emit(ev);
    }

    // ------------------------------------------------------------------
    // The turn loop (`GeneralArena.decision` / `_apply_decision`)
    // ------------------------------------------------------------------

    fn run_to_decision(&mut self) {
        while self.pending.is_none() {
            let (actor, actions) = match self.turn {
                Some(t) => t,
                None => {
                    let f = &self.fight;
                    if f.finished || f.round >= f.max_rounds {
                        return;
                    }
                    let actor = f.current();
                    self.counts.turns += 1;
                    if !self.ext[actor] {
                        let before = self.fight.decisions;
                        self.fight.advance();
                        let n = self.fight.decisions - before;
                        self.counts.native_actions += n;
                        self.last.native_actions += n as u32;
                        continue;
                    }
                    self.turn = Some((actor, 0));
                    (actor, 0)
                }
            };
            if self.fight.finished || !self.fight.can_take_turn(actor) {
                self.close_turn();
                continue;
            }
            let d = self.fight.external_decision(actor, self.scores, actions);
            if d.forced.is_some() {
                self.last.forced += 1;
                let row = d.native_choice.unwrap();
                self.apply(d, row);
                continue;
            }
            self.pending = Some(d);
        }
    }

    /// The tail of `advance`: end the turn unless the fight is over.
    fn close_turn(&mut self) {
        self.turn = None;
        if !self.fight.finished {
            self.fight.arena_end_turn();
        }
    }

    /// `_apply_decision`: End Turn ends the turn; a move at an offered
    /// decision gets move_for's bookkeeping first; then the action and the
    /// 24-action cap.
    fn apply(&mut self, d: Decision, row: usize) {
        if self.fight.trace.on() {
            self.emit_decision(&d, row);
        }
        match d.forced {
            Some(Forced::Flee) => self.counts.forced_flee += 1,
            Some(Forced::EndTurn) => self.counts.forced_end_turn += 1,
            None => {
                self.counts.decisions += 1;
                if Some(row) != d.native_choice {
                    self.counts.differ += 1;
                }
                if d.unscored.is_some() {
                    self.counts.stand += 1;
                }
            }
        }
        let u = d.actor;
        let forced = d.forced.is_some();
        let mut act = d.legal.into_iter().nth(row).unwrap();
        if act == Act::EndTurn {
            self.close_turn();
            return;
        }
        if let (false, Act::Move(path)) = (forced, &mut act) {
            *path = simplify_path(path);
            if path.len() < 2 {
                self.close_turn(); // move_for would return None
                return;
            }
            let cells: Vec<usize> = path.iter().map(|p| self.fight.grid.index(p.0, p.1)).collect();
            let dest = *path.last().unwrap();
            let mem = &mut self.fight.units[u].mem;
            for c in cells {
                mem.visited.set(c);
            }
            mem.recent.push(dest);
            if mem.recent.len() > 4 {
                mem.recent.remove(0);
            }
        }
        self.fight.execute(act);
        self.counts.external_actions += 1;
        let t = self.turn.as_mut().expect("an external turn in progress");
        t.1 += 1;
        if t.1 >= ACTION_CAP {
            self.close_turn();
        }
    }

    /// The off-policy `dec` event: the native fields as native recording
    /// writes them, then the `ext` block.
    fn emit_decision(&mut self, d: &Decision, row: usize) {
        let f = &self.fight;
        let u = d.actor;
        let legal: Vec<String> = d.legal.iter().map(|a| f.describe(u, a)).collect();
        let chosen = match d.native_choice {
            Some(n) if n != d.end_turn_row() => legal[n].clone(),
            _ => "none".to_string(),
        };
        let raw = d.native_raw.as_ref().map(|r| {
            r.iter()
                .map(|&v| {
                    if v == f64::NEG_INFINITY {
                        None
                    } else {
                        assert!(v.is_finite(), "non-finite native score {v}");
                        Some(v)
                    }
                })
                .collect()
        });
        let ext = DecExt {
            legal,
            raw,
            dropped: d.native_dropped.clone(),
            native: d.native_choice,
            exec: row,
            forced: d.forced.map(|x| x.name().to_string()),
            unscored: d.unscored.map(|x| x.name().to_string()),
        };
        let t = d.tape.as_deref().cloned().unwrap_or_default();
        let ev = Ev::Dec {
            ctx: "turn".into(),
            who: f.units[u].id.clone(),
            cands: t.cands,
            scores: t.scores.into_iter().map(Some).collect(),
            order: t.order,
            adj: t.adj,
            chosen,
            multi_sort: false,
            ext: Some(ext),
        };
        self.fight.trace.emit(ev);
    }
}

/// Row pickers for tests, benchmarks and Rust-side recording, after the
/// recorder's choosers (`n20_record.py --chooser`); their random stream is
/// separate from the dice.
#[derive(Clone, Debug)]
pub enum ChooserKind {
    /// The native choice (needs scores).
    Native,
    Uniform,
    /// A uniform row with probability p, else the native choice.
    Eps(f64),
    /// Weights exp((raw - max) / T), End Turn's -inf weight 0; an unscored
    /// decision takes the native choice.
    Softmax(f64),
}

#[derive(Clone, Debug)]
pub struct Chooser {
    pub kind: ChooserKind,
    rng: FastRng,
}

impl Chooser {
    /// `native`, `uniform`, `eps:<p>`, `softmax:<T>`.
    pub fn parse(name: &str, seed: u64) -> Result<Chooser, String> {
        let (k, arg) = name.split_once(':').unwrap_or((name, ""));
        let num = || arg.parse::<f64>().map_err(|_| format!("chooser {name:?}: bad number"));
        let kind = match k {
            "native" | "ext-native" if arg.is_empty() => ChooserKind::Native,
            "uniform" if arg.is_empty() => ChooserKind::Uniform,
            "eps" => {
                let p = num()?;
                if !(0.0..=1.0).contains(&p) {
                    return Err(format!("chooser {name:?}: p must be in [0, 1]"));
                }
                ChooserKind::Eps(p)
            }
            "softmax" => {
                let t = num()?;
                if t.partial_cmp(&0.0) != Some(std::cmp::Ordering::Greater) {
                    return Err(format!("chooser {name:?}: T must be > 0"));
                }
                ChooserKind::Softmax(t)
            }
            _ => return Err(format!("unknown chooser {name:?} (native, uniform, eps:<p>, softmax:<T>)")),
        };
        Ok(Chooser { kind, rng: FastRng::new(seed) })
    }

    fn unit(&mut self) -> f64 {
        (self.rng.next_u64() >> 11) as f64 * (1.0 / (1u64 << 53) as f64)
    }

    fn native(d: &Decision) -> usize {
        d.native_choice.expect("the native chooser needs native scores")
    }

    pub fn pick(&mut self, d: &Decision) -> usize {
        let n = d.legal.len() as i32;
        match self.kind {
            ChooserKind::Native => Chooser::native(d),
            ChooserKind::Uniform => (self.rng.die(n) - 1) as usize,
            ChooserKind::Eps(p) => {
                if self.unit() < p {
                    (self.rng.die(n) - 1) as usize
                } else {
                    Chooser::native(d)
                }
            }
            ChooserKind::Softmax(t) => {
                let Some(raw) = &d.native_raw else { return Chooser::native(d) };
                let top = raw.iter().copied().filter(|v| *v != f64::NEG_INFINITY).fold(f64::NEG_INFINITY, f64::max);
                let w: Vec<f64> =
                    raw.iter().map(|&v| if v == f64::NEG_INFINITY { 0.0 } else { ((v - top) / t).exp() }).collect();
                let u = self.unit() * w.iter().sum::<f64>();
                let mut acc = 0.0;
                for (k, &x) in w.iter().enumerate() {
                    acc += x;
                    if x > 0.0 && u < acc {
                        return k;
                    }
                }
                w.iter().rposition(|&x| x > 0.0).unwrap_or(0)
            }
        }
    }
}
