import * as THREE from 'three';

// Presentation only: native event positions and actual HP amounts are the sole
// authority. In particular, never reconstruct an attack from snapshot HP deltas.
const MAX_ACTIVE = 20, MAX_QUEUED = 36, MAX_QUEUE_AGE = 1800;
const STYLES = new Set(['rotting_fist', 'dreadful_glare', 'necrotic', 'draining_swipe', 'healing_word', 'slash', 'arrow', 'firebolt', 'magic_missile', 'heal', 'generic', 'sorcerous_burst', 'life_drain', 'turn_undead', 'sacred_flame', 'guiding_bolt', 'divine_spark', 'cure_wounds', 'preserve_life', 'burning_hands', 'thunderwave', 'shatter', 'acid_splash', 'dragons_breath', 'chromatic_orb', 'ray_of_frost', 'scorching_ray', 'spiritual_weapon', 'buff', 'command', 'undead', 'touch']);
// Styles with no projectile of their own: the impact burst (and, for some, an
// extra build below) carries the effect.
const NO_PROJECTILE = new Set(['rotting_fist', 'dreadful_glare', 'necrotic', 'draining_swipe', 'healing_word', 'generic', 'life_drain', 'turn_undead', 'sacred_flame', 'guiding_bolt', 'divine_spark', 'cure_wounds', 'preserve_life', 'burning_hands', 'thunderwave', 'shatter', 'acid_splash', 'dragons_breath', 'chromatic_orb', 'ray_of_frost', 'scorching_ray', 'spiritual_weapon', 'buff', 'command', 'undead', 'touch']);
// Styles tinted by the native damage type of the event.
const TYPED = new Set(['scorching_ray', 'ray_of_frost', 'chromatic_orb', 'dragons_breath', 'acid_splash', 'shatter', 'thunderwave', 'burning_hands', 'divine_spark', 'guiding_bolt', 'sacred_flame', 'generic', 'sorcerous_burst']);
// Styles whose use rolls against several creatures: play every target, not three.
const MULTI = new Set(['dragons_breath', 'acid_splash', 'shatter', 'thunderwave', 'burning_hands', 'preserve_life', 'turn_undead', 'magic_missile', 'scorching_ray']);
// Per-style builders. A builder receives a context (scene group, impact group,
// native coordinates, colour, helpers) and returns an update(age, info)
// function, or null (reduced motion, or nothing extra to draw). The base burst,
// label and flash always remain.
const CUSTOM = {};
const COLORS = { slash: '#fff0c1', arrow: '#f4dcb0', firebolt: '#ff842e', magic_missile: '#80eeff', heal: '#86f3ac', generic: '#e8e0c8',
  rotting_fist: '#d8b46a', dreadful_glare: '#ffbe3d',
  sorcerous_burst: '#c9a0ff', life_drain: '#9be07a', turn_undead: '#ffe9a0', touch: '#ffffff', necrotic: '#7d3fb8', draining_swipe: '#c9b8e8', undead: '#9bbf5a', command: '#e8d9a8', buff: '#ffffff', spiritual_weapon: '#bfe0ff', scorching_ray: '#ff842e', ray_of_frost: '#9fdcff', chromatic_orb: '#c9a0ff', dragons_breath: '#ff9a3c', acid_splash: '#b6f06a', shatter: '#c7b6ff', thunderwave: '#c7b6ff', burning_hands: '#ff842e', preserve_life: '#ffe7a3', healing_word: '#c9ffd9', cure_wounds: '#bfffd0', divine_spark: '#ffe9a0', guiding_bolt: '#fff2a8', sacred_flame: '#fff2a8' };
// Generic spell bursts take the colour of the native damage type.
const DAMAGE_COLORS = { fire: '#ff842e', cold: '#9fdcff', lightning: '#fff08a', thunder: '#c7b6ff', acid: '#b6f06a',
  poison: '#8fd36a', necrotic: '#a07cd8', radiant: '#fff2a8', force: '#b9a4ff', psychic: '#ff9fe0',
  slashing: '#fff0c1', piercing: '#f4dcb0', bludgeoning: '#e8d8c0' };
const FORWARD = new THREE.Vector3(0, 0, 1);
const clamp = THREE.MathUtils.clamp;

// Sacred Flame: a column of radiant fire drops from above onto the target
// (DEX save: it lands either way; the label says what the save did).
CUSTOM.sacred_flame = c => {
  const { group, mat, mesh, geo, color, target, releaseAt, impactAt } = c;
  const column = new THREE.Group(); column.name = 'sacred-flame-column'; group.add(column);
  column.position.set(target.x, 0, target.z);
  const core = mesh(column, geo.cylinder, mat('#fff8d0', 0.85, true), 0, 1.7, 0, 0.12, 3.4, 0.12); core.name = 'flame-core';
  mesh(column, geo.cylinder, mat(color, 0.32, true), 0, 1.7, 0, 0.3, 3.4, 0.3).name = 'flame-glow';
  const petals = [];
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3, petal = mesh(column, geo.cone, mat('#ffd877', 0.7, true), Math.cos(a) * 0.2, 0.45, Math.sin(a) * 0.2, 0.09, 0.8, 0.09);
    petal.name = 'flame-petal'; petal.userData.phase = a; petals.push(petal);
  }
  return (age, { elapsedImpact }) => {
    const fall = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1);
    column.visible = age >= releaseAt && elapsedImpact < 520;
    column.position.y = (1 - fall) * (1 - fall) * 3.4 - 0.05;
    const flare = elapsedImpact > 0 ? 1 + Math.min(elapsedImpact / 120, 1) * 0.8 - clamp((elapsedImpact - 150) / 370, 0, 1) * 1.6 : 1;
    column.scale.set(Math.max(0.05, flare), 1, Math.max(0.05, flare));
    petals.forEach(p => { p.scale.y = 0.8 + 0.35 * Math.sin(age * 0.03 + p.userData.phase * 3); });
  };
};

// Guiding Bolt: a radiant comet flies to the target and leaves a golden mark
// there (the next attack against it has Advantage). The lasting marker on the
// figure itself comes from the unit's `marks`, drawn by scene3d.
CUSTOM.guiding_bolt = c => {
  const { group, mat, mesh, geo, source, target, color, releaseAt, impactAt, impact } = c;
  const comet = new THREE.Group(); comet.name = 'guiding-comet'; group.add(comet);
  mesh(comet, geo.sphere, mat('#ffffff'), 0, 0, 0, 0.15).name = 'comet-head';
  mesh(comet, geo.sphere, mat(color, 0.55, true), 0, 0, 0, 0.3).name = 'comet-glow';
  const tail = [];
  for (let i = 0; i < 8; i++) {
    const item = mesh(group, geo.sphere, mat(i % 2 ? '#ffe9a0' : '#fff6cf', 0.7 - i * 0.07, true), 0, 0, 0, 0.13 - i * 0.012);
    item.name = 'comet-tail'; tail.push(item);
  }
  const mark = new THREE.Group(); mark.name = 'guiding-mark'; impact.add(mark);
  const ring = mesh(mark, c.own(new THREE.TorusGeometry(0.42, 0.03, 6, 32)), mat('#ffd75e', 0.95, true), 0, -0.55, 0);
  ring.rotation.x = -Math.PI / 2;
  const star = mesh(mark, c.own(new THREE.OctahedronGeometry(1)), mat('#ffe27a', 0.95, true), 0, 1.05, 0, 0.1, 0.18, 0.1);
  const at = t => {
    const p = new THREE.Vector3().lerpVectors(source, target, clamp(t, 0, 1));
    p.y += Math.sin(clamp(t, 0, 1) * Math.PI) * 0.35;
    return p;
  };
  return (age, { elapsedImpact }) => {
    const t = (age - releaseAt) / Math.max(1, impactAt - releaseAt);
    comet.visible = t >= 0 && t < 1;
    comet.position.copy(at(t));
    comet.children[1].scale.setScalar(0.3 + 0.05 * Math.sin(age * 0.05));
    tail.forEach((item, i) => {
      item.visible = t >= 0 && t < 1.15;
      item.position.copy(at(t - (i + 1) * 0.045));
    });
    ring.rotation.z = elapsedImpact * 0.004;
    star.rotation.y = elapsedImpact * 0.006; star.position.y = 1.05 + 0.06 * Math.sin(elapsedImpact * 0.008);
  };
};

// Divine Spark: a beam of channelled light from the cleric's raised symbol to the
// creature, with a helix of sparks. Gold-green when it heals, the damage type's
// colour (radiant or necrotic) when it harms.
CUSTOM.divine_spark = c => {
  const { group, mat, mesh, geo, source, target, direction, color, event, releaseAt, impactAt, span } = c;
  const big = 1 + clamp((2.5 - span) / 2.5, 0, 1);   // thicker beam and wider helix at short range
  const healing = event.outcome === 'heal';
  const tone = healing ? '#9bffb8' : color;
  const beam = mesh(group, geo.cylinder, mat(tone, 0.7, true), 0, 0, 0, 0.07, 0.01, 0.07); beam.name = 'spark-beam';
  const core = mesh(group, geo.cylinder, mat('#ffffff', 0.9, true), 0, 0, 0, 0.025, 0.01, 0.025); core.name = 'spark-core';
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction); core.quaternion.copy(beam.quaternion);
  const side = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
  const lift = new THREE.Vector3().crossVectors(side, direction).normalize();
  const sparks = [];
  for (let i = 0; i < 9; i++) {
    const item = mesh(group, geo.sphere, mat(i % 2 ? '#ffffff' : tone, 0.9, true), 0, 0, 0, 0.055);
    item.name = 'spark-helix'; item.userData.phase = i / 9; sparks.push(item);
  }
  const crest = mesh(group, geo.sphere, mat(tone, 0.6, true), source.x, source.y, source.z, 0.22); crest.name = 'spark-source';
  const point = new THREE.Vector3();
  return (age, { phase }) => {
    const reach = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1);
    const live = age >= releaseAt;
    for (const item of [beam, core, crest]) item.visible = live;
    const length = Math.max(0.01, span * reach);
    for (const item of [beam, core]) {
      item.scale.y = length;
      item.position.copy(source).addScaledVector(direction, length / 2);
    }
    beam.scale.x = beam.scale.z = 0.07 * big * (1 + 0.25 * Math.sin(age * 0.04)) * (1 - phase * 0.8);
    crest.scale.setScalar(0.22 * big * (1 + 0.3 * Math.sin(age * 0.05)) * (1 - phase * 0.7));
    sparks.forEach(item => {
      const s = ((age - releaseAt) / 600 + item.userData.phase) % 1;
      item.visible = live && s * span <= length;
      const turn = s * 9 + age * 0.012 + item.userData.phase * 6, r = 0.2 * big * Math.sin(Math.PI * s);
      point.copy(source).addScaledVector(direction, s * span).addScaledVector(side, Math.cos(turn) * r).addScaledVector(lift, Math.sin(turn) * r);
      item.position.copy(point);
    });
  };
};

