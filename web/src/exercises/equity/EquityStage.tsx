"use client";

import { HandDisplay } from "./HandDisplay";
import type { HandPair } from "./problem";

export function EquityStage({ problem }: { problem: HandPair }) {
  return (
    <section
      aria-label="Problem"
      className="flex flex-col items-center justify-center gap-4"
    >
      <HandDisplay hand={problem.a} />
      <span className="text-xs uppercase tracking-wider text-zinc-500">
        vs
      </span>
      <HandDisplay hand={problem.b} />
    </section>
  );
}
