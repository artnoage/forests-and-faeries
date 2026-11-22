//! The observation encoder (GENERAL_ENV.md §5; stage G5).
//!
//! [`encode`] turns the pending decision of an [`Env`] (or a finished game,
//! from one team's view) into the fixed-layout arrays the Python trainer
//! reads (`ember_rl/general_env.py`, `general_model.py` in
//! natural20-metaskepsis): creature tokens, map channels on a 32x32 canvas,
//! a global vector, candidate rows with creature and cell pointers, and the
//! native-score arrays (distillation targets, never model inputs).
//!
//! It writes into caller-owned buffers ([`ObsSlot`]), so the bindings (G6)
//! can expose them as numpy views without copies; [`Obs`] is an owned
//! buffer for tools and tests. It reads the game only (`&Env`): no state
//! changes, no dice, no native memory (line-of-sight rows of the map are
//! filled lazily, as everywhere else).
//!
//! Every float has a stable name ([`feature_names`], `docs/FEATURES.md`).
//! Any change to a feature's meaning or position bumps [`FEATURE_VERSION`].
//!
//! Interpretations (see GENERAL_ENV.md "G5 status"):
//! - token order is the roster (registration) order; pointers index it;
//! - positions are canvas coordinates (the map offset included);
//! - path costs follow the action space: one-square moves, each ending on a
//!   free square (no creature, no corpse), heroes without corner cutting,
//!   one square of movement per step, two while prone;
//! - "enemy" and "ally" are relative to the view team (the deciding team, or
//!   the named team of a final view);
//! - the rules estimates are the closed forms natural20's scoring uses
//!   (`prob_at_least`, `save_fail_chance`, `spell_attack_estimate`,
//!   `save_fail_probability`, damage multipliers), not the native score;
//! - per-team visibility (G8b): a creature of the other team that is hidden
//!   (`St::Hidden`) and seen by no conscious member of the view team is
//!   *masked*: its token keeps its identity, vitals and resources but no
//!   position (position group zeroed, path cost -1, `hidden` set), it is
//!   absent from every map channel (no token, no threat, no exposure, not an
//!   obstacle of the path-cost BFS), from the enemy distances and the move
//!   rows' reach and opportunity-attack counts, from area-spell target lists
//!   and their estimates, and a blind attack on its square is estimated as on
//!   an empty square. A state without a masked creature encodes exactly as
//!   before (`tests/encode_v1.rs`).
//!
//! Versions ([`Version`], GENERAL_ENV.md "ember-gen-v2"): `ember-gen-v2`
//! (the default) appends features to the creature token, the global vector
//! and the candidate row and adds the pairwise relation array
//! `creature_rel`; `ember-gen-v1` is exactly the v2 arrays' prefixes without
//! `creature_rel`, byte for byte what the v1 encoder wrote
//! (`tests/encode_v1.rs`). The version is chosen per observation buffer
//! ([`ObsSlot::version`]).

use std::cell::RefCell;

use crate::content::{Ability, ContentPool, Dice, Dmg, OnHit, SpellId};
use crate::dice::{expected, plus_string_modifier, prob_at_least, save_fail_chance};
use crate::effects::{EffKey, ObjKind};
use crate::engine::{Act, Fight, St, WeaponKind};
use crate::env::{Env, Unscored};
use crate::map::{Pos, STATIC_PLANES};
use crate::spells::{Cast, Mm};
use crate::trace::RollMode;

/// The observation schema (the default [`Version`]). Checkpoints are
/// rejected on mismatch.
pub const FEATURE_VERSION: &str = "ember-gen-v2";
/// The previous schema, still available ([`Version::V1`]).
pub const FEATURE_VERSION_V1: &str = "ember-gen-v1";
/// Creature cap (token slots).
pub const N: usize = 24;
/// Target slots per candidate.
pub const T: usize = 8;
/// Floats per creature token, per global vector, per candidate row
/// (`ember-gen-v2`).
pub const F_C: usize = 183;
pub const F_G: usize = 34;
pub const F_A: usize = 122;
/// The `ember-gen-v1` widths: the prefixes of the v2 rows.
pub const F_C_V1: usize = 160;
pub const F_G_V1: usize = 32;
pub const F_A_V1: usize = 112;
/// Pairwise relation channels (`creature_rel[i, j, r]`, `ember-gen-v2`).
pub const R: usize = 5;
/// Map channels (`ember-gen-v2`; v1: the first 16) and canvas side.
pub const MAP_C: usize = 17;
pub const MAP_C_V1: usize = 16;
pub const S: usize = 32;
pub const CELLS: usize = S * S;

/// `dims` as the trainer reads them (`general_env.DEFAULT_DIMS`), `ember-gen-v2`.
pub const DIMS: [(&str, usize); 8] = [
    ("N", N),
    ("T", T),
    ("creature", F_C),
    ("global", F_G),
    ("cand", F_A),
    ("map_channels", MAP_C),
    ("canvas", S),
    ("relations", R),
];
/// `dims` of `ember-gen-v1`.
pub const DIMS_V1: [(&str, usize); 7] =
    [("N", N), ("T", T), ("creature", F_C_V1), ("global", F_G_V1), ("cand", F_A_V1), ("map_channels", MAP_C_V1), ("canvas", S)];

/// An observation schema. `V1` writes the v2 arrays' prefixes and no
/// `creature_rel` (exactly what the v1 encoder wrote).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum Version {
    V1,
    #[default]
    V2,
    V3,
}

impl Version {
    pub const ALL: [Version; 3] = [Version::V1, Version::V2, Version::V3];

    pub fn name(self) -> &'static str {
        match self {
            Version::V1 => FEATURE_VERSION_V1,
            Version::V2 => FEATURE_VERSION,
            Version::V3 => "ember-gen-v3",
        }
    }

    /// `ember-gen-v1` / `v1` / `1`, `ember-gen-v2` / `v2` / `2`.
    pub fn parse(s: &str) -> Result<Version, String> {
        match s {
            "ember-gen-v1" | "v1" | "1" => Ok(Version::V1),
            "ember-gen-v2" | "v2" | "2" => Ok(Version::V2),
            "ember-gen-v3" | "v3" | "3" => Ok(Version::V3),
            other => Err(format!("unknown feature version {other:?}")),
        }
    }

    /// Floats per creature token.
    pub fn creature(self) -> usize {
        match self {
            Version::V1 => F_C_V1,
            Version::V2 | Version::V3 => F_C,
        }
    }

    /// Floats per global vector.
    pub fn global(self) -> usize {
        match self {
            Version::V1 => F_G_V1,
            Version::V2 | Version::V3 => F_G,
        }
    }

    /// Floats per candidate row.
    pub fn cand(self) -> usize {
        match self {
            Version::V1 => F_A_V1,
            Version::V2 | Version::V3 => F_A,
        }
    }

    /// Map channels.
    pub fn map_channels(self) -> usize {
        match self {
            Version::V1 => MAP_C_V1,
            Version::V2 | Version::V3 => MAP_C,
        }
    }

    /// Relation channels (0: no `creature_rel` array).
    pub fn relations(self) -> usize {
        match self {
            Version::V1 => 0,
            Version::V2 | Version::V3 => R,
        }
    }

    /// `dims` as the trainer checks them.
    pub fn dims(self) -> &'static [(&'static str, usize)] {
        match self {
            Version::V1 => &DIMS_V1,
            Version::V2 | Version::V3 => &DIMS,
        }
    }

    /// The feature names of this version (v1: the prefixes, no relations).
    pub fn names(self) -> FeatureNames {
        match self {
            Version::V1 => FeatureNames {
                creature: &CREATURE_FEATURES[..F_C_V1],
                global: &GLOBAL_FEATURES[..F_G_V1],
                cand: &CAND_FEATURES[..F_A_V1],
                map: &MAP_CHANNELS[..MAP_C_V1],
                relations: &[],
            },
            Version::V2 | Version::V3 => feature_names(),
        }
    }
}

/// The `action_kinds` vocabulary names, in `Act` order of [`act_kind_index`].
pub const ACTION_KINDS: [&str; 26] = [
    "move",
    "attack",
    "dash",
    "dodge",
    "stand",
    "second_wind",
    "action_surge",
    "spell",
    "channel_divinity_turn_undead",
    "divine_spark",
    "preserve_life",
    "spiritual_weapon_attack",
    "innate_sorcery",
    "dragons_breath_exhale",
    "end_turn",
    // G8b (vocabulary ids 15-17)
    "disengage_bonus",
    "hide_bonus",
    "redirect_attack",
    // Chruna (vocabulary ids 18-21)
    "rage",
    "extend_rage",
    "reckless_attack",
    "cleave",
    "disengage",
    "spiritual_weapon_move",
    "create_spell_slot",
    "convert_spell_slot",
];

// ----------------------------------------------------------------------------
// Feature names (the layout). Each array is the single source of truth: the
// encoder resolves positions by name at compile time (`ci!`, `gi!`, `ai!`).
// ----------------------------------------------------------------------------

/// Creature token (GENERAL_ENV.md §5.2), 160 floats.
pub const CREATURE_FEATURES: [&str; F_C] = [
    // relation (5)
    "is_actor", "ally", "enemy", "side_heroes", "is_pc",
    // position (10)
    "x_div32", "y_div32", "dx_div32", "dy_div32", "dist_div32", "cheb_div32", "path_cost_div32",
    "in_actor_reach", "actor_sees", "sees_actor",
    // vitals (11)
    "hp_div100", "max_hp_div100", "hp_frac", "temp_hp_div100", "conscious", "dying", "stable", "dead",
    "death_saves_div3", "death_fails_div3", "max_hp_reduction_div100",
    // defense and movement (6)
    "ac_div20", "speed_div60", "fly", "size_small", "size_medium", "size_large",
    // abilities (12)
    "str_mod_div5", "dex_mod_div5", "con_mod_div5", "int_mod_div5", "wis_mod_div5", "cha_mod_div5",
    "save_str_div10", "save_dex_div10", "save_con_div10", "save_int_div10", "save_wis_div10", "save_cha_div10",
    // damage response (39): Dmg::ALL order
    "resist_acid", "resist_bludgeoning", "resist_cold", "resist_fire", "resist_force", "resist_lightning",
    "resist_necrotic", "resist_piercing", "resist_poison", "resist_psychic", "resist_radiant", "resist_slashing",
    "resist_thunder",
    "vuln_acid", "vuln_bludgeoning", "vuln_cold", "vuln_fire", "vuln_force", "vuln_lightning",
    "vuln_necrotic", "vuln_piercing", "vuln_poison", "vuln_psychic", "vuln_radiant", "vuln_slashing",
    "vuln_thunder",
    "immune_acid", "immune_bludgeoning", "immune_cold", "immune_fire", "immune_force", "immune_lightning",
    "immune_necrotic", "immune_piercing", "immune_poison", "immune_psychic", "immune_radiant", "immune_slashing",
    "immune_thunder",
    // condition immunities (6)
    "cimm_prone", "cimm_paralyzed", "cimm_poisoned", "cimm_frightened", "cimm_charmed", "cimm_exhaustion",
    // conditions (12)
    "prone", "paralyzed", "incapacitated", "frightened", "poisoned", "turned", "dodging", "disengaged",
    "commanded", "hidden", "stench_immune_div4", "str_drain_div10",
    // effects and gear (20)
    "fx_bless", "fx_shield", "fx_shield_of_faith", "fx_blur", "fx_sanctuary", "fx_aid_div10",
    "fx_guiding_bolt_mark", "fx_protection_evil_good", "fx_ray_of_frost_slow", "fx_dragons_breath",
    "fx_innate_sorcery", "fx_spiritual_weapon", "fx_mage_armor", "fx_sapped", "concentrating",
    "thrown_left_div2", "hand_slots_div2", "wearing_armor", "can_shield", "undead_fortitude",
    // turn resources (7)
    "action", "bonus_action", "reaction", "movement_div60", "multiattack_left_div3", "action_surge_active",
    "slot_spell_cast",
    // class resources (12)
    "slots_l1_div4", "slots_l2_div4", "slots_l3_div4", "slots_l4_div4", "slots_l5_div4", "sorcery_points_div5",
    "channel_divinity_div2", "second_wind_div3", "action_surge_uses", "free_casts_div2",
    "innate_sorcery_uses_div2", "holy_water",
    // offense summary (13)
    "melee_to_hit_div10", "ranged_to_hit_div10", "reach_div10", "weapon_range_div120", "attacks_per_action_div3",
    "dpr_vs_ac14_div20", "spell_attack_div10", "spell_dc_div20", "caster", "has_area_spell", "has_heal",
    "has_ranged_attack", "level_div5",
    // initiative (4)
    "turns_until_acts_div24", "acted_this_round", "initiative_div30", "is_current",
    // traits (3)
    "undead", "elf", "stench_dc_div20",
    // ---- ember-gen-v2 (160-182) ----
    // fear and curse (8): its own state, and relations to the actor (0 without one)
    "cursed", "fear_sources_div4", "fear_disadvantage", "frightens_div4", "fears_actor", "feared_by_actor",
    "save_immune_to_actor", "actor_save_immune",
    // attack riders it can inflict (9): multi-hot over its available attacks
    "atk_paralysis", "atk_life_drain", "atk_strength_drain", "atk_curse", "atk_frighten", "atk_kill_at_zero",
    "atk_save", "atk_sap", "atk_adv_damage",
    // traits and senses (6)
    "passive_perception_div20", "stealth_total_div20", "pfeg_protected", "nimble_escape", "redirect_reaction",
    "turn_undead",
];

/// Global vector (§5.4), 32 floats.
pub const GLOBAL_FEATURES: [&str; F_G] = [
    "round_div30", "rounds_left_div30", "standing_weight", "objective_health",
    "ally_hp_frac", "enemy_hp_frac", "ally_standing_frac", "enemy_standing_frac",
    "ally_count_div16", "enemy_count_div16", "turn_actions_div24", "map_w_div32", "map_h_div32",
    "party_level_div5", "monster_xp_div2000", "view_heroes", "has_actor", "finished", "horizon",
    "round_progress", "ally_hp_div100", "enemy_hp_div100", "ally_dpr_div50", "enemy_dpr_div50", "floor_frac",
    // Mummy (filled reserved slots: 0 in every state without fear or a curse)
    "actor_fear_disadvantage", "actor_cursed", "ally_cursed_div4", "enemy_cursed_div4",
    "reserved_29", "reserved_30", "reserved_31",
    // ---- ember-gen-v2 (32-33): hero levels (mixed parties) ----
    "party_level_min_div5", "party_level_max_div5",
];

