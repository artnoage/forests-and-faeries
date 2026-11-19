//! Native-vs-native balancing (GENERAL_ENV.md §7, stage G7; `ember balance`).
//!
//! An encounter's **native baseline** is the probability that the heroes win
//! by native elimination when the native AI plays both sides, over the
//! encounter's layout distribution and the dice. Games that reach the
//! horizon (`max_rounds`, the trainer's 30 by default) are counted apart as
//! truncations, as are games where both sides fell together.
//!
//! Each game is a [`Game`] with both teams native: the code path the
//! trainer's `BatchEnv` runs, with the encounter's own `max_rounds` when the
//! catalog row sets one. Game `k` of encounter `id` under seed base `b` uses
//! [`game_seeds`]`(b, id, k)` as layout and dice seeds, so a result depends on
//! neither the thread count nor the other encounters measured with it, and a
//! later stage extends an earlier one (games `200..2000` after a screen of
//! `0..200`).
//!
//! The search ([`search_map`]) grows rosters the way §7.2 describes:
//! - **Enumerate** multisets of the pool's monsters level by level (roster
//!   size 1, 2, ...). A roster is a candidate only if every roster one monster
//!   smaller is still *alive* (its screened hero win rate is at least the
//!   screen band's low end). Adding a monster never helps the heroes, so a
//!   roster with a dead sub-roster cannot reach the band.
//! - **Screen** each candidate with a few hundred games; rosters in the
//!   screen band with a low truncation rate go on.
//! - **Refine** to the full game count (2,000 gives a 95% Wilson half-width
//!   of at most 2.2 pp) and **accept** p in the accept band with truncation
//!   under the cap.
//!
//! [`screen_pool`] runs the screen, refine and accept stages on a fixed
//! roster pool instead of the enumeration.
//!
//! [`tune`] is the local version: from a given roster, add a monster while
//! the heroes win too often and remove one while they lose too often, until
//! the refined p is in the band.

use std::collections::{HashMap, HashSet};
use std::ops::Range;
use std::sync::Arc;

use rayon::prelude::*;
use serde_json::{json, Value};

use crate::batch::{EnvConfig, EpisodeSpec, Game};
use crate::catalog::Entry;
use crate::content::ContentPool;
use crate::env::Controller;
use crate::spec::MAX_CREATURES;

/// The trainer's horizon (`docs/EMBER_DUEL.md`, "General backend":
/// `objective='health_score'`, `max_rounds=30`, `standing_weight=0.5`).
pub const HORIZON: i32 = 30;

/// SRD 5.2.1 experience points of the pool's monsters (natural20
/// `templates/rulesets/5e-2024/npcs/<id>.yml`, `xp:`). Only a prior for
/// ordering and capping the search, and a catalog field.
pub const SRD_XP: &[(&str, u32)] = &[
    ("skeleton", 50),
    ("zombie", 50),
    ("shadow", 100),
    ("ghoul", 200),
    ("specter", 200),
    ("ghast", 450),
    ("wight", 700),
];

pub fn xp(content: &str) -> Option<u32> {
    SRD_XP.iter().find(|(id, _)| *id == content).map(|&(_, x)| x)
}

fn splitmix(mut z: u64) -> u64 {
    z = z.wrapping_add(0x9E37_79B9_7F4A_7C15);
    z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
    z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
    z ^ (z >> 31)
}

fn fnv(s: &str) -> u64 {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for b in s.bytes() {
        h ^= b as u64;
        h = h.wrapping_mul(0x0100_0000_01b3);
    }
    h
}

/// (layout seed, dice seed) of game `k` of encounter `id` under seed base
/// `base`; the dice seed is below 2^63 (the environment's limit).
pub fn game_seeds(base: u64, id: &str, k: u64) -> (u64, u64) {
    let h = splitmix(splitmix(base) ^ fnv(id)) ^ splitmix(k ^ 0x5851_F42D_4C95_7F2D);
    (splitmix(h ^ 1), splitmix(h ^ 2) & (i64::MAX as u64))
}

