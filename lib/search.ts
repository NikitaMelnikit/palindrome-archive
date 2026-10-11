import { categorySlugs } from "@/data/categories";
import type { ArtifactSummary, CategorySlug } from "@/types";

/** Archive search, filtering, sorting, pagination and URL state. Pure functions; no React. */

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Alphabetical" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];
export type ViewMode = "grid" | "list";

export const PAGE_SIZE = 9;

export interface ArchiveQuery {
  q: string;
  categories: CategorySlug[];
  sort: SortKey;
  view: ViewMode;
  /** Number of pages currently revealed (load-more), 1-based. */
  page: number;
}

export const DEFAULT_QUERY: ArchiveQuery = { q: "", categories: [], sort: "newest", view: "grid", page: 1 };

const VALID_CATEGORIES: readonly CategorySlug[] = categorySlugs;
const VALID_SORTS = SORT_OPTIONS.map((o) => o.value) as readonly string[];

/** Lowercase, strip diacritics and collapse whitespace so "Ø", "ø" and "o" compare loosely. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ø/g, "o")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const compact = (text: string) => normalize(text).replace(/[^a-z0-9]/g, "");

function tokenize(query: string): string[] {
  return normalize(query)
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Score an artifact against the query tokens. Every token must match at least one field (AND
 * semantics). Returns 0 when the artifact does not match.
 */
export function scoreArtifact(artifact: ArtifactSummary, query: string, categoryLabel = ""): number {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 1;

  const title = normalize(artifact.title);
  const id = normalize(artifact.id);
  const idCompact = compact(artifact.id);
  const description = normalize(artifact.description);
  const tags = artifact.tags.map(normalize);
  const origin = normalize(artifact.origin);
  const category = normalize(categoryLabel);

  let score = 0;
  for (const token of tokens) {
    const tokenCompact = compact(token);
    let tokenScore = 0;
    if (id.includes(token) || (tokenCompact.length >= 2 && idCompact.includes(tokenCompact))) tokenScore += 6;
    if (title.includes(token)) tokenScore += 5;
    if (tags.some((tag) => tag.includes(token))) tokenScore += 3;
    if (category.includes(token)) tokenScore += 2;
    if (description.includes(token)) tokenScore += 1;
    if (origin.includes(token)) tokenScore += 1;
    if (tokenScore === 0) return 0;
    score += tokenScore;
  }
  return score;
}

export function sortArtifacts(items: ArtifactSummary[], sort: SortKey): ArtifactSummary[] {
  const sorted = [...items];
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => a.discoveryDate.localeCompare(b.discoveryDate) || a.accession - b.accession);
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
    case "newest":
    default:
      return sorted.sort((a, b) => b.discoveryDate.localeCompare(a.discoveryDate) || b.accession - a.accession);
  }
}

export interface ArchiveResult {
  /** All matches, sorted. */
  matches: ArtifactSummary[];
  /** The slice revealed by the current page count. */
  visible: ArtifactSummary[];
  total: number;
  hasMore: boolean;
  /** Number of matches per category, given the text query (ignores the category filter). */
  categoryCounts: Record<CategorySlug, number>;
}

export function queryArchive(
  items: ArtifactSummary[],
  query: ArchiveQuery,
  categoryLabels: Partial<Record<CategorySlug, string>> = {},
  pageSize = PAGE_SIZE,
): ArchiveResult {
  const textMatches = items.filter((item) => scoreArtifact(item, query.q, categoryLabels[item.category]) > 0);

  const categoryCounts = Object.fromEntries(VALID_CATEGORIES.map((c) => [c, 0])) as Record<CategorySlug, number>;
  for (const item of textMatches) categoryCounts[item.category] += 1;

  const filtered =
    query.categories.length > 0 ? textMatches.filter((item) => query.categories.includes(item.category)) : textMatches;

  const matches = sortArtifacts(filtered, query.sort);
  const limit = Math.max(1, query.page) * pageSize;
  return {
    matches,
    visible: matches.slice(0, limit),
    total: matches.length,
    hasMore: matches.length > limit,
    categoryCounts,
  };
}

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function readParam(source: ParamSource, key: string): string | undefined {
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
  const value = source[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Parse untrusted URL parameters into a valid query, dropping anything unrecognised. */
export function parseArchiveParams(source: ParamSource): ArchiveQuery {
  const q = (readParam(source, "q") ?? "").slice(0, 120);
  const categoryParam = readParam(source, "category") ?? "";
  const categories = [
    ...new Set(categoryParam.split(",").map((c) => c.trim()).filter((c): c is CategorySlug => (VALID_CATEGORIES as readonly string[]).includes(c))),
  ];
  const sortParam = readParam(source, "sort");
  const sort = (sortParam && VALID_SORTS.includes(sortParam) ? sortParam : DEFAULT_QUERY.sort) as SortKey;
  const view: ViewMode = readParam(source, "view") === "list" ? "list" : "grid";
  const pageNumber = Number.parseInt(readParam(source, "page") ?? "1", 10);
  const page = Number.isFinite(pageNumber) && pageNumber >= 1 ? Math.min(pageNumber, 50) : 1;
  return { q, categories, sort, view, page };
}

/** Serialise a query to a search string, omitting defaults so URLs stay clean. */
export function serializeArchiveParams(query: ArchiveQuery): string {
  const params = new URLSearchParams();
  const q = query.q.trim();
  if (q) params.set("q", q);
  if (query.categories.length > 0) {
    const ordered = VALID_CATEGORIES.filter((c) => query.categories.includes(c));
    params.set("category", ordered.join(","));
  }
  if (query.sort !== DEFAULT_QUERY.sort) params.set("sort", query.sort);
  if (query.view !== DEFAULT_QUERY.view) params.set("view", query.view);
  if (query.page > 1) params.set("page", String(query.page));
  return params.toString();
}

export function isDefaultQuery(query: ArchiveQuery): boolean {
  return !query.q.trim() && query.categories.length === 0 && query.sort === DEFAULT_QUERY.sort;
}
