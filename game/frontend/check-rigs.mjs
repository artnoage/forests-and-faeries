// Run from an installed game/frontend checkout. Both game directories are read-only.
// node game/frontend/check-rigs.mjs --before /path/to/old/game --after game --heroes guy,mara
// --report-only records known failures in a baseline. The default exit code checks the after assets.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { AnimationMixer, MeshStandardMaterial, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import validator from 'gltf-validator';

// Each held object has a socket and the bone the socket must follow. Shields ride the left
// forearm. Chruna's second hand must follow the same physical haft (game/tools/figures/grips.py).
const gear = {
  guy: [['Sword', /^Weapon\.R$/, 'Hand.R', ['Hand.R']]],
  mara: [['Sword', /^Weapon\.R$/, 'Hand.R', ['Hand.R']], ['Shield', /^Shield\.L$/, 'LowerArm.L', ['LowerArm.L']]],
  elion: [['Warhammer', /^Weapon\.R$/, 'Hand.R', ['Hand.R']], ['Shield', /^Shield\.L$/, 'LowerArm.L', ['LowerArm.L']]],
  ilyra: [['Staff', /^Weapon\.R$/, 'Hand.R', ['Hand.R']]],
  chruna: [['Halberd', /^Weapon\.[LR]$/, null, ['Hand.L', 'Hand.R']]],
  curogana: [],
  kobold_warrior: [['Dagger', /^Weapon\.R$/, 'Hand.R', ['Hand.R']]],
};
const heroes = ['guy', 'mara', 'elion', 'ilyra', 'chruna', 'curogana'];
const commonClips = ['idle', 'walk', 'run', 'guard', 'hit', 'death'];
const attacks = { guy: ['slash'], mara: ['slash', 'cast'], elion: ['slash', 'cast', 'cast_area'],
  ilyra: ['cast', 'cast_area'], chruna: ['slash', 'cast'], curogana: ['cast', 'cast_area'],
  kobold_warrior: ['slash', 'arrow'] };
const budget = 4 * 1024 * 1024; // scripts/check_exclusions.py publication limit
const timeStep = 1000 / 120;
const round = n => Math.round(n * 1e6) / 1e6;
const compact = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');

async function openRig(game, name) {
  const runtime = await import(pathToFileURL(path.join(game, 'frontend/skinned-cast.js')).href);
  const bytes = await readFile(path.join(game, 'static', runtime.CAST_MODELS[name].file));
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const doc = runtime.validateGLB(buffer);
  const { issues: validation } = await validator.validateBytes(bytes, { maxIssues: 1000 });
  const gltfValidation = { errors: validation.numErrors, warnings: validation.numWarnings,
    codes: [...new Set(validation.messages.filter(m => m.severity <= 1).map(m => m.code))].sort() };
  // Decode the exported geometry, skins and animations with the game's loader. Textures need no GPU.
  const loader = new GLTFLoader().register(() => ({
    name: 'rig-audit-materials', loadMaterial: () => new MeshStandardMaterial(),
  }));
  const gltf = await loader.parseAsync(buffer, '');
  gltf.scene.traverse(obj => {
    const index = gltf.parser.associations.get(obj)?.nodes;
    if (index !== undefined) obj.userData.rigAuditNode = index;
  });
  const asset = runtime.createCastAsset(gltf, name);
  const { rig } = asset.createInstance({ id: name, content: name, team: name === 'kobold_warrior' ? 'monsters' : 'heroes' });
  rig.mixer.stopAllAction();
  rig.model.updateMatrixWorld(true);
  const objects = new Map(), meshes = [];
  rig.model.traverse(obj => {
    const index = obj.userData.rigAuditNode;
    if (index !== undefined) objects.set(index, obj);
    if (obj.isMesh) meshes.push(obj);
  });
  return { name, doc, asset, rig, clips: gltf.animations, objects, meshes, gltfValidation, bytes: bytes.length,
    height: runtime.CAST_MODELS[name].height };
}

function objectName(obj) {
  return obj.userData.name || obj.name;
}

function worldPoint({ mesh, index }, target = new Vector3()) {
  return mesh.getVertexPosition(index, target).applyMatrix4(mesh.matrixWorld);
}

