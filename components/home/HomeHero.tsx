"use client";

import { ArrowRight, ArrowUpRight, Shuffle } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtFrame } from "@/components/art/ArtFrame";
import { ScrambleText } from "@/components/interactions/ScrambleText";
import { LiveClock } from "@/components/layout/LiveClock";
import { Greek } from "@/components/ui/Greek";
import { formatAccession, formatDateArchival, formatDt, formatLambda, formatPsi, pad } from "@/lib/format";
import { replaceSearch, useLocationSearch } from "@/lib/hooks";
import {
  INITIAL_REALITY,
  parseReality,
  perspectiveFor,
  realityPsi,
  serializeReality,
  shiftReality,
  stabilityLabel,
} from "@/lib/reality";
import { cn } from "@/lib/site";
import type { ArtifactSummary, TimelineBranch, TimelineEvent } from "@/types";

export interface HeroArtifact extends ArtifactSummary {
  categoryLabel: string;
  /** Per-branch artwork parameter, for records whose evidence differs between branches. */
  branchParams?: Record<string, number>;
}

interface HomeHeroProps {
  pool: HeroArtifact[];
  branches: TimelineBranch[];
  events: TimelineEvent[];
  categoryCounts: { slug: string; label: string; code: string; count: number }[];
  totalRecords: number;
  lastAccession: { id: string; date: string };
}

