import type { Exercise } from "../types";
import { isValidHandPair, randomHandPair, type HandPair } from "./problem";
import { EquityStage } from "./EquityStage";

const EQUITY_TOLERANCE = 10;
const EQUITY_ANCHORS: readonly number[] = [0, 20, 40, 60, 80, 100];

export const equityExercise: Exercise<HandPair> = {
  type: "equity",
  prompt: "What's the equity of Hand A?",
  tooltipLabel: "Actual Equity",
  barPrompt: "drag to estimate equity",
  tolerance: EQUITY_TOLERANCE,
  axisAnchors: EQUITY_ANCHORS,
  formatValue: (n) => `${n.toFixed(1)}%`,
  generateProblem: (rng) => randomHandPair(rng),
  parseProblem: (params) => {
    const a = params.get("a") ?? "";
    const b = params.get("b") ?? "";
    return isValidHandPair(a, b) ? { a, b } : null;
  },
  serializeProblem: (p) => ({ a: p.a, b: p.b }),
  problemKey: (p) => `${p.a}|${p.b}`,
  computeTruth: (p, engine) => {
    if (engine === null) return null;
    try {
      return engine.equityVs(p.a, p.b) * 100;
    } catch {
      return null;
    }
  },
  Stage: EquityStage,
};
