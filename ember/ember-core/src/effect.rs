//! Unified `ActiveEffect` slab replacing legacy `St`, `EffKey`/`EffObj`, and
//! `HookKind` registries with one compact `Copy` record and one central
//! lifecycle table, cached into a dirty-recomputed `u64` [`UnitFlags`] bitmask.

use serde::{Deserialize, Serialize};
use smallvec::SmallVec;

use crate::types::{Ability, EffectDefId, UnitFlags, UnitId};

/// Semantic category of an active effect entry.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EffectKind {
    // Core SRD 5.2.1 conditions
    Prone,
    Unconscious,
    Dead,
    Stable,
    Paralyzed,
    Incapacitated,
    Frightened,
    Hidden { stealth_total: i16 },
    Poisoned,
    Charmed,
    Grappled,
    Restrained,
    Invisible,
    Deafened,

    // Source-linked / timed combat effects
    /// Ghast Stench poison: Poisoned until the start of the bearer's next turn.
    StenchPoison,
    /// Weapon Mastery Sap: Disadvantage on next attack roll until start of wielder's next turn.
    Sap,
    /// Dodge action active until start of bearer's next turn (or until speed == 0 / incapacitated).
    Dodge,
    /// Disengage action active for the current turn.
    Disengage,
    /// Innate Sorcery active until `expires_game_time` (+1 Sorcerer spell DC, Adv on Sorcerer spell attacks).
    InnateSorcery,
    /// Timed Paralysis (e.g. Ghoul / Ghast claw): lasts until end of bearer's next turn.
    TimedParalyzed { skip_current_turn: bool },
    /// Data-defined effect from `ContentDb`.
    DataEffect { def_id: EffectDefId },
}

/// Central expiry trigger owned by one lifecycle pass (`expire_effects`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EffectExpiry {
    /// Never expires automatically (removed explicitly, e.g. `Stand`, healing, death).
    Manual,
    /// Expires at the start of the bearer's next turn (even if skipped/unconscious).
    StartOfBearerTurn,
    /// Expires at the end of the bearer's current or next turn (`skip_first` skips current turn).
    EndOfBearerTurn { skip_first: bool },
    /// Expires at the start of the source's next turn (even if skipped/unconscious).
    StartOfSourceTurn,
    /// Expires at the end of the source's next turn.
    EndOfSourceTurn { skip_first: bool },
    /// Expires when fight game time (`round * 6`) reaches `until_gt`.
    GameTime(i32),
    /// Expires at the end of the current turn of the bearer.
    EndOfCurrentTurn,
}

/// One compact (`Copy`, zero-allocation) active effect entry inside `FightState.effects`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ActiveEffect {
    pub id: u32,
    pub target: UnitId,
    pub source: UnitId,
    pub kind: EffectKind,
    pub expiry: EffectExpiry,
    pub concentration: bool,
    pub save_repeat: Option<(Ability, i16)>,
}

impl ActiveEffect {
    /// Contribution of this active effect to its target's cached [`UnitFlags`].
    #[inline]
    pub fn flag_bits(&self) -> UnitFlags {
        match self.kind {
            EffectKind::Prone => UnitFlags::PRONE,
            EffectKind::Unconscious => UnitFlags::UNCONSCIOUS,
            EffectKind::Dead => UnitFlags::DEAD,
            EffectKind::Stable => UnitFlags::STABLE,
            EffectKind::Paralyzed | EffectKind::TimedParalyzed { .. } => UnitFlags::PARALYZED,
            EffectKind::Incapacitated => UnitFlags::INCAPACITATED,
            EffectKind::Frightened => UnitFlags::FRIGHTENED,
            EffectKind::Hidden { .. } => UnitFlags::HIDDEN,
            EffectKind::Poisoned | EffectKind::StenchPoison => UnitFlags::POISONED,
            EffectKind::Charmed => UnitFlags::CHARMED,
            EffectKind::Grappled => UnitFlags::GRAPPLED,
            EffectKind::Restrained => UnitFlags::RESTRAINED,
            EffectKind::Invisible => UnitFlags::INVISIBLE,
            EffectKind::Deafened => UnitFlags::DEAFENED,
            EffectKind::Sap => UnitFlags::SAPPED,
            EffectKind::Dodge => UnitFlags::DODGING,
            EffectKind::Disengage => UnitFlags::DISENGAGED,
            EffectKind::InnateSorcery => UnitFlags::INNATE_SORCERY,
            EffectKind::DataEffect { .. } => UnitFlags::empty(),
        }
    }
}

/// Central active-effect slab stored inline inside `FightState`.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct EffectSlab {
    pub next_id: u32,
    pub entries: SmallVec<[ActiveEffect; 32]>,
}

impl EffectSlab {
    pub fn new() -> Self {
        Self { next_id: 1, entries: SmallVec::new() }
    }

