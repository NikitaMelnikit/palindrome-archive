"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/site";
import { rovingIndex } from "./roving";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Accessible name when the visible label is an icon. */
  ariaLabel?: string;
}

/**
 * An accessible single-choice control (WAI-ARIA radio group with roving focus).
 * Arrow keys move and select; only the selected option is in the tab order.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
  optionClassName,
}: {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  optionClassName?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option, index) => {
        const checked = index === selected;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.ariaLabel}
            tabIndex={checked ? 0 : -1}
            className={cn("chip", optionClassName)}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              const next = rovingIndex(event.key, index, options.length);
              if (next === null) return;
              event.preventDefault();
              onChange(options[next].value);
              refs.current[next]?.focus();
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
