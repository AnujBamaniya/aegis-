import { Suspense } from "react";
import { Divider } from "@/components/ui/Divider";
import { BoardSkeleton } from "@/components/ui/BoardSkeleton";
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
import { SectionMotion } from "@/components/motion/SectionMotion";
import { MicroInteractions } from "@/components/motion/MicroInteractions";
import { Preloader } from "@/components/motion/Preloader";

/**
 * Aegis Matrix landing page. Fixed flat nav, WebGL globe hero, then a
 * single WorkspaceProvider so threat selection, filter channels and queries
 * stay in sync across: Active Threats -> Impact Workspace -> AI Briefing ->
 * Vulnerability Index -> Pipeline. Followed by Core Systems, Audience
 * Access, and the editorial footer. Section headers follow the Inversa
 * recipe (SectionHeader); scroll motion is mounted once via SectionMotion.
 */
export default function Home() {
  return (
    <>
      <Preloader />
      <MicroInteractions />
      <SiteNav />
      <Hero />
      <SectionMotion />

      <main id="main">
        <Divider />

        <Suspense fallback={<BoardSkeleton />}>
          <WorkspaceProvider>
            {/* 1. Active Threats */}
            <section id="threats" className="w-full py-16 scroll-mt-24 md:py-24">
              <div className="mx-auto w-full max-w-[90rem] px-6 md:px-12">
                <EventsExplorer />
              </div>
            </section>

            <Divider />

            {/* 2. Geospatial Impact Workspace */}
            <section id="impact" className="relative w-full scroll-mt-24 py-16 md:py-24">
              <span
                id="live-map"
                aria-hidden="true"
                className="absolute left-0 top-0 scroll-mt-24"
              />
              <div className="mx-auto w-full max-w-[90rem] px-6 md:px-12">
                <ImpactWorkspace />
              </div>
            </section>

            <Divider />

            {/* 3. AI Forecast & Executive Briefing */}
            <BriefingSection />

            <Divider />

            {/* 4. Infrastructure Risk & Vulnerability Index */}
            <InfrastructureSection />

            <Divider />

            {/* 5. Intelligence Pipeline */}
            <Pipeline />
          </WorkspaceProvider>
        </Suspense>

        <Divider />

        {/* 6. Core Systems */}
        <CoreSystems />

        <Divider />

        {/* 7. Audience Access */}
        <Access />

        <Divider />

        {/* 8. Footer */}
        <Footer />
      </main>
    </>
  );
}
