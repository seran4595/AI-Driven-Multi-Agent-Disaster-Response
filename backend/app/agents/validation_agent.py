# backend/app/agents/validation_agent.py

VALID_DISASTERS = [
    "Earthquake",
    "Flood",
    "Tsunami",
    "Cyclone",
    "Hurricane",
    "Typhoon",
    "Tornado",
    "Wildfire",
    "Volcanic Eruption",
    "Landslide",
    "Avalanche",
    "Drought",
    "Heat Wave",
    "Cold Wave",
    "Blizzard",
    "Hailstorm",
    "Dust Storm",
    "Sandstorm",
    "Lightning Strike"
]


def validate_disaster(disaster):
    if disaster.disaster_type not in VALID_DISASTERS:
        return False

    return True