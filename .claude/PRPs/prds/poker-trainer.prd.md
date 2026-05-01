# Poker Trainer

## Problem Statement

Building real-time poker math intuition is tedious. Existing options are a static PDF workbook (no extra practice, awkward to use, answers in the back), or "nerds-for-nerds" desktop tools that prioritize rugged correctness over usability and aesthetics. There is no pleasant, mobile, drill-style way to develop close-enough poker estimation that you can actually use at a table.

## Evidence

- Owner is actively working through a PDF on poker math (TOC: Equity Setups, Range Building, Combos, Blockers, Pot Odds, Implied Odds, Breakeven %, Auto-Profit, EV, Open-Raising, Isolating, 3betting, Squeezing, 4betting, Going All-In Preflop) and finds the "static page + answers in the back" loop frustrating.
- Owner reports existing poker apps (PokerStove, Equilab, Flopzilla, GTO solvers, Pokertrainer.se) "sacrifice aesthetics and usability for rugged correctness."
- Owner's mental model of poker is intuition + tolerance, not exact computation. "I'd rather develop the intuition and get told it's close enough."
- Reference design (Elevate) demonstrates that drag-to-estimate with tolerance bands is a viable, pleasant primitive for math-flavored learning.
- Assumption to validate: that this format (drag-to-estimate, single task per screen) actually transfers to live-poker estimation. Will be validated at the table, not in the app.

## Proposed Solution

A web-based, mobile-first poker training prototype where each exercise presents one situation and asks the user to drag a slider to estimate one number (% range, equity, EV, $ amount). The slider has tolerance bands — "close enough" counts. Math is computed by a Rust→WASM engine for correctness; the frontend is Next.js + TypeScript + Tailwind. No accounts, no backend, no auth — single user, single device, this is a prototype to see if the loop is enjoyable enough to sub in for doomscrolling.

The MVP is a single exercise type — **hand-vs-hand pre-flop equity** — built to a finished aesthetic standard. The point of the MVP is not to cover the curriculum; it is to nail the interaction primitive, prove the WASM engine round-trip end to end, and confirm the format is enjoyable. Once that's true, additional exercises from the PDF TOC become incremental work.

## Key Hypothesis

We believe a drag-to-estimate, tolerance-scored poker math app will replace some doomscrolling time and build at-the-table estimation intuition for the owner.
We'll know we're right when the owner has fun using it — measured loosely as: returns to the app voluntarily on multiple separate days during prototype usage, without prompting from a todo list or schedule.

## What We're NOT Building

- **Auth, accounts, cloud sync** — single user, single device, prototype phase only.
- **Backend / database** — client-only; any state lives in `localStorage` or memory.
- **Hand history import / play-an-actual-hand UI** — this is a drill app, not a poker client.
- **Multiplayer / social / leaderboards** — single-user prototype.
- **GTO solver integration** — out of scope; the goal is intuition, not optimal play.
- **Tournament-specific math (ICM, bubble factors)** — cash-game intuition first.
- **Streaks, daily goals, sound effects, heavy gamification** — deferred until after the core loop is proven enjoyable.
- **Progress / scoring persistence beyond the current session** — TBD; not in MVP.
- **iOS / Safari support** — Chrome on Android is the only target during prototype; desktop Chrome is a bonus surface.

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Owner returns voluntarily | ≥ 3 separate days in any 7-day window | Self-reported / ad-hoc |
| MVP exercise feels finished | Owner would not be embarrassed to show a friend | Self-reported / aesthetic gut check |
| Math correctness | 100% of exercise outputs within 0.5% of `pokers`-computed truth | Property tests + spot checks against PokerStove |
| Time-to-first-estimate on cold load | < 3s on Pixel + Chrome | Manual timing |
| WASM bundle size | < 80 KB gzipped | `wasm-pack build --release` (currently 60 KB) |

## Open Questions

- [ ] How to score "close enough" on EV exercises (unbounded, signed) vs. % exercises (bounded 0–100). Defer until exercises beyond hand-vs-hand are added.
- [ ] Whether each exercise gets a bespoke screen or whether 2–3 interaction primitives cover all 15 exercise types. MVP intentionally builds only one primitive; revisit when the second exercise type lands.
- [ ] Whether multi-input exercises (e.g. range vs. range with a specific board) need progressive disclosure within one screen or should be split into separate exercises that train each input in isolation. Out of MVP scope.
- [ ] Drilling order: shuffled, curriculum-ordered, or weighted by recent performance. Out of MVP scope.
- [ ] Tolerance-band tuning per exercise type — needs play-testing.

---

## Users & Context

