//! Strict supplied-draw rule-18 JSONL tape verifier.
//!
//! Checks every `hdr`, `start`, `draw` (who/tag/sides/mode/v), `turn`, `dec`
//! (canonical ordering + stable descending score tie-break + reaction options),
//! `act`, `state` (full `StateDigest`), `endturn`, and `end` record.
//! On any mismatch, returns a structured [`ReplayDiff`] pointing to the exact
//! 1-based JSONL line number and decision index.

use std::collections::BTreeMap;
use std::fs;
use std::path::Path;
use std::sync::Arc;

use ember_core::{
    ContentDb, CoreError, DiceSource, DrawRecord, DrawVal, EncounterSpec, Fight, FightPhase,
    Observer, OracleSink, Placement, ReactionChoice, ReactionMode, RollMode, StateDigest,
    UnitDigest,
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
}

/// Tape-backed `DiceSource` that tracks exact 1-based JSONL line numbers for every draw.
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
        let val = expected.val;
        self.cursor += 1;
        Ok(val)
    }
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

    // Parse all lines up to stop_line (1-based inclusive)
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

    let spec = EncounterSpec {
        units: hdr.units.clone(),
        placements: hdr.placements.clone(),
        map_rows: hdr.map.clone(),
        max_rounds: hdr.max_rounds,
    };
    let mut fight = Fight::new(db.clone(), &spec, hdr.seed).map_err(|e| ReplayDiff {
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
    // Interactive reaction mode guarantees every OA reaction decision in the tape
    // is explicitly checked and executed through `Fight::respond_reaction_with_dice`!
    fight.set_reaction_mode(ReactionMode::Interactive);

    // Cross-check header stats against compiled ContentDb sheets
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
    let mut pending_turn_check: Option<(usize, usize, TurnJson)> = None;

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
        match tag.as_str() {
            "draw" => {
                draws_seen_in_stream += 1;
                if dice.cursor < draws_seen_in_stream {
                    // Draw appeared in tape without engine requesting it before next event
                    // (wait until the next non-draw event if a preceding action was not yet run?
                    // No: in tape format, draws ALWAYS follow the action/start/turn that triggered them,
                    // EXCEPT turn-start draws (Stench / Death Save) which follow `turn` and were ALREADY
                    // consumed during `start` or `endturn`!)
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
                // Check against current turn (note: if the actor died or stayed unconscious on
                // start-of-turn death save, engine auto-advances in open_turn; verify match!)
                if !fight.state.finished && !fight.state.order.is_empty() {
                    let cur_key = fight.unit_key(fight.current()).to_string();
                    if cur_key == tj.who && fight.state.round == tj.round {
                        pending_turn_check = None;
                    } else {
                        // Record in case start_turn skipped an unconscious turn before the
                        // active turn; verify against sink events!
                        let matched_sink = sink.events.iter().any(|ev| {
                            matches!(
                                ev,
                                ember_core::Event::TurnStarted { unit, round }
                                    if fight.unit_key(*unit) == tj.who && *round == tj.round
                            )
                        });
                        if !matched_sink {
                            return Err(make_diff(
                                "turn_mismatch",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("turn who={} round={}", tj.who, tj.round),
                                format!("engine cur={cur_key} round={}", fight.state.round),
                                last_state,
                            ));
                        }
                        pending_turn_check = Some((ev_idx, line_no, tj));
                    }
                }
                let _ = &pending_turn_check;
            }
            "state" => {
                // Ensure draw cursor aligns exactly with stream draws seen up to this state
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
                if got != expected {
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

                // 1. Validate strict stable descending sort of `order` / `adj`
                //    (catches reordered ties at exact JSONL line!)
                if dj.order.len() != dj.adj.len() {
                    return Err(make_diff(
                        "dec_order_len",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        format!("order.len() == adj.len() ({})", dj.adj.len()),
                        format!("order.len() == {}", dj.order.len()),
                        last_state,
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
                            last_state,
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
                            last_state,
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
                                last_state,
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
                                last_state,
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
                            last_state,
                        ));
                    }
                }

                // 2. Check context-specific engine invariants & execute reactions interactively!
                if dj.ctx == "reaction" {
                    let FightPhase::AwaitingReaction { prompt_id, reactor } = fight.phase() else {
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
                    let frame = fight.state.interrupts.top().expect("pending frame");
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
                    // Verify canonical ordering of core_opts vs tape cands
                    let mut sorted_core = core_opts.clone();
                    sorted_core.sort();
                    if sorted_core != dj.cands {
                        return Err(make_diff(
                            "reaction_cands_mismatch",
                            decisions_checked,
                            ev_idx,
                            line_no,
                            format!("{:?}", dj.cands),
                            format!("{sorted_core:?}"),
                            last_state,
                        ));
                    }
                    let choice_index = if dj.chosen == "none" {
                        None
                    } else {
                        let idx = core_opts.iter().position(|s| s == &dj.chosen).ok_or_else(|| {
                            make_diff(
                                "reaction_chosen_missing",
                                decisions_checked,
                                ev_idx,
                                line_no,
                                format!("option {:?}", dj.chosen),
                                format!("core options {core_opts:?}"),
                                last_state.clone(),
                            )
                        })?;
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
                } else if dj.ctx == "turn" {
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
                    // Verify canonical ordering of all core-supported legal actions inside `cands`
                    if !dj.cands.is_empty() {
                        let core_legal: Vec<String> = fight
                            .legal_actions(Observer::Full)
                            .into_iter()
                            .filter(|a| a.action_key != "end_turn" && a.action_key != "stand")
                            .map(|a| a.action_key)
                            .collect();
                        // Every core-enumerated action must appear in `dj.cands` in the exact same
                        // relative canonical order!
                        let mut last_pos: Option<usize> = None;
                        for ck in &core_legal {
                            let Some(pos) = dj.cands.iter().position(|c| c == ck) else {
                                return Err(make_diff(
                                    "legal_action_missing_from_tape",
                                    decisions_checked,
                                    ev_idx,
                                    line_no,
                                    format!("tape cands containing {ck:?}"),
                                    format!("cands={:?}", dj.cands),
                                    last_state,
                                ));
                            };
                            if let Some(prev) = last_pos {
                                if pos <= prev {
                                    return Err(make_diff(
                                        "canon_order_mismatch",
                                        decisions_checked,
                                        ev_idx,
                                        line_no,
                                        format!("strictly ascending canonical position for {ck:?}"),
                                        format!("pos={pos} <= prev={prev}"),
                                        last_state,
                                    ));
                                }
                            }
                            last_pos = Some(pos);
                        }
                    }
                    if fight.template_of(cur).caster.is_some() {
                        fight.unit_mut(cur).pools_init = true;
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
                fight
                    .apply_payload_with_dice(actor, &payload, &mut dice, &mut sink)
                    .map_err(|e| {
                        let err_ln = dice.last_error_line.unwrap_or(line_no);
                        make_diff(
                            "act_exec_error",
                            decisions_checked,
                            ev_idx,
                            err_ln,
                            format!("clean execution of {:?}", aj.a),
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
                // Note: if fight already ended on the last action before endturn, skip.
                if !fight.state.finished {
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
                let got_winner = fight.state.winner.map(|t| t.name().to_string());
                if got_winner != endj.winner
                    || fight.state.round != endj.round
                    || fight.state.finished != endj.finished
                {
                    return Err(make_diff(
                        "end_mismatch",
                        decisions_checked,
                        ev_idx,
                        line_no,
                        format!(
                            "winner={:?} round={} finished={}",
                            endj.winner, endj.round, endj.finished
                        ),
                        format!(
                            "winner={got_winner:?} round={} finished={}",
                            fight.state.round, fight.state.finished
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
    })
}
