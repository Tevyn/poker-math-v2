"use client";

import type { PotOddsProblem } from "./problem";

export function PotOddsStage({ problem }: { problem: PotOddsProblem }) {
  return (
    <section
      aria-label="Pot odds problem"
      className="flex flex-col items-center justify-center gap-3"
    >
      <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-6 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Pot
        </p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-zinc-900">
          ${problem.pot}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Bet to call
        </p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-zinc-900">
          ${problem.bet}
        </p>
      </div>
    </section>
  );
}
