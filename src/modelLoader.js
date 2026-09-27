// ExploitGym — GLTF/GLB Asset Loader & Cache
// Loads modular sci-fi station models with caching and automatic bounding boxes for physics.

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

const loader = new GLTFLoader();
const cache = new Map();

/**
 * Loads a GLB model from /models/station/<name>.glb
 * Returns a cloned THREE.Group ready to be added to the scene.
 */
export async function loadModel(name, scale = 1) {
  const url = `${import.meta.env.BASE_URL}models/station/${name}.glb`;

  if (!cache.has(url)) {
    const gltf = await new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });

    // Configure shadows and metallic roughness
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    cache.set(url, gltf.scene);
  }

  const cloned = cache.get(url).clone(true);
  if (scale !== 1) cloned.scale.setScalar(scale);
  return cloned;
}

/**
 * Computes an axis-aligned bounding box (AABB) for a mesh/group for the physics collider list
 */
export function getModelAABB(obj) {
  const box = new THREE.Box3().setFromObject(obj);
  return {
    min: { x: box.min.x, y: box.min.y, z: box.min.z },
    max: { x: box.max.x, y: box.max.y, z: box.max.z },
  };
}
