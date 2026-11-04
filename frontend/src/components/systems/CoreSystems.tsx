"use client";

import { useSyncExternalStore } from "react";
import { CpuBoltIcon, ShieldCheckIcon, ShieldStarIcon } from "@/components/icons";

/**
 * Client-only motion gate (DESIGN 11): animations run unless lite mode is
 * active or the user prefers reduced motion. useSyncExternalStore keeps the
 * server snapshot false so SSR markup matches hydration.
 */
const noopSubscribe = () => () => {};
const serverSnapshot = () => false;
function useMotionEnabled(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () =>
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      document.documentElement.dataset.perf !== "lite",
    serverSnapshot,
  );
}

/** Card 1: Ingestion engine (emerald) - rotating dashed circle + pulsing scanner */
function IngestionEngine({ className }: { className?: string }) {
  const animate = useMotionEnabled();

  return (
    <div className={`group relative h-[500px] bg-neutral-900/40 border border-white/10 rounded-3xl p-8 overflow-hidden hover:bg-neutral-900/60 hover:border-white/20 transition-all duration-500 backdrop-blur-sm animate-on-scroll ${className ?? ""}`}>
      {/* Emerald ambient glow on hover */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        aria-hidden="true"
      />

      {/* Visualization wrapper with perspective */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none perspective-midrange transform-3d"
        aria-hidden="true"
      >
        {/* Rotating dashed circle border */}
        <svg viewBox="0 0 200 200" className="w-64 h-64" aria-hidden="true">
          <defs>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#emeraldGradient)"
            strokeWidth="1.5"
            strokeDasharray="8 8"
            className={animate ? "fx-anim animate-[spin_20s_linear_infinite]" : ""}
          />
        </svg>

        {/* Pulsing horizontal scanner line */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-[180px] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent rotate-0 ${animate ? "fx-anim animate-pulse" : ""}`}
          aria-hidden="true"
        />
      </div>

      {/* Icon tile */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-auto text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-500">
        <CpuBoltIcon className="text-2xl" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="relative z-10 mt-auto pt-32">
        <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] ${animate ? "fx-anim animate-pulse" : ""}`}
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
            Ingestion engine
          </span>
        </div>
        <h3 className="text-3xl font-bricolage font-medium text-white tracking-tight group-hover:text-emerald-50 transition-colors">
          GDACS hazard feed
        </h3>
        <p className="mt-2 text-sm font-light text-neutral-400 leading-relaxed group-hover:text-white/60 transition-colors">
          Tropical cyclones, floods and wildfires ingested every five minutes.
        </p>

        {/* Progress line on hover */}
        <div className="mt-6 w-full bg-white/5 h-[2px] relative overflow-hidden rounded-full">
          <div
            className="absolute inset-0 bg-emerald-500 w-full -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

/** Card 2: Spatial engine (blue) - rotating hexagon with skew */
function SpatialEngine({ className }: { className?: string }) {
  const animate = useMotionEnabled();

  return (
    <div className={`group relative h-[500px] bg-neutral-900/40 border border-white/10 rounded-3xl p-8 overflow-hidden hover:bg-neutral-900/60 hover:border-white/20 transition-all duration-500 backdrop-blur-sm animate-on-scroll ${className ?? ""}`}>
      {/* Blue ambient glow on hover */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        aria-hidden="true"
      />

      {/* Visualization wrapper with perspective */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none perspective-midrange transform-3d"
        aria-hidden="true"
      >
        {/* Hexagon SVG from DESIGN 2.3 */}
        <svg
          viewBox="0 0 100 100"
          className={`w-72 h-72 ${animate ? "fx-anim animate-[spin_30s_linear_infinite]" : ""}`}
          style={{ transformOrigin: "center", transform: "skewX(8deg)" }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Outer hexagon */}
          <path
            d="M50 5 L89 27.5 V72.5 L50 95 L11 72.5 V27.5 Z"
            fill="none"
            stroke="url(#blueGradient)"
            strokeWidth="0.2"
            strokeDasharray="2 2"
            opacity="0.3"
          />
          {/* Inner hexagon */}
          <path
            d="M50 15 L80.3 32.5 V67.5 L50 85 L19.7 67.5 V32.5 Z"
            fill="none"
            stroke="url(#blueGradient)"
            strokeWidth="0.3"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Icon tile */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-auto text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all duration-500">
        <ShieldCheckIcon className="text-2xl" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="relative z-10 mt-auto pt-32">
        <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] ${animate ? "fx-anim animate-pulse" : ""}`}
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-blue-400">
            Spatial engine
          </span>
        </div>
        <h3 className="text-3xl font-bricolage font-medium text-white tracking-tight group-hover:text-blue-50 transition-colors">
          Metric-projected distances
        </h3>
        <p className="mt-2 text-sm font-light text-neutral-400 leading-relaxed group-hover:text-white/60 transition-colors">
          UTM-projected distances from each hazard footprint to nearby critical
          assets, tiered by distance threshold.
        </p>

        {/* Progress line on hover */}
        <div className="mt-6 w-full bg-white/5 h-[2px] relative overflow-hidden rounded-full">
          <div
            className="absolute inset-0 bg-blue-500 w-full -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

/** Card 3: Forecast & briefing (purple) - orbiting ellipses */
function ForecastBriefing({ className }: { className?: string }) {
  const animate = useMotionEnabled();

  return (
    <div className={`group relative h-[500px] bg-neutral-900/40 border border-white/10 rounded-3xl p-8 overflow-hidden hover:bg-neutral-900/60 hover:border-white/20 transition-all duration-500 backdrop-blur-sm animate-on-scroll ${className ?? ""}`}>
      {/* Purple ambient glow on hover */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        aria-hidden="true"
      />

      {/* Visualization wrapper with perspective */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none perspective-midrange transform-3d"
        aria-hidden="true"
      >
        {/* Three ellipses rotated 0/60/120 degrees orbiting */}
        <div className="relative w-64 h-64" aria-hidden="true">
          {[0, 60, 120].map((rotation, idx) => (
            <div
              key={idx}
              className="absolute inset-0"
              style={{
                transform: `rotate(${rotation}deg)`,
                animation: animate
                  ? `spin ${20 + idx * 5}s linear infinite`
                  : "none",
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
                <ellipse
                  cx="50"
                  cy="50"
                  rx="45"
                  ry="12"
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="0.3"
                  opacity="0.4"
                />
              </svg>
            </div>
          ))}
          {/* Central white glow dot */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] ${animate ? "fx-anim animate-pulse" : ""}`}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Icon tile */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-auto text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all duration-500">
        <ShieldStarIcon className="text-2xl" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="relative z-10 mt-auto pt-32">
        <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] ${animate ? "fx-anim animate-pulse" : ""}`}
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-purple-400">
            Forecast & briefing
          </span>
        </div>
        <h3 className="text-3xl font-bricolage font-medium text-white tracking-tight group-hover:text-purple-50 transition-colors">
          AI severity & briefing
        </h3>
        <p className="mt-2 text-sm font-light text-neutral-400 leading-relaxed group-hover:text-white/60 transition-colors">
          Chronos-Bolt severity forecast and a local LLM executive briefing,
          labelled as AI-generated.
        </p>

        {/* Progress line on hover */}
        <div className="mt-6 w-full bg-white/5 h-[2px] relative overflow-hidden rounded-full">
          <div
            className="absolute inset-0 bg-purple-500 w-full -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

export function CoreSystems() {
  return (
    <section
      id="systems"
      className="relative w-full scroll-mt-24 bg-black border-t border-white/5 py-32 overflow-hidden"
    >
      <div className="mx-auto w-full max-w-360 px-6 md:px-12">
        {/* Section header */}
        <div className="relative min-w-0 lg:max-w-xl animate-on-scroll">
          <span
            aria-hidden="true"
            className="absolute -left-4 top-1 bottom-1 w-1 bg-gradient-to-b from-purple-500 to-transparent opacity-50 md:-left-8"
          />
          <p className="mb-4 flex items-center gap-3 text-purple-400">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-purple-400/80">
              Core systems
            </span>
            <span className="h-[1px] w-8 bg-purple-500/30" />
          </p>
          <h2 className="font-bricolage text-5xl md:text-7xl font-semibold tracking-tight text-white">
            Core{" "}
            <span className="font-light text-neutral-500">systems</span>
          </h2>
          <p className="mt-4 font-light leading-relaxed text-white/50">
            Three deterministic engines power the ingest-to-brief pipeline.
          </p>
        </div>

        {/* Three cards grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <IngestionEngine />
          <SpatialEngine />
          <ForecastBriefing />
        </div>
      </div>
    </section>
  );
}