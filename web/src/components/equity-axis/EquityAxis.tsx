"use client";

import { fractionFromValue } from "@/lib/sliderMath";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface EquityAxisProps {
  values: readonly number[];
  min?: number;
  max?: number;
  mode: "idle" | "dragging";
  pointerValue?: number;
}

export function EquityAxis({
  values,
  min = 0,
  max = 100,
  mode,
  pointerValue,
}: EquityAxisProps) {
  const reducedMotion = useReducedMotion();
  const isDragging = mode === "dragging";

  const lineColor = isDragging
    ? "border-zinc-100/70"
    : "border-zinc-300";
  const labelColor = isDragging
    ? "text-zinc-100"
    : "text-zinc-500";
  const tickColor = isDragging ? "bg-zinc-100" : "bg-zinc-400";
  const transition = reducedMotion ? "0ms" : "200ms";

  return (
    <div
      data-testid="equity-axis"
      data-mode={mode}
      className="relative h-full w-12 select-none"
    >
      <div
        aria-hidden
        className={`absolute left-2 top-0 h-full border-l border-dotted ${lineColor}`}
        style={{
          transitionProperty: "border-color",
          transitionDuration: transition,
        }}
      />
      {values.map((v) => {
        const topPct = (1 - fractionFromValue(v, min, max)) * 100;
        return (
          <div
            key={v}
            aria-hidden
            data-axis-tick
            className="absolute left-0 flex items-center gap-2"
            style={{ top: `${topPct}%`, transform: "translateY(-50%)" }}
          >
            <span
              className={`block size-2 ${tickColor}`}
              style={{
                transitionProperty: "background-color",
                transitionDuration: transition,
              }}
            />
            <span
              className={`text-xs font-medium tabular-nums ${labelColor}`}
              style={{
                transitionProperty: "color",
                transitionDuration: transition,
              }}
            >
              {v}
            </span>
          </div>
        );
      })}
      {pointerValue !== undefined ? (
        <div
          aria-hidden
          data-axis-pointer
          className="pointer-events-none absolute left-6"
          style={{
            top: `${(1 - fractionFromValue(pointerValue, min, max)) * 100}%`,
            transform: "translateY(-50%)",
          }}
        >
          <span
            className="block h-0 w-0"
            style={{
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderLeft: "8px solid var(--color-cyan-bar)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
