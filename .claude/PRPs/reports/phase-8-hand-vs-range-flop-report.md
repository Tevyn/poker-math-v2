# Implementation Report: Phase 8 — Hand vs Range, Flop Equity

## Summary
Added a third exercise type — `?type=hand-vs-range` — that asks the user to estimate Hero's equity vs a known Villain range on a random flop. Engine work was a thin wrapper around `pokers::exact_equity` with a board mask. UI work added a 13×13 read-only range grid plus board + hero rendering. The user's prior `rangeData.ts` library was vendored verbatim; Hero's hand pool is the deduplicated union of every hand class present in the library, computed once at module init. No changes to the shared shell (`ExerciseScreen`) — the `Exercise<TProblem>` abstraction held up.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Medium | Medium — matches |
| Confidence | n/a | High — every task landed without rework, only surface deviations |
| Files Changed | ~13 (10 new, 3 updated) | 19 changed total: 10 new source files + 4 vendored/new data files + 5 updated source files + 1 PRD update + WASM rebuild artifacts |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Engine `compute_equity_vs_range_flop` + `equity_vs_range_flop` binding | Complete | Used `get_card_mask` (validates non-zero with 3-bit count) |
| 2 | Engine tests | Complete | One test bound widened — see Deviations |
| 3 | WASM rebuild (bundler + nodejs) | Complete | Wasm: 367 KB raw / ~230 KB gzipped (delta from prior was negligible — under 1 KB) |
| 4 | Web engine wrapper | Complete | `equityVsRangeFlop` added to `EngineApi` |
| 5 | Web engine wrapper test | Complete | Three new cases: finite-in-[0,1], garbage hero, hero-board conflict |
| 6 | Vendor `rangeData.ts` + `rangeTypes.ts` | Complete | `gh api` fetch; one-line import-path fix; vendor headers added |
| 7 | `rangeLibrary.ts` | Complete | Flat `Range[]`, `HERO_HAND_POOL`, `rangeToEngineString` |
| 8 | `rangeLibrary` tests | Complete | 8 tests; pool checks; round-trip lookup |
| 9 | `handClass.ts` | Complete | Stronger rank validation than the plan's sketch (rejects `XX`, `""`, `"AAAA"`) |
| 10 | `handClass` tests | Complete | 5 tests; combo counts + suit invariants |
| 11 | `hand-vs-range/problem.ts` | Complete | `randomProblem` retries up to 100× then throws (defensive — pathologically unreachable) |
| 12 | `problem.ts` tests | Complete | 8 tests; valid-over-200-trials, distinct-cards, parse/serialize round-trip |
| 13 | `RangeGrid.tsx` | Complete | Inline `gridTemplateColumns: repeat(13, ...)` per the plan's "config-free" choice |
| 14 | `RangeGrid` tests | Complete | 169 cells, corner labels, in-range count |
| 15 | `HandVsRangeStage.tsx` | Complete | Used a 4-line `toEquityCard` adapter — see Deviations |
| 16 | `exercise.ts` | Complete | Mirrors `equityExercise` shape exactly |
| 17 | `exercise.test.ts` | Complete | 6 tests; round-trip + computeTruth with/without engine |
| 18 | Registry update | Complete | `handVsRangeExercise` appended; equity stays first (default) |
| 19 | `ExerciseScreen` render tests | Complete | 5 new tests covering prompt, range name, 5 cards, 169 cells, bar prompt |
| 20 | Manual Pixel walkthrough | **Skipped** — see Deviations |
| 21 | PRD update | Complete | Phase 8 row flipped `planned` → `complete`; footer dated 2026-05-04 |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis (tsc) | Pass | Zero errors |
| Lint (ESLint) | Pass | Clean output |
| Engine tests (cargo test) | Pass | 13 tests, 5 new for Phase 8 |
| Engine clippy + fmt | Pass | Both clean |
| Web unit tests (vitest) | Pass | 167 tests across 18 files; ~30 new tests added in this phase |
| Build (next build) | Pass | Static prerender succeeded |
| Integration | N/A | No server; SPA build |
| Edge Cases | Pass | Validation rejects malformed cards, unknown range id, hero/board duplicates — covered by `problem.test.ts` |

## Files Changed

### Created (new sources)
- `web/src/data/rangeData.ts` — vendored verbatim from `Tevyn/poker-math`
- `web/src/data/rangeTypes.ts` — vendored verbatim
- `web/src/data/rangeLibrary.ts` — flatten, dedup, `HERO_HAND_POOL`
- `web/src/data/rangeLibrary.test.ts`
- `web/src/lib/handClass.ts` — combo expander, deck constants, `RANKS` (descending)
- `web/src/lib/handClass.test.ts`
- `web/src/exercises/hand-vs-range/problem.ts`
- `web/src/exercises/hand-vs-range/problem.test.ts`
- `web/src/exercises/hand-vs-range/RangeGrid.tsx`
- `web/src/exercises/hand-vs-range/RangeGrid.test.tsx`
- `web/src/exercises/hand-vs-range/HandVsRangeStage.tsx`
- `web/src/exercises/hand-vs-range/exercise.ts`
- `web/src/exercises/hand-vs-range/exercise.test.ts`

