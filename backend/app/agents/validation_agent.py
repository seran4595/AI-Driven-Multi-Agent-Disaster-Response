from backend.app.models.schema import DISASTER_TYPES


VALID_DISASTERS = set(DISASTER_TYPES)


def validate_disaster(disaster):
    """Validate the disaster type against the API-supported types."""
    return disaster.disaster_type in VALID_DISASTERS
