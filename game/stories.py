"""Story mode manifests (docs/STORY_MODE.md): load and check ``game/story/<id>/manifest.json``.

    python -m game.stories --check          # check every story that has a manifest

A story directory without a manifest is fine: the start screen shows "coming soon".
The checks cover the contract the browser shell (``static/story.js``) relies on:
eight chapters that name real public catalogue levels, a map node for each, scenes
that exist, and media files that the server and the release will actually serve.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

if __package__ in (None, ''):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from game.assets import STORY_ROOT, STORY_ID, story_files, story_path  # noqa: E402

CHAPTERS = 8
MAX_STORY_BYTES = 40 * 1024 * 1024
MAX_FILE_BYTES = 12 * 1024 * 1024
IMAGE = ('.webp', '.avif')
AUDIO = ('.opus', '.ogg', '.m4a', '.mp3')
VIDEO = ('.mp4', '.webm')
MOTIONS = {'zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'pan-up', 'pan-down', 'none'}
SHOT_KEYS = {'image', 'video', 'poster', 'title', 'speaker', 'text', 'audio', 'duration', 'motion', 'alt'}


def story_ids():
    """Every story directory (with or without a manifest)."""
    if not STORY_ROOT.is_dir():
        return []
    return sorted(p.name for p in STORY_ROOT.iterdir() if p.is_dir() and STORY_ID.match(p.name))


def load(story_id):
    path = STORY_ROOT / story_id / 'manifest.json'
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding='utf-8'))


def _media(story_id, rel, suffixes, where, problems):
    if not isinstance(rel, str) or not rel:
        problems.append(f'{where}: expected a file path')
        return
    if not rel.lower().endswith(suffixes):
        problems.append(f'{where}: {rel} must end in one of {", ".join(suffixes)}')
        return
    if story_path(f'{story_id}/{rel}') is None:
        problems.append(f'{where}: {rel} is missing or not servable')


def check(story_id, levels=None):
    """Problems with one story's manifest (an empty list when it is good or absent)."""
    problems = []
    try:
        manifest = load(story_id)
    except (OSError, ValueError) as error:
        return [f'{story_id}/manifest.json: {error}']
    if manifest is None:
        return []
    where = f'{story_id}/manifest.json'
    if not isinstance(manifest, dict):
        return [f'{where}: not a JSON object']
    if manifest.get('version') != 1:
        problems.append(f'{where}: version must be 1')
    if manifest.get('id') != story_id:
        problems.append(f'{where}: id must be "{story_id}"')
    if not isinstance(manifest.get('title'), str) or not manifest['title'].strip():
        problems.append(f'{where}: title is required')
    for key, suffixes in (('module', ('.js', '.mjs')), ('style', ('.css',))):
        if key in manifest:
            _media(story_id, manifest[key], suffixes, f'{where} {key}', problems)

    scenes = manifest.get('scenes', {})
    if not isinstance(scenes, dict):
        problems.append(f'{where}: scenes must be an object')
        scenes = {}
    for scene_id, scene in scenes.items():
        sw = f'{where} scene {scene_id}'
        if not isinstance(scene, dict) or not isinstance(scene.get('shots'), list) or not scene['shots']:
            problems.append(f'{sw}: needs a non-empty shots list')
            continue
        if 'music' in scene:
            _media(story_id, scene['music'], AUDIO, f'{sw} music', problems)
        for n, shot in enumerate(scene['shots']):
            shw = f'{sw} shot {n + 1}'
            if not isinstance(shot, dict):
                problems.append(f'{shw}: not an object')
                continue
            extra = set(shot) - SHOT_KEYS
            if extra:
                problems.append(f'{shw}: unknown keys {sorted(extra)}')
            if not any(shot.get(k) for k in ('image', 'video', 'title', 'text')):
                problems.append(f'{shw}: needs an image, a video, a title or text')
            if shot.get('image'):
                _media(story_id, shot['image'], IMAGE, f'{shw} image', problems)
            if shot.get('poster'):
                _media(story_id, shot['poster'], IMAGE, f'{shw} poster', problems)
            if shot.get('video'):
                _media(story_id, shot['video'], VIDEO, f'{shw} video', problems)
            if shot.get('audio'):
                _media(story_id, shot['audio'], AUDIO, f'{shw} audio', problems)
                if not shot.get('text'):
                    problems.append(f'{shw}: narrated shots carry their text (scenes must work with sound off)')
            if 'motion' in shot and shot['motion'] not in MOTIONS:
                problems.append(f'{shw}: motion must be one of {sorted(MOTIONS)}')
            if 'duration' in shot and not (isinstance(shot['duration'], (int, float)) and 0 < shot['duration'] <= 60):
                problems.append(f'{shw}: duration is seconds, 0 to 60')

    for key in ('prologue', 'epilogue'):
        if key in manifest and manifest[key] not in scenes:
            problems.append(f'{where}: {key} names an unknown scene')

    the_map = manifest.get('map')
    if not isinstance(the_map, dict):
        problems.append(f'{where}: map is required')
    else:
        _media(story_id, the_map.get('image'), IMAGE, f'{where} map image', problems)
        for key in ('width', 'height'):
            if not (isinstance(the_map.get(key), int) and the_map[key] > 0):
                problems.append(f'{where}: map {key} must be a positive integer (pixels of the image)')
        route = the_map.get('route')
        if route is not None and not (isinstance(route, list) and all(_point(p) for p in route)):
            problems.append(f'{where}: map route must be a list of [x, y] fractions')

    chapters = manifest.get('chapters')
    if not isinstance(chapters, list) or len(chapters) != CHAPTERS:
        problems.append(f'{where}: exactly {CHAPTERS} chapters are required')
        chapters = chapters if isinstance(chapters, list) else []
    if levels is None:
        from game import catalogue
        levels = catalogue.load(include_private=False)
    seen = set()
    for n, chapter in enumerate(chapters):
        cw = f'{where} chapter {n + 1}'
        if not isinstance(chapter, dict):
            problems.append(f'{cw}: not an object')
            continue
        if not isinstance(chapter.get('title'), str) or not chapter['title'].strip():
            problems.append(f'{cw}: title is required')
        cid = chapter.get('id')
        if not isinstance(cid, str) or cid in seen:
            problems.append(f'{cw}: needs a unique id')
        seen.add(cid)
        level = levels.get((chapter.get('encounter'), chapter.get('preset')))
        if level is None:
            problems.append(f'{cw}: {chapter.get("encounter")}/{chapter.get("preset")} is not a public catalogue level')
        elif level.preset.get('story') not in (None, story_id):
            problems.append(f'{cw}: {chapter.get("encounter")}/{chapter.get("preset")} belongs to story {level.preset["story"]!r}')
        if 'hero_level' in chapter and chapter['hero_level'] not in (1, 2, 3):
            problems.append(f'{cw}: hero_level must be 1, 2 or 3')
        if 'seed' in chapter and not (type(chapter['seed']) is int and 0 <= chapter['seed'] <= 2**31 - 1):
            problems.append(f'{cw}: seed must be an integer from 0 to 2147483647')
        if not _point(chapter.get('node')):
            problems.append(f'{cw}: node must be [x, y] fractions of the map image')
        for key in ('before', 'after'):
            if key in chapter and chapter[key] not in scenes:
                problems.append(f'{cw}: {key} names an unknown scene')

    total = 0
    for name in story_files():
        if not name.startswith(f'story/{story_id}/'):
            continue
        size = (STORY_ROOT / name.split('/', 1)[1]).stat().st_size
        total += size
        if size > MAX_FILE_BYTES:
            problems.append(f'{name}: {size} bytes; keep each file under {MAX_FILE_BYTES // 2**20} MiB')
    if total > MAX_STORY_BYTES:
        problems.append(f'story/{story_id}: {total} bytes of public files; keep a story under {MAX_STORY_BYTES // 2**20} MiB')
    return problems


def _point(p):
    return (isinstance(p, list) and len(p) == 2
            and all(isinstance(v, (int, float)) and not isinstance(v, bool) and 0 <= v <= 1 for v in p))


def check_all():
    problems = []
    for story_id in story_ids():
        problems += check(story_id)
    return problems


if __name__ == '__main__':
    if sys.argv[1:] != ['--check']:
        raise SystemExit(__doc__)
    found = check_all()
    print('\n'.join(found) if found else f'story manifests pass ({", ".join(story_ids()) or "none yet"})')
    raise SystemExit(1 if found else 0)
