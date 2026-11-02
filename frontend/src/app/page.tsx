import { Suspense } from "react";
import { Divider } from "@/components/ui/Divider";
import { Hero } from "@/components/hero/Hero";
import { SiteNav } from "@/components/layout/SiteNav";
import { EventsExplorer } from "@/components/workspace/EventsExplorer";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceProvider";

/**
 * Aegis Matrix landing page (PLAN P2): fixed pill nav, gradient hero with the
 * exact §7.2 entrance sequence, and the Active Threats board fed by the
 * dataSource. Later sections (live map, infrastructure, pipeline, impact,
 * access) are anchor placeholders until their phases land.
 */
function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <div className="glass relative min-h-[480px] overflow-hidden rounded-3xl md:col-span-8">
        <div aria-hidden="true" className="flex flex-col gap-4 p-8">
          <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
          <div className="h-7 w-2/3 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 -translate-x-full animate-shimmer-effect bg-gradient-to-r from-transparent via-white/5 to-transparent"
        />
      </div>
      <div className="flex flex-col gap-6 md:col-span-4">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="glass relative min-h-[228px] overflow-hidden rounded-3xl"
          >
            <div aria-hidden="true" className="flex flex-col gap-4 p-8">
              <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
              <div className="h-7 w-2/3 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 z-0 -translate-x-full animate-shimmer-effect bg-gradient-to-r from-transparent via-white/5 to-transparent"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreatBoard() {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <WorkspaceProvider>
        <EventsExplorer />
      </WorkspaceProvider>
    </Suspense>
  );
}

export default function Home() {
  return (
    <>
      <SiteNav />
      <Hero />

      <main>
        <Divider />

        {/* Active Threats board — P2 scope */}
        <section
          id="threats"
          className="w-full border-t border-white/5 bg-neutral-950 py-24 scroll-mt-24 md:py-32"
        >
          <div className="mx-auto w-full max-w-[90rem] px-6 md:px-12">
            <ThreatBoard />
          </div>
        </section>

        <Divider />

        {/* Anchor placeholders for P3-P5 sections; ids keep the nav honest. */}
        <div id="live-map" className="h-px scroll-mt-24" />
        <div id="infrastructure" className="h-px scroll-mt-24" />
        <div id="pipeline" className="h-px scroll-mt-24" />
        <div id="impact" className="h-px scroll-mt-24" />
        <div id="access" className="h-px scroll-mt-24" />
      </main>
    </>
  );
}
