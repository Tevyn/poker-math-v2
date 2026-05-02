import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAutoAdvance } from "./useAutoAdvance";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAutoAdvance", () => {
  it("fires once after delayMs when active=true", () => {
    const fn = vi.fn();
    renderHook(() => useAutoAdvance(true, 1200, fn));
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1199);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not fire when active=false", () => {
    const fn = vi.fn();
    renderHook(() => useAutoAdvance(false, 1200, fn));
    vi.advanceTimersByTime(5000);
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancels on unmount", () => {
    const fn = vi.fn();
    const { unmount } = renderHook(() => useAutoAdvance(true, 1200, fn));
    vi.advanceTimersByTime(500);
    unmount();
    vi.advanceTimersByTime(2000);
    expect(fn).not.toHaveBeenCalled();
  });

  it("uses the latest callback identity without resetting the timer", () => {
    const a = vi.fn();
    const b = vi.fn();
    const { rerender } = renderHook(
      ({ cb }: { cb: () => void }) => useAutoAdvance(true, 1200, cb),
      { initialProps: { cb: a } },
    );
    vi.advanceTimersByTime(600);
    rerender({ cb: b });
    vi.advanceTimersByTime(600);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
});
