import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ExerciseScreen } from "./ExerciseScreen";
import { SUCCESS_HOLD_MS } from "./exerciseConfig";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("a=AsKs&b=QhQd"),
}));

beforeEach(() => {
  replaceMock.mockClear();
});

function stubPointerCapture(el: HTMLElement) {
  Object.assign(el, {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    hasPointerCapture: vi.fn(() => true),
  });
}

function stubBoundingRect(el: HTMLElement, rect: Partial<DOMRect> = {}) {
  el.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 400,
      bottom: 800,
      width: 400,
      height: 800,
      toJSON: () => ({}),
      ...rect,
    }) as DOMRect;
}

describe("ExerciseScreen — render contract", () => {
  it("renders the prompt", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hand A/i);
  });

  it("renders four playing cards (two per hand)", async () => {
    const { container } = render(<ExerciseScreen />);
    await screen.findByText(/equity of Hand A/i);
    const cards = container.querySelectorAll('[data-testid="playing-card"]');
    expect(cards.length).toBe(4);
  });

  it("mounts the estimation bar with vertical slider role", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hand A/i);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("starts in the idle phase", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hand A/i);
    const root = screen.getByTestId("exercise-screen");
    expect(root.getAttribute("data-screen-phase")).toBe("idle");
  });
});

describe("ExerciseScreen — phase transitions", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("transitions idle → dragging → miss on a release outside tolerance", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hand A/i);
    const root = screen.getByTestId("exercise-screen");
    const slider = screen.getByRole("slider") as HTMLElement;
    stubBoundingRect(slider);
    stubPointerCapture(slider);

    // pointerDown near the bottom of the screen (inside the idle bar zone)
    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 780 });
    expect(root.getAttribute("data-screen-phase")).toBe("dragging");

    // release at the very top → value=100 (truth for AsKs vs QhQd is ~46)
    fireEvent.pointerUp(slider, { pointerId: 1, clientY: 0 });
    expect(root.getAttribute("data-screen-phase")).toBe("miss");
  });

  it("transitions to success when release is within tolerance", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hand A/i);
    const root = screen.getByTestId("exercise-screen");
    const slider = screen.getByRole("slider") as HTMLElement;
    stubBoundingRect(slider);
    stubPointerCapture(slider);

    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 780 });
    // release near midpoint (clientY=400 → value=50, truth ~46.3, tol=10)
    fireEvent.pointerUp(slider, { pointerId: 1, clientY: 400 });
    expect(root.getAttribute("data-screen-phase")).toBe("success");
  });

  it("auto-advances after success by calling router.replace", async () => {
    vi.useFakeTimers();
    render(<ExerciseScreen />);
    await act(async () => {
      await Promise.resolve();
    });
    const slider = screen.getByRole("slider") as HTMLElement;
    stubBoundingRect(slider);
    stubPointerCapture(slider);

    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 780 });
    fireEvent.pointerUp(slider, { pointerId: 1, clientY: 400 });

    expect(replaceMock).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(SUCCESS_HOLD_MS);
    });
    expect(replaceMock).toHaveBeenCalledTimes(1);
  });
});
