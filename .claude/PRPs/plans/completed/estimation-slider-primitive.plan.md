# Plan: Estimation Slider Primitive (Phase 3)

## Summary
Build a reusable, mobile-first **vertical drag-to-estimate React component** under `web/src/components/`. Pointer Events drive the drag; release reveals a tolerance band centered on a configured truth value. Anchor tick marks segment the track. No exercise content, no engine round-trip, no `page.tsx` changes — Phase 4 owns composition. The deliverable is a primitive that "scrubs smoothly on Pixel, releases to a value, shows the tolerance band animation" (PRD success signal).

## User Story
As the project owner, I want a polished vertical estimation slider primitive available as a React component, so that Phase 4 can wire it to `equityVs` and produce the first complete drill exercise without redoing the interaction layer.

## Problem → Solution
**Current state:** The web app has only the Phase 2 smoke page (`web/src/app/page.tsx`) — text inputs and an equity readout. There is no `web/src/components/` folder. There is no drag-to-estimate primitive anywhere. Vitest tests all use the node environment and the `src/**/*.test.ts` glob (no `.tsx`, no React rendering).

**Desired state:** A self-contained `EstimationSlider` component lives in `web/src/components/estimation-slider/`. It accepts a numeric `min`/`max` range, a `truth` value, a `tolerance`, and optional `anchors`, and emits `onRelease(value, isWithinTolerance)` after the user lets go. Pure value↔position math is extracted into a tested helper module. A jsdom-backed Vitest config enables a smoke render test of the component (without trying to fake gestures — gesture quality is a manual Pixel check). The Phase 2 smoke page is untouched.

## Metadata
- **Complexity**: Medium
- **Source PRD**: `.claude/PRPs/prds/poker-trainer.prd.md`
- **PRD Phase**: Phase 3 — Estimation slider primitive
- **Estimated Files**: ~9 (6 new, 3 updated)

---

## UX Design

### Before
```
┌─────────────────────────────┐
│  (no slider primitive       │
│   exists yet — only the     │
│   Phase 2 smoke page with   │
│   two text inputs)          │
└─────────────────────────────┘
```

### After (slider in isolation, e.g. Storybook-style harness or Phase 4 screen)
```
       100 ──┐                       <- top anchor
            │
        75 ─┤                        <- anchor tick
            │
            │  ┌───────────┐         <- tolerance band (revealed on release)
        50 ─┤  │░░░░░░░░░░░│         <- truth marker (highlighted line)
            │  └───────────┘
            │
        25 ─┤                        <- anchor tick
            │
            │   ●  user value        <- thumb / current value
         0 ──┘                       <- bottom anchor
```