/// Candidate row (§5.5), 112 floats.
pub const CAND_FEATURES: [&str; F_A] = [
    // kind and cost (12)
    "uses_action", "uses_bonus_action", "uses_reaction", "move_squares_div12", "no_cost", "is_end_turn",
    "is_opportunity_attack", "forced", "slot_level_div9", "free_cast", "sorcery_points_div5", "channel_divinity",
    // damage (16): dice of the attack, spell or feature
    "dmg_mean_div20", "dmg_max_div40",
    "dmg_acid", "dmg_bludgeoning", "dmg_cold", "dmg_fire", "dmg_force", "dmg_lightning", "dmg_necrotic",
    "dmg_piercing", "dmg_poison", "dmg_psychic", "dmg_radiant", "dmg_slashing", "dmg_thunder",
    "half_on_save",
    // attack descriptor (19)
    "weapon_attack", "melee", "ranged", "thrown", "blind", "reach_div10", "range_div120", "long_range_div600",
    "uses_long_range", "to_hit_div10", "save_based", "save_dc_div20", "rider_paralysis", "rider_life_drain",
    "rider_strength_drain", "rider_sap", "graze_div5", "rider_adv_damage", "multiattack_member",
    // spell descriptor (23)
    "spell", "spell_level_div9", "cast_level_div9", "cantrip", "spell_attack_roll",
    "save_vs_str", "save_vs_dex", "save_vs_con", "save_vs_int", "save_vs_wis", "save_vs_cha",
    "area_cone", "area_cube", "area_sphere", "area_line", "concentration", "heals", "buff", "projectiles_div5",
    "mm_empowered", "mm_heightened", "duration_div10", "ends_concentration",
    // rules estimates (12)
    "p_success", "exp_dmg_enemies_div40", "exp_heal_div20", "exp_dmg_allies_div40", "enemies_affected_div4",
    "allies_affected_div4", "advantage", "disadvantage", "target_downed", "provokes_concentration", "p_crit",
    "lethal_frac",
    // move (18)
    "dir_nw", "dir_n", "dir_ne", "dir_w", "dir_e", "dir_sw", "dir_s", "dir_se",
    "enemy_steps_before_div32", "enemy_steps_after_div32", "opportunity_attacks_div4", "dest_threat_div4",
    "dest_exposure_div4", "leaves_enemy_reach", "enters_enemy_reach", "dest_difficult", "prone_move", "dest_cover",
    // features (12)
    "spark_heal", "spark_harm", "turn_undead_targets_div4", "preserve_life_div20", "innate_sorcery",
    "breath_exhale", "spiritual_weapon_attack", "targets_self", "action_surge", "dash_squares_div12", "dodge",
    "stand",
    // ---- ember-gen-v2 (112-119) ----
    // riders (5): what a hit or a failed save does besides damage (content data)
    "rider_curse", "rider_frighten", "kill_at_zero", "no_damage", "immune_on_save",
    // rider estimates (2) and the frightened actor's destination (1)
    "p_curse", "p_frighten", "dest_sees_fear_source",
    // the move re-enters a square the actor already stood on this turn (map
    // channel 16); one-square steps the row walks (1 for a one-square move)
    "dest_visited", "path_steps_div12",
];

/// Map channels (§5.3), uint8.
pub const MAP_CHANNELS: [&str; MAP_C] = [
    "inside", "wall", "difficult", "cover", "light", "actor", "ally", "enemy", "downed_ally", "downed_enemy",
    "corpse", "enemy_threat", "enemy_exposure", "path_cost", "reachable", "actor_los",
    // ember-gen-v2: the squares the actor stood on this turn (start square, every step, its square)
    "actor_trail",
];

/// Relation channels of `creature_rel[i, j, r]` (`ember-gen-v2`, uint8 0/1;
/// 0 on the diagonal, on padding and when `i` or `j` is dead).
pub const RELATIONS: [&str; R] = [
    // `j` is an active source of `i`'s Frightened (Turn Undead, Dreadful Glare)
    "frightened_of",
    // `i` is immune to a save effect of `j` (saved against an
    // `immune_on_success` attack of `j`, or against `j`'s Stench)
    "save_immune",
    // `i` is under an effect `j` caused (a spell or feature effect, Sap,
    // Stench poison, Turn Undead's turning)
    "effect_from",
    // `i` can see `j` (`Fight::can_see`); 0 if either is masked from the view
    "sees",
    // `i` stands within `j`'s melee reach; 0 if either is masked from the view
    "in_reach",
];

/// The names of every float of the three float arrays, the map channels and
/// the relation channels.
pub struct FeatureNames {
    pub creature: &'static [&'static str],
    pub global: &'static [&'static str],
    pub cand: &'static [&'static str],
    pub map: &'static [&'static str],
    pub relations: &'static [&'static str],
}

/// The names of the default version (`ember-gen-v2`); [`Version::names`] for
/// another.
pub fn feature_names() -> FeatureNames {
    FeatureNames {
        creature: &CREATURE_FEATURES,
        global: &GLOBAL_FEATURES,
        cand: &CAND_FEATURES,
        map: &MAP_CHANNELS,
        relations: &RELATIONS,
    }
}

/// Position of `key` in `names` (compile time; an unknown name does not compile).
pub const fn find(names: &[&str], key: &str) -> usize {
    let k = key.as_bytes();
    let mut i = 0;
    while i < names.len() {
        let n = names[i].as_bytes();
        if n.len() == k.len() {
            let mut j = 0;
            let mut eq = true;
            while j < n.len() {
                if n[j] != k[j] {
                    eq = false;
                    break;
                }
                j += 1;
            }
            if eq {
                return i;
            }
        }
        i += 1;
    }
    panic!("unknown feature name")
}

macro_rules! ci {
    ($n:literal) => {{
        const I: usize = find(&CREATURE_FEATURES, $n);
        I
    }};
}
macro_rules! gi {
    ($n:literal) => {{
        const I: usize = find(&GLOBAL_FEATURES, $n);
        I
    }};
}
macro_rules! ai {
    ($n:literal) => {{
        const I: usize = find(&CAND_FEATURES, $n);
        I
    }};
}

/// Map channel numbers.
mod ch {
    pub const INSIDE: usize = 0;
    pub const ACTOR: usize = 5;
    pub const ALLY: usize = 6;
    pub const ENEMY: usize = 7;
    pub const DOWNED_ALLY: usize = 8;
    pub const DOWNED_ENEMY: usize = 9;
    pub const CORPSE: usize = 10;
    pub const THREAT: usize = 11;
    pub const EXPOSURE: usize = 12;
    pub const PATH: usize = 13;
    pub const REACH: usize = 14;
    pub const LOS: usize = 15;
    /// `ember-gen-v2`.
    pub const TRAIL: usize = 16;
}

/// The feature list as Markdown (`docs/FEATURES.md`).
pub fn features_markdown() -> String {
    let mut s = String::new();
    s.push_str("# Observation features (`");
    s.push_str(FEATURE_VERSION);
    s.push_str("`)\n\n");
    s.push_str(
        "Generated by `ember features` from `src/encode.rs` (`feature_names()`); do not edit by hand.\n\
         The layout and its meaning were designed in the maintainers' internal notes (`GENERAL_ENV.md` §5, \"G5 status\" and \"ember-gen-v2\"), which are not part of this repository.\n\n",
    );
    s.push_str("Select `ember-gen-v3` to compute individual and party levels from all declared classes. \
                V2 and v3 have the same tensor shapes and use the base hero for both identity embeddings. \
                A fresh v3 learner can import v2 weights with `--transfer-v2-weights` and `--init-heroes` or `--init-monsters`.\n\n");
    s.push_str("Dimensions: ");
    let dims: Vec<String> = DIMS.iter().map(|(k, v)| format!("{k} = {v}")).collect();
    s.push_str(&dims.join(", "));
    s.push_str(".\n\n");
    s.push_str(&format!(
        "`{FEATURE_VERSION_V1}` (still available, `Version::V1`) is the prefix of each array: creature \
         0-{}, global 0-{}, candidate 0-{}, map channels 0-{}; no `creature_rel`.\n",
        F_C_V1 - 1,
        F_G_V1 - 1,
        F_A_V1 - 1,
        MAP_C_V1 - 1
    ));
    let table = |s: &mut String, title: &str, names: &[&str]| {
        s.push_str(&format!("\n## {title} ({} values)\n\n| # | Name |\n|---|---|\n", names.len()));
        for (i, n) in names.iter().enumerate() {
            s.push_str(&format!("| {i} | `{n}` |\n"));
        }
    };
    table(&mut s, "Creature token `creatures`", &CREATURE_FEATURES);
    table(&mut s, "Global `global`", &GLOBAL_FEATURES);
    table(&mut s, "Candidate row `cands`", &CAND_FEATURES);
    table(&mut s, "Map channels `map` (uint8)", &MAP_CHANNELS);
    table(&mut s, "Relation channels `creature_rel[i, j, r]` (uint8)", &RELATIONS);
    s
}

// ----------------------------------------------------------------------------
// Vocabulary ids
// ----------------------------------------------------------------------------

/// Vocabulary ids per template, attack, spell and action kind (built once per
/// content pool, `ContentPool::enc_ids`).
#[derive(Debug)]
pub struct EncIds {
    kind: Vec<i16>,
    character: Vec<i16>,
    attack: Vec<Vec<i16>>,
    spell: Vec<i16>,
    action: [i16; ACTION_KINDS.len()],
}

impl EncIds {
    fn build(pool: &ContentPool) -> EncIds {
        let v = &pool.vocab;
        let id = |section: &str, name: &str| v.id(section, name).map_or(-1, |x| x as i16);
        EncIds {
            kind: pool.templates.iter().map(|t| id("creatures", t.base_id)).collect(),
            character: pool.templates.iter().map(|t| if t.pc { id("characters", t.base_id) } else { -1 }).collect(),
            attack: pool.templates.iter().map(|t| t.attacks.iter().map(|a| id("attacks", a.name)).collect()).collect(),
            spell: SpellId::ALL.iter().map(|s| id("spells", s.key())).collect(),
            action: ACTION_KINDS.map(|k| id("action_kinds", k)),
        }
    }

    /// The pool's table (built on first use).
    pub fn of(pool: &ContentPool) -> &EncIds {
        pool.enc_ids.get_or_init(|| EncIds::build(pool))
    }

    pub fn spell(&self, s: SpellId) -> i16 {
        self.spell[s as usize]
    }

    pub fn action(&self, a: &Act) -> i16 {
        self.action[act_kind_index(a)]
    }

    /// Every id the pool's creatures, attacks, spells and action kinds need is
    /// in the vocabulary (the loader checks the content side).
    pub fn missing(&self, pool: &ContentPool) -> Vec<String> {
        let mut out = Vec::new();
        for (i, t) in pool.templates.iter().enumerate() {
            if self.kind[i] < 0 {
                out.push(format!("creatures.{}", t.id));
            }
            if t.pc && self.character[i] < 0 {
                out.push(format!("characters.{}", t.id));
            }
            for (k, a) in t.attacks.iter().enumerate() {
                if self.attack[i][k] < 0 {
                    out.push(format!("attacks.{}", a.name));
                }
            }
        }
        for (k, a) in ACTION_KINDS.iter().enumerate() {
            if self.action[k] < 0 {
                out.push(format!("action_kinds.{a}"));
            }
        }
        out
    }
}

/// Position of an action's kind in [`ACTION_KINDS`] (`Act::kind()`).
pub fn act_kind_index(a: &Act) -> usize {
    match a {
        Act::Move(_) => 0,
        Act::Attack { .. } | Act::BlindAttack { .. } => 1,
        Act::Dash => 2,
        Act::Dodge => 3,
        Act::Stand => 4,
        Act::SecondWind => 5,
        Act::ActionSurge => 6,
        Act::Spell(_) => 7,
        Act::TurnUndead => 8,
        Act::DivineSpark { .. } => 9,
        Act::PreserveLife(_) => 10,
        Act::SpiritualWeaponAttack { .. } => 11,
        Act::InnateSorcery => 12,
        Act::DragonsBreathExhale => 13,
        Act::EndTurn => 14,
        Act::DisengageBonus => 15,
        Act::HideBonus => 16,
        Act::RedirectAttack { .. } => 17,
        Act::Rage => 18,
        Act::ExtendRage => 19,
        Act::RecklessAttack => 20,
        Act::Cleave { .. } => 21,
        Act::Disengage => 22,
        Act::SpiritualWeaponMove { .. } => 23,
        Act::CreateSpellSlot { .. } => 24,
        Act::ConvertSpellSlot { .. } => 25,
    }
}

// ----------------------------------------------------------------------------
// Buffers
// ----------------------------------------------------------------------------

/// One observation's buffers, owned by the caller (one batch slot): `K` is
/// `cand_mask.len()`, at least the decision's legal row count. The widths
/// follow `version` (`creature_rel` is empty for `ember-gen-v1`).
pub struct ObsSlot<'a> {
    pub version: Version,
    pub creatures: &'a mut [f32],
    pub creature_ids: &'a mut [i16],
    pub creature_mask: &'a mut [bool],
    pub map: &'a mut [u8],
    pub global: &'a mut [f32],
    pub cands: &'a mut [f32],
    pub cand_ids: &'a mut [i16],
    pub cand_tgt: &'a mut [i16],
    pub cand_tgt_n: &'a mut [u8],
    pub cand_cell: &'a mut [i16],
    pub cand_mask: &'a mut [bool],
    pub actor: &'a mut i16,
    pub native_raw: &'a mut [f32],
    pub native_dropped: &'a mut [bool],
    pub native_choice: &'a mut i16,
    /// `[N, N, R]` relations (`ember-gen-v2`; empty for v1).
    pub creature_rel: &'a mut [u8],
}

impl ObsSlot<'_> {
    pub fn k(&self) -> usize {
        self.cand_mask.len()
    }

    fn check(&self) -> Result<(), String> {
        let k = self.k();
        let v = self.version;
        let sizes = [
            ("creatures", self.creatures.len(), N * v.creature()),
            ("creature_ids", self.creature_ids.len(), N * 3),
            ("creature_mask", self.creature_mask.len(), N),
            ("map", self.map.len(), v.map_channels() * CELLS),
            ("global", self.global.len(), v.global()),
            ("cands", self.cands.len(), k * v.cand()),
            ("cand_ids", self.cand_ids.len(), k * 3),
            ("cand_tgt", self.cand_tgt.len(), k * T),
            ("cand_tgt_n", self.cand_tgt_n.len(), k * T),
            ("cand_cell", self.cand_cell.len(), k),
            ("native_raw", self.native_raw.len(), k),
            ("native_dropped", self.native_dropped.len(), k),
            ("creature_rel", self.creature_rel.len(), N * N * v.relations()),
        ];
        for (name, got, want) in sizes {
            if got != want {
                return Err(format!("buffer {name}: {got} values, expected {want} (K = {k}, {})", v.name()));
            }
        }
        Ok(())
    }
}

/// An owned observation (tools, tests).
#[derive(Clone, Debug)]
pub struct Obs {
    pub version: Version,
    pub k: usize,
    pub creatures: Vec<f32>,
    pub creature_ids: Vec<i16>,
    pub creature_mask: Vec<bool>,
    pub map: Vec<u8>,
    pub global: Vec<f32>,
    pub cands: Vec<f32>,
    pub cand_ids: Vec<i16>,
    pub cand_tgt: Vec<i16>,
    pub cand_tgt_n: Vec<u8>,
    pub cand_cell: Vec<i16>,
    pub cand_mask: Vec<bool>,
    pub actor: i16,
    pub native_raw: Vec<f32>,
    pub native_dropped: Vec<bool>,
    pub native_choice: i16,
    /// `[N, N, R]` (`ember-gen-v2`; empty for v1).
    pub creature_rel: Vec<u8>,
}

impl Obs {
    /// Buffers for `k` candidate rows (the default version).
    pub fn new(k: usize) -> Obs {
        Obs::with_version(k, Version::default())
    }

    /// Buffers for `k` candidate rows of `version`.
    pub fn with_version(k: usize, version: Version) -> Obs {
        let v = version;
        Obs {
            version,
            k,
            creatures: vec![0.0; N * v.creature()],
            creature_ids: vec![-1; N * 3],
            creature_mask: vec![false; N],
            map: vec![0; v.map_channels() * CELLS],
            global: vec![0.0; v.global()],
            cands: vec![0.0; k * v.cand()],
            cand_ids: vec![-1; k * 3],
            cand_tgt: vec![-1; k * T],
            cand_tgt_n: vec![0; k * T],
            cand_cell: vec![-1; k],
            cand_mask: vec![false; k],
            actor: -1,
            native_raw: vec![0.0; k],
            native_dropped: vec![false; k],
            native_choice: -1,
            creature_rel: vec![0; N * N * v.relations()],
        }
    }

