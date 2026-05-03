# Implementation Report: Visual Polish Pass (Phase 7)

## Summary
Refined the shared exercise shell across nine play-test items: cyan bar paints behind stage and is sized to the tolerance window, overlay alpha cut to ~25% of prior, axis gains 5%-step minor ticks and loses the redundant pointer triangle, equity hands get card chrome + Hero/Villain captions + updated prompt, the second exercise is now user-presented as "Breakeven %" (slug + copy), and reveal dwell is bumped 1s on both success and miss.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Medium | Medium |
| Confidence | High | High |
| Files Changed | ~10 | 12 |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Bump dwell timing constants | Complete | 1200→2200, 1800→2800 |
| 2 | Lighten dragging overlay | Complete | `--color-overlay` alpha 0.7→0.18 |
| 3 | Add minor axis ticks | Complete | 5% step, deduped against majors |
| 4 | Remove axis pointer triangle | Complete | `pointerValue` prop dropped from `AxisProps` |
| 5 | Cyan bar height = 2 × tolerance | Complete | `height = (2 × tolerance / (max-min)) × 100%` |
| 6 | Reorder cyan bar behind stage | Complete | Explicit `z-0/10/20/30/40` stack; `pointer-events-none` on stage/h1/axis |
| 7 | Card chrome on Equity | Complete | `rounded-md border border-zinc-200 bg-white shadow-sm` |
| 8 | Hero/Villain copy on Equity | Complete | Prompt + per-hand captions added |
| 9 | Rename Pot Odds → Breakeven % | Complete | `type=breakeven`, prompt/tooltip/barPrompt updated; folder + symbol kept |
| 10 | Adjust dragging-overlay axis palette | Complete | Mid-zinc tones for dragging mode |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis (lint) | Pass | `npm run lint` clean |
| Type Check | Pass | `npx tsc --noEmit` clean |
| Unit Tests | Pass | 129/129 (added 4 new: 2 Axis minor-tick, 2 EstimationBar bar-height) |
| Build | Pass | `npm run build` clean |
| Integration | N/A | No integration suite for this surface |

## Files Changed

| File | Action |
|---|---|
| `web/src/components/exercise/exerciseConfig.ts` | UPDATED |
| `web/src/app/globals.css` | UPDATED |
| `web/src/components/axis/Axis.tsx` | UPDATED |
| `web/src/components/axis/Axis.test.tsx` | UPDATED |
| `web/src/components/estimation-bar/EstimationBar.tsx` | UPDATED |
| `web/src/components/estimation-bar/EstimationBar.test.tsx` | UPDATED |
| `web/src/components/exercise/ExerciseScreen.tsx` | UPDATED |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | UPDATED |
| `web/src/exercises/equity/exercise.ts` | UPDATED |
| `web/src/exercises/equity/EquityStage.tsx` | UPDATED |
| `web/src/exercises/equity/PlayingCard.tsx` | UPDATED |
| `web/src/exercises/pot-odds/exercise.ts` | UPDATED |

## Deviations from Plan
- **Axis pointer-events.** Plan listed `pointer-events-none` on the stage wrapper but didn't call out the prompt h1 or the axis container. With explicit `z-40` on those, they would intercept pointer-down at the top/left of the screen and break drag-from-bottom. Added `pointer-events-none` to both — purely visual surfaces, no interactive children.
- **Fireworks z-index.** `FireworkBurst` sets its own `absolute inset-0` root. Wrapped its render site in a `z-30` positioned div rather than threading a className prop, keeping the component contract unchanged.
- **Test regex.** `/breakeven %/i` matches both the prompt ("What's your breakeven %?") and the bar prompt ("drag to estimate breakeven %"). Tightened the prompt-finding regex to `/your breakeven %/i` to disambiguate.

## Issues Encountered
None blocking. First test run surfaced the multi-match regex collision (above); fixed.

## Tests Written

| Test File | Tests | Coverage |
|---|---|---|
| `Axis.test.tsx` | 2 added (minor ticks for `[0,20,…,100]` and `[0,25,…,100]`), 2 pointer-related tests removed | Minor-tick rendering + dedup |
| `EstimationBar.test.tsx` | 2 added | Bar height = 2 × tolerance for tolerance=10 (20%) and tolerance=5 (10%) |
| `ExerciseScreen.test.tsx` | 9 copy regexes updated (Hand A → Hero, pot-odds slug → breakeven, prompt/bar copy) | Copy contract |

## Next Steps
- [ ] Manual browser validation on Pixel (drag bar paint, axis legibility through lighter overlay, tolerance-sized bar feel)
- [ ] Code review via `/code-review`
- [ ] Create PR via `/prp-pr`
