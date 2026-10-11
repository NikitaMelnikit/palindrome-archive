"use client";

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { Greek } from "@/components/ui/Greek";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/site";
import type { ArtifactSummary, TimelineBranch, TimelineEvent } from "@/types";
import { TONE_STROKE, branchSpan, laneFor, rankScale } from "./layout";

const VIEW_W = 1000;
const VIEW_H = 320;
const LANE_Y = [72, 160, 248];
export const DEFAULT_EVENT_ID = "c-2026";

type LinkedArtifact = Pick<ArtifactSummary, "id" | "slug" | "title" | "visualization">;

interface Props {
  branches: TimelineBranch[];
  events: TimelineEvent[];
  artifacts: Record<string, LinkedArtifact>;
}

/** Order used for keyboard movement: each lane left to right; lanes top to bottom. */
function laneEvents(events: TimelineEvent[], lane: number) {
  return events.filter((e) => laneFor(e.branchId) === lane).sort((a, b) => a.year - b.year);
}

export function TimelineExplorer({ branches, events, artifacts }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const branchById = useMemo(() => new Map(branches.map((b) => [b.id, b])), [branches]);
  const requested = searchParams.get("event");
  const selected = events.find((e) => e.id === requested) ?? events.find((e) => e.id === DEFAULT_EVENT_ID) ?? events[0];
  const selectedBranch = branchById.get(selected.branchId)!;

  const [highlight, setHighlight] = useState<string | null>(null);
  const [mobileBranch, setMobileBranch] = useState<string | null>(null);
  const activeMobileBranch = mobileBranch ?? selected.branchId;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const dragRef = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const { xForYear, years } = useMemo(() => rankScale(events, VIEW_W, 36), [events]);
  const lanes = useMemo(() => [0, 1, 2].map((lane) => laneEvents(events, lane)), [events]);

  const select = (event: TimelineEvent, focus = false) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("event", event.id);
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    if (focus) nodeRefs.current.get(event.id)?.focus({ preventScroll: true });
  };

  // Keep the tab title in step with the selected event, matching the server-rendered title.
  useEffect(() => {
    document.title = `${selected.year}: ${selected.title} — Timelines — PALINDROME®`;
  }, [selected.year, selected.title]);

  // Keep the selected node visible inside the horizontal scroller without moving the page.
  // The first positioning (e.g. a deep link) is instant; later selections glide.
  const positionedRef = useRef(false);
  useEffect(() => {
    const scroller = scrollerRef.current;
    const node = nodeRefs.current.get(selected.id);
    if (!scroller || !node) return;
    const target = node.offsetLeft - scroller.clientWidth / 2;
    const smooth = positionedRef.current && !reduced;
    positionedRef.current = true;
    scroller.scrollTo({ left: target, behavior: smooth ? "smooth" : "auto" });
  }, [selected.id, reduced]);

  const onNodeKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: TimelineEvent) => {
    const lane = laneFor(current.branchId);
    const row = lanes[lane];
    const index = row.findIndex((e) => e.id === current.id);
    let next: TimelineEvent | undefined;
    if (event.key === "ArrowRight") next = row[index + 1];
    else if (event.key === "ArrowLeft") next = row[index - 1];
    else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const target = lanes[lane + (event.key === "ArrowUp" ? -1 : 1)];
      if (target?.length) next = [...target].sort((a, b) => Math.abs(a.year - current.year) - Math.abs(b.year - current.year))[0];
    } else if (event.key === "Home") next = [...events].sort((a, b) => a.year - b.year)[0];
    else if (event.key === "End") next = [...events].sort((a, b) => b.year - a.year)[0];
    else return;
    event.preventDefault();
    if (next) select(next, true);
  };

  const scrollBy = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollBy({ left: direction * scroller.clientWidth * 0.6, behavior: reduced ? "auto" : "smooth" });
  };

  // Mouse drag-to-scroll. Touch uses native scrolling; nothing requires precise dragging.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || (event.target as Element).closest("button")) return;
    dragRef.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 3) drag.moved = true;
    event.currentTarget.scrollLeft = drag.left - dx;
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const branchPath = (branch: TimelineBranch) => {
    const { start, end } = branchSpan(branch, events);
    const y = LANE_Y[laneFor(branch.id)];
    const x0 = xForYear(start);
    if (branch.id === "consensus") return `M${xForYear(start)} ${y}H${xForYear(end)}`;
    if (y === LANE_Y[1]) return `M${x0} ${y}H${xForYear(end)}`;
    return `M${x0} ${LANE_Y[1]}C${x0 + 26} ${LANE_Y[1]} ${x0 + 18} ${y} ${x0 + 48} ${y}H${xForYear(end)}`;
  };

  const dimmed = (branchId: string) => highlight !== null && highlight !== branchId;
  const branchOrder = ["consensus", "alpha", "beta", "gamma"].map((id) => branchById.get(id)!).filter(Boolean);

  return (
    <div className="on-dark">
      <div className="shell py-10 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Highlight a branch" className="hidden flex-wrap gap-2 md:flex">
            <button type="button" className="chip" aria-pressed={highlight === null} onClick={() => setHighlight(null)}>
              All branches
            </button>
            {branchOrder.map((branch) => (
              <button
                key={branch.id}
                type="button"
                className="chip"
                aria-pressed={highlight === branch.id}
                onClick={() => setHighlight(highlight === branch.id ? null : branch.id)}
              >
                <span aria-hidden="true" className="size-2" style={{ background: TONE_STROKE[branch.tone] }} />
                <Greek>{branch.sigil}</Greek> · {branch.name}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button type="button" className="btn px-3" onClick={() => scrollBy(-1)} aria-label="Scroll timeline earlier">
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button type="button" className="btn px-3" onClick={() => scrollBy(1)} aria-label="Scroll timeline later">
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Desktop and tablet: the branching chart */}
        <div
          ref={scrollerRef}
          className="relative mt-8 hidden cursor-grab overflow-x-auto overscroll-x-contain border-y border-paper/15 select-none active:cursor-grabbing md:block [scrollbar-color:var(--color-void-3)_transparent]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            role="group"
            aria-label="Timeline events. Use left and right arrows to move along a branch, up and down to change branch."
            className="relative h-[22rem] w-full min-w-[1500px]"
          >
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[20rem] w-full" aria-hidden="true">
              {years.map((year) => (
                <line key={year} x1={xForYear(year)} y1={16} x2={xForYear(year)} y2={VIEW_H - 8} stroke="var(--color-void-3)" vectorEffect="non-scaling-stroke" />
              ))}
              <line
                x1={xForYear(2026)}
                y1={8}
                x2={xForYear(2026)}
                y2={VIEW_H}
                stroke="var(--color-lime)"
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
                opacity="0.6"
              />
              <line
                x1={xForYear(selected.year)}
                y1={8}
                x2={xForYear(selected.year)}
                y2={VIEW_H}
                stroke={TONE_STROKE[selectedBranch.tone]}
                vectorEffect="non-scaling-stroke"
                opacity="0.45"
              />
              {branchOrder.map((branch) => (
                <path
                  key={branch.id}
                  d={branchPath(branch)}
                  fill="none"
                  stroke={TONE_STROKE[branch.tone]}
                  strokeWidth={2}
                  strokeDasharray={branch.id === "alpha" ? "7 5" : undefined}
                  vectorEffect="non-scaling-stroke"
                  opacity={dimmed(branch.id) ? 0.18 : 1}
                  className="transition-opacity duration-300"
                />
              ))}
            </svg>
            <span className="label absolute top-1 text-lime" style={{ left: `calc(${(xForYear(2026) / VIEW_W) * 100}% + 6px)` }}>
              Today
            </span>
            {events.map((event) => {
              const branch = branchById.get(event.branchId)!;
              const isSelected = event.id === selected.id;
              const left = (xForYear(event.year) / VIEW_W) * 100;
              const top = (LANE_Y[laneFor(event.branchId)] / VIEW_H) * 20;
              return (
                <button
                  key={event.id}
                  ref={(el) => {
                    if (el) nodeRefs.current.set(event.id, el);
                    else nodeRefs.current.delete(event.id);
                  }}
                  type="button"
                  tabIndex={isSelected ? 0 : -1}
                  aria-pressed={isSelected}
                  aria-label={`${event.year}, ${branch.name}: ${event.title}`}
                  onClick={() => select(event)}
                  onKeyDown={(e) => onNodeKeyDown(e, event)}
                  className={cn(
                    "group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 p-2 transition-opacity duration-300",
                    dimmed(event.branchId) && "opacity-25",
                  )}
                  style={{ left: `${left}%`, top: `${top}rem` }}
                  data-cursor={String(event.year)}
                >
                  <span
                    className={cn(
                      "block border-2 transition-all duration-300",
                      isSelected ? "size-5 rotate-45" : "size-3.5 group-hover:scale-125",
                    )}
                    style={{
                      borderColor: TONE_STROKE[branch.tone],
                      background: isSelected ? TONE_STROKE[branch.tone] : "var(--color-void)",
                    }}
                  />
                  <span className={cn("label tnum", isSelected ? "text-paper" : "text-gray")}>{event.year}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile: branch tabs and a vertical list, no dragging required */}
        <div className="mt-6 md:hidden">
          <div role="group" aria-label="Show branch" className="grid grid-cols-4 gap-px border border-paper/20 bg-paper/20">
            {branchOrder.map((branch) => {
              const checked = activeMobileBranch === branch.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => setMobileBranch(branch.id)}
                  className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 px-1", checked ? "bg-paper text-ink" : "bg-void")}
                >
                  <span className="font-display text-xl leading-none" style={{ color: checked ? undefined : TONE_STROKE[branch.tone] }}>
                    {branch.sigil}
                  </span>
                  <span className="label text-[0.6rem]">{branch.id === "consensus" ? "Consensus" : branch.name.replace("The ", "")}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-paper/70">{branchById.get(activeMobileBranch)?.description}</p>
          <ol className="mt-4 border-l border-paper/20">
            {events
              .filter((e) => e.branchId === activeMobileBranch)
              .map((event) => {
                const isSelected = event.id === selected.id;
                const branch = branchById.get(event.branchId)!;
                return (
                  <li key={event.id} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute top-5 -left-[5px] size-2.5 border-2"
                      style={{ borderColor: TONE_STROKE[branch.tone], background: isSelected ? TONE_STROKE[branch.tone] : "var(--color-void)" }}
                    />
                    <button
                      type="button"
                      onClick={() => select(event)}
                      aria-expanded={isSelected}
                      aria-controls={isSelected ? "timeline-detail-mobile" : undefined}
                      className="flex min-h-14 w-full items-baseline gap-4 py-3 pl-6 text-left"
                    >
                      <span className={cn("label w-10 shrink-0 tnum", isSelected ? "text-lime" : "text-gray")}>{event.year}</span>
                      <span className={cn("font-display text-lg leading-snug tracking-tight", isSelected && "text-lime")}>{event.title}</span>
                    </button>
                    {isSelected && (
                      <div id="timeline-detail-mobile" className="pb-6 pl-6">
                        <EventDetail event={event} branch={branch} branchById={branchById} events={events} artifacts={artifacts} onSelect={select} compact />
                      </div>
                    )}
                  </li>
                );
              })}
          </ol>
        </div>

        {/* Detail panel (tablet and desktop) */}
        <div className="mt-10 hidden md:block" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={selected.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
              transition={{ duration: 0.4, ease: [0.2, 0.7, 0.1, 1] }}
            >
              <EventDetail event={selected} branch={selectedBranch} branchById={branchById} events={events} artifacts={artifacts} onSelect={select} />
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function EventDetail({
  event,
  branch,
  branchById,
  events,
  artifacts,
  onSelect,
  compact = false,
}: {
  event: TimelineEvent;
  branch: TimelineBranch;
  branchById: Map<string, TimelineBranch>;
  events: TimelineEvent[];
  artifacts: Record<string, LinkedArtifact>;
  onSelect: (event: TimelineEvent, focus?: boolean) => void;
  compact?: boolean;
}) {
  const sameBranch = events.filter((e) => e.branchId === event.branchId).sort((a, b) => a.year - b.year);
  const index = sameBranch.findIndex((e) => e.id === event.id);
  const previous = sameBranch[index - 1];
  const next = sameBranch[index + 1];
  const siblings = event.anchorId ? events.filter((e) => e.anchorId === event.anchorId && e.id !== event.id) : [];
  const linked = event.artifactIds.map((id) => artifacts[id]).filter(Boolean);
  const tone = TONE_STROKE[branch.tone];

  return (
    <div className={cn("grid gap-10", !compact && "lg:grid-cols-12 lg:gap-8")}>
      <div className={cn(!compact && "lg:col-span-7")}>
        <p className="label flex items-center gap-3" style={{ color: tone }}>
          <span aria-hidden="true" className="h-px w-8" style={{ background: tone }} />
          Branch <Greek>{branch.sigil}</Greek> · {branch.name}
        </p>
        {!compact && <p className="display mt-6 text-[clamp(5rem,12vw,11rem)] leading-[0.78] tnum">{event.year}</p>}
        <h2 className={cn("display-tight", compact ? "mt-3 text-2xl" : "mt-6 text-[clamp(2rem,3.6vw,3.25rem)]")}>{event.title}</h2>
        <p className={cn("serif mt-4 italic", compact ? "text-lg" : "text-2xl leading-snug")}>{event.summary}</p>
        <p className={cn("mt-4 leading-relaxed text-paper/80", compact ? "text-[0.95rem]" : "max-w-2xl text-lg")}>{event.detail}</p>

        <div className="mt-6 max-w-sm">
          <p className="label flex justify-between text-gray">
            <span>Archive certainty</span>
            <span className="tnum">{event.certainty.toFixed(2)}</span>
          </p>
          <div className="mt-2 h-1.5 bg-paper/15" aria-hidden="true">
            <div className="h-full" style={{ width: `${event.certainty * 100}%`, background: tone }} />
          </div>
        </div>

        {siblings.length > 0 && (
          <div className="mt-8">
            <p className="label text-gray">The same moment in other branches</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siblings.map((sibling) => {
                const siblingBranch = branchById.get(sibling.branchId)!;
                return (
                  <li key={sibling.id}>
                    <button type="button" className="chip" onClick={() => onSelect(sibling, !compact)}>
                      <span aria-hidden="true" className="size-2" style={{ background: TONE_STROKE[siblingBranch.tone] }} />
                      <Greek>{siblingBranch.sigil}</Greek> · {sibling.year} · {sibling.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          <button type="button" className="btn" disabled={!previous} onClick={() => previous && onSelect(previous, !compact)}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Earlier in <Greek>{branch.sigil}</Greek>
          </button>
          <button type="button" className="btn" disabled={!next} onClick={() => next && onSelect(next, !compact)}>
            Later in <Greek>{branch.sigil}</Greek> <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={cn(!compact && "lg:col-span-4 lg:col-start-9")}>
        <h3 className="label border-b border-paper/20 pb-2 text-gray">Evidence in the archive · {linked.length}</h3>
        <ul className="mt-2">
          {linked.map((artifact) => (
            <li key={artifact.id}>
              <Link href={`/archive/${artifact.slug}`} className="group flex items-center gap-4 border-b border-paper/10 py-3">
                <span className="w-12 shrink-0">
                  <ArtifactArt visualization={artifact.visualization} detail="thumb" decorative />
                </span>
                <span className="min-w-0">
                  <span className="label block text-gray tnum">{artifact.id}</span>
                  <span className="mt-1 block font-display text-lg leading-tight font-medium tracking-tight">
                    <span className="link-u">{artifact.title}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
