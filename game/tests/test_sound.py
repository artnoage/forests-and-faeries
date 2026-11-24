"""Game sound (docs/SOUND.md): audio serving, the manifest, the HUD control and the release."""
import json
import re
from pathlib import Path

import pytest

from game import assets
from game.release import make_ff_release as release
from game.server import CSP, create_app

AUDIO = Path(assets.AUDIO_ROOT)
HEROES = ('guy', 'elion', 'curogana', 'chruna', 'mara', 'ilyra')


@pytest.fixture
def ff_app(monkeypatch):
    monkeypatch.setenv('EMBER_UI', 'ff')
    monkeypatch.delenv('FF_PRIVATE_ENCOUNTERS', raising=False)
    return create_app()


@pytest.fixture
def manifest():
    return json.loads((AUDIO / 'sound.json').read_text(encoding='utf-8'))


def referenced(m):
    files = [s['file'] for p in m['pieces'].values() for s in p['sections'].values()]
    files += [s['file'] for s in m['stings'].values()] + list(m['sfx'].values())
    files += [line['file'] for v in m['voices'].values() for lines in v['lines'].values() for line in lines]
    return files


def test_audio_paths_are_safe():
    assert assets.audio_path('sound.json') == (AUDIO / 'sound.json').resolve()
    assert assets.audio_path('sfx/hit.mp3') == (AUDIO / 'sfx/hit.mp3').resolve()
    for bad in ('', '../app.js', 'sfx/../sound.json', 'sfx/hit.wav', 'sfx/.hit.mp3', 'music/notes.json', 'SFX/hit.mp3',
                'sfx/HIT.mp3', 'a/b/c/d.mp3', '/etc/passwd', 'sfx//hit.mp3', 'sfx/missing.mp3', 'voices/guy'):
        assert assets.audio_path(bad) is None, bad


def test_the_manifest_matches_the_files(manifest):
    files = referenced(manifest)
    assert len(files) == len(set(files))
    for name in files:
        assert assets.audio_path(name) is not None, name
        assert (AUDIO / name).read_bytes()[:3] in (b'ID3', b'\xff\xfb', b'\xff\xf3', b'\xff\xf2'), name
    on_disk = {p.relative_to(AUDIO).as_posix() for p in AUDIO.rglob('*') if p.is_file()}
    assert on_disk == set(files) | {'sound.json'}
    assert set(manifest['sfx']) >= {'dice', 'hit', 'miss', 'crit', 'cast', 'heal', 'fall', 'turn'}
    assert set(manifest['stings']) == {'victory', 'defeat'}


def test_the_music_sections_link_up(manifest):
    assert set(manifest['pieces']) == {'calm', 'battle'}
    for piece in manifest['pieces'].values():
        sections = piece['sections']
        assert piece['start'] in sections and len(sections) >= 4
        reachable, todo = set(), [piece['start']]
        while todo:
            key = todo.pop()
            if key in reachable:
                continue
            reachable.add(key)
            nxt = sections[key]['next']
            assert nxt and set(nxt) <= set(sections) and all(w > 0 for w in nxt.values())
            todo.extend(nxt)
        assert reachable == set(sections)
        bar = 4 * 60 / piece['bpm']
        for s in sections.values():
            assert s['length'] > 0 and abs(s['length'] / bar - round(s['length'] / bar)) < 1e-6


def test_every_hero_has_lines(manifest):
    assert set(manifest['voices']) == set(HEROES)
    for hero in manifest['voices'].values():
        assert len(hero['lines']['turn']) >= 3
        for lines in hero['lines'].values():
            assert all(0 < len(line['text']) <= 60 for line in lines)


def test_audio_is_served_with_its_type(ff_app):
    client = ff_app.test_client()
    page = client.get('/audio/sound.json')
    assert page.status_code == 200 and page.mimetype == 'application/json'
    assert page.headers['Content-Security-Policy'] == CSP
    hit = client.get('/audio/sfx/hit.mp3')
    assert hit.status_code == 200 and hit.mimetype == 'audio/mpeg'
    part = client.get('/audio/sfx/hit.mp3', headers={'Range': 'bytes=0-9'})
    assert part.status_code == 206 and len(part.data) == 10
    for bad in ('/audio/sfx/../../app.js', '/audio/music.json', '/audio/sfx/hit.wav', '/audio/'):
        assert client.get(bad).status_code == 404, bad
    assert client.get('/sound.js').status_code == 200


def test_the_page_has_one_sound_control_and_a_caption():
    html = (assets.STATIC / 'index.html').read_text(encoding='utf-8')
    for el in ('sound-button', 'sound-pod', 'sound-on', 'sound-music', 'sound-sfx', 'sound-voice', 'voice-caption', 'start-sound-btn'):
        assert html.count(f'id="{el}"') == 1, el
    assert html.index('./sound.js?v=') < html.index('./app.js?v=') < html.index('./story.js?v=')
    assert "media-src 'self'" in CSP and "'unsafe-inline'" not in CSP


def test_sound_waits_for_a_gesture_and_remembers_the_choice():
    js = (assets.STATIC / 'sound.js').read_text(encoding='utf-8')
    # The only AudioContext is made inside unlock(), which only gesture listeners call.
    assert len(re.findall(r'new AC\(', js)) == 1
    unlock = js[js.index('function unlock()'):js.index('for (const type of')]
    assert 'new AC(' in unlock
    assert re.search(r"for \(const type of \['pointerdown', 'keydown', 'touchend'\]\)", js)
    assert "const KEY = 'ff-sound'" in js and 'localStorage.setItem(KEY' in js
    assert 'unlock()' not in js.replace('function unlock()', '').replace('window.addEventListener(type, unlock', '')


def test_the_release_ships_the_audio(tmp_path):
    names = release.release_files()
    assert 'sound.js' in names and 'audio/sound.json' in names
    assert set(assets.audio_files()) <= set(names)
    dest = release.build(tmp_path / 'release')
    assert (dest / 'audio/sound.json').is_file()
    assert re.search(r'\./sound\.js\?v=[0-9a-f]{12}', (dest / 'index.html').read_text(encoding='utf-8'))
