//! Canonical step-program resolver and turn/interrupt state machine for `ember-core`.
//!
//! Every weapon attack, monster attack, class feature, and data-driven spell
//! executes through one unified [`Step`] interpreter, preserving exact rule-18
//! dice order without version switches.

use std::sync::Arc;

use smallvec::SmallVec;

use crate::effect::{EffectExpiry, EffectKind};
use crate::event::{Event, EventSink, EventSubject};
use crate::fight::Fight;
use crate::interrupt::{
    ActionContinuation, InterruptFrame, InterruptKind, ReactionOption,
};
use crate::rng::DiceSource;
use crate::step::{
    AttackKind, BranchPredicate, DcExpr, MoveMode, ReactionWindowKind, ResourceKind, SpecialKind,
    Step, TargetMode,
};
use crate::types::{
    ability_mod, Ability, AbilityId, CoreError, Dice, Dmg, FightOutcome, Metamagic, Pos,
    ReactionMode, RollMode, SpellPayment, UnitFlags, UnitId,
};
use crate::view::ActionPayload;

#[inline]
fn first_target(ctx: &ResolutionCtx) -> Result<UnitId, CoreError> {
    ctx.targets
        .first()
        .copied()
        .ok_or_else(|| CoreError::UnknownAction("action requires at least one target".into()))
}

/// Per-action scratchpad threaded through the canonical [`Step`] interpreter.
#[derive(Clone, Debug, Default)]
struct ResolutionCtx {
    actor: UnitId,
    targets: SmallVec<[UnitId; 8]>,
    point: Option<Pos>,
    at_level: u8,
    base_level: u8,
    metamagic: Option<Metamagic>,
    is_sorcerer_spell: bool,
    /// Dynamic overrides computed for hero weapons (`attack_numbers`).
    attack_idx: Option<usize>,
    weapon_to_hit: Option<i32>,
    weapon_damage_override: Option<Dice>,
    weapon_graze_mod: Option<i32>,
    // Resolution results populated by steps
    hit: bool,
    crit: bool,
    had_adv: bool,
    last_save_failed: bool,
    saved_per_target: SmallVec<[bool; 8]>,
    /// Damage slots (`0` = base roll, `1..` = riders).
    damage_slots: SmallVec<[DamageSlot; 4]>,
}

#[derive(Clone, Debug)]
struct DamageSlot {
    dmg_type: Dmg,
    sides: i32,
    modifier: i32,
    faces: SmallVec<[i32; 8]>,
    combine_with_base: bool,
}

impl DamageSlot {
    #[inline]
    fn total(&self) -> i32 {
        self.faces.iter().sum::<i32>() + self.modifier
    }
}

/// Mutable state passed through `take_damage` for multi-component hits.
#[derive(Clone, Copy, Debug, Default)]
struct HitState {
    overflow: i32,
    death_fail_counted: bool,
    kill_at_zero: bool,
}

impl Fight {
    // ------------------------------------------------------------------
    // Initiative & Turn Loop
    // ------------------------------------------------------------------

    pub(crate) fn roll_initiative<D: DiceSource, S: EventSink>(
        &mut self,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        self.state.started = true;
        self.state.turn_idx = 0;
        let n = self.state.units.len();
        for i in 0..n {
            let u = UnitId(i as u8);
            if self.unit(u).flags.is_dead() {
                continue;
            }
            let (init_adv, init_bonus, dex) = {
                let t = self.template_of(u);
                (t.init_adv, t.init_bonus as i32, t.abilities[1] as i32)
            };
            let mode = if init_adv { RollMode::Advantage } else { RollMode::Normal };
            let face = self.roll_d20(u, "initiative", mode, dice, sink)?;
            let total = face + init_bonus;
            self.unit_mut(u).initiative_x100 = total * 100 + dex;
            self.emit_ev(sink, Event::InitiativeRolled { unit: u, total });
        }
        let mut order: SmallVec<[UnitId; 16]> = (0..n)
            .map(|i| UnitId(i as u8))
            .filter(|&u| !self.unit(u).flags.is_dead())
            .collect();
        // Stable descending sort on (total * 100 + dex) matches Python `sorted(..., reverse=True)`.
        order.sort_by(|&a, &b| self.unit(b).initiative_x100.cmp(&self.unit(a).initiative_x100));
        self.state.order = order;
        Ok(())
    }

    pub(crate) fn open_turn<D: DiceSource, S: EventSink>(
        &mut self,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        while !self.finish_if_needed(sink) {
            self.skip_dead_turns();
            let actor = self.current();
            self.start_turn(actor, dice, sink)?;
            if self.can_take_turn(actor) {
                self.reset_turn(actor);
                if self.can_take_turn(actor) {
                    return Ok(());
                }
            }
            self.end_and_next_turn();
        }
        Ok(())
    }

    #[inline]
    pub fn can_take_turn(&self, u: UnitId) -> bool {
        let f = self.unit(u).flags;
        f.is_conscious() && !f.is_incapacitated()
    }

    fn skip_dead_turns(&mut self) {
        let len = self.state.order.len();
        for _ in 0..len {
            if !self.unit(self.current()).flags.is_dead() {
                return;
            }
            self.advance_turn_index();
        }
    }

    fn advance_turn_index(&mut self) {
        self.state.turn_idx += 1;
        if (self.state.turn_idx as usize) >= self.state.order.len() {
            self.state.turn_idx = 0;
            self.state.round += 1;
        }
    }

    fn battle_ends(&self) -> bool {
        let mut teams = [false; 2];
        for &u in &self.state.order {
            if self.unit(u).flags.is_conscious() {
                teams[self.unit(u).team.idx()] = true;
            }
        }
        !(teams[0] && teams[1])
    }

    fn next_turn(&mut self) {
        if self.state.started && self.battle_ends() {
            self.state.started = false;
            return;
        }
        self.advance_turn_index();
    }

    pub(crate) fn finish_if_needed<S: EventSink>(&mut self, sink: &mut S) -> bool {
        let mut teams = [false; 2];
        for u in &self.state.units {
            if u.flags.is_conscious() {
                teams[u.team.idx()] = true;
            }
        }
        if teams[0] && teams[1] {
            return false;
        }
        if !self.state.finished {
            self.state.finished = true;
            self.state.winner = if teams[0] {
                Some(crate::types::Team::Heroes)
            } else if teams[1] {
                Some(crate::types::Team::Monsters)
            } else {
                None
            };
            if self.state.started {
                self.battle_end_turn();
                self.next_turn();
            }
            let outcome = FightOutcome {
                winner: self.state.winner,
                finished: true,
                round: self.state.round,
            };
            self.emit_ev(sink, Event::CombatEnded(outcome));
        }
        true
    }

    fn start_turn<D: DiceSource, S: EventSink>(
        &mut self,
        u: UnitId,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let gt = self.gt();
        self.state.effects.expire_game_time(gt);
        self.refresh_all_flags();
        self.expire_timed_conditions();

        self.emit_ev(sink, Event::TurnStarted { unit: u, round: self.state.round });

        // Dodge ends at the start of the bearer's turn (even if unconscious/skipped).
        self.state.effects.remove_kind(u, EffectKind::Dodge);
        self.refresh_flags(u);

        // Death saving throw if unconscious & unstable
        if self.unit(u).flags.is_unconscious() && !self.unit(u).flags.contains(UnitFlags::STABLE) {
            self.death_saving_throw(u, dice, sink)?;
        }
        if self.unit(u).flags.is_dead() {
            return Ok(());
        }

        // Expire start-of-turn effects (StenchPoison on bearer, Sap from source if unconscious)
        self.state.effects.remove_kind(u, EffectKind::StenchPoison);
        if self.unit(u).flags.is_unconscious() {
            self.state.effects.expire_start_of_turn(u, gt);
        }
        self.refresh_all_flags();

        // Ghast Stench start-of-turn CON save
        self.stench_start_of_turn(u, dice, sink)?;

        self.prune_invalid_grapples(u);
        for (g, _) in self.grapplers_of(u) {
            self.prune_invalid_grapples(g);
        }

        self.state.effects.expire_game_time(gt);
        self.refresh_all_flags();
        self.expire_timed_conditions();
        Ok(())
    }

    fn stench_start_of_turn<D: DiceSource, S: EventSink>(
        &mut self,
        u: UnitId,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        if self.unit(u).flags.is_dead() || self.template_of(u).immune_poisoned {
            return Ok(());
        }
        let pos = self.unit(u).pos;
        let mut sources: SmallVec<[(UnitId, i16); 4]> = SmallVec::new();
        for o_idx in 0..self.state.units.len() {
            let o = UnitId(o_idx as u8);
            if o == u || self.unit(o).flags.is_dead() {
                continue;
            }
            if let Some(dc) = self.template_of(o).stench_dc {
                if self.unit(o).pos.feet_to(pos) <= 5 {
                    sources.push((o, dc));
                }
            }
        }
        for (src, dc) in sources {
            if self.state.effects.has_kind_from(u, src, EffectKind::StenchImmunity) {
                continue;
            }
            let total = self.save_throw(u, Ability::Con, false, 0, false, dice, sink)?;
            if total >= dc as i32 {
                self.state.effects.add(
                    u,
                    src,
                    EffectKind::StenchImmunity,
                    EffectExpiry::Manual,
                    false,
                    None,
                );
            } else {
                self.state.effects.add(
                    u,
                    src,
                    EffectKind::StenchPoison,
                    EffectExpiry::StartOfBearerTurn,
                    false,
                    None,
                );
                self.refresh_flags(u);
                self.emit_ev(
                    sink,
                    Event::EffectChanged { unit: u, effect: "poisoned".into(), added: true },
                );
            }
        }
        Ok(())
    }

