# ==========================================================
# DISASTER AI COMMAND CENTER
# DISASTER API ROUTES
# ==========================================================

from fastapi import APIRouter, HTTPException

from backend.app.models.schema import DisasterReport

from backend.app.services.disaster_service import (
    add_disaster,
    get_all_disasters,
    get_dashboard_summary,
    get_analytics,
    get_response_plans,
    get_response_plan
)

from backend.app.agents.coordinator import process_disaster


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter()


# ==========================================================
# REPORT DISASTER
# ==========================================================

@router.post("/report-disaster")
def report_disaster(disaster: DisasterReport):
    """
    Receive a disaster report.

    Flow:

        Frontend
            ↓
        Pydantic Validation
            ↓
        Coordinator Agent
            ↓
        AI Analysis
            ↓
        PostgreSQL
            ↓
        Frontend
    """

    try:

        # --------------------------------------------------
        # STEP 1
        # COORDINATOR AGENT
        # --------------------------------------------------

        result = process_disaster(
            disaster
        )

        # --------------------------------------------------
        # STEP 2
        # VALIDATION
        # --------------------------------------------------

        if not result.get(
            "success",
            False
        ):

            return {

                "success": False,

                "message":
                    result.get(
                        "message",
                        "Disaster report validation failed."
                    )
            }

        # --------------------------------------------------
        # STEP 3
        # SAVE TO DATABASE
        # --------------------------------------------------

        saved_disaster = add_disaster(
            disaster,
            result.get("AI_Severity"),
            result.get("Prediction"),
            result.get("Resources")
        )

        # --------------------------------------------------
        # STEP 4
        # RESPONSE
        # --------------------------------------------------

        return {

            "success": True,

            "message":
                "✅ Disaster report received successfully",

            "AI_Severity":
                result.get(
                    "AI_Severity"
                ),

            "Prediction":
                result.get(
                    "Prediction"
                ),

            "Resources":
                result.get(
                    "Resources"
                ),

            "Notification":
                result.get(
                    "Notification"
                ),

            "report": {

                "id":
                    saved_disaster.id,

                "disaster_type":
                    saved_disaster.disaster_type,

                "country":
                    saved_disaster.country,

                "state":
                    saved_disaster.state,

                "city":
                    saved_disaster.city,

                "latitude":
                    saved_disaster.latitude,

                "longitude":
                    saved_disaster.longitude,

                "severity":
                    saved_disaster.severity,

                "affected_people":
                    saved_disaster.affected_people,

                "description":
                    saved_disaster.description,

                "reported_by":
                    saved_disaster.reported_by,

                "report_time":
                    saved_disaster.report_time
            }
        }

    except Exception as error:

        print(
            "❌ ERROR /report-disaster:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=
                "Unable to process disaster report."
        )


# ==========================================================
# GET ALL DISASTERS
# ==========================================================

@router.get("/disasters")
def get_disasters():
    """
    Retrieve all disaster reports.

    Used by:

        Dashboard
        Reports table
        Live map
    """

    try:

        return get_all_disasters()

    except Exception as error:

        print(
            "❌ ERROR /disasters:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=
                "Unable to retrieve disaster reports."
        )


# ==========================================================
# DASHBOARD SUMMARY
# ==========================================================

@router.get("/dashboard-summary")
def dashboard_summary():
    """
    Retrieve dashboard statistics.
    """

    try:

        return get_dashboard_summary()

    except Exception as error:

        print(
            "❌ ERROR /dashboard-summary:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=
                "Unable to retrieve dashboard summary."
        )


# ==========================================================
# RESPONSE PLANS
# ==========================================================

@router.get("/response-plans")
def response_plans():
    """Retrieve all persistent AI response plans."""
    try:
        return get_response_plans()
    except Exception as error:
        print("❌ ERROR /response-plans:", error)
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve response plans."
        )


@router.get("/response-plans/{disaster_id}")
def response_plan(disaster_id: int):
    """Retrieve one persistent AI response plan."""
    try:
        plan = get_response_plan(disaster_id)
        if plan is None:
            raise HTTPException(
                status_code=404,
                detail="Response plan not found."
            )
        return plan
    except HTTPException:
        raise
    except Exception as error:
        print("❌ ERROR /response-plans/{id}:", error)
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve response plan."
        )


# ==========================================================
# ANALYTICS
# ==========================================================

@router.get("/analytics")
def analytics():
    """
    Retrieve detailed disaster analytics.

    Returns:

        Overview
        Disaster type distribution
        Severity distribution
        Top locations
        Recent incidents
    """

    try:

        return get_analytics()

    except Exception as error:

        print(
            "❌ ERROR /analytics:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=
                "Unable to retrieve disaster analytics."
        )


# ==========================================================
# API STATUS
# ==========================================================

@router.get("/api-status")
def api_status():
    """
    Check Disaster API status.
    """

    return {

        "success": True,

        "status": "online",

        "service":
            "Disaster AI API"
    }