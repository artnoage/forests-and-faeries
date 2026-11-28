# Experiments: what we ran and what we learned

This is a short history of the learning experiments behind Forests and Faeries, from the first agents on Natural20 to the runs going now. The models, logs and raw results are not published; the numbers below are copied from the run records, with the date of each.

**How to read the numbers.**
- **The built-in AI** is Natural20's heuristic AI, ported rule for rule to the Rust engine. It is the fixed yardstick: a network "wins 70% against the built-in AI" when it plays one side and the built-in AI plays the other.
- **A win is an elimination.** Fights that reach the round limit and runs cut short are counted separately.
- **The ladder** (from 2026-11-17) rates every saved snapshot of every run against the others and against the built-in AI (a Bradley–Terry fit, built-in AI at 0). Its "vs built-in" figure is the predicted win rate on a fight where the built-in AI wins half the time against itself. From 2026-11-26 the ladder also plays every policy against the built-in AI on the same 512 development fights as built-in against built-in, so the gain is measured directly.
- **One seed per method.** We ran different ideas side by side rather than repeating one. Gaps of a few points between arms are within seed noise.
- **Different periods are not comparable.** Rules, heroes, monsters, maps and metrics changed between experiments. Compare arms within one section.

## 1. First agents on Natural20 (2026-11-09 to 11-14)

The first environment drove Natural20 directly: Mara (Fighter 2) and Ilyra (Wizard 2) against undead on one fixed map, with feed-forward networks scoring the legal actions.

- **Heroes learned fast.** Hero PPO against the built-in monsters passed its opening gate with 100 wins in 100 games.
- **Monsters did not.** In alternating self-play no monster phase passed its 80-of-100 gate; the best was 46/100. Two objective variants (elimination over 50 rounds, health score over 30) peaked at 21/100 and 12/100.
- **Beating one opponent is not playing well.** A retention method lifted the monsters to 86/100 against the frozen heroes they trained against, yet the same monsters won 2 of 32 against the built-in heroes.
- **Stalling.** A 10M-parameter entity transformer (2026-11-13/14) made the heroes dominant (31–32 of 32 against both benchmarks). Its monsters peaked at 8/32 against the built-in heroes after about 2.5 hours, then collapsed into running out the clock: a fight cut off at the limit scored 0, better than a loss at −1. The reward was changed to score the health difference at the horizon, and the best checkpoint is now kept separately from the latest one.
- **Speed was the real limit.** Natural20 ran at about 10 environment steps per second per core, 29 after exact-replay-checked optimizations; training made 7 to 386 learner decisions per second. That is why we built a fast engine.

## 2. A fast engine that stays identical (2026-11-13 to 11-16)

- **Prototype.** A port of the built-in AI on an open-source Rust combat simulator chose the same action as Natural20 on 99.96% of 17,500 replayed decisions and ran 800–900 times faster per fight. It differed in a few rules, so we wrote a new engine that mirrors Natural20 exactly and is checked against its recorded dice: `engine/`.
- **Batched environment (2026-11-15).** `ember_rs.BatchEnv` plays any roster on any map from an encounter catalog. At its release 12,081 recorded Natural20 games replayed in it with no difference. In its first measurement the environment alone made 90,000 to 175,000 decisions per second on a small map with 6 to 12 threads; with the network acting on a GPU in the loop, 12,000 to 15,000.
- **Balanced encounter catalogs.** Every fight is measured with the built-in AI on both sides. Development and test fights are verified with 3,000 games to a hero win rate between 40% and 60%, training fights screened with 200 games to 25–75%, and every fight reaches the round limit in under 5% of games.

## 3. First runs on the Rust engine (2026-11-16 to 11-17)

**Four methods, 12 hours each** (Mara and Ilyra against undead, the four fixed maps, one GPU each; held-out cross-play at the end):

| Method | Heroes vs built-in | Monsters vs built-in |
|---|---|---|
| Alternating phases with a gate, from scratch, no imitation | **76%** | **62%** |
| Both sides learn at once, started from an imitation of the built-in AI | about 72% | about 55% |
| Alternating with a gate, started from the imitation | about 72% | about 55% |
| One creature per game, the rest built-in | lowest | lowest |

- From scratch caught up with the imitation-started runs within 5–6 hours. The 80% gate never fired; every phase ended on its budget.
- The imitation itself reached 93% (heroes) and 98.5% (monsters) agreement with the built-in AI on non-move decisions, and played within a few points of it.

**Generated maps, lookahead and a move cost** (19 hours each, starting from the winner above):

- Nothing beat the winner against the built-in AI beyond noise: heroes 72–76%, monsters 59–64% on held-out fixed and generated maps. Training on fixed maps transferred well to unseen generated maps.
- Warm starting on generated maps gave the best heroes against learned monsters, +5–6 points.
- Lookahead search during training beat the plain control by about 2.5–3 points on 12–13 times fewer decisions, and search at play time added about 6 points to any network.
- A cost of .001 per square walked cut the trained monsters' walking from 6.1 to 3.9 squares a turn (built-in AI: 3.7) without a measurable loss. Monsters still spent their whole speed every turn, which led to **destination moves**: one decision walks to any reachable square.

