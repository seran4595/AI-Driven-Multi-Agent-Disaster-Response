import math


def allocate_food(disaster, ai_severity):
    """
    ==========================================================
                    FOOD ALLOCATION AGENT
    ==========================================================

    Responsibilities:
    - Calculate required food packets
    - Decide meal type
    - Calculate baby food kits
    - Calculate dry ration kits
    - Calculate emergency reserve
    - Decide supply duration
    - Calculate distribution centers

    Inputs:
        disaster
        ai_severity

    Output:
        Dictionary containing complete food allocation plan.
    """

    affected_people = disaster.affected_people
    disaster_type = disaster.disaster_type.lower()
    severity = disaster.severity.lower()

    # ---------------------------------------------
    # Decide Meal Type
    # ---------------------------------------------
    if disaster_type in ["flood", "tsunami"]:
        meal_type = "Ready-to-Eat Meals"

    elif disaster_type == "earthquake":
        meal_type = "Dry Food Kits"

    elif disaster_type == "cyclone":
        meal_type = "Packed Meals"

    elif disaster_type == "wildfire":
        meal_type = "Community Kitchen Meals"

    else:
        meal_type = "Standard Relief Meals"

    # ---------------------------------------------
    # Meals Per Day
    # ---------------------------------------------
    if severity == "critical":
        meals_per_day = 4

    elif severity == "high":
        meals_per_day = 3

    elif severity == "medium":
        meals_per_day = 3

    else:
        meals_per_day = 2

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
    # Main Food Packets
    # ---------------------------------------------
    food_packets = affected_people * meals_per_day

    # ---------------------------------------------
    # Baby Food Kits
    # Assume 10% of affected people are infants.
    # ---------------------------------------------
    baby_food = math.ceil(affected_people * 0.10)

    # ---------------------------------------------
    # Dry Ration Kits
    # One kit supports one family (approx. 5 people)
    # ---------------------------------------------
    dry_ration = math.ceil(affected_people / 5)

    # ---------------------------------------------
    # Emergency Reserve
    # Keep 15% extra stock.
    # ---------------------------------------------
    emergency_reserve = math.ceil(food_packets * 0.15)

    # ---------------------------------------------
    # Distribution Centers
    # One center for every 1000 people.
    # ---------------------------------------------
    distribution_centers = max(1, math.ceil(affected_people / 1000))

    # ---------------------------------------------
    # Extreme Severity Bonus Stock
    # ---------------------------------------------
    if "EXTREME" in ai_severity:
        emergency_reserve += 500

    # ---------------------------------------------
    # Return Complete Food Plan
    # ---------------------------------------------
    return {
        "FoodPackets": food_packets,
        "MealsPerDay": meals_per_day,
        "MealType": meal_type,
        "BabyFoodKits": baby_food,
        "DryRationKits": dry_ration,
        "EmergencyReserve": emergency_reserve,
        "DistributionCenters": distribution_centers,
        "SupplyDurationDays": supply_days
    }