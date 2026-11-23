"""Entity transformer for the general environment (GENERAL_ENV.md §5.7), about 12M parameters at d = 384
(ember-gen-v2 inputs; 11M with ember-gen-v1).

    map u8[C,S,S] -> fixed one-hot/scale lookup -> CNN (3x3 convs, residual, per-cell LN) -> cell features F[S*S, c]
                                               -> PxP average pool -> patch tokens -> Linear(d) + 2D position
    creatures -> Linear(d) + Emb(kind) + Emb(character) + Emb(concentration spell)     (key-padding mask)
               + relation messages (ember-gen-v2 creature_rel, R relations):
                 W_m . concat_r [sum_j rel[i,j,r] c_j / max(1, sum_j rel[i,j,r])] + W_n . (sum_j rel[i,j,r] / n)_r
                 (n = real creatures; order- and padding-free)
    global    -> Linear(d) ; value token (learned)
    encoder: transformer layers over [value, global, creatures(N), patches]
    candidate token = Linear(cand floats) + Emb(action kind) + Emb(spell) + Emb(attack name)
                    + W_t . sum_k n_k h[tgt_k] / sum_k n_k     (pointer gather, multiplicity-weighted)
                    + W_c . F[cell]                            (cell gather from the CNN)
                    + W_a . h[actor]
    decoder: transformer layers (self-attention over candidates, cross-attention to the encoder)
    logits = MLP(decoded), masked to -inf ; value = MLP(encoder output at the value token)

Contracts kept from `ember_rl.model`: raw masked logits, a state-only critic,
no candidate or creature position embeddings, so permuting candidates permutes
logits, permuting creatures (with remapped pointers) changes nothing, and
padding changes nothing that is legal. Unlike the V3 models, masked logits are
-inf (not -finfo.max); `torch.distributions.Categorical` handles both.

Inputs are the dict of `general_env.MODEL_INPUTS` tensors made by `to_batch`
or `collate`, in the environment's dtypes (int16 ids, uint8 map, bool masks);
`forward` converts them. Native arrays are never inputs.

Id embeddings: every table has `ID_SLOTS` (256) rows for the vocabulary's ids
plus two: "none" (-1) and "unknown" (-2, id dropout). Row = id + 2.
"""
from __future__ import annotations

import json
import os
from collections.abc import Mapping, Sequence
from pathlib import Path

import numpy as np
import torch
from torch import Tensor, nn
from torch.distributions import Categorical
from torch.nn import functional as F

from ember_rl.general_env import (
    CAND_FIELDS, CREATURE_FIELDS, DEFAULT_DIMS, ID_SLOTS, MODEL_INPUTS, MOVE_KIND, NATIVE_FIELDS, OPTIONAL_INPUTS,
    PAIR_FIELDS, UNKNOWN_ID, normalize_dims,
)

ARCH = 'general'
ID_OFFSET = 2
# Embedding table -> content/vocab.json section that feeds it.
EMBEDDINGS = {'creature_kind': 'creatures', 'character': 'characters', 'spell': 'spells',
              'action_kind': 'action_kinds', 'attack': 'attacks'}
# How each map channel (§5.3) becomes float input channels.
MAP_TRANSFORM = (
    ('bin',), ('bin',), ('bin',),          # 0 inside, 1 wall, 2 difficult terrain
    ('onehot', 3), ('onehot', 3),          # 3 cover (0/1/2), 4 light (0/1/2)
    ('bin',), ('bin',), ('bin',), ('bin',), ('bin',), ('bin',),   # 5 actor .. 10 corpse
    ('scale', 4.), ('scale', 4.),          # 11 enemy melee threat, 12 enemy exposure (counts)
    ('cost', 32.),                         # 13 path cost in squares, 255 unreachable
    ('onehot', 3),                         # 14 reachable (0/1/2)
    ('bin',),                              # 15 actor LOS
    ('bin',),                              # 16 actor trail: squares the actor stood on this turn (ember-gen-v2)
)
MIN_MAP_CHANNELS = 16                      # ember-gen-v1


