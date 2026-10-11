import { fbm, r, valueNoise2D } from "@/lib/random";
import { H, Label, W, annularSector, arc, path, polar, type Ctx, type Pt } from "./shared";

/** Polar telemetry chart with a drifting track. */
export function rings({ rng, seed, detail }: Ctx) {
  const thumb = detail === "thumb";
  const cx = 200;
  const cy = 246;
  const noise = valueNoise2D(seed);
  const count = thumb ? 26 : 46;
  const track: Pt[] = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const angle = -0.6 + t * Math.PI * 3.1;
    const radius = 14 + t * 150 + (noise(t * 6, 0.5) - 0.5) * 20;
    return [cx + Math.sin(angle) * radius, cy - Math.cos(angle) * radius];
  });
  const last = track[track.length - 1];
  const cluster = track[Math.floor(count * 0.62)];

  return (
    <>
      <g className="s-mut" strokeWidth="0.6">
        {[32, 64, 96, 128, 160, 192].map((radius, i) => (
          <circle key={`c${radius}`} cx={cx} cy={cy} r={radius} strokeDasharray={i % 2 ? "2 3" : undefined} />
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const [x0, y0] = polar(cx, cy, 18, i * 30);
          const [x1, y1] = polar(cx, cy, 196, i * 30);
          return <line key={`b${i}`} x1={r(x0)} y1={r(y0)} x2={r(x1)} y2={r(y1)} strokeWidth="0.4" />;
        })}
      </g>
      <path d={path(track)} className="s-ink" strokeWidth="0.8" strokeDasharray="3 2.5" />
      <g className="f-ink">
        {track.map(([x, y], i) => (i % (thumb ? 2 : 1) === 0 ? <circle key={`p${i}`} cx={r(x)} cy={r(y)} r={1.5} /> : null))}
        {!thumb &&
          Array.from({ length: 12 }, (_, i) => (
            <circle key={`k${i}`} cx={r(cluster[0] + (rng() - 0.5) * 16)} cy={r(cluster[1] + (rng() - 0.5) * 16)} r={1.1} />
          ))}
      </g>
      <rect x={cx - 4} y={cy - 4} width={8} height={8} className="s-ink" strokeWidth="1" />
      <circle cx={r(last[0])} cy={r(last[1])} r={7} className="f-acc s-ink" strokeWidth="1" />
      <g className="s-ink" strokeWidth="0.7">
        <line x1={r(last[0] - 14)} y1={r(last[1])} x2={r(last[0] - 9)} y2={r(last[1])} />
        <line x1={r(last[0] + 9)} y1={r(last[1])} x2={r(last[0] + 14)} y2={r(last[1])} />
        <line x1={r(last[0])} y1={r(last[1] - 14)} x2={r(last[0])} y2={r(last[1] - 9)} />
        <line x1={r(last[0])} y1={r(last[1] + 9)} x2={r(last[0])} y2={r(last[1] + 14)} />
      </g>
      {!thumb && (
        <>
          {Array.from({ length: 12 }, (_, i) => {
            const [x, y] = polar(cx, cy, 176, i * 30 + 6);
            return (
              <Label key={`l${i}`} x={x} y={y + 3} size={6.5} anchor="middle" className="t-art t-mut">
                {String(i * 30).padStart(3, "0")}
              </Label>
            );
          })}
          <Label x={last[0] + 12} y={last[1] - 10} size={8}>
            44 · 21.8°C
          </Label>
          <Label x={20} y={H - 20} size={7.5}>
            RANGE RINGS · 50 KM
          </Label>
          <Label x={W - 20} y={H - 20} size={7.5} anchor="end" className="t-art t-mut">
            T + 23 Y
          </Label>
        </>
      )}
    </>
  );
}

