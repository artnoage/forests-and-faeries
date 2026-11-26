//! Compact, zero-heap-allocation `FightState` and public `Fight` API.

use std::collections::BTreeMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

use serde::{Deserialize, Serialize};
use smallvec::SmallVec;

use crate::effect::{EffectKind, EffectSlab};
use crate::event::{Event, EventSink};
use crate::grid::{Grid, MAX_CELLS};
use crate::interrupt::{
    ActionContinuation, InterruptFrame, InterruptKind, InterruptStack, ReactionChoice,
    ReactionOption,
};
use crate::rng::{DiceSource, DrawRecord, DrawVal, FastRng, LiveDice};
use crate::step::{AttackAbility, AttackTemplate, ContentDb, CreatureTemplate};
use crate::types::{
    ability_mod, Ability, ActionId, CoreError, Dice, EncounterSpec, FightOutcome, FightPhase,
    Metamagic, Observer, Pos, ReactionMode, RollMode, SenseState, Size, SpellPayment, StateDigest,
    StepOutcome, Team, TemplateId, UnitDigest, UnitFlags, UnitId,
};
use crate::view::{sense_of, ActionPayload, CanonKey, LegalAction, ObserverView, UnitView};

/// Static per-fight metadata shared across `fork()` / `clone()` via `Arc`.
#[derive(Clone, Debug)]
pub struct FightMeta {
    pub fight_id: u64,
    pub max_rounds: i32,
    pub unit_keys: Vec<String>,
    pub unit_names: Vec<String>,
}

/// Compact `Copy` per-unit combat state (zero heap allocations!).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct UnitState {
    pub template_id: TemplateId,
    pub team: Team,
    pub pos: Pos,
    pub hp: i16,
    pub max_hp_reduction: i16,
    pub temp_hp: i16,
    pub flags: UnitFlags,
    pub initiative_x100: i32,
    // Action economy
    pub action: i8,
    pub bonus: i8,
    pub reaction: i8,
    pub movement: i16,
    pub champion_movement: i16,
    // Death saves
    pub death_saves: u8,
    pub death_fails: u8,
    // Class / feat resources
    pub second_wind_left: u8,
    pub action_surge_left: u8,
    pub action_surge_used: bool,
    pub savage_used_round: i16,
    pub savage_used_turn: u8,
    pub first_turn_taken: bool,
    // Spellcasting resources
    pub slots: [u8; 3],
    /// Bitmask of available free-cast pool slots (bit `i` = 1 means unused).
    pub free_cast_mask: u8,
    pub pools_init: bool,
    pub sorcery_points: u8,
    pub innate_sorcery_left: u8,
    pub innate_until: i32,
    // Combat state
    pub str_drain: i8,
    pub gear_off: u32,
    pub spares: [u8; 4],
    /// Bitmask of source units whose Stench this unit has saved against.
    pub stench_immune_mask: u32,
    // Multiattack inline state (up to 8 combos, up to 4 attacks per combo)
    pub ma_started: bool,
    pub ma_combo_mask: u8,
    pub ma_combo_used: [u8; 8],
    pub two_weapon: bool,
    /// Active Stealth total if Hidden (`-1` when not hidden).
    pub hidden_stealth: i16,
}

impl UnitState {
    pub fn from_template(tid: TemplateId, t: &CreatureTemplate, pos: Pos) -> Self {
        let mut spares = [0u8; 4];
        for (i, &(_, cnt)) in t.spares.iter().take(4).enumerate() {
            spares[i] = cnt;
        }
        let (slots, free_cast_mask, sorcery_points, innate_sorcery_left, pools_init) =
            match &t.caster {
                Some(c) => {
                    let mut mask = 0u8;
                    for g in &c.grants {
                        if let SpellPayment::FreePerLongRest { pool_index, .. } = g.payment {
                            if pool_index < 8 {
                                mask |= 1u8 << pool_index;
                            }
                        }
                    }
                    let init = !t.pc && !c.free_cast_pools.is_empty();
                    (c.slots, mask, c.sorcery_points, c.innate_sorcery_uses, init)
                }
                None => ([0; 3], 0, 0, 0, false),
            };
        Self {
            template_id: tid,
            team: t.team,
            pos,
            hp: t.max_hp,
            max_hp_reduction: 0,
            temp_hp: 0,
            flags: UnitFlags::empty(),
            initiative_x100: 0,
            action: 0,
            bonus: 0,
            reaction: 1,
            movement: 0,
            champion_movement: 0,
            death_saves: 0,
            death_fails: 0,
            second_wind_left: t.second_wind_uses,
            action_surge_left: t.action_surge_uses,
            action_surge_used: false,
            savage_used_round: -1,
            savage_used_turn: 0,
            first_turn_taken: false,
            slots,
            free_cast_mask,
            pools_init,
            sorcery_points,
            innate_sorcery_left,
            innate_until: -1,
            str_drain: 0,
            gear_off: 0,
            spares,
            stench_immune_mask: 0,
            ma_started: false,
            ma_combo_mask: 0,
            ma_combo_used: [0; 8],
            two_weapon: false,
            hidden_stealth: -1,
        }
    }

    #[inline]
    pub fn available_movement(&self) -> i16 {
        if self.flags.is_unconscious() || self.flags.contains(UnitFlags::GRAPPLED) {
            0
        } else {
            self.movement.max(self.champion_movement)
        }
    }

    #[inline]
    pub fn has_reaction(&self) -> bool {
        !self.flags.is_incapacitated() && self.reaction > 0
    }
}

/// Custom compact serialization for inline occupancy array `[u8; MAX_CELLS]` so
/// snapshots only serialize active map cells instead of 1024 padding bytes.
mod occ_serde {
    use serde::{Deserializer, Serializer};
    use super::MAX_CELLS;

    pub fn serialize<S: Serializer>(arr: &[u8; MAX_CELLS], s: S) -> Result<S::Ok, S::Error> {
        s.serialize_bytes(arr)
    }

    pub fn deserialize<'de, D: Deserializer<'de>>(d: D) -> Result<[u8; MAX_CELLS], D::Error> {
        struct Vis;
        impl<'de> serde::de::Visitor<'de> for Vis {
            type Value = [u8; MAX_CELLS];
            fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
                write!(f, "{MAX_CELLS} occupancy bytes")
            }
            fn visit_bytes<E: serde::de::Error>(self, v: &[u8]) -> Result<Self::Value, E> {
                if v.len() != MAX_CELLS {
                    return Err(E::invalid_length(v.len(), &self));
                }
                let mut out = [0xFFu8; MAX_CELLS];
                out.copy_from_slice(v);
                Ok(out)
            }
            fn visit_seq<A: serde::de::SeqAccess<'de>>(self, mut seq: A) -> Result<Self::Value, A::Error> {
                let mut out = [0xFFu8; MAX_CELLS];
                for slot in &mut out {
                    *slot = seq.next_element()?.ok_or_else(|| serde::de::Error::custom("short occ"))?;
                }
                Ok(out)
            }
        }
        d.deserialize_bytes(Vis)
    }
}

/// Compact, contiguous, `Clone` + `Serialize` + `Deserialize` fight state.
///
/// Target footprint: ~3–4 KiB, zero heap allocations on `Clone` for fights up to
/// 16 units and 32 active effects.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct FightState {
    pub units: SmallVec<[UnitState; 16]>,
    #[serde(with = "occ_serde")]
    pub occ: [u8; MAX_CELLS],
    pub order: SmallVec<[UnitId; 16]>,
    pub turn_idx: u8,
    pub round: i32,
    pub started: bool,
    pub finished: bool,
    pub winner: Option<Team>,
    pub revision: u64,
    pub draws: u64,
    pub event_cursor: u64,
    pub rng: FastRng,
    pub reaction_mode: ReactionMode,
    pub effects: EffectSlab,
    pub interrupts: InterruptStack,
    /// Transient Heightened Spell state during resolution: `(caster, already_used)`.
    pub heightened: Option<(UnitId, bool)>,
}

