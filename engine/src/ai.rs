//! The native AI: natural20's `GenericController` with the undead scenario's
//! `UndeadController` (canonical candidate order, scenario whitelist and
//! score adjustments).
//!
//! Salvage note: the decision procedure follows `ember-engine`'s native-v1
//! port (`crates/ember/src/native_v1.rs`, 99.96% agreement in phase 1), here
//! rewritten against natural20's own action lists so candidate sets, scores
//! and random draws match exactly.
//!
//! Scoring rolls dice: `AttackAction.compute_hit_probability` and
//! `avg_damage` build a `DieRoll` (consuming the RNG) before taking its
//! probability or mean. Candidates are scored in canonical order, so the
//! draw sequence is reproducible.

use std::collections::VecDeque;

use crate::dice::{expected, expected_die, plus_string_modifier, prob_at_least, save_fail_chance};
use crate::engine::{Act, Fight};
use crate::map::Pos;
use crate::path::PathCompute;
use crate::tape::Ev;

// A legal option that the native monster policy will never choose.
const SKIP_NATIVE: f64 = -1000.0;

/// What `_observe_enemies` sees: visible conscious enemies with a path.
pub struct Observed {
    /// (enemy, position, path has at least two cells)
    pub enemies: Vec<(usize, Pos, bool)>,
}

/// Python `str(path)` of a move path, used by the canonical sort key.
fn path_repr(path: &[Pos]) -> String {
    let cells: Vec<String> = path.iter().map(|p| format!("[{}, {}]", p.0, p.1)).collect();
    format!("[{}]", cells.join(", "))
}

/// `GeneralController._canonical_key` for the scenario's action types:
/// (action_type, spell, weapon, sorted target ids, point, metamagic,
/// at_level, mode, move_path, thrown), all as Python compares them (a
/// thrown attack sorts after the same weapon's melee attack).
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
struct CanonKey {
    kind: &'static str,
    spell: &'static str,
    weapon: &'static str,
    ids: Vec<String>,
    point: Vec<i32>,
    mm: &'static str,
    at_level: String,
    mode: &'static str,
    path: String,
    thrown: bool,
    paid: bool,
}

/// Cached progress searches of move scoring (see `sort_with_scores`).
#[derive(Clone, Debug, Default)]
pub struct MoveCache {
    valid: bool,
    prone: bool,
    flying: bool,
    token_size: u8,
    squeezed: bool,
    targets: Vec<Pos>,
    mask: crate::map::Bits,
    /// By cell: the destination's `min_steps_to_multiple`, once computed.
    steps: Vec<Option<Option<i32>>>,
    occupied: crate::map::Bits,
    landings: crate::map::Bits,
    reach: i32,
    pursuit: Vec<u16>,
}

impl Fight {
    fn canon_key(&self, src: usize, act: &Act) -> CanonKey {
        let mut k = CanonKey {
            kind: act.kind(),
            spell: "None",
            weapon: "",
            ids: Vec::new(),
            point: Vec::new(),
            mm: "None",
            at_level: "None".to_string(),
            mode: "None",
            path: String::new(),
            thrown: false,
            paid: false,
        };
        match act {
            Act::Move(path) => k.path = path_repr(path),
            Act::Attack { atk, target, .. } => {
                let def = &self.units[src].t.attacks[*atk];
                k.weapon = def.name;
                k.thrown = def.thrown;
                k.ids = vec![self.units[*target].id.clone()];
            }
            // no target and `action.target` None: the square is not part of
            // the key (blind variants of one weapon keep their build order)
            Act::BlindAttack { atk, .. } => {
                let def = &self.units[src].t.attacks[*atk];
                k.weapon = def.name;
                k.thrown = def.thrown;
            }
            Act::Spell(c) => {
                k.spell = c.spell.key();
                let mut ids: Vec<String> = c.targets.iter().map(|&t| self.units[t].id.clone()).collect();
                ids.sort();
                k.ids = ids;
                if let Some(p) = c.point {
                    k.point = vec![p.0, p.1];
                }
                if let Some(mm) = c.mm {
                    k.mm = mm.key();
                }
                k.at_level = c.at_level.to_string();
                k.paid = self.rule_version >= 9 && !c.free;
            }
            Act::DivineSpark { target, heal, .. } => {
                k.ids = vec![self.units[*target].id.clone()];
                k.mode = if *heal { "heal" } else { "harm" };
            }
            Act::CreateSpellSlot { level } | Act::ConvertSpellSlot { level } => k.at_level = level.to_string(),
            Act::SpiritualWeaponMove { to } => k.point = vec![to.0, to.1],
            Act::SpiritualWeaponAttack { target } => k.ids = vec![self.units[*target].id.clone()],
            Act::RedirectAttack { ally, .. } => k.ids = vec![self.units[*ally].id.clone()],
            // `CleaveAttackAction.using` is the weapon
            Act::Cleave { atk, target } => {
                k.weapon = self.units[src].t.attacks[*atk].name;
                k.ids = vec![self.units[*target].id.clone()];
            }
            Act::FirstAid { target }
            | Act::EscapeGrapple { target }
            | Act::BreakFree { target }
            | Act::DropGrapple { target }
            | Act::BardicInspiration { target } => {
                k.ids = vec![self.units[*target].id.clone()];
            }
            Act::NpcAreaAbility { idx, target } => {
                k.weapon = self.units[src].t.area_abilities[*idx].name;
                if let Some(p) = target {
                    k.point = vec![p.0, p.1];
                }
            }
            Act::NpcTeleport { idx, dest } => {
                k.weapon = self.units[src].t.teleports[*idx].name;
                k.point = vec![dest.0, dest.1];
            }
            _ => {}
        }
        k
    }

    /// `GenericController._observe_enemies` (with its memory update).
    pub fn observe_enemies(&mut self, u: usize) -> Observed {
        let mut enemies = Vec::new();
        let upos = self.units[u].pos;
        if !self.any_large {
            for o in 0..self.units.len() {
                if o == u || !self.can_see(u, o) {
                    continue;
                }
                if !self.units[o].conscious() || !self.opposing(u, o) {
                    continue;
                }
                let opos = self.units[o].pos;
                // compute_path(ignore_opposing=True): only walls block, so a path
                // exists within one component; it has >= 2 cells unless same cell.
                let ok = (self.incorporeal(u) || self.reachable(upos, opos)) && upos != opos;
                enemies.push((o, opos, ok));
            }
        } else {
            self.collect_observed_enemies_multisquare(u, &mut enemies);
        }
        if self.rule_version >= 17 {
            let existing: Vec<(usize, Pos)> = self.units[u].mem.known.clone();
            let mut drop_known: Vec<usize> = Vec::new();
            let mut drop_inv: Vec<Pos> = Vec::new();
            let mut add_inv: Vec<Pos> = Vec::new();
            for (k, last_loc) in existing {
                if enemies.iter().any(|(e, _, _)| *e == k) {
                    continue;
                }
                let gone = self.units[k].dead() || (!self.units[k].conscious() && self.can_see(u, k));
                if gone || self.sees_lit_square(u, last_loc) {
                    drop_known.push(k);
                    drop_inv.push(last_loc);
                } else {
                    add_inv.push(last_loc);
                }
            }
            let visible_inv: Vec<Pos> = self.units[u]
                .mem
                .investigate
                .iter()
                .map(|(p, _)| *p)
                .filter(|&p| self.sees_lit_square(u, p))
                .collect();
            let mem = &mut self.units[u].mem;
            for &(e, loc, _) in &enemies {
                if let Some(entry) = mem.known.iter_mut().find(|(k, _)| *k == e) {
                    entry.1 = loc;
                } else {
                    mem.known.push((e, loc));
                }
                if let Some(i) = mem.investigate.iter().position(|(p, _)| *p == loc) {
                    mem.investigate.remove(i);
                }
            }
            mem.known.retain(|(k, _)| !drop_known.contains(k));
            mem.investigate.retain(|(p, _)| !drop_inv.contains(p) && !visible_inv.contains(p));
            for loc in add_inv {
                if !mem.investigate.iter().any(|(p, _)| *p == loc) {
                    mem.investigate.push((loc, 0));
                }
            }
            return Observed { enemies };
        }
        let mem = &mut self.units[u].mem;
        for &(e, loc, _) in &enemies {
            if let Some(entry) = mem.known.iter_mut().find(|(k, _)| *k == e) {
                entry.1 = loc;
            } else {
                mem.known.push((e, loc));
            }
            if let Some(i) = mem.investigate.iter().position(|(p, _)| *p == loc) {
                mem.investigate.remove(i);
            }
        }
        let invisible: Vec<Pos> =
            mem.known.iter().filter(|(k, _)| !enemies.iter().any(|(e, _, _)| e == k)).map(|(_, p)| *p).collect();
        for loc in invisible {
            if !mem.investigate.iter().any(|(p, _)| *p == loc) {
                mem.investigate.push((loc, 0));
            }
        }
        Observed { enemies }
    }

