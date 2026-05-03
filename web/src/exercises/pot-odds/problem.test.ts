import { describe, it, expect } from "vitest";
import {
  requiredEquity,
  randomPotOdds,
  isValidPotOddsProblem,
} from "./problem";

describe("requiredEquity", () => {
  const cases: Array<[number, number, number, string]> = [
    [100, 50, 25, "$50 into $100 → 25%"],
    [100, 100, 33.33, "pot-sized bet → 33%"],
    [100, 25, 16.67, "1/4 pot → ~17%"],
    [50, 50, 33.33, "half-stack call"],
    [200, 100, 25, "scale invariance"],
  ];
  for (const [pot, bet, expected, label] of cases) {
    it(`${label}: pot=${pot}, bet=${bet} → ${expected.toFixed(2)}%`, () => {
      expect(requiredEquity({ pot, bet })).toBeCloseTo(expected, 1);
    });
  }
});

describe("randomPotOdds", () => {
  it("produces valid problems over 1000 trials", () => {
    for (let i = 0; i < 1000; i++) {
      const p = randomPotOdds();
      expect(isValidPotOddsProblem(p)).toBe(true);
      expect(p.pot).toBeGreaterThan(0);
      expect(p.bet).toBeGreaterThan(0);
    }
  });
  it("spreads required equity across the axis (not clustered)", () => {
    const samples: number[] = [];
    for (let i = 0; i < 200; i++) samples.push(requiredEquity(randomPotOdds()));
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    expect(max - min).toBeGreaterThan(20);
  });
});

describe("isValidPotOddsProblem", () => {
  it("rejects garbage", () => {
    expect(isValidPotOddsProblem({})).toBe(false);
    expect(isValidPotOddsProblem({ pot: -1, bet: 50 })).toBe(false);
    expect(isValidPotOddsProblem({ pot: 100 })).toBe(false);
    expect(isValidPotOddsProblem(null)).toBe(false);
    expect(isValidPotOddsProblem("100,50")).toBe(false);
  });
});