### Updated
- `engine/src/lib.rs` — `compute_equity_vs_range_flop` + binding + 5 tests
- `engine/pkg/` and `engine/pkg-node/` — rebuilt WASM artifacts (bundler + node)
- `web/src/lib/engine.ts` — `equityVsRangeFlop` added to `EngineApi`
- `web/src/lib/engine.test.ts` — 3 new cases for the new method
- `web/src/exercises/registry.ts` — register `handVsRangeExercise`
- `web/src/components/exercise/ExerciseScreen.test.tsx` — 5 new render tests
- `.claude/PRPs/prds/poker-trainer.prd.md` — Phase 8 row → complete; footer dated

## Deviations from Plan

1. **Engine sanity test bound flipped.** The plan asserted `eq > 0.20 && eq < 0.55` for `AsKs` on `Kh7d2c` vs `{AA,KK,QQ,JJ,TT}`, predicting AKs would be the underdog. Reality: AKs has TPTK and dominates JJ/QQ/TT (the bulk of the range), with only AA and the lone surviving KK combo (`KdKc`) ahead. Engine returned ~0.76. The test was renamed `aks_vs_premium_range_on_dry_flop_is_favorite` and the bound widened to `0.55–0.90`. The plan explicitly noted these bounds are sanity, not regression-locked, so this is a numeric correction in spirit with the plan.

2. **HandVsRangeStage card construction.** Plan said "confirm `PlayingCard` accepts a `card` prop in the format 'As' (existing format from equity)." It does not — `PlayingCard` takes a `Card` object (`{ rank, suit }`). Rather than refactor `PlayingCard`, the stage adapts via a 4-line `toEquityCard` helper (`{ rank: c[0], suit: c[1] }`). Inputs are pre-validated by `isValidProblem`, so the cast is safe.

3. **`randomProblem` retry budget.** Plan suggested an unbounded `while (true)` loop with a "pathologically unreachable" exit. Tightened to a max-100-attempt loop that throws if exhausted — the throw can never fire in practice (no flop can drop a hand class entirely) but it bounds runtime under any future bug.

4. **Manual Pixel walkthrough (Task 20) deferred.** Implementation completed in a non-interactive session; no Pixel device available. All automated validation green. Engine perf measurement on Pixel — the open question the plan wanted answered — remains open. Suggested follow-up: 5-call timing in Chrome DevTools on Pixel, recorded in this report once captured. As a desktop sanity check, individual `equityVsRangeFlop` calls in vitest (with WASM warm) complete in ~0–30 ms on the test fixtures, which is comfortably below the 250 ms threshold the plan flagged as a concern.

5. **`handClass.ts` validation slightly stricter than plan sketch.** Added explicit `isRank` checks so `XX`, `""`, `AAAA` all throw. The plan's sketch only validated by `length` and `kind === "s"|"o"`, which would have let `XX` produce 6 nonsense pair-combos. Closed via `RANK_SET` lookup.

## Issues Encountered
- **None blocking.** The only "real" issue was the Phase-2 test bound being directionally wrong; widening the bound was the right move (numeric assertions in a sanity test should reflect engine truth, not plan prose).

## Tests Written

| Test File | Tests | Coverage |
|---|---|---|
| `engine/src/lib.rs` (Phase 8 block) | +5 | flop equity wrapper happy/error paths |
| `web/src/lib/engine.test.ts` | +3 | `equityVsRangeFlop` finite-output, garbage, conflict |
| `web/src/data/rangeLibrary.test.ts` | 8 | `RANGES`, `HERO_HAND_POOL`, lookup, engine-string join |
| `web/src/lib/handClass.test.ts` | 5 | combo expansion (pair/suited/offsuit/garbage) + ALL_CARDS |
| `web/src/exercises/hand-vs-range/problem.test.ts` | 8 | random validity over 200 trials, parse/serialize round-trip, all rejection paths |
| `web/src/exercises/hand-vs-range/RangeGrid.test.tsx` | 3 | 169 cells, corner labels, in-range highlighting |
| `web/src/exercises/hand-vs-range/exercise.test.ts` | 6 | full `Exercise<TProblem>` contract |
| `web/src/components/exercise/ExerciseScreen.test.tsx` (Phase 8 block) | +5 | end-to-end render with the new URL shape |

## Open Questions (for next phase)
- **Pixel perf.** Median + max latency for `equity_vs_range_flop` on a flop, on Pixel hardware. Threshold from plan: 250 ms median triggers a "computing…" affordance and considers MC fallback in the next phase. Desktop suggests we are well clear, but the metric should be confirmed on the target device.
- **Grid readability.** Plan flagged 8px cell labels as a possible issue at ~24px cell size on Pixel. Solvable by dropping labels (cells become unlabeled colored squares — a common chart convention). Decide during walkthrough.
- **Range-pick repetition.** Random pick from the full library can land on the same range twice in a row. Plan said acceptable for prototype; revisit if it grates during play.

## Abstraction Held Up
Zero edits to `ExerciseScreen.tsx`, `EstimationBar.tsx`, `Axis.tsx`, `ActualValueTooltip.tsx`, `FireworkBurst.tsx`, `useAutoAdvance.ts`, `feedbackCopy.ts`. The `Exercise<TProblem>` shell consumed the new exercise without modification, exactly as the Phase 6 abstraction was designed for. This is the second exercise added since the refactor; both went in clean.

## Next Steps
- [ ] Manual Pixel walkthrough + perf capture (deferred from Task 20)
- [ ] Code review via `/code-review`
- [ ] Create PR via `/prp-pr`
