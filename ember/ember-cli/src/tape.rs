//! Strict supplied-draw rule-19 JSONL tape verifier.
//!
//! Checks every `hdr`, `start`, `draw` (who/tag/sides/mode/v + face range),
//! `turn` (strict FIFO `Event::TurnStarted` alignment), `dec` (bidirectional
//! canonical menu parity against `ember-core::legal_actions`, reaction option
//! multiplicity & order, structural score invariants, and binding to the
//! executed `act`/`endturn`), `act` (executed through `ember-core`'s own
//! legality-checked apply path), `state` (full `StateDigest` with old-engine
//! lazy-pool normalization isolated strictly to this verifier), `endturn`, and
//! terminal `end` record.
//!
//! Note on AI scoring in Phase 0: native AI heuristic scores are not ported
//! until Phase 5. In Phase 0, `scores` / `order` / `adj` are verified for
//! structural self-consistency (`scores.len() == cands.len()`, `order.len() == adj.len()`,
//! non-increasing `adj`, stable canonical tie-break on equal `adj`, and
//! `chosen == cands[order[0]]`).

use std::collections::BTreeMap;
use std::fs;
use std::path::Path;
use std::sync::Arc;

use ember_core::{
    ContentDb, CoreError, DiceSource, DrawRecord, DrawVal, EncounterSpec, Event, Fight, FightPhase,
    Metamagic, Observer, OracleSink, Placement, Pos, ReactionChoice, ReactionMode, RollMode,
    StateDigest, UnitDigest, UnitFlags, UnitId,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

const PHASE0_DEFERRED_LEDGER_JSON: &str =
    include_str!("../expected-deferred/phase0-deferred-menus.json");

#[derive(Clone, Debug, Deserialize)]
struct PinnedDeferredLedger {
    schema: u32,
    supported_spells: Vec<String>,
    deferred_spell_rules: BTreeMap<String, DeferredSpellRule>,
    tapes: Vec<PinnedTapeDeferred>,
}

#[derive(Clone, Debug, Deserialize)]
struct DeferredSpellRule {
    target_kind: String,
    range_ft: i32,
    casting_time: String,
}

#[derive(Clone, Debug, Deserialize)]
struct PinnedTapeDeferred {
    #[allow(dead_code)]
    tape: String,
    seed: u64,
    header_sha256: String,
    #[allow(dead_code)]
    reference_sha256: String,
    #[allow(dead_code)]
    approved_stop_line: usize,
    #[allow(dead_code)]
    max_verified_line: usize,
    #[allow(dead_code)]
    approved_deferred_count: usize,
    turns: Vec<PinnedTurnDeferred>,
}

#[derive(Clone, Debug, Deserialize)]
struct PinnedTurnDeferred {
    turn_decision: usize,
    jsonl_line: usize,
    actor: String,
    deferred: Vec<PinnedDeferredEntry>,
}

#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
struct PinnedDeferredEntry {
    menu_index: usize,
    key: String,
}

fn load_deferred_ledger() -> PinnedDeferredLedger {
    let ledger: PinnedDeferredLedger = serde_json::from_str(PHASE0_DEFERRED_LEDGER_JSON)
        .expect("committed phase0-deferred-menus.json must be valid JSON");
    assert_eq!(ledger.schema, 1, "unexpected phase0-deferred-menus schema");
    ledger
}

/// Verify that every Phase 0 supported spell declared in the committed ledger is
/// compiled and present in `db` (so deleting a supported spell file fails closed).
pub fn verify_supported_spells(db: &ContentDb) -> Result<(), String> {
    let ledger = load_deferred_ledger();
    for sp in &ledger.supported_spells {
        let Some(&ab_id) = db.ability_by_key.get(sp) else {
            return Err(format!(
                "missing Phase 0 supported spell ability {sp:?} required by expected-deferred ledger"
            ));
        };
        if !db.ability(ab_id).is_spell {
            return Err(format!(
                "expected Phase 0 supported ability {sp:?} to be a spell"
            ));
        }
    }
    Ok(())
}

fn header_sha256(hdr: &HeaderRec) -> String {
    let mut h = Sha256::new();
    h.update(format!("seed={}\n", hdr.seed).as_bytes());
    h.update(format!("units={}\n", hdr.units.join(",")).as_bytes());
    let pls: Vec<String> = hdr
        .placements
        .iter()
        .map(|p| format!("{}@{},{}", p.id, p.x, p.y))
        .collect();
    h.update(format!("placements={}\n", pls.join(";")).as_bytes());
    match &hdr.map {
        Some(rows) => h.update(format!("map={}\n", rows.join("|")).as_bytes()),
        None => h.update(b"map=none\n"),
    }
    format!("{:x}", h.finalize())
}

#[derive(Clone, Debug, Serialize)]
pub struct ReplayReport {
    pub tape_sha256: String,
    pub seed: u64,
    pub lines_checked: usize,
    pub decisions_checked: usize,
    pub actions_checked: usize,
    pub states_checked: usize,
    pub draws_in_range: usize,
    pub draws_consumed: usize,
    pub deferred_menu_entries_skipped: usize,
}

#[derive(Clone, Debug, Serialize)]
pub struct ReplayDiff {
    pub kind: String,
    pub first_diff_decision: usize,
    pub event_index: usize,
    pub jsonl_line: usize,
    pub seed: u64,
    pub tape_sha256: String,
    pub expected: String,
    pub got: String,
    pub preceding_state: Option<StateDigest>,
}

fn default_native_chooser() -> String {
    "native".to_string()
}

#[derive(Clone, Debug, Deserialize)]
struct ChooserRec {
    #[serde(default = "default_native_chooser")]
    heroes: String,
    #[serde(default = "default_native_chooser")]
    monsters: String,
    #[serde(default)]
    units: BTreeMap<String, String>,
}

#[derive(Clone, Debug, Deserialize)]
struct HeaderRec {
    version: u32,
    units: Vec<String>,
    placements: Vec<Placement>,
    seed: u64,
    max_rounds: i32,
    #[serde(default)]
    prefer: Vec<String>,
    #[serde(default)]
    chooser: Option<ChooserRec>,
    #[serde(default)]
    map: Option<Vec<String>>,
    #[serde(default)]
    stats: BTreeMap<String, HeaderStat>,
}

/// Mirrors `engine/src/tape.rs::ChooserHdr` + `engine/src/replay.rs::controllers_for`:
/// any team whose chooser is not `"native"` is external, and any listed unit whose
/// chooser is not `"native"` is external regardless of its team.
fn is_external_actor(hdr: &HeaderRec, fight: &Fight, who: &str) -> bool {
    let Some(c) = &hdr.chooser else {
        return false;
    };
    let unit_ext = c.units.get(who).is_some_and(|mode| mode != "native");
    let team_ext = fight
        .unit_by_key(who)
        .is_some_and(|uid| match fight.unit(uid).team {
            ember_core::Team::Heroes => c.heroes != "native",
            ember_core::Team::Monsters => c.monsters != "native",
        });
    team_ext || unit_ext
}

#[derive(Clone, Debug)]
struct PendingTurnDec {
    line_no: usize,
    who: String,
    native_chosen: String,
    /// `None` means End Turn (`"end_turn"` / `"none"`), expecting an `endturn` event.
    expected_exec: Option<String>,
    external: bool,
}

impl PendingTurnDec {
    fn expected_label(&self) -> &str {
        self.expected_exec
            .as_deref()
            .unwrap_or(if self.external { "end_turn" } else { "none" })
    }
}

#[derive(Clone, Debug, Deserialize)]
struct HeaderStat {
    ac: i16,
    mhp: i16,
    speed: i16,
    init_bonus: i16,
    abil: BTreeMap<String, i16>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(untagged)]
enum TapeDrawVal {
    One(i32),
    Two([i32; 2]),
}

impl TapeDrawVal {
    fn to_core(&self) -> DrawVal {
        match *self {
            TapeDrawVal::One(a) => DrawVal::One(a),
            TapeDrawVal::Two([a, b]) => DrawVal::Two([a, b]),
        }
    }
}

#[derive(Clone, Debug, Deserialize)]
struct DrawJson {
    who: String,
    tag: String,
    sides: i32,
    mode: String,
    v: TapeDrawVal,
}

#[derive(Clone, Debug, Deserialize)]
struct TurnJson {
    who: String,
    round: i32,
}

#[derive(Clone, Debug, Deserialize)]
struct DecExtJson {
    legal: Vec<String>,
    #[serde(default)]
    native: Option<usize>,
    exec: usize,
    #[serde(default)]
    forced: Option<String>,
}

#[derive(Clone, Debug, Deserialize)]
struct DecJson {
    ctx: String,
    who: String,
    cands: Vec<String>,
    scores: Vec<f64>,
    order: Vec<usize>,
    adj: Vec<f64>,
    chosen: String,
    #[serde(default)]
    ext: Option<DecExtJson>,
}

#[derive(Clone, Debug, Deserialize)]
struct ActJson {
    who: String,
    a: String,
}

#[derive(Clone, Debug, Deserialize)]
struct StateJson {
    round: i32,
    cur: Option<String>,
    units: Vec<UnitDigest>,
}

#[derive(Clone, Debug, Deserialize)]
struct EndTurnJson {
    who: String,
}

#[derive(Clone, Debug, Deserialize)]
struct EndJson {
    winner: Option<String>,
    round: i32,
    #[serde(default)]
    finished: bool,
    #[serde(default)]
    decisions: usize,
}

/// Tape-backed `DiceSource` that tracks exact 1-based JSONL line numbers and
/// validates die shape/range without ever panicking.
struct TapeDice {
    draws: Vec<(usize, DrawRecord)>,
    cursor: usize,
    last_error_line: Option<usize>,
}

impl TapeDice {
    fn new(draws: Vec<(usize, DrawRecord)>) -> Self {
        Self { draws, cursor: 0, last_error_line: None }
    }

    fn next_line(&self) -> usize {
        self.draws.get(self.cursor).map_or(0, |(ln, _)| *ln)
    }
}

impl DiceSource for TapeDice {
    fn draw(
        &mut self,
        who: &str,
        tag: &str,
        sides: i32,
        mode: RollMode,
    ) -> Result<DrawVal, CoreError> {
        let Some((line_no, expected)) = self.draws.get(self.cursor) else {
            self.last_error_line = None;
            return Err(CoreError::DrawMismatch {
                cursor: self.cursor,
                expected: "<end of tape draws>".into(),
                got: format!("({who}, {tag}, d{sides}, {})", mode.code()),
            });
        };
        if expected.who != who
            || expected.tag != tag
            || expected.sides != sides
            || expected.mode != mode
        {
            self.last_error_line = Some(*line_no);
            return Err(CoreError::DrawMismatch {
                cursor: self.cursor,
                expected: format!(
                    "({}, {}, d{}, {})",
                    expected.who,
                    expected.tag,
                    expected.sides,
                    expected.mode.code()
                ),
                got: format!("({who}, {tag}, d{sides}, {})", mode.code()),
            });
        }
        if let Err(e) = expected.val.validate(sides, mode, self.cursor) {
            self.last_error_line = Some(*line_no);
            return Err(e);
        }
        let val = expected.val;
        self.cursor += 1;
        Ok(val)
    }
}

/// Classifies and strictly validates whether `cand` is a well-formed, currently legal
/// Phase 1–3 deferred menu candidate for `actor`:
/// - `Ok(false)`: NOT a deferred candidate (must appear in `ember-core::legal_actions`;
///   bogus spells like `spell:wish:L9:>ghast-1` return `Ok(false)` and fail menu equality).
/// - `Ok(true)`: well-formed and currently legal Phase 1–3 deferred candidate (still
///   must match the committed per-tape/decision/actor `phase0-deferred-menus.json` ledger!).
/// - `Err(reason)`: matches a deferred spell/feature prefix on `actor`'s sheet, but is
///   malformed or illegal for `actor`'s current resources/targets/metamagic/grid bounds.
fn validate_deferred_phase0_candidate(
    fight: &Fight,
    actor: UnitId,
    cand: &str,
    spell_rules: &BTreeMap<String, DeferredSpellRule>,
) -> Result<bool, String> {
    let tmpl = fight.template_of(actor);
    let u = fight.unit(actor);

    if let Some(rest) = cand.strip_prefix("spell:") {
        let Some(caster) = &tmpl.caster else {
            return Ok(false);
        };
        let parts: Vec<&str> = rest.split(':').collect();
        let spell_key = parts[0];
        let Some(spec) = caster.deferred_spells.iter().find(|s| s.id == spell_key) else {
            return Ok(false);
        };
        let Some(rule) = spell_rules.get(spell_key) else {
            return Err(format!(
                "deferred spell {spell_key:?} is missing SRD range/target metadata in expected-deferred ledger"
            ));
        };
        if parts.len() < 3 {
            return Err(format!(
                "deferred spell {cand:?} missing level or target/point segment"
            ));
        }
        let at_level: u8 = parts[1]
            .strip_prefix('L')
            .and_then(|s| s.parse().ok())
            .ok_or_else(|| format!("deferred spell {cand:?} has invalid cast level {:?}", parts[1]))?;

        let mut free = false;
        let mut metamagic: Option<Metamagic> = None;
        let mut parsed_targets: Option<Vec<UnitId>> = None;
        let mut parsed_point: Option<Pos> = None;

        for (pi, &part) in parts[2..].iter().enumerate() {
            let is_last = pi + 1 == parts[2..].len();
            let has_target_or_point = parsed_targets.is_some() || parsed_point.is_some();
            if part == "free" {
                if free || has_target_or_point {
                    return Err(format!("deferred spell {cand:?} has misplaced/duplicate :free"));
                }
                free = true;
            } else if let Some(mm_str) = part.strip_prefix("mm=") {
                if metamagic.is_some() || has_target_or_point {
                    return Err(format!("deferred spell {cand:?} has misplaced/duplicate metamagic"));
                }
                let mm = Metamagic::from_key(mm_str).ok_or_else(|| {
                    format!("deferred spell {cand:?} uses unknown/unsupported metamagic {mm_str:?}")
                })?;
                let knows_mm = match mm {
                    Metamagic::EmpoweredSpell => caster.has_empowered,
                    Metamagic::HeightenedSpell => caster.has_heightened,
                };
                if !knows_mm {
                    return Err(format!(
                        "deferred spell {cand:?} uses metamagic {mm_str:?} not known by {}",
                        fight.unit_key(actor)
                    ));
                }
                if u.sorcery_points < mm.sorcery_cost() as u8 {
                    return Err(format!(
                        "deferred spell {cand:?} requires {} SP for {mm_str:?}, {} has {}",
                        mm.sorcery_cost(),
                        fight.unit_key(actor),
                        u.sorcery_points
                    ));
                }
                metamagic = Some(mm);
            } else if let Some(tlist) = part.strip_prefix('>') {
                if !is_last || has_target_or_point || tlist.is_empty() {
                    return Err(format!("deferred spell {cand:?} has malformed target list {part:?}"));
                }
                let mut targets = Vec::new();
                for tid in tlist.split(',') {
                    let target = fight.unit_by_key(tid).ok_or_else(|| {
                        format!("deferred spell {cand:?} references unknown target {tid:?}")
                    })?;
                    let tu = fight.unit(target);
                    if tu.flags.is_dead() {
                        return Err(format!(
                            "deferred spell {cand:?} targets dead unit {tid:?}"
                        ));
                    }
                    targets.push(target);
                }
                parsed_targets = Some(targets);
            } else if let Some(pt) = part.strip_prefix('@') {
                if !is_last || has_target_or_point {
                    return Err(format!("deferred spell {cand:?} has malformed point {part:?}"));
                }
                let (xs, ys) = pt.split_once(',').ok_or_else(|| {
                    format!("deferred spell {cand:?} has invalid point coordinates {pt:?}")
                })?;
                let x: i16 = xs.parse().map_err(|_| {
                    format!("deferred spell {cand:?} has non-integer x coord {xs:?}")
                })?;
                let y: i16 = ys.parse().map_err(|_| {
                    format!("deferred spell {cand:?} has non-integer y coord {ys:?}")
                })?;
                let pos = Pos::new(x, y);
                if !fight.grid_in_bounds(pos) {
                    return Err(format!(
                        "deferred spell {cand:?} point ({x},{y}) is out of grid bounds"
                    ));
                }
                parsed_point = Some(pos);
            } else {
                return Err(format!(
                    "deferred spell {cand:?} has unexpected segment {part:?}"
                ));
            }
        }

        // Spell-specific target kind and SRD cast-range check
        match rule.target_kind.as_str() {
            "self" => {
                let Some(targets) = &parsed_targets else {
                    return Err(format!("self-only spell {cand:?} must target caster"));
                };
                if targets.len() != 1 || targets[0] != actor {
                    return Err(format!(
                        "self-only spell {cand:?} cannot target non-self unit (caster={})",
                        fight.unit_key(actor)
                    ));
                }
            }
            "ally_or_self" => {
                let Some(targets) = &parsed_targets else {
                    return Err(format!("ally/self spell {cand:?} requires a creature target"));
                };
                if targets.len() != 1 {
                    return Err(format!(
                        "ally/self spell {cand:?} requires exactly 1 target (got {})",
                        targets.len()
                    ));
                }
                let target = targets[0];
                if !fight.allies(actor, target) {
                    return Err(format!(
                        "ally/self spell {cand:?} cannot target opposing unit {}",
                        fight.unit_key(target)
                    ));
                }
                let dist = u.pos.feet_to(fight.unit(target).pos);
                if dist > rule.range_ft {
                    return Err(format!(
                        "deferred spell {cand:?} target {} is {dist} ft away (cast range {} ft)",
                        fight.unit_key(target),
                        rule.range_ft
                    ));
                }
            }
            "creature" | "creatures" => {
                let Some(targets) = &parsed_targets else {
                    return Err(format!("creature-targeted spell {cand:?} requires creature target(s)"));
                };
                if rule.target_kind == "creature" && targets.len() != 1 {
                    return Err(format!(
                        "single-target spell {cand:?} requires 1 target (got {})",
                        targets.len()
                    ));
                }
                for &target in targets {
                    let dist = u.pos.feet_to(fight.unit(target).pos);
                    if dist > rule.range_ft {
                        return Err(format!(
                            "deferred spell {cand:?} target {} is {dist} ft away (cast range {} ft)",
                            fight.unit_key(target),
                            rule.range_ft
                        ));
                    }
                }
            }
            "point" => {
                let Some(pos) = parsed_point else {
                    return Err(format!("point-targeted spell {cand:?} requires @x,y target"));
                };
                let dist = u.pos.feet_to(pos);
                if dist > rule.range_ft {
                    return Err(format!(
                        "deferred spell {cand:?} point ({},{}) is {dist} ft away (cast range {} ft)",
                        pos.x, pos.y, rule.range_ft
                    ));
                }
            }
            other => {
                return Err(format!("unknown deferred spell target_kind {other:?} for {spell_key:?}"));
            }
        }

        // Spell-specific casting-time action economy & slot level legality
        match rule.casting_time.as_str() {
            "action" => {
                if u.action <= 0 {
                    return Err(format!(
                        "deferred action spell {cand:?} listed with no action remaining"
                    ));
                }
            }
            "bonus_action" => {
                if u.bonus <= 0 {
                    return Err(format!(
                        "deferred bonus-action spell {cand:?} listed with no bonus action remaining"
                    ));
                }
            }
            other => {
                return Err(format!("unknown casting_time {other:?} for {spell_key:?}"));
            }
        }
        if spec.base_level == 0 {
            if at_level != 0 || free {
                return Err(format!(
                    "cantrip {spell_key:?} must be cast at L0 without :free (got {cand:?})"
                ));
            }
        } else {
            if at_level < spec.base_level || (at_level as usize) >= u.slots.len() {
                return Err(format!(
                    "deferred spell {cand:?} has illegal slot level L{at_level} (base L{}, max L{})",
                    spec.base_level,
                    u.slots.len().saturating_sub(1)
                ));
            }
            if free {
                return Err(format!(
                    "deferred spell {cand:?} claims :free without an active free-cast grant"
                ));
            }
            if u.slot_spent_this_turn {
                return Err(format!(
                    "deferred leveled spell {cand:?} listed after a spell slot was already spent this turn"
                ));
            }
            if u.slots[at_level as usize] == 0 {
                return Err(format!(
                    "deferred spell {cand:?} requires L{at_level} slot, {} has 0",
                    fight.unit_key(actor)
                ));
            }
        }
        return Ok(true);
    }

    if let Some(lvl_s) = cand.strip_prefix("create_spell_slot:L") {
        if !tmpl.sorcerer {
            return Ok(false);
        }
        let lvl: usize = lvl_s
            .parse()
            .map_err(|_| format!("invalid create_spell_slot level in {cand:?}"))?;
        let sp_cost: u8 = match lvl {
            1 => 2,
            2 => 3,
            _ => return Err(format!("unsupported create_spell_slot level L{lvl} in {cand:?}")),
        };
        if u.bonus <= 0 || u.sorcery_points < sp_cost {
            return Err(format!(
                "illegal {cand:?} for {} (bonus={}, sp={}, need {sp_cost})",
                fight.unit_key(actor),
                u.bonus,
                u.sorcery_points
            ));
        }
        return Ok(true);
    }

    if let Some(lvl_s) = cand.strip_prefix("convert_spell_slot:L") {
        if !tmpl.sorcerer {
            return Ok(false);
        }
        let Some(caster) = &tmpl.caster else {
            return Ok(false);
        };
        let lvl: usize = lvl_s
            .parse()
            .map_err(|_| format!("invalid convert_spell_slot level in {cand:?}"))?;
        if !(1..=2).contains(&lvl) {
            return Err(format!("unsupported convert_spell_slot level L{lvl} in {cand:?}"));
        }
        // SRD 5.2.1 Font of Magic: converting a spell slot into Sorcery Points requires
        // no action (free), whereas creating a spell slot uses a Bonus Action.
        if u.slots[lvl] == 0 || u.sorcery_points >= caster.sorcery_points {
            return Err(format!(
                "illegal {cand:?} for {} (slots[L{lvl}]={}, sp={}/{})",
                fight.unit_key(actor),
                u.slots[lvl],
                u.sorcery_points,
                caster.sorcery_points
            ));
        }
        return Ok(true);
    }

    if let Some(target_key) = cand.strip_prefix("first_aid:>") {
        if !tmpl.pc {
            return Ok(false);
        }
        let target = fight.unit_by_key(target_key).ok_or_else(|| {
            format!("deferred {cand:?} references unknown unit {target_key:?}")
        })?;
        let tu = fight.unit(target);
        if !fight.allies(actor, target)
            || !tu.flags.is_unconscious()
            || tu.flags.contains(UnitFlags::STABLE)
            || u.pos.feet_to(tu.pos) > 5
            || u.action <= 0
        {
            return Err(format!(
                "illegal {cand:?} for {} (action={}, ally={}, uncon={}, stable={}, dist={})",
                fight.unit_key(actor),
                u.action,
                fight.allies(actor, target),
                tu.flags.is_unconscious(),
                tu.flags.contains(UnitFlags::STABLE),
                u.pos.feet_to(tu.pos)
            ));
        }
        return Ok(true);
    }

    Ok(false)
}

/// Compare `expected` (from legacy rule-18 tape) against `got` (`ember-core::state_digest`),
/// normalizing ONLY the legacy engine's lazy-pool omission quirk (where an unspent
/// `{"pool": 1}` map was omitted until the first `prepared_spells()` call).
fn digests_match_with_lazy_pool_norm(expected: &StateDigest, got: &StateDigest) -> bool {
    if expected.round != got.round
        || expected.cur != got.cur
        || expected.units.len() != got.units.len()
    {
        return false;
    }
    for (e, g) in expected.units.iter().zip(&got.units) {
        if e.id != g.id
            || e.pos != g.pos
            || e.hp != g.hp
            || e.mhp != g.mhp
            || e.thp != g.thp
            || e.st != g.st
            || e.fx != g.fx
            || e.bst != g.bst
            || e.res != g.res
            || e.ds != g.ds
            || e.strength != g.strength
            || e.sl != g.sl
            || e.conc != g.conc
            || e.cd != g.cd
            || e.sp != g.sp
            || e.isc != g.isc
            || e.isu != g.isu
            || e.sw != g.sw
            || e.action_surge != g.action_surge
            || e.asu != g.asu
            || e.rg != g.rg
            || e.cv != g.cv
        {
            return false;
        }
        let pools_ok = match (&e.pools, &g.pools) {
            (a, b) if a == b => true,
            (None, Some(gm)) if !gm.is_empty() && gm.values().all(|&v| v == 1) => true,
            _ => false,
        };
        if !pools_ok {
            return false;
        }
    }
    true
}

pub fn verify_tape(
    db: Arc<ContentDb>,
    tape_path: &Path,
    stop_line: Option<usize>,
) -> Result<ReplayReport, ReplayDiff> {
    let raw_bytes = fs::read(tape_path).map_err(|e| ReplayDiff {
        kind: "io".into(),
        first_diff_decision: 0,
        event_index: 0,
        jsonl_line: 0,
        seed: 0,
        tape_sha256: String::new(),
        expected: "readable tape file".into(),
        got: e.to_string(),
        preceding_state: None,
    })?;
    let mut hasher = Sha256::new();
    hasher.update(&raw_bytes);
    let tape_sha256 = format!("{:x}", hasher.finalize());

    let text = String::from_utf8(raw_bytes).map_err(|e| ReplayDiff {
        kind: "utf8".into(),
        first_diff_decision: 0,
        event_index: 0,
        jsonl_line: 0,
        seed: 0,
        tape_sha256: tape_sha256.clone(),
        expected: "valid UTF-8 JSONL".into(),
        got: e.to_string(),
        preceding_state: None,
    })?;

    let mut events: Vec<(usize, String, serde_json::Value)> = Vec::new();
    let mut tape_draws: Vec<(usize, DrawRecord)> = Vec::new();
    for (idx, line) in text.lines().enumerate() {
        let line_no = idx + 1;
        if let Some(limit) = stop_line {
            if line_no > limit {
                break;
            }
        }
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        let val: serde_json::Value = serde_json::from_str(trimmed).map_err(|e| ReplayDiff {
            kind: "json_parse".into(),
            first_diff_decision: 0,
            event_index: events.len(),
            jsonl_line: line_no,
            seed: 0,
            tape_sha256: tape_sha256.clone(),
            expected: "valid JSON object".into(),
            got: e.to_string(),
            preceding_state: None,
        })?;
        let tag = val
            .get("t")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        if tag == "draw" {
            let dj: DrawJson = serde_json::from_value(val.clone()).map_err(|e| ReplayDiff {
                kind: "draw_parse".into(),
                first_diff_decision: 0,
                event_index: events.len(),
                jsonl_line: line_no,
                seed: 0,
                tape_sha256: tape_sha256.clone(),
                expected: "valid draw record".into(),
                got: e.to_string(),
                preceding_state: None,
            })?;
            let mode = RollMode::from_code(&dj.mode).ok_or_else(|| ReplayDiff {
                kind: "draw_mode".into(),
                first_diff_decision: 0,
                event_index: events.len(),
                jsonl_line: line_no,
                seed: 0,
                tape_sha256: tape_sha256.clone(),
                expected: "mode in {n, a, d}".into(),
                got: dj.mode.clone(),
                preceding_state: None,
            })?;
            tape_draws.push((
                line_no,
                DrawRecord {
                    who: dj.who,
                    tag: dj.tag,
                    sides: dj.sides,
                    mode,
                    val: dj.v.to_core(),
                },
            ));
        }
        events.push((line_no, tag, val));
    }

    if events.is_empty() || events[0].1 != "hdr" {
        return Err(ReplayDiff {
            kind: "missing_header".into(),
            first_diff_decision: 0,
            event_index: 0,
            jsonl_line: 1,
            seed: 0,
            tape_sha256,
            expected: "t == hdr on line 1".into(),
            got: events.first().map_or("empty".into(), |e| e.1.clone()),
            preceding_state: None,
        });
    }

    let hdr: HeaderRec = serde_json::from_value(events[0].2.clone()).map_err(|e| ReplayDiff {
        kind: "hdr_parse".into(),
        first_diff_decision: 0,
        event_index: 0,
        jsonl_line: events[0].0,
        seed: 0,
        tape_sha256: tape_sha256.clone(),
        expected: "valid rule-19 header".into(),
        got: e.to_string(),
        preceding_state: None,
    })?;
    if hdr.version != 19 {
        return Err(ReplayDiff {
            kind: "version".into(),
            first_diff_decision: 0,
            event_index: 0,
            jsonl_line: events[0].0,
            seed: hdr.seed,
            tape_sha256,
            expected: "version == 19".into(),
            got: format!("version == {}", hdr.version),
            preceding_state: None,
        });
    }
    for pref in &hdr.prefer {
        let Some((lhs, rhs)) = pref.split_once(':') else {
            return Err(ReplayDiff {
                kind: "hdr_prefer_invalid".into(),
                first_diff_decision: 0,
                event_index: 0,
                jsonl_line: events[0].0,
                seed: hdr.seed,
                tape_sha256,
                expected: "prefer entries of form <who>:<rule>".into(),
                got: pref.clone(),
                preceding_state: None,
            });
        };
        if lhs.is_empty() || rhs.is_empty() {
            return Err(ReplayDiff {
                kind: "hdr_prefer_invalid".into(),
                first_diff_decision: 0,
                event_index: 0,
                jsonl_line: events[0].0,
                seed: hdr.seed,
                tape_sha256,
                expected: "non-empty <who>:<rule>".into(),
                got: pref.clone(),
                preceding_state: None,
            });
        }
    }

    verify_supported_spells(&db).map_err(|msg| ReplayDiff {
        kind: "missing_supported_spell".into(),
        first_diff_decision: 0,
        event_index: 0,
        jsonl_line: 1,
        seed: hdr.seed,
        tape_sha256: tape_sha256.clone(),
        expected: "all Phase 0 supported spells compiled in content db".into(),
        got: msg,
        preceding_state: None,
    })?;
    let ledger = load_deferred_ledger();
    let hdr_hash = header_sha256(&hdr);
    let pinned_tape = ledger
        .tapes
        .iter()
        .find(|t| t.seed == hdr.seed && t.header_sha256 == hdr_hash);

    let spec = EncounterSpec {
        units: hdr.units.clone(),
        placements: hdr.placements.clone(),
        map_rows: hdr.map.clone(),
        max_rounds: hdr.max_rounds,
    };
    let mut fight = Fight::new(db, &spec, hdr.seed, hdr.seed as u128).map_err(|e| ReplayDiff {
        kind: "setup".into(),
        first_diff_decision: 0,
        event_index: 0,
        jsonl_line: events[0].0,
        seed: hdr.seed,
        tape_sha256: tape_sha256.clone(),
        expected: "valid encounter setup".into(),
        got: e.to_string(),
        preceding_state: None,
    })?;
    fight.set_reaction_mode(ReactionMode::Interactive);

    if let Some(c) = &hdr.chooser {
        for uid in c.units.keys() {
            if fight.unit_by_key(uid).is_none() {
                return Err(ReplayDiff {
                    kind: "hdr_chooser_unknown_unit".into(),
                    first_diff_decision: 0,
                    event_index: 0,
                    jsonl_line: 1,
                    seed: hdr.seed,
                    tape_sha256,
                    expected: format!("chooser unit {uid:?} present in hdr.units"),
                    got: format!("unknown chooser unit {uid:?}"),
                    preceding_state: None,
                });
            }
        }
    }

    for (uid, st) in &hdr.stats {
        let Some(u) = fight.unit_by_key(uid) else {
            return Err(ReplayDiff {
                kind: "hdr_stats".into(),
                first_diff_decision: 0,
                event_index: 0,
                jsonl_line: 1,
                seed: hdr.seed,
                tape_sha256,
                expected: format!("known unit {uid}"),
                got: "missing".into(),
                preceding_state: None,
            });
        };
        let tmpl = fight.template_of(u);
        let abil_match = st.abil.get("str") == Some(&tmpl.abilities[0])
            && st.abil.get("dex") == Some(&tmpl.abilities[1])
            && st.abil.get("con") == Some(&tmpl.abilities[2])
            && st.abil.get("int") == Some(&tmpl.abilities[3])
            && st.abil.get("wis") == Some(&tmpl.abilities[4])
            && st.abil.get("cha") == Some(&tmpl.abilities[5]);
        if tmpl.ac != st.ac
            || tmpl.max_hp != st.mhp
            || tmpl.speed != st.speed
            || tmpl.init_bonus != st.init_bonus
            || !abil_match
        {
            return Err(ReplayDiff {
                kind: "hdr_stats_mismatch".into(),
                first_diff_decision: 0,
                event_index: 0,
                jsonl_line: 1,
                seed: hdr.seed,
                tape_sha256,
                expected: format!(
                    "{uid}: ac={} mhp={} speed={} init={} abil={:?}",
                    st.ac, st.mhp, st.speed, st.init_bonus, st.abil
                ),
                got: format!(
                    "{uid}: ac={} mhp={} speed={} init={} abil={:?}",
                    tmpl.ac, tmpl.max_hp, tmpl.speed, tmpl.init_bonus, tmpl.abilities
                ),
                preceding_state: None,
            });
        }
    }

    let draws_in_range = tape_draws.len();
    let mut dice = TapeDice::new(tape_draws);
    let mut sink = OracleSink::default();
    let mut last_state: Option<StateDigest> = None;
    let mut decisions_checked = 0usize;
    let mut turn_decisions_checked = 0usize;
    let mut actions_checked = 0usize;
    let mut states_checked = 0usize;
    let mut draws_seen_in_stream = 0usize;
    let mut deferred_menu_entries_skipped = 0usize;
    let mut turn_ev_cursor = 0usize;
    let mut pending_turn_dec: Option<PendingTurnDec> = None;
    let mut last_turn_actor: Option<String> = None;
    let mut closing_endturn_seen = false;
    let mut seen_start = false;
    let mut seen_end = false;
    let last_line_seen = events.last().map_or(0, |(ln, _, _)| *ln);

    let make_diff = |kind: &str,
                     dec_idx: usize,
                     ev_idx: usize,
                     line_no: usize,
                     expected: String,
                     got: String,
                     prev: Option<StateDigest>| ReplayDiff {
        kind: kind.into(),
        first_diff_decision: dec_idx,
        event_index: ev_idx,
        jsonl_line: line_no,
        seed: hdr.seed,
        tape_sha256: tape_sha256.clone(),
        expected,
        got,
        preceding_state: prev,
    };

    for (ev_idx, (line_no, tag, val)) in events.iter().enumerate().skip(1) {
        let line_no = *line_no;
        if seen_end {
            return Err(make_diff(
                "trailing_event_after_end",
                decisions_checked,
                ev_idx,
                line_no,
                "EOF after end record".into(),
                format!("unexpected event {tag:?} after end"),
                last_state,
            ));
        }
        match tag.as_str() {
            "draw" => {
                draws_seen_in_stream += 1;
                if dice.cursor < draws_seen_in_stream {
                    return Err(make_diff(
                        "unconsumed_draw",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        format!("draw #{draws_seen_in_stream} consumed by engine"),
                        format!("engine only consumed {} draws so far", dice.cursor),
                        last_state,
                    ));
                }
            }
            "start" => {
                if seen_start {
                    return Err(make_diff(
                        "duplicate_start",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "single start event".into(),
                        "duplicate start event".into(),
                        last_state,
                    ));
                }
                seen_start = true;
                fight.start_with_dice(&mut dice, &mut sink).map_err(|e| {
                    let err_ln = dice.last_error_line.unwrap_or(line_no);
                    make_diff(
                        "start_error",
                        decisions_checked,
                        ev_idx,
                        err_ln,
                        "clean start_with_dice".into(),
                        e.to_string(),
                        last_state.clone(),
                    )
                })?;
            }
            "turn" => {
                if let Some(pending) = &pending_turn_dec {
                    return Err(make_diff(
                        "unexecuted_turn_decision",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "no pending turn decision across turn boundary".into(),
                        format!(
                            "decision at line {} ({} -> {:?}) was never executed",
                            pending.line_no,
                            pending.who,
                            pending.expected_label()
                        ),
                        last_state,
                    ));
                }
                if fight.finished() {
                    return Err(make_diff(
                        "turn_after_combat_ended",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "no turn events after combat ends".into(),
                        val.to_string(),
                        last_state,
                    ));
                }
                let tj: TurnJson = serde_json::from_value(val.clone()).map_err(|e| {
                    make_diff(
                        "turn_parse",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "valid turn event".into(),
                        e.to_string(),
                        last_state.clone(),
                    )
                })?;
                // Strictly consume the next FIFO `Event::TurnStarted` emitted by the core!
                let mut matched = None;
                while turn_ev_cursor < sink.events.len() {
                    let ev = &sink.events[turn_ev_cursor];
                    turn_ev_cursor += 1;
                    if let Event::TurnStarted { unit, round } = ev {
                        matched = Some((fight.unit_key(*unit).to_string(), *round));
                        break;
                    }
                }
                match matched {
                    Some((who, round)) if who == tj.who && round == tj.round => {
                        last_turn_actor = Some(who);
                    }
                    Some((who, round)) => {
                        return Err(make_diff(
                            "turn_mismatch",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            format!("turn who={} round={}", tj.who, tj.round),
                            format!("next core TurnStarted who={who} round={round}"),
                            last_state,
                        ));
                    }
                    None => {
                        return Err(make_diff(
                            "unexpected_turn_event",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            format!("turn who={} round={}", tj.who, tj.round),
                            "core emitted no matching TurnStarted event".into(),
                            last_state,
                        ));
                    }
                }
            }
            "state" => {
                if dice.cursor != draws_seen_in_stream {
                    return Err(make_diff(
                        "draw_count_mismatch",
                        decisions_checked,
                        ev_idx,
                        dice.next_line().max(line_no),
                        format!("{draws_seen_in_stream} draws before state"),
                        format!("{} draws consumed by engine", dice.cursor),
                        last_state,
                    ));
                }
                let sj: StateJson = serde_json::from_value(val.clone()).map_err(|e| {
                    make_diff(
                        "state_parse",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "valid state record".into(),
                        e.to_string(),
                        last_state.clone(),
                    )
                })?;
                let expected = StateDigest {
                    round: sj.round,
                    cur: sj.cur,
                    units: sj.units,
                };
                let got = fight.state_digest();
                if !digests_match_with_lazy_pool_norm(&expected, &got) {
                    return Err(make_diff(
                        "state_mismatch",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        serde_json::to_string(&expected).unwrap_or_default(),
                        serde_json::to_string(&got).unwrap_or_default(),
                        last_state,
                    ));
                }
                last_state = Some(got);
                states_checked += 1;
            }
            "dec" => {
                let dj: DecJson = serde_json::from_value(val.clone()).map_err(|e| {
                    make_diff(
                        "dec_parse",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "valid dec record".into(),
                        e.to_string(),
                        last_state.clone(),
                    )
                })?;
                decisions_checked += 1;

                let validate_scores_and_order = |dj: &DecJson| -> Result<(), ReplayDiff> {
                    if dj.scores.len() != dj.cands.len() {
                        return Err(make_diff(
                            "dec_scores_len",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            format!("scores.len() == cands.len() ({})", dj.cands.len()),
                            format!("scores.len() == {}", dj.scores.len()),
                            last_state.clone(),
                        ));
                    }
                    // Structural score/order validation (native AI scoring is Phase 5)
                    if dj.order.len() != dj.adj.len() {
                        return Err(make_diff(
                            "dec_order_len",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            format!("order.len() == adj.len() ({})", dj.adj.len()),
                            format!("order.len() == {}", dj.order.len()),
                            last_state.clone(),
                        ));
                    }
                    let mut seen_idx = vec![false; dj.cands.len()];
                    for w in 0..dj.order.len() {
                        let oi = dj.order[w];
                        if oi >= dj.cands.len() {
                            return Err(make_diff(
                                "dec_order_oob",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("order index < {}", dj.cands.len()),
                                format!("order[{w}] = {oi}"),
                                last_state.clone(),
                            ));
                        }
                        if seen_idx[oi] {
                            return Err(make_diff(
                                "dec_order_dup",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                "unique candidate indices in order".into(),
                                format!("duplicate candidate index {oi}"),
                                last_state.clone(),
                            ));
                        }
                        seen_idx[oi] = true;
                        if w > 0 {
                            let prev_adj = dj.adj[w - 1];
                            let cur_adj = dj.adj[w];
                            let prev_idx = dj.order[w - 1];
                            if cur_adj > prev_adj {
                                return Err(make_diff(
                                    "dec_order_not_descending",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    format!("adj[{w}] <= adj[{}] ({prev_adj})", w - 1),
                                    format!("adj[{w}] = {cur_adj}"),
                                    last_state.clone(),
                                ));
                            }
                            if (cur_adj - prev_adj).abs() == 0.0 && oi < prev_idx {
                                return Err(make_diff(
                                    "dec_tie_order_violation",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    format!(
                                        "stable canonical tie-break: order[{}] ({prev_idx}) < order[{w}] ({oi}) for tied adj={cur_adj}",
                                        w - 1
                                    ),
                                    format!(
                                        "swapped tied candidates [{prev_idx}, {oi}] ({:?}, {:?}) at adj={cur_adj}",
                                        dj.cands[prev_idx], dj.cands[oi]
                                    ),
                                    last_state.clone(),
                                ));
                            }
                        }
                    }
                    if !dj.order.is_empty() && dj.chosen != "none" && dj.chosen != "stand" {
                        let top_cand = &dj.cands[dj.order[0]];
                        if top_cand != &dj.chosen {
                            return Err(make_diff(
                                "dec_chosen_mismatch",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("chosen == cands[order[0]] ({top_cand:?})"),
                                format!("chosen == {:?}", dj.chosen),
                                last_state.clone(),
                            ));
                        }
                    }
                    Ok(())
                };

                match dj.ctx.as_str() {
                    "reaction" => {
                        validate_scores_and_order(&dj)?;
                        let FightPhase::AwaitingReaction { prompt_id, reactor } = fight.phase()
                        else {
                            return Err(make_diff(
                                "reaction_phase_mismatch",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("AwaitingReaction for {}", dj.who),
                                format!("{:?}", fight.phase()),
                                last_state,
                            ));
                        };
                        if fight.unit_key(reactor) != dj.who {
                            return Err(make_diff(
                                "reaction_who_mismatch",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("reactor == {}", dj.who),
                                format!("reactor == {}", fight.unit_key(reactor)),
                                last_state,
                            ));
                        }
                        let frame = fight.pending_interrupt().expect("pending frame");
                        let core_opts: Vec<String> = frame
                            .options
                            .iter()
                            .map(|opt| match opt {
                                ember_core::ReactionOption::OpportunityAttack {
                                    attack_idx,
                                    target,
                                } => fight.describe_payload(
                                    reactor,
                                    &ember_core::ActionPayload::Attack {
                                        attack_idx: *attack_idx,
                                        target: *target,
                                        reaction: true,
                                    },
                                ),
                                ember_core::ReactionOption::Decline => "none".into(),
                            })
                            .collect();
                        if core_opts != dj.cands {
                            return Err(make_diff(
                                "reaction_cands_mismatch",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("{:?}", dj.cands),
                                format!("{core_opts:?}"),
                                last_state,
                            ));
                        }
                        let choice_index = if dj.chosen == "none" {
                            None
                        } else {
                            let idx = core_opts.iter().position(|s| s == &dj.chosen).ok_or_else(
                                || {
                                    make_diff(
                                        "reaction_chosen_missing",
                                        decisions_checked,
                                        ev_idx,
                                        line_no,
                                        format!("option {:?}", dj.chosen),
                                        format!("core options {core_opts:?}"),
                                        last_state.clone(),
                                    )
                                },
                            )?;
                            Some(idx as u16)
                        };
                        fight
                            .respond_reaction_with_dice(
                                ReactionChoice { prompt_id, choice_index },
                                &mut dice,
                                &mut sink,
                            )
                            .map_err(|e| {
                                let err_ln = dice.last_error_line.unwrap_or(line_no);
                                make_diff(
                                    "reaction_exec_error",
                                    decisions_checked,
                                    ev_idx,
                                    err_ln,
                                    "clean reaction resolution".into(),
                                    e.to_string(),
                                    last_state.clone(),
                                )
                            })?;
                    }
                    "select_reaction" => {
                        return Err(make_diff(
                            "unsupported_reaction_window",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            "Phase 0 stop before select_reaction (Shield/Counterspell deferred to Phase 2)".into(),
                            format!("select_reaction for {} chosen={:?}", dj.who, dj.chosen),
                            last_state,
                        ));
                    }
                    "turn" => {
                        turn_decisions_checked += 1;
                        if let Some(pending) = &pending_turn_dec {
                            return Err(make_diff(
                                "unexecuted_turn_decision",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                "previous turn decision executed before next dec".into(),
                                format!(
                                    "unexecuted decision at line {} ({} -> {:?})",
                                    pending.line_no,
                                    pending.who,
                                    pending.expected_label()
                                ),
                                last_state,
                            ));
                        }
                        let external = is_external_actor(&hdr, &fight, &dj.who);
                        if !external && dj.ext.is_some() {
                            return Err(make_diff(
                                "unexpected_ext_decision",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("native decision without ext block for {}", dj.who),
                                "dec contains ext block for native actor".into(),
                                last_state,
                            ));
                        }
                        if external && dj.ext.is_none() {
                            return Err(make_diff(
                                "missing_ext_decision",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("external decision with ext block for {}", dj.who),
                                "dec is missing ext block for external actor".into(),
                                last_state,
                            ));
                        }
                        let FightPhase::AwaitingAction(cur) = fight.phase() else {
                            return Err(make_diff(
                                "turn_phase_mismatch",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("AwaitingAction({})", dj.who),
                                format!("{:?}", fight.phase()),
                                last_state,
                            ));
                        };
                        if fight.unit_key(cur) != dj.who {
                            return Err(make_diff(
                                "dec_who_mismatch",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("who == {}", dj.who),
                                format!("cur == {}", fight.unit_key(cur)),
                                last_state,
                            ));
                        }
                        let core_all = fight.legal_actions(Observer::Full);
                        let core_can_stand = core_all.iter().any(|a| a.action_key == "stand");
                        let core_legal: Vec<String> = core_all
                            .into_iter()
                            .filter(|a| a.action_key != "end_turn" && a.action_key != "stand")
                            .map(|a| a.action_key)
                            .collect();

                        let expected_deferred: &[PinnedDeferredEntry] = pinned_tape
                            .and_then(|pt| {
                                pt.turns.iter().find(|t| {
                                    t.turn_decision == turn_decisions_checked
                                        && t.jsonl_line == line_no
                                        && t.actor == dj.who
                                })
                            })
                            .map_or(&[], |t| t.deferred.as_slice());

                        if dj.cands.is_empty() {
                            if !expected_deferred.is_empty() {
                                return Err(make_diff(
                                    "deferred_menu_mismatch",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    format!(
                                        "{} pinned deferred entries for {} at turn_decision={turn_decisions_checked}",
                                        expected_deferred.len(),
                                        dj.who
                                    ),
                                    "empty cands=[]".into(),
                                    last_state,
                                ));
                            }
                            if dj.chosen == "stand" {
                                if !fight.unit(cur).flags.contains(UnitFlags::PRONE)
                                    || !core_can_stand
                                {
                                    return Err(make_diff(
                                        "illegal_forced_stand",
                                        decisions_checked,
                                        ev_idx,
                                        line_no,
                                        "prone unit with enough movement to stand".into(),
                                        format!(
                                            "{} prone={} can_stand={core_can_stand}",
                                            dj.who,
                                            fight.unit(cur).flags.contains(UnitFlags::PRONE)
                                        ),
                                        last_state,
                                    ));
                                }
                            } else if dj.chosen == "none" {
                                let scores_off_external = external
                                    && dj.ext.as_ref().is_some_and(|x| {
                                        x.native.is_none() && x.forced.is_none()
                                    });
                                if !scores_off_external && (!core_legal.is_empty() || core_can_stand)
                                {
                                    return Err(make_diff(
                                        "empty_turn_cands",
                                        decisions_checked,
                                        ev_idx,
                                        line_no,
                                        format!(
                                            "non-empty candidate menu (core has {} legal actions, can_stand={core_can_stand})",
                                            core_legal.len()
                                        ),
                                        "cands=[] chosen=\"none\"".into(),
                                        last_state,
                                    ));
                                }
                            } else {
                                return Err(make_diff(
                                    "empty_cands_chosen",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    "chosen in {stand, none} when cands is empty".into(),
                                    format!("chosen={:?}", dj.chosen),
                                    last_state,
                                ));
                            }
                        } else {
                            if dj.chosen != "none" && !dj.cands.contains(&dj.chosen) {
                                return Err(make_diff(
                                    "chosen_not_in_cands",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    format!("chosen {:?} present in cands", dj.chosen),
                                    format!("cands={:?}", dj.cands),
                                    last_state,
                                ));
                            }

                            // STRICT BIDIRECTIONAL EQUALITY + PINNED DEFERRED LEDGER:
                            // 1. Validate every deferred candidate is well-formed & currently legal.
                            // 2. Require exact (menu_index, key) equality against the committed
                            //    per-tape/decision/actor `phase0-deferred-menus.json` ledger
                            //    (empty [] for all unpinned turns and all pure-martial tapes).
                            // 3. Require every remaining candidate to match `core_legal` identically.
                            let mut tape_in_scope: Vec<String> = Vec::with_capacity(dj.cands.len());
                            let mut actual_deferred: Vec<PinnedDeferredEntry> = Vec::new();
                            for (ci, cand) in dj.cands.iter().enumerate() {
                                match validate_deferred_phase0_candidate(
                                    &fight,
                                    cur,
                                    cand,
                                    &ledger.deferred_spell_rules,
                                ) {
                                    Ok(true) => {
                                        if dj.chosen == *cand {
                                            return Err(make_diff(
                                                "deferred_action_chosen",
                                                decisions_checked,
                                                ev_idx,
                                                line_no,
                                                "Phase 0 in-scope chosen action".into(),
                                                format!("deferred candidate {:?} chosen", dj.chosen),
                                                last_state,
                                            ));
                                        }
                                        actual_deferred.push(PinnedDeferredEntry {
                                            menu_index: ci,
                                            key: cand.clone(),
                                        });
                                        deferred_menu_entries_skipped += 1;
                                    }
                                    Ok(false) => tape_in_scope.push(cand.clone()),
                                    Err(reason) => {
                                        return Err(make_diff(
                                            "malformed_deferred_candidate",
                                            decisions_checked,
                                            ev_idx,
                                            line_no,
                                            "well-formed, currently legal Phase 1-3 deferred candidate".into(),
                                            reason,
                                            last_state,
                                        ));
                                    }
                                }
                            }
                            if actual_deferred.as_slice() != expected_deferred {
                                let extra: Vec<&PinnedDeferredEntry> = actual_deferred
                                    .iter()
                                    .filter(|e| !expected_deferred.contains(e))
                                    .collect();
                                let missing: Vec<&PinnedDeferredEntry> = expected_deferred
                                    .iter()
                                    .filter(|e| !actual_deferred.contains(e))
                                    .collect();
                                return Err(make_diff(
                                    "deferred_menu_mismatch",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    format!(
                                        "pinned deferred menu match for {} turn_decision={turn_decisions_checked} (expected {}, missing={missing:?}, extra={extra:?})",
                                        dj.who,
                                        expected_deferred.len()
                                    ),
                                    format!(
                                        "actual_deferred({})={actual_deferred:?} vs expected_deferred({})={expected_deferred:?}",
                                        actual_deferred.len(),
                                        expected_deferred.len()
                                    ),
                                    last_state,
                                ));
                            }
                            if tape_in_scope != core_legal {
                                let extra_in_tape: Vec<&String> = tape_in_scope
                                    .iter()
                                    .filter(|c| !core_legal.contains(c))
                                    .collect();
                                let missing_in_tape: Vec<&String> = core_legal
                                    .iter()
                                    .filter(|c| !tape_in_scope.contains(c))
                                    .collect();
                                return Err(make_diff(
                                    "turn_menu_mismatch",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    format!(
                                        "exact bidirectional menu match (extra_in_tape={extra_in_tape:?}, missing_in_tape={missing_in_tape:?})"
                                    ),
                                    format!(
                                        "tape_in_scope({}): {tape_in_scope:?} vs core_legal({}): {core_legal:?}",
                                        tape_in_scope.len(),
                                        core_legal.len()
                                    ),
                                    last_state,
                                ));
                            }
                        }
                        validate_scores_and_order(&dj)?;
                        let expected_exec = if let Some(ext) = &dj.ext {
                            if ext.legal.is_empty() {
                                return Err(make_diff(
                                    "ext_legal_empty",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    "non-empty ext.legal".into(),
                                    "ext.legal=[]".into(),
                                    last_state,
                                ));
                            }
                            if ext.exec >= ext.legal.len() {
                                return Err(make_diff(
                                    "ext_exec_out_of_bounds",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    format!("ext.exec < ext.legal.len() ({})", ext.legal.len()),
                                    format!("ext.exec={}", ext.exec),
                                    last_state,
                                ));
                            }
                            if !dj.cands.is_empty() {
                                // `engine/src/env.rs::external_decision`: `ext.legal` starts with
                                // deduplicated `cands` in order, optionally followed by crossing
                                // moves and `"end_turn"`.
                                let mut dedup_cands: Vec<&str> = Vec::with_capacity(dj.cands.len());
                                for c in &dj.cands {
                                    if dedup_cands.last().copied() != Some(c.as_str()) {
                                        dedup_cands.push(c.as_str());
                                    }
                                }
                                let prefix_ok = ext.legal.len() >= dedup_cands.len()
                                    && ext.legal[..dedup_cands.len()]
                                        .iter()
                                        .map(String::as_str)
                                        .eq(dedup_cands.iter().copied());
                                let tail = if prefix_ok {
                                    &ext.legal[dedup_cands.len()..]
                                } else {
                                    &[]
                                };
                                let tail_ok = prefix_ok
                                    && tail.iter().enumerate().all(|(i, k)| {
                                        (i + 1 == tail.len() && k == "end_turn")
                                            || k.starts_with("move:")
                                    });
                                if !tail_ok {
                                    return Err(make_diff(
                                        "ext_legal_mismatch",
                                        decisions_checked,
                                        ev_idx,
                                        line_no,
                                        format!(
                                            "ext.legal starting with deduplicated cands ({}) + optional crossing moves + end_turn",
                                            dedup_cands.len()
                                        ),
                                        format!("ext.legal={:?}", ext.legal),
                                        last_state,
                                    ));
                                }
                            } else if ext.forced.as_deref() == Some("end_turn")
                                && (ext.legal.len() != 1 || ext.legal[0] != "end_turn")
                            {
                                return Err(make_diff(
                                    "ext_legal_mismatch",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    "ext.legal == [\"end_turn\"] for forced end_turn".into(),
                                    format!("ext.legal={:?}", ext.legal),
                                    last_state,
                                ));
                            }
                            if let Some(native_idx) = ext.native {
                                let Some(native_key) = ext.legal.get(native_idx) else {
                                    return Err(make_diff(
                                        "ext_native_out_of_bounds",
                                        decisions_checked,
                                        ev_idx,
                                        line_no,
                                        format!(
                                            "ext.native < ext.legal.len() ({})",
                                            ext.legal.len()
                                        ),
                                        format!("ext.native={native_idx}"),
                                        last_state,
                                    ));
                                };
                                let expected_chosen = if native_key == "end_turn" {
                                    "none"
                                } else {
                                    native_key.as_str()
                                };
                                if dj.chosen != expected_chosen {
                                    return Err(make_diff(
                                        "ext_native_mismatch",
                                        decisions_checked,
                                        ev_idx,
                                        line_no,
                                        format!(
                                            "dec.chosen matching ext.legal[ext.native={native_idx}] ({expected_chosen:?})"
                                        ),
                                        format!("dec.chosen={:?}", dj.chosen),
                                        last_state,
                                    ));
                                }
                            }
                            let exec_key = ext.legal[ext.exec].as_str();
                            if exec_key == "end_turn" {
                                None
                            } else {
                                match validate_deferred_phase0_candidate(
                                    &fight,
                                    cur,
                                    exec_key,
                                    &ledger.deferred_spell_rules,
                                ) {
                                    Ok(true) => {
                                        return Err(make_diff(
                                            "deferred_action_chosen",
                                            decisions_checked,
                                            ev_idx,
                                            line_no,
                                            "Phase 0 in-scope external executed action".into(),
                                            format!(
                                                "deferred candidate {exec_key:?} selected by ext.exec={}",
                                                ext.exec
                                            ),
                                            last_state,
                                        ));
                                    }
                                    Ok(false) => {}
                                    Err(reason) => {
                                        return Err(make_diff(
                                            "malformed_deferred_candidate",
                                            decisions_checked,
                                            ev_idx,
                                            line_no,
                                            "valid external executed action".into(),
                                            reason,
                                            last_state,
                                        ));
                                    }
                                }
                                Some(exec_key.to_string())
                            }
                        } else if dj.chosen == "none" {
                            None
                        } else {
                            Some(dj.chosen.clone())
                        };
                        pending_turn_dec = Some(PendingTurnDec {
                            line_no,
                            who: dj.who,
                            native_chosen: dj.chosen,
                            expected_exec,
                            external,
                        });
                    }
                    other => {
                        return Err(make_diff(
                            "unknown_dec_ctx",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            "dec.ctx in {\"turn\", \"reaction\", \"select_reaction\"}".into(),
                            format!("dec.ctx == {other:?}"),
                            last_state,
                        ));
                    }
                }
            }
            "act" => {
                let aj: ActJson = serde_json::from_value(val.clone()).map_err(|e| {
                    make_diff(
                        "act_parse",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "valid act record".into(),
                        e.to_string(),
                        last_state.clone(),
                    )
                })?;
                let Some(pending) = pending_turn_dec.take() else {
                    return Err(make_diff(
                        "missing_decision_for_action",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        format!("preceding turn dec choosing {:?}", aj.a),
                        format!("act {} -> {:?} with no preceding turn dec", aj.who, aj.a),
                        last_state,
                    ));
                };
                if pending.who != aj.who || pending.expected_exec.as_deref() != Some(aj.a.as_str()) {
                    let expected_desc = if pending.external {
                        format!(
                            "act matching external dec at line {}: {} -> {:?} (native recommendation {:?})",
                            pending.line_no,
                            pending.who,
                            pending.expected_label(),
                            pending.native_chosen
                        )
                    } else {
                        format!(
                            "act matching dec at line {}: {} -> {:?}",
                            pending.line_no,
                            pending.who,
                            pending.expected_label()
                        )
                    };
                    return Err(make_diff(
                        "decision_action_mismatch",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        expected_desc,
                        format!("act {} -> {:?}", aj.who, aj.a),
                        last_state,
                    ));
                }
                let actor = fight.unit_by_key(&aj.who).ok_or_else(|| {
                    make_diff(
                        "act_unknown_unit",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        format!("known unit {}", aj.who),
                        "unknown".into(),
                        last_state.clone(),
                    )
                })?;
                let payload = fight.parse_action_key(actor, &aj.a).map_err(|e| {
                    make_diff(
                        "act_parse_key",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        format!("supported Phase 0 action {:?}", aj.a),
                        e.to_string(),
                        last_state.clone(),
                    )
                })?;
                // Detect deferred attack-reaction windows (Shield/Counterspell) inside this
                // action's event span before consuming draws so all three Shield tapes fail
                // cleanly at the exact `select_reaction` line.
                for (scan_idx, (scan_ln, scan_tag, scan_val)) in
                    events.iter().enumerate().skip(ev_idx + 1)
                {
                    if matches!(scan_tag.as_str(), "state" | "endturn" | "act" | "turn" | "end") {
                        break;
                    }
                    if scan_tag == "dec"
                        && scan_val.get("ctx").and_then(|v| v.as_str()) == Some("select_reaction")
                    {
                        let who = scan_val
                            .get("who")
                            .and_then(|v| v.as_str())
                            .unwrap_or("?");
                        let chosen = scan_val
                            .get("chosen")
                            .and_then(|v| v.as_str())
                            .unwrap_or("?");
                        return Err(make_diff(
                            "unsupported_reaction_window",
                            decisions_checked + 1,
                            scan_idx,
                            *scan_ln,
                            "Phase 0 stop before select_reaction (Shield/Counterspell deferred to Phase 2)".into(),
                            format!("select_reaction for {who} chosen={chosen:?}"),
                            last_state,
                        ));
                    }
                }
                fight
                    .apply_payload_with_dice(actor, &payload, &mut dice, &mut sink)
                    .map_err(|e| {
                        let err_ln = dice.last_error_line.unwrap_or(line_no);
                        make_diff(
                            "act_exec_error",
                            decisions_checked,
                            ev_idx,
                            err_ln,
                            format!("clean legal execution of {:?}", aj.a),
                            e.to_string(),
                            last_state.clone(),
                        )
                    })?;
                actions_checked += 1;
            }
            "endturn" => {
                let ej: EndTurnJson = serde_json::from_value(val.clone()).map_err(|e| {
                    make_diff(
                        "endturn_parse",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "valid endturn".into(),
                        e.to_string(),
                        last_state.clone(),
                    )
                })?;
                if let Some(pending) = pending_turn_dec.take() {
                    if pending.who != ej.who || pending.expected_exec.is_some() {
                        let expected_desc = if pending.external {
                            format!(
                                "endturn matching external dec at line {} ({} -> \"end_turn\", got expected_exec={:?})",
                                pending.line_no, pending.who, pending.expected_exec
                            )
                        } else {
                            format!(
                                "endturn matching dec at line {} ({} -> \"none\")",
                                pending.line_no, pending.who
                            )
                        };
                        return Err(make_diff(
                            "decision_endturn_mismatch",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            expected_desc,
                            format!(
                                "endturn {} after {} -> {:?}",
                                ej.who,
                                pending.who,
                                pending.expected_label()
                            ),
                            last_state,
                        ));
                    }
                }
                if fight.finished() {
                    if closing_endturn_seen
                        || last_turn_actor.as_deref() != Some(ej.who.as_str())
                    {
                        return Err(make_diff(
                            "endturn_after_combat_ended",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            format!("at most one closing endturn for {:?}", last_turn_actor),
                            format!("endturn {} (already_seen={closing_endturn_seen})", ej.who),
                            last_state,
                        ));
                    }
                    closing_endturn_seen = true;
                } else {
                    let cur = fight.current();
                    if fight.unit_key(cur) != ej.who {
                        return Err(make_diff(
                            "endturn_who_mismatch",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            format!("endturn who == {}", ej.who),
                            format!("engine cur == {}", fight.unit_key(cur)),
                            last_state,
                        ));
                    }
                    fight.end_turn_with_dice(&mut dice, &mut sink).map_err(|e| {
                        let err_ln = dice.last_error_line.unwrap_or(line_no);
                        make_diff(
                            "endturn_error",
                            decisions_checked,
                            ev_idx,
                            err_ln,
                            "clean end_turn".into(),
                            e.to_string(),
                            last_state.clone(),
                        )
                    })?;
                }
            }
            "end" => {
                if let Some(pending) = &pending_turn_dec {
                    return Err(make_diff(
                        "unexecuted_turn_decision",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "no pending turn decision at end".into(),
                        format!(
                            "decision at line {} ({} -> {:?}) unexecuted",
                            pending.line_no,
                            pending.who,
                            pending.expected_label()
                        ),
                        last_state,
                    ));
                }
                seen_end = true;
                let endj: EndJson = serde_json::from_value(val.clone()).map_err(|e| {
                    make_diff(
                        "end_parse",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "valid end record".into(),
                        e.to_string(),
                        last_state.clone(),
                    )
                })?;
                let got_winner = fight.winner().map(|t| t.name().to_string());
                if got_winner != endj.winner
                    || fight.round() != endj.round
                    || fight.finished() != endj.finished
                    || (endj.decisions > 0
                        && endj.decisions != decisions_checked
                        && endj.decisions != actions_checked)
                {
                    return Err(make_diff(
                        "end_mismatch",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        format!(
                            "winner={:?} round={} finished={} decisions={}",
                            endj.winner, endj.round, endj.finished, endj.decisions
                        ),
                        format!(
                            "winner={got_winner:?} round={} finished={} decisions={decisions_checked}",
                            fight.round(),
                            fight.finished()
                        ),
                        last_state,
                    ));
                }
            }
            other => {
                return Err(make_diff(
                    "unknown_event",
                    decisions_checked,
                    ev_idx,
                    line_no,
                    "known rule-18 event type".into(),
                    other.into(),
                    last_state,
                ));
            }
        }
    }

    if !seen_start {
        return Err(make_diff(
            "missing_start",
            decisions_checked,
            events.len(),
            last_line_seen,
            "start event after header".into(),
            "tape ended before start".into(),
            last_state,
        ));
    }
    if let Some(req_line) = stop_line {
        if last_line_seen < req_line {
            return Err(make_diff(
                "truncated_before_stop_line",
                decisions_checked,
                events.len(),
                last_line_seen,
                format!("tape reaching requested --stop-line {req_line}"),
                format!("tape ended at line {last_line_seen}"),
                last_state,
            ));
        }
    } else {
        if !seen_end {
            return Err(make_diff(
                "missing_end_record",
                decisions_checked,
                events.len(),
                last_line_seen,
                "terminal end record for full-fight replay".into(),
                format!("tape ended at line {last_line_seen} without end record"),
                last_state,
            ));
        }
        if let Some(pending) = pending_turn_dec {
            return Err(make_diff(
                "unexecuted_turn_decision",
                decisions_checked,
                events.len(),
                pending.line_no,
                "all turn decisions executed".into(),
                format!(
                    "decision at line {} ({} -> {:?}) unexecuted",
                    pending.line_no,
                    pending.who,
                    pending.expected_label()
                ),
                last_state,
            ));
        }
    }
    if dice.cursor != draws_in_range {
        return Err(make_diff(
            "trailing_unconsumed_draws",
            decisions_checked,
            events.len(),
            dice.next_line(),
            format!("all {draws_in_range} draws consumed"),
            format!("only {} draws consumed", dice.cursor),
            last_state,
        ));
    }

    Ok(ReplayReport {
        tape_sha256,
        seed: hdr.seed,
        lines_checked: events.len(),
        decisions_checked,
        actions_checked,
        states_checked,
        draws_in_range,
        draws_consumed: dice.cursor,
        deferred_menu_entries_skipped,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn test_db() -> Arc<ContentDb> {
        let dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../content");
        ember_content::load_content_dir(&dir).expect("load content").0
    }

    #[test]
    fn deferred_validator_enforces_spell_specific_target_kind_and_cast_range() {
        let db = test_db();
        let ledger = load_deferred_ledger();

        // Setup matching Wight seed 18221619025 line 117: Curogana@(2,1), Guy@(7,3) (25 ft),
        // Wight@(15,1) (65 ft — beyond 60 ft Command/Ray of Frost, within 120 ft Fire Bolt).
        let spec_far = EncounterSpec {
            units: vec!["curogana".into(), "guy".into(), "wight-1".into()],
            placements: vec![
                Placement { id: "curogana".into(), x: 2, y: 1 },
                Placement { id: "guy".into(), x: 7, y: 3 },
                Placement { id: "wight-1".into(), x: 15, y: 1 },
            ],
            map_rows: Some(vec![".".repeat(18); 8]),
            max_rounds: 20,
        };
        let mut fight = Fight::new(db.clone(), &spec_far, 1, 1).unwrap();
        let mut init = ember_core::SuppliedDraws::new(vec![
            DrawRecord { who: "curogana".into(), tag: "initiative".into(), sides: 20, mode: RollMode::Normal, val: DrawVal::One(20) },
            DrawRecord { who: "guy".into(), tag: "initiative".into(), sides: 20, mode: RollMode::Advantage, val: DrawVal::Two([5, 6]) },
            DrawRecord { who: "wight-1".into(), tag: "initiative".into(), sides: 20, mode: RollMode::Normal, val: DrawVal::One(1) },
        ]);
        fight.start_with_dice(&mut init, &mut ember_core::NoopSink).unwrap();
        let curo = fight.unit_by_key("curogana").unwrap();

        // Self-only Blur accepts self, rejects ally Guy.
        assert_eq!(
            validate_deferred_phase0_candidate(&fight, curo, "spell:blur:L2:>curogana", &ledger.deferred_spell_rules),
            Ok(true)
        );
        assert!(
            validate_deferred_phase0_candidate(&fight, curo, "spell:blur:L2:>guy", &ledger.deferred_spell_rules)
                .is_err()
        );

        // Touch (5 ft) Dragon's Breath accepts self (0 ft), rejects Guy at 25 ft.
        assert_eq!(
            validate_deferred_phase0_candidate(&fight, curo, "spell:dragons_breath:L2:>curogana", &ledger.deferred_spell_rules),
            Ok(true)
        );
        assert!(
            validate_deferred_phase0_candidate(&fight, curo, "spell:dragons_breath:L2:>guy", &ledger.deferred_spell_rules)
                .is_err()
        );

        // 60 ft spells reject 65 ft Wight; 120 ft Fire Bolt accepts 65 ft Wight.
        assert!(
            validate_deferred_phase0_candidate(&fight, curo, "spell:command:L1:>wight-1", &ledger.deferred_spell_rules)
                .is_err()
        );
        assert!(
            validate_deferred_phase0_candidate(&fight, curo, "spell:ray_of_frost:L0:>wight-1", &ledger.deferred_spell_rules)
                .is_err()
        );
        assert_eq!(
            validate_deferred_phase0_candidate(&fight, curo, "spell:firebolt:L0:>wight-1", &ledger.deferred_spell_rules),
            Ok(true)
        );

        // Adjacent Guy (5 ft): Dragon's Breath touch succeeds; self-only Blur STILL rejects Guy!
        let spec_near = EncounterSpec {
            units: vec!["curogana".into(), "guy".into(), "wight-1".into()],
            placements: vec![
                Placement { id: "curogana".into(), x: 6, y: 4 },
                Placement { id: "guy".into(), x: 7, y: 3 },
                Placement { id: "wight-1".into(), x: 10, y: 4 },
            ],
            map_rows: Some(vec![".".repeat(18); 8]),
            max_rounds: 20,
        };
        let mut f_near = Fight::new(db, &spec_near, 1, 2).unwrap();
        let mut init2 = ember_core::SuppliedDraws::new(vec![
            DrawRecord { who: "curogana".into(), tag: "initiative".into(), sides: 20, mode: RollMode::Normal, val: DrawVal::One(20) },
            DrawRecord { who: "guy".into(), tag: "initiative".into(), sides: 20, mode: RollMode::Advantage, val: DrawVal::Two([5, 6]) },
            DrawRecord { who: "wight-1".into(), tag: "initiative".into(), sides: 20, mode: RollMode::Normal, val: DrawVal::One(1) },
        ]);
        f_near.start_with_dice(&mut init2, &mut ember_core::NoopSink).unwrap();
        let curo2 = f_near.unit_by_key("curogana").unwrap();
        assert_eq!(
            validate_deferred_phase0_candidate(&f_near, curo2, "spell:dragons_breath:L2:>guy", &ledger.deferred_spell_rules),
            Ok(true)
        );
        assert!(
            validate_deferred_phase0_candidate(&f_near, curo2, "spell:blur:L2:>guy", &ledger.deferred_spell_rules)
                .is_err()
        );
    }

    fn verify_tape_lines(db: Arc<ContentDb>, name: &str, lines: &[String]) -> Result<ReplayReport, ReplayDiff> {
        let path = std::env::temp_dir().join(format!(
            "ember_cli_test_{}_{}.jsonl",
            std::process::id(),
            name
        ));
        let mut body = lines.join("\n");
        body.push('\n');
        fs::write(&path, body).expect("write temp tape");
        let res = verify_tape(db, &path, None);
        let _ = fs::remove_file(&path);
        res
    }

    fn sample_uniform_tape(chooser_json: &str) -> Vec<String> {
        vec![
            format!(
                r#"{{"t":"hdr","version":19,"n20_commit":"c0025a88679950621baa29a64a66e1aadcd40ea9","units":["guy","skeleton-1"],"placements":[{{"id":"guy","x":3,"y":3}},{{"id":"skeleton-1","x":4,"y":3}}],"seed":1,"max_rounds":1,"prefer":[],"meta":{{}},"stats":{{"guy":{{"name":"Guy","ac":16,"hp":25,"mhp":25,"speed":30,"size":"medium","abil":{{"str":17,"dex":14,"con":12,"int":14,"wis":16,"cha":16}},"init_bonus":4,"npc":false}},"skeleton-1":{{"name":"skeleton-1","ac":14,"hp":13,"mhp":13,"speed":30,"size":"medium","abil":{{"str":10,"dex":16,"con":15,"int":6,"wis":8,"cha":5}},"init_bonus":3,"npc":true}}}},"map":["HHHHHHHH","H......H","H......H","H......H","H......H","H......H","HHHHHHHH"],"chooser":{chooser_json}}}"#
            ),
            r#"{"t":"start"}"#.into(),
            r#"{"t":"draw","who":"guy","tag":"initiative","sides":20,"mode":"a","v":[5,19],"expr":"1d20+4"}"#.into(),
            r#"{"t":"draw","who":"skeleton-1","tag":"initiative","sides":20,"mode":"n","v":3,"expr":"1d20+3"}"#.into(),
            r#"{"t":"turn","who":"guy","round":0}"#.into(),
            r#"{"t":"state","round":0,"cur":"guy","units":[{"id":"guy","pos":[3,3],"hp":25,"mhp":25,"thp":0,"st":[],"fx":[],"bst":[],"res":[1,1,1,30],"ds":[0,0],"str":17,"sw":2,"as":1,"asu":false},{"id":"skeleton-1","pos":[4,3],"hp":13,"mhp":13,"thp":0,"st":[],"fx":[],"bst":[],"res":[0,0,1,0],"ds":[0,0],"str":10}]}"#.into(),
            r#"{"t":"dec","ctx":"turn","who":"guy","cands":["action_surge","attack:greatsword:>skeleton-1","attack:unarmed_attack:>skeleton-1","dash","disengage","dodge","move:3,3;2,2","move:3,3;2,3","move:3,3;2,4","move:3,3;3,2","move:3,3;3,4","move:3,3;4,2","move:3,3;4,4"],"scores":[0,6.0,2.4,0.1,-1000.0,0.1,-1.65,-1.65,-1.65,-0.2,-0.2,-0.2,-0.2],"order":[1,2,3,5,9,10,11,12,6,7,8],"adj":[6.0,2.4,0.1,0.1,-0.2,-0.2,-0.2,-0.2,-1.65,-1.65,-1.65],"chosen":"attack:greatsword:>skeleton-1","ext":{"legal":["action_surge","attack:greatsword:>skeleton-1","attack:unarmed_attack:>skeleton-1","dash","disengage","dodge","move:3,3;2,2","move:3,3;2,3","move:3,3;2,4","move:3,3;3,2","move:3,3;3,4","move:3,3;4,2","move:3,3;4,4","end_turn"],"raw":[-1.0,6.0,2.4,0.1,-1000.0,0.1,-1.65,-1.65,-1.65,-0.2,-0.2,-0.2,-0.2,0.0],"dropped":[true,false,false,false,true,false,false,false,false,false,false,false,false,false],"native":1,"exec":3}}"#.into(),
            r#"{"t":"act","who":"guy","a":"dash"}"#.into(),
            r#"{"t":"state","round":0,"cur":"guy","units":[{"id":"guy","pos":[3,3],"hp":25,"mhp":25,"thp":0,"st":[],"fx":[],"bst":[],"res":[0,1,1,60],"ds":[0,0],"str":17,"sw":2,"as":1,"asu":false},{"id":"skeleton-1","pos":[4,3],"hp":13,"mhp":13,"thp":0,"st":[],"fx":[],"bst":[],"res":[0,0,1,0],"ds":[0,0],"str":10}]}"#.into(),
            r#"{"t":"dec","ctx":"turn","who":"guy","cands":["action_surge","move:3,3;2,2","move:3,3;2,3","move:3,3;2,4","move:3,3;3,2","move:3,3;3,4","move:3,3;4,2","move:3,3;4,4"],"scores":[0,-1.65,-1.65,-1.65,-0.2,-0.2,-0.2,-0.2],"order":[0,4,5,6,7,1,2,3],"adj":[1.0,-0.2,-0.2,-0.2,-0.2,-1.65,-1.65,-1.65],"chosen":"action_surge","ext":{"legal":["action_surge","move:3,3;2,2","move:3,3;2,3","move:3,3;2,4","move:3,3;3,2","move:3,3;3,4","move:3,3;4,2","move:3,3;4,4","end_turn"],"raw":[1.0,-1.65,-1.65,-1.65,-0.2,-0.2,-0.2,-0.2,0.0],"dropped":[false,false,false,false,false,false,false,false,false],"native":0,"exec":8}}"#.into(),
            r#"{"t":"endturn","who":"guy"}"#.into(),
            r#"{"t":"turn","who":"skeleton-1","round":0}"#.into(),
            r#"{"t":"state","round":0,"cur":"skeleton-1","units":[{"id":"guy","pos":[3,3],"hp":25,"mhp":25,"thp":0,"st":[],"fx":[],"bst":[],"res":[0,1,1,60],"ds":[0,0],"str":17,"sw":2,"as":1,"asu":false},{"id":"skeleton-1","pos":[4,3],"hp":13,"mhp":13,"thp":0,"st":[],"fx":[],"bst":[],"res":[1,1,1,30],"ds":[0,0],"str":10}]}"#.into(),
            r#"{"t":"dec","ctx":"turn","who":"skeleton-1","cands":["attack:shortbow:>guy","attack:shortsword:>guy","dash","disengage","dodge","move:4,3;3,2","move:4,3;3,4","move:4,3;4,2","move:4,3;4,4","move:4,3;5,2","move:4,3;5,3","move:4,3;5,4"],"scores":[1.625,3.25,-1000.0,-1000.0,0.1,-1000.0,-1000.0,-1000.0,-1000.0,-1000.0,-1000.0,-1000.0],"order":[1,0,4],"adj":[3.25,1.625,0.1],"chosen":"attack:shortsword:>guy"}"#.into(),
            r#"{"t":"act","who":"skeleton-1","a":"attack:shortsword:>guy"}"#.into(),
            r#"{"t":"draw","who":"skeleton-1","tag":"attack","sides":20,"mode":"n","v":9,"expr":"1d20+5"}"#.into(),
            r#"{"t":"draw","who":"skeleton-1","tag":"damage","sides":6,"mode":"n","v":1,"expr":"1d6+3"}"#.into(),
            r#"{"t":"state","round":0,"cur":"skeleton-1","units":[{"id":"guy","pos":[3,3],"hp":25,"mhp":25,"thp":0,"st":[],"fx":[],"bst":[],"res":[0,1,1,60],"ds":[0,0],"str":17,"sw":2,"as":1,"asu":false},{"id":"skeleton-1","pos":[4,3],"hp":13,"mhp":13,"thp":0,"st":[],"fx":[],"bst":[],"res":[0,1,1,30],"ds":[0,0],"str":10}]}"#.into(),
            r#"{"t":"dec","ctx":"turn","who":"skeleton-1","cands":["move:4,3;3,2","move:4,3;3,4","move:4,3;4,2","move:4,3;4,4","move:4,3;5,2","move:4,3;5,3","move:4,3;5,4"],"scores":[-1000.0,-1000.0,-1000.0,-1000.0,-1000.0,-1000.0,-1000.0],"order":[],"adj":[],"chosen":"none"}"#.into(),
            r#"{"t":"endturn","who":"skeleton-1"}"#.into(),
            r#"{"t":"turn","who":"guy","round":1}"#.into(),
            r#"{"t":"state","round":1,"cur":"guy","units":[{"id":"guy","pos":[3,3],"hp":25,"mhp":25,"thp":0,"st":[],"fx":[],"bst":[],"res":[1,1,1,30],"ds":[0,0],"str":17,"sw":2,"as":1,"asu":false},{"id":"skeleton-1","pos":[4,3],"hp":13,"mhp":13,"thp":0,"st":[],"fx":[],"bst":[],"res":[0,1,1,30],"ds":[0,0],"str":10}]}"#.into(),
            r#"{"t":"end","winner":null,"finished":false,"round":1,"turns":2,"decisions":2,"wall_s":0.0}"#.into(),
        ]
    }

    #[test]
    fn external_chooser_accepts_non_native_team_and_unit_and_binds_ext_exec() {
        let db = test_db();

        // 1. Non-native team chooser (`uniform`) passes full replay.
        let uniform = sample_uniform_tape(r#"{"heroes":"uniform","monsters":"native","seed":1000003}"#);
        let rep = verify_tape_lines(db.clone(), "uniform", &uniform)
            .expect("heroes=uniform,monsters=native should replay cleanly");
        assert_eq!(rep.actions_checked, 2);

        // 2. Per-unit non-native chooser override on an otherwise native team passes.
        let per_unit = sample_uniform_tape(
            r#"{"heroes":"native","monsters":"native","units":{"guy":"eps:0.2"},"seed":1000003}"#,
        );
        verify_tape_lines(db.clone(), "per_unit", &per_unit)
            .expect("per-unit non-native chooser should replay cleanly");

        // 3. Mismatched `ext.exec` (0=action_surge vs act=dash) must fail at line 8.
        let mut wrong_exec = sample_uniform_tape(r#"{"heroes":"external","monsters":"native","seed":1000003}"#);
        wrong_exec[6] = wrong_exec[6].replace(r#""exec":3"#, r#""exec":0"#);
        let diff = verify_tape_lines(db.clone(), "wrong_exec", &wrong_exec)
            .expect_err("ext.exec mismatch must be rejected");
        assert_eq!(diff.kind, "decision_action_mismatch");
        assert_eq!(diff.jsonl_line, 8);

        // 4. Mismatched `ext.exec` before `endturn` (0=action_surge vs endturn) must fail at line 11.
        let mut wrong_endturn = sample_uniform_tape(r#"{"heroes":"uniform","monsters":"native","seed":1000003}"#);
        wrong_endturn[9] = wrong_endturn[9].replace(r#""exec":8"#, r#""exec":0"#);
        let diff = verify_tape_lines(db.clone(), "wrong_endturn", &wrong_endturn)
            .expect_err("ext.exec != end_turn before endturn must be rejected");
        assert_eq!(diff.kind, "decision_endturn_mismatch");
        assert_eq!(diff.jsonl_line, 11);

        // 5. External actor missing `ext` block must fail at line 7.
        let mut missing_ext = sample_uniform_tape(r#"{"heroes":"uniform","monsters":"native","seed":1000003}"#);
        let cut = missing_ext[6].find(r#","ext":"#).unwrap();
        missing_ext[6] = format!("{}}}", &missing_ext[6][..cut]);
        let diff = verify_tape_lines(db.clone(), "missing_ext", &missing_ext)
            .expect_err("missing ext block on external actor must be rejected");
        assert_eq!(diff.kind, "missing_ext_decision");
        assert_eq!(diff.jsonl_line, 7);

        // 6. Native actor carrying an unexpected `ext` block must fail at line 14.
        let mut unexpected_ext = sample_uniform_tape(r#"{"heroes":"uniform","monsters":"native","seed":1000003}"#);
        unexpected_ext[13] = unexpected_ext[13].replacen(
            r#""chosen":"attack:shortsword:>guy"}"#,
            r#""chosen":"attack:shortsword:>guy","ext":{"legal":["attack:shortsword:>guy","end_turn"],"native":0,"exec":0}}"#,
            1,
        );
        let diff = verify_tape_lines(db.clone(), "unexpected_ext", &unexpected_ext)
            .expect_err("unexpected ext block on native actor must be rejected");
        assert_eq!(diff.kind, "unexpected_ext_decision");
        assert_eq!(diff.jsonl_line, 14);

        // 7. `ext.native` disagreeing with `dec.chosen` must fail at line 7.
        let mut bad_native = sample_uniform_tape(r#"{"heroes":"uniform","monsters":"native","seed":1000003}"#);
        bad_native[6] = bad_native[6].replace(r#""native":1"#, r#""native":3"#);
        let diff = verify_tape_lines(db.clone(), "bad_native", &bad_native)
            .expect_err("ext.native mismatch with dec.chosen must be rejected");
        assert_eq!(diff.kind, "ext_native_mismatch");
        assert_eq!(diff.jsonl_line, 7);

        // 8. Unknown unit id in `chooser.units` must fail at line 1.
        let bad_chooser = sample_uniform_tape(
            r#"{"heroes":"native","monsters":"native","units":{"ghost":"uniform"},"seed":1}"#,
        );
        let diff = verify_tape_lines(db, "bad_chooser", &bad_chooser)
            .expect_err("unknown chooser unit must be rejected");
        assert_eq!(diff.kind, "hdr_chooser_unknown_unit");
        assert_eq!(diff.jsonl_line, 1);
    }
}
