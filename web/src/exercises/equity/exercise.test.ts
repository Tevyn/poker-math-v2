import { describe, it, expect } from "vitest";
import { equityExercise } from "./exercise";
import { isValidHandPair } from "./problem";
import { getEngine } from "@/lib/engine";

describe("equityExercise — contract", () => {
  it("parseProblem accepts a valid pair", () => {
    const params = new URLSearchParams("a=AsKs&b=QhQd");
    expect(equityExercise.parseProblem(params)).toEqual({
      a: "AsKs",
      b: "QhQd",
    });
  });

  it("parseProblem returns null for an invalid pair", () => {
    const params = new URLSearchParams("a=AsKs&b=AsKs");
    expect(equityExercise.parseProblem(params)).toBeNull();
  });

  it("parseProblem returns null when params are missing", () => {
    expect(equityExercise.parseProblem(new URLSearchParams())).toBeNull();
  });

  it("serialize → parse round-trips", () => {
    const original = { a: "AsKs", b: "QhQd" };
    const serialized = equityExercise.serializeProblem(original);
    const params = new URLSearchParams(serialized);
    expect(equityExercise.parseProblem(params)).toEqual(original);
  });

  it("generateProblem produces a valid pair", () => {
    for (let i = 0; i < 100; i++) {
      const p = equityExercise.generateProblem();
      expect(isValidHandPair(p.a, p.b)).toBe(true);
    }
  });

  it("problemKey is stable for the same problem", () => {
    expect(equityExercise.problemKey({ a: "AsKs", b: "QhQd" })).toBe(
      "AsKs|QhQd",
    );
  });

  it("computeTruth returns null without an engine", () => {
    expect(
      equityExercise.computeTruth({ a: "AsKs", b: "QhQd" }, null),
    ).toBeNull();
  });

  it("computeTruth returns a valid percent with an engine", async () => {
    const engine = await getEngine();
    const truth = equityExercise.computeTruth(
      { a: "AsKs", b: "QhQd" },
      engine,
    );
    expect(truth).not.toBeNull();
    expect(truth!).toBeGreaterThanOrEqual(0);
    expect(truth!).toBeLessThanOrEqual(100);
  });
});
