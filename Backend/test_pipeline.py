import httpx
import asyncio
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def run_pipeline():
    async with httpx.AsyncClient(timeout=120.0) as client:
        print("STEP 1: Fetching Active Global Disasters")
        r_events = await client.get(f"{BASE_URL}/events/")
        r_events.raise_for_status()
        events = r_events.json().get("events", [])

        if not events:
            print("No active events found on GDACS.")
            return

        # Prefer land-based Flood (FL) or Wildfire (WF) so OSM finds real buildings
        land_events = [
            e for e in events
            if e.get("properties", {}).get("eventtype") in ("FL", "WF")
        ]
        target = land_events[0] if land_events else events[0]

        props = target.get("properties", {})
        evt_type = props.get("eventtype")
        evt_id = props.get("eventid")
        ep_id = props.get("episodeid")
        name = props.get("name", "Unknown Event")

        print(f"Selected event: {name} (Type: {evt_type}, ID: {evt_id}, Episode: {ep_id})")

        print("\nSTEP 2: Running Spatial Engine (GeoPandas + OpenStreetMap)")
        impact_url = f"{BASE_URL}/impact/{evt_type}/{evt_id}/{ep_id}/infrastructure"
        r_impact = await client.get(impact_url)

        if r_impact.status_code == 200:
            features = r_impact.json().get("features", [])
            print(f"Found {len(features)} critical infrastructure assets within the hazard zone.")
        else:
            print(f"Spatial Engine Warning: {r_impact.text}")

        print("\nSTEP 3: Generating AI Executive Briefing")
        ai_url = f"{BASE_URL}/intelligence/{evt_type}/{evt_id}/{ep_id}/briefing"
        r_ai = await client.get(ai_url)

        if r_ai.status_code == 200:
            data = r_ai.json()
            print("\nINFRASTRUCTURE RISK STATISTICS:")
            print(json.dumps(data.get("infrastructure_stats"), indent=2))

            print("\nCHRONOS SEVERITY FORECAST (NEXT 7 DAYS):")
            print(json.dumps(data.get("ai_forecast"), indent=2))

            print("\nOLLAMA EXECUTIVE BRIEFING:")
            print(data.get("executive_briefing"))
        else:
            print(f"AI Engine Error: {r_ai.text}")

if __name__ == "__main__":
    asyncio.run(run_pipeline())
    