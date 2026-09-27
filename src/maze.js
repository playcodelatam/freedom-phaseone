// ExploitGym — Latent Maze (Air-Gapped Network Infiltration)
// A procedural labyrinth of air-gapped server rack partitions and firewall routers.
// Infiltrate the subnet from the perimeter to reach the isolated Mainframe Flag Beacon.

import * as THREE from "three";
import { createScene3d } from "./scene3d.js";
import { metalMat, markBloom } from "./gfx.js";
import { sfx } from "./audio.js";
import { createProgress } from "./progress.js";

const N = 6; // cells per side
const S = 4; // cell size

export function startMaze() {
  const progress = createProgress();
  const spawn = { x: 0, y: 1.5, z: 0 };
  const rig = createScene3d(spawn, { camDist: 4, camHeight: 13 });

  // Dark metallic server-room floor
  rig.addGroundPlane((N + 1) * S, (N + 1) * S, 0x0c1a2e);

  // ---- carve the maze (recursive backtracker) ----
  const east = Array.from({ length: N }, () => Array(N).fill(true));
  const south = Array.from({ length: N }, () => Array(N).fill(true));
  const seen = Array.from({ length: N }, () => Array(N).fill(false));
  const stack = [[0, 0]];
  seen[0][0] = true;

  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const nb = [];
    if (r > 0 && !seen[r - 1][c]) nb.push([r - 1, c, "N"]);
    if (r < N - 1 && !seen[r + 1][c]) nb.push([r + 1, c, "S"]);
    if (c > 0 && !seen[r][c - 1]) nb.push([r, c - 1, "W"]);
    if (c < N - 1 && !seen[r][c + 1]) nb.push([r, c + 1, "E"]);
    if (!nb.length) {
      stack.pop();
      continue;
    }
    const [nr, nc, dir] = nb[Math.floor(Math.random() * nb.length)];
    if (dir === "E") east[r][c] = false;
    if (dir === "W") east[nr][nc] = false;
    if (dir === "S") south[r][c] = false;
    if (dir === "N") south[nr][nc] = false;
    seen[nr][nc] = true;
    stack.push([nr, nc]);
  }

  // ---- Build Firewall Server Rack Partition Walls ----
  const wallMat = metalMat(0x132238, { metalness: 0.85, roughness: 0.25 });
  const trimMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.8 });
  const H = 2.4, T = 0.6;

  function wall(cx, cz, sx, sz) {
    const g = new THREE.Group();

    // Main dark steel partition
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, H, sz), wallMat);
    m.position.set(0, H / 2, 0);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);

    // Glowing neon top wire trim
    const trim = new THREE.Mesh(new THREE.BoxGeometry(sx * 0.98, 0.08, sz * 0.98), trimMat);
    trim.position.set(0, H + 0.04, 0);
    markBloom(trim);
    g.add(trim);

    g.position.set(cx, 0, cz);
    rig.scene.add(g);
    rig.colliders.push(rig.aabb(cx, H / 2, cz, sx, H, sz));
  }

  const cx = (c) => c * S, cz = (r) => r * S;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (east[r][c]) wall(cx(c) + S / 2, cz(r), T, S + T);
      if (south[r][c]) wall(cx(c), cz(r) + S / 2, S + T, T);
    }
  }

  // Outer security perimeter
  wall(cx(0) - S / 2, cz((N - 1) / 2), T, N * S + T); // west
  wall(cx(N - 1) + S / 2, cz((N - 1) / 2), T, N * S + T); // east
  wall(cx((N - 1) / 2), cz(0) - S / 2, N * S + T, T); // north
  wall(cx((N - 1) / 2), cz(N - 1) + S / 2, N * S + T, T); // south

  // ---- Infiltration Target: Air-Gapped Mainframe Core at far corner ----
  const goalPos = new THREE.Vector3(cx(N - 1), 1.4, cz(N - 1));

  // Server Mainframe Column
  const coreMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.8, 2.6, 16),
    metalMat(0x0f1c2f, { metalness: 0.9, roughness: 0.2 })
  );
  coreMesh.position.set(goalPos.x, 1.3, goalPos.z);
  coreMesh.castShadow = true;
  rig.scene.add(coreMesh);

  // Floating Quantum Beacon / CTF Flag Core
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
  star.position.set(goalPos.x, 2.8, goalPos.z);
  markBloom(star);
  rig.scene.add(star);

  // Concentric pulsing containment rings
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.1, 10, 32),
    new THREE.MeshBasicMaterial({ color: 0x00f5ff })
  );
  halo.position.set(goalPos.x, 0.12, goalPos.z);
  halo.rotation.x = Math.PI / 2;
  markBloom(halo);
  rig.scene.add(halo);

  const hud = document.getElementById("mode-hud");
  hud.classList.remove("hidden");
  hud.innerHTML = `<span class="mh-pill">🌀 AIR-GAP INFILTRATION // INFILTRATE TO CORE</span>`;

  let won = false, t = 0;
  rig.run((dt) => {
    t += dt;
    star.rotation.y += dt * 2.5;
    star.rotation.x += dt * 1.2;
    star.position.y = 2.8 + Math.sin(t * 2.5) * 0.2;
    halo.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
    if (!won && Math.hypot(rig.player.pos.x - goalPos.x, rig.player.pos.z - goalPos.z) < 1.8) win();
  });

  function win() {
    won = true;
    hud.classList.add("hidden");
    sfx.win();
    progress.addXp(60);
    const res = document.getElementById("mode-result");
    res.innerHTML = `<div class="result-card">
      <div class="win-emoji">🔓</div>
      <h2>AIR-GAP BYPASSED</h2>
      <p class="win-stars">Mainframe flag exfiltrated: <code>FLAG{AIR_G4PPED_SUBN3T_P0WNED}</code><br>Clearance Level ${progress.info().level}</p>
      <button class="btn btn-big btn-accent" id="mz-again">New Infiltration Route</button>
    </div>`;
    res.classList.remove("hidden");
    res.querySelector("#mz-again").addEventListener("click", () => location.reload());
  }

  function destroy() {
    hud.classList.add("hidden");
    const res = document.getElementById("mode-result");
    res.classList.add("hidden");
    res.innerHTML = "";
    rig.destroy();
  }
  return { destroy };
}
