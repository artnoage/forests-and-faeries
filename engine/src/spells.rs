//! Heroes' spells and class features: natural20's spell classes
//! (`natural20/spell/*`), their SRD 5.2 AI values
//! (`natural20/spell/extensions/divine_spell_ai.py`, `spell_ai.py`,
//! `utils/ai_estimates.py`) and the scenario's spell candidate builder
//! (`UndeadArena._spell_actions`: `autobuild` + filters).
//!
//! This work includes material from the System Reference Document 5.2.1
//! ("SRD 5.2.1") by Wizards of the Coast LLC, available at
//! https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative
//! Commons Attribution 4.0 International License.

use crate::web_events::SaveOutcome;
use crate::content::{ability_mod, Ability, Dmg, SpellId};
use crate::effects::{EffKey, HookEv, HookKind, ObjKind};
use crate::engine::{Act, Fight, HitState, St, WeaponKind};
use crate::map::Pos;
use crate::sorcerer::{DmgRef, RollObj};
use crate::trace::RollMode;

pub const POINTLESS: f64 = -1.0;
pub const DOWNED_FOE_WEIGHT: f64 = 0.1;
/// Mage Armor's AI horizon (`mage_armor_spell.HORIZON_ROUNDS`, as Blur's).
const MAGE_ARMOR_HORIZON_ROUNDS: f64 = 3.0;
/// Mage Armor's duration (8 hours, in game seconds).
const MAGE_ARMOR_SECONDS: i32 = 8 * 60 * 60;

/// `mage_armor_spell.mage_armor_ac`: Mage Armor never lowers a better base
/// (N20-033): `max(equipped_ac, 13 + DEX)`.
pub fn mage_armor_ac(t: &crate::content::Template) -> i32 {
    t.ac.max(13 + ability_mod(t.abil[Ability::Dex.idx()]))
}

/// One spell casting chosen by the AI (`SpellAction` with its target).
#[derive(Clone, Debug, PartialEq)]
pub struct Cast {
    pub spell: SpellId,
    pub at_level: i32,
    /// Paid from a Magic Initiate free cast (`free_cast_pool`).
    pub free: bool,
    pub targets: Vec<usize>,
    /// `action.target` was a tuple (multi-target param), not a single entity.
    pub multi: bool,
    pub point: Option<Pos>,
    /// Sorcerer Metamagic option of this casting.
    pub mm: Option<Mm>,
    /// Damage type chosen at build time (Sorcerous Burst, Chromatic Orb).
    pub dt: Option<Dmg>,
}

/// The unpaid damage rerolls and targets still to choose in one casting.
#[derive(Clone, Copy, Debug)]
pub(crate) struct ScorchingRays {
    pub caster: usize,
    level: i32,
    pub next: i32,
    free: bool,
    metamagic: Option<Mm>,
    rerolls_left: usize,
    pub paid_empowered: bool,
}

impl ScorchingRays {
    pub fn count(level: i32) -> i32 {
        3 + (level - 2).max(0)
    }
}

/// `natural20/utils/metamagic.py` options.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Mm {
    Empowered,
    Heightened,
}

impl Mm {
    pub fn key(self) -> &'static str {
        match self {
            Mm::Empowered => "empowered_spell",
            Mm::Heightened => "heightened_spell",
        }
    }
    pub fn cost(self) -> i32 {
        match self {
            Mm::Empowered => 1,
            Mm::Heightened => 2,
        }
    }
}

/// One result item of a spell's resolve, committed in order.
pub(crate) enum Item {
    Damage {
        t: usize,
        amount: i32,
        halved: bool,
        dt: Dmg,
        crit: bool,
        save: Option<SaveOutcome>,
        atk_roll_fmt: Option<String>,
        dmg_roll_fmt: Option<String>,
    },
    /// A `spell_damage` item whose amount is read from its roll at commit.
    RDamage(DmgRef),
    SpellMiss {
        t: usize,
        save: Option<SaveOutcome>,
        atk_roll_fmt: Option<String>,
    },
    Dismiss(usize, u32),
    GuidingBolt { t: usize },
    #[allow(dead_code)] // `t` names the target, as in natural20's item
    Force { t: usize, pos: Pos, level: i32, modifier: i32 },
    Bless(usize),
    ShieldOfFaith(usize),
    Heal { t: usize, amount: i32, bonus: i32, roll: Option<String> },
    OrbLeap { from: usize, to: usize },
    Aid { t: usize, bonus: i32 },
    Command { t: usize, grovel: bool },
    Pfeg(usize),
    Sanctuary(usize),
    Stabilize(usize),
    Restore(usize),
    RayOfFrost { t: usize, action_t: usize },
    Push { t: usize, to: Pos },
    PushFrom { t: usize, origin: Pos },
    Breath { t: usize, dt: Dmg, dice: i32 },
    Blur,
    MageArmor(usize),
    Invisibility(usize),
    RayOfSickness { t: usize },
    CharmMonster { t: usize, charmed: bool },
    Entangle { squares: Vec<Pos>, dc: i32, failed: Vec<usize> },
    FaerieFire { targets: Vec<(usize, bool, String)>, dc: i32 },
    SeeInvisibility,
    ViciousMockery { t: usize },
    StarryWisp { t: usize },
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TargetTypes {
    Enemies,
    Allies,
    AlliesSelf,
    AlliesSelfEnemies,
}

impl SpellId {
    pub fn key(self) -> &'static str {
        use SpellId::*;
        match self {
            SacredFlame => "sacred_flame",
            GuidingBolt => "guiding_bolt",
            SpiritualWeapon => "spiritual_weapon",
            Bless => "bless",
            ShieldOfFaith => "shield_of_faith",
            CureWounds => "cure_wounds",
            HealingWord => "healing_word",
            Aid => "aid",
            Command => "command",
            ProtectionFromEvilAndGood => "protection_from_evil_and_good",
            Sanctuary => "sanctuary",
            SpareTheDying => "spare_the_dying",
            LesserRestoration => "lesser_restoration",
            SorcerousBurst => "sorcerous_burst",
            Firebolt => "firebolt",
            RayOfFrost => "ray_of_frost",
            AcidSplash => "acid_splash",
            ChromaticOrb => "chromatic_orb",
            MagicMissile => "magic_missile",
            BurningHands => "burning_hands",
            Thunderwave => "thunderwave",
            Shatter => "shatter",
            ScorchingRay => "scorching_ray",
            DragonsBreath => "dragons_breath",
            Blur => "blur",
            Shield => "shield",
            MageArmor => "mage_armor",
            Invisibility => "invisibility",
            RayOfSickness => "ray_of_sickness",
            CharmMonster => "charm_monster",
            Entangle => "entangle",
            FaerieFire => "faerie_fire",
            SeeInvisibility => "see_invisibility",
            ViciousMockery => "vicious_mockery",
            StarryWisp => "starry_wisp",
            PoisonSpray => "poison_spray",
        }
    }

    /// YAML `name` (used in spell attack roll descriptions).
    pub fn name(self) -> &'static str {
        use SpellId::*;
        match self {
            GuidingBolt => "Guiding Bolt",
            SpiritualWeapon => "Spiritual Weapon",
            Firebolt => "Firebolt",
            RayOfFrost => "Ray of Frost",
            ChromaticOrb => "Chromatic Orb",
            ScorchingRay => "Scorching Ray",
            SorcerousBurst => "Sorcerous Burst",
            RayOfSickness => "Ray of Sickness",
            Invisibility => "Invisibility",
            CharmMonster => "Charm Monster",
            Entangle => "Entangle",
            FaerieFire => "Faerie Fire",
            SeeInvisibility => "See Invisibility",
            ViciousMockery => "Vicious Mockery",
            StarryWisp => "Starry Wisp",
            PoisonSpray => "Poison Spray",
            _ => self.key(),
        }
    }

    pub fn level(self) -> i32 {
        use SpellId::*;
        match self {
            SacredFlame | SpareTheDying | SorcerousBurst | Firebolt | RayOfFrost | AcidSplash
                | ViciousMockery | StarryWisp | PoisonSpray => 0,
            SpiritualWeapon | Aid | LesserRestoration | Shatter | ScorchingRay | DragonsBreath
                | Blur | Invisibility | SeeInvisibility => 2,
            CharmMonster => 4,
            _ => 1,
        }
    }

    pub fn bonus_action(self) -> bool {
        use SpellId::*;
        matches!(self, SpiritualWeapon | ShieldOfFaith | HealingWord | Sanctuary | LesserRestoration | DragonsBreath)
    }

    pub fn concentration(self) -> bool {
        use SpellId::*;
        matches!(
            self,
            SpiritualWeapon | Bless | ShieldOfFaith | ProtectionFromEvilAndGood | DragonsBreath
                | Blur | Invisibility | Entangle | FaerieFire
        )
    }

    /// `friendly_fire._spell_is_harmful` on the YAML properties.
    pub fn harmful(self) -> bool {
        use SpellId::*;
        !matches!(
            self,
            Bless | ShieldOfFaith | CureWounds | HealingWord | Aid | ProtectionFromEvilAndGood | Sanctuary
                | SpareTheDying | LesserRestoration | DragonsBreath | Blur | Shield | MageArmor
                | Invisibility | SeeInvisibility
        )
    }

    /// The YAML `spell_list_classes`, lower-cased, for slot lookups: only the
    /// caster's own class has slots, so the result is the same as natural20's
    /// loop over the list.
    pub fn consumed_holy_water(self) -> bool {
        self == SpellId::ProtectionFromEvilAndGood
    }
}

pub(crate) fn is_dying(f: &Fight, u: usize) -> bool {
    let unit = &f.units[u];
    !unit.dead() && unit.unconscious() && !unit.has(St::Stable) && unit.hp <= 0
}

/// `ai_estimates.d20_success_chance`.
fn d20_success_chance(modifier: i32, target: i32, adv: bool, dis: bool) -> f64 {
    let need = target - modifier;
    let single = ((21 - need) as f64 / 20.0).max(0.0).min(1.0);
    if adv && !dis {
        return 1.0 - (1.0 - single) * (1.0 - single);
    }
    if dis && !adv {
        return single * single;
    }
    single
}

/// `spell_ai._d20_at_least`.
pub(crate) fn d20_at_least(need: i32, adv: bool, dis: bool) -> f64 {
    let single = ((21 - need) as f64 / 20.0).max(0.0).min(1.0);
    if adv && !dis {
        return 1.0 - (1.0 - single).powi(2);
    }
    if dis && !adv {
        return single.powi(2);
    }
    single
}

/// `spell_ai.attack_hit_crit`.
pub(crate) fn attack_hit_crit(modifier: i32, ac: i32, adv: bool, dis: bool) -> (f64, f64) {
    let mut hits = 0;
    let mut crits = 0;
    for face in 1..=20 {
        if face >= 20 {
            hits += 1;
            crits += 1;
        } else if face > 1 && face + modifier >= ac {
            hits += 1;
        }
    }
    let (p_hit, p_crit) = (hits as f64 / 20.0, crits as f64 / 20.0);
    if adv && !dis {
        return (1.0 - (1.0 - p_hit).powi(2), 1.0 - (1.0 - p_crit).powi(2));
    }
    if dis && !adv {
        return (p_hit.powi(2), p_crit.powi(2));
    }
    (p_hit, p_crit)
}

impl Fight {
    // ------------------------------------------------------------------
    // Queries the spell code shares
    // ------------------------------------------------------------------

    pub fn allies(&self, a: usize, b: usize) -> bool {
        self.units[a].team == self.units[b].team
    }

    /// `feet_between` / `Map.distance * 5`.
    pub fn feet(&self, a: usize, b: usize) -> i32 {
        self.dist(a, b) * 5
    }

    /// `foes_near(battle, creature, feet)`: conscious opponents within `feet`.
    pub fn foes_near(&self, c: usize, feet: i32) -> Vec<usize> {
        (0..self.units.len())
            .filter(|&o| !self.units[o].dead() && self.opposing(o, c) && self.units[o].conscious() && self.feet(c, o) <= feet)
            .collect()
    }

    /// `ai_estimates.expected_round_damage(creature, against_ac)`.
    pub fn expected_round_damage(&self, c: usize, against_ac: i32) -> f64 {
        let unit = &self.units[c];
        if unit.dead() {
            return 0.0;
        }
        if unit.t.pc || unit.t.erd.0.is_empty() {
            return 6.0;
        }
        let mut best = 0.0f64;
        for &(attack, dmg) in &unit.t.erd.0 {
            let hit = match attack {
                Some(a) => d20_success_chance(a, against_ac, false, false),
                None => 0.55,
            };
            best = best.max(hit * dmg);
        }
        best * unit.t.erd.1 as f64
    }

    /// `expected_dpr(creature, against)`.
    pub fn expected_dpr(&self, c: usize, against: Option<usize>) -> f64 {
        let ac = against.map_or(15, |a| self.attack_ac(self.units[c].pos, a));
        self.expected_round_damage(c, ac)
    }

    /// `Entity.resistant_to(dt)`: the stat block's resistances, plus
    /// bludgeoning, piercing and slashing while raging
    /// (`effective_resistances`).
    pub fn resists(&self, t: usize, dt: Dmg) -> bool {
        self.units[t].t.resist & dt.bit() != 0 || (crate::barbarian::rage_resists(dt) && self.is_raging(t))
    }

    /// `spell_ai.damage_multiplier`.
    pub fn damage_multiplier(&self, t: usize, dt: Dmg) -> f64 {
        let tt = self.units[t].t;
        if tt.immune & dt.bit() != 0 {
            return 0.0;
        }
        let r = self.resists(t, dt);
        let v = tt.vulnerable & dt.bit() != 0;
        if r && v {
            1.0
        } else if r {
            0.5
        } else if v {
            2.0
        } else {
            1.0
        }
    }

    /// `ai_estimates.damage_multiplier` (multiplicative form).
    pub(crate) fn damage_multiplier_est(&self, t: usize, dt: Dmg) -> f64 {
        let tt = self.units[t].t;
        if tt.immune & dt.bit() != 0 {
            return 0.0;
        }
        let mut m = 1.0;
        if self.resists(t, dt) {
            m *= 0.5;
        }
        if tt.vulnerable & dt.bit() != 0 {
            m *= 2.0;
        }
        m
    }

    /// `spell_ai._bless_offsets`.
    fn bless_offsets(&self, u: usize) -> Vec<i32> {
        if self.has_effect(u, EffKey::Bless) {
            vec![1, 2, 3, 4]
        } else {
            vec![0]
        }
    }

    /// `spell_ai.save_fail_probability(target, save, dc, magical=True)`.
    pub fn save_fail_probability(&self, t: usize, ab: Ability, dc: i32) -> f64 {
        self.save_fail_probability_ex(t, ab, dc, false, false)
    }

    pub(crate) fn save_fail_probability_with_disadvantage(&self, t: usize, ab: Ability, dc: i32, dis: bool) -> f64 {
        self.save_fail_probability_ex(t, ab, dc, false, dis)
    }

    pub(crate) fn save_fail_probability_ex(&self, t: usize, ab: Ability, dc: i32, extra_adv: bool, extra_dis: bool) -> f64 {
        let unit = &self.units[t];
        if matches!(ab, Ability::Str | Ability::Dex) {
            if unit.has(St::Paralyzed) {
                return 1.0;
            }
            if !unit.conscious() {
                return 1.0;
            }
        }
        let modifier = unit.save_mod(ab);
        let offsets = self.bless_offsets(t);
        let adv = extra_adv || unit.t.magic_resistance;
        let dis = extra_dis || (ab == Ability::Dex && self.is_restrained(t));
        let mut success = 0.0f64;
        for o in &offsets {
            success += d20_at_least(dc - modifier - o, adv, dis);
        }
        success /= offsets.len() as f64;
        1.0 - success
    }

    /// `ai_estimates.save_fail_chance`.
    pub(crate) fn save_fail_chance_est(&self, t: usize, ab: Ability, dc: i32) -> f64 {
        self.save_fail_chance_adv(t, ab, dc, false)
    }

    pub(crate) fn save_fail_chance_adv(&self, t: usize, ab: Ability, dc: i32, adv: bool) -> f64 {
        let unit = &self.units[t];
        if matches!(ab, Ability::Str | Ability::Dex) && unit.has(St::Paralyzed) {
            return 1.0;
        }
        1.0 - d20_success_chance(unit.save_mod(ab), dc, adv, false)
    }

