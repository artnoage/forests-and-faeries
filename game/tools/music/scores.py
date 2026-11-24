"""The game's music, written as scores: chords per bar, hand-written melodies, and the
accompaniment figures that the arranger below turns into notes.

Pieces (each section is rendered on its own and sequenced in the browser, so the music
does not loop as one fixed recording):

* calm, "The Road Behind" (deployment and the start screen): D minor, 76 bpm, 4/4.
  intro (4 bars) then A, A2, B, C (8 bars each), chosen by the transition table.
* battle, "Steel at the Gate": E minor, 112 bpm, 4/4. intro (2 bars) then A, A2, B,
  C, D (8 bars each).
* victory sting (E major) and defeat sting (E minor), a few seconds each.

Durations are in beats; 'r' is a rest.
"""
from __future__ import annotations

R = 'r'

# ----------------------------------------------------------------------------------------------
# calm: The Road Behind
# ----------------------------------------------------------------------------------------------
CALM_BPM = 76

CALM_A_MELODY = [  # flute
    ('A4', 1.5), ('D5', .5), ('E5', 1), ('F5', 1),       # Dm
    ('D5', 2), ('C5', 1), ('Bb4', 1),                    # Bb
    ('A4', 1.5), ('G4', .5), ('F4', 1), ('A4', 1),       # F
    ('G4', 3), (R, 1),                                   # C
    ('A4', 1.5), ('D5', .5), ('E5', 1), ('F5', 1),       # Dm
    ('G5', 2), ('F5', 1), ('D5', 1),                     # Bb
    ('E5', 1), ('D5', 1), ('Bb4', 1), ('G4', 1),         # Gm
    ('A4', 3), (R, 1),                                   # A
]
CALM_A2_COUNTER = [  # flute, long notes over the cello's tune
    ('F5', 4), ('F5', 2), ('D5', 2), ('C5', 4), ('E5', 4),
    ('F5', 4), ('D5', 4), ('D5', 2), ('Bb4', 2), ('C#5', 4),
]
CALM_B_MELODY = [
    ('C5', 1), ('A4', 1), ('C5', 1), ('F5', 1),          # F
    ('E5', 2), ('D5', 1), ('C5', 1),                     # C
    ('D5', 1.5), ('C5', .5), ('A4', 2),                  # Dm
    ('Bb4', 1), ('C5', 1), ('D5', 2),                    # Bb
    ('C5', 1), ('A4', 1), ('C5', 1), ('F5', 1),          # F
    ('G5', 2), ('F5', 1), ('E5', 1),                     # C
    ('D5', 1), ('F5', 1), ('E5', 1), ('D5', 1),          # Bb
    ('C#5', 2), ('E5', 2),                               # A
]
CALM_C_CELESTA = [
    ('F5', 2), ('D5', 2), ('C5', 4), ('D5', 2), ('Bb4', 2), ('A4', 4),
    ('F5', 2), ('D5', 2), ('C5', 2), ('A4', 2), ('Bb4', 2), ('G4', 2), ('A4', 4),
]


def transpose(line, semitones):
    from game.tools.music.synth import midi
    names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
    out = []
    for note, beats in line:
        if note == R:
            out.append((note, beats))
            continue
        m = midi(note) + semitones
        out.append((f'{names[m % 12]}{m // 12 - 1}', beats))
    return out