/// Binary snapshot format serialized by [`Fight::save_bytes`].
#[derive(Clone, Debug, Serialize, Deserialize)]
struct FightSnapshot {
    fight_id: u64,
    max_rounds: i32,
    unit_keys: Vec<String>,
    unit_names: Vec<String>,
    map_rows: Vec<String>,
    state: FightState,
}

/// Live combat encounter combining compact [`FightState`] with `Arc`-shared
/// immutable [`Grid`], [`ContentDb`], and [`FightMeta`].
#[derive(Clone, Debug)]
pub struct Fight {
    pub db: Arc<ContentDb>,
    pub grid: Arc<Grid>,
    pub meta: Arc<FightMeta>,
    pub state: FightState,
}

impl Fight {
    /// Construct a new fight in [`FightPhase::Setup`] from an [`EncounterSpec`].
    pub fn new(db: Arc<ContentDb>, spec: &EncounterSpec, seed: u64) -> Result<Self, CoreError> {
        let grid = match &spec.map_rows {
            Some(rows) => Arc::new(Grid::from_rows(rows).map_err(CoreError::Setup)?),
            None => Grid::ember_vault(),
        };
        if spec.units.len() > 24 {
            return Err(CoreError::Setup(format!("{} units exceeds max 24", spec.units.len())));
        }
        let mut units = SmallVec::new();
        let mut unit_keys = Vec::with_capacity(spec.units.len());
        let mut unit_names = Vec::with_capacity(spec.units.len());
        let mut occ = [0xFFu8; MAX_CELLS];

        for uid in &spec.units {
            if unit_keys.contains(uid) {
                return Err(CoreError::Setup(format!("duplicate unit id {uid:?}")));
            }
            let tid = db
                .template_for_unit_id(uid)
                .ok_or_else(|| CoreError::Setup(format!("unknown creature content for {uid:?}")))?;
            let tmpl = db.template(tid);
            let pl = spec
                .placements
                .iter()
                .find(|p| &p.id == uid)
                .ok_or_else(|| CoreError::Setup(format!("missing placement for {uid:?}")))?;
            let pos = Pos::new(pl.x, pl.y);
            if grid.is_wall(pos) {
                return Err(CoreError::Setup(format!(
                    "{uid} placed on wall or out of bounds at ({}, {})",
                    pos.x, pos.y
                )));
            }
            let cell = grid.index(pos);
            if occ[cell] != 0xFF {
                return Err(CoreError::Setup(format!(
                    "{uid} overlaps {} at ({}, {})",
                    unit_keys[occ[cell] as usize], pos.x, pos.y
                )));
            }
            occ[cell] = units.len() as u8;
            units.push(UnitState::from_template(tid, tmpl, pos));
            unit_keys.push(uid.clone());
            unit_names.push(tmpl.name.clone());
        }

        let fight_id = compute_fight_id(spec, &grid, seed);
        let state = FightState {
            units,
            occ,
            order: SmallVec::new(),
            turn_idx: 0,
            round: 0,
            started: false,
            finished: false,
            winner: None,
            revision: 0,
            draws: 0,
            event_cursor: 0,
            rng: FastRng::new(seed),
            reaction_mode: ReactionMode::Auto,
            effects: EffectSlab::new(),
            interrupts: InterruptStack::default(),
            heightened: None,
        };
        let meta = Arc::new(FightMeta {
            fight_id,
            max_rounds: spec.max_rounds,
            unit_keys,
            unit_names,
        });
        Ok(Self { db, grid, meta, state })
    }

    pub fn set_reaction_mode(&mut self, mode: ReactionMode) {
        self.state.reaction_mode = mode;
    }

    #[inline]
    pub fn revision(&self) -> u64 {
        self.state.revision
    }

    #[inline]
    pub fn gt(&self) -> i32 {
        self.state.round * 6
    }

    #[inline]
    pub fn unit(&self, u: UnitId) -> &UnitState {
        &self.state.units[u.idx()]
    }

    #[inline]
    pub fn unit_mut(&mut self, u: UnitId) -> &mut UnitState {
        &mut self.state.units[u.idx()]
    }

    #[inline]
    pub fn template_of(&self, u: UnitId) -> &CreatureTemplate {
        self.db.template(self.state.units[u.idx()].template_id)
    }

    #[inline]
    pub fn unit_key(&self, u: UnitId) -> &str {
        &self.meta.unit_keys[u.idx()]
    }

    pub fn unit_by_key(&self, key: &str) -> Option<UnitId> {
        self.meta.unit_keys.iter().position(|k| k == key).map(|i| UnitId(i as u8))
    }

    #[inline]
    pub fn current(&self) -> UnitId {
        self.state.order[self.state.turn_idx as usize]
    }

    #[inline]
    pub fn opposing(&self, a: UnitId, b: UnitId) -> bool {
        self.unit(a).team != self.unit(b).team
    }

    #[inline]
    pub fn allies(&self, a: UnitId, b: UnitId) -> bool {
        self.unit(a).team == self.unit(b).team
    }

    #[inline]
    pub fn phase(&self) -> FightPhase {
        if self.state.finished {
            return FightPhase::Finished(FightOutcome {
                winner: self.state.winner,
                finished: true,
                round: self.state.round,
            });
        }
        if !self.state.started {
            return FightPhase::Setup;
        }
        if let Some(top) = self.state.interrupts.top() {
            return FightPhase::AwaitingReaction {
                prompt_id: top.prompt_id,
                reactor: top.reactor,
            };
        }
        if self.state.round >= self.meta.max_rounds {
            return FightPhase::Finished(FightOutcome {
                winner: None,
                finished: false,
                round: self.state.round,
            });
        }
        FightPhase::AwaitingAction(self.current())
    }

    /// Cheap `fork()`: bumps `Arc` refcounts and clones contiguous `FightState`
    /// with zero heap allocations for normal fights.
    #[inline]
    pub fn fork(&self, new_seed: Option<u64>) -> Self {
        let mut copy = self.clone();
        if let Some(seed) = new_seed {
            copy.state.rng = FastRng::new(seed);
        }
        copy
    }

    /// Serialize complete fight state (including RNG, nested pending interrupts,
    /// active effects, revision, and event cursor) to compact binary bytes.
    pub fn save_bytes(&self) -> Result<Vec<u8>, CoreError> {
        let snap = FightSnapshot {
            fight_id: self.meta.fight_id,
            max_rounds: self.meta.max_rounds,
            unit_keys: self.meta.unit_keys.clone(),
            unit_names: self.meta.unit_names.clone(),
            map_rows: self.grid.rows.clone(),
            state: self.state.clone(),
        };
        postcard::to_allocvec(&snap).map_err(|e| CoreError::Serialization(e.to_string()))
    }

    /// Restore a fight from bytes produced by [`Fight::save_bytes`].
    pub fn load_bytes(db: Arc<ContentDb>, bytes: &[u8]) -> Result<Self, CoreError> {
        let snap: FightSnapshot =
            postcard::from_bytes(bytes).map_err(|e| CoreError::Serialization(e.to_string()))?;
        let grid = Arc::new(Grid::from_rows(&snap.map_rows).map_err(CoreError::Setup)?);
        let meta = Arc::new(FightMeta {
            fight_id: snap.fight_id,
            max_rounds: snap.max_rounds,
            unit_keys: snap.unit_keys,
            unit_names: snap.unit_names,
        });
        Ok(Self { db, grid, meta, state: snap.state })
    }

    /// Recompute cached [`UnitFlags`] for unit `u` from the unified [`EffectSlab`].
    #[inline]
    pub fn refresh_flags(&mut self, u: UnitId) {
        let gt = self.gt();
        let mut flags = self.state.effects.compute_flags(u, gt);
        if self.template_of(u).immune_poisoned {
            flags.remove(UnitFlags::POISONED);
        }
        if self.template_of(u).immune_paralyzed {
            flags.remove(UnitFlags::PARALYZED);
        }
        if self.template_of(u).immune_prone {
            flags.remove(UnitFlags::PRONE);
        }
        let unit = &mut self.state.units[u.idx()];
        unit.flags = flags;
        if unit.innate_until >= 0 && gt < unit.innate_until {
            unit.flags.insert(UnitFlags::INNATE_SORCERY);
        }
    }

