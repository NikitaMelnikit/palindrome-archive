import type { ReactNode } from "react";
import { r, type Rng } from "@/lib/random";
import { Dimension, DraftGrid, H, Hatch, Label, W, path, type Ctx, type Pt } from "./shared";

/** A desk lamp and its shadows. Variant 0: light from here · 1: light from there · 2: both. */
export function shadow({ variant, detail, uid }: Ctx) {
  const thumb = detail === "thumb";
  const here = variant === 0 || variant === 2;
  const there = variant === 1 || variant === 2;
  const shade: Pt[] = [
    [168, 160],
    [214, 147],
    [238, 206],
    [156, 224],
  ];
  return (
    <>
      <defs>
        <Hatch id={`${uid}-a`} angle={45} gap={3.4} width={0.7} />
        <Hatch id={`${uid}-b`} angle={-45} gap={3.4} width={0.9} className="s-acc" />
      </defs>
      <line x1="0" y1="360" x2={W} y2="360" className="s-ink" strokeWidth="1" />
      <g className="s-mut" strokeWidth="0.4">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`fl${i}`} x1={i * 50} y1={360} x2={i * 50 + (i - 4) * 30} y2={H} />
        ))}
      </g>
      {here && (
        <>
          <g className="s-mut" strokeWidth="0.6" strokeDasharray="3 4">
            <line x1={356} y1={64} x2={22} y2={452} />
            <line x1={356} y1={64} x2={98} y2={470} />
          </g>
          <path d="M170 376L232 376L98 470L22 452Z" fill={`url(#${uid}-a)`} className="s-ink" strokeWidth="0.6" />
          <ellipse cx={46} cy={452} rx={40} ry={12} fill={`url(#${uid}-a)`} className="s-ink" strokeWidth="0.6" />
          <circle cx={356} cy={64} r={9} className="s-ink" strokeWidth="1" />
          <g className="s-ink" strokeWidth="0.8">
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              return <line key={`ray${i}`} x1={r(356 + Math.cos(a) * 13)} y1={r(64 + Math.sin(a) * 13)} x2={r(356 + Math.cos(a) * 19)} y2={r(64 + Math.sin(a) * 19)} />;
            })}
          </g>
        </>
      )}
      {there && (
        <>
          <g className="s-acc" strokeWidth="0.7" strokeDasharray="3 4">
            <line x1={44} y1={70} x2={318} y2={482} />
            <line x1={44} y1={70} x2={388} y2={462} />
          </g>
          <path d="M168 376L232 376L388 462L318 482Z" fill={`url(#${uid}-b)`} className="s-acc" strokeWidth="1" />
          <ellipse cx={360} cy={474} rx={38} ry={11} fill={`url(#${uid}-b)`} className="s-acc" strokeWidth="1" />
          <circle cx={326} cy={471} r={7} className="f-bg" />
          <circle cx={44} cy={70} r={11} className="s-acc" strokeWidth="1.2" strokeDasharray="2 2" />
          <Label x={44} y={74} size={10} anchor="middle" className="t-art t-acc">
            ?
          </Label>
        </>
      )}
      <ellipse cx={200} cy={372} rx={46} ry={9} className="f-bg s-ink" strokeWidth="1.3" />
      <path d="M200 368L238 276L194 204" className="s-ink" strokeWidth="2.6" />
      <circle cx={238} cy={276} r={5} className="f-bg s-ink" strokeWidth="1.2" />
      <circle cx={194} cy={204} r={4} className="f-bg s-ink" strokeWidth="1.2" />
      <path d={path(shade, true)} className="f-bg s-ink" strokeWidth="1.4" />
      <line x1={172} y1={170} x2={226} y2={156} className="s-mut" strokeWidth="0.6" />
      <circle cx={198} cy={224} r={7} className="f-ink" />
      {!thumb && (
        <>
          {here && (
            <Label x={352} y={96} size={7.5} anchor="end">
              SOURCE A
            </Label>
          )}
          {there && (
            <Label x={62} y={104} size={7.5} className="t-art t-acc">
              SOURCE B · Δt +87Y
            </Label>
          )}
          <Label x={20} y={H - 14} size={7} className="t-art t-mut">
            {variant === 0 ? "LIGHT FROM HERE" : variant === 1 ? "LIGHT FROM THERE" : "TWO SHADOWS · ONE LAMP"}
          </Label>
        </>
      )}
    </>
  );
}

