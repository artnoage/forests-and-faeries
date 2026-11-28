//! Replays every committed rule-22 Natural20 reference tape in `fixtures/r22/`
//! (pinned to `reference/NATURAL20_COMMIT`, fixing Entangle Difficult Terrain
//! duration through round r+10 before the caster's turn and sealed-diagonal
//! final-step `line_of_sight(..., inclusive=False)` in Natural20 N20-127)
//! and requires zero divergences.

use std::path::Path;

use ember_rs::batch::NATURAL20_COMMIT;
use ember_rs::content::ContentPool;
use ember_rs::replay::{check_stats, install_quiet_hook, replay_file, Outcome};
use ember_rs::tape::{Ev, Tape};

#[test]
fn rule22_entangle_and_sealed_diagonal_fixtures_replay_without_divergence() {
    install_quiet_hook();
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("fixtures").join("r22");
    let mut files: Vec<_> = std::fs::read_dir(&dir)
        .expect("fixtures/r22/ directory")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == "jsonl"))
        .collect();
    files.sort();
    assert!(files.len() >= 3, "expected >= 3 rule-22 fixtures, got {}", files.len());
    let pool = ContentPool::global();
    let pinned = NATURAL20_COMMIT.trim();
    let mut failures = Vec::new();
    let mut saw_r11_entangle_10ft = false;
    let mut saw_sealed_diag_reject = false;

    for f in &files {
        let name = f.file_name().unwrap().to_string_lossy().into_owned();
        let tape = Tape::load(f).unwrap_or_else(|e| panic!("{name}: {e}"));
        assert_eq!(tape.header.version, 22, "{name}: expected rule version 22");
        assert_eq!(tape.header.n20_commit, pinned, "{name}: expected pinned commit {pinned}");
        check_stats(&tape.header, pool).unwrap_or_else(|e| panic!("{name}: {e}"));

        if name.contains("entangle_mara_0164") {
            for ev in &tape.events {
                if let Ev::State(s) = ev {
                    if s.round == 11 {
                        let mara = s.units.iter().find(|u| u.id == "mara");
                        let dryad = s.units.iter().find(|u| u.id == "dryad-1");
                        if let (Some(m), Some(d)) = (mara, dryad) {
                            if m.pos == Some([20, 3]) && m.res[3] == 20 && d.conc.as_deref() == Some("entangle") {
                                saw_r11_entangle_10ft = true;
                            }
                        }
                    }
                }
            }
        }
        if name.contains("sealed_diag_pillars_000107") {
            let mut last_state: Option<&ember_rs::tape::StateDigest> = None;
            for ev in &tape.events {
                match ev {
                    Ev::State(s) => last_state = Some(s),
                    Ev::Dec { who, cands, ext, .. } if who == "curogana" => {
                        if let Some(s) = last_state {
                            let curo = s.units.iter().find(|u| u.id == "curogana");
                            let zomb = s.units.iter().find(|u| u.id == "zombie-1");
                            if let (Some(c), Some(z)) = (curo, zomb) {
                                if c.pos == Some([11, 6]) && z.pos == Some([12, 5]) {
                                    let legal = ext.as_ref().map(|e| &e.legal).unwrap_or(cands);
                                    assert!(
                                        !legal.iter().any(|a| a == "attack:quarterstaff:@12,5" || a == "attack:unarmed_attack:@12,5"),
                                        "{name}: blind melee across sealed diagonal must be absent: {legal:?}"
                                    );
                                    saw_sealed_diag_reject = true;
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
        }

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

    assert!(saw_r11_entangle_10ft, "expected r22_entangle_mara_0164 fixture to exercise round-11 Entangle 10-ft cost");
    assert!(saw_sealed_diag_reject, "expected r22_sealed_diag_pillars_000107 fixture to exercise sealed-diagonal rejection");
    assert!(failures.is_empty(), "{} of {} tapes failed:\n{}", failures.len(), files.len(), failures.join("\n"));
}
