# Source Provenance (`SOURCES.md`)

Every component in this repository was exported from audited commits of the maintainers' private development repositories, without importing their Git history, so future rules or trainer fixes can be ported cleanly by diffing from these baselines.

## 1. Upstream Commits

| Component | Source Repository | Baseline Commit | Notes |
| :--- | :--- | :--- | :--- |
| **`engine/` & `catalogs/`** | `ember-rs`, the maintainers' private Rust engine repository (archived; the engine now lives here) | `b40ddddef297556205566f6cc834093fc088d975` | Core Rust engine (including N20-046 timed-condition expiry and Chruna SRD 5.2.1 Level-3 Berserker Barbarian), unified `Fight`/`WebArena` combat driver, `catch_unwind`-guarded `ember-py` PyO3 wheel (`BatchEnv` + `WebGame`), SRD 5.2.1 content pack, sanitized catalogs, and 173 golden replay fixtures (`reference/NATURAL20_COMMIT` = `9d09df739afd726e0b03024001903f5c4a07f7d1`). |
| **`rl/`** | the maintainers' private Natural20 fork | `1418758f80a7ea3229d55d1694184d89cffbf48f` | General-backend trainer (`general_env`, `general_duel`, `general_model`, `distill`, `search`, `search_eval`, `fake_env`, `ladder`, `league`, `balance`, plus shared `model` & `duel` primitives). |
| **`game/` (client, server, encounters, maps, parity fixtures)** | the maintainers' private Natural20 fork | `c0bc4521bf088b6932ad849136f19d53b1d253fa` | Forests and Faeries Three.js client with content-hashed asset URLs (`asset-versions.js`), rebalanced crypt presets + Chruna presets (`mummies_tomb`, `three_bosses`), `game/server.py` + `game/catalogue.py` + `game/requirements.lock` backed by `ember_rs.WebGame`, unstripped full-wire `FFArena` lockstep parity fixtures (`game/tests/fixtures/{public,private}/`), and `game/provenance/*.json`. |

## 2. Project-Original Rigged 3D Figures (`game/static/models/*.glb`)

All 16 figures are 100% project-original meshes generated from Codex front/back concept sheets via Tripo v3.1 (`game/provenance/{heroes,goblins,undead}.json`) and rigged in Blender 5.2.3 LTS (`game/provenance/rigged.json`) with zero third-party geometry, textures, or animations:

| File | Bytes | SHA-256 |
| :--- | :---: | :--- |
| `chruna.glb` | `1,519,332` | `14958090a3931b89507c6fe6c550383599a6dff74e088409b2cd77f9414c073b` |
| `curogana.glb` | `1,145,976` | `cde714b6bd37796377f523e174f5971ed1519bcb45089eb35dfc4521ae2069e4` |
| `elion.glb` | `1,296,796` | `61f4b1a661b7e5ff22c51cc51a555d07e28ea2df68079de191a92ba8afd11a8f` |
| `ghast.glb` | `1,398,952` | `6371391d8711a824ea5d9e082c0e6466f7ed9850171602ce37df258bb962b1cc` |
| `ghoul.glb` | `1,315,756` | `16aa31da33b2416c3454360420eaeae4554aac07a53d778b97f1ee8f23f397ff` |
| `goblin.glb` | `1,410,524` | `f73621e500a9a18e858206804c9d9c0f67b904bda6c057cfb949b16b6451b990` |
| `goblin_boss.glb` | `1,535,316` | `5c70d30fc97742736fba7d01a99b6b1399cf177144cace4e8ba4e669e4804ddb` |
| `guy.glb` | `1,262,944` | `d0dd7e6d0f8d821dbeec80665eb893b1c48c0eedebe6602fe8431d91265cd557` |
| `ilyra.glb` | `1,211,792` | `1fbf3a329c808198ce67014bd25513e1574160d7e2056b166fb558e0246a6aab` |
| `mara.glb` | `1,283,116` | `4377ee6a4f730c0d44e47453d77b1794fb817896e4e4f213a960ab50ca5eaeaf` |
| `mummy.glb` | `1,210,404` | `e5329cfb5594d567f3fb1d77777be0d3fba79dcae7e23c973951a2277af744fc` |
| `shadow.glb` | `1,178,256` | `2f42b2566caa49f24979c25eda6f90634a8d2da84f4299e95f0cd6a9de865913` |
| `skeleton.glb` | `1,372,544` | `6a5ab59b843793285511b352cb0a7fc70ea0a9d11f5e39d4e1ed380f1a9d5b34` |
| `specter.glb` | `1,466,228` | `a65586d24bca8c649dc10b3dd605206dd236d94816496d707f511cd78ac67edd` |
| `wight.glb` | `1,395,176` | `b16ef52407a40f2478706c7b75c14b0ff645b9c27e9b8c63e4f2680bca4ba94b` |
| `zombie.glb` | `1,360,532` | `f658062129d14edb202cbce41b33a9385b688e8e2bbd1bf53ddb021b5d21303c` |