/// One native-vs-native game.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct GameResult {
    /// Native elimination: 0 heroes won, 1 monsters won, -1 both fell
    /// together. -1 at the horizon too.
    pub winner: i8,
    pub finished: bool,
    /// The horizon was reached with both sides standing (a truncation).
    pub horizon: bool,
    /// Rounds played (1-based round of the end; `max_rounds` at the horizon).
    pub rounds: i32,
    /// Heroes dead at the end, heroes dead or dying (not conscious).
    pub hero_deaths: u8,
    pub heroes_down: u8,
    pub monster_deaths: u8,
    /// The heroes-perspective health score (`batch::Game::score`, w = 0.5).
    pub score: f32,
}

/// Play game `k` of `entry` under seed base `base`, both teams native.
pub fn play(entry: &Arc<Entry>, base: u64, k: u64, max_rounds: i32, pool: &'static ContentPool) -> Result<GameResult, String> {
    let (layout_seed, dice_seed) = game_seeds(base, &entry.id, k);
    let spec = EpisodeSpec { encounter: entry.id.clone(), map_seed: 0, layout_seed, dice_seed, offset_x: 0, offset_y: 0 };
    let cfg = EnvConfig { scores: false, health: true, max_rounds, standing_weight: 0.5, max_steps: u64::MAX };
    let game = Game::new(entry, &spec, [Controller::Native; 2], &[], &cfg, pool)?;
    debug_assert!(game.done());
    let o = game.env.outcome();
    let f = &game.env.fight;
    let mut r = GameResult {
        winner: if o.finished { o.winner.map_or(-1, |w| w as i8) } else { -1 },
        finished: o.finished,
        horizon: o.horizon,
        rounds: (o.round + 1).min(game.max_rounds),
        score: game.score(0.5) as f32,
        ..Default::default()
    };
    for u in &f.units {
        if u.team == 0 {
            r.hero_deaths += u.dead() as u8;
            r.heroes_down += (!u.conscious()) as u8;
        } else {
            r.monster_deaths += u.dead() as u8;
        }
    }
    Ok(r)
}

/// Results of many games of one encounter.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Stats {
    /// Games played (layout failures are `errors`, not games).
    pub games: u64,
    pub errors: u64,
    pub hero_wins: u64,
    pub monster_wins: u64,
    /// Both sides fell together.
    pub draws: u64,
    /// Reached the horizon (truncations).
    pub horizon: u64,
    /// Horizon games with the heroes ahead on the health score.
    pub horizon_heroes_ahead: u64,
    pub rounds: u64,
    pub hero_deaths: u64,
    pub heroes_down: u64,
    /// Games with at least one dead hero, and those among hero wins.
    pub hero_death_games: u64,
    pub hero_death_wins: u64,
    pub monster_deaths: u64,
    pub first_error: Option<String>,
}

/// The 95% Wilson score interval of `k` successes in `n` trials.
pub fn wilson(k: u64, n: u64) -> (f64, f64) {
    if n == 0 {
        return (0.0, 1.0);
    }
    let z = 1.959_963_984_540_054_f64;
    let n = n as f64;
    let p = k as f64 / n;
    let d = 1.0 + z * z / n;
    let c = (p + z * z / (2.0 * n)) / d;
    let h = z * (p * (1.0 - p) / n + z * z / (4.0 * n * n)).sqrt() / d;
    ((c - h).max(0.0), (c + h).min(1.0))
}

fn r4(x: f64) -> f64 {
    (x * 1e4).round() / 1e4
}