def vocab_id_slots(path: str | Path | None = None) -> dict[str, int]:
    """Rows per embedding table (before the two special rows), from a vocab file.

    Every table has 256 slots (ids 0..255, private range 200-255), so adding
    content never changes tensor shapes. The file is read to check that every
    id fits; a section that does not exist yet (e.g. `characters`) still gets
    its 256 slots."""
    slots = {name: ID_SLOTS for name in EMBEDDINGS}
    if path is None:
        return slots
    vocab = json.loads(Path(path).read_text())
    sections = vocab.get('sections', {})
    for name, section in EMBEDDINGS.items():
        ids = list(sections.get(section, {}).values())
        if ids and (min(ids) < 0 or max(ids) >= ID_SLOTS):
            raise ValueError(f'{path}: {section} ids must lie in [0, {ID_SLOTS})')
    low, high = vocab.get('range', (0, ID_SLOTS - 1))
    if low < 0 or high >= ID_SLOTS:
        raise ValueError(f'{path}: vocabulary range {low}-{high} exceeds {ID_SLOTS} slots')
    return slots


# Channels after those above (a later feature version): their transform by index; a channel not listed
# reads as a count, ('scale', 4.). Set the real encoding here when an ember-gen version defines one. Every
# version's channels are a prefix of the next one's, so a model keeps the transform of its own channels
# (16-channel ember-gen-v1 models are unchanged).
EXTRA_MAP_TRANSFORM: dict[int, tuple] = {}


def map_transform(channels: int) -> tuple:
    if channels < MIN_MAP_CHANNELS:
        raise ValueError(f'the map needs at least {MIN_MAP_CHANNELS} channels, not {channels}')
    return MAP_TRANSFORM[:channels] + tuple(EXTRA_MAP_TRANSFORM.get(c, ('scale', 4.))
                                            for c in range(len(MAP_TRANSFORM), channels))


def _map_luts(channels: int):
    luts = []
    values = torch.arange(256, dtype=torch.float32)
    for spec in map_transform(channels):
        kind = spec[0]
        if kind == 'bin':
            lut = values.clamp(max=1.)[:, None]
        elif kind == 'onehot':
            lut = F.one_hot(values.long().clamp(max=spec[1] - 1), spec[1]).float()
        elif kind == 'scale':
            lut = (values.clamp(max=4 * spec[1]) / spec[1])[:, None]
        elif kind == 'cost':
            reachable = values < 255
            lut = torch.stack([torch.where(reachable, values.clamp(max=254) / spec[1], 0.), (~reachable).float()], 1)
        else:
            raise ValueError(kind)
        luts.append(lut)
    return luts


class _MapCNN(nn.Module):
    """3x3 convolutions with pre-activation residual connections, then a per-cell LayerNorm.

    No normalization inside the blocks: GroupNorm over the 32x32 canvas was a third
    of the forward time at large batches. Runs channels-last (the input is a
    permuted NHWC tensor) and returns per-cell features [B, S*S, c]."""

    def __init__(self, in_channels, channels, layers):
        super().__init__()
        self.stem = nn.Conv2d(in_channels, channels, 3, padding=1)
        self.blocks = nn.ModuleList(nn.Conv2d(channels, channels, 3, padding=1) for _ in range(layers - 1))
        self.norm = nn.LayerNorm(channels)

    def forward(self, x):
        x = self.stem(x)
        for conv in self.blocks:
            x = x + conv(F.gelu(x))
        b, c, h, w = x.shape
        return F.gelu(self.norm(x.permute(0, 2, 3, 1).reshape(b, h * w, c)))


