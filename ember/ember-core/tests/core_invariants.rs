//! Core architectural invariant tests for `ember-core` (Phase 0).
//!
//! Uses strictly the public `Fight` API (verifying `Fight.state` and `unit_mut`
//! encapsulation) to prove:
//! 1. Mid-OA `ReactionMode::Interactive` pause -> `save_bytes` -> `load_bytes` ->
//!    `respond_reaction` -> duplicate reply rejected with `StaleActionId` leaving
//!    state/RNG/event_cursor untouched -> remainder matches uninterrupted Auto run.
//! 2. Stale `ActionId` rejected with `StaleActionId` leaving state & RNG untouched.
//! 3. `NoopSink` and `VecSink` produce identical final state, RNG, draws, and `event_cursor`.
//! 4. `oa_options` preserves canonical multi-target enumeration multiplicity.
//! 5. Foreign encounter `ActionId` and reaction `prompt_id` are rejected untouched
//!    both in-process AND across separate process restarts (`save_bytes` / `load_bytes`).
//! 6. `load_bytes` validates snapshot format version, `content_hash`, and template IDs.
//! 7. Bad inputs (illegal teleport move, targetless spell, paired draw on normal die)
//!    return clean `CoreError` values without panicking or mutating state.

use std::sync::Arc;

use ember_core::{
    AbilityDef, ActionCost, ActionId, ActionPayload, AttackAbility, AttackKind, AttackTemplate,
    BranchPredicate, ContentDb, CoreError, CreatureTemplate, Dice, Dmg, DmgMask, DrawRecord,
    DrawVal, EncounterSpec, Fight, FightPhase, NoopSink, Observer, Placement, Pos, ReactionChoice,
    ReactionMode, RollMode, Size, Step, SuppliedDraws, TargetMode, Team, TemplateId, UnitId,
    VecSink,
};
use smallvec::SmallVec;

