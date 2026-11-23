"""Invariants of the general entity transformer (GENERAL_ENV.md §5.7) on FakeBatchEnv observations."""
import json
import random

import numpy as np
import pytest

torch = pytest.importorskip('torch')

from ember_rl.fake_env import FakeBatchEnv
from ember_rl.general_env import EpisodeSpec, MODEL_INPUTS, UNKNOWN_ID
from ember_rl.general_model import (
    EMBEDDINGS, GeneralActorCritic, build_general, collate, drop_ids, general_config, parameter_count, select,
    split_obs, to_batch, vocab_id_slots,
)
from ember_rl.model import _model_config, build_model, load_checkpoint, save_checkpoint

SMALL = dict(d_model=32, heads=4, encoder_layers=1, decoder_layers=1, cnn_channels=16, cnn_layers=2)


@pytest.fixture(scope='module')
def observation():
    """A batched observation with varied candidate and creature counts."""
    env = FakeBatchEnv(12)
    rng = random.Random(3)
    specs = [EpisodeSpec(f'fake-train-{i % 6}', rng.randrange(2**30), rng.randrange(2**30), rng.randrange(2**30))
             for i in range(12)]
    env.reset(range(12), specs, [{'heroes': 'external', 'monsters': 'external'}] * 12)
    for _ in range(3):   # a few native steps so that some creatures are hurt and moved
        live = [s for s in range(12) if not env.info([s])['done'][0]]
        env.step(live, env.observe(live)['native_choice'].astype(np.int32))
    live = [s for s in range(12) if not env.info([s])['done'][0]]
    return env.observe(live)


def small(seed=0, **overrides):
    torch.manual_seed(seed)
    return build_general(general_config(**{**SMALL, **overrides})).eval()


def batch_of(obs):
    return {k: v.clone() for k, v in to_batch(obs).items()}


def test_default_size_is_about_ten_million():
    model = build_general(general_config())
    assert 11e6 < parameter_count(model) < 13e6        # ember-gen-v2 inputs and relation messages: 12.2M
    assert model.full_config()['d_model'] == 384


def test_masked_rows_are_minus_inf_and_legal_rows_finite(observation):
    model = small()
    b = batch_of(observation)
    with torch.no_grad():
        logits, values = model(b)
    mask = b['cand_mask']
    assert torch.isneginf(logits[~mask]).all() and torch.isfinite(logits[mask]).all()
    assert values.shape == (mask.shape[0],) and torch.isfinite(values).all()
    indices, log_probs, _ = model.act(b)
    assert bool(mask.gather(1, indices[:, None]).all()) and torch.isfinite(log_probs).all()
    log_prob, entropy, _ = model.evaluate_actions(b, indices)
    assert torch.isfinite(entropy).all()
    padded_rows = (~mask[:, -1]).nonzero().flatten()
    if len(padded_rows):
        bad = indices.clone()
        bad[padded_rows[0]] = mask.shape[1] - 1          # a padded row
        with pytest.raises(ValueError):
            model.evaluate_actions(b, bad)


def test_permuting_candidates_permutes_logits(observation):
    model = small()
    b = batch_of(observation)
    with torch.no_grad():
        logits, values = model(b)
    g = torch.Generator().manual_seed(1)
    permuted = {k: v.clone() for k, v in b.items()}
    perms = []
    for row in range(b['cand_mask'].shape[0]):
        k = int(b['cand_mask'][row].sum())
        perm = torch.randperm(k, generator=g)
        perms.append(perm)
        for name in ('cands', 'cand_ids', 'cand_tgt', 'cand_tgt_n', 'cand_cell'):
            permuted[name][row, :k] = b[name][row, perm]
    with torch.no_grad():
        logits_p, values_p = model(permuted)
    for row, perm in enumerate(perms):
        assert torch.allclose(logits_p[row, :len(perm)], logits[row, perm], atol=1e-5)
    assert torch.allclose(values_p, values, atol=1e-5)


