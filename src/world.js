// ExploitGym — Exploit Arena Level Builder
// Builds the 3D Red Team Kill Chain course: sleek dark metallic platforms,
// illuminated neon circuit trims, Layer-7 WAF Laser Firewalls, Data Injection
// checkpoints, and the central Mainframe Flag podium (FLAG{R00T_ACCE55_GR4NTED}).
//
// Returns: group, platforms (AABBs), checkpoints, gates, goal, spawn,
//          getColliders(), openGate(i).

import * as THREE from "three";
import { metalMat, roundedGeo, markBloom } from "./gfx.js";

// Cyber Security Tier Palette: Perimeter -> DMZ -> Internal -> Core DB -> Kernel -> Root Sanctum
const SECTOR_THEMES = [
  { name: "Perimeter", color: 0x00f5ff, chassis: 0x111c2e, plate: 0x182c48 }, // Cyan
  { name: "DMZ Auth", color: 0x38bdf8, chassis: 0x0f1c2b, plate: 0x162c45 }, // Sky Blue
  { name: "Network Mesh", color: 0x00ff88, chassis: 0x0c1e24, plate: 0x123030 }, // Emerald
  { name: "Data Vault", color: 0xf59e0b, chassis: 0x1e1c12, plate: 0x302816 }, // Amber
  { name: "Crypto Core", color: 0xa855f7, chassis: 0x1c122e, plate: 0x291845 }, // Purple
  { name: "Root Sanctum", color: 0xff0055, chassis: 0x240d1c, plate: 0x38122a }, // Crimson
];

function boxAABB(cx, cy, cz, sx, sy, sz) {
  return {
    min: { x: cx - sx / 2, y: cy - sy / 2, z: cz - sz / 2 },
    max: { x: cx + sx / 2, y: cy + sy / 2, z: cz + sz / 2 },
  };
}

export const GATE_COUNT = 6;

