import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtFrame } from "@/components/art/ArtFrame";
import { ArtifactCard } from "@/components/archive/ArtifactCard";
import { ArtifactActions } from "@/components/artifacts/ArtifactActions";
import { ArtifactInteractionSection } from "@/components/artifacts/ArtifactInteractionSection";
import { InspectionMode } from "@/components/artifacts/InspectionMode";
import { RecordView } from "@/components/artifacts/RecordView";
import { Coordinates, Greek } from "@/components/ui/Greek";
import {
  getAdjacentArtifacts,
  getAllArtifacts,
  getArtifactBySlug,
  getCategory,
  getClassification,
  getCollectionsForArtifact,
  getEventsForArtifact,
  getRelatedArtifacts,
  getTimelineBranch,
  toSummary,
} from "@/lib/archive";
import {
  formatAccession,
  formatDate,
  formatDateArchival,
  formatDt,
  formatLambda,
  formatPsi,
  pad,
} from "@/lib/format";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArtifacts().map((artifact) => ({ slug: artifact.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const artifact = getArtifactBySlug(slug);
  if (!artifact) return { title: "Record not found" };
  const title = `${artifact.title} · ${artifact.id}`;
  return {
    title,
    description: artifact.description,
    alternates: { canonical: `/archive/${artifact.slug}` },
    openGraph: {
      type: "article",
      title,
      description: artifact.description,
      url: `/archive/${artifact.slug}`,
    },
  };
}

export default async function ArtifactPage({ params }: { params: Params }) {
  const { slug } = await params;
  const artifact = getArtifactBySlug(slug);
  if (!artifact) notFound();

  const category = getCategory(artifact.category);
  const classification = getClassification(artifact.classification);
  const related = getRelatedArtifacts(artifact);
  const { previous, next } = getAdjacentArtifacts(artifact);
  const collections = getCollectionsForArtifact(artifact);
  const events = getEventsForArtifact(artifact);
  const total = getAllArtifacts().length;

  const metadata: { term: string; value: ReactNode }[] = [
    {
      term: "Classification",
      value: (
        <>
          Class {classification.level} — {classification.label}
          <span className="mt-1 block text-[0.8rem] leading-snug text-mute normal-case">{classification.description}</span>
        </>
      ),
    },
    { term: "Category", value: `${category.label} (${category.code})` },
    { term: "Documented", value: formatDate(artifact.discoveryDate) },
    { term: "Apparent date", value: artifact.apparentDate },
    { term: "Origin", value: artifact.origin },
    {
      term: "Coordinates",
      value: (
        <span className="tnum">
          ψ {formatPsi(artifact.coordinates.psi)} · λ {formatLambda(artifact.coordinates.lambda)} · Δt{" "}
          {formatDt(artifact.coordinates.dt)}
        </span>
      ),
    },
  ];

  return (
    <article aria-labelledby="artifact-title">
      <RecordView id={artifact.id} />

      <div className="shell">
        <nav aria-label="Breadcrumb" className="label flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 py-3">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/archive" className="link-u flex items-center gap-1.5">
                <ArrowLeft className="size-3.5" aria-hidden="true" /> Archive
              </Link>
            </li>
            <li aria-hidden="true" className="text-mute">
              /
            </li>
            <li>
              <Link href={`/archive?category=${category.slug}`} className="link-u">
                {category.label}
              </Link>
            </li>
            <li aria-hidden="true" className="text-mute">
              /
            </li>
            <li aria-current="page" className="text-mute tnum">
              {artifact.id}
            </li>
          </ol>
          <span className="text-mute tnum">
            Accession {formatAccession(artifact.accession)} of {formatAccession(total)}
          </span>
        </nav>
      </div>

      <header className="shell grid gap-12 py-10 lg:grid-cols-12 lg:gap-8 lg:py-14">
        <div className="lg:col-span-6 xl:col-span-6">
          <ArtFrame
            topLeft={`Fig. ${pad(artifact.accession)} · ${category.label}`}
            topRight={artifact.id}
            bottomLeft={<Coordinates value={artifact.coordinates} />}
            bottomRight={artifact.apparentDate}
            plateClassName="plate-in"
          >
            <InspectionMode
              id={artifact.id}
              title={artifact.title}
              visualization={artifact.visualization}
              annotations={artifact.annotations}
            >
              <ArtifactArt visualization={artifact.visualization} decorative />
            </InspectionMode>
          </ArtFrame>
        </div>

        <div className="flex min-w-0 flex-col lg:col-span-6 lg:pl-6 xl:col-span-5 xl:col-start-8 xl:pl-0">
          <p className="label flex items-center gap-3 text-mute">
            <span className="status-dot" data-tone={artifact.classification === "III" ? "volatile" : artifact.classification === "IV" ? "drifting" : "stable"} aria-hidden="true" />
            {category.label} · Class {classification.level} · {classification.label}
          </p>
          <p className="mt-6 font-mono text-[clamp(1.75rem,3.6vw,3rem)] leading-none tracking-tight tnum">{artifact.id}</p>
          <h1 id="artifact-title" className="display mt-4 text-[clamp(2.75rem,5.6vw,5.75rem)] [overflow-wrap:anywhere]">
            {artifact.title}
          </h1>
          <p className="serif mt-7 max-w-xl text-[1.4rem] leading-snug">{artifact.description}</p>
          <div className="mt-8">
            <ArtifactActions id={artifact.id} slug={artifact.slug} title={artifact.title} />
          </div>
          <dl className="mt-10 border-t border-ink">
            {metadata.map((row) => (
              <div key={row.term} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-4 border-b border-ink/15 py-3">
                <dt className="label pt-0.5 text-mute">{row.term}</dt>
                <dd className="meta">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section aria-labelledby="narrative-title" className="border-t border-ink/15">
        <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="lg:col-span-3">
            <h2 id="narrative-title" className="label text-mute">
              The record
            </h2>
            <p className="label mt-3">Documented {formatDateArchival(artifact.discoveryDate)}</p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
              {artifact.tags.map((tag) => (
                <li key={tag}>
                  <Link href={`/archive?q=${encodeURIComponent(tag)}`} className="chip">
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="prose-archive serif text-[1.3rem] leading-[1.55] lg:col-span-5">
            {artifact.longDescription.map((paragraph, i) => (
              <p key={i} className={i === 0 ? "dropcap" : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
          <aside aria-labelledby="notes-title" className="lg:col-span-3 lg:col-start-10">
            <h2 id="notes-title" className="label border-b border-ink pb-2">
              Research notes · {pad(artifact.researchNotes.length)}
            </h2>
            <ol className="mt-2">
              {artifact.researchNotes.map((note) => (
                <li key={`${note.date}-${note.author}`} className="border-b border-ink/15 py-4">
                  <p className="label flex justify-between gap-2 text-mute">
                    <time dateTime={note.date}>{formatDate(note.date)}</time>
                    <span>{note.author}</span>
                  </p>
                  <p className="mt-2 text-[0.95rem] leading-relaxed">{note.text}</p>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <ArtifactInteractionSection artifact={artifact} />

      {(collections.length > 0 || events.length > 0) && (
        <section aria-labelledby="appears-title" className="border-t border-ink/15 bg-paper-2">
          <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
            <h2 id="appears-title" className="display-tight text-4xl lg:col-span-3">
              Where it appears
            </h2>
            <div className="lg:col-span-4">
              <h3 className="label border-b border-ink pb-2">Collections · {pad(collections.length)}</h3>
              <ul>
                {collections.map((collection) => (
                  <li key={collection.id}>
                    <Link href={`/collections/${collection.slug}`} className="group flex items-baseline gap-4 border-b border-ink/15 py-3">
                      <span className="label w-10 shrink-0 text-mute">{collection.code}</span>
                      <span className="font-display text-lg font-medium tracking-tight">
                        <span className="link-u">{collection.title}</span>
                      </span>
                      <ArrowUpRight className="ml-auto size-4 shrink-0" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <h3 className="label border-b border-ink pb-2">Timeline events · {pad(events.length)}</h3>
              {events.length === 0 ? (
                <p className="py-3 text-mute">Not recorded in any branch of the timeline.</p>
              ) : (
                <ul>
                  {events.map((event) => {
                    const branch = getTimelineBranch(event.branchId);
                    return (
                      <li key={event.id}>
                        <Link href={`/timelines?event=${event.id}`} className="group flex items-baseline gap-4 border-b border-ink/15 py-3">
                          <span className="label w-10 shrink-0 text-mute tnum">{event.year}</span>
                          <span className="text-[0.95rem] leading-snug">
                            <span className="link-u">{event.title}</span>
                            <span className="label mt-1 block text-mute">
                              Branch <Greek>{branch?.sigil}</Greek> · {branch?.name}
                            </span>
                          </span>
                          <ArrowUpRight className="ml-auto size-4 shrink-0" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="related-title" className="border-t border-ink/15">
        <div className="shell py-16 lg:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 id="related-title" className="display text-[clamp(2.5rem,6vw,5rem)]">
              Related records
            </h2>
            <Link href="/archive" className="label link-u">
              Return to the archive →
            </Link>
          </div>
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <ArtifactCard artifact={toSummary(item)} categoryLabel={getCategory(item.category).label} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label="Adjacent records" className="border-t border-ink">
        <div className="shell grid sm:grid-cols-2">
          <Link
            href={`/archive/${previous.slug}`}
            className="group flex flex-col gap-3 border-b border-ink/15 py-8 sm:border-r sm:border-b-0 sm:pr-8"
            data-cursor="Previous"
          >
            <span className="label flex items-center gap-2 text-mute">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" aria-hidden="true" /> Previous accession
            </span>
            <span className="font-mono text-2xl tnum">{previous.id}</span>
            <span className="display-tight text-2xl">
              <span className="link-u">{previous.title}</span>
            </span>
          </Link>
          <Link href={`/archive/${next.slug}`} className="group flex flex-col items-end gap-3 py-8 text-right sm:pl-8" data-cursor="Next">
            <span className="label flex items-center gap-2 text-mute">
              Next accession <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
            <span className="font-mono text-2xl tnum">{next.id}</span>
            <span className="display-tight text-2xl">
              <span className="link-u">{next.title}</span>
            </span>
          </Link>
        </div>
      </nav>
    </article>
  );
}
