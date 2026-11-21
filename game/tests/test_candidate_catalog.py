"""The grading catalog and the game must describe the same fixed encounters."""
import json
from pathlib import Path

import pytest

from scripts.build_level_catalog import game_levels


@pytest.mark.parametrize('pool', ['candidates-v2', 'candidates-v2-round2'])
def test_candidate_pool_matches_presets_and_stays_test_only(monkeypatch, pool):
    root = Path(__file__).resolve().parents[2]
    monkeypatch.chdir(root)
    candidates = game_levels(Path('game/encounters') / pool)
    catalog = Path('catalogs') / f'game-levels-{pool}.jsonl'
    assert [json.loads(line) for line in catalog.read_text().splitlines()] == candidates
    ids = {row['id'] for row in candidates}
    assert candidates and len(ids) == len(candidates)
    assert all(row['split'] == 'test' and row['grading_status'] == 'candidate' for row in candidates)
    for row in candidates:
        layout = row['layout']
        assert layout['rule'] == 'fixed'
        cells = {(p['x'], p['y']) for p in layout['placements']}
        assert len(cells) == len(row['party']) + len(row['roster'])


def test_each_round_two_variant_changes_one_figure(monkeypatch):
    monkeypatch.chdir(Path(__file__).resolve().parents[2])
    encounters = Path('game/encounters')
    parents = {r['id']: r for r in game_levels(encounters / 'candidates-v2')}
    variants = game_levels(encounters / 'candidates-v2-round2')
    seen = set()

    def figures(row):
        # Removing one monster can renumber others of the same kind.
        return frozenset((p['id'].rsplit('-', 1)[0], (p['x'], p['y'])) for p in row['layout']['placements'])

    for variant in variants:
        parent = parents[variant['variant_of']]
        assert variant['id'] not in parents
        assert variant['difficulty'] == 'Hard'
        for field in ('party', 'hero_level', 'map', 'max_rounds'):
            assert variant[field] == parent[field], (variant['id'], field)
        before, after = figures(parent), figures(variant)
        key = (parent['id'], after)
        assert key not in seen
        seen.add(key)
        removed, added = before - after, after - before
        assert (len(removed), len(added)) in {(0, 1), (1, 0), (1, 1)}, variant['id']
        if removed and added:
            old_kind, old_cell = next(iter(removed))
            new_kind, new_cell = next(iter(added))
            assert old_kind == new_kind or old_cell == new_cell, variant['id']
