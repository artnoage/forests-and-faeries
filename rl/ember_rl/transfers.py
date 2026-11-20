"""CPU/CUDA transfers for batched inference."""
from collections import deque
from functools import lru_cache
from threading import local

import numpy as np
import torch


class _Staging(local):
    def __init__(self):
        self.by_device = {}


_staging = _Staging()


@lru_cache(maxsize=32)
def _torch_dtype(dtype):
    return torch.from_numpy(np.empty(0, dtype=dtype)).dtype


@lru_cache(maxsize=32)
def _numpy_dtype(dtype):
    return torch.empty(0, dtype=dtype, device='cpu').numpy().dtype


def pinned_batch(obs, names, device):
    """Pack the observation into one async copy. Each result owns its device storage."""
    device = torch.device('cuda', torch.cuda.current_device()) if device.index is None else device
    pool = _staging.by_device.setdefault(device, deque())
    layout = []
    size = 0
    for name in names:
        if name in obs:
            array = np.atleast_1d(obs[name])
            dtype = _torch_dtype(array.dtype)
            # Keep each device view aligned for the compiled model's vector loads.
            offset = (size + 255) // 256 * 256
            layout.append((name, array, offset, dtype))
            size = offset + array.nbytes

    # Two host slabs per thread/device. An event protects the previous DMA even when the
    # caller changes streams, drops its device tensors, or reuses the engine observation.
    host = None
    if len(pool) == 2:
        host, ready = pool.popleft()
        if not ready.query():
            ready.synchronize()
    else:
        ready = torch.cuda.Event()
    if host is None or host.numel() < size:
        page = 65536
        host = torch.empty(max(1, (size + page - 1) // page) * page, dtype=torch.uint8, device='cpu', pin_memory=True)
    buffer = host.numpy()
    for _, array, offset, _ in layout:
        target = np.ndarray(array.shape, dtype=array.dtype, buffer=buffer, offset=offset)
        np.copyto(target, array)

    packed = host[:size].to(device, non_blocking=True)
    ready.record(torch.cuda.current_stream(device))
    pool.append((host, ready))
    return {name: packed.narrow(0, offset, array.nbytes).view(dtype).reshape(array.shape)
            for name, array, offset, dtype in layout}


def read_tensors(tensors):
    """One blocking read for related results, retaining every tensor's shape and dtype."""
    if not tensors or tensors[0].device.type == 'cpu':
        return [t.detach().numpy() for t in tensors]
    if len(tensors) == 1:
        return [tensors[0].detach().cpu().numpy()]
    # The trailing singleton supplies a unit stride even for a one-element strided view.
    parts = [t.detach().contiguous().reshape(-1).unsqueeze(-1).view(torch.uint8).flatten()
             for t in tensors]
    host = torch.cat(parts).cpu().numpy()
    result = []
    offset = 0
    for t, part in zip(tensors, parts):
        result.append(np.frombuffer(host, dtype=_numpy_dtype(t.dtype), count=t.numel(), offset=offset).reshape(t.shape))
        offset += part.numel()
    return result
