// ExploitGym — Full The Skeld Cybersecurity Tasks & Containment System
// Authentic recreation of Among Us / The Skeld facility maintenance tasks
// adapted into cybersecurity, system administration, and AI containment challenges.

import { sfx } from "./audio.js";
import * as profile from "./profile.js";

export const TASKS_DATA = {
  "admin-swipe": {
    id: "admin-swipe",
    sector: "Admin // SOC Command",
    title: "Card Swipe Authorization",
    desc: "Swipe the operative security clearance badge through the card reader.",
    type: "swipe",
  },
  "electrical-wiring": {
    id: "electrical-wiring",
    sector: "Electrical // Power Grid",
    title: "Fix Fiber & Power Wiring",
    desc: "Connect each color-coded fiber cable to its matching terminal to restore power.",
    type: "wires",
  },
  "medbay-scan": {
    id: "medbay-scan",
    sector: "MedBay // Biological & Neural Bay",
    title: "MedBay Biometric & Neural Scan",
    desc: "Perform a full-body biometric scan to detect rogue neural parasites or AI subversion.",
    type: "scan",
  },
  "shields-prime": {
    id: "shields-prime",
    sector: "Shields // Firewall Matrix",
    title: "Prime Shield Conduits",
    desc: "Energize all deactivated hexagonal shield defense nodes to maximum capacity.",
    type: "shields",
  },
  "reactor-manifolds": {
    id: "reactor-manifolds",
    sector: "Reactor // Quantum Core",
    title: "Unlock Reactor Manifolds",
    desc: "Depress the numeric containment valves in exact ascending order (1-5).",
    type: "manifolds",
  },
  "weapons-asteroids": {
    id: "weapons-asteroids",
    sector: "Weapons // Threat Defense",
    title: "Clear Incoming Exploit Probes",
    desc: "Target and neutralize incoming rogue reconnaissance bots in the targeting visor.",
    type: "asteroids",
  },
  "o2-filter": {
    id: "o2-filter",
    sector: "O2 // Life Support & Scrubbers",
    title: "Clean O2 Filter Vent",
    desc: "Remove debris clogging the environmental oxygen and cooling ventilation chute.",
    type: "o2",
  },
  "comms-frequency": {
    id: "comms-frequency",
    sector: "Communications // SOC Uplink",
    title: "Calibrate Satellite Frequency",
    desc: "Align the radio receiver dial to match the emergency satellite frequency.",
    type: "frequency",
  },
  "nav-chart": {
    id: "nav-chart",
    sector: "Navigation // Deep Recon Cockpit",
    title: "Chart Network Vector Course",
    desc: "Plot the navigational beacons across the sector coordinate grid.",
    type: "chart",
  },
  "engine-align": {
    id: "engine-align",
    sector: "Engines // Propulsion & Thermal",
    title: "Align Engine Output & Throttle",
    desc: "Lock the engine fuel pointer directly inside the optimal green alignment zone.",
    type: "timing",
  },
  "security-cctv": {
    id: "security-cctv",
    sector: "Security // CCTV Monitoring",
    title: "Inspect Security Surveillance",
    desc: "Audit the surveillance feeds and isolate the camera channel showing rogue bot activity.",
    type: "cctv",
  },
  "cafeteria-reboot": {
    id: "cafeteria-reboot",
    sector: "Cafeteria // Central Assembly",
    title: "Emergency Facility Reboot",
    desc: "Engage the central emergency console and cycle the master breakers.",
    type: "reboot",
  },
};

export class ContainmentManager {
  constructor(opts = {}) {
    this.integrity = 92;
    this.decayRate = 0.35; // % per second
    this.activeBreach = null;
    this.breachTimer = 22;
    this.onBreachChange = opts.onBreachChange || null;
    this.onIntegrityChange = opts.onIntegrityChange || null;
    this.alarmCooldown = 0;
    this.completedTasksCount = 0;

    this.createHud();
  }

