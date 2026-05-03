export interface PotOddsProblem {
  pot: number;
  bet: number;
}

const POTS = [10, 20, 30, 40, 50, 75, 100, 150, 200, 300, 500] as const;

function betSizesForPot(pot: number): number[] {
  return [
    Math.round(pot / 4),
    Math.round(pot / 3),
    Math.round(pot / 2),
    Math.round((pot * 2) / 3),
    Math.round((pot * 3) / 4),
    pot,
    Math.round(pot * 1.5),
    pot * 2,
    pot * 3,
  ].filter((b) => b > 0);
}

export function requiredEquity(p: PotOddsProblem): number {
  const denom = p.pot + 2 * p.bet;
  if (denom <= 0) return 0;
  return (p.bet / denom) * 100;
}

export function isValidPotOddsProblem(p: unknown): p is PotOddsProblem {
  if (typeof p !== "object" || p === null) return false;
  const x = p as Record<string, unknown>;
  return (
    typeof x.pot === "number" &&
    typeof x.bet === "number" &&
    Number.isFinite(x.pot) &&
    Number.isFinite(x.bet) &&
    x.pot > 0 &&
    x.bet > 0
  );
}

export function randomPotOdds(
  rng: () => number = Math.random,
): PotOddsProblem {
  const pot = POTS[Math.floor(rng() * POTS.length)];
  const bets = betSizesForPot(pot);
  const bet = bets[Math.floor(rng() * bets.length)];
  return { pot, bet };
}
