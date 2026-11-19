//! Randomness and the event stream.
//!
//! Every random number the engine uses goes through [`Trace::draw`], the
//! mirror of natural20's `DieRoll.generate_number`. In free mode the value
//! comes from a fast local RNG; in replay mode it comes from a recorded
//! natural20 tape, and the call's semantic tag (who rolls, which call site,
//! die size, advantage mode) must match the tape. Structural events (turns,
//! AI decisions, actions, state digests) are compared the same way, so the
//! first difference between the engines is reported where it happens.

use crate::tape::{DecExt, DrawVal, Ev};

/// natural20 `DieRoll.generate_number`: one `randint`, or two independent
/// `randint` dice for advantage/disadvantage.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RollMode {
    Normal,
    Advantage,
    Disadvantage,
}

impl RollMode {
    pub fn code(self) -> &'static str {
        match self {
            RollMode::Normal => "n",
            RollMode::Advantage => "a",
            RollMode::Disadvantage => "d",
        }
    }
    /// `Roller`: advantage and disadvantage on the same roll cancel.
    pub fn from_flags(adv: bool, dis: bool) -> RollMode {
        match (adv, dis) {
            (true, false) => RollMode::Advantage,
            (false, true) => RollMode::Disadvantage,
            _ => RollMode::Normal,
        }
    }
}

/// xoshiro256** seeded by splitmix64 (free mode only).
#[derive(Clone, Debug)]
pub struct FastRng {
    s: [u64; 4],
}

