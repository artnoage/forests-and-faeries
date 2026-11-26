//! The fight: natural20's `Battle` turn loop, actions and rules for the undead
//! scenario, driven the way `scenarios/undead_2024/arena.py` (`UndeadArena`)
//! drives natural20.
//!
//! Each function names the natural20 code it mirrors. Order of random draws
//! is part of the contract: every draw goes through `Trace::draw` with the
//! tag natural20's recorder assigns to the same call.

use std::sync::Arc;

use crate::web_events::{DeathSave, SaveOutcome};
use crate::content::{ability_mod, Ability, AdvCond, AtkAbility, AttackDef, Condition, ContentPool, Dice, Dmg, OnHit, SpellId, TargetCond, Template};
use crate::effects::{EffEntry, EffKey, EffObj, Hook, HookEv};
use crate::spells::Cast;
use crate::dice::plus_string_modifier;
use crate::map::{distance, within_melee, Bits, Grid, Pos};
use crate::tape::{Ev, Placement, StateDigest, UnitDigest};
use crate::trace::{RollMode, Trace};

pub const MAX_ROUNDS: i32 = 50;
pub const CURRENT_RULE_VERSION: i32 = 17;

/// natural20 `entity.statuses` entries used in the scenario.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum St {
    Prone,
    Unconscious,
    Dead,
    Stable,
    Paralyzed,
    Incapacitated,
    Frightened,
    /// Hidden (`do_hide`; `Unit::hidden_stealth` holds the Stealth total).
    Hidden,
    Poisoned,
    Charmed,
    Grappled,
    Restrained,
    Invisible,
}

impl St {
    pub fn name(self) -> &'static str {
        match self {
            St::Prone => "prone",
            St::Unconscious => "unconscious",
            St::Dead => "dead",
            St::Stable => "stable",
            St::Paralyzed => "paralyzed",
            St::Incapacitated => "incapacitated",
            St::Frightened => "frightened",
            St::Hidden => "hidden",
            St::Poisoned => "poisoned",
            St::Charmed => "charmed",
            St::Grappled => "grappled",
            St::Restrained => "restrained",
            St::Invisible => "invisible",
        }
    }
}

/// Source-linked Charmed entry (`monster_traits.apply_charm`).
#[derive(Clone, Debug)]
pub struct CharmEntry {
    pub source: usize,
    pub until: Option<i32>,
    pub save_type: Option<Ability>,
    pub dc: Option<i32>,
    pub repeat_save_when_harmed: bool,
    pub ends_on_harm_no_save: bool,
    pub expires_on_source_turn_start: bool,
    pub source_spell: Option<&'static str>,
}

/// `GenericController.battle_data[battle][entity]`: the native AI's memory.
#[derive(Clone, Debug, Default)]
pub struct Memory {
    pub initialized: bool,
    /// `known_enemy_positions` (insertion-ordered).
    pub known: Vec<(usize, Pos)>,
    /// `investigate_location`: square -> age (priority is always 1.0 here).
    pub investigate: Vec<(Pos, i32)>,
    /// `visited_location` (one bit per cell).
    pub visited: Bits,
    /// `recent_destinations` (at most 4).
    pub recent: Vec<Pos>,
}

#[derive(Clone, Debug)]
pub struct Unit {
    pub id: String,
    /// Index of the creature's template in the content pool.
    pub tid: u16,
    /// That template (the pool lives for the whole process).
    pub t: &'static Template,
    /// 0 = heroes (group `a`), 1 = monsters (group `b`).
    pub team: u8,
    pub pos: Pos,
    pub hp: i32,
    pub max_hp_reduction: i32,
    pub temp_hp: i32,
    pub statuses: Vec<St>,
    pub death_saves: i32,
    pub death_fails: i32,
    // battle.entities[e] state
    pub action: i32,
    pub bonus: i32,
    pub reaction: i32,
    pub movement: i32,
    pub dodge: bool,
    pub disengage: bool,
    pub action_surge_flag: bool,
    pub savage_turn: Option<(i32, usize)>,
    pub first_turn_taken: bool,
    pub initiative: f64,
    // fighter resources
    pub second_wind_count: i32,
    pub action_surge_count: i32,
    pub mem: Memory,
    /// `StrengthDrainEffect` running reduction (one effect per creature).
    pub str_drain: Option<i32>,
    /// Active `StenchPoison` effects (poisoned until the start of our next turn), by source.
    pub stench_poison: Vec<usize>,
    /// Ghasts whose Stench this creature is immune to (24 h, i.e. the whole fight).
    pub stench_immune: Vec<usize>,
    /// `TimedConditionEffect(paralyzed)` entries: their `skip_current_turn` flags.
    pub paralysis: Vec<bool>,
    /// Multiattack state (`battle.entities[e]['multiattack']`, `..._combos`, `..._started`).
    pub ma_groups: Vec<(i32, Vec<&'static str>)>,
    pub ma_combos: Vec<Vec<&'static str>>,
    pub ma_started: bool,
    // spellcasting heroes
    pub slots: [i32; 3],
    pub cd: i32,
    pub free_casts: Vec<SpellId>,
    pub holy_water: i32,
    pub sorcery_points: i32,
    pub innate_sorcery: i32,
    /// Battle turn on which this creature last expended a slot to cast a spell.
    pub last_slot_turn: Option<(i32, usize)>,
    pub concentration: Option<u32>,
    /// `entity.effects` (key order as inserted, as in the Python dict).
    pub effects: Vec<(EffKey, Vec<EffEntry>)>,
    pub hooks: Vec<Hook>,
    /// `casted_effects`: (target, effect, expiration).
    pub casted: Vec<(usize, u32, Option<i32>)>,
    /// `attributes['turned_by']`: (cleric, until, added_incapacitated).
    pub turned_by: Vec<(usize, i32, bool)>,
    /// `attributes['frightened_by']`: (source, until, ends_on_damage).
    pub frightened_by: Vec<(usize, i32, bool)>,
    /// `attributes['frightened_by']` entries that last until the end of the
    /// source's next turn (`fear.SourceTurnExpiry`, a mummy's Dreadful
    /// Glare): (source, skip_current_turn). No time limit; they end at that
    /// turn's end or when the source dies.
    pub source_fear: Vec<(usize, bool)>,
    /// `attributes['charmed_by']` (Sprite Enchanting Bow, Dryad Charm Monster, Harpy Luring Song).
    pub charmed_by: Vec<CharmEntry>,
    /// `entity.grapples` + `attributes['grapple_escape_dcs']`: (grappler, escape_dc).
    pub grappled_by: Vec<(usize, Option<i32>)>,
    /// `entity.grappling_targets()`: creatures this unit is currently grappling.
    pub grappling: Vec<usize>,
    /// `attributes['lured_by']`: (harpy, dc, added_incapacitated).
    pub lured_by: Option<(usize, i32, bool)>,
    /// `attributes['luring_song_immunities']`: (harpy, until).
    pub luring_song_immune: Vec<(usize, i32)>,
    /// `attributes['vile_appearance_immunities']`: (sea_hag, until).
    pub vile_immune: Vec<(usize, i32)>,
    /// `attributes['recharge_spent']`: names of spent rechargeable NPC actions/abilities.
    pub recharge_spent: Vec<&'static str>,
    /// Cursed (`NoHealingEffect` with `duration: indefinite`, a mummy's
    /// Rotting Fist): can't regain Hit Points (`heal_override:1` in the digest).
    pub cursed: bool,
    /// `attributes['save_immunities']`: (source, action) this creature saved
    /// against (`save_attack` with `immune_on_success`): never its target again.
    pub save_immune_to: Vec<(usize, &'static str)>,
    /// `attributes['until_next_turn']` (Command effects).
    pub until_next_turn: Vec<u32>,
    /// Feat resource pools registered (`ensure_feat_pools`, lazily on the
    /// first `prepared_spells()` call).
    pub pools_init: bool,
    /// `attributes['innate_sorcery_until']` (game time).
    pub innate_until: Option<i32>,
    /// `battle.entities[e]['unseen_memory']`: (creature, square, round), in
    /// dict order.
    pub unseen: Vec<(usize, Pos, i32)>,
    /// Weapon Mastery Sap (`_sap_next_attack` / `_sap_from`): Disadvantage
    /// on this creature's next attack roll; the wielder who hit it.
    pub sap: Option<usize>,
    /// Equipped items (`Template::gear`) no longer equipped, one bit each
    /// (a thrown weapon's last copy).
    pub gear_off: u32,
    /// Spare copies left of each `Template::spares` entry.
    pub spares: Vec<i32>,
    /// `battle.entities[e]['two_weapon']` is set: the last attack was with a
    /// light weapon (then `TwoWeaponAttackAction.can` with a bonus action).
    pub two_weapon: bool,
    /// `hidden_stealth`: the Stealth total of a successful Hide, while the
    /// `hidden` status lasts (`Map.can_see`: an observer with a lower passive
    /// Perception does not see the creature).
    pub hidden_stealth: Option<i32>,
    /// NPC inventory counts (`Template::inventory`): the items its attacks
    /// are made with (a Goblin Minion's daggers). Not in the state digest.
    pub items: Vec<i32>,
    /// The squares it has stood on during its current (or last) turn, in
    /// order: its square at the start of the turn, then every square of each
    /// executed move. Observation only (`ember-gen-v2`'s trail channel); no
    /// rule reads it, and it is not in the state digest.
    pub trail: Vec<Pos>,
    // Barbarian (src/barbarian.rs): Rage uses left, raging, the rage was
    // entered or extended this turn, rounds left, Reckless Attack declared,
    // the turn's first attack roll made, the turn's Frenzy hit made
    pub rage_count: i32,
    pub raging: bool,
    pub rage_extended: bool,
    pub rage_rounds: i32,
    pub reckless: bool,
    pub attack_rolled: bool,
    pub frenzy_hit: bool,
    /// Cleave (`battle.entities[e]['cleave_attack']`): the open window (the
    /// weapon's attack row, the candidates in battle order).
    pub cleave: Option<(usize, Vec<usize>)>,
    /// Unspent feet in the immediate Remarkable Athlete movement window.
    pub champion_movement: i32,
    /// Optional controller choice for a critical hit during another creature's turn.
    pub champion_reaction_path: Vec<Pos>,
    /// `cleave_used`: the turn's Cleave is spent.
    pub cleave_used: bool,
    /// Insertion order of `entity.effects` keys (`UndeadWebArena._marks`, presentation only).
    pub effect_key_order: Vec<crate::effects::MarkSlot>,
}

impl Unit {
    #[inline]
    pub fn has(&self, s: St) -> bool {
        self.statuses.contains(&s)
    }
    #[inline]
    pub fn dead(&self) -> bool {
        self.has(St::Dead)
    }
    /// `Entity.unconscious`: not dead and unconscious.
    #[inline]
    pub fn unconscious(&self) -> bool {
        !self.dead() && self.has(St::Unconscious)
    }
    #[inline]
    pub fn conscious(&self) -> bool {
        !self.dead() && !self.unconscious()
    }
    #[inline]
    pub fn prone(&self) -> bool {
        self.has(St::Prone)
    }
    /// `Entity.incapacitated`.
    #[inline]
    pub fn incapacitated(&self) -> bool {
        self.has(St::Unconscious) || self.has(St::Dead) || self.has(St::Paralyzed) || self.has(St::Incapacitated)
    }
    pub fn max_hp(&self) -> i32 {
        (self.t.max_hp - self.max_hp_reduction).max(0)
    }
    /// `Entity.speed` (walking; flight for flyers is handled by the path cost).
    pub fn speed(&self) -> i32 {
        self.t.speed
    }
    /// `available_movement`: 0 while grappled or unconscious, else the stored budget.
    pub fn available_movement(&self) -> i32 {
        if self.unconscious() || self.is_grappled() {
            0
        } else {
            self.movement.max(self.champion_movement)
        }
    }
    #[inline]
    pub fn is_grappled(&self) -> bool {
        !self.grappled_by.is_empty()
    }
    #[inline]
    pub fn is_grappling(&self) -> bool {
        !self.grappling.is_empty()
    }
    #[inline]
    pub fn invisible(&self) -> bool {
        self.has(St::Invisible)
    }
    /// `Entity.has_reaction`: no incapacitated creature (unconscious
    /// included, N20-019) can react.
    pub fn has_reaction(&self) -> bool {
        if self.incapacitated() {
            return false;
        }
        self.reaction > 0
    }
    /// `Entity.strength()` (base score minus Strength drain).
    pub fn strength(&self) -> i32 {
        self.t.abil[0] - self.str_drain.unwrap_or(0)
    }
    pub fn str_mod(&self) -> i32 {
        crate::content::ability_mod(self.strength())
    }
    /// `Entity.poisoned()`.
    pub fn poisoned(&self) -> bool {
        (!self.stench_poison.is_empty() || self.has(St::Poisoned)) && !self.t.immune_poisoned
    }
    /// Current Athletics check modifier (tracks Strength drain).
    pub fn athletics_mod(&self) -> i32 {
        self.t.skills[1] + (self.str_mod() - crate::content::ability_mod(self.t.abil[0]))
    }
    /// Current Acrobatics check modifier.
    pub fn acrobatics_mod(&self) -> i32 {
        self.t.skills[2]
    }
    /// Current Medicine check modifier.
    pub fn medicine_mod(&self) -> i32 {
        self.t.skills[0]
    }
    pub fn save_mod(&self, ab: Ability) -> i32 {
        let score = if ab == Ability::Str { self.strength() } else { self.t.abil[ab.idx()] };
        let m = crate::content::ability_mod(score);
        m + if self.t.save_prof[ab.idx()] { self.t.prof_bonus } else { 0 }
    }
    pub(crate) fn add_status(&mut self, s: St) {
        if !self.has(s) {
            self.statuses.push(s);
        }
    }
    fn remove_status(&mut self, s: St) {
        self.statuses.retain(|x| *x != s);
    }
    /// `do_prone`.
    fn do_prone(&mut self) {
        if !self.t.immune_prone {
            self.add_status(St::Prone);
        }
    }
    /// `Entity.hidden()`.
    #[inline]
    pub fn hidden(&self) -> bool {
        self.hidden_stealth.is_some()
    }
    /// `Entity.break_stealth`: an attack (or a spell) reveals the creature.
    pub(crate) fn break_stealth(&mut self) {
        if self.hidden_stealth.take().is_some() {
            self.remove_status(St::Hidden);
        }
    }
}

/// A native action the arena executes.
#[derive(Clone, Debug, PartialEq)]
pub enum Act {
    Move(Vec<Pos>),
    Attack { atk: usize, target: usize, reaction: bool },
    /// An attack on a square holding a creature the attacker can't see
    /// (`unseen_targets.blind_attack_variants`): heard there now (`heard`,
    /// confidence 1.0) or remembered there (0.35).
    BlindAttack { atk: usize, square: Pos, heard: bool },
    Dash,
    Disengage,
    Dodge,
    SecondWind,
    ActionSurge,
    Spell(Box<Cast>),
    TurnUndead,
    DivineSpark { target: usize, heal: bool, dt: Dmg },
    PreserveLife(Vec<(usize, i32)>),
    SpiritualWeaponAttack { target: usize },
    SpiritualWeaponMove { to: Pos },
    CreateSpellSlot { level: usize },
    ConvertSpellSlot { level: usize },
    /// Innate Sorcery (bonus action).
    InnateSorcery,
    /// Dragon's Breath exhale (unaimed: the best cone at resolve).
    DragonsBreathExhale,
    /// `StandAction`: stand up from prone for half the speed (N20-004).
    Stand,
    /// Nimble Escape: `DisengageBonusAction` (bonus action).
    DisengageBonus,
    /// Nimble Escape: `HideBonusAction` (bonus action; 2024 Hide, DC 15 out
    /// of every enemy's sight).
    HideBonus,
    /// `RedirectAttackAction` (an NPC `swap_retarget` reaction, the Goblin
    /// Boss's Redirect Attack): swap with `ally`, which becomes the target.
    /// A `select_reaction` option only, never a turn candidate.
    RedirectAttack { ally: usize, would_hit: bool },
    /// Barbarian: `RageAction` (bonus action).
    Rage,
    /// Barbarian (2024): `ExtendRageAction` (bonus action).
    ExtendRage,
    /// Barbarian: `RecklessAttackAction` (no cost).
    RecklessAttack,
    /// Weapon Mastery Cleave: `CleaveAttackAction` (free) with attack row
    /// `atk` on a creature of the open window.
    Cleave { atk: usize, target: usize },
    /// `FirstAidAction` (Action: Medicine DC 10 to stabilize an adjacent dying creature).
    FirstAid { target: usize },
    /// `EscapeGrappleAction` (Action: Athletics/Acrobatics vs escape DC).
    EscapeGrapple { target: usize },
    /// `BreakFreeAction` (Action: STR Athletics vs Entangle DC, self-only).
    BreakFree { target: usize },
    /// `DropGrappleAction` (Free: release a dead/unconscious/non-hostile grappled creature).
    DropGrapple { target: usize },
    /// `NpcAreaAction` (`type: area_save`, e.g. Steam Mephit Steam Breath).
    NpcAreaAbility { idx: usize, target: Option<Pos> },
    /// `NpcTeleportAction` (`type: teleport`, e.g. Blink Dog Teleport, Dryad Tree Stride).
    NpcTeleport { idx: usize, dest: Pos },
    /// `LuringSongAction` (Harpy Action, Concentration, 300-ft Emanation).
    LuringSong,
    /// `NpcVanishAction` (Will-o'-Wisp Bonus Action, Concentration, Invisible).
    NpcVanish,
    /// End the turn: the last row of every external decision (`env.rs`);
    /// never executed as an action.
    EndTurn,
}

/// The `weapon` dict `target_advantage_condition` sees: melee or ranged
/// (with its normal range), for weapons and spell attacks alike.
#[derive(Clone, Copy, Debug)]
pub struct WeaponKind {
    /// YAML `type: ranged_attack` or `ranged_spell_attack` (ranged
    /// disadvantages, prone at range; N20-007).
    pub ranged: bool,
    /// YAML `type: melee_attack` (Advantage against a prone target).
    pub melee: bool,
    pub range: i32,
    /// A spell attack (Innate Sorcery's Advantage applies to the caster's).
    pub spell: bool,
    /// A Strength attack of a creature with Reckless Attack
    /// (`Fight::weapon_kind`).
    pub str_attack: bool,
    /// Advantage when target is grappled by source (Bugbear Warrior Light Hammer).
    pub adv_if_grappled_by_source: bool,
}

impl WeaponKind {
    pub fn melee() -> WeaponKind {
        WeaponKind { ranged: false, melee: true, range: 5, spell: false, str_attack: false, adv_if_grappled_by_source: false }
    }
    pub fn spell_ranged(range: i32) -> WeaponKind {
        WeaponKind { ranged: true, melee: false, range, spell: true, str_attack: false, adv_if_grappled_by_source: false }
    }
    pub fn of(def: &AttackDef) -> WeaponKind {
        WeaponKind {
            ranged: def.ranged,
            melee: !def.ranged,
            range: def.range,
            spell: false,
            str_attack: false,
            adv_if_grappled_by_source: def.advantage_if == Some(AdvCond::TargetGrappledBySource),
        }
    }
}

impl Act {
    pub fn kind(&self) -> &'static str {
        match self {
            Act::Move(_) => "move",
            Act::Attack { .. } | Act::BlindAttack { .. } => "attack",
            Act::Dash => "dash",
            Act::Disengage => "disengage",
            Act::Dodge => "dodge",
            Act::SecondWind => "second_wind",
            Act::ActionSurge => "action_surge",
            Act::Spell(_) => "spell",
            Act::TurnUndead => "channel_divinity_turn_undead",
            Act::DivineSpark { .. } => "divine_spark",
            Act::PreserveLife(_) => "preserve_life",
            Act::SpiritualWeaponAttack { .. } => "spiritual_weapon_attack",
            Act::SpiritualWeaponMove { .. } => "spiritual_weapon_move",
            Act::CreateSpellSlot { .. } => "create_spell_slot",
            Act::ConvertSpellSlot { .. } => "convert_spell_slot",
            Act::InnateSorcery => "innate_sorcery",
            Act::DragonsBreathExhale => "dragons_breath_exhale",
            Act::Stand => "stand",
            Act::DisengageBonus => "disengage_bonus",
            Act::HideBonus => "hide_bonus",
            Act::RedirectAttack { .. } => "redirect_attack",
            Act::Rage => "rage",
            Act::ExtendRage => "extend_rage",
            Act::RecklessAttack => "reckless_attack",
            Act::Cleave { .. } => "cleave",
            Act::FirstAid { .. } => "first_aid",
            Act::EscapeGrapple { .. } => "escape_grapple",
            Act::BreakFree { .. } => "break_free",
            Act::DropGrapple { .. } => "drop_grapple",
            Act::NpcAreaAbility { .. } => "npc_area_ability",
            Act::NpcTeleport { .. } => "npc_teleport",
            Act::LuringSong => "luring_song",
            Act::NpcVanish => "npc_vanish",
            Act::EndTurn => "end_turn",
        }
    }
}

/// An `on_hit` effect item applied at commit.
#[derive(Clone, Copy, Debug)]
enum HitEffect {
    Condition(Condition),
    LifeDrain,
    StrengthDrain,
    Curse,
    Frighten,
    Push { distance: i32 },
    Grapple { escape_dc: Option<i32> },
    Charm { duration: Option<&'static str>, save_dc: Option<(Ability, i32)>, repeat_save_when_harmed: bool },
    ConsumeLife { heal_die: Dice },
}

/// Damage context for `take_damage` (the result item natural20 passes).
#[derive(Clone, Copy, Debug, Default)]
pub struct HitState {
    pub overflow: i32,
    pub death_fail_counted: bool,
    /// The attack has `kill_at_zero` (`item['kill_at_zero']` on its damage
    /// and rider items).
    pub kill_at_zero: bool,
}

/// Counts of rule paths taken during a fight (coverage only; no game state).
#[derive(Clone, Copy, Debug, Default)]
pub struct Notes {
    /// Stand actions executed.
    pub stands: u64,
    /// Corpses inside a Burning Hands / Thunderwave area (no save, no push).
    pub area_corpses: u64,
    /// Attacks on a creature that would have cast Shield before N20-011
    /// (total in [AC, AC + 5), reaction and slot available) but rolled a
    /// natural 20 or 1.
    pub shield_nat: u64,
    /// Sap markers set by a hit (`weapon_mastery_sap` result items).
    pub sap_applied: u64,
    /// Attack rolls that spent a Sap marker (taken with Disadvantage).
    pub sap_spent: u64,
    /// Sap markers cleared at the start of the wielder's turn.
    pub sap_expired: u64,
    /// Thrown attacks that spent a spare copy / the held weapon.
    pub thrown_spare: u64,
    pub thrown_held: u64,
    /// Mage Armor castings applied.
    pub mage_armor: u64,
    /// Blind attacks (on a heard or remembered square) executed.
    pub blind_attacks: u64,
    /// Nimble Escape: bonus-action Disengages; Hide attempts and successes.
    pub disengage_bonus: u64,
    pub hide_attempts: u64,
    pub hide_success: u64,
    /// Attack rolls with Advantage that rolled `condition: advantage` riders.
    pub adv_riders: u64,
    /// Redirect Attack reactions taken (`swap_retarget`).
    pub redirects: u64,
    /// NPC throws (an inventory item spent) and attacks while hidden
    /// (stealth broken by the attack).
    pub npc_throws: u64,
    pub hidden_attacks: u64,
    /// Thrown hero weapons that hit and went into the target's inventory
    /// counted by an NPC attack. Always 0 since N20-041 was fixed (a thrown
    /// weapon lands at the target's square); kept for `ember replay`'s G8b line.
    pub items_gained: u64,
    /// Mummy: Dreadful Glare saves failed / made, creatures cursed, heals on
    /// cursed creatures (nothing restored), deaths at 0 HP by `kill_at_zero`,
    /// glares warded off by Protection from Evil and Good (`ember replay`'s
    /// Mummy line).
    pub glare_fail: u64,
    pub glare_save: u64,
    pub curses: u64,
    pub heals_blocked: u64,
    pub kill_at_zero: u64,
    pub pfeg_ward: u64,
    /// Barbarian: rages entered, Extend Rage bonus actions, rages that lapsed
    /// at the end of a turn (not extended), rages ended by Incapacitated,
    /// Reckless Attacks declared, Frenzy hits, Cleave windows opened and
    /// Cleave attacks made (`ember replay`'s Barbarian line).
    pub rages: u64,
    pub rage_extends: u64,
    pub rage_lapsed: u64,
    pub rage_incapacitated: u64,
    pub reckless: u64,
    pub frenzy_hits: u64,
    pub cleave_windows: u64,
    pub cleaves: u64,
}

impl Notes {
    pub fn add(&mut self, o: &Notes) {
        self.stands += o.stands;
        self.area_corpses += o.area_corpses;
        self.shield_nat += o.shield_nat;
        self.sap_applied += o.sap_applied;
        self.sap_spent += o.sap_spent;
        self.sap_expired += o.sap_expired;
        self.thrown_spare += o.thrown_spare;
        self.thrown_held += o.thrown_held;
        self.mage_armor += o.mage_armor;
        self.blind_attacks += o.blind_attacks;
        self.disengage_bonus += o.disengage_bonus;
        self.hide_attempts += o.hide_attempts;
        self.hide_success += o.hide_success;
        self.adv_riders += o.adv_riders;
        self.redirects += o.redirects;
        self.npc_throws += o.npc_throws;
        self.hidden_attacks += o.hidden_attacks;
        self.items_gained += o.items_gained;
        self.glare_fail += o.glare_fail;
        self.glare_save += o.glare_save;
        self.curses += o.curses;
        self.heals_blocked += o.heals_blocked;
        self.kill_at_zero += o.kill_at_zero;
        self.pfeg_ward += o.pfeg_ward;
        self.rages += o.rages;
        self.rage_extends += o.rage_extends;
        self.rage_lapsed += o.rage_lapsed;
        self.rage_incapacitated += o.rage_incapacitated;
        self.reckless += o.reckless;
        self.frenzy_hits += o.frenzy_hits;
        self.cleave_windows += o.cleave_windows;
        self.cleaves += o.cleaves;
    }
}

#[derive(Clone)]
pub struct Fight {
    /// The content pool the units come from (vocabulary ids for the
    /// observation encoder; no game state).
    pub pool: &'static ContentPool,
    /// Version-one tapes predate Remarkable Athlete movement; their controllers declined it.
    pub champion_moves_enabled: bool,
    /// Version 3 movement costs and occupied-space crossings.
    pub creature_space_rules: bool,
    /// Strict tape version governing controller scores and combat behavior.
    pub(crate) rule_version: i32,
    pub(crate) interactive_champion: Option<usize>,
    /// The map, shared by every fight on it.
    pub grid: Arc<Grid>,
    pub units: Vec<Unit>,
    /// `map.tokens`: which unit (alive or a corpse) occupies each cell.
    pub occ: Vec<Option<u8>>,
    /// `battle.combat_order`.
    pub order: Vec<usize>,
    pub turn_idx: usize,
    pub round: i32,
    pub started: bool,
    pub finished: bool,
    pub winner: Option<u8>,
    pub max_rounds: i32,
    pub trace: Trace,
    pub decisions: u64,
    pub turns: u64,
    /// Decision being built (context, candidate descriptors, native scores).
    pub pending: Option<(String, Vec<String>, Vec<f64>)>,
    /// Scripted preferences (see `validation/n20_record.py` PREFER).
    pub prefer: Vec<String>,
    /// Effect objects (spell instances and effect objects), by id.
    pub objs: Vec<EffObj>,
    /// `metamagic._ACTIVE_HEIGHTENED`: (caster, used) while a Heightened spell resolves.
    pub heightened: Option<(usize, bool)>,
    pub(crate) scorching_rays: Option<crate::spells::ScorchingRays>,
    /// Move-scoring search cache (no game state; see `ai.rs`).
    pub move_cache: crate::ai::MoveCache,
    pub notes: Notes,
    /// Optional presentation event sink (`Some` only in `present::WebArena`).
    pub web_events: Option<Vec<crate::web_events::WebEv>>,
}

pub fn team_name(team: u8) -> &'static str {
    if team == 0 {
        "heroes"
    } else {
        "monsters"
    }
}

impl Fight {
    /// `UndeadArena(seed, units, placements)` followed by `configure`, on the
    /// Ember Vault with the process-wide content pool. Panics on bad input.
    pub fn new(unit_ids: &[String], placements: &[Placement], max_rounds: i32, trace: Trace) -> Fight {
        Fight::on_map(ContentPool::global(), Grid::ember_vault(), unit_ids, placements, max_rounds, trace)
            .unwrap_or_else(|e| panic!("{e}"))
    }

