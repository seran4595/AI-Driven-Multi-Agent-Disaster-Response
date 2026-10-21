# ==========================================================
# DISASTER AI COMMAND CENTER
# DISASTER API ROUTES
# ==========================================================

import os
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse

from backend.app.models.schema import DisasterReport

from backend.app.services.disaster_service import (
    add_disaster,
    get_all_disasters,
    get_dashboard_summary,
    get_analytics,
    get_response_plans,
    get_response_plan,
    delete_disaster,
    clear_all_disasters
)

from backend.app.config import get_all_contacts, update_contact_phone
from backend.app.services.pdf_service import (
    generate_master_disaster_pdf,
    generate_department_disaster_pdf
)
from backend.app.services.whatsapp_service import (
    prepare_all_notifications,
    send_whatsapp_alert,
    build_department_message
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
        SQLite
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
            result.get("Resources"),
            result.get("Notification")
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
            detail="Unable to retrieve disaster reports."
        )


# ==========================================================
# DELETE DISASTER / CLEAR ALL
# ==========================================================

@router.delete("/disasters/{disaster_id}")
def delete_single_disaster(disaster_id: int):
    """Delete a single disaster report and its AI response plan."""
    try:
        success = delete_disaster(disaster_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Disaster report #{disaster_id} not found."
            )
        return {
            "success": True,
            "message": f"Disaster report #{disaster_id} deleted successfully."
        }
    except HTTPException:
        raise
    except Exception as error:
        print("❌ ERROR DELETE /disasters/{id}:", error)
        raise HTTPException(
            status_code=500,
            detail="Unable to delete disaster report."
        )


@router.post("/disasters/clear")
@router.delete("/disasters")
def clear_disasters():
    """Clear all disaster reports to start with a fresh empty database."""
    try:
        result = clear_all_disasters()
        return {
            "success": True,
            "message": "All disaster reports cleared successfully.",
            "deleted": result.get("deleted", 0)
        }
    except Exception as error:
        print("❌ ERROR /disasters/clear:", error)
        raise HTTPException(
            status_code=500,
            detail="Unable to clear disaster reports."
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


# ==========================================================
# CONTACTS CONFIGURATION
# ==========================================================

@router.get("/contacts")
def list_contacts():
    """Retrieve all configured department WhatsApp contacts."""
    return {
        "success": True,
        "contacts": get_all_contacts()
    }


@router.post("/contacts/{contact_id}")
async def update_contact(contact_id: str, request: Request):
    """Update phone number for a specific department."""
    try:
        body = await request.json()
        phone = body.get("phone", "")
        updated = update_contact_phone(contact_id, phone)
        if not updated:
            raise HTTPException(status_code=404, detail=f"Contact '{contact_id}' not found.")
        return {
            "success": True,
            "message": f"Updated {updated['name']} phone number.",
            "contact": updated
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update contact: {str(e)}")


# ==========================================================
# PDF GENERATION & DOWNLOAD
# ==========================================================

@router.get("/disasters/{disaster_id}/pdf")
def download_master_pdf(disaster_id: int):
    """
    Generate and download the Master Incident Action Plan (IAP) PDF
    intended for Central Command / EOC.
    """
    plan = get_response_plan(disaster_id)
    if not plan:
        raise HTTPException(
            status_code=404,
            detail=f"Disaster incident #{disaster_id} response plan not found."
        )

    try:
        pdf_path = generate_master_disaster_pdf(plan)
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="Failed to locate generated Master PDF.")
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"Disaster_{disaster_id}_Master_IAP.pdf"
        )
    except Exception as e:
        print("❌ ERROR generating master PDF:", e)
        raise HTTPException(status_code=500, detail=f"Unable to generate Master PDF: {str(e)}")


@router.get("/disasters/{disaster_id}/pdf/{department}")
def download_department_pdf(disaster_id: int, department: str):
    """
    Generate and download a Department-Specific Action Order PDF
    (food, water, shelter, medical, rescue, police, transport).
    """
    plan = get_response_plan(disaster_id)
    if not plan:
        raise HTTPException(
            status_code=404,
            detail=f"Disaster incident #{disaster_id} response plan not found."
        )

    clean_dept = department.lower().strip()
    valid_depts = ["food", "water", "shelter", "medical", "rescue", "police", "transport"]
    if clean_dept not in valid_depts:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid department '{department}'. Must be one of {valid_depts}"
        )

    try:
        pdf_path = generate_department_disaster_pdf(plan, clean_dept)
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="Failed to locate generated Department PDF.")
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"Disaster_{disaster_id}_{clean_dept.capitalize()}_Order.pdf"
        )
    except Exception as e:
        print(f"❌ ERROR generating {department} PDF:", e)
        raise HTTPException(status_code=500, detail=f"Unable to generate Department PDF: {str(e)}")


# ==========================================================
# WHATSAPP NOTIFICATIONS SUITE & DISPATCH
# ==========================================================

@router.get("/disasters/{disaster_id}/notifications")
def get_disaster_notifications(disaster_id: int, request: Request):
    """
    Get the complete multi-agency WhatsApp notification suite:
    Master plan for Central Command and separate targeted action orders
    for each of the 7 resource allocation departments with PDF links & wa.me URLs.
    """
    plan = get_response_plan(disaster_id)
    if not plan:
        raise HTTPException(
            status_code=404,
            detail=f"Disaster incident #{disaster_id} response plan not found."
        )

    base_url = f"{request.url.scheme}://{request.url.netloc}"
    suite = prepare_all_notifications(plan, base_url)
    return {
        "success": True,
        "disaster_id": disaster_id,
        "suite": suite
    }


@router.post("/disasters/{disaster_id}/whatsapp/dispatch")
async def dispatch_whatsapp_notification(disaster_id: int, request: Request):
    """
    Dispatch WhatsApp emergency notification to one or all 8 departments.
    Payload: { "channel": "all" | "central_command" | "food" | "water" | ... }
    """
    plan = get_response_plan(disaster_id)
    if not plan:
        raise HTTPException(
            status_code=404,
            detail=f"Disaster incident #{disaster_id} response plan not found."
        )

    try:
        body = await request.json()
    except Exception:
        body = {}

    target_channel = body.get("channel", "all").lower().strip()
    base_url = f"{request.url.scheme}://{request.url.netloc}"
    suite = prepare_all_notifications(plan, base_url)
    channels = suite.get("channels", {})

    dispatched = []

    if target_channel == "all":
        for ch_id, ch_data in channels.items():
            res = send_whatsapp_alert(ch_data["phone"], ch_data["message_text"])
            dispatched.append({
                "channel_id": ch_id,
                "name": ch_data["dept_name"],
                "phone": ch_data["formatted_phone"],
                "result": res,
                "wa_link": ch_data["wa_link"]
            })
    elif target_channel in channels:
        ch_data = channels[target_channel]
        res = send_whatsapp_alert(ch_data["phone"], ch_data["message_text"])
        dispatched.append({
            "channel_id": target_channel,
            "name": ch_data["dept_name"],
            "phone": ch_data["formatted_phone"],
            "result": res,
            "wa_link": ch_data["wa_link"]
        })
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown channel '{target_channel}'. Valid: 'all', {list(channels.keys())}"
        )

    return {
        "success": True,
        "message": f"WhatsApp dispatch initiated for target: {target_channel}",
        "disaster_id": disaster_id,
        "dispatched_count": len(dispatched),
        "dispatches": dispatched
    }