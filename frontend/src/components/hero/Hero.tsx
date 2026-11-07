import { Suspense } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { HeroBackdrop } from "@/components/hero/HeroBackdrop";
import { HeroContent } from "@/components/hero/HeroContent";
import {
  HeroStatus,
} from "@/components/hero/HeroStatus";

/**
 * Hero (nav + hero revamp): full-bleed satellite/terrain photograph over the
 * dark canvas (DESIGN §Layout — "The hero is a full-viewport satellite image
 * with bottom-left text overlay"). Layers bottom→top: photo backdrop (z-0,
 * HeroBackdrop), legibility scrims (z-2), copy + single lime CTA (z-10,
 * HeroContent), the data-driven status HUD (lg, bottom-right) and the scroll
 * cue. The former WebGL globe (MapLibre + CARTO) was removed: the CARTO
 * basemap serves "API KEY REQUIRED" placeholder tiles without a key.
 */
export function Hero() {
  return (
    <header
      id="top"
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-obsidian-loam"
    >
      {/* Full-bleed photo backdrop; occupies z-0 — including the header's
          own stacking context. */}
      <HeroBackdrop />

      {/* Scrims over the photo: left text zone, bottom fade, vignette */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(19,20,14,0.82),rgba(19,20,14,0.38)_34%,transparent_62%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-loam/55 via-transparent to-obsidian-loam/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,transparent_28%,rgba(4,5,8,0.45)_100%)]" />
      </div>

      {/* Status HUD — lg only, bottom-right over the photo (data-driven) */}
      <Suspense fallback={null}>
        <HeroStatus />
      </Suspense>

      <HeroContent />

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex-col items-center gap-2 opacity-0 animate-slide-up [animation-delay:1.5s] lg:flex">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          Scroll to explore
        </span>
        <span
          aria-hidden="true"
          className="h-10 w-px bg-gradient-to-b from-bone-vellum/70 to-transparent"
        />
        <ChevronDownIcon className="h-3.5 w-3.5 animate-pulse text-bone-vellum/40" />
      </div>
    </header>
  );
}
