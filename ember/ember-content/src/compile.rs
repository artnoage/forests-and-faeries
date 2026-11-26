//! Compiles validated SRD 5.2.1 JSON files into an immutable `ember_core::ContentDb`.

use std::collections::HashMap;

use ember_core::effect::{EffectExpiry, EffectKind};
use ember_core::step::{
    AbilityDef, ActionCost, AttackAbility, AttackKind, AttackTemplate, BranchPredicate,
    CasterTemplate, ContentDb, CreatureTemplate, DcExpr, EffectDef, MoveMode, ReactionWindowKind,
    ResourceKind, SpecialKind, SpellGrant, Step, TargetMode,
};
use ember_core::types::{
    ability_mod, Ability, AbilityId, Dice, Dmg, DmgMask, EffectDefId, Size, SpellPayment, Team,
    TemplateId,
};
use smallvec::SmallVec;

use crate::schema::{
    AbilityFile, AttackJson, CreatureFile, DcExprJson, EffectFile, ExpiryJson, StepJson,
    TargetModeJson,
};
use crate::ContentError;

pub fn compile_bundle(
    effects: &[EffectFile],
    abilities: &[AbilityFile],
    creatures: &[CreatureFile],
) -> Result<ContentDb, ContentError> {
    let mut db = ContentDb::default();

    // 1. Effects
    for ef in effects {
        let id = EffectDefId(db.effects.len() as u16);
        db.effect_by_key.insert(ef.id.clone(), id);
        db.effects.push(EffectDef {
            id,
            key: ef.id.clone(),
            name: ef.name.clone(),
            concentration: ef.concentration,
            duration_rounds: ef.duration_rounds,
            mark_label: ef.mark_label.clone(),
        });
    }

    // 2. Standalone abilities & spells
    for ab in abilities {
        let id = AbilityId(db.abilities.len() as u16);
        let steps = compile_steps(&ab.steps, &db.effect_by_key)?;
        db.ability_by_key.insert(ab.id.clone(), id);
        db.abilities.push(AbilityDef {
            id,
            key: ab.id.clone(),
            name: ab.name.clone(),
            is_spell: ab.is_spell,
            base_level: ab.base_level,
            cost: parse_cost(&ab.cost)?,
            concentration: ab.concentration,
            targeting: compile_target_mode(&ab.targeting),
            steps: SmallVec::from_vec(steps),
        });
    }

    // 3. Creatures (and compile every creature weapon/monster attack into an AbilityDef!)
    for cf in creatures {
        let tid = TemplateId(db.templates.len() as u16);
        let tmpl = compile_creature(tid, cf, &mut db)?;
        db.template_by_key.insert(cf.id.clone(), tid);
        db.templates.push(tmpl);
    }

    db.recompute_hash();
    Ok(db)
}

