"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, isTouchDevice } from "@/lib/motion";

/**
 * Lenis context for smooth scrolling.
 * Provides lenis instance to children for programmatic control (scrollTo, stop/start).
 */
interface LenisContextValue {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement | number, options?: { duration?: number }) => void;
  stop: () => void;
  start: () => void;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export function useLenis(): LenisContextValue {
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error("useLenis must be used within a SmoothScrollProvider");
  }
  return context;
}

/**
 * SmoothScrollProvider - mounts Lenis once at the app root.
 * - Skips entirely on reduced-motion and touch devices (native scroll)
 * - Syncs with GSAP ScrollTrigger via lenis.on("scroll") and gsap.ticker
 * - Exposes lenis instance through context for nav menu, anchor links, etc.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Skip on reduced motion or touch devices
    if (prefersReducedMotion() || isTouchDevice()) {
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    const lenisInstance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: false,
    });

    setLenis(lenisInstance);

    // Sync Lenis scroll with ScrollTrigger
    lenisInstance.on("scroll", ScrollTrigger.update);

    // GSAP ticker drives Lenis RAF
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });

    // Disable lag smoothing for smooth scroll consistency
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenisInstance.destroy();
      gsap.ticker.remove((time) => {
        lenisInstance.raf(time * 1000);
      });
    };
  }, []);

  const scrollTo = useCallback(
    (target: string | HTMLElement | number, options?: { duration?: number }) => {
      if (!lenis) return;

      if (typeof target === "string") {
        const el = document.querySelector(target);
        if (el) lenis.scrollTo(el, { duration: options?.duration ?? 1.4 });
      } else if (typeof target === "number") {
        lenis.scrollTo(target, { duration: options?.duration ?? 1.4 });
      } else {
        lenis.scrollTo(target, { duration: options?.duration ?? 1.4 });
      }
    },
    [lenis],
  );

  // Stable identities: consumers (Preloader, SiteNav) key effects on these,
  // so a provider re-render must never re-fire them mid-timeline.
  const stop = useCallback(() => lenis?.stop(), [lenis]);
  const start = useCallback(() => lenis?.start(), [lenis]);

  const value = useMemo<LenisContextValue>(
    () => ({ lenis, scrollTo, stop, start }),
    [lenis, scrollTo, stop, start],
  );

  return (
    <LenisContext.Provider value={value}>
      {children}
    </LenisContext.Provider>
  );
}

/**
 * ScrollProgressHairline - 1px lime line at top, scaleX scrubbed 0→1.
 * Fixed position, only renders when Lenis is active (not reduced motion / touch).
 */
export function ScrollProgressHairline() {
  const { lenis } = useLenis();
  const progressRef = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lenis || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Create a tween that maps scroll progress to scaleX
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        },
      });
    }, barRef);

    return () => ctx.revert();
  }, [lenis]);

  if (prefersReducedMotion() || isTouchDevice()) return null;

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[100] h-px w-full bg-lime-surveyor origin-left transform scale-x-0"
      style={{ transformOrigin: "left center" }}
    />
  );
}