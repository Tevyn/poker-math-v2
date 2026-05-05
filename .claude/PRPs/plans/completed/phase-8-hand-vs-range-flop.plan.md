# Plan: Hand vs Range, Flop Equity (Phase 8)

## Summary
Add a third exercise — **estimate Hero's equity vs a known Villain range on a random flop** — that stretches the engine on a harder math problem and the UI on representing ranges + a board. Hero is a single combo sampled from a fixed hand-class pool (the deduplicated union of every hand class that appears in the imported range library, so the user only drills hands they'd actually play). Villain is one range, picked at random per problem from the library, displayed read-only as a 13×13 grid (binary in/out — no weights, no mixed strategies). Board is a random flop (3 cards) avoiding Hero's hole cards. Engine work collapses to a thin wrapper around `pokers::exact_equity`, which handles range expansion, conflict removal, and turn+river enumeration internally. UI work is the larger lift: a new `<Stage>` containing a 13×13 grid, the board, and Hero's two cards. Tolerance stays at ±10 pp; no Monte Carlo path in this phase (decided post-discussion — measure exact perf first).

## User Story
As the project owner, I want to drill hand-vs-range equity on the flop using ranges I actually play, so that I can train estimation against the situations I face at the table — and so I can see whether the WASM engine handles harder equity problems within an acceptable interaction budget on Pixel.

## Problem → Solution
**Current state.** The shell handles two exercises (equity, pot-odds). Both have small problem shapes and trivial visuals. The engine exposes `equity_vs(a, b)` for hand-vs-hand pre-flop only. There is no notion of a range, a board, or a range library.

**Desired state.** A third exercise type registered under `?type=hand-vs-range` with problem shape `{ hero: [c1, c2], villainRangeId, board: [b1, b2, b3] }`. URL shape `?type=hand-vs-range&hero=AsKs&range=btn_open&board=Kh7d2c`. New engine fn `equity_vs_range_flop(hero_combo, villain_range_str, flop_str)` returns Hero's equity in `[0, 1]`. Range data lives in `web/src/data/rangeLibrary.ts` (imported verbatim from the user's prior project, restructured into a flat `Range[]` at module init). `HERO_HAND_POOL` is computed once as the union of every hand class across the library. New `RangeGrid` component renders 13×13, read-only, binary fill. Existing primitives (`EstimationBar`, `Axis`, `ActualValueTooltip`, `FireworkBurst`, `useAutoAdvance`, `feedbackCopy`) are unchanged.

## Metadata
- **Complexity**: Medium (small engine delta + meaningful UI surface + range data plumbing)
- **Source PRD**: `.claude/PRPs/prds/poker-trainer.prd.md`
- **PRD Phase**: Phase 8 — Hand vs Range, Flop Equity
- **Estimated Files**: ~13 (10 new, 3 updated)
- **Decision recap**: flop only; random combo per hand class (so blockers vary); random range pick; binary inclusion (no weights); ±10 pp tolerance; exact enumeration only via `exact_equity`; no MC fallback in this phase (revisit only if measured perf forces it).

---

## UX Design

### New screen: `?type=hand-vs-range`

```
┌────────────────────────────────────┐
│   What's Hero's equity on the flop? │
│                                    │
│  Villain — BTN open                │
│  ┌────────────────────────────────┐│
│  │ AA KK QQ JJ TT … 22            ││  ← 13×13 grid
│  │ AKs … 22o                      ││    binary fill: in=solid, out=light
│  │ …                              ││    cell label inside cell
│  └────────────────────────────────┘│
│                                    │
│  Board                             │
│  [ K♣ ] [ 7♦ ] [ 2♥ ]              │  ← 3 cards, same chrome as equity hands
│                                    │
│  Hero                              │
│         [ A♠ ] [ Q♠ ]              │  ← 2 cards
│                                    │
│ ┃ 100                              │
│ ┃ 80                               │
│ ┃ 60                               │
│ ┃ 40                               │
│ ┃ 20                               │
│ ┃ 0                                │
│  ┌─ drag to estimate equity ↑ ─┐   │
│  └────────────────────────────┘    │
└────────────────────────────────────┘
```

### Interaction Changes

| Touchpoint | Hand-vs-range | Notes |
|---|---|---|
| Stage content | Range grid + board + hero | New `HandVsRangeStage` |
| Prompt | "What's Hero's equity on the flop?" | Top of screen |
| Bar prompt | "drag to estimate equity" | Same as equity exercise |
| Tooltip label | "Actual Equity" | Same as equity |
| Truth source | `engine.equityVsRangeFlop(heroCombo, villainRangeStr, flopStr)` × 100 | Engine round-trip |
| Tolerance | ±10 pp | Same as equity |
| Axis | 0/20/40/60/80/100 | Reuse |
| Next | Random hero class → random combo → random range → random board | Per-exercise generator |
| Auto-advance | shared timing constants | Unchanged |

### Range grid layout (13×13)

- 13 rows × 13 cols. Standard poker convention:
  - Row index `r` and col index `c` both ordered by rank descending: A, K, Q, J, T, 9, 8, 7, 6, 5, 4, 3, 2.
  - `r === c` → pair (e.g., (0,0) = AA).
  - `r < c` → suited (above the diagonal). Cell (0, 1) = AKs.
  - `r > c` → offsuit. Cell (1, 0) = AKo.
- Cell size targeting ~22–24px so 13 cells fit a Pixel viewport at ~290–315px wide with the standard page gutter. Cell label is the hand-class string (e.g., `AKs`) in a small bold mono-ish font.
- Binary fill: in-range = solid filled; out-of-range = light/empty. No opacity gradients, no color coding for action (`raise` vs `call` collapse to "in").
- Read-only. Not interactive — semantic equivalent of an inline image, but built as DOM so it renders crisply at any DPI.
- Range name shown above the grid (e.g., "BTN open").

### Out of UX scope
- Range editor / picker.
- Highlighting which villain combos survive card removal on the reveal screen.
- Rotating exercise types in "next" — same type only, like phases 6/7.
- Turn / river problems.
- Mixed strategies / weighted ranges.
- Range filter UI (by category).
- Picking ranges by scenario tag — still random.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `.claude/PRPs/prds/poker-trainer.prd.md` | 50-53, 78-86, 184-247 | "Should: Additional exercise types"; performance metric; phase table format |
| P0 | `.claude/PRPs/plans/completed/second-exercise-pot-odds.plan.md` | all | Establishes the `Exercise<TProblem>` contract being reused |
| P0 | `.claude/PRPs/plans/completed/visual-polish-pass.plan.md` | all | Establishes the post-Phase-7 visual conventions (Hero/Villain copy, card chrome, drag-bar layering) |
| P0 | `engine/src/lib.rs` | all | Existing `compute_equity` pattern — `Phase 8 fn mirrors it` with a board mask + a range string |
| P0 | `web/src/exercises/types.ts` | all | `Exercise<TProblem>` interface — unchanged |
| P0 | `web/src/exercises/equity/exercise.ts` | all | Pattern reference for the new `handVsRangeExercise` |
| P0 | `web/src/exercises/equity/EquityStage.tsx` | all | Pattern reference for the new `HandVsRangeStage` (cards, layout) |
| P0 | `web/src/exercises/equity/PlayingCard.tsx` | all | Reused as-is for board + hero rendering. Do **not** edit. |
| P0 | `web/src/exercises/equity/problem.ts` | all | Pattern reference for the new `problem.ts` (parse/serialize/random) |
| P0 | `web/src/lib/engine.ts` | all | Add `equityVsRangeFlop` to `EngineApi`; mirror existing wrapper |
| P0 | `web/src/components/exercise/ExerciseScreen.tsx` | all | The shell — should require **zero changes** in this phase. If it does, that's a smell; raise before editing. |
| P0 | `web/AGENTS.md` | all | "This is NOT the Next.js you know." |
| P0 | `~/.claude/rules/web/coding-style.md` | all | Feature-folder layout; named exports; no `React.FC` |
| P0 | `~/.claude/rules/common/coding-style.md` | "YAGNI" + "DRY" sections | The `Range`, `HandClass`, and combo types should cover **only** what this phase needs |
| P1 | https://github.com/Tevyn/poker-math/blob/main/src/data/rangeData.ts | all | Source of `rangeData`. Fetch via `gh api repos/Tevyn/poker-math/contents/src/data/rangeData.ts --jq '.content' \| base64 -d`. |
| P1 | https://github.com/Tevyn/poker-math/blob/main/src/types/rangeTypes.ts | all | Source `RangeCategories` / `PokerRange` types. Fetch the same way. |
| P1 | `pokers::exact_equity` and `pokers::HandRange` | rustdoc | `cargo doc --no-deps -p pokers --open` from `engine/` to view |

