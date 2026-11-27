//! The 18 closed `Step` primitives, compiled `AbilityDef` step programs,
//! creature templates, and dense immutable `ContentDb` (`Arc<ContentDb>`).

use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use smallvec::SmallVec;

use crate::effect::{EffectExpiry, EffectKind};
use crate::types::{
    Ability, AbilityId, Dice, Dmg, DmgMask, EffectDefId, Size, SpellPayment, Team, TemplateId,
};

/// Action economy cost of an ability.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ActionCost {
    Action,
    BonusAction,
    Reaction,
    Free,
    HalfSpeed,
}

/// Attack category for [`Step::AttackRoll`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum AttackKind {
    WeaponMelee,
    WeaponRanged,
    SpellMelee,
    SpellRanged,
}

/// Ability used to compute a PC weapon's to-hit and damage modifier.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum AttackAbility {
    Fixed,
    Str,
    Finesse,
}

/// Targeting mode of an [`AbilityDef`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TargetMode {
    SelfOnly,
    SingleCreature { range_ft: i16, max_range_ft: i16 },
    MultiDart { base_darts: u8, range_ft: i16 },
    PointRadius { radius_ft: i16, range_ft: i16 },
    MovePath,
}

/// Movement mode for [`Step::MoveUnit`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MoveMode {
    Walk,
    Push,
    Pull,
    Lure,
}

/// Predicate evaluated by [`Step::Branch`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum BranchPredicate {
    Hit,
    Miss,
    TargetNotUndead,
    TargetNotUndeadAndNotElf,
    SaveFailed,
    HasAdvantage,
}

/// Resource mutated by [`Step::ModifyResource`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ResourceKind {
    Action,
    BonusAction,
    Reaction,
    MovementAddSpeed,
    MovementSpendHalfSpeed,
    ActionSurge,
    SecondWind,
    InnateSorcery,
    SorceryPoints,
    SpellSlot { level: u8 },
}

/// Reaction / follow-up window opened by [`Step::GrantReactionWindow`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ReactionWindowKind {
    Cleave,
    ChampionCritMove,
}

/// Escape hatch (`Step::Special`) isolated for mechanics that cannot be expressed
/// cleanly as a flat step sequence.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SpecialKind {
    DeathSave,
    ScorchingRaySplit,
    PreserveLifeAlloc,
    ChromaticOrbLeap,
    SpiritualWeaponForce,
}

/// DC expression for saves/checks.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DcExpr {
    Fixed(i16),
    SpellDc,
}