    fn reset_turn(&mut self, u: UnitId) {
        let speed = self.speed_of(u);
        let gt = self.gt();
        // Expire Sap & source-start hooks applied by `u` (keep StenchPoison just applied in start_turn!)
        self.state.effects.expire_source_start_of_turn(u, gt);
        self.state.effects.remove_kind(u, EffectKind::Dodge);
        self.state.effects.remove_kind(u, EffectKind::Disengage);
        self.refresh_all_flags();

        let (pc, n_combos) = {
            let t = self.template_of(u);
            (t.pc, t.multiattack.len().min(8))
        };
        let unit = self.unit_mut(u);
        unit.action = 1;
        unit.bonus = 1;
        unit.reaction = 1;
        unit.movement = speed;
        unit.champion_movement = 0;
        unit.action_surge_used = false;
        unit.slot_spent_this_turn = false;
        unit.two_weapon = false;
        unit.ma_started = false;
        unit.ma_combo_used = [0; 8];
        unit.ma_combo_mask = if n_combos > 0 { (1u8 << n_combos) - 1 } else { 0 };
        if pc && !unit.first_turn_taken {
            unit.first_turn_taken = true;
        }
        self.refresh_flags(u);
    }

    fn battle_end_turn(&mut self) {
        let current = self.current();
        self.unit_mut(current).champion_movement = 0;
        // Ending turn on a same-or-larger living creature knocks mover Prone (rule 18).
        if !self.unit(current).flags.is_dead() && self.template_of(current).size != crate::types::Size::Tiny {
            let pos = self.unit(current).pos;
            let my_size = self.template_of(current).size;
            let stacked = (0..self.state.units.len()).any(|i| {
                let o = UnitId(i as u8);
                o != current
                    && !self.unit(o).flags.is_dead()
                    && self.unit(o).pos == pos
                    && self.template_of(o).size >= my_size
            });
            if stacked {
                self.apply_prone(current);
            }
        }
        self.expire_timed_conditions();
        let gt = self.gt();
        self.state.effects.expire_end_of_turn(current, gt);
        self.refresh_all_flags();
    }

    fn end_and_next_turn(&mut self) {
        self.battle_end_turn();
        self.next_turn();
    }

    pub(crate) fn arena_end_turn<D: DiceSource, S: EventSink>(
        &mut self,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let who = self.current();
        self.emit_ev(sink, Event::TurnEnded { unit: who });
        self.end_and_next_turn();
        self.open_turn(dice, sink)?;
        Ok(())
    }

    // ------------------------------------------------------------------
    // Action Dispatch -> Compiled Step Programs
    // ------------------------------------------------------------------

    pub(crate) fn execute_payload<D: DiceSource, S: EventSink>(
        &mut self,
        src: UnitId,
        payload: &ActionPayload,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        if !matches!(payload, ActionPayload::Move(_)) {
            self.unit_mut(src).champion_movement = 0;
        }
        match payload {
            ActionPayload::Move(path) => {
                self.do_move(src, path, dice, sink)?;
            }
            ActionPayload::Attack { attack_idx, target, reaction } => {
                self.do_weapon_attack(src, *attack_idx as usize, *target, *reaction, dice, sink)?;
            }
            ActionPayload::Dash => {
                let ab_id = self.require_ability("dash")?;
                let mut ctx = ResolutionCtx { actor: src, ..Default::default() };
                self.run_ability(ab_id, &mut ctx, dice, sink)?;
            }
            ActionPayload::Disengage => {
                let ab_id = self.require_ability("disengage")?;
                let mut ctx = ResolutionCtx { actor: src, ..Default::default() };
                self.run_ability(ab_id, &mut ctx, dice, sink)?;
            }
            ActionPayload::Dodge => {
                let ab_id = self.require_ability("dodge")?;
                let mut ctx = ResolutionCtx { actor: src, ..Default::default() };
                self.run_ability(ab_id, &mut ctx, dice, sink)?;
            }
            ActionPayload::Stand => {
                let ab_id = self.require_ability("stand")?;
                let mut ctx = ResolutionCtx { actor: src, ..Default::default() };
                self.run_ability(ab_id, &mut ctx, dice, sink)?;
            }
            ActionPayload::SecondWind => {
                let die = self.template_of(src).second_wind_die;
                let rolls = self.roll_dice(src, "second_wind", die.count as i32, die.sides as i32, dice, sink)?;
                let amount = rolls.iter().sum::<i32>() + die.modifier as i32;
                self.unit_mut(src).second_wind_left = self.unit(src).second_wind_left.saturating_sub(1);
                self.heal_unit(src, amount, sink);
                self.unit_mut(src).bonus = (self.unit(src).bonus - 1).max(0);
            }
            ActionPayload::ActionSurge => {
                let ab_id = self.require_ability("action_surge")?;
                let mut ctx = ResolutionCtx { actor: src, ..Default::default() };
                self.run_ability(ab_id, &mut ctx, dice, sink)?;
            }
            ActionPayload::InnateSorcery => {
                let ab_id = self.require_ability("innate_sorcery")?;
                let mut ctx = ResolutionCtx { actor: src, ..Default::default() };
                self.run_ability(ab_id, &mut ctx, dice, sink)?;
            }
            ActionPayload::EscapeGrapple { grappler } => {
                self.do_escape_grapple(src, *grappler, dice, sink)?;
            }
            ActionPayload::DropGrapple { target } => {
                self.release_grapple(src, *target);
            }
            ActionPayload::CastSpell {
                spell_key,
                at_level,
                free,
                metamagic,
                targets,
                point,
            } => {
                self.do_spell(src, spell_key, *at_level, *free, *metamagic, targets, *point, dice, sink)?;
            }
            ActionPayload::EndTurn => {}
        }
        let gt = self.gt();
        self.state.effects.expire_game_time(gt);
        self.refresh_all_flags();
        self.expire_timed_conditions();
        Ok(())
    }

    fn require_ability(&self, key: &str) -> Result<AbilityId, CoreError> {
        self.db
            .ability_by_key
            .get(key)
            .copied()
            .ok_or_else(|| CoreError::UnknownAction(format!("missing ability {key:?} in ContentDb")))
    }

    // ------------------------------------------------------------------
    // Canonical Step-Program Interpreter (`ember-core::resolve`)
    // ------------------------------------------------------------------

    fn run_ability<D: DiceSource, S: EventSink>(
        &mut self,
        ab_id: AbilityId,
        ctx: &mut ResolutionCtx,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let db = Arc::clone(&self.db);
        self.run_steps(&db.ability(ab_id).steps, ctx, dice, sink)
    }

