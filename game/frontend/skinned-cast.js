import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { versioned } from './asset-versions.js';

// The project's rigged figures: animated in Blender. A static original until its rig exists would be
// marked `static: true` (no skin or clips; the scene slides it, turns it and tips it over on death).
// Presentation only: every unit position, HP, condition and outcome comes from Natural20.
export const CAST_MODELS = Object.freeze({
  // Heroes (guy, elion, curogana use canonical original heights 1.30 / 1.30 / 1.27;
  // walkSpeed/runSpeed match the Blender Leg-IK stance foot velocity in board squares per clip-second)
  mara:        Object.freeze({ file: 'models/mara.glb',        height: 1.28, group: 'hero', walkSpeed: 0.96,   runSpeed: 2.0211 }),
  guy:         Object.freeze({ file: 'models/guy.glb',         height: 1.30, group: 'hero', walkSpeed: 0.975,  runSpeed: 2.0526 }),
  elion:       Object.freeze({ file: 'models/elion.glb',       height: 1.30, group: 'hero', walkSpeed: 0.975,  runSpeed: 2.0526 }),
  ilyra:       Object.freeze({ file: 'models/ilyra.glb',       height: 1.30, group: 'hero', walkSpeed: 0.975,  runSpeed: 2.0526 }),
  curogana:    Object.freeze({ file: 'models/curogana.glb',    height: 1.27, group: 'hero', walkSpeed: 0.9525, runSpeed: 2.0053 }),
  // Chruna (Barbarian): halberd swings play `slash`, Rage and Reckless Attack `cast` (a roar)
  chruna:      Object.freeze({ file: 'models/chruna.glb',      height: 1.30, group: 'hero', walkSpeed: 0.975,  runSpeed: 2.0526 }),
  // Undead (all 8 project-original SRD 5.2.1 figures)
  skeleton:    Object.freeze({ file: 'models/skeleton.glb',    height: 1.25, group: 'undead' }),
  zombie:      Object.freeze({ file: 'models/zombie.glb',      height: 1.25, group: 'undead' }),
  ghoul:       Object.freeze({ file: 'models/ghoul.glb',       height: 1.22, group: 'undead' }),
  ghast:       Object.freeze({ file: 'models/ghast.glb',       height: 1.36, group: 'undead' }),
  shadow:      Object.freeze({ file: 'models/shadow.glb',      height: 1.28, group: 'undead', ghost: 0.84, glow: '#2e1952', glowIntensity: 0.36 }),
  specter:     Object.freeze({ file: 'models/specter.glb',     height: 1.32, group: 'undead', ghost: 0.74, glow: '#8fc5ff', glowIntensity: 0.32 }),
  wight:       Object.freeze({ file: 'models/wight.glb',       height: 1.38, group: 'undead', glow: '#1a332b', glowIntensity: 0.14 }),
  mummy:       Object.freeze({ file: 'models/mummy.glb',       height: 1.34, group: 'undead' }),
  // Goblins, kobolds & constructs
  goblin:         Object.freeze({ file: 'models/goblin.glb',         height: 0.98, group: 'monster' }),
  goblin_boss:    Object.freeze({ file: 'models/goblin_boss.glb',    height: 1.08, group: 'monster' }),
  animated_armor: Object.freeze({ file: 'models/animated_armor.glb', height: 1.36, group: 'monster' }),
  kobold_warrior: Object.freeze({ file: 'models/kobold_warrior.glb', height: 0.94, group: 'monster' }),
});

export const CAST_KEYS = Object.freeze(Object.keys(CAST_MODELS));
// Creatures that share a figure but must look different on the board (the recipes of
// webgame/undead_text.py MODELS): the goblin minion is a smaller, paler goblin than the
// goblin warrior. Only these variants are applied; the original figures keep their own look.
export const CAST_VARIANTS = Object.freeze({
  goblin_minion: Object.freeze({ scale: 0.9, tint: '#e6edcf' }),
});

