import { fbm, r, valueNoise2D } from "@/lib/random";
import { H, Hatch, Label, W, path, type Ctx, type Pt } from "./shared";

/** Marching squares: line segments where `field` crosses `level`. */
function isoPath(field: Float64Array, cols: number, rows: number, level: number): string {
  const cw = W / cols;
  const ch = H / rows;
  const value = (i: number, j: number) => field[j * (cols + 1) + i];
  let d = "";
  const seg = (a: Pt, b: Pt) => {
    d += `M${r(a[0])} ${r(a[1])}L${r(b[0])} ${r(b[1])}`;
  };
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const tl = value(i, j);
      const tr = value(i + 1, j);
      const br = value(i + 1, j + 1);
      const bl = value(i, j + 1);
      const index = (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0);
      if (index === 0 || index === 15) continue;
      const x = i * cw;
      const y = j * ch;
      const t = (a: number, b: number) => (level - a) / (b - a);
      const top: Pt = [x + cw * t(tl, tr), y];
      const right: Pt = [x + cw, y + ch * t(tr, br)];
      const bottom: Pt = [x + cw * t(bl, br), y + ch];
      const left: Pt = [x, y + ch * t(tl, bl)];
      switch (index) {
        case 1:
        case 14:
          seg(left, bottom);
          break;
        case 2:
        case 13:
          seg(bottom, right);
          break;
        case 3:
        case 12:
          seg(left, right);
          break;
        case 4:
        case 11:
          seg(top, right);
          break;
        case 5:
          seg(top, right);
          seg(left, bottom);
          break;
        case 6:
        case 9:
          seg(top, bottom);
          break;
        case 7:
        case 8:
          seg(left, top);
          break;
        case 10:
          seg(left, top);
          seg(bottom, right);
          break;
      }
    }
  }
  return d;
}

