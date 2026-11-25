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


def test_off_the_map_levels_are_its_own_and_out_of_practice(monkeypatch):
    """Off the Map's chapters 4, 6 and 7 play their own measured variants of three Practice
    levels; Practice keeps its levels, and the catalog rows carry the measured win rates."""
    root = Path(__file__).resolve().parents[2]
    monkeypatch.chdir(root)
    rows = game_levels(Path('game/encounters') / 'story-off-the-map')
    assert [json.loads(line) for line in (Path('catalogs') / 'game-levels-story-off-the-map.jsonl').read_text().splitlines()] == rows
    v3 = {row['id']: row for row in game_levels(Path('game/encounters') / 'candidates-v3')}
    from game import catalogue
    levels = catalogue.load()
    practice = {(g['id'], p['id']) for g in catalogue.catalogue_view() for p in g['presets']}
    manifest = json.loads((root / 'game/story/claude/manifest.json').read_text())
    chapters = {f"{c['encounter']}/{c['preset']}" for c in manifest['chapters']}
    for row in rows:
        enc, pid = row['id'].split('/')
        assert row['grading_status'] == 'story' and row['story'] == 'claude' and row['id'] in chapters
        assert (enc, pid) in levels and (enc, pid) not in practice
        assert levels[(enc, pid)].preset['party'] == row['party'] and levels[(enc, pid)].preset['roster'] == row['roster']
        parent = v3[row['variant_of']]
        assert parent['id'].split('/')[1] in {p['id'] for g in catalogue.catalogue_view() if g['id'] == enc for p in g['presets']}
        for field in ('map', 'hero_level', 'max_rounds'):
            assert row[field] == parent[field]
        for side in ('native', 'best_ai'):
            assert 0 <= row['recorded'][side]['hero_win_rate'] <= 1 and row['recorded']['games'] == 200
    by_id = {row['id']: row for row in rows}
    # Chapter 4 and 6: the '+1 monster' left out; chapter 7: Elion at Chruna's square.
    for lid in ('lantern_mine/l2_the_last_wick', 'lantern_mine/l3_under_the_loadstone'):
        row, parent = by_id[f'{lid}_story'], v3[f'{lid}_v3']
        assert row['roster'] == parent['roster'][:-1] and row['party'] == parent['party']
        assert row['layout']['placements'] == parent['layout']['placements'][:-1]
    toll, parent = by_id['reed_lock/l3_the_sunken_toll_story'], v3['reed_lock/l3_the_sunken_toll_v3']
    assert toll['party'] == ['curogana', 'mara_l3', 'elion'] and toll['roster'] == parent['roster']
    assert [dict(p, id='elion' if p['id'] == 'chruna' else p['id']) for p in parent['layout']['placements']] == toll['layout']['placements']
    # Every chapter level has its measured numbers.
    recorded = {**{k: r['recorded'] for k, r in v3.items()}, **{k: r['recorded'] for k, r in by_id.items()}}
    assert len(chapters) == 8 and all(recorded.get(c) for c in chapters)