    /// Attack candidates: every attack the creature can make now x every
    /// valid target (`_player_character_attack_actions` /
    /// `generate_npc_attack_actions` + `Battle.valid_targets_for`).
    fn attack_candidates(&self, u: usize, opportunity: bool, out: &mut Vec<Act>) {
        let unit = &self.units[u];
        if opportunity && unit.reaction <= 0 {
            return;
        }
        for (ai, def) in unit.t.attacks.iter().enumerate() {
            if opportunity && (def.ranged || def.save_attack.is_some() || def.bonus_action) {
                continue;
            }
            if !opportunity && !self.can_attack(u, ai) {
                continue;
            }
            if !self.attack_available(u, ai) {
                continue;
            }
            for t in 0..self.units.len() {
                if t == u || !self.opposing(u, t) || self.units[t].dead() {
                    continue;
                }
                if !self.can_see(u, t) {
                    continue;
                }
                if self.dist(u, t) * 5 > def.range_max {
                    continue;
                }
                // `attack_target_issue`: charmed, save_immune, target_if
                if !self.attack_target_allowed(u, t, def) {
                    continue;
                }
                out.push(Act::Attack { atk: ai, target: t, reaction: opportunity });
            }
        }
    }

    /// Whether a blind weapon attack can reach a sensed square, regardless of its occupant.
    pub(crate) fn can_blind_attack_square(&self, origin: Pos, target: Pos, range_ft: i32) -> bool {
        if target == origin || !self.grid.in_bounds(target.0, target.1) || self.grid.is_wall(target.0, target.1)
            || self.square_distance(origin, target) * 5 > range_ft {
            return false;
        }
        if self.rule_version >= 15 {
            !self.grid.is_wall(origin.0, origin.1) && self.grid.corner_wall_grade(origin, target) < 4
        } else {
            self.grid.line_of_effect(origin, target)
        }
    }

    #[cold]
    #[inline(never)]
    fn collect_observed_enemies_multisquare(&self, u: usize, enemies: &mut Vec<(usize, Pos, bool)>) {
        let upos = self.units[u].pos;
        let token_size = self.units[u].t.token_size;
        let mut multi_pc = if token_size > 1 {
            let mut pc = PathCompute::new(&self.grid, self.units[u].prone(), self.units[u].t.fly, self.occupied_mask(u));
            pc.incorporeal = self.incorporeal(u);
            pc.solid_wall_corners = self.rule_version >= 8;
            pc.token_size = token_size;
            pc.eff_size = self.effective_token_size(u);
            pc.allow_squeeze = self.rule_version >= 21;
            Some(pc)
        } else {
            None
        };
        for o in 0..self.units.len() {
            if o == u || !self.can_see(u, o) {
                continue;
            }
            if !self.units[o].conscious() || !self.opposing(u, o) {
                continue;
            }
            let opos = self.units[o].pos;
            let ok = if let Some(pc) = multi_pc.as_mut() {
                upos != opos && pc.compute_path(upos, opos).is_some_and(|p| p.len() >= 2)
            } else {
                (self.incorporeal(u) || self.reachable(upos, opos)) && upos != opos
            };
            enemies.push((o, opos, ok));
        }
    }

    /// Whether `u` can make a blind weapon attack at `target` square (`unseen_targets.blind_attack_issue`).
    #[inline]
    pub(crate) fn can_blind_attack_from_unit(&self, u: usize, target: Pos, range_ft: i32) -> bool {
        if !self.any_large {
            return self.can_blind_attack_square(self.units[u].pos, target, range_ft);
        }
        self.can_blind_attack_multisquare(u, target, range_ft)
    }

    #[cold]
    #[inline(never)]
    fn can_blind_attack_multisquare(&self, u: usize, target: Pos, range_ft: i32) -> bool {
        if self.effective_token_size(u) == 1 {
            return self.can_blind_attack_square(self.units[u].pos, target, range_ft);
        }
        if self.unit_occupies(u, target)
            || !self.grid.in_bounds(target.0, target.1)
            || self.grid.is_wall(target.0, target.1)
            || self.dist_to_square(u, target) * 5 > range_ft
        {
            return false;
        }
        if self.rule_version >= 15 {
            self.unit_cells(u).any(|c| !self.grid.is_wall(c.0, c.1) && self.grid.corner_wall_grade(c, target) < 4)
        } else {
            self.unit_cells(u).any(|c| self.grid.line_of_effect(c, target))
        }
    }

    /// `unseen_targets.blind_attack_variants`: per attack the creature can
    /// make now (not a save attack), one variant per sensed square of a
    /// non-ally (first entry per square) that passes `blind_attack_issue`:
    /// not its own square, within the attack's maximum range, a line of
    /// effect.
    fn blind_attack_candidates(&self, u: usize, sensed: &[(Pos, bool)], out: &mut Vec<Act>) {
        if sensed.is_empty() {
            return;
        }
        let unit = &self.units[u];
        for (ai, def) in unit.t.attacks.iter().enumerate() {
            if def.save_attack.is_some() || !self.can_attack(u, ai) || !self.attack_available(u, ai) {
                continue;
            }
            let mut seen: Vec<Pos> = Vec::new();
            for &(square, heard) in sensed {
                if seen.contains(&square) {
                    continue;
                }
                seen.push(square);
                if self.can_blind_attack_from_unit(u, square, def.range_max) {
                    out.push(Act::BlindAttack { atk: ai, square, heard });
                }
            }
        }
    }

    /// One-step move candidates (`PlayerCharacter.available_actions` for
    /// heroes, the `movement` autobuilder for monsters).
    fn move_candidates(&self, u: usize, out: &mut Vec<Act>) {
        let unit = &self.units[u];
        if unit.available_movement() <= 0 {
            return;
        }
        if self.any_large && self.rule_version >= 21 && unit.t.token_size > 1 {
            self.move_candidates_r21_large(u, out);
            return;
        }
        let (cx, cy) = unit.pos;
        let budget = unit.available_movement().div_euclid(5);
        for dx in -1..=1 {
            for dy in -1..=1 {
                if dx == 0 && dy == 0 {
                    continue;
                }
                let (nx, ny) = (cx + dx, cy + dy);
                if self.rule_version < 5 && unit.t.pc && dx != 0 && dy != 0 {
                    // no corner cutting: both orthogonal neighbours must be free
                    let a = (cx + dx, cy);
                    let b = (cx, cy + dy);
                    if !(self.passable(u, a) && self.placeable(u, a) && self.passable(u, b) && self.placeable(u, b)) {
                        continue;
                    }
                }
                if !self.passable(u, (nx, ny)) || !self.placeable(u, (nx, ny)) {
                    continue;
                }
                let path = [(cx, cy), (nx, ny)];
                let (moves, _) = self.compute_actual_moves(u, &path, budget);
                if moves.len() > 1 {
                    out.push(Act::Move(moves));
                }
            }
        }
    }

    /// Rule >= 21 multi-square 1-step move candidates:
    /// `action_builder.py:440-441` and `player_character.py:1016` check
    /// `bidirectionally_passable(..., allow_squeeze=False)` and `placeable(..., squeeze=False)`.
    /// Squeeze entry/exit moves are emitted by `movement_paths(..., crossings_only=true)`.
    #[cold]
    #[inline(never)]
    fn move_candidates_r21_large(&self, u: usize, out: &mut Vec<Act>) {
        let unit = &self.units[u];
        let (cx, cy) = unit.pos;
        let budget = unit.available_movement().div_euclid(5);
        let base = unit.t.token_size;
        if !self.passable_with_size(u, (cx, cy), 0, base) {
            return;
        }
        for dx in -1..=1 {
            for dy in -1..=1 {
                if dx == 0 && dy == 0 {
                    continue;
                }
                let (nx, ny) = (cx + dx, cy + dy);
                if !self.passable_with_size(u, (nx, ny), 0, base)
                    || !self.placeable_with_size(u, (nx, ny), 0, base)
                {
                    continue;
                }
                let path = [(cx, cy), (nx, ny)];
                let (moves, _) = self.compute_actual_moves(u, &path, budget);
                if moves.len() > 1 {
                    out.push(Act::Move(moves));
                }
            }
        }
    }

