from __future__ import annotations
"""Dashboard route — researcher/NGO data endpoint."""

import json
import os
from fastapi import APIRouter, Query

router = APIRouter()


def _load_soil():
    path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "soil_sample.json")
    with open(path) as f:
        return json.load(f)


def _load_lake():
    path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "lake_status.json")
    with open(path) as f:
        return json.load(f)


# Synthetic time-series for charts (sample data)
SOIL_TREND = [
    {"month": "Aug", "moisture": 52, "organic_carbon": 0.38, "salinity": 0.55},
    {"month": "Sep", "moisture": 48, "organic_carbon": 0.39, "salinity": 0.58},
    {"month": "Oct", "moisture": 35, "organic_carbon": 0.40, "salinity": 0.62},
    {"month": "Nov", "moisture": 28, "organic_carbon": 0.41, "salinity": 0.68},
    {"month": "Dec", "moisture": 22, "organic_carbon": 0.40, "salinity": 0.71},
    {"month": "Jan", "moisture": 28, "organic_carbon": 0.41, "salinity": 0.68},
]

WATERSHED_TREND = [
    {"month": "Aug", "pichola_level": 98, "mavli_level": 95, "recharge_rate": 82},
    {"month": "Sep", "pichola_level": 96, "mavli_level": 92, "recharge_rate": 78},
    {"month": "Oct", "pichola_level": 94, "mavli_level": 91, "recharge_rate": 74},
    {"month": "Nov", "pichola_level": 93, "mavli_level": 90, "recharge_rate": 70},
    {"month": "Dec", "pichola_level": 92, "mavli_level": 89, "recharge_rate": 68},
    {"month": "Jan", "pichola_level": 92, "mavli_level": 88, "recharge_rate": 65},
]


@router.get("/dashboard")
async def dashboard(start_month: str = Query(default=""), end_month: str = Query(default="")):
    soil = _load_soil()
    lake = _load_lake()

    return {
        "soil_trend": SOIL_TREND,
        "watershed_trend": WATERSHED_TREND,
        "current_soil": soil.get("metrics"),
        "current_lakes": lake.get("lakes"),
        "summary": {
            "degradation_index": 42,
            "risk_level": "Medium",
            "active_lakes": 4,
            "area_monitored_ha": 362,
        },
        "sample_data": True,
        "note": "All values are sample data for demonstration.",
    }
