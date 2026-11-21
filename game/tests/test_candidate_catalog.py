"""The grading catalog and the game must describe the same fixed encounters."""
import json
from pathlib import Path

from scripts.build_level_catalog import game_levels


def test_candidate_pool_matches_presets_and_stays_test_only(monkeypatch):
    root = Path(__file__).resolve().parents[2]
    monkeypatch.chdir(root)
    candidates = game_levels(Path('game/encounters/candidates-v2'))
    catalog = Path('catalogs/game-levels-candidates-v2.jsonl')
    assert [json.loads(line) for line in catalog.read_text().splitlines()] == candidates
    ids = {row['id'] for row in candidates}
    assert candidates and len(ids) == len(candidates)
    assert all(row['split'] == 'test' and row['grading_status'] == 'candidate' for row in candidates)
    for row in candidates:
        layout = row['layout']
        assert layout['rule'] == 'fixed'
        cells = {(p['x'], p['y']) for p in layout['placements']}
        assert len(cells) == len(row['party']) + len(row['roster'])
