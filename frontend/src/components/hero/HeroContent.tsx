"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { HeroPill, HeroStatusGrid } from "@/components/hero/HeroStatus";
import { gsap, SplitText } from "@/lib/gsap";
import { EASE_OUT, EASE_SOFT } from "@/lib/motion";
import { scrambleText } from "@/lib/scramble";
import { useLenis } from "@/components/motion/SmoothScroll";

/**
 * Hero copy block (nav + hero revamp). Headline sets the global disaster
 * intelligence identity per DESIGN typography (Inter as the approved
 * substitute, JetBrains Mono annotations, near-zero-radius lime CTA).
 *
 * Motion: ONE GSAP entrance timeline fired after the preloader wipes (heroStart),
 * line-mask reveal for the H1 with a lime period pop (scale 0→1 + 3-flash blink),
 * eyebrow fade + scramble, subcopy word reveal, CTA rise last, and a scrub-out
 * as the hero leaves. Everything under prefers-reduced-motion stays static via
 * the CSS overrides in globals.css — no timelines are created.
 */
export function HeroContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useLenis();
  const [heroReady, setHeroReady] = useState(false);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    scrollTo(target, { duration: 1.4 });
  };

  useEffect(() => {
    const onPreloaderDone = () => {
      setHeroReady(true);
    };

    window.addEventListener("aegis:preloader:done", onPreloaderDone);
    // Fallback: if the preloader's timeline ever fails to fire the event
    // (extension interference, GSAP edge case, hydration ordering), the hero
    // copy must still paint after 3s — it can never be left at opacity 0.
    const fallback = window.setTimeout(onPreloaderDone, 3000);
    return () => {
      window.removeEventListener("aegis:preloader:done", onPreloaderDone);
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!heroReady) return;
    const scope = rootRef.current;
    if (!scope || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.35, defaults: { ease: "power3.out" } });

      // Eyebrow: fade in + text scramble.
      const eyebrow = scope.querySelector<HTMLElement>("[data-hero-anim='eyebrow']");
      if (eyebrow) {
        tl.fromTo(
          eyebrow,
          { opacity: 0 },
          { opacity: 1, duration: 0.55, ease: EASE_OUT },
          0,
        );
        scrambleText(eyebrow, { duration: 0.5 });
      }

      // H1: line-mask reveal (SplitText lines with mask), then period pop.
      const linesWrap = scope.querySelector<HTMLElement>("h1 > span[aria-hidden='true']");
      if (linesWrap) {
        const split = new SplitText(linesWrap, { type: "lines", mask: "lines" });
        tl.fromTo(
          split.lines,
          { yPercent: 110 },
          { yPercent: 0, duration: 1.0, ease: EASE_OUT },
          0.12,
        );

        // Trailing lime period pops: scale 0 → 1 + 3-flash opacity blink (steps), then stops.
        const period = linesWrap.querySelector<HTMLElement>("span.text-lime-surveyor");
        if (period) {
          const blink = gsap.timeline({ repeat: 3, repeatDelay: 0.12, defaults: { ease: "steps(1)" } });
          blink.to(period, { opacity: 0.15, duration: 0.06 }, 0);
          blink.to(period, { opacity: 1, duration: 0.06 }, 0.18);
          blink.to(period, { opacity: 0.15, duration: 0.06 }, 0.36);
          blink.to(period, { opacity: 1, duration: 0.06 }, 0.54);
          blink.to(period, { scale: 0, duration: 0.3, ease: EASE_OUT, opacity: 1 }, 0.72);
          tl.to(period, { scale: 1, duration: 0.35, ease: EASE_OUT }, 1.02);
        }
      }

      // Subcopy: word-level fade/rise.
      const copy = scope.querySelector<HTMLElement>("[data-hero-anim='copy']");
      if (copy) {
        const splitWords = new SplitText(copy, { type: "words" });
        tl.fromTo(
          splitWords.words,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: EASE_SOFT, stagger: 0.015 },
          0.6,
        );
      }

      // CTA: rises last.
      const cta = scope.querySelector<HTMLElement>("[data-hero-anim='cta']");
      if (cta) {
        tl.fromTo(
          cta,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, ease: EASE_OUT },
          0.75,
        );
      }

      // Subtle scroll-out: hero content sinks + dims across the first 100vh.
      const hero = scope.closest<HTMLElement>("header");
      if (hero) {
        gsap.to(scope, {
          opacity: 0.2,
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, scope);

    return () => ctx.revert();
  }, [heroReady]);

  return (
    <div
      ref={rootRef}
      className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-1 flex-col justify-end px-6 pb-20 pt-28 md:px-12 md:pb-24 lg:pb-28"
      style={{ opacity: heroReady ? 1 : 0 }}
    >
      <div className="max-w-xl lg:max-w-2xl">
        {/* Live/Demo pill — data-driven, CSS-entranced at 0.75s (HeroStatus) */}
        <Suspense fallback={null}>
          <HeroPill />
        </Suspense>

        {/* Eyebrow row */}
        <p
          data-hero-anim="eyebrow"
          className="mb-6 flex items-center gap-3 opacity-0 translate-y-3"
        >
          <span aria-hidden="true" className="h-px w-8 bg-lime-surveyor/80" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-drift-ash">
            Global disaster intelligence · live hazard feed
          </span>
        </p>

        {/* One h1: the readable phrase is sr-only; display lines are decorative. */}
        <h1 className="font-sans text-[clamp(3.25rem,7.5vw,6.75rem)] font-medium leading-[0.92] tracking-[-0.03em] text-bone-vellum">
          <span className="sr-only">
            Aegis Matrix — real-time global disaster intelligence mapped against
            critical infrastructure
          </span>
          <span aria-hidden="true">
            <span
              data-hero-anim="line"
              className="block font-light text-bone-vellum/90 opacity-0 translate-y-6"
            >
              GLOBAL
            </span>
            <span
              data-hero-anim="line"
              className="block opacity-0 translate-y-6"
            >
              DISASTER
            </span>
            <span
              data-hero-anim="line"
              className="block opacity-0 translate-y-6"
            >
              INTELLIGENCE
              <span aria-hidden="true" className="ml-2 text-lime-surveyor">
                .
              </span>
            </span>
          </span>
        </h1>

        {/* Supporting description */}
        <p
          data-hero-anim="copy"
          className="mt-6 max-w-lg text-base font-light leading-relaxed text-bone-vellum/80 opacity-0 translate-y-4 md:text-lg"
        >
          Aegis Matrix cross-references live GDACS hazard events with nearby
          critical infrastructure, forecasts hydro-meteorological severity and
          drafts the executive briefing response teams act on.
        </p>

        {/* Single lime CTA (DESIGN Agent Prompt Guide: lime-filled action button) */}
        <div
          data-hero-anim="cta"
          className="mt-8 flex flex-col gap-5 opacity-0 translate-y-4 sm:flex-row sm:items-center md:mt-10"
        >
          <a
            href="#threats"
            onClick={(e) => handleScrollTo(e, "#threats")}
            className="group inline-flex items-center justify-between gap-4 rounded-md bg-lime-surveyor px-5 py-3.5 font-mono text-sm uppercase tracking-widest text-obsidian-loam transition-colors hover:bg-marsh-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor"
          >
            <span>Open the threat board</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1" />
          </a>
          <a
            href="#briefing"
            onClick={(e) => handleScrollTo(e, "#briefing")}
            className="inline-flex items-center gap-2 border-b border-iron-filings pb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-drift-ash transition-colors hover:border-bone-vellum hover:text-bone-vellum focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor sm:mt-1"
          >
            Watch the AI briefing
          </a>
        </div>

        {/* Mobile status card — flows below the CTA, hidden on lg */}
        <div className="mt-10 lg:hidden">
          <Suspense fallback={null}>
            <HeroStatusGrid />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
