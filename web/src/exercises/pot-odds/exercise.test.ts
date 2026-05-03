import { describe, it, expect } from "vitest";
import { potOddsExercise } from "./exercise";
import { isValidPotOddsProblem } from "./problem";

describe("potOddsExercise — contract", () => {
  it("parseProblem accepts valid params", () => {
    const params = new URLSearchParams("pot=100&bet=50");
    expect(potOddsExercise.parseProblem(params)).toEqual({
      pot: 100,
      bet: 50,
    });
  });

  it("parseProblem returns null when params missing", () => {
    expect(potOddsExercise.parseProblem(new URLSearchParams())).toBeNull();
  });

  it("parseProblem rejects negative pot", () => {
    expect(
      potOddsExercise.parseProblem(new URLSearchParams("pot=-1&bet=50")),
    ).toBeNull();
  });

  it("parseProblem rejects non-numeric input", () => {
    expect(
      potOddsExercise.parseProblem(new URLSearchParams("pot=abc&bet=xyz")),
    ).toBeNull();
  });

  it("parseProblem rejects pot=0", () => {
    expect(
      potOddsExercise.parseProblem(new URLSearchParams("pot=0&bet=50")),
    ).toBeNull();
  });

  it("serialize → parse round-trips", () => {
    const original = { pot: 100, bet: 50 };
    const serialized = potOddsExercise.serializeProblem(original);
    const params = new URLSearchParams(serialized);
    expect(potOddsExercise.parseProblem(params)).toEqual(original);
  });

  it("generateProblem produces a valid problem", () => {
    for (let i = 0; i < 100; i++) {
      const p = potOddsExercise.generateProblem();
      expect(isValidPotOddsProblem(p)).toBe(true);
    }
  });

  it("problemKey is stable for the same problem", () => {
    expect(potOddsExercise.problemKey({ pot: 100, bet: 50 })).toBe("100|50");
  });

  it("computeTruth ignores the engine arg", () => {
    expect(potOddsExercise.computeTruth({ pot: 100, bet: 50 }, null)).toBe(
      25,
    );
  });

  it("formatValue formats with 1 decimal", () => {
    expect(potOddsExercise.formatValue(25)).toBe("25.0%");
  });
});
