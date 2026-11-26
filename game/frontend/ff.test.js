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
  for (const fey of ['violet_fungus', 'giant_wasp', 'satyr', 'steam_mephit', 'blink_dog', 'sprite',
    'dryad', 'bugbear_warrior', 'harpy', 'sea_hag', 'green_hag', 'will_o_wisp']) {
    assert.equal(resolveCastKey({ content: fey, team: 'monsters', id: `${fey}-1` }), fey);
  }
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
  assert.ok(THEMES.woodland && ids.has('woodland'), 'woodland theme exists in catalog');
  assert.equal(resolveTheme({ scene: { theme: 'woodland' } }, null).id, 'woodland', 'scene.theme resolves to woodland');
  assert.equal(resolveTheme({ tiles: ['#####', '#.T.#', '#####'] }, null).id, 'woodland', 'T tree cells default to woodland');
  assert.equal(resolveTheme({ scene: { theme: 'woodland' }, tiles: ['#####', '#.T.#', '#####'] }, 'caverns').id, 'caverns', 'explicit override beats woodland');
  assert.equal(resolveTheme({ theme: 'ossuary' }, 'mausoleum').id, 'mausoleum', 'an explicit choice wins');
});

test('forest maps use woodland theme and oak_tree.glb prop is valid and versioned', async () => {
  const { createHash } = await import('node:crypto');
  for (const mapId of ['whispering_glade', 'bramble_hollow', 'mire_crossing']) {
    const doc = json(`maps/${mapId}.json`);
    assert.equal(doc.scene?.theme, 'woodland', `${mapId} sets scene.theme = woodland`);
  }
  const bytes = readFileSync(path.join(ff, 'static/props/oak_tree.glb'));
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const gltf = validateGLB(ab);
  assert.ok(gltf.meshes?.length >= 2, 'oak_tree.glb has trunk and canopy meshes');
  const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  assert.equal(versioned('props/oak_tree.glb'), `props/oak_tree.glb?v=${digest}`, 'oak_tree.glb carries content hash');
  assert.ok(read('assets.py').includes("'props/oak_tree.glb'"), 'oak_tree.glb is in PROP_FILES');
  assert.ok(read('catalogue.py').includes("'woodland'"), 'woodland is in catalogue THEMES');
  assert.ok(read('static/app.js').includes("id: 'woodland'"), 'woodland is in THEME_SWATCHES');
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

test('a figure that dies after another clip lies down; a revived one stands', () => {
  // Each clip holds Body at its own height: idle 0, hit 0.2, death -1 (lying).
  const scene = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshStandardMaterial());
  body.name = 'Body'; scene.add(body);
  const clip = (name, y) => new THREE.AnimationClip(name, 1, [new THREE.NumberKeyframeTrack('Body.position[y]', [0, 1], [y, y])]);
  const inst = createCastAsset({ scene, animations: [clip('idle', 0), clip('hit', 0.2), clip('death', -1)] }, 'goblin')
    .createInstance({ id: 'goblin_warrior-1', content: 'goblin_warrior', team: 'monsters' });
  const y = () => { let v = null; inst.model.traverse(o => { if (o.name === 'Body') v = o.position.y; }); return v; };
  inst.rig.idle(120000);
  assert.equal(y(), 0);
  inst.rig.hit(500);   // a hit settles back into idle
  inst.rig.death(9999);
  assert.ok(Math.abs(y() + 1) < 1e-6, `lying after death(9999), got ${y()}`);
  inst.rig.death(9999);
  assert.ok(Math.abs(y() + 1) < 1e-6, 'still lying on the next update');
  inst.rig.reset();
  assert.equal(y(), 0, 'reset stands the figure up');
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
      elion: [['Elion_Warhammer', 'Weapon.R'], ['Elion_Shield', 'Shield.L']],
      ilyra: [['Ilyra_Staff', 'Weapon.R']],
      chruna: [['Chruna_Halberd', 'Weapon.R']],
      kobold_warrior: [['Kobold_Dagger', 'Weapon.R']],
      bugbear_warrior: [['Bugbear_Hammer', 'Weapon.R']],
      sprite: [['Sprite_Needle_Sword', 'Weapon.R']],
    };
    if (Object.hasOwn(rigidExpected, key)) {
      const nodes = doc.nodes || [];
      for (const [objName, sockName] of rigidExpected[key]) {
        const sock = nodes.find(n => n.name === sockName);
        const obj = nodes.find(n => n.name === objName);
        assert.ok(sock && obj && obj.mesh !== undefined && obj.skin === undefined, `${key}: ${objName} is a rigid non-skinned mesh`);
        assert.ok((sock.children || []).map(i => nodes[i]?.name).includes(objName), `${key}: ${objName} is parented under ${sockName}`);
      }
      // Only the gear on the character sheet is modelled (one halberd for Chruna, Elion's shield on his arm).
      const gear = nodes.filter(n => n.mesh !== undefined && n.skin === undefined).map(n => n.name).sort();
      assert.deepEqual(gear, rigidExpected[key].map(([objName]) => objName).sort(), `${key}: no gear beyond the sheet`);
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
  // Verify DAMAGE_DEFENSES in app.js stays in exact sync with engine/content/srd/*.json
  const m = app.match(/const DAMAGE_DEFENSES = (\{[\s\S]*?\n  \});/);
  assert.ok(m, 'DAMAGE_DEFENSES table present in app.js');
  const uiDefenses = Function(`"use strict"; return (${m[1]});`)();
  const srdDir = path.resolve(ff, '../engine/content/srd');
  const expected = {};
  for (const file of readdirSync(srdDir).filter(f => f.endsWith('.json')).sort()) {
    const doc = JSON.parse(readFileSync(path.join(srdDir, file), 'utf8'));
    const dmg = doc.damage || {};
    if ((dmg.resistances?.length || 0) + (dmg.immunities?.length || 0) + (dmg.vulnerabilities?.length || 0) > 0) {
      expected[doc.id] = {
        resistances: [...(dmg.resistances || [])].sort(),
        immunities: [...(dmg.immunities || [])].sort(),
        vulnerabilities: [...(dmg.vulnerabilities || [])].sort(),
      };
    }
  }
  assert.deepEqual(Object.keys(uiDefenses).sort(), Object.keys(expected).sort(), 'DAMAGE_DEFENSES keys match SRD content pack');
  for (const [id, exp] of Object.entries(expected)) {
    assert.deepEqual({
      resistances: [...uiDefenses[id].resistances].sort(),
      immunities: [...uiDefenses[id].immunities].sort(),
      vulnerabilities: [...uiDefenses[id].vulnerabilities].sort(),
    }, exp, `${id} defenses match SRD JSON`);
  }
});

test('release copy covers Unbeatable tier, reaction refresh, engine credits, and sheet clarifications', () => {
  const app = read('static/app.js');
  const html = read('static/index.html');
  const licenses = read('static/licenses.html');
  const css = read('static/style.css');

  // Unbeatable fourth difficulty tier & accurate threshold copy
  assert.match(app, /id:\s*'Unbeatable'/, 'DIFFICULTIES includes Unbeatable');
  assert.match(app, /No language-model player won these levels, and both game AIs won fewer than half of their 500 games\./, 'Unbeatable description states the AI win threshold');
  assert.match(css, /\.tier-unbeatable\b/, 'style.css styles .tier-unbeatable');
  assert.match(css, /\.level-tier\.unbeatable\b/, 'style.css styles .level-tier.unbeatable');

  // Reaction refresh and engine attribution copy
  assert.match(html, /regain your reaction at the start of your turn/i, 'How to play explains when reactions refresh');
  assert.match(html, /Reactions are currently automatic/i, 'How to play notes automatic reactions');
  assert.match(html, /ember-rs/i, 'meta description credits ember-rs');
  assert.match(licenses, /ember-rs/i, 'licenses.html credits ember-rs');
  assert.match(licenses, /rules reference/i, 'licenses.html describes Natural20 as rules reference');

  // Sheet-text clarifications for the r9 wheel (codex rules-review.md)
  const fnMatch = app.match(/function normalizeSheetItem\(item\)\s*\{[\s\S]*?\n  \}/);
  assert.ok(fnMatch, 'normalizeSheetItem helper present in app.js');
  const normalizeSheetItem = Function(`"use strict"; ${fnMatch[0]}; return normalizeSheetItem;`)();

  const cmd = normalizeSheetItem({ name: 'Command', text: 'Level 1. WIS save or the target falls Prone.' });
  assert.match(cmd.text, /Grovel/i);
  assert.match(cmd.text, /Halt/i);

  const glare = normalizeSheetItem({ name: 'Dreadful Glare', text: "One creature within 60 ft makes a WIS save (DC 11) or is Frightened until the end of the mummy's next turn. On a success it is immune to this mummy's Glare." });
  assert.match(glare.text, /can see/i);
  assert.match(glare.text, /24 hours/i);

  const savage = normalizeSheetItem({ name: 'Savage Attacker', text: "Once per turn, roll a weapon hit's damage dice twice and keep the higher total." });
  assert.match(savage.text, /either roll/i);
  assert.match(savage.text, /automatically/i);

  const surge = normalizeSheetItem({ name: 'Action Surge', text: 'Take one extra action this turn. One use.' });
  assert.match(surge.text, /except the Magic action/i);
  const surgeL3 = normalizeSheetItem({ name: 'Action Surge', text: 'Once per Short or Long Rest, take one extra action on your turn, except the Magic action.' });
  assert.equal(surgeL3.text, 'Once per Short or Long Rest, take one extra action on your turn, except the Magic action.');

  const orb = normalizeSheetItem({ name: 'Chromatic Orb', text: 'Level 1. Ranged attack, 3d8 damage of a type you pick.' });
  assert.match(orb.text, /leaps to another target within 30 ft/i);

  const shield = normalizeSheetItem({ name: 'Shield', text: 'Level 1 reaction (automatic): +5 AC against the triggering hit.' });
  assert.match(shield.text, /start of your next turn/i);
  assert.match(shield.text, /Magic Missile/i);

  // Promoted encounters keep the 4 ranked cards at 10 / 10 / 13 / 3 (with Crypt & Vault separated into Classic)
  const pubEncounters = encounterFiles('encounters');
  const legacyIds = new Set(['crypt', 'vault']);
  const rankedCounts = { Easy: 0, Medium: 0, Hard: 0, Unbeatable: 0 };
  let classicCount = 0;
  for (const e of pubEncounters) {
    for (const p of e.presets.filter(p => !p.story)) {   // a story's own chapter levels are not in Practice
      if (legacyIds.has(e.id)) classicCount++;
      else rankedCounts[p.difficulty] = (rankedCounts[p.difficulty] || 0) + 1;
      assert.doesNotMatch(p.name, /\(\+[12] monsters?\)/i, `${e.id}/${p.id} has no dev suffix`);
    }
  }
  assert.deepEqual(rankedCounts, { Easy: 10, Medium: 10, Hard: 13, Unbeatable: 3 });
  assert.equal(classicCount, 11);
  assert.match(app, /LEGACY_ENCOUNTERS = new Set\(\['crypt', 'vault'\]\)/, 'app.js separates legacy Crypt & Vault into Classic');
  assert.match(app, /legacy \? 'Classic · ungraded' : p\.difficulty/, 'deployment preset dropdown marks legacy encounters as Classic · ungraded');
  const unbeatable = pubEncounters.filter(e => !legacyIds.has(e.id)).flatMap(e => e.presets.filter(p => p.difficulty === 'Unbeatable').map(p => `${e.id}/${p.id}`)).sort();
  assert.deepEqual(unbeatable, [
    'bell_court/l1_the_bell_steps_plus1_v3',
    'reed_lock/l1_the_towpath_v3',
    'reed_lock/l3_the_stone_sill_plus1_v3',
  ]);
});

test('camera: no top-down mode; the director, its zoom option and the HUD-free framing are wired', () => {
  const html = read('static/index.html'), app = read('static/app.js'), scene = read('frontend/scene3d.js');
  assert.doesNotMatch(html, /data-cam="overhead"|Top-down/, 'the top-down button is gone');
  assert.doesNotMatch(app + scene, /'overhead'|'topdown'/, 'the top-down mode is gone');
  assert.match(html, /id="action-zoom-toggle"/);
  assert.match(html, /<kbd>Z<\/kbd> zoom on action/);
  for (const name of ['directTurn', 'setAutoCamera', 'setActionZoom', 'getDirectorState', 'setSafeArea']) {
    assert.match(scene, new RegExp(`function ${name}\\(`), name);
    assert.match(scene, new RegExp(`\\b${name},`), `${name} is exported`);
  }
  assert.match(app, /viewer\.directTurn\?\.\(u\.id/, 'turn starts go to the director');
  assert.match(app, /viewer\.setSafeArea\?\.\(sceneSafeArea\(\)\)/, 'the HUD-free area reaches the camera');
  assert.match(app, /localStorage\.setItem\('ff-cam-zoom'/, 'the zoom option is remembered');
  // The player's drag or wheel takes the camera; reduced motion never zooms in on action.
  assert.match(scene, /function wheelInterrupt\(\) \{ takeCamera\(\); \}/);
  assert.match(scene, /const zoom = actionZoom && !reducedMotion/);
});

// Pull named top-level helpers out of app.js (they use nothing from the page).
const appHelpers = (...names) => {
  const app = read('static/app.js');
  const parts = names.map(n => {
    const fn = app.match(new RegExp(`\\n  function ${n}\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}`));
    const konst = app.match(new RegExp(`\\n  const ${n} = [^\\n]*;`)) || app.match(new RegExp(`\\n  const ${n} = [\\[{]\\n[\\s\\S]*?\\n  [\\]}];`));
    assert.ok(fn || konst, `${n} present in app.js`);
    return (fn || konst)[0];
  });
  return Function(`"use strict"; ${parts.join('\n')}; return { ${names.join(', ')} };`)();
};

test('downed heroes: the death-save tally is read from the engine log (SRD 5.2.1)', () => {
  const { deathSaveTally, deathSaveNote } = appHelpers('deathSaveTally', 'deathSaveNote');
  const log = [
    { id: 1, text: 'Guy falls unconscious.' },
    { id: 2, text: 'Wight 2 makes the Wisdom save against Sanctuary on Guy (13 vs DC 13). The attack proceeds.' },
    { id: 3, text: 'Guy takes damage while unconscious: 1 death-save failure.' },
    { id: 4, text: 'Guy: death save d20(14) = 14.' },
    { id: 5, text: 'Guy Junior: death fail d20(3) = 3.' },
    { id: 6, text: 'Guy takes a critical hit: 2 death-save failures.' },
  ];
  const a = deathSaveTally(log.slice(0, 4), ['Guy', 'Guy Junior']);
  assert.deepEqual(a.tally.Guy, { saves: 1, fails: 1 });
  assert.deepEqual(a.notes[3], { name: 'Guy', kind: 'hit', saves: 0, fails: 1 });
  assert.equal(deathSaveNote(a.notes[4]), 'Death saves: 1 success, 1 failure (of 3).');
  const b = deathSaveTally(log, ['Guy', 'Guy Junior']);
  assert.deepEqual(b.tally['Guy Junior'], { saves: 0, fails: 1 }, 'the longest name wins');
  assert.equal(deathSaveNote(b.notes[6]), 'Three failures: dead.');
  assert.deepEqual(b.tally.Guy, { saves: 0, fails: 0 }, 'reset after the third failure');
  // A natural 1 is two failures; three successes and healing reset the tally; so does Stable.
  const c = deathSaveTally([
    { id: 1, text: 'Mara falls unconscious.' },
    { id: 2, text: 'Mara: death fail d20(1) = 1 (2 failures).' },
    { id: 3, text: 'Mara regains 6 HP from Healing Word (2d4(3, 1) + 3 = 7).' },
    { id: 4, text: 'Mara falls unconscious.' },
    { id: 5, text: 'Mara: death save d20(12) = 12.' },
    { id: 6, text: 'Elion casts Spare the Dying.' },
    { id: 7, text: 'Mara takes damage while unconscious: 1 death-save failure.' },
  ], ['Mara'], [[6, 'Mara']]);
  assert.deepEqual(c.notes[2], { name: 'Mara', kind: 'fail', saves: 0, fails: 2 });
  assert.deepEqual(c.notes[5], { name: 'Mara', kind: 'save', saves: 1, fails: 0 });
  assert.deepEqual(c.tally.Mara, { saves: 0, fails: 1 }, 'Spare the Dying cleared the earlier success');
  const d = deathSaveTally([{ id: 1, text: 'Ilyra: death save d20(20) = 20.' }], ['Ilyra']);
  assert.match(deathSaveNote(d.notes[1]), /natural 20/);
});

test('Sanctuary: its end is read from the action records, with the reason', () => {
  const { wardEndNotes } = appHelpers('wardEndNotes');
  const unit = (id, marks = [], extra = {}) => ({ id, marks, conditions: [], ...extra });
  const rec = (id, kind, source_id, before, after) => ({ id, kind, source_id, before: { log_id: 10 * id, units: before }, after: { log_id: 10 * id + 3, units: after } });
  const names = { elion: 'Elion', guy: 'Guy', 'wight-1': 'Wight 1' };
  const notes = wardEndNotes([
    rec(1, 'attack', 'elion', [unit('elion', ['sanctuary'])], [unit('elion')]),
    rec(2, 'spell', 'guy', [unit('guy', ['sanctuary'])], [unit('guy')]),
    rec(3, 'attack', 'wight-1', [unit('guy', ['sanctuary'])], [unit('guy', ['sanctuary'])]),
    rec(4, 'end_turn', 'wight-1', [unit('elion', ['sanctuary'])], [unit('elion')]),
  ], id => names[id]);
  assert.deepEqual(notes.map(n => n.text), [
    'Sanctuary on Elion ends: Elion made an attack roll.',
    'Sanctuary on Guy ends: Guy cast a spell.',
    'Sanctuary on Elion ends.',
  ]);
  assert.equal(notes[0].after, 13);
  const app = read('static/app.js');
  assert.match(app, /const WARD_SAVE = /, 'the engine Sanctuary save line is recognised');
  assert.match(app, /recordCues\(rec, data\.log, data\.units\)/, 'replayed records carry the ward and death-save cues');
});

test('a figure that died stands up again in the next fight (retry, Practice restart, healing)', () => {
  const scene = read('frontend/scene3d.js');
  assert.match(scene, /entry\.lying = true;/);
  assert.match(scene, /if \(entry\.lying\) \{ entry\.rig\.reset\?\.\(\); entry\.lying = false; \}/);
  assert.match(scene, /stableRing/, 'Stable has its own ring');
  assert.match(scene, /'DYING'/, 'the label of a dying hero says so, with its death-save pips');
});

test('one card per ability: damage types, thrown use and exchanges are variants of one card', () => {
  const { groupKey, variantOf, variantsOf, variantNoun, pickVariant, variantText } = appHelpers('catOf', 'VARIANT_DAMAGE', 'variantOf', 'groupKey', 'variantsOf', 'variantNoun', 'pickVariant', 'variantText');
  const spell = (label, at) => ({ category: 'spell', kind: 'spell', label, spell: 'chromatic_orb', spell_level: 1, at_level: at });
  const orbs = ['acid', 'cold', 'fire', 'lightning', 'poison', 'thunder'].flatMap(t => [spell(`Chromatic Orb (${t})`, 1), spell(`Chromatic Orb (${t})`, 2)]);
  assert.equal(new Set(orbs.map(groupKey)).size, 1, 'every Chromatic Orb is one card');
  assert.deepEqual(variantsOf(orbs), ['acid', 'cold', 'fire', 'lightning', 'poison', 'thunder']);
  assert.equal(variantNoun(orbs), 'Damage type');
  assert.equal(variantText('Damage type', 'fire'), 'Fire');
  // The variant the player picked wins, then the one remembered for this card, then the first.
  assert.equal(pickVariant(variantsOf(orbs), 'cold', 'fire'), 'cold');
  assert.equal(pickVariant(variantsOf(orbs), null, 'fire'), 'fire');
  assert.equal(pickVariant(variantsOf(orbs), 'psychic', 'gone'), 'acid');
  // Sorcerous Burst and Dragon's Breath also come in damage types; the exhale is its own card.
  assert.equal(groupKey({ category: 'spell', label: 'Sorcerous Burst (psychic)' }), groupKey({ category: 'spell', label: 'Sorcerous Burst (acid)' }));
  assert.notEqual(groupKey({ category: 'spell', label: "Dragon's Breath (fire)" }), groupKey({ category: 'spell', label: "Dragon's Breath: exhale" }));
  // A dagger and its thrown use: Melee first.
  const daggers = [{ category: 'attack', label: 'Dagger (thrown)' }, { category: 'attack', label: 'Dagger' }];
  assert.equal(groupKey(daggers[0]), groupKey(daggers[1]));
  assert.deepEqual(variantsOf(daggers), ['', 'thrown']);
  assert.deepEqual(variantsOf(daggers).map(v => variantText(variantNoun(daggers), v)), ['Melee', 'Thrown']);
  // Font of Magic's exchanges and Preserve Life's shares are one card each.
  const fom = ['create level 1 spell slot (2 sorcery points)', 'convert level 2 spell slot to sorcery points'].map(t => ({ category: 'feature', label: `Font of Magic: ${t}` }));
  assert.equal(groupKey(fom[0]), groupKey(fom[1]));
  assert.equal(variantText('Exchange', variantOf(fom[0]).value), 'Create a level 1 slot (2 points)');
  assert.equal(variantOf({ label: 'Preserve Life (Guy +8 HP, Chruna +7 HP)' }).base, 'Preserve Life');
  // Not variants: Mage Armor already active, Spiritual Weapon's strike, and Divine Spark's modes
  // (one label; its heal/harm modes are the existing Mode pills).
  assert.notEqual(groupKey({ category: 'spell', label: 'Mage Armor (already active)' }), groupKey({ category: 'spell', label: 'Mage Armor' }));
  assert.notEqual(groupKey({ category: 'spell', label: 'Spiritual Weapon: strike' }), groupKey({ category: 'spell', label: 'Spiritual Weapon' }));
  assert.equal(groupKey({ category: 'feature', label: 'Divine Spark', option: 'heal' }), groupKey({ category: 'feature', label: 'Divine Spark', option: 'harm' }));
  // UI only: the actions themselves (and their ids) are untouched.
  assert.deepEqual(orbs[0], spell('Chromatic Orb (acid)', 1));
});

test('ability info: the sheet text (with its corrections), cost, uses, range, roll and dice', () => {
  const { abilityInfo } = appHelpers('catOf', 'VARIANT_DAMAGE', 'variantOf', 'variantText', 'normalizeSheetItem', 'BASIC_INFO', 'UNARMED_INFO', 'SPELL_RANGE', 'THROWN_RANGE', 'nameKey', 'sheetNames', 'findSheetItem', 'poolsFor', 'poolLeft', 'abilityInfo');
  const facts = info => Object.fromEntries(info.facts);
  const sorcerer = {
    stats: 'High elf · CHA 18 CON 20 · Spell save DC 14, attack +6 · Speed 30 ft',
    features: [{ name: 'Font of Magic', text: 'Three sorcery points, spent on Metamagic.' }],
    spells: [
      { name: 'Chromatic Orb', text: 'Level 1. Ranged attack, 3d8 damage of a type you pick.' },
      { name: 'Burning Hands', text: 'Level 1. 15-ft cone, DEX save, 3d6 fire (half on a success).' },
      { name: 'Magic Missile', text: 'Level 1. Three darts of 1d4+1 force that never miss; split them as you like. One free cast.' },
    ],
  };
  const pools = [{ label: 'Level 1 slots', value: 2, max: 3 }, { label: 'Sorcery points', value: 1, max: 3 }, { label: 'Magic Initiate (magic missile)', value: 1, max: 1 }];
  const orb = abilityInfo('Chromatic Orb', [{ category: 'spell', kind: 'spell', label: 'Chromatic Orb (fire)', spell: 'chromatic_orb', spell_level: 1, at_level: 1, cost: 'action + level 1 slot' }], sorcerer, pools);
  assert.match(orb.text, /leaps to another target/, 'normalizeSheetItem corrections apply');
  assert.equal(orb.variant, 'Fire');
  assert.deepEqual(facts(orb), { Cost: 'Action + level 1 slot · Level 1 slots: 2 of 3 left', Range: '90 ft', Roll: 'Spell attack +6', Damage: '3d8 fire' });
  const hands = abilityInfo('Burning Hands', [{ category: 'spell', kind: 'spell', label: 'Burning Hands', spell: 'burning_hands', spell_level: 1, at_level: 2, metamagic: 'empowered_spell', cost: 'action + level 2 slot + sorcery points' }], sorcerer, pools);
  assert.equal(facts(hands).Area, '15-ft cone');
  assert.equal(facts(hands).Roll, 'DEX save, DC 14 (half on a success)');
  assert.match(facts(hands).Cost, /Sorcery points: 1 of 3 left/);
  assert.equal(facts(hands).Upcast, 'Cast with a level 2 slot');
  const missile = abilityInfo('Magic Missile', [{ category: 'spell', kind: 'spell', label: 'Magic Missile', spell: 'magic_missile', spell_level: 1, at_level: 1, free_cast: true, cost: 'action + Magic Initiate free cast' }], sorcerer, pools);
  assert.equal(facts(missile).Roll, 'None: it always hits');
  assert.match(facts(missile).Cost, /Magic Initiate \(magic missile\): 1 of 1 left/);
  const fom = abilityInfo('Font of Magic', [{ category: 'feature', kind: 'create_spell_slot', label: 'Font of Magic: create level 1 spell slot (2 sorcery points)', cost: 'bonus action' }], sorcerer, pools);
  assert.match(fom.text, /2 points for a level 1 slot/);
  // Weapons: reach, thrown range, two-weapon lines and monster lines.
  const barb = { features: [{ name: 'Halberd', text: '+5, 1d10+3 slashing. Heavy, reach 10 ft, two-handed. Mastery: Cleave.' }] };
  assert.deepEqual(facts(abilityInfo('Halberd', [{ category: 'attack', kind: 'attack', label: 'Halberd', cost: 'action' }], barb, [])), { Cost: 'Action', Range: 'Reach 10 ft', Roll: 'Attack roll +5', Damage: '1d10+3 slashing' });
  const wiz = { features: [{ name: 'Dagger', text: '+4 to hit, 1d4+2 piercing.' }], spells: [{ name: 'Fire Bolt', text: '' }] };
  assert.equal(facts(abilityInfo('Dagger', [{ category: 'attack', kind: 'attack', label: 'Dagger (thrown)', cost: 'action' }], wiz, [])).Range, 'Thrown 20/60 ft');
  assert.equal(abilityInfo('Fire Bolt', [{ category: 'spell', kind: 'spell', label: 'Fire Bolt', spell: 'fire_bolt', spell_level: 0, cost: 'action' }], wiz, []).text, 'Cantrip. Ranged attack, 1d10 fire.', 'an empty sheet text falls back');
  const wight = { features: [{ name: 'Necrotic Sword / Bow', text: '+4, 1d8+2 plus 1d8 necrotic. Two attacks per action.' }] };
  assert.match(abilityInfo('Necrotic Bow', [{ category: 'attack', kind: 'attack', label: 'Necrotic Bow', cost: 'action' }], wight, []).text, /Two attacks/);
  const mummy = { features: [{ name: 'Rotting Fist (x2)', text: '+5, 1d10+3 bludgeoning plus 3d6 necrotic.' }] };
  assert.equal(facts(abilityInfo('Rotting Fist', [{ category: 'attack', kind: 'attack', label: 'Rotting Fist', cost: 'action' }], mummy, [])).Damage, '1d10+3 bludgeoning · 3d6 necrotic');
  // Basic actions every creature has, in SRD 5.2.1 wording.
  assert.match(abilityInfo('Dash', [{ category: 'dash', kind: 'dash', label: 'Dash', cost: 'action' }], barb, []).text, /extra movement equal to your Speed/);
  assert.match(abilityInfo('Dodge', [{ category: 'dodge', kind: 'dodge', label: 'Dodge', cost: 'action' }], barb, []).text, /Disadvantage if you can see the attacker/);
  assert.match(abilityInfo('Disengage', [{ category: 'feature', kind: 'disengage', label: 'Disengage', cost: 'action' }], barb, []).text, /doesn’t provoke Opportunity Attacks/);
  assert.match(abilityInfo('Move', [{ category: 'move', kind: 'move', label: 'Move', cost: '10 ft' }], barb, []).text, /up to your Speed/);
  assert.match(abilityInfo('Unarmed Attack', [{ category: 'attack', kind: 'attack', label: 'Unarmed Attack', cost: 'action' }], barb, []).text, /1 \+ your Strength modifier/);
  assert.match(abilityInfo('Stand', [{ category: 'stand', kind: 'stand', label: 'Stand', cost: 'movement' }], barb, []).text, /half your Speed/);
  assert.match(abilityInfo('First Aid', [{ category: 'feature', kind: 'first_aid', label: 'First Aid', cost: 'action' }], barb, []).text, /DC 10 Wisdom \(Medicine\).*Stable/);
  assert.match(abilityInfo('Escape Grapple', [{ category: 'feature', kind: 'escape_grapple', label: 'Escape Grapple', cost: 'action' }], barb, []).text, /Athletics.*Acrobatics.*Grappled/);
  assert.match(abilityInfo('Break Free', [{ category: 'feature', kind: 'break_free', label: 'Break Free', cost: 'action' }], barb, []).text, /Athletics.*Restrained/);
});

test('the character sheet and the ability info are wired into the page', () => {
  const html = read('static/index.html'), app = read('static/app.js'), css = read('static/style.css');
  for (const id of ['sheet-dialog', 'sheet-units', 'sheet-body', 'close-sheet', 'ability-info', 'ability-info-inline', 'ability-info-toggle']) assert.match(html, new RegExp(`id="${id}"`), id);
  assert.match(app, /\$\('hero-roster'\)\.innerHTML = heroList\.map\(u => slot\(u\)\)/, 'every hero card has a Sheet button');
  assert.match(app, /poolsSeen\.set\(data\.turn_id/, 'the sheet keeps the last pools seen for each figure');
  assert.match(css, /@media \(max-width: 900px\), \(hover: none\)/, 'touch screens get the ⓘ About toggle');
});