    /// `UndeadController._compute_available_moves`.
    pub(crate) fn available_moves(&mut self, u: usize) -> Vec<Act> {
        let observed = self.observe_enemies(u);
        if let Some(rays) = self.pending_rays(u) {
            return self.ray_choices(u, rays);
        }
        let mut acts = Vec::new();
        // the attack builders' `blind_attack_variants` refresh the
        // unseen-creature memory (`sensed_creatures`)
        // The attack builders' `blind_attack_variants` refresh the
        // unseen-creature memory whenever they run: an NPC's
        // (`generate_npc_attack_actions`) at every decision, a hero's when
        // `AttackAction.can` (an action left) or `TwoWeaponAttackAction.can`
        // (a bonus action left after a light-weapon attack).
        let unit = &self.units[u];
        let refresh = !unit.t.pc
            || (0..unit.t.attacks.len()).any(|a| self.can_attack(u, a))
            || (unit.bonus > 0 && unit.two_weapon);
        let sensed = if refresh {
            let (entries, heard) = self.sensed_split(u);
            Some(
                entries
                    .into_iter()
                    .enumerate()
                    .filter(|&(_, (c, _))| !self.allies(u, c))
                    .map(|(k, (_, p))| (p, k < heard))
                    .collect::<Vec<_>>(),
            )
        } else {
            None
        };
        self.attack_candidates(u, false, &mut acts);
        if let Some(sensed) = sensed {
            self.blind_attack_candidates(u, &sensed, &mut acts);
        }
        let unit = &self.units[u];
        if unit.action > 0 {
            acts.push(Act::Dodge);
            acts.push(Act::Dash);
            if self.rule_version >= 6 { acts.push(Act::Disengage); }
        }
        if unit.t.second_wind_uses > 0 && unit.bonus > 0 && unit.second_wind_count > 0 && unit.hp < self.max_hp_of(u) {
            acts.push(Act::SecondWind);
        }
        if unit.t.action_surge_uses > 0 && !unit.action_surge_flag && unit.action_surge_count > 0 {
            acts.push(Act::ActionSurge);
        }
        // Nimble Escape (`DisengageBonusAction.can`, `HideBonusAction.can`):
        // a bonus action left
        if unit.t.nimble_escape.is_some() && unit.bonus > 0 {
            acts.push(Act::DisengageBonus);
        }
        if unit.bonus > 0 && (unit.t.nimble_escape.is_some() || self.shadow_can_hide(u)) {
            acts.push(Act::HideBonus);
        }
        self.move_candidates(u, &mut acts);
        if self.rule_version >= 6 && !self.units[u].t.pc {
            acts.extend(crate::batch::movement_paths(self, u, 0, true, None).into_iter().map(Act::Move));
        }
        // `StandAction.can`: prone, speed > 0, movement for half the speed
        let speed = self.speed_of(u);
        if self.units[u].prone() && speed > 0 && self.units[u].available_movement() >= speed / 2 {
            acts.push(Act::Stand);
        }
        if self.units[u].t.pc {
            self.feature_candidates(u, &mut acts);
            self.barbarian_candidates(u, &mut acts);
            acts.extend(self.bardic_inspiration_candidates(u));
        }
        // v16 general combat remedies (FirstAid [PC only], EscapeGrapple, BreakFree)
        if self.rule_version >= 16 {
            if self.units[u].action > 0 {
                if self.units[u].t.pc {
                    for t in 0..self.units.len() {
                        if t != u
                            && !self.units[t].dead()
                            && self.units[t].unconscious()
                            && !self.units[t].has(crate::engine::St::Stable)
                            && self.dist(u, t) == 1
                            && self.can_see(u, t)
                        {
                            acts.push(Act::FirstAid { target: t });
                        }
                    }
                }
                if self.units[u].is_grappled() {
                    let grapplers: Vec<usize> = self.units[u].grappled_by.iter().map(|&(g, _)| g).collect();
                    for g in grapplers {
                        acts.push(Act::EscapeGrapple { target: g });
                    }
                }
                if self.units[u].conscious() {
                    let n = self.active_effects(u, crate::effects::EffKey::EscapableRestraint).len();
                    let count = if self.rule_version >= 17 { n } else { usize::from(n > 0) };
                    for _ in 0..count {
                        acts.push(Act::BreakFree { target: u });
                    }
                }
            }
        }
        // NPC specials: area abilities, teleports, Luring Song, Vanish.
        if !self.units[u].t.pc {
            let n_area = self.units[u].t.area_abilities.len();
            for idx in 0..n_area {
                let def = &self.units[u].t.area_abilities[idx];
                let ready = !self.units[u].recharge_spent.contains(&def.name);
                let has_cost = if def.bonus_action { self.units[u].bonus > 0 } else { self.units[u].action > 0 };
                if !ready || !has_cost {
                    continue;
                }
                if def.shape == "cone" {
                    let range_sq = (def.range / 5).max(1);
                    if let Some(p) = self.cone_target(u, range_sq, true) {
                        acts.push(Act::NpcAreaAbility { idx, target: Some(p) });
                    }
                } else {
                    acts.push(Act::NpcAreaAbility { idx, target: None });
                }
            }
            let n_tp = self.units[u].t.teleports.len();
            for idx in 0..n_tp {
                let def = &self.units[u].t.teleports[idx];
                let ready = !self.units[u].recharge_spent.contains(&def.name);
                let has_cost = if def.bonus_action { self.units[u].bonus > 0 } else { self.units[u].action > 0 };
                if !ready || !has_cost {
                    continue;
                }
                for dest in self.npc_teleport_destinations(u, idx) {
                    acts.push(Act::NpcTeleport { idx, dest });
                }
            }
            if self.units[u].t.luring_song.is_some() && self.units[u].action > 0 {
                acts.push(Act::LuringSong);
            }
            if let Some(ref v) = self.units[u].t.vanish {
                let has_slot = if v.bonus_action { self.units[u].bonus > 0 } else { self.units[u].action > 0 };
                if !self.units[u].invisible() && has_slot {
                    acts.push(Act::NpcVanish);
                }
            }
        }
        let unit = &self.units[u];
        if observed.enemies.is_empty() && unit.available_movement() == 0 && unit.action > 0 {
            acts.push(Act::Dodge);
        }
        if self.units[u].t.caster.is_some() {
            self.units[u].pools_init = true;
            self.spell_candidates(u, &mut acts);
        }
        acts
    }

    /// `AttackAction.ai_value` (`estimate_only`: analytic, no dice drawn).
    fn ai_attack_value(&mut self, src: usize, atk: usize, tgt: usize) -> f64 {
        self.ai_attack_value_ex(src, atk, tgt, false)
    }

