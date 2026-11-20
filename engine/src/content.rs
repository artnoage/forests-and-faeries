//! Content: creature data exported from natural20 (`content/<pack>/<id>.json`,
//! written by `validation/export_content.py`), loaded into a [`ContentPool`].
//!
//! Every number comes from natural20's own derived values; names are
//! natural20's (weapon `using` names, NPC action names, spell ids, feature
//! ids). The Rust code implements *mechanics*, each once, keyed by id (the
//! registry below); a creature is data. An id the registry does not know is a
//! load error (fail closed): a new stat block that only uses known mechanics
//! needs no Rust change, a new mechanic needs code in both engines and tapes
//! (docs/GENERAL_ENV.md §2.1).
//!
//! The public pack (`content/srd/`) is compiled into the binary (`build.rs`).
//! More packs (the private one) load at run time from the directories in
//! `EMBER_CONTENT_PATH` (colon-separated) or through [`ContentPool::load`].
//!
//! This work includes material from the System Reference Document 5.2.1
//! ("SRD 5.2.1") by Wizards of the Coast LLC, available at
//! https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative
//! Commons Attribution 4.0 International License.

use std::collections::{BTreeMap, HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};

use serde::Deserialize;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Dmg {
    Acid,
    Bludgeoning,
    Cold,
    Fire,
    Force,
    Lightning,
    Necrotic,
    Piercing,
    Poison,
    Psychic,
    Radiant,
    Slashing,
    Thunder,
}

impl Dmg {
    pub const ALL: [Dmg; 13] = [
        Dmg::Acid,
        Dmg::Bludgeoning,
        Dmg::Cold,
        Dmg::Fire,
        Dmg::Force,
        Dmg::Lightning,
        Dmg::Necrotic,
        Dmg::Piercing,
        Dmg::Poison,
        Dmg::Psychic,
        Dmg::Radiant,
        Dmg::Slashing,
        Dmg::Thunder,
    ];

    #[inline]
    pub fn bit(self) -> u32 {
        1 << (self as u32)
    }

    /// natural20's damage type name.
    pub fn name(self) -> &'static str {
        match self {
            Dmg::Acid => "acid",
            Dmg::Bludgeoning => "bludgeoning",
            Dmg::Cold => "cold",
            Dmg::Fire => "fire",
            Dmg::Force => "force",
            Dmg::Lightning => "lightning",
            Dmg::Necrotic => "necrotic",
            Dmg::Piercing => "piercing",
            Dmg::Poison => "poison",
            Dmg::Psychic => "psychic",
            Dmg::Radiant => "radiant",
            Dmg::Slashing => "slashing",
            Dmg::Thunder => "thunder",
        }
    }

    pub fn from_name(name: &str) -> Option<Dmg> {
        Dmg::ALL.iter().copied().find(|d| d.name() == name)
    }
}

pub fn dmg_set(list: &[Dmg]) -> u32 {
    list.iter().fold(0, |acc, d| acc | d.bit())
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub enum Ability {
    Str,
    Dex,
    Con,
    Int,
    Wis,
    Cha,
}

impl Ability {
    pub const ALL: [Ability; 6] = [Ability::Str, Ability::Dex, Ability::Con, Ability::Int, Ability::Wis, Ability::Cha];

    pub fn idx(self) -> usize {
        self as usize
    }
    /// natural20's short key (`ability_scores` dict).
    pub fn short(self) -> &'static str {
        ["str", "dex", "con", "int", "wis", "cha"][self as usize]
    }
    pub fn from_short(s: &str) -> Option<Ability> {
        Ability::ALL.iter().copied().find(|a| a.short() == s)
    }
    pub fn save_name(self) -> &'static str {
        match self {
            Ability::Str => "strength",
            Ability::Dex => "dexterity",
            Ability::Con => "constitution",
            Ability::Int => "intelligence",
            Ability::Wis => "wisdom",
            Ability::Cha => "charisma",
        }
    }
    /// Draw tag of a saving throw (`dice_roll.<save>_saving_throw`).
    pub fn save_tag(self) -> &'static str {
        match self {
            Ability::Str => "strength_saving_throw",
            Ability::Dex => "dexterity_saving_throw",
            Ability::Con => "constitution_saving_throw",
            Ability::Int => "intelligence_saving_throw",
            Ability::Wis => "wisdom_saving_throw",
            Ability::Cha => "charisma_saving_throw",
        }
    }
}

/// `Entity.modifier_table`.
pub fn ability_mod(score: i32) -> i32 {
    if score <= 1 {
        -5
    } else {
        (score - 10).div_euclid(2)
    }
}

/// A parsed natural20 dice string: `count`d`sides` + `modifier`, or a fixed
/// value (`sides == 0`, value `count + modifier`, e.g. the unarmed strike's
/// `"1+3"`).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Dice {
    pub count: i32,
    pub sides: i32,
    pub modifier: i32,
}

impl Dice {
    pub const fn new(count: i32, sides: i32, modifier: i32) -> Dice {
        Dice { count, sides, modifier }
    }

    /// `NdS`, `NdS+M`, `NdS-M`, `N` or `N+M` (the forms natural20's
    /// exported damage strings take).
    pub fn parse(text: &str) -> Result<Dice, String> {
        let t = text.trim();
        if t.is_empty() {
            return Err("empty dice string".into());
        }
        let (head, modifier) = match t[1..].find(['+', '-']).map(|i| i + 1) {
            Some(i) => {
                let m: i32 = t[i..].trim_start_matches('+').parse().map_err(|_| format!("bad dice {text:?}"))?;
                (&t[..i], m)
            }
            None => (t, 0),
        };
        let bad = || format!("bad dice {text:?}");
        match head.split_once('d') {
            Some((n, s)) => {
                let count = if n.is_empty() { 1 } else { n.parse().map_err(|_| bad())? };
                let sides = s.parse().map_err(|_| bad())?;
                Ok(Dice::new(count, sides, modifier))
            }
            None => Ok(Dice::new(head.parse().map_err(|_| bad())?, 0, modifier)),
        }
    }

    /// `DieRoll.expected()` / `average_dice` (a fixed value is itself).
    pub fn average(self) -> f64 {
        if self.sides == 0 {
            (self.count + self.modifier) as f64
        } else {
            self.count as f64 * (self.sides as f64 + 1.0) / 2.0 + self.modifier as f64
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Condition {
    Paralyzed,
}

/// An on-hit rider of an NPC attack (`on_hit` YAML).
#[derive(Clone, Debug)]
pub enum OnHit {
    /// `save_dc: <ability>:<dc>`, `fail: condition:<name>` (ghoul and ghast
    /// claws). `not_undead` / `not_elf`: the `if:` clause excludes them.
    SaveCondition { ability: Ability, dc: i32, condition: Condition, not_undead: bool, not_elf: bool },
    /// `fail: effect:life_drain` (specter, wight).
    LifeDrain,
    /// `fail: effect:strength_drain` (shadow).
    StrengthDrain,
    /// `fail: effect:no_healing` with `duration: indefinite` (a mummy's
    /// Rotting Fist): the target is cursed and can't regain Hit Points for
    /// the rest of the fight (`NoHealingEffect`, one per creature).
    Curse,
    /// `fail: effect:frightened` with `duration: end_of_source_next_turn`
    /// (a mummy's Dreadful Glare): Frightened of the attacker until the end
    /// of its next turn (`fear.apply_fear(until_source_turn_end=True)`).
    Frighten,
}

impl OnHit {
    /// The YAML `fail:` text.
    pub fn fail(&self) -> &'static str {
        match self {
            OnHit::SaveCondition { .. } => "condition:paralyzed",
            OnHit::LifeDrain => "effect:life_drain",
            OnHit::StrengthDrain => "effect:strength_drain",
            OnHit::Curse => "effect:no_healing",
            OnHit::Frighten => "effect:frightened",
        }
    }
}

/// The ability a hero weapon attacks with (`Entity.attack_ability_mod`).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AtkAbility {
    /// NPC attacks: fixed numbers from the stat block.
    Fixed,
    Str,
    /// A finesse weapon: the better of STR and DEX.
    Finesse,
}

#[derive(Clone, Debug)]
pub struct AttackDef {
    /// natural20 name (`using` for weapons, `npc_action['name']` for monsters).
    pub name: &'static str,
    /// Ranged attack rules (`_is_ranged`): a ranged weapon or a thrown attack.
    pub ranged: bool,
    /// YAML `type: melee_attack` (a thrown dagger is one: an attack on a
    /// paralyzed or unconscious creature within 5 ft is still a critical hit).
    pub melee_type: bool,
    /// A thrown attack (`AttackAction.thrown`): the weapon leaves the thrower.
    pub thrown: bool,
    /// Normal range in feet (a thrown attack: the thrown range).
    pub range: i32,
    /// Long range in feet (`range_max`, else `range`).
    pub range_max: i32,
    pub to_hit: i32,
    pub damage: Dice,
    pub damage_type: Dmg,
    /// `additional_damage` riders.
    pub additional: Vec<(Dice, Dmg)>,
    /// `additional_damage` riders with `condition: advantage`: rolled only
    /// when the attack roll had Advantage and no Disadvantage (G8b goblins).
    /// They follow the unconditional ones in the YAML (checked at load).
    pub additional_adv: Vec<(Dice, Dmg)>,
    pub on_hit: Vec<OnHit>,
    /// `save_attack: {save, dc}`.
    pub save_attack: Option<(Ability, i32)>,
    /// `save_attack: {immune_on_success: true}`: a creature that saves is
    /// immune to this creature's action for the fight (never a target again).
    pub save_immune: bool,
    /// `kill_at_zero`: a creature reduced from above 0 to 0 Hit Points by the
    /// hit (riders included) dies (a mummy's Rotting Fist).
    pub kill_at_zero: bool,
    /// `no_damage`: a save action that deals no damage (Dreadful Glare); a
    /// failed save applies the `on_hit` effects only (no damage event).
    pub no_damage: bool,
    pub multiattack_group: Option<i32>,
    /// A weapon for Savage Attacker (not an unarmed strike).
    pub savage: bool,
    /// Great Weapon Fighting applies (melee, two-handed).
    pub gwf: bool,
    /// Graze mastery damage on a miss (the attack ability modifier), if any.
    pub graze: Option<i32>,
    /// Sap mastery: a hit gives the creature Disadvantage on its next attack
    /// roll (N20-029).
    pub sap: bool,
    /// Cleave mastery: a melee hit on the wielder's turn opens one free
    /// attack on a second creature (`weapon_mastery.cleave_window_item`).
    pub cleave: bool,
    /// Hero weapons: the attack ability.
    pub ability: AtkAbility,
    /// Versatile: the two-handed damage die (`damage_2`), used while at most
    /// one hand slot is in use (`damage_modifier`).
    pub versatile: Option<Dice>,
    /// The equipped item this attack uses (index into `Template::gear`);
    /// `None` for the unarmed strike. The attack exists while it is equipped.
    pub item: Option<u8>,
    /// NPC attacks made with an inventory item (YAML `item:`, the Goblin
    /// Minion's daggers): index into `Template::inventory`. No item left, no
    /// attack; an NPC throw spends one (G8b).
    pub npc_item: Option<u8>,
}

/// An NPC `swap_retarget` reaction (`natural20/utils/npc_reactions.py`, the
/// Goblin Boss's Redirect Attack): when an attack roll against it would hit,
/// it may swap places with an ally within `range` feet, which becomes the
/// target.
#[derive(Clone, Debug)]
pub struct SwapRetarget {
    /// The stat block's name (`redirect_attack`): the candidate's kind.
    pub name: &'static str,
    /// Only against an attacker it can see.
    pub requires_sight: bool,
    /// Feet.
    pub range: i32,
    /// Allowed ally sizes (empty: any).
    pub ally_sizes: Vec<&'static str>,
}

/// The spells the engine implements (each once). Content names them by
/// natural20 spell id ([`SpellId::from_key`]); an unknown id is a load error.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum SpellId {
    // cleric list
    SacredFlame,
    GuidingBolt,
    SpiritualWeapon,
    Bless,
    ShieldOfFaith,
    CureWounds,
    HealingWord,
    Aid,
    Command,
    ProtectionFromEvilAndGood,
    Sanctuary,
    SpareTheDying,
    LesserRestoration,
    // sorcerer / wizard list
    SorcerousBurst,
    Firebolt,
    RayOfFrost,
    AcidSplash,
    ChromaticOrb,
    MagicMissile,
    BurningHands,
    Thunderwave,
    Shatter,
    ScorchingRay,
    DragonsBreath,
    Blur,
    Shield,
    // wizard (Ilyra)
    MageArmor,
}

