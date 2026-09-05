from backend.app.agents.validation_agent import validate_disaster
from backend.app.agents.severity_agent import analyze_severity
from backend.app.agents.prediction_agent import predict_disaster
from backend.app.agents.resource_agent import allocate_resources
from backend.app.agents.notification_agent import generate_notification


def process_disaster(disaster):
    """
    ==========================================================
                    COORDINATOR AGENT
    ==========================================================

    Controls all AI agents in sequence.

    Workflow:
    1. Validation
    2. Severity Analysis
    3. Disaster Prediction
    4. Resource Allocation
    5. Notification Preparation
    """

    # ---------------------------------------------
    # Step 1 : Validation
    # ---------------------------------------------
    if not validate_disaster(disaster):
        return {
            "success": False,
            "message": "❌ Invalid Disaster Type"
        }

    # ---------------------------------------------
    # Step 2 : Severity Analysis
    # ---------------------------------------------
    ai_severity = analyze_severity(disaster)

    # ---------------------------------------------
    # Step 3 : Prediction
    # ---------------------------------------------
    prediction = predict_disaster(disaster, ai_severity)

    # ---------------------------------------------
    # Step 4 : Resource Allocation
    # ---------------------------------------------
    resources = allocate_resources(disaster, ai_severity)

    # ---------------------------------------------
    # Step 5 : Notification Preparation
    # ---------------------------------------------
    notification = generate_notification(
        disaster,
        ai_severity,
        prediction,
        resources
    )

    # ---------------------------------------------
    # Final Result
    # ---------------------------------------------
    return {

        "success": True,

        "AI_Severity": ai_severity,

        "Prediction": prediction,

        "Resources": resources,

        "Notification": notification

    }