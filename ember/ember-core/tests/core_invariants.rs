//! Core architectural invariant tests for `ember-core` (Phase 0).
//!
//! Verifies:
//! 1. Mid-OA `ReactionMode::Interactive` pause -> `save_bytes` -> `load_bytes` ->
//!    `respond_reaction` -> duplicate reply rejected with `StaleActionId` leaving
//!    state/RNG/event_cursor untouched -> remainder matches uninterrupted run.
//! 2. Stale `ActionId` rejected with `StaleActionId` leaving state & RNG untouched.
//! 3. High-bit `u64` seed (`0xFEDC_BA98_7654_3210`) round-trips cleanly through
//!    `save_bytes` / `load_bytes` and produces identical rolls.
//! 4. `ObserverView` + `EventFilter` strictly conceal a Hidden enemy from the
//!    opposing team while exposing them to their own team and `Observer::Full`.
//! 5. `NoopSink` and `VecSink` produce identical final state, RNG, draws, and `event_cursor`.

use std::sync::Arc;

use ember_core::effect::{EffectExpiry, EffectKind};
use ember_core::{
    AbilityDef, ActionCost, ActionId, ActionPayload, AttackAbility, AttackKind, AttackTemplate,
    BranchPredicate, ContentDb, CoreError, CreatureTemplate, Dice, Dmg, DmgMask, EncounterSpec,
    Event, EventFilter, EventSubject, Fight, FightPhase, NoopSink, Observer, Placement, Pos,
    ReactionChoice, ReactionMode, SenseState, Size, Step, TargetMode, Team, TemplateId, UnitId,
    VecSink, sense_of,
};
use smallvec::SmallVec;

