# Implementation Report: Second Exercise (Pot Odds) + Config-Driven Exercise Shell

## Summary
Phase 6 shipped. Introduced an `Exercise<TProblem>` interface, moved equity-specific code into `web/src/exercises/equity/`, added a new `pot-odds` exercise (pure-arithmetic truth, text-only stage), and refactored `ExerciseScreen` from a hand-vs-hand surface into a thin shell driven by a registry lookup off `?type=`. Renamed `EquityAxis` → `Axis` and `ActualEquityTooltip` → `ActualValueTooltip` so naming matches the now-generic shell. URL convention extends from `?a=…&b=…` to `?type=equity&a=…&b=…` and `?type=pot-odds&pot=100&bet=50`; missing/unknown `type` defaults to equity for backward-compat.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Medium-High | Medium-High |
| Estimated Files | ~14 | 18 changed (5 created beyond the plan's count, mostly tests + EquityStage split) |
| Confidence | n/a | High — type+lint+tests+build all green first try after one lint fix |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | `Exercise<TProblem>` interface | Complete | |
| 2 | Move equity files via `git mv` | Complete | Blame preserved; verified with `git status -RM`. |
| 3 | Split `exerciseConfig.ts` | Complete | `EQUITY_TOLERANCE` / `EQUITY_ANCHORS` removed; only timing constants remain. |
| 4 | Equity `Exercise` definition | Complete | Deviated — `EquityStage` extracted to its own `EquityStage.tsx` so `exercise.ts` stays pure TS, mirroring `PotOddsStage.tsx` for symmetry. |
| 5 | Pot Odds problem module | Complete | |
| 6 | Pot Odds problem tests | Complete | 8 tests including the spread-across-axis property test. |
| 7 | Pot Odds Stage component | Complete | |
| 8 | Pot Odds `Exercise` definition | Complete | |
| 9 | Exercise registry | Complete | Single `as Exercise<unknown>` cast as planned. |
| 10 | Generalize tooltip | Complete | Now `label` + `formattedValue` props; data-testid renamed to `actual-value-tooltip`. |
| 11 | Rename axis | Complete | `data-testid="axis"`. No `axisLabel` prop added (YAGNI per plan). |
| 12 | Refactor `ExerciseScreen` | Complete | Deviated — phase reset on `problemKey` change uses the React-docs "compare-prev-prop in render" pattern (not `useEffect`) to satisfy the `react-hooks/set-state-in-effect` lint rule. See Deviations. |
| 13 | Update `exerciseConfig.ts` consumers | Complete | |
| 14 | `ExerciseScreen` tests for both types | Complete | Restructured `useSearchParams` mock to a `vi.fn()` so per-describe variants work. Added equity-defaulting tests (missing/unknown `type`). |
| 15 | Equity `Exercise` round-trip tests | Complete | |
| 16 | Pot-odds `Exercise` round-trip tests | Complete | |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis (tsc) | Pass | 0 errors |
| Lint (eslint) | Pass | 1 issue caught (set-state-in-effect) and fixed |
| Unit Tests (vitest) | Pass | 126 tests across 13 files |
| Build (next build) | Pass | `/` still statically prerendered |
| Integration | N/A | No backend; in-process tests cover render contract |
| Edge Cases | Pass | Covered by new tests: missing type, unknown type, invalid pot/bet, pot=0, non-numeric |

## Files Changed

| File | Action |
|---|---|
| `web/src/exercises/types.ts` | CREATED |
| `web/src/exercises/registry.ts` | CREATED |
| `web/src/exercises/equity/exercise.ts` | CREATED |
| `web/src/exercises/equity/exercise.test.ts` | CREATED |
| `web/src/exercises/equity/EquityStage.tsx` | CREATED |
| `web/src/exercises/equity/HandDisplay.tsx` | RENAMED from `components/exercise/` |
| `web/src/exercises/equity/PlayingCard.tsx` | RENAMED from `components/exercise/` |
| `web/src/exercises/equity/problem.ts` | RENAMED from `components/exercise/` |
| `web/src/exercises/equity/problem.test.ts` | RENAMED from `components/exercise/` |
| `web/src/exercises/pot-odds/exercise.ts` | CREATED |
| `web/src/exercises/pot-odds/exercise.test.ts` | CREATED |
| `web/src/exercises/pot-odds/PotOddsStage.tsx` | CREATED |
| `web/src/exercises/pot-odds/problem.ts` | CREATED |
| `web/src/exercises/pot-odds/problem.test.ts` | CREATED |
| `web/src/components/axis/Axis.tsx` | RENAMED + UPDATED (was `equity-axis/EquityAxis.tsx`) |
| `web/src/components/axis/Axis.test.tsx` | RENAMED + UPDATED |
| `web/src/components/axis/index.ts` | UPDATED |
| `web/src/components/feedback/ActualValueTooltip.tsx` | RENAMED + GENERALIZED |
| `web/src/components/feedback/ActualValueTooltip.test.tsx` | RENAMED + UPDATED |
| `web/src/components/feedback/index.ts` | UPDATED |
| `web/src/components/exercise/ExerciseScreen.tsx` | UPDATED (refactor) |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | UPDATED |
| `web/src/components/exercise/exerciseConfig.ts` | UPDATED (split) |

## Deviations from Plan

1. **Equity Stage split into its own file (`EquityStage.tsx`).** Plan put it inline in `exercise.ts`. Inline JSX requires `.tsx`, but pot-odds already uses a separate `PotOddsStage.tsx`. Splitting both gives symmetry: `exercise.ts` is pure TS configuration in both folders, and Stage components live next to their exercise.
2. **Phase-reset on problem change uses the `prevState` render-time pattern rather than `useEffect`.** Plan said "useEffect dependent on problemKey." That tripped the project's lint rule `react-hooks/set-state-in-effect`. Replaced with the React-docs canonical pattern:
   ```tsx
   const [prevProblemKey, setPrevProblemKey] = useState(problemKey);
   if (prevProblemKey !== problemKey) {
     setPrevProblemKey(problemKey);
     setPhase({ kind: "idle" });
   }
   ```
   Same observable behavior; lint passes.
3. **Removed `api === null` from the loading guard.** Plan said keep "the loading guard unified" via `truthPercent === null`. Since equity returns `null` until engine boots and pot-odds always returns a number, the unified guard is sufficient — pot-odds renders immediately, equity waits.

## Open Question Resolved (PRD)

> "Whether each exercise gets a bespoke screen or whether 2–3 interaction primitives cover all 15 exercise types."

**Answer: shared shell + per-exercise definition works.** Two exercises ship sharing 100% of:
`EstimationBar`, `Axis`, `ActualValueTooltip`, `FireworkBurst`, `useAutoAdvance`, `useReducedMotion`, `feedbackCopy`, drag/release state machine, surface-color transitions, auto-advance timing, URL plumbing.

Per-exercise plug-points needed: `prompt`, `tooltipLabel`, `barPrompt`, `tolerance`, `axisAnchors`, `formatValue`, `generateProblem`, `parseProblem`, `serializeProblem`, `problemKey`, `computeTruth`, `Stage`. That's it. The shell never inspects `TProblem`'s shape — it only round-trips the opaque token through the same exercise's methods. The `Exercise<unknown>` cast lives at the registry boundary only.

The equity-vs-pot-odds delta is small enough that the abstraction earns its keep without speculative knobs (no `axisMin`/`axisMax`, no `valueScale`, no `requiresEngine`). When exercise #3 forces a knob, add it then.

## Tests Written

| Test File | Tests | Coverage |
|---|---|---|
| `exercises/pot-odds/problem.test.ts` | 8 | `requiredEquity` worked examples, RNG validity, axis spread, validator |
| `exercises/pot-odds/exercise.test.ts` | 10 | parse/serialize round-trip, edge cases (0, negative, non-numeric), `computeTruth`, `formatValue` |
| `exercises/equity/exercise.test.ts` | 8 | parse/serialize round-trip, validity, engine null vs present |
| `components/feedback/ActualValueTooltip.test.tsx` | 3 | label + formattedValue props, visibility |
| `components/axis/Axis.test.tsx` | 5 | unchanged regression set, retargeted to new name |
| `components/exercise/ExerciseScreen.test.tsx` | 14 | equity render contract + phase transitions + auto-advance + defaulting + new pot-odds variant block (4 tests) |

Pre-existing tests retained or updated: `problem.test.ts`, `EstimationBar.test.tsx`, `FireworkBurst.test.tsx`, `feedbackCopy.test.ts`, `useAutoAdvance.test.ts`, `engine.test.ts`, `sliderMath.test.ts`.

## Issues Encountered
- `react-hooks/set-state-in-effect` lint rule rejected the planned `useEffect` for phase reset on problem change. Resolved with the prevState render-time pattern (see Deviations §2). One iteration to green.

## Manual Walkthrough (Task 17)
**Not yet performed.** This is a no-backend frontend; the contract is render-tested but a Pixel pass is the PRD's success signal. Recommended next-up:
1. `npm run dev`, visit `/` → equity loads with URL backfill.
2. Drag/release/next 5× on equity. Confirm parity with pre-Phase-6.
3. Visit `/?type=pot-odds`, drag/release/next 5×. Watch for: pot-odds tolerance (±5pp may be tight), tooltip wording, panel chrome legibility.
4. Reduced-motion toggle on both.
5. Capture 3–5 pot-odds polish notes for a future mini-phase.

## Next Steps
- [ ] Manual Pixel walkthrough (Task 17 from plan)
- [ ] Run `/code-review` for second-pair eyes on the refactor
- [ ] Update PRD: mark Phase 5 complete (was still `in-progress` in tracking table per plan note); add Phase 6 row; cite this report under the resolved open question
- [ ] `/prp-pr` to open PR once walkthrough captures any blockers
