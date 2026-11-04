"use client";

import { RefreshIcon } from "@/components/icons";
import { DataSourceError } from "@/lib/dataSource";

/**
 * Shared region states (error, empty, etc.) used across multiple sections.
 * DESIGN 8.14: Error state, Empty state.
 */
export function RegionError({
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
export function CalmNote({ children }: { children: string }) {
  return (
    <div className="glass flex items-center justify-center rounded-3xl px-8 py-16 text-center">
      <p className="font-light text-white/50">{children}</p>
    </div>
  );
}

export function errorMessageOf(error: unknown, fallback: string): string {
  return error instanceof DataSourceError ? error.message : fallback;
}