fn build_test_db() -> Arc<ContentDb> {
    let mut db = ContentDb::default();

    // Standard abilities
    let dash_id = ember_core::AbilityId(db.abilities.len() as u16);
    db.ability_by_key.insert("dash".into(), dash_id);
    db.abilities.push(AbilityDef {
        id: dash_id,
        key: "dash".into(),
        name: "Dash".into(),
        is_spell: false,
        base_level: 0,
        cost: ActionCost::Action,
        concentration: false,
        targeting: TargetMode::SelfOnly,
        steps: SmallVec::from_vec(vec![
            Step::ModifyResource { resource: ember_core::ResourceKind::Action, delta: -1 },
            Step::ModifyResource {
                resource: ember_core::ResourceKind::MovementAddSpeed,
                delta: 1,
            },
        ]),
    });

    // Longsword step program
    let sword_id = ember_core::AbilityId(db.abilities.len() as u16);
    db.ability_by_key.insert("weapon:hero:longsword".into(), sword_id);
    db.abilities.push(AbilityDef {
        id: sword_id,
        key: "weapon:hero:longsword".into(),
        name: "longsword".into(),
        is_spell: false,
        base_level: 0,
        cost: ActionCost::Action,
        concentration: false,
        targeting: TargetMode::SingleCreature { range_ft: 5, max_range_ft: 5 },
        steps: SmallVec::from_vec(vec![
            Step::AttackRoll {
                kind: AttackKind::WeaponMelee,
                range_ft: 5,
                melee_type: true,
                bonus_override: Some(5),
                tag: "attack".into(),
            },
            Step::RollDamage {
                dice: Dice::new(1, 8, 3),
                dmg_type: Dmg::Slashing,
                slot: 0,
                tag: "damage".into(),
                upcast_extra_dice: 0,
                savage: false,
                gwf: false,
                double_on_crit: true,
                combine_with_base: false,
                empowerable: false,
            },
            Step::Branch {
                predicate: BranchPredicate::Hit,
                then_steps: vec![Step::ApplyDamage {
                    slot: 0,
                    half_if_saved: false,
                    kill_at_zero: false,
                    graze_ability_mod: false,
                }],
                else_steps: vec![],
            },
        ]),
    });

    // Bite step program
    let bite_id = ember_core::AbilityId(db.abilities.len() as u16);
    db.ability_by_key.insert("weapon:monster:bite".into(), bite_id);
    db.abilities.push(AbilityDef {
        id: bite_id,
        key: "weapon:monster:bite".into(),
        name: "bite".into(),
        is_spell: false,
        base_level: 0,
        cost: ActionCost::Action,
        concentration: false,
        targeting: TargetMode::SingleCreature { range_ft: 5, max_range_ft: 5 },
        steps: SmallVec::from_vec(vec![
            Step::AttackRoll {
                kind: AttackKind::WeaponMelee,
                range_ft: 5,
                melee_type: true,
                bonus_override: Some(5),
                tag: "attack".into(),
            },
            Step::RollDamage {
                dice: Dice::new(1, 8, 3),
                dmg_type: Dmg::Piercing,
                slot: 0,
                tag: "damage".into(),
                upcast_extra_dice: 0,
                savage: false,
                gwf: false,
                double_on_crit: true,
                combine_with_base: false,
                empowerable: false,
            },
            Step::Branch {
                predicate: BranchPredicate::Hit,
                then_steps: vec![Step::ApplyDamage {
                    slot: 0,
                    half_if_saved: false,
                    kill_at_zero: false,
                    graze_ability_mod: false,
                }],
                else_steps: vec![],
            },
        ]),
    });

    let hero_tid = TemplateId(0);
    db.template_by_key.insert("hero".into(), hero_tid);
    db.templates.push(CreatureTemplate {
        id: hero_tid,
        key: "hero".into(),
        name: "Hero".into(),
        team: Team::Heroes,
        pc: true,
        size: Size::Medium,
        undead: false,
        elf: false,
        construct: false,
        ac: 16,
        max_hp: 30,
        speed: 30,
        fly: false,
        abilities: [16, 14, 14, 10, 10, 10],
        prof_bonus: 2,
        save_prof: [true, false, true, false, false, false],
        saves: [5, 2, 4, 0, 0, 0],
        init_bonus: 20, // guarantees hero acts first in tests
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
        gear: vec![("longsword".into(), 1.0)],
        spares: vec![],
        attacks: vec![AttackTemplate {
            name: "longsword".into(),
            ability_id: sword_id,
            melee_type: true,
            ranged: false,
            thrown: false,
            range_ft: 5,
            max_range_ft: 5,
            to_hit: 5,
            damage: Dice::new(1, 8, 3),
            damage_type: Dmg::Slashing,
            ability: AttackAbility::Str,
            versatile: None,
            savage: false,
            gwf: false,
            graze: false,
            sap: false,
            multiattack_group: None,
            bonus_action: false,
            save_attack: None,
            item: Some(0),
            additional: vec![],
            on_hit_paralyze: None,
        }],
        multiattack: vec![],
        fighter: true,
        fighter_level: 2,
        second_wind_uses: 1,
        second_wind_die: Dice::new(1, 10, 2),
        action_surge_uses: 1,
        savage_attacker: false,
        great_weapon_fighting: false,
        improved_critical: false,
        remarkable_athlete: false,
        sorcerer: false,
        stench_dc: None,
        undead_fortitude: None,
        caster: None,
    });

    let mon_tid = TemplateId(1);
    db.template_by_key.insert("monster".into(), mon_tid);
    db.templates.push(CreatureTemplate {
        id: mon_tid,
        key: "monster".into(),
        name: "Monster".into(),
        team: Team::Monsters,
        pc: false,
        size: Size::Medium,
        undead: true,
        elf: false,
        construct: false,
        ac: 13,
        max_hp: 30,
        speed: 30,
        fly: false,
        abilities: [16, 14, 12, 8, 10, 8],
        prof_bonus: 2,
        save_prof: [false; 6],
        saves: [3, 2, 1, -1, 0, -1],
        init_bonus: 0,
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
        attacks: vec![AttackTemplate {
            name: "bite".into(),
            ability_id: bite_id,
            melee_type: true,
            ranged: false,
            thrown: false,
            range_ft: 5,
            max_range_ft: 5,
            to_hit: 5,
            damage: Dice::new(1, 8, 3),
            damage_type: Dmg::Piercing,
            ability: AttackAbility::Fixed,
            versatile: None,
            savage: false,
            gwf: false,
            graze: false,
            sap: false,
            multiattack_group: None,
            bonus_action: false,
            save_attack: None,
            item: None,
            additional: vec![],
            on_hit_paralyze: None,
        }],
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
        stench_dc: None,
        undead_fortitude: None,
        caster: None,
    });

    Arc::new(db)
}

