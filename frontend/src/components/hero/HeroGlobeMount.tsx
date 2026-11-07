"use client";

import dynamic from "next/dynamic";

/**
 * SSR-safe mount for the hero globe. MapLibre/WebGL never runs on the
 * server (same pattern as ImpactMapPanel -> MapCanvas): this wrapper loads
 * HeroGlobe only in the browser and shows nothing while it arrives — the
 * CSS star field and scrims carry the first paint.
 */
const HeroGlobe = dynamic(() => import("@/components/hero/HeroGlobe"), {
  ssr: false,
});

export function HeroGlobeMount() {
  return (
    <div
      data-hero-globe
      className="absolute inset-x-0 top-[-8%] z-[1] h-[84%] lg:inset-0 lg:right-[-36%] lg:left-[6%] lg:top-0 lg:h-auto"
    >
      <HeroGlobe />
    </div>
  );
}
