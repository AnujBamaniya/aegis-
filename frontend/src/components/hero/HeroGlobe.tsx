"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  AttributionControl,
  Map as MapLibreMap,
  setWorkerUrl,
} from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Hero globe (nav + hero revamp). The project already ships MapLibre GL, so
 * the "existing globe implementation" in use is MapLibre's globe projection
 * over CARTO Dark Matter raster tiles — the same basemap the impact map
 * (MapCanvas) falls back to. No new dependency (no Three.js).
 *
 * Design contract (DESIGN tokens):
 * - Space is the canvas itself: transparent WebGL canvas + transparent
 *   sky/fog layers, so the CSS star field behind it stays visible.
 * - Atmospheric lighting comes from MapLibre's atmosphere-blend limb glow
 *   around the globe.
 * - Performance: no particle systems. The map renders continuously only
 *   while the slow rotation runs, and that rotation stops when the hero is
 *   off-screen, the tab is hidden, the user is dragging, in lite mode or
 *   under prefers-reduced-motion.
 * - The globe never auto-zooms or hijacks page scroll: scrollZoom, double
 *   click, box zoom and keyboard are disabled; only gentle drag-pan remains.
 */

// Same CSP-safe same-origin worker copy MapCanvas uses.
setWorkerUrl("/maplibre-gl-worker.mjs");

const SPIN_DEG_PER_SEC = 2.4; // full circuit ≈ 2.5 min — slow, cinematic drift
const RESUME_AFTER_DRAG_MS = 2200;

/** CARTO Dark Matter raster style: dark geospatial basemap, zero external assets beyond tiles. */
const HERO_GLOBE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "carto-dark-raster": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors, © CARTO",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#0c0d09" },
    },
    {
      id: "carto-dark-raster-layer",
      type: "raster",
      source: "carto-dark-raster",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

/**
 * Zoom level that renders the globe at the desired on-screen diameter in px.
 * Web-mercator world width = 512 * 2^zoom, globe diameter at center ≈ world / π.
 */
function globeZoomFor(container: HTMLElement): number {
  const viewportW = window.innerWidth;
  const d =
    Math.min(container.clientWidth, container.clientHeight) *
    (viewportW < 1024 ? 0.88 : 0.97);
  return Math.min(4, Math.max(0.9, Math.log2((d * Math.PI) / 512)));
}

function spinIsAllowed(): boolean {
  // PerfInit stamps [data-perf="lite"] on <html> for low-end hardware.
  return (
    document.documentElement.dataset.perf !== "lite" && !prefersReducedMotion()
  );
}

export default function HeroGlobe() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvasEl = canvasRef.current;
    if (!root || !canvasEl) return;

    let map: MapLibreMap | null = null;
    let entranceCtx: gsap.Context | null = null;

    try {
      map = new MapLibreMap({
        container: canvasEl,
        style: HERO_GLOBE_STYLE,
        center: [12, 14], // opens on the Atlantic/Africa face, like the reference imagery
        zoom: globeZoomFor(canvasEl),
        pitch: 0,
        bearing: 0,
        // Transparent canvas + transparent sky below keeps the CSS stars visible.
        canvasContextAttributes: { alpha: true, antialias: false },
        // Decorative hero globe: gentle drag-pan only — no scroll/keyboard/
        // double-click interference with the page.
        attributionControl: false,
        scrollZoom: false,
        boxZoom: false,
        doubleClickZoom: false,
        keyboard: false,
        touchPitch: false,
        dragRotate: false,
        pitchWithRotate: false,
      });

      map.addControl(new AttributionControl({ compact: true }), "bottom-left");

      // Basemap failure (e.g. CARTO requires an API key) fires async on style
      // load, so the sync try/catch above cannot catch it. On failure, drop to
      // the design's first-paint layer (CSS star field + scrims) and hide the
      // globe canvas rather than leaving a dead/blank WebGL surface.
      map.on("error", () => {
        root.style.display = "none";
      });

      // Space is transparent; the limb glow is carried by horizon-color.
      map.on("style.load", () => {
        map?.setSky({
          "sky-color": "rgba(4, 5, 8, 0)",
          "horizon-color": "rgba(69, 104, 138, 0.35)",
          "fog-color": "rgba(4, 5, 8, 0)",
          "sky-horizon-blend": 0.5,
          "horizon-fog-blend": 0.5,
          "fog-ground-blend": 0.2,
          "atmosphere-blend": 0.6,
        });
      });
    } catch {
      // No WebGL: the star field + scrims remain; no static Earth substitute.
      root.style.display = "none";
      return;
    }

    // Re-fit on resize so the globe stays dominant on every viewport.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const fitZoom = () => map?.jumpTo({ zoom: globeZoomFor(canvasEl) });
    const onResize = () => {
      map?.resize();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitZoom, 180);
    };
    window.addEventListener("resize", onResize);

    // ---- Slow drift rotation --------------------------------------------
    const BASE_LNG = 12;
    const LAT = 14;
    let raf = 0;
    let drift = 0;
    let last = performance.now();
    let inView = true;
    let userHolding = false;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (spinIsAllowed() && inView && !userHolding && resumeTimer === undefined) {
        drift += dt * SPIN_DEG_PER_SEC;
        // Keep the center longitude inside [-180, 180].
        const lng = ((((BASE_LNG + drift) % 360) + 540) % 360) - 180;
        map?.setCenter([lng, LAT]);
      }
      raf = requestAnimationFrame(tick);
    };

    const startSpin = () => {
      last = performance.now();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const stopSpin = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const onVisibility = () => {
      if (document.hidden || !inView) stopSpin();
      else startSpin();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView || document.hidden) stopSpin();
      else startSpin();
    });
    observer.observe(root);

    // Let the user take the globe; drift resumes after a pause.
    const hold = () => {
      userHolding = true;
    };
    const release = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        resumeTimer = undefined;
        userHolding = false;
      }, RESUME_AFTER_DRAG_MS);
    };
    const canvas = map.getCanvas();
    canvas.addEventListener("pointerdown", hold);
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    // ---- GSAP: globe entrance + subtle scroll parallax -------------------
    if (!prefersReducedMotion()) {
      entranceCtx = gsap.context(() => {
        gsap.fromTo(
          root,
          { autoAlpha: 0, scale: 1.1, filter: "blur(12px)" },
          {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.9,
            delay: 0.1,
            ease: "power2.out",
            clearProps: "filter,transform",
          },
        );
        // One scrub trigger: the globe lags slightly behind the scroll.
        const hero = root.closest<HTMLElement>("header");
        if (hero) {
          gsap.to(root, {
            yPercent: 7,
            opacity: 0.7,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      }, root);
    }

    startSpin();

    return () => {
      stopSpin();
      clearTimeout(resizeTimer);
      clearTimeout(resumeTimer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", hold);
      canvas.removeEventListener("pointerup", release);
      canvas.removeEventListener("pointercancel", release);
      window.removeEventListener("resize", onResize);
      entranceCtx?.revert();
      map?.remove();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label="Rotating dark Earth globe rendered from a geospatial basemap. Decorative background."
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