export function castVariant(unit) {
  if (!unit) return null;
  for (const candidate of [unit.content, String(unit.id || '').split('-')[0], unit.kind]) {
    const name = String(candidate || '').toLowerCase();
    if (Object.hasOwn(CAST_VARIANTS, name)) return CAST_VARIANTS[name];
  }
  return null;
}
export const UNDEAD_KINDS = Object.freeze(['skeleton', 'zombie', 'ghoul', 'ghast', 'shadow', 'specter', 'wight', 'mummy']);
export const MAX_MODEL_BYTES = 5 * 1024 * 1024;
const LOAD_TIMEOUT_MS = 20000;

export function resolveCastKey(unit) {
  if (!unit) return null;
  const baseId = String(unit.base_id || '').toLowerCase();
  const idBase = String(unit.id || '').split('-')[0].toLowerCase();
  const content = String(unit.content || '').toLowerCase();
  const kind = String(unit.kind || '').toLowerCase();
  const stripLevel = s => s.replace(/_l[1-3]$/, '');
  for (const candidate of [baseId, content, idBase, stripLevel(content), stripLevel(idBase), kind]) {
    if (!candidate) continue;
    if (Object.hasOwn(CAST_MODELS, candidate)) return candidate;
    if (candidate === 'goblin_minion' || candidate === 'goblin_warrior' || candidate === 'vault_goblin') return 'goblin';
    if (candidate === 'vault_skeleton') return 'skeleton';
  }
  if (unit.team === 'heroes') {
    const hero = stripLevel(baseId || content || idBase);
    if (Object.hasOwn(CAST_MODELS, hero)) return hero;
    if (kind === 'mage' || unit.model?.base === 'mage') return hero === 'curogana' ? 'curogana' : 'ilyra';
    return hero === 'guy' ? 'guy' : hero === 'elion' ? 'elion' : hero === 'chruna' ? 'chruna' : 'mara';
  }
  if (kind === 'skeleton') return 'skeleton';
  if (kind === 'goblin') return 'goblin';
  return null;
}

export function validateGLB(buffer) {
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 20 || buffer.byteLength > MAX_MODEL_BYTES) {
    throw new Error('Model GLB size is invalid.');
  }
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== buffer.byteLength) {
    throw new Error('Model GLB header is invalid.');
  }
  let offset = 12, json = null;
  while (offset < buffer.byteLength) {
    if (offset + 8 > buffer.byteLength) throw new Error('Truncated GLB.');
    const length = view.getUint32(offset, true), type = view.getUint32(offset + 4, true);
    if (length % 4 || offset + 8 + length > buffer.byteLength) throw new Error('Truncated GLB chunk.');
    if (offset === 12) {
      if (type !== 0x4e4f534a) throw new Error('GLB must start with JSON.');
      json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, offset + 8, length)));
    } else if (type !== 0x004e4942) {
      throw new Error('Unsupported GLB chunk.');
    }
    offset += length + 8;
  }
  (function check(value) {
    if (!value || typeof value !== 'object') return;
    if (Object.hasOwn(value, 'uri')) throw new Error('GLB must contain no external resource URIs.');
    Object.values(value).forEach(check);
  })(json);
  if (json?.asset?.version !== '2.0') throw new Error('Unsupported glTF version.');
  return json;
}

function disposeTemplate(scene) {
  const textures = new Set(), skeletons = new Set();
  scene.traverse(obj => {
    obj.geometry?.dispose();
    if (obj.skeleton) skeletons.add(obj.skeleton);
    for (const mat of Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : []) {
      for (const val of Object.values(mat)) if (val?.isTexture) textures.add(val);
      mat.dispose();
    }
  });
  skeletons.forEach(s => s.dispose());
  textures.forEach(t => { t.dispose(); t.source?.data?.close?.(); });
}

const AREA_STYLES = new Set([
  'turn_undead', 'preserve_life', 'shatter', 'thunderwave', 'burning_hands',
  'dragons_breath', 'acid_splash', 'dreadful_glare',
]);
const MELEE_STYLES = new Set(['slash', 'slam', 'rotting_fist', 'draining_swipe', 'claw', 'bite']);

function findAnchor(root, names, fallbackPos) {
  for (const name of names) {
    const found = root.getObjectByName(name);
    if (found) return found;
  }
  const anchor = new THREE.Object3D();
  anchor.position.set(...fallbackPos);
  root.add(anchor);
  return anchor;
}

function hashPhase(id) {
  let h = 2166136261;
  const s = String(id || '');
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000 * 6.283;
}

