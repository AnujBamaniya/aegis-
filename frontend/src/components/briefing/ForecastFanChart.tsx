"use client";

import React, { useSyncExternalStore } from "react";

export type ForecastPoint = number;

export interface ForecastData {
  p10: ForecastPoint[];
  p50: ForecastPoint[];
  p90: ForecastPoint[];
}

export type ForecastStatus = "idle" | "loading" | "done" | "error";

export interface ForecastFanChartProps {
  forecast: ForecastData | null;
  status: ForecastStatus;
  error?: string | null;
}

function subscribeMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribePerf(callback: () => void) {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
    return () => {};
  }
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-perf"],
  });
  return () => observer.disconnect();
}

function getPerfSnapshot() {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-perf") === "lite";
}

export function ForecastFanChart({
  forecast,
  status,
  error,
}: ForecastFanChartProps) {
  const reducedMotion = useSyncExternalStore(subscribeMotion, getMotionSnapshot, () => false);
  const lite = useSyncExternalStore(subscribePerf, getPerfSnapshot, () => false);

  // 1. Loading state
  if (status === "loading") {
    return <ForecastSkeleton />;
  }

  // 2. Idle state: not requested yet
  if (status === "idle") {
    return (
      <div className="flex h-full min-h-[340px] flex-col items-center justify-center border border-iron-filings/70 bg-obsidian-loam/40 p-8 text-center">
        <span className="mb-2 font-mono text-xs uppercase tracking-widest text-drift-ash">
          AI severity forecast
        </span>
        <h3 className="mb-2 font-sans text-lg font-medium text-bone-vellum">
          Hydro-meteorological severity index
        </h3>
        <p className="max-w-md text-sm font-light text-drift-ash">
          Run a briefing to see the forecast.
        </p>
      </div>
    );
  }

  // 3. Error state
  if (status === "error") {
    return (
      <div
        role="alert"
        className="flex h-full min-h-[340px] flex-col items-center justify-center border border-iron-filings/70 bg-obsidian-loam/40 p-8 text-center"
      >
        <span className="mb-2 font-mono text-xs uppercase tracking-widest text-red-400">
          Forecast unavailable
        </span>
        <h3 className="mb-2 font-sans text-lg font-medium text-bone-vellum">
          Hydro-meteorological severity index
        </h3>
        <p className="max-w-md text-sm font-light text-drift-ash">
          {error || "Forecast unavailable due to service error"}
        </p>
      </div>
    );
  }

  // 4. Done state, but forecast is null or empty
  if (
    !forecast ||
    !forecast.p10?.length ||
    !forecast.p50?.length ||
    !forecast.p90?.length
  ) {
    return (
      <div className="flex h-full min-h-[340px] flex-col items-center justify-center border border-iron-filings/70 bg-obsidian-loam/40 p-8 text-center">
        <span className="mb-2 font-mono text-xs uppercase tracking-widest text-drift-ash">
          Forecast
        </span>
        <h3 className="mb-2 font-sans text-lg font-medium text-bone-vellum">
          Hydro-meteorological severity index
        </h3>
        <p className="max-w-md text-sm font-light text-drift-ash">
          Forecast unavailable for this location
        </p>
      </div>
    );
  }

  // 5. Done state with valid forecast
  const steps = forecast.p50.length;
  // Format labels: +1 ... +N steps
  const labels = Array.from({ length: steps }, (_, i) =>
    i === steps - 1 ? `+${i + 1} steps` : `+${i + 1}`,
  );

  const p50Start = forecast.p50[0];
  const p50End = forecast.p50[steps - 1];
  const ariaSummary = `Hydro-meteorological severity index starting at ${p50Start.toFixed(1)} and ending at ${p50End.toFixed(1)} over ${steps} steps.`;

  // SVG dimensions
  const width = 640;
  const height = 320;
  const padding = { top: 32, right: 36, bottom: 48, left: 48 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allValues = [
    ...forecast.p10,
    ...forecast.p50,
    ...forecast.p90,
  ];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  const scaleY = (v: number) =>
    padding.top + chartH - ((v - minVal) / range) * chartH;
  const scaleX = (i: number) =>
    padding.left + (i / (steps - 1 || 1)) * chartW;

  const pointsP10 = forecast.p10.map((v, i) => ({ x: scaleX(i), y: scaleY(v) }));
  const pointsP50 = forecast.p50.map((v, i) => ({ x: scaleX(i), y: scaleY(v) }));
  const pointsP90 = forecast.p90.map((v, i) => ({ x: scaleX(i), y: scaleY(v) }));

  // Band: forward along P90, backward along P10
  const bandPath = `M ${pointsP90.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")} L ${[...pointsP10].reverse().map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")} Z`;
  const lineP50 = pointsP50.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");

  const shouldAnimate = !(reducedMotion || lite);

  return (
    <div className="flex h-full flex-col justify-between border border-iron-filings/70 bg-obsidian-loam/40 p-6 md:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-surveyor" />
          <h3 className="font-sans text-lg font-medium tracking-tight text-bone-vellum">
            Hydro-meteorological severity index
          </h3>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-drift-ash">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-lime-surveyor" />
            p50 median
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-[3.6px] bg-lime-surveyor/15 border border-lime-surveyor/40" />
            p10–p90 band
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaSummary}
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="fanGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ebfc72" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ebfc72" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {Array.from({ length: 5 }, (_, i) => {
          const yRatio = i / 4;
          const yVal = padding.top + chartH - yRatio * chartH;
          const labelVal = minVal + yRatio * range;
          return (
            <g key={`hgrid-${i}`}>
              <line
                x1={padding.left}
                y1={yVal}
                x2={padding.left + chartW}
                y2={yVal}
                stroke="rgba(244,243,232,0.08)"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={yVal + 3}
                textAnchor="end"
                className="font-mono text-[9px] fill-drift-ash/70"
              >
                {labelVal.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Vertical tick lines */}
        {labels.map((_, i) => {
          const x = scaleX(i);
          return (
            <line
              key={`vgrid-${i}`}
              x1={x}
              y1={padding.top}
              x2={x}
              y2={padding.top + chartH}
              stroke="rgba(244,243,232,0.08)"
              strokeWidth={1}
            />
          );
        })}

        {/* p10-p90 band (~0.15 opacity) */}
        <path d={bandPath} fill="url(#fanGradient)" />

        {/* p90 boundary */}
        <polyline
          points={pointsP90.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
          fill="none"
          stroke="#84837b"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="4 3"
        />

        {/* p10 boundary */}
        <polyline
          points={pointsP10.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
          fill="none"
          stroke="#84837b"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="4 3"
        />

        {/* p50 line (lime surveyor, 2px) with draw-in animation */}
        <path
          d={`M ${lineP50}`}
          fill="none"
          stroke="#ebfc72"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={
            shouldAnimate
              ? {
                  strokeDasharray: 1000,
                  strokeDashoffset: 1000,
                  animation: "dashDraw 1.2s ease-out forwards",
                }
              : {
                  strokeDashoffset: 0,
                }
          }
        />

        {/* Data dots on p50 */}
        {pointsP50.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={i === 0 || i === pointsP50.length - 1 ? 3.5 : 2}
            fill="#ebfc72"
            stroke="#13140e"
            strokeWidth={1}
          />
        ))}

        {/* X-axis tick labels */}
        {labels.map((label, i) => (
          <text
            key={`label-${i}`}
            x={scaleX(i)}
            y={padding.top + chartH + 20}
            textAnchor="middle"
            className="font-mono text-[10px] uppercase tracking-wider fill-drift-ash"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Visually-hidden data table for screen readers */}
      <table className="sr-only" aria-label="Hydro-meteorological severity index data table">
        <thead>
          <tr>
            <th scope="col">Step</th>
            <th scope="col">P10</th>
            <th scope="col">P50</th>
            <th scope="col">P90</th>
          </tr>
        </thead>
        <tbody>
          {forecast.p50.map((_, i) => (
            <tr key={i}>
              <th scope="row">+{i + 1}</th>
              <td>{forecast.p10[i]?.toFixed(1)}</td>
              <td>{forecast.p50[i]?.toFixed(1)}</td>
              <td>{forecast.p90[i]?.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ForecastSkeleton() {
  return (
    <div className="flex h-full flex-col justify-between border border-iron-filings/70 bg-obsidian-loam/40 p-6 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-surveyor" />
          <div className="h-5 w-56 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
        </div>
        <div className="h-4 w-32 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
      </div>
      <div className="relative flex h-[240px] w-full items-center justify-center overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40">
        <div className="h-full w-full animate-shimmer-effect bg-gradient-to-r from-transparent via-bone-vellum/5 to-transparent" />
      </div>
    </div>
  );
}