    /// `GeneralArena(spec, seed)`: units by id (`<content>` for heroes,
    /// `<content>-<n>` for monsters) on any map. Heroes are team 0, monsters
    /// team 1; `unit_ids` is the registration (`Battle.add`) order.
    pub fn on_map(
        pool: &'static ContentPool,
        grid: Arc<Grid>,
        unit_ids: &[String],
        placements: &[Placement],
        max_rounds: i32,
        trace: Trace,
    ) -> Result<Fight, String> {
        let g = &grid;
        if unit_ids.len() > u8::MAX as usize {
            return Err(format!("{} units (at most 255)", unit_ids.len()));
        }
        let mut units = Vec::new();
        for id in unit_ids {
            let tid = pool.unit_tid(id).ok_or_else(|| format!("unit {id}: no such content"))?;
            let t: &'static Template = &pool.templates[tid as usize];
            let p = placements.iter().find(|p| &p.id == id).ok_or_else(|| format!("no placement for {id}"))?;
            if g.is_wall(p.x, p.y) {
                return Err(format!("{id} placed on a wall or off the map at ({}, {})", p.x, p.y));
            }
            if units.iter().any(|u: &Unit| u.id == *id) {
                return Err(format!("unit {id} twice"));
            }
            units.push(Unit {
                id: id.clone(),
                tid,
                t,
                team: if t.pc { 0 } else { 1 },
                pos: (p.x, p.y),
                hp: t.max_hp,
                max_hp_reduction: 0,
                temp_hp: 0,
                statuses: Vec::new(),
                death_saves: 0,
                death_fails: 0,
                action: 0,
                bonus: 0,
                reaction: 1,
                movement: 0,
                dodge: false,
                disengage: false,
                action_surge_flag: false,
                savage_turn: None,
                first_turn_taken: false,
                initiative: 0.0,
                second_wind_count: t.second_wind_uses,
                action_surge_count: t.action_surge_uses,
                mem: Memory { visited: Bits::new(g.cells()), ..Default::default() },
                str_drain: None,
                stench_poison: Vec::new(),
                stench_immune: Vec::new(),
                paralysis: Vec::new(),
                ma_groups: Vec::new(),
                ma_combos: Vec::new(),
                ma_started: false,
                slots: t.caster.as_ref().map_or([0; 3], |c| c.slots),
                cd: t.caster.as_ref().map_or(0, |c| c.channel_divinity),
                free_casts: t.caster.as_ref().map_or(Vec::new(), |c| c.free_casts.clone()),
                holy_water: t.caster.as_ref().map_or(0, |c| c.holy_water),
                sorcery_points: t.caster.as_ref().map_or(0, |c| c.sorcery_points),
                innate_sorcery: t.caster.as_ref().map_or(0, |c| c.innate_sorcery),
                last_slot_turn: None,
                concentration: None,
                effects: Vec::new(),
                hooks: Vec::new(),
                casted: Vec::new(),
                turned_by: Vec::new(),
                frightened_by: Vec::new(),
                source_fear: Vec::new(),
                charmed_by: Vec::new(),
                grappled_by: Vec::new(),
                grappling: Vec::new(),
                lured_by: None,
                luring_song_immune: Vec::new(),
                vile_immune: Vec::new(),
                recharge_spent: Vec::new(),
                cursed: false,
                save_immune_to: Vec::new(),
                until_next_turn: Vec::new(),
                pools_init: !t.pc && t.caster.as_ref().is_some_and(|c| !c.free_casts.is_empty() || !c.inert_pools.is_empty()),
                innate_until: None,
                unseen: Vec::new(),
                sap: None,
                gear_off: 0,
                spares: t.spares.iter().map(|s| s.1).collect(),
                two_weapon: false,
                hidden_stealth: None,
                items: t.inventory.iter().map(|i| i.1).collect(),
                trail: Vec::new(),
                rage_count: t.rage_uses,
                raging: false,
                rage_extended: false,
                rage_rounds: 0,
                reckless: false,
                attack_rolled: false,
                frenzy_hit: false,
                cleave: None,
                champion_movement: 0,
                champion_reaction_path: Vec::new(),
                cleave_used: false,
                effect_key_order: Vec::new(),
            });
        }
        let mut occ = vec![None; g.cells()];
        for (i, u) in units.iter().enumerate() {
            let c = g.index(u.pos.0, u.pos.1);
            if let Some(o) = occ[c] {
                return Err(format!("{} and {} on the same square", units[o as usize].id, u.id));
            }
            occ[c] = Some(i as u8);
        }
        Ok(Fight {
            pool,
            champion_moves_enabled: true,
            creature_space_rules: true,
            rule_version: CURRENT_RULE_VERSION,
            interactive_champion: None,
            grid,
            units,
            occ,
            order: Vec::new(),
            turn_idx: 0,
            round: 0,
            started: false,
            finished: false,
            winner: None,
            max_rounds,
            trace,
            decisions: 0,
            turns: 0,
            pending: None,
            prefer: Vec::new(),
            objs: Vec::new(),
            heightened: None,
            scorching_rays: None,
            move_cache: Default::default(),
            notes: Notes::default(),
            web_events: None,
        })
    }

    #[inline]
    pub(crate) fn emit_web(&mut self, ev: crate::web_events::WebEv) {
        use crate::web_events::WebEv;
        if let Some(buf) = &mut self.web_events {
            // Discovery takes effect on the crossed square. Announce the relocation
            // before the discoveries it caused, within this movement segment.
            if self.rule_version >= 12 && matches!(ev, WebEv::MoveExecuted { .. }
                | WebEv::ThunderwavePush { .. } | WebEv::Redirected { .. }) {
                let found = buf.iter().rev().take_while(|e| matches!(e, WebEv::HiddenFound { .. })).count();
                buf.insert(buf.len() - found, ev);
            } else {
                buf.push(ev);
            }
        }
    }

    pub(crate) fn take_web_events(&mut self) -> Vec<crate::web_events::WebEv> {
        match &mut self.web_events {
            Some(buf) => std::mem::take(buf),
            None => Vec::new(),
        }
    }

    // ------------------------------------------------------------------
    // Queries
    // ------------------------------------------------------------------

    #[inline]
    pub fn current(&self) -> usize {
        self.order[self.turn_idx]
    }

    #[inline]
    pub fn opposing(&self, a: usize, b: usize) -> bool {
        self.units[a].team != self.units[b].team
    }

    /// Check the effect path and the observer's senses at the target square.
    pub(crate) fn sees_lit_square(&self, observer: usize, pos: Pos) -> bool {
        let u = &self.units[observer];
        if self.rule_version >= 9 && self.grid.in_bounds(pos.0, pos.1) && self.grid.light_level(pos) == 0 {
            let senses = u.t.darkvision.max(u.t.blindsight).max(u.t.truesight);
            if self.square_distance(u.pos, pos) * 5 > senses { return false; }
        }
        self.clear_sight(u.pos, pos)
    }

    pub(crate) fn sees_hider_clearly(&self, observer: usize, hider: usize) -> bool {
        let pos = self.units[hider].pos;
        if self.rule_version < 11 { return self.sees_lit_square(observer, pos); }
        self.grid.light_level(pos) > 0 && self.sees_lit_square(observer, pos)
            && self.grid.corner_wall_grade(self.units[observer].pos, pos) < 3
    }

    fn reveal_exposed_hiders(&mut self) {
        if self.rule_version < 11 { return; }
        for hider in 0..self.units.len() {
            if !self.units[hider].hidden() { continue; }
            let exposed = (0..self.units.len()).any(|observer| self.opposing(observer, hider)
                && self.units[observer].conscious() && self.sees_hider_clearly(observer, hider));
            if exposed {
                self.units[hider].break_stealth();
                self.emit_web(crate::web_events::WebEv::HiddenFound { target: hider });
            }
        }
    }

    #[inline]
    pub fn can_see(&self, a: usize, b: usize) -> bool {
        if a == b {
            return true;
        }
        if self.units[b].invisible() {
            let sense = self.units[a].t.blindsight.max(self.units[a].t.truesight);
            if !(sense > 0 && self.dist(a, b) * 5 <= sense && self.clear_sight(self.units[a].pos, self.units[b].pos)) {
                return false;
            }
        }
        if let Some(stealth) = self.units[b].hidden_stealth {
            let sense = self.units[a].t.blindsight;
            if self.units[a].t.passive_perception < stealth && !(sense > 0 && self.dist(a, b) * 5 <= sense) {
                return false;
            }
        }
        self.sees_lit_square(a, self.units[b].pos)
    }

    /// True if `u` has the Restrained condition (direct status or `restrained_override`, e.g. Entangle).
    pub fn is_restrained(&self, u: usize) -> bool {
        self.units[u].has(St::Restrained) || self.has_effect(u, EffKey::RestrainedOverride)
    }

    /// True if `u` is currently charmed by `charmer` (non-expired, charmer alive).
    pub fn is_charmed_by(&self, u: usize, charmer: usize) -> bool {
        let gt = self.gt();
        self.units[u].charmed_by.iter().any(|c| {
            c.source == charmer
                && c.until.map_or(true, |x| gt < x)
                && !self.units[charmer].dead()
        })
    }

    /// True if `u` is actively lured by a living, non-incapacitated Harpy's Luring Song.
    pub fn is_lured(&self, u: usize) -> bool {
        let Some((harpy, _, _)) = self.units[u].lured_by else { return false };
        let h = &self.units[harpy];
        if h.dead() || h.incapacitated() {
            return false;
        }
        h.concentration
            .is_some_and(|c| matches!(self.objs[c as usize].kind, crate::effects::ObjKind::LuringSong { .. }))
    }

    /// True when `u` is lured and physically able to move toward the Harpy.
    pub fn can_lure_move(&self, u: usize) -> bool {
        if !self.is_lured(u) || self.units[u].dead() {
            return false;
        }
        let unit = &self.units[u];
        !(unit.has(St::Unconscious) || unit.has(St::Dead) || unit.has(St::Paralyzed))
    }

    /// True when moving while grappling slows `u` (not `abduct`, target non-Tiny and within 1 size).
    pub fn drag_penalty(&self, u: usize) -> bool {
        let unit = &self.units[u];
        if !unit.is_grappling() || unit.t.abduct {
            return false;
        }
        let my_rank = unit.t.size_rank as i32;
        unit.grappling.iter().any(|&t| {
            let tr = self.units[t].t.size_rank as i32;
            tr > 0 && (tr - my_rank) >= -1
        })
    }

    /// True if `p` is inside an active `Entangle` difficult-terrain zone.
    pub fn is_entangle_square(&self, p: Pos) -> bool {
        let gt = self.gt();
        self.objs.iter().any(|o| {
            !o.ended
                && match &o.kind {
                    crate::effects::ObjKind::Entangle { squares, expires_at, .. } => gt < *expires_at && squares.contains(&p),
                    _ => false,
                }
        })
    }

    #[inline]
    pub fn dist(&self, a: usize, b: usize) -> i32 {
        self.square_distance(self.units[a].pos, self.units[b].pos)
    }

    /// SRD square-grid ranges count the shortest sequence of adjacent squares.
    pub fn square_distance(&self, a: Pos, b: Pos) -> i32 {
        if self.rule_version >= 6 { (a.0 - b.0).abs().max((a.1 - b.1).abs()) } else { distance(a, b) }
    }

    pub(crate) fn within_reach(&self, a: Pos, b: Pos, feet: i32) -> bool {
        if self.rule_version >= 6 { self.square_distance(a, b) * 5 <= feet } else { within_melee(a, b, feet) }
    }

    #[inline]
    pub fn token_at(&self, p: Pos) -> Option<usize> {
        if !self.grid.in_bounds(p.0, p.1) {
            return None;
        }
        let top = self.occ[self.grid.index(p.0, p.1)]? as usize;
        if self.rule_version >= 8 && self.units[top].dead() {
            return self.units.iter().position(|unit| unit.pos == p && !unit.dead());
        }
        Some(top)
    }

    pub fn rule_version(&self) -> i32 {
        self.rule_version
    }

    /// Select the recorded combat rules before initiative or any controller choice.
    pub fn set_rule_version(&mut self, version: i32) {
        if !self.started {
            for unit in &mut self.units {
                unit.reaction = i32::from(version >= 6);
            }
        }
        self.champion_moves_enabled = version >= 2;
        self.creature_space_rules = version >= 3;
        if self.grid.symmetric_sight != (version >= 7) {
            self.grid = Grid::shared_for_rules(&self.grid.rows, version >= 7).expect("validated map");
        }
        self.rule_version = version;
    }

    /// SRD cover is directional. Cover sources never add their bonuses together.
    pub fn cover_bonus_from(&self, origin: Pos, target: usize) -> i32 {
        self.known_cover(origin, target, 0)
    }

    pub(crate) fn known_cover(&self, origin: Pos, target: usize, hidden: u32) -> i32 {
        if self.rule_version < 11 { return self.known_point_cover(origin, target, hidden); }
        let pos = self.units[target].pos;
        let grade = self.grid.corner_cover_grade(origin, pos, |p| {
            self.token_at(p).is_some_and(|u| hidden & (1 << u) == 0)
        });
        match grade {
            4 if !self.clear_sight(origin, pos) => 0, // Total cover excludes direct targeting.
            3..=4 => 5,
            2 => 2,
            _ => 0,
        }
    }

    pub(crate) fn known_point_cover(&self, origin: Pos, target: usize, hidden: u32) -> i32 {
        if self.rule_version < 9 { return 0; }
        let (walls, creatures) = self.grid.cover_rays(origin, self.units[target].pos, |p| {
            self.token_at(p).is_some_and(|u| hidden & (1 << u) == 0)
        });
        if walls == 15 {
            let pos = self.units[target].pos;
            let visible = if self.rule_version >= 11 { self.clear_effect(origin, pos) } else { self.clear_sight(origin, pos) };
            if !visible { return 0; }
        }
        if walls.count_ones() >= 3 { 5 }
        else if (walls | creatures).count_ones() >= 2 { 2 }
        else { 0 }
    }

    pub(crate) fn attack_ac(&self, origin: Pos, target: usize) -> i32 {
        self.armor_class(target) + self.cover_bonus_from(origin, target)
    }

    /// Annotate the roll at resolution, while the target, cover and reaction AC are known.
    pub(crate) fn describe_attack_cover(&self, roll: &mut Option<String>, target: usize, ac: i32, shield: bool) {
        if self.rule_version >= 10 {
            if let Some(text) = roll {
                let cover = ac - self.armor_class(target);
                if cover > 0 {
                    let effective = ac + if shield { 5 } else { 0 };
                    text.push_str(&format!(" vs AC {effective} including cover +{cover}"));
                }
            }
        }
    }

    pub(crate) fn save_cover(&self, origin: Pos, target: usize, ability: Ability) -> i32 {
        if ability == Ability::Dex { self.cover_bonus_from(origin, target) } else { 0 }
    }

    pub(crate) fn point_save_cover(&self, origin: Pos, target: usize, ability: Ability) -> i32 {
        if ability == Ability::Dex { self.known_point_cover(origin, target, 0) } else { 0 }
    }

    pub(crate) fn clear_effect(&self, a: Pos, b: Pos) -> bool {
        if self.grid.los(a, b) { return true; }
        self.rule_version >= 9 && !self.grid.is_wall(a.0, a.1) && !self.grid.is_wall(b.0, b.1)
            && self.grid.wall_cover_mask(a, b) != 15
    }

    /// Either creature can look through the same gap. An area has a fixed point of origin.
    pub(crate) fn clear_sight(&self, a: Pos, b: Pos) -> bool {
        self.clear_effect(a, b) || (self.rule_version >= 10 && self.clear_effect(b, a))
            || (self.rule_version >= 11 && !self.grid.is_wall(a.0, a.1) && !self.grid.is_wall(b.0, b.1)
                && self.grid.corner_wall_grade(a, b) < 4)
    }

    pub(crate) fn incorporeal(&self, u: usize) -> bool {
        self.rule_version >= 9 && self.units[u].t.incorporeal
    }

    pub(crate) fn step_clears_corner(&self, u: usize, from: Pos, to: Pos) -> bool {
        self.incorporeal(u) || self.grid.clears_corner(from, to)
    }

    pub(crate) fn shadow_can_hide(&self, u: usize) -> bool {
        let unit = &self.units[u];
        self.rule_version >= 9 && unit.t.shadow_stealth.is_some() && self.grid.light_level(unit.pos) < 2
    }

    /// `Map.passable(entity, x, y, battle)` for a 1x1 creature (no squeezing).
    pub fn passable(&self, u: usize, p: Pos) -> bool {
        if self.incorporeal(u) { return self.grid.in_bounds(p.0, p.1); }
        if self.grid.is_wall(p.0, p.1) {
            return false;
        }
        if let Some(o) = self.token_at(p) {
            if o != u
                && self.opposing(o, u)
                && !self.units[o].incapacitated()
                && !(self.creature_space_rules && self.units[o].t.size == "tiny")
                && self.units[o].t.size_rank.abs_diff(self.units[u].t.size_rank) < 2
            {
                return false;
            }
        }
        true
    }

    /// Current rules permit ending movement on remains.
    pub fn placeable(&self, u: usize, p: Pos) -> bool {
        if !self.passable(u, p) {
            return false;
        }
        match self.token_at(p) {
            Some(o) => o == u,
            None => true,
        }
    }

    fn difficult_occupant(&self, u: usize, o: usize) -> bool {
        o != u && !self.units[o].dead()
            && (!self.creature_space_rules || (!self.allies(u, o) && self.units[o].t.size != "tiny"))
    }

    /// Occupied or zone difficult terrain under the tape's ruleset.
    pub fn difficult(&self, u: usize, p: Pos) -> bool {
        if self.is_entangle_square(p) {
            return true;
        }
        match self.token_at(p) {
            Some(o) => self.difficult_occupant(u, o),
            None => false,
        }
    }

    /// `Battle.enemy_in_melee_range(source)`.
    pub fn enemy_in_melee_range(&self, s: usize) -> bool {
        for o in 0..self.units.len() {
            if o == s || !self.can_see(s, o) {
                continue;
            }
            let u = &self.units[o];
            if !u.conscious() {
                continue;
            }
            let Some(reach) = u.t.melee_ft else { continue };
            if reach <= 0 {
                continue;
            }
            // distance <= reach / feet_per_grid (float division)
            if self.opposing(s, o) && (self.dist(s, o) as f64) <= reach as f64 / 5.0 {
                return true;
            }
        }
        false
    }

    /// `UndeadArena.enemy_within(entity, squares)` (Chebyshev).
    pub fn enemy_within(&self, s: usize, squares: i32) -> bool {
        let (x, y) = self.units[s].pos;
        self.units.iter().enumerate().any(|(o, u)| {
            o != s
                && u.team != self.units[s].team
                && u.conscious()
                && (u.pos.0 - x).abs().max((u.pos.1 - y).abs()) <= squares
        })
    }

    /// Same component under the A* neighbour rule (a path exists).
    pub fn reachable(&self, a: Pos, b: Pos) -> bool {
        self.grid.reachable(a, b)
    }

    /// Cells counted as difficult terrain for `u`'s pathfinding.
    pub fn occupied_mask(&self, u: usize) -> Bits {
        let mut mask = Bits::new(self.grid.cells());
        for (i, o) in self.occ.iter().enumerate() {
            if let Some(o) = o {
                let o = *o as usize;
                if self.difficult_occupant(u, o) || (self.incorporeal(u) && o != u && !self.units[o].dead()) {
                    mask.set(i);
                }
            }
        }
        if !self.units[u].t.fly {
            let gt = self.gt();
            for obj in &self.objs {
                if !obj.ended {
                    if let crate::effects::ObjKind::Entangle { squares, expires_at, .. } = &obj.kind {
                        if gt < *expires_at {
                            for &(x, y) in squares {
                                if self.grid.in_bounds(x, y) {
                                    mask.set(self.grid.index(x, y));
                                }
                            }
                        }
                    }
                }
            }
        }
        mask
    }

