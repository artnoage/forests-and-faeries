//! `ember-content`: fail-closed SRD 5.2.1 JSON schema validator and compiler.
//!
//! Loads `content/SRD_ALLOWLIST`, `content/effects/*.json`, `content/abilities/*.json`,
//! and `content/creatures/*.json`, rejects unknown fields, non-SRD provenance,
//! unlisted creatures, malformed dice, negative ranges, unresolved effect refs,
//! and cyclic/deep branch trees, and compiles everything into an `Arc<ContentDb>`.

pub mod compile;
pub mod schema;
pub mod validate;

use std::collections::HashSet;
use std::fmt;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use ember_core::step::ContentDb;

use crate::compile::compile_bundle;
use crate::schema::{AbilityFile, CreatureFile, EffectFile};
use crate::validate::{parse_allowlist, validate_ability, validate_creature, validate_effect};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ContentError {
    Io(String),
    Parse { file: String, message: String },
    Validation(String),
}

impl fmt::Display for ContentError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ContentError::Io(s) => write!(f, "content I/O error: {s}"),
            ContentError::Parse { file, message } => write!(f, "JSON parse error in {file}: {message}"),
            ContentError::Validation(s) => write!(f, "content validation error: {s}"),
        }
    }
}

impl std::error::Error for ContentError {}

/// Summary of a validated SRD 5.2.1 content directory.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ContentSummary {
    pub allowlist_entries: usize,
    pub effects: usize,
    pub abilities: usize,
    pub creatures: usize,
    pub total_compiled_abilities: usize,
}

/// Validate and compile a content directory (containing `SRD_ALLOWLIST`,
/// `effects/`, `abilities/`, and `creatures/`) into an `Arc<ContentDb>`.
pub fn load_content_dir(dir: &Path) -> Result<(Arc<ContentDb>, ContentSummary), ContentError> {
    let allow_path = dir.join("SRD_ALLOWLIST");
    let allow_text = fs::read_to_string(&allow_path)
        .map_err(|e| ContentError::Io(format!("{}: {e}", allow_path.display())))?;
    let allowlist = parse_allowlist(&allow_text)?;

    // 1. Effects
    let effect_paths = sorted_json_files(&dir.join("effects"))?;
    let mut effects = Vec::with_capacity(effect_paths.len());
    let mut known_effects = HashSet::new();
    for path in effect_paths {
        let stem = file_stem(&path)?;
        let raw = read_json::<EffectFile>(&path)?;
        validate_effect(&raw, &stem)?;
        if !known_effects.insert(raw.id.clone()) {
            return Err(ContentError::Validation(format!(
                "duplicate effect id {:?}",
                raw.id
            )));
        }
        effects.push(raw);
    }

    // 2. Abilities / Spells
    let ability_paths = sorted_json_files(&dir.join("abilities"))?;
    let mut abilities = Vec::with_capacity(ability_paths.len());
    let mut seen_abilities = HashSet::new();
    for path in ability_paths {
        let stem = file_stem(&path)?;
        let raw = read_json::<AbilityFile>(&path)?;
        validate_ability(&raw, &stem, &known_effects)?;
        if !seen_abilities.insert(raw.id.clone()) {
            return Err(ContentError::Validation(format!(
                "duplicate ability id {:?}",
                raw.id
            )));
        }
        abilities.push(raw);
    }

    // 3. Creatures (fail-closed against SRD_ALLOWLIST)
    let creature_paths = sorted_json_files(&dir.join("creatures"))?;
    let mut creatures = Vec::with_capacity(creature_paths.len());
    let mut seen_creatures = HashSet::new();
    for path in creature_paths {
        let stem = file_stem(&path)?;
        let raw = read_json::<CreatureFile>(&path)?;
        validate_creature(&raw, &stem, &allowlist)?;
        if !seen_creatures.insert(raw.id.clone()) {
            return Err(ContentError::Validation(format!(
                "duplicate creature id {:?}",
                raw.id
            )));
        }
        creatures.push(raw);
    }

    let db = compile_bundle(&effects, &abilities, &creatures)?;
    let summary = ContentSummary {
        allowlist_entries: allowlist.len(),
        effects: effects.len(),
        abilities: abilities.len(),
        creatures: creatures.len(),
        total_compiled_abilities: db.abilities.len(),
    };
    Ok((Arc::new(db), summary))
}

fn sorted_json_files(dir: &Path) -> Result<Vec<PathBuf>, ContentError> {
    let rd = fs::read_dir(dir)
        .map_err(|e| ContentError::Io(format!("{}: {e}", dir.display())))?;
    let mut files = Vec::new();
    for entry in rd {
        let entry = entry.map_err(|e| ContentError::Io(e.to_string()))?;
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            files.push(path);
        }
    }
    files.sort();
    Ok(files)
}

fn file_stem(path: &Path) -> Result<String, ContentError> {
    path.file_stem()
        .and_then(|s| s.to_str())
        .map(ToOwned::to_owned)
        .ok_or_else(|| ContentError::Io(format!("invalid filename {}", path.display())))
}

