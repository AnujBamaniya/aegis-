// SYNTHETIC fixture — not a real model output. See _meta.ts.
// The briefing text implies nothing about real events; wording follows
// docs/PROBLEM.md (calm, factual) and BACKEND_CONTRACT.md honest-label rules.

export const briefingOkFixture = {
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
  executive_briefing: [
    "**Situation** — Within the 55 km scan window, 13 assets are classified; 2 sit inside the critical impact zone, 4 carry high risk.",
    "",
    "**Forecast** — The hydro-meteorological severity index sits at 15.6 and rises through the modeled window. The upper band crosses the current alert level after step 4.",
    "",
    "**Actions** —",
    "- Eastern General Hospital and Fire Station 4 remain inside the critical footprint. Confirm generator fuel and access routes.",
    "- Re-check the substation and heliport staging area before any movement order.",
    "- Re-run the briefing once field reports arrive; this text is produced by a small local model. Verify before acting.",
  ].join("\n"),
} as const;