    fn run_steps<D: DiceSource, S: EventSink>(
        &mut self,
        steps: &[Step],
        ctx: &mut ResolutionCtx,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        for step in steps {
            match step {
                Step::TargetGate { save, dc } => {
                    let dc_val = self.eval_dc(*dc, ctx);
                    let total = self.save_throw(ctx.actor, *save, false, 0, false, dice, sink)?;
                    if total < dc_val {
                        return Ok(());
                    }
                }
                Step::AttackRoll { kind, range_ft, melee_type, bonus_override, tag } => {
                    let target = first_target(ctx)?;
                    self.step_attack_roll(
                        ctx,
                        target,
                        *kind,
                        *range_ft as i32,
                        *melee_type,
                        *bonus_override,
                        tag,
                        dice,
                        sink,
                    )?;
                }
                Step::SavingThrow {
                    ability,
                    dc,
                    magical,
                    charm,
                    shared_roll,
                    half_on_save: _,
                    disadvantage_on_construct,
                } => {
                    let dc_val = self.eval_dc(*dc, ctx);
                    if *shared_roll {
                        ctx.saved_per_target.clear();
                        let origin = ctx.point.unwrap_or_else(|| self.unit(ctx.actor).pos);
                        let targets = ctx.targets.clone();
                        for tgt in targets {
                            let auto_fail = matches!(ability, Ability::Str | Ability::Dex)
                                && (self.unit(tgt).flags.contains(UnitFlags::PARALYZED)
                                    || !self.unit(tgt).flags.is_conscious());
                            let passed = if auto_fail {
                                false
                            } else {
                                let cover = if *ability == Ability::Dex {
                                    self.point_cover_bonus(origin, tgt)
                                } else {
                                    0
                                };
                                let dis = *disadvantage_on_construct && self.template_of(tgt).construct;
                                let total = self.save_throw(
                                    tgt,
                                    *ability,
                                    dis,
                                    cover,
                                    *magical || *charm,
                                    dice,
                                    sink,
                                )?;
                                total >= dc_val
                            };
                            ctx.saved_per_target.push(passed);
                        }
                    } else {
                        let tgt = first_target(ctx)?;
                        let cover = if *ability == Ability::Dex {
                            self.cover_bonus_from(self.unit(ctx.actor).pos, tgt)
                        } else {
                            0
                        };
                        let dis = *disadvantage_on_construct && self.template_of(tgt).construct;
                        let total = self.save_throw(
                            tgt,
                            *ability,
                            dis,
                            cover,
                            *magical || *charm,
                            dice,
                            sink,
                        )?;
                        ctx.last_save_failed = total < dc_val;
                    }
                }
                Step::AbilityCheck { skill: _, dc, tag } => {
                    let dc_val = self.eval_dc(*dc, ctx);
                    let dis = self.unit(ctx.actor).flags.contains(UnitFlags::POISONED);
                    let mode = RollMode::from_flags(false, dis);
                    let face = self.roll_d20(ctx.actor, tag, mode, dice, sink)?;
                    ctx.last_save_failed = face < dc_val;
                }
                Step::RollDamage {
                    dice: d,
                    dmg_type,
                    slot,
                    tag,
                    upcast_extra_dice,
                    savage,
                    gwf,
                    double_on_crit,
                    combine_with_base,
                    empowerable,
                } => {
                    let mut eff_dice = if *slot == 0 {
                        ctx.weapon_damage_override.unwrap_or(*d)
                    } else {
                        *d
                    };
                    if *upcast_extra_dice != 0 && ctx.at_level > ctx.base_level {
                        eff_dice.count +=
                            *upcast_extra_dice * (ctx.at_level - ctx.base_level) as i16;
                    }
                    let count = if eff_dice.sides > 0 && *double_on_crit && ctx.crit {
                        eff_dice.count as i32 * 2
                    } else {
                        eff_dice.count as i32
                    };
                    let mut faces = if eff_dice.sides > 0 {
                        self.roll_dice(ctx.actor, tag, count, eff_dice.sides as i32, dice, sink)?
                    } else {
                        SmallVec::from_slice(&[eff_dice.count as i32])
                    };
                    let use_gwf = *gwf && self.template_of(ctx.actor).great_weapon_fighting && eff_dice.sides > 0;
                    if use_gwf {
                        apply_gwf(&mut faces);
                    }
                    if *empowerable && ctx.metamagic == Some(Metamagic::EmpoweredSpell) && eff_dice.sides > 0 {
                        self.apply_empowered_rerolls(ctx.actor, eff_dice.sides as i32, &mut faces, dice, sink)?;
                    }
                    let slot_idx = *slot as usize;
                    while ctx.damage_slots.len() <= slot_idx {
                        ctx.damage_slots.push(DamageSlot {
                            dmg_type: *dmg_type,
                            sides: 0,
                            modifier: 0,
                            faces: SmallVec::new(),
                            combine_with_base: false,
                        });
                    }
                    ctx.damage_slots[slot_idx] = DamageSlot {
                        dmg_type: *dmg_type,
                        sides: eff_dice.sides as i32,
                        modifier: eff_dice.modifier as i32,
                        faces,
                        combine_with_base: *combine_with_base,
                    };
                    // Savage Attacker runs on hit via Branch; if `savage` flag is set on a
                    // post-hit RollDamage, reroll here if eligible.
                    if *savage {
                        self.maybe_savage_attacker(ctx, slot_idx, use_gwf, dice, sink)?;
                    }
                }
                Step::ApplyDamage { slot, half_if_saved, kill_at_zero, graze_ability_mod } => {
                    if *graze_ability_mod {
                        if let Some(m) = ctx.weapon_graze_mod {
                            if m > 0 {
                                let tgt = first_target(ctx)?;
                                let dt = ctx
                                    .damage_slots
                                    .first()
                                    .map_or(Dmg::Slashing, |s| s.dmg_type);
                                self.take_damage(tgt, m, dt, false, None, Some(ctx.actor), dice, sink)?;
                            }
                        }
                        continue;
                    }
                    if !ctx.saved_per_target.is_empty() {
                        // Simultaneous multi-target area damage (e.g. Shatter)
                        let full = ctx.damage_slots[*slot as usize].total();
                        let dt = ctx.damage_slots[*slot as usize].dmg_type;
                        let pairs: SmallVec<[(UnitId, bool); 8]> = ctx
                            .targets
                            .iter()
                            .copied()
                            .zip(ctx.saved_per_target.iter().copied())
                            .collect();
                        for (tgt, saved) in pairs {
                            if saved && !*half_if_saved {
                                continue;
                            }
                            let amt = if saved { full.div_euclid(2) } else { full };
                            let mut hs = HitState { kill_at_zero: *kill_at_zero, ..Default::default() };
                            self.take_damage(tgt, amt, dt, false, Some(&mut hs), Some(ctx.actor), dice, sink)?;
                        }
                    } else {
                        let tgt = first_target(ctx)?;
                        let has_combined = ctx.damage_slots.iter().skip(1).any(|s| s.combine_with_base);
                        let mut hs = HitState { kill_at_zero: *kill_at_zero, ..Default::default() };
                        if *slot == 0 && has_combined {
                            self.apply_combined_damage(ctx, tgt, &mut hs, dice, sink)?;
                        } else {
                            let ds = &ctx.damage_slots[*slot as usize];
                            let amt = ds.total();
                            let dt = ds.dmg_type;
                            self.take_damage(tgt, amt, dt, ctx.crit, Some(&mut hs), Some(ctx.actor), dice, sink)?;
                        }
                    }
                }
                Step::Heal { dice: d, tag, revive_from_zero: _ } => {
                    let rolls = self.roll_dice(ctx.actor, tag, d.count as i32, d.sides as i32, dice, sink)?;
                    let amt = rolls.iter().sum::<i32>() + d.modifier as i32;
                    let tgt = ctx.targets.first().copied().unwrap_or(ctx.actor);
                    self.heal_unit(tgt, amt, sink);
                }
                Step::ApplyEffect {
                    kind,
                    expiry,
                    concentration,
                    to_self,
                    unless_immune_poisoned,
                    unless_immune_paralyzed,
                } => {
                    let tgt = if *to_self { ctx.actor } else { first_target(ctx)? };
                    if self.unit(tgt).flags.is_dead() {
                        continue;
                    }
                    if *unless_immune_poisoned && self.template_of(tgt).immune_poisoned {
                        continue;
                    }
                    if *unless_immune_paralyzed && self.template_of(tgt).immune_paralyzed {
                        continue;
                    }
                    if let EffectKind::Grappled { escape_dc } = *kind {
                        self.apply_grapple(ctx.actor, tgt, escape_dc);
                        continue;
                    }
                    let (eff_kind, eff_exp) = match (*kind, *expiry) {
                        (EffectKind::TimedParalyzed { .. }, _) => {
                            let own_turn = self.state.started
                                && !self.state.order.is_empty()
                                && self.current() == tgt;
                            (
                                EffectKind::TimedParalyzed { skip_current_turn: own_turn },
                                EffectExpiry::EndOfBearerTurn { skip_first: own_turn },
                            )
                        }
                        (EffectKind::InnateSorcery, EffectExpiry::GameTime(dur)) => {
                            let until = self.gt() + dur;
                            self.unit_mut(tgt).innate_until = until;
                            (EffectKind::InnateSorcery, EffectExpiry::GameTime(until))
                        }
                        (EffectKind::Dodge, _) => {
                            let eligible = !self.unit(tgt).flags.is_incapacitated()
                                && !self.unit(tgt).flags.contains(UnitFlags::GRAPPLED)
                                && self.speed_of(tgt) > 0;
                            if !eligible {
                                continue;
                            }
                            (EffectKind::Dodge, *expiry)
                        }
                        other => other,
                    };
                    self.state.effects.add(tgt, ctx.actor, eff_kind, eff_exp, *concentration, None);
                    self.refresh_flags(tgt);
                    // Losing Dodge if incapacitated (e.g. Paralyzed)
                    if matches!(eff_kind, EffectKind::TimedParalyzed { .. } | EffectKind::Paralyzed)
                        && !self.benefits_from_dodge(tgt)
                    {
                        self.state.effects.remove_kind(tgt, EffectKind::Dodge);
                        self.refresh_flags(tgt);
                    }
                }
                Step::RemoveEffect { kind, to_self } => {
                    let tgt = if *to_self { ctx.actor } else { first_target(ctx)? };
                    self.state.effects.remove_kind(tgt, *kind);
                    self.refresh_flags(tgt);
                }
                Step::MoveUnit { mode: MoveMode::Walk, .. } => {
                    // Handled by `do_move` interrupt state machine.
                }
                Step::MoveUnit { .. }
                | Step::Teleport { .. }
                | Step::SpawnZone { .. }
                | Step::SummonForce { .. } => {}
                Step::ModifyResource { resource, delta } => {
                    let u = ctx.actor;
                    let speed = self.speed_of(u);
                    let unit = self.unit_mut(u);
                    match resource {
                        ResourceKind::Action => unit.action = (unit.action + *delta as i8).max(0),
                        ResourceKind::BonusAction => unit.bonus = (unit.bonus + *delta as i8).max(0),
                        ResourceKind::Reaction => unit.reaction = (unit.reaction + *delta as i8).max(0),
                        ResourceKind::MovementAddSpeed => unit.movement += speed,
                        ResourceKind::MovementSpendHalfSpeed => {
                            unit.movement = (unit.movement - speed / 2).max(0);
                        }
                        ResourceKind::ActionSurge => {
                            unit.action_surge_left =
                                (unit.action_surge_left as i16 + *delta).max(0) as u8;
                            unit.action_surge_used = true;
                        }
                        ResourceKind::SecondWind => {
                            unit.second_wind_left =
                                (unit.second_wind_left as i16 + *delta).max(0) as u8;
                        }
                        ResourceKind::InnateSorcery => {
                            unit.innate_sorcery_left =
                                (unit.innate_sorcery_left as i16 + *delta).max(0) as u8;
                        }
                        ResourceKind::SorceryPoints => {
                            unit.sorcery_points =
                                (unit.sorcery_points as i16 + *delta).max(0) as u8;
                        }
                        ResourceKind::SpellSlot { level } => {
                            let l = (*level as usize).min(2);
                            unit.slots[l] = (unit.slots[l] as i16 + *delta).max(0) as u8;
                        }
                    }
                }
                Step::GrantReactionWindow { window } => match window {
                    ReactionWindowKind::ChampionCritMove => {
                        if ctx.crit
                            && self.template_of(ctx.actor).remarkable_athlete
                            && !self.unit(ctx.actor).flags.is_incapacitated()
                            && ctx.actor == self.current()
                        {
                            self.unit_mut(ctx.actor).champion_movement = self.speed_of(ctx.actor) / 2;
                        }
                    }
                    ReactionWindowKind::Cleave => {}
                },
                Step::Visibility { reveal } => {
                    if *reveal {
                        self.break_stealth(ctx.actor);
                    }
                }
                Step::Branch { predicate, then_steps, else_steps } => {
                    let cond = match predicate {
                        BranchPredicate::Hit => ctx.hit,
                        BranchPredicate::Miss => !ctx.hit,
                        BranchPredicate::TargetNotUndead => {
                            !self.template_of(first_target(ctx)?).undead
                        }
                        BranchPredicate::TargetNotUndeadAndNotElf => {
                            let t = self.template_of(first_target(ctx)?);
                            !t.undead && !t.elf
                        }
                        BranchPredicate::TargetSizeAtMost(max_sz) => {
                            self.template_of(first_target(ctx)?).size <= *max_sz
                        }
                        BranchPredicate::SaveFailed => ctx.last_save_failed,
                        BranchPredicate::HasAdvantage => ctx.had_adv,
                    };
                    if cond {
                        self.run_steps(then_steps, ctx, dice, sink)?;
                    } else {
                        self.run_steps(else_steps, ctx, dice, sink)?;
                    }
                }
                Step::Special(SpecialKind::DeathSave) => {
                    self.death_saving_throw(ctx.actor, dice, sink)?;
                }
                Step::Special(_) => {}
            }
        }
        Ok(())
    }

