import type { ReactNode } from "react";
import { r, type Rng } from "@/lib/random";
import { Label, path, type Ctx, type Pt } from "./shared";

interface Sheet {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Greeked lines of text, with optional redaction bars. */
function textLines(rng: Rng, sheet: Sheet, startY: number, count: number, options: { redact?: number; indent?: number } = {}) {
  const lines: { x: number; y: number; w: number; redaction?: { x: number; w: number } }[] = [];
  const left = sheet.x + 24 + (options.indent ?? 0);
  const maxW = sheet.w - 48 - (options.indent ?? 0);
  let y = startY;
  for (let i = 0; i < count; i++) {
    const endOfParagraph = rng() < 0.16;
    const w = maxW * (endOfParagraph ? 0.32 + rng() * 0.3 : 0.78 + rng() * 0.22);
    const line: (typeof lines)[number] = { x: left, y, w };
    if (options.redact && rng() < options.redact) {
      const rx = left + rng() * w * 0.5;
      line.redaction = { x: rx, w: Math.min(w - (rx - left), 34 + rng() * 60) };
    }
    lines.push(line);
    y += endOfParagraph ? 22 : 12.5;
  }
  return lines;
}

function Lines({ lines }: { lines: ReturnType<typeof textLines> }) {
  return (
    <>
      <g className="f-ink" opacity="0.5">
        {lines.map((l, i) => (
          <rect key={`t${i}`} x={r(l.x)} y={r(l.y)} width={r(l.w)} height={3.2} />
        ))}
      </g>
      <g className="f-ink">
        {lines.map((l, i) =>
          l.redaction ? <rect key={`x${i}`} x={r(l.redaction.x)} y={r(l.y - 3)} width={r(l.redaction.w)} height={9} /> : null,
        )}
      </g>
    </>
  );
}

function SheetFrame({ sheet, rotate, children }: { sheet: Sheet; rotate: number; children: ReactNode }) {
  return (
    <>
      <rect
        x={sheet.x + 7}
        y={sheet.y + 9}
        width={sheet.w}
        height={sheet.h}
        className="f-mut"
        opacity="0.28"
        transform={`rotate(${rotate} 200 250)`}
      />
      <g transform={`rotate(${rotate} 200 250)`}>
        <rect x={sheet.x} y={sheet.y} width={sheet.w} height={sheet.h} className="f-sheet s-ink" strokeWidth="0.6" />
        {children}
      </g>
    </>
  );
}

function signature(rng: Rng, x: number, y: number): string {
  const points: Pt[] = [];
  for (let i = 0; i < 14; i++) points.push([x + i * 7 + rng() * 4, y + Math.sin(i * 1.7) * 8 + (rng() - 0.5) * 6]);
  return path(points);
}

/** Documents. Variant 0: letter · 1: minutes · 2: index cards · 3: tide table. */
export function documentArt({ rng, variant, detail }: Ctx) {
  const thumb = detail === "thumb";

  if (variant === 2) {
    const cardW = 108;
    const cardH = 94;
    const gap = 12;
    const left = (400 - (3 * cardW + 2 * gap)) / 2;
    return (
      <>
        {Array.from({ length: 12 }, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = left + col * (cardW + gap);
          const y = 34 + row * (cardH + 14);
          const tilt = r((rng() - 0.5) * 4);
          const highlighted = i === 7;
          return (
            <g key={`card${i}`} transform={`rotate(${tilt} ${x + cardW / 2} ${y + cardH / 2})`}>
              <rect x={x} y={y} width={cardW} height={cardH} className={`${highlighted ? "f-acc" : "f-sheet"} s-ink`} strokeWidth="0.7" />
              <line x1={x + 8} y1={y + 20} x2={x + cardW - 8} y2={y + 20} className="s-mut" strokeWidth="0.6" />
              {!thumb && (
                <Label x={x + 8} y={y + 14} size={6.5}>
                  {`QA ${(70 + i * 3.7).toFixed(1)}`}
                </Label>
              )}
              <g className="f-ink" opacity="0.5">
                <rect x={x + 8} y={y + 30} width={cardW - 22} height={2.6} />
                <rect x={x + 8} y={y + 40} width={cardW - 34 - (i % 3) * 8} height={2.6} />
                <rect x={x + 8} y={y + 50} width={cardW - 50} height={2.6} />
              </g>
              <circle cx={x + cardW / 2} cy={y + cardH - 12} r={4} className="f-bg s-ink" strokeWidth="0.6" />
            </g>
          );
        })}
      </>
    );
  }

