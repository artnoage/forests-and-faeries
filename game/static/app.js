/* Forests and Faeries: a 3D tactical tabletop over the ember-rs engine (checked against Natural20).
 * Every legal move, target, saving throw, hit point change and die roll comes from
 * the server (game/server.py); this page only shows them and sends the player's choices. */
(() => {
  'use strict';

  const mountBase = new URL('./', window.location.href);
  const apiURL = endpoint => new URL(`api/${endpoint}`, mountBase).href;
  const $ = id => document.getElementById(id);
  const escape = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const column = x => (x < 26 ? '' : String.fromCharCode(64 + Math.floor(x / 26))) + String.fromCharCode(65 + (x % 26));
  const cellName = (x, y) => `${column(x)}${y + 1}`;
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

  const NICE_NAMES = {
    firebolt: 'Fire Bolt', fire_bolt: 'Fire Bolt', magic_missile: 'Magic Missile',
    chromatic_orb: 'Chromatic Orb', ray_of_frost: 'Ray of Frost', acid_splash: 'Acid Splash',
    scorching_ray: 'Scorching Ray', burning_hands: 'Burning Hands', thunderwave: 'Thunderwave',
    mage_armor: 'Mage Armor', mirror_image: 'Mirror Image', shield: 'Shield', sleep: 'Sleep',
    shatter: 'Shatter', sorcerous_burst: 'Sorcerous Burst', dragons_breath: "Dragon's Breath",
    cure_wounds: 'Cure Wounds', healing_word: 'Healing Word', bless: 'Bless', aid: 'Aid',
    guiding_bolt: 'Guiding Bolt', sacred_flame: 'Sacred Flame', sanctuary: 'Sanctuary',
    shield_of_faith: 'Shield of Faith', spiritual_weapon: 'Spiritual Weapon', command: 'Command',
    lesser_restoration: 'Lesser Restoration', protection_from_evil_and_good: 'Prot. Evil & Good',
    empowered_spell: 'Empowered', heightened_spell: 'Heightened',
    will_o_wisp: "Will-o'-Wisp",
  };
  const niceName = k => NICE_NAMES[k] || String(k || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // The strongest creature names a level card's portrait.
  const LEAD_ORDER = ['green_hag', 'sea_hag', 'will_o_wisp', 'mummy', 'wight', 'ghast', 'specter',
    'bugbear_warrior', 'dryad', 'harpy', 'animated_armor', 'ghoul', 'shadow', 'goblin_boss',
    'satyr', 'steam_mephit', 'giant_wasp', 'blink_dog', 'violet_fungus', 'sprite',
    'zombie', 'skeleton', 'goblin_warrior', 'kobold_warrior', 'goblin_minion'];

  function portraitSymbol(unit) {
    const raw = [unit?.base_id, unit?.content, unit?.kind, unit?.class, unit?.id, unit?.name].filter(Boolean).join(' ').toLowerCase();
    if (raw.includes('violet_fungus') || raw.includes('violet fungus')) return 'violet_fungus';
    if (raw.includes('giant_wasp') || raw.includes('giant wasp')) return 'giant_wasp';
    if (raw.includes('satyr')) return 'satyr';
    if (raw.includes('steam_mephit') || raw.includes('steam mephit')) return 'steam_mephit';
    if (raw.includes('blink_dog') || raw.includes('blink dog')) return 'blink_dog';
    if (raw.includes('sprite')) return 'sprite';
    if (raw.includes('dryad')) return 'dryad';
    if (raw.includes('bugbear')) return 'bugbear_warrior';
    if (raw.includes('harpy')) return 'harpy';
    if (raw.includes('sea_hag') || raw.includes('sea hag')) return 'sea_hag';
    if (raw.includes('green_hag') || raw.includes('green hag')) return 'green_hag';
    if (raw.includes('will_o_wisp') || raw.includes("will-o'-wisp") || raw.includes('will o wisp')) return 'will_o_wisp';
    if (raw.includes('animated_armor') || raw.includes('armor')) return 'armor';
    if (raw.includes('kobold')) return 'kobold';
    if (raw.includes('mummy')) return 'mummy';
    if (raw.includes('wight')) return 'wight';
    if (raw.includes('specter') || raw.includes('shadow')) return 'specter';
    if (raw.includes('ghoul') || raw.includes('ghast')) return 'ghoul';
    if (raw.includes('zombie')) return 'zombie';
    if (raw.includes('skeleton')) return 'skeleton';
    if (raw.includes('goblin')) return 'goblin';
    if (raw.includes('barbarian') || raw.includes('chruna')) return 'barbarian';
    if (raw.includes('cleric') || raw.includes('elion')) return 'cleric';
    if (raw.includes('sorcerer') || raw.includes('curogana')) return 'sorcerer';
    if (raw.includes('wizard') || raw.includes('ilyra')) return 'mage';
    return unit?.team === 'monsters' ? 'goblin' : 'fighter';
  }

  function portrait(unit, extra = '') {
    const sym = portraitSymbol(unit);
    return `<svg class="portrait ${unit?.team === 'monsters' ? 'monster' : ''} ${extra}" viewBox="0 0 76 86" aria-hidden="true" focusable="false"><path class="portrait-frame" d="M3 1h70v73L38 85 3 74Z"/><path class="portrait-inner" d="M8 6h60v65L38 80 8 71Z"/><use href="#art-${sym}" x="3" y="5" width="70" height="80"/></svg>`;
  }

  function hpBar(unit, cls = 'hp-track') {
    return `<progress class="${cls}" value="${Math.max(0, Number(unit.hp) || 0)}" max="${Math.max(1, Number(unit.max_hp) || 1)}" aria-label="${escape(unit.name)} HP ${escape(unit.hp)}/${escape(unit.max_hp)}"></progress>`;
  }

  function icon(kind, label) {
    const normalized = String(label || '').toLowerCase().replace(/[_-]/g, ' ');
    const key = normalized.includes('fire') || normalized.includes('burning') || normalized.includes('scorching') || normalized.includes('sacred') ? 'fire'
      : normalized.includes('missile') || normalized.includes('orb') || normalized.includes('guiding') || normalized.includes('burst') ? 'missile'
      : normalized.includes('cure') || normalized.includes('heal') || normalized.includes('preserve') || normalized.includes('wind') || normalized.includes('first aid') ? 'second_wind'
      : normalized.includes('escape grapple') || normalized.includes('break free') ? 'dodge'
      : kind === 'action_surge' ? 'dash'
      : kind === 'stand' ? 'move'
      : kind === 'feature' ? 'spell'
      : kind === 'attack' && normalized.includes('bow') ? 'bow' : kind;
    const known = ['move', 'attack', 'bow', 'fire', 'missile', 'spell', 'dodge', 'dash', 'second_wind'];
    const artwork = known.includes(key) ? key : 'spell';
    return `<svg class="action-icon" data-action-icon="${artwork}" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><use href="#action-art-${artwork}"></use></svg>`;
  }

  // ===========================================================================
  // DICE TRAY: the engine's own draws, drawn as tumbling polyhedra on a 2D canvas
  // ===========================================================================
  const POLYHEDRA = (() => {
    const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
    const d4v = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]].map(norm);
    const d4f = [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]];
    const s = 1 / Math.sqrt(3);
    const d6v = [[-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s], [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]];
    const d6f = [[4, 5, 6, 7], [1, 0, 3, 2], [5, 1, 2, 6], [0, 4, 7, 3], [7, 6, 2, 3], [0, 1, 5, 4]];
    const d8v = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    const d8f = [[0, 2, 4], [4, 2, 1], [1, 2, 5], [5, 2, 0], [4, 3, 0], [1, 3, 4], [5, 3, 1], [0, 3, 5]];
    const d10v = [[0, 1.05, 0], [0, -1.05, 0]];
    for (let i = 0; i < 5; i++) { const a = (i * 2 * Math.PI) / 5; d10v.push([Math.cos(a) * 0.92, 0, Math.sin(a) * 0.92]); }
    const d10f = [];
    for (let i = 0; i < 5; i++) { const n = 2 + i, m = 2 + ((i + 1) % 5); d10f.push([0, m, n], [1, n, m]); }
    const phi = (1 + Math.sqrt(5)) / 2;
    const d20v = [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0], [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]].map(norm);
    const d20f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    const d12v = d20f.map(f => norm([0, 1, 2].map(k => (d20v[f[0]][k] + d20v[f[1]][k] + d20v[f[2]][k]) / 3)));
    const d12f = d20v.map((v, vi) => {
      const inc = [];
      d20f.forEach((f, fi) => { if (f.includes(vi)) inc.push(fi); });
      const ref = d12v[inc[0]], dot = ref[0] * v[0] + ref[1] * v[1] + ref[2] * v[2];
      const u = norm([ref[0] - v[0] * dot, ref[1] - v[1] * dot, ref[2] - v[2] * dot]);
      const w = [v[1] * u[2] - v[2] * u[1], v[2] * u[0] - v[0] * u[2], v[0] * u[1] - v[1] * u[0]];
      const angle = p => Math.atan2(p[0] * w[0] + p[1] * w[1] + p[2] * w[2], p[0] * u[0] + p[1] * u[1] + p[2] * u[2]);
      return inc.sort((a, b) => angle(d12v[a]) - angle(d12v[b]));
    });
    return { 4: { v: d4v, f: d4f }, 6: { v: d6v, f: d6f }, 8: { v: d8v, f: d8f }, 10: { v: d10v, f: d10f }, 12: { v: d12v, f: d12f }, 20: { v: d20v, f: d20f } };
  })();

  const keptValue = d => {
    const vals = Array.isArray(d.v) ? d.v : [d.v];
    return d.mode === 'a' ? Math.max(...vals) : d.mode === 'd' ? Math.min(...vals) : vals[0];
  };
  const isCheckDraw = d => !/^savage_attacker$/i.test(d.tag || '') && /attack|sav|initiative|check/i.test(d.tag || '');

  const diceArena = (() => {
    const canvas = $('dice-canvas');
    const ctx = canvas.getContext('2d');
    let dice = [], animStart = 0, animFrame = 0, lastSig = '';
    const DURATION = 860;

    function rot3(p, rx, ry, rz) {
      let [x, y, z] = p;
      const cx = Math.cos(rx), sx = Math.sin(rx);
      [y, z] = [y * cx - z * sx, y * sx + z * cx];
      const cy = Math.cos(ry), sy = Math.sin(ry);
      [x, z] = [x * cy + z * sy, -x * sy + z * cy];
      const cz = Math.cos(rz), sz = Math.sin(rz);
      [x, y] = [x * cz - y * sz, x * sz + y * cz];
      return [x, y, z];
    }
    function paletteFor(d) {
      if (d.crit) return { base: [215, 162, 52], edge: '#fff0ad', txt: '#fffbe6' };
      if (d.fumble) return { base: [168, 52, 46], edge: '#ffb3a6', txt: '#ffe4de' };
      if (d.sides === 20) return { base: [34, 96, 108], edge: '#7ef2dc', txt: '#f2fffd' };
      if (d.sides >= 10) return { base: [86, 58, 128], edge: '#d3b8ff', txt: '#f7f0ff' };
      return { base: [122, 84, 44], edge: '#f2ca82', txt: '#fff6e3' };
    }
    function drawFrame(now) {
      animFrame = 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 300, h = canvas.clientHeight || 104;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!dice.length) {
        ctx.fillStyle = 'rgba(182, 201, 204, 0.55)';
        ctx.font = 'italic 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No dice rolled yet', w / 2, h / 2 + 4);
        return;
      }
      const t = Math.min(1, Math.max(0, now - animStart) / DURATION);
      const spinLeft = Math.pow(1 - t, 2.6);
      const shown = dice.slice(0, 4);
      const slotW = w / shown.length;
      const radius = Math.min(31, slotW * 0.36, h * 0.34);
      shown.forEach((d, i) => {
        const shape = POLYHEDRA[d.sides] || POLYHEDRA[20];
        const cx = slotW * (i + 0.5);
        const bounce = Math.abs(Math.sin(t * Math.PI * 2.5)) * (1 - t) * 16;
        const cy = h * 0.50 - bounce;
        const rx = d.seedX + spinLeft * (8.5 + i * 1.4), ry = d.seedY + spinLeft * (11.2 - i * 1.9), rz = d.seedZ + spinLeft * 5.4;
        const pal = paletteFor(d);
        ctx.fillStyle = 'rgba(0,0,0,0.42)';
        ctx.beginPath();
        ctx.ellipse(cx, h * 0.46 + radius * 0.88, radius * (0.78 - bounce * 0.01), radius * 0.24, 0, 0, Math.PI * 2);
        ctx.fill();
        const rv = shape.v.map(v => rot3(v, rx, ry, rz));
        const faces = shape.f.map(f => {
          const pts = f.map(idx => rv[idx]);
          const czAvg = pts.reduce((sum, p) => sum + p[2], 0) / pts.length;
          const [a, b, c] = pts;
          const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
          let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
          const nl = Math.hypot(nx, ny, nz) || 1;
          nx /= nl; ny /= nl; nz /= nl;
          return { pts, nx, ny, nz, czAvg };
        }).sort((fa, fb) => fa.czAvg - fb.czAvg);
        for (const face of faces) {
          if (face.nz < -0.15) continue;
          const light = Math.max(0.22, Math.min(1.22, 0.48 + face.nx * -0.35 + face.ny * -0.45 + face.nz * 0.68));
          ctx.beginPath();
          face.pts.forEach((p, idx) => {
            const persp = 3.2 / (3.2 - p[2] * 0.55);
            const sx = cx + p[0] * radius * persp, sy = cy + p[1] * radius * persp;
            if (idx === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          });
          ctx.closePath();
          ctx.fillStyle = `rgb(${pal.base.map(c => Math.min(255, Math.round(c * light))).join(',')})`;
          ctx.fill();
          ctx.strokeStyle = pal.edge; ctx.lineWidth = 1.15; ctx.stroke();
        }
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.92)'; ctx.shadowBlur = 6;
        ctx.fillStyle = pal.txt;
        ctx.font = `900 ${radius > 25 ? 16 : 14}px system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(d.kept), cx, cy + 1);
        ctx.restore();
        ctx.fillStyle = d.crit ? '#ffe694' : d.fumble ? '#ff9c8a' : '#b8cdd0';
        ctx.font = '700 9.5px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`d${d.sides}${d.mode === 'a' ? ' adv' : d.mode === 'd' ? ' dis' : ''}${d.crit ? ' ★' : d.fumble ? ' ✕' : ''}`, cx, h - 8);
      });
      if (t < 1) animFrame = requestAnimationFrame(drawFrame);
    }
    function start(force) {
      animStart = reducedMotion() ? performance.now() - DURATION : (force ? performance.now() : animStart);
      if (!animFrame) animFrame = requestAnimationFrame(drawFrame);
    }
    function setDraws(draws, forceTumble = false) {
      dice = draws.map((d, idx) => {
        const kept = keptValue(d);
        const rawSides = Number(d.sides) || 20;
        const sides = [4, 6, 8, 10, 12, 20].includes(rawSides) ? rawSides : 20;
        const check = sides === 20 && isCheckDraw(d);
        return { ...d, kept, sides, crit: check && kept === 20, fumble: check && kept === 1,
          seedX: 0.35 + (kept * 0.41 + idx * 0.7) % 1.2, seedY: 0.42 + (kept * 0.63 + idx * 0.9) % 1.4, seedZ: 0.12 + (idx * 0.25) % 0.6 };
      });
      const sig = JSON.stringify(dice.map(m => [m.sides, m.kept, m.tag, m.who]));
      const changed = sig !== lastSig;
      lastSig = sig;
      start(forceTumble || changed);
    }
    return { setDraws, tumble: () => start(true), redraw: () => drawFrame(performance.now()) };
  })();

  // ===========================================================================
  // THEMES (the encounter picks one; the player may override it)
  // ===========================================================================
  const THEME_SWATCHES = [
    { id: 'ossuary', label: 'Ancient Ossuary', desc: 'Travertine and slate' },
    { id: 'catacombs', label: 'Mossy Ruin Court', desc: 'Wet cobbles and moss' },
    { id: 'caverns', label: 'Frosted Soul Caverns', desc: 'Slate and cyan frost' },
    { id: 'reliquary', label: 'Gothic Reliquary', desc: 'Dark marble and bronze' },
    { id: 'sanctum', label: 'Obsidian Sanctum', desc: 'Hex basalt and runes' },
    { id: 'crucible', label: 'Infernal Crucible', desc: 'Volcanic rock and magma' },
    { id: 'forged_hall', label: 'Dwarven Forged Hall', desc: 'Granite and iron' },
    { id: 'woodland', label: 'Whispering Woodland', desc: 'Mossy earth, roots and oaks' },
    { id: 'mausoleum', label: 'Gothic Mausoleum', desc: 'Carved stone, violet light' },
    { id: 'mausoleum_crypt', label: 'Violet Ossuary', desc: 'Old stone, violet light' },
    { id: 'mausoleum_caves', label: 'Violet Caverns', desc: 'Rock and violet crystal' },
  ];
  const themeInfo = id => THEME_SWATCHES.find(t => t.id === id) || THEME_SWATCHES[0];

  // ===========================================================================
  // APPLICATION STATE
  // ===========================================================================
  const RECOVERY_LIMIT = 3, RECOVERY_WINDOW_MS = 60000, RECOVERY_DELAY_MS = 1500;
  const NEEDS_CONFIRM = new Set(['channel_divinity_turn_undead', 'preserve_life', 'innate_sorcery', 'action_surge', 'rage', 'create_spell_slot', 'convert_spell_slot']);
  const SHORTCUT_KEY = 'ff-shortcuts';
  const IDLE_KEY = 'ff-idle-animation';

  let catalogue = [];            // [{id, name, blurb, private, presets: [level view]}]
  let state = null;
  let busy = false, paused = false, watching = false, timer = null, playing = false;
  let selectedGroup = null, activeCatFilter = 'all', setupFigure = null, inspectedId = null;
  let choices = [], focusCell = { x: 1, y: 1 }, lastLogIds = [], seenRevision = null, lastAutoRevision = null;
  let hadError = false, lastActionId = 0;
  const retiredEncounters = [];
  let selectedLevel = null, selectedOption = null, allocation = new Map(), preview = null, armed = null;
  let selectedVariant = null, variantMemory = new Map(), poolsSeen = new Map(), infoKey = null, infoOpen = false, sheetUnitId = null;
  let previewSet = new Set();

  const DIFFICULTIES = [
    { id: 'Easy', label: 'Easy', tagline: 'Skirmishes and openings', desc: 'Shorter fights to learn the board, positioning and spells.', fallbackLead: 'skeleton' },
    { id: 'Medium', label: 'Medium', tagline: 'Balanced tactics', desc: 'Mixed threats with spellcasters, hazards and tougher foes.', fallbackLead: 'wight' },
    { id: 'Hard', label: 'Hard', tagline: 'Deadly encounters', desc: 'Multi-threat battles built for a full party and sharp play.', fallbackLead: 'ghast' },
    { id: 'Unbeatable', label: 'Unbeatable', tagline: 'Unconquered by our agents', desc: 'No language-model player won these levels, and both game AIs won fewer than half of their 500 games.', fallbackLead: 'mummy' },
  ];
  const LEGACY_ENCOUNTERS = new Set(['crypt', 'vault']);

  let startScreenOpen = true;
  let startStep = 'mode';        // 'mode' | 'difficulty' | 'levels'
  let selectedDifficulty = 'Easy';
  let selectedHeroLevelFilter = 'all';  // 'all' | '1' | '2' | '3' | 'mixed'
  let launched = false;          // the start screen can be closed once a level was chosen
  let selectedStart = null;      // {encounter, preset}
  let selectedTheme = 'auto';
  let themeManualOverride = false;
  // A fight started from a story (story.js): {story, chapter, encounter, preset, hero_level, seed, title}.
  // Practice launches clear it; the result overlay and the Levels button follow it.
  let storyRun = null;
  let finishedSignal = null;

  let activeCamPreset = 'tactical', followCamEnabled = false;   // the camera stays where the player puts it; Follow is opt-in (ff-cam-follow)
  var actionZoom = true;   // var: the viewer may be built before the settings code below runs
  let leftDrawerOpen = window.innerWidth > 900, rightDrawerOpen = false, minimapVisible = false;
  let shortcutsEnabled = true;
  try { shortcutsEnabled = localStorage.getItem(SHORTCUT_KEY) !== 'off'; } catch { /* private window */ }
  let idleAnimationOn = false;
  try { idleAnimationOn = localStorage.getItem(IDLE_KEY) === 'on'; } catch { /* private window */ }

  let viewer = null, viewerAttempted = false, sceneUnavailable = false, resizeObserver = null;
  let assetsReady = false, startupClosed = false;
  let recoveries = [], recoveryTimer = 0;

  const catOf = action => action.category || action.kind;
  // One card per ability. The damage-type versions of a spell, a weapon's thrown use, Preserve
  // Life's ways to share its healing and Font of Magic's exchanges are variants of one card,
  // picked as a second step (UI only: every variant keeps its own action id).
  const VARIANT_DAMAGE = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'];
  function variantOf(action) {
    const label = String(action?.label || '');
    let m = label.match(/^(.+) \(([a-z]+)\)$/);
    if (m && VARIANT_DAMAGE.includes(m[2])) return { base: m[1], noun: 'Damage type', value: m[2] };
    if (m && m[2] === 'thrown') return { base: m[1], noun: 'Use', value: 'thrown' };
    m = label.match(/^Preserve Life \((.+)\)$/);
    if (m) return { base: 'Preserve Life', noun: 'Healing', value: m[1] };
    m = label.match(/^Font of Magic: (.+)$/);
    if (m) return { base: 'Font of Magic', noun: 'Exchange', value: m[1] };
    return { base: label, noun: '', value: '' };
  }
  const groupKey = action => JSON.stringify([catOf(action), variantOf(action).base]);
  function variantsOf(list) {
    const seen = [];
    for (const a of list) if (!seen.includes(variantOf(a).value)) seen.push(variantOf(a).value);
    return seen.includes('') ? ['', ...seen.filter(v => v !== '')] : seen;
  }
  function variantNoun(list) {
    for (const a of list) if (variantOf(a).noun) return variantOf(a).noun;
    return '';
  }
  function pickVariant(variants, wanted, remembered) {
    if (variants.includes(wanted)) return wanted;
    return variants.includes(remembered) ? remembered : variants[0];
  }
  function variantText(noun, value) {
    if (value === '') return noun === 'Use' ? 'Melee' : 'Standard';
    if (noun === 'Exchange') {
      return value.replace(/^create level (\d+) spell slot \((\d+) sorcery points\)$/i, 'Create a level $1 slot ($2 points)')
        .replace(/^convert level (\d+) spell slot to sorcery points$/i, 'Level $1 slot → points');
    }
    return noun === 'Healing' ? value : value.charAt(0).toUpperCase() + value.slice(1);
  }
  const activeUnit = () => state?.units.find(u => u.id === state.turn_id) || state?.units.find(u => u.active) || null;
  const canAct = () => !!state?.can_act && !busy && !watching;
  const objects = () => Array.isArray(state?.objects) ? state.objects : [];
  const targets = () => [...(state?.units || []), ...objects().filter(o => !o.destroyed)];
  const atCell = (obj, x, y) => x >= obj.x && y >= obj.y && x < obj.x + (obj.width || 1) && y < obj.y + (obj.depth || 1);
  const actions = () => Array.isArray(state?.actions) ? state.actions : [];
  const displayRound = () => (Number(state?.round) || 0) + 1;

  const groupedActions = () => {
    const groups = new Map();
    for (const action of actions()) {
      const key = groupKey(action);
      if (!groups.has(key)) groups.set(key, { key, kind: catOf(action), label: variantOf(action).base, actions: [] });
      groups.get(key).actions.push(action);
    }
    return [...groups.values()];
  };
  // The selected card's actions of the chosen variant (the last one picked for that card this fight).
  const variantActions = () => {
    const all = canAct() ? actions().filter(a => groupKey(a) === selectedGroup) : [];
    const v = pickVariant(variantsOf(all), selectedVariant, variantMemory.get(selectedGroup));
    return all.filter(a => variantOf(a).value === v);
  };
  const groupActions = variantActions;
  const paymentKey = a => a.at_level == null ? null : (a.free_cast ? 'free' : String(a.at_level));
  const levelsOf = list => [...new Set(list.map(paymentKey).filter(l => l !== null))].sort((a, b) => a === 'free' ? -1 : b === 'free' ? 1 : Number(a) - Number(b));
  const optionsOf = list => [...new Set(list.map(a => a.option || ''))].sort((a, b) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)));
  const currentActions = () => {
    const list = groupActions();
    const levels = levelsOf(list);
    const level = levels.includes(selectedLevel) ? selectedLevel : levels[0];
    const opts = optionsOf(list.filter(a => paymentKey(a) === (level ?? null)));
    const opt = opts.includes(selectedOption) ? selectedOption : opts[0];
    return list.filter(a => paymentKey(a) === (level ?? null) && (a.option || '') === opt);
  };

  const DAMAGE_DEFENSES = {
    animated_armor: { resistances: [], immunities: ['poison', 'psychic'], vulnerabilities: [] },
    ghast: { resistances: ['necrotic'], immunities: ['poison'], vulnerabilities: [] },
    ghoul: { resistances: [], immunities: ['poison'], vulnerabilities: [] },
    mummy: { resistances: [], immunities: ['necrotic', 'poison'], vulnerabilities: ['fire'] },
    shadow: { resistances: ['acid', 'cold', 'fire', 'lightning', 'thunder'], immunities: ['necrotic', 'poison'], vulnerabilities: ['radiant'] },
    skeleton: { resistances: [], immunities: ['poison'], vulnerabilities: ['bludgeoning'] },
    specter: { resistances: ['acid', 'bludgeoning', 'cold', 'fire', 'lightning', 'piercing', 'slashing', 'thunder'], immunities: ['necrotic', 'poison'], vulnerabilities: [] },
    steam_mephit: { resistances: [], immunities: ['fire', 'poison'], vulnerabilities: [] },
    wight: { resistances: ['necrotic'], immunities: ['poison'], vulnerabilities: [] },
    will_o_wisp: { resistances: ['acid', 'bludgeoning', 'cold', 'fire', 'necrotic', 'piercing', 'slashing'], immunities: ['lightning', 'poison'], vulnerabilities: [] },
    zombie: { resistances: [], immunities: ['poison'], vulnerabilities: [] },
  };
  const DAMAGE_TYPES = new Set(['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder']);
  const SPELL_DAMAGE = {
    acid_splash: 'acid', firebolt: 'fire', fire_bolt: 'fire', burning_hands: 'fire', scorching_ray: 'fire',
    shatter: 'thunder', thunderwave: 'thunder', sacred_flame: 'radiant', guiding_bolt: 'radiant',
    magic_missile: 'force', spiritual_weapon: 'force', spiritual_weapon_attack: 'force',
    ray_of_frost: 'cold', shocking_grasp: 'lightning', toll_the_dead: 'necrotic', chill_touch: 'necrotic',
  };
  const WEAPON_DAMAGE = {
    warhammer: 'bludgeoning', mace: 'bludgeoning', club: 'bludgeoning', quarterstaff: 'bludgeoning', slam: 'bludgeoning',
    greatsword: 'slashing', longsword: 'slashing', halberd: 'slashing', handaxe: 'slashing', scimitar: 'slashing', claw: 'slashing',
    longbow: 'piercing', shortbow: 'piercing', shortsword: 'piercing', dagger: 'piercing', javelin: 'piercing', spear: 'piercing',
  };
  function actionDamageType(a) {
    if (!a || a.spell === 'dragons_breath') return null;
    const paren = String(a.label || '').match(/\(([^)]+)\)/);
    if (paren) {
      const t = paren[1].trim().toLowerCase();
      if (DAMAGE_TYPES.has(t)) return t;
    }
    for (const key of [a.option, a.mode]) {
      const t = String(key || '').trim().toLowerCase();
      if (DAMAGE_TYPES.has(t)) return t;
    }
    if (a.spell && SPELL_DAMAGE[a.spell]) return SPELL_DAMAGE[a.spell];
    if (SPELL_DAMAGE[a.kind]) return SPELL_DAMAGE[a.kind];
    if (a.kind === 'attack' || a.kind === 'cleave' || a.category === 'attack') {
      const base = String(a.label || '').replace(/\s*\(.*$/, '').replace(/\s+at unseen.*$/i, '').trim().toLowerCase();
      if (WEAPON_DAMAGE[base]) return WEAPON_DAMAGE[base];
    }
    return null;
  }
  function defenseTags(a, focusId = null) {
    const dtype = actionDamageType(a);
    const actor = activeUnit();
    if (!dtype || !actor) return [];
    const rawIds = a.cells ? (a.hits || []) : (a.target_ids?.length ? a.target_ids : (hasTarget(a) ? [a.target_id] : []));
    const ids = focusId && rawIds.includes(focusId) ? [focusId] : [...new Set(rawIds)];
    const solo = ids.length === 1 && (focusId || !a.cells);
    const out = [];
    for (const id of ids) {
      const u = (state?.units || []).find(unit => unit.id === id);
      if (!u || u.team === actor.team) continue;
      const d = DAMAGE_DEFENSES[u.content || u.kind || ''];
      if (!d) continue;
      if (d.vulnerabilities.includes(dtype)) out.push({ kind: 'vuln', text: `${solo ? 'takes double' : `${u.name} takes double`} ${dtype}` });
      else if (d.immunities.includes(dtype)) out.push({ kind: 'immune', text: `${solo ? 'immune to' : `${u.name} immune to`} ${dtype}` });
      else if (d.resistances.includes(dtype)) out.push({ kind: 'resist', text: `${solo ? 'resists' : `${u.name} resists`} ${dtype}` });
    }
    return out;
  }
  const defenseText = (a, focusId = null) => defenseTags(a, focusId).map(t => t.text).join('; ');
  const isSplit = list => list.some(a => (a.target_ids || []).length > 1);
  const isRayContinuation = () => actions().some(a => a.ray_number > 1);
  const HEAL_SPELLS = new Set(['healing_word', 'cure_wounds']);
  const HEAL_KINDS = new Set(['second_wind', 'preserve_life']);
  const isHealAction = a => Boolean(a) && (
    HEAL_SPELLS.has(a.spell)
    || HEAL_KINDS.has(a.kind)
    || (a.kind === 'divine_spark' && (a.option === 'heal' || a.mode === 'heal'))
  );
  function cursedTargets(a) {
    if (!isHealAction(a)) return [];
    const ids = [];
    if (Array.isArray(a.target_ids) && a.target_ids.length) ids.push(...a.target_ids);
    else if (hasTarget(a)) ids.push(a.target_id);
    else if (a.kind === 'second_wind' && activeUnit()) ids.push(activeUnit().id);
    else if (a.kind === 'preserve_life') {
      const lbl = String(a.label || '');
      for (const u of state?.units || []) {
        if (u.team === 'heroes' && u.name && lbl.includes(u.name)) ids.push(u.id);
      }
    }
    const seen = new Set(), out = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const u = (state?.units || []).find(unit => unit.id === id);
      if (u && (u.marks || []).includes('cursed')) out.push(u.name || id);
    }
    return out;
  }
  const cursedWarning = a => {
    const list = cursedTargets(a);
    return list.length ? `⚠ Cursed (cannot regain HP): ${list.join(', ')}.` : '';
  };
  const aidWarning = a => a?.aid_no_hp_targets?.length
    ? '⚠ Already aided — no HP gain for ' + a.aid_no_hp_targets.map(nameOf).join(', ') + '.' : '';
  function coverText(a, focusId = null) {
    if (!a?.cover) return '';
    const entries = Object.entries(a.cover);
    if (!entries.length) return '';
    if (focusId && a.cover[focusId]) return `cover +${a.cover[focusId]}`;
    if (entries.length === 1 && hasTarget(a) && entries[0][0] === a.target_id) return `cover +${entries[0][1]}`;
    return 'cover ' + entries.map(([id, bonus]) => `${nameOf(id)} +${bonus}`).join(', ');
  }
  function isDisengagedThisTurn() {
    const actor = activeUnit();
    if (!actor) return false;
    const flags = [...(actor.conditions || []), ...(actor.marks || [])].map(v => String(v || '').toLowerCase());
    if (flags.some(f => f.includes('disengag'))) return true;
    const logs = Array.isArray(state?.log) ? state.log : [];
    const curRound = Number(state?.round) || 0;
    const turnStart = `${actor.name} — turn begins.`;
    const prefix = `${actor.name} uses Disengage`;
    for (let i = logs.length - 1; i >= 0; i--) {
      const entry = logs[i];
      if ((Number(entry.round) || 0) < curRound) break;
      const txt = String(entry.text || '');
      if (txt.startsWith(prefix)) return true;
      if (txt === turnStart) break;
    }
    return false;
  }
  const moveCostFeet = a => {
    const m = String(a?.cost || '').match(/(\d+)\s*ft/i);
    return m ? Number(m[1]) : 0;
  };
  function moveProvokers(a) {
    if (!a || a.kind !== 'move' || !Array.isArray(a.path) || a.path.length < 2) return [];
    const actor = activeUnit();
    if (!actor || state?.champion_interrupt) return [];
    const protectedFt = Number(state?.resources?.champion_movement) || 0;
    const costFt = moveCostFeet(a);
    if (protectedFt > 0 && costFt > 0 && costFt <= protectedFt) return [];
    if (isDisengagedThisTurn()) return [];
    const blocked = new Set(['incapacitated', 'unconscious', 'paralyzed', 'stunned', 'petrified']);
    const out = [];
    for (const u of state?.units || []) {
      if (u.team === actor.team || u.dead || u.alive === false) continue;
      const conds = (u.conditions || []).map(c => String(c || '').toLowerCase());
      if (conds.some(c => blocked.has(c))) continue;
      const w = u.width || 1, d = u.depth || 1;
      const near = p => p[0] >= u.x - 1 && p[0] <= u.x + w && p[1] >= u.y - 1 && p[1] <= u.y + d;
      for (let i = 0; i + 1 < a.path.length; i++) {
        if (near(a.path[i]) && !near(a.path[i + 1])) { out.push(u.name || u.id); break; }
      }
    }
    return out;
  }
  const oaWarning = a => {
    const list = moveProvokers(a);
    return list.length ? `⚠ Provokes opportunity attack from ${list.join(', ')}` : '';
  };
  const actionWarnings = a => [oaWarning(a), aidWarning(a), cursedWarning(a)].filter(Boolean);
  const hasWarning = a => Boolean(a?.allies?.length || oaWarning(a) || aidWarning(a) || cursedWarning(a));
  const needsConfirmAction = a => Boolean(a) && (Boolean(a.cells) || hasWarning(a));
  const cellsOf = a => a?.cells || [];
  const previewCells = () => cellsOf(preview || armed);
  const allocationKey = ids => [...ids].sort().join(',');
  const hasPosition = a => Number.isInteger(a.x) && Number.isInteger(a.y);
  const hasTarget = a => a.target_id !== null && a.target_id !== undefined;
  const targetsUnit = (a, u) => (hasTarget(a) && a.target_id === u.id) || (Array.isArray(a.target_ids) && a.target_ids.includes(u.id));
  const targetsCell = (a, x, y) => hasPosition(a) && a.x === x && a.y === y;
  const isTargeted = (a, x, y) => targetsCell(a, x, y) || targets().some(u => atCell(u, x, y) && targetsUnit(a, u));
  const pathCost = a => Array.isArray(a.path) ? a.path.length : 99;
  // The cheapest native move to a square (a one-square diagonal step beats the 10-ft cardinal path).
  const cheapestMove = list => [...list].sort((a, b) => pathCost(a) - pathCost(b) || String(a.id).localeCompare(String(b.id)))[0] || null;
  const movesTo = (x, y) => currentActions().filter(a => a.kind === 'move' && targetsCell(a, x, y));

  function levelByKey(encounter, preset) {
    // A story's own chapter levels (story_presets) are found here but stay out of the Practice lists.
    for (const group of catalogue) for (const p of [...group.presets, ...(group.story_presets || [])]) if (group.id === encounter && p.id === preset) return { group, preset: p };
    return null;
  }
  const currentLevel = () => state?.level ? levelByKey(state.level.encounter, state.level.id) : null;

  function heroLevelBadge(unit, cls = 'roster-lv-pill') {
    const lv = Number(unit?.level);
    if (unit?.team !== 'heroes' || !lv) return '';
    return `<b class="${cls}" aria-label="Level ${escape(lv)}">Lv ${escape(lv)}</b>`;
  }
  function nativeClass(unit, includeLevel = true) {
    const sub = unit.subclass ? String(unit.subclass).replace(/_/g, ' ') : '';
    const cls = unit.class || niceName(unit.content || unit.kind || (unit.team === 'heroes' ? 'adventurer' : 'creature'));
    return `${includeLevel && unit.level ? 'Lv ' + unit.level + ' · ' : ''}${sub ? sub.charAt(0).toUpperCase() + sub.slice(1) + ' ' : ''}${cls}`;
  }
  const isInvisibleHeard = u => Boolean(u && u.alive !== false && u.invisible_to_heroes);
  const isInvisibleAny = u => Boolean(u && u.alive !== false && (u.invisible_to_heroes || (u.conditions || []).includes('invisible')));
  const invisibleTag = u => isInvisibleHeard(u) ? 'Invisible — heard here' : '';
  function conditionLabels(unit) {
    const conditions = (unit.conditions || []).filter(c => !['dead', 'unconscious'].includes(c));
    const list = [...new Set([...conditions, ...(unit.marks || [])].filter(Boolean))];
    if (isInvisibleHeard(unit)) {
      return ['Invisible — heard here', ...list.filter(c => c !== 'invisible')];
    }
    return list;
  }

  function lifeText(unit) {
    if (unit.alive !== false) return null;
    const v = vitalOf(unit);
    if (v?.state === 'dying') return `Dying · death saves ${v.saves} of 3, failures ${v.fails} of 3`;
    if (v?.state === 'stable') return 'Stable (unconscious at 0 HP)';
    return unit.dead || (unit.conditions || []).includes('dead') ? 'Dead' : 'Unconscious';
  }

  // --- Dying, Stable, Dead (SRD 5.2.1 Death Saving Throws) ---------------------------------
  // A hero at 0 HP is Unconscious and Dying: at the start of each of its turns it makes a Death
  // Saving Throw (10 or higher succeeds, a 1 counts as two failures, a 20 restores 1 HP). Three
  // successes make it Stable, three failures kill it, and damage taken at 0 HP is a failure
  // (two on a Critical Hit). The engine sends `alive`, `dead` and the `stable` condition, and
  // logs every death save and every failure a hit causes; the running tally is read from those
  // lines. `resets` are [log id, name] pairs where a hero became Stable (Spare the Dying).
  function deathSaveTally(log, names, resets = []) {
    const order = [...new Set(names.map(String))].sort((a, b) => b.length - a.length);
    const tally = {}, notes = {};
    const resetAt = new Map();
    for (const [id, name] of resets) resetAt.set(id, [...(resetAt.get(id) || []), name]);
    const zero = n => { tally[n] = { saves: 0, fails: 0 }; };
    order.forEach(zero);
    for (const e of log || []) {
      const text = String(e?.text || '');
      const name = order.find(n => text.startsWith(`${n}:`) || text.startsWith(`${n} `));
      if (name) {
        const t = tally[name];
        let kind = null;
        if (text.startsWith(`${name} falls unconscious`) || text.startsWith(`${name} regains `) || text.startsWith(`${name} falls dead`)) zero(name);
        else if (text.startsWith(`${name}: death save `)) { t.saves += 1; kind = /d20\(20\)/.test(text) ? 'twenty' : 'save'; }
        else if (text.startsWith(`${name}: death fail `)) { t.fails += /\(2 failures\)/.test(text) ? 2 : 1; kind = 'fail'; }
        else if (text.startsWith(`${name} takes damage while unconscious`)) { t.fails += 1; kind = 'hit'; }
        else if (text.startsWith(`${name} takes a critical hit: 2 death-save failures`)) { t.fails += 2; kind = 'hit'; }
        if (kind) {
          notes[e.id] = { name, kind, saves: Math.min(3, t.saves), fails: Math.min(3, t.fails) };
          if (kind === 'twenty' || t.saves >= 3 || t.fails >= 3) zero(name);
        }
      }
      for (const n of resetAt.get(e?.id) || []) zero(n);
    }
    return { tally, notes };
  }

  function deathSaveNote(note) {
    if (!note) return '';
    if (note.kind === 'twenty') return 'A natural 20: back on their feet with 1 HP.';
    if (note.fails >= 3) return 'Three failures: dead.';
    if (note.saves >= 3) return 'Three successes: Stable.';
    return `Death saves: ${note.saves} ${note.saves === 1 ? 'success' : 'successes'}, ${note.fails} ${note.fails === 1 ? 'failure' : 'failures'} (of 3).`;
  }

  // Sanctuary (SRD 5.2.1) ends when the warded creature makes an attack roll, casts a spell or
  // deals damage. The engine does not log the ending, but every action record carries the
  // before and after marks, so the end is read from them (and the reason from the action).
  function wardEndNotes(timeline, nameOfId) {
    const out = [];
    for (const rec of timeline || []) {
      if (!rec?.before?.units || !rec?.after?.units) continue;
      const before = new Map(rec.before.units.map(u => [u.id, u]));
      for (const u of rec.after.units) {
        const b = before.get(u.id);
        if (!b || !(b.marks || []).includes('sanctuary') || (u.marks || []).includes('sanctuary') || u.dead) continue;
        const name = nameOfId(u.id);
        const kind = String(rec.kind || '');
        const why = rec.source_id !== u.id ? ''
          : kind === 'spell' ? `${name} cast a spell`
            : /attack|cleave/.test(kind) ? `${name} made an attack roll`
              : `${name} dealt damage`;
        out.push({ id: `ward-end-${rec.id}-${u.id}`, after: Number(rec.after.log_id) || 0, unit: u.id, why: why ? why.slice(name.length + 1) : '',
          text: why ? `Sanctuary on ${name} ends: ${why}.` : `Sanctuary on ${name} ends.` });
      }
    }
    return out;
  }

  // The engine's Sanctuary save line: "<attacker> makes|fails the Wisdom save against
  // Sanctuary on <warded> (<total> vs DC <dc>). The attack proceeds|is lost."
  const WARD_SAVE = /^(.+) (makes|fails) the Wisdom save against Sanctuary on (.+) \((-?\d+) vs DC (\d+)\)\./;

  // Board cues for one action record: who resisted the ward or was turned away, whose ward
  // ended, and which hit cost a dying hero a death save. Shown like the OPPORTUNITY tag.
  function recordCues(rec, log, units) {
    const lo = Number(rec?.before?.log_id) || 0, hi = Number(rec?.after?.log_id) || 0;
    const byName = new Map((units || []).map(u => [String(u.name), u]));
    const at = id => (rec.after?.units || []).find(u => u.id === id) || (units || []).find(u => u.id === id);
    const cue = (unit, text, subline, tone, n) => {
      const p = at(unit.id);
      if (!p) return null;
      return { id: 950000 + (Number(rec.id) || 0) * 20 + n, type: 'attack', style: 'touch', variant: 'cue', outcome: 'miss', amount: 0,
        text, subline, tone, source_id: unit.id, target_id: unit.id, source: { x: p.x, y: p.y }, target: { x: p.x, y: p.y } };
    };
    const out = [];
    const { notes } = deathSaveTally((log || []).filter(e => e.id <= hi), (units || []).filter(u => u.team === 'heroes').map(u => u.name));
    for (const e of log || []) {
      if (e.id <= lo || e.id > hi) continue;
      const m = WARD_SAVE.exec(String(e.text || ''));
      if (m && byName.has(m[1])) {
        out.push(cue(byName.get(m[1]), m[2] === 'makes' ? 'RESISTS WARD' : 'WARD HOLDS', `WIS ${m[4]} vs DC ${m[5]}`, m[2] === 'makes' ? '#ffb46a' : '#e6dcff', out.length));
      }
      const note = notes[e.id];
      if (note?.kind === 'hit' && byName.has(note.name)) {
        out.push(cue(byName.get(note.name), note.fails >= 3 ? 'DEAD' : 'DEATH SAVE FAILED', note.fails >= 3 ? 'THREE FAILURES' : `${note.fails} OF 3 FAILURES`, '#ff6a58', out.length));
      }
    }
    for (const w of wardEndNotes([rec], id => (units || []).find(u => u.id === id)?.name || id)) {
      const u = (units || []).find(x => x.id === w.unit);
      if (u) out.push(cue(u, 'SANCTUARY ENDS', w.why ? w.why.toUpperCase() : '', '#e6dcff', out.length));
    }
    return out.filter(Boolean);
  }

  // Per-encounter memory of what the timeline told us (it keeps only its last 64 records).
  // var, like directedTurn below: render() may run before these lines during start-up.
  var derived = { encounter: null, wardEnds: new Map(), stable: new Map() };
  function noteTimeline(data) {
    if (!data) return;
    if (derived.encounter !== data.encounter_id) {
      derived.encounter = data.encounter_id; derived.wardEnds.clear(); derived.stable.clear();
    }
    const nameOfId = id => (data.units || []).find(u => u.id === id)?.name || id;
    for (const w of wardEndNotes(data.timeline, nameOfId)) derived.wardEnds.set(w.id, w);
    for (const rec of data.timeline || []) {
      const before = new Map((rec.before?.units || []).map(u => [u.id, u]));
      for (const u of rec.after?.units || []) {
        const b = before.get(u.id);
        if (b && !(b.conditions || []).includes('stable') && (u.conditions || []).includes('stable')) {
          derived.stable.set(`${rec.id}:${u.id}`, [Number(rec.after.log_id) || 0, nameOfId(u.id)]);
        }
      }
    }
  }

  var vitalsCache = { state: null, value: null };
  function vitals() {
    if (vitalsCache.state === state) return vitalsCache.value;
    const heroes = (state?.units || []).filter(u => u.team === 'heroes');
    const value = deathSaveTally(state?.log, heroes.map(u => u.name), [...derived.stable.values()]);
    vitalsCache = { state, value };
    return value;
  }
  function vitalOf(unit) {
    if (!unit || unit.team !== 'heroes' || unit.alive !== false) return null;
    const conds = unit.conditions || [];
    if (unit.dead || conds.includes('dead')) return { state: 'dead' };
    if (conds.includes('stable')) return { state: 'stable' };
    const t = vitals().tally[unit.name] || { saves: 0, fails: 0 };
    return { state: 'dying', saves: Math.min(2, t.saves), fails: Math.min(2, t.fails) };
  }
  function vitalHtml(unit) {
    const v = vitalOf(unit);
    if (!v) return '';
    if (v.state !== 'dying') return `<span class="vital vital-${v.state}">${v.state === 'stable' ? 'Stable' : 'Dead'}</span>`;
    const pips = (n, cls) => [0, 1, 2].map(i => `<i class="pip ${cls}${i < n ? ' on' : ''}"></i>`).join('');
    return `<span class="vital vital-dying">Dying <span class="pips" title="Death saves: ${v.saves} successes">${pips(v.saves, 'save')}</span><span class="pips" title="Death saves: ${v.fails} failures">${pips(v.fails, 'fail')}</span></span>`;
  }

  // --- 3D hover and the floating tooltip -----------------------------------------
  function handleSceneHover(info) {
    const tip = $('cursor-tooltip');
    if (!info || !state || playing) {
      tip.hidden = true;
      viewer?.clearHoverPreview?.();
      return;
    }
    const { x, y, unitId, clientX, clientY } = info;
    const cellUnits = (state.units || []).filter(u => atCell(u, x, y) && (u.alive !== false || u.team === 'heroes'));
    const hoveredUnit = (unitId ? targets().find(u => u.id === unitId) : null)
      || cellUnits.find(u => u.alive !== false)
      || cellUnits[0]
      || targets().find(u => atCell(u, x, y) && u.alive !== false);
    const coLocated = cellUnits.filter(u => u.id !== hoveredUnit?.id);
    const actor = activeUnit();
    const cur = currentActions();
    const moves = movesTo(x, y);
    const matchingAct = moves.length ? cheapestMove(moves)
      : cur.find(a => targetsCell(a, x, y) || (hoveredUnit && targetsUnit(a, hoveredUnit)))
      || cur.find(a => coLocated.some(u => targetsUnit(a, u)));
    let pathCells = null, pathColor = '#6af7df', pathDotColor = '#a8fff0', arcFrom = null, arcTo = null, arcColor = '#ffd478', hoverColor = '#ffe194', areaCells = null, areaColor = '#ff7a3d';
    if (matchingAct && actor) {
      if (matchingAct.kind === 'move') {
        const provokes = moveProvokers(matchingAct).length > 0;
        hoverColor = provokes ? '#ff744d' : '#5be2ca';
        pathColor = provokes ? '#ff744d' : '#6af7df';
        pathDotColor = provokes ? '#ffc2ae' : '#a8fff0';
        pathCells = Array.isArray(matchingAct.path) ? matchingAct.path : null;
      } else if (matchingAct.kind === 'spiritual_weapon_move') {
        hoverColor = '#7cc4ff';
        arcColor = '#7cc4ff';
        const force = (state.forces || []).find(f => f.owner_id === actor.id) || (state.forces || [])[0] || actor;
        arcFrom = { x: force.x, y: force.y };
        arcTo = { x, y };
      } else {
        hoverColor = hasWarning(matchingAct) ? '#ff6454' : (matchingAct.kind === 'spell' ? '#c29eff' : '#ff8c6e');
        arcColor = hoverColor;
        arcFrom = { x: actor.x, y: actor.y };
        arcTo = { x: hoveredUnit?.x ?? x, y: hoveredUnit?.y ?? y };
        if (matchingAct.cells?.length) {
          areaCells = matchingAct.cells;
          areaColor = matchingAct.allies?.length ? '#ff4a38' : '#ff7a3d';
        }
      }
    } else if (state.phase === 'setup' && setupFigure && !['#', 'T'].includes(state.map.tiles[y]?.[x])) {
      hoverColor = '#eec373';
    }
    viewer?.setTacticalPreview?.({ hoverCell: { x, y, color: hoverColor }, pathCells, pathColor, pathDotColor, arcFrom, arcTo, arcColor, areaCells, areaColor });
    if (!hoveredUnit && !matchingAct) { tip.hidden = true; return; }
    const parts = [];
    if (hoveredUnit) {
      const conds = [lifeText(hoveredUnit), ...conditionLabels(hoveredUnit)].filter(Boolean).join(', ');
      parts.push(`<div class="tt-head"><span>${escape(hoveredUnit.name)}</span><span class="tt-coord">${escape(cellName(x, y))}</span></div>`);
      parts.push(`<div class="tt-sub">HP <b>${escape(hoveredUnit.hp)}/${escape(hoveredUnit.max_hp)}</b>${hoveredUnit.ac ? ` · AC <b>${escape(hoveredUnit.ac)}</b>` : ''}${conds ? ` · ${escape(conds)}` : ''}</div>`);
      for (const other of coLocated) {
        const oLife = lifeText(other) || 'Standing';
        parts.push(`<div class="tt-sub">+ ${escape(other.name)} · HP <b>${escape(other.hp)}/${escape(other.max_hp)}</b> · ${escape(oLife)}</div>`);
      }
    } else {
      parts.push(`<div class="tt-head"><span>Floor</span><span class="tt-coord">${escape(cellName(x, y))}</span></div>`);
    }
    if (matchingAct) {
      const rayTag = matchingAct.ray_count ? ` [Ray ${matchingAct.ray_number}/${matchingAct.ray_count}]` : '';
      const text = matchingAct.kind === 'move'
        ? `Move here · ${matchingAct.cost || ''}`
        : matchingAct.kind === 'spiritual_weapon_move'
          ? `Move Spiritual Weapon → ${cellName(x, y)}${matchingAct.cost ? ' · ' + matchingAct.cost : ''}`
          : matchingAct.square_attack
            ? `${matchingAct.label}${hoveredUnit?.invisible_to_heroes ? ` → ${hoveredUnit.name}` : ` → square ${cellName(x, y)}`} · Disadvantage (unseen target)${matchingAct.cost ? ' · ' + matchingAct.cost : ''}`
            : `${matchingAct.label}${rayTag}${matchingAct.cost ? ' · ' + matchingAct.cost : ''}`;
      const warns = actionWarnings(matchingAct);
      const actCls = warns.length ? 'warn' : (matchingAct.kind !== 'move' && matchingAct.kind !== 'spiritual_weapon_move' ? 'attack' : '');
      parts.push(`<div class="tt-action ${actCls}">${escape(text)}</div>`);
      const cov = coverText(matchingAct, hoveredUnit?.id);
      if (cov) parts.push(`<div class="tt-cover">${escape(cov)}</div>`);
      const defs = defenseTags(matchingAct, hoveredUnit?.id);
      if (defs.length) {
        const cls = defs.some(d => d.kind === 'immune') ? 'is-immune' : defs.some(d => d.kind === 'vuln') ? 'is-vuln' : '';
        parts.push(`<div class="tt-defense ${cls}">${escape(defs.map(d => d.text).join(' · '))}</div>`);
      }
      const hits = hitsLabel(matchingAct);
      if (hits) parts.push(`<div class="tt-hits${matchingAct.allies?.length ? ' friendly-fire' : ''}">${escape(hits)}</div>`);
      for (const w of warns) parts.push(`<div class="tt-hits friendly-fire">${escape(w)}</div>`);
    }
    tip.innerHTML = parts.join('');
    tip.style.left = `${Math.max(4, Math.min(window.innerWidth - 290, clientX))}px`;
    tip.style.top = `${Math.max(4, Math.min(window.innerHeight - 110, clientY))}px`;
    tip.hidden = false;
  }

  // --- 3D viewer lifecycle, with recovery after a lost WebGL context ---------------
  function setSceneMode(ready, reason = '') {
    $('board-scroll').classList.toggle('is-fallback', !ready);
    $('scene-viewport').setAttribute('aria-hidden', String(!ready));
    $('reset-view-button').disabled = !ready;
    $('render-status').textContent = ready ? '3D tabletop' : `2D map · ${reason || 'WebGL unavailable'}`;
    renderBoardVisibility();
  }
  function renderBoardVisibility() {
    const layer = $('board-scroll');
    layer.classList.toggle('minimap-on', minimapVisible && !sceneUnavailable);
    $('minimap-toggle').classList.toggle('is-on', minimapVisible || sceneUnavailable);
    $('minimap-toggle').setAttribute('aria-pressed', String(minimapVisible || sceneUnavailable));
  }
  function disposeViewer() {
    const prev = viewer;
    viewer = null;
    resizeObserver?.disconnect();
    try { prev?.dispose?.(); } catch { /* the 2D map must survive a lost context */ }
  }
  const recovering = () => recoveries.some(t => Date.now() - t < RECOVERY_WINDOW_MS);
  // A failure after 3D has worked (a lost context, a renderer error) rebuilds a fresh
  // viewer from the current state after a short pause, at most RECOVERY_LIMIT times a
  // minute; the playable 2D map covers the gap. No WebGL 2 at all falls back for good.
  function sceneFailed(reason, { recoverable = true } = {}) {
    sceneUnavailable = true;
    const now = Date.now();
    recoveries = recoveries.filter(t => now - t < RECOVERY_WINDOW_MS);
    const retry = recoverable && !startupClosed && (recoveryTimer || recoveries.length < RECOVERY_LIMIT);
    setSceneMode(false, retry ? `${reason} · restoring 3D` : reason);
    disposeViewer();
    render();
    if (!retry || recoveryTimer) return;
    recoveries.push(now);
    recoveryTimer = window.setTimeout(() => {
      recoveryTimer = 0;
      if (startupClosed) return;
      sceneUnavailable = false; viewerAttempted = false;
      syncViewer(true);
      render();
    }, RECOVERY_DELAY_MS);
  }

  function applyCameraPreset(preset, focusUnitId = null) {
    activeCamPreset = preset;
    for (const b of document.querySelectorAll('[data-cam]')) {
      b.classList.toggle('is-on', b.dataset.cam === preset);
      b.setAttribute('aria-pressed', String(b.dataset.cam === preset));
    }
    if (viewer && !sceneUnavailable) viewer.setCameraPreset(preset, focusUnitId);
  }

  function ensureViewer() {
    if (!assetsReady || startupClosed || sceneUnavailable) return viewer;
    if (!viewerAttempted) {
      viewerAttempted = true;
      if (typeof window.EmberScene?.createViewer !== 'function') {
        sceneFailed('3D bundle unavailable', { recoverable: false });
        return null;
      }
      try {
        viewer = window.EmberScene.createViewer({
          container: $('scene-viewport'),
          idleAnimation: $('idle-toggle').checked,
          onCell: (x, y, unitId) => {
            if (!state || !Number.isInteger(x) || !Number.isInteger(y)) return;
            if (x < 0 || y < 0 || x >= state.map.width || y >= state.map.height) return;
            focusCell = { x, y };
            activateCell(x, y, unitId);
          },
          onHover: handleSceneHover,
          onCameraChange: () => {},
          onReady: () => { if (!sceneUnavailable && $('scene-viewport').dataset.renderer === 'webgl') setSceneMode(true); },
          onUnavailable: (_message, info) => sceneFailed(info?.lost ? 'WebGL context lost' : 'WebGL unavailable',
            { recoverable: Boolean(info?.lost) || recovering() }),
        });
        if (!viewer || typeof viewer.update !== 'function') throw new Error('Renderer unavailable');
        viewer.setAutoCamera?.(followCamEnabled);
        viewer.setActionZoom?.(actionZoom);
        if (sceneUnavailable) { disposeViewer(); return null; }
        resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { try { viewer?.resize?.(); viewer?.setSafeArea?.(sceneSafeArea()); } catch { sceneFailed('3D rendering interrupted'); } }) : null;
        resizeObserver?.observe($('scene-viewport'));
      } catch {
        if (sceneUnavailable) disposeViewer();
        else sceneFailed('3D viewer failed to start', { recoverable: recovering() });
      }
    }
    return viewer;
  }

  function syncViewer(snap = true) {
    const v = ensureViewer();
    if (!v || sceneUnavailable || !state) return;
    try {
      const shown = { ...state, units: (state.units || []).map(u => { const vital = vitalOf(u); return vital ? { ...u, vital } : u; }) };
      v.update(shown, {
        selectedActions: currentActions(),
        previewCells: previewCells(),
        previewFriendlyFire: Boolean((preview || armed)?.allies?.length),
        inspectedId: state.phase === 'setup' ? setupFigure : inspectedId,
        setupFigure: state.phase === 'setup' ? setupFigure : null,
        biome: themeFor(),
        busy, ordered: true, snap,
      });
      if (!sceneUnavailable && $('scene-viewport').dataset.renderer === 'webgl') setSceneMode(true);
    } catch {
      sceneFailed('3D rendering interrupted');
    }
  }
  function themeFor() {
    if (themeManualOverride && selectedTheme !== 'auto') return selectedTheme;
    // On the start screen the board behind the glass previews the selected level's theme.
    if (startScreenOpen && selectedStart) {
      const lv = levelByKey(selectedStart.encounter, selectedStart.preset);
      if (lv?.preset.theme) return lv.preset.theme;
    }
    const sceneTheme = state?.map?.scene?.theme || null;
    const encTheme = state?.theme || state?.level?.theme || null;
    if (sceneTheme && (!encTheme || encTheme === 'caverns')) return sceneTheme;
    return encTheme || sceneTheme || null;
  }

  // --- Dice tray: only the server's draws ------------------------------------------------
  const unitName = id => state?.units.find(u => u.id === id)?.name || state?.setup?.roster?.find(u => u.id === id)?.name || id || '';
  function tagText(tag) {
    const t = String(tag || 'roll');
    if (t === 'death_saving_throw') return 'Death save';
    if (t === 'savage_attacker') return 'Savage Attacker';
    if (t.startsWith('spells.')) return `${niceName(t.slice(7))} damage`;
    if (/saving_throw/.test(t)) return `${t.split('_')[0].toUpperCase().slice(0, 3)} save`;
    if (t.startsWith('fn:')) return 'roll';
    return t.replace(/^dice roll for /i, '').replace(/_/g, ' ').replace(/^Melee Spell Attack: |^Ranged Spell Attack: /, 'attack · ');
  }
  function renderDiceDraws(draws = [], contextText = '', forceSpin = false) {
    $('dice-context').textContent = contextText || 'Dice';
    diceArena.setDraws(draws, forceSpin);
    const strip = $('dice-strip');
    if (!draws.length) { strip.innerHTML = '<span class="map-tag">No dice in this step.</span>'; return; }
    strip.innerHTML = draws.slice(0, 10).map(d => {
      const vals = Array.isArray(d.v) ? d.v : [d.v];
      const kept = keptValue(d);
      const sides = Number(d.sides) || 20;
      const check = sides === 20 && isCheckDraw(d);
      const modeTxt = d.mode === 'a' ? `d${sides} adv (${vals.join(', ')})` : d.mode === 'd' ? `d${sides} dis (${vals.join(', ')})` : `d${sides}`;
      const who = unitName(d.who);
      return `<span class="die-chip-mini ${check && kept === 20 ? 'crit' : check && kept === 1 ? 'fumble' : ''}"><b>${escape(kept)}</b><span>${escape(modeTxt)} · ${escape(who ? who + ' · ' : '')}${escape(tagText(d.tag))}</span></span>`;
    }).join('');
  }
  function recordLabel(rec) {
    const who = unitName(rec.source_id);
    const desc = String(rec.descriptor || '');
    const parts = desc.split(':');
    if (rec.kind === 'move') return `${who} moves`;
    if (parts[0] === 'attack') return `${who}: ${niceName(parts[1])}${rec.opportunity ? ' (opportunity attack)' : ''}`;
    if (parts[0] === 'spell') return `${who} casts ${niceName(parts[1])}`;
    return `${who}: ${niceName(rec.kind)}`;
  }
  function showLatestDice() {
    if (!state) return;
    if (state.phase === 'setup') { renderDiceDraws([], 'Initiative is rolled at Start'); return; }
    const records = (state.timeline || []).filter(r => (r.draws || []).length);
    const last = records[records.length - 1];
    if (last) { renderDiceDraws(last.draws, `Round ${displayRound()} · ${recordLabel(last)}`); return; }
    renderDiceDraws(state.initiative_draws || [], 'Initiative');
  }

  // --- The 2D map (the playable fallback, or an inset next to the 3D view) ----------------
  function renderBoard(skipScene = false) {
    if (!state?.map) return;
    const map = state.map, legal = currentActions();
    const board = $('battlefield');
    const cells = [], base = [];
    previewSet = new Set(previewCells().map(c => c.join(',')));
    const setup = state.phase === 'setup';
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const ch = map.tiles[y]?.[x] || '.';
        const wall = ch === '#' || ch === 'T';
        const cls = ch === 'T' ? 'cell-wall cell-tree' : wall ? 'cell-wall' : (ch === 'd' || ch === 'D') ? 'cell-floor cell-dim' : 'cell-floor';
        base.push(`<rect class="${cls}" x="${x}" y="${y}" width="1" height="1"/>`);
        if (wall) continue;
        let isLeg = legal.some(a => isTargeted(a, x, y));
        if (setup && setupFigure && !state.setup.placements.some(p => p.id !== setupFigure && p.x === x && p.y === y)) isLeg = true;
        const isAtk = !setup && isLeg && legal[0]?.kind !== 'move';
        const tab = focusCell.x === x && focusCell.y === y ? 0 : -1;
        const unit = targets().find(u => atCell(u, x, y) && u.alive !== false);
        const move = !setup && isLeg && !isAtk ? cheapestMove(movesTo(x, y)) : null;
        const oaTag = move && moveProvokers(move).length ? ', provokes opportunity attack' : '';
        const label = `${cellName(x, y)}${unit ? ', ' + unit.name : ''}${move ? `, move here (${move.cost || ''}${oaTag})` : isLeg ? (setup ? ', place here' : ', target') : ''}`;
        cells.push(`<g class="tile${isLeg ? ' is-legal' : ''}${isAtk ? ' target-tile' : ''}${previewSet.has(x + ',' + y) ? ' is-preview' : ''}" data-x="${x}" data-y="${y}" role="button" tabindex="${tab}" aria-label="${escape(label)}"><rect class="tile-face" x="${x}" y="${y}" width="1" height="1"/><rect class="focus-ring" x="${x + 0.05}" y="${y + 0.05}" width=".9" height=".9"/></g>`);
      }
    }
    const livingCells = new Set((state.units || []).filter(u => u.alive !== false).map(u => `${u.x},${u.y}`));
    const sortedUnits = [...(state.units || [])]
      .filter(u => u.alive !== false || u.team === 'heroes' || !livingCells.has(`${u.x},${u.y}`))
      .sort((a, b) => (a.alive === false ? 0 : 1) - (b.alive === false ? 0 : 1));
    const unitTokens = sortedUnits.map(u => {
      const cx = u.x + 0.5, cy = u.y + 0.5, life = lifeText(u), inv = invisibleTag(u);
      const words = String(u.name || u.id).split(/[\s_-]+/).filter(Boolean);
      const initial = escape(words.length > 1
        ? words.map(w => (/^\d+$/.test(w) ? w : w[0].toUpperCase())).join('').slice(0, 3)
        : words.join('').slice(0, 2));
      return `<g class="token ${u.team === 'heroes' ? 'hero' : 'monster'}${u.alive ? '' : ' down'}${isInvisibleAny(u) ? ' invisible-heard' : ''}${u.id === state.turn_id ? ' active' : ''}" data-unit="${escape(u.id)}" role="button" aria-label="${escape(`${u.name}, ${u.hp}/${u.max_hp} HP${inv ? ', ' + inv : ''}${life ? ', ' + life : ''}`)}"><circle cx="${cx}" cy="${cy}" r=".34"/><text x="${cx}" y="${cy + 0.1}">${initial}</text></g>`;
    }).join('');
    board.setAttribute('viewBox', `0 0 ${map.width} ${map.height}`);
    board.innerHTML = `<g pointer-events="none">${base.join('')}</g>${cells.join('')}${unitTokens}`;
    if (!skipScene) syncViewer(true);
  }

  // --- Setup, initiative, rosters and the command deck --------------------------------------
  function configure(placements, monster_control = state.setup.monster_control) {
    if (state.phase !== 'setup' || busy) return;
    request('setup', { placements, monster_control });
  }
  const suggestedPlacements = () => state?.setup?.suggested_placements || [];

  function renderSetup() {
    const setup = state?.phase === 'setup';
    $('setup-panel').hidden = !setup;
    $('combat-dock').hidden = setup;
    if (!setup) return;
    const roster = state.setup?.roster || [], placements = state.setup?.placements || [];
    $('setup-roster').innerHTML = roster.map(unit => {
      const placed = placements.find(p => p.id === unit.id);
      return `<div class="setup-figure"><button class="setup-select ${setupFigure === unit.id ? 'selected' : ''}" data-figure="${escape(unit.id)}" aria-pressed="${setupFigure === unit.id}" ${busy ? 'disabled' : ''}>${portrait(unit)}<span><span class="roster-title"><span class="roster-title-name">${escape(unit.name)}</span>${heroLevelBadge(unit, 'setup-lv-pill')}</span><small>${escape(nativeClass(unit, unit.team !== 'heroes'))} · ${placed ? escape(cellName(placed.x, placed.y)) : 'not placed'}</small></span></button><button class="setup-remove" data-remove="${escape(unit.id)}" aria-label="Remove ${escape(unit.name)}" ${busy || !placed ? 'disabled' : ''}>×</button></div>`;
    }).join('');
    const level = currentLevel();
    const presets = [...(level?.group.presets || [])];
    if (level && !presets.includes(level.preset)) presets.push(level.preset);
    const select = $('setup-preset');
    const sig = `${level?.group.id}:${presets.map(p => p.id).join()}`;
    if (select.dataset.signature !== sig) {
      const legacy = isLegacyGroup(level?.group);
      select.innerHTML = presets.map(p => `<option value="${escape(p.id)}">${escape(p.name)} · ${escape(legacy ? 'Classic · ungraded' : p.difficulty)}</option>`).join('');
      select.dataset.signature = sig;
    }
    select.value = state.level?.id || '';
    select.disabled = busy || presets.length < 2;
    $('setup-preset-blurb').textContent = state.level?.blurb || '';
    const levelName = state.level?.name || '';
    $('setup-title').textContent = !state.level ? 'Place the figures'
      : levelName.startsWith(state.level.encounter_name) ? levelName : `${state.level.encounter_name}: ${levelName}`;
    $('setup-monster-control').value = state.setup.monster_control;
    $('setup-monster-control').disabled = busy;
    $('setup-suggested').disabled = busy || !suggestedPlacements().length;
    $('start-button').disabled = busy || !state.setup.can_start;
    const sel = roster.find(u => u.id === setupFigure);
    $('setup-status').textContent = sel
      ? `${sel.name} selected: click a highlighted square to place it.`
      : state.setup.can_start
        ? 'Ready. Start rolls initiative.'
        : 'Use the suggested layout, or select a figure above and click a square to place it.';
  }

  function renderInitiative() {
    if (!state) return;
    $('round-value').textContent = state.phase === 'setup' ? '—' : displayRound();
    if (state.phase === 'setup') {
      $('initiative-list').innerHTML = '<span class="loading-label">Deployment</span>';
      return;
    }
    $('initiative-list').innerHTML = state.units.map(u => {
      const act = u.id === activeUnit()?.id, life = lifeText(u), inv = invisibleTag(u);
      return `<button class="init-medallion ${u.team === 'monsters' ? 'monster' : ''} ${act ? 'active' : ''} ${!u.alive ? 'fallen' : ''} ${isInvisibleAny(u) ? 'is-invisible' : ''} ${vitalOf(u) ? 'vital-' + vitalOf(u).state : ''}" data-inspect="${escape(u.id)}" data-cam-focus="${escape(u.id)}" ${act ? 'aria-current="true"' : ''} aria-label="${escape(`${u.name}, ${u.hp}/${u.max_hp} HP${inv ? ', ' + inv : ''}${life ? ', ' + life : ''}${act ? ', acting now' : ''}`)}" title="${escape(u.name)} (${escape(u.hp)}/${escape(u.max_hp)} HP${inv ? ' · ' + escape(inv) : ''})">${portrait(u)}${hpBar(u, 'init-hp-mini')}<span class="init-badge">${escape(u.initiative_roll ?? '·')}</span></button>`;
    }).join('');
  }

  function normalizeSheetItem(item) {
    const name = item?.name || '';
    let text = item?.text || '';
    // Texts some sheets leave empty (the wizard's), in the other sheets' words and SRD 5.2.1's.
    const blank = {
      'Fire Bolt': 'Cantrip. Ranged attack, 1d10 fire.',
      'Ray of Frost': 'Cantrip. Ranged attack, 1d8 cold, and the target’s Speed drops by 10 ft until the start of your next turn.',
      'Acid Splash': 'Cantrip. 5-ft sphere within 60 ft; DEX save or 1d6 acid.',
      'Mage Armor': 'Level 1. Touch a willing creature not wearing armor: its base AC becomes 13 + its DEX modifier for 8 hours.',
      'Burning Hands': 'Level 1. 15-ft cone, DEX save, 3d6 fire (half on a success).',
      'Thunderwave': 'Level 1. 15-ft cube from you, CON save, 2d8 thunder and a 10-ft push (half damage and no push on a success).',
      'Chromatic Orb': 'Level 1. Ranged attack, 3d8 damage of a type you pick.',
      'Magic Missile': 'Level 1. Three darts of 1d4+1 force that never miss; split them as you like.',
      'Shatter': 'Level 2. 10-ft sphere within 60 ft, CON save, 3d8 thunder (half on a success).',
      'Shield': 'Level 1 reaction (automatic): +5 AC against the triggering hit.',
      'Magic Initiate Wizard': 'Two wizard cantrips and one level 1 wizard spell, which can be cast once without a spell slot per Long Rest.',
      'Spellcasting': 'Wizard spells from the spellbook, cast with Intelligence.',
      'Ritual Adept': 'Cast a Ritual spell from the spellbook as a Ritual without preparing it (not used in a fight).',
      'Arcane Recovery': 'Recover some expended spell slots after a Short Rest, once per Long Rest (not used in a fight).',
      'Scholar': 'Expertise in one of Arcana, History, Investigation, Medicine, Nature or Religion.',
      'Wizard Subclass': 'Evoker.',
    };
    if (!text.trim() && blank[name]) text = blank[name];
    if (name === 'Command' && !/Halt/i.test(text)) {
      text = 'Level 1. WIS save or obey a one-word command. This build picks Grovel (falls Prone and ends its turn) or Halt (stays put and takes no action or Bonus Action) automatically from the SRD’s five words.';
    } else if (name === 'Dreadful Glare' && !/24 hours/i.test(text)) {
      text = "One creature the Mummy can see within 60 ft makes a WIS save (DC 11) or is Frightened until the end of the Mummy's next turn. On a success it is immune to this Mummy's Dreadful Glare for 24 hours.";
    } else if (name === 'Savage Attacker' && !/automatically/i.test(text)) {
      text = "Once per turn on a weapon hit, roll the weapon's damage dice twice and use either roll (this build selects the higher total automatically).";
    } else if (name === 'Action Surge' && !/Magic action/i.test(text)) {
      text = 'Take one extra action on your turn, except the Magic action. One use.';
    } else if (name === 'Chromatic Orb' && !/leap/i.test(text)) {
      text = 'Level 1. Ranged attack, 3d8 damage of a type you pick. If two or more damage dice show the same number, the orb leaps to another target within 30 ft (up to the spell slot’s level of leaps; automatic in this build).';
    } else if (name === 'Shield' && !/next turn/i.test(text)) {
      text = 'Level 1 reaction: +5 AC (including against the triggering attack) until the start of your next turn, and you take no damage from Magic Missile. This build spends the reaction automatically on eligible attacks.';
    } else if (name === 'Scorching Ray' && /split them as you like/i.test(text)) {
      text = 'Level 2. Three fire rays (2d6 fire each), aimed one ray at a time after seeing the previous ray resolve.';
    }
    return { name, text };
  }

  function sheetHtml(unit, open = false) {
    const sheet = unit?.sheet;
    if (!sheet) return '';
    const list = items => items?.length ? `<ul class="sheet-list">${items.map(raw => {
      const i = normalizeSheetItem(raw);
      return `<li><b>${escape(i.name)}</b> ${escape(i.text)}</li>`;
    }).join('')}</ul>` : '';
    return `<div class="sheet"><p class="sheet-stats">${escape(sheet.stats)}</p><details ${open ? 'open' : ''}><summary>Traits and attacks</summary>${list(sheet.features)}</details>${sheet.spells?.length ? `<details><summary>Spells</summary>${list(sheet.spells)}</details>` : ''}</div>`;
  }

  // --- What an ability does: the sheet's text, its cost and what the text and data say ---------
  // Basic actions every creature has (SRD 5.2.1 wording), by action kind.
  const BASIC_INFO = {
    move: 'Move up to your Speed; you can split your move before and after your action. Leaving the reach of an enemy that can see you provokes an Opportunity Attack unless you Disengage.',
    dash: 'For the rest of the turn, you gain extra movement equal to your Speed.',
    dodge: 'Until the start of your next turn, any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage. You lose this benefit if you have the Incapacitated condition or your Speed is 0.',
    disengage: 'Your movement doesn’t provoke Opportunity Attacks for the rest of the turn.',
    disengage_bonus: 'As a Bonus Action: your movement doesn’t provoke Opportunity Attacks for the rest of the turn.',
    hide: 'Make a DC 15 Dexterity (Stealth) check while Heavily Obscured or behind Three-Quarters or Total Cover, out of every enemy’s line of sight. On a success you have the Invisible condition until an enemy finds you, you make a sound louder than a whisper, make an attack roll or cast a spell with a Verbal component.',
    hide_bonus: 'As a Bonus Action: make a DC 15 Dexterity (Stealth) check while Heavily Obscured or behind Three-Quarters or Total Cover, out of every enemy’s line of sight. On a success you have the Invisible condition until an enemy finds you, you make a sound louder than a whisper, make an attack roll or cast a spell with a Verbal component.',
    stand: 'Standing up from Prone costs movement equal to half your Speed.',
    extend_rage: 'Bonus Action: keep your Rage going until the end of your next turn.',
    dragons_breath_exhale: 'Action: exhale a 15-ft cone; each creature in it makes a DEX save, taking 3d6 damage of the chosen type, half on a success.',
    create_spell_slot: 'Bonus Action: turn sorcery points into one spell slot (2 points for a level 1 slot, 3 for a level 2 slot).',
    convert_spell_slot: 'No action: expend a spell slot to gain sorcery points equal to its level.',
    first_aid: 'Action: make a DC 10 Wisdom (Medicine) check on an adjacent Unconscious ally at 0 HP. On a success, the ally becomes Stable and no longer makes Death Saving Throws.',
    escape_grapple: 'Action: make a Strength (Athletics) or Dexterity (Acrobatics) check (using your higher modifier) against the grappler’s escape DC to end the Grappled condition.',
    break_free: 'Action: make a Strength (Athletics) check against the restraint’s escape DC to end the Restrained condition on yourself.',
  };
  const UNARMED_INFO = 'Unarmed Strike: a melee attack roll with Strength plus your Proficiency Bonus; on a hit, Bludgeoning damage equal to 1 + your Strength modifier.';
  // Spell ranges (SRD 5.2.1), by spell key.
  const SPELL_RANGE = {
    acid_splash: '60 ft', aid: '30 ft', bless: '30 ft', blur: 'Self', burning_hands: 'Self', chromatic_orb: '90 ft',
    command: '60 ft', cure_wounds: 'Touch', dragons_breath: 'Touch', fire_bolt: '120 ft', guiding_bolt: '120 ft',
    healing_word: '60 ft', lesser_restoration: 'Touch', mage_armor: 'Touch', magic_missile: '120 ft',
    protection_from_evil_and_good: 'Touch', ray_of_frost: '60 ft', sacred_flame: '60 ft', sanctuary: '30 ft',
    scorching_ray: '120 ft', shatter: '60 ft', shield: 'Self', shield_of_faith: '60 ft', sorcerous_burst: '120 ft',
    spare_the_dying: '15 ft', spiritual_weapon: '60 ft', thunderwave: 'Self',
  };
  const THROWN_RANGE = { Dagger: '20/60 ft', Handaxe: '20/60 ft', Javelin: '30/120 ft', Spear: '20/60 ft', 'Light Hammer': '20/60 ft' };

  const nameKey = s => String(s || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  // The names a sheet line answers to: "Rotting Fist (x2)" is Rotting Fist; "Necrotic Sword / Bow"
  // is Necrotic Sword and Necrotic Bow; "Shortsword / Shortbow" is either.
  function sheetNames(name) {
    const clean = String(name || '').replace(/\s*\([^)]*\)\s*$/, '');
    const parts = clean.split(/\s*\/\s*/);
    const head = parts[0].split(' ');
    const out = [name, clean, ...parts];
    for (const p of parts.slice(1)) if (!p.includes(' ') && head.length > 1) out.push([...head.slice(0, -1), p].join(' '));
    return [...new Set(out.map(nameKey))];
  }
  function findSheetItem(sheet, label, spell) {
    const items = [...(sheet?.features || []), ...(sheet?.spells || [])];
    const text = String(label || '');
    const wanted = [text, text.replace(/\s*\([^)]*\)$/, ''), text.replace(/:.*$/, ''), String(spell || '').replace(/_/g, ' ')].map(nameKey).filter(Boolean);
    for (const w of wanted) {
      const hit = items.find(i => sheetNames(i.name).includes(w));
      if (hit) return normalizeSheetItem(hit);
    }
    return null;
  }
  // The pools an action draws on, from the acting creature's pools.
  function poolsFor(a, pools) {
    const list = Array.isArray(pools) ? pools : [];
    const find = test => list.find(p => test(String(p.label)) && typeof p.value === 'number');
    const out = [];
    if (a.free_cast) out.push(find(l => nameKey(l) === nameKey(`Magic Initiate ${String(a.spell || '').replace(/_/g, ' ')}`)));
    else if (Number(a.at_level) > 0) out.push(find(l => l === `Level ${a.at_level} slots`));
    const byKind = { second_wind: 'Second Wind', action_surge: 'Action Surge', divine_spark: 'Channel Divinity', channel_divinity_turn_undead: 'Channel Divinity', preserve_life: 'Channel Divinity', rage: 'Rage', innate_sorcery: 'Innate Sorcery', create_spell_slot: 'Sorcery points' };
    if (byKind[a.kind]) out.push(find(l => l === byKind[a.kind]));
    if (a.metamagic) out.push(find(l => l === 'Sorcery points'));
    return out.filter(Boolean);
  }
  const poolLeft = p => `${p.label}: ${p.value}${p.max != null ? ' of ' + p.max : ''} left`;

  // label: the card's name; list: the actions of the variant shown; sheet: the actor's sheet.
  function abilityInfo(label, list, sheet, pools) {
    const a = list[0] || {};
    const v = variantOf(a);
    const item = findSheetItem(sheet, label, a.spell);
    const basic = BASIC_INFO[a.kind] || (/^Unarmed (Attack|Strike)$/.test(label) ? UNARMED_INFO : '');
    let text = item?.text || basic;
    if (item?.text && BASIC_INFO[a.kind] && ['dragons_breath_exhale', 'create_spell_slot', 'convert_spell_slot'].includes(a.kind)) text = BASIC_INFO[a.kind];
    if (!text && catOf(a) === 'attack') text = 'A weapon attack.';
    const stats = String(sheet?.stats || '');
    const facts = [];
    const cost = a.kind === 'move' ? 'Movement' : String(a.cost || 'action');
    const left = poolsFor(a, pools).map(poolLeft);
    facts.push(['Cost', [cost.charAt(0).toUpperCase() + cost.slice(1), ...left].join(' · ')]);
    const reach = text.match(/reach (\d+) ft/i)?.[1];
    const bow = /bow\b/i.test(label), bowRange = bow ? text.match(/(\d+\/\d+) ft/)?.[1] : null;
    const within = text.match(/within (\d+) ft/i)?.[1];
    const melee = catOf(a) === 'attack' && !bow && /^\+\d/.test(text);
    const range = v.value === 'thrown' ? (THROWN_RANGE[v.base] ? `Thrown ${THROWN_RANGE[v.base]}` : 'Thrown')
      : SPELL_RANGE[a.spell] || (reach ? `Reach ${reach} ft` : bowRange ? bowRange + ' ft' : melee ? 'Reach 5 ft' : within ? `${within} ft` : '');
    if (range) facts.push(['Range', range]);
    const area = text.match(/(\d+)-ft (cone|cube|sphere|line|emanation|radius)/i);
    if (area) facts.push(['Area', `${area[1]}-ft ${area[2].toLowerCase()}`]);
    else if (Array.isArray(a.cells) && a.cells.length) facts.push(['Area', `${a.cells.length} squares`]);
    if (['move', 'spiritual_weapon_move'].includes(a.kind)) return { name: label, variant: '', text, facts };
    const save = text.match(/\b(STR|DEX|CON|INT|WIS|CHA) save(?: \(DC (\d+)\))?/);
    const dc = save?.[2] || stats.match(/save DC (\d+)/)?.[1];
    const spellAtk = stats.match(/attack \+(\d+)/)?.[1];
    const weaponAtk = text.match(/^\+(\d+)/)?.[1];
    if (save) facts.push(['Roll', `${save[1]} save${dc ? ', DC ' + dc : ''}${/half/i.test(text) ? ' (half on a success)' : ''}`]);
    else if (/never miss/i.test(text)) facts.push(['Roll', 'None: it always hits']);
    else if (weaponAtk) facts.push(['Roll', `Attack roll +${weaponAtk}`]);
    else if (/\b(ranged|melee) attack|\bstrikes\b/i.test(text) && (a.spell || /^Spiritual Weapon/.test(label))) facts.push(['Roll', `Spell attack${spellAtk ? ' +' + spellAtk : ''}`]);
    const types = VARIANT_DAMAGE.join('|');
    const dice = [...text.matchAll(new RegExp(`(\\d+d\\d+(?:\\s*[+-]\\s*(?:\\d+|WIS))?)(?:\\s+(${types}))?`, 'g'))]
      .map(m => `${m[1].replace(/\s+/g, ' ')}${m[2] ? ' ' + m[2] : v.noun === 'Damage type' && /damage/i.test(text) ? ' ' + v.value : ''}`);
    if (dice.length) {
      const healing = /\b(heal|regain)/i.test(text), harm = /damage|\b(acid|cold|fire|force|lightning|necrotic|poison|psychic|radiant|thunder|bludgeoning|piercing|slashing)\b/i.test(text);
      facts.push([healing && harm ? 'Dice' : healing ? 'Healing' : 'Damage', [...new Set(dice)].join(' · ')]);
    }
    if (Number(a.at_level) > Number(a.spell_level) && Number(a.spell_level) > 0) facts.push(['Upcast', `Cast with a level ${a.at_level} slot`]);
    return { name: label, variant: v.value ? variantText(v.noun, v.value) : '', text, facts };
  }
  function abilityInfoHtml(info) {
    if (!info) return '';
    return `<div class="ai-head"><b>${escape(info.name)}</b>${info.variant ? `<span class="ai-variant">${escape(info.variant)}</span>` : ''}</div>${info.text ? `<p class="ai-text">${escape(info.text)}</p>` : ''}<dl class="ai-facts">${info.facts.map(([k, v]) => `<dt>${escape(k)}</dt><dd>${escape(v)}</dd>`).join('')}</dl>`;
  }

  // The info for a card: the selected card shows its chosen variant, slot and option; another
  // card shows the variant last picked for it (or its first).
  function infoForGroup(key) {
    const group = groupedActions().find(g => g.key === key);
    if (!group) return null;
    const v = pickVariant(variantsOf(group.actions), key === selectedGroup ? selectedVariant : null, variantMemory.get(key));
    let list = group.actions.filter(a => variantOf(a).value === v);
    if (key === selectedGroup) { const cur = currentActions(); if (cur.length) list = cur; }
    return abilityInfo(group.label, list, activeUnit()?.sheet, state?.resources?.pools);
  }

  // --- The character sheet: one panel for every figure -----------------------------------
  function poolRows(pools) {
    return pools.map(p => {
      const n = Number(p.value), max = p.max == null ? null : Number(p.max);
      const val = p.value === 'active' ? 'active' : max != null ? `${n} of ${max} left` : `${p.value} left`;
      const pips = max != null && max > 0 && max <= 8 ? `<span class="pips">${Array.from({ length: max }, (_, i) => `<i class="pip use${i < n ? ' on' : ''}"></i>`).join('')}</span>` : '';
      return `<li><b>${escape(p.label)}</b>${pips}<span>${escape(val)}</span></li>`;
    }).join('');
  }
  function sheetUnits() {
    if (!state) return [];
    const units = state.phase === 'setup' ? (state.setup?.roster || []) : state.units;
    return [...units.filter(u => u.team === 'heroes'), ...units.filter(u => u.team !== 'heroes')];
  }
  function sheetPanelHtml(unit) {
    const acting = unit.id === state.turn_id && !['setup', 'finished'].includes(state.phase);
    const res = state.resources || {};
    const sheet = unit.sheet || {};
    const speed = String(sheet.stats || '').match(/Speed (\d+) ft/)?.[1];
    const conds = conditionLabels(unit).map(niceName);
    const status = vitalHtml(unit) || `<span class="vital vital-up">${unit.alive === false ? 'Down' : 'Standing'}</span>`;
    const parts = [];
    parts.push(`<div class="sheet-head">${portrait(unit)}<div><h2 id="sheet-title">${escape(unit.name)}${heroLevelBadge(unit, 'actor-lv-pill')}</h2><p class="sheet-class">${escape(nativeClass(unit, true))}${acting ? ' · <b class="acting">acting now</b>' : ''}</p></div></div>`);
    parts.push(`<div class="sheet-stat-row"><span><small>AC</small><b>${escape(unit.ac ?? '—')}</b></span><span><small>HP</small><b>${escape(unit.hp ?? unit.max_hp)}/${escape(unit.max_hp)}</b></span>${speed ? `<span><small>Speed</small><b>${escape(speed)} ft</b></span>` : ''}${unit.str_loss ? `<span><small>STR</small><b>−${escape(unit.str_loss)}</b></span>` : ''}</div>`);
    parts.push(`<div class="sheet-status">${status}${lifeText(unit) ? `<span class="sheet-note">${escape(lifeText(unit))}</span>` : ''}</div>`);
    parts.push(`<h3>Conditions and effects</h3>${conds.length ? `<ul class="sheet-tags">${conds.map(c => `<li>${escape(c)}</li>`).join('')}</ul><p class="sheet-note">The game does not send how long each one has left.</p>` : '<p class="sheet-note">None.</p>'}`);
    if (acting) {
      const orb = (lbl, ready) => `<li class="${ready ? 'ready' : 'spent'}"><b>${lbl}</b><span>${ready ? 'available' : 'spent'}</span></li>`;
      parts.push(`<h3>This turn</h3><ul class="sheet-pools">${orb('Action', res.action)}${orb('Bonus action', res.bonus_action)}${orb('Reaction', res.reaction)}<li><b>Movement</b><span>${escape(res.movement ?? 0)} ft left</span></li>${Number(res.champion_movement) > 0 ? `<li><b>Free move</b><span>${escape(res.champion_movement)} ft without opportunity attacks</span></li>` : ''}</ul>`);
    }
    const seen = poolsSeen.get(unit.id);
    const pools = acting ? (res.pools || []) : seen?.pools || [];
    if (unit.team === 'heroes' || pools.length) {
      const note = acting ? ''
        : seen ? `<p class="sheet-note">As last shown on ${escape(unit.name)}’s turn in round ${escape(seen.round + 1)}. The game sends spell slots and uses only for the creature acting now, so a reaction (such as Shield) since then is not counted.</p>`
          : `<p class="sheet-note">Shown from ${escape(unit.name)}’s first turn: the game sends spell slots and uses only for the creature acting now.</p>`;
      parts.push(`<h3>Spell slots and uses</h3>${pools.length ? `<ul class="sheet-pools">${poolRows(pools)}</ul>` : (seen || acting ? '<p class="sheet-note">None.</p>' : '')}${note}`);
    }
    const list = items => `<ul class="sheet-list">${items.map(raw => {
      const i = normalizeSheetItem(raw);
      return `<li><b>${escape(i.name)}</b> ${escape(i.text)}</li>`;
    }).join('')}</ul>`;
    if (sheet.stats) parts.push(`<p class="sheet-stats">${escape(sheet.stats)}</p>`);
    if (sheet.features?.length) parts.push(`<h3>Features and attacks</h3>${list(sheet.features)}`);
    if (sheet.spells?.length) parts.push(`<h3>Spells</h3>${list(sheet.spells)}`);
    if (unit.description) parts.push(`<p class="sheet-note">${escape(unit.description)}</p>`);
    return parts.join('');
  }
  function renderSheet() {
    const dialog = $('sheet-dialog');
    const units = sheetUnits();
    const unit = units.find(u => u.id === sheetUnitId) || units[0];
    if (!unit) { $('sheet-body').innerHTML = '<p>No figures yet.</p>'; $('sheet-units').replaceChildren(); return; }
    sheetUnitId = unit.id;
    $('sheet-units').innerHTML = units.map(u => `<button class="sheet-unit ${u.team === 'heroes' ? 'hero' : 'monster'} ${u.id === unit.id ? 'selected' : ''}" data-sheet-unit="${escape(u.id)}" aria-pressed="${u.id === unit.id}">${escape(u.name)}</button>`).join('');
    const scroll = dialog.scrollTop;
    $('sheet-body').innerHTML = sheetPanelHtml(unit);
    dialog.scrollTop = scroll;
  }
  function openSheet(id) {
    sheetUnitId = id;
    renderSheet();
    const dialog = $('sheet-dialog');
    if (!dialog.open) typeof dialog.showModal === 'function' ? dialog.showModal() : dialog.setAttribute('open', '');
  }
  const sheetButton = u => `<button class="sheet-btn" data-sheet="${escape(u.id)}" aria-label="Character sheet: ${escape(u.name)}" title="Character sheet">Sheet</button>`;

  function rosterButton(u, extra = '') {
    const hp = u.hp ?? u.max_hp ?? 1, maxHp = u.max_hp ?? 1;
    const conds = conditionLabels(u);
    const placed = state.units.some(p => p.id === u.id);
    const clsText = nativeClass(u, u.team !== 'heroes');
    const meta = !placed && state.phase === 'setup' ? `${clsText} · not placed`
      : lifeText(u) || (conds.length ? conds.join(' · ') : clsText);
    return `<button class="roster-unit ${extra} ${u.alive === false ? 'fallen' : ''} ${vitalOf(u) ? 'vital-' + vitalOf(u).state : ''} ${u.id === activeUnit()?.id ? 'active' : ''} ${u.id === inspectedId ? 'inspected' : ''}" data-inspect="${escape(u.id)}" data-cam-focus="${placed ? escape(u.id) : ''}">${portrait(u)}<span class="roster-info"><span class="roster-name"><span class="roster-title"><span class="roster-title-name">${escape(u.name)}</span>${heroLevelBadge(u)}</span><span>${u.ac ? `<b class="roster-ac-pill">AC ${escape(u.ac)}</b> ` : ''}${escape(hp)}/${escape(maxHp)}</span></span><span class="roster-meta">${vitalHtml(u) || escape(meta)}</span>${hpBar({ ...u, hp, max_hp: maxHp })}</span></button>`;
  }

  function renderRoster() {
    if (!state) return;
    const placedHeroes = state.units.filter(u => u.team === 'heroes');
    const setupHeroes = state.phase === 'setup' ? (state.setup?.roster || []).filter(u => u.team === 'heroes') : [];
    const heroList = placedHeroes.length ? placedHeroes : setupHeroes;
    $('hero-count').textContent = `${heroList.filter(u => u.alive !== false).length}/${heroList.length} standing`;
    const slot = (u, extra = '') => `<div class="roster-slot">${rosterButton(u, extra)}${sheetButton(u)}</div>`;
    $('hero-roster').innerHTML = heroList.map(u => slot(u)).join('');
    const enemies = state.units.filter(u => u.team === 'monsters');
    $('enemy-count').textContent = `${enemies.filter(u => u.alive).length}/${enemies.length}`;
    $('enemy-roster').innerHTML = enemies.map(u => slot(u, 'monster')).join('');

    const unit = activeUnit();
    $('active-actor').classList.toggle('monster', unit?.team === 'monsters');
    $('active-actor').innerHTML = unit
      ? `<div class="actor-identity">${portrait(unit)}<div><span class="actor-class">${escape(nativeClass(unit, unit.team !== 'heroes'))}</span><h2>${escape(unit.name)}${heroLevelBadge(unit, 'actor-lv-pill')}</h2><div class="actor-hp"><strong>${escape(unit.hp)}</strong>/${escape(unit.max_hp)} HP${unit.ac ? ` · AC ${escape(unit.ac)}` : ''}</div></div>${sheetButton(unit)}</div>${hpBar(unit)}`
      : '<p class="map-tag">The fight is over.</p>';

    const res = state.resources || {};
    const orb = (cls, lbl, ready, name) => `<span class="res-orb ${cls} ${ready ? 'ready' : 'spent'}" title="${escape(name)}: ${ready ? 'available' : 'spent'}"><i></i>${lbl}</span>`;
    const pools = Array.isArray(res.pools)
      ? res.pools.map(p => `<span class="slot-gems">${escape(p.label)}: ${escape(p.value)}${p.max != null ? '/' + escape(p.max) : ''}</span>`).join('') : '';
    const freeMove = Number(res.champion_movement) > 0
      ? `<span class="slot-gems champion-free-move" title="Remarkable Athlete: next ${escape(res.champion_movement)} ft provoke no opportunity attacks">Free move: ${escape(res.champion_movement)} ft (no OA)</span>` : '';
    $('resources').innerHTML = ['finished', 'setup'].includes(state.phase) || !unit ? ''
      : orb('act', 'ACT', res.action, 'Action') + orb('bon', 'BON', res.bonus_action, 'Bonus action') + orb('rct', 'RCT', res.reaction, 'Reaction')
        + `<span class="res-orb move-left" title="Movement left">${escape(res.movement ?? '0')} ft</span>` + freeMove + pools;

    const inspected = targets().find(u => u.id === inspectedId) || unit;
    $('zoom-inspected-btn').disabled = !inspected || sceneUnavailable;
    if (inspected) {
      const condText = [lifeText(inspected), ...conditionLabels(inspected)].filter(Boolean).join(' · ') || 'No conditions';
      $('inspect-content').innerHTML = `<h3>${escape(inspected.name)}${heroLevelBadge(inspected, 'actor-lv-pill')}</h3><p>${escape(nativeClass(inspected, inspected.team !== 'heroes'))}</p>${inspected.description ? `<p class="inspect-description">${escape(inspected.description)}</p>` : ''}<div class="inspection-stats"><span>HP ${escape(inspected.hp)}/${escape(inspected.max_hp)}</span>${inspected.ac ? `<span>AC ${escape(inspected.ac)}</span>` : ''}<span>${escape(cellName(inspected.x || 0, inspected.y || 0))}</span>${inspected.str_loss ? `<span>STR −${escape(inspected.str_loss)}</span>` : ''}${inspected.id === state.turn_id ? '<span class="acting">acting now</span>' : ''}${inspected.sheet ? sheetButton(inspected) : ''}</div><span class="inspection-conditions">${escape(condText)}</span>${sheetHtml(inspected, true)}`;
    } else {
      $('inspect-content').innerHTML = '<h3>Inspector</h3><p>Click a figure or portrait to see its traits, attacks and spells.</p>';
    }
  }

  // --- The command deck --------------------------------------------------------------
  const compass = (dx, dy) => ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'][((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8];
  const nameOf = id => targets().find(u => u.id === id)?.name || id;
  const allocationIds = () => [...allocation].flatMap(([id, count]) => Array(count).fill(id));
  const allocationMatch = list => list.find(a => allocationKey(a.target_ids || []) === allocationKey(allocationIds()));
  const SPLIT_NOUNS = { magic_missile: 'darts', scorching_ray: 'rays', bless: 'targets', aid: 'targets', command: 'targets' };

  function aimLabel(action) {
    const actor = activeUnit();
    if (['burning_hands', 'thunderwave'].includes(action.spell) || action.kind === 'dragons_breath_exhale') {
      return `aim ${actor ? compass(action.x - actor.x, action.y - actor.y) : cellName(action.x, action.y)}`;
    }
    return `centre ${cellName(action.x, action.y)}`;
  }
  function hitsLabel(action) {
    const parts = [];
    if (action.hits?.length) parts.push(`hits ${action.hits.map(nameOf).join(', ')}`);
    if (action.allies?.length) {
      const selfId = activeUnit()?.id;
      const selfHit = Boolean(selfId && action.allies.includes(selfId));
      const others = action.allies.filter(id => id !== selfId).map(nameOf);
      if (selfHit && others.length) parts.push(`⚠ self & ally ${others.join(', ')}`);
      else if (selfHit) parts.push(`⚠ self (${nameOf(selfId)})`);
      else parts.push(`⚠ ally ${others.join(', ')}`);
    }
    return parts.join(' · ');
  }

  function renderActions() {
    if (state?.phase === 'setup') { $('hotbar-popbar').hidden = true; return; }
    const groups = groupedActions();
    const cats = [['all', 'All'], ['move', 'Move'], ['attack', 'Weapons'], ['spell', 'Spells'], ['feature', 'Features'], ['defense', 'Defense']];
    $('cat-tabs').innerHTML = cats.map(([id, lbl]) => `<button class="cat-tab ${activeCatFilter === id ? 'is-on' : ''}" data-cat-filter="${id}" aria-pressed="${activeCatFilter === id}">${lbl}</button>`).join('');
    const matchesFilter = g => {
      if (activeCatFilter === 'all') return true;
      const actKind = g.actions[0]?.kind;
      if (activeCatFilter === 'defense') {
        return ['dodge', 'dash', 'stand', 'disengage', 'disengage_bonus', 'hide', 'hide_bonus', 'escape_grapple', 'break_free'].includes(g.kind)
          || ['disengage', 'disengage_bonus', 'hide', 'hide_bonus', 'escape_grapple', 'break_free'].includes(actKind);
      }
      if (activeCatFilter === 'feature') return ['feature', 'second_wind', 'action_surge'].includes(g.kind);
      return g.kind === activeCatFilter;
    };
    const visibleGroups = groups.filter(matchesFilter);
    if (!visibleGroups.length) {
      $('action-bar').innerHTML = `<span class="map-tag empty-bar">${canAct() ? 'Nothing in this tab.' : 'Waiting for your turn…'}</span>`;
    } else {
      $('action-bar').innerHTML = visibleGroups.map((g, idx) => {
        const selected = g.key === selectedGroup;
        const firstAct = g.actions[0];
        const rawCost = g.kind === 'move' ? 'Move' : (firstAct?.cost?.replace(/ \+ sorcery points$/, '') || 'Action');
        const shortCost = firstAct?.ray_count
          ? (firstAct.ray_number > 1 ? `Ray ${firstAct.ray_number}/${firstAct.ray_count} · same cast` : `Ray 1/${firstAct.ray_count}`)
          : rawCost.replace('Magic Initiate free cast', 'Free cast').replace('level ', 'Lv').replace('bonus action', 'Bonus').replace('action', 'Action');
        const cardName = g.label
          .replace(/^Font of Magic: create level (\d+) spell slot \((\d+) sorcery points\)$/i, 'Create Lv$1 Slot ($2 SP)')
          .replace(/^Font of Magic: convert level (\d+) spell slot to sorcery points$/i, 'Lv$1 Slot → SP');
        return `<button class="ability-card kind-${escape(g.kind)} ${selected ? 'selected' : ''}" data-group="${escape(g.key)}" aria-pressed="${selected}" title="${escape(g.label)} (${escape(rawCost)})" ${!canAct() ? 'disabled' : ''}>${idx < 9 ? `<span class="ability-hotkey">${idx + 1}</span>` : ''}${icon(g.kind, g.label)}<span class="ability-name">${escape(cardName)}</span><span class="ability-cost">${escape(shortCost)}</span></button>`;
      }).join('');
    }
    renderHotbarPopbar(groups);
    renderAbilityInfo();
    keepSelectedCardInView();
    updateStripCues();
  }

  // Hover or keyboard focus on a card shows what it does beside the deck (desktop); on touch
  // screens the selected card's text sits behind its About button in the chooser.
  let hoverKey = null, focusKey = null;
  function renderAbilityInfo() {
    const box = $('ability-info');
    const key = hoverKey || focusKey;
    const info = key && canAct() ? infoForGroup(key) : null;
    box.hidden = !info;
    box.innerHTML = info ? abilityInfoHtml(info) : '';
    // It sits in the free corner on the right, just above the action bar.
    const deck = info && $('command-area')?.getBoundingClientRect();
    if (deck && deck.height) {
      const bottom = Math.max(10, Math.round(window.innerHeight - deck.top + 8));
      box.style.bottom = `${bottom}px`;
      box.style.maxHeight = `${Math.max(140, Math.min(460, window.innerHeight - bottom - 190))}px`;
    }
  }

  // The card strip scrolls sideways when a hero has more actions than fit. Some browsers
  // hide overlay scrollbars until the strip is scrolled, so the edges show arrows (with the
  // number of cards still hidden on the right) whenever there is more to see.
  function updateStripCues() {
    const bar = $('action-bar');
    const room = bar.scrollWidth - bar.clientWidth;
    const left = room > 2 && bar.scrollLeft > 2;
    const right = room > 2 && bar.scrollLeft < room - 2;
    $('action-strip-left').hidden = !left;
    $('action-strip-right').hidden = !right;
    $('action-strip').classList.toggle('more-left', left);
    $('action-strip').classList.toggle('more-right', right);
    if (right) {
      const edge = bar.getBoundingClientRect().right;
      const hidden = [...bar.querySelectorAll('.ability-card')].filter(c => c.getBoundingClientRect().left >= edge - 24).length;
      $('action-strip-more').textContent = hidden ? String(hidden) : '';
    }
  }
  function keepSelectedCardInView() {
    const bar = $('action-bar');
    const card = bar.querySelector('.ability-card.selected');
    if (!card) return;
    const b = bar.getBoundingClientRect(), c = card.getBoundingClientRect();
    if (c.left < b.left + 28) bar.scrollLeft -= (b.left + 28) - c.left;
    else if (c.right > b.right - 28) bar.scrollLeft += c.right - (b.right - 28);
  }
  function scrollStrip(direction) {
    const bar = $('action-bar');
    bar.scrollBy({ left: direction * Math.max(120, bar.clientWidth * 0.8), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  function chipTargetText(a) {
    const t = targets().find(u => u.id === a.target_id);
    const counts = new Map();
    for (const id of a.target_ids || []) counts.set(id, (counts.get(id) || 0) + 1);
    const allocLbl = [...counts].map(([id, c]) => `${nameOf(id)}${c > 1 ? ' ×' + c : ''}`).join(' + ');
    return a.cells ? aimLabel(a) : (allocLbl || t?.name || (hasPosition(a) ? cellName(a.x, a.y) : ''));
  }

  function renderHotbarPopbar(groups) {
    const group = groups.find(g => g.key === selectedGroup);
    const list = group ? groupActions() : [];
    const pop = $('hotbar-popbar'), optBox = $('action-options'), tgtBox = $('target-options');
    const rayLocked = isRayContinuation();
    $('chooser-back').hidden = rayLocked;
    if (!group || !canAct() || !list.length) {
      pop.hidden = true;
      optBox.replaceChildren(); tgtBox.replaceChildren();
      $('action-hint').textContent = state.phase === 'finished' ? 'The fight is over.'
        : watching ? 'Watching: the engine plays both sides.'
        : busy ? 'Resolving…'
        : !state.can_act ? 'The monsters are acting.'
        : 'Pick an action card, or click a highlighted square to move.';
      return;
    }
    const optParts = [];
    const levels = levelsOf(list);
    const lv = levels.includes(selectedLevel) ? selectedLevel : levels[0];
    const opts = optionsOf(list.filter(a => paymentKey(a) === (lv ?? null)));
    const op = opts.includes(selectedOption) ? selectedOption : opts[0];
    const pill = (attr, val, txt, on, cls = '') => `<button class="option-pill ${cls} ${on ? 'selected' : ''}" data-${attr}="${escape(val)}" aria-pressed="${on}">${escape(txt)}</button>`;
    const variants = variantsOf(group.actions), noun = variantNoun(group.actions);
    if (variants.length > 1) {
      const vr = variantOf(list[0]).value;
      optParts.push(`<span class="option-row variant-row"><span class="option-name">${escape(noun)}</span>${variants.map(v => pill('variant', v, variantText(noun, v), v === vr, noun === 'Damage type' ? `dmg-chip dmg-${v}` : '')).join('')}</span>`);
    }
    if (levels.length > 1) optParts.push(`<span class="option-row"><span class="option-name">Slot</span>${levels.map(l => pill('level', l, l === 'free' ? 'Free use' : l === '0' ? 'Cantrip' : `Level ${l}`, l === lv)).join('')}</span>`);
    if (opts.length > 1) optParts.push(`<span class="option-row"><span class="option-name">${group.kind === 'spell' ? 'Metamagic' : 'Mode'}</span>${opts.map(o => pill('option', o, o === '' ? 'Standard' : niceName(o), o === op)).join('')}</span>`);

    const cur = currentActions();
    if (cur[0]?.spell === 'command') optParts.push('<span class="option-row">Command currently chooses Grovel or Halt automatically.</span>');
    if (isSplit(cur)) {
      const total = Math.max(...cur.map(a => a.target_ids.length));
      const ids = [...new Set(cur.flatMap(a => a.target_ids))].sort();
      const cap = id => Math.max(...cur.map(a => a.target_ids.filter(x => x === id).length));
      const used = allocationIds().length;
      const noun = SPLIT_NOUNS[cur[0].spell] || 'targets';
      const match = allocationMatch(cur);
      const splitWarns = match ? actionWarnings(match) : [];
      for (const w of splitWarns) optParts.push(`<span class="option-row option-warn">${escape(w)}</span>`);
      optParts.push(`<span class="allocation"><span class="option-name">${noun} ${used}/${total}</span>${ids.map(id => {
        const c = allocation.get(id) || 0;
        return `<span class="alloc-row"><span>${escape(nameOf(id))}</span><button class="alloc-step" data-alloc-dec="${escape(id)}" aria-label="One fewer on ${escape(nameOf(id))}" ${!c ? 'disabled' : ''}>−</button><b>${c}</b><button class="alloc-step" data-alloc-inc="${escape(id)}" aria-label="One more on ${escape(nameOf(id))}" ${used >= total || c >= cap(id) ? 'disabled' : ''}>+</button></span>`;
      }).join('')}<button class="button primary${splitWarns.length ? ' friendly-fire' : ''}" data-alloc-confirm="1" ${!match ? 'disabled' : ''}>Cast ${escape(group.label)}${match?.cost ? ' · ' + escape(match.cost) : ''}</button></span>`);
    }
    optBox.innerHTML = optParts.join('');

    const chips = [];
    if (group.kind === 'move') {
      if (armed && cur.some(a => a.id === armed.id)) {
        const oa = oaWarning(armed);
        chips.push(`<button class="target-chip confirm friendly-fire" data-action="${escape(armed.id)}">Confirm move → ${escape(cellName(armed.x, armed.y))}${armed.cost ? ' · ' + escape(armed.cost) : ''}${oa ? ' · ' + escape(oa) : ''}</button>`);
      }
      // Destination chips: the 2D fallback and keyboard players need them; one per square, cheapest path.
      if (sceneUnavailable || $('move-chips-toggle').checked) {
        const bySquare = new Map();
        for (const a of cur) {
          const key = `${a.x},${a.y}`;
          if (!bySquare.has(key) || pathCost(a) < pathCost(bySquare.get(key))) bySquare.set(key, a);
        }
        const actor = activeUnit();
        const ordered = [...bySquare.values()].sort((a, b) => pathCost(a) - pathCost(b) || (a.y - b.y) || (a.x - b.x));
        for (const a of ordered) {
          if (armed && armed.id === a.id) continue;
          const dir = actor ? compass(a.x - actor.x, a.y - actor.y) : '';
          const oa = oaWarning(a);
          chips.push(`<button class="target-chip move-chip${oa ? ' friendly-fire' : ''}" data-action="${escape(a.id)}">→ ${escape(cellName(a.x, a.y))} · ${escape(a.cost || '')}${dir ? ' · ' + escape(dir) : ''}${oa ? ' · ' + escape(oa) : ''}</button>`);
        }
      }
    } else if (cur.length && cur.every(a => a.kind === 'spiritual_weapon_move')) {
      const actor = activeUnit();
      const foes = (state.units || []).filter(u => u.alive !== false && actor && u.team !== actor.team);
      const nearestFoe = a => {
        let best = null, dist = 999;
        for (const f of foes) {
          const d = Math.max(Math.abs(a.x - f.x), Math.abs(a.y - f.y)) * 5;
          if (d < dist) { dist = d; best = f; }
        }
        return { foe: best, dist };
      };
      const ordered = [...cur].sort((a, b) => nearestFoe(a).dist - nearestFoe(b).dist || (a.y - b.y) || (a.x - b.x));
      for (const a of ordered) {
        const near = nearestFoe(a);
        const suffix = near.foe ? ` · ${near.dist} ft to ${near.foe.name}` : '';
        chips.push(`<button class="target-chip move-chip" data-action="${escape(a.id)}">→ ${escape(cellName(a.x, a.y))}${escape(suffix)}</button>`);
      }
    } else if (!isSplit(cur)) {
      const seen = new Set();
      if (armed && cur.some(a => a.id === armed.id)) {
        const tgt = armed.cells ? aimLabel(armed) : chipTargetText(armed);
        const cov = coverText(armed);
        const defTxt = defenseText(armed);
        const warns = actionWarnings(armed);
        const bits = [
          tgt ? `Confirm ${armed.label} → ${tgt}` : `Confirm ${armed.label}`,
          hitsLabel(armed),
          defTxt,
          cov,
          ...warns,
          armed.cost,
        ].filter(Boolean);
        chips.push(`<button class="target-chip confirm${hasWarning(armed) ? ' friendly-fire' : ''}" data-action="${escape(armed.id)}">${escape(bits.join(' · '))}</button>`);
      }
      const mine = choices.filter(c => list.some(a => a.id === c.id));
      const heardInvisibleAt = a => (state.units || []).find(u => isInvisibleHeard(u) && hasPosition(a) && atCell(u, a.x, a.y)) || null;
      const targetActs = mine.length ? mine : cur.filter(a => {
        if (a.square_attack) return Boolean(heardInvisibleAt(a)) || sceneUnavailable;
        return hasTarget(a) || a.target_ids?.length || !hasPosition(a) || a.cells;
      });
      for (const a of targetActs) {
        if (seen.has(a.id) || (armed && armed.id === a.id)) continue;
        seen.add(a.id);
        const heardUnit = a.square_attack ? heardInvisibleAt(a) : null;
        const tgt = heardUnit ? `${heardUnit.name} (Invisible — heard here)` : chipTargetText(a);
        const hits = hitsLabel(a), cov = coverText(a), defTxt = defenseText(a), warns = actionWarnings(a);
        const disTag = a.disadvantage ? 'Disadvantage' : '';
        const rayTag = a.ray_count ? ` [Ray ${a.ray_number}/${a.ray_count}]` : '';
        const head = tgt ? `${a.label}${rayTag} → ${tgt}` : `${a.label}${rayTag}`;
        const bits = [head, disTag, defTxt, cov, ...warns, a.cost, hits].filter(Boolean);
        chips.push(`<button class="target-chip ${hasWarning(a) ? 'friendly-fire' : ''}" data-action="${escape(a.id)}" title="${escape(a.description || head)}">${escape(bits.join(' · '))}</button>`);
      }
    }
    tgtBox.innerHTML = chips.join('');
    const inline = $('ability-info-inline'), toggle = $('ability-info-toggle');
    inline.innerHTML = abilityInfoHtml(infoForGroup(group.key));
    inline.hidden = !infoOpen;
    toggle.setAttribute('aria-expanded', String(infoOpen));
    toggle.classList.toggle('selected', infoOpen);
    pop.hidden = !optParts.length && !chips.length && !infoOpen;
    $('action-hint').textContent = cur[0]?.ray_count
      ? `Choose a target for Scorching Ray ${cur[0].ray_number} of ${cur[0].ray_count}${cur[0].cost ? ` (${cur[0].cost})` : ''}.`
      : armed && armed.kind === 'move' && oaWarning(armed)
        ? `${oaWarning(armed)}. Press Confirm above (or click ${cellName(armed.x, armed.y)} again) to move anyway.`
        : armed && !armed.cells && actionWarnings(armed).length
          ? `${actionWarnings(armed).join(' ')} Press Confirm above to proceed anyway.`
          : group.kind === 'move'
            ? `${group.label}: click a highlighted square${sceneUnavailable ? ' on the map or a square below' : ''}.`
            : cur[0]?.kind === 'spiritual_weapon_move'
              ? `${group.label}: click a highlighted square on the map or a square above.`
              : cur.some(a => a.square_attack)
                ? `${group.label}: click a highlighted creature, or click any square in range to attack blindly (Disadvantage).`
                : `${group.label}: click a highlighted creature or a choice above.`;
  }

  // The engine's log, with what the page reads from it set apart: Sanctuary saves and its end,
  // and the running death-save tally after each death save or failure from a hit.
  function displayLog() {
    const logs = Array.isArray(state?.log) ? state.log : [];
    if (!logs.length) return logs;
    const first = logs[0].id, last = logs[logs.length - 1].id;
    const { notes } = vitals();
    const ends = [...derived.wardEnds.values()].filter(w => w.after >= first && w.after <= last);
    const out = [];
    for (const entry of logs) {
      const text = String(entry.text || '');
      const note = notes[entry.id];
      const ward = WARD_SAVE.test(text);
      out.push(note ? { ...entry, extra: deathSaveNote(note), mark: 'death' } : ward ? { ...entry, mark: 'ward' } : entry);
      for (const w of ends) if (w.after === entry.id) out.push({ id: w.id, round: entry.round, text: w.text, tone: 'status', mark: 'ward' });
    }
    return out;
  }

  function renderLog() {
    const el = $('combat-log');
    const logs = displayLog();
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    const key = e => `${e.id}|${e.extra || ''}`;
    const prefix = lastLogIds.length <= logs.length && lastLogIds.every((id, idx) => id === key(logs[idx] || {}));
    if (!prefix || !lastLogIds.length) { el.replaceChildren(); lastLogIds = []; }
    const fresh = logs.slice(lastLogIds.length);
    for (const entry of fresh) {
      const row = document.createElement('div');
      row.className = `log-entry ${['info', 'hit', 'miss', 'spell', 'turn', 'status', 'end'].includes(entry.tone) ? entry.tone : 'info'}${entry.mark ? ' log-' + entry.mark : ''}`;
      const r = document.createElement('span');
      r.className = 'log-round';
      r.textContent = `R${(Number(entry.round) || 0) + 1}`;
      const t = document.createElement('span');
      t.textContent = entry.text;
      row.append(r, t);
      if (entry.extra) {
        const x = document.createElement('span');
        x.className = 'log-extra';
        x.textContent = entry.extra;
        row.append(x);
      }
      el.append(row);
    }
    lastLogIds = logs.map(key);
    if (!logs.length) el.innerHTML = '<p class="log-empty">No events yet.</p>';
    if (nearBottom || !prefix) { el.scrollTop = el.scrollHeight; $('latest-button').hidden = true; }
    else if (fresh.length) $('latest-button').hidden = false;
  }

  function renderControls() {
    const finished = state?.phase === 'finished', setup = state?.phase === 'setup';
    const computerTurn = state?.phase === 'enemy' && !state?.can_act;
    $('watch-button').disabled = !state || busy || finished || setup;
    $('watch-button').classList.toggle('is-watching', watching);
    $('watch-button').textContent = watching ? '□ Stop watching' : '▷ Watch';
    $('watch-button').setAttribute('aria-pressed', String(watching));
    $('pause-button').disabled = !state || finished || setup || (!watching && state.phase === 'enemy' && state.can_act);
    $('pause-button').textContent = paused ? '▷' : '⏸';
    $('pause-button').setAttribute('aria-label', paused ? 'Resume' : 'Pause');
    $('step-button').disabled = !state || busy || finished || (!computerTurn && !watching);
    $('end-button').disabled = !canAct() || actions().some(a => a.ray_number > 1);
    $('end-button').querySelector('span').textContent = state?.champion_interrupt ? 'STAY HERE' : 'END TURN';
    $('end-button').querySelector('small').textContent = state?.champion_interrupt ? 'Decline the free move' : 'Next creature →';
    $('new-button').disabled = busy || !state;
    $('again-button').disabled = busy;
    if (!state) return;
    const inStory = !!storyRun && state.level?.encounter === storyRun.encounter && state.level?.id === storyRun.preset;
    $('open-levels-btn').textContent = storyRun ? '✦ Story map' : '✦ Levels';
    $('map-name').textContent = inStory && storyRun.title ? `${storyRun.title} · ${state.map.name}`
      : state.level && state.level.encounter_name !== state.map.name
        ? `${state.level.encounter_name} · ${state.map.name}` : state.map.name;
    const unit = activeUnit();
    const ind = $('turn-indicator');
    ind.classList.toggle('enemy', state.phase === 'enemy');
    ind.querySelector('span').textContent = setup ? 'Deployment'
      : finished ? 'Finished'
      : playing ? `${unit?.name || 'A creature'} acting`
      : busy ? 'Resolving…'
      : paused ? 'Paused'
      : `${unit?.name || 'A creature'}’s turn`;
    $('result-overlay').hidden = !finished;
    if (finished) {
      const outcome = state.winner === 'heroes' ? 'win' : state.winner === 'monsters' ? 'loss' : 'draw';
      $('result-overlay').dataset.outcome = outcome;
      $('result-title').textContent = { win: 'The heroes prevail', loss: 'The party has fallen', draw: 'No one is left standing' }[outcome];
      $('result-detail').textContent = inStory ? {
        win: 'Every roll is in the log. The story goes on.',
        loss: 'Try another plan: the log shows every roll. Retry the battle, or go back to the map.',
        draw: 'The fight ended without a winner. Retry the battle, or go back to the map.',
      }[outcome] : {
        win: 'Every roll is in the log. Play the level again, or choose another.',
        loss: 'Try another plan: the log shows every roll.',
        draw: 'The fight ended without a winner.',
      }[outcome];
      $('practice-result-actions').hidden = inStory;
      $('story-result-actions').hidden = !inStory;
      $('story-continue-button').hidden = outcome !== 'win';
      $('story-retry-button').hidden = outcome === 'win';
      const signal = `${state.encounter_id}:${state.revision}`;
      if (finishedSignal !== signal) {
        finishedSignal = signal;
        window.FFSound?.finish(outcome);
        document.dispatchEvent(new CustomEvent('ff:finished', { detail: {
          outcome, encounter: state.level?.encounter, preset: state.level?.id, story: inStory ? { ...storyRun } : null,
        } }));
      }
    }
  }

  function render() {
    try { return renderAll(); } finally { cameraCues(); }
  }
  function renderAll() {
    renderStartScreen();
    renderControls();
    if (!state) return;
    renderSetup();
    renderInitiative();
    renderBoard();
    renderRoster();
    if ($('sheet-dialog').open) renderSheet();
    renderActions();
    renderLog();
    if (!playing) showLatestDice();
  }

  // --- Networking ----------------------------------------------------------------------
  function clearTimer() { if (timer !== null) { window.clearTimeout(timer); timer = null; } }

  function schedule() {
    clearTimer();
    if (startScreenOpen || !state || busy || paused || hadError || ['finished', 'setup'].includes(state.phase) || (!watching && (state.phase !== 'enemy' || state.can_act))) return;
    const rev = state.revision;
    if (lastAutoRevision === rev) {
      paused = true;
      showNotice('Automatic play paused: the game did not move on. Press Resume to try again.');
      render();
      return;
    }
    timer = window.setTimeout(() => {
      timer = null;
      if (!startScreenOpen && !busy && !paused && state?.revision === rev && (watching || (state.phase === 'enemy' && !state.can_act))) {
        lastAutoRevision = rev;
        request('advance', { autoplay: watching });
      }
    }, watching ? 1000 : 900);
  }

  function showError(msg) {
    $('error-message').textContent = msg;
    $('error-banner').dataset.kind = 'error';
    $('error-banner').hidden = false;
  }
  function showNotice(msg) {
    $('error-message').textContent = msg;
    $('error-banner').dataset.kind = 'notice';
    $('error-banner').hidden = false;
  }

  function expandState(data) {
    if (data?.units?.some(u => u.hidden_from_heroes)) {
      data.units = data.units.filter(u => !u.hidden_from_heroes);
    }
    if (!Array.isArray(data?.action_defs) || !Array.isArray(data.actions)) return data;
    const names = new Map([...(data.units || []), ...(data.objects || [])].map(i => [i.id, i.name]));
    const actor = (data.units || []).find(u => u.id === data.turn_id);
    data.actions = data.actions.map(row => {
      const action = { ...(data.action_defs[row.d] || {}), id: row.id };
      for (const k of ['target_ids', 'x', 'y', 'hits', 'allies', 'path', 'cost', 'cover', 'aid_no_hp_targets']) if (row[k] !== undefined) action[k] = row[k];
      if (action.target_ids?.length) action.target_id = action.target_ids[0];
      if (row.area && data.areas?.[row.area]) action.cells = data.areas[row.area];
      const counts = new Map();
      for (const nm of (action.target_ids || []).map(id => names.get(id) || id)) counts.set(nm, (counts.get(nm) || 0) + 1);
      const tgt = [...counts].map(([nm, c]) => c > 1 ? `${nm} ×${c}` : nm).join(', ');
      if (action.kind === 'move') action.description = `Move to ${cellName(action.x, action.y)} (${action.cost || ''})`;
      else {
        let txt = action.label + (action.option ? ` (${niceName(action.option)})` : '');
        if (tgt) txt += ` → ${tgt}`;
        else if (action.square_attack && Number.isInteger(action.x) && Number.isInteger(action.y)) {
          txt += ` → ${cellName(action.x, action.y)} (Disadvantage — unseen target)`;
        } else if (Number.isInteger(action.x) && actor && action.cells) {
          txt += ['burning_hands', 'thunderwave'].includes(action.spell) || action.kind === 'dragons_breath_exhale'
            ? ` → ${compass(action.x - actor.x, action.y - actor.y)}` : ` → ${cellName(action.x, action.y)}`;
        }
        if (action.cover) {
          const covered = Object.entries(action.cover).map(([id, bonus]) => {
            const unit = data.units.find(u => u.id === id);
            return (unit?.name || id) + ' +' + bonus;
          });
          txt += ' · cover ' + covered.join(', ');
        }
        action.description = `${txt}${action.cost ? ' · ' + action.cost : ''}`;
      }
      return action;
    });
    delete data.action_defs;
    return data;
  }

  class ApiError extends Error {
    constructor(message, status, code) { super(message); this.status = status; this.code = code; }
  }

  async function api(endpoint, body) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    try {
      let res;
      try {
        res = await fetch(apiURL(endpoint), {
          redirect: 'error', method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store',
          headers: body === undefined ? { Accept: 'application/json' }
            : { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-Token': state?.csrf_token || '' },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          signal: controller.signal,
        });
      } catch (err) {
        throw new ApiError(err?.name === 'AbortError' ? 'The server took too long to answer.' : 'The server cannot be reached.', 0);
      }
      let data = null;
      try { data = await res.json(); } catch { data = null; }
      if (!res.ok || !data) {
        throw new ApiError(data?.error || `The server is unavailable (HTTP ${res.status}).`, res.status, data?.code);
      }
      return endpoint === 'encounters' ? data : expandState(data);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function acceptState(data, reset = false) {
    const prevTurn = state?.turn_id;
    state = data;
    choices = [];
    if (reset) {
      watching = false; paused = false; selectedGroup = null; activeCatFilter = 'all';
      setupFigure = null; inspectedId = null; lastLogIds = []; lastAutoRevision = null;
      focusCell = { x: 1, y: 1 };
    }
    if (reset || data.phase === 'setup') { variantMemory = new Map(); poolsSeen = new Map(); }
    // The game sends spell slots and uses only for the creature acting now; the sheet keeps the
    // last ones it saw for everyone else.
    if (data.turn_id && Array.isArray(data.resources?.pools)) poolsSeen.set(data.turn_id, { pools: data.resources.pools, round: Number(data.round) || 0 });
    armed = null; preview = null; allocation = new Map();
    if (prevTurn !== data.turn_id || reset || seenRevision === null) {
      selectedLevel = null; selectedOption = null; selectedVariant = null;
      selectedGroup = groupedActions().find(g => g.kind === 'move')?.key || null;
      const u = activeUnit();
      if (u) {
        focusCell = { x: u.x, y: u.y };
      }
    } else if (actions().some(a => a.ray_number > 1)) {
      selectedGroup = groupKey(actions()[0]);
      activeCatFilter = 'all';
    } else if (!groupedActions().some(g => g.key === selectedGroup)) {
      selectedGroup = null;
    }
    if (['finished', 'setup'].includes(data.phase)) { watching = false; clearTimer(); }
    seenRevision = data.revision;
    if (!themeManualOverride) selectedTheme = data.theme || 'auto';
  }

  function applyPoseOverlay(data, pose) {
    const uMap = new Map(pose.units.map(u => [u.id, u]));
    const oMap = new Map((pose.objects || []).map(o => [o.id, o]));
    state = {
      ...state, ...pose,
      objects: objects().map(o => ({ ...o, ...oMap.get(o.id) })),
      units: state.units.map(u => ({ ...u, ...uMap.get(u.id) })),
      actions: [],
      log: data.log.filter(e => e.id <= pose.log_id),
    };
    render();
  }

  // The camera director (scene3d.js), once per turn: centre on the creature whose turn it is,
  // then show the whole terrain. Also for the first turn after deployment, and for the turn
  // that is running when the start screen closes (the establishing shot).
  var directedTurn = '', framedViewer = null;   // var: render() may run before this line during start-up
  function cameraCues() {
    if (!state || startScreenOpen || !viewer || sceneUnavailable || ['setup', 'finished'].includes(state.phase)) return;
    const dock = $('combat-dock');
    const dockShown = !!dock && !dock.hidden && dock.offsetParent !== null;
    // The free area before the first replay (once the action deck is on screen).
    if (framedViewer !== viewer && dockShown) { framedViewer = viewer; viewer.setSafeArea?.(sceneSafeArea()); }
    if (playing) return;
    const u = activeUnit();
    const key = `${state.encounter_id}:${state.turn_id}:${state.round}`;
    if (!u || key === directedTurn) return;
    if (!followCamEnabled) { directedTurn = key; return; }
    if (dockShown) viewer.setSafeArea?.(sceneSafeArea());
    if (viewer.directTurn?.(u.id, { player: u.team === 'heroes' }) !== false) directedTurn = key;
  }

  // The part of the 3D view the HUD leaves uncovered (below the top bar, above the action
  // deck, right of the open left drawer on wide screens), for the camera's framing.
  function sceneSafeArea() {
    const vp = $('scene-viewport').getBoundingClientRect();
    const hud = document.querySelector('.hud-top')?.getBoundingClientRect();
    const dock = $('combat-dock');
    const dockTop = dock && !dock.hidden && dock.offsetParent !== null ? dock.getBoundingClientRect().top : vp.bottom;
    const drawer = $('left-drawer')?.getBoundingClientRect();
    const left = drawer && drawer.width > 40 && vp.width >= 1000 ? drawer.right + 8 : vp.left;
    return { top: (hud ? hud.bottom + 6 : vp.top) - vp.top, bottom: dockTop - 6 - vp.top, left: left - vp.left, right: vp.width };
  }

  const rosterById = data => new Map([...(state?.units || []), ...(data?.units || [])].map(u => [u.id, u]));

  // Sound (sound.js): the music follows the screen; a hero's turn gets a chime and, now and
  // then, a line.
  var soundTurnKey = '';   // var: render() may run before this line during start-up
  function soundCues() {
    const fx = window.FFSound;
    if (!fx) return;
    const phase = state?.phase;
    fx.scene(startScreenOpen || !state ? 'menu' : phase === 'setup' ? 'setup' : phase === 'finished' ? 'finished' : 'battle');
    if (!state || startScreenOpen || ['setup', 'finished'].includes(phase)) return;
    const unit = activeUnit();
    const key = `${state.encounter_id}:${state.round}:${unit?.id || ''}`;
    if (key === soundTurnKey) return;
    soundTurnKey = key;
    if (unit?.team === 'heroes' && unit.alive !== false) fx.heroTurn(unit);
  }

  async function presentState(data, reset = false, baseline = false) {
    const same = state?.encounter_id === data.encounter_id;
    if (!same && retiredEncounters.includes(data.encounter_id)) return;
    if (same && data.revision < state.revision) return;
    const records = Array.isArray(data.timeline) ? data.timeline : [];
    const newest = Math.max(Number(data.last_action_id) || 0, records.reduce((m, r) => Math.max(m, r.id), 0));
    const fresh = records.filter(r => r.id > lastActionId);
    const contiguous = fresh.length && fresh[0].id === lastActionId + 1 && fresh.every((r, i) => r.id === lastActionId + i + 1);
    const shouldReplay = same && !reset && !baseline && data.revision > state.revision
      && contiguous && fresh.length <= 32 && viewer?.playAction && !sceneUnavailable && !document.hidden;
    if (!same && state?.encounter_id) {
      retiredEncounters.push(state.encounter_id);
      if (retiredEncounters.length > 8) retiredEncounters.shift();
    }
    lastActionId = newest;
    noteTimeline(data);
    if (data.initiative_draws?.length && state?.phase === 'setup' && data.phase !== 'setup') {
      renderDiceDraws(data.initiative_draws, 'Initiative', true);
    }
    if (shouldReplay) {
      playing = true;
      viewer?.clearHoverPreview?.();
      $('cursor-tooltip').hidden = true;
      try {
        for (const rec of fresh) {
          applyPoseOverlay(data, rec.before);
          renderDiceDraws(rec.draws || [], `Round ${(Number(rec.before?.round) || 0) + 1} · ${recordLabel(rec)}`, true);
          // Overview and Action framing are handled by the scene's director during playback.
          if (followCamEnabled && activeCamPreset === 'heroic' && rec.source_id && viewer && !sceneUnavailable) viewer.focusUnit(rec.source_id, true);
          window.FFSound?.recordStart(rec);
          let sounded = false;
          const soundImpact = () => { if (!sounded) { sounded = true; window.FFSound?.recordImpact(rec, rosterById(data)); } };
          const cues = recordCues(rec, data.log, data.units);
          const ok = await viewer.playAction(cues.length ? { ...rec, effects: [...(rec.effects || []), ...cues] } : rec, {
            impact: () => { applyPoseOverlay(data, rec.after); soundImpact(); },
            step: (id, x, y) => {
              state = { ...state, units: state.units.map(u => u.id === id ? { ...u, x, y } : u) };
              renderBoard(true);
            },
          });
          if (!ok || document.hidden || sceneUnavailable) break;
          soundImpact();
          applyPoseOverlay(data, rec.after);
        }
      } finally {
        playing = false;
      }
    } else if (reset || baseline || !same) {
      viewer?.cancelPlayback?.();
    }
    acceptState(data, reset);
  }

  // One request at a time. A stale revision (409) or an expired game (410) shows a
  // notice and the server's current state; nothing is retried silently.
  async function request(endpoint, body, reset = false) {
    if (busy) return;
    clearTimer();
    busy = true;
    hadError = false;
    $('error-banner').hidden = true;
    render();
    const payload = body === undefined ? undefined : { ...body, ...(endpoint === 'new' ? {} : { revision: state?.revision }) };
    try {
      const data = await api(endpoint, payload);
      await presentState(data, reset, endpoint === 'state');
    } catch (err) {
      await recover(err);
    } finally {
      busy = false;
      render();
      schedule();
    }
  }

  async function recover(err) {
    paused = true; watching = false;
    if ([403, 409, 410].includes(err.status)) {
      const message = err.status === 410
        ? 'This game expired (an hour without play, or the server restarted). A new game was started.'
        : err.status === 409 ? 'The game had moved on; this is its current state.'
        : 'The session check failed; reloaded the game state.';
      try {
        const fresh = await api('state');
        await presentState(fresh, err.status === 410, true);
        if (err.status === 410) {
          startScreenOpen = true;
          const run = storyRun;
          storyRun = null;
          if (run) window.FFStory?.expired?.(run);
        }
        showNotice(message);
        paused = false;
        return;
      } catch (err2) {
        err = err2;
      }
    }
    hadError = true;
    showError(err.message || 'Something went wrong.');
  }

  function chooseGroup(key) {
    if (!canAct()) return;
    watching = false; clearTimer(); choices = [];
    const group = groupedActions().find(g => g.key === key);
    if (!group) return;
    if (selectedGroup === key) {
      // Clicking the selected Move card (or a Scorching Ray continuation) keeps it open; other cards toggle off.
      if (group.kind !== 'move' && !isRayContinuation()) { selectedGroup = null; armed = null; preview = null; }
      render();
      return;
    }
    selectedGroup = key; selectedLevel = null; selectedOption = null; selectedVariant = null;
    allocation = new Map(); armed = null; preview = null;
    const immediate = group.actions.filter(a => !hasTarget(a) && !hasPosition(a));
    const confirmFirst = immediate.some(a => NEEDS_CONFIRM.has(a.kind) || hasWarning(a));
    if (immediate.length === 1 && group.actions.length === 1 && !confirmFirst) {
      request('action', { action_id: immediate[0].id });
    } else {
      if (immediate.length) choices = immediate;
      render();
    }
  }

  function executeAction(id) {
    if (!canAct() || !actions().some(a => a.id === id)) return;
    armed = null; preview = null; allocation = new Map();
    viewer?.clearHoverPreview?.();
    request('action', { action_id: id });
  }

  function activateCell(x, y, unitId = null) {
    if (!state || busy) return;
    if (state.phase === 'setup') {
      if (setupFigure) {
        if (['#', 'T'].includes(state.map.tiles[y]?.[x]) || state.setup.placements.some(p => p.id !== setupFigure && p.x === x && p.y === y)) return;
        configure([...state.setup.placements.filter(p => p.id !== setupFigure), { id: setupFigure, x, y }]);
      } else {
        const u = unitId ? state.units.find(i => i.id === unitId) : state.units.find(i => i.x === x && i.y === y);
        if (u) { setupFigure = u.id; render(); }
      }
      return;
    }
    const cellUnits = (state.units || []).filter(u => atCell(u, x, y) && (u.alive !== false || u.team === 'heroes'));
    const unit = (unitId ? targets().find(u => u.id === unitId) : null)
      || cellUnits.find(u => u.alive !== false)
      || cellUnits[0]
      || targets().find(u => atCell(u, x, y) && u.alive !== false);
    const coLocated = cellUnits.filter(u => u.id !== unit?.id);
    if (unit) inspectedId = unit.id;
    const cur = currentActions();
    if (isSplit(cur)) {
      const total = Math.max(...cur.map(a => a.target_ids.length));
      const cap = id => Math.max(...cur.map(a => a.target_ids.filter(v => v === id).length));
      const splitTarget = (unit && cap(unit.id) > (allocation.get(unit.id) || 0))
        ? unit
        : coLocated.find(u => cap(u.id) > (allocation.get(u.id) || 0));
      if (splitTarget && allocationIds().length < total) {
        allocation.set(splitTarget.id, (allocation.get(splitTarget.id) || 0) + 1);
      }
      render();
      return;
    }
    const moves = cur.filter(a => a.kind === 'move' && targetsCell(a, x, y));
    if (moves.length) {
      const move = cheapestMove(moves);
      if (moveProvokers(move).length && armed?.id !== move.id) {
        armed = move; preview = null; render();
        $('target-options').scrollTop = 0;
        viewer?.setTacticalPreview?.({ hoverCell: { x: move.x, y: move.y, color: '#ff744d' }, pathCells: move.path || null, pathColor: '#ff744d', pathDotColor: '#ffc2ae' });
        return;
      }
      executeAction(move.id);
      return;
    }
    let matches = cur.filter(a => targetsCell(a, x, y) || (unit && targetsUnit(a, unit)));
    if (!matches.length && coLocated.length) {
      matches = cur.filter(a => coLocated.some(u => targetsUnit(a, u)));
    }
    if (matches.length === 1 && matches[0].cells) { armed = matches[0]; preview = null; render(); $('target-options').scrollTop = 0; return; }
    if (matches.length === 1) {
      const act = matches[0];
      if (needsConfirmAction(act) && armed?.id !== act.id) { armed = act; preview = null; render(); $('target-options').scrollTop = 0; return; }
      executeAction(act.id);
    } else { choices = matches.length > 1 ? matches : []; render(); }
  }

  // ===========================================================================
  // START SCREEN: opening difficulty choice and filtered encounter catalogue
  // ===========================================================================
  function leadOf(level) {
    const kinds = (level.roster || []).map(r => r.content);
    return LEAD_ORDER.find(k => kinds.includes(k)) || kinds[0] || 'skeleton';
  }
  function isLegacyGroup(group) {
    return LEGACY_ENCOUNTERS.has(group?.id) || Boolean(group?.private);  // private fights are never graded
  }
  function normalizeDifficulty(value) {
    const low = String(value || '').toLowerCase();
    if (low === 'classic') return 'Classic';
    const match = DIFFICULTIES.find(d => d.id.toLowerCase() === low);
    return match ? match.id : 'Medium';
  }
  function bucketFor(group, preset) {
    return isLegacyGroup(group) ? 'Classic' : normalizeDifficulty(preset?.difficulty);
  }
  function levelsForDifficulty(diff) {
    const target = normalizeDifficulty(diff);
    const out = [];
    for (const group of catalogue) {
      for (const preset of group.presets || []) {
        if (bucketFor(group, preset) === target) out.push({ group, preset });
      }
    }
    return out;
  }
  function difficultyLead(diff) {
    const info = DIFFICULTIES.find(d => d.id === diff) || DIFFICULTIES[0];
    return info.fallbackLead;
  }
  function heroLevelsOf(preset, override = null) {
    if (override) return [Number(override)];
    const explicit = Number(preset?.hero_level);
    if (explicit) return [explicit];
    const seen = [...new Set((preset?.party || []).map(h => Number(h.level)).filter(Boolean))].sort((a, b) => a - b);
    return seen;
  }
  function heroTierKeyOf(preset) {
    const levels = heroLevelsOf(preset);
    if (levels.length === 1) return String(levels[0]);
    return levels.length > 1 ? 'mixed' : '1';
  }
  function heroBadgeFor(preset, override = null) {
    const levels = heroLevelsOf(preset, override);
    if (!levels.length) return { label: 'Lv ?', cls: 'lv-mixed', isOverride: false };
    const isOverride = Boolean(override);
    if (levels.length === 1) {
      const lv = levels[0];
      return { label: `Lv ${lv}`, cls: `lv-${lv}`, isOverride };
    }
    return { label: `Lv ${levels[0]}–${levels[levels.length - 1]}`, cls: 'lv-mixed', isOverride };
  }
  function heroTierGroupsFor(list) {
    const order = [
      { key: '1', label: 'Level 1 Heroes', short: 'Lv 1', sub: 'Starting spellcasters & skirmishers' },
      { key: '2', label: 'Level 2 Heroes', short: 'Lv 2', sub: 'Action Surge, Channel Divinity & Metamagic' },
      { key: '3', label: 'Level 3 Heroes', short: 'Lv 3', sub: 'Subclasses, 2nd-level spells & heavier battles' },
      { key: 'mixed', label: 'Mixed-Level Parties', short: 'Mixed', sub: 'Combined hero levels' },
    ];
    const buckets = new Map(order.map(o => [o.key, { ...o, items: [] }]));
    for (const item of list) {
      const key = heroTierKeyOf(item.preset);
      const bucket = buckets.get(key) || buckets.get('mixed');
      bucket.items.push(item);
    }
    return order.map(o => buckets.get(o.key)).filter(b => b.items.length > 0);
  }
  function partyLabelHtml(party, { showPerHeroLevel = false } = {}) {
    const override = Number($('start-hero-level')?.value) || null;
    return (party || []).map(h => {
      const lv = override || Number(h.level) || null;
      return `${escape(h.name)}${showPerHeroLevel && lv ? ` <span class="party-lv-tag">Lv ${escape(lv)}</span>` : ''}`;
    }).join(', ');
  }
  function foesSummary(roster) {
    return (roster || []).map(r => {
      if (r.count <= 1) return `${r.count} ${r.name}`;
      const plural = /[^aeiou]y$/i.test(r.name) ? `${r.name.slice(0, -1)}ies`
        : /(s|x|z|ch|sh)$/i.test(r.name) ? `${r.name}es` : `${r.name}s`;
      return `${r.count} ${plural}`;
    }).join(' · ');
  }

  function buildStartScreenCatalog() {
    $('difficulty-grid').innerHTML = DIFFICULTIES.map(d => {
      const list = levelsForDifficulty(d.id);
      const count = list.length;
      const tiers = heroTierGroupsFor(list);
      const tierPills = tiers.map(t => `<span class="difficulty-lv-pill lv-${escape(t.key)}">${escape(t.short)} · ${escape(t.items.length)}</span>`).join('');
      const previewNames = list.slice(0, 3).map(item => item.preset.name).join(' · ');
      const more = count > 3 ? ` · +${count - 3} more` : '';
      const tier = d.id.toLowerCase();
      return `<button type="button" class="difficulty-card tier-${escape(tier)}" data-difficulty="${escape(d.id)}" ${count ? '' : 'disabled'}>
        <div class="difficulty-card-head"><span class="level-tier ${escape(tier)}">${escape(d.label)}</span><span class="difficulty-count">${escape(count)} ${count === 1 ? 'level' : 'levels'}</span></div>
        <div class="difficulty-card-body">${portrait({ team: 'monsters', content: difficultyLead(d.id) })}<div><h2 class="difficulty-card-title">${escape(d.label)}</h2><p class="difficulty-card-tagline">${escape(d.tagline)}</p></div></div>
        <p class="difficulty-card-desc">${escape(d.desc)}</p>
        ${tierPills ? `<div class="difficulty-level-pills">${tierPills}</div>` : ''}
        <p class="difficulty-card-preview">${escape(count ? previewNames + more : 'No levels available')}</p>
        <div class="difficulty-card-cta"><span>${count ? 'Browse levels' : 'Unavailable'}</span><span>→</span></div>
      </button>`;
    }).join('');

    const classicList = levelsForDifficulty('Classic');
    const banner = $('classic-banner');
    if (banner) {
      banner.hidden = !classicList.length;
      banner.innerHTML = classicList.length
        ? `<button type="button" class="classic-banner-btn" data-difficulty="Classic"><span class="classic-banner-left"><span class="level-tier classic">Classic · ungraded</span><span>${escape(classicList.length)} earlier fights (ungraded, outside the 36 agent-ranked levels)</span></span><span class="classic-banner-cta">Browse classic fights →</span></button>`
        : '';
    }

    const tabSpecs = [
      ...DIFFICULTIES,
      ...(classicList.length ? [{ id: 'Classic', label: 'Classic' }] : []),
    ];
    $('difficulty-tabs').innerHTML = tabSpecs.map(d => {
      const count = levelsForDifficulty(d.id).length;
      const tier = d.id.toLowerCase();
      return `<button type="button" class="difficulty-tab tier-${escape(tier)}" data-difficulty-tab="${escape(d.id)}" role="tab" aria-selected="false" ${count ? '' : 'disabled'}><span>${escape(d.label)}</span><span class="difficulty-tab-count">${escape(count)}</span></button>`;
    }).join('');

    const allItems = [];
    for (const group of catalogue) {
      for (const preset of group.presets || []) allItems.push({ group, preset });
    }
    const tierSections = heroTierGroupsFor(allItems);
    $('level-grid').innerHTML = tierSections.map(sec => `<section class="level-group" data-hero-tier="${escape(sec.key)}" aria-labelledby="tier-${escape(sec.key)}">
        <header class="level-group-head">
          <div class="level-group-title-wrap">
            <span class="level-hero-badge lv-${escape(sec.key)}">${escape(sec.short)}</span>
            <h2 id="tier-${escape(sec.key)}">${escape(sec.label)}</h2>
            <span class="level-group-count" data-tier-count="${escape(sec.key)}"></span>
          </div>
          <p>${escape(sec.sub)}</p>
        </header>
        <div class="level-row" role="listbox" aria-label="${escape(sec.label)}">
        ${sec.items.map(({ group, preset: lv }) => {
          const th = themeInfo(lv.theme);
          const on = selectedStart?.encounter === group.id && selectedStart?.preset === lv.id;
          const badge = heroBadgeFor(lv);
          const mapLabel = lv.map?.name ? `${lv.map.name} · ${lv.map.width}×${lv.map.height}` : `${lv.map.width}×${lv.map.height}`;
          const mixedParty = heroLevelsOf(lv).length > 1;
          const bucket = bucketFor(group, lv);
          const tierLabel = isLegacyGroup(group) ? 'Classic' : lv.difficulty;
          return `<button type="button" class="level-card ${on ? 'is-selected' : ''}" data-encounter="${escape(group.id)}" data-preset="${escape(lv.id)}" data-difficulty="${escape(bucket)}" data-hero-tier="${escape(sec.key)}" role="option" aria-selected="${on}">
            <div class="level-card-top">
              <div class="level-card-pills">
                <span class="level-tier ${escape(bucket.toLowerCase())}">${escape(tierLabel)}</span>
                <span class="level-hero-badge ${escape(badge.cls)}">${escape(badge.label)}</span>
                ${group.private ? '<span class="private-tag">private</span>' : ''}
              </div>
              <span class="level-map" title="${escape(mapLabel)}">${escape(mapLabel)}</span>
            </div>
            <div class="level-card-body">${portrait({ team: 'monsters', content: leadOf(lv) })}<div><h3 class="level-card-title">${escape(lv.name)}</h3><div class="level-card-foes">${escape(foesSummary(lv.roster))}</div></div></div>
            <p class="level-card-blurb">${escape(lv.blurb)}</p>
            <p class="level-card-party">Party: ${partyLabelHtml(lv.party, { showPerHeroLevel: mixedParty })}</p>
            <div class="level-theme-badge"><span class="level-theme-dot th-${escape(th.id)}"></span><span>${escape(th.label)}</span></div>
          </button>`;
        }).join('')}
        </div></section>`).join('');
    $('start-theme-swatches').innerHTML = [{ id: 'auto', label: 'Level default', desc: 'The theme the level comes with' }, ...THEME_SWATCHES]
      .map(th => `<button type="button" class="theme-swatch" data-theme-id="${escape(th.id)}" role="radio" aria-checked="false" title="${escape(th.label)} (${escape(th.desc)})"><span class="swatch-chip th-${escape(th.id)}"></span><span>${escape(th.label)}</span></button>`).join('');
    $('biome-select').innerHTML = `<option value="auto">Theme: level default</option>${THEME_SWATCHES.map(th => `<option value="${escape(th.id)}">Theme: ${escape(th.label)}</option>`).join('')}`;
    renderHelpEncounters();
  }

  function renderHeroLevelTabs() {
    const container = $('hero-level-tabs');
    if (!container) return;
    const list = levelsForDifficulty(selectedDifficulty);
    const tiers = heroTierGroupsFor(list);
    if (selectedHeroLevelFilter !== 'all' && !tiers.some(t => t.key === selectedHeroLevelFilter)) {
      selectedHeroLevelFilter = 'all';
    }
    if (tiers.length <= 1) {
      container.hidden = true;
      container.innerHTML = '';
      return;
    }
    container.hidden = false;
    const pills = [
      { key: 'all', label: 'All levels', count: list.length },
      ...tiers.map(t => ({ key: t.key, label: t.short, count: t.items.length })),
    ];
    container.innerHTML = pills.map(p => {
      const on = selectedHeroLevelFilter === p.key;
      return `<button type="button" class="hero-level-tab lv-${escape(p.key)} ${on ? 'is-active' : ''}" data-hero-filter="${escape(p.key)}" aria-pressed="${on}"><span>${escape(p.label)}</span><span class="difficulty-tab-count">${escape(p.count)}</span></button>`;
    }).join('');
  }

  function renderStartScreen() {
    soundCues();
    $('start-screen').hidden = !startScreenOpen;
    $('mode-step').hidden = startStep !== 'mode';
    $('back-mode-btn').hidden = startStep !== 'difficulty';
    $('difficulty-step').hidden = startStep !== 'difficulty';
    $('levels-step').hidden = startStep !== 'levels';
    $('back-difficulty-btn').hidden = startStep !== 'levels';
    $('close-start-btn').hidden = !state || !launched;
    const diffList = levelsForDifficulty(selectedDifficulty);
    $('start-screen-title').textContent = startStep === 'mode'
      ? 'How would you like to play?'
      : startStep === 'difficulty'
      ? 'Choose your difficulty'
      : selectedDifficulty === 'Classic'
        ? 'Classic fights (ungraded)'
        : `${selectedDifficulty} levels`;
    $('start-screen-subtitle').textContent = startStep === 'mode'
      ? 'Practice any graded fight on its own, or play a story: eight fights on a world map, told between the battles.'
      : startStep === 'difficulty'
      ? 'Pick a difficulty across 36 agent-graded fights — from quick skirmishes to levels none of our agents beat.'
      : selectedDifficulty === 'Unbeatable'
        ? `${diffList.length} ${diffList.length === 1 ? 'fight' : 'fights'} where no language-model player won and both game AIs won fewer than half of their 500 games. Pick one, then press Fight.`
        : selectedDifficulty === 'Classic'
          ? `${diffList.length} earlier fights (ungraded, outside the 36 agent-ranked levels). Pick a level, then press Fight.`
          : `${diffList.length} ${selectedDifficulty.toLowerCase()} ${diffList.length === 1 ? 'fight' : 'fights'} across hero levels. Pick a level, then press Fight — or Place the figures to arrange the board yourself.`;

    for (const card of $('difficulty-grid').querySelectorAll('[data-difficulty]')) {
      card.classList.toggle('is-active', card.dataset.difficulty === selectedDifficulty);
    }
    for (const tab of $('difficulty-tabs').querySelectorAll('[data-difficulty-tab]')) {
      const on = tab.dataset.difficultyTab === selectedDifficulty;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
    }
    renderHeroLevelTabs();

    const override = Number($('start-hero-level')?.value) || null;
    let firstVisible = null;
    let selectedIsVisible = false;
    for (const section of $('level-grid').querySelectorAll('.level-group')) {
      const tierMatch = selectedHeroLevelFilter === 'all' || section.dataset.heroTier === selectedHeroLevelFilter;
      let visibleCount = 0;
      for (const card of section.querySelectorAll('[data-preset]')) {
        const show = tierMatch && card.dataset.difficulty === selectedDifficulty;
        card.hidden = !show;
        if (show) {
          visibleCount++;
          if (!firstVisible) firstVisible = card;
        }
        const on = show && card.dataset.encounter === selectedStart?.encounter && card.dataset.preset === selectedStart?.preset;
        if (on) selectedIsVisible = true;
        card.classList.toggle('is-selected', on);
        card.setAttribute('aria-selected', String(on));
        const lv = levelByKey(card.dataset.encounter, card.dataset.preset);
        if (lv) {
          const badge = heroBadgeFor(lv.preset, override);
          const badgeEl = card.querySelector('.level-card-top .level-hero-badge');
          if (badgeEl) {
            badgeEl.textContent = badge.label;
            badgeEl.className = `level-hero-badge ${badge.cls}${badge.isOverride ? ' is-override' : ''}`;
          }
          const partyEl = card.querySelector('.level-card-party');
          if (partyEl) {
            const mixed = !override && heroLevelsOf(lv.preset).length > 1;
            partyEl.innerHTML = `Party: ${partyLabelHtml(lv.preset.party, { showPerHeroLevel: mixed })}`;
          }
        }
      }
      section.hidden = visibleCount === 0;
      const countEl = section.querySelector('[data-tier-count]');
      if (countEl) countEl.textContent = `${visibleCount} ${visibleCount === 1 ? 'level' : 'levels'}`;
    }
    if (!selectedIsVisible && firstVisible && startStep === 'levels') {
      selectedStart = { encounter: firstVisible.dataset.encounter, preset: firstVisible.dataset.preset };
      firstVisible.classList.add('is-selected');
      firstVisible.setAttribute('aria-selected', 'true');
      viewer?.setBiome?.(themeFor());
    }
    const shownTheme = themeManualOverride ? selectedTheme : 'auto';
    for (const sw of $('start-theme-swatches').querySelectorAll('[data-theme-id]')) {
      const on = sw.dataset.themeId === shownTheme;
      sw.classList.toggle('is-active', on);
      sw.setAttribute('aria-checked', String(on));
    }
    if ($('biome-select').value !== shownTheme) $('biome-select').value = shownTheme;
    const lv = selectedStart ? levelByKey(selectedStart.encounter, selectedStart.preset) : null;
    $('start-theme-note').textContent = themeManualOverride
      ? `Your choice: ${themeInfo(selectedTheme).label}.`
      : lv ? `${lv.preset.name} comes with ${themeInfo(lv.preset.theme).label}.` : 'Each level comes with a theme.';
    $('start-quick-play').disabled = busy || !lv;
    $('start-custom-place').disabled = busy || !lv;
  }

  function applyTheme(themeId, isManual = false) {
    themeManualOverride = Boolean(isManual) && themeId !== 'auto';
    selectedTheme = themeManualOverride ? themeId : (state?.theme || 'auto');
    viewer?.setBiome?.(themeFor());
    renderStartScreen();
  }

  function selectHeroLevelFilter(tierKey) {
    selectedHeroLevelFilter = tierKey || 'all';
    const current = selectedStart ? levelByKey(selectedStart.encounter, selectedStart.preset) : null;
    if (selectedHeroLevelFilter !== 'all' && (!current || heroTierKeyOf(current.preset) !== selectedHeroLevelFilter)) {
      const match = levelsForDifficulty(selectedDifficulty).find(item => heroTierKeyOf(item.preset) === selectedHeroLevelFilter);
      if (match) selectedStart = { encounter: match.group.id, preset: match.preset.id };
    }
    viewer?.setBiome?.(themeFor());
    renderStartScreen();
  }

  function selectDifficulty(diff, { openLevels = true } = {}) {
    const norm = normalizeDifficulty(diff);
    const list = levelsForDifficulty(norm);
    if (!list.length) return;
    selectedDifficulty = norm;
    const current = selectedStart ? levelByKey(selectedStart.encounter, selectedStart.preset) : null;
    const matchesTier = item => selectedHeroLevelFilter === 'all' || heroTierKeyOf(item.preset) === selectedHeroLevelFilter;
    if (!current || bucketFor(current.group, current.preset) !== norm || !matchesTier(current)) {
      const pick = list.find(matchesTier) || list[0];
      selectedStart = { encounter: pick.group.id, preset: pick.preset.id };
    }
    if (openLevels) startStep = 'levels';
    viewer?.setBiome?.(themeFor());
    renderStartScreen();
    if (openLevels) $('level-grid').querySelector('[data-preset].is-selected:not([hidden]), [data-preset]:not([hidden])')?.focus();
  }

  function showModeStep() {
    startStep = 'mode';
    renderStartScreen();
    $('mode-grid').querySelector('[data-mode]')?.focus();
  }

  function showDifficultyStep() {
    startStep = 'difficulty';
    renderStartScreen();
    $('difficulty-grid').querySelector('.is-active, [data-difficulty]')?.focus();
  }

  function selectStartLevel(encounter, preset) {
    const lv = levelByKey(encounter, preset);
    if (!lv) return;
    selectedStart = { encounter, preset };
    selectedDifficulty = bucketFor(lv.group, lv.preset);
    startStep = 'levels';
    viewer?.setBiome?.(themeFor());
    renderStartScreen();
  }

  function openStartScreen(step = 'difficulty') {
    clearTimer(); watching = false;
    const active = currentLevel();
    if (active) {
      selectedDifficulty = bucketFor(active.group, active.preset);
      selectedStart = { encounter: active.group.id, preset: active.preset.id };
    }
    startStep = step;
    startScreenOpen = true;
    viewer?.setBiome?.(themeFor());
    renderStartScreen();
    if (startStep === 'difficulty') $('difficulty-grid').querySelector('.is-active, [data-difficulty]')?.focus();
    else $('level-grid').querySelector('[data-preset].is-selected:not([hidden]), [data-preset]:not([hidden])')?.focus();
  }
  function closeStartScreen() {
    if (!startScreenOpen || !state) return;
    startScreenOpen = false;
    viewer?.setBiome?.(themeFor());   // back to the running game's theme
    renderStartScreen();
    cameraCues();
    schedule();
  }

  function castKeysFor(level) {
    const resolve = window.EmberScene?.resolveCastKey;
    if (typeof resolve !== 'function' || !level) return [];
    const units = [...level.party.map(h => ({ content: h.content, base_id: h.base_id, team: 'heroes' })), ...level.roster.map(r => ({ content: r.content, team: 'monsters' }))];
    return [...new Set(units.map(u => resolve(u)).filter(Boolean))];
  }

  // Practice launches read the start screen's options; a story passes its own (opts.story).
  async function launchSelectedLevel(quickFight = true, opts = {}) {
    const wanted = opts.story ? { encounter: opts.story.encounter, preset: opts.story.preset } : selectedStart;
    if (busy || !wanted) return false;
    const lv = levelByKey(wanted.encounter, wanted.preset);
    if (!lv) return false;
    const monsterControl = opts.story ? 'ai' : ($('start-monster-control').value || 'ai');
    let launchedOk = false;
    clearTimer(); watching = false; paused = false;
    viewer?.cancelPlayback?.(); viewer?.clearHoverPreview?.();
    $('cursor-tooltip').hidden = true;
    $('error-banner').hidden = true;
    lastLogIds = [];
    busy = true;
    renderStartScreen(); renderControls();
    // Only this encounter's figures are fetched (the rest stream in if ever needed).
    window.EmberScene?.prepareAssets?.({ keys: castKeysFor(lv.preset) })?.catch?.(() => {});
    try {
      if (!state) state = await api('state');
      const heroLevel = opts.story ? Number(opts.story.hero_level) || 0 : Number($('start-hero-level').value);
      const seed = opts.story && Number.isInteger(opts.story.seed) ? opts.story.seed : null;
      let fresh = await api('new', { encounter: lv.group.id, preset: lv.preset.id, ...(heroLevel && { hero_level: heroLevel }), ...(seed !== null && { seed }) });
      lastActionId = 0;
      if (quickFight) {
        fresh = await apiWith(fresh, 'setup', { placements: fresh.setup?.suggested_placements || [], monster_control: monsterControl });
        if (fresh.setup?.can_start) fresh = await apiWith(fresh, 'start', {});
      } else if (monsterControl !== fresh.setup?.monster_control) {
        fresh = await apiWith(fresh, 'setup', { placements: fresh.setup?.placements || [], monster_control: monsterControl });
      }
      startScreenOpen = false;
      launched = true;
      storyRun = opts.story ? { ...opts.story } : null;
      await presentState(fresh, true, false);
      viewer?.setBiome?.(themeFor());
      applyCameraPreset('tactical');
      launchedOk = true;
    } catch (err) {
      await recover(err);
    } finally {
      busy = false;
      render();
      schedule();
    }
    return launchedOk;
  }
  // A follow-up call in one launch sequence, with the CSRF token and revision of the state just returned.
  async function apiWith(previous, endpoint, body) {
    const saved = state;
    state = previous;
    try { return await api(endpoint, { ...body, revision: previous.revision }); }
    finally { state = saved; }
  }

  // --- How to play: the encounters part comes from the catalogue -----------------------
  function renderHelpEncounters() {
    $('help-encounters').innerHTML = catalogue.map(group => {
      const legacy = isLegacyGroup(group);
      const tag = p => legacy ? 'classic, ungraded' : p.difficulty.toLowerCase();
      return `<li><b>${escape(group.name)}.</b> ${escape(group.blurb)} Levels: ${group.presets.map(p => `${escape(p.name)} (${escape(tag(p))})`).join(', ')}.</li>`;
    }).join('');
  }

  // ===========================================================================
  // EVENTS
  // ===========================================================================
  $('difficulty-grid').addEventListener('click', e => {
    const card = e.target.closest('[data-difficulty]');
    if (card && !card.disabled) selectDifficulty(card.dataset.difficulty, { openLevels: true });
  });
  $('classic-banner')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-difficulty]');
    if (btn) selectDifficulty(btn.dataset.difficulty, { openLevels: true });
  });
  $('difficulty-grid').addEventListener('keydown', e => {
    const card = e.target.closest('[data-difficulty]');
    if (!card) return;
    const cards = [...$('difficulty-grid').querySelectorAll('[data-difficulty]:not(:disabled)')];
    const i = cards.indexOf(card);
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step && cards.length) { e.preventDefault(); cards[(i + step + cards.length) % cards.length].focus(); }
  });
  $('difficulty-tabs').addEventListener('click', e => {
    const tab = e.target.closest('[data-difficulty-tab]');
    if (tab && !tab.disabled) selectDifficulty(tab.dataset.difficultyTab, { openLevels: true });
  });
  $('hero-level-tabs').addEventListener('click', e => {
    const tab = e.target.closest('[data-hero-filter]');
    if (tab) selectHeroLevelFilter(tab.dataset.heroFilter);
  });
  $('back-difficulty-btn').addEventListener('click', () => showDifficultyStep());
  $('back-mode-btn').addEventListener('click', () => showModeStep());
  $('mode-grid').addEventListener('click', e => {
    if (e.target.closest('[data-mode="practice"]')) showDifficultyStep();
  });
  $('start-hero-level').addEventListener('change', () => renderStartScreen());
  $('level-grid').addEventListener('click', e => {
    const card = e.target.closest('[data-preset]');
    if (card) selectStartLevel(card.dataset.encounter, card.dataset.preset);
  });
  $('level-grid').addEventListener('dblclick', e => {
    const card = e.target.closest('[data-preset]');
    if (card) { selectStartLevel(card.dataset.encounter, card.dataset.preset); launchSelectedLevel(true); }
  });
  $('level-grid').addEventListener('keydown', e => {
    const card = e.target.closest('[data-preset]');
    if (!card) return;
    const cards = [...$('level-grid').querySelectorAll('[data-preset]:not([hidden])')];
    const i = cards.indexOf(card);
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step && cards.length) {
      e.preventDefault();
      const next = cards[(i + step + cards.length) % cards.length];
      next.focus();
      next.scrollIntoView({ block: 'nearest' });
      selectStartLevel(next.dataset.encounter, next.dataset.preset);
    } else if (e.key === 'Enter') { e.preventDefault(); selectStartLevel(card.dataset.encounter, card.dataset.preset); launchSelectedLevel(true); }
  });
  $('start-theme-swatches').addEventListener('click', e => {
    const sw = e.target.closest('[data-theme-id]');
    if (sw) applyTheme(sw.dataset.themeId, true);
  });
  $('start-quick-play').addEventListener('click', () => launchSelectedLevel(true));
  $('start-custom-place').addEventListener('click', () => launchSelectedLevel(false));
  $('open-levels-btn').addEventListener('click', () => {
    if (storyRun && window.FFStory?.showMap) window.FFStory.showMap(storyRun.story);
    else openStartScreen();
  });
  $('close-start-btn').addEventListener('click', () => closeStartScreen());
  $('result-levels-button').addEventListener('click', () => openStartScreen());

  document.querySelector('.cam-modes').addEventListener('click', e => {
    const btn = e.target.closest('[data-cam]');
    if (btn) applyCameraPreset(btn.dataset.cam);
  });
  $('orbit-left').addEventListener('click', () => viewer?.orbitBy?.(-Math.PI / 2, 380));
  $('orbit-right').addEventListener('click', () => viewer?.orbitBy?.(Math.PI / 2, 380));
  $('reset-view-button').addEventListener('click', () => { applyCameraPreset('tactical'); viewer?.resetCamera?.(true); });
  try { followCamEnabled = window.localStorage.getItem('ff-cam-follow') === 'on'; } catch { /* storage blocked */ }
  $('follow-cam-toggle').classList.toggle('is-on', followCamEnabled);
  $('follow-cam-toggle').setAttribute('aria-pressed', String(followCamEnabled));
  $('follow-cam-toggle').addEventListener('click', e => {
    followCamEnabled = !followCamEnabled;
    try { window.localStorage.setItem('ff-cam-follow', followCamEnabled ? 'on' : 'off'); } catch { /* storage blocked */ }
    e.currentTarget.classList.toggle('is-on', followCamEnabled);
    e.currentTarget.setAttribute('aria-pressed', String(followCamEnabled));
    viewer?.setAutoCamera?.(followCamEnabled);
    if (followCamEnabled && activeUnit()) viewer?.directTurn?.(activeUnit().id, { player: false });
  });
  // Zoom on action (camera director): ease in on movers and attacks, back out after. Remembered.
  try { actionZoom = window.localStorage.getItem('ff-cam-zoom') !== 'off'; } catch { /* storage blocked */ }
  function syncActionZoom() {
    const b = $('action-zoom-toggle');
    b.classList.toggle('is-on', actionZoom);
    b.setAttribute('aria-pressed', String(actionZoom));
    viewer?.setActionZoom?.(actionZoom);
  }
  $('action-zoom-toggle').addEventListener('click', () => {
    actionZoom = !actionZoom;
    try { window.localStorage.setItem('ff-cam-zoom', actionZoom ? 'on' : 'off'); } catch { /* storage blocked */ }
    syncActionZoom();
  });
  syncActionZoom();
  $('zoom-inspected-btn').addEventListener('click', () => {
    const id = inspectedId || activeUnit()?.id;
    if (id) applyCameraPreset('heroic', id);
  });
  $('view-toggle').addEventListener('click', e => {
    const open = !$('camera-pod').classList.contains('is-open');
    $('camera-pod').classList.toggle('is-open', open);
    e.currentTarget.setAttribute('aria-expanded', String(open));
  });

  $('biome-select').addEventListener('change', e => applyTheme(e.target.value, true));
  $('label-select').addEventListener('change', e => viewer?.setLabelMode?.(e.target.value));
  // Idle animation (figures breathe, torches flicker): off by default because it redraws
  // continuously; the visible button and the Settings checkbox share one remembered state.
  function setIdleAnimation(on, remember = true) {
    idleAnimationOn = on;
    $('idle-toggle').checked = on;
    $('anim-toggle').classList.toggle('is-on', on);
    $('anim-toggle').setAttribute('aria-pressed', String(on));
    viewer?.setIdleLoop?.(on);
    if (remember) {
      try { localStorage.setItem(IDLE_KEY, on ? 'on' : 'off'); } catch { /* private window */ }
    }
  }
  setIdleAnimation(idleAnimationOn, false);
  if (reducedMotion()) {
    $('anim-toggle').disabled = true;
    $('anim-toggle').title = 'Animation is off: your system asks for reduced motion';
  }
  $('idle-toggle').addEventListener('change', e => setIdleAnimation(e.target.checked));
  $('anim-toggle').addEventListener('click', () => setIdleAnimation(!idleAnimationOn));
  $('move-chips-toggle').addEventListener('change', () => render());
  $('shortcut-toggle').checked = shortcutsEnabled;
  $('shortcut-toggle').addEventListener('change', e => {
    shortcutsEnabled = e.target.checked;
    try { localStorage.setItem(SHORTCUT_KEY, shortcutsEnabled ? 'on' : 'off'); } catch { /* private window */ }
  });
  function setDrawer(side, open) {
    if (side === 'left') leftDrawerOpen = open; else rightDrawerOpen = open;
    const btn = $(`drawer-${side}-toggle`);
    btn.classList.toggle('is-on', open);
    btn.setAttribute('aria-pressed', String(open));
    $(`${side}-drawer`).classList.toggle('is-collapsed', !open);
    // On a phone only one drawer is open at a time.
    if (open && window.innerWidth <= 900) setDrawer(side === 'left' ? 'right' : 'left', false);
  }
  $('drawer-left-toggle').addEventListener('click', () => setDrawer('left', !leftDrawerOpen));
  $('drawer-right-toggle').addEventListener('click', () => setDrawer('right', !rightDrawerOpen));
  for (const btn of document.querySelectorAll('[data-close-drawer]')) btn.addEventListener('click', () => setDrawer(btn.dataset.closeDrawer, false));
  $('minimap-toggle').addEventListener('click', () => {
    if (sceneUnavailable) return;
    minimapVisible = !minimapVisible;
    renderBoardVisibility();
  });

  $('spin-dice-btn').addEventListener('click', () => diceArena.tumble());
  $('dice-canvas-wrap').addEventListener('click', () => diceArena.tumble());

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-inspect]');
    if (!b) return;
    inspectedId = b.dataset.inspect;
    renderRoster(); renderBoard();
    if (b.dataset.camFocus && viewer && !sceneUnavailable) viewer.focusUnit(b.dataset.camFocus, activeCamPreset === 'heroic');
  });
  document.addEventListener('dblclick', e => {
    const b = e.target.closest('[data-cam-focus]');
    if (b && b.dataset.camFocus && viewer && !sceneUnavailable) applyCameraPreset('heroic', b.dataset.camFocus);
  });

  $('setup-roster').addEventListener('click', e => {
    const rm = e.target.closest('[data-remove]'), fig = e.target.closest('[data-figure]');
    if (rm && !rm.disabled) configure(state.setup.placements.filter(p => p.id !== rm.dataset.remove));
    else if (fig && !fig.disabled) { setupFigure = fig.dataset.figure; render(); }
  });
  $('setup-preset').addEventListener('change', e => {
    if (state?.phase === 'setup' && !busy && state.level) {
      setupFigure = null;
      selectedStart = { encounter: state.level.encounter, preset: e.target.value };
      request('new', { encounter: state.level.encounter, preset: e.target.value }, true);
    }
  });
  $('setup-suggested').addEventListener('click', () => {
    if (state?.phase === 'setup') { setupFigure = null; configure(suggestedPlacements()); }
  });
  $('setup-monster-control').addEventListener('change', e => configure(state.setup.placements, e.target.value));
  $('start-button').addEventListener('click', () => {
    if (state?.phase === 'setup' && state.setup.can_start && !busy) { setupFigure = null; request('start', {}); }
  });

  $('cat-tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-cat-filter]');
    if (b) { activeCatFilter = b.dataset.catFilter; renderActions(); }
  });
  $('action-bar').addEventListener('click', e => {
    const b = e.target.closest('[data-group]');
    if (b && !b.disabled) chooseGroup(b.dataset.group);
  });
  $('action-bar').addEventListener('scroll', () => updateStripCues(), { passive: true });
  $('action-bar').addEventListener('wheel', e => {
    // A mouse wheel scrolls the card strip sideways when it overflows.
    const bar = $('action-bar');
    if (bar.scrollWidth <= bar.clientWidth + 2 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    bar.scrollLeft += e.deltaY;
  }, { passive: false });
  $('action-strip-left').addEventListener('click', () => scrollStrip(-1));
  $('action-strip-right').addEventListener('click', () => scrollStrip(1));
  $('action-bar').addEventListener('pointerover', e => {
    const card = e.pointerType === 'mouse' && e.target.closest('.ability-card');
    if (card && card.dataset.group !== hoverKey) { hoverKey = card.dataset.group; renderAbilityInfo(); }
  });
  $('action-bar').addEventListener('pointerleave', e => {
    if (e.pointerType === 'mouse' && hoverKey) { hoverKey = null; renderAbilityInfo(); }
  });
  $('action-bar').addEventListener('focusin', e => {
    const card = e.target.closest('.ability-card');
    if (card && card.matches(':focus-visible')) { focusKey = card.dataset.group; renderAbilityInfo(); }
  });
  $('action-bar').addEventListener('focusout', e => {
    if (focusKey && !$('action-bar').contains(e.relatedTarget)) { focusKey = null; renderAbilityInfo(); }
  });
  $('ability-info-toggle').addEventListener('click', () => { infoOpen = !infoOpen; render(); });
  document.addEventListener('click', e => {
    const open = e.target.closest('[data-sheet]'), pick = e.target.closest('[data-sheet-unit]');
    if (open) openSheet(open.dataset.sheet);
    else if (pick) { sheetUnitId = pick.dataset.sheetUnit; renderSheet(); }
  });
  $('close-sheet').addEventListener('click', () => typeof $('sheet-dialog').close === 'function' ? $('sheet-dialog').close() : $('sheet-dialog').removeAttribute('open'));
  $('sheet-dialog').addEventListener('click', e => {
    const d = $('sheet-dialog');
    if (e.target !== d) return;
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  });
  $('chooser-back').addEventListener('click', () => {
    if (!isRayContinuation()) selectedGroup = null;
    choices = []; armed = null; preview = null;
    viewer?.clearHoverPreview?.();
    render();
  });
  $('action-options').addEventListener('click', e => {
    const lv = e.target.closest('[data-level]'), op = e.target.closest('[data-option]'), vr = e.target.closest('[data-variant]');
    const inc = e.target.closest('[data-alloc-inc]'), dec = e.target.closest('[data-alloc-dec]'), cf = e.target.closest('[data-alloc-confirm]');
    if (vr) {
      selectedVariant = vr.dataset.variant; variantMemory.set(selectedGroup, selectedVariant);
      allocation = new Map(); armed = null; preview = null; viewer?.clearHoverPreview?.(); render();
    } else if (lv) { selectedLevel = lv.dataset.level; allocation = new Map(); armed = null; render(); }
    else if (op) { selectedOption = op.dataset.option; allocation = new Map(); armed = null; render(); }
    else if (inc && !inc.disabled) { allocation.set(inc.dataset.allocInc, (allocation.get(inc.dataset.allocInc) || 0) + 1); render(); }
    else if (dec && !dec.disabled) {
      const id = dec.dataset.allocDec, n = (allocation.get(id) || 0) - 1;
      if (n > 0) allocation.set(id, n); else allocation.delete(id);
      render();
    } else if (cf && !cf.disabled) {
      const m = allocationMatch(currentActions());
      if (m) executeAction(m.id);
    }
  });

  const chipAction = e => {
    const chip = e.target.closest?.('[data-action]');
    return chip ? actions().find(a => a.id === chip.dataset.action) : null;
  };
  function previewChipTarget(act) {
    preview = act?.cells ? act : null;
    const actor = activeUnit();
    if (act && actor && viewer && !sceneUnavailable) {
      if (act.kind === 'move') {
        const provokes = moveProvokers(act).length > 0;
        viewer.setTacticalPreview({
          hoverCell: { x: act.x, y: act.y, color: provokes ? '#ff744d' : '#5be2ca' },
          pathCells: act.path || null,
          pathColor: provokes ? '#ff744d' : '#6af7df',
          pathDotColor: provokes ? '#ffc2ae' : '#a8fff0',
        });
      } else {
        const t = targets().find(u => u.id === act.target_id);
        const tx = t?.x ?? act.x, ty = t?.y ?? act.y;
        if (Number.isInteger(tx) && Number.isInteger(ty)) {
          const warn = hasWarning(act);
          const color = warn ? '#ff6454' : (act.kind === 'spell' ? '#c29eff' : '#ff8c6e');
          viewer.setTacticalPreview({
            hoverCell: { x: tx, y: ty, color: warn ? '#ff6454' : '#ffd478' },
            arcFrom: { x: actor.x, y: actor.y },
            arcTo: { x: tx, y: ty },
            arcColor: color,
            areaCells: act.cells?.length ? act.cells : null,
            areaColor: act.allies?.length ? '#ff4a38' : '#ff7a3d',
          });
        }
      }
    } else {
      viewer?.clearHoverPreview?.();
    }
    renderBoard();
  }
  $('target-options').addEventListener('mouseover', e => previewChipTarget(chipAction(e)));
  $('target-options').addEventListener('focusin', e => previewChipTarget(chipAction(e)));
  $('target-options').addEventListener('mouseleave', () => previewChipTarget(null));
  $('target-options').addEventListener('focusout', () => previewChipTarget(null));
  $('target-options').addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (!b || b.disabled) return;
    const act = actions().find(a => a.id === b.dataset.action);
    if (!act) return;
    if (!b.classList.contains('confirm') && hasWarning(act) && armed?.id !== act.id) {
      armed = act; preview = null; render();
      $('target-options').scrollTop = 0;
      if (act.kind === 'move') {
        viewer?.setTacticalPreview?.({ hoverCell: { x: act.x, y: act.y, color: '#ff744d' }, pathCells: act.path || null, pathColor: '#ff744d', pathDotColor: '#ffc2ae' });
      }
      return;
    }
    executeAction(act.id);
  });

  $('battlefield').addEventListener('click', e => {
    if (!state) return;
    const tok = e.target.closest('[data-unit]');
    if (tok) {
      const u = state.units.find(i => i.id === tok.dataset.unit);
      if (u) activateCell(u.x, u.y, u.id);
      return;
    }
    const tile = e.target.closest('[data-x]');
    if (tile) {
      focusCell = { x: Number(tile.dataset.x), y: Number(tile.dataset.y) };
      activateCell(focusCell.x, focusCell.y);
    }
  });
  $('battlefield').addEventListener('keydown', e => {
    if (!state) return;
    const tile = e.target.closest('[data-x]');
    if (!tile) return;
    const x = Number(tile.dataset.x), y = Number(tile.dataset.y);
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateCell(x, y); return; }
    const offs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!offs[e.key]) return;
    e.preventDefault();
    const [dx, dy] = offs[e.key];
    let nx = x + dx, ny = y + dy;
    while (nx >= 0 && ny >= 0 && nx < state.map.width && ny < state.map.height) {
      if (state.map.tiles[ny]?.[nx] !== '#') {
        tile.setAttribute('tabindex', '-1'); focusCell = { x: nx, y: ny };
        const next = $('battlefield').querySelector(`[data-x="${nx}"][data-y="${ny}"]`);
        next?.setAttribute('tabindex', '0'); next?.focus(); return;
      }
      nx += dx; ny += dy;
    }
  });

  $('end-button').addEventListener('click', () => { if (canAct()) request('end-turn', {}); });
  const newEncounter = () => {
    if (busy || !state?.level) return;
    watching = false; paused = true; clearTimer(); selectedGroup = null; choices = []; inspectedId = null;
    request('new', { encounter: state.level.encounter, preset: state.level.id, ...(state.level.hero_level && { hero_level: state.level.hero_level }) }, true);
  };
  $('new-button').addEventListener('click', newEncounter);
  $('again-button').addEventListener('click', newEncounter);
  $('watch-button').addEventListener('click', () => {
    if (!state || busy || ['finished', 'setup'].includes(state.phase)) return;
    watching = !watching;
    if (watching) { paused = false; hadError = false; lastAutoRevision = null; selectedGroup = null; choices = []; $('error-banner').hidden = true; }
    else paused = true;
    render(); schedule();
  });
  $('pause-button').addEventListener('click', () => {
    paused = !paused;
    if (!paused) { hadError = false; lastAutoRevision = null; $('error-banner').hidden = true; }
    render(); schedule();
  });
  $('step-button').addEventListener('click', () => {
    if (!state || busy || state.phase === 'setup') return;
    paused = true; clearTimer(); lastAutoRevision = null;
    request('advance', { autoplay: watching });
  });
  $('retry-button').addEventListener('click', () => { $('error-banner').hidden = true; request('state'); });
  $('dismiss-error').addEventListener('click', () => { $('error-banner').hidden = true; });
  $('latest-button').addEventListener('click', () => { $('combat-log').scrollTop = $('combat-log').scrollHeight; $('latest-button').hidden = true; });

  const help = $('help-dialog');
  $('help-button').addEventListener('click', () => typeof help.showModal === 'function' ? help.showModal() : help.setAttribute('open', ''));
  $('close-help').addEventListener('click', () => typeof help.close === 'function' ? help.close() : help.removeAttribute('open'));
  help.addEventListener('click', e => {
    if (e.target !== help) return;
    const r = help.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) help.close();
  });

  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || help.open || $('sheet-dialog').open) return;
    if (window.FFStory?.isOpen?.()) return;  // the story layer handles its own keys
    if (startScreenOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (startStep === 'levels' && (!state || !launched)) showDifficultyStep();
        else if (startStep === 'difficulty' && (!state || !launched)) showModeStep();
        else if (state && launched) closeStartScreen();
      }
      return;  // no game shortcuts behind the start screen
    }
    if (e.key === 'Escape') {
      if (!isRayContinuation()) selectedGroup = null;
      setupFigure = null; choices = []; armed = null; preview = null;
      viewer?.clearHoverPreview?.();
      render();
      return;
    }
    if (!shortcutsEnabled) return;
    if (/^[1-9]$/.test(e.key)) {
      const card = $('action-bar').querySelectorAll('.ability-card')[Number(e.key) - 1];
      if (card?.dataset.group && !card.disabled) { e.preventDefault(); chooseGroup(card.dataset.group); }
      return;
    }
    const key = e.key.toLowerCase();
    const bindings = {
      q: () => viewer?.orbitBy?.(-Math.PI / 2, 380), e: () => viewer?.orbitBy?.(Math.PI / 2, 380),
      v: () => applyCameraPreset('tactical'), c: () => applyCameraPreset('heroic'),
      x: () => applyCameraPreset('skirmish'), z: () => $('action-zoom-toggle').click(),
      r: () => $('reset-view-button').click(), f: () => $('follow-cam-toggle').click(), m: () => $('minimap-toggle').click(),
    };
    if (bindings[key]) { e.preventDefault(); bindings[key](); }
  });

  window.addEventListener('resize', () => { try { viewer?.resize?.(); } catch { sceneFailed('3D rendering interrupted'); } diceArena.redraw(); updateStripCues(); });
  window.addEventListener('pagehide', e => {
    paused = true; clearTimer(); viewer?.cancelPlayback?.();
    if (!e.persisted) { startupClosed = true; window.clearTimeout(recoveryTimer); disposeViewer(); window.EmberScene?.disposeAssets?.(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { paused = true; clearTimer(); viewer?.cancelPlayback?.(); }
  });

  // A test hook (Playwright): read-only views of the page state.
  window.__ff = {
    getState: () => state,
    getViewer: () => viewer,
    getActions: () => actions(),
    activateCell: (x, y) => activateCell(x, y),
    isSceneUnavailable: () => sceneUnavailable,
    isStartScreenOpen: () => startScreenOpen,
    getStartStep: () => startStep,
    getDifficulty: () => selectedDifficulty,
    getCatalogue: () => catalogue,
    selectDifficulty,
    showDifficultyStep,
    showModeStep,
    selectStartLevel,
    launchSelectedLevel,
    getStoryRun: () => storyRun,
  };

  // The story shell's view of the game (story.js; docs/STORY_MODE.md).
  window.FFGame = {
    ready: () => catalogue.length > 0,
    level: (encounter, preset) => levelByKey(encounter, preset)?.preset || null,
    launchStory: run => launchSelectedLevel(true, { story: run }),
    retryStory: () => {
      if (!storyRun || busy) return false;
      return launchSelectedLevel(true, { story: storyRun });
    },
    storyRun: () => (storyRun ? { ...storyRun } : null),
    battle: () => (state && launched && storyRun ? { ...storyRun, phase: state.phase,
      outcome: state.phase === 'finished' ? (state.winner === 'heroes' ? 'win' : state.winner === 'monsters' ? 'loss' : 'draw') : null } : null),
    isBusy: () => busy,
    openStartScreen: (step = 'mode') => { if (step === 'mode') { clearTimer(); watching = false; startStep = 'mode'; startScreenOpen = true; renderStartScreen(); } else openStartScreen(step); },
    closeStartScreen: () => closeStartScreen(),
  };

  setDrawer('left', leftDrawerOpen);
  renderStartScreen();

  Promise.resolve().then(async () => {
    try {
      const data = await api('encounters');
      catalogue = Array.isArray(data.encounters) ? data.encounters : [];
    } catch (err) {
      showError(`The level list could not be loaded: ${err.message}`);
    }
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get('level')?.split('/') || [];
    const wantedLevel = levelByKey(wanted[0], wanted[1]);
    const wantedDiff = params.get('difficulty');
    if (wantedLevel) {
      selectedStart = { encounter: wantedLevel.group.id, preset: wantedLevel.preset.id };
      selectedDifficulty = bucketFor(wantedLevel.group, wantedLevel.preset);
      startStep = 'levels';
    } else if (wantedDiff && levelsForDifficulty(wantedDiff).length) {
      selectedDifficulty = normalizeDifficulty(wantedDiff);
      const firstInDiff = levelsForDifficulty(selectedDifficulty)[0];
      selectedStart = { encounter: firstInDiff.group.id, preset: firstInDiff.preset.id };
      startStep = 'levels';
    } else {
      const firstDiff = DIFFICULTIES.find(d => levelsForDifficulty(d.id).length)?.id || 'Easy';
      selectedDifficulty = firstDiff;
      const firstInDiff = levelsForDifficulty(firstDiff)[0];
      const fallback = catalogue[0]?.presets[0];
      selectedStart = firstInDiff ? { encounter: firstInDiff.group.id, preset: firstInDiff.preset.id }
        : fallback ? { encounter: catalogue[0].id, preset: fallback.id } : null;
      if (startStep !== 'difficulty' && startStep !== 'levels') startStep = 'mode';
    }
    buildStartScreenCatalog();
    renderStartScreen();
    const probe = document.createElement('canvas').getContext('webgl2');
    if (!probe) {
      sceneFailed('WebGL 2 is unavailable', { recoverable: false });
    } else {
      probe.getExtension('WEBGL_lose_context')?.loseContext();
    }
    assetsReady = true;
    diceArena.redraw();
    if (!startupClosed) await request('state');
    // A returning player (cookie) with a game in progress can go back to it.
    if (state && state.phase !== 'setup') launched = true;
    render();
  });
})();
