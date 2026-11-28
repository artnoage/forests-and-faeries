# Story mode

The start screen offers three modes:

- **Practice**: the graded fights one at a time, exactly as before (difficulty, then level);
- **Story — Claude** and **Story — Gemini**: two stories, each with eight chapters on a world map and scenes between the fights;
- **Faery tale — Claude** (eight chapters) and **Giant tale — Claude** (The Tall Country, five chapters with the 2×2 Ogre and Owlbear and parties of four or five), built the same way.

Each chapter of a story is an ordinary catalogue level, started through the normal server path (`/api/new`, the suggested layout, monsters played by the engine). Nothing carries over between fights: no hit points, loot or level-ups. A story raises its heroes' level by choosing levels whose parties are higher-level.

A chapter can also play a story's own variant of a level: a preset in `game/encounters/<encounter>.json` with `"story": "<story id>"` (and `variant_of` naming the level it changes) is loaded and playable like any other, but `/api/encounters` lists it under `story_presets`, so the Practice lists never show it, and `python -m game.stories --check` refuses it in another story. Its grading rows live in a pool of their own (`game/encounters/story-off-the-map/`, exported to `catalogs/game-levels-story-off-the-map.jsonl`) with the measured win rates in `balance`, which the catalog row records. Off the Map uses three: chapters 4 and 6 without the Practice level's added monster, and chapter 7 with Elion in Chruna's place.

This note is the contract between the shared shell and the stories.

## Files

| Path | Owner | What it is |
|---|---|---|
| `game/static/story.js` | shared | The shell: mode cards, the story layer, the default map and scene player, the module bridge, progress |
| `game/static/index.html`, `app.js`, `style.css` | shared | The mode step, the story layer element, the story buttons on the result overlay, the `window.FFGame` hooks |
| `game/assets.py` (`story_path`, `story_files`) | shared | The one serving rule for every story directory |
| `game/stories.py` | shared | Manifest checks: `python -m game.stories --check` |
| `game/story/<id>/` | the story's author | Everything else: `manifest.json`, media, an optional module and stylesheet, `PROVENANCE.md` |

A story never edits a shared file, and never another story's directory. The stories are `claude` and `gemini` (the `STORIES` list at the top of `story.js`). A story with no `manifest.json` (or one that fails to load) shows a "Coming soon" card.

## Serving: one rule per story directory

Every file under `game/story/<id>/` is public at `story/<id>/<path>` when:

- every part of its path is a plain name: letters, digits, `.`, `_`, `-`; no leading dot, no `..`;
- its suffix (lower case) is one of `.json .js .mjs .css .webp .avif .opus .ogg .m4a .mp3 .mp4 .webm .vtt`;
- it is a regular file inside the story directory (symbolic links that leave it are refused).

Anything else (`PROVENANCE.md`, sources, notes) stays in the repository and is never served. The Flask server serves these files with their MIME types and supports `Range` requests (audio and video seeking). The release builder (`game/release/make_ff_release.py`) copies them to `story/<id>/...` and runs the same text checks on `.json`, `.js`, `.mjs`, `.css` and `.vtt` as on the page (no non-SRD names, no private words, no `style` attributes built in script). The pre-push hygiene check skips binary media (`.avif .opus .ogg .m4a .mp3 .mp4 .webm`, like `.webp`); strip metadata from media before committing.

**Limits** (checked by `python -m game.stories --check` and the tests): at most 40 MiB of public files per story, 12 MiB per file.

### The page's Content Security Policy

`media-src 'self' blob:` is added so that `<audio>` and `<video>` can play (`default-src 'none'` blocked them). Everything else is unchanged: scripts, styles, images and fetches come from the page's own origin, and no inline style or script is allowed. A story's module may set single CSSOM properties (`el.style.setProperty('--x', ...)`, `el.style.left = ...`), never `style="..."` text.

### What a live deploy must add

The public site serves static files from an immutable release through nginx locations generated per file. Story mode needs, in the deploy (not in this repository):

