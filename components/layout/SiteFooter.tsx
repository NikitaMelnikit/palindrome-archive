import Link from "next/link";
import { getCategoryCounts } from "@/lib/archive";
import { pad } from "@/lib/format";
import { primaryNav, siteConfig } from "@/lib/site";
import { LogoMark } from "./Logo";

export function SiteFooter() {
  const counts = getCategoryCounts();
  return (
    <footer className="on-dark relative overflow-hidden">
      <div className="shell pt-16 pb-8 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label text-gray">Palindrome Institute / Archive 001</p>
            <p className="serif mt-5 max-w-md text-2xl leading-snug text-paper/90 italic">
              An archive of things that haven’t happened yet — kept in case they do.
            </p>
            <Link href="/archive" className="btn btn-lime mt-8">
              Enter the archive <span aria-hidden="true">→</span>
            </Link>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h2 className="label mb-4 text-gray">Index</h2>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/" className="link-u text-sm">
                    Home
                  </Link>
                </li>
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="link-u text-sm">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="label mb-4 text-gray">Categories</h2>
              <ul className="space-y-2.5">
                {counts.map(({ category, count }) => (
                  <li key={category.slug}>
                    <Link href={`/archive?category=${category.slug}`} className="link-u text-sm">
                      {category.label} <span className="label text-gray tnum">{pad(count)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h2 className="label mb-4 text-gray">Colophon</h2>
              <p className="text-sm leading-relaxed text-paper/75">
                Every artifact, place, event and institution described here is fiction. Set in Space Grotesk, IBM Plex
                Mono and Newsreader. Artwork is generated in the browser from each record’s data.
              </p>
            </div>
          </nav>
        </div>
      </div>

      <div aria-hidden="true" className="select-none">
        <div className="shell">
          <p className="display text-[clamp(3.5rem,17.5vw,19rem)] leading-[0.78] text-paper">Palindrome</p>
          <p
            data-text="Palindrome"
            className="mirror-text display -mt-[0.04em] scale-y-[-1] text-[clamp(3.5rem,17.5vw,19rem)] leading-[0.78] text-paper/[0.12] [mask-image:linear-gradient(to_top,black,transparent_70%)]"
          />
        </div>
      </div>

      <div className="shell">
        <div className="label flex flex-col gap-3 border-t border-paper/15 py-5 text-gray sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-3">
            <LogoMark className="size-4" />© 2026 {siteConfig.institution} — a work of fiction
          </span>
          <a href="#top" className="link-u">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
