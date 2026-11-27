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
    EscapeGrapple {
        grappler: UnitId,
    },
    DropGrapple {
        target: UnitId,
    },
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
    pub fight_id: u128,
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

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use super::*;
    use crate::effect::{EffectExpiry, EffectKind};
    use crate::event::NoopSink;
    use crate::step::{ContentDb, CreatureTemplate};
    use crate::types::{Dice, Dmg, DmgMask, EncounterSpec, Placement, Size, TemplateId};

    fn hidden_test_db() -> Arc<ContentDb> {
        let mut db = ContentDb::default();
        for (i, (key, team, pc)) in [("hero", Team::Heroes, true), ("monster", Team::Monsters, false)]
            .into_iter()
            .enumerate()
        {
            let tid = TemplateId(i as u16);
            db.template_by_key.insert(key.into(), tid);
            db.templates.push(CreatureTemplate {
                id: tid,
                key: key.into(),
                name: key.into(),
                team,
                pc,
                size: Size::Medium,
                undead: false,
                elf: false,
                construct: false,
                ac: 14,
                max_hp: 20,
                speed: 30,
                fly: false,
                abilities: [14, 14, 14, 10, 10, 10],
                prof_bonus: 2,
                save_prof: [false; 6],
                saves: [2, 2, 2, 0, 0, 0],
                init_bonus: if pc { 20 } else { 0 },
                init_adv: false,
                melee_reach_ft: Some(5),
                passive_perception: 10,
                darkvision: 60,
                blindsight: 0,
                truesight: 0,
                dmg_resist: DmgMask::empty(),
                dmg_immune: DmgMask::empty(),
                dmg_vuln: DmgMask::empty(),
                immune_poisoned: false,
                immune_paralyzed: false,
                immune_prone: false,
                immune_charmed: false,
                immune_frightened: false,
                immune_grappled: false,
                gear: vec![],
                spares: vec![],
                inventory: vec![],
                athletics_mod: 2,
                acrobatics_mod: 2,
                attacks: vec![],
                multiattack: vec![],
                fighter: false,
                fighter_level: 0,
                second_wind_uses: 0,
                second_wind_die: Dice::default(),
                action_surge_uses: 0,
                savage_attacker: false,
                great_weapon_fighting: false,
                improved_critical: false,
                remarkable_athlete: false,
                sorcerer: false,
                abduct: false,
                stench_dc: None,
                undead_fortitude: None,
                caster: None,
            });
        }
        db.recompute_hash();
        Arc::new(db)
    }

    #[test]
    fn observer_view_and_event_filter_conceal_hidden_enemy() {
        let db = hidden_test_db();
        let spec = EncounterSpec {
            units: vec!["hero".into(), "monster-1".into()],
            placements: vec![
                Placement { id: "hero".into(), x: 3, y: 3 },
                Placement { id: "monster-1".into(), x: 4, y: 3 },
            ],
            map_rows: Some(vec![
                "HHHHHHHH".into(),
                "H......H".into(),
                "H......H".into(),
                "H......H".into(),
                "H......H".into(),
                "HHHHHHHH".into(),
            ]),
            max_rounds: 20,
        };
        let mut fight = Fight::new(db, &spec, 99, 99).unwrap();
        let mut sink = NoopSink;
        fight.start(&mut sink).unwrap();

        let monster = UnitId(1);
        fight.unit_mut(monster).hidden_stealth = 18;
        fight.state.effects.add(
            monster,
            monster,
            EffectKind::Hidden { stealth_total: 18 },
            EffectExpiry::Manual,
            false,
            None,
        );
        fight.refresh_flags(monster);

        assert_eq!(sense_of(&fight, Observer::Team(Team::Heroes), monster), SenseState::Concealed);
        assert_eq!(sense_of(&fight, Observer::Team(Team::Monsters), monster), SenseState::Visible);
        assert_eq!(sense_of(&fight, Observer::Full, monster), SenseState::Visible);

        let hero_view = fight.view(Observer::Team(Team::Heroes));
        assert_eq!(hero_view.units.len(), 1);
        assert_eq!(hero_view.units[0].unit_key, "hero");
        assert_eq!(fight.view(Observer::Team(Team::Monsters)).units.len(), 2);
        assert_eq!(fight.view(Observer::Full).units.len(), 2);

        let move_ev = Event::UnitMoved {
            unit: monster,
            path: SmallVec::from_slice(&[Pos::new(4, 3), Pos::new(5, 3)]),
            cost_ft: 5,
        };
        assert!(EventFilter::project(&fight, &move_ev, Observer::Team(Team::Heroes)).is_none());
        assert!(EventFilter::project(&fight, &move_ev, Observer::Team(Team::Monsters)).is_some());

        let atk_ev = Event::AttackResolved {
            attacker: EventSubject::Unit(monster),
            target: EventSubject::Unit(UnitId(0)),
            weapon: "bite".into(),
            reaction: false,
            hit: true,
            crit: false,
            damage: 7,
            damage_type: Dmg::Piercing,
        };
        let projected = EventFilter::project(&fight, &atk_ev, Observer::Team(Team::Heroes))
            .expect("attack on visible hero is delivered with unseen attacker");
        match projected {
            Event::AttackResolved { attacker: EventSubject::Unseen { square: Some(sq) }, .. } => {
                assert_eq!(sq, Pos::new(4, 3));
            }
            other => panic!("expected redacted Unseen attacker, got {other:?}"),
        }
    }
}
