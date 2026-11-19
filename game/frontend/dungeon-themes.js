import * as THREE from 'three';

/**
 * 7 Distinct Dark-Fantasy PBR Architectural Themes for Ember Crucible.
 *
 * Each theme generates genuinely different 512x512 Floor & Wall textures
 * with Albedo (map), Height Relief (bumpMap), Specular Roughness (roughnessMap),
 * and optional Emissive cracks/runes (emissiveMap), departing from flat cartoon colors
 * into weathered, grounded dark-fantasy stone, moss, marble, frost-slate & basalt.
 */

export const THEME_CATALOG = Object.freeze([
  { id: 'ossuary',     label: 'Ancient Ossuary',      preset: 'bone_patrol',    moteColor: '#d9d2be' },
  { id: 'catacombs',   label: 'Mossy Ruin Court',     preset: 'ghoul_pack',     moteColor: '#a8d48a' },
  { id: 'caverns',     label: 'Frosted Soul Caverns', preset: 'haunting',       moteColor: '#7be8f2' },
  { id: 'reliquary',   label: 'Gothic Reliquary',     preset: 'wights_retinue', moteColor: '#d8c49e' },
  { id: 'sanctum',     label: 'Obsidian Sanctum',     preset: 'two_wights',     moteColor: '#b98cff' },
  { id: 'crucible',    label: 'Infernal Crucible',    preset: 'whole_crypt',    moteColor: '#ff8538' },
  { id: 'forged_hall', label: 'Dwarven Forged Hall',  preset: 'vault',          moteColor: '#f2be6b' },
  { id: 'mausoleum',       label: 'Gothic Mausoleum',  preset: null, moteColor: '#c48fff' },
  { id: 'mausoleum_crypt', label: 'Violet Ossuary',    preset: null, moteColor: '#c9a6ff' },
  { id: 'mausoleum_caves', label: 'Violet Caverns',    preset: null, moteColor: '#b98cff' },
]);

export const PRESET_DEFAULT_THEME = Object.freeze({
  bone_patrol:    'ossuary',
  ghoul_pack:     'catacombs',
  haunting:       'caverns',
  wights_retinue: 'reliquary',
  two_wights:     'sanctum',
  whole_crypt:    'crucible',
  vault:          'forged_hall',
});

// Backwards-compatible aliases for trace map families ('vault', 'caves', 'pillars', 'rooms', 'open')
const LEGACY_MAP = {
  vault: 'forged_hall',
  caves: 'caverns',
  pillars: 'reliquary',
  rooms: 'ossuary',
  open: 'crucible',
};

