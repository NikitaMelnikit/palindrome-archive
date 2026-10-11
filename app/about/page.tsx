import type { Metadata } from "next";
import Link from "next/link";
import { IdentifierBuilder } from "@/components/about/IdentifierBuilder";
import { ArtifactCard } from "@/components/archive/ArtifactCard";
import { classifications } from "@/data/categories";
import { getAllArtifacts, getArtifactById, getCategories, getCategory, toSummary } from "@/lib/archive";
import { pad } from "@/lib/format";

export const metadata: Metadata = {
  title: "About the Institute",
  description:
    "The manifesto of the (fictional) Palindrome Institute: its philosophy, classification system, how discoveries are documented, and how archive identifiers work.",
  alternates: { canonical: "/about" },
};

const THESES = [
  {
    title: "Evidence can arrive early.",
    body: "Most archives keep what has already happened. This one keeps what has not happened yet, on the assumption that the future is as careless with its belongings as the past.",
  },
  {
    title: "Documentation is not proof.",
    body: "Every record is a careful description of something that cannot be verified. We describe precisely so that you can disagree precisely.",
  },
  {
    title: "Every branch is somebody’s history.",
    body: "We do not rank versions of events. The consensus line is simply the one most people happen to share.",
  },
  {
    title: "Identifiers must read both ways.",
    body: "We do not assume which direction time runs. Every identifier in the archive is a palindrome, so it can be filed from either end.",
  },
  {
    title: "Nothing here is real.",
    body: "The Institute, its staff and every artifact are fiction. The archive is an exercise in looking carefully at things that cannot exist.",
  },
];

const PROCESS = [
  { step: "Detection", body: "A report, an object or a signal reaches the archive, usually by post, sometimes by accident." },
  { step: "Accession", body: "The record receives the next accession number and a palindromic identifier, and its date of documentation is fixed." },
  { step: "Corroboration", body: "Independent desks try to make the record behave the same way twice. The result sets its classification." },
  { step: "Release", body: "The record enters the public index with its notes, its coordinates and every branch it touches." },
];

