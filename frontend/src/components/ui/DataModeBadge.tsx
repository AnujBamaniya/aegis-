import { DATA_MODE } from "@/lib/dataSource";

/**
 * Small amber "Demo data" / emerald "Live data" pill (DESIGN 3.3) with a
 * keyboard-reachable tooltip. Server component: DATA_MODE is inlined at build
 * time, so no state is needed.
 */
export function DataModeBadge({
  noteId = "data-mode-note",
}: {
  /** Unique per instance: the tooltip is described by this id. */
  noteId?: string;
}) {
  const demo = DATA_MODE === "mock";

  return (
    <span
      tabIndex={0}
      aria-describedby={noteId}
      aria-label={demo ? "Demo data badge" : "Live data badge"}
      className={`group relative inline-flex cursor-default select-none items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
        demo
          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          demo ? "bg-amber-500" : "animate-pulse bg-emerald-500"
        }`}
      />
      {demo ? "Demo data" : "Live data"}
      <span
        id={noteId}
        role="tooltip"
        className={`pointer-events-none absolute right-0 top-full z-50 mt-2 w-64 translate-y-1 rounded-lg border px-3 py-2 text-left font-mono normal-case tracking-normal opacity-0 shadow-2xl transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 ${
          demo
            ? "border-amber-500/30 bg-neutral-900/95 text-amber-200/90"
            : "border-emerald-500/30 bg-neutral-900/95 text-emerald-200/90"
        }`}
      >
        {demo
          ? "Synthetic demonstration fixtures. Not real GDACS or infrastructure output."
          : "Live events fetched through the Aegis API proxy."}
      </span>
    </span>
  );
}
