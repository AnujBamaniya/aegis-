import type { AegisEvent } from "@/lib/adapters";

/**
 * GDACS alert levels for EVENT CARDS ONLY (P2 rule): the copy is
 * "GDACS Red / Orange / Green", tinted red / amber / emerald. Severity words
 * like CRITICAL or HIGH belong to infrastructure risk tiers, never here.
 */
export type AlertPresentation = {
  label: string;
  /** Small status dot tint. */
  dot: string;
  /** Chip tint (border + bg + text). */
  chip: string;
  /** Large-card backdrop tint. */
  backdrop: string;
  /** Raw CSS tint color for the generated HazardArt layer. */
  tint: string;
};

const NEUTRAL: AlertPresentation = {
  label: "No alert level",
  dot: "bg-white/30",
  chip: "border border-white/10 bg-white/5 text-white/40",
  backdrop: "from-white/10 to-transparent",
  tint: "rgba(255, 255, 255, 0.6)",
};

const RED: AlertPresentation = {
  label: "GDACS Red",
  dot: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
  chip: "border border-red-500/30 bg-red-500/20 text-red-400",
  backdrop: "from-red-500/15 to-transparent",
  tint: "#ef4444",
};

const ORANGE: AlertPresentation = {
  label: "GDACS Orange",
  dot: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]",
  chip: "border border-amber-500/30 bg-amber-500/20 text-amber-400",
  backdrop: "from-amber-500/15 to-transparent",
  tint: "#f59e0b",
};

const GREEN: AlertPresentation = {
  label: "GDACS Green",
  dot: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]",
  chip: "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
  backdrop: "from-emerald-500/15 to-transparent",
  tint: "#10b981",
};

export function alertPresentation(
  alertLevel: string | null,
): AlertPresentation {
  switch (alertLevel) {
    case "red":
      return RED;
    case "orange":
    case "yellow":
      return ORANGE;
    case "green":
      return GREEN;
    default:
      return NEUTRAL;
  }
}

export const EVENT_TYPE_LABEL: Record<AegisEvent["type"], string> = {
  TC: "Tropical cyclone",
  FL: "Flood",
  WF: "Wildfire",
};

export function formatCoords(event: AegisEvent): string {
  return `${event.lat.toFixed(2)}, ${event.lng.toFixed(2)}`;
}
