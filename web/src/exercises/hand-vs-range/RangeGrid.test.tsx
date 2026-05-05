import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RangeGrid } from "./RangeGrid";

describe("RangeGrid", () => {
  it("renders 169 cells", () => {
    const { container } = render(<RangeGrid hands={new Set()} />);
    const cells = container.querySelectorAll('[role="img"] > div');
    expect(cells.length).toBe(169);
  });

  it("labels (0,0) AA, (0,1) AKs, (1,0) AKo, (12,12) 22", () => {
    render(<RangeGrid hands={new Set()} />);
    expect(screen.getAllByText("AA").length).toBe(1);
    expect(screen.getAllByText("AKs").length).toBe(1);
    expect(screen.getAllByText("AKo").length).toBe(1);
    expect(screen.getAllByText("22").length).toBe(1);
  });

  it("highlights cells whose hand class is in the supplied set", () => {
    const hands = new Set<string>(["AA", "KK", "AKs"]);
    const { container } = render(<RangeGrid hands={hands} />);
    const inCells = container.querySelectorAll(".bg-cyan-500");
    expect(inCells.length).toBe(3);
  });
});
