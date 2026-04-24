from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import uuid
import re
from datetime import datetime, date, timedelta
import os
import io
import json
import base64
from groq import Groq

# --- Image Processing Libraries (Try/Except taake error na aaye agar install na hon) ---
try:
    from PIL import Image, ImageOps
    from rembg import remove, new_session
    import numpy as np
    HAS_IMAGE_TOOLS = True
except ImportError:
    HAS_IMAGE_TOOLS = False
    print("âš ï¸ Warning: 'rembg' or 'pillow' not installed. AI Tools won't work.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ðŸ’¾ MULTI-TENANT DATABASE (PER-USER JSON STORAGE)
# ==========================================
DATA_DIR = "backend/data"
os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_DB = {
    "profile": {"isSetupComplete": False, "businessType": "STOCK", "businessName": "", "ownerName": "", "settings": {}},
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
"clothing": {"name": "Clothing Seller", "risk_weights": {"no_city": 25, "short_address": 30, "fake_phone": 60, "cancelled_history": 40}, "default_templates": {"confirm": "*Order Confirm* âœ…\n\nAssalam o Alaikum {customer_name}!\nAap ka order confirm ho gaya hai.\n\nðŸ“¦ Products: {product_list}\nðŸ“ Delivery Address: {city}\nðŸ“ž Contact: {phone}\nðŸ†” Order ID: {order_id}\n\nHum 2-3 din mein deliver kar dein gay. JazakAllah! ðŸ™", "recheck": "*Address Recheck Required* ðŸ“\n\nDear {customer_name},\nAap ka address incomplete lagta hai. Meherbani farma kar poora address send karein:\n\n- Ghar/Flat number\n- Gali/Street name\n- Mohallah/Colony\n- Shehar: {city}\n\nOrder ID: {order_id}", "reminder": "*COD Reminder* ðŸ’°\n\nDear {customer_name},\nAap ka parcel rasta mein hai! Delivery par {product_list} ka payment Cash mein ready rakhein.\n\nOrder ID: {order_id}\nShipping to: {city}", "dispatch": "*Parcel Dispatch Ho Gaya* ðŸšš\n\nDear {customer_name},\nKhushi ki khabar! Aap ka order dispatch ho gaya hai.\n\nðŸ†” Order ID: {order_id}\nðŸ“ Delivery: {city}\n\nEk se teen din mein delivery milegi. Shukriya! ðŸ™", "warning": "*Final Warning - Order Cancel* âš ï¸\n\nDear {customer_name},\nHum ne {phone} par kai baar contact kiya lekin koi jawab nahi mila.\n\nAgar aaj jawab nahi aaya to Order ID {order_id} cancel kar diya jaye ga.\n\nPlease reply karein."}},
"electronics": {"name": "Electronics Seller", "risk_weights": {"no_city": 30, "short_address": 35, "fake_phone": 70, "cancelled_history": 50}, "default_templates": {"confirm": "*Order Confirmation* âœ…\n\nDear {customer_name},\nYour electronics order has been confirmed!\n\nðŸ“¦ Item(s): {product_list}\nðŸ“ Delivery City: {city}\nðŸ“ž Phone: {phone}\nðŸ†” Order ID: {order_id}\n\nDelivery in 3-5 working days. COD payment at door.", "recheck": "*Address Verification Needed* ðŸ“\n\nDear {customer_name},\nPlease provide your complete address for Order ID: {order_id}\n\nRequired:\n- House/Flat No.\n- Street/Gali\n- Area/Sector\n- City: {city}", "reminder": "*Payment Reminder* ðŸ’°\n\nDear {customer_name},\nYour parcel is on its way! Please keep Cash on Delivery ready for {product_list}.\n\nOrder: {order_id} | City: {city}", "dispatch": "*Order Dispatched* ðŸšš\n\nDear {customer_name},\nYour order {order_id} has been dispatched!\n\nðŸ“ Delivering to: {city}\nExpected: 3-5 working days. Thank you!", "warning": "*FINAL NOTICE* âš ï¸\n\nDear {customer_name}, multiple delivery attempts failed for Order {order_id}.\nContact {phone} within 24hrs or order will be CANCELLED."}}
    }
}

# In-memory storage cache to avoid redundant disk I/O
USER_DB_CACHE = {}
USER_WA_DB_CACHE = {}

def get_user_id(x_user_id: str = Header(None)):
    if not x_user_id or x_user_id == "anonymous":
        raise HTTPException(status_code=401, detail="Unauthorized: User ID missing or invalid")
    return str(x_user_id)

def get_db(user_id: str):
    if user_id in USER_DB_CACHE:
        return USER_DB_CACHE[user_id]
    
    user_file = os.path.join(DATA_DIR, f"{user_id}_main.json")
    db = DEFAULT_DB.copy()
    
    if os.path.exists(user_file):
        try:
            with open(user_file, "r") as f:
                db = json.load(f)
        except: pass
        
    USER_DB_CACHE[user_id] = db
    return db

def get_wa_db(user_id: str):
    if user_id in USER_WA_DB_CACHE:
        return USER_WA_DB_CACHE[user_id]
    
    user_file = os.path.join(DATA_DIR, f"{user_id}_wa.json")
    db = DEFAULT_WA_DB.copy()
    
    if os.path.exists(user_file):
        try:
            with open(user_file, "r") as f:
                db = json.load(f)
        except: pass
        
    USER_WA_DB_CACHE[user_id] = db
    return db

def save_db(user_id: str):
    if user_id not in USER_DB_CACHE: return
    user_file = os.path.join(DATA_DIR, f"{user_id}_main.json")
    try:
        with open(user_file, "w") as f:
            json.dump(USER_DB_CACHE[user_id], f, indent=4)
    except Exception as e:
        print(f"âš ï¸ Error saving DB for {user_id}:", e)

def save_wa_db(user_id: str):
    if user_id not in USER_WA_DB_CACHE: return
    user_file = os.path.join(DATA_DIR, f"{user_id}_wa.json")
    try:
        with open(user_file, "w") as f:
            json.dump(USER_WA_DB_CACHE[user_id], f, indent=4)
    except Exception as e:
        print(f"âš ï¸ Error saving WA DB for {user_id}:", e)

# Global WA_DB removed for strict partitioning

# ==========================================
# ðŸ“¦ EXISTING DATA MODELS (Business Setup)
# ==========================================

class CourierRate(BaseModel):
    name: str
    sameCity: float
    sameProv: float
    crossProv: float
    kg: float

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
    date: str

class OrderStatusUpdate(BaseModel):
    status: str

# Document History Model
class DocumentInput(BaseModel):
    type: str # Invoice, Shipping Label, Packing Slip
    ref: str
    format: str # pdf, png
    fileData: str # base64 data

# NEW: Create Shipment Model
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

# ==========================================
# ðŸ› ï¸ NEW: AI TOOLS DATA MODELS
# ==========================================

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

# ==========================================
# ðŸ“± WHATSAPP MANAGER DATA MODELS
# ==========================================

class WAVerifyRequest(BaseModel):
    rawText: str
    isPro: bool = False
    sellerProfile: str = "general"
    productList: str = ""

class WATemplateInput(BaseModel):
    name: str
    type: str  # confirm, recheck, reminder, dispatch, warning
    content: str

class WAOrderStatusUpdate(BaseModel):
    status: str  # confirmed, cancelled, pending

# ==========================================
# ðŸ“± WHATSAPP MANAGER HELPERS
# ==========================================

