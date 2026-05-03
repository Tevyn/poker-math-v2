"use client";

import { fractionFromValue } from "@/lib/sliderMath";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface AxisProps {
  values: readonly number[];
  min?: number;
  max?: number;
  mode: "idle" | "dragging";
}

const MINOR_TICK_STEP = 5;

export function Axis({ values, min = 0, max = 100, mode }: AxisProps) {
  const reducedMotion = useReducedMotion();
  const isDragging = mode === "dragging";

  const lineColor = isDragging ? "border-zinc-400" : "border-zinc-300";
  const labelColor = isDragging ? "text-zinc-700" : "text-zinc-500";
  const tickColor = isDragging ? "bg-zinc-500" : "bg-zinc-400";
  const minorTickColor = isDragging ? "bg-zinc-400" : "bg-zinc-300";
  const transition = reducedMotion ? "0ms" : "200ms";

  const minors: number[] = [];
  if (values.length > 0) {
    const valuesSet = new Set(values);
    for (let v = min + MINOR_TICK_STEP; v < max; v += MINOR_TICK_STEP) {
      if (!valuesSet.has(v)) minors.push(v);
    }
  }

  return (
    <div
      data-testid="axis"
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
      {minors.map((v) => {
        const topPct = (1 - fractionFromValue(v, min, max)) * 100;
        return (
          <div
            key={`minor-${v}`}
            aria-hidden
            data-axis-tick-minor
            className="absolute left-0 flex items-center"
            style={{ top: `${topPct}%`, transform: "translateY(-50%)" }}
          >
            <span
              className={`ml-0.5 block h-px w-1 ${minorTickColor}`}
              style={{
                transitionProperty: "background-color",
                transitionDuration: transition,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