    pub fn slot(&mut self) -> ObsSlot<'_> {
        ObsSlot {
            version: self.version,
            creatures: &mut self.creatures,
            creature_ids: &mut self.creature_ids,
            creature_mask: &mut self.creature_mask,
            map: &mut self.map,
            global: &mut self.global,
            cands: &mut self.cands,
            cand_ids: &mut self.cand_ids,
            cand_tgt: &mut self.cand_tgt,
            cand_tgt_n: &mut self.cand_tgt_n,
            cand_cell: &mut self.cand_cell,
            cand_mask: &mut self.cand_mask,
            actor: &mut self.actor,
            native_raw: &mut self.native_raw,
            native_dropped: &mut self.native_dropped,
            native_choice: &mut self.native_choice,
            creature_rel: &mut self.creature_rel,
        }
    }

    /// Encode with exactly the decision's row count (`K` = legal rows), in
    /// the default version.
    pub fn of(env: &Env, team: Option<u8>, offset: (i32, i32), obj: &Objective) -> Result<Obs, String> {
        Obs::of_version(env, team, offset, obj, Version::default())
    }

    /// [`Obs::of`] in `version`.
    pub fn of_version(env: &Env, team: Option<u8>, offset: (i32, i32), obj: &Objective, version: Version) -> Result<Obs, String> {
        let k = env.decision().map_or(0, |d| d.legal.len());
        let mut o = Obs::with_version(k, version);
        encode(env, team, offset, obj, &mut o.slot())?;
        Ok(o)
    }

    /// A 64-bit FNV-1a digest of every array's bytes (determinism and golden
    /// tests; float bits, so NaN payloads count).
    pub fn digest(&self) -> u64 {
        let mut h: u64 = 0xcbf2_9ce4_8422_2325;
        let mut eat = |bytes: &[u8]| {
            for &b in bytes {
                h ^= b as u64;
                h = h.wrapping_mul(0x0000_0100_0000_01b3);
            }
        };
        for v in [&self.creatures, &self.global, &self.cands, &self.native_raw] {
            for x in v.iter() {
                eat(&x.to_bits().to_le_bytes());
            }
        }
        for v in [&self.creature_ids, &self.cand_ids, &self.cand_tgt, &self.cand_cell] {
            for x in v.iter() {
                eat(&x.to_le_bytes());
            }
        }
        for v in [&self.creature_mask, &self.cand_mask, &self.native_dropped] {
            for x in v.iter() {
                eat(&[*x as u8]);
            }
        }
        eat(&self.map);
        eat(&self.cand_tgt_n);
        eat(&self.actor.to_le_bytes());
        eat(&self.native_choice.to_le_bytes());
        // v2 only (empty in v1, so v1 digests are the v1 encoder's)
        eat(&self.creature_rel);
        h
    }
}

/// The objective as the trainer configures it (global features 2-3; the
/// environment does not know it).
#[derive(Clone, Copy, Debug)]
pub struct Objective {
    pub standing_weight: f32,
    /// `health_score` (true) or native elimination (false).
    pub health: bool,
}

impl Default for Objective {
    fn default() -> Objective {
        Objective { standing_weight: 0.5, health: true }
    }
}

/// The per-team visibility mask: creatures of the other team that are
/// hidden and seen (`Fight::can_see`: passive Perception against the
/// Stealth total, then line of sight) by no conscious member of `view`.
pub fn masked_from(f: &Fight, view: u8) -> u32 {
    let mut m = 0u32;
    for (i, u) in f.units.iter().enumerate().take(N) {
        if u.team == view || !u.hidden() {
            continue;
        }
        let seen = f.units.iter().enumerate().any(|(o, x)| x.team == view && x.conscious() && f.can_see(o, i));
        if !seen {
            m |= 1 << i;
        }
    }
    m
}

/// What [`encode`] wrote besides the arrays.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Encoded {
    /// The view team.
    pub team: u8,
    /// Real creatures and legal rows (both prefixes).
    pub creatures: usize,
    pub legal: usize,
    pub actor: i16,
    pub native_choice: i16,
}

/// A canvas offset for a `w` x `h` map drawn from `seed` (training's random
/// placement, GENERAL_ENV.md §5.3); every placement that fits is possible.
pub fn random_offset(w: i32, h: i32, seed: u64) -> (i32, i32) {
    let mut z = seed.wrapping_add(0x9E37_79B9_7F4A_7C15);
    z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
    z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
    z ^= z >> 31;
    let fx = (S as i32 - w + 1).max(1) as u64;
    let fy = (S as i32 - h + 1).max(1) as u64;
    ((z % fx) as i32, ((z >> 32) % fy) as i32)
}

// ----------------------------------------------------------------------------
// Scratch (per thread; no allocation per call once warm)
// ----------------------------------------------------------------------------

const INF: u16 = u16::MAX;

struct Scratch {
    /// Actor BFS steps per map cell (`INF`: unreachable).
    steps: Vec<u16>,
    /// Steps to the nearest conscious enemy of the view team (walls only).
    enemy_steps: Vec<u16>,
    threat: Vec<u8>,
    exposure: Vec<u8>,
    /// Per creature: position in the initiative order (-1 none), DPR estimate.
    order_pos: Vec<i32>,
    dpr: Vec<f64>,
    /// Per creature (`ember-gen-v2`), one bit per creature `j`: the active
    /// sources of its Frightened, the creatures whose save effect it is immune
    /// to, the creatures whose effect it is under ([`relation_masks`]).
    fear: Vec<u32>,
    immune: Vec<u32>,
    effect: Vec<u32>,
}

impl Scratch {
    fn new() -> Scratch {
        Scratch {
            steps: vec![INF; CELLS],
            enemy_steps: vec![INF; CELLS],
            threat: vec![0; CELLS],
            exposure: vec![0; CELLS],
            order_pos: Vec::with_capacity(256),
            dpr: Vec::with_capacity(256),
            fear: Vec::with_capacity(N),
            immune: Vec::with_capacity(N),
            effect: Vec::with_capacity(N),
        }
    }
}

thread_local! {
    static SCRATCH: RefCell<Scratch> = RefCell::new(Scratch::new());
}

// ----------------------------------------------------------------------------
// The encoder
// ----------------------------------------------------------------------------

#[inline]
fn b(x: bool) -> f32 {
    x as u8 as f32
}

/// `count`d`sides` + `modifier`: (mean, maximum, mean of the dice alone).
fn dice_stats(d: Dice) -> (f64, f64, f64) {
    let mean = expected(d.count, d.sides, d.modifier);
    if d.sides > 0 {
        let dice = d.count as f64 * (d.sides + 1) as f64 / 2.0;
        (mean, (d.count * d.sides + d.modifier) as f64, dice)
    } else {
        (mean, (d.count + d.modifier) as f64, 0.0)
    }
}

/// What the encoder knows about the decision: the fight, the view, the
/// actor and the per-call maps.
struct Ctx<'a> {
    f: &'a Fight,
    ids: &'a EncIds,
    view: u8,
    actor: Option<usize>,
    ox: i32,
    oy: i32,
    sc: &'a Scratch,
    /// Creatures masked from the view team (bit per token).
    masked: u32,
    /// Write the `ember-gen-v2` features (the rows are v2-wide).
    v2: bool,
    version: Version,
}

impl Ctx<'_> {
    #[inline]
    fn canvas(&self, p: Pos) -> usize {
        (p.1 + self.oy) as usize * S + (p.0 + self.ox) as usize
    }
    #[inline]
    fn enemy(&self, u: usize) -> bool {
        self.f.units[u].team != self.view
    }
    /// Hidden from the view team: its position is not observed.
    #[inline]
    fn masked(&self, u: usize) -> bool {
        self.masked & (1 << u) != 0
    }
    /// Steps of the actor's BFS to `p` (`None`: unreachable or off the map).
    #[inline]
    fn steps_to(&self, p: Pos) -> Option<u16> {
        let g = &self.f.grid;
        if !g.in_bounds(p.0, p.1) {
            return None;
        }
        let s = self.sc.steps[g.index(p.0, p.1)];
        (s != INF).then_some(s)
    }
}

/// Encode the pending decision of `env` (team `None` or the deciding team),
/// or the final state of a finished game from `team`'s view, with the map
/// at canvas offset `offset` ((0, 0) for evaluation; [`random_offset`] in
/// training). Writes every value of `out` (padding included).
pub fn encode(env: &Env, team: Option<u8>, offset: (i32, i32), obj: &Objective, out: &mut ObsSlot) -> Result<Encoded, String> {
    encode_decision(env, env.decision(), team, offset, obj, out)
}

/// [`encode`] with the rows of `dec` in place of the pending decision's (the
/// destination rows of `batch::MoveMode::Dest`; `dec` must be the pending
/// decision with other rows, or `None` for a final view). A move row may
/// walk several squares (`Act::Move` with the whole path).
pub fn encode_decision(
    env: &Env,
    dec: Option<&crate::env::Decision>,
    team: Option<u8>,
    offset: (i32, i32),
    obj: &Objective,
    out: &mut ObsSlot,
) -> Result<Encoded, String> {
    out.check()?;
    let f = &env.fight;
    if dec.is_some() != env.decision().is_some() || dec.zip(env.decision()).is_some_and(|(a, b)| a.actor != b.actor) {
        return Err("the rows must belong to the pending decision".into());
    }
    let view = match (dec, team) {
        (Some(d), None) => d.team,
        (Some(d), Some(t)) if t == d.team => t,
        (Some(d), Some(t)) => return Err(format!("the pending decision belongs to team {}, not team {t}", d.team)),
        (None, Some(t)) if t < 2 => t,
        (None, Some(t)) => return Err(format!("team {t}: 0 (heroes) or 1 (monsters)")),
        (None, None) => return Err("no pending decision: a final view needs a team".into()),
    };
    let n = f.units.len();
    if n > N {
        return Err(format!("{n} creatures (the observation holds {N})"));
    }
    let legal = dec.map_or(0, |d| d.legal.len());
    if legal > out.k() {
        return Err(format!("{legal} legal rows, buffers hold {}", out.k()));
    }
    let g = &f.grid;
    let (ox, oy) = offset;
    if ox < 0 || oy < 0 || ox + g.w > S as i32 || oy + g.h > S as i32 {
        return Err(format!("a {}x{} map does not fit the {S}x{S} canvas at offset ({ox}, {oy})", g.w, g.h));
    }
    let ids = EncIds::of(f.pool);
    let actor = dec.map(|d| d.actor);
    let v2 = out.version != Version::V1;
    SCRATCH.with(|cell| {
        let mut sc = cell.borrow_mut();
        let masked = masked_from(f, view);
        let moves = dec.is_some_and(|d| d.legal.iter().any(|a| matches!(a, Act::Move(_))));
        // destination rows: the enemy distances everywhere, not only around the actor
        let far = dec.is_some_and(|d| d.legal.iter().any(|a| matches!(a, Act::Move(p) if p.len() > 2)));
        prepare(f, view, actor, moves, far, masked, &mut sc);
        if v2 {
            relation_masks(f, &mut sc);
        }
        let cx = Ctx { f, ids, view, actor, ox, oy, sc: &sc, masked, v2, version: out.version };
        encode_map(&cx, out.map);
        if v2 {
            if let Some(a) = actor {
                // the trail of this turn (start square, every step, the square now)
                let u = &f.units[a];
                for &p in u.trail.iter().chain(std::iter::once(&u.pos)) {
                    if g.in_bounds(p.0, p.1) {
                        out.map[ch::TRAIL * CELLS + cx.canvas(p)] = 1;
                    }
                }
            }
        }
        encode_creatures(&cx, out);
        encode_global(&cx, env, obj, out.global);
        if v2 {
            encode_relations(&cx, out.creature_rel);
        }
        // candidates and native arrays
        let fa = out.version.cand();
        let k = out.k();
        out.cands.fill(0.0);
        out.cand_ids.fill(-1);
        out.cand_tgt.fill(-1);
        out.cand_tgt_n.fill(0);
        out.cand_cell.fill(-1);
        out.native_raw.fill(0.0);
        out.native_dropped.fill(false);
        for m in out.cand_mask.iter_mut() {
            *m = false;
        }
        *out.actor = actor.map_or(-1, |a| a as i16);
        *out.native_choice = -1;
        if let Some(d) = dec {
            let a = d.actor;
            for (r, act) in d.legal.iter().enumerate() {
                let row = &mut out.cands[r * fa..(r + 1) * fa];
                let mut tg = Targets::default();
                let (cell, spell, attack) = encode_cand(&cx, a, act, row, &mut tg);
                out.cand_ids[r * 3] = ids.action(act);
                out.cand_ids[r * 3 + 1] = spell;
                out.cand_ids[r * 3 + 2] = attack;
                out.cand_cell[r] = cell;
                for (j, &(u, m)) in tg.list[..tg.len].iter().enumerate() {
                    out.cand_tgt[r * T + j] = u as i16;
                    out.cand_tgt_n[r * T + j] = m;
                }
                out.cand_mask[r] = true;
            }
            let scored = env.scores();
            match (&d.native_raw, &d.native_dropped, d.native_choice) {
                (Some(raw), Some(dropped), Some(choice)) => {
                    for r in 0..legal {
                        out.native_raw[r] = raw[r] as f32;
                        out.native_dropped[r] = dropped[r];
                    }
                    *out.native_choice = choice as i16;
                }
                _ if scored && d.unscored == Some(Unscored::Stand) => {
                    // Stand first: the native AI stands without scoring; the
                    // Stand row 0, every other row -inf (End Turn included).
                    let choice = d.native_choice.unwrap_or(0);
                    for r in 0..legal {
                        out.native_raw[r] = if r == choice { 0.0 } else { f32::NEG_INFINITY };
                    }
                    *out.native_choice = choice as i16;
                }
                _ => {
                    for r in 0..legal {
                        out.native_raw[r] = f32::NAN;
                    }
                }
            }
            debug_assert!(legal <= k);
        }
        Ok(Encoded { team: view, creatures: n, legal, actor: *out.actor, native_choice: *out.native_choice })
    })
}

