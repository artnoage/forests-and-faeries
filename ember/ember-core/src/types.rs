//! Core value types, IDs, bitflags, errors, and deterministic state digests.

use std::collections::BTreeMap;
use std::fmt;

use bitflags::bitflags;
use serde::{Deserialize, Serialize};

/// Dense index of a combatant in a fight (`0..24`).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct UnitId(pub u8);

impl UnitId {
    #[inline]
    pub const fn idx(self) -> usize {
        self.0 as usize
    }
}

/// Dense index of a creature template in [`crate::step::ContentDb`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct TemplateId(pub u16);

/// Dense index of a compiled ability in [`crate::step::ContentDb`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct AbilityId(pub u16);

/// Dense index of a compiled effect definition in [`crate::step::ContentDb`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct EffectDefId(pub u16);

/// Combat side (`0` = heroes, `1` = monsters).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Team {
    Heroes = 0,
    Monsters = 1,
}

impl Team {
    #[inline]
    pub const fn idx(self) -> usize {
        self as usize
    }

    #[inline]
    pub const fn name(self) -> &'static str {
        match self {
            Team::Heroes => "heroes",
            Team::Monsters => "monsters",
        }
    }

    #[inline]
    pub const fn opposing(self) -> Team {
        match self {
            Team::Heroes => Team::Monsters,
            Team::Monsters => Team::Heroes,
        }
    }
}

/// Square coordinate on a battle grid (`0..32`).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Pos {
    pub x: i16,
    pub y: i16,
}

impl Pos {
    #[inline]
    pub const fn new(x: i16, y: i16) -> Self {
        Self { x, y }
    }

    /// SRD 5.2.1 square-grid Chebyshev distance in squares.
    #[inline]
    pub const fn chebyshev(self, other: Pos) -> i32 {
        let dx = (self.x as i32 - other.x as i32).abs();
        let dy = (self.y as i32 - other.y as i32).abs();
        if dx >= dy { dx } else { dy }
    }

    /// Distance in feet (`chebyshev * 5`).
    #[inline]
    pub const fn feet_to(self, other: Pos) -> i32 {
        self.chebyshev(other) * 5
    }
}

/// Six SRD abilities.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum Ability {
    Str = 0,
    Dex = 1,
    Con = 2,
    Int = 3,
    Wis = 4,
    Cha = 5,
}

impl Ability {
    pub const ALL: [Ability; 6] = [
        Ability::Str,
        Ability::Dex,
        Ability::Con,
        Ability::Int,
        Ability::Wis,
        Ability::Cha,
    ];

    #[inline]
    pub const fn idx(self) -> usize {
        self as usize
    }

    pub const fn short(self) -> &'static str {
        match self {
            Ability::Str => "str",
            Ability::Dex => "dex",
            Ability::Con => "con",
            Ability::Int => "int",
            Ability::Wis => "wis",
            Ability::Cha => "cha",
        }
    }

    pub fn from_short(s: &str) -> Option<Ability> {
        match s {
            "str" => Some(Ability::Str),
            "dex" => Some(Ability::Dex),
            "con" => Some(Ability::Con),
            "int" => Some(Ability::Int),
            "wis" => Some(Ability::Wis),
            "cha" => Some(Ability::Cha),
            _ => None,
        }
    }

    pub const fn save_tag(self) -> &'static str {
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

/// SRD ability modifier `floor((score - 10) / 2)` (clamped to -5 at <= 1).
#[inline]
pub const fn ability_mod(score: i32) -> i32 {
    if score <= 1 {
        -5
    } else {
        (score - 10).div_euclid(2)
    }
}

/// Thirteen SRD damage types.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum Dmg {
    Acid = 0,
    Bludgeoning = 1,
    Cold = 2,
    Fire = 3,
    Force = 4,
    Lightning = 5,
    Necrotic = 6,
    Piercing = 7,
    Poison = 8,
    Psychic = 9,
    Radiant = 10,
    Slashing = 11,
    Thunder = 12,
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
    pub const fn bit(self) -> u16 {
        1u16 << (self as u16)
    }

    pub const fn name(self) -> &'static str {
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

    pub fn from_name(s: &str) -> Option<Dmg> {
        Dmg::ALL.iter().copied().find(|d| d.name() == s)
    }
}

