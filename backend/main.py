from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Body, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import uuid
import re
import copy
from datetime import datetime, date, timedelta
import os
import io
import json
import base64
from groq import Groq

# ── Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# --- Image Processing Libraries ---
try:
    from PIL import Image, ImageOps
    from rembg import remove, new_session
    import numpy as np
    HAS_IMAGE_TOOLS = True
except ImportError:
    HAS_IMAGE_TOOLS = False
    print("Warning: 'rembg' or 'pillow' not installed. AI Tools won't work.")

app = FastAPI()

# ── Rate Limiter setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS — load allowed origins from env
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# DATABASE (PER-USER JSON STORAGE)
# ==========================================
DATA_DIR = "backend/data"
os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_DB = {
    "profile": {"isSetupComplete": False, "businessType": "STOCK", "businessName": "", "ownerName": "", "settings": {}, "orderCounter": 1000},
    "products": [],
    "batches": [],
    "orders": [],
    "services": [],
    "stores": {},
    "documents": [],
    "shipments": []
}

DEFAULT_WA_DB = {
    "orders": [],
    "templates": [],
    "order_counter": 1,
    "seller_profiles": {
        "clothing": {
            "name": "Clothing Seller",
            "risk_weights": {"no_city": 25, "short_address": 30, "fake_phone": 60, "cancelled_history": 40},
            "default_templates": {
                "confirm":  "*Order Confirm* ✅\n\nAssalam o Alaikum {customer_name}!\nAap ka order confirm ho gaya hai.\n\n📦 Products: {product_list}\n📍 Delivery Address: {city}\n📞 Contact: {phone}\n🆔 Order ID: {order_id}\n\nHum 2-3 din mein deliver kar dein gay. JazakAllah! 🙏",
                "recheck":  "*Address Recheck Required* 🔍\n\nDear {customer_name},\nAap ka address incomplete lagta hai.\n\nOrder ID: {order_id}",
                "reminder": "*COD Reminder* 💰\n\nDear {customer_name},\nAap ka parcel rasta mein hai!\n\nOrder ID: {order_id}\nShipping to: {city}",
                "dispatch": "*Parcel Dispatch Ho Gaya* 🚚\n\nDear {customer_name},\nAap ka order dispatch ho gaya hai.\n\n🆔 Order ID: {order_id}\n📍 Delivery: {city}",
                "warning":  "*Final Warning - Order Cancel* ⚠️\n\nDear {customer_name},\nHum ne {phone} par kai baar contact kiya lekin jawab nahi mila.\n\nOrder ID {order_id} cancel ho sakta hai."
            }
        },
        "electronics": {
            "name": "Electronics Seller",
            "risk_weights": {"no_city": 30, "short_address": 35, "fake_phone": 70, "cancelled_history": 50},
            "default_templates": {
                "confirm":  "*Order Confirmation* ✅\n\nDear {customer_name},\nYour electronics order has been confirmed!\n\n📦 Item(s): {product_list}\n📍 Delivery City: {city}\n📞 Phone: {phone}\n🆔 Order ID: {order_id}",
                "recheck":  "*Address Verification Needed* 🔍\n\nDear {customer_name},\nPlease provide your complete address for Order ID: {order_id}",
                "reminder": "*Payment Reminder* 💰\n\nDear {customer_name},\nYour parcel is on its way! Keep Cash ready.\n\nOrder: {order_id} | City: {city}",
                "dispatch": "*Order Dispatched* 🚚\n\nDear {customer_name},\nYour order {order_id} has been dispatched!\n\n📍 Delivering to: {city}",
                "warning":  "*FINAL NOTICE* ⚠️\n\nDear {customer_name}, multiple delivery attempts failed for Order {order_id}.\nContact {phone} within 24hrs or order will be CANCELLED."
            }
        }
    }
}

USER_DB_CACHE    = {}
USER_WA_DB_CACHE = {}


def get_user_id(x_user_id: str = Header(None)):
    if not x_user_id or x_user_id == "anonymous":
        raise HTTPException(status_code=401, detail="Unauthorized: User ID missing or invalid")
    # ── Sanitize to prevent path traversal
    safe_id = re.sub(r'[^a-zA-Z0-9@._-]', '', str(x_user_id))
    if len(safe_id) < 3:
        raise HTTPException(status_code=401, detail="Invalid user ID")
    return safe_id


def get_db(user_id: str):
    if user_id in USER_DB_CACHE:
        return USER_DB_CACHE[user_id]
    user_file = os.path.join(DATA_DIR, f"{user_id}_main.json")
    # ── Defense-in-depth path check
    if not os.path.abspath(user_file).startswith(os.path.abspath(DATA_DIR)):
        raise HTTPException(status_code=403, detail="Access denied")
    # ── Deep copy prevents cross-user data contamination
    db = copy.deepcopy(DEFAULT_DB)
    if os.path.exists(user_file):
        try:
            with open(user_file, "r") as f:
                db = json.load(f)
        except:
            pass
    USER_DB_CACHE[user_id] = db
    return db


def get_wa_db(user_id: str):
    if user_id in USER_WA_DB_CACHE:
        return USER_WA_DB_CACHE[user_id]
    user_file = os.path.join(DATA_DIR, f"{user_id}_wa.json")
    if not os.path.abspath(user_file).startswith(os.path.abspath(DATA_DIR)):
        raise HTTPException(status_code=403, detail="Access denied")
    db = copy.deepcopy(DEFAULT_WA_DB)
    if os.path.exists(user_file):
        try:
            with open(user_file, "r") as f:
                db = json.load(f)
        except:
            pass
    USER_WA_DB_CACHE[user_id] = db
    return db


def save_db(user_id: str):
    if user_id not in USER_DB_CACHE:
        return
    user_file = os.path.join(DATA_DIR, f"{user_id}_main.json")
    try:
        with open(user_file, "w") as f:
            json.dump(USER_DB_CACHE[user_id], f, indent=4)
    except Exception as e:
        print(f"Error saving DB for {user_id}:", e)


def save_wa_db(user_id: str):
    if user_id not in USER_WA_DB_CACHE:
        return
    user_file = os.path.join(DATA_DIR, f"{user_id}_wa.json")
    try:
        with open(user_file, "w") as f:
            json.dump(USER_WA_DB_CACHE[user_id], f, indent=4)
    except Exception as e:
        print(f"Error saving WA DB for {user_id}:", e)


# ==========================================
# DATA MODELS
# ==========================================

class CourierRate(BaseModel):
    name: str
    sameCity: float
    sameProv: float
    crossProv: float
    kg: float
    codFeePercent: float = 0.0

class BusinessSetup(BaseModel):
    businessType: str = "STOCK"
    businessName: str
    ownerName: str
    city: str
    province: str = "Punjab"
    businessTypes: List[str] = []
    monthlyRent: float = 0
    monthlySalary: float = 0
    monthlyHosting: float = 0
    monthlyInternet: float = 0
    packagingCost: float = 0
    courierRates: List[CourierRate] = []
    logo: Optional[str] = None
    phone: str = ""
    address: str = ""

class ProductInput(BaseModel):
    name: str
    sku: str
    category: str = "General"
    sellingPrice: float = 0

class BatchInput(BaseModel):
    productId: str
    batchName: str
    supplier: str = "N/A"
    quantity: int
    date: str
    baseCost: float = 0
    transportCost: float = 0
    packagingCost: float = 0
    otherCost: float = 0
    totalCost: float

class ServiceInput(BaseModel):
    name: str
    productionCost: float
    sellingPrice: float
    estimatedTime: str = "3-5 Days"
    description: str = ""

class OrderItemInput(BaseModel):
    productId: str
    quantity: int
    salePrice: float

class OrderInput(BaseModel):
    customerName: str
    city: str
    province: str = "Punjab"
    courier: str
    items: List[OrderItemInput]
    weight: float = 0.5
    status: str = "PENDING"
    paymentType: str = "COD"
    isFreeShipping: bool = False
    shippingCost: float = 0.0
    packagingCost: float = 0.0
    totalAmount: float = 0.0
    returnShippingCost: float = 0.0
    discount: float = 0.0
    date: str

class OrderStatusUpdate(BaseModel):
    status: str
    returnFee: Optional[float] = 0.0

class DocumentInput(BaseModel):
    type: str
    ref: str
    format: str
    fileData: str