## External Documentation / Insights

| Topic | Source | Key Takeaway |
|---|---|---|
| `pokers::exact_equity` | `cargo doc -p pokers` | Signature: `exact_equity(hand_ranges: &[HandRange], board_mask: u64, dead_mask: u64, n_threads: u8, cancel_token: Arc<AtomicBool>, callback: F) -> Result<SimulationResults, SimulatorError>`. Returns per-player equity. Internally enumerates remaining streets and removes conflicting combos. |
| `pokers::HandRange::from_string` | `cargo doc -p pokers` | Accepts comma-separated hand classes (`"AA,KK,AKs,AKo"`) **and** specific combos (`"AsKs"`). One call covers both Hero (single-combo "range") and Villain (range string). |
| `pokers::get_card_mask` | `cargo doc -p pokers` | Converts a card-string (e.g. `"Ah7d2c"`) into the `u64` board mask `exact_equity` expects. **Confirm exact signature when implementing** — there is also `flop_from_str` returning `[u8;3]`; either path is fine, pick whichever is fewer lines. |
| `n_threads` in WASM | wasm-bindgen + browser threading model | Pass `1`. WASM threads are off by default. |

```
KEY_INSIGHT: The engine work for Phase 8 is essentially a 4th `compute_equity` overload. Same `HandRange::from_string` trick (Hero gets a 1-combo "range", Villain gets the joined hand-class string), same `exact_equity` call, just with a non-zero `board_mask`. No combo-expansion, no card-removal, no enumeration code on our side.
APPLIES_TO: engine/src/lib.rs.
GOTCHA: Don't reach for `approx_equity` (Monte Carlo) just because flop equity sounds harder. Decision is exact-only for this phase; perf is the next experiment.

KEY_INSIGHT: The user's `rangeData.ts` is binary-already. Each `PokerRange` has `range: { raise?: string[], call?: string[] }` (other action keys may exist). For our binary-in-or-out world, a range = union of all action arrays.
APPLIES_TO: rangeLibrary normalizer.
GOTCHA: Iterate `Object.values(pokerRange.range)` rather than hardcoding `raise`/`call` so a future action key (e.g. `4bet`) doesn't silently drop combos.

KEY_INSIGHT: Hero's hand pool is the **deduplicated union of every hand class across every range in the library**. Compute once at module init from `rangeLibrary`. Don't over-engineer with lazy memoization or React state — it's a 169-element-max set computed at import time.
APPLIES_TO: rangeLibrary.ts (`HERO_HAND_POOL`).
GOTCHA: A few hand classes (e.g., bottom-suited offsuits like `32o`) may not appear in any range. That's fine — they're correctly excluded from the pool. Don't pad the pool with all 169 classes.

KEY_INSIGHT: Hand-class → combo expansion is needed only on the Hero side (we want a *specific* combo, not all combos in the class). The expander is small and table-driven — pairs (6 combos), suited (4), offsuit (12).
APPLIES_TO: handClass.ts (or wherever the expander lives).
GOTCHA: When sampling a combo, **also avoid combos that conflict with the chosen flop**. The simplest order: pick hand class → pick flop (any 3 cards from full 52) → expand class to combos → filter combos that share a card with the flop → pick a random survivor. If the survivor list is empty (only happens for AA when all 4 aces would be needed: it can't — AA needs 2 aces and a flop with 3 aces is impossible — but for, e.g., KKs is impossible, KK with KKK on flop is impossible — actually all hand classes have at least one survivor for any flop because no flop uses 3 of the same rank+suit). To be safe, retry the whole problem if the survivor list is empty.

KEY_INSIGHT: The 13×13 grid layout is rank-descending on both axes (A→2). Pairs sit on the diagonal. Suited above. Offsuit below. The hand-class string for cell `(r, c)`:
  - `r === c`: `${rankChar}${rankChar}` (pair)
  - `r < c`: `${rankChars[r]}${rankChars[c]}s` (suited; higher rank first because it's above the diagonal)
  - `r > c`: `${rankChars[c]}${rankChars[r]}o` (offsuit; higher rank first; col is the higher rank when r > c)
APPLIES_TO: RangeGrid.tsx.
GOTCHA: Off-by-one on row/col. Test against a fixture: cell (0, 1) must produce "AKs", cell (1, 0) must produce "AKo", cell (12, 12) must produce "22".

KEY_INSIGHT: Range library data is content. Don't normalize-on-render — normalize once at module init and freeze the result. The `rangeData.ts` file from the source repo can be copied verbatim; the normalizer that flattens `RangeCategories` → `Range[]` lives next to it.
APPLIES_TO: rangeLibrary.ts.
GOTCHA: Preserve range IDs verbatim from the source data (`lj_open`, `bb_vs_btn`, etc.) — they become URL-stable identifiers. Don't reformat them.

KEY_INSIGHT: For the hero card-removal-on-flop problem: deal Hero first (combo from class), then deal flop from the 50 remaining cards. This guarantees no Hero/board conflict by construction. The engine still handles Villain conflict removal.
APPLIES_TO: handVsRange/problem.ts (random problem generator).
GOTCHA: If you instead pick flop first and then hero, you have to retry-on-conflict, which is more code for the same result.

KEY_INSIGHT: When the Villain range, after card removal against Hero+board, contains zero combos (theoretically possible with a very narrow range like `{AA}` and a board that uses both remaining aces — though `{AA}` has 6 combos and a flop of 3 cards can only kill up to 3 of them so 3 survive), `exact_equity` returns `SimulatorError::ConflictingRanges`. Map that to a "regenerate" path in the truth fn so the screen never shows an unsolvable problem.
APPLIES_TO: handVsRange/exercise.ts (`computeTruth`).
GOTCHA: Detection should be: catch the error, log nothing, and return `null` so the shell's loading guard re-renders. The problem generator separately must avoid this — but the engine layer needs to be defensive too.
```

---

## Patterns to Mirror

### NAMING_CONVENTION (existing)
- `equityExercise`, `potOddsExercise` → `handVsRangeExercise`
- `EquityStage`, `PotOddsStage` → `HandVsRangeStage`
- Folder: `web/src/exercises/hand-vs-range/`

### ENGINE_FN_SHAPE (mirror existing in `engine/src/lib.rs`)
```rust
fn compute_equity_vs_range_flop(
    hero_combo: &str,    // "AsKs"
    villain_range: &str, // "AA,KK,QQ,AKs,..."
    flop: &str,          // "Kh7d2c"
) -> Result<f32, String> {
    let ranges = HandRange::from_strings(vec![
        hero_combo.to_string(),
        villain_range.to_string(),
    ]);
    if ranges[0].hands.is_empty() || ranges[1].hands.is_empty() {
        return Err("invalid hand or range".to_string());
    }
    let board_mask = board_mask_from_str(flop)?;
    let cancel = Arc::new(AtomicBool::new(false));
    let result = exact_equity(&ranges, board_mask, 0u64, 1, cancel, |_| {})
        .map_err(|e| match e {
            SimulatorError::ConflictingRanges => "ranges conflict with board".to_string(),
            other => format!("equity failed: {other:?}"),
        })?;
    Ok(result.equities[0] as f32)
}
```

