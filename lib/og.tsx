import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Shared Open Graph card: archival header, oversized title, identifier and a lime index bar. */
export function renderOgCard({
  eyebrow,
  title,
  identifier,
  footer,
}: {
  eyebrow: string;
  title: string;
  identifier: string;
  footer: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F0EFE9",
          color: "#151515",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3 }}>
          <span>{eyebrow}</span>
          <span>{identifier}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 28 ? 84 : 112,
              lineHeight: 0.92,
              letterSpacing: -4,
              textTransform: "uppercase",
              fontWeight: 600,
              maxWidth: 1050,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 22, letterSpacing: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 18, height: 18, background: "#D7FF38", border: "2px solid #151515" }} />
            <span>PALINDROME®</span>
          </div>
          <span>{footer}</span>
        </div>
      </div>
    ),
    ogSize,
  );
}
