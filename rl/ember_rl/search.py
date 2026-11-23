"""Decision-time lookahead for the general environment: batched rollouts on forks of `BatchEnv` games.

One search per root, a pending decision of team T in a slot of the main env, batched over many roots:

1. Candidates. The prior is the T policy's softmax over the legal rows. Evaluation takes the top `k`
   rows by prior; training (`explore=True`) takes Gumbel-top-k, sampling `k` rows without replacement
   (Gumbel AlphaZero, Danihelka et al. 2022). With `min_mass` < 1 fewer rows are kept once the kept
   prior mass reaches it (at least two). A root whose top prior is >= `skip_p`, or with one legal row, is
   not searched.
2. Rollouts. Each candidate is executed in `seeds` forks of the game (`BatchEnv.fork` into a scratch
   env). Every fork gets a fresh dice stream, and the candidates of one root share their `seeds` dice
   seeds (common random numbers), so the comparison between candidates is paired. The search never sees
   the real game's future dice. Each fork then plays on with the given rollout policies for both teams
   (greedy by default, batched over all forks on the GPU). A team the env plays natively keeps playing
   inside `env.step` (the native AI, its own memory included, is then a perfect opponent model) unless
   `opponent='policy'`, which hands it to a supplied policy in the forks.
3. Leaves. A fork stops at its horizon (an own-team decision, so the leaf is always observed from T's
   side) or at the end of the game:
   - `turns:N`: the N-th own-team turn that starts after the root's turn (a turn is a creature's
     (actor, round); `turns:1` is "until the next own creature's turn starts");
   - `rounds:R`: the first own-team decision R rounds after the root's round;
   - `steps:D`: the D-th own-team decision after the root (`steps:1` evaluates the state right after the
     candidate, if T decides next).
   Leaf utility, in T's terms and on the trainer's return scale (γ = 1 per round, potential shaping):
   +1/-1/0 at native elimination, ±score at the health horizon, and otherwise V_T(leaf) + Φ_T(leaf).
   With γ = 1 the shaped return from a state s is outcome - Φ_T(s), so the value head estimates
   E[outcome | s] - Φ_T(s) and the potential must be added back before leaves are compared
   (Φ_T = ±0.3·score, the heroes-perspective `potential` with T's sign). A safety truncation is
   bootstrapped the same way from T's final view. With `move_penalty` (the trainer's --move-penalty) every
   square T walks between the root and the leaf, the candidate included, costs that much (info['moved'];
   one per move row with an environment that lacks it), as in the training return, so Q stays the expected return-to-go (plus the root potential) of the trained net.
4. Choice. Q(c) is the mean leaf utility over the seeds. `select='q'` takes argmax Q (ties: higher
   prior); `select='mix'` takes argmax(logit + Q/τ). Training (`explore=True`) takes the Gumbel
   AlphaZero action argmax(g + logit + Q/τ) with the same Gumbel draws g that chose the candidates.
5. Policy target (for expert iteration): softmax(logits + Q̃/τ) over every legal row, where Q̃ is Q on the
   searched rows and v_mix (the root value mixed with the prior-weighted searched Q, as in Gumbel
   MuZero's completed Q-values) elsewhere: the KL-regularised improvement argmax E_π'[Q̃] - τ·KL(π'‖π).

Hidden information: forks copy the whole game, so the rollouts play out the true positions of creatures
hidden from T (2024 Hide; GENERAL_ENV.md §5.2 visibility mask). Network inputs, at the root and at every
leaf, are still T's masked observations, and the dice are always fresh. In l2-undead-v1 no creature can
hide (the Shadow's Shadow Stealth is inert in the mirror), so there the search reads nothing T cannot
see; `hidden_roots` counts root decisions where an enemy token is flagged hidden.
"""
from __future__ import annotations

import math
import threading
import time
from collections import Counter, defaultdict
from dataclasses import dataclass, field, fields, replace
from typing import Any, Mapping, Sequence

import numpy as np

from ember_rl.general_env import MOVE_KIND, TEAM_CODE, TEAMS