### EXERCISE_DEFINITION (mirror Phase 6)
- `handVsRangeExercise: Exercise<HandVsRangeProblem>`
- `HandVsRangeProblem = { hero: [string, string]; villainRangeId: string; board: [string, string, string] }`
- `parseProblem` reads `hero=AsKs&range=btn_open&board=Kh7d2c`
- `serializeProblem` writes the same shape
- `problemKey`: `${hero[0]}${hero[1]}|${villainRangeId}|${board.join("")}`

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `engine/src/lib.rs` | UPDATE | Add `compute_equity_vs_range_flop` + `equity_vs_range_flop` wasm-bindgen wrapper + tests |
| `engine/pkg/` (bundler artifacts) | UPDATE | Rebuild via `wasm-pack build --target bundler` |
| `engine/pkg-node/` (node artifacts) | UPDATE | Rebuild via `wasm-pack build --target nodejs --out-dir pkg-node` |
| `web/src/lib/engine.ts` | UPDATE | Extend `EngineApi` with `equityVsRangeFlop(heroCombo, villainRange, flop)` |
| `web/src/lib/engine.test.ts` | UPDATE | Add a fixture-based test for the new method |
| `web/src/data/rangeLibrary.ts` | CREATE | Imports the user's `rangeData.ts` verbatim, normalizes to flat `Range[]`, computes `HERO_HAND_POOL` |
| `web/src/data/rangeData.ts` | CREATE (vendored) | Verbatim copy from `Tevyn/poker-math` source repo |
| `web/src/data/rangeTypes.ts` | CREATE (vendored) | Verbatim copy of the matching types file |
| `web/src/data/rangeLibrary.test.ts` | CREATE | Sanity tests: every range in the library parses; pool is non-empty; pool contains expected hand classes |
| `web/src/lib/handClass.ts` | CREATE | `expandHandClassToCombos`, `parseRankPair`, `comboString`, deck constants |
| `web/src/lib/handClass.test.ts` | CREATE | Pair → 6 combos; suited → 4; offsuit → 12; combo strings well-formed |
| `web/src/exercises/hand-vs-range/problem.ts` | CREATE | `HandVsRangeProblem` type, `randomProblem`, `parseProblem`, `serializeProblem`, `problemKey` |
| `web/src/exercises/hand-vs-range/problem.test.ts` | CREATE | Random problem validity over 200 trials; parse/serialize round-trip |
| `web/src/exercises/hand-vs-range/RangeGrid.tsx` | CREATE | 13×13 read-only grid component |
| `web/src/exercises/hand-vs-range/RangeGrid.test.tsx` | CREATE | Cell labels at fixture coordinates; filled count matches range size |
| `web/src/exercises/hand-vs-range/HandVsRangeStage.tsx` | CREATE | Composes range name + grid + board + hero |
| `web/src/exercises/hand-vs-range/exercise.ts` | CREATE | Implements `Exercise<HandVsRangeProblem>` |
| `web/src/exercises/hand-vs-range/exercise.test.ts` | CREATE | Round-trip serialize/parse; `computeTruth` returns null without engine and a finite number with |
| `web/src/exercises/registry.ts` | UPDATE | Append `handVsRangeExercise` |
| `web/src/components/exercise/ExerciseScreen.test.tsx` | UPDATE | Add render tests for `?type=hand-vs-range&...` URLs |
| `.claude/PRPs/prds/poker-trainer.prd.md` | UPDATE | Flip Phase 7 status to `complete` (stale); add Phase 8 row to the table |

## NOT Building
- **MC fallback (`approx_equity`).** Decision: exact only. Re-evaluate post-implementation.
- **Range filter / picker UI.** Random pick from the full library, period.
- **Scenario-tagged ranges** (e.g., "show me a 3bet defense range"). All ranges are equally likely.
- **Highlighting surviving Villain combos** on the reveal screen. Worth a future phase but not this one.
- **Turn/river problems** or **multi-street equity training**.
- **Mixed strategies / weighted ranges.** Source data uses arrays of action labels; we collapse to binary inclusion regardless of action.
- **Custom range editor.**
- **Migrating equity exercise to use ranges.** Equity stays hand-vs-hand pre-flop.
- **Sharing combo expansion code with the engine.** Engine has its own; we only need a JS expander for hero-combo sampling, which is ~30 lines.
- **A separate route.** Single page, `?type=` distinguishes.
- **Caching `exact_equity` results across problems.** Each problem is one engine call; no LRU. Profile first if it ever matters.
- **Engine boot path changes.** Engine boots eagerly at app start; this exercise consumes the same instance.

---

## Step-by-Step Tasks

### Task 1: Engine — `compute_equity_vs_range_flop` + WASM binding
- **FILE**: `engine/src/lib.rs`
- **IMPLEMENT**:
  ```rust
  use pokers::{HandRange, SimulatorError, exact_equity, get_card_mask};
  // (or pokers::flop_from_str + manual mask if get_card_mask isn't a string-input fn —
  //  confirm signature when implementing; pick the fewest-lines path)

  fn board_mask_from_flop(flop: &str) -> Result<u64, String> {
      // flop is 6 chars: "Kh7d2c". Convert each pair → bit in u64.
      // Use whichever pokers helper exists (get_card_mask or flop_from_str + bit-set).
      // Validate length = 6 and three distinct cards.
      todo!()
  }

  fn compute_equity_vs_range_flop(
      hero_combo: &str,
      villain_range: &str,
      flop: &str,
  ) -> Result<f32, String> {
      let ranges = HandRange::from_strings(vec![
          hero_combo.to_string(),
          villain_range.to_string(),
      ]);
      if ranges[0].hands.is_empty() {
          return Err("invalid hero combo".to_string());
      }
      if ranges[1].hands.is_empty() {
          return Err("invalid villain range".to_string());
      }
      let board_mask = board_mask_from_flop(flop)?;
      let cancel_token = Arc::new(AtomicBool::new(false));
      let result = exact_equity(&ranges, board_mask, 0u64, 1, cancel_token, |_| {})
          .map_err(|e| match e {
              SimulatorError::ConflictingRanges => "ranges conflict with board".to_string(),
              other => format!("equity failed: {other:?}"),
          })?;
      Ok(result.equities[0] as f32)
  }

  #[wasm_bindgen]
  pub fn equity_vs_range_flop(
      hero_combo: &str,
      villain_range: &str,
      flop: &str,
  ) -> Result<f32, JsError> {
      compute_equity_vs_range_flop(hero_combo, villain_range, flop)
          .map_err(|msg| JsError::new(&msg))
  }
  ```
- **GOTCHA**:
  1. The exact `pokers` helper for "string → board mask" needs to be confirmed at implementation time. Two acceptable paths: (a) `get_card_mask("Kh7d2c")` if it accepts a multi-card string; (b) `flop_from_str` returning `[u8; 3]` then OR each `1u64 << card_index` into a mask. Whichever has the cleaner signature in the version we have.
  2. Don't pre-validate the flop string yourself. Let the helper return its error; map it.
- **VALIDATE**: `cargo test` covers in Task 2.

