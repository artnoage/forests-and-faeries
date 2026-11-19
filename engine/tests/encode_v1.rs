//! `ember-gen-v1` stays byte-identical on states without a hidden creature
//! (GENERAL_ENV.md "G8b Rust mirror status"): games on every encounter of
//! the two committed catalogs (`l2-undead-v1`: Mara + Ilyra against undead;
//! `g6-smoke`: both parties, the four maps), played through `batch::Game`
//! with external choosers on both teams, random canvas offsets, scores on.
//! Every decision and both final views are encoded; one FNV-1a chain per
//! game is compared with `tests/golden/encode-v1-catalog.txt`.
//!
//! The golden file was written by the G7 encoder (ember-rs `20a90d7`, before
//! the G8b changes: goblin content, Hide and the per-team visibility mask),
//! so a pass proves the observation of every such state is unchanged. Do not
//! re-bless it for a change that keeps `FEATURE_VERSION`; a new version gets
//! a new golden file.
//!
//! Since `ember-gen-v2` (the default) this runs the v1 schema
//! (`Version::V1`, the v2 arrays' prefixes without `creature_rel`), so a
//! pass also proves that v1 checkpoints still get their inputs.

use std::path::Path;
use std::sync::Arc;

use ember_rs::batch::{EnvConfig, EpisodeSpec, Game};
use ember_rs::catalog::{Catalog, Entry};
use ember_rs::content::ContentPool;
use ember_rs::encode::{Obs, Objective, Version, FEATURE_VERSION_V1};
use ember_rs::env::{Chooser, Controller};

const EXT: Controller = Controller::External;
const OBJ: Objective = Objective { standing_weight: 0.5, health: true };
/// External decisions per game (the step cap ends longer games, which then
/// get their final views too).
const MAX_STEPS: u64 = 160;
const CHOOSERS: [&str; 3] = ["eps:0.3", "uniform", "softmax:1"];

fn chain(h: u64, x: u64) -> u64 {
    let mut h = h;
    for b in x.to_le_bytes() {
        h ^= b as u64;
        h = h.wrapping_mul(0x0000_0100_0000_01b3);
    }
    h
}

/// (encounter id, decisions, digest) for one game of `entry`.
fn game_digest(entry: &Arc<Entry>, k: u64) -> (usize, u64) {
    let pool = ContentPool::global();
    let cfg = EnvConfig { scores: true, health: true, max_rounds: 30, standing_weight: 0.5, max_steps: MAX_STEPS };
    let spec = EpisodeSpec {
        encounter: entry.id.clone(),
        map_seed: 0,
        layout_seed: 1000 + k,
        dice_seed: 77_000 + 31 * k,
        offset_x: -1,
        offset_y: -1,
    };
    let mut game = Game::new(entry, &spec, [EXT, EXT], &[], &cfg, pool).unwrap();
    let mut pick = Chooser::parse(CHOOSERS[k as usize % CHOOSERS.len()], 5_000 + k).unwrap();
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    let mut n = 0;
    while !game.done() {
        let o = Obs::of_version(&game.env, None, game.offset, &OBJ, Version::V1).unwrap();
        h = chain(h, o.digest());
        let row = pick.pick(game.env.decision().unwrap());
        game.step(row, &cfg).unwrap();
        n += 1;
    }
    for team in [0u8, 1] {
        let o = Obs::of_version(&game.env, Some(team), game.offset, &OBJ, Version::V1).unwrap();
        h = chain(h, o.digest());
    }
    (n, h)
}

fn catalog_lines(name: &str, path: &Path) -> Vec<String> {
    let cat = Catalog::load(path, ContentPool::global()).unwrap();
    cat.entries
        .iter()
        .enumerate()
        .map(|(k, e)| {
            let (n, h) = game_digest(e, k as u64);
            format!("{name} {} {n} {h:016x}", e.id)
        })
        .collect()
}

/// Every encounter of both catalogs, one game each (about 50,000 decisions).
#[test]
fn v1_encoding_unchanged_on_catalog_states() {
    assert_eq!(FEATURE_VERSION_V1, "ember-gen-v1");
    assert_eq!(Version::V1.name(), FEATURE_VERSION_V1);
    let root = Path::new(env!("CARGO_MANIFEST_DIR"));
    let mut lines = catalog_lines("l2-undead-v1", &root.join("catalogs/l2-undead-v1.jsonl"));
    lines.extend(catalog_lines("g6-smoke", &root.join("catalogs/g6-smoke.jsonl")));
    let text = lines.join("\n") + "\n";
    let path = root.join("tests/golden/encode-v1-catalog.txt");
    if std::env::var("EMBER_BLESS_V1").is_ok() {
        std::fs::write(&path, &text).unwrap();
        return;
    }
    let want = std::fs::read_to_string(&path).expect("tests/golden/encode-v1-catalog.txt");
    let (got, want): (Vec<&str>, Vec<&str>) = (text.lines().collect(), want.lines().collect());
    assert_eq!(got.len(), want.len(), "number of catalog games");
    let differ: Vec<String> =
        got.iter().zip(want.iter()).filter(|(a, b)| a != b).map(|(a, b)| format!("  got  {a}\n  want {b}")).collect();
    assert!(differ.is_empty(), "{} of {} catalog games encode differently from ember-gen-v1:\n{}", differ.len(), got.len(),
            differ.iter().take(10).cloned().collect::<Vec<_>>().join("\n"));
}
