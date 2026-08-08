import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

// Mono carries the wordmark, labels, and all numeric data (docs/components.md
// §1.2). Body/headings use the system sans stack defined in globals.css.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VOID — Guild Manager",
  description:
    "Guild management for VOID (Palmon: Survival, server #111) — members, events, strongholds, and trends.",
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
