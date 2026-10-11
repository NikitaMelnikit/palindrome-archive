import type { Artifact, Visualization } from "@/types";
import { CoordinateMap } from "./interactions/CoordinateMap";
import { LayeredDocument } from "./interactions/LayeredDocument";
import { TimelineSlider } from "./interactions/TimelineSlider";
import { ViewModeSwitch } from "./interactions/ViewModeSwitch";

const INTRO: Record<NonNullable<Artifact["interaction"]>["type"], string> = {
  "timeline-slider": "The record reads differently depending on when it is developed. Move through the years.",
  "layered-document": "The document has more than one layer. Lift them one at a time.",
  "coordinate-map": "The chart carries readings that only make sense in place. Select a position.",
  "view-mode": "What this object is depends on how it is observed. Change the conditions.",
};

/** A dark exhibition section hosting the artifact's special interaction, if it has one. */
export function ArtifactInteractionSection({ artifact }: { artifact: Artifact }) {
  const interaction = artifact.interaction;
  if (!interaction) return null;

  const mapBase: Visualization =
    artifact.visualization.kind === "contour"
      ? artifact.visualization
      : { kind: "contour", seed: artifact.visualization.seed, variant: 1, tone: "light", alt: `Chart for ${artifact.title}` };

  return (
    <section aria-labelledby="interaction-title" className="on-dark">
      <div className="shell py-20 lg:py-28">
        <div className="mb-12 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label text-gray">Special inspection · {artifact.id}</p>
            <h2 id="interaction-title" className="display mt-5 text-[clamp(2.5rem,6vw,5.5rem)]">
              {"label" in interaction ? interaction.label : "Read the layers"}
            </h2>
          </div>
          <p className="serif self-end text-xl leading-snug text-paper/80 lg:col-span-4 lg:col-start-9">
            {INTRO[interaction.type]}
          </p>
        </div>
        {interaction.type === "timeline-slider" && (
          <TimelineSlider interaction={interaction} visualization={artifact.visualization} />
        )}
        {interaction.type === "layered-document" && <LayeredDocument interaction={interaction} />}
        {interaction.type === "coordinate-map" && <CoordinateMap interaction={interaction} base={mapBase} />}
        {interaction.type === "view-mode" && (
          <ViewModeSwitch interaction={interaction} visualization={artifact.visualization} />
        )}
      </div>
    </section>
  );
}