export const THEMES = {
  ossuary: {
    id: 'ossuary',
    bg: '#090d10', fog: '#090d10',
    slab: '#14181b', rim: '#786240', frame: '#1e2428',
    wallCap: '#565852', wallJoint: '#202321', pillarBody: '#62645c', pillarTrim: '#42453f',
    hemiSky: '#b8c4cf', hemiGround: '#343638', keyColor: '#ffd9a0', fillColor: '#5c7c99',
    torchColor: '#ff9c42', crystalColor: null, moteColor: '#ded6c1',
    floorRoughness: 0.88, floorMetalness: 0.04, bumpScale: 0.045,
  },
  catacombs: {
    id: 'catacombs',
    bg: '#080e0c', fog: '#080e0c',
    slab: '#111916', rim: '#526348', frame: '#1a2621',
    wallCap: '#455046', wallJoint: '#19221b', pillarBody: '#4d584d', pillarTrim: '#333d34',
    hemiSky: '#a8ccb8', hemiGround: '#29332b', keyColor: '#ffd296', fillColor: '#4c8577',
    torchColor: '#ff9638', crystalColor: null, moteColor: '#a8d98c',
    floorRoughness: 0.72, floorMetalness: 0.06, bumpScale: 0.055,
  },
  caverns: {
    id: 'caverns',
    bg: '#070e14', fog: '#070e14',
    slab: '#0f1a22', rim: '#486e78', frame: '#172630',
    wallCap: '#445863', wallJoint: '#18252e', pillarBody: '#495d69', pillarTrim: '#2f404a',
    hemiSky: '#a6dce8', hemiGround: '#273842', keyColor: '#cbe6ff', fillColor: '#3ec8d8',
    torchColor: '#6be4ff', crystalColor: '#56f0ff', moteColor: '#82f0ff',
    floorRoughness: 0.64, floorMetalness: 0.10, bumpScale: 0.052,
  },
  reliquary: {
    id: 'reliquary',
    bg: '#090b11', fog: '#090b11',
    slab: '#131620', rim: '#8f7244', frame: '#1d212e',
    wallCap: '#4d5261', wallJoint: '#1b1e29', pillarBody: '#555a6b', pillarTrim: '#7d653e',
    hemiSky: '#c6cee6', hemiGround: '#2f3240', keyColor: '#ffddab', fillColor: '#6682b8',
    torchColor: '#ffa247', crystalColor: null, moteColor: '#e6d2ab',
    floorRoughness: 0.44, floorMetalness: 0.16, bumpScale: 0.032,
  },
  sanctum: {
    id: 'sanctum',
    bg: '#090710', fog: '#090710',
    slab: '#13101d', rim: '#6f528f', frame: '#1d182b',
    wallCap: '#3e384f', wallJoint: '#161221', pillarBody: '#383347', pillarTrim: '#6c4f8c',
    hemiSky: '#cbb8eb', hemiGround: '#282136', keyColor: '#f5d0ff', fillColor: '#7e5ce0',
    torchColor: '#bf75ff', crystalColor: '#b366ff', moteColor: '#c48fff',
    floorRoughness: 0.48, floorMetalness: 0.20, bumpScale: 0.042,
    emissive: '#8f4dff', emissiveIntensity: 0.55,
  },
  crucible: {
    id: 'crucible',
    bg: '#0f0807', fog: '#0f0807',
    slab: '#1a1110', rim: '#99522c', frame: '#261816',
    wallCap: '#473936', wallJoint: '#1c1210', pillarBody: '#423533', pillarTrim: '#7d4427',
    hemiSky: '#e8c2ad', hemiGround: '#38231e', keyColor: '#ffbe7d', fillColor: '#bd4e2b',
    torchColor: '#ff6e24', crystalColor: '#ff5e1f', moteColor: '#ff8a3d',
    floorRoughness: 0.78, floorMetalness: 0.12, bumpScale: 0.055,
    emissive: '#ff5917', emissiveIntensity: 0.85,
  },
  forged_hall: {
    id: 'forged_hall',
    bg: '#0b0e10', fog: '#0b0e10',
    slab: '#161b1e', rim: '#8a693d', frame: '#22292d',
    wallCap: '#5c615d', wallJoint: '#222726', pillarBody: '#636964', pillarTrim: '#7d623b',
    hemiSky: '#d4cfc2', hemiGround: '#383834', keyColor: '#ffd89e', fillColor: '#5b8a96',
    torchColor: '#ff963b', crystalColor: null, moteColor: '#f0c475',
    floorRoughness: 0.80, floorMetalness: 0.08, bumpScale: 0.046,
  },
};

