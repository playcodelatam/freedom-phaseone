// ExploitGym — Continuous 3D Space Station Facility Builder
// Assembles the modular 3D space station using GLB models from Kenney Modular Space Kit:
// - Central Hub (Command & Quantum Reactor Core)
// - North Wing: Sector Alpha (Neural AI Containment Bay)
// - East Wing: Sector Beta (Network & Packet Vault)
// - South Wing: Sector Gamma (Binary & Systems Bay)
// - West Wing: Sector Delta (Cryptographic & CTF Vault)
// Interconnected by 4m-wide corridors, airlock gates, workstation task consoles,
// and containment breach emergency alarm lighting.

import * as THREE from "three";
import { loadModel } from "./modelLoader.js";
import { metalMat, markBloom } from "./gfx.js";

export async function buildFacility(scene, colliders) {
  const aabb = (cx, cy, cz, sx, sy, sz) => ({
    min: { x: cx - sx / 2, y: cy - sy / 2, z: cz - sz / 2 },
    max: { x: cx + sx / 2, y: cy + sy / 2, z: cz + sz / 2 },
  });

  const taskSpots = [];
  const sectorPortals = [];
  const emergencyLights = [];

  // Helper to place loaded GLB model
  async function place(name, x, y, z, rotY = 0, scale = 1) {
    try {
      const obj = await loadModel(name, scale);
      obj.position.set(x, y, z);
      obj.rotation.y = rotY;
      scene.add(obj);
      return obj;
    } catch (err) {
      console.warn(`[facility] Failed to load model ${name}:`, err);
      return null;
    }
  }

  // Helper to create an emergency alarm beacon
  function createAlarmBeacon(x, y, z) {
    const geo = new THREE.CylinderGeometry(0.12, 0.15, 0.35, 12);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    markBloom(mesh);
    scene.add(mesh);
    emergencyLights.push(mesh);
    return mesh;
  }

  // =========================================================================
  // 1. CENTRAL HUB (0, 0) — Reactor Core & SOC Command Center
  // =========================================================================
  // Central floor
  const hubFloor = new THREE.Mesh(
    new THREE.CircleGeometry(8.5, 32),
    metalMat(0x132238, { roughness: 0.25, metalness: 0.7 })
  );
  hubFloor.rotation.x = -Math.PI / 2;
  hubFloor.position.y = 0.01;
  hubFloor.receiveShadow = true;
  scene.add(hubFloor);
  colliders.push(aabb(0, -0.5, 0, 18, 1, 18));

  // Holographic planetary table in Central Command
  const holoTable = await place("table-display-planet", 3.2, 0, -2.8, Math.PI * 0.75);
  if (holoTable) colliders.push(aabb(3.2, 0.6, -2.8, 1.4, 1.2, 1.4));

  // Hub consoles & computer workstations
  const hubComp1 = await place("computer-wide", -3.0, 0, 2.8, -Math.PI * 0.25);
  if (hubComp1) colliders.push(aabb(-3.0, 0.6, 2.8, 1.2, 1.2, 1.2));

  // 4 Archway Gates at Hub corridor thresholds
  await place("gate-lasers", 0, 0, -6.5, 0); // North entry
  await place("gate-lasers", 0, 0, 6.5, Math.PI); // South entry
  await place("gate-lasers", 6.5, 0, 0, Math.PI / 2); // East entry
  await place("gate-lasers", -6.5, 0, 0, -Math.PI / 2); // West entry

  // Hub corner barrier walls (prevent walking off into the void between corridors)
  const hubWallMat = metalMat(0x1a2e4c, { roughness: 0.35, metalness: 0.6 });
  const cornerAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  cornerAngles.forEach((ang) => {
    const wx = Math.cos(ang) * 7.2;
    const wz = Math.sin(ang) * 7.2;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.8, 0.6), hubWallMat);
    wall.position.set(wx, 1.9, wz);
    wall.rotation.y = -ang + Math.PI / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    colliders.push(aabb(wx, 1.9, wz, 3.5, 3.8, 3.5));

    // Alarm beacon on corner wall
    createAlarmBeacon(wx * 0.85, 3.5, wz * 0.85);
  });

  // Central Hub Task Station: Auxiliary Coolant Breakers
  const coreTaskDesk = await place("table-display", -2.8, 0, -2.8, Math.PI / 4);
  if (coreTaskDesk) colliders.push(aabb(-2.8, 0.5, -2.8, 1.4, 1.0, 1.4));
  taskSpots.push({
    id: "task-hub",
    taskKey: "reactor-purge",
    pos: { x: -2.8, z: -2.8 },
    name: "Auxiliary Coolant Breakers",
    sector: "Central Core",
    icon: "⚡",
  });

  // =========================================================================
  // 2. CORRIDORS (4m grid, Connecting Hub to the 4 Wings)
  // =========================================================================
  // North Corridor (Z: -8, -12, -16) — corridor runs along X by default, rotate by PI/2 for Z
  for (let z = -8; z >= -16; z -= 4) {
    await place("corridor", 0, 0, z, Math.PI / 2);
    createAlarmBeacon(0, 3.9, z);
  }
  // North corridor wall colliders (left & right)
  colliders.push(aabb(-2.1, 2.0, -12, 0.4, 4.0, 12));
  colliders.push(aabb(2.1, 2.0, -12, 0.4, 4.0, 12));

  // South Corridor (Z: 8, 12, 16)
  for (let z = 8; z <= 16; z += 4) {
    await place("corridor", 0, 0, z, Math.PI / 2);
    createAlarmBeacon(0, 3.9, z);
  }
  colliders.push(aabb(-2.1, 2.0, 12, 0.4, 4.0, 12));
  colliders.push(aabb(2.1, 2.0, 12, 0.4, 4.0, 12));

  // East Corridor (X: 8, 12, 16) — rotation 0 runs along X
  for (let x = 8; x <= 16; x += 4) {
    await place("corridor", x, 0, 0, 0);
    createAlarmBeacon(x, 3.9, 0);
  }
  colliders.push(aabb(12, 2.0, -2.1, 12, 4.0, 0.4));
  colliders.push(aabb(12, 2.0, 2.1, 12, 4.0, 0.4));

  // West Corridor (X: -8, -12, -16)
  for (let x = -8; x >= -16; x -= 4) {
    await place("corridor", x, 0, 0, 0);
    createAlarmBeacon(x, 3.9, 0);
  }
  colliders.push(aabb(-12, 2.0, -2.1, 12, 4.0, 0.4));
  colliders.push(aabb(-12, 2.0, 2.1, 12, 4.0, 0.4));

  // =========================================================================
  // 3. SECTOR ALPHA (North Wing, Z = -24) — Neural AI Containment Bay
  // =========================================================================
  // Room: 12x12m centered at (0, 0, -24)
  await place("room-small", 0, 0, -24, 0);
  colliders.push(aabb(0, -0.5, -24, 12, 1, 12)); // Floor

  // Room perimeter walls (leaving the 4m opening at (0, 0, -18))
  colliders.push(aabb(0, 2.1, -30.1, 12, 4.2, 0.4)); // Back wall (North)
  colliders.push(aabb(-6.1, 2.1, -24, 0.4, 4.2, 12)); // Left wall (West)
  colliders.push(aabb(6.1, 2.1, -24, 0.4, 4.2, 12)); // Right wall (East)
  colliders.push(aabb(-4.0, 2.1, -17.9, 4.2, 4.2, 0.4)); // Front wall left
  colliders.push(aabb(4.0, 2.1, -17.9, 4.2, 4.2, 0.4)); // Front wall right

  // Gate entrance into Alpha
  await place("gate-door", 0, 0, -18.2, 0);

  // Thematic props: AI Containment Cryo Pods & Display Screens
  await place("container-tall", -4.2, 0, -26.5, Math.PI / 4);
  await place("container-tall", 4.2, 0, -26.5, -Math.PI / 4);
  colliders.push(aabb(-4.2, 1.5, -26.5, 1.4, 3.0, 1.4));
  colliders.push(aabb(4.2, 1.5, -26.5, 1.4, 3.0, 1.4));

  await place("display-wall", 0, 0, -29.2, 0);
  colliders.push(aabb(0, 1.8, -29.2, 3.2, 3.6, 0.6));

  // Sector Alpha Task Console: Prompt Injection Quarantine
  await place("table-display", -2.8, 0, -22.5, Math.PI / 2);
  colliders.push(aabb(-2.8, 0.5, -22.5, 1.4, 1.0, 1.4));
  taskSpots.push({
    id: "task-alpha",
    taskKey: "prompt-filter",
    pos: { x: -2.8, z: -22.5 },
    name: "Prompt Injection Quarantine",
    sector: "Sector Alpha",
    icon: "🧠",
  });

  // Sector Alpha Airlock Portal -> Neural Academy (learn)
  sectorPortals.push({
    key: "learn",
    name: "Neural Academy",
    desc: "AI Vulnerability Database",
    emoji: "🧠",
    color: 0x38bdf8,
    padPos: new THREE.Vector3(0, 0.05, -27.5),
  });

  // =========================================================================
  // 4. SECTOR BETA (East Wing, X = 24) — Network & Packet Vault
  // =========================================================================
  await place("room-small", 24, 0, 0, Math.PI / 2);
  colliders.push(aabb(24, -0.5, 0, 12, 1, 12)); // Floor

  // Walls (opening at (18, 0, 0))
  colliders.push(aabb(30.1, 2.1, 0, 0.4, 4.2, 12)); // Back wall (East)
  colliders.push(aabb(24, 2.1, -6.1, 12, 4.2, 0.4)); // Top wall (North)
  colliders.push(aabb(24, 2.1, 6.1, 12, 4.2, 0.4)); // Bottom wall (South)
  colliders.push(aabb(17.9, 2.1, -4.0, 0.4, 4.2, 4.2)); // Front wall top
  colliders.push(aabb(17.9, 2.1, 4.0, 0.4, 4.2, 4.2)); // Front wall bottom

  await place("gate-door", 18.2, 0, 0, Math.PI / 2);

  // Thematic props: High-speed server cluster & network consoles
  await place("computer-wide", 26.5, 0, -3.8, Math.PI);
  await place("computer-wide", 26.5, 0, 3.8, 0);
  colliders.push(aabb(26.5, 0.8, -3.8, 1.4, 1.6, 1.4));
  colliders.push(aabb(26.5, 0.8, 3.8, 1.4, 1.6, 1.4));

  await place("cables", 22.0, 0, 0, Math.PI / 2);

  // Sector Beta Task Console: Firewall Ingress Filter
  await place("table-display", 22.5, 0, -2.8, 0);
  colliders.push(aabb(22.5, 0.5, -2.8, 1.4, 1.0, 1.4));
  taskSpots.push({
    id: "task-beta",
    taskKey: "packet-route",
    pos: { x: 22.5, z: -2.8 },
    name: "Firewall Ingress Filter",
    sector: "Sector Beta",
    icon: "🌐",
  });

  // Sector Beta Airlock Portal -> Exploit Arena (obby)
  sectorPortals.push({
    key: "obby",
    name: "Exploit Arena",
    desc: "Red Team Sandbox",
    emoji: "⚔️",
    color: 0x00f5ff,
    padPos: new THREE.Vector3(27.5, 0.05, 0),
  });

  // =========================================================================
  // 5. SECTOR GAMMA (South Wing, Z = 24) — Binary & Systems Bay
  // =========================================================================
  await place("room-small", 0, 0, 24, Math.PI);
  colliders.push(aabb(0, -0.5, 24, 12, 1, 12)); // Floor

  // Walls (opening at (0, 0, 18))
  colliders.push(aabb(0, 2.1, 30.1, 12, 4.2, 0.4)); // Back wall (South)
  colliders.push(aabb(-6.1, 2.1, 24, 0.4, 4.2, 12)); // Left wall (West)
  colliders.push(aabb(6.1, 2.1, 24, 0.4, 4.2, 12)); // Right wall (East)
  colliders.push(aabb(-4.0, 2.1, 17.9, 4.2, 4.2, 0.4)); // Front wall left
  colliders.push(aabb(4.0, 2.1, 17.9, 4.2, 4.2, 0.4)); // Front wall right

  await place("gate-door", 0, 0, 18.2, Math.PI);

  // Thematic props: Heavy pipes, pressure conduits, security barriers
  await place("pipe", -4.5, 0, 26.0, 0);
  await place("pipe-bend", 4.5, 0, 26.0, Math.PI / 2);
  await place("structure-barrier", -3.5, 0, 21.5, Math.PI / 4);
  colliders.push(aabb(-4.5, 1.2, 26.0, 1.2, 2.4, 1.2));
  colliders.push(aabb(4.5, 1.2, 26.0, 1.2, 2.4, 1.2));

  // Sector Gamma Task Console: Stack Buffer Canary Alignment
  await place("table-display", 2.8, 0, 22.5, -Math.PI / 2);
  colliders.push(aabb(2.8, 0.5, 22.5, 1.4, 1.0, 1.4));
  taskSpots.push({
    id: "task-gamma",
    taskKey: "buffer-align",
    pos: { x: 2.8, z: 22.5 },
    name: "Stack Canary Alignment",
    sector: "Sector Gamma",
    icon: "🧩",
  });

  // Sector Gamma Airlock Portal -> Memory Buffer Lab (puzzles)
  sectorPortals.push({
    key: "puzzles",
    name: "Memory Buffer",
    desc: "Logic & Binary Exploits",
    emoji: "🧩",
    color: 0x00ff88,
    padPos: new THREE.Vector3(0, 0.05, 27.5),
  });

  // =========================================================================
  // 6. SECTOR DELTA (West Wing, X = -24) — Cryptographic & CTF Vault
  // =========================================================================
  await place("room-small", -24, 0, 0, -Math.PI / 2);
  colliders.push(aabb(-24, -0.5, 0, 12, 1, 12)); // Floor

  // Walls (opening at (-18, 0, 0))
  colliders.push(aabb(-30.1, 2.1, 0, 0.4, 4.2, 12)); // Back wall (West)
  colliders.push(aabb(-24, 2.1, -6.1, 12, 4.2, 0.4)); // Top wall (North)
  colliders.push(aabb(-24, 2.1, 6.1, 12, 4.2, 0.4)); // Bottom wall (South)
  colliders.push(aabb(-17.9, 2.1, -4.0, 0.4, 4.2, 4.2)); // Front wall top
  colliders.push(aabb(-17.9, 2.1, 4.0, 0.4, 4.2, 4.2)); // Front wall bottom

  await place("gate-door", -18.2, 0, 0, -Math.PI / 2);

  // Thematic props: Reinforced cryptographic data containers & display wall
  await place("container-wide", -26.5, 0, -3.5, 0);
  await place("container", -26.5, 0, 3.5, 0);
  colliders.push(aabb(-26.5, 0.8, -3.5, 1.4, 1.6, 2.2));
  colliders.push(aabb(-26.5, 0.8, 3.5, 1.4, 1.6, 1.4));

  await place("display-wall-wide", -29.2, 0, 0, Math.PI / 2);
  colliders.push(aabb(-29.2, 1.8, 0, 0.6, 3.6, 3.6));

  // Sector Delta Task Console: Key Vault Decryptor
  await place("table-display", -22.5, 0, 2.8, Math.PI);
  colliders.push(aabb(-22.5, 0.5, 2.8, 1.4, 1.0, 1.4));
  taskSpots.push({
    id: "task-delta",
    taskKey: "crypto-hash",
    pos: { x: -22.5, z: 2.8 },
    name: "Key Vault Decryptor",
    sector: "Sector Delta",
    icon: "🔑",
  });

  // Sector Delta Airlock Portal -> CTF Terminal (arcade)
  sectorPortals.push({
    key: "arcade",
    name: "CTF Terminal",
    desc: "Speed Exploits",
    emoji: "⚡",
    color: 0xff0055,
    padPos: new THREE.Vector3(-27.5, 0.05, 0),
  });

  // Additional Hub Portals for Token Rush & Latent Maze (placed in Central Hub corners)
  sectorPortals.push({
    key: "coinrush",
    name: "Token Rush",
    desc: "Compute Farm",
    emoji: "💾",
    color: 0xf59e0b,
    padPos: new THREE.Vector3(4.8, 0.05, 4.8),
  });
  sectorPortals.push({
    key: "maze",
    name: "Latent Maze",
    desc: "Vector Space",
    emoji: "🌀",
    color: 0xa855f7,
    padPos: new THREE.Vector3(-4.8, 0.05, 4.8),
  });
  sectorPortals.push({
    key: "closet",
    name: "Chassis Bay",
    desc: "Agent Skins & Upgrades",
    emoji: "🦾",
    color: 0xec4899,
    padPos: new THREE.Vector3(4.8, 0.05, -4.8),
  });

  // Alarm state updater
  function setAlarmState(isAlarm, elapsed = 0) {
    const color = isAlarm
      ? (Math.sin(elapsed * 8) > 0 ? 0xff0055 : 0xf59e0b)
      : 0x00f5ff;
    for (const beacon of emergencyLights) {
      beacon.material.color.setHex(color);
    }
  }

  return {
    taskSpots,
    sectorPortals,
    emergencyLights,
    setAlarmState,
  };
}
