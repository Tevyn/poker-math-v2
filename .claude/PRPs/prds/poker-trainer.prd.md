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

1. Open app on phone — instantly land in the exercise (no menus, no auth).
2. **Idle state.** Light theme. Two hands stacked at center stage. Dotted vertical equity axis at left edge (0/20/40/60/80/100, square tick markers + labels). Horizontal light-purple/grey control bar at bottom: "drag to estimate equity ↑".
3. **Dragging state.** Touch+drag the bottom bar upward. White background fades to a dark-grey semi-transparent overlay (hands recede into background). The bottom bar becomes a solid cyan bar spanning the screen width. As the user drags up/down, a small cyan pointer arrow tracks the dotted axis on the left, indicating the current selected % on the scale.
4. **Release.**
   - **In tolerance (±10%):** screen flashes bright green; "bullseye"/"nice" copy appears just above the cyan bar; white pointed-speech-bubble tooltip drops down from the cyan bar reading **"ACTUAL EQUITY"** with the exact percentage in massive bold type; minimalist geometric "firework" bursts (small squares + triangles) radiate from center.
   - **Out of tolerance:** screen fades to a soft grey; non-committal encouraging copy ("maybe next time", "close-ish") above the cyan bar; same speech-bubble tooltip with **"ACTUAL EQUITY"**; no fireworks.
5. **Auto-advance.** After ~1–2 seconds the next problem fades in. No tap required.

No back navigation, no settings, no chrome. One thing per screen.

### UI Spec (Elevate-derived)

Reference: Elevate's estimation gameplay loop. Adapted to hold'em equity.

**A. Layout (idle)**
- **Left edge — Y-axis.** Vertical dotted line. Square tick markers at 0, 20, 40, 60, 80, 100. Numeric labels next to each marker. Subtle, low-contrast in idle state.
- **Center stage.** Two hold'em hands stacked vertically. Cards rendered as simple vertical rectangles — rank character + suit symbol only. Large, dark-grey type. No card art, no gradients, no shadows beyond what the design system already defines.
- **Bottom edge — control.** Horizontal light-purple/grey block, full width minus standard gutter. Centered prompt copy: "drag to estimate equity" with an upward arrow glyph.

**B. Dragging**
- White background instantly transitions to a dark semi-transparent overlay (~70% black). Hands fade to background-layer opacity.
- The bottom bar transforms into a solid cyan bar spanning the full screen width, vertically tracking the user's finger.
- Small cyan pointer arrow anchors to the dotted Y-axis at the height matching the bar — indicates the currently estimated % on the scale.
- Y-axis tick labels increase contrast while dragging (they are the only readable text besides the cyan elements).

**C. Release — success (estimate within ±10% of truth)**
- Background flashes bright green (single-frame flash, then settles).
- Cyan bar remains at release position.
- Encouraging copy ("bullseye", "nice") appears just above the cyan bar.
- White speech-bubble tooltip drops from the cyan bar: **"ACTUAL EQUITY"** label + massive bold percentage (e.g. **46.3%**).
- Geometric firework bursts (small squares + triangles, no curves, no particle physics) radiate outward from screen center. Short — under 600ms.

**D. Release — miss (estimate outside ±10%)**
- Background settles to a soft neutral grey (no green flash, no fireworks).
- Cyan bar remains at release position.
- Non-committal encouraging copy ("maybe next time", "close-ish") above the cyan bar.
- Same white **"ACTUAL EQUITY"** speech-bubble tooltip drops from the cyan bar.

**E. Transition**
- After ~1.2s on success, ~1.8s on miss (tunable), the screen cross-fades to the next problem. No tap. No "next" button.

**F. Motion principles**
- Compositor-only properties (`transform`, `opacity`, `clip-path`). No animated layout properties.
- Reduced-motion respected: all flashes/fireworks/cross-fades degrade to instant or near-instant transitions.
- Total release-to-next-problem cycle stays under 2 seconds so the loop feels tight.

