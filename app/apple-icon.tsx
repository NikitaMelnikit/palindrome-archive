import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#151515" }}>
        <svg width="180" height="180" viewBox="0 0 24 24">
          <path
            fill="#D7FF38"
            fillRule="evenodd"
            d="M4 5h4.6a3.5 3.5 0 0 1 0 7H6.2v7H4V5Zm2.2 2v3h2.3a1.5 1.5 0 0 0 0-3H6.2Z"
          />
          <path
            fill="#F0EFE9"
            fillRule="evenodd"
            d="M20 5h-4.6a3.5 3.5 0 0 0 0 7h2.4v7H20V5Zm-2.2 2v3h-2.3a1.5 1.5 0 0 1 0-3h2.3Z"
          />
          <path stroke="#92938D" strokeWidth="0.75" d="M12 3v18" />
        </svg>
      </div>
    ),
    size,
  );
}