  createHud() {
    let el = document.getElementById("containment-hud");
    if (!el) {
      el = document.createElement("div");
      el.id = "containment-hud";
      el.className = "containment-hud";
      document.body.appendChild(el);
    }
    this.hudEl = el;
    this.renderHud();
  }

  renderHud() {
    if (!this.hudEl) return;
    const pct = Math.max(0, Math.min(100, Math.round(this.integrity)));
    const isAlert = pct < 45 || !!this.activeBreach;
    const colorClass = pct > 60 ? "good" : pct > 30 ? "warn" : "critical";

    let breachText = "";
    if (this.activeBreach) {
      breachText = `<div class="breach-alert">⚠️ BREACH ALERT: ${this.activeBreach.sector} (${this.activeBreach.title})</div>`;
    } else if (pct < 45) {
      breachText = `<div class="breach-alert warning">⚠️ SYSTEM INSTABILITY: Perform Maintenance Tasks</div>`;
    }

    this.hudEl.innerHTML = `
      <div class="containment-bar-wrap ${colorClass} ${isAlert ? "pulsing" : ""}">
        <div class="containment-header">
          <span class="containment-label">🛡️ AI CONTAINMENT INTEGRITY</span>
          <span class="containment-pct">${pct}%</span>
        </div>
        <div class="containment-track">
          <div class="containment-fill" style="width: ${pct}%"></div>
        </div>
        ${breachText}
      </div>
    `;
  }

  update(dt) {
    if (this.integrity > 0) {
      this.integrity = Math.max(0, this.integrity - this.decayRate * dt);
      if (this.onIntegrityChange) this.onIntegrityChange(this.integrity);
    }

    this.breachTimer -= dt;
    if (this.breachTimer <= 0 && !this.activeBreach) {
      this.triggerRandomBreach();
    }

    if (this.activeBreach || this.integrity < 35) {
      this.alarmCooldown -= dt;
      if (this.alarmCooldown <= 0) {
        sfx.alarm();
        this.alarmCooldown = 4.5;
      }
    }

    this.renderHud();
  }

  triggerRandomBreach() {
    const keys = Object.keys(TASKS_DATA);
    const pick = TASKS_DATA[keys[Math.floor(Math.random() * keys.length)]];
    this.activeBreach = pick;
    this.decayRate = 0.85;
    sfx.alarm();
    if (this.onBreachChange) this.onBreachChange(this.activeBreach);
    this.renderHud();
  }

  resolveBreach(taskKey) {
    if (this.activeBreach && this.activeBreach.id === taskKey) {
      this.activeBreach = null;
      this.decayRate = 0.35;
      this.breachTimer = 35 + Math.random() * 25;
      if (this.onBreachChange) this.onBreachChange(null);
    }
    this.integrity = Math.min(100, this.integrity + 28);
    this.completedTasksCount++;
    profile.addCoins(5);
    sfx.correct();
    this.renderHud();
  }

  destroy() {
    if (this.hudEl && this.hudEl.parentElement) {
      this.hudEl.parentElement.removeChild(this.hudEl);
    }
  }
}

/**
 * Opens an interactive Cyber Task modal for the player
 */
