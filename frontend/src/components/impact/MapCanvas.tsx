"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  AttributionControl,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";
import type {
  GeoJSONSource as MaplibreGeoJSONSource,
  LngLatLike,
  MapLayerMouseEvent,
  StyleSpecification,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import type {
  AegisAsset,
  AegisEvent,
  FootprintFeature,
} from "@/lib/adapters";
import type { RiskTier } from "@/lib/schema";
import {
  TIER_META,
  assetTypeLabel,
  formatDistance,
  tierColorExpression,
} from "./tierPresentation";

const CARTO_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// CSP-safe worker: point at the copy in public/ (maplibre-gl-worker.mjs,
// same-origin module worker) instead of the default relative-to-bundle URL.
setWorkerUrl("/maplibre-gl-worker.mjs");

/** Tile-free fallback: footprint + pins still render on a dark background. */
const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#0a0a0a" },
    },
  ],
};

type GeoJSONInput = Parameters<MaplibreGeoJSONSource["setData"]>[0];

const EMPTY_INPUT: GeoJSONInput = {
  type: "FeatureCollection",
  features: [],
} as unknown as GeoJSONInput;

export type MapFocus = { asset: AegisAsset; nonce: number };

export type MapCanvasProps = {
  event: AegisEvent | null;
  footprint: FootprintFeature[] | null;
  assets: AegisAsset[];
  /** Footprint paint colour derived from the GDACS alert level. */
  alertHex: string;
  focus: MapFocus | null;
  /** PerfInit "lite" mode: jumpTo camera, no pings, no animated camera. */
  lite: boolean;
  reducedMotion: boolean;
};

type AssetTooltipProps = {
  name: string;
  type: string;
  tier: RiskTier;
  distance: number | null;
  synthetic: boolean;
};

function tooltipPropsOf(asset: AegisAsset): AssetTooltipProps {
  return {
    name: asset.name,
    type: asset.assetType,
    tier: asset.riskTier,
    distance: asset.distanceMeters,
    synthetic: asset.synthetic,
  };
}

