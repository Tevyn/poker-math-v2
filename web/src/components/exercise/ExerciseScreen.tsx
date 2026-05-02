"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EstimationBar } from "@/components/estimation-bar";
import { EquityAxis } from "@/components/equity-axis";
import {
  ActualEquityTooltip,
  FireworkBurst,
  pickPhrase,
} from "@/components/feedback";
import { getEngine, type EngineApi } from "@/lib/engine";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HandDisplay } from "./HandDisplay";
import { isValidHandPair, randomHandPair } from "./problem";
import {
  EQUITY_ANCHORS,
  EQUITY_TOLERANCE,
  SUCCESS_HOLD_MS,
  MISS_HOLD_MS,
  FIREWORK_DURATION_MS,
  RELEASE_TRANSITION_MS,
} from "./exerciseConfig";

type ScreenPhase =
  | { kind: "idle" }
  | { kind: "dragging"; value: number }
  | { kind: "success"; value: number; truthPercent: number }
  | { kind: "miss"; value: number; truthPercent: number };

export function ExerciseScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [api, setApi] = useState<EngineApi | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [phase, setPhase] = useState<ScreenPhase>({ kind: "idle" });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    getEngine()
      .then((engineApi) => {
        if (cancelled) return;
        setApi(engineApi);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setInitError(msg);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const urlA = searchParams.get("a") ?? "";
  const urlB = searchParams.get("b") ?? "";
  const urlValid = isValidHandPair(urlA, urlB);

  const problem = useMemo(() => {
    if (urlValid) return { a: urlA, b: urlB };
    return randomHandPair();
  }, [urlA, urlB, urlValid]);

  useEffect(() => {
    if (!urlValid) {
      const params = new URLSearchParams({ a: problem.a, b: problem.b });
      router.replace(`?${params.toString()}`);
    }
  }, [urlValid, problem.a, problem.b, router]);

  const truthPercent = useMemo(() => {
    if (api === null) return null;
    try {
      return api.equityVs(problem.a, problem.b) * 100;
    } catch {
      return null;
    }
  }, [api, problem.a, problem.b]);

  const problemKey = `${problem.a}${problem.b}`;

  const onNext = () => {
    const next = randomHandPair();
    const params = new URLSearchParams({ a: next.a, b: next.b });
    setPhase({ kind: "idle" });
    router.replace(`?${params.toString()}`);
  };

  const isResolved = phase.kind === "success" || phase.kind === "miss";
  const holdMs = phase.kind === "success" ? SUCCESS_HOLD_MS : MISS_HOLD_MS;
  useAutoAdvance(isResolved, holdMs, onNext);

  if (initError !== null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <p className="text-rose-600">engine init failed: {initError}</p>
      </main>
    );
  }
  if (api === null || truthPercent === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <p className="text-zinc-500">loading…</p>
      </main>
    );
  }

  const transitionDuration = reducedMotion
    ? "0ms"
    : `${RELEASE_TRANSITION_MS}ms`;

  // Surface color responds to phase: idle/dragging are white, success flashes
  // green, miss settles to soft grey.
  const surfaceColor =
    phase.kind === "success"
      ? "var(--color-success-flash)"
      : phase.kind === "miss"
        ? "var(--color-miss-settle)"
        : "#ffffff";

  const overlayOpacity = phase.kind === "dragging" ? 1 : 0;
  const handsOpacity = phase.kind === "dragging" ? 0.3 : 1;

  const verdictCopy = isResolved
    ? pickPhrase(problemKey, phase.kind === "success" ? "success" : "miss")
    : "";

  return (
    <main
      data-testid="exercise-screen"
      data-screen-phase={phase.kind}
      className="relative h-screen w-screen overflow-hidden"
      style={{
        backgroundColor: surfaceColor,
        transitionProperty: "background-color",
        transitionDuration,
      }}
    >
      <h1 className="absolute left-0 right-0 top-6 text-center text-base font-medium tracking-tight text-zinc-700">
        What&rsquo;s the equity of Hand A?
      </h1>

      {/* Left-edge axis */}
      <div className="absolute bottom-24 left-4 top-20 w-12">
        <EquityAxis
          values={EQUITY_ANCHORS}
          mode={phase.kind === "dragging" ? "dragging" : "idle"}
          pointerValue={
            phase.kind === "dragging" ? phase.value : undefined
          }
        />
      </div>

      {/* Centered hands */}
      <section
        aria-label="Problem"
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        style={{
          opacity: handsOpacity,
          transitionProperty: "opacity",
          transitionDuration,
        }}
      >
        <HandDisplay hand={problem.a} />
        <span className="text-xs uppercase tracking-wider text-zinc-500">
          vs
        </span>
        <HandDisplay hand={problem.b} />
      </section>

      {/* Verdict copy + tooltip */}
      {isResolved ? (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 flex flex-col items-center gap-3">
          <span
            className={`text-lg font-semibold tracking-tight ${
              phase.kind === "success"
                ? "text-emerald-900"
                : "text-zinc-700"
            }`}
          >
            {verdictCopy}
          </span>
          <ActualEquityTooltip
            percent={
              phase.kind === "success" || phase.kind === "miss"
                ? phase.truthPercent
                : 0
            }
            visible={true}
          />
        </div>
      ) : null}

      {/* Firework burst on success only */}
      {phase.kind === "success" ? (
        <FireworkBurst
          active={true}
          durationMs={FIREWORK_DURATION_MS}
          seed={problemKey}
        />
      ) : null}

      {/* Dragging overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "var(--color-overlay)",
          opacity: overlayOpacity,
          transitionProperty: "opacity",
          transitionDuration,
        }}
      />

      {/* Estimation bar (full-screen pointer surface) */}
      <EstimationBar
        key={problemKey}
        min={0}
        max={100}
        truth={truthPercent}
        tolerance={EQUITY_TOLERANCE}
        ariaLabel="Estimate Hand A equity"
        promptCopy="drag to estimate equity"
        onValueChange={(value) => {
          setPhase((prev) =>
            prev.kind === "dragging"
              ? { kind: "dragging", value }
              : prev,
          );
        }}
        onDraggingChange={(dragging) => {
          if (dragging) {
            setPhase({ kind: "dragging", value: 50 });
          }
        }}
        onRelease={(value, isWithinTolerance) => {
          setPhase(
            isWithinTolerance
              ? { kind: "success", value, truthPercent }
              : { kind: "miss", value, truthPercent },
          );
        }}
      />
    </main>
  );
}