class GeneralActorCritic(nn.Module):
    def __init__(self, *, creature_features: int = DEFAULT_DIMS['creature'], global_features: int = DEFAULT_DIMS['global_'],
                 cand_features: int = DEFAULT_DIMS['cand'], map_channels: int = DEFAULT_DIMS['map_channels'],
                 canvas: int = DEFAULT_DIMS['canvas'], patch: int = 4, d_model: int = 384, heads: int = 6,
                 encoder_layers: int = 3, decoder_layers: int = 2, ff_mult: int = 4, cnn_channels: int = 64,
                 cnn_layers: int = 4, id_slots: Mapping[str, int] | None = None, relations: int = 0):
        super().__init__()
        if canvas % patch:
            raise ValueError('canvas must be a multiple of the patch size')
        if cnn_layers < 1:
            raise ValueError('cnn_layers counts convolutions and must be >= 1')
        self._config = dict(creature_features=creature_features, global_features=global_features,
                            cand_features=cand_features, map_channels=map_channels, canvas=canvas, patch=patch,
                            d_model=d_model, heads=heads, encoder_layers=encoder_layers, decoder_layers=decoder_layers,
                            ff_mult=ff_mult, cnn_channels=cnn_channels, cnn_layers=cnn_layers,
                            id_slots=dict(sorted((id_slots or vocab_id_slots()).items())))
        if relations:     # only then in the config, so ember-gen-v1 configs and checkpoints are unchanged
            self._config['relations'] = int(relations)
        self.compile_policy = False
        self.graph_leaves = False
        self.relations = int(relations)
        if set(self._config['id_slots']) != set(EMBEDDINGS):
            raise ValueError(f'id_slots must name exactly {sorted(EMBEDDINGS)}')
        d = d_model
        self.d_model, self.canvas, self.patch = d, canvas, patch
        self.lut_names = []
        for c, lut in enumerate(_map_luts(map_channels)):
            self.register_buffer(f'lut{c}', lut, persistent=False)
            self.lut_names.append(f'lut{c}')
        in_channels = sum(getattr(self, n).shape[1] for n in self.lut_names)
        self.cnn = _MapCNN(in_channels, cnn_channels, cnn_layers)
        project = lambda n: nn.Sequential(nn.Linear(n, d), nn.LayerNorm(d))
        self.patch_proj = project(cnn_channels)
        side = canvas // patch
        self.patch_row = nn.Parameter(torch.zeros(side, 1, d))
        self.patch_col = nn.Parameter(torch.zeros(1, side, d))
        self.creature_proj = project(creature_features)
        if self.relations:
            # Relation messages (ember-gen-v2 creature_rel): per relation r, the mean token of the creatures
            # j that i stands in relation r to, and the count of them, projected and added to i's token.
            self.rel_message = nn.Linear(self.relations * d, d)
            self.rel_count = nn.Linear(self.relations, d, bias=False)
        self.global_proj = project(global_features)
        self.cand_proj = project(cand_features)
        self.embed = nn.ModuleDict({name: nn.Embedding(slots + ID_OFFSET, d)
                                    for name, slots in self._config['id_slots'].items()})
        self.value_token = nn.Parameter(torch.zeros(1, 1, d))
        self.w_target = nn.Linear(d, d, bias=False)
        self.w_cell = nn.Linear(cnn_channels, d, bias=False)
        self.w_actor = nn.Linear(d, d, bias=False)
        for p in (self.patch_row, self.patch_col, self.value_token):
            nn.init.normal_(p, std=.02)
        for table in self.embed.values():
            nn.init.normal_(table.weight, std=.02)
        layer = dict(d_model=d, nhead=heads, dim_feedforward=ff_mult * d, dropout=0., activation='gelu',
                     batch_first=True, norm_first=True)
        self.encoder = nn.TransformerEncoder(nn.TransformerEncoderLayer(**layer), encoder_layers,
                                             enable_nested_tensor=False)
        self.decoder = nn.TransformerDecoder(nn.TransformerDecoderLayer(**layer), decoder_layers)
        self.state_norm = nn.LayerNorm(d)
        self.cand_norm = nn.LayerNorm(d)
        self.policy_head = nn.Sequential(nn.Linear(d, d), nn.GELU(), nn.Linear(d, 1))
        self.value_head = nn.Sequential(nn.Linear(d, d), nn.GELU(), nn.Linear(d, 1))

    # ---- configuration (model.save_checkpoint / build_model) ----
    def full_config(self) -> dict:
        return {'arch': ARCH, **self._config, 'id_slots': dict(self._config['id_slots'])}

    @classmethod
    def from_config(cls, config: Mapping) -> 'GeneralActorCritic':
        if config.get('arch') != ARCH:
            raise ValueError(f'not a {ARCH} model config')
        kwargs = {k: v for k, v in config.items() if k not in ('arch', 'feature_version')}
        return cls(**kwargs)

    def value_parameters(self):
        """The parameters a value-only warm-up trains (the policy stays frozen)."""
        return list(self.value_head.parameters())

    # ---- input checks (one host sync) ----
    def _check(self, b: Mapping[str, Tensor], need_candidates: bool, defer: bool = False):
        cfg = self._config
        missing = [k for k in MODEL_INPUTS if k not in b and not (k in OPTIONAL_INPUTS and not self.relations)]
        if missing:
            raise ValueError(f'batch lacks {missing}')
        cm, am = b['creature_mask'], b['cand_mask']
        if cm.dtype != torch.bool or am.dtype != torch.bool or cm.ndim != 2 or am.ndim != 2:
            raise ValueError('creature_mask [B,N] and cand_mask [B,K] must be bool')
        B, N = cm.shape
        K = am.shape[1]
        s = cfg['canvas']
        shapes = {'creatures': (B, N, cfg['creature_features']), 'creature_ids': (B, N, 3),
                  'map': (B, cfg['map_channels'], s, s), 'global': (B, cfg['global_features']),
                  'cands': (B, K, cfg['cand_features']), 'cand_ids': (B, K, 3), 'cand_cell': (B, K), 'actor': (B,)}
        if self.relations:
            shapes['creature_rel'] = (B, N, N, self.relations)
        for name, shape in shapes.items():
            if tuple(b[name].shape) != shape:
                raise ValueError(f'{name}: shape {tuple(b[name].shape)} != {shape}')
        if b['cand_tgt'].shape[:2] != (B, K) or b['cand_tgt_n'].shape != b['cand_tgt'].shape:
            raise ValueError('cand_tgt and cand_tgt_n must be [B,K,T]')
        if B == 0:
            raise ValueError('empty batch')
        checks = {
            'creatures/global/cands must be finite': torch.stack([torch.isfinite(b[k]).all() for k in ('creatures', 'global', 'cands')]).all(),
            'id out of range': torch.stack([((b[k] >= UNKNOWN_ID) & (b[k] < ID_SLOTS)).all() for k in ('creature_ids', 'cand_ids')]).all(),
            'cand_tgt out of range': ((b['cand_tgt'] >= -1) & (b['cand_tgt'] < N)).all(),
            'cand_cell out of range': ((b['cand_cell'] >= -1) & (b['cand_cell'] < s * s)).all(),
            'actor out of range': ((b['actor'] >= -1) & (b['actor'] < N)).all(),
        }
        if need_candidates:
            checks['each row needs a legal candidate and an actor'] = am.any(1).all() & (b['actor'] >= 0).all()
        ok = torch.stack(list(checks.values()))
        if defer:                   # the caller reads the flags later (no wait for the GPU here)
            return list(checks), ok
        if not bool(ok.all()):
            failed = [name for name, flag in zip(checks, ok.tolist()) if not flag]
            raise ValueError('invalid batch: ' + '; '.join(failed))

    # ---- network ----
    def _encode(self, b):
        cm = b['creature_mask']
        B, N = cm.shape
        grid = b['map'].long()
        dtype = torch.bfloat16 if grid.is_cuda else torch.float32
        x = torch.cat([getattr(self, name).to(dtype)[grid[:, c]] for c, name in enumerate(self.lut_names)], -1)
        cells = self.cnn(x.permute(0, 3, 1, 2))                                # [B,S*S,c], cell y*S+x
        side, p = self.canvas // self.patch, self.patch
        patches = cells.reshape(B, side, p, side, p, -1).mean((2, 4)).reshape(B, side * side, -1)   # [B,P,c]
        position = (self.patch_row + self.patch_col).reshape(1, -1, self.d_model)
        ids = b['creature_ids'].long() + ID_OFFSET
        creatures = (self.creature_proj(b['creatures']) + self.embed['creature_kind'](ids[..., 0])
                     + self.embed['character'](ids[..., 1]) + self.embed['spell'](ids[..., 2]))
        if self.relations:
            pair = (cm.unsqueeze(2) & cm.unsqueeze(1)).unsqueeze(-1)              # padding never counts
            rel = (b['creature_rel'] * pair).to(creatures.dtype)                  # [B,N,N,R], 0/1
            count = rel.sum(2)                                                    # [B,N,R]
            mean = torch.einsum('bijr,bjd->bird', rel, creatures) / count.clamp(min=1.).unsqueeze(-1)
            real = cm.sum(1).clamp(min=1).to(count.dtype).view(B, 1, 1)               # padding-free scale
            creatures = creatures + self.rel_message(mean.reshape(B, N, -1)) + self.rel_count(count / real)
        tokens = torch.cat([self.value_token.expand(B, -1, -1), self.global_proj(b['global']).unsqueeze(1),
                            creatures, self.patch_proj(patches) + position], 1)
        pad = torch.cat([cm.new_zeros(B, 2), ~cm, cm.new_zeros(B, patches.shape[1])], 1)
        memory = self.state_norm(self.encoder(tokens, src_key_padding_mask=pad))
        return memory, pad, cells

    def _decode(self, b, memory, pad, cells):
        cm, am = b['creature_mask'], b['cand_mask']
        B, N = cm.shape
        h = memory[:, 2:2 + N]
        ids = b['cand_ids'].long() + ID_OFFSET
        query = (self.cand_proj(b['cands']) + self.embed['action_kind'](ids[..., 0])
                 + self.embed['spell'](ids[..., 1]) + self.embed['attack'](ids[..., 2]))
        target = b['cand_tgt'].long()
        weight = b['cand_tgt_n'].float() * (target >= 0)
        gather = torch.zeros(B, am.shape[1], N, device=h.device).scatter_add_(2, target.clamp(min=0), weight)
        gather = gather / gather.sum(-1, keepdim=True).clamp(min=1.)
        pointer = torch.bmm(gather.to(h.dtype), h)
        cell = b['cand_cell'].long()
        cell_features = cells.gather(1, cell.clamp(min=0).unsqueeze(-1).expand(-1, -1, cells.shape[-1]))
        cell_features = cell_features * (cell >= 0).unsqueeze(-1).to(cell_features.dtype)
        actor = b['actor'].long()
        actor_h = h.gather(1, actor.clamp(min=0).view(B, 1, 1).expand(-1, 1, h.shape[-1]))
        actor_h = actor_h * (actor >= 0).view(B, 1, 1).to(actor_h.dtype)
        query = query + self.w_target(pointer) + self.w_cell(cell_features) + self.w_actor(actor_h)
        decoded = self.cand_norm(self.decoder(query, memory, tgt_key_padding_mask=~am, memory_key_padding_mask=pad))
        return self.policy_head(decoded).squeeze(-1)

    def forward(self, batch: Mapping[str, Tensor], check: bool = True) -> tuple[Tensor, Tensor]:
        """-> raw logits [B,K] (-inf on masked rows), values [B].

        check=False skips the input checks and the finiteness check (host syncs) for
        inputs that already passed them (PPO updates replay acted-on observations);
        the caller then checks `finite(logits, values, mask)` itself."""
        if check:
            self._check(batch, need_candidates=True)
        if self.compile_policy and batch['cand_mask'].is_cuda:
            from ember_rl.accelerated import compiled_policy
            logits, values = compiled_policy(self, batch)
        else:
            logits, values = self._policy(batch)
        if check and not bool(finite(logits, values, batch['cand_mask'])):
            raise FloatingPointError('non-finite logits or values')
        return logits, values

    def _policy(self, batch):
        am = batch['cand_mask']
        with torch.autocast('cuda', dtype=torch.bfloat16, enabled=am.is_cuda):
            memory, pad, cells = self._encode(batch)
            logits = self._decode(batch, memory, pad, cells)
            values = self.value_head(memory[:, 0]).squeeze(-1)
        return logits.float().masked_fill(~am, -torch.inf), values.float()

    def value(self, batch: Mapping[str, Tensor], detach_trunk: bool = False, check: bool = True) -> Tensor:
        """State value only: needs no legal candidates (K may be 0, actor may be -1).

        detach_trunk=True trains only the value head (value-only warm-up).
        check=False skips the input checks (see forward)."""
        if check:
            self._check(batch, need_candidates=False)
        if batch['creature_mask'].is_cuda and (self.compile_policy or self.graph_leaves):
            from ember_rl.accelerated import accelerated_value
            return accelerated_value(self, batch, detach_trunk)
        return self._value(batch, detach_trunk)

    def _value(self, batch, detach_trunk=False):
        with torch.autocast('cuda', dtype=torch.bfloat16, enabled=batch['creature_mask'].is_cuda):
            with torch.set_grad_enabled(torch.is_grad_enabled() and not detach_trunk):
                memory, _, _ = self._encode(batch)
            values = self.value_head(memory[:, 0]).squeeze(-1)
        return values.float()

    def evaluate_actions(self, batch, indices: Tensor):
        logits, values = self(batch)
        mask = batch['cand_mask']
        if indices.shape != (mask.shape[0],) or indices.dtype != torch.long or indices.device != mask.device:
            raise ValueError('indices must be int64[B] on the input device')
        if bool(((indices < 0) | (indices >= mask.shape[1])).any()) or not bool(mask.gather(1, indices[:, None]).all()):
            raise ValueError('cannot evaluate an illegal/padded candidate')
        distribution = Categorical(logits=logits)
        return distribution.log_prob(indices), distribution.entropy(), values

    @torch.no_grad()
    def act(self, batch, greedy: bool = False, check: bool = True):
        """indices[B], log_probs[B], values[B]; greedy ties take the first maximum."""
        logits, values = self(batch, check=check)
        distribution = Categorical(logits=logits)
        indices = logits.argmax(-1) if greedy else distribution.sample()
        return indices, distribution.log_prob(indices), values


