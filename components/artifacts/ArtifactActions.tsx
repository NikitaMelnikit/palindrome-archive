"use client";

import { Bookmark, BookmarkCheck, Copy, Share2 } from "lucide-react";
import * as m from "motion/react-m";
import { useState } from "react";
import { cabinetStore, useCabinet } from "@/lib/cabinet";
import { absoluteUrl, copyText, shareLink } from "@/lib/share";
import { toast } from "@/lib/toast";

/** Save, share and copy controls. Every action reports its real outcome. */
export function ArtifactActions({ id, slug, title }: { id: string; slug: string; title: string }) {
  const cabinet = useCabinet();
  const ready = cabinet.status !== "pending";
  const saved = cabinet.data.artifacts.some((entry) => entry.id === id);
  const [pulse, setPulse] = useState(0);

  const onSave = () => {
    const result = cabinetStore.toggleArtifact(id);
    setPulse((n) => n + 1);
    if (result.saved) {
      toast(
        result.persisted
          ? `${id} saved to your cabinet.`
          : `${id} saved for this visit only — this browser is blocking local storage.`,
        { tone: result.persisted ? "success" : "info", action: { label: "Open cabinet", href: "/cabinet" } },
      );
    } else {
      toast(`${id} removed from your cabinet.`, { tone: "info" });
    }
  };

  const onShare = async () => {
    const outcome = await shareLink({
      title: `${title} — PALINDROME®`,
      text: `${id}: ${title}, from an archive of things that haven’t happened yet.`,
      url: absoluteUrl(`/archive/${slug}`),
    });
    if (outcome === "copied") toast("Link copied to the clipboard.");
    else if (outcome === "shared") toast("Record shared.");
    else if (outcome === "failed")
      toast("Sharing isn’t available here and the link couldn’t be copied. Copy it from the address bar.", {
        tone: "error",
      });
  };

  const onCopyId = async () => {
    const ok = await copyText(id);
    if (ok) toast(`Identifier ${id} copied.`);
    else toast(`Couldn’t access the clipboard. The identifier is ${id}.`, { tone: "error" });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="btn"
        data-on={saved}
        onClick={onSave}
        disabled={!ready}
        data-cursor={saved ? "Remove" : "Save"}
      >
        <m.span
          key={pulse}
          className="inline-flex"
          initial={pulse ? { scale: 0.6, rotate: -12 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 18 }}
        >
          {saved ? <BookmarkCheck className="size-4" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
        </m.span>
        {saved ? "Saved to cabinet" : "Save to cabinet"}
      </button>
      <button type="button" className="btn" onClick={onShare}>
        <Share2 className="size-4" aria-hidden="true" />
        Share
      </button>
      <button type="button" className="btn" onClick={onCopyId}>
        <Copy className="size-4" aria-hidden="true" />
        Copy ID<span className="sr-only"> {id}</span>
      </button>
    </div>
  );
}
