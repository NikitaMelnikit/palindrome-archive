"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { buildIdentifier, isPalindrome, mirrorCode, pad } from "@/lib/format";
import type { Category } from "@/types";

/** Compose an identifier from a category and accession number, and check it against the archive. */
export function IdentifierBuilder({
  categories,
  records,
}: {
  categories: Category[];
  records: { id: string; slug: string; title: string }[];
}) {
  const [code, setCode] = useState(categories[0].code);
  const [accession, setAccession] = useState(21);
  const categoryId = useId();
  const accessionId = useId();

  const identifier = buildIdentifier(code, accession);
  const match = records.find((r) => r.id === identifier);
  const forwards = pad(accession);
  const backwards = forwards.split("").reverse().join("");

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <form className="space-y-6 lg:col-span-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor={categoryId} className="label text-gray">
            Category
          </label>
          <select
            id={categoryId}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="select mt-2 w-full border-paper/40 bg-void text-paper [background-image:none]"
          >
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={accessionId} className="label text-gray">
            Accession number (1–99)
          </label>
          <input
            id={accessionId}
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={accession}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value, 10);
              setAccession(Number.isFinite(value) ? Math.min(99, Math.max(1, value)) : 1);
            }}
            className="mt-2 w-full border border-paper/40 bg-transparent px-3 py-2 font-mono text-lg tnum"
          />
        </div>
      </form>

      <div className="lg:col-span-7 lg:col-start-6" aria-live="polite">
        <p className="font-mono text-[clamp(2.25rem,7vw,5.5rem)] leading-none tracking-tight tnum">
          <span className="text-lime">{code}</span>
          <span className="text-gray">-</span>
          <span>{forwards}</span>
          <span className="text-paper/60">{backwards}</span>
          <span className="text-gray">-</span>
          <span className="text-lime">{mirrorCode(code)}</span>
        </p>
        <p className="label mt-5 text-gray">
          {isPalindrome(identifier) ? "Reads the same in both directions ✓" : "Not a palindrome"}
          {" · "}
          {identifier.split("").reverse().join("")}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-paper/85">
          {match ? (
            <>
              This identifier is on record:{" "}
              <Link href={`/archive/${match.slug}`} className="link-u text-lime">
                {match.title}
              </Link>
              .
            </>
          ) : (
            "No record holds this identifier yet. It is reserved for whatever arrives next."
          )}
        </p>
      </div>
    </div>
  );
}
