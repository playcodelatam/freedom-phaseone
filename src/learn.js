// Learn zone (Khan-Academy-Kids style): a menu of early-learning subjects, each a
// short tap activity. Reuses the quiz modal and shared progress so stars/XP count
// toward the same level as every other mode.

import { getLearnQuestion } from "./questions.js";
import { createQuiz } from "./quiz.js";
import { createHud } from "./hud.js";
import { createProgress } from "./progress.js";
import { sfx, unlockAudio } from "./audio.js";

// Neural Academy — Cybersecurity learning modules.
// Each subject maps to a filtered question pool in questions.js
// via getLearnQuestion(subject, level, rng).

const SUBJECTS = [
  { key: "web",     emoji: "🌐", name: "Web Security",    desc: "SQLi · XSS · OWASP" },
  { key: "network", emoji: "🔌", name: "Network & Recon", desc: "Ports · Nmap · Protocols" },
  { key: "crypto",  emoji: "🔐", name: "Cryptography",    desc: "Hashes · TLS · Hex" },
  { key: "linux",   emoji: "🐧", name: "Linux CLI",       desc: "Privesc · Shells · FS" },
  { key: "binary",  emoji: "⚙️",  name: "Binary & Systems","desc": "BOF · ASLR · Registers" },
  { key: "ai",      emoji: "🤖", name: "AI Red Team",     desc: "Prompt Injection · LLMs" },
];
const ROUND = 8;

export function startLearn(onHome) {
  unlockAudio();
  const root = document.getElementById("learn");
  const quiz = createQuiz();
  const hud = createHud();
  const progress = createProgress();
  root.classList.remove("hidden");
  document.getElementById("btn-home")?.classList.remove("hidden");

  let aborted = false;
  showMenu();

  function showMenu() {
    document.getElementById("hud")?.classList.add("hidden");
    root.innerHTML = `
      <div class="learn-wrap">
        <h1 class="learn-title">🧠 Select Your Training Module</h1>
        <div class="learn-grid">
          ${SUBJECTS.map((s) => `<button class="learn-card" data-key="${s.key}"><span class="lc-emoji">${s.emoji}</span><span class="lc-name">${s.name}</span><span class="lc-desc">${s.desc}</span></button>`).join("")}
        </div>
        <div class="learn-foot">Clearance Level <b>${progress.info().level}</b></div>
      </div>`;
    root.querySelectorAll(".learn-card").forEach((b) => b.addEventListener("click", () => runSubject(b.dataset.key)));
  }

  async function runSubject(subject) {
    root.innerHTML = "";
    document.getElementById("hud")?.classList.remove("hidden");
    document.body.classList.remove("in-3d"); // hide the 3D control layer in this 2D mode
    document.getElementById("room-badge")?.classList.add("hidden");
    document.getElementById("btn-mute")?.classList.add("hidden");
    hud.setLevel(progress.info());
    hud.setCoins(0);

    let correct = 0;
    let streak = 0;
    for (let i = 0; i < ROUND && !aborted; i++) {
      const ok = await quiz.ask(getLearnQuestion(subject, Math.floor(i / 3)), { progress: i / ROUND });
      if (aborted) return;
      if (ok) {
        correct++;
        streak++;
        hud.addStar();
        sfx.correct();
        const r = progress.addXp(12);
        hud.setLevel(r.info);
        if (r.leveledUp) { hud.popLevel(); hud.showFlash(`Level ${r.level}! 🎉`, 1000); sfx.levelup(); }
        if (streak % 3 === 0) { hud.addStar(); hud.showFlash(`${streak} in a row! ⭐`, 900); }
      } else {
        streak = 0;
        sfx.wrong();
      }
      await sleep(300);
    }
    if (!aborted) showResult(subject, correct);
  }

  function showResult(subject, correct) {
    document.getElementById("hud")?.classList.add("hidden");
    const s = SUBJECTS.find((x) => x.key === subject);
    root.innerHTML = `
      <div class="learn-wrap">
        <div class="result-card">
          <div class="win-emoji">${correct >= 7 ? "🏆" : correct >= 4 ? "🎉" : "👍"}</div>
          <h2>${s.emoji} ${s.name}</h2>
          <p class="win-stars">You got <b>${correct} / ${ROUND}</b> right!<br>Level ${progress.info().level}</p>
          <div class="lobby-buttons">
            <button class="btn btn-big btn-accent" id="learn-again">Keep Learning</button>
            <button class="btn btn-big" id="learn-menu">Other Subjects</button>
          </div>
        </div>
      </div>`;
    sfx.win();
    root.querySelector("#learn-again").addEventListener("click", () => runSubject(subject));
    root.querySelector("#learn-menu").addEventListener("click", showMenu);
  }

  function destroy() {
    aborted = true;
    root.innerHTML = "";
    root.classList.add("hidden");
    document.getElementById("quiz")?.classList.add("hidden");
    document.getElementById("btn-home")?.classList.add("hidden");
  }

  return { destroy };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
