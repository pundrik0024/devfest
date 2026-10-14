from __future__ import annotations
"""Lake Watch route — watershed and lake status."""

import json
import os
from fastapi import APIRouter

router = APIRouter()


def _load_lake():
    path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "lake_status.json")
    with open(path) as f:
        return json.load(f)


@router.get("/lake-watch")
async def lake_watch():
    data = _load_lake()
    return {
        **data,
        "sample_data": True,
        "note": "Lake levels are sample data. Not real telemetry readings.",
    }