// Index surface landmarks in the rest pose. TEXCOORD_0 identifies corresponding material
// vertices when Gemini splits a formerly welded object without repainting its texture.
function vertices(r) {
  const points = [], byUV = new Map();
  for (const mesh of r.meshes) {
    const attributes = mesh.geometry.attributes;
    for (let i = 0; i < attributes.position.count; i++) {
      const point = { mesh, index: i, bone: null, weight: 0 };
      point.rest = worldPoint(point);
      if (mesh.isSkinnedMesh) {
        for (let j = 0; j < 4; j++) {
          const w = attributes.skinWeight.getComponent(i, j);
          if (w > point.weight) {
            point.weight = w;
            point.bone = mesh.skeleton.bones[attributes.skinIndex.getComponent(i, j)];
          }
        }
      }
      if (attributes.uv) {
        point.uv = [attributes.uv.getX(i), attributes.uv.getY(i)].map(v => Math.round(v * 1e6)).join(',');
        if (!byUV.has(point.uv)) byUV.set(point.uv, []);
        byUV.get(point.uv).push(point);
      }
      points.push(point);
    }
  }
  return { points, byUV };
}

function equipment(r, before) {
  const { nodes } = r.doc;
  const parents = new Map(nodes.flatMap((node, i) => (node.children || []).map(child => [child, i])));
  const joints = new Set(r.doc.skins.flatMap(s => s.joints));
  const issues = [], present = {}, pairs = [];
  const expected = [...gear[r.name]];
  if (r.name === 'curogana' && nodes.some(n => n.mesh !== undefined && /focus/i.test(n.name))) {
    expected.push(['Focus', /^Weapon\.[LR]$/, null, []]);
  }
  const claimed = new Set();
  for (const [part, socketRule, fixedAnchor, grips] of expected) {
    // Back-mounted and held copies are separate objects; never count the stowed head as a held one.
    const i = nodes.findIndex(n => n.mesh !== undefined && compact(n.name || '').endsWith(compact(part)) &&
      (part.startsWith('Back') || part === 'Shield' || !compact(n.name || '').includes('back')));
    if (i < 0) { issues.push('missing separate ' + part); continue; }
    claimed.add(i);
    const parent = parents.get(i), socket = nodes[parent]?.name || '';
    const anchor = fixedAnchor || (socket.endsWith('.L') ? 'Hand.L' : 'Hand.R');
    let a = parent;
    while (a !== undefined && nodes[a].name !== anchor) a = parents.get(a);
    const rigid = nodes[i].skin === undefined && r.doc.meshes[nodes[i].mesh].primitives.every(p =>
      !Object.keys(p.attributes).some(k => /^(JOINTS|WEIGHTS)_/.test(k)));
    const attached = socketRule.test(socket) && a !== undefined && joints.has(a) &&
      (joints.has(parent) || nodes[parent]?.mesh === undefined);
    present[part] = { object: nodes[i].name, socket, anchor, rigid, attached };
    if (!rigid || !attached) issues.push(part + ' has invalid skin or socket ancestry');
    const object = r.objects.get(i), partMeshes = new Set();
    object?.traverse(o => { if (o.isMesh) partMeshes.add(o); });
    const surface = r.vertices.points.filter(p => partMeshes.has(p.mesh));
    const gripBones = part === 'Focus' ? [anchor] : grips;
    for (const boneName of gripBones) {
      const body = r.vertices.points.filter(p => !partMeshes.has(p.mesh) && p.bone && objectName(p.bone) === boneName &&
        p.rest.distanceTo(p.bone.getWorldPosition(new Vector3())) < r.height * .12);
      // Prefer the authored grip on the off hand of a two-handed weapon; the socket marks its main grip.
      const marker = grips.length > 1 && boneName !== anchor
        ? r.objects.get(nodes.findIndex(n => n.name === boneName.replace('Hand.', 'Grip.'))) : r.objects.get(parent);
      const center = marker?.getWorldPosition(new Vector3());
      const local = center ? surface.filter(p => p.rest.distanceTo(center) <= .12 * r.height) : surface;
      const candidates = local.length ? local : surface;
      const prior = new Map();
      if (before) {
        for (const p of body) prior.set(p, transfer(p, before, true));
        for (const p of candidates) prior.set(p, transfer(p, before));
      }
      let nearest, matched, distance = Infinity, pairedDistance = Infinity;
      for (const hand of body) for (const weapon of candidates) {
        const d = hand.rest.distanceToSquared(weapon.rest);
        if (d < distance) { distance = d; nearest = { hand, weapon }; }
        if (d < pairedDistance && prior.get(hand) && prior.get(weapon)) {
          pairedDistance = d;
          matched = { hand, weapon, before: { hand: prior.get(hand), weapon: prior.get(weapon) } };
        }
      }
      // A new handle may have brand-new UVs. A distant matched blade vertex is not a measured grip.
      const pair = matched && Math.sqrt(pairedDistance) <= Math.sqrt(distance) + .02 * r.height ? matched : nearest;
      if (pair) pairs.push({ label: part + '/' + boneName, ...pair });
      else issues.push('no grip surface for ' + part + '/' + boneName);
    }
  }
  for (const [i, node] of nodes.entries()) {
    if (node.mesh !== undefined && /sword|shield|staff|warhammer|halberd|dagger|focus/i.test(node.name) && !claimed.has(i)) {
      issues.push('unverified equipment object: ' + node.name);
    }
  }
  return { issues, present, pairs };
}

