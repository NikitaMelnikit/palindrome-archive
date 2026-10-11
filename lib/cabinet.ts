"use client";

import { useSyncExternalStore } from "react";
import { createCabinetStore, type CabinetSnapshot } from "./storage";

/** The single cabinet store for this browser tab. */
export const cabinetStore = createCabinetStore({
  getStorage: () => (typeof window === "undefined" ? null : window.localStorage),
});

/** Subscribe to the personal cabinet. Renders the empty server snapshot until hydrated. */
export function useCabinet(): CabinetSnapshot {
  return useSyncExternalStore(cabinetStore.subscribe, cabinetStore.getSnapshot, cabinetStore.getServerSnapshot);
}

export function cabinetCount(snapshot: CabinetSnapshot): number {
  return snapshot.data.artifacts.length + snapshot.data.collections.length;
}
