import type { ReactNode } from "react";
import { formatDt, formatLambda, formatPsi } from "@/lib/format";
import type { RealityCoordinates } from "@/types";

/**
 * Keeps Greek symbols (ψ, λ, Δt, branch sigils α β γ) in their own case inside uppercase labels,
 * where CSS text-transform would otherwise turn λ into Λ and γ into Γ.
 */
export function Greek({ children }: { children: ReactNode }) {
  return <span className="normal-case">{children}</span>;
}

/** Archive coordinates, e.g. ψ 0.412 · λ 24.42 · Δt +087y, safe inside uppercase labels. */
export function Coordinates({ value }: { value: RealityCoordinates }) {
  return (
    <span className="tnum">
      <Greek>ψ</Greek> {formatPsi(value.psi)} · <Greek>λ</Greek> {formatLambda(value.lambda)} · <Greek>Δt</Greek>{" "}
      <Greek>{formatDt(value.dt)}</Greek>
    </span>
  );
}
