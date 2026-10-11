"use client";

import { X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { dismissToast, useToasts } from "@/lib/toast";
import { cn } from "@/lib/site";

/** Visible feedback and a polite live region for every action that reports a result. */
export function Toaster() {
  const toasts = useToasts();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-start gap-2 sm:right-auto sm:left-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <m.div
            key={t.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.18 } }}
            transition={{ duration: 0.32, ease: [0.2, 0.7, 0.1, 1] }}
            className="pointer-events-auto flex max-w-[min(32rem,100%)] items-center gap-3 border border-ink bg-ink py-2.5 pr-2 pl-4 text-paper shadow-[6px_6px_0_0_rgba(21,21,21,0.18)]"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0",
                t.tone === "error" ? "bg-alert" : t.tone === "info" ? "bg-gray" : "bg-lime",
              )}
            />
            <span className="label leading-snug normal-case tracking-[0.02em]">
              <span className="sr-only">{t.tone === "error" ? "Error: " : ""}</span>
              {t.message}
            </span>
            {t.action && (
              <Link href={t.action.href} className="label shrink-0 text-lime underline underline-offset-4">
                {t.action.label}
              </Link>
            )}
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="ml-1 grid size-8 shrink-0 place-items-center text-paper/70 hover:text-paper"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
