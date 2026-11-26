//! Strict supplied-draw rule-18 JSONL tape verifier.
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
    Observer, OracleSink, Placement, ReactionChoice, ReactionMode, RollMode, StateDigest,
    UnitDigest, UnitFlags, UnitId,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

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
    map: Option<Vec<String>>,
    #[serde(default)]
    stats: BTreeMap<String, HeaderStat>,
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
struct DecJson {
    ctx: String,
    who: String,
    cands: Vec<String>,
    scores: Vec<f64>,
    order: Vec<usize>,
    adj: Vec<f64>,
    chosen: String,
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

/// Returns `true` ONLY for an unchosen Phase 1–3 candidate that legitimately
/// belongs to `actor`'s own compiled character sheet (and is explicitly
/// deferred out of Phase 0):
/// - spells listed in `actor`'s `CasterTemplate.deferred_spells`
/// - Sorcerer Font of Magic slot/point conversion on Sorcerers
/// - `first_aid:><ally>` when `actor` is a PC adjacent to an unconscious unstable ally
///
/// Any unknown or foreign candidate (such as `"spell:wish:L9:>ghast-1"`) returns `false`
/// and fails bidirectional menu equality immediately.
fn is_sheet_deferred_phase0_candidate(fight: &Fight, actor: UnitId, cand: &str) -> bool {
    let tmpl = fight.template_of(actor);
    if let Some(rest) = cand.strip_prefix("spell:") {
        let spell_key = rest.split(':').next().unwrap_or("");
        return tmpl
            .caster
            .as_ref()
            .is_some_and(|c| c.deferred_spells.iter().any(|s| s == spell_key));
    }
    if tmpl.sorcerer
        && matches!(
            cand,
            "create_spell_slot:L1"
                | "create_spell_slot:L2"
                | "convert_spell_slot:L1"
                | "convert_spell_slot:L2"
        )
    {
        return true;
    }
    if tmpl.pc {
        if let Some(target_key) = cand.strip_prefix("first_aid:>") {
            if let Some(t) = fight.unit_by_key(target_key) {
                let tu = fight.unit(t);
                return fight.allies(actor, t)
                    && tu.flags.is_unconscious()
                    && !tu.flags.contains(UnitFlags::STABLE)
                    && fight.unit(actor).pos.feet_to(tu.pos) <= 5
                    && fight.unit(actor).action > 0;
            }
        }
    }
    false
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
        expected: "valid rule-18 header".into(),
        got: e.to_string(),
        preceding_state: None,
    })?;
    if hdr.version != 18 {
        return Err(ReplayDiff {
            kind: "version".into(),
            first_diff_decision: 0,
            event_index: 0,
            jsonl_line: events[0].0,
            seed: hdr.seed,
            tape_sha256,
            expected: "version == 18".into(),
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

    let spec = EncounterSpec {
        units: hdr.units.clone(),
        placements: hdr.placements.clone(),
        map_rows: hdr.map.clone(),
        max_rounds: hdr.max_rounds,
    };
    let mut fight = Fight::new(db, &spec, hdr.seed).map_err(|e| ReplayDiff {
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
    let mut actions_checked = 0usize;
    let mut states_checked = 0usize;
    let mut draws_seen_in_stream = 0usize;
    let mut deferred_menu_entries_skipped = 0usize;
    let mut turn_ev_cursor = 0usize;
    let mut pending_turn_dec: Option<(usize, String, String)> = None;
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
                if let Some((dec_ln, dec_who, dec_chosen)) = &pending_turn_dec {
                    return Err(make_diff(
                        "unexecuted_turn_decision",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "no pending turn decision across turn boundary".into(),
                        format!(
                            "decision at line {dec_ln} ({dec_who} -> {dec_chosen:?}) was never executed"
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
                        if let Some((dec_ln, dec_who, dec_chosen)) = &pending_turn_dec {
                            return Err(make_diff(
                                "unexecuted_turn_decision",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                "previous turn decision executed before next dec".into(),
                                format!(
                                    "unexecuted decision at line {dec_ln} ({dec_who} -> {dec_chosen:?})"
                                ),
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

                        if dj.cands.is_empty() {
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
                                if !core_legal.is_empty() || core_can_stand {
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
                            if dj.chosen != "none"
                                && is_sheet_deferred_phase0_candidate(&fight, cur, &dj.chosen)
                            {
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

                            // STRICT BIDIRECTIONAL EQUALITY: filter out ONLY sheet-declared
                            // deferred Phase 1-3 entries; every remaining candidate MUST match
                            // `core_legal` in exact set and canonical order (both ways)!
                            let mut tape_in_scope: Vec<String> = Vec::with_capacity(dj.cands.len());
                            for cand in &dj.cands {
                                if is_sheet_deferred_phase0_candidate(&fight, cur, cand) {
                                    deferred_menu_entries_skipped += 1;
                                } else {
                                    tape_in_scope.push(cand.clone());
                                }
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
                        pending_turn_dec = Some((line_no, dj.who, dj.chosen));
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
                let Some((dec_ln, dec_who, dec_chosen)) = pending_turn_dec.take() else {
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
                if dec_who != aj.who || dec_chosen != aj.a {
                    return Err(make_diff(
                        "decision_action_mismatch",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        format!("act matching dec at line {dec_ln}: {dec_who} -> {dec_chosen:?}"),
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
                if let Some((dec_ln, dec_who, dec_chosen)) = pending_turn_dec.take() {
                    if dec_who != ej.who || dec_chosen != "none" {
                        return Err(make_diff(
                            "decision_endturn_mismatch",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            format!(
                                "endturn matching dec at line {dec_ln} ({dec_who} -> \"none\")"
                            ),
                            format!("endturn {} after {dec_who} -> {dec_chosen:?}", ej.who),
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
                if let Some((dec_ln, dec_who, dec_chosen)) = &pending_turn_dec {
                    return Err(make_diff(
                        "unexecuted_turn_decision",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        "no pending turn decision at end".into(),
                        format!("decision at line {dec_ln} ({dec_who} -> {dec_chosen:?}) unexecuted"),
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
                    || (endj.decisions > 0 && endj.decisions != decisions_checked)
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
        if let Some((dec_ln, dec_who, dec_chosen)) = pending_turn_dec {
            return Err(make_diff(
                "unexecuted_turn_decision",
                decisions_checked,
                events.len(),
                dec_ln,
                "all turn decisions executed".into(),
                format!("decision at line {dec_ln} ({dec_who} -> {dec_chosen:?}) unexecuted"),
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
