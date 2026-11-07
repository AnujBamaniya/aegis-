"use client";

import { TIER_META, assetTypeLabel, formatDistance, sortAssetsByDistance } from "./tierPresentation";
import type { AegisAsset } from "@/lib/adapters";

/**
 * Asset list (PLAN P3): rows sorted by distance, scrollable, each a real
 * button. Click or Enter flies the map to the pin and opens its tooltip —
 * this list is the keyboard alternative to the map. Rows are flat
 * hairline strips (no boxes); the focused row gains a lime surveyor edge.
 * Only real asset types from the data are rendered; nothing is invented.
 */
export function AssetList({
  assets,
  focusedOsmId,
  onFocus,
}: {
  assets: AegisAsset[];
  focusedOsmId: string | null;
  onFocus: (asset: AegisAsset) => void;
}) {
  const sorted = sortAssetsByDistance(assets);

  return (
    <ul className="hide-scrollbar max-h-72 overflow-y-auto border-t border-iron-filings/60 pr-1">
      {sorted.map((asset) => {
        const meta = TIER_META[asset.riskTier];
        const focused = focusedOsmId === asset.osmId;
        return (
          <li key={asset.osmId} className="border-b border-iron-filings/60">
            <button
              type="button"
              aria-pressed={focused}
              onClick={() => onFocus(asset)}
              className={`relative block w-full px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor ${
                focused ? "bg-bone-vellum/5" : "hover:bg-bone-vellum/5"
              }`}
            >
              {focused ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-[2px] bg-lime-surveyor/70"
                />
              ) : null}
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-sm text-bone-vellum">
                  {asset.name}
                </span>
                <span
                  className={`inline-flex shrink-0 items-center rounded-[3.6px] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${meta.chip}`}
                >
                  {meta.label}
                </span>
              </span>
              <span className="mt-1 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-drift-ash">
                <span className="truncate">{assetTypeLabel(asset.assetType)}</span>
                <span className="tabular-nums">{formatDistance(asset.distanceMeters)}</span>
                {asset.synthetic ? (
                  <span className="ml-auto shrink-0 rounded-[3.6px] border border-amber-500/40 bg-obsidian-loam/60 px-2 py-0.5 text-amber-400">
                    Modeled baseline
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}