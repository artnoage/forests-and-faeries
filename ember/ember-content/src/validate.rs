//! Fail-closed validator for SRD 5.2.1 content bundles.

use std::collections::HashSet;

use ember_core::types::{Ability, Dice, Dmg, Size};

use crate::schema::{
    AbilityFile, CreatureFile, EffectFile, StepJson, TargetModeJson, ORIGINAL_HERO_SOURCE,
    REQUIRED_LICENCE, REQUIRED_SOURCE,
};
use crate::ContentError;

/// Maximum branch nesting depth allowed in step programs (prevents cyclic or
/// runaway recursive step graphs).
pub const MAX_BRANCH_DEPTH: usize = 8;

/// Parse `SRD_ALLOWLIST`, stripping `#` comments and blank lines.
pub fn parse_allowlist(text: &str) -> Result<HashSet<String>, ContentError> {
    let mut set = HashSet::new();
    for (ln, raw) in text.lines().enumerate() {
        let trimmed = raw.split('#').next().unwrap_or("").trim();
        if trimmed.is_empty() {
            continue;
        }
        if !trimmed.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_') {
            return Err(ContentError::Validation(format!(
                "SRD_ALLOWLIST:{}: invalid identifier {trimmed:?}",
                ln + 1
            )));
        }
        set.insert(trimmed.to_string());
    }
    if set.is_empty() {
        return Err(ContentError::Validation("SRD_ALLOWLIST is empty".into()));
    }
    Ok(set)
}

pub fn validate_srd_header_with_source(
    ctx: &str,
    source: &str,
    expected_source: &str,
    licence: &str,
    attribution: &str,
) -> Result<(), ContentError> {
    if source != expected_source {
        return Err(ContentError::Validation(format!(
            "{ctx}: source must be {expected_source:?}, got {source:?}"
        )));
    }
    if licence != REQUIRED_LICENCE {
        return Err(ContentError::Validation(format!(
            "{ctx}: licence must be {REQUIRED_LICENCE:?}, got {licence:?}"
        )));
    }
    if !attribution.contains("System Reference Document 5.2.1")
        || !attribution.contains("Creative Commons Attribution 4.0")
    {
        return Err(ContentError::Validation(format!(
            "{ctx}: missing required SRD 5.2.1 CC-BY-4.0 attribution text"
        )));
    }
    Ok(())
}

pub fn validate_srd_header(
    ctx: &str,
    source: &str,
    licence: &str,
    attribution: &str,
) -> Result<(), ContentError> {
    validate_srd_header_with_source(ctx, source, REQUIRED_SOURCE, licence, attribution)
}

pub fn validate_effect(ef: &EffectFile, filename_stem: &str) -> Result<(), ContentError> {
    let ctx = format!("effect:{filename_stem}");
    if ef.schema != 2 {
        return Err(ContentError::Validation(format!(
            "{ctx}: unsupported schema {} (expected 2)",
            ef.schema
        )));
    }
    if ef.id != filename_stem {
        return Err(ContentError::Validation(format!(
            "{ctx}: id {:?} does not match filename stem {filename_stem:?}",
            ef.id
        )));
    }
    validate_srd_header(&ctx, &ef.source, &ef.licence, &ef.attribution)?;
    if ef.name.trim().is_empty() || ef.mark_label.trim().is_empty() {
        return Err(ContentError::Validation(format!("{ctx}: empty name or mark_label")));
    }
    if let Some(dur) = ef.duration_rounds {
        if dur < 0 {
            return Err(ContentError::Validation(format!(
                "{ctx}: negative duration_rounds {dur}"
            )));
        }
    }
    Ok(())
}

