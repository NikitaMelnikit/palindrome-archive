"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * Animation features are provided synchronously on purpose. Loading them lazily makes LazyMotion
 * re-render with a new context value after mount; on streamed routes that update reaches Suspense
 * boundaries that are still dehydrated, forcing React to client-render them and leaving the streamed
 * markup orphaned in a hidden container. `domAnimation` is the small feature set (no layout animations).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
