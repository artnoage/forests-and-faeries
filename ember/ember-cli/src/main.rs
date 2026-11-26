//! `ember-cli`: SRD 5.2.1 content validator, supplied-draw rule-18 tape
//! verifier, mutation harness, and `FightState::clone()` / `Fight::fork()` benchmark.

mod bench;
mod tape;

use std::path::PathBuf;
use std::process::ExitCode;

fn default_content_dir() -> PathBuf {
    let local = PathBuf::from("content");
    if local.join("SRD_ALLOWLIST").is_file() {
        return local;
    }
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../content")
}

fn usage() {
    eprintln!(
        "Usage:\n  \
         ember-cli validate [--content-dir DIR]\n  \
         ember-cli replay <tape.jsonl> [--stop-line N] [--content-dir DIR] [--dump-diff FILE]\n  \
         ember-cli bench [--iters N] [--content-dir DIR]"
    );
}

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.is_empty() {
        usage();
        return ExitCode::from(2);
    }

    let mut content_dir = default_content_dir();
    match args[0].as_str() {
        "validate" => {
            let mut i = 1;
            while i < args.len() {
                if args[i] == "--content-dir" && i + 1 < args.len() {
                    content_dir = PathBuf::from(&args[i + 1]);
                    i += 2;
                } else {
                    eprintln!("Unknown argument: {}", args[i]);
                    usage();
                    return ExitCode::from(2);
                }
            }
            match ember_content::load_content_dir(&content_dir) {
                Ok((_, summary)) => {
                    println!(
                        "CONTENT OK: {} creatures (allowlist {}), {} effects, {} standalone abilities ({} compiled total)",
                        summary.creatures,
                        summary.allowlist_entries,
                        summary.effects,
                        summary.abilities,
                        summary.total_compiled_abilities,
                    );
                    ExitCode::SUCCESS
                }
                Err(e) => {
                    eprintln!("CONTENT FAIL: {e}");
                    ExitCode::from(1)
                }
            }
        }
        "replay" => {
            if args.len() < 2 {
                usage();
                return ExitCode::from(2);
            }
            let tape_path = PathBuf::from(&args[1]);
            let mut stop_line: Option<usize> = None;
            let mut dump_diff: Option<PathBuf> = None;
            let mut i = 2;
            while i < args.len() {
                match args[i].as_str() {
                    "--stop-line" if i + 1 < args.len() => {
                        stop_line = match args[i + 1].parse() {
                            Ok(n) => Some(n),
                            Err(_) => {
                                eprintln!("Invalid --stop-line: {}", args[i + 1]);
                                return ExitCode::from(2);
                            }
                        };
                        i += 2;
                    }
                    "--content-dir" if i + 1 < args.len() => {
                        content_dir = PathBuf::from(&args[i + 1]);
                        i += 2;
                    }
                    "--dump-diff" if i + 1 < args.len() => {
                        dump_diff = Some(PathBuf::from(&args[i + 1]));
                        i += 2;
                    }
                    other => {
                        eprintln!("Unknown argument: {other}");
                        usage();
                        return ExitCode::from(2);
                    }
                }
            }
            let (db, _) = match ember_content::load_content_dir(&content_dir) {
                Ok(v) => v,
                Err(e) => {
                    eprintln!("CONTENT FAIL: {e}");
                    return ExitCode::from(1);
                }
            };
            match tape::verify_tape(db, &tape_path, stop_line) {
                Ok(rep) => {
                    println!(
                        "REPLAY OK: {} (sha256={}, lines={}, decisions={}, actions={}, states={}, draws={}/{}, stop_line={:?})",
                        tape_path.display(),
                        &rep.tape_sha256[..16],
                        rep.lines_checked,
                        rep.decisions_checked,
                        rep.actions_checked,
                        rep.states_checked,
                        rep.draws_consumed,
                        rep.draws_in_range,
                        stop_line,
                    );
                    ExitCode::SUCCESS
                }
                Err(diff) => {
                    let json = serde_json::to_string_pretty(&diff)
                        .unwrap_or_else(|_| format!("{diff:?}"));
                    if let Some(p) = dump_diff {
                        let _ = std::fs::write(&p, &json);
                    }
                    eprintln!("REPLAY MISMATCH at JSONL line {}:\n{json}", diff.jsonl_line);
                    ExitCode::from(3)
                }
            }
        }
        "bench" => {
            let mut iters: usize = 200_000;
            let mut i = 1;
            while i < args.len() {
                match args[i].as_str() {
                    "--iters" if i + 1 < args.len() => {
                        iters = args[i + 1].parse().unwrap_or(200_000);
                        i += 2;
                    }
                    "--content-dir" if i + 1 < args.len() => {
                        content_dir = PathBuf::from(&args[i + 1]);
                        i += 2;
                    }
                    other => {
                        eprintln!("Unknown argument: {other}");
                        usage();
                        return ExitCode::from(2);
                    }
                }
            }
            let (db, _) = match ember_content::load_content_dir(&content_dir) {
                Ok(v) => v,
                Err(e) => {
                    eprintln!("CONTENT FAIL: {e}");
                    return ExitCode::from(1);
                }
            };
            bench::run_bench(db, iters);
            ExitCode::SUCCESS
        }
        other => {
            eprintln!("Unknown subcommand: {other}");
            usage();
            ExitCode::from(2)
        }
    }
}
