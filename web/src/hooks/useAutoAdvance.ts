"use client";

import { useEffect, useRef } from "react";

export function useAutoAdvance(
  active: boolean,
  delayMs: number,
  onAdvance: () => void,
): void {
  const cbRef = useRef(onAdvance);
  useEffect(() => {
    cbRef.current = onAdvance;
  });
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => cbRef.current(), delayMs);
    return () => window.clearTimeout(id);
  }, [active, delayMs]);
}
