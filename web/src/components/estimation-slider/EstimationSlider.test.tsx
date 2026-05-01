import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EstimationSlider } from "./EstimationSlider";

describe("EstimationSlider — render contract", () => {
  it("renders a vertical slider role with min/max/now", () => {
    const { getByRole } = render(
      <EstimationSlider
        truth={46}
        tolerance={4}
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
      <EstimationSlider truth={46} tolerance={4} min={0} max={100} />,
    );
    expect(getByRole("slider").getAttribute("aria-valuenow")).toBe("50");
  });

  it("renders one tick per anchor", () => {
    const { container } = render(
      <EstimationSlider
        truth={46}
        tolerance={4}
        anchors={[0, 25, 50, 75, 100]}
      />,
    );
    const ticks = container.querySelectorAll("[data-slider-anchor]");
    expect(ticks.length).toBe(5);
  });

  it("renders no ticks when anchors are omitted", () => {
    const { container } = render(
      <EstimationSlider truth={46} tolerance={4} />,
    );
    expect(container.querySelectorAll("[data-slider-anchor]").length).toBe(0);
  });

  it("hides the band before release (data-released=false)", () => {
    const { getByRole } = render(
      <EstimationSlider truth={46} tolerance={4} />,
    );
    expect(getByRole("slider").getAttribute("data-released")).toBe("false");
  });

  it("uses the provided ariaLabel", () => {
    const { getByRole } = render(
      <EstimationSlider
        truth={46}
        tolerance={4}
        ariaLabel="Estimate hero equity"
      />,
    );
    expect(getByRole("slider").getAttribute("aria-label")).toBe(
      "Estimate hero equity",
    );
  });

  it("sets touch-action: none on the track", () => {
    const { getByRole } = render(
      <EstimationSlider truth={46} tolerance={4} />,
    );
    expect(
      (getByRole("slider") as HTMLElement).style.touchAction,
    ).toBe("none");
  });

  it("throws when truth is outside [min, max]", () => {
    expect(() =>
      render(<EstimationSlider truth={150} tolerance={4} />),
    ).toThrow();
  });

  it("throws when tolerance is negative", () => {
    expect(() =>
      render(<EstimationSlider truth={50} tolerance={-1} />),
    ).toThrow();
  });
});
