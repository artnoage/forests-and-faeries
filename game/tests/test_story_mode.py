"""Story mode shell (docs/STORY_MODE.md): story file serving, release, manifest checks, page wiring."""
import json
from pathlib import Path

import pytest

from game import assets, stories
from game.release import make_ff_release as release
from game.server import CSP, create_app

STATIC = Path(assets.STATIC)
EXAMPLE_LEVEL = ('lantern_mine', 'l2_the_long_haul_v3')


def write(path, data=b'x'):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data if isinstance(data, bytes) else data.encode('utf-8'))
    return path


def example_manifest(story_id='demo'):
    """The minimal manifest of docs/STORY_MODE.md (eight chapters on one level)."""
    encounter, preset = EXAMPLE_LEVEL
    return {
        'version': 1, 'id': story_id, 'title': 'A Demo Story',
        'map': {'image': 'media/map.webp', 'width': 1600, 'height': 1000},
        'prologue': 'intro',
        'chapters': [{'id': f'c{i + 1}', 'title': f'Chapter {i + 1}', 'encounter': encounter, 'preset': preset,
                      'node': [0.1 + i * 0.1, 0.5], 'before': 'intro', 'after': 'outro'} for i in range(8)],
        'scenes': {
            'intro': {'music': 'media/bed.m4a', 'shots': [
                {'image': 'media/one.webp', 'text': 'It began with rain.', 'audio': 'media/one.m4a', 'motion': 'pan-left'},
                {'title': 'Chapter One'}]},
            'outro': {'shots': [{'video': 'media/clip.mp4', 'poster': 'media/one.webp', 'text': 'And then it stopped.'}]},
        },
    }


@pytest.fixture
def story_root(tmp_path, monkeypatch):
    root = tmp_path / 'story'
    for module in (assets, stories, release):
        monkeypatch.setattr(module, 'STORY_ROOT', root)
    demo = root / 'demo'
    for name in ('media/map.webp', 'media/one.webp', 'media/bed.m4a', 'media/one.m4a', 'PROVENANCE.md', '.hidden.json'):
        write(demo / name)
    write(demo / 'media/clip.mp4', bytes(range(256)) * 8)
    write(demo / 'manifest.json', json.dumps(example_manifest()))
    return root


@pytest.fixture
def ff_app(monkeypatch):
    monkeypatch.setenv('EMBER_UI', 'ff')
    monkeypatch.delenv('FF_PRIVATE_ENCOUNTERS', raising=False)
    return create_app()


def test_story_paths_are_safe(story_root):
    assert assets.story_path('demo/manifest.json') == (story_root / 'demo/manifest.json').resolve()
    assert assets.story_path('demo/media/clip.mp4') is not None
    for bad in ('demo/PROVENANCE.md', 'demo/.hidden.json', 'demo/../demo/manifest.json', '../story/demo/manifest.json',
                'demo//manifest.json', 'Demo/manifest.json', 'demo/media/MAP.WEBP', 'demo/missing.json', 'demo',
                'demo/media/../manifest.json', 'demo/manifest.json/', '/etc/passwd.json'):
        assert assets.story_path(bad) is None, bad
    outside = write(story_root.parent / 'secret.json', '{}')
    (story_root / 'demo' / 'link.json').symlink_to(outside)
    assert assets.story_path('demo/link.json') is None
    files = assets.story_files()
    assert 'story/demo/manifest.json' in files and 'story/demo/media/clip.mp4' in files
    assert not any(n.endswith(('.md', '.hidden.json', 'link.json')) for n in files)


def test_story_files_are_served_with_types_ranges_and_media_csp(story_root, ff_app):
    client = ff_app.test_client()
    response = client.get('/story/demo/manifest.json')
    assert response.status_code == 200 and response.mimetype == 'application/json'
    assert response.headers['Content-Security-Policy'] == CSP
    assert "media-src 'self' blob:" in CSP and "default-src 'none'" in CSP and 'unsafe' not in CSP
    clip = client.get('/story/demo/media/clip.mp4', headers={'Range': 'bytes=0-99'})
    assert clip.status_code == 206 and clip.mimetype == 'video/mp4' and len(clip.data) == 100
    assert clip.headers['Content-Range'].startswith('bytes 0-99/')
    assert client.get('/story/demo/media/bed.m4a').mimetype == 'audio/mp4'
    for bad in ('/story/demo/PROVENANCE.md', '/story/demo/.hidden.json', '/story/demo/../../server.py',
                '/story/demo/%2e%2e/demo/manifest.json', '/story/nope/manifest.json', '/story/demo/'):
        assert client.get(bad).status_code == 404, bad


