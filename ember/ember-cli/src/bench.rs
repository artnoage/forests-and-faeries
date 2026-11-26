//! `FightState::clone()` and `Fight::fork()` micro-benchmarks.

use std::hint::black_box;
use std::mem::size_of;
use std::sync::Arc;
use std::time::Instant;

use ember_core::{ContentDb, EncounterSpec, Fight, FightState, NoopSink, Placement, UnitState};

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
        let mut fight = Fight::new(db.clone(), &spec, c.seed).expect("bench fight setup");
        let mut sink = NoopSink;
        fight.start(&mut sink).expect("bench fight start");

        // Warmup
        for _ in 0..2000 {
            let s = black_box(fight.state.clone());
            black_box(s);
            let f = black_box(fight.fork(None));
            black_box(f);
        }

        let t0 = Instant::now();
        for _ in 0..iters {
            let s = black_box(fight.state.clone());
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

        println!(
            "  {:<36} units={} | FightState::clone {:.3} us ({:.0}/s) | Fight::fork {:.3} us ({:.0}/s)",
            c.name,
            c.units.len(),
            us_state,
            rate_state,
            us_fork,
            rate_fork,
        );
    }
}
