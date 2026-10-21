// =====================================================
// DISASTER AI COMMAND CENTER
// APP.JS v5.0 - TACTICAL DISASTER EMBLEMS & UI SYSTEM
// =====================================================

let map = null;
let markersLayer = null;
let currentLocations = [];

let locationPickerMap = null;
let locationPickerMarker = null;
let selectedCoordinates = null;

let allSavedPlans = [];
let activePlanFilter = "all";
let planSearchQuery = "";
let currentActivePlan = null;

// =====================================================
// =====================================================
// DISASTER METADATA & THEME REGISTRY (ALL 40 DISASTERS)
// Standardized single fitted glyphs & executive command styling
// =====================================================
const DISASTER_THEMES = {
    // Water & Marine Hazards
    "Flood": {
        icon: "🌊",
        category: "Hydrological Hazard",
        group: "water",
        themeClass: "disaster-theme-flood",
        color: "#0284c7",
        accent: "#38bdf8",
        glow: "rgba(2, 132, 199, 0.25)",
        badge: "FLOOD RESPONSE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(14, 28, 48, 0.9))"
    },
    "Flash Flood": {
        icon: "🌊",
        category: "Hydrological Hazard",
        group: "water",
        themeClass: "disaster-theme-flood",
        color: "#0284c7",
        accent: "#38bdf8",
        glow: "rgba(2, 132, 199, 0.25)",
        badge: "FLASH FLOOD",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(14, 28, 48, 0.9))"
    },
    "River Flood": {
        icon: "🏞️",
        category: "Hydrological Hazard",
        group: "water",
        themeClass: "disaster-theme-flood",
        color: "#0284c7",
        accent: "#38bdf8",
        glow: "rgba(2, 132, 199, 0.25)",
        badge: "RIVER FLOOD",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(14, 28, 48, 0.9))"
    },
    "Coastal Flood": {
        icon: "🌊",
        category: "Coastal Surge",
        group: "water",
        themeClass: "disaster-theme-flood",
        color: "#0284c7",
        accent: "#38bdf8",
        glow: "rgba(2, 132, 199, 0.25)",
        badge: "COASTAL SURGE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(14, 28, 48, 0.9))"
    },
    "Tsunami": {
        icon: "🌊",
        category: "Oceanic Disaster",
        group: "water",
        themeClass: "disaster-theme-tsunami",
        color: "#0284c7",
        accent: "#38bdf8",
        glow: "rgba(2, 132, 199, 0.3)",
        badge: "TSUNAMI ALERT",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(14, 28, 48, 0.9))"
    },

    // Storms & Severe Atmospheric Hazards
    "Cyclone": {
        icon: "🌀",
        category: "Meteorological Vortex",
        group: "storm",
        themeClass: "disaster-theme-cyclone",
        color: "#475569",
        accent: "#60a5fa",
        glow: "rgba(96, 165, 250, 0.25)",
        badge: "CYCLONE TRACK",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(20, 29, 46, 0.9))"
    },
    "Hurricane": {
        icon: "🌀",
        category: "Tropical Cyclone",
        group: "storm",
        themeClass: "disaster-theme-cyclone",
        color: "#475569",
        accent: "#60a5fa",
        glow: "rgba(96, 165, 250, 0.25)",
        badge: "HURRICANE TRACK",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(20, 29, 46, 0.9))"
    },
    "Typhoon": {
        icon: "🌀",
        category: "Pacific Cyclone",
        group: "storm",
        themeClass: "disaster-theme-cyclone",
        color: "#475569",
        accent: "#60a5fa",
        glow: "rgba(96, 165, 250, 0.25)",
        badge: "TYPHOON ALERT",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(20, 29, 46, 0.9))"
    },
    "Tornado": {
        icon: "🌪️",
        category: "Atmospheric Vortex",
        group: "storm",
        themeClass: "disaster-theme-tornado",
        color: "#475569",
        accent: "#94a3b8",
        glow: "rgba(148, 163, 184, 0.25)",
        badge: "TORNADO VORTEX",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(24, 32, 47, 0.9))"
    },
    "Thunderstorm": {
        icon: "⛈️",
        category: "Convective Storm",
        group: "storm",
        themeClass: "disaster-theme-storm",
        color: "#475569",
        accent: "#94a3b8",
        glow: "rgba(148, 163, 184, 0.25)",
        badge: "THUNDERSTORM",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(24, 32, 47, 0.9))"
    },
    "Lightning": {
        icon: "⚡",
        category: "Electrical Strike",
        group: "storm",
        themeClass: "disaster-theme-lightning",
        color: "#d97706",
        accent: "#fbbf24",
        glow: "rgba(217, 119, 6, 0.25)",
        badge: "LIGHTNING STORM",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 26, 18, 0.9))"
    },
    "Blizzard": {
        icon: "❄️",
        category: "Severe Winter Blizzard",
        group: "storm",
        themeClass: "disaster-theme-snow",
        color: "#0284c7",
        accent: "#7dd3fc",
        glow: "rgba(2, 132, 199, 0.25)",
        badge: "BLIZZARD ALERT",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(16, 28, 44, 0.9))"
    },
    "Snowstorm": {
        icon: "🌨️",
        category: "Winter Storm",
        group: "storm",
        themeClass: "disaster-theme-snow",
        color: "#0284c7",
        accent: "#7dd3fc",
        glow: "rgba(2, 132, 199, 0.25)",
        badge: "SNOWSTORM",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(16, 28, 44, 0.9))"
    },
    "Dust Storm": {
        icon: "🌫️",
        category: "Particulate Gale",
        group: "storm",
        themeClass: "disaster-theme-sand",
        color: "#d97706",
        accent: "#f59e0b",
        glow: "rgba(217, 119, 6, 0.25)",
        badge: "DUST STORM",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 25, 16, 0.9))"
    },
    "Sandstorm": {
        icon: "🌪️",
        category: "Desert Sandstorm",
        group: "storm",
        themeClass: "disaster-theme-sand",
        color: "#d97706",
        accent: "#f59e0b",
        glow: "rgba(217, 119, 6, 0.25)",
        badge: "SANDSTORM",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 25, 16, 0.9))"
    },

    // Geological & Tectonic Hazards
    "Earthquake": {
        icon: "🌋",
        category: "Seismic Hazard",
        group: "geological",
        themeClass: "disaster-theme-earthquake",
        color: "#d97706",
        accent: "#fbbf24",
        glow: "rgba(217, 119, 6, 0.3)",
        badge: "SEISMIC ACTIVITY",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 24, 16, 0.9))"
    },
    "Aftershock": {
        icon: "〰️",
        category: "Seismic Aftermath",
        group: "geological",
        themeClass: "disaster-theme-earthquake",
        color: "#d97706",
        accent: "#fbbf24",
        glow: "rgba(217, 119, 6, 0.25)",
        badge: "AFTERSHOCK",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 24, 16, 0.9))"
    },
    "Landslide": {
        icon: "⛰️",
        category: "Geological Movement",
        group: "geological",
        themeClass: "disaster-theme-landslide",
        color: "#d97706",
        accent: "#fbbf24",
        glow: "rgba(217, 119, 6, 0.3)",
        badge: "LANDSLIDE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 24, 16, 0.9))"
    },
    "Mudslide": {
        icon: "🏔️",
        category: "Debris Flow",
        group: "geological",
        themeClass: "disaster-theme-landslide",
        color: "#d97706",
        accent: "#fbbf24",
        glow: "rgba(217, 119, 6, 0.25)",
        badge: "MUDSLIDE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 24, 16, 0.9))"
    },
    "Volcanic Eruption": {
        icon: "🌋",
        category: "Volcanic Hazard",
        group: "geological",
        themeClass: "disaster-theme-volcano",
        color: "#dc2626",
        accent: "#f87171",
        glow: "rgba(220, 38, 38, 0.3)",
        badge: "VOLCANIC ERUPTION",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(34, 16, 18, 0.9))"
    },

    // Thermal & Wildfire Hazards
    "Wildfire": {
        icon: "🔥",
        category: "Thermal Conflagration",
        group: "fire",
        themeClass: "disaster-theme-fire",
        color: "#dc2626",
        accent: "#f97316",
        glow: "rgba(220, 38, 38, 0.3)",
        badge: "WILDFIRE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(34, 18, 16, 0.9))"
    },
    "Forest Fire": {
        icon: "🌲",
        category: "Forest Conflagration",
        group: "fire",
        themeClass: "disaster-theme-fire",
        color: "#dc2626",
        accent: "#f97316",
        glow: "rgba(220, 38, 38, 0.3)",
        badge: "FOREST FIRE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(34, 18, 16, 0.9))"
    },
    "Urban Fire": {
        icon: "🏢",
        category: "Urban Fire",
        group: "fire",
        themeClass: "disaster-theme-fire",
        color: "#dc2626",
        accent: "#f97316",
        glow: "rgba(220, 38, 38, 0.3)",
        badge: "URBAN INFERNO",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(34, 18, 16, 0.9))"
    },
    "Industrial Fire": {
        icon: "🏭",
        category: "Industrial Hazard",
        group: "fire",
        themeClass: "disaster-theme-fire",
        color: "#dc2626",
        accent: "#ef4444",
        glow: "rgba(220, 38, 38, 0.3)",
        badge: "INDUSTRIAL FIRE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(34, 18, 16, 0.9))"
    },

    // Hazmat, Chemical & Radiation
    "Chemical Leak": {
        icon: "☣️",
        category: "Chemical Hazmat",
        group: "hazmat",
        themeClass: "disaster-theme-hazmat",
        color: "#059669",
        accent: "#34d399",
        glow: "rgba(5, 150, 105, 0.3)",
        badge: "CHEMICAL HAZMAT",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(14, 30, 24, 0.9))"
    },
    "Gas Leak": {
        icon: "💨",
        category: "Toxic Gas Dispersion",
        group: "hazmat",
        themeClass: "disaster-theme-gas",
        color: "#059669",
        accent: "#34d399",
        glow: "rgba(5, 150, 105, 0.3)",
        badge: "GAS LEAK",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(14, 30, 24, 0.9))"
    },
    "Oil Spill": {
        icon: "🛢️",
        category: "Environmental Contamination",
        group: "hazmat",
        themeClass: "disaster-theme-oil",
        color: "#475569",
        accent: "#94a3b8",
        glow: "rgba(100, 116, 139, 0.25)",
        badge: "OIL SPILL",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(20, 28, 40, 0.9))"
    },
    "Radiation Leak": {
        icon: "☢️",
        category: "Nuclear Hazmat",
        group: "hazmat",
        themeClass: "disaster-theme-radiation",
        color: "#d97706",
        accent: "#fbbf24",
        glow: "rgba(217, 119, 6, 0.35)",
        badge: "RADIATION LEAK",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 26, 14, 0.9))"
    },

    // Structural & Transportation Accidents
    "Building Collapse": {
        icon: "🏚️",
        category: "Structural Collapse",
        group: "structural",
        themeClass: "disaster-theme-structural",
        color: "#dc2626",
        accent: "#f87171",
        glow: "rgba(220, 38, 38, 0.25)",
        badge: "BUILDING COLLAPSE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 18, 20, 0.9))"
    },
    "Bridge Collapse": {
        icon: "🌉",
        category: "Infrastructure Failure",
        group: "structural",
        themeClass: "disaster-theme-structural",
        color: "#dc2626",
        accent: "#f87171",
        glow: "rgba(220, 38, 38, 0.25)",
        badge: "BRIDGE COLLAPSE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 18, 20, 0.9))"
    },
    "Dam Failure": {
        icon: "🌊",
        category: "Dam Breach",
        group: "structural",
        themeClass: "disaster-theme-structural",
        color: "#0284c7",
        accent: "#38bdf8",
        glow: "rgba(2, 132, 199, 0.3)",
        badge: "DAM BREACH",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(14, 28, 48, 0.9))"
    },
    "Train Accident": {
        icon: "🚆",
        category: "Transit Collision",
        group: "structural",
        themeClass: "disaster-theme-accident",
        color: "#e11d48",
        accent: "#fb7185",
        glow: "rgba(225, 29, 72, 0.25)",
        badge: "TRAIN DERAILMENT",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(34, 18, 24, 0.9))"
    },
    "Plane Crash": {
        icon: "✈️",
        category: "Aviation Incident",
        group: "structural",
        themeClass: "disaster-theme-accident",
        color: "#e11d48",
        accent: "#fb7185",
        glow: "rgba(225, 29, 72, 0.25)",
        badge: "AIR CRASH",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(34, 18, 24, 0.9))"
    },
    "Ship Accident": {
        icon: "🚢",
        category: "Maritime Incident",
        group: "structural",
        themeClass: "disaster-theme-accident",
        color: "#0284c7",
        accent: "#38bdf8",
        glow: "rgba(2, 132, 199, 0.25)",
        badge: "SHIP ACCIDENT",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(14, 28, 48, 0.9))"
    },
    "Road Accident": {
        icon: "🚗",
        category: "Vehicular Collision",
        group: "structural",
        themeClass: "disaster-theme-accident",
        color: "#d97706",
        accent: "#fbbf24",
        glow: "rgba(217, 119, 6, 0.25)",
        badge: "ROAD ACCIDENT",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 24, 16, 0.9))"
    },

    // Extreme Climate & Biological Pandemics
    "Heatwave": {
        icon: "☀️",
        category: "Thermal Extreme",
        group: "climate",
        themeClass: "disaster-theme-heat",
        color: "#ea580c",
        accent: "#fb923c",
        glow: "rgba(234, 88, 12, 0.25)",
        badge: "HEATWAVE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(34, 22, 16, 0.9))"
    },
    "Cold Wave": {
        icon: "❄️",
        category: "Cryogenic Extreme",
        group: "climate",
        themeClass: "disaster-theme-cold",
        color: "#0284c7",
        accent: "#7dd3fc",
        glow: "rgba(2, 132, 199, 0.25)",
        badge: "COLD WAVE",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(16, 28, 44, 0.9))"
    },
    "Drought": {
        icon: "🏜️",
        category: "Aridity Crisis",
        group: "climate",
        themeClass: "disaster-theme-drought",
        color: "#d97706",
        accent: "#fbbf24",
        glow: "rgba(217, 119, 6, 0.25)",
        badge: "DROUGHT",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 24, 16, 0.9))"
    },
    "Pandemic": {
        icon: "🦠",
        category: "Biological Outbreak",
        group: "climate",
        themeClass: "disaster-theme-biohazard",
        color: "#e11d48",
        accent: "#fb7185",
        glow: "rgba(225, 29, 72, 0.3)",
        badge: "PANDEMIC",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(34, 18, 24, 0.9))"
    },
    "Epidemic": {
        icon: "💉",
        category: "Regional Epidemic",
        group: "climate",
        themeClass: "disaster-theme-biohazard",
        color: "#e11d48",
        accent: "#fb7185",
        glow: "rgba(225, 29, 72, 0.3)",
        badge: "EPIDEMIC ALERT",
        bannerGrad: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(34, 18, 24, 0.9))"
    }
};

