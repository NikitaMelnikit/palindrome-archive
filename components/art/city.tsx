import { intBetween, mulberry32, r } from "@/lib/random";
import { Dots, H, Label, W, type Ctx } from "./shared";

interface Building {
  x: number;
  w: number;
  h: number;
  roof: "flat" | "pitch" | "chimney" | "setback";
}

function buildRow(seed: number, minW: number, maxW: number, minH: number, maxH: number, roofs: Building["roof"][]): Building[] {
  const rng = mulberry32(seed);
  const row: Building[] = [];
  let x = -6;
  while (x < W + 6) {
    const w = intBetween(rng, minW, maxW);
    const h = intBetween(rng, minH, maxH);
    row.push({ x, w, h, roof: roofs[Math.floor(rng() * roofs.length)] });
    x += w + (rng() < 0.22 ? intBetween(rng, 2, 6) : 0);
  }
  return row;
}

/**
 * A harbour city photographed in two years at once. `param` is the split position in percent:
 * 100 shows only the old city, 0 only the new one.
 */
export function city({ seed, param = 50, detail, uid }: Ctx) {
  const thumb = detail === "thumb";
  const split = (Math.max(0, Math.min(100, param)) / 100) * W;
  const horizon = 332;
  const old = buildRow(seed, 14, 30, 22, 74, ["flat", "pitch", "pitch", "chimney"]);
  const towers = buildRow(seed * 7 + 3, 16, 42, 70, 236, ["flat", "flat", "setback"]);
  const bands = thumb ? [0.55, 0.85, 1.15] : [0.45, 0.65, 0.85, 1.05, 1.25];
  const bandHeight = horizon / bands.length;

  const oldCity = (
    <g>
      {old.map((b, i) => {
        const top = horizon - b.h;
        return (
          <g key={`o${i}`}>
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={`url(#${uid}-old)`} className="s-ink" strokeWidth="0.6" />
            {b.roof === "pitch" && (
              <path
                d={`M${b.x} ${top}L${r(b.x + b.w / 2)} ${r(top - b.w * 0.45)}L${b.x + b.w} ${top}Z`}
                fill={`url(#${uid}-old)`}
                className="s-ink"
                strokeWidth="0.6"
              />
            )}
            {b.roof === "chimney" && (
              <>
                <rect x={b.x + b.w * 0.6} y={top - 10} width={4} height={10} className="f-ink" />
                {!thumb && <circle cx={b.x + b.w * 0.6 + 4} cy={top - 18} r={2.2} className="f-mut" opacity="0.6" />}
              </>
            )}
          </g>
        );
      })}
      <rect x={58} y={horizon - 96} width={18} height={96} fill={`url(#${uid}-old)`} className="s-ink" strokeWidth="0.7" />
      <path d={`M56 ${horizon - 96}L67 ${horizon - 168}L78 ${horizon - 96}Z`} fill={`url(#${uid}-old)`} className="s-ink" strokeWidth="0.7" />
      <line x1={67} y1={horizon - 168} x2={67} y2={horizon - 180} className="s-ink" strokeWidth="0.8" />
    </g>
  );

  const newCity = (
    <g>
      {towers.map((b, i) => {
        const top = horizon - b.h;
        return (
          <g key={`n${i}`}>
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={`url(#${uid}-new)`} className="s-ink" strokeWidth="0.7" />
            {b.roof === "setback" && (
              <rect x={b.x + b.w * 0.2} y={top - 26} width={b.w * 0.6} height={26} fill={`url(#${uid}-new)`} className="s-ink" strokeWidth="0.7" />
            )}
          </g>
        );
      })}
      <line x1={318} y1={horizon - 120} x2={318} y2={40} className="s-ink" strokeWidth="1.2" />
      <line x1={311} y1={70} x2={325} y2={70} className="s-ink" strokeWidth="0.8" />
      <line x1={313} y1={92} x2={323} y2={92} className="s-ink" strokeWidth="0.8" />
      <circle cx={318} cy={38} r={3.4} className="f-acc s-ink" strokeWidth="0.8" />
    </g>
  );

  const skyline = (
    <>
      <g clipPath={`url(#${uid}-left)`}>{oldCity}</g>
      <g clipPath={`url(#${uid}-right)`}>{newCity}</g>
    </>
  );

  return (
    <>
      <defs>
        {bands.map((radius, i) => (
          <Dots key={`b${i}`} id={`${uid}-sky${i}`} gap={5} radius={radius} className="f-mut" />
        ))}
        <Dots id={`${uid}-old`} gap={2.6} radius={0.95} />
        <pattern id={`${uid}-new`} width="3" height="3" patternUnits="userSpaceOnUse">
          <line x1="1.5" y1="0" x2="1.5" y2="3" className="s-ink" strokeWidth="0.75" />
        </pattern>
        <clipPath id={`${uid}-left`}>
          <rect x="0" y="0" width={split} height={H} />
        </clipPath>
        <clipPath id={`${uid}-right`}>
          <rect x={split} y="0" width={W - split} height={H} />
        </clipPath>
        <clipPath id={`${uid}-water`}>
          <rect x="0" y={horizon} width={W} height={H - horizon} />
        </clipPath>
      </defs>
      {bands.map((_, i) => (
        <rect key={`band${i}`} x="0" y={i * bandHeight} width={W} height={bandHeight + 0.5} fill={`url(#${uid}-sky${i})`} opacity="0.55" />
      ))}
      {skyline}
      <g clipPath={`url(#${uid}-water)`}>
        <g transform={`translate(0 ${horizon * 2}) scale(1 -1)`} opacity="0.3">
          {skyline}
        </g>
        {Array.from({ length: Math.ceil((H - horizon) / 5) }, (_, i) => (
          <line key={`w${i}`} x1="0" y1={horizon + 3 + i * 5} x2={W} y2={horizon + 3 + i * 5} className="s-bg" strokeWidth="1.6" />
        ))}
      </g>
      <line x1="0" y1={horizon} x2={W} y2={horizon} className="s-ink" strokeWidth="1.4" />
      <g>
        <g clipPath={`url(#${uid}-left)`}>
          <rect x={split - 24} y={horizon - 14} width={48} height={11} className="f-bg s-ink" strokeWidth="0.8" />
        </g>
        <g clipPath={`url(#${uid}-right)`}>
          <rect x={split - 24} y={horizon - 14} width={48} height={11} className="f-acc s-ink" strokeWidth="0.8" />
        </g>
        <circle cx={split - 14} cy={horizon - 2} r={2} className="f-ink" />
        <circle cx={split + 14} cy={horizon - 2} r={2} className="f-ink" />
      </g>
      {split > 0 && split < W && (
        <line x1={split} y1={18} x2={split} y2={H - 18} className="s-ink" strokeWidth="0.8" strokeDasharray="3 3" />
      )}
      {!thumb && (
        <>
          {split > 30 && (
            <Label x={Math.min(split, W) - 8} y={30} anchor="end" size={9}>
              1931
            </Label>
          )}
          {split < W - 30 && (
            <Label x={Math.max(split, 0) + 8} y={30} size={9}>
              2048
            </Label>
          )}
          <Label x={16} y={H - 14} size={7} className="t-art t-mut">
            PLATE 18×24 · EXP 41 S
          </Label>
        </>
      )}
    </>
  );
}