    /// [`Fight::ai_attack_value`]; `cleave`: the Cleave's extra attack
    /// (`no_ability_mod` damage).
    fn ai_attack_value_ex(&mut self, src: usize, atk: usize, tgt: usize, cleave: bool) -> f64 {
        let def = &self.units[src].t.attacks[atk];
        let (to_hit, damage, _) = self.attack_numbers_ex(src, atk, cleave);
        let hit_chance = if let Some((ab, dc)) = def.save_attack {
            let t = &self.units[tgt];
            let auto = matches!(ab, crate::content::Ability::Str | crate::content::Ability::Dex)
                && t.has(crate::engine::St::Paralyzed);
            save_fail_chance(dc, t.save_mod(ab) + self.save_cover_from_unit(src, tgt, ab), auto)
        } else {
            let (adv, dis) = self.advantage(src, tgt, def);
            let mode = Fight::mode_of(adv, dis);
            let ac = self.attack_ac_from_unit(src, tgt);
            prob_at_least(20, plus_string_modifier(to_hit), ac, mode)
        };
        let avg = if def.no_damage {
            0.0
        } else if def.save_attack.is_some() {
            // analytic `expected_die` (no dice)
            let mut total = expected_die(damage.count, damage.sides, damage.modifier);
            for (d, _) in &def.additional {
                total += expected_die(d.count, d.sides, d.modifier);
            }
            total
        } else {
            let mut total = expected(damage.count, damage.sides, damage.modifier);
            // Berserker Frenzy dice when this hit would get them
            if let Some(n) = self.frenzy_dice(src, def) {
                total += expected(n, 6, 0);
            }
            for (d, _) in &def.additional {
                total += expected(d.count, d.sides, d.modifier);
            }
            // `condition: advantage` riders (`_estimated_advantage`): when the
            // roll would have Advantage and no Disadvantage
            if !def.additional_adv.is_empty() {
                let (adv, dis) = self.advantage(src, tgt, def);
                if adv && !dis {
                    for (d, _) in &def.additional_adv {
                        total += expected(d.count, d.sides, d.modifier);
                    }
                }
            }
            total
        };
        let mut value = hit_chance * avg;
        if def.drop_to_zero_hp_lte.is_some_and(|lte| !self.units[tgt].dead() && self.units[tgt].hp <= lte) {
            value = hit_chance * ((self.units[tgt].hp.max(0) as f64 + 8.0).max(15.0));
        }
        for oh in &def.on_hit {
            match oh {
                crate::content::OnHit::SaveCondition { ability, dc, not_undead, not_elf, .. } => {
                    let t = &self.units[tgt];
                    let applies = !(*not_undead && t.t.undead) && !(*not_elf && t.t.elf);
                    let rider = if !applies || t.t.immune_paralyzed || t.has(crate::engine::St::Paralyzed) {
                        0.0
                    } else {
                        save_fail_chance(*dc, t.save_mod(*ability), false) * 8.0
                    };
                    value += hit_chance * rider;
                }
                crate::content::OnHit::Frighten => {
                    value += hit_chance * self.fear_rider_value(src, tgt);
                }
                crate::content::OnHit::ConsumeLife { .. } => {
                    let missing = (self.max_hp_of(src) - self.units[src].hp).max(0) as f64;
                    value += hit_chance * (15.0 + missing.min(10.5));
                }
                crate::content::OnHit::Grapple { max_size_rank, .. } => {
                    let t = &self.units[tgt];
                    if max_size_rank.map_or(true, |m| t.t.size_rank <= m)
                        && !t.grappled_by.iter().any(|&(g, _)| g == src)
                        && !t.t.immune_grappled
                    {
                        value += hit_chance * 2.5;
                    }
                }
                crate::content::OnHit::Push { max_size_rank, .. } => {
                    if max_size_rank.map_or(true, |m| self.units[tgt].t.size_rank <= m) {
                        value += hit_chance * 0.5;
                    }
                }
                crate::content::OnHit::Charm { ai_value, .. } => {
                    let t = &self.units[tgt];
                    if !t.t.immune_charmed && !self.is_charmed_by(tgt, src) && !t.has(crate::engine::St::Charmed) {
                        value += hit_chance * *ai_value;
                    }
                }
                _ => {}
            }
        }
        // ai_value: an attack on a downed creature is worth a tenth, unless it specifically targets 0-HP living foes.
        let targets_downed = def.target_if.contains(&crate::content::TargetCond::ZeroHpLiving);
        if self.units[tgt].unconscious() && !targets_downed {
            value *= 0.1;
        }
        value
    }

    /// `HideBonusAction.ai_value` (`natural20/utils/hide_value.py`, N20-040
    /// fixed): P(success) x the gain from Advantage on the next attack, in
    /// `ai_attack_value` units; analytic, no dice. 0 while hidden, and 0 when
    /// any conscious opponent has line of sight (the 2024 Hide fails there).
    /// Success: the Stealth total (d20 + the Nimble Escape modifier;
    /// Disadvantage while poisoned or frightened by a source in sight, as
    /// `do_hide` rolls it) at least 15 and above every conscious opponent's
    /// passive Perception (`prob_at_least`, naturals not special). Gain: over
    /// the creature's usable attacks (an NPC item attack needs the item) and
    /// every conscious opponent, max P_adv(hit vs AC) x (mean damage + plain
    /// riders + Advantage riders) minus max P(hit vs AC) x (mean damage +
    /// plain riders); a straight roll is the baseline, no cover.
    fn ai_hide_value(&self, u: usize) -> f64 {
        let unit = &self.units[u];
        if unit.hidden() {
            return 0.0;
        }
        let opponents: Vec<usize> = (0..self.units.len())
            .filter(|&o| o != u && !self.units[o].dead() && self.opposing(o, u) && self.units[o].conscious())
            .collect();
        if opponents.is_empty() {
            return 0.0;
        }
        let mut need = 0;
        for &o in &opponents {
            if self.sees_hider_clearly(o, u) {
                return 0.0;
            }
            need = need.max(self.units[o].t.passive_perception + 1);
        }
        need = need.max(15);
        let gt = self.gt();
        let feared = unit.frightened_by.iter().any(|&(f, until, _)| gt < until && !self.units[f].dead() && self.can_see(u, f));
        let mode = crate::trace::RollMode::from_flags(false, unit.poisoned() || feared);
        let modifier = unit.t.nimble_escape.or(unit.t.shadow_stealth).unwrap_or(0);
        let chance = prob_at_least(20, plus_string_modifier(modifier), need, mode);
        if chance <= 0.0 {
            return 0.0;
        }
        let mut best = 0.0f64;
        let mut best_adv = 0.0f64;
        for atk in 0..unit.t.attacks.len() {
            let def = &self.units[u].t.attacks[atk];
            if def.save_attack.is_some() {
                continue;
            }
            if let Some(k) = def.npc_item {
                if self.units[u].items[k as usize] <= 0 {
                    continue;
                }
            }
            let (to_hit, damage, _) = self.attack_numbers(u, atk);
            let mut dmg = expected(damage.count, damage.sides, damage.modifier);
            for (d, _) in &def.additional {
                dmg += expected(d.count, d.sides, d.modifier);
            }
            let mut extra = 0.0f64;
            for (d, _) in &def.additional_adv {
                extra += expected(d.count, d.sides, d.modifier);
            }
            for &t in &opponents {
                let ac = self.attack_ac_from_unit(u, t);
                let hit = prob_at_least(20, plus_string_modifier(to_hit), ac, crate::trace::RollMode::Normal);
                let hit_adv = prob_at_least(20, plus_string_modifier(to_hit), ac, crate::trace::RollMode::Advantage);
                best = best.max(hit * dmg);
                best_adv = best_adv.max(hit_adv * (dmg + extra));
            }
        }
        chance * (best_adv - best)
    }

    /// `AttackAction.ai_value` of a blind variant: confidence (1.0 heard,
    /// 0.35 remembered) x P(d20 + to-hit with Disadvantage >= 14,
    /// `BLIND_ASSUMED_AC`) x the mean damage; no target, so no riders and no
    /// downed weight.
    fn ai_blind_value(&mut self, src: usize, atk: usize, heard: bool) -> f64 {
        let def = &self.units[src].t.attacks[atk];
        let (to_hit, damage, _) = self.attack_numbers(src, atk);
        let confidence = if heard { 1.0 } else { 0.35 };
        let hit_chance =
            confidence * prob_at_least(20, plus_string_modifier(to_hit), 14, crate::trace::RollMode::Disadvantage);
        let mut avg = expected(damage.count, damage.sides, damage.modifier);
        if let Some(n) = self.frenzy_dice(src, def) {
            avg += 3.5 * n as f64;
        }
        for (d, _) in &def.additional {
            avg += expected(d.count, d.sides, d.modifier);
        }
        hit_chance * avg
    }

    /// Shortest placeable one-square path to a visible enemy or its last known square.
    /// Start at the targets so a single traversal covers every candidate, including detours.
    fn pursuit_distances(&self, u: usize, targets: &[Pos], occupied: &crate::map::Bits) -> Vec<u16> {
        let mut distances = vec![u16::MAX; self.grid.cells()];
        let mut queue = VecDeque::new();
        for &(x, y) in targets {
            let i = self.grid.index(x, y);
            distances[i] = 0;
            queue.push_back(i);
        }
        if !self.any_large {
            while let Some(i) = queue.pop_front() {
                let (x, y) = self.grid.pos_of(i);
                for nx in x - 1..=x + 1 {
                    for ny in y - 1..=y + 1 {
                        if !self.grid.in_bounds(nx, ny) || (!self.incorporeal(u) && self.grid.is_wall(nx, ny)) || (self.rule_version >= 5 && !self.step_clears_corner(u, (x, y), (nx, ny))) {
                            continue;
                        }
                        let j = self.grid.index(nx, ny);
                        if distances[j] == u16::MAX && !occupied.get(j) {
                            distances[j] = distances[i] + 1;
                            queue.push_back(j);
                        }
                    }
                }
            }
        } else {
            self.pursuit_distances_multisquare(u, &mut distances, &mut queue, occupied);
        }
        distances
    }

