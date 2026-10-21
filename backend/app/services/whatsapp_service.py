import os
import urllib.parse
import requests
from backend.app.config import get_all_contacts

# Meta WhatsApp Cloud API config (optional environment variables)
META_WA_TOKEN = os.getenv("META_WA_TOKEN") or os.getenv("WHATSAPP_TOKEN")
META_PHONE_ID = os.getenv("META_PHONE_ID") or os.getenv("WHATSAPP_PHONE_NUMBER_ID")

# Twilio config (optional environment variables)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")


def _format_metric(val):
    if val is None or val == "":
        return "—"
    if isinstance(val, (int, float)):
        return f"{val:,}" if isinstance(val, int) else f"{val:.1f}"
    return str(val)


def _clean_phone(phone: str) -> str:
    """Format phone number into international format without symbols."""
    digits = "".join(filter(str.isdigit, str(phone)))
    if digits.startswith("0"):
        digits = digits[1:]
    # Default to India (+91) if 10 digits
    if len(digits) == 10:
        digits = "91" + digits
    return digits


def _get_val(d: dict, *keys, default="—"):
    """Fetch value by trying multiple possible keys (supports CamelCase & snake_case)."""
    if not isinstance(d, dict):
        return default
    for k in keys:
        if k in d and d[k] is not None and str(d[k]).strip() != "":
            return d[k]
    # Try lowercase match
    lower_map = {str(k).lower(): v for k, v in d.items()}
    for k in keys:
        if str(k).lower() in lower_map:
            val = lower_map[str(k).lower()]
            if val is not None and str(val).strip() != "":
                return val
    return default


