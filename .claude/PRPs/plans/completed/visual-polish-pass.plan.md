# Plan: Visual Polish Pass (Phase 7)

## Summary
Tighten the shared exercise shell after the first hands-on session. No new exercises, no new primitives — every change refines a component that already shipped (`ExerciseScreen`, `EstimationBar`, `Axis`, `PlayingCard`, exercise definitions, global tokens). Nine concrete tweaks in one pass: drag-bar layering, tolerance-sized bar height, lighter overlay, denser axis hatches, card chrome on Equity, Hero/Villain copy, "Pot Odds" → "Breakeven %" rename, axis-pointer removal, and longer reveal dwell.

## User Story
As the project owner, I want the shell I'm already drilling on to feel less visually distracting and more legible, so that I can absorb the actual answer before auto-advance, and so a mixed Equity + Breakeven % session reads as one polished product rather than two prototypes.

## Problem → Solution
**Current state:** Phase 6 shipped a working two-exercise shell. After play-testing: the cyan bar visually occludes the problem during dragging (looks like a guillotine), tolerance is invisible (binary success/miss arrives without warning), the dragging overlay reads as "modal" instead of "ambient dim", the axis only marks every 20% so estimating odd values is imprecise, the equity hands look like flat type rather than cards, the prompt says "Hand A / Hand B" instead of poker-standard "Hero / Villain", the second exercise is presented as "pot odds" when the actual learning unit is "breakeven %", a redundant cyan triangle tracks the axis even though the cyan bar is already an indicator, and the reveal dwell auto-advances before the actual-equity number can register.

**Desired state:** Cyan bar paints behind the stage content while remaining the drag target. Bar height in axis units = `2 × tolerance` (so the bar *is* the tolerance band — ±10% → 20% of axis height for equity, ±5% → 10% for breakeven). Overlay opacity ~25% of current. Axis adds unlabeled minor ticks at every 5%. Equity cards get a thin border + subtle shadow (Breakeven screen unaffected). All user-facing "Hand A/B" copy → "Hero/Villain". User-facing "Pot Odds" / "pot odds" → "Breakeven %" / "breakeven %". Axis pointer triangle removed. Success dwell 1.2s → 2.2s, miss 1.8s → 2.8s.

## Metadata
- **Complexity**: Medium
- **Source PRD**: `.claude/PRPs/prds/poker-trainer.prd.md`
- **PRD Phase**: Phase 7 — Visual polish pass
- **Estimated Files**: ~10 changed, 0 new, 0 deleted

---

## UX Design

### Before (during drag, equity)
```
┌────────────────────────────────────┐
│  What's the equity of Hand A?      │
│ ┃ 100                              │
│ ┃ 80                               │
│ ┃ 60   ▶ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← cyan bar (12px) covers cards
│ ┃ 40                               │
│ ┃ 20    [hands faded behind 70%]   │
│ ┃ 0     dark overlay — barely      │
│         legible                    │
└────────────────────────────────────┘
```

