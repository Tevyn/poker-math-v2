import { describe, it, expect } from "vitest";
import { handVsRangeExercise } from "./exercise";
import type { HandVsRangeProblem } from "./problem";
import { getEngine } from "@/lib/engine";

const fixture: HandVsRangeProblem = {
  hero: ["As", "Ks"],
  villainRangeId: "btn_open",
  board: ["Kh", "7d", "2c"],
};

describe("handVsRangeExercise — contract", () => {
  it("type is hand-vs-range", () => {
    expect(handVsRangeExercise.type).toBe("hand-vs-range");
  });

  it("serialize → parse round-trips", () => {
    const serialized = handVsRangeExercise.serializeProblem(fixture);
    const params = new URLSearchParams(serialized);
    const parsed = handVsRangeExercise.parseProblem(params);
    expect(parsed).not.toBeNull();
    expect(handVsRangeExercise.problemKey(parsed!)).toBe(
      handVsRangeExercise.problemKey(fixture),
    );
  });

  it("parseProblem returns null when params are missing", () => {
    expect(
      handVsRangeExercise.parseProblem(new URLSearchParams()),
    ).toBeNull();
  });

  it("generateProblem produces a problem the same exercise can serialize+parse", () => {
    const p = handVsRangeExercise.generateProblem() as HandVsRangeProblem;
    const params = new URLSearchParams(
      handVsRangeExercise.serializeProblem(p),
    );
    expect(handVsRangeExercise.parseProblem(params)).not.toBeNull();
  });

  it("computeTruth returns null without an engine", () => {
    expect(handVsRangeExercise.computeTruth(fixture, null)).toBeNull();
  });

  it("computeTruth returns a finite percent with an engine", async () => {
    const engine = await getEngine();
    const truth = handVsRangeExercise.computeTruth(fixture, engine);
    expect(truth).not.toBeNull();
    expect(Number.isFinite(truth!)).toBe(true);
    expect(truth!).toBeGreaterThanOrEqual(0);
    expect(truth!).toBeLessThanOrEqual(100);
  });
});
