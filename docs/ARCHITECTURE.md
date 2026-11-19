# Architecture, Presentation API & Parity Design Note

> **Design notes.** Code comments and catalog headers cite the maintainers' internal design notes (`GENERAL_ENV.md`, `ENGINE_DESIGN.md`, `EMBER_DUEL.md`). Those notes are not part of this repository; ask in an issue if a cited section matters to you.

This document sets out the layout of `forests-and-faeries`, the golden-tape strategy, the Rust presentation API & WSGI game server (`engine/src/present.rs`, `ember_rs.WebGame`, `game/server.py` — **implemented in Milestone 2**), and the 14-session `FFArena` lockstep parity suite (`game/tests/test_ff_parity.py`).

---

## 1. Repository Layout

```text
forests-and-faeries/
├── engine/                 # Rust combat engine & PyO3 bindings (from ember-rs)
│   ├── src/                # Core rules, mapgen, pathfinding, native AI, encoding, trace replay
│   ├── content/            # SRD_ALLOWLIST, vocab.json, fixed maps, SRD 5.2.1 creature JSONs
│   ├── ember-py/           # PyO3 cdylib (`ember_rs`: ContentPool, BatchEnv, place, + WebGame)
│   ├── fixtures/           # 148 greedy set-cover natural20 replay tapes (14.01 MiB)
│   ├── tests/              # Rust unit, encoding digest, mapgen & fixture replay suites
│   └── catalogs -> ../catalogs
├── catalogs/               # Public encounter catalogs (*.jsonl)
│   └── private/            # Isolated mausoleum room layouts & catalogs (for public-review decision)
├── rl/                     # General-backend RL trainer (talks strictly to ember_rs / FakeBatchEnv)
│   ├── ember_rl/           # general_env, general_duel, general_model, distill, search, ladder, league, balance
│   └── experiments/        # Host-agnostic experiment configs & launchers (env-var parameterized)
├── game/                   # Forests and Faeries web game
│   ├── frontend/           # Three.js 0.187.0 3D scene, dungeon themes, skinned cast & unit tests
│   ├── static/             # HTML/CSS/JS, 15 rigged project-original GLBs, props & mausoleum textures
│   ├── encounters/         # crypt.json, vault.json (+ encounters/private/mausoleum-*.json)
│   ├── maps/               # vault.json (+ maps/private/mausoleum-*.json)
│   ├── provenance/         # Codex/Tripo/Blender SHA-256 & task-id provenance manifests
│   └── release/            # Static release builder & verifier (make_ff_release.py)
├── docs/                   # ARCHITECTURE.md (this note) and FEATURES.md
├── scripts/                # check_exclusions.py (CI public-hygiene, GLB & git-email gate)
└── SOURCES.md              # Exact upstream commits & 3D asset SHA-256s for porting future fixes
```

### Separation of Private-Source Layouts
All seven mausoleum room layouts (`mausoleum-{hall,rotunda,chapel,forecourt,crypts,catacombs-northeast,catacombs-southwest}`) contain **only** wall grids, generic display props (`sarcophagus`, `brazier`, `pillar`, `altar`), and SRD rosters — zero campaign room names, overlays, or lore. They remain isolated in three matching `private/` subdirectories (`catalogs/private/`, `game/encounters/private/`, `game/maps/private/`) gated behind `FF_PRIVATE_ENCOUNTERS=1` so the final public review can include or drop them cleanly.

---

## 2. Golden Tapes Proposal (`engine/fixtures/` vs Full 303 MiB Corpus)

`ember-rs` uses recorded natural20 dice-and-state tapes as its rules oracle (`Trace::replay`). The full local recording corpus is `2,216` `.jsonl` files (`303.10 MiB`), which is too large for plain Git.

