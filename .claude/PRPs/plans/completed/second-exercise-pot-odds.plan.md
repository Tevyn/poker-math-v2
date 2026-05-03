# Plan: Second Exercise (Pot Odds) + Config-Driven Exercise Shell (Phase 6)

## Summary
Pressure-test the Phase 1–5 components by introducing a **second exercise type — Pot Odds** — and refactor `ExerciseScreen` from a hardcoded hand-vs-hand surface into a thin shell driven by an `Exercise` definition. The reusable primitives (`EstimationBar`, `EquityAxis`, `ActualEquityTooltip`, `FireworkBurst`, `useAutoAdvance`, feedback copy) stay in place; what's exercise-specific (problem generator, truth source, prompt copy, axis label, value formatter, "stage" content) gets pulled out behind a single `Exercise<TProblem>` interface. URL convention extends from `?a=…&b=…` to `?type=equity&a=…&b=…` and `?type=pot-odds&pot=100&bet=50`. "Next" stays in the same exercise type. The PRD's open question — *"bespoke screen vs shared primitive"* — gets answered with code, not speculation.

## User Story
As the project owner, I want a second exercise that lives next to the equity drill and reuses the same UI shell, so that I can confirm the components generalize before committing to building 13 more exercises, and so that I have something other than equity to drill while procrastinating.

## Problem → Solution
**Current state:** `ExerciseScreen.tsx` hardcodes hand-vs-hand: it parses `?a=…&b=…`, calls `api.equityVs`, renders two `HandDisplay`s, and labels the tooltip "Actual Equity". `EquityAxis` is named for equity but is generic. `ActualEquityTooltip` has the label baked into the JSX. `exerciseConfig.ts` mixes exercise-specific tuning (`EQUITY_TOLERANCE`, `EQUITY_ANCHORS`) with global timing (`SUCCESS_HOLD_MS`, etc.). `problem.ts` is hand-vs-hand only. There is no `/pot-odds` surface, no notion of multiple exercise types, and no shared `Exercise` type.

**Desired state:** A single `ExerciseScreen` reads `?type=` from the URL, looks up an `Exercise` definition from a registry (`exercises/registry.ts`), and renders the shell. Each exercise definition owns: its problem shape, URL serialization, problem generator, truth function, prompt copy, axis anchors + label, value formatter (`46.3%` vs `33.3%`), tolerance, and a `<Stage>` component (the visual middle of the screen — cards for equity, pot/bet text for pot-odds). Two exercises ship: `equity` (existing, ported) and `pot-odds` (new, pure TS). "Next" generates a new problem in the same type. URL is reproducible per problem. Everything else (drag, axis, success/miss states, fireworks, auto-advance, reduced-motion, tooltip drop) is shared.

## Metadata
- **Complexity**: Medium-High (refactor + new feature in one phase, but the refactor surface is contained)
- **Source PRD**: `.claude/PRPs/prds/poker-trainer.prd.md`
- **PRD Phase**: Phase 6 — Second exercise + config-driven shell
- **Estimated Files**: ~14 (8 new, 6 updated, 0 deleted — old files renamed in-place via git mv)

---

## UX Design

### Equity exercise — unchanged
Same Phase 5 surface. `?type=equity&a=AsKs&b=QhQd` (default if `type` omitted).

### New: Pot Odds exercise
URL: `/?type=pot-odds&pot=100&bet=50` → "Villain bets $50 into a $100 pot. What % do you need to win to call?"