1. one location for the new page script `/forests-and-faeries/story.js` (like `app.js`);
2. **one prefix location for all stories**, before the final catch-all 404:
   `location ^~ /forests-and-faeries/story/ { limit_except GET { deny all; } alias <release>/story/; }`, with the static security headers and a `types` map for the suffixes above (`application/json`, `text/javascript`, `text/css`, `image/webp`, `image/avif`, `audio/ogg`, `audio/mp4`, `audio/mpeg`, `video/mp4`, `video/webm`, `text/vtt`);
3. `media-src 'self' blob:` in the CSP of both nginx security includes (the page and the static files), matching `game/server.py`.

Only files in the release can be served, and the release contains only the files that pass the rule above.

## The manifest: `game/story/<id>/manifest.json`

```json
{
  "version": 1,
  "id": "demo",
  "title": "A Demo Story",
  "subtitle": "One line under the title on the map screen.",
  "tagline": "One line on the start screen's card.",
  "style": "story.css",
  "map": {"image": "media/map.webp", "width": 1600, "height": 1000, "alt": "A river valley",
          "route": [[0.1, 0.5], [0.2, 0.45], [0.8, 0.5]]},
  "prologue": "intro",
  "epilogue": "ending",
  "chapters": [
    {"id": "c1", "title": "The Long Haul", "place": "The mine road",
     "encounter": "lantern_mine", "preset": "l2_the_long_haul_v3",
     "blurb": "Shown on the map before the chapter is played.",
     "node": [0.1, 0.5], "before": "c1-before", "after": "c1-after"}
  ],
  "scenes": {
    "intro": {"music": "media/bed.m4a", "music_volume": 0.25, "shots": [
      {"image": "media/one.webp", "motion": "pan-left", "text": "It began with rain.", "audio": "media/one.m4a"},
      {"title": "Chapter One"},
      {"video": "media/clip.mp4", "poster": "media/one.webp", "text": "And then it stopped."}
    ]}
  }
}
```

