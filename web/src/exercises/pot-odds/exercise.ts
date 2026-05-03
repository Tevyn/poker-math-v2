import type { Exercise } from "../types";
import {
  isValidPotOddsProblem,
  randomPotOdds,
  requiredEquity,
  type PotOddsProblem,
} from "./problem";
import { PotOddsStage } from "./PotOddsStage";

const POT_ODDS_TOLERANCE = 5;
const POT_ODDS_ANCHORS: readonly number[] = [0, 20, 40, 60, 80, 100];

export const potOddsExercise: Exercise<PotOddsProblem> = {
  type: "pot-odds",
  prompt: "What % do you need to win to call?",
  tooltipLabel: "Required equity",
  barPrompt: "drag to estimate pot odds",
  tolerance: POT_ODDS_TOLERANCE,
  axisAnchors: POT_ODDS_ANCHORS,
  formatValue: (n) => `${n.toFixed(1)}%`,
  generateProblem: (rng) => randomPotOdds(rng),
  parseProblem: (params) => {
    const pot = Number(params.get("pot"));
    const bet = Number(params.get("bet"));
    const candidate = { pot, bet };
    return isValidPotOddsProblem(candidate) ? candidate : null;
  },
  serializeProblem: (p) => ({ pot: String(p.pot), bet: String(p.bet) }),
  problemKey: (p) => `${p.pot}|${p.bet}`,
  computeTruth: (p) => requiredEquity(p),
  Stage: PotOddsStage,
};
