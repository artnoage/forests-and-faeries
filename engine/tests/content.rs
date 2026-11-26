//! Content and licence guards (docs/GENERAL_ENV.md §2.1, §2.6), the
//! exported content against every fixture tape's header `stats`, and the
//! `Fight: Clone` determinism check.

use std::collections::BTreeSet;
use std::path::{Path, PathBuf};

use ember_rs::content::{embedded_files, ContentPool};
use ember_rs::engine::Fight;
use ember_rs::map::Grid;
use ember_rs::replay::check_stats;
use ember_rs::tape::{Placement, Tape};
use ember_rs::trace::Trace;

fn repo() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
}

fn allowlist() -> BTreeSet<String> {
    std::fs::read_to_string(repo().join("content/SRD_ALLOWLIST"))
        .unwrap()
        .lines()
        .map(|l| l.split('#').next().unwrap().trim().to_string())
        .filter(|l| !l.is_empty())
        .collect()
}

fn is_hex(s: &str, len: usize) -> bool {
    s.len() == len && s.bytes().all(|b| b.is_ascii_hexdigit())
}

/// Every file under `content/` is a known kind; every content file is SRD
/// 5.2.1, allowlisted, and carries its licence, attribution and provenance.
#[test]
fn public_pack_licence_and_provenance() {
    let allowed = allowlist();
    let mut seen = BTreeSet::new();
    for (path, text) in embedded_files() {
        if *path == "vocab.json" || *path == "SRD_ALLOWLIST" {
            continue;
        }
        if let Some(name) = path.strip_prefix("maps/") {
            assert!(name.ends_with(".yml") || name == "MANIFEST.json", "unexpected file content/{path}");
            continue;
        }
        let Some(file) = path.strip_prefix("srd/") else {
            panic!("content/{path}: only content/srd/ (the public pack), content/maps/, vocab.json and SRD_ALLOWLIST belong here; private content lives outside the repository")
        };
        assert!(file.ends_with(".json") && !file.contains('/'), "content/{path}");
        let doc: serde_json::Value = serde_json::from_str(text).unwrap();
        let id = doc["id"].as_str().unwrap();
        assert!(allowed.contains(id), "content/{path}: {id} is not in content/SRD_ALLOWLIST");
        assert_eq!(doc["source"], "srd-5.2.1", "content/{path}");
        assert_eq!(doc["licence"], "CC-BY-4.0", "content/{path}");
        let attribution = doc["attribution"].as_str().unwrap();
        assert!(attribution.contains("System Reference Document 5.2.1") && attribution.contains("Creative Commons"), "content/{path}");
        let prov = &doc["provenance"];
        if prov["exporter"] == "srd-5.2.1-direct" {
            assert_eq!(prov["natural20_commit"], "srd-5.2.1-direct", "content/{path}");
            assert!(
                matches!(id, "vesper" | "vesper_l1" | "vesper_l2"),
                "content/{path}: unexpected direct SRD provenance without Natural20 export"
            );
        } else {
            assert!(is_hex(prov["natural20_commit"].as_str().unwrap(), 40), "content/{path}: natural20 commit");
            assert_eq!(prov["exporter"], "validation/export_content.py");
            let files = prov["files"].as_object().unwrap();
            assert!(!files.is_empty(), "content/{path}: no source files");
            for (f, sha) in files {
                assert!(is_hex(sha.as_str().unwrap(), 64), "content/{path}: {f}");
            }
        }
        seen.insert(id.to_string());
    }
    assert_eq!(seen, allowed, "every allowlisted id is exported");
}

/// The repository never holds private content or private tapes.
#[test]
fn no_private_content_in_repository() {
    let gitignore = std::fs::read_to_string(repo().join(".gitignore")).unwrap();
    for dir in ["content-private/", "tapes-private/"] {
        assert!(gitignore.lines().any(|l| l.trim() == dir), ".gitignore lacks {dir}");
    }
    fn walk(dir: &Path, out: &mut Vec<PathBuf>) {
        for e in std::fs::read_dir(dir).unwrap().flatten() {
            let p = e.path();
            if p.is_dir() {
                walk(&p, out);
            } else {
                out.push(p);
            }
        }
    }
    let mut files = Vec::new();
    walk(&repo().join("content"), &mut files);
    for f in files {
        let text = std::fs::read_to_string(&f).unwrap_or_default();
        assert!(!text.contains("\"source\": \"private\""), "{} is private content", f.display());
    }
    let vocab: serde_json::Value =
        serde_json::from_str(embedded_files().iter().find(|(p, _)| *p == "vocab.json").unwrap().1).unwrap();
    assert_eq!(vocab["range"], serde_json::json!([0, 199]));
    for (section, table) in vocab["sections"].as_object().unwrap() {
        for (name, id) in table.as_object().unwrap() {
            assert!(id.as_u64().unwrap() < 200, "public vocab id {section}.{name} = {id} in the private range");
        }
    }
}

