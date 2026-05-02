"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface ActualEquityTooltipProps {
  percent: number;
  visible: boolean;
}

export function ActualEquityTooltip({
  percent,
  visible,
}: ActualEquityTooltipProps) {
  const reducedMotion = useReducedMotion();
  const transitionDuration = reducedMotion ? "0ms" : "240ms";
  return (
    <div
      data-testid="actual-equity-tooltip"
      data-visible={visible ? "true" : "false"}
      aria-live="polite"
      className="relative rounded-2xl bg-white px-6 py-4 shadow-xl"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        transitionProperty: "opacity, transform",
        transitionDuration,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <span className="block text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Actual Equity
      </span>
      <span
        className="block text-center font-bold leading-none text-zinc-900"
        style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}
      >
        {percent.toFixed(1)}%
      </span>
      <span
        aria-hidden
        className="absolute left-1/2 top-full block h-0 w-0 -translate-x-1/2"
        style={{
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "10px solid white",
        }}
      />
    </div>
  );
}