def test_permuting_creatures_with_remapped_pointers_changes_nothing(observation):
    model = small()
    b = batch_of(observation)
    with torch.no_grad():
        logits, values = model(b)
    g = torch.Generator().manual_seed(2)
    permuted = {k: v.clone() for k, v in b.items()}
    for row in range(b['creature_mask'].shape[0]):
        n = int(b['creature_mask'][row].sum())
        perm = torch.randperm(n, generator=g)             # new token j holds old token perm[j]
        inverse = torch.empty_like(perm)
        inverse[perm] = torch.arange(n)
        for name in ('creatures', 'creature_ids'):
            permuted[name][row, :n] = b[name][row, perm]
        if 'creature_rel' in b:
            permuted['creature_rel'][row, :n, :n] = b['creature_rel'][row, perm][:, perm]
        target = b['cand_tgt'][row].long()
        permuted['cand_tgt'][row] = torch.where(target >= 0, inverse[target.clamp(min=0)], target).to(b['cand_tgt'].dtype)
        permuted['actor'][row] = inverse[int(b['actor'][row])]
    assert not torch.equal(permuted['creatures'], b['creatures'])
    with torch.no_grad():
        logits_p, values_p = model(permuted)
    mask = b['cand_mask']
    assert torch.allclose(logits_p[mask], logits[mask], atol=1e-5)
    assert torch.allclose(values_p, values, atol=1e-5)


def test_padding_changes_nothing_legal(observation):
    model = small()
    b = batch_of(observation)
    with torch.no_grad():
        logits, values = model(b)
    B, N = b['creature_mask'].shape
    K = b['cand_mask'].shape[1]
    g = torch.Generator().manual_seed(3)
    padded = {}
    extra_n, extra_k = 5, 7
    for name, value in b.items():
        if name in ('creatures', 'creature_ids', 'creature_mask'):
            pad = torch.zeros((B, extra_n) + value.shape[2:], dtype=value.dtype)
            padded[name] = torch.cat([value, pad], 1)
        elif name == 'creature_rel':
            padded[name] = torch.zeros((B, N + extra_n, N + extra_n) + value.shape[3:], dtype=value.dtype)
            padded[name][:, :N, :N] = value
        elif name in ('cands', 'cand_ids', 'cand_tgt', 'cand_tgt_n', 'cand_cell', 'cand_mask'):
            pad = torch.zeros((B, extra_k) + value.shape[2:], dtype=value.dtype)
            padded[name] = torch.cat([value, pad], 1)
        else:
            padded[name] = value.clone()
    # Garbage (but in-range) content in every padded creature and candidate row.
    cmask, amask = padded['creature_mask'], padded['cand_mask']
    padded['creatures'][~cmask] = torch.randn(int((~cmask).sum()), padded['creatures'].shape[-1], generator=g)
    padded['creature_ids'][~cmask] = torch.randint(-2, 256, (int((~cmask).sum()), 3), generator=g).to(torch.int16)
    padded['cands'][~amask] = torch.randn(int((~amask).sum()), padded['cands'].shape[-1], generator=g)
    padded['cand_ids'][~amask] = torch.randint(-2, 256, (int((~amask).sum()), 3), generator=g).to(torch.int16)
    padded['cand_tgt'][~amask] = torch.randint(-1, N + extra_n, (int((~amask).sum()), padded['cand_tgt'].shape[-1]),
                                               generator=g).to(torch.int16)
    padded['cand_tgt_n'][~amask] = 1
    padded['cand_cell'][~amask] = torch.randint(-1, 1024, (int((~amask).sum()),), generator=g).to(torch.int16)
    if 'creature_rel' in padded:     # garbage relations to and from padded creatures
        rel = padded['creature_rel']
        noise = torch.randint(0, 2, rel.shape, generator=g).to(rel.dtype)
        pair = (cmask.unsqueeze(2) & cmask.unsqueeze(1)).unsqueeze(-1)
        padded['creature_rel'] = torch.where(pair, rel, noise)
    with torch.no_grad():
        logits_p, values_p = model(padded)
    mask = b['cand_mask']
    assert torch.allclose(logits_p[:, :K][mask], logits[mask], atol=1e-5)
    assert torch.isneginf(logits_p[:, K:]).all()
    assert torch.allclose(values_p, values, atol=1e-5)


