"use client";

import { useEffect } from "react";

/**
 * One shared IntersectionObserver for every element with `.animate-on-scroll`.
 * Adds `.animate` once, then unobserves (DESIGN 7.3). Rescans on DOM changes
 * so client-rendered lists (event board, map cards) get revealed as they mount.
 * Skipped entirely under prefers-reduced-motion: the CSS override already makes
 * revealed content visible and static.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );

    let queued = false;
    const scan = () => {
      document
        .querySelectorAll<HTMLElement>(".animate-on-scroll")
        .forEach((el) => {
          if (el.dataset.animBound !== "1") {
            el.dataset.animBound = "1";
            observer.observe(el);
          }
        });
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    };

    scan();
    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
