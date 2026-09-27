// ExploitGym — Token Rush (Compute Farm / Zero-Day Memory Scraping)
// A high-speed collection drill: 45 seconds to harvest as many leaking
// cryptographic memory tokens and zero-day key shards as possible from
// an active GPU compute cluster.

import * as THREE from "three";
import { createScene3d } from "./scene3d.js";
import { metalMat, markBloom } from "./gfx.js";
import { sfx } from "./audio.js";
import { createProgress } from "./progress.js";
import * as profile from "./profile.js";

const TIME = 45;

export function startCoinRush() {
  const rig = createScene3d({ x: 0, y: 1.5, z: 0 }, { bounds: 26 });
  const progress = createProgress();

  // Dark metallic server-room floor
  rig.addGround(30, 0x0f1e33);

  // Compute cluster server columns & capacitor pylons around the perimeter
  const rackMat = metalMat(0x132238, { metalness: 0.85, roughness: 0.25 });
  const rackGeo = new THREE.BoxGeometry(1.4, 3.6, 1.0);
  const ledGeo = new THREE.PlaneGeometry(0.8, 2.8);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, r = 23;
    const g = new THREE.Group();

    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.y = 1.8;
    rack.castShadow = true;

    // Glowing activity LED strip
    const ledColor = i % 2 === 0 ? 0x00f5ff : 0x00ff88;
    const led = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: ledColor, side: THREE.DoubleSide }));
    led.position.set(0, 1.8, 0.52);
    markBloom(led);

    g.add(rack, led);
    g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    g.rotation.y = -a + Math.PI / 2;
    rig.scene.add(g);
  }

  // Scatter Cryptographic Token Shards (cyan & emerald octagonal keys)
  const tokenOuterGeo = new THREE.TorusGeometry(0.36, 0.08, 8, 18);
  const tokenCoreGeo = new THREE.OctahedronGeometry(0.18, 0);

  const tokens = [];
  for (let i = 0; i < 28; i++) {
    const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 21;
    const token = new THREE.Group();

    const colorHex = i % 3 === 0 ? 0x00ff88 : 0x00f5ff;
    const outer = new THREE.Mesh(tokenOuterGeo, new THREE.MeshBasicMaterial({ color: colorHex }));
    const core = new THREE.Mesh(tokenCoreGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));

    token.add(outer, core);
    token.position.set(Math.cos(a) * r, 1.1, Math.sin(a) * r);
    token.userData.spin = Math.random() * Math.PI;

    markBloom(outer);
    markBloom(core);

    rig.scene.add(token);
    tokens.push(token);
  }
  if (import.meta.env.DEV) window.__bbCoins = tokens;

  // Overlay HUD
  const hud = document.getElementById("mode-hud");
  hud.classList.remove("hidden");
  let collected = 0, timeLeft = TIME, over = false;

  function paint() {
    hud.innerHTML = `<span class="mh-pill">💾 TOKENS: ${collected}</span><span class="mh-pill ${timeLeft <= 10 ? "low" : ""}">⏱ TIME: ${Math.ceil(timeLeft)}s</span>`;
  }
  paint();

  rig.run((dt) => {
    for (const t of tokens) {
      if (!t.visible) continue;
      t.rotation.y += dt * 3.5;
      t.position.y = 1.1 + Math.sin((t.userData.spin += dt * 2.2)) * 0.16;

      if (!over && Math.hypot(rig.player.pos.x - t.position.x, rig.player.pos.z - t.position.z) < 1.3 && Math.abs(rig.player.pos.y - t.position.y) < 2) {
        t.visible = false;
        collected++;
        profile.addCoins(1);
        sfx.coin();
        paint();
      }
    }
    if (over) return;
    timeLeft -= dt;
    if (Math.ceil(timeLeft) !== Math.ceil(timeLeft + dt)) paint();
    if (timeLeft <= 0) end();
  });

  function end() {
    over = true;
    hud.classList.add("hidden");
    sfx.win();
    progress.addXp(collected * 4);
    const res = document.getElementById("mode-result");
    res.innerHTML = `<div class="result-card">
      <div class="win-emoji">${collected >= 18 ? "🏆" : collected >= 8 ? "💾" : "⚠️"}</div>
      <h2>MEMORY HARVEST COMPLETE</h2>
      <p class="win-stars">You extracted <b>${collected}</b> cryptographic tokens from cluster memory!<br>Clearance Level ${progress.info().level}</p>
      <button class="btn btn-big btn-accent" id="cr-again">New Extraction Run</button>
    </div>`;
    res.classList.remove("hidden");
    res.querySelector("#cr-again").addEventListener("click", () => location.reload());
  }

  function destroy() {
    hud.classList.add("hidden");
    document.getElementById("mode-result").classList.add("hidden");
    document.getElementById("mode-result").innerHTML = "";
    rig.destroy();
  }
  return { destroy };
}
