import type { RealityCoordinates } from "@/types";

/**
 * Formatting helpers. Dates are formatted by hand rather than with Intl so that server and client
 * render identical strings regardless of locale or time zone.
 */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function pad(value: number, length = 2): string {
  return String(Math.abs(Math.trunc(value))).padStart(length, "0");
}

function parts(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return { year, month, day };
}

/** "2026-09-22" → "22 SEP 2026" */
export function formatDate(iso: string): string {
  const { year, month, day } = parts(iso);
  return `${pad(day)} ${MONTHS[month - 1]} ${year}`;
}

/** "2026-09-22" → "22 · IX · 2026" */
export function formatDateArchival(iso: string): string {
  const { year, month, day } = parts(iso);
  return `${pad(day)} · ${ROMAN_MONTHS[month - 1]} · ${year}`;
}

export function formatAccession(accession: number): string {
  return pad(accession, 3);
}

export function formatPsi(psi: number): string {
  return psi.toFixed(3);
}

export function formatLambda(lambda: number): string {
  return lambda.toFixed(2).padStart(5, "0");
}

export function formatDt(dt: number): string {
  if (dt === 0) return "±000y";
  return `${dt > 0 ? "+" : "−"}${pad(dt, 3)}y`;
}

export function formatCoordinates(c: RealityCoordinates): string {
  return `ψ ${formatPsi(c.psi)} · λ ${formatLambda(c.lambda)} · Δt ${formatDt(c.dt)}`;
}

export function mirrorCode(code: string): string {
  return code.split("").reverse().join("");
}

/** Build a palindromic archive identifier: category code, accession forwards and backwards, mirrored code. */
export function buildIdentifier(code: string, accession: number): string {
  const forwards = pad(accession, 2);
  const backwards = forwards.split("").reverse().join("");
  return `${code}-${forwards}${backwards}-${mirrorCode(code)}`;
}

export function isPalindrome(value: string): boolean {
  return value === value.split("").reverse().join("");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
