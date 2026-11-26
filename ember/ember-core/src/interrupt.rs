//! Explicit nested `PendingInterrupt` stack (`SmallVec<[InterruptFrame; 4]>`).
//!
//! Preserves the full suspended parent action, remaining continuation, reacting
//! actor, paid costs, and revision-bound prompt ID across `save_bytes`/`load_bytes`
//! and `fork()` — enabling both automatic reaction resolution (Phases 0–7) and
//! interactive human reaction prompts (Godot Phase 1+ / optional UI).

use serde::{Deserialize, Serialize};
use smallvec::SmallVec;

use crate::types::{ActionId, Pos, UnitId};

/// Category of reaction or interrupt point.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum InterruptKind {
    OpportunityAttack,
    AttackRollReaction,
    DamageRollReaction,
    SaveReaction,
    CheckReaction,
    TargetGate,
}

/// One legal choice offered inside a pending reaction prompt.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReactionOption {
    /// Opportunity attack using `attack_idx` against `target`.
    OpportunityAttack { attack_idx: u8, target: UnitId },
    /// Decline the reaction window (keep reaction resource).
    Decline,
}

/// Caller's response to [`crate::fight::Fight::respond_reaction`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReactionChoice {
    pub prompt_id: ActionId,
    /// `Some(option_index)` to accept that option, or `None` to decline.
    pub choice_index: Option<u16>,
}

/// Public description of the top pending interrupt (emitted via `Event::ReactionPrompted`
/// and exposed to Godot / web UI).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct InterruptInfo {
    pub prompt_id: ActionId,
    pub kind: InterruptKind,
    pub reactor: UnitId,
    pub trigger_actor: UnitId,
    pub options: SmallVec<[ReactionOption; 8]>,
}

/// Continuation of a suspended parent action saved inside [`InterruptFrame`].
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ActionContinuation {
    /// Suspended `MoveUnit` paused just before `mover` leaves `reactor`'s reach.
    MoveResume {
        mover: UnitId,
        /// Full prepared move path (`[start, step1, ...]`).
        path: SmallVec<[Pos; 16]>,
        /// Current committed index in `path`.
        cursor: u8,
        /// Index in `path` where the current OA was triggered.
        trigger_index: u8,
        /// Whether `mover` was already Prone before this OA.
        was_prone: bool,
        /// Remaining `(reactor, leave_index)` opportunities along `path`.
        remaining_oas: SmallVec<[(UnitId, u8); 8]>,
    },
    /// No parent continuation (standalone interrupt frame).
    None,
}

/// One frame on the nested `PendingInterrupt` stack.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct InterruptFrame {
    pub prompt_id: ActionId,
    pub kind: InterruptKind,
    pub reactor: UnitId,
    pub trigger_actor: UnitId,
    pub options: SmallVec<[ReactionOption; 8]>,
    pub continuation: ActionContinuation,
}

impl InterruptFrame {
    pub fn info(&self) -> InterruptInfo {
        InterruptInfo {
            prompt_id: self.prompt_id,
            kind: self.kind,
            reactor: self.reactor,
            trigger_actor: self.trigger_actor,
            options: self.options.clone(),
        }
    }
}

/// Compact inline stack of up to 4 nested interrupts (zero heap allocation in normal play).
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct InterruptStack {
    pub frames: SmallVec<[InterruptFrame; 4]>,
}

impl InterruptStack {
    #[inline]
    pub fn is_empty(&self) -> bool {
        self.frames.is_empty()
    }

    #[inline]
    pub fn top(&self) -> Option<&InterruptFrame> {
        self.frames.last()
    }

    #[inline]
    pub fn push(&mut self, frame: InterruptFrame) {
        self.frames.push(frame);
    }

    #[inline]
    pub fn pop(&mut self) -> Option<InterruptFrame> {
        self.frames.pop()
    }
}
