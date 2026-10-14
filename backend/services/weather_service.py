from __future__ import annotations
"""
Weather service — OpenWeatherMap API client.
Keys come from environment ONLY.
"""

import os
import time
import httpx
from typing import Optional

_CACHE: dict = {}
_CACHE_TTL = 1800  # 30 minutes


def _get_api_key() -> str:
    key = os.environ.get("OPENWEATHERMAP_API_KEY")
    if not key or key == "placeholder":
        raise RuntimeError("OPENWEATHERMAP_API_KEY not set in environment")
    return key


async def get_current_weather(lat: float, lon: float) -> dict:
    """Get current weather for a lat/lon location."""
    cache_key = f"current:{lat}:{lon}"
    cached = _CACHE.get(cache_key)
    if cached and time.time() - cached["ts"] < _CACHE_TTL:
        return cached["data"]

    api_key = _get_api_key()
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric", "lang": "en"}

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        raw = resp.json()

    result = _parse_current(raw)
    _CACHE[cache_key] = {"data": result, "ts": time.time()}
    return result


async def get_forecast(lat: float, lon: float) -> list[dict]:
    """Get 5-day / 3-hour forecast, normalised to daily summaries (up to 5 days)."""
    cache_key = f"forecast:{lat}:{lon}"
    cached = _CACHE.get(cache_key)
    if cached and time.time() - cached["ts"] < _CACHE_TTL:
        return cached["data"]

    api_key = _get_api_key()
    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric", "lang": "en"}

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        raw = resp.json()

    result = _parse_forecast(raw)
    _CACHE[cache_key] = {"data": result, "ts": time.time()}
    return result


def _parse_current(raw: dict) -> dict:
    return {
        "temp": raw["main"]["temp"],
        "feels_like": raw["main"]["feels_like"],
        "humidity": raw["main"]["humidity"],
        "wind_speed": raw["wind"]["speed"],
        "weather": raw["weather"][0]["description"],
        "icon": raw["weather"][0]["icon"],
        "rain_1h": raw.get("rain", {}).get("1h", 0),
        "city": raw.get("name", ""),
        "dt": raw["dt"],
    }


def _parse_forecast(raw: dict) -> list[dict]:
    """Aggregate 3-hour slots into daily summaries."""
    from collections import defaultdict
    from datetime import datetime

    days: dict = defaultdict(list)
    for item in raw.get("list", []):
        dt = datetime.utcfromtimestamp(item["dt"])
        day_key = dt.strftime("%Y-%m-%d")
        days[day_key].append(item)

    result = []
    for date_str in sorted(days.keys())[:5]:
        slots = days[date_str]
        temps = [s["main"]["temp"] for s in slots]
        humidities = [s["main"]["humidity"] for s in slots]
        rain_total = sum(s.get("rain", {}).get("3h", 0) for s in slots)
        winds = [s["wind"]["speed"] for s in slots]
        icons = [s["weather"][0]["icon"] for s in slots]
        result.append({
            "date": date_str,
            "temp_min": round(min(temps), 1),
            "temp_max": round(max(temps), 1),
            "temp_avg": round(sum(temps) / len(temps), 1),
            "humidity_avg": round(sum(humidities) / len(humidities)),
            "rain_mm": round(rain_total, 1),
            "wind_avg": round(sum(winds) / len(winds), 1),
            "icon": icons[len(icons) // 2],  # mid-day icon
            "description": slots[len(slots) // 2]["weather"][0]["description"],
        })
    return result
