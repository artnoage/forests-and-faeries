/**
 * Story Mode Gemini — The Unrung Bell
 *
 * Implements the shared story-mode module contract (docs/STORY_MODE.md):
 *   export function mount(container, bridge)
 *   export function unmount()
 *   export function onBattleEnd(result)
 *
 * Interactive Alderreach Valley world map + animated painterly cutscene player
 * with synchronized multi-speaker voice acting, bespoke orchestral score, and
 * portrait-driven dialogue captions (clips play once and hold their final frame).
 * Strict CSP compliant (zero inline style attributes, zero inline event handlers).
 */

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const FALLBACK_KEY = 'ff-story-gemini';

let cachedStoryData = null;
let activeController = null;

function createFallbackProgress() {
  const read = () => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(FALLBACK_KEY) || 'null');
      const completed = Array.isArray(parsed?.completed)
        ? [...new Set(parsed.completed.filter((i) => Number.isInteger(i) && i >= 0 && i < 8))].sort((a, b) => a - b)
        : [];
      const data = parsed?.data && typeof parsed.data === 'object' ? parsed.data : {};
      return { v: 1, completed, data };
    } catch {
      return { v: 1, completed: [], data: {} };
    }
  };
  const write = (p) => {
    try {
      if (p === null) window.localStorage.removeItem(FALLBACK_KEY);
      else window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(p));
    } catch { /* ignore */ }
  };
  return {
    completed: () => read().completed,
    isComplete: (i) => read().completed.includes(i),
    isUnlocked: (i) => i === 0 || read().completed.includes(i - 1),
    current: () => {
      const done = read().completed;
      let i = 0;
      while (i < 8 && done.includes(i)) i += 1;
      return i;
    },
    complete: (i) => {
      const p = read();
      if (!p.completed.includes(i)) p.completed.push(i);
      p.completed.sort((a, b) => a - b);
      write(p);
    },
    getData: (k) => read().data[k],
    setData: (k, v) => {
      const p = read();
      p.data[k] = v;
      write(p);
    },
    reset: () => write(null),
  };
}

function createFallbackSound() {
  let on = true;
  return {
    enabled: () => on,
    set: (v) => {
      on = Boolean(v);
      document.dispatchEvent(new CustomEvent('ff:story-sound', { detail: { on } }));
    },
  };
}

function createBellSvg(className) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('class', className || 'gs-bell-svg');
  svg.setAttribute('aria-hidden', 'true');
  const p1 = document.createElementNS(ns, 'path');
  p1.setAttribute('d', 'M16 4c-5 0-8.5 3.6-8.5 8.8v4.6c0 1.9-.9 3.6-2.3 4.6h21.6c-1.4-1-2.3-2.7-2.3-4.6v-4.6C24.5 7.6 21 4 16 4z');
  p1.setAttribute('fill', 'none');
  p1.setAttribute('stroke', 'currentColor');
  p1.setAttribute('stroke-width', '1.9');
  p1.setAttribute('stroke-linejoin', 'round');
  const p2 = document.createElementNS(ns, 'path');
  p2.setAttribute('d', 'M12.8 24.4a3.4 3.4 0 0 0 6.4 0M16 2v2');
  p2.setAttribute('fill', 'none');
  p2.setAttribute('stroke', 'currentColor');
  p2.setAttribute('stroke-width', '1.9');
  p2.setAttribute('stroke-linecap', 'round');
  svg.appendChild(p1);
  svg.appendChild(p2);
  return svg;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

class StoryAudioManager {
  constructor(resolveUrl, soundApi) {
    this.resolveUrl = resolveUrl;
    this.soundApi = soundApi;
    this.musicEl = new Audio();
    this.musicEl.loop = true;
    this.musicEl.preload = 'auto';
    this.musicId = null;

    this.voiceEl = new Audio();
    this.voiceEl.preload = 'auto';
    this.baseMusicVolume = 0.42;
    this.duckedMusicVolume = 0.19;
  }

  isMuted() {
    return !this.soundApi.enabled();
  }

  syncMute() {
    const muted = this.isMuted();
    this.musicEl.muted = muted;
    this.voiceEl.muted = muted;
  }

