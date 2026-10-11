"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { cabinetStore, useCabinet } from "@/lib/cabinet";
import { cn } from "@/lib/site";
import { toast } from "@/lib/toast";

export function SaveCollectionButton({ id, title, className }: { id: string; title: string; className?: string }) {
  const cabinet = useCabinet();
  const ready = cabinet.status !== "pending";
  const saved = cabinet.data.collections.some((entry) => entry.id === id);

  const onClick = () => {
    const result = cabinetStore.toggleCollection(id);
    if (result.saved) {
      toast(
        result.persisted ? `“${title}” saved to your cabinet.` : `“${title}” saved for this visit only — local storage is blocked.`,
        { tone: result.persisted ? "success" : "info", action: { label: "Open cabinet", href: "/cabinet" } },
      );
    } else {
      toast(`“${title}” removed from your cabinet.`, { tone: "info" });
    }
  };

  return (
    <button
      type="button"
      className={cn("btn", className)}
      data-on={saved}
      onClick={onClick}
      disabled={!ready}
    >
      {saved ? <BookmarkCheck className="size-4" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
      {saved ? "Saved" : "Save collection"}
      <span className="sr-only">: {title}{saved ? " (select to remove from your cabinet)" : ""}</span>
    </button>
  );
}
