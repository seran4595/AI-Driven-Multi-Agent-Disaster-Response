# ==========================================================
# DISASTER AI COMMAND CENTER
# DISASTER SERVICE
# ==========================================================

import json

from backend.app.database.database import SessionLocal
from backend.app.models.disaster_model import Disaster


# ==========================================================
# ADD DISASTER
# ==========================================================

def add_disaster(report, ai_severity=None, prediction=None, resources=None):
    """
    Save a disaster report permanently
    into PostgreSQL.
    """

    db = SessionLocal()

    try:

        new_disaster = Disaster(

            disaster_type=report.disaster_type,

            country=report.country,

            state=report.state,

            city=report.city,

            latitude=report.latitude,

            longitude=report.longitude,

            severity=report.severity,

            affected_people=report.affected_people,

            description=report.description,

            reported_by=report.reported_by,

            report_time=report.report_time,

            ai_severity=ai_severity,

            prediction_json=json.dumps(
                prediction or {},
                ensure_ascii=False
            ),

            resources_json=json.dumps(
                resources or {},
                ensure_ascii=False
            )
        )

        db.add(new_disaster)

        db.commit()

        db.refresh(new_disaster)

        return new_disaster

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# ==========================================================
# GET ALL DISASTERS
# ==========================================================

def get_all_disasters():
    """
    Retrieve all disaster reports
    from PostgreSQL.
    """

    db = SessionLocal()

    try:

        disasters = (
            db.query(Disaster)
            .order_by(Disaster.id.desc())
            .all()
        )

        return [

            {
                "id": disaster.id,

                "disaster_type":
                    disaster.disaster_type,

                "country":
                    disaster.country,

                "state":
                    disaster.state,

                "city":
                    disaster.city,

                "latitude":
                    disaster.latitude,

                "longitude":
                    disaster.longitude,

                "severity":
                    disaster.severity,

                "affected_people":
                    disaster.affected_people,

                "description":
                    disaster.description,

                "reported_by":
                    disaster.reported_by,

                "report_time":
                    disaster.report_time,

                "ai_severity":
                    disaster.ai_severity,

                "has_response_plan":
                    bool(disaster.resources_json)
            }

            for disaster in disasters
        ]

    finally:

        db.close()


# ==========================================================
# DASHBOARD SUMMARY
# ==========================================================

def get_dashboard_summary():
    """
    Return dashboard statistics.
    """

    db = SessionLocal()

    try:

        disasters = (
            db.query(Disaster)
            .order_by(Disaster.id.desc())
            .all()
        )

        # --------------------------------------------------
        # TOTAL DISASTERS
        # --------------------------------------------------

        total_disasters = len(disasters)

        # --------------------------------------------------
        # TOTAL AFFECTED PEOPLE
        # --------------------------------------------------

        total_affected_people = sum(

            disaster.affected_people or 0

            for disaster in disasters
        )

        # --------------------------------------------------
        # HIGH PRIORITY
        # --------------------------------------------------

        high_priority = sum(

            1

            for disaster in disasters

            if disaster.severity in [
                "High",
                "Critical"
            ]
        )

        # --------------------------------------------------
        # DISASTER TYPES
        # --------------------------------------------------

        disaster_types = {}

        for disaster in disasters:

            disaster_type = (
                disaster.disaster_type
            )

            disaster_types[disaster_type] = (
                disaster_types.get(
                    disaster_type,
                    0
                ) + 1
            )

        # --------------------------------------------------
        # LOCATIONS
        # --------------------------------------------------

        locations = [

            {
                "id": disaster.id,

                "disaster_type":
                    disaster.disaster_type,

                "city":
                    disaster.city,

                "state":
                    disaster.state,

                "country":
                    disaster.country,

                "latitude":
                    disaster.latitude,

                "longitude":
                    disaster.longitude,

                "severity":
                    disaster.severity,

                "affected_people":
                    disaster.affected_people
            }

            for disaster in disasters
        ]

        # --------------------------------------------------
        # RETURN
        # --------------------------------------------------

        return {

            "Total_Disasters":
                total_disasters,

            "Total_Affected_People":
                total_affected_people,

            "High_Priority_Disasters":
                high_priority,

            "Disaster_Types":
                disaster_types,

            "Locations":
                locations
        }

    finally:

        db.close()


# ==========================================================
# ANALYTICS
# ==========================================================