/// The per-call maps: initiative positions, DPR estimates, threat and
/// exposure counts, the actor's BFS and (with move rows) the enemy BFS.
fn prepare(f: &Fight, view: u8, actor: Option<usize>, moves: bool, far: bool, masked: u32, sc: &mut Scratch) {
    let g = &f.grid;
    let cells = g.cells();
    sc.order_pos.clear();
    sc.order_pos.resize(f.units.len(), -1);
    for (p, &u) in f.order.iter().enumerate() {
        sc.order_pos[u] = p as i32;
    }
    sc.dpr.clear();
    for u in 0..f.units.len() {
        let d = dpr_vs_ac14(f, u);
        sc.dpr.push(d);
    }
    sc.threat[..cells].fill(0);
    sc.exposure[..cells].fill(0);
    for (i, unit) in f.units.iter().enumerate() {
        if unit.team == view || !unit.conscious() || masked & (1 << i) != 0 {
            continue;
        }
        // exposure: the enemy's line-of-sight row
        if let Some(row) = g.los_from(unit.pos) {
            for (wi, &word) in row.words().iter().enumerate() {
                let mut bits = word;
                while bits != 0 {
                    let i = wi * 64 + bits.trailing_zeros() as usize;
                    sc.exposure[i] = sc.exposure[i].saturating_add(1);
                    bits &= bits - 1;
                }
            }
        }
        // melee threat: reach squares around it, while it can react
        if let Some(reach) = unit.t.melee_ft {
            if reach > 0 && unit.has_reaction() {
                let r = (2 * reach + 5) / 10;
                let (x0, y0) = unit.pos;
                for y in (y0 - r).max(0)..=(y0 + r).min(g.h - 1) {
                    for x in (x0 - r).max(0)..=(x0 + r).min(g.w - 1) {
                        if f.within_reach(unit.pos, (x, y), reach) {
                            let i = g.index(x, y);
                            sc.threat[i] = sc.threat[i].saturating_add(1);
                        }
                    }
                }
            }
        }
    }
    // the actor's one-square moves: each step ends on a free square (no
    // creature, no corpse); heroes need both orthogonal squares free for a
    // diagonal step (`move_candidates`)
    sc.steps[..cells].fill(INF);
    let (w, h) = (g.w as usize, g.h as usize);
    let floor = g.floor_rows();
    if let Some(a) = actor {
        let mut free = [0u64; 34];
        free[1..=h].copy_from_slice(floor);
        for (i, u) in f.units.iter().enumerate() {
            if i != a && masked & (1 << i) == 0 && (f.rule_version() < 8 || !u.dead()) {
                free[u.pos.1 as usize + 1] &= !(1u64 << u.pos.0);
            }
        }
        let rule = if f.units[a].t.pc { Rule::NoCornerCut } else { Rule::AnyDiagonal };
        let p = f.units[a].pos;
        if f.incorporeal(a) {
            use std::cmp::Reverse;
            let mut queue = std::collections::BinaryHeap::from([Reverse((0u16, p))]);
            sc.steps[g.index(p.0, p.1)] = 0;
            while let Some(Reverse((cost, from))) = queue.pop() {
                if sc.steps[g.index(from.0, from.1)] != cost { continue; }
                for x in from.0 - 1..=from.0 + 1 {
                    for y in from.1 - 1..=from.1 + 1 {
                        if !g.in_bounds(x, y) || f.step_toward_fear(a, from, (x, y)) { continue; }
                        let occupied = f.token_at((x, y)).is_some_and(|o| o != a && masked & (1 << o) == 0);
                        let next = cost + 1 + u16::from(g.is_wall(x, y) || occupied);
                        let i = g.index(x, y);
                        if next < sc.steps[i] {
                            sc.steps[i] = next;
                            queue.push(Reverse((next, (x, y))));
                        }
                    }
                }
            }
            for (i, unit) in f.units.iter().enumerate() {
                if i != a && !unit.dead() && masked & (1 << i) == 0 {
                    sc.steps[g.index(unit.pos.0, unit.pos.1)] = INF;
                }
            }
        } else if f.units[a].frightened_by.is_empty() && f.units[a].source_fear.is_empty() {
            let mut start = [0u64; 34];
            start[p.1 as usize + 1] = 1u64 << p.0;
            bfs_rows(w, h, &free, &start, rule, None, &mut sc.steps);
        } else {
            bfs_feared(f, a, w, h, &free, rule, &mut sc.steps);
        }
    }
    // steps to the nearest conscious enemy (walls only, the A* neighbour
    // rule), until the actor's square and its neighbours are labelled
    sc.enemy_steps[..cells].fill(INF);
    if moves {
        let mut free = [0u64; 34];
        free[1..=h].copy_from_slice(floor);
        let mut start = [0u64; 34];
        for (i, unit) in f.units.iter().enumerate() {
            if unit.team != view && unit.conscious() && masked & (1 << i) == 0 {
                start[unit.pos.1 as usize + 1] |= 1u64 << unit.pos.0;
            }
        }
        let stop = if far { None } else { actor.map(|a| f.units[a].pos) };
        bfs_rows(w, h, &free, &start, Rule::AStar, stop, &mut sc.enemy_steps);
    }
}

/// The actor's BFS while it is Frightened (Mummy status): a step that brings
/// it closer to a source of its fear is not a move it can make
/// (`Fight::step_toward_fear`, N20-042), so the path cost and reachable
/// channels and the creatures' path costs follow the rule. A plain queue BFS
/// (rare states); otherwise the same neighbours as `bfs_rows` with `rule`.
fn bfs_feared(f: &Fight, a: usize, w: usize, h: usize, free: &[u64; 34], rule: Rule, steps: &mut [u16]) {
    let is_free = |x: i32, y: i32| {
        x >= 0 && y >= 0 && (x as usize) < w && (y as usize) < h && (free[y as usize + 1] >> x) & 1 == 1
    };
    let start = f.units[a].pos;
    if !is_free(start.0, start.1) {
        return;
    }
    let idx = |p: Pos| p.1 as usize * w + p.0 as usize;
    let mut queue = std::collections::VecDeque::new();
    steps[idx(start)] = 0;
    queue.push_back(start);
    while let Some(p) = queue.pop_front() {
        let d = steps[idx(p)];
        for dy in -1..=1 {
            for dx in -1..=1 {
                if dx == 0 && dy == 0 {
                    continue;
                }
                let n = (p.0 + dx, p.1 + dy);
                if !is_free(n.0, n.1) || steps[idx(n)] != INF {
                    continue;
                }
                if dx != 0 && dy != 0 {
                    let ok = match rule {
                        Rule::AnyDiagonal => true,
                        Rule::NoCornerCut => is_free(p.0 + dx, p.1) && is_free(p.0, p.1 + dy),
                        Rule::AStar => is_free(p.0 + dx, p.1) || is_free(p.0, p.1 + dy),
                    };
                    if !ok {
                        continue;
                    }
                }
                if f.step_toward_fear(a, p, n) {
                    continue;
                }
                steps[idx(n)] = d + 1;
                queue.push_back(n);
            }
        }
    }
}

/// Which diagonal steps a BFS allows.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Rule {
    /// One-square moves of a monster: any diagonal onto a free square.
    AnyDiagonal,
    /// A hero's: both orthogonal squares free (no corner cutting).
    NoCornerCut,
    /// natural20's A* neighbours: at least one orthogonal square free.
    AStar,
}

/// Layered BFS on bit rows (bit `x` of row `y + 1`; rows 0 and `h + 1` are
/// empty padding): `steps[y * w + x]` = the layer a free square is first
/// reached in (0 for the start squares), `INF` otherwise. With `stop`, the
/// search ends once that square and its eight neighbours that are free are
/// labelled.
fn bfs_rows(w: usize, h: usize, free: &[u64; 34], start: &[u64; 34], rule: Rule, stop: Option<Pos>, steps: &mut [u16]) {
    let mask = if w >= 64 { u64::MAX } else { (1u64 << w) - 1 };
    let mut visited = [0u64; 34];
    let mut front = [0u64; 34];
    let (mut lo, mut hi) = (usize::MAX, 0usize);
    for y in 1..=h {
        let r = start[y] & free[y];
        front[y] = r;
        visited[y] = r;
        if r != 0 {
            lo = lo.min(y);
            hi = hi.max(y);
            label(r, y, w, 0, steps);
        }
    }
    // the squares whose labels are wanted (stop rule)
    let want = stop.map(|p| {
        let (x, y) = (p.0 as usize, p.1 as usize + 1);
        let band = ((0b111u64 << x) >> 1) & mask;
        [band & free[y - 1], band & free[y], band & free[y + 1]]
    });
    let done = |visited: &[u64; 34]| -> bool {
        match (stop, want) {
            (Some(p), Some(wt)) => {
                let y = p.1 as usize + 1;
                visited[y - 1] & wt[0] == wt[0] && visited[y] & wt[1] == wt[1] && visited[y + 1] & wt[2] == wt[2]
            }
            _ => false,
        }
    };
    let mut layer: u16 = 0;
    let mut next = [0u64; 34];
    while lo <= hi && !done(&visited) {
        layer += 1;
        let (from, to) = (lo.saturating_sub(1).max(1), (hi + 1).min(h));
        let (mut nlo, mut nhi) = (usize::MAX, 0usize);
        for y in from..=to {
            let (up, mid, down) = (front[y - 1], front[y], front[y + 1]);
            let orth = up | down | (mid << 1) | (mid >> 1);
            let diag = match rule {
                Rule::AnyDiagonal => ((up | down) << 1) | ((up | down) >> 1),
                Rule::NoCornerCut => {
                    ((down << 1) & free[y + 1] & (free[y] << 1))
                        | ((down >> 1) & free[y + 1] & (free[y] >> 1))
                        | ((up << 1) & free[y - 1] & (free[y] << 1))
                        | ((up >> 1) & free[y - 1] & (free[y] >> 1))
                }
                Rule::AStar => {
                    ((down << 1) & (free[y + 1] | (free[y] << 1)))
                        | ((down >> 1) & (free[y + 1] | (free[y] >> 1)))
                        | ((up << 1) & (free[y - 1] | (free[y] << 1)))
                        | ((up >> 1) & (free[y - 1] | (free[y] >> 1)))
                }
            };
            let n = (orth | diag) & free[y] & !visited[y] & mask;
            next[y] = n;
            if n != 0 {
                visited[y] |= n;
                nlo = nlo.min(y);
                nhi = nhi.max(y);
                label(n, y, w, layer, steps);
            }
        }
        for y in lo..=hi {
            front[y] = 0;
        }
        for y in from..=to {
            front[y] = next[y];
            next[y] = 0;
        }
        lo = nlo;
        hi = nhi;
    }
}

#[inline]
fn label(mut bits: u64, y: usize, w: usize, layer: u16, steps: &mut [u16]) {
    let base = (y - 1) * w;
    while bits != 0 {
        let x = bits.trailing_zeros() as usize;
        steps[base + x] = layer;
        bits &= bits - 1;
    }
}

fn encode_map(cx: &Ctx, map: &mut [u8]) {
    let f = cx.f;
    let g = &f.grid;
    let (w, h) = (g.w as usize, g.h as usize);
    let (ox, oy) = (cx.ox as usize, cx.oy as usize);
    map.fill(0);
    map[ch::PATH * CELLS..(ch::PATH + 1) * CELLS].fill(255);
    // static channels (cached per map)
    let st = g.static_planes();
    for c in 0..STATIC_PLANES {
        for y in 0..h {
            let src = &st[c * w * h + y * w..c * w * h + y * w + w];
            let dst = c * CELLS + (y + oy) * S + ox;
            map[dst..dst + w].copy_from_slice(src);
        }
    }
    debug_assert_eq!(ch::INSIDE, 0);
    // creatures (not those masked from the view team)
    for (i, u) in f.units.iter().enumerate() {
        if cx.masked(i) {
            continue;
        }
        let c = cx.canvas(u.pos);
        let chan = if u.dead() {
            ch::CORPSE
        } else if Some(i) == cx.actor {
            ch::ACTOR
        } else if u.conscious() {
            if cx.enemy(i) {
                ch::ENEMY
            } else {
                ch::ALLY
            }
        } else if cx.enemy(i) {
            ch::DOWNED_ENEMY
        } else {
            ch::DOWNED_ALLY
        };
        map[chan * CELLS + c] = 1;
    }
    // threat, exposure, path cost, reachability, line of sight
    let actor = cx.actor.map(|a| &f.units[a]);
    let (step_cost, budget, dash_budget) = match (cx.actor, actor) {
        (Some(a), Some(u)) => {
            let step = 1 + u.prone() as i32;
            let mv = u.available_movement();
            let dash = if u.action > 0 { mv + f.speed_of(a) } else { mv };
            (step, mv.div_euclid(5), dash.div_euclid(5))
        }
        _ => (1, 0, 0),
    };
    let los = actor.and_then(|u| g.los_from(u.pos));
    debug_assert_eq!(ch::REACH, ch::PATH + 1);
    for y in 0..h {
        let src = y * w;
        let dst = (y + oy) * S + ox;
        map[ch::THREAT * CELLS + dst..ch::THREAT * CELLS + dst + w].copy_from_slice(&cx.sc.threat[src..src + w]);
        map[ch::EXPOSURE * CELLS + dst..ch::EXPOSURE * CELLS + dst + w].copy_from_slice(&cx.sc.exposure[src..src + w]);
        if actor.is_none() {
            continue;
        }
        let steps = &cx.sc.steps[src..src + w];
        let (path, rest) = map[ch::PATH * CELLS + dst..].split_at_mut(w);
        let reach = &mut rest[CELLS - w..CELLS];
        for x in 0..w {
            let s = steps[x];
            if s != INF {
                let cost = s as i32 * step_cost;
                path[x] = cost.min(254) as u8;
                reach[x] = if cost <= budget {
                    2
                } else if cost <= dash_budget {
                    1
                } else {
                    0
                };
            }
        }
        if let Some(row) = los {
            let line = &mut map[ch::LOS * CELLS + dst..ch::LOS * CELLS + dst + w];
            for (x, v) in line.iter_mut().enumerate() {
                *v = row.get(src + x) as u8;
            }
        }
    }
}

/// Expected damage per round of a creature's best available attack against
/// AC 14 (`P(d20 + to-hit >= 14)` x mean, save attacks 0.55 x mean, as
/// `expected_round_damage`), times its attacks per Attack action.
fn dpr_vs_ac14(f: &Fight, u: usize) -> f64 {
    let unit = &f.units[u];
    if unit.dead() {
        return 0.0;
    }
    let mut best = 0.0f64;
    for (k, def) in unit.t.attacks.iter().enumerate() {
        if !f.attack_available(u, k) {
            continue;
        }
        let (to_hit, dmg, _) = f.attack_numbers(u, k);
        let mut mean = expected(dmg.count, dmg.sides, dmg.modifier);
        for (d, _) in &def.additional {
            mean += expected(d.count, d.sides, d.modifier);
        }
        let p = if def.save_attack.is_some() { 0.55 } else { prob_at_least(20, plus_string_modifier(to_hit), 14, RollMode::Normal) };
        best = best.max(p * mean.max(0.0));
    }
    best * attacks_per_action(f, u) as f64
}

fn attacks_per_action(f: &Fight, u: usize) -> i32 {
    f.units[u].t.multiattack.iter().map(|c| c.len() as i32).max().unwrap_or(1).max(1)
}

fn encode_creatures(cx: &Ctx, out: &mut ObsSlot) {
    let f = cx.f;
    let fc = out.version.creature();
    out.creatures.fill(0.0);
    out.creature_ids.fill(-1);
    for m in out.creature_mask.iter_mut() {
        *m = false;
    }
    for i in 0..f.units.len() {
        let row = &mut out.creatures[i * fc..(i + 1) * fc];
        creature_row(cx, i, row);
        if cx.v2 {
            creature_row_v2(cx, i, row);
        }
        let u = &f.units[i];
        out.creature_ids[i * 3] = cx.ids.kind[u.tid as usize];
        out.creature_ids[i * 3 + 1] = cx.ids.character[u.tid as usize];
        out.creature_ids[i * 3 + 2] = u.concentration.map_or(-1, |c| cx.ids.spell(f.objs[c as usize].spell));
        out.creature_mask[i] = true;
    }
}

