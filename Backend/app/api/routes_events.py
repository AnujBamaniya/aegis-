from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.connectors.gdacs import fetch_active_events, fetch_event_polygon

router = APIRouter()

@router.get("/", summary="Get live global disasters (GDACS)")
async def get_live_events():
    """Returns all active red, orange, and green alert disasters worldwide."""
    events = await fetch_active_events()
    if not events:
        raise HTTPException(status_code=404, detail="No active events found or API unreachable.")
    return {"count": len(events), "events": events}

@router.get("/{event_type}/{event_id}/{episode_id}/polygon", summary="Get specific disaster impact polygon")
async def get_event_polygon(event_type: str, event_id: int, episode_id: int) -> Dict[str, Any]:
    """Returns the multi-ring GeoJSON polygon for a specific disaster."""
    polygon = await fetch_event_polygon(event_type, event_id, episode_id)
    if not polygon.get("features"):
        raise HTTPException(status_code=404, detail="No polygon geometry available for this event.")
    return polygon
