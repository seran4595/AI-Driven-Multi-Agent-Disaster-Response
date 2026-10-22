import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ==========================================================
# DEFAULT RECIPIENTS (Supplied for Disaster Response Teams)
# ==========================================================
# 1, 5: +91 7397071819 (Central Command EOC & Medical)
# 2, 3, 4: +91 8015808283 (Food, Water, Shelter)
# 6, 7, 8: +91 9500330279 (Rescue, Police, Transport)

DEFAULT_CONTACTS = {
    "central_command": {
        "id": "central_command",
        "name": "Central Command (Master EOC)",
        "department": "National Emergency Operations Center",
        "phone": os.getenv("WHATSAPP_CENTRAL_COMMAND", "917397071819"),
        "role": "Master Incident Coordination & Oversight",
        "icon": "🏢"
    },
    "food": {
        "id": "food",
        "name": "Food & Civil Supplies Department",
        "department": "Food",
        "phone": os.getenv("WHATSAPP_FOOD_DEPT", "918015808283"),
        "role": "Ration, Meal Packets & Community Kitchens",
        "icon": "🍲"
    },
    "water": {
        "id": "water",
        "name": "Water Supply & Sanitation Board",
        "department": "Water",
        "phone": os.getenv("WHATSAPP_WATER_DEPT", "918015808283"),
        "role": "Drinking Water, Tankers & Purification",
        "icon": "💧"
    },
    "shelter": {
        "id": "shelter",
        "name": "Shelter & Relief Camp Management",
        "department": "Shelter",
        "phone": os.getenv("WHATSAPP_SHELTER_DEPT", "918015808283"),
        "role": "Emergency Tents, Relief Camps & Bedding",
        "icon": "⛺"
    },
    "medical": {
        "id": "medical",
        "name": "Emergency Medical & Health Services",
        "department": "Medical",
        "phone": os.getenv("WHATSAPP_MEDICAL_DEPT", "917397071819"),
        "role": "Ambulances, Triage, Field Hospitals & Meds",
        "icon": "🏥"
    },
    "rescue": {
        "id": "rescue",
        "name": "Search & Rescue Authority (NDRF/SDRF)",
        "department": "Rescue",
        "phone": os.getenv("WHATSAPP_RESCUE_DEPT", "919500330279"),
        "role": "Evacuation Teams, Boats, Choppers & Gear",
        "icon": "🛟"
    },
    "police": {
        "id": "police",
        "name": "Police & Perimeter Security Control",
        "department": "Police",
        "phone": os.getenv("WHATSAPP_POLICE_DEPT", "919500330279"),
        "role": "Law & Order, Checkpoints & Green Corridors",
        "icon": "🚓"
    },
    "transport": {
        "id": "transport",
        "name": "Logistics & Transport Department",
        "department": "Transport",
        "phone": os.getenv("WHATSAPP_TRANSPORT_DEPT", "919500330279"),
        "role": "Evacuation Buses, Supply Trucks & Fleet",
        "icon": "🚚"
    }
}

import json

CONTACTS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data",
    "contacts.json"
)

def _load_contacts_store():
    store = {k: dict(v) for k, v in DEFAULT_CONTACTS.items()}
    if os.path.exists(CONTACTS_FILE):
        try:
            with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                for k, v in saved.items():
                    if k in store and isinstance(v, dict):
                        store[k].update(v)
        except Exception as e:
            print("Notice: Error reading contacts.json:", e)
    return store

# Active contacts store (loaded from disk if available, initialized with defaults)
CONTACTS_STORE = _load_contacts_store()


def get_all_contacts():
    """Return dictionary of all registered department contacts."""
    return CONTACTS_STORE


def update_contact_phone(contact_id: str, new_phone: str):
    """Update phone number for a given department contact and persist to disk."""
    clean_phone = "".join(filter(str.isdigit, str(new_phone)))
    if clean_phone.startswith("0"):
        clean_phone = clean_phone[1:]
    if len(clean_phone) == 10:
        clean_phone = "91" + clean_phone

    if contact_id in CONTACTS_STORE:
        CONTACTS_STORE[contact_id]["phone"] = clean_phone
        try:
            os.makedirs(os.path.dirname(CONTACTS_FILE), exist_ok=True)
            with open(CONTACTS_FILE, "w", encoding="utf-8") as f:
                json.dump(CONTACTS_STORE, f, indent=2)
        except Exception as e:
            print("Notice: Error persisting contacts.json:", e)
        return CONTACTS_STORE[contact_id]
    return None