While dragging: only the thumb tracks the finger; band & truth are hidden.
On release: band fades in (opacity 0→1) and slides up from the truth line (transform); verdict (`close enough` / `not quite`) is exposed via callback for the parent to render.

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Primary input | text typing | vertical pointer drag | Pointer Events API, `setPointerCapture` so a finger that leaves the track keeps tracking |
| Feedback timing | live, every keystroke | only on `pointerup` / `pointercancel` | Avoids spoiling the answer mid-drag |
| Tolerance | n/a | configurable absolute window around `truth` | E.g. `truth=46`, `tolerance=4` → band is `[42, 50]`; verdict is "within" if `|value - truth| <= tolerance` |
| Anchors | n/a | optional `number[]`, e.g. `[0, 25, 50, 75, 100]` | Visual ticks only; do not snap |
| Reduced motion | n/a | reveal animation disabled when `prefers-reduced-motion: reduce` | Per global `web/performance.md` |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `.claude/PRPs/prds/poker-trainer.prd.md` | 142-179 | Phase 3 scope, success signal, target = Chrome on Android |
| P0 | `.claude/PRPs/reports/equity-engine-api-report.md` | 89-96 | Confirms boundary: `page.tsx` is Phase 4's; build under `components/` |
| P0 | `web/AGENTS.md` | all | "This is NOT the Next.js you know" — Next 16 + React 19 + Tailwind 4. Read `node_modules/next/dist/docs/` if uncertain |
| P0 | `web/src/app/page.tsx` | all (130) | Mirror its prop-typing, `"use client"` placement, small-component pattern (HandInput, ResultLine) |
| P0 | `web/src/lib/engine.ts` | all (26) | Module style: explicit `interface`, named exports, no default export |
| P0 | `web/src/lib/engine.test.ts` | all (56) | Test style: `describe` + `it`, AAA layout, `expect(...).toBeGreaterThan/Less/...`, table-driven cases |
| P0 | `web/vitest.config.ts` | all (16) | Current node-env, `src/**/*.test.ts` glob — both need extending for component tests |
| P0 | `web/package.json` | all | `vitest@^2`, no `@testing-library/react`, no `jsdom`, no `@vitejs/plugin-react` yet |
| P0 | `~/.claude/rules/web/coding-style.md` | all | File organization (feature folders), CSS custom properties, animation-only properties |
| P0 | `~/.claude/rules/web/performance.md` | all | Animate compositor-friendly props only (transform/opacity); reduced-motion rule |
| P0 | `~/.claude/rules/web/design-quality.md` | all | Anti-template policy — slider must not look generic |
| P1 | `web/node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` | all | Authoritative Next 16 setup for `@testing-library/react` + jsdom + `@vitejs/plugin-react` |
| P1 | `web/src/app/globals.css` | all | Tailwind 4 `@import "tailwindcss"` + `@theme inline` block — pattern for any new tokens |
| P1 | `web/src/app/layout.tsx` | all (33) | Geist fonts via CSS vars (`--font-geist-sans`, `--font-geist-mono`) — available everywhere |
| P2 | `.claude/PRPs/plans/completed/equity-engine-api.plan.md` | all | Same template, same tone — keep this plan stylistically consistent |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Pointer Events spec | https://www.w3.org/TR/pointerevents3/ | One unified event stream for mouse/touch/pen; `setPointerCapture` + `releasePointerCapture` are mandatory for drag UX |
| `setPointerCapture` semantics | MDN: Element.setPointerCapture | Capture must be set in the same task as `pointerdown`; capture is auto-released on `pointerup` but explicit `releasePointerCapture` is harmless and idiomatic |
| `touch-action: none` CSS | MDN: touch-action | **CRITICAL** — without `touch-action: none` on the track, Chrome/Android will steal vertical drags for page scroll and your slider will jitter. Set it on the draggable element |
| `prefers-reduced-motion` | MDN: @media (prefers-reduced-motion) | Use `useSyncExternalStore` against `matchMedia` or a small `useReducedMotion` hook; respect both initial state and runtime toggle |
| Next 16 + Vitest + RTL | `web/node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` | Add `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom`; set `environment: 'jsdom'` |

```
KEY_INSIGHT: jsdom does not implement PointerEvent reliably (no pressure, no pointerType nuances). 
APPLIES_TO: Component tests for EstimationSlider.
GOTCHA: Do NOT try to assert on drag-with-pointer-events in jsdom — drive that via manual Pixel testing. Test pure math in isolation; test the component only for *render contract* (renders thumb, anchors, accepts truth/tolerance props, fires onRelease via direct method invocation if exposed).

KEY_INSIGHT: Tailwind 4 uses `@theme inline` in globals.css and is class-based (no config file).
APPLIES_TO: Any new design tokens for the slider (e.g. `--color-band`, `--color-truth`).
GOTCHA: Don't add a `tailwind.config.ts` — the project doesn't have one. Add tokens to `globals.css` `@theme inline` if needed; otherwise stick to existing Tailwind utilities.

KEY_INSIGHT: Animating `height`/`top` is forbidden by `~/.claude/rules/web/coding-style.md` (animation-only properties).
APPLIES_TO: Tolerance band reveal.
GOTCHA: Animate the band with `transform: scaleY(...)` (scale from 0 to 1 around the truth line via `transform-origin`) and `opacity`; do not animate `height` or `top`.

KEY_INSIGHT: Vitest 2 supports `@vitejs/plugin-react` and jsdom out of the box; vite-tsconfig-paths is optional since we already alias `@` manually.
APPLIES_TO: vitest.config.ts changes.
GOTCHA: Keep the existing `engine` → `pkg-node` alias intact — Phase 2 tests rely on it.
```

---

## Patterns to Mirror

### NAMING_CONVENTION
```typescript
// SOURCE: web/src/app/page.tsx:66-71
interface HandInputProps {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
  autoFocus?: boolean;
}

function HandInput({ value, onChange, ariaLabel, autoFocus }: HandInputProps) {
```
- PascalCase component, PascalCase `<Name>Props` interface above the component
- Named function declaration, not arrow
- Destructure props in the parameter list
- No `React.FC`

