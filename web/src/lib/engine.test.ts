import { describe, it, expect } from "vitest";
import { getEngine } from "./engine";

describe("getEngine", () => {
  it("returns the same promise on parallel calls", async () => {
    const [a, b] = await Promise.all([getEngine(), getEngine()]);
    expect(a).toBe(b);
  });
});

describe("EngineApi.equityVs", () => {
  it("returns ~0.81 for AsAh vs KsKh", async () => {
    const api = await getEngine();
    const eq = api.equityVs("AsAh", "KsKh");
    expect(eq).toBeGreaterThan(0.80);
    expect(eq).toBeLessThan(0.83);
  });

  it("returns ~0.46 for AsKs vs QhQd", async () => {
    const api = await getEngine();
    const eq = api.equityVs("AsKs", "QhQd");
    expect(eq).toBeGreaterThan(0.45);
    expect(eq).toBeLessThan(0.47);
  });

  it("throws on garbage input", async () => {
    const api = await getEngine();
    expect(() => api.equityVs("garbage", "AsKs")).toThrow();
  });

  it("throws when hands share a card", async () => {
    const api = await getEngine();
    expect(() => api.equityVs("AsKs", "AsQh")).toThrow();
  });
});

describe("EngineApi.equityVsRangeFlop", () => {
  it("returns a finite number in [0, 1] for AKs vs premium pairs on a K-high flop", async () => {
    const api = await getEngine();
    const eq = api.equityVsRangeFlop("AsKs", "AA,KK,QQ,JJ,TT", "Kh7d2c");
    expect(Number.isFinite(eq)).toBe(true);
    expect(eq).toBeGreaterThanOrEqual(0);
    expect(eq).toBeLessThanOrEqual(1);
  });

  it("throws on garbage hero combo", async () => {
    const api = await getEngine();
    expect(() => api.equityVsRangeFlop("garbage", "AA", "Kh7d2c")).toThrow();
  });

  it("throws when hero combo conflicts with the board", async () => {
    const api = await getEngine();
    expect(() => api.equityVsRangeFlop("AsKs", "QQ", "AsKh2d")).toThrow();
  });
});

// Reference range-vs-range equities from cardfight.com and standard
// preflop charts. equityVs accepts pokers range strings, so passing
// "AKs"/"QQ" gives the canonical, suit-averaged number.
describe("canonical preflop equity references", () => {
  const cases: Array<[string, string, number, string]> = [
    ["AKs", "QQ", 0.4605, "cardfight: 46.05%"],
    ["AA", "KK", 0.8195, "cardfight: 81.95%"],
    ["AKo", "QQ", 0.4324, "standard chart: 43.24%"],
    ["AKs", "22", 0.4989, "race ~ 50%"],
  ];

  for (const [a, b, expected, source] of cases) {
    it(`${a} vs ${b} ≈ ${(expected * 100).toFixed(2)}% (${source})`, async () => {
      const api = await getEngine();
      const eq = api.equityVs(a, b);
      expect(Math.abs(eq - expected)).toBeLessThan(0.001);
    });
  }
});
