"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Client hooks built on useSyncExternalStore so browser-only values never cause hydration mismatches. */

export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

const LOCATION_EVENT = "palindrome:location";

function subscribeLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(LOCATION_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(LOCATION_EVENT, onChange);
  };
}

/** The current `location.search`, for statically rendered pages that keep light state in the URL. */
export function useLocationSearch(): string {
  return useSyncExternalStore(
    subscribeLocation,
    () => window.location.search,
    () => "",
  );
}

/** Replace the query string without navigation. Next.js keeps its router in sync with native history calls. */
export function replaceSearch(search: string) {
  const url = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(LOCATION_EVENT));
}

const SECOND = 1000;

function subscribeSeconds(onTick: () => void) {
  let timeout: number;
  const schedule = () => {
    timeout = window.setTimeout(() => {
      onTick();
      schedule();
    }, SECOND - (Date.now() % SECOND) + 5);
  };
  schedule();
  return () => window.clearTimeout(timeout);
}

/** Current Unix time in whole seconds, ticking once per second on the client; null on the server. */
export function useSecondClock(): number | null {
  return useSyncExternalStore(
    subscribeSeconds,
    () => Math.floor(Date.now() / SECOND),
    () => null,
  );
}
