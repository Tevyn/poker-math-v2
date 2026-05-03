"use client";

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  valueFromClientY,
  fractionFromValue,
  isWithinTolerance,
  assertSliderProps,
} from "@/lib/sliderMath";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface EstimationBarProps {
  min?: number;
  max?: number;
  truth: number;
  tolerance: number;
  initialValue?: number;
  onValueChange?: (value: number) => void;
  onRelease?: (value: number, isWithinTolerance: boolean) => void;
  onDraggingChange?: (dragging: boolean) => void;
  ariaLabel?: string;
  promptCopy?: string;
}

const IDLE_BAR_HEIGHT_PX = 56;

export function EstimationBar({
  min = 0,
  max = 100,
  truth,
  tolerance,
  initialValue,
  onValueChange,
  onRelease,
  onDraggingChange,
  ariaLabel = "Estimation bar",
  promptCopy = "drag to estimate equity",
}: EstimationBarProps) {
  assertSliderProps(min, max, truth, tolerance);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState<number>(
    initialValue ?? (min + max) / 2,
  );
  const [released, setReleased] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const reducedMotion = useReducedMotion();

  const transitionDuration = reducedMotion ? "0ms" : "240ms";

  const updateFromPointer = (clientY: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = valueFromClientY(clientY, rect.top, rect.height, min, max);
    setValue(next);
    onValueChange?.(next);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Gate: only enter dragging if pointer landed on or below the idle bar's
    // top edge — protects card taps near the top of the screen from
    // accidentally starting a drag.
    const idleBarTop = rect.bottom - IDLE_BAR_HEIGHT_PX - 16;
    if (!released && e.clientY < idleBarTop) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setReleased(false);
    setDragging(true);
    onDraggingChange?.(true);
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
    // Re-read final value from the release point so a pointer that doesn't
    // emit a move event between down and up still resolves at the correct
    // location.
    const rect = wrapperRef.current?.getBoundingClientRect();
    const finalValue = rect
      ? valueFromClientY(e.clientY, rect.top, rect.height, min, max)
      : value;
    setValue(finalValue);
    setDragging(false);
    onDraggingChange?.(false);
    setReleased(true);
    onRelease?.(
      finalValue,
      isWithinTolerance(finalValue, truth, tolerance),
    );
  };

  const valueTopPct = (1 - fractionFromValue(value, min, max)) * 100;
  const barHeightPct = ((2 * tolerance) / (max - min)) * 100;

  // Idle: pill-shaped control near the bottom of the screen.
  // Dragging/released: full-width cyan bar positioned at the value height.
  const showAsBar = dragging || released;

  return (
    <div
      ref={wrapperRef}
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
      className="absolute inset-0 select-none"
      style={{ touchAction: "none" }}
      data-testid="estimation-bar"
      data-released={released ? "true" : "false"}
      data-dragging={dragging ? "true" : "false"}
    >
      {/* Idle bar: pill near bottom — must sit above stage so the prompt
          stays visible at rest */}
      <div
        aria-hidden
        data-bar-idle
        className="pointer-events-none absolute inset-x-4 bottom-4 z-30 flex h-14 items-center justify-center rounded-full bg-(--color-control-idle)"
        style={{
          opacity: showAsBar ? 0 : 1,
          transitionProperty: "opacity",
          transitionDuration,
        }}
      >
        <span className="text-sm font-medium uppercase tracking-wider text-zinc-700">
          {promptCopy}
        </span>
        <span aria-hidden className="ml-3 text-zinc-700">
          ↑
        </span>
      </div>
      {/* Active bar: full-width cyan band sized to the tolerance window
          (height = 2 × tolerance), painted behind the stage. */}
      <div
        aria-hidden
        data-bar-active
        className="pointer-events-none absolute inset-x-0 z-0 bg-(--color-cyan-bar)"
        style={{
          top: `${valueTopPct}%`,
          height: `${barHeightPct}%`,
          transform: "translateY(-50%)",
          opacity: showAsBar ? 1 : 0,
          transitionProperty: "opacity",
          transitionDuration,
          willChange: "top",
        }}
      />
    </div>
  );
}