// Cure Wounds: a touch. Warm light gathers around the creature as a pillar and
// three plus-shaped crosses spiral upward.
CUSTOM.cure_wounds = c => {
  const { group, mat, mesh, geo, target, impactAt } = c;
  const big = 1 + 0.8 * clamp((2.5 - c.span) / 2.5, 0, 1);   // bigger when caster and target are adjacent
  const aura = new THREE.Group(); aura.name = 'cure-aura'; group.add(aura);
  aura.position.set(target.x, 0, target.z);
  mesh(aura, geo.cylinder, mat('#bfffd0', 0.28, true), 0, 0.9, 0, 0.42, 1.8, 0.42).name = 'cure-pillar';
  const crosses = [];
  for (let i = 0; i < 3; i++) {
    const cross = new THREE.Group(); cross.name = 'cure-cross'; aura.add(cross);
    mesh(cross, geo.box, mat('#f2ffd8', 0.95, true), 0, 0, 0, 0.14, 0.04, 0.04);
    mesh(cross, geo.box, mat('#f2ffd8', 0.95, true), 0, 0, 0, 0.04, 0.14, 0.04);
    cross.userData.phase = i * 2.1; crosses.push(cross);
  }
  return (age) => {
    const since = age - impactAt + 400;
    aura.visible = since >= 0;
    const rise = clamp(since / 1100, 0, 1);
    aura.children[0].scale.set(0.42 * big * (0.6 + rise * 0.4), 1.8 * big, 0.42 * big * (0.6 + rise * 0.4));
    crosses.forEach(cr => {
      const turn = since * 0.005 + cr.userData.phase;
      cr.position.set(Math.cos(turn) * 0.38 * big, 0.15 + rise * 1.4 * big * (((cr.userData.phase / 2.1) + 1) / 3), Math.sin(turn) * 0.38 * big); cr.scale.setScalar(big);
      cr.rotation.y = -turn;
    });
  };
};

// Healing Word: a spoken word carried as a ribbon of sparkling motes that arcs
// from the cleric to the creature, with rings ringing out from the cleric.
CUSTOM.healing_word = c => {
  const { group, mat, mesh, geo, source, target, releaseAt, impactAt, own } = c;
  const near = clamp((2.5 - c.span) / 2.5, 0, 1), big = 1 + near;   // a short hop gets a taller arc and larger motes
  const motes = [];
  for (let i = 0; i < 12; i++) {
    const item = mesh(group, geo.sphere, mat(i % 3 ? '#c9ffd9' : '#ffffff', 0.9, true), 0, 0, 0, 0.06 * big);
    item.name = 'word-mote'; item.userData.phase = i / 12; motes.push(item);
  }
  const ringGeo = own(new THREE.TorusGeometry(1, 0.025, 6, 40));
  const rings = [0, 1].map(i => {
    const ring = mesh(group, ringGeo, mat('#dfffe8', 0.8, true), source.x, source.y, source.z, 0.2);
    ring.name = 'word-ring'; ring.userData.delay = i * 160; return ring;
  });
  const point = new THREE.Vector3();
  return (age) => {
    const t = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1.2);
    motes.forEach(item => {
      const s = clamp(t - item.userData.phase * 0.35, 0, 1);
      item.visible = age >= releaseAt && s > 0 && s < 1;
      point.lerpVectors(source, target, s);
      point.y += Math.sin(s * Math.PI) * (0.55 + near * 0.9) + 0.08 * Math.sin(age * 0.02 + item.userData.phase * 9);
      item.position.copy(point);
    });
    rings.forEach(ring => {
      const q = clamp((age - releaseAt - ring.userData.delay) / 500, 0, 1);
      ring.visible = q > 0 && q < 1;
      ring.rotation.x = Math.PI / 2; ring.scale.setScalar((0.2 + q * 0.8) * big);
    });
  };
};

// Preserve Life: the cleric's seal flares once, and a golden stream flows from it
// to every ally that the healing is divided among.
CUSTOM.preserve_life = c => {
  const { group, mat, mesh, geo, source, target, releaseAt, impactAt, first, own } = c;
  const motes = [];
  for (let i = 0; i < 10; i++) {
    const item = mesh(group, geo.sphere, mat(i % 2 ? '#ffe7a3' : '#fff9e0', 0.9, true), 0, 0, 0, 0.07);
    item.name = 'preserve-mote'; item.userData.phase = i / 10; motes.push(item);
  }
  let seal = null;
  if (first) {
    seal = new THREE.Group(); seal.name = 'preserve-seal'; group.add(seal);
    seal.position.set(source.x, 0.1, source.z);
    const ringGeo = own(new THREE.TorusGeometry(1, 0.03, 6, 48));
    const outer = mesh(seal, ringGeo, mat('#ffe7a3', 0.9, true), 0, 0, 0); outer.rotation.x = -Math.PI / 2;
    const inner = mesh(seal, ringGeo, mat('#fff4cf', 0.9, true), 0, 0.01, 0, 0.55, 0.55, 0.55); inner.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      const spoke = mesh(seal, geo.box, mat('#fff4cf', 0.85, true), 0, 0.02, 0, 0.03, 0.01, 1.1);
      spoke.rotation.y = i * Math.PI / 6;
    }
  }
  const point = new THREE.Vector3();
  return (age) => {
    const t = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1.3);
    if (seal) {
      const q = clamp((age - releaseAt + 150) / 900, 0, 1);
      seal.visible = q > 0 && q < 1;
      seal.scale.setScalar(1.1 + q * 1.1); seal.rotation.y = age * 0.004;
    }
    motes.forEach(item => {
      const s = clamp(t - item.userData.phase * 0.4, 0, 1);
      item.visible = age >= releaseAt && s > 0 && s < 1;
      point.lerpVectors(source, target, s);
      point.y += Math.sin(s * Math.PI) * 0.45 + 0.1 * Math.sin(age * 0.015 + item.userData.phase * 12);
      item.position.copy(point);
    });
  };
};

// A cone of flames over the native footprint: tongues rise square by square away
// from the caster, flicker, then die back. Shared by Burning Hands and Dragon's
// Breath. The footprint comes from the first effect of the cast (event.area).
function coneFire(c, o) {
  const { group, mat, mesh, geo, source, area, releaseAt } = c;
  if (!area) return null;
  const flames = area.cells.map(([x, z]) => {
    const g = new THREE.Group(); g.name = o.name; g.position.set(x, 0, z); group.add(g);
    mesh(g, geo.cone, mat(o.edge, 0.75, true), 0, o.height / 2, 0, o.width, o.height, o.width);
    mesh(g, geo.cone, mat(o.core, 0.9, true), 0, o.height * 0.35, 0, o.width * 0.55, o.height * 0.7, o.width * 0.55);
    return { g, d: Math.hypot(x - source.x, z - source.z), seed: Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1 };
  });
  const hand = mesh(group, geo.sphere, mat(o.core, 0.8, true), source.x, source.y, source.z, 0.22); hand.name = o.name + '-hand';
  return age => {
    for (const f of flames) {
      const start = releaseAt + f.d * o.speed, q = clamp((age - start) / 260, 0, 1), out = clamp((age - start - o.burn) / 320, 0, 1);
      f.g.visible = q > 0 && out < 1;
      const grow = q * (1 - out), flick = 1 + 0.25 * Math.sin(age * 0.03 + f.seed * 20);
      f.g.scale.set(grow, grow * flick, grow); f.g.rotation.y = age * 0.002 + f.seed * 6;
    }
    hand.visible = age >= releaseAt - 100 && age < releaseAt + 450;
    hand.scale.setScalar(0.22 * (1 + 0.3 * Math.sin(age * 0.06)));
  };
}

// Burning Hands: a 15-foot fan of fire from the caster's outstretched hands.
CUSTOM.burning_hands = c => coneFire(c, { name: 'burning-flame', edge: '#ff8a2a', core: '#ffe27a', height: 0.95, width: 0.3, speed: 55, burn: 300 });

// Thunderwave: a thunderous wave sweeps the 15-foot cube from the caster, lighting
// each square as it passes (drawn once per cast, from the footprint); every
// creature that failed its save gets push chevrons pointing away from the caster.
CUSTOM.thunderwave = c => {
  const { group, impact, mat, mesh, geo, source, direction, color, event, area, releaseAt } = c;
  const parts = [];
  if (area) {
    const ax = area.aim[0] - source.x, az = area.aim[1] - source.z;
    const along = Math.abs(ax) >= Math.abs(az) ? new THREE.Vector3(Math.sign(ax) || 1, 0, 0) : new THREE.Vector3(0, 0, Math.sign(az) || 1);
    const tiles = area.cells.map(([x, z]) => {
      const item = mesh(group, geo.box, mat('#c7b6ff', 0.0, true), x, 0.07, z, 0.92, 0.05, 0.92); item.name = 'thunder-tile';
      return { item, d: Math.abs((x - source.x) * along.x + (z - source.z) * along.z) };
    });
    const front = mesh(group, geo.box, mat('#ffffff', 0.85, true), 0, 0.5, 0, along.x ? 0.12 : 3, 1.0, along.x ? 3 : 0.12); front.name = 'thunder-front';
    const ring = mesh(group, c.own(new THREE.TorusGeometry(1, 0.03, 6, 40)), mat('#e9e0ff', 0.8, true), source.x, 0.12, source.z, 0.3, 0.3, 0.3); ring.name = 'thunder-ring';
    ring.rotation.x = -Math.PI / 2;
    parts.push(age => {
      const t = clamp((age - releaseAt) / 450, 0, 1);
      front.visible = t > 0 && t < 1;
      front.position.set(source.x + along.x * (0.6 + t * 3), 0.5, source.z + along.z * (0.6 + t * 3));
      front.material.opacity = 0.85 * (1 - t * 0.7);
      ring.visible = t > 0 && t < 1; ring.scale.setScalar(0.3 + t * 2.2); ring.material.opacity = 0.8 * (1 - t);
      for (const { item, d } of tiles) {
        const q = clamp((age - releaseAt - d * 120) / 520, 0, 1);
        item.visible = q > 0 && q < 1; item.material.opacity = Math.sin(q * Math.PI) * 0.55;
      }
    });
  }
  if (event.outcome === 'hit') {
    const push = new THREE.Group(); push.name = 'thunder-push'; impact.add(push);
    const away = direction.clone(); away.y = 0; away.normalize();
    for (let i = 0; i < 3; i++) {
      const chevron = mesh(push, geo.cone, mat('#e9e0ff', 0.9, true), 0, 0.45, 0, 0.16, 0.3, 0.1);
      chevron.name = 'thunder-chevron'; chevron.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), away); chevron.userData.i = i;
    }
    parts.push((age, { elapsedImpact }) => {
      push.children.forEach(ch => {
        const s = clamp(elapsedImpact / 600 - ch.userData.i * 0.18, 0, 1);
        ch.position.set(away.x * (0.3 + s * 0.9), 0.4 + ch.userData.i * 0.08, away.z * (0.3 + s * 0.9));
        ch.visible = elapsedImpact > 0 && s < 1;
      });
    });
  }
  return parts.length ? (age, info) => parts.forEach(fn => fn(age, info)) : null;
};