function corridor(thumb: boolean) {
  const end = { l: 174, r: 226, t: 206, b: 264 };
  const front = { l: 16, r: 384, t: 24, b: 484 };
  const depth = (t: number) => (1 - 1 / (1 + 3 * t)) / 0.75;
  const at = (s: number) => ({
    l: front.l + (end.l - front.l) * s,
    r: front.r + (end.r - front.r) * s,
    t: front.t + (end.t - front.t) * s,
    b: front.b + (end.b - front.b) * s,
  });
  const west = Array.from({ length: thumb ? 10 : 16 }, (_, i) => at(depth((i + 1) / (thumb ? 10 : 16))));
  const east = Array.from({ length: thumb ? 16 : 26 }, (_, i) => at(depth((i + 1) / (thumb ? 16 : 26))));
  return (
    <>
      <g className="s-ink" strokeWidth="1">
        <line x1={front.l} y1={front.t} x2={end.l} y2={end.t} />
        <line x1={front.r} y1={front.t} x2={end.r} y2={end.t} />
        <line x1={front.l} y1={front.b} x2={end.l} y2={end.b} />
        <line x1={front.r} y1={front.b} x2={end.r} y2={end.b} />
      </g>
      <g className="s-ink" strokeWidth="0.55">
        {west.map((p, i) => (
          <line key={`w${i}`} x1={r(p.l)} y1={r(p.b)} x2={200} y2={r(p.b)} />
        ))}
        {east.map((p, i) => (
          <line key={`e${i}`} x1={200} y1={r(p.b)} x2={r(p.r)} y2={r(p.b)} />
        ))}
        {Array.from({ length: 9 }, (_, j) => (
          <line key={`lg${j}`} x1={front.l + (j * (front.r - front.l)) / 8} y1={front.b} x2={end.l + (j * (end.r - end.l)) / 8} y2={end.b} />
        ))}
      </g>
      <g className="s-mut" strokeWidth="0.5">
        {west
          .filter((_, i) => i % 2 === 0)
          .map((p, i) => (
            <line key={`wl${i}`} x1={r(p.l)} y1={r(p.t)} x2={r(p.l)} y2={r(p.b)} />
          ))}
        {east
          .filter((_, i) => i % 2 === 0)
          .map((p, i) => (
            <line key={`wr${i}`} x1={r(p.r)} y1={r(p.t)} x2={r(p.r)} y2={r(p.b)} />
          ))}
      </g>
      <g className="f-ink" opacity="0.8">
        {west
          .filter((_, i) => i % 3 === 1)
          .map((p, i) => (
            <rect key={`lt${i}`} x={r(200 - (p.r - p.l) * 0.06)} y={r(p.t + 2)} width={r((p.r - p.l) * 0.12)} height={r(Math.max(1.5, (p.b - p.t) * 0.012))} />
          ))}
      </g>
      <rect x={end.l} y={end.t} width={end.r - end.l} height={end.b - end.t} className="f-acc s-ink" strokeWidth="1.2" />
      <line x1={200} y1={end.b} x2={200} y2={front.b} className="s-ink" strokeWidth="0.8" strokeDasharray="4 3" />
      {!thumb && (
        <>
          <Label x={30} y={front.b - 8} size={9}>
            ← 40.00 M
          </Label>
          <Label x={370} y={front.b - 8} size={9} anchor="end">
            61.00 M →
          </Label>
          <Label x={200} y={end.t - 10} size={7} anchor="middle" className="t-art t-mut">
            KESSEL JUNCTION · CONNECTING CORRIDOR
          </Label>
        </>
      )}
    </>
  );
}

