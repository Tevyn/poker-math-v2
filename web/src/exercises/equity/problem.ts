export type Suit = "s" | "h" | "d" | "c";
export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface HandPair {
  a: string;
  b: string;
}

export const RANKS: readonly Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
];

export const SUITS: readonly Suit[] = ["s", "h", "d", "c"];

const RANK_SET: ReadonlySet<string> = new Set(RANKS);
const SUIT_SET: ReadonlySet<string> = new Set(SUITS);

function parseCard(rank: string, suit: string): Card {
  if (!RANK_SET.has(rank)) {
    throw new Error(`invalid rank: ${rank}`);
  }
  if (!SUIT_SET.has(suit)) {
    throw new Error(`invalid suit: ${suit}`);
  }
  return { rank: rank as Rank, suit: suit as Suit };
}

export function parseHand(hand: string): [Card, Card] {
  if (hand.length !== 4) {
    throw new Error(`invalid hand length: ${hand}`);
  }
  const c1 = parseCard(hand[0], hand[1]);
  const c2 = parseCard(hand[2], hand[3]);
  return [c1, c2];
}

export function isValidHand(hand: string): boolean {
  try {
    const [c1, c2] = parseHand(hand);
    return !(c1.rank === c2.rank && c1.suit === c2.suit);
  } catch {
    return false;
  }
}

export function isValidHandPair(a: string, b: string): boolean {
  try {
    const [a1, a2] = parseHand(a);
    const [b1, b2] = parseHand(b);
    const cards = [a1, a2, b1, b2].map(formatCard);
    return new Set(cards).size === 4;
  } catch {
    return false;
  }
}

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffle<T>(
  arr: readonly T[],
  rng: () => number = Math.random,
): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function formatCard(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function randomHandPair(rng: () => number = Math.random): HandPair {
  const shuffled = shuffle(buildDeck(), rng);
  const [c1, c2, c3, c4] = shuffled;
  return {
    a: formatCard(c1) + formatCard(c2),
    b: formatCard(c3) + formatCard(c4),
  };
}
