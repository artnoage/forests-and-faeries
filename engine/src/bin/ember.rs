//! `ember replay <tape|dir>...` — replay natural20 tapes and report.
//! `ember bench <tape-dir> [--fights N]` — free-mode speed on the tapes' setups.
//! `ember bench-env <tape|dir|spec.json>...` — decisions per second of the
//! decision API (`env.rs`) on those setups.
//! `ember encode <tape|dir|spec.json>... --out FILE.npz|DIR` — observation
//! dumps (`encode.rs`, `dump.rs`) for the Python contract checks.
//! `ember features [--markdown]` — the observation's feature names.
//! `ember bench-encode <tape|dir|spec.json>...` — encode time per decision.
//! `ember balance eval|search|tune ...` — native-vs-native balancing
//! (GENERAL_ENV.md §7, `balance.rs`).
//! `ember mapgen gen|stats|show|check|place ...` — generated maps and placed
//! encounters on them (GENERAL_ENV.md §3, `mapgen.rs`, `layout.rs`).

use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::Instant;

use ember_rs::content::ContentPool;
use ember_rs::engine::{Fight, MAX_ROUNDS};
use ember_rs::env::{Chooser, Controller, Env};
use ember_rs::spec::EncounterSpec;
use ember_rs::replay::{fight_for, install_quiet_hook, replay_file, Outcome};
use ember_rs::tape::Tape;
use ember_rs::trace::Trace;

fn collect(paths: &[String]) -> Vec<PathBuf> {
    let mut out = Vec::new();
    for p in paths {
        let path = Path::new(p);
        if path.is_dir() {
            let mut files: Vec<PathBuf> = std::fs::read_dir(path)
                .unwrap()
                .filter_map(|e| e.ok().map(|e| e.path()))
                .filter(|p| p.extension().map(|e| e == "jsonl").unwrap_or(false))
                // natural20 counters and game results next to the tapes
                // (`validation/record_g8a.py`, `record_g8b.py`)
                .filter(|p| p.file_name().map_or(true, |n| n != "mech.jsonl" && n != "results.jsonl"))
                .collect();
            files.sort();
            out.extend(files);
        } else {
            out.push(path.to_path_buf());
        }
    }
    out
}

fn cmd_replay(args: &[String]) -> i32 {
    install_quiet_hook();
    let verbose = args.iter().any(|a| a == "-v");
    let stop = args.iter().any(|a| a == "--stop");
    let files = collect(&args.iter().filter(|a| !a.starts_with('-')).cloned().collect::<Vec<_>>());
    let (mut ok, mut bad) = (0, 0);
    let (mut events, mut draws, mut decisions) = (0usize, 0u64, 0u64);
    let mut notes = ember_rs::engine::Notes::default();
    let mut ext = ember_rs::env::Counts::default();
    let mut ext_tapes = 0u64;
    for f in &files {
        match replay_file(f) {
            Ok(Outcome::Match { events: e, draws: d, decisions: n, notes: nt, ext: x }) => {
                ok += 1;
                if let Some(x) = x {
                    ext_tapes += 1;
                    ext.decisions += x.decisions;
                    ext.differ += x.differ;
                    ext.forced_flee += x.forced_flee;
                    ext.forced_end_turn += x.forced_end_turn;
                    ext.stand += x.stand;
                }
                events += e;
                draws += d;
                decisions += n;
                notes.add(&nt);
                if verbose {
                    println!("OK   {}  ({e} events, {d} draws)", f.display());
                }
            }
            Ok(Outcome::Diverged(div)) => {
                bad += 1;
                println!("DIVERGED {}\n{div}", f.display());
            }
            Ok(Outcome::Incomplete { consumed, remaining }) => {
                bad += 1;
                println!("INCOMPLETE {}: consumed {consumed}, {remaining} tape events left", f.display());
            }
            Ok(Outcome::Crashed(msg)) => {
                bad += 1;
                println!("CRASH {}: {msg}", f.display());
            }
            Ok(Outcome::Setup(msg)) => {
                bad += 1;
                println!("SETUP {}: {msg}", f.display());
            }
            Err(e) => {
                bad += 1;
                println!("ERROR {}: {e}", f.display());
            }
        }
        if stop && bad > 0 {
            break;
        }
    }
    println!(
        "replayed {} tapes: {ok} match, {bad} differ; {events} events, {draws} draws, {decisions} actions matched",
        ok + bad
    );
    println!(
        "  in matched tapes: {} stands, {} corpses in Burning Hands/Thunderwave areas, {} Shield prompts skipped on a natural 20/1",
        notes.stands, notes.area_corpses, notes.shield_nat
    );
    println!(
        "  G8a: Sap applied {}, spent {} (Disadvantage), expired {}; thrown {} (spare) + {} (held); Mage Armor {}",
        notes.sap_applied, notes.sap_spent, notes.sap_expired, notes.thrown_spare, notes.thrown_held, notes.mage_armor
    );
    println!("  G4b: blind attacks {}", notes.blind_attacks);
    println!(
        "  G8b: Nimble Escape Disengage {}, Hide {} ({} hidden); attacks from hiding {}; Advantage riders {}; Redirect Attack {}; NPC throws {}; thrown weapons kept by the target {}",
        notes.disengage_bonus, notes.hide_attempts, notes.hide_success, notes.hidden_attacks, notes.adv_riders,
        notes.redirects, notes.npc_throws, notes.items_gained
    );
    println!(
        "  Mummy: Dreadful Glare failed {} / saved {}; curses {}; heals on cursed creatures {}; deaths at 0 HP (Rotting Fist) {}; fears warded by Protection from Evil and Good {}",
        notes.glare_fail, notes.glare_save, notes.curses, notes.heals_blocked, notes.kill_at_zero, notes.pfeg_ward
    );
    println!(
        "  Barbarian: rages {} (extended by bonus action {}, lapsed {}, ended by Incapacitated {}); Reckless Attack {}; Frenzy hits {}; Cleave windows {}, attacks {}",
        notes.rages, notes.rage_extends, notes.rage_lapsed, notes.rage_incapacitated, notes.reckless, notes.frenzy_hits,
        notes.cleave_windows, notes.cleaves
    );
    if ext_tapes > 0 {
        println!(
            "  off-policy: {ext_tapes} tapes, {} external decisions checked ({} not the native choice, {} Stand first), {} forced flee steps, {} forced End Turns",
            ext.decisions, ext.differ, ext.stand, ext.forced_flee, ext.forced_end_turn
        );
    }
    if bad == 0 {
        0
    } else {
        1
    }
}

fn cmd_bench(args: &[String]) -> i32 {
    let files = collect(&args.iter().filter(|a| !a.starts_with('-')).cloned().collect::<Vec<_>>());
    let reps: usize = args
        .iter()
        .position(|a| a == "--reps")
        .and_then(|i| args.get(i + 1))
        .and_then(|s| s.parse().ok())
        .unwrap_or(20);
    let tapes: Vec<Tape> = files.iter().filter_map(|f| Tape::load(f).ok()).collect();
    // setups (map, content, stats check) are built once, outside the timing
    let pool = ContentPool::global();
    let setups: Vec<_> = tapes
        .iter()
        .map(|t| {
            let f = fight_for(&t.header, pool, Trace::free(0)).unwrap_or_else(|e| panic!("{e}"));
            (f.grid.clone(), &t.header)
        })
        .collect();
    let t0 = Instant::now();
    let (mut fights, mut actions, mut draws) = (0u64, 0u64, 0u64);
    for r in 0..reps {
        for (i, (grid, h)) in setups.iter().enumerate() {
            let seed = (r * 1_000_003 + i) as u64;
            let mut f = Fight::on_map(pool, grid.clone(), &h.units, &h.placements, h.max_rounds, Trace::free(seed))
                .unwrap_or_else(|e| panic!("{e}"));
            f.run();
            fights += 1;
            actions += f.decisions;
            draws += f.trace.draws;
        }
    }
    let dt = t0.elapsed().as_secs_f64();
    println!(
        "{fights} fights in {dt:.3}s: {:.1} us/fight, {:.0} actions/s, {:.0} fights/s ({} actions, {} draws)",
        dt * 1e6 / fights as f64,
        actions as f64 / dt,
        fights as f64 / dt,
        actions,
        draws
    );
    0
}

