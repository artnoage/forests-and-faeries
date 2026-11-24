# Off the Map: provenance of the generated media

Every image, voice, music and video file in `media/` was generated for this story by Claude (Anthropic) through paid APIs on the maintainer's accounts, on the dates below, and then re-encoded with FFmpeg (stills to WebP, narration and music to MP3, clips to H.264 + AAC; metadata stripped). No stock or third-party assets. Prompts name no living artist, studio or existing franchise.

Story, script and narration text: written by Claude for this game (original setting; monsters and heroes are the game's own SRD 5.2.1 content).

| File | Service | Model | Settings | Date | SHA-256 (first 16) |
|---|---|---|---|---|---|
| `media/clips/c8c.mp4` | Google Gemini API | gemini-omni-1.2-flash | 8 s, 720p, image-to-video from still c8c | 2026-11-24 | `c7e5ee238fa73da0` |
| `media/clips/p3.mp4` | Google Gemini API | gemini-omni-1.2-flash | 8 s, 720p, image-to-video from still p3 | 2026-11-24 | `6da874f4c000875c` |
| `media/map.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality low | 2026-11-24 | `3a695c3d61ae6924` |
| `media/music/dread.mp3` | Google Gemini API | lyria-3-clip-preview | 30 s clip, MP3 source | 2026-11-24 | `49c04539d2f7cade` |
| `media/music/ending.mp3` | Google Gemini API | lyria-3-clip-preview | 30 s clip, MP3 source | 2026-11-24 | `c6183459d296f3ce` |
| `media/music/road.mp3` | Google Gemini API | lyria-3-clip-preview | 30 s clip, MP3 source | 2026-11-24 | `33d5c83746262a54` |
| `media/stills/c1a.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `41e6704e7bd49822` |
| `media/stills/c1b.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `ad6dbbfabede4300` |
| `media/stills/c1c.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `c0ee3101d7af40d4` |
| `media/stills/c1d.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `de20fa1672e43466` |
| `media/stills/c2a.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `77b88d343241ac39` |
| `media/stills/c2b.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `993156cbf5bd0461` |
| `media/stills/c2c.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `7ea09b7f49624c88` |
| `media/stills/c2d.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `d789fa1f7e47dc8b` |
| `media/stills/c3a.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `7ce98fc312122226` |
| `media/stills/c3b.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `946e587458846a5b` |
| `media/stills/c3c.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `ff94d5fa3b1b486c` |
| `media/stills/c4a.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `469a80e89c1d294c` |
| `media/stills/c4b.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `f9c802eee0cd6391` |
| `media/stills/c4c.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `7d627893841365b7` |
| `media/stills/c5a.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `bea2849982ee1616` |
| `media/stills/c5b.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `51200d1e4394cec3` |
| `media/stills/c5c.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `b78f7b102096e552` |
| `media/stills/c5d.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `8fbb36f2a4445ac4` |
| `media/stills/c6a.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `c0896aa7b1de051c` |
| `media/stills/c6b.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `a3b0a83656839707` |
| `media/stills/c6c.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `b34f2b0044849e9e` |
| `media/stills/c7a.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `479ef5a1ffd6c0d0` |
| `media/stills/c7b.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `f46fed6578855572` |
| `media/stills/c7c.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `fa1ccdad452ed0e9` |
| `media/stills/c7d.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `7a725b55ca5df109` |
| `media/stills/c8a.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `40fdf3a38e30f1e6` |
| `media/stills/c8b.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `0f1ecf90b235e427` |
| `media/stills/c8c.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `421433aea2051d06` |
| `media/stills/e1.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `f67b224beb78170e` |
| `media/stills/e2.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `63bc0d19e5c30d55` |
| `media/stills/p1.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `1c4da8d573aaabc3` |
| `media/stills/p2.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `82c212f1c6b0457a` |
| `media/stills/p3.webp` | OpenAI API | gpt-image-2 | 1536x1024, quality medium | 2026-11-24 | `b09e33a03646306f` |
| `media/voice/c1a.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `621e8624b8c8edd2` |
| `media/voice/c1b.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `0e8e4e00f3322318` |
| `media/voice/c1c.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `e90dfa0c53c53ea9` |
| `media/voice/c1d.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `b1cd96b983a2f4cd` |
| `media/voice/c2a.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `e356d74038ea6f55` |
| `media/voice/c2b.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `f34c09b911ccff5e` |
| `media/voice/c2c.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `8ee9e88461cf35de` |
| `media/voice/c2d.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `1552cd71b194645f` |
| `media/voice/c3a.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `c93c6f1a6dc3a8d1` |
| `media/voice/c3b.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `83aec9fd76867a1c` |
| `media/voice/c3c.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `d78f103816787f88` |
| `media/voice/c4a.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `c71f5a2c9717120f` |
| `media/voice/c4b.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `9e5d1abf145aebb6` |
| `media/voice/c4c.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `6ab59b3c4abc3f95` |
| `media/voice/c5a.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `cff4365b03b689d1` |
| `media/voice/c5b.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `82eb6ec12c89405a` |
| `media/voice/c5c.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `f0e4ca491a67c912` |
| `media/voice/c5d.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `6c5c5d5b885a61da` |
| `media/voice/c6a.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `1f07f6a698d2b325` |
| `media/voice/c6b.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `f49566cdc927422b` |
| `media/voice/c6c.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `c7730f4d2d8f61fa` |
| `media/voice/c7a.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `751c2a296b50ab03` |
| `media/voice/c7b.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `90849ebaebda5ea1` |
| `media/voice/c7c.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `f5f25a121d461f7a` |
| `media/voice/c7d.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `d81ceb00124bbb2c` |
| `media/voice/c8a.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `b14f4bc4cd936c39` |
| `media/voice/c8b.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `9c58b99b195cdad4` |
| `media/voice/c8c.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `7d0527dc8b83a772` |
| `media/voice/e1.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `bca86ed6bc356fb7` |
| `media/voice/e2.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `1eb05c79d9de55dc` |
| `media/voice/p1.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `64ea0a05b9c8a19d` |
| `media/voice/p2.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `2e73361966bd4b25` |
| `media/voice/p3.mp3` | Google Gemini API | gemini-3.8-flash-tts | voice Achernar | 2026-11-24 | `48793fe7b4b65536` |

## Prompts

### `media/clips/c8c.mp4`

Gentle rain begins to fall over a quiet court of grey stone pillars; drops darken the dry stones and ripple in new puddles, three weary travellers stand still in the arcade, a small bronze seal rests on a stone throne. Very slow camera drift. Painted storybook watercolour style. Natural ambient sound only: soft rain. No music, no speech, no text.

### `media/clips/p3.mp4`

Slow cinematic push forward over a misty moorland road at dawn as a small company of travellers and a laden mule walk away from the camera into empty hills. Mist drifts, grass moves in a light wind, the light grows warmer. Painted storybook watercolour style, calm and quiet. Natural ambient sound only: wind, distant birds, footsteps. No music, no speech, no text.

### `media/map.webp`

A hand-drawn cartographer's map of a wild, hilly borderland seen from directly above, drawn on old cream parchment in brown ink with faded watercolour washes. Eight small pictorial landmarks spread across the sheet, joined by a faint dotted road that wanders from the far left to the far right: a mine entrance with timber props in low hills; a ruined courtyard of grey pillars under a small rain cloud; a brick kiln with a tall cracked chimney beside a stream; dark hills with tunnel mouths; a brick yard with broken pottery; a great black rock among caves; a winding river with a half-drowned stone canal lock and a small toll house; and, near the right edge, the pillared courtyard again seen from another side. Moorland, scattered pines and hatched hills between them, large plain areas of parchment. Absolutely no text, no letters, no words, no labels, no numbers, no compass lettering, no legend, no cartouche.

### `media/music/dread.mp3`

Slow, dark, quiet ambient instrumental: low bowed strings and a soft drone, a distant muffled drum now and then, uneasy and suspenseful but restrained, meant to sit under a narrator's voice. Instrumental only, no vocals.

### `media/music/ending.mp3`

Gentle, hopeful instrumental: soft piano and a single cello, slow, like light rain, tender, resolving warmly. Instrumental only, no vocals, no percussion.

### `media/music/road.mp3`

Quiet instrumental folk piece for a story about a long walk through empty hills: solo nylon-string guitar and a soft, low wooden flute, slow and unhurried, a little melancholy, sparse and warm, with space for a narrator's voice. Instrumental only, no vocals, no percussion.

Image prompts below begin with this shared style text, written as `[STYLE]`:

> Painted storybook illustration for an original fantasy tale: confident ink linework with muted watercolour and gouache washes, an earthy palette of slate grey, moss green, ochre and rust, soft natural light, the gentle grain of textured paper. Wide cinematic composition. Grounded, quiet, slightly melancholy mood. Original designs only. No text, no letters, no writing, no captions, no logos, no watermark, no signature, no frame or border.

### `media/stills/c1a.webp`

[STYLE] Scene: evening at the timbered entrance of an old mine cut into a hillside, rusted ore carts on rails, old lanterns on posts. Odo Fenn, a thin, stooped surveyor in his fifties with grey stubble and round wire spectacles, in a long grey coat with many pockets, a leather satchel of rolled maps over his shoulder measures the entrance with a surveyor's chain; beside him Guy, a broad-shouldered young man with short chestnut hair and a short beard, in a chain-mail shirt and a dark-blue tabard, carrying a long two-handed sword, Curogana, a slender young elven woman with a long copper-red braid and small dark-crimson scales on her cheekbones, in a crimson high-collared coat with gold trim and Ilyra, a slender young woman with black hair in a low bun, in a long deep blue-teal scholar's robe, with a plain wooden staff and a small leather book at her belt wait, looking into the dark. No gore, no blood.

### `media/stills/c1b.webp`

[STYLE] Scene: a low mine tunnel lit by one swinging lantern. Shambling dead miners in rotted work clothes, grey-skinned and hollow-eyed, still dragging picks and ore baskets; a skeleton pushes an ore cart; a crouching, gaunt pale ghoul with long nails watches from a side passage. Eerie, cold light. No gore, no blood.

### `media/stills/c1c.webp`

[STYLE] Scene: inside a mine tunnel after a fight, quiet now. Odo Fenn, a thin, stooped surveyor in his fifties with grey stubble and round wire spectacles, in a long grey coat with many pockets, a leather satchel of rolled maps over his shoulder sits on an ore cart sketching in a notebook by lantern light, not looking at the still shapes on the ground under sackcloth. Guy, a broad-shouldered young man with short chestnut hair and a short beard, in a chain-mail shirt and a dark-blue tabard, carrying a long two-handed sword wipes his sword clean in the background. No gore, no blood.

### `media/stills/c1d.webp`

[STYLE] Scene: night, a small campfire outside a mine entrance under stars. Ilyra, a slender young woman with black hair in a low bun, in a long deep blue-teal scholar's robe, with a plain wooden staff and a small leather book at her belt writes in a journal by the fire; across the flames Odo Fenn, a thin, stooped surveyor in his fifties with grey stubble and round wire spectacles, in a long grey coat with many pockets, a leather satchel of rolled maps over his shoulder smiles thinly, spectacles catching the light. No gore, no blood.

### `media/stills/c2a.webp`

[STYLE] Scene: a ruined court of tall grey stone pillars forming a long arcade in heavy, steady rain, wide puddles reflecting the columns, an old stone throne at the far end under a broken roof. Grey-green light, rain streaks. No gore, no blood.

### `media/stills/c2b.webp`

[STYLE] Scene: in a rainy pillared arcade, a tall figure wrapped in old grave linen sits upright on a stone throne, holding court; beside it stand two dark shadowy human shapes with no faces, cast the wrong way against the light. In the foreground, seen from behind, three adventurers draw weapons: a man with a long sword, a man in plate with a warhammer, a woman in a crimson coat. No gore, no blood.

### `media/stills/c2c.webp`

[STYLE] Scene: close view of an empty stone throne wet with rain, and on its seat a small round bronze seal the size of a palm, with four worn faces carved around its rim. Soft grey light, raindrops. No gore, no blood.

### `media/stills/c2d.webp`

[STYLE] Scene: a small company of adventurers walks out of a pillared stone court; at the back Odo Fenn, a thin, stooped surveyor in his fifties with grey stubble and round wire spectacles, in a long grey coat with many pockets, a leather satchel of rolled maps over his shoulder glances over his shoulder with one hand deep in his coat pocket. Behind them the rain clouds break and a shaft of pale sunlight falls on the wet pillars. No gore, no blood.

### `media/stills/c3a.webp`

[STYLE] Scene: dusk, an abandoned old brick kiln and brickworks split from roof to floor by a great crack, a tall brick chimney beside it, weeds and stacked bricks. A small campfire inside the doorway where travellers are making camp. Purple dusk sky. No gore, no blood.

### `media/stills/c3b.webp`

[STYLE] Scene: inside a dark brick kiln at midnight, a red ember glow. From a square brick draught shaft in the floor, gaunt pale undead with long clawed hands and hungry faces climb up one after another. Menacing, tense. No gore, no blood.

### `media/stills/c3c.webp`

[STYLE] Scene: Chruna, a tall, strong human woman warrior in a steel breastplate, red leather bracers and a torn blue cape, carrying a long-hafted polearm with an axe blade stands at the rim of a dark brick shaft looking down, embers drifting up. Behind her, Odo Fenn, a thin, stooped surveyor in his fifties with grey stubble and round wire spectacles, in a long grey coat with many pockets, a leather satchel of rolled maps over his shoulder sits wrapped in a blanket against the kiln wall, avoiding her eyes. No gore, no blood.

### `media/stills/c4a.webp`

[STYLE] Scene: a long, deep mine gallery with old oil lamps hanging from iron hooks along the timbered wall. The nearest lamps still burn; further back, one by one, they have gone out, and darkness follows a small group of travellers with a single lantern. No gore, no blood.

### `media/stills/c4b.webp`

[STYLE] Scene: under the last lit lamp of a dark mine gallery stands a dead knight in old dented armour, gaunt grey face, cold pale glowing eyes, a sword in hand. Behind him in the dark, a translucent pale floating spirit and faceless black shadows. Very dark, cold. No gore, no blood.

### `media/stills/c4c.webp`

[STYLE] Scene: by a single lamp in a mine gallery, Elion, a calm grey-haired middle-aged man in polished plate armour with a white tabard bearing a simple gold sunburst, a warhammer in his hand and a round shield on his back confronts Odo Fenn, a thin, stooped surveyor in his fifties with grey stubble and round wire spectacles, in a long grey coat with many pockets, a leather satchel of rolled maps over his shoulder, who holds out his open empty hands and a notebook, his face innocent. Tense, quiet. No gore, no blood.

### `media/stills/c5a.webp`

[STYLE] Scene: an old kiln yard littered with thousands of shattered glazed pots and tiles in blue, green and ochre, a squat brick chimney. Small green-skinned goblins and small reddish scaly kobolds rummage through the shards with sacks; in the background, gaunt pale undead lurk behind the brick stacks. No gore, no blood.

### `media/stills/c5b.webp`

[STYLE] Scene: Mara, a sturdy young woman with tanned skin and a short dark braid, in chain mail and a teal-green tabard, with a longsword and a round teal shield holds a small struggling green-skinned goblin up by its collar; the goblin clutches a crumpled scrap of map drawn in charcoal. Shards of glazed pottery underfoot. Slightly comic, tense. No gore, no blood.

### `media/stills/c5c.webp`

[STYLE] Scene: close-up: a small round bronze seal with four carved faces on its rim tumbles out of the pocket of a long grey coat and falls among shards of glazed blue and green pottery, caught in low golden light. No gore, no blood.

### `media/stills/c5d.webp`

[STYLE] Scene: dusk in a kiln yard: Odo Fenn, a thin, stooped surveyor in his fifties with grey stubble and round wire spectacles, in a long grey coat with many pockets, a leather satchel of rolled maps over his shoulder sits on a broken crate, defiant, talking fast; around him stand Mara, a sturdy young woman with tanned skin and a short dark braid, in chain mail and a teal-green tabard, with a longsword and a round teal shield, Curogana, a slender young elven woman with a long copper-red braid and small dark-crimson scales on her cheekbones, in a crimson high-collared coat with gold trim and Ilyra, a slender young woman with black hair in a low bun, in a long deep blue-teal scholar's robe, with a plain wooden staff and a small leather book at her belt, arms folded, unconvinced. No gore, no blood.

### `media/stills/c6a.webp`

[STYLE] Scene: a vast cavern around an enormous black glossy rock; nails, buckles and rusted blades cling to it, pulled to its surface. In the gloom around it stand crowds of pale, silent dead figures, waiting. A small lantern-lit group of travellers enters from the left. No gore, no blood.

### `media/stills/c6b.webp`

[STYLE] Scene: in a dark cavern, dead knights with cold glowing eyes and translucent pale spirits rise and surge forward out of the blackness toward three adventurers seen from behind: a man in plate with a white tabard, a woman in a crimson coat, a tall woman with a torn blue cape and a polearm. No gore, no blood.

### `media/stills/c6c.webp`

[STYLE] Scene: dawn: a small company of travellers steps out of a cave mouth high on a hillside, looking down on a wide slow river valley; below, an old stone canal lock and toll house lie half drowned in still water. Mist, gold and grey light. No gore, no blood.

### `media/stills/c7a.webp`

[STYLE] Scene: a half-drowned stone river lock with heavy old timber gates and a small stone toll house; the water is dark and still, and beneath its surface four long stone coffins can be seen lying side by side. Overcast, silent. No gore, no blood.

### `media/stills/c7b.webp`

[STYLE] Scene: four tall figures wrapped in old grave linen, each with a tarnished bronze circlet, rise dripping out of dark water in a stone lock. On the lock wall, Mara, a sturdy young woman with tanned skin and a short dark braid, in chain mail and a teal-green tabard, with a longsword and a round teal shield holds up a small bronze seal toward them. No gore, no blood.

### `media/stills/c7c.webp`

[STYLE] Scene: Mara, a sturdy young woman with tanned skin and a short dark braid, in chain mail and a teal-green tabard, with a longsword and a round teal shield presses a small round bronze seal into an empty round socket in the stone wall of an old toll house beside still water. The first soft drops of rain mark the water. No gore, no blood.

### `media/stills/c7d.webp`

[STYLE] Scene: grey dawn beside a stone toll house: an empty, rumpled bedroll, a round socket in the wall prised open and empty, a dropped iron chisel, and a line of footprints in the mud leading away into the mist. No gore, no blood.

### `media/stills/c8a.webp`

[STYLE] Scene: a court of grey stone pillars in harsh, dry sunlight, the ground cracked and dry. Odo Fenn, a thin, stooped surveyor in his fifties with grey stubble and round wire spectacles, in a long grey coat with many pockets, a leather satchel of rolled maps over his shoulder sits on the stone throne at the end of the arcade holding up a small bronze seal; around him stand several empty suits of old plate armour, upright and still like sentries, and a green-skinned goblin chief in a battered breastplate waits at his side. No gore, no blood.

### `media/stills/c8b.webp`

[STYLE] Scene: close view of Odo Fenn, a thin, stooped surveyor in his fifties with grey stubble and round wire spectacles, in a long grey coat with many pockets, a leather satchel of rolled maps over his shoulder on a stone throne, spectacles glinting, a thin smile, the bronze seal raised in one hand; behind him the empty helms of suits of armour turn toward the viewer. No gore, no blood.

### `media/stills/c8c.webp`

[STYLE] Scene: a court of grey stone pillars after a battle: a fallen empty helm on the stones, a small bronze seal resting on the stone throne, and Guy, a broad-shouldered young man with short chestnut hair and a short beard, in a chain-mail shirt and a dark-blue tabard, carrying a long two-handed sword, Chruna, a tall, strong human woman warrior in a steel breastplate, red leather bracers and a torn blue cape, carrying a long-hafted polearm with an axe blade and Ilyra, a slender young woman with black hair in a low bun, in a long deep blue-teal scholar's robe, with a plain wooden staff and a small leather book at her belt standing quietly in the arcade as the first soft rain begins to fall and darken the stones. No gore, no blood.

### `media/stills/e1.webp`

[STYLE] Scene: night, a campfire on a hillside. Ilyra, a slender young woman with black hair in a low bun, in a long deep blue-teal scholar's robe, with a plain wooden staff and a small leather book at her belt feeds the pages of a detailed hand-drawn map into the flames one by one; the paper curls and glows. A leather satchel lies open beside her. No gore, no blood.

### `media/stills/e2.webp`

[STYLE] Scene: daylight on a wooden table: an old printed map of hilly northern country with a large blank, empty area in its middle, and beside the blank a small inked drawing of a pointing hand in the margin. A blue-teal sleeve and a quill at the edge of the frame. No gore, no blood.

### `media/stills/p1.webp`

[STYLE] Scene: night, a cluttered surveyor's table lit by one candle: an old map of hilly country with a large blank, empty area in its middle, brass dividers, a set square, ink pots and quills, a thin hand with ink-stained fingers resting at the edge of the blank. Shallow depth of field, warm candlelight against cold blue shadows. No gore, no blood.

### `media/stills/p2.webp`

[STYLE] Scene: Odo Fenn, a thin, stooped surveyor in his fifties with grey stubble and round wire spectacles, in a long grey coat with many pockets, a leather satchel of rolled maps over his shoulder, standing in a cramped study full of rolled maps and charts, holding a brass surveying instrument up to the window light, eager and sharp-eyed. Half-length view. No gore, no blood.

### `media/stills/p3.webp`

[STYLE] Scene: dawn on a wide, misty moorland road winding into empty hills. Seen from behind and a little above, a small company sets out: six adventurers and a thin surveyor in a long grey coat leading a laden mule. Among them a woman in a crimson coat, a man in plate with a white tabard, a woman in a blue-teal robe with a staff, a woman with a torn blue cape and a polearm. Pale gold light, long shadows, a vast quiet landscape. No gore, no blood.

### `media/voice/c1a.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Day one. The road begins at the Lantern Mine, where haulers once dragged ore up into the light. Fenn wanted the entrance measured before dark. Guy, Curogana and I went in with him.

### `media/voice/c1b.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: The haulers are still at work down there. They have not noticed that they are dead. They noticed us.

### `media/voice/c1c.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Fenn sketched the tunnel while Guy cleaned his sword. He never looked at the bodies. “One mark on the map,” he said. “Seven to go.”

### `media/voice/c1d.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: That night I asked him what was at the end of the road. “A margin,” he said. I wrote it down, because it sounded like a joke, and he was not a man who joked.

### `media/voice/c2a.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Day four. The Rain Court: an arcade of grey pillars where the queens of the March once heard petitions. The stories say it has rained there for three hundred years. It was raining when we came.

### `media/voice/c2b.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Someone still holds court. A steward in grave linen sat on the throne, and two shadows stood beside it that fell the wrong way in the light. Guy, Elion and Curogana drew their weapons.

### `media/voice/c2c.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Afterwards the throne was empty except for a bronze seal the size of a palm, four faces around its rim. Elion said to leave it where it lay. We left it.

### `media/voice/c2d.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Fenn was the last of us out of the court. Behind us, for the first time in three hundred years, the rain stopped. Nobody thought much of it. We should have.

### `media/voice/c3a.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Day seven. We slept in the Split Kiln, a brickworks cracked from roof to floor by some old frost. Fenn wanted its chimney for a sightline.

### `media/voice/c3b.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: At midnight something climbed up the draught shaft, and then more of it. They went straight for the corner where Fenn slept. Elion, Chruna and I stood in the way.

### `media/voice/c3c.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Chruna said the dead had pushed past her to reach him. “They wanted him,” she said. “Not us. Him.” Fenn said the dead want everybody, and went back to sleep. I did not.

### `media/voice/c4a.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Day nine. The road goes back under the hills, through the lower galleries of the mine. The old lamps there still burn. As we walked, one by one, they went out behind us.

### `media/voice/c4b.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Under the last lamp a dead knight was waiting, and it spoke, which the dead should not do. “Return what was taken,” it said. Then the dark came down on Elion, Curogana and Chruna.

### `media/voice/c4c.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Elion asked Fenn plainly what he had taken. Fenn showed us his empty hands, his notebook and his ink. “Measurements,” he said. Elion did not believe him. Neither did I. We walked on anyway.

### `media/voice/c5a.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Day fifteen. Two weeks on the road had made us harder. At the old kiln yard downriver, scavengers had got there first: goblins and kobolds, who follow the dead and strip what they leave behind.

### `media/voice/c5b.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Mara caught one by the collar before the fighting began. It held a scrap of Fenn's map, copied in charcoal. “The thin man drops pages,” it said. “We follow the pages. The dead follow him.”

### `media/voice/c5c.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: When it was over, Mara turned out Fenn's coat. The bronze seal fell into the broken glaze. He had taken it from the throne at the Rain Court while we were busy with the dead.

### `media/voice/c5d.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: “It is the key to the March,” Fenn said. “Whoever holds it holds the road, and the tomb at the end of it. Four queens’ gold. Your pay ten times over.” Mara said the queens could have their seal back at their own door. The road went there anyway.

### `media/voice/c6a.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Day eighteen. The short way to the river runs beneath the Loadstone, a black rock that tugs at every buckle and blade. The dead of the whole March had gathered under it, waiting for the seal to pass.

### `media/voice/c6b.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: They did not wait for us to pass. Elion, Curogana and Chruna went first into the dark.

### `media/voice/c6c.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: We came out at dawn above the river, with the old lock half drowned below us. Fenn walked in the middle of us now, and the seal hung wrapped in cloth on Mara's belt. He did not speak all day.

### `media/voice/c7a.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Day twenty. The Sunken Toll: a river lock where the queens of the March took a coin from every boat, and where they were buried when the river rose. Four of them. Sisters.

### `media/voice/c7b.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Mara held up the seal and said we had come to give it back. The four queens rose out of the water. They did not care how it had come.

### `media/voice/c7c.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: When the last of them fell, Mara pressed the seal into an empty socket in the toll-house wall. The water went still. Far away, over the hills, it began to rain.

### `media/voice/c7d.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: In the morning Fenn was gone, and so was the seal. He had prised it out of the wall while we slept.

### `media/voice/c8a.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Day twenty-two. We found him back at the Rain Court, on the empty throne, with the seal in his hand. Around him stood the court's old guardians, suits of armour that answer to whoever holds the seal, and the goblin chief who had followed his pages, waiting to be paid.

### `media/voice/c8b.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: “Every road has a toll,” Fenn said. “This one is mine.” The armour began to move. Guy, Chruna and I stepped forward.

### `media/voice/c8c.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: When the last suit of armour fell, Fenn let go of the seal and ran, and the March let him go. We set the seal back on the throne. In the Rain Court, softly, it began to rain again.

### `media/voice/e1.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Fenn's map was in the satchel he left behind, finished at last: every gate, every shaft, every lock. I burned it that night, one page at a time.

### `media/voice/e2.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: The March is still a blank on the maps of the north. In the margin there is a note, in my handwriting now: here we do not go. Some places should stay off the map.

### `media/voice/p1.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Every map of the north has a blank in it: forty miles of hills between the Lantern Mine and the river, left empty, with a note in the margin: here we do not go.

### `media/voice/p2.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: Odo Fenn, surveyor, meant to fill it. He hired six of us to walk the old road with him. Half our pay in advance, the rest when the road was on paper.

### `media/voice/p3.mp3`

Style: quiet, unhurried and plain: a thoughtful young woman reading her own travel journal aloud by a fire, dry and a little wry, never theatrical

Text: I kept the company's journal. We set out at first light. Fenn talked about ink and angles all morning, and nobody asked why the blank was blank.