fn oa_spec() -> EncounterSpec {
    EncounterSpec {
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
    }
}

#[test]
fn mid_oa_interactive_save_load_duplicate_reject_and_parity() {
    let db = build_test_db();
    let spec = oa_spec();
    let seed = 0xFEDC_BA98_7654_3210u64; // High-bit u64 seed!

    // Uninterrupted Auto run
    let mut auto_fight = Fight::new(db.clone(), &spec, seed).unwrap();
    auto_fight.set_reaction_mode(ReactionMode::Auto);
    let mut sink_a = VecSink::default();
    auto_fight.start(&mut sink_a).unwrap();
    let move_away = auto_fight
        .legal_actions(Observer::Full)
        .into_iter()
        .find(|a| a.action_key == "move:3,3;2,3")
        .expect("move away from monster");
    auto_fight.apply(move_away.id, &mut sink_a).unwrap();

    // Interactive run with mid-OA save/load + duplicate reply rejection
    let mut inter = Fight::new(db.clone(), &spec, seed).unwrap();
    inter.set_reaction_mode(ReactionMode::Interactive);
    let mut sink_i = VecSink::default();
    inter.start(&mut sink_i).unwrap();

    let legal = inter.legal_actions(Observer::Full);
    let move_act = legal
        .iter()
        .find(|a| a.action_key == "move:3,3;2,3")
        .expect("move away");
    let out = inter.apply(move_act.id, &mut sink_i).unwrap();
    let FightPhase::AwaitingReaction { prompt_id, reactor } = out.phase else {
        panic!("expected AwaitingReaction, got {:?}", out.phase);
    };
    assert_eq!(inter.unit_key(reactor), "monster-1");

    // Save mid-reaction to bytes and reload!
    let saved = inter.save_bytes().expect("save_bytes mid-reaction");
    let mut restored = Fight::load_bytes(db.clone(), &saved).expect("load_bytes mid-reaction");
    assert_eq!(restored.phase(), out.phase);
    assert_eq!(restored.state.rng, inter.state.rng);

    // Respond to the OA prompt (take option 0 = bite)
    let reply = ReactionChoice { prompt_id, choice_index: Some(0) };
    restored.respond_reaction(reply, &mut sink_i).unwrap();
    let state_after = restored.state.clone();

    // Duplicate reply MUST fail with StaleActionId and leave state/RNG/cursor untouched!
    let dup = restored.respond_reaction(reply, &mut sink_i);
    assert!(matches!(dup, Err(CoreError::StaleActionId { .. })));
    assert_eq!(restored.state, state_after);

    // Final unit state, HP, position, RNG, and draws MUST match uninterrupted Auto run bit-for-bit!
    assert_eq!(restored.state.units, auto_fight.state.units);
    assert_eq!(restored.state.rng, auto_fight.state.rng);
    assert_eq!(restored.state.draws, auto_fight.state.draws);
    assert_eq!(restored.state_digest(), auto_fight.state_digest());
}

#[test]
fn stale_action_id_leaves_state_and_rng_untouched() {
    let db = build_test_db();
    let mut fight = Fight::new(db, &oa_spec(), 0x8000_0000_0000_1234).unwrap();
    let mut sink = NoopSink;
    fight.start(&mut sink).unwrap();

    let legal = fight.legal_actions(Observer::Full);
    let first = legal.iter().find(|a| a.action_key == "move:3,3;3,2").unwrap().id;
    let stale_id = ActionId { revision: first.revision + 99, ..first };

    let snap = fight.state.clone();
    let err = fight.apply(stale_id, &mut sink).unwrap_err();
    assert!(matches!(err, CoreError::StaleActionId { .. }));
    assert_eq!(fight.state, snap);

    // Apply a valid action, then re-submit the old ActionId -> must fail untouched!
    fight.apply(first, &mut sink).unwrap();
    let snap2 = fight.state.clone();
    let err2 = fight.apply(first, &mut sink).unwrap_err();
    assert!(matches!(err2, CoreError::StaleActionId { .. }));
    assert_eq!(fight.state, snap2);
}

