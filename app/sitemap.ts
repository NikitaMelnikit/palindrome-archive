import type { MetadataRoute } from "next";
import { getAllArtifacts, getAllCollections } from "@/lib/archive";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const latest = getAllArtifacts().reduce((max, a) => (a.discoveryDate > max ? a.discoveryDate : max), "");
  const staticRoutes = ["", "/archive", "/timelines", "/collections", "/about"].map((path) => ({
    url: `${base}${path}`,
    lastModified: latest,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const artifacts = getAllArtifacts().map((a) => ({
    url: `${base}/archive/${a.slug}`,
    lastModified: a.discoveryDate,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const collections = getAllCollections().map((c) => ({
    url: `${base}/collections/${c.slug}`,
    lastModified: latest,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...artifacts, ...collections];
}
