import httpx
from typing import Dict, Any
from app.cache import cache

OPENMETEO_FLOOD_URL = "https://flood-api.open-meteo.com/v1/flood"
OPENMETEO_WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

async def fetch_hydro_timeseries(lat: float, lon: float) -> Dict[str, Any]:
    lat_r, lon_r = round(lat, 2), round(lon, 2)
    cache_key = f"telemetry_series_v2_{lat_r}_{lon_r}"

    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1. Try River Discharge (Flood API)
        try:
            r_flood = await client.get(
                OPENMETEO_FLOOD_URL,
                params={
                    "latitude": lat_r,
                    "longitude": lon_r,
                    "daily": "river_discharge",
                    "past_days": 90,
                    "forecast_days": 7,
                },
            )
            if r_flood.status_code == 200:
                flood_json = r_flood.json()
                discharge = flood_json.get("daily", {}).get("river_discharge", [])
                clean = [x for x in discharge if x is not None]
                if len(clean) >= 14:
                    cache.set(cache_key, flood_json, expire=3600)
                    return flood_json
        except Exception as e:
            print(f"Flood API fallback triggered: {e}")

        # 2. Fallback to 90-day Max Wind Speed (works on 100% of ocean & land coordinates)
        try:
            r_weather = await client.get(
                OPENMETEO_WEATHER_URL,
                params={
                    "latitude": lat_r,
                    "longitude": lon_r,
                    "daily": "wind_speed_10m_max",
                    "past_days": 90,
                    "forecast_days": 7,
                },
            )
            r_weather.raise_for_status()
            weather_json = r_weather.json()
            # Normalize key so routes_ai.py reads it seamlessly
            winds = weather_json.get("daily", {}).get("wind_speed_10m_max", [])
            normalized = {"daily": {"river_discharge": winds}, "metric": "wind_speed_kmh"}
            cache.set(cache_key, normalized, expire=3600)
            return normalized
        except Exception as e:
            print(f"Open-Meteo Weather Error: {e}")
            return {}
        