fn read_json<T: serde::de::DeserializeOwned>(path: &Path) -> Result<T, ContentError> {
    let text = fs::read_to_string(path)
        .map_err(|e| ContentError::Io(format!("{}: {e}", path.display())))?;
    serde_json::from_str(&text).map_err(|e| ContentError::Parse {
        file: path.display().to_string(),
        message: e.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema::StepJson;
    use std::path::PathBuf;

    fn default_content_dir() -> PathBuf {
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../content")
    }

    #[test]
    fn loads_phase0_srd_content_cleanly() {
        let (db, summary) = load_content_dir(&default_content_dir()).expect("valid content");
        assert!(summary.creatures >= 9);
        assert!(summary.abilities >= 9);
        assert!(summary.effects >= 10);
        assert!(db.template_by_key.contains_key("mara"));
        assert!(db.template_by_key.contains_key("ghast"));
        assert!(db.template_by_key.contains_key("curogana"));
        assert!(db.ability_by_key.contains_key("shatter"));
        assert!(db.ability_by_key.contains_key("chromatic_orb"));
        assert!(db.ability_by_key.contains_key("magic_missile"));
    }

    #[test]
    fn rejects_unknown_json_field_fail_closed() {
        let bad = r#"{
            "schema": 2,
            "id": "dodge",
            "source": "srd-5.2.1",
            "licence": "CC-BY-4.0",
            "attribution": "System Reference Document 5.2.1 Creative Commons Attribution 4.0",
            "name": "Dodge",
            "mark_label": "dodge",
            "unexpected_field": true
        }"#;
        let err = serde_json::from_str::<EffectFile>(bad).unwrap_err();
        assert!(err.to_string().contains("unknown field"));
    }

    #[test]
    fn rejects_unlisted_creature_and_bad_attribution() {
        let mut allow = HashSet::new();
        allow.insert("mara".to_string());
        let path = default_content_dir().join("creatures/ghast.json");
        let mut ghast: CreatureFile = read_json(&path).expect("ghast json");
        let err = validate_creature(&ghast, "ghast", &allow).unwrap_err();
        assert!(err.to_string().contains("SRD_ALLOWLIST"));

        allow.insert("ghast".to_string());
        ghast.attribution = "incomplete attribution".into();
        let err2 = validate_creature(&ghast, "ghast", &allow).unwrap_err();
        assert!(err2.to_string().contains("attribution"));
    }

    #[test]
    fn rejects_bad_dice_and_unresolved_effect() {
        let effects = HashSet::from(["prone".to_string()]);
        let bad_dice = r#"{
            "schema": 2,
            "id": "bad_spell",
            "source": "srd-5.2.1",
            "licence": "CC-BY-4.0",
            "attribution": "System Reference Document 5.2.1 Creative Commons Attribution 4.0",
            "name": "Bad Spell",
            "is_spell": true,
            "base_level": 1,
            "cost": "action",
            "targeting": { "kind": "self_only" },
            "steps": [
                { "op": "roll_damage", "dice": "3x8", "damage_type": "thunder", "tag": "bad" }
            ]
        }"#;
        let ab: AbilityFile = serde_json::from_str(bad_dice).unwrap();
        let err = validate_ability(&ab, "bad_spell", &effects).unwrap_err();
        assert!(err.to_string().contains("invalid dice"));

        let bad_eff = r#"{
            "schema": 2,
            "id": "bad_eff",
            "source": "srd-5.2.1",
            "licence": "CC-BY-4.0",
            "attribution": "System Reference Document 5.2.1 Creative Commons Attribution 4.0",
            "name": "Bad Eff",
            "cost": "action",
            "targeting": { "kind": "self_only" },
            "steps": [
                { "op": "apply_effect", "effect": "nonexistent_fx", "expiry": { "kind": "manual" } }
            ]
        }"#;
        let ab2: AbilityFile = serde_json::from_str(bad_eff).unwrap();
        let err2 = validate_ability(&ab2, "bad_eff", &effects).unwrap_err();
        assert!(err2.to_string().contains("unresolved effect"));
    }

    #[test]
    fn rejects_excessive_branch_nesting() {
        let effects = HashSet::new();
        let mut step = StepJson::Visibility { reveal: true };
        for _ in 0..10 {
            step = StepJson::Branch {
                predicate: "hit".into(),
                then_steps: vec![step],
                else_steps: vec![],
            };
        }
        let ab = AbilityFile {
            schema: 2,
            id: "deep".into(),
            source: "srd-5.2.1".into(),
            licence: "CC-BY-4.0".into(),
            attribution: "System Reference Document 5.2.1 Creative Commons Attribution 4.0".into(),
            name: "Deep".into(),
            is_spell: false,
            base_level: 0,
            cost: "action".into(),
            concentration: false,
            targeting: schema::TargetModeJson::SelfOnly,
            steps: vec![step],
        };
        let err = validate_ability(&ab, "deep", &effects).unwrap_err();
        assert!(err.to_string().contains("branch depth"));
    }
}