impl FastRng {
    pub fn new(seed: u64) -> Self {
        let mut z = seed;
        let mut s = [0u64; 4];
        for slot in &mut s {
            z = z.wrapping_add(0x9E37_79B9_7F4A_7C15);
            let mut x = z;
            x = (x ^ (x >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
            x = (x ^ (x >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
            *slot = x ^ (x >> 31);
        }
        FastRng { s }
    }

    #[inline]
    pub fn next_u64(&mut self) -> u64 {
        let result = self.s[1].wrapping_mul(5).rotate_left(7).wrapping_mul(9);
        let t = self.s[1] << 17;
        self.s[2] ^= self.s[0];
        self.s[3] ^= self.s[1];
        self.s[1] ^= self.s[2];
        self.s[0] ^= self.s[3];
        self.s[2] ^= t;
        self.s[3] = self.s[3].rotate_left(45);
        result
    }

    /// Uniform integer in `1..=n` (Lemire's method, unbiased).
    #[inline]
    pub fn die(&mut self, n: i32) -> i32 {
        let n = n as u64;
        loop {
            let m = (self.next_u64() as u128) * (n as u128);
            let low = m as u64;
            if low >= n.wrapping_neg() % n {
                return (m >> 64) as i32 + 1;
            }
        }
    }
}

/// The first point where the engine and the tape disagree.
#[derive(Debug, Clone)]
pub struct Divergence {
    /// Index of the event in the tape (after the header).
    pub index: usize,
    pub expected: Option<String>,
    pub got: String,
    pub detail: String,
    /// The tape events just before the divergence.
    pub context: Vec<String>,
}

impl std::fmt::Display for Divergence {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "divergence at tape event #{}", self.index)?;
        writeln!(f, "  context (tape):")?;
        for line in &self.context {
            writeln!(f, "    {line}")?;
        }
        writeln!(f, "  expected: {}", self.expected.as_deref().unwrap_or("<end of tape>"))?;
        writeln!(f, "  got:      {}", self.got)?;
        if !self.detail.is_empty() {
            writeln!(f, "  detail:   {}", self.detail)?;
        }
        Ok(())
    }
}

#[derive(Clone)]
enum Mode {
    Free,
    Record(Vec<Ev>),
    Replay { events: Vec<Ev>, pos: usize },
    /// Draw-only replay for `WebArena` oracle parity tests (no structural events).
    Draws { events: Vec<Ev>, pos: usize },
}

#[derive(Clone)]
pub struct Trace {
    mode: Mode,
    rng: FastRng,
    pub draws: u64,
    capture_draws: bool,
    captured: Vec<Ev>,
}

impl Trace {
    pub fn free(seed: u64) -> Self {
        Trace { mode: Mode::Free, rng: FastRng::new(seed), draws: 0, capture_draws: false, captured: Vec::new() }
    }

    /// Free mode that also records every event (for debugging and fixtures).
    pub fn recording(seed: u64) -> Self {
        Trace { mode: Mode::Record(Vec::new()), rng: FastRng::new(seed), draws: 0, capture_draws: false, captured: Vec::new() }
    }

    pub fn replay(events: Vec<Ev>) -> Self {
        Trace { mode: Mode::Replay { events, pos: 0 }, rng: FastRng::new(0), draws: 0, capture_draws: false, captured: Vec::new() }
    }

    /// Free mode for `WebArena`: captures primitive draws (`webgame/ff/dice.py`) without structural events.
    pub fn web_free(seed: u64) -> Self {
        Trace { mode: Mode::Free, rng: FastRng::new(seed), draws: 0, capture_draws: true, captured: Vec::new() }
    }

    /// Draw-only replay mode for `WebArena` oracle parity tests.
    pub fn web_replay_draws(events: Vec<Ev>) -> Self {
        Trace { mode: Mode::Draws { events, pos: 0 }, rng: FastRng::new(0), draws: 0, capture_draws: true, captured: Vec::new() }
    }

    /// Drain primitive draws captured since the last call.
    pub fn take_captured(&mut self) -> Vec<Ev> {
        std::mem::take(&mut self.captured)
    }

    /// Structural events are only built when they will be recorded or compared.
    #[inline]
    pub fn on(&self) -> bool {
        matches!(self.mode, Mode::Record(_) | Mode::Replay { .. })
    }

    pub fn is_replay(&self) -> bool {
        matches!(self.mode, Mode::Replay { .. } | Mode::Draws { .. })
    }

    pub fn recorded(&mut self) -> Vec<Ev> {
        match &mut self.mode {
            Mode::Record(v) => std::mem::take(v),
            _ => Vec::new(),
        }
    }

    pub fn position(&self) -> usize {
        match &self.mode {
            Mode::Replay { pos, .. } | Mode::Draws { pos, .. } => *pos,
            Mode::Record(v) => v.len(),
            Mode::Free => 0,
        }
    }

    /// The next tape event (replay mode), without consuming it.
    pub fn peek(&self) -> Option<&Ev> {
        match &self.mode {
            Mode::Replay { events, pos } | Mode::Draws { events, pos } => events.get(*pos),
            _ => None,
        }
    }

    /// Restart the free-mode dice stream from `seed` (a reseeded restore;
    /// no effect on replayed draws).
    pub fn reseed(&mut self, seed: u64) {
        self.rng = FastRng::new(seed);
    }

    /// Remaining tape events (replay mode).
    pub fn remaining(&self) -> usize {
        match &self.mode {
            Mode::Replay { events, pos } | Mode::Draws { events, pos } => events.len().saturating_sub(*pos),
            _ => 0,
        }
    }

    fn context(events: &[Ev], pos: usize) -> Vec<String> {
        let start = pos.saturating_sub(12);
        events[start..pos].iter().enumerate().map(|(i, e)| format!("#{} {}", start + i, e.brief())).collect()
    }

    fn diverge(events: &[Ev], pos: usize, got: String, detail: String) -> ! {
        let div = Divergence {
            index: pos,
            expected: events.get(pos).map(|e| e.brief()),
            got,
            detail,
            context: Self::context(events, pos),
        };
        std::panic::panic_any(div)
    }

    /// One primitive random call (`DieRoll.generate_number`).
    #[inline]
    pub fn draw(&mut self, who: &str, tag: &str, sides: i32, mode: RollMode) -> DrawVal {
        self.draws += 1;
        let v = match &mut self.mode {
            Mode::Free => self.free_value(sides, mode),
            Mode::Record(_) => {
                let v = self.free_value(sides, mode);
                if let Mode::Record(events) = &mut self.mode {
                    events.push(Ev::Draw {
                        who: who.to_string(),
                        tag: tag.to_string(),
                        sides,
                        mode: mode.code().to_string(),
                        v,
                        expr: None,
                    });
                }
                v
            }
            Mode::Replay { events, pos } => {
                let got = || format!("draw {who} {tag} d{sides}{}", mode.code());
                match events.get(*pos) {
                    Some(Ev::Draw { who: w, tag: t, sides: s, mode: m, v, expr }) => {
                        if w != who || t != tag || *s != sides || m != mode.code() {
                            let detail = format!("tape expr {:?}", expr);
                            Self::diverge(events, *pos, got(), detail);
                        }
                        let v = *v;
                        *pos += 1;
                        v
                    }
                    _ => Self::diverge(events, *pos, got(), String::new()),
                }
            }
            Mode::Draws { events, pos } => {
                // `webgame/ff/dice.py` stops stack inspection at `Roller.roll` when
                // `description` is None, yielding `"roll"` where `n20_record.py` yields `"fn:..."`.
                let web_tag = if tag.starts_with("fn:") { "roll" } else { tag };
                let got = || format!("draw {who} {web_tag} d{sides}{}", mode.code());
                match events.get(*pos) {
                    Some(Ev::Draw { who: w, tag: t, sides: s, mode: m, v, .. }) => {
                        if w != who || (t != web_tag && t != tag) || *s != sides || m != mode.code() {
                            panic!(
                                "web draw divergence at #{}: expected {:?}, got {}",
                                *pos,
                                events.get(*pos).map(Ev::brief),
                                got()
                            );
                        }
                        let v = *v;
                        *pos += 1;
                        v
                    }
                    _ => panic!(
                        "web draw divergence at #{}: expected {:?}, got {}",
                        *pos,
                        events.get(*pos).map(Ev::brief),
                        got()
                    ),
                }
            }
        };
        if self.capture_draws {
            let web_tag = if tag.starts_with("fn:") { "roll" } else { tag };
            self.captured.push(Ev::Draw {
                who: who.to_string(),
                tag: web_tag.to_string(),
                sides,
                mode: mode.code().to_string(),
                v,
                expr: None,
            });
        }
        v
    }

    fn free_value(&mut self, sides: i32, mode: RollMode) -> DrawVal {
        match mode {
            RollMode::Normal => DrawVal::One(self.rng.die(sides)),
            _ => {
                let a = self.rng.die(sides);
                let b = self.rng.die(sides);
                DrawVal::Two([a, b])
            }
        }
    }

    /// A structural event. Callers check [`Trace::on`] before building it.
    pub fn emit(&mut self, ev: Ev) {
        match &mut self.mode {
            Mode::Free | Mode::Draws { .. } => {}
            Mode::Record(v) => v.push(ev),
            Mode::Replay { events, pos } => {
                let expected = events.get(*pos);
                let detail = match expected {
                    None => Some(String::from("tape ended")),
                    Some(exp) => compare(exp, &ev),
                };
                if let Some(detail) = detail {
                    Self::diverge(events, *pos, ev.brief(), detail);
                }
                *pos += 1;
            }
        }
    }
}

/// `None` when `got` matches the recorded event, else a description.
fn compare(exp: &Ev, got: &Ev) -> Option<String> {
    match (exp, got) {
        (Ev::Start {}, Ev::Start {}) => None,
        (Ev::Turn { who: a, round: r }, Ev::Turn { who: b, round: s }) => {
            (a != b || r != s).then(|| format!("turn: tape {a} r{r}, engine {b} r{s}"))
        }
        (Ev::Act { who: a, a: x }, Ev::Act { who: b, a: y }) => {
            (a != b || x != y).then(|| format!("act: tape {a} {x}, engine {b} {y}"))
        }
        (Ev::EndTurn { who: a }, Ev::EndTurn { who: b }) => (a != b).then(|| format!("endturn: tape {a}, engine {b}")),
        (
            Ev::Dec { ctx: c1, who: w1, cands: k1, scores: s1, order: o1, adj: a1, chosen: ch1, ext: x1, .. },
            Ev::Dec { ctx: c2, who: w2, cands: k2, scores: s2, order: o2, adj: a2, chosen: ch2, ext: x2, .. },
        ) => {
            if c1 != c2 || w1 != w2 {
                return Some(format!("decision context: tape {c1} {w1}, engine {c2} {w2}"));
            }
            if k1 != k2 {
                return Some(list_diff("candidate lists differ:", k1, k2));
            }
            for (i, (x, y)) in s1.iter().zip(s2.iter()).enumerate() {
                if x != y {
                    return Some(format!("score of [{i}] {}: tape {:?}, engine {:?}", k1[i], x, y));
                }
            }
            if o1 != o2 || a1 != a2 {
                return Some(format!("final order: tape {o1:?} {a1:?}\n    engine {o2:?} {a2:?}"));
            }
            if ch1 != ch2 {
                return Some(format!("chosen: tape {ch1}, engine {ch2}"));
            }
            match (x1, x2) {
                (None, None) => None,
                (Some(_), None) => Some("external decision on the tape, native decision in the engine".into()),
                (None, Some(_)) => Some("native decision on the tape, external decision in the engine".into()),
                (Some(a), Some(b)) => compare_ext(a, b),
            }
        }
        (Ev::State(a), Ev::State(b)) => {
            if a == b {
                return None;
            }
            if a.round != b.round || a.cur != b.cur {
                return Some(format!("state header: tape r{} {:?}, engine r{} {:?}", a.round, a.cur, b.round, b.cur));
            }
            let mut lines = vec![String::from("state digest differs:")];
            for (x, y) in a.units.iter().zip(b.units.iter()) {
                if x != y {
                    lines.push(format!("    tape   {}", serde_json::to_string(x).unwrap()));
                    lines.push(format!("    engine {}", serde_json::to_string(y).unwrap()));
                }
            }
            Some(lines.join("\n"))
        }
        (
            Ev::End { winner: w1, finished: f1, round: r1, turns: t1, ext: x1, .. },
            Ev::End { winner: w2, finished: f2, round: r2, turns: t2, ext: x2, .. },
        ) => {
            if w1 != w2 || f1 != f2 || r1 != r2 {
                return Some(format!("end: tape {w1:?} {f1} r{r1}, engine {w2:?} {f2} r{r2}"));
            }
            // Off-policy tapes: the turn count (`GeneralArena.turns_run`) and
            // the external decision counters.
            let x1 = x1.as_ref()?;
            let empty = Default::default();
            let x2 = x2.as_ref().unwrap_or(&empty);
            if t1 != t2 {
                return Some(format!("end turns: tape {t1}, engine {t2}"));
            }
            (x1 != x2).then(|| format!("end ext: tape {x1:?}, engine {x2:?}"))
        }
        (a, b) => Some(format!("event kind: tape {}, engine {}", a.kind(), b.kind())),
    }
}

fn list_diff(title: &str, k1: &[String], k2: &[String]) -> String {
    let mut lines = vec![String::from(title)];
    let n = k1.len().max(k2.len());
    for i in 0..n {
        let a = k1.get(i).map(String::as_str).unwrap_or("-");
        let b = k2.get(i).map(String::as_str).unwrap_or("-");
        if a != b {
            lines.push(format!("    [{i}] tape {a} | engine {b}"));
        }
    }
    lines.join("\n")
}

/// The `ext` blocks of an external decision: rows, native scores (exact;
/// `null` = End Turn's -inf), dropped flags, native choice, markers, the
/// executed row.
fn compare_ext(a: &DecExt, b: &DecExt) -> Option<String> {
    if a.legal != b.legal {
        return Some(list_diff("legal rows differ:", &a.legal, &b.legal));
    }
    match (&a.raw, &b.raw) {
        (Some(r1), Some(r2)) => {
            if r1.len() != r2.len() {
                return Some(format!("ext raw: tape {} scores, engine {}", r1.len(), r2.len()));
            }
            for (i, (x, y)) in r1.iter().zip(r2.iter()).enumerate() {
                let same = match (x, y) {
                    (Some(x), Some(y)) => x.to_bits() == y.to_bits() || x == y,
                    (None, None) => true,
                    _ => false,
                };
                if !same {
                    return Some(format!("ext raw of [{i}] {}: tape {x:?}, engine {y:?}", a.legal[i]));
                }
            }
        }
        (None, None) => {}
        (x, y) => return Some(format!("ext raw: tape {x:?}, engine {y:?}")),
    }
    if a.dropped != b.dropped {
        return Some(format!("ext dropped: tape {:?}, engine {:?}", a.dropped, b.dropped));
    }
    if a.native != b.native {
        let name = |n: Option<usize>| n.and_then(|n| a.legal.get(n).cloned()).unwrap_or_else(|| "null".into());
        return Some(format!("ext native: tape {} ({:?}), engine {} ({:?})", name(a.native), a.native, name(b.native), b.native));
    }
    if a.forced != b.forced || a.unscored != b.unscored {
        return Some(format!(
            "ext markers: tape forced {:?} unscored {:?}, engine forced {:?} unscored {:?}",
            a.forced, a.unscored, b.forced, b.unscored
        ));
    }
    (a.exec != b.exec).then(|| format!("ext exec: tape {}, engine {}", a.exec, b.exec))
}
