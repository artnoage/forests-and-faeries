//! Generated maps (`mapgen.rs`, GENERAL_ENV.md §3, "G3 status"): determinism,
//! validity, the map JSON format (natural20 `EncounterSpec`), catalog rows on
//! generated maps, and games on them (played, encoded, recorded and
//! replayed). Parity with natural20 is checked by the tapes in
//! `fixtures/g3/` (`tests/mapgen_n20.rs`).

use std::collections::HashSet;

use ember_rs::batch::{EnvConfig, EpisodeSpec, Game};
use ember_rs::catalog::{Catalog, Entry};
use ember_rs::content::ContentPool;
use ember_rs::encode::Obs;
use ember_rs::env::{Chooser, Controller};
use ember_rs::layout::{any_hero_sees_monster, auto_place, TRIES};
use ember_rs::mapgen::{self, check, cut_squares, generate, load_map_json, Cut, Family, GenConfig, FAMILIES, LATEST, VERSIONS};
use ember_rs::map::{Grid, MAX_SIDE};
use ember_rs::replay::{install_quiet_hook, replay_tape, Outcome};
use ember_rs::spec::EncounterSpec;
use serde_json::{json, Value};

fn digest(rows: &[String]) -> u64 {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for r in rows {
        for b in r.bytes().chain(std::iter::once(b'\n')) {
            h ^= b as u64;
            h = h.wrapping_mul(0x0100_0000_01b3);
        }
    }
    h
}

fn family_digest(f: Family, version: u32, seeds: std::ops::Range<u64>) -> u64 {
    let cfg = GenConfig::for_family(f).with_version(version).unwrap();
    let mut h: u64 = 0;
    for s in seeds {
        let m = generate(f, s, &cfg).unwrap();
        h = h.rotate_left(7) ^ digest(m.rows());
    }
    h
}

/// The generators' output is pinned per version: a change here means a new
/// generator version (`mapgen::VERSIONS`), since catalogs and tapes name maps
/// by (generator, seed). The maps themselves stay valid: rows are inline.
/// v1 is the G3 output (`fixtures/g3/`, the G3 run); v2 the generators
/// without cut squares.
#[test]
fn generators_are_pinned() {
    let got: Vec<(String, u64)> = VERSIONS
        .iter()
        .flat_map(|&v| FAMILIES.iter().map(move |&f| (f.generator(v), family_digest(f, v, 0..16))))
        .collect();
    let want: Vec<(String, u64)> = [
        ("open/v1", 12302391009169463302),
        ("pillars/v1", 15541115616834518895),
        ("rooms/v1", 2900849407915039838),
        ("caves/v1", 11769192000905542942),
        ("open/v2", 11834410013540810344),
        ("pillars/v2", 10126246486121226),
        ("rooms/v2", 17704151671270110378),
        ("caves/v2", 15045612909912577589),
    ]
    .iter()
    .map(|&(g, d)| (g.to_string(), d))
    .collect();
    assert_eq!(got, want, "generator output changed: add a version to mapgen::VERSIONS and pin it");
    assert_eq!(GenConfig::for_family(Family::Rooms).version, LATEST);
}

/// The v1 map names and `ember` blocks are those of G3 (its files are in
/// the G3 run directory); later versions carry the version in the name.
#[test]
fn version_names() {
    let v1 = GenConfig::for_family(Family::Rooms).with_version(1).unwrap();
    let m = generate(Family::Rooms, 17, &v1).unwrap();
    assert_eq!(m.name, "gen-rooms-000017");
    assert_eq!(m.ember()["generator"], "rooms/v1");
    assert!(m.params.get("repair").is_none());
    let m = generate(Family::Caves, 17, &GenConfig::for_family(Family::Caves)).unwrap();
    assert_eq!(m.name, format!("gen-caves-v{LATEST}-000017"));
    assert_eq!(m.ember()["generator"], format!("caves/v{LATEST}"));
    assert!(m.params["repair"]["done"].as_bool().unwrap());
    assert!(GenConfig::for_family(Family::Open).with_version(9).is_err());
    assert_eq!(Family::parse_generator("rooms/v2"), Some((Family::Rooms, 2)));
    assert_eq!(Family::parse_generator("rooms/v9"), None);
    assert_eq!(Family::parse_generator("halls/v1"), None);
}

