# Forests and Faeries

Clean three-part repository uniting the Rust SRD 5e tactical engine, the general-backend reinforcement learning trainer, and the **Forests and Faeries** 3D tactical web game:

1. **`engine/` (`ember-rs` + `ember-py`):** Deterministic Rust combat simulator, map generator, native heuristic AI, web presentation engine (`present.rs`), golden replay test suite (`engine/fixtures/`), and PyO3 bindings (`ember_rs`: `ContentPool`, `BatchEnv`, `WebGame`, `place`).
2. **`rl/` (`ember_rl`):** General-backend two-team PPO, native-score distillation, batched Gumbel AlphaZero lookahead (`search.py`), PFSP league (`league.py`), and Bradley-Terry rating ladder (`ladder.py`) running purely against `ember_rs.BatchEnv`.
3. **`game/`:** **Forests and Faeries** 3D Three.js client, 16 rigged project-original character GLBs (`game/static/models/*.glb`), encounter & map catalogues (`game/encounters/`, `game/maps/`, with optional room layouts isolated under `private/`), static release builder (`game/release/make_ff_release.py`), Rust-backed Flask/WSGI server (`gunicorn game.server:app`), and lockstep `FFArena` parity suite (`game/tests/test_ff_parity.py`).
4. **`catalogs/`:** Encounter catalogs (`*.jsonl`), with hand-transcribed room layouts isolated in `catalogs/private/`.

The game is live at **https://metaskepsis.com/forests-and-faeries/**.

If you like it, please **⭐ star this repository** and **[⭐ star Natural20](https://github.com/jedld/natural_20.py)**, the engine it is built on (see below). And tell us what you would like to see next: [requests are very welcome](#requests-and-contributions).

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

## Running the Web Game Locally

```bash
maturin develop --release --manifest-path engine/ember-py/Cargo.toml
pip install -r game/requirements.lock
gunicorn -w 1 -b 127.0.0.1:8795 game.server:app
```

## Quick Verification

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

See [`SOURCES.md`](SOURCES.md) for upstream commit provenance and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the repository layout, golden-tape strategy, Rust presentation API (`WebArena` / `ember_rs.WebGame`), and `FFArena` lockstep parity verification.