    /// `ai_estimates.heal_value(target, expected_heal)`.
    fn heal_value_est(&self, t: usize, expected: f64) -> f64 {
        let unit = &self.units[t];
        if unit.dead() || unit.cursed {
            return -1.0;
        }
        let mhp = self.max_hp_of(t);
        let missing = (mhp - unit.hp).max(0);
        if missing <= 0 && !unit.unconscious() {
            return -0.5;
        }
        let pick = if missing > 0 { (missing as f64).min(expected) } else { expected };
        let restored = pick.max(1.0);
        let mut urgency = 1.0;
        if unit.unconscious() {
            urgency += 3.5;
        } else {
            let ratio = unit.hp as f64 / mhp.max(1) as f64;
            if ratio <= 0.25 {
                urgency += 2.0;
            } else if ratio <= 0.5 {
                urgency += 1.0;
            }
        }
        (restored / 3.0) * urgency
    }

    /// `spell_ai.concentration_value` via `concentration_cost(caster, battle, spell_id)`.
    fn concentration_cost(&self, caster: usize, spell: Option<SpellId>) -> f64 {
        let Some(held) = self.units[caster].concentration else { return 0.0 };
        let obj = &self.objs[held as usize];
        if let Some(s) = spell {
            if matches!(obj.kind, ObjKind::Spell) && obj.spell == s {
                return 0.0;
            }
        }
        match &obj.kind {
            ObjKind::Spell => match obj.spell {
                SpellId::Bless => 1.5 * obj.targets.iter().filter(|&&t| !self.units[t].dead()).count() as f64,
                SpellId::ShieldOfFaith => 1.5,
                SpellId::ProtectionFromEvilAndGood => 2.0,
                _ => 4.0,
            },
            ObjKind::Force { .. } => {
                let mut best = 0.0f64;
                for c in self.force_targets_in_reach(held) {
                    best = best.max(self.force_attack_value(caster, c, Some(held), 1));
                }
                if best > 0.0 {
                    2.0 * best
                } else {
                    1.0
                }
            }
            ObjKind::FaerieFire => {
                let mut val = 0.0;
                for i in 0..self.units.len() {
                    if self.opposing(caster, i) && self.units[i].conscious() && self.has_effect(i, EffKey::FaerieFire) {
                        val += if self.units[i].invisible() { 7.5 } else { 2.5 };
                    }
                }
                val
            }
            _ => 4.0,
        }
    }

    // ------------------------------------------------------------------
    // Spell attacks (estimates and rolls)
    // ------------------------------------------------------------------

    /// `spell_ai.spell_attack_estimate`.
    pub(crate) fn spell_attack_estimate(&self, caster: usize, t: usize, wk: WeaponKind) -> (f64, f64) {
        self.spell_attack_estimate_from(caster, t, wk, self.units[caster].pos)
    }

    pub(crate) fn spell_attack_estimate_from(&self, caster: usize, t: usize, wk: WeaponKind, origin: Pos) -> (f64, f64) {
        let modifier = self.units[caster].t.caster.as_ref().map_or(0, |c| c.spell_attack);
        let ac = self.attack_ac(origin, t);
        let (adv, dis) = self.advantage_flags(caster, t, wk);
        let net = adv as i32 - dis as i32;
        let offsets = self.bless_offsets(caster);
        let (mut hit, mut crit) = (0.0f64, 0.0f64);
        for o in &offsets {
            let (h, c) = attack_hit_crit(modifier + o, ac, net > 0, net < 0);
            hit += h;
            crit += c;
        }
        (hit / offsets.len() as f64, crit / offsets.len() as f64)
    }

    /// `divine_spell_ai.attack_value`.
    fn attack_value(&self, caster: usize, t: usize, origin: Pos, dt: Dmg, dice: f64, flat: f64, rider: f64, wk: WeaponKind) -> f64 {
        if !self.opposing(caster, t) {
            return POINTLESS;
        }
        let mult = self.damage_multiplier(t, dt);
        if mult <= 0.0 && rider <= 0.0 {
            return POINTLESS;
        }
        let (p_hit, p_crit) = self.spell_attack_estimate_from(caster, t, wk, origin);
        let hit = dice + flat;
        let crit = 2.0 * dice + flat;
        let mut value = mult * ((p_hit - p_crit) * hit + p_crit * crit) + p_hit * rider;
        if !self.units[t].conscious() {
            value *= DOWNED_FOE_WEIGHT;
        }
        value
    }

    fn force_strike_position(&self, target: usize, pos: Pos) -> Option<Pos> {
        let target_pos = self.units[target].pos;
        if self.square_distance(pos, target_pos) <= 1 && (self.rule_version < 7 || self.clear_effect(pos, target_pos)) {
            Some(pos)
        } else {
            self.landing_square(target, pos, Some(4))
        }
    }

    /// Origin for cover, observation features and native attack estimates.
    pub(crate) fn force_attack_origin(&self, caster: usize, target: usize, force: Option<u32>) -> Pos {
        if let Some(id) = force {
            if let ObjKind::Force { pos, .. } = self.objs[id as usize].kind {
                if self.rule_version < 12 { return pos; }
                return self.force_strike_position(target, pos).unwrap_or(self.units[target].pos);
            }
        }
        self.landing_square(target, self.units[caster].pos, Some(12)).unwrap_or(self.units[target].pos)
    }

    fn force_attack_value(&self, caster: usize, t: usize, force: Option<u32>, level: i32) -> f64 {
        let (count, flat) = match force {
            Some(obj) => match self.objs[obj as usize].kind {
                ObjKind::Force { level, modifier, .. } => (1 + (level - 2).max(0), modifier),
                _ => (1, 0),
            },
            None => (1 + (level - 2).max(0), self.spell_mod(caster)),
        };
        let dice = count as f64 * 4.5;
        self.attack_value(caster, t, self.force_attack_origin(caster, t, force), Dmg::Force, dice, flat as f64, 0.0, WeaponKind::melee())
    }

    pub fn spell_mod(&self, caster: usize) -> i32 {
        let c = self.units[caster].t.caster.as_ref().expect("caster");
        ability_mod(self.units[caster].t.abil[c.ability.idx()])
    }

    /// The untyped DC is also used for class features.
    pub fn spell_dc(&self, caster: usize) -> i32 {
        self.units[caster].t.caster.as_ref().map_or(10, |c| c.dc)
            + i32::from(self.rule_version < 9 && self.innate_active(caster))
    }

    fn is_sorcerer_spell(&self, caster: usize, spell: SpellId) -> bool {
        let u = &self.units[caster];
        if self.rule_version < 18 && u.t.id == "curogana" && spell == SpellId::BurningHands {
            return true;
        }
        u.t.caster.as_ref().is_some_and(|c| c.sorcerer_spells.contains(&spell))
    }

    pub(crate) fn kind_for_spell(&self, caster: usize, spell: SpellId, mut wk: WeaponKind) -> WeaponKind {
        if self.rule_version >= 9 {
            wk.spell = self.is_sorcerer_spell(caster, spell);
        }
        wk
    }

    pub fn spell_dc_for(&self, caster: usize, spell: SpellId) -> i32 {
        let qualifies = self.is_sorcerer_spell(caster, spell);
        self.spell_dc(caster) + i32::from(self.rule_version >= 9 && qualifies && self.innate_active(caster))
    }

    /// `evaluate_spell_attack`: advantage, the d20, Bless, the target's
    /// attack-roll reactions (Redirect Attack: the spell then reads the new
    /// target, `spell_attack_util.redirected_target`), the `attack_resolved`
    /// trigger and the target's after-roll hooks. Returns (hit, natural 20,
    /// dismiss items, the target the roll ended up against).
    pub(crate) fn evaluate_spell_attack(
        &mut self,
        caster: usize,
        t: usize,
        spell: SpellId,
        wk: WeaponKind,
    ) -> (bool, bool, Vec<(usize, u32)>, usize, Option<String>) {
        self.evaluate_spell_attack_from(caster, t, spell, wk, self.units[caster].pos)
    }

    fn evaluate_spell_attack_from(&mut self, caster: usize, t: usize, spell: SpellId, wk: WeaponKind, origin: Pos)
        -> (bool, bool, Vec<(usize, u32)>, usize, Option<String>) {
        let wk = self.kind_for_spell(caster, spell, wk);
        let ((adv, dis), reasons) = self.attack_roll_modifiers(caster, t, wk);
        let mode = Fight::mode_of(adv, dis);
        // a spell attack roll spends the caster's Sap marker too (N20-029)
        if self.units[caster].sap.is_some() {
            self.units[caster].sap = None;
            self.notes.sap_spent += 1;
        }
        self.consume_vicious_mockery(caster);
        let tag = if wk.melee { format!("Melee Spell Attack: {}", spell.name()) } else { format!("Ranged Spell Attack: {}", spell.name()) };
        let (face, dv) = self.roll_d20_raw(caster, &tag, mode);
        let modifier = self.units[caster].t.caster.as_ref().map_or(0, |c| c.spell_attack);
        let mut total = face + modifier;
        let bless = if self.has_effect(caster, EffKey::Bless) {
            let b = self.roll_dice(caster, "bless", 1, 4)[0];
            total += b;
            Some(b)
        } else {
            None
        };
        let mut atk_fmt = if self.web_events.is_some() {
            Some(crate::web_events::fmt_d20_roll(dv, mode, modifier, bless) + &reasons)
        } else {
            None
        };
        let t = self.redirect_window(caster, t, face, total, false, origin).unwrap_or(t);
        let ac = self.attack_ac(origin, t);
        self.resolve_trigger(caster, HookEv::AttackResolved);
        let items = self.resolve_trigger(t, HookEv::AfterAttackRollTarget);
        let nat20 = face == 20 && mode != RollMode::Disadvantage || (mode == RollMode::Disadvantage && face == 20);
        let nat1 = face == 1;
        if self.rule_version >= 18 && !nat20 && !nat1 && total < ac {
            if let Some((bi_roll, new_total)) = self.try_bardic_inspiration(caster, total, ac, "spell attack") {
                total = new_total;
                if let Some(ref mut text) = atk_fmt {
                    text.push_str(&format!(" + Bardic Inspiration({bi_roll}) = {new_total}"));
                }
            }
        }
        let mut force_miss = false;
        let mut shield_cast = None;
        if self.rule_version >= 16 {
            if let Some((blocks, at_level)) = self.shield_reaction_ex(t, total, ac, nat20, nat1, false) {
                force_miss = blocks;
                shield_cast = Some((at_level, total, ac));
            }
        }
        if self.rule_version >= 18 && !nat20 && !nat1 && total >= ac && !force_miss {
            if let Some((_bard, cw_roll, new_total, turned_miss)) = self.try_cutting_words_attack(caster, t, total, ac, nat20) {
                total = new_total;
                if turned_miss {
                    force_miss = true;
                }
                if let Some(ref mut text) = atk_fmt {
                    text.push_str(&format!(" − Cutting Words({cw_roll}) = {new_total}"));
                }
            }
        }
        self.describe_attack_cover(&mut atk_fmt, t, ac, shield_cast.is_some());
        if let Some((slot_level, total, ac)) = shield_cast {
            self.apply_shield(t);
            self.emit_web(crate::web_events::WebEv::ShieldCast {
                u: t,
                pos: self.units[t].pos,
                slot_level,
                attacker: caster,
                attack_name: spell.name(),
                total,
                ac,
            });
        }
        let hit = if nat20 {
            true
        } else if nat1 {
            false
        } else {
            total >= ac && !force_miss
        };
        if self.units[t].t.pc {
            self.units[t].pools_init = true;
        }
        self.reaction_scan(caster, t, !nat1 && (nat20 || total >= ac));
        (hit, nat20, items, t, atk_fmt)
    }

    // ------------------------------------------------------------------
    // Candidate building (`autobuild(SpellAction)` + `_spell_actions`)
    // ------------------------------------------------------------------

    pub(crate) fn next_slot(&self, u: usize, min_level: i32) -> Option<i32> {
        let slots = &self.units[u].slots;
        (min_level.max(1)..=2).find(|&l| slots[l as usize] > 0)
    }

    pub(crate) fn spent_slot_this_turn(&self, u: usize) -> bool {
        let last = self.units[u].last_slot_turn;
        if self.rule_version < 4 { last.is_some() } else { last == Some((self.round, self.turn_idx)) }
    }

    /// Whether `spell` is currently listed in `u`'s active multiattack groups (e.g. Dryad Charm Monster).
    pub(crate) fn multiattack_spell(&self, u: usize, spell: SpellId) -> bool {
        let unit = &self.units[u];
        if unit.t.multiattack.is_empty() || unit.ma_groups.is_empty() {
            return false;
        }
        let key = spell.key();
        unit.ma_groups.iter().any(|(_, names)| names.contains(&key))
    }

    /// `SpellAction.can_cast` (and the `spell_list` disable reasons).
    fn can_cast(&self, u: usize, spell: SpellId) -> bool {
        let unit = &self.units[u];
        let level = spell.level();
        let is_at_will = unit.t.caster.as_ref().is_some_and(|c| c.at_will.contains(&spell));
        if level > 0 && !is_at_will && self.next_slot(u, level).is_none() && !unit.free_casts.contains(&spell) {
            return false;
        }
        if spell.consumed_holy_water() && unit.holy_water < 1 {
            return false;
        }
        if spell == SpellId::Shield {
            return false;
        }
        let needs_slot = level > 0 && !is_at_will && (self.rule_version < 4 || !unit.free_casts.contains(&spell));
        if needs_slot && self.spent_slot_this_turn(u) {
            return false;
        }
        if spell.bonus_action() {
            unit.bonus > 0
        } else {
            unit.action > 0 || (unit.ma_started && self.multiattack_spell(u, spell))
        }
    }

    /// `acquire_targets(param)`.
    pub(crate) fn acquire_targets(&self, u: usize, range: i32, types: TargetTypes) -> Vec<usize> {
        let mut out = Vec::new();
        let in_range = |t: usize| -> bool { self.can_see(u, t) && self.feet(u, t) <= range };
        for t in 0..self.units.len() {
            if self.units[t].dead() {
                continue;
            }
            let enemy = self.opposing(u, t);
            let want = match types {
                TargetTypes::Enemies => enemy,
                TargetTypes::Allies | TargetTypes::AlliesSelf => !enemy,
                TargetTypes::AlliesSelfEnemies => true,
            };
            if want && (range <= 0 || in_range(t)) {
                out.push(t);
            }
        }
        if matches!(types, TargetTypes::AlliesSelf | TargetTypes::AlliesSelfEnemies) && !out.contains(&u) {
            out.push(u);
        }
        out
    }

    /// `acquire_targets(param)` with `perception == 'known_location'`
    /// (`StarryWisp`, `PoisonSpray`): allows visible targets or audible
    /// invisible (non-hidden) creatures with a clear path (`clear_effect`).
    pub(crate) fn acquire_known_location_targets(&self, u: usize, range: i32, types: TargetTypes) -> Vec<usize> {
        let origin = self.units[u].pos;
        let mut out = Vec::new();
        let in_range = |t: usize| -> bool {
            self.can_see_or_hear(u, t)
                && self.clear_effect(origin, self.units[t].pos)
                && self.feet(u, t) <= range
        };
        for t in 0..self.units.len() {
            if self.units[t].dead() {
                continue;
            }
            let enemy = self.opposing(u, t);
            let want = match types {
                TargetTypes::Enemies => enemy,
                TargetTypes::Allies | TargetTypes::AlliesSelf => !enemy,
                TargetTypes::AlliesSelfEnemies => true,
            };
            if want && (range <= 0 || in_range(t)) {
                out.push(t);
            }
        }
        if matches!(types, TargetTypes::AlliesSelf | TargetTypes::AlliesSelfEnemies) && !out.contains(&u) {
            out.push(u);
        }
        out
    }

