import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExerciseScreen } from "./ExerciseScreen";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("a=AsKs&b=QhQd"),
}));

beforeEach(() => {
  replaceMock.mockClear();
});

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

  it("mounts the estimation slider", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hand A/i);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("hides feedback before release", async () => {
    render(<ExerciseScreen />);
    await screen.findByText(/equity of Hand A/i);
    const panel = screen.getByTestId("feedback-panel");
    expect(panel.getAttribute("data-released")).toBe("false");
  });
});
