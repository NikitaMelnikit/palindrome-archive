import type { ReactNode } from "react";
import { cn } from "@/lib/site";

/**
 * An archival plate: crop marks at the corners and mono annotations along the edges.
 * Annotations sit in normal flow (not absolutely positioned) so they never overflow narrow screens.
 */
export function ArtFrame({
  children,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  className,
  plateClassName,
  as: Tag = "figure",
}: {
  children: ReactNode;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  bottomLeft?: ReactNode;
  bottomRight?: ReactNode;
  className?: string;
  plateClassName?: string;
  as?: "figure" | "div";
}) {
  const hasTop = topLeft || topRight;
  const hasBottom = bottomLeft || bottomRight;
  return (
    <Tag className={cn("min-w-0", className)}>
      {hasTop && (
        <div className="label mb-2 flex items-baseline justify-between gap-4 text-current/70">
          <span className="truncate">{topLeft}</span>
          <span className="shrink-0 tnum">{topRight}</span>
        </div>
      )}
      <div className={cn("crops relative", plateClassName)}>
        {children}
        <i aria-hidden="true" />
        <i aria-hidden="true" />
        <i aria-hidden="true" />
        <i aria-hidden="true" />
      </div>
      {hasBottom && (
        <div className="label mt-2 flex items-baseline justify-between gap-4 text-current/70">
          <span className="truncate tnum">{bottomLeft}</span>
          <span className="shrink-0 tnum">{bottomRight}</span>
        </div>
      )}
    </Tag>
  );
}