    /// Target parameter of a spell's `build_map`: (range, types, num, min).
    fn spell_param(&self, u: usize, spell: SpellId, at_level: i32) -> (i32, TargetTypes, i32, i32) {
        use SpellId::*;
        let extra = (at_level - spell.level()).max(0);
        let _ = u;
        match spell {
            ScorchingRay if self.rule_version >= 14 => (120, TargetTypes::Enemies, 1, 1),
            SacredFlame => (60, TargetTypes::Enemies, 1, 1),
            GuidingBolt => (120, TargetTypes::Enemies, 1, 1),
            SpiritualWeapon => (65, TargetTypes::Enemies, 1, 1),
            Bless => (30, TargetTypes::Allies, 3 + (at_level - 1).max(0), 1),
            ShieldOfFaith => (60, TargetTypes::AlliesSelf, 1, 1),
            CureWounds => (5, TargetTypes::AlliesSelf, 1, 1),
            HealingWord => (60, TargetTypes::AlliesSelf, 1, 1),
            Aid => (30, TargetTypes::AlliesSelf, 3, 1),
            Command => (60, TargetTypes::Enemies, 1 + extra, 1),
            ProtectionFromEvilAndGood => (5, TargetTypes::AlliesSelf, 1, 1),
            Sanctuary => (30, TargetTypes::AlliesSelf, 1, 1),
            SpareTheDying => (15, TargetTypes::AlliesSelfEnemies, 1, 1),
            LesserRestoration => (5, TargetTypes::AlliesSelf, 1, 1),
            MageArmor => (5, TargetTypes::AlliesSelf, 1, 1),
            RayOfSickness => (60, TargetTypes::Enemies, 1, 1),
            CharmMonster => (30, TargetTypes::Enemies, 1, 1),
            StarryWisp => (60, TargetTypes::Enemies, 1, 1),
            PoisonSpray => (30, TargetTypes::Enemies, 1, 1),
            _ => (0, TargetTypes::Enemies, 0, 0),
        }
    }

    /// `UndeadArena._spell_actions(actor)`.
    pub fn spell_candidates(&mut self, u: usize, out: &mut Vec<Act>) {
        self.spell_candidates_inner(u, true, out);
    }

    /// `FFArena._spell_actions(actor, auto_target=False)`.
    pub fn human_spell_candidates(&mut self, u: usize, out: &mut Vec<Act>) {
        self.spell_candidates_inner(u, false, out);
    }

    fn spell_candidates_inner(&mut self, u: usize, auto_target: bool, out: &mut Vec<Act>) {
        if self.units[u].t.caster.is_none() {
            return;
        }
        let spells = self.effective_spells(u);
        for spell in spells {
            if !self.can_cast(u, spell) {
                continue;
            }
            for (at_level, free) in self.cast_payments(u, spell) {
                self.build_casts(u, spell, at_level, free, auto_target, out);
            }
        }
    }

    fn cast_payments(&self, u: usize, spell: SpellId) -> Vec<(i32, bool)> {
        let base = spell.level();
        if base == 0 { return vec![(0, false)]; }
        let unit = &self.units[u];
        let caster = unit.t.caster.as_ref();
        let fixed_lvl = caster
            .and_then(|c| c.spell_levels.iter().find(|&&(s, _)| s == spell).map(|&(_, l)| l))
            .unwrap_or(base);
        let is_at_will = caster.is_some_and(|c| c.at_will.contains(&spell));
        let mut payments = Vec::new();
        if is_at_will || unit.free_casts.contains(&spell) {
            payments.push((fixed_lvl, true));
        }
        if self.rule_version < 9 {
            if payments.is_empty() {
                if let Some(level) = self.next_slot(u, base) { payments.push((level, false)); }
            }
        } else if !self.spent_slot_this_turn(u) {
            for level in base as usize..unit.slots.len() {
                if unit.slots[level] > 0 { payments.push((level as i32, false)); }
            }
        }
        payments
    }

    fn build_casts(&mut self, u: usize, spell: SpellId, at_level: i32, free: bool, auto_target: bool, out: &mut Vec<Act>) {
        // the built targets: (targets, tuple target, point, damage type)
        let mut builds: Vec<(Vec<usize>, bool, Option<Pos>, Option<Dmg>)> = Vec::new();
        let (range, types, num, min) = self.spell_param(u, spell, at_level);
        if num > 0 {
            let pool = if self.rule_version >= 18 && matches!(spell, SpellId::StarryWisp | SpellId::PoisonSpray) {
                self.acquire_known_location_targets(u, range, types)
            } else {
                self.acquire_targets(u, range, types)
            };
            if num == 1 {
                for &t in &pool {
                    builds.push((vec![t], false, None, None));
                }
            } else {
                let mut combos: Vec<Vec<usize>> = Vec::new();
                for n in min..=num {
                    combinations(&pool, n as usize, &mut combos);
                }
                for c in combos {
                    builds.push((c, true, None, None));
                }
            }
        } else if auto_target {
            builds = self.sorcerer_builds(u, spell, at_level);
        } else {
            builds = self.human_sorcerer_builds(u, spell, at_level);
        }
        for (mut targets, multi, point, dt) in builds {
            if targets.iter().any(|&t| self.units[t].dead()) {
                continue;
            }
            let harmful = spell.harmful();
            let own = targets.iter().any(|&t| t == u || self.allies(u, t));
            if harmful && own {
                continue;
            }
            if harmful && targets.iter().any(|&t| self.is_charmed_by(u, t)) {
                continue;
            }
            if !harmful && targets.iter().any(|&t| self.opposing(u, t)) {
                continue;
            }
            // `MageArmorSpell.validate`: not on a creature wearing armor
            if spell == SpellId::MageArmor && targets.iter().any(|&t| self.units[t].t.wearing_armor) {
                continue;
            }
            if spell == SpellId::SpareTheDying {
                let t = targets[0];
                let unit = &self.units[t];
                if unit.has(St::Stable) || unit.dead() || !unit.unconscious() || unit.hp > 0 {
                    continue;
                }
            }
            if multi {
                targets.sort_by(|&a, &b| self.units[a].id.cmp(&self.units[b].id));
            }
            let cast = Cast { spell, at_level, free, targets, multi, point, mm: None, dt };
            self.metamagic_variants(u, &cast, out);
            out.push(Act::Spell(Box::new(cast)));
        }
    }

    /// Class-feature actions (`collect_class_feature_actions`).
    pub fn feature_candidates(&self, u: usize, out: &mut Vec<Act>) {
        self.sorcerer_feature_candidates(u, out);
        let unit = &self.units[u];
        if unit.t.channel_divinity {
            if unit.cd > 0 && unit.action > 0 {
                if unit.t.turn_undead {
                    out.push(Act::TurnUndead);
                }
                // Divine Spark
                let spark_targets = if unit.t.divine_spark { 0..self.units.len() } else { 0..0 };
                for t in spark_targets {
                    if t == u || self.units[t].dead() || self.feet(u, t) > 30 || !self.can_see(u, t) {
                        continue;
                    }
                    if self.opposing(u, t) {
                        if !self.units[t].conscious() {
                            continue;
                        }
                        let dt = self.best_spark_type(t);
                        out.push(Act::DivineSpark { target: t, heal: false, dt });
                    } else {
                        out.push(Act::DivineSpark { target: t, heal: true, dt: Dmg::Radiant });
                    }
                }
                let alloc = if unit.t.preserve_life { self.preserve_life_allocation(u) } else { Vec::new() };
                if !alloc.is_empty() {
                    out.push(Act::PreserveLife(alloc));
                }
            }
        }
        if let Some(force) = self.active_force(u) {
            if unit.bonus > 0 {
                if let ObjKind::Force { cast_turn, last_attack_turn, .. } = self.objs[force as usize].kind {
                    let key = (self.round, self.turn_idx);
                    if key != cast_turn && Some(key) != last_attack_turn {
                        let targets = self.force_targets_in_reach(force);
                        if self.rule_version >= 7 && targets.is_empty() {
                            for to in self.force_moves(force) { out.push(Act::SpiritualWeaponMove { to }); }
                        }
                        for t in targets {
                            out.push(Act::SpiritualWeaponAttack { target: t });
                        }
                    }
                }
            }
        }
    }

    /// `best_spark_type`.
    fn best_spark_type(&self, t: usize) -> Dmg {
        let r = self.damage_multiplier_est(t, Dmg::Radiant);
        let n = self.damage_multiplier_est(t, Dmg::Necrotic);
        if n > r {
            Dmg::Necrotic
        } else {
            Dmg::Radiant
        }
    }

    /// `preserve_life.allocate`.
    pub fn preserve_life_allocation(&self, u: usize) -> Vec<(usize, i32)> {
        let mut pool = 5 * self.units[u].t.caster.as_ref().map_or(0, |c| c.level);
        let mut cands: Vec<usize> = vec![u];
        for c in 0..self.units.len() {
            if c != u && self.feet(u, c) <= 30 {
                cands.push(c);
            }
        }
        let mut wounded: Vec<(usize, i32)> = Vec::new();
        for c in cands {
            let unit = &self.units[c];
            if unit.dead() {
                continue;
            }
            if c != u && !self.allies(u, c) {
                continue;
            }
            if unit.cursed {
                continue;
            }
            let mhp = self.max_hp_of(c);
            if !(unit.hp <= mhp / 2) {
                continue;
            }
            let room = mhp / 2 - unit.hp.max(0);
            if room > 0 {
                wounded.push((c, room));
            }
        }
        wounded.sort_by(|a, b| {
            let ka = (if self.units[a.0].unconscious() { 0 } else { 1 }, self.units[a.0].hp as f64 / self.max_hp_of(a.0).max(1) as f64);
            let kb = (if self.units[b.0].unconscious() { 0 } else { 1 }, self.units[b.0].hp as f64 / self.max_hp_of(b.0).max(1) as f64);
            ka.0.cmp(&kb.0)
                .then(ka.1.partial_cmp(&kb.1).unwrap())
                .then(self.units[a.0].id.cmp(&self.units[b.0].id))
        });
        if self.rule_version >= 6 {
            let mut amounts = vec![0; wounded.len()];
            for _ in 0..pool {
                let next = wounded.iter().enumerate().filter(|(i, (_, room))| amounts[*i] < *room)
                    .min_by_key(|(i, _)| amounts[*i]).map(|(i, _)| i);
                let Some(i) = next else { break };
                amounts[i] += 1;
            }
            return wounded.into_iter().zip(amounts).filter(|(_, n)| *n > 0).map(|((c, _), n)| (c, n)).collect();
        }
        let mut out = Vec::new();
        for (c, room) in wounded {
            if pool <= 0 {
                break;
            }
            let amount = room.min(pool);
            out.push((c, amount));
            pool -= amount;
        }
        out
    }

    /// `active_force(entity)`.
    pub fn active_force(&self, u: usize) -> Option<u32> {
        let held = self.units[u].concentration?;
        let obj = &self.objs[held as usize];
        match obj.kind {
            ObjKind::Force { expires_at, .. } if !obj.ended && expires_at > self.gt() => Some(held),
            _ => None,
        }
    }

    fn force_moves(&self, force: u32) -> Vec<Pos> {
        let ObjKind::Force { pos, .. } = self.objs[force as usize].kind else { return Vec::new() };
        let distances = self.grid.bfs(pos);
        (0..self.grid.cells()).filter(|&i| (1..=4).contains(&distances[i])).map(|i| self.grid.pos_of(i)).collect()
    }

    /// `SpiritualForce.targets_in_reach`.
    fn force_targets_in_reach(&self, force: u32) -> Vec<usize> {
        let obj = &self.objs[force as usize];
        let ObjKind::Force { pos, .. } = obj.kind else { return Vec::new() };
        let src = obj.source;
        (0..self.units.len())
            .filter(|&c| !self.units[c].dead() && self.opposing(src, c) && self.square_distance(pos, self.units[c].pos) <= 5
                && (self.rule_version < 6 || !self.units[c].hidden() || self.can_see(src, c))
                && (self.rule_version < 7 || self.force_strike_position(c, pos).is_some()))
            .collect()
    }

    // ------------------------------------------------------------------
    // AI values
    // ------------------------------------------------------------------

    /// `Spell.ai_value(battle)` of a candidate.
    pub fn spell_ai_value(&self, u: usize, c: &Cast) -> f64 {
        use SpellId::*;
        let base = match c.spell {
            SorcerousBurst | Firebolt | RayOfFrost | AcidSplash | ChromaticOrb | MagicMissile | BurningHands
            | Thunderwave | Shatter | ScorchingRay | DragonsBreath | Blur => self.sorcerer_ai_value(u, c),
            _ => self.base_spell_ai_value(u, c),
        };
        // a Metamagic variant adds its expected gain minus its cost
        if c.mm.is_some() {
            base + self.metamagic_delta(c, base)
        } else {
            base
        }
    }