/** Topographic chart. Variant 0: island · 1: open sea with islets · 2: valley. */
export function contour({ seed, variant, detail, rng }: Ctx) {
  const thumb = detail === "thumb";
  const noise = valueNoise2D(seed);
  const cols = thumb ? 28 : 46;
  const rows = Math.round(cols * 1.25);
  const field = new Float64Array((cols + 1) * (rows + 1));
  const ox = (seed % 13) * 0.37;
  const oy = (seed % 7) * 0.53;
  let peak = { v: -Infinity, x: 0, y: 0 };

  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const nx = i / cols;
      const ny = j / rows;
      const n = fbm(noise, nx * 3.4 + ox, ny * 4.2 + oy, 4);
      let v: number;
      if (variant === 0) v = n * 0.75 + 0.36 - Math.hypot((nx - 0.5) * 1.25, ny - 0.52) * 1.75;
      else if (variant === 1) v = n - 0.56;
      else v = n * 0.7 + Math.abs(nx - 0.5) * 1.1 - 0.3 + (ny - 0.5) * 0.15;
      field[j * (cols + 1) + i] = v;
      if (v > peak.v && nx > 0.1 && nx < 0.9 && ny > 0.1 && ny < 0.9) peak = { v, x: nx * W, y: ny * H };
    }
  }

  const land = variant === 2 ? [-0.1, -0.04, 0.02, 0.08, 0.14, 0.2, 0.26, 0.32, 0.38, 0.44, 0.5, 0.56, 0.62] : [0.07, 0.14, 0.21, 0.28, 0.35, 0.42, 0.5, 0.58];
  const sea = variant === 2 ? [] : variant === 1 ? [-0.07, -0.15, -0.23] : [-0.08, -0.18];
  const highlight = variant === 2 ? 0.26 : 0.28;

  const soundings: { x: number; y: number; depth: number }[] = [];
  if (!thumb && variant !== 2) {
    for (let k = 0; k < 60 && soundings.length < 16; k++) {
      const i = Math.floor(rng() * cols);
      const j = Math.floor(rng() * rows);
      const v = field[j * (cols + 1) + i];
      if (v < -0.06) soundings.push({ x: (i / cols) * W, y: (j / rows) * H, depth: Math.round(-v * 260 + 6) });
    }
  }

  return (
    <>
      <g className="s-mut" strokeWidth="0.5" strokeDasharray="2 4">
        {[80, 160, 240, 320].map((x) => (
          <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={H} />
        ))}
        {[100, 200, 300, 400].map((y) => (
          <line key={`gy${y}`} x1={0} y1={y} x2={W} y2={y} />
        ))}
      </g>
      {sea.length > 0 && (
        <g className="s-mut" strokeWidth="0.7" strokeDasharray="1 3">
          {sea.map((level) => (
            <path key={`s${level}`} d={isoPath(field, cols, rows, level)} />
          ))}
        </g>
      )}
      <path d={isoPath(field, cols, rows, highlight)} className="s-acc" strokeWidth="4" opacity="0.9" />
      <g className="s-ink" strokeWidth="0.7">
        {land.map((level) => (
          <path key={`l${level}`} d={isoPath(field, cols, rows, level)} />
        ))}
      </g>
      {variant !== 2 && <path d={isoPath(field, cols, rows, 0)} className="s-ink" strokeWidth="1.7" />}
      <g className="s-ink f-acc" strokeWidth="0.9">
        <path d={`M${r(peak.x)} ${r(peak.y - 7)}L${r(peak.x + 6)} ${r(peak.y + 4)}L${r(peak.x - 6)} ${r(peak.y + 4)}Z`} />
      </g>
      {!thumb && (
        <>
          {soundings.map((s, index) => (
            <Label key={`d${index}`} x={s.x} y={s.y} size={7} anchor="middle" className="t-art t-mut">
              {s.depth}
            </Label>
          ))}
          <g className="s-ink" strokeWidth="0.8">
            <path d="M366 26L372 44L366 40L360 44Z" className="f-ink" />
          </g>
          <Label x={366} y={58} anchor="middle" size={8}>
            N
          </Label>
          <g className="s-ink" strokeWidth="0.8">
            <rect x="24" y="470" width="20" height="5" className="f-ink" />
            <rect x="44" y="470" width="20" height="5" />
            <rect x="64" y="470" width="20" height="5" className="f-ink" />
            <rect x="84" y="470" width="20" height="5" />
          </g>
          <Label x={24} y={464} size={7}>
            0
          </Label>
          <Label x={104} y={464} size={7} anchor="end">
            10 KM
          </Label>
          {[80, 160, 240, 320].map((x, i) => (
            <Label key={`lx${x}`} x={x + 3} y={12} size={6.5} className="t-art t-mut">
              {`0${3 + i}°${10 + i * 7}′`}
            </Label>
          ))}
        </>
      )}
    </>
  );
}

/**
 * Valley cross-section with sediment strata.
 * `param` — 0: dry valley · 1: reservoir · 2: reservoir with second shoreline · 3: second shoreline rising.
 */
