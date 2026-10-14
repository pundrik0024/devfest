from __future__ import annotations
"""
Aravalli Agri-Tech & Watershed Intelligence — FastAPI Backend
All secret keys are loaded from .env ONLY — never hardcoded.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routes import agri_doctor, crop_doctor, soil_plan, prices, weather, alerts, shop, lake_watch, dashboard

app = FastAPI(
    title="Aravalli Agri-Tech API",
    description="Backend for Aravalli Agri-Tech & Watershed Intelligence platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "https://devfest-dusky.vercel.app",
        *[origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", "").split(",") if origin.strip()],
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agri_doctor.router, prefix="/api")
app.include_router(crop_doctor.router, prefix="/api")
app.include_router(soil_plan.router, prefix="/api")
app.include_router(prices.router, prefix="/api")
app.include_router(weather.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(shop.router, prefix="/api")
app.include_router(lake_watch.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
