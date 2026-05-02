# Plan: Exercise Screen (Phase 4)

## Summary
Compose the Phase 3 `EstimationSlider` with the Phase 2 `equityVs` engine call into a single, complete drill screen at `web/src/app/page.tsx`. The screen renders two specific hold'em hands as styled cards, prompts the user to estimate the equity of Hand A, drives the slider, and animates feedback (truth + verdict + tolerance band) on release. Problem identity is encoded in the URL (`?a=AsKs&b=QhQd`) so refresh reproduces the problem and "next" mints a new pair into the URL via `router.replace`. The aesthetic is "credible default" — Phase 5 owns the polish pass.

## User Story
As the project owner, I want one finished drill exercise — drop in, drag, see verdict, swipe to the next — so that I can tell whether the loop is fun enough to sub in for doomscrolling, and so that Phase 5 has a real screen to polish.

## Problem → Solution
**Current state:** `web/src/app/page.tsx` is the Phase 2 smoke page — two text inputs, one numeric readout. The `EstimationSlider` primitive exists at `web/src/components/estimation-slider/` but is imported nowhere. The engine wrapper exposes `equityVs(handA, handB) -> number` (0..1 fraction). There is no card visualization, no feedback animation, no next-problem flow, no URL state.

**Desired state:** Visiting `/` lands the user in the exercise. Two hands render as visual cards, the slider lives next to them, the prompt asks for Hand A's equity. Releasing the slider reveals the truth line, the tolerance band, and a "close enough" / "not quite" verdict. A "next" affordance generates a fresh problem and writes the hand pair into the URL. Refreshing reproduces the same problem; sharing the URL shares the exact pair. The PRD success signal — "owner can complete 5 problems back-to-back without thinking about the app, only the math" — is reachable on Pixel.

## Metadata
- **Complexity**: Medium
- **Source PRD**: `.claude/PRPs/prds/poker-trainer.prd.md`
- **PRD Phase**: Phase 4 — Exercise screen
- **Estimated Files**: ~10 (8 new, 2 updated)

---

## UX Design

### Before
```
┌─────────────────────────────┐
│  poker-trainer · engine     │
│   ┌─────────────┐           │
│   │ AsKs        │  Hand A   │
│   └─────────────┘           │
│         vs                  │
│   ┌─────────────┐           │
│   │ QhQd        │  Hand B   │
│   └─────────────┘           │
│   46.0% equity              │  <- live readout, spoils the answer
└─────────────────────────────┘
```

### After (idle / before release)
```
┌────────────────────────────────────┐
│                                    │
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
│                                    │
└────────────────────────────────────┘
```

### After (released — feedback revealed)
```
┌────────────────────────────────────┐
│                                    │
│   close enough · 46.1%             │  <- verdict + truth %
│                                    │
│   ┌────┐ ┌────┐                    │
│   │ A♠ │ │ K♠ │     ┃ 100          │
│   └────┘ └────┘     ┃              │
│         vs          ┃ ┌──┐         │
│   ┌────┐ ┌────┐     ┃ │░░│  band   │
│   │ Q♥ │ │ Q♦ │     ┃ ─── truth    │
│   └────┘ └────┘     ┃ └──┘         │
│                     ┃ ●            │
│                     ┃              │
│                                    │
│             [ next →  ]            │
└────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Landing | Type both hands manually | Hands rendered automatically from URL or random | URL params `a` and `b` are 4-char hand strings (`AsKs`) |
| Estimate input | `<input>` reading the answer | Vertical drag on `EstimationSlider` | The slider primitive owns drag |
| Feedback timing | Live (every keystroke) | Only on `pointerup` | Avoids spoiling the answer mid-drag |
| Truth presentation | Number printed under inputs | Reveal animation + verdict text | `close enough` if `\|value − truth\| ≤ tolerance`, else `not quite` |
| Next problem | Edit the inputs by hand | Tap `Next` → new pair, URL updated via `router.replace` | No history pollution; back button does not walk through every problem |
| Tolerance | n/a | ±5 percentage points (configurable constant, tuned in Phase 5) | Centered on truth |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `.claude/PRPs/prds/poker-trainer.prd.md` | 88-108, 142-179 | Phase 4 scope, MVP exercise definition, user flow, success signal |
| P0 | `web/AGENTS.md` | all (4) | "This is NOT the Next.js you know" — Next 16 + React 19; check `node_modules/next/dist/docs/` if uncertain |
| P0 | `web/src/app/page.tsx` | all (130) | Mirror prop-typing, `"use client"` placement, sub-component pattern (`HandInput`, `ResultLine`); also the file we are replacing — preserve nothing structural |
| P0 | `web/src/components/estimation-slider/EstimationSlider.tsx` | all (155) | Public API: `truth`, `tolerance`, `onRelease(value, isWithinTolerance)`. Slider value range is the same as `truth` units — we'll use `0..100` and call `equityVs * 100` |
| P0 | `web/src/components/estimation-slider/index.ts` | all (3) | Barrel export — `import { EstimationSlider } from "@/components/estimation-slider"` |
| P0 | `web/src/lib/engine.ts` | all (26) | `getEngine()` returns `Promise<EngineApi>`; `equityVs` returns 0..1 fraction; throws on conflicting cards |
| P0 | `web/src/lib/engine.test.ts` | all (56) | Test style (describe/it/AAA, table-driven). Note: jsdom env is the default — `getEngine()` works in tests |
| P0 | `web/vitest.config.ts` | all (20) | Glob is `src/**/*.test.{ts,tsx}`; `engine` aliased to `pkg-node` so engine calls work in tests |
| P0 | `web/src/test-setup.ts` | all (28) | Provides `matchMedia` shim and `afterEach(cleanup)` — already wired, do not duplicate |
| P0 | `~/.claude/rules/web/coding-style.md` | all | Feature-folder layout, animate compositor-friendly props only, semantic HTML |
| P0 | `~/.claude/rules/web/design-quality.md` | all | Anti-template: no generic shadcn-looking card grid; this is one exercise per screen |
| P0 | `~/.claude/rules/web/performance.md` | all | Animate `transform`/`opacity` only; reduced-motion already handled inside the slider |
| P1 | `.claude/PRPs/plans/completed/estimation-slider-primitive.plan.md` | 232-292 (Tasks 1-3) | Test infra contracts — jsdom env, RTL `cleanup`, math-helper test style |
| P1 | `.claude/PRPs/reports/estimation-slider-primitive-report.md` | all | Phase 3 deviations relevant here: `useSyncExternalStore`-based hooks, inline `transitionProperty` over arbitrary Tailwind classes |
| P1 | `web/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` | all | `useSearchParams()` is a Client hook from `next/navigation`; **must wrap in `<Suspense>`** to avoid forcing whole tree to client render at build |
| P1 | `web/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md` | 44-65 | `router.replace(href)` is the right call for "swap problem without polluting history" |
| P2 | `web/src/app/layout.tsx` | all (33) | Geist sans + Geist mono available via `font-sans` / `font-mono`; `<body>` is already `min-h-full flex flex-col` |
| P2 | `web/src/app/globals.css` | all (27) | Tailwind 4 token block (`@theme inline`); add new tokens here only if a utility cannot express it |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| `useSearchParams` semantics | Next 16 docs (path above) | Client-only hook; returns `ReadonlyURLSearchParams`; **wrap consumer in `<Suspense>`** so `/` can still be statically prerendered |
| `router.replace` | Next 16 docs (path above) | Updates URL without pushing a history entry — correct for "next problem" so back button leaves the exercise rather than rewinding through 20 problems |
| Hold'em hand string format | `engine/pkg/engine.d.ts` + `engine.test.ts` | `equity_vs("AsKs", "QhQd")` accepts rank+suit pairs (`s` `h` `d` `c`); throws on conflict (`"AsKs"` vs `"AsQh"`); also accepts pokers range strings (`"AKs"`, `"QQ"`) but Phase 4 uses **specific** combos so the user sees real cards |
| `URLSearchParams` write-side | MDN | Construct via `new URLSearchParams({ a, b }).toString()`, prepend `?` for `router.replace("?" + query)` |

```
KEY_INSIGHT: The slider primitive is uncontrolled and only emits `onRelease`. The screen owns whether the verdict is shown ("released" state lives in the screen, not the slider).
APPLIES_TO: ExerciseScreen state machine.
GOTCHA: Don't try to mirror the slider's internal `released` state. Mirror only the released *value* and verdict — those are what the verdict UI needs.

