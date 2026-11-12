// SYNTHETIC fixture — not real GDACS output. See _meta.ts.
// Mixed geometry: one Polygon (modeled wind swath) + one LineString (track).
// Centered on the Alpine event point [124.05, 11.25] so footprint, track,
// and infrastructure fixtures share one coherent scene.

export const polygonFixture = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [123.6, 11.05],
            [124.0, 10.7],
            [124.6, 11.0],
            [124.9, 11.4],
            [124.5, 11.75],
            [123.9, 11.55],
            [123.6, 11.05],
          ],
        ],
      },
      properties: { name: "Wind swath (modeled)", source: "synthetic" },
    },
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [125.6, 10.2],
          [124.9, 10.7],
          [124.35, 11.0],
          [124.0523, 11.2517],
          [123.7, 11.6],
        ],
      },
      properties: { name: "Track (best path)", source: "synthetic" },
    },
  ],
} as const;