### After (during drag, equity, ±10% tolerance)
```
┌────────────────────────────────────┐
│  What's the equity of Hero?        │
│ ┃ 100                              │
│ ┃ 95 ·                             │
│ ┃ 90                               │
│ ┃ 85 ·  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ┐│
│ ┃ 80    ▓▓ Hero (A♠ K♠) [card]  ▓│  ← bar = 20% axis height,
│ ┃ 75 ·  ▓▓                      ▓│    paints BEHIND stage
│ ┃ 70    ▓▓ Villain (Q♥ Q♦)[card]▓│    (stage stays readable
│ ┃ 65 ·  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ┘│    through ~17% overlay)
│ ┃ 60                               │
│ ┃ 55 ·                             │
│ ┃ 50                               │
│ ┃ 45 ·                             │
│ ┃ 40                               │
│ ┃ 35 ·                             │
│ ┃ 30                               │
│ ┃ 25 ·                             │
│ ┃ 20                               │
│ ┃ 15 ·                             │
│ ┃ 10                               │
│ ┃ 5  ·                             │
│ ┃ 0                                │
└────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Cyan bar z-order | In front of stage | Behind stage, in front of overlay | Pointer events stay on the bar wrapper — only paint order changes |
| Cyan bar height | Fixed 48px (`h-12`) | `2 × tolerance` of axis height (e.g. 20% for ±10) | Bar IS the tolerance band |
| Dragging overlay | `oklch(15% 0 0 / 0.7)` | `oklch(15% 0 0 / 0.18)` | ~¼ of current alpha |
| Y-axis ticks | 0/20/40/60/80/100 | Add minor unlabeled ticks at 5/15/25/…/95 | Major ticks unchanged |
| Equity cards | Flat rank+suit type | Add border + subtle drop shadow | Breakeven stage unaffected |
| Equity prompt | "What's the equity of Hand A?" | "What's the equity of Hero?" | |
| Hero label | "Hand A" / "Hand B" (none rendered visibly) | "HERO" / "VILLAIN" caption above each hand | New small labels above each `HandDisplay` |
| Exercise display name | "pot odds" / "Required equity" | "breakeven %" / "Breakeven %" | Bar prompt + tooltip label + URL slug |
| Axis pointer triangle | Cyan triangle tracks axis during drag | Removed entirely | Bar position is the indicator |
| Success dwell | 1200ms | 2200ms | |
| Miss dwell | 1800ms | 2800ms | |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `web/src/components/exercise/ExerciseScreen.tsx` | 1-247 | Compositional shell — z-order, overlay, tooltip placement live here |
| P0 | `web/src/components/estimation-bar/EstimationBar.tsx` | 1-167 | Cyan bar element to resize and reorder; idle bar stays on top |
| P0 | `web/src/components/axis/Axis.tsx` | 1-99 | Major ticks + axis pointer; minor ticks added here, pointer removed here |
| P0 | `web/src/components/exercise/exerciseConfig.ts` | 1-7 | Dwell timing constants |
| P0 | `web/src/exercises/equity/exercise.ts` | 1-33 | Prompt + tooltip + bar prompt copy |
| P0 | `web/src/exercises/pot-odds/exercise.ts` | 1-33 | Prompt + tooltip + bar prompt copy + URL `type` slug |
| P0 | `web/src/exercises/equity/PlayingCard.tsx` | 1-43 | Card chrome (border + shadow) |
| P0 | `web/src/exercises/equity/EquityStage.tsx` | 1-19 | Hero/Villain captions added around `HandDisplay` |
| P0 | `web/src/app/globals.css` | 1-35 | `--color-overlay` token; (optionally) new card token |
| P1 | `web/src/components/exercise/ExerciseScreen.test.tsx` | 153-183 | Pot-odds tests reference `type=pot-odds` and "drag to estimate pot odds" — update copy/route |
| P1 | `web/src/exercises/registry.ts` | 1-17 | Lookup by `type`; if URL slug renames, defaults still work |
| P1 | `web/src/exercises/pot-odds/exercise.test.ts` | all | Asserts `type` value; update if slug renamed |
| P2 | `web/src/components/axis/Axis.test.tsx` | 1-42 | Major-tick count; new minor-tick assertions added here |
| P2 | `web/src/components/feedback/ActualValueTooltip.tsx` | 1-53 | Tooltip already takes `label` prop — no change needed, just verify |
| P2 | `web/src/lib/sliderMath.ts` | 1-58 | `fractionFromValue` available for axis-percentage math |

## External Documentation
No external research needed — this is a polish pass on established internal patterns (Tailwind utility classes, CSS custom properties, React component composition with z-index via stacking contexts).

---

## Patterns to Mirror

### CSS_TOKEN_DEFINITION
// SOURCE: web/src/app/globals.css:8-18
```css
@theme inline {
  --color-cyan-bar: oklch(74% 0.15 220);
  --color-success-flash: oklch(78% 0.22 145);
  --color-miss-settle: oklch(88% 0 0);
  --color-overlay: oklch(15% 0 0 / 0.7);
  --color-control-idle: oklch(88% 0.04 290);
}
```
New colors / opacity tweaks live in this block. Tailwind v4 `bg-(--var-name)` arbitrary-value syntax already in use at `EstimationBar.tsx:136,154`.

### EXERCISE_CONFIG_SHAPE
// SOURCE: web/src/exercises/equity/exercise.ts:8-33
```ts
export const equityExercise: Exercise<HandPair> = {
  type: "equity",
  prompt: "What's the equity of Hand A?",
  tooltipLabel: "Actual Equity",
  barPrompt: "drag to estimate equity",
  tolerance: EQUITY_TOLERANCE,
  axisAnchors: EQUITY_ANCHORS,
  formatValue: (n) => `${n.toFixed(1)}%`,
  // ...
};
```
Copy lives on the exercise definition object. Updating user-facing strings = editing this object.

### COMPONENT_DATA_ATTRS
// SOURCE: web/src/components/axis/Axis.tsx:34-37, 50-56
```tsx
<div data-testid="axis" data-mode={mode} className="relative h-full w-12 select-none">
  ...
  <div data-axis-tick className="absolute left-0 flex items-center gap-2" ...>