fn creature_row(cx: &Ctx, i: usize, row: &mut [f32]) {
    let f = cx.f;
    let u = &f.units[i];
    let t = u.t;
    // relation
    row[ci!("is_actor")] = b(Some(i) == cx.actor);
    row[ci!("ally")] = b(!cx.enemy(i));
    row[ci!("enemy")] = b(cx.enemy(i));
    row[ci!("side_heroes")] = b(u.team == 0);
    row[ci!("is_pc")] = b(t.pc);
    // position (none for a creature masked from the view team)
    let masked = cx.masked(i);
    row[ci!("path_cost_div32")] = -1.0;
    if !masked {
        position_features(cx, i, row);
    }
    // vitals
    let mhp = f.max_hp_of(i);
    let hp = u.hp.max(0);
    row[ci!("hp_div100")] = hp as f32 / 100.0;
    row[ci!("max_hp_div100")] = mhp as f32 / 100.0;
    row[ci!("hp_frac")] = if mhp > 0 { hp as f32 / mhp as f32 } else { 0.0 };
    row[ci!("temp_hp_div100")] = u.temp_hp as f32 / 100.0;
    row[ci!("conscious")] = b(u.conscious());
    row[ci!("dying")] = b(crate::spells::is_dying(f, i));
    row[ci!("stable")] = b(u.has(St::Stable));
    row[ci!("dead")] = b(u.dead());
    row[ci!("death_saves_div3")] = u.death_saves as f32 / 3.0;
    row[ci!("death_fails_div3")] = u.death_fails as f32 / 3.0;
    row[ci!("max_hp_reduction_div100")] = u.max_hp_reduction as f32 / 100.0;
    // defense and movement
    row[ci!("ac_div20")] = f.armor_class(i) as f32 / 20.0;
    row[ci!("speed_div60")] = f.speed_of(i) as f32 / 60.0;
    row[ci!("fly")] = b(t.fly);
    match t.size {
        "small" | "tiny" => row[ci!("size_small")] = 1.0,
        "large" | "huge" | "gargantuan" => row[ci!("size_large")] = 1.0,
        _ => row[ci!("size_medium")] = 1.0,
    }
    // abilities (Strength after drain)
    for ab in Ability::ALL {
        let score = if ab == Ability::Str { u.strength() } else { t.abil[ab.idx()] };
        row[ci!("str_mod_div5") + ab.idx()] = crate::content::ability_mod(score) as f32 / 5.0;
        row[ci!("save_str_div10") + ab.idx()] = u.save_mod(ab) as f32 / 10.0;
    }
    // damage response
    for (k, d) in Dmg::ALL.iter().enumerate() {
        let bit = d.bit();
        row[ci!("resist_acid") + k] = b(t.resist & bit != 0);
        row[ci!("vuln_acid") + k] = b(t.vulnerable & bit != 0);
        row[ci!("immune_acid") + k] = b(t.immune & bit != 0);
    }
    // condition immunities
    row[ci!("cimm_prone")] = b(t.immune_prone);
    row[ci!("cimm_paralyzed")] = b(t.immune_paralyzed);
    row[ci!("cimm_poisoned")] = b(t.immune_poisoned);
    row[ci!("cimm_frightened")] = b(t.immune_frightened);
    row[ci!("cimm_charmed")] = b(t.immune_charmed);
    row[ci!("cimm_exhaustion")] = b(t.immune_exhaustion);
    // conditions
    row[ci!("prone")] = b(u.prone());
    row[ci!("paralyzed")] = b(u.has(St::Paralyzed));
    row[ci!("incapacitated")] = b(u.has(St::Incapacitated));
    row[ci!("frightened")] = b(u.has(St::Frightened));
    row[ci!("poisoned")] = b(u.poisoned());
    row[ci!("turned")] = b(f.is_turned(i));
    row[ci!("dodging")] = b(u.dodge);
    row[ci!("disengaged")] = b(u.disengage);
    row[ci!("commanded")] = b(f.commanded(i));
    row[ci!("hidden")] = b(u.hidden());
    row[ci!("stench_immune_div4")] = u.stench_immune.len() as f32 / 4.0;
    row[ci!("str_drain_div10")] = u.str_drain.unwrap_or(0) as f32 / 10.0;
    // effects and gear
    if !u.effects.is_empty() {
        row[ci!("fx_bless")] = b(f.has_effect(i, EffKey::Bless));
        let ac_fx = f.active_effects(i, EffKey::AcBonus);
        row[ci!("fx_shield")] = b(ac_fx.iter().any(|&o| f.objs[o as usize].spell == SpellId::Shield));
        row[ci!("fx_shield_of_faith")] = b(f.has_spell_effect(i, EffKey::AcBonus, SpellId::ShieldOfFaith));
        row[ci!("fx_blur")] = b(f.active_blur(i).is_some());
        row[ci!("fx_sanctuary")] = b(f.has_effect(i, EffKey::TargetingWard));
        row[ci!("fx_aid_div10")] = f.aid_effect(i).unwrap_or(0) as f32 / 10.0;
        row[ci!("fx_guiding_bolt_mark")] = b(f.has_effect(i, EffKey::TargetedAdvantageOverride));
        row[ci!("fx_protection_evil_good")] =
            b(f.has_spell_effect(i, EffKey::AttackedAdvantageModifier, SpellId::ProtectionFromEvilAndGood));
        row[ci!("fx_ray_of_frost_slow")] = b(!f.active_effects(i, EffKey::SpeedOverride).is_empty());
        row[ci!("fx_dragons_breath")] = b(f.active_breath(i).is_some());
        row[ci!("fx_mage_armor")] = b(f.has_effect(i, EffKey::AcOverride));
    }
    row[ci!("fx_innate_sorcery")] = b(f.innate_active(i));
    row[ci!("fx_spiritual_weapon")] = b(f.active_force(i).is_some());
    row[ci!("fx_sapped")] = b(u.sap.is_some());
    row[ci!("concentrating")] = b(u.concentration.is_some());
    let mut thrown = 0;
    let mut seen_items: u32 = 0;
    for def in &t.attacks {
        if let (true, Some(item)) = (def.thrown, def.item) {
            if seen_items & (1 << item) != 0 {
                continue;
            }
            seen_items |= 1 << item;
            if u.gear_off & (1 << item) == 0 {
                thrown += 1;
            }
            for (k, s) in t.spares.iter().enumerate() {
                if s.0 == item {
                    thrown += u.spares[k];
                }
            }
        }
        // an NPC's thrown row: the items left (a Goblin Minion's daggers)
        if let (true, Some(k)) = (def.thrown, def.npc_item) {
            thrown += u.items[k as usize];
        }
    }
    row[ci!("thrown_left_div2")] = thrown as f32 / 2.0;
    row[ci!("hand_slots_div2")] = f.used_hand_slots(i) as f32 / 2.0;
    row[ci!("wearing_armor")] = b(t.wearing_armor);
    let knows_shield = t.caster.as_ref().is_some_and(|c| c.reaction_spells.contains(&SpellId::Shield));
    row[ci!("can_shield")] = b(knows_shield
        && u.has_reaction()
        && u.conscious()
        && !f.has_spell_effect(i, EffKey::AcBonus, SpellId::Shield)
        && f.next_slot(i, 1).is_some());
    row[ci!("undead_fortitude")] = b(t.undead_fortitude.is_some());
    // turn resources
    row[ci!("action")] = u.action as f32;
    row[ci!("bonus_action")] = u.bonus as f32;
    row[ci!("reaction")] = b(u.has_reaction());
    row[ci!("movement_div60")] = u.available_movement() as f32 / 60.0;
    let ma_left = if t.multiattack.is_empty() { 0 } else { u.ma_groups.iter().map(|(_, v)| v.len()).max().unwrap_or(0) };
    row[ci!("multiattack_left_div3")] = ma_left as f32 / 3.0;
    row[ci!("action_surge_active")] = b(u.action_surge_flag);
    row[ci!("slot_spell_cast")] = b(f.spent_slot_this_turn(i));
    // class resources
    row[ci!("slots_l1_div4")] = u.slots[1] as f32 / 4.0;
    row[ci!("slots_l2_div4")] = u.slots[2] as f32 / 4.0;
    row[ci!("sorcery_points_div5")] = u.sorcery_points as f32 / 5.0;
    row[ci!("channel_divinity_div2")] = if t.channel_divinity { u.cd as f32 / 2.0 } else { 0.0 };
    row[ci!("second_wind_div3")] = if t.fighter { u.second_wind_count as f32 / 3.0 } else { 0.0 };
    row[ci!("action_surge_uses")] = if t.fighter { u.action_surge_count as f32 } else { 0.0 };
    row[ci!("free_casts_div2")] = u.free_casts.len() as f32 / 2.0;
    row[ci!("innate_sorcery_uses_div2")] = if t.innate_sorcery { u.innate_sorcery as f32 / 2.0 } else { 0.0 };
    row[ci!("holy_water")] = u.holy_water as f32;
    // offense summary
    let (mut melee_hit, mut ranged_hit, mut range) = (None::<i32>, None::<i32>, 0);
    let mut ranged_attack = false;
    for (k, def) in t.attacks.iter().enumerate() {
        if !f.attack_available(i, k) {
            continue;
        }
        range = range.max(def.range);
        if def.ranged {
            ranged_attack = true;
        }
        if def.save_attack.is_some() {
            continue;
        }
        let to_hit = f.attack_numbers(i, k).0;
        let slot = if def.ranged { &mut ranged_hit } else { &mut melee_hit };
        *slot = Some(slot.map_or(to_hit, |v| v.max(to_hit)));
    }
    row[ci!("melee_to_hit_div10")] = melee_hit.unwrap_or(0) as f32 / 10.0;
    row[ci!("ranged_to_hit_div10")] = ranged_hit.unwrap_or(0) as f32 / 10.0;
    row[ci!("reach_div10")] = t.melee_ft.unwrap_or(0) as f32 / 10.0;
    row[ci!("weapon_range_div120")] = range as f32 / 120.0;
    row[ci!("attacks_per_action_div3")] = attacks_per_action(f, i) as f32 / 3.0;
    row[ci!("dpr_vs_ac14_div20")] = (cx.sc.dpr[i] / 20.0) as f32;
    if let Some(c) = &t.caster {
        use SpellId::*;
        row[ci!("spell_attack_div10")] = c.spell_attack as f32 / 10.0;
        row[ci!("spell_dc_div20")] = f.spell_dc(i) as f32 / 20.0;
        row[ci!("caster")] = 1.0;
        let has = |l: &[SpellId]| c.spells.iter().any(|s| l.contains(s));
        row[ci!("has_area_spell")] = b(has(&[AcidSplash, Shatter, BurningHands, Thunderwave, DragonsBreath]));
        row[ci!("has_heal")] = b(has(&[CureWounds, HealingWord, Aid]) || t.divine_spark || t.preserve_life);
        ranged_attack |=
            has(&[SacredFlame, GuidingBolt, SorcerousBurst, Firebolt, RayOfFrost, ChromaticOrb, MagicMissile, ScorchingRay]);
    } else {
        row[ci!("has_heal")] = b(t.divine_spark || t.preserve_life);
    }
    row[ci!("has_ranged_attack")] = b(ranged_attack);
    if t.pc {
        row[ci!("level_div5")] = pc_level(t, cx.version) as f32 / 5.0;
    }
    // initiative
    let pos = cx.sc.order_pos[i];
    if pos >= 0 && !f.order.is_empty() {
        let len = f.order.len() as i32;
        let cur = f.turn_idx as i32;
        row[ci!("turns_until_acts_div24")] = ((pos - cur).rem_euclid(len)) as f32 / 24.0;
        row[ci!("acted_this_round")] = b(pos < cur);
    }
    row[ci!("initiative_div30")] = u.initiative as f32 / 30.0;
    row[ci!("is_current")] = b(Some(i) == cx.actor);
    // traits
    row[ci!("undead")] = b(t.undead);
    row[ci!("elf")] = b(t.elf);
    row[ci!("stench_dc_div20")] = t.stench_dc.unwrap_or(0) as f32 / 20.0;
}

/// Relation channel numbers of `creature_rel` ([`RELATIONS`]).
mod rel {
    pub const FRIGHTENED_OF: usize = 0;
    pub const SAVE_IMMUNE: usize = 1;
    pub const EFFECT_FROM: usize = 2;
    pub const SEES: usize = 3;
    pub const IN_REACH: usize = 4;
}

/// A character's level (the larger of its fighter and caster levels; 0 for
/// monsters).
fn pc_level(t: &crate::content::Template, version: Version) -> i32 {
    if version == Version::V3 {
        return t.level;
    }
    t.fighter_level.max(t.caster.as_ref().map_or(0, |c| c.level))
}

/// The `ember-gen-v2` relation masks (bit `j` of creature `i`'s mask), for
/// living `i` and `j != i` only:
/// - `fear`: `j` is an active source of `i`'s Frightened: Turn Undead's
///   timed fear before it expires, or a Dreadful Glare's fear until the end of
///   `j`'s next turn (`Fight::step_toward_fear`'s sources);
/// - `immune`: `i` saved against an `immune_on_success` save attack of `j`
///   (`save_immune_to`) or against `j`'s Stench (`stench_immune`);
/// - `effect`: `i` is under an effect `j` caused: an active spell or feature
///   effect with source `j` (Bless, Shield of Faith, Sanctuary, Aid, Guiding
///   Bolt's mark, Protection from Evil and Good, Ray of Frost's slow, Command,
///   Dragon's Breath, ...), Sap from `j`'s hit, `j`'s Stench poison, or
///   turning by `j`'s Turn Undead (`is_turned`'s rule).
fn relation_masks(f: &Fight, sc: &mut Scratch) {
    let gt = f.gt();
    let mut alive = 0u32;
    for (j, u) in f.units.iter().enumerate() {
        if !u.dead() {
            alive |= 1 << j;
        }
    }
    sc.fear.clear();
    sc.immune.clear();
    sc.effect.clear();
    for (i, u) in f.units.iter().enumerate() {
        let (mut fear, mut immune, mut effect) = (0u32, 0u32, 0u32);
        if !u.dead() {
            for &(s, until) in &u.frightened_by {
                if gt < until {
                    fear |= 1 << s;
                }
            }
            for &(s, _) in &u.source_fear {
                fear |= 1 << s;
            }
            for &(s, _) in &u.save_immune_to {
                immune |= 1 << s;
            }
            for &s in &u.stench_immune {
                immune |= 1 << s;
            }
            for (_, list) in &u.effects {
                for e in list {
                    if e.exp.is_none_or(|x| x > gt) {
                        let o = &f.objs[e.obj as usize];
                        if !o.ended {
                            effect |= 1 << o.source;
                        }
                    }
                }
            }
            if let Some(s) = u.sap {
                effect |= 1 << s;
            }
            for &s in &u.stench_poison {
                effect |= 1 << s;
            }
            for &(s, until, _) in &u.turned_by {
                if gt < until && !f.units[s].incapacitated() {
                    effect |= 1 << s;
                }
            }
        }
        let keep = alive & !(1u32 << i);
        sc.fear.push(fear & keep);
        sc.immune.push(immune & keep);
        sc.effect.push(effect & keep);
    }
}

#[inline]
fn has_bit(mask: u32, j: usize) -> bool {
    mask & (1u32 << j) != 0
}

/// `creature_rel[i, j, r]` ([`RELATIONS`]): the three masks, then line of
/// sight and melee reach between living creatures that are not masked from
/// the view team (a hidden creature's position stays unobserved).
fn encode_relations(cx: &Ctx, out: &mut [u8]) {
    out.fill(0);
    let f = cx.f;
    let sc = cx.sc;
    for (i, ui) in f.units.iter().enumerate() {
        if ui.dead() {
            continue;
        }
        let placed = !cx.masked(i);
        for (j, uj) in f.units.iter().enumerate() {
            if j == i || uj.dead() {
                continue;
            }
            let row = &mut out[(i * N + j) * R..(i * N + j + 1) * R];
            row[rel::FRIGHTENED_OF] = has_bit(sc.fear[i], j) as u8;
            row[rel::SAVE_IMMUNE] = has_bit(sc.immune[i], j) as u8;
            row[rel::EFFECT_FROM] = has_bit(sc.effect[i], j) as u8;
            if placed && !cx.masked(j) {
                row[rel::SEES] = f.can_see(i, j) as u8;
                if let Some(reach) = uj.t.melee_ft {
                    row[rel::IN_REACH] = (reach > 0 && f.within_reach(uj.pos, ui.pos, reach)) as u8;
                }
            }
        }
    }
}

