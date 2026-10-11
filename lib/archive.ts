import {
  artifacts,
  categories,
  classifications,
  collections,
  timelineBranches,
  timelineEvents,
} from "@/data";
import type {
  Artifact,
  ArtifactSummary,
  Category,
  CategorySlug,
  Collection,
  CollectionSummary,
  TimelineBranch,
  TimelineEvent,
} from "@/types";

/** Server-side accessors over the static dataset. Client components receive summaries via props. */

const byAccession = [...artifacts].sort((a, b) => a.accession - b.accession);
const artifactById = new Map(artifacts.map((a) => [a.id, a]));
const artifactBySlug = new Map(artifacts.map((a) => [a.slug, a]));

export function getAllArtifacts(): Artifact[] {
  return byAccession;
}

export function getArtifactBySlug(slug: string): Artifact | undefined {
  return artifactBySlug.get(slug);
}

export function getArtifactById(id: string): Artifact | undefined {
  return artifactById.get(id);
}

export function getArtifactsByIds(ids: readonly string[]): Artifact[] {
  return ids.map((id) => artifactById.get(id)).filter((a): a is Artifact => Boolean(a));
}

export function toSummary(a: Artifact): ArtifactSummary {
  return {
    id: a.id,
    slug: a.slug,
    accession: a.accession,
    title: a.title,
    category: a.category,
    classification: a.classification,
    description: a.description,
    discoveryDate: a.discoveryDate,
    apparentDate: a.apparentDate,
    origin: a.origin,
    tags: a.tags,
    coordinates: a.coordinates,
    visualization: a.visualization,
  };
}

export function getArtifactSummaries(): ArtifactSummary[] {
  return byAccession.map(toSummary);
}

export function getRecentArtifacts(count: number): Artifact[] {
  return [...artifacts].sort((a, b) => b.discoveryDate.localeCompare(a.discoveryDate)).slice(0, count);
}

export function getFeaturedArtifacts(): Artifact[] {
  return byAccession.filter((a) => a.featured);
}

export function getRelatedArtifacts(artifact: Artifact): Artifact[] {
  return getArtifactsByIds(artifact.relatedArtifactIds);
}

/** Previous and next records in accession order, wrapping around the archive. */
export function getAdjacentArtifacts(artifact: Artifact): { previous: Artifact; next: Artifact } {
  const index = byAccession.findIndex((a) => a.id === artifact.id);
  const total = byAccession.length;
  return {
    previous: byAccession[(index - 1 + total) % total],
    next: byAccession[(index + 1) % total],
  };
}

export function getCategory(slug: CategorySlug): Category {
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw new Error(`Unknown category: ${slug}`);
  return category;
}

export function getCategories(): Category[] {
  return categories;
}

export function getCategoryCounts(): { category: Category; count: number }[] {
  return categories.map((category) => ({
    category,
    count: artifacts.filter((a) => a.category === category.slug).length,
  }));
}

export function getClassification(level: Artifact["classification"]) {
  return classifications[level];
}

export function getAllCollections(): Collection[] {
  return collections;
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

export function getCollectionArtifacts(collection: Collection): Artifact[] {
  return getArtifactsByIds(collection.artifactIds);
}

export function getCollectionsForArtifact(artifact: Artifact): Collection[] {
  return collections.filter((c) => artifact.collectionIds.includes(c.id));
}

export function toCollectionSummary(collection: Collection): CollectionSummary {
  const members = getCollectionArtifacts(collection);
  return {
    id: collection.id,
    slug: collection.slug,
    title: collection.title,
    code: collection.code,
    kicker: collection.kicker,
    description: collection.description,
    visualization: collection.visualization,
    artifactCount: members.length,
    categories: [...new Set(members.map((a) => a.category))],
  };
}

export function getCollectionSummaries(): CollectionSummary[] {
  return collections.map(toCollectionSummary);
}

export function getTimelineBranches(): TimelineBranch[] {
  return timelineBranches;
}

export function getTimelineBranch(id: string): TimelineBranch | undefined {
  return timelineBranches.find((b) => b.id === id);
}

export function getTimelineEvents(): TimelineEvent[] {
  return [...timelineEvents].sort((a, b) => a.year - b.year);
}

export function getTimelineEvent(id: string): TimelineEvent | undefined {
  return timelineEvents.find((e) => e.id === id);
}

export function getEventsForArtifact(artifact: Artifact): TimelineEvent[] {
  return getTimelineEvents().filter((e) => e.artifactIds.includes(artifact.id));
}

export function getAnchorVersions(anchorId: string): { branch: TimelineBranch; event: TimelineEvent }[] {
  return timelineEvents
    .filter((e) => e.anchorId === anchorId)
    .map((event) => ({ event, branch: getTimelineBranch(event.branchId)! }))
    .sort((a, b) => a.event.year - b.event.year);
}

/** Span of apparent years covered by a set of artifacts, using the dates their events sit on. */
export function getArchiveSpan(): { from: number; to: number } {
  const years = timelineEvents.map((e) => e.year);
  return { from: Math.min(...years), to: Math.max(...years) };
}
