# Plan: Elevate-Style UI Rebuild (Phase 5)

## Summary
Rebuild the exercise screen and slider primitive to match the Elevate gameplay aesthetic spec in the PRD. Replace the vertical-track + thumb slider with a **bottom-bar-that-lifts-into-a-cyan-bar** gesture, add a dotted Y-axis with square tick markers + numeric labels, simplify card rendering to vertical rank+suit rectangles, implement four explicit screen states (idle / dragging / success / miss), add the "ACTUAL EQUITY" speech-bubble tooltip, render geometric firework bursts on success, and auto-advance to the next problem (no "next" button).

## User Story
As the project owner, I want the exercise to feel like Elevate's drag-to-estimate loop applied to poker — one tactile gesture, one clean reveal, and the next problem arrives on its own — so that I'd actually reach for this app instead of doomscrolling, and I'd show it to a friend without apologizing.

## Problem → Solution
**Current state:** A "credible default" exercise screen at `web/src/app/page.tsx → ExerciseScreen` composes a vertical track + thumb `EstimationSlider`, two stacked `HandDisplay`s with bordered cards, and a `FeedbackPanel` with a manual "next →" button. It works, but it reads as a stock Tailwind UI: zinc-50 surface, zinc-300 borders, emerald verdict text, no theatrics on release. The interaction primitive (vertical track) is right-side-of-the-screen and uses a circular thumb — not the bottom-bar-lift-gesture the spec calls for.

**Desired state:** The screen has four distinct visual states matching the PRD UI Spec (sections A–F):
- **Idle** — near-white surface, two simplified hands stacked center, dotted Y-axis with square ticks at 0/20/40/60/80/100 on the left edge, light-purple/grey horizontal control bar at the bottom with prompt copy and an upward arrow.
- **Dragging** — full-screen ~70% black overlay (hands recede), bottom bar transforms into a solid cyan bar tracking the finger, small cyan pointer arrow anchored to the Y-axis at the matching height, axis labels lift in contrast.
- **Success (within ±10%)** — single-frame bright green flash, encouraging copy ("bullseye" / "nice") above the cyan bar, white speech-bubble tooltip drops from the bar with **"ACTUAL EQUITY"** label and the percentage in massive bold type, geometric firework burst (squares + triangles) radiates from center for ≤600ms.
- **Miss (outside ±10%)** — soft neutral grey settle (no flash, no fireworks), non-committal copy ("close-ish" / "maybe next time") above the bar, same speech-bubble tooltip.
- **Auto-advance** — cross-fade to the next problem ~1.2s after success, ~1.8s after miss; no tap, no button.

Tolerance widens to ±10% (PRD spec for hand-vs-hand). Reduced-motion path collapses every flash, firework, and cross-fade to instant.

## Metadata
- **Complexity**: Large
- **Source PRD**: `.claude/PRPs/prds/poker-trainer.prd.md`
- **PRD Phase**: Phase 5 — Elevate-style UI rebuild
- **Estimated Files**: ~15 (10 new, 5 updated)

---

## UX Design

### Before (idle — current Phase 4 build)
```
┌────────────────────────────────────┐
│   What's the equity of Hand A?     │
│                                    │
│   ┌────┐ ┌────┐                    │
│   │ A♠ │ │ K♠ │     ┃ 100          │
│   └────┘ └────┘     ┃ ─            │
│         vs          ┃              │
│   ┌────┐ ┌────┐     ┃ ─  50        │
│   │ Q♥ │ │ Q♦ │     ┃              │
│   └────┘ └────┘     ┃ ●            │
│                     ┃ 0            │
│           [hidden feedback row]    │
└────────────────────────────────────┘
```

### After — idle
```
┌────────────────────────────────────┐
│ ▫ 100                              │
│ ┊                                  │
│ ▫ 80          ┌──┐ ┌──┐            │
│ ┊             │A │ │K │            │
│ ▫ 60          │♠ │ │♠ │            │
│ ┊             └──┘ └──┘            │
│ ▫ 40                vs             │
│ ┊             ┌──┐ ┌──┐            │
│ ▫ 20          │Q │ │Q │            │
│ ┊             │♥ │ │♦ │            │
│ ▫ 0           └──┘ └──┘            │
│                                    │
│ ╭────────────────────────────────╮ │
│ │     drag to estimate equity ↑  │ │
│ ╰────────────────────────────────╯ │
└────────────────────────────────────┘
```

### After — dragging
```
┌────────────────────────────────────┐ (overlay ~70% black)
│ ▫ 100                              │ (axis labels high contrast)
│ ┊                                  │
│ ▫ 80          ░░░░░░░░░░░░         │ (hands faded)
│ ┊             ░░A░░░K░░░░░         │
│ ▫ 60                               │
│ ┊                                  │
│ ▫ 40 ◀  ←── cyan pointer anchored  │
│ ┊         to axis at current value │
│ ▫ 20                               │
│ ┊                                  │
│ ▫ 0                                │
│                                    │
│ ████████████████████████████████   │ (cyan bar, full width)
│                                    │ (vertically follows finger)
└────────────────────────────────────┘
```

### After — success
```
┌────────────────────────────────────┐
│  ✦      ▪    ▴                     │ (geometric firework burst)
│      ▴    ◢                  ▪     │ (squares + triangles, ≤600ms)
│ ▫ 100             nice             │ (copy above bar)
│ ┊             ╭──────────╮         │
│ ▫ 80          │  ACTUAL  │         │ (speech bubble drops from bar)
│ ┊             │  EQUITY  │         │
│ ▫ 60          │  46.3%   │         │
│ ┊             ╰────▼─────╯         │
│ ▫ 40                               │
│ ┊                                  │ (single-frame green flash settles)
│ ████████████████████████████████   │ (cyan bar at release position)
└────────────────────────────────────┘
```

