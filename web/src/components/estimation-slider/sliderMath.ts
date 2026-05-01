export function valueFromClientY(
  clientY: number,
  trackTop: number,
  trackHeight: number,
  min: number,
  max: number,
): number {
  if (trackHeight <= 0) return min;
  const fractionFromTop = (clientY - trackTop) / trackHeight;
  const clamped = Math.min(1, Math.max(0, fractionFromTop));
  // Top of track maps to max; bottom maps to min.
  return max - clamped * (max - min);
}

export function fractionFromValue(
  value: number,
  min: number,
  max: number,
): number {
  if (max === min) return 0;
  const raw = (value - min) / (max - min);
  return Math.min(1, Math.max(0, raw));
}

export function isWithinTolerance(
  value: number,
  truth: number,
  tolerance: number,
): boolean {
  return Math.abs(value - truth) <= tolerance;
}

export function assertSliderProps(
  min: number,
  max: number,
  truth: number,
  tolerance: number,
): void {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error("EstimationSlider: min and max must be finite numbers");
  }
  if (min >= max) {
    throw new Error(
      `EstimationSlider: min (${min}) must be less than max (${max})`,
    );
  }
  if (!Number.isFinite(truth) || truth < min || truth > max) {
    throw new Error(
      `EstimationSlider: truth (${truth}) must be within [${min}, ${max}]`,
    );
  }
  if (!Number.isFinite(tolerance) || tolerance < 0) {
    throw new Error(
      `EstimationSlider: tolerance (${tolerance}) must be >= 0`,
    );
  }
}
