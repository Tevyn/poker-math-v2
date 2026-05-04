# poker-math-v2

Rust→WASM poker estimation trainer with a Next.js frontend. Mobile-first prototype: drag a slider to estimate a number, tolerance bands score "close enough."

## Read first

- `.claude/memory.md` — durable architecture, locked decisions, and gotchas
- `.claude/PRPs/prds/poker-trainer.prd.md` — product spec, scope, decisions log
- `web/AGENTS.md` — sub-scope rules when working inside `web/`

## Layout

```
engine/      Rust crate (edition 2024). Builds to engine/pkg/ (bundler) and
             engine/pkg-node/ (Node) via wasm-pack. Both pkg dirs are committed.
web/         Next.js 16 + React 19 + Tailwind 4. Consumes engine via
             "engine": "file:../engine/pkg".
.claude/     PRPs (plans, prds, reports), memory, settings.
```

## Commands

Engine (run from `engine/`):
- `cargo test` — unit + property tests
- `cargo clippy --all-targets -- -D warnings`
- `cargo fmt --check` (or `cargo fmt` to fix)
- `wasm-pack build --target bundler` and `wasm-pack build --target nodejs --out-dir pkg-node` — rebuild **both** when Rust changes; commit the artifacts together

Web (run from `web/`):
- `npm test` — vitest
- `npm run lint`
- `npm run build` — next build
- `npx tsc --noEmit` — typecheck
- `npm run dev`

## Where decisions live

Locked product/stack decisions and known gotchas live in [`.claude/memory.md`](.claude/memory.md). Per-phase implementation history lives in [`.claude/PRPs/reports/`](.claude/PRPs/reports/). The PRD is the source of truth for product scope.