    // ------------------------------------------------------------------
    // Weapon Attacks & Spells via Canonical Step Interpreter
    // ------------------------------------------------------------------

    fn do_weapon_attack<D: DiceSource, S: EventSink>(
        &mut self,
        src: UnitId,
        atk_idx: usize,
        tgt: UnitId,
        reaction: bool,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let (to_hit, dmg_dice, graze) = self.attack_numbers(src, atk_idx);
        let (ab_id, def_savage, def_gwf, def_sap, weapon_name, dmg_type) = {
            let def = &self.template_of(src).attacks[atk_idx];
            (
                def.ability_id,
                def.savage,
                def.gwf,
                def.sap,
                def.name.clone(),
                def.damage_type,
            )
        };
        let mut ctx = ResolutionCtx {
            actor: src,
            targets: SmallVec::from_slice(&[tgt]),
            attack_idx: Some(atk_idx),
            weapon_to_hit: Some(to_hit),
            weapon_damage_override: Some(dmg_dice),
            weapon_graze_mod: graze,
            ..Default::default()
        };

        // Run compiled step program without cloning `Vec<Step>`:
        // AttackRoll -> RollDamage(base) -> Branch(Hit -> riders/saves/damage, Miss -> Graze)
        let db = Arc::clone(&self.db);
        let steps = &db.ability(ab_id).steps;
        let mut idx = 0;
        while idx < steps.len() {
            if matches!(steps[idx], Step::Branch { predicate: BranchPredicate::Hit, .. }) {
                break;
            }
            self.run_steps(&steps[idx..idx + 1], &mut ctx, dice, sink)?;
            idx += 1;
        }

        if !ctx.hit {
            // Spend resources before Graze (matches rule-18 commit order)
            self.consume_attack(src, atk_idx, reaction);
            // Run the remaining branch (handles Miss -> Graze)
            if idx < steps.len() {
                self.run_steps(&steps[idx..], &mut ctx, dice, sink)?;
            }
            self.emit_ev(
                sink,
                Event::AttackResolved {
                    attacker: EventSubject::Unit(src),
                    target: EventSubject::Unit(tgt),
                    weapon: weapon_name,
                    reaction,
                    hit: false,
                    crit: false,
                    damage: 0,
                    damage_type: dmg_type,
                },
            );
            return Ok(());
        }

        // Hit path: Savage Attacker (first weapon hit per turn)
        if def_savage {
            let use_gwf = def_gwf && self.template_of(src).great_weapon_fighting;
            self.maybe_savage_attacker(&mut ctx, 0, use_gwf, dice, sink)?;
        }

        // Run the Branch(Hit) steps: additional riders, on_hit saves, ApplyDamage, ApplyEffect
        if idx < steps.len() {
            self.run_steps(&steps[idx..], &mut ctx, dice, sink)?;
        }

        // Sap mastery on hit
        if def_sap {
            self.state.effects.remove_kind(tgt, EffectKind::Sap);
            self.state.effects.add(
                tgt,
                src,
                EffectKind::Sap,
                EffectExpiry::StartOfSourceTurn,
                false,
                None,
            );
            self.refresh_flags(tgt);
        }

        // Champion Remarkable Athlete crit movement window
        if ctx.crit
            && self.template_of(src).remarkable_athlete
            && !self.unit(src).flags.is_incapacitated()
            && src == self.current()
        {
            self.unit_mut(src).champion_movement = self.speed_of(src) / 2;
        }

        self.consume_attack(src, atk_idx, reaction);
        let dealt = ctx.damage_slots.first().map_or(0, DamageSlot::total);
        self.emit_ev(
            sink,
            Event::AttackResolved {
                attacker: EventSubject::Unit(src),
                target: EventSubject::Unit(tgt),
                weapon: weapon_name,
                reaction,
                hit: true,
                crit: ctx.crit,
                damage: dealt,
                damage_type: dmg_type,
            },
        );
        Ok(())
    }

    fn maybe_savage_attacker<D: DiceSource, S: EventSink>(
        &mut self,
        ctx: &mut ResolutionCtx,
        slot_idx: usize,
        use_gwf: bool,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let src = ctx.actor;
        if !self.template_of(src).savage_attacker {
            return Ok(());
        }
        let sides = ctx.damage_slots[slot_idx].sides;
        if sides <= 0 {
            return Ok(());
        }
        let round = self.state.round as i16;
        let turn = self.state.turn_idx;
        if self.unit(src).savage_used_round == round && self.unit(src).savage_used_turn == turn {
            return Ok(());
        }
        self.unit_mut(src).savage_used_round = round;
        self.unit_mut(src).savage_used_turn = turn;
        let count = ctx.damage_slots[slot_idx].faces.len() as i32;
        let mut second = self.roll_dice(src, "savage_attacker", count, sides, dice, sink)?;
        if use_gwf {
            apply_gwf(&mut second);
        }
        if second.iter().sum::<i32>() > ctx.damage_slots[slot_idx].faces.iter().sum::<i32>() {
            ctx.damage_slots[slot_idx].faces = second;
        }
        Ok(())
    }