#[test]
fn generation_is_deterministic_and_seeds_differ() {
    for (f, v) in VERSIONS.iter().flat_map(|&v| FAMILIES.map(|f| (f, v))) {
        let cfg = GenConfig::for_family(f).with_version(v).unwrap();
        let mut distinct = HashSet::new();
        for s in 0..60u64 {
            let a = generate(f, s, &cfg).unwrap();
            let b = generate(f, s, &cfg).unwrap();
            assert_eq!(a.rows(), b.rows(), "{} seed {s}", f.name());
            assert_eq!(a.params, b.params);
            assert_eq!(a.attempt, b.attempt);
            assert_eq!(a.to_json_line(), b.to_json_line());
            distinct.insert(a.rows().to_vec());
        }
        assert!(distinct.len() >= 58, "{}: only {} distinct maps in 60 seeds", f.generator(v), distinct.len());
    }
    // families draw independent streams
    let cfg = GenConfig::for_family(Family::Open).with_size(Some((14, 24)), Some((14, 24))).unwrap();
    let rooms = generate(Family::Rooms, 5, &GenConfig::for_family(Family::Rooms)).unwrap();
    assert_ne!(generate(Family::Open, 5, &cfg).unwrap().rows(), rooms.rows());
}

/// Every map passes the checks: at most 32x32, walls only, one floor
/// component under the A* neighbour rule, the family's floor ratio and
/// openness band, zone layouts with and without sight for the largest
/// rosters.
#[test]
fn generated_maps_are_valid() {
    for (f, v) in VERSIONS.iter().flat_map(|&v| FAMILIES.map(|f| (f, v))) {
        let cfg = GenConfig::for_family(f).with_version(v).unwrap();
        let (band_lo, band_hi) = ember_rs::map::openness_band(f.name()).unwrap();
        for s in 0..120u64 {
            let m = generate(f, s, &cfg).unwrap();
            let g = &m.grid;
            assert!(g.w as usize <= MAX_SIDE && g.h as usize <= MAX_SIDE);
            assert!(g.w >= mapgen::MIN_SIDE && g.h >= mapgen::MIN_SIDE);
            assert!(g.w <= cfg.width.1 && g.h <= cfg.height.1, "{}", m.name);
            if f != Family::Caves {
                assert!(g.w >= cfg.width.0 && g.h >= cfg.height.0, "{}", m.name);
            }
            assert!(m.rows().iter().all(|r| r.chars().all(|c| c == 'H' || c == '.')));
            assert_eq!(g.components(), 1, "{}", m.name);
            let st = g.measure().unwrap();
            assert_eq!(st, m.stats);
            assert!(st.floor_ratio >= f.min_floor_ratio());
            assert!(st.openness >= band_lo && st.openness <= band_hi, "{} {}", m.name, st.openness);
            if f != Family::Caves {
                // the general §3.3 rule (floor ratio 0.55) holds too
                g.validate(f.name()).unwrap();
            }
            // the layout check, independently: largest roster, both sight rules
            let sides: Vec<u8> = [0u8; 3].into_iter().chain([1u8; 9]).collect();
            for sight in [false, true] {
                let (pos, _) = auto_place(g, &sides, &vec![None; 12], s + 100, sight, TRIES)
                    .unwrap_or_else(|e| panic!("{} sight {sight}: {e}", m.name));
                let opt: Vec<Option<(i32, i32)>> = pos.iter().copied().map(Some).collect();
                assert!(!sight || any_hero_sees_monster(g, &sides, &opt));
            }
            assert_eq!(check(g, f, &cfg).unwrap(), st);
            if v >= 2 {
                assert_eq!(cut_squares(g), vec![], "{}", m.name);
                // independently: every single blocked floor square leaves the
                // rest of the floor 4-connected
                assert!(single_blocks_never_split(g), "{}", m.name);
            }
        }
    }
}

/// Brute force: block each floor square in turn and flood the rest of the
/// floor under 4-adjacency (the squares a hero reaches one step at a time
/// when that square holds a corpse).
fn single_blocks_never_split(g: &Grid) -> bool {
    let floor: Vec<(i32, i32)> = (0..g.h).flat_map(|y| (0..g.w).map(move |x| (x, y))).filter(|&(x, y)| !g.is_wall(x, y)).collect();
    for &b in &floor {
        let start = *floor.iter().find(|&&p| p != b).unwrap();
        let mut seen = HashSet::from([start, b]);
        let mut stack = vec![start];
        while let Some((x, y)) = stack.pop() {
            for q in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)] {
                if !g.is_wall(q.0, q.1) && seen.insert(q) {
                    stack.push(q);
                }
            }
        }
        if seen.len() != floor.len() {
            return false;
        }
    }
    true
}

