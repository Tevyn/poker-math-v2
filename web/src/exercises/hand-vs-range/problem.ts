import {
  RANGES,
  HERO_HAND_POOL,
  getRangeById,
  type HandClass,
} from "@/data/rangeLibrary";
import {
  ALL_CARDS,
  expandHandClassToCombos,
  type Card,
} from "@/lib/handClass";

export interface HandVsRangeProblem {
  /** Two cards, e.g. ["As", "Ks"]. */
  readonly hero: readonly [Card, Card];
  /** Range id from the library. */
  readonly villainRangeId: string;
  /** Three flop cards. */
  readonly board: readonly [Card, Card, Card];
}

const ALL_CARDS_SET: ReadonlySet<string> = new Set(ALL_CARDS);

export function isValidProblem(p: unknown): p is HandVsRangeProblem {
  if (typeof p !== "object" || p === null) return false;
  const x = p as Record<string, unknown>;
  if (!Array.isArray(x.hero) || x.hero.length !== 2) return false;
  if (typeof x.villainRangeId !== "string") return false;
  if (getRangeById(x.villainRangeId) === undefined) return false;
  if (!Array.isArray(x.board) || x.board.length !== 3) return false;
  const all = [...x.hero, ...x.board];
  if (all.some((c) => typeof c !== "string" || !ALL_CARDS_SET.has(c))) {
    return false;
  }
  return new Set(all).size === 5;
}

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function randomProblem(
  rng: () => number = Math.random,
): HandVsRangeProblem {
  for (let attempts = 0; attempts < 100; attempts++) {
    const heroClass: HandClass = pick(HERO_HAND_POOL, rng);
    const heroCombos = expandHandClassToCombos(heroClass);
    const heroCombo = pick(heroCombos, rng);
    const heroC1 = heroCombo.slice(0, 2) as Card;
    const heroC2 = heroCombo.slice(2, 4) as Card;
    const remaining = ALL_CARDS.filter(
      (c) => c !== heroC1 && c !== heroC2,
    );

    // Deal 3 distinct flop cards.
    const idx1 = Math.floor(rng() * remaining.length);
    const c1 = remaining[idx1];
    const rem2 = remaining.filter((_, i) => i !== idx1);
    const idx2 = Math.floor(rng() * rem2.length);
    const c2 = rem2[idx2];
    const rem3 = rem2.filter((_, i) => i !== idx2);
    const c3 = rem3[Math.floor(rng() * rem3.length)];

    const villain = pick(RANGES, rng);

    const problem: HandVsRangeProblem = {
      hero: [heroC1, heroC2],
      villainRangeId: villain.id,
      board: [c1, c2, c3],
    };
    if (isValidProblem(problem)) return problem;
  }
  throw new Error("randomProblem: failed to produce a valid problem");
}

export function parseProblem(
  params: URLSearchParams,
): HandVsRangeProblem | null {
  const hero = params.get("hero");
  const range = params.get("range");
  const board = params.get("board");
  if (hero === null || range === null || board === null) return null;
  if (hero.length !== 4 || board.length !== 6) return null;
  const candidate = {
    hero: [hero.slice(0, 2), hero.slice(2, 4)] as const,
    villainRangeId: range,
    board: [board.slice(0, 2), board.slice(2, 4), board.slice(4, 6)] as const,
  };
  return isValidProblem(candidate) ? (candidate as HandVsRangeProblem) : null;
}

export function serializeProblem(
  p: HandVsRangeProblem,
): Record<string, string> {
  return {
    hero: `${p.hero[0]}${p.hero[1]}`,
    range: p.villainRangeId,
    board: `${p.board[0]}${p.board[1]}${p.board[2]}`,
  };
}

export function problemKey(p: HandVsRangeProblem): string {
  return `${p.hero[0]}${p.hero[1]}|${p.villainRangeId}|${p.board.join("")}`;
}