/// A private pack takes ids 200-255 from its own vocabulary and never
/// renumbers public ids; a private pack using public ids is refused.
#[test]
fn private_pack_uses_the_reserved_range() {
    let dir = std::env::temp_dir().join(format!("ember-private-pack-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    let skeleton = embedded_files().iter().find(|(p, _)| *p == "srd/skeleton.json").unwrap().1;
    let mut doc: serde_json::Value = serde_json::from_str(skeleton).unwrap();
    doc["id"] = "testbones".into();
    doc["source"] = "private".into();
    std::fs::write(dir.join("testbones.json"), serde_json::to_string(&doc).unwrap()).unwrap();
    let vocab = |id: u16| {
        serde_json::json!({"schema": 1, "range": [200, 255], "sections": {"creatures": {"testbones": id}}}).to_string()
    };
    std::fs::write(dir.join("vocab.json"), vocab(200)).unwrap();
    let pool = ContentPool::load(&[dir.clone()]).unwrap();
    assert_eq!(pool.vocab.id("creatures", "testbones"), Some(200));
    assert_eq!(pool.vocab.id("creatures", "guy"), ContentPool::global().vocab.id("creatures", "guy"));
    assert!(pool.unit_tid("testbones-1").is_some());
    std::fs::write(dir.join("vocab.json"), vocab(3)).unwrap();
    assert!(ContentPool::load(&[dir.clone()]).is_err(), "a private id inside the public range");
    std::fs::remove_dir_all(&dir).unwrap();
}

/// The exported content equals natural20's derived numbers in the header of
/// every fixture tape (natural20 `unit_stats` at recording time).
#[test]
fn content_equals_fixture_stats() {
    let pool = ContentPool::global();
    let mut n = 0;
    for e in std::fs::read_dir(repo().join("fixtures")).unwrap().flatten() {
        let p = e.path();
        if p.extension().map_or(true, |x| x != "jsonl") {
            continue;
        }
        let tape = Tape::load(&p).unwrap();
        check_stats(&tape.header, pool).unwrap_or_else(|e| panic!("{}: {e}", p.display()));
        n += tape.header.units.len();
    }
    assert!(n > 100, "{n} units checked");
}

fn placements(list: &[(&str, i32, i32)]) -> (Vec<String>, Vec<Placement>) {
    (
        list.iter().map(|(id, _, _)| id.to_string()).collect(),
        list.iter().map(|&(id, x, y)| Placement { id: id.into(), x, y }).collect(),
    )
}

/// A cloned fight continued with the same dice equals the original: the same
/// events (draws, decisions, actions, state digests) and the same outcome.
#[test]
fn cloned_fight_continues_identically() {
    let hall = ember_rs::map::builtin_map("hall_32x32").unwrap().unwrap();
    let cases: Vec<(std::sync::Arc<Grid>, Vec<(&str, i32, i32)>)> = vec![
        (
            Grid::ember_vault(),
            vec![("guy", 2, 4), ("elion", 3, 3), ("curogana", 2, 7), ("ghoul-1", 12, 3), ("wight-1", 12, 6), ("specter-1", 11, 4)],
        ),
        (
            hall.grid.clone(),
            vec![("guy", 3, 3), ("elion", 4, 3), ("curogana", 3, 5), ("skeleton-1", 27, 27), ("ghast-1", 26, 27), ("shadow-1", 27, 25)],
        ),
    ];
    for (grid, units) in cases {
        let (ids, pl) = placements(&units);
        for seed in 0..6u64 {
            let mut a = Fight::on_map(ContentPool::global(), grid.clone(), &ids, &pl, 50, Trace::recording(seed)).unwrap();
            a.start();
            for _ in 0..(3 + seed as usize * 2) {
                let mut next = a.clone();
                next.advance();
                if next.finished || next.round >= next.max_rounds {
                    break;
                }
                a = next;
            }
            let mut b = a.clone();
            let mark = a.trace.position();
            for f in [&mut a, &mut b] {
                while !f.finished && f.round < f.max_rounds {
                    f.advance();
                }
            }
            let (ea, eb) = (a.trace.recorded(), b.trace.recorded());
            assert!(ea.len() > mark, "the fight went on after the clone");
            let ja: Vec<String> = ea.iter().map(|e| serde_json::to_string(e).unwrap()).collect();
            let jb: Vec<String> = eb.iter().map(|e| serde_json::to_string(e).unwrap()).collect();
            assert_eq!(ja, jb, "seed {seed}");
            assert_eq!((a.winner, a.round, a.decisions), (b.winner, b.round, b.decisions));
        }
    }
}
