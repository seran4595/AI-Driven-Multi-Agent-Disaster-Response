import math


def allocate_shelter(disaster, ai_severity):
    """
    ==========================================================
                    SHELTER ALLOCATION AGENT
    ==========================================================

    Responsibilities:
    - Temporary shelters
    - Family tents
    - Blankets
    - Mattresses
    - Portable toilets
    - Women safety zones
    - Child care centers

    """

    affected_people = disaster.affected_people
    severity = disaster.severity.lower()

    # ---------------------------------------------
    # Supply Duration
    # ---------------------------------------------
    if severity == "critical":
        supply_days = 7
    elif severity == "high":
        supply_days = 5
    elif severity == "medium":
        supply_days = 3
    else:
        supply_days = 2

    # ---------------------------------------------
    # Temporary Shelters
    # One shelter per 500 people
    # ---------------------------------------------
    temporary_shelters = max(1, math.ceil(affected_people / 500))

    # ---------------------------------------------
    # Family Tents
    # One tent for every 5 people
    # ---------------------------------------------
    family_tents = math.ceil(affected_people / 5)

    # ---------------------------------------------
    # Blankets
    # Two blankets per person
    # ---------------------------------------------
    blankets = affected_people * 2

    # ---------------------------------------------
    # Mattresses
    # One mattress per person
    # ---------------------------------------------
    mattresses = affected_people

    # ---------------------------------------------
    # Portable Toilets
    # One toilet for every 50 people
    # ---------------------------------------------
    portable_toilets = max(2, math.ceil(affected_people / 50))

    # ---------------------------------------------
    # Women Safety Zones
    # One zone per shelter
    # ---------------------------------------------
    women_safety_zones = temporary_shelters

    # ---------------------------------------------
    # Child Care Centers
    # One center per 1000 people
    # ---------------------------------------------
    child_care_centers = max(1, math.ceil(affected_people / 1000))

    # ---------------------------------------------
    # Extra Resources for Extreme Disasters
    # ---------------------------------------------
    if "EXTREME" in ai_severity:
        family_tents += 100
        blankets += 500
        mattresses += 500

    # ---------------------------------------------
    # Return Shelter Plan
    # ---------------------------------------------
    return {

        "TemporaryShelters": temporary_shelters,

        "FamilyTents": family_tents,

        "Blankets": blankets,

        "Mattresses": mattresses,

        "PortableToilets": portable_toilets,

        "WomenSafetyZones": women_safety_zones,

        "ChildCareCenters": child_care_centers,

        "SupplyDurationDays": supply_days

    }