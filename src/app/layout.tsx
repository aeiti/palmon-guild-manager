import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

// Mono carries the wordmark, labels, and all numeric data (docs/components.md
// §1.2). Body/headings use the system sans stack defined in globals.css.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Deployed origin, used to resolve absolute URLs for OG/Twitter cards. Falls
// back to localhost for dev. Set NEXT_PUBLIC_SITE_URL in production.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "VOID Guild Manager",
  // Child pages set a bare title (e.g. "Members"); the template appends the
  // wordmark. `default` covers routes that set no title of their own.
  title: {
    default: "VOID — Guild Manager",
    template: "%s — VOID",
  },
  description:
    "Guild management for VOID (Palmon: Survival, server #111) — members, events, strongholds, and trends.",
  // Members-only tool: keep it out of every search index. Every unauthenticated
  // request (crawlers included) is redirected to /signin by middleware, but we
  // set noindex globally as defence in depth.
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    type: "website",
    siteName: "VOID Guild Manager",
    locale: "en_US",
    title: "VOID — Guild Manager",
    description:
      "Members-only guild manager for VOID (Palmon: Survival, server #111).",
  },
  twitter: {
    card: "summary_large_image",
    title: "VOID — Guild Manager",
    description:
      "Members-only guild manager for VOID (Palmon: Survival, server #111).",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-void text-text font-sans">
        {children}
      </body>
    </html>
  );
}
