// The 3D Explore World - AI Laboratory & Datacenter Hub for ExploitGym.
// A high-tech AI research facility featuring server racks, holographic displays,
// a central Quantum Core, and autonomous 3D AI Agents patrolling the grounds.
// Walk to each sector terminal / portal to enter training activities.

import * as THREE from "three";
import { createPlayer, updatePlayer, respawn } from "./player.js";
import { createAvatar } from "./avatar.js";
import { createControls, isTouchDevice } from "./controls.js";
import { createFollowCamera, intentToWorld } from "./camera.js";
import { createEmotes } from "./emotes.js";
import { createInteractions } from "./interactions.js";
import { toonMat, roundedGeo, markBloom } from "./gfx.js";
import { createPostFX } from "./postfx.js";
import { sfx } from "./audio.js";
import { createNet, MULTIPLAYER_AVAILABLE } from "./net.js";
import { createVoice } from "./voice.js";
import { createRemotePlayers } from "./remotePlayers.js";
import { colorForId } from "./avatar.js";
import * as profile from "./profile.js";

const HIGH_END = !isTouchDevice() && window.devicePixelRatio < 2.5 && (navigator.hardwareConcurrency || 4) > 4;
const LOW = isTouchDevice() && window.devicePixelRatio >= 2;
const BASE = import.meta.env.BASE_URL;

// Lab Divisions / Sectors (Portal Terminals)
const ZONES = [
  { key: "obby", name: "Exploit Arena", emoji: "⚔️", desc: "Red Team Sandbox", color: 0x00f5ff },
  { key: "arcade", name: "CTF Terminal", emoji: "⚡", desc: "Speed Exploits", color: 0xff0055 },
  { key: "puzzles", name: "Memory Buffer", emoji: "🧩", desc: "Logic & Binary", color: 0x00ff88 },
  { key: "learn", name: "Neural Academy", emoji: "🧠", desc: "Vulnerability DB", color: 0x38bdf8 },
  { key: "coinrush", name: "Token Rush", emoji: "💾", desc: "Compute Farm", color: 0xf59e0b },
  { key: "maze", name: "Latent Maze", emoji: "🌀", desc: "Vector Space", color: 0xa855f7 },
  { key: "closet", name: "Chassis Bay", emoji: "🦾", desc: "Agent Skins", color: 0xec4899 },
];

// Autonomous AI Agents patrolling the facility
const AGENTS_DATA = [
  { name: "Agent-01", role: "Recon Probe", color: 0x00f5ff, quote: "Port scan complete. All firewall endpoints monitored." },
  { name: "Agent-02", role: "Neural Daemon", color: 0xa855f7, quote: "Gradient descent converged. 100M parameters aligned." },
  { name: "Agent-03", role: "Sec Auditor", color: 0x00ff88, quote: "Security check: SQLi and command injection filters active." },
  { name: "Agent-04", role: "Zero-Day", color: 0xff3366, quote: "Simulated sandbox breach attempt in Sector 4!" },
  { name: "Agent-05", role: "Prompt Guard", color: 0xf59e0b, quote: "Jailbreak resistance verified at 99.8% precision." },
  { name: "Agent-06", role: "Compute Bot", color: 0x38bdf8, quote: "GPU cluster running at 400 TFLOPs. Ready for exploits." },
];

