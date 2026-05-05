import { rangeData } from "./rangeData";

export type HandClass = string; // e.g. "AKs", "QQ", "27o"

export interface Range {
  /** URL-stable id (e.g., "btn_open"). */
  readonly id: string;
  /** Human-readable name (e.g., "BTN open"). */
  readonly name: string;
  /** Set of hand classes in the range. Binary inclusion. */
  readonly hands: ReadonlySet<HandClass>;
}

function flatten(): Range[] {
  const out: Range[] = [];
  for (const category of Object.values(rangeData)) {
    for (const [id, pokerRange] of Object.entries(category.ranges)) {
      const hands = new Set<HandClass>();
      for (const action of Object.values(pokerRange.range)) {
        if (Array.isArray(action)) {
          for (const h of action) hands.add(h);
        }
      }
      out.push({ id, name: pokerRange.name, hands });
    }
  }
  return out;
}

export const RANGES: ReadonlyArray<Range> = flatten();

export function getRangeById(id: string): Range | undefined {
  return RANGES.find((r) => r.id === id);
}

/** Joined hand-class string for `pokers::HandRange::from_string`. */
export function rangeToEngineString(range: Range): string {
  return Array.from(range.hands).join(",");
}

/** Deduplicated union of every hand class across the library. */
export const HERO_HAND_POOL: ReadonlyArray<HandClass> = (() => {
  const set = new Set<HandClass>();
  for (const r of RANGES) for (const h of r.hands) set.add(h);
  return Array.from(set);
})();
