"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/hooks";

const QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * An optional trailing ring with contextual labels, read from `data-cursor` attributes.
 * Fine pointers on large screens only; the native cursor is never hidden, and the animation loop
 * stops as soon as the ring has caught up with the pointer.
 */
export function CursorLayer() {
  const enabled = useMediaQuery(QUERY);
  return enabled ? <CursorRing /> : null;
}

function CursorRing() {
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!ring || !label) return;

    const target = { x: -100, y: -100 };
    const current = { x: -100, y: -100 };
    let frame = 0;
    let currentLabel = "";

    const render = () => {
      current.x += (target.x - current.x) * 0.22;
      current.y += (target.y - current.y) * 0.22;
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      label.style.transform = `translate3d(${current.x + 22}px, ${current.y + 16}px, 0)`;
      if (Math.abs(target.x - current.x) > 0.3 || Math.abs(target.y - current.y) > 0.3) {
        frame = requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      ring.dataset.visible = "true";
      const host = (event.target as Element | null)?.closest?.("[data-cursor]");
      const next = host?.getAttribute("data-cursor") ?? "";
      if (next !== currentLabel) {
        currentLabel = next;
        label.textContent = next;
        label.dataset.visible = next ? "true" : "false";
        ring.dataset.active = next ? "true" : "false";
      }
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onLeave = () => {
      ring.dataset.visible = "false";
      label.dataset.visible = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={labelRef} className="cursor-label" aria-hidden="true" />
    </>
  );
}
