import { describe, expect, it } from "vitest";
import { getFeaturedArtifacts, getTimelineBranch, getTimelineEvents } from "@/lib/archive";
import {
  INITIAL_REALITY,
  parseReality,
  perspectiveFor,
  realityPsi,
  serializeReality,
  shiftReality,
  stabilityLabel,
  strideFor,
} from "@/lib/reality";

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

describe("SHIFT REALITY", () => {
  it("uses a stride coprime with the pool size", () => {
    for (let n = 3; n <= 30; n++) expect(gcd(strideFor(n), n)).toBe(1);
  });

  it("changes the featured artifact on every shift and visits the whole pool", () => {
    const pool = getFeaturedArtifacts().length;
    expect(pool).toBeGreaterThanOrEqual(4);
    let state = INITIAL_REALITY;
    const seen = new Set([state.artifactIndex]);
    for (let i = 0; i < pool - 1; i++) {
      const next = shiftReality(state, pool, 3);
      expect(next.artifactIndex).not.toBe(state.artifactIndex);
      expect(next.shift).toBe(state.shift + 1);
      seen.add(next.artifactIndex);
      state = next;
    }
    expect(seen.size).toBe(pool);
  });

  it("cycles through branch perspectives", () => {
    const a = shiftReality(INITIAL_REALITY, 8, 3);
    const b = shiftReality(a, 8, 3);
    const c = shiftReality(b, 8, 3);
    expect([a.branchIndex, b.branchIndex, c.branchIndex]).toEqual([1, 2, 0]);
  });

  it("still changes the branch when only one artifact is available", () => {
    const next = shiftReality(INITIAL_REALITY, 1, 3);
    expect(next).toEqual({ artifactIndex: 0, branchIndex: 1, shift: 1 });
  });

  it("round-trips through the URL and rejects unknown values", () => {
    const slugs = ["a", "b", "c"];
    const branches = ["alpha", "beta", "gamma"];
    expect(parseReality(`?${serializeReality("c", "beta", 4)}`, slugs, branches)).toEqual({
      artifactIndex: 2,
      branchIndex: 1,
      shift: 4,
    });
    expect(parseReality("?reality=zzz&branch=beta", slugs, branches)).toBeNull();
    expect(parseReality("", slugs, branches)).toBeNull();
  });

  it("derives a stable phase and stability label", () => {
    const psi = realityPsi("DC-2442-CD", "beta");
    expect(psi).toBe(realityPsi("DC-2442-CD", "beta"));
    expect(psi).toBeGreaterThanOrEqual(0);
    expect(psi).toBeLessThan(1);
    expect(stabilityLabel(0.1).tone).toBe("stable");
    expect(stabilityLabel(0.5).tone).toBe("drifting");
    expect(stabilityLabel(0.9).tone).toBe("volatile");
  });
});

describe("perspectiveFor", () => {
  const events = getTimelineEvents();

  it("finds an artifact recorded in the branch itself", () => {
    const result = perspectiveFor("SG-2332-GS", getTimelineBranch("beta")!, events);
    expect(result.kind).toBe("recorded");
    if (result.kind === "recorded") expect(result.event.id).toBe("b-2029");
  });

  it("falls back to the consensus line before the fork", () => {
    const result = perspectiveFor("PL-0220-LP", getTimelineBranch("gamma")!, events);
    expect(result.kind).toBe("inherited");
    if (result.kind === "inherited") expect(result.event.year).toBeLessThanOrEqual(1958);
  });

  it("reports artifacts a branch never recorded", () => {
    expect(perspectiveFor("OB-0990-BO", getTimelineBranch("alpha")!, events).kind).toBe("unrecorded");
  });
});
