# Plan: WASM Bridge (Phase 1)

## Summary
Wire the Rust→WASM `engine` package into the Next.js frontend with a reusable singleton initializer, and ship the PRD-spec smoke test: a user types a hand range like `AKo` and sees the combo count rendered in Chrome. Establishes the `lib/engine.ts` module that all later phases (equity API, exercise screen) will import.

## User Story
As the project owner, I want to confirm end-to-end that Rust math runs correctly inside the Next.js app on my Pixel, so that I have a trusted foundation for building the equity exercise on top of.

## Problem → Solution
Current state: `web/src/app/page.tsx` calls `init()` and `count_combos` directly with hardcoded inputs (`AA`, `AKo`). `engine` is npm-linked via `file:../engine/pkg`, but the wiring has never been opened in `next dev` end-to-end, there is no shared engine module, and the page is a stub with hardcoded values rather than the PRD's described "type AKo → 12" interactive smoke test.

Desired state: A `web/src/lib/engine.ts` singleton encapsulates WASM initialization (idempotent, typed, error-aware). The home page is a minimal interactive smoke test: user types a range string, sees the live combo count or a typed validation error. `next dev` boots clean on Chrome desktop and on Pixel Chrome via local network. Phase 1 acceptance criterion ("see 12 rendered for AKo") is observably satisfied on both.

## Metadata
- **Complexity**: Small
- **Source PRD**: `.claude/PRPs/prds/poker-trainer.prd.md`
- **PRD Phase**: Phase 1 — WASM bridge
- **Estimated Files**: 4 (1 new, 3 updated)

---

## UX Design

### Before
```
┌─────────────────────────────────────┐
│  poker-trainer · engine smoke test  │
│                                     │
│  engine ok — AA: 6 combos,          │
│              AKo: 12 combos         │
└─────────────────────────────────────┘
   (hardcoded — no input, not the
    PRD-described "type X → 12")
```

### After
```
┌─────────────────────────────────────┐
│  poker-trainer · engine             │
│                                     │
│   ┌─────────────────────────┐       │
│   │ AKo                     │       │
│   └─────────────────────────┘       │
│                                     │
│   12 combos                         │
│                                     │
│   (engine ready · 60 KB wasm)       │
└─────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Page load | Auto-runs hardcoded `AA` and `AKo`, displays both | WASM warms in background; input shows placeholder | Warm before first interaction so the first keystroke is fast |
| User input | None possible | Single text input for a range string (e.g. `AA`, `AKo`, `JJ+`) | No debounce needed — `count_combos` on a string is microseconds |
| Result | Static dual line | Live combo count under input | Updates as user types |
| Errors | None visible (init failure shown in red) | Friendly inline message for unparseable input ("not a valid range"); init failure remains a hard fault | Don't crash the page on bad input |

This is a smoke test, not a designed UI. Aesthetic pass is Phase 5 — keep it intentional but minimal.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `.claude/PRPs/prds/poker-trainer.prd.md` | 140-156 | Phase 1 scope, success signal, parallelism notes |
| P0 | `engine/pkg/engine.d.ts` | all (37) | Exact `init` and `count_combos` signatures from wasm-pack |
| P0 | `engine/pkg/engine.js` | 156-180 | `__wbg_init` is idempotent (`if (wasm !== undefined) return wasm`) — exploit this in the singleton |
| P0 | `engine/pkg/package.json` | all | Confirms `"main": "engine.js"`, `"types": "engine.d.ts"`, `"type": "module"` |
| P0 | `web/src/app/page.tsx` | all (52) | Current wiring; replace with form-driven version |
| P1 | `engine/src/lib.rs` | all (23) | `count_combos` returns `u32`; passes input through `HandRange::from_strings` (returns empty hands on garbage, doesn't panic) |
| P1 | `web/next.config.ts` | all (10) | `turbopack.root` points one level above `web/` so the `file:../engine/pkg` link is in scope |
| P1 | `web/src/app/layout.tsx` | all (33) | Metadata still says "Create Next App" — fix as part of this phase |
| P2 | `web/AGENTS.md` | all | "This is NOT the Next.js you know" — Next.js 16 + React 19 + Tailwind 4 + Turbopack default |
| P2 | `web/node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopack.md` | grep `wasm` | Turbopack supports `wasm` as a built-in rule and honors `import.meta.url` asset references — no extra config required for the wasm-pack output |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| wasm-pack `--target bundler` output | wasm-bindgen book | Generated `engine.js` uses `new URL('engine_bg.wasm', import.meta.url)` — Turbopack and webpack both treat that as an asset reference; no loader required |
| `pokers::HandRange::from_strings` | crates.io/pokers v0.10.0 | Invalid input returns a `HandRange` with `.hands.len() == 0`, not a panic — informs how we surface "invalid range" errors |
| Next.js 16 client components | Bundled docs `01-app` | `"use client"` directive required for React state/effects; WASM init must happen client-side |

---

## Patterns to Mirror

### TYPESCRIPT_NAMING
```ts
// SOURCE: web/src/app/page.tsx:6-9
interface SmokeTestResult {
  ok: boolean;
  message: string;
}
```
PascalCase interfaces, camelCase variables, double-quoted strings, semicolons. Match the existing house style; do not reformat.

### CLIENT_COMPONENT_HEADER
```ts
// SOURCE: web/src/app/page.tsx:1
"use client";