**G. Palette (Elevate-derived, to be tuned)**
- Surface: near-white (idle), near-black ~70% alpha (dragging overlay), bright green (success flash), neutral grey (miss settle).
- Accent: cyan for the active bar + axis pointer.
- Text: dark grey on light, white on dark overlay.
- Tolerance band is implicit (±10% of truth), not visualized as a band on the axis.

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
| 3 | Estimation slider primitive | Vertical drag-to-estimate React component with tolerance bands, Pointer Events, mobile-tested | complete | - | - | [plan](.claude/PRPs/plans/completed/estimation-slider-primitive.plan.md) · [report](.claude/PRPs/reports/estimation-slider-primitive-report.md) |
| 4 | Exercise screen | Compose hand display + slider + feedback animation into one screen; URL-seeded problems | complete | - | 1, 2, 3 | [plan](.claude/PRPs/plans/completed/exercise-screen.plan.md) · [report](.claude/PRPs/reports/exercise-screen-report.md) |
| 5 | Elevate-style UI rebuild | Replace vertical-track slider with bottom-bar-lift interaction; rebuild screen to match Elevate gameplay layout (idle / dragging / success / miss states) | complete | - | 4 | [plan](.claude/PRPs/plans/completed/elevate-style-ui-rebuild.plan.md) · [report](.claude/PRPs/reports/elevate-style-ui-rebuild-report.md) |
| 6 | Second exercise (Pot Odds) + config-driven shell | Refactor `ExerciseScreen` into a shell driven by an `Exercise<TProblem>` definition; ship Pot Odds as the second exercise to pressure-test reuse and resolve the bespoke-vs-shared open question | complete | - | 5 | [plan](.claude/PRPs/plans/completed/second-exercise-pot-odds.plan.md) · [report](.claude/PRPs/reports/second-exercise-pot-odds-report.md) |
| 7 | Visual polish pass | Tighten the shared exercise shell after first round of hands-on use: drag-bar layering + tolerance-sized height, lighter dragging overlay, denser Y-axis hatches, card chrome on equity, Hero/Villain copy, "Breakeven %" rename, axis pointer removal, longer reveal dwell | in-progress | - | 6 | [plan](.claude/PRPs/plans/visual-polish-pass.plan.md) |

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

**Phase 5: Elevate-style UI rebuild**
- **Goal**: The exercise matches the Elevate gameplay aesthetic and interaction model end-to-end. Not a polish pass on the existing layout — a rebuild of the slider primitive and the screen composition to the spec in **UI Spec (Elevate-derived)** above.
- **Scope**:
  - Replace the existing vertical-track `EstimationSlider` interaction with a bottom-bar-that-lifts-into-a-cyan-bar primitive. The primitive still emits `(value, isWithinTolerance)` on release; only the surface and gesture change.
  - Add the dotted Y-axis (0/20/40/60/80/100 with square markers + labels) on the left edge.
  - Replace `PlayingCard` rendering with simplified vertical rank+suit rectangles per the spec.
  - Implement the four states (idle, dragging, success, miss) with the described background, cyan bar, axis pointer, copy, and tooltip behaviors.
  - Tolerance hard-coded to ±10% for hand-vs-hand equity (config knob, not magic number).
  - "ACTUAL EQUITY" speech-bubble tooltip component.
  - Geometric firework burst on success (squares + triangles, compositor-only motion, ≤ 600ms).
  - Auto-advance to next problem after ~1.2s success / ~1.8s miss.
  - Reduced-motion path: instant transitions, no fireworks.
- **Success signal**: Side-by-side with the Elevate reference video, the loop reads as the same primitive applied to poker. Owner would show this to a friend without apologizing.
- **Out of phase scope**: Multiple exercise types, additional tolerance schemes, miss-vs-bullseye gradient (binary green/grey only), settings, score persistence.

