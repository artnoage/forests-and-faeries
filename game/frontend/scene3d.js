import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { objectForProp, footprintContains } from './encounter-objects.js';
import { createCombatEffects } from './combat-effects.js';
import { rigCharacter, RELEASE_AT, impactAt, actionDuration } from './character-motion.js';
import {
  resolveCastKey, castReadyFor, createCastInstance, requestCastModel,
  prepareAssets, disposeAssets, getAssetState, getUndeadState, getCastState, onCastLoaded,
} from './skinned-cast.js';
import {
  THEME_CATALOG, PRESET_DEFAULT_THEME, resolveTheme,
  buildThemeFloorMaterial, buildThemeWallMaterial, buildDarkTimberTextures,
} from './dungeon-themes.js';
import { applyTextureSet, loadTexture, loadPropModel } from './assets.js';

export {
  prepareAssets, disposeAssets, getAssetState, getUndeadState, getCastState, resolveCastKey,
  THEME_CATALOG, PRESET_DEFAULT_THEME,
};

function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

// Software WebGL (SwiftShader, llvmpipe) gets the low tier: smaller shadows, pixel ratio 1.
function detectTier(gl) {
  try {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    return /swiftshader|llvmpipe|software|softpipe|basic render/i.test(name) ? 'low' : 'high';
  } catch { return 'high'; }
}

const IDLE_FRAME_MS = 1000 / 30;

