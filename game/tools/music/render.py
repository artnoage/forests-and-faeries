"""Render the scores (scores.py) and the sound effects (sfx.py) to WAV files plus a sequencing table.

    python -m game.tools.music.render OUT_DIR

Each music section becomes OUT_DIR/music/<piece>-<section>.wav: exactly its bars, then a tail
in which notes and the hall ring on. The browser starts the next section at the bar line (the
section's `length` in seconds), so tails overlap the next section the way a played loop would.
`music.json` lists the sections, their lengths and the transition weights.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

if __package__ in (None, ''):
    sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from game.tools.music import scores, sfx, synth  # noqa: E402
from game.tools.music.synth import RNG, SR, hz, midi  # noqa: E402

TAIL = 4.0
QUALITIES = {'': (0, 4, 7), 'm': (0, 3, 7), '7': (0, 4, 7, 10), 'm7': (0, 3, 7, 10), 'sus4': (0, 5, 7),
             'maj7': (0, 4, 7, 11), '5': (0, 7)}


def chord_pcs(name):
    root = name[0] + (name[1] if len(name) > 1 and name[1] in '#b' else '')
    quality = name[len(root):]
    r = midi(root + '4') % 12
    return r, [(r + i) % 12 for i in QUALITIES[quality]], QUALITIES[quality]


def in_range(pc, lo):
    """The lowest MIDI note of pitch class pc at or above lo."""
    return lo + (pc - lo) % 12


def voice(name, previous, lo=53, size=4):
    """A close voicing of the chord in [lo, lo+16], nearest the previous voicing."""
    _, pcs, _ = chord_pcs(name)
    best, best_cost = None, None
    for start in range(lo, lo + 12):
        notes = sorted({in_range(pc, start) for pc in pcs})
        while len(notes) < size:
            notes.append(notes[len(notes) - len(pcs)] + 12)
        notes = notes[:size]
        cost = sum(abs(a - b) for a, b in zip(notes, previous)) if previous else abs(notes[0] - (lo + 5))
        if best_cost is None or cost < best_cost:
            best, best_cost = notes, cost
    return best


def m2hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def jitter(seconds=0.008):
    return float(RNG.uniform(-seconds, seconds))


def play_line(mix, instrument, line, beat, gain, position, at=0.0, send=0.25):
    t = at
    for i, (note, beats) in enumerate(line):
        dur = beats * beat
        if note != scores.R:
            f = hz(note)
            vel = gain * (1.0 + jitter(0.06)) * (1.06 if beats >= 1.5 else 1.0)
            held = dur * (0.92 if beats <= 0.5 else 0.97)
            sound = {
                'flute': lambda: synth.flute(f, held, vel),
                'brass': lambda: synth.brass(f, held, vel),
                'cello': lambda: synth.cello(f, held, vel),
                'celesta': lambda: synth.bell(f, held, vel, ratio=2.0, index=2.2, decay=1.4),
                'strings_hi': lambda: synth.strings(f, held, vel, attack=0.08, release=0.45, voices=3, bright=0.8),
            }[instrument]()
            mix.add(sound, t + jitter(0.006), position, send)
        t += dur
    return t


def arrange_calm(name, sec, bpm):
    beat = 60 / bpm
    bars = len(sec['chords'])
    length = bars * 4 * beat
    mix = synth.Mix(length + TAIL)
    previous = None
    for b, chord in enumerate(sec['chords']):
        t0 = b * 4 * beat
        root, pcs, ivals = chord_pcs(chord)
        third = ivals[1]
        low = in_range(root, 45)            # A2 .. G#3
        if sec['harp'] == 'arp':
            pattern = [0, 7, 12, 12 + third, 19, 12 + third, 12, 7]
            for i, step in enumerate(pattern):
                vel = (0.62 if i == 0 else 0.42 if i % 2 == 0 else 0.34) * (1 + jitter(0.12))
                mix.add(synth.pluck(m2hz(low + step), beat * 0.5 * 1.6, vel), t0 + i * beat / 2 + jitter(0.007), -0.35, 0.3, 0.55)
        else:
            for i, step in ((0, 0), (2, 12 + third), (4, 19), (6, 12)):
                mix.add(synth.pluck(m2hz(low + step), beat * 1.6, 0.42), t0 + i * beat / 2 + jitter(0.01), -0.35, 0.35, 0.55)
        if sec['pad']:
            previous = voice(chord, previous, lo=53)
            for k, m in enumerate(previous):
                mix.add(synth.strings(m2hz(m), 4 * beat * 0.98, 0.26, attack=0.9, release=1.4, voices=2, bright=0.35),
                        t0, (-0.5, 0.5, -0.2, 0.25)[k % 4], 0.45)
        if sec['bass']:
            bass_root = in_range(root, 38)    # D2 .. C#3
            mix.add(synth.bass(m2hz(bass_root), 2 * beat * 0.9, 0.5), t0, 0.0, 0.12)
            mix.add(synth.bass(m2hz(bass_root + 7), 2 * beat * 0.9, 0.38), t0 + 2 * beat, 0.0, 0.12)
    for instrument, line, gain, position in sec['parts']:
        play_line(mix, instrument, line, beat, gain, position, send=0.32)
    return mix, length


def arrange_battle(name, sec, bpm):
    beat = 60 / bpm
    bars = len(sec['chords'])
    length = bars * 4 * beat
    mix = synth.Mix(length + TAIL)
    previous = None
    for b, chord in enumerate(sec['chords']):
        t0 = b * 4 * beat
        root, pcs, ivals = chord_pcs(chord)
        low = in_range(root, 40)              # E2 .. D#3
        if sec['ostinato'] is True:
            for i, step in enumerate([0, 0, 12, 0, 0, 0, 7, 0]):
                vel = (0.72 if i in (0, 4) else 0.5) * (1 + jitter(0.08))
                mix.add(synth.cello(m2hz(low + step), beat * 0.42, vel, short=True), t0 + i * beat / 2 + jitter(0.004), -0.25, 0.15, 0.62)
                if i in (0, 4):
                    mix.add(synth.bass(m2hz(low), beat * 0.45, 0.4), t0 + i * beat / 2, 0.0, 0.05)
        elif sec['ostinato'] == 'drone':
            mix.add(synth.cello(m2hz(in_range(midi('E2') % 12, 40)), 4 * beat, 0.55), t0, -0.2, 0.25, 0.6)
            mix.add(synth.bass(m2hz(midi('E2')), 4 * beat * 0.95, 0.4), t0, 0.0, 0.1)
        if sec['pad']:
            previous = voice(chord, previous, lo=52)
            tremolo = 12.0 if sec['pad'] == 'tremolo' else 0.0
            for k, m in enumerate(previous):
                mix.add(synth.strings(m2hz(m), 4 * beat * 0.98, 0.3 if tremolo else 0.24, attack=0.25 if tremolo else 0.5,
                                      release=0.6, voices=2, bright=0.55, tremolo=tremolo),
                        t0, (-0.55, 0.55, -0.25, 0.3)[k % 4], 0.35)
        for at, kind, vel, pitch in sec.get('drums', []):
            ramp = 1 + 0.5 * b / bars if sec.get('roll_last') else 1
            mix.add(synth.frame_drum(pitch, vel * ramp * (1 + jitter(0.08))), t0 + at * beat + jitter(0.004), 0.05, 0.2, 0.7)
        if sec.get('shaker'):
            for i in range(8):
                mix.add(synth.shaker(0.3 if i % 2 == 0 else 0.2), t0 + i * beat / 2 + jitter(0.006), 0.45, 0.15, 0.6)
        if sec.get('snare'):
            for at in (1, 3):
                mix.add(synth.snare(0.32 * (1 + jitter(0.1))), t0 + at * beat, -0.1, 0.25, 0.55)
        every = sec.get('boom_every')
        if every and b % every == 0:
            mix.add(synth.low_boom(0.7), t0, 0.0, 0.2, 0.45)
        if sec.get('timpani_every') and b % sec['timpani_every'] == 0:
            mix.add(synth.timpani(hz('E2'), 0.6), t0, 0.0, 0.3, 0.7)
        if chord in sec.get('stabs', []):
            for at in (0, 1.5):
                for m in voice(chord, None, lo=53, size=3):
                    mix.add(synth.brass(m2hz(m), beat * 0.35, 0.55, bright=1.2), t0 + at * beat, 0.0, 0.3)
        if sec.get('roll_last') and b >= bars - sec['roll_last']:
            for i in range(16):
                mix.add(synth.timpani(hz('B1'), 0.25 + 0.5 * ((b - (bars - sec['roll_last'])) * 16 + i) / (16 * sec['roll_last']), dur=0.9),
                        t0 + i * beat / 4, 0.0, 0.3, 0.6)
    for instrument, line, gain, position in sec['parts']:
        play_line(mix, instrument, line, beat, gain, position, send=0.28)
    return mix, length


def arrange_sting(spec):
    beat = 60 / spec['bpm']
    total = sum(b for _, b in spec['chords']) * beat
    mix = synth.Mix(total + TAIL)
    t, previous = 0.0, None
    for chord, beats in spec['chords']:
        previous = voice(chord, previous, lo=52)
        for k, m in enumerate(previous):
            mix.add(synth.strings(m2hz(m), beats * beat, 0.26, attack=0.12, release=1.4, voices=2, bright=0.6), t,
                    (-0.5, 0.5, -0.2, 0.3)[k % 4], 0.4)
        root, _, _ = chord_pcs(chord)
        mix.add(synth.bass(m2hz(in_range(root, 38)), beats * beat * 0.95, 0.45), t, 0.0, 0.1)
        t += beats * beat
    for instrument, line, gain, position in spec['parts']:
        play_line(mix, instrument, line, beat, gain, position, send=0.35)
    for at, vel in spec['timpani']:
        mix.add(synth.timpani(hz('E2'), vel), at * beat, 0.0, 0.3, 0.75)
    return mix, total


def finish(sections, ir, target_rms_db):
    """Render the mixes, give the whole piece one gain (so sections keep their relative
    dynamics), and bend any peak under -1 dBFS."""
    rendered = {k: synth.fade_tail(synth.master_eq(mix.render(ir))) for k, (mix, _) in sections.items()}
    joined = np.concatenate([x for x in rendered.values()], axis=1)
    rms = np.sqrt(np.mean(joined ** 2))
    gain = 10 ** (target_rms_db / 20) / max(rms, 1e-9)
    return {k: synth.soft_limit(x * gain) for k, x in rendered.items()}


def main(out):
    out = Path(out)
    (out / 'music').mkdir(parents=True, exist_ok=True)
    (out / 'sfx').mkdir(parents=True, exist_ok=True)
    table = {'pieces': {}, 'stings': {}}
    hall = synth.impulse_response(2.8, seed=7)
    for piece, spec, arrange, target in (('calm', scores.CALM, arrange_calm, -21.0), ('battle', scores.BATTLE, arrange_battle, -19.0)):
        mixes = {k: arrange(k, sec, spec['bpm']) for k, sec in spec['sections'].items()}
        finished = finish(mixes, hall, target)
        sections = {}
        for k, x in finished.items():
            name = f'{piece}-{k}'
            synth.write_wav(out / 'music' / f'{name}.wav', x)
            sections[k] = {'file': f'music/{name}.mp3', 'length': round(mixes[k][1], 6),
                           'next': spec['sections'][k]['next']}
            print(name, f'{mixes[k][1]:.2f}s + tail', f'peak {np.max(np.abs(x)):.3f}', flush=True)
        table['pieces'][piece] = {'bpm': spec['bpm'], 'start': spec['start'], 'sections': sections}
    for sting, spec in (('victory', scores.VICTORY), ('defeat', scores.DEFEAT)):
        mix, length = arrange_sting(spec)
        x = finish({sting: (mix, length)}, hall, -19.5)[sting]
        synth.write_wav(out / 'music' / f'{sting}.wav', x)
        table['stings'][sting] = {'file': f'music/{sting}.mp3', 'length': round(length, 3)}
        print(sting, f'{length:.2f}s + tail', flush=True)
    table['sfx'] = {}
    for name, sound in sfx.render_all().items():
        synth.write_wav(out / 'sfx' / f'{name}.wav', sound)
        table['sfx'][name] = f'sfx/{name}.mp3'
        print('sfx', name, f'{sound.shape[-1] / SR:.2f}s', flush=True)
    (out / 'music.json').write_text(json.dumps(table, indent=1) + '\n')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
