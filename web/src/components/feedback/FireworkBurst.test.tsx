import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { FireworkBurst } from "./FireworkBurst";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FireworkBurst — render contract", () => {
  it("renders 12 particle elements when active", () => {
    const { container } = render(
      <FireworkBurst active={true} durationMs={600} seed="seed-a" />,
    );
    const particles = container.querySelectorAll("[data-particle]");
    expect(particles.length).toBe(12);
  });

  it("renders nothing when inactive", () => {
    const { container } = render(
      <FireworkBurst active={false} durationMs={600} seed="seed-a" />,
    );
    expect(container.querySelector("[data-testid='firework-burst']")).toBeNull();
  });

  it("renders nothing under reduced motion", () => {
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });
    const { container } = render(
      <FireworkBurst active={true} durationMs={600} seed="seed-a" />,
    );
    expect(container.querySelector("[data-testid='firework-burst']")).toBeNull();
  });
});