    pub fn refresh_all_flags(&mut self) {
        let n = self.state.units.len();
        for i in 0..n {
            self.refresh_flags(UnitId(i as u8));
        }
    }

    // ------------------------------------------------------------------
    // Spatial, visibility, cover & stat queries
    // ------------------------------------------------------------------

    #[inline]
    pub fn token_at(&self, p: Pos) -> Option<UnitId> {
        if !self.grid.in_bounds(p) {
            return None;
        }
        let idx = self.state.occ[self.grid.index(p)];
        if idx == 0xFF {
            return None;
        }
        let top = UnitId(idx);
        if self.unit(top).flags.is_dead() {
            return self
                .state
                .units
                .iter()
                .enumerate()
                .find(|(_, u)| u.pos == p && !u.flags.is_dead())
                .map(|(i, _)| UnitId(i as u8));
        }
        Some(top)
    }

    #[inline]
    pub fn effective_light_level(&self, p: Pos) -> u8 {
        let base = self.grid.light_level(p);
        if base >= 1 {
            return base;
        }
        let lit = self.state.units.iter().any(|u| {
            !u.flags.is_dead()
                && u.flags.intersects(UnitFlags::FAERIE_FIRE | UnitFlags::STARRY_WISP)
                && u.pos.feet_to(p) <= 10
        });
        if lit { 1 } else { 0 }
    }

    pub fn sees_lit_square(&self, observer: UnitId, p: Pos) -> bool {
        let u = self.unit(observer);
        if self.grid.in_bounds(p) && self.effective_light_level(p) == 0 {
            let t = self.template_of(observer);
            let senses = t.darkvision.max(t.blindsight).max(t.truesight) as i32;
            if u.pos.feet_to(p) > senses {
                return false;
            }
        }
        self.grid.clear_sight(u.pos, p)
    }

    #[inline]
    pub fn can_see(&self, a: UnitId, b: UnitId) -> bool {
        sense_of(self, Observer::Unit(a), b) == SenseState::Visible
    }

    pub fn hidden_stealth(&self, u: UnitId) -> Option<i16> {
        let s = self.unit(u).hidden_stealth;
        (s >= 0 && self.unit(u).flags.contains(UnitFlags::HIDDEN)).then_some(s)
    }

    pub fn cover_bonus_from(&self, origin: Pos, target: UnitId) -> i32 {
        let pos = self.unit(target).pos;
        let grade = self.grid.corner_cover_grade(origin, pos, |p| self.token_at(p).is_some());
        match grade {
            4 if !self.grid.clear_sight(origin, pos) => 0,
            3..=4 => 5,
            2 => 2,
            _ => 0,
        }
    }

    pub fn point_cover_bonus(&self, origin: Pos, target: UnitId) -> i32 {
        let pos = self.unit(target).pos;
        let (walls, creatures) =
            self.grid.cover_rays(origin, pos, |p| self.token_at(p).is_some());
        if walls == 15 && !self.grid.clear_effect(origin, pos) {
            return 0;
        }
        if walls.count_ones() >= 3 {
            5
        } else if (walls | creatures).count_ones() >= 2 {
            2
        } else {
            0
        }
    }

    #[inline]
    pub fn armor_class(&self, u: UnitId) -> i32 {
        let mut ac = self.template_of(u).ac as i32;
        if self.unit(u).flags.contains(UnitFlags::SHIELDED) {
            ac += 5;
        }
        ac
    }

    #[inline]
    pub fn attack_ac(&self, origin: Pos, target: UnitId) -> i32 {
        self.armor_class(target) + self.cover_bonus_from(origin, target)
    }

    #[inline]
    pub fn max_hp_of(&self, u: UnitId) -> i32 {
        let base = self.template_of(u).max_hp as i32;
        (base - self.unit(u).max_hp_reduction as i32).max(0)
    }

    #[inline]
    pub fn speed_of(&self, u: UnitId) -> i16 {
        if self.unit(u).flags.contains(UnitFlags::RESTRAINED) {
            return 0;
        }
        self.template_of(u).speed
    }

    #[inline]
    pub fn strength_of(&self, u: UnitId) -> i32 {
        self.template_of(u).abilities[0] as i32 - self.unit(u).str_drain as i32
    }

    #[inline]
    pub fn save_mod(&self, u: UnitId, ab: Ability) -> i32 {
        let t = self.template_of(u);
        let score = if ab == Ability::Str {
            self.strength_of(u)
        } else {
            t.abilities[ab.idx()] as i32
        };
        ability_mod(score) + if t.save_prof[ab.idx()] { t.prof_bonus as i32 } else { 0 }
    }

    #[inline]
    pub fn benefits_from_dodge(&self, u: UnitId) -> bool {
        let unit = self.unit(u);
        unit.flags.contains(UnitFlags::DODGING)
            && !unit.flags.is_incapacitated()
            && self.speed_of(u) > 0
    }

    #[inline]
    pub fn innate_active(&self, u: UnitId) -> bool {
        let until = self.unit(u).innate_until;
        until >= 0 && self.gt() < until
    }

    pub fn used_hand_slots(&self, u: UnitId) -> f32 {
        let gear_off = self.unit(u).gear_off;
        self.template_of(u)
            .gear
            .iter()
            .enumerate()
            .filter(|(i, _)| gear_off & (1u32 << *i) == 0)
            .map(|(_, (_, slots))| *slots)
            .sum()
    }

    /// Compute current `(to_hit, damage_dice, graze_mod)` for unit `u`'s attack `atk_idx`.
    pub fn attack_numbers(&self, u: UnitId, atk_idx: usize) -> (i32, Dice, Option<i32>) {
        let t = self.template_of(u);
        let def = &t.attacks[atk_idx];
        if !t.pc {
            return (def.to_hit as i32, def.damage, None);
        }
        let str_m = ability_mod(self.strength_of(u));
        let dex_m = ability_mod(t.abilities[1] as i32);
        let m = match def.ability {
            AttackAbility::Finesse => str_m.max(dex_m),
            _ => str_m,
        };
        let base_die = match def.versatile {
            Some(v) if self.used_hand_slots(u) <= 1.0 => v,
            _ => def.damage,
        };
        let to_hit = m + t.prof_bonus as i32;
        let dmg = Dice::new(base_die.count, base_die.sides, m as i16);
        let graze = def.graze.then_some(m);
        (to_hit, dmg, graze)
    }

    pub fn attack_available(&self, u: UnitId, atk_idx: usize) -> bool {
        let def = &self.template_of(u).attacks[atk_idx];
        match def.item {
            Some(i) => self.unit(u).gear_off & (1u32 << i) == 0,
            None => true,
        }
    }

    pub fn can_attack(&self, u: UnitId, atk_idx: usize) -> bool {
        let unit = self.unit(u);
        let def = &self.template_of(u).attacks[atk_idx];
        if def.bonus_action {
            return unit.bonus > 0;
        }
        if unit.action > 0 {
            return true;
        }
        if unit.ma_started && def.multiattack_group.is_some() {
            return self.multiattack_allows(u, &def.name);
        }
        false
    }

    pub fn multiattack_allows(&self, u: UnitId, attack_name: &str) -> bool {
        let unit = self.unit(u);
        let tmpl = self.template_of(u);
        for (ci, combo) in tmpl.multiattack.iter().enumerate().take(8) {
            if unit.ma_combo_mask & (1u8 << ci) == 0 {
                continue;
            }
            for (si, name) in combo.iter().enumerate().take(8) {
                if unit.ma_combo_used[ci] & (1u8 << si) == 0 && name == attack_name {
                    return true;
                }
            }
        }
        false
    }

    pub fn passable(&self, u: UnitId, p: Pos) -> bool {
        if self.grid.is_wall(p) {
            return false;
        }
        if let Some(o) = self.token_at(p) {
            if o != u
                && self.opposing(o, u)
                && !self.unit(o).flags.is_incapacitated()
                && self.template_of(o).size != Size::Tiny
                && (self.template_of(o).size as u8).abs_diff(self.template_of(u).size as u8) < 2
            {
                return false;
            }
        }
        true
    }