// The mausoleum themes: Gothic Reliquary architecture (ossuary and cavern
// variants for the crypts and catacombs) under Obsidian Sanctum's violet light.
const VIOLET_FLAME = Object.freeze({ ember: '#8c3dff', outer: '#c782ff', core: '#f6e6ff' });
THEMES.mausoleum = {
  ...THEMES.reliquary, id: 'mausoleum', base: 'reliquary',
  bg: '#0a0710', fog: '#0a0710', slab: '#14101c', rim: '#6f528f', frame: '#1d182b',
  hemiSky: '#cbb8eb', hemiGround: '#282136', keyColor: '#f0dcff', fillColor: '#7e5ce0',
  torchColor: '#bf75ff', moteColor: '#c48fff', flame: VIOLET_FLAME,
  veinColor: 'rgba(196, 150, 255, 0.22)', inlay: '#6c5a8c',
  textures: {
    floor: { albedo: 'textures/mausoleum/floor_albedo.webp', normal: 'textures/mausoleum/floor_normal.webp', orm: 'textures/mausoleum/floor_orm.webp' },
    floorAlt: { albedo: 'textures/mausoleum/floor_slab_albedo.webp', normal: 'textures/mausoleum/floor_slab_normal.webp', orm: 'textures/mausoleum/floor_slab_orm.webp' },
    wall: { albedo: 'textures/mausoleum/wall_albedo.webp', normal: 'textures/mausoleum/wall_normal.webp', orm: 'textures/mausoleum/wall_orm.webp' },
    window: 'textures/mausoleum/window_albedo.webp',
  },
};
THEMES.mausoleum_crypt = {
  ...THEMES.ossuary, id: 'mausoleum_crypt', base: 'ossuary',
  bg: '#0a080e', fog: '#0a080e', rim: '#6a5a7e',
  hemiSky: '#c4b8dc', hemiGround: '#2c2834', fillColor: '#6e58b8',
  torchColor: '#b56dff', moteColor: '#c9a6ff', flame: VIOLET_FLAME,
};
THEMES.mausoleum_caves = {
  ...THEMES.caverns, id: 'mausoleum_caves', base: 'caverns',
  bg: '#0a0712', fog: '#0a0712', slab: '#140f1e', rim: '#5e4a7a', frame: '#1b1528',
  wallCap: '#4a4258', wallJoint: '#1a1524', pillarBody: '#4d4560', pillarTrim: '#342c44',
  hemiSky: '#c7b6e8', hemiGround: '#2a2238', keyColor: '#e4d2ff', fillColor: '#8a5ee0',
  torchColor: '#b870ff', crystalColor: '#b366ff', moteColor: '#b98cff', flame: VIOLET_FLAME,
  veinColor: 'rgba(196, 150, 255, 0.45)',
};

export function resolveTheme(map, explicitKey) {
  if (explicitKey && explicitKey !== 'auto') {
    const mapped = LEGACY_MAP[explicitKey] || explicitKey;
    if (THEMES[mapped]) return THEMES[mapped];
  }
  if (map?.theme && THEMES[map.theme]) return THEMES[map.theme];  // the encounter's own theme
  const hint = String(map?.family || map?.name || '').toLowerCase();
  if (hint.includes('cave')) return THEMES.caverns;
  if (hint.includes('pillar') || hint.includes('hall')) return THEMES.reliquary;
  if (hint.includes('room')) return THEMES.ossuary;
  if (hint.includes('open')) return THEMES.crucible;
  return THEMES.forged_hall;
}

// Deterministic pseudo-random hash in [0, 1)
function h2(x, y, seed = 1) {
  let n = Math.imul(x * 374761393 + y * 668265263 + seed * 1442695041, 1274126177);
  n = (n ^ (n >>> 13)) >>> 0;
  return (n % 10000) / 10000;
}

function makeTex(renderer, textures, size, isSRGB, drawFn) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  drawFn(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (isSRGB) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  textures.add(t);
  return t;
}

function addFineStoneGrain(ctx, s, darkAlpha = 0.14, lightAlpha = 0.08, count = 1800) {
  for (let i = 0; i < count; i++) {
    const x = Math.floor(h2(i, 1, 7) * s);
    const y = Math.floor(h2(i, 2, 13) * s);
    const w = 1 + (i % 3), h = 1 + ((i >> 1) % 3);
    ctx.fillStyle = i % 2 === 0 ? `rgba(0,0,0,${darkAlpha})` : `rgba(255,255,255,${lightAlpha})`;
    ctx.fillRect(x, y, w, h);
  }
}

