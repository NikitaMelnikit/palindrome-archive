import { r, valueNoise2D } from "@/lib/random";
import { CenterMark, Dimension, DraftGrid, Hatch, Label, arc, path, type Ctx, type Pt } from "./shared";

function gearPath(cx: number, cy: number, radius: number, teeth: number, depth = 6, rotation = 0): string {
  const points: Pt[] = [];
  const step = (Math.PI * 2) / teeth;
  const at = (rad: number, a: number): Pt => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  for (let i = 0; i < teeth; i++) {
    const a = rotation + i * step;
    const w = step * 0.25;
    points.push(at(radius, a - w), at(radius + depth, a - w * 0.6), at(radius + depth, a + w * 0.6), at(radius, a + w));
  }
  return path(points, true);
}

function Gear({ cx, cy, radius, teeth, rotation = 0 }: { cx: number; cy: number; radius: number; teeth: number; rotation?: number }) {
  return (
    <g>
      <path d={gearPath(cx, cy, radius, teeth, 6, rotation)} className="f-sheet s-ink" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r(radius * 0.78)} className="s-mut" strokeWidth="0.6" strokeDasharray="2 2" />
      <circle cx={cx} cy={cy} r={r(radius * 0.26)} className="s-ink" strokeWidth="0.9" />
      <g className="s-ink" strokeWidth="0.8">
        {Array.from({ length: 5 }, (_, i) => {
          const a = rotation + (i * Math.PI * 2) / 5;
          return (
            <line
              key={`sp${i}`}
              x1={r(cx + Math.cos(a) * radius * 0.26)}
              y1={r(cy + Math.sin(a) * radius * 0.26)}
              x2={r(cx + Math.cos(a) * radius * 0.78)}
              y2={r(cy + Math.sin(a) * radius * 0.78)}
            />
          );
        })}
      </g>
      <CenterMark x={cx} y={cy} size={4} />
    </g>
  );
}

/**
 * Technical drawings. Variant 0: gear train and counter · 1: pantograph · 2: Somnograph housing ·
 * 3: Somnograph mechanism · 4: key.
 */
