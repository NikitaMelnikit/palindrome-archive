import { describe, expect, it } from "vitest";
import { getArtifactSummaries, getCategories } from "@/lib/archive";
import {
  DEFAULT_QUERY,
  PAGE_SIZE,
  normalize,
  parseArchiveParams,
  queryArchive,
  scoreArtifact,
  serializeArchiveParams,
  sortArtifacts,
} from "@/lib/search";

const items = getArtifactSummaries();
const labels = Object.fromEntries(getCategories().map((c) => [c.slug, c.label]));
const run = (overrides: Partial<typeof DEFAULT_QUERY>) => queryArchive(items, { ...DEFAULT_QUERY, ...overrides }, labels);
const byId = (id: string) => items.find((a) => a.id === id)!;

describe("normalize", () => {
  it("lowercases, strips diacritics and collapses whitespace", () => {
    expect(normalize("  Signal   7-Ø ")).toBe("signal 7-o");
    expect(normalize("Café")).toBe("cafe");
  });
});

describe("scoreArtifact", () => {
  it("matches identifiers with or without punctuation", () => {
    const letter = byId("DC-2442-CD");
    expect(scoreArtifact(letter, "DC-2442-CD")).toBeGreaterThan(0);
    expect(scoreArtifact(letter, "dc2442")).toBeGreaterThan(0);
    expect(scoreArtifact(letter, "2442")).toBeGreaterThan(0);
  });

  it("matches title, tags and description, and ranks title above description", () => {
    const quell = byId("PL-0880-LP");
    expect(scoreArtifact(quell, "quell")).toBeGreaterThan(scoreArtifact(byId("SG-0440-GS"), "warmer"));
    expect(scoreArtifact(quell, "atlas")).toBeGreaterThan(0);
  });

  it("requires every token to match (AND semantics)", () => {
    const letter = byId("DC-2442-CD");
    expect(scoreArtifact(letter, "letter 2113")).toBeGreaterThan(0);
    expect(scoreArtifact(letter, "letter volcano")).toBe(0);
  });

  it("returns 1 for an empty query", () => {
    expect(scoreArtifact(byId("OB-2112-BO"), "   ")).toBe(1);
  });
});

describe("queryArchive", () => {
  it("returns everything, newest first, with a first page by default", () => {
    const result = run({});
    expect(result.total).toBe(items.length);
    expect(result.visible).toHaveLength(PAGE_SIZE);
    expect(result.hasMore).toBe(true);
    expect(result.visible[0].id).toBe("DC-2442-CD");
  });

  it("filters by text query", () => {
    const result = run({ q: "quell" });
    expect(result.matches.map((a) => a.id).sort()).toEqual(["DC-1881-CD", "LT-0770-TL", "PL-0880-LP"]);
  });

  it("filters by one or more categories and reports per-category counts for the text query", () => {
    const signals = run({ categories: ["signals"] });
    expect(signals.total).toBe(4);
    expect(signals.matches.every((a) => a.category === "signals")).toBe(true);

    const two = run({ categories: ["signals", "places"] });
    expect(two.total).toBe(8);

    const quell = run({ q: "quell", categories: ["places"] });
    expect(quell.matches.map((a) => a.id)).toEqual(["PL-0880-LP"]);
    expect(quell.categoryCounts.documents).toBe(1);
    expect(quell.categoryCounts["lost-technologies"]).toBe(1);
  });

  it("matches category labels as search terms", () => {
    const result = run({ q: "lost technologies" });
    expect(result.total).toBeGreaterThanOrEqual(4);
  });

  it("paginates with load-more semantics", () => {
    expect(run({ page: 2 }).visible).toHaveLength(PAGE_SIZE * 2);
    const all = run({ page: 3 });
    expect(all.visible).toHaveLength(items.length);
    expect(all.hasMore).toBe(false);
  });

  it("returns an empty result for nonsense", () => {
    const result = run({ q: "xyzzy-not-a-record" });
    expect(result.total).toBe(0);
    expect(result.visible).toEqual([]);
  });
});

describe("sortArtifacts", () => {
  it("sorts oldest, newest and alphabetically", () => {
    expect(sortArtifacts(items, "oldest")[0].id).toBe("LT-0110-TL");
    expect(sortArtifacts(items, "newest")[0].id).toBe("DC-2442-CD");
    const titles = sortArtifacts(items, "title").map((a) => a.title);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
  });
});

describe("URL parameters", () => {
  it("round-trips a query", () => {
    const query = { q: "signal", categories: ["signals" as const, "events" as const], sort: "title" as const, view: "list" as const, page: 2 };
    const parsed = parseArchiveParams(new URLSearchParams(serializeArchiveParams(query)));
    expect(parsed).toEqual({ ...query, categories: ["events", "signals"] });
  });

  it("omits defaults", () => {
    expect(serializeArchiveParams(DEFAULT_QUERY)).toBe("");
  });

  it("drops invalid values from untrusted input", () => {
    const parsed = parseArchiveParams({ category: "signals,bogus,signals", sort: "random", view: "table", page: "-4" });
    expect(parsed).toEqual({ ...DEFAULT_QUERY, categories: ["signals"] });
    expect(parseArchiveParams({ page: "abc" }).page).toBe(1);
    expect(parseArchiveParams({ q: ["first", "second"] }).q).toBe("first");
  });
});
