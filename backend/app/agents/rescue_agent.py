import math


def allocate_rescue(disaster, ai_severity):
    """
    ==========================================================
                    RESCUE ALLOCATION AGENT
    ==========================================================

    Responsibilities:
    - NDRF Teams
    - SDRF Teams
    - Rescue Boats
    - Rescue Helicopters
    - Rescue Drones
    - Search Dogs
    """

    affected_people = disaster.affected_people
    disaster_type = disaster.disaster_type.lower()
    severity = disaster.severity.lower()

    # ---------------------------------------------
    # NDRF Teams
    # ---------------------------------------------
    if severity == "critical":
        ndrf = max(2, math.ceil(affected_people / 1000))
    elif severity == "high":
        ndrf = max(1, math.ceil(affected_people / 1500))
    else:
        ndrf = max(1, math.ceil(affected_people / 3000))

    # ---------------------------------------------
    # SDRF Teams
    # ---------------------------------------------
    sdrf = max(1, math.ceil(ndrf * 1.5))

    # ---------------------------------------------
    # Rescue Boats
    # ---------------------------------------------
    boats = 0

    if disaster_type in ["flood", "tsunami"]:
        boats = max(2, math.ceil(affected_people / 800))

    # ---------------------------------------------
    # Rescue Helicopters
    # ---------------------------------------------
    helicopters = 0

    if disaster_type in ["earthquake", "landslide", "cyclone"]:
        helicopters = max(1, math.ceil(affected_people / 4000))

    # ---------------------------------------------
    # Rescue Drones
    # ---------------------------------------------
    drones = max(2, math.ceil(affected_people / 2000))

    # ---------------------------------------------
    # Search Dogs
    # ---------------------------------------------
    dogs = 0

    if disaster_type in ["earthquake", "landslide"]:
        dogs = max(2, math.ceil(affected_people / 2500))

    # ---------------------------------------------
    # Extra Resources
    # ---------------------------------------------
    if "EXTREME" in ai_severity:
        helicopters += 1
        drones += 2
        boats += 2

    return {

        "NDRFTeams": ndrf,

        "SDRFTeams": sdrf,

        "RescueBoats": boats,

        "RescueHelicopters": helicopters,

        "RescueDrones": drones,

        "SearchDogs": dogs

    }