export function strata({ seed, param = 2, detail, uid }: Ctx) {
  const thumb = detail === "thumb";
  const noise = valueNoise2D(seed);
  const step = thumb ? 10 : 5;
  const surface = (x: number) => 150 + 210 * Math.exp(-(((x - 200) / 118) ** 2)) + (noise(x / 40, 1.3) - 0.5) * 26;
  const xs: number[] = [];
  for (let x = 0; x <= W; x += step) xs.push(x);

  const ground: Pt[] = xs.map((x) => [x, surface(x)]);
  const layers = Array.from({ length: thumb ? 5 : 8 }, (_, k) =>
    xs.map((x): Pt => [x, Math.min(H + 4, surface(x) + (k + 1) * 26 + (noise(x / 55, (k + 1) * 3.1) - 0.5) * 18)]),
  );
  const band = [...layers[1], ...[...layers[2]].reverse()];
  const upperY = 232;
  const lowerY = param >= 3 ? 262 : 276;

  const waterPolygon = (level: number): Pt[] => {
    const below = xs.filter((x) => surface(x) > level);
    if (below.length === 0) return [];
    return [[below[0], level], ...below.map((x): Pt => [x, surface(x)]), [below[below.length - 1], level]];
  };
  const upper = param >= 1 ? waterPolygon(upperY) : [];
  const lower = param >= 2 ? waterPolygon(lowerY) : [];
  const lowerSpan = lower.length ? [lower[0][0], lower[lower.length - 1][0]] : [0, 0];
  const upperSpan = upper.length ? [upper[0][0], upper[upper.length - 1][0]] : [0, 0];

  const houses = [-1, 1].flatMap((side) =>
    [0, 1, 2].map((k) => {
      const x = 200 + side * (54 + k * 17);
      return { x, y: surface(x) };
    }),
  );

  return (
    <>
      <defs>
        <Hatch id={`${uid}-band`} angle={-30} gap={3.5} width={0.6} />
        <Hatch id={`${uid}-water`} angle={0} gap={4} width={0.55} />
        <Hatch id={`${uid}-deep`} angle={0} gap={2.2} width={0.55} />
      </defs>
      <path d={path([[0, H], ...ground, [W, H]], true)} className="f-sheet" />
      <path d={path(band, true)} fill={`url(#${uid}-band)`} />
      <g className="s-mut" strokeWidth="0.7">
        {layers.map((layer, k) => (
          <path key={`layer${k}`} d={path(layer)} strokeDasharray={k % 2 ? "3 3" : undefined} />
        ))}
      </g>
      {upper.length > 0 && <path d={path(upper, true)} fill={`url(#${uid}-water)`} opacity="0.9" />}
      {lower.length > 0 && <path d={path(lower, true)} fill={`url(#${uid}-deep)`} />}
      {param >= 2 &&
        houses.map((h, i) => (
          <g key={`h${i}`} className="s-ink" strokeWidth="0.7" strokeDasharray="1.5 1.5">
            <path d={`M${r(h.x - 5)} ${r(h.y)}V${r(h.y - 8)}L${r(h.x)} ${r(h.y - 13)}L${r(h.x + 5)} ${r(h.y - 8)}V${r(h.y)}`} />
          </g>
        ))}
      <path d={path(ground)} className="s-ink" strokeWidth="1.6" />
      {upper.length > 0 && <line x1={upperSpan[0]} y1={upperY} x2={upperSpan[1]} y2={upperY} className="s-ink" strokeWidth="1.2" />}
      {lower.length > 0 && (
        <>
          <line x1={lowerSpan[0]} y1={lowerY} x2={lowerSpan[1]} y2={lowerY} className="s-acc" strokeWidth="5" />
          <line x1={lowerSpan[0]} y1={lowerY} x2={lowerSpan[1]} y2={lowerY} className="s-ink" strokeWidth="1" strokeDasharray="5 3" />
        </>
      )}
      {param === 0 && (
        <line x1={upperSpan[0] || 84} y1={upperY} x2={upperSpan[1] || 316} y2={upperY} className="s-mut" strokeWidth="0.8" strokeDasharray="2 4" />
      )}
      {!thumb && (
        <>
          <Label x={20} y={30} size={8}>
            SECTION A–A′ · OSTRA
          </Label>
          <g className="s-ink" strokeWidth="0.6">
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`t${i}`} x1={8} y1={150 + i * 25} x2={i % 2 ? 12 : 16} y2={150 + i * 25} />
            ))}
          </g>
          {param >= 1 && (
            <Label x={392} y={upperY - 6} anchor="end" size={7.5}>
              +0.0 M RESERVOIR
            </Label>
          )}
          {param >= 2 && (
            <Label x={392} y={lowerY + 14} anchor="end" size={7.5}>
              −{param >= 3 ? "7.5" : "11.0"} M SECOND SHORELINE
            </Label>
          )}
          {param === 0 && (
            <Label x={392} y={upperY - 6} anchor="end" size={7.5} className="t-art t-mut">
              VOTE · 212 : 211
            </Label>
          )}
        </>
      )}
    </>
  );
}
