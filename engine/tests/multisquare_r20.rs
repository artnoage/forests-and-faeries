//! Replays every committed rule-20 multi-square Natural20 tape in `fixtures/r20/`
//! (pinned to `NATURAL20_COMMIT_RULE_20`) and requires zero divergences.

use std::path::Path;

use ember_rs::batch::NATURAL20_COMMIT_RULE_20;
use ember_rs::content::ContentPool;
use ember_rs::replay::{check_stats, install_quiet_hook, replay_file, Outcome};
use ember_rs::tape::Tape;

#[test]
fn multisquare_r20_fixtures_replay_without_divergence() {
    install_quiet_hook();
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("fixtures").join("r20");
    let mut files: Vec<_> = std::fs::read_dir(&dir)
        .expect("fixtures/r20/ directory")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == "jsonl"))
        .collect();
    files.sort();
    assert!(files.len() >= 6, "expected >= 6 rule-20 fixtures, got {}", files.len());
    let pool = ContentPool::global();
    let pinned = NATURAL20_COMMIT_RULE_20;
    let mut failures = Vec::new();
    for f in &files {
        let name = f.file_name().unwrap().to_string_lossy().into_owned();
        let tape = Tape::load(f).unwrap_or_else(|e| panic!("{name}: {e}"));
        assert_eq!(tape.header.version, 20, "{name}: expected rule version 20");
        assert_eq!(tape.header.n20_commit, pinned, "{name}: expected pinned commit {pinned}");
        check_stats(&tape.header, pool).unwrap_or_else(|e| panic!("{name}: {e}"));
        match replay_file(f) {
            Ok(Outcome::Match { .. }) => {}
            Ok(Outcome::Diverged(d)) => failures.push(format!("{name}: {d}")),
            Ok(Outcome::Incomplete { consumed, remaining }) => {
                failures.push(format!("{name}: stopped after {consumed} events, {remaining} left"))
            }
            Ok(Outcome::Crashed(m)) => failures.push(format!("{name}: crashed: {m}")),
            Ok(Outcome::Setup(m)) => failures.push(format!("{name}: setup: {m}")),
            Err(e) => failures.push(format!("{name}: {e}")),
        }
    }
    assert!(failures.is_empty(), "{} of {} tapes failed:\n{}", failures.len(), files.len(), failures.join("\n"));
}