class ShipmentCreate(BaseModel):
    courier: str
    trackingNumber: Optional[str] = None
    shipmentId: Optional[str] = None
    shipmentStatus: Optional[str] = "CREATED"
    orderRef: str
    orderDate: Optional[str] = None
    weight: str
    pieces: str
    dimensions: Optional[str] = None
    contents: Optional[str] = None
    declaredValue: Optional[str] = None
    hsCode: Optional[str] = None
    paymentType: str
    codAmount: float
    senderName: str
    senderAddress: str
    senderPhone: Optional[str] = None
    receiverName: str
    receiverPhone: str
    receiverAddress: str
    receiverCity: str
    receiverProvince: Optional[str] = None
    instructions: Dict[str, bool]
    sellerLogo: Optional[str] = None
    createdAt: Optional[str] = None

class ShippingCalcRequest(BaseModel):
    courier: str
    city: str
    province: str
    weight: float

class SeoRequest(BaseModel):
    product_name: str
    features: str
    brand_name: str = "MyBrand"

class StoreInput(BaseModel):
    username: str
    display_name: str = "My Store"
    bio: str = ""
    whatsapp: str = ""
    theme: str = "classic"
    trust_badges: Dict[str, bool] = {}
    socials: Dict[str, str] = {}
    links: List[Dict[str, Any]] = []
    products: List[Dict[str, Any]] = []
    is_pro: bool = False
    pixels: Dict[str, str] = {}
    custom_wa_message: str = ""
    store_logo: str = ""

class WAVerifyRequest(BaseModel):
    rawText: str
    isPro: bool = False
    sellerProfile: str = "general"
    productList: str = ""

class WATemplateInput(BaseModel):
    name: str
    type: str
    content: str

class WAOrderStatusUpdate(BaseModel):
    status: str

# ==========================================
# WHATSAPP HELPERS
# ==========================================

def wa_detect_risk(phone: str, clean_address: str, city: str, name: str, profile_key: str, wa_orders_db: list) -> dict:
    # ── FIXED: use DEFAULT_WA_DB (not deleted WA_DB), fallback to 'clothing'
    profile = DEFAULT_WA_DB["seller_profiles"].get(profile_key,
              DEFAULT_WA_DB["seller_profiles"]["clothing"])
    weights = profile["risk_weights"]
    reasons = []
    score   = 0

    if not phone:
        reasons.append("Phone number missing")
        score += 50
    else:
        if re.search(r'(.)\1{5,}', phone):
            reasons.append("Suspicious phone: repeated digits detected")
            score += weights["fake_phone"]
        valid_prefixes = ['030','031','032','033','034','035','036','037','038','039']
        if phone and phone[:3] not in valid_prefixes:
            reasons.append("Invalid network prefix (not a Pakistani mobile)")
            score += 40

    if len(clean_address) < 5:
        reasons.append("Address incomplete or missing")
        score += weights["short_address"]
    elif not re.search(r'\d', clean_address) and len(clean_address) < 15:
        reasons.append("Address looks too short (house number missing)")
        score += 15

    if city == "Unknown City":
        reasons.append("City not detected")
        score += weights["no_city"]

    if name == "Customer" or len(name) < 3:
        reasons.append("Customer name missing or unclear")
        score += 15
    elif re.search(r'^(test|abc|xyz|asd|admin|user|demo)$', name, re.IGNORECASE):
        reasons.append("Suspicious name pattern (test/fake name)")
        score += 25

    if phone:
        past = [o for o in wa_orders_db if o.get("phone") == phone]
        if past:
            cancelled = [o for o in past if o.get("status") == "cancelled"]
            confirmed = [o for o in past if o.get("status") == "confirmed"]
            if cancelled:
                reasons.append(f"DUPLICATE: {len(cancelled)} previously cancelled order(s) from this number")
                score += weights["cancelled_history"] * len(cancelled)
            elif confirmed:
                reasons.append(f"Returning customer: {len(confirmed)} confirmed order(s) - Good history ✅")
                score = max(0, score - 10)
            else:
                reasons.append(f"Number previously seen: {len(past)} order(s), status pending")
                score += 10

    score = min(score, 100)
    level = "High" if score >= 60 else "Medium" if score >= 30 else "Low"
    return {"score": score, "level": level, "reasons": reasons}


def fill_template(template: str, customer: dict, order_id: str, product_list: str) -> str:
    return (
        template
        .replace("{customer_name}", customer.get("name", "Customer"))
        .replace("{city}", customer.get("city", "your city"))
        .replace("{phone}", customer.get("phone", "N/A"))
        .replace("{order_id}", order_id)
        .replace("{product_list}", product_list or "your order")
    )


# ── File size validator helper
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

