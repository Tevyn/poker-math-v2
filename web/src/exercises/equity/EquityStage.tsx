"use client";

import { HandDisplay } from "./HandDisplay";
import type { HandPair } from "./problem";

const captionClass =
  "text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500";

export function EquityStage({ problem }: { problem: HandPair }) {
  return (
    <section
      aria-label="Problem"
      className="flex flex-col items-center justify-center gap-2"
    >
      <span className={captionClass}>Hero</span>
      <HandDisplay hand={problem.a} />
      <span className="text-xs uppercase tracking-wider text-zinc-500">
        vs
      </span>
      <span className={captionClass}>Villain</span>
      <HandDisplay hand={problem.b} />
    </section>
  );
}
