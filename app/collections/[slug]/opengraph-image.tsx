import { getAllCollections, getCollectionBySlug } from "@/lib/archive";
import { ogSize, renderOgCard } from "@/lib/og";

export const alt = "PALINDROME® collection";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllCollections().map((collection) => ({ slug: collection.slug }));
}

export default async function CollectionOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  return renderOgCard({
    eyebrow: "ARCHIVE 001 / COLLECTIONS",
    title: collection?.title ?? "Collection not found",
    identifier: collection?.code.replace("·", " ") ?? "404",
    footer: collection ? `${collection.artifactIds.length} RECORDS · ${collection.kicker.toUpperCase()}` : "",
  });
}
