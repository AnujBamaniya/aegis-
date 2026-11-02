import { Suspense } from "react";
import { DataModeBadge } from "@/components/ui/DataModeBadge";
import { EventsTestPanel } from "@/components/test/EventsTestPanel";

/**
 * Temporary Phase 1 test page. Verifies the data layer end to end:
 * fixture events, the four region states via ?case=, the Demo badge and the
 * simulated health probe. Replaced by the real nav + hero in Phase 2.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16 md:px-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-emerald-500">
            <span aria-hidden="true" className="h-px w-8 bg-emerald-500" />
            Data layer verification · Phase 1
          </p>
          <h1 className="mt-4 text-4xl font-bricolage font-medium tracking-tight text-white md:text-6xl">
            Aegis <span className="font-light text-white/20">Matrix</span>
          </h1>
          <p className="mt-3 text-lg font-light leading-relaxed text-white/60">
            Events, footprint, infrastructure, forecast and briefing flow
            through one typed data source. Append{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-white/70">
              ?case=empty|error|slow|noforecast|llmerror
            </code>{" "}
            to inspect the states.
          </p>
        </div>
        <DataModeBadge />
      </div>
      <Suspense
        fallback={
          <p className="mt-12 font-mono text-xs uppercase tracking-widest text-white/40">
            Loading test panel...
          </p>
        }
      >
        <EventsTestPanel />
      </Suspense>
    </main>
  );
}