**Primary User**
- **Who**: The owner, building poker estimation intuition as a hobby. Comfortable with poker terminology, working through a poker math PDF.
- **Current behavior**: Reads the PDF, attempts problems, checks answers in the back. Doomscrolls when bored.
- **Trigger**: Bored on the couch, taking a work break, or listening to an audiobook and wanting a low-stakes second screen.
- **Success state**: Reaches for this app instead of social feeds; later, surprises themself with on-the-fly estimation at a real poker table.

**Job to Be Done**
When I'm bored, I want to do some fun poker math problems, so I can be less bored and have more fun the next time I'm playing poker.

**Non-Users**
- **Poker pros / solver-driven players** — they need precision and breadth this prototype intentionally won't deliver.
- **Total beginners** — no onboarding, no rules explanation, assumes hold'em fluency.
- **Players who view poker as pure luck or pure people-reading** — the math-is-interesting premise will not resonate.

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | Drag-to-estimate slider primitive with tolerance feedback | The whole interaction premise |
| Must | Provably-correct hand-vs-hand pre-flop equity via WASM engine | Trust in the answers is non-negotiable |
| Must | Mobile-first aesthetic comparable to Elevate (typography, palette, motion) | Differentiator vs. existing nerd-tools |
| Should | Additional exercise types from the PDF TOC | Variety post-MVP |
| Won't | Auth, accounts, backend, sync, streaks, leaderboards, iOS support | Explicitly deferred |

### MVP Scope

**One exercise: pre-flop hand-vs-hand equity.**

Format: app shows two specific hold'em hands (e.g. `A♠K♠` vs `Q♥Q♦`), user drags a slider to estimate the equity % of the first hand. Slider has a tolerance band centered on truth; landing inside the band counts as correct. Equity is computed in Rust via `pokers` and exposed through WASM.

This single exercise must hit:
- Round-trip with the WASM engine (proves the platform)
- Drag-to-estimate primitive (proves the interaction)
- Finished aesthetic (proves the design intent)

### User Flow

1. Open app on phone — instantly land in the exercise (no menus, no auth)
2. See two hands and the prompt: "What's the equity of [Hand A]?"
3. Drag slider up/down a vertical number line (0–100%)
4. Release — feedback animates: tolerance band reveals, true answer highlighted, "close enough" / "not quite" verdict
5. Tap or swipe → next problem

No back navigation, no settings, no chrome. One thing per screen.

---

## Technical Approach

**Feasibility**: HIGH for the math, LOW–MEDIUM for the UX (single net-new component to build well).

**Stack (locked, prior decisions)**
- **Engine**: Rust (`engine/`), `pokers` v0.10.0, `wasm-bindgen` → WASM. Currently exposes `count_combos`. Build verified, 60 KB bundle.
- **Frontend**: Next.js 15 + TypeScript + Tailwind under `web/` (npm). Stock scaffold, no integrations yet.
- **No backend**.
- **Target platform**: Chrome on Android (Pixel). Desktop Chrome supported as a bonus. iOS deferred.

**Architecture Notes**
- Pure-arithmetic exercises (pot odds, breakeven %, EV given inputs) live in TypeScript — faster iteration, no WASM round-trip needed.
- Combinatorial / equity / range exercises route through the WASM engine.
- WASM module loaded once at app start; warmed before first interaction.
- Estimation slider is a custom React component using the Pointer Events API. No drag library dependency in MVP; revisit if we need shared physics across multiple primitives.
- State management: React local state + URL params for shareable problem seeds. No global store in MVP.
- Property-based tests on the Rust side cross-check engine outputs against `pokers` directly to catch any wrapper bugs.

**Technical Risks**

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Drag interaction feels janky on phone | LOW | Pointer Events API on Chrome/Android is well-behaved; build slider primitive first and test on real Pixel before stacking other work |
| Tolerance bands feel wrong (too easy / too hard) | MEDIUM | Per-exercise config; iterate based on personal feel; not a code risk, just play-testing |
| Math correctness drift between exercises and PDF expected answers | MEDIUM | Property tests, spot checks against PokerStove for the MVP exercise |
| Scope creep into "let's add one more exercise" before the primitive is finished | MEDIUM | MVP gate: one exercise, finished, before any second exercise is started |

---

## Implementation Phases

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| 1 | WASM bridge | Wire `engine/pkg/` into the Next.js app; "type AKo → 12" smoke test renders in the browser | complete | - | - | [plan](.claude/PRPs/plans/completed/wasm-bridge.plan.md) · [report](.claude/PRPs/reports/wasm-bridge-report.md) |
| 2 | Equity engine API | Expose `equity_vs(hand_a, hand_b)` from Rust via wasm-bindgen; property test against `pokers` | complete | - | - | [plan](.claude/PRPs/plans/completed/equity-engine-api.plan.md) · [report](.claude/PRPs/reports/equity-engine-api-report.md) |
| 3 | Estimation slider primitive | Vertical drag-to-estimate React component with tolerance bands, Pointer Events, mobile-tested | in-progress | - | - | [plan](.claude/PRPs/plans/estimation-slider-primitive.plan.md) |
| 4 | Exercise screen | Compose hand display + slider + feedback animation into one screen; URL-seeded problems | pending | - | 1, 2, 3 | - |
| 5 | Aesthetic pass | Typography, palette, motion, spacing — Elevate-grade finish on the single exercise | pending | - | 4 | - |