// Shatter: a clap of sound at the chosen point. Cracks race across the floor, a
// shockwave and a glassy dome spread to the edge of the sphere, and shards leap up.
CUSTOM.shatter = c => {
  const { group, mat, mesh, geo, area, releaseAt, impactAt, own } = c;
  if (!area) return null;
  const [cx, cz] = area.aim;
  const reach = Math.max(...area.cells.map(([x, z]) => Math.hypot(x - cx, z - cz))) + 0.6;
  const root = new THREE.Group(); root.name = 'shatter-burst'; root.position.set(cx, 0, cz); group.add(root);
  const ringGeo = own(new THREE.TorusGeometry(1, 0.035, 6, 48));
  const wave = mesh(root, ringGeo, mat('#e1d8ff', 0.9, true), 0, 0.12, 0); wave.rotation.x = -Math.PI / 2; wave.name = 'shatter-wave';
  const dome = mesh(root, geo.sphere, mat('#c7b6ff', 0.22, true), 0, 0, 0); dome.name = 'shatter-dome';
  const cracks = [];
  for (let i = 0; i < 9; i++) {
    const a = i * Math.PI * 2 / 9 + 0.2, crack = mesh(root, geo.box, mat('#f4f0ff', 0.9, true), 0, 0.08, 0, 0.04, 0.02, 1);
    crack.name = 'shatter-crack'; crack.userData = { a, len: reach * (0.7 + 0.3 * Math.abs(Math.sin(i * 2.3))) }; cracks.push(crack);
  }
  const shardGeo = own(new THREE.OctahedronGeometry(1));
  const shards = [];
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4, shard = mesh(root, shardGeo, mat(i % 2 ? '#ffffff' : '#c7b6ff', 0.9, true), 0, 0, 0, 0.06, 0.12, 0.04);
    shard.name = 'shatter-shard'; shard.userData = { vx: Math.cos(a) * (0.5 + (i % 4) * 0.3), vz: Math.sin(a) * (0.5 + (i % 4) * 0.3), vy: 2.2 + (i % 3) * 0.8 };
    shards.push(shard);
  }
  return age => {
    const t = clamp((age - releaseAt) / 520, 0, 1), since = Math.max(0, age - releaseAt);
    wave.visible = dome.visible = t > 0 && t < 1;
    wave.scale.setScalar(0.2 + t * reach); wave.material.opacity = 0.9 * (1 - t);
    dome.scale.setScalar(0.2 + t * reach); dome.scale.y *= 0.55; dome.material.opacity = 0.22 * (1 - t);
    for (const crack of cracks) {
      const L = crack.userData.len * clamp(t * 1.6, 0, 1);
      crack.visible = since > 0;
      crack.scale.z = Math.max(0.01, L); crack.rotation.y = Math.PI / 2 - crack.userData.a;
      crack.position.set(Math.cos(crack.userData.a) * L / 2, 0.08, Math.sin(crack.userData.a) * L / 2);
    }
    for (const shard of shards) {
      const s = since / 1000, { vx, vz, vy } = shard.userData;
      shard.visible = since > 0 && s < 0.9;
      shard.position.set(vx * s, Math.max(0, vy * s - 4.2 * s * s), vz * s);
      shard.rotation.set(s * 9, s * 7, 0);
    }
  };
};

// Acid Splash: a glob of acid arcs from the caster to the chosen point, splashes
// into a spreading puddle with flying droplets, and bubbles.
CUSTOM.acid_splash = c => {
  const { group, mat, mesh, geo, source, area, releaseAt, impactAt, own } = c;
  if (!area) return null;
  const [cx, cz] = area.aim, end = new THREE.Vector3(cx, 0.3, cz);
  const glob = new THREE.Group(); glob.name = 'acid-glob'; group.add(glob);
  mesh(glob, geo.sphere, mat('#9be03c', 0.9), 0, 0, 0, 0.17).name = 'acid-core';
  mesh(glob, geo.sphere, mat('#d6ff7a', 0.45, true), 0, 0, 0, 0.3);
  const puddle = mesh(group, own(new THREE.CircleGeometry(1, 28)), mat('#8fd62e', 0.7), cx, 0.075, cz, 0.1, 0.1, 0.1);
  puddle.rotation.x = -Math.PI / 2; puddle.name = 'acid-puddle';
  const drops = [];
  for (let i = 0; i < 12; i++) {
    const a = i * 2.4, item = mesh(group, geo.sphere, mat(i % 2 ? '#b6f06a' : '#e6ffaa', 0.9), cx, 0.2, cz, 0.06);
    item.name = 'acid-drop'; item.userData = { vx: Math.cos(a) * (0.6 + (i % 4) * 0.3), vz: Math.sin(a) * (0.6 + (i % 4) * 0.3), vy: 1.8 + (i % 3) * 0.5 };
    drops.push(item);
  }
  const bubbles = [];
  for (let i = 0; i < 6; i++) {
    const item = mesh(group, geo.sphere, mat('#d6ff7a', 0.6, true), cx + Math.cos(i * 2.1) * 0.5, 0.1, cz + Math.sin(i * 2.1) * 0.5, 0.07);
    item.name = 'acid-bubble'; item.userData.phase = i; bubbles.push(item);
  }
  const point = new THREE.Vector3();
  return age => {
    const t = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1), since = age - impactAt;
    glob.visible = age >= releaseAt && t < 1;
    point.lerpVectors(source, end, t); point.y += Math.sin(t * Math.PI) * 0.8; glob.position.copy(point);
    const spread = clamp(since / 350, 0, 1);
    puddle.visible = since >= 0; puddle.scale.setScalar(0.1 + spread * 1.5);
    for (const d of drops) {
      const s = since / 1000, { vx, vz, vy } = d.userData;
      d.visible = since >= 0 && s < 0.7;
      d.position.set(cx + vx * s, Math.max(0.08, 0.2 + vy * s - 4.4 * s * s), cz + vz * s);
    }
    for (const b of bubbles) {
      const s = clamp((since - 200 - b.userData.phase * 90) / 600, 0, 1);
      b.visible = s > 0 && s < 1; b.position.y = 0.1 + s * 0.6; b.scale.setScalar(0.07 * (1 + s * 0.8));
    }
  };
};

// Dragon's Breath. The casting (an effect with `text`) shimmers a ring of scales
// around the creature that gains the breath; the exhale (an effect with the
// native footprint) is a cone of the chosen damage type's fire, frost or acid.
CUSTOM.dragons_breath = c => {
  const { event, group, mat, mesh, geo, target, own, impactAt } = c;
  if (event.text) {
    const tone = '#ffb347', ring = new THREE.Group(); ring.name = 'breath-scales'; group.add(ring);
    ring.position.set(target.x, 0, target.z);
    const scaleGeo = own(new THREE.OctahedronGeometry(1)), scales = [];
    for (let i = 0; i < 10; i++) {
      const item = mesh(ring, scaleGeo, mat(i % 2 ? tone : '#fff0c8', 0.9, true), 0, 0.2, 0, 0.07, 0.11, 0.03);
      item.name = 'breath-scale'; item.userData.phase = i / 10 * Math.PI * 2; scales.push(item);
    }
    mesh(ring, geo.cylinder, mat(tone, 0.22, true), 0, 0.8, 0, 0.5, 1.6, 0.5).name = 'breath-glow';
    return age => {
      const q = clamp((age - impactAt + 300) / 1200, 0, 1);
      ring.visible = q > 0 && q < 1;
      scales.forEach(item => {
        const turn = item.userData.phase + age * 0.006, rise = (q * 1.4 + item.userData.phase / 8) % 1.5;
        item.position.set(Math.cos(turn) * 0.45, 0.1 + rise, Math.sin(turn) * 0.45);
        item.rotation.y = -turn;
      });
    };
  }
  const tone = DAMAGE_COLORS[event.damage_type] || '#ff9a3c';
  return coneFire(c, { name: 'breath-flame', edge: tone, core: '#fff4d8', height: 1.25, width: 0.4, speed: 45, burn: 380 });
};

// Damage numbers of one multi-target cast fan out (sideways and up) so neighbours
// never print on top of each other; lane is the position within the batch.
export const labelOffset = lane => [[0, 0.62, -0.62, 0.62, -0.62][lane % 5], 1.08 + (lane % 5) * 0.4];

// Chromatic Orb: a ball of the chosen element, tinted by the native damage type,
// with two crossed rings spinning around it and a streaming tail.
CUSTOM.chromatic_orb = c => {
  const { group, mat, mesh, geo, source, target, color, releaseAt, impactAt, own } = c;
  const orb = new THREE.Group(); orb.name = 'chromatic-orb'; group.add(orb);
  mesh(orb, geo.sphere, mat('#ffffff'), 0, 0, 0, 0.14).name = 'orb-core';
  mesh(orb, geo.sphere, mat(color, 0.6, true), 0, 0, 0, 0.3).name = 'orb-shell';
  const ringGeo = own(new THREE.TorusGeometry(1, 0.05, 6, 28));
  const ringA = mesh(orb, ringGeo, mat('#ffffff', 0.9, true), 0, 0, 0, 0.36); ringA.name = 'orb-ring';
  const ringB = mesh(orb, ringGeo, mat(color, 0.9, true), 0, 0, 0, 0.36); ringB.name = 'orb-ring';
  const tail = [];
  for (let i = 0; i < 7; i++) {
    const item = mesh(group, geo.sphere, mat(color, 0.65 - i * 0.08, true), 0, 0, 0, 0.16 - i * 0.017); item.name = 'orb-tail'; tail.push(item);
  }
  const at = t => { const p = new THREE.Vector3().lerpVectors(source, target, clamp(t, 0, 1)); p.y += Math.sin(clamp(t, 0, 1) * Math.PI) * 0.3; return p; };
  return age => {
    const t = (age - releaseAt) / Math.max(1, impactAt - releaseAt);
    orb.visible = t >= 0 && t < 1; orb.position.copy(at(t));
    ringA.rotation.set(age * 0.012, age * 0.007, 0); ringB.rotation.set(age * -0.009, 0, age * 0.011);
    tail.forEach((item, i) => { item.visible = t >= 0 && t < 1.12; item.position.copy(at(t - (i + 1) * 0.05)); });
  };
};

// Ray of Frost: a pale-blue beam snaps from the caster to the target, shedding ice
// shards; frost crystals burst from the floor around the creature it hits.
CUSTOM.ray_of_frost = c => {
  const { group, impact, mat, mesh, geo, source, target, direction, event, releaseAt, impactAt, span, own } = c;
  const beam = mesh(group, geo.cylinder, mat('#8fd8ff', 0.7, true), 0, 0, 0, 0.06, 0.01, 0.06); beam.name = 'frost-beam';
  const core = mesh(group, geo.cylinder, mat('#ffffff', 0.95, true), 0, 0, 0, 0.022, 0.01, 0.022);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction); core.quaternion.copy(beam.quaternion);
  const shardGeo = own(new THREE.OctahedronGeometry(1)), shards = [];
  for (let i = 0; i < 10; i++) {
    const item = mesh(group, shardGeo, mat(i % 2 ? '#e6f7ff' : '#9fdcff', 0.9, true), 0, 0, 0, 0.045, 0.1, 0.045); item.name = 'frost-shard';
    item.userData.phase = i / 10; shards.push(item);
  }
  const crystals = [];
  if (event.outcome === 'hit') for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7, crystal = mesh(impact, geo.cone, mat('#c9eeff', 0.85, true), Math.cos(a) * 0.4, -0.6, Math.sin(a) * 0.4, 0.07, 0.45, 0.07);
    crystal.name = 'frost-crystal'; crystal.userData.a = a; crystal.rotation.z = Math.cos(a) * 0.3; crystal.rotation.x = Math.sin(a) * 0.3; crystals.push(crystal);
  }
  return (age, { elapsedImpact }) => {
    const reach = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1);
    const length = Math.max(0.01, span * reach), live = age >= releaseAt;
    for (const item of [beam, core]) { item.visible = live; item.scale.y = length; item.position.copy(source).addScaledVector(direction, length / 2); }
    beam.scale.x = beam.scale.z = 0.06 * (1 + 0.3 * Math.sin(age * 0.05));
    shards.forEach(item => {
      const s = ((age - releaseAt) / 450 + item.userData.phase) % 1;
      item.visible = live && s * span <= length;
      item.position.copy(source).addScaledVector(direction, s * span); item.position.y += Math.sin(s * 9 + item.userData.phase * 20) * 0.12;
      item.rotation.set(s * 8, s * 5, 0);
    });
    crystals.forEach(cr => { const g = clamp(elapsedImpact / 220, 0, 1); cr.scale.set(0.07 * g, 0.45 * g, 0.07 * g); cr.position.y = -0.6 + 0.22 * g; });
  };
};