function withAlpha(hex: string, alpha: number): string {
  const value = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${value}`;
}

function collectLngLat(coordinates: unknown, out: [number, number][]): void {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return;
  const first = coordinates[0];
  if (typeof first === "number" && typeof coordinates[1] === "number") {
    out.push([first, Number(coordinates[1])]);
    return;
  }
  for (const nested of coordinates) collectLngLat(nested, out);
}

/** Tooltip node built with createElement/textContent — no innerHTML, ever. */
function buildTooltipNode(props: AssetTooltipProps): HTMLElement {
  const meta = TIER_META[props.tier] ?? TIER_META.MONITORING;
  const root = document.createElement("div");
  root.className = "space-y-1";

  const name = document.createElement("span");
  name.className = "block max-w-[13rem] truncate text-xs font-medium text-white";
  name.textContent = props.name;
  root.append(name);

  const line = document.createElement("span");
  line.className =
    "block whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-white/70";
  line.textContent = `${assetTypeLabel(props.type)} · ${formatDistance(props.distance)}`;
  root.append(line);

  const row = document.createElement("span");
  row.className = "flex items-center gap-2 pt-0.5";

  const chip = document.createElement("span");
  chip.className =
    "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest";
  chip.style.color = meta.hex;
  chip.style.borderColor = withAlpha(meta.hex, 0.3);
  chip.style.backgroundColor = withAlpha(meta.hex, 0.2);
  chip.textContent = meta.label;
  row.append(chip);

  if (props.synthetic) {
    const badge = document.createElement("span");
    badge.className =
      "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest";
    badge.style.color = "#fbbf24";
    badge.style.borderColor = "rgba(251,191,36,0.3)";
    badge.style.backgroundColor = "rgba(251,191,36,0.1)";
    badge.textContent = "Modeled baseline";
    row.append(badge);
  }

  root.append(row);
  return root;
}

export default function MapCanvas({
  event,
  footprint,
  assets,
  alertHex,
  focus,
  lite,
  reducedMotion,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const pingsRef = useRef<Marker[]>([]);
  const [readyKey, setReadyKey] = useState(0);
  const [failed, setFailed] = useState(false);

  // Latest-value ref for closures installed once per map instance (init +
  // hover handlers read the freshest data without re-subscribing).
  const latestRef = useRef({ footprint, assets, alertHex, event, lite, reducedMotion });
  useEffect(() => {
    latestRef.current = { footprint, assets, alertHex, event, lite, reducedMotion };
  }, [footprint, assets, alertHex, event, lite, reducedMotion]);

  const ensurePopup = (): Popup => {
    if (!popupRef.current) {
      popupRef.current = new Popup({
        className: "aegis-tooltip",
        closeButton: false,
        closeOnClick: false,
        maxWidth: "16rem",
        offset: 14,
      });
    }
    return popupRef.current;
  };

  // ------------------------------------------------------------------
  // Data application: footprint layers, event centre, asset pins, pings,
  // fit bounds. Runs on map load and whenever the data changes.
  // ------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || failed) return;
    if (!map.isStyleLoaded()) {
      map.once("idle", () => setReadyKey((key) => key + 1));
      return;
    }

    const latest = latestRef.current;

    // Footprint -----------------------------------------------------
    if (!map.getSource("aegis-footprint")) {
      map.addSource("aegis-footprint", { type: "geojson", data: EMPTY_INPUT });
      map.addLayer({
        id: "footprint-fill",
        type: "fill",
        source: "aegis-footprint",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: { "fill-color": "#000", "fill-opacity": 0.15 },
      });
      map.addLayer({
        id: "footprint-line",
        type: "line",
        source: "aegis-footprint",
        filter: ["in", ["geometry-type"], ["literal", ["Polygon", "LineString"]]],
        paint: { "line-color": "#000", "line-width": 1.5, "line-opacity": 0.6 },
      });
      map.addLayer({
        id: "footprint-point",
        type: "circle",
        source: "aegis-footprint",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-color": "#000",
          "circle-opacity": 0.15,
          "circle-stroke-color": "#000",
          "circle-stroke-width": 1.5,
          "circle-stroke-opacity": 0.6,
          "circle-radius": 10,
        },
      });
    }
    const footprintFeatures = (latest.footprint ?? []).map((feature) => ({
      type: "Feature",
      geometry: {
        type: feature.geometryType,
        coordinates: feature.coordinates,
      },
      properties: {},
    }));
    (
      map.getSource("aegis-footprint") as MaplibreGeoJSONSource | undefined
    )?.setData({
      type: "FeatureCollection",
      features: footprintFeatures,
    } as unknown as GeoJSONInput);
    for (const [layerId, property, color] of [
      ["footprint-fill", "fill-color", latest.alertHex],
      ["footprint-line", "line-color", latest.alertHex],
      ["footprint-point", "circle-color", latest.alertHex],
      ["footprint-point", "circle-stroke-color", latest.alertHex],
    ] as const) {
      // MapLibre's dependent paint types collapse on a union key; the values
      // here are literal spec-valid names, so bridge with `as never`.
      (map.setPaintProperty as unknown as (
        layer: string,
        name: string,
        value: string,
      ) => void)(layerId, property, color);
    }

    // Event centre ---------------------------------------------------
    if (!map.getSource("aegis-centre")) {
      map.addSource("aegis-centre", { type: "geojson", data: EMPTY_INPUT });
      map.addLayer({
        id: "centre-halo",
        type: "circle",
        source: "aegis-centre",
        paint: { "circle-radius": 14, "circle-color": "#ffffff", "circle-opacity": 0.15 },
      });
      map.addLayer({
        id: "centre-dot",
        type: "circle",
        source: "aegis-centre",
        paint: {
          "circle-radius": 5,
          "circle-color": "#000",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
    }
    (
      map.getSource("aegis-centre") as MaplibreGeoJSONSource | undefined
    )?.setData({
      type: "FeatureCollection",
      features: latest.event
        ? [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [latest.event.lng, latest.event.lat],
              },
              properties: {},
            },
          ]
        : [],
    } as unknown as GeoJSONInput);
    map.setPaintProperty("centre-dot", "circle-color", latest.alertHex);

    // Asset pins ------------------------------------------------------
    if (!map.getSource("aegis-assets")) {
      map.addSource("aegis-assets", { type: "geojson", data: EMPTY_INPUT });
      // Real assets: solid tier-coloured dot with the white ring (DESIGN 10).
      map.addLayer({
        id: "assets-solid",
        type: "circle",
        source: "aegis-assets",
        filter: ["==", ["get", "synthetic"], false],
        paint: {
          "circle-color": tierColorExpression() as never, // data-driven match expr
          "circle-radius": 6,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      // Modeled fallbacks: hollow tier-coloured ring (this MapLibre version
      // has no dashed circle stroke, so "hollow" carries the distinction).
      map.addLayer({
        id: "assets-hollow",
        type: "circle",
        source: "aegis-assets",
        filter: ["==", ["get", "synthetic"], true],
        paint: {
          "circle-color": "transparent",
          "circle-radius": 7,
          "circle-stroke-color": tierColorExpression() as never, // data-driven
          "circle-stroke-width": 2,
        },
      });
    }
    const assetFeatures = latest.assets.map((asset) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [asset.lng, asset.lat] },
      properties: {
        osmId: asset.osmId,
        name: asset.name,
        type: asset.assetType,
        tier: asset.riskTier,
        distance: asset.distanceMeters,
        synthetic: asset.synthetic,
      },
    }));
    (
      map.getSource("aegis-assets") as MaplibreGeoJSONSource | undefined
    )?.setData(
      {
        type: "FeatureCollection",
        features: assetFeatures,
      } as unknown as GeoJSONInput,
    );

    // Ping ring markers: CRITICAL/HIGH only, max 15, gated in lite motion
    // and under prefers-reduced-motion.
    for (const ping of pingsRef.current) ping.remove();

    pingsRef.current = [];
    if (!latest.lite && !latest.reducedMotion) {
      const targets = latest.assets
        .filter(
          (asset) =>
            asset.riskTier === "CRITICAL_IMPACT" || asset.riskTier === "HIGH_RISK",
        )
        .slice(0, 15);
      for (const asset of targets) {
        const wrap = document.createElement("span");
        wrap.className = "pointer-events-none relative block h-4 w-4";
        for (const delay of [0, 500]) {
          const ring = document.createElement("span");
          ring.className = "absolute inset-0 rounded-full animate-ping";
          ring.style.backgroundColor =
            TIER_META[asset.riskTier]?.hex ?? "#ef4444";
          ring.style.opacity = "0.5";
          if (delay > 0) ring.style.animationDelay = `${delay}ms`;
          wrap.append(ring);
        }
        const dot = document.createElement("span");
        dot.className =
          "absolute inset-0 z-10 rounded-full border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)]";
        dot.style.backgroundColor = TIER_META[asset.riskTier]?.hex ?? "#ef4444";
        wrap.append(dot);
        const marker = new Marker({ element: wrap })
          .setLngLat([asset.lng, asset.lat])
          .addTo(map);
        pingsRef.current.push(marker);
      }
    }

    // Fit bounds to footprint + assets (jumpTo instead in lite mode).
    const points: [number, number][] = [];
    for (const feature of latest.footprint ?? []) {
      collectLngLat(feature.coordinates, points);
    }
    for (const asset of latest.assets) points.push([asset.lng, asset.lat]);
    if (points.length > 0) {
      const bounds = new LngLatBounds();
      for (const point of points) bounds.extend(point);
      map.fitBounds(bounds, {
        padding: 64,
        maxZoom: 12,
        animate: !latest.lite && !latest.reducedMotion,
      });
    } else if (latest.event) {
      map.jumpTo({
        center: [latest.event.lng, latest.event.lat],
        zoom: 9,
      });
    }
  }, [readyKey, event, footprint, assets, alertHex, lite, reducedMotion, failed]);

  // ------------------------------------------------------------------
  // Map lifecycle. CARTO Dark Matter first; on style error or 8 s timeout,
  // one retry with the inline tile-free fallback. Never crash: context
  // creation failures surface as "Map unavailable on this device".
  //
  // Sizing: the map container is `absolute inset-0` inside a `relative`
  // parent with a real height (ImpactMapPanel), so it normally sizes on
  // creation. If it is ever created inside a zero-height/hidden container,
  // MapLibre falls back to a 300 px canvas; defer creation until the
  // container reports non-zero clientHeight, then init.
  // ------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let fallbackTried = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let map: MapLibreMap | null = null;
    let settled = false; // guards fail() firing after a successful load
    let observer: ResizeObserver | null = null;

    const stopObserving = (): void => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };

    const startObserving = (instance: MapLibreMap): void => {
      stopObserving();
      if (typeof ResizeObserver === "undefined") return;
      observer = new ResizeObserver((entries) => {
        if (disposed) return;
        for (const entry of entries) {
          if (entry.target !== container) continue;
          // A zero-height container would shrink the canvas back to the
          // 300 px fallback, so only resize when the container has size.
          if (entry.contentRect.height > 0 || entry.contentRect.width > 0) {
            instance.resize();
          }
        }
      });
      observer.observe(container);
    };

    const wire = (instance: MapLibreMap) => {
      instance.addControl(
        new AttributionControl({
          compact: true,
          customAttribution:
            "MapLibre · GDACS · Open-Meteo · Esri · OpenStreetMap contributors · CARTO",
        }),
      );
      timer = setTimeout(() => {
        if (!disposed && !settled) fail();
      }, 8000);
      instance.on("error", (e: unknown) => {
        if (!disposed && !settled) fail();
      });
      instance.on("style.load", () => {
        settled = true;
        if (timer) clearTimeout(timer);
      });
      instance.on("load", () => {
        settled = true;
        if (timer) clearTimeout(timer);
        // Real height is in place only after mount/layout; resize once now
        // so the canvas matches the panel size.
        instance.resize();
        // Re-run the data effect so footprint/pin layers are added on this
        // style (and re-added after a fallback swap).
        if (!disposed) setReadyKey((key) => key + 1);

        // Tooltip on hover over real or modeled pins (VELOS hotspot style).
        instance.on("mousemove", ["assets-solid", "assets-hollow"], (e: MapLayerMouseEvent) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const props = feature.properties as Partial<AssetTooltipProps>;
          if (!props || typeof props.name !== "string") return;
          ensurePopup()
            .setDOMContent(
              buildTooltipNode({
                name: props.name,
                type: typeof props.type === "string" ? props.type : "asset",
                tier: (props.tier ?? "MONITORING") as RiskTier,
                distance: typeof props.distance === "number" ? props.distance : null,
                synthetic: props.synthetic === true,
              }),
            )
            .setLngLat(e.lngLat)
            .addTo(instance);
        });
        instance.on("mouseleave", ["assets-solid", "assets-hollow"], () => {
          ensurePopup().remove();
        });
      });
    };

    const fail = () => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      stopObserving();
      if (map && mapRef.current === map) {
        map.remove();
        mapRef.current = null; // never reuse a removed map instance
      }
      map = null;
      if (disposed) return;
      if (fallbackTried) {
        setFailed(true);
        return;
      }
      fallbackTried = true;
      const begin = () => {
        const instance = new MapLibreMap({
          container,
          style: FALLBACK_STYLE,
          attributionControl: false,
        });
        map = instance;
        mapRef.current = instance; // ready for the data/focus effects
        wire(instance);
        startObserving(instance);
        // Re-run the data effect so footprint/pin layers are re-added on the
        // swapped-in fallback style.
        if (!disposed) setReadyKey((key) => key + 1);
      };
      try {
        begin();
      } catch {
        if (!disposed) setFailed(true);
      }
    };

    const beginMap = (): void => {
      try {
        const instance = new MapLibreMap({
          container,
          style: CARTO_STYLE_URL,
          attributionControl: false,
        });
        map = instance;
        mapRef.current = instance; // ready for the data/focus effects
        wire(instance);
        startObserving(instance);
      } catch {
        // Constructor throws when WebGL cannot initialise (no WebGL context):
        // no fallback style helps, so the panel reports it outside of the
        // synchronous effect path.
        window.queueMicrotask(() => {
          if (!disposed) setFailed(true);
        });
      }
    };

    // Defer creation until the container has a real size so the canvas is not
    // created at MapLibre's 300 px fallback height. When the container is
    // already sized (the normal case) this creates the map synchronously.
    if (container.clientHeight === 0 && container.clientWidth === 0) {
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver((entries) => {
          if (disposed) return;
          for (const entry of entries) {
            if (
              entry.target === container &&
              (entry.contentRect.height > 0 ||
                entry.contentRect.width > 0)
            ) {
              stopObserving();
              beginMap();
            }
          }
        });
        observer.observe(container);
      }
      return;
    }
    beginMap();

    return () => {
      disposed = true;
      settled = true;
      stopObserving();
      if (timer) clearTimeout(timer);
      popupRef.current?.remove();
      if (map && mapRef.current === map) {
        map.remove();
        mapRef.current = null; // never reuse a removed map instance
      }
      map = null;
    };
    // Re-create only when the selected event identity changes; data, props
    // and motion flags are applied by the data effect without a rebuild.
  }, [event?.id, event?.episodeId]);

  // ------------------------------------------------------------------
  // List rows fly to the pin and open the tooltip (keyboard alternative).
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!focus) return;
    const map = mapRef.current;
    if (!map || failed) return;
    ensurePopup()
      .setDOMContent(buildTooltipNode(tooltipPropsOf(focus.asset)))
      .setLngLat([focus.asset.lng, focus.asset.lat])
      .addTo(map);
    const center: LngLatLike = [focus.asset.lng, focus.asset.lat];
    if (lite || reducedMotion) {
      map.jumpTo({ center, zoom: 12 });
    } else {
      map.flyTo({ center, zoom: 12, duration: 900, essential: true });
    }
    // Focus carries a nonce; the map may not exist until readyKey bumps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.nonce, readyKey, failed]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 text-center">
        <p className="max-w-xs text-sm font-light text-white/50">
          Map unavailable on this device. Tiers and the asset list keep working
          alongside.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      role="application"
      aria-label="Impact footprint and asset map"
    />
  );
}
