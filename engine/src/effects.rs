//! natural20's effect machinery (`Entity.effects`, `entity_event_hooks`,
//! `casted_effects`, concentration), mirrored for the scenario's spells.
//!
//! natural20 keeps effects in `entity.effects[<key>]` lists of descriptors
//! `{handler, effect, source, expiration}`. The *effect* is an object: a
//! `Spell` instance (Bless, Shield of Faith, Guiding Bolt, Protection from Evil
//! and Good) whose `id` is the spell's YAML id, shared by every casting, or a
//! dedicated effect object (Aid, Command, Sanctuary, Spiritual Weapon's force)
//! with a unique id. `remove_effect` matches by that id, `dismiss_effect` and
//! hooks by identity. Expired descriptors stay in the lists until
//! `_cleanup_effects` (at `reset_turn`) dismisses them; the state digest
//! counts them.

use crate::content::SpellId;
use crate::engine::{Fight, St};
use crate::map::Pos;

/// Insertion-order slot of `entity.effects` keys for `UndeadWebArena._marks` (`F5.3`).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MarkSlot {
    Eff(EffKey),
    StrengthOverride,
    HealOverride,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum EffKey {
    Bless,
    AcBonus,
    TargetedAdvantageOverride,
    LightOverride,
    HitPointMaxOverride,
    Commanded,
    AttackedAdvantageModifier,
    TargetingWard,
    SpeedOverride,
    DragonsBreath,
    /// Mage Armor's base AC (`PlayerCharacter.armor_class` evaluates it).
    AcOverride,
    /// Invisibility / Will-o'-Wisp Vanish (`invisibility_spell.py`).
    Invisible,
    /// Entangle restraint (`entangle_spell.py`).
    RestrainedOverride,
    /// Break Free opt-in (`break_free_action.py`).
    EscapableRestraint,
    /// Ray of Sickness 5e-2024 auto-Poisoned until end of caster's next turn.
    RayOfSickness,
    /// Faerie Fire outline (SRD 5.2.1): 10-ft Dim Light, cancels Invisible, Advantage to visible attackers.
    FaerieFire,
    /// See Invisibility (SRD 5.2.1): 1 hour, no concentration; caster sees Invisible creatures normally.
    SeeInvisibility,
    /// Vicious Mockery (SRD 5.2.1): Disadvantage on next attack roll before end of target's next turn.
    ViciousMockery,
    /// Starry Wisp (SRD 5.2.1): 10-ft Dim Light & cancels Invisible until end of caster's next turn.
    StarryWisp,
    /// Bardic Inspiration die (SRD 5.2.1): 1 hour, spent after failing a D20 Test.
    BardicInspiration,
}

