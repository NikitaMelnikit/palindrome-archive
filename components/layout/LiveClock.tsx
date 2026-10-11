"use client";

import { pad } from "@/lib/format";
import { useSecondClock } from "@/lib/hooks";
import { cn } from "@/lib/site";

/** The visitor's local time, ticking each second. Renders a neutral placeholder on the server. */
export function LiveClock({ className, compact = false }: { className?: string; compact?: boolean }) {
  const seconds = useSecondClock();

  if (seconds === null) {
    return (
      <span className={cn("tnum", className)} aria-hidden="true">
        --:--:--
      </span>
    );
  }

  const now = new Date(seconds * 1000);
  const offset = -now.getTimezoneOffset();
  const zone = `UTC${offset >= 0 ? "+" : "−"}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <time dateTime={now.toISOString()} className={cn("tnum", className)}>
      {compact ? time : `${time} · ${zone}`}
      {compact && <span className="sr-only"> local time, {zone}</span>}
    </time>
  );
}