    #[cold]
    #[inline(never)]
    fn pursuit_distances_multisquare(
        &self,
        u: usize,
        distances: &mut [u16],
        queue: &mut VecDeque<usize>,
        occupied: &crate::map::Bits,
    ) {
        if self.units[u].t.token_size == 1 {
            while let Some(i) = queue.pop_front() {
                let (x, y) = self.grid.pos_of(i);
                for nx in x - 1..=x + 1 {
                    for ny in y - 1..=y + 1 {
                        if !self.grid.in_bounds(nx, ny) || (!self.incorporeal(u) && self.grid.is_wall(nx, ny)) || (self.rule_version >= 5 && !self.step_clears_corner(u, (x, y), (nx, ny))) {
                            continue;
                        }
                        let j = self.grid.index(nx, ny);
                        if distances[j] == u16::MAX && !occupied.get(j) {
                            distances[j] = distances[i] + 1;
                            queue.push_back(j);
                        }
                    }
                }
            }
            return;
        }
        let base_sz = self.units[u].t.token_size;
        while let Some(i) = queue.pop_front() {
            let (x, y) = self.grid.pos_of(i);
            for nx in x - 1..=x + 1 {
                for ny in y - 1..=y + 1 {
                    if !self.footprint_terrain_clear(u, (nx, ny))
                        || (self.rule_version >= 5 && !self.step_clears_corner(u, (x, y), (nx, ny)))
                    {
                        continue;
                    }
                    let j = self.grid.index(nx, ny);
                    // `generic_controller.py:pursuit_distances` passes `allow_squeeze=False`,
                    // so every BFS edge checks the full `base_sz x base_sz` footprint.
                    if distances[j] == u16::MAX
                        && !crate::engine::UnitCells::new((nx, ny), base_sz).any(|c| occupied.get(self.grid.index(c.0, c.1)))
                    {
                        distances[j] = distances[i] + 1;
                        queue.push_back(j);
                    }
                }
            }
        }
    }

    fn throws_last_melee_weapon(&self, u: usize, atk: usize) -> bool {
        let unit = &self.units[u];
        let attack = &unit.t.attacks[atk];
        let Some(item) = attack.npc_item else { return false };
        attack.thrown && attack.melee_type && unit.items[item as usize] == 1
            && !unit.t.attacks.iter().enumerate().any(|(i, other)| {
                !other.ranged && other.melee_type && other.npc_item != Some(item) && self.attack_available(u, i)
            })
    }

