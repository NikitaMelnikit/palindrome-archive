import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Newsreader, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { CursorLayer } from "@/components/layout/CursorLayer";
import { MotionProvider } from "@/components/layout/MotionProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Toaster } from "@/components/layout/Toaster";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-plex-mono",
  display: "swap",
});

// Narrative passages only use the regular weight. Static files keep the download small, and the serif
// is not preloaded because it never carries the largest contentful paint.
const serif = Newsreader({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.institution }],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f0efe9",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${grotesk.variable} ${mono.variable} ${serif.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>
          <SiteHeader />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
          <Toaster />
        </MotionProvider>
        <CursorLayer />
      </body>
    </html>
  );
}
