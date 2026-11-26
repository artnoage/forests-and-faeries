/* Forests and Faeries story mode: the shared shell (docs/STORY_MODE.md).
 *
 * A story lives in story/<id>/ and is described by story/<id>/manifest.json: eight
 * chapters (each an ordinary catalogue level), a world map with a node per chapter,
 * and the scenes shown before and after each chapter. This file draws the map and
 * plays the scenes (the default renderer), or hands a full-viewport container to the
 * story's own ES module (manifest "module"). Fights start through the ordinary
 * server path (window.FFGame, app.js). Progress is kept in this browser only.
 *
 * Sound never starts before the player has clicked into a story, and every scene can
 * be read with sound off and skipped. */
(() => {
  'use strict';

  const STORIES = [
    { id: 'claude', label: 'Story — Claude' },
    { id: 'gemini', label: 'Story — Gemini' },
    { id: 'claude-faery', label: 'Faery tale — Claude' },
  ];
  const CHAPTERS = 8;
  const SOUND_KEY = 'ff-story-sound';
  const base = new URL('./', window.location.href);
  // The release stamps <html data-release>; a changed file then gets a new address, so a
  // browser (or a CDN's browser cache lifetime) cannot keep showing the old one.
  const release = document.documentElement.dataset.release;
  const versioned = url => (release && release !== 'dev' ? `${url}?v=${release}` : url);
  const storyURL = (id, rel = '') => versioned(new URL(`story/${id}/${rel}`, base).href);
  const $ = id => document.getElementById(id);
  const escape = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const layer = $('story-layer');

  // --- Browser storage (wrapped: private windows and blocked storage still play) -------------
  const memory = new Map();
  function readStore(key) {
    try { const raw = window.localStorage.getItem(key); if (raw !== null) return raw; } catch { /* blocked */ }
    return memory.has(key) ? memory.get(key) : null;
  }
  function writeStore(key, value) {
    memory.set(key, value);
    try { if (value === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, value); } catch { /* blocked */ }
  }

  function progressOf(id) {
    let saved = null;
    try { saved = JSON.parse(readStore(`ff-story-${id}`) || 'null'); } catch { saved = null; }
    const completed = Array.isArray(saved?.completed)
      ? [...new Set(saved.completed.filter(i => Number.isInteger(i) && i >= 0 && i < CHAPTERS))].sort((a, b) => a - b) : [];
    const data = saved?.data && typeof saved.data === 'object' && !Array.isArray(saved.data) ? saved.data : {};
    return { v: 1, completed, data };
  }
  const saveProgress = (id, p) => writeStore(`ff-story-${id}`, JSON.stringify(p));

  function progressAPI(id) {
    return {
      get: () => progressOf(id),
      completed: () => progressOf(id).completed,
      isComplete: i => progressOf(id).completed.includes(i),
      // A chapter is open when it is the first or its predecessor is won.
      isUnlocked: i => i === 0 || progressOf(id).completed.includes(i - 1),
      // The first chapter not yet won (CHAPTERS when the story is finished).
      current: () => { const done = progressOf(id).completed; let i = 0; while (i < CHAPTERS && done.includes(i)) i++; return i; },
      complete: i => { const p = progressOf(id); if (!p.completed.includes(i)) p.completed.push(i); p.completed.sort((a, b) => a - b); saveProgress(id, p); },
      getData: key => progressOf(id).data[key],
      setData: (key, value) => { const p = progressOf(id); p.data[key] = value; saveProgress(id, p); },
      reset: () => writeStore(`ff-story-${id}`, null),
    };
  }

  // One switch for all sound: the story's button and the HUD's (sound.js) stay in step.
  let soundOn = readStore(SOUND_KEY) !== 'off' && (window.FFSound?.isOn?.() ?? true);
  function announceSound() { document.dispatchEvent(new CustomEvent('ff:story-sound', { detail: { on: soundOn } })); }
  const sound = {
    enabled: () => soundOn,
    set: on => {
      soundOn = Boolean(on);
      writeStore(SOUND_KEY, soundOn ? 'on' : 'off');
      if (window.FFSound && window.FFSound.isOn() !== soundOn) window.FFSound.setOn(soundOn);
      announceSound();
    },
  };
  document.addEventListener('ff:sound', e => {
    const on = Boolean(e.detail?.on);
    if (on === soundOn) return;
    soundOn = on;
    writeStore(SOUND_KEY, soundOn ? 'on' : 'off');
    announceSound();
  });

  // --- Manifests -----------------------------------------------------------------------------
  const manifests = new Map();   // id -> Promise<manifest | null>
  function loadManifest(id) {
    if (!manifests.has(id)) {
      manifests.set(id, (async () => {
        try {
          const res = await fetch(storyURL(id, 'manifest.json'), { cache: 'no-cache', credentials: 'same-origin', redirect: 'error' });
          if (!res.ok) return null;
          const m = await res.json();
          return m && m.version === 1 && Array.isArray(m.chapters) && m.chapters.length === CHAPTERS ? m : null;
        } catch { return null; }
      })());
    }
    return manifests.get(id);
  }

  async function decorateModeCards() {
    for (const story of STORIES) {
      const card = document.querySelector(`#mode-grid [data-story="${story.id}"]`);
      if (!card) continue;
      const m = await loadManifest(story.id);
      const status = card.querySelector('[data-story-status]');
      card.classList.toggle('is-soon', !m);
      if (!m) { status.textContent = 'Coming soon'; continue; }
      card.querySelector('[data-story-title]').textContent = m.title || story.label;
      if (m.tagline) card.querySelector('[data-story-desc]').textContent = m.tagline;
      const done = progressOf(story.id).completed.length;
      status.textContent = done >= CHAPTERS ? 'Finished · play any chapter again' : done ? `${done} of ${CHAPTERS} chapters won` : 'Eight chapters';
    }
  }

  // --- Layer state -----------------------------------------------------------------------------
  let active = null;   // {id, manifest, progress, module, mod, styleEl}
  let scenePlayer = null;

  function openLayer(id) {
    layer.hidden = false;
    layer.dataset.story = id;
    document.body.classList.add('story-open');
  }
  function closeLayer() {
    layer.hidden = true;
    layer.innerHTML = '';
    delete layer.dataset.story;
    document.body.classList.remove('story-open');
  }

  function ensureStyle(id, manifest) {
    if (!manifest.style) return;
    const href = storyURL(id, manifest.style);
    if (document.querySelector(`link[data-story-style="${id}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.storyStyle = id;
    document.head.appendChild(link);
  }

  async function enterStory(id) {
    const story = STORIES.find(s => s.id === id);
    if (!story) return;
    stopScene();
    await unmountModule();
    openLayer(id);
    const manifest = await loadManifest(id);
    if (!manifest) { renderSoon(story); return; }
    ensureStyle(id, manifest);
    active = { id, manifest, progress: progressAPI(id), mod: null };
    if (manifest.module) {
      try {
        active.mod = await import(storyURL(id, manifest.module));
      } catch (err) {
        renderError(`This story's module could not be loaded (${err?.message || err}).`);
        return;
      }
      mountModule();
      return;
    }
    const seenPrologue = active.progress.getData('prologue_seen');
    if (manifest.prologue && !seenPrologue && !active.progress.completed().length) {
      await playScene(manifest.prologue, { label: 'Prologue' });
      if (!active || active.id !== id) return;
      active.progress.setData('prologue_seen', true);
    }
    renderMap();
  }

  function exitStory() {
    stopScene();
    const leaving = active;
    active = null;
    Promise.resolve(leaving?.mod ? safeUnmount(leaving) : null).finally(() => {
      closeLayer();
      window.FFGame?.openStartScreen('mode');
      decorateModeCards();
    });
  }

  // --- Story modules ----------------------------------------------------------------------------
  function bridgeFor(story) {
    return {
      id: story.id,
      manifest: story.manifest,
      url: rel => storyURL(story.id, rel),
      progress: story.progress,
      sound,
      startLevel: opts => startLevel(opts),
      battle: () => window.FFGame?.battle() || null,
      returnToBattle: () => returnToBattle(),
      exitStory: () => exitStory(),
      playScene: (scene, options) => playScene(scene, options),
      level: (encounter, preset) => window.FFGame?.level(encounter, preset) || null,
    };
  }
  function mountModule() {
    layer.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'story-module';
    layer.appendChild(container);
    try {
      active.mod.mount(container, bridgeFor(active));
    } catch (err) {
      renderError(`This story could not start (${err?.message || err}).`);
    }
  }
  async function safeUnmount(story) {
    try { await story.mod?.unmount?.(); } catch { /* a story's own cleanup must not trap the player */ }
  }
  async function unmountModule() {
    if (active?.mod) await safeUnmount(active);
  }

  // --- Fights -------------------------------------------------------------------------------------
  async function startLevel(opts = {}) {
    if (!active || !window.FFGame?.ready()) return false;
    const chapter = Number.isInteger(opts.chapter) ? opts.chapter : null;
    const level = window.FFGame.level(opts.encounter, opts.preset);
    if (!level) { renderError(`Unknown level ${opts.encounter}/${opts.preset}.`); return false; }
    const run = {
      story: active.id, chapter, encounter: opts.encounter, preset: opts.preset,
      hero_level: Number.isInteger(opts.hero_level) ? opts.hero_level : null,
      seed: Number.isInteger(opts.seed) ? opts.seed : null,
      title: typeof opts.title === 'string' ? opts.title.slice(0, 80) : null,
    };
    stopScene();
    if (active.mod) await safeUnmount(active);
    const story = active;
    layer.hidden = true;
    document.body.classList.remove('story-open');
    const ok = await window.FFGame.launchStory(run);
    if (!ok) {
      // The error banner explains; the player gets the story back.
      if (active === story) { openLayer(story.id); if (story.mod) mountModule(); else renderMap(); }
    }
    return ok;
  }

  function returnToBattle() {
    if (!window.FFGame?.battle()) return false;
    stopScene();
    const story = active;
    Promise.resolve(story?.mod ? safeUnmount(story) : null).finally(() => {
      layer.hidden = true;
      document.body.classList.remove('story-open');
      window.FFGame.closeStartScreen();
    });
    return true;
  }

  // From the HUD's "Story map" button mid-battle, or after a fight.
  async function showMap(id, result = null) {
    const storyId = id || active?.id || window.FFGame?.storyRun()?.story;
    if (!storyId) return;
    window.FFGame?.openStartScreen('mode');
    if (!active || active.id !== storyId) {
      const manifest = await loadManifest(storyId);
      if (!manifest) return;
      ensureStyle(storyId, manifest);
      active = { id: storyId, manifest, progress: progressAPI(storyId), mod: null };
      if (manifest.module) {
        try { active.mod = await import(storyURL(storyId, manifest.module)); } catch { active.mod = null; }
      }
    }
    openLayer(storyId);
    if (active.mod) {
      mountModule();
      if (result) { try { active.mod.onBattleEnd?.(result); } catch { /* the module redraws itself */ } }
      return;
    }
    if (result?.outcome === 'win' && Number.isInteger(result.chapter)) await afterWin(result.chapter);
    else renderMap();
  }

  // A won story fight counts at once (a reload before "Continue" keeps it).
  document.addEventListener('ff:finished', e => {
    const run = e.detail?.story;
    if (run && e.detail.outcome === 'win' && Number.isInteger(run.chapter)) progressAPI(run.story).complete(run.chapter);
  });
  $('story-continue-button').addEventListener('click', () => {
    const b = window.FFGame?.battle();
    if (b) showMap(b.story, { outcome: b.outcome, chapter: b.chapter, encounter: b.encounter, preset: b.preset });
  });
  $('story-map-button').addEventListener('click', () => {
    const b = window.FFGame?.battle();
    if (b) showMap(b.story, { outcome: b.outcome, chapter: b.chapter, encounter: b.encounter, preset: b.preset });
  });
  $('story-retry-button').addEventListener('click', () => window.FFGame?.retryStory());

  // --- The default renderer: cards, map, chapter panel ------------------------------------------
  function header(m, extra = '') {
    return `<header class="story-head">
      <div class="story-head-title"><span class="eyebrow">${escape(STORIES.find(s => s.id === active?.id)?.label || 'STORY')}</span>
        <h1>${escape(m.title)}</h1>${m.subtitle ? `<p>${escape(m.subtitle)}</p>` : ''}</div>
      <div class="story-head-actions">${extra}
        <button type="button" class="button quiet" data-act="sound" aria-pressed="${soundOn}">${soundOn ? '🔊 Sound on' : '🔇 Sound off'}</button>
        <button type="button" class="button quiet" data-act="exit">← Modes</button>
      </div></header>`;
  }

  function renderSoon(story) {
    active = null;
    layer.innerHTML = `<div class="story-card story-soon">
      <span class="eyebrow">${escape(story.label.toUpperCase())}</span>
      <h1>Coming soon</h1>
      <p>This story is still being written. Practice is open, and the other story may be ready.</p>
      <button type="button" class="button primary" data-act="exit">← Back to the modes</button></div>`;
    layer.querySelector('[data-act="exit"]').focus();
  }
  function renderError(message) {
    layer.innerHTML = `<div class="story-card story-soon"><span class="eyebrow">STORY</span><h1>Something went wrong</h1>
      <p>${escape(message)}</p><button type="button" class="button primary" data-act="exit">← Back to the modes</button></div>`;
  }

  const partyNames = level => (level?.party || []).map(h => h.name || h.content).filter(Boolean);
  const clamp01 = v => Math.min(1, Math.max(0, Number(v) || 0));

  function renderMap({ selected = null, moveFrom = null } = {}) {
    if (!active) return;
    const m = active.manifest, prog = active.progress;
    const current = prog.current();
    const done = current >= CHAPTERS;
    const pick = selected ?? Math.min(current, CHAPTERS - 1);
    const map = m.map || {};
    const nodes = m.chapters.map(c => (Array.isArray(c.node) ? c.node.map(clamp01) : [0.5, 0.5]));
    const route = Array.isArray(map.route) && map.route.length > 1 ? map.route.map(p => p.map(clamp01)) : nodes;
    const battle = window.FFGame?.battle();
    layer.innerHTML = `${header(m, battle && battle.phase !== 'finished' && battle.story === active.id ? '<button type="button" class="button primary" data-act="battle">⚔ Back to the battle</button>' : '')}
      <div class="story-body">
        <div class="story-map-wrap"><div class="story-map" id="story-map">
          ${map.image ? `<img class="story-map-img" src="${escape(storyURL(active.id, map.image))}" alt="${escape(map.alt || 'The world map')}" draggable="false">` : ''}
          <svg class="story-route" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="route-all" points="${route.map(p => `${p[0] * 1000},${p[1] * 1000}`).join(' ')}"/>
          </svg>
          ${m.chapters.map((c, i) => {
            const state = prog.isComplete(i) ? 'done' : prog.isUnlocked(i) ? 'open' : 'locked';
            return `<button type="button" class="story-node is-${state}${i === pick ? ' is-selected' : ''}" data-chapter="${i}" ${state === 'locked' ? 'aria-disabled="true"' : ''}
              aria-label="Chapter ${i + 1}: ${escape(c.title)}${state === 'locked' ? ' (locked)' : state === 'done' ? ' (won)' : ''}"><span>${state === 'done' ? '✓' : i + 1}</span>
              <em class="story-node-label">${escape(c.place || c.title)}</em></button>`;
          }).join('')}
          <span class="story-marker" id="story-marker" aria-hidden="true"></span>
        </div></div>
        <aside class="story-panel" id="story-panel"></aside>
      </div>`;
    const mapEl = $('story-map');
    if (map.width > 0 && map.height > 0) {
      mapEl.style.setProperty('--map-ratio', `${map.width} / ${map.height}`);
      mapEl.style.setProperty('--map-r', String(map.width / map.height));
    }
    for (const btn of mapEl.querySelectorAll('.story-node')) {
      const [x, y] = nodes[Number(btn.dataset.chapter)];
      btn.style.setProperty('--x', String(x));
      btn.style.setProperty('--y', String(y));
    }
    const marker = $('story-marker');
    const at = Math.min(done ? CHAPTERS - 1 : current, CHAPTERS - 1);
    const placeMarker = i => { marker.style.setProperty('--x', String(nodes[i][0])); marker.style.setProperty('--y', String(nodes[i][1])); };
    if (moveFrom !== null && moveFrom !== at && !reducedMotion()) {
      placeMarker(moveFrom);
      marker.classList.add('is-moving');
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => placeMarker(at)));
    } else {
      placeMarker(at);
    }
    renderPanel(pick);
  }

  function renderPanel(i) {
    const m = active.manifest, prog = active.progress, c = m.chapters[i];
    const panel = $('story-panel');
    if (!panel || !c) return;
    for (const n of layer.querySelectorAll('.story-node')) n.classList.toggle('is-selected', Number(n.dataset.chapter) === i);
    const unlocked = prog.isUnlocked(i), won = prog.isComplete(i);
    const level = window.FFGame?.level(c.encounter, c.preset);
    const party = partyNames(level);
    const finished = prog.current() >= CHAPTERS;
    panel.innerHTML = `<span class="eyebrow">CHAPTER ${i + 1} OF ${CHAPTERS}${won ? ' · WON' : ''}</span>
      <h2>${escape(c.title)}</h2>
      ${c.place ? `<p class="story-place">${escape(c.place)}</p>` : ''}
      ${unlocked ? `<p class="story-blurb">${escape(c.blurb || '')}</p>
        ${party.length ? `<p class="story-party"><b>Party:</b> ${escape(party.join(', '))}${c.hero_level ? ` · level ${escape(c.hero_level)}` : level?.hero_level ? ` · level ${escape(level.hero_level)}` : ''}</p>` : ''}
        <div class="story-panel-actions">
          <button type="button" class="button primary" data-act="play" data-chapter="${i}">${won ? '⚔ Play this chapter again' : '⚔ Begin the chapter'}</button>
          ${c.before ? `<button type="button" class="button quiet" data-act="scene" data-scene="${escape(c.before)}">▷ Opening scene</button>` : ''}
          ${won && c.after ? `<button type="button" class="button quiet" data-act="scene" data-scene="${escape(c.after)}">▷ Closing scene</button>` : ''}
        </div>`
      : '<p class="story-blurb story-locked">Win the chapter before this one to open it.</p>'}
      <div class="story-panel-foot">
        ${m.prologue ? `<button type="button" class="button quiet" data-act="scene" data-scene="${escape(m.prologue)}">▷ Prologue</button>` : ''}
        ${finished && m.epilogue ? `<button type="button" class="button quiet" data-act="scene" data-scene="${escape(m.epilogue)}">▷ The ending</button>` : ''}
        <button type="button" class="button quiet danger" data-act="reset">Reset progress</button>
      </div>
      ${finished ? `<p class="story-the-end">${escape(m.ending_note || 'The story is complete. Every chapter stays open.')}</p>` : ''}`;
  }

  async function beginChapter(i) {
    const c = active?.manifest.chapters[i];
    if (!c || !active.progress.isUnlocked(i)) return;
    const story = active;
    if (c.before) {
      const finishedScene = await playScene(c.before, { label: `Chapter ${i + 1}` });
      if (active !== story || finishedScene === 'exit') return;
    }
    await startLevel({ encounter: c.encounter, preset: c.preset, hero_level: c.hero_level, seed: c.seed, title: c.title, chapter: i });
  }

  async function afterWin(i) {
    const m = active.manifest, c = m.chapters[i];
    const story = active;
    if (c?.after) await playScene(c.after, { label: `Chapter ${i + 1}` });
    if (active !== story) return;
    if (i === CHAPTERS - 1 && m.epilogue) {
      await playScene(m.epilogue, { label: 'Epilogue' });
      if (active !== story) return;
    }
    renderMap({ moveFrom: i, selected: Math.min(i + 1, CHAPTERS - 1) });
  }

  layer.addEventListener('click', e => {
    const btn = e.target.closest('[data-act], .story-node');
    if (!btn || !layer.contains(btn) || btn.closest('.story-scene')) return;
    if (btn.classList.contains('story-node')) {
      if (active) renderPanel(Number(btn.dataset.chapter));
      return;
    }
    const act = btn.dataset.act;
    if (act === 'exit') exitStory();
    else if (act === 'sound') { sound.set(!soundOn); btn.textContent = soundOn ? '🔊 Sound on' : '🔇 Sound off'; btn.setAttribute('aria-pressed', String(soundOn)); }
    else if (act === 'battle') returnToBattle();
    else if (act === 'play') beginChapter(Number(btn.dataset.chapter));
    else if (act === 'scene') playScene(btn.dataset.scene).then(() => { if (active && !active.mod) renderMap({ selected: currentSelection() }); });
    else if (act === 'reset') {
      if (window.confirm('Forget this story\'s progress in this browser? Every chapter after the first locks again.')) {
        active.progress.reset();
        renderMap({ selected: 0 });
      }
    }
  });
  const currentSelection = () => { const n = layer.querySelector('.story-node.is-selected'); return n ? Number(n.dataset.chapter) : null; };

  // --- The scene player ---------------------------------------------------------------------------
  // A scene: {music?, shots: [{image?|video?, poster?, title?, speaker?, text?, audio?, duration?, motion?}]}
  function stopScene() {
    if (scenePlayer) scenePlayer.stop('exit');
  }

  function fadeAudio(audio, to, ms) {
    if (!audio) return Promise.resolve();
    const from = audio.volume, start = performance.now();
    return new Promise(resolve => {
      const tick = now => {
        const t = Math.min(1, (now - start) / ms);
        try { audio.volume = Math.max(0, Math.min(1, from + (to - from) * t)); } catch { /* detached */ }
        if (t < 1) window.requestAnimationFrame(tick); else resolve();
      };
      window.requestAnimationFrame(tick);
    });
  }

  function readingMs(shot) {
    const words = `${shot.title || ''} ${shot.text || ''}`.trim().split(/\s+/).filter(Boolean).length;
    return Math.min(16000, Math.max(4500, words * 330 + 1800));
  }

  function playScene(sceneOrId, { label = '' } = {}) {
    stopScene();
    if (!active) return Promise.resolve('exit');
    const scene = typeof sceneOrId === 'string' ? active.manifest.scenes?.[sceneOrId] : sceneOrId;
    const shots = Array.isArray(scene?.shots) ? scene.shots : [];
    if (!shots.length) return Promise.resolve('done');
    const id = active.id;
    const host = document.createElement('div');
    host.className = 'story-scene';
    host.setAttribute('role', 'region');
    host.setAttribute('aria-label', label ? `${label}: scene` : 'Scene');
    host.innerHTML = `<div class="scene-stage" id="scene-stage"></div>
      <div class="scene-caption" aria-live="polite"><span class="scene-label">${escape(label)}</span><h2 class="scene-title" hidden></h2><p class="scene-speaker" hidden></p><p class="scene-text"></p></div>
      <div class="scene-controls">
        <span class="scene-dots" aria-hidden="true">${shots.map(() => '<i></i>').join('')}</span>
        <button type="button" class="button quiet" data-scene-act="sound" aria-pressed="${soundOn}">${soundOn ? '🔊' : '🔇'}<span class="sr-only"> Sound</span></button>
        <button type="button" class="button quiet" data-scene-act="next">Next ›</button>
        <button type="button" class="button quiet" data-scene-act="skip">Skip scene ⏭</button>
      </div>`;
    layer.appendChild(host);
    const stage = host.querySelector('.scene-stage');
    let index = -1, timer = 0, voice = null, music = null, video = null, finished = false, resolveScene;
    const done = new Promise(resolve => { resolveScene = resolve; });

    if (scene.music) {
      music = new Audio(storyURL(id, scene.music));
      music.loop = true;
      music.preload = 'auto';
      music.volume = 0;
      if (soundOn) music.play().then(() => fadeAudio(music, Number(scene.music_volume) || 0.28, 1600)).catch(() => {});
    }

    function clearShot() {
      window.clearTimeout(timer);
      if (voice) { voice.pause(); voice.src = ''; voice = null; }
      if (video) { video.pause(); }
    }
    function stop(reason = 'done') {
      if (finished) return;
      finished = true;
      clearShot();
      if (video) { video.removeAttribute('src'); video.load(); video = null; }
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('ff:story-sound', onSound);
      const m = music;
      music = null;
      if (m) fadeAudio(m, 0, 500).then(() => { m.pause(); m.src = ''; });
      host.remove();
      if (scenePlayer === player) scenePlayer = null;
      resolveScene(reason);
    }
    const advanceLater = ms => { window.clearTimeout(timer); timer = window.setTimeout(next, ms); };

    function show(i) {
      clearShot();
      index = i;
      const shot = shots[i];
      for (const [k, dot] of host.querySelectorAll('.scene-dots i').entries()) dot.classList.toggle('is-on', k <= i);
      const titleEl = host.querySelector('.scene-title'), speakerEl = host.querySelector('.scene-speaker');
      titleEl.hidden = !shot.title; titleEl.textContent = shot.title || '';
      speakerEl.hidden = !shot.speaker; speakerEl.textContent = shot.speaker || '';
      host.querySelector('.scene-text').textContent = shot.text || '';
      host.classList.toggle('is-title-card', Boolean(shot.title) && !shot.text);
      const ms = Number(shot.duration) > 0 ? Number(shot.duration) * 1000 : readingMs(shot);
      // The shot moves on when its video and its narration have both ended (or failed).
      const waits = new Set();
      const release = (what, gap) => {
        if (finished || index !== i || !waits.has(what)) return;
        waits.delete(what);
        if (!waits.size) advanceLater(gap);
      };
      const frame = document.createElement('div');
      frame.className = 'scene-shot';
      if (shot.video) {
        video = document.createElement('video');
        video.className = 'scene-media';
        video.playsInline = true;
        video.muted = !soundOn;
        video.preload = 'auto';
        if (shot.poster) video.poster = storyURL(id, shot.poster);
        video.src = storyURL(id, shot.video);
        waits.add('video');
        video.addEventListener('ended', () => release('video', shot.text ? 1500 : 400));
        video.addEventListener('error', () => release('video', ms));
        frame.appendChild(video);
        video.play().catch(() => release('video', ms));
      } else if (shot.image) {
        const img = document.createElement('img');
        img.className = `scene-media motion-${reducedMotion() ? 'none' : (shot.motion || 'zoom-in')}`;
        img.alt = shot.alt || '';
        img.src = storyURL(id, shot.image);
        img.style.setProperty('--shot-ms', `${Math.round(ms + 4000)}ms`);
        frame.appendChild(img);
      } else {
        frame.classList.add('is-blank');
      }
      const old = [...stage.children];
      stage.appendChild(frame);
      window.requestAnimationFrame(() => frame.classList.add('is-in'));
      window.setTimeout(() => old.forEach(n => n.remove()), 900);
      const nextShot = shots[i + 1];
      if (nextShot?.image) { const pre = new Image(); pre.src = storyURL(id, nextShot.image); }
      if (shot.audio && soundOn) {
        waits.add('voice');
        voice = new Audio(storyURL(id, shot.audio));
        voice.volume = 1;
        voice.addEventListener('ended', () => release('voice', 1100));
        voice.addEventListener('error', () => release('voice', ms));
        voice.play().catch(() => release('voice', ms));
      }
      if (!waits.size) advanceLater(ms);
      // A stalled video or voice never traps the scene.
      else timer = window.setTimeout(next, Math.max(ms, 60000));
    }
    function next() {
      if (finished) return;
      if (index + 1 >= shots.length) stop('done');
      else show(index + 1);
    }
    function onKey(e) {
      if (finished) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); stop('skip'); }
      else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        if (e.target.closest?.('button') && e.key !== 'ArrowRight') return;
        e.preventDefault(); e.stopPropagation(); next();
      }
    }
    function onSound() {
      host.querySelector('[data-scene-act="sound"]').firstChild.textContent = soundOn ? '🔊' : '🔇';
      if (video) video.muted = !soundOn;
      if (!soundOn) {
        if (voice) { voice.pause(); voice = null; advanceLater(readingMs(shots[index])); }
        if (music) music.pause();
      } else if (music) {
        music.play().then(() => fadeAudio(music, Number(scene.music_volume) || 0.28, 800)).catch(() => {});
      }
    }
    host.addEventListener('click', e => {
      const btn = e.target.closest('[data-scene-act]');
      if (!btn) { next(); return; }
      const act = btn.dataset.sceneAct;
      if (act === 'skip') stop('skip');
      else if (act === 'next') next();
      else if (act === 'sound') sound.set(!soundOn);
    });
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('ff:story-sound', onSound);
    const player = { stop };
    scenePlayer = player;
    show(0);
    host.querySelector('[data-scene-act="next"]').focus({ preventScroll: true });
    return done;
  }

  // --- Entry points -------------------------------------------------------------------------------
  $('mode-grid')?.addEventListener('click', e => {
    const card = e.target.closest('[data-story]');
    if (card) enterStory(card.dataset.story);
  });
  layer.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !scenePlayer) { e.preventDefault(); exitStory(); }
  });

  window.FFStory = {
    stories: () => STORIES.map(s => ({ ...s })),
    isOpen: () => !layer.hidden,
    enter: enterStory,
    // result: {outcome, chapter} as after a fight (tests use it to stand in for a won fight).
    showMap: (id, result) => showMap(id, result || null),
    exit: exitStory,
    expired: run => showMap(run.story),
    progress: id => progressAPI(id),
    // Tests and tools: the active story's view.
    state: () => (active ? { id: active.id, title: active.manifest.title, completed: active.progress.completed(), scene: Boolean(scenePlayer) } : null),
  };

  decorateModeCards();
})();
