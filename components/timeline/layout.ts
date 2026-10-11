import type { TimelineBranch, TimelineEvent } from "@/types";

/**
 * Geometry for drawing the branching history. The consensus line and branch α share the middle lane
 * (α continues the consensus); γ forks upward in 1958 and β forks downward in 2026.
 */

export const LANE_ORDER = ["gamma", "consensus", "beta"] as const;

export function laneFor(branchId: string): number {
  if (branchId === "gamma") return 0;
  if (branchId === "beta") return 2;
  return 1;
}

export interface TimelineGeometry {
  years: number[];
  xForYear: (year: number) => number;
}

/** Evenly spaced positions for each distinct year, so dense futures remain readable. */
export function rankScale(events: readonly TimelineEvent[], width: number, padding: number): TimelineGeometry {
  const years = [...new Set(events.map((e) => e.year))].sort((a, b) => a - b);
  const step = years.length > 1 ? (width - padding * 2) / (years.length - 1) : 0;
  const index = new Map(years.map((year, i) => [year, i]));
  return {
    years,
    xForYear: (year: number) => {
      const exact = index.get(year);
      if (exact !== undefined) return padding + exact * step;
      // Interpolate for years with no event (fork points that are not themselves events).
      const after = years.findIndex((y) => y > year);
      if (after <= 0) return after === 0 ? padding : width - padding;
      const y0 = years[after - 1];
      const y1 = years[after];
      return padding + (after - 1 + (year - y0) / (y1 - y0)) * step;
    },
  };
}

/** Linear scale by calendar year. */
export function linearScale(from: number, to: number, width: number, padding: number) {
  return (year: number) => padding + ((year - from) / (to - from)) * (width - padding * 2);
}

export function branchSpan(branch: TimelineBranch, events: readonly TimelineEvent[]) {
  const own = events.filter((e) => e.branchId === branch.id).map((e) => e.year);
  return {
    start: branch.forkYear ?? Math.min(...own),
    end: Math.max(...own),
  };
}

export const TONE_STROKE: Record<TimelineBranch["tone"], string> = {
  consensus: "var(--color-gray)",
  ink: "var(--color-paper)",
  lime: "var(--color-lime)",
  alert: "var(--color-alert)",
};
