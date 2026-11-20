//! Curogana (High Elf Sorcerer 3, Draconic Sorcery): her SRD 5.2 spells
//! (`natural20/spell/srd52_spell_variants.py`, `sphere_save_spells.py`,
//! `sorcerous_burst_spell.py`, `dragons_breath_spell.py`, `blur_spell.py`,
//! `shield_spell.py`), Metamagic (`utils/metamagic.py`), Innate Sorcery
//! (`actions/innate_sorcery_action.py`), the area-target builders and their
//! optimizers (`utils/action_builder.py`), and the unseen-creature memory the
//! optimizers read (`utils/unseen_targets.py`).
//!
//! This work includes material from the System Reference Document 5.2.1
//! ("SRD 5.2.1") by Wizards of the Coast LLC, available at
//! https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative
//! Commons Attribution 4.0 International License.

use crate::content::{ability_mod, Ability, Dmg, SpellId};
use crate::effects::{EffKey, HookEv, HookKind, ObjKind};
use crate::engine::{Act, Fight, St, WeaponKind};
use crate::map::Pos;
use crate::spells::{attack_hit_crit, combinations, Cast, Mm, TargetTypes, DOWNED_FOE_WEIGHT, POINTLESS};

pub const BURST_TYPES: [Dmg; 7] = [Dmg::Acid, Dmg::Cold, Dmg::Fire, Dmg::Lightning, Dmg::Poison, Dmg::Psychic, Dmg::Thunder];
pub const ORB_TYPES: [Dmg; 6] = [Dmg::Acid, Dmg::Cold, Dmg::Fire, Dmg::Lightning, Dmg::Poison, Dmg::Thunder];
pub const BREATH_TYPES: [Dmg; 5] = [Dmg::Acid, Dmg::Cold, Dmg::Fire, Dmg::Lightning, Dmg::Poison];
/// Chance that two or more of 3d8 match: 1 - 8*7*6 / 8**3.
const P_LEAP_3D8: f64 = 1.0 - (8.0 * 7.0 * 6.0) / 512.0;
const AI_MAX_DISTINCT: usize = 2;
const HORIZON_EXHALES: f64 = 2.0;
const ACTION_BASELINE: f64 = 3.0;
const BLUR_HORIZON_ROUNDS: f64 = 3.0;

/// A `DieRoll` of a spell damage item (Empowered Spell rewrites its dice).
#[derive(Clone, Debug)]
pub struct RollObj {
    pub sides: i32,
    pub rolls: Vec<i32>,
    pub modifier: i32,
    pub halved: bool,
    /// `DieRoll.half()` records the roll it halves (`source_roll`).
    pub source: Option<usize>,
}

impl RollObj {
    /// `DieRoll.result()`: the sum plus modifier, floored in half when halved.
    pub fn amount(&self) -> i32 {
        let total: i32 = self.rolls.iter().sum::<i32>() + self.modifier;
        if self.halved {
            total.div_euclid(2)
        } else {
            total
        }
    }
}

/// One `spell_damage` item: `damage` (possibly a halved copy) and the
/// `damage_roll` it came from, both indices into the casting's roll list.
#[derive(Clone, Debug)]
pub struct DmgRef {
    pub t: usize,
    pub dt: Dmg,
    pub crit: bool,
    pub dmg: usize,
    pub droll: usize,
    pub has_save: bool,
    pub atk_roll_fmt: Option<String>,
}

/// Python float `%` for a positive divisor.
fn py_mod(a: f64, b: f64) -> f64 {
    let r = a % b;
    if r != 0.0 && (r < 0.0) != (b < 0.0) {
        r + b
    } else if r == 0.0 {
        0.0f64.copysign(b)
    } else {
        r
    }
}

/// `sorcerous_burst._expected_extra`.
fn expected_extra(pending: i32, cap: i32) -> f64 {
    if pending <= 0 || cap <= 0 {
        return 0.0;
    }
    1.0 + (1.0 / 8.0) * expected_extra(pending, cap - 1) + (7.0 / 8.0) * expected_extra(pending - 1, cap - 1)
}

fn comb(n: i32, k: i32) -> i64 {
    let mut r: i64 = 1;
    for i in 0..k {
        r = r * (n - i) as i64 / (i + 1) as i64;
    }
    r
}

/// `sorcerous_burst.expected_dice`.
pub(crate) fn expected_dice(base: i32, cap: i32) -> f64 {
    let mut total = base as f64;
    for eights in 0..=base {
        let p = comb(base, eights) as f64 * (1.0f64 / 8.0).powf(eights as f64) * (7.0f64 / 8.0).powf((base - eights) as f64);
        total += p * expected_extra(eights, cap);
    }
    total
}

impl Fight {
    // ------------------------------------------------------------------
    // Small queries
    // ------------------------------------------------------------------

    /// `innate_sorcery_active(entity)`.
    pub fn innate_active(&self, u: usize) -> bool {
        self.units[u].innate_until.map_or(false, |x| self.gt() < x)
    }

    /// `Entity.speed()`: walking (or flying) speed after Ray of Frost's
    /// `speed_override`; two rays still cost only 10 ft (N20-022).
    pub fn speed_of(&self, u: usize) -> i32 {
        let s = self.units[u].speed();
        if self.active_effects(u, EffKey::SpeedOverride).is_empty() {
            s
        } else {
            (s - 10).max(0)
        }
    }

    /// `battle.opponents_of(c)` (battle order, not dead).
    pub(crate) fn opponents_of(&self, c: usize) -> Vec<usize> {
        (0..self.units.len()).filter(|&o| !self.units[o].dead() && self.opposing(o, c)).collect()
    }

    /// `combat_comms.can_hear(listener)`.
    fn can_hear(&self, u: usize) -> bool {
        let unit = &self.units[u];
        !unit.dead() && !unit.unconscious()
    }

    // ------------------------------------------------------------------
    // Unseen creatures (`utils/unseen_targets.py`)
    // ------------------------------------------------------------------

    /// `sensed_creatures(battle, observer)`: heard and remembered unseen
    /// creatures (refreshing the memory). Returns (creature, square).
    pub fn sensed(&mut self, obs: usize) -> Vec<(usize, Pos)> {
        self.sensed_split(obs).0
    }

    /// `sensed_creatures` with the number of heard entries (they come first;
    /// the rest are `last_known`).
    pub fn sensed_split(&mut self, obs: usize) -> (Vec<(usize, Pos)>, usize) {
        let round = self.round;
        let mut heard: Vec<(usize, Pos)> = Vec::new();
        for c in 0..self.units.len() {
            if c == obs || self.units[c].dead() {
                continue;
            }
            if self.can_see(obs, c) {
                self.units[obs].unseen.retain(|e| e.0 != c);
                continue;
            }
            // `can_hear_location`: a hidden creature is never heard
            if self.can_hear(obs) && !self.units[c].hidden() && self.feet(obs, c) <= 60 {
                let pos = self.units[c].pos;
                let mem = &mut self.units[obs].unseen;
                match mem.iter_mut().find(|e| e.0 == c) {
                    Some(e) => *e = (c, pos, round),
                    None => mem.push((c, pos, round)),
                }
                heard.push((c, pos));
            }
        }
        // the remembered entries, in memory order; stale ones are dropped
        let n = heard.len();
        let mut out = heard;
        let mut i = 0;
        while i < self.units[obs].unseen.len() {
            let (c, pos, r) = self.units[obs].unseen[i];
            if out[..n].iter().any(|h| h.0 == c) {
                i += 1;
                continue;
            }
            if round - r > 2 || self.units[c].dead() {
                self.units[obs].unseen.remove(i);
                continue;
            }
            out.push((c, pos));
            i += 1;
        }
        (out, n)
    }

    /// `note_noise(battle, creature)`: an attack or a spell reveals the
    /// creature's square to everyone who can hear but not see it.
    pub fn note_noise(&mut self, src: usize) {
        if self.units[src].dead() {
            return;
        }
        let pos = self.units[src].pos;
        let round = self.round;
        for obs in 0..self.units.len() {
            if obs == src || !self.can_hear(obs) || self.can_see(obs, src) {
                continue;
            }
            let mem = &mut self.units[obs].unseen;
            match mem.iter_mut().find(|e| e.0 == src) {
                Some(e) => *e = (src, pos, round),
                None => mem.push((src, pos, round)),
            }
        }
    }

    // ------------------------------------------------------------------
    // Area shapes (`Map.squares_in_cone / _in_radius / _in_adjacent_cube`)
    // ------------------------------------------------------------------

