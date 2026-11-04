"use client";

import { useSyncExternalStore } from "react";
import {
  useWorkspace,
  useWorkspaceSelectedId,
} from "@/components/workspace/WorkspaceProvider";
import { useEventsFeed } from "@/hooks/useEventsFeed";
import { useInfrastructureQuery } from "@/hooks/useImpactQueries";
import { getCached, getState, subscribe } from "@/lib/briefingModule";
import type { AegisEvent } from "@/lib/adapters";
import type { MockCase } from "@/lib/dataSource";

interface PipelineStage {
  id: string;
  number: string;
  title: string;
  description: string;
}

const STAGES: readonly PipelineStage[] = [
  {
    id: "ingest",
    number: "01",
    title: "Ingest",
    description: "GDACS tropical cyclone, flood and wildfire events ingested every five minutes.",
  },
  {
    id: "crossref",
    number: "02",
    title: "Cross-reference",
    description: "GeoPandas UTM distance engine against OpenStreetMap-derived critical infrastructure.",
  },
  {
    id: "predict",
    number: "03",
    title: "Predict",
    description: "Chronos-Bolt severity forecast across a seven-step horizon.",
  },
  {
    id: "brief",
    number: "04",
    title: "Brief",
    description: "Local LLM executive briefing with infrastructure impact summary.",
  },
];

function getIngestStatus(events: ReturnType<typeof useEventsFeed>) {
  if (events.isPending) return { label: "Loading…", variant: "loading" as const };
  if (events.isError) return { label: "Error", variant: "error" as const };
  if (!events.data || events.data.events.length === 0)
    return { label: "No events", variant: "empty" as const };
  const mode = events.data.count > 0 ? "Live" : "Demo";
  return { label: `${mode} · ${events.data.events.length} events`, variant: "live" as const };
}

function getCrossrefStatus(
  infrastructure: ReturnType<typeof useInfrastructureQuery>,
  selectedEvent: AegisEvent | null
) {
  if (!selectedEvent) return { label: "Awaiting selection", variant: "idle" as const };
  if (infrastructure.isPending) return { label: "Scanning…", variant: "loading" as const };
  if (infrastructure.isError) return { label: "Error", variant: "error" as const };
  if (!infrastructure.data || infrastructure.data.length === 0)
    return { label: "No assets", variant: "empty" as const };
  return { label: `${infrastructure.data.length} assets`, variant: "live" as const };
}

function getPredictStatus(
  selectedEvent: AegisEvent | null,
  mockCase: string,
  running: boolean,
  error: string | null
) {
  if (!selectedEvent) return { label: "Awaiting selection", variant: "idle" as const };
  if (running && getState().currentEvent?.id === selectedEvent.id)
    return { label: "Running…", variant: "loading" as const };
  const cached = getCached(
    { type: selectedEvent.type, id: selectedEvent.id, episodeId: selectedEvent.episodeId },
    mockCase as MockCase,
  );
  if (cached && cached.forecast)
    return { label: "Forecast ready", variant: "live" as const };
  if (cached && !cached.forecast)
    return { label: "Forecast unavailable", variant: "empty" as const };
  if (error && getState().currentEvent?.id === selectedEvent.id)
    return { label: "Error", variant: "error" as const };
  return { label: "Not requested", variant: "idle" as const };
}

function getBriefStatus(
  selectedEvent: AegisEvent | null,
  mockCase: string,
  running: boolean,
  error: string | null
) {
  if (!selectedEvent) return { label: "Awaiting selection", variant: "idle" as const };
  if (running && getState().currentEvent?.id === selectedEvent.id)
    return { label: "Generating…", variant: "loading" as const };
  if (error && getState().currentEvent?.id === selectedEvent.id)
    return { label: "Error", variant: "error" as const };
  const cached = getCached(
    { type: selectedEvent.type, id: selectedEvent.id, episodeId: selectedEvent.episodeId },
    mockCase as MockCase,
  );
  if (cached)
    return { label: "Briefing ready", variant: "live" as const };
  return { label: "Not requested", variant: "idle" as const };
}

type StatusVariant = "idle" | "loading" | "live" | "empty" | "error";

function StatusChip({ variant, label }: { variant: StatusVariant; label: string }) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest";
  const variants: Record<StatusVariant, string> = {
    idle: "bg-white/5 border border-white/10 text-white/50",
    loading: "bg-amber-500/10 border border-amber-500/30 text-amber-400",
    live: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
    empty: "bg-blue-500/10 border border-blue-500/30 text-blue-400",
    error: "bg-red-500/10 border border-red-500/30 text-red-400",
  };
  return <span className={`${base} ${variants[variant]}`}>{label}</span>;
}

function PipelineNode({ number, isActive }: { number: string; isActive: boolean }) {
  return (
    <div
      className={`relative w-12 h-12 rounded-full bg-neutral-900 border border-white/20 z-10 flex items-center justify-center text-white font-mono text-xs shadow-[0_0_20px_rgba(255,255,255,0.1)] ${isActive ? "bg-emerald-500/20 border-emerald-500/40" : ""}`}
      aria-hidden="true"
    >
      {number}
    </div>
  );
}

