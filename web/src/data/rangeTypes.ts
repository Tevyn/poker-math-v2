// Vendored from https://github.com/Tevyn/poker-math (src/types/rangeTypes.ts).
// Imported as-is — modifications go in `rangeLibrary.ts`.
export interface PokerRange {
  raise?: string[];
  call?: string[];
  fold?: string[];
}

export interface RangeData {
  name: string;
  range: PokerRange;
}

export interface Category {
  name: string;
  ranges: Record<string, RangeData>;
}

export interface RangeCategories {
  [categoryId: string]: Category;
}

export interface HandPracticeQuestion {
  hand: string;
  correctActions: Record<string, string>; // rangeId -> action (raise/call/fold)
}

export interface RangeTestResult {
  rangeId: string;
  userSelections: Record<string, string>; // hand -> action
  correctSelections: Record<string, string>; // hand -> action
  accuracy: number;
  totalHands: number;
  correctHands: number;
}

export interface HandPracticeResult {
  hand: string;
  userAnswers: Record<string, string>; // rangeId -> action
  correctAnswers: Record<string, string>; // rangeId -> action
  isCorrect: boolean;
  accuracy: number;
}