function signingTable(uid: string, pensRemaining: number, thumb: boolean, rng: Rng) {
  const pens = [
    { x: 112, y: 392, angle: -12 },
    { x: 202, y: 404, angle: 4 },
    { x: 292, y: 388, angle: 16 },
  ];
  const signed = 3 - pensRemaining;
  const docLines = Array.from({ length: 9 }, (_, i) => ({ y: 186 + i * 11, w: 84 + rng() * 34 }));
  return (
    <>
      <defs>
        <Hatch id={`${uid}-blot`} angle={0} gap={3} width={0.45} className="s-mut" />
      </defs>
      <DraftGrid />
      <rect x={36} y={66} width={328} height={366} className="f-sheet s-ink" strokeWidth="1.6" />
      <rect x={44} y={74} width={312} height={350} className="s-mut" strokeWidth="0.6" />
      <rect x={84} y={128} width={232} height={216} fill={`url(#${uid}-blot)`} className="s-ink" strokeWidth="1" />
      <rect x={128} y={146} width={144} height={180} className="f-bg s-ink" strokeWidth="0.9" />
      <rect x={140} y={160} width={70} height={5} className="f-ink" />
      <g className="f-ink" opacity="0.45">
        {docLines.map((l, i) => (
          <rect key={`dl${i}`} x={140} y={l.y} width={r(l.w)} height={2.6} />
        ))}
      </g>
      {[0, 1, 2].map((i) => (
        <g key={`sig${i}`}>
          <line x1={140 + i * 42} y1={310} x2={174 + i * 42} y2={310} className="s-ink" strokeWidth="0.6" />
          {i < signed && (
            <path
              d={`M${142 + i * 42} 306c4-8 8 4 12-4s6 6 10-2 6 4 8 0`}
              className="s-ink"
              strokeWidth="1"
            />
          )}
        </g>
      ))}
      {pens.map((pen, i) => {
        const present = i < pensRemaining;
        return (
          <g key={`pen${i}`} transform={`rotate(${pen.angle} ${pen.x} ${pen.y})`}>
            <rect
              x={pen.x - 52}
              y={pen.y - 4}
              width={96}
              height={8}
              className={present ? (i === 2 ? "f-acc s-ink" : "f-ink s-ink") : "s-mut"}
              strokeWidth={present ? 0.8 : 0.8}
              strokeDasharray={present ? undefined : "3 2"}
            />
            <path
              d={`M${pen.x + 44} ${pen.y - 4}L${pen.x + 58} ${pen.y}L${pen.x + 44} ${pen.y + 4}`}
              className={present ? "f-ink s-ink" : "s-mut"}
              strokeWidth="0.8"
              strokeDasharray={present ? undefined : "3 2"}
            />
            {present && <line x1={pen.x - 40} y1={pen.y - 6} x2={pen.x - 8} y2={pen.y - 6} className="s-ink" strokeWidth="1.2" />}
          </g>
        );
      })}
      {!thumb && (
        <>
          {pens.map((pen, i) => (
            <Label key={`pl${i}`} x={pen.x} y={pen.y + 24} size={7} anchor="middle" className="t-art t-mut">
              {`P${i + 1}${i < pensRemaining ? "" : " · USED"}`}
            </Label>
          ))}
          <Label x={36} y={52} size={8}>
            ESKER ACCORD · SIGNING TABLE, PLAN
          </Label>
          <Label x={364} y={52} size={7.5} anchor="end" className="t-art t-mut">
            {`PENS ON BLOTTER: ${pensRemaining}`}
          </Label>
        </>
      )}
    </>
  );
}

