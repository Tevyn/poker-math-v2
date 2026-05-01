"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  valueFromClientY,
  fractionFromValue,
  isWithinTolerance,
  assertSliderProps,
} from "./sliderMath";
import { useReducedMotion } from "./useReducedMotion";

export interface EstimationSliderProps {
  /** Inclusive lower bound of the value axis. Default 0. */
  min?: number;
  /** Inclusive upper bound of the value axis. Default 100. */
  max?: number;
  /** The correct answer; revealed on release. Must be within [min, max]. */
  truth: number;
  /** Half-width of the tolerance band, in the same units as value. Must be >= 0. */
  tolerance: number;
  /** Tick mark positions on the track (visual only — no snap). */
  anchors?: number[];
  /** Initial slider value. Defaults to (min + max) / 2. */
  initialValue?: number;
  /** Fired on pointerup. Provides the released value and whether it falls inside the tolerance band. */
  onRelease?: (value: number, isWithinTolerance: boolean) => void;
  /** Optional aria-label override. Default "Estimation slider". */
  ariaLabel?: string;
}

export function EstimationSlider({
  min = 0,
  max = 100,
  truth,
  tolerance,
  anchors,
  initialValue,
  onRelease,
  ariaLabel = "Estimation slider",
}: EstimationSliderProps) {
  assertSliderProps(min, max, truth, tolerance);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState<number>(initialValue ?? (min + max) / 2);
  const [released, setReleased] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const reducedMotion = useReducedMotion();

  const updateFromPointer = (clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    setValue(valueFromClientY(clientY, rect.top, rect.height, min, max));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setReleased(false);
    setDragging(true);
    updateFromPointer(e.clientY);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromPointer(e.clientY);
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
    setReleased(true);
    onRelease?.(value, isWithinTolerance(value, truth, tolerance));
  };

  const range = max - min;
  // Position values: percent from the top of the track.
  const valueTopPct = (1 - fractionFromValue(value, min, max)) * 100;
  const truthTopPct = (1 - fractionFromValue(truth, min, max)) * 100;
  const bandTopValue = Math.min(max, truth + tolerance);
  const bandBottomValue = Math.max(min, truth - tolerance);
  const bandTopPct = (1 - fractionFromValue(bandTopValue, min, max)) * 100;
  const bandHeightPct = ((bandTopValue - bandBottomValue) / range) * 100;
  const transitionDuration = reducedMotion ? "0ms" : "300ms";

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={ariaLabel}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      className="relative h-[60vh] w-16 select-none rounded-full bg-zinc-100 shadow-inner dark:bg-zinc-900"
      style={{ touchAction: "none" }}
      data-released={released ? "true" : "false"}
      data-dragging={dragging ? "true" : "false"}
    >
      {/* tolerance band — revealed on release */}
      <div
        aria-hidden
        data-slider-band
        className="absolute left-1 right-1 rounded-md bg-emerald-300/50 dark:bg-emerald-400/25"
        style={{
          top: `${bandTopPct}%`,
          height: `${bandHeightPct}%`,
          transformOrigin: "center",
          transform: released ? "scaleY(1)" : "scaleY(0)",
          opacity: released ? 1 : 0,
          transitionProperty: "transform, opacity",
          transitionDuration,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform, opacity",
        }}
      />
      {/* truth line — revealed on release */}
      <div
        aria-hidden
        data-slider-truth
        className="absolute left-0 right-0 h-px bg-emerald-700 dark:bg-emerald-300"
        style={{
          top: `${truthTopPct}%`,
          opacity: released ? 1 : 0,
          transitionProperty: "opacity",
          transitionDuration,
        }}
      />
      {/* anchor ticks — visual only */}
      {(anchors ?? []).map((a) => (
        <div
          key={a}
          aria-hidden
          data-slider-anchor
          className="pointer-events-none absolute left-2 right-2 h-px bg-zinc-400/60 dark:bg-zinc-600/60"
          style={{ top: `${(1 - fractionFromValue(a, min, max)) * 100}%` }}
        />
      ))}
      {/* thumb */}
      <div
        aria-hidden
        data-slider-thumb
        className="pointer-events-none absolute left-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-zinc-900 bg-white shadow-lg dark:border-zinc-100 dark:bg-zinc-950"
        style={{ top: `${valueTopPct}%` }}
      />
    </div>
  );
}