impl Stats {
    pub fn push(&mut self, r: Result<GameResult, String>) {
        let r = match r {
            Ok(r) => r,
            Err(e) => {
                self.errors += 1;
                self.first_error.get_or_insert(e);
                return;
            }
        };
        self.games += 1;
        match (r.finished, r.winner) {
            (true, 0) => self.hero_wins += 1,
            (true, 1) => self.monster_wins += 1,
            (true, _) => self.draws += 1,
            _ => {}
        }
        if r.horizon {
            self.horizon += 1;
            self.horizon_heroes_ahead += (r.score > 0.0) as u64;
        }
        self.rounds += r.rounds as u64;
        self.hero_deaths += r.hero_deaths as u64;
        self.heroes_down += r.heroes_down as u64;
        self.hero_death_games += (r.hero_deaths > 0) as u64;
        self.hero_death_wins += (r.hero_deaths > 0 && r.finished && r.winner == 0) as u64;
        self.monster_deaths += r.monster_deaths as u64;
    }

    pub fn merge(&mut self, o: &Stats) {
        self.games += o.games;
        self.errors += o.errors;
        self.hero_wins += o.hero_wins;
        self.monster_wins += o.monster_wins;
        self.draws += o.draws;
        self.horizon += o.horizon;
        self.horizon_heroes_ahead += o.horizon_heroes_ahead;
        self.rounds += o.rounds;
        self.hero_deaths += o.hero_deaths;
        self.heroes_down += o.heroes_down;
        self.hero_death_games += o.hero_death_games;
        self.hero_death_wins += o.hero_death_wins;
        self.monster_deaths += o.monster_deaths;
        if self.first_error.is_none() {
            self.first_error = o.first_error.clone();
        }
    }

    fn frac(&self, k: u64) -> f64 {
        if self.games == 0 {
            0.0
        } else {
            k as f64 / self.games as f64
        }
    }

    /// Hero native-elimination win rate.
    pub fn p(&self) -> f64 {
        self.frac(self.hero_wins)
    }

    /// Monster native-elimination win rate.
    pub fn q(&self) -> f64 {
        self.frac(self.monster_wins)
    }

    /// Games that reached the horizon.
    pub fn truncation(&self) -> f64 {
        self.frac(self.horizon)
    }

    pub fn ci(&self) -> (f64, f64) {
        wilson(self.hero_wins, self.games)
    }

    /// Half-width of the 95% Wilson interval of p.
    pub fn half_width(&self) -> f64 {
        let (lo, hi) = self.ci();
        (hi - lo) / 2.0
    }

    pub fn mean_rounds(&self) -> f64 {
        self.frac(self.rounds)
    }

    /// The measurement as catalog fields: `p`, `p_ci`, `truncation`,
    /// `baseline` (the trainer's per-team native win probabilities) and a
    /// `balance` block with the counts.
    pub fn annotate(&self, row: &Value, base: u64, games: &Range<u64>, max_rounds: i32) -> Value {
        let mut v = row.clone();
        let (lo, hi) = self.ci();
        v["p"] = json!(r4(self.p()));
        v["p_ci"] = json!([r4(lo), r4(hi)]);
        v["truncation"] = json!(r4(self.truncation()));
        v["baseline"] = json!({"heroes": r4(self.p()), "monsters": r4(self.q())});
        v["balance"] = json!({
            "games": self.games,
            "seed": base,
            "game_range": [games.start, games.end],
            "max_rounds": max_rounds,
            "hero_wins": self.hero_wins,
            "monster_wins": self.monster_wins,
            "draws": self.draws,
            "horizon": self.horizon,
            "horizon_heroes_ahead": self.horizon_heroes_ahead,
            "errors": self.errors,
            "half_width": r4(self.half_width()),
            "mean_rounds": r4(self.mean_rounds()),
            "hero_deaths": r4(self.frac(self.hero_deaths)),
            "heroes_down": r4(self.frac(self.heroes_down)),
            "hero_death_rate": r4(self.frac(self.hero_death_games)),
            "hero_death_in_wins": r4(if self.hero_wins > 0 { self.hero_death_wins as f64 / self.hero_wins as f64 } else { 0.0 }),
            "monster_deaths": r4(self.frac(self.monster_deaths)),
        });
        if let Some(e) = &self.first_error {
            v["balance"]["first_error"] = json!(e);
        }
        v
    }
}

