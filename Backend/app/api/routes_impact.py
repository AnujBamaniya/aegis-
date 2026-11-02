from fastapi import APIRouter, HTTPException
import geopandas as gpd
from typing import Dict, Any

from app.connectors.gdacs import fetch_event_polygon
from app.connectors.geocoder import fetch_critical_infrastructure
from app.spatial.engine import calculate_infrastructure_risk

router = APIRouter()

@router.get("/{event_type}/{event_id}/{episode_id}/infrastructure")
async def get_infrastructure_risk(event_type: str, event_id: int, episode_id: int) -> Dict[str, Any]:
    """
    Fetches the disaster polygon, queries OSM for critical infrastructure in the area,
    and returns a risk-scored GeoJSON of the assets.
    """
    polygon_geojson = await fetch_event_polygon(event_type, event_id, episode_id)
    if not polygon_geojson.get("features"):
        raise HTTPException(status_code=404, detail="Disaster polygon not found or not yet generated.")

    gdf = gpd.GeoDataFrame.from_features(polygon_geojson["features"])
    minx, miny, maxx, maxy = gdf.total_bounds
    
    padding = 0.15
    bbox = (minx - padding, miny - padding, maxx + padding, maxy + padding)

    infra_geojson = await fetch_critical_infrastructure(bbox)
    if not infra_geojson.get("features"):
        return {"message": "No critical infrastructure found in this sector.", "type": "FeatureCollection", "features": []}

    risk_scored_geojson = calculate_infrastructure_risk(polygon_geojson, infra_geojson)

    return risk_scored_geojson