/// `ember bench-env <tape|dir|spec.json>... [--reps N] [--ctrl heroes|monsters|both]
/// [--chooser NAME] [--scores on|off]`: the decision API in free mode on the
/// setups of the given tapes (or EncounterSpec JSON files), one core.
fn cmd_bench_env(args: &[String]) -> i32 {
    let opt = |name: &str| args.iter().position(|a| a == name).and_then(|i| args.get(i + 1)).cloned();
    let reps: usize = opt("--reps").and_then(|s| s.parse().ok()).unwrap_or(5);
    let ctrl = match opt("--ctrl").as_deref().unwrap_or("heroes") {
        "heroes" => [Controller::External, Controller::Native],
        "monsters" => [Controller::Native, Controller::External],
        "both" => [Controller::External, Controller::External],
        other => {
            eprintln!("--ctrl {other}: heroes, monsters or both");
            return 2;
        }
    };
    let chooser = opt("--chooser").unwrap_or_else(|| "uniform".into());
    let scores = opt("--scores").as_deref() != Some("off");
    let mut skip = false;
    let mut paths = Vec::new();
    for a in args {
        if skip {
            skip = false;
            continue;
        }
        if a.starts_with("--") {
            skip = true;
            continue;
        }
        paths.push(a.clone());
    }
    let pool = ContentPool::global();
    // (grid, units, placements, max_rounds), built outside the timing
    let mut setups = Vec::new();
    for p in &paths {
        let path = Path::new(p);
        let files: Vec<PathBuf> = if path.is_dir() {
            let mut v: Vec<PathBuf> = std::fs::read_dir(path)
                .unwrap()
                .filter_map(|e| e.ok().map(|e| e.path()))
                .filter(|p| p.extension().is_some_and(|e| e == "jsonl" || e == "json"))
                .filter(|p| p.file_name().map_or(true, |n| n != "mech.jsonl" && n != "results.jsonl"))
                .collect();
            v.sort();
            v
        } else {
            vec![path.to_path_buf()]
        };
        for f in files {
            if f.extension().is_some_and(|e| e == "json") {
                let spec = EncounterSpec::load(&f).unwrap_or_else(|e| panic!("{e}"));
                let enc = spec.validate(pool).unwrap_or_else(|e| panic!("{}: {e}", f.display()));
                setups.push((enc.grid, enc.units, enc.placements, MAX_ROUNDS));
            } else {
                let t = Tape::load(&f).unwrap_or_else(|e| panic!("{e}"));
                let fight = fight_for(&t.header, pool, Trace::free(0)).unwrap_or_else(|e| panic!("{e}"));
                setups.push((fight.grid.clone(), t.header.units.clone(), t.header.placements.clone(), t.header.max_rounds));
            }
        }
    }
    if setups.is_empty() {
        eprintln!("no setups");
        return 2;
    }
    let t0 = Instant::now();
    let (mut games, mut decisions, mut actions, mut forced, mut rounds) = (0u64, 0u64, 0u64, 0u64, 0i64);
    for r in 0..reps {
        for (i, (grid, units, placements, max_rounds)) in setups.iter().enumerate() {
            let seed = (r * 1_000_003 + i) as u64;
            let mut env = Env::from_units(pool, grid.clone(), units, placements, *max_rounds, seed, ctrl, scores)
                .unwrap_or_else(|e| panic!("{e}"));
            let mut pick = Chooser::parse(&chooser, seed ^ 0x9E37_79B9).unwrap_or_else(|e| panic!("{e}"));
            while let Some(d) = env.decision() {
                let row = pick.pick(d);
                env.step(row).unwrap();
            }
            games += 1;
            decisions += env.counts.decisions;
            forced += env.counts.forced_flee + env.counts.forced_end_turn;
            actions += env.fight.decisions;
            rounds += env.fight.round as i64;
        }
    }
    let dt = t0.elapsed().as_secs_f64();
    println!(
        "{games} games in {dt:.3}s: {:.0} decisions/s ({:.2} us/decision), {:.1} games/s; {decisions} decisions, {forced} forced, {actions} actions, {:.1} rounds/game (scores {}, chooser {chooser})",
        decisions as f64 / dt,
        dt * 1e6 / decisions.max(1) as f64,
        games as f64 / dt,
        rounds as f64 / games as f64,
        if scores { "on" } else { "off" }
    );
    0
}

/// Files of the given paths: a directory gives its tapes (`*.jsonl`, not
/// `mech.jsonl`) and specs (`*.json`), sorted.
fn sources(paths: &[String]) -> Vec<PathBuf> {
    let mut out = Vec::new();
    for p in paths {
        let path = Path::new(p);
        if path.is_dir() {
            let mut v: Vec<PathBuf> = std::fs::read_dir(path)
                .unwrap()
                .filter_map(|e| e.ok().map(|e| e.path()))
                .filter(|p| p.extension().is_some_and(|e| e == "jsonl" || e == "json"))
                .filter(|p| p.file_name().map_or(true, |n| n != "mech.jsonl" && n != "results.jsonl"))
                .collect();
            v.sort();
            out.extend(v);
        } else {
            out.push(path.to_path_buf());
        }
    }
    out
}

/// Positional arguments and `--name value` options.
fn split_args(args: &[String], flags: &[&str]) -> (Vec<String>, Vec<(String, String)>) {
    let mut pos = Vec::new();
    let mut opts = Vec::new();
    let mut i = 0;
    while i < args.len() {
        let a = &args[i];
        if a.starts_with("--") {
            if flags.contains(&a.as_str()) {
                opts.push((a.clone(), String::new()));
            } else {
                opts.push((a.clone(), args.get(i + 1).cloned().unwrap_or_default()));
                i += 1;
            }
        } else {
            pos.push(a.clone());
        }
        i += 1;
    }
    (pos, opts)
}

fn dump_opts(opts: &[(String, String)]) -> Result<ember_rs::dump::DumpOpts, String> {
    use ember_rs::dump::{DumpOpts, Offset};
    let mut o = DumpOpts::default();
    for (k, v) in opts {
        match k.as_str() {
            "--team" => {
                o.teams = match v.as_str() {
                    "heroes" => [true, false],
                    "monsters" => [false, true],
                    "both" => [true, true],
                    _ => return Err(format!("--team {v}: heroes, monsters or both")),
                }
            }
            "--steps" => o.steps = Some(v.parse().map_err(|_| format!("--steps {v}"))?),
            "--no-finals" => o.finals = false,
            "--offset" => {
                o.offset = if v == "random" {
                    Offset::Random
                } else {
                    let (x, y) = v.split_once(',').ok_or(format!("--offset {v}: X,Y or random"))?;
                    Offset::Fixed(x.parse().map_err(|_| "--offset x")?, y.parse().map_err(|_| "--offset y")?)
                }
            }
            "--ctrl" => {
                o.ctrl = match v.as_str() {
                    "heroes" => [Controller::External, Controller::Native],
                    "monsters" => [Controller::Native, Controller::External],
                    "both" => [Controller::External, Controller::External],
                    _ => return Err(format!("--ctrl {v}: heroes, monsters or both")),
                }
            }
            "--chooser" => o.chooser = v.clone(),
            "--seed" => o.seed = v.parse().map_err(|_| format!("--seed {v}"))?,
            "--scores" => o.scores = v != "off",
            "--standing-weight" => o.objective.standing_weight = v.parse().map_err(|_| format!("--standing-weight {v}"))?,
            "--objective" => o.objective.health = v == "health_score",
            "--feature-version" => o.version = ember_rs::encode::Version::parse(v)?,
            "--out" | "--reps" => {}
            other => return Err(format!("unknown option {other}")),
        }
    }
    Ok(o)
}