def finite(logits: Tensor, values: Tensor, mask: Tensor) -> Tensor:
    """0-d bool tensor: logits on legal rows and values are finite (no host sync)."""
    return torch.isfinite(logits.masked_fill(~mask, 0)).all() & torch.isfinite(values).all()


def build_general(config: Mapping) -> GeneralActorCritic:
    return GeneralActorCritic.from_config(config)


DEFAULT_ARCH = dict(patch=4, d_model=384, heads=6, encoder_layers=3, decoder_layers=2, ff_mult=4,
                    cnn_channels=64, cnn_layers=4)


def general_config(dims: Mapping | None = None, *, vocab: str | Path | None = None, **arch) -> dict:
    """The model config (as stored in checkpoints) for env dims and architecture overrides."""
    unknown = set(arch) - set(DEFAULT_ARCH)
    if unknown:
        raise ValueError(f'unknown architecture options {sorted(unknown)}')
    d = normalize_dims(dims)
    config = dict(arch=ARCH, creature_features=d['creature'], global_features=d['global_'], cand_features=d['cand'],
                  map_channels=d['map_channels'], canvas=d['canvas'], **DEFAULT_ARCH)
    if d['relations']:
        config['relations'] = d['relations']
    config.update({k: int(v) for k, v in arch.items() if v is not None})
    config['id_slots'] = dict(sorted(vocab_id_slots(vocab).items()))
    return config


