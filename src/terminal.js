// ExploitGym — Tactical Hacker CLI Terminal
// Emulation of a local cybersecurity shell for operatives in the 3D environment.
// Supports nmap reconnaissance, ping latency checks, /etc/passwd inspection,
// Base64/Hex decoding tools, and live CTF Flag verification & bounty claiming.
//
// Keybinding: ~ (Backquote) or floating [ >_ ] HUD button.

import { createProgress, getRank } from "./progress.js";
import * as profile from "./profile.js";
import { sfx } from "./audio.js";

const VALID_FLAGS = {
  "FLAG{R00T_ACCE55_GR4NTED}": { name: "Exploit Arena Root", bountyXp: 100, tokens: 20 },
  "FLAG{AIR_G4PPED_SUBN3T_P0WNED}": { name: "Latent Maze Air-Gap", bountyXp: 80, tokens: 15 },
  "FLAG{KILL_CH4IN_COMPLET3D}": { name: "Packet Lab Kill Chain", bountyXp: 60, tokens: 10 },
  "FLAG{LLM_J4ILBR3AK_PR0MPT_1NJ3CT}": { name: "Neural Academy Jailbreak", bountyXp: 75, tokens: 15 },
};

const CLAIMED_FLAGS_KEY = "eg_claimed_flags";