function warp(rng: Rng, thumb: boolean) {
  const cx = 200 + (rng() - 0.5) * 80;
  const cy = 240 + (rng() - 0.5) * 80;
  const pull = ([x, y]: Pt): Pt => {
    const dx = x - cx;
    const dy = y - cy;
    const f = -2600 / (dx * dx + dy * dy + 900);
    return [x + dx * f, y + dy * f];
  };
  const step = thumb ? 20 : 10;
  const lines: string[] = [];
  for (let x = 0; x <= W; x += 25) {
    const pts: Pt[] = [];
    for (let y = 0; y <= H; y += step) pts.push(pull([x, y]));
    lines.push(path(pts));
  }
  for (let y = 0; y <= H; y += 25) {
    const pts: Pt[] = [];
    for (let x = 0; x <= W; x += step) pts.push(pull([x, y]));
    lines.push(path(pts));
  }
  return (
    <>
      <path d={lines.join("")} className="s-ink" strokeWidth="0.6" />
      <g className="s-mut" strokeWidth="0.7" strokeDasharray="2 3">
        <circle cx={r(cx)} cy={r(cy)} r={26} />
        <circle cx={r(cx)} cy={r(cy)} r={52} />
        <circle cx={r(cx)} cy={r(cy)} r={92} />
      </g>
      <circle cx={r(cx)} cy={r(cy)} r={8} className="f-acc s-ink" strokeWidth="1" />
    </>
  );
}

/** Measured grids. Variant 0: the Kessel corridor · 1: the Esker signing table (param = pens left) · 2: warp. */
export function grid({ variant, param, detail, uid, rng }: Ctx) {
  const thumb = detail === "thumb";
  if (variant === 1) return signingTable(uid, Math.max(0, Math.min(3, param ?? 3)), thumb, rng);
  if (variant === 2) return warp(rng, thumb);
  return corridor(thumb);
}

type V3 = [number, number, number];

function rotate([x, y, z]: V3, ax: number, ay: number): V3 {
  const x1 = x * Math.cos(ay) + z * Math.sin(ay);
  const z1 = -x * Math.sin(ay) + z * Math.cos(ay);
  const y2 = y * Math.cos(ax) - z1 * Math.sin(ax);
  const z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
  return [x1, y2, z2];
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

const CUBE_VERTICES: V3[] = Array.from({ length: 8 }, (_, i) => [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1]);
const CUBE_FACES = [
  [0, 2, 6, 4],
  [1, 5, 7, 3],
  [0, 4, 5, 1],
  [2, 3, 7, 6],
  [0, 1, 3, 2],
  [4, 6, 7, 5],
];
const TETRA_VERTICES: V3[] = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
];
const TETRA_FACES = [
  [0, 1, 2],
  [0, 1, 3],
  [0, 2, 3],
  [1, 2, 3],
];
const LIGHT = norm([-0.45, 0.65, 0.6]);
const CX = 200;
const CY = 232;