    pub fn placeable(&self, u: UnitId, p: Pos) -> bool {
        if !self.passable(u, p) {
            return false;
        }
        match self.token_at(p) {
            Some(o) => o == u,
            None => true,
        }
    }

    pub fn difficult(&self, u: UnitId, p: Pos) -> bool {
        match self.token_at(p) {
            Some(o) => {
                o != u
                    && !self.unit(o).flags.is_dead()
                    && !self.allies(u, o)
                    && self.template_of(o).size != Size::Tiny
            }
            None => false,
        }
    }

    pub fn step_cost(&self, u: UnitId, to: Pos) -> i32 {
        let difficult = self.difficult(u, to) && !self.template_of(u).fly;
        1 + i32::from(self.unit(u).flags.contains(UnitFlags::PRONE)) + i32::from(difficult)
    }

    pub fn move_prefix(
        &self,
        u: UnitId,
        path: &[Pos],
        mut budget: i32,
        in_transit: bool,
    ) -> (SmallVec<[Pos; 16]>, i32) {
        let mut moves: SmallVec<[Pos; 16]> = SmallVec::new();
        for (i, &m) in path.iter().enumerate() {
            if i == 0 {
                moves.push(m);
                continue;
            }
            if !self.passable(u, m) || !self.grid.clears_corner(path[i - 1], m) {
                break;
            }
            let cost = self.step_cost(u, m);
            if budget < cost {
                break;
            }
            budget -= cost;
            moves.push(m);
        }
        while let Some(&last) = moves.last() {
            if in_transit || self.placeable(u, last) {
                break;
            }
            moves.pop();
            budget += self.step_cost(u, last);
        }
        (moves, budget)
    }

    pub fn prepare_move(&self, u: UnitId, path: &[Pos]) -> SmallVec<[Pos; 16]> {
        let budget = (self.unit(u).available_movement() as i32).div_euclid(5);
        let (mut moves, _) = self.move_prefix(u, path, budget, false);
        while let Some(&last) = moves.last() {
            if self.placeable(u, last) {
                break;
            }
            moves.pop();
        }
        moves
    }

    /// Detect Opportunity Attack triggers `(reactor, leave_index)` in unit order.
    pub fn opportunity_attacks(&self, mover: UnitId, path: &[Pos]) -> SmallVec<[(UnitId, u8); 8]> {
        let mut entered = [false; 24];
        let mut left: SmallVec<[(UnitId, u8); 8]> = SmallVec::new();
        let n = self.state.units.len();
        for (index, &p) in path.iter().enumerate() {
            for e_idx in 0..n {
                let e = UnitId(e_idx as u8);
                if self.unit(e).flags.is_dead() || !self.opposing(e, mover) {
                    continue;
                }
                if !self.unit(e).has_reaction() {
                    continue;
                }
                let Some(reach) = self.template_of(e).melee_reach_ft else {
                    continue;
                };
                if self.unit(e).pos.feet_to(p) <= reach as i32 {
                    entered[e_idx] = true;
                } else if entered[e_idx] {
                    left.push((e, index as u8));
                    entered[e_idx] = false;
                }
            }
        }
        if self.unit(mover).flags.contains(UnitFlags::DISENGAGED) {
            return SmallVec::new();
        }
        left.retain(|&mut (e, _)| self.unit(e).has_reaction());
        left
    }

    /// Build legal Opportunity Attack options for `reactor` against `target`.
    /// Preserves canonical rule-18 enumeration order and multiplicity
    /// (enumerating melee attack candidates across enemies within reach before
    /// retargeting at the provoking mover).
    pub fn oa_options(&self, reactor: UnitId, target: UnitId) -> SmallVec<[ReactionOption; 8]> {
        let mut opts: SmallVec<[ReactionOption; 8]> = SmallVec::new();
        if !self.unit(reactor).flags.is_conscious() || !self.unit(reactor).has_reaction() {
            return opts;
        }
        if self.unit(target).flags.is_dead() || !self.can_see(reactor, target) {
            return opts;
        }
        let tmpl = self.template_of(reactor);
        let r_pos = self.unit(reactor).pos;
        let mover_dist_ft = r_pos.feet_to(self.unit(target).pos);
        for (ai, def) in tmpl.attacks.iter().enumerate() {
            if def.ranged || def.save_attack.is_some() || def.bonus_action {
                continue;
            }
            if !self.attack_available(reactor, ai) {
                continue;
            }
            if mover_dist_ft > def.max_range_ft as i32 {
                continue;
            }
            for ti in 0..self.state.units.len() {
                let other = UnitId(ti as u8);
                if other == reactor
                    || !self.opposing(reactor, other)
                    || self.unit(other).flags.is_dead()
                {
                    continue;
                }
                if !self.can_see(reactor, other) {
                    continue;
                }
                if r_pos.feet_to(self.unit(other).pos) <= def.max_range_ft as i32 {
                    opts.push(ReactionOption::OpportunityAttack {
                        attack_idx: ai as u8,
                        target,
                    });
                }
            }
        }
        opts.sort_by(|a, b| {
            let key_of = |opt: &ReactionOption| match opt {
                ReactionOption::OpportunityAttack { attack_idx, target } => self.canon_key(
                    reactor,
                    &ActionPayload::Attack { attack_idx: *attack_idx, target: *target, reaction: true },
                ),
                ReactionOption::Decline => self.canon_key(reactor, &ActionPayload::EndTurn),
            };
            key_of(a).cmp(&key_of(b))
        });
        opts
    }

    // ------------------------------------------------------------------
    // Public ObserverView & LegalAction API
    // ------------------------------------------------------------------

    /// Build strictly redacted [`ObserverView`] for `observer`.
    /// Concealed units are structurally omitted from `units` and `active_unit`.
    pub fn view(&self, observer: Observer) -> ObserverView {
        let phase = self.phase();
        let active_unit = match phase {
            FightPhase::AwaitingAction(u) => {
                if sense_of(self, observer, u) == SenseState::Concealed {
                    None
                } else {
                    Some(u)
                }
            }
            _ => None,
        };
        let can_act = match (phase, observer) {
            (FightPhase::AwaitingAction(u), Observer::Full) => {
                let _ = u;
                true
            }
            (FightPhase::AwaitingAction(u), Observer::Team(team)) => self.unit(u).team == team,
            (FightPhase::AwaitingAction(u), Observer::Unit(obs)) => u == obs,
            _ => false,
        };
        let pending_interrupt = self.state.interrupts.top().and_then(|frame| {
            let visible = match observer {
                Observer::Full => true,
                Observer::Team(t) => self.unit(frame.reactor).team == t,
                Observer::Unit(u) => frame.reactor == u,
            };
            visible.then(|| frame.info())
        });
        let mut units = Vec::with_capacity(self.state.units.len());
        for i in 0..self.state.units.len() {
            let id = UnitId(i as u8);
            let sense = sense_of(self, observer, id);
            if sense == SenseState::Concealed {
                continue;
            }
            let u = self.unit(id);
            units.push(UnitView {
                id,
                unit_key: self.meta.unit_keys[i].clone(),
                name: self.meta.unit_names[i].clone(),
                team: u.team,
                sense,
                pos: u.pos,
                hp: u.hp,
                max_hp: self.max_hp_of(id) as i16,
                temp_hp: u.temp_hp,
                ac: self.armor_class(id) as i16,
                flags: u.flags,
                action: u.action,
                bonus: u.bonus,
                reaction: u.reaction,
                movement_ft: u.available_movement(),
            });
        }
        ObserverView {
            fight_id: self.meta.fight_id,
            revision: self.state.revision,
            round: self.state.round,
            phase,
            active_unit,
            can_act,
            pending_interrupt,
            units,
        }
    }

