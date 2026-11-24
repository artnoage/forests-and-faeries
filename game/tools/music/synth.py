"""A small offline synthesizer for the game's music and sound effects (numpy only).

Instruments are additive or FM models rendered note by note; a section is mixed in
stereo, sent through a synthetic convolution reverb and returned as float arrays.
Nothing here is sampled: every sound is computed from these formulas.
"""
from __future__ import annotations

import math
import re

import numpy as np

SR = 48000
RNG = np.random.default_rng(20261124)
NOTE_RE = re.compile(r'^([A-G])([#b]?)(-?\d)$')
SEMI = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def midi(name):
    """'A4' -> 69, 'Bb2' -> 46, 'F#3' -> 54."""
    if isinstance(name, (int, float)):
        return name
    m = NOTE_RE.match(name)
    if not m:
        raise ValueError(f'bad note {name!r}')
    letter, acc, octave = m.groups()
    return 12 * (int(octave) + 1) + SEMI[letter] + (1 if acc == '#' else -1 if acc == 'b' else 0)


def hz(note):
    return 440.0 * 2 ** ((midi(note) - 69) / 12)


def env_adsr(n, attack, decay, sustain, release, hold):
    """Attack/decay/sustain for `hold` seconds, then release; n samples in all."""
    t = np.arange(n) / SR
    e = np.where(t < attack, t / max(attack, 1e-4), 1.0)
    d = np.clip((t - attack) / max(decay, 1e-4), 0, 1)
    e = np.where(t >= attack, 1 - (1 - sustain) * d, e)
    rel = np.clip((t - hold) / max(release, 1e-4), 0, 1)
    level_at_hold = e
    e = np.where(t > hold, level_at_hold * (1 - rel) ** 2, e)
    return e


def _phase(f0, n, vib_rate=0.0, vib_depth=0.0, vib_delay=0.0, scoop=0.0, scoop_time=0.05, drift=0.0):
    """Instantaneous phase (radians) of a slightly alive pitch: vibrato, an attack scoop, drift."""
    t = np.arange(n) / SR
    f = np.full(n, f0)
    if vib_depth:
        ramp = np.clip((t - vib_delay) / 0.35, 0, 1)
        f = f * (1 + vib_depth * ramp * np.sin(2 * np.pi * vib_rate * t + RNG.uniform(0, 6.28)))
    if scoop:
        f = f * 2 ** (scoop / 1200 * np.exp(-t / scoop_time))
    if drift:
        f = f * (1 + drift * np.sin(2 * np.pi * 0.17 * t + RNG.uniform(0, 6.28)))
    return 2 * np.pi * np.cumsum(f) / SR


def _bandlimit(f0, nmax, top=11000.0):
    return max(1, min(nmax, int(top / f0)))


# --- Instruments: each returns a mono float array for (frequency, held seconds, velocity) ----------

