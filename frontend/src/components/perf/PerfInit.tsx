"use client";

import { useEffect } from "react";

/**
 * Sets `html[data-perf]` once on mount. Heavy effects (grain, ambient glow
 * blobs) are gated in globals.css under `[data-perf="lite"]`.
 * Force lite mode with NEXT_PUBLIC_LITE_MODE=1 at build time, `?lite=1` in
 * the URL, or localStorage["aegis:lite"]="1" at runtime. Does not cause
 * hydration changes: it only flips a data attribute that CSS reads.
 */
export function PerfInit() {
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lite =
      process.env.NEXT_PUBLIC_LITE_MODE === "1" ||
      new URLSearchParams(window.location.search).get("lite") === "1" ||
      localStorage.getItem("aegis:lite") === "1" ||
      (nav.hardwareConcurrency ?? 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 2;
    document.documentElement.dataset.perf = lite ? "lite" : "full";
  }, []);

  return null;
}