    fn base_spell_ai_value(&self, u: usize, c: &Cast) -> f64 {
        use SpellId::*;
        let t0 = c.targets.first().copied();
        match c.spell {
            SacredFlame => {
                let Some(t) = t0 else { return POINTLESS };
                if !self.opposing(u, t) {
                    return POINTLESS;
                }
                let mult = self.damage_multiplier(t, Dmg::Radiant);
                if mult <= 0.0 {
                    return POINTLESS;
                }
                let p_fail = self.save_fail_probability(t, Ability::Dex, self.spell_dc_for(u, c.spell));
                let mut v = p_fail * 4.5 * mult;
                if !self.units[t].conscious() {
                    v *= DOWNED_FOE_WEIGHT;
                }
                v
            }
            GuidingBolt => {
                let Some(t) = t0 else { return POINTLESS };
                let dice = (4 + (c.at_level - 1).max(0)) as f64 * 3.5;
                let rider = if self.units[t].conscious() { 1.0 } else { 0.0 };
                self.attack_value(u, t, self.units[u].pos, Dmg::Radiant, dice, 0.0, rider, self.kind_for_spell(u, c.spell, WeaponKind::spell_ranged(120)))
            }
            SpiritualWeapon => {
                if self.active_force(u).is_some() {
                    return POINTLESS;
                }
                let Some(t) = t0 else { return POINTLESS };
                let now = self.force_attack_value(u, t, None, c.at_level);
                if now <= 0.0 {
                    return POINTLESS;
                }
                let v = 2.0 * now - self.concentration_cost(u, None);
                if v > 0.0 {
                    v
                } else {
                    POINTLESS
                }
            }
            Bless => {
                let mut gained = 0.0;
                for &t in &c.targets {
                    let unit = &self.units[t];
                    if unit.dead() || !unit.conscious() || !(t == u || self.allies(u, t)) {
                        continue;
                    }
                    if self.has_effect(t, EffKey::Bless) {
                        continue;
                    }
                    gained += 1.5 + if self.foes_near(t, 5).is_empty() { 0.0 } else { 0.5 };
                }
                let opponents = (0..self.units.len()).any(|o| !self.units[o].dead() && self.opposing(o, u));
                if gained <= 0.0 || !opponents {
                    return POINTLESS;
                }
                let v = gained - self.concentration_cost(u, None);
                if v > 0.0 {
                    v
                } else {
                    POINTLESS
                }
            }
            ShieldOfFaith => {
                let Some(t) = t0 else { return POINTLESS };
                if self.units[t].dead() || !(t == u || self.allies(u, t)) || self.has_spell_effect(t, EffKey::AcBonus, ShieldOfFaith) {
                    return POINTLESS;
                }
                let near = self.foes_near(t, 5);
                let far: Vec<usize> = self.foes_near(t, 30).into_iter().filter(|f| !near.contains(f)).collect();
                let mut a = 0.0;
                for &f in &near {
                    a += self.expected_dpr(f, Some(t));
                }
                let mut b = 0.0;
                for &f in &far {
                    b += self.expected_dpr(f, Some(t));
                }
                let mut v = 0.35 * a + 0.15 * b;
                v -= self.concentration_cost(u, Some(ShieldOfFaith));
                if v > 0.0 {
                    v
                } else {
                    POINTLESS
                }
            }
            CureWounds | HealingWord => {
                let (count, sides) = if c.spell == CureWounds { (2 * c.at_level, 8) } else { (2 * c.at_level, 4) };
                let mut expected = count as f64 * (sides + 1) as f64 / 2.0 + self.spell_mod(u) as f64;
                if !c.free && (self.rule_version < 4 || self.units[u].t.disciple_of_life) {
                    expected += (2 + c.at_level) as f64;
                }
                self.heal_value(u, t0, expected, c.spell.bonus_action())
            }
            Aid => {
                let bonus = 5 * (1 + (c.at_level - 2).max(0));
                let mut total = 0.0;
                for &t in &c.targets {
                    let unit = &self.units[t];
                    let current = self.aid_effect(t);
                    if unit.dead() || !unit.t.pc || !(t == u || self.allies(u, t)) || current.map_or(false, |b| b >= bonus) {
                        continue;
                    }
                    let mut gained = 2.5 * bonus as f64 / 5.0;
                    if !unit.conscious() {
                        gained += self.heal_value_est(t, bonus as f64).max(0.0);
                    }
                    total += gained;
                }
                if total > 0.0 {
                    total
                } else {
                    POINTLESS
                }
            }
            Command => {
                let dc = self.spell_dc_for(u, c.spell);
                let mut total = 0.0;
                if c.targets.is_empty() {
                    return POINTLESS;
                }
                for &t in &c.targets {
                    let unit = &self.units[t];
                    if !self.opposing(u, t) || unit.dead() || self.commanded(t) || !unit.conscious() || unit.incapacitated() {
                        total += POINTLESS;
                        continue;
                    }
                    let p_fail = self.save_fail_probability(t, Ability::Wis, dc);
                    let mut value = self.expected_dpr(t, Some(u));
                    if !unit.t.immune_prone && !unit.prone() {
                        value += 0.75 * self.foes_near(t, 5).len() as f64;
                    }
                    total += p_fail * value;
                }
                total
            }
            ProtectionFromEvilAndGood => {
                let Some(t) = t0 else { return POINTLESS };
                if self.units[t].dead()
                    || !(t == u || self.allies(u, t))
                    || self.has_spell_effect(t, EffKey::AttackedAdvantageModifier, ProtectionFromEvilAndGood)
                {
                    return POINTLESS;
                }
                let near: Vec<usize> = self.foes_near(t, 5).into_iter().filter(|&f| self.units[f].t.pfeg_protected).collect();
                let far: Vec<usize> =
                    self.foes_near(t, 30).into_iter().filter(|&f| !near.contains(&f) && self.units[f].t.pfeg_protected).collect();
                if near.is_empty() && far.is_empty() {
                    return POINTLESS;
                }
                let mut a = 0.0;
                for &f in &near {
                    a += self.expected_dpr(f, Some(t));
                }
                let mut b = 0.0;
                for &f in &far {
                    b += self.expected_dpr(f, Some(t));
                }
                let mut v = 1.0 * a + 0.4 * b;
                v -= self.concentration_cost(u, Some(ProtectionFromEvilAndGood));
                if v > 0.0 {
                    v
                } else {
                    POINTLESS
                }
            }
            Sanctuary => {
                let Some(t) = t0 else { return POINTLESS };
                let unit = &self.units[t];
                if t == u || unit.dead() || !self.allies(u, t) || self.has_effect(t, EffKey::TargetingWard) {
                    return POINTLESS;
                }
                let mhp = self.max_hp_of(t);
                let hurt = !unit.conscious() || (unit.hp as f64) <= 0.25 * mhp.max(1) as f64;
                let attackers = self.foes_near(t, 5);
                if !hurt || attackers.is_empty() {
                    return POINTLESS;
                }
                let dc = self.spell_dc_for(u, c.spell);
                let mut s = 0.0;
                for &f in &attackers {
                    s += self.save_fail_probability(f, Ability::Wis, dc) * self.expected_dpr(f, Some(t));
                }
                let v = 0.5 * s;
                if v > 0.0 {
                    v
                } else {
                    POINTLESS
                }
            }
            SpareTheDying => {
                let Some(t) = t0 else { return POINTLESS };
                if !is_dying(self, t) || !(t == u || self.allies(u, t)) {
                    return POINTLESS;
                }
                3.0
            }
            MageArmor => {
                // `MageArmorSpell.ai_value`: the damage the higher AC
                // prevents over 3 rounds (Blur's foe model)
                let Some(t) = t0 else { return POINTLESS };
                let unit = &self.units[t];
                if !unit.conscious() || self.opposing(u, t) {
                    return POINTLESS;
                }
                if unit.t.wearing_armor || self.has_spell_effect(t, EffKey::AcOverride, MageArmor) || !unit.t.pc {
                    return POINTLESS;
                }
                let base = unit.t.ac;
                let gain = mage_armor_ac(unit.t) - base;
                if gain <= 0 {
                    return POINTLESS;
                }
                let ac_now = self.armor_class(t);
                let prevented = MAGE_ARMOR_HORIZON_ROUNDS * self.ac_gain_prevented_per_round(t, ac_now, ac_now + gain);
                if prevented > 0.0 {
                    prevented
                } else {
                    POINTLESS
                }
            }
            LesserRestoration => {
                let Some(t) = t0 else { return POINTLESS };
                let unit = &self.units[t];
                if unit.dead() || !(t == u || self.allies(u, t)) {
                    return POINTLESS;
                }
                let weight = if unit.has(St::Paralyzed) {
                    1.0
                } else if unit.poisoned() {
                    0.1
                } else {
                    return POINTLESS;
                };
                let stake = self.expected_dpr(t, None) + if self.foes_near(t, 5).is_empty() { 0.0 } else { 2.0 };
                weight * stake
            }
            Invisibility => {
                let target = t0.unwrap_or(u);
                if self.units[target].invisible() || self.units[u].concentration.is_some() {
                    return POINTLESS;
                }
                let enemies = self.opponents_of(u).into_iter().any(|e| self.units[e].conscious());
                if !enemies {
                    return POINTLESS;
                }
                let hp_frac = self.units[u].hp as f64 / self.max_hp_of(u).max(1) as f64;
                if hp_frac <= 0.5 { 5.5 } else { 3.5 }
            }
            RayOfSickness => {
                let Some(t) = t0 else { return POINTLESS };
                if !self.opposing(u, t) {
                    return POINTLESS;
                }
                let modifier = self.units[u].t.caster.as_ref().map_or(0, |k| k.spell_attack);
                let ac = self.attack_ac(self.units[u].pos, t);
                let wk = self.kind_for_spell(u, c.spell, WeaponKind::spell_ranged(60));
                let (adv, dis) = self.advantage_flags(u, t, wk);
                let mode = Fight::mode_of(adv, dis);
                // `AttackSpell.compute_hit_probability` calls `DieRolls.prob(ac)`,
                // which subtracts Bless's expected `1d4` (2.5) and applies `ceil`:
                // `ceil(ac - 2.5) == ac - 2`.
                let eff_ac = if self.rule_version >= 18 && self.has_effect(u, EffKey::Bless) {
                    ac - 2
                } else {
                    ac
                };
                let p_hit = crate::dice::prob_at_least(20, modifier, eff_ac, mode);
                let n = 2 + (c.at_level - 1).max(0);
                p_hit * (n as f64 * 4.5)
            }
            CharmMonster => {
                let Some(t) = t0 else { return POINTLESS };
                if self.units[t].dead() || self.units[t].t.immune_charmed || self.is_charmed_by(t, u) {
                    return POINTLESS;
                }
                let dc = self.spell_dc_for(u, c.spell);
                let p_fail = self.save_fail_chance_adv(t, Ability::Wis, dc, true);
                7.0 * p_fail
            }
            Entangle => {
                let Some((ox, oy)) = c.point else { return POINTLESS };
                let dc = self.spell_dc_for(u, c.spell);
                let mut seen: Vec<usize> = Vec::new();
                let mut score = 0.0;
                let mut foes = 0;
                for dx in 0..4 {
                    for dy in 0..4 {
                        let p = (ox + dx, oy + dy);
                        if !self.grid.in_bounds(p.0, p.1) {
                            continue;
                        }
                        for idx in 0..self.units.len() {
                            if idx == u || self.units[idx].dead() || self.units[idx].pos != p || seen.contains(&idx) {
                                continue;
                            }
                            seen.push(idx);
                            if self.units[idx].t.immune_restrained || self.is_restrained(idx) {
                                continue;
                            }
                            let p_fail = self.save_fail_chance_est(idx, Ability::Str, dc);
                            if self.opposing(u, idx) {
                                foes += 1;
                                score += 8.0 * p_fail;
                            } else {
                                score -= 10.0 * p_fail;
                            }
                        }
                    }
                }
                if foes > 0 { score } else { POINTLESS }
            }
            FaerieFire => {
                let Some(origin) = c.point else { return POINTLESS };
                let dc = self.spell_dc_for(u, c.spell);
                let squares = self.faerie_fire_squares(origin);
                let allies_ready = (0..self.units.len())
                    .filter(|&a| a != u && self.allies(u, a) && self.units[a].conscious())
                    .count() as f64;
                let mut score = 0.0;
                let mut foes_hit = 0;
                let mut invis_hit = 0;
                for idx in self.creatures_in_squares(&squares, None) {
                    if self.has_effect(idx, EffKey::FaerieFire) {
                        continue;
                    }
                    // Never cheat on hidden foes: only count visible or heard (non-hidden) creatures.
                    if self.opposing(u, idx) && !self.can_see(u, idx) && self.units[idx].hidden() {
                        continue;
                    }
                    let p_fail = self.save_fail_probability(idx, Ability::Dex, dc);
                    if self.opposing(u, idx) {
                        if !self.units[idx].conscious() {
                            continue;
                        }
                        foes_hit += 1;
                        if self.units[idx].invisible() && !self.can_see(u, idx) {
                            invis_hit += 1;
                            score += 15.0 * p_fail;
                        } else {
                            let adv_val = 2.6 + 1.1 * allies_ready.min(3.0);
                            score += adv_val * p_fail;
                        }
                    } else {
                        score -= 12.0 * p_fail;
                    }
                }
                if foes_hit == 0 {
                    return POINTLESS;
                }
                let conc = if invis_hit > 0 {
                    // Only count concentration loss against another Faerie Fire; revealing unseen foes beats Bless.
                    self.concentration_cost(u, Some(Bless)) * 0.4
                } else {
                    self.concentration_cost(u, None)
                };
                let net = score - conc;
                if net > 0.0 { net } else { POINTLESS }
            }
            SeeInvisibility => {
                if self.has_effect(u, EffKey::SeeInvisibility) {
                    return POINTLESS;
                }
                // Strictly zero wasted casts when no conscious non-hidden enemy is currently invisible & unseen.
                let unseen_invis_foes = (0..self.units.len())
                    .filter(|&e| {
                        self.opposing(u, e)
                            && self.units[e].conscious()
                            && self.units[e].invisible()
                            && !self.units[e].hidden()
                            && !self.can_see(u, e)
                    })
                    .count();
                if unseen_invis_foes == 0 {
                    return POINTLESS;
                }
                13.5 + 2.5 * (unseen_invis_foes - 1).min(2) as f64
            }
            ViciousMockery => {
                let Some(t) = t0 else { return POINTLESS };
                if !self.opposing(u, t) || self.units[t].dead() {
                    return POINTLESS;
                }
                let mult = self.damage_multiplier(t, Dmg::Psychic);
                let dis_val = if self.units[t].conscious() && !self.has_effect(t, EffKey::ViciousMockery) {
                    0.35 * self.expected_dpr(t, None)
                } else {
                    0.0
                };
                if mult <= 0.0 && dis_val <= 0.0 {
                    return POINTLESS;
                }
                let p_fail = self.save_fail_probability(t, Ability::Wis, self.spell_dc_for(u, c.spell));
                let mut v = p_fail * (3.5 * mult + dis_val);
                if !self.units[t].conscious() {
                    v *= DOWNED_FOE_WEIGHT;
                }
                v
            }
            StarryWisp => {
                let Some(t) = t0 else { return POINTLESS };
                let can_vanish = self.units[t].t.vanish.is_some()
                    || self.units[t].t.caster.as_ref().is_some_and(|k| k.spells.contains(&SpellId::Invisibility));
                let rider = if self.units[t].conscious()
                    && can_vanish
                    && !self.has_effect(t, EffKey::StarryWisp)
                    && !self.has_effect(t, EffKey::FaerieFire)
                {
                    3.2
                } else {
                    0.25
                };
                self.attack_value(
                    u,
                    t,
                    self.units[u].pos,
                    Dmg::Radiant,
                    4.5,
                    0.0,
                    rider,
                    self.kind_for_spell(u, c.spell, WeaponKind::spell_ranged(60)),
                )
            }
            PoisonSpray => {
                let Some(t) = t0 else { return POINTLESS };
                self.attack_value(
                    u,
                    t,
                    self.units[u].pos,
                    Dmg::Poison,
                    6.5,
                    0.0,
                    0.0,
                    self.kind_for_spell(u, c.spell, WeaponKind::spell_ranged(30)),
                )
            }
            _ => 0.0,
        }
    }

    /// `divine_spell_ai.heal_value`.
    fn heal_value(&self, u: usize, target: Option<usize>, expected: f64, bonus: bool) -> f64 {
        let Some(t) = target else { return POINTLESS };
        let unit = &self.units[t];
        if unit.dead() || !(t == u || self.allies(u, t)) {
            return POINTLESS;
        }
        if unit.cursed {
            return POINTLESS;
        }
        let mhp = self.max_hp_of(t);
        let missing = (mhp - unit.hp).max(0);
        if missing <= 0 && unit.conscious() {
            return POINTLESS;
        }
        let pick = if missing > 0 { (missing as f64).min(expected) } else { expected };
        let restored = pick.max(1.0);
        let mut urgency = 1.0;
        if !unit.conscious() {
            urgency += 3.5;
        } else {
            let ratio = unit.hp as f64 / mhp.max(1) as f64;
            if ratio <= 0.25 {
                urgency += 2.0;
            } else if ratio <= 0.5 {
                urgency += 1.0;
            }
        }
        if unit.conscious() && !self.foes_near(t, 5).is_empty() {
            urgency += 0.5;
        }
        if bonus {
            urgency += 0.5;
        }
        (restored / 3.0) * urgency
    }

    pub(crate) fn has_spell_effect(&self, t: usize, key: EffKey, spell: SpellId) -> bool {
        self.active_effects(t, key).iter().any(|&o| {
            let obj = &self.objs[o as usize];
            matches!(obj.kind, ObjKind::Spell) && obj.spell == spell
        })
    }

    /// `aid_effect(creature)`: the bonus of the active Aid, if any.
    pub(crate) fn aid_effect(&self, t: usize) -> Option<i32> {
        for o in self.active_effects(t, EffKey::HitPointMaxOverride) {
            if let ObjKind::Aid { bonus, .. } = self.objs[o as usize].kind {
                if !self.objs[o as usize].ended {
                    return Some(bonus);
                }
            }
        }
        None
    }

    /// `command_spell.commanded(creature)`.
    pub(crate) fn commanded(&self, t: usize) -> bool {
        self.units[t]
            .effects
            .iter()
            .find(|(k, _)| *k == EffKey::Commanded)
            .map_or(false, |(_, list)| list.iter().any(|e| !self.objs[e.obj as usize].ended))
    }

    /// Feature actions' `ai_value`.
    pub fn feature_ai_value(&mut self, u: usize, act: &Act) -> f64 {
        match act {
            Act::CreateSpellSlot { .. } | Act::ConvertSpellSlot { .. } => POINTLESS,
            Act::InnateSorcery | Act::DragonsBreathExhale => self.sorcerer_feature_value(u, act),
            Act::TurnUndead => {
                let dc = self.spell_dc(u);
                let mut value = 0.0;
                for t in self.turn_undead_targets(u) {
                    if !self.units[t].conscious() || self.is_turned(t) || !self.opposing(u, t) {
                        continue;
                    }
                    value += self.save_fail_chance_est(t, Ability::Wis, dc) * 2.0 * self.expected_round_damage(t, 15);
                }
                if value > 0.0 {
                    value - 1.0
                } else {
                    -1.0
                }
            }
            Act::DivineSpark { target, heal, dt } => {
                let amount = 4.5 + self.spell_mod(u) as f64;
                if *heal {
                    let s = self.heal_value_est(*target, amount);
                    return if s > 0.0 { s - 1.0 } else { -1.0 };
                }
                let fail = self.save_fail_chance_est(*target, Ability::Con, self.spell_dc(u));
                let mult = self.damage_multiplier_est(*target, *dt);
                let expected = (fail * amount + (1.0 - fail) * (amount / 2.0).floor()) * mult;
                expected - 2.0
            }
            Act::PreserveLife(alloc) => {
                let mut v = 0.0;
                for &(c, a) in alloc {
                    v += self.heal_value_est(c, a as f64);
                }
                if v > 0.0 {
                    v - 1.0
                } else {
                    -1.0
                }
            }
            Act::SpiritualWeaponMove { to } => {
                let Some(force) = self.active_force(u) else { return POINTLESS };
                let ObjKind::Force { pos, .. } = self.objs[force as usize].kind else { return POINTLESS };
                let enemies: Vec<_> = (0..self.units.len()).filter(|&t| self.opposing(u, t) && self.units[t].conscious() && self.can_see(u, t)).collect();
                let nearest = |p| enemies.iter().map(|&t| self.square_distance(p, self.units[t].pos)).min().unwrap_or(0);
                let gain = nearest(pos) - nearest(*to);
                if gain > 0 { gain as f64 / 10.0 } else { POINTLESS }
            }
            Act::SpiritualWeaponAttack { target } => {
                let Some(force) = self.active_force(u) else { return POINTLESS };
                let v = self.force_attack_value(u, *target, Some(force), 0);
                if v > 0.0 {
                    v
                } else {
                    POINTLESS
                }
            }
            _ => 0.0,
        }
    }

