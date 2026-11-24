"""Battle sound effects, synthesized (no recordings): each returns a stereo float array."""
from __future__ import annotations

import numpy as np

from game.tools.music import synth
from game.tools.music.synth import RNG, SR, hz


def _n(seconds):
    return int(seconds * SR)


def _t(n):
    return np.arange(n) / SR


def _norm(x, peak=0.7):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def _room(x, send=0.18, seconds=0.9):
    ir = synth.impulse_response(seconds, damping=1.4, seed=11)
    wet = synth.convolve(x, ir)[:, : len(x)]
    out = synth.fade_tail(np.stack([x, x]) * (1 - send) + wet * send * 3, 0.05)
    return out / (np.max(np.abs(out)) + 1e-9) * 0.89


def dice():
    """A handful of dice on a wooden table: bounces closing up and fading."""
    n = _n(0.75)
    out = np.zeros(n)
    t0, gap, vel = 0.0, 0.085, 1.0
    for i in range(9):
        for die in range(2):
            at = _n(t0 + die * 0.011 + RNG.uniform(0, 0.006))
            m = _n(0.05)
            tt = _t(m)
            f = RNG.uniform(1700, 2900)
            clack = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.006) + 0.6 * np.sin(2 * np.pi * f * 1.62 * tt) * np.exp(-tt / 0.004)
            knock = synth._bandnoise(m, 300, 2200) * np.exp(-tt / 0.012) * 1.6
            out[at:at + m] += (clack * 0.5 + knock) * vel * (0.8 if die else 1.0)
        t0 += gap
        gap *= 0.78
        vel *= 0.8
        if t0 > 0.6:
            break
    return _room(_norm(out, 0.75), 0.12)


def hit():
    """A weapon striking home: a low thud, a short smack and a little grit."""
    n = _n(0.4)
    t = _t(n)
    f = 140 * (1 + 0.8 * np.exp(-t / 0.02))
    thud = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07)
    smack = synth._bandnoise(n, 900, 5000) * np.exp(-t / 0.018) * 1.6
    grit = synth._bandnoise(n, 2500, 9000) * np.exp(-t / 0.05) * 0.35
    return _room(_norm(thud + smack + grit, 0.85), 0.12)


def miss():
    """A blade cutting air: a falling band of noise."""
    n = _n(0.42)
    t = _t(n)
    noise = RNG.standard_normal(n)
    spec = np.fft.rfft(noise)
    out = np.zeros(n)
    for k, (lo, hi) in enumerate(((2600, 5200), (1600, 3600), (900, 2400), (500, 1500))):
        band = synth._fft_filter(noise, lo, hi)
        w = np.exp(-((t - 0.05 - k * 0.06) / 0.05) ** 2)
        out += band * w
    del spec
    return _room(_norm(out, 0.6), 0.1)


def crit():
    """A critical hit: the hit, a bright ring of steel and a low swell."""
    h = hit()[0]
    n = _n(1.2)
    t = _t(n)
    ring = synth.bell(1240, 0.05, 0.9, ratio=2.73, index=2.5, decay=0.45)[:n]
    ring = np.pad(ring, (0, max(0, n - len(ring))))
    swell = np.sin(2 * np.pi * 73 * t) * np.exp(-t / 0.35) * np.minimum(1, t / 0.01) * 0.8
    out = np.pad(h, (0, n - len(h))) + ring * 0.55 + swell
    return _room(_norm(out, 0.9), 0.2)


def cast():
    """A spell: a rising shimmer of fifths with sparkle."""
    n = _n(0.95)
    t = _t(n)
    out = np.zeros(n)
    for k, ratio in enumerate((1, 1.5, 2, 3, 4)):
        f = 330 * ratio * (1 + 0.35 * np.clip(t / 0.6, 0, 1))
        trem = 0.6 + 0.4 * np.sin(2 * np.pi * (9 + k) * t)
        out += np.sin(2 * np.pi * np.cumsum(f) / SR) * trem / (1 + k * 0.6)
    env = np.minimum(1, t / 0.12) * np.exp(-np.clip(t - 0.35, 0, None) / 0.22)
    sparkle = synth._bandnoise(n, 6000, 14000) * env * 0.5
    return _room(_norm(out * env + sparkle, 0.6), 0.35, 1.4)


def heal():
    """Healing: a soft rising major arpeggio of bells over a warm swell."""
    n = _n(1.6)
    out = np.zeros(n)
    for i, note in enumerate(('C5', 'E5', 'G5', 'C6')):
        b = synth.bell(hz(note), 0.1, 0.6, ratio=2.0, index=1.2, decay=0.6)
        at = _n(i * 0.09)
        m = min(len(b), n - at)
        out[at:at + m] += b[:m]
    t = _t(n)
    swell = np.sin(2 * np.pi * hz('C4') * t) * np.sin(np.pi * np.clip(t / 1.2, 0, 1)) * 0.25
    return _room(_norm(out + swell, 0.6), 0.35, 1.4)


def fall():
    """A creature dropping: a heavy thump, a falling groan and a rattle."""
    n = _n(0.9)
    t = _t(n)
    f = 90 * (1 + 0.5 * np.exp(-t / 0.05))
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18)
    fall_tone = np.sin(2 * np.pi * np.cumsum(260 * np.exp(-t / 0.35)) / SR) * np.exp(-t / 0.25) * 0.35
    rattle = synth._bandnoise(n, 800, 4000) * np.exp(-((t - 0.12) / 0.08) ** 2) * 0.6
    return _room(_norm(thump + fall_tone + rattle, 0.8), 0.15)


def turn():
    """A hero's turn: a soft two-note chime."""
    n = _n(1.1)
    out = np.zeros(n)
    for i, note in enumerate(('G5', 'D6')):
        b = synth.bell(hz(note), 0.1, 0.5, ratio=3.0, index=1.0, decay=0.5)
        at = _n(i * 0.13)
        m = min(len(b), n - at)
        out[at:at + m] += b[:m]
    return _room(_norm(out, 0.45), 0.3, 1.2)


def render_all():
    return {'dice': dice(), 'hit': hit(), 'miss': miss(), 'crit': crit(), 'cast': cast(), 'heal': heal(),
            'fall': fall(), 'turn': turn()}