    /// `Map.squares_in_cone(origin, direction, range, require_los)`, sorted.
    pub fn squares_in_cone(&self, origin: Pos, dir: Pos, range: i32, require_los: bool) -> Vec<Pos> {
        let (ox, oy) = origin;
        let (dx, dy) = ((dir.0 - ox) as f64, (dir.1 - oy) as f64);
        let facing = dy.atan2(dx);
        let half = 0.5f64.atan();
        let max_dist = range as f64 + 2f64.sqrt() / 2.0;
        let mut out = Vec::new();
        for x in ox - range..=ox + range {
            for y in oy - range..=oy + range {
                if (x, y) == (ox, oy) || !self.grid.in_bounds(x, y) {
                    continue;
                }
                let (vx, vy) = ((x - ox) as f64, (y - oy) as f64);
                if vx.hypot(vy) > max_dist {
                    continue;
                }
                let angle = vy.atan2(vx);
                let delta = py_mod(angle - facing + std::f64::consts::PI, 2.0 * std::f64::consts::PI) - std::f64::consts::PI;
                if delta.abs() > half {
                    continue;
                }
                if require_los && !self.grid.los(origin, (x, y)) {
                    continue;
                }
                out.push((x, y));
            }
        }
        out.sort();
        out
    }

    /// `Map.squares_in_radius(center, radius_ft, require_los)`, sorted.
    pub fn squares_in_radius(&self, c: Pos, radius_ft: i32, require_los: bool) -> Vec<Pos> {
        let r = (radius_ft / 5).max(0);
        let mut out = Vec::new();
        for x in c.0 - r..=c.0 + r {
            for y in c.1 - r..=c.1 + r {
                if !self.grid.in_bounds(x, y) {
                    continue;
                }
                if require_los && (x, y) != c && !self.grid.los(c, (x, y)) {
                    continue;
                }
                out.push((x, y));
            }
        }
        out.sort();
        out
    }

    /// `Map.squares_in_adjacent_cube` / `ThunderwaveSpell._cube_squares_from_face`.
    pub fn cube_squares(&self, origin: Pos, toward: Pos, size: i32) -> Vec<Pos> {
        let (ox, oy) = origin;
        let (dx, dy) = (toward.0 - ox, toward.1 - oy);
        let half = size / 2;
        let (x0, x1, y0, y1) = if dx.abs() >= dy.abs() {
            if dx > 0 {
                (ox + 1, ox + size, oy - half, oy + half)
            } else {
                (ox - size, ox - 1, oy - half, oy + half)
            }
        } else if dy > 0 {
            (ox - half, ox + half, oy + 1, oy + size)
        } else {
            (ox - half, ox + half, oy - size, oy - 1)
        };
        let mut out = Vec::new();
        for x in x0..=x1 {
            for y in y0..=y1 {
                if self.grid.in_bounds(x, y) && (x, y) != origin {
                    out.push((x, y));
                }
            }
        }
        out
    }

    /// `spell_ai.cone_directions`: the cone aim points (dx, dy in {-2, 0, 2}).
    pub(crate) fn cone_aims(&self, origin: Pos) -> Vec<Pos> {
        let mut out = Vec::new();
        for dx in -2..=2i32 {
            for dy in -2..=2i32 {
                if dx.abs() == 1 || dy.abs() == 1 || (dx == 0 && dy == 0) {
                    continue;
                }
                let p = (origin.0 + dx, origin.1 + dy);
                if self.grid.in_bounds(p.0, p.1) {
                    out.push(p);
                }
            }
        }
        out
    }

    /// Corpse tokens in an area (coverage count).
    fn corpses_in_squares(&self, squares: &[Pos], exclude: usize) -> u64 {
        let mut found: Vec<usize> = Vec::new();
        for &p in squares {
            if let Some(c) = self.token_at(p) {
                if c != exclude && self.units[c].dead() && !found.contains(&c) {
                    found.push(c);
                }
            }
        }
        found.len() as u64
    }

    /// `creatures_in_squares(map, squares, exclude)`: living creatures.
    pub(crate) fn creatures_in_squares(&self, squares: &[Pos], exclude: Option<usize>) -> Vec<usize> {
        let mut found = Vec::new();
        for &p in squares {
            if let Some(c) = self.token_at(p) {
                if Some(c) == exclude || self.units[c].dead() || found.contains(&c) {
                    continue;
                }
                found.push(c);
            }
        }
        found
    }

    // ------------------------------------------------------------------
    // Area-target builders and their optimizers (`action_builder`)
    // ------------------------------------------------------------------

    /// `_awareness` + `_score_squares`.
    fn score_squares(&self, u: usize, squares: &[Pos], sensed: &[Pos]) -> f64 {
        let mut score = 0.0;
        for &sq in squares {
            let ent = self.token_at(sq).filter(|&e| !self.units[e].dead());
            if sensed.contains(&sq) {
                // a creature seen standing there (an ally, a seen foe)
                // overrides the possibly stale memory (N20-020)
                let seen_or_ally =
                    ent.is_some_and(|e| (self.opposing(u, e) && self.can_see(u, e)) || self.allies(u, e));
                if !seen_or_ally {
                    score += 1.0;
                    continue;
                }
            }
            let Some(e) = ent else { continue };
            if self.opposing(u, e) {
                if self.can_see(u, e) {
                    score += if self.units[e].conscious() { 1.0 } else { 0.5 };
                }
            } else if self.allies(u, e) {
                score -= 1.0;
            }
        }
        score
    }

    /// Squares of unseen foes the caster senses (`_awareness`).
    fn sensed_foe_squares(&mut self, u: usize) -> Vec<Pos> {
        let entries = self.sensed(u);
        entries.into_iter().filter(|&(c, _)| !self.allies(u, c)).map(|e| e.1).collect()
    }

    /// `select_cone` with `optimize_conal_targets`.
    fn cone_target(&mut self, u: usize, range_sq: i32, require_los: bool) -> Option<Pos> {
        let cur = self.units[u].pos;
        let (w, h) = (self.grid.w, self.grid.h);
        let mut positions = Vec::new();
        for dx in -2..=2i32 {
            for dy in -2..=2i32 {
                if dx.abs() == 1 || dy.abs() == 1 || (dx == 0 && dy == 0) {
                    continue;
                }
                let (x, y) = (cur.0 + dx, cur.1 + dy);
                if x < 0 || x > w - 1 || y < 0 || y > h - 1 {
                    continue;
                }
                if self.squares_in_cone(cur, (x, y), range_sq, require_los).is_empty() {
                    continue;
                }
                positions.push((x, y));
            }
        }
        if positions.is_empty() {
            return None;
        }
        let sensed = self.sensed_foe_squares(u);
        let mut best: Option<Pos> = None;
        let mut best_score = 1.0;
        for p in positions {
            let squares = self.squares_in_cone(cur, p, range_sq, true);
            if !squares.is_empty() {
                let score = self.score_squares(u, &squares, &sensed);
                if score >= best_score {
                    best_score = score;
                    best = Some(p);
                }
            }
        }
        best
    }

    /// `select_cube` with `_optimize_cube_targets`.
    fn cube_target(&mut self, u: usize, size: i32) -> Option<Pos> {
        let cur = self.units[u].pos;
        let mut positions = Vec::new();
        for dx in -1..=1i32 {
            for dy in -1..=1i32 {
                if dx == 0 && dy == 0 {
                    continue;
                }
                let p = (cur.0 + dx, cur.1 + dy);
                if !self.grid.in_bounds(p.0, p.1) {
                    continue;
                }
                if self.cube_squares(cur, p, size).is_empty() {
                    continue;
                }
                positions.push(p);
            }
        }
        if positions.is_empty() {
            return None;
        }
        let sensed = self.sensed_foe_squares(u);
        let mut best: Option<Pos> = None;
        let mut best_score = 1.0;
        for p in positions {
            let squares = self.cube_squares(cur, p, size);
            if !squares.is_empty() {
                let score = self.score_squares(u, &squares, &sensed);
                if score >= best_score {
                    best_score = score;
                    best = Some(p);
                }
            }
        }
        best
    }

    /// `select_radius` (range, require_los from the caster) with
    /// `_optimize_radius_targets` (the sphere scored without line of sight).
    fn radius_target(&mut self, u: usize, range_ft: i32, radius_ft: i32) -> Option<Pos> {
        let cur = self.units[u].pos;
        let max_sq = (range_ft / 5).max(0);
        let mut positions = Vec::new();
        for dx in -max_sq..=max_sq {
            for dy in -max_sq..=max_sq {
                let (x, y) = (cur.0 + dx, cur.1 + dy);
                if !self.grid.in_bounds(x, y) {
                    continue;
                }
                if !self.grid.los(cur, (x, y)) {
                    continue;
                }
                positions.push((x, y));
            }
        }
        if positions.is_empty() {
            return None;
        }
        let sensed = self.sensed_foe_squares(u);
        let mut best: Option<Pos> = None;
        let mut best_score = 1.0;
        for p in positions {
            // the sphere's own line-of-sight rule from its center (N20-020)
            let squares = self.squares_in_radius(p, radius_ft, true);
            let score = self.score_squares(u, &squares, &sensed);
            if score >= best_score {
                best_score = score;
                best = Some(p);
            }
        }
        best
    }

