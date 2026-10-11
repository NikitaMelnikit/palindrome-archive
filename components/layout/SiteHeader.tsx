"use client";

import { X } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cabinetCount, useCabinet } from "@/lib/cabinet";
import { pad } from "@/lib/format";
import { cn, primaryNav } from "@/lib/site";
import { LiveClock } from "./LiveClock";
import { Logo } from "./Logo";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Current-page marker that turns lime and pulses while its link's navigation is pending. */
function NavMarker({ active }: { active: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-1.5 transition-colors",
        pending ? "animate-pulse bg-lime ring-1 ring-ink" : active ? "bg-ink" : "bg-transparent group-hover:bg-gray",
      )}
    />
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const count = cabinetCount(useCabinet());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the overlay whenever the route changes (back/forward included).
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const openMenu = () => {
    dialogRef.current?.showModal();
    setMenuOpen(true);
  };
  const closeMenu = () => dialogRef.current?.close();

  return (
    <header id="top" className="sticky top-0 z-50 border-b border-ink/15 bg-paper">
      <div className="shell flex h-14 items-center justify-between gap-6">
        <Link href="/" className="-m-1 p-1" aria-label="PALINDROME® — home" data-cursor="Home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="group label flex items-center gap-2 py-2"
                  >
                    <NavMarker active={active} />
                    <span className="text-mute tnum">{item.index}</span>
                    <span className="link-u" data-active={active}>
                      {item.label}
                    </span>
                    {item.href === "/cabinet" && count > 0 && (
                      <span className="bg-lime px-1 text-ink tnum" aria-label={`${count} saved`}>
                        {pad(count)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="label hidden items-center gap-3 text-mute xl:flex">
          <span className="status-dot" aria-hidden="true" />
          <span>Archive 001</span>
          <span aria-hidden="true">/</span>
          <LiveClock compact />
        </div>

        <button
          type="button"
          className="label -mr-2 flex min-h-11 items-center gap-2 px-2 lg:hidden"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={openMenu}
        >
          <span>Menu</span>
          {count > 0 && <span className="bg-lime px-1 text-ink tnum">{pad(count)}</span>}
          <span aria-hidden="true" className="flex flex-col gap-1">
            <span className="block h-px w-5 bg-ink" />
            <span className="block h-px w-5 bg-ink" />
          </span>
        </button>
      </div>

      <dialog
        id="site-menu"
        ref={dialogRef}
        className="menu-overlay"
        aria-label="Site menu"
        onClose={() => setMenuOpen(false)}
      >
        <div className="shell flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-paper/15">
            <Link href="/" onClick={closeMenu} aria-label="PALINDROME® — home">
              <Logo />
            </Link>
            <button type="button" className="label -mr-2 flex min-h-11 items-center gap-2 px-2" onClick={closeMenu} autoFocus>
              Close <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Primary (mobile)" className="flex-1 overflow-y-auto py-8">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  onClick={closeMenu}
                  aria-current={pathname === "/" ? "page" : undefined}
                  className="group flex items-baseline gap-4 border-b border-paper/10 py-3"
                >
                  <span className="label w-6 text-gray tnum">00</span>
                  <span className={cn("display text-[clamp(2.4rem,11vw,4.5rem)]", pathname === "/" && "text-lime")}>Index</span>
                </Link>
              </li>
              {primaryNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className="group flex items-baseline gap-4 border-b border-paper/10 py-3"
                    >
                      <span className="label w-6 text-gray tnum">{item.index}</span>
                      <span className={cn("display text-[clamp(2.4rem,11vw,4.5rem)]", active && "text-lime")}>{item.label}</span>
                      {item.href === "/cabinet" && count > 0 && (
                        <span className="label ml-auto bg-lime px-1.5 py-0.5 text-ink tnum">{pad(count)} saved</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="label flex shrink-0 items-center justify-between gap-4 border-t border-paper/15 py-4 text-gray">
            <span>A work of fiction</span>
            <LiveClock compact />
          </div>
        </div>
      </dialog>
    </header>
  );
}
