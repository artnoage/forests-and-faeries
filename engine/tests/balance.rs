//! `ember balance` (GENERAL_ENV.md §7, "G7 status"): native-vs-native
//! measurement and the roster search.

use std::sync::Arc;

use ember_rs::balance::{self, measure, measure_many, play, search_map, tune, MapArg, SearchCfg, Stats};
use ember_rs::catalog::Entry;
use ember_rs::content::ContentPool;
use ember_rs::mapgen::{generate, Family, GenConfig};
use serde_json::json;

fn entry(map: &str, roster: &[&str], sight: bool) -> Arc<Entry> {
    let row = serde_json::json!({"id": format!("{map}-test-{}", roster.join("+")), "map": map, "party": ["mara", "ilyra"],
                                 "roster": roster, "layout": balance::zone_layout(sight), "max_rounds": 30});
    Arc::new(Entry::from_json(&row, ContentPool::global()).unwrap())
}

#[test]
fn results_do_not_depend_on_threads_or_batching() {
    let pool = ContentPool::global();
    let a = entry("vault", &["skeleton", "skeleton", "zombie"], true);
    let b = entry("hall_32x32", &["ghoul", "shadow"], false);
    let one = rayon::ThreadPoolBuilder::new().num_threads(1).build().unwrap();
    let four = rayon::ThreadPoolBuilder::new().num_threads(4).build().unwrap();
    let s1 = one.install(|| measure(&a, 0..40, 7, 30, pool));
    let s4 = four.install(|| measure_many(&[b.clone(), a.clone()], &[0..10, 0..40], 7, 30, pool));
    assert_eq!(s1, s4[1]);
    assert_eq!(s1.games, 40);
    assert_eq!(s1.errors, 0);
    assert_eq!(s1.hero_wins + s1.monster_wins + s1.draws + s1.horizon, 40);
    // a later stage extends an earlier one
    let mut ab = measure(&a, 0..15, 7, 30, pool);
    ab.merge(&measure(&a, 15..40, 7, 30, pool));
    assert_eq!(ab, s1);
    // one game is reproducible and the seed base matters
    assert_eq!(play(&a, 7, 3, 30, pool).unwrap(), play(&a, 7, 3, 30, pool).unwrap());
    let other: Vec<_> = (0..20).map(|k| play(&a, 8, k, 30, pool).unwrap()).collect();
    let same: Vec<_> = (0..20).map(|k| play(&a, 7, k, 30, pool).unwrap()).collect();
    assert_ne!(other, same);
}

#[test]
fn horizon_counts_as_truncation() {
    let pool = ContentPool::global();
    let row = serde_json::json!({"id": "h", "map": "hall_32x32", "party": ["mara", "ilyra"], "roster": vec!["zombie"; 6],
                                 "layout": balance::zone_layout(true)});
    let e = Arc::new(Entry::from_json(&row, pool).unwrap());
    let s: Stats = measure(&e, 0..30, 0, 1, pool);
    // a row's own max_rounds wins over the measurement's
    assert_eq!(measure(&entry("hall_32x32", &["zombie"; 6], true), 0..30, 0, 1, pool).horizon, measure(&entry("hall_32x32", &["zombie"; 6], true), 0..30, 0, 30, pool).horizon);
    // one round is never enough to eliminate six zombies or both heroes
    assert_eq!(s.horizon, 30);
    assert_eq!(s.hero_wins + s.monster_wins, 0);
    assert_eq!(s.mean_rounds(), 1.0);
    let row = s.annotate(&serde_json::json!({"id": "x"}), 0, &(0..30), 1);
    assert_eq!(row["truncation"], 1.0);
    assert_eq!(row["baseline"]["heroes"], 0.0);
}