## 4. The level-3 trio, open-ended (2026-11-17 to 11-19)

Guy, Elion and Curogana (level 3) and their pairs and solos against the undead including the Mummy, on generated, fixed and hand-made room maps. Four arms from scratch: base, base + search, base + league (opponents drawn from past snapshots, weighted toward those it loses to), and breadth (guest heroes and goblins). New observation (`ember-gen-v2`, with pairwise relations), destination moves, a 60% gate, monster phases twice as long as hero phases, and training fights weighted toward even odds for the current learner.

After about 36 hours (ladder of 2026-11-19), the newest snapshots rated **70–74% vs built-in for heroes and 66–72% for monsters**. Over the last day the heroes were still rising in three arms, and the monsters were flat in three. The run was stopped to move to the full roster.

## 5. The full roster (2026-11-19 to 11-21)

Chruna joined, with goblins next to the undead, 96 new generated maps and 30 training parties. Four arms on the league-plus-search base: base, a deeper encoder, gate games against older opponents, and search against the fight's real (trained) opponent instead of the built-in AI.

After 32–35 hours: **heroes 64–71%, monsters 63–69% vs built-in**. Searching against the trained opponent ran at 71 learner decisions per second against 123 and had the weakest heroes. Grouping the search's network calls by the number of legal actions made a full search 1.40–1.46 times faster.

## 6. One bigger network (2026-11-20 to 11-22)

A single run on an H200 with a 21.3M-parameter policy per side, the full roster plus parties at levels 1–3. Engineering raised it from 151 to 249 learner decisions per second. After about 34 hours: **heroes 77.9%, monsters 62.8% vs built-in**.

## 7. Restart on corrected rules (2026-11-22 to 11-26)

The language-model players and the audit rounds behind the level grading (section 10) found rules bugs. Once they were fixed, every run restarted from scratch: the H200 configuration, and four arms on L4 GPUs (both sides at once, three times the search, a league with older snapshots, and the same with the built-in AI in the league).

- **H200 run**, stopped 2026-11-24 after 40 hours: heroes 75.2%, monsters 58.6% vs built-in.
- **Four arms**, stopped 2026-11-26 after about 90 hours (12–30M hero and 22–50M monster decisions each): best heroes 77–78% and best monsters 57–60% vs built-in without search; with search the best heroes reached 88%.
- **Old maps on new rules.** Replaying all 31,862 training and development fights 200 times each on the corrected engine left the average hero win rate at 50.4% (was 49.9%), so the catalogs were kept.
- **Side experiments (2026-11-23).** A one-layer action decoder was 13.5% faster but 3.1 points weaker than two layers (95% interval −7.6 to +1.6), so two layers stay. Running the search as a two-batch pipeline cut its time by 18% and its peak GPU memory by half, and made the same choices as the plain search at the same batch shapes.

**What the audit of these runs found (2026-11-25)**, and what the next recipe fixed:
- A script fault gave the runs 32 development fights instead of 512, so every phase check was close to a coin flip.
- Monsters start a phase winning about 30% of the development fights, and the flat 60% bar opened for them 3 times in about 120 phases.
- The monster learner lost 62–66% of its training fights.
- The ladder's monster ratings sat at 0 ± 0.3 and hid a real gain: against the built-in heroes the trained monsters won 8 points more often than the built-in monsters, reached in the first day and flat afterwards. The heroes gained 18 points.

## 8. Current runs (since 2026-11-26)

**The recipe.** From scratch on rules version 17, observation `ember-gen-v4`, with the twelve new fey creatures (37.5% of training fights). 512 stratified development and evaluation fights. A **paired gate**: a phase ends when the candidate beats the policy that started the phase on the same 512 fights (one-sided test at 5%), with a mid-phase check for the monsters. The ladder measures its zero (built-in against built-in) and plays 512 fights per policy.

The arms differ in whom the learner imagines on the other side when it searches ahead:

| Arm | Opponent inside the search | Notes |
|---|---|---|
| **Imagines built-in** | always the built-in AI | the control |
| **Gradual + balanced** | the trained opponent in 25% of searches, rising to all of them over 6M decisions; training fights steered toward even odds | |
| **Imagines current model** | the trained opponent of that very game, always | forked from the control at phase 42 on 2026-11-27 |
| **Monsters focus** | the built-in AI | forked from the control on 2026-11-27; monster phases up to four times as long as hero phases |

Two earlier arms (gradual without balancing, and always the trained opponent) were stopped on 2026-11-27: the gradual arm had finished its ramp and become the same as the other.

**Latest results** (ladder of 2026-11-28 06:20 UTC, newest snapshot per arm). On the same 512 development fights the built-in heroes win 52.1% against the built-in monsters and the built-in monsters 47.7%:

| Arm | Heroes win | vs built-in heroes | Monsters win | vs built-in monsters | Plateau test (heroes / monsters) |
|---|---|---|---|---|---|
| Imagines built-in | 72.9% | +20.7 [+15.4, +26.0] | 53.1% | +5.5 [+0.1, +10.8] | rising / flat |
| Gradual + balanced | 73.0% | +20.9 [+15.8, +26.0] | 55.7% | +8.0 [+2.6, +13.4] | rising / rising |
| Imagines current model | 71.5% | +19.3 [+14.0, +24.7] | 57.0% | +9.4 [+4.2, +14.6] | flat / flat |
| Monsters focus | 70.3% | +18.2 [+13.1, +23.2] | 52.7% | +5.1 [−0.8, +10.9] | flat / flat |

The gains are in points over the built-in AI on the same fights, with 95% intervals. The ladder's fitted ratings give 73–77% vs built-in for the heroes and 55–61% for the monsters. The two forks are only about 15 hours old, so their plateau verdicts mean little yet. So far the heroes gain about 20 points over the built-in AI and the monsters 5 to 9: the monsters learn, but much less.

## 9. Language-model players (2026-11-18 to 11-27)

A harness lets a language model choose every action for one side against the built-in AI, from the same legal menu the networks see; the engine rolls the dice. Budgets were a few dollars for the whole campaign.

- **Prompt tuning.** Nine prompt versions were tuned with Jev 1.14 (a decision model served through OpenRouter) on 14 fixed development fights per side, and the best was chosen by a rule fixed in advance: **v09**, which shows the whole map, full SRD stat cards, reach and threat facts, recent history and every legal row with its expected damage.
- **On 14 fresh fights**, v09 won 9 of 14 as heroes (the first prompt: 0) but 3 of 14 as monsters (first prompt: 8). Built-in against built-in won 6 hero and 8 monster games on the same fights.
- **On 32 more fights** with v09, Google's Gemini Decision 1 won 20 of 32 as heroes and 11 of 32 as monsters, against 19 and 12 for the built-in AI: about the built-in AI's level.
- **Adding strategy text (v11) did not help**, and neither side passed its pre-registered test.
- **A prompt in the style of Natural20's own planner (v13, 2026-11-27)**, ported from the planner prompt Joseph Dayo uses with Jev, was worse on both sides on the same 32 fights: 2 hero wins (7 with its morale rule switched off) against v09's 15, and 14 monster wins against v09's 22. Its narrower view, pruned menus and hero morale cost more than they saved.

## 10. Grading the levels by agents (2026-11-21 to 11-22)

- **Two AIs first.** Candidate levels for hero levels 1–3 were played 500 times each by our best trained heroes and by the built-in heroes, both against the built-in monsters. Easy: both win at least 60%. Medium: ours at least 60%, the built-in heroes 30–60%. Hard: a level plus one monster that one of the two still wins at least 40% of the time. This gave 36 levels, 12 per hero level.
- **Then many agents.** Every level got one more monster. Three cheaper language models played each level once, and three stronger models played the six levels that no agent had beaten yet. With the two AIs (a level counts as beaten at 50% wins over 500 games), each level was graded by **how many different agents beat it**.
- Three levels were beaten by no one: they became the **Unbeatable** category. The playing rounds also found rules bugs, which were fixed before the training restart in section 7.

## 11. Engine parity milestones

- **2026-11-15:** the batched environment replays 12,081 recorded Natural20 games with no difference.
- **2026-11-19:** the live game moves from Natural20 to the Rust engine after 533 recorded sessions replay with no difference.
- **From 2026-11-17:** every training run replays a sample of its own games in Natural20 every day. Mismatches are investigated and fixed in both engines. For example, the first round on 2026-11-26 matched 121 of 128 games; the seven others traced to two small causes, one in each engine. Later rounds found the Dodge and grapple-drag differences behind rules 19 and 21.
- **Rule versions**, each new one opt-in while the older ones stay byte-identical:
  - **17** (2026-11-26): built-in AI scoring of First Aid and escaping a grapple, and a stall fix;
  - **18** (2026-11-26): Vesper the Bard, *Faerie Fire*, *See Invisibility* and 2024 rules updates;
  - **19** (2026-11-27): Dodge ends when the creature is grappled;
  - **20** (2026-11-27): Large and Huge creatures fill several squares; the Ogre and the Owlbear;
  - **21** (2026-11-27, live 2026-11-28): Joseph Dayo's rulings on upstream Natural20: squeezing, the greatest cover over every pair of squares, and drags that never end on an occupied square. His six reference scenarios replay with no difference in both engines, the two games that had diverged now match, rules 17–20 still reproduce their old games byte for byte, and the speed is within 1%.

## What we learned

1. **The yardstick matters.** Results against one frozen opponent overstate skill; every number here is measured against the built-in AI or a ladder of many opponents.
2. **Reward what you want.** A truncation that scores better than a loss teaches stalling.
3. **Speed first.** The Rust engine made the environment cheap, and the network and the search now take the time.
4. **Heroes learn easily, monsters slowly.** Across every period the heroes gained much more over the built-in AI than the monsters did.
5. **Measure carefully.** A 32-fight check, an unmeasured ladder zero or a bar no side can reach hides real progress or invents it. Paired tests on hundreds of fixed fights fixed that.
6. **Exactness pays.** Replaying games in both engines finds rule bugs that no win rate shows, and keeping old rule versions means a fix never silently changes a running experiment.