impl SpellId {
    pub const ALL: [SpellId; 27] = {
        use SpellId::*;
        [
            SacredFlame, GuidingBolt, SpiritualWeapon, Bless, ShieldOfFaith, CureWounds, HealingWord, Aid, Command,
            ProtectionFromEvilAndGood, Sanctuary, SpareTheDying, LesserRestoration, SorcerousBurst, Firebolt,
            RayOfFrost, AcidSplash, ChromaticOrb, MagicMissile, BurningHands, Thunderwave, Shatter, ScorchingRay,
            DragonsBreath, Blur, Shield, MageArmor,
        ]
    };

    /// The spell mechanic for a natural20 spell id.
    pub fn from_key(key: &str) -> Option<SpellId> {
        SpellId::ALL.iter().copied().find(|s| s.key() == key)
    }
}

/// Metamagic options the engine implements (`natural20/utils/metamagic.py`).
pub use crate::spells::Mm;

impl Mm {
    pub fn from_key(key: &str) -> Option<Mm> {
        [Mm::Empowered, Mm::Heightened].into_iter().find(|m| m.key() == key)
    }
}

/// Spellcasting numbers natural20 derives for a hero.
#[derive(Clone, Debug)]
pub struct CasterSpec {
    pub ability: Ability,
    /// `spell_attack_modifier_for` (the same for every listed spell here).
    pub spell_attack: i32,
    /// `caster_save_dc` / `spell_save_dc(<ability>)`.
    pub dc: i32,
    /// Level in the spellcasting class (Preserve Life's pool is 5 x this).
    pub level: i32,
    /// Slots by level (index 1, 2).
    pub slots: [i32; 3],
    /// `spell_list` order, filtered to the action spells
    /// (`scenarios/general/mechanics.py` `ACTION_SPELLS`).
    pub spells: Vec<SpellId>,
    /// Prepared reaction spells (`REACTION_SPELLS`: Shield).
    pub reaction_spells: Vec<SpellId>,
    pub channel_divinity: i32,
    /// Free casts (Magic Initiate: one use each per long rest), with the
    /// resource pool natural20 registers for each.
    pub free_casts: Vec<SpellId>,
    pub free_cast_pools: Vec<&'static str>,
    pub holy_water: i32,
    pub sorcery_points: i32,
    pub innate_sorcery: i32,
    /// Known Metamagic options.
    pub metamagic: Vec<Mm>,
}

