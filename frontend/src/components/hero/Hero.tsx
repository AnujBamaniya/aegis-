import Image from "next/image";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  ChevronDownIcon,
} from "@/components/icons";
import {
  HeroPill,
  HeroStatus,
  HeroStatusGrid,
} from "@/components/hero/HeroStatus";

/**
 * Hero shell (DESIGN 8.2) over the hero photo. §7.2 entrance sequence, exact
 * values and order:
 *   0s bg cinematic · 0.5s nav (SiteNav) · 1.2s eyebrow · 1.4s line 1 ·
 *   1.6s line 2 · 1.8s glass card · 2.2s scroll cue · 2.4s status card ·
 *   2.5s live pill.
 */
export function Hero() {
  return (
    <header
      id="top"
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden"
    >
      {/* Background (bg, delay 0s, cinematic 3.5s): gradient base under the
          photo, photo via next/image, gradient-to-b legibility scrim and a
          radial vignette over it. Lite mode runs the entrance without blur
          (globals.css swaps the keyframe). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 animate-cinematic bg-black opacity-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-5%,rgba(16,185,129,0.16),transparent),radial-gradient(ellipse_50%_45%_at_85%_110%,rgba(59,130,246,0.12),transparent),radial-gradient(ellipse_40%_35%_at_10%_100%,rgba(224,49,49,0.07),transparent)]" />
        <Image
          src="/images/hero.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          quality={75}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      {/* Floating pill (2.5s) + lg status card (2.4s), hero-positioned.
          Suspense: the feed determines their values. */}
      <Suspense fallback={null}>
        <HeroStatus />
      </Suspense>

      {/* Content grid, ends low on the hero. The status card flows below the
          description card on mobile (2.4s) and is absolutely positioned only
          on lg. */}
      <div className="relative z-10 mx-auto grid w-full max-w-[90rem] grid-cols-1 items-end gap-6 px-6 md:grid-cols-12 md:px-12 md:pt-36">
        <div className="min-w-0 md:col-span-7 lg:pb-56">
          {/* Live/Demo pill — mobile variant: in flow above the headline
              (2.5s). The lg variant renders in the right column. */}
          <Suspense fallback={null}>
            <HeroPill mobile />
          </Suspense>
          {/* Eyebrow row — delay 1.2s */}
          <p className="mb-6 flex items-center gap-3 opacity-0 animate-slide-up [animation-delay:1.2s]">
            <span aria-hidden="true" className="h-[1px] w-8 bg-white/60" />
            <span className="font-mono text-xs uppercase tracking-widest text-white/80">
              Live GDACS hazard feed · critical infrastructure cross-reference
            </span>
          </p>

          {/* One h1: readable full phrase is sr-only; the huge display lines
              are decorative. Line 1 — delay 1.4s, line 2 — delay 1.6s. The "&"
              is a decorative italic glyph carrying no content. */}
          <h1 className="font-bricolage text-[clamp(3.5rem,10vw,9rem)] font-medium leading-[0.95] tracking-tighter text-white">
            <span className="sr-only">Predict and protect</span>
            <span aria-hidden="true">
              <span className="block drop-shadow-2xl opacity-0 animate-slide-up [animation-delay:1.4s]">
                PREDICT
              </span>
              <span className="-mt-2 flex items-baseline gap-4 opacity-0 animate-slide-up [animation-delay:1.6s] md:-mt-8">
                <span
                  aria-hidden="true"
                  className="font-serif font-light italic opacity-50 blur-[1px]"
                >
                  &amp;
                </span>
                <span className="font-bold">PROTECT</span>
              </span>
            </span>
          </h1>
        </div>

        {/* Right column: live pill in normal flow above the card (lg only),
            then the glass description card — delay 1.8s */}
        <div className="flex flex-col md:col-span-5 lg:mt-16">
          <Suspense fallback={null}>
            <HeroPill />
          </Suspense>
          <div className="glass relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/5 opacity-0 animate-slide-up [animation-delay:1.8s] p-6 lg:p-8">
            <p className="mb-8 text-base font-light leading-relaxed text-white antialiased drop-shadow-md lg:text-lg max-w-md">
            Aegis Matrix cross-references live GDACS hazard events with nearby
            critical infrastructure, forecasts hydro-meteorological severity
            and drafts the executive briefing response teams act on.
          </p>
          <a
            href="#threats"
            className="group flex w-full items-center justify-between border-b border-white/30 p-1 pb-2 transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            <span className="text-sm font-medium tracking-wide text-white">
              Open the active threat board
            </span>
            <ArrowRightIcon className="h-[18px] w-[18px] text-white transition-transform group-hover:translate-x-1" />
          </a>
          </div>
        </div>

        {/* Status card on mobile — flows below the description card, delay 2.4s */}
        <div className="md:col-span-12">
          <Suspense fallback={null}>
            <HeroStatusGrid />
          </Suspense>
        </div>
      </div>

      {/* Scroll cue — bottom center, delay 2.2s */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 opacity-0 animate-slide-up [animation-delay:2.2s] lg:flex">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Scroll to explore
        </span>
        <span aria-hidden="true" className="h-12 w-[1px] bg-gradient-to-b from-white to-transparent" />
        <ChevronDownIcon className="h-3.5 w-3.5 animate-pulse text-white/40" />
      </div>
    </header>
  );
}