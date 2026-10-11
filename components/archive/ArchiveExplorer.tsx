"use client";

import { LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SegmentedControl } from "@/components/interactions/SegmentedControl";
import { pad } from "@/lib/format";
import {
  DEFAULT_QUERY,
  PAGE_SIZE,
  SORT_OPTIONS,
  isDefaultQuery,
  parseArchiveParams,
  queryArchive,
  serializeArchiveParams,
  type ArchiveQuery,
  type SortKey,
  type ViewMode,
} from "@/lib/search";
import { cn } from "@/lib/site";
import type { ArtifactSummary, Category, CategorySlug } from "@/types";
import { ArtifactCard, ArtifactRow } from "./ArtifactCard";

const SUGGESTIONS = ["2113", "signal", "map", "Kessel", "SG-2332"];

/**
 * The searchable archive. All state lives in the URL (?q, category, sort, view, page), so filtered
 * views can be bookmarked and the browser's back and forward buttons step through them.
 */
export function ArchiveExplorer({ items, categories }: { items: ArtifactSummary[]; categories: Category[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // Animate records only after the visitor changes the query, never on first load.
  const [interacted, setInteracted] = useState(false);
  const query = useMemo(() => parseArchiveParams(new URLSearchParams(searchParams.toString())), [searchParams]);
  const labels = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c.label])) as Record<CategorySlug, string>,
    [categories],
  );
  const result = useMemo(() => queryArchive(items, query, labels), [items, query, labels]);

  const inputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDialogElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);
  const focusFromRef = useRef<number | null>(null);

  const commit = (next: ArchiveQuery, mode: "push" | "replace" = "push") => {
    setInteracted(true);
    const search = serializeArchiveParams(next);
    const url = search ? `${pathname}?${search}` : pathname;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  };

  // Keep the tab title in step with the query, matching the server-rendered title.
  useEffect(() => {
    const q = query.q.trim();
    const chosen = query.categories.map((slug) => labels[slug]);
    const title = q ? `Search: “${q}”` : chosen.length > 0 ? `Archive — ${chosen.join(", ")}` : "The Archive";
    document.title = `${title} — PALINDROME®`;
  }, [query.q, query.categories, labels]);

  // Keep the uncontrolled search field in step with the URL when it changes from outside (back/forward).
  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement !== input && input.value !== query.q) input.value = query.q;
  }, [query.q]);

  // After "load more", move focus to the first newly revealed record.
  useEffect(() => {
    const from = focusFromRef.current;
    if (from === null) return;
    focusFromRef.current = null;
    resultsRef.current?.querySelector<HTMLAnchorElement>(`[data-index="${from}"] a`)?.focus();
  }, [result.visible.length]);

  useEffect(() => () => window.clearTimeout(debounceRef.current), []);

  const onSearchInput = (value: string) => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => commit({ ...query, q: value, page: 1 }, "replace"), 180);
  };

  const clearSearch = () => {
    window.clearTimeout(debounceRef.current);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    commit({ ...query, q: "", page: 1 });
  };

  const toggleCategory = (slug: CategorySlug) => {
    const categoriesNext = query.categories.includes(slug)
      ? query.categories.filter((c) => c !== slug)
      : [...query.categories, slug];
    commit({ ...query, categories: categoriesNext, page: 1 });
  };

  const resetAll = () => {
    window.clearTimeout(debounceRef.current);
    if (inputRef.current) inputRef.current.value = "";
    commit({ ...DEFAULT_QUERY, view: query.view });
  };

  const loadMore = () => {
    focusFromRef.current = result.visible.length;
    commit({ ...query, page: query.page + 1 }, "replace");
  };

  const activeFilters = query.categories.length + (query.q.trim() ? 1 : 0);
  // Discrete changes (category, sort) re-stage the list; typing only animates newly matching records.
  const listKey = serializeArchiveParams({ ...query, q: "", page: 1, view: "grid" });

  const categoryControls = (layout: "row" | "stack") => (
    <div
      role="group"
      aria-label="Filter by category"
      className={cn(layout === "row" ? "flex flex-wrap gap-2" : "grid grid-cols-1 gap-2")}
    >
      <button
        type="button"
        className="chip"
        aria-pressed={query.categories.length === 0}
        onClick={() => commit({ ...query, categories: [], page: 1 })}
      >
        All <span className="tnum opacity-70">{pad(Object.values(result.categoryCounts).reduce((a, b) => a + b, 0))}</span>
      </button>
      {categories.map((category) => {
        const count = result.categoryCounts[category.slug];
        return (
          <button
            key={category.slug}
            type="button"
            className={cn("chip", layout === "stack" && "justify-between")}
            aria-pressed={query.categories.includes(category.slug)}
            onClick={() => toggleCategory(category.slug)}
          >
            <span>{category.label}</span>
            <span className="tnum opacity-70">{pad(count)}</span>
          </button>
        );
      })}
    </div>
  );

  const sortControl = (id: string) => (
    <label className="label flex items-center gap-3" htmlFor={id}>
      <span className="text-mute">Sort</span>
      <select
        id={id}
        className="select"
        value={query.sort}
        onChange={(event) => commit({ ...query, sort: event.target.value as SortKey, page: 1 })}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  if (items.length === 0) {
    return (
      <div className="shell py-24" role="alert">
        <p className="label text-alert-ink">Index unavailable</p>
        <p className="display-tight mt-4 text-4xl">The archive index could not be loaded.</p>
        <p className="mt-4 text-mute">Reload the page to try again. Saved items in your cabinet are unaffected.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="shell">
        <form
          role="search"
          className="relative"
          onSubmit={(event) => {
            event.preventDefault();
            window.clearTimeout(debounceRef.current);
            commit({ ...query, q: inputRef.current?.value ?? "", page: 1 });
          }}
        >
          <label htmlFor="archive-search" className="label text-mute">
            Search the record — title, identifier, description or tag
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute top-1/2 right-0 hidden size-6 -translate-y-1/2 text-mute sm:block" aria-hidden="true" />
            <input
              ref={inputRef}
              id="archive-search"
              name="q"
              type="search"
              defaultValue={query.q}
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. 2113, signal, PL-0880"
              className="field"
              onChange={(event) => onSearchInput(event.target.value)}
            />
            {query.q && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute top-1/2 right-0 grid size-11 -translate-y-1/2 place-items-center bg-paper sm:right-9"
                aria-label="Clear search"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="sticky top-14 z-30 mt-8 border-y border-ink/15 bg-paper">
        <div className="shell flex items-center justify-between gap-4 py-3">
          <div className="hidden min-w-0 lg:block">{categoryControls("row")}</div>
          <button
            type="button"
            className="chip lg:hidden"
            aria-haspopup="dialog"
            aria-controls="archive-filters"
            onClick={() => filtersRef.current?.showModal()}
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            Filters{query.categories.length > 0 && <span className="tnum">({query.categories.length})</span>}
          </button>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden sm:block">{sortControl("archive-sort")}</div>
            <SegmentedControl<ViewMode>
              label="Display mode"
              value={query.view}
              onChange={(view) => commit({ ...query, view }, "replace")}
              className="gap-0"
              optionClassName="-ml-px px-2.5"
              options={[
                { value: "grid", ariaLabel: "Grid view", label: <LayoutGrid className="size-4" aria-hidden="true" /> },
                { value: "list", ariaLabel: "List view", label: <Rows3 className="size-4" aria-hidden="true" /> },
              ]}
            />
          </div>
        </div>
      </div>

      <dialog id="archive-filters" ref={filtersRef} className="sheet-dialog" aria-labelledby="filters-title">
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-4">
          <h2 id="filters-title" className="label">
            Filter the archive
          </h2>
          <button
            type="button"
            className="grid size-11 place-items-center"
            onClick={() => filtersRef.current?.close()}
            aria-label="Close filters"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-6 overflow-y-auto px-5 py-5">
          {categoryControls("stack")}
          {sortControl("archive-sort-mobile")}
        </div>
        <div className="border-t border-ink/15 px-5 py-4">
          <button type="button" className="btn btn-solid w-full" onClick={() => filtersRef.current?.close()}>
            Show {result.total} {result.total === 1 ? "record" : "records"}
          </button>
        </div>
      </dialog>

      <div className="shell py-10 lg:py-14" ref={resultsRef}>
        <h2 className="sr-only">Records</h2>
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <p className="label" aria-live="polite">
            {result.total === 0
              ? "No records match"
              : `Showing ${pad(result.visible.length)} of ${pad(result.total)} ${result.total === 1 ? "record" : "records"}`}
            {query.q.trim() && <span className="text-mute"> for “{query.q.trim()}”</span>}
          </p>
          {!isDefaultQuery(query) && (
            <button type="button" onClick={resetAll} className="label link-u text-mute">
              Reset {activeFilters > 0 ? `${activeFilters} ${activeFilters === 1 ? "filter" : "filters"}` : "sorting"}
            </button>
          )}
        </div>

        {result.total === 0 ? (
          <div className="grid gap-10 border-t border-ink py-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="display text-[clamp(3rem,9vw,7.5rem)]">Silence.</p>
              <p className="serif mt-6 max-w-md text-2xl leading-snug italic">
                This query returned nothing — which, in this archive, is not the same as nothing being there.
              </p>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="label text-mute">Try instead</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion}>
                    <Link href={`/archive?q=${encodeURIComponent(suggestion)}`} className="chip">
                      {suggestion}
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={resetAll} className="btn btn-solid mt-8">
                Clear all filters
              </button>
            </div>
          </div>
        ) : query.view === "grid" ? (
          <ul key={listKey} className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:[&>li:nth-child(3n+2)]:mt-14">
            {result.visible.map((artifact, index) => (
              <m.li
                key={artifact.id}
                data-index={index}
                initial={interacted ? { opacity: 0, y: 14 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: (index % PAGE_SIZE) * 0.035, ease: [0.2, 0.7, 0.1, 1] }}
              >
                <ArtifactCard artifact={artifact} categoryLabel={labels[artifact.category]} />
              </m.li>
            ))}
          </ul>
        ) : (
          <ul key={listKey} className="border-t border-ink">
            {result.visible.map((artifact, index) => (
              <m.li
                key={artifact.id}
                data-index={index}
                initial={interacted ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: (index % PAGE_SIZE) * 0.025 }}
              >
                <ArtifactRow artifact={artifact} categoryLabel={labels[artifact.category]} />
              </m.li>
            ))}
          </ul>
        )}

        {result.hasMore && (
          <div className="mt-16 flex flex-col items-center gap-3 border-t border-ink/15 pt-10">
            <button type="button" onClick={loadMore} className="btn">
              Load {pad(Math.min(PAGE_SIZE, result.total - result.visible.length))} more records
            </button>
            <p className="label text-mute">
              {pad(result.visible.length)} / {pad(result.total)} shown
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