fn compile_creature(
    tid: TemplateId,
    c: &CreatureFile,
    db: &mut ContentDb,
) -> Result<CreatureTemplate, ContentError> {
    let team = if c.side == "heroes" { Team::Heroes } else { Team::Monsters };
    let size = Size::from_name(&c.size).expect("validated size");
    let abil = c.abilities.as_array();
    let saves = c.saves.as_array();
    let mut save_prof = [false; 6];
    for i in 0..6 {
        save_prof[i] = saves[i] > ability_mod(abil[i] as i32) as i16;
    }

    let dmg_resist = parse_dmg_mask(&c.damage.resistances);
    let dmg_immune = parse_dmg_mask(&c.damage.immunities);
    let dmg_vuln = parse_dmg_mask(&c.damage.vulnerabilities);

    let has_cond_imm = |k: &str| c.condition_immunities.iter().any(|x| x == k);

    // Gear & spares
    let mut gear: Vec<(String, f32)> = Vec::new();
    let mut spares: Vec<(u8, u8)> = Vec::new();
    if let Some(lo) = &c.loadout {
        for eq in &lo.equipment {
            gear.push((eq.id.clone(), eq.hand_slots));
        }
        for (item_id, &cnt) in &lo.spares {
            if let Some(gi) = gear.iter().position(|(id, _)| id == item_id) {
                spares.push((gi as u8, cnt));
            }
        }
    }

    // Features
    let fighter_level = c.classes.get("fighter").copied().unwrap_or(0);
    let fighter = fighter_level > 0;
    let sorcerer = c.classes.contains_key("sorcerer");
    let mut second_wind_uses = 0u8;
    let mut second_wind_die = Dice::new(1, 10, fighter_level as i16);
    let mut action_surge_uses = 0u8;
    let mut savage_attacker = false;
    let mut great_weapon_fighting = false;
    let mut improved_critical = false;
    let mut remarkable_athlete = false;
    let mut has_empowered = false;
    let mut has_heightened = false;

    for feat in &c.features {
        match feat.id.as_str() {
            "second_wind" => {
                second_wind_uses = feat.uses.unwrap_or(1);
                if let Some(d) = &feat.die {
                    second_wind_die = Dice::parse(d).expect("validated die");
                }
            }
            "action_surge" => action_surge_uses = feat.uses.unwrap_or(1),
            "savage_attacker" => savage_attacker = true,
            "great_weapon_fighting" => great_weapon_fighting = true,
            "improved_critical" => improved_critical = true,
            "remarkable_athlete" => remarkable_athlete = true,
            "metamagic" => {
                if let Some(opts) = &feat.options {
                    has_empowered = opts.iter().any(|o| o == "empowered_spell");
                    has_heightened = opts.iter().any(|o| o == "heightened_spell");
                }
            }
            _ => {}
        }
    }

    // Traits
    let mut stench_dc = None;
    let mut undead_fortitude = None;
    for tr in &c.traits {
        match tr.id.as_str() {
            "stench" => stench_dc = tr.dc,
            "undead_fortitude" => {
                let base = tr.dc_base.unwrap_or(5);
                let bypass = tr
                    .bypass
                    .as_deref()
                    .map(parse_dmg_mask)
                    .unwrap_or_else(DmgMask::empty);
                undead_fortitude = Some((base, bypass));
            }
            _ => {}
        }
    }

    // Compile each weapon / monster attack into a first-class AbilityDef step program!
    let mut attacks = Vec::with_capacity(c.attacks.len());
    for (ai, atk) in c.attacks.iter().enumerate() {
        let ab_id = compile_attack_ability(&c.id, ai, atk, c.pc, db)?;
        let ranged = atk.kind == "ranged_attack" || atk.thrown;
        let melee_type = atk.kind == "melee_attack";
        let damage = Dice::parse(&atk.damage).expect("validated attack damage");
        let damage_type = Dmg::from_name(&atk.damage_type).expect("validated damage type");
        let versatile = atk
            .versatile
            .as_deref()
            .map(|v| Dice::parse(v).expect("validated versatile"));
        let ability = match atk.ability.as_deref() {
            Some("finesse") => AttackAbility::Finesse,
            Some("str") => AttackAbility::Str,
            _ => AttackAbility::Fixed,
        };
        let item = atk
            .item
            .as_deref()
            .and_then(|id| gear.iter().position(|(gid, _)| gid == id))
            .map(|i| i as u8);
        let additional = atk
            .additional
            .iter()
            .map(|a| {
                (
                    Dice::parse(&a.damage).expect("validated add damage"),
                    Dmg::from_name(&a.damage_type).expect("validated add type"),
                )
            })
            .collect();
        let on_hit_paralyze = atk.on_hit.iter().find_map(|oh| {
            if oh.id == "save_condition" && oh.condition.as_deref() == Some("paralyzed") {
                let ab = Ability::from_short(oh.save.as_deref()?)?;
                let dc = oh.dc?;
                let no_undead = oh.conditions.iter().any(|x| x == "!undead");
                let no_elf = oh.conditions.iter().any(|x| x == "!elf");
                Some((ab, dc, no_undead, no_elf))
            } else {
                None
            }
        });
        let save_attack = atk
            .save_attack
            .as_ref()
            .map(|sa| (Ability::from_short(&sa.save).expect("validated save"), sa.dc));

        attacks.push(AttackTemplate {
            name: atk.name.clone(),
            ability_id: ab_id,
            melee_type,
            ranged,
            thrown: atk.thrown,
            range_ft: atk.range,
            max_range_ft: atk.range_max,
            to_hit: atk.to_hit.unwrap_or(0),
            damage,
            damage_type,
            ability,
            versatile,
            savage: atk.riders.iter().any(|r| r == "savage_attacker"),
            gwf: atk.riders.iter().any(|r| r == "great_weapon_fighting"),
            graze: atk.masteries.iter().any(|m| m == "graze"),
            sap: atk.masteries.iter().any(|m| m == "sap"),
            multiattack_group: atk.multiattack_group,
            bonus_action: atk.bonus_action,
            save_attack,
            item,
            additional,
            on_hit_paralyze,
        });
    }

    // Spellcasting grants (caster-side payment; never hardcoded on spell!)
    let caster = c.spellcasting.as_ref().map(|sc| {
        let mut slots = [0u8; 3];
        for (i, &s) in sc.slots.iter().take(3).enumerate() {
            slots[i] = s;
        }
        let mut free_cast_pools: Vec<String> = Vec::new();
        for fc in &sc.free_casts {
            if !free_cast_pools.contains(&fc.pool) {
                free_cast_pools.push(fc.pool.clone());
            }
        }
        let mut grants = Vec::new();
        let mut deferred_spells = Vec::new();
        for info in &sc.spell_info {
            let Some(&ab_id) = db.ability_by_key.get(&info.id) else {
                // Spells declared on the sheet whose step programs are deferred to
                // later phases are tracked explicitly for menu verification.
                deferred_spells.push(info.id.clone());
                continue;
            };
            // Slot grant
            grants.push(SpellGrant {
                spell_key: info.id.clone(),
                ability_id: ab_id,
                payment: if info.level == 0 {
                    SpellPayment::AtWill { cast_level: 0 }
                } else {
                    SpellPayment::Slot
                },
                sorcerer_spell: info.sorcerer_spell,
            });
            // Free-cast feat grant (e.g. Magic Initiate Wizard -> Magic Missile)
            for fc in sc.free_casts.iter().filter(|fc| fc.spell == info.id) {
                let pi = free_cast_pools.iter().position(|p| p == &fc.pool).unwrap_or(0) as u8;
                grants.push(SpellGrant {
                    spell_key: info.id.clone(),
                    ability_id: ab_id,
                    payment: SpellPayment::FreePerLongRest {
                        uses: fc.uses,
                        cast_level: info.level,
                        pool_index: pi,
                    },
                    sorcerer_spell: info.sorcerer_spell,
                });
            }
        }
        CasterTemplate {
            class_name: sc.class.clone(),
            level: sc.level,
            ability: Ability::from_short(&sc.ability).expect("validated caster ability"),
            spell_attack: sc.attack,
            spell_dc: sc.dc,
            slots,
            grants,
            deferred_spells,
            free_cast_pools,
            sorcery_points: sc.resources.sorcery_points.unwrap_or(0),
            innate_sorcery_uses: sc.resources.innate_sorcery.unwrap_or(0),
            has_empowered,
            has_heightened,
        }
    });

    Ok(CreatureTemplate {
        id: tid,
        key: c.id.clone(),
        name: c.name.clone(),
        team,
        pc: c.pc,
        size,
        undead: c.tags.undead,
        elf: c.tags.elf,
        construct: c.tags.construct,
        ac: c.ac,
        max_hp: c.max_hp,
        speed: c.speed,
        fly: c.fly,
        abilities: abil,
        prof_bonus: c.proficiency_bonus,
        save_prof,
        saves,
        init_bonus: c.initiative.bonus,
        init_adv: c.initiative.advantage,
        melee_reach_ft: c.melee_reach,
        passive_perception: c.passive_perception,
        darkvision: c.darkvision,
        blindsight: c.blindsight,
        truesight: c.truesight,
        dmg_resist,
        dmg_immune,
        dmg_vuln,
        immune_poisoned: has_cond_imm("poisoned"),
        immune_paralyzed: has_cond_imm("paralyzed"),
        immune_prone: has_cond_imm("prone"),
        immune_charmed: has_cond_imm("charmed"),
        immune_frightened: has_cond_imm("frightened"),
        immune_grappled: has_cond_imm("grappled"),
        gear,
        spares,
        attacks,
        multiattack: c.multiattack.clone(),
        fighter,
        fighter_level,
        second_wind_uses,
        second_wind_die,
        action_surge_uses,
        savage_attacker,
        great_weapon_fighting,
        improved_critical,
        remarkable_athlete,
        sorcerer,
        stench_dc,
        undead_fortitude,
        caster,
    })
}

