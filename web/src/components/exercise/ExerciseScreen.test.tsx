import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ExerciseScreen } from "./ExerciseScreen";
import { SUCCESS_HOLD_MS } from "./exerciseConfig";

const replaceMock = vi.fn();
const useSearchParamsMock = vi.fn(
  () => new URLSearchParams("type=equity&a=AsKs&b=QhQd"),
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  useSearchParams: () => useSearchParamsMock(),
}));

beforeEach(() => {
  replaceMock.mockClear();
  useSearchParamsMock.mockReturnValue(
    new URLSearchParams("type=equity&a=AsKs&b=QhQd"),
  );
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

describe("ExerciseScreen — equity render contract", () => {
  it("renders the prompt", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hero/i);
  });

  it("renders four playing cards (two per hand)", async () => {
    const { container } = render(<ExerciseScreen />);
    await screen.findByText(/equity of Hero/i);
    const cards = container.querySelectorAll('[data-testid="playing-card"]');
    expect(cards.length).toBe(4);
  });

  it("mounts the estimation bar with vertical slider role", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hero/i);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("starts in the idle phase", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hero/i);
    const root = screen.getByTestId("exercise-screen");
    expect(root.getAttribute("data-screen-phase")).toBe("idle");
  });

  it("mounts the estimation bar with the equity prompt", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hero/i);
    expect(screen.getByText(/drag to estimate equity/i)).toBeTruthy();
  });
});

describe("ExerciseScreen — equity defaulting", () => {
  it("defaults to equity when type is missing", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("a=AsKs&b=QhQd"),
    );
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hero/i);
  });

  it("defaults to equity when type is unknown", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("type=mystery&a=AsKs&b=QhQd"),
    );
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hero/i);
  });
});

describe("ExerciseScreen — phase transitions (equity)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("transitions idle → dragging → miss on a release outside tolerance", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hero/i);
    const root = screen.getByTestId("exercise-screen");
    const slider = screen.getByRole("slider") as HTMLElement;
    stubBoundingRect(slider);
    stubPointerCapture(slider);

    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 780 });
    expect(root.getAttribute("data-screen-phase")).toBe("dragging");

    fireEvent.pointerUp(slider, { pointerId: 1, clientY: 0 });
    expect(root.getAttribute("data-screen-phase")).toBe("miss");
  });

  it("transitions to success when release is within tolerance", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hero/i);
    const root = screen.getByTestId("exercise-screen");
    const slider = screen.getByRole("slider") as HTMLElement;
    stubBoundingRect(slider);
    stubPointerCapture(slider);

    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 780 });
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

describe("ExerciseScreen — hand-vs-range variant", () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams(
        "type=hand-vs-range&hero=AsKs&range=btn_open&board=Kh7d2c",
      ),
    );
  });

  it("renders the hand-vs-range prompt", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/Hero's equity on the flop/i);
  });

  it("renders the villain range name", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/Hero's equity on the flop/i);
    expect(screen.getByText(/BTN open/i)).toBeTruthy();
  });

  it("renders five playing cards (3 board + 2 hero)", async () => {
    const { container } = render(<ExerciseScreen />);
    await screen.findByText(/Hero's equity on the flop/i);
    const cards = container.querySelectorAll('[data-testid="playing-card"]');
    expect(cards.length).toBe(5);
  });

  it("renders 169 grid cells", async () => {
    const { container } = render(<ExerciseScreen />);
    await screen.findByText(/Hero's equity on the flop/i);
    const cells = container.querySelectorAll(
      '[role="img"][aria-label="Villain range grid"] > div',
    );
    expect(cells.length).toBe(169);
  });

  it("mounts the estimation bar with the equity prompt", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/Hero's equity on the flop/i);
    expect(screen.getByText(/drag to estimate equity/i)).toBeTruthy();
  });
});

describe("ExerciseScreen — breakeven variant", () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("type=breakeven&pot=100&bet=50"),
    );
  });

  it("renders the breakeven prompt", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/your breakeven %/i);
  });

  it("does not render playing cards for breakeven", async () => {
    const { container } = render(<ExerciseScreen />);
    await screen.findByText(/your breakeven %/i);
    expect(container.querySelectorAll('[data-testid="playing-card"]').length).toBe(0);
  });

  it("renders the pot and bet values", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/your breakeven %/i);
    expect(screen.getByText("$100")).toBeTruthy();
    expect(screen.getByText("$50")).toBeTruthy();
  });

  it("mounts the estimation bar with breakeven prompt", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/your breakeven %/i);
    expect(screen.getByText(/drag to estimate breakeven/i)).toBeTruthy();
  });
});