// Scorching Ray: a lance of white-hot fire per ray (each ray is its own native
// attack), spread slightly by ray number, trailing sparks and leaving a scorch.
CUSTOM.scorching_ray = c => {
  const { group, impact, mat, mesh, geo, source, target, direction, lane, releaseAt, impactAt, span, own } = c;
  const side = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
  const start = source.clone().addScaledVector(side, (lane - 1) * 0.18); start.y += lane * 0.06;
  const lance = new THREE.Group(); lance.name = 'scorch-lance'; group.add(lance);
  const body = mesh(lance, geo.cylinder, mat('#ff7a1c', 0.9, true), 0, 0, 0, 0.07, 0.8, 0.07); body.rotation.x = Math.PI / 2;
  const core = mesh(lance, geo.cylinder, mat('#fff4c2', 1, true), 0, 0, 0, 0.032, 0.8, 0.032); core.rotation.x = Math.PI / 2;
  const tip = mesh(lance, geo.sphere, mat('#fff0a0', 0.9, true), 0, 0, 0.4, 0.12);
  lance.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), target.clone().sub(start).normalize());
  const sparks = [];
  for (let i = 0; i < 8; i++) { const item = mesh(group, geo.sphere, mat(i % 2 ? '#ffb347' : '#ff6a1a', 0.8, true), 0, 0, 0, 0.05); item.name = 'scorch-spark'; item.userData.phase = i; sparks.push(item); }
  const mark = mesh(impact, own(new THREE.CircleGeometry(1, 20)), mat('#2a1a10', 0.7), 0, -0.84, 0, 0.45, 0.45, 0.45); mark.rotation.x = -Math.PI / 2; mark.name = 'scorch-mark';
  const point = new THREE.Vector3();
  return (age, { elapsedImpact }) => {
    const t = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1);
    lance.visible = age >= releaseAt && t < 1;
    lance.position.lerpVectors(start, target, t);
    sparks.forEach(item => {
      const s = clamp(t - (item.userData.phase + 1) * 0.04, 0, 1);
      item.visible = age >= releaseAt && t < 1.15 && s > 0;
      point.lerpVectors(start, target, s); point.y += Math.sin(age * 0.05 + item.userData.phase * 2) * 0.07; item.position.copy(point);
    });
    mark.visible = elapsedImpact >= 0; mark.scale.setScalar(0.2 + clamp(elapsedImpact / 200, 0, 1) * 0.3);
  };
};

// Spiritual Weapon: a spectral hammer of force forms at the caster's side, sails to
// the creature and slams down on it (the cast and each later bonus-action strike).
CUSTOM.spiritual_weapon = c => {
  const { group, impact, mat, mesh, geo, source, target, releaseAt, impactAt, own } = c;
  const weapon = new THREE.Group(); weapon.name = 'spirit-hammer'; group.add(weapon);
  mesh(weapon, geo.cylinder, mat('#cfe8ff', 0.9, true), 0, 0, 0, 0.04, 0.5, 0.04).name = 'spirit-haft';
  mesh(weapon, geo.box, mat('#9fd0ff', 0.85, true), 0, 0.3, 0, 0.26, 0.17, 0.17).name = 'spirit-head';
  mesh(weapon, geo.sphere, mat('#e6f4ff', 0.35, true), 0, 0.15, 0, 0.42);
  const ring = mesh(impact, own(new THREE.TorusGeometry(1, 0.03, 6, 40)), mat('#bfe0ff', 0.85, true), 0, -0.78, 0, 0.3, 0.3, 0.3); ring.rotation.x = -Math.PI / 2; ring.name = 'spirit-ring';
  const cracks = mesh(impact, geo.box, mat('#e6f4ff', 0.8, true), 0, -0.82, 0, 0.7, 0.02, 0.05); cracks.name = 'spirit-crack';
  const point = new THREE.Vector3();
  return (age, { elapsedImpact }) => {
    const t = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1);
    weapon.visible = age >= releaseAt - 150 && elapsedImpact < 180;
    // rises at the caster's side, then arcs over and drops onto the target
    point.lerpVectors(source, target, t); point.y += Math.sin(t * Math.PI) * 0.9 + (t < 0.15 ? t * 3 : 0);
    weapon.position.copy(point);
    weapon.rotation.set(0, 0, -0.4 - t * 1.9);     // head swings down as it lands
    const q = clamp(elapsedImpact / 400, 0, 1);
    ring.visible = elapsedImpact >= 0; ring.scale.setScalar(0.3 + q * 0.9);
    cracks.visible = elapsedImpact >= 0; cracks.scale.set(0.7 + q * 0.8, 1, 1); cracks.rotation.y = 0.6;
  };
};

// Buffs, wards and class-feature flourishes. One style, a look per `variant`
// (the spell or feature): a ring and rising motes always, plus the signature
// piece of each (dome, sigil, crosses, afterimages, flames, runes).
const BUFF_LOOKS = {
  bless: { c: '#ffe27a', motes: 1 }, aid: { c: '#8dffa8', crosses: 1 },
  shield_of_faith: { c: '#7fb8ff', dome: 1 }, sanctuary: { c: '#f4f0ff', dome: 1, motes: 1 },
  protection_from_evil_and_good: { c: '#fff0b0', sigil: 1 }, blur: { c: '#bcd8ff', ghosts: 1 },
  mirror_image: { c: '#79e6ff', ghosts: 1, runes: 1 }, mage_armor: { c: '#65d6ff', dome: 1, sigil: 1 },
  dodge: { c: '#d8e8f2', sigil: 1 }, dash: { c: '#ffd98a', rings: 1 },
  redirect_attack: { c: '#ff9f5a', rings: 1 },
  innate_sorcery: { c: '#ff7a3c', flames: 1 }, metamagic: { c: '#d6a8ff', runes: 1 },
  action_surge: { c: '#ffe9a0', ghosts: 1, flames: 1 }, lesser_restoration: { c: '#b8ffd8', motes: 1, crosses: 1 },
  command: { c: '#e8d9a8', rings: 1 },
  rage: { c: '#ff3b2e', flames: 1, rings: 1 }, extend_rage: { c: '#ff3b2e', flames: 1 },
  reckless_attack: { c: '#ff9a3c', rings: 1 },
};
CUSTOM.buff = c => {
  const { event, group, mat, mesh, geo, target, impactAt, own } = c;
  const look = BUFF_LOOKS[event.variant] || { c: '#ffffff', motes: 1 };
  const root = new THREE.Group(); root.name = `buff-${event.variant}`; group.add(root); root.position.set(target.x, 0, target.z);
  const ringGeo = own(new THREE.TorusGeometry(1, 0.03, 6, 40));
  const ring = mesh(root, ringGeo, mat(look.c, 0.9, true), 0, 0.1, 0, 0.3, 0.3, 0.3); ring.rotation.x = -Math.PI / 2; ring.name = 'buff-ring';
  const items = [];
  const add = (item, kind, extra = {}) => { item.name = `buff-${kind}`; Object.assign(item.userData, extra); items.push({ item, kind }); return item; };
  if (look.motes) for (let i = 0; i < 10; i++) add(mesh(root, geo.sphere, mat(i % 2 ? look.c : '#ffffff', 0.9, true), 0, 0, 0, 0.05), 'mote', { phase: i / 10 });
  if (look.dome) add(mesh(root, geo.sphere, mat(look.c, 0.25, true), 0, 0.6, 0, 0.62, 0.78, 0.62), 'dome');
  if (look.sigil) {
    const seal = new THREE.Group(); root.add(seal); seal.position.y = 0.06;
    mesh(seal, ringGeo, mat(look.c, 0.95, true), 0, 0, 0, 0.55, 0.55, 0.55).rotation.x = -Math.PI / 2;
    for (let i = 0; i < 6; i++) mesh(seal, geo.box, mat('#ffffff', 0.85, true), 0, 0, 0, 0.03, 0.01, 1.0).rotation.y = i * Math.PI / 6;
    add(seal, 'sigil');
  }
  if (look.crosses) for (let i = 0; i < 3; i++) {
    const cross = new THREE.Group(); root.add(cross);
    mesh(cross, geo.box, mat(look.c, 0.95, true), 0, 0, 0, 0.14, 0.04, 0.04); mesh(cross, geo.box, mat(look.c, 0.95, true), 0, 0, 0, 0.04, 0.14, 0.04);
    add(cross, 'cross', { phase: i * 2.1 });
  }
  if (look.ghosts) for (let i = 0; i < 3; i++) add(mesh(root, geo.sphere, mat(look.c, 0.3, true), 0, 0.6, 0, 0.2, 0.42, 0.2), 'ghost', { phase: i * 2.1 });
  if (look.flames) for (let i = 0; i < 8; i++) add(mesh(root, geo.cone, mat(i % 2 ? '#ffb347' : look.c, 0.85, true), 0, 0.3, 0, 0.07, 0.5, 0.07), 'flame', { phase: i / 8 * Math.PI * 2 });
  if (look.runes) {
    const runeGeo = own(new THREE.OctahedronGeometry(1));
    for (let i = 0; i < 6; i++) add(mesh(root, runeGeo, mat(i % 2 ? '#ffffff' : look.c, 0.95, true), 0, 0, 0, 0.06, 0.1, 0.03), 'rune', { phase: i / 6 * Math.PI * 2 });
  }
  if (look.rings) for (let i = 0; i < 3; i++) add(mesh(root, ringGeo, mat(look.c, 0.9, true), 0, 0.8, 0, 0.2, 0.2, 0.2), 'word', { phase: i * 0.25 });
  return age => {
    const q = clamp((age - impactAt + 250) / 1100, 0, 1);
    root.visible = q > 0 && q < 1;
    ring.scale.setScalar(0.3 + q * 0.75);
    for (const { item, kind } of items) {
      const u = item.userData, turn = age * 0.006 + (u.phase || 0);
      if (kind === 'mote') item.position.set(Math.cos(turn + u.phase * 6) * 0.4, ((q * 1.2 + u.phase) % 1) * 1.5, Math.sin(turn + u.phase * 6) * 0.4);
      else if (kind === 'dome') item.scale.set(0.62 * (0.5 + q * 0.6), 0.78 * (0.5 + q * 0.6), 0.62 * (0.5 + q * 0.6));
      else if (kind === 'sigil') item.rotation.y = age * 0.004;
      else if (kind === 'cross') { item.position.set(Math.cos(turn) * 0.36, 0.15 + q * 1.3 * ((u.phase / 2.1 + 1) / 3), Math.sin(turn) * 0.36); item.rotation.y = -turn; }
      else if (kind === 'ghost') item.position.set(Math.cos(turn) * 0.38 * q * 2, 0.6, Math.sin(turn) * 0.38 * q * 2);
      else if (kind === 'flame') { const r = 0.4; item.position.set(Math.cos(u.phase) * r, 0.25 + q * 0.5, Math.sin(u.phase) * r); item.scale.y = 0.5 * (0.6 + 0.4 * Math.sin(age * 0.03 + u.phase * 3)) * (1.2 - q * 0.4); }
      else if (kind === 'rune') item.position.set(Math.cos(turn * 1.5) * 0.45, 0.5 + q * 0.6, Math.sin(turn * 1.5) * 0.45), item.rotation.y = turn;
      else if (kind === 'word') { const s = clamp(q * 1.4 - u.phase, 0, 1); item.visible = s > 0 && s < 1; item.scale.setScalar(0.2 + s * 0.8); item.material.opacity = 0.9 * (1 - s); }
    }
  };
};

// Command: the spoken word as three rings that ring out along the line to the
// creature; if it fails its save, pressing arrows drive it down (GROVEL).
CUSTOM.command = c => {
  const { group, impact, mat, mesh, geo, source, target, direction, event, releaseAt, impactAt, own } = c;
  const ringGeo = own(new THREE.TorusGeometry(1, 0.03, 6, 36));
  const word = [0, 1, 2].map(i => {
    const ring = mesh(group, ringGeo, mat(i % 2 ? '#fff0c0' : '#e8d9a8', 0.9, true), 0, 0, 0, 0.18, 0.18, 0.18);
    ring.name = 'command-ring'; ring.userData.i = i; ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction); return ring;
  });
  const arrows = [];
  if (event.outcome === 'hit') for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2, arrow = mesh(impact, geo.cone, mat('#fff0c0', 0.9, true), Math.cos(a) * 0.28, 1.2, Math.sin(a) * 0.28, 0.09, 0.28, 0.09);
    arrow.name = 'command-arrow'; arrow.rotation.x = Math.PI; arrows.push(arrow);
  }
  return (age, { elapsedImpact }) => {
    word.forEach(ring => {
      const t = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt) - ring.userData.i * 0.18, 0, 1);
      ring.visible = age >= releaseAt && t > 0 && t < 1;
      ring.position.lerpVectors(source, target, t); ring.scale.setScalar(0.18 + t * 0.4);
    });
    arrows.forEach((arrow, i) => {
      const s = clamp((elapsedImpact - i * 40) / 500, 0, 1);
      arrow.visible = elapsedImpact >= 0 && s < 1; arrow.position.y = 1.2 - s * 1.0;
    });
  };
};