/// `ember encode <tape|dir|spec.json>... --out FILE.npz|DIR [--team heroes|monsters|both]
/// [--steps N] [--no-finals] [--offset X,Y|random] [--ctrl heroes|monsters|both]
/// [--chooser C] [--seed S] [--scores on|off] [--feature-version ember-gen-v2|ember-gen-v1]`.
/// Off-policy tapes are replayed
/// with their own dice and rows; native tapes and specs are played in free
/// mode with `--ctrl`, `--chooser` (default native) and `--seed`. With an
/// `.npz` output everything goes into one file; with a directory, one file
/// per source.
fn cmd_encode(args: &[String]) -> i32 {
    install_quiet_hook();
    let (pos, opts) = split_args(args, &["--no-finals"]);
    let o = match dump_opts(&opts) {
        Ok(o) => o,
        Err(e) => {
            eprintln!("{e}");
            return 2;
        }
    };
    let Some(out) = opts.iter().find(|(k, _)| k == "--out").map(|(_, v)| PathBuf::from(v)) else {
        eprintln!("--out FILE.npz or DIR is required");
        return 2;
    };
    let files = sources(&pos);
    if files.is_empty() {
        eprintln!("no sources");
        return 2;
    }
    let single = out.extension().is_some_and(|e| e == "npz");
    if !single {
        std::fs::create_dir_all(&out).unwrap_or_else(|e| panic!("{}: {e}", out.display()));
    }
    let mut all = ember_rs::dump::Dump::default();
    let (mut rows, mut live, mut errors) = (0usize, 0usize, 0usize);
    let t0 = Instant::now();
    for f in &files {
        let mut d = ember_rs::dump::Dump::default();
        let target = if single { &mut all } else { &mut d };
        let before = target.len();
        match target.add_source(f, &o) {
            Ok(()) => {
                let s = target.sources.last().unwrap();
                println!(
                    "{}: map {} offset {:?}, {} hero + {} monster decisions, {} finals{}",
                    f.display(),
                    s.map,
                    s.offset,
                    s.decisions[0],
                    s.decisions[1],
                    s.finals,
                    if s.replayed { " (replayed)" } else { "" }
                );
                rows += target.len() - before;
                live += s.decisions[0] as usize + s.decisions[1] as usize;
            }
            Err(e) => {
                errors += 1;
                println!("ERROR {e}");
                continue;
            }
        }
        if !single && !d.is_empty() {
            let parent = f.parent().and_then(|p| p.file_name()).map(|s| s.to_string_lossy().into_owned()).unwrap_or_default();
            let stem = f.file_stem().unwrap().to_string_lossy();
            let path = out.join(format!("{parent}__{stem}.npz"));
            d.to_npz().write(&path).unwrap_or_else(|e| panic!("{}: {e}", path.display()));
        }
    }
    if single {
        all.to_npz().write(&out).unwrap_or_else(|e| panic!("{}: {e}", out.display()));
    }
    println!(
        "encoded {rows} observations ({live} decisions, {} final views) from {} sources, {errors} errors, in {:.1}s -> {}",
        rows - live,
        files.len(),
        t0.elapsed().as_secs_f64(),
        out.display()
    );
    if errors == 0 {
        0
    } else {
        1
    }
}

/// `ember features [--markdown]`: the feature names (`docs/FEATURES.md`).
fn cmd_features(args: &[String]) -> i32 {
    if args.iter().any(|a| a == "--markdown") {
        print!("{}", ember_rs::encode::features_markdown());
        return 0;
    }
    let n = ember_rs::encode::feature_names();
    for (group, names) in
        [("creature", n.creature), ("global", n.global), ("cand", n.cand), ("map", n.map), ("relations", n.relations)]
    {
        for (i, name) in names.iter().enumerate() {
            println!("{group}\t{i}\t{name}");
        }
    }
    0
}

/// `ember bench-encode <tape|dir|spec.json>... [--reps N] [--ctrl both] [--chooser C]
/// [--scores on|off] [--feature-version V]`: games played as in `bench-env`; only the `encode`
/// calls are timed (one per external decision, into reused buffers with K =
/// the legal row count).
fn cmd_bench_encode(args: &[String]) -> i32 {
    use ember_rs::encode::{encode, Obs, ObsSlot, Objective, Version, T};
    let (pos, opts) = split_args(args, &[]);
    let opt = |name: &str| opts.iter().find(|(k, _)| k == name).map(|(_, v)| v.clone());
    let reps: usize = opt("--reps").and_then(|s| s.parse().ok()).unwrap_or(1);
    let ctrl = match opt("--ctrl").as_deref().unwrap_or("both") {
        "heroes" => [Controller::External, Controller::Native],
        "monsters" => [Controller::Native, Controller::External],
        _ => [Controller::External, Controller::External],
    };
    let chooser = opt("--chooser").unwrap_or_else(|| "uniform".into());
    let scores = opt("--scores").as_deref() != Some("off");
    let version = match opt("--feature-version").map(|v| Version::parse(&v)).transpose() {
        Ok(v) => v.unwrap_or_default(),
        Err(e) => {
            eprintln!("{e}");
            return 2;
        }
    };
    let fa = version.cand();
    let pool = ContentPool::global();
    let mut setups = Vec::new();
    for f in sources(&pos) {
        if f.extension().is_some_and(|e| e == "json") {
            let spec = EncounterSpec::load(&f).unwrap_or_else(|e| panic!("{e}"));
            let enc = spec.validate(pool).unwrap_or_else(|e| panic!("{}: {e}", f.display()));
            setups.push((enc.grid, enc.units, enc.placements, MAX_ROUNDS));
        } else {
            let t = Tape::load(&f).unwrap_or_else(|e| panic!("{e}"));
            let fight = fight_for(&t.header, pool, Trace::free(0)).unwrap_or_else(|e| panic!("{e}"));
            setups.push((fight.grid.clone(), t.header.units.clone(), t.header.placements.clone(), t.header.max_rounds));
        }
    }
    if setups.is_empty() {
        eprintln!("no setups");
        return 2;
    }
    let mut buf = Obs::with_version(4096, version);
    let obj = Objective::default();
    let mut times: Vec<f64> = Vec::new();
    let mut ks: u64 = 0;
    for r in 0..reps {
        for (i, (grid, units, placements, max_rounds)) in setups.iter().enumerate() {
            let seed = (r * 1_000_003 + i) as u64;
            let mut env = Env::from_units(pool, grid.clone(), units, placements, *max_rounds, seed, ctrl, scores)
                .unwrap_or_else(|e| panic!("{e}"));
            let mut pick = Chooser::parse(&chooser, seed ^ 0x9E37_79B9).unwrap_or_else(|e| panic!("{e}"));
            while let Some(d) = env.decision() {
                let k = d.legal.len();
                ks += k as u64;
                let mut slot = ObsSlot {
                    version: buf.version,
                    creatures: &mut buf.creatures,
                    creature_ids: &mut buf.creature_ids,
                    creature_mask: &mut buf.creature_mask,
                    map: &mut buf.map,
                    global: &mut buf.global,
                    cands: &mut buf.cands[..k * fa],
                    cand_ids: &mut buf.cand_ids[..k * 3],
                    cand_tgt: &mut buf.cand_tgt[..k * T],
                    cand_tgt_n: &mut buf.cand_tgt_n[..k * T],
                    cand_cell: &mut buf.cand_cell[..k],
                    cand_mask: &mut buf.cand_mask[..k],
                    actor: &mut buf.actor,
                    native_raw: &mut buf.native_raw[..k],
                    native_dropped: &mut buf.native_dropped[..k],
                    native_choice: &mut buf.native_choice,
                    creature_rel: &mut buf.creature_rel,
                };
                let t0 = Instant::now();
                encode(&env, None, (0, 0), &obj, &mut slot).unwrap();
                times.push(t0.elapsed().as_secs_f64() * 1e6);
                let row = pick.pick(d);
                env.step(row).unwrap();
            }
        }
    }
    let n = times.len();
    let total: f64 = times.iter().sum();
    times.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let q = |p: f64| times[((n as f64 - 1.0) * p).round() as usize];
    println!(
        "{n} encodes: {:.2} us mean, p50 {:.2}, p90 {:.2}, p99 {:.2}, max {:.1} us; mean K {:.1} (ctrl {:?}, chooser {chooser}, scores {})",
        total / n as f64,
        q(0.5),
        q(0.9),
        q(0.99),
        times[n - 1],
        ks as f64 / n as f64,
        ctrl,
        if scores { "on" } else { "off" }
    );
    0
}