def test_value_does_not_depend_on_candidates(observation):
    model = small()
    b = batch_of(observation)
    with torch.no_grad():
        _, values = model(b)
        altered = {k: v.clone() for k, v in b.items()}
        altered['cands'].normal_()
        altered['cand_ids'][..., 0] = 3
        _, values_altered = model(altered)
        assert torch.allclose(model.value(b), values, atol=1e-5)
        no_candidates = {k: v for k, v in b.items()}
        for name in ('cands', 'cand_ids', 'cand_tgt', 'cand_tgt_n', 'cand_cell', 'cand_mask'):
            no_candidates[name] = b[name][:, :0]
        assert torch.allclose(model.value(no_candidates), values, atol=1e-5)
    assert torch.allclose(values_altered, values, atol=1e-5)


def test_collate_matches_batched_observation_and_keeps_native_apart(observation):
    model = small()
    samples = [split_obs(observation, i) for i in range(len(observation['actor']))]
    batch, native = collate(samples, native=True)
    assert set(batch) == set(MODEL_INPUTS) and not set(batch) & set(native)
    assert batch['creature_mask'].shape[1] == max(int(m.sum()) for m in observation['creature_mask'])
    direct = to_batch(observation)
    with torch.no_grad():
        logits_c, values_c = model(batch)
        logits_d, values_d = model(direct)
    mask = batch['cand_mask']
    assert torch.allclose(logits_c[mask], logits_d[:, :mask.shape[1]][mask], atol=1e-5)
    assert torch.allclose(values_c, values_d, atol=1e-5)
    assert torch.equal(native['native_choice'], torch.as_tensor(observation['native_choice'], dtype=torch.long))
    assert torch.equal(native['is_move'], batch['cand_ids'][..., 0] == 0)


def test_invalid_batches_raise(observation):
    model = small()
    b = batch_of(observation)
    bad = dict(b, cand_tgt=b['cand_tgt'].clone())
    bad['cand_tgt'][0, 0, 0] = b['creature_mask'].shape[1]
    with pytest.raises(ValueError, match='cand_tgt'):
        model(bad)
    bad = dict(b, cands=b['cands'].clone())
    bad['cands'][0, 0, 0] = float('nan')
    with pytest.raises(ValueError, match='finite'):
        model(bad)
    bad = dict(b, cand_mask=b['cand_mask'].clone())
    bad['cand_mask'][0] = False
    with pytest.raises(ValueError, match='legal candidate'):
        model(bad)


def test_id_dropout_and_vocab_slots(tmp_path):
    ids = np.array([[[3, -1, -1], [0, 0, 22], [-1, -1, -1]]], np.int16)
    dropped = drop_ids(ids, 1., np.random.default_rng(0))
    assert dropped.tolist() == [[[UNKNOWN_ID, -1, -1], [UNKNOWN_ID, UNKNOWN_ID, 22], [-1, -1, -1]]]
    assert np.array_equal(drop_ids(ids, 0., np.random.default_rng(0)), ids) and ids[0, 0, 0] == 3
    vocab = tmp_path / 'vocab.json'
    vocab.write_text(json.dumps(dict(schema=1, range=[0, 199], sections=dict(creatures=dict(a=0, b=199)))))
    assert vocab_id_slots(vocab) == {name: 256 for name in EMBEDDINGS}
    vocab.write_text(json.dumps(dict(schema=1, range=[0, 299], sections=dict(spells=dict(a=280)))))
    with pytest.raises(ValueError):
        vocab_id_slots(vocab)