    // ------------------------------------------------------------------
    // Candidates (`UndeadArena._spell_actions` for Curogana's spells)
    // ------------------------------------------------------------------

    /// `rank_damage_types(targets, types)[0]`: best summed multiplier, SRD order on ties.
    pub fn best_damage_type(&self, targets: &[usize], types: &[Dmg]) -> Dmg {
        let mut best = types[0];
        let mut best_sum = f64::NEG_INFINITY;
        for &k in types {
            let mut sum = 0.0;
            for &t in targets {
                sum += self.damage_multiplier(t, k);
            }
            if sum > best_sum {
                best_sum = sum;
                best = k;
            }
        }
        best
    }

    /// Multisets of `pool` of size `n` with optional `max_distinct` cap.
    fn multisets_inner(pool: &[usize], n: usize, max_distinct: Option<usize>) -> Vec<Vec<usize>> {
        let mut out = Vec::new();
        if pool.is_empty() {
            return out;
        }
        let mut idx = vec![0usize; n];
        loop {
            let combo: Vec<usize> = idx.iter().map(|&i| pool[i]).collect();
            let ok = match max_distinct {
                Some(cap) => {
                    let mut distinct = combo.clone();
                    distinct.dedup();
                    distinct.len() <= cap
                }
                None => true,
            };
            if ok {
                out.push(combo);
            }
            let mut i = n;
            let mut adv = false;
            while i > 0 {
                i -= 1;
                if idx[i] + 1 < pool.len() {
                    let v = idx[i] + 1;
                    for slot in &mut idx[i..] {
                        *slot = v;
                    }
                    adv = true;
                    break;
                }
            }
            if !adv {
                return out;
            }
        }
    }

    fn multisets(pool: &[usize], n: usize) -> Vec<Vec<usize>> {
        Fight::multisets_inner(pool, n, Some(AI_MAX_DISTINCT))
    }

    /// Human `auto_target=False` version of `sorcerer_builds`: all target splits and all valid AoE aim points.
    pub(crate) fn human_sorcerer_builds(&self, u: usize, spell: SpellId, at_level: i32) -> Vec<(Vec<usize>, bool, Option<Pos>, Option<Dmg>)> {
        use SpellId::*;
        let mut out = Vec::new();
        let origin = self.units[u].pos;
        match spell {
            SorcerousBurst | Firebolt | RayOfFrost | ChromaticOrb => {
                let range = match spell {
                    SorcerousBurst | Firebolt => 120,
                    RayOfFrost => 60,
                    _ => 90,
                };
                for t in self.acquire_targets(u, range, TargetTypes::Enemies) {
                    let dt = match spell {
                        SorcerousBurst => Some(self.best_damage_type(&[t], &BURST_TYPES)),
                        ChromaticOrb => Some(self.best_damage_type(&[t], &ORB_TYPES)),
                        _ => None,
                    };
                    out.push((vec![t], false, None, dt));
                }
            }
            MagicMissile | ScorchingRay => {
                let (n, range) = if spell == MagicMissile { (3 + (at_level - 1), 120) } else { (3 + (at_level - 2).max(0), 120) };
                let mut pool = self.acquire_targets(u, range, TargetTypes::Enemies);
                if pool.is_empty() && spell == MagicMissile {
                    pool = self.acquire_targets(u, range, TargetTypes::Allies);
                }
                for combo in Fight::multisets_inner(&pool, n as usize, None) {
                    out.push((combo, true, None, None));
                }
            }
            Blur => out.push((vec![u], false, None, None)),
            DragonsBreath => {
                let mut pool: Vec<usize> = (0..self.units.len())
                    .filter(|&t| !self.units[t].dead() && self.allies(u, t) && self.can_see(u, t) && self.feet(u, t) <= 5)
                    .collect();
                if !pool.contains(&u) {
                    pool.push(u);
                }
                for t in pool {
                    out.push((vec![t], false, None, None));
                }
            }
            AcidSplash | Shatter => {
                let max_sq = 12;
                for dx in -max_sq..=max_sq {
                    for dy in -max_sq..=max_sq {
                        let (nx, ny) = (origin.0 + dx, origin.1 + dy);
                        if !self.grid.in_bounds(nx, ny) {
                            continue;
                        }
                        if (spell == Shatter || spell == AcidSplash) && !self.grid.los(origin, (nx, ny)) {
                            continue;
                        }
                        out.push((Vec::new(), false, Some((nx, ny)), None));
                    }
                }
            }
            BurningHands => {
                for p in self.cone_aims(origin) {
                    if !self.squares_in_cone(origin, p, 3, true).is_empty() {
                        out.push((Vec::new(), false, Some(p), None));
                    }
                }
            }
            Thunderwave => {
                for dx in -1..=1 {
                    for dy in -1..=1 {
                        if dx == 0 && dy == 0 {
                            continue;
                        }
                        let p = (origin.0 + dx, origin.1 + dy);
                        if self.grid.in_bounds(p.0, p.1) && !self.cube_squares(origin, p, 3).is_empty() {
                            out.push((Vec::new(), false, Some(p), None));
                        }
                    }
                }
            }
            Command => {
                let (range, types, num, min) = (60, TargetTypes::Enemies, 1 + (at_level - 1).max(0), 1);
                let pool = self.acquire_targets(u, range, types);
                if num == 1 {
                    for t in pool {
                        out.push((vec![t], false, None, None));
                    }
                } else {
                    let mut combos = Vec::new();
                    for k in min..=num {
                        combinations(&pool, k as usize, &mut combos);
                    }
                    for c in combos {
                        out.push((c, true, None, None));
                    }
                }
            }
            _ => {}
        }
        out
    }

    /// The built (target, point) sets of one of Curogana's spells at
    /// `at_level`, before the scenario filters.
    pub(crate) fn sorcerer_builds(&mut self, u: usize, spell: SpellId, at_level: i32) -> Vec<(Vec<usize>, bool, Option<Pos>, Option<Dmg>)> {
        use SpellId::*;
        let mut out = Vec::new();
        match spell {
            SorcerousBurst | Firebolt | RayOfFrost | ChromaticOrb => {
                let range = match spell {
                    SorcerousBurst | Firebolt => 120,
                    RayOfFrost => 60,
                    _ => 90,
                };
                for t in self.acquire_targets(u, range, TargetTypes::Enemies) {
                    let dt = match spell {
                        SorcerousBurst => Some(self.best_damage_type(&[t], &BURST_TYPES)),
                        ChromaticOrb => Some(self.best_damage_type(&[t], &ORB_TYPES)),
                        _ => None,
                    };
                    out.push((vec![t], false, None, dt));
                }
            }
            MagicMissile | ScorchingRay => {
                let (n, range) = if spell == MagicMissile { (3 + (at_level - 1), 120) } else { (3 + (at_level - 2).max(0), 120) };
                // `prefer_enemies`: enemies in range when there are any
                let mut pool = self.acquire_targets(u, range, TargetTypes::Enemies);
                if pool.is_empty() && spell == MagicMissile {
                    pool = self.acquire_targets(u, range, TargetTypes::Allies);
                }
                for combo in Fight::multisets(&pool, n as usize) {
                    out.push((combo, true, None, None));
                }
            }
            Blur => out.push((vec![u], false, None, None)),
            DragonsBreath => {
                let mut pool: Vec<usize> = (0..self.units.len())
                    .filter(|&t| !self.units[t].dead() && self.allies(u, t) && self.can_see(u, t) && self.feet(u, t) <= 5)
                    .collect();
                if !pool.contains(&u) {
                    pool.push(u);
                }
                for t in pool {
                    out.push((vec![t], false, None, None));
                }
            }
            AcidSplash => {
                if let Some(p) = self.radius_target(u, 60, 5) {
                    out.push((Vec::new(), false, Some(p), None));
                }
            }
            Shatter => {
                if let Some(p) = self.radius_target(u, 60, 10) {
                    out.push((Vec::new(), false, Some(p), None));
                }
            }
            BurningHands => {
                if let Some(p) = self.cone_target(u, 3, true) {
                    out.push((Vec::new(), false, Some(p), None));
                }
            }
            Thunderwave => {
                if let Some(p) = self.cube_target(u, 3) {
                    out.push((Vec::new(), false, Some(p), None));
                }
            }
            Command => {
                let (range, types, num, min) = (60, TargetTypes::Enemies, 1 + (at_level - 1).max(0), 1);
                let pool = self.acquire_targets(u, range, types);
                if num == 1 {
                    for t in pool {
                        out.push((vec![t], false, None, None));
                    }
                } else {
                    let mut combos = Vec::new();
                    for k in min..=num {
                        combinations(&pool, k as usize, &mut combos);
                    }
                    for c in combos {
                        out.push((c, true, None, None));
                    }
                }
            }
            _ => {}
        }
        out
    }

