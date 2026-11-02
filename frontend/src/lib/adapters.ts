import {
  briefingResponseSchema,
  eventsResponseSchema,
  eventTypeSchema,
  featureCollectionSchema,
  infrastructureResponseSchema,
  riskTierSchema,
  type EventType,
  type RiskTier,
} from "./schema";

// ---------------------------------------------------------------------------
// Normalized domain types (what the UI is allowed to see)
// ---------------------------------------------------------------------------

export type AegisEvent = {
  id: string;
  episodeId: string;
  type: EventType;
  name: string;
  /** Lowercased GDACS alert level, or null when the event has no props. */
  alertLevel: string | null;
  alertScore: number | null;
  severityText: string | null;
  country: string | null;
  iso3: string | null;
  fromDate: string | null;
  toDate: string | null;
  description: string | null;
  detailUrl: string | null;
  lng: number;
  lat: number;
};



export type AegisAsset = {
  osmId: string;
  name: string;
  assetType: string;
  distanceMeters: number | null;
  riskTier: RiskTier;
  /** Synthetic fallback asset: show "Modeled baseline" badge. */
  synthetic: boolean;
  lng: number;
  lat: number;
};

export type AegisBriefing = {
  event: string;
  infrastructureStats: Partial<Record<RiskTier, number>>;
  /** null -> render "Forecast unavailable for this location". */
  forecast: { p10: number[]; p50: number[]; p90: number[] } | null;
  briefing: string;
};

export type FootprintFeature = {
  geometryType: "Polygon" | "LineString" | "Point";
  coordinates: unknown;
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function normalizeEvents(raw: unknown): {
  events: AegisEvent[];
  count: number;
} {
  const parsed = eventsResponseSchema.parse(raw);
  const events: AegisEvent[] = [];

  for (const feature of parsed.events) {
    const type = eventTypeSchema.safeParse(
      feature.properties.eventtype.toUpperCase(),
    );
    if (!type.success) continue; // ignore unknown event types, never crash

    const props = feature.properties;
    events.push({
      id: String(props.eventid),
      episodeId: String(props.episodeid),
      type: type.data,
      name: props.name ?? `Unnamed event ${props.eventid}`,
      alertLevel: props.alertlevel?.trim().toLowerCase() ?? null,
      alertScore: props.alertscore ?? null,
      severityText: props.severitydata?.severitytext ?? null,
      country: props.country ?? null,
      iso3: props.iso3 ?? null,
      fromDate: props.fromdate ?? null,
      toDate: props.todate ?? null,
      description: props.description ?? null,
      detailUrl: props.url?.detail ?? null,
      lng: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
    });
  }

  return { events, count: parsed.count };
}

// ---------------------------------------------------------------------------
// Infrastructure
// ---------------------------------------------------------------------------

/** Backend rule: 0 m -> CRITICAL, <=5000 HIGH, <=15000 ELEVATED, else MONITORING. */
export function tierFromDistance(distance: number | null): RiskTier {
  if (distance === null) return "MONITORING";
  if (distance <= 0) return "CRITICAL_IMPACT";
  if (distance <= 5000) return "HIGH_RISK";
  if (distance <= 15000) return "ELEVATED";
  return "MONITORING";
}

/** Synthetic fallback assets: flag or osm_id inside 900001..900007. */
export function isSyntheticOsm(osmId: string | number): boolean {
  const value = typeof osmId === "number" ? osmId : Number(osmId);
  return Number.isFinite(value) && value >= 900001 && value <= 900007;
}

export function normalizeAssets(raw: unknown): AegisAsset[] {
  const parsed = infrastructureResponseSchema.parse(raw);
  const byKey = new Map<string, AegisAsset>();

  for (const feature of parsed.features) {
    const props = feature.properties;
    const tier = riskTierSchema.safeParse(props.risk_tier ?? "");
    const asset: AegisAsset = {
      osmId: String(props.osm_id),
      name: props.name ?? props.name_left ?? "Unnamed asset",
      assetType: props.asset_type,
      distanceMeters: props.distance_meters ?? null,
      riskTier: tier.success
        ? tier.data
        : tierFromDistance(props.distance_meters ?? null),
      synthetic: props.synthetic === true || isSyntheticOsm(props.osm_id),
      lng: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
    };

    // Dedupe (sjoin_nearest can duplicate rows): rounded coords + name,
    // keep the entry with the smaller distance_meters.
    const key = `${asset.lng.toFixed(5)}|${asset.lat.toFixed(5)}|${asset.name}`;
    const previous = byKey.get(key);
    if (!previous) {
      byKey.set(key, asset);
    } else if (
      asset.distanceMeters !== null &&
      (previous.distanceMeters === null ||
        asset.distanceMeters < previous.distanceMeters)
    ) {
      byKey.set(key, asset);
    }
  }

  return [...byKey.values()];
}

// ---------------------------------------------------------------------------
// Footprint
// ---------------------------------------------------------------------------

export function normalizeFootprint(raw: unknown): FootprintFeature[] {
  const parsed = featureCollectionSchema.parse(raw);
  const features: FootprintFeature[] = [];

  for (const feature of parsed.features) {
    const geometry = feature.geometry as
      | { type?: unknown; coordinates?: unknown }
      | null
      | undefined;
    const geometryType =
      typeof geometry?.type === "string" ? geometry.type : null;
    if (
      geometryType === "Polygon" ||
      geometryType === "LineString" ||
      geometryType === "Point"
    ) {
      features.push({ geometryType, coordinates: geometry?.coordinates });
    }
  }

  return features;
}

// ---------------------------------------------------------------------------
// Briefing
// ---------------------------------------------------------------------------

/** Backend bug 5: the LLM failure arrives as HTTP 200 with "**Error** ..." text. */
export function isBriefingServiceFailure(raw: unknown): boolean {
  const parsed = briefingResponseSchema.safeParse(raw);
  return (
    parsed.success &&
    parsed.data.executive_briefing.trimStart().startsWith("**Error**")
  );
}

export function normalizeBriefing(raw: unknown): AegisBriefing {
  const parsed = briefingResponseSchema.parse(raw);

  const infrastructureStats: Partial<Record<RiskTier, number>> = {};
  for (const [key, value] of Object.entries(
    parsed.infrastructure_stats ?? {},
  )) {
    const tier = riskTierSchema.safeParse(key);
    if (tier.success) infrastructureStats[tier.data] = value;
  }

  const forecastInput = parsed.ai_forecast;
  const p10 = forecastInput?.p10;
  const p50 = forecastInput?.p50;
  const p90 = forecastInput?.p90;
  const hasForecast = !!(p10?.length && p50?.length && p90?.length);

  return {
    event: parsed.event,
    infrastructureStats,
    forecast: hasForecast
      ? { p10: p10 ?? [], p50: p50 ?? [], p90: p90 ?? [] }
      : null,
    briefing: parsed.executive_briefing,
  };
}
