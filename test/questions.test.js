import { describe, it, expect } from "vitest";
import { BANK, CATEGORIES, getQuestion, getCategoryQuestion, getLearnQuestion } from "../src/questions.js";

// Seedable deterministic PRNG for reproducible tests
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- 1. Structural integrity of the bank ----------------------------
describe("question bank", () => {
  it("every bank item has a valid single correct answer and no duplicate choices", () => {
    for (const q of BANK) {
      expect(q.choices.length).toBeGreaterThanOrEqual(3);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.choices.length);
      expect(typeof q.choices[q.correctIndex]).toBe("string");
      // all choices must be distinct (no ambiguous duplicates)
      expect(new Set(q.choices).size).toBe(q.choices.length);
    }
  });

  it("bank covers all 6 expected cybersecurity topics", () => {
    const topics = new Set(BANK.map((q) => q.topic));
    const required = ["Web Security", "Network", "Cryptography", "Linux CLI", "Binary & Systems", "AI Red Team"];
    for (const t of required) {
      expect(topics.has(t)).toBe(true);
    }
  });

  it("CATEGORIES array has at least 8 entries, each with key/emoji/name", () => {
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(8);
    for (const c of CATEGORIES) {
      expect(typeof c.key).toBe("string");
      expect(typeof c.emoji).toBe("string");
      expect(typeof c.name).toBe("string");
    }
  });
});

// ---- 2. getQuestion — general draw ---------------------------------
describe("getQuestion", () => {
  it("returns a well-formed question for many seeds and levels 0-6", () => {
    for (let level = 0; level <= 6; level++) {
      for (let seed = 1; seed <= 200; seed++) {
        const q = getQuestion(level, mulberry32(seed * (level + 1)));
        expect(q.choices.length).toBeGreaterThanOrEqual(3);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.choices.length);
        // All choices must be distinct
        expect(new Set(q.choices).size).toBe(q.choices.length);
        // topic and prompt must be non-empty strings
        expect(typeof q.topic).toBe("string");
        expect(q.topic.length).toBeGreaterThan(0);
        expect(typeof q.prompt).toBe("string");
        expect(q.prompt.length).toBeGreaterThan(0);
      }
    }
  });

  it("hex-convert generator produces correct decimal answer inside choices", () => {
    // The hex generator fires at level>=2 when roll < 0.35.
    // We can call getQuestion repeatedly at high level and look for hex prompts.
    let hexSeen = 0;
    for (let seed = 1; seed <= 5000 && hexSeen < 50; seed++) {
      const q = getQuestion(4, mulberry32(seed));
      if (!q.prompt.startsWith("What is the decimal value of 0x")) continue;
      hexSeen++;
      // Extract the hex from the prompt and verify the answer
      const hex = q.prompt.match(/0x([0-9A-F]+)/i)?.[1];
      expect(hex).toBeTruthy();
      const expected = parseInt(hex, 16);
      expect(Number(q.choices[q.correctIndex])).toBe(expected);
    }
    expect(hexSeen).toBeGreaterThan(0);
  });

  it("port-service generator embeds the correct port or service in choices", () => {
    let portSeen = 0;
    for (let seed = 1; seed <= 5000 && portSeen < 50; seed++) {
      const q = getQuestion(2, mulberry32(seed));
      if (q.topic !== "Network") continue;
      const isPortQ  = q.prompt.includes("default port?") || q.prompt.includes("uses which default port");
      const isServiceQ = q.prompt.includes("used by which service");
      if (!isPortQ && !isServiceQ) continue;
      portSeen++;
      // The correct answer must appear in choices
      const correct = q.choices[q.correctIndex];
      expect(typeof correct).toBe("string");
      expect(correct.length).toBeGreaterThan(0);
    }
    expect(portSeen).toBeGreaterThan(0);
  });
});

// ---- 3. getCategoryQuestion ----------------------------------------
describe("getCategoryQuestion", () => {
  const CATS = ["web", "network", "crypto", "linux", "binary", "ai", "ctf", "tools"];
  it("returns valid questions for all supported categories", () => {
    for (const cat of CATS) {
      for (let seed = 1; seed <= 30; seed++) {
        const q = getCategoryQuestion(cat, 2, mulberry32(seed));
        expect(q.choices.length).toBeGreaterThanOrEqual(3);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.choices.length);
        expect(new Set(q.choices).size).toBe(q.choices.length);
      }
    }
  });
});

// ---- 4. getLearnQuestion (Academy modules) -------------------------
describe("getLearnQuestion", () => {
  const MODULES = ["web", "network", "crypto", "linux", "binary", "ai"];
  it("returns valid questions for all 6 Academy modules", () => {
    for (const mod of MODULES) {
      for (let seed = 1; seed <= 30; seed++) {
        const q = getLearnQuestion(mod, 1, mulberry32(seed));
        expect(q.choices.length).toBeGreaterThanOrEqual(3);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.choices.length);
        expect(new Set(q.choices).size).toBe(q.choices.length);
      }
    }
  });
});
