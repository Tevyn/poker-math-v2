"use client";

import { useEffect, useState } from "react";
import { getEngine, type EngineApi } from "@/lib/engine";

export default function Home() {
  const [range, setRange] = useState("AKo");
  const [api, setApi] = useState<EngineApi | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

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

  const trimmed = range.trim();
  const combos =
    api !== null && trimmed.length > 0 ? api.countCombos(trimmed) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8 font-mono dark:bg-black">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        poker-trainer · engine
      </h1>
      <input
        type="text"
        value={range}
        onChange={(e) => setRange(e.target.value)}
        autoFocus
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        aria-label="Hand range"
        className="w-48 rounded-md border border-zinc-300 bg-white px-4 py-2 text-center text-lg text-black focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <ResultLine
        api={api}
        initError={initError}
        combos={combos}
        trimmed={trimmed}
      />
    </main>
  );
}

interface ResultLineProps {
  api: EngineApi | null;
  initError: string | null;
  combos: number | null;
  trimmed: string;
}

function ResultLine({ api, initError, combos, trimmed }: ResultLineProps) {
  if (initError !== null) {
    return <p className="text-rose-600">engine init failed: {initError}</p>;
  }
  if (api === null) {
    return <p className="text-zinc-500">loading wasm…</p>;
  }
  if (trimmed.length === 0) {
    return <p className="text-zinc-400">&nbsp;</p>;
  }
  if (combos === null || combos === 0) {
    return <p className="text-zinc-500">not a valid range</p>;
  }
  return <p className="text-emerald-600">{combos} combos</p>;
}
