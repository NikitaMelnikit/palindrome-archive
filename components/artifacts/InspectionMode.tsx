"use client";

import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { ArtifactArt, type ArtMode } from "@/components/art/ArtifactArt";
import { SegmentedControl } from "@/components/interactions/SegmentedControl";
import { cn } from "@/lib/site";
import type { Annotation, Visualization } from "@/types";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface Pan {
  x: number;
  y: number;
}

/**
 * Keep the zoomed plate covering the stage. Pan is measured in percent of the stage; the plate is
 * scaled about its centre, so it overhangs each edge by (zoom − 1) × 50%.
 */
function clampPan(pan: Pan, zoom: number): Pan {
  const limit = (zoom - 1) * 50;
  return { x: clamp(pan.x, -limit, limit), y: clamp(pan.y, -limit, limit) };
}

/**
 * Enhanced inspection: a full-screen viewer with zoom, pan (drag, keys or buttons), alternative
 * visualisation modes and annotations that can be focused one by one. Esc or the close button exits.
 */
export function InspectionMode({
  id,
  title,
  visualization,
  annotations,
  children,
}: {
  id: string;
  title: string;
  visualization: Visualization;
  annotations: Annotation[];
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; pan: Pan; width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [mode, setMode] = useState<ArtMode>("plate");
  const [showNotes, setShowNotes] = useState(true);
  const [active, setActive] = useState<number | null>(null);

  const open = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActive(null);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const zoomTo = (next: number, focus?: Pan) => {
    const z = clamp(Math.round(next * 4) / 4, MIN_ZOOM, MAX_ZOOM);
    setZoom(z);
    setPan((current) => clampPan(focus ?? current, z));
  };

  const focusAnnotation = (index: number) => {
    const note = annotations[index];
    setActive(index);
    setShowNotes(true);
    const z = 2.5;
    zoomTo(z, { x: -(note.x - 50) * z, y: -(note.y - 50) * z });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = 8;
    const moves: Record<string, Pan> = {
      ArrowLeft: { x: step, y: 0 },
      ArrowRight: { x: -step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    };
    if (event.key === "+" || event.key === "=") zoomTo(zoom + 0.5);
    else if (event.key === "-" || event.key === "_") zoomTo(zoom - 0.5);
    else if (event.key === "0") zoomTo(1, { x: 0, y: 0 });
    else if (moves[event.key] && zoom > 1) setPan((p) => clampPan({ x: p.x + moves[event.key].x, y: p.y + moves[event.key].y }, zoom));
    else return;
    event.preventDefault();
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1 || (event.target as Element).closest("button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = { startX: event.clientX, startY: event.clientY, pan, width: rect.width, height: rect.height };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = ((event.clientX - drag.startX) / drag.width) * 100;
    const dy = ((event.clientY - drag.startY) / drag.height) * 100;
    setPan(clampPan({ x: drag.pan.x + dx, y: drag.pan.y + dy }, zoom));
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        className="group relative block w-full cursor-zoom-in text-left"
        aria-haspopup="dialog"
        data-cursor="Inspect"
      >
        {children}
        <span className="label absolute right-3 bottom-3 flex items-center gap-2 bg-ink px-2.5 py-1.5 text-paper transition-colors group-hover:bg-lime group-hover:text-ink">
          <Maximize2 className="size-3.5" aria-hidden="true" /> Inspect
          <span className="sr-only"> artwork: {visualization.alt}</span>
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="inspect-dialog on-dark"
        aria-labelledby={`inspect-${id}`}
        onClose={() => triggerRef.current?.focus()}
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-paper/15 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="label text-gray">Inspection mode · {id}</p>
              <h2 id={`inspect-${id}`} className="truncate font-display text-lg font-medium tracking-tight">
                {title}
              </h2>
            </div>
            <button type="button" onClick={close} className="btn shrink-0" autoFocus>
              <X className="size-4" aria-hidden="true" /> Close <span className="hidden text-gray sm:inline">Esc</span>
            </button>
          </div>

          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_22rem] lg:overflow-hidden">
            <div className="flex min-h-0 flex-col gap-3 p-4 sm:p-6">
              <div
                role="group"
                tabIndex={0}
                aria-label={`${visualization.alt} Zoom ${Math.round(zoom * 100)} percent. Use plus and minus to zoom, arrow keys to pan, 0 to reset.`}
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onWheel={(event) => {
                  if (Math.abs(event.deltaY) >= 4) zoomTo(zoom - Math.sign(event.deltaY) * 0.25);
                }}
                className={cn(
                  "relative mx-auto aspect-[4/5] max-h-[min(70dvh,52rem)] w-full max-w-[42rem] touch-none overflow-hidden border border-paper/20 select-none",
                  zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in",
                )}
                onDoubleClick={() => zoomTo(zoom >= 2.5 ? 1 : zoom + 1)}
              >
                <div
                  className="absolute inset-0 transition-transform duration-300 ease-[var(--ease-archive)]"
                  style={{ transform: `translate(${pan.x}%, ${pan.y}%) scale(${zoom})` }}
                >
                  <ArtifactArt visualization={visualization} mode={mode} decorative className="size-full" />
                  {showNotes &&
                    annotations.map((note, index) => (
                      <button
                        key={note.label}
                        type="button"
                        onClick={() => focusAnnotation(index)}
                        className={cn(
                          "label absolute grid size-8 place-items-center border transition-colors",
                          active === index ? "border-ink bg-lime text-ink" : "border-paper bg-ink/85 text-paper hover:bg-lime hover:text-ink",
                        )}
                        style={{
                          left: `${note.x}%`,
                          top: `${note.y}%`,
                          transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                        }}
                        aria-label={`Annotation ${note.label}: ${note.note}`}
                        aria-pressed={active === index}
                      >
                        {note.label}
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2" role="toolbar" aria-label="Zoom">
                <button type="button" className="btn px-3" onClick={() => zoomTo(zoom - 0.5)} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out">
                  <Minus className="size-4" aria-hidden="true" />
                </button>
                <span className="label w-16 text-center tnum" aria-live="polite">
                  {Math.round(zoom * 100)}%
                </span>
                <button type="button" className="btn px-3" onClick={() => zoomTo(zoom + 0.5)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
                  <Plus className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn px-3"
                  onClick={() => {
                    zoomTo(1, { x: 0, y: 0 });
                    setActive(null);
                  }}
                  aria-label="Reset view"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <aside className="border-t border-paper/15 p-4 sm:p-6 lg:overflow-y-auto lg:border-t-0 lg:border-l">
              <h3 className="label text-gray">Visualisation</h3>
              <SegmentedControl<ArtMode>
                className="mt-3"
                label="Visualisation mode"
                value={mode}
                onChange={setMode}
                options={[
                  { value: "plate", label: "Plate" },
                  { value: "negative", label: "Negative" },
                  { value: "spectral", label: "Spectral" },
                ]}
              />
              <p className="mt-3 text-sm leading-relaxed text-paper/70">
                {mode === "plate"
                  ? "As accessioned: the archive’s standard plate."
                  : mode === "negative"
                    ? "Tones inverted, as the record would appear on the original negative."
                    : "A false-colour rendering used by the corroboration desk to separate structure from noise."}
              </p>

              <div className="mt-8 flex items-center justify-between gap-4 border-b border-paper/15 pb-3">
                <h3 className="label text-gray">Annotations · {annotations.length}</h3>
                <button type="button" className="chip" aria-pressed={showNotes} onClick={() => setShowNotes((v) => !v)}>
                  {showNotes ? "Shown" : "Hidden"}
                </button>
              </div>
              <ol className="mt-2">
                {annotations.map((note, index) => (
                  <li key={note.label}>
                    <button
                      type="button"
                      onClick={() => focusAnnotation(index)}
                      className={cn(
                        "flex w-full gap-4 border-b border-paper/10 py-3 text-left transition-colors hover:text-lime",
                        active === index && "text-lime",
                      )}
                      aria-current={active === index ? "true" : undefined}
                    >
                      <span className="label w-6 shrink-0 pt-0.5">{note.label}</span>
                      <span className="text-sm leading-relaxed">{note.note}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="label mt-6 text-gray">Drag to pan · double-click to zoom · keys + − 0 and arrows</p>
            </aside>
          </div>
        </div>
      </dialog>
    </>
  );
}
