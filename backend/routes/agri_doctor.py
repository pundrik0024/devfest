from __future__ import annotations
"""AI Agri-Doctor route — voice/text Q&A with weather context."""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.weather_service import get_forecast, get_current_weather
from services.gemini_service import ask_agri_doctor

router = APIRouter()

DEFAULT_LAT = float(os.environ.get("DEFAULT_LAT", "24.5854"))
DEFAULT_LON = float(os.environ.get("DEFAULT_LON", "73.7125"))


class AgriDoctorRequest(BaseModel):
    question: str
    location: str = "Udaipur, Rajasthan"
    lang: str = "en"  # "en" or "hi"
    lat: float = DEFAULT_LAT
    lon: float = DEFAULT_LON


@router.post("/agri-doctor")
async def agri_doctor(req: AgriDoctorRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    if req.lang not in ("en", "hi"):
        raise HTTPException(status_code=400, detail="lang must be 'en' or 'hi'")

    try:
        forecast = await get_forecast(req.lat, req.lon)
        current = await get_current_weather(req.lat, req.lon)
    except Exception as e:
        # Weather fetch failed — answer without context
        forecast = []
        current = {}

    context = {
        "location": req.location,
        "current_weather": current,
        "5_day_forecast": forecast,
    }

    try:
        answer = await ask_agri_doctor(req.question, req.lang, context)
    except Exception as e:
        err_msg = str(e)
        if "API_KEY_INVALID" in err_msg or "API key not valid" in err_msg or "GEMINI_API_KEY" in err_msg:
            answer = (
                "⚠️ AI Agri-Doctor is not configured on the server. Add a valid GEMINI_API_KEY in the backend deployment's environment settings, then restart or redeploy it. "
                "In the meantime, contact your local Krishi Vigyan Kendra for expert advice."
                if req.lang == "en" else
                "⚠️ AI कृषि-डॉक्टर सर्वर पर सेट नहीं है। बैकएंड की deployment environment settings में सही GEMINI_API_KEY जोड़ें और सर्वर restart या redeploy करें। "
                "इस बीच, विशेषज्ञ सलाह के लिए अपने स्थानीय कृषि विज्ञान केंद्र से संपर्क करें।"
            )
        else:
            raise HTTPException(status_code=503, detail=f"AI service error: {err_msg}")

    return {
        "answer": answer,
        "weather_context": {
            "current": current,
            "forecast_days": len(forecast),
        },
        "disclaimer": "AI suggestion. Check with a local agriculture expert before taking action.",
        "sample_data": False,
    }