def wa_detect_risk(phone: str, clean_address: str, city: str, name: str, profile_key: str, wa_orders_db: list) -> dict:
    """Smart risk detection engine for Pakistan COD sellers."""
    weights = WA_DB["seller_profiles"].get(profile_key, WA_DB["seller_profiles"]["general"])["risk_weights"]
    reasons = []
    score = 0

    # 1. Phone analysis
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

    # 2. Address analysis
    if len(clean_address) < 5:
        reasons.append("Address incomplete or missing")
        score += weights["short_address"]
    elif not re.search(r'\d', clean_address) and len(clean_address) < 15:
        reasons.append("Address looks too short (house number missing)")
        score += 15

    # 3. City analysis
    if city == "Unknown City":
        reasons.append("City not detected")
        score += weights["no_city"]

    # 4. Name analysis 
    if name == "Customer" or len(name) < 3:
        reasons.append("Customer name missing or unclear")
        score += 15
    elif re.search(r'^(test|abc|xyz|asd|admin|user|demo)$', name, re.IGNORECASE):
        reasons.append("Suspicious name pattern (test/fake name)")
        score += 25

    # 5. Duplicate detection (phone-based history)
    if phone:
        past = [o for o in wa_orders_db if o.get("phone") == phone]
        if past:
            cancelled = [o for o in past if o.get("status") == "cancelled"]
            confirmed = [o for o in past if o.get("status") == "confirmed"]
            total_prev = len(past)
            if cancelled:
                reasons.append(f"DUPLICATE: {len(cancelled)} previously cancelled order(s) from this number")
                score += weights["cancelled_history"] * len(cancelled)
            elif confirmed:
                reasons.append(f"Returning customer: {len(confirmed)} confirmed order(s) - Good history âœ…")
                score = max(0, score - 10)  # slight benefit for good history
            else:
                reasons.append(f"Number previously seen: {total_prev} order(s), status pending")
                score += 10

    # Final score clamped
    score = min(score, 100)
    if score >= 60:
        level = "High"
    elif score >= 30:
        level = "Medium"
    else:
        level = "Low"

    return {"score": score, "level": level, "reasons": reasons}


def fill_template(template: str, customer: dict, order_id: str, product_list: str) -> str:
    """Replace placeholders in a template with real values."""
    return (
        template
        .replace("{customer_name}", customer.get("name", "Customer"))
        .replace("{city}", customer.get("city", "your city"))
        .replace("{phone}", customer.get("phone", "N/A"))
        .replace("{order_id}", order_id)
        .replace("{product_list}", product_list or "your order")
    )


# ==========================================
# ðŸ“± WHATSAPP MANAGER ENDPOINTS
# ==========================================