#[test]
fn observer_view_and_event_filter_conceal_hidden_enemy() {
    let db = build_test_db();
    let mut fight = Fight::new(db, &oa_spec(), 99).unwrap();
    let mut sink = NoopSink;
    fight.start(&mut sink).unwrap();

    let monster = UnitId(1);
    // Mark monster-1 Hidden with Stealth 18 (> hero passive perception 10)
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

    // Single visibility oracle
    assert_eq!(sense_of(&fight, Observer::Team(Team::Heroes), monster), SenseState::Concealed);
    assert_eq!(sense_of(&fight, Observer::Team(Team::Monsters), monster), SenseState::Visible);
    assert_eq!(sense_of(&fight, Observer::Full, monster), SenseState::Visible);

    // ObserverView for Heroes MUST structurally omit the hidden monster!
    let hero_view = fight.view(Observer::Team(Team::Heroes));
    assert_eq!(hero_view.units.len(), 1);
    assert_eq!(hero_view.units[0].unit_key, "hero");

    // ObserverView for Monsters and Full see both units
    assert_eq!(fight.view(Observer::Team(Team::Monsters)).units.len(), 2);
    assert_eq!(fight.view(Observer::Full).units.len(), 2);

    // EventFilter conceals hidden unit movement and redacts hidden attacker to Unseen!
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

#[test]
fn noop_sink_matches_vec_sink_state_rng_and_event_cursor() {
    let db = build_test_db();
    let spec = oa_spec();
    let seed = 0x1234_5678_9ABC_DEF0u64;

    let mut f_noop = Fight::new(db.clone(), &spec, seed).unwrap();
    let mut f_vec = Fight::new(db, &spec, seed).unwrap();
    let mut noop = NoopSink;
    let mut vec = VecSink::default();

    f_noop.start(&mut noop).unwrap();
    f_vec.start(&mut vec).unwrap();
    assert!(!vec.events.is_empty());

    let atk = ActionPayload::Attack { attack_idx: 0, target: UnitId(1), reaction: false };
    let mut rng_n = f_noop.state.rng;
    let mut rng_v = f_vec.state.rng;
    let mut dn = ember_core::LiveDice { rng: &mut rng_n };
    let mut dv = ember_core::LiveDice { rng: &mut rng_v };
    f_noop.apply_payload_with_dice(UnitId(0), &atk, &mut dn, &mut noop).unwrap();
    f_vec.apply_payload_with_dice(UnitId(0), &atk, &mut dv, &mut vec).unwrap();
    f_noop.state.rng = rng_n;
    f_vec.state.rng = rng_v;

    assert_eq!(f_noop.state, f_vec.state);
    assert_eq!(f_noop.state.event_cursor, f_vec.state.event_cursor);
}

#[test]
fn oa_options_preserves_multi_target_enumeration_multiplicity() {
    let db = build_test_db();
    let spec = EncounterSpec {
        units: vec!["hero".into(), "monster-1".into(), "monster-2".into(), "monster-3".into()],
        placements: vec![
            Placement { id: "hero".into(), x: 3, y: 3 },
            Placement { id: "monster-1".into(), x: 4, y: 3 },
            Placement { id: "monster-2".into(), x: 3, y: 4 },
            Placement { id: "monster-3".into(), x: 4, y: 4 },
        ],
        map_rows: Some(vec![
            "HHHHHHHH".into(),
            "H......H".into(),
            "H......H".into(),
            "H......H".into(),
            "H......H".into(),
            "H......H".into(),
            "HHHHHHHH".into(),
        ]),
        max_rounds: 20,
    };
    let mut fight = Fight::new(db, &spec, 7).unwrap();
    let mut sink = NoopSink;
    fight.start(&mut sink).unwrap();
    let opts = fight.oa_options(UnitId(0), UnitId(1));
    assert_eq!(opts.len(), 3);
    for opt in opts {
        assert_eq!(
            opt,
            ember_core::ReactionOption::OpportunityAttack { attack_idx: 0, target: UnitId(1) }
        );
    }
}
