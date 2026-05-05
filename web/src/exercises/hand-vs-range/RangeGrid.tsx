import { RANKS } from "@/lib/handClass";
import type { HandClass } from "@/data/rangeLibrary";

export interface RangeGridProps {
  /** Which hand classes are highlighted as in-range. */
  hands: ReadonlySet<HandClass>;
}

function cellLabel(rowIdx: number, colIdx: number): HandClass {
  const r = RANKS[rowIdx];
  const c = RANKS[colIdx];
  if (rowIdx === colIdx) return `${r}${r}`;
  if (rowIdx < colIdx) return `${r}${c}s`;
  return `${c}${r}o`;
}

export function RangeGrid({ hands }: RangeGridProps) {
  return (
    <div
      role="img"
      aria-label="Villain range grid"
      className="gap-px rounded-md border border-zinc-200 bg-zinc-200 p-px"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(13, minmax(0, 1fr))",
      }}
    >
      {RANKS.map((_, r) =>
        RANKS.map((__, c) => {
          const label = cellLabel(r, c);
          const inRange = hands.has(label);
          return (
            <div
              key={`${r}-${c}`}
              className={
                inRange
                  ? "flex aspect-square items-center justify-center bg-cyan-500 text-[8px] font-bold text-white tabular-nums"
                  : "flex aspect-square items-center justify-center bg-white text-[8px] font-medium text-zinc-400 tabular-nums"
              }
            >
              {label}
            </div>
          );
        }),
      )}
    </div>
  );
}
