//! The Barbarian (SRD 5.2.1, natural20 `Ruleset.barbarian_model()` '2024'):
//! Rage, Reckless Attack, Danger Sense, Path of the Berserker's Frenzy, and the
//! Cleave weapon mastery (natural20 `natural20/entity_class/barbarian.py`,
//! `natural20/actions/rage_action.py`, `natural20/actions/cleave_attack_action.py`,
//! `natural20/weapon_mastery.py`; GENERAL_ENV.md "Chruna").
//!
//! * Rage (bonus action, not in heavy armor): Resistance to bludgeoning,
//!   piercing and slashing damage, +Rage Damage on Strength attacks, Advantage
//!   on Strength saves. It lasts until the end of the barbarian's next turn;
//!   an attack roll against an enemy on her turn, a forced save or the Extend
//!   Rage bonus action keep it going (up to 100 rounds). It ends at once on the
//!   Incapacitated condition (`end_rage_if_incapacitated` where the condition
//!   is applied, and in the battle's sweep).
//! * Reckless Attack (no cost, before the turn's first attack roll): Advantage
//!   on Strength attack rolls, and attack rolls against her have Advantage,
//!   until the start of her next turn.
//! * Danger Sense: Advantage on Dexterity saves unless Incapacitated.
//! * Frenzy: while raging and reckless, the first Strength hit of her turn
//!   adds Rage Damage d6s (rolled after Savage Attacker's reroll; doubled on a
//!   critical hit).
//! * Cleave: a melee hit on the wielder's turn opens one free attack on a
//!   second creature within 5 ft of the first and within reach (once per turn;
//!   damage without a positive ability modifier). Any other action of the
//!   wielder closes the window.

use crate::content::{AtkAbility, AttackDef, Dmg};
use crate::engine::{Act, Fight};
use crate::spells::attack_hit_crit;

/// `RAGE_MAX_ROUNDS_2024`: "You can maintain a Rage for up to 10 minutes."
pub const RAGE_MAX_ROUNDS: i32 = 100;
/// `rage_action.RAGE_AI_VALUE`.
pub const RAGE_AI_VALUE: f64 = 10.0;
/// `rage_action.EXTEND_RAGE_AI_VALUE`.
pub const EXTEND_RAGE_AI_VALUE: f64 = 0.05;
const POINTLESS: f64 = -1.0;

/// Bludgeoning, piercing and slashing: Rage's resistances.
pub fn rage_resists(dt: Dmg) -> bool {
    matches!(dt, Dmg::Bludgeoning | Dmg::Piercing | Dmg::Slashing)
}

impl Fight {
    /// `Barbarian.is_raging()` (2024; a read): raging and not Incapacitated.
    #[inline]
    pub fn is_raging(&self, u: usize) -> bool {
        let unit = &self.units[u];
        unit.raging && !unit.incapacitated()
    }

    /// `barbarian.strength_attack(source, weapon)`: a weapon of type
    /// `melee_attack` (thrown or not, the unarmed strike too) whose attack
    /// ability is Strength (a finesse weapon while STR is at least DEX).
    pub fn strength_attack(&self, u: usize, def: &AttackDef) -> bool {
        if !def.melee_type {
            return false;
        }
        let unit = &self.units[u];
        match def.ability {
            AtkAbility::Str => true,
            AtkAbility::Finesse => unit.str_mod() >= crate::content::ability_mod(unit.t.abil[1]),
            _ => false,
        }
    }

    /// The `own turn` test of the barbarian rules (`battle.current_turn() is entity`).
    #[inline]
    pub(crate) fn own_turn(&self, u: usize) -> bool {
        self.started && !self.order.is_empty() && self.current() == u
    }

    /// `Barbarian.begin_rage` (+ `RageAction.apply`: the bonus action).
    pub(crate) fn do_rage(&mut self, u: usize) {
        self.notes.rages += 1;
        let unit = &mut self.units[u];
        if !unit.raging {
            unit.rage_count = (unit.rage_count - 1).max(0);
            unit.raging = true;
            unit.rage_rounds = RAGE_MAX_ROUNDS;
            unit.rage_extended = true;
            // no Concentration while raging
            if let Some(c) = self.units[u].concentration {
                self.dismiss_effect(u, c);
            }
        }
        let unit = &mut self.units[u];
        unit.bonus = (unit.bonus - 1).max(0);
    }

    /// `ExtendRageAction.apply`.
    pub(crate) fn do_extend_rage(&mut self, u: usize) {
        self.notes.rage_extends += 1;
        let unit = &mut self.units[u];
        if unit.raging {
            unit.rage_extended = true;
        }
        unit.bonus = (unit.bonus - 1).max(0);
    }

    /// `Barbarian.end_rage`.
    pub(crate) fn end_rage(&mut self, u: usize) {
        let unit = &mut self.units[u];
        if !unit.raging {
            return;
        }
        unit.raging = false;
        unit.rage_rounds = 0;
        unit.rage_extended = false;
        if self.rule_version >= 13 {
            self.emit_web(crate::web_events::WebEv::RageEnded { target: u });
        }
    }

