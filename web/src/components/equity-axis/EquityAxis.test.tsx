import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EquityAxis } from "./EquityAxis";

describe("EquityAxis — render contract", () => {
  it("renders one tick per value", () => {
    const { container } = render(
      <EquityAxis values={[0, 20, 40, 60, 80, 100]} mode="idle" />,
    );
    const ticks = container.querySelectorAll("[data-axis-tick]");
    expect(ticks.length).toBe(6);
  });

  it("renders no pointer when pointerValue is undefined", () => {
    const { container } = render(
      <EquityAxis values={[0, 50, 100]} mode="idle" />,
    );
    expect(container.querySelector("[data-axis-pointer]")).toBeNull();
  });

  it("renders the pointer when pointerValue is provided", () => {
    const { container } = render(
      <EquityAxis values={[0, 50, 100]} mode="dragging" pointerValue={42} />,
    );
    expect(container.querySelector("[data-axis-pointer]")).not.toBeNull();
  });

  it("reflects mode on the data-mode attribute", () => {
    const { getByTestId, rerender } = render(
      <EquityAxis values={[0, 100]} mode="idle" />,
    );
    expect(getByTestId("equity-axis").getAttribute("data-mode")).toBe("idle");
    rerender(<EquityAxis values={[0, 100]} mode="dragging" />);
    expect(getByTestId("equity-axis").getAttribute("data-mode")).toBe(
      "dragging",
    );
  });

  it("renders no ticks when values is empty", () => {
    const { container } = render(<EquityAxis values={[]} mode="idle" />);
    expect(container.querySelectorAll("[data-axis-tick]").length).toBe(0);
  });
});
