import { hashString } from "./random";
import type { TimelineBranch, TimelineEvent } from "@/types";

/**
 * SHIFT REALITY: a deterministic walk through (featured artifact × timeline branch) pairs.
 * Each shift changes the featured discovery and the branch it is viewed from; the pair is kept in
 * the URL so a shifted reality can be shared or revisited.
 */

export interface RealityState {
  artifactIndex: number;
  branchIndex: number;
  /** How many shifts have occurred: the "reality number". */
  shift: number;
}

export const INITIAL_REALITY: RealityState = { artifactIndex: 0, branchIndex: 0, shift: 0 };

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** A step size coprime with the pool size, so repeated shifts visit every artifact before repeating. */
export function strideFor(poolSize: number): number {
  if (poolSize <= 2) return 1;
  for (let k = 3; k < poolSize; k++) if (gcd(k, poolSize) === 1) return k;
  return 1;
}

export function shiftReality(state: RealityState, poolSize: number, branchCount: number): RealityState {
  const branches = Math.max(1, branchCount);
  if (poolSize <= 1) {
    return { artifactIndex: 0, branchIndex: (state.branchIndex + 1) % branches, shift: state.shift + 1 };
  }
  return {
    artifactIndex: (state.artifactIndex + strideFor(poolSize)) % poolSize,
    branchIndex: (state.branchIndex + 1) % branches,
    shift: state.shift + 1,
  };
}

/** Phase offset of a reality, 0–0.999, stable for a given artifact and branch. */
export function realityPsi(artifactId: string, branchId: string): number {
  return (hashString(`${artifactId}:${branchId}`) % 1000) / 1000;
}

export function stabilityLabel(psi: number): { label: string; tone: "stable" | "drifting" | "volatile" } {
  if (psi < 0.34) return { label: "Stable", tone: "stable" };
  if (psi < 0.67) return { label: "Drifting", tone: "drifting" };
  return { label: "Volatile", tone: "volatile" };
}

export function serializeReality(slug: string, branchId: string, shift: number): string {
  const params = new URLSearchParams({ reality: slug, branch: branchId, shift: String(shift) });
  return params.toString();
}

export function parseReality(search: string, slugs: readonly string[], branchIds: readonly string[]): RealityState | null {
  const params = new URLSearchParams(search);
  const artifactIndex = slugs.indexOf(params.get("reality") ?? "");
  const branchIndex = branchIds.indexOf(params.get("branch") ?? "");
  if (artifactIndex < 0 || branchIndex < 0) return null;
  const shiftNumber = Number.parseInt(params.get("shift") ?? "1", 10);
  const shift = Number.isFinite(shiftNumber) && shiftNumber >= 0 ? Math.min(shiftNumber, 9999) : 1;
  return { artifactIndex, branchIndex, shift };
}

export type Perspective =
  | { kind: "recorded"; event: TimelineEvent }
  | { kind: "inherited"; event: TimelineEvent }
  | { kind: "unrecorded" };

/**
 * How an artifact appears from a given branch: recorded by an event in that branch, inherited from
 * the consensus line before the branch forked, or absent from that branch's record.
 */
export function perspectiveFor(
  artifactId: string,
  branch: TimelineBranch,
  events: readonly TimelineEvent[],
): Perspective {
  const sorted = [...events].sort((a, b) => a.year - b.year);
  const own = sorted.find((e) => e.branchId === branch.id && e.artifactIds.includes(artifactId));
  if (own) return { kind: "recorded", event: own };
  if (branch.forksFrom && branch.forkYear !== null) {
    const inherited = sorted.find(
      (e) => e.branchId === branch.forksFrom && e.year <= branch.forkYear! && e.artifactIds.includes(artifactId),
    );
    if (inherited) return { kind: "inherited", event: inherited };
  }
  return { kind: "unrecorded" };
}