/// Play `games[i]` of `entries[i]` for every i, all games in one parallel
/// pass (the global rayon pool). Each encounter's horizon is its own
/// `max_rounds` when set, else `max_rounds`.
pub fn measure_many(entries: &[Arc<Entry>], games: &[Range<u64>], base: u64, max_rounds: i32, pool: &'static ContentPool) -> Vec<Stats> {
    assert_eq!(entries.len(), games.len());
    let jobs: Vec<(usize, u64)> = games.iter().enumerate().flat_map(|(i, r)| r.clone().map(move |k| (i, k))).collect();
    let results: Vec<(usize, Result<GameResult, String>)> = jobs
        .par_iter()
        .map(|&(i, k)| {
            let e = &entries[i];
            (i, play(e, base, k, e.max_rounds.unwrap_or(max_rounds), pool))
        })
        .collect();
    let mut out = vec![Stats::default(); entries.len()];
    for (i, r) in results {
        out[i].push(r);
    }
    out
}

pub fn measure(entry: &Arc<Entry>, games: Range<u64>, base: u64, max_rounds: i32, pool: &'static ContentPool) -> Stats {
    measure_many(std::slice::from_ref(entry), &[games], base, max_rounds, pool).pop().unwrap()
}

// ----------------------------------------------------------------------
// Rosters and rows
// ----------------------------------------------------------------------

/// A roster as counts per pool monster type (`types[i]` has `counts[i]`).
pub type Counts = Vec<u8>;

pub fn roster_of(types: &[String], counts: &[u8]) -> Vec<String> {
    let mut out = Vec::new();
    for (t, &n) in types.iter().zip(counts) {
        for _ in 0..n {
            out.push(t.clone());
        }
    }
    out
}

/// `skeleton2+zombie1`.
pub fn roster_code(types: &[String], counts: &[u8]) -> String {
    types.iter().zip(counts).filter(|(_, &n)| n > 0).map(|(t, n)| format!("{t}{n}")).collect::<Vec<_>>().join("+")
}

pub fn roster_xp(types: &[String], counts: &[u8]) -> u32 {
    types.iter().zip(counts).map(|(t, &n)| xp(t).unwrap_or(0) * n as u32).sum()
}

/// The map of searched rows: a fixed map (`content/maps/<name>.yml`, the row
/// says `"map": "<name>"`) or a map given inline (`"map": {name, rows,
/// ember}`, e.g. the `map` object of an `ember mapgen gen` file). `label`
/// names it in row ids and progress lines: the fixed name or the map's name.
#[derive(Clone, Debug, PartialEq)]
pub struct MapArg {
    pub label: String,
    /// The row's `map` value.
    pub value: Value,
}

impl MapArg {
    pub fn fixed(name: &str) -> MapArg {
        MapArg { label: name.to_string(), value: json!(name) }
    }

    /// A row's `map` value: a fixed map name, or an inline map with a `name`
    /// (the label) and `rows`.
    pub fn from_value(v: &Value) -> Result<MapArg, String> {
        match v {
            Value::String(name) => Ok(MapArg::fixed(name)),
            Value::Object(m) => {
                let name = m.get("name").and_then(Value::as_str).ok_or("an inline map needs a name (the row-id label)")?;
                if !m.get("rows").is_some_and(Value::is_array) {
                    return Err(format!("inline map {name} without rows"));
                }
                Ok(MapArg { label: name.to_string(), value: v.clone() })
            }
            _ => Err("map must be a fixed map name or {name, rows, ...}".into()),
        }
    }
}

