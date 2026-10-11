import type { Artifact } from "@/types";
import { artifactRecords } from "./artifacts";
import { categories, categorySlugs, classifications } from "./categories";
import { collections } from "./collections";
import { timelineBranches, timelineEvents } from "./timelines";

/**
 * Assemble the public artifact dataset. Collection and timeline membership are derived from the
 * collection and timeline datasets, so each relationship is authored in exactly one place.
 */
function assembleArtifacts(): Artifact[] {
  return artifactRecords.map((record) => ({
    ...record,
    collectionIds: collections.filter((c) => c.artifactIds.includes(record.id)).map((c) => c.id),
    timelineIds: timelineBranches
      .filter((branch) =>
        timelineEvents.some((event) => event.branchId === branch.id && event.artifactIds.includes(record.id)),
      )
      .map((branch) => branch.id),
  }));
}

export const artifacts: Artifact[] = assembleArtifacts();

export { artifactRecords, categories, categorySlugs, classifications, collections, timelineBranches, timelineEvents };
