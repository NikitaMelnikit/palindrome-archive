import { describe, expect, it } from "vitest";
import { z } from "zod";
import { artifacts, categories, collections, timelineBranches, timelineEvents } from "@/data";
import { buildIdentifier, isPalindrome } from "@/lib/format";

const TODAY = "2026-10-11";
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const visualization = z.object({
  kind: z.enum(["contour", "city", "rings", "dial", "waveform", "document", "schematic", "shadow", "grid", "particles", "crystal", "strata"]),
  seed: z.number().int(),
  variant: z.number().int().optional(),
  param: z.number().optional(),
  tone: z.enum(["light", "dark"]).optional(),
  alt: z.string().min(20),
});

const artifactSchema = z.object({
  id: z.string().regex(/^[A-Z]{2}-\d{4}-[A-Z]{2}$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  accession: z.number().int().positive(),
  title: z.string().min(3),
  category: z.enum(["objects", "places", "events", "signals", "documents", "lost-technologies"]),
  classification: z.enum(["I", "II", "III", "IV"]),
  description: z.string().min(40).max(260),
  longDescription: z.array(z.string().min(60)).min(2),
  discoveryDate: isoDate,
  apparentDate: z.string().min(3),
  origin: z.string().min(3),
  coordinates: z.object({ psi: z.number().min(0).max(1), lambda: z.number(), dt: z.number().int() }),
  tags: z.array(z.string().min(2)).min(3),
  visualization,
  annotations: z
    .array(z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100), label: z.string(), note: z.string().min(5) }))
    .min(2),
  researchNotes: z.array(z.object({ date: isoDate, author: z.string(), text: z.string().min(10) })).min(2),
  relatedArtifactIds: z.array(z.string()).min(2),
  featured: z.boolean(),
  createdAt: z.iso.datetime(),
  collectionIds: z.array(z.string()),
  timelineIds: z.array(z.string()),
  interaction: z.unknown().optional(),
});

const ids = new Set(artifacts.map((a) => a.id));

describe("artifact dataset", () => {
  it("validates against the schema", () => {
    for (const artifact of artifacts) {
      const result = artifactSchema.safeParse(artifact);
      expect(result.success, `${artifact.id}: ${result.success ? "" : result.error.message}`).toBe(true);
    }
  });

  it("holds at least 24 distinct artifacts with unique ids and slugs", () => {
    expect(artifacts.length).toBeGreaterThanOrEqual(24);
    expect(ids.size).toBe(artifacts.length);
    expect(new Set(artifacts.map((a) => a.slug)).size).toBe(artifacts.length);
    expect(new Set(artifacts.map((a) => a.title)).size).toBe(artifacts.length);
    expect(new Set(artifacts.map((a) => a.description)).size).toBe(artifacts.length);
  });

  it("uses palindromic identifiers derived from category and accession", () => {
    const accessions = artifacts.map((a) => a.accession).sort((a, b) => a - b);
    expect(accessions).toEqual(Array.from({ length: artifacts.length }, (_, i) => i + 1));
    for (const artifact of artifacts) {
      const code = categories.find((c) => c.slug === artifact.category)!.code;
      expect(artifact.id).toBe(buildIdentifier(code, artifact.accession));
      expect(isPalindrome(artifact.id)).toBe(true);
    }
  });

  it("orders accession numbers by discovery date", () => {
    const byAccession = [...artifacts].sort((a, b) => a.accession - b.accession);
    for (let i = 1; i < byAccession.length; i++) {
      expect(byAccession[i].discoveryDate >= byAccession[i - 1].discoveryDate).toBe(true);
    }
  });

  it("documents nothing after today", () => {
    for (const artifact of artifacts) {
      expect(artifact.discoveryDate <= TODAY, artifact.id).toBe(true);
      for (const note of artifact.researchNotes) expect(note.date <= TODAY, `${artifact.id} note`).toBe(true);
    }
  });

  it("covers all six categories", () => {
    expect(categories).toHaveLength(6);
    for (const category of categories) {
      expect(artifacts.some((a) => a.category === category.slug), category.slug).toBe(true);
    }
  });

  it("resolves every related artifact and never relates a record to itself", () => {
    for (const artifact of artifacts) {
      for (const related of artifact.relatedArtifactIds) {
        expect(ids.has(related), `${artifact.id} → ${related}`).toBe(true);
        expect(related).not.toBe(artifact.id);
      }
      expect(new Set(artifact.relatedArtifactIds).size).toBe(artifact.relatedArtifactIds.length);
    }
  });

  it("gives each artifact well-formed annotations and a valid interaction", () => {
    for (const artifact of artifacts) {
      expect(new Set(artifact.annotations.map((a) => a.label)).size).toBe(artifact.annotations.length);
      const interaction = artifact.interaction;
      if (!interaction) continue;
      switch (interaction.type) {
        case "layered-document": {
          const layerIds = new Set(interaction.layers.map((l) => l.id));
          for (const note of interaction.annotations) {
            expect(layerIds.has(note.layer), `${artifact.id} layer ${note.layer}`).toBe(true);
            expect(note.line).toBeGreaterThanOrEqual(0);
            expect(note.line).toBeLessThan(interaction.lines.length);
          }
          break;
        }
        case "coordinate-map":
          expect(new Set(interaction.points.map((p) => p.id)).size).toBe(interaction.points.length);
          for (const p of interaction.points) {
            expect(p.x).toBeGreaterThanOrEqual(0);
            expect(p.x).toBeLessThanOrEqual(100);
            expect(p.y).toBeGreaterThanOrEqual(0);
            expect(p.y).toBeLessThanOrEqual(100);
          }
          break;
        case "timeline-slider":
          expect(interaction.stops.length).toBeGreaterThanOrEqual(2);
          expect([...interaction.stops].sort((a, b) => a.year - b.year)).toEqual(interaction.stops);
          break;
        case "view-mode":
          expect(new Set(interaction.modes.map((m) => m.id)).size).toBe(interaction.modes.length);
          break;
      }
    }
  });

  it("includes several distinct interactive experiences", () => {
    const types = new Set(artifacts.map((a) => a.interaction?.type).filter(Boolean));
    expect(types.size).toBe(4);
  });
});

