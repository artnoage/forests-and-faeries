/* Forests and Faeries sound: battle effects, the composed music and the heroes' lines.
 *
 * Everything is in audio/ (sound.json lists it). Nothing is fetched or played before the
 * player's first click or key press: the AudioContext is created on that gesture. Music is
 * written in sections (game/tools/music/scores.py) that are sequenced here bar line to bar
 * line from a transition table, so it does not repeat as one fixed loop. Preferences (sound
 * on/off and the music, effects and voice volumes) are kept in localStorage under ff-sound.
 * Every hero line is also shown as a caption, so the lines work with sound off. */
(() => {
  'use strict';

  const base = new URL('./', window.location.href);
  const audioURL = rel => new URL(`audio/${rel}`, base).href;
  const $ = id => document.getElementById(id);
  const KEY = 'ff-sound';
  const DEFAULTS = { on: true, music: 0.45, sfx: 0.8, voice: 0.9 };
  const HEROES = { guy: 'Guy', elion: 'Elion', curogana: 'Curogana', chruna: 'Chruna', mara: 'Mara', ilyra: 'Ilyra' };
  const SPELL_STYLES = new Set(['necrotic', 'magic_missile', 'shatter', 'chromatic_orb', 'firebolt', 'fire_bolt', 'thunderwave',
    'burning_hands', 'sacred_flame', 'guiding_bolt', 'sorcerous_burst', 'divine_spark', 'turn_undead', 'spiritual_weapon',
    'ray_of_frost', 'acid_splash', 'scorching_ray', 'dragons_breath', 'command', 'sleep', 'buff']);

  function loadPrefs() {
    let saved = null;
    try { saved = JSON.parse(window.localStorage.getItem(KEY) || 'null'); } catch { saved = null; }
    const p = { ...DEFAULTS };
    if (saved && typeof saved === 'object') {
      if (typeof saved.on === 'boolean') p.on = saved.on;
      for (const k of ['music', 'sfx', 'voice']) if (Number.isFinite(saved[k])) p[k] = Math.min(1, Math.max(0, saved[k]));
    }
    return p;
  }
  const prefs = loadPrefs();
  function savePrefs() { try { window.localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* private window */ } }

  let ctx = null, master = null, musicBus = null, sfxBus = null, voiceBus = null;
  let manifest = null, manifestLoad = null;
  const buffers = new Map();           // file -> Promise<AudioBuffer|null>
  const lastPlayed = new Map();        // sfx name -> ctx time
  let wantedMusic = null;              // 'calm' | 'battle' | null
  let current = null;                  // the piece playing: {name, gain, sources, nextAt, section, timer}
  const blockers = new Set();          // 'story' while a story layer plays its own sound
  let stingUntil = 0;

  // --- Context and buses --------------------------------------------------------------------
  function unlock() {
    if (ctx) { if (ctx.state === 'suspended' && !document.hidden) ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch { ctx = null; return; }
    master = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();     // a safety net when many sounds stack up
    limiter.threshold.value = -6; limiter.knee.value = 6; limiter.ratio.value = 8; limiter.attack.value = 0.003; limiter.release.value = 0.2;
    master.connect(limiter).connect(ctx.destination);
    musicBus = ctx.createGain(); sfxBus = ctx.createGain(); voiceBus = ctx.createGain();
    for (const bus of [musicBus, sfxBus, voiceBus]) bus.connect(master);
    applyVolumes(0);
    loadManifest().then(() => refreshMusic());
  }
  for (const type of ['pointerdown', 'keydown', 'touchend']) {
    window.addEventListener(type, unlock, { capture: true, passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });

  const curve = v => v * v;   // perceived loudness
  function applyVolumes(ramp = 0.25) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const set = (node, value) => { node.gain.cancelScheduledValues(t); node.gain.setTargetAtTime(value, t, ramp || 0.001); };
    set(master, prefs.on ? 1 : 0);
    set(musicBus, blockers.size ? 0 : curve(prefs.music));
    set(sfxBus, curve(prefs.sfx));
    set(voiceBus, blockers.size ? 0 : curve(prefs.voice));
  }

  function loadManifest() {
    if (!manifestLoad) {
      manifestLoad = fetch(audioURL('sound.json'), { credentials: 'same-origin', cache: 'no-cache' })
        .then(r => (r.ok ? r.json() : null)).then(m => { manifest = m; return m; }).catch(() => null);
    }
    return manifestLoad;
  }

  function buffer(file) {
    if (!buffers.has(file)) {
      buffers.set(file, fetch(audioURL(file), { credentials: 'same-origin' })
        .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then(data => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
        .catch(() => { buffers.delete(file); return null; }));
    }
    return buffers.get(file);
  }

  // --- Effects --------------------------------------------------------------------------------
  async function sfx(name, { gain = 1, delay = 0, rate = 0 } = {}) {
    if (!ctx || !prefs.on || !manifest?.sfx?.[name]) return;
    const now = ctx.currentTime;
    if (now - (lastPlayed.get(name) || -1) < 0.06) return;
    lastPlayed.set(name, now);
    const buf = await buffer(manifest.sfx[name]);
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 1 + (rate || (Math.random() - 0.5) * 0.08);
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g).connect(sfxBus);
    src.start(ctx.currentTime + delay);
  }

  // --- Music ----------------------------------------------------------------------------------
  function pickNext(next) {
    const entries = Object.entries(next || {});
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [k, w] of entries) { r -= w; if (r <= 0) return k; }
    return entries[0]?.[0];
  }

  function stopPiece(fade = 1.2) {
    if (!current) return;
    const old = current;
    current = null;
    window.clearTimeout(old.timer);
    const t = ctx.currentTime;
    old.gain.gain.cancelScheduledValues(t);
    old.gain.gain.setValueAtTime(old.gain.gain.value, t);
    old.gain.gain.linearRampToValueAtTime(0, t + fade);
    window.setTimeout(() => { for (const s of old.sources) { try { s.stop(); } catch { /* ended */ } } old.gain.disconnect(); }, fade * 1000 + 100);
  }

  async function startPiece(name) {
    const piece = manifest?.pieces?.[name];
    if (!ctx || !piece || current?.name === name) return;
    stopPiece(1.6);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(musicBus);
    const me = { name, gain, sources: [], nextAt: 0, section: piece.start, timer: 0 };
    current = me;
    // Release the other piece's decoded sections; decode this piece's before the first bar.
    for (const [other, p] of Object.entries(manifest.pieces)) {
      if (other !== name) for (const s of Object.values(p.sections)) buffers.delete(s.file);
    }
    await Promise.all(Object.values(piece.sections).map(s => buffer(s.file)));
    if (current !== me) return;
    me.nextAt = ctx.currentTime + 0.15;
    gain.gain.setValueAtTime(0, me.nextAt);
    gain.gain.linearRampToValueAtTime(1, me.nextAt + 2.5);
    schedule(me, piece);
  }

  async function schedule(me, piece) {
    while (current === me && me.nextAt < ctx.currentTime + 8) {
      const sec = piece.sections[me.section];
      const buf = sec && await buffer(sec.file);
      if (current !== me) return;
      if (!buf) { me.section = piece.start; break; }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(me.gain);
      const when = Math.max(me.nextAt, ctx.currentTime + 0.05);
      src.start(when);
      me.sources.push(src);
      src.onended = () => { me.sources = me.sources.filter(s => s !== src); };
      me.nextAt = when + sec.length;   // the next section starts on this one's last bar line
      me.section = pickNext(sec.next);
    }
    if (current === me) me.timer = window.setTimeout(() => schedule(me, piece), 1500);
  }

  function refreshMusic() {
    if (!ctx || !manifest) return;
    if (!wantedMusic || ctx.currentTime < stingUntil) {
      if (!wantedMusic) stopPiece(1.5);
      return;
    }
    startPiece(wantedMusic);
  }

  async function sting(name) {
    if (!ctx || !manifest?.stings?.[name]) return;
    stopPiece(0.8);
    const buf = await buffer(manifest.stings[name].file);
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(musicBus);
    const when = ctx.currentTime + 0.25;
    src.start(when);
    stingUntil = when + buf.duration + 1.5;
    window.setTimeout(refreshMusic, (buf.duration + 2) * 1000);
  }

  // --- Hero lines -----------------------------------------------------------------------------
  const recentLines = new Map();       // hero -> [indices]
  let lastBarkAt = -1e9, heroTurnsSinceBark = 9, captionTimer = 0;

  const heroKey = unit => {
    const raw = String(unit?.base_id || unit?.content || unit?.id || '').toLowerCase().replace(/_l\d+$/, '');
    return HEROES[raw] ? raw : Object.keys(HEROES).find(k => raw.startsWith(k)) || null;
  };

  function showCaption(name, text, ms) {
    const el = $('voice-caption');
    if (!el) return;
    el.textContent = '';
    const who = document.createElement('b');
    who.textContent = name;
    el.append(who, ` “${text}”`);
    el.hidden = false;
    el.classList.remove('is-fading');
    window.clearTimeout(captionTimer);
    captionTimer = window.setTimeout(() => { el.classList.add('is-fading'); captionTimer = window.setTimeout(() => { el.hidden = true; }, 400); }, ms);
  }

  async function bark(unit, kind) {
    const key = heroKey(unit);
    const lines = manifest?.voices?.[key]?.lines?.[kind];
    if (!lines?.length || blockers.size) return false;
    const recent = recentLines.get(key) || [];
    const pool = lines.map((l, i) => i).filter(i => !recent.includes(`${kind}${i}`));
    const index = (pool.length ? pool : lines.map((l, i) => i))[Math.floor(Math.random() * (pool.length || lines.length))];
    recentLines.set(key, [...recent, `${kind}${index}`].slice(-4));
    const line = lines[index];
    lastBarkAt = performance.now();
    heroTurnsSinceBark = 0;
    let ms = 2600 + line.text.length * 45;
    if (ctx && prefs.on && prefs.voice > 0) {
      const buf = await buffer(line.file);
      if (buf) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(voiceBus);
        src.start(ctx.currentTime + 0.05);
        ms = Math.max(ms, buf.duration * 1000 + 900);
      }
    }
    showCaption(manifest.voices[key].name || HEROES[key], line.text, ms);
    return true;
  }

  // Not every turn: a line now and then, never two close together.
  function heroTurn(unit) {
    if (!heroKey(unit)) return;
    sfx('turn', { gain: 0.5 });
    heroTurnsSinceBark += 1;
    const quiet = performance.now() - lastBarkAt;
    if (heroTurnsSinceBark >= 2 && quiet > 16000 && Math.random() < 0.4) bark(unit, 'turn');
  }
  function heroMoment(unit, kind) {
    const chance = { crit: 0.6, kill: 0.45, hurt: 0.75 }[kind] || 0;
    if (heroKey(unit) && performance.now() - lastBarkAt > 9000 && Math.random() < chance) bark(unit, kind);
  }

  // --- The game's events (app.js) -------------------------------------------------------------
  const isHero = u => u?.team === 'heroes' || !!heroKey(u);
  function unitsOf(snapshot) { return new Map((snapshot?.units || []).map(u => [u.id, u])); }

  function recordStart(rec) {
    if (!ctx) return;
    const draws = Array.isArray(rec?.draws) ? rec.draws : [];
    if (draws.length) sfx('dice', { gain: 0.55 });
    const effects = Array.isArray(rec?.effects) ? rec.effects : [];
    if (/spell|cast/.test(String(rec?.kind || '')) || effects.some(e => e.type === 'heal' || SPELL_STYLES.has(e.style))) {
      sfx('cast', { gain: 0.7, delay: 0.05 });
    }
  }

  function recordImpact(rec, roster) {
    if (!ctx) return;
    const effects = Array.isArray(rec?.effects) ? rec.effects : [];
    const kinds = new Set();
    let critBy = null;
    for (const e of effects) {
      if (e.type === 'heal') kinds.add('heal');
      else if (e.type === 'attack' && e.outcome === 'miss') kinds.add('miss');
      else if (e.type === 'attack' && e.outcome === 'hit' && Number(e.amount) > 0) {
        if (e.crit) { kinds.add('crit'); critBy = critBy || e.source_id; } else kinds.add('hit');
      }
    }
    let delay = 0;
    for (const k of ['crit', 'hit', 'miss', 'heal']) {
      if (kinds.has(k)) { sfx(k, { gain: k === 'miss' ? 0.75 : 0.9, delay }); delay += 0.07; }
    }
    const before = unitsOf(rec?.before), after = unitsOf(rec?.after);
    const lookup = id => after.get(id) || before.get(id) || roster?.get?.(id);
    for (const [id, u] of after) {
      const was = before.get(id);
      if (!was) continue;
      const wasUp = Number(was.hp) > 0 && !was.dead, isDown = Number(u.hp) <= 0 || u.dead;
      if (wasUp && isDown) {
        sfx('fall', { gain: 0.85, delay: delay + 0.12 });
        const killer = effects.find(e => e.target_id === id && e.source_id)?.source_id;
        if (!isHero(lookup(id)) && killer && isHero(lookup(killer))) heroMoment(lookup(killer), 'kill');
      } else if (isHero(lookup(id)) && Number(u.max_hp) > 0 && Number(u.hp) > 0) {
        const frac = Number(u.hp) / Number(u.max_hp), wasFrac = Number(was.hp) / Number(was.max_hp || u.max_hp);
        if (frac <= 0.3 && wasFrac > 0.3) heroMoment(lookup(id), 'hurt');
      }
    }
    if (critBy && isHero(lookup(critBy))) heroMoment(lookup(critBy), 'crit');
  }

  // The music follows the screen: calm on the start screen and while placing figures,
  // the battle theme during a fight, a sting at its end; nothing while a story scene plays.
  function scene(name) {
    const wanted = name === 'menu' || name === 'setup' ? 'calm' : name === 'finished' ? null : name ? 'battle' : null;
    if (name === 'finished') return;
    if (wanted !== wantedMusic) { wantedMusic = wanted; refreshMusic(); }
  }
  function finish(outcome) {
    wantedMusic = 'calm';
    if (outcome === 'win') sting('victory');
    else if (outcome === 'loss') sting('defeat');
    else refreshMusic();
  }
  function setBlocked(reason, on) {
    if (on) blockers.add(reason); else blockers.delete(reason);
    applyVolumes(0.4);
  }

  // --- The HUD control --------------------------------------------------------------------------
  function syncControls() {
    const button = $('sound-button');
    if (!button) return;
    button.textContent = prefs.on ? '🔊' : '🔇';
    button.setAttribute('aria-label', prefs.on ? 'Sound on: open the sound settings' : 'Sound off: open the sound settings');
    $('sound-on').checked = prefs.on;
    for (const k of ['music', 'sfx', 'voice']) $(`sound-${k}`).value = String(Math.round(prefs[k] * 100));
    for (const k of ['music', 'sfx', 'voice']) $(`sound-${k}`).disabled = !prefs.on;
    const quick = $('start-sound-btn');   // the same switch, on the start screen (which covers the HUD)
    if (quick) { quick.textContent = prefs.on ? '🔊 Sound on' : '🔇 Sound off'; quick.setAttribute('aria-pressed', String(prefs.on)); }
  }
  function setOn(on) {
    prefs.on = Boolean(on);
    savePrefs();
    syncControls();
    applyVolumes();
    document.dispatchEvent(new CustomEvent('ff:sound', { detail: { on: prefs.on } }));
  }
  $('sound-button')?.addEventListener('click', () => {
    const pod = $('sound-pod');
    pod.hidden = !pod.hidden;
    $('sound-button').setAttribute('aria-expanded', String(!pod.hidden));
  });
  $('sound-on')?.addEventListener('change', e => setOn(e.target.checked));
  $('start-sound-btn')?.addEventListener('click', () => setOn(!prefs.on));
  for (const k of ['music', 'sfx', 'voice']) {
    $(`sound-${k}`)?.addEventListener('input', e => {
      prefs[k] = Math.min(1, Math.max(0, Number(e.target.value) / 100));
      savePrefs();
      applyVolumes(0.05);
    });
  }
  $('sound-sfx')?.addEventListener('change', () => sfx('hit', { gain: 0.9 }));
  $('sound-voice')?.addEventListener('change', () => {
    const key = Object.keys(HEROES)[Math.floor(Math.random() * 6)];
    bark({ id: key }, 'turn');
  });
  document.addEventListener('click', e => {
    const pod = $('sound-pod');
    if (pod && !pod.hidden && !e.target.closest('#sound-pod, #sound-button')) {
      pod.hidden = true;
      $('sound-button').setAttribute('aria-expanded', 'false');
    }
  });
  syncControls();

  // While a story scene or map is open it plays its own narration and music.
  const storyLayer = $('story-layer');
  if (storyLayer) {
    const watchLayer = () => setBlocked('story', !storyLayer.hidden);
    new MutationObserver(watchLayer).observe(storyLayer, { attributes: true, attributeFilter: ['hidden'] });
    watchLayer();
  }

  window.FFSound = {
    isOn: () => prefs.on,
    setOn,
    prefs: () => ({ ...prefs }),
    scene,
    finish,
    recordStart,
    recordImpact,
    heroTurn,
    setBlocked,
    sfx: (name, opts) => sfx(name, opts),
    say: (unit, kind = 'turn') => bark(unit, kind),
    // Tests: what is loaded and playing.
    status: () => ({ unlocked: !!ctx, state: ctx?.state || 'none', manifest: !!manifest, music: current?.name || null,
      wanted: wantedMusic, sources: current?.sources.length || 0, blocked: [...blockers], time: ctx?.currentTime || 0 }),
  };
})();
