from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Project Aegis Backend",
    description="Geospatial Intelligence & Early Warning API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online", "system": "Project Aegis Core Active"}

from app.api.routes_events import router as events_router
from app.api.routes_impact import router as impact_router
from app.api.routes_ai import router as ai_router

app.include_router(events_router, prefix="/api/v1/events", tags=["Events"])
app.include_router(impact_router, prefix="/api/v1/impact", tags=["Spatial Impact"])
app.include_router(ai_router, prefix="/api/v1/intelligence", tags=["AI Briefing"])