function drawCracks(ctx, s, count, strokeStyle, width = 1.6) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  for (let c = 0; c < count; c++) {
    let x = h2(c, 10, 31) * s * 0.8 + s * 0.1;
    let y = h2(c, 20, 37) * s * 0.8 + s * 0.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let seg = 0; seg < 5; seg++) {
      x += (h2(c * 7 + seg, 3, 41) - 0.5) * (s * 0.18);
      y += (h2(c * 7 + seg, 9, 43) - 0.5) * (s * 0.18);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

export function buildThemeFloorMaterial(theme, renderer, textures, cache) {
  const key = `pbr-floor:${theme.id}`;
  const look = theme.base || theme.id;
  if (cache.has(key)) return cache.get(key);
  const S = 512;
  let emissiveMap = null;

  const map = makeTex(renderer, textures, S, true, ctx => {
    // Deep recessed mortar base
    ctx.fillStyle = '#1b1e20';
    ctx.fillRect(0, 0, S, S);

    if (look === 'ossuary') {
      // Octagonal weathered travertine flagstones + dark slate diamond insets
      ctx.fillStyle = '#5c5a52';
      ctx.fillRect(8, 8, S - 16, S - 16);
      // Chamfered corner diamonds
      const cut = 88;
      ctx.fillStyle = '#252624';
      for (const [cx, cy] of [[0, 0], [S, 0], [0, S], [S, S], [S / 2, S / 2]]) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - cut); ctx.lineTo(cx + cut, cy);
        ctx.lineTo(cx, cy + cut); ctx.lineTo(cx - cut, cy);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#191a18'; ctx.lineWidth = 6; ctx.stroke();
      }
      // Subtle warm-grey stone mottling + AO vignette
      const grad = ctx.createRadialGradient(S / 2, S / 2, 40, S / 2, S / 2, S * 0.68);
      grad.addColorStop(0, 'rgba(138,132,118,0.22)');
      grad.addColorStop(1, 'rgba(20,22,20,0.42)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, S, S);
      addFineStoneGrain(ctx, S, 0.16, 0.09, 2400);
      drawCracks(ctx, S, 5, 'rgba(22,22,20,0.65)', 2.2);
      ctx.strokeStyle = '#1c1d1b'; ctx.lineWidth = 10; ctx.strokeRect(4, 4, S - 8, S - 8);
    } else if (look === 'catacombs') {
      // Irregular ruin cobblestones + mossy seams
      ctx.fillStyle = '#263324'; // Deep moss bed in joints!
      ctx.fillRect(0, 0, S, S);
      const grid = 3;
      const cell = S / grid;
      for (let gy = 0; gy < grid; gy++) {
        for (let gx = 0; gx < grid; gx++) {
          const cx = (gx + 0.5) * cell + (h2(gx, gy, 3) - 0.5) * 22;
          const cy = (gy + 0.5) * cell + (h2(gx, gy, 5) - 0.5) * 22;
          const rx = cell * (0.39 + h2(gx, gy, 7) * 0.08);
          const ry = cell * (0.38 + h2(gx, gy, 11) * 0.08);
          const shade = 62 + Math.floor(h2(gx, gy, 17) * 24);
          ctx.fillStyle = `rgb(${shade},${shade + 5},${shade - 2})`;
          ctx.beginPath();
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2;
            const rad = 0.88 + h2(gx * 8 + k, gy, 19) * 0.2;
            const px = cx + Math.cos(a) * rx * rad;
            const py = cy + Math.sin(a) * ry * rad;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(20,28,18,0.85)';
          ctx.lineWidth = 5;
          ctx.stroke();
        }
      }
      // Creeping olive moss blotches along edges
      for (let m = 0; m < 48; m++) {
        const mx = h2(m, 4, 29) * S, my = h2(m, 8, 31) * S, mr = 8 + h2(m, 2, 37) * 24;
        const mg = ctx.createRadialGradient(mx, my, 2, mx, my, mr);
        mg.addColorStop(0, 'rgba(62, 92, 46, 0.55)');
        mg.addColorStop(1, 'rgba(42, 66, 34, 0)');
        ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
      }
      addFineStoneGrain(ctx, S, 0.18, 0.07, 2200);
    } else if (look === 'caverns') {
      // Cleaved dark slate bedrock + diagonal geological strata & silver-cyan frost veins
      ctx.fillStyle = '#33434d';
      ctx.fillRect(0, 0, S, S);
      for (let b = -S; b < S * 2; b += 28) {
        ctx.fillStyle = b % 56 === 0 ? 'rgba(20,30,38,0.36)' : 'rgba(130,175,196,0.10)';
        ctx.beginPath();
        ctx.moveTo(b, 0); ctx.lineTo(b + 18, 0); ctx.lineTo(b - S * 0.55 + 18, S); ctx.lineTo(b - S * 0.55, S);
        ctx.closePath(); ctx.fill();
      }
      addFineStoneGrain(ctx, S, 0.16, 0.08, 2000);
      drawCracks(ctx, S, 7, theme.veinColor || 'rgba(165, 232, 248, 0.48)', 2.0);
      drawCracks(ctx, S, 5, 'rgba(12, 20, 26, 0.72)', 3.0);
      ctx.strokeStyle = 'rgba(18, 28, 36, 0.85)'; ctx.lineWidth = 8; ctx.strokeRect(3, 3, S - 6, S - 6);
    } else if (look === 'reliquary') {
      // Polished dark veined Nero-Marquina marble + inlaid antique-bronze border!
      ctx.fillStyle = '#252833';
      ctx.fillRect(0, 0, S, S);
      //Subtle diagonal white/gold calcite marble veins
      drawCracks(ctx, S, 9, 'rgba(195, 202, 222, 0.22)', 2.4);
      drawCracks(ctx, S, 6, theme.veinColor || 'rgba(214, 174, 108, 0.20)', 1.5);
      // Tarnished bronze double inlay border
      ctx.strokeStyle = theme.inlay || '#8c6e42';
      ctx.lineWidth = 5;
      ctx.strokeRect(18, 18, S - 36, S - 36);
      ctx.strokeStyle = '#59462b';
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 28, S - 56, S - 56);
      addFineStoneGrain(ctx, S, 0.10, 0.05, 1200);
      ctx.strokeStyle = '#12141c'; ctx.lineWidth = 9; ctx.strokeRect(4, 4, S - 8, S - 8);
    } else if (look === 'sanctum') {
      // Interlocking hexagonal black-basalt columns + carved violet rune seams
      ctx.fillStyle = '#1e1929';
      ctx.fillRect(0, 0, S, S);
      const R = 96;
      const centers = [
        [S * 0.25, S * 0.25], [S * 0.75, S * 0.25],
        [S * 0.50, S * 0.50],
        [S * 0.25, S * 0.75], [S * 0.75, S * 0.75],
      ];
      for (const [cx, cy] of centers) {
        ctx.fillStyle = '#2a2438';
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
          const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#6f4ca8'; ctx.lineWidth = 3.5; ctx.stroke();
      }
      addFineStoneGrain(ctx, S, 0.15, 0.06, 1600);
      ctx.strokeStyle = '#120e1a'; ctx.lineWidth = 8; ctx.strokeRect(4, 4, S - 8, S - 8);
    } else if (look === 'crucible') {
      // Scorched volcanic basalt slabs + glowing molten fissures
      ctx.fillStyle = '#2b2220';
      ctx.fillRect(0, 0, S, S);
      const g = ctx.createRadialGradient(S / 2, S / 2, 30, S / 2, S / 2, S * 0.65);
      g.addColorStop(0, 'rgba(68,52,48,0.35)');
      g.addColorStop(1, 'rgba(18,12,10,0.65)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
      addFineStoneGrain(ctx, S, 0.22, 0.06, 2600);
      drawCracks(ctx, S, 6, 'rgba(255, 102, 28, 0.78)', 3.2);
      drawCracks(ctx, S, 6, 'rgba(255, 206, 112, 0.55)', 1.3);
      ctx.strokeStyle = '#170f0d'; ctx.lineWidth = 10; ctx.strokeRect(4, 4, S - 8, S - 8);
    } else {
      // forged_hall: Dressed granite herringbone / coursed blocks + iron corner bosses
      ctx.fillStyle = '#4e5452';
      ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = '#232726';
      ctx.lineWidth = 7;
      ctx.strokeRect(5, 5, S - 10, S - 10);
      ctx.beginPath();
      ctx.moveTo(0, S / 2); ctx.lineTo(S, S / 2);
      ctx.moveTo(S / 2, 0); ctx.lineTo(S / 2, S / 2);
      ctx.moveTo(S * 0.25, S / 2); ctx.lineTo(S * 0.25, S);
      ctx.moveTo(S * 0.75, S / 2); ctx.lineTo(S * 0.75, S);
      ctx.stroke();
      // Iron/brass corner rivets
      ctx.fillStyle = '#7c633e';
      for (const [rx, ry] of [[24, 24], [S - 24, 24], [24, S - 24], [S - 24, S - 24]]) {
        ctx.beginPath(); ctx.arc(rx, ry, 7, 0, Math.PI * 2); ctx.fill();
      }
      addFineStoneGrain(ctx, S, 0.16, 0.08, 2200);
      drawCracks(ctx, S, 3, 'rgba(24,28,27,0.55)', 1.8);
    }
  });

  // Height/Bump map (white = raised stone face, black = recessed mortar/cracks)
  const bumpMap = makeTex(renderer, textures, S, false, ctx => {
    ctx.fillStyle = '#d8d8d8';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = '#181818';
    ctx.lineWidth = 14;
    ctx.strokeRect(5, 5, S - 10, S - 10);
    if (look === 'catacombs') {
      const cell = S / 3;
      ctx.lineWidth = 10;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, S); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(S, i * cell); ctx.stroke();
      }
    } else if (look === 'forged_hall') {
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(0, S / 2); ctx.lineTo(S, S / 2);
      ctx.moveTo(S / 2, 0); ctx.lineTo(S / 2, S / 2);
      ctx.stroke();
    }
    addFineStoneGrain(ctx, S, 0.22, 0.18, 2600);
    drawCracks(ctx, S, 6, '#141414', 3.0);
  });

  // Roughness map (dark = wet/polished specular glint, bright = matte rough dust/moss)
  const roughnessMap = makeTex(renderer, textures, S, false, ctx => {
    const baseGray = Math.round(theme.floorRoughness * 255);
    ctx.fillStyle = `rgb(${baseGray},${baseGray},${baseGray})`;
    ctx.fillRect(0, 0, S, S);
    for (let p = 0; p < 24; p++) {
      const px = h2(p, 5, 61) * S, py = h2(p, 9, 67) * S, pr = 24 + h2(p, 3, 71) * 56;
      const g = ctx.createRadialGradient(px, py, 4, px, py, pr);
      const shiny = look === 'catacombs' || look === 'caverns' || look === 'reliquary';
      g.addColorStop(0, shiny ? 'rgba(45,45,45,0.65)' : 'rgba(240,240,240,0.35)');
      g.addColorStop(1, 'rgba(128,128,128,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    }
  });

  if (theme.emissive) {
    emissiveMap = makeTex(renderer, textures, S, true, ctx => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, S, S);
      if (look === 'crucible') {
        drawCracks(ctx, S, 6, '#ff6a1a', 3.4);
        drawCracks(ctx, S, 6, '#ffd27d', 1.2);
      } else if (look === 'sanctum') {
        ctx.strokeStyle = '#9d5cff';
        ctx.lineWidth = 2.6;
        ctx.strokeRect(22, 22, S - 44, S - 44);
        drawCracks(ctx, S, 4, '#8b47ff', 2.0);
      }
    });
  }

  const mat = new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: theme.bumpScale,
    roughnessMap,
    roughness: 1.0,
    metalness: theme.floorMetalness,
    ...(emissiveMap ? { emissive: new THREE.Color('#ffffff'), emissiveMap, emissiveIntensity: theme.emissiveIntensity } : {}),
  });
  cache.set(key, mat);
  return mat;
}

