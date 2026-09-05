# backend/app/agents/severity_agent.py

def analyze_severity(disaster):
    """
    AI Severity Agent
    Calculates the disaster severity based on different factors.
    """

    score = 0

    major_disasters = [
        "Earthquake",
        "Tsunami",
        "Cyclone",
        "Hurricane",
        "Volcanic Eruption",
        "Wildfire",
        "Flood"
    ]

    if disaster.disaster_type in major_disasters:
        score += 40
    else:
        score += 20

    if disaster.affected_people >= 10000:
        score += 40
    elif disaster.affected_people >= 5000:
        score += 30
    elif disaster.affected_people >= 1000:
        score += 20
    elif disaster.affected_people >= 100:
        score += 10

    severity = disaster.severity.lower()

    if severity == "critical":
        score += 20
    elif severity == "high":
        score += 15
    elif severity == "medium":
        score += 10
    else:
        score += 5

    if score >= 80:
        return "EXTREME 🔴"
    elif score >= 60:
        return "HIGH 🟠"
    elif score >= 40:
        return "MEDIUM 🟡"
    else:
        return "LOW 🟢"