// Undead abilities. `undead` is a family with a look per variant: the ghast's stench
// cloud and its poison, paralysis stars, and a zombie's Undead Fortitude pop.
CUSTOM.undead = c => {
  const { event, group, mat, mesh, geo, source, target, impactAt, own } = c;
  const v = event.variant, root = new THREE.Group(); root.name = `undead-${v}`; group.add(root);
  const anchor = v === 'stench' ? source : target;     // the stench rolls out from the ghast
  root.position.set(anchor.x, 0, anchor.z);
  const bits = [];
  const add = (item, kind, extra = {}) => { item.name = `undead-${kind}`; Object.assign(item.userData, extra); bits.push({ item, kind }); return item; };
  if (v === 'stench') {
    for (let i = 0; i < 9; i++) add(mesh(root, geo.sphere, mat(i % 2 ? '#7aa83a' : '#a6c85a', 0.5), 0, 0.3, 0, 0.3), 'puff', { phase: i / 9 * Math.PI * 2, r: 0.5 + (i % 3) * 0.22 });
    add(mesh(root, geo.sphere, mat('#8fb84a', 0.18), 0, 0.45, 0, 1.2, 0.6, 1.2), 'cloud');
  } else if (v === 'paralyzed') {
    const starGeo = own(new THREE.OctahedronGeometry(1));
    for (let i = 0; i < 5; i++) add(mesh(root, starGeo, mat('#ffe27a', 0.95, true), 0, 1.1, 0, 0.07, 0.12, 0.04), 'star', { phase: i / 5 * Math.PI * 2 });
    const ringGeo = own(new THREE.TorusGeometry(1, 0.03, 6, 32));
    add(mesh(root, ringGeo, mat('#fff0a0', 0.9, true), 0, 0.12, 0, 0.3, 0.3, 0.3), 'ring');
  } else if (v === 'poisoned') {
    for (let i = 0; i < 8; i++) add(mesh(root, geo.sphere, mat(i % 2 ? '#8fd36a' : '#c7f59a', 0.7, true), 0, 0.2, 0, 0.06), 'bubble', { phase: i / 8, a: i * 2.4 });
  } else if (v === 'strength_drain') {
    const ringGeo = own(new THREE.TorusGeometry(1, 0.035, 6, 32));
    add(mesh(root, ringGeo, mat('#d24a4a', 0.9, true), 0, 0.12, 0, 0.3, 0.3, 0.3), 'ring');
    for (let i = 0; i < 4; i++) { const chevron = mesh(root, geo.cone, mat(i % 2 ? '#ff8a8a' : '#d24a4a', 0.95, true), (i - 1.5) * 0.18, 1.4, 0, 0.07, 0.2, 0.07); chevron.rotation.z = Math.PI; add(chevron, 'drop', { i }); }
  } else if (v === 'fortitude') {
    const ringGeo = own(new THREE.TorusGeometry(1, 0.04, 6, 32));
    add(mesh(root, ringGeo, mat('#b9d49a', 0.95, true), 0, 0.1, 0, 0.3, 0.3, 0.3), 'ring');
    for (let i = 0; i < 8; i++) add(mesh(root, geo.sphere, mat(i % 2 ? '#d7e8b8' : '#8fa07a', 0.9), 0, 0.3, 0, 0.07), 'pop', { a: i * Math.PI / 4 });
  }
  return age => {
    const q = clamp((age - impactAt + 250) / 1300, 0, 1);
    root.visible = q > 0 && q < 1;
    for (const { item, kind } of bits) {
      const u = item.userData;
      if (kind === 'puff') { const r = u.r * (0.5 + q), t = age * 0.003 + u.phase; item.position.set(Math.cos(t) * r, 0.3 + 0.25 * Math.sin(t * 2), Math.sin(t) * r); item.scale.setScalar(0.3 * (0.6 + q * 0.7)); }
      else if (kind === 'cloud') item.scale.set(1.2 * (0.4 + q), 0.6 * (0.6 + q * 0.4), 1.2 * (0.4 + q));
      else if (kind === 'star') { const t = age * 0.009 + u.phase; item.position.set(Math.cos(t) * 0.38, 1.0 + 0.1 * Math.sin(t * 3), Math.sin(t) * 0.38); item.rotation.y = t; }
      else if (kind === 'ring') item.scale.setScalar(0.3 + q * 0.7);
      else if (kind === 'bubble') { const s = (q * 1.4 + u.phase) % 1; item.position.set(Math.cos(u.a) * 0.3 * s, 0.2 + s * 1.1, Math.sin(u.a) * 0.3 * s); }
      else if (kind === 'drop') { const s2 = clamp(q * 1.6 - u.i * 0.08, 0, 1); item.position.y = 1.4 - s2 * 1.1; item.visible = s2 < 1; }
      else if (kind === 'pop') { const s = clamp(q * 2, 0, 1); item.position.set(Math.cos(u.a) * 0.6 * s, 0.3 + Math.sin(s * Math.PI) * 0.5, Math.sin(u.a) * 0.6 * s); }
    }
  };
};

// Necrotic strikes (the wight's sword and bow): a dark crescent with a smoky burst
// and wisps that drift up from the wound.
CUSTOM.necrotic = c => {
  const { group, impact, mat, mesh, geo, source, target, direction, releaseAt, impactAt, own } = c;
  const arc = mesh(group, own(new THREE.RingGeometry(0.5, 0.62, 28, 1, -0.9, 1.8)), mat('#5b2a8a', 0.95, true), source.x, source.y, source.z, 1, 1, 1);
  arc.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); arc.name = 'necrotic-arc';
  const wisps = [];
  for (let i = 0; i < 7; i++) {
    const item = mesh(impact, geo.sphere, mat(i % 2 ? '#7d3fb8' : '#2b1840', 0.8), 0, 0, 0, 0.1); item.name = 'necrotic-wisp'; item.userData.a = i * 0.9; wisps.push(item);
  }
  const bolt = mesh(group, geo.sphere, mat('#7d3fb8', 0.9, true), source.x, source.y, source.z, 0.1); bolt.name = 'necrotic-bolt';
  const yaw = Math.atan2(direction.x, direction.z);
  return (age, { elapsedImpact }) => {
    const t = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1);
    arc.visible = age >= releaseAt && t < 1; arc.position.lerpVectors(source, target, clamp(t * 0.35, 0, 1)); arc.rotation.z = -Math.PI / 2 + yaw; arc.scale.setScalar(0.8 + t * 0.6);
    bolt.visible = age >= releaseAt && t < 1; bolt.position.lerpVectors(source, target, t);
    wisps.forEach(w => { const s = clamp(elapsedImpact / 800, 0, 1); w.visible = elapsedImpact >= 0 && s < 1; w.position.set(Math.cos(w.userData.a) * 0.35 * s, -0.6 + s * 1.3, Math.sin(w.userData.a) * 0.35 * s); w.scale.setScalar(0.1 * (1 - s * 0.6)); });
  };
};

// Mummy Rotting Fist: swirling desiccated desert sand, linen bandage lashing arc, and necrotic curse embers.
CUSTOM.rotting_fist = c => {
  const { group, impact, mat, mesh, geo, source, target, direction, releaseAt, impactAt, own } = c;
  const arc = mesh(group, own(new THREE.RingGeometry(0.45, 0.72, 28, 1, -1.0, 2.0)), mat('#dfc280', 0.9, true), source.x, source.y, source.z);
  arc.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  const yaw = Math.atan2(direction.x, direction.z);
  const sands = [];
  for (let i = 0; i < 12; i++) {
    const s = mesh(impact, geo.sphere, mat(i % 3 === 0 ? '#8c4cd8' : '#d8b46a', 0.85, i % 3 === 0), 0, 0, 0, 0.065);
    s.userData = { a: i * (Math.PI * 2 / 12), h: (i % 4) * 0.16 };
    sands.push(s);
  }
  const curseRing = mesh(impact, own(new THREE.TorusGeometry(0.48, 0.032, 6, 36)), mat('#9b5ce0', 0.9, true), 0, -0.74, 0);
  curseRing.rotation.x = -Math.PI / 2;
  return (age, { elapsedImpact }) => {
    const t = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1);
    arc.visible = age >= releaseAt && t < 1;
    arc.position.lerpVectors(source, target, clamp(t * 0.55, 0, 1));
    arc.rotation.z = -Math.PI / 2 + yaw + (t - 0.5) * 0.9;
    const q = clamp(elapsedImpact / 750, 0, 1);
    curseRing.visible = elapsedImpact >= 0 && q < 1;
    curseRing.scale.setScalar(0.4 + q * 0.9);
    sands.forEach(s => {
      s.visible = elapsedImpact >= 0 && q < 1;
      const turn = s.userData.a + q * 4.5;
      s.position.set(Math.cos(turn) * (0.25 + q * 0.45), -0.55 + q * 1.2 + s.userData.h, Math.sin(turn) * (0.25 + q * 0.45));
      s.scale.setScalar(0.07 * (1 - q * 0.5));
    });
  };
};

// Mummy Dreadful Glare: twin blazing amber eye-beams + pharaonic fear hieroglyph rings!
CUSTOM.dreadful_glare = c => {
  const { group, impact, mat, mesh, geo, source, target, direction, releaseAt, impactAt, span, own } = c;
  const side = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const beams = [-0.07, 0.07].map(off => {
    const b = mesh(group, geo.cylinder, mat('#ffbe3d', 0.88, true), 0, 0, 0, 0.036, 0.01, 0.036);
    b.quaternion.setFromUnitVectors(up, direction);
    b.userData.off = off;
    return b;
  });
  const eyeFlare = mesh(group, geo.sphere, mat('#ffe680', 0.95, true), source.x, source.y + 0.25, source.z, 0.22);
  const fearSigil = mesh(impact, own(new THREE.TorusGeometry(0.52, 0.035, 6, 36)), mat('#ffaa2b', 0.92, true), 0, -0.72, 0);
  fearSigil.rotation.x = -Math.PI / 2;
  return (age, { elapsedImpact }) => {
    const reach = clamp((age - releaseAt) / Math.max(1, impactAt - releaseAt), 0, 1);
    const live = age >= releaseAt && elapsedImpact < 420;
    const len = Math.max(0.01, span * reach);
    eyeFlare.visible = live;
    eyeFlare.scale.setScalar(0.22 * (1 + 0.35 * Math.sin(age * 0.05)));
    for (const b of beams) {
      b.visible = live;
      b.scale.y = len;
      b.position.copy(source).addScaledVector(direction, len / 2).addScaledVector(side, b.userData.off);
      b.position.y += 0.22 * (1 - reach * 0.5);
    }
    const q = clamp(elapsedImpact / 650, 0, 1);
    fearSigil.visible = elapsedImpact >= 0 && q < 1;
    fearSigil.scale.setScalar(0.35 + q * 0.95);
  };
};