### MODULE_PATTERN
```typescript
// SOURCE: web/src/lib/engine.ts:1-10
import { count_combos, equity_vs } from "engine";

export interface EngineApi {
  countCombos(rangeStr: string): number;
  equityVs(handA: string, handB: string): number;
}

let cachedPromise: Promise<EngineApi> | null = null;
```
- Named exports only; no default export
- Explicit return types on exported functions

### CLIENT_COMPONENT_HEADER
```typescript
// SOURCE: web/src/app/page.tsx:1-3
"use client";

import { useEffect, useState } from "react";
```
- `"use client"` is required for any component using hooks / Pointer Events

### TEST_STRUCTURE
```typescript
// SOURCE: web/src/lib/engine.test.ts:11-24
describe("EngineApi.equityVs", () => {
  it("returns ~0.81 for AsAh vs KsKh", async () => {
    const api = await getEngine();
    const eq = api.equityVs("AsAh", "KsKh");
    expect(eq).toBeGreaterThan(0.80);
    expect(eq).toBeLessThan(0.83);
  });
```
- `describe` per unit, `it` per behavior
- Arrange-Act-Assert (no comments needed when shape is obvious)
- Table-driven for repeated shape:
```typescript
// SOURCE: web/src/lib/engine.test.ts:41-54
const cases: Array<[string, string, number, string]> = [
  ["AKs", "QQ", 0.4605, "cardfight: 46.05%"],
  ...
];
for (const [a, b, expected, source] of cases) {
  it(`${a} vs ${b} ≈ ${(expected * 100).toFixed(2)}% (${source})`, async () => { ... });
}
```

### TAILWIND_USAGE
```typescript
// SOURCE: web/src/app/page.tsx:42-44
className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8 font-mono dark:bg-black"
```
- Tailwind utilities composed in template strings; both `bg-zinc-50` (light) and `dark:bg-black` paired
- Geist font available via `font-mono` (utility resolves to `var(--font-geist-mono)`)

### ERROR_HANDLING
```typescript
// SOURCE: web/src/app/page.tsx:36-39
try {
  equity = api.equityVs(trimmedA, trimmedB);
} catch (err: unknown) {
  pairError = err instanceof Error ? err.message : String(err);
}
```
- `unknown` catch + `instanceof Error` narrow
- The slider is pure-frontend with no async I/O; its surface for errors is mostly **prop validation** (truth outside [min,max], tolerance < 0). Throw a plain `Error` from the helper module; component renders nothing or a fallback if validation fails.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `web/src/components/estimation-slider/EstimationSlider.tsx` | CREATE | The component itself |
| `web/src/components/estimation-slider/sliderMath.ts` | CREATE | Pure value↔position helpers; testable in node |
| `web/src/components/estimation-slider/sliderMath.test.ts` | CREATE | Unit tests for the helpers (node env) |
| `web/src/components/estimation-slider/EstimationSlider.test.tsx` | CREATE | Render-contract smoke test (jsdom env) |
| `web/src/components/estimation-slider/useReducedMotion.ts` | CREATE | Hook reading `prefers-reduced-motion` via matchMedia |
| `web/src/components/estimation-slider/index.ts` | CREATE | Barrel re-export: `export { EstimationSlider } from "./EstimationSlider"` and types |
| `web/vitest.config.ts` | UPDATE | Switch to jsdom env, add `@vitejs/plugin-react`, extend glob to `**/*.test.{ts,tsx}` |
| `web/package.json` | UPDATE | Add devDeps: `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom` |
| `web/package-lock.json` | UPDATE | Auto from `npm install` |

## NOT Building

- Any change to `web/src/app/page.tsx` — Phase 4 owns it.
- Any engine call (`equityVs`) integration — Phase 4 composes the slider with the engine.
- Card visualization, problem prompts, "next problem" gestures — Phase 4.
- A second slider primitive variant (horizontal, snap-to-anchor, range-of-range, etc.) — YAGNI; only the vertical absolute-value slider is needed for the MVP exercise.
- Persistence (localStorage of last value, etc.) — there is no exercise yet to persist.
- A storybook setup — Phase 4 will host the slider in a real screen; the test file + manual dev-server walkthrough are sufficient.
- Animation libraries (Framer Motion, GSAP) — CSS transitions on `transform`/`opacity` are sufficient; per global perf rules.
- Aesthetic finish (Phase 5). The slider should look *credible* (not template), but the typographic/palette polish is Phase 5.
- Regenerating WASM — no Rust changes; existing `pkg/` and `pkg-node/` artifacts stay as-is.

