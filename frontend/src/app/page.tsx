import { Suspense } from "react";
import { Divider } from "@/components/ui/Divider";
import { Hero } from "@/components/hero/Hero";
import { SiteNav } from "@/components/layout/SiteNav";
import { EventsExplorer } from "@/components/workspace/EventsExplorer";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceProvider";
import { ImpactWorkspace } from "@/components/impact/ImpactWorkspace";
import { BriefingSection } from "@/components/briefing/BriefingSection";
import { InfrastructureSection } from "@/components/infrastructure/InfrastructureSection";
import { Pipeline } from "@/components/pipeline/Pipeline";
import { CoreSystems } from "@/components/systems/CoreSystems";
import { Access } from "@/components/access/Access";
import { Footer } from "@/components/footer/Footer";

/**
 * Aegis Matrix landing page (PLAN P1-P5).
 * Fixed pill nav, gradient hero, and sections linked by one WorkspaceProvider
 * so threat selection, filter channels and queries stay in sync across:
 * Active Threats -> Impact Workspace -> AI Briefing -> Vulnerability Index -> Pipeline.
 * Followed by Core Systems, Audience Access, and the Mission Control Footer.
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

      <main id="top">
        <Divider />

        <Suspense fallback={<BoardSkeleton />}>
          <WorkspaceProvider>
            {/* 1. Active Threats board (P2) */}
            <section
              id="threats"
              className="w-full border-t border-white/5 bg-neutral-950 py-16 scroll-mt-24 md:py-24"
            >
              <div className="mx-auto w-full max-w-360 px-6 md:px-12">
                <EventsExplorer />
              </div>
            </section>

            <Divider />

            {/* 2. Impact workspace (P3) */}
            <section
              id="impact"
              className="relative w-full scroll-mt-24 bg-neutral-950 py-16 md:py-24"
            >
              <span
                id="live-map"
                aria-hidden="true"
                className="absolute left-0 top-0 scroll-mt-24"
              />
              <div className="mx-auto w-full max-w-360 px-6 md:px-12">
                <ImpactWorkspace />
              </div>
            </section>

            <Divider />

            {/* 3. AI Forecast & Briefing (P4) */}
            <BriefingSection />

            <Divider />

            {/* 4. Vulnerability Index (P5) */}
            <InfrastructureSection />

            <Divider />

            {/* 5. Processing Pipeline (P5) */}
            <Pipeline />
          </WorkspaceProvider>
        </Suspense>

        <Divider />

        {/* 6. Core Systems (P5) */}
        <CoreSystems />

        <Divider />

        {/* 7. Audience Access (P5) */}
        <Access />

        <Divider />

        {/* 8. Mission Control Footer (P5) */}
        <Footer />
      </main>
    </>
  );
}
