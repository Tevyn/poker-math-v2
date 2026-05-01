# Implementation Report: Estimation Slider Primitive (Phase 3)

## Summary
Built a self-contained, mobile-first vertical drag-to-estimate React primitive at `web/src/components/estimation-slider/`. The component drives all dragging through Pointer Events with `setPointerCapture`, validates props at render time via a pure `assertSliderProps` helper, and reveals a tolerance band centered on the configured `truth` only on `pointerup`/`pointercancel`. Pure value↔position math lives in `sliderMath.ts` and is unit-tested in isolation. A jsdom-backed Vitest config and a `@testing-library/react` setup were introduced so the component's render contract can be smoke-tested without trying to fake gestures (gesture quality is a manual Pixel check, deferred to Phase 4 per the plan). `web/src/app/page.tsx` is byte-identical to its pre-Phase-3 contents.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Medium | Medium |
| Files Changed | ~9 (6 new, 3 updated) | 9 (7 new, 3 updated) |
| Tests | ~16 (math + 4 component) | 37 new (28 math + 9 component) |

The extra new file is `web/src/test-setup.ts`, which the plan did not anticipate but jsdom forced us to add (see Deviations).

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Add testing deps + update vitest config | Complete | Pinned `@vitejs/plugin-react@^4` (Vite 5 peer) and `jsdom@^25` (Node 20.11 compat) — see Deviations |
| 2 | Define public API and prop types | Complete | `EstimationSliderProps` matches plan verbatim |
| 3 | Implement pure helpers in `sliderMath.ts` | Complete | Added `Number.isFinite` guards on all numeric inputs |
| 4 | Unit-test the math helpers | Complete | 28 tests vs the plan's ~14 — added boundary, non-zero-min, and clamp coverage |
| 5 | Implement `useReducedMotion` hook | Complete | Implemented via `useSyncExternalStore` instead of `useEffect`+`setState` — see Deviations |
| 6 | Implement `EstimationSlider.tsx` | Complete | Used inline `transitionProperty` instead of Tailwind arbitrary-property classes per the plan's GOTCHA #6 fallback |
| 7 | Add barrel export | Complete | Phase 4 can `import { EstimationSlider } from "@/components/estimation-slider"` |
| 8 | Component render-contract test | Complete | 9 tests covering ARIA, anchors, defaults, ariaLabel override, touch-action, and prop validation throws |
| 9 | Manual Pixel walkthrough | Deferred | Per plan — on-device gesture verification rolls into Phase 4 |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| TypeScript (`tsc --noEmit`) | Pass | Zero errors |
| ESLint (`npm run lint`) | Pass | Zero errors. The first lint pass flagged `setState` inside `useEffect` in `useReducedMotion`; the `useSyncExternalStore` rewrite resolved it. |
| Vitest (`npm test`) | Pass | 46 / 46 tests (9 engine + 28 math + 9 component) |
| Build (`npm run build`) | Pass | Next 16 + Turbopack compiled in ~1.5s; only existing `/` route emitted (slider tree-shaken since nothing imports it yet) |
| Integration | N/A | No API surface in this phase |
| Edge cases (plan checklist) | Pass | All math edge cases covered; reduced-motion path verified by code (transitionDuration `0ms`); pointer-leaves-track behavior is a manual Pixel check |

## Files Changed

| File | Action | Notes |
|---|---|---|
| `web/src/components/estimation-slider/EstimationSlider.tsx` | CREATED | The primitive — Pointer Events, validated props, hidden-until-release band/truth, anchor ticks, thumb |
| `web/src/components/estimation-slider/sliderMath.ts` | CREATED | `valueFromClientY`, `fractionFromValue`, `isWithinTolerance`, `assertSliderProps` |
| `web/src/components/estimation-slider/sliderMath.test.ts` | CREATED | 28 unit tests (boundary, clamp, tolerance, prop assertions) |
| `web/src/components/estimation-slider/EstimationSlider.test.tsx` | CREATED | 9 render-contract tests via `@testing-library/react` |
| `web/src/components/estimation-slider/useReducedMotion.ts` | CREATED | Hook backed by `useSyncExternalStore` + `matchMedia` |
| `web/src/components/estimation-slider/index.ts` | CREATED | Barrel export of `EstimationSlider` and `EstimationSliderProps` |
| `web/src/test-setup.ts` | CREATED | jsdom `matchMedia` shim + RTL `cleanup` registration — see Deviations |
| `web/vitest.config.ts` | UPDATED | jsdom env, React plugin, `**/*.test.{ts,tsx}` glob, setupFiles |
| `web/package.json` | UPDATED | DevDeps: `@vitejs/plugin-react@^4`, `jsdom@^25`, `@testing-library/react`, `@testing-library/dom` |
| `web/package-lock.json` | UPDATED | Auto from `npm install` |
| `web/src/app/page.tsx` | UNCHANGED | Verified byte-identical via `git diff -- web/src/app/page.tsx` (0 lines) |

