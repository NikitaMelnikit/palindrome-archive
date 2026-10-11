"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtFrame } from "@/components/art/ArtFrame";
import { SegmentedControl } from "@/components/interactions/SegmentedControl";
import type { ViewModeInteraction, Visualization } from "@/types";

/** Switch how the object is observed; the drawing and the record's account change together. */
export function ViewModeSwitch({
  interaction,
  visualization,
}: {
  interaction: ViewModeInteraction;
  visualization: Visualization;
}) {
  const initial =
    interaction.modes.find(
      (mode) =>
        (mode.visualization.kind ?? visualization.kind) === visualization.kind &&
        (mode.visualization.variant ?? 0) === (visualization.variant ?? 0),
    )?.id ?? interaction.modes[0].id;
  const [modeId, setModeId] = useState(initial);
  const mode = interaction.modes.find((entry) => entry.id === modeId) ?? interaction.modes[0];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-6">
        <ArtFrame topLeft={interaction.label} topRight={mode.label}>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <m.div
                key={mode.id}
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                <ArtifactArt visualization={visualization} override={mode.visualization} />
              </m.div>
            </AnimatePresence>
          </div>
        </ArtFrame>
      </div>
      <div className="flex flex-col lg:col-span-5 lg:col-start-8">
        <SegmentedControl
          label={interaction.label}
          value={modeId}
          onChange={setModeId}
          options={interaction.modes.map((entry) => ({ value: entry.id, label: entry.label }))}
        />
        <div aria-live="polite" className="mt-10">
          <p className="label text-lime">Viewing mode · {mode.label}</p>
          <p className="serif mt-4 text-2xl leading-snug">{mode.description}</p>
        </div>
      </div>
    </div>
  );
}
