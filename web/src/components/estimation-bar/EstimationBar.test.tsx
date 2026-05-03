import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { EstimationBar } from "./EstimationBar";

function stubPointerCapture(el: HTMLElement) {
  // jsdom doesn't implement these — required for pointer capture flow.
  Object.assign(el, {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    hasPointerCapture: vi.fn(() => true),
  });
}

function stubBoundingRect(el: HTMLElement) {
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
    }) as DOMRect;
}

describe("EstimationBar — render contract", () => {
  it("renders a vertical slider role with min/max/now", () => {
    const { getByRole } = render(
      <EstimationBar
        truth={46}
        tolerance={10}
        min={0}
        max={100}
        initialValue={50}
      />,
    );
    const slider = getByRole("slider");
    expect(slider.getAttribute("aria-orientation")).toBe("vertical");
    expect(slider.getAttribute("aria-valuemin")).toBe("0");
    expect(slider.getAttribute("aria-valuemax")).toBe("100");
    expect(slider.getAttribute("aria-valuenow")).toBe("50");
  });

  it("defaults the value to the midpoint when initialValue is omitted", () => {
    const { getByRole } = render(
      <EstimationBar truth={46} tolerance={10} min={0} max={100} />,
    );
    expect(getByRole("slider").getAttribute("aria-valuenow")).toBe("50");
  });

  it("uses the provided ariaLabel", () => {
    const { getByRole } = render(
      <EstimationBar
        truth={46}
        tolerance={10}
        ariaLabel="Estimate hero equity"
      />,
    );
    expect(getByRole("slider").getAttribute("aria-label")).toBe(
      "Estimate hero equity",
    );
  });

  it("sets touch-action: none on the wrapper", () => {
    const { getByRole } = render(
      <EstimationBar truth={46} tolerance={10} />,
    );
    expect((getByRole("slider") as HTMLElement).style.touchAction).toBe(
      "none",
    );
  });

  it("starts with data-dragging=false and data-released=false", () => {
    const { getByRole } = render(
      <EstimationBar truth={46} tolerance={10} />,
    );
    const slider = getByRole("slider");
    expect(slider.getAttribute("data-dragging")).toBe("false");
    expect(slider.getAttribute("data-released")).toBe("false");
  });

  it("throws when truth is outside [min, max]", () => {
    expect(() =>
      render(<EstimationBar truth={150} tolerance={10} />),
    ).toThrow();
  });

  it("throws when tolerance is negative", () => {
    expect(() =>
      render(<EstimationBar truth={50} tolerance={-1} />),
    ).toThrow();
  });
});

describe("EstimationBar — gesture", () => {
  it("flips data-dragging on pointerDown / pointerUp and fires onRelease", () => {
    const onRelease = vi.fn();
    const { getByRole } = render(
      <EstimationBar
        truth={50}
        tolerance={10}
        min={0}
        max={100}
        onRelease={onRelease}
      />,
    );
    const slider = getByRole("slider") as HTMLElement;
    stubBoundingRect(slider);
    stubPointerCapture(slider);

    // pointerDown near the bottom (clientY=780 within 800-tall track)
    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 780 });
    expect(slider.getAttribute("data-dragging")).toBe("true");

    // move to midpoint
    fireEvent.pointerMove(slider, { pointerId: 1, clientY: 400 });
    expect(slider.getAttribute("aria-valuenow")).toBe("50");

    // release
    fireEvent.pointerUp(slider, { pointerId: 1, clientY: 400 });
    expect(slider.getAttribute("data-dragging")).toBe("false");
    expect(slider.getAttribute("data-released")).toBe("true");
    expect(onRelease).toHaveBeenCalledTimes(1);
    const [value, withinTolerance] = onRelease.mock.calls[0];
    expect(value).toBeCloseTo(50, 1);
    expect(withinTolerance).toBe(true);
  });

  it("renders the active bar with height = 2 × tolerance over (max - min)", () => {
    const { container } = render(
      <EstimationBar truth={50} tolerance={10} min={0} max={100} />,
    );
    const bar = container.querySelector(
      "[data-bar-active]",
    ) as HTMLElement | null;
    expect(bar).not.toBeNull();
    expect(bar!.style.height).toBe("20%");
  });

  it("scales the active bar height with smaller tolerance", () => {
    const { container } = render(
      <EstimationBar truth={50} tolerance={5} min={0} max={100} />,
    );
    const bar = container.querySelector(
      "[data-bar-active]",
    ) as HTMLElement | null;
    expect(bar!.style.height).toBe("10%");
  });

  it("ignores pointerDown above the idle bar", () => {
    const onRelease = vi.fn();
    const { getByRole } = render(
      <EstimationBar
        truth={50}
        tolerance={10}
        onRelease={onRelease}
      />,
    );
    const slider = getByRole("slider") as HTMLElement;
    stubBoundingRect(slider);
    stubPointerCapture(slider);

    // pointerDown high up on the screen — should be ignored
    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 100 });
    expect(slider.getAttribute("data-dragging")).toBe("false");
    fireEvent.pointerUp(slider, { pointerId: 1, clientY: 100 });
    expect(onRelease).not.toHaveBeenCalled();
  });
});