/// The 18 closed `Step` primitives executed by `ember-core::resolve`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Step {
    /// 1. Target gate (e.g. Sanctuary WIS save; aborts on failure).
    TargetGate {
        save: Ability,
        dc: DcExpr,
    },
    /// 2. Weapon or spell attack roll (d20 + bonus + Bless, crits, cover, interrupts).
    ///    Sets `ctx.hit`, `ctx.crit`, `ctx.had_adv`.
    AttackRoll {
        kind: AttackKind,
        range_ft: i16,
        melee_type: bool,
        bonus_override: Option<i16>,
        tag: String,
    },
    /// 3. Saving throw (single or shared-roll simultaneous AoE).
    SavingThrow {
        ability: Ability,
        dc: DcExpr,
        magical: bool,
        charm: bool,
        shared_roll: bool,
        half_on_save: bool,
        disadvantage_on_construct: bool,
    },
    /// 4. Ability / skill check (Hide, First Aid, Escape Grapple, Break Free).
    AbilityCheck {
        skill: String,
        dc: DcExpr,
        tag: String,
    },
    /// 5. Roll damage dice into `ctx.damage_slots[slot]`.
    ///    Note: for SRD weapon attacks, base `RollDamage` is emitted right after
    ///    `AttackRoll` (before `Branch(Hit)`) so draw order matches rule 18 verbatim.
    RollDamage {
        dice: Dice,
        dmg_type: Dmg,
        slot: u8,
        tag: String,
        /// Extra dice added per spell level above `base_level`.
        upcast_extra_dice: i16,
        /// Eligible for Savage Attacker reroll on first weapon hit of turn.
        savage: bool,
        /// Eligible for Great Weapon Fighting (treat 1–2 as 3).
        gwf: bool,
        /// Only roll if `ctx.crit` doubles dice.
        double_on_crit: bool,
        /// Combine with slot 0 into one simultaneous hit for resistance & Undead Fortitude.
        combine_with_base: bool,
        /// Apply Empowered Spell metamagic if cast with Empowered Spell.
        empowerable: bool,
    },
    /// 6. Apply rolled damage from `slot` (or Graze flat modifier when `graze_ability_mod` is set).
    ApplyDamage {
        slot: u8,
        half_if_saved: bool,
        kill_at_zero: bool,
        graze_ability_mod: bool,
    },
    /// 7. Heal target (Cure Wounds, Healing Word, Second Wind).
    Heal {
        dice: Dice,
        tag: String,
        revive_from_zero: bool,
    },
    /// 8. Apply an effect/condition to target (or self when `to_self` is true).
    ApplyEffect {
        kind: EffectKind,
        expiry: EffectExpiry,
        concentration: bool,
        to_self: bool,
        unless_immune_poisoned: bool,
        unless_immune_paralyzed: bool,
    },
    /// 9. Remove an effect/condition from target (or self when `to_self` is true).
    RemoveEffect {
        kind: EffectKind,
        to_self: bool,
    },
    /// 10. Move unit along path (with Opportunity Attack interrupt support on `Walk`).
    MoveUnit {
        mode: MoveMode,
        feet: i16,
    },
    /// 11. Teleport unit.
    Teleport {
        max_ft: i16,
        require_sight: bool,
    },
    /// 12. Spawn persistent terrain/effect zone.
    SpawnZone {
        size_ft: i16,
        effect_id: EffectDefId,
        duration_rounds: i16,
    },
    /// 13. Summon spell force (Spiritual Weapon).
    SummonForce {
        range_ft: i16,
        duration_rounds: i16,
    },
    /// 14. Modify action economy or class resource.
    ModifyResource {
        resource: ResourceKind,
        delta: i16,
    },
    /// 15. Open a follow-up window (Cleave / Champion crit move).
    GrantReactionWindow {
        window: ReactionWindowKind,
    },
    /// 16. Visibility transition (reveal stealth or attempt Hide).
    Visibility {
        reveal: bool,
    },
    /// 17. Conditional sub-program (validated acyclic at content load time).
    Branch {
        predicate: BranchPredicate,
        then_steps: Vec<Step>,
        else_steps: Vec<Step>,
    },
    /// 18. Isolated escape hatch (`special.rs`).
    Special(SpecialKind),
}

/// Compiled ability definition (shared by spells, features, and weapon/monster actions).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct AbilityDef {
    pub id: AbilityId,
    pub key: String,
    pub name: String,
    pub is_spell: bool,
    pub base_level: u8,
    pub cost: ActionCost,
    pub concentration: bool,
    pub targeting: TargetMode,
    pub steps: SmallVec<[Step; 8]>,
}

impl AbilityDef {
    /// True if any step in this ability's compiled program rolls empowerable damage dice.
    pub fn is_empowerable(&self) -> bool {
        steps_any(&self.steps, &|s| {
            matches!(s, Step::RollDamage { empowerable: true, .. })
        })
    }

    /// True if any step in this ability's compiled program forces a saving throw.
    pub fn has_saving_throw(&self) -> bool {
        steps_any(&self.steps, &|s| matches!(s, Step::SavingThrow { .. }))
    }
}

fn steps_any(steps: &[Step], pred: &dyn Fn(&Step) -> bool) -> bool {
    for s in steps {
        if pred(s) {
            return true;
        }
        if let Step::Branch { then_steps, else_steps, .. } = s {
            if steps_any(then_steps, pred) || steps_any(else_steps, pred) {
                return true;
            }
        }
    }
    false
}

/// Compiled data-driven effect definition (`content/effects/*.json`).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct EffectDef {
    pub id: EffectDefId,
    pub key: String,
    pub name: String,
    pub concentration: bool,
    pub duration_rounds: Option<i16>,
    pub mark_label: String,
}

