"use client";

import type { CSSProperties } from "react";
import {
  ArrowRightIcon,
  CycloneIcon,
  FloodIcon,
  FlameIcon,
} from "@/components/icons";
import type { AegisEvent } from "@/lib/adapters";
import {
  EVENT_TYPE_LABEL,
  alertPresentation,
  formatCoords,
  type AlertPresentation,
} from "@/components/workspace/alertPresentation";
import { HazardArt } from "@/components/workspace/HazardArt";

function TypeIcon({
  type,
  className,
}: {
  type: AegisEvent["type"];
  className: string;
}) {
  if (type === "TC") return <CycloneIcon className={className} />;
  if (type === "FL") return <FloodIcon className={className} />;
  return <FlameIcon className={className} />;
}

function swapClasses(leaving: boolean | undefined): string {
  return `transition-all ${
    leaving ? "scale-95 opacity-0 duration-300" : "duration-700 card-swap-in"
  } ease-[cubic-bezier(0.25,1,0.5,1)]`;
}

function swapStyle(enterDelay: number | null | undefined): CSSProperties {
  return enterDelay != null ? { animationDelay: `${enterDelay}ms` } : {};
}

/** Generated art layer, tinted by the GDACS alert colour (P2 recipe). */
function ArtLayer({ event, alert }: { event: AegisEvent; alert: AlertPresentation }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
    >
      <HazardArt type={event.type} tint={alert.tint} />
    </div>
  );
}

/** Legibility gradient over the art. */
function Scrim() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-[1] bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent"
    />
  );
}

/** Type + GDACS alert chips, top-left. Severity words like CRITICAL or HIGH
    belong to infrastructure tiers and are never used on events. Also reused
    by the impact workspace summary card. */
export function TypeChips({ event }: { event: AegisEvent }) {
  const alert = alertPresentation(event.alertLevel);
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80 backdrop-blur">
        <TypeIcon type={event.type} className="h-3 w-3" />
        {EVENT_TYPE_LABEL[event.type]}
      </span>
      <span
        className={`flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur ${alert.chip}`}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
        {alert.label}
      </span>
    </span>
  );
}

