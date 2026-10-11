import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtifactCard } from "@/components/archive/ArtifactCard";
import { SaveCollectionButton } from "@/components/collections/SaveCollectionButton";
import { getAllCollections, getCategory, getCollectionArtifacts, getCollectionBySlug, toSummary } from "@/lib/archive";
import { formatDate, pad } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCollections().map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return { title: "Collection not found" };
  return {
    title: `${collection.title} · ${collection.code}`,
    description: collection.description,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: { title: collection.title, description: collection.description, url: `/collections/${collection.slug}` },
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  const artifacts = getCollectionArtifacts(collection);
  const all = getAllCollections();
  const index = all.findIndex((c) => c.id === collection.id);
  const next = all[(index + 1) % all.length];
  const previous = all[(index - 1 + all.length) % all.length];
  const categoryLabels = [...new Set(artifacts.map((a) => getCategory(a.category).label))];
  const dates = artifacts.map((a) => a.discoveryDate).sort();

  return (
    <article aria-labelledby="collection-title">
      <div className="shell">
        <nav aria-label="Breadcrumb" className="label flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 py-3">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/collections" className="link-u flex items-center gap-1.5">
                <ArrowLeft className="size-3.5" aria-hidden="true" /> Collections
              </Link>
            </li>
            <li aria-hidden="true" className="text-mute">
              /
            </li>
            <li aria-current="page" className="text-mute">
              {collection.code}
            </li>
          </ol>
          <span className="text-mute tnum">
            Collection {pad(index + 1)} of {pad(all.length)}
          </span>
        </nav>
      </div>

      <header className="shell pt-10 lg:pt-16">
        <p className="label flex flex-wrap gap-x-5 gap-y-1 text-mute">
          <span className="text-ink">{collection.code}</span>
          <span>{collection.kicker}</span>
          <span className="tnum">{pad(artifacts.length)} records</span>
        </p>
        <h1 id="collection-title" className="display mt-6 max-w-[16ch] text-[clamp(3.25rem,10vw,10.5rem)]">
          {collection.title}
        </h1>
      </header>

      <div className="shell mt-10 lg:mt-14">
        <figure>
          <div className="crops relative">
            <ArtifactArt visualization={collection.visualization} className="aspect-[4/3] sm:aspect-[21/9]" />
            <i aria-hidden="true" />
            <i aria-hidden="true" />
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </div>
          <figcaption className="label mt-2 flex justify-between gap-4 text-mute">
            <span>Plate — {collection.title}</span>
            <span className="tnum">{collection.code}</span>
          </figcaption>
        </figure>
      </div>

      <section className="shell grid gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24" aria-label="Introduction">
        <div className="lg:col-span-3">
          <dl className="border-t border-ink">
            {[
              { term: "Code", value: collection.code },
              { term: "Records", value: pad(artifacts.length) },
              { term: "Categories", value: categoryLabels.join(", ") },
              { term: "Accessioned", value: `${formatDate(dates[0])} — ${formatDate(dates[dates.length - 1])}` },
            ].map((row) => (
              <div key={row.term} className="border-b border-ink/15 py-3">
                <dt className="label text-mute">{row.term}</dt>
                <dd className="meta mt-1">{row.value}</dd>
              </div>
            ))}
          </dl>
          <SaveCollectionButton id={collection.id} title={collection.title} className="mt-6 w-full" />
        </div>
        <div className="prose-archive serif text-[1.3rem] leading-[1.55] lg:col-span-5 lg:col-start-5">
          {collection.introduction.map((paragraph, i) => (
            <p key={i} className={i === 0 ? "dropcap" : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
        <aside className="lg:col-span-3 lg:col-start-10">
          <h2 className="label border-b border-ink pb-2">Curator’s note</h2>
          <blockquote className="serif mt-4 text-xl leading-snug italic">“{collection.curatorNote}”</blockquote>
          <p className="label mt-4 text-mute">— Curatorial desk, Archive 001</p>
        </aside>
      </section>

      <section aria-labelledby="index-title" className="border-t border-ink/15 bg-paper-2">
        <div className="shell py-16 lg:py-20">
          <h2 id="index-title" className="label">
            Collection index
          </h2>
          <ol className="mt-4 border-t border-ink">
            {artifacts.map((artifact, i) => (
              <li key={artifact.id}>
                <Link
                  href={`/archive/${artifact.slug}`}
                  className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-ink/15 py-4 transition-colors hover:bg-paper md:grid-cols-[3rem_8rem_minmax(0,1fr)_10rem_8rem]"
                >
                  <span className="label text-mute tnum">{pad(i + 1)}</span>
                  <span className="label hidden tnum md:block">{artifact.id}</span>
                  <span className="font-display text-xl leading-tight font-medium tracking-tight">
                    <span className="link-u">{artifact.title}</span>
                  </span>
                  <span className="label hidden text-mute md:block">{getCategory(artifact.category).label}</span>
                  <span className="label text-mute tnum">{formatDate(artifact.discoveryDate)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="records-title" className="border-t border-ink/15">
        <div className="shell py-16 lg:py-24">
          <h2 id="records-title" className="display mb-12 text-[clamp(2.5rem,6vw,5rem)]">
            The records
          </h2>
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:[&>li:nth-child(3n+2)]:mt-14">
            {artifacts.map((artifact) => (
              <li key={artifact.id}>
                <ArtifactCard artifact={toSummary(artifact)} categoryLabel={getCategory(artifact.category).label} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label="Other collections" className="border-t border-ink">
        <div className="shell grid sm:grid-cols-2">
          <Link href={`/collections/${previous.slug}`} className="group flex flex-col gap-3 border-b border-ink/15 py-8 sm:border-r sm:border-b-0 sm:pr-8">
            <span className="label flex items-center gap-2 text-mute">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous collection · {previous.code}
            </span>
            <span className="display-tight text-3xl">
              <span className="link-u">{previous.title}</span>
            </span>
          </Link>
          <Link href={`/collections/${next.slug}`} className="group flex flex-col items-end gap-3 py-8 text-right sm:pl-8">
            <span className="label flex items-center gap-2 text-mute">
              Next collection · {next.code} <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
            <span className="display-tight text-3xl">
              <span className="link-u">{next.title}</span>
            </span>
          </Link>
        </div>
      </nav>
    </article>
  );
}
