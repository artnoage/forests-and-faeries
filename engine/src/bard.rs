//! Bard class features (SRD 5.2.1, Levels 1–3, College of Lore):
//!
//! * **Level 1: Bardic Inspiration** (Bonus Action, 60 ft creature who can see
//!   or hear you): grants one Bardic Inspiration die (`1d6` at levels 1–4)
//!   lasting 1 hour; at most one die per creature at a time. Uses equal CHA mod
//!   (min 1), regained on a Long Rest.
//!   **Automatic trigger rule (as `Shield`):** whenever the inspired creature
//!   fails an attack roll (`!nat1 && !crit && total < ac`) or saving throw
//!   (`total < dc`) by at most the die's maximum (`1..=6`), the die rolls
//!   automatically and adds to the total, potentially turning the failure into
//!   a success.
//! * **Level 2: Expertise & Jack of All Trades:** derived directly into the
//!   character's `passive_perception` (Expertise in Perception -> 16) and
//!   non-proficient skill modifiers (`medicine`, `athletics`, `acrobatics` +1).
//!   Per SRD 5.2.1, Jack of All Trades applies only to checks using a skill
//!   proficiency you lack, so it does NOT add to Initiative.
//! * **Level 3: College of Lore — Bonus Proficiencies & Cutting Words:**
//!   Reaction when a creature the Bard can see within 60 feet succeeds on an
//!   attack roll or makes a damage roll: expend one Bardic Inspiration use,
//!   roll `1d6`, and subtract from the roll.
//!   **Automatic trigger rule (as `Shield`):**
//!   - On an enemy's non-critical attack hit against an ally (`total >= ac`),
//!     triggers when subtracting the die's maximum (`6`) can turn the hit into
//!     a miss (`total - 6 < ac`).
//!   - On an enemy's damage roll against an ally (if Cutting Words was not
//!     spent on the attack roll), triggers only when at least one standing
//!     ally (`hp > 0`, conscious) taking damage from that roll would drop
//!     without Cutting Words (`before >= hp`) and subtracting the die's max
//!     (`6`) can keep them standing (`after_max < hp`). For simultaneous-save
//!     area spells (SRD 5.2.1 p. 16 & p. 35), Cutting Words subtracts once from
//!     the shared damage roll before each target applies its save/halving.

use crate::content::{Dice, SpellId};
use crate::effects::{EffKey, ObjKind};
use crate::engine::{Act, Fight};
use crate::web_events::WebEv;

/// SRD 5.2.1 Bardic Inspiration duration: 1 hour (3600 seconds).
pub const BARDIC_INSPIRATION_SECONDS: i32 = 60 * 60;

impl Fight {
    /// True if `observer` can either see `other` or hear `other`'s square
    /// (conscious, not Deafened, `other` not Hidden, and within 60 ft earshot),
    /// matching Natural20 `target_validation.can_see_or_hear` + `can_hear_location`.
    pub fn can_see_or_hear(&self, observer: usize, other: usize) -> bool {
        self.can_see(observer, other)
            || (self.can_hear(observer) && !self.units[other].hidden() && self.feet(observer, other) <= 60)
    }

    /// True if `u` currently carries an unexpended Bardic Inspiration die.
    #[inline]
    pub fn has_bardic_inspiration(&self, u: usize) -> bool {
        self.has_effect(u, EffKey::BardicInspiration)
    }

    /// Active Bardic Inspiration die on `u`, if any.
    pub fn bardic_inspiration_die_on(&self, u: usize) -> Option<(u32, Dice)> {
        let obj = self.last_effect(u, EffKey::BardicInspiration)?;
        if let ObjKind::BardicInspiration { die, .. } = self.objs[obj as usize].kind {
            if !self.objs[obj as usize].ended {
                return Some((obj, die));
            }
        }
        None
    }

