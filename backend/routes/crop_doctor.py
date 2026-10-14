from __future__ import annotations
"""Crop Doctor route — Gemini vision-based leaf disease diagnosis."""

import uuid
import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from services.gemini_service import analyse_crop_image
from services.database import get_connection, init_db

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _load_products():
    import os
    path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "products.json")
    with open(path) as f:
        return json.load(f)["products"]


def _match_products(treatments: list[dict], products: list[dict]) -> list[dict]:
    """Match diagnosis treatments to product catalogue by active ingredient."""
    matched = []
    for treatment in treatments:
        ai = treatment.get("active_ingredient", "").lower()
        for prod in products:
            prod_ai = prod.get("active_ingredient", "").lower()
            if ai and ai in prod_ai:
                matched.append(prod)
                break
    # Return up to 4 products
    return matched[:4]


@router.post("/crop-doctor")
async def crop_doctor(
    image: UploadFile = File(...),
    session_id: str = Form(default=""),
):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG or WebP images are accepted")

    contents = await image.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 5 MB)")

    try:
        diagnosis = await analyse_crop_image(contents, image.content_type)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service error: {str(e)}")

    products = _load_products()
    recommended = _match_products(diagnosis.get("treatments", []), products)

    # Save scan to history
    scan_id = f"ARV-{str(uuid.uuid4())[:8].upper()}"
    if session_id:
        try:
            init_db()
            conn = get_connection()
            conn.execute(
                "INSERT INTO scan_history (scan_id, session_id, crop, disease, confidence, severity, result_json) VALUES (?,?,?,?,?,?,?)",
                (
                    scan_id, session_id,
                    diagnosis.get("crop", ""),
                    diagnosis.get("disease", ""),
                    diagnosis.get("confidence", ""),
                    diagnosis.get("severity", ""),
                    json.dumps(diagnosis),
                )
            )
            conn.commit()
            conn.close()
        except Exception:
            pass  # Non-fatal — scan history is optional

    show_expert_block = (
        diagnosis.get("unclear", False)
        or diagnosis.get("confidence") == "low"
    )

    return {
        "scan_id": scan_id,
        "diagnosis": diagnosis,
        "recommended_products": recommended,
        "show_expert_block": show_expert_block,
        "disclaimer": "AI suggestion. Check the product label and ask a local expert before use.",
        "sample_data": True,
    }
