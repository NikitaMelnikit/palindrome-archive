import type { Metadata } from "next";
import { ArchiveExplorer } from "@/components/archive/ArchiveExplorer";
import { getArtifactSummaries, getCategories, getCategory } from "@/lib/archive";
import { pad } from "@/lib/format";
import { isDefaultQuery, parseArchiveParams } from "@/lib/search";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const query = parseArchiveParams(await searchParams);
  const labels = query.categories.map((slug) => getCategory(slug).label);
  const title = query.q.trim()
    ? `Search: “${query.q.trim()}”`
    : labels.length > 0
      ? `Archive — ${labels.join(", ")}`
      : "The Archive";
  return {
    title,
    description:
      "Search and filter all twenty-four records in the PALINDROME® archive: objects, places, events, signals, documents and lost technologies.",
    alternates: { canonical: "/archive" },
    robots: isDefaultQuery(query) ? undefined : { index: false, follow: true },
  };
}

export default async function ArchivePage({ searchParams }: { searchParams: SearchParams }) {
  // Reading the query makes this route render per request, so filtered URLs arrive server-rendered.
  // The explorer is deliberately not wrapped in a streaming Suspense boundary: the data is local and
  // renders in milliseconds, and a streamed fallback would risk React client-rendering the boundary.
  await searchParams;
  const items = getArtifactSummaries();
  const categories = getCategories();

  return (
    <>
      <header className="shell overflow-hidden pt-10 pb-10 lg:pt-14">
        <div className="label flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-3 text-mute">
          <span className="text-ink">Index 01 / The archive</span>
          <span className="tnum">
            {pad(items.length, 3)} records · {pad(categories.length)} categories
          </span>
        </div>
        <div className="mt-8 grid items-end gap-8 lg:grid-cols-12">
          <h1 className="display text-[clamp(4.5rem,17vw,17rem)] leading-[0.78] lg:col-span-9">
            Archive<sup className="ml-2 align-top font-mono text-[0.12em] tracking-normal text-mute tnum">{pad(items.length, 3)}</sup>
          </h1>
          <p className="serif text-xl leading-snug lg:col-span-3 lg:pb-3">
            Every record below is documentation, not proof. Search by title, identifier, description or tag; filter by
            category; sort by accession.
          </p>
        </div>
      </header>
      <ArchiveExplorer items={items} categories={categories} />
    </>
  );
}