export function HomeHero({ pool, branches, events, categoryCounts, totalRecords, lastAccession }: HomeHeroProps) {
  const search = useLocationSearch();
  const slugs = pool.map((a) => a.slug);
  const branchIds = branches.map((b) => b.id);
  const reality = parseReality(search, slugs, branchIds) ?? INITIAL_REALITY;

  const artifact = pool[reality.artifactIndex];
  const branch = branches[reality.branchIndex];
  const psi = realityPsi(artifact.id, branch.id);
  const stability = stabilityLabel(psi);
  const perspective = perspectiveFor(artifact.id, branch, events);
  const realityNumber = pad(reality.shift + 1, 3);

  const shift = () => {
    const next = shiftReality(reality, pool.length, branches.length);
    replaceSearch(serializeReality(pool[next.artifactIndex].slug, branches[next.branchIndex].id, next.shift));
  };

  const perspectiveText =
    perspective.kind === "recorded"
      ? `Recorded in branch ${branch.sigil}, ${perspective.event.year}: ${perspective.event.title}.`
      : perspective.kind === "inherited"
        ? `Inherited by branch ${branch.sigil} from the consensus line, ${perspective.event.year}: ${perspective.event.title}.`
        : `Unrecorded in branch ${branch.sigil}. In ${branch.name}, this artifact was never found.`;

  return (
    <section aria-labelledby="hero-title" className="relative border-b border-ink/15">
      <div className="shell">
        <div className="label flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-ink/15 py-3 text-mute">
          <span className="text-ink">Palindrome Institute / Archive 001</span>
          <span className="flex items-center gap-2" title="Archive status for the current reality">
            <span className="status-dot" data-tone={stability.tone} aria-hidden="true" />
            Status: {stability.label} · <Greek>ψ</Greek> {formatPsi(psi)}
          </span>
          <span className="flex items-center gap-2">
            Local <LiveClock />
          </span>
        </div>

        <div className="grid gap-12 py-10 lg:grid-cols-12 lg:gap-8 lg:py-14">
          <div className="flex min-w-0 flex-col lg:col-span-7">
            <p className="label fade-up text-mute" style={{ ["--i" as string]: 0 }}>
              Fig. 00 — Statement of purpose
            </p>
            <h1 id="hero-title" className="display mt-6 text-[clamp(3rem,8.4vw,9.5rem)]">
              <span className="line-mask">
                <span style={{ ["--i" as string]: 0 }}>The future</span>
              </span>
              <span className="line-mask">
                <span style={{ ["--i" as string]: 1 }}>has already</span>
              </span>
              <span className="line-mask">
                <span style={{ ["--i" as string]: 2 }}>
                  left <span className="hl">evidence.</span>
                </span>
              </span>
            </h1>
            <p
              className="serif fade-up mt-8 max-w-md text-[clamp(1.35rem,2.2vw,1.85rem)] leading-[1.18] italic"
              style={{ ["--i" as string]: 1 }}
            >
              Fragments from realities that haven’t agreed to exist.
            </p>
            <div className="fade-up mt-9 flex flex-wrap gap-3" style={{ ["--i" as string]: 2 }}>
              <Link href="/archive" className="btn btn-solid" data-cursor="Explore">
                Explore the archive <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/timelines" className="btn">
                Follow the timelines
              </Link>
            </div>

            <dl className="fade-up mt-auto grid grid-cols-3 gap-4 pt-12 sm:max-w-lg" style={{ ["--i" as string]: 3 }}>
              {[
                { symbol: "ψ", term: "phase", value: formatPsi(psi), note: "from consensus" },
                { symbol: "λ", term: "drift", value: formatLambda(artifact.coordinates.lambda), note: "record bearing" },
                { symbol: "Δt", term: "offset", value: formatDt(artifact.coordinates.dt), note: "apparent years" },
              ].map((item) => (
                <div key={item.term} className="border-t border-ink pt-2">
                  <dt className="label text-mute">
                    <Greek>{item.symbol}</Greek> {item.term}
                  </dt>
                  <dd className="mt-1 font-display text-2xl tracking-tight tnum">
                    <ScrambleText text={item.value} />
                  </dd>
                  <dd className="label mt-0.5 text-mute">{item.note}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0 lg:col-span-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="label">
                Featured anomaly
                <span className="text-mute"> · Reality {realityNumber}</span>
              </p>
              <button type="button" onClick={shift} className="btn btn-lime" data-cursor="Shift">
                <Shuffle className="size-4" aria-hidden="true" />
                Shift reality
              </button>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={`${artifact.id}:${branch.id}`}
                  initial={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
                  animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
                  exit={{ opacity: 0, transition: { duration: 0.16 } }}
                  transition={{ duration: 0.6, ease: [0.2, 0.7, 0.1, 1] }}
                >
                  <ArtFrame
                    topLeft={`Fig. ${pad(artifact.accession)} · ${artifact.categoryLabel}`}
                    topRight={<ScrambleText text={artifact.id} />}
                    bottomLeft={
                      <>
                        Branch <Greek>{branch.sigil}</Greek> · {branch.name}
                      </>
                    }
                    bottomRight={artifact.apparentDate}
                  >
                    <Link
                      href={`/archive/${artifact.slug}`}
                      className="group block"
                      data-cursor="Inspect"
                    >
                      <span className="sr-only">
                        Open record: {artifact.title}. {artifact.visualization.alt}
                      </span>
                      <ArtifactArt
                        decorative
                        visualization={artifact.visualization}
                        override={
                          artifact.branchParams?.[branch.id] !== undefined
                            ? { param: artifact.branchParams[branch.id] }
                            : undefined
                        }
                        className="transition-[filter] duration-500 group-hover:contrast-[1.08]"
                      />
                    </Link>
                  </ArtFrame>
                </m.div>
              </AnimatePresence>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="min-w-0">
                <p className="label text-mute">
                  Class {artifact.classification} · Accession {formatAccession(artifact.accession)}
                </p>
                <h2 className="display-tight mt-2 text-[clamp(1.75rem,3vw,2.6rem)]">{artifact.title}</h2>
                <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink/80">{perspectiveText}</p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <Link href={`/archive/${artifact.slug}`} className="label link-u flex items-center gap-1.5">
                  Inspect this discovery <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
                {perspective.kind !== "unrecorded" && (
                  <Link href={`/timelines?event=${perspective.event.id}`} className="label link-u flex items-center gap-1.5 text-mute">
                    View in timeline <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
            <p className="sr-only" aria-live="polite">
              {reality.shift > 0
                ? `Reality ${realityNumber}: ${artifact.title}, viewed from branch ${branch.sigil}, ${branch.name}. ${perspectiveText}`
                : ""}
            </p>
          </div>
        </div>

        <div className="border-t border-ink/15">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
            {categoryCounts.map((c, i) => (
              <Link
                key={c.slug}
                href={`/archive?category=${c.slug}`}
                className={cn(
                  "group flex min-h-24 flex-col justify-between gap-3 border-b border-ink/15 p-4 transition-colors hover:bg-ink hover:text-paper lg:border-b-0",
                  "border-r",
                  artifact.category === c.slug && "bg-paper-2",
                )}
              >
                <span className="label flex justify-between text-current/75">
                  <span>{pad(i + 1)}</span>
                  <span>{c.code}</span>
                </span>
                <span className="flex items-end justify-between gap-2">
                  <span className="font-display text-lg leading-tight font-medium tracking-tight">{c.label}</span>
                  <span className="label tnum">{pad(c.count)}</span>
                </span>
              </Link>
            ))}
            <div className="col-span-2 flex min-h-24 flex-col justify-between gap-3 p-4 sm:col-span-3 lg:col-span-1">
              <span className="label text-mute">Index total</span>
              <span>
                <span className="font-display text-3xl font-medium tracking-tight tnum">{formatAccession(totalRecords)}</span>
                <span className="label mt-1 block text-mute">
                  Last accession {formatDateArchival(lastAccession.date)}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-ink/15 py-3" aria-hidden="true">
            <span className="label shrink-0 text-mute">Accession</span>
            <div className="flex h-5 flex-1 items-stretch gap-[3px]">
              {Array.from({ length: totalRecords }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex-1 transition-colors duration-500",
                    i + 1 === artifact.accession ? "bg-lime ring-1 ring-ink" : i % 6 === 5 ? "bg-ink/40" : "bg-ink/15",
                  )}
                />
              ))}
            </div>
            <span className="label shrink-0 tnum">
              {formatAccession(artifact.accession)} / {formatAccession(totalRecords)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
