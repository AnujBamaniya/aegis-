"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  DATA_MODE,
  DataSourceError,
  getEvents,
  getHealth,
} from "@/lib/dataSource";
import { mockCaseSchema, type MockCase } from "@/lib/schema";
import type { AegisEvent } from "@/lib/adapters";

const CASE_COPY: Record<MockCase, string> = {
  ok: "Fixture feed streaming normally.",
  empty: "No events returned by the backend (HTTP 404 mapped to the EMPTY state).",
  error: "Upstream failure surfaces as an inline error with manual retry.",
  slow: "A slow upstream holds the skeleton for about five seconds.",
  noforecast: "Events load; the briefing payload carries no forecast arrays.",
  llmerror: "The briefer answers HTTP 200 with an error body (backend bug 5).",
};

const TIER_BY_ALERT: Record<
  string,
  { cls: string; label: string }
> = {
  red: { cls: "tier-critical", label: "critical" },
  orange: { cls: "tier-high", label: "high" },
  yellow: { cls: "tier-elevated", label: "elevated" },
  green: { cls: "tier-monitoring", label: "monitoring" },
};

function AlertChip({ alertLevel }: { alertLevel: string | null }) {
  const known = alertLevel ? TIER_BY_ALERT[alertLevel] : undefined;
  return (
    <span
      className={
        known
          ? `rounded-full px-2.5 py-0.5 text-xs font-mono uppercase tracking-widest ${known.cls}`
          : "rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-mono uppercase tracking-widest text-white/40"
      }
    >
      {known ? known.label : "no alert level"}
    </span>
  );
}

function SkeletonRow() {
  return (
    <li className="relative overflow-hidden rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-4">
      <div className="relative z-10 flex items-center gap-3">
        <div className="h-4 w-14 animate-pulse rounded bg-white/5" />
        <div className="h-4 w-1/2 max-w-xs animate-pulse rounded bg-white/5" />
        <div className="ml-auto h-4 w-24 animate-pulse rounded bg-white/5" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 -translate-x-full animate-shimmer-effect bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
    </li>
  );
}

function EventRow({ event }: { event: AegisEvent }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-3 transition-all duration-500 hover:border-white/20 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-mono text-xs text-blue-400">
          {event.type}
        </span>
        <span className="truncate font-bricolage text-xl font-light text-white">
          {event.name}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <AlertChip alertLevel={event.alertLevel} />
        {event.severityText ? (
          <span className="text-xs uppercase tracking-widest text-white/40">
            {event.severityText}
          </span>
        ) : null}
        <span className="font-mono text-xs tabular-nums text-white/30">
          {event.lat.toFixed(2)}, {event.lng.toFixed(2)}
        </span>
      </div>
    </li>
  );
}

export function EventsTestPanel() {
  const searchParams = useSearchParams();
  const mockCase = mockCaseSchema.catch("ok").parse(searchParams.get("case") ?? "ok");

  const events = useQuery({
    queryKey: ["test-events", mockCase],
    queryFn: ({ signal }) => getEvents({ case: mockCase, signal }),
    staleTime: Infinity,
  });
  const health = useQuery({
    queryKey: ["test-health"],
    queryFn: ({ signal }) => getHealth({ signal }),
  });

  const errorMessage =
    events.error instanceof DataSourceError
      ? events.error.message
      : "Unexpected failure";

  return (
    <section aria-labelledby="panel-heading" className="mt-12">
      <div className="flex flex-wrap items-center gap-3">
        <h2
          id="panel-heading"
          className="font-bricolage text-3xl font-medium tracking-tight text-white"
        >
          Affected{" "}
          <span className="font-light text-white/20">events states</span>
        </h2>
        <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-white/50">
          case={mockCase}
        </span>
      </div>
      <p className="mt-2 text-lg font-light text-white/60">
        {CASE_COPY[mockCase]}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <p
          aria-live="polite"
          className="font-mono text-xs uppercase tracking-widest text-white/40"
        >
          {events.isPending
            ? "Loading feed..."
            : `${events.data?.count ?? 0} events in feed · ${DATA_MODE} mode`}
        </p>
        <p className="font-mono text-xs uppercase tracking-widest text-white/40">
          API probe
          <span
            className={`ml-2 ${
              health.data?.status === "online"
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            {health.isPending
              ? "probing..."
              : health.data
                ? `${health.data.status} · ${
                    health.data.source === "demo"
                      ? "simulated (Demo)"
                      : "live via proxy"
                  }`
                : "offline"}
          </span>
        </p>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {events.isPending
          ? [0, 1, 2].map((index) => <SkeletonRow key={index} />)
          : null}

        {events.isError ? (
          <li>
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-red-400">
                  Event feed unavailable
                </p>
                <p className="mt-1 font-light text-sm text-white/50">
                  {errorMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void events.refetch();
                }}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              >
                Retry
              </button>
            </div>
          </li>
        ) : null}

        {events.isSuccess && events.data.events.length === 0 ? (
          <li className="rounded-xl border border-white/10 bg-neutral-900/40 px-4 py-8 text-center">
            <p className="text-lg font-light text-white/40">
              No active events reported right now.
            </p>
          </li>
        ) : null}

        {events.isSuccess
          ? events.data.events.map((event) => (
              <EventRow
                key={`${event.id}-${event.episodeId}`}
                event={event}
              />
            ))
          : null}
      </ul>
    </section>
  );
}