    /// `barbarian.end_rage_if_incapacitated`.
    pub(crate) fn end_rage_if_incapacitated(&mut self, u: usize) {
        if self.units[u].raging && self.units[u].incapacitated() {
            self.notes.rage_incapacitated += 1;
            self.end_rage(u);
        }
    }

    /// `_BarbarianStartOfTurnHook.start_of_turn` (the barbarian's first
    /// start-of-turn hook).
    pub(crate) fn barbarian_start_of_turn(&mut self, u: usize) {
        if !self.units[u].t.barbarian {
            return;
        }
        let unit = &mut self.units[u];
        unit.reckless = false;
        unit.attack_rolled = false;
        unit.frenzy_hit = false;
        if unit.raging {
            unit.rage_rounds = (unit.rage_rounds - 1).max(0);
            unit.rage_extended = false;
            if unit.rage_rounds <= 0 {
                self.end_rage(u);
            }
        }
    }

    /// `_BarbarianStartOfTurnHook.end_of_turn`: a rage neither entered nor
    /// extended during the turn ends.
    pub(crate) fn barbarian_end_of_turn(&mut self, u: usize) {
        if !self.units[u].t.barbarian {
            return;
        }
        if self.units[u].raging && !self.units[u].rage_extended {
            self.notes.rage_lapsed += 1;
            self.end_rage(u);
        }
    }

    /// `barbarian.note_attack_roll(battle, item)`: an attack item with an
    /// attack roll was committed (`hit`: a `damage` item). On the barbarian's
    /// own turn: the turn's first attack roll is made, an attack roll against
    /// an enemy extends the rage, a Strength hit uses up the Frenzy target.
    pub(crate) fn note_attack_roll(&mut self, src: usize, tgt: Option<usize>, def: &AttackDef, hit: bool) {
        if !self.units[src].t.barbarian || !self.own_turn(src) {
            return;
        }
        self.units[src].attack_rolled = true;
        let Some(t) = tgt else { return };
        if self.units[src].raging && self.opposing(src, t) {
            self.units[src].rage_extended = true;
        }
        if hit && self.strength_attack(src, def) {
            self.units[src].frenzy_hit = true;
        }
    }

    /// `barbarian.note_forced_save`: forcing an enemy to save on her turn
    /// extends the rage (Topple; no mirrored mechanic forces one yet).
    #[allow(dead_code)]
    pub(crate) fn note_forced_save(&mut self, src: usize, tgt: usize) {
        if self.units[src].raging && self.own_turn(src) && self.opposing(src, tgt) {
            self.units[src].rage_extended = true;
        }
    }

    /// `barbarian.frenzy_dice`: the number of Frenzy d6s for a Strength hit
    /// now, if any.
    pub fn frenzy_dice(&self, src: usize, def: &AttackDef) -> Option<i32> {
        let unit = &self.units[src];
        if !unit.t.frenzy || unit.frenzy_hit || !self.is_raging(src) || !unit.reckless {
            return None;
        }
        if !self.own_turn(src) || !self.strength_attack(src, def) || unit.t.rage_damage <= 0 {
            return None;
        }
        Some(unit.t.rage_damage)
    }

    /// `weapon_mastery.cleave_window_item`: the creatures a Cleave may target
    /// after this hit (battle order), or None.
    pub(crate) fn cleave_window(&self, src: usize, atk: usize, tgt: usize) -> Option<Vec<usize>> {
        let unit = &self.units[src];
        let def = &unit.t.attacks[atk];
        if !def.cleave || def.thrown || !def.melee_type || def.save_attack.is_some() || !unit.t.pc {
            return None;
        }
        if !self.own_turn(src) || unit.cleave_used {
            return None;
        }
        let cands: Vec<usize> = (0..self.units.len())
            .filter(|&o| {
                o != src
                    && o != tgt
                    && !self.units[o].dead()
                    && self.opposing(src, o)
                    && self.dist(tgt, o) * 5 <= 5
                    && self.dist(src, o) * 5 <= def.range
                    && self.can_see(src, o)
            })
            .collect();
        if cands.is_empty() {
            None
        } else {
            Some(cands)
        }
    }

    /// `weapon_mastery.lapse_cleave_window`: any action of the wielder other
    /// than the Cleave closes the window.
    #[inline]
    pub(crate) fn lapse_cleave(&mut self, u: usize) {
        self.units[u].cleave = None;
    }

    // ------------------------------------------------------------------
    // Candidates and native values (no dice)
    // ------------------------------------------------------------------