export function createViewer({ container, onCell, onHover, onCameraChange, onReady, onUnavailable, idleAnimation = false } = {}) {
  if (!container) throw new Error('A tabletop container is required.');
  const canvas = document.createElement('canvas');
  canvas.dataset.emberScene = 'webgl';
  canvas.dataset.renderer = 'webgl';
  canvas.setAttribute('aria-label', '3D tabletop. Drag to orbit, pinch or scroll to zoom.');
  // Size, touch and outline come from the stylesheet (.scene-view canvas): the page's
  // CSP has style-src 'self', and Firefox refuses inline style text.

  let renderer;
  const context = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
  if (!context) {
    onUnavailable?.('WebGL 2 is unavailable on this device.');
    throw new Error('WebGL 2 is unavailable on this device.');
  }
  try {
    renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true });
  } catch (error) {
    onUnavailable?.('The 3D tabletop could not initialize.');
    throw error;
  }
  const tier = detectTier(context);
  const maxPixelRatio = tier === 'low' ? 1 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.26;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // Clean Three 0.187 shadow map (no deprecation warning!)
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  container.appendChild(canvas);
  container.dataset.renderer = 'webgl';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#111a1f');
  scene.fog = new THREE.Fog('#111a1f', 29, 76);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 140);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.minPolarAngle = 0.04;
  controls.maxPolarAngle = 1.46;
  controls.minDistance = 2.1;
  controls.maxDistance = 42;
  controls.screenSpacePanning = false;
  controls.panSpeed = 0.72;
  controls.rotateSpeed = 0.72;
  controls.zoomSpeed = 0.90;

  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let reducedMotion = Boolean(media?.matches);
  let idleLoop = Boolean(idleAnimation) && !reducedMotion;
  let labelMode = 'smart'; // 'smart' | 'minimal' | 'off'
  let biomeOverride = null;

  const board = new THREE.Group();
  const figures = new THREE.Group();
  // Invisible cylinders per figure: pointer picking never raycasts skinned meshes.
  const pickers = new THREE.Group();
  const overlays = new THREE.Group();
  const hoverGroup = new THREE.Group();
  const dustGroup = new THREE.Group();
  scene.add(board, figures, overlays, hoverGroup, dustGroup, pickers);
  const pickMaterial = new THREE.MeshBasicMaterial({ visible: false });

  const hemiLight = new THREE.HemisphereLight('#dcefeb', '#59616b', 2.15);
  scene.add(hemiLight);
  const keyLight = new THREE.DirectionalLight('#ffe0ad', 3.45);
  keyLight.position.set(-5, 13, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(tier === 'low' ? 1024 : 2048, tier === 'low' ? 1024 : 2048);
  Object.assign(keyLight.shadow.camera, { left: -12, right: 12, top: 11, bottom: -11, near: 0.5, far: 55 });
  keyLight.shadow.normalBias = 0.03;
  keyLight.shadow.bias = -0.0002;
  scene.add(keyLight, keyLight.target);
  const fillLight = new THREE.DirectionalLight('#62b8c9', 1.35);
  fillLight.position.set(8, 5, -6);
  scene.add(fillLight);

  const geometries = new Map();
  const materials = new Map();
  const textures = new Set();
  const units = new Map();
  const torchFlames = [];
  const stepPuffs = [];
  const motes = [];
  let activeThemeId = 'forged_hall';
  let state = null, boardKey = '', width = 10, height = 8;
  let disposed = false, unavailable = false, frame = 0, ready = false, busy = false;
  let pointer = null;
  const pointers = new Set();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.025);
  const hitPoint = new THREE.Vector3();
  const projection = new THREE.Vector3();
  const scratch = new THREE.Object3D();
  const combatEffects = createCombatEffects({ scene, units, requestRender, reducedMotion });
  let playback = null, inspectedId = null, upgradePending = false;
  let cameraViewDir = new THREE.Vector3(0.54, 0.92, 1.13).normalize();
  let hasFramedOnce = false, camTween = null, lastHoverKey = '';
  let safeArea = null;
  let autoCam = true, actionZoom = true, manualHold = false, track = null, presetName = 'tactical', lastDirected = null, lastEnded = null;
  const hoverGeoms = [];

  function geometry(key, make) {
    if (!geometries.has(key)) geometries.set(key, make());
    return geometries.get(key);
  }
  const box = geometry('box', () => new THREE.BoxGeometry(1, 1, 1));
  const sphere = geometry('sphere', () => new THREE.IcosahedronGeometry(1, 2));
  const rock = geometry('rock', () => {
    // Craggy chiseled granite boulder geometry (deterministic seam-free displacement)
    const g = new THREE.DodecahedronGeometry(1, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const n = Math.sin(x * 3.7 + y * 2.3) * Math.cos(z * 4.1 - x * 1.9);
      const n2 = Math.cos(y * 5.3 - z * 3.1 + x * 2.7);
      const s = 0.88 + 0.16 * n + 0.08 * n2;
      x *= s; z *= s;
      // Flatten underside slightly so boulders sit firmly planted in the earth
      y = y < 0 ? y * s * 0.72 : y * s * (0.94 + 0.08 * n2);
      pos.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return g;
  });
  const cone = geometry('cone', () => new THREE.ConeGeometry(1, 1, 12));
  const cylinder = geometry('cylinder', () => new THREE.CylinderGeometry(1, 1, 1, 16));
  const robe = geometry('robe', () => new THREE.CylinderGeometry(0.56, 1, 1, 12));
  const ringGeometry = geometry('ring', () => new THREE.RingGeometry(0.37, 0.425, 48));
  const activeGeometry = geometry('active-ring', () => new THREE.RingGeometry(0.435, 0.495, 48));
  const planeGeometry = geometry('plane', () => new THREE.PlaneGeometry(1, 1));

  function material(color, metalness = 0, roughness = 0.8) {
    const key = `${color}:${metalness}:${roughness}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, metalness, roughness, flatShading: false }));
    return materials.get(key);
  }
  function glow(color, opacity = 1) {
    const key = `glow:${color}:${opacity}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity === 1, side: THREE.DoubleSide }));
    return materials.get(key);
  }
  function mesh(parent, geom, mat, x, y, z, sx = 1, sy = sx, sz = sx) {
    const result = new THREE.Mesh(geom, mat);
    result.position.set(x, y, z);
    result.scale.set(sx, sy, sz);
    result.castShadow = true;
    result.receiveShadow = true;
    parent.add(result);
    return result;
  }
  function ring(parent, geom, mat, elevation) {
    const result = mesh(parent, geom, mat, 0, elevation, 0);
    result.rotation.x = -Math.PI / 2;
    result.castShadow = false;
    return result;
  }
  function makeTexture(draw, w = 256, h = 256) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.add(texture);
    return texture;
  }

  const contactTexture = makeTexture((ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,.74)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }, 64, 64);
  const contactMaterial = new THREE.MeshBasicMaterial({ map: contactTexture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
  materials.set('contact', contactMaterial);

  function clearGroup(group) {
    group.traverse(child => { if (child.isInstancedMesh) child.dispose(); });
    group.clear();
  }
  function beam(parent, mat, from, to, radius = 0.025) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const delta = b.clone().sub(a);
    const result = mesh(parent, cylinder, mat, ...a.clone().add(b).multiplyScalar(0.5).toArray(), radius, delta.length(), radius);
    result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return result;
  }
  const darkTimber = buildDarkTimberTextures(renderer, textures);
  function timber(color) {
    const key = `wood:${color}`;
    if (!materials.has(key)) {
      materials.set(key, new THREE.MeshStandardMaterial({
        color,
        map: darkTimber.map,
        bumpMap: darkTimber.bump,
        bumpScale: 0.036,
        roughness: 0.84,
        metalness: 0.04,
      }));
    }
    return materials.get(key);
  }
  function book(parent, x, y, z, w, h, d, color) {
    const cover = material(color, 0.06, 0.76), pages = material('#cfc09b', 0, 0.9);
    mesh(parent, box, pages, x, y, z, w * 0.8, h * 0.89, d * 0.92);
    for (const sign of [-1, 1]) mesh(parent, box, cover, x + sign * w * 0.46, y, z, w * 0.09, h, d);
    mesh(parent, box, cover, x, y, z - d * 0.48, w, h, d * 0.08);
  }
  function candle(parent, x, y, z) {
    mesh(parent, cylinder, material('#8f6f40', 0.78, 0.36), x, y + 0.014, z, 0.105, 0.028, 0.105);
    mesh(parent, cylinder, material('#ddd0ae', 0, 0.65), x, y + 0.11, z, 0.047, 0.18, 0.047);
    const fl = mesh(parent, cone, glow('#ffc15d'), x, y + 0.248, z, 0.035, 0.12, 0.035);
    fl.rotation.z = -0.13;
    torchFlames.push({ flame: fl, baseY: y + 0.248, baseScaleY: 0.12, phase: x * 3.1 + z * 1.7 });
  }
  function mug(parent, x, y, z) {
    mesh(parent, cylinder, material('#535f63', 0.68, 0.42), x, y + 0.07, z, 0.065, 0.14, 0.065);
    mesh(parent, cylinder, material('#3b2618', 0.05, 0.35), x, y + 0.142, z, 0.052, 0.005, 0.052);
    const handle = geometry('mug-handle', () => new THREE.TorusGeometry(0.047, 0.014, 6, 12));
    mesh(parent, handle, material('#748287', 0.72, 0.38), x + 0.078, y + 0.075, z);
  }
  function rugMaterial(teal) {
    const key = `rug:${teal}`;
    if (!materials.has(key)) {
      const texture = makeTexture((ctx, w, h) => {
        ctx.fillStyle = teal ? '#1d3b42' : '#572226';
        ctx.fillRect(0, 0, w, h);
        // Threadbare woven grain
        for (let y = 0; y < h; y += 3) {
          ctx.fillStyle = y % 6 === 0 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.04)';
          ctx.fillRect(0, y, w, 1);
        }
        ctx.strokeStyle = '#9e7d47'; ctx.lineWidth = 5; ctx.strokeRect(14, 14, w - 28, h - 28);
        ctx.strokeStyle = teal ? '#55786f' : '#8c5442'; ctx.lineWidth = 9; ctx.strokeRect(27, 27, w - 54, h - 54);
        for (const size of [74, 49, 22]) {
          ctx.fillStyle = size === 49 ? (teal ? '#6b3b30' : '#24464a') : '#9c7c49';
          ctx.beginPath(); ctx.moveTo(w / 2, h / 2 - size); ctx.lineTo(w / 2 + size * 0.65, h / 2);
          ctx.lineTo(w / 2, h / 2 + size); ctx.lineTo(w / 2 - size * 0.65, h / 2); ctx.closePath(); ctx.fill();
        }
        const vig = ctx.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, w * 0.68);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.38)');
        ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
      });
      materials.set(key, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.96, side: THREE.DoubleSide }));
    }
    return materials.get(key);
  }

  function furnish(group, prop) {
    const w = Number(prop.width) || 1, d = Number(prop.depth) || 1;
    const walnut = timber('#6e503a'), oak = timber('#916c4f'), edge = timber('#4d3525');
    const iron = material('#2b3236', 0.78, 0.38), brass = material('#8f6f40', 0.80, 0.34);
    const h = Math.max(0.2, Math.min(2.1, Number(prop.height) || 0.8));
    if (prop.kind === 'rug') {
      const carpet = mesh(group, planeGeometry, rugMaterial((prop.x + prop.y) % 2 === 0), 0, 0.008, 0, w - 0.18, d - 0.18, 1);
      carpet.rotation.x = -Math.PI / 2; carpet.castShadow = false;
      for (const sign of [-1, 1]) for (let x = -w / 2 + 0.15; x < w / 2 - 0.1; x += 0.09) {
        mesh(group, box, material('#947b52', 0, 0.95), x, 0.006, sign * (d / 2 - 0.065), 0.022, 0.006, 0.1).castShadow = false;
      }
    } else if (prop.kind === 'table') {
      const top = h - 0.06, planks = Math.max(2, Math.ceil(d / 0.25));
      for (let i = 0; i < planks; i++) mesh(group, box, i % 2 ? oak : walnut, 0, top, -d / 2 + 0.09 + (i + 0.5) * (d - 0.18) / planks, w - 0.16, 0.12, (d - 0.18) / planks - 0.016);
      for (const x of [-w / 2 + 0.22, w / 2 - 0.22]) for (const z of [-d / 2 + 0.22, d / 2 - 0.22]) {
        mesh(group, box, edge, x, (h - 0.14) / 2, z, 0.13, h - 0.14, 0.13);
        mesh(group, box, brass, x, 0.09, z, 0.15, 0.07, 0.15);
      }
      candle(group, -w * 0.24, h, -d * 0.17);
      mug(group, w * 0.24, h, d * 0.2);
      mug(group, -w * 0.19, h, d * 0.23);
      const tome = new THREE.Group(); group.add(tome); tome.position.set(w * 0.23, h + 0.065, -d * 0.22); tome.rotation.z = Math.PI / 2; tome.rotation.y = 0.14;
      book(tome, 0, 0, 0, 0.09, Math.min(0.36, w * 0.3), Math.min(0.31, d * 0.3), '#5e2824');
    } else if (prop.kind === 'bench') {
      const long = Math.max(w, d), short = Math.min(w, d);
      if (d > w) group.rotation.y = Math.PI / 2;
      mesh(group, box, oak, 0, h - 0.06, 0, long - 0.18, 0.12, short * 0.58);
      for (const x of [-long / 2 + 0.25, long / 2 - 0.25]) mesh(group, box, walnut, x, (h - 0.12) / 2, 0, 0.16, h - 0.12, short * 0.44);
    } else if (prop.kind === 'shelf') {
      const long = Math.max(w, d), short = Math.min(w, d), deep = short * 0.72;
      group.rotation.y = d > w ? (prop.x < width / 2 ? -Math.PI / 2 : Math.PI / 2) : (prop.y < height / 2 ? Math.PI : 0);
      for (const x of [-long / 2 + 0.12, long / 2 - 0.12]) mesh(group, box, walnut, x, h / 2, 0, 0.13, h, deep);
      const rows = h >= 1.3 ? 3 : 2, shelfColors = ['#5e2824', '#274245', '#785b2e', '#38472e', '#3e334d'];
      for (let row = 0; row <= rows; row++) {
        const y = 0.1 + row * (h - 0.15) / rows;
        mesh(group, box, oak, 0, y, 0, long - 0.1, 0.09, deep + 0.045);
        if (row === rows) continue;
        const count = Math.max(3, Math.floor((long - 0.42) / 0.14));
        for (let i = 0; i < count; i++) {
          const bh = (h - 0.15) / rows * (0.61 + ((i + row * 3) % 4) * 0.065);
          book(group, -long / 2 + 0.26 + (i + 0.5) * (long - 0.52) / count, y + 0.045 + bh / 2, -deep * 0.08, (long - 0.52) / count * 0.78, bh, deep * 0.7, shelfColors[(i + row * 2) % shelfColors.length]);
        }
      }
    } else if (prop.kind === 'barrel') {
      const radius = Math.min(w, d) * 0.37;
      const barrel = geometry('barrel', () => new THREE.LatheGeometry([
        new THREE.Vector2(0, 0), new THREE.Vector2(0.8, 0), new THREE.Vector2(0.95, 0.16),
        new THREE.Vector2(1, 0.5), new THREE.Vector2(0.95, 0.84), new THREE.Vector2(0.8, 1), new THREE.Vector2(0, 1)
      ], 16));
      mesh(group, barrel, walnut, 0, 0, 0, radius, h, radius);
      for (const [y, r] of [[0.12, 0.94], [0.32, 1.0], [0.72, 1.0], [0.9, 0.93]]) mesh(group, cylinder, iron, 0, y * h, 0, radius * r + 0.014, 0.055, radius * r + 0.014);
      mesh(group, cylinder, oak, 0, h + 0.003, 0, radius * 0.79, 0.022, radius * 0.79);
    } else if (prop.kind === 'crate') {
      mesh(group, box, walnut, 0, h / 2, 0, w - 0.22, h, d - 0.22);
      for (const sign of [-1, 1]) {
        for (const y of [0.06, h - 0.06]) {
          mesh(group, box, oak, 0, y, sign * (d / 2 - 0.08), w - 0.16, 0.1, 0.08);
          mesh(group, box, oak, sign * (w / 2 - 0.08), y, 0, 0.08, 0.1, d - 0.16);
        }
        const brace = mesh(group, box, oak, 0, h / 2, sign * (d / 2 - 0.065), Math.hypot(w - 0.43, h - 0.19), 0.085, 0.045);
        brace.rotation.z = Math.atan2(h - 0.19, w - 0.43);
        // Iron corner brackets
        for (const cx of [-w / 2 + 0.1, w / 2 - 0.1]) {
          mesh(group, box, iron, cx, h - 0.06, sign * (d / 2 - 0.07), 0.09, 0.11, 0.09);
        }
      }
    }
  }

  function batchProp(group) {
    group.updateMatrixWorld(true);
    const inverse = group.matrixWorld.clone().invert(), batches = new Map();
    group.traverse(child => {
      if (!child.isMesh) return;
      const key = `${child.geometry.uuid}:${child.material.uuid}:${child.castShadow}`;
      if (!batches.has(key)) batches.set(key, []);
      batches.get(key).push(child);
    });
    for (const children of batches.values()) {
      if (children.length < 2) continue;
      const first = children[0];
      const batch = new THREE.InstancedMesh(first.geometry, first.material, children.length);
      batch.castShadow = first.castShadow; batch.receiveShadow = true;
      children.forEach((child, i) => {
        batch.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(inverse, child.matrixWorld));
        child.removeFromParent();
      });
      batch.computeBoundingSphere(); group.add(batch);
    }
  }

  function isWall(map, x, y) { return map.tiles?.[y]?.[x] === '#'; }
  function isTree(map, x, y) { return map.tiles?.[y]?.[x] === 'T'; }
  function blocked(map, x, y) { return isWall(map, x, y) || isTree(map, x, y); }

  function addWoodlandLantern(x, y, baseY, theme, addLight) {
    const g = new THREE.Group();
    g.position.set(x, baseY, y);
    board.add(g);
    const fc = flameColorsForTheme(theme);
    const mossStone = material('#384036', 0.04, 0.92);
    const woodPost = timber('#4c3623');
    mesh(g, rock, mossStone, 0, 0.05, 0, 0.14, 0.08, 0.13);
    mesh(g, cylinder, woodPost, 0, 0.17, 0, 0.028, 0.24, 0.028);
    const bulb = mesh(g, sphere, glow(fc.outer, 0.90), 0, 0.30, 0, 0.072, 0.082, 0.072);
    bulb.castShadow = false;
    mesh(g, sphere, glow(fc.core, 0.95), 0, 0.30, 0, 0.036, 0.044, 0.036).castShadow = false;
    mesh(g, cone, material('#324426', 0.02, 0.90), 0, 0.39, 0, 0.115, 0.07, 0.115);
    let light = null;
    if (addLight) {
      light = new THREE.PointLight('#ffbf5e', 1.65, 6.2, 1.9);
      light.position.set(0, 0.62, 0);
      g.add(light);
    }
    torchFlames.push({ flame: bulb, light, baseY: 0.30, baseScaleY: 0.082, baseIntensity: 1.65, phase: x * 2.1 + y * 3.7 });
  }

  function addTree(x, y) {
    const g = new THREE.Group();
    g.position.set(x, 0.03, y);
    const seed = x * 19 + y * 37;
    g.rotation.y = (seed % 12) * (Math.PI / 6);
    const sc = 0.94 + ((x * 13 + y * 29) % 5) * 0.032;
    g.scale.setScalar(sc);
    board.add(g);

    const shadow = ring(g, planeGeometry, contactMaterial, 0.004);
    shadow.scale.set(1.06, 1.06, 1);
    shadow.userData.keep = true;

    // Immediate procedural tabletop oak fallback while props/oak_tree.glb streams in
    const bark = timber('#5a432d');
    const moss = material('#425e32', 0.0, 0.92);
    const leafDark = material('#2e4c26', 0.0, 0.90);
    const leafMid = material('#436631', 0.0, 0.88);
    const leafHi = material('#5c7e3b', 0.0, 0.88);
    mesh(g, cylinder, moss, 0, 0.04, 0, 0.38, 0.08, 0.38);
    mesh(g, cylinder, bark, 0, 0.62, 0, 0.15, 1.18, 0.15);
    for (let i = 0; i < 4; i++) {
      const a = i * (Math.PI / 2) + 0.3;
      beam(g, bark, [0, 0.96, 0], [Math.cos(a) * 0.32, 1.44, Math.sin(a) * 0.32], 0.055);
      mesh(g, sphere, i % 2 ? leafMid : leafDark, Math.cos(a) * 0.28, 1.52, Math.sin(a) * 0.28, 0.27, 0.20, 0.27);
    }
    mesh(g, sphere, leafMid, 0, 1.68, 0, 0.36, 0.27, 0.36);
    mesh(g, sphere, leafHi, 0.05, 1.88, -0.04, 0.26, 0.19, 0.26);

    placePropModel(g, { width: 1, depth: 1 }, 'oak_tree');
  }

  function woodlandRockMaterial(wallMat) {
    const key = 'woodland-crag-rock';
    if (!materials.has(key)) {
      const m = wallMat.clone();
      m.flatShading = true;
      m.roughness = 0.92;
      m.metalness = 0.04;
      m.needsUpdate = true;
      materials.set(key, m);
    }
    return materials.get(key);
  }

  function addWoodlandBoulderCluster(x, y, cragMat, seed) {
    const g = new THREE.Group();
    g.position.set(x, 0.035, y);
    board.add(g);
    const shadow = ring(g, planeGeometry, contactMaterial, 0.003);
    shadow.scale.set(1.04, 1.04, 1);
    const mossDark = material('#2a4221', 0.0, 0.94);
    const mossMid = material('#375229', 0.0, 0.92);
    const bark = timber('#4f3a26');
    const yaw = (seed % 8) * (Math.PI / 4);
    const hMain = 0.44 + (seed % 4) * 0.045;
    const main = mesh(g, rock, cragMat, 0.02, hMain * 0.62, -0.02, 0.43, hMain, 0.37);
    main.rotation.set(0.18, yaw, -0.10);
    const sub1 = mesh(g, rock, cragMat, -0.25, 0.19, 0.21, 0.25, 0.24, 0.22);
    sub1.rotation.set(-0.22, yaw + 1.1, 0.20);
    const sub2 = mesh(g, rock, cragMat, 0.25, 0.15, 0.19, 0.22, 0.18, 0.21);
    sub2.rotation.set(0.18, yaw + 2.3, -0.24);
    // Low organic moss tuft nestled into upper rock shoulder (subtle, dark woodland olive)
    const cap = mesh(g, rock, mossMid, 0.01, hMain * 1.06, -0.02, 0.28, 0.085, 0.24);
    cap.rotation.y = yaw + 0.4;
    mesh(g, rock, mossDark, -0.23, 0.32, 0.19, 0.15, 0.06, 0.14);
    const root1 = mesh(g, cylinder, bark, -0.14, 0.07, -0.27, 0.042, 0.38, 0.042);
    root1.rotation.set(1.22, 0.3, 0.55);
    batchProp(g);
    return hMain * 1.18;
  }

  function addWoodlandFallenTrunk(x1, y1, x2, y2, cragMat, seed) {
    const horizontal = y1 === y2;
    const cx = (x1 + x2) / 2, cz = (y1 + y2) / 2;
    const g = new THREE.Group();
    g.position.set(cx, 0.035, cz);
    const skew = ((seed % 5) - 2) * 0.045;
    g.rotation.y = (horizontal ? 0 : Math.PI / 2) + skew;
    board.add(g);

    const bark = timber('#5d4530');
    const darkBark = timber('#3d2c1e');
    const heartwood = material('#73583b', 0.0, 0.92);
    const mossDark = material('#2a4221', 0.0, 0.94);
    const mossMid = material('#39542b', 0.0, 0.92);
    const fungus = material('#c4b48a', 0.0, 0.88);

    const sh = ring(g, planeGeometry, contactMaterial, 0.003);
    sh.scale.set(2.05, 0.96, 1);

    // Main gnarled horizontal fallen trunk (length ~1.84, comfortably inside 2x1 footprint)
    const trunk = mesh(g, cylinder, bark, 0, 0.27, 0, 0.27, 1.82, 0.25);
    trunk.rotation.z = Math.PI / 2;
    const rootEnd = mesh(g, cylinder, darkBark, -0.78, 0.29, 0.01, 0.33, 0.32, 0.31);
    rootEnd.rotation.z = Math.PI / 2;
    const cutFace = mesh(g, cylinder, heartwood, 0.90, 0.27, 0, 0.21, 0.03, 0.19);
    cutFace.rotation.z = Math.PI / 2;
    for (const [rz, ry, dy] of [[-0.22, 0.4, 0.18], [0.22, -0.35, 0.16], [0.02, 0.08, 0.44]]) {
      const rt = mesh(g, cylinder, darkBark, -0.88, dy, rz, 0.055, 0.30, 0.055);
      rt.rotation.set(rz * 1.6, ry, 1.15);
    }
    const b1 = mesh(g, cylinder, darkBark, 0.22, 0.44, 0.15, 0.062, 0.29, 0.062);
    b1.rotation.set(0.55, 0.2, -0.42);
    const b2 = mesh(g, cylinder, darkBark, -0.26, 0.40, -0.17, 0.052, 0.24, 0.052);
    b2.rotation.set(-0.62, -0.15, 0.35);
    // Low velvety dark forest moss hugging the damp bark crown
    mesh(g, rock, mossMid, -0.18, 0.49, 0.02, 0.38, 0.07, 0.20);
    mesh(g, rock, mossDark, 0.38, 0.47, -0.02, 0.34, 0.065, 0.19);
    mesh(g, rock, mossDark, -0.66, 0.51, 0.04, 0.24, 0.07, 0.20);
    const rock1 = mesh(g, rock, cragMat, 0.48, 0.15, 0.27, 0.20, 0.16, 0.18);
    rock1.rotation.set(0.2, 0.8, 0.1);
    for (const [mx, my, mz, mr] of [[-0.05, 0.30, 0.25, 0.07], [0.06, 0.25, 0.26, 0.055], [0.56, 0.32, -0.24, 0.065]]) {
      mesh(g, cylinder, fungus, mx, my, mz, mr, 0.022, mr * 0.85);
    }
    batchProp(g);
    return 0.56;
  }

  function addWoodlandBoulderPair(x1, y1, x2, y2, cragMat, seed) {
    const horizontal = y1 === y2;
    const cx = (x1 + x2) / 2, cz = (y1 + y2) / 2;
    const g = new THREE.Group();
    g.position.set(cx, 0.035, cz);
    if (!horizontal) g.rotation.y = Math.PI / 2;
    board.add(g);

    const mossDark = material('#2a4221', 0.0, 0.94);
    const mossMid = material('#375229', 0.0, 0.92);
    const sh = ring(g, planeGeometry, contactMaterial, 0.003);
    sh.scale.set(2.02, 0.98, 1);

    const r1 = mesh(g, rock, cragMat, -0.36, 0.33, -0.03, 0.50, 0.45, 0.39);
    r1.rotation.set(0.18, seed * 0.7, -0.14);
    const r2 = mesh(g, rock, cragMat, 0.38, 0.27, 0.04, 0.46, 0.37, 0.36);
    r2.rotation.set(-0.16, seed * 1.3 + 0.8, 0.20);
    const r3 = mesh(g, rock, cragMat, 0.02, 0.21, 0.16, 0.31, 0.25, 0.24);
    r3.rotation.set(0.24, seed * 0.5 + 1.5, 0.10);
    mesh(g, rock, mossMid, -0.34, 0.61, -0.02, 0.32, 0.09, 0.25);
    mesh(g, rock, mossDark, 0.36, 0.51, 0.04, 0.29, 0.08, 0.23);
    mesh(g, rock, mossDark, 0.02, 0.36, 0.14, 0.20, 0.065, 0.17);
    batchProp(g);
    return 0.64;
  }

  function buildWoodlandObstacles(map, theme, wallMat, replacements, chasm, interiorWalls) {
    const cragMat = woodlandRockMaterial(wallMat);
    const rimCurbs = [], rimRocks = [], rimMoss = [], rimRoots = [];
    const consumed = new Set();
    const isInteriorWall = (x, y) => {
      if (x <= 0 || y <= 0 || x >= width - 1 || y >= height - 1) return false;
      const k = `${x},${y}`;
      return isWall(map, x, y) && !replacements.has(k) && !chasm.has(k) && !consumed.has(k);
    };

    // 1. Continuous organic craggy mossy woodland bank along the outer perimeter
    // Overlapping varied-width angular granite boulders + moss cushions + weathered roots
    // (never identical round beads marching cell-by-cell!)
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const rim = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      const k = `${x},${y}`;
      if (!rim || !isWall(map, x, y) || replacements.has(k) || chasm.has(k)) continue;
      const s = x * 17 + y * 31 + ((x * y) % 7);
      const alongX = (y === 0 || y === height - 1) && x > 0 && x < width - 1;
      rimCurbs.push([x, 0.11, y, 1.0, 0.20, 1.0, 0]);
      // Primary elongated craggy stone overlapping slightly into neighbor cells
      const mainH = 0.16 + (s % 5) * 0.032;
      const mainLen = 0.54 + (s % 4) * 0.08;
      const mainWid = 0.42 + ((s >> 1) % 3) * 0.05;
      const ox = (((s % 5) - 2) * 0.055), oz = ((((s >> 2) % 5) - 2) * 0.055);
      rimRocks.push([
        x + ox, 0.20 + mainH * 0.46, y + oz,
        alongX ? mainLen : mainWid, mainH, alongX ? mainWid : mainLen,
        (s % 11) * 0.55,
      ]);
      // Second smaller angular companion rock tucked at varied offsets to break repetition
      if ((s % 3) !== 0) {
        const subH = 0.11 + ((s + 2) % 4) * 0.025;
        const side = (s % 2 === 0 ? 1 : -1) * 0.34;
        rimRocks.push([
          x + (alongX ? side : -ox), 0.19 + subH * 0.44, y + (alongX ? -oz : side),
          0.32 + (s % 3) * 0.04, subH, 0.30 + ((s + 1) % 3) * 0.04,
          (s % 7) * 0.9 + 0.4,
        ]);
      }
      // Subtle low dark forest moss drapes on ~55% of rim stones
      if ((s % 5) < 3) {
        rimMoss.push([
          x + ox * 0.6, 0.21 + mainH * 0.88, y + oz * 0.6,
          (alongX ? mainLen : mainWid) * 0.64, 0.055, (alongX ? mainWid : mainLen) * 0.64,
          (s % 9) * 0.7,
        ]);
      }
      // Occasional weathered bark root/stump accent along the forest bank
      if ((s % 7) === 2) {
        rimRoots.push([x - ox, 0.24, y - oz, 0.20, 0.16, 0.20, (s % 5) * 0.6]);
      }
    }
    instanced(box, material('#20291b', 0.02, 0.94), rimCurbs);
    instanced(rock, cragMat, rimRocks);
    instanced(rock, material('#314b25', 0.0, 0.94), rimMoss);
    instanced(cylinder, timber('#4b3724'), rimRoots);

    // 2. Interior 'HH' pairs -> alternating moss-draped fallen logs & mossy crag boulder pairs
    let pairCount = 0;
    for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
      if (!isInteriorWall(x, y)) continue;
      let nx = null, ny = null;
      if (isInteriorWall(x + 1, y)) { nx = x + 1; ny = y; }
      else if (isInteriorWall(x, y + 1)) { nx = x; ny = y + 1; }
      if (nx !== null) {
        consumed.add(`${x},${y}`);
        consumed.add(`${nx},${ny}`);
        const seed = x * 13 + y * 29 + pairCount;
        // Alternate fallen tree trunks and mossy boulder outcrops so every map gets rich variety
        const useTrunk = (pairCount % 2 === 0);
        pairCount++;
        const topH = useTrunk
          ? addWoodlandFallenTrunk(x, y, nx, ny, cragMat, seed)
          : addWoodlandBoulderPair(x, y, nx, ny, cragMat, seed);
        interiorWalls.push({ x: (x + nx) / 2, y: (y + ny) / 2, h: topH });
      }
    }

    // 3. Isolated interior 'H' cells -> moss-capped woodland boulder clusters
    for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
      if (!isInteriorWall(x, y)) continue;
      consumed.add(`${x},${y}`);
      const topH = addWoodlandBoulderCluster(x, y, cragMat, x * 23 + y * 41);
      interiorWalls.push({ x, y, h: topH });
    }
  }

  function flameColorsForTheme(theme) {
    if (theme.flame) return theme.flame;
    if (theme.id === 'caverns') return { ember: '#2ac4e8', outer: '#7bf0ff', core: '#e6ffff' };
    if (theme.id === 'sanctum') return { ember: '#8c3dff', outer: '#c782ff', core: '#f6e6ff' };
    if (theme.id === 'crucible') return { ember: '#ff4d12', outer: '#ff902b', core: '#ffe8a3' };
    return { ember: '#ff8229', outer: '#ffc25e', core: '#fff0b3' };
  }

  function addDungeonSconce(x, y, wallH, theme, addLight) {
    const g = new THREE.Group();
    g.position.set(x, wallH + 0.12, y);
    board.add(g);
    const fc = flameColorsForTheme(theme);
    const iron = material('#282f33', 0.78, 0.40);
    const brass = material('#8c6d3e', 0.80, 0.34);
    mesh(g, cylinder, iron, 0, 0.08, 0, 0.12, 0.16, 0.12);
    mesh(g, robe, brass, 0, 0.21, 0, 0.22, 0.14, 0.22).rotation.z = Math.PI;
    mesh(g, sphere, glow(fc.ember), 0, 0.28, 0, 0.15, 0.07, 0.15);
    const fl = mesh(g, cone, glow(fc.outer), 0, 0.42, 0, 0.12, 0.34, 0.12);
    fl.castShadow = false;
    mesh(g, cone, glow(fc.core), 0.02, 0.35, 0.01, 0.055, 0.18, 0.055).castShadow = false;
    let light = null;
    if (addLight) {
      light = new THREE.PointLight(theme.torchColor, 4.8, 7.2, 1.9);
      light.position.set(0, 0.52, 0);
      g.add(light);
    }
    torchFlames.push({ flame: fl, light, baseY: 0.42, baseScaleY: 0.34, baseIntensity: 4.8, phase: x * 2.1 + y * 3.7 });
  }

  function clearMotes() {
    for (const m of motes) {
      m.mesh.removeFromParent();
      m.mat.dispose();
    }
    motes.length = 0;
  }

  function spawnThemeMotes(theme) {
    clearMotes();
    if (reducedMotion) return;
    const count = 34;
    for (let i = 0; i < count; i++) {
      const rx = ((i * 73 + 19) % 1000) / 1000 * (width - 0.4) - 0.3;
      const rz = ((i * 137 + 41) % 1000) / 1000 * (height - 0.4) - 0.3;
      const ry = 0.22 + (((i * 53 + 7) % 100) / 100) * 1.95;
      const mat = new THREE.MeshBasicMaterial({
        color: theme.moteColor || '#e8d8b5',
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const m = new THREE.Mesh(sphere, mat);
      const sc = 0.016 + (i % 4) * 0.005;
      m.scale.setScalar(sc);
      m.position.set(rx, ry, rz);
      m.castShadow = false;
      m.receiveShadow = false;
      board.add(m);
      motes.push({
        mesh: m,
        mat,
        baseX: rx,
        baseZ: rz,
        phase: i * 1.73,
        speed: 0.16 + (i % 5) * 0.045,
        yOffset: ry,
      });
    }
  }

  // Props drawn over wall cells (presentation only; the rules see plain walls).
  const PROP_KINDS = new Set(['pillar', 'brazier', 'table', 'bench', 'shelf', 'barrel', 'crate', 'rug',
    'sarcophagus', 'altar', 'stained_glass', 'bell', 'lantern_post', 'ore_vein', 'water_lock', 'kiln']);
  const PROP_MODELS = { sarcophagus: 'props/sarcophagus.glb', brazier: 'props/brazier.glb', oak_tree: 'props/oak_tree.glb' };

  function instanced(geom, mat, transforms, castShadow = true) {
    if (!transforms.length) return null;
    const inst = new THREE.InstancedMesh(geom, mat, transforms.length);
    transforms.forEach(([x, y, z, sx, sy, sz, ry = 0], i) => {
      scratch.position.set(x, y, z); scratch.scale.set(sx, sy, sz); scratch.rotation.set(0, ry, 0);
      scratch.updateMatrix(); inst.setMatrixAt(i, scratch.matrix);
    });
    inst.castShadow = castShadow; inst.receiveShadow = true;
    inst.computeBoundingSphere();
    board.add(inst);
    return inst;
  }

  // A sarcophagus: a carved stone chest with a raised, bevelled lid.
  function sarcophagus(group, prop, theme) {
    const w = Number(prop.width) || 1, d = Number(prop.depth) || 2;
    const long = Math.max(w, d), short = Math.min(w, d);
    if (w > d) group.rotation.y = Math.PI / 2;
    const stone = material(theme.wallCap || '#565852', 0.06, 0.82), dark = material(theme.wallJoint || '#202321', 0.1, 0.8);
    const trim = material(theme.pillarTrim || '#7d653e', 0.5, 0.45);
    mesh(group, box, dark, 0, 0.05, 0, short * 0.8, 0.1, long * 0.86);
    mesh(group, box, stone, 0, 0.3, 0, short * 0.7, 0.42, long * 0.78);
    mesh(group, box, trim, 0, 0.51, 0, short * 0.74, 0.04, long * 0.82);
    mesh(group, box, stone, 0, 0.57, 0, short * 0.68, 0.09, long * 0.76);
    mesh(group, box, stone, 0, 0.64, 0, short * 0.46, 0.06, long * 0.6);
    for (const z of [-long * 0.18, long * 0.18]) mesh(group, box, trim, 0, 0.3, z, short * 0.72, 0.3, 0.035);
  }

  function altar(group, prop, theme) {
    const w = Number(prop.width) || 1, d = Number(prop.depth) || 1;
    const stone = material(theme.wallCap || '#565852', 0.06, 0.8), trim = material(theme.pillarTrim || '#7d653e', 0.5, 0.45);
    mesh(group, box, stone, 0, 0.12, 0, w - 0.08, 0.24, d - 0.08);
    mesh(group, box, stone, 0, 0.42, 0, w * 0.7, 0.36, d * 0.6);
    mesh(group, box, trim, 0, 0.63, 0, w * 0.76, 0.05, d * 0.66);
  }

  // Bell Court: cast-bronze sanctuary bell(s) suspended in a timber-and-iron belfry frame.
  function belfryBell(group, prop, theme) {
    const w = Number(prop.width) || 1, d = Number(prop.depth) || 1;
    const h = Math.max(1.05, Math.min(1.9, Number(prop.height) || 1.48));
    const stone = material(theme.wallCap || '#444056', 0.08, 0.82);
    const darkStone = material(theme.wallJoint || '#1c1828', 0.12, 0.86);
    const oak = timber('#523929'), iron = material('#282f34', 0.82, 0.36);
    const bronze = material('#b88b48', 0.86, 0.28), bronzeTrim = material('#dfb66d', 0.90, 0.24);
    const bellProfile = geometry('bell_body', () => new THREE.LatheGeometry([
      new THREE.Vector2(0.01, 0.98), new THREE.Vector2(0.32, 0.95), new THREE.Vector2(0.46, 0.78),
      new THREE.Vector2(0.54, 0.48), new THREE.Vector2(0.72, 0.18), new THREE.Vector2(0.95, 0.04),
      new THREE.Vector2(1.0, 0.0), new THREE.Vector2(0.84, 0.0), new THREE.Vector2(0.68, 0.15),
    ], 18));

    // Stepped stone belfry plinth
    mesh(group, box, darkStone, 0, 0.08, 0, w - 0.06, 0.16, d - 0.06);
    mesh(group, box, stone, 0, 0.22, 0, w - 0.22, 0.14, d - 0.22);

    // Timber uprights, iron collars, and heavy top yoke beam
    const span = Math.max(0.62, w - 0.34);
    const postH = h - 0.28;
    for (const sx of [-span / 2, span / 2]) {
      mesh(group, box, oak, sx, 0.28 + postH / 2, 0, 0.14, postH, 0.14);
      mesh(group, box, iron, sx, 0.36, 0, 0.16, 0.07, 0.16);
      mesh(group, box, iron, sx, h - 0.12, 0, 0.16, 0.07, 0.16);
    }
    mesh(group, box, oak, 0, h - 0.04, 0, span + 0.32, 0.14, 0.18);
    mesh(group, box, stone, 0, h + 0.06, 0, span + 0.42, 0.08, 0.28);

    // Hang 1 grand bell (width < 2.5) or 3 graduated bells across a wide belfry pier
    const slots = w >= 2.5 ? [[-0.78, 0.22, 0.42], [0, 0.33, 0.60], [0.78, 0.22, 0.42]] : [[0, 0.28, 0.52]];
    for (const [bx, rad, bh] of slots) {
      const topY = h - 0.12;
      mesh(group, box, iron, bx, topY - 0.05, 0, rad * 1.1, 0.07, 0.08);
      mesh(group, cylinder, iron, bx, topY - 0.12, 0, 0.045, 0.14, 0.045);
      mesh(group, bellProfile, bronze, bx, topY - 0.14 - bh, 0, rad, bh, rad);
      mesh(group, cylinder, bronzeTrim, bx, topY - 0.14 - bh * 0.22, 0, rad * 0.72, 0.035, rad * 0.72);
      mesh(group, sphere, iron, bx, topY - 0.14 - bh - 0.03, 0, 0.055, 0.055, 0.055);
    }
  }

  // Lantern Mine & Reed Lock: timber gallery post with hanging glowing iron lantern.
  function lanternPost(group, prop, theme, addLight) {
    const h = Math.max(0.95, Math.min(1.7, Number(prop.height) || 1.32));
    const stone = material(theme.wallCap || '#445863', 0.08, 0.86);
    const oak = timber('#593f2b'), iron = material('#252c30', 0.82, 0.36);
    const warmAmber = (theme.base || theme.id) === 'caverns' ? '#ffbe63' : (theme.torchColor || '#ffae4a');
    const coreColor = '#fff3cf';

    // Rough stone footing + timber beam + iron base collar
    mesh(group, box, stone, 0, 0.14, 0, 0.72, 0.28, 0.72);
    mesh(group, box, oak, -0.06, 0.26 + (h - 0.26) / 2, 0, 0.16, h - 0.26, 0.16);
    mesh(group, box, iron, -0.06, 0.34, 0, 0.19, 0.08, 0.19);
    // Horizontal cross-arm & diagonal strut
    mesh(group, box, oak, 0.12, h - 0.06, 0, 0.50, 0.10, 0.11);
    const strut = mesh(group, box, iron, 0.08, h - 0.20, 0, 0.28, 0.045, 0.045);
    strut.rotation.z = Math.PI / 4;
    // Hanging iron cage lantern
    const lx = 0.28, ly = h - 0.30;
    mesh(group, cylinder, iron, lx, h - 0.14, 0, 0.018, 0.14, 0.018);
    mesh(group, cone, iron, lx, ly + 0.13, 0, 0.14, 0.10, 0.14);
    mesh(group, cylinder, iron, lx, ly - 0.10, 0, 0.11, 0.04, 0.11);
    const glass = mesh(group, cylinder, glow(warmAmber, 0.94), lx, ly + 0.01, 0, 0.088, 0.17, 0.088);
    glass.castShadow = false; glass.userData.keep = true;
    const core = mesh(group, sphere, glow(coreColor, 0.98), lx, ly + 0.01, 0, 0.045, 0.065, 0.045);
    core.castShadow = false; core.userData.keep = true;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      mesh(group, cylinder, iron, lx + Math.cos(a) * 0.095, ly + 0.01, Math.sin(a) * 0.095, 0.012, 0.19, 0.012);
    }
    let pLight = null;
    if (addLight) {
      pLight = new THREE.PointLight(warmAmber, 5.4, 7.6, 1.9);
      pLight.position.set(lx, ly, 0);
      group.add(pLight);
    }
    torchFlames.push({ flame: core, light: pLight, baseY: ly + 0.01, baseScaleY: 0.065, baseIntensity: 5.4, phase: prop.x * 2.3 + prop.y * 1.7 });
  }

  // Lantern Mine: craggy uncut rock boulder studded with glowing mineral crystal veins.
  function oreVein(group, prop, theme) {
    const w = Number(prop.width) || 1, d = Number(prop.depth) || 1;
    const h = Math.max(0.75, Math.min(1.25, Number(prop.height) || 1.02));
    const rock = material('#26353e', 0.12, 0.92);
    const darkRock = material('#172229', 0.16, 0.94);
    const crystalHex = theme.crystalColor || '#4ce6ff';
    const crystalGlow = glow(crystalHex, 0.94);
    const crystalCore = glow('#e2fcff', 0.98);

    // Jagged multi-angled dark cavern boulder crags (reads as uncut rock seam, not a cube)
    const yaw = ((prop.x * 5 + prop.y * 7) % 6) * 0.42;
    const base = mesh(group, cone, darkRock, 0, h * 0.36, 0, Math.min(w, d) * 0.56, h * 0.72, Math.min(w, d) * 0.56);
    base.rotation.y = yaw;
    const cragA = mesh(group, box, rock, -w * 0.14, h * 0.32, d * 0.10, w * 0.56, h * 0.64, d * 0.52);
    cragA.rotation.set(0.12, yaw + 0.48, -0.10);
    const cragB = mesh(group, box, darkRock, w * 0.16, h * 0.28, -d * 0.14, w * 0.52, h * 0.54, d * 0.50);
    cragB.rotation.set(-0.14, yaw - 0.36, 0.12);
    const spire = mesh(group, cone, rock, w * 0.05, h * 0.74, -d * 0.04, Math.min(w, d) * 0.36, h * 0.54, Math.min(w, d) * 0.36);
    spire.rotation.set(0.08, yaw, -0.14);

    // Bold translucent glowing crystal ore clusters erupting from the rock cracks
    const shards = [
      [w * 0.18, h * 0.76, d * 0.12, 0.115, 0.68, 0.34, -0.20],
      [-w * 0.18, h * 0.70, -d * 0.14, 0.105, 0.60, -0.36, 0.24],
      [w * 0.02, h * 0.96, d * 0.02, 0.095, 0.58, 0.12, 0.14],
      [-w * 0.24, h * 0.46, d * 0.20, 0.085, 0.46, -0.48, -0.32],
      [w * 0.24, h * 0.44, -d * 0.20, 0.080, 0.44, 0.46, 0.28],
    ];
    for (const [sx, sy, sz, sr, sh, rz, rx] of shards) {
      const shMesh = mesh(group, cone, crystalGlow, sx, sy, sz, sr, sh, sr);
      shMesh.rotation.set(rx, 0, rz); shMesh.castShadow = false;
      const tip = mesh(group, cone, crystalCore, sx, sy + sh * 0.16, sz, sr * 0.46, sh * 0.50, sr * 0.46);
      tip.rotation.set(rx, 0, rz); tip.castShadow = false;
    }
  }

  // Reed Lock: mossy stone canal channel, dark shimmering water, timber sluice weir, and bankside reeds.
  function waterLock(group, prop, theme) {
    const w = Number(prop.width) || 2, d = Number(prop.depth) || 2;
    const h = Math.max(0.45, Math.min(1.15, Number(prop.height) || 0.78));
    const stone = material(theme.wallCap || '#485449', 0.08, 0.84);
    const mossStone = material('#3c5738', 0.06, 0.88);
    const oak = timber('#4d3827'), iron = material('#262d30', 0.78, 0.38);
    const wKey = 'water:lock';
    if (!materials.has(wKey)) materials.set(wKey, new THREE.MeshStandardMaterial({ color: '#1b585c', emissive: '#0e363a', emissiveIntensity: 0.75, metalness: 0.38, roughness: 0.12 }));
    const water = materials.get(wKey);
    const reedStem = material('#5d7d40', 0.04, 0.86), cattail = material('#6e462a', 0.04, 0.90);

    // Mossy stone coping curbs framing the west and east banks of the lock channel
    const curbW = 0.20;
    mesh(group, box, stone, -w / 2 + curbW / 2, 0.11, 0, curbW, 0.22, d - 0.04);
    mesh(group, box, stone, w / 2 - curbW / 2, 0.11, 0, curbW, 0.22, d - 0.04);
    mesh(group, box, mossStone, -w / 2 + curbW / 2, 0.23, 0, curbW + 0.04, 0.04, d - 0.06);
    mesh(group, box, mossStone, w / 2 - curbW / 2, 0.23, 0, curbW + 0.04, 0.04, d - 0.06);

    // Shimmering emerald-teal canal water surface recessed slightly between the curbs
    const surf = mesh(group, box, water, 0, 0.04, 0, Math.max(0.4, w - curbW * 1.8), 0.04, d - 0.06);
    surf.castShadow = false;

    // Central timber & stone sluice weir / dividing lock gate (tall when h >= 0.8 to signal sightline block)
    const gateThick = h >= 0.8 ? Math.min(0.42, d * 0.28) : 0.22;
    mesh(group, box, oak, 0, h * 0.50, 0, w - 0.16, h, gateThick);
    mesh(group, box, stone, 0, h + 0.04, 0, w - 0.08, 0.09, gateThick + 0.08);
    const ribs = Math.max(2, Math.round(w * 2));
    for (let i = 0; i < ribs; i++) {
      const rx = -w / 2 + 0.28 + (i + 0.5) * (w - 0.56) / ribs;
      mesh(group, box, iron, rx, h * 0.52, 0, 0.055, h + 0.08, gateThick + 0.05);
    }
    if (h >= 0.8) {
      for (const sz of [-d / 2 + 0.24, d / 2 - 0.24]) {
        mesh(group, box, stone, 0, h * 0.42, sz, w - 0.24, h * 0.84, 0.28);
      }
    }

    // Lush bankside reed & cattail tufts sprouting along both mossy coping edges
    const reedCount = Math.max(6, Math.round(d * 4));
    for (let i = 0; i < reedCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const rx = side * (w / 2 - 0.21) + (((i * 7) % 5) - 2) * 0.035;
      const rz = -d / 2 + 0.16 + ((i + 0.5) / reedCount) * (d - 0.32);
      const rh = 0.58 + (i % 3) * 0.16;
      const stalk = mesh(group, cylinder, reedStem, rx, 0.16 + rh / 2, rz, 0.026, rh, 0.026);
      stalk.rotation.z = side * -0.16; stalk.rotation.x = ((i % 3) - 1) * 0.11;
      if (i % 2 === 0) {
        const head = mesh(group, cylinder, cattail, rx - side * 0.05, 0.16 + rh * 0.88, rz, 0.046, 0.15, 0.046);
        head.rotation.z = side * -0.16;
      }
    }
  }

  // Split Kiln: vaulted basalt-and-brick furnace bank with glowing arched ember fireboxes & flue.
  function kilnFurnace(group, prop, theme, addLight) {
    const w = Number(prop.width) || 2, d = Number(prop.depth) || 2;
    const h = Math.max(0.95, Math.min(1.55, Number(prop.height) || 1.26));
    const brick = material('#523730', 0.10, 0.86);
    const soot = material('#241a18', 0.14, 0.90);
    const iron = material('#282a2d', 0.82, 0.38);
    const ember = glow('#ff5514', 0.94), core = glow('#ffda7a', 0.98);

    // Stepped basalt foundation + massive brick kiln body + vaulted top dome
    mesh(group, box, soot, 0, 0.08, 0, w - 0.06, 0.16, d - 0.06);
    mesh(group, box, brick, 0, 0.16 + (h * 0.62) / 2, 0, w - 0.14, h * 0.62, d - 0.14);
    mesh(group, box, soot, 0, 0.16 + h * 0.62 + 0.09, 0, w - 0.30, 0.18, d - 0.30);
    for (const sy of [0.34, 0.68]) {
      mesh(group, box, iron, 0, sy, 0, w - 0.10, 0.055, d - 0.10);
    }
    // Iron-banded chimney flue with glowing ember crown
    const flueH = Math.max(0.32, h * 0.34);
    const flueY = 0.16 + h * 0.62 + 0.14 + flueH / 2;
    mesh(group, cylinder, soot, 0, flueY, 0, 0.25, flueH, 0.25);
    mesh(group, cylinder, iron, 0, flueY + flueH * 0.44, 0, 0.29, 0.06, 0.29);
    const flueGlow = mesh(group, cylinder, ember, 0, flueY + flueH * 0.50, 0, 0.19, 0.06, 0.19);
    flueGlow.castShadow = false; flueGlow.userData.keep = true;
    const flueFlame = mesh(group, cone, core, 0, flueY + flueH * 0.62, 0, 0.11, 0.24, 0.11);
    flueFlame.castShadow = false; flueFlame.userData.keep = true;

    // Glowing barred ember fireboxes on both north (-Z) and south (+Z) kiln faces
    const mouths = w >= 2.5 ? [-0.62, 0.62] : [0];
    let mainGlow = flueFlame;
    for (const mx of mouths) {
      for (const side of [-1, 1]) {
        const mz = side * (d / 2 - 0.065);
        mesh(group, box, iron, mx, 0.40, mz, 0.54, 0.46, 0.05);
        const fb = mesh(group, box, ember, mx, 0.38, mz + side * 0.012, 0.44, 0.36, 0.03);
        fb.castShadow = false; fb.userData.keep = true;
        const fc = mesh(group, box, core, mx, 0.32, mz + side * 0.020, 0.30, 0.20, 0.02);
        fc.castShadow = false; fc.userData.keep = true;
        for (const gx of [-0.12, 0, 0.12]) {
          mesh(group, box, iron, mx + gx, 0.38, mz + side * 0.028, 0.028, 0.36, 0.024);
        }
      }
    }
    let pLight = null;
    if (addLight) {
      pLight = new THREE.PointLight('#ff6a22', 6.0, 8.4, 1.9);
      pLight.position.set(0, 0.65, d / 2 + 0.35);
      group.add(pLight);
    }
    torchFlames.push({ flame: mainGlow, light: pLight, baseY: flueY + flueH * 0.62, baseScaleY: 0.24, baseIntensity: 6.0, phase: prop.x * 1.7 + prop.y * 2.9 });
  }

  // A lancet window on the floor-facing side of a wall cell: an emissive pane.
  function stainedGlass(prop, theme, wallH) {
    const facing = { s: [0, 0.5, 0], n: [0, -0.5, Math.PI], e: [0.5, 0, -Math.PI / 2], w: [-0.5, 0, Math.PI / 2] }[prop.facing || 's'];
    const key = `glass:${theme.id}`;
    if (!materials.has(key)) {
      const procedural = makeTexture((ctx, w, h) => {
        ctx.fillStyle = '#05030a'; ctx.fillRect(0, 0, w, h);
        ctx.save(); ctx.beginPath(); ctx.moveTo(w * 0.2, h); ctx.lineTo(w * 0.2, h * 0.32);
        ctx.quadraticCurveTo(w * 0.2, h * 0.05, w * 0.5, h * 0.02); ctx.quadraticCurveTo(w * 0.8, h * 0.05, w * 0.8, h * 0.32);
        ctx.lineTo(w * 0.8, h); ctx.closePath(); ctx.clip();
        const colours = ['#7d3cff', '#c47bff', '#ffb347', '#5a2bb8', '#e0a0ff'];
        for (let i = 0; i < 42; i++) {
          ctx.fillStyle = colours[i % colours.length];
          ctx.fillRect(w * 0.2 + (i % 6) * w * 0.1, (Math.floor(i / 6)) * h * 0.14, w * 0.1, h * 0.14);
        }
        ctx.strokeStyle = '#120a18'; ctx.lineWidth = 5;
        for (let x = 0.2; x <= 0.8; x += 0.1) { ctx.beginPath(); ctx.moveTo(w * x, 0); ctx.lineTo(w * x, h); ctx.stroke(); }
        for (let y = 0; y <= 1; y += 0.14) { ctx.beginPath(); ctx.moveTo(0, h * y); ctx.lineTo(w, h * y); ctx.stroke(); }
        ctx.restore();
      }, 128, 256);
      materials.set(key, new THREE.MeshBasicMaterial({ map: procedural, transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
      if (theme.textures?.window) {
        loadTexture(theme.textures.window, { srgb: true, repeat: false }).then(texture => {
          if (!texture || disposed) { texture?.dispose(); return; }
          textures.add(texture);
          const mat = materials.get(key);
          if (mat) { mat.map = texture; mat.needsUpdate = true; requestRender(); }
        });
      }
    }
    // Sized to the interior wall (at most 0.86 high), not the map's nominal wall height.
    const paneH = Math.min(wallH, 0.86) * 0.92;
    const pane = mesh(board, planeGeometry, materials.get(key), prop.x + facing[0] * 1.002, 0.06 + paneH / 2, prop.y + facing[1] * 1.002,
      0.62, paneH, 1);
    pane.rotation.y = facing[2]; pane.castShadow = false; pane.receiveShadow = false;
  }

  function placePropModel(group, prop, kind) {
    loadPropModel(PROP_MODELS[kind]).then(template => {
      if (!template || disposed || !group.parent) return;
      const procedural = [...group.children];
      const model = template.clone(true);
      model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
      const span = Math.max(Number(prop.width) || 1, Number(prop.depth) || 1);
      if (kind === 'sarcophagus') {
        // Authored 1 x 2 squares along +Z; a 2 x 1 prop is the group's rotation.
        model.scale.setScalar(Math.min(1, span / 2));
      }
      group.add(model);
      for (const child of procedural) if (!(child.isLight) && child.userData.keep !== true) child.visible = false;
      renderer.shadowMap.needsUpdate = true;
      requestRender();
    });
  }

  function buildBoard(map) {
    clearMotes();
    clearGroup(board);
    torchFlames.length = 0;
    width = Number(map.width) || 10; height = Number(map.height) || 8;
    const cx = (width - 1) / 2, cz = (height - 1) / 2;

    const theme = resolveTheme(map, biomeOverride);
    activeThemeId = theme.id;
    scene.background.set(theme.bg);
    scene.fog.color.set(theme.fog);
    hemiLight.color.set(theme.hemiSky);
    hemiLight.groundColor.set(theme.hemiGround);
    keyLight.color.set(theme.keyColor);
    fillLight.color.set(theme.fillColor);

    // Diorama stone plinth & forged bronze/iron bezel
    mesh(board, box, material(theme.slab, 0.12, 0.88), cx, -0.42, cz, width + 0.46, 0.64, height + 0.46);
    mesh(board, box, material(theme.rim, 0.78, 0.34), cx, -0.155, cz, width + 0.22, 0.078, height + 0.22);
    mesh(board, box, material(theme.frame, 0.24, 0.76), cx, -0.09, cz, width + 0.10, 0.12, height + 0.10);

    const floorMat = buildThemeFloorMaterial(theme, renderer, textures, materials);
    const wallMat = buildThemeWallMaterial(theme, renderer, textures, materials);
    const altKey = `pbr-floor-alt:${theme.id}`;
    if (!materials.has(altKey)) materials.set(altKey, floorMat.clone());
    const floorAltMat = materials.get(altKey);
    const capKey = `pbr-cap:${theme.id}`;
    if (!materials.has(capKey)) {
      materials.set(capKey, new THREE.MeshStandardMaterial({
        map: wallMat.map,
        bumpMap: wallMat.bumpMap,
        bumpScale: 0.038,
        color: new THREE.Color('#c8c4bc'),
        roughness: 0.78,
        metalness: 0.08,
      }));
    }
    const wallCapMat = materials.get(capKey);
    // Image texture sets (when the theme has them) replace the procedural maps once loaded.
    if (theme.textures && !materials.has(`textured:${theme.id}`)) {
      materials.set(`textured:${theme.id}`, new THREE.MeshBasicMaterial());
      const track = t => textures.add(t);
      const anisotropy = Math.min(tier === 'low' ? 2 : 8, renderer.capabilities.getMaxAnisotropy());
      Promise.all([
        applyTextureSet(floorMat, theme.textures.floor, track, { anisotropy }),
        applyTextureSet(floorAltMat, theme.textures.floorAlt || theme.textures.floor, track, { anisotropy }),
        applyTextureSet(wallMat, theme.textures.wall, track, { anisotropy }),
      ]).then(() => { if (!disposed) { renderer.shadowMap.needsUpdate = true; requestRender(); } });
    }

    const chasm = new Set((map.scene?.chasm || []).map(([x, y]) => `${x},${y}`));
    const tint = new THREE.Color();
    const floorCells = [], altCells = [], dimCells = [], darkCells = [];
    const dimSet = new Set();
    const isWoodland = (theme.base || theme.id) === 'woodland';
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (chasm.has(`${x},${y}`)) continue;
      const ch = map.tiles?.[y]?.[x] || '.';
      if (ch === 'd') { dimCells.push([x, y]); dimSet.add(`${x},${y}`); }
      else if (ch === 'D') { darkCells.push([x, y]); dimSet.add(`${x},${y}`); }
      const alt = theme.textures?.floorAlt && ((x * 7 + y * 13) % 8 === 3) && !blocked(map, x, y);
      (alt ? altCells : floorCells).push([x, y]);
    }
    for (const [cells, mat] of [[floorCells, floorMat], [altCells, floorAltMat]]) {
      if (!cells.length) continue;
      const floor = new THREE.InstancedMesh(box, mat, cells.length);
      cells.forEach(([x, y], index) => {
        scratch.position.set(x, -0.015, y);
        scratch.scale.set(0.976, 0.09, 0.976);
        scratch.rotation.set(0, mat === floorMat ? ((x * 7 + y * 3) % 4) * Math.PI / 2 : 0, 0);
        scratch.updateMatrix(); floor.setMatrixAt(index, scratch.matrix);
        const l = 0.90 + ((x * 13 + y * 7) % 5) * 0.042;
        const ch = map.tiles?.[y]?.[x] || '.';
        if (ch === 'd') {
          tint.setRGB(l * 0.44, l * 0.52, l * 0.68);
        } else if (ch === 'D') {
          tint.setRGB(l * 0.26, l * 0.30, l * 0.44);
        } else if (isWoodland) {
          tint.setRGB(l * 1.04, l * 1.04, l * 0.95);
        } else {
          tint.setRGB(l, l, l * ((theme.base || theme.id) === 'caverns' ? 1.04 : 0.99));
        }
        floor.setColorAt(index, tint);
      });
      floor.receiveShadow = true;
      board.add(floor);
    }
    // Readable dim-light ('d') and dark ('D') canopy-shade overlays & twilight boundary edges
    // Placed at y = 0.032..0.035, cleanly below unit plinths (0.04+) and move highlights (0.058).
    if (dimCells.length) {
      const dimShadeMat = new THREE.MeshBasicMaterial({ color: '#0c1c30', transparent: true, opacity: 0.28, depthWrite: false });
      const dimInst = new THREE.InstancedMesh(planeGeometry, dimShadeMat, dimCells.length);
      dimCells.forEach(([x, y], i) => {
        scratch.position.set(x, 0.032, y); scratch.scale.set(0.985, 0.985, 1); scratch.rotation.set(-Math.PI / 2, 0, 0);
        scratch.updateMatrix(); dimInst.setMatrixAt(i, scratch.matrix);
      });
      dimInst.castShadow = false; dimInst.receiveShadow = false; board.add(dimInst);
    }
    if (darkCells.length) {
      const darkShadeMat = new THREE.MeshBasicMaterial({ color: '#050b18', transparent: true, opacity: 0.48, depthWrite: false });
      const darkInst = new THREE.InstancedMesh(planeGeometry, darkShadeMat, darkCells.length);
      darkCells.forEach(([x, y], i) => {
        scratch.position.set(x, 0.032, y); scratch.scale.set(0.985, 0.985, 1); scratch.rotation.set(-Math.PI / 2, 0, 0);
        scratch.updateMatrix(); darkInst.setMatrixAt(i, scratch.matrix);
      });
      darkInst.castShadow = false; darkInst.receiveShadow = false; board.add(darkInst);
    }
    if (dimSet.size) {
      const edges = [];
      for (const key of dimSet) {
        const [x, y] = key.split(',').map(Number);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const nch = map.tiles?.[ny]?.[nx] || '.';
          if (nch === '.') {
            edges.push([x + dx * 0.465, 0.035, y + dy * 0.465, dx !== 0 ? 0.068 : 0.96, 1, dy !== 0 ? 0.068 : 0.96]);
          }
        }
      }
      if (edges.length) {
        const edgeMat = glow('#85b6db', 0.58);
        const edgeInst = new THREE.InstancedMesh(planeGeometry, edgeMat, edges.length);
        edges.forEach(([ex, ey, ez, sx, _, sz], i) => {
          scratch.position.set(ex, ey, ez); scratch.scale.set(sx, sz, 1); scratch.rotation.set(-Math.PI / 2, 0, 0);
          scratch.updateMatrix(); edgeInst.setMatrixAt(i, scratch.matrix);
        });
        edgeInst.castShadow = false; edgeInst.receiveShadow = false; board.add(edgeInst);
      }
    }
    if (chasm.size) {
      // The chasm: a dark pit with a faint violet glow at its rim.
      const pit = [...chasm].map(k => k.split(',').map(Number));
      instanced(box, material('#050308', 0, 1), pit.map(([x, y]) => [x, -0.62, y, 1.0, 0.1, 1.0]), false);
      const glowMat = glow(theme.torchColor || '#8c3dff', 0.16);
      const rims = pit.filter(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !chasm.has(`${x + dx},${y + dy}`) && !blocked(map, x + dx, y + dy)));
      instanced(box, glowMat, rims.map(([x, y]) => [x, -0.3, y, 0.98, 0.5, 0.98]), false);
    }

    const props = (map.scene?.props || []).filter(p => PROP_KINDS.has(p.kind));
    const replacements = new Set();
    for (const prop of props) if (prop.kind !== 'rug' && prop.kind !== 'stained_glass') {
      for (let dy = 0; dy < (prop.depth || 1); dy++) for (let dx = 0; dx < (prop.width || 1); dx++) replacements.add(`${prop.x + dx},${prop.y + dy}`);
    }

    // Real 3D oak trees on every 'T' cell (works on any theme, shines on woodland!)
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (isTree(map, x, y) && !replacements.has(`${x},${y}`) && !chasm.has(`${x},${y}`)) {
        addTree(x, y);
      }
    }

    const wallHeight = Math.max(0.25, Math.min(1.6, Number(map.scene?.wall_height) || 1.1));
    const interiorWalls = [], wallBodies = [], wallCaps = [], wallJoints = [];
    const crystals = [];
    if (isWoodland) {
      buildWoodlandObstacles(map, theme, wallMat, replacements, chasm, interiorWalls);
    } else {
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        if (!isWall(map, x, y) || replacements.has(`${x},${y}`) || chasm.has(`${x},${y}`)) continue;
        const rim = x === 0 || y === 0 || x === width - 1 || y === height - 1;
        const jitter = ['caverns', 'catacombs'].includes(theme.base || theme.id) && !rim ? (((x * 17 + y * 31) % 5) - 2) * 0.045 : 0;
        const h = (rim ? Math.min(wallHeight, 0.42) : Math.min(wallHeight, 0.86)) + jitter;
        wallBodies.push([x, h / 2 + 0.04, y, 0.978, h, 0.978]);
        wallCaps.push([x, h + 0.075, y, 1.018, 0.095, 1.018]);
        if (!rim) {
          wallJoints.push([x, 0.07, y, 1.022, 0.07, 1.022]);
          const adjFloor = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !blocked(map, x + dx, y + dy));
          if (adjFloor) interiorWalls.push({ x, y, h });
        }
        if (theme.crystalColor && rim && ((x * 11 + y * 23) % 11 === 0)) crystals.push([x + 0.15, h + 0.21, y - 0.1]);
      }
      // One instanced mesh per wall part: large hand-made rooms stay a handful of draw calls.
      instanced(box, wallMat, wallBodies);
      instanced(box, wallCapMat, wallCaps);
      instanced(box, material(theme.wallJoint, 0.14, 0.86), wallJoints);
      for (const [x, y, z] of crystals) {
        const cr = mesh(board, cone, glow(theme.crystalColor, 0.88), x, y, z, 0.075, 0.26, 0.075);
        cr.rotation.z = 0.22; cr.castShadow = false;
      }
    }

    const fc = flameColorsForTheme(theme);
    let lights = 0;
    for (const prop of props) {
      if (prop.kind === 'stained_glass') { stainedGlass(prop, theme, wallHeight); continue; }
      const group = new THREE.Group();
      group.userData.mapProp = { ...prop };
      const object = objectForProp(prop, state.objects);
      if (object) {
        group.userData.objectId = object.id;
        group.userData.objectState = { ...object };
        group.visible = !object.destroyed;
      }
      group.position.set(prop.x + ((prop.width || 1) - 1) / 2, 0.04, prop.y + ((prop.depth || 1) - 1) / 2);
      board.add(group);
      if (prop.kind === 'pillar') {
        const h = Math.max(0.7, Math.min(2.1, Number(prop.height) || wallHeight + 0.26));
        mesh(group, box, wallCapMat, 0, 0.1, 0, 0.88, 0.2, 0.88);
        mesh(group, cylinder, wallMat, 0, h / 2, 0, 0.29, h - 0.15, 0.29);
        for (let j = 1; j < 4; j++) mesh(group, cylinder, material(theme.pillarTrim, 0.45, 0.52), 0, j * h / 4, 0, 0.306, 0.038, 0.306);
        mesh(group, box, wallCapMat, 0, h - 0.02, 0, 0.8, 0.17, 0.8);
      } else if (prop.kind === 'brazier') {
        const h = Math.max(0.4, Math.min(1.1, Number(prop.height) || 0.65));
        mesh(group, box, material(theme.wallJoint, 0.16, 0.82), 0, 0.1, 0, 0.68, 0.2, 0.68);
        mesh(group, cylinder, material('#282f33', 0.78, 0.40), 0, h / 2, 0, 0.1, h - 0.12, 0.1);
        mesh(group, robe, material('#7d5e36', 0.80, 0.36), 0, h, 0, 0.32, 0.18, 0.32).rotation.z = Math.PI;
        const ember = mesh(group, sphere, glow(fc.ember), 0, h + 0.1, 0, 0.21, 0.09, 0.21);
        const flame = mesh(group, cone, glow(fc.outer), -0.02, h + 0.27, 0, 0.15, 0.44, 0.15);
        flame.castShadow = false;
        ember.userData.keep = true; flame.userData.keep = true;
        let pLight = null;
        if (lights++ < 3) {
          pLight = new THREE.PointLight(theme.torchColor, 5.2, 7.2, 2);
          pLight.position.set(0, h + 0.42, 0);
          group.add(pLight);
        }
        torchFlames.push({ flame, light: pLight, baseY: h + 0.27, baseScaleY: 0.44, baseIntensity: 5.2, phase: prop.x * 1.9 + prop.y * 2.7 });
        if (theme.flame) placePropModel(group, prop, 'brazier');
      } else if (prop.kind === 'sarcophagus') {
        sarcophagus(group, prop, theme);
        placePropModel(group, prop, 'sarcophagus');
      } else if (prop.kind === 'altar') {
        altar(group, prop, theme);
      } else if (prop.kind === 'bell') {
        belfryBell(group, prop, theme);
      } else if (prop.kind === 'lantern_post') {
        lanternPost(group, prop, theme, lights++ < 3);
      } else if (prop.kind === 'ore_vein') {
        oreVein(group, prop, theme);
      } else if (prop.kind === 'water_lock') {
        waterLock(group, prop, theme);
      } else if (prop.kind === 'kiln') {
        kilnFurnace(group, prop, theme, lights++ < 3);
      } else {
        furnish(group, prop);
      }
      if (!['brazier', 'table', 'sarcophagus', 'lantern_post', 'kiln'].includes(prop.kind)) batchProp(group);
      if (object) group.traverse(child => { child.userData.objectId = object.id; });
    }

    if (!props.some(p => ['brazier', 'lantern_post', 'kiln'].includes(p.kind))) {
      const candidates = interiorWalls.length ? interiorWalls : [
        { x: 0, y: 0, h: 0.42 }, { x: width - 1, y: 0, h: 0.42 },
        { x: 0, y: height - 1, h: 0.42 }, { x: width - 1, y: height - 1, h: 0.42 },
      ];
      const chosen = [];
      const minSep = Math.max(4, Math.hypot(width, height) * 0.28);
      for (let i = 0; i < candidates.length && chosen.length < 4; i++) {
        const c = candidates[(i * 7 + 3) % candidates.length];
        if (chosen.every(o => Math.hypot(c.x - o.x, c.y - o.y) >= minSep)) {
          chosen.push(c);
          if (isWoodland) addWoodlandLantern(c.x, c.y, c.h, theme, lights++ < 3);
          else addDungeonSconce(c.x, c.y, c.h, theme, lights++ < 3);
        }
      }
    }

    spawnThemeMotes(theme);

    keyLight.target.position.set(cx, 0, cz);
    const shadowSpan = Math.hypot(width, height) / 2 + 2.5;
    Object.assign(keyLight.shadow.camera, { left: -shadowSpan, right: shadowSpan, top: shadowSpan, bottom: -shadowSpan, far: 65 });
    keyLight.shadow.camera.updateProjectionMatrix();
    keyLight.position.set(cx - 6.5, 13.5, cz + 5.5);
    fillLight.position.set(cx + 7.5, 5.5, cz - 6.5);
  }

  function spawnStepPuff(x, z) {
    if (reducedMotion || stepPuffs.length > 18) return;
    const m = new THREE.MeshBasicMaterial({ color: '#b7b3a4', transparent: true, opacity: 0.42, depthWrite: false });
    const s = new THREE.Mesh(sphere, m);
    s.position.set(x + (Math.sin(x * 12 + z * 7) * 0.12), 0.09, z + (Math.cos(x * 9 - z * 5) * 0.12));
    s.scale.setScalar(0.06);
    dustGroup.add(s);
    stepPuffs.push({ mesh: s, mat: m, born: performance.now() });
  }

  function labelHeight(unit) {
    const ck = resolveCastKey(unit);
    return ck ? (ck === 'goblin' ? 1.38 : ck === 'goblin_boss' ? 1.48 : 1.66) : 1.56;
  }

  function label(unit, y = labelHeight(unit)) {
    const conditions = (unit.conditions || []).filter(c => !['dead', 'unconscious'].includes(c));
    const condCount = new Set([...conditions, ...(unit.marks || [])].filter(Boolean)).size;
    const texture = makeTexture((ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(11, 20, 24, 0.88)';
      ctx.beginPath(); ctx.roundRect(4, 4, w - 8, h - 8, 16); ctx.fill();
      ctx.strokeStyle = unit.active && unit.alive ? '#ffdb86' : unit.team === 'heroes' ? '#62c4be' : '#d68265';
      ctx.lineWidth = unit.active && unit.alive ? 3.5 : 2.5;
      ctx.stroke();

      ctx.fillStyle = '#f6efe0';
      ctx.font = '700 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      const raw = String(unit.name || unit.id), displayName = raw.length > 24 ? `${raw.slice(0, 23)}…` : raw;
      ctx.fillText(displayName, 16, 33, w - 84);

      const vital = unit.team === 'heroes' && unit.alive === false ? unit.vital : null;
      if (vital) {
        // A hero at 0 HP: Dying with its death-save tally (successes green, failures red),
        // Stable, or Dead, in place of the hit points and their bar.
        const tone = vital.state === 'dying' ? '#ff6a58' : vital.state === 'stable' ? '#6fe0cd' : '#a7a29a';
        ctx.fillStyle = tone;
        ctx.font = '800 19px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(vital.state === 'dying' ? 'DYING' : vital.state === 'stable' ? 'STABLE' : 'DEAD', w - 15, 33);
        if (vital.state === 'dying') {
          const pip = (x, on, color) => {
            ctx.beginPath(); ctx.arc(x, 48, 5.5, 0, Math.PI * 2);
            if (on) { ctx.fillStyle = color; ctx.fill(); }
            ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
          };
          for (let i = 0; i < 3; i++) pip(24 + i * 17, i < (vital.saves || 0), '#62d99a');
          for (let i = 0; i < 3; i++) pip(w - 58 + i * 17, i < (vital.fails || 0), '#ff5a4a');
          ctx.fillStyle = '#d9d0c0'; ctx.font = '600 13px system-ui, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('death saves', w / 2, 53);
        } else {
          ctx.fillStyle = '#25353a';
          ctx.beginPath(); ctx.roundRect(15, 44, w - 30, 8, 4); ctx.fill();
        }
        return;
      }

      ctx.fillStyle = '#b9d2cd';
      ctx.font = '600 19px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.max(0, unit.hp)}/${unit.max_hp}`, w - 15, 33);

      // HP Track
      ctx.fillStyle = '#25353a';
      ctx.beginPath(); ctx.roundRect(15, 44, w - 30, 8, 4); ctx.fill();
      const ratio = Math.max(0, Math.min(1, unit.hp / Math.max(1, unit.max_hp)));
      ctx.fillStyle = unit.team === 'heroes'
        ? (ratio > 0.4 ? '#4ad4b2' : '#f29d52')
        : (ratio > 0.4 ? '#eb7a65' : '#d94e4e');
      if (ratio > 0) {
        ctx.beginPath(); ctx.roundRect(15, 44, Math.max(8, (w - 30) * ratio), 8, 4); ctx.fill();
      }
      if (condCount > 0) {
        ctx.fillStyle = '#ffd966';
        for (let i = 0; i < Math.min(4, condCount); i++) {
          ctx.beginPath(); ctx.arc(w - 18 - i * 10, 13, 3.2, 0, Math.PI * 2); ctx.fill();
        }
      }
    }, 240, 64);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.renderOrder = 15;
    sprite.scale.set(0.92, 0.245, 1);
    sprite.position.set(0, y, 0);
    sprite.userData.unitId = unit.id;
    sprite.userData.baseY = y;
    return sprite;
  }

  function removeLabel(sprite) {
    if (!sprite) return;
    textures.delete(sprite.material.map);
    sprite.material.map.dispose();
    sprite.material.dispose();
    sprite.removeFromParent();
  }

  // Screen-space smart vertical de-overlapping so melee clusters NEVER cover faces or stack on top of each other!
  function deoverlapLabels() {
    if (!canvas.clientHeight || !canvas.clientWidth) return;
    camera.updateMatrixWorld();
    const visible = [];
    for (const entry of units.values()) {
      const sp = entry.name;
      if (!sp) continue;
      if (labelMode === 'off' || (!entry.data.alive && entry.data.team === 'monsters' && entry.castKey)) {
        sp.visible = false;
        continue;
      }
      sp.visible = labelMode !== 'minimal' || Boolean(entry.data.active || entry.data.id === inspectedId || entry.data.vital?.state === 'dying');
      if (!sp.visible) continue;
      const baseY = entry.data.alive ? entry.labelY : 0.66;
      projection.set(entry.root.position.x, baseY, entry.root.position.z).project(camera);
      const sx = (projection.x + 1) * canvas.clientWidth * 0.5;
      const sy = (1 - projection.y) * canvas.clientHeight * 0.5;
      const dist = camera.position.distanceTo(entry.root.position);
      visible.push({ entry, sp, baseY, sx, sy, adjY: sy, dist });
    }
    // Sort back-to-front by screen Y (lower on screen = closer to viewer)
    visible.sort((a, b) => b.sy - a.sy);
    for (let i = 0; i < visible.length; i++) {
      const cur = visible[i];
      for (let j = 0; j < i; j++) {
        const prev = visible[j];
        if (Math.abs(cur.sx - prev.sx) < 76 && Math.abs(cur.adjY - prev.adjY) < 25) {
          cur.adjY = prev.adjY - 26;
        }
      }
      const pixelLift = Math.min(72, Math.max(0, cur.sy - cur.adjY));
      const worldPerPx = (2 * cur.dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / Math.max(1, canvas.clientHeight);
      spLift(cur.sp, cur.baseY + pixelLift * worldPerPx, cur.dist);
    }
  }

  function spLift(sp, targetY, dist) {
    sp.position.y += (targetY - sp.position.y) * 0.35;
    const s = Math.max(0.36, Math.min(1.42, dist / 15.0));
    sp.scale.set(0.92 * s, 0.245 * s, 1);
  }

  const forceWeapons = new Map();
  const MARKS = {
    guiding_bolt: (root, unit) => {
      const g = new THREE.Group(); g.name = 'mark-guiding_bolt'; root.add(g);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#ffd75e', 0.9), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      mesh(g, geometry('mark-star', () => new THREE.OctahedronGeometry(1)), glow('#ffe27a', 0.95), 0, 1.18 * (unit.model?.scale || 1) + 0.25, 0, 0.07, 0.13, 0.07);
      return g;
    },
    bless: (root, unit) => {
      const g = new THREE.Group(); g.name = 'mark-bless'; root.add(g);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#ffe27a', 0.85), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      mesh(g, geometry('mark-halo', () => new THREE.TorusGeometry(0.2, 0.02, 6, 28)), glow('#fff0a8', 0.9), 0, 1.22 * (unit.model?.scale || 1) + 0.28, 0).rotation.x = -Math.PI / 2;
      return g;
    },
    aid: root => {
      const g = new THREE.Group(); g.name = 'mark-aid'; root.add(g);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#8dffa8', 0.85), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      mesh(g, box, glow('#8dffa8', 0.95), 0, 0.14, 0, 0.1, 0.03, 0.03);
      mesh(g, box, glow('#8dffa8', 0.95), 0, 0.14, 0, 0.03, 0.1, 0.03);
      return g;
    },
    shield_of_faith: (root, unit) => {
      const g = new THREE.Group(); g.name = 'mark-shield_of_faith'; root.add(g);
      mesh(g, sphere, glow('#7fb8ff', 0.18), 0, 0.62 * (unit.model?.scale || 1), 0, 0.52, 0.7, 0.52);
      return g;
    },
    sanctuary: (root, unit) => {
      const g = new THREE.Group(); g.name = 'mark-sanctuary'; root.add(g);
      mesh(g, sphere, glow('#f4f0ff', 0.2), 0, 0.5 * (unit.model?.scale || 1), 0, 0.62, 0.8, 0.62);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#ffffff', 0.8), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      // A pale ward sigil over the head: readable from any angle, unlike the faint dome.
      mesh(g, geometry('mark-ward-sigil', () => new THREE.TorusGeometry(0.12, 0.022, 6, 24)), glow('#e6dcff', 0.95), 0, 1.22 * (unit.model?.scale || 1) + 0.42, 0);
      mesh(g, geometry('mark-star', () => new THREE.OctahedronGeometry(1)), glow('#ffffff', 0.95), 0, 1.22 * (unit.model?.scale || 1) + 0.42, 0, 0.05, 0.05, 0.05);
      return g;
    },
    protection: root => {
      const g = new THREE.Group(); g.name = 'mark-protection'; root.add(g);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#fff0b0', 0.95), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      for (let i = 0; i < 4; i++) mesh(g, box, glow('#fff0b0', 0.8), 0, 0.13, 0, 0.03, 0.01, 0.9).rotation.y = i * Math.PI / 4;
      return g;
    },
    blur: (root, unit) => {
      const g = new THREE.Group(); g.name = 'mark-blur'; root.add(g);
      for (const dx of [-0.16, 0.16]) mesh(g, sphere, glow('#bcd8ff', 0.18), dx, 0.62 * (unit.model?.scale || 1), 0, 0.2, 0.45, 0.2);
      return g;
    },
    innate_sorcery: root => {
      const g = new THREE.Group(); g.name = 'mark-innate_sorcery'; root.add(g);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; mesh(g, cone, glow(i % 2 ? '#ffb347' : '#ff7a3c', 0.85), Math.cos(a) * 0.42, 0.3, Math.sin(a) * 0.42, 0.06, 0.4, 0.06); }
      return g;
    },
    paralyzed: (root, unit) => {
      const g = new THREE.Group(); g.name = 'mark-paralyzed'; root.add(g);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#ffe27a', 0.9), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; mesh(g, geometry('mark-star', () => new THREE.OctahedronGeometry(1)), glow('#fff0a0', 0.95), Math.cos(a) * 0.3, 1.15 * (unit.model?.scale || 1) + 0.2, Math.sin(a) * 0.3, 0.05, 0.09, 0.03); }
      return g;
    },
    poisoned: (root, unit) => {
      const g = new THREE.Group(); g.name = 'mark-poisoned'; root.add(g);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#8fd36a', 0.85), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      for (let i = 0; i < 5; i++) mesh(g, sphere, glow(i % 2 ? '#8fd36a' : '#c7f59a', 0.8), Math.cos(i * 2.2) * 0.25, 0.7 * (unit.model?.scale || 1) + i * 0.16, Math.sin(i * 2.2) * 0.25, 0.045, 0.045, 0.045);
      return g;
    },
    frightened: (root, unit) => {
      const g = new THREE.Group(); g.name = 'mark-frightened'; root.add(g);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#a8c8ff', 0.85), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      for (const x of [-0.14, 0.14]) mesh(g, cone, glow('#d8e6ff', 0.9), x, 1.2 * (unit.model?.scale || 1) + 0.15, 0, 0.04, 0.2, 0.04).rotation.z = Math.PI;
      return g;
    },
    cursed: (root, unit) => {
      // The Rotting Fist's curse: no healing. A dark green ring and drifting motes.
      const g = new THREE.Group(); g.name = 'mark-cursed'; root.add(g);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#5f8f3a', 0.9), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      for (let i = 0; i < 4; i++) mesh(g, sphere, glow(i % 2 ? '#3d5c25' : '#9bd16a', 0.75), Math.cos(i * 1.6) * 0.3, 0.45 * (unit.model?.scale || 1) + i * 0.2, Math.sin(i * 1.6) * 0.3, 0.05, 0.05, 0.05);
      return g;
    },
    stench: root => {
      const g = new THREE.Group(); g.name = 'mark-stench'; root.add(g);
      mesh(g, sphere, glow('#8fb84a', 0.16), 0, 0.35, 0, 1.15, 0.5, 1.15);
      return g;
    },
    strength_drain: root => {
      const g = new THREE.Group(); g.name = 'mark-strength_drain'; root.add(g);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#d24a4a', 0.9), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      for (let i = 0; i < 3; i++) { const chevron = mesh(g, cone, glow('#e86a6a', 0.95), 0.34, 0.3 + i * 0.22, 0, 0.07, 0.14, 0.07); chevron.rotation.z = Math.PI; chevron.name = 'mark-chev'; }
      return g;
    },
    slowed: (root, unit) => {
      const g = new THREE.Group(); g.name = 'mark-slowed'; root.add(g);
      mesh(g, geometry('mark-ring', () => new THREE.TorusGeometry(0.46, 0.028, 6, 36)), glow('#8fd8ff', 0.9), 0, 0.12, 0).rotation.x = -Math.PI / 2;
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3, crystal = mesh(g, cone, glow('#c9eeff', 0.9), Math.cos(a) * 0.42, 0.22, Math.sin(a) * 0.42, 0.045, 0.3, 0.045);
        crystal.rotation.z = Math.cos(a) * 0.35; crystal.rotation.x = -Math.sin(a) * 0.35;
      }
      mesh(g, geometry('mark-flake', () => new THREE.OctahedronGeometry(1)), glow('#e6f7ff', 0.95), 0, 1.05 * (unit.model?.scale || 1) + 0.25, 0, 0.07, 0.07, 0.07);
      return g;
    },
  };

  function makeUnit(unit) {
    const known = ['fighter', 'mage', 'goblin', 'skeleton'], base = unit.model?.base || unit.kind;
    const fallbackKind = known.includes(base) ? base : (unit.team === 'heroes' ? 'fighter' : 'goblin');
    const root = new THREE.Group(); figures.add(root);
    root.position.set(unit.x, 0.04, unit.y);
    root.userData.unitId = unit.id;
    root.userData.unitKind = unit.kind;

    const body = new THREE.Group(); root.add(body);
    body.rotation.y = unit.team === 'heroes' ? -1.57 : 1.57;

    const ownMaterials = [];
    ring(root, planeGeometry, contactMaterial, 0.002).scale.set(0.97, 0.97, 1);
    const plinth = mesh(root, cylinder, material(unit.team === 'heroes' ? '#255a61' : '#6e493a', 0.25, 0.65), 0, 0.055, 0, 0.365, 0.09, 0.365);
    plinth.userData.unitId = unit.id;
    ring(root, ringGeometry, glow(unit.team === 'heroes' ? '#6bd4cf' : '#e09a70'), 0.105).scale.setScalar(0.86);
    const active = ring(root, activeGeometry, glow('#ffdb86'), 0.023); active.visible = false;
    const target = ring(root, geometry('target-ring', () => new THREE.RingGeometry(0.49, 0.54, 48)), glow('#fa856e'), 0.026); target.visible = false;
    const inspect = ring(root, geometry('inspect-ring', () => new THREE.RingGeometry(0.55, 0.585, 48)), glow('#b8f6ee', 0.8), 0.028); inspect.visible = false;
    const markGroups = {};

    const castKey = resolveCastKey(unit);
    const castInst = castKey ? createCastInstance(unit) : null;
    if (castKey && !castInst) requestCastModel(castKey);

    let rig;
    if (castInst) {
      body.add(castInst.model);
      body.userData.castKey = castKey;
      root.userData.castKey = castKey;
      root.userData.undeadModel = castKey;
      ownMaterials.push(...castInst.ownMaterials);
      rig = castInst.rig;
    } else {
      // Minimal procedural fallback while GLB streams in (or if WebGL model fetch disabled)
      const paint = c => { const m = material(c, 0.2).clone(); ownMaterials.push(m); return m; };
      const cloth = paint(unit.team === 'heroes' ? '#43818a' : '#8f5e45');
      const skin = paint(fallbackKind === 'goblin' ? '#8fb060' : '#dfb48e');
      const steel = paint('#c4cfcb');
      const parts = { right: [], left: [], blade: [], bow: [] };
      mesh(body, robe, cloth, 0, 0.48, 0, 0.25, 0.68, 0.22).userData.unitId = unit.id;
      mesh(body, sphere, skin, 0, 0.96, 0, 0.15, 0.16, 0.14).userData.unitId = unit.id;
      parts.right.push(mesh(body, sphere, cloth, 0.22, 0.72, 0, 0.09, 0.16, 0.09));
      parts.left.push(mesh(body, sphere, cloth, -0.22, 0.72, 0, 0.09, 0.16, 0.09));
      parts.blade.push(mesh(body, box, steel, 0.32, 0.85, -0.1, 0.04, 0.55, 0.08));
      rig = rigCharacter(body, parts, fallbackKind);
    }

    const lY = labelHeight(unit);
    const nameSprite = label(unit, lY);
    root.add(nameSprite);
    // Pointer picking hits this invisible cylinder, never the (CPU-skinned) figure.
    const picker = new THREE.Mesh(geometry('picker', () => new THREE.CylinderGeometry(0.4, 0.4, 1.3, 10)), pickMaterial);
    picker.position.y = 0.65; picker.userData.unitId = unit.id; picker.name = 'unit-picker';
    root.add(picker);
    const downRing = ring(root, geometry('down-ring', () => new THREE.RingGeometry(0.4, 0.47, 40)), glow('#ff5a4a', 0.85), 0.03);
    downRing.visible = false;
    const deadRing = ring(root, geometry('dead-ring', () => new THREE.RingGeometry(0.3, 0.47, 40)), material('#16181a', 0, 1), 0.031);
    deadRing.visible = false;
    const stableRing = ring(root, geometry('down-ring', () => new THREE.RingGeometry(0.4, 0.47, 40)), glow('#5fd6c4', 0.85), 0.03);
    stableRing.visible = false;

    const entry = {
      root, body, rig, name: nameSprite, labelY: lY, active, target, inspect, picker, downRing, deadRing, stableRing,
      markGroups, ownMaterials, castKey: castInst ? castKey : null,
      data: { ...unit },
      start: new THREE.Vector3(unit.x, 0.04, unit.y),
      end: new THREE.Vector3(unit.x, 0.04, unit.y),
      moveStart: 0, moveEnd: 0, targetYaw: body.rotation.y,
    };
    applyUnitState(entry, unit);
    return entry;
  }

  function upgradeLoadedCast() {
    if (disposed || unavailable) return;
    if (playback) { upgradePending = true; return; }
    upgradePending = false;
    let changed = false;
    for (const [id, entry] of units) {
      const ck = resolveCastKey(entry.data);
      if (!ck || entry.castKey === ck || !castReadyFor(entry.data)) continue;
      const fresh = makeUnit(entry.data);
      fresh.root.position.copy(entry.root.position);
      fresh.body.rotation.y = entry.body.rotation.y;
      fresh.targetYaw = entry.targetYaw;
      applyUnitState(fresh, entry.data);
      fresh.target.visible = entry.target.visible;
      removeUnit(entry);
      units.set(id, fresh);
      changed = true;
    }
    if (changed) { renderer.shadowMap.needsUpdate = true; requestRender(); }
  }
  const stopCastListener = onCastLoaded(() => upgradeLoadedCast());

  function applyUnitState(entry, data) {
    entry.active.visible = Boolean(data.active && data.alive);
    entry.inspect.visible = data.id === inspectedId;
    // A hero at 0 HP keeps a Sanctuary ward (attackers still have to save), so its dome stays.
    const markNames = data.alive
      ? [...new Set([...(data.marks || []), ...((data.conditions || []).filter(c => MARKS[c]))])]
      : data.dead ? [] : (data.marks || []).filter(m => m === 'sanctuary');
    for (const name of markNames) if (!entry.markGroups[name] && MARKS[name]) entry.markGroups[name] = MARKS[name](entry.root, data);
    for (const [name, group] of Object.entries(entry.markGroups)) group.visible = markNames.includes(name);
    if (entry.markGroups.strength_drain) {
      entry.markGroups.strength_drain.children.forEach((child, i) => {
        if (child.name === 'mark-chev') child.visible = i - 1 < Math.min(3, Math.ceil((data.str_loss || 0) / 2));
      });
    }

    if (!data.alive) {
      // Skinned characters collapse naturally via their genuine 'death' clip instead of rigid -90 deg tipping!
      if (entry.rig.isSkinned && entry.rig.death(9999)) {
        entry.body.rotation.z = 0;
        entry.body.position.y = 0;
      } else {
        entry.body.rotation.z = -Math.PI / 2;
        entry.body.position.y = 0.23;
      }
      entry.lying = true;
      // Monster corpses dissolve after death playback; fallen heroes remain collapsed on the field:
      // a dying hero has a red ring, a stable one a teal ring, a dead one a dark ash ring.
      entry.body.visible = data.team === 'heroes';
      const dead = data.dead === true || (data.conditions || []).includes('dead');
      const stable = !dead && (data.conditions || []).includes('stable');
      entry.downRing.visible = data.team === 'heroes' && !dead && !stable;
      entry.stableRing.visible = data.team === 'heroes' && stable;
      entry.deadRing.visible = data.team === 'heroes' && dead;
      entry.picker.visible = data.team === 'heroes';
      entry.picker.scale.y = 0.22;
      entry.picker.position.y = 0.14;
    } else {
      // Standing again (a new fight after a loss, a retry, or healing at 0 HP): the rig still
      // holds the last frame of its death clip until something poses it, so stand it up now.
      if (entry.lying) { entry.rig.reset?.(); entry.lying = false; }
      entry.body.rotation.z = 0;
      entry.body.position.y = 0;
      entry.body.visible = true;
      entry.downRing.visible = false;
      entry.stableRing.visible = false;
      entry.deadRing.visible = false;
      entry.picker.visible = true;
      entry.picker.scale.y = 1;
      entry.picker.position.y = 0.65;
    }

    entry.data = { ...data };
    entry.target.visible = false;
  }

  function removeUnit(entry) {
    removeLabel(entry.name);
    if (entry.rig.dispose) entry.rig.dispose();
    const importedMaterials = entry.rig.model ? new Set(resourceMaterials(entry.rig.model)) : new Set();
    entry.ownMaterials.forEach(m => { if (!importedMaterials.has(m)) m.dispose(); });
    entry.root.removeFromParent();
  }
  function resourceMaterials(model) {
    const result = [];
    model.traverse(object => {
      if (object.material) result.push(...(Array.isArray(object.material) ? object.material : [object.material]));
    });
    return result;
  }

  function update(nextState, options = {}) {
    if (disposed || unavailable || !nextState?.map) return;
    state = nextState;
    busy = Boolean(options.busy);
    inspectedId = options.inspectedId ?? null;
    if (options.biome !== undefined && options.biome !== biomeOverride) {
      biomeOverride = options.biome;
      boardKey = '';
    }
    if (upgradePending && !playback) upgradeLoadedCast();
    canvas.classList.toggle('is-busy', busy);

    const map = nextState.map;
    const dimsChanged = map.width !== width || map.height !== height;
    const signature = JSON.stringify([biomeOverride, map.width, map.height, map.tiles, map.scene, (nextState.objects || []).map(({ id, kind, x, y, width: ow, depth, destroyed }) => ({ id, kind, x, y, ow, depth, destroyed }))]);
    if (signature !== boardKey) { buildBoard(map); boardKey = signature; }
    if (!hasFramedOnce || dimsChanged) { hasFramedOnce = true; resetCamera(false); }

    const now = performance.now();
    const aliveIds = new Set();
    for (const data of nextState.units || []) {
      aliveIds.add(data.id);
      let entry = units.get(data.id);
      if (entry && (entry.data.kind !== data.kind || entry.data.team !== data.team)) {
        removeUnit(entry); units.delete(data.id); entry = null;
      }
      if (!entry) { entry = makeUnit(data); units.set(data.id, entry); }
      if (entry.data.x !== data.x || entry.data.y !== data.y) {
        const singleStep = !options.snap && !options.ordered && Math.abs(entry.data.x - data.x) + Math.abs(entry.data.y - data.y) === 1;
        entry.start.set(entry.data.x, 0.04, entry.data.y);
        entry.end.set(data.x, 0.04, data.y);
        entry.moveStart = now;
        entry.moveEnd = !reducedMotion && singleStep ? now + 300 : 0;
        if (entry.moveEnd) entry.root.position.copy(entry.start);
        else entry.root.position.copy(entry.end);
      }
      const prevCondKey = JSON.stringify([entry.data.conditions, entry.data.marks, entry.data.vital || null, entry.data.alive]);
      const nextCondKey = JSON.stringify([data.conditions, data.marks, data.vital || null, data.alive]);
      if (data.hp !== entry.data.hp || data.max_hp !== entry.data.max_hp || data.name !== entry.data.name || data.active !== entry.data.active || prevCondKey !== nextCondKey) {
        removeLabel(entry.name);
        entry.name = label(data, entry.labelY);
        entry.root.add(entry.name);
      }
      applyUnitState(entry, data);
    }
    for (const [id, entry] of units) if (!aliveIds.has(id)) { removeUnit(entry); units.delete(id); }

    // If a living figure stands on the same square as a fallen hero (corpse or OA knockout),
    // nudge the collapsed hero neatly aside so the standing figure stays centered and legible.
    const livingCells = new Set();
    for (const entry of units.values()) if (entry.data.alive !== false) livingCells.add(`${entry.data.x},${entry.data.y}`);
    for (const entry of units.values()) {
      const sharedDown = entry.data.alive === false && entry.data.team === 'heroes' && livingCells.has(`${entry.data.x},${entry.data.y}`);
      const ox = sharedDown ? 0.24 : 0, oz = sharedDown ? -0.22 : 0;
      entry.body.position.x = ox;
      entry.body.position.z = oz;
      entry.downRing.position.set(ox, 0.03, oz);
      entry.stableRing.position.set(ox, 0.03, oz);
      entry.deadRing.position.set(ox, 0.031, oz);
      entry.picker.position.x = ox;
      entry.picker.position.z = oz;
    }

    // Conjured Spiritual Weapons
    const forceIds = new Set();
    for (const force of nextState.forces || []) {
      forceIds.add(force.id);
      let entry = forceWeapons.get(force.id);
      if (!entry) {
        const g = new THREE.Group(); g.name = 'spiritual-weapon'; figures.add(g);
        mesh(g, cylinder, glow('#cfe8ff', 0.9), 0, 0, 0, 0.04, 0.5, 0.04);
        mesh(g, box, glow('#9fd0ff', 0.85), 0, 0.3, 0, 0.26, 0.17, 0.17);
        mesh(g, geometry('force-halo', () => new THREE.TorusGeometry(0.3, 0.02, 6, 28)), glow('#bfe0ff', 0.8), 0, 0.15, 0).rotation.x = Math.PI / 2;
        g.rotation.z = -0.5; entry = { g }; forceWeapons.set(force.id, entry);
      }
      entry.g.position.set(force.x, 1.05, force.y);
    }
    for (const [id, entry] of forceWeapons) if (!forceIds.has(id)) { entry.g.removeFromParent(); forceWeapons.delete(id); }

    if (!options.ordered) combatEffects.ingest(nextState, now);

    clearGroup(overlays);
    const destinations = new Set();
    const forceDestinations = new Set();
    const targetIds = new Set();
    for (const action of options.selectedActions || []) {
      if (action.kind === 'move' && Number.isInteger(action.x) && Number.isInteger(action.y)) destinations.add(`${action.x},${action.y}`);
      else if (action.kind === 'spiritual_weapon_move' && Number.isInteger(action.x) && Number.isInteger(action.y)) forceDestinations.add(`${action.x},${action.y}`);
      for (const id of action.target_ids || []) targetIds.add(id);
      if (action.target_id) targetIds.add(action.target_id);
    }
    if (nextState.phase === 'setup' && options.setupFigure) {
      for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
        if (!blocked(map, x, y) && !(nextState.setup?.placements || []).some(p => p.id !== options.setupFigure && p.x === x && p.y === y)) {
          destinations.add(`${x},${y}`);
        }
      }
    }
    const drawDestSet = (set, fillHex, rimHex) => {
      for (const key of set) {
        const [x, y] = key.split(',').map(Number);
        const tile = mesh(overlays, planeGeometry, glow(fillHex, busy ? 0.12 : 0.25), x, 0.058, y, 0.84, 0.84, 1);
        tile.rotation.x = -Math.PI / 2; tile.castShadow = false;
        const rim = mesh(overlays, geometry('move-rim', () => {
          const shape = new THREE.Shape();
          shape.moveTo(-0.435, -0.435); shape.lineTo(0.435, -0.435); shape.lineTo(0.435, 0.435); shape.lineTo(-0.435, 0.435); shape.closePath();
          const hole = new THREE.Path(); hole.moveTo(-0.405, -0.405); hole.lineTo(-0.405, 0.405); hole.lineTo(0.405, 0.405); hole.lineTo(0.405, -0.405); hole.closePath(); shape.holes.push(hole);
          return new THREE.ShapeGeometry(shape);
        }), glow(rimHex, busy ? 0.35 : 0.88), x, 0.061, y);
        rim.rotation.x = -Math.PI / 2; rim.castShadow = false;
      }
    };
    drawDestSet(destinations, '#59d8c3', '#8cf0de');
    drawDestSet(forceDestinations, '#7cc4ff', '#bfe4ff');
    for (const id of targetIds) { const entry = units.get(id); if (entry) entry.target.visible = true; }
    const previewColor = options.previewFriendlyFire ? '#ff4a38' : '#ff7a3d';
    for (const cell of options.previewCells || []) {
      const [px, py] = cell;
      const tile = mesh(overlays, planeGeometry, glow(previewColor, busy ? 0.14 : 0.42), px, 0.066, py, 0.9, 0.9, 1);
      tile.rotation.x = -Math.PI / 2; tile.castShadow = false;
    }
    for (const object of nextState.objects || []) {
      if (object.destroyed) continue;
      if (targetIds.has(object.id) || options.inspectedId === object.id) {
        const marker = mesh(overlays, planeGeometry, glow(targetIds.has(object.id) ? '#fa856e' : '#b8f6ee', 0.38), object.x + ((object.width || 1) - 1) / 2, 0.07, object.y + ((object.depth || 1) - 1) / 2, object.width || 1, object.depth || 1, 1);
        marker.rotation.x = -Math.PI / 2; marker.castShadow = false;
      }
      board.traverse(group => { if (group.userData.objectId === object.id && group.userData.mapProp) group.userData.objectState = { ...object }; });
    }
    renderer.shadowMap.needsUpdate = true;
    requestRender();
  }

  // The record's effects as the server sent them: crit flags, rider damage,
  // Dreadful Glare, flourishes and opportunity attacks all come from the server
  // (webgame/ff/arena.py). Nothing here is inferred from text.
  function buildPresentationEvents(action) {
    const raw = Array.isArray(action.effects) ? action.effects.map(e => ({ ...e })) : [];
    if (action.opportunity) {
      const actor = units.get(action.source_id);
      const first = raw.find(e => e.source_id === action.source_id);
      if (actor && first) {
        raw.unshift({
          id: 900000 + (Number(action.id) || 0) * 10, type: 'attack', style: 'touch', variant: 'opportunity',
          outcome: 'hit', amount: 0, text: 'OPPORTUNITY', source_id: action.source_id, target_id: action.source_id,
          source: { x: actor.data.x, y: actor.data.y }, target: { x: actor.data.x, y: actor.data.y },
        });
      }
    }
    return raw;
  }

  function getCameraState() {
    return {
      position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      target: { x: controls.target.x, y: controls.target.y, z: controls.target.z },
      azimuth: controls.getAzimuthalAngle(),
    };
  }

  function glideCameraTo(toPos, toTarget, durationMs = 500, orbitArc = null, opts = {}) {
    if (disposed || unavailable) return;
    if (reducedMotion || durationMs <= 0) {
      camTween = null;
      const last = opts.next?.length ? opts.next[opts.next.length - 1] : null;   // reduced motion: cut to the end
      if (last) { toPos = last.pos; toTarget = last.target; }
      controls.target.copy(toTarget);
      camera.position.copy(toPos);
      controls.update();
      requestRender();
      return;
    }
    camTween = {
      t0: performance.now() + (opts.delay || 0),
      dur: durationMs,
      fromPos: camera.position.clone(),
      toPos: toPos.clone(),
      fromTarget: controls.target.clone(),
      toTarget: toTarget.clone(),
      orbitArc, // optional { radius, yOffset, a0, a1 }
      ease: opts.ease || 'out',
      next: opts.next ? [...opts.next] : [],   // further legs: {pos, target, dur, hold}
    };
    requestRender();
  }

  function computeBoardFit(directionVec, box = null, targetY = 0.48) {
    const x0 = box ? box.x0 : -0.75, x1 = box ? box.x1 : width - 0.25;
    const z0 = box ? box.z0 : -0.75, z1 = box ? box.z1 : height - 0.25;
    const target = new THREE.Vector3((x0 + x1) / 2, targetY, (z0 + z1) / 2);
    const direction = directionVec.clone().normalize();
    // Every corner of the board (and every figure) inside the part of the screen the HUD
    // leaves free, measured with the real projection (view offset included).
    const pts = [];
    for (const x of [x0, x1]) for (const z of [z0, z1]) for (const y of [-0.85, 1.45]) pts.push(new THREE.Vector3(x, y, z));
    if (!box) {
      for (const unit of state?.units || []) {
        for (const offset of [-0.55, 0.55]) pts.push(new THREE.Vector3(unit.x + offset, 1.62, unit.y));
      }
    }
    const distance = fitDistance(direction, target, pts, box ? 5.6 : 7.2, 0.9);
    controls.maxDistance = Math.max(36, distance * 1.55);
    camera.far = Math.max(120, distance * 3.4);
    camera.updateProjectionMatrix();
    scene.fog.near = Math.max(30, distance * 1.45);
    scene.fog.far = Math.max(72, distance * 3.3);
    const pos = direction.clone().multiplyScalar(distance).add(target);
    return { pos, target, distance };
  }

  function resetCamera(animate = true) {
    if (disposed || unavailable) return;
    presetName = 'tactical'; track = null;
    cameraViewDir.set(0.54, 0.92, 1.13).normalize();
    const { pos, target } = computeBoardFit(cameraViewDir);
    if (animate && hasFramedOnce) {
      glideCameraTo(pos, target, 480);
    } else {
      camTween = null;
      controls.target.copy(target);
      camera.position.copy(pos);
      controls.update();
      controls.saveState();
      requestRender();
    }
  }

  function setCameraPreset(preset, focusUnitId = null) {
    if (disposed || unavailable) return;
    const curOffset = camera.position.clone().sub(controls.target);
    const curAz = Math.atan2(curOffset.x, curOffset.z) || Math.atan2(0.54, 1.13);

    presetName = preset === 'cinematic' ? 'heroic' : preset === 'action' ? 'skirmish' : preset;
    track = null;

    if (preset === 'heroic' || preset === 'cinematic') {
      // Swoop right down to miniature shoulder height on the acting or inspected unit!
      const allUnits = state?.units || [];
      const u = (focusUnitId && allUnits.find(x => x.id === focusUnitId))
        || (inspectedId && allUnits.find(x => x.id === inspectedId))
        || allUnits.find(x => x.id === state?.turn_id && x.alive !== false)
        || allUnits.find(x => x.alive !== false)
        || allUnits[0];
      if (u) {
        const foes = allUnits.filter(f => f.alive !== false && f.team !== u.team);
        let lookDx = u.team === 'heroes' ? 1 : -1, lookDz = 0;
        if (foes.length) {
          const foe = foes.reduce((best, f) => {
            const d = (f.x - u.x) ** 2 + (f.y - u.y) ** 2;
            return d < best.d ? { f, d } : best;
          }, { f: foes[0], d: Infinity }).f;
          const vx = foe.x - u.x, vz = foe.y - u.y;
          const len = Math.hypot(vx, vz) || 1;
          lookDx = vx / len; lookDz = vz / len;
        }
        // Target slightly ahead of the hero toward their adversary at chest height
        const target = new THREE.Vector3(
          THREE.MathUtils.clamp(u.x + lookDx * 0.75, 0, width - 1),
          0.74,
          THREE.MathUtils.clamp(u.y + lookDz * 0.75, 0, height - 1),
        );
        // Place camera behind & slightly offset over the hero's shoulder at dramatic low elevation!
        const sideX = -lookDz * 0.52, sideZ = lookDx * 0.52;
        const backDir = new THREE.Vector3(-lookDx * 0.88 + sideX, 0.44, -lookDz * 0.88 + sideZ).normalize();
        const pos = target.clone().addScaledVector(backDir, 4.45);
        glideCameraTo(pos, target, 560);
      } else {
        // Pre-placement hall close-up
        const cx = (width - 1) / 2, cz = (height - 1) / 2;
        const target = new THREE.Vector3(cx, 0.55, cz);
        const dir = new THREE.Vector3(Math.sin(curAz) * 0.92, 0.36, Math.cos(curAz) * 0.92).normalize();
        glideCameraTo(target.clone().addScaledVector(dir, 8.2), target, 540);
      }
      return;
    }

    if (preset === 'skirmish' || preset === 'action') {
      const alive = (state?.units || []).filter(u => u.alive !== false);
      if (alive.length) {
        const box = {
          x0: Math.max(-0.7, Math.min(...alive.map(u => u.x)) - 1.8),
          x1: Math.min(width - 0.3, Math.max(...alive.map(u => u.x)) + 1.8),
          z0: Math.max(-0.7, Math.min(...alive.map(u => u.y)) - 1.8),
          z1: Math.min(height - 0.3, Math.max(...alive.map(u => u.y)) + 1.8),
        };
        const dir = new THREE.Vector3(Math.sin(curAz) * 0.82, 0.72, Math.cos(curAz) * 0.82).normalize();
        const { pos, target } = computeBoardFit(dir, box, 0.52);
        glideCameraTo(pos, target, 500);
        return;
      }
    }

    if (preset === 'reverse') {
      orbitBy(Math.PI, 480);
      return;
    }

    // Default 'tactical': crisp 3/4 isometric framing along current horizontal compass side
    const horiz = Math.hypot(0.54, 1.13);
    cameraViewDir.set(Math.sin(curAz) * horiz, 0.92, Math.cos(curAz) * horiz).normalize();
    const { pos, target } = computeBoardFit(cameraViewDir);
    glideCameraTo(pos, target, 500);
  }

  function orbitBy(deltaRad, durationMs = 400) {
    if (disposed || unavailable) return;
    const baseTarget = camTween ? camTween.toTarget.clone() : controls.target.clone();
    const basePos = camTween ? camTween.toPos.clone() : camera.position.clone();
    const off = basePos.clone().sub(baseTarget);
    const radius = Math.max(0.5, Math.hypot(off.x, off.z));
    const a0 = Math.atan2(off.x, off.z);
    const a1 = a0 + deltaRad;
    const toPos = new THREE.Vector3(
      baseTarget.x + Math.sin(a1) * radius,
      basePos.y,
      baseTarget.z + Math.cos(a1) * radius,
    );
    glideCameraTo(toPos, baseTarget, durationMs, { radius, y: basePos.y, a0, a1 });
  }

  function focusUnit(unitId, closeUp = false) {
    if (disposed || unavailable) return;
    const u = (state?.units || []).find(x => x.id === unitId);
    if (!u) return;
    if (closeUp) {
      setCameraPreset('heroic', unitId);
      return;
    }
    const curOff = camera.position.clone().sub(controls.target);
    const curDist = curOff.length();
    const dir = curOff.y / Math.max(0.1, curDist) > 0.92
      ? new THREE.Vector3(0.54, 0.82, 1.13).normalize()
      : curOff.normalize();
    const targetDist = Math.min(Math.max(curDist, 5.8), 9.2);
    const target = new THREE.Vector3(u.x, 0.58, u.y);
    const pos = target.clone().addScaledVector(dir, targetDist);
    glideCameraTo(pos, target, 460);
  }

  // --- The camera director ------------------------------------------------------------------
  // Follow mode (autoCam): at a turn's start the camera centres on the acting creature and
  // then eases out to the whole terrain, with that creature as near the centre as the map
  // allows. During an action it keeps the actors in view; with "zoom on action" it eases in
  // on a mover (or on attacker and targets) and back out when the action ends, holding a
  // moment longer on a critical hit or a creature that drops. Azimuth is never changed, so
  // the board does not swing. If the player drags or zooms, the director backs off until
  // the next turn. Reduced motion: cuts instead of glides, no zooming in.
  function takeCamera() {
    camTween = null; track = null;
    if (state) manualHold = true;
  }
  function viewDir() {
    const off = camera.position.clone().sub(controls.target);
    const az = Math.atan2(off.x, off.z);
    const horiz = Math.hypot(0.54, 1.13);
    return new THREE.Vector3(Math.sin(az) * horiz, 0.92, Math.cos(az) * horiz).normalize();
  }
  // The screen rectangle the HUD leaves free, in normalised device coordinates, shrunk by `fill`.
  function safeRectNdc(fill = 1) {
    const W = Math.max(1, canvas.clientWidth), H = Math.max(1, canvas.clientHeight);
    const r = safeArea || { top: 0, bottom: H, left: 0, right: W };
    let x0 = 2 * r.left / W - 1, x1 = 2 * r.right / W - 1, y0 = 1 - 2 * r.bottom / H, y1 = 1 - 2 * r.top / H;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    x0 = cx + (x0 - cx) * fill; x1 = cx + (x1 - cx) * fill; y0 = cy + (y0 - cy) * fill; y1 = cy + (y1 - cy) * fill;
    return { x0, x1, y0, y1 };
  }
  const fitCamera = new THREE.PerspectiveCamera();
  const fitPoint = new THREE.Vector3();
  function pointsInside(cam, points, rect) {
    for (const p of points) {
      fitPoint.copy(p).project(cam);
      if (fitPoint.z >= 1 || fitPoint.x < rect.x0 || fitPoint.x > rect.x1 || fitPoint.y < rect.y0 || fitPoint.y > rect.y1) return false;
    }
    return true;
  }
  // The distance along `direction` from `target` at which every point is inside the safe
  // area (shrunk by `fill`): a bisection with the camera's own projection.
  function fitDistance(direction, target, points, min = 5.6, fill = 0.88) {
    const rect = safeRectNdc(fill);
    fitCamera.copy(camera);
    const place = d => {
      fitCamera.position.copy(target).addScaledVector(direction, d);
      fitCamera.lookAt(target);
      fitCamera.updateMatrixWorld(true);
    };
    let lo = min, hi = min;
    for (let i = 0; i < 12; i++) { place(hi); if (pointsInside(fitCamera, points, rect)) break; lo = hi; hi *= 1.6; }
    if (hi === min) return min;
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      place(mid);
      if (pointsInside(fitCamera, points, rect)) hi = mid; else lo = mid;
    }
    return hi;
  }
  // The HUD's free area (CSS px of the canvas), from the app. The projection's centre moves
  // to that area's centre (a view offset), so "centred" means centred where the player can see.
  function setSafeArea(rect) {
    if (disposed || unavailable) return;
    const W = Math.max(1, canvas.clientWidth), H = Math.max(1, canvas.clientHeight);
    const next = rect && rect.bottom - rect.top > 80 && rect.right - rect.left > 80
      ? { top: Math.max(0, rect.top), bottom: Math.min(H, rect.bottom), left: Math.max(0, rect.left), right: Math.min(W, rect.right) } : null;
    const same = (a, b) => (!a && !b) || (a && b && ['top', 'bottom', 'left', 'right'].every(k => Math.abs(a[k] - b[k]) < 24));
    if (same(next, safeArea)) return;
    safeArea = next;
    applyViewOffset();
  }
  function applyViewOffset() {
    const W = Math.max(1, canvas.clientWidth), H = Math.max(1, canvas.clientHeight);
    if (!safeArea) { camera.clearViewOffset(); camera.updateProjectionMatrix(); requestRender(); return; }
    // A larger virtual image with the same aspect, of which the canvas shows the window whose
    // centre is offset so that the optical axis lands on the safe area's centre.
    const sx = (safeArea.left + safeArea.right) / 2 - W / 2, sy = (safeArea.top + safeArea.bottom) / 2 - H / 2;
    const k = 1 + 2 * Math.max(Math.abs(sx) / W, Math.abs(sy) / H);
    camera.setViewOffset(k * W, k * H, (k - 1) * W / 2 - sx, (k - 1) * H / 2 - sy, W, H);
    camera.updateProjectionMatrix();
    requestRender();
  }
  function boardPoints() {
    const pts = [];
    for (const x of [-0.75, width - 0.25]) for (const z of [-0.75, height - 0.25]) for (const y of [-0.85, 1.45]) pts.push(new THREE.Vector3(x, y, z));
    for (const unit of state?.units || []) if (unit.alive !== false) pts.push(new THREE.Vector3(unit.x, 1.62, unit.y));
    return pts;
  }
  // The whole terrain in view, biased toward `focus` (a world position) as far as it can be
  // without pulling back more than about a fifth.
  function terrainShot(focus) {
    const dir = viewDir();
    const base = computeBoardFit(dir);
    if (!focus) return base;
    const pts = boardPoints();
    const f = new THREE.Vector3(focus.x, 0.48, focus.z);
    for (const a of [0.9, 0.7, 0.5, 0.3]) {
      const target = base.target.clone().lerp(f, a);
      const distance = fitDistance(dir, target, pts, 7.2);
      if (distance <= base.distance * 1.2) return { target, distance, pos: target.clone().addScaledVector(dir, distance) };
    }
    return base;
  }
  function liveUnitPoint(id, y = 0.58) {
    const e = units.get(id);
    return e ? new THREE.Vector3(e.root.position.x, y, e.root.position.z) : null;
  }
  function inView(points, margin = 0.8) {
    camera.updateMatrixWorld();
    return pointsInside(camera, points, safeRectNdc(margin));
  }
  function directorActive() { return autoCam && !manualHold && !disposed && !unavailable && !!state; }

  // Returns false when it could not frame the creature yet (the scene has not seen it).
  function directTurn(unitId, { player = false } = {}) {
    if (!autoCam || disposed || unavailable || !state) return false;
    const focus = liveUnitPoint(unitId, 0.55);
    if (!focus) return false;
    manualHold = false; track = null;
    if (presetName === 'heroic') { setCameraPreset('heroic', unitId); return true; }
    const wide = terrainShot(focus);
    if (player && !reducedMotion) {
      const dir = viewDir();
      const curDist = camera.position.distanceTo(controls.target);
      const near = THREE.MathUtils.clamp(wide.distance * 0.72, 6.2, Math.max(6.2, curDist));
      glideCameraTo(focus.clone().addScaledVector(dir, near), focus, 650, null,
        { ease: 'inout', next: [{ pos: wide.pos, target: wide.target, dur: 1100, hold: 300 }] });
    } else {
      glideCameraTo(wide.pos, wide.target, 800, null, { ease: 'inout' });
    }
    lastDirected = { kind: 'turn', id: unitId, at: performance.now() };
    return true;
  }

  function directAction(p) {
    if (!directorActive()) return;
    const a = p.action;
    const mover = (a.moves || []).find(m => m.path?.length > 1)?.source_id;
    const curOff = camera.position.clone().sub(controls.target);
    if (mover) {
      // Zoom: ease in and ride along. Otherwise only pan when the mover nears the edge.
      // Zoom only on the acting creature's own move (not a shove or a reaction's step).
      const zoom = actionZoom && !reducedMotion && presetName !== 'heroic' && mover === a.source_id;
      camTween = null;
      let dist = curOff.length();
      if (zoom) {
        // Close enough to feel the move, far enough that two squares around the mover stay
        // in the free area (on a phone that is a small window).
        const at = liveUnitPoint(mover);
        const around = [];
        if (at) for (const dx of [-2.2, 2.2]) for (const dz of [-2.2, 2.2]) for (const y of [0, 1.7]) around.push(new THREE.Vector3(at.x + dx, y, at.z + dz));
        dist = Math.min(curOff.length(), at ? fitDistance(viewDir(), at, around, 6.2, 0.9) : 7.4);
      }
      track = { id: mover, zoom, dir: zoom ? viewDir() : curOff.clone().normalize(), dist, last: null };
      lastDirected = { kind: 'move', id: mover, at: performance.now() };
      return;
    }
    const targets = [...new Set((p.events || []).map(e => e.target_id).filter(id => id && id !== a.source_id))];
    const pts = [a.source_id, ...targets].map(id => liveUnitPoint(id, 0.9)).filter(Boolean);
    if (!pts.length || presetName === 'heroic') return;
    if (actionZoom && !reducedMotion && targets.length) {
      const box = new THREE.Box3().setFromPoints(pts).expandByScalar(1.3);
      const target = box.getCenter(new THREE.Vector3()); target.y = 0.6;
      const corners = [];
      for (const x of [box.min.x, box.max.x]) for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1.7, z));
      const dir = viewDir();
      const distance = fitDistance(dir, target, corners, 6.4, 0.8);   // attacker and targets, whatever it takes
      glideCameraTo(target.clone().addScaledVector(dir, distance), target, 480, null, { ease: 'inout' });
      p.zoomed = true;
      lastDirected = { kind: 'attack', id: a.source_id, at: performance.now() };
    } else if (!inView(pts)) {
      const wide = terrainShot(pts[0]);
      glideCameraTo(wide.pos, wide.target, 600, null, { ease: 'inout' });
    }
  }

  function directActionEnd(p) {
    const wasZoomed = Boolean((track && track.zoom) || p.zoomed);
    const endId = track?.id || p.action.source_id;
    track = null;
    lastEnded = { at: Math.round(performance.now()), zoomed: wasZoomed, active: directorActive() };
    if (!directorActive() || !wasZoomed) return;
    const big = p.newlyDead.size > 0 || (p.events || []).some(e => e.crit);
    const wide = terrainShot(liveUnitPoint(endId) || controls.target);
    glideCameraTo(wide.pos, wide.target, 950, null, { ease: 'inout', delay: big ? 900 : 380 });
  }

  function trackStep(now) {
    const e = units.get(track.id);
    if (!e) { track = null; return false; }
    const dt = track.last === null ? 0.016 : Math.min(1, (now - track.last) / 1000);   // slow frames catch up
    track.last = now;
    const k = 1 - Math.exp(-dt / 0.22);
    const want = new THREE.Vector3(e.root.position.x, 0.58, e.root.position.z);
    if (track.zoom) {
      controls.target.lerp(want, k);
      camera.position.lerp(want.clone().addScaledVector(track.dir, track.dist), k);
      return true;
    }
    // Keep in view: pan (target and camera together) only while the mover is near an edge.
    camera.updateMatrixWorld();
    if (!pointsInside(camera, [want], safeRectNdc(0.62))) {
      const shift = want.clone().sub(controls.target); shift.y = 0;
      shift.multiplyScalar(k * 1.6);
      controls.target.add(shift); camera.position.add(shift);
    }
    return true;
  }

  function setAutoCamera(on) { autoCam = Boolean(on); if (!autoCam) track = null; }
  function setActionZoom(on) { actionZoom = Boolean(on); }
  function getDirectorState() { return { autoCam, actionZoom, manualHold, preset: presetName, tracking: track?.id || null, tween: !!camTween, playing: !!playback, actor: playback?.action?.source_id || null, last: lastDirected, ended: lastEnded }; }

  function clearHoverPreview() {
    while (hoverGroup.children.length) hoverGroup.remove(hoverGroup.children[0]);
    while (hoverGeoms.length) hoverGeoms.pop().dispose();
  }

  function setTacticalPreview({ hoverCell = null, pathCells = null, pathColor = '#6af7df', pathDotColor = '#a8fff0', arcFrom = null, arcTo = null, arcColor = '#ffd478', areaCells = null, areaColor = '#ff7a3d' } = {}) {
    if (disposed || unavailable) return;
    clearHoverPreview();
    // 1. 3D Floor Hover Cursor Reticle
    if (hoverCell && Number.isInteger(hoverCell.x) && Number.isInteger(hoverCell.y)) {
      const bracket = mesh(hoverGroup, geometry('hover-bracket', () => {
        const s = new THREE.Shape();
        s.moveTo(-0.47, -0.47); s.lineTo(0.47, -0.47); s.lineTo(0.47, 0.47); s.lineTo(-0.47, 0.47); s.closePath();
        const h = new THREE.Path();
        h.moveTo(-0.42, -0.42); h.lineTo(-0.42, 0.42); h.lineTo(0.42, 0.42); h.lineTo(0.42, -0.42); h.closePath();
        s.holes.push(h);
        return new THREE.ShapeGeometry(s);
      }), glow(hoverCell.color || '#ffe194', 0.92), hoverCell.x, 0.068, hoverCell.y);
      bracket.rotation.x = -Math.PI / 2;
      bracket.castShadow = false;
    }
    // 1b. 3D Area-of-Effect Hover Footprint
    if (Array.isArray(areaCells) && areaCells.length) {
      for (const [px, py] of areaCells) {
        const tile = mesh(hoverGroup, planeGeometry, glow(areaColor, 0.36), px, 0.067, py, 0.88, 0.88, 1);
        tile.rotation.x = -Math.PI / 2;
        tile.castShadow = false;
      }
    }
    // 2. 3D Movement Path Stepping Stones & Tube
    if (Array.isArray(pathCells) && pathCells.length >= 2) {
      const pts = pathCells.map(([px, py]) => new THREE.Vector3(px, 0.11, py));
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.15);
      const tubeG = new THREE.TubeGeometry(curve, Math.max(8, pathCells.length * 6), 0.042, 8, false);
      hoverGeoms.push(tubeG);
      const tubeM = new THREE.Mesh(tubeG, glow(pathColor, 0.88));
      hoverGroup.add(tubeM);
      for (let i = 1; i < pathCells.length; i++) {
        const [px, py] = pathCells[i];
        const dot = mesh(hoverGroup, cylinder, glow(pathDotColor, 0.92), px, 0.10, py, 0.11, 0.03, 0.11);
        dot.castShadow = false;
      }
    }
    // 3. 3D Parabolic Attack / Spell Targeting Arc
    if (arcFrom && arcTo) {
      const p0 = new THREE.Vector3(arcFrom.x, 1.02, arcFrom.y);
      const p2 = new THREE.Vector3(arcTo.x, 0.86, arcTo.y);
      const span = p0.distanceTo(p2);
      const mid = p0.clone().lerp(p2, 0.5);
      mid.y += Math.min(2.6, 0.65 + span * 0.24);
      const bez = new THREE.QuadraticBezierCurve3(p0, mid, p2);
      const arcG = new THREE.TubeGeometry(bez, 28, 0.036, 8, false);
      hoverGeoms.push(arcG);
      hoverGroup.add(new THREE.Mesh(arcG, glow(arcColor, 0.86)));
      const bullseye = ring(hoverGroup, activeGeometry, glow(arcColor, 0.95), 0.075);
      bullseye.position.x = arcTo.x;
      bullseye.position.z = arcTo.y;
      bullseye.scale.setScalar(1.08);
    }
    requestRender();
  }

  function setBiome(biomeName) {
    biomeOverride = biomeName === 'auto' ? null : biomeName;
    if (state) {
      boardKey = '';
      update(state, { snap: true, ordered: true, inspectedId });
    }
  }

  function setIdleLoop(enabled) {
    idleLoop = Boolean(enabled) && !reducedMotion;
    if (idleLoop) requestRender();
  }

  function setLabelMode(mode) {
    labelMode = mode;
    requestRender();
  }

  function projectWorld(x, y, z) {
    camera.updateMatrixWorld(); projection.set(x, y, z).project(camera);
    return { x: (projection.x + 1) * canvas.clientWidth / 2, y: (1 - projection.y) * canvas.clientHeight / 2, visible: projection.z > -1 && projection.z < 1 && Math.abs(projection.x) <= 1 && Math.abs(projection.y) <= 1 };
  }
  function projectCell(x, y) { return projectWorld(x, 0.055, y); }
  function projectUnit(id) { const entry = units.get(id); return entry ? projectWorld(entry.root.position.x, 0.65, entry.root.position.z) : null; }

  function resize() {
    if (disposed || unavailable) return;
    const w = Math.max(1, container.clientWidth), h = Math.max(1, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    renderer.setSize(w, h, false);
    const aspect = w / h, previous = camera.aspect;
    camera.aspect = aspect; camera.updateProjectionMatrix();
    if (safeArea) applyViewOffset();
    if (!hasFramedOnce && state) { hasFramedOnce = true; resetCamera(false); }
    else if (state && Math.abs(Math.log(aspect / previous)) > 0.25) resetCamera(false);  // refit on a big aspect change
    else requestRender();
  }
  function cameraChanged() {
    if (disposed || unavailable) return;
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, -1, width);
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, -1, height);
    controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0, 1.5);
    onCameraChange?.(getCameraState());
    requestRender();
  }
  let idleTimer = 0;
  function requestRender() { if (!frame && !disposed && !unavailable && !document.hidden) frame = requestAnimationFrame(render); }

  function cancelPlayback() {
    const previous = playback; playback = null; track = null;
    for (const entry of units.values()) if (entry.data.alive) entry.rig.reset();
    combatEffects.clear(); finishMovement();
    previous?.resolve(false);
    if (upgradePending) upgradeLoadedCast();
  }

  function playAction(action, callbacks = {}) {
    if (disposed || unavailable || document.hidden) return Promise.resolve(false);
    if (playback) cancelPlayback();
    const events = buildPresentationEvents(action);
    if (reducedMotion) {
      combatEffects.play(events, performance.now());
      callbacks.impact?.(); return Promise.resolve(true);
    }
    return new Promise(resolve => {
      // Fix §9.2: choose the acting creature's primary offensive/spell effect, not a leading Shield reaction!
      const primary = events.find(e => e.source_id === action.source_id && e.style !== 'touch') || events[0] || null;
      const style = primary?.style || null;
      const isDash = action.kind === 'dash' || (action.moves || []).some(m => m.path.length >= 6);
      const stepMs = isDash ? 200 : 320;
      const steps = (action.moves || []).reduce((sum, move) => sum + Math.max(0, move.path.length - 1), 0);
      // Newly slain units during this action will play their skeletal death collapse!
      const newlyDead = new Set();
      for (const afterU of action.after?.units || []) {
        const beforeU = (action.before?.units || []).find(u => u.id === afterU.id);
        if (beforeU?.alive && !afterU.alive) newlyDead.add(afterU.id);
      }
      playback = {
        action, events, primary, callbacks, resolve, style, stepMs, isDash, newlyDead,
        start: null, impacted: false,
        duration: style ? actionDuration(style) : steps ? steps * stepMs : 220,
      };
      directAction(playback);
      requestRender();
    });
  }

  function tickPlayback(now) {
    const p = playback;
    if (!p) return false;
    if (p.start === null) {
      p.start = now;
      const entry = units.get(p.action.source_id), effect = p.primary;
      if (entry && effect) {
        const dx = effect.target.x - effect.source.x, dz = effect.target.y - effect.source.y;
        if (dx || dz) {
          entry.body.rotation.y = Math.atan2(-dx, -dz);
          entry.targetYaw = entry.body.rotation.y;
        }
        entry.rig.pose(p.style, RELEASE_AT, p.action.kind);
        entry.root.updateWorldMatrix(true, true);
        const origin = new THREE.Vector3();
        const anchorObj = p.style === 'arrow' ? entry.rig.bow : p.style === 'dreadful_glare' ? (entry.rig.head || entry.rig.right) : entry.rig.right;
        anchorObj.getWorldPosition(origin);
        combatEffects.play(p.events, now, { releaseAt: RELEASE_AT, impactAt: impactAt(p.style) }, origin.toArray());
      } else if (p.events.length) {
        combatEffects.play(p.events, now, { releaseAt: 80, impactAt: 220 });
      }
    }
    const age = now - p.start;
    const actor = units.get(p.action.source_id);
    if (actor && p.style) actor.rig.pose(p.style, age, p.action.kind);

    let elapsed = age;
    for (const move of p.action.moves || []) {
      const moving = units.get(move.source_id), path = move.path;
      const duration = Math.max(0, path.length - 1) * p.stepMs;
      if (moving && path.length && elapsed >= 0) {
        const step = Math.min(path.length - 1, Math.floor(elapsed / p.stepMs));
        const next = Math.min(path.length - 1, step + 1);
        const fraction = step === next ? 0 : (elapsed % p.stepMs) / p.stepMs;
        const [x, z] = path[step], [nx, nz] = path[next];
        moving.root.position.set(x + (nx - x) * fraction, 0.04, z + (nz - z) * fraction);
        if (nx !== x || nz !== z) {
          const desiredYaw = Math.atan2(x - nx, z - nz);
          moving.body.rotation.y = lerpAngle(moving.body.rotation.y, desiredYaw, 0.36);
          moving.targetYaw = desiredYaw;
        }
        if (elapsed <= duration) moving.rig.walk?.(elapsed, p.isDash);
        else moving.rig.idle?.(now);
        if (p.lastStep !== `${move.source_id}:${step}`) {
          p.lastStep = `${move.source_id}:${step}`;
          spawnStepPuff(x, z);
          p.callbacks.step?.(move.source_id, x, z);
        }
      }
      elapsed -= duration;
    }

    const impAt = p.style ? impactAt(p.style) : p.duration;
    for (const effect of p.events) {
      if (effect.outcome === 'hit' && effect.amount > 0 && effect.target_id !== p.action.source_id) {
        const target = units.get(effect.target_id);
        if (target && age >= impAt) {
          if (p.newlyDead.has(effect.target_id)) {
            target.body.visible = true;
            target.rig.death?.(age - impAt);
          } else if (target.lying) {
            // A hit on a hero already at 0 HP (a death-save failure): it stays down.
            target.rig.death?.(9999);
          } else {
            target.rig.hit?.(age - impAt);
          }
        }
      }
    }

    if (!p.impacted && age >= impAt) {
      p.impacted = true;
      p.callbacks.impact?.();
      // Keep dying monster visible during the post-impact death collapse before hiding at end of action!
      for (const deadId of p.newlyDead) {
        const u = units.get(deadId);
        if (u && u.rig.isSkinned) u.body.visible = true;
      }
    }
    renderer.shadowMap.needsUpdate = true;
    if (age >= p.duration) {
      for (const [uid, unit] of units) {
        if (unit.data.alive) unit.rig.reset();
        else if (unit.data.team !== 'heroes') unit.body.visible = false;
        else unit.rig.death?.(9999);
      }
      playback = null;
      directActionEnd(p);
      p.resolve(true);
      if (upgradePending) upgradeLoadedCast();
      return false;
    }
    return true;
  }

  function render(now) {
    frame = 0;
    if (disposed || unavailable) return;
    let animate = false;
    if (camTween && now < camTween.t0) {
      // A delayed leg: keep the start pose current (the player or a track may have moved it).
      camTween.fromPos.copy(camera.position); camTween.fromTarget.copy(controls.target);
      animate = true;
    } else if (camTween) {
      const rawP = THREE.MathUtils.clamp((now - camTween.t0) / Math.max(1, camTween.dur), 0, 1);
      const ease = camTween.ease === 'inout'
        ? (rawP < 0.5 ? 4 * rawP ** 3 : 1 - (-2 * rawP + 2) ** 3 / 2)
        : 1 - Math.pow(1 - rawP, 3);
      controls.target.lerpVectors(camTween.fromTarget, camTween.toTarget, ease);
      if (camTween.orbitArc) {
        const ang = camTween.orbitArc.a0 + (camTween.orbitArc.a1 - camTween.orbitArc.a0) * ease;
        camera.position.set(
          controls.target.x + Math.sin(ang) * camTween.orbitArc.radius,
          camTween.orbitArc.y,
          controls.target.z + Math.cos(ang) * camTween.orbitArc.radius,
        );
      } else {
        camera.position.lerpVectors(camTween.fromPos, camTween.toPos, ease);
      }
      if (rawP >= 1) {
        const leg = camTween.next.shift();
        if (leg) {
          const rest = camTween.next;
          glideCameraTo(leg.pos, leg.target, leg.dur, null, { ease: 'inout', delay: leg.hold || 0, next: rest });
          animate = true;
        } else camTween = null;
      } else animate = true;
    } else if (track) {
      animate = trackStep(now) || animate;
    }
    controls.update();
    animate = tickPlayback(now) || animate;
    let shadowChanged = false;

    for (const entry of units.values()) {
      if (entry.moveEnd > 0) {
        shadowChanged = true;
        const p = entry.moveEnd === entry.moveStart ? 1 : THREE.MathUtils.clamp((now - entry.moveStart) / (entry.moveEnd - entry.moveStart), 0, 1);
        const ease = p * p * (3 - 2 * p);
        entry.root.position.lerpVectors(entry.start, entry.end, ease);
        entry.rig.walk?.(now - entry.moveStart, false);
        if (p >= 1) { entry.moveEnd = 0; entry.rig.reset(); } else animate = true;
      } else if (idleLoop && !playback && entry.data.alive && entry.rig.isSkinned) {
        const guarding = (entry.data.conditions || []).includes('dodge');
        entry.rig.idle(now, guarding);
      }
    }

    // Torch & candle deterministic flame flicker
    if ((idleLoop || playback) && torchFlames.length) {
      for (const tf of torchFlames) {
        const flick = Math.sin(now * 0.011 + tf.phase) * 0.14 + Math.cos(now * 0.023 + tf.phase * 1.7) * 0.08;
        tf.flame.scale.y = tf.baseScaleY * (1 + flick);
        tf.flame.rotation.z = Math.sin(now * 0.008 + tf.phase) * 0.14;
        if (tf.light) tf.light.intensity = tf.baseIntensity * (1 + flick * 0.55);
      }
    }

    // Footstep dust puffs
    for (let i = stepPuffs.length - 1; i >= 0; i--) {
      const pf = stepPuffs[i];
      const q = (now - pf.born) / 420;
      if (q >= 1) {
        pf.mesh.removeFromParent(); pf.mat.dispose(); stepPuffs.splice(i, 1);
      } else {
        pf.mesh.position.y = 0.08 + q * 0.18;
        pf.mesh.scale.setScalar(0.06 + q * 0.10);
        pf.mat.opacity = 0.42 * (1 - q);
        animate = true;
      }
    }

    // Conjured Spiritual Weapon gentle hover & ambient dungeon motes
    if (idleLoop || playback) {
      for (const fw of forceWeapons.values()) {
        fw.g.position.y = 1.05 + Math.sin(now * 0.004) * 0.06;
        fw.g.rotation.y = now * 0.0018;
      }
      for (const mt of motes) {
        const t = now * 0.001 * mt.speed + mt.phase;
        const cycle = (mt.yOffset + now * 0.00018 * mt.speed) % 2.15;
        mt.mesh.position.y = 0.16 + cycle;
        mt.mesh.position.x = mt.baseX + Math.sin(t) * 0.24;
        mt.mesh.position.z = mt.baseZ + Math.cos(t * 0.85) * 0.24;
        const fade = Math.sin((cycle / 2.15) * Math.PI);
        mt.mat.opacity = 0.12 + fade * 0.42;
      }
    }

    animate = combatEffects.tick(now, camera, canvas.clientHeight) || animate;
    deoverlapLabels();
    if (shadowChanged) renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
    if (!ready && state) { ready = true; onReady?.(getCameraState()); }
    if (animate) requestRender();
    else if (idleLoop) { clearTimeout(idleTimer); idleTimer = setTimeout(requestRender, IDLE_FRAME_MS); }
  }

  function pickTargets() {
    const list = [];
    for (const entry of units.values()) if (entry.picker.visible && entry.root.visible) list.push(entry.picker);
    return list;
  }
  function bestFigureHit(hits) {
    const unitHits = hits.filter(item => item.object.userData.unitId != null);
    if (!unitHits.length) return null;
    const first = unitHits[0];
    const firstEntry = units.get(first.object.userData.unitId);
    if (firstEntry && firstEntry.data.alive === false) {
      const standingSameCell = unitHits.find(item => {
        const e = units.get(item.object.userData.unitId);
        return e && e.data.alive !== false && e.data.x === firstEntry.data.x && e.data.y === firstEntry.data.y;
      });
      if (standingSameCell) return standingSameCell;
    }
    return first;
  }

  function pointerDown(event) {
    pointers.add(event.pointerId);
    if (pointers.size !== 1) { pointer = null; takeCamera(); return; }
    pointer = event.isPrimary && event.button === 0 ? { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), dragged: false } : null;
    if (event.button !== 0) takeCamera();
  }
  function pointerMove(event) {
    if (pointer?.id === event.pointerId && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 5) {
      pointer.dragged = true;
      takeCamera();
    }
    if (pointers.size || !onHover || !state || disposed || unavailable) return;
    const rect = canvas.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
    mouse.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
    camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
    raycaster.setFromCamera(mouse, camera);
    const figHit = bestFigureHit(raycaster.intersectObjects(pickTargets(), false));
    if (figHit) {
      const entry = units.get(figHit.object.userData.unitId);
      if (entry) {
        const hk = `u:${entry.data.id}:${event.clientX >> 2}:${event.clientY >> 2}`;
        if (hk !== lastHoverKey) { lastHoverKey = hk; onHover({ x: entry.data.x, y: entry.data.y, unitId: entry.data.id, clientX: event.clientX, clientY: event.clientY }); }
        return;
      }
    }
    if (raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
      const hx = Math.floor(hitPoint.x + 0.5), hy = Math.floor(hitPoint.z + 0.5);
      if (hx >= 0 && hy >= 0 && hx < width && hy < height) {
        const u = (state.units || []).find(item => item.x === hx && item.y === hy && item.alive !== false)
          || (state.units || []).find(item => item.x === hx && item.y === hy && item.team === 'heroes');
        const obj = (state.objects || []).find(o => !o.destroyed && footprintContains(o, hx, hy));
        const hk = `c:${hx}:${hy}:${u?.id || obj?.id || ''}:${event.clientX >> 2}:${event.clientY >> 2}`;
        if (hk !== lastHoverKey) { lastHoverKey = hk; onHover({ x: hx, y: hy, unitId: u?.id || obj?.id || null, clientX: event.clientX, clientY: event.clientY }); }
        return;
      }
    }
    if (lastHoverKey !== 'none') { lastHoverKey = 'none'; onHover(null); }
  }
  function pointerLeave() {
    if (lastHoverKey !== 'none') { lastHoverKey = 'none'; onHover?.(null); }
  }
  function wheelInterrupt() { takeCamera(); }
  function pointerUp(event) {
    pointers.delete(event.pointerId);
    const start = pointer; pointer = null;
    if (!start || start.id !== event.pointerId || start.dragged || pointers.size || busy || !state || disposed || unavailable) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6 || performance.now() - start.time > 700) return;
    const rect = canvas.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
    mouse.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
    camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(pickTargets(), false);
    const hit = bestFigureHit(hits);
    if (hit) {
      const entry = units.get(hit.object.userData.unitId);
      if (entry) { onCell?.(entry.data.x, entry.data.y, entry.data.id); return; }
    }
    const propHit = raycaster.intersectObject(board, true).find(item => item.object.userData.objectId != null && item.object.parent?.visible !== false);
    if (propHit) {
      const object = (state.objects || []).find(o => o.id === propHit.object.userData.objectId && !o.destroyed);
      if (object) { onCell?.(object.x, object.y, object.id); return; }
    }
    if (!raycaster.ray.intersectPlane(floorPlane, hitPoint)) return;
    const x = Math.floor(hitPoint.x + 0.5), y = Math.floor(hitPoint.z + 0.5);
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const unit = (state.units || []).find(u => u.x === x && u.y === y && u.alive !== false)
      || (state.units || []).find(u => u.x === x && u.y === y && u.team === 'heroes');
    const object = (state.objects || []).find(o => !o.destroyed && footprintContains(o, x, y));
    onCell?.(x, y, unit?.id || object?.id);
  }
  function cancelPointer(event) { pointers.delete(event.pointerId); pointer = null; }
  function markUnavailable(event) {
    event?.preventDefault();
    if (unavailable || disposed) return;
    unavailable = true; cancelAnimationFrame(frame); clearTimeout(idleTimer); frame = 0;
    cancelPlayback();
    combatEffects.dispose();
    controls.enabled = false; container.dataset.renderer = 'unavailable';
    canvas.dataset.renderer = 'unavailable';
    onUnavailable?.('The WebGL context was lost.', { lost: true });
  }
  function finishMovement() {
    for (const entry of units.values()) if (entry.moveEnd) {
      entry.root.position.copy(entry.end); entry.moveEnd = 0;
    }
    renderer.shadowMap.needsUpdate = true;
  }
  function motionChanged(event) {
    reducedMotion = event.matches;
    if (reducedMotion) idleLoop = false;
    combatEffects.setReducedMotion(reducedMotion);
    if (reducedMotion) cancelPlayback();
    requestRender();
  }
  function visibilityChanged() {
    combatEffects.setHidden(document.hidden);
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; cancelPlayback(); }
    else requestRender();
  }

  controls.addEventListener('change', cameraChanged);
  canvas.addEventListener('pointerdown', pointerDown, { capture: true });
  canvas.addEventListener('pointermove', pointerMove, { capture: true });
  canvas.addEventListener('pointerleave', pointerLeave);
  canvas.addEventListener('wheel', wheelInterrupt, { passive: true });
  window.addEventListener('pointerup', pointerUp);
  window.addEventListener('pointercancel', cancelPointer);
  canvas.addEventListener('webglcontextlost', markUnavailable);
  media?.addEventListener?.('change', motionChanged);
  document.addEventListener('visibilitychange', visibilityChanged);
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  observer?.observe(container);
  window.addEventListener('resize', resize);

  function dispose() {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame); clearTimeout(idleTimer); observer?.disconnect();
    stopCastListener();
    cancelPlayback();
    clearHoverPreview();
    combatEffects.dispose();
    controls.removeEventListener('change', cameraChanged); controls.dispose();
    canvas.removeEventListener('pointerdown', pointerDown, { capture: true });
    canvas.removeEventListener('pointermove', pointerMove, { capture: true });
    canvas.removeEventListener('pointerleave', pointerLeave);
    canvas.removeEventListener('wheel', wheelInterrupt);
    window.removeEventListener('pointerup', pointerUp);
    window.removeEventListener('pointercancel', cancelPointer);
    canvas.removeEventListener('webglcontextlost', markUnavailable);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', visibilityChanged);
    media?.removeEventListener?.('change', motionChanged);
    for (const pf of stepPuffs) { pf.mesh.removeFromParent(); pf.mat.dispose(); }
    stepPuffs.length = 0;
    clearMotes();
    for (const entry of units.values()) removeUnit(entry);
    units.clear(); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
    board.traverse(child => { if (child.isInstancedMesh) child.dispose(); });
    scene.traverse(child => { if (child.isLight) child.dispose(); });
    scene.clear(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
    if (container.dataset.renderer === 'webgl' || container.dataset.renderer === 'unavailable') delete container.dataset.renderer;
  }

  resize(); resetCamera(false);
  return {
    update, playAction, cancelPlayback, resetCamera, setCameraPreset, orbitBy, focusUnit,
    directTurn, setAutoCamera, setActionZoom, getDirectorState, setSafeArea,
    setTacticalPreview, clearHoverPreview, setBiome, getActiveTheme: () => activeThemeId,
    setIdleLoop, setLabelMode,
    resize, dispose, getCameraState, getAssetState, getEffectState: combatEffects.getState,
    projectCell, projectUnit, renderer, canvas, scene, camera, controls,
  };
}
