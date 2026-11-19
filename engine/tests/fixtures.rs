//! Replays every committed natural20 tape in `fixtures/` and requires zero
//! divergences. Regenerate or extend the set with `validation/record_batch.py`
//! (see docs/DESIGN.md §5).

use std::path::Path;

use ember_rs::replay::{install_quiet_hook, replay_file, Outcome};

#[test]
fn fixtures_replay_without_divergence() {
    install_quiet_hook();
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("fixtures");
    let mut files: Vec<_> = std::fs::read_dir(&dir)
        .expect("fixtures/ directory")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().map_or(false, |x| x == "jsonl"))
        .collect();
    files.sort();
    assert!(!files.is_empty(), "no fixture tapes");
    let mut failures = Vec::new();
    for f in &files {
        let name = f.file_name().unwrap().to_string_lossy().into_owned();
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