  playMusic(trackId, musicMap, ducked = false) {
    const entry = musicMap && musicMap[trackId];
    if (!entry) return;
    const targetVol = ducked ? this.duckedMusicVolume : this.baseMusicVolume;
    if (this.musicId !== trackId) {
      this.musicId = trackId;
      this.musicEl.src = this.resolveUrl(entry.src);
      this.musicEl.currentTime = 0;
    }
    this.syncMute();
    this.musicEl.volume = targetVol;
    this.musicEl.play().catch(() => {});
  }

  setMusicDucked(ducked) {
    this.musicEl.volume = ducked ? this.duckedMusicVolume : this.baseMusicVolume;
  }

  playVoice(relSrc, onEnded) {
    this.stopVoice();
    this.voiceEl.src = this.resolveUrl(relSrc);
    this.syncMute();
    this.voiceEl.volume = 0.96;
    this.voiceEl.currentTime = 0;
    this._onEnded = onEnded || null;
    if (this._onEnded) this.voiceEl.addEventListener('ended', this._onEnded);
    this.setMusicDucked(true);
    return this.voiceEl.play();
  }

  stopVoice() {
    this.voiceEl.pause();
    if (this._onEnded) this.voiceEl.removeEventListener('ended', this._onEnded);
    this._onEnded = null;
    this.setMusicDucked(false);
  }

  stopAll() {
    this.stopVoice();
    this.musicEl.pause();
    this.musicId = null;
  }
}

class GeminiStoryController {
  constructor(container, bridge = {}) {
    this.container = container;
    this.bridge = bridge;
    this.progress = bridge.progress || createFallbackProgress();
    this.soundApi = bridge.sound || createFallbackSound();
    this.resolveUrl = typeof bridge.url === 'function'
      ? (rel) => bridge.url(rel)
      : (rel) => new URL(rel, bridge.baseUrl || new URL('./', import.meta.url).href).href;

    this.data = cachedStoryData;
    this.audio = new StoryAudioManager(this.resolveUrl, this.soundApi);
    this.selectedIndex = 0;
    this.captionsOn = true;
    this.root = null;
    this.activeRaf = null;
    this.activeVideoEl = null;
    this.viewMode = 'map';
    this.bannerToast = null;
    this.destroyed = false;
    this.pendingBattleEnd = null;
    this._sceneHotkeys = null;

    this._onSoundEvent = () => {
      this.audio.syncMute();
      if (this.root) {
        const btn = this.root.querySelector('[data-gs-mute]');
        if (btn) btn.textContent = this.soundApi.enabled() ? 'Sound: On' : 'Sound: Off';
      }
    };

    this._onKeyDown = (ev) => {
      if (this.destroyed || !this.root) return;
      if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
      if (ev.key === 'm' || ev.key === 'M') {
        this.soundApi.set(!this.soundApi.enabled());
        return;
      }
      if (this.viewMode === 'scene' && this._sceneHotkeys) {
        if (ev.key === ' ' || ev.code === 'Space') {
          ev.preventDefault();
          this._sceneHotkeys.togglePause();
        } else if (ev.key === 'ArrowRight') {
          ev.preventDefault();
          this._sceneHotkeys.nextLine();
        } else if (ev.key === 'Escape') {
          ev.preventDefault();
          this.renderMap();
        }
      }
    };
  }

  async mount() {
    this.root = el('div', 'ff-gstory-root');
    this.container.innerHTML = '';
    this.container.appendChild(this.root);
    window.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('ff:story-sound', this._onSoundEvent);

    if (!this.data) {
      const resp = await fetch(this.resolveUrl('story-data.json'), { cache: 'no-cache', credentials: 'same-origin' });
      if (!resp.ok) throw new Error(`Failed to load story-data.json (${resp.status})`);
      cachedStoryData = await resp.json();
      this.data = cachedStoryData;
    }
    if (this.destroyed) return;

    if (this.pendingBattleEnd) {
      const res = this.pendingBattleEnd;
      this.pendingBattleEnd = null;
      this.handleBattleEnd(res);
      return;
    }

    const activeBattle = typeof this.bridge.battle === 'function' ? this.bridge.battle() : null;
    if (activeBattle && Number.isInteger(activeBattle.chapter)) {
      this.selectedIndex = Math.min(this.data.chapters.length - 1, Math.max(0, activeBattle.chapter));
    } else {
      this.selectedIndex = this.frontierIndex();
    }
    this.renderMap();
  }

