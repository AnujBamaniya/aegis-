"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MapFocus } from "./MapCanvas";
import { CollapseIcon, ExpandIcon } from "@/components/icons";
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

  // Expanded ("fullscreen") mode: the SAME MapCanvas element keeps running —
  // the container merely becomes a fixed overlay, and MapCanvas's existing
  // ResizeObserver calls map.resize() for us. Escape closes; body scroll is
  // locked; focus returns to the toggle on exit.
  const [expanded, setExpanded] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!expanded) return;
    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      toggle?.focus();
    };
  }, [expanded]);

  return (
    <div
      id="aegis-map-panel"
      className={
        expanded
          ? "aegis-panel-shell fixed inset-0 z-50 overflow-hidden border border-iron-filings/70 bg-obsidian-loam"
          : "aegis-panel-shell relative h-[420px] w-full overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40 lg:h-[560px]"
      }
    >
      <MapCanvas
        event={event}
        footprint={footprint}
        assets={assets}
        alertHex={alertHex}
        focus={focus}
        lite={lite}
        reducedMotion={reducedMotion}
      />
      {/* Bottom-only legibility scrim: keeps the data-mode badge readable
          without muddying the whole basemap (roads/labels stay visible). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-obsidian-loam/55 via-transparent to-transparent"
      />

      {/* Panel toggle: expand to fullscreen overlay / collapse back. */}
      <div className="absolute right-3 top-3 z-10">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-controls="aegis-map-panel"
          className="flex cursor-pointer items-center gap-2 rounded-[3.6px] border border-iron-filings bg-obsidian-loam/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-drift-ash hover:text-lime-surveyor focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor"
        >
          {expanded ? (
            <CollapseIcon className="h-3.5 w-3.5" />
          ) : (
            <ExpandIcon className="h-3.5 w-3.5" />
          )}
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

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