function getDisasterTheme(type) {
    if (!type) {
        return {
            icon: "🚨",
            category: "Emergency Hazard",
            group: "all",
            themeClass: "disaster-theme-default",
            color: "#ef4444",
            accent: "#f87171",
            glow: "rgba(239, 68, 68, 0.4)",
            badge: "EMERGENCY",
            bannerGrad: "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.12))"
        };
    }
    const cleanType = String(type).trim();
    if (DISASTER_THEMES[cleanType]) {
        return DISASTER_THEMES[cleanType];
    }
    const lower = cleanType.toLowerCase();
    for (const [key, theme] of Object.entries(DISASTER_THEMES)) {
        if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
            return theme;
        }
    }
    return {
        icon: "🚨",
        category: "Emergency Hazard",
        group: "all",
        themeClass: "disaster-theme-default",
        color: "#ef4444",
        accent: "#f87171",
        glow: "rgba(239, 68, 68, 0.4)",
        badge: cleanType.toUpperCase(),
        bannerGrad: "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.12))"
    };
}

function formatCompact(num) {
    const val = Number(num);
    if (!Number.isFinite(val) || val === 0) return "0";
    if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
    if (val >= 1000) return (val / 1000).toFixed(1) + "k";
    return String(val);
}

// =====================================================
// DOM READY
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeMap();
    setupNavigation();
    setupReportModal();
    setupButtons();
    setupSmartLocation();
    setupResponsePlanFilters();
    setupResultModalActions();
    setDefaultReportTime();
    loadDashboard();
});


// =====================================================
// MAIN LIVE MAP
// =====================================================

function initializeMap() {

    const mapElement = document.getElementById("map");

    if (!mapElement) {
        console.error("Main map element not found.");
        return;
    }

    map = L.map("map", {
        zoomControl: true
    }).setView(
        [20.5937, 78.9629],
        5
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

}


// =====================================================
// NAVIGATION
// =====================================================

function setupNavigation() {

    const buttons =
        document.querySelectorAll(".nav-item");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(item =>
                item.classList.remove("active")
            );

            button.classList.add("active");

            const sectionId =
                button.dataset.section;

            const section =
                document.getElementById(sectionId);

            if (section) {

                section.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

            if (sectionId === "map-section") {

                setTimeout(() => {

                    if (map) {
                        map.invalidateSize();
                    }

                }, 500);

            }

        });

    });

}


// =====================================================
// BUTTONS
// =====================================================

function setupButtons() {

    const refreshBtn =
        document.getElementById("refreshBtn");

    if (refreshBtn) {
        refreshBtn.addEventListener(
            "click",
            loadDashboard
        );
    }

    const locateAllBtn =
        document.getElementById("locateAllBtn");

    if (locateAllBtn) {
        locateAllBtn.addEventListener(
            "click",
            fitAllMarkers
        );
    }

    const clearAllBtn =
        document.getElementById("clearAllBtn");

    if (clearAllBtn) {
        clearAllBtn.addEventListener(
            "click",
            clearAllDisasters
        );
    }

}


// =====================================================
// INCIDENT DELETION & DATABASE CLEARING
// =====================================================

async function deleteReport(id) {
    if (!id) return;
    const confirmDelete = confirm(`Are you sure you want to delete incident report #${id}?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`/disasters/${Number(id)}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Failed to delete report #${id}`);
        }

        showTacticalToast(`Incident #${id} removed successfully.`, "success");

        await loadDashboard();

        const modal = document.getElementById("resultModal");
        if (modal && modal.classList.contains("show")) {
            if (currentActivePlan && Number(currentActivePlan.id || currentActivePlan.report?.id) === Number(id)) {
                modal.classList.remove("show");
            }
        }
    } catch (error) {
        console.error("Delete error:", error);
        showTacticalToast("Failed to delete incident report.", "error");
    }
}

async function clearAllDisasters() {
    const confirmClear = confirm(
        "⚠️ WARNING: Are you sure you want to clear ALL disaster reports?\n\nThis will completely empty the database so you can report your own fresh incidents."
    );
    if (!confirmClear) return;

    try {
        const response = await fetch("/disasters/clear", {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Failed to clear database");
        }

        const data = await response.json();
        showTacticalToast(`Database cleared (${data.deleted || 0} incidents removed).`, "success");

        await loadDashboard();

        const modal = document.getElementById("resultModal");
        if (modal) modal.classList.remove("show");
    } catch (error) {
        console.error("Clear error:", error);
        showTacticalToast("Failed to clear database.", "error");
    }
}



// =====================================================
// SMART LOCATION
// =====================================================

function setupSmartLocation() {

    const searchInput =
        document.getElementById("locationSearch");

    const searchButton =
        document.getElementById("searchLocationBtn");

    const currentLocationButton =
        document.getElementById(
            "useCurrentLocationBtn"
        );


    // -------------------------------------------------
    // SEARCH BUTTON
    // -------------------------------------------------

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            searchLocation
        );

    }


    // -------------------------------------------------
    // ENTER KEY SEARCH
    // -------------------------------------------------

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    searchLocation();

                }

            }
        );

    }


    // -------------------------------------------------
    // CURRENT LOCATION
    // -------------------------------------------------

    if (currentLocationButton) {

        currentLocationButton.addEventListener(
            "click",
            useCurrentLocation
        );

    }


    // -------------------------------------------------
    // INITIALIZE PICKER MAP
    // -------------------------------------------------

    initializeLocationPicker();

}


// =====================================================
// LOCATION PICKER MAP
// =====================================================

function initializeLocationPicker() {

    const pickerElement =
        document.getElementById(
            "locationPickerMap"
        );

    if (!pickerElement) {

        console.warn(
            "Location picker map element not found."
        );

        return;

    }


    locationPickerMap =
        L.map(
            "locationPickerMap"
        ).setView(
            [20.5937, 78.9629],
            5
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        locationPickerMap
    );


    // -------------------------------------------------
    // CLICK MAP
    // -------------------------------------------------

    locationPickerMap.on(
        "click",
        async event => {

            const latitude =
                event.latlng.lat;

            const longitude =
                event.latlng.lng;


            setLocationStatus(
                "Detecting location..."
            );


            await setSelectedLocation(
                latitude,
                longitude
            );

        }
    );

}


// =====================================================
// SEARCH LOCATION
// =====================================================

async function searchLocation() {

    const input =
        document.getElementById(
            "locationSearch"
        );

    const suggestions =
        document.getElementById(
            "locationSuggestions"
        );

    if (!input) return;


    const query =
        input.value.trim();


    if (!query) {

        showLocationMessage(
            "Please enter a city, area or landmark."
        );

        return;

    }


    showLocationMessage(
        "🔎 Searching location..."
    );


    try {

        const url =
            "https://nominatim.openstreetmap.org/search?" +
            new URLSearchParams({

                q: query,

                format: "json",

                addressdetails: "1",

                limit: "5",

                countrycodes: "in"

            });


        const response =
            await fetch(
                url,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Location search failed."
            );

        }


        const results =
            await response.json();


        if (!results || results.length === 0) {
            showLocationMessage(
                "⚠️ No matching Indian location found. Please enter an Indian city, district or landmark (e.g., Chennai, Mumbai, Wayanad, Dehradun)."
            );
            return;
        }

        renderLocationSuggestions(results);

    } catch (error) {

        console.error(
            "Location search error:",
            error
        );


        showLocationMessage(
            "❌ Unable to search location. Check your internet connection."
        );

    }

}


// =====================================================
// LOCATION SEARCH RESULTS
// =====================================================

function renderLocationSuggestions(
    results
) {

    const container =
        document.getElementById(
            "locationSuggestions"
        );


    if (!container) return;


    container.innerHTML = "";


    results.forEach(
        result => {

            const item =
                document.createElement(
                    "button"
                );


            item.type = "button";

            item.className =
                "location-suggestion";


            item.innerHTML = `
                <span class="suggestion-icon">📍</span>

                <span class="suggestion-text">
                    ${escapeHtml(
                        result.display_name
                    )}
                </span>
            `;


            item.addEventListener(
                "click",
                async () => {

                    const latitude =
                        Number(
                            result.lat
                        );

                    const longitude =
                        Number(
                            result.lon
                        );


                    await applyLocation(
                        latitude,
                        longitude,
                        result
                    );


                    container.innerHTML =
                        "";

                }
            );


            container.appendChild(
                item
            );

        }
    );

}


// =====================================================
// APPLY SEARCHED LOCATION
// =====================================================

async function applyLocation(
    latitude,
    longitude,
    result,
    accuracy = null
) {

    const address =
        result.address || {};


    const locationData =
        extractLocationData(
            address,
            result.display_name
        );


    selectedCoordinates = {
        latitude,
        longitude
    };


    updateHiddenLocationFields(
        locationData
    );


    updateSelectedLocationUI(
        locationData.place,
        result.display_name,
        latitude,
        longitude,
        accuracy
    );


    updatePickerMarker(
        latitude,
        longitude
    );


    if (locationPickerMap) {

        locationPickerMap.setView(
            [latitude, longitude],
            16,
            {
                animate: true
            }
        );

    }


    clearLocationMessage();

}


// =====================================================
// CURRENT LOCATION
// =====================================================

function useCurrentLocation() {

    if (!navigator.geolocation) {

        showLocationMessage(
            "❌ Your browser does not support location detection."
        );

        return;

    }

    const button = document.getElementById(
        "useCurrentLocationBtn"
    );

    if (button) {
        button.disabled = true;
        button.textContent = "📡 Finding your best location...";
    }

    showLocationMessage(
        "📡 Getting your current location. Please allow location access..."
    );

    detectBestCurrentLocation()
        .then(async best => {

            if (!best) {
                throw new Error("Location could not be determined.");
            }

            const accuracy = Number(best.accuracy || 0);

            // Desktop browsers can fall back to Wi-Fi/IP positioning.
            // If the result is extremely broad, don't present it as an
            // exact current location. Let the user choose on the map.
            if (accuracy > 2000) {
                showLocationMessage(
                    `⚠️ Browser location is too broad (~${Math.round(accuracy)} m). Please click the map at your location or search your city.`
                );
                return;
            }

            showLocationMessage(
                accuracy > 500
                    ? `⚠️ Location detected (~${Math.round(accuracy)} m). Please verify the pin.`
                    : `📍 Current location detected (~${Math.round(accuracy)} m).`
            );

            await setSelectedLocation(
                best.latitude,
                best.longitude,
                accuracy
            );

        })
        .catch(error => {

            console.error("Geolocation error:", error);

            showLocationMessage(
                "❌ Unable to get your current location. Check browser and Windows location permissions, then try again."
            );

        })
        .finally(() => {
            restoreCurrentLocationButton();
        });

}


// Get the best reading available instead of trusting the first
// desktop/browser location result. This is especially useful on
// laptops where the first reading may be based on Wi-Fi/IP data.
async function detectBestCurrentLocation() {

    return new Promise((resolve, reject) => {

        let best = null;
        let watchId = null;
        let finished = false;

        const finish = () => {

            if (finished) return;

            finished = true;

            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }

            if (best) {
                resolve(best);
            } else {
                reject(new Error("No location reading received."));
            }

        };

        const handlePosition = position => {

            const coords = position.coords;

            const reading = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy
            };

            if (!best || reading.accuracy < best.accuracy) {
                best = reading;
            }

            // Excellent reading: finish immediately.
            if (reading.accuracy <= 50) {
                finish();
            }

        };

        const handleError = error => {
            // If we already have a reading, keep it.
            if (best) {
                finish();
                return;
            }

            reject(error);
        };

        navigator.geolocation.getCurrentPosition(
            handlePosition,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            }
        );

        watchId = navigator.geolocation.watchPosition(
            handlePosition,
            () => {},
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 20000
            }
        );

        // Give the browser a few seconds to improve the reading.
        setTimeout(finish, 12000);

    });

}