    /// `GenericController._sort_actions_with_scores` then the
    /// `UndeadController` adjustments. Returns the final list (candidate
    /// index into `cands`, score) and the native scores. With `rows`, also
    /// every candidate's adjusted score and whether the adjustments dropped
    /// it (`GeneralController.last_rows`, by candidate index).
    pub(crate) fn sort_with_scores(
        &mut self,
        u: usize,
        cands: &[Act],
        mut rows: Option<&mut Vec<(f64, bool)>>,
    ) -> (Vec<f64>, Vec<(usize, f64)>) {
        if let Some(r) = rows.as_deref_mut() {
            r.clear();
            r.resize(cands.len(), (0.0, false));
        }
        let observed = self.observe_enemies(u);
        let upos = self.units[u].pos;
        let prone = self.units[u].prone();
        let flying = self.units[u].t.fly;
        let token_size = self.units[u].t.token_size;
        let squeezed = self.any_large && self.units[u].squeezed();
        let mask = self.occupied_mask(u);

        // build_move_scores
        let mut targets: Vec<Pos> = observed.enemies.iter().filter(|e| e.2).map(|e| e.1).collect();
        let mut kind_enemy = !targets.is_empty();
        let mut kind_investigate = false;
        let sense_pursuit = self.rule_version >= 5 && !self.units[u].t.pc;
        if sense_pursuit && (self.rule_version >= 6 || targets.is_empty()) {
            // Keep all perceived opponents across a sight boundary. Otherwise a
            // newly visible enemy can reverse the shortest path every square.
            for (enemy, pos) in self.sensed_split(u).0 {
                if self.opposing(u, enemy) && self.units[enemy].conscious() && !targets.contains(&pos) {
                    targets.push(pos);
                }
            }
            kind_investigate = !kind_enemy && !targets.is_empty();
        }
        if targets.is_empty() && !self.units[u].mem.investigate.is_empty() {
            targets = self.units[u].mem.investigate.iter().map(|(p, _)| *p).collect();
            kind_investigate = true;
            kind_enemy = false;
        }
        let has_moves = cands.iter().any(|a| matches!(a, Act::Move(_)));
        let mut move_square: Vec<(Pos, f64)> = Vec::new();
        let mut cur_min: Option<i32> = None;
        // A destination's progress search depends only on (destination,
        // targets, occupied mask, prone, flying) and draws no dice, so its
        // result is cached across decisions while that context is unchanged
        // (a creature moves one square per decision with the same targets).
        let mut cache = std::mem::take(&mut self.move_cache);
        if !(cache.valid && cache.prone == prone && cache.flying == flying && cache.token_size == token_size && cache.squeezed == squeezed && cache.targets == targets && cache.mask == mask) {
            cache.valid = true;
            cache.prone = prone;
            cache.flying = flying;
            cache.token_size = token_size;
            cache.squeezed = squeezed;
            cache.targets.clone_from(&targets);
            cache.mask.clone_from(&mask);
            cache.pursuit.clear();
            cache.steps.clear();
            cache.steps.resize(self.grid.cells(), None);
        }
        let pursuit = self.rule_version >= 4 && !self.units[u].t.pc
            && cands.iter().any(|a| matches!(a, Act::Dash | Act::Move(_)));
        let exploring = sense_pursuit && targets.is_empty();
        if pursuit {
            let mut occupied = crate::map::Bits::new(self.grid.cells());
            if !self.any_large {
                for (i, other) in self.units.iter().enumerate() {
                    if i != u && self.token_at(other.pos) == Some(i)
                        && (self.rule_version < 6 || !self.passable(u, other.pos))
                    {
                        occupied.set(self.grid.index(other.pos.0, other.pos.1));
                    }
                }
            } else {
                for (i, other) in self.units.iter().enumerate() {
                    if i != u && self.token_at(other.pos) == Some(i)
                        && (self.rule_version < 6 || !self.unit_can_pass_other(u, i))
                    {
                        for c in self.unit_cells(i) {
                            if self.grid.in_bounds(c.0, c.1) {
                                occupied.set(self.grid.index(c.0, c.1));
                            }
                        }
                    }
                }
            }
            if exploring {
                let unvisited: Vec<_> = (0..self.grid.cells()).map(|i| self.grid.pos_of(i))
                    .filter(|&p| {
                        let i = self.grid.index(p.0, p.1);
                        p != upos && !self.grid.is_wall(p.0, p.1) && !occupied.get(i) && (self.rule_version < 6 || self.placeable(u, p)) && !self.units[u].mem.visited.get(i)
                    }).collect();
                cache.pursuit = self.pursuit_distances(u, &unvisited, &occupied);
                cache.occupied = occupied;
            } else if self.rule_version >= 7 {
                let reach = self.units[u].t.melee_ft.unwrap_or_else(|| self.units[u].t.attacks.iter()
                    .map(|a| a.range).max().unwrap_or(5)).max(5);
                let mut landings = crate::map::Bits::new(self.grid.cells());
                if !self.any_large {
                    for (i, unit) in self.units.iter().enumerate() {
                        if i != u && self.token_at(unit.pos) == Some(i) {
                            landings.set(self.grid.index(unit.pos.0, unit.pos.1));
                        }
                    }
                } else {
                    for (i, unit) in self.units.iter().enumerate() {
                        if i != u && self.token_at(unit.pos) == Some(i) {
                            for c in self.unit_cells(i) {
                                if self.grid.in_bounds(c.0, c.1) {
                                    landings.set(self.grid.index(c.0, c.1));
                                }
                            }
                        }
                    }
                }
                if cache.pursuit.is_empty() || cache.occupied != occupied || cache.landings != landings || cache.reach != reach {
                    let goals: Vec<_> = (0..self.grid.cells()).filter(|&i| !landings.get(i)).map(|i| self.grid.pos_of(i))
                        .filter(|&p| self.placeable(u, p) && targets.iter().any(|&t| self.within_reach(p, t, reach)
                            && if self.rule_version >= 16 { self.clear_sight(p, t) } else { self.clear_effect(p, t) })).collect();
                    cache.pursuit = self.pursuit_distances(u, &goals, &occupied);
                    cache.occupied = occupied;
                    cache.landings = landings;
                    cache.reach = reach;
                }
            } else if cache.pursuit.is_empty() || cache.occupied != occupied {
                cache.pursuit = self.pursuit_distances(u, &targets, &occupied);
                cache.occupied = occupied;
            }
        }
        let grid = self.grid.clone();
        let can_land_on_goal = self.rule_version >= 7 || exploring;
        let closes_distance = |p: Pos| {
            let current = cache.pursuit[grid.index(upos.0, upos.1)];
            let next = cache.pursuit[grid.index(p.0, p.1)];
            current != u16::MAX && next < current && (can_land_on_goal || next > 0)
        };
        let ordinary_progress = pursuit && cands.iter().any(|a| matches!(a, Act::Move(path) if path.last().is_some_and(|p| closes_distance(*p))));
        let can_pursue_with_dash = pursuit && !exploring && !ordinary_progress && cands.iter().any(|a| matches!(a, Act::Dash))
            && self.speed_of(u) > 0 && ((-1..=1).any(|dx| (-1..=1).any(|dy| {
                let dest = (upos.0 + dx, upos.1 + dy);
                if !self.placeable(u, dest) || !closes_distance(dest) {
                    return false;
                }
                let budget = (self.units[u].available_movement() + self.speed_of(u)) / 5;
                self.compute_actual_moves(u, &[upos, dest], budget).0.len() == 2
            })) || (self.rule_version >= 6 && crate::batch::movement_paths_with_budget(
                self, u, 0, true, None, (self.units[u].available_movement() + self.speed_of(u)) / 5
            ).iter().any(|path| path.last().is_some_and(|p| closes_distance(*p)))));
        let mut pc = PathCompute::new(&grid, prone, flying, mask);
        pc.incorporeal = self.incorporeal(u);
        pc.solid_wall_corners = self.rule_version >= 8;
        if self.any_large {
            pc.token_size = token_size;
            pc.eff_size = self.effective_token_size(u);
            pc.allow_squeeze = self.rule_version >= 21;
        }
        if !targets.is_empty() && has_moves {
            let paths = pc.compute_paths_to_multiple(upos, &targets);
            for (dest, path) in targets.iter().zip(paths.iter()) {
                let Some(path) = path else { continue };
                let lens = path.len() as i32 - 1;
                cur_min = Some(cur_min.map_or(lens, |m: i32| m.min(lens)));
                if path.len() < 2 {
                    continue;
                }
                let first = path[1];
                let mut base = 1.0 / (path.len().max(1) as f64);
                if !self.units[u].mem.visited.get(grid.index(first.0, first.1)) {
                    base += 0.1;
                }
                if let Some((_, age)) = self.units[u].mem.investigate.iter().find(|(p, _)| p == dest) {
                    base += 0.2 + 0.05 * *age as f64;
                }
                if let Some(entry) = move_square.iter_mut().find(|(p, _)| *p == first) {
                    entry.1 = entry.1.max(base);
                } else {
                    move_square.push((first, 0.0f64.max(base)));
                }
            }
        }

        let mut scores = Vec::with_capacity(cands.len());
        for act in cands {
            let s = match act {
                Act::Attack { atk, .. } | Act::BlindAttack { atk, .. }
                    if self.rule_version >= 4 && self.throws_last_melee_weapon(u, *atk) => SKIP_NATIVE,
                Act::Attack { atk, target, .. } => self.ai_attack_value(u, *atk, *target),
                Act::BlindAttack { atk, heard, .. } => self.ai_blind_value(u, *atk, *heard),
                Act::Move(path) if pursuit && !path.last().is_some_and(|p| closes_distance(*p)) => SKIP_NATIVE,
                Act::Move(path) => {
                    if path.len() < 2 {
                        -2.0
                    } else {
                        let dest = *path.last().unwrap();
                        let mut s = move_square.iter().find(|(p, _)| *p == dest).map(|e| e.1).unwrap_or(0.0);
                        // progress_score_for
                        if !targets.is_empty() {
                            let ci = grid.index(dest.0, dest.1);
                            let dest_min = match cache.steps[ci] {
                                Some(m) => m,
                                None => {
                                    let m = pc.min_steps_to_multiple(dest, &targets);
                                    cache.steps[ci] = Some(m);
                                    m
                                }
                            };
                            if let (Some(c), Some(d)) = (cur_min, dest_min) {
                                let progress = c - d;
                                let mut ps = progress as f64 * 0.45;
                                if kind_investigate {
                                    ps += progress as f64 * 0.1;
                                } else if progress <= 0 {
                                    ps -= 0.2;
                                }
                                let _ = kind_enemy;
                                s += ps;
                            }
                        }
                        let mem = &self.units[u].mem;
                        if let Some(i) = mem.recent.iter().position(|p| *p == dest) {
                            let recency = (mem.recent.len() - i) as f64;
                            s -= 0.75 + 0.2 * recency;
                        }
                        if mem.visited.get(grid.index(dest.0, dest.1)) {
                            s -= 0.15;
                        }
                        if !self.opportunity_attacks(u, path).is_empty() {
                            s -= 1.0;
                        }
                        if pursuit { s.max(0.2) } else { s }
                    }
                }
                Act::Dash if pursuit && !can_pursue_with_dash => SKIP_NATIVE,
                Act::SecondWind => self.score_second_wind(u),
                Act::Dash | Act::Dodge => 0.1,
                // `DisengageBonusAction` has no `ai_value`: 0 (the action
                // versions get 0.1); `HideBonusAction.ai_value` (N20-040)
                Act::Disengage | Act::DisengageBonus => 0.0,
                Act::HideBonus => {
                    let value = self.ai_hide_value(u);
                    if self.rule_version >= 7 && value == 0.0 { SKIP_NATIVE } else { value }
                },
                Act::RedirectAttack { ally, would_hit } => if *would_hit { self.units[*ally].hp as f64 } else { 0.0 },
                Act::ActionSurge => 0.0,
                // `RageAction`, `ExtendRageAction`, `RecklessAttackAction`
                // `.ai_value`; a Cleave is an `AttackAction` (`ai_value`)
                Act::Rage => self.rage_value(u),
                Act::ExtendRage => crate::barbarian::EXTEND_RAGE_AI_VALUE,
                Act::RecklessAttack => self.reckless_value(u),
                Act::Cleave { atk, target } => self.ai_attack_value_ex(u, *atk, *target, true),
                Act::FirstAid { target } => {
                    if !self.allies(u, *target) {
                        -2.0
                    } else if !self.units[*target].dead()
                        && self.units[*target].unconscious()
                        && !self.units[*target].has(crate::engine::St::Stable)
                    {
                        if self.rule_version >= 17 { 0.0 } else { 5.0 }
                    } else {
                        -0.5
                    }
                }
                Act::EscapeGrapple { target } => {
                    if !self.units[u].is_grappled() {
                        -1.0
                    } else {
                        let m = self.units[u].athletics_mod().max(self.units[u].acrobatics_mod());
                        let dc = self.units[u]
                            .grappled_by
                            .iter()
                            .find(|&&(g, _)| g == *target)
                            .and_then(|&(_, d)| d)
                            .unwrap_or(12);
                        let p = ((21 - (dc - m)) as f64 / 20.0).clamp(0.05, 0.95);
                        if self.rule_version >= 17 {
                            if !self.enemy_in_melee_range(u) { 3.0 * p } else { 1.0 * p }
                        } else if !self.enemy_in_melee_range(u) {
                            4.5 * p
                        } else {
                            1.5 * p
                        }
                    }
                }
                Act::BreakFree { target } => {
                    if let Some(obj) = self.active_effects(*target, crate::effects::EffKey::EscapableRestraint).into_iter().next() {
                        let dc = match self.objs[obj as usize].kind {
                            crate::effects::ObjKind::EntangleRestraint { dc, .. } => dc,
                            _ => 12,
                        };
                        let ath = self.units[u].athletics_mod();
                        2.0 * ((21 - (dc - ath)) as f64 / 20.0).clamp(0.05, 0.95)
                    } else {
                        0.0
                    }
                }
                Act::DropGrapple { .. } => 0.0,
                Act::NpcAreaAbility { idx, target } => {
                    let def = &self.units[u].t.area_abilities[*idx];
                    let origin = self.units[u].pos;
                    let squares = match def.shape {
                        "radius" | "self" | "emanation" => self.squares_in_radius(origin, def.range, true),
                        _ => match target {
                            Some(dir) => self.squares_in_cone(origin, *dir, (def.range / 5).max(1), true),
                            None => Vec::new(),
                        },
                    };
                    let avg = expected_die(def.damage.count, def.damage.sides, def.damage.modifier);
                    let mut total = 0.0;
                    for c in self.creatures_in_squares(&squares, Some(u)) {
                        let mut w = if self.allies(u, c) { -1.0 } else { 1.0 };
                        if w > 0.0 && !self.units[c].conscious() {
                            w = 0.25;
                        }
                        total += w * avg * 0.75;
                    }
                    total
                }
                Act::NpcTeleport { idx, dest } => {
                    let def = &self.units[u].t.teleports[*idx];
                    let enemies: Vec<usize> = self
                        .opponents_of(u)
                        .into_iter()
                        .filter(|&e| self.units[e].conscious())
                        .collect();
                    if enemies.is_empty() {
                        -1.0
                    } else {
                        let cur_min = enemies
                            .iter()
                            .map(|&e| self.dist(u, e) * 5)
                            .min()
                            .unwrap();
                        let new_min = enemies
                            .iter()
                            .map(|&e| self.dist_at(u, *dest, e) * 5)
                            .min()
                            .unwrap();
                        let hp_frac = self.units[u].hp as f64 / self.max_hp_of(u).max(1) as f64;
                        if def.tree_stride {
                            if cur_min <= 10 && (15..=60).contains(&new_min) {
                                3.0 + (new_min - cur_min) as f64 / 20.0
                            } else {
                                -1.0
                            }
                        } else {
                            let has_action = self.units[u].action > 0;
                            if hp_frac <= 0.4 && cur_min <= 5 && !has_action && new_min >= 20 {
                                2.5 + new_min as f64 / 40.0
                            } else if has_action && cur_min > 5 && new_min <= 5 {
                                let weakest = enemies
                                    .iter()
                                    .filter(|&&e| self.dist_at(u, *dest, e) * 5 <= 5)
                                    .map(|&e| self.units[e].hp)
                                    .min()
                                    .unwrap_or(100);
                                4.0 + ((40.0 - weakest as f64) / 40.0).max(0.0)
                            } else {
                                -1.0
                            }
                        }
                    }
                }
                Act::LuringSong => {
                    let already_singing = self.units[u]
                        .concentration
                        .is_some_and(|c| matches!(self.objs[c as usize].kind, crate::effects::ObjKind::LuringSong { .. }));
                    if already_singing {
                        -1.0
                    } else {
                        let dc = self.units[u].t.luring_song.map_or(11, |c| c.dc);
                        let mut score = 0.0;
                        for t in self.luring_song_targets(u) {
                            if !self.opposing(u, t) || self.units[t].t.immune_charmed {
                                continue;
                            }
                            let adv = self.units[t].t.fey_ancestry;
                            score += 9.0 * self.save_fail_chance_adv(t, crate::content::Ability::Wis, dc, adv);
                        }
                        if score > 0.0 { score } else { -1.0 }
                    }
                }
                Act::NpcVanish => {
                    if self.units[u].invisible() {
                        -1.0
                    } else if self.units[u].action <= 0 {
                        4.5
                    } else {
                        1.5
                    }
                }
                Act::BardicInspiration { target } => self.score_bardic_inspiration(u, *target),
                Act::Spell(c) => self.spell_ai_value(u, c),
                other => self.feature_ai_value(u, other),
            };
            scores.push(s);
        }
        self.move_cache = cache;
        // Weigh FirstAid against actual combat alternatives (N20-115, rules v17).
        if self.rule_version >= 17 && cands.iter().any(|a| matches!(a, Act::FirstAid { .. })) {
            let med_mod = self.units[u].medicine_mod();
            let p_med = ((21 - (10 - med_mod)) as f64 / 20.0).clamp(0.05, 0.95);
            let best_other = cands
                .iter()
                .zip(&scores)
                .filter(|(a, _)| {
                    !matches!(
                        a,
                        Act::FirstAid { .. }
                            | Act::Dodge
                            | Act::Disengage
                            | Act::DisengageBonus
                            | Act::Dash
                            | Act::HideBonus
                            | Act::SecondWind
                    )
                })
                .map(|(_, &s)| s)
                .fold(SKIP_NATIVE, f64::max);
            let can_chase = !self.enemy_in_melee_range(u)
                && !targets.is_empty()
                && self.speed_of(u) > 0
                && cands.iter().zip(&scores).any(|(a, &s)| matches!(a, Act::Dash) && s >= 0.1);
            for (i, act) in cands.iter().enumerate() {
                let Act::FirstAid { target } = *act else { continue };
                if !self.allies(u, target) {
                    scores[i] = -2.0;
                } else if self.units[target].dead()
                    || !self.units[target].unconscious()
                    || self.units[target].has(crate::engine::St::Stable)
                {
                    scores[i] = -0.5;
                } else {
                    let cursed = self.units[target].cursed;
                    let has_better_aid = cands.iter().zip(&scores).any(|(other, &other_val)| {
                        if other_val <= 0.1 {
                            return false;
                        }
                        match other {
                            Act::Spell(c) => {
                                if c.spell == crate::content::SpellId::SpareTheDying && c.targets.contains(&target) {
                                    return true;
                                }
                                !cursed
                                    && matches!(
                                        c.spell,
                                        crate::content::SpellId::CureWounds
                                            | crate::content::SpellId::HealingWord
                                            | crate::content::SpellId::Aid
                                    )
                                    && c.targets.contains(&target)
                            }
                            Act::DivineSpark { target: t, heal: true, .. } => !cursed && *t == target,
                            Act::PreserveLife(alloc) => !cursed && alloc.iter().any(|&(t, hp)| t == target && hp > 0),
                            _ => false,
                        }
                    });
                    scores[i] = if has_better_aid {
                        -0.5
                    } else if best_other > 0.1 || can_chase {
                        0.05 * p_med
                    } else {
                        0.35 + 0.35 * p_med
                    };
                }
            }
        }
        if self.rule_version >= 6 && cands.iter().any(|a| matches!(a, Act::Disengage | Act::DisengageBonus)) {
            let mut intended = None;
            for (i, action) in cands.iter().enumerate() {
                if !matches!(action, Act::Disengage | Act::DisengageBonus)
                    && intended.map_or(true, |best| scores[i] > scores[best]) { intended = Some(i); }
            }
            let withdrawal = intended.and_then(|i| match &cands[i] {
                Act::Move(path) if scores[i] > SKIP_NATIVE && !self.opportunity_attacks(u, path).is_empty() => Some(scores[i]),
                _ => None,
            });
            for (action, score) in cands.iter().zip(&mut scores) {
                match action {
                    Act::Disengage => *score = withdrawal.map_or(SKIP_NATIVE, |v| v + 0.01),
                    Act::DisengageBonus => *score = withdrawal.map_or(SKIP_NATIVE, |v| v + 0.02),
                    _ => {}
                }
            }
        }
        // sort desc (stable), then age the investigation markers
        let mut generic: Vec<(usize, f64)> = scores.iter().copied().enumerate().collect();
        generic.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        for m in self.units[u].mem.investigate.iter_mut() {
            m.1 += 1;
        }
        // UndeadController adjustments
        let mut adjusted = Vec::with_capacity(generic.len());
        for (i, mut s) in generic {
            if matches!(cands[i], Act::ActionSurge) {
                s = if self.enemy_within(u, 1) && self.units[u].action <= 0 { 1.0 } else { -1.0 };
            }
            let dropped = self.pending_rays(u).is_none()
                && (s == SKIP_NATIVE || (s < 0.0 && !matches!(cands[i], Act::Move(_) | Act::Attack { .. } | Act::BlindAttack { .. })));
            if let Some(r) = rows.as_deref_mut() {
                r[i] = (s, dropped);
            }
            if dropped {
                continue;
            }
            adjusted.push((i, s));
        }
        adjusted.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        if !self.prefer.is_empty() {
            for (i, s) in adjusted.iter_mut() {
                if self.preferred(u, &cands[*i]) {
                    *s += 100.0;
                }
            }
            adjusted.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        }
        (scores, adjusted)
    }