pub fn validate_ability(
    ab: &AbilityFile,
    filename_stem: &str,
    known_effects: &HashSet<String>,
) -> Result<(), ContentError> {
    let ctx = format!("ability:{filename_stem}");
    if ab.schema != 2 {
        return Err(ContentError::Validation(format!(
            "{ctx}: unsupported schema {} (expected 2)",
            ab.schema
        )));
    }
    if ab.id != filename_stem {
        return Err(ContentError::Validation(format!(
            "{ctx}: id {:?} does not match filename stem {filename_stem:?}",
            ab.id
        )));
    }
    validate_srd_header(&ctx, &ab.source, &ab.licence, &ab.attribution)?;
    if ab.name.trim().is_empty() {
        return Err(ContentError::Validation(format!("{ctx}: empty ability name")));
    }
    match ab.cost.as_str() {
        "action" | "bonus_action" | "reaction" | "free" | "half_speed" => {}
        other => {
            return Err(ContentError::Validation(format!(
                "{ctx}: unknown action cost {other:?}"
            )));
        }
    }
    match ab.targeting {
        TargetModeJson::SelfOnly | TargetModeJson::MovePath => {}
        TargetModeJson::SingleCreature { range_ft, max_range_ft } => {
            if range_ft < 0 || max_range_ft < range_ft {
                return Err(ContentError::Validation(format!(
                    "{ctx}: invalid range ({range_ft}..{max_range_ft})"
                )));
            }
        }
        TargetModeJson::MultiDart { base_darts, range_ft } => {
            if base_darts == 0 || range_ft < 0 {
                return Err(ContentError::Validation(format!(
                    "{ctx}: invalid multi_dart ({base_darts} darts, range {range_ft})"
                )));
            }
        }
        TargetModeJson::PointRadius { radius_ft, range_ft } => {
            if radius_ft <= 0 || range_ft < 0 {
                return Err(ContentError::Validation(format!(
                    "{ctx}: invalid point_radius (radius {radius_ft}, range {range_ft})"
                )));
            }
        }
    }
    if ab.steps.is_empty() {
        return Err(ContentError::Validation(format!("{ctx}: ability has no steps")));
    }
    validate_steps(&ctx, &ab.steps, known_effects, 0)?;
    Ok(())
}

