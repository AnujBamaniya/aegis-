import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const eventTypeSchema = z.enum(["TC", "FL", "WF"]);
export type EventType = z.infer<typeof eventTypeSchema>;

export const riskTierSchema = z.enum([
  "CRITICAL_IMPACT",
  "HIGH_RISK",
  "ELEVATED",
  "MONITORING",
]);
export type RiskTier = z.infer<typeof riskTierSchema>;

/** Mock-mode scenario switch (see BACKEND_CONTRACT.md "Mock fixtures required"). */
export const mockCaseSchema = z.enum([
  "ok",
  "empty",
  "error",
  "slow",
  "noforecast",
  "llmerror",
]);
export type MockCase = z.infer<typeof mockCaseSchema>;

// ---------------------------------------------------------------------------
// Events (GDACS). Property names beyond eventtype/eventid/episodeid are
// UNVERIFIED: all extra fields stay optional and schemas stay loose.
// ---------------------------------------------------------------------------

const pointGeometrySchema = z.looseObject({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const eventPropertiesSchema = z.looseObject({
  eventtype: z.string(),
  eventid: z.union([z.string(), z.number()]),
  episodeid: z.union([z.string(), z.number()]),
  name: z.string().nullish(),
  alertlevel: z.string().nullish(),
  alertscore: z.number().nullish(),
  country: z.string().nullish(),
  iso3: z.string().nullish(),
  fromdate: z.string().nullish(),
  todate: z.string().nullish(),
  description: z.string().nullish(),
  severitydata: z
    .looseObject({
      severity: z.number().nullish(),
      severitytext: z.string().nullish(),
      severityunit: z.string().nullish(),
    })
    .nullish(),
  url: z.looseObject({ detail: z.string().nullish() }).nullish(),
});

export const eventFeatureSchema = z.looseObject({
  type: z.literal("Feature"),
  geometry: pointGeometrySchema,
  properties: eventPropertiesSchema,
});

export const eventsResponseSchema = z.looseObject({
  count: z.number(),
  events: z.array(eventFeatureSchema),
});

// ---------------------------------------------------------------------------
// Footprint + infrastructure. Footprint geometry is mixed (Polygon /
// LineString / Point) and only validated for real once the map consumes it.
// ---------------------------------------------------------------------------

export const featureSchema = z.looseObject({
  type: z.literal("Feature"),
  geometry: z.unknown(),
  properties: z.unknown(),
});

export const featureCollectionSchema = z.looseObject({
  type: z.literal("FeatureCollection"),
  features: z.array(featureSchema),
});

export const polygonResponseSchema = featureCollectionSchema;

export const infrastructurePropertiesSchema = z.looseObject({
  osm_id: z.union([z.string(), z.number()]),
  name: z.string().nullish(),
  name_left: z.string().nullish(),
  asset_type: z.string(),
  distance_meters: z.number().nullish(),
  risk_tier: z.string().nullish(),
  synthetic: z.boolean().nullish(),
});

export const infrastructureFeatureSchema = z.looseObject({
  type: z.literal("Feature"),
  geometry: pointGeometrySchema,
  properties: infrastructurePropertiesSchema,
});

/**
 * Accepts both the plain FeatureCollection and the buggy
 * `{ message, type, features: [] }` shape. A missing `features` array degrades
 * to [] (EMPTY) instead of throwing.
 */
export const infrastructureResponseSchema = z.looseObject({
  type: z.string(),
  features: z.array(infrastructureFeatureSchema).catch([]),
});

// ---------------------------------------------------------------------------
// Briefing (local LLM). HTTP 200 with "**Error** ..." text = service failure,
// handled in dataSource via isBriefingServiceFailure().
// ---------------------------------------------------------------------------

export const briefingResponseSchema = z.looseObject({
  event: z.string(),
  infrastructure_stats: z.record(z.string(), z.number()).nullish(),
  ai_forecast: z
    .looseObject({
      p10: z.array(z.number()).nullish(),
      p50: z.array(z.number()).nullish(),
      p90: z.array(z.number()).nullish(),
    })
    .nullish(),
  executive_briefing: z.string(),
});

export const healthResponseSchema = z.looseObject({
  status: z.string(),
  system: z.string(),
});
