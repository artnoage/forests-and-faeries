//! natural20 tapes recorded on generated maps (`fixtures/g3/`, a sample of the
//! G3 run, GENERAL_ENV.md "G3 status") replay without divergence. They sit in
//! a subdirectory, so the fixture loops of the other suites (which read the
//! top level of `fixtures/`) are unchanged.

use std::collections::HashSet;
use std::path::Path;

use ember_rs::map::Grid;
use ember_rs::replay::{install_quiet_hook, replay_file, Outcome};

#[test]
fn natural20_tapes_on_generated_maps_replay() {
    install_quiet_hook();
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("fixtures").join("g3");
    let mut files: Vec<_> = std::fs::read_dir(&dir)
        .expect("fixtures/g3/")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == "jsonl"))
        .collect();
    files.sort();
    assert!(files.len() >= 8, "{} G3 fixtures", files.len());
    let mut families = HashSet::new();
    for f in &files {
        match replay_file(f) {
            Ok(Outcome::Match { .. }) => {}
            Ok(Outcome::Diverged(d)) => panic!("{} diverged: {d}", f.display()),
            Ok(_) => panic!("{}: incomplete, crashed or bad setup", f.display()),
            Err(e) => panic!("{}: {e}", f.display()),
        }
        let tape = ember_rs::tape::Tape::load(f).unwrap();
        let rows = tape.header.map.clone().expect("generated maps are in the header");
        let g = Grid::from_rows(&rows).unwrap();
        assert_eq!(g.components(), 1);
        families.insert(f.file_name().unwrap().to_string_lossy().split('_').next().unwrap().to_string());
    }
    assert_eq!(families.len(), 4, "{families:?}");
}
