"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import type { MapFocus } from "./MapCanvas";
import { DataModeBadge } from "@/components/ui/DataModeBadge";
import type {
  AegisAsset,
  AegisEvent,
  FootprintFeature,
} from "@/lib/adapters";

/**
 * Perf/reduced-motion flags for ping gating, read via useSyncExternalStore
 * after hydration (PerfInit stamps [data-perf] on <html>; reduced motion
 * comes from the media query). No setState-in-effect cascades.
 */
const MEDIUM_MATCHER = "(prefers-reduced-motion: reduce)";

function subscribeToSignals(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-perf"],
  });
  const query = window.matchMedia(MEDIUM_MATCHER);
  query.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    query.removeEventListener("change", onChange);
  };
}

function useLite(): boolean {
  return useSyncExternalStore(
    subscribeToSignals,
    () => document.documentElement.dataset.perf === "lite",
    () => false,
  );
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToSignals,
    () => window.matchMedia(MEDIUM_MATCHER).matches,
    () => false,
  );
}

/**
 * Map panel (PLAN P3, DESIGN 8.7 / 10). MapLibre GL is heavy and WebGL-only:
 * loaded via dynamic import with ssr:false, so the server bundle stays lean
 * and the section renders a skeleton until the module arrives.
 */
const MapCanvas = dynamic(() => import("@/components/impact/MapCanvas"), {
  ssr: false,
  loading: () => <MapModuleSkeleton />,
});

function MapModuleSkeleton() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer-effect bg-gradient-to-r from-transparent via-bone-vellum/5 to-transparent" />
    </div>
  );
}

/** Overlay chips: flat mono instrument labels above the map. */
const CHIP =
  "pointer-events-none flex items-center gap-2 rounded-[3.6px] border border-iron-filings bg-obsidian-loam/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-drift-ash";

export function ImpactMapPanel({
  event,
  footprint,
  assets,
  alertHex,
  focus,
  dataLoading,
}: {
  event: AegisEvent | null;
  footprint: FootprintFeature[] | null;
  assets: AegisAsset[];
  alertHex: string;
  focus: MapFocus | null;
  /** True while polygon/infrastructure queries are still pending. */
  dataLoading: boolean;
}) {
  const lite = useLite();
  const reducedMotion = useReducedMotion();

  // From getPolygon: null = footprint not published yet (404 stays calm).
  const footprintPublished = footprint !== null;

  return (
    <div className="relative h-[420px] w-full overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40 lg:h-[560px]">
      <MapCanvas
        event={event}
        footprint={footprint}
        assets={assets}
        alertHex={alertHex}
        focus={focus}
        lite={lite}
        reducedMotion={reducedMotion}
      />
      {/* Functional legibility scrim over the base map, not decoration. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-obsidian-loam/70 via-transparent to-obsidian-loam/20"
      />

      {/* Overlay chips: footprint status (top-left), Demo/Live (bottom-left). */}
      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <span className={CHIP}>
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              footprintPublished ? "bg-lime-surveyor" : "bg-bone-vellum/30"
            }`}
          />
          {footprintPublished
            ? "Footprint published"
            : "Impact footprint not yet published"}
        </span>
      </div>
      <div className="absolute bottom-4 left-4 z-10">
        <DataModeBadge noteId="aegis-map-mode-note" />
      </div>

      {dataLoading ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] overflow-hidden bg-obsidian-loam/40"
        >
          <div className="absolute inset-0 -translate-x-full animate-shimmer-effect bg-gradient-to-r from-transparent via-bone-vellum/5 to-transparent" />
        </div>
      ) : null}
    </div>
  );
}
