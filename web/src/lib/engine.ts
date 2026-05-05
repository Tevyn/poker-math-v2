import { count_combos, equity_vs, equity_vs_range_flop } from "engine";

export interface EngineApi {
  countCombos(rangeStr: string): number;
  equityVs(handA: string, handB: string): number;
  equityVsRangeFlop(
    heroCombo: string,
    villainRange: string,
    flop: string,
  ): number;
}

let cachedPromise: Promise<EngineApi> | null = null;

export function getEngine(): Promise<EngineApi> {
  if (cachedPromise !== null) return cachedPromise;
  // Both the bundler and nodejs wasm-pack targets now load the wasm
  // synchronously at module-eval time — no async init needed. We keep
  // the Promise-returning API so callers can stay agnostic.
  const promise = Promise.resolve<EngineApi>({
    countCombos(rangeStr: string): number {
      return count_combos(rangeStr);
    },
    equityVs(handA: string, handB: string): number {
      return equity_vs(handA, handB);
    },
    equityVsRangeFlop(
      heroCombo: string,
      villainRange: string,
      flop: string,
    ): number {
      return equity_vs_range_flop(heroCombo, villainRange, flop);
    },
  });
  cachedPromise = promise;
  return promise;
}