    /// A scripted preference matches this candidate.
    fn preferred(&self, u: usize, act: &Act) -> bool {
        let kind = self.units[u].id.split('-').next().unwrap_or("");
        match act {
            Act::Spell(c) => {
                let mm = c.mm.map(|m| format!("mm={}", m.key()));
                self.prefer.iter().any(|p| {
                    let pair = p.split_once(':');
                    pair == Some((kind, c.spell.key())) || (mm.is_some() && pair == Some((kind, mm.as_deref().unwrap())))
                })
            }
            Act::Attack { atk, .. } | Act::BlindAttack { atk, .. } => {
                let name = self.units[u].t.attacks[*atk].name;
                self.prefer.iter().any(|p| p.split_once(':') == Some((kind, name)))
            }
            Act::Move(path) => {
                self.prefer.iter().any(|p| p.split_once(':') == Some((kind, "move_oa")))
                    && !self.opportunity_attacks(u, path).is_empty()
            }
            other => self.prefer.iter().any(|p| p.split_once(':') == Some((kind, other.kind()))),
        }
    }

    /// `score_second_wind`: `score_heal_target(entity, 5.5 + level, bonus) + 0.75`.
    fn score_second_wind(&self, u: usize) -> f64 {
        let unit = &self.units[u];
        let expected_heal = 5.5 + unit.t.fighter_level as f64;
        let mhp = self.max_hp_of(u);
        let missing = (mhp - unit.hp).max(0);
        let base = if unit.cursed {
            -1.0
        } else if missing <= 0 && !unit.unconscious() {
            -0.5
        } else {
            let pick = if missing > 0 { (missing as f64).min(expected_heal) } else { expected_heal };
            let restored = pick.max(1.0);
            let mut urgency = 1.0;
            if unit.unconscious() {
                urgency += 3.5;
            } else {
                let ratio = unit.hp as f64 / (mhp.max(1) as f64);
                if ratio <= 0.25 {
                    urgency += 2.0;
                } else if ratio <= 0.5 {
                    urgency += 1.0;
                }
            }
            if unit.conscious() && self.enemy_in_melee_range(u) {
                urgency += 0.5;
            }
            urgency += 0.5;
            (restored / 3.0) * urgency
        };
        base + 0.75
    }