### After — miss
```
┌────────────────────────────────────┐ (soft neutral grey, no flash)
│ ▫ 100             close-ish        │
│ ┊             ╭──────────╮         │
│ ▫ 80          │  ACTUAL  │         │
│ ┊             │  EQUITY  │         │
│ ▫ 60          │  46.3%   │         │
│ ┊             ╰────▼─────╯         │
│ ▫ 40                               │
│ ┊                                  │
│ ████████████████████████████████   │
└────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Slider gesture | Touch the right-side track at the desired value | Touch the bottom bar, drag upward to lift it; release where it lands on the Y-axis | One-thumb-reach on phone; bar's vertical position = the estimate |
| Reveal | Truth line + tolerance band animate inside the slider | Truth shown in a "ACTUAL EQUITY" speech-bubble tooltip dropping from the bar; no band visualization | Binary success/miss only; band is implicit |
| Tolerance | ±5% | ±10% | PRD spec for hand-vs-hand |
| Verdict | "close enough" / "not quite" text | "bullseye"/"nice" (success) or "close-ish"/"maybe next time" (miss); copy varies per release | Strings live in a small constants array, picked deterministically per release |
| Success cue | Emerald-tinted text | Single-frame green-flash background + geometric firework burst | Compositor-only motion, ≤600ms |
| Miss cue | Rose-tinted text | Soft neutral grey settle background | No flash, no fireworks |
| Advance | Tap "next →" button | Auto-advance after ~1.2s success / ~1.8s miss via cross-fade | URL still updates via `router.replace` so refresh reproduces |
| Card style | Bordered playing card with rotated bottom rank | Vertical rectangle, rank character on top + suit symbol centered, no border art | Simplified per spec |
| Cards in dragging | Stay visible | Fade to background-layer opacity | Hands recede so the cyan bar + axis dominate |

---

## Mandatory Reading

Files that MUST be read before implementing:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `.claude/PRPs/prds/poker-trainer.prd.md` | 102–151, 216–229 | The UI Spec (sections A–F) and Phase 5 scope are the source of truth for every visual decision |
| P0 | `web/AGENTS.md` | all | "This is NOT the Next.js you know" — read `node_modules/next/dist/docs/` for any Next.js API before using it |
| P0 | `web/src/components/exercise/ExerciseScreen.tsx` | all | Composition shell to rebuild — keeps `getEngine` lifecycle, URL-seeded problem, `truthPercent`, `randomHandPair`, `router.replace` flow |
| P0 | `web/src/components/estimation-slider/EstimationSlider.tsx` | all | Old primitive — being replaced. Reuse `sliderMath.ts` (pure functions) but rebuild the component surface |
| P0 | `web/src/components/estimation-slider/sliderMath.ts` | all | Reusable pure helpers: `valueFromClientY`, `fractionFromValue`, `isWithinTolerance`, `assertSliderProps` — keep as-is |
| P0 | `web/src/components/estimation-slider/useReducedMotion.ts` | all | Reuse verbatim; needed by every animated state in the new build |
| P1 | `web/src/components/exercise/exerciseConfig.ts` | all | Update `EQUITY_TOLERANCE` from 5 to 10; revisit anchors (PRD spec is 0/20/40/60/80/100, not 0/25/50/75/100) |
| P1 | `web/src/components/exercise/PlayingCard.tsx` | all | Being replaced with simplified vertical rect; same `data-testid="playing-card"` to keep tests passing |
| P1 | `web/src/components/exercise/HandDisplay.tsx` | all | Stays but gets a new layout (no label, hands stacked vertically, no border between cards) |
| P1 | `web/src/components/exercise/FeedbackPanel.tsx` | all | Replaced by the new state machine (idle/dragging/success/miss) — file deleted |
| P1 | `web/src/components/exercise/ExerciseScreen.test.tsx` | all | Update assertions: no more "next" button, slider role becomes a `<div role="slider">` with `aria-orientation="vertical"` still, but mounted differently |
| P1 | `web/src/components/estimation-slider/EstimationSlider.test.tsx` | all | Tests that still apply to the new primitive (aria-slider role, valuemin/max/now, throws on bad props); drop tick + thumb assertions |
| P2 | `web/src/components/exercise/problem.ts` | all | No changes needed; reference for `randomHandPair`, `parseHand`, `formatCard` shapes |
| P2 | `web/src/lib/engine.ts` | all | No changes needed; reference for `EngineApi.equityVs(handA, handB) → number` (0..1 fraction) |
| P2 | `web/src/app/globals.css` | all | Add CSS custom properties for the new palette; current file is near-empty Tailwind 4 import + dark scheme tokens |
| P2 | `web/src/app/layout.tsx` | all | Geist Sans + Geist Mono already wired via `--font-geist-sans` / `--font-geist-mono`; reuse |
| P2 | `web/next.config.ts` | all | Turbopack root is `..` (monorepo); no change needed |
| P2 | `.claude/PRPs/plans/completed/exercise-screen.plan.md` | 1–80 | Prior plan; informs naming + composition style for this rebuild |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Pointer Events on the bottom-bar handle | MDN — `setPointerCapture` | Capture on `pointerdown` so the bar tracks the finger even when it moves outside the original element. Already used in `EstimationSlider`; mirror that pattern |
| `prefers-reduced-motion` | already wired via `useReducedMotion` hook | All flashes/fireworks/cross-fades degrade to instant when reduced motion is set |
| Tailwind v4 theme tokens | `tailwindcss` v4 docs | This project uses `@theme inline` in `globals.css` (Tailwind v4 syntax). Add new tokens (`--color-cyan-bar`, `--color-success-flash`, etc.) inside the existing `@theme inline` block |
| Next.js 16 (this version) | `web/node_modules/next/dist/docs/` | "This is NOT the Next.js you know" — verify any Next API you reach for. `useRouter`/`useSearchParams` from `next/navigation` are still in use; that pattern is established in `ExerciseScreen.tsx` |

If anything else is uncertain about the Next.js 16 surface, read the local docs before guessing — per `web/AGENTS.md`.

---

## Patterns to Mirror

### NAMING_CONVENTION
```ts
// SOURCE: web/src/components/estimation-slider/EstimationSlider.tsx:31-40
export function EstimationSlider({
  min = 0,
  max = 100,
  truth,
  ...
}: EstimationSliderProps) {
```
- Components: PascalCase (`EstimationBar`, `EquityAxis`, `FireworkBurst`, `ActualEquityTooltip`)
- Hooks: `use` prefix camelCase (`useReducedMotion`, `useAutoAdvance`)
- Pure helpers: camelCase (`valueFromClientY`, `fractionFromValue`)
- Constants: `UPPER_SNAKE_CASE` exported from a `*Config.ts` file (`EQUITY_TOLERANCE`, `EQUITY_ANCHORS`, `SUCCESS_HOLD_MS`, `MISS_HOLD_MS`)
- Folders: kebab-case (`estimation-bar/`, `equity-axis/`)

### POINTER_CAPTURE_PATTERN
```ts
// SOURCE: web/src/components/estimation-slider/EstimationSlider.tsx:55-75
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
```
Mirror exactly in the new `EstimationBar`. Same handlers: down/move/up/cancel. Same `touchAction: "none"`. Same `setPointerCapture`/`hasPointerCapture` guard.

### REDUCED_MOTION_PATTERN
```ts
// SOURCE: web/src/components/estimation-slider/EstimationSlider.tsx:47, 85
const reducedMotion = useReducedMotion();
const transitionDuration = reducedMotion ? "0ms" : "300ms";
```
Every transition duration in the new components must be derived from `useReducedMotion`. No hardcoded `transition-duration` strings.

### SLIDER_ARIA_PATTERN
```tsx
// SOURCE: web/src/components/estimation-slider/EstimationSlider.tsx:88-105
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
  ...
  style={{ touchAction: "none" }}
  data-released={released ? "true" : "false"}
  data-dragging={dragging ? "true" : "false"}
>
```
The new bottom-bar handle still carries `role="slider"` + the four ARIA attributes + `data-released` / `data-dragging`. Existing tests rely on these.

### ENGINE_LIFECYCLE_PATTERN
```ts
// SOURCE: web/src/components/exercise/ExerciseScreen.tsx:25-40
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
  return () => { cancelled = true; };
}, []);
```
Keep verbatim. Engine init is unchanged.

### URL_SEED_PATTERN
```ts
// SOURCE: web/src/components/exercise/ExerciseScreen.tsx:42-56
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
```
Keep verbatim. Auto-advance writes the next pair via the same `router.replace(`?${params.toString()}`)` call.

### IMMUTABLE_STATE_PATTERN
```ts
// SOURCE: web/src/components/exercise/ExerciseScreen.tsx:12-23
interface ReleaseState {
  problemKey: string;
  value: number;
  isWithinTolerance: boolean;
}
const [release, setRelease] = useState<ReleaseState | null>(null);
```
New state machine uses a discriminated union, not boolean flags:
```ts
type ScreenPhase =
  | { kind: "idle" }
  | { kind: "dragging"; value: number }
  | { kind: "success"; value: number; truthPercent: number }
  | { kind: "miss"; value: number; truthPercent: number };