KEY_INSIGHT: `useSearchParams` is a Client Component hook in Next 16; using it inside `app/page.tsx` opts the entire route into client rendering unless wrapped in `<Suspense>`.
APPLIES_TO: page.tsx structure.
GOTCHA: Make `page.tsx` a thin server component (no "use client") that renders `<Suspense fallback={...}><ExerciseScreen/></Suspense>`. ExerciseScreen is the client component.

KEY_INSIGHT: `getEngine()` is now synchronous under the hood (Promise.resolve), but the API still returns a Promise.
APPLIES_TO: ExerciseScreen mount.
GOTCHA: Keep the cancelled-flag `useEffect` pattern from page.tsx (lines 12-27); future-proofs against the engine going truly async again.

KEY_INSIGHT: `equityVs` returns `0..1`. The slider operates in `0..100` so the user sees percentage points.
APPLIES_TO: All slider props derived from engine output.
GOTCHA: Multiply once at the boundary (`truth = equityFraction * 100`). The verdict callback comes back in the slider's units, not engine units — keep the conversion local to where you compose them.

KEY_INSIGHT: jsdom does not faithfully simulate Pointer Events; the slider's gesture path is verified manually on Pixel.
APPLIES_TO: ExerciseScreen tests.
GOTCHA: Mirror Phase 3's stance — render-contract tests only. Drive feedback-state tests by *invoking the released callback directly* via test utilities (e.g. expose `data-released` from the screen and assert before/after a synthetic call). Do not try to fake `pointerdown`/`pointerup`.

KEY_INSIGHT: `equityVs` throws when hands conflict. Random generation must produce 4 distinct cards across both hands.
APPLIES_TO: `randomHandPair` in problem.ts.
GOTCHA: Naive "pick 2 random cards twice" hits a conflict ~7% of the time on the first pair alone. Build the deck, shuffle, take the first 4 — never construct invalid pairs in the first place.

