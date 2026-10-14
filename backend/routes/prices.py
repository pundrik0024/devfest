from __future__ import annotations
"""Mandi Prices route."""

import json
import os
from fastapi import APIRouter, Query, HTTPException
from services.weather_service import get_forecast
from services.gemini_service import write_sell_timing_advice

router = APIRouter()

DEFAULT_LAT = float(os.environ.get("DEFAULT_LAT", "24.5854"))
DEFAULT_LON = float(os.environ.get("DEFAULT_LON", "73.7125"))


def _load_mandi():
    path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "mandi_prices.json")
    with open(path) as f:
        return json.load(f)


@router.get("/prices")
async def prices(
    location: str = Query(default="Udaipur"),
    crop: str = Query(default="all"),
    lat: float = Query(default=DEFAULT_LAT),
    lon: float = Query(default=DEFAULT_LON),
    lang: str = Query(default="en"),
):
    data = _load_mandi()
    crops = data["crops"]
    mandi_table = data["mandi_table"]

    if crop != "all":
        crops = [c for c in crops if c["id"] == crop]
        mandi_table = [m for m in mandi_table if m["crop"].lower().startswith(crop)]

    try:
        forecast = await get_forecast(lat, lon)
    except Exception:
        forecast = []

    # Generate Gemini advice for each crop
    for c in crops:
        crop_data = {
            "crop": c["name_en"],
            "mandis": c.get("mandis", []),
            "forecast": forecast[:3],
        }
        try:
            c["gemini_advice"] = await write_sell_timing_advice(crop_data, lang)
        except Exception:
            c["gemini_advice"] = None
        c["advice_disclaimer"] = "AI suggestion. Verify with a local market expert before selling."

    return {
        "location": location,
        "crops": crops,
        "mandi_table": mandi_table,
        "forecast": forecast,
        "sample_data": True,
        "data_note": "Prices from sample data. For live prices, connect to AGMARKNET or e-NAM API.",
    }