export function createCastAsset(gltf, key) {
  const spec = CAST_MODELS[key];
  if (!spec) throw new Error(`Unknown cast key: ${key}`);
  const template = gltf.scene;
  const clips = {};
  for (const clip of gltf.animations || []) {
    // Blender action names export either directly ('idle', 'walk', 'slash') or suffixed; index exact & normalized
    clips[clip.name] = clip;
    const lower = clip.name.toLowerCase();
    if (!clips[lower]) clips[lower] = clip;
  }
  let references = 0, retired = false, released = false;
  function collect() {
    if (retired && !references && !released) { released = true; disposeTemplate(template); }
  }

  return {
    key, spec, clipNames: Object.keys(clips),
    createInstance(unit) {
      if (retired) return null;
      const model = cloneSkinned(template);
      model.name = `cast-${key}`;
      model.position.y += 0.10; // Grounded feet at y=0 rest cleanly atop the 0.10 plinth
      model.userData.castKey = key;
      const variant = castVariant(unit);
      const scale = variant?.scale || 1;
      if (scale !== 1) model.scale.multiplyScalar(scale);
      const tint = variant?.tint ? new THREE.Color(variant.tint) : null;

      const materials = new Map();
      let goblinBlade = null, goblinBow = null;
      model.traverse(obj => {
        delete obj.userData.unitId;
        if (obj.name === 'Goblin_Blade') goblinBlade = obj;
        if (obj.name === 'Goblin_Bow') goblinBow = obj;
        if (!obj.isMesh) return;
        obj.userData.unitId = unit.id;
        obj.castShadow = true;
        obj.receiveShadow = true;
        const own = src => {
          if (!materials.has(src)) {
            const m = src.clone();
            if ('emissiveMap' in m) m.emissiveMap = null;
            if (tint && m.color) m.color.multiply(tint);
            if (spec.ghost) {
              m.transparent = true;
              m.opacity = spec.ghost;
              m.depthWrite = true;
            }
            if (spec.glow && m.emissive) {
              m.emissive.set(spec.glow);
              m.emissiveIntensity = spec.glowIntensity || 0.3;
              m.userData.restEmissive = { color: m.emissive.getHex(), intensity: m.emissiveIntensity };
            } else if (m.emissive && m.emissiveIntensity > 0) {
              m.userData.restEmissive = { color: m.emissive.getHex(), intensity: m.emissiveIntensity };
            }
            m.needsUpdate = true;
            materials.set(src, m);
          }
          return materials.get(src);
        };
        obj.material = Array.isArray(obj.material) ? obj.material.map(own) : own(obj.material);
      });

      const motion = new THREE.Group();
      motion.name = 'cast-motion';
      motion.add(model);

      const mixer = new THREE.AnimationMixer(model);
      const actions = {};
      for (const [name, clip] of Object.entries(clips)) {
        const act = mixer.clipAction(clip);
        act.setLoop(THREE.LoopOnce, 1);
        act.clampWhenFinished = true;
        actions[name] = act;
      }

      const right = findAnchor(model, ['WeaponR', 'Weapon.R', 'HandR', 'Hand.R', 'FistR', 'Fist.R'], [0.22, spec.height * 0.56, -0.18]);
      const left  = findAnchor(model, ['HandL', 'Hand.L', 'FistL', 'Fist.L', 'LowerArmL'], [-0.22, spec.height * 0.56, -0.18]);
      const head  = findAnchor(model, ['Head', 'Mummy_Head'], [0, spec.height * 0.84, -0.12]);

      const phaseOffset = hashPhase(unit.id);
      const BLEND_MS = 140;
      const HERO_WALK_STEP_MS = 320;
      const HERO_RUN_STEP_MS = 200;
      let disposed = false, activeName = null, activeTime = 0;
      let prevName = null, prevTime = 0, blendStartMs = 0, lastClockMs = 0;

      function sampleClip(name, timeSec, { instant = false, clockMs = null } = {}) {
        if (disposed) return false;
        const resolved = actions[name] ? name : 'idle';
        const act = actions[resolved];
        if (!act) return false;
        const now = clockMs !== null ? clockMs : (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const dur = act.getClip().duration || 1;
        const clamped = Math.max(0, Math.min(dur - 1e-4, timeSec));

        // Smoothly crossfade between clips using the caller's animation clock (works identically
        // at 60 fps in the browser and in deterministic fast-forward / headless playback!)
        const clockReset = now < lastClockMs - 1;
        if (!instant && activeName && activeName !== resolved && actions[activeName]?.isRunning()) {
          if (prevName && prevName !== activeName && actions[prevName]) actions[prevName].stop();
          prevName = activeName;
          prevTime = activeTime;
          blendStartMs = now;
        } else if (instant || (prevName && (prevName === resolved || !actions[prevName]?.isRunning()))) {
          if (prevName && prevName !== resolved && actions[prevName]) actions[prevName].stop();
          prevName = null;
        } else if (clockReset && prevName) {
          blendStartMs = now;
        }
        lastClockMs = now;

        let alpha = 1;
        if (prevName && actions[prevName]) {
          const u = Math.max(0, Math.min(1, (now - blendStartMs) / BLEND_MS));
          if (u >= 1) {
            actions[prevName].stop();
            prevName = null;
          } else {
            alpha = u * u * (3 - 2 * u);
          }
        }

        for (const [k, other] of Object.entries(actions)) {
          if (k !== resolved && k !== prevName && other.isRunning()) other.stop();
        }
        if (prevName && actions[prevName]) {
          const pAct = actions[prevName];
          if (!pAct.isRunning()) pAct.reset().play();
          pAct.enabled = true;
          pAct.setEffectiveWeight(1 - alpha);
          pAct.time = prevTime;
        }
        if (!act.isRunning()) act.reset().play();
        act.enabled = true;
        act.setEffectiveWeight(alpha);
        act.time = clamped;
        activeName = resolved;
        activeTime = clamped;
        mixer.update(0);
        model.updateMatrixWorld(true);
        return true;
      }

      function equip(style) {
        if (goblinBlade && goblinBow) {
          const useBow = style === 'arrow';
          goblinBow.visible = useBow;
          goblinBlade.visible = !useBow;
        }
      }
      equip(null);

      function reset() {
        if (disposed) return;
        motion.position.set(0, 0, 0);
        motion.rotation.set(0, 0, 0);
        equip(null);
        sampleClip('idle', 0, { instant: true });
      }

      function idle(nowMs, guarding = false) {
        if (disposed) return;
        motion.position.set(0, 0, 0);
        motion.rotation.set(0, 0, 0);
        if (guarding && actions.guard) {
          const dur = actions.guard.getClip().duration || 0.8;
          sampleClip('guard', dur * 0.42, { clockMs: nowMs });
          return;
        }
        const act = actions.idle;
        if (!act) return;
        const dur = Math.max(0.2, act.getClip().duration);
        const t = ((nowMs * 0.00085) + phaseOffset) % dur;
        sampleClip('idle', t, { clockMs: nowMs });
      }

      function walk(elapsedMs, fast = false) {
        if (disposed) return;
        const clipName = (fast && actions.run) ? 'run' : (actions.walk ? 'walk' : 'idle');
        const act = actions[clipName];
        if (!act) {
          motion.position.y = 0.035 * Math.abs(Math.sin(elapsedMs * 0.012));  // a static figure hops along
          return;
        }
        const dur = Math.max(0.2, act.getClip().duration);
        const strideSpeed = fast ? spec.runSpeed : spec.walkSpeed;
        const stepMs = fast ? HERO_RUN_STEP_MS : HERO_WALK_STEP_MS;
        // Match planted-foot rearward speed directly to straight-path board travel speed (zero skating!)
        const rate = strideSpeed ? (1 / stepMs) / strideSpeed : (fast ? 0.0028 : 0.0022);
        const t = ((elapsedMs * rate) + phaseOffset * 0.2) % dur;
        sampleClip(clipName, t, { clockMs: elapsedMs });
      }

      function pickActionClip(style, actionKind) {
        if (style === 'arrow' && actions.arrow) return 'arrow';
        if (actionKind === 'dodge' || style === 'dodge') return actions.guard ? 'guard' : 'idle';
        if (MELEE_STYLES.has(style) && actions.slash) return 'slash';
        if (style === 'necrotic') return actions.slash ? 'slash' : 'cast';
        if (AREA_STYLES.has(style) && actions.cast_area) return 'cast_area';
        if (actions.cast) return 'cast';
        if (actions.slash) return 'slash';
        return 'idle';
      }

      function settleIdle(clockMs = null) {
        motion.position.set(0, 0, 0);
        motion.rotation.set(0, 0, 0);
        equip(null);
        sampleClip('idle', 0, { clockMs });
      }

      function pose(style, ageMs, actionKind = null) {
        if (disposed) return;
        if (ageMs <= 0 || ageMs >= 800) { settleIdle(ageMs); return; }
        equip(style);
        const clipName = pickActionClip(style, actionKind);
        const act = actions[clipName];
        if (!act) {
          // A static figure (no clips yet): a short lunge toward the target.
          const k = Math.sin(Math.PI * ageMs / 800);
          motion.position.z = -0.14 * k;
          motion.rotation.x = -0.12 * k;
          return;
        }
        const dur = act.getClip().duration || 0.8;
        // Align peak/release to 280ms (~35% of clip), strike follow-through to 420ms (~55%), settle by 800ms
        const peakT = dur * 0.35;
        const strikeT = dur * 0.56;
        const t = ageMs <= 280
          ? (ageMs / 280) * peakT
          : ageMs <= 420
            ? peakT + ((ageMs - 280) / 140) * (strikeT - peakT)
            : strikeT + ((ageMs - 420) / 380) * (dur - strikeT);
        sampleClip(clipName, t, { clockMs: ageMs });
      }

      function hit(hitAgeMs) {
        if (disposed || hitAgeMs < 0) return;
        if (hitAgeMs >= 380) { settleIdle(hitAgeMs); return; }
        if (actions.hit) {
          const dur = actions.hit.getClip().duration || 0.5;
          sampleClip('hit', (hitAgeMs / 380) * dur, { clockMs: hitAgeMs });
        } else {
          const k = Math.sin(Math.PI * hitAgeMs / 380);
          motion.position.z = 0.1 * k;
          motion.rotation.x = 0.16 * k;
        }
      }

      function death(deathAgeMs = 9999) {
        if (disposed || !actions.death) return false;
        motion.position.set(0, 0, 0);
        motion.rotation.set(0, 0, 0);
        const dur = actions.death.getClip().duration || 1.0;
        const t = Math.min(dur - 1e-3, Math.max(0, deathAgeMs / 1000));
        // The settled pose (the clip played out) is set at once. A crossfade here would start
        // at the fixed clock 9999 and never advance, leaving the figure in its previous clip:
        // a hero hit while already down stood up in its idle pose.
        sampleClip('death', t, { clockMs: deathAgeMs, instant: deathAgeMs >= dur * 1000 });
        return true;
      }

      const rig = {
        right, left, head, blade: right, bow: left, model, motion, mixer,
        // Rigged only when the figure has animation clips: a static figure (no clips yet)
        // tips over and dissolves like the procedural ones instead of waiting for a death clip.
        isSkinned: Object.keys(clips).length > 0,
        reset, equip, idle, walk, pose, hit, death,
        dispose() {
          if (disposed) return;
          disposed = true;
          mixer.stopAllAction();
          mixer.uncacheRoot(model);
          model.traverse(o => { if (o.skeleton) o.skeleton.dispose(); });
          materials.forEach(m => m.dispose());
          motion.removeFromParent();
          references--;
          collect();
        },
      };

      references++;
      reset();
      return { model: motion, rig, height: spec.height * scale + 0.1, ownMaterials: [...materials.values()], castKey: key };
    },
    dispose() { retired = true; collect(); },
  };
}

async function boundedFetch(url, fetcher, signal) {
  const response = await fetcher(url, { signal, redirect: 'error', credentials: 'same-origin', cache: 'force-cache' });
  if (!response.ok || response.redirected) throw new Error(`Model unavailable (${response.status}).`);
  const length = Number(response.headers.get('content-length'));
  if (length > MAX_MODEL_BYTES) throw new Error('Model exceeds byte limit.');
  const reader = response.body?.getReader();
  if (!reader) {
    const ab = await response.arrayBuffer();
    if (ab.byteLength > MAX_MODEL_BYTES) throw new Error('Model exceeds byte limit.');
    return ab;
  }
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_MODEL_BYTES) throw new Error('Model exceeds byte limit.');
      chunks.push(value);
    }
  } catch (err) {
    await reader.cancel().catch(() => {});
    throw err;
  }
  const out = new Uint8Array(bytes);
  let off = 0;
  for (const ch of chunks) { out.set(ch, off); off += ch.byteLength; }
  return out.buffer;
}

