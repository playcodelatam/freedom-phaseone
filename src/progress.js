// ExploitGym — Player Progression & Clearance Tiers
// Tracks persistent operative XP, clearance levels, and security ranks (localStorage).
// Earned from exploit challenges, packet re-assembly, incident containment, and flag capture.

const KEY = "bb_xp";

export const RANKS = [
  { level: 1, title: "Script Kiddie", tag: "NOOB", color: "#94a3b8" },
  { level: 2, title: "Cyber Analyst", tag: "SOC-1", color: "#38bdf8" },
  { level: 3, title: "Penetration Tester", tag: "PENTEST", color: "#00f5ff" },
  { level: 4, title: "Threat Hunter", tag: "HUNTER", color: "#00ff88" },
  { level: 5, title: "Exploit Developer", tag: "EXP-DEV", color: "#f59e0b" },
  { level: 6, title: "Security Researcher", tag: "RECON", color: "#a855f7" },
  { level: 7, title: "Zero-Day Master", tag: "0-DAY", color: "#ff0055" },
];

export function getRank(level) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].level) return RANKS[i];
  }
  return RANKS[0];
}

function levelInfo(totalXp) {
  let level = 1;
  let acc = 0;
  let need = 100; // xp from tier 1 -> 2
  while (totalXp >= acc + need) {
    acc += need;
    level++;
    need = 50 + level * 50; // 2->3 needs 150, 3->4 needs 200, ...
  }
  const into = totalXp - acc;
  const rank = getRank(level);
  return { level, into, need, frac: Math.max(0, Math.min(1, into / need)), rank };
}

export function createProgress() {
  let xp = Number(localStorage.getItem(KEY) || 0) || 0;

  function info() {
    return levelInfo(xp);
  }

  // add XP; returns { leveledUp, level, info }
  function addXp(amount) {
    const before = levelInfo(xp).level;
    xp += amount;
    try {
      localStorage.setItem(KEY, String(xp));
    } catch {
      /* storage may be unavailable - fine, just no persistence */
    }
    const now = levelInfo(xp);
    return { leveledUp: now.level > before, level: now.level, info: now };
  }

  return { addXp, info, getXp: () => xp };
}