async def validate_upload(file: UploadFile, max_bytes: int = MAX_IMAGE_SIZE):
    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {max_bytes // 1_000_000}MB.")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted.")
    return content


# ==========================================
# WHATSAPP ENDPOINTS
# ==========================================

@app.post("/api/wa/verify")
@limiter.limit("10/minute")
def wa_verify(request: Request, data: WAVerifyRequest, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db   = get_wa_db(user_id)

    raw = data.rawText.strip()
    if not raw:
        raise HTTPException(status_code=400, detail="Input is empty")

    clean         = re.sub(r'[\u0080-\uffff]', '', raw).strip()
    phone_matches = re.findall(r'(?:\+92|0092|92|0)?(?:3[0-9]{9})', clean.replace(" ","").replace("-",""))

    original_phone_str = ""
    valid_phone        = ""
    phone_status       = "Missing"

    if phone_matches:
        raw_p = re.sub(r'[^\d]', '', phone_matches[0])
        if raw_p.startswith('92') and len(raw_p) == 12:
            raw_p = '0' + raw_p[2:]
        elif raw_p.startswith('0092'):
            raw_p = '0' + raw_p[4:]
        if len(raw_p) == 11 and raw_p.startswith('0'):
            valid_phone        = raw_p
            original_phone_str = phone_matches[0]
        valid_prefixes = ['030','031','032','033','034','035','036','037','038','039']
        if re.search(r'(.)\1{5,}', valid_phone):
            phone_status = "Fake (Repeated Digits)"
        elif valid_phone and valid_phone[:3] not in valid_prefixes:
            phone_status = "Invalid Network"
        else:
            phone_status = "Valid Format"

    name        = "Customer"
    label_match = re.search(r'(?:Name|Naam|Receiver)\s*[:\-\.]+\s*([a-zA-Z][a-zA-Z\s]{1,30})', clean, re.IGNORECASE)
    if label_match:
        name = label_match.group(1).strip()
    else:
        first_part = re.split(r',|03|\+92|\n', clean)[0].strip()
        is_addr    = bool(re.search(r'House|Street|Gali|Mohallah|Town|Colony|Flat|Shop', first_part, re.IGNORECASE))
        if first_part and not is_addr and len(first_part) <= 25 and not re.search(r'\d', first_part):
            name = first_part

    cities = ["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta",
              "Sialkot","Gujranwala","Hyderabad","Bahawalpur","Sargodha","Sheikhupura","Rahim Yar Khan",
              "Gujrat","Sahiwal","Okara","Wah Cantt","Mardan","Mingora","Kasur","Dera Ghazi Khan",
              "Nawabshah","Jhang","Chiniot","Kamalia","Hafizabad","Sadiqabad","Burewala"]
    detected_city = next((c for c in cities if re.search(c, clean, re.IGNORECASE)), "Unknown City")

    addr_text = clean
    if original_phone_str:
        addr_text = addr_text.replace(original_phone_str, '')
    addr_text     = re.sub(rf'\b{re.escape(name)}\b', '', addr_text, flags=re.IGNORECASE)
    addr_text     = re.sub(r'(?:Name|Naam|Address|Pata|Phone|Mobile|Order)[:\-\s]+', ' ', addr_text, flags=re.IGNORECASE)
    addr_text     = re.sub(r'\s+', ' ', addr_text).strip()
    clean_address = re.sub(re.escape(detected_city), '', addr_text, flags=re.IGNORECASE).strip(' ,')

    wa_number = f"92{valid_phone[1:]}" if valid_phone else ""
    wa_base   = f"https://wa.me/{wa_number}" if wa_number else "#"

    past_orders    = [o for o in wa_db["orders"] if o.get("phone") == valid_phone] if valid_phone else []
    cancelled_count = sum(1 for o in past_orders if o.get("status") == "cancelled")
    confirmed_count = sum(1 for o in past_orders if o.get("status") == "confirmed")

    risk     = wa_detect_risk(valid_phone, clean_address, detected_city, name, data.sellerProfile, wa_db["orders"])
    order_id = f"ORD-2026-{wa_db['order_counter']:04d}"
    wa_db["order_counter"] += 1

    profile   = wa_db["seller_profiles"].get(data.sellerProfile, wa_db["seller_profiles"].get("clothing", {}))
    templates = profile.get("default_templates", {})
    customer  = {"name": name, "phone": valid_phone, "city": detected_city, "address": clean_address}

    def make_wa_link(tpl_key):
        user_tpl = next((t for t in wa_db["templates"] if t.get("type") == tpl_key), None)
        tpl = user_tpl["content"] if user_tpl else templates.get(tpl_key, "")
        msg = fill_template(tpl, customer, order_id, data.productList)
        if wa_number:
            from urllib.parse import quote
            return f"https://wa.me/{wa_number}?text={quote(msg)}"
        return "#"

    messages = {k: fill_template(templates.get(k, ""), customer, order_id, data.productList)
                for k in ["confirm", "recheck", "reminder", "dispatch", "warning"]}
    links    = {k: make_wa_link(k) for k in ["confirm", "recheck", "reminder", "dispatch", "warning"]}
    links["waBase"] = wa_base

    new_order = {
        "id": str(uuid.uuid4())[:8], "orderId": order_id, "name": name,
        "phone": valid_phone, "city": detected_city, "address": clean_address,
        "riskLevel": risk["level"], "riskScore": risk["score"],
        "status": "pending", "sellerProfile": data.sellerProfile,
        "createdAt": datetime.now().isoformat(),
    }
    wa_db["orders"].append(new_order)
    save_wa_db(user_id)

    return {
        "success": True,
        "data": {
            "customer": customer, "orderId": order_id, "internalId": new_order["id"],
            "verification": {"phoneStatus": phone_status, "riskLevel": risk["level"],
                             "riskScore": risk["score"], "riskReasons": risk["reasons"]},
            "duplicateInfo": {"totalPrevious": len(past_orders),
                              "confirmed": confirmed_count, "cancelled": cancelled_count},
            "messages": messages, "links": links,
        }
    }


@app.get("/api/wa/dashboard")
def wa_dashboard(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db   = get_wa_db(user_id)
    orders  = wa_db["orders"]
    total     = len(orders)
    high_risk = sum(1 for o in orders if o.get("riskLevel") == "High")
    confirmed = sum(1 for o in orders if o.get("status") == "confirmed")
    cancelled = sum(1 for o in orders if o.get("status") == "cancelled")
    recent    = sorted(orders, key=lambda x: x.get("createdAt", ""), reverse=True)[:20]
    return {
        "success": True,
        "stats": {"total": total, "highRisk": high_risk, "confirmed": confirmed,
                  "cancelled": cancelled, "pending": total - confirmed - cancelled},
        "recentOrders": recent
    }


@app.patch("/api/wa/orders/{order_id}/status")
def wa_update_order_status(order_id: str, data: WAOrderStatusUpdate, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db   = get_wa_db(user_id)
    order   = next((o for o in wa_db["orders"] if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="WA Order not found")
    order["status"] = data.status
    save_wa_db(user_id)
    return {"success": True}


@app.get("/api/wa/templates")
def wa_get_templates(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db   = get_wa_db(user_id)
    return {"success": True, "templates": wa_db["templates"]}


@app.post("/api/wa/templates")
def wa_save_template(data: WATemplateInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db   = get_wa_db(user_id)
    wa_db["templates"] = [t for t in wa_db["templates"] if t.get("type") != data.type]
    wa_db["templates"].append({"id": str(uuid.uuid4())[:8], "name": data.name, "type": data.type, "content": data.content})
    save_wa_db(user_id)
    return {"success": True}


@app.delete("/api/wa/templates/{tpl_id}")
def wa_delete_template(tpl_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db   = get_wa_db(user_id)
    wa_db["templates"] = [t for t in wa_db["templates"] if t["id"] != tpl_id]
    save_wa_db(user_id)
    return {"success": True}


# ==========================================
# BUSINESS ENDPOINTS
# ==========================================

@app.get("/")
def home():
    return {"message": "ZipSellix Backend is Running 🚀"}


@app.get("/api/business/status")
def get_status(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    return {"isSetupComplete": db["profile"]["isSetupComplete"], "profile": db["profile"]}


@app.get("/api/profile")
def get_profile(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    return db["profile"]


@app.post("/api/shipping/calculate")
def calculate_shipping(data: ShippingCalcRequest, x_user_id: str = Header(None)):
    user_id    = get_user_id(x_user_id)
    db         = get_db(user_id)
    settings   = db["profile"]["settings"]
    saved_rates = settings.get("courierRates", [])
    my_city    = db["profile"].get("city", "").lower().strip()
    my_prov    = db["profile"].get("province", "").lower().strip()
    rate_info  = next((r for r in saved_rates if r["name"].lower() == data.courier.lower()), None)
    if not rate_info:
        rate_info = {"sameCity": 0, "sameProv": 0, "crossProv": 0, "kg": 0}
    cust_city = data.city.lower().strip()
    cust_prov = data.province.lower().strip()
    if cust_city == my_city and cust_city != "":
        base_rate = float(rate_info["sameCity"])
    elif cust_prov == my_prov and cust_prov != "":
        base_rate = float(rate_info["sameProv"])
    else:
        base_rate = float(rate_info["crossProv"])
    per_kg_rate           = float(rate_info["kg"])
    actual_shipping_cost  = base_rate + (max(0, data.weight - 0.5) * per_kg_rate)
    return {"shippingCost": actual_shipping_cost, "packagingCost": settings.get("packagingCost", 0)}


@app.post("/api/business/setup")
def save_setup(data: BusinessSetup, x_user_id: str = Header(None)):
    user_id    = get_user_id(x_user_id)
    db         = get_db(user_id)
    total_fixed = data.monthlyRent + data.monthlySalary + data.monthlyHosting + data.monthlyInternet
    rates_list  = [r.dict() for r in data.courierRates]
    db["profile"].update({
        "isSetupComplete": True, "businessType": data.businessType,
        "businessName": data.businessName, "ownerName": data.ownerName,
        "city": data.city, "province": data.province,
        "settings": {
            "monthlyRent": data.monthlyRent, "monthlySalary": data.monthlySalary,
            "monthlyHosting": data.monthlyHosting, "monthlyInternet": data.monthlyInternet,
            "monthlyFixedCost": total_fixed, "packagingCost": data.packagingCost,
            "courierRates": rates_list, "couriers": [r.name for r in data.courierRates],
            "channels": data.businessTypes, "logo": data.logo,
            "phone": data.phone, "address": data.address
        }
    })
    save_db(user_id)
    return {"success": True}


@app.delete("/api/business/reset")
def reset_business(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    db["profile"]   = {"isSetupComplete": False, "businessType": "STOCK", "businessName": "", "ownerName": "", "settings": {}, "orderCounter": 1000}
    db["products"]  = []
    db["batches"]   = []
    db["orders"]    = []
    db["services"]  = []
    db["documents"] = []
    db["shipments"] = []
    save_db(user_id)
    return {"success": True}


# ── Documents
@app.get("/api/documents")
def get_documents(x_user_id: str = Header(None)):
    user_id       = get_user_id(x_user_id)
    db            = get_db(user_id)
    docs_metadata = [{"id": d["id"], "type": d["type"], "ref": d["ref"], "date": d["date"], "format": d["format"]} for d in db["documents"]]
    return {"success": True, "documents": docs_metadata}


@app.get("/api/documents/{doc_id}")
def get_document_data(doc_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    doc     = next((d for d in db["documents"] if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True, "document": doc}


@app.post("/api/documents/add")
def add_document(data: DocumentInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    new_doc = {"id": str(uuid.uuid4())[:8], "type": data.type, "ref": data.ref or "Draft",
               "date": datetime.now().isoformat(), "format": data.format, "fileData": data.fileData}
    db["documents"].append(new_doc)
    save_db(user_id)
    return {"success": True, "id": new_doc["id"]}


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str, x_user_id: str = Header(None)):
    user_id        = get_user_id(x_user_id)
    db             = get_db(user_id)
    db["documents"] = [d for d in db["documents"] if d["id"] != doc_id]
    save_db(user_id)
    return {"success": True}


# ── Shipments
@app.post("/api/shipments/create")
def create_shipment(data: ShipmentCreate, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    try:
        shipment_record = data.dict()
        shipment_record["id"] = str(uuid.uuid4())[:8]
        if not shipment_record.get("createdAt"):
            shipment_record["createdAt"] = datetime.now().isoformat()
        db["shipments"].append(shipment_record)
        save_db(user_id)
        return {"success": True, "message": "Shipment created successfully",
                "trackingNumber": data.trackingNumber, "status": data.shipmentStatus,
                "shipmentId": shipment_record["id"]}
    except Exception as e:
        print("Shipment Creation Error:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ── Store Builder
@app.post("/api/store/save")
def save_store(data: StoreInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    slug    = data.username.lower().strip()
    if not slug:
        raise HTTPException(status_code=400, detail="Username is required")
    db["stores"][slug] = data.model_dump()
    save_db(user_id)
    return {"success": True, "url": f"/{slug}"}


@app.get("/api/store/{username}")
def get_store(username: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    store   = db["stores"].get(username.lower())
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


@app.get("/api/store/check/{username}")
def check_store(username: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    exists  = username.lower() in db["stores"]
    return {"exists": exists, "username": username}


# ── Inventory
@app.get("/api/inventory/products")
def get_products(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    for prod in db["products"]:
        prod['currentStock'] = sum(b['remainingQty'] for b in db["batches"] if b['productId'] == prod['id'])
    return [p for p in db["products"] if not p.get("deleted", False)]


@app.post("/api/inventory/products/create")
def create_product(data: ProductInput, x_user_id: str = Header(None)):
    user_id  = get_user_id(x_user_id)
    db       = get_db(user_id)
    existing = next((p for p in db["products"] if p["name"].lower() == data.name.lower() and not p.get("deleted", False)), None)
    if existing:
        existing["sellingPrice"] = data.sellingPrice
        save_db(user_id)
        return existing
    new_prod = {"id": str(uuid.uuid4())[:8], "name": data.name, "sku": data.sku,
                "category": data.category, "sellingPrice": data.sellingPrice, "currentStock": 0}
    db["products"].append(new_prod)
    save_db(user_id)
    return new_prod


@app.delete("/api/inventory/products/{product_id}")
def delete_product(product_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    product = next((p for p in db["products"] if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product["deleted"] = True
    save_db(user_id)
    return {"success": True}


@app.get("/api/inventory/products/{product_id}/breakeven")
def get_product_breakeven(product_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)

    product = next((p for p in db["products"] if p["id"] == product_id and not p.get("deleted", False)), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # ── Average cost per item from all batches of this product
    product_batches = [b for b in db["batches"] if b["productId"] == product_id]
    if product_batches:
        total_batch_cost = sum(b["totalCost"] for b in product_batches)
        total_batch_qty  = sum(b["quantity"] for b in product_batches)
        avg_cost = round(total_batch_cost / total_batch_qty, 2) if total_batch_qty > 0 else 0
    else:
        avg_cost = 0

    settings      = db["profile"].get("settings", {})
    fixed_monthly = settings.get("monthlyFixedCost", 0)
    packaging     = settings.get("packagingCost", 0)

    # ── Average monthly orders for fixed cost allocation
    active_orders = [o for o in db["orders"] if o.get("status", "").upper() != "CANCELLED"]
    if active_orders:
        dates    = [datetime.strptime(o["date"][:10], "%Y-%m-%d") for o in active_orders]
        earliest = min(dates)
        months   = max(1, round((datetime.now() - earliest).days / 30.44))
        avg_monthly_orders = max(1, round(len(active_orders) / months))
    else:
        avg_monthly_orders = 1
    fixed_cost_share = round(fixed_monthly / avg_monthly_orders, 2)

    # ── Minimum courier rate (cheapest same-city option)
    courier_rates = settings.get("courierRates", [])
    if courier_rates:
        min_shipping = min(float(r.get("sameCity", 0)) for r in courier_rates)
    else:
        min_shipping = 0

    breakeven_price    = round(avg_cost + fixed_cost_share + packaging + min_shipping, 2)
    current_price      = product.get("sellingPrice", 0)
    margin_above       = round(current_price - breakeven_price, 2)
    margin_pct         = round((margin_above / current_price) * 100, 1) if current_price > 0 else 0

    return {
        "productId": product_id,
        "productName": product.get("name", ""),
        "avgCostPerItem": avg_cost,
        "fixedCostShare": fixed_cost_share,
        "packagingCost": packaging,
        "minShipping": min_shipping,
        "breakevenPrice": breakeven_price,
        "currentSellingPrice": current_price,
        "marginAboveBreakeven": margin_above,
        "marginPercent": margin_pct
    }


@app.get("/api/inventory/batches")
def get_batches(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    result  = []
    for b in db["batches"]:
        prod   = next((p for p in db["products"] if p["id"] == b["productId"]), None)
        b_copy = b.copy()
        b_copy["productName"] = prod["name"] if prod else "Unknown"
        result.append(b_copy)
    return result


@app.post("/api/inventory/batches/add")
def add_batch(data: BatchInput, x_user_id: str = Header(None)):
    user_id       = get_user_id(x_user_id)
    db            = get_db(user_id)
    cost_per_item = data.totalCost / data.quantity if data.quantity > 0 else 0
    new_batch     = {
        "id": str(uuid.uuid4())[:8], "productId": data.productId, "batchName": data.batchName,
        "date": data.date, "initialQty": data.quantity, "remainingQty": data.quantity,
        "costPerItem": cost_per_item, "totalCost": data.totalCost
    }
    db["batches"].append(new_batch)
    save_db(user_id)
    return {"success": True}


@app.delete("/api/inventory/batches/{batch_id}")
def delete_batch(batch_id: str, x_user_id: str = Header(None)):
    user_id     = get_user_id(x_user_id)
    db          = get_db(user_id)
    db["batches"] = [b for b in db["batches"] if b['id'] != batch_id]
    save_db(user_id)
    return {"success": True}


@app.put("/api/inventory/batches/{batch_id}")
def edit_batch(batch_id: str, data: dict = Body(...), x_user_id: str = Header(None)):
    user_id     = get_user_id(x_user_id)
    db          = get_db(user_id)
    batch_index = next((i for i, b in enumerate(db["batches"]) if b["id"] == batch_id), None)
    if batch_index is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    batch = db["batches"][batch_index]

    # ── FIXED: delta-based remainingQty update (preserves sold stock)
    old_initial = batch["initialQty"]
    new_initial = data.get("quantity", old_initial)
    delta       = new_initial - old_initial

    batch["batchName"]   = data.get("batchName", batch["batchName"])
    batch["date"]        = data.get("date", batch["date"])
    batch["initialQty"]  = new_initial
    batch["remainingQty"] = max(0, batch["remainingQty"] + delta)

    if "totalCost" in data:
        batch["totalCost"]   = data["totalCost"]
        batch["costPerItem"] = data["totalCost"] / new_initial if new_initial > 0 else 0

    if "sellingPrice" in data:
        prod = next((p for p in db["products"] if p["id"] == batch["productId"]), None)
        if prod:
            prod["sellingPrice"] = data["sellingPrice"]

    save_db(user_id)
    return {"success": True}


@app.get("/api/services")
def get_services(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    return [s for s in db["services"] if not s.get("deleted", False)]


@app.post("/api/services/add")
def add_service(data: ServiceInput, x_user_id: str = Header(None)):
    user_id     = get_user_id(x_user_id)
    db          = get_db(user_id)
    new_service = {
        "id": str(uuid.uuid4())[:8], "name": data.name, "productionCost": data.productionCost,
        "sellingPrice": data.sellingPrice, "estimatedTime": data.estimatedTime, "description": data.description
    }
    db["services"].append(new_service)
    save_db(user_id)
    return {"success": True}


@app.delete("/api/services/{service_id}")
def delete_service(service_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    service = next((s for s in db["services"] if s["id"] == service_id), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    service["deleted"] = True
    save_db(user_id)
    return {"success": True}


# ── Orders
@app.get("/api/orders")
def get_orders(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    res     = []
    for o in db["orders"]:
        enriched_items = []
        for item in o["items"]:
            prod = next((p for p in db["products"] if p["id"] == item["productId"]), None)
            if not prod:
                prod = next((s for s in db["services"] if s["id"] == item["productId"]), None)
            enriched_items.append({**item, "productName": prod["name"] if prod else "Unknown"})
        o_copy         = o.copy()
        o_copy["items"] = enriched_items
        res.append(o_copy)
    return res


@app.patch("/api/orders/{order_id}/status")
def update_order_status(order_id: str, data: OrderStatusUpdate, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    order   = next((o for o in db["orders"] if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order["status"] = data.status

    # ── RTO cost: record return shipping fee when order is returned/cancelled
    if data.status.upper() in ("RETURNED", "CANCELLED") and data.returnFee and data.returnFee > 0:
        order["returnShippingCost"] = data.returnFee

    save_db(user_id)
    return {"success": True}


@app.delete("/api/orders/{order_id}")
def delete_order(order_id: str, x_user_id: str = Header(None)):
    user_id     = get_user_id(x_user_id)
    db          = get_db(user_id)
    initial_len = len(db["orders"])
    db["orders"] = [o for o in db["orders"] if o["id"] != order_id]
    if len(db["orders"]) < initial_len:
        save_db(user_id)
        return {"success": True}
    raise HTTPException(status_code=404, detail="Order not found")


def _calc_shipping(db, data):
    """Shared shipping calculation logic for add_order and edit_order.
    Returns (actual_shipping_cost, cod_fee_percent)."""
    settings   = db["profile"].get("settings", {})
    saved_rates = settings.get("courierRates", [])
    my_city    = db["profile"].get("city", "").lower().strip()
    my_prov    = db["profile"].get("province", "").lower().strip()
    rate_info  = next((r for r in saved_rates if r["name"].lower() == data.courier.lower()), None)
    if not rate_info:
        rate_info = {"sameCity": 0, "sameProv": 0, "crossProv": 0, "kg": 0, "codFeePercent": 0}
    cust_city = data.city.lower().strip()
    cust_prov = data.province.lower().strip()
    if cust_city == my_city and cust_city != "":
        base_rate = float(rate_info.get("sameCity", 0))
    elif cust_prov == my_prov and cust_prov != "":
        base_rate = float(rate_info.get("sameProv", 0))
    else:
        base_rate = float(rate_info.get("crossProv", 0))
    shipping_cost = base_rate + (max(0, data.weight - 0.5) * float(rate_info.get("kg", 0)))
    cod_fee_percent = float(rate_info.get("codFeePercent", 0))
    return shipping_cost, cod_fee_percent


@app.post("/api/orders/add")
def add_order(data: OrderInput, x_user_id: str = Header(None)):
    user_id              = get_user_id(x_user_id)
    db                   = get_db(user_id)
    actual_shipping_cost, cod_fee_pct = _calc_shipping(db, data)
    shipping_charge      = 0 if data.isFreeShipping else data.shippingCost
    pkg_cost             = data.packagingCost
    items_total          = sum(item.salePrice * item.quantity for item in data.items)
    final_amount         = data.totalAmount if data.totalAmount > 0 else (items_total + shipping_charge + pkg_cost - data.discount)

    # ── COD fee: courier charges % of total COD amount
    cod_fee = round((final_amount * cod_fee_pct) / 100, 2) if data.paymentType.upper() == "COD" and cod_fee_pct > 0 else 0

    # ── FIXED: use persistent counter (no collision after deletions)
    counter = db["profile"].get("orderCounter", 1000) + 1
    db["profile"]["orderCounter"] = counter

    new_order = {
        "id": str(uuid.uuid4())[:8], "orderId": f"ORD-{counter}",
        "customerName": data.customerName, "city": data.city, "province": data.province,
        "courier": data.courier, "weight": data.weight, "status": data.status,
        "paymentType": data.paymentType, "date": data.date, "isFreeShipping": data.isFreeShipping,
        "shippingCost": shipping_charge, "actualShippingCost": actual_shipping_cost,
        "packagingCost": pkg_cost, "codFee": cod_fee, "discount": data.discount,
        "itemsTotal": items_total, "totalAmount": final_amount,
        "items": [item.dict() for item in data.items]
    }
    db["orders"].append(new_order)

    # ── Stock deduction (FIFO)
    for item in data.items:
        qty_needed       = item.quantity
        product_batches  = sorted(
            [b for b in db["batches"] if b['productId'] == item.productId and b['remainingQty'] > 0],
            key=lambda x: x['date']
        )
        for batch in product_batches:
            if qty_needed == 0:
                break
            if batch['remainingQty'] >= qty_needed:
                batch['remainingQty'] -= qty_needed
                qty_needed = 0
            else:
                qty_needed          -= batch['remainingQty']
                batch['remainingQty'] = 0

    save_db(user_id)
    return {"success": True}


@app.put("/api/orders/{order_id}")
def edit_order(order_id: str, data: OrderInput, x_user_id: str = Header(None)):
    user_id     = get_user_id(x_user_id)
    db          = get_db(user_id)
    order_index = next((i for i, o in enumerate(db["orders"]) if o["id"] == order_id), None)
    if order_index is None:
        raise HTTPException(status_code=404, detail="Order not found")

    actual_shipping_cost, cod_fee_pct = _calc_shipping(db, data)
    shipping_charge      = 0 if data.isFreeShipping else data.shippingCost
    items_total          = sum(item.salePrice * item.quantity for item in data.items)
    final_amount         = data.totalAmount if data.totalAmount > 0 else (items_total + shipping_charge + data.packagingCost - data.discount)
    existing             = db["orders"][order_index]

    # ── COD fee: courier charges % of total COD amount
    cod_fee = round((final_amount * cod_fee_pct) / 100, 2) if data.paymentType.upper() == "COD" and cod_fee_pct > 0 else 0

    db["orders"][order_index] = {
        "id": existing["id"], "orderId": existing["orderId"],
        "customerName": data.customerName, "city": data.city, "province": data.province,
        "courier": data.courier, "weight": data.weight, "status": data.status,
        "paymentType": data.paymentType, "date": data.date, "isFreeShipping": data.isFreeShipping,
        "shippingCost": shipping_charge, "actualShippingCost": actual_shipping_cost,
        "packagingCost": data.packagingCost, "codFee": cod_fee, "discount": data.discount,
        "itemsTotal": items_total, "totalAmount": final_amount,
        "items": [item.dict() for item in data.items]
    }
    save_db(user_id)
    return {"success": True}


# ── Analytics
@app.get("/api/analytics")
def get_analytics(x_user_id: str = Header(None)):
    user_id  = get_user_id(x_user_id)
    db       = get_db(user_id)
    today_str = datetime.now().strftime("%Y-%m-%d")

    # ✅ FIX: Exclude CANCELLED orders from ALL financial calculations
    active_orders = [o for o in db['orders'] if o.get('status', '').upper() != 'CANCELLED']

    total_sales_revenue = sum(o['totalAmount'] for o in active_orders)
    today_sales         = sum(o['totalAmount'] for o in active_orders if o['date'] == today_str)
    total_inventory_cost = sum(b['totalCost'] for b in db['batches'])
    current_stock_value  = sum(b['remainingQty'] * b['costPerItem'] for b in db['batches'])
    cogs_stock           = total_inventory_cost - current_stock_value
    fixed_monthly        = db['profile']['settings'].get('monthlyFixedCost', 0)

    # ── Multiply fixed cost by months of operation (based on active orders only)
    if active_orders:
        dates    = [datetime.strptime(o['date'][:10], '%Y-%m-%d') for o in active_orders]
        earliest = min(dates)
        months   = max(1, round((datetime.now() - earliest).days / 30.44))
    else:
        months = 1
    total_fixed_costs = fixed_monthly * months

    variable_shipping_packaging = sum((o.get('actualShippingCost', 0) + o.get('packagingCost', 0) + o.get('codFee', 0)) for o in active_orders)
    total_cod_fees    = sum(o.get('codFee', 0) for o in active_orders)
    # ── RTO costs: return shipping from ALL orders (including cancelled/returned)
    total_return_costs = sum(o.get('returnShippingCost', 0) for o in db['orders'])
    total_expenses = total_fixed_costs + cogs_stock + variable_shipping_packaging + total_return_costs
    net_profit     = total_sales_revenue - total_expenses
    low_stock_count = sum(1 for p in db["products"] if sum(b['remainingQty'] for b in db["batches"] if b['productId'] == p['id']) <= 3)

    # ── Additional critical metrics
    profit_margin   = round((net_profit / total_sales_revenue) * 100, 1) if total_sales_revenue > 0 else 0
    avg_order_value = round(total_sales_revenue / len(active_orders), 0) if active_orders else 0
    today_orders    = sum(1 for o in active_orders if o['date'] == today_str)
    cancelled_today = sum(1 for o in db['orders'] if o.get('status', '').upper() == 'CANCELLED' and o['date'] == today_str)

    # ── Pending COD: money still in transit with couriers
    cod_pending_orders = [o for o in active_orders if o.get('status', '').upper() in ('PENDING', 'SHIPPED') and o.get('paymentType', '').upper() == 'COD']
    pending_cod = sum(o['totalAmount'] for o in cod_pending_orders)
    cod_by_courier = {}
    for o in cod_pending_orders:
        courier = o.get('courier', 'Unknown')
        cod_by_courier[courier] = cod_by_courier.get(courier, 0) + o['totalAmount']

    # ✅ Chart data also excludes cancelled orders
    chart_data = []
    for i in range(6, -1, -1):
        day = date.today() - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        chart_data.append({
            "date": day_str, "day": day.strftime("%a"),
            "sales": sum(o['totalAmount'] for o in active_orders if o['date'] == day_str)
        })

    return {
        "summary": {
            "todaySales": today_sales, "totalOrders": len(active_orders),
            "totalExpenses": total_expenses, "netProfit": net_profit,
            "totalCodFees": total_cod_fees, "totalReturnCosts": total_return_costs,
            "stockValue": current_stock_value, "lowStockCount": low_stock_count,
            "profitMargin": profit_margin, "avgOrderValue": avg_order_value,
            "todayOrders": today_orders, "cancelledToday": cancelled_today,
            "pendingCOD": pending_cod, "codByCourier": cod_by_courier,
        },
        "orders": get_orders(x_user_id), "chart": chart_data
    }


# ── Reports
@app.get("/api/reports")
def get_reports(preset: str = "this-month", x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db      = get_db(user_id)
    try:
        now        = datetime.now()
        end_date   = now
        start_date = None

        if preset == "today":
            start_date = now.replace(hour=0, minute=0, second=0)
        elif preset == "yesterday":
            start_date = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0)
            end_date   = start_date.replace(hour=23, minute=59, second=59)
        elif preset == "last-7-days":
            start_date = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0)
        elif preset == "this-month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0)
        elif preset == "last-month":
            start_date = (now.replace(day=1) - timedelta(days=1)).replace(day=1, hour=0, minute=0, second=0)
            end_date   = now.replace(day=1) - timedelta(seconds=1)
        elif preset == "last-3-months":
            month = now.month - 3
            year  = now.year
            if month <= 0:
                month += 12
                year  -= 1
            start_date = now.replace(year=year, month=month, day=1, hour=0, minute=0, second=0)
        else:
            start_date = datetime(2020, 1, 1)

        start_str = start_date.strftime("%Y-%m-%d")
        end_str   = end_date.strftime("%Y-%m-%d")

        filtered_orders = [
            o for o in db["orders"]
            if start_str <= o["date"][:10] <= end_str and o["status"].upper() != "CANCELLED"
        ]

        # ── FIXED COGS: use batch costPerItem, not itemsTotal (which is revenue)
        batches = db["batches"]
        def calc_order_cost(order):
            cogs = 0
            for item in order.get("items", []):
                batch = next((b for b in batches if b["productId"] == item.get("productId")), None)
                cogs += (batch["costPerItem"] * item.get("quantity", 1)) if batch else 0
            shipping  = order.get("actualShippingCost", 0)
            packaging = order.get("packagingCost", 0)
            cod_fee   = order.get("codFee", 0)
            rto_cost  = order.get("returnShippingCost", 0)
            return cogs + shipping + packaging + cod_fee + rto_cost

        total_revenue  = sum(o.get('totalAmount', 0) for o in filtered_orders)
        total_cost     = sum(calc_order_cost(o) for o in filtered_orders)
        # ── RTO costs from ALL orders in date range (including cancelled/returned)
        all_orders_in_range = [o for o in db["orders"] if start_str <= o["date"][:10] <= end_str]
        report_return_costs = sum(o.get('returnShippingCost', 0) for o in all_orders_in_range)
        total_expenses = db['profile']['settings'].get('monthlyFixedCost', 0)
        total_profit   = total_revenue - total_cost - total_expenses - report_return_costs
        profit_margin  = round((total_profit / total_revenue) * 100, 1) if total_revenue > 0 else 0

        status_counts = {}
        for o in filtered_orders:
            st = o["status"].upper()
            status_counts[st] = status_counts.get(st, 0) + 1
        total_orders    = len(filtered_orders)
        orders_by_status = [
            {"status": k, "count": v, "percentage": round((v / total_orders) * 100, 1) if total_orders > 0 else 0}
            for k, v in status_counts.items()
        ]

        payment_counts = {}
        for o in filtered_orders:
            pt = o.get("paymentType", "COD").upper()
            payment_counts[pt] = payment_counts.get(pt, 0) + 1
        payment_split = [
            {"method": k, "count": v, "percentage": round((v / total_orders) * 100, 1) if total_orders > 0 else 0}
            for k, v in payment_counts.items()
        ]

        daily_map = {}
        for o in filtered_orders:
            d_key = o["date"][:10]
            if d_key not in daily_map:
                daily_map[d_key] = {"revenue": 0, "profit": 0, "orderCount": 0}
            o_cost = calc_order_cost(o)
            daily_map[d_key]["revenue"]     += o.get('totalAmount', 0)
            daily_map[d_key]["profit"]      += o.get('totalAmount', 0) - o_cost
            daily_map[d_key]["orderCount"]  += 1
        sales_by_day = [
            {"date": k, "revenue": v["revenue"], "profit": v["profit"], "orderCount": v["orderCount"]}
            for k, v in sorted(daily_map.items())
        ]

        ledger = []
        for o in sorted(filtered_orders, key=lambda x: x["date"], reverse=True)[:100]:
            o_cost = calc_order_cost(o)
            ledger.append({
                "id": o["orderId"], "date": o["date"], "customerName": o["customerName"],
                "city": o["city"], "revenue": o.get('totalAmount', 0), "cost": o_cost,
                "profit": o.get('totalAmount', 0) - o_cost, "status": o["status"],
                "discount": o.get("discount", 0),
                "paymentMethod": o.get("paymentType", "COD"),
                "productName": ", ".join([i.get("productName", "Item") for i in o.get("items", [])])
            })

        return {
            "success": True,
            "data": {
                "businessProfile": {"name": db["profile"].get("businessName", ""),
                                    "logo": db["profile"].get("settings", {}).get("logo", "")},
                "dateRange": {"preset": preset, "start": start_str, "end": end_str},
                "summary": {
                    "totalRevenue": total_revenue, "totalProfit": total_profit,
                    "totalCost": total_cost, "totalExpenses": total_expenses,
                    "returnCosts": report_return_costs,
                    "totalDiscounts": sum(o.get('discount', 0) for o in filtered_orders),
                    "totalOrders": total_orders,
                    "avgOrderValue": round(total_revenue / total_orders, 0) if total_orders > 0 else 0,
                    "profitMargin": profit_margin,
                    "revenueGrowth": 0, "profitGrowth": 0, "orderGrowth": 0
                },
                "ordersByStatus": orders_by_status, "paymentSplit": payment_split,
                "salesByDay": sales_by_day, "topProducts": [],
                "rto": {"overallRate": 0, "codReturnRate": 0, "prepaidReturnRate": 0, "totalReturns": 0, "highRiskCities": []},
                "ledger": ledger, "insights": [],
                "generatedAt": datetime.now().isoformat()
            }
        }
    except Exception as e:
        print("Reports API Error:", e)
        return {"success": False, "error": str(e)}


# ==========================================
# AI IMAGE TOOLS
# ==========================================

@app.post("/remove-bg")
@limiter.limit("3/minute")
async def remove_background(request: Request, file: UploadFile = File(...)):
    if not HAS_IMAGE_TOOLS:
        raise HTTPException(status_code=500, detail="Server Error: 'rembg' library not found.")
    try:
        content    = await validate_upload(file)
        image      = Image.open(io.BytesIO(content))
        my_session = new_session("isnet-general-use")
        output     = remove(image, session=my_session, alpha_matting=True,
                            alpha_matting_foreground_threshold=240,
                            alpha_matting_background_threshold=10,
                            alpha_matting_erode_size=10, post_process_mask=True)
        img_byte_arr = io.BytesIO()
        output.save(img_byte_arr, format='PNG', quality=100)
        img_byte_arr.seek(0)
        return Response(content=img_byte_arr.getvalue(), media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="Failed to remove background")


@app.post("/apply-background")
async def apply_background(request: Request, file: UploadFile = File(...),
                           bg_color: str = Form(None), bg_image_url: str = Form(None)):
    if not HAS_IMAGE_TOOLS:
        raise HTTPException(status_code=500, detail="Image libraries missing.")
    try:
        content = await validate_upload(file)
        fg      = Image.open(io.BytesIO(content)).convert("RGBA")
        if bg_image_url:
            # ── SSRF guard: only allow https URLs
            from urllib.parse import urlparse
            import socket
            parsed = urlparse(bg_image_url)
            if parsed.scheme != "https":
                raise HTTPException(status_code=400, detail="Only https:// image URLs are allowed.")
            hostname = parsed.hostname or ""
            blocked  = ["localhost", "127.", "10.", "192.168.", "169.254.", "172."]
            if any(hostname.startswith(b) for b in blocked):
                raise HTTPException(status_code=400, detail="Private/internal URLs are not allowed.")
            import urllib.request
            bg_data = urllib.request.urlopen(bg_image_url, timeout=5).read()
            bg      = Image.open(io.BytesIO(bg_data)).convert("RGBA")
            bg      = bg.resize(fg.size, Image.LANCZOS)
        elif bg_color:
            hex_clean = bg_color.lstrip("#")
            r, g, b   = int(hex_clean[0:2], 16), int(hex_clean[2:4], 16), int(hex_clean[4:6], 16)
            bg        = Image.new("RGBA", fg.size, (r, g, b, 255))
        else:
            bg = Image.new("RGBA", fg.size, (255, 255, 255, 255))
        composite = Image.alpha_composite(bg, fg)
        buf       = io.BytesIO()
        composite.save(buf, format="PNG", quality=100)
        buf.seek(0)
        return Response(content=buf.getvalue(), media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        print("Apply BG Error:", e)
        raise HTTPException(status_code=500, detail="Failed to apply background")


@app.post("/apply-gradient")
async def apply_gradient(request: Request, file: UploadFile = File(...), gradient_config: str = Form(...)):
    if not HAS_IMAGE_TOOLS:
        raise HTTPException(status_code=500, detail="Image libraries missing.")
    try:
        config      = json.loads(gradient_config)
        stops       = config.get("stops", [{"color": "#16A34A", "position": 0, "opacity": 1}, {"color": "#065F46", "position": 100, "opacity": 1}])
        angle       = config.get("angle", 135)
        grad_type   = config.get("type", "linear")
        content     = await validate_upload(file)
        fg          = Image.open(io.BytesIO(content)).convert("RGBA")
        w, h        = fg.size
        grad_arr    = np.zeros((h, w, 4), dtype=np.uint8)
        parsed_stops = []
        for s in stops:
            hex_c   = s["color"].lstrip("#")
            r, g, b = int(hex_c[0:2], 16), int(hex_c[2:4], 16), int(hex_c[4:6], 16)
            opacity = max(0, min(1, float(s.get("opacity", 1))))
            pos     = max(0, min(1, float(s["position"]) / 100))
            parsed_stops.append((pos, r, g, b, int(opacity * 255)))
        parsed_stops.sort(key=lambda x: x[0])
        if not parsed_stops:
            parsed_stops = [(0, 22, 163, 74, 255), (1, 6, 95, 70, 255)]

        def lerp_color(t, stops_list):
            if t <= stops_list[0][0]:
                s = stops_list[0]; return s[1], s[2], s[3], s[4]
            if t >= stops_list[-1][0]:
                s = stops_list[-1]; return s[1], s[2], s[3], s[4]
            for i in range(len(stops_list) - 1):
                s0, s1 = stops_list[i], stops_list[i + 1]
                if s0[0] <= t <= s1[0]:
                    frac = (t - s0[0]) / max(s1[0] - s0[0], 0.001)
                    return (int(s0[1]+(s1[1]-s0[1])*frac), int(s0[2]+(s1[2]-s0[2])*frac),
                            int(s0[3]+(s1[3]-s0[3])*frac), int(s0[4]+(s1[4]-s0[4])*frac))
            s = stops_list[-1]; return s[1], s[2], s[3], s[4]

        import math
        if grad_type == "radial":
            cx, cy  = w / 2, h / 2
            max_r   = math.sqrt(cx**2 + cy**2)
            # ── Use numpy vectorized operations (not nested Python loops)
            xs      = np.arange(w, dtype=np.float64)
            ys      = np.arange(h, dtype=np.float64)
            xx, yy  = np.meshgrid(xs, ys)
            dist    = np.sqrt((xx - cx)**2 + (yy - cy)**2)
            t_map   = np.clip(dist / max_r, 0, 1)
            for y in range(h):
                for x in range(w):
                    grad_arr[y, x] = lerp_color(t_map[y, x], parsed_stops)
        else:
            rad     = math.radians(angle)
            cos_a, sin_a = math.cos(rad), math.sin(rad)
            xs      = np.arange(w, dtype=np.float64)
            ys      = np.arange(h, dtype=np.float64)
            xx, yy  = np.meshgrid(xs, ys)
            proj    = xx * cos_a + yy * sin_a
            p_min, p_max = proj.min(), proj.max()
            t_map   = np.zeros_like(proj) if p_max - p_min < 0.001 else (proj - p_min) / (p_max - p_min)
            for y in range(h):
                for x in range(w):
                    grad_arr[y, x] = lerp_color(t_map[y, x], parsed_stops)

        gradient  = Image.fromarray(grad_arr, "RGBA")
        composite = Image.alpha_composite(gradient, fg)
        buf       = io.BytesIO()
        composite.save(buf, format="PNG", quality=100)
        buf.seek(0)
        return Response(content=buf.getvalue(), media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        print("Gradient Error:", e)
        raise HTTPException(status_code=500, detail="Failed to apply gradient")


@app.post("/apply-template")
async def apply_template(request: Request, file: UploadFile = File(...), template_id: str = Form("studio-minimalist")):
    if not HAS_IMAGE_TOOLS:
        raise HTTPException(status_code=500, detail="Image libraries missing.")
    from PIL import ImageFilter
    STUDIO_TEMPLATES_CONFIG = {
        "studio-spotlight":     {"bg_top": "#1a1a2e", "bg_bottom": "#16213e", "shadow_offset": 20, "shadow_blur": 35, "shadow_opacity": 130, "reflection": False},
        "studio-surface":       {"bg_top": "#f0f0f0", "bg_bottom": "#d4d4d4", "shadow_offset": 8,  "shadow_blur": 15, "shadow_opacity": 60,  "reflection": True},
        "studio-gradient-warm": {"bg_top": "#fef3c7", "bg_bottom": "#f59e0b", "shadow_offset": 15, "shadow_blur": 25, "shadow_opacity": 80,  "reflection": False},
        "studio-gradient-cool": {"bg_top": "#e0f2fe", "bg_bottom": "#3b82f6", "shadow_offset": 15, "shadow_blur": 25, "shadow_opacity": 80,  "reflection": False},
        "studio-minimalist":    {"bg_top": "#ffffff", "bg_bottom": "#f5f5f5", "shadow_offset": 12, "shadow_blur": 30, "shadow_opacity": 50,  "reflection": False},
        "studio-luxury":        {"bg_top": "#1f2937", "bg_bottom": "#111827", "shadow_offset": 18, "shadow_blur": 30, "shadow_opacity": 150, "reflection": True},
        "studio-pastel":        {"bg_top": "#fce7f3", "bg_bottom": "#ddd6fe", "shadow_offset": 12, "shadow_blur": 20, "shadow_opacity": 60,  "reflection": False},
        "studio-nature":        {"bg_top": "#fffbeb", "bg_bottom": "#fef3c7", "shadow_offset": 10, "shadow_blur": 20, "shadow_opacity": 45,  "reflection": False},
    }
    tpl = STUDIO_TEMPLATES_CONFIG.get(template_id)
    if not tpl:
        raise HTTPException(status_code=400, detail=f"Unknown template: {template_id}")
    try:
        content      = await validate_upload(file)
        fg           = Image.open(io.BytesIO(content)).convert("RGBA")
        canvas_w     = max(fg.width, 1200)
        canvas_h     = max(fg.height, 1200)
        canvas_size  = (canvas_w, canvas_h)

        def hex_to_rgb(h): h=h.lstrip("#"); return int(h[0:2],16),int(h[2:4],16),int(h[4:6],16)
        def build_bg(size, c1, c2):
            w2,h2=size; arr=np.zeros((h2,w2,4),dtype=np.uint8)
            r1,g1,b1=hex_to_rgb(c1); r2,g2,b2=hex_to_rgb(c2)
            for y in range(h2):
                t=y/max(h2-1,1); arr[y,:,0]=int(r1+(r2-r1)*t); arr[y,:,1]=int(g1+(g2-g1)*t); arr[y,:,2]=int(b1+(b2-b1)*t); arr[y,:,3]=255
            return Image.fromarray(arr,"RGBA")
        def center_fg(fg2, cs, scale=0.65):
            cw2,ch2=cs; fw2,fh2=fg2.size; max_w2,max_h2=int(cw2*scale),int(ch2*scale)
            ratio=min(max_w2/fw2,max_h2/fh2); nw,nh=int(fw2*ratio),int(fh2*ratio)
            resized=fg2.resize((nw,nh),Image.LANCZOS); x=(cw2-nw)//2; y=int((ch2-nh)//2-ch2*0.03)
            canvas=Image.new("RGBA",cs,(0,0,0,0)); canvas.paste(resized,(x,max(0,y)),resized); return canvas
        def create_shadow(fg2, offset=15, blur_radius=25, opacity=100):
            alpha=fg2.split()[3]; sl=Image.new("L",fg2.size,0); sl.paste(alpha,(0,offset))
            sl=sl.filter(ImageFilter.GaussianBlur(blur_radius))
            sa=np.clip(np.array(sl,dtype=np.float64)*(opacity/255.0),0,255).astype(np.uint8)
            sh=Image.new("RGBA",fg2.size,(0,0,0,0)); sh.putalpha(Image.fromarray(sa)); return sh
        def create_reflection(fg2, height_frac=0.3, start_opacity=80):
            flipped=ImageOps.flip(fg2); ref_h=int(fg2.height*height_frac); flipped=flipped.crop((0,0,flipped.width,ref_h))
            arr=np.array(flipped).copy(); alpha=arr[:,:,3].astype(np.float64)
            fade=np.linspace(start_opacity/255.0,0,ref_h).reshape(-1,1); alpha*=fade
            arr[:,:,3]=alpha.astype(np.uint8); return Image.fromarray(arr,"RGBA")

        bg          = build_bg(canvas_size, tpl["bg_top"], tpl["bg_bottom"])
        scale       = 0.60 if tpl["reflection"] else 0.65
        fg_centered = center_fg(fg, canvas_size, scale)
        shadow      = create_shadow(fg_centered, tpl["shadow_offset"], tpl["shadow_blur"], tpl["shadow_opacity"])
        result      = Image.alpha_composite(Image.alpha_composite(bg, shadow), fg_centered)

        if tpl.get("reflection"):
            ref            = create_reflection(fg_centered, 0.25, 60)
            fg_arr         = np.array(fg_centered)
            rows           = np.where(fg_arr[:,:,3] > 10)[0]
            if len(rows) > 0:
                fg_bottom  = rows.max()
                ref_canvas = Image.new("RGBA", canvas_size, (0,0,0,0))
                ref_y      = min(fg_bottom + 2, canvas_h - ref.height)
                ref_x      = (canvas_w - ref.width) // 2
                ref_canvas.paste(ref, (ref_x, ref_y), ref)
                result = Image.alpha_composite(result, ref_canvas)

        buf = io.BytesIO()
        result.convert("RGB").save(buf, format="PNG", quality=100)
        buf.seek(0)
        return Response(content=buf.getvalue(), media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        print("Template Error:", e)
        raise HTTPException(status_code=500, detail="Failed to apply template")


# ==========================================
# SEO GENERATOR (Rate limited — paid API)
# ==========================================

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY is not set. SEO generation will fail.")
groq_client = Groq(api_key=GROQ_API_KEY)


@app.post("/generate-seo")
@limiter.limit("5/minute")
def generate_seo_content(request: Request, data: SeoRequest):
    try:
        system_prompt = """You are an AI backend content engine for an e-commerce automation tool.
Output Format (Strict JSON ONLY):
{
  "seo_title": "", "focus_keyword": "", "slug": "", "meta_description": "",
  "product_description": "Valid HTML string here", "image_alt_text": "",
  "internal_links": ["/category/example", "/collections/sale"],
  "outbound_link": "https://example.com/informational",
  "secondary_keywords": ["kw1", "kw2", "kw3"],
  "faq_section": [{"question": "...", "answer": "..."}]
}"""
        user_prompt = f"Product: {data.product_name}\nBrand: {data.brand_name}\nFeatures: {data.features}"
        response    = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        parsed_data = json.loads(response.choices[0].message.content)
        return {"success": True, "data": parsed_data}
    except Exception as e:
        print("Groq SEO Error:", e)
        return {"success": False, "error": "Failed to generate SEO from AI."}


# ==========================================
# IMAGE COMPRESSOR
# ==========================================

@app.post("/api/compress")
@limiter.limit("10/minute")
async def compress_image(request: Request, file: UploadFile = File(...), settings: str = Form(...), isPro: str = Form(...)):
    if not HAS_IMAGE_TOOLS:
        raise HTTPException(status_code=500, detail="Image libraries missing.")
    try:
        options = json.loads(settings)
        content = await validate_upload(file)
        image   = Image.open(io.BytesIO(content))
        if options['resizeMode'] == 'daraz':
            image = image.resize((1200, 1200), Image.LANCZOS)
        elif options['resizeMode'] == 'shopify':
            image = image.resize((2048, 2048), Image.LANCZOS)
        elif options['resizeMode'] == 'custom' and options.get('width') and options.get('height'):
            image = image.resize((int(options['width']), int(options['height'])), Image.LANCZOS)
        output_format = image.format if options['format'] == 'original' else options['format'].upper()
        if output_format == 'JPG':
            output_format = 'JPEG'
        buffer = io.BytesIO()
        image.save(buffer, format=output_format, quality=int(options['quality']), optimize=True)
        encoded_img = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return {"success": True, "data": {"image": f"data:image/{output_format.lower()};base64,{encoded_img}", "compressedSize": buffer.getbuffer().nbytes}}
    except HTTPException:
        raise
    except Exception as e:
        print("Compression Error:", e)
        return {"success": False, "error": str(e)}


@app.post("/api/tools/upscale")
async def upscale_image(file: UploadFile = File(...)):
    if not HAS_IMAGE_TOOLS:
        return {"error": "Libraries missing"}
    content  = await validate_upload(file)
    image    = Image.open(io.BytesIO(content))
    new_size = (int(image.width * 2), int(image.height * 2))
    upscaled = image.resize(new_size, Image.BICUBIC)
    buffer   = io.BytesIO()
    upscaled.save(buffer, format="PNG")
    return Response(content=buffer.getvalue(), media_type="image/png")


# ==========================================
# ADMIN & SUPPORT
# ==========================================

ADMIN_EMAIL = "zipsellix@gmail.com"
INTERNAL_SECRET = os.environ.get("INTERNAL_API_SECRET", "")


class SupportTicketInput(BaseModel):
    subject: str
    description: str
    issueType: str
    attachment: Optional[str] = None
    date: str


@app.post("/api/support/tickets")
def create_ticket(data: SupportTicketInput, x_user_id: str = Header(default="default_user")):
    db = get_db(x_user_id)
    if "support_tickets" not in db:
        db["support_tickets"] = []
    new_ticket = {
        "id": str(uuid.uuid4())[:8], "userId": x_user_id,
        "subject": data.subject, "description": data.description,
        "issueType": data.issueType, "attachment": data.attachment,
        "status": "OPEN", "date": data.date
    }
    db["support_tickets"].append(new_ticket)
    save_db(x_user_id)
    return {"success": True, "ticketId": new_ticket["id"]}


@app.get("/api/support/my-tickets")
def get_my_tickets(x_user_id: str = Header(default="default_user")):
    db = get_db(x_user_id)
    return {"success": True, "tickets": db.get("support_tickets", [])}


@app.get("/api/admin/all-tickets")
def get_all_tickets(x_user_id: str = Header(default="default_user"),
                    x_internal_secret: str = Header(default="")):
    # ── FIXED: verify shared secret + admin email (not just spoofable header)
    if x_internal_secret != INTERNAL_SECRET or not INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized Access.")
    if x_user_id != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Unauthorized Access. Admins only.")

    all_tickets = []
    # Collect from in-memory cache
    for uid, db in USER_DB_CACHE.items():
        all_tickets.extend(db.get("support_tickets", []))
    # Also scan disk for users not in cache
    import glob
    for fpath in glob.glob(os.path.join(DATA_DIR, "*_main.json")):
        uid = os.path.basename(fpath).replace("_main.json", "")
        if uid not in USER_DB_CACHE:
            try:
                with open(fpath, "r") as f:
                    db = json.load(f)
                all_tickets.extend(db.get("support_tickets", []))
            except:
                pass

    all_tickets.sort(key=lambda x: x.get("date", ""), reverse=True)
    return {"success": True, "tickets": all_tickets}


class TicketStatusUpdate(BaseModel):
    status: str
    userId: str


@app.patch("/api/admin/tickets/{ticket_id}/status")
def update_ticket_status(ticket_id: str, data: TicketStatusUpdate,
                         x_user_id: str = Header(default="default_user"),
                         x_internal_secret: str = Header(default="")):
    if x_internal_secret != INTERNAL_SECRET or not INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized Access.")
    if x_user_id != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Unauthorized Access.")
    target_db = get_db(data.userId)
    for ticket in target_db.get("support_tickets", []):
        if ticket["id"] == ticket_id:
            ticket["status"] = data.status
            save_db(data.userId)
            return {"success": True}
    raise HTTPException(status_code=404, detail="Ticket not found")


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)