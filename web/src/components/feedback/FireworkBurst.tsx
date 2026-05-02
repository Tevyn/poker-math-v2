"use client";

import { useMemo } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { seededFloat } from "./feedbackCopy";

export interface FireworkBurstProps {
  active: boolean;
  durationMs: number;
  seed?: string;
}

const PARTICLE_COUNT = 12;

interface Particle {
  shape: "square" | "triangle";
  angleDeg: number;
  distancePx: number;
  sizePx: number;
  delayMs: number;
}

function buildParticles(seed: string): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = seededFloat(seed, i * 4) * 360;
    const dist = 80 + seededFloat(seed, i * 4 + 1) * 80;
    const size = 6 + Math.floor(seededFloat(seed, i * 4 + 2) * 6);
    const delay = Math.floor(seededFloat(seed, i * 4 + 3) * 80);
    out.push({
      shape: i % 2 === 0 ? "square" : "triangle",
      angleDeg: angle,
      distancePx: dist,
      sizePx: size,
      delayMs: delay,
    });
  }
  return out;
}

export function FireworkBurst({
  active,
  durationMs,
  seed = "default",
}: FireworkBurstProps) {
  const reducedMotion = useReducedMotion();
  const particles = useMemo(() => buildParticles(seed), [seed]);

  if (!active || reducedMotion) return null;

  return (
    <div
      data-testid="firework-burst"
      aria-hidden
      className="pointer-events-none absolute inset-0 grid place-items-center"
    >
      <div className="relative">
        {particles.map((p, i) => {
          const baseStyle: React.CSSProperties = {
            position: "absolute",
            left: 0,
            top: 0,
            width: `${p.sizePx}px`,
            height: `${p.sizePx}px`,
            ["--angle" as string]: `${p.angleDeg}deg`,
            ["--dist" as string]: `${p.distancePx}px`,
            animationName: "fireworkBurst",
            animationDuration: `${durationMs}ms`,
            animationDelay: `${p.delayMs}ms`,
            animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            animationFillMode: "forwards",
            backgroundColor:
              p.shape === "square" ? "var(--color-success-flash)" : undefined,
            clipPath:
              p.shape === "triangle"
                ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                : undefined,
          };
          if (p.shape === "triangle") {
            baseStyle.backgroundColor = "var(--color-cyan-bar)";
          }
          return <span key={i} data-particle style={baseStyle} />;
        })}
      </div>
    </div>
  );
}
