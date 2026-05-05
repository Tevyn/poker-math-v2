"use client";

import { PlayingCard } from "../equity/PlayingCard";
import type { Card as EquityCard, Rank, Suit } from "../equity/problem";
import { getRangeById } from "@/data/rangeLibrary";
import { RangeGrid } from "./RangeGrid";
import type { HandVsRangeProblem } from "./problem";

const captionClass =
  "text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500";

function toEquityCard(c: string): EquityCard {
  return { rank: c[0] as Rank, suit: c[1] as Suit };
}

export function HandVsRangeStage({
  problem,
}: {
  problem: HandVsRangeProblem;
}) {
  const range = getRangeById(problem.villainRangeId);
  const heroPair = problem.hero.map(toEquityCard);
  const boardCards = problem.board.map(toEquityCard);

  return (
    <section
      aria-label="Hand vs range problem"
      className="flex flex-col items-center justify-center gap-6"
    >
      <div className="flex w-full max-w-[20rem] flex-col items-center gap-2">
        <span className={captionClass}>
          Villain — {range?.name ?? "unknown range"}
        </span>
        <RangeGrid hands={range?.hands ?? new Set()} />
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className={captionClass}>Board</span>
        <div className="flex gap-2">
          {boardCards.map((card, i) => (
            <PlayingCard key={`${card.rank}${card.suit}-${i}`} card={card} />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className={captionClass}>Hero</span>
        <div className="flex gap-2">
          {heroPair.map((card, i) => (
            <PlayingCard key={`${card.rank}${card.suit}-${i}`} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
