use pokers::HandRange;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn count_combos(range_str: &str) -> u32 {
    let ranges = HandRange::from_strings(vec![range_str.to_string()]);
    ranges[0].hands.len() as u32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pocket_aces_has_six_combos() {
        assert_eq!(count_combos("AA"), 6);
    }

    #[test]
    fn ako_offsuit_has_twelve_combos() {
        assert_eq!(count_combos("AKo"), 12);
    }
}
