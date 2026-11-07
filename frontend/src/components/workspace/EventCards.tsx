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

/** Generated art layer, tinted by the GDACS alert colour (imagery band). */
function ArtLayer({ event, alert }: { event: AegisEvent; alert: AlertPresentation }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
    >
      <HazardArt type={event.type} tint={alert.tint} />
    </div>
  );
}

/** Legibility gradient over the art (functional, not decorative). */
function Scrim() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-[1] bg-gradient-to-t from-obsidian-loam via-obsidian-loam/45 to-obsidian-loam/10"
    />
  );
}

/** Type + GDACS alert data tags, top-left. Severity words like CRITICAL or
    HIGH belong to infrastructure tiers and are never used on events. Also
    reused by the impact workspace summary card. Flat instrument-panel
    tags: iron hairline, mono caps, 3.6px corners. */
export function TypeChips({ event }: { event: AegisEvent }) {
  const alert = alertPresentation(event.alertLevel);
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-2 rounded-[3.6px] border border-iron-filings bg-obsidian-loam/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-vellum">
        <TypeIcon type={event.type} className="h-3 w-3" />
        {EVENT_TYPE_LABEL[event.type]}
      </span>
      <span
        className={`flex items-center gap-2 rounded-[3.6px] border bg-obsidian-loam/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${alert.chip}`}
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
      className={`pointer-events-none absolute -left-2 top-1/4 z-10 select-none font-sans font-light leading-none tracking-tighter text-bone-vellum/[0.06] ${
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
 * Selected/primary threat card (Inversa revamp). Flat hairline canvas with
 * the generated hazard art as its imagery band; absence of depth – the
 * contour of the panel carries the weight, and the management link takes
 * the lime accent.
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
      className={`group relative flex min-h-[480px] flex-col overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40 transition-colors duration-300 hover:border-lime-surveyor/30 ${
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

      <GhostNumeral rank={rank} large />

      {/* Content layer: tags and coordinates at the top, the GDACS label,
          title, description, meta row and arrow together at the bottom.
          justify-between keeps the tags clear of the label whatever the
          card height. */}
      <div className="relative z-20 flex h-full flex-1 flex-col p-8 md:p-12">
        <div className="mb-3 flex items-start justify-between gap-4">
          <TypeChips event={event} />
          <span className="hidden shrink-0 font-mono text-[10px] tabular-nums text-drift-ash sm:block">
            {formatCoords(event)}
          </span>
        </div>

        <div className="mt-auto max-w-xl">
          {event.severityText ? (
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-drift-ash">
              {event.severityText}
            </p>
          ) : null}
          <h3 className="text-3xl font-light leading-[1.05] tracking-[-0.03em] text-bone-vellum md:text-5xl">
            {event.name}
          </h3>
          {event.description ? (
            <p className="mt-4 line-clamp-3 text-sm font-light leading-relaxed text-drift-ash">
              {event.description}
            </p>
          ) : null}
          <dl className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-iron-filings/70 pt-5 font-mono text-xs uppercase tracking-[0.16em] text-drift-ash">
            <div>
              <dt className="block">Coordinates</dt>
              <dd className="tabular-nums text-bone-vellum">{formatCoords(event)}</dd>
            </div>
            <div>
              <dt className="block">Since</dt>
              <dd className="text-bone-vellum">{sinceLabel(event)}</dd>
            </div>
            {countryLabel(event) ? (
              <div>
                <dt className="block">Country</dt>
                <dd className="text-bone-vellum">{countryLabel(event)}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-8 flex items-center gap-3">
            <a
              href="#impact"
              aria-label="View impact"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[3.6px] border border-iron-filings text-bone-vellum transition-colors duration-200 hover:border-lime-surveyor hover:bg-lime-surveyor hover:text-obsidian-loam focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor"
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
 * Compact threat card: same flat anatomy as the featured card in stack
 * form, used in the right column and the compact grid below. Rendered as
 * a real button so selection is keyboard-reachable; the selected card is
 * marked with a lime hairline, aria-pressed AND its offset rank.
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
      className={`group relative flex min-h-[228px] w-full min-w-0 flex-col overflow-hidden border bg-obsidian-loam/40 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor ${
        selected ? "border-lime-surveyor/70" : "border-iron-filings/70"
      } ${
        onSelect ? "cursor-pointer hover:border-iron-filings" : "cursor-not-allowed opacity-60"
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
        <span className="hidden shrink-0 font-mono text-[10px] tabular-nums text-drift-ash sm:block">
          {formatCoords(event)}
        </span>
      </div>

      <GhostNumeral rank={rank} />

      <div className="relative z-20 mt-auto flex w-full items-end justify-between gap-4 p-6">
        <div className="min-w-0">
          <h3 className="text-2xl font-light leading-tight tracking-[-0.03em] text-bone-vellum">
            {event.name}
          </h3>
          <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-drift-ash">
            {formatCoords(event)} · Since {sinceLabel(event)}
            {countryLabel(event) ? ` · ${countryLabel(event)}` : ""}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3.6px] border border-iron-filings text-bone-vellum transition-colors duration-200 group-hover:border-lime-surveyor group-hover:bg-lime-surveyor group-hover:text-obsidian-loam"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}
