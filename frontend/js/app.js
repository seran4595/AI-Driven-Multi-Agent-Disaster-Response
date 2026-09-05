// =====================================================
// DISASTER AI COMMAND CENTER
// APP.JS v2.3
// SMART LOCATION + LIVE MAP + REPORTING
// =====================================================

let map = null;
let markersLayer = null;
let currentLocations = [];

let locationPickerMap = null;
let locationPickerMarker = null;
let selectedCoordinates = null;


// =====================================================
// DOM READY
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeMap();

    setupNavigation();

    setupReportModal();

    setupButtons();

    setupSmartLocation();

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


        if (
            !results ||
            results.length === 0
        ) {

            // Try worldwide if India search
            // returned nothing.

            const fallbackUrl =
                "https://nominatim.openstreetmap.org/search?" +
                new URLSearchParams({

                    q: query,

                    format: "json",

                    addressdetails: "1",

                    limit: "5"

                });


            const fallbackResponse =
                await fetch(
                    fallbackUrl,
                    {
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            const fallbackResults =
                await fallbackResponse.json();


            if (
                !fallbackResults ||
                fallbackResults.length === 0
            ) {

                showLocationMessage(
                    "❌ Location not found. Try a nearby city, area or landmark."
                );

                return;

            }


            renderLocationSuggestions(
                fallbackResults
            );

            return;

        }


        renderLocationSuggestions(
            results
        );

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

            showLocationMessage(
                accuracy > 1000
                    ? `⚠️ Location detected, but accuracy is about ${Math.round(accuracy)} m. For better accuracy, use Search Location or click the map.`
                    : `📍 Location detected (accuracy about ${Math.round(accuracy)} m).`
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
        setTimeout(finish, 8000);

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

    /*
        Nominatim can return different fields
        depending on whether the user selects:

        Chennai
        Chennai Railway Station
        Vellore
        VIT
        a street
        a village
        a landmark
    */


    const country =
        address.country ||
        "India";


    const state =
        address.state ||
        address.region ||
        address.state_district ||
        "";


    const city =
        address.city ||
        address.town ||
        address.municipality ||
        address.village ||
        address.city_district ||
        address.suburb ||
        address.county ||
        "";


    const place =
        city ||
        address.town ||
        address.village ||
        address.suburb ||
        address.neighbourhood ||
        displayName ||
        "Selected Location";


    return {

        country,

        state,

        city: place,

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

function updateDisasterTypes(
    types
) {

    const container =
        document.getElementById(
            "disasterTypes"
        );


    container.innerHTML = "";


    const entries =
        Object.entries(types)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (
        entries.length === 0
    ) {

        container.innerHTML = `
            <div class="loading">
                No disaster data available.
            </div>
        `;

        return;

    }


    const total =
        entries.reduce(
            (sum, item) =>
                sum + item[1],
            0
        );


    entries.forEach(
        ([type, count]) => {

            const percentage =
                (count / total) * 100;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "type-row";


            row.innerHTML = `

                <div class="type-top">

                    <span class="type-name">
                        ${escapeHtml(type)}
                    </span>

                    <span class="type-count">
                        ${formatNumber(count)}
                    </span>

                </div>


                <div class="progress">

                    <div
                        class="progress-bar"
                        style="width:${percentage}%"
                    ></div>

                </div>


                <div class="type-percentage">

                    ${percentage.toFixed(0)}%
                    of incidents

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// =====================================================
// UPDATE MAIN MAP
// =====================================================

function updateMap(
    locations
) {

    currentLocations =
        locations;


    if (!markersLayer) return;


    markersLayer.clearLayers();


    const bounds = [];


    locations.forEach(
        disaster => {

            const latitude =
                Number(
                    disaster.latitude
                );


            const longitude =
                Number(
                    disaster.longitude
                );


            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {

                return;

            }


            bounds.push([
                latitude,
                longitude
            ]);


            const marker =
                L.marker(
                    [
                        latitude,
                        longitude
                    ]
                );


            marker.bindPopup(`

                <div class="map-popup">

                    <div class="popup-title">

                        🚨
                        ${escapeHtml(
                            disaster.disaster_type
                        )}

                    </div>


                    <div>

                        📍
                        ${escapeHtml(
                            disaster.city
                        )},
                        ${escapeHtml(
                            disaster.state
                        )}

                    </div>


                    <div>

                        🌎
                        ${escapeHtml(
                            disaster.country
                        )}

                    </div>


                    <div>

                        ⚠️ Severity:

                        <strong>
                            ${escapeHtml(
                                disaster.severity
                            )}
                        </strong>

                    </div>


                    <div>

                        👥 Affected:

                        ${formatNumber(
                            disaster.affected_people
                        )}

                    </div>

                </div>

            `);


            marker.addTo(
                markersLayer
            );

        }
    );


    if (
        bounds.length > 0
    ) {

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

function renderReports(
    reports
) {

    const table =
        document.getElementById(
            "reportsTable"
        );


    document.getElementById(
        "reportCount"
    ).textContent =
        `${reports.length} ${
            reports.length === 1
                ? "report"
                : "reports"
        }`;


    table.innerHTML = "";


    if (
        reports.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="loading"
                >
                    No disaster reports yet.
                </td>

            </tr>

        `;

        return;

    }


    reports
        .slice(0, 20)
        .forEach(
            report => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const severity =
                    String(
                        report.severity || ""
                    ).toLowerCase();


                row.innerHTML = `

                    <td>

                        <strong>
                            ${escapeHtml(
                                report.disaster_type
                            )}
                        </strong>

                    </td>


                    <td>

                        ${escapeHtml(
                            report.city
                        )},

                        ${escapeHtml(
                            report.state
                        )}

                    </td>


                    <td>

                        <span
                            class="severity ${severity}"
                        >

                            ${escapeHtml(
                                report.severity
                            )}

                        </span>

                    </td>


                    <td>

                        ${formatNumber(
                            report.affected_people
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            report.reported_by
                        )}

                    </td>


                    <td>

                        ${formatDate(
                            report.report_time
                        )}

                    </td>

                    <td>

                        ${report.has_response_plan ? `
                            <button
                                type="button"
                                class="view-plan-btn"
                                onclick="openSavedResponsePlan(${Number(report.id)})"
                            >
                                🚨 View Plan
                            </button>
                        ` : `
                            <span class="no-plan">Not available</span>
                        `}

                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );

}


// =====================================================
// RESPONSE PLANS
// =====================================================

async function loadResponsePlans() {

    const container =
        document.getElementById("responsePlansList");

    const countElement =
        document.getElementById("responsePlanCount");

    if (!container) return;

    try {

        const response =
            await fetch("/response-plans");

        if (!response.ok) {
            throw new Error("Response Plans API failed");
        }

        const plans = await response.json();

        if (countElement) {
            countElement.textContent =
                `${plans.length} ${plans.length === 1 ? "plan" : "plans"}`;
        }

        renderResponsePlans(plans);

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


function renderResponsePlans(plans) {

    const container =
        document.getElementById("responsePlansList");

    if (!container) return;

    container.innerHTML = "";

    if (!plans || plans.length === 0) {

        container.innerHTML = `
            <div class="response-empty-state">
                <div class="empty-icon">🚨</div>
                <strong>No AI response plans yet</strong>
                <span>Submit a disaster report and the Coordinator Agent will create the plan here.</span>
            </div>
        `;

        return;
    }

    plans.forEach(plan => {

        const card = document.createElement("article");

        const severityText =
            plan.AI_Severity || plan.severity || "Pending";

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

        const resourceCount = Object.keys(resources).length;

        card.className = "response-plan-card";

        card.innerHTML = `

            <div class="response-plan-card-top">

                <div class="response-plan-type">
                    <div class="response-plan-icon">🚨</div>
                    <div>
                        <span class="response-plan-label">DISASTER #${Number(plan.id)}</span>
                        <h4>${escapeHtml(plan.disaster_type || "Disaster")}</h4>
                    </div>
                </div>

                <span class="response-severity ${severityClass}">
                    ${escapeHtml(severityText)}
                </span>

            </div>

            <div class="response-plan-location">
                📍 ${escapeHtml(plan.city || "Unknown")},
                ${escapeHtml(plan.state || "")}
                ${plan.country ? `, ${escapeHtml(plan.country)}` : ""}
            </div>

            <div class="response-plan-stats">

                <div>
                    <span>AFFECTED</span>
                    <strong>${formatNumber(plan.affected_people || 0)}</strong>
                </div>

                <div>
                    <span>PRIORITY</span>
                    <strong>${escapeHtml(prediction.Priority || plan.severity || "—")}</strong>
                </div>

                <div>
                    <span>RESOURCE AGENTS</span>
                    <strong>${resourceCount}/7</strong>
                </div>

            </div>

            <div class="response-plan-footer">

                <span>
                    ${formatDate(plan.report_time)}
                </span>

                <button
                    type="button"
                    class="view-plan-btn large"
                    onclick="openSavedResponsePlan(${Number(plan.id)})"
                >
                    View Full Response Plan →
                </button>

            </div>
        `;

        container.appendChild(card);
    });
}


async function openSavedResponsePlan(id) {

    try {

        const response =
            await fetch(`/response-plans/${Number(id)}`);

        if (!response.ok) {
            throw new Error("Response plan could not be loaded.");
        }

        const plan = await response.json();

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


function showAIResult(
    data
) {

    const modal =
        document.getElementById(
            "resultModal"
        );


    const content =
        document.getElementById(
            "aiResultContent"
        );


    // =====================================================
    // HELPER: Safely display values
    // =====================================================

    function safe(value) {

        if (value === null || value === undefined) {
            return "—";
        }

        return escapeHtml(String(value));
    }


    // =====================================================
    // HELPER: Format resource values
    // Handles strings, numbers, arrays and nested objects.
    // =====================================================

    function formatValue(value) {

        if (value === null || value === undefined) {
            return "—";
        }

        if (Array.isArray(value)) {

            if (value.length === 0) {
                return "—";
            }

            return value
                .map(item => formatValue(item))
                .join("<br>");
        }


        if (typeof value === "object") {

            return Object.entries(value)
                .map(([key, item]) => {

                    return `
                        <span class="nested-resource-line">
                            <b>${safe(key)}</b>: ${formatValue(item)}
                        </span>
                    `;

                })
                .join("");
        }


        return safe(value);
    }


    // =====================================================
    // HELPER: Resource detail rows
    // =====================================================

    function renderDetails(resource) {

        if (!resource || typeof resource !== "object") {

            return `
                <div class="resource-empty">
                    No resource information available.
                </div>
            `;
        }


        const entries = Object.entries(resource);


        if (entries.length === 0) {

            return `
                <div class="resource-empty">
                    No resource information available.
                </div>
            `;
        }


        return entries
            .map(([key, value]) => {

                return `
                    <div class="resource-item">

                        <span class="resource-label">
                            ${safe(key)}
                        </span>

                        <strong class="resource-value">
                            ${formatValue(value)}
                        </strong>

                    </div>
                `;

            })
            .join("");
    }


    // =====================================================
    // HELPER: Resource agent card
    // =====================================================

    function renderResource(
        icon,
        title,
        resource
    ) {

        return `
            <section class="resource-response-card">

                <div class="resource-response-header">

                    <div class="resource-response-icon">
                        ${icon}
                    </div>

                    <div>

                        <h4>
                            ${title}
                        </h4>

                        <span>
                            AI Resource Allocation
                        </span>

                    </div>

                </div>


                <div class="resource-items">
                    ${renderDetails(resource)}
                </div>

            </section>
        `;
    }


    // =====================================================
    // PREDICTION
    // =====================================================

    const prediction = data.Prediction || {};

    let predictionHTML = "";


    if (
        prediction &&
        typeof prediction === "object" &&
        !Array.isArray(prediction)
    ) {

        const entries = Object.entries(prediction);


        if (entries.length > 0) {

            predictionHTML = entries
                .map(([key, value]) => {

                    return `
                        <div class="prediction-item">

                            <span>
                                ${safe(key)}
                            </span>

                            <strong>
                                ${formatValue(value)}
                            </strong>

                        </div>
                    `;

                })
                .join("");

        }
    }


    if (!predictionHTML) {

        predictionHTML = `
            <div class="prediction-item prediction-full-width">
                <strong>
                    ${formatValue(prediction)}
                </strong>
            </div>
        `;
    }


    // =====================================================
    // RESOURCES
    // =====================================================

    const resources =
        data.Resources || {};


    // =====================================================
    // COMPLETE AI RESPONSE
    // =====================================================

    content.innerHTML = `

        <!-- =============================================
             AI SUMMARY
        ============================================== -->

        <div class="ai-response-summary">

            <div class="ai-summary-card severity-card">

                <span>
                    AI SEVERITY
                </span>

                <strong>
                    ${safe(data.AI_Severity)}
                </strong>

            </div>


            <div class="ai-summary-card">

                <span>
                    DATABASE
                </span>

                <strong>
                    ✓ Saved
                </strong>

            </div>

        </div>


        <!-- =============================================
             AI PREDICTION
        ============================================== -->

        <section class="prediction-response-card">

            <div class="response-section-title">

                <span class="response-section-icon">
                    🧠
                </span>

                <div>

                    <h4>
                        AI Prediction &amp; Risk Analysis
                    </h4>

                    <small>
                        Prediction Agent
                    </small>

                </div>

            </div>


            <div class="prediction-grid">
                ${predictionHTML}
            </div>

        </section>


        <!-- =============================================
             COORDINATED RESOURCE PLAN
        ============================================== -->

        <div class="response-plan-title">

            <span>
                🚨
            </span>

            <div>

                <h4>
                    Coordinated Emergency Response Plan
                </h4>

                <small>
                    Generated by the Multi-Agent Resource System
                </small>

            </div>

        </div>


        <div class="resource-response-grid">

            ${renderResource(
                "🍱",
                "Food Response",
                resources.Food
            )}

            ${renderResource(
                "💧",
                "Water Response",
                resources.Water
            )}

            ${renderResource(
                "🏕️",
                "Shelter Response",
                resources.Shelter
            )}

            ${renderResource(
                "🏥",
                "Medical Response",
                resources.Medical
            )}

            ${renderResource(
                "🚁",
                "Rescue Response",
                resources.Rescue
            )}

            ${renderResource(
                "👮",
                "Police Response",
                resources.Police
            )}

            ${renderResource(
                "🚚",
                "Transport Response",
                resources.Transport
            )}

        </div>

    `;


    // =====================================================
    // OPEN RESULT MODAL
    // =====================================================

    modal.classList.add(
        "show"
    );

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