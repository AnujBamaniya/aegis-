import type { Metadata } from "next";
import Script from "next/script";
import {
  Bricolage_Grotesque,
  Geist_Mono,
  Inter,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { BlueprintGrid } from "@/components/layout/BlueprintGrid";
import { PerfInit } from "@/components/perf/PerfInit";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Aegis Matrix",
    template: "%s — Aegis Matrix",
  },
  description:
    "Real-time disaster impact prediction and threat mapping against critical infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${bricolage.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col"
        suppressHydrationWarning
      >
        <BlueprintGrid />
        {/* Skip link: first tab stop, jumps past the hero to <main id="main">. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[101] focus:rounded-full focus:bg-neutral-950 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-emerald-400"
        >
          Skip to content
        </a>
        <PerfInit />
        <QueryProvider>{children}</QueryProvider>
        <ScrollReveal />
        <Script
          src="https://www.aura.build/FxFilter.js"
          strategy="lazyOnload"
        />
        <div aria-hidden="true" className="bg-grain" />
      </body>
    </html>
  );
}
