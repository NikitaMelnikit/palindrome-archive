"use client";

// A client boundary on purpose: server pages then send only the small `visualization` props in the
// RSC payload instead of a second, serialised copy of every SVG. The SVG is still server-rendered
// into the HTML and is regenerated deterministically during hydration.
import { useId, type ReactNode } from "react";
import { mulberry32 } from "@/lib/random";
import { cn } from "@/lib/site";
import type { ArtKind, Visualization } from "@/types";
import { city, particles } from "./city";
import { dial, rings, waveform } from "./instruments";
import { schematic } from "./machines";
import { crystal, grid, shadow } from "./objects";
import { documentArt } from "./paper";
import { H, W, type Ctx, type Detail } from "./shared";
import { contour, strata } from "./terrain";

const GENERATORS: Record<ArtKind, (ctx: Ctx) => ReactNode> = {
  contour,
  strata,
  city,
  particles,
  rings,
  dial,
  waveform,
  document: documentArt,
  schematic,
  shadow,
  grid,
  crystal,
};

export type ArtMode = "plate" | "negative" | "spectral";

export interface ArtifactArtProps {
  visualization: Visualization;
  /** Partial override used by interactions (variant, param, kind…). */
  override?: Partial<Visualization>;
  detail?: Detail;
  mode?: ArtMode;
  className?: string;
  /** Hide from assistive technology when the surrounding UI already names the artwork. */
  decorative?: boolean;
}

/**
 * Procedural artwork for an artifact or collection. Pure and deterministic: the same visualization
 * renders the same SVG on the server and the client.
 */
export function ArtifactArt({
  visualization,
  override,
  detail = "full",
  mode = "plate",
  className,
  decorative = false,
}: ArtifactArtProps) {
  const v = { ...visualization, ...override };
  const uid = `p${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ctx: Ctx = {
    rng: mulberry32(v.seed * 7919 + (v.variant ?? 0) * 31),
    seed: v.seed,
    variant: v.variant ?? 0,
    param: v.param,
    detail,
    uid,
  };
  const generate = GENERATORS[v.kind];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("art", v.tone === "dark" ? "art-dark" : "art-light", className)}
      data-mode={mode}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : v.alt}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      <rect width={W} height={H} className="f-bg" />
      {generate(ctx)}
    </svg>
  );
}