impl From<&str> for MapArg {
    fn from(name: &str) -> MapArg {
        MapArg::fixed(name)
    }
}

impl From<&MapArg> for MapArg {
    fn from(m: &MapArg) -> MapArg {
        m.clone()
    }
}

/// A catalog row (§7.3, the G6 format): `{map label}-{party joined by +}-{roster code}`.
pub fn make_row(map: &MapArg, party: &[String], types: &[String], counts: &[u8], layout: &Value, max_rounds: Option<i32>) -> Value {
    let roster = roster_of(types, counts);
    let mut v = json!({
        "id": format!("{}-{}-{}", map.label, party.join("+"), roster_code(types, counts)),
        "map": map.value,
        "party": party,
        "roster": roster,
        "layout": layout,
    });
    if let Some(r) = max_rounds {
        v["max_rounds"] = json!(r);
    }
    v["n_monsters"] = json!(counts.iter().map(|&n| n as u32).sum::<u32>());
    v["xp"] = json!(roster_xp(types, counts));
    v
}

/// `{"rule": "zone", "require_sight": sight, "tries": 200}`.
pub fn zone_layout(require_sight: bool) -> Value {
    json!({"rule": "zone", "require_sight": require_sight, "tries": crate::layout::TRIES})
}

// ----------------------------------------------------------------------
// Search
// ----------------------------------------------------------------------

#[derive(Clone, Debug)]
pub struct SearchCfg {
    pub party: Vec<String>,
    /// Monster types in canonical order.
    pub types: Vec<String>,
    pub max_size: usize,
    pub max_per_type: u8,
    /// Rosters above this weight (SRD XP, or `prior`) are not candidates.
    pub max_xp: Option<u32>,
    /// Rosters below this weight are not screened but count as alive (too
    /// easy to matter): the search starts near the balance frontier instead
    /// of at one monster, for parties that beat small rosters every time
    /// (the level-3 trio; GENERAL_ENV.md "l3 catalogs").
    pub min_xp: Option<u32>,
    /// Per-type weights (in `types` order) replacing SRD XP for the search's
    /// ordering, `max_xp` and `min_xp` (rows keep SRD `xp`).
    pub prior: Option<Vec<u32>>,
    /// Candidates screened per level at most (the rest, by XP order, skipped).
    pub max_candidates: usize,
    pub screen_games: u64,
    pub refine_games: u64,
    pub screen_band: (f64, f64),
    pub accept_band: (f64, f64),
    pub screen_trunc: f64,
    pub max_trunc: f64,
    pub max_half_width: f64,
    pub layout: Value,
    pub max_rounds: i32,
    /// Write `max_rounds` into each row (the encounter's horizon, §7.1).
    pub row_max_rounds: bool,
    pub seed: u64,
}

/// A roster's search weight: `cfg.prior` if given, else SRD XP.
pub fn search_weight(cfg: &SearchCfg, c: &[u8]) -> u32 {
    match &cfg.prior {
        Some(w) => w.iter().zip(c).map(|(&w, &n)| w * n as u32).sum(),
        None => roster_xp(&cfg.types, c),
    }
}

/// One measured roster.
#[derive(Clone, Debug)]
pub struct Measured {
    pub counts: Counts,
    pub row: Value,
    pub screen: Stats,
    /// The full measurement (screen games included) when refined.
    pub refined: Option<Stats>,
    pub accepted: bool,
}

impl Measured {
    /// The row with the best measurement's fields and the search verdict.
    pub fn to_json(&self, cfg: &SearchCfg) -> Value {
        let (s, n) = match &self.refined {
            Some(s) => (s, cfg.refine_games.max(cfg.screen_games)),
            None => (&self.screen, cfg.screen_games),
        };
        let mut v = s.annotate(&self.row, cfg.seed, &(0..n), cfg.max_rounds);
        v["search"] = json!({
            "stage": if self.refined.is_some() { "refine" } else { "screen" },
            "accepted": self.accepted,
            "screen_p": r4(self.screen.p()),
            "screen_truncation": r4(self.screen.truncation()),
        });
        v
    }
}