/// Compile a creature's weapon/monster attack directly into an `AbilityDef` step program!
///
/// Rule-18 canonical sequence:
/// 1. `AttackRoll`
/// 2. `RollDamage` (slot 0, base damage dice — rolled right after attack roll even on miss!)
/// 3. `Branch(Hit)`:
///    - `then`: additional damage `RollDamage` (slots 1..), `ApplyDamage(slot=0, combined)`,
///      optional on-hit `SavingThrow` + `ApplyEffect(TimedParalyzed)`
///    - `else`: optional `ApplyDamage(graze_ability_mod=true)` for Graze mastery
fn compile_attack_ability(
    creature_id: &str,
    atk_idx: usize,
    atk: &AttackJson,
    _is_pc: bool,
    db: &mut ContentDb,
) -> Result<AbilityId, ContentError> {
    let ab_id = AbilityId(db.abilities.len() as u16);
    let key = format!("weapon:{creature_id}:{}:{atk_idx}", atk.name);
    let ranged = atk.kind == "ranged_attack" || atk.thrown;
    let melee_type = atk.kind == "melee_attack";
    let base_dice = Dice::parse(&atk.damage).expect("validated");
    let base_dt = Dmg::from_name(&atk.damage_type).expect("validated");
    let gwf = atk.riders.iter().any(|r| r == "great_weapon_fighting");
    let graze = atk.masteries.iter().any(|m| m == "graze");

    let mut steps: SmallVec<[Step; 8]> = SmallVec::new();
    if let Some(sa) = &atk.save_attack {
        let ab = Ability::from_short(&sa.save).expect("validated");
        steps.push(Step::SavingThrow {
            ability: ab,
            dc: DcExpr::Fixed(sa.dc),
            magical: false,
            charm: false,
            shared_roll: false,
            half_on_save: false,
            disadvantage_on_construct: false,
        });
        steps.push(Step::Branch {
            predicate: BranchPredicate::SaveFailed,
            then_steps: vec![
                Step::RollDamage {
                    dice: base_dice,
                    dmg_type: base_dt,
                    slot: 0,
                    tag: "damage".into(),
                    upcast_extra_dice: 0,
                    savage: false,
                    gwf: false,
                    double_on_crit: false,
                    combine_with_base: false,
                    empowerable: false,
                },
                Step::ApplyDamage {
                    slot: 0,
                    half_if_saved: false,
                    kill_at_zero: false,
                    graze_ability_mod: false,
                },
            ],
            else_steps: Vec::new(),
        });
    } else {
        steps.push(Step::AttackRoll {
            kind: if ranged { AttackKind::WeaponRanged } else { AttackKind::WeaponMelee },
            range_ft: atk.range,
            melee_type,
            bonus_override: atk.to_hit,
            tag: "attack".into(),
        });
        steps.push(Step::RollDamage {
            dice: base_dice,
            dmg_type: base_dt,
            slot: 0,
            tag: "damage".into(),
            upcast_extra_dice: 0,
            savage: false, // Savage Attacker runs on hit before additional riders
            gwf,
            double_on_crit: true,
            combine_with_base: false,
            empowerable: false,
        });

        let mut hit_steps = Vec::new();
        for (ri, add) in atk.additional.iter().enumerate() {
            hit_steps.push(Step::RollDamage {
                dice: Dice::parse(&add.damage).expect("validated"),
                dmg_type: Dmg::from_name(&add.damage_type).expect("validated"),
                slot: (ri + 1) as u8,
                tag: "additional_damage".into(),
                upcast_extra_dice: 0,
                savage: false,
                gwf: false,
                double_on_crit: true,
                combine_with_base: true,
                empowerable: false,
            });
        }
        hit_steps.push(Step::ApplyDamage {
            slot: 0,
            half_if_saved: false,
            kill_at_zero: false,
            graze_ability_mod: false,
        });

        // On-hit condition saves (e.g. Ghast/Ghoul Claw -> CON save vs Paralyzed)
        for oh in &atk.on_hit {
            if oh.id == "save_condition" && oh.condition.as_deref() == Some("paralyzed") {
                if let (Some(save_s), Some(dc)) = (oh.save.as_deref(), oh.dc) {
                    let save_ab = Ability::from_short(save_s).expect("validated");
                    let no_elf = oh.conditions.iter().any(|x| x == "!elf");
                    let pred = if no_elf {
                        BranchPredicate::TargetNotUndeadAndNotElf
                    } else {
                        BranchPredicate::TargetNotUndead
                    };
                    hit_steps.push(Step::Branch {
                        predicate: pred,
                        then_steps: vec![
                            Step::SavingThrow {
                                ability: save_ab,
                                dc: DcExpr::Fixed(dc),
                                magical: false,
                                charm: false,
                                shared_roll: false,
                                half_on_save: false,
                                disadvantage_on_construct: false,
                            },
                            Step::Branch {
                                predicate: BranchPredicate::SaveFailed,
                                then_steps: vec![Step::ApplyEffect {
                                    kind: EffectKind::TimedParalyzed { skip_current_turn: false },
                                    expiry: EffectExpiry::EndOfBearerTurn { skip_first: false },
                                    concentration: false,
                                    to_self: false,
                                    unless_immune_poisoned: false,
                                    unless_immune_paralyzed: true,
                                }],
                                else_steps: Vec::new(),
                            },
                        ],
                        else_steps: Vec::new(),
                    });
                }
            }
        }

        let mut miss_steps = Vec::new();
        if graze {
            miss_steps.push(Step::ApplyDamage {
                slot: 0,
                half_if_saved: false,
                kill_at_zero: false,
                graze_ability_mod: true,
            });
        }

        steps.push(Step::Branch {
            predicate: BranchPredicate::Hit,
            then_steps: hit_steps,
            else_steps: miss_steps,
        });
    }

    db.ability_by_key.insert(key.clone(), ab_id);
    db.abilities.push(AbilityDef {
        id: ab_id,
        key,
        name: atk.name.clone(),
        is_spell: false,
        base_level: 0,
        cost: if atk.bonus_action { ActionCost::BonusAction } else { ActionCost::Action },
        concentration: false,
        targeting: TargetMode::SingleCreature {
            range_ft: atk.range,
            max_range_ft: atk.range_max,
        },
        steps,
    });
    Ok(ab_id)
}