# Rows of one deferred leaf-value pass. The map encoder's activations grow with the batch (about 200 MiB at 64
# rows of the 21M model), so a search's leaves are valued in bounded chunks; EMBER_VALUE_ROWS raises it on big GPUs.
VALUE_ROWS = int(__import__('os').environ.get('EMBER_VALUE_ROWS') or 256)

HORIZONS = ('turns', 'rounds', 'steps')
SELECT = ('q', 'mix')
HIDDEN_FEATURE = 98     # creature token `hidden` (ember-rs encode.rs CREATURE_FEATURES; enemy = 2)


@dataclass(frozen=True)
class SearchConfig:
    k: int = 4                  # candidates per root
    seeds: int = 4              # dice seeds per candidate (shared by a root's candidates)
    horizon: str = 'turns:1'    # turns:N | rounds:R | steps:D
    select: str = 'q'           # evaluation choice: q (argmax Q) | mix (argmax logit + Q/tau)
    tau: float = .1             # Q temperature (outcome units) of 'mix', training choices and targets
    skip_p: float = 1.          # no search when the top prior probability is >= this (1: always search)
    min_mass: float = 1.        # stop adding candidates once their prior mass reaches this (>= 2 kept)
    rollout: str = 'greedy'     # rollout policies: greedy | sample
    opponent: str = 'env'       # env: forks keep the game's controllers; policy: model native teams with a policy
    scratch: int = 4096         # forks in flight (scratch env slots)
    max_depth: int = 1024       # safety cap on rollout decisions per fork (then the next own decision is a leaf)
    move_penalty: float = 0.    # cost of each own one-square move between root and leaf (the trainer's --move-penalty)

    def __post_init__(self):
        kind, _, n = self.horizon.partition(':')
        if kind not in HORIZONS or not n.isdigit() or int(n) < 1:
            raise ValueError(f'horizon must be turns:N, rounds:R or steps:D with a count >= 1, not {self.horizon!r}')
        if self.k < 1 or self.seeds < 1 or self.scratch < 1 or self.tau <= 0 or self.move_penalty < 0:
            raise ValueError('k, seeds and scratch must be >= 1, tau > 0 and move_penalty >= 0')
        if self.select not in SELECT or self.rollout not in ('greedy', 'sample') or self.opponent not in ('env', 'policy'):
            raise ValueError(f'select in {SELECT}, rollout greedy|sample, opponent env|policy')

    @property
    def horizon_kind(self) -> str:
        return self.horizon.partition(':')[0]

    @property
    def horizon_n(self) -> int:
        return int(self.horizon.partition(':')[2])

    def to_text(self) -> str:
        return ','.join(f'{f.name}={getattr(self, f.name)}' for f in fields(self))


def parse_search(text: str | None, base: SearchConfig | None = None) -> SearchConfig | None:
    """'k=4,seeds=4,horizon=turns:1' -> SearchConfig (unnamed fields keep `base` or the defaults)."""
    if text is None or text in ('', 'off', 'none'):
        return None
    base = base or SearchConfig()
    kinds = {f.name: f.type for f in fields(SearchConfig)}
    values = {}
    for part in text.split(','):
        name, sep, value = part.strip().partition('=')
        name = name.replace('-', '_')
        if not sep or name not in kinds:
            raise ValueError(f'bad search option {part!r}; options: {", ".join(kinds)}')
        default = getattr(base, name)
        values[name] = type(default)(value) if not isinstance(default, str) else value
    return replace(base, **values)


@dataclass
class Root:
    """One decision to search: slot `slot` of the main env, pending decision of `team`."""
    slot: int
    team: str
    logits: np.ndarray            # prior logits over the legal rows (length L, End Turn last)
    value: float                  # V_team(root observation)
    round: int
    actor: int
    potential: float              # heroes-perspective potential at the root (info['potential'])
    models: Mapping[str, Any]     # team -> rollout policy (None: the env plays that team natively)
    controllers: Mapping | None = None   # fork controllers (None: keep the game's)
    hidden: bool = False          # an enemy token in the root observation is flagged hidden
    kinds: np.ndarray | None = None   # action kind per legal row (needed with move_penalty > 0)


