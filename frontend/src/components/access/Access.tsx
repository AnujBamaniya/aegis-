"use client";

import { GovernmentIcon, AcademiaIcon, SocietyIcon, ChevronRightIcon } from "@/components/icons";

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
      className="group relative block p-[1px] rounded-3xl bg-gradient-to-br from-white/10 to-white/0 hover:from-white/20 hover:to-white/5 transition-all duration-500 animate-on-scroll focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
    >
      <div
        className="relative h-full bg-neutral-900/80 backdrop-blur-xl rounded-[23px] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center border border-white/5 group-hover:border-transparent transition-colors overflow-hidden"
      >
        {/* Glow on hover */}
        <div
          className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          aria-hidden="true"
        />

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/30 transition-all duration-500 z-10"
          aria-hidden="true"
        >
          <audience.icon className="h-8 w-8" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bricolage text-2xl font-medium text-white tracking-tight">
            {audience.label}
          </h3>
          <p className="mt-2 text-sm font-light text-white/60 leading-relaxed">
            {audience.benefit}
          </p>

          {/* Action link */}
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
              {audience.actionLabel}
              <ChevronRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </span>
          </div>
        </div>

        {/* Reveal arrow */}
        <div
          className="w-10 h-10 rounded-full border border-white/20 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <ChevronRightIcon className="h-5 w-5 text-white/60" />
        </div>
      </div>
    </a>
  );
}

function SDGChip({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex items-center justify-center h-12 text-white font-bricolage font-bold text-xl tracking-tighter opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
      <div className="text-center">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">
          {label}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          {sub}
        </div>
      </div>
    </div>
  );
}

export function Access() {
  return (
    <section
      id="access"
      className="relative w-full scroll-mt-24 bg-neutral-950 border-t border-white/5 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-360 px-6 md:px-12">
        {/* Section header */}
        <div className="relative min-w-0 lg:max-w-xl animate-on-scroll">
          <span
            aria-hidden="true"
            className="absolute -left-4 top-1 bottom-1 w-1 bg-gradient-to-b from-emerald-500 to-transparent opacity-50 md:-left-8"
          />
          <p className="mb-4 flex items-center gap-3 text-emerald-400">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400/80">
              Access
            </span>
            <span className="h-[1px] w-8 bg-emerald-500/30" />
          </p>
          <h2 className="font-bricolage text-5xl md:text-7xl font-semibold tracking-tight text-white">
            Access
          </h2>
          <p className="mt-4 font-light leading-relaxed text-white/50">
            The tool serves three audiences with distinct missions.
          </p>
        </div>

        {/* Three audience cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {AUDIENCES.map((audience) => (
            <AccessCard key={audience.key} audience={audience} />
          ))}
        </div>

        {/* SDG chips */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 border-t border-white/5 pt-12">
          <div className="col-span-1 md:col-span-1" />
          {SDG_CHIPS.map((chip) => (
            <SDGChip key={chip.label} label={chip.label} sub={chip.sub} />
          ))}
          <div className="col-span-1 md:col-span-1" />
        </div>
      </div>
    </section>
  );
}