export function launchTaskModal(taskKey, onComplete) {
  const task = TASKS_DATA[taskKey] || TASKS_DATA["admin-swipe"];

  let modal = document.getElementById("task-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "task-modal";
    modal.className = "task-modal screen";
    document.body.appendChild(modal);
  }

  modal.classList.remove("hidden");
  modal.innerHTML = `
    <div class="task-card">
      <div class="task-card-header">
        <div>
          <span class="task-sector-tag">${task.sector}</span>
          <h2 class="task-title">${task.title}</h2>
        </div>
        <button id="task-close-btn" class="icon-btn" title="Cancel">✕</button>
      </div>
      <p class="task-desc">${task.desc}</p>
      <div id="task-body" class="task-body"></div>
      <div id="task-feedback" class="task-feedback"></div>
    </div>
  `;

  const bodyEl = modal.querySelector("#task-body");
  const feedEl = modal.querySelector("#task-feedback");
  const closeBtn = modal.querySelector("#task-close-btn");

  const closeModal = () => {
    modal.classList.add("hidden");
    window.removeEventListener("keydown", onKeyEsc);
  };

  const onKeyEsc = (e) => {
    if (e.key === "Escape") closeModal();
  };
  window.addEventListener("keydown", onKeyEsc);
  closeBtn.addEventListener("click", closeModal);

  const finishSuccess = () => {
    feedEl.innerHTML = `<span class="feed-ok">✓ TASK COMPLETE // INTEGRITY RESTORED (+28% INTEGRITY, +5 TOKENS)</span>`;
    sfx.win();
    setTimeout(() => {
      closeModal();
      if (onComplete) onComplete(taskKey);
    }, 1300);
  };

  switch (task.type) {
    case "swipe":
      renderSwipeTask(bodyEl, feedEl, finishSuccess);
      break;
    case "wires":
      renderWiresTask(bodyEl, feedEl, finishSuccess);
      break;
    case "scan":
      renderScanTask(bodyEl, feedEl, finishSuccess);
      break;
    case "shields":
      renderShieldsTask(bodyEl, feedEl, finishSuccess);
      break;
    case "manifolds":
      renderManifoldsTask(bodyEl, feedEl, finishSuccess);
      break;
    case "asteroids":
      renderAsteroidsTask(bodyEl, feedEl, finishSuccess);
      break;
    case "o2":
      renderO2Task(bodyEl, feedEl, finishSuccess);
      break;
    case "frequency":
      renderFrequencyTask(bodyEl, feedEl, finishSuccess);
      break;
    case "chart":
      renderChartTask(bodyEl, feedEl, finishSuccess);
      break;
    case "timing":
      renderTimingTask(bodyEl, feedEl, finishSuccess);
      break;
    case "cctv":
      renderCctvTask(bodyEl, feedEl, finishSuccess);
      break;
    case "reboot":
      renderRebootTask(bodyEl, feedEl, finishSuccess);
      break;
    default:
      renderSwipeTask(bodyEl, feedEl, finishSuccess);
  }
}

// 1. Admin: Card Swipe
function renderSwipeTask(container, feedEl, onSuccess) {
  container.innerHTML = `
    <div class="filter-instruction">💳 Click [SWIPE KEYCARD] with steady speed to authorize access:</div>
    <div class="swipe-track">
      <div id="swipe-card" class="swipe-card">
        <span class="card-chip"></span>
        <span class="card-label">OPERATIVE // LV.4</span>
      </div>
      <div class="swipe-slot"></div>
    </div>
    <div style="display:flex;gap:12px;margin-top:12px;">
      <button id="btn-swipe-fast" class="btn" style="flex:1;">⚡ Swipe Fast</button>
      <button id="btn-swipe-normal" class="btn btn-accent" style="flex:1;">✅ Swipe Normal</button>
      <button id="btn-swipe-slow" class="btn" style="flex:1;">🐢 Swipe Slow</button>
    </div>
  `;

  const card = container.querySelector("#swipe-card");

  container.querySelector("#btn-swipe-normal").addEventListener("click", () => {
    card.style.transform = "translateX(280px)";
    feedEl.innerHTML = `<span class="feed-ok">CARD ACCEPTED. IDENTITY VERIFIED.</span>`;
    sfx.correct();
    onSuccess();
  });

  container.querySelector("#btn-swipe-fast").addEventListener("click", () => {
    card.style.transform = "translateX(280px)";
    feedEl.innerHTML = `<span class="feed-err">TOO FAST! Try again at normal speed.</span>`;
    sfx.wrong();
    setTimeout(() => { card.style.transform = "translateX(0)"; feedEl.innerHTML = ""; }, 800);
  });

  container.querySelector("#btn-swipe-slow").addEventListener("click", () => {
    card.style.transform = "translateX(120px)";
    feedEl.innerHTML = `<span class="feed-err">TOO SLOW! Reader timed out.</span>`;
    sfx.wrong();
    setTimeout(() => { card.style.transform = "translateX(0)"; feedEl.innerHTML = ""; }, 800);
  });
}

