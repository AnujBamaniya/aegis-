"use client";

import Image from "next/image";
import { useId } from "react";
import type { AegisEvent } from "@/lib/adapters";

/**
 * Optional photo overrides for the card art layers, keyed by hazard type.
 * EMPTY BY DEFAULT (P2): cards render generated CSS/SVG art instead. Drop a
 * path here (e.g. TC: "/images/tc.webp") to switch that type to a photo.
 * Synthetically sourced imagery must be marked as such where it is added.
 */
export const EVENT_IMAGES: Partial<Record<"TC" | "FL" | "WF", string>> = {};

/**
 * Generated hazard art (P2 recipe, NOT photos): TC = concentric spiral arcs,
 * FL = layered wave lines, WF = radial ember glow + noise. All tinted by the
 * GDACS alert colour at low opacity. Rendered art only — decorative.
 */
export function HazardArt({
  type,
  tint,
  className,
}: {
  type: AegisEvent["type"];
  tint: string;
  className?: string;
}) {
  const gradientId = useId();
  const image = EVENT_IMAGES[type];

  if (image) {
    return (
      <Image
        src={image}
        alt=""
        aria-hidden="true"
        fill
        sizes="(max-width: 768px) 100vw, 66vw"
        className={`object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className ?? ""}`}
      style={{ color: tint }}
    >
      {type === "TC" ? (
        <g fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="200" cy="200" r="6" fill="currentColor" fillOpacity="0.5" stroke="none" />
          <path d="M140 200a60 60 0 1 1 60 60" strokeOpacity="0.4" />
          <path d="M100 200a100 100 0 1 1 100 100" strokeOpacity="0.3" />
          <path d="M60 200a140 140 0 1 1 140 140" strokeOpacity="0.22" />
          <path d="M20 200a180 180 0 1 1 180 180" strokeOpacity="0.15" />
          <circle cx="200" cy="200" r="110" strokeOpacity="0.12" strokeDasharray="4 16" />
        </g>
      ) : type === "FL" ? (
        <g fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M0 230q50 -26 100 0t100 0t100 0t100 0" strokeOpacity="0.35" />
          <path d="M0 275q50 -26 100 0t100 0t100 0t100 0" strokeOpacity="0.28" />
          <path d="M0 320q50 -26 100 0t100 0t100 0t100 0" strokeOpacity="0.2" />
          <path d="M0 365q50 -26 100 0t100 0t100 0t100 0" strokeOpacity="0.13" />
        </g>
      ) : (
        <>
          <defs>
            <radialGradient id={`${gradientId}-glow`}>
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="55%" stopColor="currentColor" stopOpacity="0.12" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
            <filter id={`${gradientId}-noise`}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
          </defs>
          <circle cx="200" cy="230" r="180" fill={`url(#${gradientId}-glow)`} />
          <rect
            width="400"
            height="400"
            filter={`url(#${gradientId}-noise)`}
            fill="currentColor"
            fillOpacity="0.04"
          />
        </>
      )}
    </svg>
  );
}