/// The `ember-gen-v2` part of a creature's token (indices 160-182).
fn creature_row_v2(cx: &Ctx, i: usize, row: &mut [f32]) {
    let f = cx.f;
    let u = &f.units[i];
    let t = u.t;
    let sc = cx.sc;
    // fear and curse
    row[ci!("cursed")] = b(u.cursed);
    let fear = sc.fear[i];
    row[ci!("fear_sources_div4")] = fear.count_ones() as f32 / 4.0;
    if !cx.masked(i) {
        // Frightened's Disadvantage: a source in its sight (a position fact)
        let mut m = fear;
        while m != 0 {
            let src = m.trailing_zeros() as usize;
            m &= m - 1;
            if f.can_see(i, src) {
                row[ci!("fear_disadvantage")] = 1.0;
                break;
            }
        }
    }
    row[ci!("frightens_div4")] = sc.fear.iter().filter(|&&m| has_bit(m, i)).count() as f32 / 4.0;
    if let Some(a) = cx.actor {
        row[ci!("fears_actor")] = b(has_bit(fear, a));
        row[ci!("feared_by_actor")] = b(has_bit(sc.fear[a], i));
        row[ci!("save_immune_to_actor")] = b(has_bit(sc.immune[i], a));
        row[ci!("actor_save_immune")] = b(has_bit(sc.immune[a], i));
    }
    // what its available attacks do on a hit or a failed save
    for (k, def) in t.attacks.iter().enumerate() {
        if !f.attack_available(i, k) {
            continue;
        }
        for oh in &def.on_hit {
            let slot = match oh {
                OnHit::SaveCondition { .. } => ci!("atk_paralysis"),
                OnHit::LifeDrain => ci!("atk_life_drain"),
                OnHit::StrengthDrain => ci!("atk_strength_drain"),
                OnHit::Curse => ci!("atk_curse"),
                OnHit::Frighten => ci!("atk_frighten"),
            };
            row[slot] = 1.0;
        }
        if def.kill_at_zero {
            row[ci!("atk_kill_at_zero")] = 1.0;
        }
        if def.save_attack.is_some() {
            row[ci!("atk_save")] = 1.0;
        }
        if def.sap {
            row[ci!("atk_sap")] = 1.0;
        }
        if !def.additional_adv.is_empty() {
            row[ci!("atk_adv_damage")] = 1.0;
        }
    }
    // traits and senses
    row[ci!("passive_perception_div20")] = t.passive_perception as f32 / 20.0;
    row[ci!("stealth_total_div20")] = u.hidden_stealth.unwrap_or(0) as f32 / 20.0;
    row[ci!("pfeg_protected")] = b(t.pfeg_protected);
    row[ci!("nimble_escape")] = b(t.nimble_escape.is_some());
    row[ci!("redirect_reaction")] = b(t.swap_retarget.is_some());
    row[ci!("turn_undead")] = b(t.turn_undead);
}

/// The position group of a creature's token (absent when it is masked).
fn position_features(cx: &Ctx, i: usize, row: &mut [f32]) {
    let f = cx.f;
    let u = &f.units[i];
    row[ci!("x_div32")] = (u.pos.0 + cx.ox) as f32 / 32.0;
    row[ci!("y_div32")] = (u.pos.1 + cx.oy) as f32 / 32.0;
    if let Some(a) = cx.actor {
        let ap = f.units[a].pos;
        let (dx, dy) = (u.pos.0 - ap.0, u.pos.1 - ap.1);
        row[ci!("dx_div32")] = dx as f32 / 32.0;
        row[ci!("dy_div32")] = dy as f32 / 32.0;
        row[ci!("dist_div32")] = f.square_distance(ap, u.pos) as f32 / 32.0;
        row[ci!("cheb_div32")] = dx.abs().max(dy.abs()) as f32 / 32.0;
        let cost = if i == a {
            Some(0)
        } else {
            // the cheapest free square next to it, plus one step onto it
            let step = 1 + f.units[a].prone() as i32;
            let mut best: Option<i32> = None;
            for nx in -1..=1 {
                for ny in -1..=1 {
                    if nx == 0 && ny == 0 {
                        continue;
                    }
                    if let Some(s) = cx.steps_to((u.pos.0 + nx, u.pos.1 + ny)) {
                        let c = (s as i32 + 1) * step;
                        best = Some(best.map_or(c, |b: i32| b.min(c)));
                    }
                }
            }
            best
        };
        if let Some(c) = cost {
            row[ci!("path_cost_div32")] = c as f32 / 32.0;
        }
        if i != a {
            if let Some(reach) = f.units[a].t.melee_ft {
                row[ci!("in_actor_reach")] = b(f.within_reach(ap, u.pos, reach));
            }
        }
        row[ci!("actor_sees")] = b(f.can_see(a, i));
        row[ci!("sees_actor")] = b(f.can_see(i, a));
    }
}

fn encode_global(cx: &Ctx, env: &Env, obj: &Objective, g: &mut [f32]) {
    let f = cx.f;
    g.fill(0.0);
    g[gi!("round_div30")] = f.round as f32 / 30.0;
    g[gi!("rounds_left_div30")] = (f.max_rounds - f.round).max(0) as f32 / 30.0;
    g[gi!("standing_weight")] = obj.standing_weight;
    g[gi!("objective_health")] = b(obj.health);
    let (mut hp, mut mhp, mut standing, mut count, mut dpr) = ([0i64; 2], [0i64; 2], [0i32; 2], [0i32; 2], [0f64; 2]);
    let (mut levels, mut heroes, mut lo, mut hi) = (0i32, 0i32, i32::MAX, 0i32);
    for (i, u) in f.units.iter().enumerate() {
        let side = cx.enemy(i) as usize;
        hp[side] += if u.dead() { 0 } else { u.hp.max(0) as i64 };
        mhp[side] += f.max_hp_of(i) as i64;
        standing[side] += u.conscious() as i32;
        count[side] += 1;
        if u.conscious() {
            dpr[side] += cx.sc.dpr[i];
        }
        if u.t.pc {
            let level = pc_level(u.t, cx.version);
            heroes += 1;
            levels += level;
            lo = lo.min(level);
            hi = hi.max(level);
        }
    }
    let frac = |a: i64, b: i64| if b > 0 { a as f32 / b as f32 } else { 0.0 };
    g[gi!("ally_hp_frac")] = frac(hp[0], mhp[0]);
    g[gi!("enemy_hp_frac")] = frac(hp[1], mhp[1]);
    g[gi!("ally_standing_frac")] = frac(standing[0] as i64, count[0] as i64);
    g[gi!("enemy_standing_frac")] = frac(standing[1] as i64, count[1] as i64);
    g[gi!("ally_count_div16")] = count[0] as f32 / 16.0;
    g[gi!("enemy_count_div16")] = count[1] as f32 / 16.0;
    g[gi!("turn_actions_div24")] = env.decision().map_or(0.0, |d| d.step as f32 / 24.0);
    g[gi!("map_w_div32")] = f.grid.w as f32 / 32.0;
    g[gi!("map_h_div32")] = f.grid.h as f32 / 32.0;
    g[gi!("party_level_div5")] = if heroes > 0 { levels as f32 / heroes as f32 / 5.0 } else { 0.0 };
    if cx.v2 && heroes > 0 {
        // mixed parties: the mean (above), the lowest and the highest level
        g[gi!("party_level_min_div5")] = lo as f32 / 5.0;
        g[gi!("party_level_max_div5")] = hi as f32 / 5.0;
    }
    g[gi!("view_heroes")] = b(cx.view == 0);
    g[gi!("has_actor")] = b(cx.actor.is_some());
    g[gi!("finished")] = b(f.finished);
    g[gi!("horizon")] = b(!f.finished && f.round >= f.max_rounds);
    if !f.order.is_empty() {
        g[gi!("round_progress")] = f.turn_idx as f32 / f.order.len() as f32;
    }
    g[gi!("ally_hp_div100")] = hp[0] as f32 / 100.0;
    g[gi!("enemy_hp_div100")] = hp[1] as f32 / 100.0;
    g[gi!("ally_dpr_div50")] = (dpr[0] / 50.0) as f32;
    g[gi!("enemy_dpr_div50")] = (dpr[1] / 50.0) as f32;
    g[gi!("floor_frac")] = f.grid.floor_count() as f32 / f.grid.cells() as f32;
    // Mummy: the actor's attack rolls have Frightened's Disadvantage (a source
    // in sight); cursed creatures (can't regain Hit Points) per side
    if let Some(a) = cx.actor {
        let unit = &f.units[a];
        let gt = f.gt();
        let feared = unit.frightened_by.iter().any(|&(s, until)| gt < until && !f.units[s].dead() && f.can_see(a, s))
            || unit.source_fear.iter().any(|&(s, _)| !f.units[s].dead() && f.can_see(a, s));
        g[gi!("actor_fear_disadvantage")] = b(feared);
        g[gi!("actor_cursed")] = b(unit.cursed);
    }
    let mut cursed = [0i32; 2];
    for (i, u) in f.units.iter().enumerate() {
        if u.cursed && !u.dead() {
            cursed[cx.enemy(i) as usize] += 1;
        }
    }
    g[gi!("ally_cursed_div4")] = cursed[0] as f32 / 4.0;
    g[gi!("enemy_cursed_div4")] = cursed[1] as f32 / 4.0;
}

// ----------------------------------------------------------------------------
// Candidates
// ----------------------------------------------------------------------------

/// Target pointers with multiplicity (at most `T`, first come first kept).
#[derive(Default)]
struct Targets {
    list: [(usize, u8); T],
    len: usize,
}

impl Targets {
    fn add(&mut self, u: usize) {
        for e in self.list[..self.len].iter_mut() {
            if e.0 == u {
                e.1 = e.1.saturating_add(1);
                return;
            }
        }
        if self.len < T {
            self.list[self.len] = (u, 1);
            self.len += 1;
        }
    }
}

/// Per-target sums of the rules estimates.
#[derive(Default)]
struct Est {
    p_sum: f64,
    p_n: f64,
    dmg_enemies: f64,
    dmg_allies: f64,
    heal: f64,
    enemies: Vec<usize>,
    allies: Vec<usize>,
    adv: bool,
    dis: bool,
    crit: f64,
    downed: bool,
    concentration: bool,
    /// Expected damage to the first enemy target and its hit points.
    lethal: Option<(f64, i32)>,
}

impl Est {
    /// One target hit `count` times with success chance `p` for `dmg`
    /// expected damage in total (after resistance).
    fn hit(&mut self, f: &Fight, a: usize, t: usize, count: f64, p: f64, dmg: f64) {
        let enemy = f.units[t].team != f.units[a].team;
        if enemy {
            self.p_sum += p * count;
            self.p_n += count;
            self.dmg_enemies += dmg;
            if !self.enemies.contains(&t) {
                self.enemies.push(t);
            }
            if self.lethal.is_none() {
                self.lethal = Some((dmg, f.units[t].hp));
                self.downed = !f.units[t].conscious();
            }
            if dmg > 0.0 && f.units[t].concentration.is_some() {
                self.concentration = true;
            }
        } else {
            self.dmg_allies += dmg;
            if !self.allies.contains(&t) {
                self.allies.push(t);
            }
        }
    }

    fn ally(&mut self, t: usize, heal: f64) {
        self.heal += heal;
        if !self.allies.contains(&t) {
            self.allies.push(t);
        }
    }

    fn write(&self, row: &mut [f32]) {
        row[ai!("p_success")] = if self.p_n > 0.0 { (self.p_sum / self.p_n) as f32 } else { 0.0 };
        row[ai!("exp_dmg_enemies_div40")] = (self.dmg_enemies / 40.0) as f32;
        row[ai!("exp_heal_div20")] = (self.heal / 20.0) as f32;
        row[ai!("exp_dmg_allies_div40")] = (self.dmg_allies / 40.0) as f32;
        row[ai!("enemies_affected_div4")] = self.enemies.len() as f32 / 4.0;
        row[ai!("allies_affected_div4")] = self.allies.len() as f32 / 4.0;
        row[ai!("advantage")] = b(self.adv);
        row[ai!("disadvantage")] = b(self.dis);
        row[ai!("target_downed")] = b(self.downed);
        row[ai!("provokes_concentration")] = b(self.concentration);
        row[ai!("p_crit")] = self.crit as f32;
        if let Some((d, hp)) = self.lethal {
            row[ai!("lethal_frac")] = (d / hp.max(1) as f64).min(1.0) as f32;
        }
    }
}