fn compile_steps(
    raw: &[StepJson],
    effects: &HashMap<String, EffectDefId>,
) -> Result<Vec<Step>, ContentError> {
    let mut out = Vec::with_capacity(raw.len());
    for s in raw {
        out.push(compile_step(s, effects)?);
    }
    Ok(out)
}

fn compile_step(s: &StepJson, effects: &HashMap<String, EffectDefId>) -> Result<Step, ContentError> {
    Ok(match s {
        StepJson::TargetGate { save, dc } => Step::TargetGate {
            save: Ability::from_short(save).expect("validated"),
            dc: compile_dc(dc),
        },
        StepJson::AttackRoll { kind, range_ft, melee_type, bonus_override, tag } => {
            Step::AttackRoll {
                kind: match kind.as_str() {
                    "weapon_melee" => AttackKind::WeaponMelee,
                    "weapon_ranged" => AttackKind::WeaponRanged,
                    "spell_melee" => AttackKind::SpellMelee,
                    "spell_ranged" => AttackKind::SpellRanged,
                    _ => unreachable!("validated"),
                },
                range_ft: *range_ft,
                melee_type: *melee_type,
                bonus_override: *bonus_override,
                tag: tag.clone(),
            }
        }
        StepJson::SavingThrow {
            ability,
            dc,
            magical,
            charm,
            shared_roll,
            half_on_save,
            disadvantage_on_construct,
        } => Step::SavingThrow {
            ability: Ability::from_short(ability).expect("validated"),
            dc: compile_dc(dc),
            magical: *magical,
            charm: *charm,
            shared_roll: *shared_roll,
            half_on_save: *half_on_save,
            disadvantage_on_construct: *disadvantage_on_construct,
        },
        StepJson::AbilityCheck { skill, dc, tag } => Step::AbilityCheck {
            skill: skill.clone(),
            dc: compile_dc(dc),
            tag: tag.clone(),
        },
        StepJson::RollDamage {
            dice,
            damage_type,
            slot,
            tag,
            upcast_extra_dice,
            savage,
            gwf,
            double_on_crit,
            combine_with_base,
            empowerable,
        } => Step::RollDamage {
            dice: Dice::parse(dice).expect("validated"),
            dmg_type: Dmg::from_name(damage_type).expect("validated"),
            slot: *slot,
            tag: tag.clone(),
            upcast_extra_dice: *upcast_extra_dice,
            savage: *savage,
            gwf: *gwf,
            double_on_crit: *double_on_crit,
            combine_with_base: *combine_with_base,
            empowerable: *empowerable,
        },
        StepJson::ApplyDamage { slot, half_if_saved, kill_at_zero, graze_ability_mod } => {
            Step::ApplyDamage {
                slot: *slot,
                half_if_saved: *half_if_saved,
                kill_at_zero: *kill_at_zero,
                graze_ability_mod: *graze_ability_mod,
            }
        }
        StepJson::Heal { dice, tag, revive_from_zero } => Step::Heal {
            dice: Dice::parse(dice).expect("validated"),
            tag: tag.clone(),
            revive_from_zero: *revive_from_zero,
        },
        StepJson::ApplyEffect {
            effect,
            expiry,
            concentration,
            to_self,
            unless_immune_poisoned,
            unless_immune_paralyzed,
        } => Step::ApplyEffect {
            kind: parse_effect_kind(effect)?,
            expiry: compile_expiry(expiry),
            concentration: *concentration,
            to_self: *to_self,
            unless_immune_poisoned: *unless_immune_poisoned,
            unless_immune_paralyzed: *unless_immune_paralyzed,
        },
        StepJson::RemoveEffect { effect, to_self } => Step::RemoveEffect {
            kind: parse_effect_kind(effect)?,
            to_self: *to_self,
        },
        StepJson::MoveUnit { mode, feet } => Step::MoveUnit {
            mode: match mode.as_str() {
                "walk" => MoveMode::Walk,
                "push" => MoveMode::Push,
                "pull" => MoveMode::Pull,
                "lure" => MoveMode::Lure,
                _ => unreachable!("validated"),
            },
            feet: *feet,
        },
        StepJson::Teleport { max_ft, require_sight } => {
            Step::Teleport { max_ft: *max_ft, require_sight: *require_sight }
        }
        StepJson::SpawnZone { size_ft, effect, duration_rounds } => Step::SpawnZone {
            size_ft: *size_ft,
            effect_id: *effects
                .get(effect)
                .ok_or_else(|| ContentError::Validation(format!("missing effect {effect:?}")))?,
            duration_rounds: *duration_rounds,
        },
        StepJson::SummonForce { range_ft, duration_rounds } => {
            Step::SummonForce { range_ft: *range_ft, duration_rounds: *duration_rounds }
        }
        StepJson::ModifyResource { resource, delta, level } => Step::ModifyResource {
            resource: match resource.as_str() {
                "action" => ResourceKind::Action,
                "bonus_action" => ResourceKind::BonusAction,
                "reaction" => ResourceKind::Reaction,
                "movement_add_speed" => ResourceKind::MovementAddSpeed,
                "movement_spend_half_speed" => ResourceKind::MovementSpendHalfSpeed,
                "action_surge" => ResourceKind::ActionSurge,
                "second_wind" => ResourceKind::SecondWind,
                "innate_sorcery" => ResourceKind::InnateSorcery,
                "sorcery_points" => ResourceKind::SorceryPoints,
                "spell_slot" => ResourceKind::SpellSlot { level: level.unwrap_or(1) },
                _ => unreachable!("validated"),
            },
            delta: *delta,
        },
        StepJson::GrantReactionWindow { window } => Step::GrantReactionWindow {
            window: match window.as_str() {
                "cleave" => ReactionWindowKind::Cleave,
                "champion_crit_move" => ReactionWindowKind::ChampionCritMove,
                _ => unreachable!("validated"),
            },
        },
        StepJson::Visibility { reveal } => Step::Visibility { reveal: *reveal },
        StepJson::Branch { predicate, then_steps, else_steps } => Step::Branch {
            predicate: match predicate.as_str() {
                "hit" => BranchPredicate::Hit,
                "miss" => BranchPredicate::Miss,
                "target_not_undead" => BranchPredicate::TargetNotUndead,
                "target_not_undead_and_not_elf" => BranchPredicate::TargetNotUndeadAndNotElf,
                "save_failed" => BranchPredicate::SaveFailed,
                "has_advantage" => BranchPredicate::HasAdvantage,
                _ => unreachable!("validated"),
            },
            then_steps: compile_steps(then_steps, effects)?,
            else_steps: compile_steps(else_steps, effects)?,
        },
        StepJson::Special { kind } => Step::Special(match kind.as_str() {
            "death_save" => SpecialKind::DeathSave,
            "scorching_ray_split" => SpecialKind::ScorchingRaySplit,
            "preserve_life_alloc" => SpecialKind::PreserveLifeAlloc,
            "chromatic_orb_leap" => SpecialKind::ChromaticOrbLeap,
            "spiritual_weapon_force" => SpecialKind::SpiritualWeaponForce,
            _ => unreachable!("validated"),
        }),
    })
}