function transfer(point, baseline, hand = false) {
  const candidates = (baseline.vertices.byUV.get(point.uv) || []).filter(p =>
    !hand || (p.bone && objectName(p.bone) === objectName(point.bone)));
  candidates.sort((a, b) => a.rest.distanceToSquared(point.rest) - b.rest.distanceToSquared(point.rest));
  const best = candidates[0];
  if (!best || best.rest.distanceTo(point.rest) > baseline.height * .05) return null;
  // Distinct geometry at a duplicated UV must be distinguishable in the bind pose.
  if (candidates.some(p => p.rest.distanceTo(best.rest) > .001 &&
    p.rest.distanceTo(point.rest) < best.rest.distanceTo(point.rest) + .001)) return null;
  return best;
}

function gripGaps(r, pairs) {
  const out = {};
  // Sample fixed material points on the hand and handle; the nearest points are chosen only once.
  const mixer = new AnimationMixer(r.rig.model);
  for (const { label, hand, weapon } of pairs) {
    out[label] = { hand_weight: round(hand.weight), by_clip: {} };
    for (const clip of r.clips) {
      mixer.clipAction(clip).play();
      const dist = [];
      const frames = Math.max(2, Math.ceil(60 * clip.duration));
      for (let f = 0; f < frames; f++) {
        mixer.setTime(clip.duration * f / frames);
        r.rig.model.updateMatrixWorld(true);
        dist.push(worldPoint(hand).distanceTo(worldPoint(weapon)));
      }
      dist.sort((a, b) => a - b);
      out[label].by_clip[clip.name] = { p95: round(dist[Math.ceil(.95 * frames) - 1]), max: round(dist.at(-1)) };
      mixer.stopAllAction();
    }
  }
  r.rig.model.updateMatrixWorld(true);
  return out;
}

function soles(r) {
  const feet = {};
  for (const side of ['L', 'R']) {
    const vertices = r.vertices.points.filter(p => p.bone && objectName(p.bone) === 'Foot.' + side);
    if (!vertices.length) throw Error(r.name + ' has no weighted foot vertices on ' + side);
    const minY = Math.min(...vertices.map(p => p.rest.y));
    const cells = new Map();
    for (const p of vertices) {
      if (p.rest.y > minY + .03 * r.height) continue;
      const cell = [p.rest.x, p.rest.z].map(v => Math.floor(v / (.015 * r.height))).join(',');
      if (!cells.has(cell) || p.rest.y < cells.get(cell).rest.y) cells.set(cell, p);
    }
    feet[side] = [...cells.values()];
  }
  return feet;
}

// Evaluate the same material point at both ends of an interval. A changing heel/toe support
// point must not itself add horizontal displacement to the reported ground slip.
export function stanceStep(previous, current, boardTravel, ground) {
  let best = -1, lowest = Infinity;
  for (let i = 0; i < previous.length; i++) {
    const h = Math.max(previous[i].y, current[i].y);
    if (h < lowest) { lowest = h; best = i; }
  }
  if (lowest > ground || best === -1) return null;
  const a = previous[best], b = current[best];
  return Math.hypot(b.x - a.x, b.z - a.z - boardTravel);
}

