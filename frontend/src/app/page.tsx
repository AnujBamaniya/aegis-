import { Suspense } from "react";
import { Divider } from "@/components/ui/Divider";
import { Hero } from "@/components/hero/Hero";
import { SiteNav } from "@/components/layout/SiteNav";
import { EventsExplorer } from "@/components/workspace/EventsExplorer";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceProvider";
import { ImpactWorkspace } from "@/components/impact/ImpactWorkspace";

/**
 * Aegis Matrix landing page (PLAN P3). Fixed pill nav, gradient hero, the
 * Active Threats board and the impact workspace fed by the dataSource through
 * ONE WorkspaceProvider so selection and the channel filter stay in sync.
 * Later sections (infrastructure, pipeline, access) are anchor placeholders
 * until their phases land.
 */
function BoardSkeleton() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-360 px-6 md:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="glass relative min-h-120 overflow-hidden rounded-3xl md:col-span-8">
            <div aria-hidden="true" className="flex flex-col gap-4 p-8">
              <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
              <div className="h-7 w-2/3 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 z-0 -translate-x-full animate-shimmer-effect bg-linear-to-r from-transparent via-white/5 to-transparent"
            />
          </div>
          <div className="flex flex-col gap-6 md:col-span-4">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="glass relative min-h-57 overflow-hidden rounded-3xl"
              >
                <div aria-hidden="true" className="flex flex-col gap-4 p-8">
                  <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                  <div className="h-7 w-2/3 animate-pulse rounded bg-white/5" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
                </div>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-0 -translate-x-full animate-shimmer-effect bg-linear-to-r from-transparent via-white/5 to-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteNav />
      <Hero />

      <main>
        <Divider />

        {/* Active Threats board (P2) + Impact workspace (P3) share the same
            workspace state, so the featured threat is the mapped event. */}
        <Suspense fallback={<BoardSkeleton />}>
          <WorkspaceProvider>
            <section
              id="threats"
              className="w-full border-t border-white/5 bg-neutral-950 py-16 scroll-mt-24 md:py-24"
            >
              <div className="mx-auto w-full max-w-360 px-6 md:px-12">
                <EventsExplorer />
              </div>
            </section>

            <Divider />

            <section
              id="impact"
              className="relative w-full scroll-mt-24 bg-neutral-950 py-16 md:py-24"
            >
              {/* Nav "Live Map" and "Impact" both anchor here. */}
              <span
                id="live-map"
                aria-hidden="true"
                className="absolute left-0 top-0 scroll-mt-24"
              />
              <div className="mx-auto w-full max-w-360 px-6 md:px-12">
                <ImpactWorkspace />
              </div>
            </section>
          </WorkspaceProvider>
        </Suspense>

        <Divider />

        {/* Anchor placeholders for P4-P5 sections; ids keep the nav honest. */}
        <div id="infrastructure" className="h-px scroll-mt-24" />
        <div id="pipeline" className="h-px scroll-mt-24" />
        <div id="access" className="h-px scroll-mt-24" />
      </main>
    </>
  );
}
