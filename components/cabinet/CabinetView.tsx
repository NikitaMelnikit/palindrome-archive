"use client";

import { ArrowUpRight, Download, Trash2, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtifactCard } from "@/components/archive/ArtifactCard";
import { cabinetStore, useCabinet } from "@/lib/cabinet";
import { formatDate, pad } from "@/lib/format";
import { CABINET_BACKUP_KEY, type CabinetEntry } from "@/lib/storage";
import { toast } from "@/lib/toast";
import type { ArtifactSummary, CategorySlug, CollectionSummary } from "@/types";

function resolve<T extends { id: string }>(entries: CabinetEntry[], index: Map<string, T>) {
  const found: { entry: CabinetEntry; item: T }[] = [];
  const missing: CabinetEntry[] = [];
  for (const entry of entries) {
    const item = index.get(entry.id);
    if (item) found.push({ entry, item });
    else missing.push(entry);
  }
  return { found, missing };
}

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDate(iso)} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * The visitor's personal cabinet. Stored only in this browser (localStorage); there is no account
 * and nothing is synchronised.
 */
export function CabinetView({
  artifacts,
  collections,
  categoryLabels,
}: {
  artifacts: ArtifactSummary[];
  collections: CollectionSummary[];
  categoryLabels: Record<CategorySlug, string>;
}) {
  const cabinet = useCabinet();
  const confirmRef = useRef<HTMLDialogElement>(null);
  const artifactIndex = new Map(artifacts.map((a) => [a.id, a]));
  const collectionIndex = new Map(collections.map((c) => [c.id, c]));

  const savedArtifacts = resolve(cabinet.data.artifacts, artifactIndex);
  const savedCollections = resolve(cabinet.data.collections, collectionIndex);
  const recent = resolve(cabinet.data.recent, artifactIndex);
  const missingCount = savedArtifacts.missing.length + savedCollections.missing.length;
  const hasSaved = savedArtifacts.found.length + savedCollections.found.length > 0;
  const hasAnything = hasSaved || recent.found.length > 0 || missingCount > 0;

  const exportJson = () => {
    try {
      const origin = window.location.origin;
      const payload = {
        format: "palindrome-cabinet",
        version: 1,
        exportedAt: new Date().toISOString(),
        note: "A local export of saved PALINDROME® references. All records are fiction.",
        savedArtifacts: savedArtifacts.found.map(({ entry, item }) => ({
          id: item.id,
          title: item.title,
          url: `${origin}/archive/${item.slug}`,
          savedAt: entry.at,
        })),
        savedCollections: savedCollections.found.map(({ entry, item }) => ({
          id: item.id,
          code: item.code,
          title: item.title,
          url: `${origin}/collections/${item.slug}`,
          savedAt: entry.at,
        })),
        recentlyViewed: recent.found.map(({ entry, item }) => ({ id: item.id, title: item.title, viewedAt: entry.at })),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const filename = `palindrome-cabinet-${new Date().toISOString().slice(0, 10)}.json`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      const count = payload.savedArtifacts.length + payload.savedCollections.length;
      toast(`Exported ${count} saved ${count === 1 ? "reference" : "references"} as ${filename}.`);
    } catch {
      toast("The export could not be created in this browser.", { tone: "error" });
    }
  };

  const clearAll = () => {
    const result = cabinetStore.clearAll();
    confirmRef.current?.close();
    toast(result.persisted ? "Your cabinet has been cleared." : "Cleared for this visit. Browser storage is unavailable.", {
      tone: "info",
    });
  };

  const removeMissing = () => {
    for (const entry of savedArtifacts.missing) cabinetStore.removeArtifact(entry.id);
    for (const entry of savedCollections.missing) cabinetStore.removeCollection(entry.id);
    toast(`Removed ${missingCount} unavailable ${missingCount === 1 ? "reference" : "references"}.`, { tone: "info" });
  };

  if (cabinet.status === "pending") {
    return (
      <div className="shell py-16" aria-busy="true">
        <p className="label text-mute">Opening your cabinet…</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse bg-paper-3/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {cabinet.status === "unavailable" && (
        <div className="shell" role="status">
          <div className="mt-6 flex items-start gap-4 border border-ink bg-paper-2 p-4">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p className="text-sm leading-relaxed">
              <strong className="font-medium">This browser isn’t allowing local storage.</strong> You can still save
              records, but they will only last until you close this tab.
            </p>
          </div>
        </div>
      )}
      {cabinet.status === "recovered" && (
        <div className="shell" role="status">
          <div className="mt-6 flex items-start gap-4 border border-ink bg-paper-2 p-4">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm leading-relaxed">
              <strong className="font-medium">Your saved cabinet data was unreadable and has been reset.</strong> A copy
              of the damaged data was kept in this browser under <code className="font-mono text-xs">{CABINET_BACKUP_KEY}</code>.
            </p>
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center"
              onClick={() => cabinetStore.acknowledgeRecovery()}
              aria-label="Dismiss notice"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="sticky top-14 z-20 mt-8 border-y border-ink/15 bg-paper">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-3">
          <dl className="label flex flex-wrap gap-x-6 gap-y-1">
            <div className="flex gap-2">
              <dt className="text-mute">Records</dt>
              <dd className="tnum">{pad(savedArtifacts.found.length)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-mute">Collections</dt>
              <dd className="tnum">{pad(savedCollections.found.length)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-mute">Recently viewed</dt>
              <dd className="tnum">{pad(recent.found.length)}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={exportJson} disabled={!hasSaved}>
              <Download className="size-4" aria-hidden="true" /> Export JSON
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => confirmRef.current?.showModal()}
              disabled={!hasAnything}
              aria-haspopup="dialog"
            >
              <Trash2 className="size-4" aria-hidden="true" /> Clear all
            </button>
          </div>
        </div>
      </div>

      <dialog ref={confirmRef} className="modal-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
        <div className="p-6">
          <p className="label text-alert-ink">Irreversible</p>
          <h2 id="confirm-title" className="display-tight mt-3 text-3xl">
            Clear your cabinet?
          </h2>
          <p id="confirm-desc" className="mt-3 leading-relaxed text-ink/80">
            This removes {savedArtifacts.found.length} saved {savedArtifacts.found.length === 1 ? "record" : "records"},{" "}
            {savedCollections.found.length} {savedCollections.found.length === 1 ? "collection" : "collections"} and your
            viewing history from this browser. It cannot be undone.
          </p>
          <div className="mt-8 flex flex-wrap justify-end gap-2">
            <button type="button" className="btn" onClick={() => confirmRef.current?.close()} autoFocus>
              Keep everything
            </button>
            <button type="button" className="btn btn-solid" onClick={clearAll}>
              Clear everything
            </button>
          </div>
        </div>
      </dialog>

      <div className="shell py-12 lg:py-16">
        {missingCount > 0 && (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border border-ink/30 p-4">
            <p className="text-sm">
              {missingCount} saved {missingCount === 1 ? "reference no longer exists" : "references no longer exist"} in the
              archive.
            </p>
            <button type="button" className="btn" onClick={removeMissing}>
              Remove {missingCount === 1 ? "it" : "them"}
            </button>
          </div>
        )}

        {!hasSaved ? (
          <section aria-labelledby="empty-title" className="grid gap-10 border-t border-ink py-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 id="empty-title" className="display text-[clamp(3rem,8vw,7rem)]">
                The cabinet is empty.
              </h2>
              <p className="serif mt-6 max-w-lg text-2xl leading-snug italic">
                Save records and collections as you explore, and they will wait for you here — in this browser, on this
                device.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/archive" className="btn btn-solid">
                  Explore the archive <span aria-hidden="true">→</span>
                </Link>
                <Link href="/collections" className="btn">
                  Browse collections
                </Link>
              </div>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <ArtifactArt visualization={{ kind: "grid", seed: 7, variant: 2, tone: "light", alt: "" }} decorative />
            </div>
          </section>
        ) : (
          <>
            <section aria-labelledby="saved-records-title">
              <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
                <h2 id="saved-records-title" className="display-tight text-3xl">
                  Saved records
                </h2>
                <span className="label text-mute tnum">{pad(savedArtifacts.found.length)}</span>
              </div>
              {savedArtifacts.found.length === 0 ? (
                <p className="py-8 text-mute">
                  No records saved yet.{" "}
                  <Link href="/archive" className="link-u text-ink">
                    Find some in the archive.
                  </Link>
                </p>
              ) : (
                <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                  {savedArtifacts.found.map(({ entry, item }) => (
                    <li key={item.id}>
                      <ArtifactCard artifact={item} categoryLabel={categoryLabels[item.category]} />
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/15 pt-3">
                        <span className="label text-mute">Saved {formatDate(entry.at)}</span>
                        <button
                          type="button"
                          className="label link-u relative z-10 flex min-h-11 items-center gap-1.5"
                          onClick={() => {
                            cabinetStore.removeArtifact(item.id);
                            toast(`${item.id} removed from your cabinet.`, { tone: "info" });
                          }}
                          aria-label={`Remove ${item.title} from your cabinet`}
                        >
                          <X className="size-3.5" aria-hidden="true" /> Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="saved-collections-title" className="mt-20">
              <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
                <h2 id="saved-collections-title" className="display-tight text-3xl">
                  Saved collections
                </h2>
                <span className="label text-mute tnum">{pad(savedCollections.found.length)}</span>
              </div>
              {savedCollections.found.length === 0 ? (
                <p className="py-8 text-mute">
                  No collections saved yet.{" "}
                  <Link href="/collections" className="link-u text-ink">
                    Browse the collections.
                  </Link>
                </p>
              ) : (
                <ul>
                  {savedCollections.found.map(({ entry, item }) => (
                    <li key={item.id} className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-ink/15 py-4 sm:grid-cols-[5rem_4rem_minmax(0,1fr)_auto_auto]">
                      <div className="w-16">
                        <ArtifactArt visualization={item.visualization} detail="thumb" decorative />
                      </div>
                      <span className="label hidden text-mute sm:block">{item.code}</span>
                      <Link href={`/collections/${item.slug}`} className="group min-w-0">
                        <span className="font-display text-xl leading-tight font-medium tracking-tight">
                          <span className="link-u">{item.title}</span>
                        </span>
                        <span className="label mt-1 block text-mute">
                          {pad(item.artifactCount)} records · saved {formatDate(entry.at)}
                        </span>
                      </Link>
                      <ArrowUpRight className="hidden size-4 sm:block" aria-hidden="true" />
                      <button
                        type="button"
                        className="label link-u flex min-h-11 items-center gap-1.5"
                        onClick={() => {
                          cabinetStore.removeCollection(item.id);
                          toast(`“${item.title}” removed from your cabinet.`, { tone: "info" });
                        }}
                        aria-label={`Remove collection ${item.title} from your cabinet`}
                      >
                        <X className="size-3.5" aria-hidden="true" /> Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        <section aria-labelledby="recent-viewed-title" className="mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ink pb-3">
            <h2 id="recent-viewed-title" className="display-tight text-3xl">
              Recently viewed
            </h2>
            {recent.found.length > 0 && (
              <button
                type="button"
                className="label link-u text-mute"
                onClick={() => {
                  cabinetStore.clearRecent();
                  toast("Viewing history cleared.", { tone: "info" });
                }}
              >
                Clear history
              </button>
            )}
          </div>
          {recent.found.length === 0 ? (
            <p className="py-8 text-mute">Records you open will be listed here, most recent first.</p>
          ) : (
            <ol className="-mx-4 mt-6 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-8 lg:overflow-visible lg:px-0">
              {recent.found.map(({ entry, item }) => (
                <li key={item.id} className="w-36 shrink-0 snap-start lg:w-auto">
                  <Link href={`/archive/${item.slug}`} className="group block">
                    <ArtifactArt visualization={item.visualization} detail="thumb" decorative />
                    <span className="label mt-2 block text-mute tnum">{item.id}</span>
                    <span className="mt-1 block text-sm leading-snug font-medium">
                      <span className="link-u">{item.title}</span>
                    </span>
                    <span className="label mt-1 block text-mute">{formatTime(entry.at)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