@app.post("/api/wa/verify")
def wa_verify(data: WAVerifyRequest, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db = get_wa_db(user_id)
    """Core verification endpoint: parse, score, deduplicate, and log."""
    raw = data.rawText.strip()
    if not raw:
        raise HTTPException(status_code=400, detail="Input is empty")

    # --- Clean ---
    clean = re.sub(r'[\u0080-\uffff]', '', raw).strip()

    # --- Phone extraction ---
    phone_regex = re.compile(r'(?:\+92|0092|92|0)?(3[0-9]{2})[\s\-]?[0-9]{7}\b')
    all_phones = phone_regex.findall(clean)
    raw_phones = re.findall(r'(?:\+92|0092|92|0)?3[0-9]{9}', clean.replace(" ","").replace("-",""))
    phone_matches = re.findall(r'(?:\+92|0092|92|0)?(?:3[0-9]{9})', clean.replace(" ","").replace("-",""))

    original_phone_str = ""
    valid_phone = ""
    phone_status = "Missing"
    if phone_matches:
        raw_p = phone_matches[0]
        raw_p = re.sub(r'[^\d]', '', raw_p)
        if raw_p.startswith('92') and len(raw_p) == 12:
            raw_p = '0' + raw_p[2:]
        elif raw_p.startswith('0092'):
            raw_p = '0' + raw_p[4:]
        if len(raw_p) == 11 and raw_p.startswith('0'):
            valid_phone = raw_p
            original_phone_str = phone_matches[0]
        valid_prefixes = ['030','031','032','033','034','035','036','037','038','039']
        if re.search(r'(.)\1{5,}', valid_phone):
            phone_status = "Fake (Repeated Digits)"
        elif valid_phone[:3] not in valid_prefixes:
            phone_status = "Invalid Network"
        else:
            phone_status = "Valid Format"

    # --- Name extraction ---
    name = "Customer"
    label_match = re.search(r'(?:Name|Naam|Receiver)\s*[:\-\.]+\s*([a-zA-Z][a-zA-Z\s]{1,30})', clean, re.IGNORECASE)
    if label_match:
        name = label_match.group(1).strip()
    else:
        first_part = re.split(r',|03|\+92|\n', clean)[0].strip()
        is_addr = bool(re.search(r'House|Street|Gali|Mohallah|Town|Colony|Flat|Shop', first_part, re.IGNORECASE))
        if first_part and not is_addr and len(first_part) <= 25 and not re.search(r'\d', first_part):
            name = first_part

    # --- City detection ---
    cities = ["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta",
              "Sialkot","Gujranwala","Hyderabad","Bahawalpur","Sargodha","Sheikhupura","Rahim Yar Khan",
              "Gujrat","Sahiwal","Okara","Wah Cantt","Mardan","Mingora","Kasur","Dera Ghazi Khan",
              "Nawabshah","Jhang","Chiniot","Kamalia","Hafizabad","Sadiqabad","Burewala"]
    detected_city = next((c for c in cities if re.search(c, clean, re.IGNORECASE)), "Unknown City")

    # --- Address parsing ---
    addr_text = clean
    if original_phone_str:
        addr_text = addr_text.replace(original_phone_str, '')
    addr_text = re.sub(rf'\b{re.escape(name)}\b', '', addr_text, flags=re.IGNORECASE)
    addr_text = re.sub(r'(?:Name|Naam|Address|Pata|Phone|Mobile|Order)[:\-\s]+', ' ', addr_text, flags=re.IGNORECASE)
    addr_text = re.sub(r'\s+', ' ', addr_text).strip()
    clean_address = re.sub(re.escape(detected_city), '', addr_text, flags=re.IGNORECASE).strip(' ,')

    # --- WhatsApp link ---
    wa_number = f"92{valid_phone[1:]}" if valid_phone else ""
    wa_base = f"https://wa.me/{wa_number}" if wa_number else "#"

    # --- Duplicate detection ---
    past_orders = [o for o in wa_db["orders"] if o.get("phone") == valid_phone] if valid_phone else []
    cancelled_count = sum(1 for o in past_orders if o.get("status") == "cancelled")
    confirmed_count = sum(1 for o in past_orders if o.get("status") == "confirmed")

    # --- Risk assessment ---
    risk = wa_detect_risk(valid_phone, clean_address, detected_city, name, data.sellerProfile, wa_db["orders"])

    # --- Order ID ---
    order_id = f"ORD-2026-{wa_db['order_counter']:04d}"
    wa_db["order_counter"] += 1

    # --- Get seller templates ---
    profile = wa_db["seller_profiles"].get(data.sellerProfile, wa_db["seller_profiles"]["general"])
    templates = profile["default_templates"]

    customer = {"name": name, "phone": valid_phone, "city": detected_city, "address": clean_address}

    # --- Fill templates ---
    def make_wa_link(tpl_key):
        # Check user-saved templates first
        user_tpl = next((t for t in wa_db["templates"] if t.get("type") == tpl_key), None)
        tpl = user_tpl["content"] if user_tpl else templates.get(tpl_key, "")
        msg = fill_template(tpl, customer, order_id, data.productList)
        if wa_number:
            from urllib.parse import quote
            return f"https://wa.me/{wa_number}?text={quote(msg)}"
        return "#"

    messages = {
        "confirm": fill_template(templates.get("confirm", ""), customer, order_id, data.productList),
        "recheck": fill_template(templates.get("recheck", ""), customer, order_id, data.productList),
        "reminder": fill_template(templates.get("reminder", ""), customer, order_id, data.productList),
        "dispatch": fill_template(templates.get("dispatch", ""), customer, order_id, data.productList),
        "warning": fill_template(templates.get("warning", ""), customer, order_id, data.productList),
    }
    links = {
        "confirm": make_wa_link("confirm"),
        "recheck": make_wa_link("recheck"),
        "reminder": make_wa_link("reminder"),
        "dispatch": make_wa_link("dispatch"),
        "warning": make_wa_link("warning"),
        "waBase": wa_base,
    }

    # --- Log this order ---
    new_order = {
        "id": str(uuid.uuid4())[:8],
        "orderId": order_id,
        "name": name,
        "phone": valid_phone,
        "city": detected_city,
        "address": clean_address,
        "riskLevel": risk["level"],
        "riskScore": risk["score"],
        "status": "pending",
        "sellerProfile": data.sellerProfile,
        "createdAt": datetime.now().isoformat(),
    }
    wa_db["orders"].append(new_order)
    save_wa_db(user_id)

    return {
        "success": True,
        "data": {
            "customer": customer,
            "orderId": order_id,
            "internalId": new_order["id"],
            "verification": {
                "phoneStatus": phone_status,
                "riskLevel": risk["level"],
                "riskScore": risk["score"],
                "riskReasons": risk["reasons"],
            },
            "duplicateInfo": {
                "totalPrevious": len(past_orders),
                "confirmed": confirmed_count,
                "cancelled": cancelled_count,
            },
            "messages": messages,
            "links": links,
        }
    }


@app.get("/api/wa/dashboard")
def wa_dashboard(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db = get_wa_db(user_id)
    """Returns order history stats for the WhatsApp Manager dashboard."""
    orders = wa_db["orders"]
    total = len(orders)
    high_risk = sum(1 for o in orders if o.get("riskLevel") == "High")
    confirmed = sum(1 for o in orders if o.get("status") == "confirmed")
    cancelled = sum(1 for o in orders if o.get("status") == "cancelled")
    recent = sorted(orders, key=lambda x: x.get("createdAt", ""), reverse=True)[:20]
    return {
        "success": True,
        "stats": {
            "total": total,
            "highRisk": high_risk,
            "confirmed": confirmed,
            "cancelled": cancelled,
            "pending": total - confirmed - cancelled,
        },
        "recentOrders": recent
    }


@app.patch("/api/wa/orders/{order_id}/status")
def wa_update_order_status(order_id: str, data: WAOrderStatusUpdate, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db = get_wa_db(user_id)
    """Update the status of a verified WhatsApp order."""
    order = next((o for o in wa_db["orders"] if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="WA Order not found")
    order["status"] = data.status
    save_wa_db(user_id)
    return {"success": True}


@app.get("/api/wa/templates")
def wa_get_templates(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db = get_wa_db(user_id)
    return {"success": True, "templates": wa_db["templates"]}


@app.post("/api/wa/templates")
def wa_save_template(data: WATemplateInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db = get_wa_db(user_id)
    # Replace if same type exists
    wa_db["templates"] = [t for t in wa_db["templates"] if t.get("type") != data.type]
    wa_db["templates"].append({"id": str(uuid.uuid4())[:8], "name": data.name, "type": data.type, "content": data.content})
    save_wa_db(user_id)
    return {"success": True}


@app.delete("/api/wa/templates/{tpl_id}")
def wa_delete_template(tpl_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    wa_db = get_wa_db(user_id)
    wa_db["templates"] = [t for t in wa_db["templates"] if t["id"] != tpl_id]
    save_wa_db(user_id)
    return {"success": True}


# ==========================================
# ðŸ“ ENDPOINTS
# ==========================================

@app.get("/")
def home():
    return {"message": "ZipSellix Backend is Running ðŸš€"}

@app.get("/api/business/status")
def get_status(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    return {"isSetupComplete": db["profile"]["isSetupComplete"], "profile": db["profile"]}

@app.get("/api/profile")
def get_profile(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    return db["profile"]


@app.post("/api/shipping/calculate")
def calculate_shipping(data: ShippingCalcRequest, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    settings = db["profile"]["settings"]
    saved_rates = settings.get("courierRates", [])
    
    my_city = db["profile"].get("city", "").lower().strip()
    my_prov = db["profile"].get("province", "").lower().strip()
    
    # CASE INSENSITIVE EXACT MATCH FOR LIVE SHIPPING CALCULATION
    rate_info = next((r for r in saved_rates if r["name"].lower() == data.courier.lower()), None)
    if not rate_info:
        rate_info = {"sameCity": 0, "sameProv": 0, "crossProv": 0, "kg": 0}
    
    cust_city = data.city.lower().strip()
    cust_prov = data.province.lower().strip()
    
    base_rate = 0
    if cust_city == my_city and cust_city != "":
        base_rate = float(rate_info["sameCity"])
    elif cust_prov == my_prov and cust_prov != "":
        base_rate = float(rate_info["sameProv"])
    else:
        base_rate = float(rate_info["crossProv"])
        
    per_kg_rate = float(rate_info["kg"])
    actual_shipping_cost = base_rate + (max(0, data.weight - 0.5) * per_kg_rate)
    
    return {
        "shippingCost": actual_shipping_cost,
        "packagingCost": settings.get("packagingCost", 0)
    }

@app.post("/api/business/setup")
def save_setup(data: BusinessSetup, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    total_fixed = data.monthlyRent + data.monthlySalary + data.monthlyHosting + data.monthlyInternet
    rates_list = [r.dict() for r in data.courierRates]

    db["profile"].update({
        "isSetupComplete": True,
        "businessType": data.businessType, 
        "businessName": data.businessName,
        "ownerName": data.ownerName,
        "city": data.city,
        "province": data.province,
        "settings": {
            "monthlyRent": data.monthlyRent,
            "monthlySalary": data.monthlySalary,
            "monthlyHosting": data.monthlyHosting,
            "monthlyInternet": data.monthlyInternet,
            "monthlyFixedCost": total_fixed,
            "packagingCost": data.packagingCost,
            "courierRates": rates_list,
            "couriers": [r.name for r in data.courierRates],
            "channels": data.businessTypes,
            "logo": data.logo,
            "phone": data.phone,
            "address": data.address
        }
    })
    save_db(user_id)
    return {"success": True}

@app.delete("/api/business/reset")
def reset_business(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    db["profile"] = {"isSetupComplete": False, "businessType": "STOCK", "businessName": "", "ownerName": "", "settings": {}}
    db["products"] = []
    db["batches"] = []
    db["orders"] = []
    db["services"] = []
    db["documents"] = []
    db["shipments"] = []
    save_db(user_id)
    return {"success": True}

# --- DOCUMENT HISTORY ---
@app.get("/api/documents")
def get_documents(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    # Return documents without huge base64 payload to keep listing fast, metadata only
    docs_metadata = [
        {"id": d["id"], "type": d["type"], "ref": d["ref"], "date": d["date"], "format": d["format"]} 
        for d in db["documents"]
    ]
    return {"success": True, "documents": docs_metadata}

@app.get("/api/documents/{doc_id}")
def get_document_data(doc_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    doc = next((d for d in db["documents"] if d["id"] == doc_id), None)
    if not doc: raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True, "document": doc}

@app.post("/api/documents/add")
def add_document(data: DocumentInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    new_doc = {
        "id": str(uuid.uuid4())[:8],
        "type": data.type,
        "ref": data.ref or "Draft",
        "date": datetime.now().isoformat(),
        "format": data.format,
        "fileData": data.fileData
    }
    db["documents"].append(new_doc)
    save_db(user_id)
    return {"success": True, "id": new_doc["id"]}

@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    db["documents"] = [d for d in db["documents"] if d["id"] != doc_id]
    save_db(user_id)
    return {"success": True}

# --- CREATE SHIPMENT ENDPOINT (NEW) ---
@app.post("/api/shipments/create")
def create_shipment(data: ShipmentCreate, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    try:
        shipment_record = data.dict()
        shipment_record["id"] = str(uuid.uuid4())[:8]
        
        if not shipment_record.get("createdAt"):
            shipment_record["createdAt"] = datetime.now().isoformat()
            
        db["shipments"].append(shipment_record)
        save_db(user_id)
        
        return {
            "success": True, 
            "message": "Shipment created successfully", 
            "trackingNumber": data.trackingNumber,
            "status": data.shipmentStatus,
            "shipmentId": shipment_record["id"]
        }
    except Exception as e:
        print("Shipment Creation Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# --- WHATSAPP STORE BUILDER ---
@app.post("/api/store/save")
def save_store(data: StoreInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    """Save or update a WhatsApp store"""
    slug = data.username.lower().strip()
    if not slug:
        raise HTTPException(status_code=400, detail="Username is required")
    db["stores"][slug] = data.model_dump()
    save_db(user_id)
    return {"success": True, "url": f"/{slug}"}

@app.get("/api/store/{username}")
def get_store(username: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    """Get store by slug (scoped to user)"""
    store = db["stores"].get(username.lower())
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store

@app.get("/api/store/check/{username}")
def check_store(username: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    """Check if store slug is available"""
    exists = username.lower() in db["stores"]
    return {"exists": exists, "username": username}

# --- INVENTORY & SERVICES ---
@app.get("/api/inventory/products")
def get_products(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    for prod in db["products"]:
        stock = sum(b['remainingQty'] for b in db["batches"] if b['productId'] == prod['id'])
        prod['currentStock'] = stock
    # Filter out products marked as deleted
    return [p for p in db["products"] if not p.get("deleted", False)]

@app.post("/api/inventory/products/create")
def create_product(data: ProductInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    existing = next((p for p in db["products"] if p["name"].lower() == data.name.lower() and not p.get("deleted", False)), None)
    
    if existing:
        existing["sellingPrice"] = data.sellingPrice
        save_db(user_id)
        return existing
        
    new_prod = { "id": str(uuid.uuid4())[:8], "name": data.name, "sku": data.sku, "category": data.category, "sellingPrice": data.sellingPrice, "currentStock": 0 }
    db["products"].append(new_prod)
    save_db(user_id)
    return new_prod

@app.delete("/api/inventory/products/{product_id}")
def delete_product(product_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    product = next((p for p in db["products"] if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Soft delete: mark as deleted
    product["deleted"] = True
    save_db(user_id)
    return {"success": True}

@app.get("/api/inventory/batches")
def get_batches(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    result = []
    for b in db["batches"]:
        prod = next((p for p in db["products"] if p["id"] == b["productId"]), None)
        b_copy = b.copy()
        b_copy["productName"] = prod["name"] if prod else "Unknown"
        result.append(b_copy)
    return result

@app.post("/api/inventory/batches/add")
def add_batch(data: BatchInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    cost_per_item = data.totalCost / data.quantity if data.quantity > 0 else 0
    new_batch = {
        "id": str(uuid.uuid4())[:8], "productId": data.productId, "batchName": data.batchName, "date": data.date,
        "initialQty": data.quantity, "remainingQty": data.quantity, "costPerItem": cost_per_item, "totalCost": data.totalCost
    }
    db["batches"].append(new_batch)
    save_db(user_id)
    return {"success": True}

@app.delete("/api/inventory/batches/{batch_id}")
def delete_batch(batch_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    db["batches"] = [b for b in db["batches"] if b['id'] != batch_id]
    save_db(user_id)
    return {"success": True}

# ðŸ‘‡ YAHAN EDIT BATCH KA NAYA ENDPOINT ADD KIYA HAI ðŸ‘‡
@app.put("/api/inventory/batches/{batch_id}")
def edit_batch(batch_id: str, data: dict = Body(...), x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    batch_index = next((i for i, b in enumerate(db["batches"]) if b["id"] == batch_id), None)
    if batch_index is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    batch = db["batches"][batch_index]
    
    batch["batchName"] = data.get("batchName", batch["batchName"])
    batch["date"] = data.get("date", batch["date"])
    batch["initialQty"] = data.get("quantity", batch["initialQty"])
    batch["remainingQty"] = data.get("quantity", batch["remainingQty"])
    batch["costPerItem"] = data.get("baseCost", batch["costPerItem"])
    batch["totalCost"] = data.get("totalCost", batch["totalCost"])
    
    if "sellingPrice" in data:
        prod = next((p for p in db["products"] if p["id"] == batch["productId"]), None)
        if prod:
            prod["sellingPrice"] = data["sellingPrice"]
            
    save_db(user_id)
    return {"success": True}

@app.get("/api/services")
def get_services(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    return [s for s in db["services"] if not s.get("deleted", False)]

@app.post("/api/services/add")
def add_service(data: ServiceInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
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
    db = get_db(user_id)
    service = next((s for s in db["services"] if s["id"] == service_id), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Soft delete for consistency
    service["deleted"] = True
    save_db(user_id)
    return {"success": True}

# --- ORDERS & ANALYTICS ---
@app.get("/api/orders")
def get_orders(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    res = []
    for o in db["orders"]:
        enriched_items = []
        for item in o["items"]:
            prod = next((p for p in db["products"] if p["id"] == item["productId"]), None)
            if not prod:
                prod = next((s for s in db["services"] if s["id"] == item["productId"]), None)
            enriched_items.append({ **item, "productName": prod["name"] if prod else "Unknown" })
        o_copy = o.copy()
        o_copy["items"] = enriched_items
        res.append(o_copy)
    return res

@app.patch("/api/orders/{order_id}/status")
def update_order_status(order_id: str, data: OrderStatusUpdate, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    order = next((o for o in db["orders"] if o["id"] == order_id), None)
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    order["status"] = data.status
    save_db(user_id)
    return {"success": True}

@app.delete("/api/orders/{order_id}")
def delete_order(order_id: str, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    initial_len = len(db["orders"])
    db["orders"] = [o for o in db["orders"] if o["id"] != order_id]
    if len(db["orders"]) < initial_len:
        save_db(user_id)
        return {"success": True}
    raise HTTPException(status_code=404, detail="Order not found")

@app.put("/api/orders/{order_id}")
def edit_order(order_id: str, data: OrderInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    order_index = next((i for i, o in enumerate(db["orders"]) if o["id"] == order_id), None)
    if order_index is None:
        raise HTTPException(status_code=404, detail="Order not found")

    settings = db["profile"].get("settings", {})
    saved_rates = settings.get("courierRates", [])
    my_city = db["profile"].get("city", "").lower().strip()
    my_prov = db["profile"].get("province", "").lower().strip()

    rate_info = next((r for r in saved_rates if r["name"].lower() == data.courier.lower()), None)
    if not rate_info:
        rate_info = {"sameCity": 0, "sameProv": 0, "crossProv": 0, "kg": 0}

    cust_city = data.city.lower().strip()
    cust_prov = data.province.lower().strip()

    base_rate = 0
    if cust_city == my_city and cust_city != "":
        base_rate = float(rate_info.get("sameCity", 0))
    elif cust_prov == my_prov and cust_prov != "":
        base_rate = float(rate_info.get("sameProv", 0))
    else:
        base_rate = float(rate_info.get("crossProv", 0))

    per_kg_rate = float(rate_info.get("kg", 0))
    actual_shipping_cost = base_rate + (max(0, data.weight - 0.5) * per_kg_rate)

    shipping_charge = 0 if data.isFreeShipping else data.shippingCost
    pkg_cost = data.packagingCost

    items_total = sum(item.salePrice * item.quantity for item in data.items)
    final_amount = data.totalAmount if data.totalAmount > 0 else (items_total + shipping_charge + pkg_cost)

    existing_order = db["orders"][order_index]
    
    updated_order = {
        "id": existing_order["id"],
        "orderId": existing_order["orderId"],
        "customerName": data.customerName,
        "city": data.city,
        "province": data.province,
        "courier": data.courier,
        "weight": data.weight,
        "status": data.status,
        "paymentType": data.paymentType,
        "date": data.date,
        "isFreeShipping": data.isFreeShipping,
        "shippingCost": shipping_charge,
        "actualShippingCost": actual_shipping_cost,
        "packagingCost": pkg_cost,
        "itemsTotal": items_total,
        "totalAmount": final_amount,
        "items": [item.dict() for item in data.items]
    }
    
    db["orders"][order_index] = updated_order
    save_db(user_id)
    return {"success": True}

@app.post("/api/orders/add")
def add_order(data: OrderInput, x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    settings = db["profile"].get("settings", {})
    saved_rates = settings.get("courierRates", [])

    my_city = db["profile"].get("city", "").lower().strip()
    my_prov = db["profile"].get("province", "").lower().strip()

    rate_info = next((r for r in saved_rates if r["name"].lower() == data.courier.lower()), None)
    if not rate_info:
        rate_info = {"sameCity": 0, "sameProv": 0, "crossProv": 0, "kg": 0}

    cust_city = data.city.lower().strip()
    cust_prov = data.province.lower().strip()

    base_rate = 0
    if cust_city == my_city and cust_city != "":
        base_rate = float(rate_info.get("sameCity", 0))
    elif cust_prov == my_prov and cust_prov != "":
        base_rate = float(rate_info.get("sameProv", 0))
    else:
        base_rate = float(rate_info.get("crossProv", 0))

    per_kg_rate = float(rate_info.get("kg", 0))
    actual_shipping_cost = base_rate + (max(0, data.weight - 0.5) * per_kg_rate)

    shipping_charge = 0 if data.isFreeShipping else data.shippingCost
    pkg_cost = data.packagingCost

    items_total = sum(item.salePrice * item.quantity for item in data.items)
    
    final_amount = data.totalAmount if data.totalAmount > 0 else (items_total + shipping_charge + pkg_cost)

    new_order = {
        "id": str(uuid.uuid4())[:8], "orderId": f"ORD-{len(db['orders'])+1001}", "customerName": data.customerName,
        "city": data.city, "province": data.province, "courier": data.courier, "weight": data.weight,
        "status": data.status, "paymentType": data.paymentType, "date": data.date, "isFreeShipping": data.isFreeShipping,
        "shippingCost": shipping_charge, "actualShippingCost": actual_shipping_cost, "packagingCost": pkg_cost,
        "itemsTotal": items_total, "totalAmount": final_amount, "items": [item.dict() for item in data.items]
    }
    db["orders"].append(new_order)

    # Stock Deduction Logic
    for item in data.items:
        qty_needed = item.quantity
        product_batches = [b for b in db["batches"] if b['productId'] == item.productId and b['remainingQty'] > 0]
        if product_batches:
            product_batches.sort(key=lambda x: x['date'])
            for batch in product_batches:
                if qty_needed == 0: break
                if batch['remainingQty'] >= qty_needed:
                    batch['remainingQty'] -= qty_needed
                    qty_needed = 0
                else:
                    qty_needed -= batch['remainingQty']
                    batch['remainingQty'] = 0
            
    save_db(user_id)
    return {"success": True}

@app.get("/api/analytics")
def get_analytics(x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    today_str = datetime.now().strftime("%Y-%m-%d")
    total_sales_revenue = sum(o['totalAmount'] for o in db['orders'])
    today_sales = sum(o['totalAmount'] for o in db['orders'] if o['date'] == today_str)
    
    total_inventory_cost = sum(b['totalCost'] for b in db['batches'])
    current_stock_value = sum(b['remainingQty'] * b['costPerItem'] for b in db['batches'])
    cogs_stock = total_inventory_cost - current_stock_value
    
    fixed_monthly = db['profile']['settings'].get('monthlyFixedCost', 0)
    variable_shipping_packaging = sum((o.get('actualShippingCost', 0) + o.get('packagingCost', 0)) for o in db['orders'])
    
    total_expenses = fixed_monthly + cogs_stock + variable_shipping_packaging
    net_profit = total_sales_revenue - total_expenses

    low_stock_count = sum(1 for p in db["products"] if sum(b['remainingQty'] for b in db["batches"] if b['productId'] == p['id']) <= 3)

    chart_data = []
    for i in range(6, -1, -1):
        day = date.today() - timedelta(days=i)
        chart_data.append({ "date": day.strftime("%Y-%m-%d"), "day": day.strftime("%a"), "sales": sum(o['totalAmount'] for o in db['orders'] if o['date'] == day.strftime("%Y-%m-%d")) })

    return {
        "summary": { "todaySales": today_sales, "totalOrders": len(db['orders']), "totalExpenses": total_expenses, "netProfit": net_profit, "stockValue": current_stock_value, "lowStockCount": low_stock_count },
        "orders": get_orders(x_user_id), "chart": chart_data
    }


# ==========================================
# ðŸ“Š NEW: ADVANCED REPORTS ENDPOINT (For ReportsView.tsx)
# ==========================================
@app.get("/api/reports")
def get_reports(preset: str = "this-month", x_user_id: str = Header(None)):
    user_id = get_user_id(x_user_id)
    db = get_db(user_id)
    try:
        now = datetime.now()
        start_date = None
        end_date = now

        # 1. Date Range Logic
        if preset == "today":
            start_date = now.replace(hour=0, minute=0, second=0)
        elif preset == "yesterday":
            start_date = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0)
            end_date = start_date.replace(hour=23, minute=59, second=59)
        elif preset == "last-7-days":
            start_date = now - timedelta(days=6)
            start_date = start_date.replace(hour=0, minute=0, second=0)
        elif preset == "this-month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0)
        elif preset == "last-month":
            start_date = (now.replace(day=1) - timedelta(days=1)).replace(day=1, hour=0, minute=0, second=0)
            end_date = now.replace(day=1) - timedelta(seconds=1)
        elif preset == "last-3-months":
            month = now.month - 3
            year = now.year
            if month <= 0:
                month += 12
                year -= 1
            start_date = now.replace(year=year, month=month, day=1, hour=0, minute=0, second=0)
        else: # all-time
            start_date = datetime(2020, 1, 1)

        start_str = start_date.strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")

        # 2. Filter Orders
        filtered_orders = [
            o for o in db["orders"] 
            if start_str <= o["date"][:10] <= end_str and o["status"].upper() != "CANCELLED"
        ]

        # 3. Calculate Financials
        total_revenue = sum(o.get('totalAmount', 0) for o in filtered_orders)
        
        # Calculate Costs 
        total_product_cost = sum(o.get('itemsTotal', 0) for o in filtered_orders) # Using itemsTotal as proxy for COGS for now
        total_shipping = sum(o.get('actualShippingCost', 0) for o in filtered_orders)
        total_packaging = sum(o.get('packagingCost', 0) for o in filtered_orders)
        total_cost = total_product_cost + total_shipping + total_packaging
        
        total_expenses = db['profile']['settings'].get('monthlyFixedCost', 0)
        
        total_profit = total_revenue - total_cost - total_expenses
        profit_margin = round((total_profit / total_revenue) * 100, 1) if total_revenue > 0 else 0

        # 4. Status Breakdown
        status_counts = {}
        for o in filtered_orders:
            st = o["status"].upper()
            status_counts[st] = status_counts.get(st, 0) + 1
        
        total_orders = len(filtered_orders)
        orders_by_status = [
            {"status": k, "count": v, "percentage": round((v / total_orders) * 100, 1) if total_orders > 0 else 0} 
            for k, v in status_counts.items()
        ]

        # 5. Payment Split
        payment_counts = {}
        for o in filtered_orders:
            pt = o.get("paymentType", "COD").upper()
            payment_counts[pt] = payment_counts.get(pt, 0) + 1
        
        payment_split = [
            {"method": k, "count": v, "percentage": round((v / total_orders) * 100, 1) if total_orders > 0 else 0}
            for k, v in payment_counts.items()
        ]

        # 6. Sales By Day (Time-series)
        daily_map = {}
        for o in filtered_orders:
            d_key = o["date"][:10]
            if d_key not in daily_map:
                daily_map[d_key] = {"revenue": 0, "profit": 0, "orderCount": 0}
            
            daily_map[d_key]["revenue"] += o.get('totalAmount', 0)
            # Rough proxy for net profit per order
            o_cost = o.get('itemsTotal', 0) + o.get('actualShippingCost', 0) + o.get('packagingCost', 0)
            daily_map[d_key]["profit"] += (o.get('totalAmount', 0) - o_cost)
            daily_map[d_key]["orderCount"] += 1
            
        sales_by_day = [
            {"date": k, "revenue": v["revenue"], "profit": v["profit"], "orderCount": v["orderCount"]}
            for k, v in sorted(daily_map.items())
        ]

        # 7. Ledger
        ledger = []
        for o in sorted(filtered_orders, key=lambda x: x["date"], reverse=True)[:100]:
            o_cost = o.get('itemsTotal', 0) + o.get('actualShippingCost', 0) + o.get('packagingCost', 0)
            ledger.append({
                "id": o["orderId"],
                "date": o["date"],
                "customerName": o["customerName"],
                "city": o["city"],
                "revenue": o.get('totalAmount', 0),
                "cost": o_cost,
                "profit": o.get('totalAmount', 0) - o_cost,
                "status": o["status"],
                "paymentMethod": o.get("paymentType", "COD"),
                "productName": ", ".join([i.get("productName", "Item") for i in o.get("items", [])])
            })

        # Assemble Final Response
        return {
            "success": True,
            "data": {
                # ðŸ‘‡ YEH LINE ADD KI GAYI HAI WHITE-LABELING KE LIYE
                "businessProfile": {
                    "name": db["profile"].get("businessName", ""),
                    "logo": db["profile"].get("settings", {}).get("logo", "")
                },
                "dateRange": { "preset": preset, "start": start_str, "end": end_str },
                "summary": {
                    "totalRevenue": total_revenue,
                    "totalProfit": total_profit,
                    "totalCost": total_cost,
                    "totalExpenses": total_expenses,
                    "totalOrders": total_orders,
                    "avgOrderValue": round(total_revenue / total_orders, 0) if total_orders > 0 else 0,
                    "profitMargin": profit_margin,
                    "revenueGrowth": 0, # Simplified for local
                    "profitGrowth": 0,
                    "orderGrowth": 0
                },
                "ordersByStatus": orders_by_status,
                "paymentSplit": payment_split,
                "salesByDay": sales_by_day,
                "topProducts": [], # Can be expanded later
                "rto": {
                    "overallRate": 0, "codReturnRate": 0, "prepaidReturnRate": 0, "totalReturns": 0, "highRiskCities": []
                },
                "ledger": ledger,
                "insights": [],
                "generatedAt": datetime.now().isoformat()
            }
        }
    except Exception as e:
        print("Reports API Error:", e)
        return {"success": False, "error": str(e)}

# ==========================================
# ðŸŽ¨ 1. HIGH-QUALITY BACKGROUND REMOVER
# ==========================================
@app.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    """ Advanced Background Remover with Alpha Matting & ISNet Model """
    if not HAS_IMAGE_TOOLS:
        raise HTTPException(status_code=500, detail="Server Error: 'rembg' library not found.")

    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        
        # ðŸ‘‰ 1. E-commerce products ke liye best high-quality model
        my_session = new_session("isnet-general-use")
        
        # ðŸ‘‰ 2. Alpha Matting: Is se edges sharp rehte hain aur quality loss nahi hoti
        output = remove(
            image, 
            session=my_session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
            post_process_mask=True
        )
        
        img_byte_arr = io.BytesIO()
        # ðŸ‘‰ 3. Quality=100 taake original pixels maintain rahein
        output.save(img_byte_arr, format='PNG', quality=100)
        img_byte_arr.seek(0)
        
        return Response(content=img_byte_arr.getvalue(), media_type="image/png")
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="Failed to remove background")


# ==========================================
# ðŸŽ¨ 1b. APPLY NEW BACKGROUND (EDIT/REFINE)
# ==========================================
@app.post("/apply-background")
async def apply_background(
    file: UploadFile = File(...),
    bg_color: str = Form(None),
    bg_image_url: str = Form(None),
):
    """Composite the transparent foreground onto a solid color or template image."""
    if not HAS_IMAGE_TOOLS:
        raise HTTPException(status_code=500, detail="Image libraries missing.")

    try:
        content = await file.read()
        fg = Image.open(io.BytesIO(content)).convert("RGBA")

        if bg_image_url:
            # Fetch the template image
            import urllib.request
            bg_data = urllib.request.urlopen(bg_image_url).read()
            bg = Image.open(io.BytesIO(bg_data)).convert("RGBA")
            bg = bg.resize(fg.size, Image.LANCZOS)
        elif bg_color:
            hex_clean = bg_color.lstrip("#")
            r, g, b = int(hex_clean[0:2], 16), int(hex_clean[2:4], 16), int(hex_clean[4:6], 16)
            bg = Image.new("RGBA", fg.size, (r, g, b, 255))
        else:
            bg = Image.new("RGBA", fg.size, (255, 255, 255, 255))

        composite = Image.alpha_composite(bg, fg)

        buf = io.BytesIO()
        composite.save(buf, format="PNG", quality=100)
        buf.seek(0)

        return Response(content=buf.getvalue(), media_type="image/png")
    except Exception as e:
        print("Apply BG Error:", e)
        raise HTTPException(status_code=500, detail="Failed to apply background")


# ==========================================
# ðŸŽ¨ 1c. CUSTOM GRADIENT BACKGROUND
# ==========================================
@app.post("/apply-gradient")
async def apply_gradient(
    file: UploadFile = File(...),
    gradient_config: str = Form(...),
):
    """Composite foreground onto a custom multi-stop gradient (linear or radial)."""
    if not HAS_IMAGE_TOOLS:
        raise HTTPException(status_code=500, detail="Image libraries missing.")

    try:
        config = json.loads(gradient_config)
        stops = config.get("stops", [{"color": "#16A34A", "position": 0, "opacity": 1}, {"color": "#065F46", "position": 100, "opacity": 1}])
        angle = config.get("angle", 135)
        grad_type = config.get("type", "linear")

        content = await file.read()
        fg = Image.open(io.BytesIO(content)).convert("RGBA")
        w, h = fg.size

        # Build gradient image
        gradient = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        grad_arr = np.zeros((h, w, 4), dtype=np.uint8)

        # Parse stop colours
        parsed_stops = []
        for s in stops:
            hex_c = s["color"].lstrip("#")
            r, g, b = int(hex_c[0:2], 16), int(hex_c[2:4], 16), int(hex_c[4:6], 16)
            opacity = max(0, min(1, float(s.get("opacity", 1))))
            pos = max(0, min(1, float(s["position"]) / 100))
            parsed_stops.append((pos, r, g, b, int(opacity * 255)))

        parsed_stops.sort(key=lambda x: x[0])
        if not parsed_stops:
            parsed_stops = [(0, 22, 163, 74, 255), (1, 6, 95, 70, 255)]

        def lerp_color(t, stops_list):
            if t <= stops_list[0][0]:
                s = stops_list[0]
                return s[1], s[2], s[3], s[4]
            if t >= stops_list[-1][0]:
                s = stops_list[-1]
                return s[1], s[2], s[3], s[4]
            for i in range(len(stops_list) - 1):
                s0, s1 = stops_list[i], stops_list[i + 1]
                if s0[0] <= t <= s1[0]:
                    frac = (t - s0[0]) / max(s1[0] - s0[0], 0.001)
                    return (
                        int(s0[1] + (s1[1] - s0[1]) * frac),
                        int(s0[2] + (s1[2] - s0[2]) * frac),
                        int(s0[3] + (s1[3] - s0[3]) * frac),
                        int(s0[4] + (s1[4] - s0[4]) * frac),
                    )
            s = stops_list[-1]
            return s[1], s[2], s[3], s[4]

        import math
        if grad_type == "radial":
            cx, cy = w / 2, h / 2
            max_r = math.sqrt(cx ** 2 + cy ** 2)
            for y in range(h):
                for x in range(w):
                    dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
                    t = min(dist / max_r, 1.0)
                    grad_arr[y, x] = lerp_color(t, parsed_stops)
        else:
            rad = math.radians(angle)
            cos_a, sin_a = math.cos(rad), math.sin(rad)
            # Project each pixel onto the gradient direction line
            xs = np.arange(w, dtype=np.float64)
            ys = np.arange(h, dtype=np.float64)
            xx, yy = np.meshgrid(xs, ys)
            proj = xx * cos_a + yy * sin_a
            p_min, p_max = proj.min(), proj.max()
            if p_max - p_min < 0.001:
                t_map = np.zeros_like(proj)
            else:
                t_map = (proj - p_min) / (p_max - p_min)
            for y in range(h):
                for x in range(w):
                    grad_arr[y, x] = lerp_color(t_map[y, x], parsed_stops)

        gradient = Image.fromarray(grad_arr, "RGBA")
        composite = Image.alpha_composite(gradient, fg)

        buf = io.BytesIO()
        composite.save(buf, format="PNG", quality=100)
        buf.seek(0)
        return Response(content=buf.getvalue(), media_type="image/png")
    except Exception as e:
        print("Gradient Error:", e)
        raise HTTPException(status_code=500, detail="Failed to apply gradient")


# ==========================================
# ðŸŽ¨ 1d. PROFESSIONAL STUDIO TEMPLATES
# ==========================================
def _hex_to_rgb(hex_str: str):
    h = hex_str.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _create_shadow(fg_img: Image.Image, offset: int = 15, blur_radius: int = 25, opacity: int = 100):
    """Create a soft drop shadow from the alpha channel of fg."""
    from PIL import ImageFilter
    alpha = fg_img.split()[3]
    shadow = Image.new("RGBA", fg_img.size, (0, 0, 0, 0))
    shadow_layer = Image.new("L", fg_img.size, 0)
    shadow_layer.paste(alpha, (0, offset))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(blur_radius))
    shadow_arr = np.array(shadow_layer, dtype=np.float64)
    shadow_arr = np.clip(shadow_arr * (opacity / 255.0), 0, 255).astype(np.uint8)
    shadow.putalpha(Image.fromarray(shadow_arr))
    return shadow


def _create_reflection(fg_img: Image.Image, height_frac: float = 0.3, start_opacity: int = 80):
    """Create a mirrored reflection fading to transparent."""
    flipped = ImageOps.flip(fg_img)
    ref_h = int(fg_img.height * height_frac)
    flipped = flipped.crop((0, 0, flipped.width, ref_h))
    arr = np.array(flipped).copy()
    alpha = arr[:, :, 3].astype(np.float64)
    fade = np.linspace(start_opacity / 255.0, 0, ref_h).reshape(-1, 1)
    alpha *= fade
    arr[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def _build_linear_gradient_bg(size, color1, color2, vertical=True):
    """Simple two-color linear gradient background."""
    w, h = size
    arr = np.zeros((h, w, 4), dtype=np.uint8)
    r1, g1, b1 = _hex_to_rgb(color1)
    r2, g2, b2 = _hex_to_rgb(color2)
    for y in range(h):
        t = y / max(h - 1, 1) if vertical else 0
        arr[y, :, 0] = int(r1 + (r2 - r1) * t)
        arr[y, :, 1] = int(g1 + (g2 - g1) * t)
        arr[y, :, 2] = int(b1 + (b2 - b1) * t)
        arr[y, :, 3] = 255
    return Image.fromarray(arr, "RGBA")


def _center_fg_on_canvas(fg: Image.Image, canvas_size: tuple, scale: float = 0.65):
    """Scale and center the foreground on a canvas, leaving room for shadow/reflection."""
    cw, ch = canvas_size
    fw, fh = fg.size
    max_w, max_h = int(cw * scale), int(ch * scale)
    ratio = min(max_w / fw, max_h / fh)
    new_w, new_h = int(fw * ratio), int(fh * ratio)
    resized = fg.resize((new_w, new_h), Image.LANCZOS)
    # Place slightly above center to leave room for shadow/reflection below
    x = (cw - new_w) // 2
    y = int((ch - new_h) // 2 - ch * 0.03)
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    canvas.paste(resized, (x, max(0, y)), resized)
    return canvas


STUDIO_TEMPLATES_CONFIG = {
    "studio-spotlight": {
        "name": "Studio Spotlight",
        "bg_top": "#1a1a2e",
        "bg_bottom": "#16213e",
        "shadow_offset": 20,
        "shadow_blur": 35,
        "shadow_opacity": 130,
        "reflection": False,
    },
    "studio-surface": {
        "name": "Surface Reflection",
        "bg_top": "#f0f0f0",
        "bg_bottom": "#d4d4d4",
        "shadow_offset": 8,
        "shadow_blur": 15,
        "shadow_opacity": 60,
        "reflection": True,
    },
    "studio-gradient-warm": {
        "name": "Warm Gradient",
        "bg_top": "#fef3c7",
        "bg_bottom": "#f59e0b",
        "shadow_offset": 15,
        "shadow_blur": 25,
        "shadow_opacity": 80,
        "reflection": False,
    },
    "studio-gradient-cool": {
        "name": "Cool Gradient",
        "bg_top": "#e0f2fe",
        "bg_bottom": "#3b82f6",
        "shadow_offset": 15,
        "shadow_blur": 25,
        "shadow_opacity": 80,
        "reflection": False,
    },
    "studio-minimalist": {
        "name": "Minimalist White",
        "bg_top": "#ffffff",
        "bg_bottom": "#f5f5f5",
        "shadow_offset": 12,
        "shadow_blur": 30,
        "shadow_opacity": 50,
        "reflection": False,
    },
    "studio-luxury": {
        "name": "Luxury Dark",
        "bg_top": "#1f2937",
        "bg_bottom": "#111827",
        "shadow_offset": 18,
        "shadow_blur": 30,
        "shadow_opacity": 150,
        "reflection": True,
    },
    "studio-pastel": {
        "name": "Pastel Dream",
        "bg_top": "#fce7f3",
        "bg_bottom": "#ddd6fe",
        "shadow_offset": 12,
        "shadow_blur": 20,
        "shadow_opacity": 60,
        "reflection": False,
    },
    "studio-nature": {
        "name": "Natural Light",
        "bg_top": "#fffbeb",
        "bg_bottom": "#fef3c7",
        "shadow_offset": 10,
        "shadow_blur": 20,
        "shadow_opacity": 45,
        "reflection": False,
    },
}


@app.post("/apply-template")
async def apply_template(
    file: UploadFile = File(...),
    template_id: str = Form("studio-minimalist"),
):
    """Apply a professional studio-style template to the transparent foreground image."""
    if not HAS_IMAGE_TOOLS:
        raise HTTPException(status_code=500, detail="Image libraries missing.")

    tpl = STUDIO_TEMPLATES_CONFIG.get(template_id)
    if not tpl:
        raise HTTPException(status_code=400, detail=f"Unknown template: {template_id}")

    try:
        content = await file.read()
        fg = Image.open(io.BytesIO(content)).convert("RGBA")

        # Canvas: use original size or at least 1200px for professional look
        canvas_w = max(fg.width, 1200)
        canvas_h = max(fg.height, 1200)
        # Keep aspect ratio close to square for product shots
        canvas_size = (canvas_w, canvas_h)

        # 1. Background gradient
        bg = _build_linear_gradient_bg(canvas_size, tpl["bg_top"], tpl["bg_bottom"])

        # 2. Center and scale foreground
        fg_centered = _center_fg_on_canvas(fg, canvas_size, scale=0.60 if tpl["reflection"] else 0.65)

        # 3. Shadow
        shadow = _create_shadow(
            fg_centered,
            offset=tpl["shadow_offset"],
            blur_radius=tpl["shadow_blur"],
            opacity=tpl["shadow_opacity"]
        )

        # 4. Composite: bg -> shadow -> fg
        result = Image.alpha_composite(bg, shadow)
        result = Image.alpha_composite(result, fg_centered)

        # 5. Reflection (if enabled)
        if tpl.get("reflection"):
            ref = _create_reflection(fg_centered, height_frac=0.25, start_opacity=60)
            # Position reflection below the foreground
            # Find bottom of foreground content
            fg_arr = np.array(fg_centered)
            rows_with_content = np.where(fg_arr[:, :, 3] > 10)[0]
            if len(rows_with_content) > 0:
                fg_bottom = rows_with_content.max()
                ref_canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
                ref_y = min(fg_bottom + 2, canvas_h - ref.height)
                ref_x = (canvas_w - ref.width) // 2
                ref_canvas.paste(ref, (ref_x, ref_y), ref)
                result = Image.alpha_composite(result, ref_canvas)

        # Convert to RGB for final output (no alpha needed)
        final = result.convert("RGB")

        buf = io.BytesIO()
        final.save(buf, format="PNG", quality=100)
        buf.seek(0)
        return Response(content=buf.getvalue(), media_type="image/png")
    except Exception as e:
        print("Template Error:", e)
        raise HTTPException(status_code=500, detail="Failed to apply template")


# ==========================================
# âœï¸ 2. GROQ POWERED 10/10 SEO GENERATOR
# ==========================================

# ðŸ›‘ Yahan apni Groq API Key likhein (ya .env se get karein)
GROQ_API_KEY = "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"
groq_client = Groq(api_key=GROQ_API_KEY)

@app.post("/generate-seo")
def generate_seo_content(data: SeoRequest):
    """ Generates High-Quality SEO Content using Groq AI and Strict Rules """
    
    try:
        # Aapke diye gaye strict rules yahan hain (System Prompt)
        system_prompt = """You are an AI backend content engine for an e-commerce automation tool.
Your task is to build a complete, high-quality product backend that is ready for ranking, conversions, and trust.
Follow these rules strictly for every product, without exception.

1. Product Intent Enforcement: Never use a single-word product name alone. Always convert generic products into buyer-intent phrases. Examples: keyboard -> keyboard price in Pakistan.
2. Primary Keyword Generation: Auto-generate a strong commercial keyword using this format: [product name] price in Pakistan. Use this keyword consistently.
3. Title Generation: Start the title with the primary keyword. Add brand name at the end if available. Keep the title under 60 characters.
4. Slug Rules: Slug must include buying intent. Format: lowercase, hyphens only. Example: keyboard-price-in-pakistan
5. Meta Description: Maximum 155 characters. Include the primary keyword once. Mention Pakistan and Cash on Delivery. No filler phrases like "click here".
6. Product Description Rules: Length: 300â€“400 words. First paragraph must include the primary keyword naturally. Structure must include: Short intro, Why choose this product, Key features (bullets), Price and delivery in Pakistan. Use proper HTML tags (<h2>, <h3>, <p>, <ul>, <li>). Embed the internal and outbound links naturally within this HTML content.
7. Features Normalization: Clean and correct all feature spellings. Never combine multiple features in one line.
8. Internal Linking Logic: Include one category link and one collection link in the JSON array AND naturally in the HTML text.
9. Outbound Link Rule: Add only one outbound link. It must be informational (e.g., Wikipedia or tech blog). Embed it in the HTML text AND return in JSON.
10. Image Alt Text: Must include product name + one real feature. No filler words.
11. Secondary Keywords: Include these naturally: [product name] review, [product name] specs, buy online in Pakistan, best price in Pakistan.
12. FAQ Enforcement: Generate minimum 4 FAQs. One FAQ must include the primary keyword. Questions must reflect: Price, Originality, Delivery time, Cash on Delivery.

Output Format (Strict JSON ONLY. Do not explain. Do not comment):
{
  "seo_title": "",
  "focus_keyword": "",
  "slug": "",
  "meta_description": "",
  "product_description": "Valid HTML string here",
  "image_alt_text": "",
  "internal_links": ["/category/example", "/collections/sale"],
  "outbound_link": "https://example.com/informational",
  "secondary_keywords": ["kw1", "kw2", "kw3"],
  "faq_section": [
    {"question": "...", "answer": "..."}
  ]
}"""

        user_prompt = f"Product: {data.product_name}\nBrand: {data.brand_name}\nFeatures: {data.features}"

        # Groq API Call (JSON Mode Enable)
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile", # âœ… Yeh Groq ka sab se LATEST aur Smart model hai
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}, # ðŸ‘ˆ AI sirf JSON wapas karega
            temperature=0.2 # ðŸ‘ˆ Low temperature for strict rules
        )

        # AI ka response JSON format mein
        result_text = response.choices[0].message.content
        parsed_data = json.loads(result_text)

        # Frontend ko wapas bhej dain
        return {
            "success": True,
            "data": parsed_data
        }

    except Exception as e:
        print("Groq SEO Error:", e)
        return {"success": False, "error": "Failed to generate SEO from AI."}
# ==========================================
# ðŸ–¼ï¸ 3. IMAGE COMPRESSOR & UPSCALER
# ==========================================
@app.post("/api/compress")
async def compress_image(
    file: UploadFile = File(...),
    settings: str = Form(...),
    isPro: str = Form(...)
):
    """ Handles Image Compression, Resizing and Format Conversion """
    if not HAS_IMAGE_TOOLS:
        raise HTTPException(status_code=500, detail="Image libraries missing.")

    try:
        options = json.loads(settings) # Settings from frontend
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        
        # 1. Resize Logic
        if options['resizeMode'] == 'daraz':
            image = image.resize((1200, 1200), Image.LANCZOS)
        elif options['resizeMode'] == 'shopify':
            image = image.resize((2048, 2048), Image.LANCZOS)
        elif options['resizeMode'] == 'custom' and options['width'] and options['height']:
            image = image.resize((int(options['width']), int(options['height'])), Image.LANCZOS)
            
        # 2. Format Logic
        output_format = image.format if options['format'] == 'original' else options['format'].upper()
        if output_format == 'JPG': output_format = 'JPEG'
        
        # 3. Compression
        buffer = io.BytesIO()
        image.save(buffer, format=output_format, quality=int(options['quality']), optimize=True)
        
        # Return Base64 to Frontend
        encoded_img = base64.b64encode(buffer.getvalue()).decode('utf-8')
        mime_type = f"data:image/{output_format.lower()};base64,"
        
        return {
            "success": True,
            "data": {
                "image": mime_type + encoded_img,
                "compressedSize": buffer.getbuffer().nbytes
            }
        }

    except Exception as e:
        print("Compression Error:", e)
        return {"success": False, "error": str(e)}

# --- UPSCALER (If you want to use it later) ---
@app.post("/api/tools/upscale")
async def upscale_image(file: UploadFile = File(...)):
    """ Simple 2x Upscaler """
    if not HAS_IMAGE_TOOLS: return {"error": "Libraries missing"}
    
    content = await file.read()
    image = Image.open(io.BytesIO(content))
    
    new_size = (int(image.width * 2), int(image.height * 2))
    upscaled = image.resize(new_size, Image.BICUBIC) # Bicubic is better for upscaling than Lanczos
    
    buffer = io.BytesIO()
    upscaled.save(buffer, format="PNG")
    
    return Response(content=buffer.getvalue(), media_type="image/png")

# ==========================================
#     Admin Panel + SUPPORT (Feedback)
# ==========================================

# 👇 ADMIN EMAIL FIXTURE
ADMIN_EMAIL = "zipsellix@gmail.com"

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
        "id": str(uuid.uuid4())[:8],
        "userId": x_user_id, # 👈 Zaroori hai taake admin ko pata chale ticket kisne banaya
        "subject": data.subject,
        "description": data.description,
        "issueType": data.issueType,
        "attachment": data.attachment,
        "status": "OPEN", 
        "date": data.date
    }
    
    db["support_tickets"].append(new_ticket)
    save_db(x_user_id)
    return {"success": True, "ticketId": new_ticket["id"]}

@app.get("/api/support/my-tickets")
def get_my_tickets(x_user_id: str = Header(default="default_user")):
    """User ke apne tickets dekhne ke liye"""
    db = get_db(x_user_id)
    return {"success": True, "tickets": db.get("support_tickets", [])}

# 👇 NAYA SECURE ADMIN ENDPOINT
@app.get("/api/admin/all-tickets")
def get_all_tickets(x_user_id: str = Header(default="default_user")):
    """Sirf Admin (zipsellix@gmail.com) saari tickets dekh sakta hai"""
    
    if x_user_id != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Unauthorized Access. Only Admins can view this.")

    all_tickets = []
    # Loop through all user databases to collect tickets
    for user_id, db in DATABASES.items():
        user_tickets = db.get("support_tickets", [])
        all_tickets.extend(user_tickets)
        
    # Sort tickets by date (newest first)
    all_tickets.sort(key=lambda x: x.get("date", ""), reverse=True)
    
    return {"success": True, "tickets": all_tickets}

# 👇 TICKET STATUS UPDATE ENDPOINT
class TicketStatusUpdate(BaseModel):
    status: str # OPEN, IN_PROGRESS, RESOLVED
    userId: str # Ticket owner ki ID zaroori hai

@app.patch("/api/admin/tickets/{ticket_id}/status")
def update_ticket_status(ticket_id: str, data: TicketStatusUpdate, x_user_id: str = Header(default="default_user")):
    if x_user_id != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Unauthorized Access.")
        
    target_db = get_db(data.userId)
    tickets = target_db.get("support_tickets", [])
    
    for ticket in tickets:
        if ticket["id"] == ticket_id:
            ticket["status"] = data.status
            save_db(data.userId)
            return {"success": True}
            
    raise HTTPException(status_code=404, detail="Ticket not found")


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