**Proposal — Two-Tier Golden Suite (No Git LFS Required):**
1. **Tier 1 — Committed in plain Git (`engine/fixtures/`, 148 tapes, `14.01 MiB`):**
   Already built by greedy mechanical feature set-cover (`pick_fixtures.py`) over draw tags, spells, Metamagic, class features, reactions, opportunity attacks, thrown daggers, blind square attacks, Mummy *Rotting Fist* & *Dreadful Glare*, Lv 2 Mara & Ilyra, SRD 5.2.1 goblins, generated map families (`open`, `pillars`, `rooms`, `caves`), and off-policy external-decision markers. `cargo test --test fixtures` replays all 148 tapes in a few seconds on every CI push without LFS quota limits (GitHub's free LFS bandwidth cap is 1 GiB/month, which CI checkouts exhaust quickly).
2. **Tier 2 — Optional Full-Corpus Archive (`tapes-v1.tar.zst`, ~26 MiB compressed):**
   Because JSONL tapes compress ~11× with `zstd -19`, the entire 2,216-tape 303 MiB corpus packs into a single ~26 MiB archive that can be attached as an immutable GitHub Release asset on `artnoage/forests-and-faeries` (or stored on the remote test box) and replayed via `ember replay <dir>` whenever engine rules are touched.

*(Open question for Claude's review: confirm Tier 1 in Git + Tier 2 release `.tar.zst`, or prefer tracking `tapes/` via Git LFS?)*

---

## 3. Rust Presentation API & Game Server Proposal

### 3.1 Delivery Boundary: `ember-py` (`Option A`, Recommended) vs Standalone Rust HTTP (`Option B`)

| Criterion | **Option A (Recommended): Rust `present.rs` + `ember_rs.WebGame` PyO3 → Flask/gunicorn `game/server.py`** | **Option B: Pure-Rust HTTP Server (`axum` / `tokio`)** |
| :--- | :--- | :--- |
| **Security & HTTP parity** | Preserves the audited 297-line `server.py` (`GameStore` LRU + 1h TTL + `PER_CLIENT=4` per loopback `X-Real-IP`, `SameSite=Strict` cookies, constant-time `X-CSRF-Token` `403`, stale-revision `409`, expired `410`, 16 KiB body cap, `PUBLIC_FILES`, strict CSP) with minimal diff. | Must re-implement and re-audit cookie/CSRF/proxy-IP/CSP/static-allowlist edge cases in Rust. |
| **Cargo dependency footprint** | **Zero new Cargo crates** (`ember-rs` stays at 4 crates: `serde`, `serde_json`, `serde_norway`, `rayon`). | Adds ~60 transitive crates (`tokio`, `hyper`, `axum`, `tower`, `http`, etc.). |
| **Deployment & ops** | Drop-in compatible with existing gunicorn `127.0.0.1:8795` socket; RSS drops from hundreds of MB to ~25 MB without `natural20`. | Single native binary (~5 MB), no Python needed at runtime. |
| **Testability** | In-process `pytest` compares `WebGame` dicts directly against reference `FFArena` JSONs and tests HTTP routes via `Flask.test_client()`. | Requires HTTP subprocess harness or duplicated Rust test glue. |

**Recommendation:** Implement **100% of the game state, legal candidate view generation, timeline/effect recording, dice capture, and `wire()` compaction in pure Rust (`engine/src/present.rs`)** returning `serde_json::Value` / JSON strings, and expose a thin ~80-line `#[pyclass] WebGame` in `ember-py` consumed by `game/server.py` (**Option A**). Because all presentation logic lives in `engine/src/present.rs` rather than Python, wrapping it in a tiny Rust HTTP binary later if desired is purely mechanical.

### 3.2 Exact Rust Presentation Contract (`engine/src/present.rs`)

`present::WebGame` implements the exact state and mutation lifecycle consumed by `game/static/app.js` and `game/frontend/scene3d.js`:

1. **Lifecycle & Setup (`phase: "setup" | "combat" | "ended"`):**
   - `WebGame::new(level_spec, seed, revision, csrf_token)`: constructs the encounter on `Grid` + `ContentPool::global()`, validates placements (`setup(placements, monster_control)`), and starts in `setup` phase with `"Place figures, then Start combat. Each square is 5 feet."`.
   - `start()`: rolls initiative through `Fight::new`, captures `initiative_draws` (`[{who, tag, sides, mode, v}]`), auto-advances AI-controlled monsters until the first human-controlled turn (or combat end), and increments `revision`.
   - `perform(action_id)` / `end_turn()` / `advance(autoplay)`: executes only cached `r{revision}-{index}` candidate IDs, advances any following AI turns when `monster_control == "ai"`, increments `revision`, and returns `wire(state)`.

2. **Dice Draw Capture (`Trace` hook):**
   - Extend `Trace` (`engine/src/trace.rs`) with a lightweight draw sink (`capture_draws: Option<Vec<RecordedDraw>>`) populated inside `Trace::draw` for both `Mode::Free` and `Mode::Replay` without altering `FastRng` state or `draws` counter.
   - Each draw emits `{"who": uid, "tag": tag, "sides": sides, "mode": "n"|"a"|"d", "v": i32 | [i32, i32]}`, matching `webgame/ff/dice.py` and `n20_record.py`.
   - Draws during `Fight::new` with `"initiative"` in `tag` populate `state["initiative_draws"]`; any start-of-turn draw on turn 1 carries into the first timeline record's `draws`.

3. **Human Candidate List & `wire()` Compaction:**
   - Enumerates legal actions for `current_turn()` using `Fight`'s existing move/attack/spell/feature generators plus `flee_step` when Turned & incapacitated:
     - Filters redundant self-casts / full-HP `second_wind`, attaches AoE `area` squares, `hits` (enemy count), and `allies` (friendly-fire count) for `burning_hands`, `thunderwave`, `shatter`, `dragons_breath_exhale`, `turn_undead`, and `preserve_life`.
     - Sorts candidates by the canonical `FFArena` tuple `(kind, spell_or_weapon, target_ids, destination, point, at_level, metamagic, mode, thrown, path)` and assigns `id = "r{revision}-{i}"`.
     - Includes `path: [[x, y], ...]` and per-path `cost` (in feet) on every `move` row, `(thrown)` option/label on thrown daggers, and bonus-action `Disengage` / `Hide` labels on goblins.
   - Compacts `actions` into `actions` + `action_defs` and filters `timeline` to `record.revision >= state.revision` exactly as `FFArena.wire()` does.

4. **Action Timeline Records, Snapshots & Effects:**
   - Expand `Fight`'s action execution with an optional `EventSink` (`Option<&mut PresentSink>`, zero overhead when `None` in RL `BatchEnv`!) recording combat events at the exact point each roll/outcome commits:
     - **Before / After Snapshots:** `{units: [{id, x, y, hp, max_hp, conditions, dead, marks, str_loss}], forces: [...]}`.
     - **Opportunity Attacks Inside Movement:** When `Act::Move(path)` triggers one or more opportunity attacks before reaching the destination, each OA flushes its own standalone timeline record (`opportunity: true` on both the record and its effects, with its own `before`/`after` snapshots at the trigger square, `descriptor`, and `draws`) **immediately before** the move's timeline record — matching `FFArena._record_action`.
     - **Structured Effects (`record["effects"]`):**
       - `attacked` / `miss`: `style` (`slash`, `arrow`, `rotting_fist`, `dreadful_glare`, spell style, etc.), `outcome` (`hit` | `miss`), `crit: bool`, `reaction: bool`, `opportunity: bool`, `amount: i32`, `save: "made" | "failed"` (for save-based spells/glare; `"RESISTS"` text on saved `dreadful_glare`).
       - **Damage Riders (`rider` / `rider_types`):** NPC `additional_damage` (e.g. Mummy `3d6` necrotic, Ghast necrotic, Wight Life Drain) folds onto the parent hit effect (`effect["rider"]`, `effect["rider_types"]`), matching `FFArena._rider_event`.
       - **No-Damage Save Attacks (`_glare_effects`):** Failed Mummy *Dreadful Glare* saves emit `{style: "dreadful_glare", outcome: "hit", amount: 0, save: "failed", text: "FRIGHTENED" | "SAVE FAILED"}`.
       - **Status & Special Events:** `second_wind`, `heal`, `turn_undead`, `preserve_life`, `divine_spark`, `undead_fortitude` (`"UNDEAD FORTITUDE"`), `strength_drain` (`str_loss`), `weapon_mastery` (`sap`, `graze`, `nick`, `cleave`), `died`, condition flourishes, and zero-event action flourishes (`DODGE`, `DASH`, `DISENGAGE`, `HIDE`, `STAND`, `MAGE ARMOR`, `MIRROR IMAGE`).
       - **Turn-Boundary Triggers (`_pending_effects`):** Start-of-turn Ghast *Stench* saves and *Command*/*Turned* effects prepend onto the next emitted timeline record.

---

## 4. Game-Server Parity Plan

1. **Oracle Reference Extraction (Read-Only from `natural20-metaskepsis`):**
   - Run a standalone oracle script in the old repo driving `FFArena` across every preset in:
     - `crypt` (6 presets: *Bone Patrol*, *Ghoul Pack*, *Haunting*, *Wight's Retinue*, *Two Wights*, *The Whole Crypt*),
     - `vault` (3 presets: *Goblin Raiders*, *The Boss's Guard*, *The Whole Warband*),
     - `private/mausoleum-*` (7 rooms × 3 presets = 21 presets).
   - Record two suites per encounter family:
     - **Suite A — Native AI vs Native AI:** 20 seeds per preset (600 full games), exercising initiative, multiattack, OA reactions, Shield, Redirect Attack, Nimble Escape, Turn Undead, Preserve Life, Spiritual Weapon, Dragon's Breath, Metamagic, Thrown Daggers, Sap, Undead Fortitude, Strength Drain, Life Drain, Rotting Fist curse/instant-death, and Dreadful Glare.
     - **Suite B — Off-Policy Scripted Player Choices:** deterministic chooser picking non-AI legal actions (`dodge`, `dash`, `disengage_bonus`, `hide_bonus`, `second_wind`, `action_surge`, upcast spells, manual setup placements, early `end-turn`).

2. **Exact Draw-Stream Replay Comparison (`Trace::replay`):**
   - Because `natural20` uses Python `MT19937` (`random.Random`) while `ember-rs` free play uses `FastRng` (`xoshiro256**`), feeding each oracle game's recorded `initiative_draws` + per-record `draws` into `WebGame` via `Trace::replay` isolates rules & presentation parity from PRNG polynomial differences:
     - **Engine parity assertions:** every draw `(who, tag, sides, mode)` consumed in exact lockstep (`0` leftover draws), identical turn order, identical legal candidate descriptors & paths at every human decision, identical unit `(x, y, hp, max_hp, ac, conditions, dead, marks, str_loss)` after every step, identical `round`, `finished`, and `winner`.
     - **Presentation parity assertions:** identical timeline record count, `actor_id`, `kind`, `opportunity`, `executed_path`, and effect sequence `(type, style, source_id, target_id, outcome, crit, amount, rider, save)`.
   - Commit a curated golden subset (`game/tests/fixtures/*.json`, ~2–3 MiB) into this repo so `pytest` verifies full `FFArena` presentation parity on every CI run without `natural20`.

3. **Disagreement Protocol:**
   - `natural20` remains the sole rules authority. If any seeded encounter or off-policy trace diverges between `ember-rs` and `FFArena` (including the in-progress *Command* scoring edge case), we **do not alter rules unilaterally** — we log the exact encounter, seed, step index, and diff in `communication.md` for Claude's review.
