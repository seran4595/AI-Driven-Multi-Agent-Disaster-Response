# 🚨 AI-Driven Multi-Agent Disaster Response Command Center

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141.1-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![ReportLab](https://img.shields.io/badge/ReportLab-PDF%20Engine-D12420?style=for-the-badge)](https://www.reportlab.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Dispatch%20Engine-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://www.whatsapp.com/)

An autonomous, multi-agent emergency response and disaster management command center. Built with **FastAPI**, **ReportLab**, and **Leaflet.js**, the platform orchestrates nine specialized AI agents to validate incident reports, compute dynamic multi-factor severity scores, forecast humanitarian impact, generate legally structured Incident Action Plan (IAP) PDFs, and automatically dispatch tactical emergency alerts across 8 government response agencies with live turn-by-turn GPS navigation.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Multi-Agent Swarm Breakdown](#-multi-agent-swarm-breakdown)
- [Automated Dispatch & Tactical PDF Generation](#-automated-dispatch--tactical-pdf-generation)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Installation & Quickstart](#-installation--quickstart)
- [API Reference](#-api-reference)
- [Verification & Automated Tests](#-verification--automated-tests)
- [Screenshots & Visual Evidence](#-screenshots--visual-evidence)
- [Future Scope](#-future-scope)

---

## 🏛️ System Architecture

When an emergency report is submitted via the command center or REST API, the **Coordinator Agent** triggers an end-to-end multi-agent pipeline:

```text
                                [ Emergency Disaster Report ]
                                              │
                                              ▼
                                 ┌─────────────────────────┐
                                 │    Coordinator Agent    │
                                 └────────────┬────────────┘
                                              │
                 ┌────────────────────────────┼────────────────────────────┐
                 ▼                            ▼                            ▼
      ┌──────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────┐
      │   Validation Agent   │   │     Severity Agent       │   │   Prediction Agent   │
      │ (40 Disaster Types)  │   │  (Multi-Factor Scoring)  │   │ (Evacuation & Spread)│
      └──────────────────────┘   └──────────────────────────┘   └──────────────────────┘
                                              │
                                              ▼
                               ┌──────────────────────────────┐
                               │     Resource Coordinator     │
                               └──────────────┬───────────────┘
                                              │
                 ┌───────────────┬────────────┼───────────┬───────────────┐
                 ▼               ▼            ▼           ▼               ▼
           ┌───────────┐   ┌───────────┐ ┌─────────┐ ┌─────────┐   ┌─────────────┐
           │Food Agent │   │Water Agent│ │Shelter  │ │Medical  │   │Rescue, Police│
           │(Logistics)│   │(Hydration)│ │(Camps)  │ │(EMS/ICU)│   │& Transport  │
           └───────────┘   └───────────┘ └─────────┘ └─────────┘   └─────────────┘
                                              │
                                              ▼
                               ┌──────────────────────────────┐
                               │      Notification Agent      │
                               │  (Multi-Agency Dispatching)  │
                               └──────────────┬───────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │ Automated PDF Engine    │                     │ WhatsApp Multi-Agency   │
         │ - Master IAP Document   │                     │ - 8 Response Agencies   │
         │ - Tactical Orders       │                     │ - Turn-by-Turn GPS Nav  │
         │ - ReportLab Integration │                     │ - Direct Action Links   │
         └────────────┬────────────┘                     └────────────┬────────────┘
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │ SQLite Persistence & Dashboard  │
                             │ - Geospatial Heatmap (Leaflet)  │
                             │ - Real-Time Command Analytics   │
                             │ - Direct Download & Dispatch UI │
                             └─────────────────────────────────┘
```

---

## 🚀 Key Features

- **40 Standardized Disaster Profiles:** Real-time validation for floods, earthquakes, chemical spills, tsunamis, wildfires, cyclones, nuclear leaks, landslides, and more.
- **Intelligent Severity Calculation:** Computes true severity using population thresholds, hazard volatility matrices, and verified human casualties.
- **Dynamic Resource Quotas:** Calculates exact requirements for food rations, water packets, medical personnel, ambulances, evacuation buses, police barricades, and heavy rescue machinery.
- **Automated PDF Engine:**
  - **Master Incident Action Plan (IAP):** Complete multi-page executive command PDF for National/State Disaster Management Authorities.
  - **8 Departmental Action Orders:** Standalone, high-priority PDF orders tailored specifically for individual responding agencies.
- **Automated Multi-Agency WhatsApp Dispatch:**
  - One-click and automated alerts configured for **8 Key Departments** (NDRF, Police, Fire/Rescue, Medical, Food, Water, Shelter, and Transport).
  - Includes **Live Turn-by-Turn GPS Navigation** links (`https://www.google.com/maps/dir/...`) directly routing teams to ground zero.
  - Generates direct download links to official PDF action orders in every alert.
  - Clean URL encoding compatible with **WhatsApp Web**, **WhatsApp Mobile App**, and `wa.me` links.
- **Interactive Command Dashboard:**
  - Real-time **Leaflet.js** map with custom severity markers, radar circles, and pulse animations.
  - Multi-agency alert preview modal with clipboard copy and instant dispatch.
  - Real-time incident analytics, summary statistics, and audit trail of all deployed plans.

---

## 🤖 Multi-Agent Swarm Breakdown

| Agent | Responsibility | Core Logic & Output |
|---|---|---|
| **Coordinator Agent** | Workflow Orchestration | Sequences the pipeline, validates inputs, merges agent results, and records the complete response plan. |
| **Validation Agent** | Input & Taxonomy Integrity | Validates geographic coordinates, casualty counts, and ensures the disaster matches the 40-class registry. |
| **Severity Agent** | Multi-Factor Risk Assessment | Dynamically scores severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) using mathematical multipliers on affected populations. |
| **Prediction Agent** | Humanitarian Impact Forecasting | Forecasts evacuation urgency, displacement timeline, hospital bed overload risks, and geographic spread radius. |
| **Food Agent** | Food & Ration Supply Chain | Estimates dry ration kits, baby food units, community kitchen requirements, and logistics staging points. |
| **Water Agent** | Hydration & Potable Supply | Calculates drinking water pouches (liters/day), mobile purification units, and chlorine distribution squads. |
| **Shelter Agent** | Displaced Citizen Housing | Calculates emergency relief camps, weather-proof family tents, hygiene kits, and bedding materials. |
| **Medical Agent** | Healthcare & Emergency Trauma | Allocates trauma teams, paramedics, emergency field hospitals, blood units, and anti-epidemic medicines. |
| **Rescue Agent** | Search, Extraction & Evacuation | Deploys National Disaster Response Force (NDRF) squads, inflatable motorboats, and drone reconnaissance teams. |
| **Police Agent** | Perimeter Security & Law Enforcement | Allocates crowd-control squads, green-corridor escorts for relief trucks, and anti-looting neighborhood patrols. |
| **Transport Agent** | Fleet Mobility & Evacuation Transit | Mobilizes evacuation passenger buses, 4x4 heavy-cargo trucks, emergency fuel tankers, and logistics transit hubs. |
| **Notification Agent** | Incident Communication Engine | Formulates emergency dispatch bulletins for field commanders, national media, and multi-agency field squads. |

---

## 📄 Automated Dispatch & Tactical PDF Generation

The platform provides a dual-channel dispatch pipeline:

### 1. Master & Departmental PDF Action Orders
Built on the **ReportLab** layout engine:
- Includes high-contrast national emergency headers, official incident IDs, verified GPS coordinates, and authorized coordinator sign-offs.
- **Master IAP:** Summarizes all 7 resource agent mandates into an authoritative executive report.
- **Departmental Orders:** Individual PDFs generated for each agency detailing their specific quota mandates, contact phones, and deployment steps.

### 2. Multi-Agency WhatsApp Dispatch Directory
Direct notifications are pre-formatted for 8 specialized field agencies:

```text
1. Central Command / State EOC     (+91 73970 71819)
2. NDRF & Disaster Rescue          (+91 93613 00871)
3. Fire & Rescue Services          (+91 95003 30279)
4. Medical & Health Services       (+91 73970 71819)
5. Food & Civil Supplies           (+91 93613 00871)
6. Water Supply & Sanitation       (+91 95003 30279)
7. Police & Traffic Management     (+91 73970 71819)
8. Transport & Fleet Logistics     (+91 95003 30279)
```

Each WhatsApp dispatch includes:
- Hazard category and severity rating
- Total affected population and casualty numbers
- Immediate resource quota allocations
- **Clickable Google Maps Turn-by-Turn GPS navigation**
- **Direct link to download the official tactical order PDF**

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend Core** | Python 3.12, FastAPI, Uvicorn (ASGI) |
| **Agent Framework** | Modular Rule-Based & Multi-Factor Heuristic AI Swarm |
| **Document Engine** | ReportLab 4.x (Automated PDF Generation) |
| **Data Persistence** | SQLite 3, SQLAlchemy 2.0 ORM |
| **Data Validation** | Pydantic v2 |
| **Frontend UI** | HTML5, CSS3 (Modern Glassmorphism & Cyber-Tactical Theme), Vanilla JS |
| **Geospatial Mapping** | Leaflet.js, OpenStreetMap tiles |
| **Dispatch Protocol** | WhatsApp Web API, WhatsApp Mobile Scheme (`api.whatsapp.com`), Google Maps Routing API |
| **Testing** | Python standard `unittest` framework |

---

## 📂 Project Directory Structure

```text
AI-Driven-Multi-Agent-Disaster-Response/
├── backend/
│   └── app/
│       ├── agents/                      # Specialized AI Agent implementations
│       │   ├── coordinator.py           # Swarm orchestrator
│       │   ├── validation_agent.py      # Taxonomy & schema verification
│       │   ├── severity_agent.py        # Dynamic severity scoring
│       │   ├── prediction_agent.py      # Evacuation & impact prediction
│       │   ├── food_agent.py            # Food & ration logistics
│       │   ├── water_agent.py           # Potable water & purification
│       │   ├── shelter_agent.py         # Relief camp & bedding allocation
│       │   ├── medical_agent.py         # Healthcare & trauma response
│       │   ├── rescue_agent.py          # Search & rescue deployments
│       │   ├── police_agent.py          # Perimeter security & green corridors
│       │   ├── transport_agent.py       # Bus fleets & supply trucks
│       │   └── notification_agent.py   # Multi-agency alert synthesizer
│       ├── api/
│       │   └── disaster_routes.py       # FastAPI REST endpoints
│       ├── database/
│       │   ├── connection.py            # SQLite database engine
│       │   └── crud.py                  # Database operations
│       ├── models/
│       │   ├── disaster_model.py        # SQLAlchemy database entities
│       │   └── schema.py                # Pydantic validation schemas
│       ├── services/
│       │   ├── disaster_service.py      # Core business workflows
│       │   ├── pdf_service.py           # ReportLab dynamic PDF generation
│       │   └── whatsapp_service.py      # Multi-agency alert encoding & dispatch
│       ├── config.py                    # Agency phone numbers & system config
│       └── main.py                      # FastAPI application entry point
├── frontend/
│   ├── css/
│   │   └── style.css                    # Cyber-tactical dashboard styling
│   ├── js/
│   │   └── app.js                       # Map rendering, API client, & dispatch UI
│   └── index.html                       # Tactical incident command dashboard
├── data/
│   └── reports/                         # Generated Action Plan PDFs (Git-ignored)
├── screenshots/                         # System execution screenshots & architecture
├── tests/                               # Automated unit test suite
│   ├── test_agents.py                   # Agent workflow tests
│   └── test_schema.py                   # Input schema validation tests
├── requirements.txt                     # Python package dependencies
└── README.md                            # Project documentation
```

---

## ⚡ Installation & Quickstart

### Prerequisites
- **Python 3.12+** installed on your system.
- **Git** for version control.

### 1. Clone the Repository
```bash
git clone https://github.com/seran4595/AI-Driven-Multi-Agent-Disaster-Response.git
cd AI-Driven-Multi-Agent-Disaster-Response
```

### 2. Set Up a Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Linux / macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Command Center Server
```bash
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

### 5. Access the Platform
- **Live Command Dashboard:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Interactive Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check Endpoint:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 📡 API Reference

### Emergency Ingestion & Management
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/report-disaster` | Submits a disaster report, runs the full agent pipeline, saves the plan, and prepares multi-agency dispatches. |
| `GET` | `/disasters` | Lists all historical and active disaster records. |
| `DELETE` | `/disasters/{id}` | Removes a specific disaster report and its associated response plan. |
| `POST` | `/disasters/clear` | Purges all historical disaster records from the database. |

### Analytics & Response Plans
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard-summary` | Aggregated dashboard metrics (active incidents, high severity counts, affected population). |
| `GET` | `/analytics` | Breakdown of disaster types, severity distributions, and geographic hotspots. |
| `GET` | `/response-plans` | Retrieves all persisted multi-agent resource allocation plans. |
| `GET` | `/response-plans/{id}` | Retrieves the full resource allocation and prediction report for a specific incident. |

### Tactical PDFs & Multi-Agency Dispatch
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/disasters/{id}/pdf` | Generates and streams the official Master Incident Action Plan (IAP) PDF. |
| `GET` | `/disasters/{id}/pdf/{dept}` | Generates and streams a department-specific action order PDF (`medical`, `rescue`, `police`, etc.). |
| `GET` | `/disasters/{id}/notifications` | Returns formatted WhatsApp messages, GPS navigation links, and direct URLs for all 8 agencies. |
| `POST` | `/disasters/{id}/whatsapp/dispatch` | Dispatches WhatsApp alerts across all agencies with confirmation logs. |
| `GET` | `/contacts` | Lists emergency department contact directory and assigned phone numbers. |
| `POST` | `/contacts/{id}` | Updates the emergency dispatch phone number for a specific department. |

---

## 🧪 Verification & Automated Tests

Run the test suite to verify schema validation and multi-agent coordination:

```bash
python -m unittest discover -s tests -v
```

### Test Coverage Highlights:
- ✅ **Validation Agent Consistency:** Rejection of non-catalogued disaster types.
- ✅ **Schema Integrity:** Validation of severity ranges, coordinates, and required fields.
- ✅ **Swarm Execution:** Verification that the Coordinator Agent invokes all seven specialized resource agents and returns complete allocations.

---

## 📸 Screenshots & Visual Evidence

The `screenshots/` directory contains visual evidence of development and execution:
- **`Architecture of Project.png`**: High-level system architecture and agent coordination flow.
- **`FASTAPI_DOCS PAGE.png`**: Swagger UI showing all interactive endpoints.
- **`POST_REPORT TESTING.png`**: End-to-end testing of disaster ingestion and response plan calculation.
- **`GET_REPORT_RESPONES.png`**: Response payload demonstrating coordinated multi-agent output.
- **`backend ruuning check.png`**: Server startup, route compilation, and live logging.

---

## 🔮 Future Scope

- **Real-Time Sensor Feeds:** Integrating USGS Earthquake APIs, Copernicus Satellite data, and OpenWeather real-time weather streams.
- **WhatsApp Cloud API Integration:** Automated background delivery via official Meta WhatsApp Business API webhooks.
- **PostgreSQL / PostGIS Support:** Enhanced spatial queries and geo-fencing for production-grade national deployment.
- **Role-Based Access Control (RBAC):** Distinct permission levels for field responders, department leads, and national directors.

---

## 📜 Academic Project Notice

- **Project:** AI-Driven Multi-Agent Disaster Response Command Center
- **Core Domain:** Artificial Intelligence, Multi-Agent Coordination Systems, Emergency Resource Logistics, and REST API Development.
- **Developer:** Seranjeevi V ([@seran4595](https://github.com/seran4595))
