//! Deterministic RNG (`xoshiro256**` seeded by `splitmix64`) and pluggable
//! `DiceSource` for both live rollouts and strict supplied-draw tape replay.

use serde::{Deserialize, Serialize};

use crate::types::{CoreError, RollMode};

/// Primitive draw value: one die for normal rolls, two independent dice for
/// advantage/disadvantage.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum DrawVal {
    One(i32),
    Two([i32; 2]),
}

impl DrawVal {
    #[inline]
    pub fn try_one(self, cursor: usize) -> Result<i32, CoreError> {
        match self {
            DrawVal::One(v) => Ok(v),
            DrawVal::Two(pair) => Err(CoreError::DrawMismatch {
                cursor,
                expected: "single die value".into(),
                got: format!("pair {pair:?}"),
            }),
        }
    }

    #[inline]
    pub fn try_pair(self, cursor: usize) -> Result<[i32; 2], CoreError> {
        match self {
            DrawVal::Two(v) => Ok(v),
            DrawVal::One(v) => Err(CoreError::DrawMismatch {
                cursor,
                expected: "pair of die values".into(),
                got: format!("single {v}"),
            }),
        }
    }

    /// Validate that `self` matches `mode` (`One` for normal, `Two` for adv/dis)
    /// and that every rolled face is within `1..=sides`.
    pub fn validate(self, sides: i32, mode: RollMode, cursor: usize) -> Result<(), CoreError> {
        match (mode, self) {
            (RollMode::Normal, DrawVal::One(v)) => {
                if v < 1 || v > sides {
                    return Err(CoreError::DrawMismatch {
                        cursor,
                        expected: format!("face in 1..={sides}"),
                        got: format!("{v}"),
                    });
                }
                Ok(())
            }
            (RollMode::Advantage | RollMode::Disadvantage, DrawVal::Two([a, b])) => {
                if a < 1 || a > sides || b < 1 || b > sides {
                    return Err(CoreError::DrawMismatch {
                        cursor,
                        expected: format!("faces in 1..={sides}"),
                        got: format!("[{a}, {b}]"),
                    });
                }
                Ok(())
            }
            (RollMode::Normal, DrawVal::Two(p)) => Err(CoreError::DrawMismatch {
                cursor,
                expected: "single die value for mode n".into(),
                got: format!("pair {p:?}"),
            }),
            (RollMode::Advantage | RollMode::Disadvantage, DrawVal::One(v)) => {
                Err(CoreError::DrawMismatch {
                    cursor,
                    expected: format!("pair of die values for mode {}", mode.code()),
                    got: format!("single {v}"),
                })
            }
        }
    }

    /// Selected face under `mode` (`max` for advantage, `min` for disadvantage).
    #[inline]
    pub fn try_selected(self, mode: RollMode, cursor: usize) -> Result<i32, CoreError> {
        match mode {
            RollMode::Normal => self.try_one(cursor),
            RollMode::Advantage => {
                let [a, b] = self.try_pair(cursor)?;
                Ok(a.max(b))
            }
            RollMode::Disadvantage => {
                let [a, b] = self.try_pair(cursor)?;
                Ok(a.min(b))
            }
        }
    }
}

/// Recorded primitive draw (identical fields to tape `draw` events).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct DrawRecord {
    pub who: String,
    pub tag: String,
    pub sides: i32,
    pub mode: RollMode,
    pub val: DrawVal,
}

/// `xoshiro256**` seeded by `splitmix64` (handles full 64-bit high-bit seeds faithfully).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
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
        Self { s }
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

    /// Uniform integer in `1..=n` using Lemire's unbiased rejection method.
    #[inline]
    pub fn die(&mut self, n: i32) -> i32 {
        debug_assert!(n > 0);
        let n = n as u64;
        loop {
            let m = (self.next_u64() as u128) * (n as u128);
            let low = m as u64;
            if low >= n.wrapping_neg() % n {
                return (m >> 64) as i32 + 1;
            }
        }
    }

    #[inline]
    pub fn draw(&mut self, sides: i32, mode: RollMode) -> DrawVal {
        match mode {
            RollMode::Normal => DrawVal::One(self.die(sides)),
            RollMode::Advantage | RollMode::Disadvantage => {
                let a = self.die(sides);
                let b = self.die(sides);
                DrawVal::Two([a, b])
            }
        }
    }
}

/// Source of primitive dice draws for `Fight` execution.
pub trait DiceSource {
    fn draw(
        &mut self,
        who: &str,
        tag: &str,
        sides: i32,
        mode: RollMode,
    ) -> Result<DrawVal, CoreError>;
}

/// Live RNG dice source backed directly by `FightState.rng`.
pub struct LiveDice<'a> {
    pub rng: &'a mut FastRng,
}

impl DiceSource for LiveDice<'_> {
    #[inline]
    fn draw(
        &mut self,
        _who: &str,
        _tag: &str,
        sides: i32,
        mode: RollMode,
    ) -> Result<DrawVal, CoreError> {
        Ok(self.rng.draw(sides, mode))
    }
}

/// Strict supplied-draw source for tape verification: every draw's
/// `(who, tag, sides, mode)` must match the tape verbatim.
#[derive(Clone, Debug)]
pub struct SuppliedDraws {
    draws: Vec<DrawRecord>,
    cursor: usize,
}

impl SuppliedDraws {
    pub fn new(draws: Vec<DrawRecord>) -> Self {
        Self { draws, cursor: 0 }
    }

    #[inline]
    pub fn cursor(&self) -> usize {
        self.cursor
    }

    #[inline]
    pub fn remaining(&self) -> usize {
        self.draws.len().saturating_sub(self.cursor)
    }

    #[inline]
    pub fn len(&self) -> usize {
        self.draws.len()
    }

    #[inline]
    pub fn is_empty(&self) -> bool {
        self.draws.is_empty()
    }
}

impl DiceSource for SuppliedDraws {
    fn draw(
        &mut self,
        who: &str,
        tag: &str,
        sides: i32,
        mode: RollMode,
    ) -> Result<DrawVal, CoreError> {
        let got = format!("draw {who} {tag} d{sides}{}", mode.code());
        let Some(exp) = self.draws.get(self.cursor) else {
            return Err(CoreError::DrawMismatch {
                cursor: self.cursor,
                expected: "<end of supplied draws>".into(),
                got,
            });
        };
        if exp.who != who || exp.tag != tag || exp.sides != sides || exp.mode != mode {
            return Err(CoreError::DrawMismatch {
                cursor: self.cursor,
                expected: format!("draw {} {} d{}{}", exp.who, exp.tag, exp.sides, exp.mode.code()),
                got,
            });
        }
        exp.val.validate(sides, mode, self.cursor)?;
        self.cursor += 1;
        Ok(exp.val)
    }
}