export function startExplore(onEnter, opts = {}) {
  const mp = opts.multiplayer || null;
  const root = document.getElementById("game-root");
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050a16, 45, 150);
  scene.add(makeSky());

  // High-tech Cyberpunk Lighting
  scene.add(new THREE.HemisphereLight(0x00f5ff, 0x1e1035, 0.75));
  scene.add(new THREE.AmbientLight(0x0f1c3f, 0.35));
  const sun = new THREE.DirectionalLight(0x67e8f9, 1.3);
  sun.castShadow = true;
  sun.position.set(20, 36, 14);
  sun.shadow.mapSize.set(HIGH_END ? 2048 : 1024, HIGH_END ? 2048 : 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -40;
  sun.shadow.camera.right = sun.shadow.camera.top = 40;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);

  // ---------- World Geometry & Colliders ----------
  const colliders = [];
  const aabb = (cx, cy, cz, sx, sy, sz) => ({
    min: { x: cx - sx / 2, y: cy - sy / 2, z: cz - sz / 2 },
    max: { x: cx + sx / 2, y: cy + sy / 2, z: cz + sz / 2 },
  });

  const R = 30; // Lab campus radius

  // Main high-tech laboratory floor
  const ground = new THREE.Mesh(new THREE.CircleGeometry(R + 4, 48), toonMat(0x080e1c));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  colliders.push(aabb(0, -0.5, 0, (R + 4) * 2, 1, (R + 4) * 2));

  // Central Hub Plaza (Metallic Grid Platform)
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(11.5, 40), toonMat(0x111c33));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.02;
  plaza.receiveShadow = true;
  scene.add(plaza);

  // Concentric Glowing Circuit Rings on floor
  const floorRing1 = new THREE.Mesh(new THREE.TorusGeometry(11.4, 0.1, 8, 48), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
  floorRing1.rotation.x = Math.PI / 2; floorRing1.position.y = 0.04; markBloom(floorRing1);
  const floorRing2 = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.08, 8, 40), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
  floorRing2.rotation.x = Math.PI / 2; floorRing2.position.y = 0.04; markBloom(floorRing2);
  const floorRing3 = new THREE.Mesh(new THREE.TorusGeometry(17.8, 0.08, 8, 48), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 }));
  floorRing3.rotation.x = Math.PI / 2; floorRing3.position.y = 0.03; markBloom(floorRing3);
  scene.add(floorRing1, floorRing2, floorRing3);

  // Outer Perimeter Laser Forcefield
  const laserPerimeter = new THREE.Mesh(new THREE.TorusGeometry(R + 1, 0.15, 12, 60), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
  laserPerimeter.rotation.x = Math.PI / 2; laserPerimeter.position.y = 0.8; markBloom(laserPerimeter);
  scene.add(laserPerimeter);

  // Perimeter security beacons
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const px = Math.cos(a) * (R + 1), pz = Math.sin(a) * (R + 1);
    const pPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.6, 8), toonMat(0x1e293b));
    pPost.position.set(px, 0.8, pz);
    const pCap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
    pCap.position.set(px, 1.65, pz); markBloom(pCap);
    scene.add(pPost, pCap);
  }

  // ---------- Central AI Quantum Reactor Core (Replaces fountain) ----------
  const reactor = new THREE.Group();
  const rBase = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 0.8, 24), toonMat(0x131d33));
  rBase.position.y = 0.4; rBase.castShadow = true; rBase.receiveShadow = true;
  reactor.add(rBase);

  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.14, 10, 32), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
  innerRing.rotation.x = Math.PI / 2; innerRing.position.y = 0.82; markBloom(innerRing);
  reactor.add(innerRing);

  // Pulsating Plasma Core Cylinder
  const coreMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.8, 20), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.85 }));
  coreMesh.position.y = 2.2; markBloom(coreMesh);
  reactor.add(coreMesh);

  // Inner Quantum Beam
  const beamMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3.4, 16), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
  beamMesh.position.y = 2.2; markBloom(beamMesh);
  reactor.add(beamMesh);

  // Floating Orbital Containment Rings
  const orbit1 = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.08, 10, 32), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
  orbit1.position.y = 2.2; markBloom(orbit1);
  const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.08, 10, 32), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  orbit2.position.y = 2.2; orbit2.rotation.x = 0.6; markBloom(orbit2);
  reactor.add(orbit1, orbit2);

  scene.add(reactor);
  colliders.push(aabb(0, 1.5, 0, 5.8, 3, 5.8));

  // ---------- Datacenter Server Racks (Replaces trees) ----------
  function createServerRack(x, z, rot = 0) {
    const g = new THREE.Group();
    const rack = new THREE.Mesh(roundedGeo(1.6, 3.8, 1.0, 0.08, 1), toonMat(0x0f172a));
    rack.position.y = 1.9; rack.castShadow = true; g.add(rack);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 3.4), new THREE.MeshBasicMaterial({ color: 0x072b42, transparent: true, opacity: 0.8 }));
    glass.position.set(0, 1.9, 0.52); g.add(glass);

    const ledCanvas = document.createElement("canvas");
    ledCanvas.width = 64; ledCanvas.height = 256;
    const lctx = ledCanvas.getContext("2d");
    lctx.fillStyle = "#020617"; lctx.fillRect(0, 0, 64, 256);
    for (let row = 0; row < 16; row++) {
      const y = 16 + row * 14;
      lctx.fillStyle = (row % 3 === 0) ? "#00ff88" : (row % 3 === 1) ? "#00f5ff" : "#ffb700";
      lctx.fillRect(8, y, 10, 4);
      lctx.fillStyle = (row % 2 === 0) ? "#00ff88" : "#38bdf8";
      lctx.fillRect(26, y, 10, 4);
      lctx.fillStyle = (row % 5 === 0) ? "#ff3366" : "#00ff88";
      lctx.fillRect(44, y, 10, 4);
    }
    const ledTex = new THREE.CanvasTexture(ledCanvas);
    ledTex.colorSpace = THREE.SRGBColorSpace;
    const ledMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 3.2), new THREE.MeshBasicMaterial({ map: ledTex }));
    ledMesh.position.set(0, 1.9, 0.53); markBloom(ledMesh); g.add(ledMesh);

    g.position.set(x, 0, z); g.rotation.y = rot;
    scene.add(g);
    colliders.push(aabb(x, 1.9, z, 1.6, 3.8, 1.0));
  }

  // Scatter server clusters around the outer plaza
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.25;
    const rr = 22 + (i % 2) * 3;
    createServerRack(Math.cos(a) * rr, Math.sin(a) * rr, -a + Math.PI / 2);
  }

  // ---------- Holographic Display Screens (Replaces pool & playground) ----------
  function createHoloScreen(x, z, rot, title, lines) {
    const g = new THREE.Group();
    const scCanvas = document.createElement("canvas");
    scCanvas.width = 512; scCanvas.height = 256;
    const ctx = scCanvas.getContext("2d");

    ctx.fillStyle = "rgba(4, 10, 24, 0.95)";
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#00f5ff";
    ctx.font = "bold 22px 'JetBrains Mono', monospace";
    ctx.fillText(`// AI KERNEL [${title}]`, 24, 38);

    ctx.strokeStyle = "rgba(0, 245, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 52, 472, 184);

    ctx.font = "16px 'JetBrains Mono', monospace";
    lines.forEach((l, idx) => {
      ctx.fillStyle = l.color || "#e2e8f0";
      ctx.fillText(l.text, 36, 86 + idx * 30);
    });

    const tex = new THREE.CanvasTexture(scCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const scrMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.6), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    scrMesh.position.y = 3.2; markBloom(scrMesh); g.add(scrMesh);

    const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.0, 8), toonMat(0x1e293b));
    post1.position.set(-1.8, 1.0, 0); post1.castShadow = true;
    const post2 = post1.clone(); post2.position.set(1.8, 1.0, 0);
    g.add(post1, post2);

    g.position.set(x, 0, z); g.rotation.y = rot;
    scene.add(g);
    colliders.push(aabb(x, 2, z, 5.2, 3.8, 0.8));
    return g;
  }

  // Two massive AI dashboard screens in the campus
  createHoloScreen(15, 15, -Math.PI / 4, "MODEL_METRICS", [
    { text: "EPOCH: 1,420 // LOSS: 0.0012", color: "#00ff88" },
    { text: "INFERENCE SPEED: 142 tokens/sec", color: "#38bdf8" },
    { text: "ACTIVE NEURAL WEIGHTS: 70B", color: "#e2e8f0" },
    { text: "SANDBOX AGENTS: 6 ONLINE", color: "#00f5ff" },
    { text: "EXPLOIT SIMULATION: READY", color: "#ffb700" },
  ]);

  createHoloScreen(-15, 15, Math.PI / 4, "THREAT_INTELLIGENCE", [
    { text: "FIREWALL INTEGRITY: 99.4%", color: "#00ff88" },
    { text: "PORT 8080: ACTIVE RECON", color: "#f59e0b" },
    { text: "BUFFER OVERFLOW SIM: READY", color: "#ff3366" },
    { text: "ZERO-DAY EMULATION: ARMED", color: "#38bdf8" },
    { text: "SYSTEM STATUS: SECURE", color: "#00f5ff" },
  ]);

  // ---------- Workstation Terminals (Replaces benches) ----------
  const workstationSpots = [];
  function createWorkstation(x, z, rot) {
    const g = new THREE.Group();
    const desk = new THREE.Mesh(roundedGeo(2.2, 0.15, 0.9, 0.06, 1), toonMat(0x1e293b));
    desk.position.y = 0.9; desk.castShadow = true; g.add(desk);

    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), toonMat(0x0f172a));
    leg1.position.set(-0.9, 0.45, 0); const leg2 = leg1.clone(); leg2.position.set(0.9, 0.45, 0);
    g.add(leg1, leg2);

    const monitor = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
    monitor.position.set(0, 1.35, 0.1); markBloom(monitor); g.add(monitor);

    g.position.set(x, 0, z); g.rotation.y = rot;
    scene.add(g);
    workstationSpots.push({ x, z });
  }

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    createWorkstation(Math.cos(a) * 8.5, Math.sin(a) * 8.5, -a);
  }

  // ---------- Floating Ambient Data Nodes (Replaces yellow stars) ----------
  const dataNodeGeo = new THREE.IcosahedronGeometry(0.35, 0);
  const dataNodes = [];
  const nodeColors = [0x00f5ff, 0x00ff88, 0x38bdf8, 0xa855f7];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, r = 7.2;
    const nodeMat = new THREE.MeshBasicMaterial({ color: nodeColors[i % nodeColors.length] });
    const s = new THREE.Mesh(dataNodeGeo, nodeMat);
    s.position.set(Math.cos(a) * r, 4 + (i % 2), Math.sin(a) * r);
    markBloom(s); s.userData.ph = i;
    scene.add(s); dataNodes.push(s);
  }

  // ---------- 3D Autonomous AI Agents (Replaces animal cutouts) ----------
  const npcs = [];
  AGENTS_DATA.forEach((agent, i) => {
    const g = new THREE.Group();

    // Drone Capsule Body
    const bodyGeo = new THREE.SphereGeometry(0.7, 16, 16);
    bodyGeo.scale(1, 0.85, 1);
    const bodyMat = toonMat(0x131d33);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    g.add(body);

    // Glowing Optical Visor
    const visorGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16);
    const visorMat = new THREE.MeshBasicMaterial({ color: agent.color });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.x = Math.PI / 2; visor.position.set(0, 0.05, 0.6);
    markBloom(visor);
    g.add(visor);

    // Revolving Orbital Ring
    const haloGeo = new THREE.TorusGeometry(0.95, 0.04, 8, 24);
    const haloMat = new THREE.MeshBasicMaterial({ color: agent.color });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    markBloom(halo);
    g.add(halo);

    // Bottom Thruster Glow
    const thrusterGeo = new THREE.ConeGeometry(0.25, 0.5, 10);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: agent.color, transparent: true, opacity: 0.7 });
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster.rotation.x = Math.PI; thruster.position.y = -0.7;
    markBloom(thruster);
    g.add(thruster);

    // Floating Nametag Sprite
    const tagSprite = makeAgentTag(agent.name, agent.role, agent.color);
    tagSprite.position.y = 1.35;
    g.add(tagSprite);

    const a = (i / AGENTS_DATA.length) * Math.PI * 2;
    g.position.set(Math.cos(a) * 8.5, 1.8, Math.sin(a) * 8.5);
    scene.add(g);

    npcs.push({
      group: g,
      halo,
      visor,
      agent,
      tx: g.position.x,
      tz: g.position.z,
      ph: i,
      speed: 1.1 + (i % 3) * 0.25,
      tagSprite,
    });
  });

  // ---------- Sector Terminals = Portals ----------
  const portals = [];
  const ringR = 18;
  ZONES.forEach((z, i) => {
    const ang = (i / ZONES.length) * Math.PI * 2;
    const bx = Math.cos(ang) * ringR;
    const bz = Math.sin(ang) * ringR;
    const facing = Math.atan2(-bx, -bz);

    const group = new THREE.Group();
    group.position.set(bx, 0, bz);
    group.rotation.y = facing;
    scene.add(group);

    // High-tech terminal pedestal
    const base = new THREE.Mesh(roundedGeo(6, 0.6, 2.5, 0.2, 2), toonMat(0x0f172a));
    base.position.y = 0.3; base.castShadow = true; base.receiveShadow = true;
    group.add(base);
    colliders.push(aabb(bx, 1.5, bz, 5.5, 3, 2));

    // Gateway pillar arches
    const pLeft = new THREE.Mesh(roundedGeo(0.5, 4.2, 0.5, 0.08, 1), toonMat(0x1e293b));
    pLeft.position.set(-2.5, 2.1, 0); pLeft.castShadow = true;
    const pRight = pLeft.clone(); pRight.position.x = 2.5;
    const pTop = new THREE.Mesh(roundedGeo(5.5, 0.5, 0.6, 0.08, 1), toonMat(0x1e293b));
    pTop.position.set(0, 4.2, 0);
    group.add(pLeft, pRight, pTop);

    // Sector Holographic Gate Frame
    const hFrame = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.8), new THREE.MeshBasicMaterial({ color: z.color, transparent: true, opacity: 0.18, side: THREE.DoubleSide }));
    hFrame.position.set(0, 2.1, 0);
    markBloom(hFrame);
    group.add(hFrame);

    // Floating sign with emoji + sector name
    const sign = makeSign(z.emoji + " " + z.name, z.desc);
    sign.position.set(0, 5.2, 0);
    group.add(sign);

    // Glowing portal pad on floor
    const padPos = new THREE.Vector3(bx * 0.74, 0.05, bz * 0.74);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.12, 24), new THREE.MeshBasicMaterial({ color: z.color }));
    pad.position.copy(padPos); pad.position.y = 0.06;
    markBloom(pad); scene.add(pad);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(2, 0.12, 10, 28), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    ring.rotation.x = Math.PI / 2; ring.position.copy(padPos); ring.position.y = 0.14;
    markBloom(ring); scene.add(ring);

    portals.push({ ...z, padPos, ring, sign });
  });

  if (import.meta.env.DEV) window.__bbPortals = portals.map((p) => ({ key: p.key, x: p.padPos.x, z: p.padPos.z }));

  // ---------- Player + Camera + Controls ----------
  const player = createPlayer({ x: 0, y: 1.5, z: -7 });
  player.facing = 0;
  if (import.meta.env.DEV) window.__bbPlayer = player;
  const avatar = createAvatar(profile.getColor(), "", profile.getHat());
  scene.add(avatar.root);
  const camera = createFollowCamera(window.innerWidth / window.innerHeight);
  camera.snap(player.pos);
  const controls = createControls();
  const emotes = createEmotes({
    onPlay: (key) => {
      if (net) net.sendState({ x: player.pos.x, y: player.pos.y, z: player.pos.z, ry: player.facing, anim: key });
    },
  });

  const postfx = createPostFX(renderer, scene, camera.cam, { low: LOW });

  // ---------- Multiplayer (Roaming Hub with Teammates) ----------
  let net = null, voice = null, remote = null, myId = null;
  if (mp && MULTIPLAYER_AVAILABLE) setupMultiplayer();
  async function setupMultiplayer() {
    net = createNet();
    myId = crypto.randomUUID();
    const me = { id: myId, name: mp.name, color: colorForId(myId) };
    avatar.setBodyColor(me.color);
    remote = createRemotePlayers();
    scene.add(remote.group);
    net.on("roster", (players) => remote.syncRoster(players.filter((p) => p.id !== myId)));
    net.on("state", (packet) => remote.applyState(packet));
    net.on("msg", onSocialMessage);
    const ok = await net.join(mp.code, me);
    if (!ok) return;
    voice = createVoice(net, {});
    voice.wire();
    const started = await voice.start();
    const bar = document.getElementById("explore-bar");
    bar.classList.remove("hidden");
    bar.innerHTML = `<button class="icon-btn ${voice && started ? "muted" : ""}" id="ex-mute">${started ? "🔇" : "🚫"}</button><button class="btn" id="ex-leave">🚪 Leave</button><span class="ex-tag">🛡️ Roaming AI Lab with Teammates!</span>`;
    if (started) {
      bar.querySelector("#ex-mute").addEventListener("click", () => {
        const m = voice.toggleMute();
        bar.querySelector("#ex-mute").textContent = m ? "🔇" : "🎤";
        bar.querySelector("#ex-mute").classList.toggle("muted", m);
        bar.querySelector("#ex-mute").classList.toggle("live", !m);
      });
    }
    bar.querySelector("#ex-leave").addEventListener("click", () => opts.onExit && opts.onExit());
  }

  // ---------- Enter Portal Prompt (DOM) ----------
  const prompt = document.getElementById("explore-prompt");
  let activePortal = null;
  function showPrompt(p) {
    activePortal = p;
    prompt.textContent = `▶ Enter ${p.name}`;
    prompt.classList.remove("hidden");
  }
  function hidePrompt() { activePortal = null; prompt.classList.add("hidden"); }
  function enter() {
    if (!activePortal) return;
    sfx.gate();
    onEnter(activePortal.key);
  }
  const onPromptClick = () => enter();
  prompt.addEventListener("click", onPromptClick);
  const onKey = (e) => { if (e.key === "Enter" && activePortal) enter(); };
  window.addEventListener("keydown", onKey);

  // ---------- Data Particle Bursts ----------
  const texCache = new Map();
  function emojiTex(ch) {
    if (texCache.has(ch)) return texCache.get(ch);
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const ctx = c.getContext("2d");
    ctx.font = "44px 'JetBrains Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(ch, 32, 36);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    texCache.set(ch, tex); return tex;
  }
  const bursts = [];
  function spawnBurst(pos, ch, n = 6, spread = 0.6, rise = 2.2) {
    const tex = emojiTex(ch);
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      s.position.set(pos.x + (Math.random() - 0.5) * spread, pos.y + Math.random() * 0.4, pos.z + (Math.random() - 0.5) * spread);
      s.scale.setScalar(0.6 + Math.random() * 0.3);
      scene.add(s);
      bursts.push({ s, vx: (Math.random() - 0.5) * 1.2, vy: rise + Math.random() * 1.2, vz: (Math.random() - 0.5) * 1.2, life: 0, max: 0.9 + Math.random() * 0.4 });
    }
  }
  function updateBursts(dt) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i]; b.life += dt;
      if (b.life >= b.max) { scene.remove(b.s); b.s.material.dispose(); bursts.splice(i, 1); continue; }
      b.s.position.x += b.vx * dt; b.s.position.y += b.vy * dt; b.s.position.z += b.vz * dt;
      b.s.material.opacity = 1 - b.life / b.max;
    }
  }

  // ---------- World + AI Agent Interactions ----------
  const interactions = createInteractions();
  let syncCooldown = 0;

  function showAgentTransmission(name, quote) {
    const flash = document.getElementById("flash");
    if (!flash) return;
    flash.innerHTML = `<span style="color:#00f5ff;font-family:'Orbitron',sans-serif;font-size:0.75em;letter-spacing:1px;">[TRANSMISSION: ${name}]</span><br/><span style="font-size:0.95em;color:#f1f5f9;font-family:'JetBrains Mono',monospace;">"${quote}"</span>`;
    flash.classList.add("show");
    clearTimeout(flash._timer);
    flash._timer = setTimeout(() => flash.classList.remove("show"), 2800);
  }

  function syncCore() {
    sfx.sparkle();
    spawnBurst({ x: 0, y: 2.4, z: 0 }, "⚡", 8, 1.0, 2.4);
    if (syncCooldown <= 0) {
      profile.addCoins(1);
      spawnBurst({ x: 0, y: 1.6, z: 0 }, "💾", 1, 0.2, 1.6);
      syncCooldown = 4;
      showAgentTransmission("QUANTUM CORE", "Data shards synchronized. +1 Compute Credit!");
    }
  }

  function queryAgent(spot) {
    sfx.sparkle();
    const npc = spot.npc;
    if (npc) {
      npc.group.position.y += 0.35;
      spawnBurst({ x: spot.pos.x, y: 2.2, z: spot.pos.z }, "💾", 5, 0.6, 2.0);
      showAgentTransmission(npc.agent.name, npc.agent.quote);
    }
  }

  function accessTerminal() {
    sfx.gate();
    emotes.play("sit");
    showAgentTransmission("TERMINAL", "Workstation linked to neural compute cluster.");
  }

  function highfive(spot) {
    emotes.play("wave");
    sfx.highfive();
    const mid = { x: (player.pos.x + spot.pos.x) / 2, y: 1.8, z: (player.pos.z + spot.pos.z) / 2 };
    spawnBurst(mid, "⚡", 5, 0.6, 2.0);
    if (net) net.sendMsg("social", { kind: "highfive", to: spot.id });
  }

  function onSocialMessage(payload) {
    if (!payload || payload.kind !== "highfive") return;
    if (payload.to && payload.to !== myId) return;
    if (remote) remote.playEmote(payload.from, "wave");
    sfx.highfive();
    const peer = remote && remote.list().find((p) => p.id === payload.from);
    if (peer) spawnBurst({ x: (player.pos.x + peer.pos.x) / 2, y: 1.8, z: (player.pos.z + peer.pos.z) / 2 }, "⚡", 5, 0.6, 2.0);
  }

  // Static interaction spots: Quantum Reactor, Workstation Desks
  interactions.setSpots([
    { key: "core", pos: { x: 0, z: 0 }, range: 3.8, icon: "⚡", label: "Sync Core", act: syncCore },
    ...workstationSpots.map((ws, i) => ({
      key: `workstation${i}`, pos: ws, range: 2.5, icon: "💻", label: "Access Terminal", act: accessTerminal,
    })),
  ]);

  // Dynamic interaction spots: Wandering 3D AI Agents + Nearby Teammates
  interactions.setDynamic(() => {
    const out = npcs.map((n, i) => ({
      key: `agent${i}`,
      pos: { x: n.group.position.x, z: n.group.position.z },
      range: 2.6,
      icon: "🤖",
      label: `Query ${n.agent.name}`,
      npc: n,
      act: queryAgent,
    }));
    if (remote) for (const p of remote.list()) out.push({ key: `hi-${p.id}`, pos: { x: p.pos.x, z: p.pos.z }, range: 3.0, icon: "⚡", label: "Sync Teammate", id: p.id, act: highfive });
    return out;
  });

  // ---------- Game Loop ----------
  let alive = true, last = performance.now(), elapsed = 0, rafId = 0;

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now; elapsed += dt;
    if (syncCooldown > 0) syncCooldown -= dt;

    const inRaw = controls.getInput();
    const look = controls.getLook();
    if (look.dx || look.dy) camera.rotate(look.dx, look.dy);
    const dir = intentToWorld(inRaw.fwd, inRaw.right, camera.state.yaw);
    const moving = Math.hypot(inRaw.fwd, inRaw.right) > 0.05;
    emotes.tick(dt, moving);

    updatePlayer(player, dt, { moveX: dir.x, moveZ: dir.z, jump: inRaw.jump }, colliders);

    // Keep inside campus perimeter
    const d = Math.hypot(player.pos.x, player.pos.z);
    if (d > R) { player.pos.x *= R / d; player.pos.z *= R / d; }
    if (player.pos.y < -10) respawn(player, { x: 0, y: 1.5, z: -7 });

    // Nearest sector portal detection
    if (!mp) {
      let near = null, nd = 3.2;
      for (const p of portals) {
        const pd = Math.hypot(player.pos.x - p.padPos.x, player.pos.z - p.padPos.z);
        if (pd < nd) { nd = pd; near = p; }
      }
      if (near && near !== activePortal) showPrompt(near);
      else if (!near && activePortal) hidePrompt();
    }

    interactions.update(player.pos);
    updateBursts(dt);

    // Animate local avatar & follow camera
    avatar.root.position.set(player.pos.x, player.pos.y + 0.15, player.pos.z);
    avatar.root.rotation.y = player.facing;
    avatar.update(emotes.current() || player.anim, dt, camera.cam);
    camera.follow(player.pos, dt, { facing: player.facing, moving });
    sun.position.set(player.pos.x + 18, 36, player.pos.z + 12);
    sun.target.position.set(player.pos.x, 0, player.pos.z);

    // Animate Central Quantum Reactor Core
    orbit1.rotation.y += dt * 0.9;
    orbit2.rotation.z += dt * 0.7;
    orbit2.rotation.x += dt * 0.5;
    coreMesh.scale.set(1 + Math.sin(elapsed * 3) * 0.05, 1, 1 + Math.sin(elapsed * 3) * 0.05);

    // Animate sector portals & signs
    for (const p of portals) {
      p.ring.rotation.z += dt * 1.5;
      p.ring.scale.setScalar(1 + Math.sin(elapsed * 3) * 0.06);
      p.sign.quaternion.copy(camera.cam.quaternion);
    }

    // Animate ambient data nodes
    for (const s of dataNodes) {
      s.rotation.y += dt * 1.5;
      s.position.y = 4 + (s.userData.ph % 2) + Math.sin(elapsed * 1.5 + s.userData.ph) * 0.35;
    }

    // Animate Autonomous AI Agents (Floating, bobbing, revolving halo)
    for (const n of npcs) {
      const dx = n.tx - n.group.position.x, dz = n.tz - n.group.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.6) {
        const a = Math.random() * Math.PI * 2, r = 5 + Math.random() * 12;
        n.tx = Math.cos(a) * r; n.tz = Math.sin(a) * r;
      } else {
        n.group.position.x += (dx / dist) * n.speed * dt;
        n.group.position.z += (dz / dist) * n.speed * dt;
      }
      n.group.position.y = 1.8 + Math.sin(elapsed * 2.2 + n.ph) * 0.25;
      n.halo.rotation.z += dt * 1.8;
      n.group.rotation.y = Math.sin(elapsed * 0.6 + n.ph) * 0.5;
      n.tagSprite.quaternion.copy(camera.cam.quaternion);
    }

    if (net) {
      net.sendState({ x: player.pos.x, y: player.pos.y, z: player.pos.z, ry: player.facing, anim: emotes.current() || player.anim });
      remote.update(dt, camera.cam);
    }

    postfx.render();
    if (alive) rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  const onResize = () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.cam.aspect = innerWidth / innerHeight;
    camera.cam.updateProjectionMatrix();
    postfx.setSize(innerWidth, innerHeight);
  };
  window.addEventListener("resize", onResize);

  function destroy() {
    alive = false;
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKey);
    prompt.removeEventListener("click", onPromptClick);
    prompt.classList.add("hidden");
    controls.destroy?.();
    emotes.destroy?.();
    interactions.destroy?.();
    if (remote) remote.destroy();
    if (voice) voice.stop();
    if (net) net.leave();
    document.getElementById("explore-bar")?.classList.add("hidden");
    renderer.dispose();
    if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
  }
  return { destroy };
}