// 2. Electrical: Fix Wiring
function renderWiresTask(container, feedEl, onSuccess) {
  const colors = [
    { name: "red", color: "#ff0055" },
    { name: "blue", color: "#00f5ff" },
    { name: "yellow", color: "#f59e0b" },
    { name: "purple", color: "#a855f7" },
  ];

  const leftOrder = [...colors];
  const rightOrder = [...colors].sort(() => Math.random() - 0.5);

  let selectedLeft = null;
  let connected = new Set();

  container.innerHTML = `
    <div class="filter-instruction">🔌 Click a wire terminal on the LEFT, then click its matching color on the RIGHT:</div>
    <div class="wires-board">
      <div class="wires-col left-col">
        ${leftOrder.map((w) => `
          <button class="wire-port" data-color="${w.name}" style="border-color:${w.color};background:${w.color}22">
            <span class="wire-nub" style="background:${w.color}"></span>
            <span>${w.name.toUpperCase()}</span>
          </button>
        `).join("")}
      </div>
      <div class="wires-middle" id="wires-canvas-area">
        <span style="font-family:'JetBrains Mono';font-size:11px;color:#64748b;">[ TERMINAL BUS ]</span>
      </div>
      <div class="wires-col right-col">
        ${rightOrder.map((w) => `
          <button class="wire-port" data-color="${w.name}" style="border-color:${w.color};background:${w.color}22">
            <span>${w.name.toUpperCase()}</span>
            <span class="wire-nub" style="background:${w.color}"></span>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  const leftBtns = container.querySelectorAll(".left-col .wire-port");
  const rightBtns = container.querySelectorAll(".right-col .wire-port");

  leftBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const col = btn.getAttribute("data-color");
      if (connected.has(col)) return;
      leftBtns.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedLeft = col;
      sfx.checkpoint();
    });
  });

  rightBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!selectedLeft) return;
      const rightCol = btn.getAttribute("data-color");
      if (rightCol === selectedLeft) {
        connected.add(rightCol);
        btn.classList.add("wired");
        const matchLeft = container.querySelector(`.left-col .wire-port[data-color="${rightCol}"]`);
        if (matchLeft) matchLeft.classList.add("wired");
        selectedLeft = null;
        sfx.correct();

        if (connected.size === 4) {
          onSuccess();
        }
      } else {
        feedEl.innerHTML = `<span class="feed-err">❌ Color mismatch! Wires crossed.</span>`;
        sfx.wrong();
        setTimeout(() => feedEl.innerHTML = "", 700);
      }
    });
  });
}

// 3. MedBay: Scan
function renderScanTask(container, feedEl, onSuccess) {
  container.innerHTML = `
    <div class="filter-instruction">🔬 Neural & Biometric Diagnostic:</div>
    <div class="scan-visual">
      <div class="scan-ring">
        <div class="scan-beam"></div>
      </div>
      <div class="scan-data">
        <div>SUBJECT: <b style="color:#00f5ff">OPERATIVE #104</b></div>
        <div>HEART RATE: <b>72 BPM</b></div>
        <div>NEURAL INTEGRITY: <b style="color:#00ff88">99.8%</b></div>
        <div>MALWARE INFECTION: <b style="color:#00ff88">NONE DETECTED</b></div>
      </div>
    </div>
    <div class="containment-track" style="margin-top:14px;height:12px;">
      <div id="scan-progress" class="containment-fill" style="width:0%"></div>
    </div>
    <button id="btn-start-scan" class="btn btn-big btn-accent" style="width:100%;margin-top:14px;">EXECUTE MEDBAY SCAN</button>
  `;

  const btn = container.querySelector("#btn-start-scan");
  const bar = container.querySelector("#scan-progress");

  btn.addEventListener("click", () => {
    btn.disabled = true;
    let pct = 0;
    sfx.checkpoint();
    const iv = setInterval(() => {
      pct += 10;
      bar.style.width = pct + "%";
      if (pct % 30 === 0) sfx.sparkle();
      if (pct >= 100) {
        clearInterval(iv);
        feedEl.innerHTML = `<span class="feed-ok">SCAN COMPLETE // SUBJECT HEALTHY & VERIFIED</span>`;
        onSuccess();
      }
    }, 180);
  });
}

