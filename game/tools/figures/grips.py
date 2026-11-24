"""Re-seat the heroes' gear: weapons through the fist, two-handed weapons in both hands,
shields on the forearm, gear the character sheet does not list removed. Headless Blender 5.2:

    blender -b --factory-startup --python game/tools/figures/grips.py -- IN.glb OUT.glb FIGURE [SPEC.json]

SPEC defaults to grips.json next to this file; FIGURE is its key under "figures".

Socket convention (shared by the game and by film scenes that use the same figures)
-----------------------------------------------------------------------------------
* Every held or worn item is its own rigid (unskinned) mesh object parented to a socket bone
  whose pose is never keyed: ``Weapon.R`` (child of ``Hand.R``) for the weapon,
  ``Shield.L`` (child of ``LowerArm.L``) for a shield, ``Grip.L`` (child of ``Weapon.R``)
  marking the off hand's resting place on a two-handed weapon. So an item moves only with
  the hand or forearm that carries it, and a scene can parent anything to the same sockets.
* An item's *grip frame*: origin on the item's long axis where the main hand holds it,
  +Y along the item toward its business end (blade tip, hammer or axe head, staff head),
  +X across it (crossguard, hammer head, axe blade). A shield's frame: origin at its centre,
  +Y out of its face, +X along its height.
* A hand's *palm point* is the centre of the vertices skinned to that hand, its *fist axis*
  the long direction of that blob across the hand bone (the hole through the closed fist),
  signed toward the thumb. Both are measured once in the rest pose, in the hand bone's frame.
* Held means: grip-frame origin on the palm point, +Y along the fist axis (thumb toward the
  business end), +X along the hand bone (wrist to knuckles: the striking edge leads).
* Poses are authored for the weapon, not for the arm, in a body frame: origin between the
  shoulder joints, x to the figure's right, y forward, z up, unit = the figure's arm reach
  (shoulder joint to palm), carried by the Chest bone. Each clip of a style lists keys
  (``grip`` point, ``dir`` of +Y, ``off`` = where the off hand holds, in item lengths from
  the main grip toward the head). Slash keys may be placed at the clip's own wind-up and
  strike (found from the original clip) so the game's timing is kept. Clips a style does
  not author follow the original clip's main-hand motion around the style's base pose.
* Both arms are then solved with two-bone IK (elbows down and out) and written back into
  every clip: upper arm, forearm and hand rotations. Nothing else in a clip is changed.

The same functions work inside a live Blender session (e.g. over the Blender MCP socket):
``apply(arm, body, figure_spec, styles)`` on an imported figure, then export.
"""
from __future__ import annotations

import json
import math
import struct
import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils.kdtree import KDTree
from mathutils import Matrix, Quaternion, Vector

SOCKETS = ('Weapon.R', 'Weapon.L', 'Grip.L', 'Shield.L', 'BackShield', 'BackWeapon')


