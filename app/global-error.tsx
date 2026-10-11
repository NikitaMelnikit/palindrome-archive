"use client";

/** Last-resort boundary for failures in the root layout itself. Styled inline: global CSS may not have loaded. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-GB">
      <body style={{ margin: 0, background: "#F0EFE9", color: "#151515", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <main style={{ padding: "12vh 6vw" }}>
          <p style={{ fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>
            PALINDROME® / System fault
          </p>
          <h1 style={{ fontSize: "clamp(40px, 8vw, 110px)", lineHeight: 0.9, letterSpacing: "-0.04em", textTransform: "uppercase" }}>
            The archive could not open.
          </h1>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 32, padding: "14px 20px", border: "1px solid #151515", background: "#D7FF38", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