    /// Legal `Act::BardicInspiration` candidates for `u` (Bonus Action, 60 ft,
    /// another conscious ally who can see or hear the Bard and doesn't already
    /// hold a Bardic Inspiration die).
    pub fn bardic_inspiration_candidates(&self, u: usize) -> Vec<Act> {
        if self.rule_version < 18 {
            return Vec::new();
        }
        let actor = &self.units[u];
        if !actor.t.bard || actor.bonus <= 0 || actor.bardic_inspiration_count <= 0 {
            return Vec::new();
        }
        let mut out = Vec::new();
        for tgt in 0..self.units.len() {
            if tgt == u || !self.allies(u, tgt) {
                continue;
            }
            let ally = &self.units[tgt];
            if !ally.conscious() || ally.dead() {
                continue;
            }
            if self.feet(u, tgt) > 60 {
                continue;
            }
            if !self.can_see_or_hear(tgt, u) {
                continue;
            }
            if self.has_bardic_inspiration(tgt) {
                continue;
            }
            out.push(Act::BardicInspiration { target: tgt });
        }
        out
    }

    /// Execute `Act::BardicInspiration { target }`.
    pub(crate) fn do_bardic_inspiration(&mut self, src: usize, tgt: usize) {
        let die = self.units[src].t.bardic_inspiration_die;
        if die.sides <= 0 {
            return;
        }
        self.units[src].bonus = (self.units[src].bonus - 1).max(0);
        self.units[src].bardic_inspiration_count = (self.units[src].bardic_inspiration_count - 1).max(0);
        // SRD 5.2.1: "A creature can have only one Bardic Inspiration die at a time."
        for old in self.active_effects(tgt, EffKey::BardicInspiration) {
            self.dismiss_effect(tgt, old);
        }
        // Dummy SpellId::Bless is unused for Ident::Unique objects.
        let obj = self.new_obj(
            SpellId::Bless,
            ObjKind::BardicInspiration { target: tgt, die },
            src,
            vec![tgt],
            true,
        );
        self.register_effect(tgt, EffKey::BardicInspiration, obj, Some(BARDIC_INSPIRATION_SECONDS));
        self.add_casted(src, tgt, obj, Some(BARDIC_INSPIRATION_SECONDS));
        let src_pos = self.units[src].pos;
        let tgt_pos = self.units[tgt].pos;
        let die_label = match die.sides {
            8 => "1d8",
            10 => "1d10",
            12 => "1d12",
            _ => "1d6",
        };
        self.emit_web(WebEv::BardicInspirationGranted { src, tgt, src_pos, tgt_pos, die: die_label });
    }

    /// SRD 5.2.1 automatic post-failure Bardic Inspiration spend:
    /// triggers only when `total < threshold` and rolling the die's maximum can
    /// turn the failure into a success (`total + max_roll >= threshold`).
    pub(crate) fn try_bardic_inspiration(
        &mut self,
        u: usize,
        total: i32,
        threshold: i32,
        roll_kind: &'static str,
    ) -> Option<(i32, i32)> {
        if self.rule_version < 18 || total >= threshold {
            return None;
        }
        let (obj, die) = self.bardic_inspiration_die_on(u)?;
        let max_bonus = die.count * die.sides + die.modifier;
        if total + max_bonus < threshold {
            return None;
        }
        let rolled: i32 = self.roll_dice(u, "bardic_inspiration", die.count, die.sides).into_iter().sum::<i32>() + die.modifier;
        self.dismiss_effect(u, obj);
        let new_total = total + rolled;
        let succeeded = new_total >= threshold;
        let pos = self.units[u].pos;
        self.emit_web(WebEv::BardicInspirationSpent {
            target: u,
            pos,
            roll: rolled,
            old_total: total,
            new_total,
            threshold,
            succeeded,
            roll_kind,
        });
        Some((rolled, new_total))
    }

    /// Find an eligible College of Lore Bard who can use Cutting Words as a
    /// Reaction against `roller` (visible within 60 ft, reaction & BI left).
    /// When `ally_target` is `Some(t)`, also requires `t` to be an ally of the Bard.
    fn find_cutting_words_bard(&self, roller: usize, ally_target: Option<usize>) -> Option<(usize, Dice)> {
        if self.rule_version < 18 {
            return None;
        }
        for bard in 0..self.units.len() {
            let b = &self.units[bard];
            if !b.t.cutting_words
                || b.dead()
                || b.incapacitated()
                || b.reaction <= 0
                || b.bardic_inspiration_count <= 0
                || b.t.bardic_inspiration_die.sides <= 0
            {
                continue;
            }
            if !self.opposing(bard, roller) {
                continue;
            }
            if let Some(t) = ally_target {
                if !self.allies(bard, t) {
                    continue;
                }
            }
            if self.feet(bard, roller) <= 60 && self.can_see(bard, roller) {
                return Some((bard, b.t.bardic_inspiration_die));
            }
        }
        None
    }