### Task 2: Engine tests
- **FILE**: `engine/src/lib.rs` (extend `mod tests`)
- **IMPLEMENT**:
  ```rust
  #[test]
  fn aks_vs_premium_range_on_dry_flop_is_underdog() {
      // AsKs on Kh7d2c vs {AA,KK,QQ,JJ,TT}:
      // - vs AA (6 combos): roughly 8% (set vs top pair)
      // - vs KK (3 combos surviving — KhKs is impossible since Ks is hero): set
      // - vs QQ/JJ/TT: AKs has top pair top kicker, ahead
      // Aggregate equity well below 50%.
      let eq = compute_equity_vs_range_flop(
          "AsKs",
          "AA,KK,QQ,JJ,TT",
          "Kh7d2c",
      ).unwrap();
      assert!(eq > 0.20 && eq < 0.55, "expected 0.20-0.55, got {eq}");
  }

  #[test]
  fn pocket_aces_vs_random_range_on_dry_flop_is_favorite() {
      let eq = compute_equity_vs_range_flop(
          "AsAh",
          "22+,A2s+,K2s+,Q2s+,J2s+,T9s,98s,87s,76s,65s,A2o+,K9o+,Q9o+,J9o+,T9o",
          "7c2d3h",
      ).unwrap();
      assert!(eq > 0.80, "expected > 0.80, got {eq}");
  }

  #[test]
  fn invalid_hero_combo_returns_error() {
      assert!(compute_equity_vs_range_flop("garbage", "AA", "Kh7d2c").is_err());
  }

  #[test]
  fn invalid_flop_returns_error() {
      assert!(compute_equity_vs_range_flop("AsKs", "AA", "garbage").is_err());
  }

  #[test]
  fn hero_conflicts_with_board_returns_error() {
      // AsKs with As on the flop should fail at exact_equity time
      let r = compute_equity_vs_range_flop("AsKs", "QQ", "AsKh2d");
      assert!(r.is_err());
  }
  ```
- **GOTCHA**: Equity ranges in the assertions are intentionally wide — these are sanity checks, not regression-locked numbers. If `pokers` ever changes precision, the test should still pass. Tighter values can come later if we want regression sentinels.
- **VALIDATE**: `cd engine && cargo test` green; `cargo clippy --all-targets -- -D warnings` clean; `cargo fmt --check` clean.

### Task 3: Engine — rebuild WASM artifacts
- **ACTION**:
  ```bash
  cd engine
  wasm-pack build --target bundler
  wasm-pack build --target nodejs --out-dir pkg-node
  ```
- **GOTCHA**:
  1. Both pkg dirs must be committed together — see `AGENTS.md`.
  2. Confirm bundle stays under the 80 KB PRD budget. Hand-vs-range work is a thin wrapper over an existing dependency function — bundle delta should be well under 1 KB.
- **VALIDATE**: `git status engine/pkg engine/pkg-node` shows updated files; bundle size logged in commit message.

### Task 4: Web engine wrapper
- **FILE**: `web/src/lib/engine.ts`
- **AFTER**:
  ```typescript
  import { count_combos, equity_vs, equity_vs_range_flop } from "engine";

  export interface EngineApi {
    countCombos(rangeStr: string): number;
    equityVs(handA: string, handB: string): number;
    equityVsRangeFlop(heroCombo: string, villainRange: string, flop: string): number;
  }

  // ... in getEngine():
  equityVsRangeFlop(heroCombo: string, villainRange: string, flop: string): number {
    return equity_vs_range_flop(heroCombo, villainRange, flop);
  }
  ```
- **GOTCHA**: TypeScript will pick up the new export from `engine/pkg/engine.d.ts` automatically once the WASM is rebuilt. If TS doesn't see it, the rebuild didn't run.
- **VALIDATE**: Task 5 tests.

### Task 5: Web engine wrapper test
- **FILE**: `web/src/lib/engine.test.ts`
- **IMPLEMENT**: Add one test that calls `equityVsRangeFlop("AsKs", "AA,KK,QQ,JJ,TT", "Kh7d2c")` and asserts a finite number in `[0, 1]`. Mirror the existing `equityVs` test shape.
- **VALIDATE**: `cd web && npm test engine` green.

### Task 6: Vendor the range data
- **ACTION**: Fetch `rangeData.ts` and `rangeTypes.ts` from `Tevyn/poker-math` and place them at `web/src/data/rangeData.ts` and `web/src/data/rangeTypes.ts` verbatim. One-line header comment on each indicating origin and "imported as-is — modifications go in `rangeLibrary.ts`."
  ```bash
  gh api repos/Tevyn/poker-math/contents/src/data/rangeData.ts --jq '.content' | base64 -d > web/src/data/rangeData.ts
  gh api repos/Tevyn/poker-math/contents/src/types/rangeTypes.ts --jq '.content' | base64 -d > web/src/data/rangeTypes.ts
  ```
  Then fix the import in `rangeData.ts` from `'../types/rangeTypes'` → `'./rangeTypes'`.
- **GOTCHA**: Do not edit the data shape. Future updates from the source repo should be re-fetchable as a clean overwrite.
- **VALIDATE**: `tsc --noEmit` clean.

### Task 7: `rangeLibrary.ts` — flatten + dedup
- **FILE**: `web/src/data/rangeLibrary.ts`
- **IMPLEMENT**:
  ```typescript
  import { rangeData } from "./rangeData";

  export type HandClass = string; // e.g. "AKs", "QQ", "27o"

  export interface Range {
    /** URL-stable id (e.g., "btn_open"). */
    readonly id: string;
    /** Human-readable name (e.g., "BTN open"). */
    readonly name: string;
    /** Set of hand classes in the range. Binary inclusion. */
    readonly hands: ReadonlySet<HandClass>;
  }

  function flatten(): Range[] {
    const out: Range[] = [];
    for (const category of Object.values(rangeData)) {
      for (const [id, pokerRange] of Object.entries(category.ranges)) {
        const hands = new Set<HandClass>();
        for (const action of Object.values(pokerRange.range)) {
          if (Array.isArray(action)) {
            for (const h of action) hands.add(h);
          }
        }
        out.push({ id, name: pokerRange.name, hands });
      }
    }
    return out;
  }

  export const RANGES: ReadonlyArray<Range> = flatten();

  export function getRangeById(id: string): Range | undefined {
    return RANGES.find((r) => r.id === id);
  }

  /** Joined hand-class string for `pokers::HandRange::from_string`. */
  export function rangeToEngineString(range: Range): string {
    return Array.from(range.hands).join(",");
  }

  /** Deduplicated union of every hand class across the library. */
  export const HERO_HAND_POOL: ReadonlyArray<HandClass> = (() => {
    const set = new Set<HandClass>();
    for (const r of RANGES) for (const h of r.hands) set.add(h);
    return Array.from(set);
  })();
  ```
- **GOTCHA**: Object iteration order in modern JS is insertion order for string keys, so `RANGES` preserves the source ordering — useful for stable URLs and deterministic random picks under a seeded RNG.
- **VALIDATE**: Task 8.

### Task 8: `rangeLibrary` tests
- **FILE**: `web/src/data/rangeLibrary.test.ts`
- **IMPLEMENT**:
  ```typescript
  import { describe, it, expect } from "vitest";
  import { RANGES, HERO_HAND_POOL, getRangeById, rangeToEngineString } from "./rangeLibrary";

  describe("RANGES", () => {
    it("loads at least 20 ranges", () => {
      expect(RANGES.length).toBeGreaterThanOrEqual(20);
    });
    it("every range has a non-empty hand set", () => {
      for (const r of RANGES) {
        expect(r.hands.size).toBeGreaterThan(0);
      }
    });
    it("ids are unique", () => {
      const ids = new Set(RANGES.map((r) => r.id));
      expect(ids.size).toBe(RANGES.length);
    });
  });

  describe("HERO_HAND_POOL", () => {
    it("includes premium hands", () => {
      expect(HERO_HAND_POOL).toContain("AA");
      expect(HERO_HAND_POOL).toContain("AKs");
      expect(HERO_HAND_POOL).toContain("AKo");
    });
    it("never duplicates", () => {
      expect(new Set(HERO_HAND_POOL).size).toBe(HERO_HAND_POOL.length);
    });
    it("is a subset of valid hand-class space (≤ 169)", () => {
      expect(HERO_HAND_POOL.length).toBeLessThanOrEqual(169);
    });
  });

  describe("getRangeById / rangeToEngineString", () => {
    it("looks up a known range and joins hand classes with commas", () => {
      const r = RANGES[0];
      expect(getRangeById(r.id)).toBe(r);
      const engineStr = rangeToEngineString(r);
      expect(engineStr).toContain(",");
      expect(engineStr.split(",").length).toBe(r.hands.size);
    });
  });
  ```
