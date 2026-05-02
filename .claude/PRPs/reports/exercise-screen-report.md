# Implementation Report: Exercise Screen (Phase 4)

## Summary
Composed the Phase 3 `EstimationSlider` with the Phase 2 `equityVs` engine into a complete drill screen. `/` now renders two specific hold'em hands as visual cards, drives a vertical-drag estimator, and reveals truth + tolerance band + verdict on release. URL params (`?a=AsKs&b=QhQd`) encode the problem so refresh reproduces it; `next` mints a new pair via `router.replace` (no history pollution). The Phase 4 success signal — owner can complete 5 problems back-to-back without thinking about the app — is reachable; on-device Pixel walkthrough deferred to follow-up (see Issues).

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Medium | Medium |
| Files Changed | ~10 (8 new, 2 updated) | 10 (9 new, 1 updated) |
| Tests added | ~14 problem + ~4 screen = ~18 | 19 problem + 4 screen = 23 |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Pure problem helpers in `problem.ts` | Complete | |
| 2 | Unit tests for `problem.ts` | Complete | 19 tests |
| 3 | `exerciseConfig.ts` (tolerance + anchors) | Complete | |
| 4 | `PlayingCard` presentational | Complete | |
| 5 | `HandDisplay` row | Complete | |
| 6 | `FeedbackPanel` verdict + Next | Complete | |
| 7 | `ExerciseScreen` integration | Complete | Deviated — see Deviations |
| 8 | Barrel export | Complete | |
| 9 | Render-contract tests for `ExerciseScreen` | Complete | 4 tests |
| 10 | Replace `page.tsx` with Suspense wrapper | Complete | `/` still prerenders as `○` |
| 11 | Manual Pixel walkthrough | Deferred | Not run in this session — needs on-device check |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis (tsc) | Pass | Zero errors |
| Lint (eslint) | Pass | Zero errors, zero warnings |
| Unit Tests (vitest) | Pass | 69/69 (46 prior + 23 new) |
| Build (next build) | Pass | `/` prerendered as `○` (static) — Suspense wiring correct |
| Manual / on-device | Deferred | See Issues |

## Files Changed

| File | Action | Notes |
|---|---|---|
| `web/src/components/exercise/problem.ts` | CREATED | Pure helpers — types, deck, shuffle, parse, random pair |
| `web/src/components/exercise/problem.test.ts` | CREATED | 19 tests |
| `web/src/components/exercise/exerciseConfig.ts` | CREATED | `EQUITY_TOLERANCE`, `EQUITY_ANCHORS` |
| `web/src/components/exercise/PlayingCard.tsx` | CREATED | Static visual card with rank/suit/color |
| `web/src/components/exercise/HandDisplay.tsx` | CREATED | Two-card row with optional label |
| `web/src/components/exercise/FeedbackPanel.tsx` | CREATED | Verdict + truth + Next; reserves height pre-release |
| `web/src/components/exercise/ExerciseScreen.tsx` | CREATED | State machine, engine boot, URL sync |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | CREATED | 4 render-contract tests |
| `web/src/components/exercise/index.ts` | CREATED | Barrel export |
| `web/src/app/page.tsx` | UPDATED | Replaced Phase 2 smoke page with Suspense + `<ExerciseScreen/>` |

## Deviations from Plan

1. **Release-state reset — refactor to per-problem tagging.** The plan suggested `useEffect(() => setRelease(null), [problem.a, problem.b])`. The repo's ESLint config (`react-hooks/set-state-in-effect`) flagged this as an error: "Avoid calling setState() directly within an effect." Reworked to tag the release state with `problemKey = problem.a + problem.b` and derive `activeRelease = release.problemKey === problemKey ? release : null` per render. Net effect identical (verdict clears on `next`), zero effects, lint clean. Slider `key={problemKey}` retained so the slider's internal `released` flag also resets.

2. **`urlValid` extracted as a derived constant** (rather than recomputed inside the memo and the effect). Cleaner: `const urlValid = isValidHandPair(urlA, urlB)` is computed once per render and used in both the memo dependency list and the URL-write guard. Equivalent semantics; less duplication.

3. **`useSearchParams` consumed via stable string deps.** Plan example used `[searchParams]` as the memo dep. `useSearchParams()` returns a stable-ish but referentially-distinct object across navigations, so I keyed the memo on `[urlA, urlB, urlValid]` — string deps are stable when content is unchanged, eliminating any risk of memo-thrash on unrelated re-renders.

## Issues Encountered

1. **`react-hooks/set-state-in-effect` lint rule.** Caught the planned reset effect. Resolved via the per-problem tagging refactor above (no architectural impact).

2. **Manual Pixel walkthrough not executed.** The on-device validation listed in Task 11 (vertical drag, no scroll hijack, reduced-motion behavior, 5-problems-in-a-row success signal) was not run in this session — no Pixel device or LAN-tunneled dev server available here. Build, types, lint, and unit tests all pass; the slider's `touch-action: none` and reduced-motion handling are inherited from Phase 3 (already verified there). On-device check should happen before declaring Phase 4 fully shippable.

## Tests Written

| Test File | Tests | Coverage |
|---|---|---|
| `web/src/components/exercise/problem.test.ts` | 19 | deck size + uniqueness, parseHand happy/invalid/empty, isValidHand identity, isValidHandPair table (5 cases incl. empty/garbage/conflict), randomHandPair (1000-trial no-conflict + RNG advancement), shuffle (permutation, immutability, determinism) |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | 4 | prompt visible, 4 cards rendered, slider mounts vertically, feedback hidden until release |

## Next Steps
- [ ] Manual on-device Pixel walkthrough (5 problems back-to-back, vertical drag, reduced-motion check)
- [ ] Capture Phase 5 inputs from walkthrough — concrete things that look unfinished (card type pairing, slider thumb depth, verdict hierarchy, etc.)
- [ ] Code review via `/code-review`
- [ ] Commit + advance the PRD's Phase 4 status
