"use client";

import { useEffect, useState } from "react";
import { getEngine, type EngineApi } from "@/lib/engine";

export default function Home() {
  const [handA, setHandA] = useState("AsKs");
  const [handB, setHandB] = useState("QhQd");
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

  const trimmedA = handA.trim();
  const trimmedB = handB.trim();
  let equity: number | null = null;
  let pairError: string | null = null;
  if (api !== null && trimmedA.length > 0 && trimmedB.length > 0) {
    try {
      equity = api.equityVs(trimmedA, trimmedB);
    } catch (err: unknown) {
      pairError = err instanceof Error ? err.message : String(err);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8 font-mono dark:bg-black">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        poker-trainer · engine
      </h1>
      <HandInput
        value={handA}
        onChange={setHandA}
        ariaLabel="Hand A"
        autoFocus
      />
      <span className="text-sm text-zinc-500">vs</span>
      <HandInput value={handB} onChange={setHandB} ariaLabel="Hand B" />
      <ResultLine
        api={api}
        initError={initError}
        equity={equity}
        pairError={pairError}
        trimmedA={trimmedA}
        trimmedB={trimmedB}
      />
    </main>
  );
}

interface HandInputProps {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
  autoFocus?: boolean;
}

function HandInput({ value, onChange, ariaLabel, autoFocus }: HandInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus={autoFocus}
      autoCapitalize="characters"
      autoCorrect="off"
      spellCheck={false}
      inputMode="text"
      aria-label={ariaLabel}
      className="w-48 rounded-md border border-zinc-300 bg-white px-4 py-2 text-center text-lg text-black focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
    />
  );
}

interface ResultLineProps {
  api: EngineApi | null;
  initError: string | null;
  equity: number | null;
  pairError: string | null;
  trimmedA: string;
  trimmedB: string;
}

function ResultLine({
  api,
  initError,
  equity,
  pairError,
  trimmedA,
  trimmedB,
}: ResultLineProps) {
  if (initError !== null) {
    return <p className="text-rose-600">engine init failed: {initError}</p>;
  }
  if (api === null) {
    return <p className="text-zinc-500">loading wasm…</p>;
  }
  if (trimmedA.length === 0 || trimmedB.length === 0) {
    return <p className="text-zinc-400">&nbsp;</p>;
  }
  if (pairError !== null) {
    const msg =
      pairError === "hands conflict"
        ? "hands share a card"
        : "not a valid hand pair";
    return <p className="text-zinc-500">{msg}</p>;
  }
  if (equity === null) {
    return <p className="text-zinc-400">&nbsp;</p>;
  }
  return (
    <p className="text-emerald-600">{(equity * 100).toFixed(1)}% equity</p>
  );
}
