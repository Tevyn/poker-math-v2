"use client";

import { PlayingCard } from "./PlayingCard";
import { parseHand } from "./problem";

interface HandDisplayProps {
  hand: string;
  label?: string;
}

export function HandDisplay({ hand, label }: HandDisplayProps) {
  const [c1, c2] = parseHand(hand);
  return (
    <div className="flex flex-col items-center gap-1">
      {label !== undefined ? (
        <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      ) : null}
      <div className="flex gap-2" data-testid="hand-display">
        <PlayingCard card={c1} />
        <PlayingCard card={c2} />
      </div>
    </div>
  );
}
