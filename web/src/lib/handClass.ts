export const RANKS = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
] as const;
export const SUITS = ["s", "h", "d", "c"] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];
export type Card = `${Rank}${Suit}`;

export const ALL_CARDS: ReadonlyArray<Card> = RANKS.flatMap(
  (r) => SUITS.map((s) => `${r}${s}` as Card),
);

const RANK_SET: ReadonlySet<string> = new Set(RANKS);

function isRank(c: string): c is Rank {
  return RANK_SET.has(c);
}

/** Expand a hand-class string into all its specific 2-card combos. */
export function expandHandClassToCombos(handClass: string): Card[] {
  if (handClass.length === 2) {
    const r = handClass[0];
    if (handClass[1] !== r || !isRank(r)) {
      throw new Error(`invalid hand class: ${handClass}`);
    }
    const out: Card[] = [];
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        out.push(`${r}${SUITS[i]}${r}${SUITS[j]}` as unknown as Card);
      }
    }
    return out;
  }
  if (handClass.length === 3) {
    const r1 = handClass[0];
    const r2 = handClass[1];
    const kind = handClass[2];
    if (!isRank(r1) || !isRank(r2) || r1 === r2) {
      throw new Error(`invalid hand class: ${handClass}`);
    }
    if (kind === "s") {
      return SUITS.map(
        (s) => `${r1}${s}${r2}${s}` as unknown as Card,
      );
    }
    if (kind === "o") {
      const out: Card[] = [];
      for (const s1 of SUITS) {
        for (const s2 of SUITS) {
          if (s1 !== s2) {
            out.push(`${r1}${s1}${r2}${s2}` as unknown as Card);
          }
        }
      }
      return out;
    }
  }
  throw new Error(`invalid hand class: ${handClass}`);
}

/** Concatenate two cards into a hero combo string for the engine. */
export function comboString(c1: Card, c2: Card): string {
  return `${c1}${c2}`;
}
