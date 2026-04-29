import init, { count_combos } from "engine";

export interface EngineApi {
  countCombos(rangeStr: string): number;
}

let cachedPromise: Promise<EngineApi> | null = null;

export function getEngine(): Promise<EngineApi> {
  if (cachedPromise === null) {
    cachedPromise = init()
      .then<EngineApi>(() => ({
        countCombos(rangeStr: string): number {
          return count_combos(rangeStr);
        },
      }))
      .catch((err: unknown) => {
        cachedPromise = null;
        throw err;
      });
  }
  return cachedPromise;
}