def test_unknown_ids_are_valid_inputs(observation):
    model = small()
    b = batch_of(observation)
    b['creature_ids'] = torch.from_numpy(drop_ids(observation['creature_ids'], 1., np.random.default_rng(1)))
    with torch.no_grad():
        logits, _ = model(b)
    assert torch.isfinite(logits[b['cand_mask']]).all()


def test_checkpoint_round_trip_rebuilds_architecture(tmp_path, observation):
    model = small(seed=4)
    path = tmp_path / 'policy.pt'
    save_checkpoint(path, model, extra={'feature_version': 'ember-gen-v1', 'team': 'monsters'})
    payload = torch.load(path, weights_only=False)
    assert payload['model_config'] == _model_config(model, 'ember-gen-v1')
    assert payload['model_config']['arch'] == 'general'
    clone = build_model(payload['model_config'])
    assert isinstance(clone, GeneralActorCritic)
    load_checkpoint(path, clone, restore_rng=False, expected_feature_version='ember-gen-v1')
    clone.eval()
    b = batch_of(observation)
    with torch.no_grad():
        assert torch.equal(model(b)[0], clone(b)[0])
    other = small(seed=4, d_model=64)
    with pytest.raises(ValueError):
        load_checkpoint(path, other, restore_rng=False, expected_feature_version='ember-gen-v1')
    with pytest.raises(ValueError):
        load_checkpoint(path, clone, restore_rng=False, expected_feature_version='ember-gen-v2')


@pytest.mark.skipif(not torch.cuda.is_available(), reason='CUDA not available')
def test_cuda_bf16_forward_backward(observation):
    model = small().cuda().train()
    b = to_batch(observation, 'cuda')
    logits, values = model(b)
    assert logits.dtype == torch.float32 and torch.isneginf(logits[~b['cand_mask']]).all()
    (logits.masked_fill(~b['cand_mask'], 0).sum() + values.sum()).backward()
    assert all(p.grad is None or torch.isfinite(p.grad).all() for p in model.parameters())
    assert model.encoder.layers[0].self_attn.in_proj_weight.grad is not None


def test_bucketed_inputs_preserve_policy_values_and_gradients(observation):
    from ember_rl.accelerated import bucket_batch

    model = small().train()
    batch = batch_of(observation)
    padded = bucket_batch(batch)
    width = batch['cand_mask'].shape[1]
    assert padded['creature_mask'].shape[1] % 8 == 0
    assert padded['cand_mask'].shape[1] % 8 == 0
    assert not padded['cand_mask'][:, width:].any()
    outputs = []
    for inputs in (batch, padded):
        model.zero_grad(set_to_none=True)
        logits, values = model(inputs)
        (logits[inputs['cand_mask']].mean() + values.mean()).backward()
        outputs.append((logits[:, :width].detach(), values.detach(), model.cand_proj[0].weight.grad.clone()))
    for actual, expected in zip(*outputs):
        torch.testing.assert_close(actual, expected, atol=2e-5, rtol=1e-4)
    state = bucket_batch(batch, value_only=True)
    assert 'cand_mask' not in state
    torch.testing.assert_close(model._value(state), model.value(batch), atol=2e-5, rtol=1e-4)


def test_search_width_groups_keep_every_slot_and_candidate_budget():
    from ember_rl.general_model import grouped_row_chunks

    widths = np.tile([7, 30, 55, 90, 140], 25)
    masks = np.arange(140)[None, :] < widths[:, None]
    chunks = grouped_row_chunks({'cand_mask': masks}, max_rows=700)
    np.testing.assert_array_equal(np.sort(np.concatenate(chunks)), np.arange(len(widths)))
    assert all(len(chunk) * widths[chunk].max() <= 700 for chunk in chunks)
    assert all(len(set(widths[chunk])) == 1 for chunk in chunks)


