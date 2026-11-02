import {
  isBriefingServiceFailure,
  normalizeAssets,
  normalizeBriefing,
  normalizeEvents,
  normalizeFootprint,
  type AegisAsset,
  type AegisBriefing,
  type AegisEvent,
  type FootprintFeature,
} from "./adapters";
import { healthResponseSchema, type MockCase } from "./schema";
import { briefingLlmerrorFixture } from "@/mocks/fixtures/briefing-llmerror";
import { briefingNoforecastFixture } from "@/mocks/fixtures/briefing-noforecast";
import { briefingOkFixture } from "@/mocks/fixtures/briefing-ok";
import { eventsFixture } from "@/mocks/fixtures/events";
import { infrastructureFixture } from "@/mocks/fixtures/infrastructure";
import { polygonFixture } from "@/mocks/fixtures/polygon";

export { mockCaseSchema } from "./schema";
export type { MockCase } from "./schema";

/** One switch: `NEXT_PUBLIC_DATA_MODE=mock|live` (default mock). */
export const DATA_MODE: "mock" | "live" =
  process.env.NEXT_PUBLIC_DATA_MODE === "live" ? "live" : "mock";

export class DataSourceError extends Error {
  readonly kind: "network" | "briefing";

  constructor(kind: "network" | "briefing", message: string) {
    super(message);
    this.name = "DataSourceError";
    this.kind = kind;
  }
}

export type RequestOpts = {
  case?: MockCase;
  signal?: AbortSignal;
};

const TIMEOUT_MS = {
  health: 5_000,
  events: 15_000,
  polygon: 20_000,
  infrastructure: 30_000,
  briefing: 180_000,
} as const;

export type HealthProbe = {
  status: "online" | "offline";
  system: string;
  source: "demo" | "live";
};

type EventRef = Pick<AegisEvent, "type" | "id" | "episodeId">;

function combineSignal(
  timeoutMs: number,
  signal?: AbortSignal,
): AbortSignal {
  return signal
    ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
    : AbortSignal.timeout(timeoutMs);
}

/** Live mode goes exclusively through the Next route handler proxy. */
async function proxyGet(
  path: string,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api/aegis${path}`, {
      signal: combineSignal(timeoutMs, signal),
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new DataSourceError("network", "Network request failed");
  }
  if (response.status === 404) return null; // EMPTY, not an error
  if (!response.ok) {
    throw new DataSourceError("network", `Upstream responded ${response.status}`);
  }
  return response.json();
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function getEvents(
  opts: RequestOpts = {},
): Promise<{ events: AegisEvent[]; count: number }> {
  const mockCase = opts.case ?? "ok";
  if (DATA_MODE === "mock") {
    if (mockCase === "empty") return { events: [], count: 0 };
    if (mockCase === "error") {
      await delay(600);
      throw new DataSourceError("network", "Upstream unavailable");
    }
    await delay(mockCase === "slow" ? 5_000 : 500);
    return normalizeEvents(eventsFixture);
  }
  const raw = await proxyGet("/api/v1/events/", TIMEOUT_MS.events, opts.signal);
  return raw === null ? { events: [], count: 0 } : normalizeEvents(raw);
}

// ---------------------------------------------------------------------------
// Footprint
// ---------------------------------------------------------------------------

export async function getPolygon(
  event: EventRef,
  opts: RequestOpts = {},
): Promise<FootprintFeature[] | null> {
  const mockCase = opts.case ?? "ok";
  if (DATA_MODE === "mock") {
    if (mockCase === "empty") return null; // "not yet published"
    if (mockCase === "error") {
      await delay(600);
      throw new DataSourceError("network", "Upstream unavailable");
    }
    await delay(mockCase === "slow" ? 4_000 : 400);
    return normalizeFootprint(polygonFixture);
  }
  const raw = await proxyGet(
    `/api/v1/events/${event.type}/${event.id}/${event.episodeId}/polygon`,
    TIMEOUT_MS.polygon,
    opts.signal,
  );
  return raw === null ? null : normalizeFootprint(raw);
}

// ---------------------------------------------------------------------------
// Infrastructure
// ---------------------------------------------------------------------------

export async function getInfrastructure(
  event: EventRef,
  opts: RequestOpts = {},
): Promise<AegisAsset[]> {
  const mockCase = opts.case ?? "ok";
  if (DATA_MODE === "mock") {
    if (mockCase === "empty") return [];
    if (mockCase === "error") {
      await delay(600);
      throw new DataSourceError("network", "Upstream unavailable");
    }
    await delay(mockCase === "slow" ? 4_000 : 400);
    return normalizeAssets(infrastructureFixture);
  }
  const raw = await proxyGet(
    `/api/v1/impact/${event.type}/${event.id}/${event.episodeId}/infrastructure`,
    TIMEOUT_MS.infrastructure,
    opts.signal,
  );
  return raw === null ? [] : normalizeAssets(raw);
}

// ---------------------------------------------------------------------------
// Briefing (SLOW: never auto-retried by callers)
// ---------------------------------------------------------------------------

export async function getBriefing(
  event: EventRef,
  opts: RequestOpts = {},
): Promise<AegisBriefing> {
  const mockCase = opts.case ?? "ok";
  if (DATA_MODE === "mock") {
    if (mockCase === "error") {
      await delay(600);
      throw new DataSourceError("network", "Upstream unavailable");
    }
    const fixture =
      mockCase === "noforecast"
        ? briefingNoforecastFixture
        : mockCase === "llmerror"
          ? briefingLlmerrorFixture
          : briefingOkFixture;
    await delay(
      mockCase === "slow" ? 8_000 : mockCase === "llmerror" ? 2_000 : 900,
    );
    if (isBriefingServiceFailure(fixture)) {
      throw new DataSourceError("briefing", "Briefing service unavailable");
    }
    return normalizeBriefing(fixture);
  }
  const raw = await proxyGet(
    `/api/v1/intelligence/${event.type}/${event.id}/${event.episodeId}/briefing`,
    TIMEOUT_MS.briefing,
    opts.signal,
  );
  if (raw === null) {
    throw new DataSourceError("network", "Briefing endpoint not found");
  }
  if (isBriefingServiceFailure(raw)) {
    throw new DataSourceError("briefing", "Briefing service unavailable");
  }
  return normalizeBriefing(raw);
}

// ---------------------------------------------------------------------------
// Health probe ("/"): proxy path only. In mock mode the probe is simulated.
// ---------------------------------------------------------------------------

export async function getHealth(
  opts: { signal?: AbortSignal } = {},
): Promise<HealthProbe> {
  if (DATA_MODE === "mock") {
    await delay(300);
    return { status: "online", system: "Aegis Matrix", source: "demo" };
  }
  try {
    const raw = await proxyGet("/", TIMEOUT_MS.health, opts.signal);
    const parsed = healthResponseSchema.parse(raw);
    return {
      status: parsed.status === "online" ? "online" : "offline",
      system: parsed.system,
      source: "live",
    };
  } catch (error) {
    if (opts.signal?.aborted) throw error; // cancellation belongs to the caller
    return { status: "offline", system: "Aegis API", source: "live" };
  }
}
