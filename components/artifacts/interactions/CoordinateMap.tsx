"use client";

import { useState } from "react";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtFrame } from "@/components/art/ArtFrame";
import { cn } from "@/lib/site";
import type { CoordinateMapInteraction, Visualization } from "@/types";

/** A chart with selectable fictional coordinates. Each point carries its own reading. */
export function CoordinateMap({ interaction, base }: { interaction: CoordinateMapInteraction; base: Visualization }) {
  const [selectedId, setSelectedId] = useState(interaction.points[0].id);
  const selectedIndex = interaction.points.findIndex((p) => p.id === selectedId);
  const selected = interaction.points[selectedIndex];
  const route = interaction.points.map((p) => `${p.x},${p.y * 1.25}`).join(" ");

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-6">
        <ArtFrame topLeft={interaction.label} topRight={`${interaction.points.length} positions`}>
          <div className="relative">
            <ArtifactArt visualization={base} decorative />
            <svg viewBox="0 0 100 125" className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
              <polyline points={route} fill="none" stroke="#151515" strokeWidth="0.35" strokeDasharray="1.2 1.2" />
            </svg>
            {interaction.points.map((point, index) => {
              const active = point.id === selectedId;
              return (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setSelectedId(point.id)}
                  aria-pressed={active}
                  aria-label={`${index + 1}. ${point.label}, ${point.coordinates}`}
                  className="group absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  <span
                    className={cn(
                      "grid place-items-center border border-ink font-mono text-[0.6rem] transition-all",
                      active ? "size-7 bg-lime text-ink" : "size-5 bg-paper text-ink group-hover:bg-lime",
                    )}
                  >
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </ArtFrame>
      </div>

      <div className="lg:col-span-5 lg:col-start-8">
        <div aria-live="polite" className="min-h-[13rem]">
          <p className="label text-lime">
            Position {String(selectedIndex + 1).padStart(2, "0")} · {selected.coordinates}
          </p>
          <h3 className="display-tight mt-3 text-[clamp(2rem,4vw,3.25rem)]">{selected.label}</h3>
          <p className="serif mt-5 text-2xl leading-snug">{selected.reading}</p>
        </div>
        <h4 className="label mt-10 border-b border-paper/20 pb-2 text-gray">Coordinate index</h4>
        <ol>
          {interaction.points.map((point, index) => (
            <li key={point.id}>
              <button
                type="button"
                onClick={() => setSelectedId(point.id)}
                aria-pressed={point.id === selectedId}
                className={cn(
                  "flex min-h-11 w-full items-baseline gap-4 border-b border-paper/10 py-2.5 text-left transition-colors hover:text-lime",
                  point.id === selectedId && "text-lime",
                )}
              >
                <span className="label w-6 tnum">{String(index + 1).padStart(2, "0")}</span>
                <span className="flex-1">{point.label}</span>
                <span className="label text-gray">{point.coordinates}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