### Phase Details

**Phase 1: WASM bridge**
- **Goal**: Prove end-to-end round-trip from Rust → WASM → Next.js renders in Chrome.
- **Scope**: Import `engine/pkg/` into `web/`; render `count_combos("AKo")` in a smoke-test page; configure Next.js for WASM if needed.
- **Success signal**: Open page on Pixel, see "12" rendered.

**Phase 2: Equity engine API**
- **Goal**: A correctly computed pre-flop hand-vs-hand equity number, exposed to JS.
- **Scope**: Rust function `equity_vs(hand_a: &str, hand_b: &str) -> f32` using `pokers`; property tests asserting outputs match `pokers` direct calls; rebuild `pkg/`.
- **Success signal**: `cargo test` green; JS call returns ~0.46 for `AsKs vs QhQd` (suited AK vs QQ; the offsuit AKo vs QQ is ~0.43).

**Phase 3: Estimation slider primitive**
- **Goal**: A vertical drag-to-estimate slider that feels good on Chrome/Android.
- **Scope**: React component, Pointer Events, configurable tolerance band, reveal-on-release feedback, anchor tick marks. No exercise content yet.
- **Success signal**: Slider scrubs smoothly on Pixel, releases to a value, shows the tolerance band animation.

**Phase 4: Exercise screen**
- **Goal**: Compose the hand-vs-hand exercise as a complete screen.
- **Scope**: Card visualization, problem prompt, slider, feedback state machine, "next problem" gesture. Problem seed in URL so problems are reproducible and shareable.
- **Success signal**: Owner can complete 5 problems back-to-back without thinking about the app, only the math.

**Phase 5: Aesthetic pass**
- **Goal**: The exercise looks and feels finished — not a wireframe.
- **Scope**: Typography pairing, palette, micro-animations on slider release, card art treatment, spacing rhythm, dark/light decision. Reference: Elevate.
- **Success signal**: Owner would show this to a friend without apologizing.

### Parallelism Notes

Phases 2 and 3 are independent and can run in parallel — phase 2 is engine-side Rust work, phase 3 is frontend-side React work. Phases 1, 4, and 5 are sequential dependencies.

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Engine library | `pokers` v0.10.0 | `rust-poker` | Documented fallback; chosen prior session; covers ranges + Monte Carlo equity |
| Frontend framework | Next.js 15 | Vite + React, plain React | Locked in prior session; chosen for routing + ease of WASM integration |
| Package manager | npm | pnpm, bun | Used `--use-npm` in initial scaffold |
| Target browser | Chrome on Android (Pixel) | Cross-browser, iOS Safari | Owner's primary device; cuts UX risk; iOS deferred |
| Scope | Single exercise, polished | All 15 exercises, rough | MVP must prove the interaction primitive end-to-end before breadth |
| Math location | Rust/WASM for combinatorial; TS for arithmetic | All Rust, all TS | Match each tool to its strength; minimize WASM round-trips for trivial calc |
| State | Local + URL | Global store (Zustand etc.) | YAGNI for prototype |

---

## Research Summary

**Market Context**
- Existing poker tools split into "solver/calculator" (Equilab, Flopzilla, GTO Wizard, PokerStove, PioSolver) and "video/quiz course" (Run It Once, Upswing, Raise Your Edge). Pokertrainer.se is the closest existing exercise app, but utilitarian and dated.
- No existing app in the poker space has adopted an Elevate-style estimation aesthetic. Differentiation is primarily UX, not math.
- Estimation-with-tolerance as a learning primitive (Elevate, Peak, Lumosity) is well-validated for general math; transfer to poker is the unproven assumption.

**Technical Context**
- Codebase exists at baseline: `engine/` builds cleanly with one stub function, `web/` is a stock Next.js 15 scaffold. No WASM↔frontend wiring yet. No exercise UI yet.
- `pokers` v0.10.0 covers everything in the PDF TOC except possibly some board-aware combinatorics; flag if/when those exercises land.
- WASM bundle is 60 KB, well under the 80 KB microsite JS budget from `web/performance.md`.
- Chrome on Android removes essentially all of the touch / drag risk that would apply on iOS Safari.

---

*Generated: 2026-04-29T04:43:27Z*
*Status: DRAFT — needs validation by building Phase 1*