- **VALIDATE**: green.

### Task 9: `handClass.ts` — combo expander + helpers
- **FILE**: `web/src/lib/handClass.ts`
- **IMPLEMENT**:
  ```typescript
  export const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
  export const SUITS = ["s", "h", "d", "c"] as const;

  export type Rank = (typeof RANKS)[number];
  export type Suit = (typeof SUITS)[number];
  export type Card = `${Rank}${Suit}`; // e.g., "As"

  export const ALL_CARDS: ReadonlyArray<Card> = RANKS.flatMap(
    (r) => SUITS.map((s) => `${r}${s}` as Card),
  );

  /** Expand a hand-class string into all its specific 2-card combos. */
  export function expandHandClassToCombos(handClass: string): Card[] {
    if (handClass.length === 2) {
      // Pair: e.g. "AA" → 6 combos
      const r = handClass[0] as Rank;
      const out: Card[] = [];
      for (let i = 0; i < SUITS.length; i++) {
        for (let j = i + 1; j < SUITS.length; j++) {
          out.push(`${r}${SUITS[i]}${r}${SUITS[j]}` as unknown as Card);
        }
      }
      return out;
    }
    if (handClass.length === 3) {
      const r1 = handClass[0] as Rank;
      const r2 = handClass[1] as Rank;
      const kind = handClass[2];
      if (kind === "s") {
        // Suited: 4 combos
        return SUITS.map((s) => `${r1}${s}${r2}${s}` as unknown as Card);
      }
      if (kind === "o") {
        // Offsuit: 12 combos
        const out: Card[] = [];
        for (const s1 of SUITS) {
          for (const s2 of SUITS) {
            if (s1 !== s2) out.push(`${r1}${s1}${r2}${s2}` as unknown as Card);
          }
        }
        return out;
      }
    }
    throw new Error(`invalid hand class: ${handClass}`);
  }

  /** Concatenate two cards into a hero combo string for the engine. */
  export function comboString(c1: Card, c2: Card): string {
    return `${c1}${c2}`;
  }
  ```
- **GOTCHA**:
  1. Cast through `unknown` is intentional — the template-literal type doesn't track 4-char concatenations. The runtime values are correct; the type narrowing is the casualty.
  2. Output strings are 4 chars (`AsKh`), not 5. The engine accepts that format.
- **VALIDATE**: Task 10.

### Task 10: `handClass` tests
- **FILE**: `web/src/lib/handClass.test.ts`
- **IMPLEMENT**:
  ```typescript
  import { describe, it, expect } from "vitest";
  import { expandHandClassToCombos, ALL_CARDS } from "./handClass";

  describe("expandHandClassToCombos", () => {
    it("AA produces 6 combos", () => {
      const combos = expandHandClassToCombos("AA");
      expect(combos.length).toBe(6);
      expect(new Set(combos).size).toBe(6);
    });
    it("AKs produces 4 combos all same-suit", () => {
      const combos = expandHandClassToCombos("AKs");
      expect(combos.length).toBe(4);
      for (const c of combos) {
        expect(c[1]).toBe(c[3]); // suit of A === suit of K
      }
    });
    it("AKo produces 12 combos all different-suit", () => {
      const combos = expandHandClassToCombos("AKo");
      expect(combos.length).toBe(12);
      for (const c of combos) {
        expect(c[1]).not.toBe(c[3]);
      }
    });
    it("rejects garbage", () => {
      expect(() => expandHandClassToCombos("AKz")).toThrow();
      expect(() => expandHandClassToCombos("XX")).toThrow();
    });
  });

  describe("ALL_CARDS", () => {
    it("has 52 unique cards", () => {
      expect(ALL_CARDS.length).toBe(52);
      expect(new Set(ALL_CARDS).size).toBe(52);
    });
  });
  ```
- **VALIDATE**: green.

### Task 11: `hand-vs-range/problem.ts`
- **FILE**: `web/src/exercises/hand-vs-range/problem.ts`
- **IMPLEMENT**:
  ```typescript
  import { RANGES, HERO_HAND_POOL, getRangeById, type HandClass } from "@/data/rangeLibrary";
  import {
    ALL_CARDS,
    expandHandClassToCombos,
    type Card,
  } from "@/lib/handClass";

  export interface HandVsRangeProblem {
    /** Two cards, e.g. ["As", "Ks"]. */
    readonly hero: readonly [Card, Card];
    /** Range id from the library. */
    readonly villainRangeId: string;
    /** Three flop cards. */
    readonly board: readonly [Card, Card, Card];
  }

  export function isValidProblem(p: unknown): p is HandVsRangeProblem {
    if (typeof p !== "object" || p === null) return false;
    const x = p as Record<string, unknown>;
    if (!Array.isArray(x.hero) || x.hero.length !== 2) return false;
    if (typeof x.villainRangeId !== "string") return false;
    if (getRangeById(x.villainRangeId) === undefined) return false;
    if (!Array.isArray(x.board) || x.board.length !== 3) return false;
    const all = [...x.hero, ...x.board];
    if (new Set(all).size !== 5) return false;
    return all.every((c) => typeof c === "string" && (ALL_CARDS as readonly string[]).includes(c));
  }

  function pick<T>(arr: readonly T[], rng: () => number): T {
    return arr[Math.floor(rng() * arr.length)];
  }

  export function randomProblem(rng: () => number = Math.random): HandVsRangeProblem {
    while (true) {
      const heroClass: HandClass = pick(HERO_HAND_POOL, rng);
      const heroCombos = expandHandClassToCombos(heroClass);
      const heroCombo = pick(heroCombos, rng);
      const heroC1 = heroCombo.slice(0, 2) as Card;
      const heroC2 = heroCombo.slice(2, 4) as Card;
      const remaining = ALL_CARDS.filter((c) => c !== heroC1 && c !== heroC2);

      // Deal 3 distinct flop cards.
      const idx1 = Math.floor(rng() * remaining.length);
      const c1 = remaining[idx1];
      const rem2 = remaining.filter((_, i) => i !== idx1);
      const idx2 = Math.floor(rng() * rem2.length);
      const c2 = rem2[idx2];
      const rem3 = rem2.filter((_, i) => i !== idx2);
      const c3 = rem3[Math.floor(rng() * rem3.length)];

      const villain = pick(RANGES, rng);

      const problem: HandVsRangeProblem = {
        hero: [heroC1, heroC2],
        villainRangeId: villain.id,
        board: [c1, c2, c3],
      };
      if (isValidProblem(problem)) return problem;
      // Pathologically unreachable, but the loop guards us anyway.
    }
  }

  export function parseProblem(params: URLSearchParams): HandVsRangeProblem | null {
    const hero = params.get("hero");
    const range = params.get("range");
    const board = params.get("board");
    if (hero === null || range === null || board === null) return null;
    if (hero.length !== 4 || board.length !== 6) return null;
    const candidate = {
      hero: [hero.slice(0, 2), hero.slice(2, 4)] as const,
      villainRangeId: range,
      board: [board.slice(0, 2), board.slice(2, 4), board.slice(4, 6)] as const,
    };
    return isValidProblem(candidate) ? (candidate as HandVsRangeProblem) : null;
  }

  export function serializeProblem(p: HandVsRangeProblem): Record<string, string> {
    return {
      hero: `${p.hero[0]}${p.hero[1]}`,
      range: p.villainRangeId,
      board: `${p.board[0]}${p.board[1]}${p.board[2]}`,
    };
  }

  export function problemKey(p: HandVsRangeProblem): string {
    return `${p.hero[0]}${p.hero[1]}|${p.villainRangeId}|${p.board.join("")}`;
  }
  ```
