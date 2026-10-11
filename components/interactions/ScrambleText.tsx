"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/Δψ";

/**
 * Briefly scrambles text when it changes, settling left to right. The first render and
 * reduced-motion users get the final text immediately. Assistive technology always reads the real text.
 */
export function ScrambleText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const previous = useRef(text);

  useEffect(() => {
    const node = ref.current?.firstChild;
    if (!node || previous.current === text) return;
    previous.current = text;
    if (reduced) {
      node.nodeValue = text;
      return;
    }
    const total = 16;
    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame += 1;
      const settled = (frame / total) * text.length;
      node.nodeValue = text
        .split("")
        .map((ch, i) => (ch === " " || ch === "-" || i < settled ? ch : GLYPHS[(i * 7 + frame * 13) % GLYPHS.length]))
        .join("");
      if (frame < total) raf = requestAnimationFrame(tick);
      else node.nodeValue = text;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      node.nodeValue = text;
    };
  }, [text, reduced]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