// =====================================================
// RESTORE CURRENT LOCATION BUTTON
// =====================================================

function restoreCurrentLocationButton() {

    const button =
        document.getElementById(
            "useCurrentLocationBtn"
        );


    if (button) {

        button.disabled = false;

        button.textContent =
            "📍 Use My Current Location";

    }

}


// =====================================================
// REPORT TIME
// =====================================================

function setDefaultReportTime() {

    const field = document.getElementById("report_time");

    if (!field) return;

    const now = new Date();

    const local = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
    );

    field.value = local.toISOString().slice(0, 16);

}


// =====================================================
// SET SELECTED LOCATION
// =====================================================

async function setSelectedLocation(
    latitude,
    longitude,
    accuracy = null
) {

    latitude =
        Number(latitude);

    longitude =
        Number(longitude);


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        showLocationMessage(
            "❌ Invalid coordinates."
        );

        return;

    }


    try {

        const result =
            await reverseGeocode(
                latitude,
                longitude
            );


        if (result) {

            await applyLocation(
                latitude,
                longitude,
                result,
                accuracy
            );

        } else {

            // Even if reverse geocoding fails,
            // coordinates should still be usable.

            const fallback =
                {
                    place:
                        `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,

                    address:
                        "Selected map coordinates"
                };


            selectedCoordinates = {
                latitude,
                longitude
            };


            updateHiddenLocationFields(
                {
                    country:
                        "India",

                    state:
                        "",

                    city:
                        fallback.place,

                    place:
                        fallback.place
                }
            );


            updateSelectedLocationUI(
                fallback.place,

                fallback.address,

                latitude,

                longitude
            );


            updatePickerMarker(
                latitude,
                longitude
            );

        }

    } catch (error) {

        console.error(
            "Set location error:",
            error
        );


        showLocationMessage(
            "❌ Could not detect the address for this location."
        );

    }

}


// =====================================================
// REVERSE GEOCODING
// =====================================================

async function reverseGeocode(
    latitude,
    longitude
) {

    const url =
        "https://nominatim.openstreetmap.org/reverse?" +
        new URLSearchParams({

            lat: latitude,

            lon: longitude,

            format: "json",

            addressdetails: "1",

            zoom: 18

        });


    const response =
        await fetch(
            url,
            {
                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            "Reverse geocoding failed."
        );

    }


    return await response.json();

}


// =====================================================
// EXTRACT CITY / STATE / COUNTRY
// =====================================================

function extractLocationData(
    address,
    displayName = ""
) {

    // Prefer an actual city/town/municipality. Do NOT use
    // suburb or city_district as the city because places such
    // as Vadapalani are neighbourhoods inside Chennai.
    const country = address.country || "India";

    const state =
        address.state ||
        address.region ||
        "";

    const city =
        address.city ||
        address.town ||
        address.municipality ||
        address.village ||
        "";

    const neighbourhood =
        address.suburb ||
        address.neighbourhood ||
        address.city_district ||
        address.quarter ||
        "";

    const place =
        city ||
        neighbourhood ||
        displayName ||
        "Selected Location";

    return {
        country,
        state,
        city: city || place,
        place
    };
}

// =====================================================
// UPDATE HIDDEN FORM FIELDS
// =====================================================

function updateHiddenLocationFields(
    location
) {

    const country =
        document.getElementById(
            "country"
        );

    const state =
        document.getElementById(
            "state"
        );

    const city =
        document.getElementById(
            "city"
        );

    const latitude =
        document.getElementById(
            "latitude"
        );

    const longitude =
        document.getElementById(
            "longitude"
        );


    if (country) {

        country.value =
            location.country ||
            "India";

    }


    if (state) {

        state.value =
            location.state ||
            "";

    }


    if (city) {

        city.value =
            location.city ||
            "";

    }


    if (latitude) {

        latitude.value =
            selectedCoordinates
                ? selectedCoordinates.latitude
                : "";

    }


    if (longitude) {

        longitude.value =
            selectedCoordinates
                ? selectedCoordinates.longitude
                : "";

    }

}


// =====================================================
// SELECTED LOCATION UI
// =====================================================

function updateSelectedLocationUI(
    place,
    address,
    latitude,
    longitude,
    accuracy = null
) {

    const selectedLocation =
        document.getElementById(
            "selectedLocation"
        );

    const selectedPlace =
        document.getElementById(
            "selectedPlace"
        );

    const selectedAddress =
        document.getElementById(
            "selectedAddress"
        );


    if (selectedPlace) {

        selectedPlace.textContent =
            place ||
            "Location selected";

    }


    if (selectedAddress) {

        const accuracyText =
            Number.isFinite(Number(accuracy))
                ? ` • Accuracy ~${Math.round(Number(accuracy))} m`
                : "";

        selectedAddress.textContent =
            `${address || "Location detected"} • ` +
            `${Number(latitude).toFixed(5)}, ` +
            `${Number(longitude).toFixed(5)}` +
            accuracyText;

    }


    if (selectedLocation) {

        selectedLocation.classList.add(
            "location-selected"
        );

    }

}


// =====================================================
// PICKER MARKER
// =====================================================

function updatePickerMarker(
    latitude,
    longitude
) {

    if (!locationPickerMap) return;


    if (locationPickerMarker) {

        locationPickerMap.removeLayer(
            locationPickerMarker
        );

    }


    locationPickerMarker =
        L.marker(
            [
                latitude,
                longitude
            ]
        )
        .addTo(
            locationPickerMap
        );


    locationPickerMarker.bindPopup(
        "📍 Selected Disaster Location"
    );


    locationPickerMarker.openPopup();

}


// =====================================================
// LOCATION MESSAGES
// =====================================================

function showLocationMessage(
    message
) {

    const container =
        document.getElementById(
            "locationSuggestions"
        );


    if (!container) return;


    container.innerHTML = `
        <div class="location-message">
            ${escapeHtml(message)}
        </div>
    `;

}


function clearLocationMessage() {

    const container =
        document.getElementById(
            "locationSuggestions"
        );


    if (container) {

        container.innerHTML =
            "";

    }

}


function setLocationStatus(
    message
) {

    showLocationMessage(
        message
    );

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        showLoading();


        const response =
            await fetch(
                "/dashboard-summary"
            );


        if (!response.ok) {

            throw new Error(
                `Dashboard API error: ${response.status}`
            );

        }


        const data =
            await response.json();


        updateStatistics(data);


        updateDisasterTypes(
            data.Disaster_Types || {}
        );


        updateMap(
            data.Locations || []
        );


        await loadReports();

        await loadResponsePlans();

        await loadAnalytics();


        document.getElementById(
            "lastUpdated"
        ).textContent =
            "Last updated: " +
            new Date().toLocaleTimeString();


    } catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to load dashboard data."
        );

    }

}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics(data) {

    document.getElementById(
        "totalDisasters"
    ).textContent =
        formatNumber(
            data.Total_Disasters
        );


    document.getElementById(
        "affectedPeople"
    ).textContent =
        formatNumber(
            data.Total_Affected_People
        );


    document.getElementById(
        "highPriority"
    ).textContent =
        formatNumber(
            data.High_Priority_Disasters
        );


    const locations =
        data.Locations || [];


    const uniqueLocations =
        new Set(
            locations.map(
                location =>
                    `${location.city}-${location.state}-${location.country}`
            )
        );


    document.getElementById(
        "activeLocations"
    ).textContent =
        formatNumber(
            uniqueLocations.size
        );

}


// =====================================================
// DISASTER TYPES
// =====================================================

function updateDisasterTypes(types) {
    const container = document.getElementById("disasterTypes");
    if (!container) return;
    container.innerHTML = "";

    const entries = Object.entries(types).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="loading">
                No disaster data available.
            </div>
        `;
        return;
    }

    const total = entries.reduce((sum, item) => sum + item[1], 0);

    entries.forEach(([type, count]) => {
        const percentage = (count / total) * 100;
        const theme = getDisasterTheme(type);
        const row = document.createElement("div");
        row.className = `type-row ${theme.themeClass}`;

        row.innerHTML = `
            <div class="type-top">
                <div class="type-name-with-icon">
                    <span class="type-emblem-tiny" style="background: ${theme.bannerGrad}; border: 1px solid ${theme.color}; box-shadow: 0 0 10px ${theme.glow};">
                        ${theme.icon}
                    </span>
                    <span class="type-name">${escapeHtml(type)}</span>
                    <span class="type-category-sub" style="color: ${theme.color};">${theme.badge}</span>
                </div>
                <span class="type-count" style="color: ${theme.accent};">
                    ${formatNumber(count)}
                </span>
            </div>

            <div class="progress">
                <div
                    class="progress-bar"
                    style="width:${percentage}%; background: linear-gradient(90deg, ${theme.color}, ${theme.accent}); box-shadow: 0 0 12px ${theme.glow};"
                ></div>
            </div>

            <div class="type-percentage">
                <span>${percentage.toFixed(0)}% of total incidents</span>
                <span style="color: ${theme.color}; font-size: 11px; font-weight: 600;">ACTIVE HAZARD</span>
            </div>
        `;

        container.appendChild(row);
    });
}


// =====================================================
// UPDATE MAIN MAP
// =====================================================

function updateMap(locations) {
    currentLocations = locations;
    if (!markersLayer) return;

    markersLayer.clearLayers();
    const bounds = [];

    locations.forEach(disaster => {
        const latitude = Number(disaster.latitude);
        const longitude = Number(disaster.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return;
        }

        bounds.push([latitude, longitude]);

        const theme = getDisasterTheme(disaster.disaster_type);
        const isCritical = String(disaster.severity).toLowerCase() === "critical" || String(disaster.severity).toLowerCase() === "high";

        // Custom tactical glowing pin
        const customIcon = L.divIcon({
            className: "custom-disaster-map-marker",
            html: `
                <div class="map-marker-pin ${isCritical ? 'pulse-critical' : ''}" style="--marker-color: ${theme.color}; --marker-glow: ${theme.glow}; background: ${theme.bannerGrad}; border: 2px solid ${theme.color};">
                    <span class="marker-emoji">${theme.icon}</span>
                </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -20]
        });

        const marker = L.marker([latitude, longitude], { icon: customIcon });

        marker.bindPopup(`
            <div class="map-popup-tactical" style="--popup-accent: ${theme.color};">
                <div class="popup-top-banner" style="background: ${theme.bannerGrad}; border-bottom: 1px solid ${theme.color};">
                    <span class="popup-emblem">${theme.icon}</span>
                    <div>
                        <span class="popup-category" style="color: ${theme.color};">${theme.badge}</span>
                        <h4>${escapeHtml(disaster.disaster_type)}</h4>
                    </div>
                </div>
                <div class="popup-body">
                    <div class="popup-row">📍 <strong>${escapeHtml(disaster.city)}, ${escapeHtml(disaster.state)}</strong></div>
                    <div class="popup-row">⚠️ Severity: <span class="severity-tag ${String(disaster.severity).toLowerCase()}">${escapeHtml(disaster.severity)}</span></div>
                    <div class="popup-row">👥 Affected: <strong>${formatNumber(disaster.affected_people)}</strong></div>
                    <div class="popup-actions">
                        <button type="button" class="popup-plan-btn" onclick="openSavedResponsePlan(${Number(disaster.id)})">
                            ⚡ Open AI Response Plan
                        </button>
                    </div>
                </div>
            </div>
        `);

        marker.addTo(markersLayer);
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 10
        });
    }
}


// =====================================================
// FIT ALL MARKERS
// =====================================================

function fitAllMarkers() {

    if (
        !map
    ) return;


    if (
        currentLocations.length === 0
    ) {

        map.setView(
            [20.5937, 78.9629],
            5
        );

        return;

    }


    const valid =
        currentLocations.filter(
            item =>
                Number.isFinite(
                    Number(
                        item.latitude
                    )
                ) &&
                Number.isFinite(
                    Number(
                        item.longitude
                    )
                )
        );


    if (
        valid.length === 0
    ) return;


    const bounds =
        valid.map(
            item => [

                Number(
                    item.latitude
                ),

                Number(
                    item.longitude
                )

            ]
        );


    map.fitBounds(
        bounds,
        {
            padding: [
                40,
                40
            ],

            maxZoom: 10
        }
    );

}


// =====================================================
// REPORTS
// =====================================================

async function loadReports() {

    const response =
        await fetch(
            "/disasters"
        );


    if (!response.ok) {

        throw new Error(
            "Reports API failed"
        );

    }


    const reports =
        await response.json();


    renderReports(
        reports
    );

}


// =====================================================
// RENDER REPORTS
// =====================================================

function renderReports(reports) {
    const table = document.getElementById("reportsTable");
    const countElement = document.getElementById("reportCount");
    if (countElement) {
        countElement.textContent = `${reports.length} ${reports.length === 1 ? "report" : "reports"}`;
    }
    if (!table) return;
    table.innerHTML = "";

    if (reports.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="table-empty-cell">
                    <div class="table-empty-state">
                        <span class="empty-icon">🛡️</span>
                        <strong>No disaster reports recorded</strong>
                        <p>The database is currently clear. You can report a new emergency incident in India by clicking <em>+ New Report</em> above.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    reports.slice(0, 25).forEach(report => {
        const row = document.createElement("tr");
        const severity = String(report.severity || "").toLowerCase();
        const theme = getDisasterTheme(report.disaster_type);

        row.innerHTML = `
            <td>
                <div class="report-table-type">
                    <span class="table-disaster-icon">
                        ${theme.icon}
                    </span>
                    <div>
                        <strong style="color: #fff; font-size: 13.5px;">${escapeHtml(report.disaster_type)}</strong>
                        <span class="table-disaster-cat" style="color: ${theme.color}; font-size: 10px; display: block; font-weight: 600;">${theme.badge}</span>
                    </div>
                </div>
            </td>

            <td>
                <div class="report-table-loc">
                    <strong>📍 ${escapeHtml(report.city)}, ${escapeHtml(report.state)}</strong>
                    <small style="color: #64748b; display: block;">India</small>
                </div>
            </td>

            <td>
                <span class="severity ${severity}">
                    ${escapeHtml(report.severity)}
                </span>
            </td>

            <td>
                <strong style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #f1f5f9;">
                    ${formatNumber(report.affected_people)}
                </strong>
            </td>

            <td>
                <span style="color: #cbd5e1; font-size: 12.5px;">
                    ${escapeHtml(report.reported_by)}
                </span>
            </td>

            <td>
                <span style="color: #64748b; font-size: 11.5px; font-family: 'JetBrains Mono', monospace;">
                    ${formatDate(report.report_time)}
                </span>
            </td>

            <td>
                <div class="table-action-group">
                    ${report.has_response_plan ? `
                        <button
                            type="button"
                            class="view-plan-btn small tactical-table-btn"
                            onclick="openSavedResponsePlan(${Number(report.id)})"
                            title="Open AI Response Plan for incident #${report.id}"
                        >
                            ⚡ View Plan
                        </button>
                        <button
                            type="button"
                            class="table-print-btn"
                            onclick="printSingleDisasterPlanById(${Number(report.id)})"
                            title="Print official tactical plan for incident #${report.id}"
                        >
                            🖨️
                        </button>
                    ` : `
                        <span class="no-plan">—</span>
                    `}
                    <button
                        type="button"
                        class="delete-report-inline-btn"
                        onclick="deleteReport(${Number(report.id)})"
                        title="Delete incident #${report.id}"
                    >
                        ✕
                    </button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}


// =====================================================
// RESPONSE PLANS
// =====================================================

function setupResponsePlanFilters() {
    const chips = document.querySelectorAll("#planFilterChips .filter-chip");
    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            activePlanFilter = chip.dataset.category || "all";
            renderResponsePlans();
        });
    });

    const searchInput = document.getElementById("planSearchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            planSearchQuery = e.target.value.trim().toLowerCase();
            renderResponsePlans();
        });
    }
}