CALM = {
    'bpm': CALM_BPM,
    'start': 'intro',
    'sections': {
        'intro': {'chords': ['Dm', 'Bb', 'F', 'C'], 'harp': 'arp', 'pad': True, 'bass': False,
                  'parts': [], 'next': {'a': 1}},
        'a': {'chords': ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A'], 'harp': 'arp', 'pad': True, 'bass': True,
              'parts': [('flute', CALM_A_MELODY, 0.55, 0.15)], 'next': {'a2': 1, 'b': 1}},
        'a2': {'chords': ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A'], 'harp': 'arp', 'pad': True, 'bass': True,
               'parts': [('cello', transpose(CALM_A_MELODY, -12), 0.6, -0.3), ('flute', CALM_A2_COUNTER, 0.38, 0.3)],
               'next': {'b': 3, 'c': 2}},
        'b': {'chords': ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'A'], 'harp': 'arp', 'pad': True, 'bass': True,
              'parts': [('flute', CALM_B_MELODY, 0.55, 0.15)], 'next': {'a': 1, 'c': 1}},
        'c': {'chords': ['Bb', 'F', 'Gm', 'Dm', 'Bb', 'F', 'Gm', 'A'], 'harp': 'sparse', 'pad': True, 'bass': True,
              'parts': [('celesta', CALM_C_CELESTA, 0.42, 0.25)], 'next': {'a': 3, 'a2': 2}},
    },
}

# ----------------------------------------------------------------------------------------------
# battle: Steel at the Gate
# ----------------------------------------------------------------------------------------------
BATTLE_BPM = 112

BATTLE_A_MELODY = [  # brass
    ('E4', 1.5), ('B3', .5), ('E4', 1), ('G4', 1),       # Em
    ('E4', 1.5), ('C4', .5), ('E4', 1), ('G4', 1),       # C
    ('F#4', 1.5), ('D4', .5), ('F#4', 1), ('A4', 1),     # D
    ('B4', 3), ('A4', .5), ('G4', .5),                   # B
    ('E5', 1.5), ('D5', .5), ('B4', 1), ('G4', 1),       # Em
    ('C5', 1.5), ('B4', .5), ('G4', 1), ('E4', 1),       # C
    ('A4', 1), ('C5', 1), ('B4', 1), ('A4', 1),          # Am
    ('B4', 2), ('D#5', 1), ('F#5', 1),                   # B
]
BATTLE_A2_COUNTER = [  # brass, long notes under the strings' tune an octave up
    ('B3', 4), ('C4', 4), ('A3', 4), ('B3', 2), ('D#4', 2),
    ('E4', 4), ('E4', 4), ('C4', 4), ('B3', 4),
]
BATTLE_B_MELODY = [
    ('G4', 1), ('C5', 1), ('E5', 2),                     # C
    ('D5', 1.5), ('B4', .5), ('G4', 2),                  # G
    ('A4', 1), ('D5', 1), ('F#5', 2),                    # D
    ('E5', 3), ('D5', 1),                                # Em
    ('E5', 1), ('G5', 1), ('E5', 1), ('C5', 1),          # C
    ('D5', 2), ('B4', 2),                                # G
    ('C5', 1), ('B4', 1), ('A4', 1), ('C5', 1),          # Am
    ('B4', 4),                                           # B
]
BATTLE_D_BRASS = [
    ('A4', 1), ('C5', 1), ('E5', 2), (R, 4),
    ('A4', 1), ('C5', 1), ('F5', 2), (R, 4),
    ('E5', 1), ('D5', 1), ('C5', 2), (R, 4),
    ('C5', 1), ('E5', 1), ('G5', 2), ('F#5', 2), ('D#5', 2),
]
BATTLE_D_STRINGS = [
    (R, 4), ('B4', .5), ('C5', .5), ('B4', .5), ('A4', .5), ('G4', 2),
    (R, 4), ('F#5', .5), ('E5', .5), ('D#5', .5), ('B4', .5), ('F#4', 2),
    (R, 4), ('B4', .5), ('G4', .5), ('E4', .5), ('G4', .5), ('B4', 2),
    (R, 4), ('F#5', 2), ('D#5', 2),
]