# ----------------------------------------------------------------------------- scene helpers
def load(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    arm = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
    body = next(o for o in bpy.context.scene.objects if o.type == 'MESH' and o.vertex_groups)
    return arm, body


def fcurve_bags(act):
    """Every F-curve collection of an action (layered actions in Blender 4.4+)."""
    if getattr(act, 'layers', None):
        for layer in act.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    yield bag.fcurves
    elif hasattr(act, 'fcurves'):
        yield act.fcurves


def use_action(arm, act):
    arm.animation_data.action = act
    if getattr(arm.animation_data, 'action_slot', None) is None and getattr(act, 'slots', None):
        arm.animation_data.action_slot = act.slots[0]


def frames(act):
    a, b = act.frame_range
    return list(range(int(round(a)), int(round(b)) + 1))


def unkey_sockets(arm, names):
    for act in bpy.data.actions:
        for curves in fcurve_bags(act):
            for fc in [fc for fc in curves if any(f'pose.bones["{n}"]' in fc.data_path for n in names)]:
                curves.remove(fc)
    for n in names:
        if n in arm.pose.bones:
            pb = arm.pose.bones[n]
            pb.location = (0, 0, 0)
            pb.rotation_quaternion = (1, 0, 0, 0)
            pb.rotation_euler = (0, 0, 0)
            pb.scale = (1, 1, 1)


def rest_mode(arm, on):
    arm.data.pose_position = 'REST' if on else 'POSE'
    bpy.context.view_layer.update()


def world_rest(arm, bone):
    return arm.matrix_world @ arm.data.bones[bone].matrix_local


def world_pose(arm, bone):
    return arm.matrix_world @ arm.pose.bones[bone].matrix


def unit(v):
    v = Vector(v)
    return v.normalized() if v.length > 1e-9 else v


def perp(v, axis):
    v = Vector(v)
    return v - v.dot(axis) * axis


def basis_from(a_from, b_from, a_to, b_to):
    """Rotation taking the orthonormal pair (a_from, b_from) to (a_to, b_to)."""
    def m(a, b):
        a = unit(a)
        b = unit(perp(b, a))
        return Matrix((a, b, a.cross(b))).transposed()
    return m(a_to, b_to) @ m(a_from, b_from).inverted()


def frame_matrix(origin, y, x):
    y = unit(y)
    x = unit(perp(x, y))
    M = Matrix((x, y, x.cross(y))).transposed().to_4x4()
    M.translation = Vector(origin)
    return M


# ----------------------------------------------------------------------------- measurements
def hand_measure(arm, body, side, thumb_hint):
    """Palm point and thumb-signed fist axis of a hand, in the hand bone's frame (rest pose)."""
    name = f'Hand.{side}'
    gi = body.vertex_groups[name].index
    pts = []
    for v in body.data.vertices:
        if v.groups and max(v.groups, key=lambda g: g.weight).group == gi:
            pts.append(body.matrix_world @ v.co)
    P = np.array([tuple(p) for p in pts])
    c = P.mean(0)
    H = world_rest(arm, name)
    bone = np.array(tuple(unit(H.to_3x3() @ Vector((0, 1, 0)))))
    Q = P - c
    Q = Q - np.outer(Q @ bone, bone)
    _, V = np.linalg.eigh(Q.T @ Q)
    axis = Vector(tuple(V[:, -1]))
    if axis.dot(Vector(thumb_hint)) < 0:
        axis = -axis
    inv = H.inverted()
    return inv @ Vector(tuple(c)), unit(inv.to_3x3() @ axis)


def limb_radius(arm, body, bone):
    gi = body.vertex_groups[bone].index
    M = world_rest(arm, bone)
    head, axis = M.translation, unit(M.to_3x3() @ Vector((0, 1, 0)))
    d = [perp(body.matrix_world @ v.co - head, axis).length for v in body.data.vertices
         if v.groups and max(v.groups, key=lambda g: g.weight).group == gi]
    return float(np.percentile(d, 70)) if d else 0.03


def principal(obj):
    P = np.array([tuple(v.co) for v in obj.data.vertices])
    c = P.mean(0)
    _, V = np.linalg.eigh(np.cov((P - c).T))
    return P, c, V[:, 2], V[:, 1], V[:, 0]


def item_frame(obj, head, grip, palm_world, flip_across=False):
    """Grip frame of a long item in its mesh coordinates, plus its length."""
    P, c, y, x, _ = principal(obj)
    t = (P - c) @ y
    lo, hi = c + t.min() * y, c + t.max() * y
    W = obj.matrix_world
    wlo, whi = W @ Vector(tuple(lo)), W @ Vector(tuple(hi))
    if head == 'up':
        flip = wlo.z > whi.z
    elif head == 'wide':
        r = np.linalg.norm((P - c) - np.outer(t, y), axis=1)
        span = t.max() - t.min()
        flip = r[t < t.min() + .2 * span].max() > r[t > t.max() - .2 * span].max()
    else:   # 'far': the end away from the hand that holds it in the rest pose
        flip = (wlo - palm_world).length > (whi - palm_world).length
    if flip:
        y = -y
    t = (P - c) @ y
    length = float(t.max() - t.min())
    if grip == 'rest':
        p = np.array(tuple(W.inverted() @ palm_world))
        g = float(np.clip((p - c) @ y, t.min(), t.max()))
    else:
        g = float(t.min() + grip * length)
    if flip_across:
        x = -x
    K = frame_matrix(Vector(tuple(c + g * y)), Vector(tuple(y)), Vector(tuple(x)))
    return K, length


def shield_frame(obj, flip_face=False, flip_up=False):
    """Shield frame in mesh coordinates: centre, +Y out of the face (the domed side), +X its height."""
    P, c, a, b, n = principal(obj)
    t = (P - c) @ n
    r = np.linalg.norm((P - c) - np.outer(t, n), axis=1)
    rim, mid = r > np.percentile(r, 75), r < np.percentile(r, 25)
    if t[mid].mean() < t[rim].mean():
        n = -n
        t = -t
    if flip_face:
        n, t = -n, -t
    up = -a if flip_up else a
    K = frame_matrix(Vector(tuple(c)), Vector(tuple(n)), Vector(tuple(up)))
    return K, float(-t.min()), float(t.max())


# ----------------------------------------------------------------------------- solving
class Figure:
    def __init__(self, arm, body, cfg):
        self.arm, self.body, self.cfg = arm, body, cfg
        rest_mode(arm, True)
        thumbs = cfg.get('thumb', {})
        self.palm, self.fist, self.length = {}, {}, {}
        for s in 'RL':
            self.palm[s], self.fist[s] = hand_measure(arm, body, s, thumbs.get(s, (0, 1, 0)))
            self.length[s] = (arm.data.bones[f'UpperArm.{s}'].length, arm.data.bones[f'LowerArm.{s}'].length)
        heads = [world_rest(arm, f'UpperArm.{s}').translation for s in 'RL']
        self.origin = (heads[0] + heads[1]) / 2
        self.reach = sum(sum(self.length[s]) + self.palm[s].length for s in 'RL') / 2
        self.chest_rest_inv = world_rest(arm, 'Chest').inverted()
        self.checks = []
        self.shield = None
        rest_mode(arm, False)

    # body frame -> world at the current frame
    def carrier(self):
        return world_pose(self.arm, 'Chest') @ self.chest_rest_inv

    def to_world(self, D, p):
        return D @ (self.origin + self.reach * Vector(p))

    def to_body(self, D, w):
        return (D.inverted() @ Vector(w) - self.origin) / self.reach

    def hand_rotation(self, side, d, knuckles):
        a = self.fist[side]
        b = unit(perp(Vector((0, 1, 0)), a))
        return basis_from(a, b, d, knuckles)

    def solve_arm(self, side, P, d, D, pole_hint):
        """Pose UpperArm/LowerArm/Hand so the palm is at P with the fist axis along d.
        Returns {bone: world matrix} and the distance by which P was missed."""
        arm = self.arm
        S = world_pose(arm, f'UpperArm.{side}').translation
        a, b = self.length[side]
        pole = unit(D.to_3x3() @ Vector(pole_hint))
        knuckles = perp(P - S, d)
        for _ in range(3):
            if knuckles.length < 1e-4:
                knuckles = perp(D.to_3x3() @ Vector((0, 1, 0)), d)
            R = self.hand_rotation(side, d, knuckles)
            wrist = P - R @ self.palm[side]
            u = wrist - S
            reach = u.length
            dist = min(max(reach, abs(a - b) + 1e-4), a + b - 1e-4)
            u = unit(u)
            x = (a * a - b * b + dist * dist) / (2 * dist)
            h = math.sqrt(max(a * a - x * x, 0.0))
            n = unit(perp(pole, u))
            if n.length < 1e-6:
                n = unit(perp(Vector((0, 0, -1)), u))
            E = S + u * x + n * h
            T = S + u * dist
            knuckles = perp(T - E, d)
        miss = max(0.0, reach - dist)
        world = {}
        for bone, head, tail in ((f'UpperArm.{side}', S, E), (f'LowerArm.{side}', E, T)):
            cur = world_pose(arm, bone).to_3x3()
            rot = (cur @ Vector((0, 1, 0))).rotation_difference(unit(tail - head)).to_matrix() @ cur
            M = rot.to_4x4()
            M.translation = head
            world[bone] = M
        M = R.to_4x4()
        M.translation = T
        world[f'Hand.{side}'] = M
        return world, miss

    def solve_shield(self, D, pose):
        """Pose the shield arm so the shield's centre, face and height follow a body-frame pose.
        The elbow stays on the upper arm's sphere; the shield shifts by what that costs."""
        sh, arm = self.shield, self.arm
        side = sh['side']
        C = self.to_world(D, pose['centre'])
        n = unit(D.to_3x3() @ unit(pose['normal']))
        up = -unit(D.to_3x3() @ unit(pose['fore']))
        Lw = frame_matrix(C, n, up) @ sh['rel'].inverted()
        S = world_pose(arm, f'UpperArm.{side}').translation
        a = self.length[side][0]
        E = S + a * unit(Lw.translation - S)
        shift = (E - Lw.translation).length
        Lw.translation = E
        cur = world_pose(arm, f'UpperArm.{side}').to_3x3()
        rot = (cur @ Vector((0, 1, 0))).rotation_difference(unit(E - S)).to_matrix() @ cur
        U = rot.to_4x4()
        U.translation = S
        return {f'UpperArm.{side}': U, sh['fore']: Lw, f'Hand.{side}': Lw @ sh['hand_rel']}, shift

    def key_arm(self, world, frame, prev):
        """Write the solved world matrices as pose-bone rotations at a frame."""
        arm = self.arm
        Ainv = arm.matrix_world.inverted()
        posed = {}
        for bone in world:   # parents first: UpperArm, LowerArm, Hand
            pb = arm.pose.bones[bone]
            parent = pb.parent
            pm = posed[parent.name] if parent.name in posed else parent.matrix
            rest_rel = parent.bone.matrix_local.inverted() @ pb.bone.matrix_local
            target = Ainv @ world[bone]
            basis = (pm @ rest_rel).inverted() @ target
            posed[bone] = target
            q = basis.to_quaternion()
            if bone in prev and prev[bone].dot(q) < 0:
                q.negate()
            prev[bone] = q
            pb.rotation_mode = 'QUATERNION'
            pb.rotation_quaternion = q
            pb.keyframe_insert('rotation_quaternion', frame=frame)


def ease(t):
    return t * t * (3 - 2 * t)


def interp(keys, t):
    """Keys are (time, pose); pose has grip, dir, off. Smoothstep in time, slerp in direction."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, p0), (t1, p1) in zip(keys, keys[1:]):
        if t <= t1:
            u = ease((t - t0) / max(t1 - t0, 1e-6))
            q = unit(p0['dir']).rotation_difference(unit(p1['dir']))
            d = Quaternion().slerp(q, u) @ unit(p0['dir'])
            return {'grip': Vector(p0['grip']).lerp(Vector(p1['grip']), u), 'dir': d,
                    'off': p0.get('off', 0) * (1 - u) + p1.get('off', 0) * u}
    return keys[-1][1]


def clip_keys(style, clip, anchors):
    spec = style['clips'].get(clip)
    if spec is None:
        return None
    keys = []
    for k in spec:
        at = k['at']
        t = anchors[at] if isinstance(at, str) else float(at)
        pose = dict(style['poses'][k['pose']]) if 'pose' in k else {}
        pose.update({x: k[x] for x in ('grip', 'dir', 'off', 'centre', 'normal', 'fore') if x in k})
        keys.append((t, pose))
    keys.sort(key=lambda kv: kv[0])
    return keys


def interp_shield(keys, t):
    """Shield keys: centre, normal, fore (elbow to wrist). Smoothstep; directions by slerp."""
    def at(p0, p1, u):
        out = {'centre': Vector(p0['centre']).lerp(Vector(p1['centre']), u)}
        for k in ('normal', 'fore'):
            q = unit(p0[k]).rotation_difference(unit(p1[k]))
            out[k] = Quaternion().slerp(q, u) @ unit(p0[k])
        return out
    if t <= keys[0][0]:
        return at(keys[0][1], keys[0][1], 0)
    for (t0, p0), (t1, p1) in zip(keys, keys[1:]):
        if t <= t1:
            return at(p0, p1, ease((t - t0) / max(t1 - t0, 1e-6)))
    return at(keys[-1][1], keys[-1][1], 0)


def apply_weapon(fig, obj_name, item, style, report, shield_style=None):
    arm = fig.arm
    side = item.get('hand', 'R')
    off_side = 'L' if side == 'R' else 'R'
    obj = bpy.data.objects[obj_name]
    # Seat the item rigidly in the main hand (rest pose).
    rest_mode(arm, True)
    H0 = world_rest(arm, f'Hand.{side}')
    palm0 = H0 @ fig.palm[side]
    K, length = item_frame(obj, item.get('head', 'far'), item.get('grip', 'rest'), palm0, item.get('flip_across', False))
    a = H0.to_3x3() @ fig.fist[side]
    b = H0.to_3x3() @ unit(perp(Vector((0, 1, 0)), fig.fist[side]))
    G0 = frame_matrix(palm0, a, b)
    base = style['poses'][style['base']]
    two = 'off' in base
    if two and 'Grip.L' in arm.data.bones:
        place_bone(arm, 'Grip.L', G0 @ Vector((0, base['off'] * length, 0)), a)
        rest_mode(arm, True)
    obj.matrix_world = G0 @ K.inverted()
    bpy.context.view_layer.update()
    grip_local = H0.inverted() @ G0          # grip frame in the hand bone's frame
    fig.checks.append(('weapon', obj, K, f'Hand.{side}', fig.palm[side]))
    rest_mode(arm, False)
    poles = {'R': (0.55, -0.45, -0.7), 'L': (-0.55, -0.45, -0.7)}
    for act in bpy.data.actions:
        use_action(arm, act)
        fr = frames(act)
        # Pass 1: the original clip's carrier and main-hand palm in the body frame.
        orig = []
        for f in fr:
            bpy.context.scene.frame_set(f)
            D = fig.carrier()
            palm = world_pose(arm, f'Hand.{side}') @ fig.palm[side]
            orig.append(fig.to_body(D, palm))
        ys = [p.y for p in orig]
        n = max(len(fr) - 1, 1)
        i_strike = int(np.argmax(ys))
        i_wind = int(np.argmin(ys[:i_strike + 1])) if i_strike > 0 else 0
        anchors = {'start': 0.0, 'end': 1.0, 'strike': i_strike / n, 'wind': i_wind / n,
                   'follow': (i_strike + 0.5 * (n - i_strike)) / n}
        keys = clip_keys(style, act.name, anchors)
        skeys = clip_keys(shield_style, act.name, anchors) if (fig.shield and shield_style) else None
        follow = style.get('follow', 0.7)
        worst_shield = 0.0
        prev, worst_main, worst_off = {}, 0.0, 0.0
        for j, f in enumerate(fr):
            bpy.context.scene.frame_set(f)
            D = fig.carrier()
            t = j / n
            if keys:
                pose = interp(keys, t)
                grip_b, dir_b, off = Vector(pose['grip']), unit(pose['dir']), pose.get('off', 0)
            else:
                grip_b = Vector(base['grip']) + follow * (orig[j] - orig[0])
                dir_b, off = unit(base['dir']), base.get('off', 0)
            # Keep the pose within both arms' reach: slide the weapon toward the shoulders.
            shoulders = {s: fig.to_body(D, world_pose(arm, f'UpperArm.{s}').translation) for s in 'RL'}
            rmax = item.get('reach', style.get('reach', 0.9))
            for _ in range(8):
                pts = [(grip_b, shoulders[side])]
                if two:
                    pts.append((grip_b + dir_b * (off * length / fig.reach), shoulders[off_side]))
                e = Vector()
                for p, s in pts:
                    v = p - s
                    if v.length > rmax:
                        e += v * (1 - rmax / v.length)
                if e.length < 1e-3:
                    break
                grip_b = grip_b - 0.8 * e
            P = fig.to_world(D, grip_b)
            d = unit(D.to_3x3() @ dir_b)
            world, miss = fig.solve_arm(side, P, d, D, poles[side])
            worst_main = max(worst_main, miss)
            if two:
                Hm = world[f'Hand.{side}']
                G = Hm @ grip_local
                axis = unit(G.to_3x3() @ Vector((0, 1, 0)))
                lo, hi = style.get('off_range', (off, off))
                best = None
                for c in sorted(set([off] + list(np.linspace(lo, hi, 13)))):
                    Po = G.translation + axis * (c * length)
                    w2, m2 = fig.solve_arm(off_side, Po, axis, D, poles[off_side])
                    score = m2 + 0.25 * abs(c - off) * length
                    if best is None or score < best[0]:
                        best = (score, w2, m2)
                world.update(best[1])
                worst_off = max(worst_off, best[2])
            if skeys:
                p = interp_shield(skeys, t)
                w3, sh_shift = fig.solve_shield(D, p)
                world.update(w3)
                worst_shield = max(worst_shield, sh_shift)
            fig.key_arm(world, f, prev)
        report[act.name] = {'main_miss': round(worst_main, 4), 'off_miss': round(worst_off, 4) if two else None,
                            'shield_shift': round(worst_shield, 4) if skeys else None,
                            'strike': round(anchors['strike'], 3), 'wind': round(anchors['wind'], 3)}
    return length


def place_bone(arm, name, head_world, y_world, parent=None):
    """Move (or create) a socket bone so its rest head is at a world point."""
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.data.edit_bones.get(name) or arm.data.edit_bones.new(name)
    if parent:
        eb.parent = arm.data.edit_bones[parent]
        eb.use_connect = False
    inv = arm.matrix_world.inverted()
    eb.head = inv @ head_world
    eb.tail = inv @ (head_world + 0.05 * unit(y_world))
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()


def apply_shield(fig, obj_name, spec):
    arm, body = fig.arm, fig.body
    obj = bpy.data.objects[obj_name]
    socket, fore = spec.get('socket', 'Shield.L'), spec.get('forearm', 'LowerArm.L')
    rest_mode(arm, True)
    L = world_rest(arm, fore)
    head, tail = L.translation, L @ Vector((0, arm.data.bones[fore].length, 0))
    along = unit(tail - head)
    face = unit(perp(Vector(spec['face']), along))
    K, back, front = shield_frame(obj, spec.get('flip_face', False), spec.get('flip_up', False))
    centre = head.lerp(tail, spec.get('along', 0.55)) + face * (limb_radius(arm, body, fore) + back + spec.get('gap', 0.004))
    up = -along   # the shield's height runs up the forearm toward the elbow
    if spec.get('tilt'):
        up = Quaternion(face, math.radians(spec['tilt'])) @ up
    F = frame_matrix(centre, face, up)
    world = F @ K.inverted()
    obj.parent = arm
    obj.parent_type = 'BONE'
    obj.parent_bone = socket
    bpy.context.view_layer.update()
    obj.matrix_world = world
    bpy.context.view_layer.update()
    fig.checks.append(('shield', obj, K, fore, None))
    fig.shield = {'rel': L.inverted() @ F, 'fore': fore, 'side': fore[-1],
                  'hand_rel': L.inverted() @ world_rest(arm, f'Hand.{fore[-1]}')}
    if spec.get('rename'):
        obj.name = spec['rename']
        obj.data.name = spec['rename']
    rest_mode(arm, False)


def fill_holes(body, shade=0.25):
    """Close the openings left where gear was cut out of the scanned mesh (a shield's footprint on
    the back, a haft's tunnel through a fist): weld seam-split vertices on each opening's rim, cap
    it, and colour the cap with one texel taken from the rim (a darker-than-median rim corner,
    `shade` = its brightness rank, so the cap reads as shadowed armour or cloth)."""
    me = body.data
    bm = bmesh.new()
    bm.from_mesh(me)
    welded = bm.copy()
    bmesh.ops.remove_doubles(welded, verts=welded.verts, dist=1e-5)
    rims, seen = [], set()
    for e in welded.edges:
        if not e.is_boundary or e.index in seen:
            continue
        stack, verts = [e], set()
        seen.add(e.index)
        while stack:
            x = stack.pop()
            verts.update(v.co.copy().freeze() for v in x.verts)
            for v in x.verts:
                for y in v.link_edges:
                    if y.is_boundary and y.index not in seen:
                        seen.add(y.index)
                        stack.append(y)
        rims.append(verts)
    welded.free()
    uv = bm.loops.layers.uv.active
    img = None
    for slot in body.material_slots:
        for node in (slot.material.node_tree.nodes if slot.material and slot.material.node_tree else []):
            if node.type == 'TEX_IMAGE' and node.image and 'color' in node.image.name.lower():
                img = node.image
    px = np.array(img.pixels[:]).reshape(img.size[1], img.size[0], -1) if img else None
    capped = []
    for rim in rims:
        bm.verts.ensure_lookup_table()
        bm.verts.index_update()
        tree = KDTree(len(bm.verts))
        for v in bm.verts:
            tree.insert(v.co, v.index)
        tree.balance()
        pick = {bm.verts[i] for p in rim for (_, i, d) in tree.find_range(p, 1e-5)}
        bmesh.ops.remove_doubles(bm, verts=list(pick), dist=1e-5)
        pick = [v for v in pick if v.is_valid]
        edges = list({e for v in pick for e in v.link_edges if e.is_boundary and all(w in pick for w in e.verts)})
        if len(edges) < 3:
            print('HOLE skipped', len(rim), len(pick), len(edges))
            continue
        faces = bmesh.ops.holes_fill(bm, edges=edges, sides=len(edges) + 1)['faces']
        if not faces:
            faces = bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=False, edges=edges)['geom']
            faces = [f for f in faces if isinstance(f, bmesh.types.BMFace)]
        if not faces:
            print('HOLE unfilled', len(rim), len(pick), len(edges))
            continue
        corners = [l[uv].uv.copy() for v in pick for l in v.link_loops if l.face not in faces]
        if px is not None and corners:
            lum = [px[min(int(c.y % 1 * img.size[1]), img.size[1] - 1), min(int(c.x % 1 * img.size[0]), img.size[0] - 1), :3].mean()
                   for c in corners]
            chosen = corners[int(np.argsort(lum)[int(shade * (len(lum) - 1))])]
        else:
            chosen = corners[0] if corners else Vector((0.5, 0.5))
        tri = bmesh.ops.triangulate(bm, faces=faces)['faces']
        for f in tri:
            f.smooth = True
            f.material_index = 0
            for l in f.loops:
                l[uv].uv = chosen
        lo = Vector([min(p[k] for p in rim) for k in range(3)])
        hi = Vector([max(p[k] for p in rim) for k in range(3)])
        capped.append({'rim': len(edges), 'size': round(max(hi - lo), 3), 'centre': [round(x, 3) for x in (lo + hi) / 2]})
    bm.to_mesh(me)
    bm.free()
    me.update()
    return capped


def two_sided(obj):
    """Thin gear is seen from both sides; give it a double-sided copy of its material."""
    for slot in obj.material_slots:
        if slot.material and slot.material.use_backface_culling:
            name = slot.material.name + '_2s'
            m = bpy.data.materials.get(name)
            if m is None:
                m = slot.material.copy()
                m.name = name
                m.use_backface_culling = False
            slot.material = m


def drop_strays(body, max_verts=200, share=0.2):
    """Delete small loose pieces skinned half to a hand and half to a leg or the hips (a belt
    strap or a haft stub the scan fused between them): they stretch once the hand moves."""
    names = {g.index: g.name for g in body.vertex_groups}
    bm = bmesh.new()
    bm.from_mesh(body.data)
    bm.verts.ensure_lookup_table()
    tree = KDTree(len(bm.verts))
    for v in bm.verts:
        tree.insert(v.co, v.index)
    tree.balance()
    welded = bm.copy()
    bmesh.ops.remove_doubles(welded, verts=welded.verts, dist=1e-5)
    seen, doomed = set(), set()
    for v in welded.verts:
        if v.index in seen:
            continue
        stack, comp = [v], []
        seen.add(v.index)
        while stack:
            x = stack.pop()
            comp.append(x.co.copy())
            for e in x.link_edges:
                y = e.other_vert(x)
                if y.index not in seen:
                    seen.add(y.index)
                    stack.append(y)
        if len(comp) > max_verts:
            continue
        ids = {i for p in comp for (_, i, _) in tree.find_range(p, 1e-5)}
        hand = far = total = 0.0
        for i in ids:
            for g in body.data.vertices[i].groups:
                n = names[g.group]
                total += g.weight
                if n.startswith('Hand.'):
                    hand += g.weight
                elif n.split('.')[0] in ('UpperLeg', 'LowerLeg', 'Hips', 'Spine'):
                    far += g.weight
        if total and hand / total > share and far / total > share:
            doomed |= ids
    welded.free()
    if doomed:
        bmesh.ops.delete(bm, geom=[bm.verts[i] for i in doomed], context='VERTS')
        bm.to_mesh(body.data)
        body.data.update()
    bm.free()
    return len(doomed)


def untangle_hands(body, threshold=0.05):
    """A scanned hand that rested on a thigh or hip was skinned partly to it; once the hand
    moves to a hilt those vertices stretch between the two. Give each such vertex wholly to
    the side (the arm chain or the rest of the body) that holds most of its weight."""
    names = {g.index: g.name for g in body.vertex_groups}
    changed = 0
    for side in 'RL':
        chain = {f'Hand.{side}', f'LowerArm.{side}', f'UpperArm.{side}'}
        hand = body.vertex_groups[f'Hand.{side}'].index
        for v in body.data.vertices:
            w = {g.group: g.weight for g in v.groups if g.weight > 0}
            if w.get(hand, 0) <= threshold:
                continue
            arm_w = sum(x for i, x in w.items() if names[i] in chain)
            far = {i: x for i, x in w.items() if names[i] not in chain}
            if not far or max(far.values()) <= threshold:
                continue
            drop = list(far) if arm_w >= sum(far.values()) else [i for i in w if names[i] in chain]
            keep = sum(x for i, x in w.items() if i not in drop)
            for i in drop:
                body.vertex_groups[i].remove([v.index])
            for g in v.groups:
                g.weight = g.weight / keep
            changed += 1
    return changed


def bridge_gap(obj, min_gap=0.04):
    """Close a missing stretch of a haft (where the scan fused it into the hands) with a plain
    cylinder in the item's own mesh, coloured from the haft next to the gap."""
    P = np.array([tuple(v.co) for v in obj.data.vertices])
    c = P.mean(0)
    _, V = np.linalg.eigh(np.cov((P - c).T))
    a = V[:, 2]
    t = (P - c) @ a
    r = np.linalg.norm((P - c) - np.outer(t, a), axis=1)
    thin = r < np.percentile(r, 40)
    # refit the axis on the thin part (the haft), away from the head's mass
    Q = P[thin]
    c = Q.mean(0)
    _, V = np.linalg.eigh(np.cov((Q - c).T))
    a = V[:, 2]
    t = (P - c) @ a
    r = np.linalg.norm((P - c) - np.outer(t, a), axis=1)
    ts = np.sort(t)
    gaps = np.diff(ts)
    i = int(np.argmax(gaps))
    if gaps[i] < min_gap:
        return None
    lo, hi = ts[i], ts[i + 1]
    near = (np.abs(t - lo) < 0.03) | (np.abs(t - hi) < 0.03)
    radius = float(np.median(r[near & (r < 0.04)])) if np.any(near & (r < 0.04)) else 0.016
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    uv = bm.loops.layers.uv.active
    bm.verts.ensure_lookup_table()
    k = int(np.argmin(np.where(near, np.abs(r - radius), 9)))
    texel = next(iter(bm.verts[k].link_loops))[uv].uv.copy()
    z = Vector((0, 0, 1))
    rot = z.rotation_difference(Vector(tuple(a))).to_matrix().to_4x4()
    M = Matrix.Translation(Vector(tuple(c + a * (lo + hi) / 2))) @ rot
    geom = bmesh.ops.create_cone(bm, cap_ends=False, segments=12, radius1=radius, radius2=radius,
                                 depth=float(hi - lo) + 0.02, matrix=M)
    for v in geom['verts']:
        for f in v.link_faces:
            f.smooth = True
            for l in f.loops:
                l[uv].uv = texel
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()
    return {'gap': round(float(hi - lo), 3), 'radius': round(radius, 4)}


def apply(arm, body, cfg, styles):
    """Apply one figure's spec in the current Blender scene; returns a per-clip report."""
    for name in cfg.get('remove', []):
        o = bpy.data.objects.get(name)
        if o:
            bpy.data.objects.remove(o)
    strays = drop_strays(body)
    untangled = untangle_hands(body)
    bridged = bridge_gap(bpy.data.objects[cfg['weapon']['object']]) if cfg.get('bridge') else None
    # Bone edits first: leaving edit mode re-derives rest matrices and moves bone children.
    if 'shield' in cfg and cfg['shield'].get('socket', 'Shield.L') not in arm.data.bones:
        sh = cfg['shield']
        rest_mode(arm, True)
        L = world_rest(arm, sh.get('forearm', 'LowerArm.L'))
        place_bone(arm, sh.get('socket', 'Shield.L'), L.translation, L.to_3x3() @ Vector((0, 1, 0)),
                   parent=sh.get('forearm', 'LowerArm.L'))
    unkey_sockets(arm, [s for s in SOCKETS if s in arm.data.bones])
    fig = Figure(arm, body, cfg)
    report = {'reach': round(fig.reach, 4), 'stray_vertices_removed': strays, 'untangled_vertices': untangled, 'bridged': bridged}
    if 'shield' in cfg:
        apply_shield(fig, cfg['shield']['object'], cfg['shield'])
    w = cfg['weapon']
    shield_style = styles.get(cfg['shield'].get('style', 'shield')) if 'shield' in cfg else None
    report['length'] = round(apply_weapon(fig, w['object'], w, styles[w['style']], report, shield_style), 4)
    report['arms'] = {s: [round(x, 4) for x in fig.length[s]] + [round(fig.palm[s].length, 4)] for s in 'RL'}
    report['seat_error'] = verify(fig)
    report['capped_holes'] = fill_holes(body, cfg.get('cap_shade', 0.25))
    for o in arm.children_recursive:
        if o.type == 'MESH' and not o.vertex_groups and cfg.get('two_sided', True):
            two_sided(o)
    return report


def verify(fig):
    """Distance from each item's seat to its carrier, over the first frame of every clip."""
    out = {}
    for kind, obj, K, bone, palm in fig.checks:
        worst = 0.0
        for act in bpy.data.actions:
            use_action(fig.arm, act)
            bpy.context.scene.frame_set(frames(act)[0])
            seat = (obj.matrix_world @ K).translation
            M = world_pose(fig.arm, bone)
            if palm is not None:
                worst = max(worst, (seat - M @ palm).length)
            else:
                L = fig.arm.data.bones[bone].length
                rest = (fig.shield['rel'].translation).length
                now = (M.inverted() @ seat).length
                worst = max(worst, abs(now - rest))
        out[obj.name] = round(worst, 4)
    return out


# ----------------------------------------------------------------------------- export
def export(arm, path):
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    for o in arm.children_recursive:
        if o.type == 'MESH':
            o.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(
        filepath=str(path), export_format='GLB', use_selection=True, export_animations=True,
        export_animation_mode='ACTIONS', export_force_sampling=True, export_frame_range=False,
        export_skins=True, export_all_influences=False, export_cameras=False, export_lights=False,
        export_yup=True, export_materials='EXPORT', export_image_format='WEBP', export_image_quality=86,
        export_morph=False)


def _glb(path):
    b = Path(path).read_bytes()
    n = struct.unpack('<I', b[12:16])[0]
    doc = json.loads(b[20:20 + n])
    bin_off = 20 + n
    m = struct.unpack('<I', b[bin_off:bin_off + 4])[0]
    return doc, bytearray(b[bin_off + 8:bin_off + 8 + m])


def restore_images(original, exported):
    """Put the original WebP bytes back (same image names) so textures are not re-encoded."""
    od, ob = _glb(original)
    nd, nb = _glb(exported)
    src = {}
    for im in od.get('images', []):
        v = od['bufferViews'][im['bufferView']]
        src[im.get('name')] = bytes(ob[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']])
    views = [bytes(nb[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']]) for v in nd['bufferViews']]
    for im in nd.get('images', []):
        if im.get('name') in src and im.get('mimeType') == 'image/webp':
            views[im['bufferView']] = src[im['name']]
    out = bytearray()
    for v, data in zip(nd['bufferViews'], views):
        while len(out) % 4:
            out.append(0)
        v['byteOffset'] = len(out)
        v['byteLength'] = len(data)
        out += data
    while len(out) % 4:
        out.append(0)
    nd['buffers'][0]['byteLength'] = len(out)
    js = json.dumps(nd, separators=(',', ':')).encode()
    js += b' ' * (-len(js) % 4)
    total = 12 + 8 + len(js) + 8 + len(out)
    Path(exported).write_bytes(struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<I', len(js)) + b'JSON' + js
                               + struct.pack('<I', len(out)) + b'BIN\x00' + bytes(out))


def main():
    argv = sys.argv[sys.argv.index('--') + 1:]
    src, dst, figure = argv[0], argv[1], argv[2]
    spec_path = Path(argv[3]) if len(argv) > 3 else Path(__file__).with_name('grips.json')
    spec = json.loads(spec_path.read_text())
    arm, body = load(src)
    report = apply(arm, body, spec['figures'][figure], spec['styles'])
    export(arm, dst)
    restore_images(src, dst)
    print('GRIPS_REPORT', json.dumps({figure: report}))


if __name__ == '__main__':
    main()