/// Compact bitset over [`Dmg`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct DmgMask(pub u16);

impl DmgMask {
    #[inline]
    pub const fn empty() -> Self {
        Self(0)
    }

    #[inline]
    pub const fn contains(self, d: Dmg) -> bool {
        (self.0 & d.bit()) != 0
    }

    #[inline]
    pub fn insert(&mut self, d: Dmg) {
        self.0 |= d.bit();
    }
}

/// Dice expression `count`d`sides` + `modifier` (or fixed `count + modifier` when `sides == 0`).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Dice {
    pub count: i16,
    pub sides: i16,
    pub modifier: i16,
}

impl Dice {
    #[inline]
    pub const fn new(count: i16, sides: i16, modifier: i16) -> Self {
        Self { count, sides, modifier }
    }

    /// Parse `NdS`, `NdS+M`, `NdS-M`, `N`, `N+M`, `N-M`.
    pub fn parse(text: &str) -> Result<Dice, String> {
        let t = text.trim();
        if t.is_empty() {
            return Err("empty dice expression".into());
        }
        let (head, modifier) = match t[1..].find(['+', '-']).map(|i| i + 1) {
            Some(i) => {
                let m: i16 = t[i..]
                    .trim_start_matches('+')
                    .parse()
                    .map_err(|_| format!("invalid dice expression {text:?}"))?;
                (&t[..i], m)
            }
            None => (t, 0),
        };
        let bad = || format!("invalid dice expression {text:?}");
        match head.split_once('d') {
            Some((n, s)) => {
                let count: i16 = if n.is_empty() { 1 } else { n.parse().map_err(|_| bad())? };
                let sides: i16 = s.parse().map_err(|_| bad())?;
                if count < 0 || sides <= 0 {
                    return Err(bad());
                }
                Ok(Dice::new(count, sides, modifier))
            }
            None => {
                let count: i16 = head.parse().map_err(|_| bad())?;
                if count < 0 {
                    return Err(bad());
                }
                Ok(Dice::new(count, 0, modifier))
            }
        }
    }
}

/// Roll advantage/disadvantage state.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum RollMode {
    Normal,
    Advantage,
    Disadvantage,
}

impl RollMode {
    #[inline]
    pub const fn code(self) -> &'static str {
        match self {
            RollMode::Normal => "n",
            RollMode::Advantage => "a",
            RollMode::Disadvantage => "d",
        }
    }

    #[inline]
    pub const fn from_flags(adv: bool, dis: bool) -> RollMode {
        match (adv, dis) {
            (true, false) => RollMode::Advantage,
            (false, true) => RollMode::Disadvantage,
            _ => RollMode::Normal,
        }
    }

    pub fn from_code(s: &str) -> Option<RollMode> {
        match s {
            "n" => Some(RollMode::Normal),
            "a" => Some(RollMode::Advantage),
            "d" => Some(RollMode::Disadvantage),
            _ => None,
        }
    }
}

/// Size category rank (`0` = Tiny .. `5` = Gargantuan).
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum Size {
    Tiny = 0,
    Small = 1,
    Medium = 2,
    Large = 3,
    Huge = 4,
    Gargantuan = 5,
}

impl Size {
    pub fn from_name(s: &str) -> Option<Size> {
        match s {
            "tiny" => Some(Size::Tiny),
            "small" => Some(Size::Small),
            "medium" => Some(Size::Medium),
            "large" => Some(Size::Large),
            "huge" => Some(Size::Huge),
            "gargantuan" => Some(Size::Gargantuan),
            _ => None,
        }
    }

    pub const fn name(self) -> &'static str {
        match self {
            Size::Tiny => "tiny",
            Size::Small => "small",
            Size::Medium => "medium",
            Size::Large => "large",
            Size::Huge => "huge",
            Size::Gargantuan => "gargantuan",
        }
    }
}

