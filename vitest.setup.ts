import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom does not implement matchMedia; components that read media queries need a stand-in.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
