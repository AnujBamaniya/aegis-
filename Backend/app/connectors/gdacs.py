import httpx
from typing import List, Dict, Any
from app.cache import cache

GDACS_BASE_URL = "https://www.gdacs.org/gdacsapi/api"

async def fetch_active_events() -> List[Dict]:
    """Fetches currently active Cyclones (TC), Floods (FL), and Wildfires (WF)."""
    cache_key = "gdacs_active_events"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        print("Returning GDACS events from cache...")
        return cached_data

    url = f"{GDACS_BASE_URL}/events/geteventlist/SEARCH?eventlist=TC,FL,WF&alertlevel=green;orange;red"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10.0)
        response.raise_for_status()
        features = response.json().get("features", [])
        
        # Cache for 15 minutes
        cache.set(cache_key, features, expire=900)
        return features

async def fetch_event_polygon(event_type: str, event_id: int, episode_id: int) -> Dict[str, Any]:
    """Fetches the exact GeoJSON impact polygon for a specific disaster."""
    cache_key = f"gdacs_polygon_{event_type}_{event_id}_{episode_id}"
    cached_poly = cache.get(cache_key)

    if cached_poly:
        return cached_poly

    # The GDACS polygon endpoint
    url = f"{GDACS_BASE_URL}/polygons/getgeometry?eventtype={event_type}&eventid={event_id}&episodeid={episode_id}"
    
    # For wildfires/floods, we want the cumulative 'OverAll' polygon if available
    if event_type in ["WF", "FL"]:
        url += "&source=OverAll"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=15.0)
            response.raise_for_status()
            geojson_data = response.json()
            
            # Cache the polygon for 1 hour (3600 seconds) since historic polygons rarely change
            cache.set(cache_key, geojson_data, expire=3600)
            return geojson_data
        except Exception as e:
            print(f"Error fetching polygon for {event_type} {event_id}: {str(e)}")
            return {"type": "FeatureCollection", "features": []}
        