## Deviations from Plan

1. **`@vitejs/plugin-react` major version**: The plan said install `@vitejs/plugin-react`. The latest (`6.x`) requires `vite ^8`, but Vitest 2.1.9 ships Vite 5.4.21. Pinned to `^4` for peer compatibility. **Why**: avoids a forced Vitest upgrade and keeps the existing Phase 2 engine tests untouched.
2. **`jsdom` major version**: The latest jsdom (29.x) requires `node >= 20.19`; the local Node is 20.11.1, which produced an `ERR_REQUIRE_ESM` from `html-encoding-sniffer`. Pinned to `^25`. **Why**: the alternative was a Node bump, which is out of scope for this phase.
3. **`useReducedMotion` rewrite**: The plan sketched a `useState` + `useEffect`+`setState` pattern. Project ESLint enforces `react-hooks/set-state-in-effect`, which flags that pattern as a cascading-render risk in React 19. Rewrote with `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`. **Why**: passes lint, gives correct SSR behavior (`getServerSnapshot` returns `false`), and avoids an unnecessary first-paint state flip on the client.
4. **`web/src/test-setup.ts` introduced**: The plan didn't list a setup file, but jsdom doesn't implement `window.matchMedia`, and Vitest doesn't auto-call RTL's `cleanup` between tests without `globals: true`. Added a single setup file that polyfills `matchMedia` and registers `afterEach(cleanup)`. **Why**: minimal, reused for any future component test, doesn't require enabling Vitest globals (which would change resolution for existing `engine.test.ts`).
5. **Component test count**: Plan estimated 4 tests; shipped 9. The extra cases (`anchors=[] → 0 ticks`, `ariaLabel` override, `touch-action: none` style assertion, `tolerance < 0` throws) cost almost nothing and lock down the contract Phase 4 will lean on.
6. **Inline `transitionProperty`**: The plan suggested Tailwind 4 arbitrary-property `transition-[transform,opacity]` with an inline-style fallback. Used the inline-style path directly. **Why**: avoids depending on Tailwind 4 JIT generating an arbitrary-property class on first build; keeps the transition deterministic.

## Issues Encountered

- **npm peer-dep conflict on `@vitejs/plugin-react@*`** — Resolved by pinning to `^4` (see Deviation 1).
- **jsdom 29 ESM-require crash** — Resolved by pinning to `^25` (see Deviation 2).
- **`react-hooks/set-state-in-effect` lint error in `useReducedMotion`** — Resolved by rewriting with `useSyncExternalStore` (see Deviation 3).
- **`window.matchMedia is not a function` in component tests** — Resolved by adding `web/src/test-setup.ts` and registering it via `setupFiles` (see Deviation 4).
- **`getByRole("slider")` returning multiple matches across consecutive tests** — Same root cause as #4: RTL wasn't auto-cleaning. Fixed by `afterEach(cleanup)` in the setup file.

## Tests Written

| Test File | Tests | Coverage |
|---|---|---|
| `sliderMath.test.ts` | 28 | `valueFromClientY` (top/bottom/clamp/midpoint/non-zero-min/zero-height), `fractionFromValue` (boundary + clamp), `isWithinTolerance` (table, including `tolerance=0` edge), `assertSliderProps` (valid + 5 throw cases) |
| `EstimationSlider.test.tsx` | 9 | ARIA contract, default `initialValue`, anchors → tick count, no-anchors → no ticks, `data-released="false"` pre-release, `ariaLabel` override, inline `touch-action: none`, prop-validation throws (truth out of range, negative tolerance) |

## Next Steps

- Phase 4: compose `EstimationSlider` with `equityVs` in a real exercise screen (`web/src/app/page.tsx` is up for grabs at that point).
- On-device Pixel check: deferred from Task 9; folds into the Phase 4 smoke test.
- `pkg-node/` regenerate dance is **not** required for this phase — no Rust changes were made.