async function loadResponsePlans() {
    const container = document.getElementById("responsePlansList");
    const countElement = document.getElementById("responsePlanCount");
    if (!container) return;

    try {
        const response = await fetch("/response-plans");
        if (!response.ok) {
            throw new Error("Response Plans API failed");
        }

        allSavedPlans = await response.json();

        if (countElement) {
            countElement.textContent = `${allSavedPlans.length} ${allSavedPlans.length === 1 ? "plan" : "plans"}`;
        }

        renderResponsePlans();
    } catch (error) {
        console.error("Response plan error:", error);
        if (countElement) {
            countElement.textContent = "0 plans";
        }
        container.innerHTML = `
            <div class="response-empty-state error-state">
                ❌ Unable to load saved response plans.
                <br>
                <small>${escapeHtml(error.message)}</small>
            </div>
        `;
    }
}


function renderResponsePlans() {
    const container = document.getElementById("responsePlansList");
    if (!container) return;

    container.innerHTML = "";

    if (!allSavedPlans || allSavedPlans.length === 0) {
        container.innerHTML = `
            <div class="response-empty-state">
                <div class="empty-icon">🚨</div>
                <strong>No AI response plans yet</strong>
                <span>Submit a disaster report and the Coordinator Agent will create the tactical plan here.</span>
            </div>
        `;
        return;
    }

    // Filter plans
    const filtered = allSavedPlans.filter(plan => {
        const theme = getDisasterTheme(plan.disaster_type);

        if (activePlanFilter !== "all" && theme.group !== activePlanFilter) {
            return false;
        }

        if (planSearchQuery) {
            const haystack = [
                plan.disaster_type,
                plan.city,
                plan.state,
                plan.country,
                plan.AI_Severity,
                plan.severity,
                plan.Prediction?.Priority,
                plan.Prediction?.Spread_Risk
            ].filter(Boolean).join(" ").toLowerCase();

            if (!haystack.includes(planSearchQuery)) {
                return false;
            }
        }

        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="response-empty-state">
                <div class="empty-icon">🔎</div>
                <strong>No matching response plans found</strong>
                <span>Try choosing another filter category or adjusting your search term.</span>
            </div>
        `;
        return;
    }

    filtered.forEach(plan => {
        const card = document.createElement("article");
        const severityText = plan.AI_Severity || plan.severity || "Pending";
        const severityClass =
            String(severityText).toLowerCase().includes("extreme") ||
            String(severityText).toLowerCase().includes("critical")
                ? "critical"
                : String(severityText).toLowerCase().includes("high")
                    ? "high"
                    : String(severityText).toLowerCase().includes("medium")
                        ? "medium"
                        : "low";

        const prediction = plan.Prediction || {};
        const resources = plan.Resources || {};
        const isEvacRequired = String(prediction.Evacuation || "").toUpperCase() === "YES";
        const theme = getDisasterTheme(plan.disaster_type);

        card.className = `response-plan-card ${theme.themeClass}`;
        card.style.setProperty("--theme-color", theme.color);
        card.style.setProperty("--theme-accent", theme.accent);
        card.style.setProperty("--theme-glow", theme.glow);

        card.innerHTML = `
            <div class="response-plan-card-top">
                <div class="response-plan-type">
                    <div class="disaster-emblem-badge" style="background: ${theme.bannerGrad}; border: 1.5px solid ${theme.color}; box-shadow: 0 0 16px ${theme.glow};">
                        <span class="disaster-emblem-icon">${theme.icon}</span>
                    </div>
                    <div>
                        <div class="plan-header-meta">
                            <span class="response-plan-label">INCIDENT #${Number(plan.id)}</span>
                            <span class="disaster-category-tag" style="color: ${theme.color}; background: rgba(255,255,255,0.03); border: 1px solid ${theme.color}40;">
                                ${theme.badge}
                            </span>
                        </div>
                        <h4 style="color: #fff; font-size: 15px; margin-top: 3px;">${escapeHtml(plan.disaster_type || "Disaster")}</h4>
                    </div>
                </div>

                <span class="response-severity ${severityClass}">
                    ${escapeHtml(severityText)}
                </span>
            </div>

            <div class="response-plan-location">
                <span>📍</span>
                <strong>${escapeHtml(plan.city || "Unknown City")}</strong>,
                <span>${escapeHtml(plan.state || "")}</span>
                ${plan.country ? `<small class="location-country">(${escapeHtml(plan.country)})</small>` : ""}
            </div>

            <!-- HUD Telemetry mini-grid -->
            <div class="response-plan-hud-grid">
                <div class="hud-stat-cell">
                    <span class="hud-label">AFFECTED POPULATION</span>
                    <strong class="hud-value hud-count">${formatNumber(plan.affected_people || 0)}</strong>
                    <div class="hud-bar-track">
                        <div class="hud-bar-fill" style="width: ${Math.min(100, Math.max(12, ((plan.affected_people || 0) / 10000) * 100))}%; background: ${theme.color}; box-shadow: 0 0 8px ${theme.glow};"></div>
                    </div>
                </div>

                <div class="hud-stat-cell">
                    <span class="hud-label">PRIORITY STATUS</span>
                    <strong class="hud-value hud-priority">${escapeHtml(prediction.Priority || plan.severity || "NORMAL")}</strong>
                </div>

                <div class="hud-stat-cell ${isEvacRequired ? 'alert-pulse-cell' : ''}">
                    <span class="hud-label">EVACUATION</span>
                    <strong class="hud-value ${isEvacRequired ? 'hud-evac-yes' : 'hud-evac-no'}">
                        ${isEvacRequired ? '🚨 REQUIRED' : '🛡️ NOT REQUIRED'}
                    </strong>
                </div>
            </div>

            <!-- 7 Agent allocation preview pills -->
            <div class="response-agent-pills">
                <span class="agent-pill" title="Food Allocation">🍱 ${formatCompact(resources.Food?.FoodPackets || 0)} pkts</span>
                <span class="agent-pill" title="Water Bottles">💧 ${formatCompact(resources.Water?.WaterBottles || 0)} btls</span>
                <span class="agent-pill" title="Shelter Tents">🏕️ ${formatCompact(resources.Shelter?.FamilyTents || 0)} tents</span>
                <span class="agent-pill" title="Medical Doctors">🏥 ${resources.Medical?.Doctors || 0} docs</span>
                <span class="agent-pill" title="NDRF Rescue Teams">🚁 ${resources.Rescue?.NDRFTeams || 0} NDRF</span>
                <span class="agent-pill" title="Police Officers">👮 ${resources.Police?.PoliceOfficers || 0} cops</span>
                <span class="agent-pill" title="Relief Trucks">🚚 ${resources.Transport?.ReliefTrucks || 0} trucks</span>
            </div>

            <div class="response-plan-footer">
                <span class="plan-timestamp">
                    🕒 ${formatDate(plan.report_time)}
                </span>

                <div class="plan-footer-actions">
                    <button
                        type="button"
                        class="plan-card-print-btn"
                        onclick="event.stopPropagation(); printSingleDisasterPlanById(${Number(plan.id)})"
                        title="Print tactical response plan for ${escapeHtml(plan.disaster_type || 'Disaster')} (#${Number(plan.id)})"
                    >
                        🖨️ Print Plan
                    </button>
                    <button
                        type="button"
                        class="view-plan-btn large tactical-open-btn"
                        style="--accent-glow: ${theme.glow}; border-color: ${theme.color};"
                        onclick="openSavedResponsePlan(${Number(plan.id)})"
                    >
                        <span>⚡ View Plan</span>
                        <span class="arrow-icon">→</span>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}


async function openSavedResponsePlan(id) {
    try {
        const response = await fetch(`/response-plans/${Number(id)}`);
        if (!response.ok) {
            throw new Error("Response plan could not be loaded.");
        }

        const plan = await response.json();
        currentActivePlan = plan;
        showAIResult(plan, true);
    } catch (error) {
        console.error(error);
        alert("❌ Unable to open the saved response plan.");
    }
}


// =====================================================
// ANALYTICS
// =====================================================

async function loadAnalytics() {

    try {

        const response = await fetch("/analytics");

        if (!response.ok) {
            throw new Error(`Analytics API error: ${response.status}`);
        }

        const data = await response.json();

        updateAnalytics(data);

    } catch (error) {

        console.error("Analytics error:", error);

        const overview = document.getElementById("analyticsOverview");
        if (overview) {
            overview.innerHTML = `
                <div class="analytics-error">
                    ⚠️ Analytics temporarily unavailable.
                </div>
            `;
        }

        ["analyticsDisasterTypes", "analyticsSeverity", "analyticsLocations", "analyticsRecent"]
            .forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.innerHTML = `
                        <div class="analytics-empty">
                            No analytics data available.
                        </div>
                    `;
                }
            });
    }

}


function updateAnalytics(data) {

    const overview = data.overview || {};

    renderAnalyticsOverview(overview);
    renderAnalyticsBars(
        document.getElementById("analyticsDisasterTypes"),
        data.disaster_types || {},
        "incidents"
    );
    renderAnalyticsBars(
        document.getElementById("analyticsSeverity"),
        data.severity_distribution || {},
        "incidents"
    );
    renderAnalyticsLocations(data.top_locations || []);
    renderAnalyticsRecent(data.recent_incidents || []);

}


function renderAnalyticsOverview(data) {

    const container = document.getElementById("analyticsOverview");
    if (!container) return;

    const cards = [
        {
            icon: "🌍",
            label: "TOTAL INCIDENTS",
            value: formatNumber(data.total_disasters || 0),
            note: "All recorded disasters"
        },
        {
            icon: "👥",
            label: "AFFECTED PEOPLE",
            value: formatNumber(data.total_affected_people || 0),
            note: "Across all incidents"
        },
        {
            icon: "🚨",
            label: "HIGH PRIORITY",
            value: formatNumber(data.high_priority || 0),
            note: `${formatNumber(data.priority_percentage || 0)}% of incidents`
        },
        {
            icon: "🔴",
            label: "CRITICAL INCIDENTS",
            value: formatNumber(data.critical_incidents || 0),
            note: "Requires immediate attention"
        },
        {
            icon: "📐",
            label: "AVG. AFFECTED",
            value: formatNumber(data.average_affected_people || 0),
            note: "People per incident"
        }
    ];

    container.innerHTML = cards.map(card => `
        <div class="analytics-stat-card">
            <div class="analytics-stat-icon">${card.icon}</div>
            <div class="analytics-stat-content">
                <span>${escapeHtml(card.label)}</span>
                <strong>${escapeHtml(card.value)}</strong>
                <small>${escapeHtml(card.note)}</small>
            </div>
        </div>
    `).join("");

}


