//! First-class partial information (`ObserverView`, `sense_of`, `EventFilter`)
//! and revision-bound `LegalAction` descriptors with canonical `CanonKey` sorting.

use serde::{Deserialize, Serialize};
use smallvec::SmallVec;

use crate::event::{Event, EventSubject};
use crate::fight::Fight;
use crate::interrupt::InterruptInfo;
use crate::types::{
    ActionId, FightPhase, Metamagic, Observer, Pos, SenseState, Team, UnitFlags, UnitId,
};

/// Structured payload of a legal action in `ember-core`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ActionPayload {
    Move(SmallVec<[Pos; 16]>),
    Attack {
        attack_idx: u8,
        target: UnitId,
        reaction: bool,
    },
    Dash,
    Disengage,
    Dodge,
    Stand,
    SecondWind,
    ActionSurge,
    InnateSorcery,
    CastSpell {
        spell_key: String,
        at_level: u8,
        free: bool,
        metamagic: Option<Metamagic>,
        targets: SmallVec<[UnitId; 4]>,
        point: Option<Pos>,
    },
    EndTurn,
}

/// Canonical sort key matching rule-18 `GenericController._canonical_key` ordering.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct CanonKey {
    pub kind: &'static str,
    pub spell: String,
    pub weapon: String,
    pub ids: Vec<String>,
    pub point: Vec<i32>,
    pub mm: &'static str,
    pub at_level: String,
    pub mode: &'static str,
    pub path: String,
    pub thrown: bool,
    pub paid: bool,
}

/// One legal action exposed to UI, Godot, AI, and replay drivers.
/// Always carries BOTH a revision-bound [`ActionId`] and a stable semantic `action_key`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct LegalAction {
    pub id: ActionId,
    /// Stable semantic key used in logs, tapes, and replays (e.g. `"attack:longsword:>ghast-1"`).
    pub action_key: String,
    pub kind: String,
    pub payload: ActionPayload,
}

/// Public per-unit view inside [`ObserverView`]. Never constructed for `Concealed` units.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct UnitView {
    pub id: UnitId,
    pub unit_key: String,
    pub name: String,
    pub team: Team,
    pub sense: SenseState,
    pub pos: Pos,
    pub hp: i16,
    pub max_hp: i16,
    pub temp_hp: i16,
    pub ac: i16,
    pub flags: UnitFlags,
    pub action: i8,
    pub bonus: i8,
    pub reaction: i8,
    pub movement_ft: i16,
}

/// Strictly redacted state snapshot returned by [`Fight::view`].
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ObserverView {
    pub fight_id: u64,
    pub revision: u64,
    pub round: i32,
    pub phase: FightPhase,
    pub active_unit: Option<UnitId>,
    pub can_act: bool,
    pub pending_interrupt: Option<InterruptInfo>,
    /// Strictly excludes any unit whose [`sense_of`] is [`SenseState::Concealed`].
    pub units: Vec<UnitView>,
}

/// Single visibility oracle (`ember-core::vision` contract).
/// Sole source of truth for targeting, legal actions, AI perception, and UI views.
pub fn sense_of(fight: &Fight, observer: Observer, target: UnitId) -> SenseState {
    match observer {
        Observer::Full => SenseState::Visible,
        Observer::Unit(obs) => sense_unit_to_unit(fight, obs, target),
        Observer::Team(team) => {
            if fight.unit(target).team == team {
                return SenseState::Visible;
            }
            let mut heard = false;
            for i in 0..fight.state.units.len() {
                let obs = UnitId(i as u8);
                let u = fight.unit(obs);
                if u.team != team || !u.flags.is_conscious() {
                    continue;
                }
                match sense_unit_to_unit(fight, obs, target) {
                    SenseState::Visible => return SenseState::Visible,
                    SenseState::HeardAt(_) => heard = true,
                    SenseState::Concealed => {}
                }
            }
            if heard {
                SenseState::HeardAt(fight.unit(target).pos)
            } else {
                SenseState::Concealed
            }
        }
    }
}