fn validate_steps(
    ctx: &str,
    steps: &[StepJson],
    known_effects: &HashSet<String>,
    depth: usize,
) -> Result<(), ContentError> {
    if depth > MAX_BRANCH_DEPTH {
        return Err(ContentError::Validation(format!(
            "{ctx}: step branch depth exceeds limit {MAX_BRANCH_DEPTH} (cyclic or runaway graph)"
        )));
    }
    for (i, step) in steps.iter().enumerate() {
        let sctx = format!("{ctx}.steps[{i}]");
        match step {
            StepJson::TargetGate { save, .. } => {
                if Ability::from_short(save).is_none() {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unknown save ability {save:?}"
                    )));
                }
            }
            StepJson::AttackRoll { kind, range_ft, tag, .. } => {
                if !matches!(
                    kind.as_str(),
                    "weapon_melee" | "weapon_ranged" | "spell_melee" | "spell_ranged"
                ) {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unknown attack kind {kind:?}"
                    )));
                }
                if *range_ft < 0 {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: negative range_ft {range_ft}"
                    )));
                }
                if tag.trim().is_empty() {
                    return Err(ContentError::Validation(format!("{sctx}: empty roll tag")));
                }
            }
            StepJson::SavingThrow { ability, .. } => {
                if Ability::from_short(ability).is_none() {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unknown save ability {ability:?}"
                    )));
                }
            }
            StepJson::AbilityCheck { tag, .. } => {
                if tag.trim().is_empty() {
                    return Err(ContentError::Validation(format!("{sctx}: empty check tag")));
                }
            }
            StepJson::RollDamage { dice, damage_type, slot, tag, .. } => {
                Dice::parse(dice)
                    .map_err(|e| ContentError::Validation(format!("{sctx}: {e}")))?;
                if Dmg::from_name(damage_type).is_none() {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unknown damage_type {damage_type:?}"
                    )));
                }
                if *slot >= 4 {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: damage slot {slot} out of range 0..4"
                    )));
                }
                if tag.trim().is_empty() {
                    return Err(ContentError::Validation(format!("{sctx}: empty damage tag")));
                }
            }
            StepJson::ApplyDamage { slot, .. } => {
                if *slot >= 4 {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: damage slot {slot} out of range 0..4"
                    )));
                }
            }
            StepJson::Heal { dice, tag, .. } => {
                Dice::parse(dice)
                    .map_err(|e| ContentError::Validation(format!("{sctx}: {e}")))?;
                if tag.trim().is_empty() {
                    return Err(ContentError::Validation(format!("{sctx}: empty heal tag")));
                }
            }
            StepJson::ApplyEffect { effect, .. } | StepJson::RemoveEffect { effect, .. } => {
                if !known_effects.contains(effect) {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unresolved effect reference {effect:?}"
                    )));
                }
            }
            StepJson::MoveUnit { mode, feet } => {
                if !matches!(mode.as_str(), "walk" | "push" | "pull" | "lure") {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unknown move mode {mode:?}"
                    )));
                }
                if *feet < 0 {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: negative move feet {feet}"
                    )));
                }
            }
            StepJson::Teleport { max_ft, .. } => {
                if *max_ft < 0 {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: negative teleport max_ft {max_ft}"
                    )));
                }
            }
            StepJson::SpawnZone { size_ft, effect, duration_rounds } => {
                if *size_ft <= 0 || *duration_rounds < 0 {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: invalid zone size={size_ft} duration={duration_rounds}"
                    )));
                }
                if !known_effects.contains(effect) {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unresolved zone effect {effect:?}"
                    )));
                }
            }
            StepJson::SummonForce { range_ft, duration_rounds } => {
                if *range_ft < 0 || *duration_rounds < 0 {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: invalid summon_force range={range_ft} duration={duration_rounds}"
                    )));
                }
            }
            StepJson::ModifyResource { resource, .. } => {
                if !matches!(
                    resource.as_str(),
                    "action"
                        | "bonus_action"
                        | "reaction"
                        | "movement_add_speed"
                        | "movement_spend_half_speed"
                        | "action_surge"
                        | "second_wind"
                        | "innate_sorcery"
                        | "sorcery_points"
                        | "spell_slot"
                ) {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unknown resource {resource:?}"
                    )));
                }
            }
            StepJson::GrantReactionWindow { window } => {
                if !matches!(window.as_str(), "cleave" | "champion_crit_move") {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unknown reaction window {window:?}"
                    )));
                }
            }
            StepJson::Visibility { .. } => {}
            StepJson::Branch { predicate, then_steps, else_steps } => {
                if !matches!(
                    predicate.as_str(),
                    "hit"
                        | "miss"
                        | "target_not_undead"
                        | "target_not_undead_and_not_elf"
                        | "save_failed"
                        | "has_advantage"
                ) {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unknown branch predicate {predicate:?}"
                    )));
                }
                validate_steps(&format!("{sctx}.then"), then_steps, known_effects, depth + 1)?;
                validate_steps(&format!("{sctx}.else"), else_steps, known_effects, depth + 1)?;
            }
            StepJson::Special { kind } => {
                if !matches!(
                    kind.as_str(),
                    "death_save"
                        | "scorching_ray_split"
                        | "preserve_life_alloc"
                        | "chromatic_orb_leap"
                        | "spiritual_weapon_force"
                ) {
                    return Err(ContentError::Validation(format!(
                        "{sctx}: unknown special kind {kind:?}"
                    )));
                }
            }
        }
    }
    Ok(())
}

