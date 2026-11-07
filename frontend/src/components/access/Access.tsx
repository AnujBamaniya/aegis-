"use client";

import {
  GovernmentIcon,
  AcademiaIcon,
  SocietyIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Audience access (Inversa revamp): three flat hairline cards on the canvas.
 * Each whole card is a single link with a lime focus ring; hover is a plain
 * border/text transition. SDGs render as flat mono data tags. No gradient
 * borders, no blur glows, no reveal-on-hover tricks.
 */

const AUDIENCES = [
  {
    key: "government" as const,
    label: "Government",
    icon: GovernmentIcon,
    benefit:
      "Automates emergency triage and speeds up disaster response and evacuations.",
    actionLabel: "Open the threat board",
    actionHref: "#threats",
  },
  {
    key: "academia" as const,
    label: "Institutes & academia",
    icon: AcademiaIcon,
    benefit:
      "Provides actionable data for climate impact and urban vulnerability research.",
    actionLabel: "Open the impact workspace",
    actionHref: "#impact",
  },
  {
    key: "ngos" as const,
    label: "Society & NGOs",
    icon: SocietyIcon,
    benefit:
      "Delivers free, enterprise-grade threat maps to coordinate humanitarian aid and community safety.",
    actionLabel: "Open the threat board",
    actionHref: "#threats",
  },
] as const;

const SDG_CHIPS = [
  {
    label: "SDG 11 · Target 11.5",
    sub: "Sustainable cities",
  },
  {
    label: "SDG 13",
    sub: "Climate action",
  },
  {
    label: "SDG 9",
    sub: "Industry & infrastructure",
  },
] as const;

function AccessCard({
  audience,
}: {
  audience: (typeof AUDIENCES)[number];
}) {
  return (
    <a
      href={audience.actionHref}
      data-gsap-item
      className="group relative flex flex-col gap-6 border border-iron-filings/70 bg-obsidian-loam/40 p-6 transition-colors duration-200 hover:border-iron-filings focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor md:p-8"
    >
      {/* Icon tile */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[3.6px] border border-iron-filings text-bone-vellum"
        aria-hidden="true"
      >
        <audience.icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="text-2xl font-light leading-[1.05] tracking-[-0.03em] text-bone-vellum">
          {audience.label}
        </h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-drift-ash">
          {audience.benefit}
        </p>

        {/* Action row */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-drift-ash transition-colors duration-200 group-hover:text-lime-surveyor">
            {audience.actionLabel}
          </span>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3.6px] border border-iron-filings text-bone-vellum transition-colors duration-200 group-hover:border-lime-surveyor group-hover:bg-lime-surveyor group-hover:text-obsidian-loam"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </a>
  );
}

/** Flat mono data tag for the SDG strip. */
function SDGChip({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="inline-flex flex-col gap-1 rounded-[3.6px] border border-iron-filings px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-vellum">
        {label}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-drift-ash">
        {sub}
      </span>
    </div>
  );
}

export function Access() {
  return (
    <section
      id="access"
      className="relative w-full scroll-mt-24 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-360 px-6 md:px-12">
        <SectionHeader
          index="07"
          eyebrow="For whom"
          title="Audience access"
          description="One tool serves three audiences with distinct missions: government triage, academic research and free coordination maps for the field."
          className="mb-12"
        />

        {/* Three audience cards */}
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6"
          data-gsap="stagger"
        >
          {AUDIENCES.map((audience) => (
            <AccessCard key={audience.key} audience={audience} />
          ))}
        </div>

        {/* SDG data tags */}
        <div className="mt-16 flex flex-wrap items-start gap-x-4 gap-y-4 border-t border-iron-filings pt-12">
          {SDG_CHIPS.map((chip) => (
            <SDGChip key={chip.label} label={chip.label} sub={chip.sub} />
          ))}
        </div>
      </div>
    </section>
  );
}
