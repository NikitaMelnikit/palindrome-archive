/**
 * Shared domain types for the PALINDROME® archive.
 * Content lives in /data; rendering lives in /components. These types are the contract between them.
 */

export type CategorySlug =
  | "objects"
  | "places"
  | "events"
  | "signals"
  | "documents"
  | "lost-technologies";

export interface Category {
  slug: CategorySlug;
  /** Two-letter archive code, e.g. "OB". Its mirror closes every identifier. */
  code: string;
  label: string;
  description: string;
}

export type ClassificationLevel = "I" | "II" | "III" | "IV";

export interface Classification {
  level: ClassificationLevel;
  label: string;
  description: string;
}

export type ArtKind =
  | "contour"
  | "city"
  | "rings"
  | "dial"
  | "waveform"
  | "document"
  | "schematic"
  | "shadow"
  | "grid"
  | "particles"
  | "crystal"
  | "strata";

export type ArtTone = "light" | "dark";

/** Parameters for the procedural artwork that represents an artifact or collection. */
export interface Visualization {
  kind: ArtKind;
  seed: number;
  /** Generator-specific composition variant. */
  variant?: number;
  /** Generator-specific numeric parameter (split position, water level, pens remaining…). */
  param?: number;
  tone?: ArtTone;
  /** Meaningful alternative text describing the artwork. */
  alt: string;
}

/** Fictional archive coordinates: phase from consensus reality, drift, and temporal offset in years. */
export interface RealityCoordinates {
  psi: number;
  lambda: number;
  dt: number;
}

/** Point annotation on an artwork, positioned in percent of the artwork box. */
export interface Annotation {
  x: number;
  y: number;
  label: string;
  note: string;
}

export interface ResearchNote {
  date: string;
  author: string;
  text: string;
}

export interface TimelineSliderInteraction {
  type: "timeline-slider";
  label: string;
  stops: { year: number; reading: string; param: number }[];
}

export interface LayeredDocumentInteraction {
  type: "layered-document";
  heading: string;
  /** Lines of the document. Segments wrapped in [[double brackets]] are redacted until lifted. */
  lines: string[];
  layers: { id: string; label: string; description: string }[];
  annotations: { id: string; layer: string; line: number; text: string }[];
}

export interface CoordinateMapInteraction {
  type: "coordinate-map";
  label: string;
  points: { id: string; label: string; x: number; y: number; coordinates: string; reading: string }[];
}

export interface ViewModeInteraction {
  type: "view-mode";
  label: string;
  modes: {
    id: string;
    label: string;
    description: string;
    visualization: Partial<Omit<Visualization, "alt">> & { alt: string };
  }[];
}

export type ArtifactInteraction =
  | TimelineSliderInteraction
  | LayeredDocumentInteraction
  | CoordinateMapInteraction
  | ViewModeInteraction;

/** An artifact as authored in /data. Relationships to collections and timelines are derived. */
export interface ArtifactRecord {
  id: string;
  slug: string;
  /** Accession order within the archive, 1-based. Encoded in the identifier. */
  accession: number;
  title: string;
  category: CategorySlug;
  classification: ClassificationLevel;
  description: string;
  longDescription: string[];
  /** ISO date on which the archive documented the artifact. */
  discoveryDate: string;
  /** The date or era the artifact appears to come from, in its own terms. */
  apparentDate: string;
  origin: string;
  coordinates: RealityCoordinates;
  tags: string[];
  visualization: Visualization;
  annotations: Annotation[];
  researchNotes: ResearchNote[];
  relatedArtifactIds: string[];
  featured: boolean;
  /** ISO timestamp at which the archive record was created. */
  createdAt: string;
  interaction?: ArtifactInteraction;
}

export interface Artifact extends ArtifactRecord {
  collectionIds: string[];
  timelineIds: string[];
}

/** Lightweight artifact shape safe to pass to client components. */
export type ArtifactSummary = Pick<
  Artifact,
  | "id"
  | "slug"
  | "accession"
  | "title"
  | "category"
  | "classification"
  | "description"
  | "discoveryDate"
  | "apparentDate"
  | "origin"
  | "tags"
  | "coordinates"
  | "visualization"
>;

export interface Collection {
  id: string;
  slug: string;
  title: string;
  /** Short index code, e.g. "C·01". */
  code: string;
  kicker: string;
  description: string;
  introduction: string[];
  curatorNote: string;
  /** Curated, ordered membership. The single source of truth for collection relationships. */
  artifactIds: string[];
  visualization: Visualization;
}

export type CollectionSummary = Pick<
  Collection,
  "id" | "slug" | "title" | "code" | "kicker" | "description" | "visualization"
> & { artifactCount: number; categories: CategorySlug[] };

export type BranchTone = "consensus" | "ink" | "lime" | "alert";

export interface TimelineBranch {
  id: string;
  name: string;
  /** Greek letter or short sigil shown in the interface. */
  sigil: string;
  tone: BranchTone;
  description: string;
  /** Branch this one forks from, or null for the consensus line. */
  forksFrom: string | null;
  forkYear: number | null;
}

export interface TimelineEvent {
  id: string;
  branchId: string;
  year: number;
  title: string;
  summary: string;
  detail: string;
  artifactIds: string[];
  /** Shared identifier for one event as it occurs (or fails to) across branches. */
  anchorId?: string;
  /** Archive confidence that this event belongs to its branch, 0–1. */
  certainty: number;
}
