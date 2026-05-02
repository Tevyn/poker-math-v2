import { describe, it, expect } from "vitest";
import {
  buildDeck,
  formatCard,
  isValidHand,
  isValidHandPair,
  parseHand,
  randomHandPair,
  shuffle,
} from "./problem";

describe("buildDeck", () => {
  it("returns 52 unique cards", () => {
    const deck = buildDeck();
    expect(deck.length).toBe(52);
    const set = new Set(deck.map(formatCard));
    expect(set.size).toBe(52);
  });
});

describe("parseHand", () => {
  it("parses 'AsKs' into two cards", () => {
    const [c1, c2] = parseHand("AsKs");
    expect(c1).toEqual({ rank: "A", suit: "s" });
    expect(c2).toEqual({ rank: "K", suit: "s" });
  });
  it("throws on invalid rank", () => {
    expect(() => parseHand("XsKs")).toThrow();
  });
  it("throws on invalid suit", () => {
    expect(() => parseHand("AxKs")).toThrow();
  });
  it("throws on wrong length", () => {
    expect(() => parseHand("AKs")).toThrow();
  });
  it("throws on empty", () => {
    expect(() => parseHand("")).toThrow();
  });
});

describe("isValidHand", () => {
  it("accepts a valid hand", () => {
    expect(isValidHand("AsKs")).toBe(true);
  });
  it("rejects two identical cards", () => {
    expect(isValidHand("AsAs")).toBe(false);
  });
  it("rejects malformed input", () => {
    expect(isValidHand("garbage")).toBe(false);
  });
});

describe("isValidHandPair", () => {
  const cases: Array<[string, string, boolean, string]> = [
    ["AsKs", "QhQd", true, "no conflict"],
    ["AsKs", "AsQh", false, "shared As"],
    ["AsKs", "AsKs", false, "identical hand"],
    ["AsKs", "garbage", false, "invalid second hand"],
    ["", "QhQd", false, "empty first hand"],
  ];
  for (const [a, b, expected, label] of cases) {
    it(`${a || "<empty>"} vs ${b} → ${expected} (${label})`, () => {
      expect(isValidHandPair(a, b)).toBe(expected);
    });
  }
});

describe("randomHandPair", () => {
  it("never produces conflicting cards over 1000 trials", () => {
    for (let i = 0; i < 1000; i++) {
      const { a, b } = randomHandPair();
      expect(isValidHandPair(a, b)).toBe(true);
    }
  });
  it("advances when called twice with the same seeded RNG", () => {
    const seeded = (() => {
      let s = 1;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    })();
    const first = randomHandPair(seeded);
    const second = randomHandPair(seeded);
    expect(first).not.toEqual(second);
  });
});

describe("shuffle", () => {
  it("returns a permutation of the input", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
  it("does not mutate the input (immutability)", () => {
    const input = [1, 2, 3, 4, 5];
    const snapshot = [...input];
    shuffle(input);
    expect(input).toEqual(snapshot);
  });
  it("is deterministic given a fixed RNG", () => {
    const fixed = () => 0;
    const out1 = shuffle([1, 2, 3, 4, 5], fixed);
    const out2 = shuffle([1, 2, 3, 4, 5], fixed);
    expect(out1).toEqual(out2);
  });
});