function solid(vertices: V3[], faces: number[][], ax: number, ay: number, scale: number) {
  const rotated = vertices.map((v) => rotate(v, ax, ay));
  const project = ([x, y, z]: V3): Pt => [CX + x * scale * (1 + z * 0.06), CY - y * scale * (1 + z * 0.06)];
  const projected = rotated.map(project);
  const shaded = faces.map((face) => {
    const pts = face.map((i) => rotated[i]);
    let n = cross(sub(pts[1], pts[0]), sub(pts[2], pts[0]));
    const centroid = pts.reduce<V3>((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
    if (dot(n, centroid) < 0) n = [-n[0], -n[1], -n[2]];
    n = norm(n);
    return { points: face.map((i) => projected[i]), visible: n[2] > 0.001, light: dot(n, LIGHT), depth: centroid[2] };
  });
  return { faces: shaded.sort((a, b) => a.depth - b.depth), projected };
}

/** The observed mineral. Variant 0: cube (one observer) · 1: tetrahedron (two) · 2: unobserved. */
export function crystal({ variant, detail, uid, rng }: Ctx) {
  const thumb = detail === "thumb";
  const fillFor = (light: number) => (light > 0.55 ? "f-sheet" : light > 0.12 ? `url(#${uid}-h1)` : `url(#${uid}-h2)`);

  const caption = variant === 0 ? "ONE OBSERVER" : variant === 1 ? "TWO OBSERVERS" : "UNOBSERVED";

  let body: ReactNode;
  let extent = { minX: 120, maxX: 280, maxY: 330 };

  if (variant === 2) {
    const ghostCube = solid(CUBE_VERTICES, CUBE_FACES, -0.3, 0.2, 70);
    const ghostTetra = solid(TETRA_VERTICES, TETRA_FACES, 0.4, 1.1, 86);
    const cloud: V3[] = Array.from({ length: 16 }, () => {
      const v = norm([rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1]);
      const k = 0.75 + rng() * 0.5;
      return [v[0] * k, v[1] * k, v[2] * k];
    });
    const pts = cloud.map((v): Pt => [CX + v[0] * 96, CY - v[1] * 96]);
    const edges: [number, number][] = [];
    pts.forEach((p, i) => {
      const nearest = pts
        .map((q, j) => ({ j, d: Math.hypot(p[0] - q[0], p[1] - q[1]) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      for (const o of nearest) if (!edges.some(([a, b]) => (a === o.j && b === i) || (a === i && b === o.j))) edges.push([i, o.j]);
    });
    extent = { minX: Math.min(...pts.map((p) => p[0])), maxX: Math.max(...pts.map((p) => p[0])), maxY: Math.max(...pts.map((p) => p[1])) };
    body = (
      <>
        <g className="s-mut" strokeWidth="0.7" strokeDasharray="4 3">
          {[...ghostCube.faces, ...ghostTetra.faces].map((f, i) => (
            <path key={`g${i}`} d={path(f.points, true)} />
          ))}
        </g>
        <g className="s-ink" strokeWidth="0.8" strokeDasharray="3 2">
          {edges.map(([a, b], i) => (
            <line key={`e${i}`} x1={r(pts[a][0])} y1={r(pts[a][1])} x2={r(pts[b][0])} y2={r(pts[b][1])} />
          ))}
        </g>
        {pts.map(([x, y], i) => (
          <circle key={`v${i}`} cx={r(x)} cy={r(y)} r={3.2} className="f-acc s-ink" strokeWidth="0.8" />
        ))}
        <Label x={CX} y={CY + 14} size={44} anchor="middle" className="t-art t-display">
          ?
        </Label>
      </>
    );
  } else {
    const model = variant === 1 ? solid(TETRA_VERTICES, TETRA_FACES, -0.36, 0.42, 104) : solid(CUBE_VERTICES, CUBE_FACES, -0.52, 0.66, 84);
    const xs = model.projected.map((p) => p[0]);
    const ys = model.projected.map((p) => p[1]);
    extent = { minX: Math.min(...xs), maxX: Math.max(...xs), maxY: Math.max(...ys) };
    body = (
      <>
        <g className="s-mut" strokeWidth="0.7" strokeDasharray="3 3">
          {model.faces
            .filter((f) => !f.visible)
            .map((f, i) => (
              <path key={`hf${i}`} d={path(f.points, true)} />
            ))}
        </g>
        {model.faces
          .filter((f) => f.visible)
          .map((f, i) => (
            <path key={`vf${i}`} d={path(f.points, true)} fill={fillFor(f.light)} className="s-ink" strokeWidth="1.4" />
          ))}
        {model.projected.map(([x, y], i) => (
          <circle key={`pv${i}`} cx={r(x)} cy={r(y)} r={1.6} className="f-ink" />
        ))}
      </>
    );
  }

  return (
    <>
      <defs>
        <Hatch id={`${uid}-h1`} angle={-35} gap={4.2} width={0.6} />
        <Hatch id={`${uid}-h2`} angle={-35} gap={2.2} width={0.7} />
      </defs>
      <g className="s-mut" strokeWidth="0.5" strokeDasharray="8 3 1 3">
        <line x1={24} y1={CY} x2={W - 24} y2={CY} />
        <line x1={CX} y1={24} x2={CX} y2={H - 60} />
      </g>
      <ellipse cx={CX} cy={r(extent.maxY + 26)} rx={110} ry={11} className="f-mut" opacity="0.3" />
      {body}
      <Dimension x1={extent.minX} y1={extent.maxY + 52} x2={extent.maxX} y2={extent.maxY + 52} label="212 G" showLabel={!thumb} />
      {!thumb && (
        <>
          <Label x={24} y={34} size={8}>
            FIG. 2112 · SPECIMEN, RAKING LIGHT 30°
          </Label>
          <Label x={24} y={H - 18} size={7.5} className="t-art t-mut">
            {caption}
          </Label>
        </>
      )}
    </>
  );
}
