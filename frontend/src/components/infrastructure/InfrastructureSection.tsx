"use client";

import { useMemo } from "react";
import { useWorkspaceSelectedId, useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { useEventsFeed } from "@/hooks/useEventsFeed";
import { useInfrastructureQuery } from "@/hooks/useImpactQueries";
import { VulnerabilityIndex, VulnerabilityIndexSkeleton } from "@/components/vulnerability/VulnerabilityIndex";
import { DataModeBadge } from "@/components/ui/DataModeBadge";
import { MapPinIcon } from "@/components/icons";
import { RegionError, CalmNote, errorMessageOf } from "@/components/ui/RegionStates";

const SECTION_LABEL =
  "mb-3 font-mono text-[10px] uppercase tracking-widest text-white/70";

export function InfrastructureSection() {
  const events = useEventsFeed();
  const workspace = useWorkspace();
  const workspaceSelectedId = useWorkspaceSelectedId();

  const allEvents = useMemo(() => events.data?.events ?? [], [events.data]);
  const filtered = useMemo(
    () =>
      workspace.filter === "ALL"
        ? allEvents
        : allEvents.filter((event) => event.type === workspace.filter),
    [allEvents, workspace.filter],
  );
  const selected =
    filtered.find((event) => event.id === workspaceSelectedId) ??
    filtered[0] ??
    null;

  const infrastructure = useInfrastructureQuery(selected);

  return (
    <section
      id="infrastructure"
      className="relative w-full scroll-mt-24 bg-neutral-950 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-360 px-6 md:px-12">
        {/* Section header (DESIGN 8.4) */}
        <div className="relative min-w-0 lg:max-w-xl animate-on-scroll">
          <span
            aria-hidden="true"
            className="absolute -left-4 top-1 bottom-1 w-1 bg-gradient-to-b from-emerald-500 to-transparent opacity-50 md:-left-8"
          />
          <p className="mb-4 flex items-center gap-3 text-emerald-400">
            <MapPinIcon className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400/80">
              Vulnerability index
            </span>
          </p>
          <h2 className="font-bricolage text-4xl md:text-5xl font-medium tracking-tight text-white">
            Vulnerability{" "}
            <span className="font-light text-neutral-500">index</span>
          </h2>
          <p className="mt-4 font-light leading-relaxed text-white/50">
            Critical infrastructure grouped by asset class, tiered by distance
            to the selected hazard footprint.
          </p>
        </div>

        <div className="mt-10">
          <p
            role="status"
            aria-live="polite"
            className={SECTION_LABEL}
          >
            {events.isPending
              ? "Loading threat feed…"
              : selected
              ? `Selected: ${selected.name}`
              : "Select a threat to see its vulnerability index."}
          </p>

          {selected ? (
            <>
              {/* Selected event summary */}
              <div className="glass rounded-3xl p-6 mb-8">
                <h3 className="font-bricolage text-2xl font-medium tracking-tight text-white">
                  {selected.name}
                </h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/60">
                  {selected.country ? `${selected.country} · ` : ""}
                  Episode {selected.episodeId}
                </p>
              </div>

              {/* Vulnerability index */}
              <div>
                <p className={SECTION_LABEL}>Asset classes</p>
                {infrastructure.isPending ? (
                  <VulnerabilityIndexSkeleton />
                ) : infrastructure.isError ? (
                  <RegionError
                    title="Infrastructure unavailable"
                    message={errorMessageOf(
                      infrastructure.error,
                      "Unexpected failure while fetching infrastructure.",
                    )}
                    onRetry={() => {
                      void infrastructure.refetch();
                    }}
                  />
                ) : infrastructure.data && infrastructure.data.length > 0 ? (
                  <VulnerabilityIndex assets={infrastructure.data} />
                ) : (
                  <CalmNote>
                    No critical infrastructure in the scan window.
                  </CalmNote>
                )}
              </div>
            </>
          ) : (
            <CalmNote>Select a threat above to see its vulnerability index.</CalmNote>
          )}

          <DataModeBadge />
        </div>
      </div>
    </section>
  );
}