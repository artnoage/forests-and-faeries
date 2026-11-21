"""The grading catalog and the game must describe the same fixed encounters."""
from collections import Counter
import json
from pathlib import Path

import pytest

from scripts.build_level_catalog import game_levels


@pytest.mark.parametrize(('pool', 'catalog_name'), [
    ('candidates-v2', 'game-levels-candidates-v2.jsonl'),
    ('candidates-v2-round2', 'game-levels-candidates-v2-round2.jsonl'),
    ('candidates-v2/hard', 'game-levels-candidates-v2-hard.jsonl'),
    ('candidates-v3', 'game-levels-candidates-v3.jsonl'),
])
def test_candidate_pool_matches_presets_and_stays_test_only(monkeypatch, pool, catalog_name):
    root = Path(__file__).resolve().parents[2]
    monkeypatch.chdir(root)
    candidates = game_levels(Path('game/encounters') / pool)
    catalog = Path('catalogs') / catalog_name
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


@pytest.mark.parametrize(('pool', 'parent_pools', 'suffix'), [
    ('candidates-v2/hard', ['candidates-v2'], '_plus1'),
    ('candidates-v3', ['candidates-v2', 'candidates-v2/hard'], '_v3'),
])
def test_plus_one_preserves_the_parent_and_adds_one_monster(monkeypatch, pool, parent_pools, suffix):
    monkeypatch.chdir(Path(__file__).resolve().parents[2])
    source = Path('game/encounters')
    parents = {row['id']: row for directory in parent_pools for row in game_levels(source / directory)}
    children = game_levels(source / pool)
    if suffix == '_plus1':
        assert all(row['difficulty'] == 'Hard' for row in children)
    else:
        assert Counter((row['hero_level'], row['difficulty']) for row in children) == {
            (level, grade): 4 for level in (1, 2, 3) for grade in ('Easy', 'Medium', 'Hard')
        }
        assert sum(row['variant_of'].endswith('_plus1') for row in children) == 12
    for child in children:
        parent = parents[child['variant_of']]
        assert child['id'] == parent['id'] + suffix
        for field in ('map', 'party', 'hero_level', 'max_rounds'):
            assert child[field] == parent[field], (child['id'], field)
        assert child['roster'][:-1] == parent['roster']
        placements = child['layout']['placements']
        assert placements[:-1] == parent['layout']['placements']
        kind = child['roster'][-1]
        extra = placements[-1]
        assert extra['id'] == f'{kind}-{child["roster"].count(kind)}'
        x, y = extra['x'], extra['y']
        grid = child['map']['rows']
        assert 0 <= y < len(grid) and 0 <= x < len(grid[y]) and grid[y][x] == '.'