- **GOTCHA**:
  1. The `as const` triple-tuple needs careful casting; `isValidProblem` is the runtime guard, the cast just satisfies TS.
  2. Don't optimize the random-flop deal with bit twiddling — readability over micro-perf for a 50-element array.
- **VALIDATE**: Task 12.

### Task 12: `hand-vs-range/problem.test.ts`
- **FILE**: `web/src/exercises/hand-vs-range/problem.test.ts`
- **IMPLEMENT**:
  ```typescript
  import { describe, it, expect } from "vitest";
  import {
    randomProblem,
    parseProblem,
    serializeProblem,
    problemKey,
    isValidProblem,
  } from "./problem";

  describe("randomProblem", () => {
    it("produces a valid problem over 200 trials", () => {
      for (let i = 0; i < 200; i++) {
        const p = randomProblem();
        expect(isValidProblem(p)).toBe(true);
      }
    });
    it("hero and board cards are all distinct", () => {
      for (let i = 0; i < 50; i++) {
        const p = randomProblem();
        const all = [...p.hero, ...p.board];
        expect(new Set(all).size).toBe(5);
      }
    });
  });

  describe("parse/serialize round-trip", () => {
    it("round-trips a fixture", () => {
      const fixture = randomProblem();
      const params = new URLSearchParams(serializeProblem(fixture));
      const parsed = parseProblem(params);
      expect(parsed).not.toBeNull();
      expect(problemKey(parsed!)).toBe(problemKey(fixture));
    });
    it("rejects missing fields", () => {
      expect(parseProblem(new URLSearchParams("hero=AsKs"))).toBeNull();
      expect(parseProblem(new URLSearchParams("hero=AsKs&range=btn_open"))).toBeNull();
    });
    it("rejects malformed cards", () => {
      expect(
        parseProblem(new URLSearchParams("hero=ZzZz&range=btn_open&board=Kh7d2c")),
      ).toBeNull();
    });
    it("rejects unknown range id", () => {
      expect(
        parseProblem(new URLSearchParams("hero=AsKs&range=does_not_exist&board=Kh7d2c")),
      ).toBeNull();
    });
  });
  ```
- **VALIDATE**: green.

### Task 13: `RangeGrid.tsx`
- **FILE**: `web/src/exercises/hand-vs-range/RangeGrid.tsx`
- **IMPLEMENT**:
  ```typescript
  import { RANKS } from "@/lib/handClass";
  import type { HandClass } from "@/data/rangeLibrary";

  export interface RangeGridProps {
    /** Which hand classes are highlighted as in-range. */
    hands: ReadonlySet<HandClass>;
  }

  function cellLabel(rowIdx: number, colIdx: number): HandClass {
    const r = RANKS[rowIdx];
    const c = RANKS[colIdx];
    if (rowIdx === colIdx) return `${r}${r}`;
    if (rowIdx < colIdx) return `${r}${c}s`;
    return `${c}${r}o`;
  }

  export function RangeGrid({ hands }: RangeGridProps) {
    return (
      <div
        role="img"
        aria-label="Villain range grid"
        className="grid grid-cols-13 gap-px rounded-md border border-zinc-200 bg-zinc-200 p-px"
      >
        {RANKS.map((_, r) =>
          RANKS.map((__, c) => {
            const label = cellLabel(r, c);
            const inRange = hands.has(label);
            return (
              <div
                key={`${r}-${c}`}
                className={
                  inRange
                    ? "flex aspect-square items-center justify-center bg-cyan-500 text-[8px] font-bold text-white tabular-nums"
                    : "flex aspect-square items-center justify-center bg-white text-[8px] font-medium text-zinc-400 tabular-nums"
                }
              >
                {label}
              </div>
            );
          }),
        )}
      </div>
    );
  }
  ```
- **GOTCHA**:
  1. `grid-cols-13` is not a default Tailwind class. Add it via the tailwind config (or use inline `style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}` to avoid touching config). **Pick the inline-style path** to keep this phase config-free.
  2. Cell aspect-square keeps the grid responsive; total width is bounded by the parent column.
  3. `text-[8px]` is intentionally tiny — readable on phone, and the position of the cell already conveys the hand. If labels are illegible at the rendered size during walkthrough, drop labels entirely (cells become unlabeled colored squares — a common range-chart convention).
- **VALIDATE**: Task 14.

### Task 14: `RangeGrid.test.tsx`
- **FILE**: `web/src/exercises/hand-vs-range/RangeGrid.test.tsx`
- **IMPLEMENT**:
  ```typescript
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { RangeGrid } from "./RangeGrid";

  describe("RangeGrid", () => {
    it("renders 169 cells", () => {
      const { container } = render(<RangeGrid hands={new Set()} />);
      // 13 rows × 13 cols = 169 leaf divs (under the role=img wrapper)
      const cells = container.querySelectorAll('[role="img"] > div');
      expect(cells.length).toBe(169);
    });
    it("labels (0,0) AA, (0,1) AKs, (1,0) AKo, (12,12) 22", () => {
      render(<RangeGrid hands={new Set()} />);
      expect(screen.getAllByText("AA").length).toBe(1);
      expect(screen.getAllByText("AKs").length).toBe(1);
      expect(screen.getAllByText("AKo").length).toBe(1);
      expect(screen.getAllByText("22").length).toBe(1);
    });
    it("differentiates in vs out by class", () => {
      const hands = new Set<string>(["AA", "KK", "AKs"]);
      const { container } = render(<RangeGrid hands={hands} />);
      const inCells = container.querySelectorAll(".bg-cyan-500");
      expect(inCells.length).toBe(3);
    });
  });
  ```
- **VALIDATE**: green.

### Task 15: `HandVsRangeStage.tsx`
- **FILE**: `web/src/exercises/hand-vs-range/HandVsRangeStage.tsx`
- **IMPLEMENT**:
  ```typescript
  "use client";
  import { PlayingCard } from "../equity/PlayingCard";
  import { getRangeById } from "@/data/rangeLibrary";
  import { RangeGrid } from "./RangeGrid";
  import type { HandVsRangeProblem } from "./problem";

  export function HandVsRangeStage({ problem }: { problem: HandVsRangeProblem }) {
    const range = getRangeById(problem.villainRangeId);
    return (
      <section
        aria-label="Hand vs range problem"
        className="flex flex-col items-center justify-center gap-6"
      >
        <div className="flex w-full max-w-[20rem] flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Villain — {range?.name ?? "unknown range"}
          </p>
          <RangeGrid hands={range?.hands ?? new Set()} />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Board
          </p>
          <div className="flex gap-2">
            {problem.board.map((c) => (
              <PlayingCard key={c} card={c} />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Hero
          </p>
          <div className="flex gap-2">
            {problem.hero.map((c) => (
              <PlayingCard key={c} card={c} />
            ))}
          </div>
        </div>
      </section>
    );
  }
  ```
- **GOTCHA**:
  1. Confirm `PlayingCard` accepts a `card` prop in the format `"As"` (existing format from equity). If it currently takes hand-pair input only, refactor minimally — most likely it already works on a single card.
  2. The `max-w-[20rem]` on the grid wrapper (~320px) plus `aspect-square` cells gives ≈24px per cell. Adjust during walkthrough if too cramped.