@pytest.mark.skipif(not torch.cuda.is_available(), reason='CUDA graph capture requires a GPU')
def test_leaf_graph_replays_new_inputs_and_weights(observation):
    model = small().cuda()
    batch = to_batch(observation, 'cuda')
    with torch.no_grad():
        model.graph_leaves = True
        expected = model._value(batch)
        first = model.value(batch)
        torch.testing.assert_close(first, expected, atol=.02, rtol=.02)
        frozen = first.clone()
        model.value_head[-1].bias.add_(1.)
        smaller = {k: v[:max(1, len(v) - 1)].flip((0,)) for k, v in batch.items()}
        second = model.value(smaller)
        torch.testing.assert_close(second, model._value(smaller), atol=.02, rtol=.02)
        torch.testing.assert_close(first, frozen, atol=0, rtol=0)


@pytest.mark.skipif(not torch.cuda.is_available(), reason='CUDA graphs')
def test_leaf_graphs_survive_the_loss_of_every_cached_model(observation):
    """The shared graph pool is retired with its last graph; the next capture must take a new pool."""
    import gc
    batch = to_batch(observation, 'cuda')
    with torch.no_grad():
        for _ in range(3):
            model = small().cuda()
            model.graph_leaves = True
            torch.testing.assert_close(model.value(batch), model._value(batch), atol=.02, rtol=.02)
            del model
            gc.collect()


def test_policy_specialization_limit_keeps_ppo_trainable(monkeypatch):
    from torch._dynamo import config, reset_code
    from ember_rl import accelerated

    class Policy(torch.nn.Module):
        def __init__(self):
            super().__init__()
            self.weight = torch.nn.Parameter(torch.tensor(2.))
            self.negate = False

        def _policy(self, batch):
            x = self.weight * batch['cands'][..., 0]
            return (-x if self.negate else x), x.mean(1)

    compiled = []
    compile_fn = torch.compile

    def counting_backend(graph, inputs):
        compiled.append(graph)
        return graph.forward

    def fast_compile(function, **kwargs):
        kwargs.pop('options')  # Inductor-specific; exercise the real Dynamo cache on CPU.
        return compile_fn(function, backend=counting_backend, **kwargs)

    monkeypatch.setattr(torch, 'compile', fast_compile)
    model = Policy()
    data = dict(creature_mask=torch.ones(2, 2, dtype=torch.bool), cand_mask=torch.ones(2, 5, dtype=torch.bool),
                cand_tgt=torch.zeros(2, 5, 1, dtype=torch.long), cands=torch.ones(2, 5, 1))
    accelerated._compiled.cache_clear()
    try:
        with config.patch(recompile_limit=1):
            for gradients in (False, True):
                with torch.set_grad_enabled(gradients):
                    for model.negate in (False, True, False):
                        logits, _ = accelerated.compiled_policy(model, data)
                        sign = -1 if model.negate else 1
                        torch.testing.assert_close(logits, torch.full((2, 5), float(sign * 2)))
                        if gradients:
                            model.zero_grad()
                            logits.sum().backward()
                            assert model.weight.grad.item() == sign * 10
            assert len(compiled) == 2  # one inference graph and a separately compiled PPO graph
    finally:
        accelerated._compiled.cache_clear()
        for function in (accelerated._policy, accelerated._policy_for_update):
            reset_code(function.__code__)


def test_leaf_graph_capture_runs_without_cyclic_gc():
    import gc
    from ember_rl.accelerated import _no_gc
    assert gc.isenabled()
    with _no_gc():
        assert not gc.isenabled()
    assert gc.isenabled()
    gc.disable()
    try:
        with _no_gc():
            assert not gc.isenabled()
        assert not gc.isenabled()           # the caller's setting is restored, not forced on
    finally:
        gc.enable()
