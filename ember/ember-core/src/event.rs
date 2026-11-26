//! Zero-cost compile-time monomorphized event sink (`NoopSink` compiles away
//! completely in RL hot paths; `VecSink` and `OracleSink` capture typed events).

use serde::{Deserialize, Serialize};
use smallvec::SmallVec;

use crate::interrupt::InterruptInfo;
use crate::rng::DrawRecord;
use crate::types::{Dmg, FightOutcome, Pos, UnitId};

/// Subject of a combat event after [`crate::view::EventFilter`] projection.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum EventSubject {
    Unit(UnitId),
    Unseen { square: Option<Pos> },
}

/// Typed combat events emitted by `ember-core`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Event {
    CombatStarted,
    InitiativeRolled {
        unit: UnitId,
        total: i32,
    },
    TurnStarted {
        unit: UnitId,
        round: i32,
    },
    TurnEnded {
        unit: UnitId,
    },
    UnitMoved {
        unit: UnitId,
        path: SmallVec<[Pos; 8]>,
        cost_ft: i16,
    },
    AttackResolved {
        attacker: EventSubject,
        target: EventSubject,
        weapon: String,
        reaction: bool,
        hit: bool,
        crit: bool,
        damage: i32,
        damage_type: Dmg,
    },
    BlindMiss {
        attacker: UnitId,
        weapon: String,
        square: Pos,
    },
    DamageDealt {
        source: Option<EventSubject>,
        target: EventSubject,
        amount: i32,
        damage_type: Dmg,
    },
    Healed {
        target: UnitId,
        amount: i32,
    },
    EffectChanged {
        unit: UnitId,
        effect: String,
        added: bool,
    },
    ReactionPrompted(InterruptInfo),
    ReactionTriggered {
        reactor: UnitId,
        kind: String,
    },
    UnitFell {
        unit: UnitId,
        dead: bool,
    },
    DeathSaveRolled {
        unit: UnitId,
        face: i32,
        regained_hp: bool,
        stabilized: bool,
        died: bool,
    },
    CombatEnded(FightOutcome),
    Draw(DrawRecord),
}

/// Compile-time monomorphized event sink.
pub trait EventSink {
    /// Returns `false` for [`NoopSink`] so LLVM eliminates event construction.
    const ACTIVE: bool = true;

    fn emit(&mut self, event: Event);

    #[inline]
    fn emit_with(&mut self, f: impl FnOnce() -> Event) {
        if Self::ACTIVE {
            self.emit(f());
        }
    }
}

/// Zero-sized sink used in batch RL / MCTS hot paths: compiles to zero instructions.
#[derive(Clone, Copy, Debug, Default)]
pub struct NoopSink;

impl EventSink for NoopSink {
    const ACTIVE: bool = false;

    #[inline]
    fn emit(&mut self, _event: Event) {}
}

/// Buffered sink used by web presentation and Godot (`gdext`).
#[derive(Clone, Debug, Default)]
pub struct VecSink {
    pub events: Vec<Event>,
}

impl VecSink {
    pub fn new() -> Self {
        Self { events: Vec::new() }
    }

    pub fn take(&mut self) -> Vec<Event> {
        std::mem::take(&mut self.events)
    }
}

impl EventSink for VecSink {
    fn emit(&mut self, event: Event) {
        self.events.push(event);
    }
}

/// Oracle sink recording both structured events and primitive draws separately
/// for differential parity verification.
#[derive(Clone, Debug, Default)]
pub struct OracleSink {
    pub events: Vec<Event>,
    pub draws: Vec<DrawRecord>,
}

impl EventSink for OracleSink {
    fn emit(&mut self, event: Event) {
        if let Event::Draw(ref d) = event {
            self.draws.push(d.clone());
        }
        self.events.push(event);
    }
}