/// Compiled weapon / monster attack entry on a [`CreatureTemplate`].
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct AttackTemplate {
    pub name: String,
    pub ability_id: AbilityId,
    pub melee_type: bool,
    pub ranged: bool,
    pub thrown: bool,
    pub range_ft: i16,
    pub max_range_ft: i16,
    pub to_hit: i16,
    pub damage: Dice,
    pub damage_type: Dmg,
    pub ability: AttackAbility,
    pub versatile: Option<Dice>,
    pub savage: bool,
    pub gwf: bool,
    pub graze: bool,
    pub sap: bool,
    pub multiattack_group: Option<i8>,
    pub bonus_action: bool,
    pub save_attack: Option<(Ability, i16)>,
    /// Index in `CreatureTemplate.gear` if tied to an equipped item.
    pub item: Option<u8>,
    /// Additional unconditional damage riders (used by AI & compile checks).
    pub additional: Vec<(Dice, Dmg)>,
    /// On-hit condition save riders (used by compile checks).
    pub on_hit_paralyze: Option<(Ability, i16, bool, bool)>,
}

/// Caster-side spell grant: payment and cast level live on the creature, not the spell.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct SpellGrant {
    pub spell_key: String,
    pub ability_id: AbilityId,
    pub payment: SpellPayment,
    pub sorcerer_spell: bool,
}

/// Metadata for a spell declared on a creature's sheet whose step program is deferred
/// out of Phase 0 (used strictly for well-formedness & pinned-ledger menu validation).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct DeferredSpellSpec {
    pub id: String,
    pub base_level: u8,
    pub sorcerer_spell: bool,
}

/// Compiled spellcasting configuration on a [`CreatureTemplate`].
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct CasterTemplate {
    pub class_name: String,
    pub level: u8,
    pub ability: Ability,
    pub spell_attack: i16,
    pub spell_dc: i16,
    /// Spell slots for levels `[0, 1, 2]`.
    pub slots: [u8; 3],
    pub grants: Vec<SpellGrant>,
    /// Spells declared on this creature's sheet whose step programs are deferred to
    /// later phases (used by Phase-0 menu verification; never executable in Phase 0).
    pub deferred_spells: Vec<DeferredSpellSpec>,
    pub free_cast_pools: Vec<String>,
    pub sorcery_points: u8,
    pub innate_sorcery_uses: u8,
    pub has_empowered: bool,
    pub has_heightened: bool,
}

/// Immutable creature template compiled from SRD 5.2.1 JSON (`content/creatures/*.json`).
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CreatureTemplate {
    pub id: TemplateId,
    pub key: String,
    pub name: String,
    pub team: Team,
    pub pc: bool,
    pub size: Size,
    pub undead: bool,
    pub elf: bool,
    pub construct: bool,
    pub ac: i16,
    pub max_hp: i16,
    pub speed: i16,
    pub fly: bool,
    pub abilities: [i16; 6],
    pub prof_bonus: i16,
    pub save_prof: [bool; 6],
    pub saves: [i16; 6],
    pub init_bonus: i16,
    pub init_adv: bool,
    pub melee_reach_ft: Option<i16>,
    pub passive_perception: i16,
    pub darkvision: i16,
    pub blindsight: i16,
    pub truesight: i16,
    pub dmg_resist: DmgMask,
    pub dmg_immune: DmgMask,
    pub dmg_vuln: DmgMask,
    pub immune_poisoned: bool,
    pub immune_paralyzed: bool,
    pub immune_prone: bool,
    pub immune_charmed: bool,
    pub immune_frightened: bool,
    pub immune_grappled: bool,
    /// Equipped items `(id, hand_slots)` for heroes.
    pub gear: Vec<(String, f32)>,
    /// Spare thrown item counts `(gear_index, count)`.
    pub spares: Vec<(u8, u8)>,
    pub attacks: Vec<AttackTemplate>,
    pub multiattack: Vec<Vec<String>>,
    // Class / monster traits & features
    pub fighter: bool,
    pub fighter_level: u8,
    pub second_wind_uses: u8,
    pub second_wind_die: Dice,
    pub action_surge_uses: u8,
    pub savage_attacker: bool,
    pub great_weapon_fighting: bool,
    pub improved_critical: bool,
    pub remarkable_athlete: bool,
    pub sorcerer: bool,
    pub stench_dc: Option<i16>,
    pub undead_fortitude: Option<(i16, DmgMask)>,
    pub caster: Option<CasterTemplate>,
}