const BALANCE_USAGE: &str = "\
ember balance: native-vs-native games per encounter (GENERAL_ENV.md §7, src/balance.rs)

  ember balance eval <catalog.jsonl|row.json>... [--games N] [--from K] [--sight row|on|off|both]
                    [--maps MAPS] --out FILE
      Measure every row: p (hero native-elimination wins), 95% Wilson CI, truncation (horizon),
      mean rounds, hero deaths. Writes the rows with p, p_ci, truncation, baseline and a balance block.
      Rows name a fixed map or carry one inline ({name, rows, ember}).
      --sight on|off replaces each row's layout by a zone layout with/without require_sight;
      both writes two rows per input (field sight_mode).
      --maps MAPS plays every row on every map instead of its own: id <map label>-<row id>,
      the map inline (field map_label).
  ember balance search --maps MAPS --out FILE [search options]
      Grow rosters level by level (size 1, 2, ...), pruning rosters with a dead sub-roster;
      screen, refine, accept, per map. Writes every measured roster (field search.accepted);
      a map file's map goes into the rows inline. --rosters FILE (rows with a roster, e.g. eval
      rows) screens, refines and accepts that fixed pool on every map instead of growing rosters.
  ember balance tune <rows.jsonl> --out FILE [search options] [--steps 12]
      From each row's roster: add a monster while p is above the band's middle, remove one
      while below, until a refined roster is accepted. Writes each walk's last roster. Rows
      may carry their map inline.

MAPS: comma-separated; each item a fixed map name (vault, room_12x10, two_rooms_24x18,
  hall_32x32), a map file (an EncounterSpec JSON such as `ember mapgen gen` writes; validated
  as `ember mapgen check` does), a directory of them, or a maps.jsonl index of `ember mapgen
  gen` (its `file` entries). Map labels (row ids) are the fixed names or the maps' names.

common options:
  --seed S (0)            seed base: game k of encounter id uses layout and dice seeds from (S, id, k)
  --max-rounds R (30)     horizon (the trainer's); a row's own max_rounds wins
  --threads T (all)       rayon threads
search options:
  --party mara,ilyra      hero content ids
  --monsters a,b,...      monster types, canonical order (default the seven SRD undead)
  --max-size N (14)       monsters per roster at most (and 24 creatures in all)
  --max-per-type N (14)   --max-xp X  --max-candidates N (100000, per level)
  --min-xp X              rosters below X are not screened but count as alive (start near the frontier)
  --prior T=W,...         per-type search weights replacing SRD XP for ordering, --max-xp and --min-xp
                          (types not named keep their XP; rows keep SRD xp)
  --screen N (200)        --games N (2000): screen and refine game counts
  --screen-band LO,HI (.25,.75)  --band LO,HI (.4,.6)
  --screen-trunc X (.10)  --max-trunc X (.05)  --max-half-width X (.022)
  --sight on|off (on)     zone layout with or without require_sight
  --row-max-rounds on|off (on): write max_rounds into each row
";

/// `--maps` (BALANCE_USAGE, MAPS): fixed map names, map files, directories
/// of map files, `maps.jsonl` indexes; labels must be distinct.
fn map_args(spec: &str) -> Result<Vec<ember_rs::balance::MapArg>, String> {
    use ember_rs::balance::MapArg;
    let load = |path: &Path| -> Result<MapArg, String> {
        let text = std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?;
        ember_rs::mapgen::load_map_json(&text).map_err(|e| format!("{}: {e}", path.display()))?;
        let doc: serde_json::Value = serde_json::from_str(&text).map_err(|e| format!("{}: {e}", path.display()))?;
        MapArg::from_value(&doc["map"]).map_err(|e| format!("{}: {e}", path.display()))
    };
    let mut out: Vec<MapArg> = Vec::new();
    for item in spec.split(',').filter(|s| !s.is_empty()) {
        let path = Path::new(item);
        if ember_rs::map::builtin_map(item).is_some() {
            out.push(MapArg::fixed(item));
        } else if path.is_dir() {
            let mut files: Vec<PathBuf> = std::fs::read_dir(path)
                .map_err(|e| format!("{item}: {e}"))?
                .filter_map(|e| e.ok().map(|e| e.path()))
                .filter(|p| p.extension().is_some_and(|e| e == "json"))
                .collect();
            files.sort();
            if files.is_empty() {
                return Err(format!("{item}: no map files (*.json)"));
            }
            for f in files {
                out.push(load(&f)?);
            }
        } else if item.ends_with(".jsonl") {
            let text = std::fs::read_to_string(path).map_err(|e| format!("{item}: {e}"))?;
            let dir = path.parent().unwrap_or(Path::new("."));
            for (n, line) in text.lines().enumerate() {
                let line = line.trim();
                if line.is_empty() || line.starts_with('#') {
                    continue;
                }
                let v: serde_json::Value = serde_json::from_str(line).map_err(|e| format!("{item}:{}: {e}", n + 1))?;
                let file = v.get("file").and_then(|f| f.as_str()).ok_or(format!("{item}:{}: an index line needs file", n + 1))?;
                out.push(load(&dir.join(file))?);
            }
        } else if path.is_file() {
            out.push(load(path)?);
        } else {
            return Err(format!("{item}: not a fixed map, a map file or a directory"));
        }
    }
    let mut seen = std::collections::HashSet::new();
    if let Some(m) = out.iter().find(|m| !seen.insert(m.label.clone())) {
        return Err(format!("map {} given twice", m.label));
    }
    if out.is_empty() {
        return Err("no maps".into());
    }
    Ok(out)
}

fn read_rows(paths: &[String]) -> Result<Vec<serde_json::Value>, String> {
    let mut rows = Vec::new();
    for p in paths {
        let text = std::fs::read_to_string(p).map_err(|e| format!("{p}: {e}"))?;
        if p.ends_with(".json") {
            rows.push(serde_json::from_str(&text).map_err(|e| format!("{p}: {e}"))?);
            continue;
        }
        for (n, line) in text.lines().enumerate() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            rows.push(serde_json::from_str(line).map_err(|e| format!("{p}:{}: {e}", n + 1))?);
        }
    }
    Ok(rows)
}