fn compile_dc(dc: &DcExprJson) -> DcExpr {
    match dc {
        DcExprJson::Fixed { value } => DcExpr::Fixed(*value),
        DcExprJson::SpellDc => DcExpr::SpellDc,
    }
}

fn compile_expiry(exp: &ExpiryJson) -> EffectExpiry {
    match exp {
        ExpiryJson::Manual => EffectExpiry::Manual,
        ExpiryJson::StartOfBearerTurn => EffectExpiry::StartOfBearerTurn,
        ExpiryJson::StartOfSourceTurn => EffectExpiry::StartOfSourceTurn,
        ExpiryJson::EndOfBearerTurn { skip_first } => {
            EffectExpiry::EndOfBearerTurn { skip_first: *skip_first }
        }
        ExpiryJson::GameTime { seconds } => EffectExpiry::GameTime(*seconds),
    }
}

fn compile_target_mode(tm: &TargetModeJson) -> TargetMode {
    match tm {
        TargetModeJson::SelfOnly => TargetMode::SelfOnly,
        TargetModeJson::SingleCreature { range_ft, max_range_ft } => {
            TargetMode::SingleCreature { range_ft: *range_ft, max_range_ft: *max_range_ft }
        }
        TargetModeJson::MultiDart { base_darts, range_ft } => {
            TargetMode::MultiDart { base_darts: *base_darts, range_ft: *range_ft }
        }
        TargetModeJson::PointRadius { radius_ft, range_ft } => {
            TargetMode::PointRadius { radius_ft: *radius_ft, range_ft: *range_ft }
        }
        TargetModeJson::MovePath => TargetMode::MovePath,
    }
}