// 4. Shields: Prime Shields (Hexagonal Nodes)
function renderShieldsTask(container, feedEl, onSuccess) {
  let nodes = [false, true, false, true, false, true, false];

  container.innerHTML = `
    <div class="filter-instruction">🛡️ Click all RED deactivated shield nodes to energize them to CYAN:</div>
    <div class="shields-grid">
      ${nodes.map((active, i) => `
        <button class="shield-node ${active ? "active" : "offline"}" data-idx="${i}">
          ⬡
        </button>
      `).join("")}
    </div>
  `;

  container.querySelectorAll(".shield-node").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      nodes[idx] = true;
      btn.className = "shield-node active";
      sfx.checkpoint();

      if (nodes.every(Boolean)) {
        sfx.powerup();
        feedEl.innerHTML = `<span class="feed-ok">SHIELDS ENERGIZED AT 100% CAPACITY!</span>`;
        onSuccess();
      }
    });
  });
}

// 5. Reactor: Unlock Manifolds (1 to 5 ascending)
function renderManifoldsTask(container, feedEl, onSuccess) {
  let currentTarget = 1;
  const numbers = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="filter-instruction">⚛️ Click the valves in ASCENDING sequence [ 1 -> 2 -> 3 -> 4 -> 5 ]:</div>
    <div class="manifolds-grid">
      ${numbers.map((num) => `
        <button class="manifold-btn" data-val="${num}">${num}</button>
      `).join("")}
    </div>
  `;

  container.querySelectorAll(".manifold-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = parseInt(btn.getAttribute("data-val"), 10);
      if (val === currentTarget) {
        btn.classList.add("depressed");
        currentTarget++;
        sfx.checkpoint();
        if (currentTarget > 5) {
          feedEl.innerHTML = `<span class="feed-ok">MANIFOLDS UNLOCKED // REACTOR IN EQUILIBRIUM</span>`;
          onSuccess();
        }
      } else {
        feedEl.innerHTML = `<span class="feed-err">OUT OF SEQUENCE! Sequence reset.</span>`;
        sfx.wrong();
        currentTarget = 1;
        setTimeout(() => {
          container.querySelectorAll(".manifold-btn").forEach((b) => b.classList.remove("depressed"));
          feedEl.innerHTML = "";
        }, 600);
      }
    });
  });
}

// 6. Weapons: Clear Asteroids / Rogue Probes
function renderAsteroidsTask(container, feedEl, onSuccess) {
  let targetsLeft = 4;

  container.innerHTML = `
    <div class="filter-instruction">🎯 Point Defense Visor: Click and neutralize the 4 rogue bot probes:</div>
    <div class="weapons-screen">
      <button class="target-bot" style="top:20%;left:25%;">🛸</button>
      <button class="target-bot" style="top:60%;left:75%;">🛸</button>
      <button class="target-bot" style="top:70%;left:30%;">🛸</button>
      <button class="target-bot" style="top:25%;left:65%;">🛸</button>
      <div class="crosshair-h"></div>
      <div class="crosshair-v"></div>
    </div>
  `;

  container.querySelectorAll(".target-bot").forEach((bot) => {
    bot.addEventListener("click", () => {
      bot.style.transform = "scale(0)";
      bot.style.opacity = "0";
      bot.disabled = true;
      sfx.gate();
      targetsLeft--;
      if (targetsLeft <= 0) {
        feedEl.innerHTML = `<span class="feed-ok">ALL PROBES DESTROYED // PERIMETER CLEAR</span>`;
        onSuccess();
      }
    });
  });
}

