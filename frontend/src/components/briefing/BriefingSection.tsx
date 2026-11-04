"use client";

import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { MarkdownBrief } from "@/components/MarkdownBrief";
import {
  ForecastFanChart,
  type ForecastData,
  type ForecastStatus,
} from "./ForecastFanChart";
import { DataModeBadge } from "@/components/ui/DataModeBadge";
import {
  useWorkspace,
  useWorkspaceSelectedId,
} from "@/components/workspace/WorkspaceProvider";
import { useEventsFeed } from "@/hooks/useEventsFeed";
import type { MockCase } from "@/lib/dataSource";
import type { AegisEvent } from "@/lib/adapters";
import {
  getCached,
  getState,
  subscribe,
  runBriefing,
  cancel,
  invalidateCache,
  clearError,
} from "@/lib/briefingModule";
import {
  formatCoords,
  EVENT_TYPE_LABEL,
  alertPresentation,
} from "@/components/workspace/alertPresentation";
import { TIER_META } from "@/components/impact/tierPresentation";

interface BriefingButtonProps {
  event: AegisEvent | null;
  onGenerate: () => void;
  running: boolean;
  done: boolean;
  disabled: boolean;
}

function BriefingActionButton({
  event,
  onGenerate,
  running,
  done,
  disabled,
}: BriefingButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || running || !event}
      onClick={onGenerate}
      aria-pressed={running}
      className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-purple-500 px-7 py-3 text-sm font-medium text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 hover:bg-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {running ? (
        <>
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span>Generating briefing…</span>
        </>
      ) : done ? (
        <span>Regenerate briefing</span>
      ) : (
        <span>Generate executive briefing</span>
      )}
    </button>
  );
}

function ThreatStrip({
  event,
  onGenerate,
  running,
  done,
}: {
  event: AegisEvent | null;
  onGenerate: () => void;
  running: boolean;
  done: boolean;
}) {
  if (!event) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <p className="font-light text-white/50">
          Select a threat to generate a briefing.
        </p>
      </div>
    );
  }

  const alert = alertPresentation(event.alertLevel);

  return (
    <div className="glass rounded-3xl p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            {/* Threat Type */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur">
              {EVENT_TYPE_LABEL[event.type]}
            </span>
            {/* GDACS Chip */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur ${alert.chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${alert.dot}`} />
              {alert.label}
            </span>
          </div>

          <h3 className="truncate font-bricolage text-2xl font-medium tracking-tight text-white md:text-3xl">
            {event.name}
          </h3>

          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
            {formatCoords(event)} · Episode {event.episodeId}
          </p>
        </div>

        <div className="shrink-0">
          <BriefingActionButton
            event={event}
            onGenerate={onGenerate}
            running={running}
            done={done}
            disabled={running}
          />
        </div>
      </div>

      {running && (
        <p className="mt-4 font-mono text-xs text-amber-400/80">
          Briefing in progress. The backend handles one request at a time.
        </p>
      )}
    </div>
  );
}

function BriefingStatsChips({
  stats,
}: {
  stats: Partial<Record<string, number>>;
}) {
  const entries = Object.entries(stats).filter(([, count]) => typeof count === "number");
  if (entries.length === 0) return null;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
        Response assets:
      </span>
      {entries.map(([tier, count]) => {
        const meta = (TIER_META as Record<string, { chip: string; dot: string } | undefined>)[tier];
        if (!meta) return null;
        return (
          <span
            key={tier}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${meta.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot.split(" ").pop()}`} />
            <span>{tier.replace("_", " ")}: {count}</span>
          </span>
        );
      })}
    </div>
  );
}