/** Dials. Variant 0: reversed wristwatch · 1: absence gauge · 2: the eleven-second noon. */
export function dial({ variant, detail }: Ctx) {
  const thumb = detail === "thumb";

  if (variant === 1) {
    const cx = 200;
    const cy = 236;
    const R = 148;
    const angleFor = (value: number) => -135 + 270 * value;
    const needle = angleFor(0.97);
    const [nx, ny] = polar(cx, cy, R - 16, needle);
    const [tx, ty] = polar(cx, cy, 26, needle + 180);
    const [lx, ly] = polar(cx, cy, 5, needle - 90);
    const [rx, ry] = polar(cx, cy, 5, needle + 90);
    return (
      <>
        <circle cx={cx} cy={cy} r={R + 20} className="s-ink f-sheet" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={R + 10} className="s-mut" strokeWidth="0.7" />
        <path d={annularSector(cx, cy, R - 12, R - 2, angleFor(0.9), angleFor(1))} className="f-acc s-ink" strokeWidth="0.7" />
        <g className="s-ink">
          {Array.from({ length: 51 }, (_, i) => {
            const major = i % 5 === 0;
            const [x0, y0] = polar(cx, cy, major ? R - 22 : R - 12, angleFor(i / 50));
            const [x1, y1] = polar(cx, cy, R - 2, angleFor(i / 50));
            return <line key={`t${i}`} x1={r(x0)} y1={r(y0)} x2={r(x1)} y2={r(y1)} strokeWidth={major ? 1.3 : 0.5} />;
          })}
        </g>
        {!thumb &&
          Array.from({ length: 11 }, (_, i) => {
            const [x, y] = polar(cx, cy, R - 38, angleFor(i / 10));
            return (
              <Label key={`n${i}`} x={x} y={y + 3} size={9} anchor="middle">
                {(i / 10).toFixed(1)}
              </Label>
            );
          })}
        <path d={`M${r(lx)} ${r(ly)}L${r(nx)} ${r(ny)}L${r(rx)} ${r(ry)}L${r(tx)} ${r(ty)}Z`} className="f-ink" />
        <circle cx={cx} cy={cy} r={10} className="f-ink" />
        <circle cx={cx} cy={cy} r={3} className="f-bg" />
        <Label x={cx} y={cy + 58} size={8} anchor="middle" className="t-art t-mut">
          ABSENCE
        </Label>
        <Label x={cx} y={cy + 88} size={24} anchor="middle" className="t-art t-display">
          0.97
        </Label>
        <rect x={140} y={430} width={120} height={32} className="s-ink f-sheet" strokeWidth="0.9" />
        <circle cx={150} cy={446} r={2.5} className="s-ink" strokeWidth="0.7" />
        <circle cx={250} cy={446} r={2.5} className="s-ink" strokeWidth="0.7" />
      </>
    );
  }

  if (variant === 2) {
    const cx = 200;
    const cy = 238;
    const R = 156;
    const [p0x, p0y] = polar(cx, cy, R - 6, 0);
    const [p1x, p1y] = polar(cx, cy, R - 6, 66);
    return (
      <>
        <circle cx={cx} cy={cy} r={R + 8} className="s-ink f-sheet" strokeWidth="1.8" />
        <path d={`M${cx} ${cy}L${r(p0x)} ${r(p0y)}A${R - 6} ${R - 6} 0 0 1 ${r(p1x)} ${r(p1y)}Z`} className="f-acc s-ink" strokeWidth="0.8" />
        <g className="s-ink">
          {Array.from({ length: 60 }, (_, i) => {
            const major = i % 5 === 0;
            const [x0, y0] = polar(cx, cy, major ? R - 18 : R - 9, i * 6);
            const [x1, y1] = polar(cx, cy, R, i * 6);
            return <line key={`s${i}`} x1={r(x0)} y1={r(y0)} x2={r(x1)} y2={r(y1)} strokeWidth={major ? 2 : 0.6} />;
          })}
        </g>
        <g className="s-ink" strokeWidth="0.6" strokeDasharray="2 3">
          {Array.from({ length: 10 }, (_, i) => {
            const [x0, y0] = polar(cx, cy, 44, (i + 1) * 6);
            const [x1, y1] = polar(cx, cy, R - 24, (i + 1) * 6);
            return <line key={`fz${i}`} x1={r(x0)} y1={r(y0)} x2={r(x1)} y2={r(y1)} />;
          })}
        </g>
        <path d={`M${cx - 4} ${cy}L${cx} ${cy - 84}L${cx + 4} ${cy}Z`} className="f-ink" />
        <path d={`M${cx - 2.6} ${cy}L${cx} ${cy - 122}L${cx + 2.6} ${cy}Z`} className="f-ink" />
        <line x1={cx} y1={cy + 24} x2={cx} y2={cy - 140} className="s-ink" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r={6} className="f-ink" />
        {!thumb && (
          <>
            <Label x={cx} y={cy - R - 18} size={8} anchor="middle">
              12:00:00
            </Label>
            <Label x={316} y={178} size={8} anchor="middle">
              +11 S
            </Label>
            <Label x={cx} y={H - 22} size={7.5} anchor="middle" className="t-art t-mut">
              LAMM · 03 VI 2029 · ALL CLOCKS
            </Label>
          </>
        )}
      </>
    );
  }

  // Variant 0 — the backwards wristwatch.
  const cx = 200;
  const cy = 240;
  const R = 146;
  const hand = (angle: number, length: number, width: number) => {
    const [x, y] = polar(cx, cy, length, angle);
    const [lx, ly] = polar(cx, cy, width, angle - 90);
    const [rx, ry] = polar(cx, cy, width, angle + 90);
    const [bx, by] = polar(cx, cy, 14, angle + 180);
    return `M${r(lx)} ${r(ly)}L${r(x)} ${r(y)}L${r(rx)} ${r(ry)}L${r(bx)} ${r(by)}Z`;
  };
  const arrowEnd = polar(cx, cy, R - 74, 248);
  return (
    <>
      <path d="M150 30H250L240 96H160Z" className="s-ink" strokeWidth="1" />
      <path d="M160 384H240L250 470H150Z" className="s-ink" strokeWidth="1" />
      <g className="s-mut" strokeWidth="0.5">
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`st${i}`} x1={154 + i * 18} y1={40} x2={154 + i * 18} y2={88} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={R + 16} className="s-ink f-sheet" strokeWidth="2.2" />
      <circle cx={cx} cy={cy} r={R + 6} className="s-mut" strokeWidth="0.7" />
      <path d={annularSector(cx, cy, R - 58, R - 44, 234, 360)} className="f-acc s-ink" strokeWidth="0.7" />
      <g className="s-ink">
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0;
          const [x0, y0] = polar(cx, cy, major ? R - 16 : R - 8, i * 6);
          const [x1, y1] = polar(cx, cy, R - 2, i * 6);
          return <line key={`m${i}`} x1={r(x0)} y1={r(y0)} x2={r(x1)} y2={r(y1)} strokeWidth={major ? 1.6 : 0.55} />;
        })}
      </g>
      {Array.from({ length: 12 }, (_, k) => {
        const [x, y] = polar(cx, cy, R - 32, k * 30);
        return (
          <Label key={`num${k}`} x={x} y={y + 5} size={thumb ? 14 : 15} anchor="middle" className="t-art t-display">
            {k === 0 ? 12 : 12 - k}
          </Label>
        );
      })}
      <path d={arc(cx, cy, R - 74, 300, 250)} className="s-ink" strokeWidth="1" />
      <path
        d={`M${r(arrowEnd[0] + 6)} ${r(arrowEnd[1] - 5)}L${r(arrowEnd[0])} ${r(arrowEnd[1])}L${r(arrowEnd[0] + 7)} ${r(arrowEnd[1] + 4)}`}
        className="s-ink"
        strokeWidth="1"
      />
      <rect x={262} y={231} width={28} height={17} className="s-ink f-bg" strokeWidth="0.8" />
      <Label x={276} y={243} size={9} anchor="middle">
        04
      </Label>
      <path d={hand(300, 76, 5)} className="f-ink" />
      <path d={hand(216, 112, 3.5)} className="f-ink" />
      <line x1={r(polar(cx, cy, 30, 220)[0])} y1={r(polar(cx, cy, 30, 220)[1])} x2={r(polar(cx, cy, 128, 40)[0])} y2={r(polar(cx, cy, 128, 40)[1])} className="s-acc" strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r={6} className="f-ink" />
      <circle cx={cx} cy={cy} r={2} className="f-bg" />
      {!thumb && (
        <Label x={cx} y={cy + 62} size={7.5} anchor="middle" className="t-art t-mut">
          ZERO · 04 V 2071 · 04:12
        </Label>
      )}
    </>
  );
}