---

## Step-by-Step Tasks

### Task 1: Add testing dependencies and update Vitest config
- **ACTION**: Install `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom` as devDeps. Update `web/vitest.config.ts` to use the React plugin, switch to `jsdom` environment, and extend the test glob to `**/*.test.{ts,tsx}`. Preserve the `engine` → `pkg-node` alias verbatim.
- **IMPLEMENT**:
  - `cd web && npm install -D @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom`
  - Update `vitest.config.ts`:
    ```ts
    import { defineConfig } from "vitest/config";
    import react from "@vitejs/plugin-react";
    import path from "node:path";

    export default defineConfig({
      plugins: [react()],
      test: {
        environment: "jsdom",
        include: ["src/**/*.test.{ts,tsx}"],
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "src"),
          engine: path.resolve(__dirname, "../engine/pkg-node/engine.js"),
        },
      },
    });
    ```
- **MIRROR**: Existing `vitest.config.ts` shape; the Next 16 vitest guide at `web/node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`.
- **IMPORTS**: `@vitejs/plugin-react`, `vitest/config`, `node:path`.
- **GOTCHA**: jsdom is now the default for `engine.test.ts` too. That test does no DOM work, so it still passes; no per-file environment override needed.
- **VALIDATE**: `cd web && npm test` — all 9 existing tests still green.

### Task 2: Define the public API and prop types
- **ACTION**: Decide and document the component's prop contract before writing internals. Capture as a TypeScript interface at the top of `EstimationSlider.tsx`.
- **IMPLEMENT**:
  ```typescript
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
  ```
- **MIRROR**: `HandInputProps` shape in `web/src/app/page.tsx:66-71`.
- **IMPORTS**: none (interface only).
- **GOTCHA**: Do not export `useState` setters or imperative handles — the component is uncontrolled internally; the parent learns the value only via `onRelease`. This keeps Phase 4 simple.
- **VALIDATE**: `cd web && npx tsc --noEmit --pretty false` clean after the file is created with a stub component body.

### Task 3: Implement pure helpers in `sliderMath.ts`
- **ACTION**: Write three pure functions covering all the math the component needs.
- **IMPLEMENT**:
  ```typescript
  /** Convert a clientY (pixels from viewport top) into a value in [min, max].
   *  Top of the track is `max`, bottom is `min`. Clamps. */
  export function valueFromClientY(
    clientY: number,
    trackTop: number,
    trackHeight: number,
    min: number,
    max: number,
  ): number { /* ... */ }

  /** Convert a value into a 0..1 fraction from the bottom of the track. */
  export function fractionFromValue(value: number, min: number, max: number): number { /* ... */ }

  /** Tolerance hit check. */
  export function isWithinTolerance(value: number, truth: number, tolerance: number): boolean {
    return Math.abs(value - truth) <= tolerance;
  }

  /** Validate prop sanity at component mount. Throws Error with a precise message. */
  export function assertSliderProps(min: number, max: number, truth: number, tolerance: number): void { /* ... */ }
  ```
- **MIRROR**: Pure-function module style of `web/src/lib/engine.ts` — named exports, no class, no state.
- **IMPORTS**: none.
- **GOTCHA**: Y-axis is inverted (top of screen is `max`, larger clientY = smaller value). Bake this into `valueFromClientY` and the tests.
- **VALIDATE**: Tests in Task 4 cover this.