```
┌────────────────────────────────────┐
│   What % do you need to win        │
│   to call?                         │
│                                    │
│ ┃ 100         ┌────────────────┐   │
│ ┃             │  Pot           │   │
│ ┃ 80          │  $100          │   │
│ ┃             │                │   │
│ ┃ 60          │  Bet to call   │   │
│ ┃             │  $50           │   │
│ ┃ 40          └────────────────┘   │
│ ┃ 20                               │
│ ┃ 0                                │
│                                    │
│  ┌─ drag to estimate pot odds ↑ ─┐ │
│  └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Equity (Phase 5) | Pot Odds (Phase 6) | Notes |
|---|---|---|---|
| Stage content | Two hands stacked | Pot + bet text panel | Pluggable per exercise; same vertical center region |
| Prompt copy | "What's the equity of Hand A?" | "What % do you need to win to call?" | Per-exercise, top of screen |
| Bar prompt | "drag to estimate equity" | "drag to estimate pot odds" | `EstimationBar.promptCopy` already configurable |
| Tooltip label | "Actual Equity" | "Required equity" | Tooltip generalized; label per exercise |
| Truth source | `api.equityVs(a, b) * 100` | Pure TS: `bet / (pot + 2 * bet) * 100` | No engine round-trip for Pot Odds |
| Tolerance | ±10 pp | ±5 pp (smaller — answer is more deterministic, drilling sharper estimates) | Per-exercise config |
| Axis | 0/20/40/60/80/100 | Same | Identical anchors here; reuse |
| Next | Random hand pair, same type | Random pot+bet from sane stakes table, same type | Per-exercise generator |
| Auto-advance | 1.2s success / 1.8s miss | Same | Shared timing constants |

### Out of UX scope
- A picker / menu to choose exercise type. Switch by editing the URL or by future deep-link from a future drill-rotation system.
- Cross-type rotation in "next". Each exercise drills itself; rotation is a separate post-MVP question.
- Pot-odds cards or visual chips. Text-only stage; "Phase 5-equivalent polish" for Pot Odds is a follow-up.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `.claude/PRPs/prds/poker-trainer.prd.md` | 50-53, 78-86, 184-233 | "Should: Additional exercise types"; open question on bespoke vs shared screen; phase table format |
| P0 | `.claude/PRPs/plans/completed/elevate-style-ui-rebuild.plan.md` | all | Establishes the current Phase-5 surface, naming, and component boundaries |
| P0 | `web/src/components/exercise/ExerciseScreen.tsx` | all (249) | The thing being refactored; state machine + URL handling stays, content gets pluggable |
| P0 | `web/src/components/estimation-bar/EstimationBar.tsx` | all (167) | Already accepts `min`, `max`, `truth`, `tolerance`, `promptCopy`, `ariaLabel` — fully reusable as-is. Do **not** edit. |
| P0 | `web/src/components/equity-axis/EquityAxis.tsx` | all (99) | Misnamed but generic. Rename to `Axis` and add an optional axis label. |
| P0 | `web/src/components/feedback/ActualEquityTooltip.tsx` | all (51) | Hardcoded "Actual Equity" label and `.toFixed(1) + "%"` formatter. Generalize both. |
| P0 | `web/src/components/feedback/feedbackCopy.ts` | all | Phrase pool; keyed by problemKey. Reusable across exercises with no change. |
| P0 | `web/src/components/exercise/exerciseConfig.ts` | all (12) | Split: equity-specific tunings vs shared timing constants. |
| P0 | `web/src/components/exercise/problem.ts` | all (123) | Hand-vs-hand specific. Move to `exercises/equity/problem.ts`. |
| P0 | `web/src/lib/engine.ts` | all (26) | Engine still required only for equity exercise; pot-odds skips it entirely. |
| P0 | `web/src/app/page.tsx` | all (16) | Suspense wrapper — survives this phase unchanged. |
| P0 | `web/AGENTS.md` | all (4) | "This is NOT the Next.js you know." Check `node_modules/next/dist/docs/` if uncertain about routing/searchParams. |
| P0 | `~/.claude/rules/web/coding-style.md` | all | Feature-folder layout; named exports; no `React.FC` |
| P0 | `~/.claude/rules/common/coding-style.md` | "YAGNI" + "DRY" sections | The `Exercise` interface should cover **only** what the two shipped exercises need — do not invent fields for hypothetical third/fourth exercises |
| P1 | `web/src/hooks/useAutoAdvance.ts` | all | Shared, no change. Confirm reusability. |
| P1 | `web/src/components/feedback/FireworkBurst.tsx` | all | Shared, no change. |
| P1 | `web/src/lib/sliderMath.ts` | all (58) | `assertSliderProps` validates `truth` is in `[min, max]` — pot-odds truth must be too |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Pot odds formula | Standard hold'em math | To call a bet of `B` into a pot of `P`, you risk `B` to win `P + B`. Required win % = `B / (P + 2B) * 100`. Example: $50 into $100 pot → 50/200 = 25%. |
| `useSearchParams` semantics | Next 16 (already used in `ExerciseScreen.tsx`) | `searchParams.get('type')` returns `string | null`; default to `'equity'` for backward-compatible URLs |

```
KEY_INSIGHT: The cleanest abstraction boundary is "what changes per exercise" — problem shape, truth fn, stage component, copy, formatter, tolerance, anchors. Everything else (state machine, drag, axis, feedback, fireworks, auto-advance, URL plumbing) stays in the shell.
APPLIES_TO: Exercise<TProblem> interface design.
GOTCHA: Resist adding fields "in case" a future exercise needs them (e.g. "axisMin/axisMax", "valueScale", "snapPoints"). Both shipped exercises use 0..100 percent axes. Add knobs when the third exercise actually needs them — YAGNI.

KEY_INSIGHT: The existing `?a=…&b=…` URL convention should be preserved as a backward-compat default. If `?type` is missing, default to equity and read the equity-specific params.
APPLIES_TO: ExerciseScreen URL parsing.
GOTCHA: Don't redirect old URLs. Just default. Saved/shared problem links stay valid.

KEY_INSIGHT: `ActualEquityTooltip` ships with the "Actual Equity" string burnt into JSX and a fixed `.toFixed(1) + "%"` formatter. Generalizing it means accepting a label and a formatter as props.
APPLIES_TO: ActualValueTooltip refactor.
GOTCHA: Default the label to "Actual" and formatter to `(n) => n.toFixed(1) + "%"` so the public surface stays minimal for the common case.

KEY_INSIGHT: Pot Odds is pure arithmetic. Don't route it through the engine; it's wasteful and noisy.
APPLIES_TO: pot-odds exercise definition.
GOTCHA: The engine boot path in `ExerciseScreen` is currently unconditional. Make engine init lazy / conditional on the active exercise's `requiresEngine` flag, OR keep it eager (cheap) and just not call it from pot-odds. **Eager is simpler — the engine boots once at app start anyway and the cost is the WASM init, not per-call. Keep it eager unless boot becomes a measured problem.**

KEY_INSIGHT: `EquityAxis` is the only file with "equity" in the name that is genuinely generic. Rename to `Axis`. Keep the existing `EquityAxis` export as a re-export for one phase if you want a soft landing — but the plan calls for hard rename, no aliases. Phase 7+ shouldn't carry rename debt.
APPLIES_TO: equity-axis folder.
GOTCHA: `git mv` not delete-and-create, to preserve blame. Update all 4 import sites in one commit.

KEY_INSIGHT: The `key={problemKey}` on `EstimationBar` in `ExerciseScreen` is what forces the bar's internal `released` state to reset between problems. Keep that; just rebuild the key from the active exercise's problem identity (e.g. `${type}|${pot}|${bet}` or `${type}|${a}|${b}`).
APPLIES_TO: ExerciseScreen render.
GOTCHA: Two exercises with the same problem identity strings would collide. Prefix with `type` to avoid the (rare) cross-type collision.

KEY_INSIGHT: `feedbackCopy.pickPhrase(seed, kind)` is deterministic per seed. Re-using `problemKey` as the seed across exercise types means the same key always picks the same phrase — that's a feature (stable per problem) not a bug.
APPLIES_TO: copy reuse.
GOTCHA: None.
```

---

## Patterns to Mirror

### EXERCISE_DEFINITION_SHAPE (new pattern — one of the deliverables)
```typescript
// Discoverable from: this plan's design.
// Two implementations land in this phase: equity, pot-odds.
export interface Exercise<TProblem> {
  /** URL `?type=` value. */
  readonly type: string;

  /** Headline copy at the top of the screen. */
  readonly prompt: string;

  /** Tooltip label, e.g. "Actual Equity" / "Required equity". */
  readonly tooltipLabel: string;

  /** Bar prompt copy, e.g. "drag to estimate equity". */
  readonly barPrompt: string;

  /** Slider tolerance in axis units (percentage points for both shipped exercises). */
  readonly tolerance: number;