    pub fn add(
        &mut self,
        target: UnitId,
        source: UnitId,
        kind: EffectKind,
        expiry: EffectExpiry,
        concentration: bool,
        save_repeat: Option<(Ability, i16)>,
    ) -> u32 {
        let id = self.next_id;
        self.next_id = self.next_id.wrapping_add(1).max(1);
        self.entries.push(ActiveEffect {
            id,
            target,
            source,
            kind,
            expiry,
            concentration,
            save_repeat,
        });
        id
    }

    /// Add a condition only if `target` does not already carry that exact `EffectKind`.
    pub fn add_unique(
        &mut self,
        target: UnitId,
        source: UnitId,
        kind: EffectKind,
        expiry: EffectExpiry,
    ) -> Option<u32> {
        if self.entries.iter().any(|e| e.target == target && e.kind == kind) {
            return None;
        }
        Some(self.add(target, source, kind, expiry, false, None))
    }

    pub fn remove_kind(&mut self, target: UnitId, kind: EffectKind) -> bool {
        let before = self.entries.len();
        self.entries.retain(|e| !(e.target == target && e.kind == kind));
        self.entries.len() != before
    }

    pub fn remove_by_id(&mut self, id: u32) -> bool {
        let before = self.entries.len();
        self.entries.retain(|e| e.id != id);
        self.entries.len() != before
    }

    pub fn has_kind(&self, target: UnitId, kind: EffectKind) -> bool {
        self.entries.iter().any(|e| e.target == target && e.kind == kind)
    }

    pub fn count_kind(&self, target: UnitId, pred: impl Fn(&EffectKind) -> bool) -> usize {
        self.entries.iter().filter(|e| e.target == target && pred(&e.kind)).count()
    }

    /// Compute cached [`UnitFlags`] for `target` at game time `gt`.
    pub fn compute_flags(&self, target: UnitId, gt: i32) -> UnitFlags {
        let mut flags = UnitFlags::empty();
        for e in &self.entries {
            if e.target != target {
                continue;
            }
            if let EffectExpiry::GameTime(until) = e.expiry {
                if gt >= until {
                    continue;
                }
            }
            flags |= e.flag_bits();
        }
        flags
    }

    /// Expire effects due at the start of `actor`'s turn (works even when `actor` is
    /// unconscious or skipped).
    pub fn expire_start_of_turn(&mut self, actor: UnitId, gt: i32) {
        self.entries.retain(|e| {
            if let EffectExpiry::GameTime(until) = e.expiry {
                if gt >= until {
                    return false;
                }
            }
            match e.expiry {
                EffectExpiry::StartOfBearerTurn if e.target == actor => false,
                EffectExpiry::StartOfSourceTurn if e.source == actor => false,
                _ => true,
            }
        });
    }

    /// Expire source-linked start-of-turn effects (e.g. Sap applied by `actor`)
    /// without clearing bearer-start effects just applied during `start_turn`
    /// (such as Ghast Stench).
    pub fn expire_source_start_of_turn(&mut self, actor: UnitId, gt: i32) {
        self.entries.retain(|e| {
            if let EffectExpiry::GameTime(until) = e.expiry {
                if gt >= until {
                    return false;
                }
            }
            !matches!(e.expiry, EffectExpiry::StartOfSourceTurn if e.source == actor)
        });
    }

    /// Expire effects due at the end of `actor`'s turn (including skipped turns and
    /// `TimedParalyzed` skip-first progression).
    pub fn expire_end_of_turn(&mut self, actor: UnitId, gt: i32) {
        let mut kept: SmallVec<[ActiveEffect; 32]> = SmallVec::new();
        for mut e in self.entries.drain(..) {
            if let EffectExpiry::GameTime(until) = e.expiry {
                if gt >= until {
                    continue;
                }
            }
            if e.target == actor {
                match e.expiry {
                    EffectExpiry::EndOfCurrentTurn => continue,
                    EffectExpiry::EndOfBearerTurn { skip_first: true } => {
                        e.expiry = EffectExpiry::EndOfBearerTurn { skip_first: false };
                        if let EffectKind::TimedParalyzed { ref mut skip_current_turn } = e.kind {
                            *skip_current_turn = false;
                        }
                        kept.push(e);
                        continue;
                    }
                    EffectExpiry::EndOfBearerTurn { skip_first: false } => continue,
                    _ => {}
                }
            }
            if e.source == actor {
                match e.expiry {
                    EffectExpiry::EndOfSourceTurn { skip_first: true } => {
                        e.expiry = EffectExpiry::EndOfSourceTurn { skip_first: false };
                        kept.push(e);
                        continue;
                    }
                    EffectExpiry::EndOfSourceTurn { skip_first: false } => continue,
                    _ => {}
                }
            }
            kept.push(e);
        }
        self.entries = kept;
    }

    /// Expire any `GameTime` effects whose timestamp has elapsed.
    pub fn expire_game_time(&mut self, gt: i32) {
        self.entries.retain(|e| match e.expiry {
            EffectExpiry::GameTime(until) => gt < until,
            _ => true,
        });
    }
}