def build_department_message(disaster_data: dict, dept_id: str, base_url: str = "") -> dict:
    """
    Construct a customized WhatsApp alert message for a given department or Central Command.
    Returns: { "recipient": ..., "phone": ..., "text": ..., "wa_link": ..., "pdf_url": ... }
    """
    contacts = get_all_contacts()
    contact_info = contacts.get(dept_id, {
        "name": dept_id.capitalize(),
        "phone": "917397071819",
        "icon": "🚨"
    })

    phone = _clean_phone(contact_info.get("phone", "917397071819"))
    disaster_id = disaster_data.get("id", "N/A")
    disaster_type = str(disaster_data.get("disaster_type", "Emergency")).upper()
    severity = str(disaster_data.get("ai_severity") or disaster_data.get("severity") or "HIGH").upper()
    city = disaster_data.get("city", "")
    state = disaster_data.get("state", "")
    location = f"{city}, {state}".strip(", ") or "Unknown Location"
    affected = _format_metric(disaster_data.get("affected_people", 0))

    prediction = disaster_data.get("Prediction") or disaster_data.get("prediction") or {}
    priority = prediction.get("Priority", severity)
    evacuation = prediction.get("Evacuation", "Active Evacuation in Progress")

    resources = disaster_data.get("Resources") or disaster_data.get("resources") or {}

    # Build PDF Link
    if dept_id == "central_command":
        pdf_url = f"{base_url}/api/disasters/{disaster_id}/pdf"
    else:
        pdf_url = f"{base_url}/api/disasters/{disaster_id}/pdf/{dept_id}"

    # 1. CENTRAL COMMAND / MASTER EOC
    if dept_id == "central_command":
        lines = [
            "🚨 *DISASTER COMMAND // MASTER INCIDENT ACTION PLAN (IAP)* 🚨",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} | *Type:* {disaster_type}",
            f"⚠️ *Severity:* {severity} | *Priority:* {priority}",
            f"🗺️ *Location:* {location}",
            f"👥 *Affected Persons:* {affected}",
            f"🚪 *Evacuation Directive:* {evacuation}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "📋 *COORDINATED 7-AGENCY DEPLOYMENT SUMMARY:*",
        ]

        food_res = resources.get("Food") or {}
        water_res = resources.get("Water") or {}
        shelter_res = resources.get("Shelter") or {}
        medical_res = resources.get("Medical") or {}
        rescue_res = resources.get("Rescue") or {}
        police_res = resources.get("Police") or {}
        trans_res = resources.get("Transport") or {}

        if food_res:
            pkts = _format_metric(_get_val(food_res, "FoodPackets", "required_food_packets"))
            mtype = _get_val(food_res, "MealType", "meal_type", default="Standard")
            lines.append(f"🍲 *Food Dept:* {pkts} packets ({mtype})")
        if water_res:
            liters = _format_metric(_get_val(water_res, "WaterBottles", "TotalWaterRequired_Liters", "water_liters_per_day", default=0))
            tankers = _get_val(water_res, "WaterTankers", "water_tankers", default=0)
            lines.append(f"💧 *Water Dept:* {liters} units/L | {tankers} tankers")
        if shelter_res:
            shelters = _get_val(shelter_res, "TemporaryShelters", "emergency_shelters", default=0)
            cap = _format_metric(_get_val(shelter_res, "TotalCapacity", "total_shelter_capacity", default=affected))
            lines.append(f"⛺ *Shelter Dept:* {shelters} shelters (Capacity: {cap})")
        if medical_res:
            amb = _get_val(medical_res, "Ambulances", "ambulances", default=0)
            doc = _get_val(medical_res, "Doctors", "doctors", default=0)
            param = _get_val(medical_res, "Paramedics", "paramedics", default=0)
            lines.append(f"🏥 *Medical Dept:* {amb} ambulances | {doc} doctors | {param} paramedics")
        if rescue_res:
            teams = _get_val(rescue_res, "NDRFTeams", "RescueTeams", "rescue_teams", default=2)
            boats = _get_val(rescue_res, "RescueBoats", "rescue_boats", default=0)
            chops = _get_val(rescue_res, "RescueHelicopters", "Helicopters", "helicopters", default=1)
            lines.append(f"🛟 *Rescue Dept:* {teams} teams | {boats} boats | {chops} choppers")
        if police_res:
            cops = _format_metric(_get_val(police_res, "PoliceOfficers", "PolicePersonnel", "police_personnel", default=20))
            patrols = _get_val(police_res, "TrafficPolice", "PatrolUnits", "patrol_units", default=5)
            posts = _get_val(police_res, "Barricades", "Checkpoints", "checkpoints", default=10)
            lines.append(f"🚓 *Police Dept:* {cops} officers | {patrols} traffic units | {posts} barricades")
        if trans_res:
            buses = _get_val(trans_res, "EvacuationBuses", "evacuation_buses", default=5)
            trucks = _get_val(trans_res, "ReliefTrucks", "SupplyTrucks", "relief_supply_trucks", default=3)
            lines.append(f"🚚 *Transport Dept:* {buses} buses | {trucks} relief supply trucks")

        lines.extend([
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Download Master PDF Report:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "✅ *Authorized by AI Multi-Agent Coordinator*",
            "Emergency Operations Center • Standby for field updates."
        ])

    # 2. FOOD DEPARTMENT
    elif dept_id == "food":
        food = resources.get("Food") or {}
        lines = [
            "🍲 *EMERGENCY ORDER: FOOD & CIVIL SUPPLIES* 🍲",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} ({disaster_type})",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Affected Persons:* {affected} | *Severity:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "📦 *RESOURCE ALLOCATION QUOTA:*",
            f"• *Meal Type:* {_get_val(food, 'MealType', 'meal_type', default='Prepared Packets')}",
            f"• *Meals Per Day:* {_get_val(food, 'MealsPerDay', 'meals_per_day', default=3)}",
            f"• *Required Food Packets:* {_format_metric(_get_val(food, 'FoodPackets', 'required_food_packets', default=0))}",
            f"• *Dry Ration Kits:* {_format_metric(_get_val(food, 'DryRationKits', 'dry_ration_kits', default=0))}",
            f"• *Baby Food Kits:* {_format_metric(_get_val(food, 'BabyFoodKits', 'baby_food_kits', default=0))}",
            f"• *Emergency Buffer Reserve:* {_format_metric(_get_val(food, 'EmergencyReserve', 'emergency_reserve_packets', default=0))} pkts",
            f"• *Distribution Centers:* {_get_val(food, 'DistributionCenters', 'distribution_centers', default=1)} centers",
            f"• *Supply Duration:* {_get_val(food, 'SupplyDurationDays', 'supply_duration_days', default=3)} days",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Download Official Action PDF:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *Directive:* Mobilize community kitchens & dispatch distribution vans immediately."
        ]

    # 3. WATER DEPARTMENT
    elif dept_id == "water":
        water = resources.get("Water") or {}
        lines = [
            "💧 *EMERGENCY ORDER: WATER & SANITATION BOARD* 💧",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} ({disaster_type})",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Affected Persons:* {affected} | *Severity:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🚰 *WATER ALLOCATION QUOTA:*",
            f"• *Water Requirement:* {_format_metric(_get_val(water, 'TotalWaterRequired_Liters', 'water_liters_per_day', default=0))} Liters/Day",
            f"• *Bottled Water Packs:* {_format_metric(_get_val(water, 'BottledWaterPacks', 'water_bottles', default=0))}",
            f"• *Water Tankers Needed:* {_get_val(water, 'WaterTankers', 'water_tankers', default=0)} units",
            f"• *Purification Units:* {_get_val(water, 'PurificationUnits', 'purification_units', default=0)} units",
            f"• *Water Storage Tanks:* {_get_val(water, 'WaterStorageTanks', 'storage_tanks', default=0)} units",
            f"• *Chlorine / Purification Tablets:* {_format_metric(_get_val(water, 'ChlorineTablets', 'purification_tablets', default=0))} tabs",
            f"• *Duration:* {_get_val(water, 'SupplyDurationDays', 'supply_duration_days', default=3)} days",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Download Official Action PDF:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *Directive:* Establish potable water tanks and begin chlorination / distribution."
        ]

    # 4. SHELTER DEPARTMENT
    elif dept_id == "shelter":
        shelter = resources.get("Shelter") or {}
        lines = [
            "⛺ *EMERGENCY ORDER: SHELTER & RELIEF CAMP MANAGEMENT* ⛺",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} ({disaster_type})",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Affected Persons:* {affected} | *Severity:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🏠 *SHELTER ALLOCATION QUOTA:*",
            f"• *Temporary Shelters:* {_get_val(shelter, 'TemporaryShelters', 'emergency_shelters', default=0)} facilities",
            f"• *Family Relief Tents:* {_format_metric(_get_val(shelter, 'FamilyTents', 'family_tents', default=0))} tents",
            f"• *Blankets & Bedding Sets:* {_format_metric(_get_val(shelter, 'Blankets', 'bedding_kits', default=0))} sets",
            f"• *Relief Mattresses:* {_format_metric(_get_val(shelter, 'Mattresses', 'mattresses', default=0))} units",
            f"• *First Aid Stations in Shelters:* {_get_val(shelter, 'FirstAidStations', 'first_aid_stations', default=0)} stations",
            f"• *Women Safety Zones:* {_get_val(shelter, 'WomenSafetyZones', 'women_safety_zones', default=0)} zones",
            f"• *Child Care Centers:* {_get_val(shelter, 'ChildCareCenters', 'child_care_centers', default=0)} hubs",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Download Official Action PDF:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *Directive:* Prepare high-ground stadiums, schools, and tents for intake."
        ]

    # 5. MEDICAL DEPARTMENT
    elif dept_id == "medical":
        medical = resources.get("Medical") or {}
        lines = [
            "🏥 *EMERGENCY ORDER: MEDICAL & HEALTH SERVICES* 🏥",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} ({disaster_type})",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Affected Persons:* {affected} | *Severity:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🩺 *MEDICAL DEPLOYMENT QUOTA:*",
            f"• *Emergency Physicians / Doctors:* {_get_val(medical, 'Doctors', 'doctors', default=0)} on-duty",
            f"• *Trained Paramedics / Nurses:* {_get_val(medical, 'Paramedics', 'paramedics', default=0)} personnel",
            f"• *BLS / ALS Ambulances:* {_get_val(medical, 'Ambulances', 'ambulances', default=0)} vehicles",
            f"• *First Aid Kits:* {_format_metric(_get_val(medical, 'FirstAidKits', 'emergency_medical_kits', default=0))} kits",
            f"• *Mobile Clinics:* {_get_val(medical, 'MobileClinics', 'mobile_medical_teams', default=0)} units",
            f"• *Temporary ICU Beds:* {_get_val(medical, 'TemporaryICUBeds', 'icu_beds', default=0)} beds",
            f"• *Anti-Venom Units:* {_get_val(medical, 'AntiVenomUnits', 'anti_venom', default=0)} doses",
            f"• *Trauma Stabilization Centers:* {_get_val(medical, 'TraumaCenters', 'triage_centers', default=0)} centers",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Download Official Action PDF:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *Directive:* Deploy mobile triage near staging zones. Hospital beds on code red."
        ]

    # 6. RESCUE DEPARTMENT
    elif dept_id == "rescue":
        rescue = resources.get("Rescue") or {}
        lines = [
            "🛟 *EMERGENCY ORDER: SEARCH & RESCUE (NDRF/SDRF)* 🛟",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} ({disaster_type})",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Affected Persons:* {affected} | *Severity:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🚁 *RESCUE MOBILIZATION QUOTA:*",
            f"• *Rescue Teams:* {_get_val(rescue, 'RescueTeams', 'rescue_teams', default=0)} teams",
            f"• *Search Personnel:* {_format_metric(_get_val(rescue, 'RescuePersonnel', 'rescue_personnel', default=0))} personnel",
            f"• *Motorized Rescue Inflatables/Boats:* {_get_val(rescue, 'RescueBoats', 'rescue_boats', default=0)} craft",
            f"• *Airlift Helicopters:* {_get_val(rescue, 'Helicopters', 'helicopters', default=0)} choppers",
            f"• *Aerial Recon Drones:* {_get_val(rescue, 'Drones', 'drones', default=0)} drones",
            f"• *Life Jackets Issued:* {_format_metric(_get_val(rescue, 'LifeJackets', 'life_jackets', default=0))} units",
            f"• *Emergency Diver Teams:* {_get_val(rescue, 'DiverTeams', 'diver_teams', default=0)} teams",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Download Official Action PDF:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *Directive:* Initiate deep search and perimeter extraction operations."
        ]

    # 7. POLICE DEPARTMENT
    elif dept_id == "police":
        police = resources.get("Police") or {}
        lines = [
            "🚓 *EMERGENCY ORDER: POLICE & SECURITY CORPS* 🚓",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} ({disaster_type})",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Affected Persons:* {affected} | *Severity:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🛡️ *SECURITY & LAW ENFORCEMENT QUOTA:*",
            f"• *Police Officers Deployed:* {_format_metric(_get_val(police, 'PolicePersonnel', 'police_personnel', default=0))} personnel",
            f"• *Mobile Patrol Cruisers:* {_get_val(police, 'PatrolUnits', 'patrol_units', default=0)} units",
            f"• *Security Checkpoints:* {_get_val(police, 'Checkpoints', 'checkpoints', default=0)} checkpoints",
            f"• *Crowd Control Teams:* {_get_val(police, 'CrowdControlTeams', 'traffic_control_teams', default=0)} teams",
            f"• *Traffic Control Units:* {_get_val(police, 'TrafficControlUnits', 'traffic_units', default=0)} units",
            f"• *Evacuation Escort Squads:* {_get_val(police, 'EvacuationEscortTeams', 'escort_teams', default=0)} squads",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Download Official Action PDF:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *Directive:* Lock outer perimeter, secure relief storehouses, escort ambulance convoys."
        ]

    # 8. TRANSPORT DEPARTMENT
    elif dept_id == "transport":
        trans = resources.get("Transport") or {}
        lines = [
            "🚚 *EMERGENCY ORDER: LOGISTICS & TRANSPORT FLEET* 🚚",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} ({disaster_type})",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Affected Persons:* {affected} | *Severity:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🚛 *TRANSPORT FLEET QUOTA:*",
            f"• *Evacuation Passenger Buses:* {_get_val(trans, 'EvacuationBuses', 'evacuation_buses', default=0)} buses",
            f"• *Relief Supply Cargo Trucks:* {_get_val(trans, 'SupplyTrucks', 'relief_supply_trucks', default=0)} trucks",
            f"• *4x4 Off-Road All-Terrain Vehicles:* {_get_val(trans, 'OffRoadVehicles', 'offroad_vehicles', default=0)} vehicles",
            f"• *Fuel Supply Tankers:* {_get_val(trans, 'FuelTankers', 'fuel_tankers', default=0)} tankers",
            f"• *Logistics Staging Hubs:* {_get_val(trans, 'LogisticsHubs', 'logistics_hubs', default=0)} hubs",
            f"• *Transit Green Corridors:* {_get_val(trans, 'GreenCorridors', 'priority_corridors', default=0)} corridors",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Download Official Action PDF:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *Directive:* Position fleet at primary evacuation nodes and replenish vehicle reserves."
        ]

    else:
        lines = [
            f"🚨 *DISASTER ALERT — INCIDENT #{disaster_id}* 🚨",
            f"Location: {location} | Type: {disaster_type} | Severity: {severity}",
            f"PDF: {pdf_url}"
        ]

    message_text = "\n".join(lines)
    encoded_text = urllib.parse.quote(message_text)
    wa_link = f"https://wa.me/{phone}?text={encoded_text}"

    return {
        "dept_id": dept_id,
        "dept_name": contact_info.get("name", dept_id),
        "department": contact_info.get("department", dept_id),
        "phone": phone,
        "formatted_phone": f"+{phone[:2]} {phone[2:7]} {phone[7:]}" if len(phone) >= 10 else phone,
        "role": contact_info.get("role", ""),
        "icon": contact_info.get("icon", "🚨"),
        "message_text": message_text,
        "wa_link": wa_link,
        "pdf_url": pdf_url
    }