// 7. O2: Clean Vent
function renderO2Task(container, feedEl, onSuccess) {
  let leavesLeft = 4;

  container.innerHTML = `
    <div class="filter-instruction">🍃 Click and eject the debris blocking the air circulation vent:</div>
    <div class="o2-vent-chute">
      <button class="o2-leaf" style="top:18%;left:22%;">🍂</button>
      <button class="o2-leaf" style="top:35%;left:68%;">🍂</button>
      <button class="o2-leaf" style="top:70%;left:34%;">🍂</button>
      <button class="o2-leaf" style="top:55%;left:78%;">🍂</button>
    </div>
  `;

  container.querySelectorAll(".o2-leaf").forEach((leaf) => {
    leaf.addEventListener("click", () => {
      leaf.style.transform = "translate(150px, -150px) rotate(45deg)";
      leaf.style.opacity = "0";
      leaf.disabled = true;
      sfx.splash();
      leavesLeft--;
      if (leavesLeft <= 0) {
        feedEl.innerHTML = `<span class="feed-ok">O2 CHUTE PURGED // VENTILATION RESTORED</span>`;
        onSuccess();
      }
    });
  });
}

// 8. Communications: Calibrate Frequency
function renderFrequencyTask(container, feedEl, onSuccess) {
  const target = 142.8;

  container.innerHTML = `
    <div class="filter-instruction">📡 Emergency Frequency: <b style="color:#00f5ff">${target} MHz</b></div>
    <div style="font-family:'JetBrains Mono';font-size:24px;text-align:center;color:#00ff88;margin:12px 0;">
      TUNED: <span id="freq-val">120.0</span> MHz
    </div>
    <input id="freq-slider" type="range" min="100" max="180" step="0.1" value="120" style="width:100%;">
  `;

  const slider = container.querySelector("#freq-slider");
  const valSpan = container.querySelector("#freq-val");

  slider.addEventListener("input", () => {
    const v = parseFloat(slider.value);
    valSpan.textContent = v.toFixed(1);
    if (Math.abs(v - target) < 0.3) {
      valSpan.style.color = "#00f5ff";
      valSpan.style.textShadow = "0 0 12px #00f5ff";
      feedEl.innerHTML = `<span class="feed-ok">FREQUENCY LOCKED // SATELLITE RELAY RESTORED</span>`;
      sfx.correct();
      slider.disabled = true;
      onSuccess();
    }
  });
}

// 9. Navigation: Chart Course
function renderChartTask(container, feedEl, onSuccess) {
  const points = [1, 2, 3, 4];
  let cur = 1;

  container.innerHTML = `
    <div class="filter-instruction">🗺️ Plot flight path: Click waypoints [ ALPHA -> BETA -> GAMMA -> DELTA ]:</div>
    <div class="nav-grid">
      <button class="nav-pt" data-pt="1" style="top:20%;left:15%;">ALPHA</button>
      <button class="nav-pt" data-pt="2" style="top:60%;left:38%;">BETA</button>
      <button class="nav-pt" data-pt="3" style="top:25%;left:65%;">GAMMA</button>
      <button class="nav-pt" data-pt="4" style="top:75%;left:82%;">DELTA</button>
    </div>
  `;

  container.querySelectorAll(".nav-pt").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.getAttribute("data-pt"), 10);
      if (p === cur) {
        btn.classList.add("nav-active");
        cur++;
        sfx.checkpoint();
        if (cur > 4) {
          feedEl.innerHTML = `<span class="feed-ok">COURSE PLOTTED // STEERING VECTOR LOCKED</span>`;
          onSuccess();
        }
      }
    });
  });
}

