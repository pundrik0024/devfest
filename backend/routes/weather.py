from __future__ import annotations
"""Weather + Outlook routes."""

import os
from fastapi import APIRouter, HTTPException, Query
from services.weather_service import get_current_weather, get_forecast
from services.rules_engine import compute_outlook

router = APIRouter()

DEFAULT_LAT = float(os.environ.get("DEFAULT_LAT", "24.5854"))
DEFAULT_LON = float(os.environ.get("DEFAULT_LON", "73.7125"))


@router.get("/weather")
async def weather(
    lat: float = Query(default=DEFAULT_LAT),
    lon: float = Query(default=DEFAULT_LON),
):
    try:
        current = await get_current_weather(lat, lon)
        forecast = await get_forecast(lat, lon)
        return {"current": current, "forecast": forecast}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Weather service error: {str(e)}")


@router.get("/outlook")
async def outlook(
    crop: str = Query(default="tomato"),
    lat: float = Query(default=DEFAULT_LAT),
    lon: float = Query(default=DEFAULT_LON),
):
    try:
        forecast = await get_forecast(lat, lon)
    except Exception:
        forecast = []

    days = compute_outlook(crop, forecast)
    return {
        "crop": crop,
        "outlook": days,
        "note": "Days 1–5 based on real forecast. Days 6–10 extrapolated (medium confidence). Days 11–20 seasonal pattern (low confidence).",
        "sample_data": len(forecast) == 0,
    }
