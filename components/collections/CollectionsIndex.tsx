"use client";

import { ArrowUpRight } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useState } from "react";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { pad } from "@/lib/format";
import { cn } from "@/lib/site";
import type { Category, CategorySlug, CollectionSummary } from "@/types";
import { SaveCollectionButton } from "./SaveCollectionButton";

/** Editorial index of collections, filterable by the categories each collection contains. */
export function CollectionsIndex({ collections, categories }: { collections: CollectionSummary[]; categories: Category[] }) {
  const [filter, setFilterState] = useState<CategorySlug | null>(null);
  // Only animate after the visitor filters, never on first load.
  const [interacted, setInteracted] = useState(false);
  const setFilter = (next: CategorySlug | null) => {
    setInteracted(true);
    setFilterState(next);
  };
  const visible = filter ? collections.filter((c) => c.categories.includes(filter)) : collections;
  const labels = Object.fromEntries(categories.map((c) => [c.slug, c.label])) as Record<CategorySlug, string>;

  return (
    <div className="shell pb-20 lg:pb-28">
      <div className="sticky top-14 z-20 -mx-4 border-y border-ink/15 bg-paper px-4 py-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Filter collections by category" className="flex flex-wrap gap-2">
            <button type="button" className="chip" aria-pressed={filter === null} onClick={() => setFilter(null)}>
              All
            </button>
            {categories.map((category) => {
              const count = collections.filter((c) => c.categories.includes(category.slug)).length;
              return (
                <button
                  key={category.slug}
                  type="button"
                  className="chip"
                  aria-pressed={filter === category.slug}
                  onClick={() => setFilter(filter === category.slug ? null : category.slug)}
                >
                  {category.label} <span className="opacity-70 tnum">{pad(count)}</span>
                </button>
              );
            })}
          </div>
          <p className="label text-mute" aria-live="polite">
            Showing {pad(visible.length)} of {pad(collections.length)} collections
            {filter && ` containing ${labels[filter].toLowerCase()}`}
          </p>
        </div>
      </div>

      <ol className="mt-4">
        {visible.map((collection, index) => (
          <m.li
            key={collection.id}
            initial={interacted ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.05, ease: [0.2, 0.7, 0.1, 1] }}
            className="border-b border-ink/15"
          >
            <article className="group relative grid gap-6 py-10 md:grid-cols-12 md:gap-8 lg:py-14">
              <div className={cn("md:col-span-5 lg:col-span-4", index % 2 === 1 && "md:order-last md:col-start-8 lg:col-start-9")}>
                <div className="crops relative overflow-hidden">
                  <ArtifactArt
                    visualization={collection.visualization}
                    detail="thumb"
                    decorative
                    className="aspect-[5/4] transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                </div>
              </div>
              <div className={cn("flex flex-col md:col-span-7 lg:col-span-7", index % 2 === 1 ? "lg:col-start-1" : "lg:col-start-6")}>
                <p className="label flex flex-wrap gap-x-4 gap-y-1 text-mute">
                  <span className="text-ink">{collection.code}</span>
                  <span>{collection.kicker}</span>
                  <span className="tnum">{pad(collection.artifactCount)} records</span>
                </p>
                <h2 className="display mt-4 text-[clamp(2.5rem,5.5vw,5.25rem)]">
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-lime"
                    data-cursor="Open"
                  >
                    {collection.title}
                  </Link>
                </h2>
                <p className="serif mt-5 max-w-2xl text-xl leading-snug">{collection.description}</p>
                <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1" aria-label="Categories in this collection">
                  {collection.categories.map((slug) => (
                    <li key={slug} className="label text-mute">
                      {labels[slug]}
                    </li>
                  ))}
                </ul>
                <div className="relative z-10 mt-auto flex flex-wrap items-center gap-3 pt-8">
                  <span className="label flex items-center gap-1.5">
                    Open collection <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </span>
                  <SaveCollectionButton id={collection.id} title={collection.title} className="ml-auto" />
                </div>
              </div>
            </article>
          </m.li>
        ))}
      </ol>
      {visible.length === 0 && (
        <div className="py-20 text-center">
          <p className="display-tight text-3xl">No collection holds that category yet.</p>
          <button type="button" className="btn mt-6" onClick={() => setFilter(null)}>
            Show all collections
          </button>
        </div>
      )}
    </div>
  );
}
