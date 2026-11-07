import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BlueprintGrid } from "@/components/layout/BlueprintGrid";
import { PerfInit } from "@/components/perf/PerfInit";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SmoothScrollProvider, ScrollProgressHairline } from "@/components/motion/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  // DESIGN: -0.03em tracking is part of the brand voice; Inter as the
  // approved substitute for NB International Pro.
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-jetbrains-mono",
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col"
        suppressHydrationWarning
      >
        <SmoothScrollProvider>
          <BlueprintGrid />
          {/* Skip link: first tab stop, jumps past the hero to <main id="main">. */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[101] focus:rounded-[3.6px] focus:bg-obsidian-loam focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-bone-vellum focus:outline-2 focus:outline-offset-2 focus:outline-lime-surveyor"
          >
            Skip to content
          </a>
          <PerfInit />
          <QueryProvider>{children}</QueryProvider>
          <ScrollProgressHairline />
          <div aria-hidden="true" className="bg-grain" />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
