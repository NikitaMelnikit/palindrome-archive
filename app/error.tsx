"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="shell py-20 lg:py-32" aria-labelledby="error-title">
      <p className="label text-alert-ink">Fault / Reading interrupted</p>
      <h1 id="error-title" className="display mt-6 max-w-5xl text-[clamp(3rem,9vw,8rem)]">
        This record failed to load.
      </h1>
      <p className="serif mt-8 max-w-xl text-2xl leading-snug italic">
        Something went wrong while assembling this page. Nothing you saved has been lost.
      </p>
      {error.digest && <p className="label mt-6 text-mute">Fault reference {error.digest}</p>}
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-solid">
          Try again
        </button>
        <Link href="/archive" className="btn">
          Back to the archive
        </Link>
      </div>
    </section>
  );
}