def parameter_count(model: nn.Module) -> int:
    return sum(p.numel() for p in model.parameters())


# --------------------------------------------------------------------------- batching

_FILL = {'creature_ids': -1, 'cand_ids': -1, 'cand_tgt': -1, 'cand_cell': -1}


def split_obs(obs: Mapping[str, np.ndarray], i: int) -> dict[str, np.ndarray]:
    """Copy slot i of a batched observation, trimmed to its legal rows and real creatures."""
    k = int(obs['cand_mask'][i].sum())
    n = int(obs['creature_mask'][i].sum())
    out = {}
    for name, array in obs.items():
        if name in CAND_FIELDS:
            out[name] = np.array(array[i, :k])
        elif name in CREATURE_FIELDS:
            out[name] = np.array(array[i, :n])
        elif name in PAIR_FIELDS:
            out[name] = np.array(array[i, :n, :n])
        else:
            out[name] = np.array(array[i])
    return out


def select(obs: Mapping[str, np.ndarray], index: Sequence[int] | np.ndarray) -> dict[str, np.ndarray]:
    """Rows `index` of a batched observation, trimmed to their own widest K and N."""
    index = np.asarray(index)
    if (len(index) and index.dtype.kind in 'iu' and int(index[0]) >= 0 and int(index[-1]) - int(index[0]) + 1 == len(index)
            and (len(index) == 1 or (np.diff(index) == 1).all())):
        index = slice(int(index[0]), int(index[-1]) + 1)       # consecutive rows: views, no gather
    k = max(1, int(obs['cand_mask'][index].sum(1).max())) if obs['cand_mask'].shape[1] else 0
    n = max(1, int(obs['creature_mask'][index].sum(1).max()))
    return trimmed_rows(obs, index, k, n)