pub fn validate_creature(
    c: &CreatureFile,
    filename_stem: &str,
    allowlist: &HashSet<String>,
) -> Result<(), ContentError> {
    let ctx = format!("creature:{filename_stem}");
    if c.schema != 1 {
        return Err(ContentError::Validation(format!(
            "{ctx}: unsupported schema {} (expected 1)",
            c.schema
        )));
    }
    if c.id != filename_stem {
        return Err(ContentError::Validation(format!(
            "{ctx}: id {:?} does not match filename stem {filename_stem:?}",
            c.id
        )));
    }
    if c.pc {
        if allowlist.contains(&c.id) {
            return Err(ContentError::Validation(format!(
                "{ctx}: original player character {:?} must not be listed in SRD_ALLOWLIST",
                c.id
            )));
        }
        validate_srd_header_with_source(
            &ctx,
            &c.source,
            ORIGINAL_HERO_SOURCE,
            &c.licence,
            &c.attribution,
        )?;
    } else {
        if !allowlist.contains(&c.id) {
            return Err(ContentError::Validation(format!(
                "{ctx}: SRD monster {:?} is not listed in SRD_ALLOWLIST",
                c.id
            )));
        }
        validate_srd_header(&ctx, &c.source, &c.licence, &c.attribution)?;
    }
    if !matches!(c.side.as_str(), "heroes" | "monsters") {
        return Err(ContentError::Validation(format!(
            "{ctx}: invalid side {:?}",
            c.side
        )));
    }
    if Size::from_name(&c.size).is_none() {
        return Err(ContentError::Validation(format!(
            "{ctx}: unknown size {:?}",
            c.size
        )));
    }
    if c.ac <= 0 || c.max_hp <= 0 || c.speed < 0 {
        return Err(ContentError::Validation(format!(
            "{ctx}: invalid core stats ac={} max_hp={} speed={}",
            c.ac, c.max_hp, c.speed
        )));
    }
    for dt in c
        .damage
        .resistances
        .iter()
        .chain(&c.damage.immunities)
        .chain(&c.damage.vulnerabilities)
    {
        if Dmg::from_name(dt).is_none() {
            return Err(ContentError::Validation(format!(
                "{ctx}: unknown damage type {dt:?}"
            )));
        }
    }
    for (ai, atk) in c.attacks.iter().enumerate() {
        let actx = format!("{ctx}.attacks[{ai}]({})", atk.name);
        if !matches!(atk.kind.as_str(), "melee_attack" | "ranged_attack") {
            return Err(ContentError::Validation(format!(
                "{actx}: unknown attack type {:?}",
                atk.kind
            )));
        }
        if atk.range < 0 || atk.range_max < atk.range {
            return Err(ContentError::Validation(format!(
                "{actx}: invalid range {}..{}",
                atk.range, atk.range_max
            )));
        }
        Dice::parse(&atk.damage)
            .map_err(|e| ContentError::Validation(format!("{actx}: {e}")))?;
        if Dmg::from_name(&atk.damage_type).is_none() {
            return Err(ContentError::Validation(format!(
                "{actx}: unknown damage_type {:?}",
                atk.damage_type
            )));
        }
        if let Some(v) = &atk.versatile {
            Dice::parse(v).map_err(|e| ContentError::Validation(format!("{actx}.versatile: {e}")))?;
        }
        for add in &atk.additional {
            Dice::parse(&add.damage)
                .map_err(|e| ContentError::Validation(format!("{actx}.additional: {e}")))?;
            if Dmg::from_name(&add.damage_type).is_none() {
                return Err(ContentError::Validation(format!(
                    "{actx}.additional: unknown damage_type {:?}",
                    add.damage_type
                )));
            }
        }
        if let Some(sa) = &atk.save_attack {
            if Ability::from_short(&sa.save).is_none() || sa.dc <= 0 {
                return Err(ContentError::Validation(format!(
                    "{actx}.save_attack: invalid save={:?} dc={}",
                    sa.save, sa.dc
                )));
            }
        }
    }
    for feat in &c.features {
        if let Some(d) = &feat.die {
            Dice::parse(d)
                .map_err(|e| ContentError::Validation(format!("{ctx}.feature({}): {e}", feat.id)))?;
        }
    }
    if let Some(sc) = &c.spellcasting {
        if Ability::from_short(&sc.ability).is_none() {
            return Err(ContentError::Validation(format!(
                "{ctx}.spellcasting: unknown ability {:?}",
                sc.ability
            )));
        }
    }
    Ok(())
}
