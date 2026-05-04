# Project Memory — poker-math-v2

Durable architecture, decisions, and gotchas. Not a phase log — per-phase history lives in `.claude/PRPs/reports/`. Product spec is in `.claude/PRPs/prds/poker-trainer.prd.md`.

## North star

Mobile-first, drag-to-estimate poker trainer. One situation per screen, one number to estimate, tolerance bands score "close enough." Single user, single device, no backend. Prototype goal is proving the interaction loop is enjoyable enough to replace doomscrolling — measured by the owner returning voluntarily on multiple separate days. iOS, accounts, sync, leaderboards, GTO, ICM, persisted scoring are all explicitly out of scope.

## Architecture

- **Rust engine (`engine/`) → WASM → Next.js (`web/`).** Pure-arithmetic exercises (pot odds / breakeven %, EV) live in TypeScript. Combinatorial / equity / range work routes through the Rust engine.
- **Two wasm artifacts, both committed.** `engine/pkg/` (target `bundler`) is what production loads via the `engine` package (`web/package.json` has `"engine": "file:../engine/pkg"`). `engine/pkg-node/` (target `nodejs`) exists only for Vitest, which can't load bundler-target wasm. Both are force-added so contributors don't need `wasm-pack` to run tests. **They must be rebuilt and committed together after any Rust change.**
- **Engine API.** `equity_vs(hand_a, hand_b) -> Result<f32, JsError>` is exposed via `#[wasm_bindgen]`. Wrapper around a private `compute_equity` returning `Result<f32, String>` so native `cargo test` can exercise error paths.
- **Frontend.** Next.js 16, React 19, Tailwind 4. State = React local + URL params for shareable problem seeds; no global store. Estimation bar uses Pointer Events directly, no drag library. WASM module loaded once at app boot.
- **Exercise shell contract.** `Exercise<TProblem>` is a config-driven shell (built in phase 6). Adding a new exercise = adding a config (problem generator, truth function, copy, optional bespoke stage component), not a new screen.

## Locked decisions

| Area | Choice | Rationale |
|------|--------|-----------|
| Engine library | `pokers` v0.10.0 | Covers ranges + Monte Carlo equity; sufficient for the PDF TOC |
| Frontend | Next.js 16 + React 19 + Tailwind 4 | Locked since scaffold |
| Package manager | npm | `--use-npm` at scaffold |
| Target browser | Chrome on Android (Pixel) | Owner's primary device; iOS deferred |
| Math split | Rust/WASM for combinatorial; TS for arithmetic | Match each tool to its strength; minimize round-trips |
| State | Local + URL | YAGNI for prototype |
| UI direction | Elevate-style, literal port | Validated estimation primitive; differentiation is *applying* it to poker |
| Slider gesture | Bottom-bar lifts into cyan bar w/ Y-axis pointer | One-thumb reach; matches Elevate |
| Tolerance UX | Implicit binary success/miss; no visible band | Drag bar height = `2 × tolerance` is the band by construction (set in phase 7) |
| Success/miss | Binary green flash + fireworks vs. grey settle | Simpler to tune; revisit if too punishing |
| Copy | "Hero" / "Villain", not "Hand A" / "Hand B" | Standard poker convention |
| Pot Odds rename | User-facing label is "Breakeven %" | Matches PDF terminology; internal symbols unchanged |

## Gotchas (load-bearing)

- **`JsError::new` panics in native tests.** It dispatches into a wasm-bindgen import that doesn't exist outside wasm. Pattern: keep a private inner function returning `Result<_, String>` and convert at the `#[wasm_bindgen]` boundary.
- **Vitest can't load bundler-target wasm.** Vite's ESM-wasm integration isn't supported in node-env tests. `web/vitest.config.ts` aliases the `engine` import to `engine/pkg-node` to work around this. Production code path is unaffected.
- **Vitest pinned to `^2`.** Vitest 4 needs Node ≥ 22 (`node:util#styleText`); local Node is 20.x. Bump together.
- **`@vitejs/plugin-react` pinned to `^4`.** v6 requires Vite 8; Vitest 2 ships Vite 5. Don't bump in isolation.
- **No `import init` from the JS wrapper.** wasm-pack 0.13 + wasm-bindgen 0.2.118 bundler target loads wasm synchronously through the bundler's native ESM-wasm integration; there's no `__wbg_init` to call. The `getEngine()` Promise API is preserved at the caller level for stability.
- **Cargo edition 2024.** Engine requires Rust ≥ 1.85. Pin the toolchain in CI explicitly.
- **WASM bundle is ~233 KB gzipped**, over the 80 KB microsite target documented in the PRD success metrics. Accepted for the prototype; revisit if shipping more broadly.
- **React 19 lint rules.** `react-hooks/set-state-in-effect` and `react-hooks/refs` reject patterns the planner suggested in phase 4 (effect-driven phase reset, top-of-hook ref writes). Use sync state changes in event handlers, and write refs from a no-deps effect.
- **`web/AGENTS.md` warning about Next.js 16.** APIs and conventions differ from training data. Read `node_modules/next/dist/docs/` before writing Next code.

## Open questions

Carried from PRD; revisit when the relevant exercise lands.

- Scoring "close enough" on EV (unbounded, signed) vs. % exercises (bounded 0–100).
- Bespoke screens vs. shared primitives across the 15 PDF exercise types — phase 6 proved the shell handles two; pressure-test with the next one or two.
- Multi-input exercises (range vs. range w/ board): progressive disclosure within one screen vs. split into separate exercises.
- Drilling order: shuffled, curriculum, or weighted by recent performance.
- Per-exercise tolerance tuning — needs play-testing.