// Generates high-tech floating holographic signs for sectors
function makeSign(title, desc = "") {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 110;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(8, 16, 34, 0.92)";
  roundRect(ctx, 6, 8, 500, 94, 18); ctx.fill();
  ctx.strokeStyle = "rgba(0, 245, 255, 0.55)";
  ctx.lineWidth = 3;
  roundRect(ctx, 6, 8, 500, 94, 18); ctx.stroke();

  ctx.fillStyle = "#00f5ff";
  ctx.font = "bold 34px 'Orbitron', monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(title, 256, 44);

  if (desc) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 20px 'JetBrains Mono', monospace";
    ctx.fillText(desc, 256, 80);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(4.6, 1.0, 1);
  return sprite;
}

// Generates floating nametag badges for 3D AI Agents
function makeAgentTag(name, role, colorHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 72;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(8, 14, 28, 0.88)";
  roundRect(ctx, 4, 4, 248, 64, 12); ctx.fill();
  ctx.strokeStyle = "#" + colorHex.toString(16).padStart(6, "0");
  ctx.lineWidth = 2;
  roundRect(ctx, 4, 4, 248, 64, 12); ctx.stroke();

  ctx.fillStyle = "#" + colorHex.toString(16).padStart(6, "0");
  ctx.font = "bold 22px 'Orbitron', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(name, 128, 26);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 15px 'JetBrains Mono', monospace";
  ctx.fillText(role, 128, 48);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(2.4, 0.7, 1);
  return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// Dark cybernetic skydome
function makeSky() {
  const geo = new THREE.SphereGeometry(300, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(0x020409) },
      mid: { value: new THREE.Color(0x061126) },
      bottom: { value: new THREE.Color(0x0a1e3d) },
      exponent: { value: 0.6 },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vDir; uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; uniform float exponent;
      void main(){ float t = pow(max(vDir.y,0.0), exponent); vec3 c = t < 0.5 ? mix(bottom, mid, t*2.0) : mix(mid, top, (t-0.5)*2.0); gl_FragColor = vec4(c, 1.0); }`,
  });
  return new THREE.Mesh(geo, mat);
}