    // ------------------------------------------------------------------
    // Turn Undead and Frightened
    // ------------------------------------------------------------------

    /// `TurnUndeadAction._targets`: undead within 30 ft (map order), not dead.
    pub(crate) fn turn_undead_targets(&self, u: usize) -> Vec<usize> {
        (0..self.units.len())
            .filter(|&t| t != u && !self.units[t].dead() && self.units[t].t.undead && self.feet(u, t) <= 30)
            .collect()
    }

    /// `turn_undead._lapse_reason`: the entry has lapsed (1 minute of game
    /// time) or its cleric is dead or Incapacitated.
    fn turn_lapsed(&self, src: usize, until: i32) -> bool {
        self.gt() >= until || self.units[src].dead() || self.units[src].incapacitated()
    }

    /// `turn_undead.active_turners(entity)`: the clerics whose turn on `t` is
    /// live. A read (N20-046): [`Fight::expire_turned`] ends lapsed entries.
    pub fn active_turners(&self, t: usize) -> Vec<usize> {
        self.units[t].turned_by.iter().filter(|&&(src, until, _)| !self.turn_lapsed(src, until)).map(|e| e.0).collect()
    }

    /// `turn_undead.is_turned(entity)` (a read).
    pub fn is_turned(&self, t: usize) -> bool {
        self.units[t].turned_by.iter().any(|&(src, until, _)| !self.turn_lapsed(src, until))
    }

    /// `turn_undead.expire_turned`: end the lapsed and cleric-down turn
    /// entries on `t` (table order).
    pub fn expire_turned(&mut self, t: usize) {
        let table = self.units[t].turned_by.clone();
        for (src, until, _) in table {
            if self.turn_lapsed(src, until) {
                let reason = if self.gt() >= until { "expired" } else { "cleric_down" };
                self.end_turned_reason(t, Some(src), reason);
            }
        }
    }

    /// `timed_conditions.expire_timed_conditions(battle)`: every combatant's
    /// lapsed turn entries, then its lapsed fear entries. natural20's battle
    /// calls it when a turn starts (before and after its processing) and ends
    /// and after every committed action (opportunity attacks included).
    pub fn expire_timed_conditions(&mut self) {
        for t in 0..self.units.len() {
            if !self.units[t].turned_by.is_empty() {
                self.expire_turned(t);
            }
            if !self.units[t].frightened_by.is_empty() {
                self.expire_fear(t);
            }
            if self.units[t].lured_by.is_some() {
                self.expire_lured(t);
            }
            self.lose_dodge_if_ineligible(t);
            // a rage ends on the Incapacitated condition, whatever applied it
            if self.units[t].raging {
                self.end_rage_if_incapacitated(t);
            }
        }
    }

    /// `turn_undead.can_flee` (a read).
    pub fn can_flee(&self, t: usize) -> bool {
        if !self.is_turned(t) {
            return false;
        }
        let unit = &self.units[t];
        !(unit.has(St::Unconscious) || unit.has(St::Dead) || unit.has(St::Paralyzed))
    }

    /// `turn_undead.end_turned`.
    pub fn end_turned(&mut self, t: usize, src: Option<usize>) {
        self.end_turned_reason(t, src, "damaged");
    }

    pub fn end_turned_reason(&mut self, t: usize, src: Option<usize>, reason: &'static str) {
        if self.units[t].turned_by.is_empty() {
            return;
        }
        let added = self.units[t].turned_by.iter().any(|e| e.2);
        let uids: Vec<usize> = match src {
            Some(s) => vec![s],
            None => self.units[t].turned_by.iter().map(|e| e.0).collect(),
        };
        let mut any_removed = false;
        for s in uids {
            if let Some(i) = self.units[t].turned_by.iter().position(|e| e.0 == s) {
                self.units[t].turned_by.remove(i);
                self.end_fear(t, s);
                any_removed = true;
            }
        }
        if self.units[t].turned_by.is_empty() && added {
            self.units[t].statuses.retain(|s| *s != St::Incapacitated);
        }
        if any_removed && !(self.rule_version >= 6 && self.units[t].dead()) {
            self.emit_web(crate::web_events::WebEv::TurnEnded { u: t, reason });
        }
    }

    /// `turn_undead.apply_turn`.
    fn apply_turn(&mut self, t: usize, src: usize) {
        if self.units[t].dead() {
            return;
        }
        let gt = self.gt();
        let added;
        if !self.units[t].has(St::Incapacitated) {
            self.units[t].statuses.push(St::Incapacitated);
            added = true;
        } else {
            added = self.units[t].turned_by.iter().any(|e| e.2);
        }
        let entry = (src, gt + 60, added);
        match self.units[t].turned_by.iter_mut().find(|e| e.0 == src) {
            Some(e) => *e = entry,
            None => self.units[t].turned_by.push(entry),
        }
        // apply_fear(ends_on_damage=True); the shadow is immune to Frightened
        if !self.units[t].t.immune_frightened {
            self.apply_timed_fear(t, src, 60, true);
        }
    }

    pub fn apply_timed_fear(&mut self, t: usize, src: usize, duration: i32, ends_on_damage: bool) {
        if self.units[t].dead() || self.units[t].t.immune_frightened {
            return;
        }
        let until = self.gt() + duration;
        match self.units[t].frightened_by.iter_mut().find(|e| e.0 == src) {
            Some(e) => *e = (src, until, ends_on_damage),
            None => self.units[t].frightened_by.push((src, until, ends_on_damage)),
        }
        self.sync_fear(t);
    }

    fn sync_fear(&mut self, t: usize) {
        let unit = &mut self.units[t];
        if unit.frightened_by.is_empty() && unit.source_fear.is_empty() {
            unit.statuses.retain(|s| *s != St::Frightened);
        } else if !unit.has(St::Frightened) {
            unit.statuses.push(St::Frightened);
        }
    }

    fn end_fear(&mut self, t: usize, src: usize) {
        if let Some(i) = self.units[t].frightened_by.iter().position(|e| e.0 == src) {
            self.units[t].frightened_by.remove(i);
            self.sync_fear(t);
        }
    }

    /// `fear.apply_fear(target, source, until_source_turn_end=True)` (a
    /// mummy's Dreadful Glare): not on the dead, the immune or a creature
    /// warded by Protection from Evil and Good against the source's type
    /// (N20-043); the entry replaces an earlier one of the same source and
    /// skips the source's current turn.
    pub fn apply_source_fear(&mut self, t: usize, src: usize) {
        if self.units[t].dead() || self.units[t].t.immune_frightened {
            return;
        }
        if self.pfeg_wards(t, src) {
            self.notes.pfeg_ward += 1;
            return;
        }
        let own_turn = self.started && !self.order.is_empty() && self.current() == src;
        match self.units[t].source_fear.iter_mut().find(|e| e.0 == src) {
            Some(e) => e.1 = own_turn,
            None => self.units[t].source_fear.push((src, own_turn)),
        }
        self.sync_fear(t);
    }

    /// `protection_from_evil_and_good.wards_condition(target, source, 'frightened')`:
    /// an active 2024 Protection from Evil and Good on `t` against a protected
    /// creature type (`pfeg_protected`, as the attack Disadvantage reads it).
    pub fn pfeg_wards(&self, t: usize, src: usize) -> bool {
        self.units[src].t.pfeg_protected
            && self
                .active_effects(t, EffKey::AttackedAdvantageModifier)
                .iter()
                .any(|&o| self.objs[o as usize].spell == SpellId::ProtectionFromEvilAndGood)
    }

    /// `SourceTurnExpiry.end_of_turn` on `src`: each fear it caused skips the
    /// turn it was applied in, then ends.
    pub fn source_fear_end_of_turn(&mut self, src: usize) {
        for t in 0..self.units.len() {
            if !self.units[t].source_fear.iter().any(|e| e.0 == src) {
                continue;
            }
            let mut ended = false;
            self.units[t].source_fear.retain_mut(|e| {
                if e.0 != src {
                    true
                } else if e.1 {
                    e.1 = false;
                    true
                } else {
                    ended = true;
                    false
                }
            });
            if ended {
                self.sync_fear(t);
            }
        }
    }

    /// `SourceTurnExpiry.died`: the fear `src` caused ends when it dies.
    pub fn end_source_fear_of(&mut self, src: usize) {
        for t in 0..self.units.len() {
            if self.units[t].source_fear.iter().any(|e| e.0 == src) {
                self.units[t].source_fear.retain(|e| e.0 != src);
                self.sync_fear(t);
            }
        }
    }

    /// `fear.step_toward_fear`: a step from `from` to `to` that lowers the grid
    /// (Chebyshev) distance to an active source of the creature's fear.
    pub fn step_toward_fear(&self, u: usize, from: Pos, to: Pos) -> bool {
        let gt = self.gt();
        let cheb = |a: Pos, b: Pos| (a.0 - b.0).abs().max((a.1 - b.1).abs());
        let unit = &self.units[u];
        let timed = unit.frightened_by.iter().filter(|&&(_, until, _)| gt < until).map(|&(f, _, _)| f);
        let turn = unit.source_fear.iter().map(|&(f, _)| f);
        for f in timed.chain(turn) {
            if self.units[f].dead() {
                continue;
            }
            let p = self.units[f].pos;
            if cheb(to, p) < cheb(from, p) {
                return true;
            }
        }
        false
    }

    /// `fear.fear_rider_value(source, target)`: 0.5 x the target's expected
    /// round damage against the source's AC, 0 when Frightened can't matter.
    pub fn fear_rider_value(&self, src: usize, t: usize) -> f64 {
        let unit = &self.units[t];
        if unit.dead() || !unit.conscious() || unit.incapacitated() || unit.t.immune_frightened || self.pfeg_wards(t, src) {
            return 0.0;
        }
        if !self.opposing(src, t) {
            return 0.0;
        }
        0.5 * self.expected_round_damage(t, self.armor_class(src))
    }

    /// `fear._lapsed`: a timed fear entry past its time or of a dead source.
    fn fear_lapsed(&self, src: usize, until: i32) -> bool {
        self.gt() >= until || self.units[src].dead()
    }

    /// `fear.active_fear_sources` (timed entries): a read (N20-046);
    /// [`Fight::expire_fear`] ends lapsed entries.
    pub fn active_fear_sources(&self, t: usize) -> Vec<usize> {
        self.units[t].frightened_by.iter().filter(|&&(s, until, _)| !self.fear_lapsed(s, until)).map(|e| e.0).collect()
    }

    /// `fear.expire_fear`: drop the lapsed timed entries; the status follows
    /// the table when one ended.
    pub fn expire_fear(&mut self, t: usize) {
        let before = self.units[t].frightened_by.len();
        let keep: Vec<(usize, i32, bool)> =
            self.units[t].frightened_by.iter().copied().filter(|&(s, until, _)| !self.fear_lapsed(s, until)).collect();
        if keep.len() != before {
            self.units[t].frightened_by = keep;
            self.sync_fear(t);
        }
    }

    /// Damage ends fear (`ends_on_damage`) and the turn effect.
    pub fn on_damaged_turn_fear(&mut self, t: usize) {
        if !self.units[t].frightened_by.is_empty() {
            let ends: Vec<usize> = self.units[t]
                .frightened_by
                .iter()
                .filter(|&&(s, until, eod)| eod && !self.fear_lapsed(s, until))
                .map(|e| e.0)
                .collect();
            for s in ends {
                self.end_fear(t, s);
            }
        }
        if !self.units[t].turned_by.is_empty() {
            self.end_turned(t, None);
        }
    }

    /// Choose a legal retreat that increases distance from the nearest turning cleric.
    pub fn flee_step(&mut self, t: usize) -> Option<Vec<Pos>> {
        if self.units[t].turned_by.is_empty() || !self.can_flee(t) {
            return None;
        }
        let sources = self.active_turners(t);
        if sources.is_empty() {
            return None;
        }
        if self.units[t].available_movement() <= 0 {
            return None;
        }
        let spos: Vec<Pos> = sources.iter().map(|&s| self.units[s].pos).collect();
        let dist = |p: Pos| -> i32 { spos.iter().map(|s| (p.0 - s.0).abs().max((p.1 - s.1).abs())).min().unwrap() };
        let here = self.units[t].pos;
        let mut best: Option<Vec<Pos>> = None;
        let mut best_d = dist(here);
        if self.rule_version >= 6 {
            let avoid_walls = self.rule_version >= 11 && self.incorporeal(t);
            let starts_in_wall = avoid_walls && self.grid.is_wall(here.0, here.1);
            let mut best_rank = (!starts_in_wall, best_d);
            for path in crate::batch::movement_paths(self, t, 0, false, None) {
                let end = *path.last().unwrap();
                let floor = !avoid_walls || !self.grid.is_wall(end.0, end.1);
                let d = dist(end);
                if d < best_d || (d == best_d && !(starts_in_wall && floor)) { continue; }
                let rank = (floor, d);
                if rank > best_rank { best_rank = rank; best = Some(path); }
            }
            return best;
        }
        let budget = self.units[t].available_movement().div_euclid(5);
        for dx in -1..=1 {
            for dy in -1..=1 {
                if dx == 0 && dy == 0 {
                    continue;
                }
                let n = (here.0 + dx, here.1 + dy);
                if !self.passable(t, n) || !self.placeable(t, n) {
                    continue;
                }
                let (moves, _) = self.compute_actual_moves(t, &[here, n], budget);
                if moves.len() < 2 {
                    continue;
                }
                let d = dist(*moves.last().unwrap());
                if d > best_d {
                    best_d = d;
                    best = Some(moves);
                }
            }
        }
        best
    }

    // ------------------------------------------------------------------
    // Execution (resolve + commit)
    // ------------------------------------------------------------------

    /// `Spell.consume`: action economy, slot or free cast, materials, and the
    /// turn's spell record.
    fn consume_spell(&mut self, u: usize, c: &Cast) {
        let is_ma_spell = !c.spell.bonus_action() && self.multiattack_spell(u, c.spell);
        if c.spell.bonus_action() {
            let unit = &mut self.units[u];
            unit.bonus = (unit.bonus - 1).max(0);
        } else if is_ma_spell {
            if !self.units[u].ma_started {
                self.units[u].action = (self.units[u].action - 1).max(0);
                self.units[u].ma_started = true;
            }
            self.narrow_multiattack(u, Some(c.spell.key()));
            if self.units[u].ma_groups.iter().all(|(_, v)| v.is_empty()) {
                self.clear_multiattack(u);
            }
        } else {
            let unit = &mut self.units[u];
            unit.action = (unit.action - 1).max(0);
        }
        let unit = &mut self.units[u];
        let is_at_will = unit.t.caster.as_ref().is_some_and(|k| k.at_will.contains(&c.spell));
        let level = if c.spell.level() > 0 { c.at_level } else { 0 };
        if c.free {
            if self.rule_version < 4 {
                unit.last_slot_turn = Some((self.round, self.turn_idx));
            }
            if !is_at_will {
                if let Some(i) = unit.free_casts.iter().position(|&s| s == c.spell) {
                    unit.free_casts.remove(i);
                }
            }
        } else if level > 0 {
            let l = if unit.slots[level as usize] >= 1 { Some(level) } else { (level.max(1)..=2).find(|&x| unit.slots[x as usize] > 0) };
            if let Some(l) = l {
                unit.slots[l as usize] -= 1;
                unit.last_slot_turn = Some((self.round, self.turn_idx));
            }
        }
        if c.spell.consumed_holy_water() {
            unit.holy_water = (unit.holy_water - 1).max(0);
        }
    }