    /// `metamagic.variants(action)`: Empowered then Heightened, when known,
    /// affordable and eligible.
    pub(crate) fn metamagic_variants(&self, u: usize, base: &Cast, out: &mut Vec<Act>) {
        use SpellId::*;
        let Some(caster) = self.units[u].t.caster.as_ref() else { return };
        if caster.metamagic.is_empty() {
            return;
        }
        let knows = |m: Mm| caster.metamagic.contains(&m);
        let sp = self.units[u].sorcery_points;
        // eligible: Empowered needs a YAML `damage_type`; Heightened a save
        let empowered = matches!(base.spell, AcidSplash | Firebolt | RayOfFrost | BurningHands | Thunderwave | Shatter
            | ScorchingRay | MagicMissile | ChromaticOrb | SacredFlame | GuidingBolt);
        let heightened = matches!(base.spell, AcidSplash | BurningHands | Thunderwave | Shatter | Command | SacredFlame);
        if knows(Mm::Empowered) && sp >= Mm::Empowered.cost() && empowered {
            let mut v = base.clone();
            v.mm = Some(Mm::Empowered);
            out.push(Act::Spell(Box::new(v)));
        }
        if knows(Mm::Heightened) && sp >= Mm::Heightened.cost() && heightened {
            let mut v = base.clone();
            v.mm = Some(Mm::Heightened);
            out.push(Act::Spell(Box::new(v)));
        }
    }

    /// `metamagic_ai_delta(action, battle, base_score)`.
    pub(crate) fn metamagic_delta(&self, c: &Cast, base_score: f64) -> f64 {
        let Some(mm) = c.mm else { return 0.0 };
        let base = base_score.max(0.0);
        let cost = 0.6 * mm.cost() as f64;
        match mm {
            Mm::Empowered => 0.15 * base - cost,
            Mm::Heightened => {
                let single = !c.multi && !c.targets.is_empty();
                0.25 * base / (if single { 1.0 } else { 2.0 }) - cost
            }
        }
    }

    /// Class-feature candidates of the sorcerer and of a Dragon's Breath breather.
    pub fn sorcerer_feature_candidates(&self, u: usize, out: &mut Vec<Act>) {
        let unit = &self.units[u];
        if unit.t.innate_sorcery && unit.innate_sorcery > 0 && !self.innate_active(u) && unit.bonus > 0 {
            out.push(Act::InnateSorcery);
        }
        if self.active_breath(u).is_some() && unit.action > 0 {
            out.push(Act::DragonsBreathExhale);
        }
    }

    // ------------------------------------------------------------------
    // AI values (no dice)
    // ------------------------------------------------------------------

    /// `spell_ai.side_weight`.
    fn side_weight(&self, caster: usize, c: usize) -> f64 {
        let unit = &self.units[c];
        if unit.dead() {
            return 0.0;
        }
        let downed = !unit.conscious();
        if c == caster || self.allies(caster, c) {
            return if downed { -2.0 } else { -1.0 };
        }
        if self.opposing(caster, c) {
            return if downed { 0.25 } else { 1.0 };
        }
        0.0
    }

    /// `save_for_half_damage` (before the type multiplier).
    fn save_for_half(&self, c: usize, ab: Ability, dc: i32, full: f64, half: bool, disadvantage: bool) -> f64 {
        let p_fail = self.save_fail_probability_with_disadvantage(c, ab, dc, disadvantage);
        p_fail * full + if half { (1.0 - p_fail) * full / 2.0 } else { 0.0 }
    }

    /// `area_value` of a save-for-half (or no-damage-on-save) area.
    fn area_save_value(&self, src: usize, creatures: &[usize], ab: Ability, dc: i32, full: f64, dt: Dmg, half: bool, shatter: bool) -> f64 {
        let mut total = 0.0;
        for &c in creatures {
            let w = self.side_weight(src, c);
            if w != 0.0 {
                let amount = self.save_for_half(c, ab, dc, full, half, shatter && self.units[c].t.construct);
                total += w * (self.damage_multiplier(c, dt) * amount);
            }
        }
        total
    }

    /// `single_target_attack_value`.
    fn single_attack_value(&self, caster: usize, t: usize, dt: Dmg, hit: f64, crit: f64, range: i32, cantrip: bool) -> f64 {
        if !self.opposing(caster, t) {
            return POINTLESS;
        }
        let mult = self.damage_multiplier(t, dt);
        if mult <= 0.0 {
            return POINTLESS;
        }
        let (p_hit, p_crit) = self.spell_attack_estimate(caster, t, WeaponKind::spell_ranged(range));
        let miss = if cantrip && self.units[caster].t.potent_cantrip { hit / 2.0 } else { 0.0 };
        let mut value = mult * ((p_hit - p_crit) * hit + p_crit * crit + (1.0 - p_hit) * miss);
        if !self.units[t].conscious() {
            value *= DOWNED_FOE_WEIGHT;
        }
        value
    }

    /// `_clamped_multi_value` over a sorted multiset of targets.
    fn clamped_multi_value(&self, caster: usize, targets: &[usize], per_hit: impl Fn(&Fight, usize) -> f64) -> f64 {
        let mut uniq: Vec<(usize, i32)> = Vec::new();
        for &t in targets {
            match uniq.iter_mut().find(|e| e.0 == t) {
                Some(e) => e.1 += 1,
                None => uniq.push((t, 1)),
            }
        }
        if uniq.is_empty() {
            return POINTLESS;
        }
        let mut total = 0.0;
        for (t, count) in uniq {
            if !self.opposing(caster, t) {
                return POINTLESS;
            }
            let expected = count as f64 * per_hit(self, t);
            if !self.units[t].conscious() {
                total += expected * DOWNED_FOE_WEIGHT;
            } else {
                total += expected.min(self.units[t].hp.max(1) as f64);
            }
        }
        if total > 0.0 {
            total
        } else {
            POINTLESS
        }
    }

    /// Chromatic Orb leap candidates' best value (`_pick_leap`).
    fn orb_leap(&self, caster: usize, from: usize, used: &[usize], dt: Dmg, hit: f64, crit: f64) -> (Option<usize>, f64) {
        let mut best = None;
        let mut best_value = 0.0;
        for foe in self.opponents_of(caster) {
            if used.contains(&foe) || !self.units[foe].conscious() || !self.can_see(caster, foe) || self.feet(from, foe) > 30 {
                continue;
            }
            let v = self.single_attack_value(caster, foe, dt, hit, crit, 90, false);
            if v > best_value {
                best = Some(foe);
                best_value = v;
            }
        }
        (best, best_value)
    }

    /// `active_breath(entity)`: the live Dragon's Breath this creature can exhale.
    pub fn active_breath(&self, u: usize) -> Option<u32> {
        let gt = self.gt();
        let list = self.units[u].effects.iter().find(|(k, _)| *k == EffKey::DragonsBreath)?;
        for e in list.1.iter().rev() {
            if let ObjKind::Breath { .. } = self.objs[e.obj as usize].kind {
                if !self.objs[e.obj as usize].ended && e.exp.map_or(true, |x| x > gt) {
                    return Some(e.obj);
                }
            }
        }
        None
    }

    /// `active_blur(entity)`.
    pub(crate) fn active_blur(&self, u: usize) -> Option<u32> {
        let gt = self.gt();
        let list = self.units[u].effects.iter().find(|(k, _)| *k == EffKey::AttackedAdvantageModifier)?;
        for e in &list.1 {
            if matches!(self.objs[e.obj as usize].kind, ObjKind::Blur) && !self.objs[e.obj as usize].ended && e.exp.map_or(true, |x| x > gt) {
                return Some(e.obj);
            }
        }
        None
    }

    /// `cone_value(breather, ..., origin, aim, damage_type, dice, dc)`.
    fn cone_value(&self, breather: usize, origin: Pos, aim: Pos, dt: Dmg, dice: i32, dc: i32) -> f64 {
        let squares = self.squares_in_cone(origin, aim, 3, true);
        let creatures = self.creatures_in_squares(&squares, Some(breather));
        let full = dice as f64 * 3.5;
        self.area_save_value(breather, &creatures, Ability::Dex, dc, full, dt, true, false)
    }

