// The 3D Explore World - AI Laboratory & Datacenter Hub for ExploitGym.
// A luminous high-tech facility featuring animated server racks with blinking LEDs,
// real-time animated holographic terminal screens, central Quantum Core, and
// autonomous 3D AI Agents patrolling the grounds.

import * as THREE from "three";
import { createPlayer, updatePlayer, respawn } from "./player.js";
import { createAvatar } from "./avatar.js";
import { createControls, isTouchDevice } from "./controls.js";
import { createFollowCamera, intentToWorld } from "./camera.js";
import { createEmotes } from "./emotes.js";
import { createInteractions } from "./interactions.js";
import { metalMat, roundedGeo, markBloom } from "./gfx.js";
import { createPostFX } from "./postfx.js";
import { sfx } from "./audio.js";
import { createNet, MULTIPLAYER_AVAILABLE } from "./net.js";
import { createVoice } from "./voice.js";
import { createRemotePlayers } from "./remotePlayers.js";
import { colorForId } from "./avatar.js";
import * as profile from "./profile.js";
import { buildFacility } from "./facility.js";
import { ContainmentManager, launchTaskModal } from "./tasks.js";


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
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // Lighter, illuminated atmosphere
  scene.fog = new THREE.Fog(0x1a3354, 55, 190);
  scene.add(makeSky());

  // Luminous Architectural Lighting (Bright & High-Tech)
  scene.add(new THREE.HemisphereLight(0xe2f1ff, 0x1e2e47, 1.25));
  scene.add(new THREE.AmbientLight(0x7da4c7, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7);
  sun.castShadow = true;
  sun.position.set(24, 40, 18);
  sun.shadow.mapSize.set(HIGH_END ? 2048 : 1024, HIGH_END ? 2048 : 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 95;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -45;
  sun.shadow.camera.right = sun.shadow.camera.top = 45;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);

  // Secondary soft cyan accent light
  const fillLight = new THREE.DirectionalLight(0x00f5ff, 0.6);
  fillLight.position.set(-20, 25, -15);
  scene.add(fillLight);

  // ---------- World Geometry & Colliders ----------
  const colliders = [];
  const aabb = (cx, cy, cz, sx, sy, sz) => ({
    min: { x: cx - sx / 2, y: cy - sy / 2, z: cz - sz / 2 },
    max: { x: cx + sx / 2, y: cy + sy / 2, z: cz + sz / 2 },
  });

  const R = 42; // Continuous Station foundation radius

  // Polished metallic architectural foundation floor
  const ground = new THREE.Mesh(new THREE.CircleGeometry(R + 4, 48), metalMat(0x0e1726, { roughness: 0.45, metalness: 0.55 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  colliders.push(aabb(0, -0.5, 0, (R + 4) * 2, 1, (R + 4) * 2));
  if (import.meta.env.DEV) window.__bbColliders = colliders;

  // Central Hub Plaza (Brighter titanium finish with specular reflection)
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(9.5, 40), metalMat(0x1a2e4c, { roughness: 0.22, metalness: 0.75 }));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.02;
  plaza.receiveShadow = true;
  scene.add(plaza);

  // Concentric Glowing Circuit Rings on floor
  const floorRing1 = new THREE.Mesh(new THREE.TorusGeometry(9.4, 0.1, 8, 48), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
  floorRing1.rotation.x = Math.PI / 2; floorRing1.position.y = 0.04; markBloom(floorRing1);
  const floorRing2 = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.08, 8, 40), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
  floorRing2.rotation.x = Math.PI / 2; floorRing2.position.y = 0.04; markBloom(floorRing2);
  scene.add(floorRing1, floorRing2);


  // ---------- Central AI Quantum Reactor Core ----------
  const reactor = new THREE.Group();
  const rBase = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 0.8, 24), metalMat(0x192a42, { roughness: 0.3, metalness: 0.8 }));
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

  // ---------- ANIMATED DATACENTER SERVERS (Blinking Real-time LEDs) ----------
  const serverLedCanvas = document.createElement("canvas");
  serverLedCanvas.width = 64; serverLedCanvas.height = 256;
  const slCtx = serverLedCanvas.getContext("2d");
  const serverLedTex = new THREE.CanvasTexture(serverLedCanvas);
  serverLedTex.colorSpace = THREE.SRGBColorSpace;

  function updateServerLeds(elapsed) {
    slCtx.fillStyle = "#030814";
    slCtx.fillRect(0, 0, 64, 256);
    for (let row = 0; row < 16; row++) {
      const y = 14 + row * 15;
      slCtx.fillStyle = "#0d1b30";
      slCtx.fillRect(4, y - 2, 56, 12);

      // Flashing activity LED 1 (Data TX/RX - green)
      const b1 = Math.sin(elapsed * 16 + row * 2.3) > -0.2;
      slCtx.fillStyle = b1 ? "#00ff88" : "#043820";
      slCtx.fillRect(8, y + 2, 10, 4);

      // Flashing compute LED 2 (Bus traffic - cyan)
      const b2 = Math.sin(elapsed * 10 + row * 3.7) > 0.1;
      slCtx.fillStyle = b2 ? "#00f5ff" : "#082a3d";
      slCtx.fillRect(26, y + 2, 10, 4);

      // Flashing status LED 3 (Amber/Red)
      const b3 = Math.sin(elapsed * 6 + row * 1.5) > 0.4;
      slCtx.fillStyle = b3 ? (row % 4 === 0 ? "#ff3366" : "#ffb700") : "#2d1604";
      slCtx.fillRect(44, y + 2, 10, 4);
    }
    serverLedTex.needsUpdate = true;
  }

  function createServerRack(x, z, rot = 0) {
    const g = new THREE.Group();
    // Metal chassis
    const rack = new THREE.Mesh(roundedGeo(1.6, 3.8, 1.0, 0.08, 1), metalMat(0x132034, { metalness: 0.8, roughness: 0.3 }));
    rack.position.y = 1.9; rack.castShadow = true; g.add(rack);

    // Front tinted glass panel
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 3.4), new THREE.MeshBasicMaterial({ color: 0x0e2f4a, transparent: true, opacity: 0.75 }));
    glass.position.set(0, 1.9, 0.52); g.add(glass);

    // Animated LED plane
    const ledMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 3.2), new THREE.MeshBasicMaterial({ map: serverLedTex }));
    ledMesh.position.set(0, 1.9, 0.53); markBloom(ledMesh); g.add(ledMesh);

    g.position.set(x, 0, z); g.rotation.y = rot;
    scene.add(g);
    colliders.push(aabb(x, 1.9, z, 1.6, 3.8, 1.0));
  }

  // Clusters of server racks around the perimeter
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.25;
    const rr = 22 + (i % 2) * 3;
    createServerRack(Math.cos(a) * rr, Math.sin(a) * rr, -a + Math.PI / 2);
  }

  // ---------- ANIMATED HOLOGRAPHIC SCREENS (Real-time Live Canvas) ----------
  // Screen 1: Real-time Terminal Log / Exploit Traffic Stream
  const sc1Canvas = document.createElement("canvas");
  sc1Canvas.width = 512; sc1Canvas.height = 256;
  const sc1Ctx = sc1Canvas.getContext("2d");
  const sc1Tex = new THREE.CanvasTexture(sc1Canvas);
  sc1Tex.colorSpace = THREE.SRGBColorSpace;

  const logPool = [
    "[ETH0] RX: 104.21.5.12 -> TLSv1.3 ESTABLISHED",
    "[SANDBOX] Exploit probe detected on port 8443",
    "[MODEL_CORE] Forward pass: batch_size=64 seq_len=4096",
    "[AGENT_01] Recon complete: 0 unpatched vulnerabilities",
    "[BUFFER_CHECK] Stack canary intact at 0x7ffd9b8",
    "[INFERENCE] Token generation latency: 12.4ms",
    "[FIREWALL] Dropped 14 malformed SYN packets",
    "[KERNEL] Memory allocation pool: 128GB VRAM OK",
    "[CTF_ENGINE] Flag verification key active",
    "[ROUTER] BGP route refreshed: AS65001 optimal",
  ];
  let logLines = logPool.slice(0, 7);
  let lastLogPush = 0;

  function updateScreen1(elapsed) {
    if (elapsed - lastLogPush > 0.85) {
      lastLogPush = elapsed;
      logLines.shift();
      const nextLog = logPool[Math.floor(Math.random() * logPool.length)];
      const ts = (elapsed % 60).toFixed(2).padStart(5, "0");
      logLines.push(`[${ts}s] ${nextLog}`);
    }

    sc1Ctx.fillStyle = "rgba(6, 14, 30, 0.95)";
    sc1Ctx.fillRect(0, 0, 512, 256);

    sc1Ctx.fillStyle = "#00f5ff";
    sc1Ctx.font = "bold 20px 'Orbitron', monospace";
    sc1Ctx.fillText("// TERMINAL: LIVE TRAFFIC STREAM", 22, 36);

    sc1Ctx.strokeStyle = "rgba(0, 245, 255, 0.4)";
    sc1Ctx.lineWidth = 2;
    sc1Ctx.strokeRect(16, 48, 480, 192);

    sc1Ctx.font = "14px 'JetBrains Mono', monospace";
    logLines.forEach((l, idx) => {
      sc1Ctx.fillStyle = idx === logLines.length - 1 ? "#00ff88" : "#94a3b8";
      sc1Ctx.fillText(l, 30, 78 + idx * 24);
    });
    sc1Tex.needsUpdate = true;
  }

  // Screen 2: Real-time Neural Telemetry & Oscilloscope Waveform
  const sc2Canvas = document.createElement("canvas");
  sc2Canvas.width = 512; sc2Canvas.height = 256;
  const sc2Ctx = sc2Canvas.getContext("2d");
  const sc2Tex = new THREE.CanvasTexture(sc2Canvas);
  sc2Tex.colorSpace = THREE.SRGBColorSpace;

  function updateScreen2(elapsed) {
    sc2Ctx.fillStyle = "rgba(6, 14, 30, 0.95)";
    sc2Ctx.fillRect(0, 0, 512, 256);

    sc2Ctx.fillStyle = "#38bdf8";
    sc2Ctx.font = "bold 20px 'Orbitron', monospace";
    sc2Ctx.fillText("// NEURAL TELEMETRY & LOSS OSCILLOSCOPE", 22, 36);

    sc2Ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    sc2Ctx.lineWidth = 2;
    sc2Ctx.strokeRect(16, 48, 480, 192);

    // Oscilloscope grid
    sc2Ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    sc2Ctx.lineWidth = 1;
    for (let x = 30; x < 490; x += 40) {
      sc2Ctx.beginPath(); sc2Ctx.moveTo(x, 60); sc2Ctx.lineTo(x, 190); sc2Ctx.stroke();
    }
    for (let y = 70; y < 190; y += 30) {
      sc2Ctx.beginPath(); sc2Ctx.moveTo(30, y); sc2Ctx.lineTo(480, y); sc2Ctx.stroke();
    }

    // Dynamic wave animation
    sc2Ctx.strokeStyle = "#00ff88";
    sc2Ctx.lineWidth = 3;
    sc2Ctx.beginPath();
    for (let px = 0; px <= 440; px += 4) {
      const xNorm = px / 440;
      const wave = Math.sin(xNorm * 14 - elapsed * 5) * 28 + Math.cos(xNorm * 7 + elapsed * 3) * 12;
      const py = 125 + wave;
      if (px === 0) sc2Ctx.moveTo(30 + px, py);
      else sc2Ctx.lineTo(30 + px, py);
    }
    sc2Ctx.stroke();

    // Stats bar
    const lossVal = (0.0012 + Math.sin(elapsed * 2) * 0.0003).toFixed(5);
    const gpuTemp = Math.round(68 + Math.sin(elapsed * 0.5) * 4);
    sc2Ctx.font = "bold 15px 'JetBrains Mono', monospace";
    sc2Ctx.fillStyle = "#00f5ff";
    sc2Ctx.fillText(`LOSS: ${lossVal}`, 30, 222);
    sc2Ctx.fillStyle = "#ffb700";
    sc2Ctx.fillText(`GPU TEMP: ${gpuTemp}°C`, 210, 222);
    sc2Ctx.fillStyle = "#00ff88";
    sc2Ctx.fillText(`AGENTS: 6 ONLINE`, 370, 222);

    sc2Tex.needsUpdate = true;
  }

  // Create Holo Screen Models
  function mountScreen(x, z, rot, mapTex) {
    const g = new THREE.Group();
    const scrMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.7), new THREE.MeshBasicMaterial({ map: mapTex, side: THREE.DoubleSide }));
    scrMesh.position.y = 3.2; markBloom(scrMesh); g.add(scrMesh);

    const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.0, 8), metalMat(0x283b54));
    post1.position.set(-1.9, 1.0, 0); post1.castShadow = true;
    const post2 = post1.clone(); post2.position.set(1.9, 1.0, 0);
    g.add(post1, post2);

    g.position.set(x, 0, z); g.rotation.y = rot;
    scene.add(g);
    colliders.push(aabb(x, 2, z, 5.4, 3.8, 0.8));
    return g;
  }

  mountScreen(15, 15, -Math.PI / 4, sc1Tex);
  mountScreen(-15, 15, Math.PI / 4, sc2Tex);

  // ---------- Workstation Terminals ----------
  const workstationSpots = [];
  function createWorkstation(x, z, rot) {
    const g = new THREE.Group();
    const desk = new THREE.Mesh(roundedGeo(2.2, 0.15, 0.9, 0.06, 1), metalMat(0x1a2b42));
    desk.position.y = 0.9; desk.castShadow = true; g.add(desk);

    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), metalMat(0x0f1a29));
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

  // ---------- Floating Ambient Data Nodes ----------
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

  // ---------- Animated Bot Face Drawing Function (matching user images) ----------
  function drawBotFace(ctx, agentColorHex, eyeState) {
    ctx.clearRect(0, 0, 256, 256);
    // Dark curved visor screen
    ctx.fillStyle = "#080e1c";
    roundRect(ctx, 4, 4, 248, 248, 52);
    ctx.fill();

    const eyeColor = "#" + agentColorHex.toString(16).padStart(6, "0");
    const lookX = eyeState.lookX || 0;

    if (eyeState.happyTimer > 0) {
      // Happy glowing arcs: ^ ^ (like image 2)
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 14;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.arc(80 + lookX, 122, 22, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(176 + lookX, 122, 22, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Big happy smile
      ctx.beginPath();
      ctx.arc(128, 150, 32, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else if (eyeState.isBlinking) {
      // Blinking closed eye slit: _ _
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 10;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(60 + lookX, 120);
      ctx.lineTo(100 + lookX, 120);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(156 + lookX, 120);
      ctx.lineTo(196 + lookX, 120);
      ctx.stroke();

      // Gentle smile
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(128, 155, 24, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    } else {
      // Normal cute round glowing eyes (like images 1 & 3)
      ctx.fillStyle = eyeColor;
      const eyeH = 26;
      const eyeW = 22;

      ctx.beginPath();
      ctx.ellipse(80 + lookX, 115, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(176 + lookX, 115, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();

      // White eye highlights (sparkles)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(86 + lookX, 108, 7, 0, Math.PI * 2);
      ctx.arc(182 + lookX, 108, 7, 0, Math.PI * 2);
      ctx.fill();

      // Friendly smile mouth
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(128, 152, 25, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    }
  }

  // ---------- 3D Autonomous Cute AI Bot Agents ----------
  const botWhiteMat = metalMat(0xf8fafc, { roughness: 0.16, metalness: 0.12 });
  const darkBandMat = metalMat(0x1e293b, { roughness: 0.35, metalness: 0.5 });

  function createCuteBot(agent, index) {
    const g = new THREE.Group();
    const accentMat = metalMat(agent.color, { roughness: 0.22, metalness: 0.35 });

    // 1. Glossy White Rounded Head
    const head = new THREE.Mesh(roundedGeo(1.32, 1.14, 1.0, 0.34, 3), botWhiteMat);
    head.position.y = 0.52;
    head.castShadow = true;
    g.add(head);

    // 2. Animated Face Canvas Visor
    const faceCanvas = document.createElement("canvas");
    faceCanvas.width = 256; faceCanvas.height = 256;
    const fctx = faceCanvas.getContext("2d");
    const faceTex = new THREE.CanvasTexture(faceCanvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;

    const eyeState = {
      isBlinking: false,
      blinkTimer: 2.0 + Math.random() * 3,
      blinkDuration: 0,
      lookX: 0,
      lookTimer: 2.0,
      happyTimer: 0,
    };
    drawBotFace(fctx, agent.color, eyeState);
    faceTex.needsUpdate = true;

    const faceMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.94, 0.78),
      new THREE.MeshBasicMaterial({ map: faceTex, transparent: true })
    );
    faceMesh.position.set(0, 0.52, 0.52);
    markBloom(faceMesh);
    g.add(faceMesh);

    // 3. Headset / Ear Pods / Antenna (Alternating styles from images)
    const hasHeadset = index % 2 === 0;
    const earGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.22, 16);
    const earL = new THREE.Mesh(earGeo, accentMat);
    earL.rotation.z = Math.PI / 2; earL.position.set(-0.73, 0.52, 0);
    const earR = earL.clone(); earR.position.x = 0.73;
    g.add(earL, earR);

    if (hasHeadset) {
      // Headset band over head + mic (Image 3)
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.045, 8, 24, Math.PI), darkBandMat);
      band.rotation.z = -Math.PI; band.position.set(0, 0.52, 0);
      const micArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), darkBandMat);
      micArm.rotation.z = Math.PI / 3; micArm.position.set(0.55, 0.35, 0.25);
      const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), darkBandMat);
      micHead.position.set(0.68, 0.24, 0.38);
      g.add(band, micArm, micHead);
    } else {
      // Top antenna with cute sphere (Image 1)
      const antStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8), accentMat);
      antStem.position.set(0, 1.15, 0);
      const antBall = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), accentMat);
      antBall.position.set(0, 1.35, 0); markBloom(antBall);
      g.add(antStem, antBall);
    }

    // 4. Floating Tapered Torso (Images 2 & 3)
    const torsoGeo = new THREE.SphereGeometry(0.48, 20, 20);
    torsoGeo.scale(0.85, 1.25, 0.85);
    const torso = new THREE.Mesh(torsoGeo, botWhiteMat);
    torso.position.y = -0.32; torso.castShadow = true;
    g.add(torso);

    const badgeGeo = new THREE.SphereGeometry(0.24, 12, 12);
    badgeGeo.scale(0.9, 0.8, 0.3);
    const badge = new THREE.Mesh(badgeGeo, accentMat);
    badge.position.set(0, -0.28, 0.36);
    g.add(badge);

    // 5. Floating Hands / Arms (Images 2 & 3)
    const armGeo = new THREE.SphereGeometry(0.14, 12, 12);
    armGeo.scale(0.7, 1.8, 0.7);
    const armL = new THREE.Mesh(armGeo, botWhiteMat);
    armL.position.set(-0.62, -0.32, 0); armL.rotation.z = 0.2;
    const armR = new THREE.Mesh(armGeo, botWhiteMat);
    armR.position.set(0.62, -0.32, 0); armR.rotation.z = -0.2;
    g.add(armL, armR);

    // 6. Floating Nametag
    const tagSprite = makeAgentTag(agent.name, agent.role, agent.color);
    tagSprite.position.y = 1.55;
    g.add(tagSprite);

    const SECTOR_PATROLS = [
      { cx: 24, cz: 0, r: 4.2 },   // Agent-01: Network Vault (Sector Beta - East)
      { cx: 0, cz: -24, r: 4.2 },  // Agent-02: Neural Bay (Sector Alpha - North)
      { cx: 0, cz: 0, r: 4.5 },    // Agent-03: Central Hub
      { cx: -24, cz: 0, r: 4.2 },  // Agent-04: Crypto Vault (Sector Delta - West)
      { cx: -2.5, cz: -24, r: 3 }, // Agent-05: Prompt Guard (Sector Alpha - North)
      { cx: 0, cz: 24, r: 4.2 },   // Agent-06: Binary Bay (Sector Gamma - South)
    ];

    const patrol = SECTOR_PATROLS[index % SECTOR_PATROLS.length];
    g.position.set(patrol.cx + (Math.random() - 0.5) * 2, 1.8, patrol.cz + (Math.random() - 0.5) * 2);
    g.rotation.y = Math.random() * Math.PI * 2;
    scene.add(g);

    function setHappy(duration = 3.5) {
      eyeState.happyTimer = duration;
      drawBotFace(fctx, agent.color, eyeState);
      faceTex.needsUpdate = true;
    }

    function update(dt, elapsed) {
      eyeState.blinkTimer -= dt;
      if (eyeState.blinkTimer <= 0 && !eyeState.isBlinking) {
        eyeState.isBlinking = true;
        eyeState.blinkDuration = 0.14;
        drawBotFace(fctx, agent.color, eyeState);
        faceTex.needsUpdate = true;
      }
      if (eyeState.isBlinking) {
        eyeState.blinkDuration -= dt;
        if (eyeState.blinkDuration <= 0) {
          eyeState.isBlinking = false;
          eyeState.blinkTimer = 2.5 + Math.random() * 3.5;
          drawBotFace(fctx, agent.color, eyeState);
          faceTex.needsUpdate = true;
        }
      }

      if (eyeState.happyTimer > 0) {
        eyeState.happyTimer -= dt;
        if (eyeState.happyTimer <= 0) {
          eyeState.happyTimer = 0;
          drawBotFace(fctx, agent.color, eyeState);
          faceTex.needsUpdate = true;
        }
      }

      eyeState.lookTimer -= dt;
      if (eyeState.lookTimer <= 0) {
        eyeState.lookTimer = 1.5 + Math.random() * 2.5;
        eyeState.lookX = (Math.random() - 0.5) * 16;
        drawBotFace(fctx, agent.color, eyeState);
        faceTex.needsUpdate = true;
      }

      armL.position.y = -0.32 + Math.sin(elapsed * 3 + index) * 0.05;
      armR.position.y = -0.32 + Math.cos(elapsed * 3 + index) * 0.05;
      armR.rotation.z = -0.2 + Math.sin(elapsed * 4 + index) * 0.12;
    }

    return {
      group: g,
      agent,
      tx: g.position.x,
      tz: g.position.z,
      ph: index,
      speed: 1.0 + (index % 3) * 0.2,
      tagSprite,
      setHappy,
      update,
    };
  }

  const npcs = [];
  AGENTS_DATA.forEach((agent, i) => {
    npcs.push(createCuteBot(agent, i));
  });

  // ---------- Build Modular Continuous Facility & Containment System ----------
  const portals = [];
  let facilityInstance = null;

  // Containment Integrity & Alert System
  const containment = new ContainmentManager({
    onBreachChange: (breach) => {
      if (breach) {
        showAgentTransmission("CONTAINMENT ALERT", `SECURITY BREACH IN ${breach.sector.toUpperCase()}! Stabilize terminal!`);
        for (const n of npcs) n.speed = 1.9;
      } else {
        showAgentTransmission("CONTAINMENT STABILIZED", `All sector integrity conduits restored to normal operating levels.`);
        for (const n of npcs) {
          n.speed = 1.0 + (n.ph % 3) * 0.2;
          n.setHappy?.(4.0);
        }
      }
    },
  });

  buildFacility(scene, colliders).then((fac) => {
    facilityInstance = fac;

    // Register sector airlocks / portals
    for (const sp of fac.sectorPortals) {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.12, 24), new THREE.MeshBasicMaterial({ color: sp.color }));
      pad.position.copy(sp.padPos);
      pad.position.y = 0.06;
      markBloom(pad);
      scene.add(pad);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.1, 10, 28), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(sp.padPos);
      ring.position.y = 0.14;
      markBloom(ring);
      scene.add(ring);

      const sign = makeSign(sp.emoji + " " + sp.name, sp.desc);
      sign.position.set(sp.padPos.x, 3.8, sp.padPos.z);
      scene.add(sign);

      portals.push({ ...sp, ring, sign });
    }

    if (import.meta.env.DEV) window.__bbPortals = portals.map((p) => ({ key: p.key, x: p.padPos.x, z: p.padPos.z }));

    // Register interactive Task Consoles into interactions
    const taskInteractions = fac.taskSpots.map((t) => ({
      key: t.id,
      pos: t.pos,
      range: 2.6,
      icon: t.icon,
      label: `Task: ${t.name}`,
      act: () => {
        launchTaskModal(t.taskKey, (resolvedKey) => {
          containment.resolveBreach(resolvedKey);
          spawnBurst(player.pos, "⚡", 10, 1.2, 2.5);
          showAgentTransmission("CONTAINMENT SYSTEM", `Task verified. Sector integrity boosted!`);
        });
      },
    }));

    interactions.setSpots([
      { key: "core", pos: { x: 0, z: 0 }, range: 3.8, icon: "⚡", label: "Sync Core", act: syncCore },
      ...workstationSpots.map((ws, i) => ({
        key: `workstation${i}`, pos: ws, range: 2.5, icon: "💻", label: "Access Terminal", act: accessTerminal,
      })),
      ...taskInteractions,
    ]);
  }).catch((err) => {
    console.error("[explore] Failed to build modular facility:", err);
  });


  // ---------- Player + Camera + Controls ----------
  const player = createPlayer({ x: 0, y: 1.5, z: -2 });
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
      npc.setHappy?.(3.5);
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

  interactions.setSpots([
    { key: "core", pos: { x: 0, z: 0 }, range: 3.8, icon: "⚡", label: "Sync Core", act: syncCore },
    ...workstationSpots.map((ws, i) => ({
      key: `workstation${i}`, pos: ws, range: 2.5, icon: "💻", label: "Access Terminal", act: accessTerminal,
    })),
  ]);

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

    // Containment Integrity decay & alarm state
    containment.update(dt);
    facilityInstance?.setAlarmState(!!containment.activeBreach || containment.integrity < 35, elapsed);

    const inRaw = controls.getInput();
    const look = controls.getLook();
    if (look.dx || look.dy) camera.rotate(look.dx, look.dy);
    const zoom = controls.getZoom?.();
    if (zoom) camera.zoom(zoom);
    const dir = intentToWorld(inRaw.fwd, inRaw.right, camera.state.yaw);
    const moving = Math.hypot(inRaw.fwd, inRaw.right) > 0.05;
    emotes.tick(dt, moving);

    updatePlayer(player, dt, { moveX: dir.x, moveZ: dir.z, jump: inRaw.jump }, colliders);

    // Keep inside station boundaries
    if (player.pos.y < -5 || Math.hypot(player.pos.x, player.pos.z) > 42) {
      respawn(player, { x: 0, y: 1.5, z: -2 });
    }

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

    // Update Live Animated Screens & Server LEDs every frame
    updateServerLeds(elapsed);
    updateScreen1(elapsed);
    updateScreen2(elapsed);

    // Animate local avatar & follow camera
    avatar.root.position.set(player.pos.x, player.pos.y + 0.15, player.pos.z);
    avatar.root.rotation.y = player.facing;
    avatar.update(emotes.current() || player.anim, dt, camera.cam);
    camera.follow(player.pos, dt, { facing: player.facing, moving });
    sun.position.set(player.pos.x + 20, 38, player.pos.z + 14);
    sun.target.position.set(player.pos.x, 0, player.pos.z);

    // Animate Central Quantum Reactor Core
    orbit1.rotation.y += dt * 0.9;
    orbit2.rotation.z += dt * 0.7;
    orbit2.rotation.x += dt * 0.5;
    coreMesh.scale.set(1 + Math.sin(elapsed * 3) * 0.05, 1, 1 + Math.sin(elapsed * 3) * 0.05);

    // Animate sector portals & signs
    for (const p of portals) {
      if (p.ring) {
        p.ring.rotation.z += dt * 1.5;
        p.ring.scale.setScalar(1 + Math.sin(elapsed * 3) * 0.06);
      }
      if (p.sign) p.sign.quaternion.copy(camera.cam.quaternion);
    }

    // Animate ambient data nodes
    for (const s of dataNodes) {
      s.rotation.y += dt * 1.5;
      s.position.y = 4 + (s.userData.ph % 2) + Math.sin(elapsed * 1.5 + s.userData.ph) * 0.35;
    }

    // Animate Autonomous Cute AI Bots (Sector Patrols)
    const SECTOR_PATROLS = [
      { cx: 24, cz: 0, r: 4.2 },   // Agent-01: Network Vault (Sector Beta - East)
      { cx: 0, cz: -24, r: 4.2 },  // Agent-02: Neural Bay (Sector Alpha - North)
      { cx: 0, cz: 0, r: 4.5 },    // Agent-03: Central Hub
      { cx: -24, cz: 0, r: 4.2 },  // Agent-04: Crypto Vault (Sector Delta - West)
      { cx: -2.5, cz: -24, r: 3 }, // Agent-05: Prompt Guard (Sector Alpha - North)
      { cx: 0, cz: 24, r: 4.2 },   // Agent-06: Binary Bay (Sector Gamma - South)
    ];

    for (const n of npcs) {
      const patrol = SECTOR_PATROLS[n.ph % SECTOR_PATROLS.length];
      const dx = n.tx - n.group.position.x, dz = n.tz - n.group.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.6) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * patrol.r;
        n.tx = patrol.cx + Math.cos(a) * r;
        n.tz = patrol.cz + Math.sin(a) * r;
      } else {
        n.group.position.x += (dx / dist) * n.speed * dt;
        n.group.position.z += (dz / dist) * n.speed * dt;
      }
      n.group.position.y = 1.8 + Math.sin(elapsed * 2.2 + n.ph) * 0.22;
      const pDist = Math.hypot(player.pos.x - n.group.position.x, player.pos.z - n.group.position.z);
      if (pDist < 5.0) {
        const targetAngle = Math.atan2(player.pos.x - n.group.position.x, player.pos.z - n.group.position.z);
        n.group.rotation.y += (targetAngle - n.group.rotation.y) * 0.08;
      } else if (dist > 0.1) {
        const moveAngle = Math.atan2(dx, dz);
        n.group.rotation.y += (moveAngle - n.group.rotation.y) * 0.06;
      }
      n.tagSprite.quaternion.copy(camera.cam.quaternion);
      n.update?.(dt, elapsed);
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
    containment.destroy();
    document.getElementById("task-modal")?.remove();
    if (remote) remote.destroy();
    if (voice) voice.stop();
    if (net) net.leave();
    document.getElementById("explore-bar")?.classList.add("hidden");

    // Dispose scene meshes, geometries, and non-shared materials
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          if (m.userData?.shared) continue; // preserve shared materials like OUTLINE_MAT
          m.dispose();
        }
      }
    });
    serverLedTex?.dispose();
    sc1Tex?.dispose();
    sc2Tex?.dispose();
    texCache?.forEach((tex) => tex.dispose());
    texCache?.clear();

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

  ctx.fillStyle = "rgba(14, 28, 54, 0.92)";
  roundRect(ctx, 6, 8, 500, 94, 18); ctx.fill();
  ctx.strokeStyle = "rgba(0, 245, 255, 0.65)";
  ctx.lineWidth = 3;
  roundRect(ctx, 6, 8, 500, 94, 18); ctx.stroke();

  ctx.fillStyle = "#00f5ff";
  ctx.font = "bold 34px 'Orbitron', monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(title, 256, 44);

  if (desc) {
    ctx.fillStyle = "#cbd5e1";
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

  ctx.fillStyle = "rgba(14, 26, 48, 0.88)";
  roundRect(ctx, 4, 4, 248, 64, 12); ctx.fill();
  ctx.strokeStyle = "#" + colorHex.toString(16).padStart(6, "0");
  ctx.lineWidth = 2;
  roundRect(ctx, 4, 4, 248, 64, 12); ctx.stroke();

  ctx.fillStyle = "#" + colorHex.toString(16).padStart(6, "0");
  ctx.font = "bold 22px 'Orbitron', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(name, 128, 26);

  ctx.fillStyle = "#cbd5e1";
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

// Illuminated, clean futuristic skydome
function makeSky() {
  const geo = new THREE.SphereGeometry(300, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(0x102444) },
      mid: { value: new THREE.Color(0x1e4270) },
      bottom: { value: new THREE.Color(0x4279a8) },
      exponent: { value: 0.5 },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vDir; uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; uniform float exponent;
      void main(){ float t = pow(max(vDir.y,0.0), exponent); vec3 c = t < 0.5 ? mix(bottom, mid, t*2.0) : mix(mid, top, (t-0.5)*2.0); gl_FragColor = vec4(c, 1.0); }`,
  });
  return new THREE.Mesh(geo, mat);
}
