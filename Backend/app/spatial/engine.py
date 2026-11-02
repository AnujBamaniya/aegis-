import geopandas as gpd
from typing import Dict, Any
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

def calculate_infrastructure_risk(hazard_geojson: Dict[str, Any], infra_geojson: Dict[str, Any]) -> Dict[str, Any]:
    """
    Projects geographic coordinates to local UTM meters, calculates the exact distance 
    from critical infrastructure to the hazard polygons, and assigns a risk tier.
    """
    if not hazard_geojson.get("features") or not infra_geojson.get("features"):
        return infra_geojson

    hazard_gdf = gpd.GeoDataFrame.from_features(hazard_geojson["features"], crs="EPSG:4326")
    infra_gdf = gpd.GeoDataFrame.from_features(infra_geojson["features"], crs="EPSG:4326")

    utm_crs = hazard_gdf.estimate_utm_crs()

    hazard_utm = hazard_gdf.to_crs(utm_crs)
    infra_utm = infra_gdf.to_crs(utm_crs)

    joined_utm = gpd.sjoin_nearest(
        infra_utm, 
        hazard_utm, 
        how="left", 
        distance_col="distance_meters"
    )

    def assign_risk(dist):
        if dist == 0:
            return "CRITICAL_IMPACT" # Inside the polygon
        elif dist <= 5000:
            return "HIGH_RISK"       # Within 5km
        elif dist <= 15000:
            return "ELEVATED"        # Within 15km
        return "MONITORING"

    joined_utm["risk_tier"] = joined_utm["distance_meters"].apply(assign_risk)
    
    if "index_right" in joined_utm.columns:
        joined_utm = joined_utm.drop(columns=["index_right"])

    final_gdf = joined_utm.to_crs("EPSG:4326")

    final_gdf = final_gdf.replace({float('nan'): None})
    
    return final_gdf.__geo_interface__
