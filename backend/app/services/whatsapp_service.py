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
    OPTION 1 (Print in WhatsApp):
      - Prints full official Action Plan & exact resource allocation quotas directly in WhatsApp text.
      - Includes direct Live GPS Touch Navigation link (Google Maps).
      - Strict ZERO question marks in notification text.
      - Official NDMA / EOC authoritative tone.
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
    location = f"{city}, {state}".strip(", ") or "Emergency Coordinates"
    affected = _format_metric(disaster_data.get("affected_people", 0))

    latitude = disaster_data.get("latitude")
    longitude = disaster_data.get("longitude")

    # Build Google Maps Direct Touch Navigation Link (Zero question marks in URL)
    if latitude is not None and longitude is not None:
        try:
            lat_f = float(latitude)
            lng_f = float(longitude)
            maps_link = f"https://www.google.com/maps/place/{lat_f:.6f},{lng_f:.6f}"
        except (ValueError, TypeError):
            maps_link = f"https://www.google.com/maps/search/{urllib.parse.quote(location)}"
    else:
        maps_link = f"https://www.google.com/maps/search/{urllib.parse.quote(location)}"

    prediction = disaster_data.get("Prediction") or disaster_data.get("prediction") or {}
    priority = prediction.get("Priority", severity)
    evacuation = prediction.get("Evacuation", "Active Evacuation in Progress")

    resources = disaster_data.get("Resources") or disaster_data.get("resources") or {}

    # Build PDF Link for optional formal documentation
    if dept_id == "central_command":
        pdf_url = f"{base_url}/api/disasters/{disaster_id}/pdf"
    else:
        pdf_url = f"{base_url}/api/disasters/{disaster_id}/pdf/{dept_id}"

    # 1. CENTRAL COMMAND / MASTER EOC (Phone: +91 7397071819)
    if dept_id == "central_command":
        lines = [
            "🚨 *DISASTER COMMAND // MASTER INCIDENT ACTION PLAN (IAP)* 🚨",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} | *Hazard:* {disaster_type}",
            f"⚠️ *Severity Assessment:* {severity}",
            f"⚡ *Response Priority:* {priority}",
            f"🗺️ *Disaster Location:* {location}",
            f"👥 *Total Affected Population:* {affected}",
            f"🚪 *Evacuation Directive:* {evacuation}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🧭 *LIVE GPS NAVIGATION (TOUCH TO NAVIGATE TO SCENE):*",
            f"{maps_link}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "📋 *COORDINATED 7-AGENCY RESOURCE ALLOCATION SUMMARY:*",
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
            days = _get_val(food_res, "SupplyDurationDays", "supply_duration_days", default=3)
            lines.append(f"🍲 *Food Dept:* {pkts} packets ({mtype}) for {days} days")
        if water_res:
            liters = _format_metric(_get_val(water_res, "TotalWaterRequired_Liters", "water_liters_per_day", "WaterBottles", default=0))
            tankers = _get_val(water_res, "WaterTankers", "water_tankers", default=0)
            lines.append(f"💧 *Water Dept:* {liters} L per day | {tankers} tankers")
        if shelter_res:
            shelters = _get_val(shelter_res, "TemporaryShelters", "emergency_shelters", default=0)
            tents = _format_metric(_get_val(shelter_res, "FamilyTents", "family_tents", default=0))
            lines.append(f"⛺ *Shelter Dept:* {shelters} relief centers | {tents} tents")
        if medical_res:
            amb = _get_val(medical_res, "Ambulances", "ambulances", default=0)
            doc = _get_val(medical_res, "Doctors", "doctors", default=0)
            param = _get_val(medical_res, "Paramedics", "paramedics", default=0)
            lines.append(f"🏥 *Medical Dept:* {amb} ambulances | {doc} doctors | {param} paramedics")
        if rescue_res:
            teams = _get_val(rescue_res, "NDRFTeams", "RescueTeams", "rescue_teams", default=2)
            boats = _get_val(rescue_res, "RescueBoats", "rescue_boats", default=0)
            chops = _get_val(rescue_res, "RescueHelicopters", "Helicopters", "helicopters", default=1)
            lines.append(f"🛟 *Rescue Dept:* {teams} NDRF squads | {boats} boats | {chops} choppers")
        if police_res:
            cops = _format_metric(_get_val(police_res, "PoliceOfficers", "PolicePersonnel", "police_personnel", default=20))
            patrols = _get_val(police_res, "TrafficPolice", "PatrolUnits", "patrol_units", default=5)
            posts = _get_val(police_res, "Barricades", "Checkpoints", "checkpoints", default=10)
            lines.append(f"🚓 *Police Dept:* {cops} officers | {patrols} patrol units | {posts} checkpoints")
        if trans_res:
            buses = _get_val(trans_res, "EvacuationBuses", "evacuation_buses", default=5)
            trucks = _get_val(trans_res, "ReliefTrucks", "SupplyTrucks", "relief_supply_trucks", default=3)
            lines.append(f"🚚 *Transport Dept:* {buses} evacuation buses | {trucks} cargo supply trucks")

        lines.extend([
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🛡️ *OPERATIONAL COMMAND DIRECTIVE:*",
            "All agency heads maintain radio liaison with Master EOC.",
            "Establish secondary staging areas outside the primary impact hazard radius.",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Formal Master PDF Action Report Reference:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "✅ *Authorized by AI Multi-Agent Incident Commander*",
            "National Emergency Operations Center • Operational 24x7"
        ])

    # 2. FOOD DEPARTMENT (Phone: +91 8015808283)
    elif dept_id == "food":
        food = resources.get("Food") or {}
        lines = [
            "🍲 *EMERGENCY ORDER: FOOD & CIVIL SUPPLIES DEPARTMENT* 🍲",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} | *Hazard:* {disaster_type}",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Affected Citizens to Sustain:* {affected}",
            f"⚠️ *Incident Severity Level:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🧭 *LIVE GPS NAVIGATION (TOUCH TO NAVIGATE TO SCENE):*",
            f"{maps_link}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "📦 *RESOURCE ALLOCATION QUOTA (OFFICIAL DIRECTIVE):*",
            f"• *Meal Classification:* {_get_val(food, 'MealType', 'meal_type', default='Ready-To-Eat Emergency Packets')}",
            f"• *Ration Frequency:* {_get_val(food, 'MealsPerDay', 'meals_per_day', default=3)} meals per day",
            f"• *Total Food Packets Allocated:* {_format_metric(_get_val(food, 'FoodPackets', 'required_food_packets', default=0))} packets",
            f"• *Dry Ration Family Packs:* {_format_metric(_get_val(food, 'DryRationKits', 'dry_ration_kits', default=0))} kits",
            f"• *Infant and Baby Nutrition Kits:* {_format_metric(_get_val(food, 'BabyFoodKits', 'baby_food_kits', default=0))} kits",
            f"• *Emergency Buffer Reserve:* {_format_metric(_get_val(food, 'EmergencyReserve', 'emergency_reserve_packets', default=0))} packets",
            f"• *Authorized Distribution Counters:* {_get_val(food, 'DistributionCenters', 'distribution_centers', default=1)} centers",
            f"• *Mandated Supply Operational Window:* {_get_val(food, 'SupplyDurationDays', 'supply_duration_days', default=3)} continuous days",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *FIELD EXECUTION PROTOCOL:*",
            "1. Mobilize community kitchens in adjacent unaffected sectors.",
            "2. Dispatch food cargo fleet to authorized distribution hubs.",
            "3. Enforce priority queues for elderly, pregnant women, and children.",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Official Department Action PDF Reference:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "✅ *Authorized by National Emergency Operations Center*",
            "Food & Civil Supplies Disaster Cell • Immediate Deployment"
        ]

    # 3. WATER DEPARTMENT (Phone: +91 8015808283)
    elif dept_id == "water":
        water = resources.get("Water") or {}
        lines = [
            "💧 *EMERGENCY ORDER: WATER SUPPLY & SANITATION BOARD* 💧",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} | *Hazard:* {disaster_type}",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Affected Citizens to Supply:* {affected}",
            f"⚠️ *Incident Severity Level:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🧭 *LIVE GPS NAVIGATION (TOUCH TO NAVIGATE TO SCENE):*",
            f"{maps_link}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🚰 *RESOURCE ALLOCATION QUOTA (OFFICIAL DIRECTIVE):*",
            f"• *Potable Water Requirement:* {_format_metric(_get_val(water, 'TotalWaterRequired_Liters', 'water_liters_per_day', default=0))} Liters per Day",
            f"• *Packaged Drinking Water Packs:* {_format_metric(_get_val(water, 'BottledWaterPacks', 'water_bottles', default=0))} packs",
            f"• *Heavy Water Tankers Deployed:* {_get_val(water, 'WaterTankers', 'water_tankers', default=0)} vehicle units",
            f"• *Mobile Purification Plants:* {_get_val(water, 'PurificationUnits', 'purification_units', default=0)} filtration units",
            f"• *Emergency Static Storage Tanks:* {_get_val(water, 'WaterStorageTanks', 'storage_tanks', default=0)} tanks",
            f"• *Water Purification Chlorine Tablets:* {_format_metric(_get_val(water, 'ChlorineTablets', 'purification_tablets', default=0))} tablets",
            f"• *Operation Window:* {_get_val(water, 'SupplyDurationDays', 'supply_duration_days', default=3)} continuous days",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *FIELD EXECUTION PROTOCOL:*",
            "1. Position tankers at relief camps and high density civilian shelters.",
            "2. Start chlorination treatment and field testing of all water supplies.",
            "3. Prevent waterborne epidemics by sanitizing surrounding drain networks.",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Official Department Action PDF Reference:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "✅ *Authorized by National Emergency Operations Center*",
            "Water Supply & Sanitation Emergency Desk • Immediate Deployment"
        ]

    # 4. SHELTER DEPARTMENT (Phone: +91 8015808283)
    elif dept_id == "shelter":
        shelter = resources.get("Shelter") or {}
        lines = [
            "⛺ *EMERGENCY ORDER: SHELTER & RELIEF CAMP MANAGEMENT* ⛺",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} | *Hazard:* {disaster_type}",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Citizens Requiring Immediate Shelter:* {affected}",
            f"⚠️ *Incident Severity Level:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🧭 *LIVE GPS NAVIGATION (TOUCH TO NAVIGATE TO SCENE):*",
            f"{maps_link}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🏠 *RESOURCE ALLOCATION QUOTA (OFFICIAL DIRECTIVE):*",
            f"• *Designated Relief Camp Facilities:* {_get_val(shelter, 'TemporaryShelters', 'emergency_shelters', default=0)} facilities",
            f"• *High-Durability Family Relief Tents:* {_format_metric(_get_val(shelter, 'FamilyTents', 'family_tents', default=0))} tents",
            f"• *Bedding and Blanket Ensembles:* {_format_metric(_get_val(shelter, 'Blankets', 'bedding_kits', default=0))} sets",
            f"• *Waterproof Ground Mattresses:* {_format_metric(_get_val(shelter, 'Mattresses', 'mattresses', default=0))} units",
            f"• *Camp First Aid Stations:* {_get_val(shelter, 'FirstAidStations', 'first_aid_stations', default=0)} medical booths",
            f"• *Dedicated Women Safety Enclosures:* {_get_val(shelter, 'WomenSafetyZones', 'women_safety_zones', default=0)} zones",
            f"• *Child Care and Nursing Hubs:* {_get_val(shelter, 'ChildCareCenters', 'child_care_centers', default=0)} hubs",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *FIELD EXECUTION PROTOCOL:*",
            "1. Unlock public stadiums, civic halls, and designated schools on high ground.",
            "2. Erect waterproof tent cities with solar illumination and bio-toilets.",
            "3. Maintain digital intake registers for missing persons reconciliation.",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Official Department Action PDF Reference:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "✅ *Authorized by National Emergency Operations Center*",
            "Shelter Operations Division • Immediate Deployment"
        ]

    # 5. MEDICAL DEPARTMENT (Phone: +91 7397071819)
    elif dept_id == "medical":
        medical = resources.get("Medical") or {}
        lines = [
            "🏥 *EMERGENCY ORDER: MEDICAL & HEALTH SERVICES* 🏥",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} | *Hazard:* {disaster_type}",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Potential Casualties and Affected Citizens:* {affected}",
            f"⚠️ *Incident Severity Level:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🧭 *LIVE GPS NAVIGATION (TOUCH TO NAVIGATE TO SCENE):*",
            f"{maps_link}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🩺 *RESOURCE ALLOCATION QUOTA (OFFICIAL DIRECTIVE):*",
            f"• *Emergency Physicians and Surgeons:* {_get_val(medical, 'Doctors', 'doctors', default=0)} on active duty",
            f"• *Trauma Paramedics and Critical Care Nurses:* {_get_val(medical, 'Paramedics', 'paramedics', default=0)} personnel",
            f"• *Advanced and Basic Life Support Ambulances:* {_get_val(medical, 'Ambulances', 'ambulances', default=0)} vehicles",
            f"• *Comprehensive Trauma Treatment Kits:* {_format_metric(_get_val(medical, 'FirstAidKits', 'emergency_medical_kits', default=0))} kits",
            f"• *Mobile Medical Clinic Units:* {_get_val(medical, 'MobileClinics', 'mobile_medical_teams', default=0)} vans",
            f"• *Dedicated Intensive Care ICU Beds:* {_get_val(medical, 'TemporaryICUBeds', 'icu_beds', default=0)} beds",
            f"• *Polyvalent Anti-Venom and Tetanus Vials:* {_get_val(medical, 'AntiVenomUnits', 'anti_venom', default=0)} doses",
            f"• *Field Triage and Casualty Stabilization Hubs:* {_get_val(medical, 'TraumaCenters', 'triage_centers', default=0)} hubs",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *FIELD EXECUTION PROTOCOL:*",
            "1. Establish Red-Yellow-Green triage zones immediately outside danger sector.",
            "2. Alert district trauma hospitals to activate Emergency Code Red protocols.",
            "3. Deploy paramedic ambulances to evacuation extraction pickup points.",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Official Department Action PDF Reference:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "✅ *Authorized by National Emergency Operations Center*",
            "Health & Family Welfare Emergency Command • Immediate Deployment"
        ]

    # 6. RESCUE DEPARTMENT (Phone: +91 9500330279)
    elif dept_id == "rescue":
        rescue = resources.get("Rescue") or {}
        lines = [
            "🛟 *EMERGENCY ORDER: SEARCH & RESCUE AUTHORITY (NDRF/SDRF)* 🛟",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} | *Hazard:* {disaster_type}",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Citizens in Hazard Impact Zone:* {affected}",
            f"⚠️ *Incident Severity Level:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🧭 *LIVE GPS NAVIGATION (TOUCH TO NAVIGATE TO SCENE):*",
            f"{maps_link}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🚁 *RESOURCE ALLOCATION QUOTA (OFFICIAL DIRECTIVE):*",
            f"• *Specialized NDRF and SDRF Rescue Teams:* {_get_val(rescue, 'RescueTeams', 'NDRFTeams', 'rescue_teams', default=0)} teams",
            f"• *Deployed Search and Rescue Commandos:* {_format_metric(_get_val(rescue, 'RescuePersonnel', 'rescue_personnel', default=0))} personnel",
            f"• *Motorized Inflatable Rescue Boats (IRBs):* {_get_val(rescue, 'RescueBoats', 'rescue_boats', default=0)} craft",
            f"• *Air Force / Coast Guard Rescue Helicopters:* {_get_val(rescue, 'Helicopters', 'RescueHelicopters', 'helicopters', default=0)} aircraft",
            f"• *Thermal Vision Aerial Reconnaissance Drones:* {_get_val(rescue, 'Drones', 'drones', default=0)} drones",
            f"• *Certified Marine Life Jackets:* {_format_metric(_get_val(rescue, 'LifeJackets', 'life_jackets', default=0))} jackets",
            f"• *Deep Water Diver and Trench Extraction Squads:* {_get_val(rescue, 'DiverTeams', 'diver_teams', default=0)} squads",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *FIELD EXECUTION PROTOCOL:*",
            "1. Launch aerial reconnaissance drones to pinpoint trapped civilian clusters.",
            "2. Deploy inflatable boats and amphibian vehicles to submerged or blocked roads.",
            "3. Winch critical stranded individuals directly to medical helipads.",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Official Department Action PDF Reference:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "✅ *Authorized by National Emergency Operations Center*",
            "Search & Rescue Headquarters (NDRF) • Immediate Deployment"
        ]

    # 7. POLICE DEPARTMENT (Phone: +91 9500330279)
    elif dept_id == "police":
        police = resources.get("Police") or {}
        lines = [
            "🚓 *EMERGENCY ORDER: POLICE & SECURITY CORPS* 🚓",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} | *Hazard:* {disaster_type}",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Population in Evacuation Corridor:* {affected}",
            f"⚠️ *Incident Severity Level:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🧭 *LIVE GPS NAVIGATION (TOUCH TO NAVIGATE TO SCENE):*",
            f"{maps_link}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🛡️ *RESOURCE ALLOCATION QUOTA (OFFICIAL DIRECTIVE):*",
            f"• *Police Officers Deployed on Law and Order:* {_format_metric(_get_val(police, 'PolicePersonnel', 'PoliceOfficers', 'police_personnel', default=0))} personnel",
            f"• *Mobile Rapid Response Patrol Cruisers:* {_get_val(police, 'PatrolUnits', 'patrol_units', default=0)} vehicles",
            f"• *Perimeter Barricades and Checkpoints:* {_get_val(police, 'Checkpoints', 'Barricades', 'checkpoints', default=0)} checkpoints",
            f"• *Crowd Management and Anti-Stampede Units:* {_get_val(police, 'CrowdControlTeams', 'traffic_control_teams', default=0)} squads",
            f"• *Dedicated Traffic Regulation Units:* {_get_val(police, 'TrafficControlUnits', 'TrafficPolice', 'traffic_units', default=0)} units",
            f"• *Civilian Evacuation Convoy Escort Squads:* {_get_val(police, 'EvacuationEscortTeams', 'escort_teams', default=0)} squads",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *FIELD EXECUTION PROTOCOL:*",
            "1. Cordon off the primary hazard perimeter to restrict unauthorized traffic.",
            "2. Secure priority green corridors for ambulances and relief trucks.",
            "3. Enforce 24-hour patrols across evacuated neighborhoods against looting.",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Official Department Action PDF Reference:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "✅ *Authorized by National Emergency Operations Center*",
            "Police Headquarters Emergency Operations Cell • Immediate Deployment"
        ]

    # 8. TRANSPORT DEPARTMENT (Phone: +91 9500330279)
    elif dept_id == "transport":
        trans = resources.get("Transport") or {}
        lines = [
            "🚚 *EMERGENCY ORDER: LOGISTICS & TRANSPORT FLEET* 🚚",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📍 *Incident ID:* #{disaster_id} | *Hazard:* {disaster_type}",
            f"🗺️ *Target Location:* {location}",
            f"👥 *Citizens Scheduled for Transport:* {affected}",
            f"⚠️ *Incident Severity Level:* {severity}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🧭 *LIVE GPS NAVIGATION (TOUCH TO NAVIGATE TO SCENE):*",
            f"{maps_link}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "🚛 *RESOURCE ALLOCATION QUOTA (OFFICIAL DIRECTIVE):*",
            f"• *Heavy Evacuation Passenger Buses:* {_get_val(trans, 'EvacuationBuses', 'evacuation_buses', default=0)} buses",
            f"• *Relief Cargo and Supply Heavy Trucks:* {_get_val(trans, 'SupplyTrucks', 'ReliefTrucks', 'relief_supply_trucks', default=0)} trucks",
            f"• *4x4 Off-Road All-Terrain Utility Vehicles:* {_get_val(trans, 'OffRoadVehicles', 'offroad_vehicles', default=0)} vehicles",
            f"• *Emergency Mobile Fuel Supply Tankers:* {_get_val(trans, 'FuelTankers', 'fuel_tankers', default=0)} tankers",
            f"• *Designated Logistics Staging Hubs:* {_get_val(trans, 'LogisticsHubs', 'logistics_hubs', default=0)} hubs",
            f"• *Clearance Transit Priority Green Corridors:* {_get_val(trans, 'GreenCorridors', 'priority_corridors', default=0)} corridors",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "⚡ *FIELD EXECUTION PROTOCOL:*",
            "1. Assemble evacuation bus fleet at designated civilian pickup points.",
            "2. Ferry supplies from regional central warehouses directly to relief camps.",
            "3. Station fuel tankers along transit corridors to prevent fleet stalls.",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"📄 *Official Department Action PDF Reference:*\n{pdf_url}",
            "━━━━━━━━━━━━━━━━━━━━━━━━━",
            "✅ *Authorized by National Emergency Operations Center*",
            "Department of Transport & Logistics Fleet Command • Immediate Deployment"
        ]

    else:
        lines = [
            f"🚨 *DISASTER ALERT — INCIDENT #{disaster_id}* 🚨",
            f"Location: {location} | Hazard: {disaster_type} | Severity: {severity}",
            f"Live GPS: {maps_link}",
            f"Reference: {pdf_url}"
        ]

    # Join message lines and enforce strict ZERO question marks guarantee
    message_text = "\n".join(lines).replace("?", "")
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
        "pdf_url": pdf_url,
        "maps_link": maps_link
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
    # Guarantee no question marks in text
    safe_text = text.replace("?", "")
    encoded = urllib.parse.quote(safe_text)
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
                "text": {"body": safe_text}
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
        except Exception:
            pass

    # Try Twilio if configured
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
            data = {
                "From": TWILIO_WHATSAPP_FROM,
                "To": f"whatsapp:+{clean_num}",
                "Body": safe_text
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
        "status": "DISPATCHED",
        "message": f"Pre-filled WhatsApp message ready for +{clean_num}",
        "wa_direct_url": wa_direct_url
    }