    // ------------------------------------------------------------------
    // Dice
    // ------------------------------------------------------------------

    /// `count` normal draws of d`sides`.
    pub fn roll_dice(&mut self, who: usize, tag: &str, count: i32, sides: i32) -> Vec<i32> {
        let mut out = Vec::with_capacity(count.max(0) as usize);
        for _ in 0..count {
            let v = self.trace.draw(&self.units[who].id, tag, sides, RollMode::Normal).one();
            out.push(v);
        }
        out
    }

    /// One d20 (or a 2-sample for advantage/disadvantage), returning `(selected_face, raw_draw)`.
    pub(crate) fn roll_d20_raw(&mut self, who: usize, tag: &str, mode: RollMode) -> (i32, crate::tape::DrawVal) {
        let v = self.trace.draw(&self.units[who].id, tag, 20, mode);
        let face = match mode {
            RollMode::Normal => v.one(),
            RollMode::Advantage => {
                let [a, b] = v.pair();
                a.max(b)
            }
            RollMode::Disadvantage => {
                let [a, b] = v.pair();
                a.min(b)
            }
        };
        (face, v)
    }

    /// One d20 (or a 2-sample for advantage/disadvantage). Returns the
    /// selected face (`_sum_rolls`: max for advantage, min for disadvantage).
    pub fn roll_d20(&mut self, who: usize, tag: &str, mode: RollMode) -> i32 {
        self.roll_d20_raw(who, tag, mode).0
    }

    /// `Entity.save_throw(save, battle, opts={'dc': dc})` returning `(total, formatted_roll)`.
    pub(crate) fn save_throw_fmt(&mut self, u: usize, ab: Ability) -> (i32, String) {
        self.save_throw_disadvantage(u, ab, false)
    }

    pub(crate) fn save_throw_disadvantage(&mut self, u: usize, ab: Ability, disadvantage: bool) -> (i32, String) {
        self.save_throw_with_cover(u, ab, disadvantage, 0)
    }

    pub(crate) fn save_throw_with_cover(&mut self, u: usize, ab: Ability, disadvantage: bool, cover: i32) -> (i32, String) {
        self.save_throw_ex(u, ab, disadvantage, cover, false, false, false)
    }

    pub(crate) fn save_throw_ex(
        &mut self,
        u: usize,
        ab: Ability,
        disadvantage: bool,
        cover: i32,
        is_magical: bool,
        is_charmed: bool,
        extra_adv: bool,
    ) -> (i32, String) {
        if matches!(ab, Ability::Str | Ability::Dex) && self.units[u].has(St::Paralyzed) {
            // `DieRoll.roll("1")` -> `DieRoll([1], 0, 0)` -> `describe() == "0"`, `result() == 1`
            return (1, "0 = 1".to_string());
        }
        let m = self.units[u].save_mod(ab) + cover;
        // Rage: Advantage on Strength saves; Danger Sense: on Dexterity saves
        // unless Incapacitated (2024); Magic Resistance: on saves vs spells &
        // magical effects; Fey Ancestry: on saves vs Charmed.
        let adv = (ab == Ability::Str && self.is_raging(u))
            || (ab == Ability::Dex
                && (self.units[u].t.danger_sense && !self.units[u].incapacitated()
                    || self.rule_version >= 6 && self.benefits_from_dodge(u)))
            || (is_magical && self.units[u].t.magic_resistance)
            || (is_charmed && self.units[u].t.fey_ancestry)
            || extra_adv;
        // Heightened Spell: the first opponent of the caster to save rolls
        // with Disadvantage (`metamagic.heightened_disadvantage`).
        // Restrained: Disadvantage on Dexterity saving throws.
        let mut dis = disadvantage || (ab == Ability::Dex && self.is_restrained(u));
        if let Some((caster, used)) = self.heightened {
            if !used && caster != u && self.opposing(caster, u) {
                self.heightened = Some((caster, true));
                dis = true;
            }
        }
        let mode = Fight::mode_of(adv, dis);
        let (face, dv) = self.roll_d20_raw(u, ab.save_tag(), mode);
        let mut total = face + m;
        let bless = if self.has_effect(u, EffKey::Bless) {
            let b = self.roll_dice(u, "bless", 1, 4)[0];
            total += b;
            Some(b)
        } else {
            None
        };
        let fmt = if self.web_events.is_some() {
            crate::web_events::fmt_d20_roll(dv, mode, m, bless)
        } else {
            String::new()
        };
        (total, fmt)
    }

    /// `Entity.save_throw(save, battle, opts={'dc': dc})` for the scenario's
    /// creatures; returns the total.
    pub fn save_throw(&mut self, u: usize, ab: Ability) -> i32 {
        self.save_throw_fmt(u, ab).0
    }

    // ------------------------------------------------------------------
    // Setup and turn loop
    // ------------------------------------------------------------------

    /// `Battle.start()` initiative roll + combat order setup (shared with `WebArena::start`).
    pub(crate) fn roll_initiative(&mut self) {
        self.started = true;
        self.turn_idx = 0;
        for u in 0..self.units.len() {
            if self.units[u].dead() {
                continue;
            }
            let t = self.units[u].t;
            let mode = if t.init_adv { RollMode::Advantage } else { RollMode::Normal };
            let face = self.roll_d20(u, "initiative", mode);
            let total = face + plus_string_modifier_init(t.init_bonus);
            self.units[u].initiative = total as f64 + t.abil[1] as f64 / 100.0;
            self.emit_web(crate::web_events::WebEv::Initiative { u, roll_total: total });
        }
        let mut order: Vec<usize> = (0..self.units.len()).filter(|&u| !self.units[u].dead()).collect();
        // sorted(..., key=initiative, reverse=True): stable for ties.
        order.sort_by(|&a, &b| self.units[b].initiative.partial_cmp(&self.units[a].initiative).unwrap());
        self.order = order;
    }

    /// `Arena.start`: `Battle.add` in roster order, `Battle.start` (initiative),
    /// then `_open_turn`.
    pub fn start(&mut self) {
        if self.trace.on() {
            self.trace.emit(Ev::Start {});
        }
        self.roll_initiative();
        self.open_turn();
        // `Arena.start` returns `_state()`, which builds the first actor's
        // candidates (its spell list creates lazily registered pools).
        let cur = self.current();
        if self.units[cur].t.caster.is_some() && !self.units[cur].incapacitated() && !self.finished {
            self.units[cur].pools_init = true;
        }
        if self.trace.on() {
            let st = self.digest();
            self.trace.emit(Ev::State(st));
        }
    }

    /// `GeneralArena._can_take_turn`: a turned or lured creature still gets its turn.
    pub fn can_take_turn(&mut self, u: usize) -> bool {
        if !self.units[u].conscious() {
            return false;
        }
        !self.units[u].incapacitated() || self.can_flee(u) || self.can_lure_move(u)
    }

    /// Single iteration of `_open_turn` (shared between `Fight::open_turn` and `WebArena::open_turn_loop`).
    pub(crate) fn open_turn_step(&mut self) -> (usize, bool) {
        self.skip_dead_turns();
        let actor = self.current();
        self.start_turn();
        if self.can_take_turn(actor) {
            self.reset_turn(actor);
            if self.can_take_turn(actor) {
                return (actor, true);
            }
        }
        (actor, false)
    }

    /// `UndeadArena._open_turn`.
    fn open_turn(&mut self) {
        while !self.finish_if_needed() {
            let (actor, ready) = self.open_turn_step();
            if ready {
                self.emit_web(crate::web_events::WebEv::TurnBegins { u: actor, round: self.round });
                return;
            }
            self.emit_web(crate::web_events::WebEv::TurnSkipped { u: actor, round: self.round });
            self.end_and_next_turn();
        }
    }

    /// `Arena._finish_if_needed`.
    pub fn finish_if_needed(&mut self) -> bool {
        let mut teams = [false; 2];
        for u in &self.units {
            if u.conscious() {
                teams[u.team as usize] = true;
            }
        }
        if teams[0] && teams[1] {
            return false;
        }
        if !self.finished {
            self.finished = true;
            self.winner = if teams[0] {
                Some(0)
            } else if teams[1] {
                Some(1)
            } else {
                None
            };
            if self.started {
                self.battle_end_turn();
                self.next_turn();
            }
        }
        true
    }

    /// `Battle.skip_dead_turns`.
    fn skip_dead_turns(&mut self) {
        for _ in 0..self.order.len() {
            if !self.units[self.current()].dead() {
                return;
            }
            self.advance_turn_index();
        }
    }

    /// `Battle._advance_turn_index`.
    fn advance_turn_index(&mut self) {
        self.turn_idx += 1;
        if self.turn_idx >= self.order.len() {
            self.turn_idx = 0;
            self.round += 1;
        }
    }

    /// `Battle.battle_ends`.
    fn battle_ends(&self) -> bool {
        let mut teams = [false; 2];
        for &u in &self.order {
            if self.units[u].conscious() {
                teams[self.units[u].team as usize] = true;
            }
        }
        !(teams[0] && teams[1])
    }

    /// `Battle.next_turn`.
    fn next_turn(&mut self) {
        if self.started && self.battle_ends() {
            self.started = false;
            return;
        }
        self.advance_turn_index();
    }

    /// `Battle.start_turn`: lapsed conditions end before and after the
    /// start-of-turn processing (`timed_conditions`, N20-046).
    fn start_turn(&mut self) {
        self.expire_timed_conditions();
        self.start_turn_inner();
        self.expire_timed_conditions();
    }

    /// `Battle._start_turn`.
    fn start_turn_inner(&mut self) {
        let u = self.current();
        // the observation's trail of this turn (no rule reads it)
        let here = self.units[u].pos;
        self.units[u].trail.clear();
        self.units[u].trail.push(here);
        if self.trace.on() {
            self.trace.emit(Ev::Turn { who: self.units[u].id.clone(), round: self.round });
        }
        self.turns += 1;
        if self.rule_version >= 8 { self.units[u].dodge = false; }
        if self.units[u].unconscious() && !self.units[u].has(St::Stable) {
            self.death_saving_throw(u);
        }
        if self.units[u].dead() {
            return;
        }
        // expire_until_next_turn: Stench poisoning ends, Command becomes due.
        self.units[u].stench_poison.clear();
        let due: Vec<u32> = std::mem::take(&mut self.units[u].until_next_turn);
        for obj in due {
            if !self.objs[obj as usize].ended {
                if let crate::effects::ObjKind::Command { due, .. } = &mut self.objs[obj as usize].kind {
                    *due = true;
                }
            }
        }
        // an unconscious creature gets no reset_turn, so its start-of-turn
        // hooks fire here (Shield, Ray of Frost, Guiding Bolt end on time)
        if self.units[u].unconscious() {
            self.barbarian_start_of_turn(u);
            self.resolve_trigger(u, HookEv::StartOfTurn);
            // and the weapon-mastery markers it applied end (N20-032)
            self.expire_mastery(u);
        }
        self.stench_start_of_turn(u);
        self.vile_appearance_start_of_turn(u);
        self.expire_charms_on_turn_start(u);
        self.roll_recharges(u);
        self.prune_invalid_grapples(u);
        let grapplers: Vec<usize> = self.units[u].grappled_by.iter().map(|&(g, _)| g).collect();
        for g in grapplers {
            self.prune_invalid_grapples(g);
        }
    }

    /// `StenchEffect.start_of_turn`: a CON save against each living ghast
    /// within 5 ft (map order); failure poisons until the start of our next
    /// turn, success makes us immune to that ghast.
    fn stench_start_of_turn(&mut self, u: usize) {
        if self.units[u].dead() {
            return;
        }
        let pos = self.units[u].pos;
        let sources: Vec<usize> = (0..self.units.len())
            .filter(|&o| {
                o != u
                    && self.units[o].t.stench_dc.is_some()
                    && !self.units[o].dead()
                    && self.square_distance(self.units[o].pos, pos) * 5 <= 5
            })
            .collect();
        if sources.is_empty() || self.units[u].t.immune_poisoned {
            return;
        }
        for src in sources {
            if self.units[u].stench_immune.contains(&src) {
                continue;
            }
            let dc = self.units[src].t.stench_dc.unwrap_or(10);
            let total = self.save_throw(u, Ability::Con);
            let passed = total >= dc;
            if passed {
                self.units[u].stench_immune.push(src);
            } else {
                self.units[u].stench_poison.push(src);
            }
            self.emit_web(crate::web_events::WebEv::StenchSave { source: src, victim: u, victim_pos: pos, total, dc, passed });
        }
    }

