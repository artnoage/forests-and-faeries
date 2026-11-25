"""Verify `'T'` (Large+ tree) support in game/catalogue.py and the 3 forest maps."""
import pytest

from game import catalogue


def test_validate_rows_accepts_trees_and_checks_connectivity():
    rows = [
        'HHHHHHH',
        'H..T..H',
        'H.d.D.H',
        'H..T..H',
        'HHHHHHH',
    ]
    catalogue.validate_rows(rows, 'grove')

    disconnected = [
        'HHHHHHH',
        'H..T..H',
        'H..T..H',
        'H..T..H',
        'HHHHHHH',
    ]
    with pytest.raises(catalogue.CatalogueError, match='connected'):
        catalogue.validate_rows(disconnected, 'split_grove')


def test_tree_cell_blocks_placements_and_allows_props():
    rows = [
        'HHHHHHH',
        'H..T..H',
        'H.....H',
        'HHHHHHH',
    ]
    catalogue._check_scene({'props': [{'kind': 'pillar', 'x': 3, 'y': 1}]}, rows, 'grove')
    encounter = {'id': 'test', 'name': 'Test', 'map': 'test', 'theme': 'caverns', 'blurb': 'x', 'presets': []}
    preset = {
        'id': 'p1', 'name': 'P1', 'difficulty': 'Easy', 'blurb': 'x',
        'party': ['guy_l1'], 'roster': ['dryad'],
        'placements': {'guy_l1': [3, 1], 'dryad-1': [1, 2]},
    }
    level = catalogue.Level(encounter, preset, rows, {'props': []}, 'Grove')
    with pytest.raises(catalogue.CatalogueError, match='not on floor'):
        level.check()


@pytest.mark.parametrize('map_id', ['whispering_glade', 'bramble_hollow', 'mire_crossing'])
def test_forest_maps_load_cleanly(map_id):
    rows, scene, name = catalogue._load_map(map_id, private=False)
    assert any('T' in r for r in rows), f'{map_id} expected at least one tree square'
    assert name and isinstance(scene, dict)
