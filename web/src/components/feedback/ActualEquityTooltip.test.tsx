import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ActualEquityTooltip } from "./ActualEquityTooltip";

describe("ActualEquityTooltip — render contract", () => {
  it("renders the percent rounded to 1 decimal", () => {
    const { getByTestId } = render(
      <ActualEquityTooltip percent={46.345} visible={true} />,
    );
    const el = getByTestId("actual-equity-tooltip");
    expect(el.textContent).toMatch(/46\.3%/);
  });

  it("includes the ACTUAL EQUITY label", () => {
    const { getByTestId } = render(
      <ActualEquityTooltip percent={50} visible={true} />,
    );
    const el = getByTestId("actual-equity-tooltip");
    expect(el.textContent?.toLowerCase()).toContain("actual equity");
  });

  it("reflects visibility on data-visible", () => {
    const { getByTestId, rerender } = render(
      <ActualEquityTooltip percent={50} visible={false} />,
    );
    expect(getByTestId("actual-equity-tooltip").getAttribute("data-visible")).toBe(
      "false",
    );
    rerender(<ActualEquityTooltip percent={50} visible={true} />);
    expect(getByTestId("actual-equity-tooltip").getAttribute("data-visible")).toBe(
      "true",
    );
  });
});