    /// `Entity.reset_turn` (+ PlayerCharacter first-turn bonus, which is 0 here).
    fn reset_turn(&mut self, u: usize) {
        let speed = self.speed_of(u);
        let unit = &mut self.units[u];
        unit.action = 1;
        unit.bonus = 1;
        unit.reaction = 1;
        unit.movement = speed;
        unit.action_surge_flag = false;
        unit.last_slot_turn = None;
        unit.dodge = false;
        unit.disengage = false;
        unit.ma_started = false;
        unit.two_weapon = false;
        unit.cleave = None;
        unit.cleave_used = false;
        self.expire_mastery(u);
        // the barbarian's hook is its first start-of-turn hook
        self.barbarian_start_of_turn(u);
        self.resolve_trigger(u, HookEv::StartOfTurn);
        self.cleanup_effects(u);
        let unit = &mut self.units[u];
        if unit.t.pc && !unit.first_turn_taken {
            unit.first_turn_taken = true;
        }
        if !unit.t.multiattack.is_empty() {
            let mut groups: Vec<(i32, Vec<&'static str>)> = Vec::new();
            for a in &unit.t.attacks {
                if let Some(g) = a.multiattack_group {
                    match groups.iter_mut().find(|(k, _)| *k == g) {
                        Some(e) => e.1.push(a.name),
                        None => groups.push((g, vec![a.name])),
                    }
                }
            }
            // Innate spells named in multiattack (e.g. Dryad Charm Monster) join group 1.
            if let Some(caster) = unit.t.caster.as_ref() {
                for &sp in &caster.spells {
                    let key = sp.key();
                    if unit.t.multiattack.iter().any(|c| c.contains(&key)) {
                        match groups.iter_mut().find(|(k, _)| *k == 1) {
                            Some(e) => {
                                if !e.1.contains(&key) {
                                    e.1.push(key);
                                }
                            }
                            None => groups.push((1, vec![key])),
                        }
                    }
                }
            }
            unit.ma_combos = unit.t.multiattack.clone();
            unit.ma_groups = groups;
            self.narrow_multiattack(u, None);
        }
    }

    /// `weapon_mastery.expire_mastery_start_of_turn`: the Sap markers this
    /// creature applied end ("before the start of your next turn"), whatever
    /// the creature hit (every creature in the battle, dead or alive).
    fn expire_mastery(&mut self, u: usize) {
        for o in 0..self.units.len() {
            if self.units[o].sap == Some(u) {
                self.units[o].sap = None;
                self.notes.sap_expired += 1;
            }
        }
    }

    /// `Battle.end_turn`.
    fn battle_end_turn(&mut self) {
        self.scorching_rays = None;
        let current = self.current();
        self.units[current].champion_movement = 0;
        if self.rule_version >= 8 && !self.units[current].dead() && self.units[current].t.size != "tiny" {
            let size_rank = |size: &str| ["tiny", "small", "medium", "large", "huge", "gargantuan"].iter().position(|&s| s == size);
            let actor = &self.units[current];
            if self.units.iter().enumerate().any(|(i, other)| i != current && !other.dead() && other.pos == actor.pos
                && size_rank(other.t.size) >= size_rank(actor.t.size)) {
                self.units[current].do_prone();
            }
        }
        // before the end-of-turn effects: a cleric Incapacitated only for its
        // own turn (Command) still ends its turns
        self.expire_timed_conditions();
        // `current.resolve_trigger('end_of_turn')`: timed conditions end at the
        // end of the bearer's next turn (one skipped if applied on its own turn).
        let u = self.current();
        let unit = &mut self.units[u];
        if !unit.paralysis.is_empty() {
            let before = unit.paralysis.len();
            let mut kept = Vec::new();
            for &skip in &unit.paralysis {
                if skip {
                    kept.push(false);
                }
            }
            let ended = kept.len() < before;
            unit.paralysis = kept;
            if ended && unit.paralysis.is_empty() {
                unit.remove_status(St::Paralyzed);
            }
        }
        // the barbarian's end-of-turn hook comes first (registered at load)
        let pos = self.units[u].pos;
        if self.incorporeal(u) && self.grid.is_wall(pos.0, pos.1) {
            let damage = self.roll_dice(u, "incorporeal_movement", 1, 10)[0];
            let before = self.web_events.as_ref().map(Vec::len);
            let applied = self.take_damage(u, damage, Dmg::Force, false, None, None);
            if self.rule_version >= 10 {
                if let (Some(index), Some(events)) = (before, &mut self.web_events) {
                    events.insert(index, crate::web_events::WebEv::IncorporealDamage {
                        target: u, roll: damage, applied: applied.unwrap_or(0), round: self.round,
                    });
                }
            }
        }
        self.barbarian_end_of_turn(u);
        self.resolve_trigger(u, HookEv::EndOfTurn);
        // `SourceTurnExpiry.end_of_turn` hooks on this creature: the fear it
        // caused ends at the end of its next turn
        self.source_fear_end_of_turn(u);
        if self.is_lured(u) {
            self.repeat_lure_save(u);
        }
    }

    /// `Battle.end_turn` + `Battle.next_turn` (shared with `WebArena`).
    pub(crate) fn end_and_next_turn(&mut self) {
        self.battle_end_turn();
        self.next_turn();
    }

    /// `Arena._end_turn`.
    pub(crate) fn arena_end_turn(&mut self) {
        if self.trace.on() {
            let who = self.units[self.current()].id.clone();
            self.trace.emit(Ev::EndTurn { who });
        }
        self.end_and_next_turn();
        self.open_turn();
        if self.trace.on() {
            let st = self.digest();
            self.trace.emit(Ev::State(st));
        }
    }

    /// `UndeadArena.advance(autoplay=True)`.
    pub fn advance(&mut self) {
        let actor = self.current();
        let mut n = 0;
        while n < 24 || self.pending_rays(actor).is_some() {
            n += 1;
            if self.finished || !self.can_take_turn(actor) {
                break;
            }
            let Some(action) = self.move_for(actor) else { break };
            self.execute(action);
        }
        if !self.finished {
            self.arena_end_turn();
        }
    }

    /// `run_fight`: advance until the fight ends or the round cap.
    pub fn run(&mut self) {
        self.start();
        while !self.finished && self.round < self.max_rounds {
            self.advance();
        }
        if self.trace.on() {
            self.trace.emit(Ev::End {
                winner: if self.finished { self.winner.map(|t| team_name(t).to_string()) } else { None },
                finished: self.finished,
                round: self.round,
                turns: 0,
                decisions: 0,
                wall_s: 0.0,
                tally: serde_json::Value::Null,
                ext: None,
            });
        }
    }

    /// `UndeadArena._execute` -> `Battle.execute_action` + `_finish_if_needed`.
    pub fn execute(&mut self, act: Act) {
        debug_assert!(act != Act::EndTurn, "End Turn is not an action");
        let src = self.current();
        if self.trace.on() {
            let desc = self.describe(src, &act);
            self.trace.emit(Ev::Act { who: self.units[src].id.clone(), a: desc });
        }
        self.decisions += 1;
        self.execute_action(src, &act);
        self.finish_if_needed();
        if self.trace.on() {
            let st = self.digest();
            self.trace.emit(Ev::State(st));
        }
    }

    /// `Battle.execute_action` (resolve + commit).
    pub(crate) fn execute_action(&mut self, src: usize, act: &Act) {
        if !matches!(act, Act::Move(_)) {
            self.units[src].champion_movement = 0;
        }
        // `Battle.commit` -> `lapse_cleave_window`: any action of the wielder
        // other than the Cleave closes its window
        if !matches!(act, Act::Cleave { .. }) {
            self.lapse_cleave(src);
        }
        match act {
            Act::Move(path) => self.do_move(src, path),
            Act::Attack { atk, target, reaction } => {
                self.do_attack(src, *atk, *target, *reaction);
                self.note_noise(src);
            }
            Act::BlindAttack { atk, square, .. } => {
                self.do_blind_attack(src, *atk, *square);
                self.note_noise(src);
            }
            Act::Dash => {
                let s = self.speed_of(src);
                let u = &mut self.units[src];
                u.movement += s;
                u.action -= 1;
            }
            Act::Disengage => {
                let u = &mut self.units[src];
                u.disengage = true;
                u.action -= 1;
            }
            Act::Dodge => {
                let eligible = self.rule_version < 16
                    || (!self.units[src].incapacitated()
                        && !self.units[src].is_grappled()
                        && self.speed_of(src) > 0);
                let u = &mut self.units[src];
                u.dodge = eligible;
                u.action = (u.action - 1).max(0);
            }
            Act::Stand => {
                // `StandAction.apply`: stand(), then consume half the speed
                self.notes.stands += 1;
                self.units[src].remove_status(St::Prone);
                let cost = self.speed_of(src) / 2;
                let u = &mut self.units[src];
                u.movement = (u.movement - cost).max(0);
            }
            Act::SecondWind => {
                let die = self.units[src].t.second_wind_die;
                let rolls = self.roll_dice(src, "second_wind", die.count, die.sides);
                let amount: i32 = rolls.iter().sum::<i32>() + die.modifier;
                let pos = self.units[src].pos;
                let hp_before = self.units[src].hp;
                self.units[src].second_wind_count -= 1;
                self.heal(src, amount);
                let healed = (self.units[src].hp - hp_before).max(0);
                let u = &mut self.units[src];
                u.bonus = (u.bonus - 1).max(0);
                if self.web_events.is_some() {
                    let roll_fmt = crate::web_events::fmt_dice_roll(die.sides, &rolls, die.modifier, false, amount);
                    self.emit_web(crate::web_events::WebEv::SecondWind { u: src, pos, roll_fmt, healed });
                }
            }
            Act::ActionSurge => {
                let u = &mut self.units[src];
                u.action_surge_count -= 1;
                u.action += 1;
                u.action_surge_flag = true;
            }
            Act::DisengageBonus => {
                // `DisengageAction.apply`: `do_disengage`, a bonus action
                self.notes.disengage_bonus += 1;
                let u = &mut self.units[src];
                u.disengage = true;
                u.bonus = (u.bonus - 1).max(0);
            }
            Act::HideBonus => self.do_hide(src),
            Act::Rage => self.do_rage(src),
            Act::ExtendRage => self.do_extend_rage(src),
            Act::RecklessAttack => {
                // `RecklessAttackAction.apply`: no cost
                self.notes.reckless += 1;
                self.units[src].reckless = true;
            }
            Act::Cleave { atk, target } => {
                self.notes.cleaves += 1;
                self.do_attack_ex(src, *atk, *target, false, true);
                self.note_noise(src);
            }
            Act::Spell(c) => {
                self.do_spell(src, c);
                self.note_noise(src);
            }
            Act::FirstAid { target } => self.do_first_aid(src, *target),
            Act::EscapeGrapple { target } => self.do_escape_grapple(src, *target),
            Act::BreakFree { target } => self.do_break_free(src, *target),
            Act::DropGrapple { target } => self.release_grapple(src, *target),
            Act::NpcAreaAbility { idx, target } => {
                self.do_npc_area_ability(src, *idx, *target);
                self.note_noise(src);
            }
            Act::NpcTeleport { idx, dest } => self.do_npc_teleport(src, *idx, *dest),
            Act::LuringSong => {
                self.do_luring_song(src);
                self.note_noise(src);
            }
            Act::NpcVanish => self.do_npc_vanish(src),
            other => self.do_feature(src, other),
        }
        // the end of `Battle.commit`: conditions whose source dropped or lapsed end
        self.expire_timed_conditions();
    }

    // ------------------------------------------------------------------
    // Movement
    // ------------------------------------------------------------------

    pub(crate) fn step_cost(&self, u: usize, to: Pos) -> i32 {
        let difficult = if self.incorporeal(u) {
            self.grid.is_wall(to.0, to.1) || self.token_at(to).is_some_and(|o| o != u)
        } else {
            self.difficult(u, to) && !self.units[u].t.fly
        };
        1 + self.units[u].prone() as i32 + i32::from(difficult) + i32::from(self.drag_penalty(u))
    }

    /// `compute_actual_moves(entity, path, map, battle, budget)` for paths of
    /// 1x1 creatures without jumps; returns (moves, remaining budget).
    pub fn compute_actual_moves(&self, u: usize, path: &[Pos], budget: i32) -> (Vec<Pos>, i32) {
        self.move_prefix(u, path, budget, false)
    }

    fn move_prefix(&self, u: usize, path: &[Pos], budget: i32, in_transit: bool) -> (Vec<Pos>, i32) {
        let mut moves: Vec<Pos> = Vec::with_capacity(path.len());
        let mut budget = budget;
        let frightened = !self.units[u].frightened_by.is_empty() || !self.units[u].source_fear.is_empty();
        for (i, &m) in path.iter().enumerate() {
            if i == 0 {
                moves.push(m);
                continue;
            }
            // Frightened: no willing step closer to a source (`fear.step_toward_fear`, N20-042)
            if frightened && self.step_toward_fear(u, path[i - 1], m) {
                break;
            }
            if !self.passable(u, m) || (self.rule_version >= 5 && !self.step_clears_corner(u, path[i - 1], m)) {
                break;
            }
            let cost = self.step_cost(u, m);
            if self.rule_version >= 7 && budget < cost { break; }
            budget -= cost;
            if budget < 0 { break; }
            moves.push(m);
        }
        while let Some(&last) = moves.last() {
            if in_transit || self.placeable(u, last) {
                break;
            }
            moves.pop();
            if self.rule_version >= 7 { budget += self.step_cost(u, last); }
        }
        (moves, budget)
    }

    pub(crate) fn champion_move_fits(&self, src: usize, path: &[Pos]) -> bool {
        let budget = self.units[src].champion_movement / 5;
        budget > 0 && path.first() == Some(&self.units[src].pos)
            && path.windows(2).all(|step| distance(step[0], step[1]) == 1)
            && self.compute_actual_moves(src, path, budget).0.len() == path.len()
    }

    pub(crate) fn offer_champion_movement(&mut self, src: usize) {
        if !self.champion_moves_enabled || !self.units[src].t.remarkable_athlete || self.units[src].incapacitated() {
            return;
        }
        let budget = self.speed_of(src) / 2;
        self.units[src].champion_movement = budget;
        if src != self.current() && self.interactive_champion != Some(src) {
            let path = std::mem::take(&mut self.units[src].champion_reaction_path);
            if path.first() == Some(&self.units[src].pos) && self.champion_move_fits(src, &path) {
                let moves = self.prepare_move(src, &path);
                self.commit_move_segment(src, moves);
            }
            self.units[src].champion_movement = 0;
        }
    }

    pub(crate) fn prepare_move(&self, src: usize, path: &[Pos]) -> Vec<Pos> {
        let budget = self.units[src].available_movement().div_euclid(5);
        let (mut moves, _) = self.compute_actual_moves(src, path, budget);
        while let Some(&last) = moves.last() {
            if self.placeable(src, last) {
                break;
            }
            moves.pop();
        }
        moves
    }

    pub(crate) fn commit_move_segment(&mut self, src: usize, moves: Vec<Pos>) {
        self.commit_move_prefix(src, moves, false);
    }

    pub(crate) fn commit_move_prefix(&mut self, src: usize, moves: Vec<Pos>, in_transit: bool) {
        if self.units[src].unconscious() || (self.rule_version >= 16 && self.units[src].dead()) {
            self.units[src].movement = 0;
            return;
        }
        if moves.is_empty() {
            return;
        }
        let budget = self.units[src].available_movement().div_euclid(5);
        let (mut seg, rest) = self.move_prefix(src, &moves, budget, in_transit);
        let mut cost = budget - rest;
        while let Some(&last) = seg.last() {
            if in_transit || self.placeable(src, last) {
                break;
            }
            seg.pop();
            cost -= 1;
        }
        let Some(&dest) = seg.last() else { return };
        let champion_move = self.champion_move_fits(src, &seg);
        if self.rule_version >= 11 && self.units.iter().any(Unit::hidden) {
            for &step in seg.iter().skip(1) { self.move_to(src, step); }
        } else {
            self.move_to(src, dest);
        }
        if champion_move {
            self.units[src].champion_movement -= cost * 5;
        } else {
            self.units[src].champion_movement = 0;
            self.units[src].movement -= cost * 5;
        }
        // the path starts on the mover's square
        let trail = &mut self.units[src].trail;
        for &p in &seg {
            if trail.last() != Some(&p) {
                trail.push(p);
            }
        }
        // Dragged grappled targets trail behind the mover (move_action.py:207-231).
        if self.units[src].is_grappling() {
            let dragged = self.units[src].grappling.clone();
            for (i, t) in dragged.into_iter().enumerate() {
                let lag = i + 1;
                if seg.len() > lag {
                    let target_dest = seg[seg.len() - 1 - lag];
                    self.move_to(t, target_dest);
                }
            }
        }
        self.emit_web(crate::web_events::WebEv::MoveExecuted { u: src, path: seg });
    }

    /// `MoveAction.resolve` + `apply`.
    fn do_move(&mut self, src: usize, path: &[Pos]) {
        let mut moves = self.prepare_move(src, path);
        if !self.champion_move_fits(src, path) {
            self.units[src].champion_movement = 0;
            moves = self.check_opportunity_attacks(src, moves);
        }
        self.commit_move_segment(src, moves);
    }

    /// `Map.move_to`.
    pub(crate) fn move_to(&mut self, u: usize, dest: Pos) {
        let from = self.units[u].pos;
        let fi = self.grid.index(from.0, from.1);
        let di = self.grid.index(dest.0, dest.1);
        if self.rule_version >= 7 && self.occ[fi] == Some(u as u8) {
            // An interrupted legal crossing can temporarily share a creature's square.
            self.occ[fi] = self.units.iter().enumerate().find(|(i, unit)| *i != u && unit.pos == from && (self.rule_version < 8 || !unit.dead())).map(|(i, _)| i as u8);
        } else if self.rule_version < 7 { self.occ[fi] = None; }
        if self.rule_version < 8 || !self.units[u].dead() { self.occ[di] = Some(u as u8); }
        self.units[u].pos = dest;
        if dest != from { self.reveal_exposed_hiders(); }
    }

    /// Forced movement traverses each square but does not provoke opportunity attacks.
    pub(crate) fn push_to(&mut self, u: usize, dest: Pos) {
        if self.rule_version >= 11 && self.units.iter().any(Unit::hidden) {
            let mut pos = self.units[u].pos;
            while pos != dest {
                pos.0 += (dest.0 - pos.0).signum();
                pos.1 += (dest.1 - pos.1).signum();
                self.move_to(u, pos);
            }
        } else {
            self.move_to(u, dest);
        }
    }

    /// `opportunity_attack_list` + `retrieve_opportunity_attacks`:
    /// (reactor, index in path where the mover left its reach).
    pub fn opportunity_attacks(&self, mover: usize, path: &[Pos]) -> Vec<(usize, usize)> {
        if self.units[mover].t.flyby && self.units[mover].t.fly {
            return Vec::new();
        }
        let mut entered = vec![false; self.units.len()];
        let mut left = Vec::new();
        for (index, &p) in path.iter().enumerate() {
            for e in 0..self.units.len() {
                if self.units[e].dead() || !self.opposing(e, mover) {
                    continue;
                }
                if self.rule_version >= 16 && self.units[mover].grappling.contains(&e) {
                    continue;
                }
                if !self.units[e].has_reaction() {
                    continue;
                }
                let Some(reach) = self.units[e].t.melee_ft else { continue };
                if self.within_reach(self.units[e].pos, p, reach) {
                    entered[e] = true;
                } else if entered[e] {
                    left.push((e, index));
                    // one opportunity per departure (N20-023)
                    entered[e] = false;
                }
            }
        }
        let disengaged = self.units[mover].disengage;
        left.into_iter().filter(|&(e, _)| self.units[e].has_reaction() && !disengaged).collect()
    }

    /// Execute a single opportunity attack (shared between `Fight::check_opportunity_attacks` and `WebArena::execute_move_with_oas`).
    pub(crate) fn execute_oa_attack(&mut self, reactor: usize, atk: usize, target: usize) {
        // the opportunity attack's commit closes the reactor's Cleave window
        self.lapse_cleave(reactor);
        self.do_attack(reactor, atk, target, true);
        self.note_noise(reactor);
        // the opportunity attack's own `Battle.commit`
        self.expire_timed_conditions();
    }

    /// `MoveAction.check_opportunity_attacks`.
    fn check_opportunity_attacks(&mut self, mover: usize, moves: Vec<Pos>) -> Vec<Pos> {
        let oas = self.opportunity_attacks(mover, &moves);
        let mut cursor = 0;
        for (reactor, index) in oas {
            if self.rule_version >= 7 && index - 1 > cursor {
                self.commit_move_prefix(mover, moves[cursor..index].to_vec(), true);
                cursor = index - 1;
            }
            let was_prone = self.units[mover].prone();
            let original: Vec<Pos> = moves[cursor..index].to_vec();
            if let Some(act) = self.opportunity_attack_listener(reactor, mover) {
                if let Act::Attack { atk, target, .. } = act {
                    self.execute_oa_attack(reactor, atk, target);
                }
            }
            if !self.units[mover].conscious() {
                return original;
            }
            if self.units[mover].prone() && (!was_prone || !self.creature_space_rules) {
                return original;
            }
        }
        moves[cursor..].to_vec()
    }

    // ------------------------------------------------------------------
    // Attacks
    // ------------------------------------------------------------------

    /// `target_advantage_condition` -> (advantage, disadvantage) flags.
    pub fn advantage(&self, src: usize, tgt: usize, def: &AttackDef) -> (bool, bool) {
        self.advantage_flags(src, tgt, self.weapon_kind(src, def))
    }

    /// The attack's [`WeaponKind`], with whether it is a Strength attack of
    /// the attacker (`barbarian.strength_attack`, for Reckless Attack).
    pub fn weapon_kind(&self, src: usize, def: &AttackDef) -> WeaponKind {
        let mut wk = WeaponKind::of(def);
        wk.str_attack = self.units[src].t.reckless_attack && self.strength_attack(src, def);
        wk
    }

    /// `compute_advantages_and_disadvantages` for the scenario's attacks.
    pub fn advantage_flags(&self, src: usize, tgt: usize, wk: WeaponKind) -> (bool, bool) {
        self.attack_modifiers(src, tgt, wk, |_| {}, |_| {})
    }

    /// Compute the dice and their annotations from the same pre-roll state.
    pub(crate) fn attack_roll_modifiers(&self, src: usize, tgt: usize, wk: WeaponKind) -> ((bool, bool), String) {
        if self.web_events.is_none() || self.rule_version < 6 {
            return (self.advantage_flags(src, tgt, wk), String::new());
        }
        let (mut advantages, mut disadvantages) = (Vec::new(), Vec::new());
        let flags = self.attack_modifiers(src, tgt, wk, |r| advantages.push(r), |r| disadvantages.push(r));
        let mut reasons = Vec::new();
        if !advantages.is_empty() { reasons.push(format!("Advantage from {}", advantages.join(", "))); }
        if !disadvantages.is_empty() { reasons.push(format!("Disadvantage from {}", disadvantages.join(", "))); }
        if flags == (true, true) { reasons.push("the two cancel".to_string()); }
        let note = if reasons.is_empty() { String::new() } else { format!(" [{}]", reasons.join("; ")) };
        (flags, note)
    }

    fn attack_modifiers(&self, src: usize, tgt: usize, wk: WeaponKind, mut on_adv: impl FnMut(&'static str),
                        mut on_dis: impl FnMut(&'static str)) -> (bool, bool) {
        let (mut advantageous, mut disadvantageous) = (false, false);
        let mut adv = |reason| { advantageous = true; on_adv(reason); };
        let mut dis = |reason| { disadvantageous = true; on_dis(reason); };
        let s = &self.units[src];
        let t = &self.units[tgt];
        let current = self.rule_version >= 6;
        if s.t.pack_tactics && self.units.iter().enumerate().any(|(i, ally)|
            i != src && self.allies(src, i) && !ally.incapacitated() && self.dist(i, tgt) <= 1) {
            adv("Pack Tactics");
        }
        if self.has_effect(tgt, EffKey::TargetedAdvantageOverride) { adv("Guiding Bolt"); }
        if wk.spell && self.innate_active(src) { adv("Innate Sorcery"); }
        for obj in self.active_effects(tgt, EffKey::AttackedAdvantageModifier) {
            let o = &self.objs[obj as usize];
            if o.spell == SpellId::ProtectionFromEvilAndGood && s.t.pfeg_protected { dis("Protection from Evil and Good"); }
            if matches!(o.kind, crate::effects::ObjKind::Blur) && !self.ignores_blur(src, tgt) { dis("Blur"); }
        }
        if t.t.blurred_form && !t.incapacitated() {
            dis("Blurred Form");
        }
        if wk.adv_if_grappled_by_source && t.grappled_by.iter().any(|&(g, _)| g == src) {
            adv("target grappled");
        }
        let gt = self.gt();
        if s.frightened_by.iter().any(|&(f, until, _)| gt < until && !self.units[f].dead() && self.can_see(src, f))
            || s.source_fear.iter().any(|&(f, _)| !self.units[f].dead() && self.can_see(src, f)) { dis("Frightened"); }
        if s.prone() { dis("attacker prone"); }
        if s.poisoned() { dis("attacker poisoned"); }
        if self.is_restrained(src) { dis("attacker restrained"); }
        if self.is_restrained(tgt) { adv("target restrained"); }
        if s.is_grappled() && !s.grappled_by.iter().any(|&(g, _)| g == tgt) { dis("grappled"); }
        if t.has(St::Paralyzed) { adv("target paralyzed"); }
        if current && t.unconscious() { adv("target unconscious"); }
        if t.prone() {
            let adjacent = self.feet(src, tgt) <= 5;
            if (current && adjacent) || (!current && wk.melee) { adv("target prone"); }
            if (current && !adjacent) || (!current && wk.ranged) { dis("target prone at range"); }
        }
        let visible_to_target = self.can_see(tgt, src);
        if t.dodge && (!current || self.benefits_from_dodge(tgt) && visible_to_target) { dis("target dodging"); }
        if !visible_to_target { adv("unseen attacker"); }
        if !self.can_see(src, tgt) { dis("unseen target"); }
        if s.sap.is_some() { dis("Sap"); }
        if wk.ranged {
            if self.ranged_attack_threatened(src) { dis("enemy in close combat"); }
            if self.feet(src, tgt) > wk.range { dis("long range"); }
        }
        if wk.str_attack && s.reckless { adv("Reckless Attack"); }
        if t.reckless { adv("target used Reckless Attack"); }
        (advantageous, disadvantageous)
    }

    pub(crate) fn benefits_from_dodge(&self, u: usize) -> bool {
        self.units[u].dodge && !self.units[u].incapacitated() && self.speed_of(u) > 0
    }

    pub(crate) fn lose_dodge_if_ineligible(&mut self, u: usize) {
        if self.rule_version >= 13 && self.units[u].dodge && !self.benefits_from_dodge(u) {
            self.units[u].dodge = false;
        }
    }

    fn ranged_attack_threatened(&self, src: usize) -> bool {
        if self.rule_version < 6 { return self.enemy_in_melee_range(src); }
        self.units.iter().enumerate().any(|(i, unit)| self.opposing(i, src) && !unit.incapacitated()
            && self.feet(i, src) <= 5 && self.can_see(i, src))
    }

    #[inline]
    pub fn mode_of(adv: bool, dis: bool) -> RollMode {
        let ctr = adv as i32 - dis as i32;
        if ctr > 0 {
            RollMode::Advantage
        } else if ctr < 0 {
            RollMode::Disadvantage
        } else {
            RollMode::Normal
        }
    }

    /// Attack bonus, damage dice and Graze damage of an attack. Hero weapon
    /// numbers follow the current Strength (`attack_roll_mod` = ability mod +
    /// PB, `damage_modifier` = ability mod; a finesse weapon takes the better
    /// of STR and DEX), so Strength drain lowers them; a versatile weapon uses
    /// its two-handed die while at most one hand slot is in use.
    pub fn attack_numbers(&self, u: usize, atk: usize) -> (i32, Dice, Option<i32>) {
        self.attack_numbers_ex(u, atk, false)
    }

    /// [`Fight::attack_numbers`]; `no_ability_mod` (Cleave's extra attack):
    /// the damage adds the ability modifier only if negative. A raging
    /// barbarian's Strength attacks add Rage Damage (`damage_modifier`).
    pub fn attack_numbers_ex(&self, u: usize, atk: usize, no_ability_mod: bool) -> (i32, Dice, Option<i32>) {
        let unit = &self.units[u];
        let def = &unit.t.attacks[atk];
        if !unit.t.pc {
            return (def.to_hit, def.damage, def.graze);
        }
        let m = match def.ability {
            AtkAbility::Finesse => unit.str_mod().max(ability_mod(unit.t.abil[1])),
            _ => unit.str_mod(),
        };
        let die = match def.versatile {
            Some(v) if self.used_hand_slots(u) <= 1.0 => v,
            _ => def.damage,
        };
        let mut dm = if no_ability_mod { m.min(0) } else { m };
        if unit.t.barbarian && self.is_raging(u) && def.melee_type && m == unit.str_mod() {
            dm += unit.t.rage_damage;
        }
        (m + unit.t.prof_bonus, Dice::new(die.count, die.sides, dm), def.graze.map(|_| m))
    }

    /// `Entity.used_hand_slots()`: equipped weapons and shields.
    pub fn used_hand_slots(&self, u: usize) -> f64 {
        let unit = &self.units[u];
        let mut total = 0.0;
        for (i, g) in unit.t.gear.iter().enumerate() {
            if unit.gear_off & (1 << i) == 0 {
                total += g.1;
            }
        }
        total
    }

    /// The attack's weapon is still equipped (`_player_character_attack_actions`
    /// lists the equipped items; a thrown weapon's last copy leaves), and an
    /// NPC attack made with an inventory item has one left
    /// (`Npc.attack_options`: `item_count(item) > 0`, opportunity attacks too).
    #[inline]
    pub fn attack_available(&self, u: usize, atk: usize) -> bool {
        let unit = &self.units[u];
        let def = &unit.t.attacks[atk];
        if def.recharge.is_some() && unit.recharge_spent.contains(&def.name) {
            return false;
        }
        if let Some(k) = def.npc_item {
            return unit.items[k as usize] > 0;
        }
        match def.item {
            Some(i) => unit.gear_off & (1 << i) == 0,
            None => true,
        }
    }

    /// `Entity.multiattack(battle, npc_action)`.
    fn npc_multiattack(&self, u: usize, def: &AttackDef) -> bool {
        let unit = &self.units[u];
        if unit.t.multiattack.is_empty() || unit.ma_groups.is_empty() || def.multiattack_group.is_none() {
            return false;
        }
        unit.ma_groups.iter().any(|(_, names)| names.contains(&def.name))
    }

    /// `AttackAction.can(entity, battle, {'npc_action': ...})` on the creature's turn.
    pub fn can_attack(&self, u: usize, atk: usize) -> bool {
        let unit = &self.units[u];
        let def = &unit.t.attacks[atk];
        if def.bonus_action {
            return unit.bonus > 0;
        }
        if unit.action > 0 {
            return true;
        }
        if self.npc_multiattack(u, def) {
            return unit.ma_started;
        }
        false
    }

    /// `narrow_multiattack_groups(entity_state, used_name)`.
    pub(crate) fn narrow_multiattack(&mut self, u: usize, used: Option<&'static str>) {
        let unit = &mut self.units[u];
        if unit.ma_combos.is_empty() {
            return;
        }
        if let Some(name) = used {
            let mut remaining = Vec::new();
            for combo in &unit.ma_combos {
                if let Some(i) = combo.iter().position(|n| *n == name) {
                    let mut c = combo.clone();
                    c.remove(i);
                    remaining.push(c);
                }
            }
            unit.ma_combos = remaining;
        }
        let mut allowed: Vec<(&'static str, usize)> = Vec::new();
        for combo in &unit.ma_combos {
            let mut counts: Vec<(&'static str, usize)> = Vec::new();
            for n in combo {
                match counts.iter_mut().find(|(k, _)| k == n) {
                    Some(e) => e.1 += 1,
                    None => counts.push((n, 1)),
                }
            }
            for (n, c) in counts {
                match allowed.iter_mut().find(|(k, _)| *k == n) {
                    Some(e) => e.1 = e.1.max(c),
                    None => allowed.push((n, c)),
                }
            }
        }
        for (_, attacks) in unit.ma_groups.iter_mut() {
            let mut names: Vec<&'static str> = Vec::new();
            for n in attacks.iter() {
                if !names.contains(n) {
                    names.push(n);
                }
            }
            let mut out = Vec::new();
            for n in names {
                let k = allowed.iter().find(|(a, _)| *a == n).map(|e| e.1).unwrap_or(0);
                for _ in 0..k {
                    out.push(n);
                }
            }
            *attacks = out;
        }
    }

    /// `Multiattack.clear_multiattack`.
    pub(crate) fn clear_multiattack(&mut self, u: usize) {
        let unit = &mut self.units[u];
        unit.ma_groups.clear();
        unit.ma_combos.clear();
        unit.ma_started = false;
    }

    /// `AttackAction.resolve` + `_resolve_hit` (all draws), then the commit of
    /// its result items in order.
    pub(crate) fn do_attack(&mut self, src: usize, atk: usize, tgt: usize, reaction: bool) {
        self.do_attack_ex(src, atk, tgt, reaction, false)
    }

    /// The attack's resource use: [`Fight::consume_attack`], or for a Cleave
    /// (`_free_attack`, `_cleave`) the window used up and stealth broken.
    fn spend_attack(&mut self, src: usize, atk: usize, reaction: bool, cleave: bool) {
        if cleave {
            let u = &mut self.units[src];
            u.cleave = None;
            u.cleave_used = true;
            u.break_stealth();
        } else {
            self.consume_attack(src, atk, reaction);
        }
    }

    /// `AttackAction` resolve + commit; `cleave`: the Cleave mastery's extra
    /// attack (`CleaveAttackAction`: free, no positive ability modifier to
    /// damage, opens no window).
    pub(crate) fn do_attack_ex(&mut self, src: usize, atk: usize, tgt: usize, reaction: bool, cleave: bool) {
        self.do_attack_inner(src, atk, tgt, reaction, cleave, None);
    }

    fn do_attack_inner(
        &mut self,
        src: usize,
        atk: usize,
        tgt: usize,
        reaction: bool,
        cleave: bool,
        blind_occupant: Option<usize>,
    ) {
        let mut tgt = tgt;
        let t = self.units[src].t;
        let def: &'static AttackDef = &t.attacks[atk];
        let atk_name = crate::web_events::pc_or_npc_attack_name(t.pc, def.name);
        let (to_hit, dmg, graze) = self.attack_numbers_ex(src, atk, cleave);
        let hit;
        let crit;
        let mut base: Vec<i32>;
        let count;
        let mut dismiss: Vec<(usize, u32)> = Vec::new();
        let mut force_miss = false;
        let mut shield_cast = None;
        let mut atk_roll_fmt: Option<String> = None;
        let mut atk_roll_fmt_blind: Option<String> = None;
        // the roll had Advantage and no Disadvantage (`advantage_mod > 0`):
        // `condition: advantage` riders apply
        let mut had_adv = false;
        if self.units[src].hidden() {
            self.notes.hidden_attacks += 1;
        }
        if def.save_attack.is_none() && tgt != src && self.has_effect(tgt, EffKey::TargetingWard) {
            // `attack_ward_items`: Sanctuary
            if let Some(obj) = self.last_effect(tgt, EffKey::TargetingWard) {
                if let crate::effects::ObjKind::Sanctuary { dc, .. } = self.objs[obj as usize].kind {
                    let total = self.save_throw(src, Ability::Wis);
                    self.emit_web(crate::web_events::WebEv::SanctuarySave { attacker: src, warded: tgt, total, dc });
                    if total < dc {
                        self.spend_attack(src, atk, reaction, cleave);
                        return;
                    }
                }
            }
        }
        if let Some((ab, dc)) = def.save_attack {
            // `_resolve_save_attack`: the target saves; a failure is a hit
            // (no attack roll, so no critical hit).
            if def.breaks_invisibility {
                self.resolve_trigger(src, HookEv::AttackResolved);
            }
            let cover = self.save_cover(self.units[src].pos, tgt, ab);
            let total = self.save_throw_with_cover(tgt, ab, false, cover).0;
            if total >= dc {
                if def.save_immune {
                    // `grant_save_immunity` (the miss item's `save_immunity`)
                    if !self.units[tgt].save_immune_to.contains(&(src, def.name)) {
                        self.units[tgt].save_immune_to.push((src, def.name));
                    }
                }
                if def.on_hit.iter().any(|o| matches!(o, OnHit::Frighten)) {
                    self.notes.glare_save += 1;
                }
                if blind_occupant != Some(tgt) {
                    let sp = self.units[src].pos;
                    let tp = self.units[tgt].pos;
                    self.emit_web(crate::web_events::WebEv::AttackOutcome {
                        src,
                        tgt: Some(tgt),
                        src_pos: sp,
                        tgt_pos: tp,
                        attack_name: atk_name,
                        spell_style: None,
                        ranged_weapon: def.ranged,
                        hit: false,
                        crit: false,
                        reaction,
                        save: Some(SaveOutcome::Made),
                        dt: None,
                        raw_damage: 0,
                        applied_damage: 0,
                        atk_roll_fmt: None,
                        dmg_roll_fmt: None,
                    });
                }
                self.spend_attack(src, atk, reaction, cleave);
                return;
            }
            if def.drop_to_zero_hp_lte.is_some_and(|lte| !self.units[tgt].dead() && self.units[tgt].hp <= lte) {
                self.units[tgt].hp = 0;
                if !self.units[tgt].t.pc {
                    self.make_dead(tgt);
                } else {
                    self.make_unconscious(tgt);
                }
                self.spend_attack(src, atk, reaction, cleave);
                return;
            }
            hit = true;
            crit = false;
            count = dmg.count;
            base = if dmg.sides > 0 { self.roll_dice(src, "damage", count, dmg.sides) } else { vec![dmg.count] };
        } else {
            let ((adv, dis), reasons) = self.attack_roll_modifiers(src, tgt, self.weapon_kind(src, def));
            had_adv = adv && !dis;
            // the real attack roll spends a Sap marker (`consume_sap_disadvantage`)
            if self.units[src].sap.is_some() {
                self.units[src].sap = None;
                self.notes.sap_spent += 1;
            }
            let mode = Fight::mode_of(adv, dis);
            let mod_val = plus_string_modifier(to_hit);
            let (face, dv) = self.roll_d20_raw(src, "attack", mode);
            let mut total = face + mod_val;
            let bless = if self.has_effect(src, EffKey::Bless) {
                let b = self.roll_dice(src, "bless", 1, 4)[0];
                total += b;
                Some(b)
            } else {
                None
            };
            if self.web_events.is_some() {
                atk_roll_fmt = Some(crate::web_events::fmt_d20_roll(dv, mode, mod_val, bless) + &reasons);
            }
            self.resolve_trigger(src, HookEv::AttackResolved);
            // the target's attack-roll reactions (`npc_reactions`: Redirect
            // Attack): the roll stands, the target may change
            if let Some(ally) = self.redirect_window(src, tgt, face, total, true, self.units[src].pos) {
                tgt = ally;
            }
            let ac = self.attack_ac(self.units[src].pos, tgt);
            dismiss = self.resolve_trigger(tgt, HookEv::AfterAttackRollTarget);
            if self.units[tgt].t.pc {
                self.units[tgt].pools_init = true;
            }
            // `nat_20()` / `nat_1()` read the selected face (the two dice of
            // advantage/disadvantage are independent and can be equal)
            let nat20 = face == 20;
            let nat1 = face == 1;
            // the target's reaction spells (`ShieldSpell.after_attack_roll`)
            if let Some((blocks, at_level)) = self.shield_reaction(tgt, total, ac, nat20, nat1) {
                force_miss = blocks;
                shield_cast = Some((at_level, total, ac));
            }
            atk_roll_fmt_blind = if blind_occupant == Some(tgt) { atk_roll_fmt.clone() } else { None };
            self.describe_attack_cover(&mut atk_roll_fmt, tgt, ac, shield_cast.is_some());
            let mut c = nat20 || (t.improved_critical && face >= 19);
            let critical_roll = c;
            // `weapon.get('type') == 'melee_attack'`: a thrown dagger too
            if !c
                && (self.units[tgt].has(St::Paralyzed) || self.units[tgt].unconscious())
                && def.melee_type
                && self.dist(src, tgt) * 5 <= 5
            {
                c = true;
            }
            crit = c;
            count = if dmg.sides > 0 && crit { dmg.count * 2 } else { dmg.count };
            base = if dmg.sides > 0 { self.roll_dice(src, "damage", count, dmg.sides) } else { vec![dmg.count] };
            if def.gwf && t.great_weapon_fighting && dmg.sides > 0 {
                apply_gwf(&mut base);
            }
            hit = if critical_roll {
                true
            } else if nat1 {
                false
            } else {
                total >= ac && !force_miss
            };
            self.reaction_scan(src, tgt, !nat1 && (nat20 || total >= ac));
        }
        for (holder, obj) in std::mem::take(&mut dismiss) {
            self.dismiss_effect(holder, obj);
        }
        if let Some((slot_level, total, ac)) = shield_cast {
            self.apply_shield(tgt);
            self.emit_web(crate::web_events::WebEv::ShieldCast {
                u: tgt, pos: self.units[tgt].pos, slot_level, attacker: src, attack_name: atk_name, total, ac,
            });
        }
        if !hit {
            // `consume_resource` of the miss item (an attack roll was made)
            if def.save_attack.is_none() {
                self.note_attack_roll(src, Some(tgt), def, false);
            }
            if blind_occupant != Some(tgt) {
                let sp = self.units[src].pos;
                let tp = self.units[tgt].pos;
                self.emit_web(crate::web_events::WebEv::AttackOutcome {
                    src,
                    tgt: Some(tgt),
                    src_pos: sp,
                    tgt_pos: tp,
                    attack_name: atk_name,
                    spell_style: None,
                    ranged_weapon: def.ranged,
                    hit: false,
                    crit: false,
                    reaction,
                    save: None,
                    dt: None,
                    raw_damage: 0,
                    applied_damage: 0,
                    atk_roll_fmt,
                    dmg_roll_fmt: None,
                });
            } else {
                let sp = self.units[src].pos;
                let tp = self.units[tgt].pos;
                self.emit_web(crate::web_events::WebEv::BlindMiss {
                    src,
                    src_pos: sp,
                    square: tp,
                    attack_name: atk_name,
                    ranged_weapon: def.ranged,
                    atk_roll_fmt: atk_roll_fmt_blind,
                });
            }
            self.spend_attack(src, atk, reaction, cleave);
            if let Some(m) = graze {
                if m > 0 {
                    // `attack_action.py:404-421`: `take_damage` (Undead Fortitude / dissolve) runs BEFORE `weapon_mastery` (`GRAZE`)!
                    let sp2 = self.units[src].pos;
                    let tp2 = self.units[tgt].pos;
                    let index = self.web_events.as_ref().map(Vec::len);
                    let applied = self.take_damage(tgt, m, def.damage_type, false, None, None).unwrap_or(0).max(0);
                    if let (Some(i), Some(events)) = (index, &mut self.web_events) {
                        let current = self.rule_version >= 6;
                        let effect = crate::web_events::WebEv::Graze { src, tgt, src_pos: sp2, tgt_pos: tp2,
                            dmg: if current { applied } else { m }, dt: def.damage_type };
                        if current { events.insert(i, effect); } else { events.push(effect); }
                    }
                }
            }
            return;
        }
        if let Some(occ) = blind_occupant {
            self.emit_web(crate::web_events::WebEv::BlindHitTarget { target: occ });
        }
        // Savage Attacker: the first weapon hit of each turn rolls the weapon
        // dice again (Great Weapon Fighting applied) and keeps the higher sum.
        let key = (self.round, self.turn_idx);
        if t.savage_attacker && def.savage && dmg.sides > 0 && self.units[src].savage_turn != Some(key) {
            self.units[src].savage_turn = Some(key);
            let mut second = self.roll_dice(src, "savage_attacker", count, dmg.sides);
            if def.gwf && t.great_weapon_fighting {
                apply_gwf(&mut second);
            }
            if second.iter().sum::<i32>() > base.iter().sum::<i32>() {
                std::mem::swap(&mut base, &mut second);
            }
            if self.rule_version >= 14 && self.web_events.is_some() {
                self.emit_web(crate::web_events::WebEv::SavageRoll { source: src, sides: dmg.sides, kept: base.clone(), discarded: second });
            }
        }
        // Berserker Frenzy: Rage Damage d6s on the turn's first Strength hit
        // while raging and reckless (doubled on a critical hit)
        let mut frenzy = 0;
        let mut frenzy_rolls: Option<Vec<i32>> = None;
        if def.save_attack.is_none() {
            if let Some(n) = self.frenzy_dice(src, def) {
                self.notes.frenzy_hits += 1;
                let rolls = self.roll_dice(src, "frenzy", if crit { n * 2 } else { n }, 6);
                frenzy = rolls.iter().sum::<i32>();
                frenzy_rolls = Some(rolls);
            }
        }
        // Cleave: the window this hit opens (`cleave_window_item`, at resolve)
        let window = if cleave || def.save_attack.is_some() { None } else { self.cleave_window(src, atk, tgt) };
        // `_on_hit_riders`: additional damage dice (`condition: advantage`
        // ones only if the roll had Advantage; never on a save attack)
        let mut riders: Vec<(i32, Dmg, Option<String>)> = Vec::new();
        for (d, dt) in &def.additional {
            let n = if crit { d.count * 2 } else { d.count };
            let rolls = self.roll_dice(src, "additional_damage", n, d.sides);
            let value = rolls.iter().sum::<i32>() + d.modifier;
            let detail = (self.rule_version >= 10 && self.web_events.is_some()).then(||
                crate::web_events::fmt_dice_roll(d.sides, &rolls, d.modifier, false, value));
            riders.push((value, *dt, detail));
        }
        if had_adv && !def.additional_adv.is_empty() {
            self.notes.adv_riders += 1;
            for (d, dt) in &def.additional_adv {
                let n = if crit { d.count * 2 } else { d.count };
                let rolls = self.roll_dice(src, "additional_damage", n, d.sides);
                let value = rolls.iter().sum::<i32>() + d.modifier;
                let detail = (self.rule_version >= 7 && self.web_events.is_some()).then(||
                    crate::web_events::fmt_dice_roll(d.sides, &rolls, d.modifier, false, value));
                riders.push((value, *dt, detail));
            }
        }
        // `resolve_mastery_on_hit`: Sap marks the creature hit (one marker;
        // set at resolve, no draw)
        if def.sap {
            self.units[tgt].sap = Some(src);
            self.notes.sap_applied += 1;
        }
        // `on_hit` effects: saves are rolled now, effects applied at commit
        let mut effects: Vec<HitEffect> = Vec::new();
        for oh in &def.on_hit {
            match *oh {
                OnHit::SaveCondition { ability, dc, condition, not_undead, not_elf } => {
                    let tt = self.units[tgt].t;
                    if (not_undead && tt.undead) || (not_elf && tt.elf) {
                        continue;
                    }
                    let cover = self.save_cover(self.units[src].pos, tgt, ability);
                    let total = self.save_throw_with_cover(tgt, ability, false, cover).0;
                    if total < dc {
                        effects.push(HitEffect::Condition(condition));
                    }
                }
                OnHit::LifeDrain => effects.push(HitEffect::LifeDrain),
                OnHit::StrengthDrain => effects.push(HitEffect::StrengthDrain),
                OnHit::Curse => effects.push(HitEffect::Curse),
                OnHit::Frighten => effects.push(HitEffect::Frighten),
                OnHit::Push { feet, max_size_rank } => {
                    if max_size_rank.map_or(true, |m| self.units[tgt].t.size_rank <= m) {
                        effects.push(HitEffect::Push { distance: feet });
                    }
                }
                OnHit::Grapple { escape_dc, max_size_rank } => {
                    if max_size_rank.map_or(true, |m| self.units[tgt].t.size_rank <= m) {
                        effects.push(HitEffect::Grapple { escape_dc: Some(escape_dc) });
                    }
                }
                OnHit::Charm { start_of_source_next_turn, repeat_save_when_harmed, .. } => {
                    let duration = if start_of_source_next_turn { Some("start_of_source_next_turn") } else { None };
                    effects.push(HitEffect::Charm { duration, save_dc: None, repeat_save_when_harmed });
                }
                OnHit::ConsumeLife { heal_die } => {
                    effects.push(HitEffect::ConsumeLife { heal_die });
                }
            }
        }
        // commit: the damage item, then riders and effects in order
        let amount: i32 = base.iter().sum::<i32>() + frenzy + dmg.modifier;
        let mut hs = HitState { kill_at_zero: def.kill_at_zero, ..HitState::default() };
        // a `no_damage` action has no damage event (`damage_event` skipped)
        let combined = self.rule_version >= 7 && !def.no_damage && !riders.is_empty();
        let mut rider_applied = Vec::new();
        let mut rider_offset = self.web_events.as_ref().map(|events| events.len() + usize::from(!def.no_damage));
        let applied = if def.no_damage {
            None
        } else {
            let sp = self.units[src].pos;
            let tp = self.units[tgt].pos;
            let dmg_roll_fmt = if self.web_events.is_some() {
                Some(crate::web_events::fmt_weapon_damage_roll(
                    dmg.sides,
                    &base,
                    dmg.modifier,
                    frenzy_rolls.as_deref(),
                    amount,
                    self.rule_version >= 5,
                ))
            } else {
                None
            };
            let ev_idx = self.web_events.as_ref().map(|b| b.len());
            self.emit_web(crate::web_events::WebEv::AttackOutcome {
                src,
                tgt: Some(tgt),
                src_pos: sp,
                tgt_pos: tp,
                attack_name: atk_name,
                spell_style: None,
                ranged_weapon: def.ranged,
                hit: true,
                crit,
                reaction,
                save: def.save_attack.map(|_| SaveOutcome::Failed),
                dt: Some(def.damage_type),
                raw_damage: amount,
                applied_damage: 0,
                atk_roll_fmt,
                dmg_roll_fmt,
            });
            let app = if combined {
                // Apply resistance to each damage type once, before the hit changes the target.
                let base = self.adjusted_damage(tgt, amount, def.damage_type).unwrap_or(0);
                let mut raw = vec![(def.damage_type, amount.max(0))];
                let mut total = base;
                let mut temp = (self.units[tgt].temp_hp - base).max(0);
                let mut fortitude_type = def.damage_type;
                for &(value, dt, _) in &riders {
                    let before = raw.iter().find(|(d, _)| *d == dt).map_or(0, |(_, n)| *n);
                    let after = before + value.max(0);
                    let delta = self.adjusted_damage(tgt, after, dt).unwrap_or(0)
                        - self.adjusted_damage(tgt, before, dt).unwrap_or(0);
                    if let Some((_, n)) = raw.iter_mut().find(|(d, _)| *d == dt) { *n = after; }
                    else { raw.push((dt, after)); }
                    rider_applied.push((delta - temp).max(0));
                    temp = (temp - delta).max(0);
                    total += delta;
                    if delta > 0 && self.units[tgt].t.undead_fortitude.is_some_and(|(_, bypass)| bypass & dt.bit() != 0) {
                        fortitude_type = dt;
                    }
                }
                let base_applied = (base - self.units[tgt].temp_hp).max(0);
                if amount != 0 && src != tgt { self.resolve_trigger(src, HookEv::DealtDamage); }
                if total > 0 { self.apply_adjusted_damage(tgt, total, fortitude_type, crit, Some(&mut hs), Some(src)); }
                Some(base_applied)
            } else {
                self.damage_event(src, tgt, amount, def.damage_type, crit, &mut hs)
            };
            if let (Some(idx), Some(buf)) = (ev_idx, &mut self.web_events) {
                if let crate::web_events::WebEv::AttackOutcome { applied_damage, .. } = &mut buf[idx] {
                    *applied_damage = app.unwrap_or(0).max(0);
                }
            }
            app
        };
        if def.sap && !self.units[tgt].dead() {
            self.emit_web(crate::web_events::WebEv::SapApplied { source: src, target: tgt });
        }
        if crit {
            self.offer_champion_movement(src);
        }
        // `consume_resource`: a hero's thrown weapon lands at the target's
        // square, hit or miss (N20-041 fixed; natural20 puts it on the
        // square's Ground object, which nothing in a fight reads). It no
        // longer enters the target's inventory, so a Goblin Minion hit by a
        // thrown dagger does not gain one.
        if def.save_attack.is_none() {
            self.note_attack_roll(src, Some(tgt), def, true);
        }
        self.spend_attack(src, atk, reaction, cleave);
        if let Some(cands) = window {
            // `open_cleave_window` (the item's commit)
            self.notes.cleave_windows += 1;
            self.units[src].cleave = Some((atk, cands));
        }
        for (index, (amount, dt, roll)) in riders.into_iter().enumerate() {
            if !combined && self.units[tgt].dead() {
                continue;
            }
            let before = self.web_events.as_ref().map(Vec::len);
            let applied = if combined { Some(rider_applied[index]) } else { self.take_damage(tgt, amount, dt, crit, Some(&mut hs), Some(src)) };
            if let (Some(before), Some(amount), Some(events)) = (before, applied, &mut self.web_events) {
                let (plain_roll, advantage_roll) = if index < def.additional.len() { (roll, None) } else { (None, roll) };
                let event = crate::web_events::WebEv::RiderDamage {
                    tgt, applied_damage: amount.max(0), dt, plain_roll, advantage_roll,
                };
                if self.rule_version >= 6 {
                    let next = rider_offset.as_mut().unwrap();
                    events.insert(*next, event);
                    *next += 1;
                } else if self.rule_version >= 5 {
                    events.insert(before, event);
                } else {
                    events.push(event);
                }
            }
        }
        for e in effects {
            match e {
                HitEffect::Condition(Condition::Paralyzed) => {
                    if !self.units[tgt].dead() && !self.units[tgt].t.immune_paralyzed {
                        let own_turn = self.started && !self.order.is_empty() && self.current() == tgt;
                        let unit = &mut self.units[tgt];
                        unit.add_status(St::Paralyzed);
                        unit.paralysis.push(own_turn);
                        // `TimedConditionEffect.apply_to`: Incapacitated ends a rage
                        self.lose_dodge_if_ineligible(tgt);
                        self.end_rage_if_incapacitated(tgt);
                    }
                }
                HitEffect::LifeDrain => {
                    let drained = applied.unwrap_or(0);
                    self.reduce_max_hp(tgt, drained);
                }
                HitEffect::Curse => {
                    // `NoHealingEffect.apply_to(indefinite=True)`: one curse per creature
                    if !self.units[tgt].dead() && !self.units[tgt].cursed {
                        let unit = &mut self.units[tgt];
                        unit.cursed = true;
                        if !unit.effect_key_order.contains(&crate::effects::MarkSlot::HealOverride) {
                            unit.effect_key_order.push(crate::effects::MarkSlot::HealOverride);
                        }
                        self.notes.curses += 1;
                    }
                }
                HitEffect::Frighten => {
                    self.notes.glare_fail += 1;
                    self.apply_source_fear(tgt, src);
                }
                HitEffect::Push { distance } => {
                    if !self.units[tgt].dead() {
                        let dest = self.push_square_dist(tgt, self.units[src].pos, &[], distance);
                        if dest != self.units[tgt].pos && self.token_at(dest).map_or(true, |o| o == tgt) {
                            self.move_to(tgt, dest);
                            self.prune_grapples_around(tgt);
                        }
                    }
                }
                HitEffect::Grapple { escape_dc } => {
                    if !self.units[tgt].dead() && !self.units[tgt].t.immune_grappled {
                        self.apply_grapple(src, tgt, escape_dc);
                    }
                }
                HitEffect::Charm { duration, save_dc, repeat_save_when_harmed } => {
                    self.apply_charm(tgt, src, save_dc, duration, repeat_save_when_harmed, false, None);
                }
                HitEffect::ConsumeLife { heal_die } => {
                    if !self.units[tgt].dead() {
                        self.make_dead(tgt);
                    }
                    if !self.units[src].dead() {
                        let rolls = self.roll_dice(src, "heal", heal_die.count, heal_die.sides);
                        let healed: i32 = rolls.iter().sum::<i32>() + heal_die.modifier;
                        self.heal(src, healed);
                    }
                }
                HitEffect::StrengthDrain => {
                    let v = self.trace.draw("", "fn:apply", 4, RollMode::Normal).one();
                    let sp = self.units[src].pos;
                    let tp = self.units[tgt].pos;
                    let strength_before = self.units[tgt].strength();
                    let event_index = self.web_events.as_ref().map(Vec::len);
                    if strength_before - v < 1 {
                        self.make_dead(tgt);
                    } else {
                        let unit = &mut self.units[tgt];
                        unit.str_drain = Some(unit.str_drain.unwrap_or(0) + v);
                        if !unit.effect_key_order.contains(&crate::effects::MarkSlot::StrengthOverride) {
                            unit.effect_key_order.push(crate::effects::MarkSlot::StrengthOverride);
                        }
                    }
                    // `attack_action.py:498`: `'died': target.dead()`
                    let is_dead = self.units[tgt].dead();
                    if let (Some(index), Some(events)) = (event_index, &mut self.web_events) {
                        let event = crate::web_events::WebEv::StrengthDrain {
                            attacker: src, target: tgt, src_pos: sp, tgt_pos: tp,
                            drain: v, strength_before, died: is_dead,
                        };
                        if self.rule_version >= 12 {
                            events.insert(index, event); // Roll before a death caused by the drain.
                        } else {
                            events.push(event);
                        }
                    }
                }
            }
        }
    }

    /// `monster_traits.reduce_max_hp`.
    fn reduce_max_hp(&mut self, u: usize, amount: i32) {
        if amount <= 0 || self.units[u].dead() {
            return;
        }
        let before = self.max_hp_of(u);
        self.units[u].max_hp_reduction += amount;
        let mhp = self.max_hp_of(u);
        if self.rule_version >= 14 && mhp != before {
            self.emit_web(crate::web_events::WebEv::LifeDrainMaximum { target: u, before, after: mhp });
        }
        if mhp <= 0 {
            self.units[u].hp = 0;
            self.make_dead(u);
            return;
        }
        if self.units[u].hp > mhp {
            self.units[u].hp = mhp;
        }
    }

    /// `AttackAction._resolve_blind_attack` + commit: a creature at the
    /// square that the attacker can't see is attacked normally (the unseen
    /// target gives Disadvantage); otherwise the attack automatically misses
    /// after its roll (Disadvantage, no Bless, no Sap spent) and is committed
    /// as a `blind_miss` (`consume_resource`).
    fn do_blind_attack(&mut self, src: usize, atk: usize, square: Pos) {
        self.notes.blind_attacks += 1;
        let occupant = (0..self.units.len())
            .find(|&o| o != src && self.units[o].pos == square && !self.units[o].dead() && !self.can_see(src, o));
        if let Some(o) = occupant {
            self.do_attack_inner(src, atk, o, false, false, Some(o));
            return;
        }
        let (_face, dv) = self.roll_d20_raw(src, "attack", RollMode::Disadvantage);
        // the `blind_miss` item has the attack roll and no target
        let def: &'static AttackDef = &self.units[src].t.attacks[atk];
        if self.web_events.is_some() {
            let (to_hit, _, _) = self.attack_numbers(src, atk);
            let mod_val = plus_string_modifier(to_hit);
            let sp = self.units[src].pos;
            let mut reasons = String::from(" [Disadvantage from unseen target");
            if (def.ranged || def.thrown) && self.square_distance(sp, square) * 5 > def.range {
                reasons.push_str(", long range");
            }
            reasons.push(']');
            let atk_roll_fmt = Some(
                crate::web_events::fmt_d20_roll(dv, RollMode::Disadvantage, mod_val, None) + &reasons,
            );
            self.emit_web(crate::web_events::WebEv::BlindMiss {
                src,
                src_pos: sp,
                square,
                attack_name: def.name,
                ranged_weapon: def.ranged,
                atk_roll_fmt,
            });
        }
        self.note_attack_roll(src, None, def, false);
        self.consume_attack(src, atk, false);
    }

    /// `HideBonusAction` resolve + apply under the 2024 rule
    /// (`Ruleset.hide_model()` `dc15_out_of_sight`, N20-039): the Stealth
    /// check (one d20, Disadvantage while poisoned or frightened by a source
    /// in sight), then the Hide fails if any conscious opponent can see the
    /// hider (its own hidden status set aside: line of sight) or the total is
    /// below 15; a success hides it with that total. The bonus action is
    /// spent either way; a failure leaves an earlier hidden status as it was.
    fn do_hide(&mut self, u: usize) {
        self.notes.hide_attempts += 1;
        let modifier = self.units[u].t.nimble_escape.or(self.units[u].t.shadow_stealth).unwrap_or(0);
        let gt = self.gt();
        let unit = &self.units[u];
        let feared = unit.frightened_by.iter().any(|&(f, until, _)| gt < until && !self.units[f].dead() && self.can_see(u, f))
            || unit.source_fear.iter().any(|&(f, _)| !self.units[f].dead() && self.can_see(u, f));
        let mode = RollMode::from_flags(false, unit.poisoned() || feared);
        let face = self.roll_d20(u, "dice roll for stealth", mode);
        let total = face + plus_string_modifier(modifier);
        let seen = (0..self.units.len()).any(|o| {
            let x = &self.units[o];
            o != u && !x.dead() && self.opposing(o, u) && x.conscious() && self.sees_hider_clearly(o, u)
        });
        self.emit_web(crate::web_events::WebEv::HideResult { actor: u, total, seen });
        if !seen && total >= 15 {
            self.notes.hide_success += 1;
            let unit = &mut self.units[u];
            unit.add_status(St::Hidden);
            unit.hidden_stealth = Some(total);
        }
        let unit = &mut self.units[u];
        unit.bonus = (unit.bonus - 1).max(0);
    }

    /// `npc_reactions.attack_roll_window` (`swap_retarget`, the Goblin Boss's
    /// Redirect Attack), after the attack roll is final and before the AC
    /// comparison. Any roll opens the window if the target is conscious, has
    /// its reaction and (`requires_sight`) sees the attacker. Each conscious ally
    /// of an allowed size within range (Map.distance in squares x 5 ft) is an
    /// option, sorted by unit id. The native controller prefers the healthiest
    /// ally on a hit and keeps its reaction on a miss. The two swap squares (no movement, no opportunity
    /// attacks), the target's reaction is spent, and the ally becomes the
    /// target. No draws. Returns the ally.
    pub(crate) fn redirect_window(&mut self, attacker: usize, tgt: usize, face: i32, total: i32, weapon: bool, origin: Pos) -> Option<usize> {
        let spec = self.units[tgt].t.swap_retarget.as_ref()?;
        if tgt == attacker {
            return None;
        }
        let t = &self.units[tgt];
        if !t.conscious() || t.incapacitated() || !t.has_reaction() {
            return None;
        }
        let would_hit = if face == 1 {
            false
        } else if face == 20 || (weapon && self.units[attacker].t.improved_critical && face >= 19) {
            true
        } else {
            total >= self.attack_ac(origin, tgt)
        };
        if (self.rule_version < 12 && !would_hit) || (spec.requires_sight && !self.can_see(tgt, attacker)) {
            return None;
        }
        let mut allies: Vec<usize> = (0..self.units.len())
            .filter(|&o| {
                let x = &self.units[o];
                o != tgt
                    && o != attacker
                    && self.allies(tgt, o)
                    && !x.dead()
                    && x.conscious()
                    && (spec.ally_sizes.is_empty() || spec.ally_sizes.contains(&x.t.size))
                    && self.dist(tgt, o) * 5 <= spec.range
            })
            .collect();
        if allies.is_empty() {
            return None;
        }
        allies.sort_by(|&a, &b| self.units[a].id.cmp(&self.units[b].id));
        let opts: Vec<Act> = allies.into_iter().map(|ally| Act::RedirectAttack { ally, would_hit }).collect();
        let Some(Act::RedirectAttack { ally, .. }) = self.select_reaction(tgt, opts) else { return None };
        self.swap_places(tgt, ally);
        let unit = &mut self.units[tgt];
        unit.reaction = (unit.reaction - 1).max(0);
        self.notes.redirects += 1;
        self.emit_web(crate::web_events::WebEv::Redirected { boss: tgt, ally });
        Some(ally)
    }

    /// `Map.swap_places`: two one-square creatures exchange squares (not
    /// movement: no speed, no opportunity attacks, no triggers).
    pub(crate) fn swap_places(&mut self, a: usize, b: usize) {
        let (pa, pb) = (self.units[a].pos, self.units[b].pos);
        let (ia, ib) = (self.grid.index(pa.0, pa.1), self.grid.index(pb.0, pb.1));
        self.occ[ia] = Some(b as u8);
        self.occ[ib] = Some(a as u8);
        self.units[a].pos = pb;
        self.units[b].pos = pa;
        self.reveal_exposed_hiders();
    }

    /// `AttackAction.consume_resource` (thrown weapons, action economy and
    /// multiattack).
    fn consume_attack(&mut self, src: usize, atk: usize, reaction: bool) {
        let t = self.units[src].t;
        let def = &t.attacks[atk];
        if def.recharge.is_some() && !self.units[src].recharge_spent.contains(&def.name) {
            self.units[src].recharge_spent.push(def.name);
        }
        if let (true, Some(k)) = (def.thrown, def.npc_item) {
            // an NPC throw spends one of the items its attack is made with
            // (hit, miss or blind miss); the thrown item is not tracked
            let n = &mut self.units[src].items[k as usize];
            *n = (*n - 1).max(0);
            self.notes.npc_throws += 1;
        } else if def.thrown {
            // a spare copy in the inventory goes first, then the held one
            // is unequipped (it lands at the target's square, N20-041)
            if let Some(i) = def.item {
                let unit = &mut self.units[src];
                match t.spares.iter().position(|s| s.0 == i) {
                    Some(k) if unit.spares[k] > 0 => {
                        unit.spares[k] -= 1;
                        self.notes.thrown_spare += 1;
                    }
                    _ => {
                        unit.gear_off |= 1 << i;
                        self.notes.thrown_held += 1;
                    }
                }
            }
        }
        {
            let u = &mut self.units[src];
            if def.multiattack_group.is_some() && !reaction && !def.bonus_action {
                u.ma_started = true;
            }
            if reaction {
                u.reaction = (u.reaction - 1).max(0);
            } else if def.bonus_action {
                u.bonus = (u.bonus - 1).max(0);
            } else {
                u.action = (u.action - 1).max(0);
            }
            // `two_weapon`: an attack with a light weapon (hand slots 0.5)
            // sets it unless already set; any other attack clears it (NPC
            // actions have no weapon item)
            let light = t.pc && def.item.is_some_and(|i| t.gear[i as usize].1 == 0.5);
            u.two_weapon = light && !u.two_weapon;
            // the attack reveals a hidden attacker
            u.break_stealth();
        }
        if t.pc || def.bonus_action {
            return;
        }
        let name = def.name;
        let mut narrowed = false;
        if !self.units[src].ma_combos.is_empty() && def.multiattack_group.is_some() && !reaction {
            self.narrow_multiattack(src, Some(name));
            narrowed = true;
            if self.units[src].ma_groups.iter().all(|(_, v)| v.is_empty()) {
                self.clear_multiattack(src);
            }
        }
        if !narrowed {
            let mut clear = false;
            for (_, attacks) in self.units[src].ma_groups.iter_mut() {
                if let Some(i) = attacks.iter().position(|n| *n == name) {
                    attacks.remove(i);
                    if attacks.is_empty() {
                        clear = true;
                    }
                }
            }
            if clear {
                self.clear_multiattack(src);
            }
        }
    }

    // ------------------------------------------------------------------
    // Damage, death, healing
    // ------------------------------------------------------------------

    /// `Entity.take_damage`.
    /// `_third_party_reaction_scan`: on a hit, every other conscious creature
    /// with its reaction lists its prepared spells, which creates a PC's
    /// lazily registered free-cast pools.
    pub fn reaction_scan(&mut self, src: usize, tgt: usize, hit: bool) {
        if !hit {
            return;
        }
        for j in 0..self.units.len() {
            if j == src || j == tgt {
                continue;
            }
            let u = &self.units[j];
            if u.t.pc && u.t.caster.is_some() && u.conscious() && u.has_reaction() {
                self.units[j].pools_init = true;
            }
        }
    }

    pub fn take_damage(
        &mut self,
        u: usize,
        dmg: i32,
        dt: Dmg,
        critical: bool,
        hit_state: Option<&mut HitState>,
        attacker: Option<usize>,
    ) -> Option<i32> {
        let total = self.adjusted_damage(u, dmg, dt)?;
        self.apply_adjusted_damage(u, total, dt, critical, hit_state, attacker)
    }

    fn adjusted_damage(&self, u: usize, dmg: i32, dt: Dmg) -> Option<i32> {
        let t = self.units[u].t;
        if t.immune & dt.bit() != 0 { return None; }
        let amount = match (self.resists(u, dt), t.vulnerable & dt.bit() != 0) {
            (true, false) => dmg.div_euclid(2),
            (false, true) => dmg * 2,
            _ => dmg,
        };
        Some(amount.max(0))
    }

    fn apply_adjusted_damage(&mut self, u: usize, mut total: i32, dt: Dmg, critical: bool,
                             hit_state: Option<&mut HitState>, attacker: Option<usize>) -> Option<i32> {
        let t = self.units[u].t;
        // temporary hit points
        let temp_before = self.units[u].temp_hp;
        if total > 0 && temp_before > 0 {
            let absorbed = total.min(temp_before);
            total -= absorbed;
            self.units[u].temp_hp -= absorbed;
        }
        // `after_take_damage_hook` lists the target's prepared spells
        if total > 0
            && self.units[u].t.pc
            && self.units[u].conscious()
            && attacker.is_some_and(|a| a != u)
            && self.units[u].has_reaction()
        {
            self.units[u].pools_init = true;
        }
        let already_down = self.units[u].unconscious() || self.units[u].dead();
        // `kill_at_zero` (a mummy's Rotting Fist): only a drop from above 0
        let kill_at_zero = !already_down && hit_state.as_deref().is_some_and(|h| h.kill_at_zero);
        self.units[u].hp -= total;
        let mut overflow = (-self.units[u].hp).max(0);
        let mut hs = hit_state;
        if let Some(h) = hs.as_deref_mut() {
            if overflow > 0 {
                overflow += h.overflow;
                h.overflow = overflow;
            }
        }
        if self.units[u].hp <= 0 && total > 0 && !already_down {
            if self.try_undead_fortitude(u, total, dt, critical) {
                overflow = 0;
                if let Some(h) = hs.as_deref_mut() {
                    h.overflow = 0;
                }
            }
        }
        let counted = hs.as_deref().map(|h| h.death_fail_counted).unwrap_or(false);
        if let Some(h) = hs.as_deref_mut() {
            if total > 0 {
                h.death_fail_counted = true;
            }
        }
        if self.units[u].unconscious() && !counted {
            self.units[u].remove_status(St::Stable);
            let failures = if critical { 2 } else { 1 };
            self.units[u].death_fails += failures;
            self.emit_web(crate::web_events::WebEv::DeathSave { u, outcome: DeathSave::Damage { failures }, round: self.round });
            if self.units[u].death_fails >= 3 {
                self.make_dead(u);
                self.units[u].death_saves = 0;
                self.units[u].death_fails = 0;
            }
        }
        let hp = self.units[u].hp;
        if self.rule_version >= 7 && hp <= 0 {
            if let Some(c) = self.units[u].concentration {
                let spell = self.objs[c as usize].spell;
                self.emit_web(crate::web_events::WebEv::ConcentrationEnded { target: u, spell });
            }
        }
        // massive damage compares with the current maximum (N20-014)
        let max_now = self.max_hp_of(u);
        if self.units[u].dead() {
        } else if hp <= 0 && kill_at_zero {
            self.notes.kill_at_zero += 1;
            self.make_dead(u);
        } else if hp < 0 && overflow >= max_now {
            if self.rule_version < 13 || t.pc {
                self.emit_web(crate::web_events::WebEv::MassiveDamage { target: u, excess: overflow, maximum: max_now });
            }
            self.make_dead(u);
        } else if hp <= 0 {
            if already_down {
            } else if !t.pc {
                self.make_dead(u);
            } else {
                self.make_unconscious(u);
            }
            if let Some(c) = self.units[u].concentration {
                self.dismiss_effect(u, c);
            }
        } else if let Some(c) = self.units[u].concentration.filter(|_| total > 0 || self.rule_version < 7) {
            // concentration check: DC max(10, half the damage taken)
            let dc = 10.max(total.div_euclid(2));
            let (save, roll) = self.save_throw_fmt(u, Ability::Con);
            let spell = self.objs[c as usize].spell;
            self.emit_web(crate::web_events::WebEv::ConcentrationSave { target: u, spell, roll, dc, passed: save >= dc });
            if save < dc {
                self.dismiss_effect(u, c);
            }
        }
        if self.units[u].hp <= 0 {
            self.units[u].hp = 0;
        }
        if total > 0 {
            if let Some(att) = attacker {
                if !self.units[u].charmed_by.is_empty() {
                    self.on_harmed_while_charmed(u, att);
                }
            }
            self.on_damaged_turn_fear(u);
            if self.units[u].lured_by.is_some() {
                self.on_damaged_lured(u, attacker);
            }
        }
        // item['_applied_damage']
        Some(total)
    }

    /// `monster_traits.try_undead_fortitude`.
    fn try_undead_fortitude(&mut self, u: usize, damage: i32, dt: Dmg, critical: bool) -> bool {
        let Some((dc_base, bypass)) = self.units[u].t.undead_fortitude else { return false };
        if damage <= 0 || critical || bypass & dt.bit() != 0 {
            return false;
        }
        let dc = dc_base + damage;
        let (total, roll) = self.save_throw_fmt(u, Ability::Con);
        let success = total >= dc;
        if success {
            self.units[u].hp = 1;
        }
        let pos = self.units[u].pos;
        self.emit_web(crate::web_events::WebEv::UndeadFortitude { u, pos, success, roll, dc });
        success
    }

    /// `Entity.make_dead`.
    fn make_dead(&mut self, u: usize) {
        if self.units[u].dead() {
            return;
        }
        let pos = self.units[u].pos;
        let monster = self.units[u].team == 1;
        // Release grapples held by or holding `u` (`entity.py:1486-1489`).
        self.drop_all_grapples(u);
        let grapplers: Vec<usize> = self.units[u].grappled_by.iter().map(|&(g, _)| g).collect();
        for g in grapplers {
            self.release_grapple(g, u);
        }
        let unit = &mut self.units[u];
        unit.add_status(St::Dead);
        if self.rule_version >= 8 {
            let cell = self.grid.index(pos.0, pos.1);
            if self.occ[cell] == Some(u as u8) {
                self.occ[cell] = self.units.iter().position(|other| other.pos == pos && !other.dead()).map(|i| i as u8);
            }
        }
        self.end_rage_if_incapacitated(u);
        if self.units[u].t.death_burst.is_some() {
            self.trigger_death_burst(u);
        }
        let unit = &mut self.units[u];
        unit.do_prone();
        unit.remove_status(St::Stable);
        unit.remove_status(St::Unconscious);
        // "dismiss all effects": every effect the creature cast (a snapshot;
        // `remove_effect` rebinds the list, so none is skipped)
        let casted: Vec<u32> = self.units[u].casted.iter().map(|c| c.1).collect();
        for obj in casted {
            self.dismiss_effect(u, obj);
        }
        // `SourceTurnExpiry.died`: the fear this creature caused ends now
        self.end_source_fear_of(u);
        if self.rule_version >= 17 {
            for tgt in 0..self.units.len() {
                if self.units[tgt].charmed_by.iter().any(|c| c.source == u) {
                    self.end_charm(tgt, u);
                }
            }
        }
        self.emit_web(crate::web_events::WebEv::Died { u, pos, monster });
    }

    /// `Entity.make_unconscious`.
    fn make_unconscious(&mut self, u: usize) {
        if self.units[u].unconscious() || self.units[u].dead() {
            return;
        }
        self.drop_all_grapples(u);
        let unit = &mut self.units[u];
        unit.do_prone();
        unit.statuses.push(St::Unconscious);
        self.lose_dodge_if_ineligible(u);
        self.end_rage_if_incapacitated(u);
        let unit = &mut self.units[u];
        unit.remove_status(St::Stable);
        // only concentration ends (N20-005); the caster's other spells run
        // their duration, and its start-of-turn hooks still fire
        // (`Battle.start_turn`)
        if let Some(c) = self.units[u].concentration {
            self.dismiss_effect(u, c);
        }
        self.emit_web(crate::web_events::WebEv::Unconscious { u });
    }

    /// `Entity.heal`.
    pub fn heal(&mut self, u: usize, amount: i32) {
        if self.units[u].dead() {
            return;
        }
        if self.units[u].cursed && amount != 0 {
            self.notes.heals_blocked += 1;
            if self.rule_version >= 8 && amount > 0 {
                self.emit_web(crate::web_events::WebEv::HealingBlocked { target: u });
            }
        }
        let mhp = self.max_hp_of(u);
        let unit = &mut self.units[u];
        // `heal_override` (the curse): nothing is restored
        let amount = if unit.cursed { 0 } else { amount };
        unit.hp = mhp.min(unit.hp + amount);
        if unit.hp > 0 && amount > 0 {
            unit.death_saves = 0;
            unit.death_fails = 0;
            if unit.unconscious() {
                unit.remove_status(St::Unconscious);
                unit.remove_status(St::Stable);
            }
        }
    }

    /// `Entity.death_saving_throw`.
    fn death_saving_throw(&mut self, u: usize) {
        let (face, draw) = self.roll_d20_raw(u, "death_saving_throw", RollMode::Normal);
        let bless = (self.rule_version >= 13 && self.has_effect(u, EffKey::Bless))
            .then(|| self.roll_dice(u, "bless", 1, 4)[0]);
        let passed = face != 1 && face + bless.unwrap_or(0) >= 10;
        if self.web_events.is_some() {
            let mut description = crate::web_events::fmt_d20_roll(draw, RollMode::Normal, 0, bless);
            if self.rule_version >= 13 && face == 1 {
                description.push_str(" (2 failures)");
            }
            let outcome = DeathSave::Roll { passed, description };
            self.emit_web(crate::web_events::WebEv::DeathSave { u, outcome, round: self.round });
        }
        // a cursed creature can't regain the Hit Point: a plain success (N20-044)
        if face == 20 && !self.units[u].cursed {
            let unit = &mut self.units[u];
            unit.remove_status(St::Unconscious);
            unit.remove_status(St::Stable);
            self.heal(u, 1);
        } else if passed {
            let unit = &mut self.units[u];
            unit.death_saves += 1;
            if unit.death_saves >= 3 {
                unit.death_saves = 0;
                unit.death_fails = 0;
                unit.add_status(St::Stable);
            }
        } else {
            let unit = &mut self.units[u];
            unit.death_fails += if face == 1 { 2 } else { 1 };
            if unit.death_fails >= 3 {
                self.make_dead(u);
                self.units[u].death_saves = 0;
                self.units[u].death_fails = 0;
            }
        }
    }

    // ------------------------------------------------------------------
    // Digest and descriptors
    // ------------------------------------------------------------------

    /// The recorder's `digest(arena)`.
    pub fn digest(&self) -> StateDigest {
        let units = self
            .units
            .iter()
            .enumerate()
            .map(|(i, u)| {
                let mut st: Vec<String> = u.statuses.iter().map(|s| s.name().to_string()).collect();
                st.sort();
                let mut bst = Vec::new();
                if u.dodge {
                    bst.push("dodge".to_string());
                }
                if u.disengage {
                    bst.push("disengage".to_string());
                }
                bst.sort();
                let fighter = u.t.fighter;
                let caster = u.t.caster.as_ref();
                let sorcerer = u.t.sorcerer;
                UnitDigest {
                    id: u.id.clone(),
                    pos: Some([u.pos.0, u.pos.1]),
                    hp: u.hp,
                    mhp: self.max_hp_of(i),
                    thp: u.temp_hp,
                    st,
                    fx: {
                        let mut fx = Vec::new();
                        if !u.stench_poison.is_empty() {
                            fx.push(format!("poisoned:{}", u.stench_poison.len()));
                        }
                        if u.str_drain.is_some() {
                            fx.push("strength_override:1".to_string());
                        }
                        if !u.paralysis.is_empty() {
                            fx.push(format!("timed_condition:{}", u.paralysis.len()));
                        }
                        if u.cursed {
                            fx.push("heal_override:1".to_string());
                        }
                        fx.extend(self.effect_counts(i));
                        fx.sort();
                        fx
                    },
                    bst,
                    res: [u.action, u.bonus, u.reaction, u.movement],
                    ds: [u.death_saves, u.death_fails],
                    strength: u.t.abil[0],
                    sl: caster.filter(|_| u.t.pc).map(|_| [u.slots[1], u.slots[2]]),
                    conc: u.concentration.map(|c| self.objs[c as usize].conc_name().to_string()),
                    cd: caster.filter(|_| u.t.channel_divinity).map(|_| u.cd),
                    pools: caster.filter(|_| u.pools_init).and_then(|c| {
                        let mut m = std::collections::BTreeMap::new();
                        for (s, name) in c.free_casts.iter().zip(c.free_cast_pools.iter()) {
                            m.insert(name.to_string(), if u.free_casts.contains(s) { 1 } else { 0 });
                        }
                        for &(name, val) in &c.inert_pools {
                            m.insert(name.to_string(), val);
                        }
                        if m.is_empty() { None } else { Some(m) }
                    }),
                    sp: sorcerer.then_some(u.sorcery_points),
                    isc: sorcerer.then_some(u.innate_sorcery),
                    isu: if sorcerer { u.innate_until } else { None },
                    sw: fighter.then_some(u.second_wind_count),
                    action_surge: (u.t.action_surge_uses > 0).then_some(u.action_surge_count),
                    asu: (u.t.action_surge_uses > 0).then_some(u.action_surge_flag),
                    rg: u.t.barbarian.then(|| {
                        [
                            u.rage_count,
                            u.raging as i32,
                            u.rage_extended as i32,
                            u.reckless as i32,
                            u.attack_rolled as i32,
                            u.frenzy_hit as i32,
                        ]
                    }),
                    cv: (u.cleave.is_some() || u.cleave_used).then(|| {
                        let mut v = vec![if u.cleave_used { "used".to_string() } else { "-".to_string() }];
                        if let Some((_, cands)) = &u.cleave {
                            v.extend(cands.iter().map(|&c| self.units[c].id.clone()));
                        }
                        v
                    }),
                }
            })
            .collect();
        StateDigest {
            round: self.round,
            cur: if self.started && !self.order.is_empty() { Some(self.units[self.current()].id.clone()) } else { None },
            units,
        }
    }

    /// The recorder's `describe(action)`.
    pub fn describe(&self, src: usize, act: &Act) -> String {
        match act {
            Act::Move(path) => {
                let cells: Vec<String> = path.iter().map(|p| format!("{},{}", p.0, p.1)).collect();
                format!("move:{}", cells.join(";"))
            }
            Act::BlindAttack { atk, square, .. } => {
                let def = &self.units[src].t.attacks[*atk];
                let thrown = if def.thrown { ":thrown" } else { "" };
                format!("attack:{}{thrown}:@{},{}", def.name, square.0, square.1)
            }
            Act::Attack { atk, target, reaction } => {
                let def = &self.units[src].t.attacks[*atk];
                let mut s = if def.thrown {
                    format!("attack:{}:thrown:>{}", def.name, self.units[*target].id)
                } else {
                    format!("attack:{}:>{}", def.name, self.units[*target].id)
                };
                if *reaction {
                    s.push_str(":reaction");
                }
                s
            }
            Act::Spell(c) => {
                let mut s = format!("spell:{}:L{}", c.spell.key(), c.at_level);
                if self.rule_version >= 9 && c.free { s.push_str(":free"); }
                if let Some(mm) = c.mm {
                    s.push_str(&format!(":mm={}", mm.key()));
                }
                if !c.targets.is_empty() {
                    let ids: Vec<&str> = c.targets.iter().map(|&t| self.units[t].id.as_str()).collect();
                    s.push_str(&format!(":>{}", ids.join(",")));
                } else if let Some(p) = c.point {
                    s.push_str(&format!(":@{},{}", p.0, p.1));
                }
                s
            }
            Act::DivineSpark { target, heal, .. } => {
                format!("divine_spark:mode={}:>{}", if *heal { "heal" } else { "harm" }, self.units[*target].id)
            }
            Act::CreateSpellSlot { level } | Act::ConvertSpellSlot { level } => format!("{}:L{level}", act.kind()),
            Act::SpiritualWeaponMove { to } => format!("spiritual_weapon_move:@{},{}", to.0, to.1),
            Act::SpiritualWeaponAttack { target } => format!("spiritual_weapon_attack:>{}", self.units[*target].id),
            Act::RedirectAttack { ally, .. } => format!("redirect_attack:>{}:reaction", self.units[*ally].id),
            Act::Cleave { target, .. } => format!("cleave:>{}", self.units[*target].id),
            Act::FirstAid { target } => format!("first_aid:>{}", self.units[*target].id),
            Act::EscapeGrapple { target } => format!("escape_grapple:>{}", self.units[*target].id),
            Act::BreakFree { target } => format!("break_free:>{}", self.units[*target].id),
            Act::DropGrapple { target } => format!("drop_grapple:>{}", self.units[*target].id),
            Act::NpcAreaAbility { idx, target } => {
                let name = self.units[src].t.area_abilities[*idx].name;
                match target {
                    Some(p) => format!("npc_area_ability:{name}:@{},{}", p.0, p.1),
                    None => format!("npc_area_ability:{name}"),
                }
            }
            Act::NpcTeleport { idx, dest } => {
                let name = self.units[src].t.teleports[*idx].name;
                format!("npc_teleport:{name}:@{},{}", dest.0, dest.1)
            }
            Act::LuringSong => "luring_song".to_string(),
            Act::NpcVanish => "npc_vanish".to_string(),
            other => other.kind().to_string(),
        }
    }

    // ------------------------------------------------------------------
    // Fey campaign mechanics: Vile Appearance, Recharges, Grapple, Charm,
    // Luring Song, Death Burst, First Aid, Escape Grapple, Break Free,
    // NPC Area Ability, NPC Teleport, NPC Vanish.
    // ------------------------------------------------------------------

    /// `VileAppearanceEffect.start_of_turn`: WIS save DC 11 vs living Sea Hag
    /// within 30 ft in sight for Beasts/Humanoids (24h immunity on pass, 6s Fear on fail).
    fn vile_appearance_start_of_turn(&mut self, u: usize) {
        if self.units[u].dead() || self.units[u].t.immune_frightened {
            return;
        }
        let t = self.units[u].t;
        if !(t.pc || t.beast || t.humanoid) {
            return;
        }
        let gt = self.gt();
        let sources: Vec<usize> = (0..self.units.len())
            .filter(|&o| o != u && !self.units[o].dead() && self.units[o].t.vile_appearance.is_some())
            .collect();
        for src in sources {
            let va = self.units[src].t.vile_appearance.unwrap();
            if self.dist(src, u) * 5 > va.range {
                continue;
            }
            if !self.can_see(u, src) {
                continue;
            }
            if self.units[u].vile_immune.iter().any(|&(s, until)| s == src && gt < until) {
                continue;
            }
            if self.pfeg_wards(u, src) {
                continue;
            }
            let total = self.save_throw_ex(u, Ability::Wis, false, 0, false, false, false).0;
            if total >= va.dc {
                let until = gt + 24 * 3600;
                match self.units[u].vile_immune.iter_mut().find(|e| e.0 == src) {
                    Some(e) => e.1 = until,
                    None => self.units[u].vile_immune.push((src, until)),
                }
            } else {
                // Frightened until start of target's next turn (6s), does NOT end on damage.
                self.apply_timed_fear(u, src, 6, false);
            }
        }
    }

    /// `npc_area_action.roll_recharges`: roll 1d6 for each spent rechargeable ability.
    fn roll_recharges(&mut self, u: usize) {
        if self.units[u].recharge_spent.is_empty() {
            return;
        }
        let spent = self.units[u].recharge_spent.clone();
        for name in spent {
            let needed = self.units[u]
                .t
                .attacks
                .iter()
                .find(|a| a.name == name)
                .and_then(|a| a.recharge)
                .or_else(|| self.units[u].t.area_abilities.iter().find(|a| a.name == name).and_then(|a| a.recharge))
                .or_else(|| self.units[u].t.teleports.iter().find(|a| a.name == name).and_then(|a| a.recharge));
            let Some(min_roll) = needed else { continue };
            let roll = self.roll_dice(u, "recharge", 1, 6)[0];
            if roll >= min_roll {
                self.units[u].recharge_spent.retain(|&n| n != name);
            }
        }
    }

    /// Apply a grapple (`target.do_grappled_by(source)` + `grapple_escape_dcs`).
    pub fn apply_grapple(&mut self, src: usize, tgt: usize, escape_dc: Option<i32>) {
        if self.units[tgt].dead() || self.units[tgt].t.immune_grappled {
            return;
        }
        if !self.units[tgt].grappled_by.iter().any(|&(g, _)| g == src) {
            self.units[tgt].grappled_by.push((src, escape_dc));
        } else if let Some(dc) = escape_dc {
            if let Some(e) = self.units[tgt].grappled_by.iter_mut().find(|e| e.0 == src) {
                e.1 = Some(dc);
            }
        }
        if !self.units[src].grappling.contains(&tgt) {
            self.units[src].grappling.push(tgt);
        }
        self.units[tgt].add_status(St::Grappled);
    }

    /// Free release of `tgt` by `src` (`grappling.release`).
    pub fn release_grapple(&mut self, src: usize, tgt: usize) {
        self.units[src].grappling.retain(|&t| t != tgt);
        self.units[tgt].grappled_by.retain(|&(g, _)| g != src);
        if self.units[tgt].grappled_by.is_empty() {
            self.units[tgt].remove_status(St::Grappled);
        }
    }

    /// Drop every grapple held by `src` (`entity.drop_grapple`).
    pub fn drop_all_grapples(&mut self, src: usize) {
        let targets = std::mem::take(&mut self.units[src].grappling);
        for tgt in targets {
            self.units[tgt].grappled_by.retain(|&(g, _)| g != src);
            if self.units[tgt].grappled_by.is_empty() {
                self.units[tgt].remove_status(St::Grappled);
            }
        }
    }

    /// `grappling.prune_invalid_grapples(entity, battle)`.
    pub fn prune_invalid_grapples(&mut self, src: usize) {
        if !self.units[src].is_grappling() {
            return;
        }
        let incap = self.units[src].incapacitated();
        let reach_ft = self.units[src].t.melee_ft.unwrap_or(5).max(5);
        let targets = self.units[src].grappling.clone();
        for tgt in targets {
            let out_of_reach = self.dist(src, tgt) * 5 > reach_ft;
            if incap || self.units[tgt].dead() || out_of_reach {
                self.release_grapple(src, tgt);
            }
        }
    }

    /// Prune grapples held by `u` and anyone grappling `u` (after teleport/push).
    pub fn prune_grapples_around(&mut self, u: usize) {
        self.prune_invalid_grapples(u);
        let grapplers: Vec<usize> = self.units[u].grappled_by.iter().map(|&(g, _)| g).collect();
        for g in grapplers {
            self.prune_invalid_grapples(g);
        }
    }

    /// `grappling.ai_release_candidates`: first held creature that is dead, unconscious, or non-hostile.
    pub fn grapple_release_target(&self, u: usize) -> Option<usize> {
        if !self.units[u].is_grappling() {
            return None;
        }
        for &t in &self.units[u].grappling {
            if self.units[t].dead() || self.units[t].unconscious() || !self.opposing(u, t) {
                return Some(t);
            }
        }
        None
    }

    /// `monster_traits.apply_charm`.
    pub fn apply_charm(
        &mut self,
        tgt: usize,
        charmer: usize,
        save_dc: Option<(Ability, i32)>,
        duration: Option<&'static str>,
        repeat_save_when_harmed: bool,
        ends_on_harm_no_save: bool,
        source_spell: Option<&'static str>,
    ) -> bool {
        if self.units[tgt].dead() || self.units[tgt].t.immune_charmed {
            return false;
        }
        let gt = self.gt();
        let expires_on_source_turn_start = duration == Some("start_of_source_next_turn");
        let until = if expires_on_source_turn_start {
            None
        } else {
            let secs = duration.and_then(|s| s.parse::<i32>().ok()).unwrap_or(86400);
            if secs > 0 { Some(gt + secs) } else { None }
        };
        let entry = CharmEntry {
            source: charmer,
            until,
            save_type: save_dc.map(|(a, _)| a),
            dc: save_dc.map(|(_, d)| d),
            repeat_save_when_harmed,
            ends_on_harm_no_save,
            expires_on_source_turn_start,
            source_spell,
        };
        match self.units[tgt].charmed_by.iter_mut().find(|c| c.source == charmer) {
            Some(e) => *e = entry,
            None => self.units[tgt].charmed_by.push(entry),
        }
        self.units[tgt].add_status(St::Charmed);
        true
    }

    /// `monster_traits.end_charm`.
    pub fn end_charm(&mut self, tgt: usize, charmer: usize) {
        let before = self.units[tgt].charmed_by.len();
        self.units[tgt].charmed_by.retain(|c| c.source != charmer);
        if self.units[tgt].charmed_by.len() != before && self.units[tgt].charmed_by.is_empty() {
            self.units[tgt].remove_status(St::Charmed);
        }
    }

    /// Prune expired or dead-charmer entries from `charmed_by`.
    pub fn expire_charms(&mut self, tgt: usize) {
        if self.units[tgt].charmed_by.is_empty() {
            return;
        }
        let gt = self.gt();
        let before = self.units[tgt].charmed_by.len();
        let dead: Vec<bool> = self.units.iter().map(|u| u.dead()).collect();
        self.units[tgt]
            .charmed_by
            .retain(|c| c.until.map_or(true, |x| gt < x) && !dead[c.source]);
        if self.units[tgt].charmed_by.len() != before && self.units[tgt].charmed_by.is_empty() {
            self.units[tgt].remove_status(St::Charmed);
        }
    }

    /// `monster_traits.expire_charms_on_turn_start`.
    fn expire_charms_on_turn_start(&mut self, src: usize) {
        for tgt in 0..self.units.len() {
            if self.units[tgt].charmed_by.iter().any(|c| c.source == src && c.expires_on_source_turn_start) {
                self.end_charm(tgt, src);
            }
        }
    }

    /// `monster_traits.on_harmed_while_charmed`.
    fn on_harmed_while_charmed(&mut self, tgt: usize, attacker: usize) {
        if attacker == tgt {
            return;
        }
        self.expire_charms(tgt);
        let entries = self.units[tgt].charmed_by.clone();
        for c in entries {
            if !c.repeat_save_when_harmed {
                continue;
            }
            let same_side = attacker == c.source || !self.opposing(attacker, c.source);
            if !same_side {
                continue;
            }
            if c.ends_on_harm_no_save {
                self.end_charm(tgt, c.source);
                continue;
            }
            match (c.save_type, c.dc) {
                (Some(ab), Some(dc)) => {
                    let total = self.save_throw_ex(tgt, ab, false, 0, false, true, false).0;
                    if total >= dc {
                        self.end_charm(tgt, c.source);
                    }
                }
                _ => self.end_charm(tgt, c.source),
            }
        }
    }

    /// `luring_song.apply_lure`.
    pub fn apply_lure(&mut self, tgt: usize, harpy: usize, dc: i32) {
        if self.units[tgt].dead() || self.units[tgt].t.immune_charmed || self.is_lured(tgt) {
            return;
        }
        if !self.apply_charm(tgt, harpy, Some((Ability::Wis, dc)), None, false, false, None) {
            return;
        }
        let mut added_incap = false;
        if !self.units[tgt].has(St::Incapacitated) {
            self.units[tgt].add_status(St::Incapacitated);
            added_incap = true;
        }
        self.units[tgt].lured_by = Some((harpy, dc, added_incap));
        self.lose_dodge_if_ineligible(tgt);
        self.end_rage_if_incapacitated(tgt);
    }

    /// `luring_song.end_lure`.
    pub fn end_lure(&mut self, tgt: usize) {
        let Some((harpy, _, added_incap)) = self.units[tgt].lured_by.take() else { return };
        self.end_charm(tgt, harpy);
        if added_incap && self.units[tgt].turned_by.is_empty() {
            self.units[tgt].remove_status(St::Incapacitated);
        }
    }

    /// Release all creatures currently lured by `harpy` (concentration ended / harpy incapacitated).
    pub(crate) fn end_all_lures_by(&mut self, harpy: usize) {
        let targets: Vec<usize> = (0..self.units.len())
            .filter(|&o| self.units[o].lured_by.is_some_and(|(h, _, _)| h == harpy))
            .collect();
        for t in targets {
            self.end_lure(t);
        }
    }

    /// `luring_song.expire_lured`.
    pub fn expire_lured(&mut self, tgt: usize) {
        if self.units[tgt].lured_by.is_some() && !self.is_lured(tgt) {
            self.end_lure(tgt);
        }
    }

    /// `luring_song.repeat_lure_save`.
    pub fn repeat_lure_save(&mut self, tgt: usize) {
        let Some((harpy, dc, _)) = self.units[tgt].lured_by else { return };
        if !self.is_lured(tgt) || self.units[tgt].dead() {
            return;
        }
        let total = self.save_throw_ex(tgt, Ability::Wis, false, 0, true, true, false).0;
        if total >= dc {
            self.end_lure(tgt);
            let until = self.gt() + 24 * 3600;
            match self.units[tgt].luring_song_immune.iter_mut().find(|e| e.0 == harpy) {
                Some(e) => e.1 = until,
                None => self.units[tgt].luring_song_immune.push((harpy, until)),
            }
        }
    }

    /// `luring_song.on_damaged`: repeat WIS save on damage from any source other than the harpy.
    fn on_damaged_lured(&mut self, tgt: usize, attacker: Option<usize>) {
        let Some((harpy, _, _)) = self.units[tgt].lured_by else { return };
        if !self.is_lured(tgt) {
            return;
        }
        if attacker == Some(harpy) {
            return;
        }
        self.repeat_lure_save(tgt);
    }

    /// `luring_song.lure_step`: 1-square step directly toward the harpy (not avoiding OAs).
    pub fn lure_step(&self, u: usize) -> Option<Vec<Pos>> {
        if !self.can_lure_move(u) {
            return None;
        }
        let Some((harpy, _, _)) = self.units[u].lured_by else { return None };
        if self.dist(u, harpy) * 5 <= 5 {
            return None;
        }
        let budget = self.units[u].available_movement().div_euclid(5);
        if budget < 1 {
            return None;
        }
        let (ox, oy) = self.units[u].pos;
        let (hx, hy) = self.units[harpy].pos;
        let cur_dist = (ox - hx).abs().max((oy - hy).abs());
        let mut best: Option<Vec<Pos>> = None;
        let mut best_key: Option<(i32, i32, i32, i32)> = None;
        for dx in -1..=1 {
            for dy in -1..=1 {
                if dx == 0 && dy == 0 {
                    continue;
                }
                let (nx, ny) = (ox + dx, oy + dy);
                if !self.grid.in_bounds(nx, ny) {
                    continue;
                }
                let nd = (nx - hx).abs().max((ny - hy).abs());
                if nd >= cur_dist {
                    continue;
                }
                if !self.placeable(u, (nx, ny)) {
                    continue;
                }
                let trial = [(ox, oy), (nx, ny)];
                let (moves, _) = self.compute_actual_moves(u, &trial, budget);
                if moves.len() != 2 {
                    continue;
                }
                let euclid2 = (nx - hx) * (nx - hx) + (ny - hy) * (ny - hy);
                let key = (nd, euclid2, nx, ny);
                if best_key.map_or(true, |bk| key < bk) {
                    best_key = Some(key);
                    best = Some(moves);
                }
            }
        }
        best
    }

    /// `monster_traits.trigger_death_burst` (Steam Mephit Death Burst).
    fn trigger_death_burst(&mut self, src: usize) {
        let Some(db) = self.units[src].t.death_burst else { return };
        let origin = self.units[src].pos;
        let squares = self.squares_in_radius(origin, db.radius, false);
        let targets = self.creatures_in_squares(&squares, Some(src));
        if targets.is_empty() {
            return;
        }
        let rolls = self.roll_dice(src, "death_burst", db.damage.count, db.damage.sides);
        let full: i32 = rolls.iter().sum::<i32>() + db.damage.modifier;
        for t in targets {
            let (passed, _) = self.save_check_ex(None, t, db.save, db.dc, false, true, false);
            if passed && !db.half_on_success {
                continue;
            }
            let amount = if passed { full.div_euclid(2) } else { full };
            self.take_damage(t, amount, db.damage_type, false, None, Some(src));
        }
    }

    /// Roll a skill check with Natural20's `skill_check_terms` advantage/disadvantage,
    /// returning `(total, formatted_roll)` using the exact same RNG draw as `roll_d20`.
    fn roll_skill_check_fmt(&mut self, u: usize, skill: &str, modifier: i32, tag: &str) -> (i32, String) {
        let gt = self.gt();
        let unit = &self.units[u];
        let mut adv = false;
        let mut dis = false;
        if unit.poisoned() {
            dis = true;
        }
        if unit.frightened_by.iter().any(|&(f, until, _)| gt < until && !self.units[f].dead() && self.can_see(u, f))
            || unit.source_fear.iter().any(|&(f, _)| !self.units[f].dead() && self.can_see(u, f))
        {
            dis = true;
        }
        if skill == "athletics" && (unit.t.remarkable_athlete || self.is_raging(u)) {
            adv = true;
        }
        let mode = Fight::mode_of(adv, dis);
        let (face, dv) = self.roll_d20_raw(u, tag, mode);
        let eff_mod = plus_string_modifier(modifier);
        let total = face + eff_mod;
        let fmt = if self.web_events.is_some() {
            crate::web_events::fmt_d20_roll(dv, mode, eff_mod, None)
        } else {
            String::new()
        };
        (total, fmt)
    }

    /// `FirstAidAction`: Medicine DC 10 to stabilize an adjacent unconscious dying creature.
    fn do_first_aid(&mut self, src: usize, tgt: usize) {
        let med_mod = self.units[src].medicine_mod();
        let (total, roll_fmt) = self.roll_skill_check_fmt(src, "medicine", med_mod, "dice roll for medicine");
        let success = total >= 10 && !self.units[tgt].dead() && self.units[tgt].unconscious() && !self.units[tgt].has(St::Stable);
        if success {
            let unit = &mut self.units[tgt];
            unit.add_status(St::Stable);
            unit.death_saves = 0;
            unit.death_fails = 0;
        }
        let src_pos = self.units[src].pos;
        let tgt_pos = self.units[tgt].pos;
        if let Some(ev) = &mut self.web_events {
            ev.push(crate::web_events::WebEv::FirstAid {
                src,
                tgt,
                src_pos,
                tgt_pos,
                roll_fmt,
                dc: 10,
                success,
            });
        }
        let u = &mut self.units[src];
        u.action = (u.action - 1).max(0);
    }

    /// `EscapeGrappleAction`: Athletics (if > Acrobatics) else Acrobatics vs escape DC.
    fn do_escape_grapple(&mut self, src: usize, grappler: usize) {
        let ath = self.units[src].athletics_mod();
        let acr = self.units[src].acrobatics_mod();
        let (skill, (total, roll_fmt)) = if ath > acr {
            ("Athletics", self.roll_skill_check_fmt(src, "athletics", ath, "dice roll for athletics"))
        } else {
            ("Acrobatics", self.roll_skill_check_fmt(src, "acrobatics", acr, "dice roll for acrobatics"))
        };
        let escape_dc = self.units[src].grappled_by.iter().find(|&&(g, _)| g == grappler).and_then(|&(_, dc)| dc);
        let (escaped, dc_text) = match escape_dc {
            Some(dc) => (total >= dc, format!("DC {dc}")),
            None => {
                let g_ath = self.units[grappler].athletics_mod();
                let (g_total, g_fmt) = self.roll_skill_check_fmt(grappler, "athletics", g_ath, "dice roll for athletics");
                (total > g_total, format!("Athletics {g_fmt}"))
            }
        };
        if escaped {
            self.release_grapple(grappler, src);
        }
        let src_pos = self.units[src].pos;
        let grappler_pos = self.units[grappler].pos;
        if let Some(ev) = &mut self.web_events {
            ev.push(crate::web_events::WebEv::EscapeGrapple {
                src,
                grappler,
                src_pos,
                grappler_pos,
                skill,
                roll_fmt,
                dc_text,
                success: escaped,
            });
        }
        let u = &mut self.units[src];
        u.action = (u.action - 1).max(0);
    }

    /// `BreakFreeAction`: STR Athletics vs Entangle escape DC (self-only).
    fn do_break_free(&mut self, src: usize, tgt: usize) {
        let restraint = self.active_effects(tgt, EffKey::EscapableRestraint).into_iter().next();
        let Some(obj) = restraint else { return };
        let dc = match self.objs[obj as usize].kind {
            crate::effects::ObjKind::EntangleRestraint { dc, .. } => dc,
            _ => return,
        };
        let ath = self.units[src].athletics_mod();
        let (total, roll_fmt) = self.roll_skill_check_fmt(src, "athletics", ath, "athletics");
        let success = total >= dc;
        self.units[src].action = (self.units[src].action - 1).max(0);
        if success {
            self.dismiss_entangle_restraint(obj);
        }
        let src_pos = self.units[src].pos;
        if let Some(ev) = &mut self.web_events {
            ev.push(crate::web_events::WebEv::BreakFree {
                src,
                src_pos,
                roll_fmt,
                dc,
                success,
            });
        }
    }

    /// `NpcAreaAction` (Steam Mephit Steam Breath).
    fn do_npc_area_ability(&mut self, src: usize, idx: usize, target: Option<Pos>) {
        let def = &self.units[src].t.area_abilities[idx];
        let origin = self.units[src].pos;
        let squares = match def.shape {
            "radius" | "self" | "emanation" => self.squares_in_radius(origin, def.range, true),
            _ => match target {
                Some(dir) => self.squares_in_cone(origin, dir, (def.range / 5).max(1), true),
                None => Vec::new(),
            },
        };
        let targets = self.creatures_in_squares(&squares, Some(src));
        let rolls = self.roll_dice(src, def.name, def.damage.count, def.damage.sides);
        let full: i32 = rolls.iter().sum::<i32>() + def.damage.modifier;
        let mut outcomes: Vec<(usize, bool, Option<i32>)> = Vec::with_capacity(targets.len());
        for t in targets {
            let (passed, _) = self.save_check_ex(None, t, def.save, def.dc, false, false, false);
            let dmg = if passed && !def.half_on_success {
                None
            } else if passed {
                Some(full.div_euclid(2))
            } else {
                Some(full)
            };
            outcomes.push((t, passed, dmg));
        }
        // Commit: consume cost & mark recharge spent, then damage + on_fail riders.
        if def.bonus_action {
            self.units[src].bonus = (self.units[src].bonus - 1).max(0);
        } else {
            self.units[src].action = (self.units[src].action - 1).max(0);
        }
        if def.recharge.is_some() && !self.units[src].recharge_spent.contains(&def.name) {
            self.units[src].recharge_spent.push(def.name);
        }
        for (t, passed, dmg) in outcomes {
            if let Some(amount) = dmg {
                let mut hs = HitState::default();
                self.damage_event(src, t, amount, def.damage_type, false, &mut hs);
            }
            if !passed && !self.units[t].dead() {
                if let Some(pen) = def.speed_penalty {
                    let obj = self.new_obj(
                        SpellId::RayOfFrost,
                        crate::effects::ObjKind::SpeedPenalty { target: t, penalty: pen, armed: false },
                        src,
                        vec![t],
                        true,
                    );
                    self.register_effect(t, EffKey::SpeedOverride, obj, None);
                    self.register_hook(src, HookEv::StartOfTurn, crate::effects::HookKind::SpeedPenaltyStart, obj, None);
                    self.register_hook(src, HookEv::EndOfTurn, crate::effects::HookKind::SpeedPenaltyEnd, obj, None);
                }
            }
        }
    }

    /// Valid destinations for an `NpcTeleportDef` (Blink Dog Teleport / Dryad Tree Stride).
    pub fn npc_teleport_destinations(&self, u: usize, idx: usize) -> Vec<Pos> {
        let def = &self.units[u].t.teleports[idx];
        let origin = self.units[u].pos;
        if def.tree_stride {
            let trees = self.grid.trees();
            if trees.is_empty() {
                return Vec::new();
            }
            let adj_ft = def.tree_adjacency;
            let tree_range_ft = def.tree_range;
            let near_trees: Vec<Pos> = trees
                .iter()
                .copied()
                .filter(|&t| self.square_distance(origin, t) * 5 <= adj_ft)
                .collect();
            if near_trees.is_empty() {
                return Vec::new();
            }
            let mut dest_trees: Vec<Pos> = Vec::new();
            for &t1 in &near_trees {
                for &t2 in trees {
                    if t2 != t1 && self.square_distance(t1, t2) * 5 <= tree_range_ft && !dest_trees.contains(&t2) {
                        dest_trees.push(t2);
                    }
                }
            }
            if dest_trees.is_empty() {
                return Vec::new();
            }
            let adj_sq = (adj_ft / 5).max(1);
            let mut out: Vec<Pos> = Vec::new();
            for (tx, ty) in dest_trees {
                for dx in -adj_sq..=adj_sq {
                    for dy in -adj_sq..=adj_sq {
                        let p = (tx + dx, ty + dy);
                        if p == origin || !self.grid.in_bounds(p.0, p.1) {
                            continue;
                        }
                        if self.placeable(u, p) && !out.contains(&p) {
                            out.push(p);
                        }
                    }
                }
            }
            out.sort();
            return out;
        }
        let reach = (def.range / 5).max(1);
        let mut out = Vec::new();
        let x0 = (origin.0 - reach).max(0);
        let x1 = (origin.0 + reach).min(self.grid.w - 1);
        let y0 = (origin.1 - reach).max(0);
        let y1 = (origin.1 + reach).min(self.grid.h - 1);
        for x in x0..=x1 {
            for y in y0..=y1 {
                let p = (x, y);
                if p == origin || self.square_distance(origin, p) * 5 > def.range {
                    continue;
                }
                if !self.placeable(u, p) {
                    continue;
                }
                if !self.sees_lit_square(u, p) {
                    continue;
                }
                out.push(p);
            }
        }
        out
    }

    /// `NpcTeleportAction` execution.
    fn do_npc_teleport(&mut self, src: usize, idx: usize, dest: Pos) {
        let def = &self.units[src].t.teleports[idx];
        if def.bonus_action {
            self.units[src].bonus = (self.units[src].bonus - 1).max(0);
        } else {
            self.units[src].action = (self.units[src].action - 1).max(0);
        }
        if def.recharge.is_some() && !self.units[src].recharge_spent.contains(&def.name) {
            self.units[src].recharge_spent.push(def.name);
        }
        if self.placeable(src, dest) {
            self.move_to(src, dest);
            self.prune_grapples_around(src);
        }
    }

    /// Eligible targets for Harpy `LuringSong`.
    pub fn luring_song_targets(&self, src: usize) -> Vec<usize> {
        let Some(cfg) = self.units[src].t.luring_song else { return Vec::new() };
        let gt = self.gt();
        (0..self.units.len())
            .filter(|&o| {
                if o == src || self.units[o].dead() {
                    return false;
                }
                if self.dist(src, o) * 5 > cfg.range {
                    return false;
                }
                let t = self.units[o].t;
                if !(t.pc || t.humanoid || t.giant) {
                    return false;
                }
                if self.is_lured(o) {
                    return false;
                }
                if self.units[o].luring_song_immune.iter().any(|&(s, until)| s == src && gt < until) {
                    return false;
                }
                true
            })
            .collect()
    }

    /// `LuringSongAction` execution (Harpy).
    fn do_luring_song(&mut self, src: usize) {
        let Some(cfg) = self.units[src].t.luring_song else { return };
        let targets = self.luring_song_targets(src);
        let mut saves: Vec<(usize, bool)> = Vec::with_capacity(targets.len());
        for t in targets {
            if self.units[t].t.immune_charmed {
                saves.push((t, true));
                continue;
            }
            let total = self.save_throw_ex(t, Ability::Wis, false, 0, true, true, false).0;
            saves.push((t, total >= cfg.dc));
        }
        self.units[src].action = (self.units[src].action - 1).max(0);
        if let Some(prior) = self.units[src].concentration {
            self.dismiss_effect(src, prior);
        }
        let obj = self.new_obj(
            SpellId::CharmMonster,
            crate::effects::ObjKind::LuringSong { dc: cfg.dc },
            src,
            Vec::new(),
            true,
        );
        self.concentration_on(src, obj);
        let until = self.gt() + 24 * 3600;
        for (t, passed) in saves {
            if passed {
                match self.units[t].luring_song_immune.iter_mut().find(|e| e.0 == src) {
                    Some(e) => e.1 = until,
                    None => self.units[t].luring_song_immune.push((src, until)),
                }
            } else {
                self.apply_lure(t, src, cfg.dc);
            }
        }
    }

    /// `NpcVanishAction` execution (Will-o'-Wisp).
    fn do_npc_vanish(&mut self, src: usize) {
        self.units[src].bonus = (self.units[src].bonus - 1).max(0);
        if let Some(prior) = self.units[src].concentration {
            self.dismiss_effect(src, prior);
        }
        let obj = self.new_obj(
            SpellId::Invisibility,
            crate::effects::ObjKind::Vanish,
            src,
            vec![src],
            true,
        );
        self.concentration_on(src, obj);
        self.register_effect(src, EffKey::Invisible, obj, Some(3600));
        self.register_hook(src, HookEv::AttackResolved, crate::effects::HookKind::InvisibilityBreak, obj, Some(3600));
        self.register_hook(src, HookEv::SpellCast, crate::effects::HookKind::InvisibilityBreak, obj, Some(3600));
        self.units[src].add_status(St::Invisible);
    }

    /// Check `target_if` conditions for an NPC attack (`monster_traits._target_condition`).
    pub fn attack_target_allowed(&self, src: usize, tgt: usize, def: &AttackDef) -> bool {
        if self.is_charmed_by(src, tgt) {
            return false;
        }
        if def.save_immune && self.units[tgt].save_immune_to.contains(&(src, def.name)) {
            return false;
        }
        if def.target_if.is_empty() {
            return true;
        }
        let u = &self.units[tgt];
        def.target_if.iter().any(|cond| match cond {
            TargetCond::Frightened => {
                u.has(St::Frightened) || !u.frightened_by.is_empty() || !u.source_fear.is_empty()
            }
            TargetCond::ZeroHpLiving => {
                !u.dead() && u.hp <= 0 && !u.t.undead && !u.t.construct
            }
            TargetCond::GrappledBySource => u.grappled_by.iter().any(|&(g, _)| g == src),
            TargetCond::Grappled => u.is_grappled(),
            TargetCond::CharmedBySource => self.is_charmed_by(tgt, src),
            TargetCond::Incapacitated => u.incapacitated(),
            TargetCond::Restrained => self.is_restrained(tgt),
            TargetCond::Unconscious => u.unconscious(),
            TargetCond::Paralyzed => u.has(St::Paralyzed),
            TargetCond::Prone => u.prone(),
        })
    }
}

/// `1d20+{bonus}` as natural20 builds it for initiative.
fn plus_string_modifier_init(bonus: i32) -> i32 {
    plus_string_modifier(bonus)
}

/// SRD 5.2 Great Weapon Fighting (`treat_1_2_as_3`).
pub fn apply_gwf(rolls: &mut [i32]) {
    for r in rolls.iter_mut() {
        if *r == 1 || *r == 2 {
            *r = 3;
        }
    }
}

#[allow(dead_code)]
fn unused(_: Dice) {}


#[cfg(test)]
mod srd_level_tests {
    use super::*;

    fn fight(rows: &[&str], roster: &[(&str, Pos)]) -> Fight {
        let units = roster.iter().map(|(id, _)| id.to_string()).collect::<Vec<_>>();
        let places = roster.iter().map(|&(id, (x, y))| Placement { id: id.into(), x, y }).collect::<Vec<_>>();
        let mut f = Fight::on_map(ContentPool::global(), Grid::shared(rows).unwrap(), &units, &places, 30, Trace::recording(17)).unwrap();
        f.order = (0..units.len()).collect();
        f
    }

    #[test]
    fn blessed_death_saves_keep_the_natural_faces_and_legacy_draws() {
        use crate::effects::{EffKey, ObjKind};
        use crate::tape::{DrawVal, Ev};
        for (version, face, bonus, cursed, saves, fails, hp) in [
            (13, 8, Some(2), false, 1, 0, 0), (13, 5, Some(4), false, 0, 1, 0),
            (13, 1, Some(4), false, 0, 2, 0), (13, 20, Some(1), false, 0, 0, 1),
            (13, 20, Some(1), true, 1, 0, 0), (12, 8, None, false, 0, 1, 0),
        ] {
            let mut f = fight(&["....."], &[("guy", (0,0)), ("elion", (1,0))]);
            f.set_rule_version(version);
            f.units[0].hp = 0;
            f.make_unconscious(0);
            f.units[0].cursed = cursed;
            let obj = f.new_obj(SpellId::Bless, ObjKind::Spell, 1, vec![0], false);
            f.register_effect(0, EffKey::Bless, obj, None);
            let draw = |tag: &str, sides, value| Ev::Draw {
                who: "guy".into(), tag: tag.into(), sides, mode: "n".into(), v: DrawVal::One(value), expr: None,
            };
            let mut draws = vec![draw("death_saving_throw", 20, face)];
            if let Some(value) = bonus { draws.push(draw("bless", 4, value)); }
            f.trace = Trace::web_replay_draws(draws);
            f.death_saving_throw(0);
            assert_eq!((f.units[0].death_saves, f.units[0].death_fails, f.units[0].hp), (saves, fails, hp));
            assert_eq!(f.trace.remaining(), 0);
        }
    }

    #[test]
    fn dodge_is_lost_on_knockout_even_if_healed_before_the_next_turn() {
        for version in [12, 13] {
            let mut f = fight(&["....."], &[("guy", (0,0)), ("elion", (1,0))]);
            f.set_rule_version(version);
            f.units[0].dodge = true;
            f.units[0].hp = 0;
            f.make_unconscious(0);
            f.heal(0, 5);
            assert_eq!(f.benefits_from_dodge(0), version == 12);
        }
    }

    #[test]
    fn specter_crosses_enemies_and_walls_pays_only_inside_a_wall_at_turn_end() {
        let mut f = fight(&[".....", "..H..", "....."], &[("specter-1", (0,1)), ("elion", (1,1))]);
        let path = [(0,1), (1,1), (2,1), (3,1)];
        assert!(f.passable(0, (1,1)) && !f.placeable(0, (1,1)));
        assert!(!f.passable(0, (-1,1)));
        assert_eq!(f.compute_actual_moves(0, &path, 5), (path.to_vec(), 0));
        assert_eq!(f.compute_actual_moves(0, &path, 4).0, path[..3]);
        let before = f.units[0].hp;
        f.move_to(0, (2,1));
        assert_eq!(f.units[0].hp, before);
        f.web_events = Some(Vec::new());
        f.battle_end_turn();
        let damage = before - f.units[0].hp;
        assert!((1..=10).contains(&damage));
        assert!(f.take_web_events().iter().any(|ev| matches!(ev,
            crate::web_events::WebEv::IncorporealDamage { target: 0, roll, applied, .. }
            if *roll == damage && *applied == damage)));
        let after = f.units[0].hp;
        f.move_to(0, (3,1));
        f.battle_end_turn();
        assert_eq!(f.units[0].hp, after);
    }

    #[test]
    fn shadow_stealth_uses_the_current_square_and_spends_the_bonus_action() {
        let mut f = fight(&[".dD.."], &[("shadow-1", (0,0)), ("guy", (4,0))]);
        f.units[0].bonus = 1;
        let start = 4 * f.grid.cells();
        assert_eq!(&f.grid.static_planes()[start..start + 5], &[2, 1, 0, 2, 2]);
        assert!(!f.available_moves(0).contains(&Act::HideBonus));
        f.move_to(0, (1,0));
        assert!(f.available_moves(0).contains(&Act::HideBonus));
        f.move_to(0, (2,0));
        assert!(f.available_moves(0).contains(&Act::HideBonus));
        assert!(!f.can_see(1, 0));
        f.execute_action(0, &Act::HideBonus);
        assert_eq!(f.units[0].bonus, 0);
        assert!(!f.available_moves(0).contains(&Act::HideBonus));
    }

    #[test]
    fn a_partial_wall_opening_has_reciprocal_sight() {
        let a = (2, 5);
        let b = (0, 0);
        let mut f = fight(&["...", "H..", "H..", "..H", "...", "H.."], &[("guy", a), ("mummy-1", b)]);
        assert!(!f.grid.los(a, b));
        assert!(f.can_see(0, 1) && f.can_see(1, 0));
        assert!(f.clear_effect(a, b) && !f.clear_effect(b, a));
        assert_eq!(f.cover_bonus_from(b, 0), 2);
        assert_eq!(f.known_point_cover(a, 1, 0), 5);
        assert_eq!(f.known_point_cover(b, 0, 0), 0);
        f.set_rule_version(10);
        assert_eq!(f.cover_bonus_from(b, 0), 5);
        f.set_rule_version(9);
        assert!(f.can_see(0, 1));
        assert!(!f.can_see(1, 0));
    }

    #[test]
    fn cover_from_creatures_and_wall_edges_uses_the_effect_origin() {
        let mut f = fight(&["....."; 5], &[("guy",(0,2)), ("goblin_warrior-1",(2,2)), ("specter-1",(4,2))]);
        assert_eq!(f.cover_bonus_from((0,2), 2), 2);
        assert_eq!(f.attack_ac((0,2), 2), f.armor_class(2) + 2);
        assert_eq!(f.save_cover((0,2), 2, Ability::Dex), 2);
        assert_eq!(f.save_cover((0,2), 2, Ability::Con), 0);
        assert_eq!(f.cover_bonus_from((3,2), 2), 0);
        assert_eq!(f.known_cover((0,2), 2, 1 << 1), 0);
        f.units[1].hp = 0;
        f.units[1].add_status(St::Dead);
        assert_eq!(f.cover_bonus_from((0,2), 2), 0);
        let mut edge = fight(&[".....","..H..",".....",".....","....."], &[("guy",(0,0)),("shadow-1",(4,1))]);
        assert!(edge.clear_effect((0,0), (4,1)));
        assert_eq!(edge.cover_bonus_from((0,0), 1), 2);
        assert_eq!(edge.point_save_cover((0,0), 1, Ability::Dex), 2);
        edge.move_to(1, (4,0));
        assert!(edge.clear_effect((0,1), (4,0)));
        assert_eq!(edge.cover_bonus_from((0,1), 1), 2);
        assert_eq!(edge.point_save_cover((0,1), 1, Ability::Dex), 5);
        assert!(!edge.clear_effect((0,1), (4,1)));
    }

    #[test]
    fn best_corner_clears_diagonal_figures_and_one_wall_but_not_two_walls() {
        let src = (1, 1);
        let dst = (2, 2);
        let mut f = fight(&["...."; 4], &[("mara", src), ("goblin_boss-1", dst),
            ("guy", (1, 2)), ("animated_armor-1", (2, 1))]);
        assert_eq!(f.known_point_cover(src, 1, 0), 2);
        assert_eq!(f.attack_ac(src, 1), f.armor_class(1));
        f.set_rule_version(10);
        assert_eq!(f.attack_ac(src, 1), f.armor_class(1) + 2);

        for (side, visible) in [("....", true), (".H..", false)] {
            let f = fight(&["....", "..H.", side, "...."], &[("mara", src), ("goblin_boss-1", dst)]);
            assert_eq!(f.clear_sight(src, dst), visible);
            assert_eq!(f.clear_sight(dst, src), visible);
            assert_eq!(f.grid.corner_wall_grade(src, dst), if visible { 0 } else { 4 });
        }
    }

    #[test]
    fn skeleton_shortbow_uses_best_corner_for_remembered_squares() {
        for (origin, target, wall_row, grade) in [
            ((1, 9), (13, 10), "..H............", 2),
            ((1, 10), (14, 9), "...........H.H.", 3),
            ((1, 9), (13, 9), "..H............", 4),
            ((1, 9), (13, 9), ".............H.", 4),
        ] {
            let mut rows = ["..............."; 11];
            rows[9] = wall_row;
            let mut f = fight(&rows, &[("skeleton-1", origin), ("guy", (0, 0))]);
            f.units[0].action = 1;
            f.units[0].unseen.push((1, target, f.round));
            f.units[1].hidden_stealth = Some(40);
            f.units[1].add_status(St::Hidden);
            assert_eq!(f.grid.corner_wall_grade(origin, target), grade);
            for version in [14, 15] {
                f.set_rule_version(version);
                let moves = f.available_moves(0);
                let shortbow = moves.iter().any(|a| matches!(a, Act::BlindAttack { atk, square, heard: false }
                    if f.units[0].t.attacks[*atk].name == "shortbow" && *square == target));
                assert_eq!(shortbow, version >= 15 && grade < 4, "v{version} {origin:?} -> {target:?}");
            }
        }
    }

    #[test]
    fn either_movers_exposed_step_ends_hide_even_if_both_endpoints_are_protected() {
        let rows = [".......", ".......", ".HH.HH.", ".......", "......."];
        let path = [(1,3), (2,3), (3,3), (4,3), (5,3)];
        for (goblin, hero, mover) in [((1,3), (3,0), 0), ((3,0), (1,3), 1)] {
            let mut f = fight(&rows, &[("goblin_boss-1", goblin), ("guy", hero)]);
            assert!(!f.sees_hider_clearly(1, 0));
            f.units[0].hidden_stealth = Some(40);
            f.units[0].add_status(St::Hidden);
            f.units[mover].movement = 30;
            f.web_events = Some(Vec::new());
            f.commit_move_segment(mover, path.to_vec());
            assert_eq!(f.units[mover].pos, (5,3));
            assert!(!f.sees_hider_clearly(1, 0));
            assert!(!f.units[0].hidden());
            use crate::web_events::WebEv;
            let events = f.take_web_events();
            assert!(matches!(events.as_slice(), [WebEv::MoveExecuted { u, .. }, WebEv::HiddenFound { target: 0 }] if *u == mover));
        }
        let mut f = fight(&rows, &[("goblin_boss-1", (2,3)), ("guy", (3,0))]);
        assert!(f.can_see(1, 0));
        assert_eq!(f.cover_bonus_from((3,0), 0), 5);
        assert!(!f.sees_hider_clearly(1, 0));
        f.units[0].hidden_stealth = Some(40);
        f.set_rule_version(10);
        f.move_to(0, (3,3));
        assert!(f.units[0].hidden());
    }

    #[test]
    fn redirect_on_a_miss_can_be_declined_or_chosen() {
        let mut f = fight(&["....."; 3], &[("mara", (1, 1)), ("goblin_boss-1", (2, 1)), ("goblin_minion-1", (3, 1))]);
        let origin = f.units[0].pos;
        f.set_rule_version(11);
        assert_eq!(f.redirect_window(0, 1, 10, 15, true, origin), None);
        assert!(f.trace.recorded().is_empty());

        f.set_rule_version(CURRENT_RULE_VERSION);
        assert_eq!(f.redirect_window(0, 1, 1, 25, false, origin), None);
        assert!(matches!(f.trace.recorded().as_slice(), [Ev::Dec { cands, chosen, .. }]
            if cands == &["redirect_attack:>goblin_minion-1:reaction"] && chosen == "none"));
        assert_eq!(f.units[1].reaction, 1);

        f.prefer.push("goblin_boss:redirect_attack".into());
        assert_eq!(f.redirect_window(0, 1, 10, 15, true, origin), Some(2));
        assert_eq!((f.units[1].pos, f.units[2].pos), ((3, 1), (2, 1)));
        assert_eq!(f.units[1].reaction, 0);
    }

    #[test]
    fn spiritual_weapon_previews_the_square_it_will_strike_from() {
        use crate::effects::ObjKind;
        let mut f = fight(&["HHHHHHH", ".......", "HHHHHHH"], &[("elion", (0, 1)), ("animated_armor-1", (5, 1))]);
        let force = f.new_obj(SpellId::SpiritualWeapon, ObjKind::Force {
            level: 2, pos: (1, 1), modifier: 3, cast_turn: (-1, 0), last_attack_turn: None, expires_at: 1000,
        }, 0, Vec::new(), true);
        f.set_rule_version(11);
        assert_eq!(f.force_attack_origin(0, 1, Some(force)), (1, 1));
        f.set_rule_version(CURRENT_RULE_VERSION);
        assert_eq!(f.force_attack_origin(0, 1, Some(force)), (4, 1));
        assert!(matches!(f.objs[force as usize].kind, ObjKind::Force { pos: (1, 1), .. }));
        f.move_to(1, (2, 1));
        assert_eq!(f.force_attack_origin(0, 1, Some(force)), (1, 1));
    }

    #[test]
    fn turned_specter_crosses_walls_to_retreat_without_ending_on_one() {
        let mut f = fight(&["..H..H", "..H.HH", "..H.HH", "....HH"], &[("specter-1", (1,0)), ("elion", (0,0))]);
        f.units[0].turned_by.push((1, 60, true));
        f.units[0].add_status(St::Incapacitated);
        f.units[0].movement = 50;
        let path = f.flee_step(0).unwrap();
        assert_eq!(path, [(1,0), (2,0), (3,0), (4,0)]);
        f.commit_move_segment(0, path);
        assert!(f.units[0].movement >= 10);
        assert!(f.flee_step(0).is_none());
        let hp = f.units[0].hp;
        f.battle_end_turn();
        assert_eq!(f.units[0].hp, hp);
        assert!(f.is_turned(0));
        f.move_to(0, (5,0));
        f.battle_end_turn();
        assert!((1..=10).contains(&(hp - f.units[0].hp)));
        assert!(!f.is_turned(0));

        let mut f = fight(&["....H", "....."], &[("specter-1", (3,0)), ("elion", (0,0))]);
        f.move_to(0, (4,0));
        f.units[0].turned_by.push((1, 60, true));
        f.units[0].movement = 5;
        assert_eq!(f.flee_step(0).as_deref(), Some([(4,0), (4,1)].as_slice()));
    }

    #[test]
    fn spell_payments_and_dc_keep_their_source() {
        let mut f = fight(&["....."], &[("curogana",(0,0)), ("zombie-1",(3,0))]);
        f.units[0].action = 1;
        f.units[0].innate_until = Some(60);
        assert_eq!(f.spell_dc_for(0, SpellId::AcidSplash), f.spell_dc(0) + 1);
        assert_eq!(f.spell_dc_for(0, SpellId::Command), f.spell_dc(0) + 1);
        assert_eq!(f.spell_dc_for(0, SpellId::SacredFlame), f.spell_dc(0));
        let choices = |f: &mut Fight| {
            let mut acts = Vec::new();
            f.human_spell_candidates(0, &mut acts);
            acts.into_iter().filter_map(|a| match a {
                Act::Spell(c) if c.spell == SpellId::MagicMissile && c.mm.is_none() => Some((c.at_level,c.free,c.targets.len())),
                _ => None,
            }).collect::<std::collections::BTreeSet<_>>()
        };
        assert_eq!(choices(&mut f), [(1,true,3),(1,false,3),(2,false,4)].into_iter().collect());
        f.units[0].last_slot_turn = Some((f.round, f.turn_idx));
        assert_eq!(choices(&mut f), [(1,true,3)].into_iter().collect());
    }
}
