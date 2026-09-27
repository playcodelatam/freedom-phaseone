// ExploitGym — Exploit Terminal Modal
// Owns the challenge modal UI. `ask(question, opts)` presents a
// cybersecurity challenge inside a terminal-styled overlay,
// shows the correct/wrong feedback with hacker-tone status lines,
// and resolves true/false when the operative makes their call.
// Knows nothing about the 3D world — pure UI contract.

// Hacker status glyphs that rotate per question
const STATUS_ICONS = ["⚡", "💀", "🔓", "🛡️", "🔴", "⚠️"];
const CORRECT_MSGS = [
  "ACCESS GRANTED — EXPLOIT SUCCESSFUL",
  "ROOT PRIVILEGES OBTAINED",
  "PAYLOAD EXECUTED — TARGET COMPROMISED",
  "FIREWALL BYPASSED — SHELL ACQUIRED",
  "AUTHENTICATION BYPASSED ✓",
  "ZERO-DAY TRIGGERED — MOVING LATERALLY",
];
const WRONG_MSGS = [
  "PAYLOAD BLOCKED BY WAF",
  "INTRUSION DETECTED — RESETTING...",
  "SYNTAX ERROR — PATCH YOUR EXPLOIT",
  "HONEYPOT TRIGGERED — ABORT ABORT",
  "IDS ALERT: ATTACK SIGNATURE MATCHED",
  "SANDBOX DETECTED — PAYLOAD TERMINATED",
];

export function createQuiz() {
  const root       = document.getElementById("quiz");
  const topicEl    = document.getElementById("quiz-topic");
  const pictureEl  = document.getElementById("quiz-picture");
  const promptEl   = document.getElementById("quiz-prompt");
  const choicesEl  = document.getElementById("quiz-choices");
  const feedbackEl = document.getElementById("quiz-feedback");
  const mascotEl   = document.getElementById("quiz-mascot");
  const progressFill = document.getElementById("quiz-progress-fill");

  let iconIdx = 0;

  function ask(question, opts = {}) {
    return new Promise((resolve) => {
      // ---- header ----
      topicEl.textContent = `[${question.topic.toUpperCase()}]`;

      // picture field: used for icon / code block display
      if (question.picture) {
        const n = question.picCount || 1;
        pictureEl.textContent = question.picture.repeat(n);
      } else {
        pictureEl.textContent = "";
      }

      promptEl.textContent = question.prompt;
      feedbackEl.textContent = "";
      feedbackEl.className = "quiz-feedback";
      choicesEl.innerHTML = "";

      // Rotating status glyph instead of animal mascot
      mascotEl.textContent = STATUS_ICONS[iconIdx++ % STATUS_ICONS.length];

      // Progress bar
      if (progressFill) {
        progressFill.style.width = `${Math.round((opts.progress || 0) * 100)}%`;
      }

      // ---- render answer buttons ----
      question.choices.forEach((choice, i) => {
        const btn = document.createElement("button");
        btn.className = "choice" + (question.choiceEmoji ? " emoji" : "");
        btn.textContent = choice;
        btn.addEventListener("click", () => pick(i, btn));
        choicesEl.appendChild(btn);
      });

      root.classList.remove("hidden");

      // Dev hook (stripped in production build)
      if (import.meta.env.DEV) {
        window.__bbQuiz = { choices: question.choices, correctIndex: question.correctIndex };
      }

      function pick(i, btn) {
        const buttons = [...choicesEl.querySelectorAll(".choice")];
        buttons.forEach((b) => (b.disabled = true));
        const correct = i === question.correctIndex;

        if (correct) {
          btn.classList.add("correct");
          feedbackEl.textContent = CORRECT_MSGS[iconIdx % CORRECT_MSGS.length];
          feedbackEl.className = "quiz-feedback good";
          mascotEl.textContent = "🔓";
          setTimeout(() => finish(true), 850);
        } else {
          btn.classList.add("wrong");
          buttons[question.correctIndex].classList.add("correct");
          feedbackEl.textContent = WRONG_MSGS[iconIdx % WRONG_MSGS.length];
          feedbackEl.className = "quiz-feedback bad";
          mascotEl.textContent = "🚨";
          setTimeout(() => finish(false), 1350);
        }
      }

      function finish(result) {
        root.classList.add("hidden");
        resolve(result);
      }
    });
  }

  return { ask, isOpen: () => !root.classList.contains("hidden") };
}