fn entry_of(row: &Value, pool: &ContentPool) -> Result<Arc<Entry>, String> {
    Entry::from_json(row, pool).map(Arc::new)
}

fn in_band(x: f64, band: (f64, f64)) -> bool {
    x >= band.0 && x <= band.1
}

pub fn accepts(cfg: &SearchCfg, s: &Stats) -> bool {
    s.games >= cfg.refine_games
        && in_band(s.p(), cfg.accept_band)
        && s.truncation() < cfg.max_trunc
        && s.half_width() <= cfg.max_half_width
}

/// Screen `counts` rosters on `map`, refine those in the screen band.
/// Returns them in input order.
pub fn screen_and_refine(map: &MapArg, cands: &[Counts], cfg: &SearchCfg, pool: &'static ContentPool) -> Result<Vec<Measured>, String> {
    let mr = cfg.row_max_rounds.then_some(cfg.max_rounds);
    let rows: Vec<Value> = cands.iter().map(|c| make_row(map, &cfg.party, &cfg.types, c, &cfg.layout, mr)).collect();
    let entries: Vec<Arc<Entry>> = rows.iter().map(|r| entry_of(r, pool)).collect::<Result<_, _>>()?;
    let screen = measure_many(&entries, &vec![0..cfg.screen_games; entries.len()], cfg.seed, cfg.max_rounds, pool);
    let todo: Vec<usize> = (0..entries.len())
        .filter(|&i| in_band(screen[i].p(), cfg.screen_band) && screen[i].truncation() <= cfg.screen_trunc && cfg.refine_games > cfg.screen_games)
        .collect();
    let more = measure_many(
        &todo.iter().map(|&i| entries[i].clone()).collect::<Vec<_>>(),
        &vec![cfg.screen_games..cfg.refine_games; todo.len()],
        cfg.seed,
        cfg.max_rounds,
        pool,
    );
    let mut out: Vec<Measured> = cands
        .iter()
        .zip(rows)
        .zip(screen)
        .map(|((c, row), s)| Measured { counts: c.clone(), row, screen: s, refined: None, accepted: false })
        .collect();
    for (&i, m) in todo.iter().zip(more) {
        let mut full = out[i].screen.clone();
        full.merge(&m);
        out[i].accepted = accepts(cfg, &full);
        out[i].refined = Some(full);
    }
    Ok(out)
}

/// Every one-smaller sub-roster of `c` (one monster removed), non-empty.
fn subsets(c: &[u8]) -> Vec<Counts> {
    let mut out = Vec::new();
    for i in 0..c.len() {
        if c[i] > 0 {
            let mut s = c.to_vec();
            s[i] -= 1;
            if s.iter().any(|&n| n > 0) {
                out.push(s);
            }
        }
    }
    out
}