/** Giant rank numeral, deliberately overlapping the art. Decoration only. */
function GhostNumeral({ rank, large }: { rank: number; large?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -left-2 top-1/4 z-10 select-none font-bricolage font-bold leading-none tracking-tighter text-white/5 ${
        large ? "text-[10rem]" : "text-[7rem]"
      }`}
    >
      {String(rank).padStart(2, "0")}
    </span>
  );
}

function sinceLabel(event: AegisEvent): string {
  return (event.fromDate ?? "").slice(0, 10) || "—";
}

function countryLabel(event: AegisEvent): string {
  return event.iso3 ?? event.country ?? "";
}

/**
 * Selected/primary threat card (DESIGN 8.6, P2 recipe). Shows type, name,
 * GDACS alert, coordinates and a management link. Only the featured card
 * carries the HUD scan-line overlay.
 */
export function EventCardLarge({
  event,
  rank,
  wide,
  leaving,
  enterDelay,
}: {
  event: AegisEvent;
  rank: number;
  /** Featured spans the full grid when it is the only event. */
  wide?: boolean;
  leaving?: boolean;
  enterDelay?: number | null;
}) {
  const alert = alertPresentation(event.alertLevel);

  return (
    <article
      aria-current="true"
      className={`glass group relative flex min-h-[480px] origin-left flex-col overflow-hidden rounded-3xl shadow-2xl hover:border-white/20 ${
        wide ? "md:col-span-12" : "md:col-span-8"
      } ${swapClasses(leaving)}`}
      style={swapStyle(enterDelay)}
    >
      <ArtLayer event={event} alert={alert} />
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-0 bg-gradient-to-b ${alert.backdrop}`}
      />
      <Scrim />
      {/* Featured only: faint moving scan lines (gated in CSS for lite mode
          and prefers-reduced-motion). */}
      <div
        aria-hidden="true"
        className="hud-scanlines pointer-events-none absolute inset-0 z-10 opacity-15"
      />
      <div
        aria-hidden="true"
        className="fx-glow absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5 blur-[100px]"
      />

      <GhostNumeral rank={rank} large />

      {/* Content layer: chips and coordinates at the top, the GDACS label,
          title, description, meta row and arrow together at the bottom.
          justify-between keeps the chips clear of the label whatever the
          card height. */}
      <div className="relative z-20 flex h-full flex-1 flex-col p-8 md:p-12">
        <div className="mb-3 flex items-start justify-between gap-4">
          <TypeChips event={event} />
          <span className="hidden shrink-0 font-mono text-[10px] tabular-nums text-neutral-400 sm:block">
            {formatCoords(event)}
          </span>
        </div>

        <div className="mt-auto max-w-xl">
          {event.severityText ? (
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              {event.severityText}
            </p>
          ) : null}
          <h3 className="font-bricolage text-4xl font-medium tracking-tight text-white md:text-5xl">
            {event.name}
          </h3>
          {event.description ? (
            <p className="mt-4 line-clamp-3 text-sm font-light leading-relaxed text-white/50">
              {event.description}
            </p>
          ) : null}
          <dl className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/10 pt-6 font-mono text-xs uppercase tracking-widest text-neutral-400">
            <div>
              <dt className="block text-neutral-400">Coordinates</dt>
              <dd className="tabular-nums text-white">{formatCoords(event)}</dd>
            </div>
            <div>
              <dt className="block text-neutral-400">Since</dt>
              <dd className="text-white">{sinceLabel(event)}</dd>
            </div>
            {countryLabel(event) ? (
              <div>
                <dt className="block text-neutral-400">Country</dt>
                <dd className="text-white">{countryLabel(event)}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-8 flex items-center gap-3">
            <a
              href="#impact"
              aria-label="View impact"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Compact threat card (8.6 small recipe): same anatomy as the featured card
 * in stack form, used in the right column and the compact grid below.
 * Rendered as a real button so selection is keyboard-reachable.
 */
export function EventCardSmall({
  event,
  rank,
  selected = false,
  onSelect,
  leaving,
  enterDelay,
}: {
  event: AegisEvent;
  rank: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
  leaving?: boolean;
  enterDelay?: number | null;
}) {
  const alert = alertPresentation(event.alertLevel);

  return (
    <button
      type="button"
      disabled={!onSelect}
      aria-pressed={selected}
      onClick={onSelect ? () => onSelect(event.id) : undefined}
      className={`glass group relative flex min-h-[228px] w-full min-w-0 flex-col overflow-hidden rounded-3xl text-left shadow-xl transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
        onSelect ? "cursor-pointer hover:border-white/20" : "cursor-not-allowed opacity-60"
      } ${
        selected ? "border-white/30 ring-1 ring-white/20" : ""
      } ${swapClasses(leaving)}`}
      style={swapStyle(enterDelay)}
    >
      <ArtLayer event={event} alert={alert} />
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-0 bg-gradient-to-b ${alert.backdrop}`}
      />
      <Scrim />

      <div className="absolute left-6 right-6 top-6 z-20 flex items-start justify-between gap-3">
        <TypeChips event={event} />
        <span className="hidden shrink-0 font-mono text-[10px] tabular-nums text-white/40 sm:block">
          {formatCoords(event)}
        </span>
      </div>

      <GhostNumeral rank={rank} />

      <div className="relative z-20 mt-auto flex w-full items-end justify-between gap-4 p-6">
        <div className="min-w-0">
          <h3 className="font-bricolage text-2xl font-medium tracking-tight text-white">
            {event.name}
          </h3>
          <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            {formatCoords(event)} · Since {sinceLabel(event)}
            {countryLabel(event) ? ` · ${countryLabel(event)}` : ""}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-black"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}
