import type { Exercise } from "./types";
import { equityExercise } from "./equity/exercise";
import { potOddsExercise } from "./pot-odds/exercise";
import { handVsRangeExercise } from "./hand-vs-range/exercise";

export const exercises: ReadonlyArray<Exercise<unknown>> = [
  equityExercise as Exercise<unknown>,
  potOddsExercise as Exercise<unknown>,
  handVsRangeExercise as Exercise<unknown>,
];

export function getExerciseByType(type: string | null): Exercise<unknown> {
  if (type !== null) {
    const found = exercises.find((e) => e.type === type);
    if (found !== undefined) return found;
  }
  return exercises[0];
}
