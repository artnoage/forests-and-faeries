"""Optional CUDA execution for the general model. Checkpoints keep ordinary module parameters."""
from collections import OrderedDict
from contextlib import contextmanager
from functools import lru_cache
import gc
import weakref

import torch

from ember_rl.general_env import CAND_FIELDS, CREATURE_FIELDS, PAIR_FIELDS, VALUE_INPUTS


_NEGATIVE_PADDING = {'cand_ids', 'creature_ids', 'cand_tgt', 'cand_cell'}
_LEAF_GRAPHS = OrderedDict()
_LEAF_GRAPH_LIMIT = 48


@contextmanager
def _no_gc():
    """Cyclic garbage collection off for a CUDA graph capture. A collection during capture can run a Triton
    kernel's __del__, whose module unload is not permitted on a capturing stream and invalidates the capture
    ('operation not permitted when stream is capturing')."""
    enabled = gc.isenabled()
    gc.collect()
    gc.disable()
    try:
        yield
    finally:
        if enabled:
            gc.enable()


def _round_up(size, step):
    return (size + step - 1) // step * step


def _shape(name, shape, creatures, actions, targets):
    axes = list(shape)
    if name in CREATURE_FIELDS:
        axes[1] = creatures
    elif name in PAIR_FIELDS:
        axes[1:3] = (creatures, creatures)
    elif name in CAND_FIELDS:
        axes[1] = actions
        if name in ('cand_tgt', 'cand_tgt_n'):
            axes[2] = targets
    return tuple(axes)


def bucket_batch(batch, *, value_only=False):
    """Pad only ragged token axes. B stays exact and padded tokens are masked."""
    creatures = _round_up(batch['creature_mask'].shape[1], 8)
    actions = targets = 0
    if not value_only:
        width = batch['cand_mask'].shape[1]
        actions = _round_up(width, 8 if width <= 32 else 32)
        targets = max(4, _round_up(batch['cand_tgt'].shape[2], 4))
    result = {}
    for name, tensor in batch.items():
        if value_only and name not in VALUE_INPUTS:
            continue
        shape = _shape(name, tensor.shape, creatures, actions, targets)
        if tuple(tensor.shape) == shape:
            result[name] = tensor.contiguous()
        else:
            pad = tensor.new_full(shape, -1 if name in _NEGATIVE_PADDING else 0)
            pad[tuple(slice(0, n) for n in tensor.shape)].copy_(tensor)
            result[name] = pad
    return result


def _policy(model, batch):
    return model._policy(batch)


def _policy_for_update(model, batch):
    # Dynamo caches by code object. PPO backward must have its own specialization budget
    # after inference has seen differently shaped search forks and frozen opponents.
    return model._policy(batch)


def _value(model, batch, detach_trunk):
    return model._value(batch, detach_trunk)


@lru_cache(maxsize=3)
def _compiled(function):
    # Model weights are inputs. Snapshots and freshly loaded policies can use the same kernels.
    # Explicit small-leaf graphs below own their buffers separately from PPO autograd.
    # Keep serving cached variants when a new shape exceeds Dynamo's bounded cache.
    # Its default graph-break mode runs such shapes eagerly, including their gradients.
    return torch.compile(function, dynamic=True, fullgraph=False, options={'triton.cudagraphs': False})


def compiled_policy(model, batch):
    function = _policy_for_update if torch.is_grad_enabled() else _policy
    logits, values = _compiled(function)(model, bucket_batch(batch))
    return logits[:, :batch['cand_mask'].shape[1]], values


class _LeafGraph:
    def __init__(self, model, batch, count):
        self.inputs = {}
        for name in VALUE_INPUTS:
            if name in batch:
                tensor = batch[name]
                shape = _shape(name, tensor.shape, 24, 0, 0)
                self.inputs[name] = tensor.new_zeros((count, *shape[1:]))
        self.fill(batch)
        device = self.inputs['map'].device
        stream = torch.cuda.Stream(device=device)
        current = torch.cuda.current_stream(device)
        stream.wait_stream(current)
        with torch.cuda.stream(stream):
            for _ in range(3):
                model._value(self.inputs)
        current.wait_stream(stream)
        self.graph = torch.cuda.CUDAGraph()
        # Captured casts and kernels read this model's parameters on every replay.
        with _no_gc(), torch.cuda.graph(self.graph, stream=stream):
            self.outputs = model._value(self.inputs)

    def fill(self, batch):
        # CNN/state rows are independent. Only the mask of the visible rows must clear stale creatures.
        self.inputs['creature_mask'].zero_()
        for name, dest in self.inputs.items():
            source = batch[name]
            dest[tuple(slice(0, n) for n in source.shape)].copy_(source)

    def replay(self, batch):
        self.fill(batch)
        self.graph.replay()
        return self.outputs[:batch['map'].shape[0]].clone()


def accelerated_value(model, batch, detach_trunk):
    count, creatures = batch['creature_mask'].shape
    if model.graph_leaves and not torch.is_grad_enabled() and count <= 64 and creatures <= 24:
        size = next(n for n in (8, 16, 32, 64) if n >= count)
        # Weak model identity prevents replay against a new policy following a league eviction.
        key = (weakref.ref(model), model.training, batch['map'].device, size)
        graph = _LEAF_GRAPHS.get(key)
        if graph is None:
            # Two learners x four sizes already fill eight entries; frozen league and evaluation models then
            # evicted them on every phase, and each rebuild costs a full gc.collect() plus a capture
            # (11% of the H200 trainer's main thread, 2026-11-23). A graph holds only its small input buffers.
            if len(_LEAF_GRAPHS) >= _LEAF_GRAPH_LIMIT:
                _LEAF_GRAPHS.popitem(last=False)
            graph = _LEAF_GRAPHS[key] = _LeafGraph(model, batch, size)
        _LEAF_GRAPHS.move_to_end(key)
        return graph.replay(batch)
    if model.compile_policy:
        return _compiled(_value)(model, bucket_batch(batch, value_only=True), detach_trunk)
    return model._value(batch, detach_trunk)
