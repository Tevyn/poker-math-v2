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
  const colorClass = isRed(card.suit) ? "text-rose-600" : "text-zinc-900";
  return (
    <div
      data-testid="playing-card"
      data-rank={card.rank}
      data-suit={card.suit}
      aria-label={`${card.rank} of ${SUIT_NAME[card.suit]}`}
      className={`flex h-28 w-16 flex-col items-center justify-between py-2 ${colorClass}`}
    >
      <span className="text-3xl font-bold leading-none">{card.rank}</span>
      <span className="text-3xl leading-none">{glyph}</span>
    </div>
  );
}