  handleBattleEnd(result) {
    if (this.destroyed) return;
    if (!this.data) {
      this.pendingBattleEnd = result;
      return;
    }
    const chIdx = Number.isInteger(result?.chapter) ? result.chapter : this.frontierIndex();
    const finalIdx = this.data.chapters.length - 1;
    if (result?.outcome === 'win') {
      if (chIdx === finalIdx) {
        this.openEpilogue();
        return;
      }
      const cleared = this.data.chapters[chIdx];
      this.selectedIndex = Math.min(finalIdx, chIdx + 1);
      this.bannerToast = cleared ? `${cleared.chapter_label} cleared — the road onward opens.` : null;
      this.renderMap();
      return;
    }
    this.selectedIndex = Math.min(finalIdx, Math.max(0, chIdx));
    this.bannerToast = null;
    this.renderMap();
  }

  unmount() {
    this.destroyed = true;
    this._sceneHotkeys = null;
    window.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('ff:story-sound', this._onSoundEvent);
    if (this.activeRaf) {
      cancelAnimationFrame(this.activeRaf);
      this.activeRaf = null;
    }
    if (this.activeVideoEl) {
      this.activeVideoEl.pause();
      this.activeVideoEl.removeAttribute('src');
      this.activeVideoEl = null;
    }
    this.audio.stopAll();
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
  }

  frontierIndex() {
    const cur = this.progress.current();
    return Math.min(this.data.chapters.length - 1, Math.max(0, cur));
  }

  allChaptersCompleted() {
    return this.progress.completed().length >= this.data.chapters.length;
  }

  buildTopbar() {
    const bar = el('header', 'gs-topbar');

    const brand = el('div', 'gs-brand');
    brand.appendChild(el('h1', 'gs-brand-title', this.data.title));
    brand.appendChild(el('span', 'gs-brand-sub', this.data.subtitle));
    bar.appendChild(brand);

    const actions = el('div', 'gs-top-actions');
    const cleared = this.progress.completed().length;
    const total = this.data.chapters.length;
    actions.appendChild(el('span', 'gs-pill', `${cleared} / ${total} Chapters`));

    const liveBattle = typeof this.bridge.battle === 'function' ? this.bridge.battle() : null;
    if (liveBattle && liveBattle.phase !== 'finished' && typeof this.bridge.returnToBattle === 'function') {
      const retBtn = el('button', 'gs-btn gs-btn-battle', 'Return to Battle');
      retBtn.type = 'button';
      retBtn.addEventListener('click', () => this.bridge.returnToBattle());
      actions.appendChild(retBtn);
    }

    if (this.allChaptersCompleted()) {
      const epiBtn = el('button', 'gs-btn gs-btn-primary', 'Watch Epilogue');
      epiBtn.type = 'button';
      epiBtn.addEventListener('click', () => this.openEpilogue());
      actions.appendChild(epiBtn);
    }

    const muteBtn = el('button', 'gs-btn', this.soundApi.enabled() ? 'Sound: On' : 'Sound: Off');
    muteBtn.type = 'button';
    muteBtn.dataset.gsMute = '1';
    muteBtn.addEventListener('click', () => {
      this.soundApi.set(!this.soundApi.enabled());
    });
    actions.appendChild(muteBtn);

    if (this.viewMode === 'scene') {
      const mapBtn = el('button', 'gs-btn', 'World Map');
      mapBtn.type = 'button';
      mapBtn.addEventListener('click', () => this.renderMap());
      actions.appendChild(mapBtn);
    } else if (cleared > 0) {
      const resetBtn = el('button', 'gs-btn gs-btn-danger', 'Reset Story');
      resetBtn.type = 'button';
      resetBtn.addEventListener('click', () => {
        if (window.confirm('Reset all progress in The Unrung Bell?')) {
          this.progress.reset();
          this.selectedIndex = 0;
          this.bannerToast = null;
          this.renderMap();
        }
      });
      actions.appendChild(resetBtn);
    }

    const exitBtn = el('button', 'gs-btn', 'Main Menu');
    exitBtn.type = 'button';
    exitBtn.addEventListener('click', () => {
      if (typeof this.bridge.exitStory === 'function') {
        this.bridge.exitStory();
      } else {
        this.unmount();
      }
    });
    actions.appendChild(exitBtn);

    bar.appendChild(actions);
    return bar;
  }