```
Test hooks use `data-*` attributes (`data-testid`, `data-axis-tick`, `data-axis-pointer`). New minor ticks must follow the same pattern (`data-axis-tick-minor`).

### REDUCED_MOTION
// SOURCE: web/src/components/axis/Axis.tsx:21-31, web/src/components/estimation-bar/EstimationBar.tsx:51-53
```tsx
const reducedMotion = useReducedMotion();
const transitionDuration = reducedMotion ? "0ms" : "200ms";
```
Every animated/transitioning property checks `useReducedMotion()`. New transitions follow the same pattern.

### ABSOLUTE_LAYERING
// SOURCE: web/src/components/exercise/ExerciseScreen.tsx:142-216
```tsx
<main className="relative h-screen w-screen overflow-hidden">
  <h1 className="absolute ..." />              {/* prompt */}
  <div className="absolute bottom-24 left-4 top-20 w-12"> {/* axis */}
  <div className="absolute inset-0 ..."> {/* stage */}
  {/* tooltip */}
  {/* fireworks */}
  <div aria-hidden className="pointer-events-none absolute inset-0" /> {/* overlay */}
  <EstimationBar ... />                          {/* bar wrapper, full-bleed */}
</main>
```
Stack order is determined by DOM order (no z-index). To put the cyan bar BEHIND the stage we either (a) reorder DOM children so the bar is rendered first, or (b) introduce explicit `z-` classes. Approach: reorder + use explicit `z-` to keep intent legible — see Task 1.

### URL_TYPE_REGISTRY
// SOURCE: web/src/exercises/registry.ts:5-16, web/src/components/exercise/ExerciseScreen.tsx:55-78
```ts
const exercise = useMemo<Exercise<unknown>>(
  () => getExerciseByType(searchParams.get("type")),
  [searchParams],
);
```
Exercise lookup is by `exercise.type` string. Renaming the slug (e.g. `pot-odds` → `breakeven`) requires URL serialization to use the new slug; default fallback is exercises[0] (equity) which is unaffected.

### TEST_STRUCTURE
// SOURCE: web/src/components/exercise/ExerciseScreen.test.tsx:99-130
```ts
it("transitions idle → dragging → miss on a release outside tolerance", async () => {
  render(<ExerciseScreen />);
  await screen.findByText(/equity of Hand A/i);
  // ...
  fireEvent.pointerDown(slider, { pointerId: 1, clientY: 780 });
  fireEvent.pointerUp(slider, { pointerId: 1, clientY: 0 });
  expect(root.getAttribute("data-screen-phase")).toBe("miss");
});
```
Tests use Testing Library + `fireEvent` for pointer flow. Copy assertions use `findByText(/regex/i)`. Updates to user-facing strings require updating these regexes.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `web/src/components/exercise/exerciseConfig.ts` | UPDATE | Bump dwell constants (1200→2200, 1800→2800) |
| `web/src/app/globals.css` | UPDATE | Lighten `--color-overlay` alpha; add `--color-card-border`/shadow tokens if needed |
| `web/src/components/axis/Axis.tsx` | UPDATE | Add minor ticks at 5/15/…/95; remove axis-pointer triangle block |
| `web/src/components/axis/Axis.test.tsx` | UPDATE | Drop pointer-rendering tests; add minor-tick render test |
| `web/src/components/estimation-bar/EstimationBar.tsx` | UPDATE | Active bar height becomes a function of `tolerance` (`2 × tolerance / (max - min)` of wrapper height) |
| `web/src/components/exercise/ExerciseScreen.tsx` | UPDATE | Reorder DOM so cyan bar paints behind stage; drop `pointerValue` prop on `<Axis>` |
| `web/src/exercises/equity/exercise.ts` | UPDATE | Prompt copy "Hand A" → "Hero" |
| `web/src/exercises/equity/EquityStage.tsx` | UPDATE | Add HERO / VILLAIN small captions above each `HandDisplay` |
| `web/src/exercises/equity/PlayingCard.tsx` | UPDATE | Add border + drop-shadow utility classes |
| `web/src/exercises/pot-odds/exercise.ts` | UPDATE | `type` slug, prompt, tooltip label, bar prompt → "breakeven %" / "Breakeven %" |
| `web/src/exercises/pot-odds/exercise.test.ts` | UPDATE | Update `type` assertion if slug renamed |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | UPDATE | Update copy regexes to "Hero", "breakeven", new URL slug |

## NOT Building
- New exercise types or new primitives (this is polish on what exists).
- Animation system overhaul (no GSAP, no spring physics — keep CSS transitions on `opacity` / `top`).
- Theme work, dark-mode, or any redesign of palette beyond the overlay tweak.
- Accessibility audit (existing `aria-*` attributes preserved; no new flow added).
- Persisted scoring or session metrics.
- Internal symbol renames for `pot-odds` → `breakeven` beyond the user-facing slug + copy. The folder, file names, and TS exports may stay `potOdds` / `pot-odds` to keep the diff small (per PRD: "Internal symbol names may stay or be renamed at the implementer's discretion").
- New tolerance-band visualization separate from the bar itself. The bar IS the band.
- Backwards-compatibility shim for the old `?type=pot-odds` URL — single-user prototype, no deployed users.

---

## Step-by-Step Tasks

### Task 1: Bump dwell timing
- **ACTION**: Update `SUCCESS_HOLD_MS` and `MISS_HOLD_MS` in `exerciseConfig.ts`.
- **IMPLEMENT**:
  ```ts
  export const SUCCESS_HOLD_MS = 2200;
  export const MISS_HOLD_MS = 2800;
  ```
- **MIRROR**: existing file shape (constants only).
- **IMPORTS**: none.
- **GOTCHA**: `ExerciseScreen.test.tsx` uses `vi.advanceTimersByTime(SUCCESS_HOLD_MS)` — already imports the constant, so no test breakage from the value change.
- **VALIDATE**: `npm test -- exerciseConfig` (no test exists for the file itself; verify via `ExerciseScreen.test.tsx`).

### Task 2: Lighten dragging overlay
- **ACTION**: Reduce `--color-overlay` alpha to ~¼ of current (0.7 → 0.18) in `globals.css`.
- **IMPLEMENT**:
  ```css
  --color-overlay: oklch(15% 0 0 / 0.18);
  ```
- **MIRROR**: existing token definition syntax (CSS_TOKEN_DEFINITION pattern).
- **IMPORTS**: none.
- **GOTCHA**: `Axis.tsx:25-30` switches tick + label colors to bright (zinc-100) when `mode==="dragging"`, assuming a dark overlay. With a lighter overlay, those colors will look washed-out. Switch the dragging palette back to medium-contrast zinc tones (e.g. `text-zinc-600` / `bg-zinc-500` / `border-zinc-400`) so axis is still legible against ~17% black. Verify by eye in the dev server.
- **VALIDATE**: `npm run dev`; drag the bar; hands should remain clearly readable through the overlay; axis ticks should still read.

### Task 3: Add minor axis ticks
- **ACTION**: Render unlabeled minor ticks at 5/15/25/35/45/55/65/75/85/95 in `Axis.tsx`.
- **IMPLEMENT**:
  - Compute the minor positions inside the component: `const minors = values.flatMap((v, i) => i === 0 ? [] : [v - (values[i] - values[i-1]) / 2])` — i.e. midpoints between consecutive `values`. For `[0,20,40,60,80,100]` this yields `[10,30,50,70,90]`. To match PRD spec (5,15,25,…,95), instead derive minors from a fixed step: `const minorStep = 5; const minors = []; for (let v = (min ?? 0) + minorStep; v < (max ?? 100); v += minorStep) { if (!values.includes(v)) minors.push(v); }`.
  - Render each minor as a shorter, lighter mark with `data-axis-tick-minor`.
  ```tsx
  {minors.map((v) => {
    const topPct = (1 - fractionFromValue(v, min, max)) * 100;
    return (
      <div
        key={`minor-${v}`}
        aria-hidden
        data-axis-tick-minor
        className="absolute left-0 flex items-center"
        style={{ top: `${topPct}%`, transform: "translateY(-50%)" }}
      >
        <span
          className={`block h-px w-1 ${isDragging ? "bg-zinc-400" : "bg-zinc-300"}`}
          style={{ transitionProperty: "background-color", transitionDuration: transition }}
        />
      </div>
    );
  })}
  ```
- **MIRROR**: existing major-tick block at `Axis.tsx:47-75`. Same `top` math via `fractionFromValue`. Same reduced-motion hookup. Use `data-axis-tick-minor` to keep the existing `data-axis-tick` test selector clean.
- **IMPORTS**: existing imports unchanged.
- **GOTCHA**: Don't double-render — skip values that are already in `values`. Don't render at `min` or `max` (avoids overlap with the labeled endpoints).
- **VALIDATE**: `npm test -- Axis`; add a test asserting `container.querySelectorAll('[data-axis-tick-minor]').length === 10` for `values=[0,20,40,60,80,100]`.

### Task 4: Remove axis pointer triangle
- **ACTION**: Delete the `pointerValue` rendering block in `Axis.tsx`. Keep the prop in the interface (or drop it) — drop it to keep the API tight.
- **IMPLEMENT**:
  - Remove `pointerValue?: number` from `AxisProps`.
  - Remove the `pointerValue !== undefined ? ... : null` block (`Axis.tsx:76-95`).
  - In `ExerciseScreen.tsx:158-163`, drop the `pointerValue={...}` prop from `<Axis>`.
- **MIRROR**: simple deletion.
- **IMPORTS**: none.
- **GOTCHA**: `Axis.test.tsx:21-26` asserts pointer rendering. Delete those tests; replace with the minor-tick test from Task 3.
- **VALIDATE**: `npm test -- Axis`; pointer-related tests should be removed, not commented out.

### Task 5: Cyan bar height = 2 × tolerance
- **ACTION**: In `EstimationBar.tsx`, replace the fixed `h-12` on the active bar with a height computed from `tolerance` and the value range.
- **IMPLEMENT**:
  ```tsx
  // Bar height in % of wrapper = (2 * tolerance / (max - min)) * 100
  const barHeightPct = ((2 * tolerance) / (max - min)) * 100;
  // ...
  <div
    aria-hidden
    data-bar-active
    className="pointer-events-none absolute inset-x-0 bg-(--color-cyan-bar)"
    style={{
      top: `${valueTopPct}%`,
      height: `${barHeightPct}%`,
      transform: "translateY(-50%)",
      opacity: showAsBar ? 1 : 0,
      transitionProperty: "opacity",
      transitionDuration,
      willChange: "top",
    }}
  />
  ```
  Drop the `h-12` class.
- **MIRROR**: Existing `top: ${valueTopPct}%` percent math. The bar's vertical center already = the value, so a percent-height bar around that center is the tolerance band by construction.
- **IMPORTS**: none.
- **GOTCHA**: With ±10 on a 0–100 axis the bar is 20% of wrapper height (~160px on an 800-tall track). With ±5 (breakeven %) it's 10% (~80px). Both feel substantial; the bar is no longer a thin band. Verify on Pixel.
- **GOTCHA**: When the value sits near 0 or 100, `top` + `translateY(-50%)` lets the bar overflow the wrapper. That's fine — it visually communicates "your guess is at the rail." Don't clip with `overflow-hidden` on the bar wrapper (the wrapper is the slider role; clipping affects pointer math only if you change layout — it doesn't here).
- **VALIDATE**: Add a unit test: render `<EstimationBar truth={50} tolerance={10} min={0} max={100} />` and assert `bar.style.height === "20%"`. Render with `tolerance={5}` and assert `"10%"`.

### Task 6: Reorder cyan bar to paint behind stage
- **ACTION**: In `ExerciseScreen.tsx`, ensure the cyan-bar visual layer paints behind the stage while the bar's pointer-event surface stays full-bleed.
- **IMPLEMENT**:
  - Add explicit z-index classes so paint order is intentional, not DOM-order accident:
    - `EstimationBar` wrapper: keep `absolute inset-0`. The cyan visual (`data-bar-active` div) gets `z-0`.
    - Overlay div: `z-10`.
    - Stage div: `z-20`.
    - Tooltip + fireworks: `z-30`.
    - Idle bar pill (`data-bar-idle`): `z-30` (must stay on top).
    - Prompt h1 + axis: `z-40` (always above everything).
  - On the `EstimationBar` wrapper itself, leave it without z so it inherits — pointer events traverse the whole inset-0 area regardless of z.
  - Edit `EstimationBar.tsx`: add `z-0` to the active-bar div and `z-30` to the idle-bar div (the idle pill must remain visible above the stage at rest).
  - Edit `ExerciseScreen.tsx`: add `z-20` to the stage wrapper, `z-10` to the overlay, `z-30` to the tooltip group + `FireworkBurst`, `z-40` to the prompt and axis.
- **MIRROR**: ABSOLUTE_LAYERING pattern — keep `absolute` + `inset-*` positioning; only z classes added.
- **IMPORTS**: none.
- **GOTCHA**: The stage div has `pointer-events`-default. Since `EstimationBar`'s wrapper covers `inset-0` with `data-testid="estimation-bar"` and `role="slider"`, putting the stage on top with `z-20` would intercept pointer events from reaching the slider. Counter: the active-bar inner div is `pointer-events-none` already, AND the slider wrapper itself receives pointer events on its own element (the wrapper, not children). To preserve drag, set `pointer-events-none` on the stage wrapper in `ExerciseScreen.tsx:165` (the `flex items-center justify-center` div). The `<Stage>` content inside doesn't need pointer events for the polish phase — there are no interactive elements in `EquityStage` or `PotOddsStage`.
- **GOTCHA**: The idle pill (`data-bar-idle`) sits at `bottom-4` and must be tap-able? Actually the idle pill is `pointer-events-none` already (`EstimationBar.tsx:136`); the wrapper handles all pointer events. Confirmed — no change needed for idle pill interactivity.
- **VALIDATE**: `npm run dev`; idle: pill + axis + prompt visible above white. Drag: cyan bar appears behind cards/text; stage remains clearly readable on top of bar with the overlay applied. Existing `EstimationBar.test.tsx` pointer-flow tests should still pass.

### Task 7: Card chrome on Equity screen
- **ACTION**: Add a thin border + subtle drop shadow to `PlayingCard`. Breakeven stage has no `PlayingCard` so it's untouched.
- **IMPLEMENT**:
  ```tsx
  className={`flex h-28 w-16 flex-col items-center justify-between rounded-md border border-zinc-200 bg-white py-2 shadow-sm ${colorClass}`}
  ```
  Add `rounded-md border border-zinc-200 bg-white shadow-sm`. Existing `flex / sizing / py-2 / colorClass` stays.
- **MIRROR**: `PotOddsStage.tsx:11` already uses `rounded-2xl border border-zinc-200 bg-white px-8 py-6 shadow-sm` — same vocabulary.
- **IMPORTS**: none.
- **GOTCHA**: `bg-white` on the card means the rank/suit text needs to remain readable. Existing `text-zinc-900` (black) and `text-rose-600` (red) both work on white. No change.
- **GOTCHA**: With the lighter overlay (Task 2), cards on white backgrounds during dragging will read fine; verify by eye.
- **VALIDATE**: `npm test -- PlayingCard` (existing test if any; otherwise visual via `npm run dev`). No existing PlayingCard.test exists — add a snapshot-ish assertion: `expect(card.className).toMatch(/border/)`.

### Task 8: Hero / Villain copy on Equity screen
- **ACTION**: (a) Update equity prompt; (b) add HERO / VILLAIN captions in `EquityStage`.
- **IMPLEMENT**:
  - In `equity/exercise.ts:10`: `prompt: "What's the equity of Hero?"`.
  - In `EquityStage.tsx`:
  ```tsx
  export function EquityStage({ problem }: { problem: HandPair }) {
    return (
      <section aria-label="Problem" className="flex flex-col items-center justify-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">Hero</span>
        <HandDisplay hand={problem.a} />
        <span className="text-xs uppercase tracking-wider text-zinc-500">vs</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">Villain</span>
        <HandDisplay hand={problem.b} />
      </section>
    );
  }
  ```
- **MIRROR**: caption styling mirrors `PotOddsStage.tsx:13` "POT" label (`text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500`). Tighter tracking for the smaller HERO/VILLAIN labels.
- **IMPORTS**: unchanged.
- **GOTCHA**: `ExerciseScreen.test.tsx` uses `findByText(/equity of Hand A/i)` 9 times. Update all to `/equity of Hero/i`.
- **VALIDATE**: `npm test -- ExerciseScreen`; copy regex updates pass.

### Task 9: Rename Pot Odds → Breakeven %
- **ACTION**: Rename user-facing strings + URL slug for the pot-odds exercise.
- **IMPLEMENT**:
  - `pot-odds/exercise.ts`:
    ```ts
    export const potOddsExercise: Exercise<PotOddsProblem> = {
      type: "breakeven",                          // was "pot-odds"
      prompt: "What's your breakeven %?",         // was "What % do you need to win to call?"
      tooltipLabel: "Breakeven %",                // was "Required equity"
      barPrompt: "drag to estimate breakeven %",  // was "drag to estimate pot odds"
      // rest unchanged
    };
    ```
  - `pot-odds/exercise.test.ts`: update any `expect(potOddsExercise.type).toBe("pot-odds")` to `"breakeven"`.
  - `ExerciseScreen.test.tsx:153-183`:
    - URL: `new URLSearchParams("type=breakeven&pot=100&bet=50")`
    - `findByText(/% do you need to win/i)` → `findByText(/breakeven/i)`
    - `getByText(/drag to estimate pot odds/i)` → `getByText(/drag to estimate breakeven/i)`
- **MIRROR**: EXERCISE_CONFIG_SHAPE — only string literals change; structure identical.
- **IMPORTS**: unchanged.
- **GOTCHA**: Folder + file names (`pot-odds/`, `potOddsExercise`) intentionally NOT renamed (PRD: implementer's discretion). Keeping internal names cuts the diff substantially. The URL slug + all user-visible strings are the contract.
- **GOTCHA**: `registry.ts:5-8` references `potOddsExercise` by import — that still works since the symbol export name is unchanged.
- **VALIDATE**: `npm test -- ExerciseScreen`; `npm test -- pot-odds`; manual: navigate to `/?type=breakeven&pot=100&bet=50` in dev server and verify rendering.

### Task 10: Adjust dragging-overlay axis palette (follow-up to Task 2)
- **ACTION**: With `--color-overlay` lighter, the `Axis` dragging palette (`text-zinc-100` etc.) is now too light. Switch to mid-zinc.
- **IMPLEMENT**:
  In `Axis.tsx:24-30`:
  ```tsx
  const lineColor = isDragging ? "border-zinc-400" : "border-zinc-300";
  const labelColor = isDragging ? "text-zinc-700" : "text-zinc-500";
  const tickColor = isDragging ? "bg-zinc-500" : "bg-zinc-400";
  ```
- **MIRROR**: existing two-mode color pattern.
- **IMPORTS**: unchanged.
- **GOTCHA**: minor ticks added in Task 3 should use a similarly-darker shade in dragging mode. Update Task 3 implementation: `${isDragging ? "bg-zinc-400" : "bg-zinc-300"}`.
- **VALIDATE**: visual via `npm run dev` — axis legible at idle, slightly more emphatic during drag.

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Axis renders 10 minor ticks for `[0,20,40,60,80,100]` | `<Axis values={[0,20,40,60,80,100]} mode="idle" />` | `querySelectorAll('[data-axis-tick-minor]').length === 10` | No |
| Axis no longer accepts pointerValue | `<Axis values={[0,100]} mode="dragging" />` | No `[data-axis-pointer]` element | Yes — removal |
| EstimationBar bar height = 2× tolerance | `tolerance=10, min=0, max=100` | `data-bar-active` style.height === "20%" | No |
| EstimationBar bar height with smaller tolerance | `tolerance=5, min=0, max=100` | `data-bar-active` style.height === "10%" | No |
| ExerciseScreen renders Hero in equity prompt | `?type=equity&a=AsKs&b=QhQd` | `findByText(/equity of Hero/i)` | No |
| ExerciseScreen handles new breakeven slug | `?type=breakeven&pot=100&bet=50` | renders pot/bet, "drag to estimate breakeven" | No |
| ExerciseScreen tooltip shows "Breakeven %" | breakeven phase=miss | tooltip label === "Breakeven %" | No |
| Auto-advance still fires after SUCCESS_HOLD_MS | new value 2200 | `replaceMock` called once after `vi.advanceTimersByTime(2200)` | No |

### Edge Cases Checklist
- [ ] Bar at value=0 (renders bar centered on bottom; bottom half overflows below — visually OK)
- [ ] Bar at value=100 (renders bar centered on top; top half overflows above — visually OK)
- [ ] Bar with tolerance=0 (height becomes 0; bar invisible — out of scope, but should not throw)
- [ ] Reduced-motion: all transitions resolve instantly; no fireworks
- [ ] Old `?type=pot-odds` URL: falls back to default exercise (equity) via registry's default branch — no crash; acceptable for prototype
- [ ] Axis values containing 5/15/etc. already as majors — minor-tick filter must dedupe

---

## Validation Commands

### Static Analysis
```bash
cd web && npm run lint
```
EXPECT: zero errors.

```bash
cd web && npx tsc --noEmit
```
EXPECT: zero type errors.

### Unit Tests
```bash
cd web && npm test
```
EXPECT: all tests pass; new tests for minor ticks, bar height, copy assertions present.

### Browser Validation
```bash
cd web && npm run dev
```
- Open `http://localhost:3000/` (defaults to equity, with `Hero` prompt + Hero/Villain captions + bordered cards).
- Drag the bottom pill upward.
  - [ ] Cyan bar appears BEHIND the cards (cards remain clearly readable).
  - [ ] Bar height ≈ 20% of axis travel.
  - [ ] Overlay is dim, not modal — hands behind it are still legible.
  - [ ] Y-axis shows minor ticks between every labeled tick.
  - [ ] No cyan triangle on the axis.
