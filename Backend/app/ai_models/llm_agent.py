import ollama
from typing import Dict, Any

def generate_executive_briefing(
    event_type: str, 
    event_id: int, 
    risk_counts: Dict[str, int], 
    forecast: Dict[str, list]
) -> str:
    
    type_map = {
        "TC": "Tropical Cyclone / Hurricane",
        "FL": "Severe Flood",
        "WF": "Wildfire / Forest Fire",
        "EQ": "Earthquake"
    }
    hazard_name = type_map.get(event_type, "Hazardous Event")
    
    prompt = f"""
    You are an emergency management AI. Write a brief Executive Situation Report for a {hazard_name} (Event ID: {event_id}).
    
    CURRENT INFRASTRUCTURE RISK:
    - Critical Impact (0m): {risk_counts.get("CRITICAL_IMPACT", 0)} assets
    - High Risk (Within 5km): {risk_counts.get("HIGH_RISK", 0)} assets
    - Elevated Risk (Within 15km): {risk_counts.get("ELEVATED", 0)} assets
    
    72-HOUR SEVERITY FORECAST (Based on Chronos-Bolt AI):
    - Median Trajectory: {forecast.get('p50', [])[:3]}
    - Worst-Case Trajectory (90th Percentile): {forecast.get('p90', [])[:3]}
    
    FORMAT REQUIREMENTS:
    Return your response strictly in Markdown format with three sections:
    1. **SITUATION OVERVIEW**: 2 sentences summarizing the specific threat of this {hazard_name}. Do NOT mention storms if it is a fire or earthquake.
    2. **INFRASTRUCTURE AT RISK**: Bullet points detailing the spatial threat.
    3. **AI TRAJECTORY**: 2 sentences analyzing the worst-case forecast numbers.
    """

    try:
        response = ollama.chat(model='llama3.2:3b', messages=[
            {'role': 'system', 'content': 'You are a strict, factual geospatial intelligence analyst. Never invent details.'},
            {'role': 'user', 'content': prompt}
        ])
        return response['message']['content']
    except Exception as e:
        return f"**Error**: Could not generate AI briefing. Details: {str(e)}"
    