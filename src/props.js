// ExploitGym — Cyber Props & Scenery Pipeline
// Renders decorative high-tech life for the Exploit Arena:
// telemetry relay pylons with blinking sensor heads, floating data probes,
// collectible cryptographic token shards, drifting network data nodes, and
// cybernetic particle discharge bursts.

import * as THREE from "three";
import { metalMat, markBloom } from "./gfx.js";

export function createProps(scene, world, density = 1) {
  const group = new THREE.Group();
  scene.add(group);

  const clouds = [];
  const coins = [];
  const balloons = []; // Re-purposed as floating data probes
  const transients = []; // { obj, age, ttl, tick }

  // ---- Drifting Network Data Nodes (replaces puffy clouds) ----
  const nodeGeo = new THREE.IcosahedronGeometry(0.7, 0);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.35 });
  const nodeCoreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
  const cloudCount = Math.round(14 * density);

  for (let i = 0; i < cloudCount; i++) {
    const cluster = new THREE.Group();
    const core = new THREE.Mesh(nodeGeo, nodeCoreMat);
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), nodeMat);
    markBloom(core);
    cluster.add(core, wire);
    cluster.position.set((i * 11) % 60 - 30, 8 + (i % 4) * 2.5, i * 9 - 6);
    cluster.userData.speed = 0.4 + (i % 3) * 0.2;
    cluster.userData.rotSpeed = 0.5 + (i % 2) * 0.5;
    group.add(cluster);
    clouds.push(cluster);
  }

  // ---- Collectible Cryptographic Token Shards between checkpoints ----
  const tokenOuterMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const tokenInnerMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const tokenOuterGeo = new THREE.TorusGeometry(0.24, 0.08, 8, 16);
  const tokenInnerGeo = new THREE.OctahedronGeometry(0.14, 0);

  {
    const cps = world.checkpoints;
    const per = density > 0.5 ? 3 : 2;
    for (let i = 0; i < cps.length; i++) {
      const a = i === 0 ? { x: world.spawn.x, y: 1, z: world.spawn.z } : cps[i - 1].pos;
      const b = cps[i].pos;
      for (let k = 1; k <= per; k++) {
        const t = k / (per + 1);
        const token = new THREE.Group();

        const ring = new THREE.Mesh(tokenOuterGeo, tokenOuterMat);
        const core = new THREE.Mesh(tokenInnerGeo, tokenInnerMat);
        token.add(ring, core);

        token.position.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t + 0.25, a.z + (b.z - a.z) * t);
        token.userData.phase = i + k;
        token.userData.collected = false;

        markBloom(ring);
        markBloom(core);

        group.add(token);
        coins.push(token);
      }
    }
  }

  // ---- Telemetry Relay Pylons (replaces cartoon trees) ----
  const pylonMat = metalMat(0x132238, { metalness: 0.85, roughness: 0.25 });
  const pylonGeo = new THREE.CylinderGeometry(0.12, 0.18, 2.4, 8);
  const headGeo = new THREE.BoxGeometry(0.45, 0.35, 0.45);
  const ledGeo = new THREE.SphereGeometry(0.1, 8, 8);

  function createRelayPylon(x, y, z, s, colorHex) {
    const tg = new THREE.Group();
    const mast = new THREE.Mesh(pylonGeo, pylonMat);
    mast.position.y = 1.2;
    mast.castShadow = true;

    const head = new THREE.Mesh(headGeo, metalMat(0x1a2e48));
    head.position.y = 2.4;
    head.castShadow = true;

    const ledMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0, 2.65, 0);
    markBloom(led);

    tg.add(mast, head, led);
    tg.position.set(x, y, z);
    tg.scale.setScalar(s);
    group.add(tg);
  }

  // ---- Floating Sensor Data Probes (replaces balloons) ----
  const probeCoreGeo = new THREE.SphereGeometry(0.24, 12, 12);
  const probeRingGeo = new THREE.TorusGeometry(0.38, 0.04, 6, 20);
  const tetherMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.4 });
  const tetherGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.4, 4);

  const TIER_COLORS = [0x00f5ff, 0x38bdf8, 0x00ff88, 0xf59e0b, 0xa855f7, 0xff0055];

  for (const cp of world.checkpoints) {
    const colorHex = TIER_COLORS[cp.index % TIER_COLORS.length];

    if (density > 0.5) {
      createRelayPylon(-3.0, cp.pos.y - 1, cp.pos.z, 0.9 + (cp.index % 2) * 0.2, colorHex);
      createRelayPylon(3.0, cp.pos.y - 1, cp.pos.z - 0.6, 0.85 + (cp.index % 3) * 0.15, colorHex);
    }

    for (const sx of [-1.5, 1.5]) {
      const probeGroup = new THREE.Group();
      const tether = new THREE.Mesh(tetherGeo, tetherMat);
      tether.position.y = 0.7;

      const probeMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const probeCore = new THREE.Mesh(probeCoreGeo, probeMat);
      probeCore.position.y = 1.5;
      markBloom(probeCore);

      const probeRing = new THREE.Mesh(probeRingGeo, probeMat);
      probeRing.position.y = 1.5;
      probeRing.rotation.x = Math.PI / 2;
      markBloom(probeRing);

      probeGroup.add(tether, probeCore, probeRing);
      probeGroup.position.set(cp.pos.x + sx, cp.pos.y, cp.pos.z + 0.5);
      probeGroup.userData.phase = cp.index + sx;
      group.add(probeGroup);
      balloons.push(probeGroup);
    }
  }

  // ---- Power-up Pickups (Cyber Overclocks & Zero-Days) ----
  const powerupItems = [];
  function emojiSprite(char, size = 1.2) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.font = "96px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, 64, 72);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    spr.scale.set(size, size, 1);
    return spr;
  }

  {
    const cps = world.checkpoints;
    const defs = [
      { type: "doublejump", char: "🚀", icon: "🚀", label: "Kernel Overclock" },
      { type: "speed", char: "⚡", icon: "⚡", label: "Zero-Day Exploit" },
    ];
    for (let i = 1; i < cps.length; i += 2) {
      const a = cps[i - 1].pos;
      const b = cps[i].pos;
      const def = defs[(i >> 1) % defs.length];
      const spr = emojiSprite(def.char, 1.3);
      spr.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.8, (a.z + b.z) / 2);
      spr.userData = { ...def, collected: false, phase: i, baseY: spr.position.y };
      group.add(spr);
      powerupItems.push(spr);
    }
  }

  // ---- Collection Checks ----
  function near(pos, obj, r = 1.5) {
    return (
      Math.abs(pos.x - obj.position.x) < r &&
      Math.abs(pos.y + 0.4 - obj.position.y) < 1.8 &&
      Math.abs(pos.z - obj.position.z) < r
    );
  }

  function collectCoins(pos) {
    let got = 0;
    for (const c of coins) {
      if (c.userData.collected) continue;
      if (near(pos, c, 1.4)) {
        c.userData.collected = true;
        c.visible = false;
        got++;
        spawnSparkle({ x: c.position.x, y: c.position.y, z: c.position.z });
      }
    }
    return got;
  }

  function collectPowerup(pos) {
    for (const p of powerupItems) {
      if (p.userData.collected) continue;
      if (near(pos, p, 1.6)) {
        p.userData.collected = true;
        p.visible = false;
        spawnSparkle({ x: p.position.x, y: p.position.y, z: p.position.z });
        return { type: p.userData.type, icon: p.userData.icon, label: p.userData.label };
      }
    }
    return null;
  }

  function resetCollectibles() {
    for (const c of coins) {
      c.userData.collected = false;
      c.visible = true;
    }
    for (const p of powerupItems) {
      p.userData.collected = false;
      p.visible = true;
    }
  }

  // ---- Transient Particle Bursts (Digital Sparkle & Hex Shards) ----
  function spawnSparkle(pos) {
    const n = 16;
    const positions = new Float32Array(n * 3);
    const vel = [];
    for (let i = 0; i < n; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
      const a = (i / n) * Math.PI * 2;
      vel.push(new THREE.Vector3(Math.cos(a) * 2.2, 2.5 + Math.random() * 2, Math.sin(a) * 2.2));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0x00f5ff,
        size: 0.25,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    markBloom(pts);
    group.add(pts);
    transients.push({
      obj: pts,
      age: 0,
      ttl: 0.7,
      tick(dt, age) {
        const arr = geo.attributes.position.array;
        for (let i = 0; i < n; i++) {
          arr[i * 3] += vel[i].x * dt;
          arr[i * 3 + 1] += (vel[i].y - age * 6) * dt;
          arr[i * 3 + 2] += vel[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        pts.material.opacity = 1 - age / 0.7;
      },
    });
  }

  function spawnConfetti(center) {
    const colors = [0x00f5ff, 0x00ff88, 0x38bdf8, 0xa855f7, 0xf59e0b];
    const n = Math.round(50 * density);
    const geo = new THREE.PlaneGeometry(0.2, 0.2);
    const inst = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), n);
    const dummy = new THREE.Object3D();
    const data = [];
    const col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      data.push({
        x: center.x + (Math.random() - 0.5) * 5,
        y: center.y + 5 + Math.random() * 3,
        z: center.z + (Math.random() - 0.5) * 5,
        vy: -2 - Math.random() * 2,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 8,
        spin: Math.random() * Math.PI,
      });
      inst.setColorAt(i, col.set(colors[i % colors.length]));
    }
    group.add(inst);
    transients.push({
      obj: inst,
      age: 0,
      ttl: 2.4,
      tick(dt) {
        for (let i = 0; i < n; i++) {
          const d = data[i];
          d.y += d.vy * dt;
          d.rot += d.vr * dt;
          dummy.position.set(d.x, d.y, d.z);
          dummy.rotation.set(d.rot, d.spin, d.rot * 0.5);
          dummy.updateMatrix();
          inst.setMatrixAt(i, dummy.matrix);
        }
        inst.instanceMatrix.needsUpdate = true;
      },
    });
  }

  function update(dt, t) {
    for (const c of clouds) {
      c.position.x += c.userData.speed * dt;
      c.rotation.y += c.userData.rotSpeed * dt;
      if (c.position.x > 36) c.position.x = -36;
    }
    for (const token of coins) {
      if (!token.visible) continue;
      token.rotation.y += dt * 3.0;
      token.position.y += Math.sin(t * 2.2 + token.userData.phase) * dt * 0.35;
    }
    for (const p of powerupItems) {
      if (!p.visible) continue;
      p.position.y = p.userData.baseY + Math.sin(t * 2 + p.userData.phase) * 0.18;
      p.material.rotation = Math.sin(t * 2) * 0.2;
    }
    for (const b of balloons) {
      b.rotation.y += dt * 1.5;
      b.position.y += Math.sin(t * 1.5 + b.userData.phase) * dt * 0.12;
    }
    for (let i = transients.length - 1; i >= 0; i--) {
      const tr = transients[i];
      tr.age += dt;
      tr.tick(dt, tr.age);
      if (tr.age >= tr.ttl) {
        group.remove(tr.obj);
        tr.obj.geometry?.dispose?.();
        tr.obj.material?.dispose?.();
        transients.splice(i, 1);
      }
    }
  }

  return { group, update, spawnSparkle, spawnConfetti, collectCoins, collectPowerup, resetCollectibles };
}