// Draining Swipe (the shadow): three dark claw streaks rake across the target, and
// the strength they take shows as a red downward marker on the figure.
CUSTOM.draining_swipe = c => {
  const { impact, mat, mesh, geo, direction, impactAt } = c;
  const yaw = Math.atan2(direction.x, direction.z), streaks = [];
  for (let i = 0; i < 3; i++) {
    const streak = mesh(impact, geo.box, mat(i === 1 ? '#c9b8e8' : '#3a2a52', 0.95, true), (i - 1) * 0.16, 0.1, 0, 0.05, 0.9, 0.02);
    streak.name = 'swipe-streak'; streak.rotation.z = -0.6; streak.userData.i = i; streaks.push(streak);
  }
  return (age, { elapsedImpact }) => {
    streaks.forEach(s => {
      const g = clamp((elapsedImpact - s.userData.i * 70) / 140, 0, 1);
      s.visible = elapsedImpact >= s.userData.i * 70 && g <= 1 && elapsedImpact < 700;
      s.scale.y = 0.9 * g; s.position.y = 0.55 - g * 0.45; s.rotation.y = yaw;
    });
  };
};

// Small touches, one family with a look per variant: Graze (a weapon mastery),
// the Shield reaction, a turned undead fleeing, Second Wind and a monster's
// dissolving death.
CUSTOM.touch = c => {
  const { event, group, impact, mat, mesh, geo, source, target, direction, impactAt, own } = c;
  const v = event.variant, root = new THREE.Group(); root.name = `touch-${v}`; group.add(root);
  root.position.set(target.x, 0, target.z);
  const bits = [];
  const add = (item, kind, extra = {}) => { item.name = `touch-${kind}`; Object.assign(item.userData, extra); bits.push({ item, kind }); return item; };
  const ringGeo = own(new THREE.TorusGeometry(1, 0.035, 6, 32));
  if (v === 'graze') {
    const streak = add(mesh(root, geo.box, mat('#fff4d8', 0.95, true), 0, 0.7, 0, 0.05, 0.9, 0.03), 'streak'); streak.rotation.z = -0.7;
    for (let i = 0; i < 5; i++) add(mesh(root, geo.sphere, mat('#ffd27a', 0.9, true), 0, 0.7, 0, 0.04), 'spark', { a: i * 1.3 });
  } else if (v === 'shield') {
    add(mesh(root, geo.sphere, mat('#7fb8ff', 0.35, true), 0, 0.62, 0, 0.62, 0.78, 0.62), 'dome');
    add(mesh(root, ringGeo, mat('#cfe4ff', 0.95, true), 0, 0.1, 0, 0.3, 0.3, 0.3), 'ring');
  } else if (v === 'flee') {
    for (let i = 0; i < 6; i++) add(mesh(root, geo.sphere, mat('#b8b2a4', 0.55), 0, 0.15, 0, 0.1), 'dust', { a: i * 1.05 });
    for (let i = 0; i < 3; i++) { const chevron = add(mesh(root, geo.cone, mat('#e8f0ff', 0.9, true), 0, 0.5, 0, 0.07, 0.2, 0.07), 'chevron', { i }); chevron.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(direction.x, 0, direction.z).normalize()); }
  } else if (v === 'second_wind') {
    for (let i = 0; i < 6; i++) { const line = add(mesh(root, geo.box, mat('#ffe9a0', 0.85, true), 0, 0, 0, 0.35, 0.025, 0.025), 'wind', { phase: i / 6 * Math.PI * 2, h: i }); line.name = 'touch-wind'; }
    add(mesh(root, geo.sphere, mat('#ffe27a', 0.25, true), 0, 0.6, 0, 0.5, 0.7, 0.5), 'glow');
  } else if (v === 'dissolve') {
    add(mesh(root, ringGeo, mat('#9a9486', 0.8), 0, 0.1, 0, 0.3, 0.3, 0.3), 'ring');
    for (let i = 0; i < 12; i++) add(mesh(root, geo.sphere, mat(i % 2 ? '#c8c2b2' : '#6e6a60', 0.85), 0, 0.2, 0, 0.06), 'ash', { a: i * 2.4, phase: i / 12 });
  } else if (v === 'opportunity') {
    const streak = add(mesh(root, geo.box, mat('#ff6e54', 0.95, true), 0, 0.72, 0, 0.07, 1.05, 0.04), 'streak'); streak.rotation.z = 0.65;
    add(mesh(root, ringGeo, mat('#ff8a66', 0.9, true), 0, 0.12, 0, 0.35, 0.35, 0.35), 'ring');
  }
  return age => {
    const q = clamp((age - impactAt + 250) / (v === 'dissolve' ? 1500 : 1000), 0, 1);
    root.visible = q > 0 && q < 1;
    for (const { item, kind } of bits) {
      const u = item.userData;
      if (kind === 'streak') { item.scale.y = 0.9 * clamp(q * 4, 0, 1); item.position.y = 0.95 - clamp(q * 4, 0, 1) * 0.5; }
      else if (kind === 'spark') { const s = clamp(q * 3, 0, 1); item.position.set(Math.cos(u.a) * 0.5 * s, 0.7 + Math.sin(u.a) * 0.3 * s, Math.sin(u.a) * 0.5 * s); }
      else if (kind === 'dome') item.scale.set(0.62 * (0.7 + q * 0.5), 0.78 * (0.7 + q * 0.5), 0.62 * (0.7 + q * 0.5));
      else if (kind === 'ring') item.scale.setScalar(0.3 + q * 0.8);
      else if (kind === 'dust') { const s = clamp(q * 2, 0, 1); item.position.set(Math.cos(u.a) * 0.5 * s, 0.15 + s * 0.2, Math.sin(u.a) * 0.5 * s); item.scale.setScalar(0.1 + s * 0.12); }
      else if (kind === 'chevron') { const s = clamp(q * 1.8 - u.i * 0.15, 0, 1); item.position.set(direction.x * (0.3 + s * 1.2), 0.5, direction.z * (0.3 + s * 1.2)); item.visible = s < 1; }
      else if (kind === 'wind') { const t = age * 0.01 + u.phase; item.position.set(Math.cos(t) * 0.42, 0.1 + ((q * 1.5 + u.h * 0.12) % 1) * 1.3, Math.sin(t) * 0.42); item.rotation.y = -t + Math.PI / 2; }
      else if (kind === 'glow') item.scale.set(0.5 * (0.5 + q), 0.7 * (0.5 + q), 0.5 * (0.5 + q));
      else if (kind === 'ash') { const s = (q * 1.2 + u.phase) % 1; item.position.set(Math.cos(u.a) * 0.4 * s, 0.2 + s * 1.3, Math.sin(u.a) * 0.4 * s); item.scale.setScalar(0.06 * (1 - s * 0.5)); }
    }
  };
};

