from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./disaster_response.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

# ==========================================================
# SAFE LOCAL DATABASE MIGRATION
# ==========================================================

def ensure_response_plan_columns():
    """Add AI response-plan columns to an existing SQLite DB."""
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    if "disaster_reports" not in tables:
        return

    existing = {column["name"] for column in inspector.get_columns("disaster_reports")}

    additions = {
        "ai_severity": "TEXT",
        "prediction_json": "TEXT",
        "resources_json": "TEXT",
        "notification_json": "TEXT",
    }

    with engine.begin() as connection:
        for name, sql_type in additions.items():
            if name not in existing:
                connection.execute(
                    text(f"ALTER TABLE disaster_reports ADD COLUMN {name} {sql_type}")
                )
