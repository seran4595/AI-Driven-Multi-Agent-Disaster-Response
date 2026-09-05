def allocate_medical(disaster, ai_severity):
    """
    AI Medical Planning Agent

    Recommends medical resources based on:
    1. Disaster Type
    2. AI Severity
    3. Number of Affected People
    """

    people = disaster.affected_people

    doctors = 2
    nurses = 5
    paramedics = 2
    ambulances = 1
    first_aid = 20
    blood_units = 10
    hospital_beds = 10
    icu_beds = 2
    ventilators = 1
    volunteers = 5

    # -------------------------
    # Population Based Planning
    # -------------------------

    if people >= 5000:
        doctors = 30
        nurses = 70
        paramedics = 40
        ambulances = 10
        first_aid = 700
        blood_units = 400
        hospital_beds = 350
        icu_beds = 40
        ventilators = 20
        volunteers = 120

    elif people >= 1000:
        doctors = 15
        nurses = 35
        paramedics = 20
        ambulances = 5
        first_aid = 300
        blood_units = 150
        hospital_beds = 150
        icu_beds = 15
        ventilators = 10
        volunteers = 50

    elif people >= 100:
        doctors = 5
        nurses = 15
        paramedics = 8
        ambulances = 2
        first_aid = 100
        blood_units = 50
        hospital_beds = 50
        icu_beds = 5
        ventilators = 2
        volunteers = 20

    # -------------------------
    # Disaster Specific Planning
    # -------------------------

    disaster_type = disaster.disaster_type.lower()

    special_resources = []

    if disaster_type == "flood":
        special_resources = [
            "Water Purification Tablets",
            "ORS Packets",
            "Anti-Infection Medicines"
        ]

    elif disaster_type == "earthquake":
        special_resources = [
            "Trauma Surgeons",
            "Orthopedic Kits",
            "Emergency Blood Supply"
        ]

    elif disaster_type == "wildfire":
        special_resources = [
            "Burn Treatment Kits",
            "Oxygen Cylinders",
            "Respiratory Specialists"
        ]

    elif disaster_type == "cyclone":
        special_resources = [
            "Mobile Medical Camps",
            "Emergency Medicine Kits",
            "Rescue Ambulances"
        ]

    else:
        special_resources = [
            "General Emergency Medical Kits"
        ]

    # -------------------------
    # Severity Adjustment
    # -------------------------

    if "EXTREME" in ai_severity:
        doctors += 10
        nurses += 20
        ambulances += 5
        volunteers += 50

    elif "HIGH" in ai_severity:
        doctors += 5
        nurses += 10
        ambulances += 2
        volunteers += 20

    return {
        "Doctors": doctors,
        "Nurses": nurses,
        "Paramedics": paramedics,
        "Ambulances": ambulances,
        "HospitalBeds": hospital_beds,
        "ICUBeds": icu_beds,
        "Ventilators": ventilators,
        "BloodUnits": blood_units,
        "FirstAidKits": first_aid,
        "MedicalVolunteers": volunteers,
        "SpecialResources": special_resources
    }