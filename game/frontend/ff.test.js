// Unit checks for the Forests and Faeries scene modules and page files.
//   cd webgame/ff/frontend && npm ci && node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as THREE from 'three';
import { resolveCastKey, validateGLB, CAST_MODELS, createCastAsset, castVariant } from './skinned-cast.js';
import { THEMES, THEME_CATALOG, resolveTheme } from './dungeon-themes.js';
import { versioned } from './asset-versions.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const ff = path.resolve(here, '..');
const read = rel => readFileSync(path.join(ff, rel), 'utf8');
const json = rel => JSON.parse(read(rel));

const encounterFiles = dir => readdirSync(path.join(ff, dir)).filter(f => f.endsWith('.json')).map(f => json(`${dir}/${f}`));
const encounters = [...encounterFiles('encounters'), ...encounterFiles('encounters/private')];

test('every hero and monster of the catalogue has a figure', () => {
  for (const enc of encounters) {
    for (const preset of enc.presets) {
      for (const hero of preset.party) assert.ok(resolveCastKey({ content: hero, team: 'heroes', id: hero }), hero);
      for (const monster of preset.roster) {
        const key = resolveCastKey({ content: monster, team: 'monsters', id: `${monster}-1` });
        assert.ok(key && CAST_MODELS[key], monster);
      }
    }
  }
  assert.equal(resolveCastKey({ content: 'goblin_minion', team: 'monsters' }), 'goblin');
  assert.equal(resolveCastKey({ content: 'goblin_warrior', team: 'monsters' }), 'goblin');
  assert.equal(resolveCastKey({ content: 'goblin_boss', team: 'monsters' }), 'goblin_boss');
  assert.equal(resolveCastKey({ content: 'animated_armor', team: 'monsters', id: 'animated_armor-1' }), 'animated_armor');
  assert.equal(resolveCastKey({ content: 'kobold_warrior', team: 'monsters', id: 'kobold_warrior-1' }), 'kobold_warrior');
  for (const base of ['guy', 'elion', 'curogana', 'mara', 'ilyra', 'chruna']) {
    for (const lv of [1, 2, 3]) {
      assert.equal(resolveCastKey({ content: `${base}_l${lv}`, base_id: base, level: lv, team: 'heroes', id: `${base}_l${lv}` }), base);
      assert.equal(resolveCastKey({ content: `${base}_l${lv}`, team: 'heroes', id: `${base}_l${lv}` }), base);
    }
  }
  assert.equal(resolveCastKey({ content: 'unknown_creature', team: 'monsters', id: 'unknown-1', kind: 'unknown' }), null);
});

