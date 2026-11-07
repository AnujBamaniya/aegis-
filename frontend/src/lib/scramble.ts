"use client";

import { gsap } from "@/lib/gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#________";

/**
 * Text scramble for mono labels/eyebrows/meta: random mono glyphs settle
 * left→right over `duration`. Preserves the final string and the accessible
 * name (aria-label) so screen readers read the real content.
 */
export function scrambleText(
  el: HTMLElement,
  options?: { duration?: number; scrollTrigger?: ScrollTrigger.Vars },
): gsap.core.Timeline {
  const duration = options?.duration ?? 0.5;
  const finalText = el.textContent ?? "";
  const tl = gsap.timeline({
    scrollTrigger: options?.scrollTrigger,
    onComplete: () => {
      el.textContent = finalText;
    },
  });

  const proxy = { progress: 0 };
  tl.to(
    proxy,
    {
      progress: 1,
      duration,
      ease: "none",
      onUpdate: () => {
        const chars = finalText.split("");
        let out = "";
        for (let i = 0; i < chars.length; i++) {
          const ch = chars[i];
          if (proxy.progress * chars.length < i) {
            out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          } else {
            out += ch;
          }
        }
        el.textContent = out;
      },
    },
    0,
  );

  // Keep the accessible name in sync with the real string.
  tl.call(() => {
    el.setAttribute("aria-label", finalText);
  });

  return tl;
}