KEY_INSIGHT: Tailwind 4 has no `tailwind.config.ts` in this project; tokens live in `globals.css`'s `@theme inline` block.
APPLIES_TO: Any new colors (e.g. card red).
GOTCHA: Use existing palette utilities (`text-rose-600`, `bg-zinc-50`, etc.) wherever possible; only touch globals.css if Phase 5-grade design demands it (it doesn't here).
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
- Destructure props in the parameter list; `?` for optional
- No `React.FC`

### CLIENT_COMPONENT_HEADER
```typescript
// SOURCE: web/src/app/page.tsx:1-3
"use client";

import { useEffect, useState } from "react";
```
- `"use client"` is the first line; required for any component using hooks, Pointer Events, or `useSearchParams`/`useRouter`

### ENGINE_LIFECYCLE
```typescript
// SOURCE: web/src/app/page.tsx:9-27
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
```
- Cancelled-flag guard against double-fire on Strict-mode remount
- `unknown` catch + `instanceof Error` narrow

### ENGINE_CALL_GUARD
```typescript
// SOURCE: web/src/app/page.tsx:33-39
let equity: number | null = null;
let pairError: string | null = null;
if (api !== null && trimmedA.length > 0 && trimmedB.length > 0) {
  try {
    equity = api.equityVs(trimmedA, trimmedB);
  } catch (err: unknown) {
    pairError = err instanceof Error ? err.message : String(err);
  }
}
```
- Always guard `api !== null` before calling
- Always wrap calls in try/catch; surface user-facing message via the result-line component
- Null-fallback values, not undefined

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
- Table-driven (`for (const ...)`) for repeated shape:
```typescript
// SOURCE: web/src/lib/engine.test.ts:41-54
const cases: Array<[string, string, number, string]> = [...];
for (const [a, b, expected, source] of cases) {
  it(`${a} vs ${b} ≈ ...`, async () => { ... });
}
```

### COMPONENT_TEST_STYLE
```typescript
// SOURCE: web/src/components/estimation-slider/EstimationSlider.test.tsx:5-21
describe("EstimationSlider — render contract", () => {
  it("renders a vertical slider role with min/max/now", () => {
    const { getByRole } = render(
      <EstimationSlider truth={46} tolerance={4} min={0} max={100} initialValue={50} />,
    );
    const slider = getByRole("slider");
    expect(slider.getAttribute("aria-orientation")).toBe("vertical");
```
- Render-contract assertions; no fake gestures
- `getByRole` for ARIA, `querySelector('[data-...]')` for non-ARIA hooks

### PURE_HELPER_MODULE
```typescript
// SOURCE: web/src/components/estimation-slider/sliderMath.ts:1-13
export function valueFromClientY(
  clientY: number,
  trackTop: number,
  trackHeight: number,
  min: number,
  max: number,
): number {
  if (trackHeight <= 0) return min;
  ...
}
```
- Named exports only
- Explicit param + return types
- No I/O, no React imports, easy to unit-test in node-style env

### ANCHOR_BARREL
```typescript
// SOURCE: web/src/components/estimation-slider/index.ts:1-3
export { EstimationSlider } from "./EstimationSlider";
export type { EstimationSliderProps } from "./EstimationSlider";
```
- One barrel per feature folder, exporting just the public surface

### TAILWIND_USAGE
```typescript
// SOURCE: web/src/app/page.tsx:42
className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8 font-mono dark:bg-black"
```
- Tailwind utility composition; both light + `dark:` paired in one string
- `font-sans` / `font-mono` resolve to the Geist vars set in `layout.tsx`

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `web/src/app/page.tsx` | UPDATE (rewrite) | Replace Phase 2 smoke page with a thin Suspense wrapper around `<ExerciseScreen/>`. **No `"use client"` here.** |
| `web/src/components/exercise/ExerciseScreen.tsx` | CREATE | Top-level client component: state machine, engine boot, URL sync, slider integration |
| `web/src/components/exercise/PlayingCard.tsx` | CREATE | Pure presentational card view: rank glyph + suit glyph + color |
| `web/src/components/exercise/HandDisplay.tsx` | CREATE | Two-card row with optional label ("Hand A" / "Hand B"); composes `PlayingCard` |
| `web/src/components/exercise/FeedbackPanel.tsx` | CREATE | Verdict line + truth % + Next button; visible only when `released === true` |
| `web/src/components/exercise/problem.ts` | CREATE | Pure helpers: parse/encode hand strings, deck shuffle, random hand pair, parse a card to `{rank, suit}` |
| `web/src/components/exercise/problem.test.ts` | CREATE | Unit tests for the pure helpers (deck size, no-conflict random pairs, parse round-trips) |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | CREATE | Render-contract tests via RTL: prompt visible, two hands rendered, slider mounts, feedback hidden until released |
| `web/src/components/exercise/index.ts` | CREATE | Barrel: `export { ExerciseScreen } from "./ExerciseScreen"` |
| `web/src/components/exercise/exerciseConfig.ts` | CREATE | Single source of truth for `EQUITY_TOLERANCE = 5`, `EQUITY_ANCHORS = [0, 25, 50, 75, 100]` |

## NOT Building

- **Aesthetic finish (Phase 5).** The screen needs to look credible — not generic — but typographic pairing, palette work, micro-animations beyond the slider's existing reveal, motion curves on transitions, and dark/light decisions are explicitly Phase 5.
- **Persistence.** No `localStorage` for streak, last problem, or settings. PRD: "Progress / scoring persistence beyond the current session — TBD; not in MVP."
- **Streak / score / scoring history.** PRD explicitly defers gamification.
- **Multiple exercise types.** Hand-vs-hand only. The screen does not need to be generic.
- **Onboarding / explainer / first-run state.** PRD: "no onboarding, no rules explanation, assumes hold'em fluency."
- **Settings / menus / chrome.** PRD: "No back navigation, no settings, no chrome."
- **A second slider variant.** Vertical absolute-value only.
- **A keyboard interaction layer.** The slider primitive is touch-first; keyboard is a manual focus + future work. Render-contract tests still verify ARIA.
- **Range-vs-range or board-aware exercises.** PRD open question; out of MVP.
- **Re-running the engine on every render.** Compute `truth` once per problem (memoize on `[a, b, api]`).
- **A WASM regenerate step.** No Rust changes. `engine/pkg/` and `engine/pkg-node/` stay as-is.
- **Tolerance-band tuning beyond a single constant.** PRD says tolerance tuning needs play-testing — that's Phase 5 work. Ship a single sane default, expose it via `exerciseConfig.ts` so tuning is one-line.

---

## Step-by-Step Tasks

### Task 1: Pure problem helpers in `problem.ts`
- **ACTION**: Write the deck/hand string utilities the screen needs. No React, no DOM, no engine. Pure functions.
- **IMPLEMENT**:
  ```typescript
  export type Suit = "s" | "h" | "d" | "c";
  export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "T" | "J" | "Q" | "K" | "A";

  export interface Card {
    rank: Rank;
    suit: Suit;
  }

  export interface HandPair {
    a: string; // 4-char hand string, e.g. "AsKs"
    b: string;
  }

  export const RANKS: readonly Rank[] = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
  export const SUITS: readonly Suit[] = ["s","h","d","c"];

  /** Parse a 4-char hand string ("AsKs") into two Cards, or throw. */
  export function parseHand(hand: string): [Card, Card] { /* ... */ }

  /** Validate a hand string without throwing; returns true iff parseable. */
  export function isValidHand(hand: string): boolean { /* ... */ }

  /** Validate a hand pair: both parseable AND no shared cards. */
  export function isValidHandPair(a: string, b: string): boolean { /* ... */ }

  /** Build a fresh 52-card deck, ordered. */
  export function buildDeck(): Card[] { /* ... */ }

  /** Fisher-Yates shuffle with an injected RNG (for testability). */
  export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] { /* ... */ }

  /** Pick a random non-conflicting hand pair. */
  export function randomHandPair(rng: () => number = Math.random): HandPair { /* ... */ }

  /** Format a card for display: e.g. {rank: "A", suit: "s"} -> "As". */
  export function formatCard(card: Card): string { /* ... */ }
  ```
- **MIRROR**: Pure-helper module style of `web/src/components/estimation-slider/sliderMath.ts:1-58` (named exports, no class, throws on invalid input with precise messages).
- **IMPORTS**: none.
- **GOTCHA**:
  1. `parseHand("AsKs")` must reject ranks outside the set and suits outside `s/h/d/c`. Use a `Set<Rank>` lookup, not a regex (cleaner and a smaller surface for off-by-one mistakes).
  2. `randomHandPair` must shuffle the **full deck** and take 4 cards, NOT pick two pairs and retry. Retry-loops are correct but produce skewed distributions on bad RNGs and waste budget.
  3. The injected RNG default makes the helpers deterministic in tests (`shuffle(deck, () => 0)` is reproducible).
- **VALIDATE**: Task 2's tests cover this.

### Task 2: Unit tests for `problem.ts`
- **ACTION**: Cover deck size, parse round-trips, conflict detection, and shuffle determinism.
- **IMPLEMENT**:
  ```typescript
  import { describe, it, expect } from "vitest";
  import {
    buildDeck,
    parseHand,
    isValidHand,
    isValidHandPair,
    randomHandPair,
    shuffle,
    formatCard,
  } from "./problem";

  describe("buildDeck", () => {
    it("returns 52 unique cards", () => {
      const deck = buildDeck();
      expect(deck.length).toBe(52);
      const set = new Set(deck.map(formatCard));
      expect(set.size).toBe(52);
    });
  });

  describe("parseHand", () => {
    it("parses 'AsKs' into two cards", () => {
      const [c1, c2] = parseHand("AsKs");
      expect(c1).toEqual({ rank: "A", suit: "s" });
      expect(c2).toEqual({ rank: "K", suit: "s" });
    });
    it("throws on invalid rank", () => {
      expect(() => parseHand("XsKs")).toThrow();
    });
    it("throws on invalid suit", () => {
      expect(() => parseHand("AxKs")).toThrow();
    });
    it("throws on wrong length", () => {
      expect(() => parseHand("AKs")).toThrow();
    });
  });

  describe("isValidHandPair", () => {
    const cases: Array<[string, string, boolean, string]> = [
      ["AsKs", "QhQd", true, "no conflict"],
      ["AsKs", "AsQh", false, "shared As"],
      ["AsKs", "AsKs", false, "identical hand"],
      ["AsKs", "garbage", false, "invalid second hand"],
      ["", "QhQd", false, "empty first hand"],
    ];
    for (const [a, b, expected, label] of cases) {
      it(`${a} vs ${b} → ${expected} (${label})`, () => {
        expect(isValidHandPair(a, b)).toBe(expected);
      });
    }
  });

  describe("randomHandPair", () => {
    it("never produces conflicting cards over 1000 trials", () => {
      for (let i = 0; i < 1000; i++) {
        const { a, b } = randomHandPair();
        expect(isValidHandPair(a, b)).toBe(true);
      }
    });
    it("is deterministic given a seeded RNG", () => {
      const seeded = (() => {
        let s = 1;
        return () => {
          s = (s * 9301 + 49297) % 233280;
          return s / 233280;
        };
      })();
      const first = randomHandPair(seeded);
      const second = randomHandPair(seeded);
      expect(first).not.toEqual(second); // RNG advanced
    });
  });

  describe("shuffle", () => {
    it("returns a permutation of the input", () => {
      const input = [1, 2, 3, 4, 5];
      const out = shuffle(input);
      expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
    });
    it("does not mutate the input (immutability)", () => {
      const input = [1, 2, 3, 4, 5];
      const snapshot = [...input];
      shuffle(input);
      expect(input).toEqual(snapshot);
    });
  });
  ```
- **MIRROR**: `web/src/components/estimation-slider/sliderMath.test.ts` (table-driven, AAA, no comments).
- **IMPORTS**: `vitest`, the helpers.
- **GOTCHA**: The 1000-trial test is fast (<10 ms) and the only realistic way to spot the conflict-skew bug if someone "fixes" `randomHandPair` to use a retry loop with a borked predicate.
- **VALIDATE**: `cd web && npm test -- problem` — all green.

### Task 3: `exerciseConfig.ts` — tolerance + anchors
- **ACTION**: Centralize the small-but-tunable constants so Phase 5 (and play-testing) can change them in one place.
- **IMPLEMENT**:
  ```typescript
  // Tolerance is expressed in percentage points on the 0..100 axis.
  // ±5 ≈ Elevate-style "close enough" feel; tune in Phase 5 with on-device play.
  export const EQUITY_TOLERANCE = 5;

  // Visual ticks on the slider track. Visual only — no snapping.
  export const EQUITY_ANCHORS: readonly number[] = [0, 25, 50, 75, 100];
  ```
- **MIRROR**: Module style of `web/src/lib/engine.ts` — named exports only.
- **IMPORTS**: none.
- **GOTCHA**: Don't bury these in `ExerciseScreen.tsx`. Phase 5 will sit on this file; expecting a fresh reader to grep for `tolerance` is friction.
- **VALIDATE**: `cd web && npx tsc --noEmit --pretty false` clean.

### Task 4: `PlayingCard` presentational component
- **ACTION**: A small visual card. Rank top-left, suit centered, color from suit. Sized for two-up-by-two display on a phone-width screen.
- **IMPLEMENT**:
  ```typescript
  "use client";

  import type { Card } from "./problem";

  interface PlayingCardProps {
    card: Card;
  }

  const SUIT_GLYPH: Record<string, string> = {
    s: "♠",
    h: "♥",
    d: "♦",
    c: "♣",
  };

  function isRed(suit: string): boolean {
    return suit === "h" || suit === "d";
  }

  export function PlayingCard({ card }: PlayingCardProps) {
    const glyph = SUIT_GLYPH[card.suit];
    const colorClass = isRed(card.suit)
      ? "text-rose-600 dark:text-rose-400"
      : "text-zinc-900 dark:text-zinc-100";
    return (
      <div
        data-testid="playing-card"
        data-rank={card.rank}
        data-suit={card.suit}
        aria-label={`${card.rank} of ${SUIT_NAME[card.suit]}`}
        className={`flex h-20 w-14 flex-col items-start justify-between rounded-md border border-zinc-300 bg-white p-1.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 ${colorClass}`}
      >
        <span className="text-lg font-semibold leading-none">{card.rank}</span>
        <span className="self-center text-2xl leading-none">{glyph}</span>
        <span className="self-end rotate-180 text-lg font-semibold leading-none">
          {card.rank}
        </span>
      </div>
    );
  }

  const SUIT_NAME: Record<string, string> = {
    s: "spades",
    h: "hearts",
    d: "diamonds",
    c: "clubs",
  };
  ```
- **MIRROR**: `HandInput` shape in `web/src/app/page.tsx:73-88` — named function, props interface above, destructured params, no `React.FC`.
- **IMPORTS**: type-only `import type { Card } from "./problem"`.
- **GOTCHA**:
  1. `aria-label` matters — screen readers announce "Ace of spades", not "A♠".
  2. Use `data-rank`/`data-suit` attributes for tests rather than parsing rendered text.
  3. No animation here. Cards are static; only the slider/feedback animate.
  4. **Anti-template policy**: a vanilla white card is fine for Phase 4. Phase 5 will treat the card art (palette, type pairing, possibly a corner mark or hatch). Don't overshoot now — but don't ship a generic shadcn-card either.
- **VALIDATE**: covered by `ExerciseScreen.test.tsx` rendered-card-count assertion.

### Task 5: `HandDisplay` row
- **ACTION**: Compose two `PlayingCard`s with an optional caption ("Hand A" / "Hand B").
- **IMPLEMENT**:
  ```typescript
  "use client";

  import { PlayingCard } from "./PlayingCard";
  import { parseHand } from "./problem";

  interface HandDisplayProps {
    hand: string; // 4-char hand string
    label?: string;
  }

  export function HandDisplay({ hand, label }: HandDisplayProps) {
    const [c1, c2] = parseHand(hand);
    return (
      <div className="flex flex-col items-center gap-1">
        {label !== undefined ? (
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {label}
          </span>
        ) : null}
        <div className="flex gap-2" data-testid="hand-display">
          <PlayingCard card={c1} />
          <PlayingCard card={c2} />
        </div>
      </div>
    );
  }
  ```
- **MIRROR**: `HandInput` style.
- **IMPORTS**: local `./PlayingCard`, local `./problem`.
- **GOTCHA**: `parseHand` throws — the screen guarantees `hand` is valid before passing it down (URL parser falls back on invalid). Don't add a try/catch here; let bad input fail loudly during development.
- **VALIDATE**: covered by ExerciseScreen tests.

### Task 6: `FeedbackPanel` — verdict + truth + next button
- **ACTION**: Hidden before release; visible after release. Shows verdict text, truth %, and a "Next" button that calls `onNext`.
- **IMPLEMENT**:
  ```typescript
  "use client";

  interface FeedbackPanelProps {
    released: boolean;
    isWithinTolerance: boolean;
    truthPercent: number;
    onNext: () => void;
  }

  export function FeedbackPanel({
    released,
    isWithinTolerance,
    truthPercent,
    onNext,
  }: FeedbackPanelProps) {
    if (!released) {
      // Reserve vertical space so the layout doesn't jump on reveal.
      return (
        <div
          data-testid="feedback-panel"
          data-released="false"
          aria-hidden
          className="h-20"
        />
      );
    }
    const verdict = isWithinTolerance ? "close enough" : "not quite";
    const verdictClass = isWithinTolerance
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
    return (
      <div
        data-testid="feedback-panel"
        data-released="true"
        className="flex h-20 flex-col items-center justify-between gap-2"
      >
        <p className={`text-base font-semibold tracking-tight ${verdictClass}`}>
          {verdict} · {truthPercent.toFixed(1)}%
        </p>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          next →
        </button>
      </div>
    );
  }
  ```
- **MIRROR**: `ResultLine` from `web/src/app/page.tsx:99-129` (small named function, prop interface above, exhaustive states).
- **IMPORTS**: none.
- **GOTCHA**:
  1. **Reserve the height** in the unreleased state. If the panel mounts only after release, the slider+cards reflow upward and the user perceives a jump — bad on phone.
  2. The `next →` button is a real `<button>`, not a styled `<div>`. Keyboard + screen readers free.
  3. No router / engine logic here — `onNext` is injected. Keeps this component pure-presentational and testable.
- **VALIDATE**: ExerciseScreen tests assert `data-released="false"` initially, `data-released="true"` after a synthetic release.

### Task 7: `ExerciseScreen` — the integration layer
- **ACTION**: Compose engine + URL state + slider + cards + feedback. This is the screen's brain.
- **IMPLEMENT (sketch)**:
  ```typescript
  "use client";

  import { useEffect, useMemo, useState } from "react";
  import { useRouter, useSearchParams } from "next/navigation";
  import { EstimationSlider } from "@/components/estimation-slider";
  import { getEngine, type EngineApi } from "@/lib/engine";
  import { HandDisplay } from "./HandDisplay";
  import { FeedbackPanel } from "./FeedbackPanel";
  import { isValidHandPair, randomHandPair } from "./problem";
  import { EQUITY_TOLERANCE, EQUITY_ANCHORS } from "./exerciseConfig";

  interface ReleaseState {
    value: number;
    isWithinTolerance: boolean;
  }

  export function ExerciseScreen() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [api, setApi] = useState<EngineApi | null>(null);
    const [initError, setInitError] = useState<string | null>(null);
    const [release, setRelease] = useState<ReleaseState | null>(null);

    // Engine lifecycle — mirror page.tsx exactly.
    useEffect(() => {
      let cancelled = false;
      getEngine()
        .then((engineApi) => { if (!cancelled) setApi(engineApi); })
        .catch((err: unknown) => {
          if (cancelled) return;
          setInitError(err instanceof Error ? err.message : String(err));
        });
      return () => { cancelled = true; };
    }, []);

    // Resolve the active problem from URL, falling back to a random pair.
    const problem = useMemo(() => {
      const a = searchParams.get("a") ?? "";
      const b = searchParams.get("b") ?? "";
      if (isValidHandPair(a, b)) return { a, b };
      return randomHandPair();
    }, [searchParams]);

    // If URL is empty/invalid, write a fresh pair so refresh is reproducible.
    useEffect(() => {
      const a = searchParams.get("a") ?? "";
      const b = searchParams.get("b") ?? "";
      if (!isValidHandPair(a, b)) {
        const params = new URLSearchParams({ a: problem.a, b: problem.b });
        router.replace(`?${params.toString()}`);
      }
    }, [searchParams, problem, router]);

    // Compute truth once per (problem, api) pair.
    const truthPercent = useMemo(() => {
      if (api === null) return null;
      try {
        return api.equityVs(problem.a, problem.b) * 100;
      } catch {
        return null;
      }
    }, [api, problem]);

    // Reset the release state when the problem changes.
    useEffect(() => {
      setRelease(null);
    }, [problem.a, problem.b]);

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
            min={0}
            max={100}
            truth={truthPercent}
            tolerance={EQUITY_TOLERANCE}
            anchors={[...EQUITY_ANCHORS]}
            onRelease={(value, isWithinTolerance) =>
              setRelease({ value, isWithinTolerance })
            }
            ariaLabel="Estimate Hand A equity"
          />
        </section>

        <FeedbackPanel
          released={release !== null}
          isWithinTolerance={release?.isWithinTolerance ?? false}
          truthPercent={truthPercent}
          onNext={onNext}
        />
      </main>
    );
  }
  ```
- **MIRROR**:
  - Engine lifecycle: `web/src/app/page.tsx:9-27` (cancelled flag, unknown narrow).
  - Component shape: small named function, props interface above (none here — no parent passes anything), no `React.FC`.
- **IMPORTS**: `react`, `next/navigation`, `@/components/estimation-slider`, `@/lib/engine`, local components + helpers + config.
- **GOTCHA**:
  1. **Suspense boundary lives in `page.tsx`, not here.** Don't `<Suspense>` inside `ExerciseScreen`; let the route boundary handle it.
  2. `useMemo` for `problem` is correct because `searchParams` is referentially unstable but the `(a, b)` pair drives everything else. Without memoization, every navigation re-rolls the random fallback and writes to the URL again — infinite loop.
  3. **Reset the release state on problem change** (the `useEffect` keyed on `[problem.a, problem.b]`). If you forget, "next" will look like it's working but the slider will still display the previous tolerance band briefly.
  4. The `EstimationSlider` re-mounts when `truth` changes — that's fine because the slider's internal state is reset on remount, and `key={problem.a + problem.b}` is *not* needed (React reconciles on the same component identity, but `truth` is a prop, so the band recomputes naturally).
     **However**, the slider does *not* internally reset `released` when `truth` changes — verify this. If left over, force a remount: add `key={`${problem.a}${problem.b}`}` to `<EstimationSlider/>`. This is the safe default.
  5. `router.replace(`?${params.toString()}`)` is right — the leading `?` is required. Passing just the query string without `?` will replace the path with the literal text.
  6. `truthPercent` is `number | null`. The early-return guard (`api === null || truthPercent === null`) makes the slider render only when truth is real. Avoids passing `null` truth into `EstimationSlider` (which would throw `assertSliderProps`).
  7. `EQUITY_ANCHORS` is `readonly number[]`; spread to a mutable array for the slider's `anchors?: number[]` prop.
- **VALIDATE**: render-contract tests in Task 9 + manual Pixel walkthrough.

### Task 8: Barrel export
- **ACTION**: One-line barrel for the exercise feature.
- **IMPLEMENT**:
  ```typescript
  export { ExerciseScreen } from "./ExerciseScreen";
  ```
- **MIRROR**: `web/src/components/estimation-slider/index.ts:1-3`.
- **IMPORTS**: none.
- **GOTCHA**: None.
- **VALIDATE**: tsc clean.

### Task 9: Render-contract tests for `ExerciseScreen`
- **ACTION**: Render the screen with seeded URL params (via mocking `next/navigation`), assert structure: prompt visible, both hands rendered as 4 cards, slider mounts, feedback hidden until released.
- **IMPLEMENT**:
  ```typescript
  import { describe, it, expect, vi, beforeEach } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { ExerciseScreen } from "./ExerciseScreen";

  // next/navigation isn't usable in jsdom without a router context.
  // Mock the two hooks the screen consumes.
  const replaceMock = vi.fn();
  vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
    useSearchParams: () => new URLSearchParams("a=AsKs&b=QhQd"),
  }));

  beforeEach(() => {
    replaceMock.mockClear();
  });

  describe("ExerciseScreen — render contract", () => {
    it("renders the prompt", async () => {
      render(<ExerciseScreen />);
      // engine resolves synchronously under the hood, but the effect runs
      // post-render — wait for the loading state to clear.
      await screen.findByText(/equity of Hand A/i);
    });

    it("renders four playing cards (two per hand)", async () => {
      const { container } = render(<ExerciseScreen />);
      await screen.findByText(/equity of Hand A/i);
      const cards = container.querySelectorAll('[data-testid="playing-card"]');
      expect(cards.length).toBe(4);
    });

    it("mounts the estimation slider", async () => {
      render(<ExerciseScreen />);
      await screen.findByText(/equity of Hand A/i);
      const slider = screen.getByRole("slider");
      expect(slider.getAttribute("aria-orientation")).toBe("vertical");
    });

    it("hides feedback before release", async () => {
      render(<ExerciseScreen />);
      await screen.findByText(/equity of Hand A/i);
      const panel = screen.getByTestId("feedback-panel");
      expect(panel.getAttribute("data-released")).toBe("false");
    });
  });
  ```
- **MIRROR**: `web/src/components/estimation-slider/EstimationSlider.test.tsx:5-89` — render-contract style, no fake gestures.
- **IMPORTS**: `vitest`, `@testing-library/react`, the screen.
- **GOTCHA**:
  1. `vi.mock("next/navigation", ...)` must appear at the top (Vitest hoists it). Don't try to mock it inside a `beforeEach`.
  2. The engine is real (not mocked). It runs in node via the `engine` → `pkg-node` alias from `vitest.config.ts`. `equityVs("AsKs", "QhQd")` will actually compute. That's by design — the integration is what we're verifying.
  3. **Do not** assert on the exact truth percent — the engine is approximate. Only assert structural / contract things.
  4. The "released" path is fiddly to test without faking pointer events. Skip it here. Phase 4's manual Pixel test is the real signal for the released-feedback flow; the unit-level guarantee comes from `FeedbackPanel`'s own contract.
- **VALIDATE**: `cd web && npm test` — all prior tests still green; ~4 new tests pass.

### Task 10: Replace `web/src/app/page.tsx` with the Suspense wrapper
- **ACTION**: Drop the smoke page entirely. New `page.tsx` is a thin **server component** that renders `<Suspense>` + `<ExerciseScreen/>`.
- **IMPLEMENT**:
  ```typescript
  import { Suspense } from "react";
  import { ExerciseScreen } from "@/components/exercise";

  export default function Home() {
    return (
      <Suspense
        fallback={
          <main className="flex min-h-screen flex-col items-center justify-center p-6">
            <p className="text-zinc-500">loading…</p>
          </main>
        }
      >
        <ExerciseScreen />
      </Suspense>
    );
  }
  ```
- **MIRROR**: Existing `page.tsx` exports a default function called `Home` — preserve that name.
- **IMPORTS**: `react` (Suspense), local barrel.
- **GOTCHA**:
  1. **No `"use client"` here.** The whole reason `useSearchParams` is wrapped in a Client Component (`ExerciseScreen`) below a Suspense boundary is so Next can statically prerender the shell.
  2. The fallback markup roughly matches the loading state of `ExerciseScreen` so the swap looks deliberate. Phase 5 can tune.
  3. Do not import `EstimationSlider` directly here — it's a Client component, and importing it into a Server component would force the boundary upward.
- **VALIDATE**: `cd web && npm run build` — Next 16 should still prerender `/` (look for `○ /` in the output, indicating static).

### Task 11: Manual Pixel + dev-server walkthrough
- **ACTION**: Boot the dev server, exercise the screen on Chrome on Pixel and on desktop Chrome. Confirm the PRD success signal: "Owner can complete 5 problems back-to-back without thinking about the app, only the math."
- **IMPLEMENT**:
  - `cd web && npm run dev`
  - On desktop: load `/`, observe random pair, drag slider, verify reveal, click Next, repeat 5×.
  - On Pixel: load the dev server over LAN (or use a tunnel), repeat. Specifically check:
    - Vertical drag tracks the finger; no page scroll hijack.
    - Releasing reveals band + truth + verdict; no stutter.
    - "Next" mints a fresh problem; URL updates; refresh reproduces the same problem.
    - Reduced-motion (Android Settings → Accessibility → Remove animations) → reveal is instant.
- **MIRROR**: Phase 3's Task 9 stance — manual on-device check is part of the deliverable, not deferred further.
- **IMPORTS**: none.
- **GOTCHA**:
  1. If the slider is jittery on Pixel, the first suspect is `touch-action: none` *not* being applied (regression in the slider primitive); the second is the page wrapper having `overflow-y: auto` causing rubber-band. Fix the wrapper before fixing the slider.
  2. If the URL doesn't update on Next, check `router.replace` is being called with the leading `?`.
  3. If the engine fails to load, the alias on `vitest.config.ts` (Node) is fine but the **browser** uses `pkg/`, not `pkg-node/`. Verify `engine/pkg/engine.js` exists.
- **VALIDATE**: 5 problems back-to-back pass the success signal. Note any UX nits in the implementation report — they become Phase 5 inputs.

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `buildDeck` size | n/a | 52 unique cards | no |
| `parseHand` happy path | `"AsKs"` | `[{rank:"A",suit:"s"}, {rank:"K",suit:"s"}]` | no |
| `parseHand` invalid rank | `"XsKs"` | throws | yes |
| `parseHand` invalid suit | `"AxKs"` | throws | yes |
| `parseHand` wrong length | `"AKs"` | throws | yes |
| `isValidHandPair` happy | `"AsKs", "QhQd"` | `true` | no |
| `isValidHandPair` shared card | `"AsKs", "AsQh"` | `false` | yes |
| `isValidHandPair` identical | `"AsKs", "AsKs"` | `false` | yes |
| `isValidHandPair` invalid | `"AsKs", "garbage"` | `false` | yes |
| `isValidHandPair` empty | `"", "QhQd"` | `false` | yes |
| `randomHandPair` no-conflict (1000 trials) | `Math.random` | every pair valid | yes (statistical) |
| `randomHandPair` advances RNG | seeded RNG | two distinct pairs | yes |
| `shuffle` permutation | `[1,2,3,4,5]` | sorted result equals input | no |
| `shuffle` immutability | mutable input | original array unchanged | yes |
| `ExerciseScreen` prompt | URL `a=AsKs&b=QhQd` | "What's the equity of Hand A?" visible | no |
| `ExerciseScreen` 4 cards | URL `a=AsKs&b=QhQd` | 4 `[data-testid="playing-card"]` nodes | no |
| `ExerciseScreen` slider mounts | URL `a=AsKs&b=QhQd` | slider role with `aria-orientation="vertical"` | no |
| `ExerciseScreen` feedback hidden | URL `a=AsKs&b=QhQd` | `data-released="false"` | no |

### Edge Cases Checklist
- [ ] URL with no params → random pair generated and written via `router.replace`
- [ ] URL with garbage (`?a=zzzz&b=zzzz`) → falls back to random pair, writes valid params
- [ ] URL with conflict (`?a=AsKs&b=AsQh`) → falls back to random pair
- [ ] Engine init error → error message rendered, no crash
- [ ] Tolerance exactly at boundary (`value = truth + tolerance`) → `isWithinTolerance: true` (handled by slider primitive)
- [ ] Reduced-motion → slider band reveal is instant; verdict text appears immediately
- [ ] Truth at extremes (e.g. `truth = 100`) → slider band may be clipped at top; verify visually on Pixel
- [ ] Rapid "next" tapping → no double-renders; URL updates atomically (Next 16 batches navigations)

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
EXPECT: All tests pass — prior 46 tests + new ~14 problem tests + ~4 ExerciseScreen tests.

### Build
```bash
cd web && npm run build
```
EXPECT: Next 16 + Turbopack build succeeds. The `/` route should still appear as `○` (static, prerendered shell) in the build output, since `useSearchParams` is now isolated below a Suspense boundary. If `/` shows as `λ`/dynamic, Suspense wiring is wrong.

### Browser Validation (manual — on-device)
```bash
cd web && npm run dev
```
- [ ] On desktop Chrome: 5 problems back-to-back, no UI stalls, URL updates, refresh reproduces problem.
- [ ] On Pixel + Chrome: same. Specifically verify vertical drag does not scroll the page.
- [ ] Reduced-motion enabled: reveal is instant, no jank.
- [ ] Engine init failure (manually break the alias to test): error is surfaced, not swallowed.

### Manual Validation
- [ ] `web/src/app/page.tsx` is a thin Suspense wrapper (no `"use client"`, ≤ ~15 lines).
- [ ] No new top-level routes added under `web/src/app/`.
- [ ] `web/src/components/exercise/` exists with the listed files.
- [ ] `EstimationSlider` is imported only from the barrel, not deep imports.
- [ ] No engine import exists outside `lib/engine.ts` and `ExerciseScreen.tsx`.
- [ ] `router.replace` is used (not `push`) when minting a new problem.
- [ ] Tolerance and anchors are read from `exerciseConfig.ts`, not hardcoded in `ExerciseScreen.tsx`.

---

## Acceptance Criteria
- [ ] `/` route renders the exercise screen, not the Phase 2 smoke page.
- [ ] Visiting `/` with no query params produces a random hand pair and writes it to the URL.
- [ ] Visiting `/?a=AsKs&b=QhQd` reproduces that exact problem.
- [ ] Two visual cards per hand are rendered with the correct rank glyph, suit glyph, and color (red for h/d, black for s/c).
- [ ] The slider drives the estimation; releasing reveals the tolerance band, truth line, and verdict.
- [ ] "Next" produces a fresh, non-conflicting hand pair, updates the URL via `router.replace`, and resets the released state.
- [ ] All Vitest tests pass; static analysis (tsc + ESLint) clean; build succeeds with `/` prerendered statically.
- [ ] Manual Pixel walkthrough: 5 problems completable without thinking about the app.

## Completion Checklist
- [ ] Code follows discovered patterns (PascalCase props interface, named-function components, named exports).
- [ ] Animations stay on `transform`/`opacity` only — no layout-bound transitions.
- [ ] No `console.log` left behind.
- [ ] No engine import outside the boundary (`lib/engine.ts` + `ExerciseScreen.tsx`).
- [ ] `EQUITY_TOLERANCE` and `EQUITY_ANCHORS` are the **only** numeric tuning knobs; both live in `exerciseConfig.ts`.
- [ ] Implementation report drafted at `.claude/PRPs/reports/exercise-screen-report.md` after the work is done.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `useSearchParams` opts whole route into client render → `/` is no longer statically prerendered → bundle size + perf regression | LOW | MEDIUM | Suspense boundary in `page.tsx`; verify in `npm run build` output that `/` is still `○`/static |
| Slider doesn't reset its `released` flag when `truth` prop changes → "next" shows stale band briefly | LOW | LOW | Add `key={`${problem.a}${problem.b}`}` to `<EstimationSlider/>` to force a clean remount |
| Random hand pair generates a conflict on edge cases | VERY LOW | HIGH | 1000-trial test in `problem.test.ts` catches it; deck-shuffle approach is structurally correct |
| Tolerance feels wrong (too easy / too hard) on Pixel | MEDIUM | MEDIUM | `EQUITY_TOLERANCE` is one constant in one file; tune during Phase 5 with on-device play |
| `router.replace` writes loop with `useMemo`/`useEffect` interaction (effect re-runs on the URL it just wrote) | MEDIUM | HIGH | The URL-write `useEffect` guards on `!isValidHandPair(...)` — once written, the URL becomes valid and the guard prevents re-entry |
| jsdom render of `ExerciseScreen` flaky because engine init is now sync but effects still run post-render | LOW | LOW | Tests use `screen.findByText(...)` (async) — survives whether the engine init is sync or async |
| Vertical drag on Pixel hijacked by Chrome page-scroll | LOW | HIGH | `touch-action: none` already on slider track (Phase 3); verify in walkthrough; if it regresses, fix in slider primitive |

## Notes
- **Slider value scale.** The slider operates in the same units as `truth`. We use `0..100` (percentage points) so the visible scale matches the verdict text. The conversion `equityVs * 100` happens once in `ExerciseScreen` and never leaks elsewhere.
- **Why URL params, not a seed integer.** Hand strings (`AsKs`) are immediately legible — sharing the URL conveys what the problem *is*, not just an opaque seed. Tradeoff: harder to compress; not relevant at MVP scale.
- **Why `router.replace`, not `push`.** Each "next" creates a problem; if we `push`, the back button walks 20 problems before leaving the app. `replace` makes back exit the exercise — matches the PRD's "no back navigation" intent.
- **Phase 5 inputs to capture during walkthrough.** Phase 5 (Aesthetic pass) needs concrete starting points. While doing the manual walkthrough, list 3-5 specific things that look unfinished (e.g., card type pairing, slider thumb depth, verdict hierarchy). These become Phase 5 tasks, not Phase 4.
- **Carry-overs and constraints**:
  - WASM bundle size is over the 80 KB budget (233 KB gzipped) — accepted; revisit only if a perf measurement on Pixel justifies it.
  - The slider primitive is finalized as of Phase 3; if Phase 4 needs to extend it (e.g., a "post-release lock" so re-dragging doesn't re-fire `onRelease`), do that *here* with local state, not by editing the primitive.
  - No Rust changes; `engine/pkg/` and `engine/pkg-node/` stay as-is.