function renderAnalyticsBars(container, values, suffix) {

    if (!container) return;

    const entries = Object.entries(values || {})
        .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0));

    if (entries.length === 0 || entries.every(([, value]) => Number(value || 0) === 0)) {
        container.innerHTML = `
            <div class="analytics-empty">
                No data available yet.
            </div>
        `;
        return;
    }

    const maxValue = Math.max(...entries.map(([, value]) => Number(value || 0)), 1);

    container.innerHTML = entries.map(([label, value]) => {
        const numericValue = Number(value || 0);
        const width = Math.max((numericValue / maxValue) * 100, numericValue > 0 ? 4 : 0);

        return `
            <div class="analytics-bar-row">
                <div class="analytics-bar-top">
                    <span>${escapeHtml(label)}</span>
                    <strong>${formatNumber(numericValue)} ${escapeHtml(suffix)}</strong>
                </div>
                <div class="analytics-bar-track">
                    <div class="analytics-bar-fill" style="width:${width}%"></div>
                </div>
            </div>
        `;
    }).join("");

}


function renderAnalyticsLocations(locations) {

    const container = document.getElementById("analyticsLocations");
    if (!container) return;

    if (!locations.length) {
        container.innerHTML = `
            <div class="analytics-empty">No affected locations available.</div>
        `;
        return;
    }

    const maxAffected = Math.max(
        ...locations.map(item => Number(item.affected_people || 0)),
        1
    );

    container.innerHTML = locations.slice(0, 10).map((item, index) => {
        const affected = Number(item.affected_people || 0);
        const width = Math.max((affected / maxAffected) * 100, affected > 0 ? 4 : 0);

        return `
            <div class="analytics-location-row">
                <div class="analytics-location-rank">${index + 1}</div>
                <div class="analytics-location-main">
                    <div class="analytics-location-top">
                        <strong>${escapeHtml(item.city || "Unknown")}</strong>
                        <span>${formatNumber(affected)}</span>
                    </div>
                    <div class="analytics-bar-track">
                        <div class="analytics-bar-fill" style="width:${width}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

}


function renderAnalyticsRecent(incidents) {

    const container = document.getElementById("analyticsRecent");
    if (!container) return;

    if (!incidents.length) {
        container.innerHTML = `
            <div class="analytics-empty">No recent incidents available.</div>
        `;
        return;
    }

    container.innerHTML = incidents.slice(0, 10).map(incident => `
        <div class="analytics-recent-row">
            <div class="analytics-recent-main">
                <strong>${escapeHtml(incident.disaster_type || "Unknown")}</strong>
                <span>📍 ${escapeHtml(incident.city || "Unknown")}${incident.state ? ", " + escapeHtml(incident.state) : ""}</span>
            </div>
            <div class="analytics-recent-meta">
                <span class="analytics-severity-badge ${analyticsSeverityClass(incident.severity)}">
                    ${escapeHtml(incident.severity || "Unknown")}
                </span>
                <small>${formatNumber(incident.affected_people || 0)} affected</small>
            </div>
        </div>
    `).join("");

}


function analyticsSeverityClass(severity) {

    const value = String(severity || "").toLowerCase();

    if (value === "critical") return "critical";
    if (value === "high") return "high";
    if (value === "medium") return "medium";
    return "low";

}


// =====================================================
// REPORT MODAL
// =====================================================

function setupReportModal() {

    const modal =
        document.getElementById(
            "reportModal"
        );


    const openButtons = [
        "openReportBtn",
        "openReportBtn2"
    ];


    openButtons.forEach(
        id => {

            const button =
                document.getElementById(
                    id
                );


            if (button) {

                button.addEventListener(
                    "click",
                    openReportModal
                );

            }

        }
    );


    document
        .getElementById(
            "closeReportBtn"
        )
        .addEventListener(
            "click",
            closeReportModal
        );


    document
        .getElementById(
            "cancelReportBtn"
        )
        .addEventListener(
            "click",
            closeReportModal
        );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeReportModal();

            }

        }
    );


    document
        .getElementById(
            "disasterForm"
        )
        .addEventListener(
            "submit",
            submitDisasterReport
        );


    document
        .getElementById(
            "closeResultBtn"
        )
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "resultModal"
                    )
                    .classList.remove(
                        "show"
                    );

                loadDashboard();

            }
        );

}


// =====================================================
// OPEN REPORT MODAL
// =====================================================

function openReportModal() {

    const modal =
        document.getElementById(
            "reportModal"
        );


    modal.classList.add(
        "show"
    );


    setDefaultReportTime();


    document.getElementById(
        "formMessage"
    ).textContent = "";


    // Important:
    // Leaflet needs to know the modal size.

    setTimeout(
        () => {

            if (locationPickerMap) {

                locationPickerMap.invalidateSize();

            }

        },
        300
    );

}


// =====================================================
// CLOSE REPORT MODAL
// =====================================================

function closeReportModal() {

    document
        .getElementById(
            "reportModal"
        )
        .classList.remove(
            "show"
        );

}


// =====================================================
// SUBMIT REPORT
// =====================================================

async function submitDisasterReport(
    event
) {

    event.preventDefault();


    const button =
        document.getElementById(
            "submitReportBtn"
        );


    const message =
        document.getElementById(
            "formMessage"
        );


    // -------------------------------------------------
    // LOCATION VALIDATION
    // -------------------------------------------------

    const city =
        document.getElementById(
            "city"
        ).value.trim();


    const latitude =
        Number(
            document.getElementById(
                "latitude"
            ).value
        );


    const longitude =
        Number(
            document.getElementById(
                "longitude"
            ).value
        );


    if (!city) {

        message.textContent =
            "❌ Please search for or select the disaster location.";

        message.className =
            "form-message error";

        return;

    }


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        message.textContent =
            "❌ Please select a location on the map or use your current location.";

        message.className =
            "form-message error";

        return;

    }


    button.disabled = true;

    button.textContent =
        "⏳ Processing with AI...";


    message.textContent =
        "Coordinator Agent is analyzing the incident...";


    message.className =
        "form-message";


    try {

        const report = {

            disaster_type:
                document.getElementById(
                    "disaster_type"
                ).value,


            country:
                document.getElementById(
                    "country"
                ).value,


            state:
                document.getElementById(
                    "state"
                ).value,


            city:
                city,


            latitude:
                latitude,


            longitude:
                longitude,


            severity:
                document.getElementById(
                    "severity"
                ).value,


            affected_people:
                Number(
                    document.getElementById(
                        "affected_people"
                    ).value
                ),


            description:
                document.getElementById(
                    "description"
                ).value,


            reported_by:
                document.getElementById(
                    "reported_by"
                ).value,


        };


        console.log(
            "Submitting disaster:",
            report
        );


        const response =
            await fetch(
                "/report-disaster",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            report
                        )

                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Report submission failed"
            );

        }


        closeReportModal();


        showAIResult(
            data
        );


        // Refresh dashboard data so the new report and
        // response plan appear immediately.
        await loadDashboard();


        document
            .getElementById(
                "disasterForm"
            )
            .reset();

        setDefaultReportTime();


        // Reset location state

        selectedCoordinates =
            null;


        const selectedPlace =
            document.getElementById(
                "selectedPlace"
            );


        const selectedAddress =
            document.getElementById(
                "selectedAddress"
            );


        if (selectedPlace) {

            selectedPlace.textContent =
                "No location selected";

        }


        if (selectedAddress) {

            selectedAddress.textContent =
                "Search or select a location on the map";

        }


        if (locationPickerMarker) {

            locationPickerMap.removeLayer(
                locationPickerMarker
            );

            locationPickerMarker =
                null;

        }


    } catch (error) {

        console.error(
            error
        );


        message.textContent =
            "❌ " +
            error.message;


        message.className =
            "form-message error";


    } finally {

        button.disabled = false;

        button.textContent =
            "🚨 Submit Report";

    }

}


// =====================================================
// AI RESULT
// =====================================================

function renderNotification(notification) {

    if (!notification || typeof notification !== "object") {
        return `
            <section class="notification-response-card notification-unavailable">
                <div class="response-section-title">
                    <span class="response-section-icon">🔔</span>
                    <div>
                        <h4>Notification Agent</h4>
                        <small>Notification preparation</small>
                    </div>
                </div>
                <div class="notification-message">
                    Notification payload is not available.
                </div>
            </section>
        `;
    }

    const location = notification.location || {};
    const summary = notification.summary || {};
    const resourceAgents = Array.isArray(notification.resource_agents)
        ? notification.resource_agents
        : [];

    return `
        <section class="notification-response-card">
            <div class="notification-header">
                <div class="response-section-title">
                    <span class="response-section-icon">🔔</span>
                    <div>
                        <h4>Notification Agent</h4>
                        <small>Emergency alert prepared for WhatsApp delivery</small>
                    </div>
                </div>
                <span class="notification-status">
                    ${escapeHtml(notification.status || "READY")}
                </span>
            </div>

            <div class="notification-meta">
                <div>
                    <span>CHANNEL</span>
                    <strong>${escapeHtml(notification.channel || "—")}</strong>
                </div>
                <div>
                    <span>DELIVERY</span>
                    <strong>${escapeHtml(notification.delivery || "—")}</strong>
                </div>
                <div>
                    <span>PRIORITY</span>
                    <strong>${escapeHtml(summary.priority || "—")}</strong>
                </div>
                <div>
                    <span>LOCATION</span>
                    <strong>${escapeHtml(location.label || "Unknown")}</strong>
                </div>
            </div>

            <div class="notification-preview">
                <div class="notification-preview-title">
                    📱 WhatsApp Alert Preview
                </div>
                <pre>${escapeHtml(notification.alert_text || "No alert text generated.")}</pre>
            </div>

            <div class="notification-footer">
                <span>
                    📍 ${escapeHtml(String(location.latitude ?? "—"))},
                    ${escapeHtml(String(location.longitude ?? "—"))}
                </span>
                <span>
                    🤖 ${resourceAgents.length}/7 resource agents coordinated
                </span>
            </div>
        </section>
    `;
}


function showAIResult(data, isSavedPlan = false) {
    const modal = document.getElementById("resultModal");
    const content = document.getElementById("aiResultContent");
    if (!modal || !content) return;

    currentActivePlan = data;

    const report = data.report || data;
    const disasterType = report.disaster_type || data.disaster_type || "Disaster";
    const city = report.city || data.city || "Unknown City";
    const state = report.state || data.state || "";
    const country = report.country || data.country || "India";
    const latitude = Number(report.latitude || data.latitude);
    const longitude = Number(report.longitude || data.longitude);
    const affected = report.affected_people || data.affected_people || 0;
    const reporter = report.reported_by || data.reported_by || "Disaster AI Command";
    const reportTime = report.report_time || data.report_time || new Date().toISOString();
    const id = report.id || data.id || "NEW";
    const aiSeverity = data.AI_Severity || report.ai_severity || report.severity || "HIGH";

    const theme = getDisasterTheme(disasterType);
    const prediction = data.Prediction || report.Prediction || {};
    const resources = data.Resources || report.Resources || {};
    const notification = data.Notification || report.Notification || null;

    const isEvacRequired = String(prediction.Evacuation || "").toUpperCase() === "YES";
    const severityLower = String(aiSeverity).toLowerCase();
    const severityClass = severityLower.includes("extreme") || severityLower.includes("critical") ? "critical" :
        severityLower.includes("high") ? "high" : severityLower.includes("medium") ? "medium" : "low";

    // Format Alert Text
    const alertMessage = notification?.alert_text || generateFallbackAlertText({
        disaster_type: disasterType,
        city,
        state,
        country,
        aiSeverity,
        prediction,
        affected_people: affected
    });

    content.innerHTML = `
        <!-- HERO TACTICAL BANNER -->
        <div class="tactical-hero-banner ${theme.themeClass}" style="background: ${theme.bannerGrad}; border: 1.5px solid ${theme.color}; box-shadow: inset 0 0 50px ${theme.glow}, 0 10px 30px rgba(0,0,0,0.5);">
            <div class="tactical-hero-top">
                <div class="tactical-emblem-box" style="background: rgba(10, 15, 23, 0.9); border: 2px solid ${theme.color}; box-shadow: 0 0 25px ${theme.glow};">
                    <span class="tactical-emblem-icon">${theme.icon}</span>
                </div>

                <div class="tactical-hero-info">
                    <div class="tactical-meta-row">
                        <span class="tactical-incident-badge">INCIDENT #${id}</span>
                        <span class="tactical-category-pill" style="color: ${theme.color}; border: 1px solid ${theme.color}50; background: rgba(0,0,0,0.3);">
                            ${theme.category.toUpperCase()} • ${theme.badge}
                        </span>
                        <span class="tactical-status-pill">● AGENT COORDINATION COMPLETE</span>
                    </div>

                    <h2 class="tactical-hero-title" style="color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
                        ${escapeHtml(disasterType)}
                    </h2>

                    <div class="tactical-details-strip">
                        <span>📍 <strong>${escapeHtml(city)}, ${escapeHtml(state)}</strong> (${escapeHtml(country)})</span>
                        ${Number.isFinite(latitude) && Number.isFinite(longitude) ? `
                            <span class="tactical-gps-tag">🌐 ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E</span>
                        ` : ''}
                        <span>🕒 ${formatDate(reportTime)}</span>
                        <span>👤 Reporter: <strong>${escapeHtml(reporter)}</strong></span>
                    </div>
                </div>

                <div class="tactical-severity-badge-box ${severityClass}">
                    <span class="beacon-label">AI ASSESSED SEVERITY</span>
                    <strong class="beacon-val">${escapeHtml(aiSeverity)}</strong>
                    <div class="beacon-aura"></div>
                </div>
            </div>

            ${isEvacRequired ? `
                <div class="tactical-evac-banner">
                    <span class="evac-beacon-icon">🚨</span>
                    <div>
                        <strong>MANDATORY CIVILIAN EVACUATION DIRECTIVE ACTIVE</strong>
                        <p>High displacement risk detected for ${formatNumber(affected)} citizens in ${escapeHtml(city)}. Initiate rapid transport & shelter mobilization immediately.</p>
                    </div>
                </div>
            ` : ''}
        </div>

        <!-- AI PREDICTION & STRATEGIC TELEMETRY HUD -->
        <div class="tactical-hud-panel">
            <div class="hud-panel-header">
                <span class="hud-panel-icon">🧠</span>
                <div>
                    <h4>Prediction Agent &amp; Risk Intelligence</h4>
                    <small>Real-time algorithmic impact evaluation</small>
                </div>
            </div>

            <div class="tactical-hud-telemetry">
                <div class="hud-card">
                    <span class="hud-card-label">SPREAD RISK</span>
                    <strong class="hud-card-value hud-risk-${String(prediction.Spread_Risk || 'low').toLowerCase()}">
                        ${escapeHtml(prediction.Spread_Risk || "LOW")}
                    </strong>
                    <div class="hud-gauge-bar">
                        <div class="hud-gauge-fill" style="width: ${String(prediction.Spread_Risk).toUpperCase() === 'HIGH' ? '100%' : String(prediction.Spread_Risk).toUpperCase() === 'MEDIUM' ? '60%' : '30%'};"></div>
                    </div>
                </div>

                <div class="hud-card">
                    <span class="hud-card-label">MISSION PRIORITY</span>
                    <strong class="hud-card-value hud-priority-${String(prediction.Priority || 'medium').toLowerCase()}">
                        ${escapeHtml(prediction.Priority || "HIGH")}
                    </strong>
                    <div class="hud-gauge-bar">
                        <div class="hud-gauge-fill" style="width: ${String(prediction.Priority).toUpperCase().includes('IMMEDIATE') ? '100%' : String(prediction.Priority).toUpperCase().includes('HIGH') ? '75%' : '45%'};"></div>
                    </div>
                </div>

                <div class="hud-card ${isEvacRequired ? 'alert-card' : ''}">
                    <span class="hud-card-label">EVACUATION PROTOCOL</span>
                    <strong class="hud-card-value ${isEvacRequired ? 'evac-yes' : 'evac-no'}">
                        ${isEvacRequired ? '🚨 YES (MANDATORY)' : '🛡️ NO (SHELTER IN PLACE)'}
                    </strong>
                    <span class="hud-subnote">${isEvacRequired ? 'Evacuation bus convoys deployed' : 'Maintain local relief staging'}</span>
                </div>

                <div class="hud-card">
                    <span class="hud-card-label">EXPECTED IMPACT SCOPE</span>
                    <strong class="hud-card-value" style="color: ${theme.accent};">
                        ${escapeHtml(prediction.Expected_Impact || "LOCAL ZONE")}
                    </strong>
                    <span class="hud-subnote">Affecting ~${formatNumber(affected)} people</span>
                </div>
            </div>
        </div>

        <!-- 7 SPECIALIZED RESOURCE AGENT MATRICES -->
        <div class="tactical-resources-section">
            <div class="response-plan-title">
                <span class="tactical-section-icon">⚡</span>
                <div>
                    <h4>Multi-Agent Coordinated Resource Allocation Matrix</h4>
                    <small>Tactical logistics generated across 7 specialized response agents</small>
                </div>
            </div>

            <div class="tactical-agents-grid">
                <!-- 1. FOOD AGENT -->
                <div class="agent-command-card food-agent-card">
                    <div class="agent-card-header">
                        <div class="agent-icon-badge">🍱</div>
                        <div>
                            <h5>Food Logistics Agent</h5>
                            <span>Relief Rations &amp; Sustenance</span>
                        </div>
                    </div>
                    <div class="agent-stat-rows">
                        <div class="agent-stat-row highlight-stat">
                            <span>Ready Food Packets</span>
                            <strong>${formatNumber(resources.Food?.FoodPackets || 0)} pkts</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Daily Meal Schedule</span>
                            <strong>${resources.Food?.MealsPerDay || 3} meals / day</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Relief Meal Type</span>
                            <strong>${escapeHtml(resources.Food?.MealType || "Standard Relief Meals")}</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Baby Food Kits (Infants)</span>
                            <strong>${formatNumber(resources.Food?.BabyFoodKits || 0)} kits</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Family Dry Rations</span>
                            <strong>${formatNumber(resources.Food?.DryRationKits || 0)} kits</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Emergency Buffer Reserve</span>
                            <strong>${formatNumber(resources.Food?.EmergencyReserve || 0)} pkts</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Distribution Hubs</span>
                            <strong>${resources.Food?.DistributionCenters || 1} centers (${resources.Food?.SupplyDurationDays || 3} days)</strong>
                        </div>
                    </div>
                </div>

                <!-- 2. WATER AGENT -->
                <div class="agent-command-card water-agent-card">
                    <div class="agent-card-header">
                        <div class="agent-icon-badge">💧</div>
                        <div>
                            <h5>Water Security Agent</h5>
                            <span>Potable Water &amp; Sanitation</span>
                        </div>
                    </div>
                    <div class="agent-stat-rows">
                        <div class="agent-stat-row highlight-stat">
                            <span>Bottled Water Supply</span>
                            <strong>${formatNumber(resources.Water?.WaterBottles || 0)} bottles</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Mobile Water Tankers</span>
                            <strong>${formatNumber(resources.Water?.WaterTankers || 0)} heavy tankers</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Field Purification Units</span>
                            <strong>${formatNumber(resources.Water?.PurificationUnits || 0)} plants</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Static Storage Tanks</span>
                            <strong>${formatNumber(resources.Water?.WaterStorageTanks || 0)} tanks</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Chlorine Decontamination</span>
                            <strong>${formatNumber(resources.Water?.ChlorineTablets || 0)} tablets</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Supply Duration</span>
                            <strong>${resources.Water?.SupplyDurationDays || 3} operational days</strong>
                        </div>
                    </div>
                </div>

                <!-- 3. SHELTER AGENT -->
                <div class="agent-command-card shelter-agent-card">
                    <div class="agent-card-header">
                        <div class="agent-icon-badge">🏕️</div>
                        <div>
                            <h5>Shelter &amp; Camp Agent</h5>
                            <span>Civilian Housing &amp; Welfare</span>
                        </div>
                    </div>
                    <div class="agent-stat-rows">
                        <div class="agent-stat-row highlight-stat">
                            <span>Modular Shelters</span>
                            <strong>${formatNumber(resources.Shelter?.TemporaryShelters || 0)} shelters</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Family Relief Tents</span>
                            <strong>${formatNumber(resources.Shelter?.FamilyTents || 0)} tents</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Thermal Blankets</span>
                            <strong>${formatNumber(resources.Shelter?.Blankets || 0)} blankets</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Sleeping Mattresses</span>
                            <strong>${formatNumber(resources.Shelter?.Mattresses || 0)} units</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Portable Sanitation Toilets</span>
                            <strong>${formatNumber(resources.Shelter?.PortableToilets || 0)} cabins</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Women Safety Havens</span>
                            <strong>${resources.Shelter?.WomenSafetyZones || 1} secured zones</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Child Care Relief Hubs</span>
                            <strong>${resources.Shelter?.ChildCareCenters || 1} centers</strong>
                        </div>
                    </div>
                </div>

                <!-- 4. MEDICAL AGENT -->
                <div class="agent-command-card medical-agent-card">
                    <div class="agent-card-header">
                        <div class="agent-icon-badge">🏥</div>
                        <div>
                            <h5>Medical Command Agent</h5>
                            <span>Trauma, Triage &amp; Critical Care</span>
                        </div>
                    </div>
                    <div class="agent-stat-rows">
                        <div class="agent-stat-row highlight-stat">
                            <span>Emergency Doctors</span>
                            <strong>${resources.Medical?.Doctors || 0} surgeons / docs</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Triage Nurses &amp; Medics</span>
                            <strong>${resources.Medical?.Nurses || 0} nurses • ${resources.Medical?.Paramedics || 0} medics</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Ambulance Fleet</span>
                            <strong>${resources.Medical?.Ambulances || 0} mobile ICUs</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Hospital &amp; ICU Beds</span>
                            <strong>${resources.Medical?.HospitalBeds || 0} beds (${resources.Medical?.ICUBeds || 0} ICU)</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Mechanical Ventilators</span>
                            <strong>${resources.Medical?.Ventilators || 0} life support units</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Emergency Blood Units</span>
                            <strong>${resources.Medical?.BloodUnits || 0} units</strong>
                        </div>
                        ${resources.Medical?.SpecialResources && resources.Medical.SpecialResources.length > 0 ? `
                            <div class="special-resources-box">
                                <small>SPECIALIZED MEDICAL PAYLOAD:</small>
                                <span>${resources.Medical.SpecialResources.map(escapeHtml).join(" • ")}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- 5. RESCUE AGENT -->
                <div class="agent-command-card rescue-agent-card">
                    <div class="agent-card-header">
                        <div class="agent-icon-badge">🚁</div>
                        <div>
                            <h5>Search &amp; Rescue Agent</h5>
                            <span>Tactical Extraction &amp; K9</span>
                        </div>
                    </div>
                    <div class="agent-stat-rows">
                        <div class="agent-stat-row highlight-stat">
                            <span>NDRF Battalions</span>
                            <strong>${resources.Rescue?.NDRFTeams || 0} federal teams</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>SDRF State Squads</span>
                            <strong>${resources.Rescue?.SDRFTeams || 0} state units</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Rescue Helicopters</span>
                            <strong>${resources.Rescue?.RescueHelicopters || 0} aircraft</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Flood Rescue Boats</span>
                            <strong>${resources.Rescue?.RescueBoats || 0} motor crafts</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Thermal Recon Drones</span>
                            <strong>${resources.Rescue?.RescueDrones || 0} UAV drones</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Trained K9 Search Dogs</span>
                            <strong>${resources.Rescue?.SearchDogs || 0} K9 teams</strong>
                        </div>
                    </div>
                </div>

                <!-- 6. POLICE AGENT -->
                <div class="agent-command-card police-agent-card">
                    <div class="agent-card-header">
                        <div class="agent-icon-badge">👮</div>
                        <div>
                            <h5>Law &amp; Perimeter Security Agent</h5>
                            <span>Evacuation Corridors &amp; Order</span>
                        </div>
                    </div>
                    <div class="agent-stat-rows">
                        <div class="agent-stat-row highlight-stat">
                            <span>Field Police Officers</span>
                            <strong>${resources.Police?.PoliceOfficers || 0} officers</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Traffic Flow Controllers</span>
                            <strong>${resources.Police?.TrafficPolice || 0} traffic units</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Crowd Control Battalions</span>
                            <strong>${resources.Police?.CrowdControlTeams || 0} squads</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Security Perimeter Barricades</span>
                            <strong>${resources.Police?.Barricades || 0} checkpoints</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Mobile Surveillance Vans</span>
                            <strong>${resources.Police?.MobileSurveillanceUnits || 0} tactical vans</strong>
                        </div>
                    </div>
                </div>

                <!-- 7. TRANSPORT AGENT -->
                <div class="agent-command-card transport-agent-card">
                    <div class="agent-card-header">
                        <div class="agent-icon-badge">🚚</div>
                        <div>
                            <h5>Heavy Transport &amp; Fleet Agent</h5>
                            <span>Logistics Convoy &amp; Earthmovers</span>
                        </div>
                    </div>
                    <div class="agent-stat-rows">
                        <div class="agent-stat-row highlight-stat">
                            <span>Heavy Relief Trucks</span>
                            <strong>${resources.Transport?.ReliefTrucks || 0} cargo haulers</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Civilian Evacuation Buses</span>
                            <strong>${resources.Transport?.EvacuationBuses || 0} transit buses</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Dedicated Ambulances</span>
                            <strong>${resources.Transport?.Ambulances || 0} fleet units</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Mobile Fuel Tankers</span>
                            <strong>${resources.Transport?.FuelTankers || 0} refuelers</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Debris Clearing Excavators</span>
                            <strong>${resources.Transport?.Excavators || 0} JCB / excavators</strong>
                        </div>
                        <div class="agent-stat-row">
                            <span>Heavy Mobile Cranes</span>
                            <strong>${resources.Transport?.Cranes || 0} heavy cranes</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- EMERGENCY DISPATCH NOTIFICATION BROADCAST BOX -->
        <div class="tactical-notification-box">
            <div class="notification-box-header">
                <div class="notif-header-left">
                    <span class="whatsapp-icon">💬</span>
                    <div>
                        <h5>Emergency Dispatch Alert Payload (Notification Agent)</h5>
                        <small>Prepared for Meta WhatsApp Cloud API &amp; Multi-Agency Broadcast</small>
                    </div>
                </div>
                <div class="notif-channel-badge">
                    <span>●</span> CHANNEL: META_WHATSAPP_CLOUD_API
                </div>
            </div>

            <pre class="alert-message-terminal">${escapeHtml(alertMessage)}</pre>

            <div class="alert-action-toolbar">
                <button type="button" class="copy-alert-inline-btn" onclick="copyEmergencyAlert()">
                    📋 Copy Broadcast Text
                </button>
                ${Number.isFinite(latitude) && Number.isFinite(longitude) ? `
                    <button type="button" class="focus-map-inline-btn" onclick="focusPlanOnMap(${latitude}, ${longitude}, '${escapeHtml(disasterType)}')">
                        🗺️ Focus Coordinates on Live Map
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    modal.classList.add("show");
}


// =====================================================
// TACTICAL MODAL ACTIONS & HELPERS
// =====================================================

function setupResultModalActions() {
    const modal = document.getElementById("resultModal");
    const closeBtnTop = document.getElementById("closeResultBtnTop");
    const closeBtn = document.getElementById("closeResultBtn");
    const copyAlertBtn = document.getElementById("copyAlertBtn");
    const printPlanBtn = document.getElementById("printPlanBtn");

    if (closeBtnTop) {
        closeBtnTop.addEventListener("click", () => {
            modal.classList.remove("show");
            loadDashboard();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("show");
            loadDashboard();
        });
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("show");
                loadDashboard();
            }
        });
    }

    if (copyAlertBtn) {
        copyAlertBtn.addEventListener("click", copyEmergencyAlert);
    }

    if (printPlanBtn) {
        printPlanBtn.addEventListener("click", printTacticalPlan);
    }
}

