"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { EASE_OUT, DURATION } from "@/lib/motion";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Hero backdrop — the full-bleed satellite/terrain photograph that carries
 * the hero's first paint (DESIGN §Layout: "The hero is a full-viewport
 * satellite image with bottom-left text overlay"). Replaces the removed
 * WebGL globe with a zero-dependency static asset.
 *
 * Motion contract:
 * - Server HTML and no-JS render the final, fully-visible state — the
 *   entrance is JS-only (reveal tween), so the hero can never paint empty.
 * - prefers-reduced-motion: skip the entrance entirely; the photo is static.
 * - Animate only transform/opacity/clip-path (field-instrument verbs).
 * - Scroll-out is a gentle scrub parallax; the 1.08 base scale keeps edges
 *   covered while the photo drifts.
 */

const BASE_SCALE = 1.1; // 1.05 coverage each side covers the -5% yPercent drift

export function HeroBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const image = root.querySelector("img");
    if (!image) return;

    const ctx = gsap.context(() => {
      // Entrance: the photo settles cinematically from an eased zoom-in
      // (one orchestrated moment — the copy's line reveal is the only other
      // hero entrance, and it runs in HeroContent).
      gsap.fromTo(
        image,
        { scale: 1.16 },
        {
          scale: BASE_SCALE,
          duration: DURATION.hero + 0.8,
          ease: EASE_OUT,
        },
      );

      // Scroll-out parallax: drift the photo slightly faster than the copy
      // fades, so the hero reads as a slow pull-back rather than a cut.
      gsap.to(image, {
        yPercent: -5,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.4,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-hero-backdrop
      className="absolute inset-0 z-0 overflow-hidden bg-obsidian-loam"
    >
      <Image
        src="/images/hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
    </div>
  );
}
