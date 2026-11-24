# Game sound

Battles in Practice and Story mode have sound: effects, two pieces of music, two stings, and short lines that the heroes sometimes say. All of it was made for this game. The music and effects are computed by a synthesizer in this repository. The hero lines are text-to-speech made with Google's Gemini TTS. No recordings, sample packs or stock music are used.

## Where things are

| Path | What it holds |
| --- | --- |
| `game/static/sound.js` | `window.FFSound`: the audio engine, the music sequencer, hero lines, captions and the HUD control |
| `game/static/audio/sound.json` | the manifest: music sections with lengths and transition weights, stings, effects, and hero lines with their text |
| `game/static/audio/{music,sfx,voices/<hero>}/*.mp3` | the audio files |
| `game/tools/music/scores.py` | the scores: chords per bar, melodies, and the accompaniment plan for each section |
| `game/tools/music/synth.py`, `render.py`, `sfx.py` | the synthesizer (additive and FM instruments, drums, convolution reverb), the arranger, and the effects |

To render the music and effects again, run `python -m game.tools.music.render OUT`. It needs numpy and takes about a minute on eight cores. It writes WAV files and `music.json` to `OUT`. Then encode them to MP3 and merge the voice lines into `sound.json`. The project's private generation folder holds that step, the line texts, and the provenance of each line (service, model, voice, style, date).

## How it plays

- **First gesture.** Nothing loads or plays before the player's first click, tap or key press. The `AudioContext` is created on that gesture.
- **Music.** The music is written in sections of 2 to 8 bars. Each section's file is its bars plus a 4-second tail, in which notes and the hall ring on. The browser starts the next section exactly on the previous section's last bar line, so the tail overlaps it as a played repeat would. The next section is picked at random by weight from the table in `sound.json`, so the order changes every time.
  - The calm piece plays on the start screen and while figures are placed.
  - The battle piece plays during a fight.
  - A victory or defeat sting plays when the fight ends, then the calm piece returns.
  - Game music and hero lines are silent while a story scene or story map is open, because the story plays its own sound.
- **Effects.** Effects follow the replay of each action in `app.js`:
  - dice when a d20 is rolled;
  - a cast sound for spells and heals;
  - hit, miss, critical or heal at impact;
  - a fall when a creature drops to 0 HP (read from the before and after snapshots);
  - a chime when a hero's turn begins.
- **Hero lines.** At a hero's turn start there is a 40% chance of a line, but never on two hero turns in a row and never within 16 seconds of the last line. Critical hits, kills and dropping below 30% HP have their own lines, with a 9-second gap. Each line is also shown as a caption, so it can be read with sound off.
- **Settings.** The HUD button (🔊) opens the settings: sound on or off, plus volumes for music, effects and voices. They are kept in `localStorage` under `ff-sound`. The start screen covers the HUD, so it has its own Sound on/off button for the same switch.
  - The story's own sound button and the HUD switch are one switch. `bridge.sound.enabled()` reports it, and `ff:story-sound` fires when it changes.
  - `ff:sound` fires on the document when the HUD switch changes.

## What a live deploy must add

The public site serves an immutable release through nginx locations generated per file. The release builder already copies `sound.js` and every file under `audio/`. The deploy must also add:

1. One location for the new page script `/forests-and-faeries/sound.js`, like `app.js`.
2. One prefix location for the audio, before the final catch-all 404, with the static security headers:
   `location ^~ /forests-and-faeries/audio/ { limit_except GET { deny all; } alias <release>/audio/; types { audio/mpeg mp3; application/json json; } }`
3. Nothing new in the CSP: `media-src 'self' blob:` (added for story mode) and `connect-src 'self'` already cover `fetch()` of the audio and its decoding.