    /// `RageAction.can`, `ExtendRageAction.can`, `RecklessAttackAction.can`
    /// and `CleaveAttackAction.build_all`.
    pub(crate) fn barbarian_candidates(&self, u: usize, out: &mut Vec<Act>) {
        let unit = &self.units[u];
        if unit.t.barbarian {
            if unit.rage_count >= 1 && !self.is_raging(u) && !unit.t.heavy_armor && !unit.incapacitated() && unit.bonus > 0
            {
                out.push(Act::Rage);
            }
            if self.is_raging(u) && !unit.rage_extended && unit.bonus > 0 {
                out.push(Act::ExtendRage);
            }
        }
        if unit.t.reckless_attack && !unit.reckless && !unit.attack_rolled && unit.action > 0 {
            out.push(Act::RecklessAttack);
        }
        if let Some((atk, cands)) = &unit.cleave {
            if self.own_turn(u) && self.attack_available(u, *atk) {
                for &t in cands {
                    if !self.units[t].dead() {
                        out.push(Act::Cleave { atk: *atk, target: t });
                    }
                }
            }
        }
    }

    /// `rage_action.engageable_opponents`: conscious opponents within the
    /// melee reach plus the movement left (grid distance, walls ignored).
    fn engageable(&self, u: usize) -> bool {
        let reach = match self.units[u].t.melee_ft {
            Some(r) if r != 0 => r,
            _ => 5,
        };
        let limit = reach + self.units[u].available_movement();
        self.opponents_of(u).into_iter().any(|o| self.units[o].conscious() && self.feet(u, o) <= limit)
    }

    /// `RageAction.ai_value`.
    pub(crate) fn rage_value(&self, u: usize) -> f64 {
        if self.engageable(u) {
            RAGE_AI_VALUE
        } else {
            POINTLESS
        }
    }

    /// `rage_action.reckless_attack_value`: the best Strength weapon attack
    /// this turn with Advantage (Frenzy dice included when they would apply)
    /// minus one round of Advantage given; -1 unless that beats the best
    /// attack without it.
    pub(crate) fn reckless_value(&self, u: usize) -> f64 {
        let unit = &self.units[u];
        // `strength_weapon_profiles`: equipped Strength weapons (not the
        // unarmed strike), the weapon's own row (its range is the reach)
        let mut profiles: Vec<(i32, f64, i32)> = Vec::new();
        for (ai, def) in unit.t.attacks.iter().enumerate() {
            if def.item.is_none() || def.thrown || !self.attack_available(u, ai) || !self.strength_attack(u, def) {
                continue;
            }
            let (to_hit, dmg, _) = self.attack_numbers(u, ai);
            let damage = if self.rule_version >= 18 {
                dmg.average()
            } else {
                0.0 + dmg.count as f64 * (dmg.sides + 1) as f64 / 2.0 + dmg.modifier as f64
            };
            profiles.push((to_hit, damage, def.range));
        }
        if profiles.is_empty() {
            return POINTLESS;
        }
        let frenzy = if unit.t.frenzy && self.is_raging(u) && !unit.frenzy_hit {
            3.5 * unit.t.rage_damage as f64
        } else {
            0.0
        };
        let movement = unit.available_movement();
        let mut plain: Option<f64> = None;
        let mut reckless: Option<f64> = None;
        for &(to_hit, damage, reach) in &profiles {
            for foe in self.opponents_of(u) {
                if !self.units[foe].conscious() || self.feet(u, foe) > reach + movement {
                    continue;
                }
                let ac = self.armor_class(foe);
                let p = attack_hit_crit(to_hit, ac, false, false).0 * damage;
                let q = attack_hit_crit(to_hit, ac, true, false).0 * (damage + frenzy);
                plain = Some(plain.map_or(p, |x: f64| x.max(p)));
                reckless = Some(reckless.map_or(q, |x: f64| x.max(q)));
            }
        }
        let (Some(plain), Some(reckless)) = (plain, reckless) else { return POINTLESS };
        let value = reckless - self.advantage_given_per_round(u);
        if value > plain {
            value
        } else {
            POINTLESS
        }
    }

    /// `spell_ai.advantage_given_per_round(target, battle)`: the Blur foe
    /// model with Advantage against the target.
    pub(crate) fn advantage_given_per_round(&self, target: usize) -> f64 {
        let ac = self.armor_class(target);
        let mut side = vec![target];
        for a in 0..self.units.len() {
            if a != target && !self.units[a].dead() && self.allies(a, target) && self.units[a].conscious() {
                side.push(a);
            }
        }
        let mut total = 0.0;
        for foe in self.opponents_of(target) {
            if !self.units[foe].conscious() || self.units[foe].incapacitated() {
                continue;
            }
            let profiles = self.attack_profiles(foe);
            let dist = self.feet(foe, target);
            let mut best = 0.0f64;
            for &(bonus, damage, melee, reach) in &profiles {
                if dist > self.reach_limit(foe, melee, reach) {
                    continue;
                }
                let gained = attack_hit_crit(bonus, ac, true, false).0 - attack_hit_crit(bonus, ac, false, false).0;
                best = best.max(gained * damage);
            }
            if best <= 0.0 {
                continue;
            }
            let exposed = side
                .iter()
                .filter(|&&m| profiles.iter().any(|&(_, _, melee, reach)| self.feet(foe, m) <= self.reach_limit(foe, melee, reach)))
                .count() as i32;
            total += best * self.attacks_per_round(foe) as f64 / exposed.max(1) as f64;
        }
        total
    }
}
