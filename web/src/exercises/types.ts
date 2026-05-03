import type { ReactElement } from "react";
import type { EngineApi } from "@/lib/engine";

export interface Exercise<TProblem> {
  readonly type: string;
  readonly prompt: string;
  readonly tooltipLabel: string;
  readonly barPrompt: string;
  readonly tolerance: number;
  readonly axisAnchors: readonly number[];
  readonly formatValue: (n: number) => string;
  generateProblem(rng?: () => number): TProblem;
  parseProblem(params: URLSearchParams): TProblem | null;
  serializeProblem(problem: TProblem): Record<string, string>;
  problemKey(problem: TProblem): string;
  computeTruth(problem: TProblem, engine: EngineApi | null): number | null;
  Stage: (props: { problem: TProblem }) => ReactElement;
}