export function buildThemeWallMaterial(theme, renderer, textures, cache) {
  const key = `pbr-wall:${theme.id}`;
  const look = theme.base || theme.id;
  if (cache.has(key)) return cache.get(key);
  const S = 512;

  const drawWallPattern = (ctx, isBump) => {
    if (look === 'caverns') {
      // Jagged stratified cavern rock wall (no brick courses!)
      ctx.fillStyle = isBump ? '#9e9e9e' : '#32414a';
      ctx.fillRect(0, 0, S, S);
      for (let y = 0; y < S; y += 34) {
        ctx.strokeStyle = isBump ? '#202020' : '#18232b';
        ctx.lineWidth = isBump ? 7 : 5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= S; x += 48) {
          ctx.lineTo(x, y + (h2(x, y, 83) - 0.5) * 20);
        }
        ctx.stroke();
      }
    } else if (look === 'reliquary') {
      // Fluted Gothic vertical pilaster stone panels + tarnished bronze band
      ctx.fillStyle = isBump ? '#c8c8c8' : '#3a3f4d';
      ctx.fillRect(0, 0, S, S);
      for (let x = 32; x < S; x += 64) {
        ctx.fillStyle = isBump ? '#505050' : '#282c38';
        ctx.fillRect(x - 10, 36, 20, S - 72);
      }
      if (!isBump) {
        ctx.fillStyle = '#755c38';
        ctx.fillRect(0, 24, S, 10);
        ctx.fillRect(0, S - 34, S, 10);
      }
    } else {
      // Weathered stone masonry courses tailored to theme
      const bodyMap = {
        ossuary: '#4d4c45', catacombs: '#3b453b', sanctum: '#282336',
        crucible: '#332624', forged_hall: '#454a48',
      };
      ctx.fillStyle = isBump ? '#cccccc' : (bodyMap[look] || '#454a48');
      ctx.fillRect(0, 0, S, S);
      const courses = look === 'sanctum' ? 3 : 5;
      const ch = S / courses;
      for (let r = 0; r < courses; r++) {
        const y = r * ch;
        const off = (r % 2) * (S / 4);
        if (!isBump) {
          for (let b = 0; b < 4; b++) {
            const bx = (off + b * (S / 2)) % S;
            const v = (h2(b, r, 97) - 0.5) * 18;
            ctx.fillStyle = v > 0 ? `rgba(255,255,255,${v / 255})` : `rgba(0,0,0,${-v / 255})`;
            ctx.fillRect(bx, y + 3, S / 2 - 4, ch - 6);
          }
        }
        ctx.strokeStyle = isBump ? '#1a1a1a' : (look === 'crucible' ? '#5e2414' : '#1b1e1d');
        ctx.lineWidth = isBump ? 9 : 6;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y); ctx.stroke();
        for (const vx of [off + S * 0.25, off + S * 0.75]) {
          const x = vx % S;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + ch); ctx.stroke();
        }
      }
      if (!isBump && look === 'catacombs') {
        // Basal dampness & creeping moss/vines at bottom of walls!
        const g = ctx.createLinearGradient(0, S, 0, S * 0.45);
        g.addColorStop(0, 'rgba(38, 66, 32, 0.72)');
        g.addColorStop(1, 'rgba(38, 66, 32, 0)');
        ctx.fillStyle = g; ctx.fillRect(0, S * 0.45, S, S * 0.55);
      }
    }
    addFineStoneGrain(ctx, S, 0.18, 0.08, 2000);
    if (!isBump) {
      // Top & bottom ambient occlusion shadow band
      const ao = ctx.createLinearGradient(0, S, 0, S * 0.78);
      ao.addColorStop(0, 'rgba(0,0,0,0.48)');
      ao.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ao; ctx.fillRect(0, S * 0.78, S, S * 0.22);
    }
  };

  const map = makeTex(renderer, textures, S, true, ctx => drawWallPattern(ctx, false));
  const bumpMap = makeTex(renderer, textures, S, false, ctx => drawWallPattern(ctx, true));
  const mat = new THREE.MeshStandardMaterial({
    map, bumpMap, bumpScale: 0.05, roughness: 0.84, metalness: 0.06,
  });
  cache.set(key, mat);
  return mat;
}

export function buildDarkTimberTextures(renderer, textures) {
  const S = 256;
  const map = makeTex(renderer, textures, S, true, ctx => {
    ctx.fillStyle = '#5c402b';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 110; i++) {
      const y = (i * 29) % S;
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(22,13,8,0.45)' : 'rgba(130,94,62,0.25)';
      ctx.lineWidth = 1 + (i % 3);
      ctx.beginPath(); ctx.moveTo(0, y);
      ctx.bezierCurveTo(S * 0.3, y + 6, S * 0.7, y - 7, S, y + 1);
      ctx.stroke();
    }
    // Plank seams & iron nail heads
    ctx.strokeStyle = 'rgba(14,8,5,0.68)';
    ctx.lineWidth = 3;
    for (const py of [64, 128, 192]) { ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(S, py); ctx.stroke(); }
  });
  const bump = makeTex(renderer, textures, S, false, ctx => {
    ctx.fillStyle = '#c4c4c4';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 4;
    for (const py of [64, 128, 192]) { ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(S, py); ctx.stroke(); }
    for (let i = 0; i < 90; i++) {
      const y = (i * 31) % S;
      ctx.strokeStyle = '#777777'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y + 2); ctx.stroke();
    }
  });
  return { map, bump };
}
