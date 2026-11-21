"""Lighting declarations used by the installed levels and the four grading maps."""
import json
from pathlib import Path

GAME = Path(__file__).resolve().parents[1]


def test_grading_floors_are_bright_and_no_installed_level_declares_sunlight():
    grading_maps = {"bell_court", "lantern_mine", "reed_lock", "split_kiln"}
    seen = set()
    for path in (GAME / "maps").rglob("*.json"):
        data = json.loads(path.read_text())
        board = data.get("map", {})
        assert not (board.get("sunlight") or data.get("sunlight")), path
        if path.stem in grading_maps:
            seen.add(path.stem)
            assert set("".join(board["rows"])) == {"H", "."}, path
    assert seen == grading_maps
    for path in (GAME / "encounters").rglob("*.json"):
        encounter = json.loads(path.read_text())
        assert not encounter.get("sunlight"), path
        assert all(not preset.get("sunlight") for preset in encounter.get("presets", [])), path
