import type { Exercise } from "../types";
import {
  type HandVsRangeProblem,
  randomProblem,
  parseProblem,
  serializeProblem,
  problemKey,
} from "./problem";
import { HandVsRangeStage } from "./HandVsRangeStage";
import { getRangeById, rangeToEngineString } from "@/data/rangeLibrary";

const TOLERANCE = 10;
const ANCHORS: readonly number[] = [0, 20, 40, 60, 80, 100];

export const handVsRangeExercise: Exercise<HandVsRangeProblem> = {
  type: "hand-vs-range",
  prompt: "What's Hero's equity on the flop?",
  tooltipLabel: "Actual Equity",
  barPrompt: "drag to estimate equity",
  tolerance: TOLERANCE,
  axisAnchors: ANCHORS,
  formatValue: (n) => `${n.toFixed(1)}%`,
  generateProblem: (rng) => randomProblem(rng),
  parseProblem,
  serializeProblem,
  problemKey,
  computeTruth: (p, engine) => {
    if (engine === null) return null;
    const range = getRangeById(p.villainRangeId);
    if (range === undefined) return null;
    const heroCombo = `${p.hero[0]}${p.hero[1]}`;
    const flop = `${p.board[0]}${p.board[1]}${p.board[2]}`;
    try {
      return (
        engine.equityVsRangeFlop(
          heroCombo,
          rangeToEngineString(range),
          flop,
        ) * 100
      );
    } catch {
      return null;
    }
  },
  Stage: HandVsRangeStage,
};