/// Cut squares on hand-made floors: a one-square doorway and a nook are cut
/// squares (with the size of what they cut off); a two-square doorway is not.
#[test]
fn cut_squares_by_hand() {
    let g = |rows: &[&str]| Grid::from_rows(rows).unwrap();
    let one = g(&["...H...", "...H...", ".......", "...H..."]);
    // the door and the squares on either side of it
    assert_eq!(cut_squares(&one), vec![Cut { x: 2, y: 2, piece: 11 }, Cut { x: 3, y: 2, piece: 12 }, Cut { x: 4, y: 2, piece: 11 }]);
    let two = g(&["...H...", ".......", ".......", "...H..."]);
    assert_eq!(cut_squares(&two), vec![]);
    // a one-square nook behind (2, 1); and a corridor of single squares
    let nook = g(&["HH.HH", ".....", "....."]);
    assert_eq!(cut_squares(&nook), vec![Cut { x: 2, y: 1, piece: 1 }]);
    // two 2x2 rooms joined by a corridor: every corridor square is a cut
    let corridor = g(&["..HHH..", "......."]);
    let cuts = cut_squares(&corridor);
    assert_eq!(cuts.iter().map(|c| (c.x, c.y, c.piece)).collect::<Vec<_>>(), vec![(1, 1, 3), (2, 1, 4), (3, 1, 5), (4, 1, 4), (5, 1, 3)]);
    assert!(!single_blocks_never_split(&corridor) && single_blocks_never_split(&two));
    // a diagonal touch is not a passage (the A* rule makes it one component
    // only through a free orthogonal)
    let diag = g(&["..H", "..H", "HH.", "HH."]);
    assert_eq!(diag.components(), 2);
}

#[test]
fn size_cap_and_ranges() {
    for (f, v) in VERSIONS.iter().flat_map(|&v| FAMILIES.map(|f| (f, v))) {
        let cfg = GenConfig::for_family(f).with_version(v).unwrap();
        assert!(cfg.clone().with_size(Some((10, 33)), None).is_err());
        assert!(cfg.clone().with_size(None, Some((40, 40))).is_err());
        // the cap itself works
        let big = cfg.with_size(Some((32, 32)), Some((32, 32))).unwrap();
        let m = generate(f, 1, &big).unwrap();
        assert!(m.grid.w <= 32 && m.grid.h <= 32);
        if f != Family::Caves {
            assert_eq!((m.grid.w, m.grid.h), (32, 32));
        }
        assert!(m.ember()["size_range"].is_object());
    }
    // a map above the cap never loads
    let wide = vec![".".repeat(33); 3];
    assert!(Grid::from_rows(&wide).is_err());
}

/// The map file is a natural20 `EncounterSpec` (format 1) with only its map;
/// it round-trips, and catalog rows take its `map` object inline.
#[test]
fn map_json_format() {
    let pool = ContentPool::global();
    for f in FAMILIES {
        let m = generate(f, 7, &GenConfig::for_family(f)).unwrap();
        let line = m.to_json_line();
        let v: Value = serde_json::from_str(&line).unwrap();
        assert_eq!(v["version"], 1);
        assert_eq!(v["heroes"], json!([]));
        assert_eq!(v["monsters"], json!([]));
        assert_eq!(v["map"]["name"], m.name.as_str());
        assert_eq!(v["map"]["ember"]["family"], f.name());
        assert_eq!(v["map"]["ember"]["generator"], format!("{}/v{LATEST}", f.name()));
        assert_eq!(v["map"]["ember"]["seed"], 7);
        let spec = EncounterSpec::from_json(&line).unwrap();
        assert_eq!(&spec.map.rows, m.rows());
        assert!(spec.validate(pool).is_err(), "a map without creatures is not a fight");
        let doc = load_map_json(&line).unwrap();
        assert_eq!(doc.family, Some(f));
        assert_eq!(doc.version, Some(LATEST));
        assert_eq!(doc.grid.rows, m.rows());
        assert_eq!(doc.stats, m.stats);
        // as a catalog row
        let row = json!({"id": format!("t-{}", f.name()), "map": v["map"], "party": ["mara", "ilyra"],
                         "roster": ["zombie", "skeleton", "zombie"], "layout": {"rule": "zone", "require_sight": true}});
        let e = Entry::from_json(&row, pool).unwrap();
        assert_eq!(e.map_name.as_deref(), Some(m.name.as_str()));
        assert_eq!(e.rows, m.rows());
        for seed in 0..8 {
            let placed = e.place(seed).unwrap();
            let s: EncounterSpec = serde_json::from_value(e.spec_json(&placed)).unwrap();
            let enc = s.validate(pool).unwrap();
            assert_eq!(enc.units, ["mara", "ilyra", "zombie-1", "skeleton-1", "zombie-2"]);
        }
    }
    // a map file whose family checks fail is rejected
    let m = generate(Family::Open, 3, &GenConfig::for_family(Family::Open)).unwrap();
    let mut v = m.spec_json();
    v["map"]["ember"]["family"] = json!("rooms");
    assert!(load_map_json(&v.to_string()).is_err(), "an open map is not a rooms map (openness band)");
    let mut v = m.spec_json();
    v["map"]["rows"] = json!(["..H..", "..H..", "..H.."]);
    assert!(load_map_json(&v.to_string()).is_err(), "two floor components");
    // a v1 rooms map with a one-square gap passes the v1 checks, not v2's
    let v1 = GenConfig::for_family(Family::Rooms).with_version(1).unwrap();
    let m = (0..40).map(|s| generate(Family::Rooms, s, &v1).unwrap()).find(|m| !cut_squares(&m.grid).is_empty()).unwrap();
    let doc = load_map_json(&m.to_json_line()).unwrap();
    assert_eq!(doc.version, Some(1));
    let mut v = m.spec_json();
    v["map"]["ember"]["generator"] = json!("rooms/v2");
    let err = load_map_json(&v.to_string()).err().unwrap();
    assert!(err.contains("cut squares"), "{err}");
    // no generator: v1; a generator of another family: an error
    let mut v = m.spec_json();
    v["map"]["ember"].as_object_mut().unwrap().remove("generator");
    assert_eq!(load_map_json(&v.to_string()).unwrap().version, Some(1));
    v["map"]["ember"]["generator"] = json!("caves/v1");
    assert!(load_map_json(&v.to_string()).is_err());
}

