import { describe, it, expect } from "vitest";
import { expandHandClassToCombos, ALL_CARDS } from "./handClass";

describe("expandHandClassToCombos", () => {
  it("AA produces 6 unique combos", () => {
    const combos = expandHandClassToCombos("AA");
    expect(combos.length).toBe(6);
    expect(new Set(combos).size).toBe(6);
  });

  it("AKs produces 4 combos all same-suit", () => {
    const combos = expandHandClassToCombos("AKs");
    expect(combos.length).toBe(4);
    for (const c of combos) {
      expect(c[1]).toBe(c[3]); // suit of A === suit of K
    }
  });

  it("AKo produces 12 combos all different-suit", () => {
    const combos = expandHandClassToCombos("AKo");
    expect(combos.length).toBe(12);
    for (const c of combos) {
      expect(c[1]).not.toBe(c[3]);
    }
  });

  it("rejects garbage", () => {
    expect(() => expandHandClassToCombos("AKz")).toThrow();
    expect(() => expandHandClassToCombos("XX")).toThrow();
    expect(() => expandHandClassToCombos("")).toThrow();
    expect(() => expandHandClassToCombos("AAAA")).toThrow();
  });
});

describe("ALL_CARDS", () => {
  it("has 52 unique cards", () => {
    expect(ALL_CARDS.length).toBe(52);
    expect(new Set(ALL_CARDS).size).toBe(52);
  });
});