def trimmed_rows(obs, index, k, n):
    """Select observation rows with known action and creature widths. A row slice returns views."""
    out = {}
    for name, array in obs.items():
        # Basic slices are views. The row gather only copies the retained columns.
        if name in CAND_FIELDS:
            array = array[:, :k]
        elif name in CREATURE_FIELDS:
            array = array[:, :n]
        elif name in PAIR_FIELDS:
            array = array[:, :n, :n]
        out[name] = array[index]
    return out


# Inference forward passes take at most this many candidate rows (B x K after padding) at a time. Destination
# moves (--moves dest) make K reach several hundred, and one pass over 1024 slots, or over a search's 4096
# forks, would hold gigabytes of decoder activations. With one-square moves a pass stays one chunk.
# EMBER_FORWARD_ROWS lowers it on small GPUs (a 24 GB L4 ran out of memory on 8 GiB search passes); the chunk size
# changes memory and speed only, never the result.
FORWARD_ROWS = int(os.environ.get('EMBER_FORWARD_ROWS') or 1 << 18)


def row_chunks(obs: Mapping[str, np.ndarray], max_rows: int | None = None) -> list[np.ndarray]:
    """Consecutive position chunks of a batched observation whose padded size (chunk length x its widest K)
    stays within max_rows (default FORWARD_ROWS; at least one row per chunk)."""
    max_rows = max_rows or FORWARD_ROWS
    k = np.maximum(np.asarray(obs['cand_mask']).sum(1), 1)
    chunks, start, widest = [], 0, 0
    for n, width in enumerate(k.tolist()):
        wide = max(widest, width)
        if n > start and (n - start + 1) * wide > max_rows:
            chunks.append(np.arange(start, n))
            start, wide = n, width
        widest = wide
    chunks.append(np.arange(start, len(k)))
    return chunks