impl EffKey {
    pub fn name(self) -> &'static str {
        match self {
            EffKey::Bless => "bless",
            EffKey::AcBonus => "ac_bonus",
            EffKey::TargetedAdvantageOverride => "targeted_advantage_override",
            EffKey::LightOverride => "light_override",
            EffKey::HitPointMaxOverride => "hit_point_max_override",
            EffKey::Commanded => "commanded",
            EffKey::AttackedAdvantageModifier => "attacked_advantage_modifier",
            EffKey::TargetingWard => "targeting_ward",
            EffKey::SpeedOverride => "speed_override",
            EffKey::DragonsBreath => "dragons_breath",
            EffKey::AcOverride => "ac_override",
            EffKey::Invisible => "invisible",
            EffKey::RestrainedOverride => "restrained_override",
            EffKey::EscapableRestraint => "escapable_restraint",
            EffKey::RayOfSickness => "ray_of_sickness",
            EffKey::FaerieFire => "faerie_fire",
            EffKey::SeeInvisibility => "see_invisibility",
            EffKey::ViciousMockery => "vicious_mockery",
            EffKey::StarryWisp => "starry_wisp",
            EffKey::BardicInspiration => "bardic_inspiration",
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct EffEntry {
    pub obj: u32,
    pub exp: Option<i32>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum HookEv {
    StartOfTurn,
    EndOfTurn,
    AfterAttackRollTarget,
    AttackResolved,
    SpellCast,
    DealtDamage,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum HookKind {
    /// `GuidingBoltSpell.start_of_turn` (on the caster).
    GuidingBoltStart,
    /// `GuidingBoltSpell.end_of_turn` (on the caster).
    GuidingBoltEnd,
    /// `GuidingBoltSpell.after_attack_roll_target` (on the target).
    GuidingBoltAfterRoll,
    CommandStart,
    CommandEnd,
    /// `SanctuaryEffect.attack_resolved / spell_cast / dealt_damage`.
    SanctuaryEnd,
    /// `RayOfFrostSpell.start_of_turn` (on the caster): `RayOfFrostSpell.end`.
    RayOfFrostStart,
    /// `ShieldSpell.start_of_turn` (on the caster).
    ShieldStart,
    /// `InvisibilitySpell.attack_resolved` / `spell_cast` (breaks invisibility).
    InvisibilityBreak,
    /// `RaySicknessPoison.start_of_turn` / `end_of_turn` (on the caster).
    RaySicknessStart,
    RaySicknessEnd,
    /// `SpeedPenaltyEffect.start_of_turn` / `end_of_turn` (on the source).
    SpeedPenaltyStart,
    SpeedPenaltyEnd,
    /// `ViciousMockery` expires at the end of the target's next turn.
    ViciousMockeryEnd,
    /// `StarryWisp` lasts until the end of the caster's next turn.
    StarryWispStart,
    StarryWispEnd,
}

#[derive(Clone, Copy, Debug)]
pub struct Hook {
    pub ev: HookEv,
    pub kind: HookKind,
    pub obj: u32,
    pub exp: Option<i32>,
}

/// The id `remove_effect` matches on.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Ident {
    Spell(SpellId),
    Unique(u32),
}

#[derive(Clone, Debug)]
pub enum ObjKind {
    /// A `Spell` object used as its own effect; `targets` is `action.target`.
    Spell,
    Aid { target: usize, bonus: i32 },
    Command { target: usize, grovel: bool, due: bool, obeyed: bool, added_incap: bool },
    Sanctuary { target: usize, dc: i32 },
    /// Spiritual Weapon's `SpiritualForce`.
    Force { level: i32, pos: Pos, modifier: i32, cast_turn: (i32, usize), last_attack_turn: Option<(i32, usize)>, expires_at: i32 },
    /// `DragonsBreathEffect` (on the breather; the caster's concentration).
    Breath { target: usize, dt: crate::content::Dmg, dice: i32 },
    /// `BlurEffect` (on the caster; its concentration).
    Blur,
    /// `InvisibilitySpell` (Concentration on caster; breaks on attack/spell).
    Invisibility,
    /// `VanishEffect` (Will-o'-Wisp Concentration; breaks on attack or Consume Life).
    Vanish,
    /// `LuringSongConcentration` (Harpy Concentration; dismissing ends lure on victims).
    LuringSong { dc: i32 },
    /// `EntangleSpell` + `EntangleZone` (20-ft square of Difficult Terrain + restraints).
    Entangle { squares: Vec<Pos>, dc: i32, restraints: Vec<u32>, expires_at: i32 },
    /// `EntangleRestraint` (on one restrained creature; self-only Break Free).
    EntangleRestraint { target: usize, dc: i32, zone: u32 },
    /// `RaySicknessPoison` (Poisoned until end of caster's next turn).
    RaySickness { target: usize, armed: bool, added_status: bool },
    /// `SpeedPenaltyEffect` (Steam Breath -10 ft speed until end of source's next turn).
    SpeedPenalty { target: usize, penalty: i32, armed: bool },
    /// `FaerieFire` (Concentration on caster; outlines all failed targets in 20-ft Cube).
    FaerieFire,
    /// `SeeInvisibility` (Self, 1 hour, no concentration).
    SeeInvisibility,
    /// `ViciousMockery` (Disadvantage on next attack roll before end of target's next turn).
    ViciousMockery { target: usize },
    /// `StarryWisp` (10-ft Dim Light + cancels Invisible until end of caster's next turn).
    StarryWisp { target: usize, armed: bool },
    /// `BardicInspiration` die held by recipient (1 hour; SRD 5.2.1).
    BardicInspiration { target: usize, die: crate::content::Dice },
}

#[derive(Clone, Debug)]
pub struct EffObj {
    pub ident: Ident,
    pub spell: SpellId,
    pub kind: ObjKind,
    pub source: usize,
    /// `effect.action.target` of a `Spell` object (in target order).
    pub targets: Vec<usize>,
    pub ended: bool,
}

impl EffObj {
    /// Concentration string written into `UnitDigest.conc` (mirrors `n20_record.py`).
    pub fn conc_name(&self) -> &'static str {
        match &self.kind {
            ObjKind::Vanish => "vanish",
            ObjKind::LuringSong { .. } => "luring_song",
            ObjKind::Invisibility => "invisibility",
            ObjKind::Entangle { .. } => "entangle",
            _ => self.spell.key(),
        }
    }
}

impl Fight {
    /// `session.game_time`: six seconds per round.
    #[inline]
    pub fn gt(&self) -> i32 {
        self.round * 6
    }

    #[inline]
    fn entry_active(&self, exp: Option<i32>) -> bool {
        exp.map_or(true, |x| x > self.gt())
    }

    pub fn new_obj(&mut self, spell: SpellId, kind: ObjKind, source: usize, targets: Vec<usize>, unique: bool) -> u32 {
        let id = self.objs.len() as u32;
        let ident = if unique { Ident::Unique(id) } else { Ident::Spell(spell) };
        self.objs.push(EffObj { ident, spell, kind, source, targets, ended: false });
        id
    }

    /// `Entity.has_effect(key)`.
    pub fn has_effect(&self, u: usize, key: EffKey) -> bool {
        self.units[u]
            .effects
            .iter()
            .find(|(k, _)| *k == key)
            .map_or(false, |(_, list)| list.iter().any(|e| self.entry_active(e.exp)))
    }

    /// Active descriptors of `key` (in order).
    pub fn active_effects(&self, u: usize, key: EffKey) -> Vec<u32> {
        match self.units[u].effects.iter().find(|(k, _)| *k == key) {
            Some((_, list)) => list.iter().filter(|e| self.entry_active(e.exp)).map(|e| e.obj).collect(),
            None => Vec::new(),
        }
    }

    /// `eval_effect` (not stacked): the last active descriptor.
    pub fn last_effect(&self, u: usize, key: EffKey) -> Option<u32> {
        self.active_effects(u, key).last().copied()
    }

    /// `Entity.register_effect`.
    pub fn register_effect(&mut self, u: usize, key: EffKey, obj: u32, duration: Option<i32>) {
        let exp = duration.map(|d| self.gt() + d);
        let unit = &mut self.units[u];
        if !unit.effect_key_order.contains(&MarkSlot::Eff(key)) {
            unit.effect_key_order.push(MarkSlot::Eff(key));
        }
        match unit.effects.iter_mut().find(|(k, _)| *k == key) {
            Some((_, list)) => list.push(EffEntry { obj, exp }),
            None => unit.effects.push((key, vec![EffEntry { obj, exp }])),
        }
    }

    /// `Entity.register_event_hook`.
    pub fn register_hook(&mut self, u: usize, ev: HookEv, kind: HookKind, obj: u32, duration: Option<i32>) {
        let exp = duration.map(|d| self.gt() + d);
        self.units[u].hooks.push(Hook { ev, kind, obj, exp });
    }

    /// `Entity.add_casted_effect` (on the caster).
    pub fn add_casted(&mut self, caster: usize, target: usize, obj: u32, duration: Option<i32>) {
        let exp = duration.map(|d| self.gt() + d);
        if !self.units[caster].casted.iter().any(|c| c.1 == obj && c.0 == target && c.2 == exp) {
            self.units[caster].casted.push((target, obj, exp));
        }
    }

    /// `Entity.remove_effect(effect)`.
    pub fn remove_effect(&mut self, u: usize, obj: u32) {
        let ident = self.objs[obj as usize].ident;
        let src = self.objs[obj as usize].source;
        let mut removed: Option<u32> = None;
        {
            let objs = &self.objs;
            let casted = &mut self.units[src].casted;
            for c in casted.iter() {
                if objs[c.1 as usize].ident == ident {
                    removed = Some(c.1);
                }
            }
            casted.retain(|c| objs[c.1 as usize].ident != ident);
        }
        {
            let objs = &self.objs;
            let unit = &mut self.units[u];
            for (_, list) in unit.effects.iter_mut() {
                for e in list.iter() {
                    if objs[e.obj as usize].ident == ident {
                        removed = Some(e.obj);
                    }
                }
                list.retain(|e| objs[e.obj as usize].ident != ident);
            }
            unit.hooks.retain(|h| h.obj != obj);
        }
        if let Some(r) = removed {
            self.obj_dismiss(r, u);
        }
    }

    /// `Entity.dismiss_effect(effect)`.
    pub fn dismiss_effect(&mut self, u: usize, obj: u32) {
        if self.units[u].concentration == Some(obj) {
            self.units[u].concentration = None;
        }
        if matches!(self.objs[obj as usize].kind, ObjKind::Spell | ObjKind::Invisibility | ObjKind::FaerieFire) {
            let targets = self.objs[obj as usize].targets.clone();
            for t in targets {
                self.remove_effect(t, obj);
            }
        }
        self.remove_effect(u, obj);
        // `LuringSongConcentration` and `EntangleZone` have no entry in `u.effects` or
        // `u.casted` (for LuringSong), so `remove_effect` won't call `obj_dismiss` unless
        // invoked directly when dismissing concentration.
        if !self.objs[obj as usize].ended
            && matches!(self.objs[obj as usize].kind, ObjKind::LuringSong { .. } | ObjKind::Entangle { .. } | ObjKind::Vanish | ObjKind::Invisibility)
        {
            self.obj_dismiss(obj, u);
        }
    }

    /// The effect object's own `dismiss(entity, ...)` hook.
    fn obj_dismiss(&mut self, obj: u32, entity: usize) {
        let kind = self.objs[obj as usize].kind.clone();
        match kind {
            ObjKind::Spell => {}
            ObjKind::Aid { target, .. } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                let mhp = self.max_hp_of(target);
                if self.units[target].hp > mhp {
                    self.units[target].hp = mhp;
                }
            }
            ObjKind::Command { target, .. } => self.command_finish(obj, target),
            ObjKind::Sanctuary { target, .. } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                if target != entity {
                    self.remove_effect(target, obj);
                }
            }
            ObjKind::Force { .. } => {
                self.objs[obj as usize].ended = true;
            }
            ObjKind::Breath { target, .. } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                let source = self.objs[obj as usize].source;
                self.remove_effect(target, obj);
                self.remove_effect(source, obj);
                if self.units[source].concentration == Some(obj) {
                    self.units[source].concentration = None;
                }
            }
            ObjKind::Blur => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                let source = self.objs[obj as usize].source;
                self.remove_effect(source, obj);
                if self.units[source].concentration == Some(obj) {
                    self.units[source].concentration = None;
                }
            }
            ObjKind::Invisibility => {
                // `InvisibilitySpell.dismiss(entity)`: remove 'invisible' from entity.statuses
                self.units[entity].statuses.retain(|s| *s != St::Invisible);
                let targets = self.objs[obj as usize].targets.clone();
                for t in targets {
                    self.units[t].statuses.retain(|s| *s != St::Invisible);
                }
            }
            ObjKind::Vanish => {
                // `VanishEffect.dismiss(entity)`: `InvisibilitySpell._end_for_target`
                self.invisibility_end_for_target(entity, obj);
            }
            ObjKind::LuringSong { .. } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                let source = self.objs[obj as usize].source;
                self.end_all_lures_by(source);
            }
            ObjKind::Entangle { restraints, .. } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                for r in restraints {
                    self.dismiss_entangle_restraint(r);
                }
                if let ObjKind::Entangle { restraints, .. } = &mut self.objs[obj as usize].kind {
                    restraints.clear();
                }
            }
            ObjKind::EntangleRestraint { target, zone, .. } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                self.remove_effect(target, obj);
                if let ObjKind::Entangle { restraints, .. } = &mut self.objs[zone as usize].kind {
                    restraints.retain(|&r| r != obj);
                }
            }
            ObjKind::RaySickness { target, added_status, .. } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                if added_status {
                    self.units[target].statuses.retain(|s| *s != St::Poisoned);
                }
                if target != entity {
                    self.remove_effect(target, obj);
                }
                let source = self.objs[obj as usize].source;
                if source != entity {
                    self.remove_effect(source, obj);
                }
                self.units[source].hooks.retain(|h| h.obj != obj);
            }
            ObjKind::SpeedPenalty { target, .. } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                let source = self.objs[obj as usize].source;
                self.remove_effect(target, obj);
                self.remove_effect(source, obj);
                self.units[source].hooks.retain(|h| h.obj != obj);
            }
            ObjKind::FaerieFire => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                let source = self.objs[obj as usize].source;
                let targets = self.objs[obj as usize].targets.clone();
                for t in targets {
                    self.remove_effect(t, obj);
                }
                if self.units[source].concentration == Some(obj) {
                    self.units[source].concentration = None;
                }
            }
            ObjKind::SeeInvisibility => {
                self.objs[obj as usize].ended = true;
            }
            ObjKind::ViciousMockery { target } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                self.remove_effect(target, obj);
                self.units[target].hooks.retain(|h| h.obj != obj);
            }
            ObjKind::StarryWisp { target, .. } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                let source = self.objs[obj as usize].source;
                self.remove_effect(target, obj);
                self.remove_effect(source, obj);
                self.units[source].hooks.retain(|h| h.obj != obj);
            }
            ObjKind::BardicInspiration { target, .. } => {
                if self.objs[obj as usize].ended {
                    return;
                }
                self.objs[obj as usize].ended = true;
                self.remove_effect(target, obj);
            }
        }
    }

    /// `InvisibilitySpell._end_for_target(entity, effect)`: drops `St::Invisible`,
    /// `effects` entries, and `hooks` for `obj` without clearing concentration.
    pub fn invisibility_end_for_target(&mut self, u: usize, obj: u32) {
        let unit = &mut self.units[u];
        unit.statuses.retain(|s| *s != St::Invisible);
        for (_, list) in unit.effects.iter_mut() {
            list.retain(|e| e.obj != obj);
        }
        unit.hooks.retain(|h| h.obj != obj);
    }

    /// Dismiss one `EntangleRestraint` object cleanly.
    pub fn dismiss_entangle_restraint(&mut self, obj: u32) {
        let ObjKind::EntangleRestraint { target, zone, .. } = self.objs[obj as usize].kind else { return };
        if self.objs[obj as usize].ended {
            return;
        }
        self.objs[obj as usize].ended = true;
        self.remove_effect(target, obj);
        if let ObjKind::Entangle { restraints, .. } = &mut self.objs[zone as usize].kind {
            restraints.retain(|&r| r != obj);
        }
    }

    /// `Entity.concentration_on` (via `Battle.start_concentration`).
    pub fn concentration_on(&mut self, u: usize, obj: u32) {
        if let Some(old) = self.units[u].concentration {
            self.dismiss_effect(u, old);
        }
        self.units[u].concentration = Some(obj);
    }

    /// `Entity._cleanup_effects` (end of `reset_turn`).
    pub fn cleanup_effects(&mut self, u: usize) {
        let gt = self.gt();
        let mut expired: Vec<u32> = Vec::new();
        for (_, list) in &self.units[u].effects {
            for e in list {
                if e.exp.map_or(false, |x| x <= gt) && !expired.contains(&e.obj) {
                    expired.push(e.obj);
                }
            }
        }
        for obj in expired {
            self.dismiss_effect(u, obj);
        }
        self.units[u].hooks.retain(|h| h.exp.map_or(true, |x| x > gt));
        let dead: Vec<u32> =
            self.units[u].casted.iter().filter(|c| c.2.map_or(false, |x| x <= gt)).map(|c| c.1).collect();
        for obj in dead {
            self.dismiss_effect(u, obj);
        }
    }

    /// `Entity.resolve_trigger(event)`. Returns the effects that
    /// `after_attack_roll_target` hooks ask to dismiss (as result items).
    pub fn resolve_trigger(&mut self, u: usize, ev: HookEv) -> Vec<(usize, u32)> {
        let gt = self.gt();
        let hooks: Vec<Hook> =
            self.units[u].hooks.iter().filter(|h| h.ev == ev && h.exp.map_or(true, |x| x > gt)).copied().collect();
        let mut out = Vec::new();
        for h in hooks {
            match h.kind {
                HookKind::GuidingBoltStart => {
                    self.register_hook(u, HookEv::EndOfTurn, HookKind::GuidingBoltEnd, h.obj, None);
                }
                HookKind::GuidingBoltEnd => {
                    if let Some(&t) = self.objs[h.obj as usize].targets.first() {
                        self.dismiss_effect(t, h.obj);
                    }
                }
                HookKind::GuidingBoltAfterRoll => out.push((u, h.obj)),
                HookKind::CommandStart => self.command_turn_start(u, h.obj),
                HookKind::CommandEnd => {
                    if let ObjKind::Command { due, .. } = self.objs[h.obj as usize].kind {
                        if due {
                            self.command_finish(h.obj, u);
                        }
                    }
                }
                HookKind::SanctuaryEnd => {
                    if !self.objs[h.obj as usize].ended {
                        self.dismiss_effect(u, h.obj);
                    }
                }
                HookKind::RayOfFrostStart => self.ray_of_frost_end(u, h.obj),
                HookKind::ShieldStart => self.dismiss_effect(u, h.obj),
                HookKind::InvisibilityBreak => self.invisibility_end_for_target(u, h.obj),
                HookKind::RaySicknessStart => {
                    if let ObjKind::RaySickness { armed, .. } = &mut self.objs[h.obj as usize].kind {
                        *armed = true;
                    }
                }
                HookKind::RaySicknessEnd => {
                    if let ObjKind::RaySickness { armed: true, .. } = self.objs[h.obj as usize].kind {
                        self.dismiss_effect(u, h.obj);
                    }
                }
                HookKind::SpeedPenaltyStart => {
                    if let ObjKind::SpeedPenalty { armed, .. } = &mut self.objs[h.obj as usize].kind {
                        *armed = true;
                    }
                }
                HookKind::SpeedPenaltyEnd => {
                    if let ObjKind::SpeedPenalty { armed: true, .. } = self.objs[h.obj as usize].kind {
                        self.obj_dismiss(h.obj, u);
                    }
                }
                HookKind::ViciousMockeryEnd => {
                    self.dismiss_effect(u, h.obj);
                }
                HookKind::StarryWispStart => {
                    if let ObjKind::StarryWisp { armed, .. } = &mut self.objs[h.obj as usize].kind {
                        *armed = true;
                    }
                }
                HookKind::StarryWispEnd => {
                    if let ObjKind::StarryWisp { armed: true, .. } = self.objs[h.obj as usize].kind {
                        self.dismiss_effect(u, h.obj);
                    }
                }
            }
        }
        out
    }

    /// `RayOfFrostSpell.end(caster, effect)` (N20-015): exactly this cast's
    /// speed reduction, its casted entry and the caster's start-of-turn hook.
    fn ray_of_frost_end(&mut self, caster: usize, obj: u32) {
        if let Some(&t) = self.objs[obj as usize].targets.first() {
            for (_, list) in self.units[t].effects.iter_mut() {
                list.retain(|e| e.obj != obj);
            }
        }
        self.units[caster].casted.retain(|c| c.1 != obj);
        self.units[caster].hooks.retain(|h| !(h.ev == HookEv::StartOfTurn && h.obj == obj));
    }

    /// `CommandEffect.on_turn_start`.
    fn command_turn_start(&mut self, u: usize, obj: u32) {
        let ObjKind::Command { grovel, due, obeyed, .. } = self.objs[obj as usize].kind else { return };
        if !due || obeyed || self.objs[obj as usize].ended {
            return;
        }
        if grovel {
            let unit = &mut self.units[u];
            if !unit.t.immune_prone && !unit.has(St::Prone) {
                unit.statuses.push(St::Prone);
            }
        }
        let unit = &mut self.units[u];
        unit.action = 0;
        unit.bonus = 0;
        unit.movement = 0;
        let mut added = false;
        if !unit.has(St::Incapacitated) {
            unit.statuses.push(St::Incapacitated);
            added = true;
        }
        if let ObjKind::Command { obeyed, added_incap, .. } = &mut self.objs[obj as usize].kind {
            *obeyed = true;
            if added {
                *added_incap = true;
            }
        }
    }

    /// `CommandEffect.finish`.
    pub fn command_finish(&mut self, obj: u32, entity: usize) {
        if self.objs[obj as usize].ended {
            return;
        }
        self.objs[obj as usize].ended = true;
        if let ObjKind::Command { added_incap, .. } = &mut self.objs[obj as usize].kind {
            if *added_incap {
                *added_incap = false;
                self.units[entity].statuses.retain(|s| *s != St::Incapacitated);
            }
        }
        let unit = &mut self.units[entity];
        if let Some((_, list)) = unit.effects.iter_mut().find(|(k, _)| *k == EffKey::Commanded) {
            list.retain(|e| e.obj != obj);
        }
        unit.hooks.retain(|h| h.obj != obj);
    }

    /// `PlayerCharacter.max_hp` / `Npc.max_hp`: base minus Life Drain, plus Aid.
    pub fn max_hp_of(&self, u: usize) -> i32 {
        let unit = &self.units[u];
        let base = (unit.t.max_hp - unit.max_hp_reduction).max(0);
        if unit.t.pc {
            if let Some(obj) = self.last_effect(u, EffKey::HitPointMaxOverride) {
                if let ObjKind::Aid { bonus, .. } = self.objs[obj as usize].kind {
                    if !self.objs[obj as usize].ended {
                        return base + bonus;
                    }
                }
            }
        }
        base
    }

    /// `armor_class()` with `ac_bonus_total()` (N20-006): bonuses of
    /// different effects add (Shield +5 and Shield of Faith +2 give +7); the
    /// same effect active twice counts once. A hero's base is its
    /// `equipped_ac()` (the template AC), or under Mage Armor
    /// `max(equipped_ac, 13 + DEX)` (N20-033; `Npc.armor_class` ignores
    /// `ac_override`, N20-035).
    pub fn armor_class(&self, u: usize) -> i32 {
        let t = self.units[u].t;
        let mut ac = t.ac;
        if t.pc && !self.units[u].effects.is_empty() && self.has_effect(u, EffKey::AcOverride) {
            ac = crate::spells::mage_armor_ac(t);
        }
        let active = self.active_effects(u, EffKey::AcBonus);
        if active.iter().any(|&o| self.objs[o as usize].spell == SpellId::Shield) {
            ac += 5;
        }
        if active.iter().any(|&o| self.objs[o as usize].spell != SpellId::Shield) {
            ac += 2;
        }
        ac
    }

    /// Effect counts for the state digest (`fx`).
    pub fn effect_counts(&self, u: usize) -> Vec<String> {
        let mut out = Vec::new();
        for (k, list) in &self.units[u].effects {
            if !list.is_empty() {
                out.push(format!("{}:{}", k.name(), list.len()));
            }
        }
        out
    }
}
