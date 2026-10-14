from __future__ import annotations
"""Alerts route — weather-triggered farm alerts."""

import os
from fastapi import APIRouter, Query
from services.weather_service import get_forecast
from services.rules_engine import generate_alerts

router = APIRouter()

DEFAULT_LAT = float(os.environ.get("DEFAULT_LAT", "24.5854"))
DEFAULT_LON = float(os.environ.get("DEFAULT_LON", "73.7125"))

SAMPLE_ALERTS = [
    {
        "severity": "advisory",
        "title": "Dry Spell Advisory",
        "detail": "No significant rainfall expected in the next 5 days. Consider irrigation scheduling for standing Tomato and Mustard crops in Girwa block.",
        "icon": "🌤️",
        "date": "Today",
        "sample": True,
    },
    {
        "severity": "info",
        "title": "Optimal Spray Window",
        "detail": "Wind speed below 12 km/h expected tomorrow morning (06:00–10:00). Recommended window for foliar fungicide application.",
        "icon": "💧",
        "date": "Tomorrow",
        "sample": True,
    },
    {
        "severity": "info",
        "title": "Temperature Advisory",
        "detail": "Night temperatures expected to drop to 18–20°C this week. Monitor for early morning fungal conditions in high-humidity zones.",
        "icon": "🌡️",
        "date": "This Week",
        "sample": True,
    },
]


@router.get("/alerts")
async def alerts(
    lat: float = Query(default=DEFAULT_LAT),
    lon: float = Query(default=DEFAULT_LON),
    location: str = Query(default="Udaipur, Rajasthan"),
):
    try:
        forecast = await get_forecast(lat, lon)
        alert_list = generate_alerts(forecast)
        is_sample = False
    except Exception:
        # Fallback to sample alerts when OWM key is missing/invalid
        alert_list = SAMPLE_ALERTS
        is_sample = True

    return {
        "location": location,
        "alerts": alert_list,
        "total": len(alert_list),
        "sample_data": is_sample,
        "note": "Add OPENWEATHERMAP_API_KEY to backend/.env for real-time alerts." if is_sample else None,
    }
