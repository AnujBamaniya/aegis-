"use client";

import { RefreshIcon } from "@/components/icons";
import { DataSourceError } from "@/lib/dataSource";

/**
 * Shared region states (error, empty, etc.) used across multiple sections.
 * Inversa revamp: flat hairline panels, mono labels, no glass — role="alert"
 * and retry semantics unchanged.
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
      className="flex flex-wrap items-center justify-between gap-4 border border-iron-filings/70 bg-obsidian-loam/40 p-5"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-red-400">
          {title}
        </p>
        <p className="mt-1 text-sm font-light text-drift-ash">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 rounded-[3.6px] border border-iron-filings px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-bone-vellum transition-colors duration-200 hover:border-lime-surveyor hover:text-lime-surveyor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor"
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
    <div className="flex flex-col items-start px-8 py-16">
      <p
        aria-hidden="true"
        className="mb-3 h-px w-8 bg-iron-filings"
      />
      <p className="font-light text-drift-ash">{children}</p>
    </div>
  );
}

export function errorMessageOf(error: unknown, fallback: string): string {
  return error instanceof DataSourceError ? error.message : fallback;
}
