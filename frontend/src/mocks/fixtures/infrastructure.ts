// SYNTHETIC fixture — not real ArcGIS/OSM data. See _meta.ts.
// 14 features, deduped by adapters to 13 assets: every tier represented,
// every real asset_type, 3 synthetic fallbacks (osm_id 900001..900007),
// one `name_left` leak case near coords [124.05, 11.25].

export const infrastructureFixture = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.0523, 11.2517] },
      properties: {
        osm_id: 601234567,
        name: "Eastern General Hospital",
        asset_type: "hospital",
        distance_meters: 320,
        risk_tier: "CRITICAL_IMPACT",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.0489, 11.2496] },
      properties: {
        osm_id: 601234999,
        name: "Sablayan Family Clinic",
        asset_type: "clinic",
        distance_meters: 1200,
        risk_tier: "HIGH_RISK",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.0551, 11.2531] },
      properties: {
        osm_id: 601200045,
        name: "Fire Station 4",
        asset_type: "fire_station",
        distance_meters: 260,
        risk_tier: "CRITICAL_IMPACT",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.0861, 11.2603] },
      properties: {
        osm_id: 601188320,
        name: "Provincial Police HQ",
        asset_type: "police",
        distance_meters: 3800,
        risk_tier: "HIGH_RISK",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.1164, 11.2075] },
      properties: {
        osm_id: 601112458,
        name: "Saban Municipal Aerodrome",
        asset_type: "aerodrome",
        distance_meters: 9800,
        risk_tier: "ELEVATED",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.0614, 11.2302] },
      properties: {
        osm_id: 601211903,
        name: "St. Anna Medical Center",
        asset_type: "hospital",
        distance_meters: 720,
        risk_tier: "HIGH_RISK",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.1339, 11.1866] },
      properties: {
        osm_id: 601099517,
        name: "Riverside Clinic",
        asset_type: "clinic",
        distance_meters: 12500,
        risk_tier: "ELEVATED",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.1731, 11.1594] },
      properties: {
        osm_id: 601066214,
        name: "Fire Station 9",
        asset_type: "fire_station",
        distance_meters: 15600,
        risk_tier: "MONITORING",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.2204, 11.1313] },
      properties: {
        osm_id: 601033589,
        name: "Municipal Precinct",
        asset_type: "police",
        distance_meters: 24800,
        risk_tier: "MONITORING",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.0905, 11.2401] },
      properties: {
        osm_id: 900001,
        name: "Grid substation (modeled)",
        asset_type: "substation",
        distance_meters: 5400,
        risk_tier: "HIGH_RISK",
        synthetic: true,
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.1902, 11.1421] },
      properties: {
        osm_id: 900002,
        name: "Diesel power plant (modeled)",
        asset_type: "plant",
        distance_meters: 18000,
        risk_tier: "MONITORING",
        synthetic: true,
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.1429, 11.2057] },
      properties: {
        osm_id: 601144276,
        // hazard props can leak in: name arrives as name_left
        name_left: "Coast Guard Detachment",
        asset_type: "police",
        distance_meters: 14000,
        risk_tier: "ELEVATED",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.052301, 11.251702] },
      properties: {
        osm_id: 601234568,
        name: "Eastern General Hospital",
        asset_type: "hospital",
        distance_meters: 900,
        risk_tier: "HIGH_RISK",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.1052, 11.2233] },
      properties: {
        osm_id: 900003,
        name: "Heliport staging area (modeled)",
        asset_type: "heliport",
        distance_meters: 8300,
        risk_tier: "ELEVATED",
        synthetic: true,
      },
    },
  ],
} as const;