export function createCombatEffects({ scene, units, requestRender, reducedMotion = false }) {
  const root = new THREE.Group();
  root.name = 'combat-effects'; scene.add(root);
  const active = [], queue = [], retiredEncounters = [];
  let encounter = null, revision = -1, lastSeen = -1, disposed = false;
  let motionReduced = reducedMotion, hidden = Boolean(document.hidden);

  function resetFlashes() {
    for (const entry of units.values()) for (const mat of entry.ownMaterials) {
      const rest = mat.userData.restEmissive;
      mat.emissive.setHex(rest?.color ?? 0); mat.emissiveIntensity = rest?.intensity ?? 0;
    }
  }
  function release(effect) {
    effect.group.removeFromParent();
    // Resources are owned by one transient group, shared only within that
    // group. Sets prevent a repeated spark/shaft geometry being freed twice.
    for (const resource of effect.resources) resource.dispose();
    effect.resources.clear();
  }
  function clear() {
    for (const effect of active) release(effect);
    active.length = 0; queue.length = 0; resetFlashes();
  }
  function valid(event) {
    return Number.isSafeInteger(event?.id) && event.id >= 0 && STYLES.has(event.style)
      && Number.isSafeInteger(event.amount) && event.amount >= 0
      && ['attack', 'heal'].includes(event.type) && ['hit', 'miss', 'heal'].includes(event.outcome)
      && Number.isFinite(event.source?.x) && Number.isFinite(event.source?.y)
      && Number.isFinite(event.target?.x) && Number.isFinite(event.target?.y);
  }
  function ingest(state, now = performance.now()) {
    if (disposed || typeof state.encounter_id !== 'string' || !Number.isInteger(state.revision)) return;
    const id = state.encounter_id;
    // A delayed response from an already retired encounter must not reset a
    // newer table. Encounter ids are opaque; only revisions are ordered.
    if (id !== encounter && retiredEncounters.includes(id)) return;
    if (id === encounter && state.revision <= revision) return;
    const events = (Array.isArray(state.effects) ? state.effects : [])
      .filter(event => Number.isSafeInteger(event?.id)).sort((a, b) => a.id - b.id);
    const newest = events.reduce((max, event) => Math.max(max, event.id), -1);
    if (id !== encounter) {
      if (encounter !== null) {
        retiredEncounters.push(encounter);
        if (retiredEncounters.length > 8) retiredEncounters.shift();
      }
      clear(); encounter = id; revision = state.revision; lastSeen = newest;
      return; // First snapshot/new encounter is a baseline, not a replay.
    }
    revision = state.revision;
    const fresh = [];
    for (const event of events) if (event.id > lastSeen) {
      lastSeen = event.id;
      if (valid(event)) fresh.push(event);
    }
    lastSeen = Math.max(lastSeen, newest);
    if (hidden || document.hidden) { clear(); return; }
    // Repeated/split-target Magic Missiles remain individual native events.
    // Stagger them slightly, and give coincident numbers separate text lanes.
    const targetCounts = new Map();
    for (const effect of active) {
      const key = `${effect.event.target.x},${effect.event.target.y}`;
      targetCounts.set(key, (targetCounts.get(key) || 0) + 1);
    }
    for (const item of queue) {
      const key = `${item.event.target.x},${item.event.target.y}`;
      targetCounts.set(key, (targetCounts.get(key) || 0) + 1);
    }
    fresh.slice(-MAX_QUEUED).forEach((event, i) => {
      const key = `${event.target.x},${event.target.y}`, same = targetCounts.get(key) || 0;
      targetCounts.set(key, same + 1);
      // Several effects of one cast fan out by batch position; repeats on one square stack.
      const lane = fresh.length > 1 ? (i + same) % 5 : same % 5;
      queue.push({ event, lane, due: now + i * 85, received: now, first: i === 0 || fresh[i - 1].style !== event.style });
    });
    if (queue.length > MAX_QUEUED) queue.splice(0, queue.length - MAX_QUEUED);
    if (queue.length) requestRender();
  }

  function makeEffect({ event, lane, timing, origin, first }, now) {
    const group = new THREE.Group();
    group.name = `combat-${event.style}-${event.id}`;
    Object.assign(group.userData, {
      effectId: event.id, effectStyle: event.style, effectOutcome: event.outcome,
      amount: event.amount, sourceId: event.source_id, targetId: event.target_id,
      reducedMotion: motionReduced,
      source: { ...event.source }, target: { ...event.target },
    });
    root.add(group);
    const resources = new Set(), fades = [];
    const own = resource => { resources.add(resource); return resource; };
    const sphere = own(new THREE.IcosahedronGeometry(1, 1));
    const cylinder = own(new THREE.CylinderGeometry(1, 1, 1, 8));
    const cone = own(new THREE.ConeGeometry(1, 1, 8));
    const box = own(new THREE.BoxGeometry(1, 1, 1));
    const mat = (color, opacity = 1, additive = false) => {
      const material = own(new THREE.MeshBasicMaterial({ color, transparent: true, opacity,
        depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
      fades.push({ material, opacity }); return material;
    };
    function mesh(parent, geometry, material, x, y, z, sx = 1, sy = sx, sz = sx) {
      const item = new THREE.Mesh(geometry, material);
      item.position.set(x, y, z); item.scale.set(sx, sy, sz); parent.add(item);
      return item;
    }
    const source = origin ? new THREE.Vector3(...origin) : new THREE.Vector3(event.source.x, 0.88, event.source.y);
    const target = new THREE.Vector3(event.target.x, 0.88, event.target.y);
    const direction = target.clone().sub(source);
    if (direction.lengthSq() < 0.001) direction.copy(FORWARD);
    direction.normalize();
    const color = event.outcome === 'miss' ? '#d3dbe0' : (TYPED.has(event.style) && DAMAGE_COLORS[event.damage_type]) || COLORS[event.style];
    const impact = new THREE.Group(); impact.name = 'impact'; group.add(impact);
    impact.position.copy(target);
    const healing = event.outcome === 'heal';
    const releaseAt = motionReduced ? 0 : timing?.releaseAt || 0;
    const impactAt = motionReduced ? 0 : timing?.impactAt ?? (healing ? 0 : event.style === 'slash' ? 220 : NO_PROJECTILE.has(event.style) ? 300 : 450);
    const duration = motionReduced ? 650 : healing ? 1040 : impactAt + 650;
    let travel = null, arc = null;
    const sparks = [], trail = [];

    if (!motionReduced && event.style === 'slash') {
      arc = new THREE.Group(); arc.name = 'slash-arc'; group.add(arc);
      arc.position.copy(source); arc.rotation.y = Math.atan2(direction.x, direction.z);
      // A generous, tapered-looking crescent reads at the full-board camera.
      // RingGeometry starts on +X; turn it to face the event's target on +Z.
      const sweep = own(new THREE.RingGeometry(0.58, 1.2, 32, 1, -0.96, 1.92));
      const positions = sweep.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const angle = Math.atan2(positions.getY(i), positions.getX(i));
        const radius = Math.hypot(positions.getX(i), positions.getY(i));
        if (radius < 0.9) {
          const taperedRadius = 1.2 - 0.62 * Math.sin((angle + 0.96) / 1.92 * Math.PI);
          positions.setXYZ(i, Math.cos(angle) * taperedRadius, Math.sin(angle) * taperedRadius, 0);
        }
      }
      positions.needsUpdate = true;
      const blade = mesh(arc, sweep, mat('#fff1c9', 0.85), 0, 0, 0);
      blade.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
      const edge = own(new THREE.RingGeometry(1.16, 1.22, 32, 1, -0.96, 1.92));
      mesh(arc, edge, mat('#ffd27c', 0.95), 0, 0.012, 0).rotation.copy(blade.rotation);
      arc.userData.baseAngle = arc.rotation.y;
    } else if (!motionReduced && !healing && !NO_PROJECTILE.has(event.style)) {
      travel = new THREE.Group(); travel.name = `${event.style}-projectile`; group.add(travel);
      travel.position.copy(source); travel.quaternion.setFromUnitVectors(FORWARD, direction);
      if (event.style === 'arrow') {
        const shaft = mesh(travel, cylinder, mat('#c89a60'), 0, 0, -0.18, 0.028, 0.76, 0.028);
        shaft.name = 'arrow-shaft'; shaft.rotation.x = Math.PI / 2;
        const head = mesh(travel, cone, mat('#e8f5ee'), 0, 0, 0.29, 0.095, 0.24, 0.055);
        head.name = 'arrow-head'; head.rotation.x = Math.PI / 2;
        const feathers = mat('#fff0d1');
        mesh(travel, box, feathers, 0, 0, -0.49, 0.2, 0.025, 0.2).name = 'arrow-fletching';
        mesh(travel, box, feathers, 0, 0, -0.49, 0.025, 0.2, 0.2);
      } else if (event.style === 'firebolt') {
        mesh(travel, sphere, mat('#ff651c'), 0, 0, 0, 0.23, 0.21, 0.31).name = 'firebolt-flame';
        mesh(travel, sphere, mat('#fff0a2'), 0, 0, 0.12, 0.13, 0.13, 0.2);
        const flame = mesh(travel, cone, mat('#ff9b25', 0.8), 0, 0, -0.29, 0.2, 0.58, 0.2);
        flame.rotation.x = -Math.PI / 2;
        for (let i = 0; i < 7; i++) {
          const item = mesh(travel, sphere, mat(i % 2 ? '#ffb344' : '#ef5221', 0.65 - i * 0.065),
            Math.sin(i * 2.3) * 0.06, Math.cos(i * 2.3) * 0.06, -0.32 - i * 0.13, 0.15 - i * 0.015);
          item.name = 'fire-trail'; trail.push(item);
        }
        for (let i = 0; i < 6; i++) {
          const item = mesh(travel, sphere, mat('#ffdb79'), 0, 0, -0.15 - i * 0.13, 0.032);
          item.name = 'fire-spark'; sparks.push(item);
        }
      } else if (event.style === 'sorcerous_burst') {
        // Raw sorcery: a white-hot core in a pulsing shell, four shards orbiting
        // it and a ragged trail. Tinted by the native damage type.
        mesh(travel, sphere, mat(color, 0.55, true), 0, 0, 0, 0.4, 0.4, 0.4).name = 'burst-shell';
        mesh(travel, sphere, mat('#ffffff'), 0, 0, 0, 0.19, 0.19, 0.19).name = 'burst-core';
        const shard = own(new THREE.OctahedronGeometry(1));
        for (let i = 0; i < 4; i++) {
          const item = mesh(travel, shard, mat(i % 2 ? '#ffffff' : color, 0.9), 0.45, 0, 0, 0.08, 0.15, 0.08);
          item.name = 'burst-shard'; item.userData.phase = i * Math.PI / 2; sparks.push(item);
        }
        for (let i = 0; i < 6; i++) {
          const item = mesh(travel, sphere, mat(color, 0.6 - i * 0.08, true),
            Math.sin(i * 1.9) * 0.08, Math.cos(i * 2.7) * 0.08, -0.26 - i * 0.15, 0.16 - i * 0.018);
          item.name = 'burst-trail'; trail.push(item);
        }
      } else {
        const dart = own(new THREE.OctahedronGeometry(1));
        mesh(travel, dart, mat('#a18aff', 0.75), 0, 0, -0.04, 0.22, 0.19, 0.42).name = 'missile-violet-shell';
        mesh(travel, dart, mat('#a8fbff'), 0, 0, 0.12, 0.12, 0.1, 0.3).name = 'missile-cyan-dart';
        for (let i = 0; i < 5; i++) {
          const item = mesh(travel, sphere, mat(i % 2 ? '#ae80ff' : '#65deff', 0.7 - i * 0.1),
            0, 0, -0.33 - i * 0.17, 0.1 - i * 0.014);
          item.name = 'missile-trail'; trail.push(item);
        }
      }
    }

    if (travel) travel.traverse(object => { object.userData.effectRole = 'projectile'; });

    // Life Drain: a dark tendril reaches the victim, then pale motes stream
    // back to the drainer (the life flows toward the attacker).
    let drain = null, beam = null, sigil = null, runes = [];
    const up = new THREE.Vector3(0, 1, 0), span = source.distanceTo(target);
    if (!motionReduced && event.style === 'life_drain') {
      beam = mesh(group, cylinder, mat('#3a2652', 0.85), 0, 0, 0, 0.05, 0.01, 0.05);
      beam.name = 'drain-tendril'; beam.quaternion.setFromUnitVectors(up, direction);
      drain = [];
      for (let i = 0; i < 10; i++) {
        const item = mesh(group, sphere, mat(i % 2 ? '#9be07a' : '#d2f7b4', 0.9, true), 0, 0, 0, 0.065);
        item.name = 'drain-mote'; item.visible = false;
        drain.push({ item, phase: i / 10, side: ((i % 3) - 1) * 0.2 });
      }
    }
    // Turn Undead: a golden ray from the cleric to this undead; the first
    // effect of a use also draws the holy sigil and the 30-foot shockwave.
    if (!motionReduced && event.style === 'turn_undead') {
      beam = mesh(group, cylinder, mat('#ffe9a0', 0.6, true), 0, 0, 0, 0.05, 0.01, 0.05);
      beam.name = 'turn-ray'; beam.quaternion.setFromUnitVectors(up, direction);
      if (first) {
        sigil = new THREE.Group(); sigil.name = 'turn-sigil'; group.add(sigil);
        sigil.position.set(source.x, 0.1, source.z);
        const ringGeo = own(new THREE.TorusGeometry(1, 0.025, 6, 64));
        const wave = mesh(sigil, ringGeo, mat('#ffe9a0', 0.9, true), 0, 0, 0); wave.rotation.x = -Math.PI / 2; wave.name = 'turn-wave';
        const seal = new THREE.Group(); seal.name = 'turn-seal'; sigil.add(seal);
        const outer = mesh(seal, ringGeo, mat('#fff4c8', 0.95, true), 0, 0.01, 0, 0.75, 0.75, 0.75); outer.rotation.x = -Math.PI / 2;
        const inner = mesh(seal, ringGeo, mat('#ffd36b', 0.9, true), 0, 0.02, 0, 0.5, 0.5, 0.5); inner.rotation.x = -Math.PI / 2;
        for (let i = 0; i < 8; i++) {
          const spoke = mesh(seal, box, mat('#fff4c8', 0.9, true), 0, 0.015, 0, 0.03, 0.01, 0.75);
          spoke.rotation.y = i * Math.PI / 8;
        }
        sigil.userData.waveReach = 6.2;
      }
    }
    const burst = new THREE.Group(); burst.name = healing ? 'second-wind-halo' : 'impact-burst'; impact.add(burst);
    const ringGeometry = own(new THREE.TorusGeometry(0.49, healing ? 0.035 : 0.025, 6, 40));
    const halo = mesh(burst, ringGeometry, mat(color, 0.9), 0, healing ? -0.68 : 0, 0);
    halo.rotation.x = -Math.PI / 2;
    const halo2 = healing ? mesh(burst, ringGeometry, mat('#c1ffd7', 0.6), 0, 0.15, 0) : null;
    if (halo2) halo2.rotation.x = -Math.PI / 2;
    const burstParticles = [];
    // A miss has a neutral open ring, never the damage-colored hit explosion.
    if (event.outcome !== 'miss') {
      for (let i = 0; i < (healing ? 8 : 10); i++) {
        const a = i * Math.PI * 2 / (healing ? 8 : 10);
        const velocity = new THREE.Vector3(Math.cos(a), healing ? 0.8 : Math.sin(i * 2.1) * 0.45, Math.sin(a));
        const item = mesh(burst, healing ? box : sphere, mat(i % 3 ? color : healing ? '#d5ffe1' : '#fff4d4'), 0, 0, 0,
          healing ? 0.045 : 0.07, healing ? 0.15 : 0.07, healing ? 0.045 : 0.07);
        burstParticles.push({ item, velocity });
      }
    }
    // Canvas-backed sprites have a dark keyline and a minimum screen-space
    // size: actual HP remains readable without zooming into a miniature.
    const textCanvas = document.createElement('canvas'); textCanvas.width = 384; textCanvas.height = 128;
    const ctx = textCanvas.getContext('2d');
    if (event.style === 'turn_undead' && event.outcome === 'hit') {
      const pillar = mesh(impact, cylinder, mat('#fff0b0', 0.22, true), 0, 0.5, 0, 0.12, 2.2, 0.12); pillar.name = 'turn-pillar';
      const runeGeo = own(new THREE.OctahedronGeometry(1));
      for (let i = 0; i < 4; i++) {
        const rune = mesh(impact, runeGeo, mat('#ffe27a', 0.95, true), 0, 0.95, 0, 0.06, 0.1, 0.02);
        rune.name = 'turn-rune'; rune.userData.phase = i * Math.PI / 2; runes.push(rune);
      }
    }
    const text = event.text ? String(event.text)
      : event.style === 'turn_undead' ? (event.outcome === 'miss' ? 'RESISTS' : 'TURNED')
      : event.style === 'dreadful_glare' ? (event.outcome === 'miss' ? 'RESISTS GLARE' : 'FRIGHTENED!')
      : event.outcome === 'miss' ? 'MISS' : healing ? `+${event.amount}` : `−${(Number(event.amount) || 0) + (Number(event.rider) || 0)}`;
    const isCrit = Boolean(event.crit && event.outcome === 'hit');
    if (isCrit) {
      const critStar = mesh(burst, own(new THREE.TorusGeometry(0.72, 0.045, 6, 40)), mat('#ffd95e', 0.98, true), 0, 0.05, 0);
      critStar.rotation.x = -Math.PI / 2;
    }
    ctx.font = isCrit ? '900 78px system-ui, sans-serif' : '800 74px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#0d1a1f'; ctx.lineWidth = 14; ctx.lineJoin = 'round';
    const drained = event.style === 'life_drain' && event.outcome !== 'miss' && event.amount > 0;
    // The server sends rider damage (e.g. the Rotting Fist's necrotic) apart from the hit's own damage.
    const rider = event.outcome === 'hit' && Number(event.rider) > 0
      ? `+${event.rider} ${String((event.rider_types || [])[0] || '').toUpperCase()}`.trim() : '';
    const cursed = event.style === 'rotting_fist' && event.outcome === 'hit';
    const subline = isCrit ? 'CRITICAL!' : drained ? 'MAX HP' : rider ? (cursed ? `${rider} · CURSED` : rider) : cursed ? 'CURSED' : '';
    if (subline) ctx.font = '800 62px system-ui, sans-serif';
    const fillTone = isCrit ? '#ffd95e' : color;
    ctx.strokeText(text, 192, subline ? 50 : 67); ctx.fillStyle = fillTone; ctx.fillText(text, 192, subline ? 50 : 67);
    if (subline) {
      ctx.font = '800 29px system-ui, sans-serif'; ctx.lineWidth = 8;
      ctx.fillStyle = isCrit ? '#fff2a6' : fillTone;
      ctx.strokeText(subline, 192, 102); ctx.fillText(subline, 192, 102);
    }
    const texture = own(new THREE.CanvasTexture(textCanvas)); texture.colorSpace = THREE.SRGBColorSpace;
    const textMaterial = own(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
    const label = new THREE.Sprite(textMaterial); label.name = 'combat-amount'; label.renderOrder = 30;
    label.userData.text = text; label.userData.effectRole = 'label';
    label.position.set(labelOffset(lane)[0], labelOffset(lane)[1], 0); impact.add(label);
    label.scale.set(1.9, 0.64, 1);
    const effect = { event, group, resources, fades, source, target, direction, travel, arc, impact,
      burst, halo, halo2, burstParticles, label, textMaterial, sparks, trail, lane, start: now,
      drain, beam, sigil, runes, span, up,
      impactAt, releaseAt, swingDuration: timing ? 180 : 360, duration, reduced: motionReduced };
    const build = CUSTOM[event.style];
    if (build && !motionReduced) {
      effect.custom = build({ event, group, impact, source, target, direction, color, mat, mesh, own, fades,
        geo: { sphere, cylinder, cone, box }, lane, first, releaseAt, impactAt, duration, area: event.area || null,
        span: source.distanceTo(target) }) || null;
    }
    active.push(effect);
    return effect;
  }

  function tick(now, camera, viewportHeight = 600) {
    if (disposed || hidden) return false;
    resetFlashes();
    for (let i = active.length - 1; i >= 0; i--) {
      if (now - active[i].start >= active[i].duration) { release(active[i]); active.splice(i, 1); }
    }
    while (queue.length && (now - queue[0].received > MAX_QUEUE_AGE)) queue.shift();
    while (active.length < MAX_ACTIVE && queue.length && queue[0].due <= now) makeEffect(queue.shift(), now);
    for (const effect of active) {
      const { event, travel, arc, impact, source, target, direction, halo, halo2, label } = effect;
      const age = now - effect.start;
      const elapsedImpact = age - effect.impactAt;
      const phase = clamp(elapsedImpact / (effect.duration - effect.impactAt), 0, 1);
      impact.visible = elapsedImpact >= 0;
      if (travel) {
        travel.visible = age >= effect.releaseAt && age < effect.impactAt;
        const progress = clamp((age - effect.releaseAt) / Math.max(1, effect.impactAt - effect.releaseAt), 0, 1);
        travel.position.lerpVectors(source, target, progress);
        if (event.style === 'magic_missile') {
          const bend = Math.sin(progress * Math.PI) * (effect.lane % 2 ? -0.35 : 0.35);
          travel.position.x += direction.z * bend; travel.position.z -= direction.x * bend;
          travel.position.y += Math.sin(progress * Math.PI) * (0.2 + effect.lane * 0.12);
        }
        effect.sparks.forEach((item, i) => {
          if (item.userData.phase !== undefined) {
            // Sorcerous Burst shards orbit the core, tightening as it flies.
            const turn = age * 0.014 + item.userData.phase, radius = 0.48 - progress * 0.14;
            item.position.set(Math.cos(turn) * radius, Math.sin(turn) * radius, 0);
            item.rotation.set(turn, turn * 1.3, 0);
            return;
          }
          item.position.x = Math.sin(age * 0.02 + i * 2) * 0.22;
          item.position.y = Math.cos(age * 0.016 + i * 2) * 0.2;
        });
        if (event.style === 'sorcerous_burst') {
          const pulse = 1 + 0.18 * Math.sin(age * 0.03);
          travel.children.forEach(child => { if (child.name === 'burst-shell') child.scale.setScalar(0.4 * pulse); });
        }
      }
      if (arc) {
        const swingAge = age - effect.releaseAt;
        arc.visible = swingAge >= 0 && swingAge < effect.swingDuration;
        arc.rotation.y = arc.userData.baseAngle + (swingAge / effect.swingDuration - 0.5) * 1.15;
      }
      if (effect.drain) {
        const reach = clamp((age - effect.releaseAt) / Math.max(1, effect.impactAt - effect.releaseAt), 0, 1);
        const tendril = effect.beam;
        tendril.visible = age >= effect.releaseAt;
        tendril.scale.y = Math.max(0.01, effect.span * reach);
        tendril.position.copy(source).addScaledVector(direction, effect.span * reach / 2);
        for (const { item, phase: offset, side } of effect.drain) {
          const flow = ((age - effect.impactAt) / 800 + offset) % 1;
          item.visible = age >= effect.impactAt && flow >= 0;
          const q = clamp(flow, 0, 1);
          item.position.lerpVectors(target, source, q);
          item.position.x += direction.z * side * Math.sin(q * Math.PI);
          item.position.z -= direction.x * side * Math.sin(q * Math.PI);
          item.position.y += Math.sin(q * Math.PI) * 0.3;
          item.scale.setScalar(0.065 * (1 - q * 0.5));
        }
      }
      if (effect.beam && event.style === 'turn_undead') {
        const ray = effect.beam, lit = clamp((age - effect.releaseAt) / Math.max(1, effect.impactAt - effect.releaseAt), 0, 1);
        ray.visible = age >= effect.releaseAt;
        ray.scale.set(1, Math.max(0.01, effect.span * lit), 1);
        ray.position.copy(source).addScaledVector(direction, effect.span * lit / 2);
      }
      if (effect.sigil) {
        const sigil = effect.sigil, since = Math.max(0, age - effect.releaseAt);
        sigil.visible = age >= effect.releaseAt;
        const wave = sigil.getObjectByName('turn-wave'), seal = sigil.getObjectByName('turn-seal');
        const spread = clamp(since / Math.max(1, effect.impactAt - effect.releaseAt + 350), 0, 1);
        wave.scale.setScalar(0.3 + spread * (sigil.userData.waveReach - 0.3));
        seal.rotation.y = since * 0.004;
      }
      for (const rune of effect.runes) {
        const turn = elapsedImpact * 0.006 + rune.userData.phase;
        rune.position.set(Math.cos(turn) * 0.45, 0.95 + phase * 0.5, Math.sin(turn) * 0.45);
        rune.rotation.y = turn;
      }
      effect.custom?.(age, { elapsedImpact, phase });
      const fade = 1 - clamp((phase - 0.45) / 0.55, 0, 1);
      for (const { material, opacity } of effect.fades) material.opacity = opacity * fade;
      if (arc) arc.scale.setScalar(0.8 + Math.min(age / 360, 1) * 0.2);
      if (impact.visible) {
        const heal = event.style === 'heal';
        const expansion = effect.reduced ? 1
          : event.style === 'life_drain' ? 1.35 - Math.min(phase * 2.5, 1) * 0.85   // contracts: life leaves
          : 0.6 + Math.min(phase * 2.5, 1) * 0.85;
        halo.scale.setScalar(expansion);
        if (halo2) { halo2.scale.setScalar(expansion * 0.85); halo2.position.y = effect.reduced ? 0.15 : -0.4 + phase * 1.1; }
        effect.burstParticles.forEach(({ item, velocity }, i) => {
          item.position.copy(velocity).multiplyScalar(effect.reduced ? 0.4
            : event.style === 'life_drain' ? 0.95 - phase * 0.85 : 0.12 + phase * (heal ? 0.65 : 0.85));
          if (heal) item.position.y += -0.35 + (effect.reduced ? 0 : phase * 0.65);
          item.scale.setScalar((heal ? 0.065 : 0.075) * (1 - phase * 0.7));
          if (heal) item.scale.y *= 2.4;
          else item.rotation.set(i, phase * 2, i * 0.7);
        });
        label.position.y = labelOffset(effect.lane)[1] + (effect.reduced ? 0 : phase * 0.48);
        if (camera) {
          const distance = camera.position.distanceTo(target);
          const worldPerPixel = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.max(1, viewportHeight);
          // Glyphs occupy ~60% of the transparent canvas height: >=23px tall.
          const h = Math.max(0.64, worldPerPixel * 38);
          label.scale.set(h * 3, h, 1);
        }
        effect.textMaterial.opacity = fade;
        const entry = units.get(event.target_id);
        // Do not flash a creature at an endpoint it moved to after the native
        // event. Its impact feedback still appears at the captured coordinates.
        if (event.outcome !== 'miss' && elapsedImpact < 250 && entry
          && entry.data.x === event.target.x && entry.data.y === event.target.y) {
          for (const material of entry.ownMaterials) {
            const strength = (1 - elapsedImpact / 250) * 1.15;
            if (strength >= material.emissiveIntensity) {
              material.emissive.set(heal ? '#5deba0' : event.style === 'turn_undead' ? '#ffe27a' : event.style === 'life_drain' ? '#7a4cc0' : '#ff9a56'); material.emissiveIntensity = strength;
            }
          }
        }
      }
    }
    return active.length > 0 || queue.length > 0;
  }
  function setReducedMotion(value) {
    if (motionReduced === value) return;
    motionReduced = value;
    // Clear all travel immediately on a preference change. Newly received
    // events use brief stationary feedback; no old queue is restarted.
    clear(); requestRender();
  }
  function setHidden(value) {
    hidden = value;
    if (hidden) clear();
  }
  function getState() {
    return { encounterId: encounter, revision, lastSeen,
      active: root.children.length, queued: queue.length,
      activeEffects: root.children.map(group => ({ ...group.userData })),
      queuedIds: queue.map(({ event }) => event.id), reducedMotion: motionReduced };
  }
  function dispose() {
    if (disposed) return;
    clear(); disposed = true; root.removeFromParent();
  }
  function play(events, now, timing, origin) {
    if (disposed || hidden || document.hidden) return;
    // A Turn Undead use rolls against every undead in range: keep them all.
    const batch = events.filter(valid);
    batch.slice(0, MULTI.has(batch[0]?.style) ? 12 : 8).forEach((event, lane) => {
      queue.push({ event, lane: lane % 5, timing, origin, first: lane === 0,
        due: now, received: now });
    });
    if (queue.length > MAX_QUEUED) queue.splice(0, queue.length - MAX_QUEUED);
    requestRender();
  }
  return { ingest, play, tick, clear, setReducedMotion, setHidden, getState, dispose };
}
