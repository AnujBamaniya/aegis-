"use client";

import { TIER_META, TIER_ORDER, type TierCounts } from "./tierPresentation";

/**
 * Risk-tier summary (PLAN P3): four glass tiles, one per tier, count +
 * visible text label + short threshold text. Rendered instead of the tiles
 * skeleton while infrastructure loads (the caller swaps in a skeleton).
 */
export function TierTiles({ counts }: { counts: TierCounts }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TIER_ORDER.map((tier) => {
        const meta = TIER_META[tier];
        return (
          <div key={tier} className="glass rounded-2xl p-4">
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`}
              />
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${meta.chip}`}
              >
                {meta.label}
              </span>
            </span>
            <p className="mt-3 font-bricolage text-3xl tabular-nums text-white">
              {counts[tier]}
            </p>
            <p className="mt-1 text-xs font-light text-white/60">
              {meta.threshold}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Tile skeleton mirroring TierTiles while infrastructure loads. */
export function TierTilesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TIER_ORDER.map((tier) => (
        <div key={tier} className="glass rounded-2xl p-4">
          <span className="inline-block h-4 w-24 animate-pulse rounded bg-white/5" />
          <span className="mt-3 block h-8 w-12 animate-pulse rounded bg-white/5" />
          <span className="mt-2 block h-3 w-16 animate-pulse rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

/**
 * "Assets at risk N" roll-up: CRITICAL + HIGH + ELEVATED, sublabelled so the
 * number stays honest about its scope (PLAN Data rules).
 */
export function AssetsAtRisk({ count }: { count: number }) {
  return (
    <div
      aria-live="polite"
      className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/70">
          Assets at risk
        </p>
        <p className="text-xs font-light text-white/60">In scan window</p>
      </div>
      <p className="font-bricolage text-4xl tabular-nums text-white">
        {count}
      </p>
    </div>
  );
}
