import { describe, it, expect } from "vitest";
import {
  RANGES,
  HERO_HAND_POOL,
  getRangeById,
  rangeToEngineString,
} from "./rangeLibrary";

describe("RANGES", () => {
  it("loads at least 20 ranges", () => {
    expect(RANGES.length).toBeGreaterThanOrEqual(20);
  });
  it("every range has a non-empty hand set", () => {
    for (const r of RANGES) {
      expect(r.hands.size).toBeGreaterThan(0);
    }
  });
  it("ids are unique", () => {
    const ids = new Set(RANGES.map((r) => r.id));
    expect(ids.size).toBe(RANGES.length);
  });
});

describe("HERO_HAND_POOL", () => {
  it("includes premium hands", () => {
    expect(HERO_HAND_POOL).toContain("AA");
    expect(HERO_HAND_POOL).toContain("AKs");
    expect(HERO_HAND_POOL).toContain("AKo");
  });
  it("never duplicates", () => {
    expect(new Set(HERO_HAND_POOL).size).toBe(HERO_HAND_POOL.length);
  });
  it("is a subset of valid hand-class space (≤ 169)", () => {
    expect(HERO_HAND_POOL.length).toBeLessThanOrEqual(169);
  });
});

describe("getRangeById / rangeToEngineString", () => {
  it("looks up a known range and joins hand classes with commas", () => {
    const r = RANGES[0];
    expect(getRangeById(r.id)).toBe(r);
    const engineStr = rangeToEngineString(r);
    expect(engineStr).toContain(",");
    expect(engineStr.split(",").length).toBe(r.hands.size);
  });
  it("returns undefined for an unknown id", () => {
    expect(getRangeById("does_not_exist")).toBeUndefined();
  });
});
