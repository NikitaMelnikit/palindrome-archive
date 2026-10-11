import type { Metadata } from "next";
import { BranchingPreview } from "@/components/home/BranchingPreview";
import { FinalInvitation } from "@/components/home/FinalInvitation";
import { HomeHero, type HeroArtifact } from "@/components/home/HomeHero";
import { RealityChooser, type RealityVersion } from "@/components/home/RealityChooser";
import { RecentlyUncovered } from "@/components/home/RecentlyUncovered";
import { SelectedCollection } from "@/components/home/SelectedCollection";
import {
  getAllArtifacts,
  getAnchorVersions,
  getArtifactById,
  getArtifactsByIds,
  getCategory,
  getCategoryCounts,
  getCollectionArtifacts,
  getCollectionBySlug,
  getFeaturedArtifacts,
  getRecentArtifacts,
  getTimelineBranches,
  getTimelineEvents,
  toSummary,
} from "@/lib/archive";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Pens left on the Esker table in each branch: γ uses all three, α two, β none. */
const PENS_BY_BRANCH: Record<string, number> = { gamma: 0, alpha: 1, beta: 3 };

export default function HomePage() {
  const artifacts = getAllArtifacts();
  const events = getTimelineEvents();
  const branches = getTimelineBranches();
  const forkBranches = branches.filter((b) => b.forksFrom);

  const pool: HeroArtifact[] = [...getFeaturedArtifacts()]
    .sort((a, b) => b.discoveryDate.localeCompare(a.discoveryDate))
    .map((a) => ({
      ...toSummary(a),
      categoryLabel: getCategory(a.category).label,
      branchParams: a.id === "EV-1771-VE" ? PENS_BY_BRANCH : undefined,
    }));

  const categoryCounts = getCategoryCounts().map(({ category, count }) => ({
    slug: category.slug,
    label: category.label,
    code: category.code,
    count,
  }));

  const recent = getRecentArtifacts(5);
  const lastAccession = recent[0];

  const cities = getCollectionBySlug("cities-that-never-existed")!;

  const versions: RealityVersion[] = getAnchorVersions("esker").map(({ branch, event }) => {
    const later = events.filter((e) => e.branchId === branch.id && e.year > event.year).slice(0, 3);
    const evidence = getArtifactsByIds([...new Set([...event.artifactIds, ...later.flatMap((e) => e.artifactIds)])]);
    return {
      branch,
      event,
      pensRemaining: PENS_BY_BRANCH[branch.id] ?? 3,
      consequences: later,
      artifacts: evidence.slice(0, 4).map((a) => ({ id: a.id, slug: a.slug, title: a.title })),
    };
  });
  const esker = getArtifactById("EV-1771-VE")!;

  return (
    <>
      <HomeHero
        pool={pool}
        branches={forkBranches}
        events={events}
        categoryCounts={categoryCounts}
        totalRecords={artifacts.length}
        lastAccession={{ id: lastAccession.id, date: lastAccession.discoveryDate }}
      />
      <RecentlyUncovered artifacts={recent} />
      <BranchingPreview branches={branches} events={events} />
      <SelectedCollection collection={cities} artifacts={getCollectionArtifacts(cities)} />
      <RealityChooser versions={versions} visualization={esker.visualization} />
      <FinalInvitation records={artifacts.length} categories={categoryCounts.length} branches={forkBranches.length} />
    </>
  );
}