function copyEmergencyAlert() {
    if (!currentActivePlan) return;
    const alertText = currentActivePlan.Notification?.alert_text || 
        generateFallbackAlertText(currentActivePlan);

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(alertText).then(() => {
            showToastNotification("✅ Emergency Alert copied to clipboard!");
        }).catch(() => {
            copyFallback(alertText);
        });
    } else {
        copyFallback(alertText);
    }
}

function copyFallback(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand("copy");
        showToastNotification("✅ Emergency Alert copied to clipboard!");
    } catch (e) {
        alert("Alert text:\n\n" + text);
    }
    document.body.removeChild(textarea);
}

function printTacticalPlan() {
    if (currentActivePlan) {
        printSingleDisasterPlan(currentActivePlan);
    } else {
        window.print();
    }
}

async function printSingleDisasterPlanById(id) {
    try {
        let plan = (allSavedPlans || []).find(p => Number(p.id) === Number(id));
        if (!plan) {
            const resp = await fetch(`/response-plans/${Number(id)}`);
            if (!resp.ok) throw new Error("Could not load plan from server");
            plan = await resp.json();
        }
        printSingleDisasterPlan(plan);
    } catch (err) {
        console.error("Print single plan error:", err);
        alert("❌ Unable to print this disaster plan. Please make sure the plan is generated.");
    }
}