    /// Enumerate legal actions for the active unit in strict canonical `CanonKey` order.
    /// Returns an empty list if `observer` cannot see the active unit or is not allowed to act.
    pub fn legal_actions(&self, observer: Observer) -> Vec<LegalAction> {
        let FightPhase::AwaitingAction(actor) = self.phase() else {
            return Vec::new();
        };
        if sense_of(self, observer, actor) == SenseState::Concealed {
            return Vec::new();
        }
        let allowed = match observer {
            Observer::Full => true,
            Observer::Team(team) => self.unit(actor).team == team,
            Observer::Unit(u) => u == actor,
        };
        if !allowed {
            return Vec::new();
        }
        let mut raw = self.enumerate_turn_actions(actor);
        let mut keyed: Vec<(CanonKey, ActionPayload)> = raw
            .drain(..)
            .map(|p| (self.canon_key(actor, &p), p))
            .collect();
        keyed.sort_by(|a, b| a.0.cmp(&b.0));

        // Deduplicate equal semantic keys while preserving first canonical entry
        let mut out = Vec::with_capacity(keyed.len() + 1);
        let mut prev_key: Option<String> = None;
        for (_, payload) in keyed {
            let action_key = self.describe_payload(actor, &payload);
            if prev_key.as_deref() == Some(action_key.as_str()) {
                continue;
            }
            let idx = out.len() as u16;
            let kind = payload_kind(&payload).to_string();
            prev_key = Some(action_key.clone());
            out.push(LegalAction {
                id: ActionId {
                    fight_id: self.meta.fight_id,
                    revision: self.state.revision,
                    index: idx,
                },
                action_key,
                kind,
                payload,
            });
        }
        let end_idx = out.len() as u16;
        out.push(LegalAction {
            id: ActionId {
                fight_id: self.meta.fight_id,
                revision: self.state.revision,
                index: end_idx,
            },
            action_key: "end_turn".to_string(),
            kind: "end_turn".to_string(),
            payload: ActionPayload::EndTurn,
        });
        out
    }

    fn enumerate_turn_actions(&self, u: UnitId) -> Vec<ActionPayload> {
        let unit = self.unit(u);
        let tmpl = self.template_of(u);
        let mut out = Vec::new();

        // Weapon & monster attacks
        for (ai, def) in tmpl.attacks.iter().enumerate() {
            if !self.can_attack(u, ai) || !self.attack_available(u, ai) {
                continue;
            }
            for ti in 0..self.state.units.len() {
                let t = UnitId(ti as u8);
                if t == u || !self.opposing(u, t) || self.unit(t).flags.is_dead() {
                    continue;
                }
                if !self.can_see(u, t) {
                    continue;
                }
                if unit.pos.feet_to(self.unit(t).pos) > def.max_range_ft as i32 {
                    continue;
                }
                out.push(ActionPayload::Attack {
                    attack_idx: ai as u8,
                    target: t,
                    reaction: false,
                });
            }
        }

        // Standard actions
        if unit.action > 0 {
            out.push(ActionPayload::Dodge);
            out.push(ActionPayload::Dash);
            out.push(ActionPayload::Disengage);
        }

        // Fighter features
        if tmpl.second_wind_uses > 0
            && unit.bonus > 0
            && unit.second_wind_left > 0
            && (unit.hp as i32) < self.max_hp_of(u)
        {
            out.push(ActionPayload::SecondWind);
        }
        if tmpl.action_surge_uses > 0 && !unit.action_surge_used && unit.action_surge_left > 0 {
            out.push(ActionPayload::ActionSurge);
        }

        // Sorcerer Innate Sorcery
        if tmpl.sorcerer
            && unit.bonus > 0
            && unit.innate_sorcery_left > 0
            && !self.innate_active(u)
        {
            out.push(ActionPayload::InnateSorcery);
        }

        // 1-step movement candidates
        if unit.available_movement() > 0 {
            let budget = (unit.available_movement() as i32).div_euclid(5);
            let here = unit.pos;
            for dx in -1..=1i16 {
                for dy in -1..=1i16 {
                    if dx == 0 && dy == 0 {
                        continue;
                    }
                    let np = Pos::new(here.x + dx, here.y + dy);
                    if !self.passable(u, np) || !self.placeable(u, np) {
                        continue;
                    }
                    let (moves, _) = self.move_prefix(u, &[here, np], budget, false);
                    if moves.len() > 1 {
                        out.push(ActionPayload::Move(moves));
                    }
                }
            }
            // NPC multi-square occupied-crossing moves (rule 18)
            if !tmpl.pc {
                for path in self.crossing_move_paths(u) {
                    out.push(ActionPayload::Move(path));
                }
            }
        }

        // Stand from Prone
        let speed = self.speed_of(u);
        if unit.flags.contains(UnitFlags::PRONE)
            && speed > 0
            && unit.available_movement() >= speed / 2
        {
            out.push(ActionPayload::Stand);
        }

        out
    }

    /// Generate multi-square crossing paths through passable occupied squares to the
    /// first legal landing square (canonical orthogonal-first direction order).
    fn crossing_move_paths(&self, u: UnitId) -> Vec<SmallVec<[Pos; 16]>> {
        use std::cmp::Reverse;
        use std::collections::BinaryHeap;

        const DIRECTIONS: [(i16, i16); 8] = [
            (0, -1),
            (0, 1),
            (-1, 0),
            (1, 0),
            (-1, -1),
            (1, -1),
            (-1, 1),
            (1, 1),
        ];

        let budget = (self.unit(u).available_movement() as i32).div_euclid(5);
        if budget < 2 {
            return Vec::new();
        }
        let start = self.unit(u).pos;
        if !DIRECTIONS
            .iter()
            .any(|&(dx, dy)| self.token_at(Pos::new(start.x + dx, start.y + dy)).is_some())
        {
            return Vec::new();
        }
        let cells = self.grid.cells();
        let mut best_cost = vec![i32::MAX; cells];
        let mut parent = vec![usize::MAX; cells];
        let mut frontier: BinaryHeap<Reverse<(i32, usize, usize)>> = BinaryHeap::new();
        let mut seq = 0usize;
        let s_idx = self.grid.index(start);
        best_cost[s_idx] = 0;

        // Squares already reachable in 1 direct step must not be re-emitted as crossing detours.
        for &(dx, dy) in &DIRECTIONS {
            let np = Pos::new(start.x + dx, start.y + dy);
            if !self.grid.in_bounds(np)
                || !self.passable(u, np)
                || !self.grid.clears_corner(start, np)
            {
                continue;
            }
            let cost = self.step_cost(u, np);
            if cost > budget {
                continue;
            }
            let ni = self.grid.index(np);
            if self.placeable(u, np) {
                best_cost[ni] = 0;
            } else {
                best_cost[ni] = cost;
                parent[ni] = s_idx;
                frontier.push(Reverse((cost, seq, ni)));
                seq += 1;
            }
        }

        let mut landings: Vec<usize> = Vec::new();
        while let Some(Reverse((cur_cost, _, ci))) = frontier.pop() {
            if cur_cost != best_cost[ci] {
                continue;
            }
            let cp = self.grid.pos_of(ci);
            if self.placeable(u, cp) {
                landings.push(ci);
                continue;
            }
            for &(dx, dy) in &DIRECTIONS {
                let np = Pos::new(cp.x + dx, cp.y + dy);
                if !self.grid.in_bounds(np)
                    || !self.passable(u, np)
                    || !self.grid.clears_corner(cp, np)
                {
                    continue;
                }
                let nc = cur_cost + self.step_cost(u, np);
                if nc > budget {
                    continue;
                }
                let ni = self.grid.index(np);
                if nc < best_cost[ni] {
                    best_cost[ni] = nc;
                    parent[ni] = ci;
                    frontier.push(Reverse((nc, seq, ni)));
                    seq += 1;
                }
            }
        }
        let mut paths = Vec::new();
        for dest in landings {
            let mut rev = SmallVec::<[Pos; 16]>::new();
            let mut cur = dest;
            while cur != usize::MAX {
                rev.push(self.grid.pos_of(cur));
                if cur == s_idx {
                    break;
                }
                cur = parent[cur];
            }
            rev.reverse();
            if rev.len() > 2 {
                paths.push(rev);
            }
        }
        paths
    }

