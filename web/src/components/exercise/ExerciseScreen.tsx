"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EstimationSlider } from "@/components/estimation-slider";
import { getEngine, type EngineApi } from "@/lib/engine";
import { HandDisplay } from "./HandDisplay";
import { FeedbackPanel } from "./FeedbackPanel";
import { isValidHandPair, randomHandPair } from "./problem";
import { EQUITY_ANCHORS, EQUITY_TOLERANCE } from "./exerciseConfig";

interface ReleaseState {
  problemKey: string;
  value: number;
  isWithinTolerance: boolean;
}

export function ExerciseScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [api, setApi] = useState<EngineApi | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [release, setRelease] = useState<ReleaseState | null>(null);

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
  const activeRelease = release?.problemKey === problemKey ? release : null;

  const onNext = () => {
    const next = randomHandPair();
    const params = new URLSearchParams({ a: next.a, b: next.b });
    router.replace(`?${params.toString()}`);
  };

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

  return (
    <main
      data-testid="exercise-screen"
      className="flex min-h-screen flex-col items-center justify-between gap-6 bg-zinc-50 p-6 dark:bg-black"
    >
      <h1 className="pt-6 text-center text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
        What&rsquo;s the equity of Hand A?
      </h1>

      <section
        aria-label="Problem"
        className="flex w-full items-center justify-center gap-8"
      >
        <div className="flex flex-col items-center gap-4">
          <HandDisplay hand={problem.a} label="Hand A" />
          <span className="text-sm uppercase text-zinc-500">vs</span>
          <HandDisplay hand={problem.b} label="Hand B" />
        </div>

        <EstimationSlider
          key={problemKey}
          min={0}
          max={100}
          truth={truthPercent}
          tolerance={EQUITY_TOLERANCE}
          anchors={[...EQUITY_ANCHORS]}
          onRelease={(value, isWithinTolerance) =>
            setRelease({ problemKey, value, isWithinTolerance })
          }
          ariaLabel="Estimate Hand A equity"
        />
      </section>

      <FeedbackPanel
        released={activeRelease !== null}
        isWithinTolerance={activeRelease?.isWithinTolerance ?? false}
        truthPercent={truthPercent}
        onNext={onNext}
      />
    </main>
  );
}