    /// College of Lore Cutting Words on an enemy's successful attack roll.
    /// Triggers automatically when `!crit && total >= ac` and subtracting the
    /// die's max can turn the hit into a miss (`total - max_die < ac`).
    pub(crate) fn try_cutting_words_attack(
        &mut self,
        attacker: usize,
        tgt: usize,
        total: i32,
        ac: i32,
        crit: bool,
    ) -> Option<(usize, i32, i32, bool)> {
        if self.rule_version < 18 || crit || total < ac {
            return None;
        }
        let (bard, die) = self.find_cutting_words_bard(attacker, Some(tgt))?;
        let max_sub = die.count * die.sides + die.modifier;
        if total - max_sub >= ac {
            return None;
        }
        self.units[bard].reaction = (self.units[bard].reaction - 1).max(0);
        self.units[bard].bardic_inspiration_count = (self.units[bard].bardic_inspiration_count - 1).max(0);
        let rolled: i32 = self.roll_dice(bard, "cutting_words", die.count, die.sides).into_iter().sum::<i32>() + die.modifier;
        let new_total = total - rolled;
        let turned_miss = new_total < ac;
        let bard_pos = self.units[bard].pos;
        let attacker_pos = self.units[attacker].pos;
        self.emit_web(WebEv::CuttingWordsAttack {
            bard,
            attacker,
            target: tgt,
            bard_pos,
            attacker_pos,
            roll: rolled,
            old_total: total,
            new_total,
            ac,
            turned_miss,
        });
        Some((bard, rolled, new_total, turned_miss))
    }

    /// College of Lore Cutting Words on an enemy's successful ability check
    /// (SRD 5.2.1 p. 35, matching Natural20 `reduce_ability_check`).
    pub(crate) fn try_cutting_words_ability_check(
        &mut self,
        roller: usize,
        total: i32,
        threshold: i32,
        check_kind: &'static str,
    ) -> Option<(usize, i32, i32, bool)> {
        if self.rule_version < 18 || total < threshold {
            return None;
        }
        let (bard, die) = self.find_cutting_words_bard(roller, None)?;
        let max_sub = die.count * die.sides + die.modifier;
        if total - max_sub >= threshold {
            return None;
        }
        self.units[bard].reaction = (self.units[bard].reaction - 1).max(0);
        self.units[bard].bardic_inspiration_count = (self.units[bard].bardic_inspiration_count - 1).max(0);
        let rolled: i32 = self.roll_dice(bard, "cutting_words", die.count, die.sides).into_iter().sum::<i32>() + die.modifier;
        let new_total = total - rolled;
        let turned_fail = new_total < threshold;
        let bard_pos = self.units[bard].pos;
        let roller_pos = self.units[roller].pos;
        self.emit_web(WebEv::CuttingWordsCheck {
            bard,
            roller,
            bard_pos,
            roller_pos,
            roll: rolled,
            old_total: total,
            new_total,
            threshold,
            turned_fail,
            check_kind,
        });
        Some((bard, rolled, new_total, turned_fail))
    }

