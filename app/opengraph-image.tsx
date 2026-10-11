import { ogSize, renderOgCard } from "@/lib/og";

export const alt = "PALINDROME® — The future has already left evidence.";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "PALINDROME INSTITUTE / ARCHIVE 001",
    title: "The future has already left evidence.",
    identifier: "024 RECORDS",
    footer: "AN ARCHIVE OF THINGS THAT HAVEN’T HAPPENED YET",
  });
}