    /// Build canonical sort key matching `GenericController._canonical_key`.
    pub fn canon_key(&self, src: UnitId, payload: &ActionPayload) -> CanonKey {
        let mut k = CanonKey {
            kind: payload_kind(payload),
            spell: "None".into(),
            weapon: String::new(),
            ids: Vec::new(),
            point: Vec::new(),
            mm: "None",
            at_level: "None".into(),
            mode: "None",
            path: String::new(),
            thrown: false,
            paid: false,
        };
        match payload {
            ActionPayload::Move(path) => {
                let cells: Vec<String> =
                    path.iter().map(|p| format!("[{}, {}]", p.x, p.y)).collect();
                k.path = format!("[{}]", cells.join(", "));
            }
            ActionPayload::Attack { attack_idx, target, .. } => {
                let def = &self.template_of(src).attacks[*attack_idx as usize];
                k.weapon = def.name.clone();
                k.thrown = def.thrown;
                k.ids = vec![self.unit_key(*target).to_string()];
            }
            ActionPayload::CastSpell {
                spell_key,
                at_level,
                free,
                metamagic,
                targets,
                point,
            } => {
                k.spell = spell_key.clone();
                let mut ids: Vec<String> =
                    targets.iter().map(|&t| self.unit_key(t).to_string()).collect();
                ids.sort();
                k.ids = ids;
                if let Some(p) = point {
                    k.point = vec![p.x as i32, p.y as i32];
                }
                if let Some(mm) = metamagic {
                    k.mm = mm.key();
                }
                k.at_level = at_level.to_string();
                k.paid = !free;
            }
            _ => {}
        }
        k
    }

    /// Format canonical semantic action key matching tape descriptors verbatim.
    pub fn describe_payload(&self, src: UnitId, payload: &ActionPayload) -> String {
        match payload {
            ActionPayload::Move(path) => {
                let cells: Vec<String> = path.iter().map(|p| format!("{},{}", p.x, p.y)).collect();
                format!("move:{}", cells.join(";"))
            }
            ActionPayload::Attack { attack_idx, target, reaction } => {
                let def: &AttackTemplate = &self.template_of(src).attacks[*attack_idx as usize];
                let mut s = if def.thrown {
                    format!("attack:{}:thrown:>{}", def.name, self.unit_key(*target))
                } else {
                    format!("attack:{}:>{}", def.name, self.unit_key(*target))
                };
                if *reaction {
                    s.push_str(":reaction");
                }
                s
            }
            ActionPayload::CastSpell {
                spell_key,
                at_level,
                free,
                metamagic,
                targets,
                point,
            } => {
                let mut s = format!("spell:{spell_key}:L{at_level}");
                if *free {
                    s.push_str(":free");
                }
                if let Some(mm) = metamagic {
                    s.push_str(&format!(":mm={}", mm.key()));
                }
                if !targets.is_empty() {
                    let ids: Vec<&str> = targets.iter().map(|&t| self.unit_key(t)).collect();
                    s.push_str(&format!(":>{}", ids.join(",")));
                } else if let Some(p) = point {
                    s.push_str(&format!(":@{},{}", p.x, p.y));
                }
                s
            }
            other => payload_kind(other).to_string(),
        }
    }

    /// Parse a tape semantic action key (e.g. `"move:10,2;9,2"`, `"attack:longsword:>ghast-1"`,
    /// `"spell:magic_missile:L1:free:>ghast-1,ghast-1,ghast-1"`, `"stand"`) for `actor`.
    pub fn parse_action_key(&self, actor: UnitId, key: &str) -> Result<ActionPayload, CoreError> {
        match key {
            "dash" => return Ok(ActionPayload::Dash),
            "disengage" => return Ok(ActionPayload::Disengage),
            "dodge" => return Ok(ActionPayload::Dodge),
            "stand" => return Ok(ActionPayload::Stand),
            "second_wind" => return Ok(ActionPayload::SecondWind),
            "action_surge" => return Ok(ActionPayload::ActionSurge),
            "innate_sorcery" => return Ok(ActionPayload::InnateSorcery),
            "end_turn" | "none" => return Ok(ActionPayload::EndTurn),
            _ => {}
        }
        if let Some(rest) = key.strip_prefix("move:") {
            let mut path = SmallVec::new();
            for cell in rest.split(';') {
                let (xs, ys) = cell
                    .split_once(',')
                    .ok_or_else(|| CoreError::UnknownAction(key.into()))?;
                let x: i16 = xs.parse().map_err(|_| CoreError::UnknownAction(key.into()))?;
                let y: i16 = ys.parse().map_err(|_| CoreError::UnknownAction(key.into()))?;
                path.push(Pos::new(x, y));
            }
            return Ok(ActionPayload::Move(path));
        }
        if let Some(rest) = key.strip_prefix("attack:") {
            let parts: Vec<&str> = rest.split(':').collect();
            let weapon = parts[0];
            let mut thrown = false;
            let mut reaction = false;
            let mut target_id = None;
            for &part in &parts[1..] {
                if part == "thrown" {
                    thrown = true;
                } else if part == "reaction" {
                    reaction = true;
                } else if let Some(tid) = part.strip_prefix('>') {
                    target_id = Some(
                        self.unit_by_key(tid)
                            .ok_or_else(|| CoreError::UnknownAction(key.into()))?,
                    );
                }
            }
            let target = target_id.ok_or_else(|| CoreError::UnknownAction(key.into()))?;
            let tmpl = self.template_of(actor);
            let attack_idx = tmpl
                .attacks
                .iter()
                .position(|a| a.name == weapon && a.thrown == thrown)
                .ok_or_else(|| CoreError::UnknownAction(key.into()))?;
            return Ok(ActionPayload::Attack {
                attack_idx: attack_idx as u8,
                target,
                reaction,
            });
        }
        if let Some(rest) = key.strip_prefix("spell:") {
            let parts: Vec<&str> = rest.split(':').collect();
            if parts.len() < 2 {
                return Err(CoreError::UnknownAction(key.into()));
            }
            let spell_key = parts[0].to_string();
            let at_level: u8 = parts[1]
                .strip_prefix('L')
                .ok_or_else(|| CoreError::UnknownAction(key.into()))?
                .parse()
                .map_err(|_| CoreError::UnknownAction(key.into()))?;
            let mut free = false;
            let mut metamagic = None;
            let mut targets = SmallVec::new();
            let mut point = None;
            for &part in &parts[2..] {
                if part == "free" {
                    free = true;
                } else if let Some(mm) = part.strip_prefix("mm=") {
                    metamagic = Some(
                        Metamagic::from_key(mm)
                            .ok_or_else(|| CoreError::UnknownAction(key.into()))?,
                    );
                } else if let Some(tlist) = part.strip_prefix('>') {
                    for tid in tlist.split(',') {
                        targets.push(
                            self.unit_by_key(tid)
                                .ok_or_else(|| CoreError::UnknownAction(key.into()))?,
                        );
                    }
                } else if let Some(pt) = part.strip_prefix('@') {
                    let (xs, ys) = pt
                        .split_once(',')
                        .ok_or_else(|| CoreError::UnknownAction(key.into()))?;
                    let x: i16 = xs.parse().map_err(|_| CoreError::UnknownAction(key.into()))?;
                    let y: i16 = ys.parse().map_err(|_| CoreError::UnknownAction(key.into()))?;
                    point = Some(Pos::new(x, y));
                }
            }
            return Ok(ActionPayload::CastSpell {
                spell_key,
                at_level,
                free,
                metamagic,
                targets,
                point,
            });
        }
        Err(CoreError::UnknownAction(key.into()))
    }

    // ------------------------------------------------------------------
    // Start, Apply, RespondReaction, EndTurn (Live RNG + Supplied Dice)
    // ------------------------------------------------------------------

    /// Start the fight (roll initiative, open first turn) using the fight's built-in RNG.
    pub fn start<S: EventSink>(&mut self, sink: &mut S) -> Result<StepOutcome, CoreError> {
        let mut rng = self.state.rng;
        let res = {
            let mut dice = LiveDice { rng: &mut rng };
            self.start_with_dice(&mut dice, sink)
        };
        self.state.rng = rng;
        res
    }