function gait(r, feet, name, stepMs) {
  const clip = r.clips.find(c => c.name === name);
  if (!clip) throw Error('missing ' + name + ' clip');
  const action = r.rig.mixer.existingAction(clip);
  const ground = Math.min(...Object.values(feet).flat().map(p => p.rest.y)) + .02 * r.height;
  let previous, phase = 0, wraps = 0, intervals = 0;
  const dist = { L: 0, R: 0 }, count = { L: 0, R: 0 };
  for (let i = 0; i <= 1200; i++) {
    r.rig.walk(i * timeStep, name === 'run');
    r.rig.model.updateMatrixWorld(true);
    const nextPhase = action.time / clip.duration;
    const wrapped = nextPhase < phase - .5;
    const frame = Object.fromEntries(Object.entries(feet).map(([side, points]) => [side, points.map(p => worldPoint(p))]));
    if (wraps === 1) {
      intervals++;
      for (const side of ['L', 'R']) {
        const step = stanceStep(previous[side], frame[side], timeStep / stepMs, ground);
        if (step !== null) { dist[side] += step; count[side]++; }
      }
    }
    if (wrapped && ++wraps === 2) {
      return { cycle_ms: round(intervals * timeStep), step_ms: stepMs,
        feet: Object.fromEntries(['L', 'R'].map(s => [s, { drift: count[s] ? round(dist[s]) : null,
          contact_fraction: round(count[s] / intervals), probes: feet[s].length }])) };
    }
    phase = nextPhase;
    previous = frame;
  }
  throw Error('could not observe a full ' + name + ' playback cycle');
}

async function stepTimes(game) {
  // Read the straight-path board timing from the same archived renderer as its animation mixer.
  const src = await readFile(path.join(game, 'frontend/scene3d.js'), 'utf8');
  const m = src.match(/\bstepMs\s*=\s*isDash\s*\?\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
  if (!m) throw Error('cannot identify playback step durations in scene3d.js');
  return { walk: Number(m[2]), run: Number(m[1]) };
}

function report(r, equipment, pairs, steps, required) {
  const clips = r.clips.map(c => c.name).sort();
  const issues = [...equipment.issues];
  if (r.gltfValidation.errors) issues.push('glTF validator errors: ' + r.gltfValidation.codes.join(', '));
  if (r.bytes > budget) issues.push('over 4 MiB publication budget');
  for (const name of new Set([...commonClips, ...attacks[r.name], ...required])) {
    if (!clips.includes(name)) issues.push('missing clip: ' + name);
  }
  const grips = gripGaps(r, pairs);
  const feet = soles(r), gaitReport = {};
  for (const name of ['walk', 'run']) {
    if (clips.includes(name)) {
      gaitReport[name] = gait(r, feet, name, steps[name]);
      for (const [side, result] of Object.entries(gaitReport[name].feet)) {
        if (result.drift === null) issues.push(name + ': no observed ground contact on ' + side);
      }
    }
  }
  return { bytes: r.bytes, publication_budget_bytes: budget, gltf_validation: r.gltfValidation, clips, attachments: equipment.present,
    grip_gap: grips, gait: gaitReport, issues };
}

async function compare(before, after, hero, steps) {
  const a = await openRig(after, hero);
  a.vertices = vertices(a);
  const original = before ? await openRig(before, hero) : null;
  if (original) original.vertices = vertices(original);
  const gearAfter = equipment(a, original);
  const paired = [], unmatched = [];
  let beforeReport;
  if (original) {
    for (const pair of gearAfter.pairs) {
      if (pair.before) paired.push({ label: pair.label, ...pair.before });
      else unmatched.push(pair.label);
    }
    beforeReport = report(original, equipment(original), paired, steps.before, []);
  }
  const afterReport = report(a, gearAfter, gearAfter.pairs, steps.after, original?.clips.map(c => c.name) || []);
  for (const model of [original, a].filter(Boolean)) { model.rig.dispose(); model.asset.dispose(); }
  return { before: beforeReport, after: afterReport, ...(before ? { unmatched_before_grips: unmatched } : {}) };
}

async function main() {
  const { values } = parseArgs({ options: { before: { type: 'string' }, after: { type: 'string', default: 'game' },
    heroes: { type: 'string', default: heroes.join(',') }, 'report-only': { type: 'boolean' } } });
  const before = values.before && path.resolve(values.before), after = path.resolve(values.after);
  const steps = { before: before && await stepTimes(before), after: await stepTimes(after) };
  const results = {};
  for (const name of values.heroes.split(',')) {
    if (!Object.hasOwn(gear, name)) throw Error('unknown model: ' + name);
    try { results[name] = await compare(before, after, name, steps); }
    catch (error) { results[name] = { error: error.message }; }
  }
  console.log(JSON.stringify({ units: 'board squares', frequency_hz: 120, contact_height_fraction: .02, results }, null, 2));
  if (Object.values(results).some(r => r.error || (!values['report-only'] && r.after.issues.length))) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
