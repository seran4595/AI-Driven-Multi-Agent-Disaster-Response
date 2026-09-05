import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.api.disaster_routes import router
from backend.app.database.database import engine, Base, ensure_response_plan_columns
from backend.app.models.disaster_model import Disaster


# ==========================================================
# APP
# ==========================================================

app = FastAPI(
    title="AI-Driven Multi-Agent Disaster Response",
    description="Backend API for an AI-powered disaster response system",
    version="2.1.0"
)


# ==========================================================
# DATABASE
# ==========================================================

Base.metadata.create_all(
    bind=engine
)

# Add new response-plan columns to existing databases safely.
ensure_response_plan_columns()


# ==========================================================
# API ROUTES
# ==========================================================

app.include_router(router)


@app.get("/health")
def health():

    return {
        "status": "Server is running successfully"
    }


# ==========================================================
# FRONTEND PATH
# ==========================================================

PROJECT_ROOT = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".."
    )
)


FRONTEND_DIR = os.path.join(
    PROJECT_ROOT,
    "frontend"
)


CSS_DIR = os.path.join(
    FRONTEND_DIR,
    "css"
)


JS_DIR = os.path.join(
    FRONTEND_DIR,
    "js"
)


# ==========================================================
# DEBUG INFORMATION
# ==========================================================

print("")
print("======================================")
print(" DISASTER AI SERVER")
print("======================================")
print("Project root :", PROJECT_ROOT)
print("Frontend     :", FRONTEND_DIR)
print("CSS folder   :", CSS_DIR)
print("JS folder    :", JS_DIR)
print("======================================")
print("CSS exists   :", os.path.exists(
    os.path.join(CSS_DIR, "style.css")
))
print("JS exists    :", os.path.exists(
    os.path.join(JS_DIR, "app.js")
))
print("======================================")
print("")


# ==========================================================
# STATIC FILES
# ==========================================================

app.mount(
    "/static",
    StaticFiles(
        directory=FRONTEND_DIR
    ),
    name="static"
)


# ==========================================================
# FRONTEND
# ==========================================================

@app.get("/")
def home():

    return FileResponse(
        os.path.join(
            FRONTEND_DIR,
            "index.html"
        )
    )