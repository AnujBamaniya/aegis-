// SYNTHETIC fixture — not a real model output. See _meta.ts.
// Mirrors backend bug 5: HTTP 200 with an "**Error**" body -> the data source
// turns this into the briefing error state ("Briefing service unavailable").

export const briefingLlmerrorFixture = {
  event: "Severe Tropical Storm Alpine",
  infrastructure_stats: {
    CRITICAL_IMPACT: 2,
    HIGH_RISK: 4,
    ELEVATED: 4,
    MONITORING: 3,
  },
  ai_forecast: {
    p10: [12.4, 13.1, 14.0, 15.2, 16.8, 18.0, 18.9],
    p50: [15.6, 17.2, 19.5, 22.4, 25.9, 28.7, 30.6],
    p90: [19.3, 22.1, 26.4, 31.0, 35.8, 39.4, 41.2],
  },
  executive_briefing:
    "**Error** Briefing generation failed. The local model did not return text.",
} as const;
