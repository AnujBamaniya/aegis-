"use client";

import { TIER_META, assetTypeLabel, formatDistance, sortAssetsByDistance } from "./tierPresentation";
import type { AegisAsset } from "@/lib/adapters";

/**
 * Asset list (PLAN P3): rows sorted by distance, scrollable, each a real
 * button. Click or Enter flies the map to the pin and opens its tooltip —
 * this list is the keyboard alternative to the map. Only real asset types
 * from the data are rendered; nothing is invented.
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
    <ul className="hide-scrollbar max-h-72 space-y-2 overflow-y-auto pr-1">
      {sorted.map((asset) => {
        const meta = TIER_META[asset.riskTier];
        const focused = focusedOsmId === asset.osmId;
        return (
          <li key={asset.osmId}>
            <button
              type="button"
              aria-pressed={focused}
              onClick={() => onFocus(asset)}
              className={`group block w-full rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                focused
                  ? "border-white/20 bg-white/10"
                  : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.08]"
              }`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                  {asset.name}
                </span>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${meta.chip}`}
                >
                  {meta.label}
                </span>
              </span>
              <span className="mt-1 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/70">
                <span className="truncate">{assetTypeLabel(asset.assetType)}</span>
                <span className="tabular-nums text-white/50">
                  {formatDistance(asset.distanceMeters)}
                </span>
                {asset.synthetic ? (
                  <span className="ml-auto shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-400">
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