function printSingleDisasterPlan(planData) {
    if (!planData) {
        if (currentActivePlan) {
            planData = currentActivePlan;
        } else {
            showToastNotification("⚠️ Please open or select a disaster plan to print.", "error");
            return;
        }
    }

    const report = planData.report || planData;
    const disasterType = report.disaster_type || planData.disaster_type || "Disaster";
    const city = report.city || planData.city || "Unknown City";
    const state = report.state || planData.state || "";
    const country = report.country || planData.country || "India";
    const latitude = Number(report.latitude || planData.latitude);
    const longitude = Number(report.longitude || planData.longitude);
    const affected = report.affected_people || planData.affected_people || 0;
    const reporter = report.reported_by || planData.reported_by || "Disaster AI Command";
    const reportTime = report.report_time || planData.report_time || new Date().toISOString();
    const id = report.id || planData.id || "NEW";
    const aiSeverity = String(planData.AI_Severity || report.ai_severity || report.severity || "HIGH").toUpperCase();
    const prediction = planData.Prediction || report.Prediction || {};
    const resources = planData.Resources || report.Resources || {};
    const notification = planData.Notification || report.Notification || null;
    const isEvacRequired = String(prediction.Evacuation || "").toUpperCase() === "YES";
    const alertMessage = notification?.alert_text || generateFallbackAlertText({
        disaster_type: disasterType,
        city,
        state,
        country,
        aiSeverity,
        prediction,
        affected_people: affected
    });

    const severityColor = aiSeverity.includes("EXTREME") || aiSeverity.includes("CRITICAL") ? "#dc2626"
        : aiSeverity.includes("HIGH") ? "#ea580c"
        : aiSeverity.includes("MEDIUM") ? "#d97706"
        : "#16a34a";

    const printHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Disaster Incident #${id} - ${escapeHtml(disasterType)} - Tactical Plan</title>
    <style>
        @page {
            size: A4;
            margin: 12mm 15mm 12mm 15mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            font-size: 10.5pt;
            line-height: 1.45;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .header-box {
            border-bottom: 2.5px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .gov-title {
            font-size: 8pt;
            letter-spacing: 0.12em;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
        }
        .main-heading {
            font-size: 17pt;
            font-weight: 800;
            color: #0f172a;
            margin-top: 2px;
            line-height: 1.2;
            letter-spacing: 0.02em;
        }
        .sub-heading {
            font-size: 9pt;
            color: #64748b;
            font-weight: 600;
            margin-top: 3px;
        }
        .incident-badge-box {
            text-align: right;
        }
        .badge-incident {
            display: inline-block;
            background: #0f172a;
            color: #ffffff;
            font-weight: 800;
            font-size: 11pt;
            padding: 4px 10px;
            border-radius: 4px;
            letter-spacing: 0.05em;
        }
        .meta-stamp {
            font-size: 8pt;
            color: #64748b;
            margin-top: 3px;
        }

        /* PRIMARY INCIDENT OVERVIEW */
        .incident-overview {
            display: grid;
            grid-template-columns: 2.2fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
            padding: 12px 14px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
        }
        .overview-title {
            font-size: 14pt;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.02em;
        }
        .overview-location {
            font-size: 10.5pt;
            color: #334155;
            margin-top: 3px;
            font-weight: 600;
        }
        .overview-meta-list {
            margin-top: 8px;
            font-size: 8.8pt;
            color: #475569;
            line-height: 1.6;
        }
        .overview-meta-list strong {
            color: #0f172a;
        }
        .severity-callout {
            border: 2px solid ${severityColor};
            border-radius: 6px;
            padding: 10px;
            text-align: center;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .severity-callout-label {
            font-size: 7.5pt;
            font-weight: 800;
            letter-spacing: 0.1em;
            color: #64748b;
            text-transform: uppercase;
        }
        .severity-callout-val {
            font-size: 14pt;
            font-weight: 800;
            color: ${severityColor};
            margin-top: 3px;
            letter-spacing: 0.04em;
        }

        /* EVACUATION DIRECTIVE BANNER */
        .evac-directive {
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 12px;
            font-size: 9.5pt;
            font-weight: 600;
            ${isEvacRequired ? `
                background: #fee2e2;
                border: 1.5px solid #dc2626;
                color: #991b1b;
            ` : `
                background: #ecfdf5;
                border: 1.5px solid #059669;
                color: #065f46;
            `}
        }

        /* STRATEGIC RISK TELEMETRY */
        .hud-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 12px;
        }
        .hud-cell {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 7px 10px;
            text-align: center;
        }
        .hud-cell-label {
            font-size: 7pt;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }
        .hud-cell-val {
            font-size: 10.5pt;
            font-weight: 800;
            color: #0f172a;
            margin-top: 2px;
            letter-spacing: 0.02em;
        }

        /* AGENTS LOGISTICS GRID */
        .section-header {
            font-size: 10pt;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 3px;
            margin: 12px 0 8px 0;
        }
        .agents-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .agent-box {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 7px 10px;
            page-break-inside: avoid;
        }
        .agent-box-title {
            font-size: 9pt;
            font-weight: 800;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 5px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 5px;
        }
        .agent-item-list {
            font-size: 8.2pt;
            line-height: 1.5;
            color: #334155;
        }
        .agent-item-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dotted #e2e8f0;
            padding: 1.5px 0;
        }
        .agent-item-row strong {
            color: #0f172a;
            font-weight: 700;
        }

        /* BROADCAST ALERT BOX */
        .alert-broadcast-box {
            margin-top: 10px;
            border: 1px solid #94a3b8;
            background: #f8fafc;
            border-radius: 6px;
            padding: 8px 10px;
            page-break-inside: avoid;
        }
        .alert-broadcast-title {
            font-size: 8pt;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 3px;
        }
        .alert-broadcast-content {
            font-family: "Courier New", Courier, monospace;
            font-size: 8pt;
            line-height: 1.4;
            color: #1e293b;
            white-space: pre-wrap;
            background: #ffffff;
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }

        /* SIGN-OFF FOOTER */
        .signoff-section {
            margin-top: 16px;
            padding-top: 8px;
            border-top: 1px solid #0f172a;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 7.8pt;
            color: #475569;
            page-break-inside: avoid;
        }
        .signature-line {
            width: 180px;
            border-top: 1px solid #0f172a;
            margin-top: 25px;
            text-align: center;
            font-size: 7.8pt;
            font-weight: 700;
            color: #0f172a;
            padding-top: 3px;
        }
    </style>
</head>
<body>
    <div class="print-sheet">
        <div class="header-box">
            <div>
                <div class="gov-title">Republic of India • Disaster Crisis Command Center</div>
                <h1 class="main-heading">AI TACTICAL INCIDENT RESPONSE PLAN</h1>
                <div class="sub-heading">Multi-Agent Algorithmic Resource Directive &amp; Operational Logistics</div>
            </div>
            <div class="incident-badge-box">
                <span class="badge-incident">INCIDENT #${id}</span>
                <div class="meta-stamp">Printed: ${new Date().toLocaleString()}</div>
                <div class="meta-stamp" style="font-weight:700; color:#059669;">● COORDINATION ACTIVE</div>
            </div>
        </div>

        <div class="incident-overview">
            <div>
                <div class="overview-title">${escapeHtml(disasterType)}</div>
                <div class="overview-location">📍 ${escapeHtml(city)}, ${escapeHtml(state)} (${escapeHtml(country)})</div>
                <div class="overview-meta-list">
                    ${Number.isFinite(latitude) && Number.isFinite(longitude) ? `<div>GPS Coordinates: <strong>${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E</strong></div>` : ''}
                    <div>Incident Recorded Time: <strong>${formatDate(reportTime)}</strong></div>
                    <div>Reporting Authority / Citizen: <strong>${escapeHtml(reporter)}</strong></div>
                    <div>Civilian Population at Direct Risk: <strong>${formatNumber(affected)} citizens</strong></div>
                </div>
            </div>
            <div class="severity-callout">
                <span class="severity-callout-label">AI Assessed Severity</span>
                <span class="severity-callout-val">${escapeHtml(aiSeverity)}</span>
                <span style="font-size: 7pt; color: #64748b; margin-top: 3px;">Algorithmic Priority Rating</span>
            </div>
        </div>

        <div class="evac-directive">
            ${isEvacRequired
                ? `<strong>🚨 MANDATORY CIVILIAN EVACUATION DIRECTIVE:</strong> Immediate evacuation protocol approved for ${formatNumber(affected)} civilians in ${escapeHtml(city)}. Mobilize transit corridors and relief shelters immediately.`
                : `<strong>🛡️ LOCAL SHELTER-IN-PLACE DIRECTIVE:</strong> Immediate evacuation not required at this time. Maintain high alert, staging hubs, and local emergency services.`}
        </div>

        <div class="hud-grid">
            <div class="hud-cell">
                <div class="hud-cell-label">Spread Risk</div>
                <div class="hud-cell-val">${escapeHtml(prediction.Spread_Risk || "LOW")}</div>
            </div>
            <div class="hud-cell">
                <div class="hud-cell-label">Mission Priority</div>
                <div class="hud-cell-val">${escapeHtml(prediction.Priority || "HIGH")}</div>
            </div>
            <div class="hud-cell">
                <div class="hud-cell-label">Evacuation Status</div>
                <div class="hud-cell-val" style="color: ${isEvacRequired ? '#dc2626' : '#16a34a'};">
                    ${isEvacRequired ? 'REQUIRED' : 'NOT REQUIRED'}
                </div>
            </div>
            <div class="hud-cell">
                <div class="hud-cell-label">Impact Scope</div>
                <div class="hud-cell-val">${escapeHtml(prediction.Expected_Impact || "LOCAL ZONE")}</div>
            </div>
        </div>

        <div class="section-header">Coordinated Resource Agent Allocations (7 Specialized Agents)</div>
        <div class="agents-grid">
            <!-- 1. Food Agent -->
            <div class="agent-box">
                <div class="agent-box-title">🍱 Food Logistics Agent</div>
                <div class="agent-item-list">
                    <div class="agent-item-row"><span>Ready Food Packets</span><strong>${formatNumber(resources.Food?.FoodPackets || 0)} pkts</strong></div>
                    <div class="agent-item-row"><span>Daily Meal Schedule</span><strong>${resources.Food?.MealsPerDay || 3} meals / day</strong></div>
                    <div class="agent-item-row"><span>Meal Classification</span><strong>${escapeHtml(resources.Food?.MealType || "Standard Relief Meals")}</strong></div>
                    <div class="agent-item-row"><span>Infant Nutritional Kits</span><strong>${formatNumber(resources.Food?.BabyFoodKits || 0)} kits</strong></div>
                    <div class="agent-item-row"><span>Family Dry Rations</span><strong>${formatNumber(resources.Food?.DryRationKits || 0)} kits</strong></div>
                    <div class="agent-item-row"><span>Buffer Reserve Packets</span><strong>${formatNumber(resources.Food?.EmergencyReserve || 0)} pkts</strong></div>
                    <div class="agent-item-row"><span>Distribution Hubs</span><strong>${resources.Food?.DistributionCenters || 1} hubs (${resources.Food?.SupplyDurationDays || 3} days)</strong></div>
                </div>
            </div>

            <!-- 2. Water Agent -->
            <div class="agent-box">
                <div class="agent-box-title">💧 Water Security Agent</div>
                <div class="agent-item-list">
                    <div class="agent-item-row"><span>Potable Water Bottles</span><strong>${formatNumber(resources.Water?.WaterBottles || 0)} bottles</strong></div>
                    <div class="agent-item-row"><span>Mobile Heavy Tankers</span><strong>${formatNumber(resources.Water?.WaterTankers || 0)} tankers</strong></div>
                    <div class="agent-item-row"><span>Field Water Purification Plants</span><strong>${formatNumber(resources.Water?.PurificationUnits || 0)} units</strong></div>
                    <div class="agent-item-row"><span>Static Clean Storage Tanks</span><strong>${formatNumber(resources.Water?.WaterStorageTanks || 0)} tanks</strong></div>
                    <div class="agent-item-row"><span>Chlorine Decontamination Tablets</span><strong>${formatNumber(resources.Water?.ChlorineTablets || 0)} tabs</strong></div>
                    <div class="agent-item-row"><span>Operational Supply Horizon</span><strong>${resources.Water?.SupplyDurationDays || 3} days</strong></div>
                </div>
            </div>

            <!-- 3. Shelter Agent -->
            <div class="agent-box">
                <div class="agent-box-title">🏕️ Shelter &amp; Camp Agent</div>
                <div class="agent-item-list">
                    <div class="agent-item-row"><span>Modular Weatherproof Shelters</span><strong>${formatNumber(resources.Shelter?.TemporaryShelters || 0)} units</strong></div>
                    <div class="agent-item-row"><span>Family Relief Tents</span><strong>${formatNumber(resources.Shelter?.FamilyTents || 0)} tents</strong></div>
                    <div class="agent-item-row"><span>Thermal Insulation Blankets</span><strong>${formatNumber(resources.Shelter?.Blankets || 0)} blankets</strong></div>
                    <div class="agent-item-row"><span>Sleeping Mattresses</span><strong>${formatNumber(resources.Shelter?.Mattresses || 0)} units</strong></div>
                    <div class="agent-item-row"><span>Portable Sanitation Cabins</span><strong>${formatNumber(resources.Shelter?.PortableToilets || 0)} units</strong></div>
                    <div class="agent-item-row"><span>Secured Safety Zones (Women &amp; Children)</span><strong>${(resources.Shelter?.WomenSafetyZones || 1) + (resources.Shelter?.ChildCareCenters || 1)} zones</strong></div>
                </div>
            </div>

            <!-- 4. Medical Agent -->
            <div class="agent-box">
                <div class="agent-box-title">🏥 Medical Command Agent</div>
                <div class="agent-item-list">
                    <div class="agent-item-row"><span>Emergency Physicians &amp; Doctors</span><strong>${formatNumber(resources.Medical?.Doctors || 0)} doctors</strong></div>
                    <div class="agent-item-row"><span>Field Trauma Paramedics</span><strong>${formatNumber(resources.Medical?.Paramedics || 0)} staff</strong></div>
                    <div class="agent-item-row"><span>Advanced Life Support Ambulances</span><strong>${formatNumber(resources.Medical?.Ambulances || 0)} units</strong></div>
                    <div class="agent-item-row"><span>Mobile Surgical Units</span><strong>${formatNumber(resources.Medical?.MobileSurgicalUnits || 0)} units</strong></div>
                    <div class="agent-item-row"><span>Deployable Field Hospitals</span><strong>${formatNumber(resources.Medical?.FieldHospitals || 0)} camps</strong></div>
                    <div class="agent-item-row"><span>Emergency First Aid &amp; Trauma Kits</span><strong>${formatNumber(resources.Medical?.MedicalKits || 0)} kits</strong></div>
                </div>
            </div>

            <!-- 5. Rescue Agent -->
            <div class="agent-box">
                <div class="agent-box-title">🚁 Search &amp; Rescue (NDRF) Agent</div>
                <div class="agent-item-list">
                    <div class="agent-item-row"><span>NDRF Specialized Rescue Teams</span><strong>${formatNumber(resources.Rescue?.NDRFTeams || 0)} teams</strong></div>
                    <div class="agent-item-row"><span>Motorized Inflatable Rescue Boats</span><strong>${formatNumber(resources.Rescue?.RescueBoats || 0)} boats</strong></div>
                    <div class="agent-item-row"><span>Urban Search K9 Sniffer Squads</span><strong>${formatNumber(resources.Rescue?.CanineSquads || 0)} squads</strong></div>
                    <div class="agent-item-row"><span>Heavy Earthmoving Excavators</span><strong>${formatNumber(resources.Rescue?.Excavators || 0)} units</strong></div>
                    <div class="agent-item-row"><span>Coast Guard Rated Life Jackets</span><strong>${formatNumber(resources.Rescue?.LifeJackets || 0)} units</strong></div>
                    <div class="agent-item-row"><span>Thermal Drone Reconnaissance</span><strong>${resources.Rescue?.DroneReconTeams || 2} teams</strong></div>
                </div>
            </div>

            <!-- 6. Police Agent -->
            <div class="agent-box">
                <div class="agent-box-title">👮 Police &amp; Security Agent</div>
                <div class="agent-item-list">
                    <div class="agent-item-row"><span>Law Enforcement Officers</span><strong>${formatNumber(resources.Police?.PoliceOfficers || 0)} personnel</strong></div>
                    <div class="agent-item-row"><span>Perimeter Access Checkpoints</span><strong>${formatNumber(resources.Police?.PerimeterCheckpoints || 0)} points</strong></div>
                    <div class="agent-item-row"><span>Crowd Control &amp; Quick Response Units</span><strong>${formatNumber(resources.Police?.CrowdControlUnits || 0)} units</strong></div>
                    <div class="agent-item-row"><span>Traffic Corridor Clearance Teams</span><strong>${formatNumber(resources.Police?.TrafficClearanceTeams || 0)} teams</strong></div>
                    <div class="agent-item-row"><span>Aerial Drone Law Enforcement</span><strong>${formatNumber(resources.Police?.DroneSurveillance || 0)} drones</strong></div>
                    <div class="agent-item-row"><span>Mobile Emergency Patrol Convoys</span><strong>${formatNumber(resources.Police?.PatrolVehicles || 0)} vehicles</strong></div>
                </div>
            </div>

            <!-- 7. Transport Agent -->
            <div class="agent-box" style="grid-column: span 2;">
                <div class="agent-box-title">🚚 Heavy Transport &amp; Evacuation Logistics Agent</div>
                <div class="agent-item-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px 16px;">
                    <div class="agent-item-row"><span>Relief Supply Heavy Trucks</span><strong>${formatNumber(resources.Transport?.ReliefTrucks || 0)} trucks</strong></div>
                    <div class="agent-item-row"><span>Civilian Evacuation Convoys (Buses)</span><strong>${formatNumber(resources.Transport?.EvacuationBuses || 0)} buses</strong></div>
                    <div class="agent-item-row"><span>Tactical Medium Helicopters</span><strong>${formatNumber(resources.Transport?.Helicopters || 0)} choppers</strong></div>
                    <div class="agent-item-row"><span>Heavy Route Clearance Cranes</span><strong>${formatNumber(resources.Transport?.HeavyClearanceCranes || 0)} cranes</strong></div>
                    <div class="agent-item-row"><span>Mobile Fuel Supply Bowsers</span><strong>${formatNumber(resources.Transport?.FuelTankers || 0)} tankers</strong></div>
                    <div class="agent-item-row"><span>Staging Logistic Bases</span><strong>${resources.Transport?.StagingBases || 1} bases</strong></div>
                </div>
            </div>
        </div>

        <div class="alert-broadcast-box">
            <div class="alert-broadcast-title">📢 Official Emergency Broadcast Bulletin (Public &amp; Tactical Wire)</div>
            <div class="alert-broadcast-content">${escapeHtml(alertMessage)}</div>
        </div>

        <div class="signoff-section">
            <div>
                <div><strong>System:</strong> Disaster AI Multi-Agent Autonomous Command Engine</div>
                <div><strong>Directive Status:</strong> APPROVED &amp; TRANSMITTED TO FIELD COMMAND</div>
                <div><strong>Authentication Hash:</strong> SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-TACTICAL-${id}</div>
            </div>
            <div>
                <div class="signature-line">Incident Commander Signature</div>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    // Create an invisible iframe to isolate print strictly to this disaster
    let printFrame = document.getElementById("disasterSinglePrintFrame");
    if (printFrame) {
        printFrame.remove();
    }

    printFrame = document.createElement("iframe");
    printFrame.id = "disasterSinglePrintFrame";
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    printFrame.style.zIndex = "-9999";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(printHtml);
    doc.close();

    showToastNotification(`🖨️ Preparing official report for ${escapeHtml(disasterType)} (#${id})...`);

    setTimeout(() => {
        try {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
        } catch (err) {
            console.error("Print trigger failed:", err);
            window.print();
        }
    }, 450);
}

function focusPlanOnMap(lat, lng, disasterType) {
    const modal = document.getElementById("resultModal");
    if (modal) modal.classList.remove("show");

    const mapSection = document.getElementById("map-section");
    const mapNavBtn = document.querySelector('[data-section="map-section"]');
    if (mapNavBtn) {
        document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
        mapNavBtn.classList.add("active");
    }

    if (mapSection) {
        mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (map && Number.isFinite(lat) && Number.isFinite(lng)) {
        setTimeout(() => {
            map.invalidateSize();
            map.setView([lat, lng], 13);
            if (markersLayer) {
                markersLayer.eachLayer(layer => {
                    const lPos = layer.getLatLng();
                    if (Math.abs(lPos.lat - lat) < 0.001 && Math.abs(lPos.lng - lng) < 0.001) {
                        layer.openPopup();
                    }
                });
            }
        }, 500);
    }
}

function showToastNotification(message) {
    let toast = document.getElementById("tacticalToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "tacticalToast";
        toast.className = "tactical-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function generateFallbackAlertText(data) {
    const report = data.report || data;
    const type = report.disaster_type || data.disaster_type || "Disaster";
    const city = report.city || data.city || "Unknown City";
    const state = report.state || data.state || "";
    const severity = data.AI_Severity || report.ai_severity || report.severity || "HIGH";
    const prediction = data.Prediction || report.Prediction || {};
    const priority = prediction.Priority || report.severity || "HIGH";
    const evac = prediction.Evacuation || "NO";
    const affected = report.affected_people || data.affected_people || 0;

    return `🚨 DISASTER EMERGENCY ALERT\n` +
        `Type: ${type}\n` +
        `AI Severity: ${severity}\n` +
        `Priority: ${priority}\n` +
        `Location: ${city}${state ? ', ' + state : ''}\n` +
        `Affected People: ${affected}\n` +
        `Evacuation: ${evac}\n\n` +
        `Emergency response teams have been notified. Please follow official emergency instructions.`;
}


// =====================================================
// GENERAL UI HELPERS
// =====================================================

function formatNumber(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "0";
    }

    return number.toLocaleString("en-IN");
}


function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return escapeHtml(String(value));
    }

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}


function showLoading() {

    const stats = [
        "totalDisasters",
        "affectedPeople",
        "highPriority",
        "activeLocations"
    ];

    stats.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = "—";
    });

    const types = document.getElementById("disasterTypes");
    if (types) {
        types.innerHTML = `<div class="loading">Loading incident intelligence...</div>`;
    }
}


function showError(message) {

    console.error(message);

    const types = document.getElementById("disasterTypes");
    if (types) {
        types.innerHTML = `
            <div class="loading error-state">
                ❌ ${escapeHtml(message)}
            </div>
        `;
    }
}


// HTML ESCAPE
// =====================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}