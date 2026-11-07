"use client";

import { useMemo } from "react";
import { useWorkspaceSelectedId, useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { useEventsFeed } from "@/hooks/useEventsFeed";
import { useInfrastructureQuery } from "@/hooks/useImpactQueries";
import { VulnerabilityIndex, VulnerabilityIndexSkeleton } from "@/components/vulnerability/VulnerabilityIndex";
import { DataModeBadge } from "@/components/ui/DataModeBadge";
import { TypeChips } from "@/components/workspace/EventCards";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RegionError, CalmNote, errorMessageOf } from "@/components/ui/RegionStates";

/**
 * Infrastructure risk (Inversa revamp). One SectionHeader recipe, the
 * selected event as a chrome-free text block on the canvas (its classification
 * carried by the hairline TypeChips), then the vulnerability index as flat
 * hairline rows. Data flow, the four data states and the role="status"
 * selection line are untouched. Reveal motion is applied globally by
 * components/motion/SectionMotion.tsx via the data-gsap attributes.
 */
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
      className="relative w-full scroll-mt-24 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-360 px-6 md:px-12">
        {/* Section header (Inversa revamp) */}
        <SectionHeader
          index="04"
          eyebrow="Infrastructure risk"
          title="Vulnerability index"
          description="Critical infrastructure grouped by asset class, tiered by distance to the selected hazard footprint."
          className="mb-12"
        />

        <div>
          <p
            role="status"
            aria-live="polite"
            className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-drift-ash"
          >
            {events.isPending
              ? "Loading threat feed…"
              : selected
              ? `Selected: ${selected.name}`
              : "Select a threat to see its vulnerability index."}
          </p>

          {selected ? (
            <>
              {/* Selected event summary — no card chrome; content sits
                  directly on the canvas and the event is classified by the
                  shared hairline TypeChips. */}
              <div data-gsap="reveal" className="mb-10">
                <div className="mb-5">
                  <TypeChips event={selected} />
                </div>
                <h3 className="text-2xl font-light leading-[1.05] tracking-[-0.03em] text-bone-vellum md:text-3xl">
                  {selected.name}
                </h3>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-drift-ash">
                  {selected.country ? `${selected.country} · ` : ""}
                  Episode {selected.episodeId}
                </p>
              </div>

              {/* Vulnerability index */}
              <div>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-drift-ash">
                  Asset classes
                </p>
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

          <div className="mt-10">
            <DataModeBadge />
          </div>
        </div>
      </div>
    </section>
  );
}
