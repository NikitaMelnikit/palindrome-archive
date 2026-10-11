/** Deterministic randomness for procedural artwork. Same seed, same drawing, on server and client. */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function between(rng: Rng, min: number, max: number): number {
  return min + (max - min) * rng();
}

export function intBetween(rng: Rng, min: number, max: number): number {
  return Math.floor(between(rng, min, max + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

/** FNV-1a string hash. */
export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Seeded 2D value noise in [0, 1]. */
export function valueNoise2D(seed: number): (x: number, y: number) => number {
  const rng = mulberry32(seed);
  const size = 64;
  const lattice = new Float64Array(size * size);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rng();
  const at = (x: number, y: number) => lattice[(((y % size) + size) % size) * size + (((x % size) + size) % size)];

  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = smooth(x - xi);
    const v = smooth(y - yi);
    const top = at(xi, yi) * (1 - u) + at(xi + 1, yi) * u;
    const bottom = at(xi, yi + 1) * (1 - u) + at(xi + 1, yi + 1) * u;
    return top * (1 - v) + bottom * v;
  };
}

/** Fractal noise built from value noise, roughly in [0, 1]. */
export function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves = 3): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / total;
}

/** Round for SVG output: keeps markup small and server/client output stable. */
export function r(n: number): number {
  return Math.round(n * 10) / 10;
}