fn write_rows(path: &str, rows: &[serde_json::Value]) -> Result<(), String> {
    use std::io::Write as _;
    if let Some(dir) = Path::new(path).parent() {
        if !dir.as_os_str().is_empty() {
            std::fs::create_dir_all(dir).map_err(|e| format!("{}: {e}", dir.display()))?;
        }
    }
    let mut f = std::io::BufWriter::new(std::fs::File::create(path).map_err(|e| format!("{path}: {e}"))?);
    for r in rows {
        writeln!(f, "{}", serde_json::to_string(r).unwrap()).map_err(|e| format!("{path}: {e}"))?;
    }
    f.flush().map_err(|e| format!("{path}: {e}"))
}

fn print_measure(id: &str, s: &ember_rs::balance::Stats) {
    let (lo, hi) = s.ci();
    println!(
        "{id:<64} n {:>5}  p {:.3} [{:.3}, {:.3}]  q {:.3}  trunc {:.3}  rounds {:>5.2}  hero deaths {:.2} (any {:.3}){}",
        s.games,
        s.p(),
        lo,
        hi,
        s.q(),
        s.truncation(),
        s.mean_rounds(),
        if s.games > 0 { s.hero_deaths as f64 / s.games as f64 } else { 0.0 },
        if s.games > 0 { s.hero_death_games as f64 / s.games as f64 } else { 0.0 },
        if s.errors > 0 { format!("  ERRORS {} ({})", s.errors, s.first_error.as_deref().unwrap_or("")) } else { String::new() }
    );
}

fn parse_band(v: &str) -> Result<(f64, f64), String> {
    let (a, b) = v.split_once(',').ok_or(format!("{v}: LO,HI"))?;
    Ok((a.parse().map_err(|_| format!("{v}"))?, b.parse().map_err(|_| format!("{v}"))?))
}

fn on_off(v: &str) -> Result<bool, String> {
    match v {
        "on" | "true" | "1" => Ok(true),
        "off" | "false" | "0" => Ok(false),
        _ => Err(format!("{v}: on or off")),
    }
}

fn cmd_balance(args: &[String]) -> i32 {
    match balance_main(args) {
        Ok(code) => code,
        Err(e) => {
            eprintln!("ember balance: {e}");
            2
        }
    }
}

