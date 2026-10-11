import type { Metadata } from "next";
import { TONE_STROKE } from "@/components/timeline/layout";
import { TimelineExplorer } from "@/components/timeline/TimelineExplorer";
import { getArtifactById, getTimelineBranches, getTimelineEvent, getTimelineEvents } from "@/lib/archive";
import { pad } from "@/lib/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { event: eventParam } = await searchParams;
  const event = typeof eventParam === "string" ? getTimelineEvent(eventParam) : undefined;
  return {
    title: event ? `${event.year}: ${event.title} — Timelines` : "Timelines",
    description:
      "An interactive explorer of the archive’s branching history: the consensus line and three branches — The Quiet Century, The Long Signal and The Unbuilt World.",
    alternates: { canonical: "/timelines" },
  };
}

export default async function TimelinesPage({ searchParams }: { searchParams: SearchParams }) {
  await searchParams;
  const branches = getTimelineBranches();
  const events = getTimelineEvents();
  const artifacts = Object.fromEntries(
    [...new Set(events.flatMap((e) => e.artifactIds))].map((id) => {
      const a = getArtifactById(id)!;
      return [id, { id: a.id, slug: a.slug, title: a.title, visualization: a.visualization }];
    }),
  );

  return (
    <>
      <header className="shell overflow-hidden pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="label flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-3 text-mute">
          <span className="text-ink">Index 02 / Timelines</span>
          <span className="tnum">
            {pad(events.length)} events · {pad(branches.length - 1)} branches · 1 consensus
          </span>
        </div>
        <div className="mt-8 grid items-end gap-8 lg:grid-cols-12">
          <h1 className="display text-[clamp(4rem,14vw,14rem)] leading-[0.78] lg:col-span-8">Timelines</h1>
          <div className="lg:col-span-4 lg:pb-2">
            <p className="serif text-xl leading-snug">
              History, as this archive keeps it, is not a line but a set of decisions. Each one leaves a fork, and each
              fork leaves evidence.
            </p>
          </div>
        </div>
        <ul className="mt-12 grid gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {branches.map((branch) => (
            <li key={branch.id} className="bg-paper p-5">
              <p className="flex items-center justify-between">
                <span className="font-display text-4xl leading-none">{branch.sigil}</span>
                <span className="label text-mute">{branch.forkYear ? `Forks ${branch.forkYear}` : "Trunk"}</span>
              </p>
              <p className="mt-3 flex items-center gap-2 font-display text-lg font-medium tracking-tight">
                <span
                  aria-hidden="true"
                  className="size-2.5 border border-ink"
                  style={{ background: branch.tone === "ink" ? "var(--color-paper)" : TONE_STROKE[branch.tone] }}
                />
                {branch.name}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{branch.description}</p>
            </li>
          ))}
        </ul>
      </header>
      <TimelineExplorer branches={branches} events={events} artifacts={artifacts} />
    </>
  );
}
