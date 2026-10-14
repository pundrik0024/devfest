from __future__ import annotations
"""Shop routes — products, cart, orders (SQLite)."""

import json
import os
import uuid
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from services.database import get_connection, init_db

router = APIRouter()


def _load_products():
    path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "products.json")
    with open(path) as f:
        return json.load(f)


# ── Products ──────────────────────────────────────────────────────────────────

@router.get("/products")
async def get_products(
    category: str = Query(default=""),
    crop: str = Query(default=""),
    search: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=9, ge=1, le=50),
    sort: str = Query(default="recommended"),
):
    data = _load_products()
    products = data["products"]

    if category:
        products = [p for p in products if p.get("category") == category]
    if crop:
        products = [p for p in products if crop.lower() in [c.lower() for c in p.get("target_crops", [])]]
    if search:
        s = search.lower()
        products = [p for p in products if s in p["name"].lower() or s in p.get("generic_name", "").lower()]

    # Sorting
    if sort == "price_asc":
        products.sort(key=lambda p: p.get("price", 0))
    elif sort == "price_desc":
        products.sort(key=lambda p: p.get("price", 0), reverse=True)
    elif sort == "saving":
        products.sort(key=lambda p: p.get("saving_pct", 0), reverse=True)

    total = len(products)
    start = (page - 1) * per_page
    paginated = products[start: start + per_page]

    return {
        "products": paginated,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
        "categories": data["categories"],
        "sample_data": True,
    }


# ── Cart ──────────────────────────────────────────────────────────────────────

class CartItem(BaseModel):
    session_id: str
    product_id: str
    qty: int = 1


@router.get("/cart")
async def get_cart(session_id: str = Query(...)):
    init_db()
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM cart_items WHERE session_id = ?", (session_id,)
    ).fetchall()
    conn.close()

    data = _load_products()
    products_map = {p["id"]: p for p in data["products"]}

    items = []
    for row in rows:
        prod = products_map.get(row["product_id"])
        if prod:
            items.append({
                "cart_item_id": row["id"],
                "product_id": row["product_id"],
                "qty": row["qty"],
                "product": prod,
                "line_total": prod["price"] * row["qty"],
            })

    total = sum(i["line_total"] for i in items)
    return {"items": items, "total": total, "sample_data": True}


@router.post("/cart")
async def add_to_cart(item: CartItem):
    init_db()
    conn = get_connection()
    existing = conn.execute(
        "SELECT id, qty FROM cart_items WHERE session_id=? AND product_id=?",
        (item.session_id, item.product_id)
    ).fetchone()

    if existing:
        conn.execute(
            "UPDATE cart_items SET qty=? WHERE id=?",
            (existing["qty"] + item.qty, existing["id"])
        )
    else:
        conn.execute(
            "INSERT INTO cart_items (session_id, product_id, qty) VALUES (?,?,?)",
            (item.session_id, item.product_id, item.qty)
        )
    conn.commit()
    conn.close()
    return {"success": True, "message": "Item added to cart"}


@router.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: int, session_id: str = Query(...)):
    init_db()
    conn = get_connection()
    conn.execute(
        "DELETE FROM cart_items WHERE id=? AND session_id=?",
        (cart_item_id, session_id)
    )
    conn.commit()
    conn.close()
    return {"success": True}


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderRequest(BaseModel):
    session_id: str
    delivery_name: str
    delivery_phone: str
    delivery_address: str
    payment_method: str = "COD"


@router.post("/orders")
async def place_order(req: OrderRequest):
    init_db()
    conn = get_connection()

    # Get cart items
    rows = conn.execute(
        "SELECT * FROM cart_items WHERE session_id=?", (req.session_id,)
    ).fetchall()

    if not rows:
        conn.close()
        raise HTTPException(status_code=400, detail="Cart is empty")

    data = _load_products()
    products_map = {p["id"]: p for p in data["products"]}

    items = []
    total = 0
    for row in rows:
        prod = products_map.get(row["product_id"])
        if prod:
            line = row["qty"] * prod["price"]
            total += line
            items.append({"product_id": row["product_id"], "qty": row["qty"], "price": prod["price"], "line_total": line})

    order_id = f"AGT-{str(uuid.uuid4())[:8].upper()}"
    conn.execute(
        """INSERT INTO orders (order_id, session_id, items_json, total_amount, delivery_name, delivery_phone,
           delivery_address, payment_method) VALUES (?,?,?,?,?,?,?,?)""",
        (order_id, req.session_id, json.dumps(items), total,
         req.delivery_name, req.delivery_phone, req.delivery_address, req.payment_method)
    )
    # Clear cart
    conn.execute("DELETE FROM cart_items WHERE session_id=?", (req.session_id,))
    conn.commit()
    conn.close()

    return {
        "order_id": order_id,
        "status": "confirmed",
        "items": items,
        "total": total,
        "payment_method": req.payment_method,
        "estimated_delivery": "3–5 business days",
        "sample_data": True,
    }


@router.get("/orders/{order_id}")
async def get_order(order_id: str):
    init_db()
    conn = get_connection()
    row = conn.execute("SELECT * FROM orders WHERE order_id=?", (order_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "order_id": row["order_id"],
        "status": row["status"],
        "items": json.loads(row["items_json"]),
        "total": row["total_amount"],
        "delivery_name": row["delivery_name"],
        "delivery_address": row["delivery_address"],
        "payment_method": row["payment_method"],
        "created_at": row["created_at"],
    }
