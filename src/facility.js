// ExploitGym — The Skeld (Among Us) Continuous 3D Cybersecurity Facility
// Faithful recreation of The Skeld map layout, room distribution, furniture, and hallways:
// - Cafeteria (North Hub, Emergency Table & 4 Dining Tables)
// - Weapons (North-East, Targeting Consoles & Point Defense)
// - O2 (Life Support, Scrubber Tanks & Ventilation Chute)
// - Navigation (Far-East Nose, Pilot Cockpit & Star Charts)
// - Shields (South-East, Hexagonal Energy Matrix)
// - Communications (South-East, Satellite Uplink & Radio Terminal)
// - Storage (South Hub, Crates Stack, Fuel Barrels & Chute)
// - Admin (Center-East, Conference Map Table & Card Swipe)
// - Electrical (Center-West, Generators, Breakers & Exposed Wires)
// - Security (Center-West, CCTV Surveillance Desk)
// - MedBay (Center-North, Medical Beds & Biometric Scan Pad)
// - Upper & Lower Engines (West, Massive Turbines & Fuel Pipes)
// - Reactor (Far-West, Quantum Core & Dual Containment Manifolds)
// Interconnected by the exact Skeld corridor network, airlock gates, and emergency alarm lighting.

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

  // Helper to load and place a GLB asset
  async function place(name, x, y, z, rotY = 0, scale = 1) {
    try {
      const obj = await loadModel(name, scale);
      obj.position.set(x, y, z);
      obj.rotation.y = rotY;
      scene.add(obj);
      return obj;
    } catch (err) {
      console.warn(`[skeld] Could not place model ${name}:`, err);
      return null;
    }
  }

  // Emergency beacon helper
  function makeBeacon(x, y, z) {
    const geo = new THREE.CylinderGeometry(0.14, 0.18, 0.35, 12);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    markBloom(mesh);
    scene.add(mesh);
    emergencyLights.push(mesh);
    return mesh;
  }

  // Room floor generator helper
  function createRoomFloor(x, z, width, depth, colorHex, roughness = 0.35, metalness = 0.6) {
    const geo = new THREE.PlaneGeometry(width, depth);
    const mat = metalMat(colorHex, { roughness, metalness });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.02, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    colliders.push(aabb(x, -0.5, z, width, 1.0, depth));
    return mesh;
  }

  // Corridor helper
  function createHallway(x, z, width, depth, colorHex = 0x1a2638) {
    const geo = new THREE.PlaneGeometry(width, depth);
    const mat = metalMat(colorHex, { roughness: 0.4, metalness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.03, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    colliders.push(aabb(x, -0.5, z, width, 1.0, depth));

    // Hallway curbs / side rails
    if (width > depth) {
      // Horizontal hallway: walls on top and bottom
      colliders.push(aabb(x, 2.0, z - depth / 2, width, 4.0, 0.4));
      colliders.push(aabb(x, 2.0, z + depth / 2, width, 4.0, 0.4));
    } else {
      // Vertical hallway: walls on left and right
      colliders.push(aabb(x - width / 2, 2.0, z, 0.4, 4.0, depth));
      colliders.push(aabb(x + width / 2, 2.0, z, 0.4, 4.0, depth));
    }

    makeBeacon(x, 3.8, z);
    return mesh;
  }

  // Vent grill helper (Among Us iconic vents)
  function createVent(x, z) {
    const geo = new THREE.BoxGeometry(1.6, 0.06, 1.6);
    const mat = metalMat(0x0f172a, { roughness: 0.5, metalness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0.04, z);
    mesh.receiveShadow = true;

    // Vent grating lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = -0.5; i <= 0.5; i += 0.25) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.06), lineMat);
      bar.position.set(0, 0.02, i);
      markBloom(bar);
      mesh.add(bar);
    }
    scene.add(mesh);
  }

  // =========================================================================
  // 0. MAP FOUNDATION (Elongated shape matching The Skeld)
  // =========================================================================
  const baseFloor = new THREE.Mesh(
    new THREE.CircleGeometry(72, 64),
    metalMat(0x0b1322, { roughness: 0.6, metalness: 0.4 })
  );
  baseFloor.rotation.x = -Math.PI / 2;
  baseFloor.scale.set(1.15, 0.85, 1); // Oval Skeld hull aspect ratio
  baseFloor.position.set(0, 0, 0);
  baseFloor.receiveShadow = true;
  scene.add(baseFloor);
  colliders.push(aabb(0, -0.6, 0, 150, 1.0, 110));

  // =========================================================================
  // 1. CAFETERIA (Center-North, 0, -32) — Main Hub
  // =========================================================================
  createRoomFloor(0, -32, 28, 24, 0x22354e); // Diamond-like clean hub floor

  // Walls of Cafeteria (leaving exits West (-14, -32), East (14, -32), South (0, -20))
  colliders.push(aabb(0, 2.0, -44.2, 28, 4.0, 0.5)); // North back wall
  colliders.push(aabb(-14.2, 2.0, -38, 0.5, 4.0, 12)); // West wall top
  colliders.push(aabb(-14.2, 2.0, -26, 0.5, 4.0, 12)); // West wall bottom
  colliders.push(aabb(14.2, 2.0, -38, 0.5, 4.0, 12)); // East wall top
  colliders.push(aabb(14.2, 2.0, -26, 0.5, 4.0, 12)); // East wall bottom
  colliders.push(aabb(-8, 2.0, -19.8, 12, 4.0, 0.5)); // South wall left
  colliders.push(aabb(8, 2.0, -19.8, 12, 4.0, 0.5)); // South wall right

  // Central Emergency Meeting Table
  const emerTable = await place("table-large", 0, 0, -32, 0, 1.3);
  if (emerTable) colliders.push(aabb(0, 0.6, -32, 2.8, 1.2, 2.8));

  // The Iconic Big Red Emergency Button on top of table
  const buttonBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.2, 24), metalMat(0xfbbf24));
  buttonBase.position.set(0, 1.0, -32);
  const redBtn = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 20), new THREE.MeshBasicMaterial({ color: 0xff0055 }));
  redBtn.scale.set(1, 0.5, 1);
  redBtn.position.set(0, 1.15, -32);
  markBloom(redBtn);
  scene.add(buttonBase, redBtn);

  taskSpots.push({
    id: "task-cafeteria",
    taskKey: "cafeteria-reboot",
    pos: { x: 0, z: -32 },
    name: "Emergency Facility Reboot",
    sector: "Cafeteria",
    icon: "🚨",
  });

  // 4 Dining Tables (Matching image layout)
  const diningCoords = [
    { x: -7.5, z: -37 },
    { x: 7.5, z: -37 },
    { x: -7.5, z: -27 },
    { x: 7.5, z: -27 },
  ];
  for (const pos of diningCoords) {
    await place("table-large", pos.x, 0, pos.z, 0, 1.1);
    colliders.push(aabb(pos.x, 0.5, pos.z, 2.4, 1.0, 2.4));
    await place("chair", pos.x - 1.4, 0, pos.z, Math.PI / 2);
    await place("chair", pos.x + 1.4, 0, pos.z, -Math.PI / 2);
  }

  // Food dispenser & counter along North wall
  await place("container-wide", 0, 0, -43, 0);
  await place("computer-wide", -4, 0, -43, 0);
  colliders.push(aabb(0, 0.8, -43, 8.0, 1.6, 1.4));

  // Cafeteria Vent
  createVent(-10, -40);

  // Portal to Chassis Bay (Agent Skins)
  sectorPortals.push({
    key: "closet",
    name: "Chassis Bay",
    desc: "Agent Skins & Customization",
    emoji: "🦾",
    color: 0xec4899,
    padPos: new THREE.Vector3(0, 0.05, -40),
  });

  // =========================================================================
  // 2. WEAPONS (North-East, 36, -28)
  // =========================================================================
  createRoomFloor(36, -28, 18, 16, 0x1f2e48);

  colliders.push(aabb(36, 2.0, -36.2, 18, 4.0, 0.5)); // North wall
  colliders.push(aabb(45.2, 2.0, -28, 0.5, 4.0, 16)); // East wall
  colliders.push(aabb(36, 2.0, -19.8, 18, 4.0, 0.5)); // South wall (doorway at 36, -20)
  colliders.push(aabb(26.8, 2.0, -28, 0.5, 4.0, 16)); // West wall (doorway at 27, -28)

  // Primary Targeting Visor / Gunner Station
  await place("computer-wide", 43, 0, -28, -Math.PI / 2);
  await place("chair-headrest", 41.5, 0, -28, Math.PI / 2);
  colliders.push(aabb(43, 0.7, -28, 1.2, 1.4, 2.2));

  taskSpots.push({
    id: "task-weapons",
    taskKey: "weapons-asteroids",
    pos: { x: 42.5, z: -28 },
    name: "Clear Exploit Probes",
    sector: "Weapons",
    icon: "🎯",
  });

  // Weapons Vent
  createVent(42, -33);

  // Portal to Exploit Arena (Red Team Obby)
  sectorPortals.push({
    key: "obby",
    name: "Exploit Arena",
    desc: "Red Team Cyber Sandbox",
    emoji: "⚔️",
    color: 0x00f5ff,
    padPos: new THREE.Vector3(34, 0.05, -28),
  });

  // =========================================================================
  // 3. O2 (Life Support, 22, -14)
  // =========================================================================
  createRoomFloor(22, -14, 12, 10, 0x14343e);

  colliders.push(aabb(22, 2.0, -19.2, 12, 4.0, 0.5)); // North wall
  colliders.push(aabb(22, 2.0, -8.8, 12, 4.0, 0.5)); // South wall
  colliders.push(aabb(15.8, 2.0, -14, 0.5, 4.0, 10)); // West wall

  // O2 Scrubber Cylinders & Filter Duct
  await place("container-tall", 18, 0, -16, 0);
  await place("pipe", 20, 0, -18, Math.PI / 2);
  colliders.push(aabb(18, 1.5, -16, 1.4, 3.0, 1.4));

  await place("table-display", 25, 0, -14, -Math.PI / 2);
  colliders.push(aabb(25, 0.5, -14, 1.2, 1.0, 1.4));

  taskSpots.push({
    id: "task-o2",
    taskKey: "o2-filter",
    pos: { x: 24, z: -14 },
    name: "Clean O2 Filter",
    sector: "O2 Bay",
    icon: "🍃",
  });

  createVent(25, -17);

  // =========================================================================
  // 4. NAVIGATION (Far-East Nose, 52, 0) — Pilot Cockpit
  // =========================================================================
  createRoomFloor(52, 0, 16, 18, 0x10213b);

  // Cockpit angled nose walls
  colliders.push(aabb(60.2, 2.0, 0, 0.5, 4.0, 18)); // Far East nose wall
  colliders.push(aabb(52, 2.0, -9.2, 16, 4.0, 0.5)); // North wall
  colliders.push(aabb(52, 2.0, 9.2, 16, 4.0, 0.5)); // South wall

  // Dual Pilot Stations
  await place("computer-system", 58, 0, -3.5, -Math.PI / 2);
  await place("chair-cushion-headrest", 56, 0, -3.5, Math.PI / 2);
  await place("computer-system", 58, 0, 3.5, -Math.PI / 2);
  await place("chair-cushion-headrest", 56, 0, 3.5, Math.PI / 2);
  colliders.push(aabb(58, 0.8, -3.5, 1.4, 1.6, 2.0));
  colliders.push(aabb(58, 0.8, 3.5, 1.4, 1.6, 2.0));

  taskSpots.push({
    id: "task-nav",
    taskKey: "nav-chart",
    pos: { x: 55, z: 0 },
    name: "Chart Network Course",
    sector: "Navigation",
    icon: "🧭",
  });

  createVent(58, -7);

  // Portal to Latent Maze
  sectorPortals.push({
    key: "maze",
    name: "Latent Maze",
    desc: "Vector Space",
    emoji: "🌀",
    color: 0xa855f7,
    padPos: new THREE.Vector3(48, 0.05, 0),
  });

  // =========================================================================
  // 5. SHIELDS (South-East, 36, 18)
  // =========================================================================
  createRoomFloor(36, 18, 18, 16, 0x22354c);

  colliders.push(aabb(36, 2.0, 9.8, 18, 4.0, 0.5)); // North wall
  colliders.push(aabb(45.2, 2.0, 18, 0.5, 4.0, 16)); // East wall
  colliders.push(aabb(36, 2.0, 26.2, 18, 4.0, 0.5)); // South wall
  colliders.push(aabb(26.8, 2.0, 18, 0.5, 4.0, 16)); // West wall

  // Glowing Hexagonal Shields Generator on the floor
  const hexMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const hNode = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 6), hexMat);
    hNode.position.set(36 + Math.cos(ang) * 3.2, 0.06, 18 + Math.sin(ang) * 3.2);
    markBloom(hNode);
    scene.add(hNode);
  }
  const hCenter = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.09, 6), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
  hCenter.position.set(36, 0.06, 18);
  markBloom(hCenter);
  scene.add(hCenter);

  // Shield console desk
  await place("table-display", 42, 0, 18, -Math.PI / 2);
  colliders.push(aabb(42, 0.5, 18, 1.2, 1.0, 1.4));

  taskSpots.push({
    id: "task-shields",
    taskKey: "shields-prime",
    pos: { x: 40.5, z: 18 },
    name: "Prime Shield Conduits",
    sector: "Shields",
    icon: "🛡️",
  });

  createVent(42, 23);

  // =========================================================================
  // 6. COMMUNICATIONS (South-East, 18, 38)
  // =========================================================================
  createRoomFloor(18, 38, 14, 12, 0x16283d);

  colliders.push(aabb(18, 2.0, 44.2, 14, 4.0, 0.5)); // South wall
  colliders.push(aabb(25.2, 2.0, 38, 0.5, 4.0, 12)); // East wall
  colliders.push(aabb(10.8, 2.0, 38, 0.5, 4.0, 12)); // West wall

  // Radio terminal & satellite gear
  await place("table-inset", 18, 0, 42, 0);
  await place("computer-screen", 18, 0, 42.5, 0);
  await place("chair-armrest", 18, 0, 40, Math.PI);
  colliders.push(aabb(18, 0.6, 42, 2.4, 1.2, 1.2));

  taskSpots.push({
    id: "task-comms",
    taskKey: "comms-frequency",
    pos: { x: 18, z: 39 },
    name: "Calibrate Sat Frequency",
    sector: "Communications",
    icon: "📡",
  });

  // =========================================================================
  // 7. STORAGE (South Center, 0, 24) — Cargo Warehouse Bay
  // =========================================================================
  createRoomFloor(0, 24, 26, 22, 0x182436);

  colliders.push(aabb(0, 2.0, 35.2, 26, 4.0, 0.5)); // South wall
  colliders.push(aabb(-13.2, 2.0, 24, 0.5, 4.0, 22)); // West wall
  colliders.push(aabb(13.2, 2.0, 24, 0.5, 4.0, 22)); // East wall
  colliders.push(aabb(-8, 2.0, 12.8, 12, 4.0, 0.5)); // North wall left
  colliders.push(aabb(8, 2.0, 12.8, 12, 4.0, 0.5)); // North wall right

  // Huge Cargo Containers Stack in center of Storage (matching the image)
  await place("container-wide", -2, 0, 22, 0);
  await place("container-tall", 2.5, 0, 22, Math.PI / 4);
  await place("container", 0, 0, 26, 0);
  await place("container-flat", 3, 0, 26, 0);
  colliders.push(aabb(0, 1.2, 24, 7.5, 2.4, 7.5));

  // Fuel canisters & trash chute on south wall
  await place("container-tall", -10, 0, 33, 0);
  colliders.push(aabb(-10, 1.5, 33, 1.4, 3.0, 1.4));

  taskSpots.push({
    id: "task-storage",
    taskKey: "engine-align",
    pos: { x: -8, z: 31 },
    name: "Refuel Engine Conduits",
    sector: "Storage Bay",
    icon: "⛽",
  });

  // Portal to Token Rush (Compute Farm)
  sectorPortals.push({
    key: "coinrush",
    name: "Token Rush",
    desc: "Compute Farm Mining",
    emoji: "💾",
    color: 0xf59e0b,
    padPos: new THREE.Vector3(8, 0.05, 30),
  });

  // =========================================================================
  // 8. ADMIN (Center-East, 16, 4) — SOC Conference
  // =========================================================================
  createRoomFloor(16, 4, 16, 14, 0x4a1824, 0.2, 0.4); // Luxurious Burgundy carpet floor

  colliders.push(aabb(16, 2.0, -3.2, 16, 4.0, 0.5)); // North wall
  colliders.push(aabb(16, 2.0, 11.2, 16, 4.0, 0.5)); // South wall
  colliders.push(aabb(24.2, 2.0, 4, 0.5, 4.0, 14)); // East wall
  colliders.push(aabb(7.8, 2.0, 4, 0.5, 4.0, 14)); // West wall

  // Central Holographic Strategy Map Conference Table
  const adminTable = await place("table-large", 16, 0, 4, 0, 1.3);
  const holoPlan = await place("table-display-planet", 16, 0.9, 4, 0, 1.2);
  if (adminTable) colliders.push(aabb(16, 0.6, 4, 3.2, 1.2, 3.2));

  // Conference chairs around table
  await place("chair-armrest", 13, 0, 4, Math.PI / 2);
  await place("chair-armrest", 19, 0, 4, -Math.PI / 2);
  await place("chair-armrest", 16, 0, 1.5, Math.PI);
  await place("chair-armrest", 16, 0, 6.5, 0);

  // Card Swipe Terminal on North wall
  await place("table-display", 16, 0, -2, 0);
  colliders.push(aabb(16, 0.5, -2, 1.4, 1.0, 1.2));

  taskSpots.push({
    id: "task-admin",
    taskKey: "admin-swipe",
    pos: { x: 16, z: -0.5 },
    name: "Card Swipe Authorization",
    sector: "Admin",
    icon: "💳",
  });

  createVent(22, 9);

  // Portal to CTF Terminal
  sectorPortals.push({
    key: "arcade",
    name: "CTF Terminal",
    desc: "Speed Exploit Drills",
    emoji: "⚡",
    color: 0xff0055,
    padPos: new THREE.Vector3(21, 0.05, 4),
  });

  // =========================================================================
  // 9. ELECTRICAL (Center-West, -14, 12)
  // =========================================================================
  createRoomFloor(-14, 12, 16, 14, 0x1f2937);

  colliders.push(aabb(-14, 2.0, 4.8, 16, 4.0, 0.5)); // North wall
  colliders.push(aabb(-14, 2.0, 19.2, 16, 4.0, 0.5)); // South wall
  colliders.push(aabb(-22.2, 2.0, 12, 0.5, 4.0, 14)); // West wall
  colliders.push(aabb(-5.8, 2.0, 12, 0.5, 4.0, 14)); // East wall

  // Generator Racks & Exposed Wires
  await place("computer-wide", -18, 0, 10, Math.PI / 2);
  await place("computer-wide", -18, 0, 14, Math.PI / 2);
  colliders.push(aabb(-18, 0.8, 12, 1.4, 1.6, 6.0));

  await place("cables", -14, 0, 8, 0);

  // Wiring Panel on West wall
  await place("table-display", -20.5, 0, 12, Math.PI / 2);
  colliders.push(aabb(-20.5, 0.5, 12, 1.2, 1.0, 1.4));

  taskSpots.push({
    id: "task-electrical",
    taskKey: "electrical-wiring",
    pos: { x: -19, z: 12 },
    name: "Fix Fiber & Power Wiring",
    sector: "Electrical",
    icon: "🔌",
  });

  createVent(-20, 17);

  // =========================================================================
  // 10. SECURITY (Center-West, -22, -2) — CCTV Surveillance
  // =========================================================================
  createRoomFloor(-22, -2, 12, 12, 0x133828); // Green surveillance floor

  colliders.push(aabb(-22, 2.0, -8.2, 12, 4.0, 0.5)); // North wall
  colliders.push(aabb(-22, 2.0, 4.2, 12, 4.0, 0.5)); // South wall
  colliders.push(aabb(-28.2, 2.0, -2, 0.5, 4.0, 12)); // West wall
  colliders.push(aabb(-15.8, 2.0, -2, 0.5, 4.0, 12)); // East wall

  // CCTV Surveillance Screen Wall & Swivel Chairs
  await place("display-wall", -22, 0, -7, 0);
  await place("table-display", -22, 0, -5.5, 0);
  await place("chair-armrest", -22, 0, -4, Math.PI);
  colliders.push(aabb(-22, 1.2, -6.5, 4.2, 2.4, 1.5));

  taskSpots.push({
    id: "task-security",
    taskKey: "security-cctv",
    pos: { x: -22, z: -4 },
    name: "Inspect CCTV Surveillance",
    sector: "Security",
    icon: "📹",
  });

  createVent(-26, 2);

  // =========================================================================
  // 11. MEDBAY (Center-North-West, -12, -18)
  // =========================================================================
  createRoomFloor(-12, -18, 16, 14, 0x113e48); // Clinical Cyan floor

  colliders.push(aabb(-12, 2.0, -25.2, 16, 4.0, 0.5)); // North wall
  colliders.push(aabb(-12, 2.0, -10.8, 16, 4.0, 0.5)); // South wall
  colliders.push(aabb(-20.2, 2.0, -18, 0.5, 4.0, 14)); // West wall
  colliders.push(aabb(-3.8, 2.0, -18, 0.5, 4.0, 14)); // East wall

  // 3 Medical Hospital Beds along the West wall (matching image)
  await place("bed-single-cover", -18, 0, -22, Math.PI / 2);
  await place("bed-single-cover", -18, 0, -18, Math.PI / 2);
  await place("bed-single-cover", -18, 0, -14, Math.PI / 2);
  colliders.push(aabb(-18, 0.5, -18, 1.6, 1.0, 10.0));

  // The Holographic MedBay Body Scanner Pad
  const scanPad = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.8, 0.12, 32),
    new THREE.MeshBasicMaterial({ color: 0x00f5ff })
  );
  scanPad.position.set(-8, 0.06, -18);
  markBloom(scanPad);
  const scanRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.08, 10, 32),
    new THREE.MeshBasicMaterial({ color: 0x00ff88 })
  );
  scanRing.rotation.x = Math.PI / 2;
  scanRing.position.set(-8, 0.14, -18);
  markBloom(scanRing);
  scene.add(scanPad, scanRing);

  taskSpots.push({
    id: "task-medbay",
    taskKey: "medbay-scan",
    pos: { x: -8, z: -18 },
    name: "MedBay Biometric Scan",
    sector: "MedBay",
    icon: "🔬",
  });

  createVent(-18, -23);

  // Portal to Neural Academy (Learn mode)
  sectorPortals.push({
    key: "learn",
    name: "Neural Academy",
    desc: "AI Vulnerability Database",
    emoji: "🧠",
    color: 0x38bdf8,
    padPos: new THREE.Vector3(-8, 0.05, -13),
  });

  // =========================================================================
  // 12. UPPER ENGINE & LOWER ENGINE (West Wing, -36, -24 and -36, 24)
  // =========================================================================
  // Upper Engine
  createRoomFloor(-36, -24, 18, 16, 0x2e2720);
  colliders.push(aabb(-36, 2.0, -32.2, 18, 4.0, 0.5)); // North
  colliders.push(aabb(-36, 2.0, -15.8, 18, 4.0, 0.5)); // South
  colliders.push(aabb(-45.2, 2.0, -24, 0.5, 4.0, 16)); // West
  colliders.push(aabb(-26.8, 2.0, -24, 0.5, 4.0, 16)); // East

  // Massive Turbine Assembly & Pipes
  await place("container-tall", -42, 0, -24, 0, 1.4);
  await place("pipe", -40, 0, -28, Math.PI / 2);
  await place("pipe-bend", -40, 0, -20, 0);
  colliders.push(aabb(-42, 1.8, -24, 2.0, 3.6, 2.0));

  await place("table-display", -32, 0, -24, -Math.PI / 2);
  colliders.push(aabb(-32, 0.5, -24, 1.2, 1.0, 1.4));

  taskSpots.push({
    id: "task-upper-engine",
    taskKey: "engine-align",
    pos: { x: -33.5, z: -24 },
    name: "Align Upper Engine Output",
    sector: "Upper Engine",
    icon: "🚀",
  });
  createVent(-43, -30);

  // Lower Engine
  createRoomFloor(-36, 24, 18, 16, 0x2e2720);
  colliders.push(aabb(-36, 2.0, 15.8, 18, 4.0, 0.5)); // North
  colliders.push(aabb(-36, 2.0, 32.2, 18, 4.0, 0.5)); // South
  colliders.push(aabb(-45.2, 2.0, 24, 0.5, 4.0, 16)); // West
  colliders.push(aabb(-26.8, 2.0, 24, 0.5, 4.0, 16)); // East

  await place("container-tall", -42, 0, 24, 0, 1.4);
  await place("pipe", -40, 0, 20, Math.PI / 2);
  await place("pipe-bend", -40, 0, 28, 0);
  colliders.push(aabb(-42, 1.8, 24, 2.0, 3.6, 2.0));

  await place("table-display", -32, 0, 24, -Math.PI / 2);
  colliders.push(aabb(-32, 0.5, 24, 1.2, 1.0, 1.4));

  taskSpots.push({
    id: "task-lower-engine",
    taskKey: "engine-align",
    pos: { x: -33.5, z: 24 },
    name: "Align Lower Engine Output",
    sector: "Lower Engine",
    icon: "🚀",
  });
  createVent(-43, 30);

  // =========================================================================
  // 13. REACTOR (Far-West, -54, 0) — Quantum Core
  // =========================================================================
  createRoomFloor(-54, 0, 16, 24, 0x2a1a44); // Deep purple/indigo reactor floor

  colliders.push(aabb(-62.2, 2.0, 0, 0.5, 4.0, 24)); // West back wall
  colliders.push(aabb(-54, 2.0, -12.2, 16, 4.0, 0.5)); // North wall
  colliders.push(aabb(-54, 2.0, 12.2, 16, 4.0, 0.5)); // South wall

  // Central Quantum Reactor Core
  const reactorGroup = new THREE.Group();
  const rBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 0.8, 24), metalMat(0x192a42));
  rBase.position.y = 0.4;
  const corePlasma = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 3.2, 20), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.85 }));
  corePlasma.position.y = 2.4;
  markBloom(corePlasma);
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.08, 10, 32), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
  ring1.position.y = 2.4;
  markBloom(ring1);
  reactorGroup.add(rBase, corePlasma, ring1);
  reactorGroup.position.set(-54, 0, 0);
  scene.add(reactorGroup);
  colliders.push(aabb(-54, 1.5, 0, 4.8, 3.0, 4.8));

  // Manifolds Control Station
  await place("table-display", -48, 0, 0, Math.PI / 2);
  colliders.push(aabb(-48, 0.5, 0, 1.2, 1.0, 1.4));

  taskSpots.push({
    id: "task-reactor",
    taskKey: "reactor-manifolds",
    pos: { x: -49.5, z: 0 },
    name: "Unlock Reactor Manifolds",
    sector: "Reactor",
    icon: "⚛️",
  });

  createVent(-60, -9);
  createVent(-60, 9);

  // Portal to Memory Buffer Lab
  sectorPortals.push({
    key: "puzzles",
    name: "Memory Buffer",
    desc: "Binary Exploits & Logic",
    emoji: "🧩",
    color: 0x00ff88,
    padPos: new THREE.Vector3(-54, 0.05, -7),
  });

  // =========================================================================
  // 14. COMPLETE HALLWAY NETWORK (The Skeld Corridors)
  // =========================================================================
  // Hallway 1: Cafeteria -> Storage (Main Central Vertical Hall)
  createHallway(0, -6, 5.0, 16.0); // Z from -14 to 2
  createHallway(0, 8, 5.0, 12.0); // Z from 2 to 14

  // Hallway 2: Cafeteria -> Weapons (East Hall)
  createHallway(20, -30, 14.0, 4.5); // X from 13 to 27

  // Hallway 3: Weapons -> Navigation (North-East Loop Hall)
  createHallway(36, -14, 4.5, 12.0); // South of Weapons
  createHallway(44, -6, 12.0, 4.5); // Towards Navigation

  // Hallway 4: Navigation -> Shields (South-East Loop Hall)
  createHallway(44, 6, 12.0, 4.5); // From Navigation
  createHallway(36, 12, 4.5, 8.0); // Into Shields

  // Hallway 5: Shields -> Storage (Bottom East Hall)
  createHallway(20, 20, 14.0, 4.5); // X from 13 to 27

  // Hallway 6: Storage -> Communications (South Hall)
  createHallway(18, 30, 4.5, 8.0);

  // Hallway 7: Cafeteria -> Upper Engine (West Hall)
  createHallway(-18, -30, 14.0, 4.5); // Across to MedBay
  createHallway(-26, -26, 8.0, 4.5); // Into Upper Engine

  // Hallway 8: Storage -> Electrical & Lower Engine (Bottom West Hall)
  createHallway(-20, 20, 14.0, 4.5);
  createHallway(-26, 24, 8.0, 4.5);

  // Hallway 9: Reactor Left Loop (Upper Engine -> Reactor -> Lower Engine)
  createHallway(-48, -24, 6.0, 4.5); // West of Upper Engine
  createHallway(-48, 24, 6.0, 4.5); // West of Lower Engine
  createHallway(-48, 0, 4.5, 36.0); // Vertical Reactor Corridor (Z: -18 to 18)

  // Hallway 10: Security Access Corridor
  createHallway(-18, -2, 6.0, 4.0); // Into Security from East
  createHallway(-26, -2, 6.0, 4.0); // Into Reactor Corridor from West

  // Hallway 11: Admin Access Corridor
  createHallway(6, 4, 4.0, 4.5); // Central Hall into Admin

  // Hallway 12: Electrical Access Corridor
  createHallway(-5, 12, 4.0, 4.5);

  // Airlock laser gates at key thresholds
  await place("gate-lasers", 0, 0, -20, 0); // Cafeteria south gate
  await place("gate-lasers", 0, 0, 14, Math.PI); // Storage north gate
  await place("gate-lasers", 14, 0, -30, Math.PI / 2); // Weapons west gate
  await place("gate-lasers", -14, 0, -30, -Math.PI / 2); // Cafeteria west gate
  await place("gate-lasers", -48, 0, -12, 0); // Reactor north gate
  await place("gate-lasers", -48, 0, 12, Math.PI); // Reactor south gate

  // Alarm light animator
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
