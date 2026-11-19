"""Model-only tests: python -m unittest discover -s ember_rl/tests -p test_model.py -v.

No engine, pytest, CUDA, or optional simulator dependencies are required. Missing
PyTorch skips numerical tests explicitly; CUDA alone has its own explicit skip.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path
import random
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock
import warnings

TORCH_AVAILABLE = importlib.util.find_spec("torch") is not None
if TORCH_AVAILABLE:
    import numpy as np
    import torch
    from ember_rl.model import (
        CandidateActorCritic,
        clipped_ppo_loss,
        collate_observations,
        compute_gae,
        load_checkpoint,
        save_checkpoint,
    )


def _distribution(policy, states, candidates, mask):
    logits, values = policy(states, candidates, mask)
    return torch.distributions.Categorical(logits=logits), values


def _loss_dict(*args, **kwargs):
    loss, metrics = clipped_ppo_loss(*args, **kwargs)
    return {**metrics, "loss": loss}


@unittest.skipUnless(TORCH_AVAILABLE, "PyTorch is not installed")
class ModelTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.previous_threads = torch.get_num_threads()
        torch.set_num_threads(1)

    @classmethod
    def tearDownClass(cls):
        torch.set_num_threads(cls.previous_threads)

    def setUp(self):
        torch.manual_seed(7)
        np.random.seed(7)
        random.seed(7)
        self.policy = CandidateActorCritic(3, 2, hidden=16)
        self.states = torch.randn(2, 3)
        self.candidates = torch.randn(2, 5, 2)
        self.mask = torch.tensor([[True, False, True, True, False],
                                  [False, True, False, True, True]])

    def test_equivariance_and_state_only_critic(self):
        logits, raw_values = self.policy(self.states, self.candidates, self.mask)
        self.assertEqual(logits.shape, self.mask.shape)
        self.assertEqual(raw_values.shape, (2,))
        self.assertTrue((logits[~self.mask] == -torch.finfo(logits.dtype).max).all())
        dist, values = _distribution(self.policy, self.states, self.candidates, self.mask)
        permutation = torch.tensor([4, 2, 0, 3, 1])
        permuted, new_values = _distribution(self.policy,
            self.states, self.candidates[:, permutation], self.mask[:, permutation])
        torch.testing.assert_close(permuted.logits, dist.logits[:, permutation])
        torch.testing.assert_close(new_values, values)
        _, changed_values = _distribution(self.policy, self.states, self.candidates * 10, self.mask)
        torch.testing.assert_close(changed_values, values)
        self.assertEqual(values.shape, (2,))
        self.assertTrue(torch.isfinite(dist.logits).all())
        self.assertTrue((dist.probs[~self.mask] == 0).all())

    def test_padding_invariance_and_zero_padding_gradient(self):
        dist, values = _distribution(self.policy, self.states, self.candidates, self.mask)
        padded = torch.cat((self.candidates, torch.randn(2, 13, 2)), dim=1)
        padded.requires_grad_()
        mask = torch.cat((self.mask, torch.zeros(2, 13, dtype=torch.bool)), dim=1)
        longer, v2 = _distribution(self.policy, self.states, padded, mask)
        torch.testing.assert_close(longer.probs[:, :5], dist.probs)
        torch.testing.assert_close(longer.entropy(), dist.entropy())
        torch.testing.assert_close(v2, values)
        (-longer.log_prob(torch.tensor([0, 1])).sum()).backward()
        self.assertTrue((padded.grad[~mask] == 0).all())

    def test_sample_1000_and_greedy_are_legal(self):
        states = self.states[:1].expand(1000, -1)
        candidates = self.candidates[:1].expand(1000, -1, -1)
        mask = self.mask[:1].expand(1000, -1)
        for greedy in (False, True):
            indices, log_prob, values = self.policy.act(states, candidates, mask, greedy=greedy)
            self.assertTrue(mask.gather(1, indices[:, None]).all())
            self.assertTrue(torch.isfinite(log_prob).all())
            self.assertTrue(torch.isfinite(values).all())
            self.assertFalse(log_prob.requires_grad)
            evaluated, entropy, evaluated_values = self.policy.evaluate_actions(
                states, candidates, mask, indices)
            torch.testing.assert_close(evaluated, log_prob)
            torch.testing.assert_close(evaluated_values, values)
            self.assertTrue(torch.isfinite(entropy).all())
        # Sampling really uses RNG instead of silently returning greedy actions.
        counts = torch.bincount(self.policy.act(states, candidates, mask)[0], minlength=5)
        self.assertTrue((counts[self.mask[0]] > 0).all())

    def test_single_candidate_and_no_hard_candidate_limit(self):
        dist, _ = _distribution(self.policy, self.states[:1], torch.randn(1, 4097, 2),
                              torch.ones(1, 4097, dtype=torch.bool))
        self.assertEqual(dist.probs.shape, (1, 4097))
        dist, _ = _distribution(self.policy, self.states, self.candidates[:, :1],
                              torch.ones(2, 1, dtype=torch.bool))
        torch.testing.assert_close(dist.probs, torch.ones(2, 1))
        torch.testing.assert_close(dist.entropy(), torch.zeros(2))

    def test_reject_invalid_shapes_dtypes_and_nonfinite_inputs(self):
        cases = [
            (self.states, self.candidates, torch.zeros_like(self.mask)),
            (self.states, self.candidates, self.mask.float()),
            (self.states[:, :2], self.candidates, self.mask),
            (self.states, self.candidates[:, :, :1], self.mask),
            (self.states, self.candidates[:1], self.mask),
            (self.states, self.candidates, self.mask[:, :3]),
            (self.states.long(), self.candidates, self.mask),
            (self.states.double(), self.candidates, self.mask),
            (self.states * float("nan"), self.candidates, self.mask),
            (self.states, self.candidates * float("inf"), self.mask),
            (self.states[:0], self.candidates[:0], self.mask[:0]),
            (self.states, self.candidates[:, :0], self.mask[:, :0]),
        ]
        for args in cases:
            with self.subTest(shapes=[tuple(x.shape) for x in args]):
                with self.assertRaises(ValueError):
                    self.policy(*args)
        for dims in ((0, 2, 16), (3, -1, 16), (3, 2, 0), (3.5, 2, 16)):
            with self.assertRaises(ValueError):
                CandidateActorCritic(*dims)

    def test_reject_illegal_action_indices(self):
        for indices in (torch.tensor([1, 1]), torch.tensor([-1, 1]),
                        torch.tensor([5, 1]), torch.tensor([0., 1.]),
                        torch.tensor([[0], [1]])):
            with self.subTest(indices=indices):
                with self.assertRaises(ValueError):
                    self.policy.evaluate_actions(self.states, self.candidates, self.mask, indices)

    def test_collate_preserves_every_legal_row_and_ignores_metadata(self):
        first = SimpleNamespace(state=np.arange(3, dtype=np.float32),
                                candidates=np.arange(14, dtype=np.float32).reshape(7, 2),
                                action_ids=["opaque"] * 7, seed=123, heuristicScores="never read")
        second = {"state": [2, 3, 4], "candidates": [[9, 8]], "views": object()}
        states, candidates, mask = collate_observations([first, second], device="cpu")
        self.assertEqual(tuple(candidates.shape), (2, 7, 2))
        self.assertEqual(states.dtype, torch.float32)
        self.assertEqual(mask.dtype, torch.bool)
        torch.testing.assert_close(candidates[0], torch.from_numpy(first.candidates))
        self.assertTrue(mask[0].all())
        self.assertEqual(mask[1].tolist(), [True] + [False] * 6)
        torch.testing.assert_close(candidates[1, 1:], torch.zeros(6, 2))
        # K is determined anew on each call, never from a cached/global maximum.
        self.assertEqual(collate_observations([second])[1].shape[1], 1)

    def test_collate_rejects_empty_malformed_and_nonfinite_observations(self):
        good = {"state": [1, 2, 3], "candidates": [[1, 2]]}
        for observations in ([], [good, {"state": [1], "candidates": [[1, 2]]}],
                             [{"state": [1], "candidates": []}],
                             [{"state": [float("nan")], "candidates": [[1, 2]]}],
                             [{"state": [1], "candidates": [[float("inf"), 2]]}],
                             [{"state": [[1]], "candidates": [[1, 2]]}],
                             [{"state": [1]}]):
            with self.assertRaises(ValueError):
                collate_observations(observations)

    def test_gae_terminal_and_truncation_bootstrap_and_reset_boundary(self):
        rewards = torch.tensor([1., 2., 3., 4.])
        values = torch.tensor([.1, .2, .3, .4])
        next_values = torch.tensor([.2, 10., 20., .5])
        terminated = torch.tensor([False, True, False, False])
        truncated = torch.tensor([False, False, True, False])
        advantages, returns = compute_gae(rewards, values, next_values, terminated,
                                         truncated, gamma=.9, lam=.8)
        # Terminal ignores 10; truncation bootstraps 20 but cuts the trace.
        deltas = [1 + .9 * .2 - .1, 2 - .2, 3 + .9 * 20 - .3, 4 + .9 * .5 - .4]
        expected = torch.tensor([deltas[0] + .9 * .8 * deltas[1],
                                 deltas[1], deltas[2], deltas[3]])
        torch.testing.assert_close(advantages, expected)
        torch.testing.assert_close(returns, expected + values)
        other_rewards = rewards.clone()
        other_rewards[2:] += 1000
        other, _ = compute_gae(other_rewards, values, next_values, terminated, truncated,
                               gamma=.9, lam=.8)
        torch.testing.assert_close(other[:2], advantages[:2])
        # When both flags are true, termination wins (no bootstrap).
        both, _ = compute_gae(torch.tensor([2.]), torch.tensor([.2]), torch.tensor([99.]),
                              torch.tensor([True]), torch.tensor([True]))
        torch.testing.assert_close(both, torch.tensor([1.8]))

    def test_gae_contiguous_trace_and_detached_targets(self):
        rewards = torch.tensor([1., 2., 3.], requires_grad=True)
        values = torch.tensor([.2, .3, .4], requires_grad=True)
        flags = torch.zeros(3, dtype=torch.bool)
        advantages, returns = compute_gae(rewards, values, torch.tensor([.3, .4, .5]),
                                         flags, flags, gamma=.9, lam=.8)
        a2 = 3 + .9 * .5 - .4
        a1 = 2 + .9 * .4 - .3 + .9 * .8 * a2
        a0 = 1 + .9 * .3 - .2 + .9 * .8 * a1
        torch.testing.assert_close(advantages, torch.tensor([a0, a1, a2]))
        self.assertFalse(advantages.requires_grad)
        self.assertFalse(returns.requires_grad)
        with self.assertRaises(ValueError):
            compute_gae(rewards, values, values, flags.float(), flags)
        with self.assertRaises(ValueError):
            compute_gae(rewards, values, values[:1], flags, flags)
        with self.assertRaises(ValueError):
            compute_gae(rewards, values, values, flags, flags, gamma=1.1)

    def test_clipped_loss_exact_signs_coefficients_and_no_hidden_normalization(self):
        new = torch.log(torch.tensor([1.5, .5], requires_grad=True))
        old = torch.zeros(2)
        advantages = torch.tensor([2., -3.])
        values = torch.tensor([1., 3.], requires_grad=True)
        returns = torch.tensor([2., 1.])
        entropy = torch.tensor([.3, .7])
        result = _loss_dict(new, old, advantages, values, returns, entropy)
        # min(1.5*2, 1.2*2), min(.5*-3, .8*-3): policy loss is 0.
        expected_policy = -(min(1.5 * 2, 1.2 * 2) + min(.5 * -3, .8 * -3)) / 2
        expected_value = .5 * ((1 - 2) ** 2 + (3 - 1) ** 2) / 2
        self.assertAlmostEqual(result["policy_loss"].item(), expected_policy, places=6)
        self.assertAlmostEqual(result["value_loss"].item(), expected_value, places=6)
        self.assertAlmostEqual(result["loss"].item(), expected_policy + .5 * expected_value - .01 * .5, places=6)
        self.assertAlmostEqual(result["clip_fraction"].item(), 1.)
        self.assertTrue(all(torch.isfinite(x).all() for x in result.values()))
        result["loss"].backward()
        self.assertTrue(torch.isfinite(values.grad).all())
        for kwargs in ({"clip": -1}, {"vf": float("nan")}, {"ent": -1}):
            with self.assertRaises(ValueError):
                _loss_dict(new, old, advantages, values, returns, entropy, **kwargs)
        with self.assertRaises(ValueError):
            _loss_dict(new, old, advantages[:, None], values, returns, entropy)
        with self.assertRaises(ValueError):
            _loss_dict(new * float("nan"), old, advantages, values, returns, entropy)

    def test_real_gradient_and_parameter_update(self):
        optimizer = torch.optim.Adam(self.policy.parameters(), lr=.003)
        before = [p.detach().clone() for p in self.policy.parameters()]
        with torch.no_grad():
            indices, old, values = self.policy.act(self.states, self.candidates, self.mask)
        log_prob, entropy, values = self.policy.evaluate_actions(
            self.states, self.candidates, self.mask, indices)
        result = _loss_dict(log_prob, old, torch.tensor([1., -1.]), values,
                                  torch.tensor([2., -2.]), entropy)
        optimizer.zero_grad()
        result["loss"].backward()
        gradients = [p.grad for p in self.policy.parameters() if p.grad is not None]
        self.assertTrue(all(torch.isfinite(g).all() for g in gradients))
        self.assertGreater(sum(g.abs().sum().item() for g in gradients), 0.)
        torch.nn.utils.clip_grad_norm_(self.policy.parameters(), .5)
        optimizer.step()
        self.assertTrue(any(not torch.equal(a, b) for a, b in zip(before, self.policy.parameters())))

    def test_contextual_bandit_learns_with_actual_on_policy_clipped_ppo(self):
        # Reward is +1 iff candidate sign agrees with context sign; row order
        # flips independently. Only chosen actions receive rewards (not BC).
        scores = []
        for seed in (11, 29):
            torch.manual_seed(seed)
            policy = CandidateActorCritic(1, 1, hidden=16)
            optimizer = torch.optim.Adam(policy.parameters(), lr=.01)
            heldout_rng = torch.Generator().manual_seed(1000 + seed)
            heldout_states = torch.randn(512, 1, generator=heldout_rng)
            heldout_candidates = torch.tensor([[[-1.], [1.]]]).expand(512, -1, -1).clone()
            flips = torch.rand(512, generator=heldout_rng) > .5
            heldout_candidates[flips] = heldout_candidates[flips].flip(1)
            heldout_mask = torch.ones(512, 2, dtype=torch.bool)

            def expected_reward():
                with torch.no_grad():
                    dist, _ = _distribution(policy, heldout_states, heldout_candidates, heldout_mask)
                    rewards = torch.where(heldout_states * heldout_candidates.squeeze(-1) > 0, 1., -1.)
                    return (dist.probs * rewards).sum(1).mean().item()

            before = expected_reward()
            for _ in range(60):
                states = torch.randn(128, 1)
                candidates = torch.tensor([[[-1.], [1.]]]).expand(128, -1, -1).clone()
                flips = torch.rand(128) > .5
                candidates[flips] = candidates[flips].flip(1)
                mask = torch.ones(128, 2, dtype=torch.bool)
                with torch.no_grad():
                    indices, old, old_values = policy.act(states, candidates, mask)
                    selected = candidates.gather(1, indices[:, None, None]).squeeze(1)
                    rewards = torch.where((states * selected).squeeze(1) > 0, 1., -1.)
                    advantages, returns = compute_gae(
                        rewards, old_values, torch.zeros(128),
                        torch.ones(128, dtype=torch.bool), torch.zeros(128, dtype=torch.bool))
                    advantages = (advantages - advantages.mean()) / (advantages.std(unbiased=False) + 1e-8)
                for _ in range(3):
                    log_prob, entropy, values = policy.evaluate_actions(states, candidates, mask, indices)
                    loss = _loss_dict(log_prob, old, advantages, values, returns, entropy)["loss"]
                    optimizer.zero_grad()
                    loss.backward()
                    torch.nn.utils.clip_grad_norm_(policy.parameters(), .5)
                    optimizer.step()
            after = expected_reward()
            scores.append((seed, before, after))
            self.assertGreater(after, .45, msg=f"held-out improvement vs uniform reward 0: {scores}")
            self.assertGreater(after - before, .35, msg=str(scores))
        print(f"\nContextual-bandit held-out expected rewards (seed, before, after): {scores}")

    def _random_update(self, policy, optimizer):
        # Exercise all global RNG streams; optimizer must already have Adam moments.
        states = torch.randn(8, 3) + float(np.random.random()) + random.random()
        candidates = torch.randn(8, 4, 2)
        mask = torch.ones(8, 4, dtype=torch.bool)
        indices, old, _ = policy.act(states, candidates, mask)
        log_prob, entropy, values = policy.evaluate_actions(states, candidates, mask, indices)
        result = _loss_dict(log_prob, old, torch.randn(8), values, torch.randn(8), entropy)
        optimizer.zero_grad()
        result["loss"].backward()
        torch.nn.utils.clip_grad_norm_(policy.parameters(), .5)
        optimizer.step()
        return result["loss"].detach().clone()

    def test_checkpoint_roundtrip_optimizer_rng_exact_next_cpu_update(self):
        optimizer = torch.optim.Adam(self.policy.parameters(), lr=.003)
        self._random_update(self.policy, optimizer)
        reference = _distribution(self.policy, self.states, self.candidates, self.mask)
        trainer_rng = np.random.default_rng(81)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "policy.pt"
            save_checkpoint(path, self.policy, optimizer,
                            extra={"feature_version": "unit-v1", "steps": 123,
                                   "trainer_rng": trainer_rng.bit_generator.state})
            expected_loss = self._random_update(self.policy, optimizer)
            expected_parameters = [p.detach().clone() for p in self.policy.parameters()]
            restored = CandidateActorCritic(3, 2, hidden=16)
            restored_optimizer = torch.optim.Adam(restored.parameters(), lr=.9)
            extra = load_checkpoint(path, restored, restored_optimizer, expected_feature_version="unit-v1")
            self.assertEqual(extra["steps"], 123)
            resumed_rng = np.random.default_rng()
            resumed_rng.bit_generator.state = extra["trainer_rng"]
            np.testing.assert_array_equal(resumed_rng.integers(1000, size=10), trainer_rng.integers(1000, size=10))
            dist, values = _distribution(restored, self.states, self.candidates, self.mask)
            torch.testing.assert_close(dist.logits, reference[0].logits, rtol=0, atol=0)
            torch.testing.assert_close(values, reference[1], rtol=0, atol=0)
            actual_loss = self._random_update(restored, restored_optimizer)
            torch.testing.assert_close(actual_loss, expected_loss, rtol=0, atol=0)
            for actual, expected in zip(restored.parameters(), expected_parameters):
                torch.testing.assert_close(actual, expected, rtol=0, atol=0)
            self.assertEqual(restored_optimizer.param_groups[0]["lr"], .003)
            self.assertEqual(list(Path(directory).iterdir()), [path])

    def test_checkpoint_rejects_schema_dimensions_features_and_missing_optimizer(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "policy.pt"
            save_checkpoint(path, self.policy, extra={"feature_version": "one"})
            for policy, version in ((CandidateActorCritic(4, 2, 16), "one"),
                                    (CandidateActorCritic(3, 3, 16), "one"),
                                    (CandidateActorCritic(3, 2, 32), "one"),
                                    (self.policy, "two"), (self.policy, None)):
                with self.assertRaises(ValueError):
                    load_checkpoint(path, policy, expected_feature_version=version)
            with self.assertRaises(ValueError):
                load_checkpoint(path, self.policy, torch.optim.Adam(self.policy.parameters()), expected_feature_version="one")
            payload = torch.load(path, weights_only=False, map_location="cpu")
            payload["schemaVersion"] = 999
            torch.save(payload, path)
            with self.assertRaises(ValueError):
                load_checkpoint(path, self.policy, expected_feature_version="one")

    def test_checkpoint_atomic_failure_keeps_existing_file(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "policy.pt"
            save_checkpoint(path, self.policy)
            original = path.read_bytes()
            with mock.patch("ember_rl.model.os.replace", side_effect=OSError("simulated failure")):
                with self.assertRaises(OSError):
                    save_checkpoint(path, self.policy)
            self.assertEqual(path.read_bytes(), original)
            self.assertEqual(list(Path(directory).iterdir()), [path])

    def test_cuda_rng_count_mismatch_is_explicit(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "policy.pt"
            save_checkpoint(path, self.policy)
            payload = torch.load(path, weights_only=False, map_location="cpu")
            count = torch.cuda.device_count() if torch.cuda.is_available() else 0
            payload["rng"]["torch_cuda"] = [torch.get_rng_state()] * (count + 1)
            torch.save(payload, path)
            with self.assertRaises(ValueError):
                load_checkpoint(path, self.policy)
            with warnings.catch_warnings(record=True) as caught:
                warnings.simplefilter("always")
                load_checkpoint(path, self.policy, cuda_rng_mismatch="warn")
            self.assertTrue(any("CUDA" in str(w.message) for w in caught))
            # Intentional warm-starts can disable all RNG restoration explicitly.
            load_checkpoint(path, self.policy, restore_rng=False)

    @unittest.skipUnless(TORCH_AVAILABLE and torch.cuda.is_available(), "CUDA is not available")
    def test_cuda_forward_backward_sampling_and_checkpoint(self):
        policy = CandidateActorCritic(3, 2, 16).cuda()
        optimizer = torch.optim.Adam(policy.parameters(), lr=.003)
        states, candidates, mask = (x.cuda() for x in (self.states, self.candidates, self.mask))
        indices, old, _ = policy.act(states, candidates, mask)
        log_prob, entropy, values = policy.evaluate_actions(states, candidates, mask, indices)
        loss = _loss_dict(log_prob, old, torch.tensor([1., -1.], device="cuda"),
                                values, torch.zeros(2, device="cuda"), entropy)["loss"]
        loss.backward()
        self.assertTrue(all(torch.isfinite(p.grad).all() for p in policy.parameters() if p.grad is not None))
        optimizer.step()
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "cuda.pt"
            save_checkpoint(path, policy, optimizer)
            expected_random = torch.rand(10, device="cuda")
            restored = CandidateActorCritic(3, 2, 16).cuda()
            restored_optimizer = torch.optim.Adam(restored.parameters())
            load_checkpoint(path, restored, restored_optimizer)
            torch.testing.assert_close(torch.rand(10, device="cuda"), expected_random, rtol=0, atol=0)
            actual, v = _distribution(restored, states, candidates, mask)
            expected, ev = _distribution(policy, states, candidates, mask)
            torch.testing.assert_close(actual.logits, expected.logits)
            torch.testing.assert_close(v, ev)
            self.assertEqual(next(iter(restored_optimizer.state.values()))["exp_avg"].device.type, "cuda")
            observations = [{"state": [1, 2, 3], "candidates": [[1, 2], [3, 4]]}]
            self.assertTrue(all(t.is_cuda for t in collate_observations(observations, device="cuda")))


if __name__ == "__main__":
    unittest.main()


@unittest.skipUnless(TORCH_AVAILABLE, "torch is not installed")
def test_compute_gae_streams_is_bitwise_compute_gae_per_stream():
    import pytest
    from ember_rl.model import compute_gae_streams
    rng = np.random.default_rng(3)
    lengths = [1, 2, 7, 40, 3, 1, 15]
    n = sum(lengths)
    f32 = lambda x: np.asarray(x, np.float32)
    rewards, values, next_values = f32(rng.normal(size=n)), f32(rng.normal(size=n)), f32(rng.normal(size=n))
    terminated, truncated = np.zeros(n, bool), np.zeros(n, bool)
    ends = np.cumsum(lengths) - 1
    terminated[ends[::2]] = True
    truncated[ends[1::4]] = True
    truncated[5] = True                                   # a cut inside a stream
    discounts = f32(rng.choice([1., .9, .81, .5], size=n))
    lambdas = f32(rng.choice([.95, .9025, 1., .0], size=n))
    advantages, returns = compute_gae_streams(rewards, values, next_values, terminated, truncated, discounts,
                                              lambdas, lengths)
    start = 0
    for length in lengths:
        part = slice(start, start + length)
        t = lambda a: torch.from_numpy(a[part].copy())
        adv, ret = compute_gae(t(rewards), t(values), t(next_values), t(terminated), t(truncated),
                               gamma=.5, lam=.5, discounts=t(discounts), lambdas=t(lambdas))
        assert adv.numpy().tobytes() == advantages[part].tobytes() and ret.numpy().tobytes() == returns[part].tobytes()
        start += length
    with pytest.raises(ValueError):
        compute_gae_streams(rewards, values, next_values, terminated, truncated, discounts * 2, lambdas, lengths)
    with pytest.raises(ValueError):
        bad = rewards.copy()
        bad[0] = np.nan
        compute_gae_streams(bad, values, next_values, terminated, truncated, discounts, lambdas, lengths)