def pluck(f0, dur, vel=0.8, bright=1.0, ring=1.0):
    """A harp or nylon string: inharmonic partials, the higher ones dying first."""
    tau1 = 1.9 * ring * (220 / f0) ** 0.35
    n = int((dur + min(4.0, tau1 * 2.5)) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    pos = 0.18
    for k in range(1, _bandlimit(f0, 28, 9000) + 1):
        fk = k * f0 * math.sqrt(1 + 0.00012 * k * k)
        amp = abs(math.sin(math.pi * k * pos)) / k ** (1.35 - 0.25 * bright)
        tau = tau1 / (1 + 0.55 * (k - 1) ** 1.1)
        out += amp * np.exp(-t / tau) * np.sin(2 * np.pi * fk * t + RNG.uniform(0, 0.3))
    out *= np.minimum(1, t / 0.0025)
    damp = np.clip((t - dur) / 0.25, 0, 1)        # a hand stops the string after its value
    out *= 1 - 0.85 * damp
    return vel * out / 2.2


def strings(f0, dur, vel=0.6, attack=0.5, release=1.0, voices=3, bright=0.6, tremolo=0.0):
    """A string section: detuned bowed saws, lowpassed, with vibrato (sustained pads too)."""
    n = int((dur + release) * SR)
    out = np.zeros(n)
    top = 2200 + 3800 * bright
    for v in range(voices):
        cents = (v - (voices - 1) / 2) * 7.5
        ph = _phase(f0 * 2 ** (cents / 1200), n, vib_rate=5.1 + 0.4 * v, vib_depth=0.0035, vib_delay=0.15, drift=0.0008)
        kmax = _bandlimit(f0, 40, top * 1.6)
        for k in range(1, kmax + 1):
            amp = (1 / k) / (1 + (k * f0 / top) ** 2)
            out += amp * np.sin(k * ph + v * 1.3 * k)
    e = env_adsr(n, attack, 0.3, 0.85, release, dur)
    if tremolo:
        t = np.arange(n) / SR
        e = e * (1 - 0.45 * (0.5 + 0.5 * np.sin(2 * np.pi * tremolo * t)))
    rosin = _bandnoise(n, 2500, 7000) * 0.02 * e      # bow noise, kept out of the low end
    return vel * (out * e / voices / 1.8 + rosin)


def flute(f0, dur, vel=0.7):
    """A wooden flute: near-sine with soft harmonics, breath and a delayed vibrato."""
    n = int((dur + 0.18) * SR)
    ph = _phase(f0, n, vib_rate=5.0, vib_depth=0.006, vib_delay=0.28, scoop=-14, scoop_time=0.03)
    tone = np.sin(ph) + 0.22 * np.sin(2 * ph + 0.4) + 0.07 * np.sin(3 * ph + 1.1) + 0.03 * np.sin(4 * ph)
    e = env_adsr(n, 0.06, 0.12, 0.82, 0.16, dur)
    breath = _bandnoise(n, f0 * 0.9, f0 * 3.2) * 0.07
    chiff = _bandnoise(n, 1800, 6000) * np.exp(-np.arange(n) / SR / 0.03) * 0.12
    return vel * (tone * e * 0.55 + breath * e + chiff)


def brass(f0, dur, vel=0.75, bright=1.0):
    """A horn section: harmonic series whose brightness follows the loudness, an attack scoop."""
    n = int((dur + 0.25) * SR)
    e = env_adsr(n, 0.045, 0.18, 0.78, 0.22, dur)
    out = np.zeros(n)
    for v, cents in enumerate((-5, 4)):
        ph = _phase(f0 * 2 ** (cents / 1200), n, vib_rate=5.4, vib_depth=0.003, vib_delay=0.3, scoop=-35, scoop_time=0.035)
        for k in range(1, _bandlimit(f0, 24, 7000) + 1):
            rolloff = np.exp(-(k - 1) / (0.9 + 5.5 * bright * e))
            out += rolloff * np.sin(k * ph + 0.7 * k * v) / k ** 0.35
    return vel * out * e / 6.5


def cello(f0, dur, vel=0.7, short=False):
    """One low bowed string, for ostinatos and counter-lines."""
    attack, release = (0.012, 0.09) if short else (0.07, 0.35)
    n = int((dur + release) * SR)
    ph = _phase(f0, n, vib_rate=5.6, vib_depth=0.0 if short else 0.004, vib_delay=0.2)
    out = np.zeros(n)
    for k in range(1, _bandlimit(f0, 30, 5000) + 1):
        formant = 1 + 1.4 * np.exp(-((k * f0 - 600) / 450) ** 2)   # a wooden body resonance
        out += formant / k * np.sin(k * ph)
    e = env_adsr(n, attack, 0.08 if short else 0.2, 0.55 if short else 0.85, release, dur)
    bow = _bandnoise(n, 2000, 7000) * 0.04 * e
    return vel * (out * e / 3.2 + bow)


def bell(f0, dur, vel=0.6, ratio=3.5, index=3.5, decay=1.6):
    """A celesta or small bell: FM with a decaying index."""
    n = int((dur + decay * 2.2) * SR)
    t = np.arange(n) / SR
    idx = index * np.exp(-t / (decay * 0.35)) + 0.3
    mod = np.sin(2 * np.pi * f0 * ratio * t)
    car = np.sin(2 * np.pi * f0 * t + idx * mod)
    car += 0.25 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t / (decay * 0.3))
    e = np.exp(-t / decay) * np.minimum(1, t / 0.002)
    return vel * car * e * 0.55


def bass(f0, dur, vel=0.7):
    """A round low bass (soft attack, three partials)."""
    n = int((dur + 0.25) * SR)
    ph = _phase(f0, n)
    tone = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    e = env_adsr(n, 0.012, 0.4, 0.6, 0.2, dur)
    return vel * tone * e * 0.7


# --- Percussion -------------------------------------------------------------------------------------

