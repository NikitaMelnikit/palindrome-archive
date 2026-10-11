import { cn } from "@/lib/site";

/** The mirrored-P mark: a letter and its reflection either side of an axis. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6 shrink-0", className)} aria-hidden="true" focusable="false">
      <rect width="24" height="24" fill="#151515" />
      <path
        fillRule="evenodd"
        d="M4 5h4.6a3.5 3.5 0 0 1 0 7H6.2v7H4V5Zm2.2 2v3h2.3a1.5 1.5 0 0 0 0-3H6.2Z"
        fill="#D7FF38"
      />
      <path
        fillRule="evenodd"
        d="M20 5h-4.6a3.5 3.5 0 0 0 0 7h2.4v7H20V5Zm-2.2 2v3h-2.3a1.5 1.5 0 0 1 0-3h2.3Z"
        fill="#F0EFE9"
      />
      <path d="M12 3v18" stroke="#92938D" strokeWidth="0.75" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[0.95rem] font-semibold tracking-[-0.01em] uppercase">
        Palindrome<sup className="ml-0.5 align-super text-[0.55em] font-normal">®</sup>
      </span>
    </span>
  );
}
