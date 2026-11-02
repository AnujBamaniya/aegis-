// SYNTHETIC fixture — not real GDACS output. See _meta.ts.
// Mixed geometry: one Polygon (modeled wind swath) + one LineString (track).

export const polygonFixture = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [120.9, 13.9],
            [122.1, 14.4],
            [123.2, 13.1],
            [122.6, 11.9],
            [121.2, 12.2],
            [120.9, 13.9],
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
          [131.2, 5.9],
          [131.6, 5.2],
          [132.3, 4.4],
        ],
      },
      properties: { name: "Track (best path)", source: "synthetic" },
    },
  ],
} as const;
