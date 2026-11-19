//! natural20 `DieRoll` arithmetic that the engine and the AI share.

use crate::trace::RollMode;

/// The modifier natural20 applies to an expression it builds as
/// `f"1d20+{bonus}"`. `DieRoll.parse` collapses the sign pair of `"1d20+-2"`
/// into a minus (N20-012 fixed; it used to read `+2`).
#[inline]
pub fn plus_string_modifier(bonus: i32) -> i32 {
    bonus
}

/// `DieRoll.prob(x)` for a single d`sides` with `modifier`: the chance the
/// total is at least `x` (natural 1 and 20 not special), with natural20's
/// advantage/disadvantage sums in its float order.
pub fn prob_at_least(sides: i32, modifier: i32, x: i32, mode: RollMode) -> f64 {
    if x > sides + modifier {
        return 0.0;
    }
    if x < 1 + modifier {
        return 1.0;
    }
    let xa = x - modifier;
    let n = sides as f64;
    let mut sum = 0.0f64;
    match mode {
        RollMode::Advantage => {
            for i in xa..=sides {
                let p = 1.0 / n;
                let p2 = i as f64 * (1.0 / n);
                let p3 = (i - 1) as f64 * (1.0 / n);
                sum += p * p2 + p3 * p;
            }
        }
        RollMode::Disadvantage => {
            for i in xa..=sides {
                let p = 1.0 / n;
                let p2 = (sides - i + 1) as f64 * (1.0 / n);
                let p3 = (sides - i) as f64 * (1.0 / n);
                sum += p * p2 + p3 * p;
            }
        }
        RollMode::Normal => {
            sum = (sides - xa + 1) as f64 / n;
        }
    }
    sum
}

/// `DieRoll.expected()` of `count`d`sides` + `modifier` rolled normally.
pub fn expected(count: i32, sides: i32, modifier: i32) -> f64 {
    if sides == 0 {
        // A fixed value: sum(rolls) + modifier with rolls == [count].
        return (count + modifier) as f64;
    }
    let mut ev = 0.0f64;
    let inv = 1.0 / sides as f64;
    for i in 1..=sides {
        ev += i as f64 * inv;
    }
    count as f64 * ev + modifier as f64
}

/// `save_fail_chance` (attack_action.py): analytic, no dice.
pub fn save_fail_chance(dc: i32, save_mod: i32, auto_fail: bool) -> f64 {
    if auto_fail {
        return 1.0;
    }
    ((dc - 1 - save_mod) as f64 / 20.0).clamp(0.0, 1.0)
}

/// `expected_die` (attack_action.py): `count * (sides + 1) / 2.0 + modifier`.
pub fn expected_die(count: i32, sides: i32, modifier: i32) -> f64 {
    let base = if sides > 0 { (count * (sides + 1)) as f64 / 2.0 } else { count as f64 };
    base + modifier as f64
}
