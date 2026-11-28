# Forests and Faeries

A free, non-commercial research project and web game about tactical SRD 5e combat on a square grid. It has three parts that share one rules engine:

- **a fast Rust engine** that is kept rule for rule identical to [Natural20](https://github.com/jedld/natural_20.py);
- **reinforcement learning for both sides**: networks that play the heroes and networks that play the monsters, trained against each other and against the built-in AI;
- **a 3D browser game** that you can play right now.

The game is live at **https://metaskepsis.com/forests-and-faeries/**.

If you like it, please **⭐ star this repository** and **[⭐ star Natural20](https://github.com/jedld/natural_20.py)**, the engine it is built on (see below). And tell us what you would like to see next: [requests are very welcome](#requests-and-contributions).

## What you can play

- **Practice:** single fights graded **Easy, Medium, Hard and Unbeatable**. The grades are measured: the built-in AI and our trained heroes play every level many times, and the first 36 levels were also played by six language-model players and graded by how many of all these players could beat them (see [docs/EXPERIMENTS.md](docs/EXPERIMENTS.md)).
- **Three story campaigns** of eight chapters each, with a world map and scenes between the fights: *Off the Map*, *The Unrung Bell* and *The Unsung Wood*. A fourth, *The Tall Country*, is coming.
- **Seven heroes** at levels 1 to 3: Guy (Fighter), Elion (Cleric), Curogana (Sorcerer), Chruna (Barbarian), Mara (Fighter), Ilyra (Wizard) and **Vesper the Bard**.
- **SRD 5.2.1 monsters**: undead, goblins and kobolds, fey creatures of the forest, and the Large **Ogre** and **Owlbear**, which fill 2×2 squares and can squeeze through narrow gaps.
- **Hidden information:** invisible and hidden creatures stay hidden. *See Invisibility* reveals them, and you can attack a square where you suspect one.
- **Original 3D figures:** every character model is project-original (concept sheets, image-to-3D, rigged and animated in Blender; provenance in `game/provenance/`). The music and effects come from a synthesizer in this repository ([docs/SOUND.md](docs/SOUND.md)).

Monsters in the live game are played by the engine's built-in AI.

## The engine: identical to Natural20, and fast

`engine/` reimplements Natural20's rules and its heuristic AI in Rust. "Identical" is checked, not assumed:

- **Natural20 games replayed in Rust.** Recorded games are replayed decision by decision and dice roll by dice roll. `engine/fixtures/` holds 185 such tapes (173 recorded from Natural20, and 12 reference games for the Large-creature rules that were also replayed in Natural20); `cargo test` replays them all.
- **Rust games replayed in Natural20.** Games the Rust engine plays, including the trainer's games (recorded with `BatchEnv.record`), are replayed in Natural20 and must match there too. Training runs do this every day.
- **Versioned rules.** Every rules change gets a new rule version. Older versions stay available and byte-identical, so recorded games and running experiments keep their exact rules. The current version is **21**, which follows Joseph Dayo's own rulings on upstream Natural20 (squeezing, cover between multi-square creatures, grapple drags). When the two engines disagree, we fix both and report the difference upstream.

## Built on Natural20: thank you, Joseph Dayo

Everything here stands on **[Natural20](https://github.com/jedld/natural_20.py)**, the open-source 5e rules engine by **Joseph Emmanuel Dayo** ([@jedld](https://github.com/jedld)). He has been building it in the open since 2020, first in [Ruby](https://github.com/jedld/natural_20) and since 2024 in Python, and shares it under the MIT licence.

Natural20 is much more than a dice roller. It is a complete 5e rules engine:
- both the 2014 and the 2024 rules;
- turn order, movement, reactions and opportunity attacks;
- conditions, and more than a hundred spells;
- heuristic monster AI;
- its own virtual tabletop, with language-model NPCs and an MCP interface for AI agents.

For this project it gave three things:

- **The game began on Natural20.** Forests and Faeries was first played directly on its battle loop, actions, spells and heuristic AI; every roll and result came from his code.
- **The Rust engine is a port of Natural20.** `engine/` reimplements its rules and its native AI, and is checked against recordings of Natural20 games, decision by decision and dice roll by dice roll. Before the live game moved to the Rust engine, 533 recorded Natural20 sessions replayed with no difference at all.
- **The reinforcement-learning work started there too.** The first agents trained against Natural20 itself, and its AI remains the reference opponent every network is measured against.

Writing a rules engine this complete, with turn order, reactions, spells, conditions and an AI that plays sensibly, is years of careful work, and Joseph gave it away. If you enjoy this project, please **[⭐ star Natural20](https://github.com/jedld/natural_20.py)**, and this repository too.

## Requests and contributions

**Ask for things.** This is the most useful thing you can do for the project. A hero class or subclass, a monster, a spell, an encounter, a map, a rules fix, something in the 3D game, an idea for the reinforcement-learning side: [open an issue](https://github.com/artnoage/forests-and-faeries/issues/new) and tell us what you would like and why. We read every request and build what we can.

**Offers are welcome too:**
- bug reports, balance notes and playtest reports (the encounter and the seed help);
- pull requests: please open an issue first for anything large, so we can agree on the shape;
- models, textures and other assets, if they are your own work and you are happy to share them under an open licence.

**One limit:** rules content has to come from the free System Reference Documents (SRD 5.1 and 5.2.1, CC BY 4.0). Material that exists only in paid books, and trademarked names, can't go in.

## Repository layout

| Folder | What it holds |
|---|---|
| `engine/` | The Rust engine (`ember-rs`): rules, built-in AI, map generator, observation encoder, the batched environment, the web game's presentation layer, golden replay tapes, and the Python module `ember_rs` (`engine/ember-py`). The game and the trainer both run on it. |
| `ember/` | A clean rewrite of the engine: a data-driven SRD 5.2.1 core, a content compiler and a replay CLI. Phase 0 is done and the work is paused; nothing uses it yet. |
| `rl/` | The Python trainer `ember_rl`: two-team PPO in alternating phases, a league of past opponents, decision-time lookahead search, distillation of the built-in AI, and a Bradley–Terry rating ladder. It talks only to `ember_rs.BatchEnv`. |
| `game/` | The web game: Three.js client, the GLB figures, levels (`game/encounters/`, `game/maps/`), story campaigns (`game/story/`), sound, the Flask/gunicorn server backed by `ember_rs.WebGame`, and the static release builder. |
| `catalogs/` | Encounter catalogs (JSON Lines): the fights the trainer and the grading tools play, each with its map, party, monsters, layout rule and measured balance. |
| `docs/` | [Architecture](docs/ARCHITECTURE.md), [observation features](docs/FEATURES.md), [story mode](docs/STORY_MODE.md), [sound](docs/SOUND.md) and the [experiment history](docs/EXPERIMENTS.md). |
| `scripts/` | `check_exclusions.py`, the public-hygiene gate run in CI and before every push. |

## The batched environment: `ember_rs.BatchEnv`

`BatchEnv` is the data loader of the learning side. It runs many fights at once inside Rust and hands the trainer ready-made numpy arrays. One call steps every slot in parallel (one rayon task per slot, with the Python GIL released), plays the built-in AI's turns and any forced steps until each slot reaches the learner's next decision, and encodes the observations straight into reused buffers.

```python
import ember_rs

env = ember_rs.BatchEnv(256, threads=8, moves="dest", catalog="catalogs/l3-roster-v1.jsonl",
                        feature_version="ember-gen-v4", rule_version=17)
# one episode per slot: (encounter id, map_seed, layout_seed, dice_seed[, offset_x, offset_y])
fight = "l3rf-chruna+curogana+ilyra-hall_32x32-sight-specter2+wight1+goblin_minion1+goblin_boss1"
specs = [(fight, 0, 7 + i, 1000 + i) for i in range(256)]
ctrl = [{"heroes": "external", "monsters": "native"}] * 256   # who plays each side
info = env.reset(range(256), specs, ctrl)    # arrays: done, winner, round, score, actor, ...
obs = env.observe(range(256))                # creatures, map, global, cands, cand_mask, native_choice, ...
info = env.step(range(256), rows)            # one chosen row per slot
```

**Where the fights come from.** A catalog row names a map (a fixed map, or the rows of a generated map together with the generator and seed that made it), a party of heroes, a monster roster, a layout rule and, in most catalogs, the measured balance of the fight. Maps come from `ember mapgen` (families `open`, `pillars`, `rooms` and `caves`). `ember balance` plays the built-in AI against itself to measure and tune each fight, so the training fights sit near even odds. On the Python side, `ember_rl.general_env.SpecSource` samples training fights by party, map family, balance band and tier, and builds fixed, stratified development and evaluation lists.

**Seeds and determinism.** The layout seed places the creatures and, unless an offset is given, where the map sits on the 32×32 canvas. The dice seed starts the slot's own dice stream. Slots are independent, so a fight's result does not depend on the batch size or the thread count. `snapshot`/`restore` copy a slot, and `fork` copies many slots in one parallel call, optionally with fresh dice seeds and other controllers: that is how the lookahead search plays out possible futures. `record(slot, path)` writes any game as a tape that `ember replay` and the Natural20 checker accept.

**Who plays.** In each slot each side is `external` (the learner chooses) or `native` (the built-in AI plays), and `external_units` can hand single creatures to the learner. With `scores=True` the observation also carries the built-in AI's score for every legal row and its choice (`native_raw`, `native_choice`). The trainer uses them for distillation and never feeds them to the network.

**What the network sees.** Fixed-layout arrays: up to 24 creature tokens with stats, conditions, resources and threats; map channels on a 32×32 canvas; a global vector; pairwise relations between creatures (who frightens whom, who sees whom, who is in whose reach); and one row per legal action, with pointers to its targets and its square. Hidden creatures are masked per team: their tokens lose their position and they vanish from the map. The layouts are versioned (`ember-gen-v1` to `v5`, every feature named in [docs/FEATURES.md](docs/FEATURES.md)), so a checkpoint always meets the inputs it was trained on.

**Moves.** `moves="step"` offers Natural20's own one-square moves. `moves="dest"` offers one row per reachable square instead. The engine then walks the shortest path as one-square moves and stops early when something happens on the way (an opportunity attack or another reaction, damage or a new condition, a newly seen enemy), so the learner can decide again. Both modes play exactly Natural20's rules.

**Objective and info.** `info` reports `terminated` (elimination, or the round limit under the health objective), `truncated`, `winner`, `round`, a health score (the difference between the two teams' remaining hit-point and standing-creature fractions, from −1 to +1), a shaping potential, and how many squares the deciding creature walked. The round limit (`max_rounds`, default 30) and a cap on decisions per game (`max_steps`) end runaway fights.

**Rule versions.** `rule_version` picks the rules, from 1 to the current 21. It defaults to 17, the version the current training runs started on, so that they keep exact rules; newer rules are opt-in.

**Speed.** On 8 hardware threads (4 physical cores) of a cloud AMD EPYC server, 256 slots stepped and observed at about **30,900 decisions per second**, and `fork` copied about **148,000 games per second** (measured on 2026-11-26). Destination moves cost more, because a decision then has 5 to 10 times as many rows. The engine is not what limits training: a run on one GPU makes a few hundred learner decisions per second, most of the time going to the network and the search. For comparison, the first Python environment on Natural20 made about 29 steps per second on one core.

For tests without the wheel, `ember_rl.fake_env.FakeBatchEnv` implements the same protocol in pure Python.

## Reinforcement learning

`python -m ember_rl.duel` trains a hero network and a monster network (entity transformers over the arrays above) with PPO. In the standard recipe the two sides take turns. A phase trains one side against the other side's frozen best policy or a league of its past snapshots, and ends when a check on fixed development fights shows the learner has improved, or when its budget runs out. Lookahead search on `BatchEnv.fork` improves the training targets. `python -m ember_rl.ladder` rates every archived snapshot of every run against the others and against the built-in AI.

What we have run, and what we learned, is in **[docs/EXPERIMENTS.md](docs/EXPERIMENTS.md)**.

## Running the web game locally

```bash
maturin develop --release --manifest-path engine/ember-py/Cargo.toml
pip install -r game/requirements.lock
gunicorn -w 1 -b 127.0.0.1:8795 game.server:app
```

## Quick verification

```bash
# 1. Public-hygiene, SRD allowlist, GLB header, asset-version & release checks
python3 scripts/check_exclusions.py
python3 game/release/make_ff_release.py --check
python3 -m game.tools.asset_versions --check

# 2. Rust engine & golden fixture replay tests
cargo test --release --manifest-path engine/Cargo.toml

# 3. Game backend, static release & FFArena lockstep parity suite
PYTHONPATH=. pytest -q game/tests

# 4. RL general-backend unit & trainer suite
PYTHONPATH=rl pytest -q rl/ember_rl/tests

# 5. Web game frontend bundle reproducibility & unit tests
cd game/frontend && npm ci && npm run build && git diff --exit-code ../static/scene3d.js && node --test
```

See [`SOURCES.md`](SOURCES.md) for upstream commit provenance and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the golden-tape strategy, the Rust presentation API (`WebArena` / `ember_rs.WebGame`) and the `FFArena` lockstep parity checks.
