import { describe, it, expect } from "vitest";
import {
  valueFromClientY,
  fractionFromValue,
  isWithinTolerance,
  assertSliderProps,
} from "./sliderMath";

describe("valueFromClientY", () => {
  it("returns max at the top of the track", () => {
    expect(valueFromClientY(100, 100, 400, 0, 100)).toBe(100);
  });
  it("returns min at the bottom of the track", () => {
    expect(valueFromClientY(500, 100, 400, 0, 100)).toBe(0);
  });
  it("clamps above max when pointer is above the track", () => {
    expect(valueFromClientY(50, 100, 400, 0, 100)).toBe(100);
  });
  it("clamps below min when pointer is below the track", () => {
    expect(valueFromClientY(600, 100, 400, 0, 100)).toBe(0);
  });
  it("interpolates linearly at midpoint", () => {
    expect(valueFromClientY(300, 100, 400, 0, 100)).toBeCloseTo(50, 5);
  });
  it("supports non-zero min", () => {
    expect(valueFromClientY(300, 100, 400, 20, 80)).toBeCloseTo(50, 5);
  });
  it("returns min when trackHeight is 0", () => {
    expect(valueFromClientY(100, 100, 0, 0, 100)).toBe(0);
  });
});

describe("fractionFromValue", () => {
  it("returns 0 at min", () => {
    expect(fractionFromValue(0, 0, 100)).toBe(0);
  });
  it("returns 1 at max", () => {
    expect(fractionFromValue(100, 0, 100)).toBe(1);
  });
  it("returns 0.5 at midpoint", () => {
    expect(fractionFromValue(50, 0, 100)).toBeCloseTo(0.5, 5);
  });
  it("clamps below 0", () => {
    expect(fractionFromValue(-10, 0, 100)).toBe(0);
  });
  it("clamps above 1", () => {
    expect(fractionFromValue(150, 0, 100)).toBe(1);
  });
});

describe("isWithinTolerance", () => {
  const cases: Array<[number, number, number, boolean]> = [
    [46, 46, 4, true],
    [42, 46, 4, true],
    [50, 46, 4, true],
    [41.999, 46, 4, false],
    [50.001, 46, 4, false],
    [46, 46, 0, true],
    [46.0001, 46, 0, false],
  ];
  for (const [value, truth, tol, expected] of cases) {
    it(`|${value} - ${truth}| <= ${tol} → ${expected}`, () => {
      expect(isWithinTolerance(value, truth, tol)).toBe(expected);
    });
  }
});

describe("assertSliderProps", () => {
  it("accepts a valid configuration", () => {
    expect(() => assertSliderProps(0, 100, 46, 4)).not.toThrow();
  });
  it("accepts truth at min boundary", () => {
    expect(() => assertSliderProps(0, 100, 0, 4)).not.toThrow();
  });
  it("accepts truth at max boundary", () => {
    expect(() => assertSliderProps(0, 100, 100, 4)).not.toThrow();
  });
  it("accepts tolerance of 0", () => {
    expect(() => assertSliderProps(0, 100, 50, 0)).not.toThrow();
  });
  it("throws when min >= max", () => {
    expect(() => assertSliderProps(100, 0, 50, 4)).toThrow();
  });
  it("throws when min === max", () => {
    expect(() => assertSliderProps(50, 50, 50, 4)).toThrow();
  });
  it("throws when truth is above max", () => {
    expect(() => assertSliderProps(0, 100, 150, 4)).toThrow();
  });
  it("throws when truth is below min", () => {
    expect(() => assertSliderProps(0, 100, -1, 4)).toThrow();
  });
  it("throws when tolerance is negative", () => {
    expect(() => assertSliderProps(0, 100, 50, -1)).toThrow();
  });
});