```
Always `setPhase({ kind: "...", ... })` — never mutate.

### TEST_STRUCTURE
```ts
// SOURCE: web/src/components/exercise/ExerciseScreen.test.tsx:1-13
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExerciseScreen } from "./ExerciseScreen";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("a=AsKs&b=QhQd"),
}));

beforeEach(() => { replaceMock.mockClear(); });
```
Use this exact `next/navigation` mock in any test that mounts `ExerciseScreen`. `engine` resolves to `pkg-node` via `vitest.config.ts` alias — no engine mock needed.

### TEST_NAMING_PATTERN
```ts
// SOURCE: web/src/components/exercise/ExerciseScreen.test.tsx:15
describe("ExerciseScreen — render contract", () => {
  it("renders the prompt", async () => { ... });
});
```
`describe("ComponentName — concern", () => { it("does X", ...) })`.

### DATA_TESTID_PATTERN
```tsx
// SOURCE: web/src/components/exercise/PlayingCard.tsx:34, web/src/components/exercise/HandDisplay.tsx:20
data-testid="playing-card"
data-testid="hand-display"
```
New components add stable testids: `data-testid="estimation-bar"`, `data-testid="equity-axis"`, `data-testid="actual-equity-tooltip"`, `data-testid="firework-burst"`, `data-screen-phase="idle|dragging|success|miss"` on the screen root.

### CONFIG_CONSTANT_PATTERN
```ts
// SOURCE: web/src/components/exercise/exerciseConfig.ts
export const EQUITY_TOLERANCE = 5;
export const EQUITY_ANCHORS: readonly number[] = [0, 25, 50, 75, 100];
```
Keep this file; widen tolerance to 10, change anchors to `[0, 20, 40, 60, 80, 100]`. Add hold timings, copy banks, palette tokens here.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `web/src/components/estimation-bar/EstimationBar.tsx` | CREATE | New bottom-bar primitive. Same `(value, isWithinTolerance)` release contract; new gesture surface |
| `web/src/components/estimation-bar/EstimationBar.test.tsx` | CREATE | Render contract: aria slider role, vertical orientation, valuemin/max/now, `touch-action: none`, throws on bad props, `data-dragging` toggles on pointer events |
| `web/src/components/estimation-bar/index.ts` | CREATE | Public surface: `export { EstimationBar }`, `export type { EstimationBarProps }` |
| `web/src/components/equity-axis/EquityAxis.tsx` | CREATE | Dotted vertical Y-axis with square ticks at configurable values (0/20/40/60/80/100). Two style modes: `idle` (low contrast) and `dragging` (high contrast). Optional `pointerValue` prop renders the cyan pointer arrow at that value |
| `web/src/components/equity-axis/EquityAxis.test.tsx` | CREATE | Renders one tick per value; pointer hidden when `pointerValue` is undefined; visual contrast switches via `data-mode` |
| `web/src/components/equity-axis/index.ts` | CREATE | `export { EquityAxis }` |
| `web/src/components/feedback/ActualEquityTooltip.tsx` | CREATE | White speech-bubble component, `ACTUAL EQUITY` label + massive bold percentage; props: `percent: number`, `visible: boolean` |
| `web/src/components/feedback/FireworkBurst.tsx` | CREATE | Geometric burst; renders N small squares + triangles radiating via `transform: translate(...) scale(...)` and `opacity`. Mounted only on success; respects reduced motion (renders nothing) |
| `web/src/components/feedback/feedbackCopy.ts` | CREATE | `SUCCESS_PHRASES = ["bullseye", "nice", ...]`, `MISS_PHRASES = ["close-ish", "maybe next time", ...]`. Pure picker `pickPhrase(seed: string, kind: "success" \| "miss")` so a given problem-release deterministically gets the same copy |
| `web/src/components/feedback/feedbackCopy.test.ts` | CREATE | Picker is deterministic per seed; phrases are non-empty |
| `web/src/components/feedback/index.ts` | CREATE | Re-export tooltip + burst + picker |
| `web/src/hooks/useAutoAdvance.ts` | CREATE | `useAutoAdvance(active, delayMs, onAdvance)` — sets a timer when `active` becomes true; clears on unmount or `active`→false; reduced-motion mode runs `onAdvance` on next animation frame |
| `web/src/hooks/useAutoAdvance.test.ts` | CREATE | Fires once after `delayMs`, cancels on unmount, no-op when inactive |
| `web/src/components/exercise/ExerciseScreen.tsx` | UPDATE | Switch from `EstimationSlider`+`FeedbackPanel` to the new state-machine layout (axis left, hands center, bar bottom, overlay/tooltip/firework on release, auto-advance) |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | UPDATE | Drop "next button" and "feedback-panel" assertions; add phase-driven assertions (`data-screen-phase`); add a release simulation that asserts auto-advance triggers `router.replace` |
| `web/src/components/exercise/PlayingCard.tsx` | UPDATE | Simplify to vertical rectangle: rank character top, suit symbol centered, no rotated rank. Keep `data-testid`, `data-rank`, `data-suit`, aria-label |
| `web/src/components/exercise/HandDisplay.tsx` | UPDATE | Drop the "Hand A" / "Hand B" label; layout is just the two cards side-by-side. The screen positions hands; no label needed in the simplified card UI |
| `web/src/components/exercise/exerciseConfig.ts` | UPDATE | `EQUITY_TOLERANCE = 10`, `EQUITY_ANCHORS = [0, 20, 40, 60, 80, 100]`, add `SUCCESS_HOLD_MS = 1200`, `MISS_HOLD_MS = 1800`, `FIREWORK_DURATION_MS = 600`. |
| `web/src/app/globals.css` | UPDATE | Add CSS custom properties inside `@theme inline`: `--color-cyan-bar: oklch(74% 0.15 220)`, `--color-success-flash: oklch(78% 0.22 145)`, `--color-miss-settle: oklch(88% 0 0)`, `--color-overlay: oklch(15% 0 0 / 0.7)`, `--color-control-idle: oklch(85% 0.04 290)`. Tune in implementation if necessary |
| `web/src/components/estimation-slider/` | DELETE (after migration) | Only after the new `EstimationBar` lands and `ExerciseScreen` no longer imports the old slider. The pure helpers `sliderMath.ts` move to `web/src/lib/sliderMath.ts` first so the new primitive can reuse them |
| `web/src/components/exercise/FeedbackPanel.tsx` | DELETE | Replaced by the per-phase rendering in `ExerciseScreen` + the new tooltip + burst components |
| `web/src/lib/sliderMath.ts` | CREATE | Move `valueFromClientY`, `fractionFromValue`, `isWithinTolerance`, `assertSliderProps` here. Same exports, same tests (relocated) |
| `web/src/lib/sliderMath.test.ts` | CREATE | Move existing slider math tests verbatim |

## NOT Building

- Multiple exercise types (only hand-vs-hand stays in scope).
- Settings / preferences (no in-app config UI).
- Score persistence beyond the current session — no localStorage writes.
- Graded success states (no "bullseye" vs "close" gradient — binary green/grey only per Decisions Log).
- Visible tolerance band on the axis — implicit only.
- iOS/Safari fixes — Chrome on Android is the only target.
- Manual "next" button — removed in favor of auto-advance.
- A drag library / animation library — Pointer Events + CSS transforms + RAF only.
- A global state store — local React state stays sufficient.
- New routes — single screen at `/`.
- New tests for the engine, problem generation, or URL parsing — those layers are unchanged.

---

## Step-by-Step Tasks

### Task 1: Move slider math to a shared lib
- **ACTION**: Create `web/src/lib/sliderMath.ts` and `web/src/lib/sliderMath.test.ts` with the contents of the existing `web/src/components/estimation-slider/sliderMath.ts` and its test file. Update existing import in `EstimationSlider.tsx` to point at the new location (the old slider still exists at this point).
- **IMPLEMENT**: Pure helpers exported as named exports — no behavior change.
- **MIRROR**: `valueFromClientY` / `fractionFromValue` / `isWithinTolerance` / `assertSliderProps` signatures stay identical.
- **IMPORTS**: None new.
- **GOTCHA**: Don't delete the old file yet — `EstimationSlider.tsx` (and its tests) still need it until the new primitive lands. Re-export from the old path as a temporary shim to avoid two copies: `export * from "@/lib/sliderMath";` in `web/src/components/estimation-slider/sliderMath.ts`.
- **VALIDATE**: `pnpm test` (or `npm test`) green; `pnpm build` clean. Current behavior unchanged.

### Task 2: Update exercise config to PRD spec
- **ACTION**: Edit `web/src/components/exercise/exerciseConfig.ts` per the **Files to Change** table.
- **IMPLEMENT**:
  ```ts
  export const EQUITY_TOLERANCE = 10;
  export const EQUITY_ANCHORS: readonly number[] = [0, 20, 40, 60, 80, 100];
  export const SUCCESS_HOLD_MS = 1200;
  export const MISS_HOLD_MS = 1800;
  export const FIREWORK_DURATION_MS = 600;
  export const RELEASE_TRANSITION_MS = 240; // overlay/cross-fade base duration
  ```
- **MIRROR**: `CONFIG_CONSTANT_PATTERN`.
- **IMPORTS**: None.
- **GOTCHA**: Existing `EstimationSlider` test references `tolerance={4}` and similar — those pass props directly so this change is safe.
- **VALIDATE**: `pnpm test` green.

### Task 3: Add palette tokens to globals.css
- **ACTION**: Inside `@theme inline` add the new color tokens.
- **IMPLEMENT**:
  ```css
  @theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --font-sans: var(--font-geist-sans);
    --font-mono: var(--font-geist-mono);
    --color-cyan-bar: oklch(74% 0.15 220);
    --color-success-flash: oklch(78% 0.22 145);
    --color-miss-settle: oklch(88% 0 0);
    --color-overlay: oklch(15% 0 0 / 0.7);
    --color-control-idle: oklch(88% 0.04 290);
  }
  ```
- **MIRROR**: This file already follows the Tailwind v4 `@theme inline` pattern.
- **IMPORTS**: None.
- **GOTCHA**: Tailwind v4 (this version) auto-generates utility classes from `@theme inline` tokens — `bg-cyan-bar`, `bg-success-flash` etc. become available. Verify by checking the build.
- **VALIDATE**: `pnpm build` clean; `bg-cyan-bar` resolves at runtime (visible in Task 6 screen).

### Task 4: Build the EquityAxis component
- **ACTION**: Create `web/src/components/equity-axis/EquityAxis.tsx`, `index.ts`, `EquityAxis.test.tsx`.
- **IMPLEMENT**:
  ```tsx
  interface EquityAxisProps {
    values: readonly number[];           // [0, 20, 40, 60, 80, 100]
    min?: number;                        // default 0
    max?: number;                        // default 100
    mode: "idle" | "dragging";
    pointerValue?: number;               // when set, render the cyan pointer arrow
  }
  ```
  - Vertical container `relative h-full w-12`. Background dotted line: `border-l border-dotted border-zinc-300` for idle, `border-zinc-50` for dragging.
  - For each `value`, render a square tick (8×8 px) absolutely positioned at `top: ${(1 - fractionFromValue(value, min, max)) * 100}%` with the numeric label to the right.
  - When `pointerValue !== undefined`, render a cyan triangle/arrow `aria-hidden` absolutely positioned at the same calculation. Use `transform: translateY(-50%)` for centering. Animate `top` only via `transition: top var(--duration) ease-out` — wait, "top" is layout-bound. Use `transform: translateY(...)` instead.
  - Cleaner approach: position pointer with `top: 0` plus `transform: translateY(${pointerPx}px)`. Compute the px from the container ref via a `useLayoutEffect`. **Or**: position with `top: ${pct}%` and accept that `top` retriggers layout; for a single absolutely-positioned element this is fine and matches what `EstimationSlider` already does (its thumb uses `top: ${valueTopPct}%`).
- **MIRROR**: `fractionFromValue` from `@/lib/sliderMath`. `data-mode="idle|dragging"` for testing.
- **IMPORTS**: `import { fractionFromValue } from "@/lib/sliderMath";`
- **GOTCHA**: Square tick markers should be SVG `<rect>` or pure CSS `border` blocks — not Unicode glyphs (font rendering differs across browsers). Use `<span className="block size-2 bg-current" />`.
- **VALIDATE**: Tests cover: tick count = `values.length`; pointer present iff `pointerValue !== undefined`; `data-mode` switches; throws nothing for empty values array.

### Task 5: Build the EstimationBar primitive
- **ACTION**: Create `web/src/components/estimation-bar/EstimationBar.tsx`, `index.ts`, `EstimationBar.test.tsx`.
- **IMPLEMENT**:
  ```tsx
  interface EstimationBarProps {
    min?: number;
    max?: number;
    truth: number;
    tolerance: number;
    initialValue?: number;
    onValueChange?: (value: number) => void;     // fires during drag
    onRelease?: (value: number, isWithinTolerance: boolean) => void;
    onDraggingChange?: (dragging: boolean) => void;
    ariaLabel?: string;
    promptCopy?: string;                         // "drag to estimate equity"
  }
  ```
  - **Idle state**: full-width pill at the bottom (`absolute inset-x-4 bottom-4 h-14 rounded-full bg-control-idle`). Centered text + arrow.
  - **Dragging state**: bar transforms — `bg-cyan-bar`, full-width (no horizontal inset), height collapses to ~6vh, `top` driven by pointer (full-width horizontal cyan band that follows the finger vertically). Use a single element whose `style.top`/`style.height`/`style.borderRadius` interpolates between the two states; or two elements with `opacity` cross-fading. Single-element-with-state-driven-style is simpler and avoids cross-fade jitter.
  - Pointer events: capture on a wrapper `<div>` that is the full screen height (so the user can drag anywhere upward). The visible bar is positioned by the same logic the slider's thumb uses.
  - **Wrapper**: full-screen `absolute inset-0` with `touchAction: "none"`, `role="slider"` + ARIA + `tabIndex={0}` + `data-released` / `data-dragging`. Pointer events bound to this wrapper. The visible bar is a child positioned by `top: ${(1 - fractionFromValue(value, min, max)) * 100}%`.
  - Gating: `pointerdown` only enters dragging if it occurred on or below the idle bar's top edge (track an `idleBarTopRef`). Otherwise ignore — prevents the user from accidentally activating drag by tapping the cards.
- **MIRROR**: `POINTER_CAPTURE_PATTERN`, `SLIDER_ARIA_PATTERN`, `REDUCED_MOTION_PATTERN`. Computation uses `valueFromClientY` from `@/lib/sliderMath` against the wrapper's bounding rect.
- **IMPORTS**:
  ```ts
  import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
  import { valueFromClientY, fractionFromValue, isWithinTolerance, assertSliderProps } from "@/lib/sliderMath";
  import { useReducedMotion } from "@/hooks/useReducedMotion"; // see Task 8
  ```
- **GOTCHA**: Don't compute `value` on every move and shove it into state if it causes flicker — React batches anyway. Just call `setValue(...)`. The bar uses `transform: translateY(...)` not `top: %` for compositor-friendly motion. Compute the translation from the wrapper's height + the value fraction in the render path.
- **GOTCHA**: When `dragging` is false but `released` is true, freeze the bar at the released `value` (don't snap to neutral). PRD says "cyan bar remains at release position".
- **VALIDATE**: Tests cover: aria role + valuemin/max/now; throws on bad props (mirror old slider tests); `data-dragging` flips true on `pointerDown`, false on `pointerUp`; `onRelease` fires once with correct `(value, isWithinTolerance)` tuple.

### Task 6: Build the ActualEquityTooltip
- **ACTION**: Create `web/src/components/feedback/ActualEquityTooltip.tsx`.
- **IMPLEMENT**:
  ```tsx
  interface ActualEquityTooltipProps {
    percent: number;
    visible: boolean;
  }
  ```
  - White speech bubble: `rounded-2xl bg-white shadow-xl px-6 py-4` with a downward-pointing tail (CSS triangle via `::before`/`::after` pseudo-element or an inline SVG `<polygon>`).
  - "ACTUAL EQUITY" label uppercase, small, tracking-wider, zinc-500. Below it the percent in massive (clamp(2.5rem, 8vw, 4.5rem)) bold black type with one decimal: `${percent.toFixed(1)}%`.
  - Visibility: `opacity` + `transform: translateY(-8px)` → `0` on enter; reduced-motion: instant.
  - `data-testid="actual-equity-tooltip"` for tests; `aria-live="polite"` so the announcement reads on release.
- **MIRROR**: `REDUCED_MOTION_PATTERN`.
- **IMPORTS**: `useReducedMotion`.
- **GOTCHA**: Don't animate `width` / `height` / `padding` for the entrance. Only `opacity` + `transform`.
- **VALIDATE**: Renders the percent rounded to 1 decimal; `data-visible` reflects prop.

### Task 7: Build the FireworkBurst
- **ACTION**: Create `web/src/components/feedback/FireworkBurst.tsx`.
- **IMPLEMENT**:
  ```tsx
  interface FireworkBurstProps {
    active: boolean;        // mounting under success only
    durationMs: number;     // FIREWORK_DURATION_MS = 600
    seed?: string;          // deterministic angle/distance per problem
  }
  ```
  - Generate ~12 particles: half squares (`size-1.5 bg-emerald-500`), half triangles (CSS triangle via `border` trick or `clip-path`). Position absolutely at the screen-center coordinates (the parent passes the container; default to `inset-0 grid place-items-center`).
  - Each particle has `--angle: <deg>` and `--dist: <px>` CSS vars derived from a seeded RNG (use the problemKey hash). Animation: `transform: rotate(var(--angle)) translateX(var(--dist)) scale(0)` over `durationMs` via CSS keyframes. Define a `@keyframes fireworkBurst` in `globals.css`.
  - When `useReducedMotion()` is true: render nothing.
  - Auto-unmount via parent (the screen drops it after `SUCCESS_HOLD_MS`).
- **MIRROR**: `REDUCED_MOTION_PATTERN`. Use the `seed` to pick angles/distances deterministically — same approach as `feedbackCopy.pickPhrase`.
- **IMPORTS**: `useReducedMotion`.
- **GOTCHA**: Compositor-only properties only (`transform`, `opacity`). Don't animate `width`, `top`, `left`. Define keyframes once in `globals.css` so multiple particles share the same compiled rule.
- **GOTCHA**: Triangles via CSS `border` trick are pixel-aligned; via `clip-path: polygon(...)` they antialias better. Pick `clip-path` for the new build.
- **VALIDATE**: Renders `null` under reduced motion; renders 12 particle elements when active; `data-testid="firework-burst"`.

### Task 8: Move useReducedMotion to a shared hooks dir
- **ACTION**: Create `web/src/hooks/useReducedMotion.ts` with the contents of the existing slider one. Update both old slider and all new components to import from `@/hooks/useReducedMotion`.
- **IMPLEMENT**: Same `useSyncExternalStore` implementation; no behavior change.
- **MIRROR**: Existing hook verbatim.
- **IMPORTS**: None.
- **GOTCHA**: Don't delete the slider copy until Task 13. Re-export from the slider location as a shim until then.
- **VALIDATE**: `pnpm test` still green.

### Task 9: Build useAutoAdvance hook
- **ACTION**: Create `web/src/hooks/useAutoAdvance.ts` and `useAutoAdvance.test.ts`.
- **IMPLEMENT**:
  ```ts
  export function useAutoAdvance(
    active: boolean,
    delayMs: number,
    onAdvance: () => void,
  ): void {
    const cb = useRef(onAdvance);
    cb.current = onAdvance;
    useEffect(() => {
      if (!active) return;
      const id = window.setTimeout(() => cb.current(), delayMs);
      return () => window.clearTimeout(id);
    }, [active, delayMs]);
  }
  ```
- **MIRROR**: `USE_DEBOUNCE_PATTERN` from the user's web/patterns.md (custom hook shape).
- **IMPORTS**: `useEffect, useRef` from react.
- **GOTCHA**: Capture the callback via a ref so changing the callback identity doesn't reset the timer. The effect deps are `active` and `delayMs` only.
- **VALIDATE**: Vitest fake timers — fires after `delayMs`, cancels on unmount, no-op when `active=false`.

### Task 10: Build feedbackCopy + picker
- **ACTION**: Create `web/src/components/feedback/feedbackCopy.ts` + `.test.ts`.
- **IMPLEMENT**:
  ```ts
  export const SUCCESS_PHRASES = ["bullseye", "nice", "close enough", "got it"] as const;
  export const MISS_PHRASES = ["close-ish", "maybe next time", "not quite", "noped it"] as const;

  function hashSeed(seed: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    }
    return h >>> 0;
  }

  export function pickPhrase(
    seed: string,
    kind: "success" | "miss",
  ): string {
    const list = kind === "success" ? SUCCESS_PHRASES : MISS_PHRASES;
    return list[hashSeed(seed) % list.length];
  }
  ```
- **MIRROR**: Pure-function pattern in `sliderMath.ts`.
- **IMPORTS**: None.
- **GOTCHA**: Use `as const` so the union of phrase literals stays narrow if anyone wants to type against it later.
- **VALIDATE**: `pickPhrase("AsKsQhQd", "success")` is deterministic; `pickPhrase("AsKsQhQd", "miss")` is deterministic; both return non-empty strings.

### Task 11: Simplify PlayingCard
- **ACTION**: Edit `web/src/components/exercise/PlayingCard.tsx`.
- **IMPLEMENT**: Vertical rectangle. Keep `data-testid="playing-card"`, `data-rank`, `data-suit`, aria-label. New markup:
  ```tsx
  <div
    data-testid="playing-card"
    data-rank={card.rank}
    data-suit={card.suit}
    aria-label={`${card.rank} of ${SUIT_NAME[card.suit]}`}
    className={`flex h-28 w-16 flex-col items-center justify-between py-2 ${colorClass}`}
  >
    <span className="text-3xl font-bold leading-none">{card.rank}</span>
    <span className="text-3xl leading-none">{glyph}</span>
  </div>
  ```
  No border, no background, no shadow, no rotated bottom rank. Color stays red/black per suit.
- **MIRROR**: Existing `data-testid` + aria-label naming.
- **IMPORTS**: Unchanged.
- **GOTCHA**: Existing tests count `playing-card` testids; keep that intact.
- **VALIDATE**: Existing `ExerciseScreen.test` "renders four playing cards" still passes.

### Task 12: Strip HandDisplay label
- **ACTION**: Edit `web/src/components/exercise/HandDisplay.tsx`. Drop the optional `label` rendering.
- **IMPLEMENT**:
  ```tsx
  export function HandDisplay({ hand }: { hand: string }) {
    const [c1, c2] = parseHand(hand);
    return (
      <div className="flex gap-2" data-testid="hand-display">
        <PlayingCard card={c1} />
        <PlayingCard card={c2} />
      </div>
    );
  }
  ```
- **MIRROR**: Existing testid.
- **IMPORTS**: Unchanged.
- **GOTCHA**: `ExerciseScreen` previously passed `label="Hand A"`; remove that call site in Task 14.
- **VALIDATE**: `playing-card` testid still resolves; `pnpm test` green.

### Task 13: Rebuild ExerciseScreen with state machine
- **ACTION**: Rewrite `web/src/components/exercise/ExerciseScreen.tsx` end-to-end.
- **IMPLEMENT**:
  - State: `phase: ScreenPhase` (discriminated union from `IMMUTABLE_STATE_PATTERN`).
  - Layout (Tailwind):
    - Root `<main>` is `relative h-screen w-screen overflow-hidden bg-white` (or `bg-success-flash` / `bg-miss-settle` per phase). Add `data-screen-phase={phase.kind}`.
    - Idle / dragging overlay: a sibling `<div className="absolute inset-0 bg-overlay pointer-events-none" />` whose `opacity` is `0` in idle, `1` in dragging, `0` in success, `0` in miss.
    - Hands: centered, `opacity-100` in idle, `opacity-30` in dragging, `opacity-100` in success/miss.
    - Axis: left-edge column `<EquityAxis values={EQUITY_ANCHORS} mode={phase.kind === "dragging" ? "dragging" : "idle"} pointerValue={phase.kind === "dragging" ? phase.value : undefined} />`.
    - `<EstimationBar>` mounted always; phase rendering uses its `onRelease` to transition `idle/dragging → success | miss`.
    - On `success` / `miss`: render `<ActualEquityTooltip percent={truthPercent} visible />` positioned just below the bar's settled height. Render success copy via `pickPhrase(problemKey, "success")` etc. Render `<FireworkBurst active seed={problemKey} durationMs={FIREWORK_DURATION_MS} />` only on success.
    - `useAutoAdvance(phase.kind === "success" || phase.kind === "miss", phase.kind === "success" ? SUCCESS_HOLD_MS : MISS_HOLD_MS, onNext)`.
  - `onNext`: `randomHandPair()` → `router.replace(`?${params}`)` (mirrors existing impl). Reset phase to `{ kind: "idle" }`. Use the URL change to remount the bar via `key={problemKey}`.
- **MIRROR**: `ENGINE_LIFECYCLE_PATTERN`, `URL_SEED_PATTERN`, `IMMUTABLE_STATE_PATTERN`. Reuse the `useEffect` engine init verbatim.
- **IMPORTS**:
  ```ts
  import { useEffect, useMemo, useState } from "react";
  import { useRouter, useSearchParams } from "next/navigation";
  import { EstimationBar } from "@/components/estimation-bar";
  import { EquityAxis } from "@/components/equity-axis";
  import { ActualEquityTooltip, FireworkBurst, pickPhrase } from "@/components/feedback";
  import { getEngine, type EngineApi } from "@/lib/engine";
  import { useAutoAdvance } from "@/hooks/useAutoAdvance";
  import { HandDisplay } from "./HandDisplay";
  import { isValidHandPair, randomHandPair } from "./problem";
  import {
    EQUITY_ANCHORS,
    EQUITY_TOLERANCE,
    SUCCESS_HOLD_MS,
    MISS_HOLD_MS,
    FIREWORK_DURATION_MS,
  } from "./exerciseConfig";
  ```
- **GOTCHA**: Cross-fade to next problem must complete before the auto-advance fires `router.replace`. The simplest sequence: at advance-time, call `setPhase({ kind: "idle" })` AND `router.replace(...)` synchronously; the new `key={problemKey}` on `EstimationBar` remounts cleanly. Cross-fade is a CSS opacity transition on the root, driven by `phase.kind`.
- **GOTCHA**: Keep Suspense boundary in `app/page.tsx` (it wraps `<ExerciseScreen />`); `useSearchParams` requires it.
- **GOTCHA**: When `useReducedMotion()` is true, `useAutoAdvance` still fires after the configured delay — keeping cadence — but the cross-fade itself is instant. Don't shorten the hold.
- **VALIDATE**: Manual: open `/?a=AsKs&b=QhQd`, drag bar, release inside ±10%, see green flash + firework + tooltip; release outside ±10%, see grey settle + tooltip; both auto-advance to a new pair within ~1.2s / ~1.8s. URL updates after each advance.

### Task 14: Update ExerciseScreen tests
- **ACTION**: Edit `web/src/components/exercise/ExerciseScreen.test.tsx`.
- **IMPLEMENT**:
  - Keep the existing `next/navigation` mock + the `playing-card` count assertion + the prompt assertion.
  - Replace the slider-orientation assertion to look up the bar by `getByRole("slider")` (still vertical).
  - Drop the `feedback-panel` test.
  - Add: `data-screen-phase` is `"idle"` initially; switches to `"dragging"` on pointerdown (use `fireEvent.pointerDown(slider, { clientY: ... })`); switches to `"success"` or `"miss"` on pointerup; `router.replace` is called after `SUCCESS_HOLD_MS` (use `vi.useFakeTimers()` + `vi.advanceTimersByTime(...)`).
  - Mock `getBoundingClientRect` on the slider to return a deterministic rect so `valueFromClientY` produces predictable values.
- **MIRROR**: `TEST_STRUCTURE`, existing mock pattern.
- **IMPORTS**: `fireEvent` from `@testing-library/react`; `vi` from vitest.
- **GOTCHA**: `setPointerCapture`/`releasePointerCapture` aren't implemented in jsdom by default. Stub them on the element before firing pointer events: `(slider as any).setPointerCapture = vi.fn(); (slider as any).releasePointerCapture = vi.fn(); (slider as any).hasPointerCapture = vi.fn(() => true);`.
- **VALIDATE**: `pnpm test` green.

### Task 15: Delete the old slider primitive + FeedbackPanel
- **ACTION**: After all imports of `@/components/estimation-slider` are gone:
  - Delete `web/src/components/estimation-slider/` (whole folder).
  - Delete `web/src/components/exercise/FeedbackPanel.tsx`.
  - Remove its export from `web/src/components/exercise/index.ts` (it was never exported there — verify with grep).
- **IMPLEMENT**: `git rm -r web/src/components/estimation-slider web/src/components/exercise/FeedbackPanel.tsx`.
- **MIRROR**: N/A — deletion.
- **IMPORTS**: Verify no remaining imports: `rg "estimation-slider|FeedbackPanel" web/src` returns nothing.
- **GOTCHA**: Don't delete `web/src/lib/sliderMath.ts` or `useReducedMotion.ts` — those are now the canonical homes.
- **VALIDATE**: `pnpm tsc --noEmit` clean; `pnpm test` green; `pnpm build` clean.

### Task 16: Manual play-test on a real Pixel
- **ACTION**: `pnpm dev` (or `npm run dev`); open the local URL on a Pixel + Chrome; complete five problems back-to-back.
- **IMPLEMENT**: N/A — sensory check.
- **MIRROR**: Phase 4's success signal: "owner can complete 5 problems back-to-back without thinking about the app, only the math."
- **IMPORTS**: N/A.
- **GOTCHA**: If the bar feels sticky or snappy in a bad way, tune `RELEASE_TRANSITION_MS` and the bar's resting `bg-control-idle` color. Adjust palette tokens in `globals.css` if greens/cyans look "Tailwind default."
- **VALIDATE**: PRD success signal — "Side-by-side with the Elevate reference video, the loop reads as the same primitive applied to poker. Owner would show this to a friend without apologizing."

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `valueFromClientY` (relocated) | `(300, 100, 400, 0, 100)` | ~50 | midpoint |
| `pickPhrase("AsKsQhQd", "success")` | seed + kind | one of `SUCCESS_PHRASES`, deterministic | seed determinism |
| `pickPhrase("AsKsQhQd", "miss")` | seed + kind | one of `MISS_PHRASES`, deterministic | seed determinism |
| `useAutoAdvance(true, 1200, fn)` | active=true | `fn` invoked once after 1200ms | timer fires once |
| `useAutoAdvance` unmount | unmount before fire | `fn` not invoked | cleanup |
| `useAutoAdvance(false, 1200, fn)` | active=false | `fn` never invoked | inactive |
| `EquityAxis values=[0,20,40,60,80,100]` | render | 6 tick elements | tick count |
| `EquityAxis pointerValue=undefined` | render | no pointer | conditional render |
| `EquityAxis pointerValue=42` | render | pointer present at the matching offset | dragging mode |
| `EstimationBar` aria contract | render | `role=slider`, `aria-orientation=vertical`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` | accessibility |
| `EstimationBar` invalid props | `truth=150` | throws | validation |
| `EstimationBar` pointerDown→Up | simulated | `data-dragging` toggles, `onRelease(value, isWithinTolerance)` fires once | gesture |
| `ActualEquityTooltip percent=46.345` | render | text contains "46.3%" | rounding |
| `FireworkBurst active=true reducedMotion=false` | render | 12 particle elements | particles |
| `FireworkBurst active=true reducedMotion=true` | render | renders nothing | reduced motion |
| `ExerciseScreen` phase machine | mount | `data-screen-phase="idle"` | initial |
| `ExerciseScreen` after release inside tolerance | simulated drag+release | `data-screen-phase="success"`, firework mounted | success path |
| `ExerciseScreen` after release outside tolerance | simulated drag+release | `data-screen-phase="miss"`, no firework | miss path |
| `ExerciseScreen` auto-advance | success + advance timer | `router.replace` called once | timer integration |

