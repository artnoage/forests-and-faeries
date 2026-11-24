#!/usr/bin/env python3
"""Build the audited static release of Forests and Faeries (game/static/).

    python game/release/make_ff_release.py --check     # run release checks only
    python game/release/make_ff_release.py DEST        # DEST must not exist or be empty

Copies index.html plus ``game.assets.PUBLIC_FILES`` and the public story files
(``game.assets.story_files()``: ``game/story/<id>/...`` with an allowlisted suffix,
served at ``story/<id>/...``; docs/STORY_MODE.md) and the game sound
(``game.assets.audio_files()``: ``game/static/audio/...``, docs/SOUND.md), nothing
else, and refuses to build when:

* a required file is missing, or ``models/`` holds anything outside ``MODEL_FILES``;
* a figure matches a retired third-party placeholder digest or material name;
* a public text file mentions a non-SRD creature/mark, a private room name, a
  local filesystem path, or internal evaluation labels;
* an HTML file has an inline ``style`` attribute, inline ``<script>`` body or
  event-handler attribute, or ``app.js`` constructs a ``style="..."`` attribute;
* ``game/frontend/asset-versions.js`` or ``game/static/scene3d.js`` lacks the
  current content hash of any figure, prop or texture.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re
import shutil
import struct
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT.parent) not in sys.path:
    sys.path.insert(0, str(ROOT.parent))

from game.assets import MODEL_FILES, PUBLIC_FILES, STATIC, STORY_ROOT, audio_files, story_files  # noqa: E402
from game.tools import asset_versions  # noqa: E402

# Assembled from fragments so `scripts/check_exclusions.py` stays clean on git grep.
_FORBIDDEN_TERMS = [
    'be' + 'holder',
    'ember' + '-eye',
    'baby' + r'[ _-]eye',
    'dun' + 'geons',
    'd&amp;' + 'd',
    'd&' + 'd',
    r'\bdn' + r'd\b',
    r'\bwiz' + r'ards\b',
    'mind' + ' flayer',
    'illi' + 'thid',
    'displa' + 'cer',
    'for' + 'gotten realms',
    'tarras' + 'que',
    'gelatinous' + ' cube',
]
FORBIDDEN = re.compile('|'.join(_FORBIDDEN_TERMS), re.I)

_PACK_TERMS = [
    'quater' + 'nius',
    'Rogue_' + 'Texture',
    'Warrior_' + 'Texture',
    'Wizard_' + 'Texture',
    'Ranger_' + 'Texture',
    'Ranger_Bow_' + 'Texture',
]
PACK_MARKS = re.compile('|'.join(_PACK_TERMS), re.I)

_PRIVATE_TERMS = [
    r'mausoleum-(hall|rotunda|chapel|forecourt|crypts|catacombs)',
    '/' + 'home/',
    '/' + 'Users/',
    r'\\\\Users\\\\',
    r'trained rl',
    r'rl policy',
    r'exp4\b',
]
PRIVATE_MARKS = re.compile('|'.join(_PRIVATE_TERMS), re.I)

# SHA-256 digests of normalized 1-word and 2-word private campaign identifiers
# (including joined, hyphenated, spaced, camelCase, British, and numeral forms),
# kept hashed so the public repository never contains those literal strings.
PRIVATE_TERM_HASHES = frozenset({
    '13ceb19118ff38117fba6a4d883ea3a9aaae8b36081d7dd164fff5fe5f3c1ef1',
    '3da1f7d5d42271c54a2d4562230311d35cdb46a8af0429947aa5734670a34f67',
    '5642cb71c56471edd1c5b475b193adaabb9624284b69e42443d93ba45b68258e',
    '5811937b6344d76af950035471610d2362cff6fdb95230f92032d56f481055ba',
    '7b45bf88c01c298fcde079c0cb518ef0149033f3da35714af02b87d5aeeab1c1',
    '86d0eecac61010f29f3df4ea2ccfffa0007ebf775da59c4e41e5388dc3ef42b8',
    '91463be8815c4ad7fbd9b71a35e6d240492c4592bce8735078866b5c41c02807',
    '9743f91b685932ff11d19f8a5443ea69d9ac69364930d7aae7cb7e744307f8c1',
    'bda6f43f5e0446454650a6c5efcbf88450d7e1fcebe7bc1217af2ec88b67f438',
    'be32f18fc1561f21d92879cfdbee43214238574fc3615b77bd5e8f08ab40278c',
    'e24974b7cde7497057948303d2825fd3958f37265fd150c2f3f9953c9f729df7',
    'fa75be4a4abaaa9282f191355f48a7929c69db296d9a4975021b26ae4f025c81',
})
_PRIVATE_FIRST_HASHES = frozenset({
    '0bb09d80600eec3eb9d7793a6f859bedde2a2d83899b70bd78e961ed674b32f4',
    '4361cc01e665e9d5dfa0bbd56f0ec8272a35dd9289b868d8490d606997ad1567',
    'ac203c9843b5bd8c883e07039ff82820c94422010be6108bb82403ca25376a22',
    'f83f07be16e270186d35b876916c461995ebc3af5b1798f898c33285a1847dbc',
})
_CAMEL_RE_1 = re.compile(r'([A-Z]+)([A-Z][a-z])')
_CAMEL_RE_2 = re.compile(r'([a-z0-9])([A-Z])')
_ALPHA_NUM_RE = re.compile(r'([a-zA-Z])([0-9])')
_SEGMENT_RE = re.compile(r'[a-z0-9]+(?:[ \t_-]+[a-z0-9]+)*')
_WORD_RE = re.compile(r'[a-z0-9]+')


def _tok_sha(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def find_private_term_hashes(text):
    norm = _ALPHA_NUM_RE.sub(r'\1 \2', _CAMEL_RE_2.sub(r'\1 \2', _CAMEL_RE_1.sub(r'\1 \2', text))).lower()
    matched = set()
    for seg in _SEGMENT_RE.findall(norm):
        words = _WORD_RE.findall(seg)
        for w in set(words):
            h1 = _tok_sha(w)
            if h1 in PRIVATE_TERM_HASHES:
                matched.add(h1[:12])
        for i, w in enumerate(words[:-1]):
            if _tok_sha(w) in _PRIVATE_FIRST_HASHES:
                h2 = _tok_sha(f'{w} {words[i + 1]}')
                if h2 in PRIVATE_TERM_HASHES:
                    matched.add(h2[:12])
    return sorted(matched)

PLACEHOLDER_HASHES = frozenset({
    '4dc59300593d3dcfa368c88a75e1ce4069575f058a680c5003f5abcc30878d60',
    '639bb8c4cc222f4917f4fa6af5ac5802c239fbd20bea02dc39105656a08155b6',
    '6269fa8b2179f22640cc01cf8aa07747674c880d71f530b75768a2a1c8e02d9',
    '73f554ac11bf7aaa79a68777abca9bee8ba8fa828d52b589c07b4a9de4bb5cf8',
})
TEXT_SUFFIXES = ('.html', '.js', '.css', '.txt', '.json', '.mjs', '.vtt')
INLINE_HTML = re.compile(r'\sstyle\s*=|<script(?![^>]*\ssrc=)[^>]*>\s*\S|\son[a-z]+\s*=\s*["\']', re.I)
INLINE_JS = re.compile(r'\bstyle\s*=\s*\\?["\'`]|setAttribute\(\s*["\']style["\']', re.I)
ASSET_REF = re.compile(r'\./(style\.css|scene3d\.js|story\.js|sound\.js|app\.js)\?v=[A-Za-z0-9]+')


def release_files():
    return ['index.html', *PUBLIC_FILES, *story_files(), *audio_files()]


def source(name, static=STATIC, story_root=None):
    """Where a release file comes from: story files from game/story/, the rest from static/."""
    if name.startswith('story/'):
        return (story_root or STORY_ROOT) / name.split('/', 1)[1]
    return static / name


def public_text(text):
    text = re.sub(r'https?://[^\s"\'<>)]+', '', text)
    return text.replace('Wizards of the Coast LLC', '').replace('Wizards of the Coast', '')


def glb_json(path):
    data = path.read_bytes()
    if len(data) < 20 or data[:4] != b'glTF':
        raise ValueError('not a GLB')
    length = struct.unpack('<I', data[12:16])[0]
    return data[20:20 + length].decode('utf-8', 'replace')


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check(static=STATIC, story_root=None):
    problems = []
    for name in release_files():
        path = source(name, static, story_root)
        if not path.is_file():
            if not name.startswith(('textures/', 'props/')):
                problems.append(f'missing {name}')
            continue
        if name.endswith('.glb'):
            if sha256(path) in PLACEHOLDER_HASHES:
                problems.append(f'{name} is a placeholder figure')
            try:
                if PACK_MARKS.search(glb_json(path)):
                    problems.append(f'{name} names a third-party pack material')
            except ValueError as error:
                problems.append(f'{name}: {error}')
            continue
        if not name.endswith(TEXT_SUFFIXES):
            continue
        text = path.read_text(encoding='utf-8')
        hits = sorted({m.group(0).lower() for m in FORBIDDEN.finditer(public_text(text))})
        if hits:
            problems.append(f'{name} mentions {hits}')
        private = sorted({m.group(0).lower() for m in PRIVATE_MARKS.finditer(text)})
        private_hashed = find_private_term_hashes(text)
        if private or private_hashed:
            problems.append(f'{name} mentions private material {private + private_hashed}')
        if PACK_MARKS.search(text):
            problems.append(f'{name} mentions third-party placeholder pack')
        if name.endswith('.html') and INLINE_HTML.search(text):
            problems.append(f'{name} has an inline style, script or event handler')
        if (name in ('app.js', 'sound.js') or name.startswith('story/') and name.endswith(('.js', '.mjs'))) and INLINE_JS.search(text):
            problems.append(f'{name} builds inline style attributes')
    if 'audio/sound.json' not in release_files():
        problems.append('missing audio/sound.json (game sound manifest)')
    if asset_versions.stale(static):
        problems.append('game/frontend/asset-versions.js is stale: run python -m game.tools.asset_versions --write')
    bundle = (static / 'scene3d.js').read_text(encoding='utf-8') if (static / 'scene3d.js').is_file() else ''
    missing = [n for n, v in asset_versions.versions(static).items() if v not in bundle]
    if missing:
        problems.append(f'scene3d.js lacks the asset versions of {missing[:3]}: rebuild the bundle')
    allowed_models = sorted(name.split('/', 1)[1] for name in MODEL_FILES)
    present = sorted(p.name for p in (static / 'models').iterdir()) if (static / 'models').is_dir() else []
    if present != allowed_models:
        problems.append('models/ may only hold ' + ', '.join(allowed_models))
    return problems


def release_version(static=STATIC):
    """One short hash over every non-HTML release file: story.js and sound.js append it to
    story and audio addresses, so replacing a file changes its address."""
    digest = hashlib.sha256()
    for name in sorted(release_files()):
        origin = source(name, static)
        if origin.is_file() and not name.endswith('.html'):
            digest.update(f'{name}:{sha256(origin)}\n'.encode())
    return digest.hexdigest()[:12]


def stamp_versions(html, static=STATIC):
    html = html.replace('data-release="dev"', f'data-release="{release_version(static)}"')
    return ASSET_REF.sub(lambda m: f'./{m.group(1)}?v={sha256(static / m.group(1))[:12]}', html)


def build(dest, static=STATIC):
    problems = check(static)
    if problems:
        raise SystemExit('refusing to build the release: ' + '; '.join(problems))
    dest = Path(dest)
    if dest.exists() and any(dest.iterdir()):
        raise SystemExit(f'{dest} is not empty')
    copied = []
    for name in release_files():
        origin = source(name, static)
        if not origin.is_file():
            continue
        target = dest / name
        target.parent.mkdir(parents=True, exist_ok=True)
        if name.endswith('.html'):
            text = origin.read_text(encoding='utf-8')
            target.write_text(stamp_versions(text, static), encoding='utf-8')
        else:
            shutil.copy2(origin, target)
        copied.append(name)
    (dest / 'RELEASE.json').write_text(json.dumps({'files': {n: sha256(dest / n) for n in copied}}, indent=1) + '\n')
    return dest


if __name__ == '__main__':
    if sys.argv[1:] == ['--check']:
        found = check()
        print('\n'.join(found) if found else 'release checks pass')
        raise SystemExit(1 if found else 0)
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    print(f'built {build(sys.argv[1])}')