#[test]
fn search_prunes_and_accepts_by_the_rules() {
    let pool = ContentPool::global();
    let types: Vec<String> = ["skeleton", "ghast", "wight"].iter().map(|s| s.to_string()).collect();
    let cfg = SearchCfg {
        party: vec!["mara".into(), "ilyra".into()],
        types,
        max_size: 3,
        max_per_type: 3,
        max_xp: None,
        min_xp: None,
        prior: None,
        max_candidates: 1000,
        screen_games: 40,
        refine_games: 80,
        screen_band: (0.25, 0.75),
        accept_band: (0.4, 0.6),
        screen_trunc: 0.1,
        max_trunc: 0.05,
        max_half_width: 1.0,
        layout: balance::zone_layout(true),
        max_rounds: 30,
        row_max_rounds: true,
        seed: 1,
    };
    let found = search_map("room_12x10", &cfg, pool, |_| {}).unwrap();
    let dead: Vec<&balance::Measured> = found.iter().filter(|m| m.screen.p() < cfg.screen_band.0).collect();
    for m in &found {
        // every one-smaller sub-roster of a measured roster was alive
        for i in 0..m.counts.len() {
            if m.counts[i] > 0 && m.counts.iter().map(|&n| n as u32).sum::<u32>() > 1 {
                let mut s = m.counts.clone();
                s[i] -= 1;
                assert!(!dead.iter().any(|d| d.counts == s), "{:?} has a dead sub-roster {s:?}", m.counts);
            }
        }
        if m.accepted {
            let s = m.refined.as_ref().unwrap();
            assert_eq!(s.games, 80);
            assert!(s.p() >= 0.4 && s.p() <= 0.6 && s.truncation() < 0.05);
        }
        let row = m.to_json(&cfg);
        Entry::from_json(&row, pool).unwrap();
        assert_eq!(row["layout"]["require_sight"], true);
        assert_eq!(row["max_rounds"], 30);
    }
    assert!(found.len() >= 3);
    // tune walks from a single skeleton by adding monsters
    let path = tune("room_12x10", &[1, 0, 0], &cfg, 6, pool).unwrap();
    assert!(path.len() >= 2);
    assert!(path[1].counts.iter().map(|&n| n as u32).sum::<u32>() == 2);

    // a generated map given inline (an `ember mapgen gen` file's `map`):
    // rows carry the map, ids its name, and the games are those of the same
    // rows built by hand
    let gm = generate(Family::Caves, 4, &GenConfig::for_family(Family::Caves)).unwrap();
    let arg = MapArg::from_value(&gm.map_json()).unwrap();
    assert_eq!(arg.label, gm.name);
    assert!(MapArg::from_value(&json!({"rows": gm.rows()})).is_err(), "an inline map needs a name");
    let small = SearchCfg { max_size: 2, ..cfg.clone() };
    let found = search_map(&arg, &small, pool, |_| {}).unwrap();
    assert!(found.len() >= 3);
    for m in &found {
        let row = m.to_json(&small);
        assert_eq!(row["map"], gm.map_json());
        assert!(row["id"].as_str().unwrap().starts_with(&format!("{}-mara+ilyra-", gm.name)));
        let e = Arc::new(Entry::from_json(&row, pool).unwrap());
        assert_eq!(e.rows, gm.rows());
        let again = measure(&e, 0..small.screen_games, small.seed, 30, pool);
        assert_eq!(again, m.screen);
    }
    let path = tune(&arg, &[1, 0, 0], &small, 2, pool).unwrap();
    assert_eq!(path[0].row["map"], gm.map_json());

    // --min-xp with a prior (types skeleton, ghast, wight weigh 1, 3, 5;
    // floor 4): skeleton, ghast and skeleton2 are assumed alive and never
    // measured; wight (5) and skeleton + ghast (4) are screened, with the
    // same games as in the full search
    let prior = SearchCfg { prior: Some(vec![1, 3, 5]), min_xp: Some(4), max_size: 3, ..cfg.clone() };
    let floor = search_map("room_12x10", &prior, pool, |_| {}).unwrap();
    let full = search_map("room_12x10", &SearchCfg { max_size: 3, ..cfg.clone() }, pool, |_| {}).unwrap();
    assert!(floor.iter().all(|m| balance::search_weight(&prior, &m.counts) >= 4), "nothing below --min-xp is screened");
    for below in [vec![1u8, 0, 0], vec![0, 1, 0], vec![2, 0, 0]] {
        assert!(!floor.iter().any(|m| m.counts == below));
    }
    for above in [vec![0u8, 0, 1], vec![1, 1, 0]] {
        assert!(floor.iter().any(|m| m.counts == above), "{above:?} screened");
    }
    for m in &floor {
        if let Some(f) = full.iter().find(|f| f.counts == m.counts) {
            assert_eq!(f.screen, m.screen, "same games for the same roster");
        }
    }

    // a fixed pool (--rosters): the search's rows, games and verdicts for
    // the same rosters, in the pool's order
    let some: Vec<balance::Counts> = full.iter().rev().take(4).map(|m| m.counts.clone()).collect();
    let pooled = balance::screen_pool("room_12x10", &some, &cfg, pool, |_| {}).unwrap();
    assert_eq!(pooled.len(), some.len());
    for (m, c) in pooled.iter().zip(&some) {
        assert_eq!(&m.counts, c);
        let f = full.iter().find(|f| &f.counts == c).unwrap();
        assert_eq!(m.to_json(&cfg), f.to_json(&cfg));
    }
}
