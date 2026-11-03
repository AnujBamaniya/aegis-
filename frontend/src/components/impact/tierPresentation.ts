import type { AegisAsset } from "@/lib/adapters";
import type { RiskTier } from "@/lib/schema";

/**
 * Risk tier presentation (DESIGN 3.3 + 10). Tier words (CRITICAL / HIGH /
 * MONITORING) belong to infrastructure only — never to events. Thresholds
 * mirror the backend rule in adapters.ts: 0 m, <=5 km, <=15 km, beyond.
 */
export type TierMeta = {
  tier: RiskTier;
  /** Visible text label — color never carries severity alone. */
  label: string;
  /** Chip classes from globals.css (.tier-*). */
  chip: string;
  /** Small status dot tint. */
  dot: string;
  /** Raw hex for map layers. */
  hex: string;
  /** Short threshold line under the tile count. */
  threshold: string;
};

export const TIER_ORDER: readonly RiskTier[] = [
  "CRITICAL_IMPACT",
  "HIGH_RISK",
  "ELEVATED",
  "MONITORING",
];

export const TIER_META: Record<RiskTier, TierMeta> = {
  CRITICAL_IMPACT: {
    tier: "CRITICAL_IMPACT",
    label: "Critical impact",
    chip: "tier-critical",
    dot: "bg-red-500",
    hex: "#ef4444",
    threshold: "0 m",
  },
  HIGH_RISK: {
    tier: "HIGH_RISK",
    label: "High risk",
    chip: "tier-high",
    dot: "bg-amber-500",
    hex: "#f59e0b",
    threshold: "≤ 5 km",
  },
  ELEVATED: {
    tier: "ELEVATED",
    label: "Elevated",
    chip: "tier-elevated",
    dot: "bg-blue-500",
    hex: "#3b82f6",
    threshold: "≤ 15 km",
  },
  MONITORING: {
    tier: "MONITORING",
    label: "Monitoring",
    chip: "tier-monitoring",
    dot: "bg-emerald-500",
    hex: "#10b981",
    threshold: "Beyond 15 km",
  },
};

export type TierCounts = Record<RiskTier, number>;

/** Counts are computed client-side from the deduped assets (PLAN P3). */
export function countTiers(assets: AegisAsset[]): TierCounts {
  const counts: TierCounts = {
    CRITICAL_IMPACT: 0,
    HIGH_RISK: 0,
    ELEVATED: 0,
    MONITORING: 0,
  };
  for (const asset of assets) counts[asset.riskTier] += 1;
  return counts;
}

/** "Assets at risk" = CRITICAL + HIGH + ELEVATED (MONITORING excluded). */
export function countAtRisk(counts: TierCounts): number {
  return counts.CRITICAL_IMPACT + counts.HIGH_RISK + counts.ELEVATED;
}

export function formatDistance(meters: number | null): string {
  if (meters === null || !Number.isFinite(meters)) return "—";
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

/** Closest first; assets without a distance sink to the end. Immutable sort. */
export function sortAssetsByDistance(assets: AegisAsset[]): AegisAsset[] {
  return assets.toSorted(
    (a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity),
  );
}

/**
 * Data-driven circle colour expression for the infrastructure layers:
 * ["match", ["get", "tier"], CRITICAL, red, HIGH, amber, ELEVATED, blue,
 *  MONITORING, emerald, fallback].
 */
export function tierColorExpression(): readonly unknown[] {
  const expression: unknown[] = [
    "match",
    ["get", "tier"],
    "CRITICAL_IMPACT",
    TIER_META.CRITICAL_IMPACT.hex,
    "HIGH_RISK",
    TIER_META.HIGH_RISK.hex,
    "ELEVATED",
    TIER_META.ELEVATED.hex,
    TIER_META.MONITORING.hex,
  ];
  return expression;
}

/**
 * Footprint paint colour from the GDACS alert level (DESIGN 10). Falls back
 * to neutral when the event carries no alert level.
 */
export function footprintHex(alertLevel: string | null): string {
  switch (alertLevel) {
    case "red":
      return TIER_META.CRITICAL_IMPACT.hex;
    case "orange":
    case "yellow":
      return TIER_META.HIGH_RISK.hex;
    case "green":
      return TIER_META.MONITORING.hex;
    default:
      return "#94a3b8";
  }
}

/** "Hospital" -> "Hospital", "fire_station" -> "Fire Station". */
export function assetTypeLabel(assetType: string): string {
  return assetType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
