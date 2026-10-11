"use client";

import { Fragment, useState } from "react";
import { cn } from "@/lib/site";
import type { LayeredDocumentInteraction } from "@/types";

const REDACTION = /\[\[(.+?)\]\]/g;

function countRedactions(lines: string[]) {
  return lines.reduce((total, line) => total + (line.match(REDACTION)?.length ?? 0), 0);
}

function Line({ text, lifted }: { text: string; lifted: boolean }) {
  const parts = text.split(/\[\[(.+?)\]\]/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 0 ? (
          <Fragment key={i}>{part}</Fragment>
        ) : lifted ? (
          <mark key={i} className="hl">
            {part}
          </mark>
        ) : (
          <span
            key={i}
            className="mx-0.5 inline-block h-[0.95em] translate-y-[0.12em] bg-ink align-baseline"
            style={{ width: `${Math.max(3, part.length * 0.55)}em` }}
          >
            <span className="sr-only">[redacted]</span>
          </span>
        ),
      )}
    </>
  );
}

/** A document with layers: lift redactions, reveal marginalia, hold it to the light. */
export function LayeredDocument({ interaction }: { interaction: LayeredDocumentInteraction }) {
  const [layers, setLayers] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setLayers((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const lifted = layers.has("redactions");
  const watermark = layers.has("watermark");
  const redactions = countRedactions(interaction.lines);
  const visibleNotes = interaction.annotations.filter((a) => layers.has(a.layer));

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-4">
        <h3 className="label text-gray">Layers</h3>
        <ul className="mt-4 space-y-2">
          {interaction.layers.map((layer) => {
            const on = layers.has(layer.id);
            return (
              <li key={layer.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(layer.id)}
                  className={cn(
                    "flex w-full items-start gap-4 border p-4 text-left transition-colors",
                    on ? "border-lime bg-lime text-ink" : "border-paper/25 hover:border-paper",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn("mt-0.5 grid size-4 shrink-0 place-items-center border", on ? "border-ink bg-ink" : "border-current")}
                  >
                    {on && <span className="size-1.5 bg-lime" />}
                  </span>
                  <span>
                    <span className="label block">{layer.label}</span>
                    <span className={cn("mt-1 block text-sm leading-snug", on ? "text-ink/75" : "text-paper/65")}>
                      {layer.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="label mt-6 text-gray" aria-live="polite">
          {lifted ? `${redactions} redacted phrases lifted` : `${redactions} phrases redacted`}
          {visibleNotes.length > 0 && ` · ${visibleNotes.length} notes visible`}
        </p>
      </div>

      <div className="lg:col-span-8">
        <div className="relative overflow-hidden bg-[#f6f5f0] px-6 py-8 text-ink shadow-[10px_10px_0_0_rgba(0,0,0,0.35)] sm:px-10 sm:py-12">
          {watermark && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid place-items-center font-display text-[clamp(3rem,10vw,7rem)] font-semibold tracking-tight text-ink/[0.07] uppercase select-none"
              style={{ transform: "rotate(-24deg)" }}
            >
              Palindrome®
            </span>
          )}
          <p className="label relative border-b border-ink/20 pb-3 text-mute">{interaction.heading}</p>
          <div className="relative mt-6 space-y-5">
            {interaction.lines.map((line, index) => {
              const notes = interaction.annotations.filter((a) => a.line === index && layers.has(a.layer));
              return (
                <div key={index} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_12rem] md:gap-6">
                  <p className="serif text-[1.15rem] leading-relaxed sm:text-xl">
                    <Line text={line} lifted={lifted} />
                  </p>
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <p
                        key={note.id}
                        className={cn(
                          "border-l-2 pl-3 text-[0.8rem] leading-snug",
                          note.layer === "watermark" ? "border-mute font-mono text-mute" : note.layer === "stamps" ? "border-alert-ink font-mono text-alert-ink uppercase" : "border-ink italic",
                        )}
                      >
                        {note.text}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
