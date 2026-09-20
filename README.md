# AI-Driven Multi-Agent Disaster Response

An AI-driven disaster-response command center that coordinates multiple specialized agents to analyze disaster reports, estimate severity, predict impact, allocate emergency resources, prepare notifications, and persist response plans.

## Project Overview

Traditional disaster-response workflows often require several teams to collect information, assess severity, allocate resources, and communicate decisions. This project demonstrates how a **multi-agent architecture** can coordinate those tasks through a single FastAPI-based application.

A submitted disaster report moves through the following workflow:

```text
Disaster Report
      |
      v
Coordinator Agent
      |
      +--> Validation Agent
      +--> Severity Agent
      +--> Prediction Agent
      +--> Resource Coordinator
              |
              +--> Food Agent
              +--> Water Agent
              +--> Shelter Agent
              +--> Medical Agent
              +--> Rescue Agent
              +--> Police Agent
              +--> Transport Agent
      |
      +--> Notification Agent
      |
      v
SQLite Persistence + Response Plan
      |
      v
Dashboard / Reports / Analytics
```

## Key Features

- Disaster reporting with structured validation
- 40 supported disaster types
- Multi-agent coordination
- AI-style severity scoring
- Impact and evacuation prediction
- Seven specialized resource agents
- Persistent response plans
- Notification message generation
- Interactive Leaflet map
- Dashboard statistics and analytics
- FastAPI REST API and automatic Swagger documentation
- SQLite persistence for a lightweight local/demo deployment
- Automated unit tests for schema and agent workflow

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Map | Leaflet.js |
| Backend | Python, FastAPI |
| Validation | Pydantic |
| Database | SQLite |
| ORM | SQLAlchemy |
| API Server | Uvicorn |
| Version Control | Git / GitHub |

## Project Structure

```text
AI-Driven-Multi-Agent-Disaster-Response/
|
+-- backend/
|   +-- app/
|       +-- agents/
|       +-- api/
|       +-- database/
|       +-- models/
|       +-- services/
|       +-- main.py
|
+-- frontend/
|   +-- css/
|   +-- js/
|   +-- index.html
|
+-- screenshots/
+-- tests/
+-- .gitignore
+-- requirements.txt
+-- README.md
```

## How the System Works

### 1. Disaster Report

The user submits a disaster type, location, severity, affected population, description, and reporter information.

### 2. Coordinator Agent

The Coordinator Agent controls the order of the specialized agents and combines their outputs into one response.

### 3. Validation Agent

Checks whether the submitted disaster type belongs to the application's supported disaster catalogue.

### 4. Severity Agent

Calculates an AI-style severity level using disaster type, affected population, and the reported severity.

### 5. Prediction Agent

Estimates spread risk, priority, evacuation requirement, and expected impact from the report information.

### 6. Resource Coordinator

Calls seven specialized resource agents:

- Food
- Water
- Shelter
- Medical
- Rescue
- Police
- Transport

Each agent produces a resource allocation plan based on the affected population, disaster type, and AI severity.

### 7. Notification Agent

Generates an emergency notification message from the coordinated analysis. External WhatsApp delivery is planned as a future integration.

### 8. Persistence and Analytics

The completed report and response-plan data are stored in SQLite. The dashboard exposes reports, locations, statistics, response plans, and analytics.

## Installation

### Prerequisites

- Python 3.12+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/seran4595/AI-Driven-Multi-Agent-Disaster-Response.git
cd AI-Driven-Multi-Agent-Disaster-Response
```

### 2. Create a virtual environment

Windows PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```powershell
pip install -r requirements.txt
```

### 4. Start the application

Run from the project root:

```powershell
uvicorn backend.app.main:app --reload
```

### 5. Open the application

- Dashboard: `http://127.0.0.1:8000/`
- API documentation: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

The SQLite database file is created locally when the application starts. It is intentionally ignored by Git so local runtime data is not committed to the repository.

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Check server status |
| `/report-disaster` | POST | Submit and process a disaster report |
| `/disasters` | GET | Retrieve saved disaster reports |
| `/dashboard-summary` | GET | Dashboard statistics |
| `/analytics` | GET | Detailed analytics |
| `/response-plans` | GET | Retrieve saved response plans |
| `/response-plans/{id}` | GET | Retrieve one response plan |

## Testing

Run the built-in tests from the project root:

```powershell
python -m unittest discover -s tests -v
```

The tests cover:

- Disaster schema validation
- Severity validation values
- Supported disaster-type consistency
- Coordinator workflow
- Presence of all seven resource-agent outputs

## Screenshots

The `screenshots/` directory contains project evidence captured during development, including the architecture, FastAPI documentation, API testing, backend execution, and project review screens.

## Database Note

The current project uses **SQLite** because it is simple to run locally and requires no separate database server. The architecture can later be migrated to PostgreSQL by changing the SQLAlchemy database configuration and deployment settings.

## Future Scope

- WhatsApp Cloud API integration through the Notification Agent
- External live disaster and weather data sources
- PostgreSQL deployment for larger multi-user environments
- Authentication and role-based access control
- Cloud deployment and containerization
- More advanced predictive models trained on historical disaster data

## Project Status

The core multi-agent disaster-response workflow is implemented. The current focus is final cleanup, automated testing, documentation, and stable end-to-end demonstration before external notification integration.

## Academic Project

**Project:** AI-Driven Multi-Agent Disaster Response  
**Purpose:** Demonstration of AI agents, API development, database persistence, analytics, and coordinated emergency resource planning.
