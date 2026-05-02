export const SUCCESS_PHRASES = [
  "bullseye",
  "nice",
  "close enough",
  "got it",
] as const;

export const MISS_PHRASES = [
  "close-ish",
  "maybe next time",
  "not quite",
  "noped it",
] as const;

function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

export function pickPhrase(
  seed: string,
  kind: "success" | "miss",
): string {
  const list = kind === "success" ? SUCCESS_PHRASES : MISS_PHRASES;
  return list[hashSeed(seed) % list.length];
}

export function seededFloat(seed: string, salt: number): number {
  let h = hashSeed(seed);
  h ^= Math.imul(salt + 1, 2654435761);
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 0xffffffff;
}
