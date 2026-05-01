use pokers::{exact_equity, HandRange, SimulatorError};
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn count_combos(range_str: &str) -> u32 {
    let ranges = HandRange::from_strings(vec![range_str.to_string()]);
    ranges[0].hands.len() as u32
}

fn compute_equity(hand_a: &str, hand_b: &str) -> Result<f32, String> {
    let ranges = HandRange::from_strings(vec![hand_a.to_string(), hand_b.to_string()]);
    if ranges[0].hands.is_empty() || ranges[1].hands.is_empty() {
        return Err("invalid hand".to_string());
    }

    let cancel_token = Arc::new(AtomicBool::new(false));
    let result = exact_equity(&ranges, 0u64, 0u64, 1, cancel_token, |_progress: u8| {})
        .map_err(|e| match e {
            SimulatorError::ConflictingRanges => "hands conflict".to_string(),
            other => format!("equity failed: {other:?}"),
        })?;

    Ok(result.equities[0] as f32)
}

#[wasm_bindgen]
pub fn equity_vs(hand_a: &str, hand_b: &str) -> Result<f32, JsError> {
    compute_equity(hand_a, hand_b).map_err(|msg| JsError::new(&msg))
}

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    #[test]
    fn pocket_aces_has_six_combos() {
        assert_eq!(count_combos("AA"), 6);
    }

    #[test]
    fn ako_offsuit_has_twelve_combos() {
        assert_eq!(count_combos("AKo"), 12);
    }

    #[test]
    fn aces_vs_kings_equity_around_81_percent() {
        let eq = compute_equity("AsAh", "KsKh").unwrap();
        assert!(eq > 0.80 && eq < 0.83, "expected ~0.81, got {eq}");
    }

    #[test]
    fn cooler_setup_aks_vs_qq_equity_around_46_percent() {
        // AKs (suited) vs QQ is ~46.2%; AKo would be ~43%. PRD said 0.43
        // but the seeded hands are suited — engine is right, PRD note was off.
        let eq = compute_equity("AsKs", "QhQd").unwrap();
        assert!(eq > 0.45 && eq < 0.47, "expected ~0.46, got {eq}");
    }

    #[test]
    fn mirror_pair_aces_equity_is_half() {
        let eq = compute_equity("AsAh", "AdAc").unwrap();
        assert!(eq > 0.49 && eq < 0.51, "expected ~0.50, got {eq}");
    }

    #[test]
    fn invalid_hand_returns_error() {
        assert!(compute_equity("garbage", "AsKs").is_err());
    }

    #[test]
    fn conflicting_hands_return_error() {
        assert!(compute_equity("AsKs", "AsQh").is_err());
    }

    fn card_to_str(card: u8) -> String {
        let rank = (card / 4) as usize;
        let suit = (card % 4) as usize;
        let ranks = b"23456789TJQKA";
        let suits = b"shdc";
        format!("{}{}", ranks[rank] as char, suits[suit] as char)
    }

    proptest! {
        #![proptest_config(ProptestConfig { cases: 16, .. ProptestConfig::default() })]

        // Heads-up pre-flop with no board has all outcomes accounted for between
        // both players (wins + halved ties), so equity_ab + equity_ba == 1.
        // Catches input-ordering bugs and any wrapper-level invariant breaks.
        #[test]
        fn equity_sums_to_one(
            a in 0u8..52,
            b in 0u8..52,
            c in 0u8..52,
            d in 0u8..52,
        ) {
            let cards = [a, b, c, d];
            for i in 0..4 {
                for j in (i + 1)..4 {
                    prop_assume!(cards[i] != cards[j]);
                }
            }
            let hand_a = format!("{}{}", card_to_str(a), card_to_str(b));
            let hand_b = format!("{}{}", card_to_str(c), card_to_str(d));

            let eq_ab = compute_equity(&hand_a, &hand_b).unwrap();
            let eq_ba = compute_equity(&hand_b, &hand_a).unwrap();
            let sum = eq_ab + eq_ba;
            prop_assert!((sum - 1.0).abs() < 1e-3, "eq_ab + eq_ba = {sum}, hands={hand_a} vs {hand_b}");
        }
    }
}