def prepare_all_notifications(disaster_data: dict, base_url: str = "") -> dict:
    """
    Prepare complete notification suite for Central Command + 7 specialized departments.
    """
    ordered_depts = [
        "central_command",
        "food",
        "water",
        "shelter",
        "medical",
        "rescue",
        "police",
        "transport"
    ]

    notifications = {}
    for d_id in ordered_depts:
        notifications[d_id] = build_department_message(disaster_data, d_id, base_url)

    return {
        "incident_id": disaster_data.get("id"),
        "disaster_type": disaster_data.get("disaster_type"),
        "ai_severity": disaster_data.get("ai_severity") or disaster_data.get("severity"),
        "total_channels": len(ordered_depts),
        "channels": notifications
    }


def send_whatsapp_alert(phone: str, text: str) -> dict:
    """
    Dispatch WhatsApp message through API if credentials exist,
    otherwise returns a simulated success payload with instant wa.me link.
    """
    clean_num = _clean_phone(phone)
    encoded = urllib.parse.quote(text)
    wa_direct_url = f"https://wa.me/{clean_num}?text={encoded}"

    # Try Meta WhatsApp Cloud API if configured
    if META_WA_TOKEN and META_PHONE_ID:
        try:
            url = f"https://graph.facebook.com/v18.0/{META_PHONE_ID}/messages"
            headers = {
                "Authorization": f"Bearer {META_WA_TOKEN}",
                "Content-Type": "application/json"
            }
            payload = {
                "messaging_product": "whatsapp",
                "to": clean_num,
                "type": "text",
                "text": {"body": text}
            }
            res = requests.post(url, headers=headers, json=payload, timeout=10)
            if res.status_code in [200, 201]:
                return {
                    "success": True,
                    "channel": "META_WHATSAPP_CLOUD_API",
                    "status": "DELIVERED",
                    "response": res.json(),
                    "wa_direct_url": wa_direct_url
                }
            else:
                return {
                    "success": False,
                    "channel": "META_WHATSAPP_CLOUD_API",
                    "status": "API_ERROR",
                    "error": res.text,
                    "wa_direct_url": wa_direct_url
                }
        except Exception as e:
            pass

    # Try Twilio if configured
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
            data = {
                "From": TWILIO_WHATSAPP_FROM,
                "To": f"whatsapp:+{clean_num}",
                "Body": text
            }
            res = requests.post(
                url,
                data=data,
                auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
                timeout=10
            )
            if res.status_code in [200, 201]:
                return {
                    "success": True,
                    "channel": "TWILIO_WHATSAPP_API",
                    "status": "DELIVERED",
                    "response": res.json(),
                    "wa_direct_url": wa_direct_url
                }
        except Exception:
            pass

    # Default: One-click direct dispatch mode
    return {
        "success": True,
        "channel": "DIRECT_WHATSAPP_DISPATCH",
        "status": "READY_FOR_DIRECT_DISPATCH",
        "message": f"Pre-filled WhatsApp message ready for +{clean_num}",
        "wa_direct_url": wa_direct_url
    }
