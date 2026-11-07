"use client";

import { CpuBoltIcon, ShieldCheckIcon, ShieldStarIcon } from "@/components/icons";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Core systems (Inversa revamp): three flat hairline cards on the canvas,
 * one per pipeline engine — external data provider, processing tech, AI
 * models. No glass, no gradients, no infinite motion: the diagrams are
 * static, aria-hidden surveyor geometry (dashed circle, nested hexagons,
 * nested ellipses) that stays meaningful but calm.
 */

/** Card 1: Ingestion engine — static dashed surveyor circle. */
function IngestionEngine({ className }: { className?: string }) {
  return (
    <div
      data-gsap-item
      className={`group relative flex h-[480px] flex-col overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40 p-8 transition-colors duration-200 hover:border-iron-filings ${className ?? ""}`}
    >
      {/* Static surveyor diagram */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" className="h-64 w-64">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="8 8"
            className="text-bone-vellum"
          />
          <circle
            cx="100"
            cy="100"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-bone-vellum"
          />
          {/* Single lime marker, sparing accent use */}
          <rect x="186" y="96" width="8" height="8" rx="1.2" fill="#ebfc72" />
        </svg>
      </div>

      {/* Icon tile */}
      <div
        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-[3.6px] border border-iron-filings text-bone-vellum"
        aria-hidden="true"
      >
        <CpuBoltIcon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="relative z-10 mt-auto">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-drift-ash">
          Ingestion engine
        </p>
        <h3 className="text-3xl font-light leading-[1.05] tracking-[-0.03em] text-bone-vellum">
          GDACS hazard feed
        </h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-drift-ash">
          Tropical cyclones, floods and wildfires ingested every five minutes.
        </p>
        <div className="mt-6 border-t border-iron-filings/70 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-drift-ash">
            Source · GDACS
          </p>
        </div>
      </div>
    </div>
  );
}

/** Card 2: Spatial engine — nested hexagons, static. */
function SpatialEngine({ className }: { className?: string }) {
  return (
    <div
      data-gsap-item
      className={`group relative flex h-[480px] flex-col overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40 p-8 transition-colors duration-200 hover:border-iron-filings ${className ?? ""}`}
    >
      {/* Static surveyor diagram */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="h-72 w-72" style={{ transform: "skewX(8deg)" }}>
          {/* Outer hexagon */}
          <path
            d="M50 5 L89 27.5 V72.5 L50 95 L11 72.5 V27.5 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            opacity="0.4"
            className="text-bone-vellum"
          />
          {/* Inner hexagon */}
          <path
            d="M50 15 L80.3 32.5 V67.5 L50 85 L19.7 67.5 V32.5 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            className="text-bone-vellum"
          />
          {/* Single lime distance tick */}
          <line x1="50" y1="15" x2="50" y2="5" stroke="#ebfc72" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Icon tile */}
      <div
        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-[3.6px] border border-iron-filings text-bone-vellum"
        aria-hidden="true"
      >
        <ShieldCheckIcon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="relative z-10 mt-auto">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-drift-ash">
          Spatial engine
        </p>
        <h3 className="text-3xl font-light leading-[1.05] tracking-[-0.03em] text-bone-vellum">
          Metric-projected distances
        </h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-drift-ash">
          UTM-projected distances from each hazard footprint to nearby critical
          assets, tiered by distance threshold.
        </p>
        <div className="mt-6 border-t border-iron-filings/70 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-drift-ash">
            Tech · GeoPandas / OpenStreetMap
          </p>
        </div>
      </div>
    </div>
  );
}

/** Card 3: Forecast & briefing — nested ellipses, static. */
function ForecastBriefing({ className }: { className?: string }) {
  return (
    <div
      data-gsap-item
      className={`group relative flex h-[480px] flex-col overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40 p-8 transition-colors duration-200 hover:border-iron-filings ${className ?? ""}`}
    >
      {/* Static surveyor diagram */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
        aria-hidden="true"
      >
        <div className="relative h-64 w-64">
          {[0, 60, 120].map((rotation) => (
            <div
              key={rotation}
              className="absolute inset-0"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <ellipse
                  cx="50"
                  cy="50"
                  rx="45"
                  ry="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  opacity="0.4"
                  className="text-bone-vellum"
                />
              </svg>
            </div>
          ))}
          {/* Central marker, sole lime accent */}
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-surveyor/70" />
        </div>
      </div>

      {/* Icon tile */}
      <div
        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-[3.6px] border border-iron-filings text-bone-vellum"
        aria-hidden="true"
      >
        <ShieldStarIcon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="relative z-10 mt-auto">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-drift-ash">
          Forecast &amp; briefing
        </p>
        <h3 className="text-3xl font-light leading-[1.05] tracking-[-0.03em] text-bone-vellum">
          AI severity &amp; briefing
        </h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-drift-ash">
          Chronos-Bolt severity forecast and a local LLM executive briefing,
          labelled as AI-generated.
        </p>
        <div className="mt-6 border-t border-iron-filings/70 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-drift-ash">
            Models · Chronos-Bolt / local LLM
          </p>
        </div>
      </div>
    </div>
  );
}

export function CoreSystems() {
  return (
    <section
      id="systems"
      className="relative w-full scroll-mt-24 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-360 px-6 md:px-12">
        <SectionHeader
          index="06"
          eyebrow="Powered by"
          title="Core systems"
          description="Three engines power the deterministic ingest-to-brief chain: a live data feed, a spatial distance model and local AI models."
          className="mb-12"
        />

        {/* Three cards grid */}
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6"
          data-gsap="stagger"
        >
          <IngestionEngine />
          <SpatialEngine />
          <ForecastBriefing />
        </div>
      </div>
    </section>
  );
}
