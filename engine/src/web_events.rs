//! Lightweight combat-event enum captured only when `Fight::web_events` is `Some`
//! (used by `present::WebArena`; `None` in headless RL `BatchEnv`), plus exact
//! `DieRoll.describe()` / `Arena._roll()` formatting helpers.

use crate::content::{Dmg, SpellId};
use crate::map::Pos;
use crate::tape::DrawVal;
use crate::trace::RollMode;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SaveOutcome {
    Made,
    Failed,
    AutomaticFailure,
}

impl SaveOutcome {
    pub fn from_check(passed: bool, rolled: bool) -> Self {
        if passed { Self::Made } else if rolled { Self::Failed } else { Self::AutomaticFailure }
    }
}

#[derive(Clone, Debug)]
pub enum DeathSave {
    Roll { passed: bool, description: String },
    Damage { failures: i32 },
}

#[derive(Clone, Debug)]
pub enum WebEv {
    Redirected { boss: usize, ally: usize },
    Initiative {
        u: usize,
        roll_total: i32,
    },
    TurnBegins {
        u: usize,
        round: i32,
    },
    TurnSkipped {
        u: usize,
        round: i32,
    },
    StenchSave {
        source: usize,
        victim: usize,
        victim_pos: Pos,
        total: i32,
        dc: i32,
        passed: bool,
    },
    EmpoweredReroll { caster: usize, sides: i32, old: i32, new: i32 },
    HiddenFound { target: usize },
    HideResult { actor: usize, total: i32, seen: bool },
    SapApplied { source: usize, target: usize },
    DeathSave {
        u: usize,
        outcome: DeathSave,
        round: i32,
    },
    /// Weapon, NPC, spell, or feature attack / save outcome (`attacked` or `miss`).
    AttackOutcome {
        src: usize,
        tgt: Option<usize>,
        src_pos: Pos,
        tgt_pos: Pos,
        attack_name: &'static str,
        spell_style: Option<&'static str>,
        ranged_weapon: bool,
        hit: bool,
        crit: bool,
        reaction: bool,
        save: Option<SaveOutcome>,
        dt: Option<Dmg>,
        raw_damage: i32,
        applied_damage: i32,
        atk_roll_fmt: Option<String>,
        dmg_roll_fmt: Option<String>,
    },
    /// Emitted when a blind attack (`Act::BlindAttack`) hits an unseen occupant,
    /// matching `AttackAction._resolve_blind_attack` setting `self.target = occupant`.
    BlindHitTarget {
        target: usize,
    },
    RiderDamage {
        advantage_roll: Option<String>,
        plain_roll: Option<String>,
        tgt: usize,
        applied_damage: i32,
        dt: Dmg,
    },
    IncorporealDamage { target: usize, roll: i32, applied: i32, round: i32 },
    ShieldCast {
        u: usize,
        pos: Pos,
        slot_level: i32,
        attacker: usize,
        attack_name: &'static str,
        total: i32,
        ac: i32,
    },
    SanctuarySave {
        attacker: usize,
        warded: usize,
        total: i32,
        dc: i32,
    },
    DragonsBreathBuff {
        caster: usize,
        target: usize,
        src_pos: Pos,
        tgt_pos: Pos,
    },
    MassiveDamage { target: usize, excess: i32, maximum: i32 },
    ConcentrationEnded { target: usize, spell: SpellId },
    ConcentrationReplaced { caster: usize, prior: SpellId },
    HealingBlocked { target: usize },
    ThunderwavePush { target: usize, from: Pos, to: Pos },
    ConcentrationSave { target: usize, spell: SpellId, roll: String, dc: i32, passed: bool },
    OrbLeap { from: usize, to: usize },
    RayAtCorpse { src: usize, target: usize },
    Graze {
        src: usize,
        tgt: usize,
        src_pos: Pos,
        tgt_pos: Pos,
        dmg: i32,
        dt: Dmg,
    },
    SecondWind {
        u: usize,
        pos: Pos,
        roll_fmt: String,
        healed: i32,
    },
    SpellHeal {
        caster: usize,
        target: usize,
        src_pos: Pos,
        tgt_pos: Pos,
        style_key: &'static str,
        healed: i32,
        roll: Option<String>,
    },
    TurnUndeadNoTargets {
        cleric: usize,
    },
    TurnUndeadSave {
        cleric: usize,
        target: usize,
        src_pos: Pos,
        tgt_pos: Pos,
        passed: bool,
        destroyed: bool,
        roll_fmt: String,
        dc: i32,
    },
    Turned {
        target: usize,
    },
    TurnEnded {
        u: usize,
        reason: &'static str,
    },
    UndeadFortitude {
        u: usize,
        pos: Pos,
        success: bool,
        roll: String,
        dc: i32,
    },
    StrengthDrain {
        attacker: usize,
        target: usize,
        src_pos: Pos,
        tgt_pos: Pos,
        drain: i32,
        died: bool,
    },
    Died {
        u: usize,
        pos: Pos,
        monster: bool,
    },
    Unconscious {
        u: usize,
    },
    MoveExecuted {
        u: usize,
        path: Vec<Pos>,
    },
    ActionLimitReached,
}