@dataclass
class Result:
    row: int                      # the chosen legal row
    searched: bool
    prior: np.ndarray             # softmax of the root logits
    cands: list = field(default_factory=list)     # searched rows
    q: np.ndarray | None = None   # mean leaf utility per searched row
    q_std: np.ndarray | None = None
    u: np.ndarray | None = None   # leaf utilities [candidate, seed] (seeds paired across candidates)
    target: np.ndarray | None = None              # improved policy over every legal row (searched roots)
    v_root: float = 0.            # V + Φ at the root (T's terms)


def softmax(x: np.ndarray) -> np.ndarray:
    z = np.exp(x - np.max(x))
    return z / z.sum()


def scratch_like(env, n_slots: int, threads: int | None = None):
    """An empty env for forks with `env`'s content and configuration (ember_rs or the fake env)."""
    from ember_rl.fake_env import FakeBatchEnv
    if isinstance(env, FakeBatchEnv):
        c = env.cfg
        return FakeBatchEnv(n_slots, scores=env.scores, objective=c['objective'], max_rounds=c['max_rounds'],
                            standing_weight=c['standing_weight'], max_steps=c['max_steps'],
                            feature_version=env.feature_version, moves=getattr(env, 'moves', 'step'))
    import ember_rs
    extra = {'feature_version': env.feature_version} if hasattr(ember_rs, 'FEATURE_VERSIONS') else {}
    if getattr(env, 'moves', 'step') != 'step':     # a fork takes the target's move mode: rows must match the root's
        extra['moves'] = env.moves
    return ember_rs.BatchEnv(n_slots=n_slots, content=env.content, threads=threads or env.threads, scores=env.scores,
                             objective=env.objective, max_rounds=env.max_rounds, standing_weight=env.standing_weight,
                             max_steps=env.max_steps, **extra)


def root_hidden(obs: Mapping[str, np.ndarray], i: int) -> bool:
    """Row i of an observation shows an enemy whose token is flagged hidden (masked position)."""
    mask = obs['creature_mask'][i]
    tokens = obs['creatures'][i][mask]
    if tokens.shape[1] <= HIDDEN_FEATURE:
        return False
    enemy = tokens[:, 2] > 0.5          # relation block: is_actor, ally, enemy, ...
    return bool(np.any(tokens[enemy, HIDDEN_FEATURE] > 0.5))