def grouped_row_chunks(obs, max_rows=None):
    """Group wide, heterogeneous search batches when trimming saves at least 20% of padded actions."""
    mask = obs['cand_mask']
    count, width = mask.shape
    if count < 64 or width <= 32:
        return row_chunks(obs, max_rows)
    widths = mask.sum(axis=1)
    codes = np.searchsorted((8, 32, 64, 128), widths)
    groups = [np.flatnonzero(codes == code) for code in np.unique(codes)]
    padded = sum(len(group) * int(widths[group].max()) for group in groups)
    if padded >= .8 * count * width:
        return row_chunks(obs, max_rows)
    chunks = []
    for group in groups:
        # row_chunks needs just the mask. Keep every index in the original batch's coordinates.
        for chunk in row_chunks({'cand_mask': mask[group]}, max_rows):
            chunks.append(group[chunk])
    return chunks


def forward_in_chunks(model, obs: Mapping[str, np.ndarray], device, max_rows: int | None = None, **kwargs):
    """model(batch) over a batched observation in row_chunks: logits [B, K of obs] (-inf beyond each row's
    own rows) and values [B]."""
    chunks = row_chunks(obs, max_rows)
    if len(chunks) == 1:
        return model(to_batch(obs, device), **kwargs)
    k = obs['cand_mask'].shape[1]
    parts = [model(to_batch(select(obs, c), device), **kwargs) for c in chunks]
    logits = torch.cat([F.pad(l, (0, k - l.shape[1]), value=-torch.inf) for l, _ in parts])
    return logits, torch.cat([v for _, v in parts])


