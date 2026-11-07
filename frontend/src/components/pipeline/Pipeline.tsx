"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useWorkspace, useWorkspaceSelectedId } from "@/components/workspace/WorkspaceProvider";
import { useEventsFeed } from "@/hooks/useEventsFeed";
import { useInfrastructureQuery } from "@/hooks/useImpactQueries";
import { getCached, getState, subscribe } from "@/lib/briefingModule";
import type { AegisEvent } from "@/lib/adapters";
import type { MockCase } from "@/lib/dataSource";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, EASE_OUT } from "@/lib/motion";

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
  const base = "inline-flex items-center gap-1.5 rounded-[3.6px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]";
  const variants: Record<StatusVariant, string> = {
    idle: "bg-bone-vellum/5 border-iron-filings text-drift-ash",
    loading: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    live: "bg-lime-surveyor/10 border-lime-surveyor/30 text-lime-surveyor",
    empty: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    error: "bg-red-500/10 border-red-500/30 text-red-400",
  };
  return <span className={`${base} ${variants[variant]}`}>{label}</span>;
}

function PipelineNode({ isActive }: { isActive: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative z-10 block h-3 w-3 rounded-[3.6px] ${
        isActive
          ? "bg-lime-surveyor"
          : "border border-iron-filings"
      }`}
    />
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
      className="relative flex flex-col md:flex-row items-center justify-between py-10 md:py-14"
      data-gsap-item
    >
      {/* Text side */}
      <div
        className={`w-full md:w-5/12 pr-0 md:pr-12 order-2 md:order-1 text-center md:text-right ${isRight ? "md:order-3" : ""}`}
      >
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1/2 h-px bg-iron-filings/70 md:hidden" aria-hidden="true" />
        <h3 className="text-3xl font-light leading-[1.05] tracking-[-0.03em] text-bone-vellum">
          {stage.title}
        </h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-drift-ash">{stage.description}</p>
        <div className="mt-3">
          <StatusChip variant={status.variant} label={status.label} />
        </div>
      </div>

      {/* Center line + node */}
      <div className="relative z-10 order-1 mb-6 flex h-6 w-6 flex-shrink-0 items-center justify-center md:order-2 md:mb-0">
        <PipelineNode isActive={status.variant === "live"} />
        {/* Vertical connector line */}
        {!isLast && (
          <div
            className="absolute left-1/2 top-full h-[5.5rem] w-px -translate-x-1/2 bg-iron-filings md:hidden"
            aria-hidden="true"
          />
        )}
        {/* Horizontal connector on md+ */}
        <div
          className={`hidden md:absolute md:top-1/2 md:block md:h-px md:w-1/2 md:-translate-y-1/2 bg-iron-filings ${
            isRight ? "md:right-full" : "md:left-full"
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Other side: ghost numeral */}
      <div
        className={`w-full md:w-5/12 pl-0 md:pl-12 order-3 ${isRight ? "md:order-1" : ""} flex items-center justify-center md:justify-start`}
        aria-hidden="true"
      >
        <span className="pointer-events-none select-none font-sans text-[7rem] font-light leading-none tracking-tighter text-bone-vellum/[0.05] md:text-[10rem]">
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

  // Pinned scroll sequence: pin the stage list, scrub ghost-numeral / marker motion.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const list = document.querySelector<HTMLElement>("[data-gsap='stagger']");
    if (!list) return;
    const st = ScrollTrigger.create({
      trigger: list,
      pin: true,
      start: "top top",
      end: "+=300%",
      scrub: 0.6,
      anticipatePin: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const stageIndex = Math.min(
          Math.floor(progress * STAGES.length),
          STAGES.length - 1,
        );
        const marker = list.querySelector<HTMLElement>("[data-pipeline-marker]");
        if (marker) {
          const rail = list.querySelector<HTMLElement>("[data-pipeline-rail]");
          if (rail) {
            const railRect = rail.getBoundingClientRect();
            const markerOffset = railRect.height / STAGES.length;
            const y = markerOffset * (stageIndex + 1);
            gsap.set(marker, { y });
          }
        }
        list.querySelectorAll<HTMLElement>("[data-pipeline-stage]").forEach((el) => {
          const idx = Number(el.getAttribute("data-pipeline-stage") ?? "-1");
          const isActive = idx === stageIndex;
          const title = el.querySelector<HTMLElement>("[data-pipeline-title]");
          const tag = el.querySelector<HTMLElement>("[data-pipeline-tag]");
          const inactive = 0.4;
          if (title) {
            gsap.to(title, {
              opacity: isActive ? 1 : inactive,
              color: isActive ? "#f4f3e8" : undefined,
              duration: 0.4,
              ease: EASE_OUT,
            });
          }
          if (tag) {
            gsap.to(tag, { opacity: isActive ? 1 : inactive, duration: 0.4, ease: EASE_OUT });
          }
        });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section
      id="pipeline"
      className="relative w-full scroll-mt-24 border-t border-iron-filings py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-360 px-6 md:px-12">
        <SectionHeader
          index="05"
          eyebrow="Processing chain"
          title="Intelligence pipeline"
          description="Four deterministic stages carry the live hazard feed from ingestion to an executive briefing."
          className="mb-12"
        />

        {/* Centered vertical line on md+ */}
        <div
          className="hidden md:absolute md:block md:left-1/2 md:top-0 md:bottom-0 md:w-px md:bg-iron-filings md:-translate-x-1/2"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center" data-gsap="stagger">
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
