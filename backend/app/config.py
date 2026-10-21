import os
from dotenv import load_dotenv

load_dotenv()

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

# In-memory contacts store (initialized with defaults, modifiable at runtime)
CONTACTS_STORE = {k: dict(v) for k, v in DEFAULT_CONTACTS.items()}


def get_all_contacts():
    """Return dictionary of all registered department contacts."""
    return CONTACTS_STORE


def update_contact_phone(contact_id: str, new_phone: str):
    """Update phone number for a given department contact."""
    clean_phone = "".join(filter(str.isdigit, str(new_phone)))
    if contact_id in CONTACTS_STORE:
        CONTACTS_STORE[contact_id]["phone"] = clean_phone
        return CONTACTS_STORE[contact_id]
    return None