export async function parseCastGLB(buffer, key) {
  validateGLB(buffer);
  const manager = new THREE.LoadingManager();
  manager.setURLModifier(url => {
    if (!url.startsWith('blob:')) throw new Error('External model resource rejected.');
    return url;
  });
  const gltf = await new GLTFLoader(manager).parseAsync(buffer, '');
  try { return createCastAsset(gltf, key); }
  catch (err) { disposeTemplate(gltf.scene); throw err; }
}

let prepared = new Map(), pending = new Map(), states = new Map(), generation = 0;
const controllers = new Set(), listeners = new Set();

export function onCastLoaded(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCastState() {
  return Object.fromEntries(CAST_KEYS.map(k => [k, states.get(k)?.status || 'unprepared']));
}

export function getUndeadState() {
  return Object.fromEntries(UNDEAD_KINDS.map(k => [k, states.get(k)?.status || 'unprepared']));
}

export function getAssetState() {
  const wiz = states.get('ilyra') || states.get('curogana');
  return {
    status: wiz?.status || 'loaded',
    url: wiz?.url || null,
    error: wiz?.error || null,
    cast: getCastState(),
    undead: getUndeadState(),
  };
}

export function createCastInstance(unit) {
  const key = resolveCastKey(unit);
  return key ? prepared.get(key)?.createInstance(unit) || null : null;
}

export function castReadyFor(unit) {
  const key = resolveCastKey(unit);
  return key ? prepared.has(key) : false;
}

export function requestCastModel(key, { pageURL = globalThis.location?.href, fetcher = globalThis.fetch } = {}) {
  if (!Object.hasOwn(CAST_MODELS, key)) return Promise.resolve('unknown');
  if (pending.has(key)) return pending.get(key);
  let url;
  try {
    url = new URL('./' + versioned(CAST_MODELS[key].file), new URL('./', pageURL));
    if (url.origin !== new URL(pageURL).origin || !['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Unsupported model origin.');
    }
  } catch (err) {
    states.set(key, { status: 'fallback', error: String(err.message) });
    const f = Promise.resolve('fallback');
    pending.set(key, f);
    return f;
  }
  const current = generation, controller = new AbortController();
  controllers.add(controller);
  states.set(key, { status: 'loading', url: url.href, error: null });
  const load = (async () => {
    const timeout = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);
    try {
      const buffer = await boundedFetch(url.href, fetcher, controller.signal);
      const asset = await parseCastGLB(buffer, key);
      if (generation !== current || controller.signal.aborted) { asset.dispose(); return 'disposed'; }
      prepared.set(key, asset);
      states.set(key, { status: 'loaded', url: url.href, error: null });
      for (const fn of [...listeners]) { try { fn(key); } catch { /* isolated */ } }
      return 'loaded';
    } catch (err) {
      if (generation === current) states.set(key, { status: 'fallback', url: url.href, error: String(err.message) });
      return generation === current ? 'fallback' : 'disposed';
    } finally {
      clearTimeout(timeout);
      controllers.delete(controller);
    }
  })();
  pending.set(key, load);
  return load;
}

export async function prepareAssets(options = {}) {
  // The page passes the figures of the chosen encounter (options.keys); the video
  // renderer preloads the whole cast. Anything else streams in when it appears.
  const keys = options.keys ? options.keys.filter(k => Object.hasOwn(CAST_MODELS, k)) : CAST_KEYS;
  await Promise.all(keys.map(k => requestCastModel(k, options)));
  return getAssetState();
}

export function disposeAssets() {
  generation++;
  controllers.forEach(c => c.abort());
  controllers.clear();
  prepared.forEach(a => a.dispose());
  prepared = new Map();
  pending = new Map();
  states = new Map();
}