/// Immutable compiled SRD 5.2.1 database shared across fights via `Arc<ContentDb>`.
#[derive(Clone, Debug, Default)]
pub struct ContentDb {
    pub templates: Vec<CreatureTemplate>,
    pub template_by_key: HashMap<String, TemplateId>,
    pub abilities: Vec<AbilityDef>,
    pub ability_by_key: HashMap<String, AbilityId>,
    pub effects: Vec<EffectDef>,
    pub effect_by_key: HashMap<String, EffectDefId>,
    /// Deterministic 64-bit digest of compiled templates, abilities, and effects
    /// embedded in [`crate::fight::Fight::save_bytes`] and verified on load.
    pub content_hash: u64,
}

impl ContentDb {
    /// Recompute [`ContentDb::content_hash`] deterministically over every field of
    /// all compiled effects, abilities (including step programs), templates (including
    /// resistances/immunities/vulnerabilities, traits, attacks, gear, caster grants),
    /// and canonical key-lookup maps.
    pub fn recompute_hash(&mut self) {
        let mut h: u64 = 0xcbf2_9ce4_8422_2325;
        let mut mix = |bytes: &[u8]| {
            for &b in bytes {
                h ^= b as u64;
                h = h.wrapping_mul(0x0000_0100_0000_01b3);
            }
        };
        let payload = postcard::to_allocvec(&(&self.effects, &self.abilities, &self.templates))
            .expect("ContentDb serialization is infallible");
        mix(&(payload.len() as u64).to_le_bytes());
        mix(&payload);

        let mut effect_keys: Vec<(&str, u16)> =
            self.effect_by_key.iter().map(|(k, v)| (k.as_str(), v.0)).collect();
        effect_keys.sort_unstable();
        let mut ability_keys: Vec<(&str, u16)> =
            self.ability_by_key.iter().map(|(k, v)| (k.as_str(), v.0)).collect();
        ability_keys.sort_unstable();
        let mut template_keys: Vec<(&str, u16)> =
            self.template_by_key.iter().map(|(k, v)| (k.as_str(), v.0)).collect();
        template_keys.sort_unstable();
        let map_payload = postcard::to_allocvec(&(effect_keys, ability_keys, template_keys))
            .expect("ContentDb key-map serialization is infallible");
        mix(&[0xff]);
        mix(&(map_payload.len() as u64).to_le_bytes());
        mix(&map_payload);

        h ^= h >> 30;
        h = h.wrapping_mul(0xbf58_476d_1ce4_e5b9);
        h ^= h >> 27;
        h = h.wrapping_mul(0x94d0_49bb_1331_11eb);
        self.content_hash = h ^ (h >> 31);
    }

    pub fn template(&self, id: TemplateId) -> &CreatureTemplate {
        &self.templates[id.0 as usize]
    }

    pub fn ability(&self, id: AbilityId) -> &AbilityDef {
        &self.abilities[id.0 as usize]
    }

    pub fn effect(&self, id: EffectDefId) -> &EffectDef {
        &self.effects[id.0 as usize]
    }

    /// Resolve a fight unit id (`"mara"` or `"ghast-1"`) to its [`TemplateId`].
    pub fn template_for_unit_id(&self, unit_id: &str) -> Option<TemplateId> {
        if let Some(&tid) = self.template_by_key.get(unit_id) {
            return Some(tid);
        }
        let (base, suffix) = unit_id.rsplit_once('-')?;
        if suffix.chars().all(|c| c.is_ascii_digit()) {
            self.template_by_key.get(base).copied()
        } else {
            None
        }
    }
}
