import math


def allocate_transport(disaster, ai_severity):
    """
    ==========================================================
                TRANSPORT ALLOCATION AGENT
    ==========================================================

    Responsibilities:
    - Relief Trucks
    - Ambulances
    - Buses
    - Fuel Tankers
    - Excavators
    - Cranes
    """

    affected_people = disaster.affected_people
    disaster_type = disaster.disaster_type.lower()
    severity = disaster.severity.lower()

    # ---------------------------------------------
    # Relief Trucks
    # ---------------------------------------------
    relief_trucks = max(2, math.ceil(affected_people / 1000))

    # ---------------------------------------------
    # Ambulances
    # ---------------------------------------------
    if severity == "critical":
        ambulances = max(5, math.ceil(affected_people / 500))
    elif severity == "high":
        ambulances = max(3, math.ceil(affected_people / 1000))
    else:
        ambulances = max(2, math.ceil(affected_people / 2000))

    # ---------------------------------------------
    # Evacuation Buses
    # ---------------------------------------------
    buses = max(2, math.ceil(affected_people / 300))

    # ---------------------------------------------
    # Fuel Tankers
    # ---------------------------------------------
    fuel_tankers = max(1, math.ceil(relief_trucks / 5))

    # ---------------------------------------------
    # Excavators
    # ---------------------------------------------
    excavators = 0

    if disaster_type in ["earthquake", "landslide"]:
        excavators = max(2, math.ceil(affected_people / 3000))

    # ---------------------------------------------
    # Cranes
    # ---------------------------------------------
    cranes = 0

    if disaster_type in ["earthquake", "cyclone"]:
        cranes = max(1, math.ceil(affected_people / 5000))

    # ---------------------------------------------
    # Extreme Disaster
    # ---------------------------------------------
    if "EXTREME" in ai_severity:
        relief_trucks += 5
        ambulances += 3
        buses += 5
        fuel_tankers += 2

    # ---------------------------------------------
    # Return Transport Plan
    # ---------------------------------------------
    return {

        "ReliefTrucks": relief_trucks,

        "Ambulances": ambulances,

        "EvacuationBuses": buses,

        "FuelTankers": fuel_tankers,

        "Excavators": excavators,

        "Cranes": cranes

    }