- Release within tolerance → green flash + tooltip "Actual Equity" + dwell ~2.2s before advance.
- Release outside tolerance → grey settle + tooltip + dwell ~2.8s before advance.
- Open `/?type=breakeven&pot=100&bet=50`.
  - [ ] Prompt reads "What's your breakeven %?".
  - [ ] Bar prompt reads "drag to estimate breakeven %".
  - [ ] Tooltip on release reads "Breakeven %".
  - [ ] No card chrome (no cards present).
  - [ ] Bar height ≈ 10% (smaller tolerance).

### Manual Validation Checklist
- [ ] Equity screen: Hero/Villain captions visible above each hand
- [ ] Equity screen: cards have visible border + subtle shadow
- [ ] Drag cyan bar paints behind stage on both screens
- [ ] Bar visually represents tolerance band (size differs between equity ±10 and breakeven ±5)
- [ ] Dragging overlay reads as "ambient dim" not "modal"
- [ ] Axis shows labeled major + unlabeled minor ticks
- [ ] No axis-pointer triangle during drag
- [ ] Reveal tooltip stays on screen long enough to read the % comfortably
- [ ] Reduced-motion mode (system pref) collapses transitions to instant — no jank

---

## Acceptance Criteria
- [ ] All 10 tasks completed
- [ ] All validation commands pass (lint, typecheck, tests)
- [ ] No type errors
- [ ] Manual validation checklist green on dev server
- [ ] Owner self-check: "drag bar no longer feels like a guillotine; actual equity registers before advance"