    /// College of Lore Cutting Words on an enemy's damage roll (SRD 5.2.1 p. 16 & p. 35).
    /// `targets` holds `(target_unit, halved)` for every target taking damage from this
    /// single damage roll (`raw_damage` is the pre-halving roll total). Triggers only
    /// when at least one living, standing (`hp > 0`, conscious) ally of the Bard would
    /// be dropped without Cutting Words (`before >= hp`) and subtracting the Bard's max
    /// die (`max_sub`) keeps that ally standing (`after_max < hp`).
    pub fn try_cutting_words_damage_roll(
        &mut self,
        attacker: usize,
        raw_damage: i32,
        targets: &[(usize, bool)],
    ) -> Option<(usize, i32, i32)> {
        if self.rule_version < 18 || raw_damage <= 0 || targets.is_empty() {
            return None;
        }
        for bard in 0..self.units.len() {
            let b = &self.units[bard];
            if !b.t.cutting_words
                || b.dead()
                || b.incapacitated()
                || b.reaction <= 0
                || b.bardic_inspiration_count <= 0
                || b.t.bardic_inspiration_die.sides <= 0
            {
                continue;
            }
            if !self.opposing(bard, attacker) {
                continue;
            }
            if self.feet(bard, attacker) > 60 || !self.can_see(bard, attacker) {
                continue;
            }
            let die = b.t.bardic_inspiration_die;
            let max_sub = die.count * die.sides + die.modifier;
            let reduced_raw = (raw_damage - max_sub).max(0);
            let saved_ally = targets.iter().copied().find(|&(tgt, halved)| {
                if !self.allies(bard, tgt) {
                    return false;
                }
                let ally = &self.units[tgt];
                if ally.dead() || !ally.conscious() || ally.hp <= 0 {
                    return false;
                }
                let before = if halved { raw_damage.div_euclid(2) } else { raw_damage };
                let after_max = if halved { reduced_raw.div_euclid(2) } else { reduced_raw };
                before >= ally.hp && after_max < ally.hp
            });
            let Some((focus_tgt, _)) = saved_ally else {
                continue;
            };
            self.units[bard].reaction = (self.units[bard].reaction - 1).max(0);
            self.units[bard].bardic_inspiration_count = (self.units[bard].bardic_inspiration_count - 1).max(0);
            let rolled: i32 = self.roll_dice(bard, "cutting_words", die.count, die.sides).into_iter().sum::<i32>() + die.modifier;
            let new_damage = (raw_damage - rolled).max(0);
            let bard_pos = self.units[bard].pos;
            let target_pos = self.units[focus_tgt].pos;
            self.emit_web(WebEv::CuttingWordsDamage {
                bard,
                attacker,
                target: focus_tgt,
                bard_pos,
                target_pos,
                roll: rolled,
                old_damage: raw_damage,
                new_damage,
                shared_roll: targets.len() > 1,
            });
            return Some((bard, rolled, new_damage));
        }
        None
    }

    /// Single-target unhalved wrapper around [`Self::try_cutting_words_damage_roll`].
    pub fn try_cutting_words_damage(
        &mut self,
        attacker: usize,
        tgt: usize,
        raw_damage: i32,
    ) -> Option<(usize, i32, i32)> {
        self.try_cutting_words_damage_roll(attacker, raw_damage, &[(tgt, false)])
    }

    /// Built-in AI score for `Act::BardicInspiration { target }`.
    /// Bonus action only; keeps 1 die in reserve for Cutting Words at L3 if
    /// enemies are actively threatening allies, and never outscores Healing Word
    /// on a downed or critically wounded ally.
    pub(crate) fn score_bardic_inspiration(&self, src: usize, tgt: usize) -> f64 {
        let b = &self.units[src];
        if !b.t.bard || b.bardic_inspiration_count <= 0 {
            return -1.0;
        }
        let ally = &self.units[tgt];
        if !ally.conscious() || ally.dead() || self.has_bardic_inspiration(tgt) {
            return -1.0;
        }
        let foes_alive = (0..self.units.len()).any(|e| self.opposing(src, e) && self.units[e].conscious() && !self.units[e].dead());
        if !foes_alive {
            return -1.0;
        }
        // At Level 3 (Cutting Words), reserve the last inspiration die for Cutting Words reactions!
        if b.t.cutting_words && b.bardic_inspiration_count <= 1 {
            return -1.0;
        }
        // Favor high-impact strikers / wounded frontline allies who will roll attacks or saves soon.
        let near_foe = (0..self.units.len()).any(|e| self.opposing(src, e) && self.units[e].conscious() && self.feet(tgt, e) <= 30);
        let base = if near_foe { 4.2 } else { 2.4 };
        let hp_ratio = ally.hp as f64 / self.max_hp_of(tgt).max(1) as f64;
        let danger_bonus = if hp_ratio < 0.6 { 1.0 } else { 0.0 };
        base + danger_bonus
    }
}