def timpani(f0, vel=0.8, dur=2.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for ratio, amp, tau in ((1.0, 1.0, 0.9), (1.5, 0.5, 0.6), (1.98, 0.35, 0.45), (2.44, 0.2, 0.35), (2.9, 0.12, 0.25)):
        f = f0 * ratio * (1 + 0.04 * np.exp(-t / 0.05))
        out += amp * np.exp(-t / tau) * np.sin(2 * np.pi * np.cumsum(f) / SR)
    thump = _lowpassed_noise(n, 400) * np.exp(-t / 0.03) * 0.9
    return vel * (out + thump) * np.minimum(1, t / 0.0015) * 0.6


def frame_drum(f0=110, vel=0.7, dur=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (1 + 0.9 * np.exp(-t / 0.018))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    skin = _bandnoise(n, 300, 3000) * np.exp(-t / 0.035) * 0.55
    return vel * (body + skin) * 0.8


def low_boom(vel=0.8, dur=2.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 52 * (1 + 0.8 * np.exp(-t / 0.06))
    return vel * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55) * np.minimum(1, t / 0.004)


def shaker(vel=0.35, dur=0.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = np.minimum(1, t / 0.012) * np.exp(-t / 0.035)
    return vel * _bandnoise(n, 5000, 13000) * e * 0.6


def snare(vel=0.6, dur=0.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    rattle = _bandnoise(n, 1500, 9000) * np.exp(-t / 0.09)
    return vel * (0.5 * tone + rattle) * 0.6


# --- Filters, reverb, mixing ------------------------------------------------------------------------

def _fft_filter(x, lo=None, hi=None, slope=4.0):
    """Zero-phase band shaping in the frequency domain (smooth Butterworth-like edges)."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    gain = np.ones_like(f)
    if lo:
        gain *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * slope))
    if hi:
        gain *= 1 / np.sqrt(1 + (f / hi) ** (2 * slope))
    return np.fft.irfft(spec * gain, len(x))


def _bandnoise(n, lo, hi):
    if n <= 0:
        return np.zeros(0)
    x = _fft_filter(RNG.standard_normal(n), lo, hi)
    return x / (np.std(x) + 1e-9) * 0.35


def _lowpassed_noise(n, hi):
    x = _fft_filter(RNG.standard_normal(n), None, hi)
    return x / (np.std(x) + 1e-9) * 0.35


def lowpass(x, hi, slope=2.0):
    return _fft_filter(x, None, hi, slope)


def highpass(x, lo, slope=2.0):
    return _fft_filter(x, lo, None, slope)


def impulse_response(seconds=2.6, damping=1.0, seed=7):
    """A stereo hall: early reflections, then decorrelated noise decaying faster in the treble."""
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    channels = []
    for ch in range(2):
        tail = np.zeros(n)
        for lo, hi, tau in ((None, 700, 0.75 * seconds / 2.6), (700, 3500, 0.55 * seconds / 2.6), (3500, None, 0.28 * seconds / 2.6 / damping)):
            band = _fft_filter(rng.standard_normal(n), lo, hi)
            tail += band * np.exp(-t / tau)
        tail *= np.minimum(1, t / 0.025)
        for ms, g in ((7 + 3 * ch, 0.5), (13 + 4 * ch, 0.38), (21 - 2 * ch, 0.3), (33 + 5 * ch, 0.22), (47, 0.15)):
            tail[int(ms * SR / 1000)] += g * 6
        channels.append(tail / np.sqrt(np.sum(tail ** 2)))
    return np.stack(channels)


def convolve(x, ir):
    """FFT convolution of a mono or stereo signal with a stereo impulse response."""
    if x.ndim == 1:
        x = np.stack([x, x])
    n = x.shape[1] + ir.shape[1] - 1
    size = 1 << (n - 1).bit_length()
    out = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:, :n]
    return out


def pan(x, position):
    """Constant-power pan, position -1 (left) .. 1 (right)."""
    a = (position + 1) * math.pi / 4
    return np.stack([x * math.cos(a), x * math.sin(a)])


class Mix:
    """A stereo bus with a reverb send: add(sound, at_seconds, pan, send)."""

    def __init__(self, seconds):
        self.n = int(seconds * SR)
        self.dry = np.zeros((2, self.n))
        self.wet = np.zeros((2, self.n))

    def add(self, sound, at, position=0.0, send=0.25, gain=1.0):
        start = max(0, int(round(at * SR)))
        if start >= self.n or len(sound) == 0:
            return
        sound = sound[: self.n - start] * gain
        st = pan(sound, position)
        self.dry[:, start:start + st.shape[1]] += st * (1 - 0.35 * send)
        self.wet[:, start:start + st.shape[1]] += st * send

    def render(self, ir):
        wet = convolve(self.wet.mean(axis=0), ir)[:, : self.n]
        return self.dry + wet * 1.15


def master_eq(x, presence=4.0, mud=-3.0, air=2.0):
    """The mix bus: a 30 Hz high-pass, a dip in the low-mid mud around 220 Hz, a presence
    shelf from about 2.5 kHz and a little air above 8 kHz."""
    spec = np.fft.rfft(x, axis=-1)
    f = np.maximum(np.fft.rfftfreq(x.shape[-1], 1 / SR), 1e-3)
    db = mud * np.exp(-np.log2(f / 220) ** 2 / (2 * 0.8 ** 2)) + presence / (1 + (2500 / f) ** 2) + air / (1 + (8000 / f) ** 4)
    gain = 10 ** (db / 20) / np.sqrt(1 + (30 / f) ** 8)
    return np.fft.irfft(spec * gain, x.shape[-1], axis=-1)


def fade_tail(x, seconds=0.4):
    n = int(seconds * SR)
    x = x.copy()
    x[..., -n:] *= np.linspace(1, 0, n) ** 2
    return x


def soft_limit(x, ceiling=0.89):
    """Peaks above the knee are bent smoothly under the ceiling (no hard clipping)."""
    knee = ceiling * 0.8
    y = x.copy()
    over = np.abs(y) > knee
    y[over] = np.sign(y[over]) * (knee + (ceiling - knee) * np.tanh((np.abs(y[over]) - knee) / (ceiling - knee)))
    return y


def write_wav(path, stereo):
    """16-bit PCM WAV (stereo or mono), dithered."""
    import wave
    x = np.atleast_2d(stereo)
    pcm = np.clip(x + RNG.uniform(-1, 1, x.shape) / 32768, -1, 1)
    data = (pcm.T * 32767).astype('<i2').tobytes()
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(x.shape[0])
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)