export function BriefingSection() {
  const events = useEventsFeed();
  const workspace = useWorkspace();
  const workspaceSelectedId = useWorkspaceSelectedId();

  const allEvents = events.data?.events ?? [];
  const filtered =
    workspace.filter === "ALL"
      ? allEvents
      : allEvents.filter((e) => e.type === workspace.filter);
  const selectedEvent =
    filtered.find((e) => e.id === workspaceSelectedId) ?? filtered[0] ?? null;

  // External store subscriptions (zero effect setState)
  const running = useSyncExternalStore(
    subscribe,
    () => getState().running,
    () => false,
  );

  const moduleError = useSyncExternalStore(
    subscribe,
    () => getState().error,
    () => null,
  );

  // Directly read cached result from module memory per event & mockCase
  const briefingData = selectedEvent
    ? getCached(
        {
          type: selectedEvent.type,
          id: selectedEvent.id,
          episodeId: selectedEvent.episodeId,
        },
        workspace.mockCase,
      )
    : null;

  // Timer for elapsed seconds while running
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!running) return;
    const start = getState().startedAt ?? Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  const handleGenerate = useCallback(async () => {
    if (!selectedEvent || running) return;
    clearError();

    try {
      await runBriefing(
        {
          type: selectedEvent.type,
          id: selectedEvent.id,
          episodeId: selectedEvent.episodeId,
        },
        { case: (workspace.mockCase as MockCase) || undefined },
      );
    } catch {
      // Error is saved in module state and rendered via moduleError
    }
  }, [selectedEvent, running, workspace.mockCase]);

  const handleRegenerate = useCallback(async () => {
    if (!selectedEvent || running) return;
    // Invalidate cache for this event so fresh fetch triggers
    invalidateCache(
      {
        type: selectedEvent.type,
        id: selectedEvent.id,
        episodeId: selectedEvent.episodeId,
      },
      workspace.mockCase,
    );
    await handleGenerate();
  }, [selectedEvent, running, workspace.mockCase, handleGenerate]);

  const handleCancel = useCallback(() => {
    cancel();
  }, []);

  const handleRetry = useCallback(() => {
    void handleGenerate();
  }, [handleGenerate]);

  // Forecast status for fan chart
  const isDone = Boolean(briefingData && !moduleError);
  let forecastStatus: ForecastStatus = "idle";
  if (running) {
    forecastStatus = "loading";
  } else if (moduleError) {
    forecastStatus = "error";
  } else if (isDone) {
    forecastStatus = "done";
  }

  const forecastData: ForecastData | null =
    briefingData?.forecast
      ? {
          p10: briefingData.forecast.p10,
          p50: briefingData.forecast.p50,
          p90: briefingData.forecast.p90,
        }
      : null;

  return (
    <section
      id="briefing"
      className="w-full scroll-mt-24 bg-neutral-950 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-360 px-6 md:px-12">
        {/* Section Header: same eyebrow + h2 style as #impact */}
        <div className="relative min-w-0 lg:max-w-xl">
          <span
            aria-hidden="true"
            className="absolute -left-4 top-1 bottom-1 w-1 bg-gradient-to-b from-purple-500 to-transparent opacity-50 md:-left-8"
          />
          <p className="mb-4 flex items-center gap-3 text-purple-400">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-purple-400/80">
              AI forecast &amp; briefing
            </span>
            <span className="h-[1px] w-8 bg-purple-500/30" />
          </p>
          <h2 className="font-bricolage text-4xl font-medium tracking-tight text-white md:text-5xl">
            Forecast{" "}
            <span className="font-light text-neutral-500">&amp; briefing</span>
          </h2>
          <p className="mt-4 font-light leading-relaxed text-white/50">
            AI-driven severity forecast fan chart cross-referenced with critical
            infrastructure and an executive tactical summary.
          </p>
        </div>

        {/* TOP: Selected event strip */}
        <div className="mt-10">
          <ThreatStrip
            event={selectedEvent}
            onGenerate={isDone ? handleRegenerate : handleGenerate}
            running={running}
            done={isDone}
          />
        </div>

        {/* Forecast fan chart + Briefing panel grid */}
        <div className="mt-10 grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          {/* LEFT (lg:col-span-7): Forecast fan chart */}
          <div className="flex flex-col lg:col-span-7">
            <ForecastFanChart
              forecast={forecastData}
              status={forecastStatus}
              error={moduleError}
            />
          </div>

          {/* RIGHT (lg:col-span-5): Briefing panel */}
          <div className="flex flex-col lg:col-span-5">
            {!selectedEvent ? (
              <div className="glass flex h-full min-h-[340px] flex-col items-center justify-center rounded-3xl p-8 text-center">
                <p className="font-light text-white/50">
                  Select a threat to generate a briefing.
                </p>
              </div>
            ) : (
              <div className="glass flex h-full min-h-[340px] flex-col justify-between rounded-3xl p-6 md:p-8">
                <div>
                  {/* AI briefing purple badge + DataMode badge */}
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-purple-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                      AI briefing
                    </span>
                    <DataModeBadge />
                  </div>

                  {/* Body States */}
                  {/* 1. Idle state */}
                  {!running && !moduleError && !briefingData && (
                    <div className="py-8 text-center">
                      <p className="font-light text-white/50">
                        Run a briefing to see the forecast and executive summary.
                      </p>
                    </div>
                  )}

                  {/* 2. Running state */}
                  {running && (
                    <div className="py-6">
                      <div className="flex items-center gap-3">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                        <p className="font-medium text-white">
                          Generating executive briefing…
                        </p>
                      </div>
                      <p className="mt-3 font-mono text-xs text-white/50">
                        Elapsed: {elapsed}s · Local model, can take 90+ seconds
                      </p>
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="inline-flex items-center rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. Error state */}
                  {!running && moduleError && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
                    >
                      <p className="font-mono text-xs uppercase tracking-widest text-red-400">
                        Briefing unavailable
                      </p>
                      <p className="mt-2 text-sm font-light text-white/70">
                        {moduleError}
                      </p>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="mt-4 inline-flex items-center rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {/* 4. Done state */}
                  {!running && briefingData && !moduleError && (
                    <div>
                      <MarkdownBrief text={briefingData.briefing} />
                      {briefingData.infrastructureStats && (
                        <BriefingStatsChips stats={briefingData.infrastructureStats} />
                      )}
                    </div>
                  )}
                </div>

                {/* Mandatory Disclaimer */}
                <div className="mt-8 border-t border-white/10 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    AI-generated by a small local model. Verify before acting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
