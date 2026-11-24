"""Forests and Faeries public static release checks (game/release/make_ff_release.py)."""
import json
import shutil
import struct

import pytest

from game.assets import PUBLIC_FILES, story_files
from game.release import make_ff_release as release
from game.tools import asset_versions


def test_the_committed_page_passes_the_release_checks():
    assert release.check() == []


def test_the_build_is_exactly_the_allowlist(tmp_path):
    dest = release.build(tmp_path / 'release')
    files = sorted(str(p.relative_to(dest)) for p in dest.rglob('*') if p.is_file())
    expected = sorted({'index.html', 'RELEASE.json', *(n for n in PUBLIC_FILES if (release.STATIC / n).is_file()), *story_files()})
    assert files == expected
    licenses = (dest / 'licenses.html').read_text(encoding='utf-8')
    pack_word = 'quater' + 'nius'
    assert pack_word not in licenses.lower() and 'placeholder' not in licenses.lower()
    assert 'System Reference Document 5.2.1' in licenses and 'not affiliated' in licenses.lower()
    page = (dest / 'index.html').read_text(encoding='utf-8')
    for asset in ('style.css', 'scene3d.js', 'app.js', 'story.js'):
        digest = release.sha256(dest / asset)[:12]
        assert f'./{asset}?v={digest}' in page, asset
    assert '?v=ff1' not in page and f'./style.css?v={release.sha256(dest / "style.css")[:12]}' in licenses
    manifest = json.loads((dest / 'RELEASE.json').read_text())
    assert set(manifest['files']) == set(expected) - {'RELEASE.json'}
    with pytest.raises(SystemExit):
        release.build(dest)


@pytest.fixture
def static_copy(tmp_path):
    copy = tmp_path / 'static'
    shutil.copytree(release.STATIC, copy)
    return copy


def glb_with(document):
    text = json.dumps(document).encode()
    text += b' ' * (-len(text) % 4)
    body = struct.pack('<II', len(text), 0x4E4F534A) + text
    return struct.pack('<III', 0x46546C67, 2, 12 + len(body)) + body


def test_placeholder_figures_and_stale_asset_versions_are_refused(static_copy, monkeypatch):
    mat_name = 'Rogue_' + 'Texture'
    (static_copy / 'models' / 'goblin.glb').write_bytes(glb_with(
        {'asset': {'version': '2.0'}, 'materials': [{'name': mat_name}]}))
    monkeypatch.setattr(release, 'PLACEHOLDER_HASHES',
                        release.PLACEHOLDER_HASHES | {release.sha256(static_copy / 'models' / 'mara.glb')})
    problems = ' | '.join(release.check(static_copy))
    assert 'models/goblin.glb names a third-party pack material' in problems
    assert 'models/mara.glb is a placeholder figure' in problems
    assert 'asset-versions.js is stale' in problems and 'lacks the asset versions' in problems


def test_asset_versions_are_the_content_hashes_and_in_the_bundle():
    table = asset_versions.versions()
    assert set(table) == {n for n in PUBLIC_FILES if n.endswith(('.glb', '.webp')) and (release.STATIC / n).is_file()}
    for name, version in table.items():
        assert version == release.sha256(release.STATIC / name)[:12]
    assert not asset_versions.stale()
    bundle = (release.STATIC / 'scene3d.js').read_text(encoding='utf-8')
    assert all(v in bundle for v in table.values())


def test_private_names_inline_styles_and_extra_models_are_refused(static_copy):
    page = static_copy / 'index.html'
    page.write_text(page.read_text().replace('</body>', '<p style="color:red">mausoleum-hall</p></body>'))
    (static_copy / 'models' / 'extra.glb').write_bytes((static_copy / 'models' / 'guy.glb').read_bytes())
    problems = ' | '.join(release.check(static_copy))
    assert 'private material' in problems and 'inline style' in problems and 'models/ may only hold' in problems


def test_hashed_private_terms_and_service_lockfile(static_copy, monkeypatch):
    import hashlib
    synthetic = 'syntheticcampaignprobe'
    digest = hashlib.sha256(synthetic.encode('utf-8')).hexdigest()
    monkeypatch.setattr(release, 'PRIVATE_TERM_HASHES', release.PRIVATE_TERM_HASHES | {digest})
    page = static_copy / 'index.html'
    page.write_text(page.read_text().replace('</body>', f'<p>{synthetic}</p></body>'))
    problems = ' | '.join(release.check(static_copy))
    assert f'private material {[digest[:12]]}' in problems

    lock_path = release.ROOT / 'requirements.lock'
    assert lock_path.is_file()
    lines = {
        ln.strip()
        for ln in lock_path.read_text(encoding='utf-8').splitlines()
        if ln.strip() and not ln.strip().startswith('#')
    }
    assert {'flask==3.1.3', 'gunicorn==23.0.0', 'werkzeug==3.1.9', 'numpy==2.4.6'} <= lines