// 10. Engine: Timing Alignment
function renderTimingTask(container, feedEl, onSuccess) {
  container.innerHTML = `
    <div class="filter-instruction">⏱️ Click [LOCK ENGINE THROTTLE] when pointer is inside the GREEN SAFE BAND:</div>
    <div class="timing-track">
      <div class="timing-target">OPTIMAL [THRUST]</div>
      <div id="timing-pointer" class="timing-pointer"></div>
    </div>
    <button id="timing-btn" class="btn btn-big btn-accent" style="width:100%;margin-top:1.2rem;">LOCK ENGINE THROTTLE</button>
  `;

  const pointer = container.querySelector("#timing-pointer");
  const btn = container.querySelector("#timing-btn");

  let pos = 0, dir = 1, animId = 0, finished = false;

  function loop() {
    if (finished) return;
    pos += dir * 2.8;
    if (pos > 94) { pos = 94; dir = -1; }
    if (pos < 4) { pos = 4; dir = 1; }
    pointer.style.left = `${pos}%`;
    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  btn.addEventListener("click", () => {
    if (finished) return;
    if (pos >= 36 && pos <= 64) {
      finished = true;
      cancelAnimationFrame(animId);
      pointer.style.background = "#00ff88";
      pointer.style.boxShadow = "0 0 16px #00ff88";
      sfx.correct();
      onSuccess();
    } else {
      feedEl.innerHTML = `<span class="feed-err">❌ Throttle Misalignment! Re-calibrating...</span>`;
      sfx.wrong();
      setTimeout(() => feedEl.innerHTML = "", 800);
    }
  });
}

// 11. Security: CCTV Surveillance Decrypt
function renderCctvTask(container, feedEl, onSuccess) {
  const cams = [
    { id: "CAM-01: HALLWAY WEST", rogue: false },
    { id: "CAM-02: STORAGE BAY", rogue: false },
    { id: "CAM-03: ELECTRICAL [ANOMALY DETECTED]", rogue: true },
    { id: "CAM-04: CAFETERIA HUB", rogue: false },
  ];

  container.innerHTML = `
    <div class="filter-instruction">📹 Click the surveillance feed displaying the SECURITY ANOMALY:</div>
    <div class="cctv-grid">
      ${cams.map((c) => `
        <button class="cctv-screen" data-rogue="${c.rogue}">
          <span class="cctv-badge">● LIVE REC</span>
          <span class="cctv-title">${c.id}</span>
        </button>
      `).join("")}
    </div>
  `;

  container.querySelectorAll(".cctv-screen").forEach((btn) => {
    btn.addEventListener("click", () => {
      const isRogue = btn.getAttribute("data-rogue") === "true";
      if (isRogue) {
        btn.classList.add("quarantined");
        sfx.correct();
        feedEl.innerHTML = `<span class="feed-ok">ANOMALY ISOLATED // SECURITY FEED SECURED</span>`;
        onSuccess();
      } else {
        feedEl.innerHTML = `<span class="feed-err">❌ Normal feed. Look for the feed with active anomaly alert!</span>`;
        sfx.wrong();
      }
    });
  });
}

// 12. Cafeteria: Emergency Reboot (The Big Red Button!)
function renderRebootTask(container, feedEl, onSuccess) {
  container.innerHTML = `
    <div class="filter-instruction">🚨 EMERGENCY FACILITY OVERRIDE: Press the Red Emergency Button:</div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:18px;margin:18px 0;">
      <button id="btn-emergency-core" class="emergency-button">
        <span>EMERGENCY<br>REBOOT</span>
      </button>
    </div>
  `;

  const btn = container.querySelector("#btn-emergency-core");
  btn.addEventListener("click", () => {
    btn.classList.add("depressed");
    sfx.alarm();
    sfx.powerup();
    feedEl.innerHTML = `<span class="feed-ok">SYSTEM OVERRIDE ENGAGED // ALL SECTORS REBOOTED</span>`;
    onSuccess();
  });
}