/// The candidate row of `act` for actor `a`; returns (cell, spell id, attack id).
fn encode_cand(cx: &Ctx, a: usize, act: &Act, row: &mut [f32], tg: &mut Targets) -> (i16, i16, i16) {
    let f = cx.f;
    let unit = &f.units[a];
    let mut cell: i16 = -1;
    let mut spell_id: i16 = -1;
    let mut attack_id: i16 = -1;
    let mut est = Est::default();
    match act {
        Act::EndTurn => {
            row[ai!("is_end_turn")] = 1.0;
            row[ai!("no_cost")] = 1.0;
        }
        Act::Move(path) => {
            let from = unit.pos;
            let dest = *path.last().unwrap_or(&from);
            cell = cx.canvas(dest) as i16;
            let difficult = f.difficult(a, dest) && !unit.t.fly;
            // movement spent: every step of the path (a one-square move: one step)
            let mut cost = 0;
            for &p in path.iter().skip(1) {
                cost += 1 + (f.difficult(a, p) && !unit.t.fly) as i32 + unit.prone() as i32;
            }
            row[ai!("move_squares_div12")] = cost as f32 / 12.0;
            let (dx, dy) = ((dest.0 - from.0).signum(), (dest.1 - from.1).signum());
            let dir = match (dx, dy) {
                (-1, -1) => Some(0),
                (0, -1) => Some(1),
                (1, -1) => Some(2),
                (-1, 0) => Some(3),
                (1, 0) => Some(4),
                (-1, 1) => Some(5),
                (0, 1) => Some(6),
                (1, 1) => Some(7),
                _ => None,
            };
            if let Some(d) = dir {
                row[ai!("dir_nw") + d] = 1.0;
            }
            let g = &f.grid;
            let es = |p: Pos| -> f32 {
                let s = cx.sc.enemy_steps[g.index(p.0, p.1)];
                if s == INF {
                    1.0
                } else {
                    (s as f32).min(32.0) / 32.0
                }
            };
            row[ai!("enemy_steps_before_div32")] = es(from);
            row[ai!("enemy_steps_after_div32")] = es(dest);
            let oas = f.opportunity_attacks(a, path).iter().filter(|&&(e, _)| !cx.masked(e)).count();
            row[ai!("opportunity_attacks_div4")] = oas as f32 / 4.0;
            let di = g.index(dest.0, dest.1);
            row[ai!("dest_threat_div4")] = cx.sc.threat[di] as f32 / 4.0;
            row[ai!("dest_exposure_div4")] = cx.sc.exposure[di] as f32 / 4.0;
            let (mut leaves, mut enters) = (false, false);
            for (e, eu) in f.units.iter().enumerate() {
                if !cx.enemy(e) || !eu.conscious() || cx.masked(e) {
                    continue;
                }
                if let Some(reach) = eu.t.melee_ft {
                    let before = f.within_reach(eu.pos, from, reach);
                    let after = f.within_reach(eu.pos, dest, reach);
                    leaves |= before && !after;
                    enters |= !before && after;
                }
            }
            row[ai!("leaves_enemy_reach")] = b(leaves);
            row[ai!("enters_enemy_reach")] = b(enters);
            row[ai!("dest_difficult")] = b(difficult);
            row[ai!("prone_move")] = b(unit.prone());
            if cx.v2 {
                row[ai!("dest_sees_fear_source")] = b(sees_fear_source_from(cx, a, dest));
                row[ai!("dest_visited")] = b(unit.trail.contains(&dest));
                // the path starts on the mover's square
                row[ai!("path_steps_div12")] = path.len().saturating_sub(1) as f32 / 12.0;
            }
        }
        Act::Attack { atk, target, reaction } => {
            attack_id = cx.ids.attack[unit.tid as usize][*atk];
            if *reaction {
                row[ai!("uses_reaction")] = 1.0;
                row[ai!("is_opportunity_attack")] = 1.0;
            } else {
                row[ai!("uses_action")] = 1.0;
            }
            weapon_descriptor(f, a, *atk, Some(*target), false, row);
            attack_estimate(f, a, *atk, *target, false, &mut est);
            tg.add(*target);
            if cx.v2 {
                attack_riders(f, a, *atk, Some((*target, est.p_sum)), row);
            }
        }
        Act::BlindAttack { atk, square, .. } => {
            attack_id = cx.ids.attack[unit.tid as usize][*atk];
            row[ai!("uses_action")] = 1.0;
            row[ai!("blind")] = 1.0;
            cell = cx.canvas(*square) as i16;
            // an unseen creature standing there is attacked normally
            // (`_resolve_blind_attack`); an empty square is a certain miss,
            // and so is the square of a creature masked from the view team
            let occupant = (0..f.units.len())
                .find(|&o| o != a && f.units[o].pos == *square && !f.units[o].dead() && !f.can_see(a, o))
                .filter(|&o| !cx.masked(o));
            weapon_descriptor(f, a, *atk, occupant, false, row);
            if let Some(o) = occupant {
                attack_estimate(f, a, *atk, o, false, &mut est);
            }
            if cx.v2 {
                attack_riders(f, a, *atk, occupant.map(|o| (o, est.p_sum)), row);
            }
        }
        Act::Dash => {
            row[ai!("uses_action")] = 1.0;
            row[ai!("dash_squares_div12")] = (f.speed_of(a) / 5) as f32 / 12.0;
        }
        Act::Disengage => {
            row[ai!("uses_action")] = 1.0;
        }
        Act::Dodge => {
            row[ai!("uses_action")] = 1.0;
            row[ai!("dodge")] = 1.0;
        }
        Act::Stand => {
            row[ai!("stand")] = 1.0;
            row[ai!("move_squares_div12")] = (f.speed_of(a) / 2 / 5) as f32 / 12.0;
        }
        Act::SecondWind => {
            row[ai!("uses_bonus_action")] = 1.0;
            row[ai!("targets_self")] = 1.0;
            row[ai!("heals")] = 1.0;
            let (mean, _, _) = dice_stats(unit.t.second_wind_die);
            est.p_sum = 1.0;
            est.p_n = 1.0;
            est.ally(a, regained(f, a, mean.min(missing_hp(f, a))));
        }
        Act::ActionSurge => {
            row[ai!("no_cost")] = 1.0;
            row[ai!("action_surge")] = 1.0;
        }
        // G8b: Nimble Escape's bonus actions (the kind is in `cand_ids`)
        Act::DisengageBonus | Act::HideBonus => {
            row[ai!("uses_bonus_action")] = 1.0;
        }
        // a native reaction option, never an external row
        Act::RedirectAttack { ally, .. } => {
            row[ai!("uses_reaction")] = 1.0;
            tg.add(*ally);
        }
        // Chruna (GENERAL_ENV.md "Chruna"): the kind is in `cand_ids`; the
        // rage and reckless state are not visible in v2 (documented gaps)
        Act::Rage => {
            row[ai!("uses_bonus_action")] = 1.0;
            row[ai!("targets_self")] = 1.0;
            row[ai!("buff")] = 1.0;
            row[ai!("duration_div10")] = 1.0;
        }
        Act::ExtendRage => {
            row[ai!("uses_bonus_action")] = 1.0;
            row[ai!("targets_self")] = 1.0;
        }
        Act::RecklessAttack => {
            row[ai!("no_cost")] = 1.0;
            row[ai!("targets_self")] = 1.0;
        }
        Act::Cleave { atk, target } => {
            attack_id = cx.ids.attack[unit.tid as usize][*atk];
            row[ai!("no_cost")] = 1.0;
            weapon_descriptor(f, a, *atk, Some(*target), true, row);
            attack_estimate(f, a, *atk, *target, true, &mut est);
            tg.add(*target);
            if cx.v2 {
                attack_riders(f, a, *atk, Some((*target, est.p_sum)), row);
            }
        }
        Act::Spell(c) => {
            spell_id = cx.ids.spell(c.spell);
            spell_row(cx, a, c, row, tg, &mut est);
            if let Some(p) = c.point {
                cell = cx.canvas(p) as i16;
            }
        }
        Act::TurnUndead => {
            row[ai!("uses_action")] = 1.0;
            row[ai!("channel_divinity")] = 1.0;
            row[ai!("save_vs_wis")] = 1.0;
            row[ai!("save_based")] = 1.0;
            let dc = f.spell_dc(a);
            row[ai!("save_dc_div20")] = dc as f32 / 20.0;
            let mut live = 0;
            let mut p_fright = 0.0;
            for t in f.turn_undead_targets(a) {
                if !f.opposing(a, t) || cx.masked(t) {
                    continue;
                }
                tg.add(t);
                if f.units[t].conscious() && !f.is_turned(t) {
                    live += 1;
                    let p = f.save_fail_chance_est(t, Ability::Wis, dc);
                    est.hit(f, a, t, 1.0, p, 0.0);
                    // a turned creature is also Frightened unless immune (`apply_turn`)
                    if !f.units[t].t.immune_frightened {
                        p_fright += p;
                    }
                }
            }
            row[ai!("turn_undead_targets_div4")] = live as f32 / 4.0;
            if cx.v2 {
                row[ai!("rider_frighten")] = 1.0;
                if live > 0 {
                    row[ai!("p_frighten")] = (p_fright / live as f64) as f32;
                }
            }
        }
        Act::DivineSpark { target, heal, dt } => {
            row[ai!("uses_action")] = 1.0;
            row[ai!("channel_divinity")] = 1.0;
            let m = f.spell_mod(a);
            let amount = 4.5 + m as f64;
            tg.add(*target);
            if *heal {
                row[ai!("spark_heal")] = 1.0;
                row[ai!("heals")] = 1.0;
                est.p_sum = 1.0;
                est.p_n = 1.0;
                est.ally(*target, regained(f, *target, amount.min(missing_hp(f, *target)).max(0.0)));
            } else {
                row[ai!("spark_harm")] = 1.0;
                let dc = f.spell_dc(a);
                row[ai!("save_vs_con")] = 1.0;
                row[ai!("save_based")] = 1.0;
                row[ai!("save_dc_div20")] = dc as f32 / 20.0;
                row[ai!("half_on_save")] = 1.0;
                row[ai!("dmg_mean_div20")] = (amount / 20.0) as f32;
                row[ai!("dmg_max_div40")] = (8 + m) as f32 / 40.0;
                row[ai!("dmg_acid") + *dt as usize] = 1.0;
                let fail = f.save_fail_chance_est(*target, Ability::Con, dc);
                let mult = f.damage_multiplier_est(*target, *dt);
                let dmg = (fail * amount + (1.0 - fail) * (amount / 2.0).floor()) * mult;
                est.hit(f, a, *target, 1.0, fail, dmg);
            }
        }
        Act::PreserveLife(alloc) => {
            row[ai!("uses_action")] = 1.0;
            row[ai!("channel_divinity")] = 1.0;
            row[ai!("heals")] = 1.0;
            let total: i32 = alloc.iter().map(|e| e.1).sum();
            row[ai!("preserve_life_div20")] = total as f32 / 20.0;
            est.p_sum = 1.0;
            est.p_n = 1.0;
            for &(c, amount) in alloc {
                tg.add(c);
                est.ally(c, regained(f, c, amount as f64));
            }
        }
        Act::SpiritualWeaponMove { to } => {
            row[ai!("uses_bonus_action")] = 1.0;
            spell_id = cx.ids.spell(SpellId::SpiritualWeapon);
            cell = cx.canvas(*to) as i16;
        }
        Act::SpiritualWeaponAttack { target } => {
            row[ai!("uses_bonus_action")] = 1.0;
            row[ai!("spiritual_weapon_attack")] = 1.0;
            row[ai!("spell_attack_roll")] = 1.0;
            row[ai!("melee")] = 1.0;
            spell_id = cx.ids.spell(SpellId::SpiritualWeapon);
            tg.add(*target);
            if let Some(force) = f.active_force(a) {
                if let ObjKind::Force { level, modifier, .. } = f.objs[force as usize].kind {
                    let n = 1 + (level - 2).max(0);
                    spell_attack_damage(f, f.force_attack_origin(a, *target, Some(force)), a, *target, WeaponKind::melee(), n, 8, modifier, Dmg::Force, 1.0, row, &mut est);
                }
            }
        }
        Act::CreateSpellSlot { level } => {
            row[ai!("uses_bonus_action")] = 1.0;
            row[ai!("targets_self")] = 1.0;
            row[ai!("cast_level_div9")] = *level as f32 / 9.0;
            row[ai!("sorcery_points_div5")] = Fight::slot_creation_cost(*level) as f32 / 5.0;
        }
        Act::ConvertSpellSlot { level } => {
            row[ai!("no_cost")] = 1.0;
            row[ai!("targets_self")] = 1.0;
            row[ai!("slot_level_div9")] = *level as f32 / 9.0;
        }
        Act::InnateSorcery => {
            row[ai!("uses_bonus_action")] = 1.0;
            row[ai!("innate_sorcery")] = 1.0;
            row[ai!("targets_self")] = 1.0;
            row[ai!("buff")] = 1.0;
            row[ai!("duration_div10")] = 1.0;
        }
        Act::DragonsBreathExhale => {
            row[ai!("uses_action")] = 1.0;
            row[ai!("breath_exhale")] = 1.0;
            row[ai!("area_cone")] = 1.0;
            row[ai!("half_on_save")] = 1.0;
            row[ai!("save_vs_dex")] = 1.0;
            row[ai!("save_based")] = 1.0;
            if let Some(obj) = f.active_breath(a) {
                if let ObjKind::Breath { dt, dice, .. } = f.objs[obj as usize].kind {
                    let dc = f.spell_dc_for(f.objs[obj as usize].source, SpellId::DragonsBreath);
                    row[ai!("save_dc_div20")] = dc as f32 / 20.0;
                    let d = Dice::new(dice, 6, 0);
                    let (mean, max, _) = dice_stats(d);
                    row[ai!("dmg_mean_div20")] = (mean / 20.0) as f32;
                    row[ai!("dmg_max_div40")] = (max / 40.0) as f32;
                    row[ai!("dmg_acid") + dt as usize] = 1.0;
                    if let (_, Some(aim)) = f.best_cone(a, dt, dice, dc) {
                        cell = cx.canvas(aim) as i16;
                        let squares = f.squares_in_cone(unit.pos, aim, 3, true);
                        for c in f.creatures_in_squares(&squares, Some(a)) {
                            if cx.masked(c) {
                                continue;
                            }
                            tg.add(c);
                            area_save(f, a, c, Ability::Dex, dc - f.save_cover(f.units[a].pos, c, Ability::Dex), mean, true, dt, false, &mut est);
                        }
                    }
                }
            }
        }
    }
    est.write(row);
    if tg.list[..tg.len].iter().any(|&(u, _)| u == a) {
        row[ai!("targets_self")] = 1.0;
    }
    (cell, spell_id, attack_id)
}

/// The `ember-gen-v2` rider descriptors of an attack row (content data, so a
/// new creature with these keys needs no new ids) and, with a target and the
/// row's success chance `p` (a hit, or a failed save), the chance that the
/// curse or the fear takes hold: `p` unless the rider can't apply (the
/// target is dead or already cursed; immune to Frightened or warded against
/// the attacker by Protection from Evil and Good, as `apply_source_fear`).
fn attack_riders(f: &Fight, a: usize, atk: usize, target: Option<(usize, f64)>, row: &mut [f32]) {
    let def = &f.units[a].t.attacks[atk];
    let curse = def.on_hit.iter().any(|o| matches!(o, OnHit::Curse));
    let fright = def.on_hit.iter().any(|o| matches!(o, OnHit::Frighten));
    row[ai!("rider_curse")] = b(curse);
    row[ai!("rider_frighten")] = b(fright);
    row[ai!("kill_at_zero")] = b(def.kill_at_zero);
    row[ai!("no_damage")] = b(def.no_damage);
    row[ai!("immune_on_save")] = b(def.save_immune);
    if let Some((t, p)) = target {
        let tu = &f.units[t];
        if curse && !tu.dead() && !tu.cursed {
            row[ai!("p_curse")] = p as f32;
        }
        if fright && !tu.dead() && !tu.t.immune_frightened && !f.pfeg_wards(t, a) {
            row[ai!("p_frighten")] = p as f32;
        }
    }
}

/// The actor at `p` would see an active source of its Frightened
/// (`Fight::can_see` from `p`; sources masked from the view are skipped).
fn sees_fear_source_from(cx: &Ctx, a: usize, p: Pos) -> bool {
    let f = cx.f;
    let mut m = cx.sc.fear[a];
    while m != 0 {
        let s = m.trailing_zeros() as usize;
        m &= m - 1;
        if cx.masked(s) {
            continue;
        }
        let src = &f.units[s];
        if src.hidden_stealth.is_some_and(|st| f.units[a].t.passive_perception < st) {
            continue;
        }
        if f.grid.los(p, src.pos) {
            return true;
        }
    }
    false
}

/// Hit points a heal restores: none on a cursed creature (Mummy status; the
/// rules estimate `exp_heal_div20` shows the curse to the policy).
fn regained(f: &Fight, t: usize, amount: f64) -> f64 {
    if f.units[t].cursed {
        0.0
    } else {
        amount
    }
}

fn missing_hp(f: &Fight, t: usize) -> f64 {
    if f.units[t].dead() {
        return 0.0;
    }
    (f.max_hp_of(t) - f.units[t].hp.max(0)).max(0) as f64
}

/// The weapon part of an attack row (the attack's own numbers).
fn weapon_descriptor(f: &Fight, a: usize, atk: usize, target: Option<usize>, cleave: bool, row: &mut [f32]) {
    let def = &f.units[a].t.attacks[atk];
    let (to_hit, dmg, graze) = f.attack_numbers_ex(a, atk, cleave);
    row[ai!("weapon_attack")] = 1.0;
    row[ai!("melee")] = b(!def.ranged);
    row[ai!("ranged")] = b(def.ranged);
    row[ai!("thrown")] = b(def.thrown);
    if !def.ranged {
        row[ai!("reach_div10")] = def.range as f32 / 10.0;
    }
    row[ai!("range_div120")] = def.range as f32 / 120.0;
    row[ai!("long_range_div600")] = def.range_max as f32 / 600.0;
    if let Some(t) = target {
        row[ai!("uses_long_range")] = b(def.ranged && f.dist(a, t) * 5 > def.range);
    }
    let (mut mean, mut max, _) = dice_stats(dmg);
    // Berserker Frenzy dice when a hit would get them (Chruna)
    if let Some(n) = f.frenzy_dice(a, def) {
        mean += 3.5 * n as f64;
        max += 6.0 * n as f64;
    }
    if !def.no_damage {
        row[ai!("dmg_acid") + def.damage_type as usize] = 1.0;
    }
    for (d, dt) in &def.additional {
        let (m, x, _) = dice_stats(*d);
        mean += m;
        max += x;
        row[ai!("dmg_acid") + *dt as usize] = 1.0;
    }
    row[ai!("dmg_mean_div20")] = (mean / 20.0) as f32;
    row[ai!("dmg_max_div40")] = (max / 40.0) as f32;
    if let Some((ab, dc)) = def.save_attack {
        row[ai!("save_based")] = 1.0;
        row[ai!("save_dc_div20")] = dc as f32 / 20.0;
        row[ai!("save_vs_str") + ab.idx()] = 1.0;
    } else {
        row[ai!("to_hit_div10")] = to_hit as f32 / 10.0;
    }
    for oh in &def.on_hit {
        match oh {
            OnHit::SaveCondition { .. } => row[ai!("rider_paralysis")] = 1.0,
            OnHit::LifeDrain => row[ai!("rider_life_drain")] = 1.0,
            OnHit::StrengthDrain => row[ai!("rider_strength_drain")] = 1.0,
            // no v1 slot: the attack-name embedding tells them apart (Mummy status)
            OnHit::Curse | OnHit::Frighten => {}
        }
    }
    row[ai!("rider_sap")] = b(def.sap);
    row[ai!("graze_div5")] = graze.unwrap_or(0).max(0) as f32 / 5.0;
    // `condition: advantage` riders (G8b goblins; not in the dice mean/max)
    row[ai!("rider_adv_damage")] = b(!def.additional_adv.is_empty());
    row[ai!("multiattack_member")] = b(def.multiattack_group.is_some());
}