def test_the_release_carries_every_public_story_file(story_root, tmp_path):
    dest = release.build(tmp_path / 'release')
    built = sorted(str(p.relative_to(dest)) for p in dest.rglob('*') if p.is_file() and 'story' in p.parts)
    assert built == sorted(assets.story_files())
    assert 'story/demo/PROVENANCE.md' not in built
    page = (dest / 'index.html').read_text(encoding='utf-8')
    assert f'./story.js?v={release.sha256(dest / "story.js")[:12]}' in page


def test_the_release_checks_story_text(story_root):
    write(story_root / 'demo' / 'story.js', 'el.setAttribute("style", "color:red");')
    word = 'be' + 'holder'
    write(story_root / 'demo' / 'notes.json', f'{{"x": "a {word}"}}')
    problems = ' | '.join(release.check())
    assert 'story/demo/story.js builds inline style attributes' in problems
    assert 'story/demo/notes.json mentions' in problems


def test_the_example_manifest_passes_and_mistakes_are_named(story_root):
    assert stories.check('demo') == []
    assert stories.check('nothing-here') == []
    broken = example_manifest()
    broken['chapters'] = broken['chapters'][:2]
    broken['scenes']['intro']['shots'][0]['image'] = 'media/absent.webp'
    broken['scenes']['intro']['shots'][0]['text'] = ''
    broken['scenes']['outro']['shots'][0]['motion'] = 'spin'
    broken['prologue'] = 'nope'
    broken['chapters'][0]['preset'] = 'no_such_level'
    broken['chapters'][1]['node'] = [1.5, 0]
    write(story_root / 'demo' / 'manifest.json', json.dumps(broken))
    problems = ' | '.join(stories.check('demo'))
    for needle in ('3 to 12 chapters are required', 'media/absent.webp is missing', 'carry their text', 'motion must be',
                   'prologue names an unknown scene', 'not a public catalogue level', 'node must be'):
        assert needle in problems, needle


def test_a_story_may_have_five_chapters(story_root):
    five = example_manifest()
    five['chapters'] = five['chapters'][:5]
    write(story_root / 'demo' / 'manifest.json', json.dumps(five))
    assert stories.check('demo') == []
    five['chapters'] = five['chapters'] * 3
    for n, chapter in enumerate(five['chapters']):
        chapter['id'] = f'c{n + 1}'
    write(story_root / 'demo' / 'manifest.json', json.dumps(five))
    assert any('3 to 12 chapters' in p for p in stories.check('demo'))


def test_the_tall_country_is_five_story_only_chapters():
    from game import catalogue
    manifest = stories.load('claude-tall-country')
    assert manifest is not None and manifest['title'] == 'The Tall Country' and len(manifest['chapters']) == 5
    levels = catalogue.load(include_private=False)
    for chapter in manifest['chapters']:
        level = levels[(chapter['encounter'], chapter['preset'])]
        assert level.preset['story'] == 'claude-tall-country'
        assert level.preset['balance']['story_measure']['games'] == 200
        assert level.preset['balance']['story_measure']['no_winner_at_round_cap'] == 0
    practice = {(g['id'], p['id']) for g in catalogue.catalogue_view() for p in g['presets']}
    assert not any(c['preset'] == p for c in manifest['chapters'] for _, p in practice)


def test_every_committed_story_manifest_passes():
    assert stories.check_all() == []


def test_the_page_offers_practice_and_both_stories():
    html = (STATIC / 'index.html').read_text(encoding='utf-8')
    for marker in ('id="mode-step"', 'data-mode="practice"', 'data-story="claude"', 'data-story="gemini"', 'data-story="claude-faery"',
                   'data-story="claude-tall-country"',
                   'id="story-layer"', 'id="story-result-actions"', 'id="practice-result-actions"', 'src="./story.js?v='):
        assert marker in html, marker
    assert html.index('src="./app.js') < html.index('src="./story.js')
    shell = (STATIC / 'story.js').read_text(encoding='utf-8')
    assert "{ id: 'claude', label: 'Story — Claude' }" in shell and "{ id: 'gemini', label: 'Story — Gemini' }" in shell
    assert "{ id: 'claude-faery', label: 'Faery tale — Claude' }" in shell
    assert "{ id: 'claude-tall-country', label: 'Giant tale — Claude' }" in shell
    assert 'localStorage' in shell and 'try {' in shell
    assert 'story.js' in assets.PAGE_FILES