fn parse_cost(cost: &str) -> Result<ActionCost, ContentError> {
    match cost {
        "action" => Ok(ActionCost::Action),
        "bonus_action" => Ok(ActionCost::BonusAction),
        "reaction" => Ok(ActionCost::Reaction),
        "free" => Ok(ActionCost::Free),
        "half_speed" => Ok(ActionCost::HalfSpeed),
        other => Err(ContentError::Validation(format!("unknown cost {other:?}"))),
    }
}

fn parse_effect_kind(key: &str) -> Result<EffectKind, ContentError> {
    match key {
        "prone" => Ok(EffectKind::Prone),
        "unconscious" => Ok(EffectKind::Unconscious),
        "dead" => Ok(EffectKind::Dead),
        "stable" => Ok(EffectKind::Stable),
        "paralyzed" => Ok(EffectKind::TimedParalyzed { skip_current_turn: false }),
        "incapacitated" => Ok(EffectKind::Incapacitated),
        "poisoned" => Ok(EffectKind::Poisoned),
        "stench_poison" => Ok(EffectKind::StenchPoison),
        "dodge" => Ok(EffectKind::Dodge),
        "disengage" => Ok(EffectKind::Disengage),
        "sap" => Ok(EffectKind::Sap),
        "innate_sorcery" => Ok(EffectKind::InnateSorcery),
        other => Err(ContentError::Validation(format!(
            "unmapped effect kind {other:?}"
        ))),
    }
}

fn parse_dmg_mask(names: &[String]) -> DmgMask {
    let mut mask = DmgMask::empty();
    for n in names {
        if let Some(d) = Dmg::from_name(n) {
            mask.insert(d);
        }
    }
    mask
}