fn balance_main(args: &[String]) -> Result<i32, String> {
    use ember_rs::balance::{self, SearchCfg};
    use serde_json::json;
    let Some(sub) = args.first().map(String::as_str) else {
        eprint!("{BALANCE_USAGE}");
        return Ok(2);
    };
    if sub == "--help" || sub == "-h" || sub == "help" {
        print!("{BALANCE_USAGE}");
        return Ok(0);
    }
    let (pos, opts) = split_args(&args[1..], &[]);
    let opt = |name: &str| opts.iter().rev().find(|(k, _)| k == name).map(|(_, v)| v.clone());
    let num = |name: &str, d: f64| -> Result<f64, String> { opt(name).map_or(Ok(d), |v| v.parse().map_err(|_| format!("{name} {v}"))) };
    let int = |name: &str, d: u64| -> Result<u64, String> { opt(name).map_or(Ok(d), |v| v.parse().map_err(|_| format!("{name} {v}"))) };
    let known = [
        "--games", "--from", "--sight", "--out", "--seed", "--max-rounds", "--threads", "--party", "--monsters", "--maps",
        "--max-size", "--max-per-type", "--max-xp", "--min-xp", "--prior", "--max-candidates", "--screen", "--screen-band", "--band",
        "--screen-trunc", "--max-trunc", "--max-half-width", "--row-max-rounds", "--steps", "--rosters",
    ];
    if let Some((k, _)) = opts.iter().find(|(k, _)| !known.contains(&k.as_str())) {
        return Err(format!("unknown option {k} (ember balance --help)"));
    }
    if let Some(t) = opt("--threads") {
        let t: usize = t.parse().map_err(|_| format!("--threads {t}"))?;
        rayon::ThreadPoolBuilder::new().num_threads(t).build_global().map_err(|e| e.to_string())?;
    }
    let pool = ContentPool::global();
    let seed = int("--seed", 0)?;
    let max_rounds = int("--max-rounds", balance::HORIZON as u64)? as i32;
    let out = opt("--out").ok_or("--out FILE is required")?;
    let t0 = Instant::now();
    match sub {
        "eval" => {
            let games = int("--games", 2000)?;
            let from = int("--from", 0)?;
            let sight = opt("--sight").unwrap_or_else(|| "row".into());
            let variants: Vec<(Option<bool>, &str)> = match sight.as_str() {
                "row" => vec![(None, "row")],
                "on" => vec![(Some(true), "on")],
                "off" => vec![(Some(false), "off")],
                "both" => vec![(Some(true), "on"), (Some(false), "off")],
                _ => return Err(format!("--sight {sight}: row, on, off or both")),
            };
            let maps = opt("--maps").map(|m| map_args(&m)).transpose()?;
            let mut inputs = Vec::new();
            for row in read_rows(&pos)? {
                match &maps {
                    None => inputs.push(row),
                    Some(maps) => {
                        if row.get("spec").is_some() {
                            return Err(format!("--maps: row {} has a spec (its own map and squares)", row["id"]));
                        }
                        let id = row.get("id").and_then(|v| v.as_str()).ok_or("a row without a string id")?.to_string();
                        for m in maps {
                            let mut r = row.clone();
                            r["id"] = json!(format!("{}-{id}", m.label));
                            r["map"] = m.value.clone();
                            r["map_label"] = json!(m.label);
                            inputs.push(r);
                        }
                    }
                }
            }
            let mut rows = Vec::new();
            for row in inputs {
                for (s, name) in &variants {
                    let mut r = row.clone();
                    if let Some(s) = s {
                        r["layout"] = balance::zone_layout(*s);
                        r["sight_mode"] = json!(name);
                    }
                    rows.push(r);
                }
            }
            if rows.is_empty() {
                return Err("no rows".into());
            }
            let entries: Vec<Arc<ember_rs::catalog::Entry>> =
                rows.iter().map(|r| ember_rs::catalog::Entry::from_json(r, pool).map(Arc::new)).collect::<Result<_, _>>()?;
            let range = from..from + games;
            let stats = balance::measure_many(&entries, &vec![range.clone(); entries.len()], seed, max_rounds, pool);
            let mut outs = Vec::new();
            let mut total = 0;
            for ((row, e), s) in rows.iter().zip(&entries).zip(&stats) {
                let label = match row.get("sight_mode").and_then(|v| v.as_str()) {
                    Some(m) => format!("{} [sight {m}]", e.id),
                    None => e.id.clone(),
                };
                print_measure(&label, s);
                total += s.games;
                outs.push(s.annotate(row, seed, &range, e.max_rounds.unwrap_or(max_rounds)));
            }
            write_rows(&out, &outs)?;
            println!("{} rows, {total} games in {:.1}s -> {out}", outs.len(), t0.elapsed().as_secs_f64());
        }
        "search" | "tune" => {
            let list = |name: &str, d: &str| -> Vec<String> {
                opt(name).unwrap_or_else(|| d.into()).split(',').filter(|s| !s.is_empty()).map(str::to_string).collect()
            };
            let types = list("--monsters", "skeleton,zombie,shadow,ghoul,specter,ghast,wight");
            let party = list("--party", "mara,ilyra");
            for t in types.iter().chain(&party) {
                if pool.tid(t).is_none() {
                    return Err(format!("unknown content id {t}"));
                }
            }
            let sight = on_off(&opt("--sight").unwrap_or_else(|| "on".into()))?;
            let cfg = SearchCfg {
                party,
                max_size: int("--max-size", 14)? as usize,
                max_per_type: int("--max-per-type", 14)?.min(255) as u8,
                max_xp: opt("--max-xp").map(|v| v.parse().map_err(|_| format!("--max-xp {v}"))).transpose()?,
                min_xp: opt("--min-xp").map(|v| v.parse().map_err(|_| format!("--min-xp {v}"))).transpose()?,
                prior: match opt("--prior") {
                    None => None,
                    Some(v) => {
                        let mut w = types.iter().map(|t| ember_rs::balance::xp(t).unwrap_or(0)).collect::<Vec<u32>>();
                        for part in v.split(',').filter(|p| !p.is_empty()) {
                            let (t, x) = part.split_once('=').ok_or(format!("--prior {part}: TYPE=WEIGHT"))?;
                            let i = types.iter().position(|y| y == t).ok_or(format!("--prior: {t} is not in --monsters"))?;
                            w[i] = x.parse().map_err(|_| format!("--prior {part}"))?;
                        }
                        Some(w)
                    }
                },
                max_candidates: int("--max-candidates", 100_000)? as usize,
                screen_games: int("--screen", 200)?,
                refine_games: int("--games", 2000)?,
                screen_band: opt("--screen-band").map_or(Ok((0.25, 0.75)), |v| parse_band(&v))?,
                accept_band: opt("--band").map_or(Ok((0.4, 0.6)), |v| parse_band(&v))?,
                screen_trunc: num("--screen-trunc", 0.10)?,
                max_trunc: num("--max-trunc", 0.05)?,
                max_half_width: num("--max-half-width", 0.022)?,
                layout: balance::zone_layout(sight),
                max_rounds,
                row_max_rounds: on_off(&opt("--row-max-rounds").unwrap_or_else(|| "on".into()))?,
                seed,
                types,
            };
            let mut outs = Vec::new();
            if sub == "search" {
                let maps = map_args(&opt("--maps").ok_or("--maps MAPS is required (ember balance --help)")?)?;
                // --rosters FILE: a fixed pool (rows with a roster), distinct, in file order
                let rosters: Option<Vec<balance::Counts>> = match opt("--rosters") {
                    None => None,
                    Some(f) => {
                        let mut list: Vec<balance::Counts> = Vec::new();
                        for row in read_rows(&[f.clone()])? {
                            let mut counts = vec![0u8; cfg.types.len()];
                            for m in row.get("roster").and_then(|v| v.as_array()).ok_or(format!("{f}: rows need a roster"))? {
                                let m = m.as_str().unwrap_or("");
                                let i = cfg.types.iter().position(|t| t == m).ok_or(format!("{f}: {m} is not in --monsters"))?;
                                counts[i] += 1;
                            }
                            if counts.iter().all(|&n| n == 0) {
                                return Err(format!("{f}: empty roster"));
                            }
                            if !list.contains(&counts) {
                                list.push(counts);
                            }
                        }
                        Some(list)
                    }
                };
                for arg in &maps {
                    let map = &arg.label;
                    let found = match &rosters {
                        Some(list) => balance::screen_pool(arg, list, &cfg, pool, |line| println!("{line}"))?,
                        None => balance::search_map(arg, &cfg, pool, |line| println!("{line}"))?,
                    };
                    let acc: Vec<&balance::Measured> = found.iter().filter(|m| m.accepted).collect();
                    let mut sizes: Vec<u32> = acc.iter().map(|m| m.counts.iter().map(|&n| n as u32).sum()).collect();
                    sizes.sort();
                    println!(
                        "{map}: {} measured, {} refined, {} accepted; accepted sizes {:?}",
                        found.len(),
                        found.iter().filter(|m| m.refined.is_some()).count(),
                        acc.len(),
                        sizes
                    );
                    outs.extend(found.iter().map(|m| m.to_json(&cfg)));
                    write_rows(&out, &outs)?;
                }
            } else {
                let steps = int("--steps", 12)? as usize;
                for row in read_rows(&pos)? {
                    let arg = balance::MapArg::from_value(row.get("map").ok_or("tune needs rows with a map (a fixed name or inline)")?)?;
                    let map = arg.label.clone();
                    let roster: Vec<String> = row
                        .get("roster")
                        .and_then(|v| v.as_array())
                        .ok_or("tune needs rows with a roster")?
                        .iter()
                        .map(|v| v.as_str().unwrap_or("").to_string())
                        .collect();
                    let mut counts = vec![0u8; cfg.types.len()];
                    for m in &roster {
                        let i = cfg.types.iter().position(|t| t == m).ok_or(format!("{m} is not in --monsters"))?;
                        counts[i] += 1;
                    }
                    let path = balance::tune(&arg, &counts, &cfg, steps, pool)?;
                    let walk: Vec<String> =
                        path.iter().map(|m| format!("{} ({:.3})", balance::roster_code(&cfg.types, &m.counts), m.refined.as_ref().unwrap_or(&m.screen).p())).collect();
                    let last = path.last().unwrap();
                    println!("{map}: {}{}", walk.join(" -> "), if last.accepted { "  ACCEPTED" } else { "  not accepted" });
                    outs.push(last.to_json(&cfg));
                }
                write_rows(&out, &outs)?;
            }
            println!("{} rows in {:.1}s -> {out}", outs.len(), t0.elapsed().as_secs_f64());
        }
        _ => {
            eprint!("{BALANCE_USAGE}");
            return Ok(2);
        }
    }
    Ok(0)
}

const MAPGEN_USAGE: &str = "\
ember mapgen: generated maps (GENERAL_ENV.md §3, src/mapgen.rs) and placed encounters

  ember mapgen gen --family F[,F..]|all --seeds A..B|N --out DIR [--width LO-HI] [--height LO-HI] [--version K]
      one map file per (family, seed): DIR/<name>.json, a natural20 EncounterSpec (format 1)
      with only the map ({name, rows, ember}), plus DIR/maps.jsonl (one index line per map)
  ember mapgen stats --family F[,F..]|all --seeds A..B|N [--width LO-HI] [--height LO-HI] [--version K]
      distribution of size, floor ratio, openness, diameter, rejected draws and cut squares
      (squares whose loss splits the floor; caves/v2 repair counts); writes nothing
  --version K: generator version (2, the default: no cut squares; 1: the G3 generators)
  ember mapgen show <map.json|dir>...     the rows and the measured stats
  ember mapgen show --json <map.json|dir>...  one JSON line per map: {file, name, stats}, stats as
                                          ember.stats (exact los_pairs; hand-made maps, GENERAL_ENV.md, Hand maps)
  ember mapgen check <map.json|dir>...    load and validate (builder rules, and the family's
                                          checks for a generated map); exit 1 on any failure
  ember mapgen place --rows R.jsonl --out DIR [--games K (1)] [--seed S (0)] [--max-rounds R (30)]
      catalog rows (map inline or fixed) placed by the zone sampler (src/layout.rs): game k of
      row `id` uses the layout and dice seeds of `ember balance` (game_seeds(S, id, k); the dice
      seed is masked to 31 bits); writes DIR/<family>/<id>_k<k>.json, the placed EncounterSpec
      (map `ember` kept) plus a `record` block {seed, max_rounds, meta} for
      validation/record_specs.py
  common: --threads T (all)