function PipelineStage({
  stage,
  index,
  status,
  isLast,
}: {
  stage: PipelineStage;
  index: number;
  status: { label: string; variant: "idle" | "loading" | "live" | "empty" | "error" };
  isLast: boolean;
}) {
  const isRight = index % 2 === 0;

  return (
    <div
      className="relative flex flex-col md:flex-row items-center justify-between mb-8 md:mb-20 group animate-on-scroll"
      data-anim={isRight ? "slide-right" : "slide-left"}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Text side */}
      <div
        className={`w-full md:w-5/12 pr-0 md:pr-12 order-2 md:order-1 text-center md:text-right ${isRight ? "md:order-2" : ""}`}
      >
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1/2 h-px bg-white/10 md:hidden" />
        <h3 className="text-3xl font-bricolage text-white tracking-tight">
          {stage.title}
        </h3>
        <p className="mt-2 font-light text-white/40">{stage.description}</p>
        <StatusChip variant={status.variant} label={status.label} />
      </div>

      {/* Center line + node */}
      <div className="relative w-12 h-12 rounded-full z-10 order-1 md:order-2 mb-6 md:mb-0 flex-shrink-0">
        <PipelineNode number={stage.number} isActive={status.variant === "live"} />
        {/* Vertical connector line */}
        {!isLast && (
          <div
            className="absolute left-1/2 top-full w-px h-full bg-white/10 md:hidden"
            aria-hidden="true"
          />
        )}
        {/* Horizontal connector on md+ */}
        <div
          className="hidden md:absolute md:top-1/2 md:-translate-y-1/2 md:w-1/2 h-px bg-white/10"
          style={isRight ? { right: "100%" } : { left: "100%" }}
          aria-hidden="true"
        />
      </div>

      {/* Other side: ghost numeral */}
      <div
        className={`w-full md:w-5/12 pl-0 md:pl-12 order-3 ${isRight ? "md:order-1" : ""} flex items-center justify-center md:justify-start`}
        aria-hidden="true"
      >
        <span
          className="anim-delay-300 animate-on-scroll text-[9rem] leading-none font-bricolage font-bold tracking-tighter text-white/5 select-none pointer-events-none"
          data-anim={isRight ? "slide-left" : "slide-right"}
        >
          {stage.number}
        </span>
      </div>
    </div>
  );
}

export function Pipeline() {
  const workspace = useWorkspace();
  const workspaceSelectedId = useWorkspaceSelectedId();
  const events = useEventsFeed();
  const mockCase = workspace.mockCase;

  // Briefing module state via subscription so Predict/Brief chips stay live
  // (same pattern as BriefingSection).
  const briefingRunning = useSyncExternalStore(
    subscribe,
    () => getState().running,
    () => false,
  );
  const briefingError = useSyncExternalStore(
    subscribe,
    () => getState().error,
    () => null,
  );

  const allEvents = events.data?.events ?? [];
  const filtered =
    workspace.filter === "ALL"
      ? allEvents
      : allEvents.filter((e) => e.type === workspace.filter);
  const selectedEvent =
    filtered.find((e) => e.id === workspaceSelectedId) ?? filtered[0] ?? null;

  const infrastructure = useInfrastructureQuery(selectedEvent);

  const ingestStatus = getIngestStatus(events);
  const crossrefStatus = getCrossrefStatus(infrastructure, selectedEvent);
  const predictStatus = getPredictStatus(selectedEvent, mockCase, briefingRunning, briefingError);
  const briefStatus = getBriefStatus(selectedEvent, mockCase, briefingRunning, briefingError);

  return (
    <section
      id="pipeline"
      className="relative w-full scroll-mt-24 bg-neutral-950 border-t border-white/5 py-16 md:py-24"
    >
      {/* Dot grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-360 px-6 md:px-12">
        {/* Section header (centered per DESIGN 8.8) */}
        <div className="mb-16 max-w-2xl mx-auto text-center animate-on-scroll">
          <p className="mb-4 flex items-center justify-center gap-3 text-emerald-400">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400/80">
              Processing pipeline
            </span>
            <span className="h-[1px] w-8 bg-emerald-500/30" />
          </p>
          <h2 className="font-bricolage text-5xl md:text-7xl font-semibold tracking-tight text-white">
            Pipeline
          </h2>
          <p className="mt-4 font-light leading-relaxed text-white/50 max-w-xl mx-auto">
            Four deterministic stages from live hazard feed to executable briefing.
          </p>
        </div>

        {/* Centered vertical line on md+ */}
        <div
          className="hidden md:absolute md:left-1/2 md:top-0 md:bottom-0 md:w-px md:bg-white/10 md:-translate-x-1/2"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center">
          {STAGES.map((stage, index) => (
            <PipelineStage
              key={stage.id}
              stage={stage}
              index={index}
              status={
                index === 0
                  ? ingestStatus
                  : index === 1
                  ? crossrefStatus
                  : index === 2
                  ? predictStatus
                  : briefStatus
              }
              isLast={index === STAGES.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}