export default function AboutPage() {
  const categories = getCategories();
  const records = getAllArtifacts().map((a) => ({ id: a.id, slug: a.slug, title: a.title }));
  const notable = ["DC-2442-CD", "OB-2112-BO", "PL-0880-LP"].map((id) => getArtifactById(id)!);

  return (
    <>
      <header className="shell overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-24">
        <div className="label flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-3 text-mute">
          <span className="text-ink">Index 05 / About the Institute</span>
          <span>Manifesto · revision 2442</span>
        </div>
        <h1 className="display mt-10 max-w-[14ch] text-[clamp(3rem,9vw,9.5rem)]">
          An archive of things that <span className="hl">haven’t happened</span> yet.
        </h1>
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <p className="serif dropcap text-[1.45rem] leading-[1.45] lg:col-span-6">
            The Palindrome Institute was founded — in this branch — to keep evidence that arrives before its cause: letters
            dated next century, photographs of cities still under construction, signals answered before they are sent. It
            does not try to explain them. It tries to describe them well enough that someone, later, can.
          </p>
          <p className="text-lg leading-relaxed text-ink/80 lg:col-span-4 lg:col-start-9">
            The Institute is fictional. So is everything it holds. PALINDROME® is a speculative editorial project: an
            archive designed to be read slowly, with the same attention a real collection deserves.
          </p>
        </div>
      </header>

      <section aria-labelledby="theses-title" className="border-t border-ink">
        <div className="shell py-16 lg:py-24">
          <h2 id="theses-title" className="label">
            Philosophy · five theses
          </h2>
          <ol className="mt-8">
            {THESES.map((thesis, i) => (
              <li key={thesis.title} className="grid gap-4 border-b border-ink/15 py-8 md:grid-cols-12 md:gap-8">
                <span className="display text-6xl text-ink/20 tnum md:col-span-2">{pad(i + 1)}</span>
                <h3 className="display-tight text-[clamp(1.75rem,3.2vw,2.75rem)] md:col-span-5">{thesis.title}</h3>
                <p className="serif text-xl leading-snug md:col-span-5">{thesis.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="classification-title" className="border-t border-ink/15 bg-paper-2">
        <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="lg:col-span-4">
            <h2 id="classification-title" className="display text-[clamp(2.5rem,5vw,4.5rem)]">
              Classification
            </h2>
            <p className="serif mt-6 text-xl leading-snug">
              Each record carries a category, which says what it is, and a class, which says how far it can be trusted
              to stay that way.
            </p>
          </div>
          <div className="space-y-12 lg:col-span-7 lg:col-start-6">
            <div>
              <h3 className="label border-b border-ink pb-2">Classes of reliability</h3>
              <dl>
                {Object.values(classifications).map((c) => (
                  <div key={c.level} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-4 border-b border-ink/15 py-4 sm:grid-cols-[4rem_10rem_minmax(0,1fr)]">
                    <dt className="font-display text-3xl leading-none">{c.level}</dt>
                    <dd className="label pt-1">{c.label}</dd>
                    <dd className="col-start-2 text-[0.95rem] leading-relaxed sm:col-start-3">{c.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="label border-b border-ink pb-2">Categories</h3>
              <ul className="grid sm:grid-cols-2">
                {categories.map((c) => (
                  <li key={c.slug} className="border-b border-ink/15 py-4 sm:odd:pr-6 sm:even:pl-6">
                    <Link href={`/archive?category=${c.slug}`} className="group block">
                      <span className="label flex justify-between">
                        <span className="text-mute">{c.code}</span>
                        <span className="text-mute">{c.code.split("").reverse().join("")}</span>
                      </span>
                      <span className="mt-1 block font-display text-xl font-medium tracking-tight">
                        <span className="link-u">{c.label}</span>
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink/75">{c.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="process-title" className="border-t border-ink/15">
        <div className="shell py-16 lg:py-24">
          <h2 id="process-title" className="display text-[clamp(2.5rem,5vw,4.5rem)]">
            How a discovery is documented
          </h2>
          <ol className="mt-12 grid gap-px bg-ink sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <li key={p.step} className="flex flex-col gap-6 bg-paper p-6 lg:min-h-72">
                <span className="label text-mute tnum">Stage {pad(i + 1)}</span>
                <h3 className="display-tight text-3xl">{p.step}</h3>
                <p className="mt-auto text-[0.95rem] leading-relaxed text-ink/80">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="identifier-title" className="on-dark">
        <div className="shell py-16 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="label text-gray">Anatomy of an identifier</p>
              <h2 id="identifier-title" className="display mt-5 text-[clamp(2.5rem,6vw,5.5rem)]">
                Readable from either end.
              </h2>
            </div>
            <p className="serif self-end text-xl leading-snug text-paper/80 lg:col-span-5 lg:col-start-8">
              Every identifier is built from the category code, the accession number written forwards then backwards, and
              the category code mirrored. The result is always a palindrome.
            </p>
          </div>

          <figure className="mt-14" aria-labelledby="anatomy-caption">
            <div className="grid grid-cols-5 gap-1 font-mono text-[clamp(1.6rem,7.5vw,6.5rem)] leading-none tnum" aria-hidden="true">
              {[
                { part: "OB", note: "Category code", sub: "Objects" },
                { part: "21", note: "Accession", sub: "the 21st record" },
                { part: "12", note: "Accession, mirrored", sub: "read backwards" },
                { part: "BO", note: "Code, mirrored", sub: "closes the loop" },
              ].map((p, i) => (
                <div key={p.note} className="min-w-0">
                  <span className={i === 0 || i === 3 ? "text-lime" : i === 2 ? "text-paper/60" : undefined}>{p.part}</span>
                  <span className="mt-4 block border-t border-paper/30 pt-2 font-sans text-[0.7rem] tracking-[0.08em] text-gray uppercase">
                    {p.note}
                  </span>
                  <span className="mt-1 block font-sans text-[0.7rem] tracking-[0.04em] text-paper/60">{p.sub}</span>
                </div>
              ))}
              <div>
                <span className="text-paper/30">=</span>
                <span className="mt-4 block border-t border-paper/30 pt-2 font-sans text-[0.7rem] tracking-[0.08em] text-gray uppercase">
                  Result
                </span>
                <span className="mt-1 block font-sans text-[0.7rem] tracking-[0.04em] text-paper/60">OB-2112-BO</span>
              </div>
            </div>
            <figcaption id="anatomy-caption" className="sr-only">
              The identifier OB-2112-BO is made of the category code OB, the accession number 21, the same number reversed,
              12, and the category code reversed, BO.
            </figcaption>
          </figure>

          <div className="mt-16 border-t border-paper/20 pt-12">
            <h3 className="label mb-8 text-gray">Try it — compose an identifier</h3>
            <IdentifierBuilder categories={categories} records={records} />
          </div>

          <div className="mt-16 grid gap-6 border-t border-paper/20 pt-10 md:grid-cols-3">
            {[
              { sym: "ψ", name: "Phase", body: "Distance from the consensus line, from 0 (shared by everyone) to 1 (shared by no one)." },
              { sym: "λ", name: "Drift", body: "The bearing along which a record’s evidence keeps arriving. Mostly bookkeeping." },
              { sym: "Δt", name: "Offset", body: "How many years ahead of, or behind, its documentation a record appears to be." },
            ].map((c) => (
              <div key={c.name}>
                <p className="font-display text-5xl leading-none text-lime">{c.sym}</p>
                <p className="label mt-4">{c.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-paper/75">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="notable-title" className="border-t border-ink/15">
        <div className="shell py-16 lg:py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 id="notable-title" className="display text-[clamp(2.5rem,6vw,5rem)]">
              Notable discoveries
            </h2>
            <Link href="/archive" className="btn btn-solid">
              Return to the archive <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {notable.map((artifact) => (
              <li key={artifact.id}>
                <ArtifactCard artifact={toSummary(artifact)} categoryLabel={getCategory(artifact.category).label} />
              </li>
            ))}
          </ul>
          <p className="label mt-16 max-w-2xl leading-relaxed text-mute">
            Disclaimer · The Palindrome Institute, its archive, staff, places, events and artifacts are works of fiction.
            No research, discovery or scientific claim on this site is real, and any resemblance to actual places or
            institutions is coincidental.
          </p>
        </div>
      </section>
    </>
  );
}