/// A creature of the pool. `id` is the natural20 content id.
#[derive(Clone, Debug)]
pub struct Template {
    pub id: &'static str,
    pub base_id: &'static str,
    pub level: i32,
    pub potent_cantrip: bool,
    pub remarkable_athlete: bool,
    pub name: &'static str,
    pub size: &'static str,
    pub pc: bool,
    pub ac: i32,
    pub max_hp: i32,
    pub speed: i32,
    pub fly: bool,
    /// STR, DEX, CON, INT, WIS, CHA.
    pub abil: [i32; 6],
    pub save_prof: [bool; 6],
    pub prof_bonus: i32,
    /// `initiative_bonus()` as natural20 computes it.
    pub init_bonus: i32,
    /// Advantage on initiative (Remarkable Athlete).
    pub init_adv: bool,
    pub attacks: Vec<AttackDef>,
    pub resist: u32,
    pub vulnerable: u32,
    pub immune: u32,
    pub immune_prone: bool,
    pub immune_paralyzed: bool,
    /// Condition immunity to Poisoned (all the undead).
    pub immune_poisoned: bool,
    /// Condition immunity to Frightened (the shadow).
    pub immune_frightened: bool,
    /// Condition immunities with no effect here (observation features only).
    pub immune_charmed: bool,
    pub immune_exhaustion: bool,
    pub undead: bool,
    pub elf: bool,
    /// One of Protection from Evil and Good's creature types
    /// (`protection_from_evil_and_good.protected_against`: aberration,
    /// celestial, elemental, fey, fiend, undead): the goblins are Fey.
    pub pfeg_protected: bool,
    /// `undead_fortitude: {dc_base, bypass}`.
    pub undead_fortitude: Option<(i32, u32)>,
    pub stench_dc: Option<i32>,
    /// Multiattack combinations (`multiattack` YAML), as attack-name lists.
    pub multiattack: Vec<Vec<&'static str>>,
    // Fighter
    pub improved_critical: bool,
    pub great_weapon_fighting: bool,
    pub savage_attacker: bool,
    /// Has the fighter resources (`second_wind_count` / `action_surge_count`).
    pub fighter: bool,
    pub second_wind_uses: i32,
    pub second_wind_die: Dice,
    pub fighter_level: i32,
    pub action_surge_uses: i32,
    // Cleric
    /// Has `channel_divinity_count` (the digest's `cd`).
    pub channel_divinity: bool,
    pub turn_undead: bool,
    pub divine_spark: bool,
    pub preserve_life: bool,
    pub disciple_of_life: bool,
    // Sorcerer
    /// A sorcerer (`sorcery_points` exists: the digest's `sp`, `isc`, `isu`).
    pub sorcerer: bool,
    pub innate_sorcery: bool,
    /// `melee_distance()` in feet (`None`: no melee attack).
    pub melee_ft: Option<i32>,
    pub caster: Option<CasterSpec>,
    /// Heroes: equipped items in sheet order, with the hand slots
    /// `used_hand_slots` counts for each (weapons and shields; armor 0).
    pub gear: Vec<(&'static str, f64)>,
    /// Heroes: spare copies of an equipped thrown weapon in the inventory
    /// (index into `gear`, count), spent before the held one.
    pub spares: Vec<(u8, i32)>,
    /// `wearing_armor()`: armor or a shield equipped (Mage Armor can't target).
    pub wearing_armor: bool,
    /// Expected damage per round for `expected_round_damage` (NPC best
    /// attack data: (attack bonus or None for save attacks, average damage),
    /// attacks in the largest multiattack combo).
    pub erd: (Vec<(Option<i32>, f64)>, i32),
    pub pack_tactics: bool,
    pub construct: bool,
    /// Blindsight range in feet (zero for ordinary vision).
    pub blindsight: i32,
    /// Stealth threshold for detecting hidden creatures with ordinary vision.
    pub passive_perception: i32,
    /// Nimble Escape (bonus-action Disengage or Hide): the Hide check's
    /// Stealth modifier.
    pub nimble_escape: Option<i32>,
    /// NPC `reactions:` of type `swap_retarget` (at most one).
    pub swap_retarget: Option<SwapRetarget>,
    /// NPC inventory items its attacks use (name, starting count).
    pub inventory: Vec<(&'static str, i32)>,
    // Barbarian (2024 rules, `Ruleset.barbarian_model()` '2024'; src/barbarian.rs)
    /// Has Rage (the barbarian's per-turn hooks and state).
    pub barbarian: bool,
    pub rage_uses: i32,
    /// Rage Damage.
    pub rage_damage: i32,
    /// Heavy armor equipped: Rage can't be entered.
    pub heavy_armor: bool,
    pub reckless_attack: bool,
    pub danger_sense: bool,
    /// Path of the Berserker: Frenzy.
    pub frenzy: bool,
}

impl Template {
    pub fn str_mod(&self) -> i32 {
        ability_mod(self.abil[0])
    }
    pub fn dex_mod(&self) -> i32 {
        ability_mod(self.abil[1])
    }
}

// ----------------------------------------------------------------------------
// The mechanics registry
// ----------------------------------------------------------------------------

/// Hero features natural20 reports (`class_feature(id)`). `Inert` features
/// have no effect in this environment (their numbers are already in AC, HP,
/// initiative or the spell list, or nothing here uses them); the reason is
/// in `validation/export_content.py` `FEATURES`.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Feature {
    SecondWind,
    ActionSurge,
    ImprovedCritical,
    PotentCantrip,
    RemarkableAthlete,
    GreatWeaponFighting,
    SavageAttacker,
    ChannelDivinity,
    TurnUndead,
    DivineSpark,
    PreserveLife,
    DiscipleOfLife,
    InnateSorcery,
    Metamagic,
    FontOfMagic,
    Rage,
    RecklessAttack,
    DangerSense,
    Frenzy,
    Inert,
}

impl Feature {
    pub fn from_id(id: &str) -> Option<Feature> {
        use Feature::*;
        Some(match id {
            "second_wind" => SecondWind,
            "action_surge" => ActionSurge,
            "improved_critical" => ImprovedCritical,
            "great_weapon_fighting" => GreatWeaponFighting,
            "savage_attacker" => SavageAttacker,
            "channel_divinity" => ChannelDivinity,
            "channel_divinity_turn_undead" => TurnUndead,
            "divine_spark" => DivineSpark,
            "preserve_life" => PreserveLife,
            "disciple_of_life" => DiscipleOfLife,
            "innate_sorcery" => InnateSorcery,
            "metamagic" => Metamagic,
            "font_of_magic" => FontOfMagic,
            "rage" => Rage,
            "reckless_attack" => RecklessAttack,
            "danger_sense" => DangerSense,
            "frenzy" => Frenzy,
            "remarkable_athlete" => RemarkableAthlete,
            "potent_cantrip" => PotentCantrip,
            "wizard_subclass" | "evocation_savant" | "martial_archetype" | "weapon_mastery" | "divine_order" | "divine_domain"
            | "draconic_resilience" | "sorcerer_subclass" | "draconic_spells" | "spellcasting" | "alert"
            | "magic_initiate_cleric" | "magic_initiate_wizard" | "resourceful" | "skillful" | "versatile"
            | "elven_lineage" | "fey_ancestry" | "keen_senses" | "trance" | "defense" | "ritual_adept"
            | "arcane_recovery" | "scholar" | "unarmored_defense_barbarian" | "primal_path" | "primal_knowledge" => Inert,
            _ => return None,
        })
    }
}

/// NPC traits (`attributes`). Same convention as [`Feature`].
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Trait {
    PackTactics,
    UndeadFortitude,
    Stench,
    /// Bonus action Disengage or Hide (`disengage_bonus`, `hide_bonus`).
    NimbleEscape,
    Inert,
}

impl Trait {
    pub fn from_id(id: &str) -> Option<Trait> {
        Some(match id {
            "undead_fortitude" => Trait::UndeadFortitude,
            "stench" => Trait::Stench,
            "nimble_escape" => Trait::NimbleEscape,
            "pack_tactics" => Trait::PackTactics,
            "incorporeal_movement" | "sunlight_sensitivity" | "sunlight_weakness" | "amorphous" | "shadow_stealth" => {
                Trait::Inert
            }
            _ => return None,
        })
    }
}

/// Conditions content may be immune to. The engine applies Prone, Paralyzed,
/// Poisoned and Frightened; the others never occur here.
const CONDITIONS: [&str; 15] = [
    "blinded", "charmed", "deafened", "exhaustion", "frightened", "grappled", "incapacitated", "invisible",
    "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious",
];

// ----------------------------------------------------------------------------
// JSON schema (validation/export_content.py)
// ----------------------------------------------------------------------------

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct Provenance {
    pub natural20_commit: String,
    pub exporter: String,
    pub files: BTreeMap<String, String>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct Tags {
    pub undead: bool,
    pub elf: bool,
    pub object: bool,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct Initiative {
    pub bonus: i32,
    pub advantage: bool,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct DamageMods {
    pub resistances: Vec<String>,
    pub immunities: Vec<String>,
    pub vulnerabilities: Vec<String>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct ExtraDamage {
    pub damage: String,
    pub damage_type: String,
    /// `advantage`: only when the attack roll had Advantage (absent: always).
    #[serde(default)]
    pub condition: Option<String>,
}

/// An NPC reaction (`reactions:` YAML, `npc_reactions.reaction_specs`).
#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct ReactionDoc {
    pub id: String,
    pub name: String,
    pub trigger: String,
    pub requires_sight: bool,
    pub range: i32,
    pub ally_sizes: Vec<String>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct OnHitDoc {
    pub id: String,
    #[serde(rename = "if")]
    pub if_: Vec<String>,
    #[serde(default)]
    pub save: Option<String>,
    #[serde(default)]
    pub dc: Option<i32>,
    #[serde(default)]
    pub condition: Option<String>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct SaveAttackDoc {
    pub save: String,
    pub dc: i32,
    #[serde(default)]
    pub immune_on_success: bool,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct AttackDoc {
    pub name: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub range: i32,
    pub range_max: i32,
    pub to_hit: Option<i32>,
    pub damage: String,
    /// `None` only for a `no_damage` action.
    pub damage_type: Option<String>,
    pub ability: Option<String>,
    pub proficient: Option<bool>,
    pub additional: Vec<ExtraDamage>,
    pub on_hit: Vec<OnHitDoc>,
    pub save_attack: Option<SaveAttackDoc>,
    pub multiattack_group: Option<i32>,
    pub masteries: Vec<String>,
    pub riders: Vec<String>,
    /// A thrown attack row (heroes).
    #[serde(default)]
    pub thrown: bool,
    /// Versatile two-handed damage die (heroes).
    #[serde(default)]
    pub versatile: Option<String>,
    /// The equipped item this attack uses (heroes; none for unarmed), or
    /// the inventory item an NPC attack is made with (G8b).
    #[serde(default)]
    pub item: Option<String>,
    /// Mummy: death at 0 HP (Rotting Fist).
    #[serde(default)]
    pub kill_at_zero: bool,
    /// Mummy: a save action without damage (Dreadful Glare).
    #[serde(default)]
    pub no_damage: bool,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct GearDoc {
    pub id: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub hand_slots: f64,
}

/// A hero's equipment (`validation/export_content.py` `_loadout`).
#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct LoadoutDoc {
    pub equipment: Vec<GearDoc>,
    pub spares: BTreeMap<String, i32>,
    pub wearing_armor: bool,
}

#[derive(Deserialize, Debug, Clone)]
pub struct FeatureDoc {
    pub id: String,
    #[serde(flatten)]
    pub params: BTreeMap<String, serde_json::Value>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct ErdDoc {
    pub attacks: Vec<(Option<i32>, f64)>,
    pub count: i32,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct FreeCastDoc {
    pub spell: String,
    pub pool: String,
    pub uses: i32,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct SpellInfoDoc {
    pub id: String,
    pub name: String,
    pub level: i32,
    pub casting_time: String,
    pub concentration: bool,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct SpellcastingDoc {
    pub class: String,
    pub level: i32,
    pub ability: String,
    pub attack: i32,
    pub dc: i32,
    pub slots: Vec<i32>,
    pub spells: Vec<String>,
    pub reaction_spells: Vec<String>,
    pub inert_spells: Vec<String>,
    pub spell_info: Vec<SpellInfoDoc>,
    pub free_casts: Vec<FreeCastDoc>,
    pub resources: BTreeMap<String, i32>,
}

/// One `content/<pack>/<id>.json` file.
#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct ContentDoc {
    pub schema: i32,
    pub id: String,
    #[serde(default)]
    pub base_id: Option<String>,
    pub source: String,
    pub licence: String,
    pub attribution: String,
    pub provenance: Provenance,
    pub side: String,
    pub name: String,
    pub pc: bool,
    pub size: String,
    pub tags: Tags,
    pub races: Vec<String>,
    pub ac: i32,
    pub max_hp: i32,
    pub speed: i32,
    pub fly: bool,
    pub abilities: BTreeMap<String, i32>,
    pub proficiency_bonus: i32,
    pub saves: BTreeMap<String, i32>,
    pub initiative: Initiative,
    pub melee_reach: Option<i32>,
    pub damage: DamageMods,
    pub condition_immunities: Vec<String>,
    pub passive_perception: i32,
    #[serde(default)]
    pub blindsight: i32,
    /// Heroes only (monsters: null).
    #[serde(default)]
    pub loadout: Option<LoadoutDoc>,
    pub classes: BTreeMap<String, i32>,
    pub attacks: Vec<AttackDoc>,
    pub multiattack: Vec<Vec<String>>,
    #[serde(default)]
    pub expected_round_damage: Option<ErdDoc>,
    pub traits: Vec<FeatureDoc>,
    pub features: Vec<FeatureDoc>,
    pub spellcasting: Option<SpellcastingDoc>,
    /// Monsters: inventory items their attacks use (name -> count).
    #[serde(default)]
    pub inventory: Option<BTreeMap<String, i32>>,
    /// Monsters: NPC reactions.
    #[serde(default)]
    pub reactions: Option<Vec<ReactionDoc>>,
}

// ----------------------------------------------------------------------------
// Interning
// ----------------------------------------------------------------------------

/// Interned names: one `'static` allocation per distinct string, so names
/// compare and copy as pointers (the pool lives for the whole process).
pub fn intern(s: &str) -> &'static str {
    static TABLE: OnceLock<Mutex<HashSet<&'static str>>> = OnceLock::new();
    let mut t = TABLE.get_or_init(Default::default).lock().unwrap();
    if let Some(&x) = t.get(s) {
        return x;
    }
    let leaked: &'static str = Box::leak(s.to_string().into_boxed_str());
    t.insert(leaked);
    leaked
}

// ----------------------------------------------------------------------------
// Building templates
// ----------------------------------------------------------------------------

fn param_i32(f: &FeatureDoc, key: &str) -> Result<i32, String> {
    f.params
        .get(key)
        .and_then(|v| v.as_i64())
        .map(|v| v as i32)
        .ok_or_else(|| format!("feature {}: missing integer {key}", f.id))
}

fn dmg(name: &str) -> Result<Dmg, String> {
    Dmg::from_name(name).ok_or_else(|| format!("unknown damage type {name:?}"))
}

fn dmg_bits(list: &[String]) -> Result<u32, String> {
    let mut bits = 0;
    for n in list {
        bits |= dmg(n)?.bit();
    }
    Ok(bits)
}

fn ability(name: &str) -> Result<Ability, String> {
    Ability::from_short(name).ok_or_else(|| format!("unknown ability {name:?}"))
}

fn spell(key: &str) -> Result<SpellId, String> {
    SpellId::from_key(key).ok_or_else(|| format!("spell {key:?} is not implemented (unknown mechanic)"))
}

impl Template {
    /// Build and check a template from its exported document. Every id must
    /// be a known mechanic; the hero weapon numbers the engine recomputes
    /// from Strength must equal natural20's.
    pub fn from_doc(d: &ContentDoc) -> Result<Template, String> {
        let ctx = |e: String| format!("{}: {e}", d.id);
        Template::build(d).map_err(ctx)
    }

    fn build(d: &ContentDoc) -> Result<Template, String> {
        if d.schema != 1 {
            return Err(format!("schema {} (expected 1)", d.schema));
        }
        if d.pc != (d.side == "heroes") || !matches!(d.side.as_str(), "heroes" | "monsters") {
            return Err(format!("side {:?} with pc {}", d.side, d.pc));
        }
        if !matches!(d.size.as_str(), "small" | "medium") {
            return Err(format!("size {:?}: only 1x1 creatures (Small, Medium) are supported", d.size));
        }
        if d.tags.object {
            return Err("objects are not creatures".into());
        }
        let mut abil = [0; 6];
        let mut save_prof = [false; 6];
        for a in Ability::ALL {
            abil[a.idx()] = *d.abilities.get(a.short()).ok_or_else(|| format!("no {} score", a.short()))?;
        }
        for a in Ability::ALL {
            let save = *d.saves.get(a.short()).ok_or_else(|| format!("no {} save", a.short()))?;
            let m = ability_mod(abil[a.idx()]);
            save_prof[a.idx()] = if save == m + d.proficiency_bonus {
                true
            } else if save == m {
                false
            } else {
                return Err(format!("{} save {save:+} is neither the modifier nor modifier + PB", a.short()));
            };
        }
        let mut cond = HashSet::new();
        for c in &d.condition_immunities {
            if !CONDITIONS.contains(&c.as_str()) {
                return Err(format!("unknown condition {c:?}"));
            }
            cond.insert(c.as_str());
        }
        let mut t = Template {
            id: intern(&d.id),
            base_id: intern(d.base_id.as_deref().unwrap_or(&d.id)),
            level: d.classes.values().sum(),
            potent_cantrip: false,
            remarkable_athlete: false,
            name: intern(&d.name),
            size: intern(&d.size),
            pc: d.pc,
            ac: d.ac,
            max_hp: d.max_hp,
            speed: d.speed,
            fly: d.fly,
            abil,
            save_prof,
            prof_bonus: d.proficiency_bonus,
            init_bonus: d.initiative.bonus,
            init_adv: d.initiative.advantage,
            attacks: Vec::new(),
            resist: dmg_bits(&d.damage.resistances)?,
            vulnerable: dmg_bits(&d.damage.vulnerabilities)?,
            immune: dmg_bits(&d.damage.immunities)?,
            immune_prone: cond.contains("prone"),
            immune_paralyzed: cond.contains("paralyzed"),
            immune_poisoned: cond.contains("poisoned"),
            immune_frightened: cond.contains("frightened"),
            immune_charmed: cond.contains("charmed"),
            immune_exhaustion: cond.contains("exhaustion"),
            undead: d.tags.undead,
            pfeg_protected: d.tags.undead
                || d.races.iter().any(|r| matches!(r.as_str(), "aberration" | "celestial" | "elemental" | "fey" | "fiend" | "undead")),
            elf: d.tags.elf,
            undead_fortitude: None,
            stench_dc: None,
            multiattack: Vec::new(),
            improved_critical: false,
            great_weapon_fighting: false,
            savage_attacker: false,
            fighter: false,
            second_wind_uses: 0,
            second_wind_die: Dice::new(0, 0, 0),
            fighter_level: 0,
            action_surge_uses: 0,
            channel_divinity: false,
            turn_undead: false,
            divine_spark: false,
            preserve_life: false,
            disciple_of_life: false,
            sorcerer: d.classes.contains_key("sorcerer"),
            innate_sorcery: false,
            melee_ft: d.melee_reach,
            caster: None,
            erd: (Vec::new(), 1),
            gear: Vec::new(),
            spares: Vec::new(),
            wearing_armor: false,
            passive_perception: d.passive_perception,
            pack_tactics: false,
            construct: d.races.iter().any(|r| r == "construct"),
            blindsight: d.blindsight,
            nimble_escape: None,
            barbarian: false,
            rage_uses: 0,
            rage_damage: 0,
            heavy_armor: false,
            reckless_attack: false,
            danger_sense: false,
            frenzy: false,
            swap_retarget: None,
            inventory: Vec::new(),
        };
        match (&d.inventory, d.pc) {
            (Some(inv), false) => {
                for (name, &n) in inv {
                    if n < 0 {
                        return Err(format!("inventory {name}: {n}"));
                    }
                    t.inventory.push((intern(name), n));
                }
            }
            (None, _) => {}
            (Some(_), true) => return Err("a hero's items are its loadout".into()),
        }
        if t.inventory.len() > 8 {
            return Err("more than 8 inventory items".into());
        }
        for r in d.reactions.iter().flatten() {
            if d.pc {
                return Err("NPC reactions on a hero".into());
            }
            if r.id != "swap_retarget" || r.trigger != "attack_roll" {
                return Err(format!("reaction {} ({}) is not implemented (unknown mechanic)", r.id, r.trigger));
            }
            if t.swap_retarget.is_some() {
                return Err("two swap_retarget reactions".into());
            }
            for s in &r.ally_sizes {
                if !matches!(s.as_str(), "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan") {
                    return Err(format!("reaction ally size {s:?}"));
                }
            }
            if r.range < 5 {
                return Err(format!("reaction range {}", r.range));
            }
            t.swap_retarget = Some(SwapRetarget {
                name: intern(&r.name),
                requires_sight: r.requires_sight,
                range: r.range,
                ally_sizes: r.ally_sizes.iter().map(|s| intern(s)).collect(),
            });
        }
        match (&d.loadout, d.pc) {
            (Some(l), true) => {
                for g in &l.equipment {
                    let counted = [0.0, 0.5, 1.0, 2.0].contains(&g.hand_slots);
                    if !counted || (g.kind == "armor" && g.hand_slots != 0.0) {
                        return Err(format!("item {}: hand slots {}", g.id, g.hand_slots));
                    }
                    t.gear.push((intern(&g.id), g.hand_slots));
                }
                if t.gear.len() > 32 {
                    return Err("more than 32 equipped items".into());
                }
                for (name, &n) in &l.spares {
                    let i = t.gear.iter().position(|g| g.0 == name).ok_or_else(|| format!("spare {name} is not equipped"))?;
                    if n < 0 {
                        return Err(format!("spare {name}: {n}"));
                    }
                    t.spares.push((i as u8, n));
                }
                t.wearing_armor = l.wearing_armor;
                let any_armor = l.equipment.iter().any(|g| g.kind == "armor" || g.kind == "shield");
                if any_armor != l.wearing_armor {
                    return Err("wearing_armor disagrees with the equipment".into());
                }
            }
            (None, false) => {}
            _ => return Err("a loadout is for heroes only (and every hero has one)".into()),
        }
        if d.fly && d.speed <= 0 {
            return Err("a flyer without speed".into());
        }
        let str_mod = ability_mod(abil[0]);
        let dex_mod = ability_mod(abil[1]);
        let hands: f64 = t.gear.iter().map(|g| g.1).sum();
        for a in &d.attacks {
            let def = attack(a, d.pc, str_mod, dex_mod, d.proficiency_bonus, &t.gear, hands, &t.inventory)
                .map_err(|e| format!("attack {}: {e}", a.name))?;
            t.attacks.push(def);
        }
        // an NPC's thrown row follows its melee row (`generate_npc_attack_actions`)
        for (i, a) in t.attacks.iter().enumerate() {
            if !d.pc && a.thrown {
                let base = i.checked_sub(1).map(|j| &t.attacks[j]);
                let ok = base.is_some_and(|b| {
                    b.name == a.name && !b.thrown && b.npc_item == a.npc_item && b.to_hit == a.to_hit && b.damage == a.damage
                        && b.damage_type == a.damage_type && b.additional == a.additional
                        && b.additional_adv == a.additional_adv && b.multiattack_group == a.multiattack_group
                        && b.on_hit.is_empty() && a.on_hit.is_empty()
                });
                if !ok {
                    return Err(format!("thrown NPC attack {} does not follow its melee row", a.name));
                }
            }
        }
        for (k, (name, _)) in t.inventory.iter().enumerate() {
            if !t.attacks.iter().any(|a| a.npc_item == Some(k as u8)) {
                return Err(format!("inventory item {name} that no attack uses"));
            }
        }
        for &(i, _) in &t.spares {
            if !t.attacks.iter().any(|a| a.thrown && a.item == Some(i)) {
                return Err(format!("spare {} without a thrown attack", t.gear[i as usize].0));
            }
        }
        for combo in &d.multiattack {
            let mut names = Vec::new();
            for n in combo {
                let def = t.attacks.iter().find(|a| a.name == n).ok_or_else(|| format!("multiattack names {n:?}"))?;
                names.push(def.name);
            }
            t.multiattack.push(names);
        }
        let melee = t.attacks.iter().filter(|a| !a.ranged).map(|a| a.range).max();
        if !d.pc && melee != t.melee_ft {
            return Err(format!("melee_reach {:?} but melee attacks reach {melee:?}", t.melee_ft));
        }
        if let Some(e) = &d.expected_round_damage {
            if d.pc {
                return Err("expected_round_damage on a hero".into());
            }
            t.erd = (e.attacks.clone(), e.count);
        }
        for tr in &d.traits {
            match Trait::from_id(&tr.id).ok_or_else(|| format!("unknown trait {:?} (no mechanic)", tr.id))? {
                Trait::UndeadFortitude => {
                    let bypass: Vec<String> = serde_json::from_value(tr.params.get("bypass").cloned().unwrap_or_default())
                        .map_err(|e| format!("undead_fortitude bypass: {e}"))?;
                    t.undead_fortitude = Some((param_i32(tr, "dc_base")?, dmg_bits(&bypass)?));
                }
                Trait::Stench => t.stench_dc = Some(param_i32(tr, "dc")?),
                Trait::PackTactics => t.pack_tactics = true,
                Trait::NimbleEscape => t.nimble_escape = Some(param_i32(tr, "stealth")?),
                Trait::Inert => {}
            }
        }
        let mut metamagic = Vec::new();
        for f in &d.features {
            match Feature::from_id(&f.id).ok_or_else(|| format!("unknown feature {:?} (no mechanic)", f.id))? {
                Feature::SecondWind => {
                    t.fighter = true;
                    t.second_wind_uses = param_i32(f, "uses")?;
                    t.fighter_level = param_i32(f, "level")?;
                    let die = f.params.get("die").and_then(|v| v.as_str()).ok_or("second_wind: no die")?;
                    t.second_wind_die = Dice::parse(die)?;
                }
                Feature::ActionSurge => {
                    t.fighter = true;
                    t.action_surge_uses = param_i32(f, "uses")?;
                }
                Feature::PotentCantrip => t.potent_cantrip = true,
                Feature::RemarkableAthlete => t.remarkable_athlete = true,
                Feature::ImprovedCritical => t.improved_critical = true,
                Feature::GreatWeaponFighting => {
                    let model = f.params.get("model").and_then(|v| v.as_str());
                    if model != Some("treat_1_2_as_3") {
                        return Err(format!("Great Weapon Fighting model {model:?} is not implemented"));
                    }
                    t.great_weapon_fighting = true;
                }
                Feature::SavageAttacker => t.savage_attacker = true,
                Feature::ChannelDivinity => t.channel_divinity = true,
                Feature::TurnUndead => t.turn_undead = true,
                Feature::DivineSpark => t.divine_spark = true,
                Feature::PreserveLife => t.preserve_life = true,
                Feature::DiscipleOfLife => t.disciple_of_life = true,
                Feature::InnateSorcery => t.innate_sorcery = true,
                Feature::Metamagic => {
                    let opts: Vec<String> = serde_json::from_value(f.params.get("options").cloned().unwrap_or_default())
                        .map_err(|e| format!("metamagic options: {e}"))?;
                    for o in opts {
                        metamagic.push(Mm::from_key(&o).ok_or_else(|| format!("metamagic {o:?} is not implemented"))?);
                    }
                }
                Feature::Rage => {
                    let model = f.params.get("model").and_then(|v| v.as_str());
                    if model != Some("2024") {
                        return Err(format!("Barbarian model {model:?} is not implemented"));
                    }
                    t.barbarian = true;
                    t.rage_uses = param_i32(f, "uses")?;
                    t.rage_damage = param_i32(f, "damage")?;
                    t.heavy_armor = f.params.get("heavy_armor").and_then(|v| v.as_bool()).ok_or("rage: no heavy_armor")?;
                }
                Feature::RecklessAttack => t.reckless_attack = true,
                Feature::DangerSense => t.danger_sense = true,
                Feature::Frenzy => t.frenzy = true,
                Feature::FontOfMagic | Feature::Inert => {}
            }
        }
        if (t.reckless_attack || t.danger_sense || t.frenzy) && !t.barbarian {
            return Err("a Barbarian feature without Rage".into());
        }
        if let Some(sc) = &d.spellcasting {
            t.caster = Some(caster(sc, &t, metamagic).map_err(|e| format!("spellcasting: {e}"))?);
        } else if !metamagic.is_empty() {
            return Err("metamagic without spellcasting".into());
        }
        if (t.turn_undead || t.divine_spark || t.preserve_life) && !t.channel_divinity {
            return Err("a Channel Divinity option without Channel Divinity".into());
        }
        Ok(t)
    }
}

#[allow(clippy::too_many_arguments)]
fn attack(
    a: &AttackDoc,
    pc: bool,
    str_mod: i32,
    dex_mod: i32,
    pb: i32,
    gear: &[(&'static str, f64)],
    hands: f64,
    inventory: &[(&'static str, i32)],
) -> Result<AttackDef, String> {
    let melee_type = match a.kind.as_str() {
        "melee_attack" => true,
        "ranged_attack" => false,
        k => return Err(format!("attack type {k:?} is not implemented")),
    };
    let ranged = !melee_type || a.thrown;
    let damage = Dice::parse(&a.damage)?;
    let save_attack = match &a.save_attack {
        Some(s) => Some((ability(&s.save)?, s.dc)),
        None => None,
    };
    let save_immune = a.save_attack.as_ref().is_some_and(|s| s.immune_on_success);
    if a.no_damage && (save_attack.is_none() || damage != Dice::new(0, 0, 0) || !a.additional.is_empty() || a.kill_at_zero || pc) {
        return Err("no_damage: an NPC save action with damage \"0\" and no riders".into());
    }
    let damage_type = match (&a.damage_type, a.no_damage) {
        (Some(t), false) => dmg(t)?,
        // never dealt (`no_damage`): a placeholder the engine never reads
        (None, true) => Dmg::Bludgeoning,
        _ => return Err("damage_type must be given exactly when the action deals damage".into()),
    };
    let to_hit = match (a.to_hit, save_attack) {
        (Some(v), None) => v,
        (None, Some(_)) => 0,
        _ => return Err("needs exactly one of to_hit and save_attack".into()),
    };
    let mut on_hit = Vec::new();
    for oh in &a.on_hit {
        let mut not_undead = false;
        let mut not_elf = false;
        for c in &oh.if_ {
            match c.as_str() {
                "!object" => {}
                "!undead" => not_undead = true,
                "!elf" => not_elf = true,
                other => return Err(format!("on_hit if clause {other:?} is not implemented")),
            }
        }
        let has_save = oh.save.is_some() || oh.dc.is_some();
        on_hit.push(match oh.id.as_str() {
            "save_condition" => {
                let condition = match oh.condition.as_deref() {
                    Some("paralyzed") => Condition::Paralyzed,
                    c => return Err(format!("on_hit condition {c:?} is not implemented")),
                };
                let ab = ability(oh.save.as_deref().ok_or("save_condition without save")?)?;
                OnHit::SaveCondition { ability: ab, dc: oh.dc.ok_or("save_condition without dc")?, condition, not_undead, not_elf }
            }
            "life_drain" if !has_save && !not_undead && !not_elf => OnHit::LifeDrain,
            "strength_drain" if !has_save && !not_undead && !not_elf => OnHit::StrengthDrain,
            "curse" if !has_save && !not_undead && !not_elf && !a.no_damage => OnHit::Curse,
            "frighten" if !has_save && !not_undead && !not_elf && save_attack.is_some() && a.no_damage => OnHit::Frighten,
            other => return Err(format!("on_hit {other:?} (with these options) is not implemented")),
        });
    }
    let mut savage = false;
    let mut gwf = false;
    for r in &a.riders {
        match r.as_str() {
            "savage_attacker" => savage = true,
            "great_weapon_fighting" => gwf = true,
            other => return Err(format!("weapon rider {other:?} is not implemented")),
        }
    }
    let ability = match (pc, a.ability.as_deref()) {
        (false, None) => AtkAbility::Fixed,
        (true, Some("str")) => AtkAbility::Str,
        (true, Some("finesse")) => AtkAbility::Finesse,
        (_, other) => return Err(format!("attack ability {other:?} is not implemented")),
    };
    let ability_mod = match ability {
        AtkAbility::Finesse => str_mod.max(dex_mod),
        _ => str_mod,
    };
    let mut graze = None;
    let mut sap = false;
    let mut cleave = false;
    for m in &a.masteries {
        match m.as_str() {
            "graze" => graze = Some(ability_mod),
            "sap" => sap = true,
            "cleave" => cleave = true,
            other => return Err(format!("weapon mastery {other:?} is not implemented")),
        }
    }
    let mut additional = Vec::new();
    let mut additional_adv = Vec::new();
    for x in &a.additional {
        let r = (Dice::parse(&x.damage)?, dmg(&x.damage_type)?);
        match x.condition.as_deref() {
            None if additional_adv.is_empty() => additional.push(r),
            None => return Err("an unconditional rider after a conditional one is not implemented".into()),
            Some("advantage") => additional_adv.push(r),
            Some(c) => return Err(format!("additional_damage condition {c:?} is not implemented")),
        }
    }
    let versatile = a.versatile.as_deref().map(Dice::parse).transpose()?;
    let mut item = None;
    let mut npc_item = None;
    if pc {
        // Hero weapons: the engine recomputes to-hit and damage from the
        // current Strength (Strength drain lowers them) and the hands in use
        // (versatile); they must equal natural20's numbers at the start.
        if a.proficient != Some(true) || !melee_type || save_attack.is_some() {
            return Err("only proficient melee weapons (thrown or not) are implemented for heroes".into());
        }
        if !a.on_hit.is_empty() || !a.additional.is_empty() || a.multiattack_group.is_some() {
            return Err("hero weapon riders are not implemented".into());
        }
        if to_hit != ability_mod + pb || damage.modifier != ability_mod {
            return Err(format!("to-hit {to_hit:+} / damage {} differ from {ability:?} {ability_mod:+} + PB {pb}", a.damage));
        }
        if let Some(v) = versatile {
            if v.modifier != 0 || (hands <= 1.0 && (v.count, v.sides) != (damage.count, damage.sides)) {
                return Err(format!("versatile {v:?} with {hands} hands in use but damage {}", a.damage));
            }
        }
        item = match &a.item {
            Some(name) => Some(gear.iter().position(|g| g.0 == name).ok_or_else(|| format!("item {name} is not equipped"))? as u8),
            None => None,
        };
        if a.thrown && item.is_none() {
            return Err("a thrown attack without its item".into());
        }
    } else if a.ability.is_some() || !a.masteries.is_empty() || !a.riders.is_empty() || versatile.is_some() {
        return Err("NPC attacks use fixed numbers".into());
    } else {
        // `item:` (an inventory item the attack is made with) and `thrown:`
        // (a thrown row of a melee attack made with such an item)
        npc_item = match &a.item {
            Some(name) => Some(inventory.iter().position(|g| g.0 == name).ok_or_else(|| format!("item {name} is not in the inventory"))? as u8),
            None => None,
        };
        if a.thrown && (npc_item.is_none() || !melee_type || save_attack.is_some()) {
            return Err("an NPC thrown attack is a melee attack made with an inventory item".into());
        }
    }
    Ok(AttackDef {
        name: intern(&a.name),
        ranged,
        melee_type,
        thrown: a.thrown,
        range: a.range,
        range_max: a.range_max,
        to_hit,
        damage,
        damage_type,
        additional,
        additional_adv,
        on_hit,
        save_attack,
        save_immune,
        kill_at_zero: a.kill_at_zero,
        no_damage: a.no_damage,
        multiattack_group: a.multiattack_group,
        savage,
        gwf,
        graze,
        sap,
        cleave,
        ability,
        versatile,
        item,
        npc_item,
    })
}

fn caster(sc: &SpellcastingDoc, t: &Template, metamagic: Vec<Mm>) -> Result<CasterSpec, String> {
    let ab = ability(&sc.ability)?;
    if sc.attack != t.prof_bonus + ability_mod(t.abil[ab.idx()]) || sc.dc != 8 + sc.attack {
        return Err(format!("attack {:+} / DC {} do not follow {} and PB", sc.attack, sc.dc, sc.ability));
    }
    if sc.slots.len() > 3 || sc.slots.iter().skip(3).any(|&n| n > 0) {
        return Err(format!("slots {:?}: only spell levels 1 and 2 are implemented", sc.slots));
    }
    let mut slots = [0; 3];
    for lvl in 1..sc.slots.len().min(3) {
        slots[lvl] = sc.slots[lvl];
    }
    let spells = sc.spells.iter().map(|s| spell(s)).collect::<Result<Vec<_>, _>>()?;
    let reaction_spells = sc.reaction_spells.iter().map(|s| spell(s)).collect::<Result<Vec<_>, _>>()?;
    if reaction_spells.iter().any(|&s| s != SpellId::Shield) || spells.contains(&SpellId::Shield) {
        return Err("Shield is the only reaction spell implemented".into());
    }
    // the engine's spell constants must agree with natural20's spell data
    for info in &sc.spell_info {
        let s = spell(&info.id)?;
        let bonus = match info.casting_time.as_str() {
            "1:action" => false,
            "1:bonus_action" => true,
            "1:reaction" => s == SpellId::Shield,
            other => return Err(format!("{}: casting time {other:?}", info.id)),
        };
        if s.level() != info.level || (s != SpellId::Shield && s.bonus_action() != bonus) || s.concentration() != info.concentration {
            return Err(format!("{}: level / casting time / concentration differ from the engine's", info.id));
        }
    }
    let mut free_casts = Vec::new();
    let mut free_cast_pools = Vec::new();
    for f in &sc.free_casts {
        if f.uses != 1 {
            return Err(format!("free cast pool {} with {} uses", f.pool, f.uses));
        }
        free_casts.push(spell(&f.spell)?);
        free_cast_pools.push(intern(&f.pool));
    }
    for k in sc.resources.keys() {
        if !matches!(k.as_str(), "channel_divinity" | "holy_water" | "sorcery_points" | "innate_sorcery") {
            return Err(format!("resource {k:?} is not implemented"));
        }
    }
    let res = |k: &str| sc.resources.get(k).copied().unwrap_or(0);
    if t.channel_divinity != sc.resources.contains_key("channel_divinity")
        || t.innate_sorcery != sc.resources.contains_key("innate_sorcery")
    {
        return Err("resources and features disagree".into());
    }
    Ok(CasterSpec {
        ability: ab,
        spell_attack: sc.attack,
        dc: sc.dc,
        level: sc.level,
        slots,
        spells,
        reaction_spells,
        channel_divinity: res("channel_divinity"),
        free_casts,
        free_cast_pools,
        holy_water: res("holy_water"),
        sorcery_points: res("sorcery_points"),
        innate_sorcery: res("innate_sorcery"),
        metamagic,
    })
}

// ----------------------------------------------------------------------------
// Vocabularies (content/vocab.json, GENERAL_ENV.md §5.6)
// ----------------------------------------------------------------------------

#[derive(Deserialize, Debug, Clone, Default)]
#[serde(deny_unknown_fields)]
pub struct Vocab {
    pub schema: i32,
    /// Inclusive id range of this file (public 0-199, private 200-255).
    pub range: [u16; 2],
    pub sections: BTreeMap<String, BTreeMap<String, u16>>,
}

impl Vocab {
    pub fn id(&self, section: &str, name: &str) -> Option<u16> {
        self.sections.get(section)?.get(name).copied()
    }

    /// Ids within the range and unique per section.
    pub fn check(&self) -> Result<(), String> {
        for (s, table) in &self.sections {
            let mut seen = HashSet::new();
            for (n, &id) in table {
                if id < self.range[0] || id > self.range[1] {
                    return Err(format!("vocab {s}.{n} = {id} outside {:?}", self.range));
                }
                if !seen.insert(id) {
                    return Err(format!("vocab {s}: id {id} used twice"));
                }
            }
        }
        Ok(())
    }

    /// Merge a pack's vocabulary (disjoint ranges, no name in both).
    fn merge(&mut self, other: &Vocab) -> Result<(), String> {
        other.check()?;
        for (s, table) in &other.sections {
            let mine = self.sections.entry(s.clone()).or_default();
            let used: HashSet<u16> = mine.values().copied().collect();
            for (n, &id) in table {
                if let Some(&old) = mine.get(n) {
                    if old != id {
                        return Err(format!("vocab {s}.{n}: {old} and {id}"));
                    }
                    continue;
                }
                if used.contains(&id) {
                    return Err(format!("vocab {s}: id {id} used by two packs"));
                }
                mine.insert(n.clone(), id);
            }
        }
        Ok(())
    }
}

// ----------------------------------------------------------------------------
// The pool
// ----------------------------------------------------------------------------

mod embedded {
    include!(concat!(env!("OUT_DIR"), "/content_files.rs"));
}

/// The public pack's files compiled into the binary: (path under
/// `content/`, text).
pub fn embedded_files() -> &'static [(&'static str, &'static str)] {
    embedded::FILES
}

/// Every creature the engine can play, by content id.
#[derive(Debug)]
pub struct ContentPool {
    pub templates: Vec<Template>,
    pub docs: Vec<ContentDoc>,
    pub vocab: Vocab,
    by_id: HashMap<&'static str, u16>,
    /// Vocabulary ids by template, attack, spell and action kind for the
    /// observation encoder (`encode.rs`), built on first use.
    pub(crate) enc_ids: OnceLock<crate::encode::EncIds>,
}

impl ContentPool {
    /// Build a pool from `(origin, json)` documents and vocabularies.
    pub fn from_sources(docs: &[(String, String)], vocabs: &[(String, String)]) -> Result<ContentPool, String> {
        let mut vocab = Vocab::default();
        for (origin, text) in vocabs {
            let v: Vocab = serde_json::from_str(text).map_err(|e| format!("{origin}: {e}"))?;
            if vocab.sections.is_empty() && vocab.schema == 0 {
                v.check().map_err(|e| format!("{origin}: {e}"))?;
                vocab = v;
            } else {
                vocab.merge(&v).map_err(|e| format!("{origin}: {e}"))?;
            }
        }
        let mut pool =
            ContentPool { templates: Vec::new(), docs: Vec::new(), vocab, by_id: HashMap::new(), enc_ids: OnceLock::new() };
        for (origin, text) in docs {
            let doc: ContentDoc = serde_json::from_str(text).map_err(|e| format!("{origin}: {e}"))?;
            let stem = Path::new(origin).file_stem().and_then(|s| s.to_str()).unwrap_or("");
            if stem != doc.id {
                return Err(format!("{origin}: file name and id {:?} differ", doc.id));
            }
            let t = Template::from_doc(&doc).map_err(|e| format!("{origin}: {e}"))?;
            pool.check_vocab(&doc).map_err(|e| format!("{origin}: {e}"))?;
            if pool.by_id.contains_key(t.id) {
                return Err(format!("{origin}: content id {:?} defined twice", t.id));
            }
            if pool.templates.len() >= u16::MAX as usize {
                return Err("too many content ids".into());
            }
            pool.by_id.insert(t.id, pool.templates.len() as u16);
            pool.templates.push(t);
            pool.docs.push(doc);
        }
        Ok(pool)
    }

    /// Every name a creature brings has a vocabulary id.
    fn check_vocab(&self, d: &ContentDoc) -> Result<(), String> {
        let need = |section: &str, name: &str| -> Result<(), String> {
            self.vocab.id(section, name).map(|_| ()).ok_or_else(|| format!("no vocab id for {section}.{name}"))
        };
        let base = d.base_id.as_deref().unwrap_or(&d.id);
        need("creatures", base)?;
        if d.pc {
            // the character embedding (GENERAL_ENV.md §5.1 `creature_ids`)
            need("characters", base)?;
        }
        for k in d.classes.keys() {
            need("classes", k)?;
        }
        for a in &d.attacks {
            need("attacks", &a.name)?;
            for oh in &a.on_hit {
                need("mechanics", &oh.id)?;
            }
            for r in &a.riders {
                need("mechanics", r)?;
            }
            for m in &a.masteries {
                need("mechanics", &format!("mastery:{m}"))?;
            }
            if a.thrown {
                need("mechanics", "weapon:thrown")?;
            }
            for x in &a.additional {
                if let Some(c) = &x.condition {
                    need("mechanics", &format!("rider_condition:{c}"))?;
                }
            }
        }
        for r in d.reactions.iter().flatten() {
            need("mechanics", &format!("reaction:{}", r.id))?;
            // `swap_retarget` is the only reaction type; its decision row
            // is the `redirect_attack` action kind
            need("action_kinds", "redirect_attack")?;
        }
        for f in d.features.iter().chain(d.traits.iter()) {
            need("mechanics", &f.id)?;
        }
        if let Some(sc) = &d.spellcasting {
            for s in sc.spells.iter().chain(sc.reaction_spells.iter()) {
                need("spells", s)?;
            }
        }
        Ok(())
    }

    /// Load every `*.json` content file of the given pack directories (each
    /// may hold a `vocab.json`), after the embedded public pack.
    pub fn load(dirs: &[PathBuf]) -> Result<ContentPool, String> {
        let mut docs: Vec<(String, String)> = Vec::new();
        let mut vocabs: Vec<(String, String)> = Vec::new();
        for (path, text) in embedded_files() {
            if *path == "vocab.json" {
                vocabs.push((format!("content/{path}"), text.to_string()));
            } else if path.ends_with(".json") && !path.starts_with("maps/") {
                docs.push((format!("content/{path}"), text.to_string()));
            }
        }
        for dir in dirs {
            let mut files: Vec<PathBuf> = std::fs::read_dir(dir)
                .map_err(|e| format!("{}: {e}", dir.display()))?
                .filter_map(|e| e.ok().map(|e| e.path()))
                .filter(|p| p.extension().map_or(false, |x| x == "json"))
                .collect();
            files.sort();
            for f in files {
                let text = std::fs::read_to_string(&f).map_err(|e| format!("{}: {e}", f.display()))?;
                if f.file_name().map_or(false, |n| n == "vocab.json") {
                    vocabs.push((f.display().to_string(), text));
                } else {
                    docs.push((f.display().to_string(), text));
                }
            }
        }
        ContentPool::from_sources(&docs, &vocabs)
    }

    /// The process-wide pool: the embedded public pack plus the packs in
    /// `EMBER_CONTENT_PATH`. Panics on a load error (fail closed).
    pub fn global() -> &'static ContentPool {
        static POOL: OnceLock<ContentPool> = OnceLock::new();
        POOL.get_or_init(|| {
            let dirs: Vec<PathBuf> = std::env::var("EMBER_CONTENT_PATH")
                .map(|v| v.split(':').filter(|s| !s.is_empty()).map(PathBuf::from).collect())
                .unwrap_or_default();
            ContentPool::load(&dirs).unwrap_or_else(|e| panic!("content pool: {e}"))
        })
    }

    /// Keep a pool for the rest of the process (units refer to its templates).
    pub fn leak(self) -> &'static ContentPool {
        Box::leak(Box::new(self))
    }

    pub fn tid(&self, content: &str) -> Option<u16> {
        if let Some(&id) = self.by_id.get(content) {
            return Some(id);
        }
        let (base, suffix) = content.rsplit_once("_l")?;
        let id = *self.by_id.get(base)?;
        let t = self.template(id);
        (t.pc && suffix == t.level.to_string()).then_some(id)
    }

    pub fn template(&self, tid: u16) -> &Template {
        &self.templates[tid as usize]
    }

    /// The content id of a unit id: a hero's unit id is its content id,
    /// a monster's is `<content>-<n>` (`scenarios/general/content.py`
    /// `monster_content`).
    pub fn unit_tid(&self, uid: &str) -> Option<u16> {
        if let Some(t) = self.tid(uid) {
            if self.templates[t as usize].pc {
                return Some(t);
            }
        }
        let (content, n) = uid.rsplit_once('-')?;
        let ok = !n.is_empty() && n.bytes().all(|b| b.is_ascii_digit()) && !n.starts_with('0');
        let t = self.tid(content).filter(|_| ok)?;
        if self.templates[t as usize].pc {
            return None;
        }
        Some(t)
    }

    /// Compare a unit's template with the tape header's `stats` row
    /// (natural20's derived numbers when the tape was recorded).
    pub fn check_stats(&self, uid: &str, stats: &serde_json::Value) -> Result<(), String> {
        let tid = self.unit_tid(uid).ok_or_else(|| format!("{uid}: no content"))?;
        let t = self.template(tid);
        let s = stats.as_object().ok_or_else(|| format!("{uid}: stats is not an object"))?;
        let int = |k: &str| s.get(k).and_then(|v| v.as_i64()).map(|v| v as i32);
        let mut diffs = Vec::new();
        let mut cmp = |what: &str, ours: String, theirs: String| {
            if ours != theirs {
                diffs.push(format!("{what} {ours} != tape {theirs}"));
            }
        };
        let want_name = if t.pc { t.name } else { uid };
        cmp("name", want_name.to_string(), s.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string());
        cmp("ac", t.ac.to_string(), format!("{:?}", int("ac").unwrap_or(-99)));
        cmp("hp", t.max_hp.to_string(), format!("{:?}", int("hp").unwrap_or(-99)));
        cmp("mhp", t.max_hp.to_string(), format!("{:?}", int("mhp").unwrap_or(-99)));
        cmp("speed", t.speed.to_string(), format!("{:?}", int("speed").unwrap_or(-99)));
        cmp("size", t.size.to_string(), s.get("size").and_then(|v| v.as_str()).unwrap_or("").to_string());
        cmp("init_bonus", t.init_bonus.to_string(), format!("{:?}", int("init_bonus").unwrap_or(-99)));
        cmp("npc", (!t.pc).to_string(), s.get("npc").and_then(|v| v.as_bool()).unwrap_or(t.pc).to_string());
        for a in Ability::ALL {
            let v = s.get("abil").and_then(|x| x.get(a.short())).and_then(|v| v.as_i64()).unwrap_or(-99);
            cmp(a.short(), t.abil[a.idx()].to_string(), v.to_string());
        }
        if !t.pc {
            let actions = s.get("actions").and_then(|v| v.as_array()).cloned().unwrap_or_default();
            let names: Vec<&str> = actions.iter().filter_map(|a| a.get("name").and_then(|v| v.as_str())).collect();
            // one YAML action per row; a thrown row is part of its melee row's action
            let rows = t.yaml_rows();
            let ours: Vec<&str> = rows.iter().map(|&(i, _)| t.attacks[i].name).collect();
            cmp("actions", format!("{ours:?}"), format!("{names:?}"));
            for (a, &(i, thrown)) in actions.iter().zip(rows.iter()) {
                let def = &t.attacks[i];
                if let Err(e) = check_action(t, def, thrown.map(|j| &t.attacks[j]), a) {
                    diffs.push(format!("{}: {e}", def.name));
                }
            }
        }
        if diffs.is_empty() {
            Ok(())
        } else {
            Err(format!("{uid}: {}", diffs.join("; ")))
        }
    }
}

impl Dice {
    /// The damage string natural20 exports (`NdS`, `NdS+M`, `NdS-M`, `N+M`);
    /// [`Dice::parse`] reads it back.
    pub fn text(self) -> String {
        if self.sides == 0 {
            return format!("{}{:+}", self.count, self.modifier);
        }
        match self.modifier {
            0 => format!("{}d{}", self.count, self.sides),
            m => format!("{}d{}{:+}", self.count, self.sides, m),
        }
    }
}

impl ContentPool {
    /// A tape header's `stats` row for unit `uid`, from the content (what
    /// natural20's recorder derives, in the fields [`ContentPool::check_stats`]
    /// compares). Tapes written by the Rust environment (`ember_rs.BatchEnv.record`)
    /// carry these.
    pub fn stats_row(&self, uid: &str) -> Result<serde_json::Value, String> {
        use serde_json::json;
        let tid = self.unit_tid(uid).ok_or_else(|| format!("{uid}: no content"))?;
        let t = self.template(tid);
        let abil: serde_json::Map<String, serde_json::Value> =
            Ability::ALL.iter().map(|a| (a.short().to_string(), json!(t.abil[a.idx()]))).collect();
        let mut row = json!({
            "name": if t.pc { t.name } else { uid }, "ac": t.ac, "hp": t.max_hp, "mhp": t.max_hp,
            "speed": t.speed, "size": t.size, "abil": abil, "init_bonus": t.init_bonus, "npc": !t.pc,
        });
        if !t.pc {
            let actions: Vec<serde_json::Value> = t
                .yaml_rows()
                .into_iter()
                .map(|(i, thrown)| {
                    let a = &t.attacks[i];
                    let mut x = json!({
                        "name": a.name,
                        "type": if a.ranged { "ranged_attack" } else { "melee_attack" },
                        "range": a.range, "range_max": a.range_max,
                    });
                    if a.no_damage {
                        x["no_damage"] = json!(true);
                    } else {
                        x["damage_die"] = json!(a.damage.text());
                        x["damage_type"] = json!(a.damage_type.name());
                    }
                    if a.kill_at_zero {
                        x["kill_at_zero"] = json!(true);
                    }
                    match a.save_attack {
                        Some((ab, dc)) if a.save_immune => {
                            x["save_attack"] = json!({"save": ab.save_name(), "dc": dc, "immune_on_success": true})
                        }
                        Some((ab, dc)) => x["save_attack"] = json!({"save": ab.save_name(), "dc": dc}),
                        None => x["attack"] = json!(a.to_hit),
                    }
                    if !a.additional.is_empty() || !a.additional_adv.is_empty() {
                        let plain = a.additional.iter().map(|(d, ty)| json!({"damage_die": d.text(), "damage_type": ty.name()}));
                        let adv = a.additional_adv.iter().map(|(d, ty)| {
                            json!({"damage_die": d.text(), "damage_type": ty.name(), "condition": "advantage"})
                        });
                        x["additional_damage"] = plain.chain(adv).collect();
                    }
                    if let Some(k) = a.npc_item {
                        x["item"] = json!(t.inventory[k as usize].0);
                    }
                    if let Some(j) = thrown {
                        let th = &t.attacks[j];
                        x["thrown"] = json!({"range": th.range, "range_max": th.range_max});
                    }
                    if let Some(g) = a.multiattack_group {
                        x["multiattack_group"] = json!(g);
                    }
                    if !a.on_hit.is_empty() {
                        x["on_hit"] = a
                            .on_hit
                            .iter()
                            .map(|o| {
                                json!({"fail": o.fail()})
                            })
                            .collect();
                    }
                    x
                })
                .collect();
            row["actions"] = json!(actions);
        }
        self.check_stats(uid, &row).map_err(|e| format!("stats_row disagrees with check_stats: {e}"))?;
        Ok(row)
    }
}

impl Template {
    /// The rows that are YAML actions (an NPC's thrown row belongs to the
    /// melee row before it): (attack index, its thrown row).
    pub fn yaml_rows(&self) -> Vec<(usize, Option<usize>)> {
        let mut out = Vec::new();
        for (i, a) in self.attacks.iter().enumerate() {
            if a.thrown && !self.pc {
                continue;
            }
            let thrown = (i + 1 < self.attacks.len() && self.attacks[i + 1].thrown && !self.pc).then_some(i + 1);
            out.push((i, thrown));
        }
        out
    }
}

/// One NPC attack (and its thrown row) against the YAML action natural20 put
/// in the tape header.
fn check_action(t: &Template, def: &AttackDef, thrown: Option<&AttackDef>, a: &serde_json::Value) -> Result<(), String> {
    let get = |k: &str| a.get(k);
    let int = |k: &str| get(k).and_then(|v| v.as_i64()).map(|v| v as i32);
    let ty = get("type").and_then(|v| v.as_str()).unwrap_or("");
    if ty != if def.ranged { "ranged_attack" } else { "melee_attack" } {
        return Err(format!("type {ty}"));
    }
    if int("range") != Some(def.range) || int("range_max").unwrap_or(def.range) != def.range_max {
        return Err(format!("range {:?}/{:?}", int("range"), int("range_max")));
    }
    let flag = |k: &str| get(k).and_then(|v| v.as_bool()).unwrap_or(false);
    if flag("no_damage") != def.no_damage || flag("kill_at_zero") != def.kill_at_zero {
        return Err("no_damage / kill_at_zero".into());
    }
    if def.no_damage {
        if get("damage_die").is_some() || get("damage_type").is_some() {
            return Err("damage on a no_damage action".into());
        }
    } else {
        let die = get("damage_die").and_then(|v| v.as_str()).ok_or("no damage_die")?;
        let mut tape = Dice::parse(die)?;
        if tape.sides > 0 && tape.modifier == 0 {
            // `npc_damage_die` adds a YAML `damage_mod` to a die without one
            tape.modifier = int("damage_mod").unwrap_or(0);
        }
        if tape != def.damage || get("damage_type").and_then(|v| v.as_str()) != Some(def.damage_type.name()) {
            return Err(format!("damage {die} {:?}", get("damage_type")));
        }
    }
    match (&def.save_attack, get("save_attack")) {
        (Some((ab, dc)), Some(sa)) => {
            if sa.get("save").and_then(|v| v.as_str()) != Some(ab.save_name()) || sa.get("dc").and_then(|v| v.as_i64()) != Some(*dc as i64) {
                return Err("save_attack".into());
            }
            if sa.get("immune_on_success").and_then(|v| v.as_bool()).unwrap_or(false) != def.save_immune {
                return Err("save_attack immune_on_success".into());
            }
        }
        (None, None) => {
            if int("attack") != Some(def.to_hit) {
                return Err(format!("attack {:?}", int("attack")));
            }
        }
        _ => return Err("save_attack".into()),
    }
    let extra: Vec<(Dice, Option<&str>, Option<&str>)> = get("additional_damage")
        .and_then(|v| v.as_array())
        .map(|l| {
            l.iter()
                .map(|x| {
                    (
                        Dice::parse(x.get("damage_die").and_then(|v| v.as_str()).unwrap_or("?")).unwrap_or(Dice::new(-1, 0, 0)),
                        x.get("damage_type").and_then(|v| v.as_str()),
                        x.get("condition").and_then(|v| v.as_str()),
                    )
                })
                .collect()
        })
        .unwrap_or_default();
    let ours: Vec<(Dice, Option<&str>, Option<&str>)> = def
        .additional
        .iter()
        .map(|(d, t)| (*d, Some(t.name()), None))
        .chain(def.additional_adv.iter().map(|(d, t)| (*d, Some(t.name()), Some("advantage"))))
        .collect();
    if extra != ours {
        return Err("additional_damage".into());
    }
    let item = get("item").and_then(|v| v.as_str());
    if item != def.npc_item.map(|k| t.inventory[k as usize].0) {
        return Err(format!("item {item:?}"));
    }
    match (get("thrown"), thrown) {
        (None, None) => {}
        (Some(th), Some(row)) => {
            let r = th.get("range").and_then(|v| v.as_i64()).map(|v| v as i32);
            let rm = th.get("range_max").and_then(|v| v.as_i64()).map(|v| v as i32).or(r);
            if r != Some(row.range) || rm != Some(row.range_max) {
                return Err(format!("thrown {th}"));
            }
        }
        (x, _) => return Err(format!("thrown {x:?}")),
    }
    if int("multiattack_group") != def.multiattack_group {
        return Err("multiattack_group".into());
    }
    let fails: Vec<&str> = get("on_hit")
        .and_then(|v| v.as_array())
        .map(|l| l.iter().filter_map(|x| x.get("fail").and_then(|v| v.as_str())).collect())
        .unwrap_or_default();
    let ours: Vec<&str> = def.on_hit.iter().map(|o| o.fail()).collect();
    if fails != ours {
        return Err(format!("on_hit {fails:?}"));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn dice_parse() {
        assert_eq!(Dice::parse("2d6+3").unwrap(), Dice::new(2, 6, 3));
        assert_eq!(Dice::parse("1d8").unwrap(), Dice::new(1, 8, 0));
        assert_eq!(Dice::parse("1+3").unwrap(), Dice::new(1, 0, 3));
        assert_eq!(Dice::parse("1+0").unwrap(), Dice::new(1, 0, 0));
        assert_eq!(Dice::parse("1d10-1").unwrap(), Dice::new(1, 10, -1));
        assert!(Dice::parse("d").is_err());
    }

    #[test]
    fn stats_rows_pass_check_stats() {
        let pool = ContentPool::global();
        for t in &pool.templates {
            let uid = if t.pc { t.id.to_string() } else { format!("{}-3", t.id) };
            pool.stats_row(&uid).unwrap();
        }
        for (d, s) in [(Dice::new(1, 8, 1), "1d8+1"), (Dice::new(2, 6, 0), "2d6"), (Dice::new(1, 10, -1), "1d10-1"),
                       (Dice::new(1, 0, 3), "1+3"), (Dice::new(1, 0, -1), "1-1"), (Dice::new(1, 0, 0), "1+0")] {
            assert_eq!(d.text(), s);
            assert_eq!(Dice::parse(s).unwrap(), d);
        }
    }

    #[test]
    fn global_pool_loads() {
        let pool = ContentPool::global();
        assert_eq!(pool.templates.iter().filter(|t| t.pc).count(), 18);
        assert_eq!(pool.tid("guy_l3"), pool.tid("guy"));
        assert_eq!(pool.tid("ilyra_l2"), pool.tid("ilyra"));
        for id in [
            "guy", "elion", "curogana", "mara", "ilyra", "skeleton", "zombie", "ghoul", "ghast", "specter", "shadow", "wight",
            "goblin_minion", "goblin_warrior", "goblin_boss", "mummy", "chruna",
        ] {
            assert!(pool.tid(id).is_some(), "{id}");
        }
        assert_eq!(pool.unit_tid("skeleton-10"), pool.tid("skeleton"));
        assert_eq!(pool.unit_tid("guy"), pool.tid("guy"));
        assert_eq!(pool.unit_tid("skeleton"), None);
        assert_eq!(pool.unit_tid("guy-1"), None);
        assert_eq!(pool.unit_tid("skeleton-01"), None);
    }

    #[test]
    fn unknown_mechanics_fail_closed() {
        let (_, text) = embedded_files().iter().find(|(p, _)| *p == "srd/zombie.json").unwrap();
        let (_, vocab) = embedded_files().iter().find(|(p, _)| *p == "vocab.json").unwrap();
        let v = vec![("vocab.json".to_string(), vocab.to_string())];
        let ok = ContentPool::from_sources(&[("srd/zombie.json".into(), text.to_string())], &v);
        assert!(ok.is_ok(), "{:?}", ok.err());
        for (from, to) in [
            ("\"id\": \"undead_fortitude\"", "\"id\": \"regeneration\""),
            ("\"type\": \"melee_attack\"", "\"type\": \"area_save\""),
            ("\"poison\"", "\"psychic_x\""),
        ] {
            let bad = text.replacen(from, to, 1);
            assert_ne!(&bad, text, "pattern {from} not found");
            let r = ContentPool::from_sources(&[("srd/zombie.json".into(), bad)], &v);
            assert!(r.is_err(), "{from} -> {to} loaded");
        }
    }
}