## Completion Checklist
- [ ] Code follows discovered patterns (`bg-(--var)`, `data-*` test hooks, `useReducedMotion` for every transition)
- [ ] Error handling unchanged (no new error paths)
- [ ] Logging unchanged (no new logs)
- [ ] Tests updated for renamed copy + new behaviors (Hero, Breakeven %, minor ticks, bar height)
- [ ] No hardcoded values beyond already-tokenized constants (overlay alpha, dwell ms, anchor lists)
- [ ] No new dependencies
- [ ] No scope additions (no new exercises, no animation library)
- [ ] PRD phase 7 status updated to `complete` and report drafted

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Z-index reorder breaks pointer events on the slider wrapper | LOW | drag stops working | Keep `EstimationBar` wrapper at default z and `pointer-events-none` on stage wrapper; rely on existing pointer-flow tests to catch regression |
| Lighter overlay makes axis invisible during drag on bright screens | MEDIUM | UX regression | Task 10 already darkens axis dragging palette; verify on Pixel before declaring done |
| Bar height = 2× tolerance feels wrong (too dominant for ±10) | LOW–MEDIUM | aesthetic miss | If owner reports the 20% bar overwhelms the screen, scale visually with a max height cap (`min(20%, 160px)`) — out of plan; flag in report |
| Renaming `type=pot-odds` → `type=breakeven` invalidates any bookmarked URL | LOW | dead URL falls back to equity | Acceptable for prototype (no users); noted in NOT Building |
| Existing snapshot tests (if any) on `Axis` break due to minor-tick markup | LOW | test churn | None known; address as encountered |

## Notes
- The bar-as-tolerance-band insight in item 2 is the cleanest part of this pass: instead of drawing a band on the axis and the bar at the value, the bar IS the band, so successful releases are visibly "the bar covers truth." Keep this in mind for any future tolerance schemes (e.g. asymmetric tolerance) — the bar's height + center together encode the band geometry.
- Internal symbol names (`potOddsExercise`, folder `pot-odds/`) deliberately NOT renamed in this pass. If a future phase adds a third arithmetic exercise, that's the right time to rename the folder to `breakeven/` along with broader cleanup.
- Phase 7 explicitly excludes a new tolerance-band visualization, animation overhaul, or theme work. Resist scope creep during implementation.
