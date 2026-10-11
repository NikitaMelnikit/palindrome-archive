"use client";

import { useSyncExternalStore } from "react";

/** Minimal toast queue. Messages are announced through a polite live region in <Toaster />. */

export type ToastTone = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; href: string };
}

const EMPTY: Toast[] = [];
let toasts: Toast[] = EMPTY;
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function dismissToast(id: number) {
  const next = toasts.filter((t) => t.id !== id);
  if (next.length !== toasts.length) {
    toasts = next;
    emit();
  }
}

export function toast(
  message: string,
  options: { tone?: ToastTone; action?: Toast["action"]; duration?: number } = {},
): number {
  const id = nextId++;
  toasts = [...toasts.slice(-2), { id, message, tone: options.tone ?? "success", action: options.action }];
  emit();
  const duration = options.duration ?? (options.tone === "error" ? 7000 : 4200);
  if (typeof window !== "undefined") window.setTimeout(() => dismissToast(id), duration);
  return id;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    subscribe,
    () => toasts,
    () => EMPTY,
  );
}