    /// `sorted(actions, key=_canonical_key)` (stable). With `group`, also
    /// each candidate's row in the deduplicated list (`_dedup`: equal keys
    /// are equal descriptors here, and a stable sort makes them adjacent, so
    /// the first of each run is the row kept).
    pub(crate) fn canonical(&self, u: usize, mut cands: Vec<Act>, group: bool) -> (Vec<Act>, Vec<usize>) {
        let mut keyed: Vec<(CanonKey, Act)> = cands.drain(..).map(|a| (self.canon_key(u, &a), a)).collect();
        keyed.sort_by(|a, b| a.0.cmp(&b.0));
        let mut row_of = Vec::new();
        if group {
            row_of.reserve(keyed.len());
            let mut row = 0;
            let square = |a: &Act| match a {
                Act::BlindAttack { square, .. } => Some(*square),
                _ => None,
            };
            for i in 0..keyed.len() {
                if i > 0 && (keyed[i].0 != keyed[i - 1].0 || square(&keyed[i].1) != square(&keyed[i - 1].1)) {
                    row += 1;
                }
                row_of.push(row);
            }
        }
        (keyed.into_iter().map(|(_, a)| a).collect(), row_of)
    }

    /// Sort candidates canonically (stable) and emit/return the decision.
    fn decide(&mut self, u: usize, ctx: &str, cands: Vec<Act>) -> (Vec<Act>, Vec<(usize, f64)>) {
        let (cands, _) = self.canonical(u, cands, false);
        let (scores, fin) = self.sort_with_scores(u, &cands, None);
        if self.trace.on() {
            // emitted by the caller once the choice is known
            self.pending = Some((ctx.to_string(), cands.iter().map(|a| self.describe(u, a)).collect(), scores));
        }
        (cands, fin)
    }

    fn emit_decision(&mut self, u: usize, fin: &[(usize, f64)], chosen: Option<&Act>) {
        if !self.trace.on() {
            return;
        }
        let (ctx, descs, scores) = self.pending.take().unwrap_or_else(|| (String::from("turn"), vec![], vec![]));
        let chosen = chosen.map(|a| self.describe(u, a)).unwrap_or_else(|| "none".into());
        self.trace.emit(Ev::Dec {
            ctx,
            who: self.units[u].id.clone(),
            cands: descs,
            scores: scores.into_iter().map(Some).collect(),
            order: fin.iter().map(|(i, _)| *i as i64).collect(),
            adj: fin.iter().map(|(_, s)| *s).collect(),
            chosen,
            multi_sort: false,
            ext: None,
        });
    }

    /// `GenericController.move_for` (via `UndeadController`).
    pub fn move_for(&mut self, u: usize) -> Option<Act> {
        if self.units[u].incapacitated() {
            // a turned or lured creature takes its forced step
            let step = self.flee_step(u).or_else(|| self.lure_step(u)).map(Act::Move);
            if self.trace.on() {
                self.pending = Some((String::from("turn"), vec![], vec![]));
            }
            self.emit_decision(u, &[], step.as_ref());
            return step;
        }
        if let Some(target) = self.grapple_release_target(u) {
            let act = Act::DropGrapple { target };
            if self.trace.on() {
                self.pending = Some((String::from("turn"), vec![], vec![]));
            }
            self.emit_decision(u, &[], Some(&act));
            return Some(act);
        }
        let cands = self.available_moves(u);
        if cands.iter().any(|a| matches!(a, Act::Stand)) {
            // prone and able to stand: `move_for` takes it before fear
            // handling and scoring (so no scoring, no marker aging)
            if self.trace.on() {
                self.pending = Some((String::from("turn"), vec![], vec![]));
            }
            self.emit_decision(u, &[], Some(&Act::Stand));
            return Some(Act::Stand);
        }
        let (cands, fin) = self.decide(u, "turn", cands);
        let Some(&(idx, score)) = fin.first() else {
            self.emit_decision(u, &fin, None);
            return None;
        };
        let selected = cands[idx].clone();
        if let Act::Move(path) = &selected {
            if score < 0.0 && self.enemy_in_melee_range(u) {
                self.emit_decision(u, &fin, None);
                return None;
            }
            let path = simplify_path(path);
            if path.len() < 2 {
                self.emit_decision(u, &fin, None);
                return None;
            }
            let cells: Vec<usize> = path.iter().map(|p| self.grid.index(p.0, p.1)).collect();
            let mem = &mut self.units[u].mem;
            for c in cells {
                mem.visited.set(c);
            }
            mem.recent.push(*path.last().unwrap());
            if mem.recent.len() > 4 {
                mem.recent.remove(0);
            }
            let act = Act::Move(path);
            self.emit_decision(u, &fin, Some(&act));
            return Some(act);
        }
        self.emit_decision(u, &fin, Some(&selected));
        Some(selected)
    }

    /// `GenericController.select_reaction`: the first of the sorted options
    /// for Shield. A native Boss can decline a zero-value Redirect Attack.
    pub fn select_reaction(&mut self, u: usize, cands: Vec<Act>) -> Option<Act> {
        let (cands, fin) = self.decide(u, "select_reaction", cands);
        let chosen = fin.first().and_then(|&(i, score)| {
            let decline = matches!(cands[i], Act::RedirectAttack { would_hit: false, .. }) && score <= 0.0;
            (!decline).then(|| cands[i].clone())
        });
        self.emit_decision(u, &fin, chosen.as_ref());
        chosen
    }

    /// `GenericController.opportunity_attack_listener` -> `select_action`.
    pub fn opportunity_attack_listener(&mut self, reactor: usize, target: usize) -> Option<Act> {
        let mut actions = Vec::new();
        let preserve_turn = self.rule_version >= 6 && self.active_turners(target).iter().any(|&cleric| self.allies(reactor, cleric));
        if self.units[reactor].conscious() && !preserve_turn {
            self.attack_candidates(reactor, true, &mut actions);
        }
        // every candidate that may target the mover is retargeted at it
        let mut valid = Vec::new();
        for a in actions {
            if let Act::Attack { atk, .. } = a {
                let def = &self.units[reactor].t.attacks[atk];
                let ok = !self.units[target].dead()
                    && self.can_see(reactor, target)
                    && self.dist(reactor, target) * 5 <= def.range_max;
                if ok {
                    valid.push(Act::Attack { atk, target, reaction: true });
                }
            }
        }
        if self.units[reactor].incapacitated() || valid.is_empty() {
            if self.trace.on() {
                self.pending = Some((String::from("reaction"), vec![], vec![]));
            }
            self.emit_decision(reactor, &[], None);
            return None;
        }
        let (cands, fin) = self.decide(reactor, "reaction", valid);
        let chosen = fin.first().map(|&(i, _)| cands[i].clone());
        self.emit_decision(reactor, &fin, chosen.as_ref());
        chosen
    }
}

/// `utils/movement.simplify_path`.
pub fn simplify_path(path: &[Pos]) -> Vec<Pos> {
    if path.len() <= 1 {
        return path.to_vec();
    }
    let mut result: Vec<Pos> = Vec::new();
    for &p in path {
        if let Some(i) = result.iter().position(|q| *q == p) {
            result.truncate(i + 1);
        } else {
            result.push(p);
        }
    }
    result
}