  /** Axis anchors. Defaults to EQUITY_ANCHORS in shared config if omitted by the impl. */
  readonly axisAnchors: readonly number[];

  /** Format the resolved truth value for display, e.g. (n) => `${n.toFixed(1)}%`. */
  readonly formatValue: (n: number) => string;

  /** Generate a fresh random problem. */
  generateProblem(rng?: () => number): TProblem;

  /** Read a problem from URL search params. Returns null if not parseable/present. */
  parseProblem(params: URLSearchParams): TProblem | null;

  /** Serialize a problem to URL search params (without `type`; the shell adds it). */
  serializeProblem(problem: TProblem): Record<string, string>;

  /** Stable identity for React keys, e.g. "AsKs|QhQd" or "100|50". */
  problemKey(problem: TProblem): string;

  /**
   * Compute the truth value for this problem.
   * Synchronous if pure arithmetic; falls back to engine for combinatorial.
   * Returns null if not yet ready (e.g. engine not booted).
   */
  computeTruth(problem: TProblem, engine: EngineApi | null): number | null;

  /** The visual stage between the title and the bar. */
  Stage: (props: { problem: TProblem }) => React.ReactElement;
}
```
- `TProblem` is the per-exercise problem shape. For equity: `{ a: string; b: string }`. For pot-odds: `{ pot: number; bet: number }`.
- Definitions live in `exercises/<type>/exercise.ts`.
- A registry (`exercises/registry.ts`) maps `type` → `Exercise<unknown>`.

### NAMING_CONVENTION (mirrors existing)
```typescript
// SOURCE: web/src/components/exercise/ExerciseScreen.tsx:32, 158-171
export function ExerciseScreen() { ... }
function HandDisplay({ hand }: HandDisplayProps) { ... }
```
- PascalCase named function; props interface above; no `React.FC`.

### URL_HANDLING (extend existing)
```typescript
// SOURCE: web/src/components/exercise/ExerciseScreen.tsx:57-89
const urlA = searchParams.get("a") ?? "";
const urlB = searchParams.get("b") ?? "";
const urlValid = isValidHandPair(urlA, urlB);
```
- Mirror the read-then-validate-then-fall-back-to-random pattern. Apply per-exercise via `parseProblem`.

### TEST_STRUCTURE
- Mirror `problem.test.ts` style: `describe`/`it`, table-driven where shape repeats, AAA without comments.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `web/src/components/equity-axis/` → `web/src/components/axis/` | RENAME (`git mv`) | `Axis` is generic; the equity name is misleading post-Phase-6 |
| `web/src/components/axis/EquityAxis.tsx` → `Axis.tsx` | RENAME + ADD optional `axisLabel` prop | New optional prop; default behavior unchanged |
| `web/src/components/axis/index.ts` | UPDATE | Export `Axis` (and `AxisProps`) only |
| `web/src/components/feedback/ActualEquityTooltip.tsx` → `ActualValueTooltip.tsx` | RENAME + GENERALIZE | Accept `label: string` and `formatValue: (n: number) => string` props |
| `web/src/components/feedback/index.ts` | UPDATE | Re-export `ActualValueTooltip` |
| `web/src/components/exercise/ExerciseScreen.tsx` | UPDATE (refactor, ~30% delta) | Replace hand-vs-hand specifics with calls into the active `Exercise` |
| `web/src/components/exercise/exerciseConfig.ts` | SPLIT | Move equity tunings to `exercises/equity/exercise.ts`; keep `SUCCESS_HOLD_MS`, `MISS_HOLD_MS`, `FIREWORK_DURATION_MS`, `RELEASE_TRANSITION_MS` here as **shared** timing |
| `web/src/components/exercise/problem.ts` → `web/src/exercises/equity/problem.ts` | MOVE | Equity-specific; doesn't belong in shared exercise folder |
| `web/src/components/exercise/HandDisplay.tsx` | MOVE → `web/src/exercises/equity/HandDisplay.tsx` | Equity-specific stage component |
| `web/src/components/exercise/PlayingCard.tsx` | MOVE → `web/src/exercises/equity/PlayingCard.tsx` | Equity-specific |
| `web/src/exercises/types.ts` | CREATE | The `Exercise<TProblem>` interface above |
| `web/src/exercises/registry.ts` | CREATE | Maps `type` string → `Exercise<unknown>`; default-exports active list `[equity, potOdds]` |
| `web/src/exercises/equity/exercise.ts` | CREATE | Implements `Exercise<HandPair>`; uses moved `problem.ts` + `HandDisplay`; owns `EQUITY_TOLERANCE` and `EQUITY_ANCHORS` |
| `web/src/exercises/equity/exercise.test.ts` | CREATE | Round-trip serialize/parse, generateProblem produces valid pair, computeTruth uses engine |
| `web/src/exercises/pot-odds/exercise.ts` | CREATE | Implements `Exercise<PotOddsProblem>`; pure arithmetic truth fn; new stage component |
| `web/src/exercises/pot-odds/PotOddsStage.tsx` | CREATE | Text panel showing pot + bet |
| `web/src/exercises/pot-odds/problem.ts` | CREATE | Random pot/bet generator from a sane stakes table; serialize/parse helpers |
| `web/src/exercises/pot-odds/problem.test.ts` | CREATE | Truth math correctness; generator produces sane pots; parse/serialize round-trip |
| `web/src/exercises/pot-odds/exercise.test.ts` | CREATE | Same shape as equity exercise tests |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | UPDATE | New tests cover both exercise types via registry; old equity-only assertions still pass |

## NOT Building
- **A third exercise.** The point is to validate the abstraction with two; building three at once defeats the YAGNI bake-in.
- **Cross-type rotation in "next".** Stay in the same type. Rotation is its own design question (drilling order is a PRD open question).
- **A picker UI / menu.** Switching exercises = editing the URL. Adding navigation chrome is explicitly excluded by the PRD.
- **A `requiresEngine` lazy-init optimization.** Engine eagerly boots once; pot-odds just doesn't call it. Lazy boot is a perf knob to revisit only if measured.
- **Pot Odds visual polish (Phase 5 equivalent).** Text-only stage is the deliberate floor. Visual treatment is a follow-up if pot-odds proves it earns its keep.
- **Backwards-compat aliases for renamed components.** `EquityAxis` and `ActualEquityTooltip` go away. Update import sites in the same commit. The codebase is small; rename debt is more painful than the rename.
- **A separate `/pot-odds` route.** Single route, `?type=` distinguishes. Keeps the Suspense + page.tsx structure unchanged.
- **Migration of any saved URLs.** No persistence exists. The default-`type=equity` fallback handles old links.
- **Generalizing tolerance to a "graded" scheme** (close / closer / bullseye). Binary stays.

---

## Step-by-Step Tasks

### Task 1: `Exercise<TProblem>` interface
- **ACTION**: Create the type contract that everything else conforms to.
- **FILE**: `web/src/exercises/types.ts`
- **IMPLEMENT**: Verbatim from the EXERCISE_DEFINITION_SHAPE pattern above. Plus:
  ```typescript
  import type { ReactElement } from "react";
  import type { EngineApi } from "@/lib/engine";

  export interface Exercise<TProblem> {
    readonly type: string;
    readonly prompt: string;
    readonly tooltipLabel: string;
    readonly barPrompt: string;
    readonly tolerance: number;
    readonly axisAnchors: readonly number[];
    readonly formatValue: (n: number) => string;
    generateProblem(rng?: () => number): TProblem;
    parseProblem(params: URLSearchParams): TProblem | null;
    serializeProblem(problem: TProblem): Record<string, string>;
    problemKey(problem: TProblem): string;
    computeTruth(problem: TProblem, engine: EngineApi | null): number | null;
    Stage: (props: { problem: TProblem }) => ReactElement;
  }
  ```
- **GOTCHA**: Keep `TProblem` generic at the consumer site. The registry stores `Exercise<unknown>`; the screen treats problems as opaque tokens passed back to the same exercise's methods. No `as` casts in the screen.
- **VALIDATE**: `tsc --noEmit` clean after Task 4 lands the first implementation.

### Task 2: Move equity-specific files into `exercises/equity/`
- **ACTION**: `git mv` `problem.ts`, `HandDisplay.tsx`, `PlayingCard.tsx` from `web/src/components/exercise/` to `web/src/exercises/equity/`. Update relative imports inside the moved files.
- **GOTCHA**: `git mv` preserves blame. Don't delete-and-recreate.
- **VALIDATE**: `tsc --noEmit` will fail on `ExerciseScreen.tsx` until Task 4. That's expected; finish the refactor in one commit.

### Task 3: Split `exerciseConfig.ts`
- **ACTION**: Keep only shared timing constants in this file. Equity-specific values move to `exercises/equity/exercise.ts`.
- **AFTER**:
  ```typescript
  // web/src/components/exercise/exerciseConfig.ts
  export const SUCCESS_HOLD_MS = 1200;
  export const MISS_HOLD_MS = 1800;
  export const FIREWORK_DURATION_MS = 600;
  export const RELEASE_TRANSITION_MS = 240;
  ```
- **GOTCHA**: `EQUITY_TOLERANCE` and `EQUITY_ANCHORS` are no longer imported from this file by `ExerciseScreen.tsx` after Task 6 — they live inside the equity Exercise definition.
- **VALIDATE**: tsc clean once dependents are updated.

### Task 4: Equity `Exercise` definition
- **FILE**: `web/src/exercises/equity/exercise.ts`
- **IMPLEMENT**:
  ```typescript
  import type { Exercise } from "../types";
  import type { EngineApi } from "@/lib/engine";
  import {
    isValidHandPair,
    randomHandPair,
    type HandPair,
  } from "./problem";
  import { HandDisplay } from "./HandDisplay";

  const EQUITY_TOLERANCE = 10;
  const EQUITY_ANCHORS: readonly number[] = [0, 20, 40, 60, 80, 100];

  function EquityStage({ problem }: { problem: HandPair }) {
    return (
      <section
        aria-label="Problem"
        className="flex flex-col items-center justify-center gap-4"
      >
        <HandDisplay hand={problem.a} />
        <span className="text-xs uppercase tracking-wider text-zinc-500">vs</span>
        <HandDisplay hand={problem.b} />
      </section>
    );
  }

  export const equityExercise: Exercise<HandPair> = {
    type: "equity",
    prompt: "What's the equity of Hand A?",
    tooltipLabel: "Actual Equity",
    barPrompt: "drag to estimate equity",
    tolerance: EQUITY_TOLERANCE,
    axisAnchors: EQUITY_ANCHORS,
    formatValue: (n) => `${n.toFixed(1)}%`,
    generateProblem: (rng) => randomHandPair(rng),
    parseProblem: (params) => {
      const a = params.get("a") ?? "";
      const b = params.get("b") ?? "";
      return isValidHandPair(a, b) ? { a, b } : null;
    },
    serializeProblem: (p) => ({ a: p.a, b: p.b }),
    problemKey: (p) => `${p.a}|${p.b}`,
    computeTruth: (p, engine) => {
      if (engine === null) return null;
      try {
        return engine.equityVs(p.a, p.b) * 100;
      } catch {
        return null;
      }
    },
    Stage: EquityStage,
  };
  ```
- **GOTCHA**: `Stage` is a function component, not JSX. The shell renders `<exercise.Stage problem={problem}/>`.
- **VALIDATE**: Task 12 tests cover.

### Task 5: Pot Odds problem module
- **FILE**: `web/src/exercises/pot-odds/problem.ts`
- **IMPLEMENT**:
  ```typescript
  export interface PotOddsProblem {
    pot: number;
    bet: number;
  }

  // Pots and bets the user might actually face in a small-stakes cash game.
  // Sized so that the required-equity answers spread across the 0..100 axis
  // (not all clustered around 25-33%).
  const POTS = [10, 20, 30, 40, 50, 75, 100, 150, 200, 300, 500] as const;

  function betSizesForPot(pot: number): number[] {
    // 1/4 pot, 1/3 pot, 1/2 pot, 2/3 pot, 3/4 pot, full pot, 1.5x, 2x, all-in-ish
    return [
      Math.round(pot / 4),
      Math.round(pot / 3),
      Math.round(pot / 2),
      Math.round((pot * 2) / 3),
      Math.round((pot * 3) / 4),
      pot,
      Math.round(pot * 1.5),
      pot * 2,
      pot * 3,
    ].filter((b) => b > 0);
  }

  /** Required equity % to call: bet / (pot + 2 * bet) * 100. */
  export function requiredEquity(p: PotOddsProblem): number {
    const denom = p.pot + 2 * p.bet;
    if (denom <= 0) return 0;
    return (p.bet / denom) * 100;
  }

  export function isValidPotOddsProblem(p: unknown): p is PotOddsProblem {
    if (typeof p !== "object" || p === null) return false;
    const x = p as Record<string, unknown>;
    return (
      typeof x.pot === "number" &&
      typeof x.bet === "number" &&
      Number.isFinite(x.pot) &&
      Number.isFinite(x.bet) &&
      x.pot > 0 &&
      x.bet > 0
    );
  }

  export function randomPotOdds(rng: () => number = Math.random): PotOddsProblem {
    const pot = POTS[Math.floor(rng() * POTS.length)];
    const bets = betSizesForPot(pot);
    const bet = bets[Math.floor(rng() * bets.length)];
    return { pot, bet };
  }
  ```
- **GOTCHA**:
  1. The formula is `bet / (pot + 2*bet)` because if you call, you risk `bet` to win `pot + bet` (their bet, already in) — and the denominator of "% of the final pot you're putting in" is `pot + bet + bet` = `pot + 2*bet`. Validate this in the unit test with worked examples.
  2. Avoid generators that spawn $7 bets into $13 pots. The fixed `POTS` table + ratio-based bets keeps numbers human.
- **VALIDATE**: Task 6 tests.

### Task 6: Pot Odds problem tests
- **FILE**: `web/src/exercises/pot-odds/problem.test.ts`
- **IMPLEMENT**:
  ```typescript
  import { describe, it, expect } from "vitest";
  import { requiredEquity, randomPotOdds, isValidPotOddsProblem } from "./problem";

  describe("requiredEquity", () => {
    const cases: Array<[number, number, number, string]> = [
      [100, 50, 25, "$50 into $100 → 25%"],
      [100, 100, 33.33, "pot-sized bet → 33%"],
      [100, 25, 16.67, "1/4 pot → ~17%"],
      [50, 50, 33.33, "half-stack call"],
      [200, 100, 25, "scale invariance"],
    ];
    for (const [pot, bet, expected, label] of cases) {
      it(`${label}: pot=${pot}, bet=${bet} → ${expected.toFixed(2)}%`, () => {
        expect(requiredEquity({ pot, bet })).toBeCloseTo(expected, 1);
      });
    }
  });

  describe("randomPotOdds", () => {
    it("produces valid problems over 1000 trials", () => {
      for (let i = 0; i < 1000; i++) {
        const p = randomPotOdds();
        expect(isValidPotOddsProblem(p)).toBe(true);
        expect(p.pot).toBeGreaterThan(0);
        expect(p.bet).toBeGreaterThan(0);
      }
    });
    it("spreads required equity across the axis (not clustered)", () => {
      const samples: number[] = [];
      for (let i = 0; i < 200; i++) samples.push(requiredEquity(randomPotOdds()));
      const min = Math.min(...samples);
      const max = Math.max(...samples);
      // Sanity: cover a meaningful range, not all 25-33%.
      expect(max - min).toBeGreaterThan(20);
    });
  });

  describe("isValidPotOddsProblem", () => {
    it("rejects garbage", () => {
      expect(isValidPotOddsProblem({})).toBe(false);
      expect(isValidPotOddsProblem({ pot: -1, bet: 50 })).toBe(false);
      expect(isValidPotOddsProblem({ pot: 100 })).toBe(false);
      expect(isValidPotOddsProblem(null)).toBe(false);
      expect(isValidPotOddsProblem("100,50")).toBe(false);
    });
  });
  ```
- **VALIDATE**: `cd web && npm test pot-odds/problem` green.

### Task 7: Pot Odds Stage component
- **FILE**: `web/src/exercises/pot-odds/PotOddsStage.tsx`
- **IMPLEMENT**:
  ```typescript
  "use client";
  import type { PotOddsProblem } from "./problem";

  export function PotOddsStage({ problem }: { problem: PotOddsProblem }) {
    return (
      <section
        aria-label="Pot odds problem"
        className="flex flex-col items-center justify-center gap-3"
      >
        <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Pot
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-zinc-900">
            ${problem.pot}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Bet to call
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-zinc-900">
            ${problem.bet}
          </p>
        </div>
      </section>
    );
  }
  ```
- **GOTCHA**: `tabular-nums` keeps the currency aligned across re-renders. The card uses the same `border-zinc-200 / bg-white / shadow-sm` chrome as the existing playing card so the visual language matches Phase 5 without inventing new tokens.
- **VALIDATE**: Visual at Task 13 walkthrough.

### Task 8: Pot Odds `Exercise` definition
- **FILE**: `web/src/exercises/pot-odds/exercise.ts`
- **IMPLEMENT**:
  ```typescript
  import type { Exercise } from "../types";
  import {
    isValidPotOddsProblem,
    randomPotOdds,
    requiredEquity,
    type PotOddsProblem,
  } from "./problem";
  import { PotOddsStage } from "./PotOddsStage";

  const POT_ODDS_TOLERANCE = 5;
  const POT_ODDS_ANCHORS: readonly number[] = [0, 20, 40, 60, 80, 100];

  export const potOddsExercise: Exercise<PotOddsProblem> = {
    type: "pot-odds",
    prompt: "What % do you need to win to call?",
    tooltipLabel: "Required equity",
    barPrompt: "drag to estimate pot odds",
    tolerance: POT_ODDS_TOLERANCE,
    axisAnchors: POT_ODDS_ANCHORS,
    formatValue: (n) => `${n.toFixed(1)}%`,
    generateProblem: (rng) => randomPotOdds(rng),
    parseProblem: (params) => {
      const pot = Number(params.get("pot"));
      const bet = Number(params.get("bet"));
      const candidate = { pot, bet };
      return isValidPotOddsProblem(candidate) ? candidate : null;
    },
    serializeProblem: (p) => ({ pot: String(p.pot), bet: String(p.bet) }),
    problemKey: (p) => `${p.pot}|${p.bet}`,
    computeTruth: (p) => requiredEquity(p),
    Stage: PotOddsStage,
  };
  ```
- **GOTCHA**: `computeTruth` ignores the `engine` arg — that's fine. The signature is uniform; the implementation chooses what to use.
- **VALIDATE**: Task 12 tests.

### Task 9: Exercise registry
- **FILE**: `web/src/exercises/registry.ts`
- **IMPLEMENT**:
  ```typescript
  import type { Exercise } from "./types";
  import { equityExercise } from "./equity/exercise";
  import { potOddsExercise } from "./pot-odds/exercise";

  // Order matters: first entry is the default when `?type` is missing or unknown.
  export const exercises: ReadonlyArray<Exercise<unknown>> = [
    equityExercise as Exercise<unknown>,
    potOddsExercise as Exercise<unknown>,
  ];

  export function getExerciseByType(type: string | null): Exercise<unknown> {
    if (type !== null) {
      const found = exercises.find((e) => e.type === type);
      if (found !== undefined) return found;
    }
    return exercises[0];
  }
  ```
- **GOTCHA**: The `as Exercise<unknown>` cast is the one place this conversion happens. The registry is the type-erasure boundary; consumers (the shell) are typed against `Exercise<unknown>` and pass problems back to the same exercise's methods, so the lost specificity is safe.
- **VALIDATE**: tsc clean.

### Task 10: Generalize `ActualEquityTooltip` → `ActualValueTooltip`
- **ACTION**: `git mv` the file; widen the props.
- **AFTER**:
  ```typescript
  export interface ActualValueTooltipProps {
    label: string;
    formattedValue: string;
    visible: boolean;
  }

  export function ActualValueTooltip({
    label,
    formattedValue,
    visible,
  }: ActualValueTooltipProps) {
    // ...same JSX shell, but:
    // <span class="...uppercase...">{label}</span>
    // <span class="...4.5rem...">{formattedValue}</span>
  }
  ```
- **GOTCHA**:
  1. The caller pre-formats the value (using `exercise.formatValue`). Tooltip stops knowing about `%` or decimals.
  2. Update the existing test file: rename, swap props, assertions check `label` text + `formattedValue` text.
- **VALIDATE**: `npm test feedback/ActualValueTooltip` green.

### Task 11: Generalize `EquityAxis` → `Axis`
- **ACTION**: `git mv` the folder. Add an optional `axisLabel` prop (rendered as a small uppercase label above the top tick — visible in idle and dragging states).
- **AFTER**:
  ```typescript
  export interface AxisProps {
    values: readonly number[];
    min?: number;
    max?: number;
    mode: "idle" | "dragging";
    pointerValue?: number;
    axisLabel?: string;
  }
  ```
- **GOTCHA**:
  1. `axisLabel` is **optional** to keep the equity surface visually unchanged (no label needed there). Pot-odds may opt in if it helps clarity; ship without first and only add if walkthrough demands it. Actually — **YAGNI applies. Drop `axisLabel` from this task.** The axis numbers + the screen prompt already disambiguate. Add the prop only when a third exercise demonstrably needs it. Mirror this conservatism throughout.
  2. So: this task collapses to **rename only**. No prop changes.
- **VALIDATE**: tsc clean; equity rendering unchanged.

### Task 12: Refactor `ExerciseScreen` to consume `Exercise`
- **FILE**: `web/src/components/exercise/ExerciseScreen.tsx`
- **DELTA SHAPE** (not full rewrite — preserve state machine, engine boot, auto-advance, surface-color logic, overlay/firework JSX):
  ```typescript
  // ADD imports
  import { getExerciseByType } from "@/exercises/registry";
  import type { Exercise } from "@/exercises/types";

  // REPLACE problem/parse/randomHandPair/EQUITY_* usage:
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

  // URL writeback (when parse failed or `type` was missing): seed a valid URL.
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

  const onNext = () => {
    const next = exercise.generateProblem();
    const params = new URLSearchParams({
      type: exercise.type,
      ...exercise.serializeProblem(next),
    });
    setPhase({ kind: "idle" });
    router.replace(`?${params.toString()}`);
  };

  // In JSX:
  // - Title:                {exercise.prompt}
  // - <Axis values={[...exercise.axisAnchors]} ... />
  // - <exercise.Stage problem={problem} />
  // - <ActualValueTooltip label={exercise.tooltipLabel} formattedValue={exercise.formatValue(phase.truthPercent)} ... />
  // - <EstimationBar tolerance={exercise.tolerance} promptCopy={exercise.barPrompt} ... />
  ```
- **GOTCHA**:
  1. The shell never knows `TProblem`'s shape — it only passes the same `problem` value back to the same exercise's methods. Type-soundness comes from never crossing exercises.
  2. Loading guard: `if (truthPercent === null)` still gates render. For pot-odds this is effectively never-null (pure arithmetic), but the equity path needs it. Keep the guard unified.
  3. The "engine init failed" branch only matters for equity. Pot-odds can render even if the engine never boots — but unifying the guards keeps the screen simpler. Ship the simple version; if pot-odds-without-engine matters (e.g. during engine outage testing), revisit.
  4. **Reset phase on problem change**: ensure the `setPhase({kind:"idle"})` reset happens both in `onNext` and as a `useEffect` dependent on `problemKey` so URL-only navigations also reset cleanly.
- **VALIDATE**: Task 14 tests.

### Task 13: Update `exerciseConfig.ts` consumers
- **ACTION**: `ExerciseScreen.tsx` imports `SUCCESS_HOLD_MS`, `MISS_HOLD_MS`, `FIREWORK_DURATION_MS`, `RELEASE_TRANSITION_MS` from `./exerciseConfig`. After Task 3, these still live there — confirm imports are intact.
- **GOTCHA**: Don't import `EQUITY_TOLERANCE` / `EQUITY_ANCHORS` from `./exerciseConfig` anymore. They've moved to `equity/exercise.ts`.
- **VALIDATE**: tsc clean.

### Task 14: Update `ExerciseScreen.test.tsx` for both exercise types
- **ACTION**: Existing tests assert the equity surface renders. Add parallel tests for `?type=pot-odds`. Use the same render-contract style — no fake gestures.
- **NEW TESTS**:
  ```typescript
  describe("ExerciseScreen — pot-odds variant", () => {
    beforeEach(() => {
      // re-mock useSearchParams to point at pot-odds URL
      vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams("type=pot-odds&pot=100&bet=50") as ReadonlyURLSearchParams,
      );
    });

    it("renders the pot-odds prompt", async () => {
      render(<ExerciseScreen />);
      await screen.findByText(/% do you need to win/i);
    });

    it("does not render playing cards for pot-odds", async () => {
      const { container } = render(<ExerciseScreen />);
      await screen.findByText(/% do you need to win/i);
      expect(container.querySelectorAll('[data-testid="playing-card"]').length).toBe(0);
    });

    it("renders the pot and bet values", async () => {
      render(<ExerciseScreen />);
      await screen.findByText(/% do you need to win/i);
      expect(screen.getByText("$100")).toBeTruthy();
      expect(screen.getByText("$50")).toBeTruthy();
    });

    it("mounts the estimation bar with pot-odds prompt", async () => {
      render(<ExerciseScreen />);
      await screen.findByText(/% do you need to win/i);
      expect(screen.getByText(/drag to estimate pot odds/i)).toBeTruthy();
    });
  });
  ```
- **GOTCHA**:
  1. The `vi.mock("next/navigation", …)` setup in the existing file is hoisted; per-test mock variation requires `vi.mocked(useSearchParams).mockReturnValue(...)` — restructure the existing mock to expose `useSearchParams` as a `vi.fn()` so it can be re-pointed per `describe`.
  2. The existing equity tests must still pass with `?type=equity&a=AsKs&b=QhQd` (or no `type`, defaulting to equity).
- **VALIDATE**: `npm test ExerciseScreen` — all old + new green.

### Task 15: Equity `Exercise` round-trip tests
- **FILE**: `web/src/exercises/equity/exercise.test.ts`
- **IMPLEMENT**: Cover `parseProblem`/`serializeProblem` round-trip, `generateProblem` produces valid pair, `problemKey` stable, `computeTruth` returns null when engine is null and a number when engine is present (use real engine via the existing pkg-node alias).
- **VALIDATE**: green.

### Task 16: Pot-odds `Exercise` round-trip tests
- **FILE**: `web/src/exercises/pot-odds/exercise.test.ts`
- **IMPLEMENT**: Same shape as Task 15, minus the engine path. Confirm `computeTruth` works without engine.
- **VALIDATE**: green.

### Task 17: Manual Pixel + dev-server walkthrough
- **ACTION**: Boot dev server. On Pixel:
  - Visit `/` → equity exercise loads (default), URL backfills to `?type=equity&a=…&b=…`.
  - Drag, release, "next" 5×. Confirm equity behaves identically to pre-refactor.
  - Visit `/?type=pot-odds` → pot-odds loads, URL backfills `pot` + `bet`.
  - Drag, release, "next" 5×. Confirm: tolerance feels right (±5 pp), prompt copy reads naturally, tooltip shows "Required equity" + correct %, fireworks fire on close-enough.
  - Reduced-motion: verify both exercises degrade.
- **PHASE 5 INPUTS TO CAPTURE FOR POT-ODDS**: list 3–5 things that look unfinished about the pot-odds stage (typography, panel chrome, label hierarchy). These become a future "Pot Odds polish" mini-phase if pot-odds proves itself.
- **VALIDATE**: 5 problems back-to-back per type pass the PRD success signal.

---

## Testing Strategy

### Unit Tests (new + updated)

| Test | Input | Expected | Type |
|---|---|---|---|
| `requiredEquity` worked examples (5) | various pot/bet | matches manual calc to 0.01 | unit |
| `randomPotOdds` valid over 1000 trials | n/a | always positive pot+bet | unit |
| `randomPotOdds` spread | 200 samples | range covers > 20 pp | unit |
| `isValidPotOddsProblem` rejects garbage | `{}`, `null`, negatives, partial, string | `false` | unit |
| Equity `Exercise.parseProblem` round-trip | `?a=AsKs&b=QhQd` | `{a,b}` matches | contract |
| Equity `Exercise.computeTruth` w/o engine | problem, `null` | `null` | contract |
| Equity `Exercise.computeTruth` w/ engine | problem, real api | finite number in `[0, 100]` | contract |
| Pot-odds `Exercise.parseProblem` round-trip | `?pot=100&bet=50` | `{pot:100,bet:50}` | contract |
| Pot-odds `Exercise.computeTruth` | `{pot:100,bet:50}` | `25` (±0.01) | contract |
| `ExerciseScreen` equity prompt visible | URL equity | "What's the equity of Hand A?" | render |
| `ExerciseScreen` 4 cards on equity | URL equity | 4 `playing-card` testid | render |
| `ExerciseScreen` pot-odds prompt visible | URL pot-odds | "What % do you need to win to call?" | render |
| `ExerciseScreen` 0 cards on pot-odds | URL pot-odds | 0 `playing-card` testid | render |
| `ExerciseScreen` pot/bet text on pot-odds | `pot=100&bet=50` | `$100` and `$50` rendered | render |
| `ExerciseScreen` bar prompt per type | both URLs | "drag to estimate equity" / "drag to estimate pot odds" | render |
| `ActualValueTooltip` renders label | `label="Required equity"` | text present | render |
| `ActualValueTooltip` renders formatted value | `formattedValue="25.0%"` | text present | render |
| Existing `Axis` (renamed) tests still pass | unchanged input | unchanged output | regression |

### Edge Cases Checklist
- [ ] `?type=` missing → defaults to equity
- [ ] `?type=garbage` → defaults to equity
- [ ] `?type=pot-odds` with no `pot`/`bet` → generates random, writes URL via `router.replace`
- [ ] `?type=pot-odds&pot=0&bet=50` → validation rejects, falls back to random
- [ ] `?type=pot-odds&pot=abc&bet=xyz` → validation rejects
- [ ] Switching URL by hand from `?type=equity&…` to `?type=pot-odds&…` mid-session resets phase to idle and re-renders cleanly
- [ ] Engine init error during pot-odds session → pot-odds still works (truth doesn't depend on engine) — *but* current shell unifies the loading guard, so this surfaces the error UI; document this as deliberate, revisit only if it bites
- [ ] Reduced-motion both exercises → instant transitions, no fireworks
- [ ] Tolerance edge: pot-odds `value === truth + 5` → `isWithinTolerance: true`
- [ ] Same problem URL refreshed → reproduces same problem, same truth, same key (and therefore same `pickPhrase` result — predictable)

---

## Validation Commands

### Static Analysis
```bash
cd web && npx tsc --noEmit --pretty false
```
EXPECT: zero errors. The `Exercise<unknown>` cast in the registry is the only `as` cast permitted.

```bash
cd web && npm run lint
```
EXPECT: zero errors.

### Unit Tests
```bash
cd web && npm test
```
EXPECT: all prior tests pass + ~20 new tests pass.

### Build
```bash
cd web && npm run build
```
EXPECT: Next 16 build succeeds; `/` still appears as `○` (static shell, dynamic island below the Suspense boundary). Bundle size diff under +10 KB gzipped (pot-odds adds one component + a small problem module; no new deps).

### Manual Validation
- [ ] `web/src/components/exercise/ExerciseScreen.tsx` is exercise-type agnostic — grep for "equity" returns only string-literal copy fall-throughs (or zero hits).
- [ ] `web/src/exercises/` exists with `equity/`, `pot-odds/`, `types.ts`, `registry.ts`.
- [ ] `web/src/components/equity-axis/` does not exist (renamed to `axis/`).
- [ ] `ActualEquityTooltip` does not exist (renamed to `ActualValueTooltip`).
- [ ] `EQUITY_TOLERANCE` / `EQUITY_ANCHORS` exported only from `web/src/exercises/equity/exercise.ts`.
- [ ] No exercise type uses string concatenation for URL construction — all use `URLSearchParams`.

---

## Acceptance Criteria
- [ ] `/` (no params) renders the equity exercise (backward compat).
- [ ] `/?type=equity&a=AsKs&b=QhQd` renders equity with that exact problem (existing behavior preserved).
- [ ] `/?type=pot-odds` renders the pot-odds exercise with a random pot/bet, URL backfilled.
- [ ] `/?type=pot-odds&pot=100&bet=50` renders that exact pot-odds problem; tooltip on success shows "Required equity 25.0%".
- [ ] "Next" stays in the active exercise type and updates URL via `router.replace`.
- [ ] All shared primitives (`EstimationBar`, `Axis`, `ActualValueTooltip`, `FireworkBurst`, `useAutoAdvance`, `useReducedMotion`, `feedbackCopy`) are imported by both exercise types without forking.
- [ ] No new dependency added to `package.json`.
- [ ] All Vitest tests pass; tsc + ESLint clean; `npm run build` green; `/` still statically prerendered.
- [ ] Manual Pixel walkthrough: 5 problems back-to-back per type without thinking about the app.
- [ ] PRD updated: Phase 5 marked complete; Phase 6 row added; "bespoke vs shared" open question resolved (with reference to this plan + report).

## Completion Checklist
- [ ] Code follows discovered patterns (PascalCase props interface, named-function components, named exports).
- [ ] Animations stay on `transform`/`opacity` only.
- [ ] No `console.log`.
- [ ] No engine import outside `lib/engine.ts`, `ExerciseScreen.tsx`, and `exercises/equity/exercise.ts`.
- [ ] Per-exercise tuning (`tolerance`, `axisAnchors`, copy strings) lives in the exercise file, not in the screen.
- [ ] Implementation report drafted at `.claude/PRPs/reports/second-exercise-pot-odds-report.md` after the work is done; report explicitly answers the PRD's "bespoke vs shared screen" open question with what we learned.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `Exercise<unknown>` erasure causes a type-safety hole inside the screen | LOW | MEDIUM | The screen never inspects problem internals — only round-trips them through the same exercise's methods. Cast lives only at registry boundary. |
| Refactor breaks existing equity behavior | MEDIUM | HIGH | Keep `ExerciseScreen.test.tsx` equity tests passing throughout; manual Pixel re-walk equity before declaring done |
| Pot-odds tolerance ±5 feels too tight on Pixel | MEDIUM | LOW | One constant in `pot-odds/exercise.ts`; tune in walkthrough |
| Pot-odds answer distribution clusters at 25-33% making drilling boring | MEDIUM | MEDIUM | Generator includes 1/4, 1/3, 1/2, 2/3, 3/4, 1x, 1.5x, 2x, 3x bet ratios so required equity spreads ~17% to ~43%; spread test asserts > 20 pp range |
| URL handling regression: type missing + cards present | LOW | LOW | Default to first registry entry (equity); render-test asserts default path |
| Future third exercise reveals the `Exercise` interface is too narrow | MEDIUM | LOW | That's fine — extend at the time, not preemptively. Document deviations in the implementation report. |
| Renaming `EquityAxis`/`ActualEquityTooltip` breaks an import we missed | LOW | LOW | tsc + build catches all import sites; small codebase |

## Notes
- **Why both exercises in one phase, not two.** Splitting "refactor the shell" from "add pot-odds" sounds disciplined but actually hides the answer to the open question. The shell shape is only validated when a *second* exercise consumes it. One phase, one merge, one decision.
- **Why no `requiresEngine` flag.** The engine boots once at app start; per-call cost is zero for exercises that don't use it. A boolean-driven branching boot path is more code than the `if engine === null` guard already in `computeTruth`. YAGNI.
- **Why "Required equity" not "Pot odds".** The user is computing the required win rate, which is an equity number. "Pot odds" is the *situation*, not the *answer*. "Required equity" matches what's actually being shown (a percentage you'd need to win) and parallels "Actual Equity" linguistically. Open to retuning during walkthrough.
- **Open question this plan resolves.** PRD line 51: "Whether each exercise gets a bespoke screen or whether 2–3 interaction primitives cover all 15 exercise types." This phase tests the "shared shell + per-exercise definition" answer with the simplest possible second exercise. If it works, exercises 3+ become small adders. If it doesn't, the plan to back out is: keep the shell, fork the screen at exercise N, document why.
- **Phase 5 marked complete in PRD.** While here, fix the table at PRD line 192 — Phase 5 was committed in `708aae8` but still shows "in-progress".