### Edge Cases Checklist
- [ ] Pointer captured via `setPointerCapture` survives a finger that drifts off the bar element
- [ ] Pointer cancel (system gesture) ends drag cleanly via `onPointerCancel`
- [ ] Reduced motion: cross-fade, flash, and firework all degrade to instant; auto-advance still respects hold timing
- [ ] URL refresh during success/miss reproduces the same problem (URL was already written) but resets phase to idle
- [ ] Engine init failure renders the existing error state (don't regress that path)
- [ ] Two rapid releases on the same problem don't double-fire `router.replace` (advance is gated by phase + key remount)
- [ ] Dragging starts only when pointerdown lands on/below the bar — don't trap card taps
- [ ] Touch-action: none on the wrapper prevents scroll interception on Android Chrome

---

## Validation Commands

### Static Analysis
```bash
cd web && pnpm tsc --noEmit
```
EXPECT: Zero type errors. (If the project is on npm, substitute `npm run` for `pnpm`.)

### Lint
```bash
cd web && pnpm lint
```
EXPECT: Zero errors.

### Unit Tests (affected area)
```bash
cd web && pnpm vitest run src/components src/hooks src/lib
```
EXPECT: All tests pass.

### Full Test Suite
```bash
cd web && pnpm test
```
EXPECT: All tests pass; coverage of new components ≥ 80%.

### Production Build
```bash
cd web && pnpm build
```
EXPECT: Build succeeds; no Tailwind warnings about undefined tokens; bundle remains within budget.

### Browser Validation
```bash
cd web && pnpm dev
# Open http://localhost:3000 on a Pixel + Chrome.
```
EXPECT:
- Idle screen matches the After-idle ASCII diagram
- Dragging the bottom bar triggers overlay + cyan bar + axis pointer
- Release inside ±10% → green flash + firework + tooltip + auto-advance after ~1.2s
- Release outside ±10% → grey settle + tooltip + auto-advance after ~1.8s
- URL updates after every advance
- `prefers-reduced-motion: reduce` (DevTools) makes all transitions instant; auto-advance still happens

### Manual Validation
- [ ] Five problems back-to-back without UI annoyances
- [ ] Tooltip percentage matches the engine's `equityVs(...) * 100` value to one decimal
- [ ] Side-by-side comparison with Elevate reference reads as the same primitive
- [ ] Owner-quality gut check: "I'd show this to a friend"

---

## Acceptance Criteria
- [ ] Tasks 1–15 completed; Task 16 manual sign-off recorded
- [ ] All validation commands pass
- [ ] New components have tests; coverage ≥ 80% on new files
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] PRD UI Spec sections A–F implemented as written
- [ ] Reduced-motion path verified
- [ ] Old slider + FeedbackPanel deleted; no orphan imports