export function schematic({ seed, variant, detail, uid, rng }: Ctx) {
  const thumb = detail === "thumb";
  const noise = valueNoise2D(seed);

  if (variant === 1) {
    const joints: Pt[] = [
      [104, 118],
      [222, 176],
      [168, 252],
      [286, 310],
    ];
    const stylus: Pt = [330, 384];
    const coast: Pt[] = [];
    for (let x = 182; x <= stylus[0]; x += thumb ? 6 : 3) {
      coast.push([x, 444 - (x - 182) * 0.42 + (noise(x / 14, 3) - 0.5) * 34]);
    }
    coast.push(stylus);
    return (
      <>
        <DraftGrid />
        <rect x={40} y={84} width={78} height={44} className="f-sheet s-ink" strokeWidth="1" />
        <Gear cx={74} cy={106} radius={15} teeth={10} />
        <rect x={172} y={330} width={210} height={142} className="f-sheet s-ink" strokeWidth="0.8" />
        <path d={path(coast)} className="s-ink" strokeWidth="1.3" />
        <g className="s-ink" strokeWidth="3.2">
          <line x1={joints[0][0]} y1={joints[0][1]} x2={joints[1][0]} y2={joints[1][1]} />
          <line x1={joints[0][0]} y1={joints[0][1]} x2={joints[2][0]} y2={joints[2][1]} />
          <line x1={joints[1][0]} y1={joints[1][1]} x2={joints[3][0]} y2={joints[3][1]} />
          <line x1={joints[2][0]} y1={joints[2][1]} x2={joints[3][0]} y2={joints[3][1]} />
          <line x1={joints[3][0]} y1={joints[3][1]} x2={stylus[0]} y2={stylus[1]} />
        </g>
        {joints.map(([x, y], i) => (
          <circle key={`j${i}`} cx={x} cy={y} r={5.5} className="f-bg s-ink" strokeWidth="1.2" />
        ))}
        <circle cx={stylus[0]} cy={stylus[1]} r={5} className="f-acc s-ink" strokeWidth="1" />
        <circle cx={68} cy={300} r={32} className="s-ink" strokeWidth="1.1" />
        <circle cx={68} cy={300} r={9} className="s-ink" strokeWidth="0.9" />
        <circle cx={68} cy={414} r={20} className="s-ink" strokeWidth="1.1" />
        <rect x={94} y={300} width={16} height={114} className="f-sheet s-ink" strokeWidth="0.7" />
        <g className="f-ink">
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={`h${i}`} x={98 + (i % 2) * 5} y={306 + i * 9} width={3} height={4} />
          ))}
        </g>
        <Dimension x1={104} y1={88} x2={222} y2={146} label="1 : 11" showLabel={!thumb} />
        {!thumb && (
          <>
            <Label x={20} y={34} size={8}>
              MODEL Q · PANTOGRAPH, SIDE ELEVATION
            </Label>
            <Label x={28} y={460} size={7} className="t-art t-mut">
              REEL · 340 CHARTS
            </Label>
            <Label x={stylus[0] + 10} y={stylus[1] + 4} size={7}>
              STYLUS
            </Label>
          </>
        )}
      </>
    );
  }

  if (variant === 2) {
    return (
      <>
        <defs>
          <Hatch id={`${uid}-wood`} angle={80} gap={5} width={0.4} className="s-mut" />
        </defs>
        <DraftGrid />
        <path d="M138 196C138 150 118 132 96 116" className="s-ink" strokeWidth="1.2" />
        <path d="M158 196C160 150 152 122 150 102" className="s-ink" strokeWidth="1.2" />
        <ellipse cx={118} cy={96} rx={50} ry={22} transform="rotate(-22 118 96)" className="f-sheet s-ink" strokeWidth="1.3" />
        <ellipse cx={118} cy={98} rx={30} ry={12} transform="rotate(-22 118 98)" className="f-ink" opacity="0.85" />
        <rect x={96} y={196} width={212} height={200} fill={`url(#${uid}-wood)`} className="s-ink" strokeWidth="1.5" />
        <rect x={108} y={208} width={188} height={176} className="s-mut" strokeWidth="0.6" />
        <rect x={180} y={226} width={100} height={66} className="f-sheet s-ink" strokeWidth="1" />
        <circle cx={206} cy={259} r={18} className="s-ink" strokeWidth="0.9" />
        <circle cx={254} cy={259} r={18} className="s-ink" strokeWidth="0.9" />
        <circle cx={206} cy={259} r={4} className="f-ink" />
        <circle cx={254} cy={259} r={4} className="f-ink" />
        <line x1={206} y1={241} x2={254} y2={241} className="s-ink" strokeWidth="0.7" />
        <circle cx={142} cy={330} r={22} className="f-sheet s-ink" strokeWidth="1" />
        <g className="s-ink" strokeWidth="0.6">
          {Array.from({ length: 9 }, (_, i) => {
            const a = ((-120 + i * 30) * Math.PI) / 180;
            return <line key={`dt${i}`} x1={r(142 + Math.sin(a) * 15)} y1={r(330 - Math.cos(a) * 15)} x2={r(142 + Math.sin(a) * 20)} y2={r(330 - Math.cos(a) * 20)} />;
          })}
          <line x1={142} y1={330} x2={152} y2={318} strokeWidth="1.2" />
        </g>
        <circle cx={252} cy={338} r={12} className="f-sheet s-ink" strokeWidth="1" />
        <circle cx={290} cy={214} r={4.5} className="f-acc s-ink" strokeWidth="0.8" />
        <rect x={110} y={396} width={16} height={20} className="s-ink" strokeWidth="1" />
        <rect x={278} y={396} width={16} height={20} className="s-ink" strokeWidth="1" />
        <path d="M308 360C330 430 372 432 356 378" className="s-ink" strokeWidth="1.2" />
        <path d={arc(352, 338, 32, -150, 150)} className="s-ink" strokeWidth="5" />
        <path d={arc(352, 338, 32, -150, 150)} className="s-bg" strokeWidth="2.6" />
        {!thumb && (
          <>
            <Label x={20} y={34} size={8}>
              SOMNOGRAPH · FRONT ELEVATION
            </Label>
            {[
              { x: 60, y: 76, n: "A", tx: 88, ty: 96 },
              { x: 230, y: 214, n: "B", tx: 230, ty: 228 },
              { x: 382, y: 300, n: "C", tx: 372, ty: 316 },
            ].map((c) => (
              <g key={c.n}>
                <line x1={c.x} y1={c.y} x2={c.tx} y2={c.ty} className="s-ink" strokeWidth="0.6" />
                <circle cx={c.x} cy={c.y} r={7} className="f-bg s-ink" strokeWidth="0.8" />
                <Label x={c.x} y={c.y + 3} size={7.5} anchor="middle">
                  {c.n}
                </Label>
              </g>
            ))}
            <Label x={20} y={466} size={7} className="t-art t-mut">
              WALNUT · BRASS · CLOTH WIRE · MANUAL 1912/1994
            </Label>
          </>
        )}
      </>
    );
  }

  if (variant === 3) {
    const tracePoints: Pt[] = [];
    for (let y = 330; y <= 468; y += thumb ? 6 : 3) tracePoints.push([335 + (noise(y / 6, 4) - 0.5) * 30, y]);
    return (
      <>
        <defs>
          <Hatch id={`${uid}-bob`} angle={45} gap={3} width={0.6} />
        </defs>
        <DraftGrid />
        <path d={arc(200, 70, 236, 160, 200)} className="s-mut" strokeWidth="0.7" strokeDasharray="3 3" />
        <CenterMark x={200} y={70} size={7} />
        <line x1={200} y1={70} x2={200} y2={282} className="s-ink" strokeWidth="1.4" />
        <circle cx={200} cy={302} r={24} fill={`url(#${uid}-bob)`} className="s-ink" strokeWidth="1.2" />
        <rect x={150} y={344} width={100} height={42} className="f-sheet s-ink" strokeWidth="1" />
        <path d="M158 365L168 352L178 378L188 352L198 378L208 352L218 378L228 352L238 365" className="s-ink" strokeWidth="0.9" />
        <Gear cx={104} cy={168} radius={30} teeth={12} rotation={0.2} />
        <Gear cx={74} cy={236} radius={16} teeth={8} />
        <line x1={104} y1={168} x2={200} y2={110} className="s-ink" strokeWidth="0.7" strokeDasharray="4 3" />
        <circle cx={300} cy={160} r={7} className="f-bg s-ink" strokeWidth="1.2" />
        <line x1={300} y1={160} x2={334} y2={332} className="s-ink" strokeWidth="2" />
        <rect x={310} y={322} width={50} height={150} className="f-sheet s-ink" strokeWidth="0.8" />
        <path d={path(tracePoints)} className="s-ink" strokeWidth="0.9" />
        <rect x={52} y={330} width={74} height={74} className="f-acc s-ink" strokeWidth="1.2" />
        <Label x={89} y={380} size={36} anchor="middle" className="t-art t-display">
          ?
        </Label>
        {!thumb && (
          <>
            <Label x={20} y={34} size={8}>
              SOMNOGRAPH · INTERNAL SCHEMATIC
            </Label>
            <Label x={52} y={420} size={7} className="t-art t-mut">
              COMPONENT 7 · UNNAMED
            </Label>
            <Label x={214} y={92} size={7} className="t-art t-mut">
              DAMPED PENDULUM
            </Label>
          </>
        )}
      </>
    );
  }

  if (variant === 4) {
    const depths = Array.from({ length: 7 }, () => 6 + Math.floor(rng() * 5) * 4);
    const cut = 20;
    const bitStart = 190;
    const bit: Pt[] = [[bitStart, 262]];
    depths.forEach((depth, i) => {
      bit.push([bitStart + i * cut + 3, 262 + depth], [bitStart + (i + 1) * cut - 3, 262 + depth]);
    });
    bit.push([bitStart + depths.length * cut, 262]);
    return (
      <>
        <defs>
          <Hatch id={`${uid}-bit`} angle={45} gap={3} width={0.6} />
        </defs>
        <DraftGrid />
        <circle cx={96} cy={250} r={52} className="f-sheet s-ink" strokeWidth="1.6" />
        <circle cx={96} cy={250} r={15} className="f-bg s-ink" strokeWidth="1.1" />
        <circle cx={96} cy={210} r={7} className="f-acc s-ink" strokeWidth="0.9" />
        <rect x={146} y={238} width={202} height={24} className="f-sheet s-ink" strokeWidth="1.2" />
        <line x1={150} y1={250} x2={344} y2={250} className="s-mut" strokeWidth="0.7" />
        <path d={path(bit, true)} fill={`url(#${uid}-bit)`} className="s-ink" strokeWidth="1.1" />
        <path d="M348 238L364 250L348 262Z" className="f-sheet s-ink" strokeWidth="1.1" />
        <Dimension x1={44} y1={176} x2={364} y2={176} label="L 318.0" showLabel={!thumb} />
        <Dimension x1={380} y1={238} x2={380} y2={262} label="6.0" showLabel={!thumb} />
        <rect x={150} y={372} width={64} height={30} className="s-ink" strokeWidth="1" />
        <path d="M150 402L214 372M166 402L214 380M182 402L214 388M150 388L174 372M150 380L158 372" className="s-ink" strokeWidth="0.5" />
        {!thumb && (
          <>
            {depths.map((depth, i) => (
              <Label key={`d${i}`} x={bitStart + i * cut + cut / 2} y={300 + (i % 2) * 10} size={6.5} anchor="middle" className="t-art t-mut">
                {`${depth / 2}/8`}
              </Label>
            ))}
            <Label x={20} y={34} size={8}>
              KEY · PROFILE AND SECTION B–B
            </Label>
            <Label x={226} y={392} size={7}>
              SECTION B–B
            </Label>
            <Label x={20} y={466} size={7} className="t-art t-mut">
              PATENT ANTICIPATED 2088 · No. WITHHELD
            </Label>
          </>
        )}
      </>
    );
  }

  // Variant 0 — gear train, drum and counter.
  return (
    <>
      <defs>
        <Hatch id={`${uid}-drum`} angle={90} gap={4} width={0.5} />
      </defs>
      <DraftGrid />
      <Gear cx={150} cy={204} radius={72} teeth={24} rotation={0.08} />
      <Gear cx={245} cy={284} radius={46} teeth={15} rotation={0.3} />
      <Gear cx={237} cy={143} radius={28} teeth={10} rotation={0.1} />
      <rect x={50} y={372} width={190} height={62} fill={`url(#${uid}-drum)`} className="s-ink" strokeWidth="1.1" />
      <ellipse cx={50} cy={403} rx={10} ry={31} className="f-sheet s-ink" strokeWidth="1.1" />
      <ellipse cx={240} cy={403} rx={10} ry={31} className="f-sheet s-ink" strokeWidth="1.1" />
      <rect x={262} y={384} width={112} height={44} className="f-sheet s-ink" strokeWidth="1.3" />
      {["0", "0", "0", "4"].map((digit, i) => (
        <g key={`c${i}`}>
          <rect x={266 + i * 26.5} y={388} width={24} height={36} className={i === 3 ? "f-acc s-ink" : "s-ink"} strokeWidth="0.7" />
          <Label x={278 + i * 26.5} y={413} size={19} anchor="middle" className="t-art t-display">
            {digit}
          </Label>
        </g>
      ))}
      <Dimension x1={78} y1={112} x2={222} y2={112} label="Ø 144" showLabel={!thumb} />
      {!thumb && (
        <>
          <Label x={20} y={34} size={8}>
            PATIENCE ENGINE · GEAR TRAIN, ELEVATION
          </Label>
          <Label x={50} y={452} size={7} className="t-art t-mut">
            DRUM · 1 REV / 11 YR
          </Label>
          <Label x={262} y={448} size={7} className="t-art t-mut">
            COUNTER · 1889 →
          </Label>
        </>
      )}
    </>
  );
}
