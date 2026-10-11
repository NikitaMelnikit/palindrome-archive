import type { Metadata } from "next";
import Link from "next/link";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { ArtFrame } from "@/components/art/ArtFrame";
import { Greek } from "@/components/ui/Greek";

export const metadata: Metadata = {
  title: "Record not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="shell grid gap-12 py-16 lg:grid-cols-12 lg:py-28" aria-labelledby="nf-title">
      <div className="lg:col-span-7">
        <p className="label text-mute">Error / Record not found</p>
        <h1 id="nf-title" className="display mt-6 text-[clamp(7rem,30vw,22rem)] leading-[0.75]">
          4<span className="hl">0</span>4
        </h1>
        <p className="serif mt-10 max-w-xl text-2xl leading-snug italic md:text-3xl">
          The only number in the archive that reads the same in every timeline — and the one we use when a reality has
          not been documented.
        </p>
        <p className="mt-6 max-w-lg text-mute">
          The page you asked for has no record. It may have been moved, may never have existed, or may exist in a branch
          we have no access to.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/archive" className="btn btn-solid">
            Search the archive <span aria-hidden="true">→</span>
          </Link>
          <Link href="/" className="btn">
            Return to the index
          </Link>
        </div>
      </div>
      <div className="lg:col-span-4 lg:col-start-9">
        <ArtFrame topLeft="Fig. 404" topRight={<><Greek>ψ</Greek> — · <Greek>λ</Greek> — · <Greek>Δt</Greek> —</>} bottomLeft="Undocumented stratum" bottomRight="No accession">
          <ArtifactArt
            decorative
            visualization={{ kind: "grid", seed: 404, variant: 2, tone: "light", alt: "" }}
          />
        </ArtFrame>
      </div>
    </section>
  );
}