  if (variant === 3) {
    const sheet = { x: 52, y: 30, w: 296, h: 436 };
    const chart = { x: sheet.x + 24, y: sheet.y + 62, w: sheet.w - 48, h: 92 };
    const tide: Pt[] = [];
    for (let i = 0; i <= 120; i += thumb ? 3 : 1) {
      const t = i / 120;
      const spring = 0.65 + 0.35 * Math.cos(t * Math.PI * 2);
      tide.push([chart.x + t * chart.w, chart.y + chart.h / 2 - Math.sin(t * Math.PI * 14) * (chart.h / 2 - 8) * spring]);
    }
    const rows = 18;
    return (
      <SheetFrame sheet={sheet} rotate={0.8}>
        <Label x={sheet.x + 24} y={sheet.y + 32} size={13} className="t-art t-display">
          QUELL HARBOUR · 2140
        </Label>
        <Label x={sheet.x + 24} y={sheet.y + 46} size={7} className="t-art t-mut">
          TIDE TABLE · MAY · HEIGHTS IN METRES
        </Label>
        <rect x={chart.x} y={chart.y} width={chart.w} height={chart.h} className="s-ink" strokeWidth="0.7" />
        <g className="s-mut" strokeWidth="0.35">
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`cg${i}`} x1={chart.x + ((i + 1) * chart.w) / 8} y1={chart.y} x2={chart.x + ((i + 1) * chart.w) / 8} y2={chart.y + chart.h} />
          ))}
          <line x1={chart.x} y1={chart.y + chart.h / 2} x2={chart.x + chart.w} y2={chart.y + chart.h / 2} />
        </g>
        <path d={path(tide)} className="s-ink" strokeWidth="1.1" />
        {Array.from({ length: rows }, (_, i) => {
          const y = sheet.y + 186 + i * 13.5;
          const day = String(i + 1).padStart(2, "0");
          const marked = i < 3 && (i * 7 + 3) % 2 === 1;
          return (
            <g key={`row${i}`}>
              {i === 3 && <rect x={sheet.x + 20} y={y - 9} width={sheet.w - 40} height={12} className="f-acc" />}
              {thumb ? (
                <g className="f-ink" opacity="0.5">
                  <rect x={sheet.x + 24} y={y - 5} width={14} height={3} />
                  <rect x={sheet.x + 70} y={y - 5} width={60} height={3} />
                  <rect x={sheet.x + 160} y={y - 5} width={60} height={3} />
                </g>
              ) : (
                <>
                  <Label x={sheet.x + 24} y={y} size={7.5}>
                    {day}
                  </Label>
                  <Label x={sheet.x + 70} y={y} size={7.5} className="t-art t-mut">
                    {`0${(i * 5) % 10}:${String((i * 23 + 12) % 60).padStart(2, "0")}  ${(2.8 + ((i * 37) % 9) / 10).toFixed(1)}`}
                  </Label>
                  <Label x={sheet.x + 160} y={y} size={7.5} className="t-art t-mut">
                    {`1${(i * 3) % 10}:${String((i * 17 + 40) % 60).padStart(2, "0")}  ${(0.4 + ((i * 13) % 6) / 10).toFixed(1)}`}
                  </Label>
                </>
              )}
              {(i < 3 || marked) && (
                <line x1={sheet.x + sheet.w - 46} y1={y - 1} x2={sheet.x + sheet.w - 38} y2={y - 8} className="s-ink" strokeWidth="0.9" />
              )}
            </g>
          );
        })}
      </SheetFrame>
    );
  }

  const sheet = { x: 58, y: 36, w: 284, h: 420 };

  if (variant === 1) {
    const items = [0, 1, 2, 3, 4, 5];
    return (
      <SheetFrame sheet={sheet} rotate={1.1}>
        <Label x={sheet.x + 24} y={sheet.y + 40} size={19} className="t-art t-display">
          MINUTES
        </Label>
        <Label x={sheet.x + 24} y={sheet.y + 56} size={7} className="t-art t-mut">
          COMMITTEE ROOM 4 · 14 XI 2041
        </Label>
        <line x1={sheet.x + 24} y1={sheet.y + 66} x2={sheet.x + sheet.w - 24} y2={sheet.y + 66} className="s-ink" strokeWidth="0.6" />
        {[0, 1, 2].map((k) => {
          const x = sheet.x + 24 + k * 80;
          const y = sheet.y + 84;
          return (
            <g key={`name${k}`}>
              <rect x={x} y={y} width={62} height={3.4} className="f-ink" opacity="0.6" />
              <rect x={x + 2} y={y - 2} width={58} height={3.4} className="f-ink" opacity="0.35" />
              <rect x={x - 1} y={y + 2} width={52} height={3.4} className="f-ink" opacity="0.3" />
              <path d={`M${x} ${y + 1}L${x + 10} ${y - 2}L${x + 20} ${y + 3}L${x + 30} ${y - 2}L${x + 40} ${y + 3}L${x + 50} ${y - 1}L${x + 60} ${y + 2}`} className="s-ink" strokeWidth="0.7" />
            </g>
          );
        })}
        {items.map((k) => {
          const y = sheet.y + 118 + k * 48;
          const lines = textLines(rng, sheet, y, 2, { indent: 44 });
          return (
            <g key={`item${k}`}>
              {thumb ? (
                <rect x={sheet.x + 24} y={y - 3} width={26} height={4} className="f-ink" />
              ) : (
                <Label x={sheet.x + 24} y={y + 3} size={7.5}>
                  {`ITEM ${k * 2 + 1}`}
                </Label>
              )}
              <Lines lines={lines} />
            </g>
          );
        })}
        <g transform={`rotate(-9 ${sheet.x + 210} ${sheet.y + 388})`}>
          <rect x={sheet.x + 160} y={sheet.y + 368} width={104} height={38} className="f-acc s-ink" strokeWidth="1" />
          <rect x={sheet.x + 164} y={sheet.y + 372} width={96} height={30} className="s-ink" strokeWidth="0.5" />
          <Label x={sheet.x + 212} y={sheet.y + 386} size={8} anchor="middle">
            RECEIVED
          </Label>
          <Label x={sheet.x + 212} y={sheet.y + 397} size={7} anchor="middle">
            28 IV 2023
          </Label>
        </g>
      </SheetFrame>
    );
  }

  // Variant 0 — a letter.
  const lines = textLines(rng, sheet, sheet.y + 96, 18, { redact: 0.3 });
  const stamp = { x: sheet.x + 84, y: sheet.y + sheet.h - 66 };
  return (
    <SheetFrame sheet={sheet} rotate={-1.6}>
      <Label x={sheet.x + 24} y={sheet.y + 30} size={6.5} className="t-art t-mut">
        PALINDROME INSTITUTE · ARCHIVE 001
      </Label>
      <Label x={sheet.x + sheet.w - 24} y={sheet.y + 30} size={8.5} anchor="end">
        22 · IX · 2113
      </Label>
      <line x1={sheet.x + 24} y1={sheet.y + 40} x2={sheet.x + sheet.w - 24} y2={sheet.y + 40} className="s-ink" strokeWidth="0.5" />
      {thumb ? (
        <rect x={sheet.x + 24} y={sheet.y + 66} width={86} height={4} className="f-ink" opacity="0.7" />
      ) : (
        <Label x={sheet.x + 24} y={sheet.y + 72} size={12} className="t-art t-serif">
          Dear archivists,
        </Label>
      )}
      <Lines lines={lines} />
      <g transform={`rotate(-14 ${stamp.x} ${stamp.y})`}>
        <circle cx={stamp.x} cy={stamp.y} r={31} className="f-acc s-ink" strokeWidth="1.1" />
        <circle cx={stamp.x} cy={stamp.y} r={24} className="s-ink" strokeWidth="0.6" />
        <Label x={stamp.x} y={stamp.y - 2} size={7} anchor="middle">
          ARCHIVE
        </Label>
        <Label x={stamp.x} y={stamp.y + 9} size={9} anchor="middle" className="t-art t-display">
          001
        </Label>
      </g>
      <path d={signature(rng, stamp.x + 50, stamp.y - 4)} className="s-ink" strokeWidth="1.1" />
    </SheetFrame>
  );
}
