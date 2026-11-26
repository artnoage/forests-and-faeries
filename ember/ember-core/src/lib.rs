//! `ember-core`: single-threaded, Wasm-clean SRD 5.2.1 tactical combat core.
//!
//! Architecture invariants:
//! - Zero `rayon`, `pyo3`, `godot`, filesystem I/O, or OS thread dependencies.
//! - Zero version-switching branches (one clean SRD 5.2.1 ruleset per build).
//! - Unified `ActiveEffect` slab cached into a dirty-recomputed `u64 UnitFlags`.
//! - Explicit nested `PendingInterrupt` stack supporting both automatic and
//!   interactive mid-reaction pause/save/load.
//! - Compile-time monomorphized `EventSink` (`NoopSink` compiles away completely).
//! - First-class partial information via `ObserverView` + `EventFilter`.

pub mod effect;
pub mod event;
pub mod fight;
pub mod grid;
pub mod interrupt;
pub mod resolve;
pub mod rng;
pub mod step;
pub mod types;
pub mod view;

pub use effect::{ActiveEffect, EffectExpiry, EffectKind, EffectSlab};
pub use event::{Event, EventSink, EventSubject, NoopSink, OracleSink, VecSink};
pub use fight::{Fight, FightMeta, FightState, UnitState};
pub use grid::{Grid, EMBER_VAULT_ROWS};
pub use interrupt::{
    ActionContinuation, InterruptFrame, InterruptInfo, InterruptKind, InterruptStack,
    ReactionChoice, ReactionOption,
};
pub use rng::{DiceSource, DrawRecord, DrawVal, FastRng, LiveDice, SuppliedDraws};
pub use step::{
    AbilityDef, ActionCost, AttackAbility, AttackKind, AttackTemplate, BranchPredicate,
    CasterTemplate, ContentDb, CreatureTemplate, DcExpr, EffectDef, MoveMode, ReactionWindowKind,
    ResourceKind, SpecialKind, SpellGrant, Step, TargetMode,
};
pub use types::{
    ability_mod, Ability, AbilityId, ActionId, CoreError, Dice, Dmg, DmgMask, EffectDefId,
    EncounterSpec, FightOutcome, FightPhase, Metamagic, Observer, Placement, Pos, ReactionMode,
    RollMode, SenseState, Size, SpellPayment, StateDigest, StepOutcome, Team, TemplateId,
    UnitDigest, UnitFlags, UnitId,
};
pub use view::{sense_of, ActionPayload, CanonKey, EventFilter, LegalAction, ObserverView, UnitView};
