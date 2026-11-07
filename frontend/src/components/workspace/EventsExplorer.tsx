"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DataSourceError } from "@/lib/dataSource";
import { RefreshIcon } from "@/components/icons";
import { EVENT_TYPE_LABEL } from "@/components/workspace/alertPresentation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  EventCardLarge,
  EventCardSmall,
} from "@/components/workspace/EventCards";
import { FilterTrack } from "@/components/workspace/FilterTrack";
import {
  useWorkspace,
  useWorkspaceSelectedId,
  type ThreatFilter,
} from "@/components/workspace/WorkspaceProvider";
import { useEventsFeed } from "@/hooks/useEventsFeed";
import type { AegisEvent } from "@/lib/adapters";
import type { EventType } from "@/lib/schema";

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40 ${className}`}
    >
      <div aria-hidden="true" className="flex flex-col gap-4 p-8">
        <div className="h-4 w-24 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
        <div className="h-7 w-2/3 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
        <div className="h-4 w-1/2 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 -translate-x-full animate-shimmer-effect bg-gradient-to-r from-transparent via-bone-vellum/5 to-transparent"
      />
    </div>
  );
}

/** Calm empty state (4-state contract): no red, no alarm, no card chrome. */
function EmptyState({ filter }: { filter: ThreatFilter }) {
  return (
    <div className="col-span-1 border border-iron-filings/70 bg-obsidian-loam/40 px-8 py-20 md:col-span-12">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-drift-ash">
        Feed clear
      </p>
      <p className="text-lg font-light text-drift-ash">
        {filter === "ALL"
          ? "No active events are reported in the current scan window."
          : `No ${EVENT_TYPE_LABEL[filter].toLowerCase()} events are reported in the current scan window.`}
      </p>
    </div>
  );
}

/** Inline error with manual retry (4-state contract). */
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="col-span-1 flex flex-wrap items-center justify-between gap-4 border border-iron-filings/70 bg-obsidian-loam/40 p-6 md:col-span-12"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-red-400">
          Threat feed unavailable
        </p>
        <p className="mt-1 text-sm font-light text-drift-ash">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 rounded-[3.6px] border border-iron-filings px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-bone-vellum transition-colors duration-200 hover:border-lime-surveyor hover:text-lime-surveyor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor"
      >
        <RefreshIcon className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

/**
 * Active Threats board (PLAN P2, DESIGN 8.4-8.6). Featured card (col-span-8,
 * min-h 480px) + a right stack of the next two events + remaining events as
 * compact cards. Selecting any card makes it featured. On a filter switch the
 * old cards fade out for 300ms, then the new list swaps in with a staggered
 * entrance (skipped under prefers-reduced-motion). React Query polling, the
 * four data states and `?case=` handling are untouched.
 */
export function EventsExplorer() {
  const events = useEventsFeed();
  const { filter, setFilter, select, isBriefingRunning } = useWorkspace();
  const workspaceSelectedId = useWorkspaceSelectedId();

  // Filter-swap choreography: the workspace filter flips immediately (so the
  // buttons answer at once), while the list keeps the old channel for 300ms.
  const [displayedFilter, setDisplayedFilter] = useState<ThreatFilter>(filter);
  const [leaving, setLeaving] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
      if (swapTimer.current) clearTimeout(swapTimer.current);
    };
  }, []);

  const handleFilter = useCallback(
    (next: ThreatFilter) => {
      setFilter(next);
      if (swapTimer.current) {
        clearTimeout(swapTimer.current);
        swapTimer.current = null;
      }
      if (reducedMotion) {
        setDisplayedFilter(next);
        setLeaving(false);
        return;
      }
      setLeaving(true);
      swapTimer.current = setTimeout(() => {
        swapTimer.current = null;
        setDisplayedFilter(next);
        setLeaving(false);
      }, 300);
    },
    [reducedMotion, setFilter],
  );

  const allEvents = events.data?.events ?? [];
  const filtered: AegisEvent[] =
    displayedFilter === "ALL"
      ? allEvents
      : allEvents.filter((event) => event.type === displayedFilter);

  // The workspace selection wins while it is in view; otherwise the first
  // event of the active filter channel becomes the primary card.
  const selectedId = filtered.some(
    (event) => event.id === workspaceSelectedId,
  )
    ? workspaceSelectedId
    : filtered[0]?.id ?? null;

  const featuredIndex = filtered.findIndex(
    (event) => event.id === selectedId,
  );
  const featured = featuredIndex >= 0 ? filtered[featuredIndex] : undefined;
  const rest = filtered.filter((event) => event.id !== selectedId);
  const stack = rest.slice(0, 2);
  const compact = rest.slice(2);

  const rankOf = (event: AegisEvent) =>
    filtered.findIndex((item) => item.id === event.id) + 1;

  const enterDelayFor = (slot: number) =>
    leaving || reducedMotion ? null : slot * 75;

  const counts = events.isSuccess
    ? {
        ALL: allEvents.length,
        TC: allEvents.filter((event) => event.type === ("TC" as EventType)).length,
        FL: allEvents.filter((event) => event.type === ("FL" as EventType)).length,
        WF: allEvents.filter((event) => event.type === ("WF" as EventType)).length,
      }
    : null;

  const errorMessage =
    events.error instanceof DataSourceError
      ? events.error.message
      : "Unexpected failure while fetching events.";

  return (
    <div>
      <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          index="01"
          eyebrow="Hazard feed"
          title="Active threats"
          description="Live GDACS events streaming through the platform. Select a threat to make it the featured card, then open its impact workspace below."
        />
        {events.isSuccess ? (
          <FilterTrack filter={filter} onFilter={handleFilter} counts={counts} />
        ) : null}
      </div>

      {/* aria-live region: filter counts and result size reach screen readers
          without moving focus. */}
      <p
        role="status"
        aria-live="polite"
        className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-drift-ash"
      >
        {events.isPending
          ? "Loading threat feed…"
          : events.isError
            ? "Feed errored — showing details below."
            : counts
              ? `Showing ${filtered.length} of ${counts.ALL} events: tropical cyclones ${counts.TC}, floods ${counts.FL}, wildfires ${counts.WF}`
              : ""}
      </p>

      {/* Visible note while briefing is running (P4 rule) */}
      {isBriefingRunning && (
        <div
          role="status"
          className="mb-6 flex items-center gap-3 border border-lime-surveyor/25 bg-lime-surveyor/5 px-4 py-3 text-sm text-bone-vellum"
        >
          <span className="h-2 w-2 rounded-full bg-lime-surveyor animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-drift-ash">
            Briefing in progress. The backend handles one request at a time.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {events.isPending ? (
          <>
            <SkeletonCard className="min-h-[480px] md:col-span-8" />
            <div className="flex flex-col gap-6 md:col-span-4">
              <SkeletonCard className="min-h-[228px]" />
              <SkeletonCard className="min-h-[228px]" />
            </div>
          </>
        ) : null}

        {events.isError ? (
          <ErrorState
            message={errorMessage}
            onRetry={() => {
              void events.refetch();
            }}
          />
        ) : null}

        {events.isSuccess && counts && counts.ALL === 0 ? (
          <EmptyState filter="ALL" />
        ) : null}

        {/* Featured card + right stack + compact grid. If a filter has no
            events but the feed is non-empty, show a calm per-channel
            message. Keys include the channel so a swap remounts the cards
            and the staggered entrance plays. */}
        {events.isSuccess && featured ? (
          <>
            <EventCardLarge
              key={`${displayedFilter}:${featured.id}`}
              event={featured}
              rank={featuredIndex + 1}
              wide={stack.length === 0}
              leaving={leaving}
              enterDelay={enterDelayFor(0)}
            />
            {stack.length > 0 ? (
              <div className="flex min-w-0 flex-col gap-6 md:col-span-4">
                {stack.map((event, index) => (
                  <EventCardSmall
                    key={`${displayedFilter}:${event.id}-${event.episodeId}`}
                    event={event}
                    rank={rankOf(event)}
                    selected={false}
                    onSelect={isBriefingRunning ? undefined : select}
                    leaving={leaving}
                    enterDelay={enterDelayFor(index + 1)}
                  />
                ))}
              </div>
            ) : null}
            {compact.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:col-span-12 lg:grid-cols-3">
                {compact.map((event, index) => (
                  <EventCardSmall
                    key={`${displayedFilter}:${event.id}-${event.episodeId}`}
                    event={event}
                    rank={rankOf(event)}
                    selected={false}
                    onSelect={isBriefingRunning ? undefined : select}
                    leaving={leaving}
                    enterDelay={enterDelayFor(index + 3)}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        {events.isSuccess &&
        counts &&
        counts.ALL > 0 &&
        filtered.length === 0 ? (
          <EmptyState filter={displayedFilter} />
        ) : null}
      </div>
    </div>
  );
}
