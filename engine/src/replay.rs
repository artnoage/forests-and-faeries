//! Replay harness: run the engine on a recorded natural20 tape.

use std::panic::{catch_unwind, AssertUnwindSafe};
use std::path::Path;

use crate::content::ContentPool;
use crate::engine::{Fight, Notes};
use crate::env::{Control, Controller, Counts, Env};
use crate::map::Grid;
use crate::tape::{Ev, Header, Tape};
use crate::trace::{Divergence, Trace};

pub enum Outcome {
    /// Every event matched and the whole tape was consumed.
    /// `ext`: the external decisions checked, on off-policy tapes.
    Match { events: usize, draws: u64, decisions: u64, notes: Notes, ext: Option<Counts> },
    Diverged(Divergence),
    /// The engine stopped early or the tape has extra events.
    Incomplete { consumed: usize, remaining: usize },
    Crashed(String),
    /// The setup could not be built (unknown content, bad map, bad placement)
    /// or the exported content differs from the tape header's `stats`.
    Setup(String),
}

/// The fight a tape header describes: its units (by content id) on its map
/// (the `map` rows, else the Ember Vault), checked against the header's
/// `stats` (natural20's derived numbers per unit).
pub fn fight_for(h: &Header, pool: &'static ContentPool, trace: Trace) -> Result<Fight, String> {
    let grid = match &h.map {
        Some(rows) => Grid::shared(rows)?,
        None => Grid::ember_vault(),
    };
    check_stats(h, pool)?;
    let mut fight = Fight::on_map(pool, grid, &h.units, &h.placements, h.max_rounds, trace)?;
    fight.set_rule_version(h.version);
    fight.prefer = h.prefer.clone();
    Ok(fight)
}

/// Every unit's exported content against the header's `stats`.
pub fn check_stats(h: &Header, pool: &ContentPool) -> Result<(), String> {
    let stats = h.stats.as_object().ok_or("tape header has no stats")?;
    for uid in &h.units {
        let row = stats.get(uid).ok_or_else(|| format!("no stats for {uid}"))?;
        pool.check_stats(uid, row)?;
    }
    Ok(())
}

/// Silence the default panic message for divergences (they are reported).
pub fn install_quiet_hook() {
    let default = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |info| {
        if info.payload().downcast_ref::<Divergence>().is_some() {
            return;
        }
        default(info);
    }));
}

/// The controllers of a tape: a team with a non-native chooser in the
/// header (`n20_record.py --chooser`) is external, and so is a creature with
/// its own non-native chooser (`units`, G6). Panics on a listed creature
/// that is not in the header's `units`.
pub fn controllers_for(h: &Header) -> Control {
    let Some(c) = h.chooser.as_ref() else { return Control::default() };
    let teams = c.external().map(|e| if e { Controller::External } else { Controller::Native });
    let external_units = c
        .external_units()
        .into_iter()
        .map(|uid| h.units.iter().position(|u| u == uid).unwrap_or_else(|| panic!("chooser unit {uid} is not in the tape")))
        .collect();
    Control { teams, external_units }
}

/// A tape that stops at a pending external decision (`meta.partial`, written
/// by `ember_rs.BatchEnv.record` for a game still running or truncated by
/// the step cap): replay stops there instead of expecting the `end` event.
pub fn is_partial(h: &Header) -> bool {
    h.meta.get("partial").and_then(|v| v.as_bool()).unwrap_or(false)
}

/// The row natural20 executed at the external decision the trace is at
/// (the `exec` of the next `dec` event). Anything else is left to the event
/// comparison, which then reports the divergence.
pub fn tape_row(env: &Env) -> usize {
    let n = env.decision().map_or(1, |d| d.legal.len());
    match env.fight.trace.peek() {
        Some(Ev::Dec { ext: Some(x), .. }) if x.exec < n => x.exec,
        _ => env.decision().and_then(|d| d.native_choice).unwrap_or(n - 1),
    }
}

pub fn replay_tape(tape: &Tape) -> Outcome {
    let h = &tape.header;
    let trace = Trace::replay(tape.events.clone());
    let fight = match fight_for(h, ContentPool::global(), trace) {
        Ok(f) => f,
        Err(e) => return Outcome::Setup(e),
    };
    replay_fight_partial(fight, controllers_for(h), is_partial(h))
}

/// Run a fight whose trace is in replay mode to the end of its events.
/// Native tapes (both controllers native) run the native loop
/// (`Fight::run`); off-policy tapes run the decision API and execute the
/// tape's row at every external decision.
pub fn replay_fight(fight: Fight, ctrl: impl Into<Control>) -> Outcome {
    replay_fight_partial(fight, ctrl, false)
}

/// [`replay_fight`]; with `partial`, the tape may end at a pending external
/// decision (no `end` event).
pub fn replay_fight_partial(fight: Fight, ctrl: impl Into<Control>, partial: bool) -> Outcome {
    let ctrl = ctrl.into();
    let total = fight.trace.position() + fight.trace.remaining();
    let native = ctrl.all_native();
    let mut env = Env::unstarted(fight, ctrl, true);
    let result = catch_unwind(AssertUnwindSafe(|| {
        if native {
            env.fight.run();
        } else {
            env.begin();
            while !env.done() {
                if partial && env.fight.trace.remaining() == 0 {
                    return;
                }
                let row = tape_row(&env);
                env.step(row).unwrap();
            }
            env.finish_trace();
        }
    }));
    let fight = &env.fight;
    match result {
        Ok(()) => {
            let remaining = fight.trace.remaining();
            if remaining == 0 {
                let ext = (!native).then_some(env.counts);
                Outcome::Match { events: total, draws: fight.trace.draws, decisions: fight.decisions, notes: fight.notes, ext }
            } else {
                Outcome::Incomplete { consumed: fight.trace.position(), remaining }
            }
        }
        Err(payload) => match payload.downcast::<Divergence>() {
            Ok(div) => Outcome::Diverged(*div),
            Err(other) => {
                let msg = other
                    .downcast_ref::<String>()
                    .cloned()
                    .or_else(|| other.downcast_ref::<&str>().map(|s| s.to_string()))
                    .unwrap_or_else(|| "panic".into());
                Outcome::Crashed(format!("{msg} (at tape event #{})", fight.trace.position()))
            }
        },
    }
}

pub fn replay_file(path: &Path) -> Result<Outcome, String> {
    let tape = Tape::load(path).map_err(|e| e.to_string())?;
    Ok(replay_tape(&tape))
}
