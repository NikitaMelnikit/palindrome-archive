import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { formatAccession, formatDate } from "@/lib/format";
import { cn } from "@/lib/site";
import type { ArtifactSummary } from "@/types";

/**
 * A specimen plate for grids. The title link is stretched over the whole card so the card has a
 * single, well-named link rather than a link wrapping every element.
 */
export function ArtifactCard({
  artifact,
  categoryLabel,
  headingLevel: Heading = "h3",
  className,
}: {
  artifact: ArtifactSummary;
  categoryLabel: string;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
}) {
  return (
    <article className={cn("group relative", className)} data-cursor="Open">
      <div className="label flex items-baseline justify-between border-t border-ink pt-2 pb-3">
        <span className="tnum">{artifact.id}</span>
        <span className="text-mute tnum">{formatAccession(artifact.accession)}</span>
      </div>
      <div className="overflow-hidden">
        <ArtifactArt
          visualization={artifact.visualization}
          detail="thumb"
          decorative
          className="transition-transform duration-700 ease-[var(--ease-archive)] group-hover:scale-[1.035]"
        />
      </div>
      <Heading className="display-tight mt-4 text-[1.35rem] sm:text-[1.5rem]">
        <Link
          href={`/archive/${artifact.slug}`}
          className="link-u after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-lime"
        >
          {artifact.title}
        </Link>
      </Heading>
      <p className="mt-2 line-clamp-2 text-[0.9rem] leading-relaxed text-ink/75">{artifact.description}</p>
      <p className="label mt-3 flex items-baseline justify-between gap-3 text-mute">
        <span>
          {categoryLabel} · Class {artifact.classification}
        </span>
        <span className="shrink-0 tnum">{formatDate(artifact.discoveryDate)}</span>
      </p>
    </article>
  );
}

export function ArtifactRow({ artifact, categoryLabel }: { artifact: ArtifactSummary; categoryLabel: string }) {
  return (
    <article className="group relative grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-ink/15 py-3 transition-colors hover:bg-paper-2 md:grid-cols-[3.25rem_8rem_minmax(0,1fr)_10rem_5rem_7.5rem_1.25rem] md:gap-6">
      <div className="w-[3.25rem]">
        <ArtifactArt visualization={artifact.visualization} detail="thumb" decorative />
      </div>
      <span className="label hidden text-mute tnum md:block">{artifact.id}</span>
      <div className="min-w-0">
        <h3 className="font-display text-lg leading-tight font-medium tracking-tight">
          <Link
            href={`/archive/${artifact.slug}`}
            className="link-u after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-lime"
          >
            {artifact.title}
          </Link>
        </h3>
        <p className="label mt-1 text-mute md:hidden">
          {artifact.id} · {categoryLabel}
        </p>
      </div>
      <span className="label hidden md:block">{categoryLabel}</span>
      <span className="label hidden text-mute md:block">Class {artifact.classification}</span>
      <span className="label text-mute tnum">{formatDate(artifact.discoveryDate)}</span>
      <ArrowUpRight className="hidden size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:block" aria-hidden="true" />
    </article>
  );
}