export function buildWorld() {
  const group = new THREE.Group();
  const platforms = [];
  const checkpoints = [];
  const gates = [];

  let tierIdx = 0;

  // Platform = Dark metallic chassis + titanium plating + glowing neon trim line
  function addPlatform(cx, cy, cz, sx, sy, sz, themeOverride) {
    const theme = themeOverride ?? SECTOR_THEMES[tierIdx++ % SECTOR_THEMES.length];

    // Main dark metal chassis
    const bodyMat = metalMat(theme.chassis, { roughness: 0.35, metalness: 0.85 });
    const mesh = new THREE.Mesh(roundedGeo(sx, sy, sz, 0.14, 2), bodyMat);
    mesh.position.set(cx, cy, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Top cyber plate
    const plateMat = metalMat(theme.plate, { roughness: 0.22, metalness: 0.8 });
    const capMesh = new THREE.Mesh(roundedGeo(sx * 0.96, 0.16, sz * 0.96, 0.08, 2), plateMat);
    capMesh.position.set(cx, cy + sy / 2 - 0.02, cz);
    capMesh.receiveShadow = true;
    group.add(capMesh);

    // Glowing neon border trim line
    const trimGeo = new THREE.BoxGeometry(sx * 0.92, 0.04, sz * 0.92);
    const trimMat = new THREE.MeshBasicMaterial({ color: theme.color, transparent: true, opacity: 0.65 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(cx, cy + sy / 2 + 0.06, cz);
    markBloom(trim);
    group.add(trim);

    platforms.push(boxAABB(cx, cy, cz, sx, sy, sz));
    return mesh;
  }

  // ---- Starting Spawn Deck (Perimeter Security Deck) ----
  const spawn = { x: 0, y: 2, z: 0 };
  addPlatform(0, -0.5, 0, 11, 1, 11, { color: 0x00f5ff, chassis: 0x0e1b2f, plate: 0x162c4a });

  // Floating Spawn Hologram ring
  const spawnRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.08, 8, 36),
    new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.7 })
  );
  spawnRing.rotation.x = Math.PI / 2;
  spawnRing.position.set(0, 0.05, 0);
  markBloom(spawnRing);
  group.add(spawnRing);

  let z = 4.8;
  let y = 0;

  for (let g = 0; g < GATE_COUNT; g++) {
    const theme = SECTOR_THEMES[g % SECTOR_THEMES.length];
    const steps = 3 + (g % 2);

    for (let s = 0; s < steps; s++) {
      const width = Math.max(2.6, 3.4 - g * 0.16);
      const stepDist = width * 0.5 + 1.5 + g * 0.25;
      z += stepDist;
      y += Math.min(0.34, 0.26 + g * 0.02);
      const xoff = g < 2 ? 0 : (s % 2 === 0 ? -1 : 1) * Math.min(0.7, 0.3 + g * 0.06);
      addPlatform(xoff, y - 0.5, z, width, 1, width, theme);
    }

    // ---- Checkpoint Pad (Data Injection Station) ----
    z += 2.8;
    y += 0.28;
    addPlatform(0, y - 0.5, z, 5.2, 1, 5.2, theme);

    // Glowing Injection Portal Rings
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.12, 12, 36),
      new THREE.MeshBasicMaterial({ color: theme.color })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, y + 0.9, z);
    markBloom(ring);
    group.add(ring);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.28, 12, 36),
      new THREE.MeshBasicMaterial({
        color: theme.color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.copy(ring.position);
    markBloom(halo);
    group.add(halo);

    checkpoints.push({
      pos: { x: 0, y: y + 1, z },
      radius: 2.2,
      index: g,
      triggered: false,
      ring,
      halo,
      baseY: y + 0.9,
    });

    // ---- Locked Layer-7 WAF Laser Forcefield ----
    const gateZ = z + 2.8;
    const gateGroup = new THREE.Group();

    // Laser barrier plane
    const laserMat = new THREE.MeshBasicMaterial({
      color: theme.color,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const laserMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 3.8), laserMat);
    laserMesh.position.set(0, y + 1.9, gateZ);
    markBloom(laserMesh);
    gateGroup.add(laserMesh);

    // Left and right metallic pylon emitters
    const pylonGeo = new THREE.CylinderGeometry(0.18, 0.24, 4.2, 10);
    const pylonMat = metalMat(0x132236, { metalness: 0.85, roughness: 0.25 });
    const pLeft = new THREE.Mesh(pylonGeo, pylonMat);
    pLeft.position.set(-2.95, y + 1.9, gateZ);
    pLeft.castShadow = true;

    const pRight = pLeft.clone();
    pRight.position.x = 2.95;

    // Glowing emitter caps
    const capGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const capMat = new THREE.MeshBasicMaterial({ color: theme.color });
    const capL = new THREE.Mesh(capGeo, capMat);
    capL.position.set(-2.95, y + 4.05, gateZ);
    markBloom(capL);

    const capR = capL.clone();
    capR.position.x = 2.95;
    markBloom(capR);

    gateGroup.add(pLeft, pRight, capL, capR);
    group.add(gateGroup);

    gates.push({
      index: g,
      mesh: laserMesh,
      group: gateGroup,
      aabb: boxAABB(0, y + 1.9, gateZ, 6, 4, 0.6),
      open: false,
    });

    z = gateZ + 0.6;
  }

  // ---- Goal Podium: Central Server Mainframe & CTF Flag Flagpodium ----
  z += 3.4;
  y += 0.45;
  addPlatform(0, y - 0.5, z, 7, 1, 7, { color: 0x00f5ff, chassis: 0x0d1a2d, plate: 0x162c4a });

  // Mainframe Server Core base
  const coreBase = new THREE.Mesh(
    roundedGeo(3.2, 0.8, 3.2, 0.1, 2),
    metalMat(0x102138, { metalness: 0.85, roughness: 0.3 })
  );
  coreBase.position.set(0, y + 0.4, z);
  coreBase.castShadow = true;
  group.add(coreBase);

  // Concentric glowing data ring on podium floor
  const inlay = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.1, 10, 40),
    new THREE.MeshBasicMaterial({ color: 0x00f5ff })
  );
  inlay.rotation.x = Math.PI / 2;
  inlay.position.set(0, y + 0.08, z);
  markBloom(inlay);
  group.add(inlay);

  // Flagpole & CTF Data Flag
  const flagGroup = new THREE.Group();
  flagGroup.position.set(0, y, z);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 2.8, 12),
    metalMat(0x2a3e5c, { metalness: 0.9, roughness: 0.2 })
  );
  pole.position.y = 1.4;
  flagGroup.add(pole);

  // Flag beacon top light
  const poleLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
  poleLight.position.y = 2.85;
  markBloom(poleLight);
  flagGroup.add(poleLight);

  // High-tech CTF flag banner
  const flagGeo = new THREE.PlaneGeometry(1.2, 0.75, 12, 4);
  const flagPlane = new THREE.Mesh(
    flagGeo,
    new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide })
  );
  flagPlane.position.set(0.65, 2.2, 0);
  markBloom(flagPlane);
  flagGroup.add(flagPlane);
  group.add(flagGroup);

  const flagBase = flagGeo.attributes.position.array.slice();
  const goal = { pos: { x: 0, y: y + 1, z }, radius: 2.5, flag: flagGroup, flagGeo, flagBase, inlay };

  function getColliders() {
    const closed = gates.filter((g) => !g.open).map((g) => g.aabb);
    return platforms.concat(closed);
  }

  function openGate(i) {
    const gate = gates[i];
    if (gate && !gate.open) gate.open = true;
  }

  return { group, platforms, checkpoints, gates, goal, spawn, getColliders, openGate };
}
