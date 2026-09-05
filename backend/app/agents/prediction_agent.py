def predict_disaster(disaster, ai_severity):
    """
    ==========================================================
                    PREDICTION AGENT
    ==========================================================

    Predicts the possible impact of a disaster using:

    1. Number of affected people
    2. AI-generated severity
    3. Disaster type

    Returns:
    - Spread Risk
    - Priority
    - Evacuation Requirement
    - Expected Impact
    """

    people = disaster.affected_people
    disaster_type = disaster.disaster_type.lower()

    # ----------------------------------------------------------
    # Default Prediction
    # ----------------------------------------------------------

    spread_risk = "LOW"
    priority = "LOW"
    evacuation = "NO"
    impact = "LOCAL"

    # ----------------------------------------------------------
    # Population Based Prediction
    # ----------------------------------------------------------

    if people >= 5000:

        spread_risk = "HIGH"
        priority = "IMMEDIATE"
        evacuation = "YES"
        impact = "REGIONAL"

    elif people >= 1000:

        spread_risk = "MEDIUM"
        priority = "HIGH"
        evacuation = "YES"
        impact = "DISTRICT"

    elif people >= 100:

        spread_risk = "LOW"
        priority = "MEDIUM"
        evacuation = "NO"
        impact = "LOCAL"

    # ----------------------------------------------------------
    # AI Severity Adjustment
    # ----------------------------------------------------------

    if "EXTREME" in ai_severity:

        spread_risk = "HIGH"
        priority = "IMMEDIATE"
        evacuation = "YES"
        impact = "REGIONAL"

    elif "HIGH" in ai_severity:

        if spread_risk == "LOW":
            spread_risk = "MEDIUM"

        if priority == "LOW":
            priority = "HIGH"

    # ----------------------------------------------------------
    # Disaster Specific Prediction
    # ----------------------------------------------------------

    high_risk_disasters = [
        "tsunami",
        "earthquake",
        "cyclone",
        "hurricane",
        "tornado",
        "wildfire",
        "volcanic eruption"
    ]

    if disaster_type in high_risk_disasters:

        if priority == "LOW":
            priority = "MEDIUM"

        if people >= 1000:
            evacuation = "YES"

    # ----------------------------------------------------------
    # Final Prediction
    # ----------------------------------------------------------

    return {
        "Spread_Risk": spread_risk,
        "Priority": priority,
        "Evacuation": evacuation,
        "Expected_Impact": impact
    }