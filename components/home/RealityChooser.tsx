"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtFrame } from "@/components/art/ArtFrame";
import { rovingIndex } from "@/components/interactions/roving";
import { TONE_STROKE } from "@/components/timeline/layout";
import { Greek } from "@/components/ui/Greek";
import { cn } from "@/lib/site";
import type { ArtifactSummary, TimelineBranch, TimelineEvent, Visualization } from "@/types";

export interface RealityVersion {
  branch: TimelineBranch;
  event: TimelineEvent;
  /** Pens left on the signing table in this branch's version of the photograph. */
  pensRemaining: number;
  consequences: TimelineEvent[];
  artifacts: Pick<ArtifactSummary, "id" | "slug" | "title">[];
}

/**
 * "Choose a different reality": the same anchor event (the Esker Accord) as it happens, or fails to,
 * in each branch. Selecting a reality changes the record, the photograph and the surviving evidence.
 */
export function RealityChooser({ versions, visualization }: { versions: RealityVersion[]; visualization: Visualization }) {
  const [selected, setSelected] = useState(1);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const version = versions[selected];

  return (
    <section aria-labelledby="choose-title" className="border-b border-ink/15 bg-paper-2">
      <div className="shell py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label text-mute">Section 04 / Interactive</p>
            <h2 id="choose-title" className="display reveal mt-5 text-[clamp(2.75rem,8vw,8.5rem)]">
              Choose a different reality
            </h2>
          </div>
          <p className="serif self-end text-xl leading-snug lg:col-span-4 lg:col-start-9">
            The Esker Accord decides who may keep evidence from other branches. It is signed early, signed late, or
            never signed at all. Pick a branch and see what survives.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Reality"
          className="mt-12 grid gap-px border border-ink bg-ink sm:grid-cols-3"
        >
          {versions.map((v, index) => {
            const checked = index === selected;
            return (
              <button
                key={v.branch.id}
                ref={(el) => {
                  refs.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => {
                  const next = rovingIndex(event.key, index, versions.length);
                  if (next === null) return;
                  event.preventDefault();
                  setSelected(next);
                  refs.current[next]?.focus();
                }}
                className={cn(
                  "flex items-center gap-5 p-5 text-left transition-colors md:p-6",
                  checked ? "bg-ink text-paper" : "bg-paper-2 hover:bg-paper",
                )}
              >
                <span
                  className="font-display text-5xl leading-none"
                  style={{ color: checked ? TONE_STROKE[v.branch.tone] : undefined }}
                  aria-hidden="true"
                >
                  {v.branch.sigil}
                </span>
                <span className="min-w-0">
                  <span className="label block text-current/70">
                    Branch <Greek>{v.branch.sigil}</Greek> · {v.event.year}
                  </span>
                  <span className="display-tight mt-1 block text-xl">{v.branch.name}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={version.branch.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.2, 0.7, 0.1, 1] }}
              >
                <ArtFrame
                  topLeft="EV-1771-VE · signing table"
                  topRight={<>Branch <Greek>{version.branch.sigil}</Greek></>}
                  bottomLeft={`Pens on blotter: ${version.pensRemaining} of 3`}
                >
                  <ArtifactArt
                    visualization={visualization}
                    override={{
                      param: version.pensRemaining,
                      alt: `The Esker Accord signing table as photographed in branch ${version.branch.sigil}: ${version.pensRemaining} of 3 pens remain on the blotter.`,
                    }}
                  />
                </ArtFrame>
              </m.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-7 lg:col-start-6" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={version.branch.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="display text-[clamp(4rem,12vw,10rem)] leading-[0.8] tnum">{version.event.year}</p>
                <h3 className="display-tight mt-6 text-[clamp(1.75rem,3.2vw,2.75rem)]">{version.event.title}</h3>
                <p className="serif mt-4 max-w-2xl text-xl leading-snug">{version.event.detail}</p>

                <div className="mt-10 grid gap-8 sm:grid-cols-2">
                  <div>
                    <h4 className="label border-b border-ink pb-2">What follows in this branch</h4>
                    <ol className="mt-3 space-y-3">
                      {version.consequences.map((event) => (
                        <li key={event.id}>
                          <Link href={`/timelines?event=${event.id}`} className="group flex gap-3">
                            <span className="label w-10 shrink-0 pt-0.5 text-mute tnum">{event.year}</span>
                            <span className="text-[0.95rem] leading-snug">
                              <span className="link-u">{event.title}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                      {version.consequences.length === 0 && <li className="text-mute">The record ends here.</li>}
                    </ol>
                  </div>
                  <div>
                    <h4 className="label border-b border-ink pb-2">Evidence that survives</h4>
                    <ul className="mt-3 space-y-3">
                      {version.artifacts.map((artifact) => (
                        <li key={artifact.id}>
                          <Link href={`/archive/${artifact.slug}`} className="group flex gap-3">
                            <span className="label w-[5.5rem] shrink-0 pt-0.5 text-mute tnum">{artifact.id}</span>
                            <span className="text-[0.95rem] leading-snug">
                              <span className="link-u">{artifact.title}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Link href={`/timelines?event=${version.event.id}`} className="btn mt-10">
                  Open branch <Greek>{version.branch.sigil}</Greek> in the timeline <span aria-hidden="true">→</span>
                </Link>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