    fn apply_combined_damage<D: DiceSource, S: EventSink>(
        &mut self,
        ctx: &ResolutionCtx,
        tgt: UnitId,
        hs: &mut HitState,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let base_slot = &ctx.damage_slots[0];
        let base_amt = base_slot.total();
        let base_dt = base_slot.dmg_type;
        let base_adj = self.adjusted_damage(tgt, base_amt, base_dt).unwrap_or(0);
        let mut raw: SmallVec<[(Dmg, i32); 4]> = SmallVec::new();
        raw.push((base_dt, base_amt.max(0)));
        let mut total = base_adj;
        let mut fortitude_dt = base_dt;
        let uf_bypass = self.template_of(tgt).undead_fortitude.map(|(_, b)| b);

        for slot in ctx.damage_slots.iter().skip(1) {
            if !slot.combine_with_base {
                continue;
            }
            let val = slot.total();
            let dt = slot.dmg_type;
            let before = raw.iter().find(|(d, _)| *d == dt).map_or(0, |(_, n)| *n);
            let after = before + val.max(0);
            let delta = self.adjusted_damage(tgt, after, dt).unwrap_or(0)
                - self.adjusted_damage(tgt, before, dt).unwrap_or(0);
            if let Some((_, n)) = raw.iter_mut().find(|(d, _)| *d == dt) {
                *n = after;
            } else {
                raw.push((dt, after));
            }
            total += delta;
            if delta > 0 && uf_bypass.is_some_and(|b| b.contains(dt)) {
                fortitude_dt = dt;
            }
        }
        if total > 0 {
            self.apply_adjusted_damage(
                tgt,
                total,
                fortitude_dt,
                ctx.crit,
                Some(hs),
                Some(ctx.actor),
                dice,
                sink,
            )?;
        }
        Ok(())
    }

    fn consume_attack(&mut self, src: UnitId, atk_idx: usize, reaction: bool) {
        let (pc, bonus_action, ma_group, atk_name, thrown, item, is_light) = {
            let t = self.template_of(src);
            let def = &t.attacks[atk_idx];
            let light = t.pc && def.item.is_some_and(|i| t.gear[i as usize].1 == 0.5);
            (
                t.pc,
                def.bonus_action,
                def.multiattack_group,
                def.name.clone(),
                def.thrown,
                def.item,
                light,
            )
        };
        if thrown {
            if let Some(gear_i) = item {
                if pc {
                    let spare_pos = self
                        .template_of(src)
                        .spares
                        .iter()
                        .position(|&(gi, _)| gi == gear_i);
                    let u = self.unit_mut(src);
                    match spare_pos {
                        Some(k) if k < 4 && u.spares[k] > 0 => u.spares[k] -= 1,
                        _ => u.gear_off |= 1u32 << gear_i,
                    }
                } else if (gear_i as usize) < 4 {
                    let u = self.unit_mut(src);
                    u.npc_inv[gear_i as usize] = u.npc_inv[gear_i as usize].saturating_sub(1);
                }
            }
        }
        {
            let u = self.unit_mut(src);
            if ma_group.is_some() && !reaction && !bonus_action {
                u.ma_started = true;
            }
            if reaction {
                u.reaction = (u.reaction - 1).max(0);
            } else if bonus_action {
                u.bonus = (u.bonus - 1).max(0);
            } else {
                u.action = (u.action - 1).max(0);
            }
            u.two_weapon = is_light && !u.two_weapon;
        }
        self.break_stealth(src);
        if !pc && !bonus_action && ma_group.is_some() && !reaction {
            self.narrow_multiattack(src, &atk_name);
        }
    }

