import math


def allocate_water(disaster, ai_severity):
    """
    ==========================================================
                    WATER ALLOCATION AGENT
    ==========================================================

    Responsibilities:
    - Drinking water bottles
    - Water tankers
    - Water purification units
    - Water storage tanks
    - Chlorine tablets

    """

    affected_people = disaster.affected_people
    disaster_type = disaster.disaster_type.lower()
    severity = disaster.severity.lower()

    # ---------------------------------------------
    # Water Bottles
    # 3 bottles per person per day
    # ---------------------------------------------
    if severity == "critical":
        supply_days = 7
    elif severity == "high":
        supply_days = 5
    elif severity == "medium":
        supply_days = 3
    else:
        supply_days = 2

    water_bottles = affected_people * 3 * supply_days

    # ---------------------------------------------
    # Water Tankers
    # One tanker for every 2000 people
    # ---------------------------------------------
    water_tankers = max(1, math.ceil(affected_people / 2000))

    # ---------------------------------------------
    # Water Purification Units
    # ---------------------------------------------
    purification_units = max(1, math.ceil(affected_people / 5000))

    # ---------------------------------------------
    # Water Storage Tanks
    # ---------------------------------------------
    storage_tanks = max(1, math.ceil(affected_people / 1000))

    # ---------------------------------------------
    # Chlorine Tablets
    # One tablet per person
    # ---------------------------------------------
    chlorine_tablets = affected_people

    # ---------------------------------------------
    # Flood & Tsunami need extra purification
    # ---------------------------------------------
    if disaster_type in ["flood", "tsunami"]:

        purification_units += 2
        chlorine_tablets += affected_people // 2

    # ---------------------------------------------
    # Extreme Disaster
    # ---------------------------------------------
    if "EXTREME" in ai_severity:

        water_tankers += 2
        storage_tanks += 2

    return {

        "WaterBottles": water_bottles,

        "WaterTankers": water_tankers,

        "PurificationUnits": purification_units,

        "WaterStorageTanks": storage_tanks,

        "ChlorineTablets": chlorine_tablets,

        "SupplyDurationDays": supply_days

    }