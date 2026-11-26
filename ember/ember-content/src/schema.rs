//! Strict, fail-closed JSON schemas (`#[serde(deny_unknown_fields)]`) for
//! SRD 5.2.1 creatures, effects, and data-driven abilities.

use std::collections::BTreeMap;

use serde::Deserialize;

/// Required SRD 5.2.1 licence and provenance identifiers.
pub const REQUIRED_SOURCE: &str = "srd-5.2.1";
pub const REQUIRED_LICENCE: &str = "CC-BY-4.0";

// ---------------------------------------------------------------------------
// Creature schema (schema = 1, matching SRD 5.2.1 exported character/NPC sheets)
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreatureFile {
    pub schema: u32,
    pub id: String,
    pub source: String,
    pub licence: String,
    pub attribution: String,
    pub provenance: ProvenanceJson,
    pub side: String,
    pub name: String,
    pub pc: bool,
    pub size: String,
    pub tags: TagsJson,
    pub races: Vec<String>,
    pub ac: i16,
    pub max_hp: i16,
    pub speed: i16,
    pub fly: bool,
    pub abilities: AbilitiesJson,
    pub proficiency_bonus: i16,
    pub saves: AbilitiesJson,
    pub initiative: InitiativeJson,
    pub melee_reach: Option<i16>,
    pub damage: DamageProfileJson,
    pub condition_immunities: Vec<String>,
    pub passive_perception: i16,
    pub skills: BTreeMap<String, i16>,
    #[serde(default)]
    pub darkvision: i16,
    #[serde(default)]
    pub blindsight: i16,
    #[serde(default)]
    pub truesight: i16,
    #[serde(default)]
    pub base_id: Option<String>,
    #[serde(default)]
    pub loadout: Option<LoadoutJson>,
    #[serde(default)]
    pub classes: BTreeMap<String, u8>,
    pub attacks: Vec<AttackJson>,
    #[serde(default)]
    pub inventory: BTreeMap<String, u16>,
    #[serde(default)]
    pub reactions: Vec<String>,
    pub multiattack: Vec<Vec<String>>,
    #[serde(default)]
    pub expected_round_damage: Option<ExpectedRoundDamageJson>,
    pub traits: Vec<TraitJson>,
    pub features: Vec<FeatureJson>,
    pub spellcasting: Option<SpellcastingJson>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ProvenanceJson {
    pub natural20_commit: String,
    pub exporter: String,
    pub files: BTreeMap<String, String>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TagsJson {
    pub undead: bool,
    pub elf: bool,
    pub object: bool,
    #[serde(default)]
    pub construct: bool,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AbilitiesJson {
    pub str: i16,
    pub dex: i16,
    pub con: i16,
    pub int: i16,
    pub wis: i16,
    pub cha: i16,
}

impl AbilitiesJson {
    pub fn as_array(&self) -> [i16; 6] {
        [self.str, self.dex, self.con, self.int, self.wis, self.cha]
    }
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct InitiativeJson {
    pub bonus: i16,
    pub advantage: bool,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DamageProfileJson {
    pub resistances: Vec<String>,
    pub immunities: Vec<String>,
    pub vulnerabilities: Vec<String>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LoadoutJson {
    pub equipment: Vec<EquipmentJson>,
    #[serde(default)]
    pub spares: BTreeMap<String, u8>,
    pub wearing_armor: bool,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EquipmentJson {
    pub id: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub hand_slots: f32,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AttackJson {
    pub name: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub range: i16,
    pub range_max: i16,
    pub to_hit: Option<i16>,
    pub damage: String,
    pub damage_type: String,
    pub ability: Option<String>,
    pub proficient: Option<bool>,
    #[serde(default)]
    pub additional: Vec<AdditionalDamageJson>,
    #[serde(default)]
    pub on_hit: Vec<OnHitJson>,
    #[serde(default)]
    pub save_attack: Option<SaveAttackJson>,
    #[serde(default)]
    pub multiattack_group: Option<i8>,
    #[serde(default)]
    pub masteries: Vec<String>,
    #[serde(default)]
    pub riders: Vec<String>,
    #[serde(default)]
    pub thrown: bool,
    #[serde(default)]
    pub versatile: Option<String>,
    #[serde(default)]
    pub item: Option<String>,
    #[serde(default)]
    pub bonus_action: bool,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdditionalDamageJson {
    pub damage: String,
    pub damage_type: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct OnHitJson {
    pub id: String,
    #[serde(default, rename = "if")]
    pub conditions: Vec<String>,
    #[serde(default)]
    pub save: Option<String>,
    #[serde(default)]
    pub dc: Option<i16>,
    #[serde(default)]
    pub condition: Option<String>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SaveAttackJson {
    pub save: String,
    pub dc: i16,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ExpectedRoundDamageJson {
    pub attacks: Vec<(Option<i16>, f64)>,
    pub count: u8,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TraitJson {
    pub id: String,
    #[serde(default)]
    pub dc: Option<i16>,
    #[serde(default)]
    pub dc_base: Option<i16>,
    #[serde(default)]
    pub bypass: Option<Vec<String>>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FeatureJson {
    pub id: String,
    #[serde(default)]
    pub uses: Option<u8>,
    #[serde(default)]
    pub die: Option<String>,
    #[serde(default)]
    pub level: Option<u8>,
    #[serde(default)]
    pub model: Option<String>,
    #[serde(default)]
    pub sorcery_points: Option<u8>,
    #[serde(default)]
    pub options: Option<Vec<String>>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SpellcastingJson {
    pub class: String,
    pub level: u8,
    pub ability: String,
    pub attack: i16,
    pub dc: i16,
    pub slots: Vec<u8>,
    pub spells: Vec<String>,
    #[serde(default)]
    pub reaction_spells: Vec<String>,
    #[serde(default)]
    pub inert_spells: Vec<String>,
    pub spell_info: Vec<SpellInfoJson>,
    #[serde(default)]
    pub free_casts: Vec<FreeCastJson>,
    #[serde(default)]
    pub resources: SpellResourcesJson,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SpellInfoJson {
    pub id: String,
    pub name: String,
    pub level: u8,
    pub casting_time: String,
    pub concentration: bool,
    #[serde(default)]
    pub sorcerer_spell: bool,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FreeCastJson {
    pub spell: String,
    pub pool: String,
    pub uses: u8,
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SpellResourcesJson {
    #[serde(default)]
    pub sorcery_points: Option<u8>,
    #[serde(default)]
    pub innate_sorcery: Option<u8>,
}

// ---------------------------------------------------------------------------
// Effect schema (schema = 2)
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EffectFile {
    pub schema: u32,
    pub id: String,
    pub source: String,
    pub licence: String,
    pub attribution: String,
    pub name: String,
    #[serde(default)]
    pub concentration: bool,
    #[serde(default)]
    pub duration_rounds: Option<i16>,
    pub mark_label: String,
}

// ---------------------------------------------------------------------------
// Ability / Spell step-program schema (schema = 2)
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AbilityFile {
    pub schema: u32,
    pub id: String,
    pub source: String,
    pub licence: String,
    pub attribution: String,
    pub name: String,
    #[serde(default)]
    pub is_spell: bool,
    #[serde(default)]
    pub base_level: u8,
    pub cost: String,
    #[serde(default)]
    pub concentration: bool,
    pub targeting: TargetModeJson,
    pub steps: Vec<StepJson>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum TargetModeJson {
    SelfOnly,
    SingleCreature { range_ft: i16, max_range_ft: i16 },
    MultiDart { base_darts: u8, range_ft: i16 },
    PointRadius { radius_ft: i16, range_ft: i16 },
    MovePath,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(tag = "op", rename_all = "snake_case", deny_unknown_fields)]
pub enum StepJson {
    TargetGate {
        save: String,
        dc: DcExprJson,
    },
    AttackRoll {
        kind: String,
        range_ft: i16,
        melee_type: bool,
        #[serde(default)]
        bonus_override: Option<i16>,
        tag: String,
    },
    SavingThrow {
        ability: String,
        dc: DcExprJson,
        #[serde(default)]
        magical: bool,
        #[serde(default)]
        charm: bool,
        #[serde(default)]
        shared_roll: bool,
        #[serde(default)]
        half_on_save: bool,
        #[serde(default)]
        disadvantage_on_construct: bool,
    },
    AbilityCheck {
        skill: String,
        dc: DcExprJson,
        tag: String,
    },
    RollDamage {
        dice: String,
        damage_type: String,
        #[serde(default)]
        slot: u8,
        tag: String,
        #[serde(default)]
        upcast_extra_dice: i16,
        #[serde(default)]
        savage: bool,
        #[serde(default)]
        gwf: bool,
        #[serde(default)]
        double_on_crit: bool,
        #[serde(default)]
        combine_with_base: bool,
        #[serde(default)]
        empowerable: bool,
    },
    ApplyDamage {
        #[serde(default)]
        slot: u8,
        #[serde(default)]
        half_if_saved: bool,
        #[serde(default)]
        kill_at_zero: bool,
        #[serde(default)]
        graze_ability_mod: bool,
    },
    Heal {
        dice: String,
        tag: String,
        #[serde(default)]
        revive_from_zero: bool,
    },
    ApplyEffect {
        effect: String,
        expiry: ExpiryJson,
        #[serde(default)]
        concentration: bool,
        #[serde(default)]
        to_self: bool,
        #[serde(default)]
        unless_immune_poisoned: bool,
        #[serde(default)]
        unless_immune_paralyzed: bool,
    },
    RemoveEffect {
        effect: String,
        #[serde(default)]
        to_self: bool,
    },
    MoveUnit {
        mode: String,
        feet: i16,
    },
    Teleport {
        max_ft: i16,
        #[serde(default)]
        require_sight: bool,
    },
    SpawnZone {
        size_ft: i16,
        effect: String,
        duration_rounds: i16,
    },
    SummonForce {
        range_ft: i16,
        duration_rounds: i16,
    },
    ModifyResource {
        resource: String,
        delta: i16,
        #[serde(default)]
        level: Option<u8>,
    },
    GrantReactionWindow {
        window: String,
    },
    Visibility {
        reveal: bool,
    },
    Branch {
        predicate: String,
        #[serde(default)]
        then_steps: Vec<StepJson>,
        #[serde(default)]
        else_steps: Vec<StepJson>,
    },
    Special {
        kind: String,
    },
}

#[derive(Clone, Debug, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum DcExprJson {
    Fixed { value: i16 },
    SpellDc,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum ExpiryJson {
    Manual,
    StartOfBearerTurn,
    StartOfSourceTurn,
    EndOfBearerTurn {
        #[serde(default)]
        skip_first: bool,
    },
    GameTime {
        seconds: i32,
    },
}