/** Upward snow over a low coastal city, vanishing at the height of the cathedral roof. */
export function particles({ rng, detail }: Ctx) {
  const thumb = detail === "thumb";
  const count = thumb ? 70 : 170;
  const vanish = 118;
  const roofs = Array.from({ length: 18 }, (_, i) => {
    const x = i * 23 - 4;
    return { x, w: 21, h: 26 + Math.floor(rng() * 46) };
  });

  const flakes = Array.from({ length: count }, (_, i) => {
    const t = rng();
    const y = vanish + 12 + Math.pow(t, 0.7) * 320;
    return {
      x: rng() * W,
      y,
      size: 0.7 + rng() * 1.6,
      trail: 6 + rng() * 18,
      opacity: Math.min(1, 0.3 + ((y - vanish) / 320) * 0.8),
      star: rng() < 0.14,
      accent: i % Math.floor(count / 6) === 0,
    };
  });

  return (
    <>
      <line x1="0" y1={vanish} x2={W} y2={vanish} className="s-ink" strokeWidth="0.7" strokeDasharray="4 4" />
      {flakes.map((f, i) =>
        f.star ? (
          <g key={`f${i}`} className="s-ink" strokeWidth="0.6" opacity={r(f.opacity)}>
            <line x1={r(f.x - 3)} y1={r(f.y)} x2={r(f.x + 3)} y2={r(f.y)} />
            <line x1={r(f.x - 1.5)} y1={r(f.y - 2.6)} x2={r(f.x + 1.5)} y2={r(f.y + 2.6)} />
            <line x1={r(f.x + 1.5)} y1={r(f.y - 2.6)} x2={r(f.x - 1.5)} y2={r(f.y + 2.6)} />
          </g>
        ) : (
          <g key={`f${i}`} opacity={r(f.opacity)}>
            <line x1={r(f.x)} y1={r(f.y)} x2={r(f.x)} y2={r(f.y + f.trail)} className="s-mut" strokeWidth="0.6" />
            <circle cx={r(f.x)} cy={r(f.y)} r={r(f.size)} className={f.accent ? "f-acc" : "f-ink"} />
          </g>
        ),
      )}
      {!thumb &&
        flakes
          .filter((_, i) => i % 34 === 5)
          .map((f, i) => (
            <path key={`a${i}`} d={`M${r(f.x - 4)} ${r(f.y - 6)}L${r(f.x)} ${r(f.y - 11)}L${r(f.x + 4)} ${r(f.y - 6)}`} className="s-acc" strokeWidth="1" />
          ))}
      <g className="f-bg s-ink" strokeWidth="0.7">
        {roofs.map((b, i) => (
          <rect key={`r${i}`} x={b.x} y={H - b.h} width={b.w} height={b.h} />
        ))}
        <rect x={244} y={H - 150} width={34} height={150} />
        <path d={`M242 ${H - 150}L261 ${H - 196}L280 ${H - 150}Z`} />
      </g>
      <g className="f-ink">
        {roofs
          .filter((_, i) => i % 2 === 0)
          .map((b, i) => (
            <rect key={`win${i}`} x={b.x + 6} y={H - b.h + 8} width={3} height={4} />
          ))}
      </g>
      {!thumb && (
        <>
          <Label x={16} y={vanish - 7} size={7.5}>
            VANISHING HEIGHT · 61 M
          </Label>
          <Label x={W - 16} y={vanish - 7} size={7.5} anchor="end" className="t-art t-mut">
            14:06 — 14:25
          </Label>
        </>
      )}
    </>
  );
}
