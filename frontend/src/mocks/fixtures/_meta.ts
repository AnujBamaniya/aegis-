/**
 * SYNTHETIC demonstration data. Nothing in this folder is real GDACS, Esri,
 * Open-Meteo or OpenStreetMap output. Do not use for operational planning.
 */
export const MOCK_META = {
  note: "Synthetic fixture data for the demo build. Not real GDACS or infrastructure output.",
  authored: "hand-written 2026-11",
  scenarios:
    "In mock mode, ?case=empty|error|slow|noforecast|llmerror branches are handled in dataSource.ts.",
} as const;