## Completion Checklist
- [ ] Code follows discovered patterns (pointer capture, aria slider, reduced motion, immutable state)
- [ ] Error handling matches codebase style (engine init catch unchanged)
- [ ] No `console.log` statements
- [ ] Tests follow `describe("X — concern")` naming
- [ ] No hardcoded magic numbers — timings + tolerance + anchors live in `exerciseConfig.ts`
- [ ] No mutation — state updates use new objects
- [ ] No new dependencies added (no drag library, no animation library)
- [ ] `web/AGENTS.md` honored: any Next.js 16 API touched was verified against `node_modules/next/dist/docs/`
- [ ] Self-contained — implementation possible without further codebase searching

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Bottom-bar gesture feels worse than the vertical track on Pixel | MEDIUM | HIGH (the whole primitive) | Build EstimationBar in isolation first (Task 5), test on real device before composing into the screen (Task 13) |
| `setPointerCapture` flake in jsdom for tests | MEDIUM | MEDIUM | Stub the methods on the element in tests (documented in Task 14 GOTCHA) |
| Tailwind v4 token names collide with built-in palette | LOW | LOW | Use prefixed names (`color-cyan-bar`, not `color-cyan`); verify build output |
| Cross-fade between problems flashes the previous problem during auto-advance | MEDIUM | LOW | Remount the bar via `key={problemKey}`; gate firework mount to phase=success only |
| Geometric firework looks like a Tailwind toast confetti rather than Elevate-style | MEDIUM | MEDIUM | Bias particle shapes to squares + triangles only (no circles), keep ≤12 particles, tune distances/rotations to feel intentional; iterate at Task 16 |
| Auto-advance fires while the user is mid-thought reading the tooltip | LOW | MEDIUM | Hold timings (1.2s success / 1.8s miss) are config — tune in Task 16; consider extending miss hold if the owner reports it |
| Phase 4 tests fail after rewrite | HIGH (expected) | LOW | Update tests in Task 14 in the same change; keep the count + prompt assertions to preserve regression coverage |

## Notes
- The project uses npm (per PRD Decisions Log) but the user's web/hooks.md examples use `pnpm`. The validation commands above use `pnpm` as written; substitute `npm run` if pnpm isn't installed locally.
- "Close enough" tolerance change from ±5% to ±10% is non-negotiable per PRD UI Spec, even though the Phase 3 build uses 5%. This is intentional — the Elevate-style binary cue needs more headroom to feel rewarding.
- The discriminated union `ScreenPhase` was chosen over the prior `ReleaseState | null + boolean dragging` shape because the four states are mutually exclusive and the typechecker can prove the right data is present in each branch.
- Decisions Log calls out that the tolerance band is *implicit* — do not render it on the axis under any phase.
- Phase 5 is the last PRD-listed phase; on completion, the Implementation Phases table should mark it `complete` and link this plan + a report.