bitflags! {
    /// Dirty-recomputed O(1) bitmask cached on every unit from its active effects
    /// and immutable creature traits.
    #[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash, Serialize, Deserialize)]
    pub struct UnitFlags: u64 {
        // Conditions (SRD 5.2.1)
        const PRONE          = 1 << 0;
        const UNCONSCIOUS    = 1 << 1;
        const DEAD           = 1 << 2;
        const STABLE         = 1 << 3;
        const PARALYZED      = 1 << 4;
        const INCAPACITATED  = 1 << 5;
        const FRIGHTENED     = 1 << 6;
        const HIDDEN         = 1 << 7;
        const POISONED       = 1 << 8;
        const CHARMED        = 1 << 9;
        const GRAPPLED       = 1 << 10;
        const RESTRAINED     = 1 << 11;
        const INVISIBLE      = 1 << 12;
        const DEAFENED       = 1 << 13;

        // Battle turn states
        const DODGING        = 1 << 16;
        const DISENGAGED     = 1 << 17;
        const SAPPED         = 1 << 18;
        const INNATE_SORCERY = 1 << 19;
        const BLESSED        = 1 << 20;
        const SHIELDED       = 1 << 21;
        const FAERIE_FIRE    = 1 << 22;
        const STARRY_WISP    = 1 << 23;
        const SEE_INVIS      = 1 << 24;
        const VICIOUS_MOCK   = 1 << 25;
        const CURSED         = 1 << 26;
        const RAGING         = 1 << 27;
        const RECKLESS       = 1 << 28;
        const BLURRED        = 1 << 29;
        const SANCTUARY      = 1 << 30;
    }
}

impl UnitFlags {
    #[inline]
    pub const fn is_dead(self) -> bool {
        self.contains(UnitFlags::DEAD)
    }

    #[inline]
    pub const fn is_unconscious(self) -> bool {
        !self.is_dead() && self.contains(UnitFlags::UNCONSCIOUS)
    }

    #[inline]
    pub const fn is_conscious(self) -> bool {
        !self.is_dead() && !self.is_unconscious()
    }

    #[inline]
    pub const fn is_incapacitated(self) -> bool {
        self.intersects(
            UnitFlags::DEAD
                .union(UnitFlags::UNCONSCIOUS)
                .union(UnitFlags::PARALYZED)
                .union(UnitFlags::INCAPACITATED),
        )
    }
}

/// First-class observer identity for [`crate::view::ObserverView`] and visibility queries.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Observer {
    /// Omniscient view (oracle, replay verification, finished fight).
    Full,
    /// Shared team perception (web client, Godot client, Track B AI).
    Team(Team),
    /// Individual creature perception (e.g. per-active-hero darkvision or See Invisibility).
    Unit(UnitId),
}

/// Output of the single visibility oracle [`crate::view::sense_of`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SenseState {
    Visible,
    HeardAt(Pos),
    Concealed,
}

/// Revision-bound action handle returned by `Fight::legal_actions`.
/// Submitting a stale or foreign `ActionId` fails with [`CoreError::StaleActionId`]
/// without mutating fight state or advancing the RNG.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ActionId {
    pub fight_id: u64,
    pub revision: u64,
    pub index: u16,
}

/// How reaction interrupts (Opportunity Attack, Shield, etc.) are handled.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ReactionMode {
    /// Reactions resolve automatically (lockstep parity mode through Phase 7).
    Auto,
    /// Reactions pause at [`FightPhase::AwaitingReaction`] for caller/UI input.
    Interactive,
}

/// Metamagic modifier attached to a spell cast.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum Metamagic {
    EmpoweredSpell,
    HeightenedSpell,
}

