"use client";

import { useEventsFeed } from "@/hooks/useEventsFeed";
import { useHealth } from "@/hooks/useHealth";

/**
 * Live pill (2.5s) and status card (2.4s) from the §7.2 hero sequence. All
 * values are derived from the dataSource: health probe, measured latency,
 * feed count and the time of the last events sync. Exports: `HeroPill`
 * (Live:/Demo: pill, in normal flow — mobile above the headline, lg in the
 * right column above the description card), `HeroStatus` (lg-only status
 * card, absolute in the hero) and `HeroStatusGrid` (mobile card that flows
 * below the description card).
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
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
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
    <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
      <span
        aria-hidden="true"
        className={`h-1 w-1 rounded-full ${
          online ? "animate-pulse bg-emerald-500" : "bg-amber-500"
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
    <div className="glass w-64 rounded-xl px-4 py-4">
      <dl>
        <div className="mb-2 flex justify-between">
          <dt className="text-xs text-white/60">API</dt>
          <dd className="text-right">
            <span
              className={`text-xs ${online ? "text-emerald-400" : "text-amber-400"}`}
            >
              {pending ? "Syncing…" : online ? "Online" : "Offline"}
              {online && demo ? " · Demo" : ""}
            </span>
            {/* Small subtitle, not a headline value. */}
            <span className="block font-mono text-[10px] text-neutral-400">
              {system}
            </span>
          </dd>
        </div>
        <div className="mb-2 flex justify-between">
          <dt className="text-xs text-white/60">Latency</dt>
          <dd className="text-xs text-emerald-400">
            {latencyMs != null ? `${latencyMs} ms` : "—"}
          </dd>
        </div>
        <div className="mb-2 flex justify-between">
          <dt className="text-xs text-white/60">Last sync</dt>
          <dd className="text-xs text-emerald-400">{lastSync ?? "—"}</dd>
        </div>
      </dl>
      {/* Share of feed events currently flagged by GDACS Red/Orange alerts
          — derived from real data, never an invented uptime number. */}
      <div
        aria-hidden="true"
        className="h-1 w-full overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-[width] duration-700 ease-out"
          style={{ width: alertFlagged != null ? `${alertFlagged}%` : "0%" }}
        />
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
        {alertFlagged != null
          ? `${alertFlagged}% GDACS Red/Orange share`
          : "Awaiting feed"}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <p>
          <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            Events
          </span>
          <span className="font-mono text-sm text-white">
            {eventCount ?? "—"}
          </span>
        </p>
        <p>
          <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            Poll
          </span>
          <span className="font-mono text-sm text-white">5 min</span>
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
      className={`glass flex w-fit items-center gap-3 rounded-lg px-4 py-2 opacity-0 animate-slide-up [animation-delay:2.5s] ${
        mobile ? "mb-4 self-start lg:hidden" : "mb-4 self-end hidden lg:flex"
      }`}
      role="status"
    >
      <StatusDot
        state={
          status.pending ? "pending" : status.feedOnline ? "online" : "offline"
        }
      />
      <span className="font-mono text-xs uppercase tracking-wider text-white/90">
        {status.pillLabel}
      </span>
    </div>
  );
}

export function HeroStatus() {
  const status = useHeroStatusData();

  return (
    <>
      {/* Status card — bottom-left hero HUD, lg only, delay 2.4s */}
      <div className="absolute bottom-10 left-8 z-20 hidden flex-col gap-2 opacity-0 animate-slide-up [animation-delay:2.4s] lg:flex">
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
    <div className="flex flex-col gap-2 opacity-0 animate-slide-up [animation-delay:2.4s] lg:hidden">
      <SystemHeader online={status.feedOnline} />
      <StatusCard {...status} />
    </div>
  );
}