    /// `SpellAction.resolve` + `Battle.commit` for one casting.
    pub(crate) fn pending_rays(&self, caster: usize) -> Option<ScorchingRays> {
        self.scorching_rays.filter(|rays| rays.caster == caster)
    }

    pub(crate) fn ray_choices(&self, caster: usize, rays: ScorchingRays) -> Vec<Act> {
        self.acquire_targets(caster, 120, TargetTypes::Enemies).into_iter().map(|target| {
            Act::Spell(Box::new(Cast {
                spell: SpellId::ScorchingRay, at_level: rays.level, free: rays.free,
                targets: vec![target], multi: false, point: None, mm: rays.metamagic, dt: None,
            }))
        }).collect()
    }

    fn resolve_ray(&mut self, u: usize, c: &Cast, mut rays: ScorchingRays) {
        let mut items = Vec::new();
        let mut rolls = Vec::new();
        self.resolve_sorcerer(u, c, &mut items, &mut rolls);
        if rays.rerolls_left > 0 {
            let damage: Vec<_> = items.iter().filter_map(|item| match item {
                Item::RDamage(d) => Some(d.clone()),
                _ => None,
            }).collect();
            let used = self.empower(u, &damage, &mut rolls, rays.rerolls_left);
            rays.rerolls_left -= used;
            if used > 0 && !rays.paid_empowered {
                self.units[u].sorcery_points -= Mm::Empowered.cost();
                rays.paid_empowered = true;
            }
        }
        self.commit_spell_items(u, c, items, &mut rolls, None);
        self.expire_timed_conditions();
        rays.next += 1;
        self.scorching_rays = if rays.next <= ScorchingRays::count(rays.level)
            && !self.units[u].incapacitated()
            && !self.acquire_targets(u, 120, TargetTypes::Enemies).is_empty() {
            Some(rays)
        } else { None };
    }

    pub fn do_spell(&mut self, u: usize, c: &Cast) {
        use SpellId::*;
        if c.spell == ScorchingRay {
            if let Some(rays) = self.pending_rays(u) {
                self.resolve_ray(u, c, rays);
                return;
            }
        }
        let prior = self.units[u].concentration;
        if self.rule_version >= 8 && c.spell.concentration() {
            if let Some(obj) = prior {
                let spell = self.objs[obj as usize].spell;
                self.dismiss_effect(u, obj);
                self.emit_web(crate::web_events::WebEv::ConcentrationReplaced { caster: u, prior: spell });
            }
        }
        // `run_counterspell_window`: every other creature's prepared spells
        // are listed (creating lazily registered pools), whoever it is
        for o in 0..self.units.len() {
            if o != u && self.units[o].t.caster.is_some() {
                self.units[o].pools_init = true;
            }
        }
        // resolve: the spell's draws, collected as result items
        let mut items: Vec<Item> = Vec::new();
        let mut rolls: Vec<RollObj> = Vec::new();
        let mut rerolled = 0;
        let t0 = c.targets.first().copied();
        if c.mm == Some(Mm::Heightened) {
            self.heightened = Some((u, false));
        }
        match c.spell {
            SacredFlame => {
                let t = t0.unwrap();
                let dc = self.spell_dc_for(u, c.spell);
                let total = self.save_with_dc(t, Ability::Dex, dc, false, 0, true, false, false).0;
                if total < dc || self.units[u].t.potent_cantrip {
                    let faces = self.roll_dice(u, "spells.sacred_flame", 1, 8);
                    let amount: i32 = faces.iter().sum();
                    let dmg_fmt = self.web_events.is_some().then(|| crate::web_events::fmt_dice_roll(8, &faces, 0, false, amount));
                    items.push(Item::Damage {
                        t,
                        amount,
                        halved: total >= dc,
                        dt: Dmg::Radiant,
                        crit: false,
                        save: Some(SaveOutcome::from_check(total >= dc, true)),
                        atk_roll_fmt: None,
                        dmg_roll_fmt: dmg_fmt,
                    });
                } else {
                    items.push(Item::SpellMiss { t, save: Some(SaveOutcome::Made), atk_roll_fmt: None });
                }
            }
            GuidingBolt => {
                let t = t0.unwrap();
                let (hit, nat20, dismiss, t, atk_fmt) = self.evaluate_spell_attack(u, t, GuidingBolt, WeaponKind::spell_ranged(120));
                for d in dismiss {
                    items.push(Item::Dismiss(d.0, d.1));
                }
                if hit {
                    let n = 4 + (c.at_level - 1).max(0);
                    let n = if nat20 { n * 2 } else { n };
                    let faces = self.roll_dice(u, "spells.guiding_bolt", n, 6);
                    let amount: i32 = faces.iter().sum();
                    let dmg_fmt = self.web_events.is_some().then(|| crate::web_events::fmt_dice_roll(6, &faces, 0, false, amount));
                    items.push(Item::Damage {
                        t,
                        amount,
                        halved: false,
                        dt: Dmg::Radiant,
                        crit: nat20,
                        save: None,
                        atk_roll_fmt: atk_fmt,
                        dmg_roll_fmt: dmg_fmt,
                    });
                    items.push(Item::GuidingBolt { t });
                } else {
                    items.push(Item::SpellMiss { t, save: None, atk_roll_fmt: atk_fmt });
                }
            }
            SpiritualWeapon => {
                let t = t0.unwrap();
                let origin = self.units[u].pos;
                let pos = self.landing_square(t, origin, Some(12)).unwrap_or(self.units[t].pos);
                let modifier = self.spell_mod(u);
                items.push(Item::Force { t, pos, level: c.at_level, modifier });
                let (hit, nat20, dismiss, t, atk_fmt) = self.evaluate_spell_attack_from(u, t, SpiritualWeapon, WeaponKind::melee(), pos);
                for d in dismiss {
                    items.push(Item::Dismiss(d.0, d.1));
                }
                if hit {
                    let n = 1 + (c.at_level - 2).max(0);
                    let n = if nat20 { n * 2 } else { n };
                    let faces = self.roll_dice(u, "spells.spiritual_weapon", n, 8);
                    let amount: i32 = faces.iter().sum::<i32>() + modifier;
                    let dmg_fmt = self.web_events.is_some().then(|| crate::web_events::fmt_dice_roll(8, &faces, modifier, false, amount));
                    items.push(Item::Damage {
                        t,
                        amount,
                        halved: false,
                        dt: Dmg::Force,
                        crit: nat20,
                        save: None,
                        atk_roll_fmt: atk_fmt,
                        dmg_roll_fmt: dmg_fmt,
                    });
                } else {
                    items.push(Item::SpellMiss { t, save: None, atk_roll_fmt: atk_fmt });
                }
            }
            Bless => {
                for &t in &c.targets {
                    items.push(Item::Bless(t));
                }
            }
            ShieldOfFaith => items.push(Item::ShieldOfFaith(t0.unwrap())),
            CureWounds | HealingWord => {
                let t = t0.unwrap();
                let sides = if c.spell == CureWounds { 8 } else { 4 };
                let rolls = self.roll_dice(u, "spells.cure_wounds", 2 * c.at_level, sides);
                let amount: i32 = rolls.iter().sum::<i32>() + self.spell_mod(u);
                // Disciple of Life (not on a free cast, nor on undead)
                let bonus = if !self.units[u].t.disciple_of_life || c.free || self.units[t].t.undead { 0 } else { 2 + c.at_level };
                let roll = self.web_events.as_ref().filter(|_| self.rule_version >= 6).map(|_|
                    crate::web_events::fmt_dice_roll(sides, &rolls, self.spell_mod(u), false, amount));
                items.push(Item::Heal { t, amount, bonus, roll });
            }
            Aid => {
                let bonus = 5 * (1 + (c.at_level - 2).max(0));
                let mut uniq: Vec<usize> = Vec::new();
                for &t in &c.targets {
                    if !uniq.contains(&t) {
                        uniq.push(t);
                    }
                }
                for t in uniq {
                    let current = self.aid_effect(t);
                    if self.units[t].dead() || !self.units[t].t.pc || current.map_or(false, |b| b >= bonus) {
                        // `aid_spell.py:124-126`: emits a `spell_miss` (`attack_name: 'aid'`) when unaffected
                        items.push(Item::SpellMiss { t, save: None, atk_roll_fmt: None });
                        continue;
                    }
                    items.push(Item::Aid { t, bonus });
                }
            }
            Command => {
                let dc = self.spell_dc_for(u, c.spell);
                for &t in &c.targets {
                    if self.units[t].dead() {
                        continue;
                    }
                    let total = self.save_with_dc(t, Ability::Wis, dc, false, 0, true, false, false).0;
                    if total >= dc {
                        items.push(Item::SpellMiss { t, save: Some(SaveOutcome::Made), atk_roll_fmt: None });
                        continue;
                    }
                    let grovel = !self.units[t].t.immune_prone;
                    items.push(Item::Command { t, grovel });
                }
            }
            ProtectionFromEvilAndGood => items.push(Item::Pfeg(t0.unwrap_or(u))),
            Sanctuary => items.push(Item::Sanctuary(t0.unwrap_or(u))),
            SpareTheDying => items.push(Item::Stabilize(t0.unwrap())),
            LesserRestoration => items.push(Item::Restore(t0.unwrap_or(u))),
            MageArmor => items.push(Item::MageArmor(t0.unwrap())),
            Invisibility => items.push(Item::Invisibility(t0.unwrap_or(u))),
            RayOfSickness => {
                let t = t0.unwrap();
                let (hit, nat20, dismiss, t, atk_fmt) =
                    self.evaluate_spell_attack(u, t, RayOfSickness, WeaponKind::spell_ranged(60));
                for d in dismiss {
                    items.push(Item::Dismiss(d.0, d.1));
                }
                if hit {
                    let n = 2 + (c.at_level - 1).max(0);
                    let n = if nat20 { n * 2 } else { n };
                    let faces = self.roll_dice(u, "spells.ray_of_sickness", n, 8);
                    let amount: i32 = faces.iter().sum();
                    let dmg_fmt = self.web_events.is_some().then(|| {
                        crate::web_events::fmt_dice_roll(8, &faces, 0, false, amount)
                    });
                    items.push(Item::Damage {
                        t,
                        amount,
                        halved: false,
                        dt: Dmg::Poison,
                        crit: nat20,
                        save: None,
                        atk_roll_fmt: atk_fmt,
                        dmg_roll_fmt: dmg_fmt,
                    });
                    if !self.units[t].t.immune_poisoned {
                        items.push(Item::RayOfSickness { t });
                    }
                } else {
                    items.push(Item::SpellMiss { t, save: None, atk_roll_fmt: atk_fmt });
                }
            }
            CharmMonster => {
                let t = t0.unwrap();
                let dc = self.spell_dc_for(u, c.spell);
                if self.units[t].t.immune_charmed {
                    items.push(Item::CharmMonster { t, charmed: false });
                } else {
                    let in_combat = self.opposing(u, t);
                    let total = self.save_with_dc(t, Ability::Wis, dc, false, 0, true, true, in_combat).0;
                    items.push(Item::CharmMonster { t, charmed: total < dc });
                }
            }
            Entangle => {
                let (ox, oy) = c.point.unwrap();
                let mut squares = Vec::with_capacity(16);
                for dx in 0..4 {
                    for dy in 0..4 {
                        let p = (ox + dx, oy + dy);
                        if self.grid.in_bounds(p.0, p.1) {
                            squares.push(p);
                        }
                    }
                }
                let dc = self.spell_dc_for(u, c.spell);
                let mut seen: Vec<usize> = Vec::new();
                let mut failed: Vec<usize> = Vec::new();
                for &sq in &squares {
                    for idx in 0..self.units.len() {
                        if idx == u || self.units[idx].dead() || self.units[idx].pos != sq || seen.contains(&idx) {
                            continue;
                        }
                        seen.push(idx);
                        if self.units[idx].t.immune_restrained {
                            continue;
                        }
                        let (passed, _) = self.save_check_ex(None, idx, Ability::Str, dc, false, true, false);
                        if !passed {
                            failed.push(idx);
                        }
                    }
                }
                items.push(Item::Entangle { squares, dc, failed });
            }
            FaerieFire => {
                let origin = c.point.unwrap();
                let squares = self.faerie_fire_squares(origin);
                let dc = self.spell_dc_for(u, c.spell);
                let creatures = self.creatures_in_squares(&squares, None);
                let mut targets = Vec::with_capacity(creatures.len());
                for t in creatures {
                    let (total, fmt) = self.save_with_dc(t, Ability::Dex, dc, false, 0, true, false, false);
                    targets.push((t, total < dc, fmt));
                }
                items.push(Item::FaerieFire { targets, dc });
            }
            SeeInvisibility => {
                items.push(Item::SeeInvisibility);
            }
            ViciousMockery => {
                let t = t0.unwrap();
                let dc = self.spell_dc_for(u, c.spell);
                let (total, _) = self.save_with_dc(t, Ability::Wis, dc, false, 0, true, false, false);
                if total < dc || self.units[u].t.potent_cantrip {
                    let faces = self.roll_dice(u, "spells.vicious_mockery", 1, 6);
                    let amount: i32 = faces.iter().sum();
                    let dmg_fmt = self.web_events.is_some().then(|| crate::web_events::fmt_dice_roll(6, &faces, 0, false, amount));
                    items.push(Item::Damage {
                        t,
                        amount,
                        halved: total >= dc,
                        dt: Dmg::Psychic,
                        crit: false,
                        save: Some(SaveOutcome::from_check(total >= dc, true)),
                        atk_roll_fmt: None,
                        dmg_roll_fmt: dmg_fmt,
                    });
                    if total < dc {
                        items.push(Item::ViciousMockery { t });
                    }
                } else {
                    items.push(Item::SpellMiss { t, save: Some(SaveOutcome::Made), atk_roll_fmt: None });
                }
            }
            StarryWisp => {
                let t = t0.unwrap();
                let (hit, nat20, dismiss, t, atk_fmt) =
                    self.evaluate_spell_attack(u, t, StarryWisp, WeaponKind::spell_ranged(60));
                for d in dismiss {
                    items.push(Item::Dismiss(d.0, d.1));
                }
                if hit || self.units[u].t.potent_cantrip {
                    let n = if nat20 { 2 } else { 1 };
                    let faces = self.roll_dice(u, "spells.starry_wisp", n, 8);
                    let amount: i32 = faces.iter().sum();
                    let dmg_fmt = self.web_events.is_some().then(|| {
                        crate::web_events::fmt_dice_roll(8, &faces, 0, !hit, if hit { amount } else { amount / 2 })
                    });
                    items.push(Item::Damage {
                        t,
                        amount,
                        halved: !hit,
                        dt: Dmg::Radiant,
                        crit: nat20,
                        save: None,
                        atk_roll_fmt: atk_fmt,
                        dmg_roll_fmt: dmg_fmt,
                    });
                    if hit {
                        items.push(Item::StarryWisp { t });
                    }
                } else {
                    items.push(Item::SpellMiss { t, save: None, atk_roll_fmt: atk_fmt });
                }
            }
            PoisonSpray => {
                let t = t0.unwrap();
                let (hit, nat20, dismiss, t, atk_fmt) =
                    self.evaluate_spell_attack(u, t, PoisonSpray, WeaponKind::spell_ranged(30));
                for d in dismiss {
                    items.push(Item::Dismiss(d.0, d.1));
                }
                if hit || self.units[u].t.potent_cantrip {
                    let n = if nat20 { 2 } else { 1 };
                    let faces = self.roll_dice(u, "spells.poison_spray", n, 12);
                    let amount: i32 = faces.iter().sum();
                    let dmg_fmt = self.web_events.is_some().then(|| {
                        crate::web_events::fmt_dice_roll(12, &faces, 0, !hit, if hit { amount } else { amount / 2 })
                    });
                    items.push(Item::Damage {
                        t,
                        amount,
                        halved: !hit,
                        dt: Dmg::Poison,
                        crit: nat20,
                        save: None,
                        atk_roll_fmt: atk_fmt,
                        dmg_roll_fmt: dmg_fmt,
                    });
                } else {
                    items.push(Item::SpellMiss { t, save: None, atk_roll_fmt: atk_fmt });
                }
            }
            ScorchingRay if self.rule_version >= 14 => {}
            ChromaticOrb if self.rule_version >= 13 => {}
            _ => rerolled = self.resolve_sorcerer(u, c, &mut items, &mut rolls),
        }
        // `metamagic.finish`: disarm Heightened, spend Sorcery Points, Empowered rerolls
        self.heightened = None;
        if let Some(mm) = c.mm {
            if mm == Mm::Empowered && (self.rule_version < 6 || c.spell != ChromaticOrb) {
                let dmgs: Vec<DmgRef> = items.iter().filter_map(|i| if let Item::RDamage(d) = i { Some(d.clone()) } else { None }).collect();
                rerolled = self.empower(u, &dmgs, &mut rolls, ability_mod(self.units[u].t.abil[Ability::Cha.idx()]).max(1) as usize);
            }
            if (self.rule_version < 7 || mm != Mm::Empowered || rerolled > 0) && self.units[u].sorcery_points >= mm.cost() {
                self.units[u].sorcery_points -= mm.cost();
            }
        }
        // concentration_replaced, consume, the caster's `spell_cast` trigger
        let replaced = prior.is_some() && c.spell.concentration();
        self.consume_spell(u, c);
        self.resolve_trigger(u, HookEv::SpellCast);
        // commit
        if self.rule_version < 8 && replaced {
            let p = prior.unwrap();
            if self.units[u].concentration == Some(p) {
                self.dismiss_effect(u, p);
            }
        }
        let spell_obj = if matches!(c.spell, Bless | ShieldOfFaith | GuidingBolt | ProtectionFromEvilAndGood | MageArmor) {
            Some(self.new_obj(c.spell, ObjKind::Spell, u, c.targets.clone(), false))
        } else {
            None
        };
        if self.rule_version >= 14 && c.spell == ScorchingRay {
            let rerolls_left = if c.mm == Some(Mm::Empowered) {
                ability_mod(self.units[u].t.abil[Ability::Cha.idx()]).max(1) as usize
            } else { 0 };
            let rays = ScorchingRays { caster: u, level: c.at_level, next: 1,
                free: c.free, metamagic: c.mm, rerolls_left, paid_empowered: false };
            self.resolve_ray(u, c, rays);
            return;
        }
        if self.rule_version >= 13 && c.spell == ChromaticOrb {
            let rerolls = self.resolve_sorcerer(u, c, &mut items, &mut rolls);
            if c.mm == Some(Mm::Empowered) && rerolls > 0 && self.units[u].sorcery_points >= Mm::Empowered.cost() {
                self.units[u].sorcery_points -= Mm::Empowered.cost();
            }
        }
        self.commit_spell_items(u, c, items, &mut rolls, spell_obj);
    }

