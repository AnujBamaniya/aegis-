// SYNTHETIC fixture — not real GDACS output. See _meta.ts.
// 6 events across TC/FL/WF with mixed alert levels; one intentionally minimal.
// All property names beyond eventtype/eventid/episodeid are unverified guesses.

export const eventsFixture = {
  count: 6,
  events: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [124.0523, 11.2517] },
      properties: {
        eventtype: "TC",
        eventid: 9001007,
        episodeid: 3,
        name: "Severe Tropical Storm Alpine",
        alertlevel: "Red",
        alertscore: 3.1,
        country: "Philippines",
        iso3: "PHL",
        fromdate: "2026-10-29T03:00:00Z",
        todate: "2026-11-02T18:00:00Z",
        description:
          "Synthetic cyclone track. Fixture only; no real meteorological basis.",
        severitydata: {
          severity: 4,
          severitytext: "Tropical Storm",
          severityunit: "SSHWS:1",
        },
        url: { detail: "https://synthetic.demo/alpine-storm" },
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [131.6, 5.4] },
      properties: {
        eventtype: "TC",
        eventid: 9001812,
        episodeid: 1,
        name: "Tropical Storm Brim",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [2.35, 48.85] },
      properties: {
        eventtype: "FL",
        eventid: 9002440,
        episodeid: 2,
        name: "Dee Basin Flood",
        alertlevel: "Orange",
        country: "France",
        iso3: "FRA",
        fromdate: "2026-10-31T09:00:00Z",
        severitydata: {
          severity: 2,
          severitytext: "Flood watch",
          severityunit: "GDACS scale",
        },
        url: { detail: "https://synthetic.demo/dee-flood" },
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [51.23, 6.11] },
      properties: {
        eventtype: "FL",
        eventid: 9002511,
        episodeid: 1,
        name: "Roer Riverside Flood",
        alertlevel: "Green",
        country: "Germany",
        iso3: "DEU",
        fromdate: "2026-10-27T12:00:00Z",
        severitydata: {
          severity: 1,
          severitytext: "Minor flood",
          severityunit: "GDACS scale",
        },
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [121.6, -1.4] },
      properties: {
        eventtype: "WF",
        eventid: 9003760,
        episodeid: 5,
        name: "Karr Ridge Wildfire",
        alertlevel: "Red",
        country: "Indonesia",
        iso3: "IDN",
        fromdate: "2026-10-30T22:00:00Z",
        severitydata: {
          severity: 3,
          severitytext: "Extreme fire",
          severityunit: "GDACS scale",
        },
        url: { detail: "https://synthetic.demo/karr-fire" },
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-119.7, 34.4] },
      properties: {
        eventtype: "WF",
        eventid: 9003928,
        episodeid: 1,
        name: "Caldera Burn Area",
        alertlevel: "Green",
        country: "United States",
        iso3: "USA",
        fromdate: "2026-10-25T16:00:00Z",
      },
    },
  ],
} as const;