    /// `best_cone(breather, ...)`: (value, aim) of the best exhale.
    pub(crate) fn best_cone(&self, breather: usize, dt: Dmg, dice: i32, dc: i32) -> (f64, Option<Pos>) {
        let origin = self.units[breather].pos;
        let mut best_value = 0.0;
        let mut best_aim = None;
        for aim in self.cone_aims(origin) {
            let v = self.cone_value(breather, origin, aim, dt, dice, dc);
            if best_aim.is_none() || v > best_value + 1e-9 {
                best_value = v;
                best_aim = Some(aim);
            }
        }
        (best_value, best_aim)
    }

    /// `attack_profiles(creature)`: (bonus, average damage, melee, reach ft);
    /// riders without a `condition` only (`additional_damage_entries(action)`).
    pub(crate) fn attack_profiles(&self, c: usize) -> Vec<(i32, f64, bool, i32)> {
        let unit = &self.units[c];
        let mut out = Vec::new();
        if !unit.t.pc {
            for a in &unit.t.attacks {
                // one profile per YAML action: an NPC's thrown row (G8b
                // Minion dagger) is the melee row's `thrown:` key
                if a.save_attack.is_some() || a.thrown {
                    continue;
                }
                let mut dmg = 0.0 + a.damage.count as f64 * (a.damage.sides + 1) as f64 / 2.0 + a.damage.modifier as f64;
                for (d, _) in &a.additional {
                    dmg += d.count as f64 * (d.sides + 1) as f64 / 2.0 + d.modifier as f64;
                }
                out.push((a.to_hit, dmg, !a.ranged, a.range_max));
            }
        }
        if out.is_empty() {
            let m = ability_mod(unit.t.abil[0]).max(ability_mod(unit.t.abil[1]));
            let bonus = unit.t.prof_bonus + m;
            out.push((bonus, 4.5 + m as f64, true, 5));
            out.push((bonus, 4.5 + m as f64, false, 80));
        }
        out
    }

    pub(crate) fn attacks_per_round(&self, c: usize) -> i32 {
        self.units[c].t.multiattack.iter().map(|combo| combo.len() as i32).max().unwrap_or(1)
    }

    pub(crate) fn reach_limit(&self, foe: usize, melee: bool, reach: i32) -> i32 {
        reach + if melee { self.speed_of(foe) } else { 0 }
    }

