import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Axis } from "./Axis";

describe("Axis — render contract", () => {
  it("renders one tick per value", () => {
    const { container } = render(
      <Axis values={[0, 20, 40, 60, 80, 100]} mode="idle" />,
    );
    const ticks = container.querySelectorAll("[data-axis-tick]");
    expect(ticks.length).toBe(6);
  });

  it("renders minor ticks at every 5% step that isn't already a major", () => {
    const { container } = render(
      <Axis values={[0, 20, 40, 60, 80, 100]} mode="idle" />,
    );
    const minors = container.querySelectorAll("[data-axis-tick-minor]");
    // 5,10,15,25,30,35,45,50,55,65,70,75,85,90,95 → 15 minors
    expect(minors.length).toBe(15);
  });

  it("does not double-render minors that overlap major values", () => {
    const { container } = render(
      <Axis values={[0, 25, 50, 75, 100]} mode="idle" />,
    );
    const minors = container.querySelectorAll("[data-axis-tick-minor]");
    // Step 5 between 0..100 (excl. endpoints): 5,10,15,20,30,35,40,45,55,60,65,70,80,85,90,95 = 16
    expect(minors.length).toBe(16);
  });

  it("reflects mode on the data-mode attribute", () => {
    const { getByTestId, rerender } = render(
      <Axis values={[0, 100]} mode="idle" />,
    );
    expect(getByTestId("axis").getAttribute("data-mode")).toBe("idle");
    rerender(<Axis values={[0, 100]} mode="dragging" />);
    expect(getByTestId("axis").getAttribute("data-mode")).toBe("dragging");
  });

  it("renders no major ticks when values is empty", () => {
    const { container } = render(<Axis values={[]} mode="idle" />);
    expect(container.querySelectorAll("[data-axis-tick]").length).toBe(0);
  });

  it("renders no minor ticks when values is empty", () => {
    const { container } = render(<Axis values={[]} mode="idle" />);
    expect(container.querySelectorAll("[data-axis-tick-minor]").length).toBe(0);
  });
});
