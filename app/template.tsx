import type { ReactNode } from "react";

/** Re-mounts on every navigation, replaying a short CSS entrance. No JavaScript required. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