class Lookahead:
    """Batched decision-time search with the policy as prior and the value head as leaf evaluator."""

    def __init__(self, env, config: SearchConfig, device, *, seed: int = 0, threads: int | None = None, scratch=None,
                 group_actions: bool = False, search_threads: int = 1):
        """search_threads T > 1: the forks of one search are split by root over T worker threads, each with its
        own scratch env (config.scratch / T slots, threads / T env threads). The env calls and the numpy
        gathers of the workers overlap (the engine releases the GIL); the network calls take turns behind one
        lock, so GPU memory and the compiled kernels are used as with T = 1. Candidates, Gumbel noise and dice
        seeds are drawn before the split, so the searched games are the same for every T; only the composition
        of the network batches differs (BF16 rounding). A caller's own `scratch` forces T = 1."""
        import torch
        self.torch, self.env_template = torch, env
        self.cfg, self.device = config, device
        self.group_actions = group_actions and config.rollout == 'greedy'
        self.rng = np.random.default_rng(seed)
        self.stats = Counter()
        self.gpu_lock = threading.Lock()
        self.search_threads = 1 if scratch is not None else max(1, int(search_threads))
        self.pool = None
        if self.search_threads > 1:
            from concurrent.futures import ThreadPoolExecutor
            total = threads or getattr(env, 'threads', None) or self.search_threads
            slots = -(-config.scratch // self.search_threads)
            self.workers = [scratch_like(env, slots, max(1, total // self.search_threads))
                            for _ in range(self.search_threads)]
            self.scratch = self.workers[0]
            self.pool = ThreadPoolExecutor(self.search_threads, thread_name_prefix='search')
        else:
            self.scratch = scratch if scratch is not None else scratch_like(env, config.scratch, threads)
            self.workers = [self.scratch]

    @staticmethod
    def _chunks(obs, groups, row_chunks, models=None):
        """Plan on action counts, then gather each final model batch directly from the observation."""
        from ember_rl.general_env import MODEL_INPUTS, VALUE_INPUTS
        from ember_rl.general_model import GeneralActorCritic, trimmed_rows
        if models is not None:
            obs = {name: obs[name] for name in MODEL_INPUTS if name in obs}
        mask = obs['cand_mask']
        action_counts = mask.sum(axis=1)
        creature_counts = obs['creature_mask'].sum(axis=1)
        for key, positions in groups.items():
            group = np.asarray(positions, dtype=np.intp)
            fields = obs
            if key[1]:
                batches = (group,)  # Value passes stay whole.
                # The built-in critic only encodes state. Other value implementations keep all model inputs.
                if models is not None and type(models[key[0]]) is GeneralActorCritic:
                    fields = {name: obs[name] for name in VALUE_INPUTS if name in obs}
            else:
                width = min(mask.shape[1], max(1, int(action_counts[group].max())))
                # The grouping heuristic sees the same trimmed mask as a selection of the full group.
                chunks = row_chunks({'cand_mask': mask[:, :width][group]})
                batches = (group[chunk] for chunk in chunks)
            for batch in batches:
                # Groups and each chunk within a group keep observation order. Consecutive rows can
                # borrow the source buffers throughout the forward pass, including the large map.
                first, last = int(batch[0]), int(batch[-1])
                rows = slice(first, last + 1) if last - first + 1 == len(batch) else batch
                k = min(mask.shape[1], max(1, int(action_counts[rows].max())))
                n = max(1, int(creature_counts[rows].max()))
                yield key, batch, trimmed_rows(fields, rows, k, n)

    # ---- public ----
    def search(self, env, roots: Sequence[Root], *, explore: bool = False) -> list[Result]:
        """Search every root (all in one batch); returns one Result per root, in order."""
        started = time.time()
        cfg = self.cfg
        results, jobs = [], []
        for i, r in enumerate(roots):
            logits = np.asarray(r.logits, np.float64)
            prior = softmax(logits)
            L = len(logits)
            sign = 1. if r.team == 'heroes' else -1.
            res = Result(row=-1, searched=False, prior=prior, v_root=float(r.value) + sign * float(r.potential))
            results.append(res)
            self.stats['roots'] += 1
            self.stats['hidden_roots'] += int(r.hidden)
            if L <= 1 or prior.max() >= cfg.skip_p:
                res.row = int(self.rng.choice(L, p=prior)) if explore else int(np.argmax(logits))
                self.stats['skipped'] += 1
                continue
            gumbel = self.rng.gumbel(size=L) if explore else np.zeros(L)
            order = np.argsort(-(logits + gumbel), kind='stable')
            cands, mass = [], 0.
            for c in order[:min(cfg.k, L)]:
                cands.append(int(c))
                mass += prior[c]
                if len(cands) >= 2 and mass >= cfg.min_mass:
                    break
            res.cands, res.searched = cands, True
            res._gumbel = gumbel
            seeds = self.rng.integers(0, 2**62, cfg.seeds)
            for ci in range(len(cands)):
                for j in range(cfg.seeds):
                    jobs.append((i, ci, j, int(seeds[j])))
            self.stats['searched'] += 1
            self.stats['candidates'] += len(cands)
        utility = {i: np.full((len(res.cands), cfg.seeds), np.nan) for i, res in enumerate(results) if res.searched}
        cap = self.scratch.n_slots
        if self.pool is None or len(jobs) <= max(64, cap // 4):     # a small search is not worth the hand-off
            for start in range(0, len(jobs), cap):
                self._rollouts(env, roots, results, jobs[start:start + cap], utility, self.scratch, self.stats)
        else:
            # Whole roots per worker (their forks stay together), the next root to the least loaded worker.
            # Workers write disjoint rows of `utility` and their own counters; `env` is only read (fork source).
            shares = [[] for _ in self.workers]
            start = 0
            while start < len(jobs):
                end = start
                while end < len(jobs) and jobs[end][0] == jobs[start][0]:
                    end += 1
                min(shares, key=len).extend(jobs[start:end])
                start = end

            def work(scratch, share):
                stats = Counter()
                for at in range(0, len(share), cap):
                    self._rollouts(env, roots, results, share[at:at + cap], utility, scratch, stats)
                return stats

            futures = [self.pool.submit(work, sc, share) for sc, share in zip(self.workers, shares) if share]
            for future in futures:          # every worker ends before an error is raised
                future.exception()
            for future in futures:
                self.stats.update(future.result())     # env/model seconds add up over the workers
        for i, res in enumerate(results):
            if res.searched:
                self._choose(roots[i], res, utility[i], explore)
        self.stats['seconds'] += time.time() - started
        return results

    def summary(self) -> dict:
        s = self.stats
        out = {k: (round(v, 3) if isinstance(v, float) else v) for k, v in s.items()}
        if s['searched']:
            out['forks_per_search'] = round(s['forks'] / s['searched'], 2)
            out['rows_per_search'] = round((s['forward_rows'] + s['value_rows']) / s['searched'], 1)
        if s['leaves']:
            out['mean_depth'] = round(s['depth'] / s['leaves'], 2)
            out['terminal_fraction'] = round(s['terminal_leaves'] / s['leaves'], 4)
        if s['roots']:
            out['seconds_per_root'] = round(s['seconds'] / s['roots'], 5)
        if s['value_err_n']:
            out['value_mae'] = round(s['value_err_abs'] / s['value_err_n'], 4)
            out['value_rmse'] = round(math.sqrt(s['value_err_sq'] / s['value_err_n']), 4)
        if s['seconds']:
            out['model_fraction'] = round(s['model_seconds'] / s['seconds'], 4)
            out['env_fraction'] = round(s['env_seconds'] / s['seconds'], 4)
        return out

    # ---- internals ----
    def _choose(self, root: Root, res: Result, u: np.ndarray, explore: bool):
        cfg = self.cfg
        if np.isnan(u).any():
            raise RuntimeError('a rollout produced no leaf utility')
        q = u.mean(1)
        res.q, res.q_std, res.u = q, u.std(1), u
        logits = np.asarray(root.logits, np.float64)
        cands = np.asarray(res.cands)
        if explore:
            score = res._gumbel[cands] + logits[cands] + q / cfg.tau
        elif cfg.select == 'mix':
            score = logits[cands] + q / cfg.tau
        else:
            score = q
        best = int(np.argmax(score))      # first maximum: candidates are in prior (or Gumbel) order
        res.row = int(cands[best])
        if res.row != int(np.argmax(logits)):
            self.stats['changed'] += 1
        prior = res.prior
        visits = len(cands) * cfg.seeds
        weight = prior[cands].sum()
        searched_mean = float((prior[cands] * q).sum() / weight) if weight > 0 else float(q.mean())
        # Critic error against the rollouts: V + potential at the root vs the prior-weighted searched Q.
        error = res.v_root - searched_mean
        self.stats['value_err_n'] += 1
        self.stats['value_err_sum'] += error
        self.stats['value_err_abs'] += abs(error)
        self.stats['value_err_sq'] += error * error
        v_mix = (res.v_root + visits * searched_mean) / (1 + visits)
        completed = np.full(len(logits), v_mix)
        completed[cands] = q
        res.target = softmax(logits + completed / cfg.tau).astype(np.float32)
        del res._gumbel

    def _rollouts(self, env, roots, results, jobs, utility, sc, stats):
        torch, cfg = self.torch, self.cfg
        from ember_rl.general_model import grouped_row_chunks, row_chunks, select, to_batch
        n = len(jobs)
        dst = np.arange(n, dtype=np.int32)
        root_of = np.array([j[0] for j in jobs])
        src = np.array([roots[i].slot for i in root_of], np.int32)
        seeds = np.array([j[3] for j in jobs], np.int64)
        ctrls = None
        if cfg.opponent == 'policy':
            ctrls = [dict(heroes='external', monsters='external') for _ in jobs]
        elif any(roots[i].controllers is not None for i in root_of):
            ctrls = [roots[i].controllers for i in root_of]
        clock = time.time()
        sc.fork(src, dst, dice_seeds=seeds, controllers=ctrls, source=env)
        first = np.array([results[i].cands[ci] for i, ci, _, _ in jobs], np.int32)
        cost = np.zeros(n)                 # move penalties of T's moves so far (the candidate's included)
        info = sc.step(dst, first)
        if cfg.move_penalty:               # per square walked (info['moved']; else one per move row)
            if 'moved' in info:
                cost += cfg.move_penalty * np.asarray(info['moved'], np.float64)
            else:
                for g, (i, ci, _, _) in enumerate(jobs):
                    if roots[i].kinds is None:
                        raise ValueError('move_penalty needs Root.kinds (the action kind of every legal row)')
                    cost[g] = cfg.move_penalty * (int(roots[i].kinds[first[g]]) == MOVE_KIND)
        stats['env_seconds'] += time.time() - clock
        stats['forks'] += n
        cur = {k: np.array(v) for k, v in info.items()}
        own = np.array([TEAM_CODE[roots[i].team] for i in root_of], np.int8)
        sign = np.where(own == 0, 1., -1.)
        root_round = np.array([roots[i].round for i in root_of])
        last_actor = np.array([roots[i].actor for i in root_of])
        last_round = root_round.copy()
        count = np.zeros(n, np.int64)      # own turns started (turns) or own decisions (steps) since the root
        depth = np.ones(n, np.int64)       # decisions executed in the fork (the candidate included)
        kind, h = cfg.horizon_kind, cfg.horizon_n
        live = dst
        truncated, leaves = [], []
        iterations = 0
        while len(live):
            iterations += 1
            done = cur['done'][live]
            for g in live[done]:
                if cur['terminated'][g]:
                    utility[root_of[g]][jobs[g][1], jobs[g][2]] = self._terminal(cur, g, own[g]) - cost[g]
                    self._leaf(stats, depth[g], terminal=True)
                else:
                    truncated.append(int(g))
            alive = live[~done]
            if not len(alive):
                break
            team = cur['team'][alive]
            mine = team == own[alive]
            actor, rnd = cur['actor'][alive], cur['round'][alive]
            if kind == 'turns':
                new = mine & ((actor != last_actor[alive]) | (rnd != last_round[alive]))
                count[alive[new]] += 1
                leaf = mine & (count[alive] >= h)
            elif kind == 'rounds':
                leaf = mine & (rnd >= root_round[alive] + h)
            else:
                count[alive[mine]] += 1
                leaf = mine & (count[alive] >= h)
            leaf |= mine & (depth[alive] >= cfg.max_depth)
            last_actor[alive[mine]] = actor[mine]
            last_round[alive[mine]] = rnd[mine]
            # Horizon leaves wait for one value pass after the loop: a leaf is never stepped again, so its
            # state, potential and cost stay as they are now.
            if leaf.any():
                leaves.extend(alive[leaf].tolist())
                keep = ~leaf
                alive, team, mine = alive[keep], team[keep], mine[keep]
                if not len(alive):
                    break
            clock = time.time()
            obs = sc.observe(alive)
            stats['env_seconds'] += time.time() - clock
            groups = defaultdict(list)          # (model id, False) -> positions in alive
            models = {}
            for p, g in enumerate(alive):
                name = TEAMS[int(team[p])]
                model = roots[root_of[g]].models.get(name)
                if model is None:
                    raise RuntimeError(f'a fork surfaced a {name} decision but no {name} rollout policy was given')
                models[id(model)] = model
                groups[(id(model), False)].append(p)
            clock = time.time()
            order, picks, kinds = [], [], []
            with torch.no_grad():
                chunks = grouped_row_chunks if self.group_actions else row_chunks
                for (mid, _), idx, part in self._chunks(obs, groups, chunks, models):
                    batch = to_batch(part, self.device)
                    with self.gpu_lock:
                        logits, _ = models[mid](batch, check=False)
                        if cfg.rollout == 'greedy':
                            chosen = logits.argmax(-1)
                        else:
                            chosen = torch.distributions.Categorical(logits=logits).sample()
                        del logits
                    stats['forward_rows'] += len(idx)
                    order.append(idx)
                    picks.append(chosen)            # stays on the GPU: one transfer for the whole iteration
                    kinds.append(part['cand_ids'][:, :, 0])
                chosen = torch.cat(picks).cpu().numpy() if picks else np.zeros(0, np.int64)
            stats['model_seconds'] += time.time() - clock     # .cpu() waits for the GPU
            if not len(chosen):
                break
            order = np.concatenate(order)
            step_slots = np.asarray(alive[order], np.int32)
            step_own = mine[order]
            step_move = np.concatenate([k[np.arange(len(k)), c] == MOVE_KIND
                                        for k, c in zip(kinds, np.split(chosen, np.cumsum([len(k) for k in kinds])[:-1]))])
            clock = time.time()
            info = sc.step(step_slots, np.asarray(chosen, np.int32))
            stats['env_seconds'] += time.time() - clock
            if cfg.move_penalty:           # T's own walks only
                walked = np.asarray(info['moved'], np.float64) if 'moved' in info else np.asarray(step_move, np.float64)
                cost[step_slots] += cfg.move_penalty * walked * np.asarray(step_own, np.float64)
            for k, v in info.items():
                cur[k][step_slots] = v
            depth[step_slots] += 1
            live = step_slots
        # One value pass for every leaf of this batch of forks: horizon leaves (the searching team is to act)
        # and truncated games (round limit), both seen from the searching team's side.
        pending = [(g, False) for g in leaves] + [(g, True) for g in truncated]
        if pending:
            from ember_rl.general_env import VALUE_INPUTS
            from ember_rl.general_model import GeneralActorCritic, trimmed_rows
            clock = time.time()
            idx = np.asarray([g for g, _ in pending], np.int32)
            final = sc.observe(idx, team=own[idx])
            stats['env_seconds'] += time.time() - clock
            clock = time.time()
            creatures = final['creature_mask'].sum(axis=1)
            by_model = defaultdict(list)
            models = {}
            for p, g in enumerate(idx):
                model = roots[root_of[g]].models[roots[root_of[g]].team]
                models[id(model)] = model
                by_model[id(model)].append(p)
            with torch.no_grad():
                for mid, ps in by_model.items():
                    fields = final
                    if type(models[mid]) is GeneralActorCritic:     # the built-in critic only encodes state
                        fields = {name: final[name] for name in VALUE_INPUTS if name in final}
                    width = fields['cand_mask'].shape[1] if 'cand_mask' in fields else 1
                    outputs = []
                    for at in range(0, len(ps), VALUE_ROWS):        # bounded: the map CNN's activations scale with B
                        rows = np.asarray(ps[at:at + VALUE_ROWS])
                        part = trimmed_rows(fields, rows, width, max(1, int(creatures[rows].max())))
                        batch = to_batch(part, self.device)
                        with self.gpu_lock:
                            outputs.append(models[mid].value(batch, check=False).float())
                    values = torch.cat(outputs).cpu().numpy()
                    stats['value_rows'] += len(ps)
                    for p, v in zip(ps, values):
                        g = idx[p]
                        utility[root_of[g]][jobs[g][1], jobs[g][2]] = (float(v) + sign[g] * float(cur['potential'][g])
                                                                       - cost[g])
                        self._leaf(stats, depth[g], terminal=pending[p][1])
            stats['truncated_leaves'] += len(truncated)
            stats['model_seconds'] += time.time() - clock
        stats['iterations'] += iterations
        stats['batches'] += 1

    @staticmethod
    def _leaf(stats, depth, terminal):
        stats['leaves'] += 1
        stats['depth'] += int(depth)
        stats['terminal_leaves'] += int(terminal)

    @staticmethod
    def _terminal(cur, g, own):
        """Utility of a terminated fork in the searching team's terms."""
        sign = 1. if own == 0 else -1.
        if int(cur['task_end'][g]) == 2:          # health-score horizon
            return sign * float(cur['score'][g])
        winner = int(cur['winner'][g])
        if winner < 0:
            return 0.
        return 1. if winner == own else -1.