test('every catalogue theme exists, and the mausoleum themes light violet', () => {
  const ids = new Set(THEME_CATALOG.map(t => t.id));
  for (const enc of encounters) {
    assert.ok(THEMES[enc.theme] && ids.has(enc.theme), enc.theme);
    for (const preset of enc.presets) if (preset.theme) assert.ok(THEMES[preset.theme], preset.theme);
  }
  for (const id of ['mausoleum', 'mausoleum_crypt', 'mausoleum_caves']) {
    assert.ok(THEMES[id].flame && /^#[89a-c]/i.test(THEMES[id].torchColor), id);
    assert.equal(resolveTheme({ theme: id }, null).id, id);
  }
  assert.equal(resolveTheme({ theme: 'ossuary' }, 'mausoleum').id, 'mausoleum', 'an explicit choice wins');
});

test('the mausoleum texture paths are the ones the server allows', () => {
  const server = read('assets.py');
  for (const set of Object.values(THEMES.mausoleum.textures)) {
    for (const file of typeof set === 'string' ? [set] : Object.values(set)) {
      const name = path.basename(file, '.webp');
      assert.ok(server.includes(`'${name}'`), `${file} is in TEXTURE_FILES`);
    }
  }
});

test('GLB validation refuses external resources and bad headers', () => {
  const encode = obj => {
    const text = new TextEncoder().encode(JSON.stringify(obj));
    const padded = new Uint8Array(Math.ceil(text.length / 4) * 4).fill(0x20);
    padded.set(text);
    const buffer = new ArrayBuffer(12 + 8 + padded.length);
    const view = new DataView(buffer);
    view.setUint32(0, 0x46546c67, true); view.setUint32(4, 2, true); view.setUint32(8, buffer.byteLength, true);
    view.setUint32(12, padded.length, true); view.setUint32(16, 0x4e4f534a, true);
    new Uint8Array(buffer, 20).set(padded);
    return buffer;
  };
  assert.ok(validateGLB(encode({ asset: { version: '2.0' } })));
  assert.throws(() => validateGLB(encode({ asset: { version: '2.0' }, images: [{ uri: 'https://example.com/x.png' }] })));
  assert.throws(() => validateGLB(new ArrayBuffer(8)));
});

test('the page has no inline styles or scripts and no private paths', () => {
  const html = read('static/index.html');
  assert.doesNotMatch(html, /\sstyle\s*=/i);
  assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)[^>]*>\s*\S/i);
  assert.doesNotMatch(html, /\son[a-z]+\s*=\s*["']/i);
  for (const id of ['difficulty-step', 'levels-step', 'difficulty-tabs', 'hero-level-tabs', 'art-armor', 'art-kobold', 'art-barbarian']) {
    assert.ok(html.includes(`id="${id}"`), `index.html contains #${id}`);
  }
  const app = read('static/app.js');
  assert.doesNotMatch(app, /\bstyle\s*=\s*\\?["'`]/i, 'no style="" built in app.js');
  for (const text of [html, app, read('static/style.css')]) {
    assert.doesNotMatch(text, /\/home\/|theater/i);
  }
});

test('the release models match the figures the scene knows', () => {
  const models = readdirSync(path.join(ff, 'static/models')).sort();
  assert.deepEqual(models, Object.values(CAST_MODELS).map(m => path.basename(m.file)).sort());
});


test('no inline style text: the canvas is sized by the stylesheet (Firefox CSP)', () => {
  // Gecko refuses style text under style-src 'self'; single CSSOM properties set by
  // three.js and OrbitControls (cursor, touchAction) are allowed in every browser.
  const bundle = read('static/scene3d.js');
  assert.doesNotMatch(bundle, /cssText/, 'no style.cssText in the bundle');
  assert.doesNotMatch(bundle, /setAttribute\(\s*["']style["']/, 'no style attribute writes in the bundle');
  for (const file of ['scene3d.js', 'dungeon-themes.js', 'assets.js', 'skinned-cast.js', 'combat-effects.js', 'character-motion.js']) {
    let source;
    try { source = read(`frontend/${file}`); } catch { continue; }
    assert.doesNotMatch(source, /\.style\.[A-Za-z]+\s*=[^=]|cssText|setAttribute\(\s*["']style/, `${file} sets no inline style`);
  }
  assert.doesNotMatch(read('static/app.js'), /cssText|setAttribute\(\s*["']style/);
  const css = read('static/style.css');
  const rule = css.match(/\.scene-view canvas\s*\{([^}]*)\}/);
  assert.ok(rule && /width:\s*100%/.test(rule[1]) && /height:\s*100%/.test(rule[1]) && /touch-action:\s*none/.test(rule[1]));
  assert.match(css, /\.scene-view canvas\.is-busy\s*\{[^}]*cursor:\s*progress/);
});

function fakeGltf({ clips = [] } = {}) {
  const scene = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshStandardMaterial({ color: '#ffffff' }));
  mesh.name = 'Body';
  scene.add(mesh);
  const animations = clips.map(name => new THREE.AnimationClip(name, 1, [
    new THREE.NumberKeyframeTrack('Body.position[y]', [0, 1], [0, 0.1]),
  ]));
  return { scene, animations };
}

test('a static figure is not treated as rigged; a figure with clips is', () => {
  const still = createCastAsset(fakeGltf(), 'goblin').createInstance({ id: 'goblin_warrior-1', content: 'goblin_warrior', team: 'monsters' });
  assert.equal(still.rig.isSkinned, false, 'no clips: tips over and dissolves on death');
  assert.equal(still.rig.death(500), false);
  const rigged = createCastAsset(fakeGltf({ clips: ['idle', 'death'] }), 'goblin').createInstance({ id: 'goblin_warrior-1', content: 'goblin_warrior', team: 'monsters' });
  assert.equal(rigged.rig.isSkinned, true);
  assert.equal(rigged.rig.death(500), true);
});

test('the goblin minion is a smaller, paler goblin than the warrior', () => {
  assert.deepEqual(castVariant({ content: 'goblin_minion' }), { scale: 0.9, tint: '#e6edcf' });
  assert.equal(castVariant({ content: 'goblin_warrior' }), null);
  assert.equal(castVariant({ id: 'goblin_minion-2' })?.scale, 0.9);
  const asset = createCastAsset(fakeGltf(), 'goblin');
  const colorOf = inst => { let c = null; inst.model.traverse(o => { if (o.isMesh) c = o.material.color.getHexString(); }); return c; };
  const scaleOf = inst => inst.model.children[0].scale.x;
  const minion = asset.createInstance({ id: 'goblin_minion-1', content: 'goblin_minion', team: 'monsters' });
  const warrior = asset.createInstance({ id: 'goblin_warrior-1', content: 'goblin_warrior', team: 'monsters' });
  assert.equal(scaleOf(minion), 0.9);
  assert.equal(scaleOf(warrior), 1);
  assert.equal(colorOf(warrior), 'ffffff');
  assert.equal(colorOf(minion), new THREE.Color('#ffffff').multiply(new THREE.Color('#e6edcf')).getHexString());
  assert.ok(minion.height < warrior.height);
});

test('catalogue blurbs list three heroes with commas', () => {
  for (const enc of encounters) {
    for (const preset of enc.presets) {
      assert.doesNotMatch(preset.blurb, /\b\w+ and \w+ and \w+/, `${enc.id}/${preset.id}: ${preset.blurb}`);
      assert.doesNotMatch(preset.blurb, /mummys/);
    }
  }
});


test('every figure is rigged with the clips the scene plays', async () => {
  const { createHash } = await import('node:crypto');
  const need = { mara: ['slash', 'cast', 'guard'], ilyra: ['cast', 'cast_area'], chruna: ['slash', 'cast', 'guard'], goblin: ['slash', 'arrow'],
    goblin_boss: ['slash', 'arrow'], animated_armor: ['slash', 'guard'], kobold_warrior: ['slash', 'arrow', 'guard'],
    guy: ['slash'], elion: ['cast'], curogana: ['cast'] };
  for (const [key, spec] of Object.entries(CAST_MODELS)) {
    const bytes = readFileSync(path.join(ff, 'static', spec.file));
    const doc = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString('utf8'));
    const clips = new Set((doc.animations || []).map(a => a.name));
    for (const name of ['idle', 'walk', 'hit', 'death', ...(need[key] || [])]) assert.ok(clips.has(name), `${key} has ${name}`);
    assert.ok(!(doc.images || []).some(i => i.uri) && !(doc.buffers || []).some(b => b.uri), `${key} is self-contained`);
    const packRe = new RegExp(['quater' + 'nius', 'Warrior_' + 'Texture', 'Rogue_' + 'Texture', 'Wizard_' + 'Texture'].join('|'), 'i');
    assert.doesNotMatch(JSON.stringify(doc), packRe, key);
    // The scene asks for the content-hashed URL, so a new figure is never a cached old one.
    const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
    assert.equal(versioned(spec.file), `${spec.file}?v=${digest}`, `${key} URL carries its hash`);
    const rigidExpected = {
      guy: [['Guy_Sword', 'Weapon.R']],
      mara: [['Mara_Sword', 'Weapon.R'], ['Mara_Shield', 'Shield.L']],
      elion: [['Elion_Warhammer', 'Weapon.R'], ['Elion_BackShield', 'BackShield']],
      ilyra: [['Ilyra_Staff', 'Weapon.R']],
      chruna: [['Chruna_Halberd', 'Weapon.R'], ['Chruna_BackHalberd', 'BackWeapon']],
      kobold_warrior: [['Kobold_Dagger', 'Weapon.R']],
    };
    if (Object.hasOwn(rigidExpected, key)) {
      const nodes = doc.nodes || [];
      for (const [objName, sockName] of rigidExpected[key]) {
        const sock = nodes.find(n => n.name === sockName);
        const obj = nodes.find(n => n.name === objName);
        assert.ok(sock && obj && obj.mesh !== undefined && obj.skin === undefined, `${key}: ${objName} is a rigid non-skinned mesh`);
        assert.ok((sock.children || []).map(i => nodes[i]?.name).includes(objName), `${key}: ${objName} is parented under ${sockName}`);
      }
    }
  }
  assert.equal(versioned('not/listed.glb'), 'not/listed.glb');
});

test('clip transitions crossfade smoothly and reset snaps deterministically', () => {
  const scene = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshStandardMaterial({ color: '#ffffff' }));
  body.name = 'Body';
  scene.add(body);
  const animations = [
    new THREE.AnimationClip('idle', 1, [new THREE.NumberKeyframeTrack('Body.position[y]', [0, 1], [0, 0])]),
    new THREE.AnimationClip('walk', 1, [new THREE.NumberKeyframeTrack('Body.position[y]', [0, 1], [1, 1])]),
  ];
  const inst = createCastAsset({ scene, animations }, 'guy').createInstance({ id: 'guy', content: 'guy', team: 'heroes' });
  const mesh = inst.model.getObjectByName('Body');
  inst.rig.idle(1000);
  assert.equal(mesh.position.y, 0);
  // Start walking at clock 0 -> 70ms is halfway through the 140ms smoothstep crossfade (weight 0.5)!
  inst.rig.walk(0, false);
  inst.rig.walk(70, false);
  assert.ok(mesh.position.y > 0.35 && mesh.position.y < 0.65, `mid-blend y=${mesh.position.y}`);
  // After 140ms the crossfade completes cleanly onto the target clip
  inst.rig.walk(160, false);
  assert.ok(Math.abs(mesh.position.y - 1) < 1e-4, `post-blend y=${mesh.position.y}`);
  // reset() snaps cleanly back to idle without waiting for a blend
  inst.rig.reset();
  assert.equal(mesh.position.y, 0);
  inst.rig.dispose();
});

test('r9 combat rules UI guards cover, Scorching Ray follow-ups, OA/heal warnings, and dice tags', () => {
  const app = read('static/app.js');
  assert.match(app, /for \(const k of \[[^\]]*'cover'[^\]]*'aid_no_hp_targets'/, 'expandState unpacks cover and aid_no_hp_targets');
  assert.match(app, /if \(t === 'death_saving_throw'\) return 'Death save';/, 'death_saving_throw has its own dice label');
  assert.match(app, /if \(t === 'savage_attacker'\) return 'Savage Attacker';/, 'savage_attacker has its own dice label');
  assert.match(app, /\$\('chooser-back'\)\.hidden = rayLocked;/, 'Scorching Ray follow-ups cannot be dismissed');
  assert.match(app, /moveProvokers\(/, 'opportunity-attack move guard is wired');
  assert.match(app, /cursedWarning\(/, 'cursed-target heal warning is wired');
  assert.match(app, /champion-free-move/, 'Remarkable Athlete free movement badge is rendered');
  const html = read('static/index.html');
  assert.match(html, /Scorching Ray.*one ray at a time/i, 'How to play documents ray-by-ray Scorching Ray');
  assert.match(html, /cover.*corner-to-corner/i, 'How to play documents corner-to-corner cover');
  assert.match(html, /Command.*Grovel\/Halt/i, 'How to play documents the current Command limitation');
});
