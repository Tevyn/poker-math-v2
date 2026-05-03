"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EstimationBar } from "@/components/estimation-bar";
import { Axis } from "@/components/axis";
import {
  ActualValueTooltip,
  FireworkBurst,
  pickPhrase,
} from "@/components/feedback";
import { getEngine, type EngineApi } from "@/lib/engine";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getExerciseByType } from "@/exercises/registry";
import type { Exercise } from "@/exercises/types";
import {
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

  const exercise = useMemo<Exercise<unknown>>(
    () => getExerciseByType(searchParams.get("type")),
    [searchParams],
  );

  const problem = useMemo<unknown>(() => {
    const parsed = exercise.parseProblem(
      new URLSearchParams(searchParams.toString()),
    );
    return parsed ?? exercise.generateProblem();
  }, [exercise, searchParams]);

  useEffect(() => {
    const parsed = exercise.parseProblem(
      new URLSearchParams(searchParams.toString()),
    );
    if (parsed === null || searchParams.get("type") === null) {
      const params = new URLSearchParams({
        type: exercise.type,
        ...exercise.serializeProblem(problem),
      });
      router.replace(`?${params.toString()}`);
    }
  }, [exercise, problem, searchParams, router]);

  const truthPercent = useMemo(
    () => exercise.computeTruth(problem, api),
    [exercise, problem, api],
  );

  const problemKey = `${exercise.type}|${exercise.problemKey(problem)}`;

  const [prevProblemKey, setPrevProblemKey] = useState(problemKey);
  if (prevProblemKey !== problemKey) {
    setPrevProblemKey(problemKey);
    setPhase({ kind: "idle" });
  }

  const onNext = () => {
    const next = exercise.generateProblem();
    const params = new URLSearchParams({
      type: exercise.type,
      ...exercise.serializeProblem(next),
    });
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
  if (truthPercent === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <p className="text-zinc-500">loading…</p>
      </main>
    );
  }

  const transitionDuration = reducedMotion
    ? "0ms"
    : `${RELEASE_TRANSITION_MS}ms`;

  const surfaceColor =
    phase.kind === "success"
      ? "var(--color-success-flash)"
      : phase.kind === "miss"
        ? "var(--color-miss-settle)"
        : "#ffffff";

  const overlayOpacity = phase.kind === "dragging" ? 1 : 0;
  const stageOpacity = phase.kind === "dragging" ? 0.3 : 1;

  const verdictCopy = isResolved
    ? pickPhrase(problemKey, phase.kind === "success" ? "success" : "miss")
    : "";

  const Stage = exercise.Stage;

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
        {exercise.prompt}
      </h1>

      <div className="absolute bottom-24 left-4 top-20 w-12">
        <Axis
          values={[...exercise.axisAnchors]}
          mode={phase.kind === "dragging" ? "dragging" : "idle"}
          pointerValue={phase.kind === "dragging" ? phase.value : undefined}
        />
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: stageOpacity,
          transitionProperty: "opacity",
          transitionDuration,
        }}
      >
        <Stage problem={problem} />
      </div>

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
          <ActualValueTooltip
            label={exercise.tooltipLabel}
            formattedValue={exercise.formatValue(
              phase.kind === "success" || phase.kind === "miss"
                ? phase.truthPercent
                : 0,
            )}
            visible={true}
          />
        </div>
      ) : null}

      {phase.kind === "success" ? (
        <FireworkBurst
          active={true}
          durationMs={FIREWORK_DURATION_MS}
          seed={problemKey}
        />
      ) : null}

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

      <EstimationBar
        key={problemKey}
        min={0}
        max={100}
        truth={truthPercent}
        tolerance={exercise.tolerance}
        ariaLabel="Estimate value"
        promptCopy={exercise.barPrompt}
        onValueChange={(value) => {
          setPhase((prev) =>
            prev.kind === "dragging" ? { kind: "dragging", value } : prev,
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