- **VALIDATE**: Visual at Task 19.

### Task 16: `hand-vs-range/exercise.ts`
- **FILE**: `web/src/exercises/hand-vs-range/exercise.ts`
- **IMPLEMENT**:
  ```typescript
  import type { Exercise } from "../types";
  import {
    type HandVsRangeProblem,
    randomProblem,
    parseProblem,
    serializeProblem,
    problemKey,
  } from "./problem";
  import { HandVsRangeStage } from "./HandVsRangeStage";
  import { getRangeById, rangeToEngineString } from "@/data/rangeLibrary";

  const TOLERANCE = 10;
  const ANCHORS: readonly number[] = [0, 20, 40, 60, 80, 100];

  export const handVsRangeExercise: Exercise<HandVsRangeProblem> = {
    type: "hand-vs-range",
    prompt: "What's Hero's equity on the flop?",
    tooltipLabel: "Actual Equity",
    barPrompt: "drag to estimate equity",
    tolerance: TOLERANCE,
    axisAnchors: ANCHORS,
    formatValue: (n) => `${n.toFixed(1)}%`,
    generateProblem: (rng) => randomProblem(rng),
    parseProblem,
    serializeProblem,
    problemKey,
    computeTruth: (p, engine) => {
      if (engine === null) return null;
      const range = getRangeById(p.villainRangeId);
      if (range === undefined) return null;
      const heroCombo = `${p.hero[0]}${p.hero[1]}`;
      const flop = `${p.board[0]}${p.board[1]}${p.board[2]}`;
      try {
        return engine.equityVsRangeFlop(heroCombo, rangeToEngineString(range), flop) * 100;
      } catch {
        return null;
      }
    },
    Stage: HandVsRangeStage,
  };
  ```
- **GOTCHA**: `computeTruth` returning `null` triggers the shell's existing loading state. If the engine call throws (range conflicts entirely with board, or any other path), null is the correct signal — the screen shows the spinner, but in practice a fresh `randomProblem` is always solvable. Only deeply-pathological URL inputs can trigger this.
- **VALIDATE**: Task 17.

### Task 17: `hand-vs-range/exercise.test.ts`
- **FILE**: `web/src/exercises/hand-vs-range/exercise.test.ts`
- **IMPLEMENT**: Round-trip serialize/parse via the `Exercise` interface; `computeTruth` returns `null` when engine is null and a finite number in `[0, 100]` when engine is present (use the existing pkg-node alias the equity test uses).
- **VALIDATE**: green.

### Task 18: Register in `registry.ts`
- **FILE**: `web/src/exercises/registry.ts`
- **AFTER**:
  ```typescript
  import type { Exercise } from "./types";
  import { equityExercise } from "./equity/exercise";
  import { potOddsExercise } from "./pot-odds/exercise";
  import { handVsRangeExercise } from "./hand-vs-range/exercise";

  export const exercises: ReadonlyArray<Exercise<unknown>> = [
    equityExercise as Exercise<unknown>,
    potOddsExercise as Exercise<unknown>,
    handVsRangeExercise as Exercise<unknown>,
  ];

  export function getExerciseByType(type: string | null): Exercise<unknown> {
    if (type !== null) {
      const found = exercises.find((e) => e.type === type);
      if (found !== undefined) return found;
    }
    return exercises[0];
  }
  ```
- **GOTCHA**: First entry stays `equityExercise` so the no-`type` URL keeps loading equity (backward compat).
- **VALIDATE**: tsc clean.

### Task 19: ExerciseScreen render tests for `?type=hand-vs-range`
- **FILE**: `web/src/components/exercise/ExerciseScreen.test.tsx`
- **IMPLEMENT**: Mirror the pot-odds describe block. Cover:
  - Renders the prompt "What's Hero's equity on the flop?".
  - Renders the range name (e.g., "BTN open") for a fixture URL.
  - Renders 5 `PlayingCard` testids (3 board + 2 hero).
  - Renders 169 grid cells.
- **GOTCHA**: Use a fixture range id that is guaranteed to exist (e.g., `btn_open`). If unsure, hardcode `RANGES[0].id` via a test-time import.
- **VALIDATE**: `npm test ExerciseScreen` green.

### Task 20: Manual Pixel + dev-server walkthrough
- **ACTION**:
  - `cd web && npm run dev`
  - Visit `/?type=hand-vs-range` on Pixel and on desktop Chrome.
  - Drag, release, "next" 5×.
  - Verify: equity reveals look plausible (sanity, not exact), tolerance feels right, grid is readable, board + hero + grid all fit a phone viewport without horizontal scroll.
  - **Capture engine timing**: in Chrome devtools Performance tab on Pixel, time 5 `equity_vs_range_flop` calls. Record median + max. The PRD's open question about complex-problem perf gets answered here. Numbers go in the implementation report, not in code.
  - Reduced-motion: confirm degradation.
- **VALIDATE**: 5 problems back-to-back without thinking about the app; perf numbers captured.

