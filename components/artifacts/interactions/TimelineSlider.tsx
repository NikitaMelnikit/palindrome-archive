"use client";

import { useId, useState } from "react";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtFrame } from "@/components/art/ArtFrame";
import { cn } from "@/lib/site";
import type { TimelineSliderInteraction, Visualization } from "@/types";

/** Develop the same record in a different year: the artwork and its interpretation change together. */
export function TimelineSlider({
  interaction,
  visualization,
}: {
  interaction: TimelineSliderInteraction;
  visualization: Visualization;
}) {
  const { stops } = interaction;
  const initial = Math.max(
    0,
    stops.findIndex((s) => s.param === visualization.param),
  );
  const [index, setIndex] = useState(initial);
  const stop = stops[index];
  const id = useId();

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-6">
        <ArtFrame topLeft={`Developed ${stop.year}`} topRight={`Stop ${index + 1} / ${stops.length}`}>
          <ArtifactArt
            visualization={visualization}
            override={{ param: stop.param, alt: `${visualization.alt} As read in ${stop.year}.` }}
          />
        </ArtFrame>
      </div>
      <div className="flex flex-col lg:col-span-5 lg:col-start-8">
        <p className="display text-[clamp(4.5rem,11vw,9rem)] leading-[0.8] tnum" aria-hidden="true">
          {stop.year}
        </p>
        <p className="serif mt-8 min-h-[6.5em] text-2xl leading-snug" aria-live="polite">
          <span className="sr-only">{stop.year}. </span>
          {stop.reading}
        </p>
        <div className="mt-auto pt-10">
          <label htmlFor={id} className="label text-gray">
            {interaction.label}
          </label>
          <input
            id={id}
            type="range"
            min={0}
            max={stops.length - 1}
            step={1}
            value={index}
            onChange={(event) => setIndex(Number(event.target.value))}
            aria-valuetext={`${stop.year}`}
            className="range mt-2 text-paper"
          />
          <div className="mt-1 flex justify-between">
            {stops.map((s, i) => (
              <button
                key={s.year}
                type="button"
                onClick={() => setIndex(i)}
                className={cn("label min-h-11 px-1 tnum transition-colors", i === index ? "text-lime" : "text-gray hover:text-paper")}
                aria-label={`Show ${s.year}`}
                aria-pressed={i === index}
              >
                {s.year}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
