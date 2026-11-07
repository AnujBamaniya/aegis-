"use client";

import {
  CycloneIcon,
  FloodIcon,
  FlameIcon,
  ActivityIcon,
} from "@/components/icons";
import type { ThreatFilter } from "@/components/workspace/WorkspaceProvider";

/**
 * Segmented filter (Inversa revamp): a flat hairline-strip control, one row,
 * no wrap, horizontally scrollable on small screens. Display text is short
 * (All / TC / Flood / Wildfire); the full hazard name lives in aria-label.
 * Active state is conveyed with aria-pressed AND the lime surveyor fill
 * (DESIGN: 3.6px corners, lime as active state, never color alone).
 */
const TYPE_OPTIONS: Array<{
  value: Exclude<ThreatFilter, "ALL">;
  label: string;
  short: string;
  icon: (className: string) => React.ReactNode;
}> = [
  {
    value: "TC",
    label: "Tropical cyclone",
    short: "TC",
    icon: (c) => <CycloneIcon className={c} />,
  },
  {
    value: "FL",
    label: "Flood",
    short: "Flood",
    icon: (c) => <FloodIcon className={c} />,
  },
  {
    value: "WF",
    label: "Wildfire",
    short: "Wildfire",
    icon: (c) => <FlameIcon className={c} />,
  },
];

export function FilterTrack({
  filter,
  onFilter,
  counts,
}: {
  filter: ThreatFilter;
  onFilter: (filter: ThreatFilter) => void;
  counts: { ALL: number; TC: number; FL: number; WF: number } | null;
}) {
  const buttonClass = (active: boolean) =>
    `flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[3.6px] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor lg:px-4 ${
      active
        ? "bg-lime-surveyor text-obsidian-loam"
        : "text-drift-ash hover:text-bone-vellum"
    }`;

  return (
    <div
      role="group"
      aria-label="Filter threats by hazard type"
      className="relative flex shrink-0 max-w-full items-center gap-1 self-start overflow-x-auto border border-iron-filings/70 bg-obsidian-loam/40 p-1.5 hide-scrollbar lg:overflow-visible"
    >
      <button
        type="button"
        aria-pressed={filter === "ALL"}
        onClick={() => onFilter("ALL")}
        className={buttonClass(filter === "ALL")}
      >
        <ActivityIcon className="h-3.5 w-3.5" />
        All
        <span className="tabular-nums opacity-70">
          {counts ? counts.ALL : "–"}
        </span>
      </button>
      {TYPE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={filter === option.value}
          aria-label={`Show ${option.label.toLowerCase()} events`}
          onClick={() => onFilter(option.value)}
          className={buttonClass(filter === option.value)}
        >
          {option.icon("h-3.5 w-3.5")}
          {option.short}
          <span className="tabular-nums opacity-70">
            {counts ? counts[option.value] : "–"}
          </span>
        </button>
      ))}
    </div>
  );
}
