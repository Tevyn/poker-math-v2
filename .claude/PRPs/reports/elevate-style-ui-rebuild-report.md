# Implementation Report: Elevate-Style UI Rebuild (Phase 5)

## Summary
Replaced the Phase 4 vertical-slider+thumb exercise screen with the Elevate-style bottom-bar gesture, a four-state phase machine (idle / dragging / success / miss), a dotted Y-axis with square ticks, simplified vertical-rectangle cards, an "ACTUAL EQUITY" speech-bubble tooltip, a geometric firework burst on success, and auto-advance to the next problem (no "next" button). Tolerance widened from ±5% to ±10% per PRD spec.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Large | Large (matches) |
| Files Changed | ~15 (10 new, 5 updated) | 22 (15 new, 5 updated, 2 deleted) |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Move slider math to shared lib | Complete | Re-export shim left at old path until Task 15 deletion |
| 2 | Update exerciseConfig | Complete | Tolerance 5→10, anchors 0/25/50/75/100 → 0/20/40/60/80/100, hold timings + firework duration added |
| 3 | Palette tokens in globals.css | Complete | Added `--color-cyan-bar`, `--color-success-flash`, `--color-miss-settle`, `--color-overlay`, `--color-control-idle`; `@keyframes fireworkBurst` defined here |
| 4 | EquityAxis component + tests | Complete | Dotted line + 6 square ticks + optional cyan pointer arrow |
| 5 | EstimationBar primitive + tests | Complete | Mirrors slider ARIA + pointer-capture flow; idle pill cross-fades to cyan band on drag |
| 6 | ActualEquityTooltip | Complete | White speech bubble with downward tail, clamp() typography |
| 7 | FireworkBurst | Complete | 12 seeded particles (squares + triangles) using shared CSS keyframe; renders nothing under reduced motion |
| 8 | useReducedMotion to shared hooks | Complete | Re-exported from old path during transition |
| 9 | useAutoAdvance hook + tests | Complete | Ref-in-effect pattern (React 19 lint-compliant) |
| 10 | feedbackCopy + picker | Complete | Deterministic FNV-1a hash; `seededFloat` helper added for firework angles |
| 11 | Simplify PlayingCard | Complete | No border, no rotated bottom rank; same testids preserved |
| 12 | Strip HandDisplay label | Complete | Cards-only render, testid preserved |
| 13 | Rebuild ExerciseScreen with state machine | Complete | Discriminated union `ScreenPhase`; phase reset moved into `onNext` (lint requirement) |
| 14 | Update ExerciseScreen tests | Complete | Phase machine assertions + auto-advance timer integration; PointerEvent polyfill added in test-setup |
| 15 | Delete old slider + FeedbackPanel | Complete | `rg estimation-slider FeedbackPanel src` returns nothing |
| 16 | Manual play-test on Pixel | **Skipped — needs owner device** | See Next Steps |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis (`tsc --noEmit`) | Pass | Zero errors |
| Lint (`eslint`) | Pass | Zero errors |
| Unit Tests (`vitest`) | Pass | 93/93 passing |
| Production Build (`next build`) | Pass | Compiled in ~1.7s; 4 static pages generated |
| Integration | N/A | No server endpoints |
| Edge Cases (manual checklist) | Deferred to Task 16 | Pointer capture, reduced motion, URL refresh, double-release guard, gating need device verification |

## Files Changed

| File | Action | Notes |
|---|---|---|
| `web/src/lib/sliderMath.ts` | CREATED | Relocated pure helpers |
| `web/src/lib/sliderMath.test.ts` | CREATED | Relocated tests |
| `web/src/hooks/useReducedMotion.ts` | CREATED | Relocated from old slider folder |
| `web/src/hooks/useAutoAdvance.ts` | CREATED | New auto-advance hook |
| `web/src/hooks/useAutoAdvance.test.ts` | CREATED | 4 tests, fake timers |
| `web/src/components/equity-axis/EquityAxis.tsx` | CREATED | Dotted axis primitive |
| `web/src/components/equity-axis/EquityAxis.test.tsx` | CREATED | 5 tests |
| `web/src/components/equity-axis/index.ts` | CREATED | Public surface |
| `web/src/components/estimation-bar/EstimationBar.tsx` | CREATED | New primitive |
| `web/src/components/estimation-bar/EstimationBar.test.tsx` | CREATED | 9 tests |
| `web/src/components/estimation-bar/index.ts` | CREATED | Public surface |
| `web/src/components/feedback/ActualEquityTooltip.tsx` | CREATED | White speech bubble |
| `web/src/components/feedback/ActualEquityTooltip.test.tsx` | CREATED | 3 tests |
| `web/src/components/feedback/FireworkBurst.tsx` | CREATED | Geometric burst |
| `web/src/components/feedback/FireworkBurst.test.tsx` | CREATED | 3 tests |
| `web/src/components/feedback/feedbackCopy.ts` | CREATED | Deterministic phrase + float pickers |
| `web/src/components/feedback/feedbackCopy.test.ts` | CREATED | 6 tests |
| `web/src/components/feedback/index.ts` | CREATED | Public surface |
| `web/src/components/exercise/ExerciseScreen.tsx` | UPDATED | Discriminated-union phase machine |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | UPDATED | Phase assertions + timer integration |
| `web/src/components/exercise/PlayingCard.tsx` | UPDATED | Vertical rect, no border |
| `web/src/components/exercise/HandDisplay.tsx` | UPDATED | Label dropped |
| `web/src/components/exercise/exerciseConfig.ts` | UPDATED | Tolerance 10, new anchors, hold timings |
| `web/src/app/globals.css` | UPDATED | Palette tokens + firework keyframe |
| `web/src/test-setup.ts` | UPDATED | PointerEvent polyfill for jsdom |
| `web/src/components/estimation-slider/` | DELETED | Old primitive + tests |
| `web/src/components/exercise/FeedbackPanel.tsx` | DELETED | Replaced by per-phase rendering |

