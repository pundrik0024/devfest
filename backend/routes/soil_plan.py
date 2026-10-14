from __future__ import annotations
"""Soil Plan route — rule-based degradation index + Gemini remediation plan."""

import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.gemini_service import write_remediation_plan

router = APIRouter()


def _load_soil():
    path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "soil_sample.json")
    with open(path) as f:
        return json.load(f)


def _load_products():
    path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "products.json")
    with open(path) as f:
        return json.load(f)


def _compute_degradation_index(metrics: dict) -> tuple[int, str]:
    """
    Rule-based degradation index (0–100, higher = more degraded).
    Risk levels: Low (0–30), Medium (31–55), High (56–75), Critical (76–100).
    """
    score = 0

    # Organic carbon (max 30 pts) — low OC → high degradation
    oc = metrics.get("organic_carbon_pct", 0.5)
    if oc < 0.2:
        score += 30
    elif oc < 0.4:
        score += 22
    elif oc < 0.6:
        score += 14
    elif oc < 0.8:
        score += 6

    # Moisture (max 20 pts)
    moisture = metrics.get("moisture_pct", 35)
    if moisture < 15:
        score += 20
    elif moisture < 25:
        score += 14
    elif moisture < 35:
        score += 8

    # Salinity (max 20 pts)
    salinity = metrics.get("salinity_ds_m", 0.5)
    if salinity > 4.0:
        score += 20
    elif salinity > 2.0:
        score += 14
    elif salinity > 1.0:
        score += 8
    elif salinity > 0.7:
        score += 3

    # pH extremes (max 15 pts)
    ph = metrics.get("ph", 7.0)
    if ph < 5.5 or ph > 9.0:
        score += 15
    elif ph < 6.0 or ph > 8.5:
        score += 10
    elif ph < 6.5 or ph > 8.0:
        score += 5

    # Erosion gradient (max 15 pts)
    erosion = metrics.get("erosion_hydro_gradient", 1.0)
    if erosion > 5.0:
        score += 15
    elif erosion > 3.0:
        score += 10
    elif erosion > 2.0:
        score += 7
    elif erosion > 1.0:
        score += 3

    # Clamp to 0–100
    score = min(100, max(0, score))

    if score <= 30:
        risk = "Low"
    elif score <= 55:
        risk = "Medium"
    elif score <= 75:
        risk = "High"
    else:
        risk = "Critical"

    return score, risk


@router.get("/soil-plan")
async def soil_plan(location: str = "Udaipur"):
    soil = _load_soil()
    metrics = soil.get("metrics", {})

    index, risk = _compute_degradation_index(metrics)

    soil_data_for_gemini = {
        "location": soil.get("location"),
        "zone": soil.get("zone"),
        "metrics": {
            "moisture_pct": metrics.get("moisture_pct"),
            "organic_carbon_pct": metrics.get("organic_carbon_pct"),
            "salinity_ds_m": metrics.get("salinity_ds_m"),
            "ph": metrics.get("ph"),
            "erosion_gradient": metrics.get("erosion_hydro_gradient"),
            "slope_direction": metrics.get("erosion_direction"),
        },
        "degradation_index": index,
        "risk_level": risk,
    }

    try:
        remediation_plan = await write_remediation_plan(soil_data_for_gemini)
    except Exception as e:
        # Graceful fallback if Gemini fails
        remediation_plan = [
            {"step": 1, "title": "Increase Water Retention", "phase": "Phase 1 — Immediate", "action": "Apply well-decomposed FYM (4 tonnes/ha) to improve soil moisture holding capacity.", "timing": "This week", "detail": "Broadcast evenly before irrigation."},
            {"step": 2, "title": "Add Micronutrients", "phase": "Phase 2 — Day 3-5", "action": "Apply Zinc Sulphate at recommended dose to correct deficiency in alkaline soils.", "timing": "Days 3-5", "detail": "Mix with irrigation water for best uptake."},
            {"step": 3, "title": "Recheck Spectral Indices", "phase": "Phase 3 — Day 11", "action": "Schedule automated soil moisture check and notify via SMS advisory.", "timing": "Day 11", "detail": "Compare NDRE before and after treatment."},
        ]

    products = _load_products()
    kit = next((p for p in products["products"] if p["id"] == "kit-soil-rejuvenation"), None)

    return {
        "location": soil.get("location"),
        "zone": soil.get("zone"),
        "sample_date": soil.get("sample_date"),
        "degradation_index": index,
        "risk_level": risk,
        "metrics": metrics,
        "spectral_ndre": soil.get("spectral_ndre"),
        "remediation_plan": remediation_plan,
        "recommended_kit": kit,
        "disclaimer": "AI suggestion based on sample soil data. Verify with a certified soil test before applying inputs.",
        "sample_data": True,
    }