/// Level-by-level search on one map (module doc). `progress` gets one line
/// per level. Returns every measured roster.
pub fn search_map(
    map: impl Into<MapArg>,
    cfg: &SearchCfg,
    pool: &'static ContentPool,
    mut progress: impl FnMut(&str),
) -> Result<Vec<Measured>, String> {
    let arg: MapArg = map.into();
    let map = &arg.label;
    let k = cfg.types.len();
    let cap = cfg.max_size.min(MAX_CREATURES - cfg.party.len());
    let mut all = Vec::new();
    let mut alive: HashSet<Counts> = HashSet::new();
    for size in 1..=cap {
        let mut cands: Vec<Counts> = Vec::new();
        if size == 1 {
            for t in 0..k {
                let mut c = vec![0u8; k];
                c[t] = 1;
                cands.push(c);
            }
        } else {
            let mut parents: Vec<&Counts> = alive.iter().filter(|c| c.iter().map(|&n| n as usize).sum::<usize>() == size - 1).collect();
            parents.sort();
            for p in parents {
                let last = (0..k).rev().find(|&t| p[t] > 0).unwrap();
                for t in last..k {
                    let mut c = p.clone();
                    c[t] += 1;
                    if subsets(&c).iter().all(|s| alive.contains(s)) {
                        cands.push(c);
                    }
                }
            }
        }
        cands.retain(|c| c.iter().all(|&n| n <= cfg.max_per_type) && cfg.max_xp.map_or(true, |m| search_weight(cfg, c) <= m));
        if cands.is_empty() {
            progress(&format!("{map}: size {size}: no candidates left"));
            break;
        }
        // below --min-xp: assumed alive, not screened
        let n_below = match cfg.min_xp {
            Some(m) => {
                let (below, rest): (Vec<Counts>, Vec<Counts>) = cands.into_iter().partition(|c| search_weight(cfg, c) < m);
                let n = below.len();
                alive.extend(below);
                cands = rest;
                n
            }
            None => 0,
        };
        if cands.is_empty() {
            progress(&format!("{map}: size {size}: {n_below} below --min-xp (assumed alive), none screened"));
            continue;
        }
        cands.sort_by_key(|c| (search_weight(cfg, c), c.clone()));
        let skipped = cands.len().saturating_sub(cfg.max_candidates);
        cands.truncate(cfg.max_candidates);
        let t0 = std::time::Instant::now();
        let measured = screen_and_refine(&arg, &cands, cfg, pool)?;
        let (mut n_alive, mut n_refined, mut n_acc) = (0, 0, 0);
        for m in &measured {
            if m.screen.p() >= cfg.screen_band.0 {
                alive.insert(m.counts.clone());
                n_alive += 1;
            }
            n_refined += m.refined.is_some() as usize;
            n_acc += m.accepted as usize;
        }
        let games: u64 = measured.iter().map(|m| m.refined.as_ref().unwrap_or(&m.screen).games).sum();
        progress(&format!(
            "{map}: size {size}: {} screened{}{}, {n_alive} alive, {n_refined} refined, {n_acc} accepted; {games} games in {:.1}s",
            measured.len(),
            if n_below > 0 { format!(" ({n_below} below --min-xp assumed alive)") } else { String::new() },
            if skipped > 0 { format!(" ({skipped} skipped by --max-candidates)") } else { String::new() },
            t0.elapsed().as_secs_f64()
        ));
        all.extend(measured);
    }
    Ok(all)
}

/// The search's stages on a fixed roster pool instead of the level-by-level
/// enumeration (`ember balance search --rosters`): screen every roster,
/// refine those in the screen band, accept by the same rules, with the same
/// rows and games as [`search_map`] for the same roster. For parties whose
/// balance frontier holds thousands of rosters (the level-3 trio), a pool
/// calibrated once and shared by every map (GENERAL_ENV.md "l3 catalogs").
pub fn screen_pool(
    map: impl Into<MapArg>,
    rosters: &[Counts],
    cfg: &SearchCfg,
    pool: &'static ContentPool,
    mut progress: impl FnMut(&str),
) -> Result<Vec<Measured>, String> {
    let arg: MapArg = map.into();
    let t0 = std::time::Instant::now();
    let measured = screen_and_refine(&arg, rosters, cfg, pool)?;
    let n_alive = measured.iter().filter(|m| m.screen.p() >= cfg.screen_band.0).count();
    let n_refined = measured.iter().filter(|m| m.refined.is_some()).count();
    let n_acc = measured.iter().filter(|m| m.accepted).count();
    let games: u64 = measured.iter().map(|m| m.refined.as_ref().unwrap_or(&m.screen).games).sum();
    progress(&format!(
        "{}: pool: {} screened, {n_alive} alive, {n_refined} refined, {n_acc} accepted; {games} games in {:.1}s",
        arg.label,
        measured.len(),
        t0.elapsed().as_secs_f64()
    ));
    Ok(measured)
}

