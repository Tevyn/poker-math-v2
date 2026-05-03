import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ActualValueTooltip } from "./ActualValueTooltip";

describe("ActualValueTooltip — render contract", () => {
  it("renders the formatted value verbatim", () => {
    const { getByTestId } = render(
      <ActualValueTooltip
        label="Actual Equity"
        formattedValue="46.3%"
        visible={true}
      />,
    );
    const el = getByTestId("actual-value-tooltip");
    expect(el.textContent).toMatch(/46\.3%/);
  });

  it("includes the provided label", () => {
    const { getByTestId } = render(
      <ActualValueTooltip
        label="Required equity"
        formattedValue="25.0%"
        visible={true}
      />,
    );
    const el = getByTestId("actual-value-tooltip");
    expect(el.textContent?.toLowerCase()).toContain("required equity");
  });

  it("reflects visibility on data-visible", () => {
    const { getByTestId, rerender } = render(
      <ActualValueTooltip
        label="Actual Equity"
        formattedValue="50.0%"
        visible={false}
      />,
    );
    expect(
      getByTestId("actual-value-tooltip").getAttribute("data-visible"),
    ).toBe("false");
    rerender(
      <ActualValueTooltip
        label="Actual Equity"
        formattedValue="50.0%"
        visible={true}
      />,
    );
    expect(
      getByTestId("actual-value-tooltip").getAttribute("data-visible"),
    ).toBe("true");
  });
});
