import { describe, it, expect } from "vitest";
import {
  pickPhrase,
  SUCCESS_PHRASES,
  MISS_PHRASES,
  seededFloat,
} from "./feedbackCopy";

describe("pickPhrase", () => {
  it("is deterministic for the same seed + kind", () => {
    expect(pickPhrase("AsKsQhQd", "success")).toBe(
      pickPhrase("AsKsQhQd", "success"),
    );
    expect(pickPhrase("AsKsQhQd", "miss")).toBe(
      pickPhrase("AsKsQhQd", "miss"),
    );
  });

  it("returns a phrase from the success list when kind=success", () => {
    const phrase = pickPhrase("AsKsQhQd", "success");
    expect(SUCCESS_PHRASES).toContain(phrase);
  });

  it("returns a phrase from the miss list when kind=miss", () => {
    const phrase = pickPhrase("AsKsQhQd", "miss");
    expect(MISS_PHRASES).toContain(phrase);
  });

  it("returns a non-empty string", () => {
    expect(pickPhrase("anything", "success").length).toBeGreaterThan(0);
    expect(pickPhrase("", "miss").length).toBeGreaterThan(0);
  });
});

describe("seededFloat", () => {
  it("returns a deterministic value in [0, 1] for the same seed+salt", () => {
    const a = seededFloat("AsKsQhQd", 0);
    const b = seededFloat("AsKsQhQd", 0);
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(1);
  });

  it("varies with salt", () => {
    const a = seededFloat("AsKsQhQd", 0);
    const b = seededFloat("AsKsQhQd", 1);
    expect(a).not.toBe(b);
  });
});
