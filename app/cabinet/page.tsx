import type { Metadata } from "next";
import { CabinetView } from "@/components/cabinet/CabinetView";
import { getArtifactSummaries, getCategories, getCollectionSummaries } from "@/lib/archive";
import type { CategorySlug } from "@/types";

export const metadata: Metadata = {
  title: "My Cabinet",
  description: "Your personal PALINDROME® cabinet: saved records, saved collections and recently viewed artifacts, kept in this browser.",
  alternates: { canonical: "/cabinet" },
  robots: { index: false, follow: true },
};

export default function CabinetPage() {
  const categoryLabels = Object.fromEntries(getCategories().map((c) => [c.slug, c.label])) as Record<CategorySlug, string>;
  return (
    <>
      <header className="shell overflow-hidden pt-10 lg:pt-14">
        <div className="label flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-3 text-mute">
          <span className="text-ink">Index 04 / My cabinet</span>
          <span>Local · this browser only</span>
        </div>
        <div className="mt-8 grid items-end gap-8 lg:grid-cols-12">
          <h1 className="display text-[clamp(4rem,14vw,14rem)] leading-[0.78] lg:col-span-8">Cabinet</h1>
          <p className="serif text-xl leading-snug lg:col-span-4 lg:pb-2">
            A personal drawer in the archive. It needs no account: everything is kept in this browser’s local storage,
            and nothing is sent anywhere.
          </p>
        </div>
      </header>
      <CabinetView artifacts={getArtifactSummaries()} collections={getCollectionSummaries()} categoryLabels={categoryLabels} />
    </>
  );
}
