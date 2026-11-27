//! `FightState::clone()`, `Fight::fork()`, and `legal_actions()` micro-benchmarks.

use std::hint::black_box;
use std::mem::size_of;
use std::sync::Arc;
use std::time::Instant;

use ember_core::{
    ContentDb, EncounterSpec, Fight, FightState, NoopSink, Observer, Placement, UnitState,
};

const ROOM_12X10: [&str; 10] = [
    "HHHHHHHHHHHH",
    "H..........H",
    "H..........H",
    "H...H..H...H",
    "H..........H",
    "H..........H",
    "H...H..H...H",
    "H..........H",
    "H..........H",
    "HHHHHHHHHHHH",
];

struct Case {
    name: &'static str,
    units: &'static [&'static str],
    placements: &'static [(&'static str, i16, i16)],
    map: Option<&'static [&'static str]>,
    seed: u64,
}

const CASES: [Case; 5] = [
    Case {
        name: "g8a_room_12x10_p_oa_ghast1_L01_s0",
        units: &["mara", "ilyra", "ghast-1"],
        placements: &[("mara", 1, 1), ("ilyra", 1, 2), ("ghast-1", 10, 2)],
        map: Some(&ROOM_12X10),
        seed: 127503819018,
    },
    Case {
        name: "c2p_hgt_mix_wight_3zomb_L01_s0",
        units: &["guy", "curogana", "wight-1", "zombie-1", "zombie-2", "zombie-3"],
        placements: &[
            ("guy", 12, 8),
            ("curogana", 2, 1),
            ("wight-1", 3, 8),
            ("zombie-1", 1, 10),
            ("zombie-2", 3, 10),
            ("zombie-3", 6, 3),
        ],
        map: None,
        seed: 18221619025,
    },
    Case {
        name: "oa_skel3_L00_s0",
        units: &["mara", "skeleton-1", "skeleton-2", "skeleton-3"],
        placements: &[
            ("mara", 2, 2),
            ("skeleton-1", 8, 2),
            ("skeleton-2", 8, 4),
            ("skeleton-3", 8, 6),
        ],
        map: Some(&ROOM_12X10),
        seed: 42,
    },
    Case {
        name: "oa_wight1_L00_s0",
        units: &["guy", "wight-1"],
        placements: &[("guy", 2, 2), ("wight-1", 9, 2)],
        map: Some(&ROOM_12X10),
        seed: 43,
    },
    Case {
        name: "s2p_mix_ghast_2ghoul_L02_s0",
        units: &["mara", "ghast-1", "ghoul-1", "ghoul-2"],
        placements: &[
            ("mara", 2, 2),
            ("ghast-1", 7, 2),
            ("ghoul-1", 8, 2),
            ("ghoul-2", 8, 3),
        ],
        map: None,
        seed: 16645738024,
    },
];

pub fn run_bench(db: Arc<ContentDb>, iters: usize) {
    println!(
        "footprint: size_of::<FightState>() = {} bytes, size_of::<UnitState>() = {} bytes",
        size_of::<FightState>(),
        size_of::<UnitState>(),
    );
    println!("iters = {iters}");
    for c in &CASES {
        let spec = EncounterSpec {
            units: c.units.iter().map(|s| (*s).to_string()).collect(),
            placements: c
                .placements
                .iter()
                .map(|&(id, x, y)| Placement { id: id.to_string(), x, y })
                .collect(),
            map_rows: c.map.map(|rows| rows.iter().map(|r| (*r).to_string()).collect()),
            max_rounds: 50,
        };
        let mut fight = Fight::new(db.clone(), &spec, c.seed, c.seed as u128).expect("bench fight setup");
        let mut sink = NoopSink;
        fight.start(&mut sink).expect("bench fight start");

        for _ in 0..2000 {
            let s = black_box(fight.state_snapshot().clone());
            black_box(s);
            let f = black_box(fight.fork(None));
            black_box(f);
        }

        let t0 = Instant::now();
        for _ in 0..iters {
            let s = black_box(fight.state_snapshot().clone());
            black_box(s);
        }
        let dt_state = t0.elapsed();
        let us_state = dt_state.as_secs_f64() * 1e6 / iters as f64;
        let rate_state = iters as f64 / dt_state.as_secs_f64();

        let t1 = Instant::now();
        for _ in 0..iters {
            let f = black_box(fight.fork(None));
            black_box(f);
        }
        let dt_fork = t1.elapsed();
        let us_fork = dt_fork.as_secs_f64() * 1e6 / iters as f64;
        let rate_fork = iters as f64 / dt_fork.as_secs_f64();

        let menu_iters = (iters / 20).max(2000);
        let menu_len = fight.legal_actions(Observer::Full).len();
        let t2 = Instant::now();
        for _ in 0..menu_iters {
            let m = black_box(fight.legal_actions(Observer::Full));
            black_box(m);
        }
        let dt_menu = t2.elapsed();
        let us_menu = dt_menu.as_secs_f64() * 1e6 / menu_iters as f64;

        println!(
            "  {:<36} units={} | clone {:.3} us ({:.0}/s) | fork {:.3} us ({:.0}/s) | menu({} acts) {:.3} us",
            c.name,
            c.units.len(),
            us_state,
            rate_state,
            us_fork,
            rate_fork,
            menu_len,
            us_menu,
        );
    }

    // Dedicated sorcerer large-menu benchmark (Curogana with 2 visible enemies: Magic Missile multisets + Shatter AoE + Chromatic Orb + Metamagic)
    let curo_spec = EncounterSpec {
        units: vec![
            "curogana".into(),
            "wight-1".into(),
            "zombie-1".into(),
            "zombie-2".into(),
            "zombie-3".into(),
        ],
        placements: vec![
            Placement { id: "curogana".into(), x: 2, y: 1 },
            Placement { id: "wight-1".into(), x: 7, y: 4 },
            Placement { id: "zombie-1".into(), x: 8, y: 4 },
            Placement { id: "zombie-2".into(), x: 3, y: 10 },
            Placement { id: "zombie-3".into(), x: 6, y: 3 },
        ],
        map_rows: None,
        max_rounds: 50,
    };
    // Pick a seed where curogana acts first to time Curogana's full caster menu directly
    for seed in 1u64..200 {
        let mut f = Fight::new(db.clone(), &curo_spec, seed, seed as u128).expect("curo bench");
        f.start(&mut NoopSink).expect("curo start");
        if f.unit_key(f.current()) == "curogana" {
            let n_acts = f.legal_actions(Observer::Full).len();
            let menu_iters = (iters / 40).max(1000);
            let t = Instant::now();
            for _ in 0..menu_iters {
                let m = black_box(f.legal_actions(Observer::Full));
                black_box(m);
            }
            let us_menu = t.elapsed().as_secs_f64() * 1e6 / menu_iters as f64;
            println!(
                "  {:<36} caster=curogana | legal_actions({} acts) {:.3} us",
                "curogana_caster_menu_bench", n_acts, us_menu
            );
            break;
        }
    }
}