/// Exact `attack_name` emitted by natural20 for PC/NPC weapons.
pub fn pc_or_npc_attack_name(pc: bool, raw_name: &'static str) -> &'static str {
    if !pc {
        return raw_name;
    }
    match raw_name {
        "greatsword" => "Greatsword",
        "halberd" => "Halberd",
        "longsword" => "Longsword",
        "warhammer" => "Warhammer",
        "quarterstaff" => "Quarterstaff",
        "dagger" => "Dagger",
        "unarmed_attack" => "Unarmed Attack",
        _ => raw_name,
    }
}

/// Exact `attack_name` emitted by natural20 for spell damage / miss items.
pub fn spell_attack_name(spell: SpellId) -> &'static str {
    use SpellId::*;
    match spell {
        ChromaticOrb => "spell.chromatic_orb",
        GuidingBolt => "spell.guiding_bolt",
        MagicMissile => "spell.magic_missile",
        SpiritualWeapon => "spell.spiritual_weapon",
        Firebolt => "firebolt",
        RayOfFrost => "ray_of_frost",
        SorcerousBurst => "sorcerous_burst",
        ScorchingRay => "scorching_ray",
        AcidSplash => "acid_splash",
        BurningHands => "burning_hands",
        Thunderwave => "thunderwave",
        Shatter => "shatter",
        SacredFlame => "sacred_flame",
        Command => "command",
        Aid => "aid",
        _ => spell.key(),
    }
}

/// Format a d20 check (`DieRoll.describe()` + optional `Bless` `DieRolls` + `Arena._roll`).
pub fn fmt_d20_roll(dv: DrawVal, mode: RollMode, modifier: i32, bless: Option<i32>) -> String {
    let (face_val, roll_part) = match (mode, dv) {
        (RollMode::Normal, DrawVal::One(v)) => (v, format!("{v}")),
        (RollMode::Advantage, DrawVal::Two([a, b])) => {
            let m = a.max(b);
            let sa = if a == m { format!("{a}*") } else { format!("{a}") };
            let sb = if b == m { format!("{b}*") } else { format!("{b}") };
            (m, format!("{sa} | {sb}"))
        }
        (RollMode::Disadvantage, DrawVal::Two([a, b])) => {
            let m = a.min(b);
            let sa = if a == m { format!("{a}*") } else { format!("{a}") };
            let sb = if b == m { format!("{b}*") } else { format!("{b}") };
            (m, format!("{sa} | {sb}"))
        }
        (_, DrawVal::One(v)) => (v, format!("{v}")),
        (_, DrawVal::Two([a, _])) => (a, format!("{a}")),
    };
    let mut expr = if modifier == 0 {
        format!("d20({roll_part})")
    } else if modifier > 0 {
        format!("d20({roll_part}) + {modifier}")
    } else {
        format!("d20({roll_part}) - {}", modifier.abs())
    };
    let mut total = face_val + modifier;
    if let Some(b) = bless {
        expr.push_str(&format!(" + d4({b})"));
        total += b;
    }
    format!("{expr} = {total}")
}

/// Format `DieRoll.describe()` for a damage/healing die roll (`sides == 0` -> `"{modifier}"`).
pub fn fmt_dice_expr(sides: i32, rolls: &[i32], modifier: i32, halved: bool) -> String {
    let mut s = if sides <= 0 {
        format!("{modifier}")
    } else {
        let rolls_str = rolls.iter().map(|r| r.to_string()).collect::<Vec<_>>().join(" + ");
        if modifier == 0 {
            format!("d{sides}({rolls_str})")
        } else if modifier > 0 {
            format!("d{sides}({rolls_str}) + {modifier}")
        } else {
            format!("d{sides}({rolls_str}) - {}", modifier.abs())
        }
    };
    if halved {
        s.push_str(" / 2");
    }
    s
}

/// Format `Arena._roll(roll)` (`"{describe} = {total}"`) for a single `DieRoll`.
pub fn fmt_dice_roll(sides: i32, rolls: &[i32], modifier: i32, halved: bool, total: i32) -> String {
    format!("{} = {total}", fmt_dice_expr(sides, rolls, modifier, halved))
}

/// Format `Arena._roll(item['damage'])` for weapon/NPC attacks (with optional Berserker Frenzy `+ d6(...)`).
pub fn fmt_weapon_damage_roll(sides: i32, rolls: &[i32], modifier: i32, frenzy_rolls: Option<&[i32]>, total: i32, show_fixed: bool) -> String {
    let fixed: i32 = rolls.iter().sum();
    let mut expr = if show_fixed && sides <= 0 && fixed != 0 {
        if modifier < 0 { format!("{fixed} - {}", modifier.abs()) } else { format!("{fixed} + {modifier}") }
    } else {
        fmt_dice_expr(sides, rolls, modifier, false)
    };
    if let Some(fr) = frenzy_rolls {
        let fr_str = fr.iter().map(|r| r.to_string()).collect::<Vec<_>>().join(" + ");
        expr.push_str(&format!(" + d6({fr_str})"));
    }
    format!("{expr} = {total}")
}
