from backend.app.agents.food_agent import allocate_food
from backend.app.agents.water_agent import allocate_water
from backend.app.agents.shelter_agent import allocate_shelter
from backend.app.agents.medical_agent import allocate_medical
from backend.app.agents.rescue_agent import allocate_rescue
from backend.app.agents.police_agent import allocate_police
from backend.app.agents.transport_agent import allocate_transport


def allocate_resources(disaster, ai_severity):
    """
    ==========================================================
                RESOURCE ALLOCATION AGENT
    ==========================================================

    This agent coordinates all resource agents and combines
    their recommendations into one disaster response plan.

    """

    food = allocate_food(disaster, ai_severity)

    water = allocate_water(disaster, ai_severity)

    shelter = allocate_shelter(disaster, ai_severity)

    medical = allocate_medical(disaster, ai_severity)

    rescue = allocate_rescue(disaster, ai_severity)

    police = allocate_police(disaster, ai_severity)

    transport = allocate_transport(disaster, ai_severity)

    return {

        "Food": food,

        "Water": water,

        "Shelter": shelter,

        "Medical": medical,

        "Rescue": rescue,

        "Police": police,

        "Transport": transport

    }