import { getAllArtifacts, getArtifactBySlug, getCategory } from "@/lib/archive";
import { formatAccession } from "@/lib/format";
import { ogSize, renderOgCard } from "@/lib/og";

export const alt = "PALINDROME® archive record";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllArtifacts().map((artifact) => ({ slug: artifact.slug }));
}

export default async function ArtifactOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artifact = getArtifactBySlug(slug);
  if (!artifact) {
    return renderOgCard({ eyebrow: "PALINDROME INSTITUTE", title: "Record not found", identifier: "404", footer: "" });
  }
  return renderOgCard({
    eyebrow: `ARCHIVE 001 / ${getCategory(artifact.category).label.toUpperCase()}`,
    title: artifact.title,
    identifier: artifact.id,
    footer: `ACCESSION ${formatAccession(artifact.accession)} · CLASS ${artifact.classification}`,
  });
}
