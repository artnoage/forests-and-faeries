import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { validateGLB } from './skinned-cast.js';
import { versioned } from './asset-versions.js';

// Same-origin image textures and static prop models, size-capped, with the
// procedural look as the fallback while they load or when they are missing.
// Presentation only.
export const MAX_TEXTURE_BYTES = 2 * 1024 * 1024;
export const MAX_PROP_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 15000;

const bitmaps = new Map();   // path -> Promise<ImageBitmap|null>
const props = new Map();     // path -> Promise<THREE.Object3D|null>

function sameOrigin(path, pageURL = globalThis.location?.href) {
  const base = new URL('./', pageURL);
  const url = new URL(path, base);
  if (url.origin !== base.origin || !['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported asset origin.');
  return url.href;
}

async function boundedBytes(path, limit, types) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(sameOrigin(versioned(path)), { signal: controller.signal, redirect: 'error',
      credentials: 'same-origin', cache: 'default' });
    if (!response.ok || response.redirected) throw new Error(`asset ${response.status}`);
    const type = String(response.headers.get('content-type') || '').split(';')[0].trim();
    if (types && !types.includes(type)) throw new Error(`asset type ${type}`);
    const declared = Number(response.headers.get('content-length'));
    if (declared > limit) throw new Error('asset too large');
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > limit) throw new Error('asset too large');
    return { buffer, type };
  } finally {
    clearTimeout(timer);
  }
}

export function loadBitmap(path) {
  if (!bitmaps.has(path)) {
    bitmaps.set(path, (async () => {
      try {
        const { buffer, type } = await boundedBytes(path, MAX_TEXTURE_BYTES, ['image/webp', 'image/png']);
        return await createImageBitmap(new Blob([buffer], { type }), { imageOrientation: 'flipY' });
      } catch {
        return null;
      }
    })());
  }
  return bitmaps.get(path);
}

export async function loadTexture(path, { srgb = false, repeat = true, anisotropy = 4 } = {}) {
  const bitmap = await loadBitmap(path);
  if (!bitmap) return null;
  const texture = new THREE.Texture(bitmap);
  texture.flipY = false;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  if (repeat) texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

// A PBR set {albedo, normal, orm}: ORM packs ambient occlusion (R), roughness (G) and metalness (B).
export async function applyTextureSet(material, set, track, { anisotropy = 4 } = {}) {
  if (!set || !material) return false;
  const [albedo, normal, orm] = await Promise.all([
    loadTexture(set.albedo, { srgb: true, anisotropy }),
    set.normal ? loadTexture(set.normal, { anisotropy }) : null,
    set.orm ? loadTexture(set.orm, { anisotropy }) : null,
  ]);
  if (!albedo) {
    [normal, orm].forEach(t => t?.dispose());
    return false;
  }
  for (const texture of [albedo, normal, orm]) if (texture) track(texture);
  material.map = albedo;
  material.color?.set?.('#ffffff');
  if (normal) {
    material.normalMap = normal;
    material.normalScale = new THREE.Vector2(0.9, 0.9);
    material.bumpMap = null;
  }
  if (orm) {
    material.aoMap = orm;
    material.aoMapIntensity = 0.85;
    material.roughnessMap = orm;
    material.metalnessMap = orm;
    material.roughness = 1;
    material.metalness = 1;
  }
  material.emissiveMap = null;
  material.needsUpdate = true;
  return true;
}

export function loadPropModel(path) {
  if (!props.has(path)) {
    props.set(path, (async () => {
      try {
        const { buffer } = await boundedBytes(path, MAX_PROP_BYTES, ['model/gltf-binary', 'application/octet-stream']);
        validateGLB(buffer);
        const manager = new THREE.LoadingManager();
        manager.setURLModifier(url => {
          if (!url.startsWith('blob:')) throw new Error('External model resource rejected.');
          return url;
        });
        const gltf = await new GLTFLoader(manager).parseAsync(buffer, '');
        return gltf.scene;
      } catch {
        return null;
      }
    })());
  }
  return props.get(path);
}

export function resetAssetCaches() {
  bitmaps.clear();
  props.clear();
}