### Task 4: Unit-test the math helpers
- **ACTION**: Write a Vitest spec that exhaustively covers the helpers, including edge clamping and tolerance boundaries.
- **IMPLEMENT**:
  ```typescript
  import { describe, it, expect } from "vitest";
  import {
    valueFromClientY,
    fractionFromValue,
    isWithinTolerance,
    assertSliderProps,
  } from "./sliderMath";

  describe("valueFromClientY", () => {
    it("returns max at the top of the track", () => {
      expect(valueFromClientY(100, 100, 400, 0, 100)).toBe(100);
    });
    it("returns min at the bottom of the track", () => {
      expect(valueFromClientY(500, 100, 400, 0, 100)).toBe(0);
    });
    it("clamps above max when pointer is above the track", () => {
      expect(valueFromClientY(50, 100, 400, 0, 100)).toBe(100);
    });
    it("clamps below min when pointer is below the track", () => {
      expect(valueFromClientY(600, 100, 400, 0, 100)).toBe(0);
    });
    it("interpolates linearly at midpoint", () => {
      expect(valueFromClientY(300, 100, 400, 0, 100)).toBeCloseTo(50, 5);
    });
  });

  describe("isWithinTolerance", () => {
    const cases: Array<[number, number, number, boolean]> = [
      [46, 46, 4, true],
      [42, 46, 4, true],
      [50, 46, 4, true],
      [41.999, 46, 4, false],
      [50.001, 46, 4, false],
    ];
    for (const [value, truth, tol, expected] of cases) {
      it(`|${value} - ${truth}| <= ${tol} → ${expected}`, () => {
        expect(isWithinTolerance(value, truth, tol)).toBe(expected);
      });
    }
  });

  describe("assertSliderProps", () => {
    it("throws when min >= max", () => {
      expect(() => assertSliderProps(100, 0, 50, 4)).toThrow();
    });
    it("throws when truth is outside [min, max]", () => {
      expect(() => assertSliderProps(0, 100, 150, 4)).toThrow();
    });
    it("throws when tolerance is negative", () => {
      expect(() => assertSliderProps(0, 100, 50, -1)).toThrow();
    });
  });
  ```
- **MIRROR**: `web/src/lib/engine.test.ts` — describe/it, table-driven where useful, AAA layout.
- **IMPORTS**: `vitest`, the helpers.
- **GOTCHA**: Use `toBeCloseTo` for any floating-point math; `toBe` only for integer values.
- **VALIDATE**: `cd web && npm test -- sliderMath` — all green.

### Task 5: Implement the `useReducedMotion` hook
- **ACTION**: Create a small hook returning a boolean: `true` when `prefers-reduced-motion: reduce` is matched.
- **IMPLEMENT**:
  ```typescript
  "use client";
  import { useEffect, useState } from "react";

  export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState<boolean>(false);
    useEffect(() => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduced(mql.matches);
      const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }, []);
    return reduced;
  }
  ```
- **MIRROR**: `useDebounce` shape in `~/.claude/rules/typescript/patterns.md`.
- **IMPORTS**: `react`.
- **GOTCHA**: Initial state must be `false` (not `mql.matches`) on the server to avoid hydration mismatch. The `useEffect` runs only on the client, so the matchMedia call is safe there.
- **VALIDATE**: Render the hook in a stub component; `tsc --noEmit` clean.

### Task 6: Implement `EstimationSlider.tsx`
- **ACTION**: Build the component using Pointer Events. Single internal state slot for `value`; one for `released` (false during drag, true after pointerup).
- **IMPLEMENT (sketch — final code follows this shape):**
  ```typescript
  "use client";
  import { useEffect, useRef, useState } from "react";
  import {
    valueFromClientY,
    fractionFromValue,
    isWithinTolerance,
    assertSliderProps,
  } from "./sliderMath";
  import { useReducedMotion } from "./useReducedMotion";

  export interface EstimationSliderProps { /* see Task 2 */ }

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

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setReleased(false);
      setDragging(true);
      setValue(valueFromClientY(e.clientY, rect.top, rect.height, min, max));
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;
      setValue(valueFromClientY(e.clientY, rect.top, rect.height, min, max));
    };
    const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(false);
      setReleased(true);
      onRelease?.(value, isWithinTolerance(value, truth, tolerance));
    };

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
        className="relative h-[60vh] w-16 select-none rounded-full bg-zinc-100 dark:bg-zinc-900"
        style={{ touchAction: "none" }}
        data-released={released ? "true" : "false"}
      >
        {/* tolerance band (revealed on release) */}
        <div
          aria-hidden
          className="absolute left-0 right-0 origin-center bg-emerald-200/60 dark:bg-emerald-500/30 transition-[transform,opacity]"
          style={{
            top: `${(1 - fractionFromValue(truth + tolerance, min, max)) * 100}%`,
            height: `${((tolerance * 2) / (max - min)) * 100}%`,
            transform: released ? "scaleY(1)" : "scaleY(0)",
            opacity: released ? 1 : 0,
            transitionDuration: reducedMotion ? "0ms" : "300ms",
          }}
        />
        {/* truth line (revealed on release) */}
        <div
          aria-hidden
          className="absolute left-0 right-0 h-px bg-emerald-700 dark:bg-emerald-300"
          style={{
            top: `${(1 - fractionFromValue(truth, min, max)) * 100}%`,
            opacity: released ? 1 : 0,
            transition: reducedMotion ? "none" : "opacity 300ms",
          }}
        />
        {/* anchor ticks */}
        {(anchors ?? []).map((a) => (
          <div
            key={a}
            aria-hidden
            className="absolute left-0 right-0 h-px bg-zinc-400/60 dark:bg-zinc-600/60"
            style={{ top: `${(1 - fractionFromValue(a, min, max)) * 100}%` }}
          />
        ))}
        {/* thumb */}
        <div
          aria-hidden
          className="absolute left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900 shadow-md dark:bg-zinc-100"
          style={{ top: `${(1 - fractionFromValue(value, min, max)) * 100}%` }}
        />
      </div>
    );
  }
  ```
