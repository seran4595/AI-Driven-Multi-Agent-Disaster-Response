from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field


DISASTER_TYPES = (
    "Flood", "Flash Flood", "River Flood", "Coastal Flood", "Tsunami",
    "Cyclone", "Hurricane", "Typhoon", "Tornado", "Earthquake",
    "Aftershock", "Landslide", "Mudslide", "Volcanic Eruption",
    "Wildfire", "Forest Fire", "Urban Fire", "Industrial Fire",
    "Chemical Leak", "Gas Leak", "Oil Spill", "Radiation Leak",
    "Building Collapse", "Bridge Collapse", "Dam Failure", "Train Accident",
    "Plane Crash", "Ship Accident", "Road Accident", "Heatwave",
    "Cold Wave", "Drought", "Blizzard", "Snowstorm", "Thunderstorm",
    "Lightning", "Dust Storm", "Sandstorm", "Pandemic", "Epidemic",
)


class DisasterReport(BaseModel):
    disaster_type: Literal[
        "Flood", "Flash Flood", "River Flood", "Coastal Flood", "Tsunami",
        "Cyclone", "Hurricane", "Typhoon", "Tornado", "Earthquake",
        "Aftershock", "Landslide", "Mudslide", "Volcanic Eruption",
        "Wildfire", "Forest Fire", "Urban Fire", "Industrial Fire",
        "Chemical Leak", "Gas Leak", "Oil Spill", "Radiation Leak",
        "Building Collapse", "Bridge Collapse", "Dam Failure", "Train Accident",
        "Plane Crash", "Ship Accident", "Road Accident", "Heatwave",
        "Cold Wave", "Drought", "Blizzard", "Snowstorm", "Thunderstorm",
        "Lightning", "Dust Storm", "Sandstorm", "Pandemic", "Epidemic",
    ]
    country: str
    state: str
    city: str
    latitude: float
    longitude: float
    severity: Literal["Low", "Medium", "High", "Critical"]
    affected_people: int
    description: str
    reported_by: str
    report_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