## Deviations from Plan

1. **Phase reset moved out of effect.** Plan suggested `useEffect(() => setPhase({kind:"idle"}), [problemKey])`. React 19's new `react-hooks/set-state-in-effect` lint rule rejected that. Replaced with a synchronous `setPhase({kind:"idle"})` inside `onNext`, immediately before `router.replace`. The URL change still drives the `EstimationBar` remount via `key={problemKey}`.

2. **`useAutoAdvance` ref-write moved into a sync effect.** Plan's `cb.current = onAdvance` at the top of the hook tripped the new `react-hooks/refs` lint rule. Wrapped in a no-deps `useEffect(() => { cbRef.current = onAdvance })` so the ref is updated after render.

3. **`EstimationBar` re-reads pointer position on release.** Plan's flow relied on `value` from React state at release time. In tests (and on a fast tap with no move events), the closure value is stale. Added a `getBoundingClientRect()` re-read inside `onPointerEnd` so the released value reflects the final pointer position.

4. **PointerEvent polyfill added to `test-setup.ts`.** jsdom doesn't implement `PointerEvent`, so `fireEvent.pointerDown(el, { clientY })` was dropping the coordinate. Added a `MouseEvent`-backed polyfill so component tests can drive the gesture deterministically.

5. **`seededFloat` helper added to `feedbackCopy.ts`.** Not in the plan — needed by `FireworkBurst` for deterministic per-particle angles/distances. Lives next to `pickPhrase` since they share the FNV-1a hash.

## Issues Encountered
- Initial gesture test produced `aria-valuenow="NaN"` because jsdom's PointerEvent constructor is missing — fixed via the polyfill in `test-setup.ts`.
- Initial success-path test failed because the released `value` in `onPointerEnd` was stale — fixed by re-reading from the rect in the release handler.
- Two new React 19 lint rules (`react-hooks/refs`, `react-hooks/set-state-in-effect`) rejected patterns the plan suggested — both reworked to lint-clean equivalents.

## Tests Written

| Test File | Tests | Coverage |
|---|---|---|
| `web/src/lib/sliderMath.test.ts` | 28 | Pure math helpers (relocated, identical to old) |
| `web/src/hooks/useAutoAdvance.test.ts` | 4 | Timer fires, cancels on unmount, inactive no-op, callback identity safety |
| `web/src/components/equity-axis/EquityAxis.test.tsx` | 5 | Tick count, conditional pointer, mode attr, empty values |
| `web/src/components/estimation-bar/EstimationBar.test.tsx` | 9 | ARIA contract, prop validation, gesture flow, idle-bar gating |
| `web/src/components/feedback/feedbackCopy.test.ts` | 6 | Determinism, list membership, non-empty, salt variance |
| `web/src/components/feedback/ActualEquityTooltip.test.tsx` | 3 | Rounding, label, visibility attr |
| `web/src/components/feedback/FireworkBurst.test.tsx` | 3 | 12 particles, inactive null, reduced-motion null |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | 7 | Render contract + phase machine + auto-advance integration |

Total: 65 new/updated test cases across 8 files; combined suite: 93 passing.

## Next Steps
- [ ] **Task 16 (manual)**: Owner play-test five problems back-to-back on a Pixel + Chrome. Tune `RELEASE_TRANSITION_MS` and palette tokens (`globals.css`) if greens/cyans read as Tailwind-default. Verify reduced-motion path in DevTools.
- [ ] PRD Phase 5 row → mark `complete` and link this report (the PRD itself remains modified in the working tree from a prior session — owner can update at PR time).
- [ ] `/code-review` on the diff before opening a PR.
- [ ] `/prp-pr` to open the PR.
