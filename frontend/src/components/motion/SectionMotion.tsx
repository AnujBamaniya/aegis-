"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { EASE_OUT, EASE_SOFT, DURATION, STAGGER, SCROLL } from "@/lib/motion";
import { scrambleText } from "@/lib/scramble";

/**
 * Global scroll motion layer (Inversa revamp, extended vocabulary).
 * Mounted once in page.tsx; sections opt in with data attributes:
 *
 *   data-gsap="reveal"   — element fades/rises in when it enters view.
 *   data-gsap="stagger"  — parent; its [data-gsap-item] children stagger in.
 *   data-gsap="lines"    — heading split into masked lines, rise 110% → 0.
 *   data-gsap="words"    — body paragraph, word-level fade/rise.
 *   data-gsap="mono"      — mono label/eyebrow: opacity + text scramble.
 *   data-gsap="rule"      — hairline draws in scaleX 0 → 1, origin left.
 *   data-gsap="stagger"  — children rise 24px + fade, stagger 0.1.
 *   data-gsap="image"     — full-bleed band: clip-path inset(100% 0 0 0) → inset(0).
 *   data-gsap="parallax" + data-speed — inner media yPercent scrubbed.
 *   data-gsap="count" + data-to — number count up with snap.
 *
 * One shared gsap.context; everything wrapped in a
 * (prefers-reduced-motion: no-preference) gsap.matchMedia branch.
 * Content stays visible under reduced motion (final states via fromTo only
 * created in the no-preference branch).
 */
export function SectionMotion() {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Legacy reveal: fade/rise on enter.
        gsap.utils.toArray<HTMLElement>("[data-gsap='reveal']").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: DURATION.reveal,
              ease: EASE_OUT,
              scrollTrigger: { trigger: el, start: SCROLL.revealStart, once: true },
            },
          );
        });

        // 2. Legacy stagger: parent [data-gsap="stagger"], children [data-gsap-item].
        gsap.utils.toArray<HTMLElement>("[data-gsap='stagger']").forEach((parent) => {
          const items = parent.querySelectorAll<HTMLElement>("[data-gsap-item]");
          if (items.length === 0) return;
          gsap.fromTo(
            items,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: STAGGER.items,
              ease: EASE_OUT,
              scrollTrigger: { trigger: parent, start: SCROLL.staggerStart, once: true },
            },
          );
        });

        // 3. Lines: split headings into masked lines, rise to final.
        gsap.utils.toArray<HTMLElement>("[data-gsap='lines']").forEach((el) => {
          const split = new SplitText(el, { type: "lines", mask: "lines" });
          split.lines.forEach((line) => {
            gsap.fromTo(
              line,
              { yPercent: 110 },
              {
                yPercent: 0,
                duration: DURATION.reveal,
                ease: EASE_OUT,
                scrollTrigger: { trigger: line, start: "top 85%", once: true },
              },
            );
          });
        });

        // 4. Words: body paragraphs, word-level fade/rise.
        gsap.utils.toArray<HTMLElement>("[data-gsap='words']").forEach((el) => {
          const split = new SplitText(el, { type: "words" });
          split.words.forEach((word) => {
            gsap.fromTo(
              word,
              { opacity: 0, y: 12 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: EASE_SOFT,
                scrollTrigger: { trigger: el, start: SCROLL.revealStart, once: true },
              },
            );
          });
        });

        // 5. Mono: eyebrows/labels fade in + scramble.
        gsap.utils.toArray<HTMLElement>("[data-gsap='mono']").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: EASE_SOFT, scrollTrigger: { trigger: el, start: "top 85%", once: true } },
          );
          scrambleText(el, {
            duration: 0.5,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

        // 6. Rule: hairlines draw in scaleX 0 → 1, origin left.
        gsap.utils.toArray<HTMLElement>("[data-gsap='rule']").forEach((el) => {
          gsap.fromTo(
            el,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.9,
              ease: EASE_OUT,
              transformOrigin: "left center",
              scrollTrigger: { trigger: el, start: SCROLL.revealStart, once: true },
            },
          );
        });

        // 7. Stagger: parent [data-gsap="stagger"], children [data-gsap-item] rise + fade.
        gsap.utils.toArray<HTMLElement>("[data-gsap='stagger']").forEach((parent) => {
          const items = parent.querySelectorAll<HTMLElement>("[data-gsap-item]");
          if (items.length === 0) return;
          gsap.fromTo(
            items,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: STAGGER.items,
              ease: EASE_OUT,
              scrollTrigger: { trigger: parent, start: SCROLL.staggerStart, once: true },
            },
          );
        });

        // 8. Image: full-bleed bands clip in + inner media scale for depth.
        gsap.utils.toArray<HTMLElement>("[data-gsap='image']").forEach((band) => {
          gsap.fromTo(
            band,
            { clipPath: "inset(100% 0 0 0)" },
            {
              clipPath: "inset(0)",
              duration: 1.2,
              ease: EASE_OUT,
              scrollTrigger: { trigger: band, start: SCROLL.revealStart, once: true },
            },
          );
          const media = band.querySelector<HTMLElement>("img, video, canvas");
          if (media) {
            gsap.fromTo(
              media,
              { scale: 1.15 },
              { scale: 1, duration: 1.6, ease: EASE_OUT, scrollTrigger: { trigger: band, start: SCROLL.revealStart, once: true } },
            );
          }
        });

        // 9. Parallax: inner media yPercent scrubbed, ease none, ±8–12%.
        gsap.utils.toArray<HTMLElement>("[data-gsap='parallax']").forEach((band) => {
          const speed = parseFloat(band.getAttribute("data-speed") ?? "0.15") || 0.15;
          gsap.to(band, {
            yPercent: speed,
            ease: "none",
            scrollTrigger: {
              trigger: band,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });

        // 10. Count: numbers count up with snap, once at top 90%.
        gsap.utils.toArray<HTMLElement>("[data-gsap='count']").forEach((el) => {
          const to = parseFloat(el.getAttribute("data-to") ?? "0") || 0;
          const obj = { v: parseFloat(el.textContent ?? "0") || 0 };
          gsap.to(obj, {
            v: to,
            duration: DURATION.base,
            snap: { v: 1 },
            ease: EASE_OUT,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => {
              el.textContent = String(Math.round(obj.v));
            },
          });
        });
      });
    });

    // Refresh after fonts load (SplitText mis-measurement guard).
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => ctx.revert();
  }, []);

  return <div ref={scopeRef} aria-hidden="true" style={{ display: "contents" }} />;
}