import { useEffect, useState } from "react";
```
Every file that uses React state or imports `engine` must start with `"use client"`. Server components cannot run the WASM init.

### ERROR_NARROWING
```ts
// SOURCE: web/src/app/page.tsx:29-31
.catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  setResult({ ok: false, message: `engine init failed: ${msg}` });
});
```
Treat caught errors as `unknown`, narrow with `instanceof Error`, fall back to `String(err)`. Matches `~/.claude/rules/typescript/coding-style.md`.

### CANCELLED_EFFECT
```ts
// SOURCE: web/src/app/page.tsx:14-36
useEffect(() => {
  let cancelled = false;
  init()
    .then(() => {
      if (cancelled) return;
      // ...
    });
  return () => { cancelled = true; };
}, []);
```
Use a `cancelled` flag to guard async state updates after unmount. Mirror this in any async effect.

### TAILWIND_LAYOUT
```tsx
// SOURCE: web/src/app/page.tsx:39-50
<main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8 font-mono dark:bg-black">
  <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">…</h1>
  <p className={result.ok ? "text-emerald-600" : "text-rose-600"}>{result.message}</p>
</main>
```
Tailwind 4 utilities, `dark:` variants from `prefers-color-scheme`, `font-mono` for the smoke-test surface. Aesthetic pass comes later; stay minimal.

### RUST_TEST_STRUCTURE
```rust
// SOURCE: engine/src/lib.rs:10-23
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pocket_aces_has_six_combos() {
        assert_eq!(count_combos("AA"), 6);
    }
}
```
Inline `#[cfg(test)] mod tests` per file, descriptive `snake_case` names. No new Rust tests required for Phase 1, but follow this shape if any are added.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `web/src/lib/engine.ts` | CREATE | Singleton WASM initializer + typed wrapper functions; the single import surface for all later phases |
| `web/src/app/page.tsx` | UPDATE | Replace hardcoded smoke test with form-driven "type a range → see combos" matching the PRD success signal |
| `web/src/app/layout.tsx` | UPDATE | Fix `metadata.title`/`description` from "Create Next App" placeholder |
| `web/src/app/globals.css` | UPDATE (small) | Body font currently falls back to `Arial`; align with `--font-sans` (Geist) loaded in layout |

## NOT Building