    fn narrow_multiattack(&mut self, src: UnitId, used: &str) {
        let combos = self.template_of(src).multiattack.clone();
        let u = self.unit_mut(src);
        let mut new_mask = 0u8;
        let mut any_left = false;
        for (ci, combo) in combos.iter().enumerate().take(8) {
            if u.ma_combo_mask & (1u8 << ci) == 0 {
                continue;
            }
            if let Some(si) = combo
                .iter()
                .enumerate()
                .take(8)
                .position(|(si, n)| (u.ma_combo_used[ci] & (1u8 << si)) == 0 && n == used)
            {
                u.ma_combo_used[ci] |= 1u8 << si;
                new_mask |= 1u8 << ci;
                let all_done = (0..combo.len().min(8))
                    .all(|k| (u.ma_combo_used[ci] & (1u8 << k)) != 0);
                if !all_done {
                    any_left = true;
                }
            }
        }
        u.ma_combo_mask = new_mask;
        if !any_left {
            u.ma_combo_mask = 0;
            u.ma_started = false;
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn do_spell<D: DiceSource, S: EventSink>(
        &mut self,
        src: UnitId,
        spell_key: &str,
        at_level: u8,
        free: bool,
        metamagic: Option<Metamagic>,
        targets: &[UnitId],
        point: Option<Pos>,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let ab_id = self.require_ability(spell_key)?;
        let db = Arc::clone(&self.db);
        let ab = db.ability(ab_id);

        let (base_level, is_sorc, free_pool_idx) = {
            let grant = self
                .template_of(src)
                .caster
                .as_ref()
                .and_then(|c| c.grants.iter().find(|g| g.spell_key == spell_key));
            let is_sorc = grant.is_some_and(|g| g.sorcerer_spell);
            let fp = self.template_of(src).caster.as_ref().and_then(|c| {
                c.grants.iter().find_map(|g| {
                    if g.spell_key == spell_key {
                        if let SpellPayment::FreePerLongRest { pool_index, .. } = g.payment {
                            return Some(pool_index);
                        }
                    }
                    None
                })
            });
            (ab.base_level, is_sorc, fp)
        };

        if metamagic == Some(Metamagic::HeightenedSpell) {
            self.state.heightened = Some((src, false));
        }

        // Data-driven dispatch on `TargetMode` (zero hardcoded spell-name branches!)
        if matches!(ab.targeting, TargetMode::MultiDart { .. }) {
            if targets.is_empty() {
                self.state.heightened = None;
                return Err(CoreError::UnknownAction(format!(
                    "multi-dart spell {spell_key} requires at least one target"
                )));
            }
            let steps = &ab.steps;
            let split_at = steps
                .iter()
                .position(|s| matches!(s, Step::ApplyDamage { .. }))
                .unwrap_or(steps.len());
            // Roll all dart steps first, then spend cost, then apply dart damage in order.
            let mut dart_rolls: SmallVec<[(UnitId, i32, Dmg); 8]> = SmallVec::new();
            for &t in targets {
                if self.unit(t).flags.contains(UnitFlags::SHIELDED) {
                    continue;
                }
                let mut ctx = ResolutionCtx {
                    actor: src,
                    targets: SmallVec::from_slice(&[t]),
                    at_level,
                    base_level,
                    metamagic,
                    is_sorcerer_spell: is_sorc,
                    ..Default::default()
                };
                self.run_steps(&steps[..split_at], &mut ctx, dice, sink)?;
                if let Some(ds) = ctx.damage_slots.first() {
                    dart_rolls.push((t, ds.total(), ds.dmg_type));
                }
            }
            self.spend_spell_cost(src, at_level, free, free_pool_idx, metamagic);
            for (t, amt, dt) in dart_rolls {
                let mut hs = HitState::default();
                self.take_damage(t, amt, dt, false, Some(&mut hs), Some(src), dice, sink)?;
            }
            self.state.heightened = None;
            return Ok(());
        }

        let resolved_targets: SmallVec<[UnitId; 8]> = if let Some(p) = point {
            let radius = match ab.targeting {
                TargetMode::PointRadius { radius_ft, .. } => radius_ft as i32,
                _ => 10,
            };
            let sqs = self.squares_in_radius(p, radius, true);
            self.creatures_in_squares(&sqs, None)
        } else {
            if targets.is_empty() && !matches!(ab.targeting, TargetMode::SelfOnly) {
                self.state.heightened = None;
                return Err(CoreError::UnknownAction(format!(
                    "spell {spell_key} requires at least one target"
                )));
            }
            targets.iter().copied().collect()
        };

        let mut ctx = ResolutionCtx {
            actor: src,
            targets: resolved_targets,
            point,
            at_level,
            base_level,
            metamagic,
            is_sorcerer_spell: is_sorc,
            ..Default::default()
        };

        // Run resolve steps (rolls + saves), clear Heightened BEFORE commit/Undead Fortitude,
        // spend spell slot/sorcery cost, then run ApplyDamage steps!
        let steps = &ab.steps;
        let split_at = steps
            .iter()
            .position(|s| matches!(s, Step::ApplyDamage { .. }))
            .unwrap_or(steps.len());

        self.run_steps(&steps[..split_at], &mut ctx, dice, sink)?;
        self.state.heightened = None;
        self.spend_spell_cost(src, at_level, free, free_pool_idx, metamagic);
        if split_at < steps.len() {
            self.run_steps(&steps[split_at..], &mut ctx, dice, sink)?;
        }
        Ok(())
    }

    fn spend_spell_cost(
        &mut self,
        src: UnitId,
        at_level: u8,
        free: bool,
        free_pool_idx: Option<u8>,
        metamagic: Option<Metamagic>,
    ) {
        let u = self.unit_mut(src);
        u.action = (u.action - 1).max(0);
        if free {
            if let Some(pi) = free_pool_idx {
                u.free_cast_mask &= !(1u8 << pi);
            }
        } else if at_level > 0 && (at_level as usize) < u.slots.len() {
            let l = at_level as usize;
            u.slots[l] = u.slots[l].saturating_sub(1);
            u.slot_spent_this_turn = true;
        }
        if let Some(mm) = metamagic {
            let cost = mm.sorcery_cost() as u8;
            u.sorcery_points = u.sorcery_points.saturating_sub(cost);
        }
        self.break_stealth(src);
    }

    fn apply_empowered_rerolls<D: DiceSource, S: EventSink>(
        &mut self,
        caster: UnitId,
        sides: i32,
        faces: &mut SmallVec<[i32; 8]>,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let cha_mod = ability_mod(self.template_of(caster).abilities[Ability::Cha.idx()] as i32);
        let limit = cha_mod.max(1) as usize;
        let avg = (sides + 1) as f64 / 2.0;
        let mut cands: SmallVec<[(i32, usize); 8]> = SmallVec::new();
        for (di, &v) in faces.iter().enumerate() {
            if (v as f64) < avg {
                cands.push((v, di));
            }
        }
        cands.sort();
        for &(_, di) in cands.iter().take(limit) {
            let new_val = self.roll_dice(caster, "empowered_spell", 1, sides, dice, sink)?[0];
            faces[di] = new_val;
        }
        Ok(())
    }

    // ------------------------------------------------------------------
    // Attack Rolls & Saving Throws
    // ------------------------------------------------------------------

    #[allow(clippy::too_many_arguments)]
    fn step_attack_roll<D: DiceSource, S: EventSink>(
        &mut self,
        ctx: &mut ResolutionCtx,
        tgt: UnitId,
        kind: AttackKind,
        range_ft: i32,
        melee_type: bool,
        bonus_override: Option<i16>,
        tag: &str,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let src = ctx.actor;
        let ranged = matches!(kind, AttackKind::WeaponRanged | AttackKind::SpellRanged);
        let is_spell = matches!(kind, AttackKind::SpellMelee | AttackKind::SpellRanged);
        let (adv, dis) = self.attack_modifiers(
            src,
            tgt,
            ctx.attack_idx,
            ranged,
            range_ft,
            is_spell && ctx.is_sorcerer_spell,
        );
        ctx.had_adv = adv && !dis;

        // Real attack roll consumes Sap Disadvantage
        if self.unit(src).flags.contains(UnitFlags::SAPPED) {
            self.state.effects.remove_kind(src, EffectKind::Sap);
            self.refresh_flags(src);
        }

        let mode = RollMode::from_flags(adv, dis);
        let face = self.roll_d20(src, tag, mode, dice, sink)?;
        let bonus = if let Some(b) = ctx.weapon_to_hit {
            b
        } else if let Some(b) = bonus_override {
            b as i32
        } else if is_spell {
            self.template_of(src).caster.as_ref().map_or(0, |c| c.spell_attack as i32)
        } else {
            0
        };
        let total = face + bonus;

        let ac = self.attack_ac(self.unit(src).pos, tgt);
        let nat20 = face == 20;
        let nat1 = face == 1;
        let critical_roll = nat20 || (!is_spell && self.template_of(src).improved_critical && face >= 19);
        let mut crit = critical_roll;
        if !crit
            && !is_spell
            && melee_type
            && (self.unit(tgt).flags.contains(UnitFlags::PARALYZED)
                || self.unit(tgt).flags.is_unconscious())
            && self.unit(src).pos.feet_to(self.unit(tgt).pos) <= 5
        {
            crit = true;
        }
        let hit = if critical_roll {
            true
        } else if nat1 {
            false
        } else {
            total >= ac
        };
        ctx.hit = hit;
        ctx.crit = crit;
        Ok(())
    }

    fn attack_modifiers(
        &self,
        src: UnitId,
        tgt: UnitId,
        attack_idx: Option<usize>,
        ranged: bool,
        normal_range_ft: i32,
        sorcerer_spell: bool,
    ) -> (bool, bool) {
        let mut adv = false;
        let mut dis = false;
        let sf = self.unit(src).flags;
        let tf = self.unit(tgt).flags;

        if sorcerer_spell && self.innate_active(src) {
            adv = true;
        }
        if let Some(ai) = attack_idx {
            if self.template_of(src).attacks[ai].adv_if_grappled_by_source
                && self.is_grappled_by(tgt, src)
            {
                adv = true;
            }
        }
        if sf.contains(UnitFlags::PRONE) {
            dis = true;
        }
        if sf.contains(UnitFlags::POISONED) {
            dis = true;
        }
        if sf.contains(UnitFlags::RESTRAINED) {
            dis = true;
        }
        if tf.contains(UnitFlags::RESTRAINED) {
            adv = true;
        }
        if sf.contains(UnitFlags::GRAPPLED) && !self.is_grappled_by(src, tgt) {
            dis = true;
        }
        if tf.contains(UnitFlags::PARALYZED) || tf.is_unconscious() {
            adv = true;
        }
        if tf.contains(UnitFlags::PRONE) {
            if self.unit(src).pos.feet_to(self.unit(tgt).pos) <= 5 {
                adv = true;
            } else {
                dis = true;
            }
        }
        let visible_to_target = self.can_see(tgt, src);
        if self.benefits_from_dodge(tgt) && visible_to_target {
            dis = true;
        }
        if !visible_to_target {
            adv = true;
        }
        if !self.can_see(src, tgt) {
            dis = true;
        }
        if sf.contains(UnitFlags::SAPPED) {
            dis = true;
        }
        if ranged {
            let threatened = (0..self.state.units.len()).any(|i| {
                let o = UnitId(i as u8);
                self.opposing(o, src)
                    && !self.unit(o).flags.is_incapacitated()
                    && self.unit(o).pos.feet_to(self.unit(src).pos) <= 5
                    && self.can_see(o, src)
            });
            if threatened {
                dis = true;
            }
            if self.unit(src).pos.feet_to(self.unit(tgt).pos) > normal_range_ft {
                dis = true;
            }
        }
        (adv, dis)
    }

    fn eval_dc(&self, dc: DcExpr, ctx: &ResolutionCtx) -> i32 {
        match dc {
            DcExpr::Fixed(v) => v as i32,
            DcExpr::SpellDc => {
                let base = self
                    .template_of(ctx.actor)
                    .caster
                    .as_ref()
                    .map_or(10, |c| c.spell_dc as i32);
                base + i32::from(ctx.is_sorcerer_spell && self.innate_active(ctx.actor))
            }
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn save_throw<D: DiceSource, S: EventSink>(
        &mut self,
        u: UnitId,
        ab: Ability,
        disadvantage: bool,
        cover: i32,
        _is_magical: bool,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<i32, CoreError> {
        if matches!(ab, Ability::Str | Ability::Dex) && self.unit(u).flags.contains(UnitFlags::PARALYZED) {
            return Ok(1);
        }
        let m = self.save_mod(u, ab) + cover;
        let adv = ab == Ability::Dex && self.benefits_from_dodge(u);
        let mut dis = disadvantage || (ab == Ability::Dex && self.unit(u).flags.contains(UnitFlags::RESTRAINED));
        if let Some((caster, used)) = self.state.heightened {
            if !used && caster != u && self.opposing(caster, u) {
                self.state.heightened = Some((caster, true));
                dis = true;
            }
        }
        let mode = RollMode::from_flags(adv, dis);
        let face = self.roll_d20(u, ab.save_tag(), mode, dice, sink)?;
        Ok(face + m)
    }

    // ------------------------------------------------------------------
    // Movement & Nested Opportunity Attack Interrupt State Machine
    // ------------------------------------------------------------------

    fn do_move<D: DiceSource, S: EventSink>(
        &mut self,
        mover: UnitId,
        path: &[Pos],
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let moves = self.prepare_move(mover, path);
        let champion_fits = self.champion_move_fits(mover, path);
        if champion_fits {
            self.commit_move_prefix(mover, &moves, false, sink);
            return Ok(());
        }
        self.unit_mut(mover).champion_movement = 0;
        let oas = self.opportunity_attacks(mover, &moves);
        if oas.is_empty() {
            self.commit_move_prefix(mover, &moves, false, sink);
            return Ok(());
        }
        self.advance_move_with_oas(mover, moves, 0, oas, dice, sink)
    }

    fn champion_move_fits(&self, src: UnitId, path: &[Pos]) -> bool {
        let budget = (self.unit(src).champion_movement as i32).div_euclid(5);
        budget > 0
            && path.first() == Some(&self.unit(src).pos)
            && path.windows(2).all(|w| w[0].chebyshev(w[1]) == 1)
            && self.move_prefix(src, path, budget, false).0.len() == path.len()
    }

    fn advance_move_with_oas<D: DiceSource, S: EventSink>(
        &mut self,
        mover: UnitId,
        moves: SmallVec<[Pos; 16]>,
        mut cursor: usize,
        mut oas: SmallVec<[(UnitId, u8); 8]>,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        while !oas.is_empty() {
            let (reactor, idx_u8) = oas.remove(0);
            let index = idx_u8 as usize;
            if index.saturating_sub(1) > cursor {
                self.commit_move_prefix(mover, &moves[cursor..index], true, sink);
                cursor = index - 1;
            }
            let was_prone = self.unit(mover).flags.contains(UnitFlags::PRONE);
            let opts = self.oa_options(reactor, mover);
            if opts.is_empty() {
                continue;
            }
            match self.state.reaction_mode {
                ReactionMode::Interactive => {
                    self.push_interrupt(
                        InterruptKind::OpportunityAttack,
                        reactor,
                        mover,
                        opts,
                        ActionContinuation::MoveResume {
                            mover,
                            path: moves,
                            cursor: cursor as u8,
                            trigger_index: idx_u8,
                            was_prone,
                            remaining_oas: oas,
                        },
                    );
                    return Ok(());
                }
                ReactionMode::Auto => {
                    // Pick first best weapon option (expected value order matches Phase 0 auto policy)
                    let chosen = self.auto_choose_oa(reactor, &opts);
                    if let ReactionOption::OpportunityAttack { attack_idx, target } = chosen {
                        self.emit_ev(
                            sink,
                            Event::ReactionTriggered {
                                reactor,
                                kind: "opportunity_attack".into(),
                            },
                        );
                        self.do_weapon_attack(reactor, attack_idx as usize, target, true, dice, sink)?;
                        self.expire_timed_conditions();
                    }
                    if !self.unit(mover).flags.is_conscious()
                        || (self.unit(mover).flags.contains(UnitFlags::PRONE) && !was_prone)
                    {
                        self.commit_move_prefix(mover, &moves[cursor..index], false, sink);
                        return Ok(());
                    }
                }
            }
        }
        self.commit_move_prefix(mover, &moves[cursor..], false, sink);
        Ok(())
    }

    pub(crate) fn resolve_interrupt_frame<D: DiceSource, S: EventSink>(
        &mut self,
        frame: InterruptFrame,
        selected: ReactionOption,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        match selected {
            ReactionOption::OpportunityAttack { attack_idx, target } => {
                self.emit_ev(
                    sink,
                    Event::ReactionTriggered {
                        reactor: frame.reactor,
                        kind: "opportunity_attack".into(),
                    },
                );
                self.do_weapon_attack(frame.reactor, attack_idx as usize, target, true, dice, sink)?;
                self.expire_timed_conditions();
            }
            ReactionOption::Decline => {}
        }
        match frame.continuation {
            ActionContinuation::MoveResume {
                mover,
                path,
                cursor,
                trigger_index,
                was_prone,
                remaining_oas,
            } => {
                let c = cursor as usize;
                let idx = trigger_index as usize;
                if !self.unit(mover).flags.is_conscious()
                    || (self.unit(mover).flags.contains(UnitFlags::PRONE) && !was_prone)
                {
                    self.commit_move_prefix(mover, &path[c..idx], false, sink);
                    return Ok(());
                }
                self.advance_move_with_oas(mover, path, c, remaining_oas, dice, sink)?;
            }
            ActionContinuation::None => {}
        }
        Ok(())
    }

    fn auto_choose_oa(&self, reactor: UnitId, opts: &[ReactionOption]) -> ReactionOption {
        let mut best = opts[0];
        let mut best_ev = f64::NEG_INFINITY;
        for &opt in opts {
            if let ReactionOption::OpportunityAttack { attack_idx, .. } = opt {
                let (_, dmg, _) = self.attack_numbers(reactor, attack_idx as usize);
                let mut ev = if dmg.sides > 0 {
                    dmg.count as f64 * (dmg.sides as f64 + 1.0) / 2.0 + dmg.modifier as f64
                } else {
                    (dmg.count + dmg.modifier) as f64
                };
                for &(rd, _) in &self.template_of(reactor).attacks[attack_idx as usize].additional {
                    ev += rd.count as f64 * (rd.sides as f64 + 1.0) / 2.0 + rd.modifier as f64;
                }
                if ev > best_ev {
                    best_ev = ev;
                    best = opt;
                }
            }
        }
        best
    }

    fn commit_move_prefix<S: EventSink>(
        &mut self,
        src: UnitId,
        moves: &[Pos],
        in_transit: bool,
        sink: &mut S,
    ) {
        if self.unit(src).flags.is_unconscious() || self.unit(src).flags.is_dead() {
            self.unit_mut(src).movement = 0;
            return;
        }
        if moves.is_empty() {
            return;
        }
        let budget = (self.unit(src).available_movement() as i32).div_euclid(5);
        let (mut seg, rest) = self.move_prefix(src, moves, budget, in_transit);
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
        self.move_to(src, dest);
        let cost_ft = (cost * 5) as i16;
        if champion_move {
            self.unit_mut(src).champion_movement -= cost_ft;
        } else {
            self.unit_mut(src).champion_movement = 0;
            self.unit_mut(src).movement -= cost_ft;
        }
        if self.is_grappling(src) {
            let dragged = self.grappling_targets(src);
            for (i, t) in dragged.into_iter().enumerate() {
                let lag = i + 1;
                if seg.len() > lag {
                    let target_dest = seg[seg.len() - 1 - lag];
                    self.move_to(t, target_dest);
                }
            }
        }
        if seg.len() > 1 {
            let mut ev_path = SmallVec::new();
            for &p in &seg {
                ev_path.push(p);
            }
            self.emit_ev(sink, Event::UnitMoved { unit: src, path: ev_path, cost_ft });
        }
    }

    fn move_to(&mut self, u: UnitId, dest: Pos) {
        let from = self.unit(u).pos;
        let fi = self.grid.index(from);
        let di = self.grid.index(dest);
        if self.state.occ[fi] == u.0 {
            let replacement = self
                .state
                .units
                .iter()
                .enumerate()
                .find(|(i, unit)| *i != u.idx() && unit.pos == from && !unit.flags.is_dead())
                .map_or(0xFF, |(i, _)| i as u8);
            self.state.occ[fi] = replacement;
        }
        if !self.unit(u).flags.is_dead() {
            self.state.occ[di] = u.0;
        }
        self.unit_mut(u).pos = dest;
    }

    // ------------------------------------------------------------------
    // Damage, Undead Fortitude, Death Saves, Healing
    // ------------------------------------------------------------------

    fn adjusted_damage(&self, u: UnitId, dmg: i32, dt: Dmg) -> Option<i32> {
        let t = self.template_of(u);
        if t.dmg_immune.contains(dt) {
            return None;
        }
        let amount = match (t.dmg_resist.contains(dt), t.dmg_vuln.contains(dt)) {
            (true, false) => dmg.div_euclid(2),
            (false, true) => dmg * 2,
            _ => dmg,
        };
        Some(amount.max(0))
    }

    #[allow(clippy::too_many_arguments)]
    fn take_damage<D: DiceSource, S: EventSink>(
        &mut self,
        u: UnitId,
        dmg: i32,
        dt: Dmg,
        critical: bool,
        hit_state: Option<&mut HitState>,
        attacker: Option<UnitId>,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<Option<i32>, CoreError> {
        let Some(total) = self.adjusted_damage(u, dmg, dt) else {
            return Ok(None);
        };
        self.apply_adjusted_damage(u, total, dt, critical, hit_state, attacker, dice, sink)
    }

    #[allow(clippy::too_many_arguments)]
    fn apply_adjusted_damage<D: DiceSource, S: EventSink>(
        &mut self,
        u: UnitId,
        mut total: i32,
        dt: Dmg,
        critical: bool,
        mut hit_state: Option<&mut HitState>,
        attacker: Option<UnitId>,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<Option<i32>, CoreError> {
        let temp_before = self.unit(u).temp_hp as i32;
        if total > 0 && temp_before > 0 {
            let absorbed = total.min(temp_before);
            total -= absorbed;
            self.unit_mut(u).temp_hp -= absorbed as i16;
        }
        let already_down = self.unit(u).flags.is_unconscious() || self.unit(u).flags.is_dead();
        let kill_at_zero = !already_down && hit_state.as_deref().is_some_and(|h| h.kill_at_zero);
        let new_hp = self.unit(u).hp as i32 - total;
        self.unit_mut(u).hp = new_hp as i16;
        let mut overflow = (-new_hp).max(0);
        if let Some(h) = hit_state.as_deref_mut() {
            if overflow > 0 {
                overflow += h.overflow;
                h.overflow = overflow;
            }
        }
        if new_hp <= 0 && total > 0 && !already_down {
            if self.try_undead_fortitude(u, total, dt, critical, dice, sink)? {
                overflow = 0;
                if let Some(h) = hit_state.as_deref_mut() {
                    h.overflow = 0;
                }
            }
        }
        let counted = hit_state.as_deref().is_some_and(|h| h.death_fail_counted);
        if let Some(h) = hit_state.as_deref_mut() {
            if total > 0 {
                h.death_fail_counted = true;
            }
        }
        if self.unit(u).flags.is_unconscious() && !counted {
            self.state.effects.remove_kind(u, EffectKind::Stable);
            let failures = if critical { 2 } else { 1 };
            self.unit_mut(u).death_fails += failures;
            if self.unit(u).death_fails >= 3 {
                self.make_dead(u, sink);
                self.unit_mut(u).death_saves = 0;
                self.unit_mut(u).death_fails = 0;
            }
            self.refresh_flags(u);
        }
        let hp = self.unit(u).hp as i32;
        let max_now = self.max_hp_of(u);
        if self.unit(u).flags.is_dead() {
        } else if hp <= 0 && kill_at_zero {
            self.make_dead(u, sink);
        } else if hp < 0 && overflow >= max_now {
            self.make_dead(u, sink);
        } else if hp <= 0 {
            if already_down {
            } else if !self.template_of(u).pc {
                self.make_dead(u, sink);
            } else {
                self.make_unconscious(u, sink);
            }
        }
        if self.unit(u).hp <= 0 {
            self.unit_mut(u).hp = 0;
        }
        self.emit_ev(
            sink,
            Event::DamageDealt {
                source: attacker.map(EventSubject::Unit),
                target: EventSubject::Unit(u),
                amount: total,
                damage_type: dt,
            },
        );
        Ok(Some(total))
    }

    fn try_undead_fortitude<D: DiceSource, S: EventSink>(
        &mut self,
        u: UnitId,
        damage: i32,
        dt: Dmg,
        critical: bool,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<bool, CoreError> {
        let Some((dc_base, bypass)) = self.template_of(u).undead_fortitude else {
            return Ok(false);
        };
        if damage <= 0 || critical || bypass.contains(dt) {
            return Ok(false);
        }
        let dc = dc_base as i32 + damage;
        let total = self.save_throw(u, Ability::Con, false, 0, false, dice, sink)?;
        if total >= dc {
            self.unit_mut(u).hp = 1;
            return Ok(true);
        }
        Ok(false)
    }

    fn apply_prone(&mut self, u: UnitId) {
        if !self.template_of(u).immune_prone {
            self.state.effects.add_unique(u, u, EffectKind::Prone, EffectExpiry::Manual);
            self.refresh_flags(u);
        }
    }

    fn make_dead<S: EventSink>(&mut self, u: UnitId, sink: &mut S) {
        if self.unit(u).flags.is_dead() {
            return;
        }
        self.drop_all_grapples(u);
        self.release_all_grapplers_of(u);
        // Clear Hidden before emitting UnitFell (structural Leak H prevention!)
        self.break_stealth(u);
        let pos = self.unit(u).pos;
        self.state.effects.add_unique(u, u, EffectKind::Dead, EffectExpiry::Manual);
        self.apply_prone(u);
        self.state.effects.remove_kind(u, EffectKind::Stable);
        self.state.effects.remove_kind(u, EffectKind::Unconscious);
        self.refresh_flags(u);
        let cell = self.grid.index(pos);
        if self.state.occ[cell] == u.0 {
            let replacement = self
                .state
                .units
                .iter()
                .enumerate()
                .find(|(_, other)| other.pos == pos && !other.flags.is_dead())
                .map_or(0xFF, |(i, _)| i as u8);
            self.state.occ[cell] = replacement;
        }
        self.emit_ev(sink, Event::UnitFell { unit: u, dead: true });
    }

    fn make_unconscious<S: EventSink>(&mut self, u: UnitId, sink: &mut S) {
        if self.unit(u).flags.is_unconscious() || self.unit(u).flags.is_dead() {
            return;
        }
        self.drop_all_grapples(u);
        self.apply_prone(u);
        self.state
            .effects
            .add_unique(u, u, EffectKind::Unconscious, EffectExpiry::Manual);
        self.state.effects.remove_kind(u, EffectKind::Stable);
        self.refresh_flags(u);
        self.lose_dodge_if_ineligible(u);
        self.emit_ev(sink, Event::UnitFell { unit: u, dead: false });
    }

    fn do_escape_grapple<D: DiceSource, S: EventSink>(
        &mut self,
        src: UnitId,
        grappler: UnitId,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let ath = self.template_of(src).athletics_mod as i32;
        let acr = self.template_of(src).acrobatics_mod as i32;
        let (tag, bonus) = if ath > acr { ("athletics", ath) } else { ("acrobatics", acr) };
        let dis = self.unit(src).flags.contains(UnitFlags::POISONED);
        let face = self.roll_d20(src, tag, RollMode::from_flags(false, dis), dice, sink)?;
        let total = face + bonus;
        let escape_dc = self
            .grapplers_of(src)
            .into_iter()
            .find(|&(g, _)| g == grappler)
            .and_then(|(_, dc)| dc);
        let escaped = match escape_dc {
            Some(dc) => total >= dc as i32,
            None => {
                let g_ath = self.template_of(grappler).athletics_mod as i32;
                let g_dis = self.unit(grappler).flags.contains(UnitFlags::POISONED);
                let g_face = self.roll_d20(
                    grappler,
                    "athletics",
                    RollMode::from_flags(false, g_dis),
                    dice,
                    sink,
                )?;
                total > g_face + g_ath
            }
        };
        if escaped {
            self.release_grapple(grappler, src);
        }
        self.unit_mut(src).action = (self.unit(src).action - 1).max(0);
        Ok(())
    }

    fn heal_unit<S: EventSink>(&mut self, u: UnitId, amount: i32, sink: &mut S) {
        if self.unit(u).flags.is_dead() {
            return;
        }
        let mhp = self.max_hp_of(u);
        let cur_hp = self.unit(u).hp as i32;
        let new_hp = mhp.min(cur_hp + amount);
        self.unit_mut(u).hp = new_hp as i16;
        if new_hp > 0 && amount > 0 {
            self.unit_mut(u).death_saves = 0;
            self.unit_mut(u).death_fails = 0;
            if self.unit(u).flags.is_unconscious() {
                self.state.effects.remove_kind(u, EffectKind::Unconscious);
                self.state.effects.remove_kind(u, EffectKind::Stable);
                self.refresh_flags(u);
            }
        }
        self.emit_ev(sink, Event::Healed { target: u, amount: (new_hp - cur_hp).max(0) });
    }

    fn death_saving_throw<D: DiceSource, S: EventSink>(
        &mut self,
        u: UnitId,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<(), CoreError> {
        let face = self.roll_d20(u, "death_saving_throw", RollMode::Normal, dice, sink)?;
        let passed = face != 1 && face >= 10;
        let (mut regained_hp, mut stabilized, mut died) = (false, false, false);
        if face == 20 {
            self.state.effects.remove_kind(u, EffectKind::Unconscious);
            self.state.effects.remove_kind(u, EffectKind::Stable);
            self.refresh_flags(u);
            self.heal_unit(u, 1, sink);
            regained_hp = true;
        } else if passed {
            self.unit_mut(u).death_saves += 1;
            if self.unit(u).death_saves >= 3 {
                self.unit_mut(u).death_saves = 0;
                self.unit_mut(u).death_fails = 0;
                self.state.effects.add_unique(u, u, EffectKind::Stable, EffectExpiry::Manual);
                self.refresh_flags(u);
                stabilized = true;
            }
        } else {
            self.unit_mut(u).death_fails += if face == 1 { 2 } else { 1 };
            if self.unit(u).death_fails >= 3 {
                self.make_dead(u, sink);
                self.unit_mut(u).death_saves = 0;
                self.unit_mut(u).death_fails = 0;
                died = true;
            }
        }
        self.emit_ev(
            sink,
            Event::DeathSaveRolled { unit: u, face, regained_hp, stabilized, died },
        );
        Ok(())
    }

    fn break_stealth(&mut self, u: UnitId) {
        if self.unit(u).hidden_stealth >= 0 {
            self.unit_mut(u).hidden_stealth = -1;
            self.state.effects.remove_kind(u, EffectKind::Hidden { stealth_total: 0 });
            self.state.effects.entries.retain(|e| {
                !(e.target == u && matches!(e.kind, EffectKind::Hidden { .. }))
            });
            self.refresh_flags(u);
        }
    }

    // ------------------------------------------------------------------
    // Area Geometry (`squares_in_radius`, `creatures_in_squares`)
    // ------------------------------------------------------------------

    pub(crate) fn squares_in_radius(&self, center: Pos, radius_ft: i32, require_los: bool) -> Vec<Pos> {
        let r = (radius_ft / 5).max(0) as i16;
        let mut out = Vec::new();
        for x in (center.x - r)..=(center.x + r) {
            for y in (center.y - r)..=(center.y + r) {
                let p = Pos::new(x, y);
                if !self.grid.in_bounds(p) {
                    continue;
                }
                if require_los && p != center && !self.grid.clear_effect(center, p) {
                    continue;
                }
                out.push(p);
            }
        }
        out.sort();
        out
    }

    fn creatures_in_squares(
        &self,
        squares: &[Pos],
        exclude: Option<UnitId>,
    ) -> SmallVec<[UnitId; 8]> {
        let mut found: SmallVec<[UnitId; 8]> = SmallVec::new();
        for &p in squares {
            if let Some(c) = self.token_at(p) {
                if Some(c) != exclude && !self.unit(c).flags.is_dead() && !found.contains(&c) {
                    found.push(c);
                }
                for (i, u) in self.state.units.iter().enumerate() {
                    let other = UnitId(i as u8);
                    if other != c
                        && Some(other) != exclude
                        && !u.flags.is_dead()
                        && u.pos == p
                        && !found.contains(&other)
                    {
                        found.push(other);
                    }
                }
            }
        }
        found
    }
}

/// SRD 5.2.1 Great Weapon Fighting: treat any 1 or 2 on weapon damage dice as 3.
#[inline]
fn apply_gwf(faces: &mut [i32]) {
    for v in faces {
        if *v <= 2 {
            *v = 3;
        }
    }
}