**Phase 7: Visual polish pass**
- **Goal**: Tighten the shared exercise shell after first round of hands-on play. No new exercises, no new primitives — every item refines a component that already shipped.
- **Scope** (each item must be addressed; all live in the shared shell so the change applies to both Equity and Pot Odds / Breakeven % screens):
  1. **Drag bar z-order.** The cyan drag bar should render *behind* the hands / problem content while remaining the active drag target. The bar is currently visually occluding the problem during dragging; pointer events stay on the bar but it should not paint over the prompt content.
  2. **Drag bar height = tolerance band.** The cyan bar's height in axis units equals `2 × tolerance`. With ±10% tolerance, the bar spans 20% of the axis height. The bar is the tolerance band — make that legible by construction rather than having a separate band visualization.
  3. **Lighter dragging overlay.** Reduce the dark overlay opacity to roughly a quarter of its current value. The hands should remain readable through the overlay; current opacity reads as "modal" rather than "ambient dim."
  4. **Denser Y-axis hatches.** Keep current labeled tick marks every 10% (0, 10, 20, …, 100) and add an unlabeled minor tick at every 5% (5, 15, 25, …, 95). Minor ticks are visually lighter / shorter than labeled ones.
  5. **Card chrome on Equity screen.** Each hand card gets a thin outline and subtle drop shadow so it reads as a physical card rather than flat type. Pot Odds / Breakeven % screen is unaffected (it has no cards).
  6. **Hero / Villain copy.** Replace "Hand A" / "Hand B" labels with "Hero" / "Villain" everywhere they appear (equity exercise prompt, any helper text). This is the standard poker convention and what the owner thinks in.
  7. **Rename Pot Odds → Breakeven %.** The exercise type currently registered as "pot odds" is presented to the user as "Breakeven %." Update display strings, route slug if user-visible, and any in-app copy. Internal symbol names may stay or be renamed at the implementer's discretion — user-facing strings are the requirement.
  8. **Remove axis pointer triangle.** The small cyan triangle / arrow that tracks the Y-axis during dragging is removed. The cyan bar itself is the indicator.
  9. **Longer reveal dwell.** Add ~1 second to both success and miss dwell times before auto-advance (success ~1.2s → ~2.2s, miss ~1.8s → ~2.8s; tune by feel). The current cycle reads as too fast to actually absorb the actual-equity number.
- **Success signal**: Owner can play a session of mixed Equity + Breakeven % problems and report nothing visually distracting; specifically, the drag bar no longer feels like an opaque guillotine over the problem, and "actual equity" registers before the screen advances.
- **Out of phase scope**: New exercise types, animation system overhaul, theme work, accessibility audit, persisted scoring.

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
| UI direction | Elevate gameplay aesthetic, literal port | Bespoke poker-themed visual language | Elevate's drag-to-estimate is the validated primitive; differentiation is in *applying* it to poker, not in reinventing the chrome around it |
| Slider gesture | Bottom-bar lifts into cyan bar w/ Y-axis pointer | Vertical track w/ thumb (current Phase 3 build) | Matches Elevate; one-thumb reach on phone; isolates gameplay from idle screen visually |
| Tolerance band visualization | Implicit (binary success/miss only) | Visible band on axis (current Phase 3 build) | Elevate doesn't reveal the band; the lesson is the *answer*, not the band geometry |
| Success/miss states | Binary (green flash + fireworks vs. grey settle) | Graded (bullseye / close / off) | Simpler to tune; matches Elevate; revisit if the binary feels too punishing |

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
*Updated: 2026-05-01 — Phase 5 rewritten as Elevate-style UI rebuild; UI Spec section added*
*Updated: 2026-05-02 — Phase 5 marked complete; Phase 6 added (second exercise + config-driven shell)*
*Updated: 2026-05-02 — Phase 6 marked complete; Phase 7 added (visual polish pass from first hands-on session)*
*Updated: 2026-05-02 — Phase 7 marked complete; report at `.claude/PRPs/reports/visual-polish-pass-report.md`*
*Status: Phases 1–7 complete*