### Task 21: PRD update
- **FILE**: `.claude/PRPs/prds/poker-trainer.prd.md`
- **EDIT**:
  1. Phase 7 row in the table at line ~194: status `in-progress` → `complete`. The footer already says complete; the table is stale.
  2. Append a Phase 8 row with `complete` after this work lands (or `in-progress` if the report isn't drafted yet — match Phase 7 conventions).
  3. Add a Phase 8 description block under "Phase Details", matching the format of Phase 7's block.
  4. Add a footer note: `*Updated: <today> — Phase 8 added (hand vs range, flop equity)*`.
- **VALIDATE**: visual diff of the table.

---

## Testing Strategy

### Unit Tests (new + updated)

| Test | Input | Expected | Type |
|---|---|---|---|
| Engine: AKs vs premium range on dry flop | "AsKs", "AA,KK,QQ,JJ,TT", "Kh7d2c" | equity ∈ (0.20, 0.55) | unit (Rust) |
| Engine: AA vs wide range on dry flop | "AsAh", wide range, "7c2d3h" | equity > 0.80 | unit (Rust) |
| Engine: invalid hero combo errors | "garbage", "AA", "Kh7d2c" | Err | unit (Rust) |
| Engine: invalid flop errors | "AsKs", "AA", "garbage" | Err | unit (Rust) |
| Engine: hero conflicts with board errors | "AsKs", "QQ", "AsKh2d" | Err | unit (Rust) |
| Web engine wrapper: returns finite number | one fixture | result ∈ [0, 1] | unit (TS) |
| `RANGES` has ≥ 20 entries | n/a | ≥ 20 | unit (TS) |
| Range ids unique | n/a | unique | unit (TS) |
| `HERO_HAND_POOL` includes AA / AKs / AKo | n/a | true | unit (TS) |
| `expandHandClassToCombos` AA → 6 | "AA" | 6 unique | unit (TS) |
| `expandHandClassToCombos` AKs → 4 same-suit | "AKs" | 4 same-suit | unit (TS) |
| `expandHandClassToCombos` AKo → 12 different-suit | "AKo" | 12 different-suit | unit (TS) |
| `expandHandClassToCombos` rejects garbage | "AKz" | throws | unit (TS) |
| `randomProblem` valid over 200 trials | n/a | every problem valid | unit (TS) |
| `randomProblem` 5 distinct cards | n/a | always 5 unique | unit (TS) |
| `parseProblem` round-trip | fixture | matches `problemKey` | contract |
| `parseProblem` rejects missing fields | partial URL | null | contract |
| `parseProblem` rejects malformed cards | bad URL | null | contract |
| `parseProblem` rejects unknown range id | bad URL | null | contract |
| `RangeGrid` renders 169 cells | empty hands | 169 leaf divs | render |
| `RangeGrid` labels corner cells correctly | n/a | AA / AKs / AKo / 22 present | render |
| `RangeGrid` highlights in-range cells | { AA, KK, AKs } | 3 highlighted | render |
| `ExerciseScreen` hand-vs-range prompt | URL | "What's Hero's equity on the flop?" | render |
| `ExerciseScreen` hand-vs-range cards | URL with fixture | 5 PlayingCard testids | render |
| `ExerciseScreen` hand-vs-range range name | URL with `range=btn_open` | "BTN open" present | render |
| Equity exercise unchanged | URL | prior assertions still pass | regression |
| Pot-odds exercise unchanged | URL | prior assertions still pass | regression |

### Edge Cases Checklist
- [ ] `?type=hand-vs-range` with no other params → generates random, writes URL via `router.replace`
- [ ] `?type=hand-vs-range&hero=AsKs&range=btn_open&board=Kh7d2c` → renders that exact problem
- [ ] `?type=hand-vs-range&range=does_not_exist&...` → validation rejects, falls back to random
- [ ] `?type=hand-vs-range&hero=AsAs&range=btn_open&board=Kh7d2c` → validation rejects (hero has duplicate cards)
- [ ] `?type=hand-vs-range&hero=AsKs&range=btn_open&board=AsKh2d` → validation rejects (hero conflicts with board)
- [ ] Engine error during `computeTruth` → screen stays in loading state (does not crash); refresh produces a fresh problem
- [ ] Reduced-motion → instant transitions, no fireworks
- [ ] Same problem URL refreshed → reproduces exact same problem and equity

---

## Validation Commands

### Engine
```bash
cd engine
cargo test
cargo clippy --all-targets -- -D warnings
cargo fmt --check
wasm-pack build --target bundler
wasm-pack build --target nodejs --out-dir pkg-node
```
EXPECT: zero failures, zero warnings, both pkg dirs updated.

### Web — Static Analysis
```bash
cd web && npx tsc --noEmit --pretty false
cd web && npm run lint
```
EXPECT: zero errors.

### Web — Unit Tests
```bash
cd web && npm test
```
EXPECT: all prior tests pass + ~25 new tests pass.

### Web — Build
```bash
cd web && npm run build
```
EXPECT: Next 16 build succeeds; bundle size diff under +30 KB gzipped (range data + grid + new exercise; biggest chunk is `rangeData.ts`).

### Manual Validation
- [ ] Engine perf measured on Pixel; numbers logged in implementation report.
- [ ] `web/src/data/rangeLibrary.ts` exists; `RANGES.length` and `HERO_HAND_POOL.length` log to console once during dev for sanity.
- [ ] `web/src/exercises/hand-vs-range/` exists with all six files.
- [ ] No edits to `ExerciseScreen.tsx`, `EstimationBar.tsx`, `Axis.tsx`, `ActualValueTooltip.tsx`, `FireworkBurst.tsx`, `useAutoAdvance.ts`, `feedbackCopy.ts`. The shell handles the new exercise without modification — that's the abstraction working.

---

## Acceptance Criteria
- [ ] `/` (no params) still renders the equity exercise (backward compat).
- [ ] `/?type=pot-odds` still renders the pot-odds exercise unchanged.
- [ ] `/?type=hand-vs-range` renders a random hand-vs-range problem; URL backfilled.
- [ ] `/?type=hand-vs-range&hero=AsKs&range=btn_open&board=Kh7d2c` renders that exact problem; tooltip on success shows the engine's reported equity.
- [ ] "Next" stays in `hand-vs-range` and updates the URL via `router.replace`.
- [ ] All shared primitives are imported by the new exercise without forking.
- [ ] No new dependency added to `package.json` or `Cargo.toml`.
- [ ] All Vitest tests pass; all Rust tests pass; tsc + ESLint clean; `npm run build` green; both WASM pkg dirs committed.
- [ ] Manual Pixel walkthrough: 5 problems back-to-back without UI fight; perf numbers captured.
- [ ] PRD updated: Phase 7 row flipped to `complete`; Phase 8 row added with status; footer date stamped.

## Completion Checklist
- [ ] Code follows discovered patterns (PascalCase props interface, named-function components, named exports).
- [ ] Animations stay on `transform`/`opacity` only (no new animations needed in this phase).
- [ ] No `console.log` in shipped paths.
- [ ] No engine import outside `lib/engine.ts` and exercise definition files.
- [ ] Range library is imported once at module init; no per-render re-flattening.
- [ ] Implementation report drafted at `.claude/PRPs/reports/phase-8-hand-vs-range-flop-report.md` after the work is done; report includes the perf measurements, the abstraction-held-up assessment, and any open questions surfaced (especially around grid readability or whether the random-range pick produces enough variety).

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `pokers::exact_equity` on flop is too slow on Pixel for live UX | MEDIUM | HIGH | Pre-compute on screen mount, not on release; if median > 250ms on Pixel, add a "computing…" affordance and surface the perf number in the report so the next phase can opt into MC |
| Grid cell labels illegible at 24px on phone | MEDIUM | LOW | Drop labels (cells become unlabeled colored squares) — common chart convention. Decision in walkthrough. |
| `pokers::HandRange::from_string` chokes on a hand-class string in the user's data (e.g., a notation we don't expect) | LOW | MEDIUM | Sanity test in Task 8 iterates every range and rebuilds via `rangeToEngineString` — but the engine wrapper must also handle empty-range error gracefully. |
| `HERO_HAND_POOL` has a class that no range cleanly contains, causing odd Hero hands like `27o` (if it's in the pool) | LOW | LOW | The pool is sourced *from* the ranges, so by construction every class in the pool appears in at least one range. Not a bug, but worth a one-line console-log of the pool size at first run for sanity. |
| Card-removal makes some Villain ranges sparse on certain flops, distorting equity | EXPECTED | NONE | This is the math being correct — removed combos correctly don't contribute. Don't "fix" it. |
| Three-card flop URL format collides with a future board format if we extend to turn/river | LOW | LOW | When Phase 9+ lands, extend the `board` URL param to support 3/4/5 card lengths. No migration needed for Phase 8 URLs. |
| Random range pick lands on the same range twice in a row, feeling repetitive | LOW | LOW | Acceptable noise for a prototype; if it bites in walkthrough, add a "don't repeat last range" check (1-line). Don't pre-emptively build it. |

## Notes
- **Why one phase, not two.** Splitting "engine fn" from "UI" is tempting but the phase is small enough to do as a unit, and the integration risk (TS types from the rebuilt WASM) is best caught in one commit.
- **Why the engine work is so small.** `pokers` already exposes range-vs-range exact equity with a board mask. Our wrapper is configuration, not algorithm. The complexity in this phase is the UI and the data plumbing, not the math.
- **Why we vendor the range data.** The user's prior project is the canonical source. Vendoring keeps this app self-contained and avoids a runtime fetch / build-time download. Future re-fetches are a one-line `gh api` call.
- **Why no MC fallback.** Decided post-discussion. The point of this phase includes measuring exact-equity perf on Pixel — if we ship MC eagerly we can't compare.
- **Why no scenario tagging on ranges.** YAGNI. The library has category names (e.g., "Open Raises", "vs. LJ") that we *could* surface, but until "rotate by scenario" is a real feature, a flat random pick is enough.
- **Why ±10 pp tolerance, not tighter.** Hand-vs-range equity has more variance than hand-vs-hand (range averaging and card removal both spread answers). Same tolerance keeps the user-facing rule consistent across exercises; revisit if play-testing says otherwise.
- **Phase 7 still shows "in-progress" in the PRD table.** Stale. Task 21 fixes it while we're editing the file.