";

fn cmd_mapgen(args: &[String]) -> i32 {
    match mapgen_main(args) {
        Ok(code) => code,
        Err(e) => {
            eprintln!("ember mapgen: {e}");
            2
        }
    }
}

fn parse_range(v: &str) -> Result<(i32, i32), String> {
    match v.split_once('-') {
        Some((a, b)) => Ok((a.parse().map_err(|_| format!("range {v}"))?, b.parse().map_err(|_| format!("range {v}"))?)),
        None => {
            let n = v.parse().map_err(|_| format!("range {v}"))?;
            Ok((n, n))
        }
    }
}

fn parse_seeds(v: &str) -> Result<std::ops::Range<u64>, String> {
    match v.split_once("..") {
        Some((a, b)) => {
            let (a, b): (u64, u64) = (a.parse().map_err(|_| format!("--seeds {v}"))?, b.parse().map_err(|_| format!("--seeds {v}"))?);
            Ok(a..b)
        }
        None => Ok(0..v.parse().map_err(|_| format!("--seeds {v}"))?),
    }
}

fn mapgen_main(args: &[String]) -> Result<i32, String> {
    use ember_rs::mapgen::{self, Family, GenConfig};
    use rayon::prelude::*;
    use serde_json::{json, Value};
    let Some(sub) = args.first().map(String::as_str) else {
        eprint!("{MAPGEN_USAGE}");
        return Ok(2);
    };
    if sub == "--help" || sub == "-h" || sub == "help" {
        print!("{MAPGEN_USAGE}");
        return Ok(0);
    }
    let (pos, opts) = split_args(&args[1..], &["--json"]);
    let opt = |name: &str| opts.iter().rev().find(|(k, _)| k == name).map(|(_, v)| v.clone());
    let json_out = opts.iter().any(|(k, _)| k == "--json");
    let known = ["--family", "--seeds", "--out", "--width", "--height", "--threads", "--rows", "--games", "--seed", "--max-rounds", "--version", "--json"];
    if let Some((k, _)) = opts.iter().find(|(k, _)| !known.contains(&k.as_str())) {
        return Err(format!("unknown option {k} (ember mapgen --help)"));
    }
    if let Some(t) = opt("--threads") {
        let t: usize = t.parse().map_err(|_| format!("--threads {t}"))?;
        rayon::ThreadPoolBuilder::new().num_threads(t).build_global().map_err(|e| e.to_string())?;
    }
    let families = || -> Result<Vec<Family>, String> {
        let v = opt("--family").ok_or("--family F[,F..]|all is required")?;
        if v == "all" {
            return Ok(mapgen::FAMILIES.to_vec());
        }
        v.split(',').map(|f| Family::from_name(f).ok_or(format!("unknown family {f} (open, pillars, rooms, caves)"))).collect()
    };
    let config = |f: Family| -> Result<GenConfig, String> {
        let version = opt("--version").map_or(Ok(mapgen::LATEST), |v| v.trim_start_matches('v').parse().map_err(|_| format!("--version {v}")))?;
        GenConfig::for_family(f)
            .with_version(version)?
            .with_size(opt("--width").map(|v| parse_range(&v)).transpose()?, opt("--height").map(|v| parse_range(&v)).transpose()?)
    };
    let generate_all = || -> Result<Vec<Result<mapgen::GenMap, String>>, String> {
        let seeds = parse_seeds(&opt("--seeds").ok_or("--seeds A..B|N is required")?)?;
        let mut jobs = Vec::new();
        for f in families()? {
            let cfg = config(f)?;
            for s in seeds.clone() {
                jobs.push((f, s, cfg.clone()));
            }
        }
        Ok(jobs.par_iter().map(|(f, s, cfg)| mapgen::generate(*f, *s, cfg)).collect())
    };
    let t0 = Instant::now();
    match sub {
        "gen" => {
            let out = PathBuf::from(opt("--out").ok_or("--out DIR is required")?);
            std::fs::create_dir_all(&out).map_err(|e| format!("{}: {e}", out.display()))?;
            let maps = generate_all()?;
            let mut index = Vec::new();
            let mut failed = 0;
            for m in maps {
                match m {
                    Ok(m) => {
                        let file = format!("{}.json", m.name);
                        std::fs::write(out.join(&file), m.to_json_line() + "\n").map_err(|e| format!("{file}: {e}"))?;
                        let st = &m.stats;
                        println!(
                            "{:<28} {:>2}x{:<2} floor {:>3} ({:.3})  openness {:.3}  diameter {:>2}  attempt {}",
                            m.name, st.w, st.h, st.floor, st.floor_ratio, st.openness, st.diameter, m.attempt
                        );
                        index.push(json!({"name": m.name, "file": file, "family": m.family.name(), "generator": m.generator(),
                                          "seed": m.seed, "attempt": m.attempt, "stats": mapgen::stats_json(st)}));
                    }
                    Err(e) => {
                        eprintln!("{e}");
                        failed += 1;
                    }
                }
            }
            write_rows(out.join("maps.jsonl").to_str().unwrap(), &index)?;
            println!("{} maps -> {} ({failed} failed) in {:.1}s", index.len(), out.display(), t0.elapsed().as_secs_f64());
            Ok(if failed > 0 { 1 } else { 0 })
        }
        "stats" => {
            let maps = generate_all()?;
            let mut by: std::collections::BTreeMap<&'static str, Vec<mapgen::GenMap>> = Default::default();
            let mut failed = 0;
            for m in maps {
                match m {
                    Ok(m) => by.entry(m.family.name()).or_default().push(m),
                    Err(e) => {
                        eprintln!("{e}");
                        failed += 1;
                    }
                }
            }
            let q = |mut v: Vec<f64>| -> String {
                v.sort_by(|a, b| a.partial_cmp(b).unwrap());
                let at = |p: f64| v[((v.len() - 1) as f64 * p).round() as usize];
                format!("{:.3} / {:.3} / {:.3} / {:.3} / {:.3}", at(0.0), at(0.1), at(0.5), at(0.9), at(1.0))
            };
            println!("min / p10 / median / p90 / max");
            for (f, ms) in &by {
                println!("{f}: {} maps", ms.len());
                println!("  width      {}", q(ms.iter().map(|m| m.stats.w as f64).collect()));
                println!("  height     {}", q(ms.iter().map(|m| m.stats.h as f64).collect()));
                println!("  floor      {}", q(ms.iter().map(|m| m.stats.floor as f64).collect()));
                println!("  floor ratio {}", q(ms.iter().map(|m| m.stats.floor_ratio).collect()));
                println!("  openness   {}", q(ms.iter().map(|m| m.stats.openness).collect()));
                println!("  diameter   {}", q(ms.iter().map(|m| m.stats.diameter as f64).collect()));
                println!("  attempts   {}", q(ms.iter().map(|m| m.attempt as f64).collect()));
                let cuts: Vec<Vec<mapgen::Cut>> = ms.iter().map(|m| mapgen::cut_squares(&m.grid)).collect();
                let with = |k: usize| cuts.iter().filter(|c| mapgen::max_cut_piece(c) >= k).count();
                println!("  cut squares {}", q(cuts.iter().map(|c| c.len() as f64).collect()));
                println!("  largest cut-off part {}", q(cuts.iter().map(|c| mapgen::max_cut_piece(c) as f64).collect()));
                println!(
                    "  maps with a cut square: {} of {} (cutting off >= 2: {}, >= 5: {}, >= 9: {}, >= 20: {})",
                    with(1),
                    ms.len(),
                    with(2),
                    with(5),
                    with(9),
                    with(20)
                );
                let mut why: std::collections::BTreeMap<&str, u32> = Default::default();
                for m in ms.iter() {
                    for (k, n) in &m.rejected {
                        *why.entry(k).or_default() += n;
                    }
                }
                let draws: u32 = ms.iter().map(|m| m.attempt + 1).sum();
                println!(
                    "  rejected draws: {} of {draws} ({:.1}%): {}",
                    draws - ms.len() as u32,
                    100.0 * (draws - ms.len() as u32) as f64 / draws as f64,
                    why.iter().map(|(k, n)| format!("{k} {n}")).collect::<Vec<_>>().join(", ")
                );
                let rep: Vec<&Value> = ms.iter().filter_map(|m| m.params.get("repair")).collect();
                if !rep.is_empty() {
                    let f = |k: &str| q(rep.iter().map(|r| r[k].as_f64().unwrap_or(0.0)).collect());
                    println!("  repair steps {}", f("steps"));
                    println!("  repair filled {}", f("filled"));
                    println!("  repair carved {}", f("carved"));
                    let n = |k: &str| rep.iter().filter(|r| r[k].as_u64().unwrap_or(0) > 0).count();
                    println!("  maps repaired: {} with pockets walled, {} with necks widened (of {})", n("pockets"), n("necks"), rep.len());
                }
            }
            println!("{failed} failed; {:.1}s", t0.elapsed().as_secs_f64());
            Ok(if failed > 0 { 1 } else { 0 })
        }
        "show" | "check" => {
            if pos.is_empty() {
                return Err(format!("ember mapgen {sub} <map.json|dir>..."));
            }
            let files: Vec<PathBuf> = sources(&pos).into_iter().filter(|p| p.file_name().is_none_or(|n| n != "maps.jsonl")).collect();
            let mut bad = 0;
            for f in &files {
                let res = std::fs::read_to_string(f).map_err(|e| e.to_string()).and_then(|t| mapgen::load_map_json(&t));
                match res {
                    Ok(doc) if json_out => {
                        println!("{}", json!({"file": f.display().to_string(), "name": doc.name, "stats": mapgen::stats_json(&doc.stats)}));
                    }
                    Ok(doc) => {
                        let st = &doc.stats;
                        println!(
                            "{}: {} {}x{} floor {} ({:.3}) openness {:.3} diameter {} family {}",
                            f.display(),
                            doc.name.as_deref().unwrap_or("-"),
                            st.w,
                            st.h,
                            st.floor,
                            st.floor_ratio,
                            st.openness,
                            st.diameter,
                            doc.family.map_or("-", |x| x.name())
                        );
                        if sub == "show" {
                            for r in &doc.grid.rows {
                                println!("  {r}");
                            }
                        }
                    }
                    Err(e) => {
                        println!("{}: INVALID {e}", f.display());
                        bad += 1;
                    }
                }
            }
            if sub == "check" {
                println!("{} maps: {} valid, {bad} invalid", files.len(), files.len() - bad);
            }
            Ok(if bad > 0 { 1 } else { 0 })
        }
        "place" => {
            use ember_rs::catalog::Entry;
            let pool = ContentPool::global();
            let rows_path = opt("--rows").ok_or("--rows FILE is required")?;
            let out = PathBuf::from(opt("--out").ok_or("--out DIR is required")?);
            let games: u64 = opt("--games").map_or(Ok(1), |v| v.parse().map_err(|_| format!("--games {v}")))?;
            let base: u64 = opt("--seed").map_or(Ok(0), |v| v.parse().map_err(|_| format!("--seed {v}")))?;
            let max_rounds: i64 = opt("--max-rounds").map_or(Ok(30), |v| v.parse().map_err(|_| format!("--max-rounds {v}")))?;
            let rows = read_rows(&[rows_path])?;
            let mut written = 0;
            for row in &rows {
                let entry = Entry::from_json(row, pool)?;
                let ember = row.get("map").and_then(|m| m.get("ember")).cloned();
                let family = ember.as_ref().and_then(|e| e.get("family")).and_then(Value::as_str).unwrap_or("fixed").to_string();
                let dir = out.join(&family);
                std::fs::create_dir_all(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
                for k in 0..games {
                    let (layout_seed, dice_seed) = ember_rs::balance::game_seeds(base, &entry.id, k);
                    let placed = entry.place(layout_seed).map_err(|e| format!("{} k {k}: {e}", entry.id))?;
                    let mut spec = entry.spec_json(&placed);
                    if let Some(e) = &ember {
                        spec["map"]["ember"] = e.clone();
                    }
                    let mut meta = json!({"g3": entry.id, "k": k, "seed_base": base, "layout_seed": layout_seed,
                                          "map": entry.map_name, "family": family});
                    for key in ["party", "roster", "layout_family"] {
                        if let Some(v) = row.get(key) {
                            meta[key] = v.clone();
                        }
                    }
                    if let Some(s) = ember.as_ref().and_then(|e| e.get("seed")) {
                        meta["map_seed"] = s.clone();
                    }
                    let rounds = entry.max_rounds.map_or(max_rounds, i64::from);
                    spec["record"] = json!({"seed": dice_seed & 0x7fff_ffff, "max_rounds": rounds, "meta": meta});
                    let file = dir.join(format!("{}_k{k:02}.json", entry.id));
                    std::fs::write(&file, serde_json::to_string(&spec).unwrap() + "\n").map_err(|e| format!("{}: {e}", file.display()))?;
                    written += 1;
                }
            }
            println!("{written} placed specs from {} rows -> {} in {:.1}s", rows.len(), out.display(), t0.elapsed().as_secs_f64());
            Ok(0)
        }
        _ => {
            eprint!("{MAPGEN_USAGE}");
            Ok(2)
        }
    }
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let code = match args.get(1).map(String::as_str) {
        Some("replay") => cmd_replay(&args[2..]),
        Some("bench") => cmd_bench(&args[2..]),
        Some("bench-env") => cmd_bench_env(&args[2..]),
        Some("encode") => cmd_encode(&args[2..]),
        Some("features") => cmd_features(&args[2..]),
        Some("bench-encode") => cmd_bench_encode(&args[2..]),
        Some("balance") => cmd_balance(&args[2..]),
        Some("mapgen") => cmd_mapgen(&args[2..]),
        _ => {
            eprintln!(
                "usage: ember replay <tape|dir>... [-v] [--stop] | ember bench <dir> [--reps N] | \
                 ember bench-env <tape|dir|spec.json>... [--reps N] [--ctrl heroes|monsters|both] [--chooser C] [--scores on|off] | \
                 ember encode <tape|dir|spec.json>... --out FILE.npz|DIR [--team T] [--steps N] [--offset X,Y|random] | \
                 ember features [--markdown] | ember bench-encode <tape|dir|spec.json>... [--reps N] | \
                 ember balance eval|search|tune ... (ember balance --help) | \
                 ember mapgen gen|stats|show|check|place ... (ember mapgen --help)"
            );
            2
        }
    };
    std::process::exit(code);
}