def act_in_chunks(model, obs: Mapping[str, np.ndarray], device, greedy: bool = False, max_rows: int | None = None):
    """model.act over a batched observation in row_chunks: indices, log_probs, values [B]."""
    chunks = row_chunks(obs, max_rows)
    if len(chunks) == 1:
        return model.act(to_batch(obs, device), greedy=greedy)
    # The input and finiteness checks read flags back from the GPU, which makes the CPU wait for every chunk.
    # Here every chunk is still checked in full, but the flags stay on the device and are read once at the end
    # (a chosen row's log-probability is finite only if its logits are).
    deferred = hasattr(model, '_check') and 'defer' in model._check.__code__.co_varnames
    parts, flags, names = [], [], []
    for c in chunks:
        batch = to_batch(select(obs, c), device)
        if deferred:
            names, ok = model._check(batch, need_candidates=True, defer=True)
            flags.append(ok)
            parts.append(model.act(batch, greedy=greedy, check=False))
        else:
            parts.append(model.act(batch, greedy=greedy))
    indices, log_probs, values = (torch.cat(x) for x in zip(*parts))
    if deferred:
        ok = torch.stack(flags).all(0).tolist()
        if not all(ok):
            raise ValueError('invalid batch: ' + '; '.join(name for name, flag in zip(names, ok) if not flag))
        if not bool((torch.isfinite(log_probs).all() & torch.isfinite(values).all())):
            raise FloatingPointError('non-finite logits or values')
    return indices, log_probs, values


def to_batch(obs: Mapping[str, np.ndarray], device='cpu') -> dict[str, Tensor]:
    """Model inputs of an already batched observation (numpy) as tensors on `device`."""
    return {name: torch.from_numpy(np.ascontiguousarray(obs[name])).to(device, non_blocking=True)
            for name in MODEL_INPUTS if name in obs}


def _device(array: np.ndarray, device, pin: bool) -> Tensor:
    tensor = torch.from_numpy(array)
    if pin:   # page-locked staging: the copy is truly asynchronous (a pageable one syncs the stream)
        tensor = tensor.pin_memory()
    return tensor.to(device, non_blocking=True)


def collate(samples: Sequence[Mapping[str, np.ndarray]], device='cpu', *, native: bool = False, pin: bool = False):
    """Pad per-sample observations (from `split_obs`) to the batch's widest K and N.

    Returns the model-input batch, plus (native=True) a dict with native_raw
    f32[B,K], native_dropped bool[B,K], native_choice int64[B] and is_move
    bool[B,K], kept apart from the model inputs. pin=True (CUDA only) copies through
    page-locked memory without blocking the host, so collation overlaps GPU work."""
    if not samples:
        raise ValueError('cannot collate an empty batch')
    b = len(samples)
    k = max(s['cand_mask'].shape[0] for s in samples)
    n = max(1, max(s['creature_mask'].shape[0] for s in samples))
    inputs = tuple(name for name in MODEL_INPUTS if name in samples[0])
    fields = inputs + (NATIVE_FIELDS if native else ())
    out = {}
    for name in fields:
        first = samples[0][name]
        if name in CAND_FIELDS or name in CREATURE_FIELDS:
            width = k if name in CAND_FIELDS else n
            array = np.full((b, width) + first.shape[1:], _FILL.get(name, 0), first.dtype)
            for i, s in enumerate(samples):
                value = s[name]
                array[i, :value.shape[0]] = value
        elif name in PAIR_FIELDS:
            array = np.zeros((b, n, n) + first.shape[2:], first.dtype)
            for i, s in enumerate(samples):
                value = s[name]
                array[i, :value.shape[0], :value.shape[1]] = value
        else:
            array = np.stack([s[name] for s in samples])
        out[name] = array
    batch = {name: _device(out[name], device, pin) for name in inputs}
    if not native:
        return batch
    targets = dict(native_raw=_device(out['native_raw'], device, pin),
                   native_dropped=_device(out['native_dropped'], device, pin),
                   native_choice=_device(out['native_choice'].astype(np.int64), device, pin),
                   is_move=batch['cand_ids'][..., 0] == MOVE_KIND)
    return batch, targets


def drop_ids(creature_ids: np.ndarray, p: float, rng: np.random.Generator) -> np.ndarray:
    """Id dropout (§5.2): each real creature's kind and character ids become "unknown"
    together with probability p. Returns a copy; the concentration spell id stays."""
    ids = np.array(creature_ids, copy=True)
    if p <= 0:
        return ids
    hit = (rng.random(ids.shape[:-1]) < p) & (ids[..., 0] >= 0)
    ids[..., 0][hit] = UNKNOWN_ID
    character = ids[..., 1]
    character[hit & (character >= 0)] = UNKNOWN_ID
    return ids
