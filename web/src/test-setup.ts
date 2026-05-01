import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Vitest doesn't auto-call RTL's cleanup unless `globals: true`. Register it
// explicitly so each test starts from a clean DOM.
afterEach(() => {
  cleanup();
});

// jsdom does not implement `window.matchMedia`. Provide a no-op shim so
// components that read `prefers-reduced-motion` (or any media query) can
// render in component tests. Tests that need to assert on reduced-motion
// behavior should override `window.matchMedia` per-test.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