FULL_DRUMS = [(0, 'drum', .9, 95), (1.5, 'drum', .6, 120), (2, 'drum', .8, 95), (3, 'drum', .55, 130), (3.5, 'drum', .5, 130)]
BATTLE = {
    'bpm': BATTLE_BPM,
    'start': 'intro',
    'sections': {
        'intro': {'chords': ['Em', 'Em'], 'ostinato': True, 'pad': False, 'drums': FULL_DRUMS, 'shaker': True,
                  'boom_every': 1, 'parts': [], 'next': {'a': 1}},
        'a': {'chords': ['Em', 'C', 'D', 'B', 'Em', 'C', 'Am', 'B'], 'ostinato': True, 'pad': True, 'drums': FULL_DRUMS,
              'shaker': True, 'boom_every': 2, 'parts': [('brass', BATTLE_A_MELODY, 0.62, 0.0)], 'next': {'a2': 3, 'b': 2}},
        'a2': {'chords': ['Em', 'C', 'D', 'B', 'Em', 'C', 'Am', 'B'], 'ostinato': True, 'pad': True, 'drums': FULL_DRUMS,
               'shaker': True, 'snare': True, 'boom_every': 2,
               'parts': [('strings_hi', transpose(BATTLE_A_MELODY, 12), 0.5, 0.25), ('brass', BATTLE_A2_COUNTER, 0.45, -0.2)],
               'next': {'b': 1, 'd': 1}},
        'b': {'chords': ['C', 'G', 'D', 'Em', 'C', 'G', 'Am', 'B'], 'ostinato': True, 'pad': True,
              'drums': [(0, 'drum', .8, 100), (2, 'drum', .65, 100)], 'shaker': True, 'snare': True, 'boom_every': 4,
              'timpani_every': 4, 'parts': [('brass', BATTLE_B_MELODY, 0.66, 0.0)], 'next': {'a': 2, 'c': 1, 'd': 1}},
        'c': {'chords': ['Em', 'F', 'Em', 'F', 'D', 'C', 'B', 'B'], 'ostinato': 'drone', 'pad': 'tremolo',
              'drums': [(0, 'drum', .7, 80), (.75, 'drum', .45, 90), (1.5, 'drum', .55, 85), (2.5, 'drum', .6, 80), (3, 'drum', .5, 95)],
              'shaker': False, 'boom_every': 1, 'stabs': ['F'], 'roll_last': 2, 'parts': [], 'next': {'a': 3, 'a2': 2}},
        'd': {'chords': ['Am', 'Em', 'F', 'B', 'Am', 'Em', 'C', 'B'], 'ostinato': True, 'pad': True, 'drums': FULL_DRUMS,
              'shaker': True, 'snare': True, 'boom_every': 2,
              'parts': [('brass', BATTLE_D_BRASS, 0.64, -0.1), ('strings_hi', BATTLE_D_STRINGS, 0.52, 0.25)],
              'next': {'b': 1, 'c': 1}},
    },
}

# ----------------------------------------------------------------------------------------------
# stings
# ----------------------------------------------------------------------------------------------
VICTORY = {
    'bpm': 96,
    'chords': [('E', 2), ('E', 2), ('A', 1), ('B', 1), ('E', 6)],
    'parts': [('brass', [('B3', .5), ('E4', .5), ('G#4', .5), ('B4', .5), ('E5', 2), ('C#5', 1), ('D#5', 1), ('E5', 6)], 0.72, 0.0),
              ('strings_hi', [(R, 2), ('B4', 2), ('C#5', 1), ('B4', 1), ('B4', 6)], 0.4, 0.3),
              ('celesta', [(R, 6), ('E6', 1), ('G#6', 1), ('B6', 1), ('E7', 3)], 0.35, -0.3)],
    'timpani': [(0, .5), (1.75, .45), (2, .7), (4, .6), (5, .7), (5.25, .5), (5.5, .55), (5.75, .65), (6, 1.0)],
}
DEFEAT = {
    'bpm': 60,
    'chords': [('Em', 1), ('Am', 1), ('C', 1), ('B', 1), ('Em', 5)],
    'parts': [('cello', [('B3', 1), ('A3', 1), ('G3', 1), ('F#3', 1), ('E3', 5)], 0.62, -0.2),
              ('flute', [('G4', 2), ('B4', 1), ('A4', 1), ('G4', 1), ('F#4', 1), ('E4', 3)], 0.4, 0.25)],
    'timpani': [(0, .45), (4, .6)],
}