/// Games on generated maps through the trainer's code path: native and
/// external teams play to the end, every observation encodes, and each game
/// records to a tape that replays.
#[test]
fn games_on_generated_maps() {
    install_quiet_hook();
    let pool = ContentPool::global();
    let mut rows = Vec::new();
    for f in FAMILIES {
        for s in 0..3u64 {
            let m = generate(f, s, &GenConfig::for_family(f)).unwrap();
            let (party, roster): (&[&str], &[&str]) = if s % 2 == 0 {
                (&["mara", "ilyra"], &["ghoul", "skeleton", "zombie"])
            } else {
                (&["guy", "elion", "curogana"], &["skeleton", "skeleton", "shadow", "specter"])
            };
            rows.push(json!({"id": format!("{}-{s}", m.name), "map": m.map_json(), "party": party, "roster": roster,
                             "layout": {"rule": "zone", "require_sight": s != 1}, "max_rounds": 30}));
        }
    }
    let cat = Catalog::from_rows(&rows, pool).unwrap();
    let cfg = EnvConfig { scores: true, health: true, max_rounds: 30, standing_weight: 0.5, max_steps: 4096 };
    for (k, e) in cat.entries.iter().enumerate() {
        let spec = EpisodeSpec { encounter: e.id.clone(), map_seed: 0, layout_seed: k as u64, dice_seed: 1000 + k as u64, offset_x: -1, offset_y: -1 };
        let ctrl = match k % 3 {
            0 => [Controller::External, Controller::Native],
            1 => [Controller::Native, Controller::External],
            _ => [Controller::External, Controller::External],
        };
        let mut game = Game::new(e, &spec, ctrl, &[], &cfg, pool).unwrap();
        let mut pick = Chooser::parse(if k % 2 == 0 { "uniform" } else { "eps:0.3" }, k as u64).unwrap();
        let obj = cfg.objective();
        while !game.done() {
            let mut obs = Obs::new(game.legal().max(1));
            game.encode(None, &obj, &mut obs.slot()).unwrap();
            let row = pick.pick(game.env.decision().unwrap());
            game.step(row, &cfg).unwrap();
        }
        let tape = game.record(pool).unwrap();
        match replay_tape(&tape) {
            Outcome::Match { .. } => {}
            Outcome::Diverged(d) => panic!("{} diverged: {d}", e.id),
            Outcome::Incomplete { consumed, remaining } => panic!("{}: incomplete {consumed} {remaining}", e.id),
            Outcome::Crashed(x) | Outcome::Setup(x) => panic!("{}: {x}", e.id),
        }
        // and the all-native game, through `ember balance`
        let r = ember_rs::balance::play(e, 3, k as u64, 30, pool).unwrap();
        let again = ember_rs::balance::play(e, 3, k as u64, 30, pool).unwrap();
        assert_eq!(format!("{r:?}"), format!("{again:?}"));
    }
}
