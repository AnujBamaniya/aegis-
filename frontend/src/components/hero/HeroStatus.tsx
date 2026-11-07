"use client";

import { useEventsFeed } from "@/hooks/useEventsFeed";
import { useHealth } from "@/hooks/useHealth";

/**
 * Live pill (0.75s) and status HUD (1.05s) from the hero revamp sequence. All
 * values are derived from the dataSource: health probe, measured latency,
 * feed count and the time of the last events sync. Exports: `HeroPill`
 * (Live:/Demo: pill in the copy column), `HeroStatus` (lg-only status card,
 * absolute bottom-right in the hero) and `HeroStatusGrid` (mobile card that
 * flows below the CTA).
 */
function formatClock(timestampMs: number | undefined): string | null {
  if (!timestampMs) return null;
  // Fixed locale keeps the label stable across renders.
  return new Date(timestampMs).toLocaleTimeString("en-GB", { hour12: false });
}

/** Emerald ping dot (or its pending/offline fallback states). */
function StatusDot({
  state,
}: {
  state: "online" | "pending" | "offline";
}) {
  if (state === "online") {
    return (
      <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-surveyor opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-surveyor" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 rounded-full ${
        state === "pending" ? "animate-pulse bg-white/40" : "bg-amber-500"
      }`}
    />
  );
}

function SystemHeader({ online }: { online: boolean }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-drift-ash">
      <span
        aria-hidden="true"
        className={`h-1 w-1 rounded-full ${
          online ? "animate-pulse bg-lime-surveyor" : "bg-amber-500"
        }`}
      />
      System status
    </p>
  );
}

function StatusCard({
  online,
  pending,
  demo,
  system,
  latencyMs,
  lastSync,
  eventCount,
  alertFlagged,
}: {
  online: boolean;
  pending: boolean;
  demo: boolean;
  system: string;
  latencyMs: number | null;
  lastSync: string | null;
  eventCount: number | null;
  alertFlagged: number | null;
}) {
  return (
    <div className="glass w-64 rounded-md border-iron-filings/60 px-4 py-4">
      <dl>
        <div className="mb-2 flex justify-between">
          <dt className="text-xs text-drift-ash">API</dt>
          <dd className="text-right">
            <span
              className={`text-xs ${online ? "text-lime-surveyor" : "text-amber-400"}`}
            >
              {pending ? "Syncing…" : online ? "Online" : "Offline"}
              {online && demo ? " · Demo" : ""}
            </span>
            {/* Small subtitle, not a headline value. */}
            <span className="block font-mono text-[10px] text-drift-ash">
              {system}
            </span>
          </dd>
        </div>
        <div className="mb-2 flex justify-between">
          <dt className="text-xs text-drift-ash">Latency</dt>
          <dd className="text-xs text-lime-surveyor">
            {latencyMs != null ? `${latencyMs} ms` : "—"}
          </dd>
        </div>
        <div className="mb-2 flex justify-between">
          <dt className="text-xs text-drift-ash">Last sync</dt>
          <dd className="text-xs text-lime-surveyor">{lastSync ?? "—"}</dd>
        </div>
      </dl>
      {/* Share of feed events currently flagged by GDACS Red/Orange alerts
          — derived from real data, never an invented uptime number. */}
      <div
        aria-hidden="true"
        className="h-px w-full overflow-hidden bg-iron-filings/70"
      >
        <div
          className="h-full bg-lime-surveyor transition-[width] duration-700 ease-out"
          style={{ width: alertFlagged != null ? `${alertFlagged}%` : "0%" }}
        />
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-drift-ash">
        {alertFlagged != null
          ? `${alertFlagged}% GDACS Red/Orange share`
          : "Awaiting feed"}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <p>
          <span className="block font-mono text-[10px] uppercase tracking-wider text-drift-ash">
            Events
          </span>
          <span className="font-mono text-sm text-bone-vellum">
            {eventCount ?? "—"}
          </span>
        </p>
        <p>
          <span className="block font-mono text-[10px] uppercase tracking-wider text-drift-ash">
            Poll
          </span>
          <span className="font-mono text-sm text-bone-vellum">5 min</span>
        </p>
      </div>
    </div>
  );
}

/** Shared hero status values, derived from the dataSource only. */
function useHeroStatusData() {
  const events = useEventsFeed();
  const health = useHealth();

  const online = health.data?.status === "online";
  const feedOnline = online && !events.isError;
  const demo = health.data?.source === "demo";
  const pillLabel = health.isPending
    ? "Syncing hazard feed"
    : feedOnline
      ? demo
        ? "Demo: simulated hazard feed"
        : "Live: GDACS hazard feed"
      : "Hazard feed offline";
  const lastSyncMs = events.dataUpdatedAt || health.dataUpdatedAt;
  const lastSync = formatClock(lastSyncMs);
  const eventCount = events.isSuccess ? events.data.count : null;
  const alertFlagged =
    events.isSuccess && events.data.events.length > 0
      ? Math.round(
          (events.data.events.filter(
            (event) =>
              event.alertLevel === "red" || event.alertLevel === "orange",
          ).length /
            events.data.events.length) *
            100,
        )
      : null;

  return {
    online: online ?? false,
    pending: health.isPending,
    demo: demo ?? false,
    system: health.data?.system ?? "—",
    latencyMs: health.data?.latencyMs ?? null,
    lastSync,
    eventCount,
    alertFlagged,
    feedOnline,
    pillLabel,
  };
}

export function HeroPill({
  mobile = false,
}: {
  /** Mobile variant: left-aligned in flow above the headline, hidden on lg. */
  mobile?: boolean;
}) {
  const status = useHeroStatusData();

  return (
    <div
      className={`glass flex w-fit items-center gap-3 rounded-md px-3.5 py-2 opacity-0 animate-slide-up [animation-delay:0.75s] mb-5 ${
        mobile ? "self-start" : ""
      }`}
      role="status"
    >
      <StatusDot
        state={
          status.pending ? "pending" : status.feedOnline ? "online" : "offline"
        }
      />
      <span className="font-mono text-xs uppercase tracking-wider text-bone-vellum/90">
        {status.pillLabel}
      </span>
    </div>
  );
}

export function HeroStatus() {
  const status = useHeroStatusData();

  return (
    <>
      {/* Status card — bottom-right hero HUD, lg only, delay 1.05s */}
      <div className="absolute bottom-10 right-8 z-20 hidden flex-col gap-2 opacity-0 animate-slide-up [animation-delay:1.05s] lg:flex">
        <SystemHeader online={status.feedOnline} />
        <StatusCard {...status} />
      </div>
    </>
  );
}

/** Mobile variant: flows below the description card, hidden on lg. */
export function HeroStatusGrid() {
  const status = useHeroStatusData();

  return (
    <div className="flex flex-col gap-2 opacity-0 animate-slide-up [animation-delay:1.05s] lg:hidden">
      <SystemHeader online={status.feedOnline} />
      <StatusCard {...status} />
    </div>
  );
}
