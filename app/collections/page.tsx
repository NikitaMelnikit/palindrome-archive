import type { Metadata } from "next";
import { CollectionsIndex } from "@/components/collections/CollectionsIndex";
import { getCategories, getCollectionSummaries } from "@/lib/archive";
import { pad } from "@/lib/format";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Curated collections from the PALINDROME® archive: Cities That Never Existed, Objects From Tomorrow, The Last Known Signals, Documents Without Origins, Technologies We Never Invented and Weather From Elsewhere.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  const collections = getCollectionSummaries();
  return (
    <>
      <header className="shell overflow-hidden pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="label flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-3 text-mute">
          <span className="text-ink">Index 03 / Collections</span>
          <span className="tnum">{pad(collections.length)} curated collections</span>
        </div>
        <div className="mt-8 grid items-end gap-8 lg:grid-cols-12">
          <h1 className="display text-[clamp(3.5rem,12vw,12.5rem)] leading-[0.8] lg:col-span-9">Collections</h1>
          <p className="serif text-xl leading-snug lg:col-span-3 lg:pb-2">
            Records gathered by theme, in the order a curator would show them to you. Every record belongs to at least
            one.
          </p>
        </div>
      </header>
      <CollectionsIndex collections={collections} categories={getCategories()} />
    </>
  );
}