  renderMap() {
    if (this.destroyed || !this.root) return;
    this.viewMode = 'map';
    this._sceneHotkeys = null;
    if (this.activeRaf) {
      cancelAnimationFrame(this.activeRaf);
      this.activeRaf = null;
    }
    if (this.activeVideoEl) {
      this.activeVideoEl.pause();
      this.activeVideoEl = null;
    }
    this.audio.stopVoice();
    this.audio.playMusic(this.data.world_map.music, this.data.music, false);

    this.root.innerHTML = '';
    this.root.appendChild(this.buildTopbar());

    const main = el('main', 'gs-map-view');

    const frame = el('div', 'gs-map-frame');
    const img = el('img', 'gs-map-img');
    img.src = this.resolveUrl(this.data.world_map.image);
    img.alt = 'Illustrated map of Alderreach Valley';
    frame.appendChild(img);
    frame.appendChild(el('div', 'gs-map-vignette'));

    if (this.bannerToast) {
      frame.appendChild(el('div', 'gs-map-toast', this.bannerToast));
    }

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('class', 'gs-map-svg');

    const frontierIdx = this.frontierIndex();
    const chapters = this.data.chapters;

    for (let i = 0; i < chapters.length - 1; i += 1) {
      const a = chapters[i].map;
      const b = chapters[i + 1].map;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 + (i % 2 === 0 ? -4 : 4);
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`);
      if (this.progress.isComplete(i) && this.progress.isComplete(i + 1)) {
        path.setAttribute('class', 'gs-route-done');
      } else if (this.progress.isComplete(i) && i + 1 === frontierIdx) {
        path.setAttribute('class', 'gs-route-active');
      } else {
        path.setAttribute('class', 'gs-route-locked');
      }
      svg.appendChild(path);
    }
    frame.appendChild(svg);

    const nodesLayer = el('div', 'gs-map-nodes');
    chapters.forEach((ch, idx) => {
      const done = this.progress.isComplete(idx);
      const unlocked = this.progress.isUnlocked(idx);
      const isCurrent = idx === frontierIdx && !done;
      const isSelected = idx === this.selectedIndex;

      const classes = ['gs-node'];
      if (done) classes.push('gs-node-done');
      else if (isCurrent) classes.push('gs-node-current');
      else if (!unlocked) classes.push('gs-node-locked');
      if (isSelected) classes.push('gs-node-selected');

      const btn = el('button', classes.join(' '));
      btn.type = 'button';
      btn.style.left = `${ch.map.x}%`;
      btn.style.top = `${ch.map.y}%`;
      btn.setAttribute('aria-label', `${ch.chapter_label}: ${ch.title} (${ch.location})`);

      const pin = el('span', 'gs-node-pin', done ? '✓' : ROMAN[idx]);
      btn.appendChild(pin);

      const labelPos = ch.map.label_pos || 'below';
      const label = el('span', `gs-node-label gs-label-${labelPos}`, `${ROMAN[idx]}. ${ch.title}`);
      btn.appendChild(label);

      btn.addEventListener('click', () => {
        this.selectedIndex = idx;
        this.bannerToast = null;
        this.renderMap();
      });
      btn.addEventListener('dblclick', () => {
        if (unlocked) this.openChapterScene(ch);
      });
      nodesLayer.appendChild(btn);
    });

    // Place the party badge cleanly opposite the frontier node's label so it never overlaps
    const frontier = chapters[frontierIdx] || chapters[0];
    const markerSide = frontier.map.label_pos === 'above' ? 'below' : 'above';
    const marker = el('div', `gs-party-marker gs-marker-${markerSide}`, this.allChaptersCompleted() ? 'Valley Restored' : 'Party Here');
    marker.style.left = `${frontier.map.x}%`;
    marker.style.top = `${frontier.map.y}%`;
    nodesLayer.appendChild(marker);

    frame.appendChild(nodesLayer);
    main.appendChild(frame);

    const selected = chapters[this.selectedIndex] || chapters[0];
    const selUnlocked = this.progress.isUnlocked(this.selectedIndex);
    const selDone = this.progress.isComplete(this.selectedIndex);

    const dossier = el('section', 'gs-dossier');

    const meta = el('div', 'gs-dossier-meta');
    const kicker = el('div', 'gs-dossier-kicker');
    kicker.appendChild(el('span', '', `${selected.chapter_label} · Act ${selected.act}`));
    kicker.appendChild(el('span', 'gs-lv-badge', `Heroes Lv ${selected.hero_level}`));
    if (selDone) {
      kicker.appendChild(el('span', 'gs-complete-banner', 'Cleared'));
    }
    meta.appendChild(kicker);
    meta.appendChild(el('h2', 'gs-dossier-title', selected.title));
    meta.appendChild(el('p', 'gs-dossier-loc', `${selected.location} — ${selected.blurb || ''}`));
    dossier.appendChild(meta);

    const partyStrip = el('div', 'gs-party-strip');
    selected.party.forEach((hid) => {
      const h = this.data.heroes[hid];
      if (!h) return;
      const chip = el('div', 'gs-party-chip');
      const avatar = el('img', 'gs-party-avatar');
      avatar.src = this.resolveUrl(h.portrait);
      avatar.alt = h.name;
      chip.appendChild(avatar);
      const info = el('div');
      info.appendChild(el('div', 'gs-party-name', h.name));
      info.appendChild(el('div', 'gs-party-role', h.role));
      chip.appendChild(info);
      partyStrip.appendChild(chip);
    });
    dossier.appendChild(partyStrip);

    const ctaWrap = el('div', 'gs-dossier-actions');
    if (selUnlocked) {
      const sceneLabel = selDone
        ? 'Replay Scene'
        : this.selectedIndex === 0
          ? 'Begin Story'
          : 'Watch Scene & March';
      const watchBtn = el('button', 'gs-btn gs-btn-primary gs-btn-pulse', sceneLabel);
      watchBtn.type = 'button';
      watchBtn.addEventListener('click', () => this.openChapterScene(selected));
      ctaWrap.appendChild(watchBtn);

      const fightBtn = el('button', 'gs-btn', selDone ? 'Replay Battle' : 'Skip to Battle');
      fightBtn.type = 'button';
      fightBtn.addEventListener('click', () => this.launchBattle(selected));
      ctaWrap.appendChild(fightBtn);
    } else {
      const prev = chapters[this.selectedIndex - 1];
      const lockedBtn = el('button', 'gs-btn', `Clear ${prev ? prev.chapter_label : 'previous'} to unlock`);
      lockedBtn.type = 'button';
      lockedBtn.disabled = true;
      ctaWrap.appendChild(lockedBtn);
    }
    dossier.appendChild(ctaWrap);

    main.appendChild(dossier);
    this.root.appendChild(main);
  }

  openChapterScene(chapter) {
    this.bannerToast = null;
    this.renderScene({
      kicker: `${chapter.chapter_label} · ${chapter.location}`,
      scene: chapter.scene,
      musicId: chapter.music,
      primaryLabel: 'Enter Battle →',
      onPrimary: () => this.launchBattle(chapter),
    });
  }

  openEpilogue() {
    this.bannerToast = null;
    this.progress.setData('epilogue_seen', true);
    this.renderScene({
      kicker: 'Epilogue · Bell Court at Dawn',
      scene: this.data.epilogue,
      musicId: this.data.epilogue.music,
      primaryLabel: 'Return to Alderreach',
      onPrimary: () => this.renderMap(),
    });
  }

  renderScene({ kicker, scene, musicId, primaryLabel, onPrimary }) {
    if (this.destroyed || !this.root) return;
    this.viewMode = 'scene';
    if (this.activeRaf) {
      cancelAnimationFrame(this.activeRaf);
      this.activeRaf = null;
    }

    this.root.innerHTML = '';
    this.root.appendChild(this.buildTopbar());

    const wrap = el('main', 'gs-scene-view');
    const stage = el('div', 'gs-stage');

    const stillImg = el('img', 'gs-stage-still');
    stillImg.src = this.resolveUrl(scene.still);
    stillImg.alt = scene.title;
    stage.appendChild(stillImg);

    let videoEl = null;
    if (scene.video) {
      videoEl = el('video', 'gs-stage-video');
      videoEl.src = this.resolveUrl(scene.video);
      videoEl.muted = true;
      videoEl.loop = false;
      videoEl.playsInline = true;
      videoEl.autoplay = true;
      videoEl.preload = 'auto';
      videoEl.addEventListener('canplay', () => {
        videoEl.classList.add('is-ready');
        if (!videoEl.ended) videoEl.play().catch(() => {});
      }, { once: true });
      stage.appendChild(videoEl);
      this.activeVideoEl = videoEl;
    }

    stage.appendChild(el('div', 'gs-stage-scrim'));

    const header = el('div', 'gs-scene-header');
    const titleBox = el('div');
    titleBox.appendChild(el('div', 'gs-scene-kicker', kicker));
    titleBox.appendChild(el('h2', 'gs-scene-title', scene.title));
    header.appendChild(titleBox);

    const ctrls = el('div', 'gs-scene-controls');
    const capBtn = el('button', 'gs-btn', this.captionsOn ? 'Captions: On' : 'Captions: Off');
    capBtn.type = 'button';
    const pauseBtn = el('button', 'gs-btn', 'Pause');
    pauseBtn.type = 'button';
    const replayBtn = el('button', 'gs-btn', 'Replay');
    replayBtn.type = 'button';
    ctrls.appendChild(capBtn);
    ctrls.appendChild(pauseBtn);
    ctrls.appendChild(replayBtn);
    header.appendChild(ctrls);
    stage.appendChild(header);

    const dock = el('div', 'gs-dialogue-dock');
    const card = el('div', 'gs-dialogue-card');

    const portraitWrap = el('div', 'gs-speaker-portrait-wrap');
    const body = el('div', 'gs-dialogue-body');
    const speakerEl = el('div', 'gs-speaker-name');
    const textEl = el('p', 'gs-dialogue-text');
    body.appendChild(speakerEl);
    body.appendChild(textEl);

    const ctaBox = el('div', 'gs-dialogue-cta');
    const nextLineBtn = el('button', 'gs-btn', 'Next Line ›');
    nextLineBtn.type = 'button';
    const primaryBtn = el('button', 'gs-btn gs-btn-primary', primaryLabel);
    primaryBtn.type = 'button';
    ctaBox.appendChild(nextLineBtn);
    ctaBox.appendChild(primaryBtn);

    card.appendChild(portraitWrap);
    card.appendChild(body);
    card.appendChild(ctaBox);

    const track = el('div', 'gs-progress-track');
    const fill = el('div', 'gs-progress-fill');
    track.appendChild(fill);

    dock.appendChild(card);
    dock.appendChild(track);
    stage.appendChild(dock);
    wrap.appendChild(stage);
    this.root.appendChild(wrap);

    const cues = scene.cues || [];
    let currentCueIdx = -1;

    const renderCue = (idx) => {
      if (idx === currentCueIdx || idx < 0 || idx >= cues.length) return;
      currentCueIdx = idx;
      const cue = cues[idx];
      const hero = this.data.heroes[cue.speaker_id];
      const accent = hero ? hero.accent : '#e8c468';
      card.style.setProperty('--gs-speaker-accent', accent);
      speakerEl.textContent = hero ? `${hero.name} — ${hero.role}` : cue.speaker;
      textEl.textContent = cue.text;

      portraitWrap.innerHTML = '';
      if (hero) {
        const pImg = el('img', 'gs-speaker-portrait');
        pImg.src = this.resolveUrl(hero.portrait);
        pImg.alt = hero.name;
        portraitWrap.appendChild(pImg);
      } else {
        const sigil = el('div', 'gs-narrator-sigil');
        sigil.appendChild(createBellSvg('gs-narrator-bell-svg'));
        portraitWrap.appendChild(sigil);
      }
    };

    const applyCaptionVisibility = () => {
      portraitWrap.hidden = !this.captionsOn;
      body.hidden = !this.captionsOn;
      card.classList.toggle('is-hidden-captions', !this.captionsOn);
      capBtn.textContent = this.captionsOn ? 'Captions: On' : 'Captions: Off';
    };

    renderCue(0);
    applyCaptionVisibility();

    const syncFromAudio = () => {
      if (this.destroyed || this.viewMode !== 'scene') return;
      const t = this.audio.voiceEl.currentTime || 0;
      const dur = this.audio.voiceEl.duration || scene.audio_duration || 1;
      fill.style.width = `${Math.min(100, (t / dur) * 100).toFixed(1)}%`;

      let activeIdx = 0;
      for (let i = 0; i < cues.length; i += 1) {
        if (t >= cues[i].start - 0.12) activeIdx = i;
      }
      renderCue(activeIdx);

      if (!this.audio.voiceEl.paused && !this.audio.voiceEl.ended) {
        this.activeRaf = requestAnimationFrame(syncFromAudio);
      }
    };

    const startPlayback = () => {
      primaryBtn.classList.remove('gs-btn-pulse');
      pauseBtn.textContent = 'Pause';
      this.audio.playMusic(musicId, this.data.music, true);
      this.audio.playVoice(scene.audio, () => {
        fill.style.width = '100%';
        this.audio.setMusicDucked(false);
        primaryBtn.classList.add('gs-btn-pulse');
        pauseBtn.textContent = 'Replay';
      }).then(() => {
        this.activeRaf = requestAnimationFrame(syncFromAudio);
      }).catch(() => {
        pauseBtn.textContent = 'Play Voice';
      });
    };

    const togglePause = () => {
      if (this.audio.voiceEl.ended) {
        if (videoEl) {
          videoEl.currentTime = 0;
          videoEl.play().catch(() => {});
        }
        startPlayback();
        return;
      }
      if (this.audio.voiceEl.paused) {
        if (videoEl && !videoEl.ended) {
          videoEl.play().catch(() => {});
        }
        this.audio.voiceEl.play().then(() => {
          pauseBtn.textContent = 'Pause';
          this.audio.setMusicDucked(true);
          this.activeRaf = requestAnimationFrame(syncFromAudio);
        }).catch(() => {});
      } else {
        if (videoEl && !videoEl.ended) {
          videoEl.pause();
        }
        this.audio.voiceEl.pause();
        pauseBtn.textContent = 'Resume';
        this.audio.setMusicDucked(false);
      }
    };

    const nextLine = () => {
      const next = currentCueIdx + 1;
      if (next < cues.length) {
        this.audio.voiceEl.currentTime = cues[next].start;
        renderCue(next);
        if (this.audio.voiceEl.paused && !this.audio.voiceEl.ended) {
          this.audio.voiceEl.play().catch(() => {});
        }
        this.activeRaf = requestAnimationFrame(syncFromAudio);
      } else {
        onPrimary();
      }
    };

    this._sceneHotkeys = { togglePause, nextLine };

    capBtn.addEventListener('click', () => {
      this.captionsOn = !this.captionsOn;
      applyCaptionVisibility();
    });
    pauseBtn.addEventListener('click', togglePause);
    replayBtn.addEventListener('click', () => {
      if (videoEl) {
        videoEl.currentTime = 0;
        videoEl.play().catch(() => {});
      }
      startPlayback();
    });
    nextLineBtn.addEventListener('click', nextLine);
    primaryBtn.addEventListener('click', () => onPrimary());

    startPlayback();
  }

  launchBattle(chapter) {
    if (typeof this.bridge.startLevel === 'function') {
      this.bridge.startLevel({
        chapter: chapter.index,
        title: `${chapter.chapter_label}: ${chapter.title}`,
        encounter: chapter.encounter,
        preset: chapter.preset,
        hero_level: chapter.hero_level,
      });
    } else {
      this.unmount();
    }
  }
}

export function mount(container, bridge = {}) {
  if (activeController) {
    activeController.unmount();
    activeController = null;
  }
  const ctrl = new GeminiStoryController(container, bridge);
  activeController = ctrl;
  return ctrl.mount().catch((err) => {
    if (!ctrl.destroyed && ctrl.root) {
      ctrl.root.textContent = `Could not load The Unrung Bell: ${err?.message || err}`;
    }
  });
}

export function unmount() {
  if (activeController) {
    activeController.unmount();
    activeController = null;
  }
}

export function onBattleEnd(result) {
  if (activeController) {
    activeController.handleBattleEnd(result);
  }
}
