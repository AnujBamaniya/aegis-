"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataSourceError } from "@/lib/dataSource";
import { MapPinIcon, RefreshIcon } from "@/components/icons";
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

const SECTION_LABEL =
  "mb-3 font-mono text-[10px] uppercase tracking-widest text-white/70";

function RegionError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-red-400">
          {title}
        </p>
        <p className="mt-1 text-sm font-light text-white/50">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
      >
        <RefreshIcon className="h-4 w-4" aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}

/** Calm, no-alarm placeholder when no threat is selected yet. */
function CalmNote({ children }: { children: string }) {
  return (
    <div className="glass flex items-center justify-center rounded-3xl px-8 py-16 text-center">
      <p className="font-light text-white/50">{children}</p>
    </div>
  );
}

function errorMessageOf(error: unknown, fallback: string): string {
  return error instanceof DataSourceError ? error.message : fallback;
}

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
      {/* Section header (DESIGN 8.4), same recipe as Active threats. */}
      <div className="relative min-w-0 lg:max-w-xl">
        <span
          aria-hidden="true"
          className="absolute -left-4 top-1 bottom-1 w-1 bg-gradient-to-b from-emerald-500 to-transparent opacity-50 md:-left-8"
        />
        <p className="mb-4 flex items-center gap-3 text-emerald-400">
          <MapPinIcon className="h-4 w-4" aria-hidden="true" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400/80">
            Live map
          </span>
        </p>
        <h2 className="font-bricolage text-4xl font-medium tracking-tight text-white md:text-5xl">
          Impact{" "}
          <span className="font-light text-white/30">workspace</span>
        </h2>
        <p className="mt-4 font-light leading-relaxed text-white/50">
          The selected threat from the board above, its published footprint and
          every critical asset inside the scan window, tiered by distance.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
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
              {/* Selected event summary */}
              <div className="glass rounded-3xl p-6">
                <TypeChips event={selected} />
                <h3 className="mt-4 font-bricolage text-2xl font-medium tracking-tight text-white">
                  {selected.name}
                </h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/60">
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
                    <span className="ml-2 text-white/40">
                      {infrastructure.data ? `${infrastructure.data.length}` : "—"}
                    </span>
                  )}
                </p>
                {infrastructure.isPending ? (
                  <div className="space-y-2" aria-hidden="true">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="h-16 animate-pulse rounded-xl bg-white/5"
                      />
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
            <div className="glass relative h-[420px] overflow-hidden rounded-3xl lg:h-[560px]">
              <CalmNote>Select a threat above to see its impact.</CalmNote>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
