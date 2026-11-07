"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TypeChips } from "@/components/workspace/EventCards";
import {
  EVENT_TYPE_LABEL,
  formatCoords,
} from "@/components/workspace/alertPresentation";
import {
  useWorkspace,
  useWorkspaceSelectedId,
} from "@/components/workspace/WorkspaceProvider";
import { useEventsFeed } from "@/hooks/useEventsFeed";
import {
  useFootprintQuery,
  useInfrastructureQuery,
} from "@/hooks/useImpactQueries";
import { ImpactMapPanel } from "@/components/impact/ImpactMapPanel";
import {
  AssetsAtRisk,
  TierTiles,
  TierTilesSkeleton,
} from "@/components/impact/TierTiles";
import { AssetList } from "@/components/impact/AssetList";
import {
  countAtRisk,
  countTiers,
  footprintHex,
  type TierCounts,
} from "@/components/impact/tierPresentation";
import type { MapFocus } from "@/components/impact/MapCanvas";
import type { AegisAsset } from "@/lib/adapters";
import { RegionError, CalmNote, errorMessageOf } from "@/components/ui/RegionStates";

const SECTION_LABEL =
  "mb-3 font-mono text-[10px] uppercase tracking-widest text-drift-ash";

/**
 * Impact workspace (PLAN P3): selected event summary, risk-tier summary and
 * the sorted asset list on the left; the MapLibre footprint + pins panel on
 * the right. Polygon and infrastructure are separate data regions with
 * independent loading/empty/error states, all fed through dataSource.ts.
 */
export function ImpactWorkspace() {
  const events = useEventsFeed();
  const { filter } = useWorkspace();
  const workspaceSelectedId = useWorkspaceSelectedId();

  // Resolve the working event the same way the threat board does: the panel
  // selection wins, otherwise the first event of the active channel.
  const allEvents = useMemo(() => events.data?.events ?? [], [events.data]);
  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? allEvents
        : allEvents.filter((event) => event.type === filter),
    [allEvents, filter],
  );
  const selected =
    filtered.find((event) => event.id === workspaceSelectedId) ??
    filtered[0] ??
    null;

  const polygon = useFootprintQuery(selected);
  const infrastructure = useInfrastructureQuery(selected);

  // List row -> map focus (also the keyboard alternative to the map).
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const eventKey = selected
    ? `${selected.type}:${selected.id}:${selected.episodeId}`
    : "";

  // When the selected event changes, clear the pinned asset focus so the map
  // does not show a stale pin from the previous threat. The map itself is
  // recreated per event (MapCanvas keyes on event.id/episodeId), but the
  // focus state lives here and must be reset to avoid pointing at an asset
  // from a previous event on a newly mounted map.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFocus(null);
  }, [eventKey]);

  const focusAsset = useCallback((asset: AegisAsset) => {
    setFocus((previous) => ({ asset, nonce: (previous?.nonce ?? 0) + 1 }));
  }, []);

  // Tier counts are computed client-side from the deduped assets.
  const counts: TierCounts = useMemo(
    () => countTiers(infrastructure.data ?? []),
    [infrastructure.data],
  );
  const atRisk = countAtRisk(counts);
  const alertHex = footprintHex(selected ? selected.alertLevel : null);

  const focusedOsmId = focus?.asset.osmId ?? null;
  const dataLoading = polygon.isPending || infrastructure.isPending;

  return (
    <div>
      {/* Section header — shared editorial recipe (DESIGN 8.4). */}
      <SectionHeader
        index="02"
        eyebrow="Impact workspace"
        title="Geospatial impact"
        description="The selected threat from the board above, its published footprint and every critical asset inside the scan window, tiered by distance."
        className="mb-12"
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left: summary, tiers, asset list -------------------------------- */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <p
            role="status"
            aria-live="polite"
            className={SECTION_LABEL}
          >
            {events.isPending
              ? "Loading threat feed…"
              : selected
                ? `Selected: ${EVENT_TYPE_LABEL[selected.type]} ${selected.name}`
                : "Select a threat above to see its impact."}
          </p>

          {selected ? (
            <>
              {/* Selected event summary: flat hairline panel, chips on top. */}
              <div className="border border-iron-filings/70 bg-obsidian-loam/40 p-6">
                <TypeChips event={selected} />
                <h3 className="mt-4 text-2xl font-light tracking-[-0.03em] text-bone-vellum">
                  {selected.name}
                </h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-drift-ash">
                  {formatCoords(selected)}
                  {selected.country ? ` · ${selected.country}` : ""}
                </p>
              </div>

              {/* Risk tier summary */}
              <div>
                <p className={SECTION_LABEL}>Risk tiers</p>
                {infrastructure.isPending ? (
                  <TierTilesSkeleton />
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
                ) : (
                  <>
                    <TierTiles counts={counts} />
                    <AssetsAtRisk count={atRisk} />
                  </>
                )}
              </div>

              {/* Asset list */}
              <div>
                <p className={SECTION_LABEL}>
                  Assets in scan window
                  {infrastructure.isError ? null : (
                    <span className="ml-2 tabular-nums text-bone-vellum">
                      {infrastructure.data ? `${infrastructure.data.length}` : "—"}
                    </span>
                  )}
                </p>
                {infrastructure.isPending ? (
                  <div className="space-y-2" aria-hidden="true">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="border border-iron-filings/70 bg-obsidian-loam/40 p-3"
                      >
                        <div className="h-3 w-1/3 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
                        <div className="mt-2 h-2.5 w-1/2 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
                      </div>
                    ))}
                  </div>
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
                  <AssetList
                    assets={infrastructure.data}
                    focusedOsmId={focusedOsmId}
                    onFocus={focusAsset}
                  />
                ) : (
                  <CalmNote>
                    No critical infrastructure in the scan window.
                  </CalmNote>
                )}
              </div>
            </>
          ) : (
            <CalmNote>Select a threat above to see its impact.</CalmNote>
          )}
        </div>

        {/* Right: map panel -------------------------------------------------- */}
        <div className="flex flex-col gap-3 lg:col-span-7">
          {polygon.isError ? (
            <RegionError
              title="Footprint unavailable"
              message={errorMessageOf(
                polygon.error,
                "Unexpected failure while fetching the footprint.",
              )}
              onRetry={() => {
                void polygon.refetch();
              }}
            />
          ) : null}

          {selected ? (
            <ImpactMapPanel
              event={selected}
              footprint={polygon.data ?? null}
              assets={infrastructure.data ?? []}
              alertHex={alertHex}
              focus={focus}
              dataLoading={dataLoading}
            />
          ) : (
            <div className="relative h-[420px] overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40 lg:h-[560px]">
              <CalmNote>Select a threat above to see its impact.</CalmNote>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}