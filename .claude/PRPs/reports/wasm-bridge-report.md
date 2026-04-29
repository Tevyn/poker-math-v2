# Implementation Report: WASM Bridge (Phase 1)

## Summary
Wired the Rust→WASM `engine` package into the Next.js frontend behind a singleton initializer (`web/src/lib/engine.ts`), and replaced the hardcoded smoke test with the PRD-spec interactive page: user types a hand range, sees the live combo count. Layout metadata and body font fallback also corrected. All static validation, the production build, and the dev-server SSR sanity check pass.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Small | Small (matched) |
| Confidence | 9/10 | 9/10 — implementation matched the plan exactly |
| Files Changed | 4 (1 new, 3 updated) | 4 (1 new, 3 updated) |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Create `web/src/lib/engine.ts` singleton wrapper | Complete | Promise cache + clear-on-error retry behavior |
| 2 | Replace `web/src/app/page.tsx` with interactive smoke test | Complete | Extracted `ResultLine` helper for readability; behavior matches plan exactly |
| 3 | Fix layout metadata + globals.css body font | Complete | Two surgical edits |
| 4 | Verify on real Pixel | **Deferred to user** | Requires physical device on LAN; substituted dev-server SSR check + curl verification of HTML output |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis (tsc) | Pass | Zero type errors |
| Static Analysis (ESLint) | Pass | Zero lint errors |
| Unit Tests (Rust) | Pass | `cargo test`: 2/2 (`pocket_aces_has_six_combos`, `ako_offsuit_has_twelve_combos`) — no regression |
| Unit Tests (JS) | N/A | Plan explicitly deferred a JS test runner install to Phase 2 |
| Build | Pass | `next build` (Turbopack) compiled in 1.4s; static prerender succeeded; `engine_bg.<hash>.wasm` emitted at 61,078 bytes (matches source) |
| Integration | Pass | `next dev` boot in <1s; SSR HTML contains `<title>poker-trainer</title>`, `<meta name="description" content="Drill poker estimation skills.">`, the "poker-trainer · engine" heading, and the "loading wasm…" placeholder (correct — WASM hydrates client-side) |
| Edge Cases | Deferred | Manual checks (typing `AA`/`AKo`/`JJ+`/garbage on a real Pixel) require user; the underlying `count_combos` is already proven correct by `cargo test` |

## Files Changed

| File | Action | Notes |
|---|---|---|
| `web/src/lib/engine.ts` | CREATED | 22 lines. Singleton `getEngine()` + typed `EngineApi` interface |
| `web/src/app/page.tsx` | UPDATED | 78 lines (was 52). Form-driven, `ResultLine` helper, no hardcoded inputs |
| `web/src/app/layout.tsx` | UPDATED | Metadata `title`/`description` only (one block touched) |
| `web/src/app/globals.css` | UPDATED | Body `font-family` swapped from `Arial` fallback to `var(--font-sans)` |

## Deviations from Plan

1. **Branch**: Plan implied creating a feature branch from `main`. The repo has zero commits, so `git checkout -b` would have failed (no HEAD to branch from). Implemented on `main` directly. **Recommendation**: when the user is ready to commit, do an initial commit on `main`, then branch.
2. **Page structure**: Extracted a small `ResultLine` helper component inside `page.tsx` rather than inlining all five render branches in the parent. Keeps the JSX flat and the conditions readable. Same file, no extra import. Behavior identical to the plan's spec.
3. **Pixel hardware verification (Task 4)**: deferred to the user. Not something I can perform.

## Issues Encountered

- **None blocking.** Turbopack handled the wasm-pack `--target bundler` output natively (the documented fallback to `--webpack` was not needed). The plan's top risk did not materialize.
- **One observation worth noting**: `next dev` exposes the WASM under `/_next/dev/static/media/engine_bg.<hash>.wasm` and the prod build under `/_next/static/media/engine_bg.<hash>.wasm`. Hash differs across rebuilds — fine for asset caching, but means any future test that hard-codes the URL will break. None do today.

## Tests Written

| Test File | Tests | Coverage |
|---|---|---|
| (none) | 0 | Plan explicitly deferred JS test runner setup to Phase 2 where the new `equity_vs` API will harness it. Existing Rust tests in `engine/src/lib.rs:14-22` still cover the only Rust function in scope (`count_combos`). |

## Next Steps

- [ ] User: open the dev server on a Pixel via LAN and confirm "12 combos" renders for `AKo` (the PRD's success signal — the only outstanding acceptance-criterion check).
- [ ] `/code-review` to review the diff
- [ ] First git commit on `main` (repo has no history yet), then optional feature branch for Phase 2 work
- [ ] `/prp-plan` for Phase 2 (Equity engine API) — can run in parallel with Phase 3 (Estimation slider primitive) per the PRD's parallelism note
