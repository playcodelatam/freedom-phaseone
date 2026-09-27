// ExploitGym — CTF Terminal: Rapid Exploits & Incident Simulator
// A high-intensity speed round: 10 consecutive threat alerts and exploit puzzles.
// Correct countermeasures earn bounties, crypto tokens, XP, and streak bonuses.
// Returns { destroy } and calls onHome() to return to the SOC Hub.

import "./style.css";
import { getQuestion } from "./questions.js";
import { createQuiz } from "./quiz.js";
import { createHud } from "./hud.js";
import { createProgress } from "./progress.js";
import { sfx, unlockAudio } from "./audio.js";

const TOTAL = 10;

export function startArcade(onHome) {
  unlockAudio();
  const arcade = document.getElementById("arcade");
  const hud = createHud();
  const quiz = createQuiz();
  const progress = createProgress();

  arcade.classList.remove("hidden");
  document.getElementById("hud").classList.remove("hidden");
  document.body.classList.remove("in-3d");
  document.getElementById("room-badge")?.classList.add("hidden");
  document.getElementById("btn-mute")?.classList.add("hidden");
  document.getElementById("btn-home")?.classList.remove("hidden");

  hud.setLevel(progress.info());
  hud.setCoins(0);

  const qEl = document.getElementById("arcade-q");
  const totalEl = document.getElementById("arcade-total");
  const result = document.getElementById("arcade-result");
  const head = arcade.querySelector(".arcade-head");
  totalEl.textContent = String(TOTAL);
  head.classList.remove("hidden");
  result.classList.add("hidden");

  let stars = 0, coins = 0, streak = 0, aborted = false;

  function awardXp(amount) {
    const res = progress.addXp(amount);
    hud.setLevel(res.info);
    if (res.leveledUp) {
      hud.popLevel();
      hud.showFlash(`Clearance Level ${res.level}! 🔓`, 1100);
      sfx.levelup();
    }
  }

  async function run() {
    let correctCount = 0;
    for (let i = 0; i < TOTAL && !aborted; i++) {
      qEl.textContent = String(i + 1);
      // Difficulty scales: first 3 questions are level 0, next 4 are level 1, final 3 are level 2+
      const qLevel = i < 3 ? 0 : i < 7 ? 1 : 2;
      const correct = await quiz.ask(getQuestion(qLevel), { progress: i / TOTAL });
      if (aborted) return;

      if (correct) {
        correctCount++;
        streak++;
        stars++;
        coins += 2;
        hud.addStar();
        hud.setCoins(coins);
        sfx.correct();
        awardXp(15);

        if (streak % 3 === 0) {
          stars++;
          hud.addStar();
          awardXp(15);
          hud.showFlash(`⚡ ${streak} STREAK: MULTI-EXPLOIT BONUS!`, 1100);
        }
      } else {
        streak = 0;
        sfx.wrong();
      }
      await sleep(350);
    }
    if (!aborted) showResult(correctCount);
  }

  function showResult(correctCount) {
    head.classList.add("hidden");
    const emoji = correctCount >= 9 ? "🏆" : correctCount >= 6 ? "🛡️" : "⚠️";
    const title = correctCount >= 9 ? "ZERO-DAY ELITE: PERFECT DRILL" : correctCount >= 6 ? "INCIDENT CONTAINMENT SUCCESS" : "VULNERABILITIES UNPATCHED";

    document.getElementById("arcade-result-emoji").textContent = emoji;
    document.getElementById("arcade-result-title").textContent = title;
    document.getElementById("arcade-result-sub").innerHTML =
      `Countermeasures executed: <b>${correctCount} / ${TOTAL}</b><br>` +
      `⭐ ${stars} Bounties Claimed · 🪙 ${coins} Crypto Tokens · Clearance Level ${progress.info().level}`;

    result.classList.remove("hidden");
    sfx.win();
  }

  const againBtn = document.getElementById("btn-arcade-again");
  const menuBtn = document.getElementById("btn-arcade-menu");
  const onAgain = () => {
    result.classList.add("hidden");
    head.classList.remove("hidden");
    stars = 0;
    coins = 0;
    streak = 0;
    hud.setStars(0);
    hud.setCoins(0);
    run();
  };
  const onMenu = () => onHome();
  againBtn.addEventListener("click", onAgain);
  menuBtn.addEventListener("click", onMenu);

  run();

  function destroy() {
    aborted = true;
    againBtn.removeEventListener("click", onAgain);
    menuBtn.removeEventListener("click", onMenu);
    arcade.classList.add("hidden");
    result.classList.add("hidden");
    document.getElementById("quiz")?.classList.add("hidden");
    document.getElementById("btn-home")?.classList.add("hidden");
  }

  return { destroy };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