/// `AttackAction.ai_value`'s chance (`prob_at_least` with the attack's
/// advantage, or `save_fail_chance`), the critical chance, and the expected
/// damage after resistance (critical dice and Graze included).
fn attack_estimate(f: &Fight, a: usize, atk: usize, t: usize, cleave: bool, est: &mut Est) {
    let unit = &f.units[a];
    let def = &unit.t.attacks[atk];
    let target = &f.units[t];
    let (to_hit, dmg, graze) = f.attack_numbers_ex(a, atk, cleave);
    let mut adv_riders = false;
    let (p, crit) = if let Some((ab, dc)) = def.save_attack {
        let auto = matches!(ab, Ability::Str | Ability::Dex) && target.has(St::Paralyzed);
        (save_fail_chance(dc, target.save_mod(ab) + f.save_cover(unit.pos, t, ab), auto), 0.0)
    } else {
        let (adv, dis) = f.advantage(a, t, def);
        adv_riders = adv && !dis;
        est.adv |= adv && !dis;
        est.dis |= dis && !adv;
        let mode = Fight::mode_of(adv, dis);
        let p = prob_at_least(20, plus_string_modifier(to_hit), f.attack_ac(unit.pos, t), mode);
        let c = if unit.t.improved_critical { 0.1 } else { 0.05 };
        let mut crit = match mode {
            RollMode::Advantage => 1.0 - (1.0 - c) * (1.0 - c),
            RollMode::Disadvantage => c * c,
            RollMode::Normal => c,
        };
        if (target.has(St::Paralyzed) || target.unconscious()) && def.melee_type && f.dist(a, t) * 5 <= 5 {
            crit = p;
        }
        (p, crit.min(p))
    };
    let (mut mean, _, mut dice) = dice_stats(dmg);
    if let Some(n) = f.frenzy_dice(a, def) {
        mean += 3.5 * n as f64;
        dice += 3.5 * n as f64;
    }
    let mut exp = f.damage_multiplier(t, def.damage_type) * (p * mean.max(0.0) + crit * dice);
    for (d, dt) in &def.additional {
        let (m, _, dd) = dice_stats(*d);
        exp += f.damage_multiplier(t, *dt) * (p * m + crit * dd);
    }
    if adv_riders {
        for (d, dt) in &def.additional_adv {
            let (m, _, dd) = dice_stats(*d);
            exp += f.damage_multiplier(t, *dt) * (p * m + crit * dd);
        }
    }
    if let Some(g) = graze {
        if g > 0 {
            exp += (1.0 - p) * g as f64 * f.damage_multiplier(t, def.damage_type);
        }
    }
    est.crit = crit;
    est.hit(f, a, t, 1.0, p, exp);
}

/// A spell attack roll against `t` (`spell_attack_estimate`: advantage and
/// Bless included): `n`d`sides` + `flat`, doubled dice on a critical.
#[allow(clippy::too_many_arguments)]
fn spell_attack_damage(
    f: &Fight,
    origin: Pos,
    a: usize,
    t: usize,
    wk: WeaponKind,
    n: i32,
    sides: i32,
    flat: i32,
    dt: Dmg,
    count: f64,
    row: &mut [f32],
    est: &mut Est,
) {
    let (ph, pc) = f.spell_attack_estimate_from(a, t, wk, origin);
    let (adv, dis) = f.advantage_flags(a, t, wk);
    est.adv |= adv && !dis;
    est.dis |= dis && !adv;
    let dice = n as f64 * (sides + 1) as f64 / 2.0;
    let hit = dice + flat as f64;
    let crit = 2.0 * dice + flat as f64;
    let exp = count * f.damage_multiplier(t, dt) * ((ph - pc) * hit + pc * crit);
    row[ai!("dmg_mean_div20")] = (hit / 20.0) as f32;
    row[ai!("dmg_max_div40")] = ((n * sides + flat) as f64 / 40.0) as f32;
    row[ai!("dmg_acid") + dt as usize] = 1.0;
    est.crit = pc;
    est.hit(f, a, t, count, ph, exp);
}

/// One creature in a save-for-damage area (or a single-target save spell).
#[allow(clippy::too_many_arguments)]
fn area_save(f: &Fight, a: usize, c: usize, ab: Ability, dc: i32, full: f64, half: bool, dt: Dmg, heightened: bool, est: &mut Est) {
    let mut p = f.save_fail_probability(c, ab, dc);
    if heightened && f.opposing(a, c) {
        // Heightened Spell: the save with Disadvantage
        let s = 1.0 - p;
        p = 1.0 - s * s;
    }
    let dmg = f.damage_multiplier(c, dt) * (p * full + if half { (1.0 - p) * full / 2.0 } else { 0.0 });
    est.hit(f, a, c, 1.0, p, dmg);
}

/// Durations in rounds (6 s each), for the feature `duration_div10`.
fn duration_rounds(s: SpellId) -> f32 {
    use SpellId::*;
    match s {
        Bless | Sanctuary | Blur | DragonsBreath | SpiritualWeapon => 10.0,
        ShieldOfFaith | ProtectionFromEvilAndGood => 100.0,
        Aid | MageArmor => 4800.0,
        GuidingBolt | RayOfFrost | Command | Shield => 1.0,
        _ => 0.0,
    }
}

fn spell_row(cx: &Ctx, a: usize, c: &Cast, row: &mut [f32], tg: &mut Targets, est: &mut Est) {
    use SpellId::*;
    let f = cx.f;
    let unit = &f.units[a];
    let s = c.spell;
    let level = s.level();
    let at = c.at_level;
    row[ai!("spell")] = 1.0;
    let rays = f.pending_rays(a).filter(|_| s == ScorchingRay);
    if rays.is_some() {
        row[ai!("no_cost")] = 1.0;
    } else if s.bonus_action() {
        row[ai!("uses_bonus_action")] = 1.0;
    } else {
        row[ai!("uses_action")] = 1.0;
    }
    if level > 0 && !c.free && rays.is_none() {
        row[ai!("slot_level_div9")] = at as f32 / 9.0;
    }
    row[ai!("free_cast")] = b(c.free);
    if let Some(mm) = c.mm {
        if !rays.is_some_and(|r| r.paid_empowered) {
            row[ai!("sorcery_points_div5")] = mm.cost() as f32 / 5.0;
        }
        match mm {
            Mm::Empowered => row[ai!("mm_empowered")] = 1.0,
            Mm::Heightened => row[ai!("mm_heightened")] = 1.0,
        }
    }
    row[ai!("spell_level_div9")] = level as f32 / 9.0;
    row[ai!("cast_level_div9")] = if level > 0 { at as f32 / 9.0 } else { 0.0 };
    row[ai!("cantrip")] = b(level == 0);
    row[ai!("concentration")] = b(s.concentration());
    row[ai!("ends_concentration")] = b(s.concentration() && unit.concentration.is_some());
    row[ai!("duration_div10")] = duration_rounds(s).min(10.0) / 10.0;
    let heightened = c.mm == Some(Mm::Heightened);
    let dc = f.spell_dc_for(a, c.spell);
    let save = |row: &mut [f32], ab: Ability, half: bool| {
        row[ai!("save_based")] = 1.0;
        row[ai!("save_dc_div20")] = dc as f32 / 20.0;
        row[ai!("save_vs_str") + ab.idx()] = 1.0;
        row[ai!("half_on_save")] = b(half);
    };
    let dmg_desc = |row: &mut [f32], d: Dice, dt: Dmg| {
        let (mean, max, _) = dice_stats(d);
        row[ai!("dmg_mean_div20")] = (mean / 20.0) as f32;
        row[ai!("dmg_max_div40")] = (max / 40.0) as f32;
        row[ai!("dmg_acid") + dt as usize] = 1.0;
    };
    let t0 = c.targets.first().copied();
    let ranged = |range: i32| WeaponKind::spell_ranged(range);
    match s {
        SacredFlame => {
            save(row, Ability::Dex, false);
            let d = Dice::new(1, 8, 0);
            dmg_desc(row, d, Dmg::Radiant);
            if let Some(t) = t0 {
                tg.add(t);
                area_save(f, a, t, Ability::Dex, dc, dice_stats(d).0, false, Dmg::Radiant, heightened, est);
            }
        }
        GuidingBolt | Firebolt | RayOfFrost | ChromaticOrb | SorcerousBurst | SpiritualWeapon => {
            row[ai!("spell_attack_roll")] = 1.0;
            let (wk, n, sides, flat, dt) = match s {
                GuidingBolt => (ranged(120), 4 + (at - 1).max(0), 6, 0, Dmg::Radiant),
                Firebolt => (ranged(120), 1, 10, 0, Dmg::Fire),
                RayOfFrost => (ranged(60), 1, 8, 0, Dmg::Cold),
                ChromaticOrb => (ranged(90), 3 + (at - 1).max(0), 8, 0, c.dt.unwrap_or(Dmg::Acid)),
                SorcerousBurst => (ranged(120), 1, 8, 0, c.dt.unwrap_or(Dmg::Acid)),
                _ => (WeaponKind::melee(), 1 + (at - 2).max(0), 8, f.spell_mod(a), Dmg::Force),
            };
            if s == SpiritualWeapon {
                row[ai!("melee")] = 1.0;
            } else {
                row[ai!("ranged")] = 1.0;
                row[ai!("range_div120")] = wk.range as f32 / 120.0;
            }
            if let Some(t) = t0 {
                tg.add(t);
                if s == SorcerousBurst {
                    // exploding d8s up to the spellcasting modifier
                    let cap = crate::content::ability_mod(unit.t.abil[Ability::Cha.idx()]).max(0);
                    let hit = 4.5 * crate::sorcerer::expected_dice(1, cap);
                    let crit = 4.5 * crate::sorcerer::expected_dice(2, cap);
                    let (ph, pc) = f.spell_attack_estimate(a, t, wk);
                    let (adv, dis) = f.advantage_flags(a, t, wk);
                    est.adv |= adv && !dis;
                    est.dis |= dis && !adv;
                    row[ai!("dmg_mean_div20")] = (hit / 20.0) as f32;
                    row[ai!("dmg_max_div40")] = (8 * (1 + cap)) as f32 / 40.0;
                    row[ai!("dmg_acid") + dt as usize] = 1.0;
                    est.crit = pc;
                    let exp = f.damage_multiplier(t, dt) * ((ph - pc) * hit + pc * crit);
                    est.hit(f, a, t, 1.0, ph, exp);
                } else {
                    spell_attack_damage(f, if s == SpiritualWeapon { f.force_attack_origin(a, t, None) } else { unit.pos }, a, t, f.kind_for_spell(a, s, wk), n, sides, flat, dt, 1.0, row, est);
                }
            }
        }
        ScorchingRay => {
            row[ai!("spell_attack_roll")] = 1.0;
            row[ai!("ranged")] = 1.0;
            row[ai!("range_div120")] = 1.0;
            let remaining = crate::spells::ScorchingRays::count(at) - rays.map_or(0, |r| r.next - 1);
            row[ai!("projectiles_div5")] = remaining as f32 / 5.0;
            for &t in &c.targets {
                tg.add(t);
            }
            for &(t, m) in &tg.list[..tg.len] {
                spell_attack_damage(f, unit.pos, a, t, f.kind_for_spell(a, s, ranged(120)), 2, 6, 0, Dmg::Fire, m as f64, row, est);
            }
        }
        MagicMissile => {
            let darts = 3 + (at - 1).max(0);
            row[ai!("projectiles_div5")] = darts as f32 / 5.0;
            row[ai!("ranged")] = 1.0;
            row[ai!("range_div120")] = 1.0;
            row[ai!("dmg_mean_div20")] = (3.5 / 20.0) as f32;
            row[ai!("dmg_max_div40")] = 5.0 / 40.0;
            row[ai!("dmg_force")] = 1.0;
            for &t in &c.targets {
                tg.add(t);
            }
            for &(t, m) in &tg.list[..tg.len] {
                // Shield blocks the darts
                let shielded = f.has_spell_effect(t, EffKey::AcBonus, SpellId::Shield);
                let p = if shielded { 0.0 } else { 1.0 };
                let dmg = p * m as f64 * 3.5 * f.damage_multiplier(t, Dmg::Force);
                est.hit(f, a, t, m as f64, p, dmg);
            }
        }
        AcidSplash | Shatter | BurningHands | Thunderwave => {
            let (ab, d, dt, half) = match s {
                AcidSplash => (Ability::Dex, Dice::new(1, 6, 0), Dmg::Acid, false),
                Shatter => (Ability::Con, Dice::new(3 + (at - 2).max(0), 8, 0), Dmg::Thunder, true),
                BurningHands => (Ability::Dex, Dice::new(3 + (at - 1).max(0), 6, 0), Dmg::Fire, true),
                _ => (Ability::Con, Dice::new(2 + (at - 1).max(0), 8, 0), Dmg::Thunder, true),
            };
            save(row, ab, half);
            dmg_desc(row, d, dt);
            match s {
                AcidSplash | Shatter => row[ai!("area_sphere")] = 1.0,
                BurningHands => row[ai!("area_cone")] = 1.0,
                _ => row[ai!("area_cube")] = 1.0,
            }
            if let Some(p) = c.point {
                let creatures = match s {
                    AcidSplash => f.creatures_in_squares(&f.squares_in_radius(p, 5, true), None),
                    Shatter => f.creatures_in_squares(&f.squares_in_radius(p, 10, true), None),
                    BurningHands => f.creatures_in_squares(&f.squares_in_cone(unit.pos, p, 3, true), Some(a)),
                    _ => f.creatures_in_squares(&f.cube_squares(unit.pos, p, 3), Some(a)),
                };
                let full = dice_stats(d).0;
                let mut first_enemy = heightened;
                for t in creatures {
                    if cx.masked(t) {
                        continue;
                    }
                    tg.add(t);
                    let h = first_enemy && f.opposing(a, t);
                    if h {
                        first_enemy = false;
                    }
                    let origin = if s == AcidSplash { c.point.unwrap_or(unit.pos) } else { unit.pos };
                    area_save(f, a, t, ab, dc - f.save_cover(origin, t, ab), full, half, dt, h, est);
                }
            }
        }
        Command => {
            save(row, Ability::Wis, false);
            let mut first = heightened;
            for &t in &c.targets {
                tg.add(t);
                let mut p = f.save_fail_probability(t, Ability::Wis, dc);
                if first {
                    let s2 = 1.0 - p;
                    p = 1.0 - s2 * s2;
                    first = false;
                }
                est.hit(f, a, t, 1.0, p, 0.0);
            }
        }
        CureWounds | HealingWord => {
            row[ai!("heals")] = 1.0;
            let sides = if s == CureWounds { 8 } else { 4 };
            let mut mean = (2 * at) as f64 * (sides + 1) as f64 / 2.0 + f.spell_mod(a) as f64;
            est.p_sum = 1.0;
            est.p_n = 1.0;
            if let Some(t) = t0 {
                tg.add(t);
                if unit.t.disciple_of_life && !c.free && !f.units[t].t.undead {
                    mean += (2 + at) as f64;
                }
                est.ally(t, regained(f, t, mean.min(missing_hp(f, t))));
            }
        }
        Aid => {
            row[ai!("heals")] = 1.0;
            row[ai!("buff")] = 1.0;
            let bonus = 5 * (1 + (at - 2).max(0));
            est.p_sum = 1.0;
            est.p_n = 1.0;
            for &t in &c.targets {
                tg.add(t);
                let gain = if f.units[t].dead() || !f.units[t].t.pc || f.aid_effect(t).is_some_and(|x| x >= bonus) {
                    0.0
                } else {
                    bonus as f64
                };
                est.ally(t, gain);
            }
        }
        Bless | ShieldOfFaith | ProtectionFromEvilAndGood | Sanctuary | MageArmor | Blur | DragonsBreath
        | LesserRestoration | SpareTheDying | Shield => {
            row[ai!("buff")] = 1.0;
            est.p_sum = 1.0;
            est.p_n = 1.0;
            for &t in &c.targets {
                tg.add(t);
                est.ally(t, 0.0);
            }
        }
    }
}
