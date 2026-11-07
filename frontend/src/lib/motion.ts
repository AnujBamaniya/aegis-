/**
 * Global motion tokens — single source of truth for easing and durations.
 * All GSAP timelines and tweens should reference these instead of inline values.
 */

// Easing curves
export const EASE_OUT = "expo.out";
export const EASE_IN_OUT = "power3.inOut";
export const EASE_SOFT = "power2.out";

// Durations (seconds)
export const DURATION = {
  micro: 0.2,
  base: 0.6,
  reveal: 1.0,
  hero: 1.4,
} as const;

// Stagger intervals
export const STAGGER = {
  tight: 0.015,
  lines: 0.08,
  items: 0.1,
  cards: 0.09,
} as const;

// ScrollTrigger common configs
export const SCROLL = {
  // Reveal triggers
  revealStart: "top 85%",
  staggerStart: "top 85%",
  countStart: "top 90%",

  // Scrub configs
  scrubSoft: 0.6,
  scrubDirect: true,
} as const;

// Reduced motion check
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

// Touch device check (coarse pointer)
export function isTouchDevice(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

// Desktop fine pointer (for custom cursor)
export function isDesktopFinePointer(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches
  );
}