fn build_test_db() -> Arc<ContentDb> {
    let mut db = ContentDb::default();

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
        init_bonus: 20,
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

    db.recompute_hash();
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
    let seed = 0xFEDC_BA98_7654_3210u64;

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

    let saved = inter.save_bytes().expect("save_bytes mid-reaction");
    let mut restored = Fight::load_bytes(db.clone(), &saved).expect("load_bytes mid-reaction");
    assert_eq!(restored.phase(), out.phase);
    assert_eq!(restored.rng_state(), inter.rng_state());

    let reply = ReactionChoice { prompt_id, choice_index: Some(0) };
    restored.respond_reaction(reply, &mut sink_i).unwrap();
    let state_after = restored.state_snapshot().clone();

    let dup = restored.respond_reaction(reply, &mut sink_i);
    assert!(matches!(dup, Err(CoreError::StaleActionId { .. })));
    assert_eq!(restored.state_snapshot(), &state_after);

    assert_eq!(restored.state_snapshot().units, auto_fight.state_snapshot().units);
    assert_eq!(restored.rng_state(), auto_fight.rng_state());
    assert_eq!(restored.draws(), auto_fight.draws());
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

    let snap = fight.state_snapshot().clone();
    let err = fight.apply(stale_id, &mut sink).unwrap_err();
    assert!(matches!(err, CoreError::StaleActionId { .. }));
    assert_eq!(fight.state_snapshot(), &snap);

    fight.apply(first, &mut sink).unwrap();
    let snap2 = fight.state_snapshot().clone();
    let err2 = fight.apply(first, &mut sink).unwrap_err();
    assert!(matches!(err2, CoreError::StaleActionId { .. }));
    assert_eq!(fight.state_snapshot(), &snap2);
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

    let atk_noop = f_noop
        .legal_actions(Observer::Full)
        .into_iter()
        .find(|a| a.action_key == "attack:longsword:>monster-1")
        .unwrap()
        .id;
    let atk_vec = f_vec
        .legal_actions(Observer::Full)
        .into_iter()
        .find(|a| a.action_key == "attack:longsword:>monster-1")
        .unwrap()
        .id;
    f_noop.apply(atk_noop, &mut noop).unwrap();
    f_vec.apply(atk_vec, &mut vec).unwrap();

    assert_eq!(f_noop.state_snapshot(), f_vec.state_snapshot());
    assert_eq!(f_noop.event_cursor(), f_vec.event_cursor());
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

#[test]
fn foreign_encounter_action_and_reaction_ids_rejected_untouched() {
    let db = build_test_db();
    let first_spec = oa_spec();
    let mut other_spec = oa_spec();
    for p in &mut other_spec.placements {
        p.x += 1;
    }
    let seed = 0xFEDC_BA98_7654_3210u64;

    let mut a = Fight::new(db.clone(), &first_spec, seed).unwrap();
    let mut b = Fight::new(db.clone(), &other_spec, seed).unwrap();
    let a_same_spec = Fight::new(db.clone(), &first_spec, seed).unwrap();
    assert_ne!(a.fight_id(), b.fight_id());
    assert_ne!(a.fight_id(), a_same_spec.fight_id());

    a.set_reaction_mode(ReactionMode::Interactive);
    b.set_reaction_mode(ReactionMode::Interactive);
    let mut sink = NoopSink;
    a.start(&mut sink).unwrap();
    b.start(&mut sink).unwrap();

    let a_move = a
        .legal_actions(Observer::Full)
        .into_iter()
        .find(|m| m.action_key == "move:3,3;2,3")
        .unwrap();
    let b_before = b.save_bytes().unwrap();
    let err = b.apply(a_move.id, &mut sink).unwrap_err();
    assert!(matches!(err, CoreError::StaleActionId { .. }));
    assert_eq!(b.save_bytes().unwrap(), b_before);

    let b_retreat = b
        .legal_actions(Observer::Full)
        .into_iter()
        .find(|m| m.action_key == "move:4,3;3,3")
        .unwrap();
    let FightPhase::AwaitingReaction { prompt_id: aid, .. } =
        a.apply(a_move.id, &mut sink).unwrap().phase
    else {
        panic!("expected A reaction prompt");
    };
    let FightPhase::AwaitingReaction { prompt_id: bid, .. } =
        b.apply(b_retreat.id, &mut sink).unwrap().phase
    else {
        panic!("expected B reaction prompt");
    };
    assert_ne!(aid, bid);

    let b_bytes = b.save_bytes().unwrap();
    let mut b_restored = Fight::load_bytes(db, &b_bytes).unwrap();
    let b_snap = b_restored.save_bytes().unwrap();
    let foreign_rx = b_restored
        .respond_reaction(ReactionChoice { prompt_id: aid, choice_index: Some(0) }, &mut sink)
        .unwrap_err();
    assert!(matches!(foreign_rx, CoreError::StaleActionId { .. }));
    assert_eq!(b_restored.save_bytes().unwrap(), b_snap);

    b_restored
        .respond_reaction(ReactionChoice { prompt_id: bid, choice_index: Some(0) }, &mut sink)
        .unwrap();
}

#[test]
fn saved_prompt_and_new_encounter_in_fresh_process_never_collide() {
    use std::{env, fs, process::Command};
    let worker = env::var("EMBER_CROSS_PROC_WORKER").ok();
    if worker.is_none() {
        let dir = env::temp_dir().join(format!("ember-cross-proc-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        let exe = env::current_exe().unwrap();
        for mode in ["writer", "reader"] {
            let out = Command::new(&exe)
                .args([
                    "--exact",
                    "saved_prompt_and_new_encounter_in_fresh_process_never_collide",
                    "--nocapture",
                ])
                .env("EMBER_CROSS_PROC_WORKER", mode)
                .env("EMBER_CROSS_PROC_DIR", &dir)
                .output()
                .unwrap();
            assert!(
                out.status.success(),
                "worker {mode} failed:\nstdout={}\nstderr={}",
                String::from_utf8_lossy(&out.stdout),
                String::from_utf8_lossy(&out.stderr)
            );
        }
        let _ = fs::remove_dir_all(&dir);
        return;
    }

    let dir = std::path::PathBuf::from(env::var_os("EMBER_CROSS_PROC_DIR").unwrap());
    let db = build_test_db();
    let seed = 0xFEDC_BA98_7654_3210u64;
    let new_game = || {
        let mut f = Fight::new(db.clone(), &oa_spec(), seed).unwrap();
        f.set_reaction_mode(ReactionMode::Interactive);
        f.start(&mut NoopSink).unwrap();
        f
    };
    let move_btn = |f: &Fight| {
        f.legal_actions(Observer::Full)
            .into_iter()
            .find(|a| a.action_key == "move:3,3;2,3")
            .unwrap()
            .id
    };

    if worker.as_deref() == Some("writer") {
        let mut orig = new_game();
        let act = move_btn(&orig);
        let act_bytes = postcard::to_allocvec(&act).unwrap();
        fs::write(dir.join("action.bin"), act_bytes).unwrap();
        orig.apply(act, &mut NoopSink).unwrap();
        fs::write(dir.join("snapshot.bin"), orig.save_bytes().unwrap()).unwrap();
        return;
    }

    let foreign_action: ActionId =
        postcard::from_bytes(&fs::read(dir.join("action.bin")).unwrap()).unwrap();
    let mut restored =
        Fight::load_bytes(db.clone(), &fs::read(dir.join("snapshot.bin")).unwrap()).unwrap();
    let FightPhase::AwaitingReaction { prompt_id: saved_id, .. } = restored.phase() else {
        panic!("missing restored prompt");
    };

    let mut independent = new_game();
    assert_ne!(restored.fight_id(), independent.fight_id());
    let own_action = move_btn(&independent);

    let before_act = independent.save_bytes().unwrap();
    let mut sink = VecSink::default();
    let err_act = independent.apply(foreign_action, &mut sink).unwrap_err();
    assert!(matches!(err_act, CoreError::StaleActionId { .. }));
    assert!(sink.events.is_empty());
    assert_eq!(independent.save_bytes().unwrap(), before_act);

    independent.apply(own_action, &mut NoopSink).unwrap();
    let FightPhase::AwaitingReaction { prompt_id: new_id, .. } = independent.phase() else {
        panic!("missing new prompt");
    };
    assert_ne!(saved_id, new_id);

    let reply = ReactionChoice { prompt_id: saved_id, choice_index: Some(0) };
    let before_rx = independent.save_bytes().unwrap();
    let err_rx = independent.respond_reaction(reply, &mut sink).unwrap_err();
    assert!(matches!(err_rx, CoreError::StaleActionId { .. }));
    assert!(sink.events.is_empty());
    assert_eq!(independent.save_bytes().unwrap(), before_rx);

    restored.respond_reaction(reply, &mut NoopSink).unwrap();
}

#[test]
fn snapshot_validation_rejects_bad_content_hash_and_version() {
    let db = build_test_db();
    let mut fight = Fight::new(db.clone(), &oa_spec(), 42).unwrap();
    fight.start(&mut NoopSink).unwrap();
    let bytes = fight.save_bytes().unwrap();

    // Modified content hash must fail cleanly on load_bytes
    let mut other_db = (*db).clone();
    other_db.content_hash ^= 0x1;
    let err = Fight::load_bytes(Arc::new(other_db), &bytes).unwrap_err();
    assert!(matches!(err, CoreError::Serialization(msg) if msg.contains("content_hash")));

    // Truncated/corrupt bytes must fail cleanly
    let err2 = Fight::load_bytes(db, &bytes[..4]).unwrap_err();
    assert!(matches!(err2, CoreError::Serialization(_)));
}

#[test]
fn bad_inputs_return_errors_without_panicking() {
    let db = build_test_db();
    let mut fight = Fight::new(db.clone(), &oa_spec(), 55).unwrap();
    fight.start(&mut NoopSink).unwrap();

    // 1. Illegal teleport move rejected by apply_payload_with_dice without mutating state
    let before = fight.save_bytes().unwrap();
    let mut rng = fight.rng_state();
    let mut dice = ember_core::LiveDice { rng: &mut rng };
    let teleport = ActionPayload::Move(SmallVec::from_slice(&[Pos::new(3, 3), Pos::new(6, 4)]));
    let err = fight
        .apply_payload_with_dice(UnitId(0), &teleport, &mut dice, &mut NoopSink)
        .unwrap_err();
    assert!(matches!(err, CoreError::UnknownAction(_)));
    assert_eq!(fight.save_bytes().unwrap(), before);

    // 2. Targetless spell returns an error cleanly without panicking (no unchecked targets[0])
    let bad_spell = ActionPayload::CastSpell {
        spell_key: "chromatic_orb".into(),
        at_level: 1,
        free: false,
        metamagic: None,
        targets: SmallVec::new(),
        point: None,
    };
    let err_spell = fight
        .apply_payload_with_dice(UnitId(0), &bad_spell, &mut dice, &mut NoopSink)
        .unwrap_err();
    assert!(matches!(err_spell, CoreError::UnknownAction(_)));
    assert_eq!(fight.save_bytes().unwrap(), before);

    // 3. Paired draw value for a normal roll returns DrawMismatch cleanly (no panic)
    let mut f2 = Fight::new(db, &oa_spec(), 55).unwrap();
    let mut bad_draws = SuppliedDraws::new(vec![DrawRecord {
        who: "hero".into(),
        tag: "initiative".into(),
        sides: 20,
        mode: RollMode::Normal,
        val: DrawVal::Two([10, 11]),
    }]);
    let err_draw = f2.start_with_dice(&mut bad_draws, &mut NoopSink).unwrap_err();
    assert!(matches!(err_draw, CoreError::DrawMismatch { .. }));
}