fn sense_unit_to_unit(fight: &Fight, observer: UnitId, target: UnitId) -> SenseState {
    if observer == target {
        return SenseState::Visible;
    }
    let obs = fight.unit(observer);
    let tgt = fight.unit(target);
    if obs.team == tgt.team {
        return SenseState::Visible;
    }
    // Hidden target: concealed unless observer's passive perception >= stealth (or blindsight)
    // AND observer has clear sight to the square.
    if let Some(stealth) = fight.hidden_stealth(target) {
        let obs_tmpl = fight.template_of(observer);
        let in_blindsight = obs_tmpl.blindsight > 0
            && obs.pos.feet_to(tgt.pos) <= obs_tmpl.blindsight as i32;
        if obs_tmpl.passive_perception < stealth && !in_blindsight {
            return SenseState::Concealed;
        }
    }
    if tgt.flags.contains(UnitFlags::INVISIBLE) {
        let negated = tgt.flags.intersects(UnitFlags::FAERIE_FIRE | UnitFlags::STARRY_WISP)
            || obs.flags.contains(UnitFlags::SEE_INVIS);
        if !negated {
            let obs_tmpl = fight.template_of(observer);
            let special_sense = obs_tmpl.blindsight.max(obs_tmpl.truesight);
            let sees_special = special_sense > 0
                && obs.pos.feet_to(tgt.pos) <= special_sense as i32
                && fight.grid.clear_sight(obs.pos, tgt.pos);
            if !sees_special {
                return SenseState::HeardAt(tgt.pos);
            }
        }
    }
    if fight.sees_lit_square(observer, tgt.pos) {
        SenseState::Visible
    } else if tgt.flags.contains(UnitFlags::HIDDEN) {
        SenseState::Concealed
    } else {
        SenseState::HeardAt(tgt.pos)
    }
}

/// Sole exit filter projecting raw combat events to an [`Observer`].
pub struct EventFilter;

impl EventFilter {
    pub fn project(fight: &Fight, event: &Event, observer: Observer) -> Option<Event> {
        if matches!(observer, Observer::Full) {
            return Some(event.clone());
        }
        let is_concealed = |u: UnitId| sense_of(fight, observer, u) == SenseState::Concealed;
        let project_subj = |s: &EventSubject, include_sq: bool| match *s {
            EventSubject::Unit(u) if is_concealed(u) => EventSubject::Unseen {
                square: include_sq.then(|| fight.unit(u).pos),
            },
            ref other => other.clone(),
        };
        match event {
            Event::TurnStarted { unit, round } => {
                if is_concealed(*unit) {
                    None
                } else {
                    Some(Event::TurnStarted { unit: *unit, round: *round })
                }
            }
            Event::TurnEnded { unit } => {
                if is_concealed(*unit) {
                    None
                } else {
                    Some(Event::TurnEnded { unit: *unit })
                }
            }
            Event::UnitMoved { unit, .. } => {
                if is_concealed(*unit) {
                    None
                } else {
                    Some(event.clone())
                }
            }
            Event::AttackResolved {
                attacker,
                target,
                weapon,
                reaction,
                hit,
                crit,
                damage,
                damage_type,
            } => {
                let atk_concealed = matches!(attacker, EventSubject::Unit(u) if is_concealed(*u));
                let tgt_concealed = matches!(target, EventSubject::Unit(u) if is_concealed(*u));
                if atk_concealed && tgt_concealed {
                    return None;
                }
                Some(Event::AttackResolved {
                    attacker: project_subj(attacker, true),
                    target: project_subj(target, true),
                    weapon: weapon.clone(),
                    reaction: *reaction,
                    hit: *hit,
                    crit: *crit,
                    damage: *damage,
                    damage_type: *damage_type,
                })
            }
            Event::DamageDealt { source, target, amount, damage_type } => {
                if matches!(target, EventSubject::Unit(u) if is_concealed(*u))
                    && source.as_ref().is_none_or(|s| matches!(s, EventSubject::Unit(u) if is_concealed(*u)))
                {
                    return None;
                }
                Some(Event::DamageDealt {
                    source: source.as_ref().map(|s| project_subj(s, false)),
                    target: project_subj(target, false),
                    amount: *amount,
                    damage_type: *damage_type,
                })
            }
            Event::EffectChanged { unit, .. } => {
                if is_concealed(*unit) {
                    None
                } else {
                    Some(event.clone())
                }
            }
            Event::Draw(_) => None,
            other => Some(other.clone()),
        }
    }
}