    /// `blur_prevented_per_round(caster, battle)`.
    fn blur_prevented_per_round(&self, caster: usize) -> f64 {
        let ac = self.armor_class(caster);
        let mut side = vec![caster];
        for a in 0..self.units.len() {
            if a != caster && !self.units[a].dead() && self.allies(a, caster) && self.units[a].conscious() {
                side.push(a);
            }
        }
        let mut total = 0.0;
        for foe in self.opponents_of(caster) {
            if !self.units[foe].conscious() || self.units[foe].incapacitated() {
                continue;
            }
            let profiles = self.attack_profiles(foe);
            let dist = self.feet(foe, caster);
            let mut best = 0.0f64;
            for &(bonus, damage, melee, reach) in &profiles {
                if dist > self.reach_limit(foe, melee, reach) {
                    continue;
                }
                let p_normal = attack_hit_crit(bonus, ac, false, false).0;
                let p_blurred = attack_hit_crit(bonus, ac, false, true).0;
                best = best.max((p_normal - p_blurred) * damage);
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

    /// `spell_ai.ac_gain_prevented_per_round(target, battle, ac_now, ac_new)`
    /// (Mage Armor): Blur's foe model with the hit chance lost to the higher
    /// AC (no Disadvantage), shared by the target's conscious side.
    pub(crate) fn ac_gain_prevented_per_round(&self, target: usize, ac_now: i32, ac_new: i32) -> f64 {
        if ac_new <= ac_now {
            return 0.0;
        }
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
                let gained = attack_hit_crit(bonus, ac_now, false, false).0 - attack_hit_crit(bonus, ac_new, false, false).0;
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

    /// `spell_ai.concentration_value(caster)` for the sorcerer's spells.
    fn concentration_value(&self, caster: usize) -> f64 {
        let Some(held) = self.units[caster].concentration else { return 0.0 };
        let obj = &self.objs[held as usize];
        match obj.kind {
            ObjKind::Breath { target, dt, dice } => {
                if obj.ended || self.active_breath(target) != Some(held) {
                    return 0.0;
                }
                let dc = self.spell_dc(obj.source);
                let per = self.best_cone(target, dt, dice, dc).0;
                (HORIZON_EXHALES * (per - ACTION_BASELINE).max(0.0)).max(0.0)
            }
            ObjKind::Blur => {
                if obj.ended || self.active_blur(obj.source) != Some(held) {
                    return 0.0;
                }
                (BLUR_HORIZON_ROUNDS * self.blur_prevented_per_round(obj.source)).max(0.0)
            }
            _ => 4.0,
        }
    }

    /// `ai_value` of Curogana's spells (before Metamagic).
    pub(crate) fn sorcerer_ai_value(&self, u: usize, c: &Cast) -> f64 {
        use SpellId::*;
        let t0 = c.targets.first().copied();
        let dc = self.spell_dc(u);
        match c.spell {
            SorcerousBurst => {
                let Some(t) = t0 else { return POINTLESS };
                let cap = ability_mod(self.units[u].t.abil[Ability::Cha.idx()]).max(0);
                let hit = 4.5 * expected_dice(1, cap);
                let crit = 4.5 * expected_dice(2, cap);
                self.single_attack_value(u, t, c.dt.unwrap_or(Dmg::Acid), hit, crit, 120, true)
            }
            Firebolt => {
                let Some(t) = t0 else { return POINTLESS };
                self.single_attack_value(u, t, Dmg::Fire, 1.0 * 1.0 * 11.0 / 2.0, 1.0 * 2.0 * 11.0 / 2.0, 120, true)
            }
            RayOfFrost => {
                let Some(t) = t0 else { return POINTLESS };
                self.single_attack_value(u, t, Dmg::Cold, 1.0 * 1.0 * 9.0 / 2.0, 1.0 * 2.0 * 9.0 / 2.0, 60, true)
            }
            ChromaticOrb => {
                let Some(t) = t0 else { return POINTLESS };
                let n = 3 + (c.at_level - 1).max(0);
                let hit = (n * 1) as f64 * 4.5;
                let crit = (n * 2) as f64 * 4.5;
                let dt = c.dt.unwrap_or(Dmg::Acid);
                let first = self.single_attack_value(u, t, dt, hit, crit, 90, false);
                if first <= 0.0 {
                    return first;
                }
                let p_hit = self.spell_attack_estimate(u, t, WeaponKind::spell_ranged(90)).0;
                let (_, leap) = self.orb_leap(u, t, &[t], dt, hit, crit);
                first + p_hit * P_LEAP_3D8 * leap
            }
            MagicMissile => self.clamped_multi_value(u, &c.targets, |f, t| {
                if f.has_spell_effect(t, EffKey::AcBonus, SpellId::Shield) {
                    0.0
                } else {
                    3.5 * f.damage_multiplier(t, Dmg::Force)
                }
            }),
            ScorchingRay => self.clamped_multi_value(u, &c.targets, |f, t| {
                let (p_hit, p_crit) = f.spell_attack_estimate(u, t, WeaponKind::spell_ranged(120));
                let mult = f.damage_multiplier(t, Dmg::Fire);
                mult * ((p_hit - p_crit) * 7.0 + p_crit * 2.0 * 7.0)
            }),
            AcidSplash | Shatter => {
                let Some(p) = c.point else { return POINTLESS };
                let (radius, ab, full, dt, half) = if c.spell == AcidSplash {
                    (5, Ability::Dex, 3.5, Dmg::Acid, self.units[u].t.potent_cantrip)
                } else {
                    (10, Ability::Con, (3 + (c.at_level - 2).max(0)) as f64 * 4.5, Dmg::Thunder, true)
                };
                let creatures = self.creatures_in_squares(&self.squares_in_radius(p, radius, true), None);
                let v = self.area_save_value(u, &creatures, ab, dc, full, dt, half, c.spell == Shatter);
                if v > 0.0 {
                    v
                } else {
                    POINTLESS
                }
            }
            BurningHands => {
                let Some(p) = c.point else { return POINTLESS };
                let squares = self.squares_in_cone(self.units[u].pos, p, 3, true);
                let creatures = self.creatures_in_squares(&squares, Some(u));
                let full = (3 + (c.at_level - 1).max(0)) as f64 * 3.5;
                let v = self.area_save_value(u, &creatures, Ability::Dex, dc, full, Dmg::Fire, true, false);
                if v > 0.0 {
                    v
                } else {
                    POINTLESS
                }
            }
            Thunderwave => {
                let Some(p) = c.point else { return POINTLESS };
                let squares = self.cube_squares(self.units[u].pos, p, 3);
                let creatures = self.creatures_in_squares(&squares, Some(u));
                let full = (2 + (c.at_level - 1).max(0)) as f64 * 4.5;
                let v = self.area_save_value(u, &creatures, Ability::Con, dc, full, Dmg::Thunder, true, false);
                if v > 0.0 {
                    v
                } else {
                    POINTLESS
                }
            }
            DragonsBreath => {
                let Some(b) = t0 else { return POINTLESS };
                if self.units[b].dead() || (b != u && !self.allies(u, b)) || self.active_breath(b).is_some() {
                    return POINTLESS;
                }
                let dt = self.breath_type(u);
                let dice = 3 + (c.at_level - 2).max(0);
                let mut per = self.best_cone(b, dt, dice, dc).0;
                if per <= ACTION_BASELINE {
                    let reach = self.speed_of(b) + 15;
                    let full = dice as f64 * 3.5;
                    for foe in self.visible_foes(u) {
                        if self.feet(b, foe) <= reach {
                            let single = self.damage_multiplier(foe, dt) * self.save_for_half(foe, Ability::Dex, dc, full, true, false);
                            per = per.max(0.75 * single);
                        }
                    }
                }
                let gross = HORIZON_EXHALES * (per - ACTION_BASELINE);
                if gross <= 0.0 {
                    return POINTLESS;
                }
                let net = gross - self.concentration_value(u);
                if net > 0.0 {
                    net
                } else {
                    POINTLESS
                }
            }
            Blur => {
                if self.active_blur(u).is_some() {
                    return POINTLESS;
                }
                let gross = BLUR_HORIZON_ROUNDS * self.blur_prevented_per_round(u);
                if gross <= 0.0 {
                    return POINTLESS;
                }
                let net = gross - self.concentration_value(u);
                if net > 0.0 {
                    net
                } else {
                    POINTLESS
                }
            }
            _ => 0.0,
        }
    }

    fn visible_foes(&self, caster: usize) -> Vec<usize> {
        self.opponents_of(caster).into_iter().filter(|&f| self.units[f].conscious() && self.can_see(caster, f)).collect()
    }

    /// `DragonsBreathSpell.damage_type_for` with `auto`.
    fn breath_type(&self, caster: usize) -> Dmg {
        let foes = self.visible_foes(caster);
        self.best_damage_type(&foes, &BREATH_TYPES)
    }

    /// Innate Sorcery and the exhale (`ai_value`).
    pub(crate) fn sorcerer_feature_value(&self, u: usize, act: &Act) -> f64 {
        match act {
            Act::InnateSorcery => {
                if self.innate_active(u) {
                    return -1.0;
                }
                for e in self.opponents_of(u) {
                    if self.units[e].conscious() && self.can_see(u, e) {
                        return 4.0;
                    }
                }
                -1.0
            }
            Act::DragonsBreathExhale => {
                let Some(obj) = self.active_breath(u) else { return POINTLESS };
                let ObjKind::Breath { dt, dice, .. } = self.objs[obj as usize].kind else { return POINTLESS };
                let dc = self.spell_dc(self.objs[obj as usize].source);
                let (_, aim) = self.best_cone(u, dt, dice, dc);
                let Some(aim) = aim else { return POINTLESS };
                let v = self.cone_value(u, self.units[u].pos, aim, dt, dice, dc);
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
    // Resolution
    // ------------------------------------------------------------------

    fn new_roll(&mut self, u: usize, tag: &str, n: i32, sides: i32, modifier: i32, rolls: &mut Vec<RollObj>) -> usize {
        let r = self.roll_dice(u, tag, n, sides);
        rolls.push(RollObj { sides, rolls: r, modifier, halved: false, source: None });
        rolls.len() - 1
    }

    fn half_of(rolls: &mut Vec<RollObj>, i: usize) -> usize {
        let mut h = rolls[i].clone();
        h.halved = true;
        h.source = Some(i);
        rolls.push(h);
        rolls.len() - 1
    }

    /// `SaveCheck.make(creature, ability, dc)`: Paralyzed (STR/DEX) and
    /// downed (STR/DEX) creatures fail without rolling (`roll=None` -> `rolled=false`).
    fn save_check(&mut self, c: usize, ab: Ability, dc: i32, disadvantage: bool) -> (bool, bool) {
        if matches!(ab, Ability::Str | Ability::Dex) && (self.units[c].has(St::Paralyzed) || !self.units[c].conscious()) {
            return (false, false);
        }
        (self.save_throw_disadvantage(c, ab, disadvantage).0 >= dc, true)
    }

    /// `push_from(map, x, y, distance=10, reserved=...)` for a 1x1 creature:
    /// the push stops short of unplaceable and reserved squares.
    fn push_square(&self, t: usize, from: Pos, reserved: &[Pos]) -> Pos {
        let (x, y) = self.units[t].pos;
        let (px, py) = from;
        let d = 10;
        let (mut ox, mut oy): (i32, i32) = (0, 0);
        if px == x && py != y {
            oy = if py < y { d } else { -d };
        } else if py == y && px != x {
            ox = if px < x { d } else { -d };
        } else if (px, py) == (x - 1, y - 1) {
            ox = d;
            oy = d;
        } else if (px, py) == (x + 1, y - 1) {
            ox = -d;
            oy = d;
        } else if (px, py) == (x - 1, y + 1) {
            ox = d;
            oy = -d;
        } else if (px, py) == (x + 1, y + 1) {
            ox = -d;
            oy = -d;
        } else {
            if px < x {
                ox = d;
            } else if px > x {
                ox = -d;
            }
            if py < y {
                oy = d;
            } else if py > y {
                oy = -d;
            }
            if ox == 0 && oy == 0 {
                return (x, y);
            }
        }
        let (ox, oy) = (ox.div_euclid(5), oy.div_euclid(5));
        if ox == 0 && oy == 0 {
            return (x, y);
        }
        let (sx, sy) = (ox.signum(), oy.signum());
        let mut best = (x, y);
        if ox == 0 {
            for step in 1..=oy.abs() {
                let n = (x, y + step * sy);
                if self.grid.in_bounds(n.0, n.1) && self.placeable(t, n) && !reserved.contains(&n) {
                    best = n;
                } else {
                    break;
                }
            }
        } else if oy == 0 {
            for step in 1..=ox.abs() {
                let n = (x + step * sx, y);
                if self.grid.in_bounds(n.0, n.1) && self.placeable(t, n) && !reserved.contains(&n) {
                    best = n;
                } else {
                    break;
                }
            }
        } else {
            let max_steps = ox.abs().max(oy.abs());
            for step in 1..=max_steps {
                let progress = step as f64 / max_steps as f64;
                let n = (x + (ox as f64 * progress) as i32, y + (oy as f64 * progress) as i32);
                if self.grid.in_bounds(n.0, n.1) && self.placeable(t, n) && !reserved.contains(&n) {
                    best = n;
                } else {
                    break;
                }
            }
        }
        best
    }

    /// Resolve one of Curogana's spells: the draws, as result items.
    pub(crate) fn resolve_sorcerer(&mut self, u: usize, c: &Cast, items: &mut Vec<crate::spells::Item>, rolls: &mut Vec<RollObj>) {
        use crate::spells::Item;
        use SpellId::*;
        let t0 = c.targets.first().copied();
        match c.spell {
            SorcerousBurst | Firebolt | RayOfFrost => {
                let action_t = t0.unwrap();
                let range = match c.spell {
                    RayOfFrost => 60,
                    _ => 120,
                };
                let (hit, nat20, dismiss, t, atk_fmt) = self.evaluate_spell_attack(u, action_t, c.spell, WeaponKind::spell_ranged(range));
                for d in dismiss {
                    items.push(Item::Dismiss(d.0, d.1));
                }
                if hit || self.units[u].t.potent_cantrip {
                    match c.spell {
                        SorcerousBurst => {
                            let dt = c.dt.unwrap_or(Dmg::Acid);
                            let cap = ability_mod(self.units[u].t.abil[Ability::Cha.idx()]).max(0);
                            let n = if nat20 { 2 } else { 1 };
                            let mut faces = self.roll_dice(u, "spells.sorcerous_burst", n, 8);
                            let mut pending = faces.iter().filter(|&&f| f == 8).count() as i32;
                            let mut extra = 0;
                            while pending > 0 && extra < cap {
                                let f = self.roll_dice(u, "spells.sorcerous_burst", 1, 8)[0];
                                faces.push(f);
                                extra += 1;
                                pending -= 1;
                                if f == 8 {
                                    pending += 1;
                                }
                            }
                            rolls.push(RollObj { sides: 8, rolls: faces, modifier: 0, halved: false, source: None });
                            let i = rolls.len() - 1;
                            items.push(Item::RDamage(DmgRef { t, dt, crit: nat20, dmg: if hit { i } else { Fight::half_of(rolls, i) }, droll: i, has_save: false, atk_roll_fmt: atk_fmt }));
                        }
                        Firebolt => {
                            let i = self.new_roll(u, "spells.generic_damage", if nat20 { 2 } else { 1 }, 10, 0, rolls);
                            items.push(Item::RDamage(DmgRef { t, dt: Dmg::Fire, crit: nat20, dmg: if hit { i } else { Fight::half_of(rolls, i) }, droll: i, has_save: false, atk_roll_fmt: atk_fmt }));
                        }
                        _ => {
                            let i = self.new_roll(u, "spells.ray_of_frost", if nat20 { 2 } else { 1 }, 8, 0, rolls);
                            items.push(Item::RDamage(DmgRef { t, dt: Dmg::Cold, crit: nat20, dmg: if hit { i } else { Fight::half_of(rolls, i) }, droll: i, has_save: false, atk_roll_fmt: atk_fmt }));
                            if hit {
                                items.push(Item::RayOfFrost { t, action_t });
                            }
                        }
                    }
                } else {
                    items.push(Item::SpellMiss { t, has_save: false, atk_roll_fmt: atk_fmt });
                }
            }
            ChromaticOrb => {
                let mut target = t0.unwrap();
                let dt = c.dt.unwrap_or(Dmg::Acid);
                let mut leaps_left = c.at_level.max(1);
                let mut used = vec![target];
                let n = 3 + (c.at_level - 1).max(0);
                let hit_dmg = (n * 1) as f64 * 4.5;
                let crit_dmg = (n * 2) as f64 * 4.5;
                loop {
                    let (hit, nat20, dismiss, hit_t, atk_fmt) = self.evaluate_spell_attack(u, target, ChromaticOrb, WeaponKind::spell_ranged(90));
                    target = hit_t;
                    if !used.contains(&target) {
                        used.push(target);
                    }
                    for d in dismiss {
                        items.push(Item::Dismiss(d.0, d.1));
                    }
                    if !hit {
                        items.push(Item::SpellMiss { t: target, has_save: false, atk_roll_fmt: atk_fmt });
                        break;
                    }
                    let i = self.new_roll(u, "spells.chromatic_orb", if nat20 { 2 * n } else { n }, 8, 0, rolls);
                    items.push(Item::RDamage(DmgRef { t: target, dt, crit: nat20, dmg: i, droll: i, has_save: false, atk_roll_fmt: atk_fmt }));
                    let faces = &rolls[i].rolls;
                    let mut seen = faces.clone();
                    seen.sort();
                    seen.dedup();
                    let dup = seen.len() != faces.len();
                    if leaps_left <= 0 || !dup {
                        break;
                    }
                    let (next, _) = self.orb_leap(u, target, &used, dt, hit_dmg, crit_dmg);
                    let Some(next) = next else { break };
                    used.push(next);
                    target = next;
                    leaps_left -= 1;
                }
            }
            MagicMissile => {
                let darts: Vec<usize> = if c.multi { c.targets.clone() } else { vec![t0.unwrap(); (3 + (c.at_level - 1)) as usize] };
                for t in darts {
                    if self.units[t].t.pc {
                        self.units[t].pools_init = true;
                    }
                    if self.has_spell_effect(t, EffKey::AcBonus, SpellId::Shield) {
                        items.push(Item::SpellMiss { t, has_save: false, atk_roll_fmt: None });
                        continue;
                    }
                    let i = self.new_roll(u, "spells.magic_missile", 1, 4, 1, rolls);
                    items.push(Item::RDamage(DmgRef { t, dt: Dmg::Force, crit: false, dmg: i, droll: i, has_save: false, atk_roll_fmt: None }));
                }
            }
            ScorchingRay => {
                for &t in &c.targets {
                    let (hit, nat20, dismiss, t, atk_fmt) = self.evaluate_spell_attack(u, t, ScorchingRay, WeaponKind::spell_ranged(120));
                    for d in dismiss {
                        self.dismiss_effect(d.0, d.1);
                        items.push(Item::Dismiss(d.0, d.1));
                    }
                    if hit {
                        let i = self.new_roll(u, "spells.scorching_ray", if nat20 { 4 } else { 2 }, 6, 0, rolls);
                        items.push(Item::RDamage(DmgRef { t, dt: Dmg::Fire, crit: nat20, dmg: i, droll: i, has_save: false, atk_roll_fmt: atk_fmt }));
                    } else {
                        items.push(Item::SpellMiss { t, has_save: false, atk_roll_fmt: atk_fmt });
                    }
                }
            }
            AcidSplash | Shatter => {
                let p = c.point.unwrap();
                let (radius, ab, n, sides, dt, half, tag) = if c.spell == AcidSplash {
                    (5, Ability::Dex, 1, 6, Dmg::Acid, self.units[u].t.potent_cantrip, "spells.acid_splash")
                } else {
                    (10, Ability::Con, 3 + (c.at_level - 2).max(0), 8, Dmg::Thunder, true, "spells.shatter")
                };
                let squares = self.squares_in_radius(p, radius, true);
                let dc = self.spell_dc(u);
                let roll = self.new_roll(u, tag, n, sides, 0, rolls);
                for t in self.creatures_in_squares(&squares, None) {
                    let (passed, rolled) = self.save_check(t, ab, dc, c.spell == Shatter && self.units[t].t.construct);
                    if passed && !half {
                        items.push(Item::SpellMiss { t, has_save: rolled, atk_roll_fmt: None });
                        continue;
                    }
                    let dmg = if passed { Fight::half_of(rolls, roll) } else { roll };
                    items.push(Item::RDamage(DmgRef { t, dt, crit: false, dmg, droll: roll, has_save: rolled, atk_roll_fmt: None }));
                }
            }
            BurningHands => {
                let p = c.point.unwrap();
                let squares = self.squares_in_cone(self.units[u].pos, p, 3, true);
                let targets = self.creatures_in_squares(&squares, Some(u));
                self.notes.area_corpses += self.corpses_in_squares(&squares, u);
                let dc = self.spell_dc(u);
                let n = 3 + (c.at_level - 1).max(0);
                let roll = self.new_roll(u, "spells.burning_hands", n, 6, 0, rolls);
                for t in targets {
                    let (passed, rolled) = self.save_check(t, Ability::Dex, dc, false);
                    let dmg = if passed { Fight::half_of(rolls, roll) } else { roll };
                    items.push(Item::RDamage(DmgRef { t, dt: Dmg::Fire, crit: false, dmg, droll: roll, has_save: rolled, atk_roll_fmt: None }));
                }
            }
            Thunderwave => {
                let p = c.point.unwrap();
                let origin = self.units[u].pos;
                let squares = self.cube_squares(origin, p, 3);
                let targets = self.creatures_in_squares(&squares, Some(u));
                self.notes.area_corpses += self.corpses_in_squares(&squares, u);
                let n = 2 + (c.at_level - 1).max(0);
                let roll = self.new_roll(u, "spells.generic_damage", n, 8, 0, rolls);
                let dc = self.spell_dc(u);
                let mut claimed: Vec<Pos> = Vec::new();
                for t in targets {
                    let (passed, rolled) = self.save_check(t, Ability::Con, dc, false);
                    let dmg = if passed { Fight::half_of(rolls, roll) } else { roll };
                    items.push(Item::RDamage(DmgRef { t, dt: Dmg::Thunder, crit: false, dmg, droll: roll, has_save: rolled, atk_roll_fmt: None }));
                    if !passed {
                        let to = self.push_square(t, origin, &claimed);
                        claimed.push(to);
                        items.push(Item::Push { t, to });
                    }
                }
            }
            DragonsBreath => {
                let b = t0.unwrap_or(u);
                let dt = self.breath_type(u);
                items.push(Item::Breath { t: b, dt, dice: 3 + (c.at_level - 2).max(0) });
            }
            Blur => items.push(Item::Blur),
            _ => {}
        }
    }

    /// `metamagic._empower`: reroll up to CHA-mod dice below average over the
    /// casting's distinct damage rolls, by identity (N20-016): a halved copy
    /// shares the roll it halves, separate rolls stay separate even with
    /// equal faces. Rerolls go in candidate order (value, roll, die).
    pub(crate) fn empower(&mut self, u: usize, dmgs: &[DmgRef], rolls: &mut [RollObj]) {
        let k = ability_mod(self.units[u].t.abil[Ability::Cha.idx()]).max(1) as usize;
        let canonical = |rolls: &[RollObj], mut i: usize| {
            while let Some(s) = rolls[i].source {
                i = s;
            }
            i
        };
        let mut groups: Vec<usize> = Vec::new();
        let mut copies: Vec<(usize, usize)> = Vec::new();
        for d in dmgs {
            for idx in [d.dmg, d.droll] {
                let r = &rolls[idx];
                if r.sides <= 0 || r.rolls.is_empty() {
                    continue;
                }
                let orig = canonical(rolls, idx);
                if orig != idx {
                    copies.push((idx, orig));
                }
                if !groups.contains(&orig) {
                    groups.push(orig);
                }
            }
        }
        let mut cands: Vec<(i32, usize, usize)> = Vec::new();
        for (gi, &g) in groups.iter().enumerate() {
            let avg = (rolls[g].sides + 1) as f64 / 2.0;
            for (di, &v) in rolls[g].rolls.iter().enumerate() {
                if (v as f64) < avg {
                    cands.push((v, gi, di));
                }
            }
        }
        cands.sort();
        let mut changed: Vec<usize> = Vec::new();
        for &(_, gi, di) in cands.iter().take(k) {
            let g = groups[gi];
            let new = self.roll_dice(u, "empowered_spell", 1, rolls[g].sides)[0];
            rolls[g].rolls[di] = new;
            if !changed.contains(&g) {
                changed.push(g);
            }
        }
        for (copy, orig) in copies {
            if changed.contains(&orig) {
                let faces = rolls[orig].rolls.clone();
                rolls[copy].rolls = faces;
            }
        }
    }

    /// Commit one of the sorcerer's own items.
    pub(crate) fn commit_sorcerer_item(&mut self, u: usize, item: &crate::spells::Item) {
        use crate::spells::Item;
        match item {
            &Item::RayOfFrost { t, action_t } => {
                // `RayOfFrostSpell.end` (`ray_of_frost_spell.py:107-111`) cleans `effect.action.target`
                // (`action_t`, the pre-redirect target), just as `GuidingBoltSpell` uses `spell_obj`.
                let obj = self.new_obj(SpellId::RayOfFrost, ObjKind::Spell, u, vec![action_t], false);
                self.add_casted(u, t, obj, None);
                self.register_effect(t, EffKey::SpeedOverride, obj, None);
                self.register_hook(u, HookEv::StartOfTurn, HookKind::RayOfFrostStart, obj, None);
            }
            &Item::Push { t, to } => self.move_to(t, to),
            &Item::Breath { t, dt, dice } => {
                let obj = self.new_obj(SpellId::DragonsBreath, ObjKind::Breath { target: t, dt, dice }, u, Vec::new(), true);
                self.register_effect(t, EffKey::DragonsBreath, obj, Some(60));
                self.add_casted(u, t, obj, Some(60));
                self.concentration_on(u, obj);
                let sp = self.units[u].pos;
                let tp = self.units[t].pos;
                self.emit_web(crate::web_events::WebEv::DragonsBreathBuff { caster: u, target: t, src_pos: sp, tgt_pos: tp });
            }
            Item::Blur => {
                let obj = self.new_obj(SpellId::Blur, ObjKind::Blur, u, Vec::new(), true);
                self.register_effect(u, EffKey::AttackedAdvantageModifier, obj, Some(60));
                self.add_casted(u, u, obj, Some(60));
                self.concentration_on(u, obj);
            }
            _ => {}
        }
    }

    // ------------------------------------------------------------------
    // Features: Innate Sorcery, the exhale
    // ------------------------------------------------------------------

    pub(crate) fn do_exhale_at(&mut self, u: usize, aim: Pos) {
        let Some(obj) = self.active_breath(u) else { return };
        let ObjKind::Breath { dt, dice, .. } = self.objs[obj as usize].kind else { return };
        let dc = self.spell_dc(self.objs[obj as usize].source);
        let origin = self.units[u].pos;
        let squares = self.squares_in_cone(origin, aim, 3, true);
        let creatures = self.creatures_in_squares(&squares, Some(u));
        let mut rolls = Vec::new();
        let roll = self.new_roll(u, "spells.dragons_breath", dice, 6, 0, &mut rolls);
        let mut hits = Vec::new();
        for t in creatures {
            let (passed, rolled) = self.save_check(t, Ability::Dex, dc, false);
            let dmg = if passed { Fight::half_of(&mut rolls, roll) } else { roll };
            hits.push((t, dmg, rolled));
        }
        // commit: the action, then each damage item
        self.units[u].action = (self.units[u].action - 1).max(0);
        for (t, dmg, rolled) in hits {
            let r = &rolls[dmg];
            let amount = r.amount();
            let dmg_fmt = self.web_events.is_some().then(|| {
                crate::web_events::fmt_dice_roll(r.sides, &r.rolls, r.modifier, r.halved, amount)
            });
            let mut hs = crate::engine::HitState::default();
            self.spell_damage_with_web(u, t, amount, dt, false, rolled, "dragons_breath", "dragons_breath", None, dmg_fmt, &mut hs);
        }
    }

    pub(crate) fn do_sorcerer_feature(&mut self, u: usize, act: &Act) {
        match act {
            Act::InnateSorcery => {
                let unit = &mut self.units[u];
                unit.innate_sorcery = (unit.innate_sorcery - 1).max(0);
                unit.innate_until = Some(self.round * 6 + 60);
                unit.bonus = (unit.bonus - 1).max(0);
            }
            Act::DragonsBreathExhale => {
                let Some(obj) = self.active_breath(u) else { return };
                let ObjKind::Breath { dt, dice, .. } = self.objs[obj as usize].kind else { return };
                let dc = self.spell_dc(self.objs[obj as usize].source);
                let (_, aim) = self.best_cone(u, dt, dice, dc);
                let Some(aim) = aim else { return };
                self.do_exhale_at(u, aim);
            }
            _ => {}
        }
    }

    // ------------------------------------------------------------------
    // Shield (reaction)
    // ------------------------------------------------------------------

    /// `ShieldSpell.after_attack_roll` for a target that knows Shield:
    /// (the +5 blocks this attack, slot level) when it casts.
    pub fn shield_reaction(&mut self, t: usize, total: i32, ac: i32, nat20: bool, nat1: bool) -> Option<(bool, i32)> {
        // Shield is prepared but not a turn option (not in `spells`)
        let knows = self.units[t].t.caster.as_ref().map_or(false, |c| c.reaction_spells.contains(&SpellId::Shield));
        if !knows || !(ac <= total && total < ac + 5) {
            return None;
        }
        let able = self.units[t].has_reaction()
            && self.units[t].conscious()
            && !self.has_spell_effect(t, EffKey::AcBonus, SpellId::Shield)
            && self.next_slot(t, 1).is_some();
        // not offered on a natural 20 (still hits) or a natural 1 (N20-011)
        if nat20 || nat1 {
            if able {
                self.notes.shield_nat += 1;
            }
            return None;
        }
        if !able {
            return None;
        }
        let at_level = self.next_slot(t, 1)?;
        let act = Act::Spell(Box::new(Cast {
            spell: SpellId::Shield,
            at_level,
            free: false,
            targets: vec![t],
            multi: false,
            point: None,
            mm: None,
            dt: None,
        }));
        let chosen = self.select_reaction(t, vec![act]);
        chosen.as_ref()?;
        let unit = &mut self.units[t];
        unit.reaction = (unit.reaction - 1).max(0);
        unit.slots[at_level as usize] = (unit.slots[at_level as usize] - 1).max(0);
        Some((!nat20 && total < ac + 5, at_level))
    }

    /// `ShieldSpell.apply` (at the attack's commit).
    pub fn apply_shield(&mut self, t: usize) {
        let obj = self.new_obj(SpellId::Shield, ObjKind::Spell, t, vec![t], false);
        self.add_casted(t, t, obj, None);
        self.register_effect(t, EffKey::AcBonus, obj, Some(8 * 60 * 60));
        self.register_hook(t, HookEv::StartOfTurn, HookKind::ShieldStart, obj, None);
        let pos = self.units[t].pos;
        self.emit_web(crate::web_events::WebEv::ShieldCast { u: t, pos });
    }
}
