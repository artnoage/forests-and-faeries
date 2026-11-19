import * as THREE from 'three';

export function rigCharacter(body, parts, kind) {
  function pivot(name, point, children, parent = body) {
    const group = new THREE.Group(); group.name = name;
    group.position.set(...point); parent.add(group);
    body.updateWorldMatrix(true, true);
    for (const child of children) group.attach(child);
    return group;
  }
  const shoulderY = kind === 'skeleton' ? 0.92 : 0.77;
  const right = pivot('right-shoulder', [0.2, shoulderY, 0], parts.right);
  const left = pivot('left-shoulder', [-0.2, shoulderY, 0], parts.left);
  const blade = pivot('blade-grip', kind === 'skeleton' ? [0.12, 0.8, -0.23] : [0.33, 0.66, -0.055], parts.blade);
  const bow = pivot('bow-grip', [-0.36, kind === 'skeleton' ? 0.83 : 0.065, -0.08], parts.bow);
  right.attach(blade); left.attach(bow);
  const head = new THREE.Object3D(); head.name = 'head-anchor'; head.position.set(0, 1.12, -0.1); body.add(head);
  const rest = [right, left, blade, bow].map(object => ({ object, rotation: object.rotation.clone(), position: object.position.clone() }));
  function reset() {
    for (const item of rest) { item.object.rotation.copy(item.rotation); item.object.position.copy(item.position); }
  }
  function equip(style) {
    blade.visible = style === 'slash' || (kind === 'fighter' && !style);
    bow.visible = style === 'arrow' || (['goblin', 'skeleton'].includes(kind) && !style);
  }
  equip(null);
  function pose(style, age) {
    reset(); equip(style);
    const wind = THREE.MathUtils.clamp(age / 280, 0, 1);
    const recovery = THREE.MathUtils.clamp((age - 420) / 380, 0, 1);
    if (style === 'slash') {
      const strike = THREE.MathUtils.clamp((age - 280) / 140, 0, 1);
      right.rotation.x += (0.65 * wind - 2.1 * strike) * (1 - recovery);
      right.rotation.z += (-0.55 * wind + 0.85 * strike) * (1 - recovery);
    } else if (style === 'arrow') {
      const draw = wind * (1 - recovery);
      left.rotation.y -= 0.85 * draw; left.rotation.x += 0.55 * draw;
      right.rotation.x += 0.8 * draw; right.rotation.y -= 0.8 * draw;
    } else {
      right.rotation.x -= 0.9 * wind * (1 - recovery);
      left.rotation.z -= 0.35 * wind * (1 - recovery);
    }
  }
  return {
    right, left, head, blade, bow, isSkinned: false,
    reset, equip, pose,
    walk() {}, idle() {}, hit() {}, death() { return false; },
  };
}

export const RELEASE_AT = 280;
const IMPACT_AT = {
  slash: 360, rotting_fist: 380, heal: 280, turn_undead: 520,
  life_drain: 460, dreadful_glare: 480, sacred_flame: 560,
};
export const impactAt = style => IMPACT_AT[style] ?? 730;
export const actionDuration = style => Math.max(820, impactAt(style) + 650);
