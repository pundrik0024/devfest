from __future__ import annotations
"""
Gemini Flash service — wraps google-genai SDK.
Keys come from environment ONLY.
"""

import os
import json
import base64
import re
from google import genai
from google.genai import types


def _get_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set in environment")
    return genai.Client(api_key=api_key)


def _get_model() -> str:
    return os.environ.get("GEMINI_MODEL", "gemini-2.0-flash-exp")


def _extract_json(text: str) -> dict | list:
    """Strip markdown fences and parse JSON from Gemini response."""
    text = text.strip()
    # Remove ```json ... ``` fences
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


async def ask_agri_doctor(question: str, lang: str, context: dict) -> str:
    """
    Ask Gemini a farming question with structured weather + location context.
    Gemini must use ONLY the supplied data.
    """
    client = _get_client()
    model = _get_model()

    lang_instruction = "Respond in Hindi (Devanagari script)." if lang == "hi" else "Respond in English."
    system_prompt = (
        "You are an AI agricultural advisor for small and marginal farmers in Southern Rajasthan (Aravalli region). "
        "Answer using ONLY the structured data provided below. "
        "Do NOT invent forecasts, prices, or soil values. "
        "Keep answers to 3 sentences maximum. Use simple language suitable for farmers with low reading comfort. "
        f"{lang_instruction}"
    )

    user_message = (
        f"Farmer's question: {question}\n\n"
        f"Context data (use ONLY this):\n{json.dumps(context, ensure_ascii=False, indent=2)}"
    )

    response = client.models.generate_content(
        model=model,
        contents=[{"role": "user", "parts": [{"text": user_message}]}],
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=300,
            temperature=0.3,
        ),
    )
    return response.text.strip()


async def analyse_crop_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Send a leaf/crop image to Gemini and get structured diagnosis JSON.
    Returns validated dict or raises ValueError on parse failure.
    """
    client = _get_client()
    model = _get_model()

    schema = """
{
  "crop": "string",
  "disease": "string",
  "confidence": "high|medium|low",
  "symptoms": ["string"],
  "severity": "mild|moderate|severe",
  "action_protocol": [
    { "step": 1, "title": "string", "detail": "string", "timing": "string" }
  ],
  "treatments": [
    { "name": "string", "active_ingredient": "string", "dose": "string", "type": "chemical|bio|organic" }
  ],
  "prevention_tips": ["string"],
  "unclear": false
}"""

    system_prompt = (
        "You are a plant pathology AI. Analyse the crop leaf image provided. "
        "Return ONLY a valid JSON object matching this exact schema with no extra text:\n"
        + schema
        + "\n\nRules:\n"
        "- If image is blurry, not a plant, or you cannot reliably identify the disease, set unclear=true and confidence=low.\n"
        "- Do NOT invent scientific data. Only describe what you see.\n"
        "- action_protocol must have exactly 3 steps.\n"
        "- treatments must list active ingredient names, not brand names.\n"
        "- Keep detail fields under 60 words each."
    )

    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    text_part = types.Part.from_text(text="Analyse this crop leaf image and return the JSON diagnosis.")

    response = client.models.generate_content(
        model=model,
        contents=[types.Content(role="user", parts=[image_part, text_part])],
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=1000,
            temperature=0.2,
        ),
    )

    raw = response.text.strip()
    try:
        result = _extract_json(raw)
        # Basic validation
        required = ["crop", "disease", "confidence", "symptoms", "severity", "action_protocol", "treatments", "unclear"]
        for field in required:
            if field not in result:
                raise ValueError(f"Missing field: {field}")
        return result
    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\nRaw: {raw[:500]}")


async def write_remediation_plan(soil_data: dict) -> list:
    """
    Ask Gemini to write a 3-step soil remediation plan using ONLY the supplied soil data.
    Returns list of 3 step dicts.
    """
    client = _get_client()
    model = _get_model()

    schema = """[
  { "step": 1, "title": "string", "phase": "string", "action": "string", "timing": "string", "detail": "string" },
  { "step": 2, "title": "string", "phase": "string", "action": "string", "timing": "string", "detail": "string" },
  { "step": 3, "title": "string", "phase": "string", "action": "string", "timing": "string", "detail": "string" }
]"""

    system_prompt = (
        "You are a soil science advisor for Aravalli region farmers. "
        "Write a 3-step soil remediation plan using ONLY the soil metrics provided. "
        "Do NOT invent numbers, percentages, or claims beyond the data. "
        "Keep each step under 60 words. Use simple farmer-friendly language. "
        "Return ONLY a valid JSON array matching this schema:\n" + schema
    )

    user_message = f"Soil data:\n{json.dumps(soil_data, ensure_ascii=False, indent=2)}"

    response = client.models.generate_content(
        model=model,
        contents=[{"role": "user", "parts": [{"text": user_message}]}],
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=800,
            temperature=0.3,
        ),
    )

    raw = response.text.strip()
    try:
        result = _extract_json(raw)
        if not isinstance(result, list) or len(result) != 3:
            raise ValueError("Expected list of 3 steps")
        return result
    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\nRaw: {raw[:500]}")


async def write_sell_timing_advice(crop_data: dict, lang: str = "en") -> str:
    """
    Ask Gemini to write a 1-sentence sell-timing advice using ONLY the supplied mandi data.
    """
    client = _get_client()
    model = _get_model()

    lang_instruction = "Respond in Hindi (Devanagari script)." if lang == "hi" else "Respond in English."
    system_prompt = (
        "You are a mandi price advisor. Write exactly ONE sentence of sell-timing advice. "
        "Use ONLY the mandi prices and weather data provided. Do NOT invent prices or forecasts. "
        "Keep it under 20 words. " + lang_instruction
    )

    user_message = f"Mandi and crop data:\n{json.dumps(crop_data, ensure_ascii=False, indent=2)}"

    response = client.models.generate_content(
        model=model,
        contents=[{"role": "user", "parts": [{"text": user_message}]}],
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=100,
            temperature=0.3,
        ),
    )
    return response.text.strip()