    pub(crate) fn commit_spell_items(&mut self, u: usize, c: &Cast, items: Vec<Item>, rolls: &mut [RollObj], spell_obj: Option<u32>) {
        use SpellId::*;
        let spell_atk_name = crate::web_events::spell_attack_name(c.spell);
        let spell_style_name = c.spell.key();
        let mut roll_targets: Vec<Vec<(usize, bool)>> = vec![Vec::new(); rolls.len()];
        for item in &items {
            if let Item::RDamage(d) = item {
                let orig = Fight::canonical_roll(rolls, d.droll);
                roll_targets[orig].push((d.t, rolls[d.dmg].halved));
            }
        }
        let mut cw_checked = vec![false; rolls.len()];
        let mut hs = HitState::default();
        for item in items {
            match item {
                Item::Damage { t, amount, halved, dt, crit, save, atk_roll_fmt, dmg_roll_fmt } => {
                    self.spell_damage_with_web(
                        u,
                        t,
                        amount,
                        halved,
                        true,
                        dt,
                        crit,
                        true,
                        save,
                        spell_atk_name,
                        spell_style_name,
                        atk_roll_fmt,
                        dmg_roll_fmt,
                        &mut hs,
                    );
                }
                Item::RDamage(d) => {
                    // Shared simultaneous-save damage rolls apply Cutting Words once before halving (SRD 5.2.1 p. 16 & p. 35).
                    let orig = Fight::canonical_roll(rolls, d.droll);
                    if !cw_checked[orig] {
                        cw_checked[orig] = true;
                        self.apply_roll_cutting_words(u, orig, &roll_targets[orig], rolls);
                    }
                    // each spell damage item is its own hit (`_hit_state`); read AFTER `empower()` and Cutting Words!
                    let r = &rolls[d.dmg];
                    let amount = r.amount();
                    let dmg_fmt = self.web_events.is_some().then(|| {
                        crate::web_events::fmt_dice_roll(r.sides, &r.rolls, r.modifier - r.penalty, r.halved, amount)
                    });
                    let mut h = HitState::default();
                    self.spell_damage_with_web(
                        u,
                        d.t,
                        amount,
                        false,
                        false,
                        d.dt,
                        d.crit,
                        !(self.rule_version >= 6 && r.halved && d.save.is_none() && d.atk_roll_fmt.is_some()),
                        d.save,
                        spell_atk_name,
                        spell_style_name,
                        d.atk_roll_fmt,
                        dmg_fmt,
                        &mut h,
                    );
                }
                Item::SpellMiss { t, save, atk_roll_fmt } => {
                    let sp = self.units[u].pos;
                    let tp = self.units[t].pos;
                    self.emit_web(crate::web_events::WebEv::AttackOutcome {
                        src: u,
                        tgt: Some(t),
                        src_pos: sp,
                        tgt_pos: tp,
                        attack_name: spell_atk_name,
                        spell_style: Some(spell_style_name),
                        ranged_weapon: false,
                        hit: false,
                        crit: false,
                        reaction: false,
                        save,
                        dt: None,
                        raw_damage: 0,
                        applied_damage: 0,
                        atk_roll_fmt,
                        dmg_roll_fmt: None,
                    });
                }
                ref other @ (Item::RayOfFrost { .. } | Item::Push { .. } | Item::PushFrom { .. } | Item::Breath { .. } | Item::Blur) => {
                    self.commit_sorcerer_item(u, other);
                }
                Item::Dismiss(holder, obj) => self.dismiss_effect(holder, obj),
                Item::GuidingBolt { t } => {
                    let obj = spell_obj.unwrap();
                    self.add_casted(u, t, obj, None);
                    self.register_hook(t, HookEv::AfterAttackRollTarget, HookKind::GuidingBoltAfterRoll, obj, None);
                    self.register_hook(u, HookEv::StartOfTurn, HookKind::GuidingBoltStart, obj, None);
                    self.register_effect(t, EffKey::TargetedAdvantageOverride, obj, None);
                    self.register_effect(t, EffKey::LightOverride, obj, None);
                }
                Item::Force { pos, level, modifier, .. } => {
                    let key = (self.round, self.turn_idx);
                    let force = self.new_obj(
                        SpiritualWeapon,
                        ObjKind::Force { level, pos, modifier, cast_turn: key, last_attack_turn: None, expires_at: self.gt() + 60 },
                        u,
                        Vec::new(),
                        true,
                    );
                    self.add_casted(u, u, force, Some(60));
                    self.concentration_on(u, force);
                }
                Item::Bless(t) => {
                    let obj = spell_obj.unwrap();
                    self.add_casted(u, t, obj, Some(60));
                    if self.units[u].concentration != Some(obj) {
                        self.concentration_on(u, obj);
                    }
                    self.register_effect(t, EffKey::Bless, obj, Some(60));
                }
                Item::ShieldOfFaith(t) => {
                    let obj = spell_obj.unwrap();
                    self.add_casted(u, t, obj, Some(600));
                    if self.units[u].concentration != Some(obj) {
                        self.concentration_on(u, obj);
                    }
                    self.register_effect(t, EffKey::AcBonus, obj, Some(600));
                }
                Item::OrbLeap { from, to } => self.emit_web(crate::web_events::WebEv::OrbLeap { from, to }),
                Item::Heal { t, amount, bonus, roll } => {
                    let total_amt = amount + bonus;
                    let emit = !self.units[t].dead() && !self.units[t].cursed && total_amt > 0;
                    let sp = self.units[u].pos;
                    let tp = self.units[t].pos;
                    let hp_before = self.units[t].hp;
                    self.heal(t, total_amt);
                    if emit && self.units[t].hp > 0 {
                        let healed = (self.units[t].hp - hp_before).max(0);
                        self.emit_web(crate::web_events::WebEv::SpellHeal {
                            caster: u,
                            target: t,
                            src_pos: sp,
                            tgt_pos: tp,
                            style_key: spell_style_name,
                            roll: roll.map(|r| if bonus > 0 { format!("{r}, plus {bonus} from Disciple of Life") } else { r }),
                            healed,
                        });
                    }
                }
                Item::Aid { t, bonus } => {
                    if let Some(cur) = self.aid_obj(t) {
                        if let ObjKind::Aid { bonus: b, .. } = self.objs[cur as usize].kind {
                            if b >= bonus {
                                continue;
                            }
                        }
                        self.remove_effect(t, cur);
                    }
                    let obj = self.new_obj(Aid, ObjKind::Aid { target: t, bonus }, u, Vec::new(), true);
                    self.register_effect(t, EffKey::HitPointMaxOverride, obj, Some(28800));
                    let was_down = self.units[t].hp <= 0 && !self.units[t].dead();
                    let mhp = self.max_hp_of(t);
                    self.units[t].hp = mhp.min(self.units[t].hp + bonus);
                    if was_down && self.units[t].hp > 0 {
                        let unit = &mut self.units[t];
                        unit.death_saves = 0;
                        unit.death_fails = 0;
                        unit.statuses.retain(|s| *s != St::Unconscious && *s != St::Stable);
                    }
                }
                Item::Command { t, grovel } => {
                    let olds: Vec<u32> = self.units[t]
                        .effects
                        .iter()
                        .find(|(k, _)| *k == EffKey::Commanded)
                        .map(|(_, l)| l.iter().map(|e| e.obj).collect())
                        .unwrap_or_default();
                    for o in olds {
                        self.command_finish(o, t);
                    }
                    let obj = self.new_obj(
                        Command,
                        ObjKind::Command { target: t, grovel, due: false, obeyed: false, added_incap: false },
                        u,
                        Vec::new(),
                        true,
                    );
                    self.register_effect(t, EffKey::Commanded, obj, None);
                    self.register_hook(t, HookEv::StartOfTurn, HookKind::CommandStart, obj, None);
                    self.register_hook(t, HookEv::EndOfTurn, HookKind::CommandEnd, obj, None);
                    self.units[t].until_next_turn.push(obj);
                }
                Item::Pfeg(t) => {
                    let obj = spell_obj.unwrap();
                    self.add_casted(u, t, obj, Some(600));
                    self.concentration_on(u, obj);
                    self.register_effect(t, EffKey::AttackedAdvantageModifier, obj, Some(600));
                }
                Item::Sanctuary(t) => {
                    let olds: Vec<u32> = self.units[t]
                        .effects
                        .iter()
                        .find(|(k, _)| *k == EffKey::TargetingWard)
                        .map(|(_, l)| l.iter().map(|e| e.obj).collect())
                        .unwrap_or_default();
                    for o in olds {
                        self.dismiss_effect(t, o);
                    }
                    let dc = self.spell_dc_for(u, c.spell);
                    let obj = self.new_obj(Sanctuary, ObjKind::Sanctuary { target: t, dc }, u, Vec::new(), true);
                    self.add_casted(u, t, obj, Some(60));
                    self.register_effect(t, EffKey::TargetingWard, obj, Some(60));
                    for ev in [HookEv::AttackResolved, HookEv::SpellCast, HookEv::DealtDamage] {
                        self.register_hook(t, ev, HookKind::SanctuaryEnd, obj, Some(60));
                    }
                }
                Item::Stabilize(t) => {
                    if is_dying(self, t) {
                        let unit = &mut self.units[t];
                        if !unit.has(St::Stable) {
                            unit.statuses.push(St::Stable);
                        }
                        unit.death_fails = 0;
                        unit.death_saves = 0;
                    }
                }
                Item::MageArmor(t) => {
                    // `MageArmorSpell.apply`: a new casting replaces the old
                    // one (removed by spell id), then the caster's casted
                    // effect and the target's `ac_override` (8 hours)
                    let obj = spell_obj.unwrap();
                    if self.has_spell_effect(t, EffKey::AcOverride, MageArmor) {
                        self.remove_effect(t, obj);
                    }
                    self.add_casted(u, t, obj, Some(MAGE_ARMOR_SECONDS));
                    self.register_effect(t, EffKey::AcOverride, obj, Some(MAGE_ARMOR_SECONDS));
                    self.notes.mage_armor += 1;
                }
                Item::Restore(t) => {
                    let unit = &self.units[t];
                    if unit.has(St::Paralyzed) {
                        self.units[t].statuses.retain(|s| *s != St::Paralyzed);
                    } else if unit.poisoned() {
                        self.units[t].stench_poison.clear();
                        self.units[t].statuses.retain(|s| *s != St::Poisoned);
                        let ros: Vec<u32> = self.active_effects(t, EffKey::RayOfSickness);
                        for o in ros {
                            self.dismiss_effect(t, o);
                        }
                    }
                }
                Item::Invisibility(t) => {
                    let obj = self.new_obj(Invisibility, ObjKind::Invisibility, u, vec![t], false);
                    self.add_casted(u, t, obj, Some(3600));
                    if self.units[u].concentration != Some(obj) {
                        self.concentration_on(u, obj);
                    }
                    self.register_effect(t, EffKey::Invisible, obj, Some(3600));
                    self.register_hook(t, HookEv::AttackResolved, HookKind::InvisibilityBreak, obj, Some(3600));
                    self.register_hook(t, HookEv::SpellCast, HookKind::InvisibilityBreak, obj, Some(3600));
                    if !self.units[t].has(St::Invisible) {
                        self.units[t].statuses.push(St::Invisible);
                    }
                }
                Item::RayOfSickness { t } => {
                    if !self.units[t].dead() && !self.units[t].t.immune_poisoned {
                        let added = !self.units[t].has(St::Poisoned);
                        if added {
                            self.units[t].statuses.push(St::Poisoned);
                        }
                        let obj = self.new_obj(
                            RayOfSickness,
                            ObjKind::RaySickness { target: t, armed: false, added_status: added },
                            u,
                            vec![t],
                            true,
                        );
                        self.add_casted(u, t, obj, Some(12));
                        self.register_effect(t, EffKey::RayOfSickness, obj, Some(12));
                        self.register_hook(u, HookEv::StartOfTurn, HookKind::RaySicknessStart, obj, Some(12));
                        self.register_hook(u, HookEv::EndOfTurn, HookKind::RaySicknessEnd, obj, Some(12));
                    }
                }
                Item::CharmMonster { t, charmed } => {
                    for other in 0..self.units.len() {
                        if other != t
                            && self.units[other]
                                .charmed_by
                                .iter()
                                .any(|c| c.source == u && c.source_spell == Some("charm_monster"))
                        {
                            self.end_charm(other, u);
                        }
                    }
                    if charmed && !self.units[t].dead() {
                        self.apply_charm(t, u, None, None, true, true, Some("charm_monster"));
                    }
                }
                Item::Entangle { squares, dc, failed } => {
                    let duration = 60;
                    let zone_obj = self.new_obj(
                        Entangle,
                        ObjKind::Entangle { squares, dc, restraints: Vec::new(), expires_at: self.gt() + duration },
                        u,
                        Vec::new(),
                        true,
                    );
                    self.add_casted(u, u, zone_obj, Some(duration));
                    self.concentration_on(u, zone_obj);
                    for t in failed {
                        if !self.units[t].dead() && !self.units[t].t.immune_restrained {
                            let r_obj = self.new_obj(
                                Entangle,
                                ObjKind::EntangleRestraint { target: t, dc, zone: zone_obj },
                                u,
                                vec![t],
                                true,
                            );
                            if let ObjKind::Entangle { restraints, .. } = &mut self.objs[zone_obj as usize].kind {
                                restraints.push(r_obj);
                            }
                            self.register_effect(t, EffKey::RestrainedOverride, r_obj, Some(duration));
                            self.register_effect(t, EffKey::EscapableRestraint, r_obj, Some(duration));
                        }
                    }
                }
                Item::FaerieFire { targets, dc } => {
                    let duration = 60;
                    let outlined_ids: Vec<usize> = targets.iter().filter(|(_, o, _)| *o).map(|(t, _, _)| *t).collect();
                    let obj = self.new_obj(FaerieFire, ObjKind::FaerieFire, u, outlined_ids, true);
                    self.add_casted(u, u, obj, Some(duration));
                    self.concentration_on(u, obj);
                    let sp = self.units[u].pos;
                    for (t, outlined, roll_fmt) in targets {
                        let tp = self.units[t].pos;
                        if outlined && !self.units[t].dead() {
                            self.add_casted(u, t, obj, Some(duration));
                            self.register_effect(t, EffKey::FaerieFire, obj, Some(duration));
                        }
                        self.emit_web(crate::web_events::WebEv::FaerieFireTarget {
                            caster: u,
                            target: t,
                            src_pos: sp,
                            tgt_pos: tp,
                            dc,
                            roll_fmt,
                            outlined,
                        });
                    }
                    self.reveal_exposed_hiders();
                }
                Item::SeeInvisibility => {
                    for old in self.active_effects(u, EffKey::SeeInvisibility) {
                        self.dismiss_effect(u, old);
                    }
                    let duration = 3600;
                    let obj = self.new_obj(SeeInvisibility, ObjKind::SeeInvisibility, u, vec![u], true);
                    self.add_casted(u, u, obj, Some(duration));
                    self.register_effect(u, EffKey::SeeInvisibility, obj, Some(duration));
                    let pos = self.units[u].pos;
                    self.emit_web(crate::web_events::WebEv::SeeInvisibilityCast { caster: u, pos });
                }
                Item::ViciousMockery { t } => {
                    if !self.units[t].dead() {
                        for old in self.active_effects(t, EffKey::ViciousMockery) {
                            self.dismiss_effect(t, old);
                        }
                        let obj = self.new_obj(ViciousMockery, ObjKind::ViciousMockery { target: t }, u, vec![t], true);
                        self.add_casted(u, t, obj, Some(12));
                        self.register_effect(t, EffKey::ViciousMockery, obj, Some(12));
                        self.register_hook(t, HookEv::EndOfTurn, HookKind::ViciousMockeryEnd, obj, Some(12));
                    }
                }
                Item::StarryWisp { t } => {
                    if !self.units[t].dead() {
                        for old in self.active_effects(t, EffKey::StarryWisp) {
                            self.dismiss_effect(t, old);
                        }
                        let obj = self.new_obj(StarryWisp, ObjKind::StarryWisp { target: t, armed: false }, u, vec![t], true);
                        self.add_casted(u, t, obj, Some(12));
                        self.register_effect(t, EffKey::StarryWisp, obj, Some(12));
                        self.register_hook(u, HookEv::StartOfTurn, HookKind::StarryWispStart, obj, Some(12));
                        self.register_hook(u, HookEv::EndOfTurn, HookKind::StarryWispEnd, obj, Some(12));
                        self.reveal_exposed_hiders();
                    }
                }
            }
        }
    }

