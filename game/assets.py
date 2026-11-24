"""Static asset allowlists for Forests and Faeries."""
from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / 'static'

# Every figure the scene can load (models/<key>.glb): the project's rigged originals.
MODEL_KEYS = ('guy', 'elion', 'curogana', 'mara', 'ilyra', 'chruna', 'skeleton', 'zombie', 'ghoul', 'ghast',
              'shadow', 'specter', 'wight', 'mummy', 'goblin', 'goblin_boss', 'animated_armor', 'kobold_warrior')
MODEL_FILES = tuple(f'models/{key}.glb' for key in MODEL_KEYS)
PROP_FILES = ('props/sarcophagus.glb', 'props/brazier.glb')
TEXTURE_FILES = tuple(f'textures/mausoleum/{name}.webp' for name in (
    'floor_albedo', 'floor_normal', 'floor_orm', 'floor_slab_albedo', 'floor_slab_normal', 'floor_slab_orm',
    'wall_albedo', 'wall_normal', 'wall_orm', 'window_albedo'))
PAGE_FILES = ('app.js', 'style.css', 'scene3d.js', 'story.js', 'licenses.html', 'third-party-licenses.txt')
# Every static file the public release may contain besides index.html (served at /).
PUBLIC_FILES = PAGE_FILES + MODEL_FILES + PROP_FILES + TEXTURE_FILES

# Story mode (docs/STORY_MODE.md): every story owns one directory, story/<id>/, served
# whole at /story/<id>/... under one rule: any file whose suffix is in STORY_TYPES, outside
# hidden names. Nothing else in the directory (notes, provenance, sources) is ever served.
STORY_ROOT = ROOT / 'story'
STORY_TYPES = {
    '.json': 'application/json', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
    '.webp': 'image/webp', '.avif': 'image/avif', '.opus': 'audio/ogg', '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.vtt': 'text/vtt',
}
STORY_ID = re.compile(r'^[a-z][a-z0-9_-]{0,31}$')
STORY_PART = re.compile(r'^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$')


def story_path(name):
    """The file behind a public story path ``<id>/<rel>`` (no ``story/`` prefix), or None.

    Safe by construction: every path part is a plain name (no ``..``, no hidden files,
    no separators), the suffix is allowlisted, and the resolved file stays inside its
    story directory (symbolic links that leave it are refused)."""
    parts = str(name).split('/')
    if len(parts) < 2 or len(parts) > 6 or not STORY_ID.match(parts[0]):
        return None
    if not all(STORY_PART.match(p) and '..' not in p for p in parts[1:]):
        return None
    if Path(parts[-1]).suffix.lower() not in STORY_TYPES or Path(parts[-1]).suffix != Path(parts[-1]).suffix.lower():
        return None
    base = (STORY_ROOT / parts[0]).resolve()
    path = (STORY_ROOT.joinpath(*parts)).resolve()
    if base not in path.parents or not path.is_file():
        return None
    return path


def story_files():
    """Every public story file, as release paths ``story/<id>/<rel>``, sorted."""
    out = []
    if not STORY_ROOT.is_dir():
        return ()
    for path in sorted(STORY_ROOT.rglob('*')):
        rel = path.relative_to(STORY_ROOT).as_posix()
        if path.is_file() and story_path(rel) is not None:
            out.append('story/' + rel)
    return tuple(out)