def get_analytics():
    """
    Generate detailed analytics for the
    Disaster AI Command Center.

    Returns:

        Overview
        Disaster type distribution
        Severity distribution
        Top affected locations
        Recent incidents
    """

    db = SessionLocal()

    try:

        # --------------------------------------------------
        # FETCH DISASTERS
        # --------------------------------------------------

        disasters = (
            db.query(Disaster)
            .order_by(Disaster.id.desc())
            .all()
        )

        total_disasters = len(disasters)

        # --------------------------------------------------
        # OVERVIEW
        # --------------------------------------------------

        total_affected_people = sum(

            disaster.affected_people or 0

            for disaster in disasters
        )

        high_priority = sum(

            1

            for disaster in disasters

            if disaster.severity in [
                "High",
                "Critical"
            ]
        )

        critical_incidents = sum(

            1

            for disaster in disasters

            if disaster.severity == "Critical"
        )

        if total_disasters > 0:

            average_affected_people = (
                total_affected_people
                / total_disasters
            )

            priority_percentage = (
                high_priority
                / total_disasters
            ) * 100

        else:

            average_affected_people = 0

            priority_percentage = 0

        # --------------------------------------------------
        # DISASTER TYPES
        # --------------------------------------------------

        disaster_types = {}

        for disaster in disasters:

            disaster_type = (
                disaster.disaster_type
            )

            disaster_types[disaster_type] = (
                disaster_types.get(
                    disaster_type,
                    0
                ) + 1
            )

        # --------------------------------------------------
        # SEVERITY DISTRIBUTION
        # --------------------------------------------------

        severity_distribution = {

            "Low": 0,

            "Medium": 0,

            "High": 0,

            "Critical": 0
        }

        for disaster in disasters:

            severity = disaster.severity

            if severity in severity_distribution:

                severity_distribution[
                    severity
                ] += 1

        # --------------------------------------------------
        # TOP LOCATIONS
        # --------------------------------------------------

        location_totals = {}

        for disaster in disasters:

            city = disaster.city or "Unknown"

            affected = (
                disaster.affected_people or 0
            )

            location_totals[city] = (
                location_totals.get(
                    city,
                    0
                ) + affected
            )

        top_locations = [

            {
                "city": city,

                "affected_people":
                    affected
            }

            for city, affected
            in sorted(
                location_totals.items(),
                key=lambda item: item[1],
                reverse=True
            )[:10]
        ]

        # --------------------------------------------------
        # RECENT INCIDENTS
        # --------------------------------------------------

        recent_incidents = [

            {
                "id":
                    disaster.id,

                "disaster_type":
                    disaster.disaster_type,

                "city":
                    disaster.city,

                "state":
                    disaster.state,

                "country":
                    disaster.country,

                "severity":
                    disaster.severity,

                "affected_people":
                    disaster.affected_people,

                "reported_by":
                    disaster.reported_by,

                "report_time":
                    disaster.report_time
            }

            for disaster in disasters[:10]
        ]

        # --------------------------------------------------
        # FINAL ANALYTICS RESPONSE
        # --------------------------------------------------

        return {

            "overview": {

                "total_disasters":
                    total_disasters,

                "total_affected_people":
                    total_affected_people,

                "high_priority":
                    high_priority,

                "critical_incidents":
                    critical_incidents,

                "average_affected_people":
                    round(
                        average_affected_people,
                        2
                    ),

                "priority_percentage":
                    round(
                        priority_percentage,
                        2
                    )
            },

            "disaster_types":
                disaster_types,

            "severity_distribution":
                severity_distribution,

            "top_locations":
                top_locations,

            "recent_incidents":
                recent_incidents
        }

    finally:

        db.close()
# ==========================================================
# ANALYTICS SUMMARY
# ==========================================================

def get_analytics_summary():
    """
    Compatibility wrapper for the analytics API.

    This keeps existing routes working while using
    the main get_analytics() implementation.
    """

    return get_analytics()

# ==========================================================
# RESPONSE PLANS
# ==========================================================

def _response_plan_dict(disaster):
    try:
        prediction = json.loads(disaster.prediction_json or "{}")
    except (TypeError, json.JSONDecodeError):
        prediction = {}

    try:
        resources = json.loads(disaster.resources_json or "{}")
    except (TypeError, json.JSONDecodeError):
        resources = {}

    return {
        "id": disaster.id,
        "disaster_type": disaster.disaster_type,
        "country": disaster.country,
        "state": disaster.state,
        "city": disaster.city,
        "latitude": disaster.latitude,
        "longitude": disaster.longitude,
        "severity": disaster.severity,
        "affected_people": disaster.affected_people,
        "description": disaster.description,
        "reported_by": disaster.reported_by,
        "report_time": disaster.report_time,
        "AI_Severity": disaster.ai_severity,
        "Prediction": prediction,
        "Resources": resources,
        "has_response_plan": bool(disaster.resources_json),
    }


def get_response_plans():
    """Return all saved AI response plans, newest first."""
    db = SessionLocal()
    try:
        disasters = (
            db.query(Disaster)
            .order_by(Disaster.id.desc())
            .all()
        )
        return [
            _response_plan_dict(disaster)
            for disaster in disasters
            if disaster.resources_json
        ]
    finally:
        db.close()


def get_response_plan(disaster_id):
    """Return one saved AI response plan."""
    db = SessionLocal()
    try:
        disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
        if not disaster or not disaster.resources_json:
            return None
        return _response_plan_dict(disaster)
    finally:
        db.close()