- **MIRROR**: `HandInput` (small, single-purpose, named-function component) in `web/src/app/page.tsx:73-88`. Tailwind class style.
- **IMPORTS**: `react` (`useEffect`, `useRef`, `useState`), local `./sliderMath`, local `./useReducedMotion`.
- **GOTCHA**:
  1. **`touch-action: none` is mandatory.** Without it, Chrome on Android steals vertical drags for page scroll. Set as inline style (Tailwind 4 doesn't ship a `touch-action-none` class by default in this repo).
  2. **Top is max, bottom is min.** Visual `top: X%` corresponds to `1 - fraction`.
  3. `position: absolute` on band/truth/thumb requires `position: relative` on the track — the `relative` class handles it.
  4. `setPointerCapture` must be called on the same element receiving subsequent `pointermove`. Capturing on `e.currentTarget` is correct.
  5. The component validates props at *render time* via `assertSliderProps`. If you'd rather not throw inside render, move the assertion into a `useEffect` that calls `console.error` — but throwing is fine for a prototype and surfaces bad inputs loudly during Phase 4 wiring.
  6. The `transition-[transform,opacity]` Tailwind 4 arbitrary-property class may need a `transitionProperty` style fallback if Tailwind's JIT misses it; verify after `npm run dev`. Inline `transition` in the style attr is a safe alternative.
- **VALIDATE**: `cd web && npx tsc --noEmit --pretty false` and `cd web && npm run lint` both clean.

### Task 7: Add a barrel export
- **ACTION**: Create `web/src/components/estimation-slider/index.ts` that re-exports the public surface.
- **IMPLEMENT**:
  ```typescript
  export { EstimationSlider } from "./EstimationSlider";
  export type { EstimationSliderProps } from "./EstimationSlider";
  ```
- **MIRROR**: None — there's no existing barrel in this repo, but this is the standard idiom and keeps Phase 4's import as `import { EstimationSlider } from "@/components/estimation-slider"`.
- **IMPORTS**: none.
- **GOTCHA**: None.
- **VALIDATE**: `tsc --noEmit` clean.

### Task 8: Component render-contract test
- **ACTION**: Write a Vitest+RTL smoke test that asserts the rendered DOM contract — does **not** attempt to fake gesture flows.
- **IMPLEMENT**:
  ```typescript
  // EstimationSlider.test.tsx
  import { describe, it, expect } from "vitest";
  import { render } from "@testing-library/react";
  import { EstimationSlider } from "./EstimationSlider";

  describe("EstimationSlider — render contract", () => {
    it("renders a vertical slider role with min/max/now", () => {
      const { getByRole } = render(
        <EstimationSlider truth={46} tolerance={4} min={0} max={100} initialValue={50} />,
      );
      const slider = getByRole("slider");
      expect(slider.getAttribute("aria-orientation")).toBe("vertical");
      expect(slider.getAttribute("aria-valuemin")).toBe("0");
      expect(slider.getAttribute("aria-valuemax")).toBe("100");
      expect(slider.getAttribute("aria-valuenow")).toBe("50");
    });

    it("renders one tick per anchor", () => {
      const { container } = render(
        <EstimationSlider truth={46} tolerance={4} anchors={[0, 25, 50, 75, 100]} />,
      );
      // Each anchor renders a div with bg-zinc-400/60 — assert by count of those nodes.
      const ticks = container.querySelectorAll('[aria-hidden][class*="bg-zinc-400"]');
      expect(ticks.length).toBe(5);
    });

    it("hides the band before release (data-released=false)", () => {
      const { getByRole } = render(<EstimationSlider truth={46} tolerance={4} />);
      expect(getByRole("slider").getAttribute("data-released")).toBe("false");
    });

    it("throws when truth is outside [min, max]", () => {
      // RTL surfaces the throw via the render call.
      expect(() => render(<EstimationSlider truth={150} tolerance={4} />)).toThrow();
    });
  });
  ```
- **MIRROR**: `web/src/lib/engine.test.ts` style — `describe`/`it`, AAA, no comments where the shape is obvious.
- **IMPORTS**: `vitest`, `@testing-library/react`, the component.
- **GOTCHA**:
  1. Do not test pointer gestures here. jsdom + React Testing Library do not faithfully simulate pointer capture, and brittle gesture tests waste budget. Manual Pixel testing covers the gesture (PRD success signal).
  2. Each test renders fresh; no `cleanup()` needed (Vitest + `@testing-library/react` ≥13 auto-cleans).
- **VALIDATE**: `cd web && npm test` — total now 9 (engine) + ~12 (math) + 4 (component) green.

### Task 9: Manual Pixel walkthrough
- **ACTION**: Verify on the actual target device. Since `page.tsx` is off-limits, host the slider on a temporary route that we delete after this phase, **OR** rely on Phase 4 for on-device verification. Choose the second path to honor the "do not change page.tsx" boundary.
- **IMPLEMENT**:
  - Document in the implementation report that on-device gesture verification is **deferred to Phase 4** — once `page.tsx` is replaced, the slider gets exercised on Pixel as part of the exercise screen smoke test.
  - However, do still run `npm run dev` locally and at least confirm: (a) the dev server boots, (b) `tsc --noEmit` is clean, (c) `npm run lint` is clean, (d) all tests pass.
- **MIRROR**: Phase 2 deferred its on-device check to the user; do the same here.
- **IMPORTS**: none.
- **GOTCHA**: Resist the temptation to add a `/slider-test` route to demo the primitive — it's scope creep and will need to be torn out in Phase 4.
- **VALIDATE**: Implementation report explicitly notes the deferral and lists the validation commands that *did* run.

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `valueFromClientY` top | clientY=trackTop | `max` | boundary |
| `valueFromClientY` bottom | clientY=trackTop+trackHeight | `min` | boundary |
| `valueFromClientY` above | clientY < trackTop | `max` (clamped) | yes |
| `valueFromClientY` below | clientY > trackTop+trackHeight | `min` (clamped) | yes |
| `valueFromClientY` middle | midpoint | `(min+max)/2` | no |
| `isWithinTolerance` exact | value=truth | `true` | no |
| `isWithinTolerance` boundary | value=truth±tolerance | `true` | yes |
| `isWithinTolerance` just outside | value=truth+tolerance+ε | `false` | yes |
| `assertSliderProps` min≥max | (100,0,50,4) | throws | yes |
| `assertSliderProps` truth out of range | (0,100,150,4) | throws | yes |
| `assertSliderProps` negative tolerance | (0,100,50,-1) | throws | yes |
| `EstimationSlider` aria | `truth=46, tolerance=4, initialValue=50` | role+aria-* attributes correct | no |
| `EstimationSlider` anchors | `anchors=[0,25,50,75,100]` | 5 tick nodes | no |
| `EstimationSlider` pre-release | default | `data-released="false"` | no |
| `EstimationSlider` invalid truth | `truth=150` | render throws | yes |

### Edge Cases Checklist
- [ ] `truth` exactly at `min` or `max`
- [ ] `tolerance = 0` (only exact value counts)
- [ ] `tolerance` larger than half the range (band covers entire track — should still render without overflow)
- [ ] `anchors = []` (no ticks)
- [ ] `initialValue` outside [min, max] (clamp or throw — choose throw, validate)
- [ ] Reduced motion enabled — band reveal is instant (transition-duration 0ms)
- [ ] Pointer leaves the track during drag — captured pointer keeps tracking (verified manually on Pixel in Phase 4)

---

## Validation Commands

### Static Analysis
```bash
cd web && npx tsc --noEmit --pretty false
```
EXPECT: Zero type errors.

```bash
cd web && npm run lint
```
EXPECT: Zero lint errors.

### Unit Tests
```bash
cd web && npm test
```
EXPECT: All tests pass — the original 9 engine tests + new math tests + new component tests.

### Build
```bash
cd web && npm run build
```
EXPECT: Next 16 + Turbopack build succeeds. The slider is not yet imported anywhere, so it should be tree-shaken — verify it does **not** balloon the bundle.

### Browser Validation (manual, smoke only)
```bash
cd web && npm run dev
```
EXPECT: Dev server boots. Phase 2 smoke page (`/`) still loads and equityVs still works (regression check). On-device gesture verification deferred to Phase 4.

### Manual Validation
- [ ] `web/src/app/page.tsx` is byte-identical to its pre-Phase-3 contents (`git diff -- web/src/app/page.tsx` empty).
- [ ] No new top-level routes have been added under `web/src/app/`.
- [ ] `web/src/components/estimation-slider/` exists with all six files.
- [ ] Imports in the new files do not reference `engine` (no premature engine coupling).
- [ ] `assertSliderProps` is called inside the component so bad props fail loudly.

---

## Acceptance Criteria
- [ ] `EstimationSlider` and `EstimationSliderProps` are exported from `@/components/estimation-slider`.
- [ ] All math helpers in `sliderMath.ts` are pure and individually unit-tested.
- [ ] `useReducedMotion` returns `true` when `prefers-reduced-motion: reduce` is matched.
- [ ] `touch-action: none` is set on the track element.
- [ ] Pointer Events (`pointerdown`/`pointermove`/`pointerup`/`pointercancel`) drive all dragging.
- [ ] Tolerance band is hidden during drag and revealed via `transform`+`opacity` on release (or instantly under reduced motion).
- [ ] All Vitest tests pass; static analysis (tsc + ESLint) clean.
- [ ] `web/src/app/page.tsx` is unchanged.
- [ ] PRD Phase 3 success signal observed via *manual* `npm run dev` + isolated smoke (or deferred to Phase 4 with explicit note in the implementation report).

## Completion Checklist
- [ ] Code follows the discovered patterns (PascalCase props interface, named-function components, named exports).
- [ ] Animations stay on `transform` / `opacity` only — no `top`/`height`/layout-bound transitions.
- [ ] No `console.log` left behind.
- [ ] No engine import in any slider file.
- [ ] No new dev dependency outside of those listed in Task 1.
- [ ] Implementation report drafted at `.claude/PRPs/reports/estimation-slider-primitive-report.md` after the work is done.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| jsdom can't faithfully test gestures, so we ship a slider that *renders* correctly but *feels* wrong on Pixel | MEDIUM | HIGH (this is the whole point of the phase) | Reserve gesture verification for the real Pixel during Phase 4 smoke; if Phase 4 finds jank, the fix is local to this primitive |
| `touch-action: none` forgotten → vertical drags hijacked by page scroll on Android | LOW | HIGH | Explicit GOTCHA in Task 6; manual Pixel check |
| Tailwind 4 arbitrary-property `transition-[transform,opacity]` doesn't generate a class | LOW | LOW | Inline `transition` in `style` is the documented fallback |
| Hydration mismatch from `useReducedMotion` returning the wrong initial value on the server | LOW | MEDIUM | Initial `useState(false)`; only update inside `useEffect` |
| Engine `pkg-node/` regenerate dance gets accidentally re-triggered | LOW | LOW | Phase 3 makes no Rust changes — note in report |

## Notes
- **Phase 4 needs**: An import like `import { EstimationSlider } from "@/components/estimation-slider";` and the prop contract documented in Task 2 — both are deliverables of Phase 3.
- **Aesthetic posture**: This phase aims for "credible default" — *not* generic shadcn/Tailwind template (per `~/.claude/rules/web/design-quality.md`). Phase 5 polishes typography, palette, and motion curves; Phase 3 commits to vertical layout + tolerance-band reveal as the visual identity.
- **Why no horizontal variant?** The PRD's reference (Elevate) and the success signal both specify vertical. YAGNI — add horizontal only when a future exercise demands it.
- **Carry-over from prior session**:
  - Engine + JS API are complete and trusted; `equityVs` matches cardfight to 4 decimals.
  - WASM bundle is 233 KB gzipped (over 80 KB target) — accepted; revisit in Phase 4/5 if perf bites.
  - `pkg-node/` is now tracked in git but must be regenerated (`wasm-pack build --target nodejs --out-dir pkg-node` from `engine/`) whenever Rust changes — n/a this phase.
  - User may want a Phase-2 commit before starting Phase 3 (~1,800 line diff currently uncommitted on `main`). Worth flagging at kickoff but not part of this plan's tasks.
