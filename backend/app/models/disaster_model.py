from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime
)

from backend.app.database.database import Base


class Disaster(Base):
    __tablename__ = "disaster_reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    disaster_type = Column(
        String,
        nullable=False
    )

    country = Column(
        String,
        nullable=False
    )

    state = Column(
        String,
        nullable=False
    )

    city = Column(
        String,
        nullable=False
    )

    latitude = Column(
        Float,
        nullable=False
    )

    longitude = Column(
        Float,
        nullable=False
    )

    severity = Column(
        String,
        nullable=False
    )

    affected_people = Column(
        Integer,
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    reported_by = Column(
        String,
        nullable=False
    )

    report_time = Column(
        DateTime,
        nullable=False
    )

    ai_severity = Column(
        String,
        nullable=True
    )

    prediction_json = Column(
        Text,
        nullable=True
    )

    resources_json = Column(
        Text,
        nullable=True
    )

    notification_json = Column(
        Text,
        nullable=True
    )