    /// Start the fight using an explicit [`DiceSource`] (e.g. [`crate::rng::SuppliedDraws`]).
    pub fn start_with_dice<D: DiceSource, S: EventSink>(
        &mut self,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<StepOutcome, CoreError> {
        if self.state.started {
            return Err(CoreError::InvalidPhase("fight already started".into()));
        }
        let draws_before = self.state.draws;
        self.emit_ev(sink, Event::CombatStarted);
        self.roll_initiative(dice, sink)?;
        self.open_turn(dice, sink)?;
        if !self.state.finished && !self.state.order.is_empty() {
            let cur = self.current();
            if self.template_of(cur).caster.is_some() && !self.unit(cur).flags.is_incapacitated() {
                self.unit_mut(cur).pools_init = true;
            }
        }
        self.state.revision += 1;
        Ok(StepOutcome {
            phase: self.phase(),
            revision: self.state.revision,
            draws_consumed: self.state.draws - draws_before,
        })
    }

    /// Apply a revision-bound [`ActionId`] returned by [`Fight::legal_actions`].
    /// Stale or foreign IDs fail immediately without mutating state or RNG.
    pub fn apply<S: EventSink>(
        &mut self,
        action_id: ActionId,
        sink: &mut S,
    ) -> Result<StepOutcome, CoreError> {
        let mut rng = self.state.rng;
        let res = {
            let mut dice = LiveDice { rng: &mut rng };
            self.apply_with_dice(action_id, &mut dice, sink)
        };
        self.state.rng = rng;
        res
    }

    pub fn apply_with_dice<D: DiceSource, S: EventSink>(
        &mut self,
        action_id: ActionId,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<StepOutcome, CoreError> {
        if action_id.fight_id != self.meta.fight_id || action_id.revision != self.state.revision {
            return Err(CoreError::StaleActionId {
                expected_fight: self.meta.fight_id,
                expected_rev: self.state.revision,
                got: action_id,
            });
        }
        let FightPhase::AwaitingAction(actor) = self.phase() else {
            return Err(CoreError::InvalidPhase("not awaiting a turn action".into()));
        };
        let legal = self.legal_actions(Observer::Full);
        let chosen = legal
            .into_iter()
            .find(|a| a.id == action_id)
            .ok_or_else(|| CoreError::UnknownAction(format!("index {}", action_id.index)))?;
        self.apply_payload_with_dice(actor, &chosen.payload, dice, sink)
    }

    /// Apply an explicit [`ActionPayload`] for the active unit (used by replay drivers
    /// and internal callers after validation).
    pub fn apply_payload_with_dice<D: DiceSource, S: EventSink>(
        &mut self,
        actor: UnitId,
        payload: &ActionPayload,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<StepOutcome, CoreError> {
        let FightPhase::AwaitingAction(cur) = self.phase() else {
            return Err(CoreError::InvalidPhase("not awaiting a turn action".into()));
        };
        if cur != actor {
            return Err(CoreError::InvalidPhase(format!(
                "actor {} is not current turn unit {}",
                self.unit_key(actor),
                self.unit_key(cur)
            )));
        }
        let draws_before = self.state.draws;
        if self.template_of(actor).caster.is_some() {
            self.unit_mut(actor).pools_init = true;
        }
        if matches!(payload, ActionPayload::EndTurn) {
            self.arena_end_turn(dice, sink)?;
        } else {
            self.execute_payload(actor, payload, dice, sink)?;
            if self.state.interrupts.is_empty() {
                self.finish_if_needed(sink);
            }
        }
        self.state.revision += 1;
        // Update prompt_id revision on any newly-pushed interrupt so respond_reaction binds to it!
        if let Some(top) = self.state.interrupts.frames.last_mut() {
            top.prompt_id = ActionId {
                fight_id: self.meta.fight_id,
                revision: self.state.revision,
                index: 0,
            };
            let info = top.info();
            self.emit_ev(sink, Event::ReactionPrompted(info));
        }
        Ok(StepOutcome {
            phase: self.phase(),
            revision: self.state.revision,
            draws_consumed: self.state.draws - draws_before,
        })
    }

    /// Answer a pending [`FightPhase::AwaitingReaction`] prompt using the built-in RNG.
    pub fn respond_reaction<S: EventSink>(
        &mut self,
        choice: ReactionChoice,
        sink: &mut S,
    ) -> Result<StepOutcome, CoreError> {
        let mut rng = self.state.rng;
        let res = {
            let mut dice = LiveDice { rng: &mut rng };
            self.respond_reaction_with_dice(choice, &mut dice, sink)
        };
        self.state.rng = rng;
        res
    }

    /// Answer a pending reaction prompt using an explicit [`DiceSource`].
    /// Rejects stale, duplicate, or out-of-range replies without touching state or RNG.
    pub fn respond_reaction_with_dice<D: DiceSource, S: EventSink>(
        &mut self,
        choice: ReactionChoice,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<StepOutcome, CoreError> {
        let Some(top) = self.state.interrupts.top() else {
            return Err(CoreError::StaleActionId {
                expected_fight: self.meta.fight_id,
                expected_rev: self.state.revision,
                got: choice.prompt_id,
            });
        };
        if choice.prompt_id != top.prompt_id {
            return Err(CoreError::StaleActionId {
                expected_fight: self.meta.fight_id,
                expected_rev: self.state.revision,
                got: choice.prompt_id,
            });
        }
        let selected_opt = match choice.choice_index {
            None => ReactionOption::Decline,
            Some(idx) => *top.options.get(idx as usize).ok_or_else(|| {
                CoreError::InvalidReactionChoice(format!("choice index {idx} out of range"))
            })?,
        };
        let draws_before = self.state.draws;
        let frame = self.state.interrupts.pop().unwrap();
        self.resolve_interrupt_frame(frame, selected_opt, dice, sink)?;
        if self.state.interrupts.is_empty() {
            self.finish_if_needed(sink);
        }
        self.state.revision += 1;
        if let Some(next_top) = self.state.interrupts.frames.last_mut() {
            next_top.prompt_id = ActionId {
                fight_id: self.meta.fight_id,
                revision: self.state.revision,
                index: 0,
            };
            let info = next_top.info();
            self.emit_ev(sink, Event::ReactionPrompted(info));
        }
        Ok(StepOutcome {
            phase: self.phase(),
            revision: self.state.revision,
            draws_consumed: self.state.draws - draws_before,
        })
    }

    /// End the active unit's turn cleanly.
    pub fn end_turn<S: EventSink>(&mut self, sink: &mut S) -> Result<StepOutcome, CoreError> {
        let mut rng = self.state.rng;
        let res = {
            let mut dice = LiveDice { rng: &mut rng };
            self.end_turn_with_dice(&mut dice, sink)
        };
        self.state.rng = rng;
        res
    }

    pub fn end_turn_with_dice<D: DiceSource, S: EventSink>(
        &mut self,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<StepOutcome, CoreError> {
        let FightPhase::AwaitingAction(cur) = self.phase() else {
            return Err(CoreError::InvalidPhase("not awaiting turn action".into()));
        };
        self.apply_payload_with_dice(cur, &ActionPayload::EndTurn, dice, sink)
    }

    // ------------------------------------------------------------------
    // Internal Helpers: Dice, Events, Digest
    // ------------------------------------------------------------------

    #[inline]
    pub(crate) fn emit_ev<S: EventSink>(&mut self, sink: &mut S, ev: Event) {
        self.state.event_cursor += 1;
        if S::ACTIVE {
            sink.emit(ev);
        }
    }

    pub(crate) fn draw_primitive<D: DiceSource, S: EventSink>(
        &mut self,
        who: UnitId,
        tag: &str,
        sides: i32,
        mode: RollMode,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<DrawVal, CoreError> {
        let who_key = self.meta.unit_keys[who.idx()].clone();
        let val = dice.draw(&who_key, tag, sides, mode)?;
        self.state.draws += 1;
        self.state.event_cursor += 1;
        if S::ACTIVE {
            sink.emit(Event::Draw(DrawRecord {
                who: who_key,
                tag: tag.to_string(),
                sides,
                mode,
                val,
            }));
        }
        Ok(val)
    }

    pub(crate) fn roll_dice<D: DiceSource, S: EventSink>(
        &mut self,
        who: UnitId,
        tag: &str,
        count: i32,
        sides: i32,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<SmallVec<[i32; 8]>, CoreError> {
        let mut out = SmallVec::new();
        for _ in 0..count.max(0) {
            let v = self.draw_primitive(who, tag, sides, RollMode::Normal, dice, sink)?.one();
            out.push(v);
        }
        Ok(out)
    }

    pub(crate) fn roll_d20<D: DiceSource, S: EventSink>(
        &mut self,
        who: UnitId,
        tag: &str,
        mode: RollMode,
        dice: &mut D,
        sink: &mut S,
    ) -> Result<i32, CoreError> {
        let v = self.draw_primitive(who, tag, 20, mode, dice, sink)?;
        Ok(v.selected(mode))
    }

    /// Build canonical [`StateDigest`] matching rule-18 tape `state` records verbatim.
    pub fn state_digest(&self) -> StateDigest {
        let gt = self.gt();
        let units = (0..self.state.units.len())
            .map(|i| {
                let id = UnitId(i as u8);
                let u = self.unit(id);
                let t = self.template_of(id);
                let mut st: Vec<String> = Vec::new();
                if u.flags.contains(UnitFlags::PRONE) { st.push("prone".into()); }
                if u.flags.contains(UnitFlags::UNCONSCIOUS) { st.push("unconscious".into()); }
                if u.flags.contains(UnitFlags::DEAD) { st.push("dead".into()); }
                if u.flags.contains(UnitFlags::STABLE) { st.push("stable".into()); }
                if u.flags.contains(UnitFlags::PARALYZED) { st.push("paralyzed".into()); }
                if u.flags.contains(UnitFlags::INCAPACITATED) { st.push("incapacitated".into()); }
                if u.flags.contains(UnitFlags::FRIGHTENED) { st.push("frightened".into()); }
                if u.flags.contains(UnitFlags::HIDDEN) { st.push("hidden".into()); }
                if u.flags.contains(UnitFlags::CHARMED) { st.push("charmed".into()); }
                if u.flags.contains(UnitFlags::GRAPPLED) { st.push("grappled".into()); }
                if u.flags.contains(UnitFlags::RESTRAINED) { st.push("restrained".into()); }
                if u.flags.contains(UnitFlags::INVISIBLE) { st.push("invisible".into()); }
                if u.flags.contains(UnitFlags::DEAFENED) { st.push("deafened".into()); }
                st.sort();

                let mut bst: Vec<String> = Vec::new();
                if u.flags.contains(UnitFlags::DODGING) { bst.push("dodge".into()); }
                if u.flags.contains(UnitFlags::DISENGAGED) { bst.push("disengage".into()); }
                bst.sort();

                let mut fx: Vec<String> = Vec::new();
                let stench_cnt = self
                    .state
                    .effects
                    .count_kind(id, |k| matches!(k, EffectKind::StenchPoison));
                if stench_cnt > 0 {
                    fx.push(format!("poisoned:{stench_cnt}"));
                }
                let para_cnt = self
                    .state
                    .effects
                    .count_kind(id, |k| matches!(k, EffectKind::TimedParalyzed { .. }));
                if para_cnt > 0 {
                    fx.push(format!("timed_condition:{para_cnt}"));
                }
                fx.sort();

                let pools = t.caster.as_ref().filter(|_| u.pools_init).and_then(|c| {
                    let mut m = BTreeMap::new();
                    for (pi, pname) in c.free_cast_pools.iter().enumerate() {
                        let avail = i32::from((u.free_cast_mask & (1u8 << pi)) != 0);
                        m.insert(pname.clone(), avail);
                    }
                    (!m.is_empty()).then_some(m)
                });

                UnitDigest {
                    id: self.meta.unit_keys[i].clone(),
                    pos: Some([u.pos.x as i32, u.pos.y as i32]),
                    hp: u.hp as i32,
                    mhp: self.max_hp_of(id),
                    thp: u.temp_hp as i32,
                    st,
                    fx,
                    bst,
                    res: [
                        u.action as i32,
                        u.bonus as i32,
                        u.reaction as i32,
                        u.movement as i32,
                    ],
                    ds: [u.death_saves as i32, u.death_fails as i32],
                    strength: t.abilities[0] as i32,
                    sl: t.caster.as_ref().filter(|_| t.pc).map(|_| [u.slots[1] as i32, u.slots[2] as i32]),
                    conc: None,
                    cd: None,
                    pools,
                    sp: t.sorcerer.then_some(u.sorcery_points as i32),
                    isc: t.sorcerer.then_some(u.innate_sorcery_left as i32),
                    isu: if t.sorcerer && u.innate_until >= 0 && gt <= u.innate_until {
                        Some(u.innate_until)
                    } else {
                        None
                    },
                    sw: t.fighter.then_some(u.second_wind_left as i32),
                    action_surge: (t.action_surge_uses > 0).then_some(u.action_surge_left as i32),
                    asu: (t.action_surge_uses > 0).then_some(u.action_surge_used),
                    rg: None,
                    cv: None,
                }
            })
            .collect();

        StateDigest {
            round: self.state.round,
            cur: if self.state.started && !self.state.order.is_empty() {
                Some(self.unit_key(self.current()).to_string())
            } else {
                None
            },
            units,
        }
    }

    pub(crate) fn push_interrupt(
        &mut self,
        kind: InterruptKind,
        reactor: UnitId,
        trigger_actor: UnitId,
        options: SmallVec<[ReactionOption; 8]>,
        continuation: ActionContinuation,
    ) {
        self.state.interrupts.push(InterruptFrame {
            prompt_id: ActionId {
                fight_id: self.meta.fight_id,
                revision: self.state.revision,
                index: 0,
            },
            kind,
            reactor,
            trigger_actor,
            options,
            continuation,
        });
    }
}

static NEXT_FIGHT_SEQ: AtomicU64 = AtomicU64::new(1);

fn compute_fight_id(spec: &EncounterSpec, grid: &Grid, seed: u64) -> u64 {
    let seq = NEXT_FIGHT_SEQ.fetch_add(1, Ordering::Relaxed);
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    let mut mix = |bytes: &[u8]| {
        for &b in bytes {
            h ^= b as u64;
            h = h.wrapping_mul(0x0000_0100_0000_01b3);
        }
    };
    mix(&seed.to_le_bytes());
    mix(&seq.to_le_bytes());
    mix(&spec.max_rounds.to_le_bytes());
    mix(&(spec.units.len() as u64).to_le_bytes());
    for uid in &spec.units {
        mix(uid.as_bytes());
        mix(&[0xff]);
    }
    for pl in &spec.placements {
        mix(pl.id.as_bytes());
        mix(&pl.x.to_le_bytes());
        mix(&pl.y.to_le_bytes());
    }
    mix(&(grid.w as u16).to_le_bytes());
    mix(&(grid.h as u16).to_le_bytes());
    for row in &grid.rows {
        mix(row.as_bytes());
        mix(&[0xfe]);
    }
    h ^= h >> 30;
    h = h.wrapping_mul(0xbf58_476d_1ce4_e5b9);
    h ^= h >> 27;
    h = h.wrapping_mul(0x94d0_49bb_1331_11eb);
    h ^ (h >> 31)
}

fn payload_kind(payload: &ActionPayload) -> &'static str {
    match payload {
        ActionPayload::Move(_) => "move",
        ActionPayload::Attack { .. } => "attack",
        ActionPayload::Dash => "dash",
        ActionPayload::Disengage => "disengage",
        ActionPayload::Dodge => "dodge",
        ActionPayload::Stand => "stand",
        ActionPayload::SecondWind => "second_wind",
        ActionPayload::ActionSurge => "action_surge",
        ActionPayload::InnateSorcery => "innate_sorcery",
        ActionPayload::CastSpell { .. } => "spell",
        ActionPayload::EndTurn => "end_turn",
    }
}