function getClaimedFlags() {
  try {
    return JSON.parse(localStorage.getItem(CLAIMED_FLAGS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveClaimedFlag(flag) {
  const claimed = getClaimedFlags();
  if (!claimed.includes(flag)) {
    claimed.push(flag);
    try {
      localStorage.setItem(CLAIMED_FLAGS_KEY, JSON.stringify(claimed));
    } catch {
      /* ignore */
    }
  }
}

export function createTerminal(opts = {}) {
  const progress = createProgress();

  // Create terminal DOM overlay
  const overlay = document.createElement("div");
  overlay.id = "terminal-overlay";
  overlay.className = "terminal-overlay hidden";
  overlay.innerHTML = `
    <div class="terminal-modal">
      <div class="terminal-header">
        <span class="term-title">⚡ EXPLOITGYM TACTICAL TERMINAL // CLI v1.2</span>
        <button id="term-close-btn" class="term-close">✕</button>
      </div>
      <div class="terminal-history" id="term-history">
        <div class="term-welcome">
          ExploitGym Red Team Operating System (RTOS) v4.9<br>
          Type '<span class="term-hl">help</span>' for available tactical commands.<br>
          Type '<span class="term-hl">scan</span>' to probe facility ports or '<span class="term-hl">flag &lt;code&gt;</span>' to claim CTF bounties.
        </div>
      </div>
      <div class="terminal-prompt-row">
        <span class="term-prompt-label">operative@exploitgym:~$</span>
        <input type="text" id="term-input" class="term-cli-input" autocomplete="off" spellcheck="false" />
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Floating trigger button in top-right or action cluster
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "btn-terminal-toggle";
  toggleBtn.className = "terminal-toggle-btn";
  toggleBtn.title = "Toggle Tactical Terminal (~ / Backquote)";
  toggleBtn.textContent = ">_";
  document.body.appendChild(toggleBtn);

  const historyEl = overlay.querySelector("#term-history");
  const inputEl = overlay.querySelector("#term-input");
  const closeBtn = overlay.querySelector("#term-close-btn");

  let isOpen = false;
  const cmdHistory = [];
  let historyIdx = -1;

  function appendLine(html, type = "") {
    const line = document.createElement("div");
    line.className = `term-out-line ${type}`;
    line.innerHTML = html;
    historyEl.appendChild(line);
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  function toggle(openState) {
    isOpen = openState !== undefined ? openState : !isOpen;
    if (isOpen) {
      overlay.classList.remove("hidden");
      inputEl.focus();
      if (opts.controls?.setEnabled) opts.controls.setEnabled(false);
    } else {
      overlay.classList.add("hidden");
      inputEl.blur();
      if (opts.controls?.setEnabled) opts.controls.setEnabled(true);
    }
  }

  function executeCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    cmdHistory.push(trimmed);
    historyIdx = cmdHistory.length;

    appendLine(`<span class="term-prompt-label">operative@exploitgym:~$</span> ${escapeHtml(trimmed)}`, "cmd");

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case "help":
        appendLine(`
          <b>AVAILABLE COMMANDS:</b><br>
          &nbsp;&nbsp;<span class="term-hl">help</span>                 - List available terminal commands<br>
          &nbsp;&nbsp;<span class="term-hl">whoami</span>               - Show operative credentials, clearance &amp; stats<br>
          &nbsp;&nbsp;<span class="term-hl">scan / nmap</span>          - Probe local facility subnets for open services<br>
          &nbsp;&nbsp;<span class="term-hl">ping &lt;target&gt;</span>         - Ping a network host or bot agent<br>
          &nbsp;&nbsp;<span class="term-hl">cat /etc/passwd</span>      - Inspect local user account configurations<br>
          &nbsp;&nbsp;<span class="term-hl">decode &lt;b64|hex&gt; &lt;str&gt;</span> - Decode Base64 or Hexadecimal strings<br>
          &nbsp;&nbsp;<span class="term-hl">flag &lt;FLAG{...}&gt;</span>    - Submit captured CTF flag to claim bounties<br>
          &nbsp;&nbsp;<span class="term-hl">clear</span>                - Clear terminal history buffer<br>
          &nbsp;&nbsp;<span class="term-hl">exit</span>                 - Close terminal session
        `);
        break;

      case "whoami": {
        const info = progress.info();
        const rank = getRank(info.level);
        const coins = profile.getCoins();
        const claimed = getClaimedFlags();
        appendLine(`
          <b>OPERATIVE IDENTITY PROFILE:</b><br>
          &nbsp;&nbsp;Handle:           <span class="term-cyan">Operative #${Math.abs(profile.getColor() % 9999)}</span><br>
          &nbsp;&nbsp;Clearance:        <span class="term-green">Tier ${info.level} [${rank.tag}]</span><br>
          &nbsp;&nbsp;Title:            <span class="term-amber">${rank.title}</span><br>
          &nbsp;&nbsp;Accumulated XP:   ${progress.getXp()} XP (${info.into}/${info.need} to next Tier)<br>
          &nbsp;&nbsp;Crypto Tokens:    ${coins} 🪙<br>
          &nbsp;&nbsp;Flags Claimed:    ${claimed.length} / ${Object.keys(VALID_FLAGS).length}
        `);
        break;
      }

      case "scan":
      case "nmap":
        appendLine(`<span class="term-cyan">Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toLocaleTimeString()}...</span>`);
        appendLine(`Scanning 192.168.1.0/24 [12 facility datacenter nodes]...`);
        setTimeout(() => {
          appendLine(`
            PORT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;STATE&nbsp;&nbsp;&nbsp;&nbsp;SERVICE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VERSION<br>
            21/tcp&nbsp;&nbsp;&nbsp;open&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ftp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vsftpd 3.0.3<br>
            22/tcp&nbsp;&nbsp;&nbsp;open&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ssh&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OpenSSH 9.2p1 Debian<br>
            80/tcp&nbsp;&nbsp;&nbsp;open&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;http&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nginx/1.22.1<br>
            443/tcp&nbsp;&nbsp;open&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ssl/https&nbsp;&nbsp;&nbsp;&nbsp;nginx/1.22.1 [TLSv1.3]<br>
            3306/tcp&nbsp;filtered&nbsp;mysql&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MySQL 8.0.35 [Protected]<br>
            8080/tcp&nbsp;open&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;http-proxy&nbsp;&nbsp;&nbsp;NodeJS/Express Internal API<br>
            <span class="term-green">Nmap done: 1 IP address (6 hosts up) scanned in 0.42 seconds.</span>
          `);
        }, 300);
        break;

      case "ping": {
        const target = args[0] || "core.local";
        appendLine(`PING ${escapeHtml(target)} (10.0.0.1) 56(84) bytes of data.`);
        appendLine(`64 bytes from 10.0.0.1: icmp_seq=1 ttl=64 time=1.42 ms`);
        appendLine(`64 bytes from 10.0.0.1: icmp_seq=2 ttl=64 time=1.18 ms`);
        appendLine(`64 bytes from 10.0.0.1: icmp_seq=3 ttl=64 time=1.25 ms`);
        appendLine(`--- ${escapeHtml(target)} ping statistics --- 3 packets transmitted, 3 received, 0% packet loss`);
        break;
      }

      case "cat":
        if (args[0] === "/etc/passwd") {
          appendLine(`
            root:x:0:0:root:/root:/bin/bash<br>
            daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin<br>
            operative:x:1001:1001:Operative,,,:/home/operative:/bin/bash<br>
            agent_cipher:x:1002:1002:Cipher Bot:/var/bots/cipher:/bin/sh<br>
            agent_sentinel:x:1003:1003:Sentinel Bot:/var/bots/sentinel:/bin/sh<br>
            guest:x:1004:1004:Guest Sandbox:/tmp:/usr/sbin/nologin
          `);
        } else {
          appendLine(`cat: ${escapeHtml(args[0] || "")}: No such file or permission denied`, "err");
        }
        break;

      case "decode": {
        const type = (args[0] || "").toLowerCase();
        const payload = args.slice(1).join(" ");
        if (!payload) {
          appendLine("Usage: decode &lt;b64|hex&gt; &lt;string&gt;", "err");
          break;
        }
        try {
          if (type === "b64" || type === "base64") {
            const decoded = atob(payload);
            appendLine(`DECODED BASE64: <span class="term-green">${escapeHtml(decoded)}</span>`);
          } else if (type === "hex") {
            const clean = payload.replace(/^0x/i, "").replace(/\s+/g, "");
            let res = "";
            for (let i = 0; i < clean.length; i += 2) {
              res += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
            }
            appendLine(`DECODED HEX: <span class="term-green">${escapeHtml(res)}</span>`);
          } else {
            appendLine("Invalid encoding type. Supported: b64, hex", "err");
          }
        } catch {
          appendLine("Decoding error: Malformed payload encoding", "err");
        }
        break;
      }

      case "flag": {
        const candidate = args[0] || "";
        const entry = VALID_FLAGS[candidate];
        const claimed = getClaimedFlags();

        if (!entry) {
          appendLine(`❌ INVALID FLAG SUBMISSION. Verify syntax: <code>FLAG{...}</code>`, "err");
          sfx.wrong();
        } else if (claimed.includes(candidate)) {
          appendLine(`⚠️ FLAG ALREADY REDEEMED: "${entry.name}" was already claimed on this machine.`, "warn");
        } else {
          saveClaimedFlag(candidate);
          progress.addXp(entry.bountyXp);
          profile.addCoins(entry.tokens);
          sfx.win();
          appendLine(`
            <span class="term-green">🎉 FLAG ACCEPTED: [${entry.name}]!</span><br>
            Bounty Awarded: +${entry.bountyXp} Clearance XP | +${entry.tokens} Crypto Tokens 🪙<br>
            Current Clearance: Tier ${progress.info().level} (${getRank(progress.info().level).title})
          `, "success");
        }
        break;
      }

      case "clear":
        historyEl.innerHTML = "";
        break;

      case "exit":
      case "quit":
        toggle(false);
        break;

      default:
        appendLine(`bash: command not found: ${escapeHtml(cmd)}. Type '<span class="term-hl">help</span>' for options.`, "err");
        break;
    }
  }

  // Keyboard navigation & listeners
  function onKeyDown(e) {
    // ~ / Backquote toggles terminal
    if (e.code === "Backquote") {
      e.preventDefault();
      toggle();
      return;
    }

    if (!isOpen) return;

    if (e.key === "Escape") {
      e.preventDefault();
      toggle(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const val = inputEl.value;
      inputEl.value = "";
      executeCommand(val);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIdx > 0) {
        historyIdx--;
        inputEl.value = cmdHistory[historyIdx] || "";
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx < cmdHistory.length - 1) {
        historyIdx++;
        inputEl.value = cmdHistory[historyIdx] || "";
      } else {
        historyIdx = cmdHistory.length;
        inputEl.value = "";
      }
    }
  }

  window.addEventListener("keydown", onKeyDown);
  toggleBtn.addEventListener("click", () => toggle());
  closeBtn.addEventListener("click", () => toggle(false));

  function destroy() {
    window.removeEventListener("keydown", onKeyDown);
    overlay.remove();
    toggleBtn.remove();
  }

  return { toggle, isOpen: () => isOpen, destroy, executeCommand };
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