function trace(x0: number, x1: number, step: number, fn: (x: number) => number): Pt[] {
  const points: Pt[] = [];
  for (let x = x0; x <= x1 + 0.01; x += step) points.push([x, fn(x)]);
  return points;
}

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];

/**
 * Signal traces. Variant 0: concert envelope · 1: prime-interval melody · 2: dial tone ·
 * 3: sleep trace · 4: early and late carrier.
 */
export function waveform({ seed, variant, detail }: Ctx) {
  const thumb = detail === "thumb";
  const step = thumb ? 5 : 2.5;
  const noise = valueNoise2D(seed);
  const x0 = 30;
  const x1 = 370;

  if (variant === 0) {
    const axis = 250;
    const amp = (x: number) => {
      const t = (x - x0) / (x1 - x0);
      const n = fbm(noise, t * 18, 0.4, 3);
      if (t < 0.44) return 40 + n * 90 * Math.min(1, t * 8);
      if (t < 0.52) return 5;
      if (t < 0.8) return 50 + n * 100;
      return 3;
    };
    const main = trace(x0, 302, step, (x) => axis - amp(x));
    const mainBottom = trace(x0, 302, step, (x) => axis + amp(x)).reverse();
    const encoreAmp = (x: number) => 20 + Math.sin((x - 310) / 6) * 6;
    const encoreTop = trace(310, 352, step, (x) => axis - encoreAmp(x));
    const encoreBottom = trace(310, 352, step, (x) => axis + encoreAmp(x)).reverse();
    const marks = [
      { x: x0, label: "I" },
      { x: 180, label: "INTERVAL" },
      { x: 207, label: "II" },
      { x: 310, label: "ENCORE" },
    ];
    return (
      <>
        <path d={path([...main, ...mainBottom], true)} className="f-ink" opacity="0.88" />
        <path d={path([...encoreTop, ...encoreBottom], true)} className="f-acc s-ink" strokeWidth="0.8" />
        <line x1={x0 - 10} y1={axis} x2={x1 + 10} y2={axis} className="s-bg" strokeWidth="0.8" />
        <line x1={x0 - 10} y1={axis} x2={x0} y2={axis} className="s-ink" strokeWidth="0.8" />
        <g className="s-ink" strokeWidth="0.6" strokeDasharray="2 3">
          {marks.slice(1).map((m) => (
            <line key={`mk${m.x}`} x1={m.x} y1={110} x2={m.x} y2={390} />
          ))}
        </g>
        {!thumb && (
          <>
            {marks.map((m) => (
              <Label key={`ml${m.x}`} x={m.x + 3} y={104} size={7.5}>
                {m.label}
              </Label>
            ))}
            <g className="s-ink" strokeWidth="0.6">
              {Array.from({ length: 18 }, (_, i) => (
                <line key={`tk${i}`} x1={x0 + i * 20} y1={404} x2={x0 + i * 20} y2={i % 3 ? 408 : 412} />
              ))}
            </g>
            {["19:30", "20:15", "21:00", "21:40", "22:05"].map((time, i) => (
              <Label key={time} x={x0 + i * 80} y={426} size={7} className="t-art t-mut">
                {time}
              </Label>
            ))}
            <Label x={20} y={36} size={8}>
              OSTRA HALL · 09 IX 2061
            </Label>
          </>
        )}
      </>
    );
  }

  const stacked = (count: number, top: number, gap: number, fn: (x: number, k: number, y: number) => number) =>
    Array.from({ length: count }, (_, k) => {
      const y = top + k * gap;
      return { k, y, d: path(trace(x0, x1, step, (x) => fn(x, k, y))) };
    });

  if (variant === 1) {
    const noteX = (p: number) => x0 + (p / 32) * (x1 - x0);
    const traces = stacked(8, 90, 44, (x, k, y) => {
      let offset = 0;
      for (const p of PRIMES) {
        if ((p + k) % 3 === 0 || p === 7) {
          const dx = (x - noteX(p)) / 5.5;
          offset += Math.exp(-dx * dx) * 14 * Math.sin(x * 1.3 + k);
        }
      }
      return y - offset + (noise(x / 9, k) - 0.5) * 2;
    });
    return (
      <>
        <g className="s-mut" strokeWidth="0.5" strokeDasharray="1.5 3">
          {PRIMES.map((p) => (
            <line key={`pr${p}`} x1={r(noteX(p))} y1={64} x2={r(noteX(p))} y2={430} />
          ))}
        </g>
        {traces.map((t) => (
          <path key={`tr${t.k}`} d={t.d} className={t.k === 3 ? "s-acc" : "s-ink"} strokeWidth={t.k === 3 ? 1.5 : 0.8} />
        ))}
        {!thumb && (
          <>
            {PRIMES.map((p) => (
              <Label key={`pl${p}`} x={noteX(p)} y={56} size={7} anchor="middle" className="t-art t-mut">
                {p}
              </Label>
            ))}
            <Label x={20} y={466} size={7.5}>
              43 S · REPEATS EVERY 4 H
            </Label>
          </>
        )}
      </>
    );
  }

  if (variant === 2) {
    const traces = stacked(7, 100, 50, (x, k, y) => {
      const burst = k === 3 && x > 170 && x < 232 ? 18 * (0.5 + noise(x / 4, 2)) : 0;
      return y + Math.sin(x * (0.18 + k * 0.004) + k) * (7 + burst);
    });
    return (
      <>
        <g className="s-mut" strokeWidth="0.4">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`gv${i}`} x1={x0 + i * 42.5} y1={70} x2={x0 + i * 42.5} y2={430} />
          ))}
        </g>
        {traces.map((t) => (
          <path key={`dt${t.k}`} d={t.d} className={t.k === 3 ? "s-acc" : "s-ink"} strokeWidth={t.k === 3 ? 1.5 : 0.8} />
        ))}
        {!thumb && (
          <>
            <Label x={20} y={50} size={8}>
              425.5 HZ · LINE: NONE
            </Label>
            <Label x={W - 20} y={466} size={7.5} anchor="end" className="t-art t-mut">
              “NOT YET” · 0.8 S
            </Label>
          </>
        )}
      </>
    );
  }

  if (variant === 3) {
    const flatFrom = x0 + (x1 - x0) * 0.58;
    const flatTo = x0 + (x1 - x0) * 0.66;
    const sleep = (x: number, y: number, scale: number, row: number) => {
      if (x > flatFrom && x < flatTo) return y + (noise(x / 3, row) - 0.5) * 2;
      const n = fbm(noise, x / 14, row * 2.3, 4) - 0.5;
      const burst = Math.sin(x / 2.1) * (noise(x / 30, row + 9) > 0.6 ? 0.6 : 0.15);
      return y + (n + burst) * scale;
    };
    return (
      <>
        <rect x={flatFrom} y={84} width={flatTo - flatFrom} height={332} className="f-acc" opacity="0.18" />
        <line x1={flatFrom} y1={84} x2={flatFrom} y2={416} className="s-acc" strokeWidth="0.8" />
        <line x1={flatTo} y1={84} x2={flatTo} y2={416} className="s-acc" strokeWidth="0.8" />
        <path d={path(trace(x0, x1, step, (x) => sleep(x, 130, 50, 1)))} className="s-mut" strokeWidth="0.7" />
        <path d={path(trace(x0, x1, step, (x) => sleep(x, 250, 150, 2)))} className="s-ink" strokeWidth="1" />
        <path d={path(trace(x0, x1, step, (x) => sleep(x, 370, 50, 3)))} className="s-mut" strokeWidth="0.7" />
        {!thumb &&
          ["23:00", "01:00", "03:12", "05:00", "07:00"].map((time, i) => (
            <Label key={time} x={x0 + i * 85} y={448} size={7} className={time === "03:12" ? "t-art" : "t-art t-mut"}>
              {time}
            </Label>
          ))}
        {!thumb && (
          <Label x={20} y={50} size={8}>
            NIGHT 38 / 41 · REEL 7
          </Label>
        )}
      </>
    );
  }

  // Variant 4 — the returning carrier: identical traces, the early one 87 seconds ahead.
  const offset = 52;
  const carrier = (t: number) => {
    if (t < 0.48) return Math.sin(t * 160) * 14;
    if (t < 0.56) return 0;
    if (t < 0.74) return Math.sin(t * 600) > 0.2 ? 12 : -2;
    return Math.sin(t * 160) * 14;
  };
  const early = trace(x0, x1, step, (x) => 168 - carrier((x - x0 + offset) / (x1 - x0)));
  const late = trace(x0, x1, step, (x) => 330 - carrier((x - x0) / (x1 - x0)));
  const silenceLate = x0 + (x1 - x0) * 0.48;
  const silenceEarly = silenceLate - offset;
  return (
    <>
      <line x1={x0} y1={168} x2={x1} y2={168} className="s-mut" strokeWidth="0.4" />
      <line x1={x0} y1={330} x2={x1} y2={330} className="s-mut" strokeWidth="0.4" />
      <path d={path(early)} className="s-acc" strokeWidth="1.4" />
      <path d={path(late)} className="s-ink" strokeWidth="1" />
      <g className="s-ink" strokeWidth="0.6" strokeDasharray="2 3">
        <line x1={r(silenceEarly)} y1={130} x2={r(silenceEarly)} y2={262} />
        <line x1={r(silenceLate)} y1={238} x2={r(silenceLate)} y2={366} />
      </g>
      <g className="s-ink" strokeWidth="0.8">
        <line x1={r(silenceEarly)} y1={250} x2={r(silenceLate)} y2={250} />
        <line x1={r(silenceEarly)} y1={245} x2={r(silenceEarly)} y2={255} />
        <line x1={r(silenceLate)} y1={245} x2={r(silenceLate)} y2={255} />
      </g>
      <Label x={(silenceEarly + silenceLate) / 2} y={243} size={thumb ? 11 : 9} anchor="middle">
        87 S
      </Label>
      {!thumb && (
        <>
          <Label x={x0} y={118} size={8}>
            RX 20:58:33 · EARLY COPY
          </Label>
          <Label x={x0} y={384} size={8} className="t-art t-mut">
            TX 21:00:00 · ARCHIVE STATION
          </Label>
          <Label x={W - 20} y={466} size={7.5} anchor="end" className="t-art t-mut">
            SIGNAL 7-Ø
          </Label>
        </>
      )}
    </>
  );
}
