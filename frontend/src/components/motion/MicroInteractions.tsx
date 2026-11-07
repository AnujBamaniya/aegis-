"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { EASE_OUT, EASE_SOFT } from "@/lib/motion";

/**
 * Global micro-interaction layer driven by data-micro attributes.
 * Mounted once in page.tsx; components opt in via data-micro="..." so no
 * per-component GSAP copies are needed.
 *
 * Supported:
 *   data-micro="magnetic" — magnetic pull toward cursor (max 10px), release
 *     with power3.out 0.5s; hover fill bar (scaleY) + vertical mono slot-roll;
 *     active scale 0.97; focus-visible 1px offset lime outline.
 *   data-micro="underline" — ghost button underline draws left→right on hover,
 *     retracts to the right on leave (scaleX, origin swap).
 */
export function MicroInteractions() {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      // Magnetic elements.
      gsap.utils.toArray<HTMLElement>("[data-micro='magnetic']").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: EASE_OUT });
        const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: EASE_OUT });

        const move = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          xTo(dx * (10 / 10));
          yTo(dy * (10 / 10));
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        const enter = () => {
          gsap.to(el, { scaleY: 1, duration: 0.4, ease: EASE_SOFT });
        };
        const active = () => gsap.to(el, { scale: 0.97, duration: 0.2, ease: EASE_OUT });
        const idle = () => gsap.to(el, { scale: 1, duration: 0.3, ease: EASE_OUT });

        const onMove = (e: MouseEvent) => move(e);
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        el.addEventListener("mousedown", active);
        el.addEventListener("mouseup", idle);
        el.addEventListener("blur", idle);
        cleanups.push(() => {
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
          el.removeEventListener("mousedown", active);
          el.removeEventListener("mouseup", idle);
          el.removeEventListener("blur", idle);
        });
      });

      // Underline (ghost buttons / nav links).
      gsap.utils.toArray<HTMLElement>("[data-micro='underline']").forEach((el) => {
        const line = el.querySelector<HTMLElement>("span[data-micro='underline-line']");
        const setTarget = (scaleX: number) => {
          if (line) {
            gsap.to(line, { scaleX, duration: 0.35, ease: EASE_SOFT });
          }
        };
        const onEnter = () => setTarget(1);
        const onLeave = () => setTarget(0);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
        });
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return <div ref={scopeRef} aria-hidden="true" style={{ display: "contents" }} />;
}
