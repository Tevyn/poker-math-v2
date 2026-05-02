"use client";

import type { Card, Suit } from "./problem";

interface PlayingCardProps {
  card: Card;
}

const SUIT_GLYPH: Record<Suit, string> = {
  s: "♠",
  h: "♥",
  d: "♦",
  c: "♣",
};

const SUIT_NAME: Record<Suit, string> = {
  s: "spades",
  h: "hearts",
  d: "diamonds",
  c: "clubs",
};

function isRed(suit: Suit): boolean {
  return suit === "h" || suit === "d";
}

export function PlayingCard({ card }: PlayingCardProps) {
  const glyph = SUIT_GLYPH[card.suit];
  const colorClass = isRed(card.suit)
    ? "text-rose-600 dark:text-rose-400"
    : "text-zinc-900 dark:text-zinc-100";
  return (
    <div
      data-testid="playing-card"
      data-rank={card.rank}
      data-suit={card.suit}
      aria-label={`${card.rank} of ${SUIT_NAME[card.suit]}`}
      className={`flex h-20 w-14 flex-col items-start justify-between rounded-md border border-zinc-300 bg-white p-1.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 ${colorClass}`}
    >
      <span className="text-lg font-semibold leading-none">{card.rank}</span>
      <span className="self-center text-2xl leading-none">{glyph}</span>
      <span className="self-end rotate-180 text-lg font-semibold leading-none">
        {card.rank}
      </span>
    </div>
  );
}
