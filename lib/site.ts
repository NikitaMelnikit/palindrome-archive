/**
 * Canonical origin for metadata, the sitemap and robots.txt: an explicit override, else the
 * production domain Vercel exposes at build time (it follows custom domains), else local dev.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "PALINDROME®",
  shortName: "PALINDROME",
  institution: "Palindrome Institute",
  tagline: "An archive of things that haven’t happened yet.",
  description:
    "PALINDROME® is an experimental digital archive of fictional artifacts, impossible places, future events and lost technologies — documented discoveries from realities that may or may not exist.",
  url: resolveSiteUrl(),
  locale: "en_GB",
} as const;

export const primaryNav = [
  { href: "/archive", label: "Archive", index: "01" },
  { href: "/timelines", label: "Timelines", index: "02" },
  { href: "/collections", label: "Collections", index: "03" },
  { href: "/cabinet", label: "Cabinet", index: "04" },
  { href: "/about", label: "About", index: "05" },
] as const;

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
