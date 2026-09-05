# ==========================================================
# NOTIFICATION AGENT
# ==========================================================
# Phase 4: prepares an emergency notification payload.
# Actual WhatsApp delivery is intentionally not performed here.
# Phase 5 will connect this payload to Meta WhatsApp Cloud API.
# ==========================================================


RESOURCE_AGENTS = [
    "Food",
    "Water",
    "Shelter",
    "Medical",
    "Rescue",
    "Police",
    "Transport",
]


def _location_label(disaster):
    """Build a human-readable disaster location."""
    city = getattr(disaster, "city", None) or "Unknown city"
    state = getattr(disaster, "state", None) or ""
    country = getattr(disaster, "country", None) or ""

    parts = [str(city).strip()]
    if str(state).strip():
        parts.append(str(state).strip())
    if str(country).strip():
        parts.append(str(country).strip())

    return ", ".join(parts)


def _severity_text(ai_severity):
    """Normalize the AI severity for the alert."""
    if ai_severity is None:
        return "UNKNOWN"

    return str(ai_severity).strip() or "UNKNOWN"


def _get_prediction_value(prediction, key, default="—"):
    if isinstance(prediction, dict):
        value = prediction.get(key)
        if value is not None and str(value).strip():
            return value
    return default


def generate_notification(disaster, ai_severity, prediction, resources):
    """
    Prepare a delivery-ready emergency notification.

    This function does NOT contact WhatsApp or any external service.
    It creates the structured payload that Phase 5 can send through
    Meta WhatsApp Cloud API.
    """

    location = _location_label(disaster)
    severity = _severity_text(ai_severity)

    disaster_type = getattr(disaster, "disaster_type", "Disaster")
    affected_people = getattr(disaster, "affected_people", 0)

    priority = _get_prediction_value(
        prediction,
        "Priority",
        getattr(disaster, "severity", "—"),
    )

    evacuation = _get_prediction_value(
        prediction,
        "Evacuation",
        "Follow emergency authority instructions",
    )

    alert_text = (
        "🚨 DISASTER EMERGENCY ALERT\n"
        f"Type: {disaster_type}\n"
        f"AI Severity: {severity}\n"
        f"Priority: {priority}\n"
        f"Location: {location}\n"
        f"Affected People: {affected_people}\n"
        f"Evacuation: {evacuation}\n\n"
        "Emergency response teams have been notified. "
        "Please follow official emergency instructions."
    )

    return {
        "status": "READY",
        "channel": "META_WHATSAPP_CLOUD_API",
        "delivery": "PENDING_META_WHATSAPP",
        "alert_text": alert_text,
        "location": {
            "latitude": getattr(disaster, "latitude", None),
            "longitude": getattr(disaster, "longitude", None),
            "label": location,
        },
        "summary": {
            "disaster_type": disaster_type,
            "ai_severity": severity,
            "priority": priority,
            "evacuation": evacuation,
            "affected_people": affected_people,
        },
        "resource_agents": RESOURCE_AGENTS.copy(),
    }
