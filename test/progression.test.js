import { describe, it, expect, beforeEach } from "vitest";
import { createProgress, getRank, RANKS } from "../src/progress.js";
import { getCoins, addCoins, spendCoins } from "../src/profile.js";

// Mock localStorage for Node.js test environment
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};

describe("Cybersecurity Ranks & Progression", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("RANKS list contains 7 security tiers with title, tag, and color", () => {
    expect(RANKS.length).toBe(7);
    for (const r of RANKS) {
      expect(typeof r.level).toBe("number");
      expect(typeof r.title).toBe("string");
      expect(typeof r.tag).toBe("string");
      expect(typeof r.color).toBe("string");
    }
  });

  it("getRank correctly maps level to cybersecurity title", () => {
    expect(getRank(1).title).toBe("Script Kiddie");
    expect(getRank(2).title).toBe("Cyber Analyst");
    expect(getRank(3).title).toBe("Penetration Tester");
    expect(getRank(4).title).toBe("Threat Hunter");
    expect(getRank(5).title).toBe("Exploit Developer");
    expect(getRank(6).title).toBe("Security Researcher");
    expect(getRank(7).title).toBe("Zero-Day Master");
    expect(getRank(10).title).toBe("Zero-Day Master"); // Clamps to highest tier
  });

  it("createProgress calculates level, fractional progress, and rank metadata", () => {
    const p = createProgress();
    expect(p.getXp()).toBe(0);
    expect(p.info().level).toBe(1);
    expect(p.info().rank.tag).toBe("NOOB");

    const res = p.addXp(120);
    expect(res.leveledUp).toBe(true);
    expect(res.level).toBe(2);
    expect(res.info.rank.title).toBe("Cyber Analyst");
  });
});

describe("Profile Wallet & Atomic Spending", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds and spends coins correctly", () => {
    expect(getCoins()).toBe(0);
    addCoins(50);
    expect(getCoins()).toBe(50);

    const spent = spendCoins(20);
    expect(spent).toBe(true);
    expect(getCoins()).toBe(30);
  });

  it("rejects overspending and non-positive values", () => {
    addCoins(10);
    expect(spendCoins(25)).toBe(false);
    expect(getCoins()).toBe(10); // Balance unchanged

    expect(spendCoins(0)).toBe(false);
    expect(spendCoins(-5)).toBe(false);
    expect(getCoins()).toBe(10);
  });
});
