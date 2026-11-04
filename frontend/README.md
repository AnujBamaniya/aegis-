# Aegis Matrix (frontend)

Real-time disaster impact prediction and threat mapping (GDACS × critical infrastructure).
The backend reference lives in `../Backend/app/` and is not needed to run this app.

## Run

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

Verify with `pnpm exec tsc --noEmit` and `pnpm lint`. Production: `pnpm build && pnpm start`.

## Environment variables

- `NEXT_PUBLIC_DATA_MODE` = `mock` (default) | `live`.
  - `mock`: synthetic fixtures in `src/mocks/fixtures/` (`?case=` scenarios below).
  - `live`: all requests go through the proxy `src/app/api/aegis/[...path]/route.ts`.
- `AEGIS_API_URL`: server-side base URL of the backend (live mode only; not exposed to the browser).
- `NEXT_PUBLIC_LITE_MODE=1`: force lite mode (also `?lite=1`, low device caps, or `localStorage["aegis:lite"]="1"`).

## Mock scenarios (`?case=`)

`ok` (default) · `empty` · `error` · `slow` · `noforecast` · `llmerror`

All mock data is synthetic — never real GDACS, OpenStreetMap, Open-Meteo or Esri output.
