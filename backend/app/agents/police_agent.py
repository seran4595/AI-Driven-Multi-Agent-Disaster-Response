import math


def allocate_police(disaster, ai_severity):
    """
    ==========================================================
                    POLICE ALLOCATION AGENT
    ==========================================================

    Responsibilities:
    - Police Officers
    - Traffic Police
    - Crowd Control Teams
    - Barricades
    - Mobile Surveillance Units
    """

    affected_people = disaster.affected_people
    severity = disaster.severity.lower()

    # ---------------------------------------------
    # Police Officers
    # ---------------------------------------------
    if severity == "critical":
        police_officers = max(30, math.ceil(affected_people / 100))

    elif severity == "high":
        police_officers = max(20, math.ceil(affected_people / 150))

    elif severity == "medium":
        police_officers = max(10, math.ceil(affected_people / 250))

    else:
        police_officers = max(5, math.ceil(affected_people / 500))

    # ---------------------------------------------
    # Traffic Police
    # ---------------------------------------------
    traffic_police = max(5, math.ceil(police_officers * 0.30))

    # ---------------------------------------------
    # Crowd Control Teams
    # ---------------------------------------------
    crowd_control = max(2, math.ceil(police_officers / 15))

    # ---------------------------------------------
    # Barricades
    # ---------------------------------------------
    barricades = max(10, math.ceil(affected_people / 100))

    # ---------------------------------------------
    # Mobile Surveillance Units
    # ---------------------------------------------
    surveillance_units = max(1, math.ceil(affected_people / 3000))

    # ---------------------------------------------
    # Extreme Disaster
    # ---------------------------------------------
    if "EXTREME" in ai_severity:
        police_officers += 20
        traffic_police += 5
        crowd_control += 2
        barricades += 20

    # ---------------------------------------------
    # Return Police Plan
    # ---------------------------------------------
    return {

        "PoliceOfficers": police_officers,

        "TrafficPolice": traffic_police,

        "CrowdControlTeams": crowd_control,

        "Barricades": barricades,

        "MobileSurveillanceUnits": surveillance_units

    }