import type { ReactNode } from "react";
import { r, type Rng } from "@/lib/random";

/**
 * Shared primitives for the procedural artwork generators.
 * All plates use a 400 × 500 viewBox. Colours come from CSS custom properties via utility classes
 * (.s-ink, .f-acc …) so a single drawing can be re-toned for inspection modes.
 */

export const W = 400;
export const H = 500;

export type Detail = "full" | "thumb";
export type Pt = [number, number];

export interface Ctx {
  rng: Rng;
  seed: number;
  variant: number;
  param: number | undefined;
  detail: Detail;
  /** Unique prefix for pattern and clip ids within this drawing. */
  uid: string;
}

export function path(points: Pt[], close = false): string {
  let d = "";
  for (let i = 0; i < points.length; i++) d += `${i ? "L" : "M"}${r(points[i][0])} ${r(points[i][1])}`;
  return close ? `${d}Z` : d;
}

/** Point on a circle, angle in degrees clockwise from 12 o'clock. */
export function polar(cx: number, cy: number, radius: number, degrees: number): Pt {
  const a = (degrees * Math.PI) / 180;
  return [cx + radius * Math.sin(a), cy - radius * Math.cos(a)];
}

export function arc(cx: number, cy: number, radius: number, from: number, to: number): string {
  const [x0, y0] = polar(cx, cy, radius, from);
  const [x1, y1] = polar(cx, cy, radius, to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  const sweep = to > from ? 1 : 0;
  return `M${r(x0)} ${r(y0)}A${radius} ${radius} 0 ${large} ${sweep} ${r(x1)} ${r(y1)}`;
}

export function annularSector(cx: number, cy: number, inner: number, outer: number, from: number, to: number): string {
  const [ox0, oy0] = polar(cx, cy, outer, from);
  const [ox1, oy1] = polar(cx, cy, outer, to);
  const [ix1, iy1] = polar(cx, cy, inner, to);
  const [ix0, iy0] = polar(cx, cy, inner, from);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M${r(ox0)} ${r(oy0)}A${outer} ${outer} 0 ${large} 1 ${r(ox1)} ${r(oy1)}L${r(ix1)} ${r(iy1)}A${inner} ${inner} 0 ${large} 0 ${r(ix0)} ${r(iy0)}Z`;
}

export function Hatch({
  id,
  angle = 45,
  gap = 4,
  width = 0.6,
  className = "s-ink",
}: {
  id: string;
  angle?: number;
  gap?: number;
  width?: number;
  className?: string;
}) {
  return (
    <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
      <line x1="0" y1="0" x2="0" y2={gap} className={className} strokeWidth={width} />
    </pattern>
  );
}

export function Dots({
  id,
  gap = 4,
  radius = 1,
  className = "f-ink",
}: {
  id: string;
  gap?: number;
  radius?: number;
  className?: string;
}) {
  return (
    <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse">
      <circle cx={gap / 2} cy={gap / 2} r={radius} className={className} />
    </pattern>
  );
}

export function Label({
  x,
  y,
  children,
  anchor = "start",
  size = 8,
  className = "t-art",
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  size?: number;
  className?: string;
}) {
  return (
    <text x={r(x)} y={r(y)} textAnchor={anchor} fontSize={size} className={className}>
      {children}
    </text>
  );
}

/** Technical dimension line with end ticks and a centred label. */
export function Dimension({
  x1,
  y1,
  x2,
  y2,
  label,
  showLabel = true,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  showLabel?: boolean;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const nx = -Math.sin(angle) * 4;
  const ny = Math.cos(angle) * 4;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
  return (
    <g className="s-ink" strokeWidth="0.6">
      <line x1={r(x1)} y1={r(y1)} x2={r(x2)} y2={r(y2)} />
      <line x1={r(x1 - nx)} y1={r(y1 - ny)} x2={r(x1 + nx)} y2={r(y1 + ny)} />
      <line x1={r(x2 - nx)} y1={r(y2 - ny)} x2={r(x2 + nx)} y2={r(y2 + ny)} />
      {showLabel && (
        <text
          x={r(vertical ? mx + 6 : mx)}
          y={r(vertical ? my + 3 : my - 5)}
          textAnchor={vertical ? "start" : "middle"}
          fontSize="7.5"
          className="t-art"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function CenterMark({ x, y, size = 6 }: { x: number; y: number; size?: number }) {
  return (
    <g className="s-ink" strokeWidth="0.6">
      <line x1={r(x - size)} y1={r(y)} x2={r(x + size)} y2={r(y)} />
      <line x1={r(x)} y1={r(y - size)} x2={r(x)} y2={r(y + size)} />
    </g>
  );
}

/** Faint drafting-paper grid. */
export function DraftGrid({ step = 20 }: { step?: number }) {
  let d = "";
  for (let x = step; x < W; x += step) d += `M${x} 0V${H}`;
  for (let y = step; y < H; y += step) d += `M0 ${y}H${W}`;
  return <path d={d} className="s-mut" strokeWidth="0.35" opacity="0.45" />;
}