/// Grow or shrink one roster until it is accepted (module doc). At each
/// step every neighbour (one monster added while p is above the accept
/// band, one removed while below) is screened and the one with screen p
/// closest to the band's middle is taken. Returns the path of measured
/// rosters; the last is accepted if the walk succeeded.
pub fn tune(map: impl Into<MapArg>, start: &[u8], cfg: &SearchCfg, max_steps: usize, pool: &'static ContentPool) -> Result<Vec<Measured>, String> {
    let map: &MapArg = &map.into();
    let k = cfg.types.len();
    let cap = cfg.max_size.min(MAX_CREATURES - cfg.party.len());
    let mid = (cfg.accept_band.0 + cfg.accept_band.1) / 2.0;
    let mut path = Vec::new();
    let mut seen: HashMap<Counts, f64> = HashMap::new();
    let mut cur = screen_and_refine(map, &[start.to_vec()], cfg, pool)?.pop().unwrap();
    for _ in 0..=max_steps {
        let p = cur.refined.as_ref().unwrap_or(&cur.screen).p();
        seen.insert(cur.counts.clone(), p);
        let accepted = cur.accepted;
        let counts = cur.counts.clone();
        path.push(cur);
        if accepted {
            break;
        }
        let size: usize = counts.iter().map(|&n| n as usize).sum();
        let mut next = Vec::new();
        if p > mid && size < cap {
            for t in 0..k {
                let mut c = counts.clone();
                c[t] += 1;
                if c[t] <= cfg.max_per_type && !seen.contains_key(&c) {
                    next.push(c);
                }
            }
        } else if p < mid {
            next = subsets(&counts).into_iter().filter(|c| !seen.contains_key(c)).collect();
        }
        if next.is_empty() {
            break;
        }
        let measured = screen_and_refine(map, &next, cfg, pool)?;
        // accepted first, then screen p closest to the band's middle
        let key = |m: &Measured| (!m.accepted as u8, (m.refined.as_ref().unwrap_or(&m.screen).p() - mid).abs());
        let best = measured.into_iter().min_by(|a, b| key(a).partial_cmp(&key(b)).unwrap()).unwrap();
        cur = best;
    }
    Ok(path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn wilson_half_width_at_2000() {
        let s = Stats { games: 2000, hero_wins: 1000, ..Default::default() };
        assert!(s.half_width() <= 0.022, "{}", s.half_width());
        let (lo, hi) = wilson(0, 10);
        assert_eq!(lo, 0.0);
        assert!(hi > 0.2 && hi < 0.4);
    }

    #[test]
    fn seeds_are_stable_and_distinct() {
        assert_eq!(game_seeds(0, "a", 3), game_seeds(0, "a", 3));
        assert_ne!(game_seeds(0, "a", 3), game_seeds(0, "a", 4));
        assert_ne!(game_seeds(0, "a", 3), game_seeds(0, "b", 3));
        assert_ne!(game_seeds(0, "a", 3), game_seeds(1, "a", 3));
        assert!(game_seeds(7, "x", 9).1 <= i64::MAX as u64);
    }

    #[test]
    fn subsets_and_codes() {
        let types: Vec<String> = ["skeleton", "zombie", "ghoul"].iter().map(|s| s.to_string()).collect();
        assert_eq!(roster_code(&types, &[2, 0, 1]), "skeleton2+ghoul1");
        assert_eq!(roster_of(&types, &[1, 1, 0]), vec!["skeleton", "zombie"]);
        assert_eq!(roster_xp(&types, &[2, 0, 1]), 300);
        assert_eq!(subsets(&[2, 0, 1]), vec![vec![1, 0, 1], vec![2, 0, 0]]);
        assert!(subsets(&[1, 0, 0]).is_empty());
    }
}
