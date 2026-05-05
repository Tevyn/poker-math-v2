import { describe, it, expect } from "vitest";
import {
  randomProblem,
  parseProblem,
  serializeProblem,
  problemKey,
  isValidProblem,
} from "./problem";
import { RANGES } from "@/data/rangeLibrary";

describe("randomProblem", () => {
  it("produces a valid problem over 200 trials", () => {
    for (let i = 0; i < 200; i++) {
      const p = randomProblem();
      expect(isValidProblem(p)).toBe(true);
    }
  });

  it("hero and board cards are all distinct", () => {
    for (let i = 0; i < 50; i++) {
      const p = randomProblem();
      const all = [...p.hero, ...p.board];
      expect(new Set(all).size).toBe(5);
    }
  });
});

describe("parse/serialize round-trip", () => {
  it("round-trips a fixture", () => {
    const fixture = randomProblem();
    const params = new URLSearchParams(serializeProblem(fixture));
    const parsed = parseProblem(params);
    expect(parsed).not.toBeNull();
    expect(problemKey(parsed!)).toBe(problemKey(fixture));
  });

  it("rejects missing fields", () => {
    expect(parseProblem(new URLSearchParams("hero=AsKs"))).toBeNull();
    expect(
      parseProblem(new URLSearchParams("hero=AsKs&range=btn_open")),
    ).toBeNull();
  });

  it("rejects malformed cards", () => {
    expect(
      parseProblem(
        new URLSearchParams("hero=ZzZz&range=btn_open&board=Kh7d2c"),
      ),
    ).toBeNull();
  });

  it("rejects unknown range id", () => {
    expect(
      parseProblem(
        new URLSearchParams("hero=AsKs&range=does_not_exist&board=Kh7d2c"),
      ),
    ).toBeNull();
  });

  it("rejects duplicate cards across hero and board", () => {
    expect(
      parseProblem(
        new URLSearchParams("hero=AsKs&range=btn_open&board=AsKh2d"),
      ),
    ).toBeNull();
  });

  it("accepts a known good fixture", () => {
    const knownRange = RANGES.find((r) => r.id === "btn_open");
    expect(knownRange).toBeDefined();
    const parsed = parseProblem(
      new URLSearchParams("hero=AsKs&range=btn_open&board=Kh7d2c"),
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.villainRangeId).toBe("btn_open");
  });
});