- Equity calculation, hand-vs-hand math, or anything that requires a new Rust function (Phase 2)
- The drag-to-estimate slider primitive (Phase 3)
- Any exercise screen, problem prompts, or feedback animations (Phase 4)
- Aesthetic / typography / motion polish (Phase 5)
- Card visualization, hand parsing, or suited/offsuit notation helpers
- Range-grid UI (later phases, if at all in MVP)
- Loading splash, route transitions, or app shell
- Persistence of any kind (`localStorage`, URL params for problem seeds — that's Phase 4)
- Tests against `pokers` directly (Phase 2 owns property tests)
- E2E / Playwright setup — defer until there's a real UX to test (Phase 4 at earliest)
- A JS test runner (Vitest/Jest) — defer to Phase 2 where the new equity API justifies the install

---

## Step-by-Step Tasks

### Task 1: Create `web/src/lib/engine.ts` singleton wrapper
- **ACTION**: New file at `web/src/lib/engine.ts` exporting a typed engine API.
- **IMPLEMENT**:
  - Module-scope `let cachedPromise: Promise<EngineApi> | null = null;`
  - `export async function getEngine(): Promise<EngineApi>` — if `cachedPromise` is null, set it to a new init promise that calls `init()` from `engine` then resolves to an `EngineApi`. Return `cachedPromise`.
  - On init failure, the cached promise rejects; clear `cachedPromise` in a `.catch` so a second call retries with a fresh attempt rather than a poisoned cache.
  - `export interface EngineApi { countCombos(rangeStr: string): number }` — wraps `count_combos`, returns the `u32` as a JS `number`.
  - Do NOT use `console.log`. Errors propagate via the rejected promise; the caller renders them.
- **MIRROR**: `ERROR_NARROWING` for any try/catch. `TYPESCRIPT_NAMING` for the `EngineApi` interface.
- **IMPORTS**: `import init, { count_combos } from "engine";`
- **GOTCHA**:
  - `__wbg_init` is already idempotent at `engine/pkg/engine.js:158` (`if (wasm !== undefined) return wasm`), but multiple parallel callers can each `await init()` independently — caching the promise prevents duplicate fetches of `engine_bg.wasm`.
  - Do not call `init()` in module scope. Lazy-init on first call so SSR import is safe.
  - `count_combos` returns `u32` from Rust. wasm-bindgen surfaces this as a JS `number`. Don't widen to `bigint`.
  - `pokers::HandRange::from_strings` does not panic on invalid input; it returns a range with `0` hands. Use that as the validity signal — do not rely on a thrown error.
- **VALIDATE**:
  - `cd web && npx tsc --noEmit` passes
  - `cd web && npm run lint` passes
  - Manual: import the module from the page, call `getEngine()` twice in parallel — only one `engine_bg.wasm` request appears in DevTools Network tab.

### Task 2: Replace `web/src/app/page.tsx` with the interactive smoke test
- **ACTION**: Rewrite the home page to use `getEngine()` and render the live combo count for a user-typed range string.
- **IMPLEMENT**:
  - `"use client"` directive at top.
  - `const [range, setRange] = useState("AKo")` — seed with the PRD's canonical example so the success signal is visible on first paint.
  - `const [api, setApi] = useState<EngineApi | null>(null)`
  - `const [initError, setInitError] = useState<string | null>(null)`
  - `useEffect` warms the engine on mount; `cancelled` flag guards `setApi`. On error, narrow via `instanceof Error` and call `setInitError`.
  - Derive `combos` synchronously: `const combos = api && range.trim() ? api.countCombos(range.trim()) : null;`
  - Render: heading, `<input>` (single line, autoFocus, `inputMode="text"`, `autoCapitalize="characters"`, `autoCorrect="off"`, `spellCheck={false}`, monospace), and one of:
    - "loading wasm…" while `api === null && !initError`
    - "engine init failed: {initError}" if `initError`
    - empty when `range.trim() === ""`
    - "{combos} combos" in emerald-600 if `combos > 0`
    - "not a valid range" in zinc-500 if `combos === 0`
  - No "AA: 6, AKo: 12" hardcoded readout.
- **MIRROR**: `CLIENT_COMPONENT_HEADER`, `CANCELLED_EFFECT`, `ERROR_NARROWING`, `TAILWIND_LAYOUT`, `TYPESCRIPT_NAMING`.
- **IMPORTS**:
  - `import { useEffect, useState } from "react";`
  - `import { getEngine, type EngineApi } from "@/lib/engine";`
- **GOTCHA**:
  - Do NOT import `engine` directly here — go through `@/lib/engine`. Establishes the convention for Phases 2–4.
  - `autoCapitalize="characters"` matters on Pixel — `pokers` is case-sensitive (`AKo` ≠ `ako`).
  - Mobile keyboards default to autocorrect on text inputs; `autoCorrect="off"` and `spellCheck={false}` prevent `AKo` from being rewritten to "Ako" or "Akon".
  - Do not log to `console`. Surface failures in the DOM.
- **VALIDATE**:
  - Type `AKo` → "12 combos" appears.
  - Type `AA` → "6 combos".
  - Type `JJ+` → "24 combos" (JJ+QQ+KK+AA = 6+6+6+6).
  - Type `xyz` → "not a valid range".
  - Clear input → blank result, no error.

### Task 3: Fix layout metadata and font fallback
- **ACTION**: Update `web/src/app/layout.tsx` and `web/src/app/globals.css`.
- **IMPLEMENT**:
  - In `layout.tsx`: change `metadata` to `{ title: "poker-trainer", description: "Drill poker estimation skills." }`.
  - In `globals.css`: change `body { font-family: Arial, Helvetica, sans-serif; }` to `body { font-family: var(--font-sans), system-ui, sans-serif; }`. The `--font-sans` variable is already declared in the `@theme inline` block.
- **MIRROR**: N/A — small mechanical edits.
- **IMPORTS**: none new.
- **GOTCHA**: Tailwind 4's `@theme inline` declares the variable to Tailwind; the `body` rule must reference `var(--font-sans)` directly or use Tailwind's `font-sans` utility on `<body>`. Either is acceptable; the CSS edit is the lower-blast-radius option.
- **VALIDATE**: View any rendered page; tab title is "poker-trainer". DevTools shows Geist used on `<body>`.

### Task 4: Verify on real Pixel
- **ACTION**: Run `next dev` bound to LAN, open the URL on the Pixel.
- **IMPLEMENT**:
  - From `web/`: `npm run dev -- -H 0.0.0.0` (or use the LAN IP that `next dev` prints).
  - On Pixel Chrome: navigate to `http://<host-ip>:3000`. Confirm "12 combos" renders for the seeded `AKo`.
  - Edit input to `AA`, confirm "6 combos".
  - Reload — confirm `< 3s` time-to-first-estimate target from the PRD success metrics holds.
- **MIRROR**: N/A — manual validation step.
- **IMPORTS**: N/A.
- **GOTCHA**:
  - macOS firewall may block inbound 3000; allow `node` on the prompt or `System Settings → Network → Firewall → Options`.
  - Pixel Chrome must be on the same network. Fallbacks: `chrome://inspect` USB tethering, or Chrome desktop responsive devtools as a proxy.
- **VALIDATE**: Owner can complete 5 input edits back-to-back without obvious lag on Pixel. Stricter performance work is Phase 3.

---

## Testing Strategy

Phase 1 is glue code. The PRD does not require a JS test runner yet, and adding Vitest/Jest belongs with the new equity API in Phase 2 where it can also harness the Rust property tests. **Recommendation: rely on the manual checks in Tasks 2 and 4; add unit tests in Phase 2.**

If a test runner is added later, two cheap unit tests are worth their cost:

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `getEngine` returns same promise on parallel calls | `Promise.all([getEngine(), getEngine()])` | Both resolve to the same object reference | Yes — singleton invariant |
| `countCombos` round-trips known values | `"AA"`, `"AKo"`, `"JJ+"`, `""`, `"xyz"` | `6`, `12`, `24`, `0`, `0` | Yes — empty input, garbage input |

### Edge Cases Checklist (manual)
- [ ] Empty input → blank result, no error
- [ ] Whitespace-only input → blank result
- [ ] Lowercase input (`ako`) → "not a valid range" (don't auto-uppercase silently — owner needs to feel the case-sensitivity)
- [ ] Very long input (1000+ chars) → "not a valid range", no crash
- [ ] Rapid typing → no race condition (`combos` is derived synchronously from `range`, not stored async)
- [ ] WASM fetch fails (offline / 404) → init error rendered, page does not crash
- [ ] Page navigated away mid-init → no React "set state on unmounted component" warning (covered by `cancelled` flag)
- [ ] Two browser tabs open → both work; each loads its own WASM instance (expected)

---

## Validation Commands

### Static Analysis
```bash
cd web && npx tsc --noEmit
```
EXPECT: Zero type errors.

```bash
cd web && npm run lint
```
EXPECT: Zero ESLint errors.

### Rust Engine (sanity, unchanged)
```bash
cd engine && cargo test
```
EXPECT: 2 passed (`pocket_aces_has_six_combos`, `ako_offsuit_has_twelve_combos`). No new tests this phase.

### Production Build
```bash
cd web && npm run build
```
EXPECT: Build succeeds. WASM bundle is referenced as a static asset under `.next/`. No "Module not found: 'engine'" errors.

### Dev Server (local + LAN)
```bash
cd web && npm run dev
# Capture the LAN URL printed by next dev
```
EXPECT:
- Page renders at `http://localhost:3000` in Chrome desktop.
- Page renders at `http://<lan-ip>:3000` on Pixel Chrome.
- DevTools Network tab shows exactly one `engine_bg.wasm` request per page load (~60 KB).
- No console errors. No SSR mismatch warnings.

### Manual Validation (PRD success signal)
- [ ] On Pixel Chrome: page shows "12 combos" for the seeded `AKo` input within 3 seconds of cold load.
- [ ] Typing `AA` shows "6 combos".
- [ ] Typing `JJ+` shows "24 combos".
- [ ] Typing `garbage` shows "not a valid range".
- [ ] Clearing input shows blank result, no error state.
- [ ] Reload triggers a single WASM fetch (visible in Network tab).

---

## Acceptance Criteria
- [ ] `web/src/lib/engine.ts` exists and exports `getEngine()` singleton + typed `EngineApi`
- [ ] `web/src/app/page.tsx` is form-driven; no hardcoded `count_combos` calls
- [ ] PRD success signal verified on Pixel Chrome ("12" rendered for `AKo`)
- [ ] All validation commands pass
- [ ] `metadata.title` no longer says "Create Next App"
- [ ] No `console.log` statements anywhere in `web/src`
- [ ] No regression in `cargo test`

## Completion Checklist
- [ ] Code follows discovered patterns (CANCELLED_EFFECT, ERROR_NARROWING, TYPESCRIPT_NAMING, TAILWIND_LAYOUT)
- [ ] Error handling matches house style (`unknown` → `instanceof Error` narrow → string)
- [ ] No silent failures — invalid range and init failure both render visibly
- [ ] No premature abstractions (engine wrapper exposes only what Phase 1 needs; equity API will be added in Phase 2)
- [ ] No new dependencies added (no test runner, no debounce lib, no animation lib)
- [ ] Self-contained — no questions remaining at implementation time

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Turbopack handles wasm-pack `--target bundler` output differently than webpack | LOW | High (blocks the phase) | Confirmed via Next.js docs that `wasm` is a built-in Turbopack rule and `import.meta.url` asset references are honored. Fallback: `next dev --webpack` is documented in the SWC/edge docs |
| Next.js 16 SSR tries to import `engine` server-side and fails | LOW | Medium | The `"use client"` directive on the page + lazy `getEngine()` inside an effect prevents server-side WASM init |
| `pokers::HandRange::from_strings` panics on a malformed input variant we haven't seen | LOW | Low | The library returns empty hands on garbage in v0.10.0 per its docs; if a panic is observed, defer wrapping with `panic::catch_unwind` to Phase 2 |
| LAN testing on Pixel blocked by macOS firewall | MEDIUM | Low | Documented in Task 4; Chrome desktop responsive devtools is an acceptable fallback for the success signal |
| Hardcoding `useState("AKo")` masks an init bug | LOW | Low | The combo count for `AKo` is `12`, not `0`, so a stale or empty engine API would surface as "not a valid range" rather than the expected number — visible signal |

## Notes

- The codebase has no test runner configured. Phase 1 deliberately stays manual for the JS layer; Phase 2 has the natural cover to add Vitest (or equivalent) for the new equity API.
- The `engine` package depends on `file:../engine/pkg`, so re-running `wasm-pack build --release` will refresh the same install — no `npm install` rerun needed for routine engine changes. This will matter once Phase 2 changes the Rust surface.
- `next.config.ts` has `turbopack.root` set to `path.join(__dirname, "..")`. That's load-bearing for the `file:../engine/pkg` link to work without a workspace package; do not remove it.
- The Phase 1 deliverable is intentionally a smoke test, not a polished UI. Resist the urge to style. Aesthetic pass is Phase 5.
- After Phase 1 lands, the home page will be replaced again in Phase 4 by the actual exercise screen. Treat `page.tsx` as scaffolding — keep it thin.
