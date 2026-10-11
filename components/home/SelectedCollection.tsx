import Link from "next/link";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtFrame } from "@/components/art/ArtFrame";
import { pad } from "@/lib/format";
import type { Artifact, Collection } from "@/types";

/** An editorial spread: collection artwork, introduction and a table-of-contents index. */
export function SelectedCollection({ collection, artifacts }: { collection: Collection; artifacts: Artifact[] }) {
  return (
    <section aria-labelledby="selected-title" className="border-b border-ink/15">
      <div className="shell grid gap-12 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
        <div className="lg:col-span-5">
          <ArtFrame
            topLeft={`Collection ${collection.code}`}
            topRight={`${pad(artifacts.length)} records`}
            bottomLeft="Plate I — survey of agreed coordinates"
            plateClassName="reveal-plate"
          >
            <ArtifactArt visualization={collection.visualization} />
          </ArtFrame>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="label text-mute">Section 03 / Selected collection</p>
          <h2 id="selected-title" className="display reveal mt-5 text-[clamp(2.75rem,7vw,7rem)]">
            {collection.title}
          </h2>
          <p className="serif dropcap mt-8 text-[1.3rem] leading-[1.45] text-ink/90">{collection.introduction[0]}</p>
          <ol className="mt-10 border-t border-ink">
            {artifacts.map((artifact, i) => (
              <li key={artifact.id}>
                <Link
                  href={`/archive/${artifact.slug}`}
                  className="group flex items-baseline gap-4 border-b border-ink/15 py-3.5 transition-colors hover:bg-paper-2"
                >
                  <span className="label w-8 shrink-0 text-mute tnum">{pad(i + 1)}</span>
                  <span className="font-display text-lg leading-tight font-medium tracking-tight">
                    <span className="link-u">{artifact.title}</span>
                  </span>
                  <span aria-hidden="true" className="mx-1 hidden flex-1 border-b border-dotted border-ink/30 sm:block" />
                  <span className="label ml-auto shrink-0 text-mute tnum">{artifact.id}</span>
                </Link>
              </li>
            ))}
          </ol>
          <Link href={`/collections/${collection.slug}`} className="btn btn-solid mt-10">
            Open the collection <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
