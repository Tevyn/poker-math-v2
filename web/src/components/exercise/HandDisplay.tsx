"use client";

import { PlayingCard } from "./PlayingCard";
import { parseHand } from "./problem";

export function HandDisplay({ hand }: { hand: string }) {
  const [c1, c2] = parseHand(hand);
  return (
    <div className="flex gap-2" data-testid="hand-display">
      <PlayingCard card={c1} />
      <PlayingCard card={c2} />
    </div>
  );
}
