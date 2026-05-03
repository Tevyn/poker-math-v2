import type { Exercise } from "./types";
import { equityExercise } from "./equity/exercise";
import { potOddsExercise } from "./pot-odds/exercise";

export const exercises: ReadonlyArray<Exercise<unknown>> = [
  equityExercise as Exercise<unknown>,
  potOddsExercise as Exercise<unknown>,
];

export function getExerciseByType(type: string | null): Exercise<unknown> {
  if (type !== null) {
    const found = exercises.find((e) => e.type === type);
    if (found !== undefined) return found;
  }
  return exercises[0];
}