impl Metamagic {
    pub const fn key(self) -> &'static str {
        match self {
            Metamagic::EmpoweredSpell => "empowered_spell",
            Metamagic::HeightenedSpell => "heightened_spell",
        }
    }

    pub fn from_key(s: &str) -> Option<Self> {
        match s {
            "empowered_spell" => Some(Metamagic::EmpoweredSpell),
            "heightened_spell" => Some(Metamagic::HeightenedSpell),
            _ => None,
        }
    }

    pub const fn sorcery_cost(self) -> i8 {
        match self {
            Metamagic::EmpoweredSpell => 1,
            Metamagic::HeightenedSpell => 2,
        }
    }
}

/// How a creature pays to cast a granted spell (caster-side, never hardcoded on the spell).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SpellPayment {
    Slot,
    AtWill { cast_level: u8 },
    FreePerLongRest { uses: u8, cast_level: u8, pool_index: u8 },
}

/// High-level fight lifecycle phase.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum FightPhase {
    Setup,
    AwaitingAction(UnitId),
    AwaitingReaction {
        prompt_id: ActionId,
        reactor: UnitId,
    },
    Finished(FightOutcome),
}

/// Terminal outcome of a fight.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct FightOutcome {
    pub winner: Option<Team>,
    pub finished: bool,
    pub round: i32,
}

/// Result of `Fight::apply` or `Fight::respond_reaction`.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct StepOutcome {
    pub phase: FightPhase,
    pub revision: u64,
    pub draws_consumed: u64,
}

/// Unit placement in an [`EncounterSpec`].
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Placement {
    pub id: String,
    pub x: i16,
    pub y: i16,
}

/// Encounter setup input for [`crate::fight::Fight::new`].
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EncounterSpec {
    pub units: Vec<String>,
    pub placements: Vec<Placement>,
    pub map_rows: Option<Vec<String>>,
    pub max_rounds: i32,
}

/// Errors returned by `ember-core`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum CoreError {
    Setup(String),
    InvalidPhase(String),
    StaleActionId { expected_fight: u64, expected_rev: u64, got: ActionId },
    UnknownAction(String),
    InvalidReactionChoice(String),
    DrawMismatch {
        cursor: usize,
        expected: String,
        got: String,
    },
    Serialization(String),
}

impl fmt::Display for CoreError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CoreError::Setup(s) => write!(f, "setup error: {s}"),
            CoreError::InvalidPhase(s) => write!(f, "invalid phase: {s}"),
            CoreError::StaleActionId { expected_fight, expected_rev, got } => write!(
                f,
                "stale action id (fight={} rev={} idx={}; current fight={} rev={})",
                got.fight_id, got.revision, got.index, expected_fight, expected_rev
            ),
            CoreError::UnknownAction(s) => write!(f, "unknown action: {s}"),
            CoreError::InvalidReactionChoice(s) => write!(f, "invalid reaction choice: {s}"),
            CoreError::DrawMismatch { cursor, expected, got } => {
                write!(f, "draw mismatch at #{cursor}: expected {expected}, got {got}")
            }
            CoreError::Serialization(s) => write!(f, "serialization error: {s}"),
        }
    }
}

impl std::error::Error for CoreError {}

/// Canonical per-unit state digest matching the tape state format.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct UnitDigest {
    pub id: String,
    pub pos: Option<[i32; 2]>,
    pub hp: i32,
    pub mhp: i32,
    pub thp: i32,
    pub st: Vec<String>,
    pub fx: Vec<String>,
    pub bst: Vec<String>,
    pub res: [i32; 4],
    pub ds: [i32; 2],
    #[serde(rename = "str")]
    pub strength: i32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sl: Option<[i32; 2]>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub conc: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cd: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pools: Option<BTreeMap<String, i32>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sp: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub isc: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub isu: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sw: Option<i32>,
    #[serde(default, rename = "as", skip_serializing_if = "Option::is_none")]
    pub action_surge: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub asu: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rg: Option<[i32; 6]>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cv: Option<Vec<String>>,
}

/// Canonical fight state digest emitted after start, actions, and turn ends.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct StateDigest {
    pub round: i32,
    pub cur: Option<String>,
    pub units: Vec<UnitDigest>,
}