describe("collections", () => {
  it("has at least five curated collections with unique slugs", () => {
    expect(collections.length).toBeGreaterThanOrEqual(5);
    expect(new Set(collections.map((c) => c.slug)).size).toBe(collections.length);
    expect(new Set(collections.map((c) => c.id)).size).toBe(collections.length);
  });

  it("references only existing artifacts, without duplicates", () => {
    for (const collection of collections) {
      expect(collection.artifactIds.length).toBeGreaterThanOrEqual(3);
      expect(new Set(collection.artifactIds).size).toBe(collection.artifactIds.length);
      for (const id of collection.artifactIds) expect(ids.has(id), `${collection.slug} → ${id}`).toBe(true);
    }
  });

  it("places every artifact in at least one collection, and derives membership consistently", () => {
    for (const artifact of artifacts) {
      expect(artifact.collectionIds.length, artifact.id).toBeGreaterThan(0);
      for (const collectionId of artifact.collectionIds) {
        const collection = collections.find((c) => c.id === collectionId)!;
        expect(collection.artifactIds).toContain(artifact.id);
      }
    }
  });
});

describe("timelines", () => {
  const branchIds = new Set(timelineBranches.map((b) => b.id));

  it("has a consensus line and at least three branches", () => {
    expect(timelineBranches.filter((b) => b.forksFrom === null)).toHaveLength(1);
    expect(timelineBranches.filter((b) => b.forksFrom !== null).length).toBeGreaterThanOrEqual(3);
  });

  it("links events to existing branches and artifacts", () => {
    expect(new Set(timelineEvents.map((e) => e.id)).size).toBe(timelineEvents.length);
    for (const event of timelineEvents) {
      expect(branchIds.has(event.branchId), event.id).toBe(true);
      expect(event.artifactIds.length).toBeGreaterThan(0);
      for (const id of event.artifactIds) expect(ids.has(id), `${event.id} → ${id}`).toBe(true);
      expect(event.certainty).toBeGreaterThan(0);
      expect(event.certainty).toBeLessThanOrEqual(1);
    }
  });

  it("places each branch's events after its fork", () => {
    for (const branch of timelineBranches.filter((b) => b.forkYear !== null)) {
      const events = timelineEvents.filter((e) => e.branchId === branch.id);
      expect(events.length, branch.id).toBeGreaterThanOrEqual(4);
      for (const event of events) expect(event.year, event.id).toBeGreaterThan(branch.forkYear!);
    }
  });

  it("shares the anchor events across every forked branch", () => {
    for (const anchor of ["esker", "letter"]) {
      const branches = new Set(timelineEvents.filter((e) => e.anchorId === anchor).map((e) => e.branchId));
      for (const branch of timelineBranches.filter((b) => b.forksFrom)) expect(branches.has(branch.id), `${anchor}/${branch.id}`).toBe(true);
    }
  });

  it("derives artifact timeline membership from events", () => {
    for (const artifact of artifacts) {
      const expected = new Set(timelineEvents.filter((e) => e.artifactIds.includes(artifact.id)).map((e) => e.branchId));
      expect(new Set(artifact.timelineIds)).toEqual(expected);
    }
  });
});
