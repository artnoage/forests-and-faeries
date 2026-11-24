# Provenance of the game sound (game/static/audio/)

Music and effects (`music/*.mp3`, `sfx/*.mp3`): composed and synthesized by Claude (Anthropic), 2026-11-24,
with the code in this directory (`scores.py` for the scores, `synth.py`, `render.py`, `sfx.py`). No samples,
recordings or third-party sounds. Rendered with `python -m game.tools.music.render`, encoded with ffmpeg
(libmp3lame).

Hero lines (`voices/<hero>/*.mp3`): text written by Claude for this game; speech by the Google Gemini API
text-to-speech models named below, with prebuilt voices, on 2026-11-24. Trimmed and loudness-normalised
(EBU R128, -16 LUFS) with ffmpeg.

| File | Line | Service | Model | Voice | Delivery prompt | Date |
| --- | --- | --- | --- | --- | --- | --- |
| voices/guy/crit-1.mp3 | Clean hit! | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/crit-2.mp3 | That one counted. | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/hurt-1.mp3 | Just a scratch. Mostly. | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/hurt-2.mp3 | I'm still standing. | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/kill-1.mp3 | One down. | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/kill-2.mp3 | Next! | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/turn-1.mp3 | My turn. Stay behind me. | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/turn-2.mp3 | Right. Let's see who's first. | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/turn-3.mp3 | Steel's ready. | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/turn-4.mp3 | Hold the line, I'll take the front. | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/turn-5.mp3 | One step at a time. | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/guy/turn-6.mp3 | Heads down. I've got this. | Google Gemini API | gemini-3.8-flash-tts | Achird | a friendly, steady young swordsman, warm and confident, under his breath in a fight | 2026-11-24 |
| voices/elion/crit-1.mp3 | The light is generous today. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/crit-2.mp3 | Mercy can strike hard. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/hurt-1.mp3 | I can bear it. Keep going. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/hurt-2.mp3 | Still here. Still healing. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/kill-1.mp3 | Rest now. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/kill-2.mp3 | Go back to sleep. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/turn-1.mp3 | Light, be with us. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/turn-2.mp3 | Steady. Breathe. Now. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/turn-3.mp3 | No one falls while I'm here. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/turn-4.mp3 | Let me see to this. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/turn-5.mp3 | Patience, then strength. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/elion/turn-6.mp3 | Morning comes for everyone. | Google Gemini API | gemini-3.8-flash-lite-tts | Schedar | a calm middle-aged healer, gentle and grounded, quietly certain | 2026-11-24 |
| voices/curogana/crit-1.mp3 | Did you see that? | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/crit-2.mp3 | Burn bright! | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/hurt-1.mp3 | That was a mistake. | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/hurt-2.mp3 | You'll pay for that scale. | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/kill-1.mp3 | Ash. Next. | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/kill-2.mp3 | That's what fire does. | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/turn-1.mp3 | My turn. Try not to blink. | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/turn-2.mp3 | The blood runs warm today. | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/turn-3.mp3 | Stand clear of the fire. | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/turn-4.mp3 | Let me show you something bright. | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/turn-5.mp3 | Dragons don't wait. | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/curogana/turn-6.mp3 | Oh, this will be fun. | Google Gemini API | gemini-3.8-flash-lite-tts | Zephyr | a proud young sorceress, bright and a little teasing, fire in her voice | 2026-11-24 |
| voices/chruna/crit-1.mp3 | Ha! Felt that? | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/crit-2.mp3 | Again! | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/hurt-1.mp3 | Pain is good. Wakes me up. | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/hurt-2.mp3 | Not enough. Not nearly. | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/kill-1.mp3 | Down you go. | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/kill-2.mp3 | Who's next? | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/turn-1.mp3 | Chruna's turn. | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/turn-2.mp3 | Out of my way. | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/turn-3.mp3 | Good. A fight. | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/turn-4.mp3 | I go first. | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/turn-5.mp3 | Come on, then! | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/chruna/turn-6.mp3 | Talk later. Hit now. | Google Gemini API | gemini-3.8-flash-lite-tts | Kore | a fierce warrior woman of few words, blunt, low and forceful | 2026-11-24 |
| voices/mara/crit-1.mp3 | Through the gap. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/crit-2.mp3 | Textbook. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/hurt-1.mp3 | Hit. Still in it. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/hurt-2.mp3 | I'll patch it later. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/kill-1.mp3 | Target down. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/kill-2.mp3 | Clear. Next. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/turn-1.mp3 | Shield up. Moving. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/turn-2.mp3 | On me. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/turn-3.mp3 | Eyes front. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/turn-4.mp3 | Watch the flank. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/turn-5.mp3 | By the drill. Forward. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/mara/turn-6.mp3 | I've seen worse. Go. | Google Gemini API | gemini-3.8-flash-lite-tts | Erinome | a practical soldier, calm, clipped and dry, like calling drill | 2026-11-24 |
| voices/ilyra/crit-1.mp3 | Precisely as calculated. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/crit-2.mp3 | Remarkable. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/hurt-1.mp3 | Ow. That's going in the journal too. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/hurt-2.mp3 | Not my best idea. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/kill-1.mp3 | That settles it. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/kill-2.mp3 | That goes in the journal. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/turn-1.mp3 | Let me think. Yes. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/turn-2.mp3 | Noted. Now, a spell. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/turn-3.mp3 | Interesting. Stand back. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/turn-4.mp3 | I'll write this down later. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/turn-5.mp3 | Page three, I believe. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
| voices/ilyra/turn-6.mp3 | Quietly, now. | Google Gemini API | gemini-3.8-flash-lite-tts | Achernar | a thoughtful young scholar, soft, wry and precise | 2026-11-24 |