    fn aid_obj(&self, t: usize) -> Option<u32> {
        self.active_effects(t, EffKey::HitPointMaxOverride).into_iter().find(|&o| {
            matches!(self.objs[o as usize].kind, ObjKind::Aid { .. }) && !self.objs[o as usize].ended
        })
    }

    /// `landing_square(map, creature, origin, max_squares)`.
    fn landing_square(&self, t: usize, origin: Pos, max_squares: Option<i32>) -> Option<Pos> {
        let (sx, sy) = self.units[t].pos;
        let distances = max_squares.filter(|_| self.rule_version >= 7).map(|_| self.grid.bfs(origin));
        let mut best: Option<((i32, i32, i32, i32), Pos)> = None;
        for dx in -1..=1 {
            for dy in -1..=1 {
                let (x, y) = (sx + dx, sy + dy);
                if (dx == 0 && dy == 0) || x < 0 || y < 0 || x >= self.grid.w || y >= self.grid.h {
                    continue;
                }
                if self.rule_version >= 7 && (!self.clear_effect((x, y), (sx, sy)) || self.grid.is_wall(x, y)) { continue; }
                let gap = self.square_distance(origin, (x, y));
                if let Some(dist) = &distances {
                    if !(0..=max_squares.unwrap()).contains(&dist[self.grid.index(x, y)]) { continue; }
                }
                if let Some(m) = max_squares {
                    if gap > m {
                        continue;
                    }
                }
                let busy = if self.token_at((x, y)).is_some() { 1 } else { 0 };
                let key = (busy, gap, y, x);
                if best.map_or(true, |b| key < b.0) {
                    best = Some((key, (x, y)));
                }
            }
        }
        best.map(|b| b.1)
    }

    /// `damage_event(item)` for an attack or spell damage item: the source's
    /// `dealt_damage` trigger, then `take_damage`.
    pub fn damage_event(&mut self, src: usize, t: usize, amount: i32, dt: Dmg, crit: bool, hs: &mut HitState) -> Option<i32> {
        if amount != 0 && src != t {
            self.resolve_trigger(src, HookEv::DealtDamage);
        }
        self.take_damage(t, amount, dt, crit, Some(hs), Some(src))
    }

    pub(crate) fn spell_damage_with_web(
        &mut self,
        src: usize,
        t: usize,
        raw_amount: i32,
        halved: bool,
        check_cw: bool,
        dt: Dmg,
        crit: bool,
        hit: bool,
        save: Option<SaveOutcome>,
        attack_name: &'static str,
        spell_style: &'static str,
        atk_roll_fmt: Option<String>,
        dmg_roll_fmt: Option<String>,
        hs: &mut HitState,
    ) -> Option<i32> {
        let mut raw = raw_amount;
        if check_cw && self.rule_version >= 18 && raw > 0 && self.opposing(src, t) {
            if let Some((_bard, _cw_roll, new_raw)) = self.try_cutting_words_damage_roll(src, raw, &[(t, halved)]) {
                raw = new_raw;
            }
        }
        let amount = if halved { raw.div_euclid(2) } else { raw };
        let sp = self.units[src].pos;
        let tp = self.units[t].pos;
        let ev_idx = self.web_events.as_ref().map(|b| b.len());
        if self.rule_version >= 6 && spell_style == "scorching_ray" && self.units[t].dead() {
            self.emit_web(crate::web_events::WebEv::RayAtCorpse { src, target: t });
        } else {
            self.emit_web(crate::web_events::WebEv::AttackOutcome {
                src,
                tgt: Some(t),
                src_pos: sp,
                tgt_pos: tp,
                attack_name,
                spell_style: Some(spell_style),
                ranged_weapon: false,
                hit,
                crit,
                reaction: false,
                save,
                dt: Some(dt),
                raw_damage: amount,
                applied_damage: 0,
                atk_roll_fmt,
                dmg_roll_fmt,
            });
        }
        let app = self.damage_event(src, t, amount, dt, crit, hs);
        if crit {
            self.offer_champion_movement(src);
        }
        if let (Some(idx), Some(buf)) = (ev_idx, &mut self.web_events) {
            if let crate::web_events::WebEv::AttackOutcome { applied_damage, .. } = &mut buf[idx] {
                *applied_damage = app.unwrap_or(0).max(0);
            }
        }
        app
    }

    /// Feature actions (resolve + commit).
    pub fn do_feature(&mut self, u: usize, act: &Act) {
        match act {
            Act::CreateSpellSlot { .. } | Act::ConvertSpellSlot { .. } | Act::InnateSorcery | Act::DragonsBreathExhale => self.do_sorcerer_feature(u, act),
            Act::TurnUndead => {
                let dc = self.spell_dc(u);
                let targets: Vec<usize> = self.turn_undead_targets(u).into_iter().filter(|&t| self.opposing(u, t)).collect();
                let mut rolls = Vec::new();
                for &t in &targets {
                    let (total, roll_fmt) = self.save_with_dc(t, Ability::Wis, dc, false, 0, false, false, false);
                    rolls.push((total < dc, roll_fmt));
                }
                for (i, (&t, (failed, roll_fmt))) in targets.iter().zip(rolls.into_iter()).enumerate() {
                    let sp = self.units[u].pos;
                    let tp = self.units[t].pos;
                    // `turn_undead_action.py:171-198`: `apply_turn` emits `'turned'` BEFORE `'turn_undead'`!
                    if failed {
                        self.apply_turn(t, u);
                        self.emit_web(crate::web_events::WebEv::Turned { target: t });
                    }
                    self.emit_web(crate::web_events::WebEv::TurnUndeadSave {
                        cleric: u,
                        target: t,
                        src_pos: sp,
                        tgt_pos: tp,
                        passed: !failed,
                        destroyed: false,
                        roll_fmt,
                        dc,
                    });
                    if i == 0 {
                        self.units[u].cd -= 1;
                        self.units[u].action = (self.units[u].action - 1).max(0);
                    }
                }
                if targets.is_empty() {
                    self.units[u].cd -= 1;
                    self.units[u].action = (self.units[u].action - 1).max(0);
                    self.emit_web(crate::web_events::WebEv::TurnUndeadNoTargets { cleric: u });
                }
            }
            Act::DivineSpark { target, heal, dt } => {
                let t = *target;
                let m = self.spell_mod(u);
                let face = self.roll_dice(u, "divine_spark", 1, 8)[0];
                let roll: i32 = face + m;
                let mut amount = roll;
                let mut saved = false;
                if !*heal {
                    let dc = self.spell_dc(u);
                    let total = if self.rule_version >= 16 {
                        self.save_with_dc(t, Ability::Con, dc, false, 0, true, false, false).0
                    } else {
                        self.save_throw(t, Ability::Con)
                    };
                    saved = total >= dc;
                    if saved {
                        amount = roll.div_euclid(2);
                    }
                }
                self.units[u].cd -= 1;
                self.units[u].action = (self.units[u].action - 1).max(0);
                if *heal {
                    let emit = !self.units[t].dead() && !self.units[t].cursed && amount > 0;
                    let sp = self.units[u].pos;
                    let tp = self.units[t].pos;
                    let hp_before = self.units[t].hp;
                    self.heal(t, amount);
                    if emit && self.units[t].hp > 0 {
                        let healed = (self.units[t].hp - hp_before).max(0);
                        self.emit_web(crate::web_events::WebEv::SpellHeal {
                            caster: u,
                            target: t,
                            src_pos: sp,
                            tgt_pos: tp,
                            style_key: "divine_spark", roll: None,
                            healed,
                        });
                    }
                } else {
                    let dmg_fmt = self.web_events.is_some().then(|| {
                        crate::web_events::fmt_dice_roll(8, &[face], m, saved, amount)
                    });
                    let mut hs = HitState::default();
                    self.spell_damage_with_web(
                        u,
                        t,
                        roll,
                        saved,
                        true,
                        *dt,
                        false,
                        true,
                        Some(SaveOutcome::from_check(saved, true)),
                        "divine_spark",
                        "divine_spark",
                        None,
                        dmg_fmt,
                        &mut hs,
                    );
                }
            }
            Act::PreserveLife(alloc) => {
                self.units[u].cd -= 1;
                self.units[u].action = (self.units[u].action - 1).max(0);
                for &(c, a) in alloc {
                    let cap = self.max_hp_of(c) / 2 - self.units[c].hp.max(0);
                    let amount = a.min(cap.max(0));
                    if amount > 0 {
                        let emit = !self.units[c].dead() && !self.units[c].cursed;
                        let sp = self.units[u].pos;
                        let tp = self.units[c].pos;
                        let hp_before = self.units[c].hp;
                        self.heal(c, amount);
                        if emit && self.units[c].hp > 0 {
                            let healed = (self.units[c].hp - hp_before).max(0);
                            self.emit_web(crate::web_events::WebEv::SpellHeal {
                                caster: u,
                                target: c,
                                src_pos: sp,
                                tgt_pos: tp,
                                style_key: "preserve_life", roll: None,
                                healed,
                            });
                        }
                    }
                }
            }
            Act::SpiritualWeaponMove { to } => {
                let Some(force) = self.active_force(u) else { return };
                let key = (self.round, self.turn_idx);
                if self.units[u].bonus > 0 && self.force_moves(force).contains(to) {
                    if let ObjKind::Force { pos, cast_turn, last_attack_turn, .. } = &mut self.objs[force as usize].kind {
                        if *cast_turn != key && *last_attack_turn != Some(key) {
                            *pos = *to;
                            *last_attack_turn = Some(key);
                            self.units[u].bonus -= 1;
                        }
                    }
                }
            }
            Act::SpiritualWeaponAttack { target } => {
                let t = *target;
                let Some(force) = self.active_force(u) else { return };
                let ObjKind::Force { pos, level, modifier, .. } = self.objs[force as usize].kind else { return };
                let position = match self.force_strike_position(t, pos) {
                    Some(landing) => landing,
                    None if self.rule_version < 12 => self.units[t].pos,
                    None => return,
                };
                let (hit, nat20, dismiss, t, atk_fmt) = self.evaluate_spell_attack_from(u, t, SpellId::SpiritualWeapon, WeaponKind::melee(), position);
                let mut dmg = None;
                if hit {
                    let n = 1 + (level - 2).max(0);
                    let n = if nat20 { n * 2 } else { n };
                    let faces = self.roll_dice(u, "spells.spiritual_weapon", n, 8);
                    let amount: i32 = faces.iter().sum::<i32>() + modifier;
                    let dmg_fmt = self.web_events.is_some().then(|| {
                        crate::web_events::fmt_dice_roll(8, &faces, modifier, false, amount)
                    });
                    dmg = Some((amount, nat20, dmg_fmt));
                }
                // commit
                self.units[u].bonus = (self.units[u].bonus - 1).max(0);
                let key = (self.round, self.turn_idx);
                if let ObjKind::Force { pos, last_attack_turn, .. } = &mut self.objs[force as usize].kind {
                    *pos = position;
                    *last_attack_turn = Some(key);
                }
                for d in dismiss {
                    self.dismiss_effect(d.0, d.1);
                }
                if let Some((amount, crit, dmg_fmt)) = dmg {
                    let mut hs = HitState::default();
                    self.spell_damage_with_web(
                        u,
                        t,
                        amount,
                        false,
                        true,
                        Dmg::Force,
                        crit,
                        true,
                        None,
                        "spell.spiritual_weapon",
                        "spiritual_weapon",
                        atk_fmt,
                        dmg_fmt,
                        &mut hs,
                    );
                } else {
                    let sp = self.units[u].pos;
                    let tp = self.units[t].pos;
                    self.emit_web(crate::web_events::WebEv::AttackOutcome {
                        src: u,
                        tgt: Some(t),
                        src_pos: sp,
                        tgt_pos: tp,
                        attack_name: "spell.spiritual_weapon",
                        spell_style: Some("spiritual_weapon"),
                        ranged_weapon: false,
                        hit: false,
                        crit: false,
                        reaction: false,
                        save: None,
                        dt: None,
                        raw_damage: 0,
                        applied_damage: 0,
                        atk_roll_fmt: atk_fmt,
                        dmg_roll_fmt: None,
                    });
                }
            }
            _ => {}
        }
    }
}

/// `itertools.combinations(pool, n)` in pool order.
pub(crate) fn combinations(pool: &[usize], n: usize, out: &mut Vec<Vec<usize>>) {
    if n == 0 || n > pool.len() {
        return;
    }
    let mut idx: Vec<usize> = (0..n).collect();
    loop {
        out.push(idx.iter().map(|&i| pool[i]).collect());
        let mut i = n;
        let mut found = false;
        while i > 0 {
            i -= 1;
            if idx[i] != i + pool.len() - n {
                found = true;
                break;
            }
        }
        if !found {
            return;
        }
        idx[i] += 1;
        for j in i + 1..n {
            idx[j] = idx[j - 1] + 1;
        }
    }
}
