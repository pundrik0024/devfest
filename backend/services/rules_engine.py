from __future__ import annotations
"""
Rules engine — threshold-based outlook and alert generation.
No Gemini calls. Pure deterministic rules from crops_config.json.
"""

import json
import os
from datetime import date, timedelta
from typing import Literal

_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "sample_data", "crops_config.json")


def _load_config() -> dict:
    with open(_CONFIG_PATH, "r") as f:
        return json.load(f)


OutlookStatus = Literal["optimal", "caution", "not_suitable", "spray_ok", "data_unavailable"]
Confidence = Literal["high", "medium", "low"]


def compute_outlook(crop: str, forecast_days: list[dict]) -> list[dict]:
    """
    Given a crop name and a list of forecast day dicts, return a 20-day outlook.
    Days 1-5: use real forecast + High confidence.
    Days 6-10: extrapolate last known day + Medium confidence.
    Days 11-20: repeat seasonal pattern + Low confidence.
    """
    config = _load_config()
    crop_rules = config.get("crops", {}).get(crop.lower(), config.get("crops", {}).get("default", {}))

    results = []
    today = date.today()

    for offset in range(20):
        day_date = today + timedelta(days=offset)
        confidence: Confidence = "high" if offset < 5 else "medium" if offset < 10 else "low"

        if offset < len(forecast_days):
            day_fc = forecast_days[offset]
        elif forecast_days:
            # Extrapolate: use the last available forecast day with degraded confidence
            day_fc = forecast_days[-1]
        else:
            results.append({
                "date": day_date.isoformat(),
                "day": day_date.strftime("%a"),
                "status": "data_unavailable",
                "confidence": confidence,
                "notes": "Weather data unavailable",
            })
            continue

        status, notes = _evaluate_day(day_fc, crop_rules, offset)
        results.append({
            "date": day_date.isoformat(),
            "day": day_date.strftime("%a"),
            "status": status,
            "confidence": confidence,
            "temp_max": day_fc.get("temp_max"),
            "rain_mm": day_fc.get("rain_mm"),
            "humidity_avg": day_fc.get("humidity_avg"),
            "notes": notes,
        })

    return results


def _evaluate_day(fc: dict, rules: dict, offset: int) -> tuple[OutlookStatus, str]:
    rain = fc.get("rain_mm", 0)
    humidity = fc.get("humidity_avg", 50)
    temp_max = fc.get("temp_max", 30)
    wind = fc.get("wind_avg", 5)

    # Not suitable conditions
    if rain > rules.get("heavy_rain_threshold", 20):
        return "not_suitable", f"Heavy rain ({rain}mm) — field operations not advised"
    if temp_max > rules.get("heat_stress_temp", 42):
        return "not_suitable", f"Heat stress ({temp_max}°C) — protect crops"
    if humidity > rules.get("disease_humidity", 85) and rain > 5:
        return "caution", f"High humidity + rain — disease pressure risk"
    if wind > rules.get("spray_wind_limit", 15):
        return "caution", f"High winds ({wind} km/h) — avoid spraying"

    # Spray OK window
    if (rain < 2 and humidity < 70 and wind < 10
            and rules.get("spray_temp_min", 20) <= temp_max <= rules.get("spray_temp_max", 35)):
        return "spray_ok", "Low wind, dry conditions — ideal spray window"

    # Optimal conditions
    if (rules.get("opt_temp_min", 20) <= temp_max <= rules.get("opt_temp_max", 35)
            and humidity < 75 and rain < 10):
        return "optimal", "Good growing conditions"

    return "caution", "Monitor conditions — marginal for field operations"


def generate_alerts(forecast_days: list[dict]) -> list[dict]:
    """Generate weather alerts from 5-day forecast."""
    alerts = []

    if not forecast_days:
        return alerts

    today = forecast_days[0] if forecast_days else {}
    tomorrow = forecast_days[1] if len(forecast_days) > 1 else {}

    # Heavy rain tomorrow
    if tomorrow.get("rain_mm", 0) > 20:
        alerts.append({
            "type": "heavy_rain",
            "severity": "critical",
            "title": "Heavy Rain Expected Tomorrow",
            "detail": f"{tomorrow['rain_mm']}mm expected. Delay harvesting and avoid pesticide application.",
            "icon": "🌧️",
            "date": tomorrow.get("date"),
        })

    # No rain / dry spell
    dry_days = sum(1 for d in forecast_days[:5] if d.get("rain_mm", 0) < 2)
    if dry_days >= 4:
        alerts.append({
            "type": "dry_spell",
            "severity": "advisory",
            "title": "Dry Spell — Irrigation Advised",
            "detail": f"Less than 2mm rain expected for {dry_days} of next 5 days. Irrigate crops if possible.",
            "icon": "☀️",
            "date": today.get("date"),
        })

    # Spray window today
    if (today.get("rain_mm", 0) < 2 and today.get("humidity_avg", 80) < 70
            and today.get("wind_avg", 10) < 10):
        alerts.append({
            "type": "spray_window",
            "severity": "info",
            "title": "Good Spray Window Today",
            "detail": "Low wind and dry conditions until evening. Optimal time for pesticide/foliar spray.",
            "icon": "✅",
            "date": today.get("date"),
        })

    # High humidity disease risk
    for day in forecast_days[:3]:
        if day.get("humidity_avg", 0) > 80 and day.get("rain_mm", 0) > 5:
            alerts.append({
                "type": "disease_risk",
                "severity": "advisory",
                "title": "Fungal Disease Risk",
                "detail": f"High humidity ({day['humidity_avg']}%) and rain on {day['date']} — monitor for blight and mould.",
                "icon": "⚠️",
                "date": day.get("date"),
            })
            break

    return alerts
