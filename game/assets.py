"""Static asset allowlists for Forests and Faeries."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / 'static'

# Every figure the scene can load (models/<key>.glb): the project's rigged originals.
MODEL_KEYS = ('guy', 'elion', 'curogana', 'mara', 'ilyra', 'chruna', 'skeleton', 'zombie', 'ghoul', 'ghast',
              'shadow', 'specter', 'wight', 'mummy', 'goblin', 'goblin_boss')
MODEL_FILES = tuple(f'models/{key}.glb' for key in MODEL_KEYS)
PROP_FILES = ('props/sarcophagus.glb', 'props/brazier.glb')
TEXTURE_FILES = tuple(f'textures/mausoleum/{name}.webp' for name in (
    'floor_albedo', 'floor_normal', 'floor_orm', 'floor_slab_albedo', 'floor_slab_normal', 'floor_slab_orm',
    'wall_albedo', 'wall_normal', 'wall_orm', 'window_albedo'))
PAGE_FILES = ('app.js', 'style.css', 'scene3d.js', 'licenses.html', 'third-party-licenses.txt')
# Every static file the public release may contain besides index.html (served at /).
PUBLIC_FILES = PAGE_FILES + MODEL_FILES + PROP_FILES + TEXTURE_FILES
