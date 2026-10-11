import Link from "next/link";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtFrame } from "@/components/art/ArtFrame";
import { getCategory } from "@/lib/archive";
import { formatDate, pad } from "@/lib/format";
import { cn } from "@/lib/site";
import type { Artifact } from "@/types";

const OFFSETS = ["lg:mt-0", "lg:mt-28", "lg:mt-10", "lg:mt-40", "lg:mt-16"];

export function RecentlyUncovered({ artifacts }: { artifacts: Artifact[] }) {
  return (
    <section aria-labelledby="recent-title" className="overflow-hidden border-b border-ink/15">
      <div className="shell py-20 lg:py-28">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="label text-mute">Section 01 / Accessions</p>
            <h2 id="recent-title" className="display reveal mt-5 text-[clamp(3rem,10vw,10.5rem)]">
              Recently
              <br />
              uncovered
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="serif text-xl leading-snug lg:text-2xl">
              The five most recent records to reach the archive, in the order they arrived. None of them has finished
              happening.
            </p>
            <Link href="/archive?sort=newest" className="label link-u mt-5 inline-block">
              All accessions, newest first →
            </Link>
          </div>
        </div>

        <ol className="-mx-4 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
          {artifacts.map((artifact, index) => (
            <li
              key={artifact.id}
              className={cn("w-[72vw] max-w-[20rem] shrink-0 snap-start sm:w-[42vw] lg:w-auto lg:max-w-none", OFFSETS[index])}
            >
              <Link href={`/archive/${artifact.slug}`} className="group block" data-cursor="Open">
                <span className="display block text-[4.5rem] leading-none text-ink/15 transition-colors group-hover:text-ink">
                  {pad(index + 1)}
                </span>
                <ArtFrame
                  className="mt-3"
                  as="div"
                  topLeft={artifact.id}
                  topRight={formatDate(artifact.discoveryDate)}
                  plateClassName="reveal-plate"
                >
                  <ArtifactArt visualization={artifact.visualization} detail="thumb" decorative />
                </ArtFrame>
                <h3 className="display-tight mt-4 text-xl">
                  <span className="link-u">{artifact.title}</span>
                </h3>
                <p className="label mt-2 text-mute">
                  {getCategory(artifact.category).label} · Class {artifact.classification}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