- `chapters`: **three to twelve**, in order (the first three stories have eight, The Tall Country five). `encounter` and `preset` name a public catalogue level (`game/encounters/<encounter>.json`). Optional: `hero_level` (1–3, overrides the preset's party level), `seed` (a fixed fight), `place`, `blurb`, `before` and `after` (scene ids).
- `node`: the chapter's point on the map, as `[x, y]` fractions of the map image (0 = left/top, 1 = right/bottom). `map.route` optionally draws the path through extra points; without it the path joins the nodes.
- `scenes`: by id. A shot has an `image` (WebP or AVIF) or a `video` (MP4 or WebM, with an optional `poster`), and may carry a `title` (a title card), `speaker`, `text`, narration `audio`, a `duration` in seconds (otherwise the narration's length, or a reading time from the text) and a `motion` for stills (`zoom-in`, the default, `zoom-out`, `pan-left`, `pan-right`, `pan-up`, `pan-down`, `none`). A narrated shot must carry its `text`: every scene has to work with sound off. A video shot may carry narration too; the shot moves on when both have ended. For audio, MP3 plays in every current browser, including open-source Chromium builds without AAC; for video, H.264 MP4 is the widest choice, and a browser that cannot play it shows the `poster` with the caption and narration.
- `prologue` plays the first time a player opens the story; `epilogue` after the last chapter's `after` scene. Both can be replayed from the map.
- `style` (a `.css` file) is loaded when the story opens. The story layer carries `data-story="<id>"`, so a stylesheet scoped to `.story-layer[data-story="<id>"]` restyles the map and the scenes without touching anybody else's.
- `module` (a `.js` or `.mjs` ES module): see below.

All paths are relative to the story directory.

## What the shell does

1. **Start screen.** The mode cards show each story's title and the player's progress, or "Coming soon".
2. **Opening a story.** The story layer covers the page. Without a module the shell plays the prologue once, then shows the map: the route, a node per chapter (won, open or locked), the party marker at the first chapter not yet won, and a panel for the selected chapter (party, blurb, Begin, the opening and closing scenes, Reset progress).
3. **A chapter.** Begin plays the `before` scene, then starts the level with the suggested layout and the monsters played by the engine. The HUD's Levels button becomes **Story map** (the fight waits; Back to the battle returns to it).
4. **The end of a fight.** On a hero win the chapter is recorded at once, and the result overlay offers **Continue the story**: the `after` scene plays, the marker walks to the next node, which is now open. On a loss or a draw it offers **Retry the battle** and **Story map**.
5. **Scenes** can always be skipped (Skip, or Escape) and advanced (Next, a click, Space, Enter, →). Captions show every line, so sound is optional. Sound starts only inside a story the player opened with a click, and a sound toggle is always on screen (remembered in `localStorage` as `ff-story-sound`). Stills pan or zoom slowly unless the player prefers reduced motion. A music bed (`music`) loops quietly under a scene and fades out at its end.
6. **Progress** lives in this browser only, in `localStorage` under `ff-story-<id>`: `{"v": 1, "completed": [0, 1, ...], "data": {...}}`. Storage errors (private windows) are caught: the story still plays, it is just not remembered. Every won chapter stays replayable; Reset progress forgets the story.

If a game expires (an hour idle, or a server restart), the player is returned to the story map.

## A story's own module (optional)

A manifest may name `"module": "story.mjs"`. The shell imports it and calls:

- `mount(container, bridge)`: required. `container` is a full-viewport element inside the story layer; the module draws its own map and scenes there. The shell's map and scene player are then not used (the module may still call `bridge.playScene`).
- `unmount()`: required if the module plays audio or video. Called before every fight, on Back to the battle, and on leaving the story; stop all media there. It may return a promise.
- `onBattleEnd(result)`: optional. Called after `mount` when the player comes back from a fight through Continue the story or Story map, with `{outcome: 'win' | 'loss' | 'draw', chapter, encounter, preset}`. A won chapter is already recorded when this is called.

The `bridge`:

| Member | What it does |
|---|---|
| `id`, `manifest` | The story id and its parsed manifest |
| `url(rel)` | The public URL of a file in the story directory |
| `startLevel({encounter, preset, chapter?, hero_level?, seed?, title?})` | Unmounts the module and starts the fight; `chapter` (0–7) is what a win records; `title` replaces the encounter name in the battle header. Resolves to `true` once the fight is on screen |
| `battle()` | The story fight in progress (`{story, chapter, encounter, preset, phase, outcome}`) or `null` |
| `returnToBattle()` | Unmounts the module and shows the fight again |
| `exitStory()` | Unmounts the module and returns to the start screen's mode step |
| `progress` | `completed()`, `isComplete(i)`, `isUnlocked(i)`, `current()`, `complete(i)`, `getData(key)`, `setData(key, value)` (small JSON values for the story's own use), `reset()` |
| `sound` | `enabled()`, `set(on)`; the `ff:story-sound` document event announces changes |
| `playScene(sceneOrId, {label})` | The shell's scene player over the container; resolves to `'done'`, `'skip'` or `'exit'` |
| `level(encounter, preset)` | The catalogue's view of a level (name, party with names and levels, roster) |

The module must not autoplay sound before the player's click into the story (the click on the mode card counts) and must leave a way back (`exitStory`).

## The page hooks (for the shell and tests)

`app.js` exposes `window.FFGame` (`ready`, `level`, `launchStory`, `retryStory`, `storyRun`, `battle`, `isBusy`, `openStartScreen`, `closeStartScreen`), dispatches `ff:finished` on the document once per finished fight (`{outcome, encounter, preset, story}`), and asks `window.FFStory` (`story.js`) for the map when the Story map button is pressed. `window.FFStory.state()` reports the open story for tests.

## Checking a story

```bash
python -m game.stories --check                 # every manifest
PYTHONPATH=. pytest -q game/tests/test_story_mode.py
python game/release/make_ff_release.py --check
```
