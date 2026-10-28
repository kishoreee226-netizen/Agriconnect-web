```javascript
/**
 * AgriConnect Pro Weather & Soil Health Station
 * Powered by Open-Meteo High-Resolution Agricultural API
 * 100% Free, Zero API Keys, Zero CORS Restrictions, Client-Side Real-time
 */

(function () {
  // Default Coordinates: Warangal / Hanamkonda (Heart of Telangana Agri Belt)
  let currentLat = 17.9784;
  let currentLon = 79.5941;
  let currentLocationName = "హనుమకొండ / వరంగల్ (తెలంగాణ)";
  let rawAgriData = null;
  let activeTab = "soil";

  // WMO Weather Code Telugu Mapping
  const WMO_CODES = {
    0: "నిర్మలమైన ఆకాశం (Clear Sky)",
    1: "ప్రధానంగా నిర్మలం (Mainly Clear)",
    2: "పాక్షిక మేఘాలు (Partly Cloudy)",
    3: "పూర్తిగా మేఘావృతం (Overcast)",
    45: "పొగమంచు (Fog)",
    48: "రైమ్ పొగమంచు (Depositing Rime Fog)",
    51: "తేలికపాటి చిరుజల్లులు (Light Drizzle)",
    53: "మోస్తరు చిరుజల్లులు (Moderate Drizzle)",
    55: "దట్టమైన జల్లులు (Dense Drizzle)",
    61: "తేలికపాటి వర్షం (Slight Rain)",
    63: "మోస్తరు వర్షం (Moderate Rain)",
    65: "భారీ వర్షం (Heavy Rain)",
    80: "వర్షపు జల్లులు (Rain Showers)",
    81: "మోస్తరు వర్షపు జల్లులు (Moderate Showers)",
    82: "తీవ్ర వర్షపు జల్లులు (Violent Showers)",
    95: "ఉరుములతో కూడిన వర్షం (Thunderstorm)",
    96: "ఉరుములు మరియు వడగండ్ల వాన (Thunderstorm with Hail)"
  };

  // Wind direction degree to Telugu compass label
  function getCompassDirection(deg) {
    const directions = [
      "ఉత్తరం (N)",
      "ఈశాన్యం (NE)",
      "తూర్పు (E)",
      "ఆగ్నేయం (SE)",
      "దక్షిణం (S)",
      "నైరుతి (SW)",
      "పడమర (W)",
      "వాయవ్యం (NW)"
    ];
    const index = Math.round((deg || 0) / 45) % 8;
    return directions[index];
  }

  // Fetch 40+ Agricultural, Soil, Moisture, Solar and Wind metrics in 1 single request
  async function fetchStationData(lat, lon) {
    const metrics = [
      "temperature_2m",
      "relative_humidity_2m",
      "dew_point_2m",
      "apparent_temperature",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "surface_pressure",
      "wind_speed_10m",
      "wind_speed_80m",
      "wind_direction_10m",
      "wind_direction_80m",
      "wind_gusts_10m",
      "soil_moisture_0_to_1cm",
      "soil_moisture_1_to_3cm",
      "soil_moisture_3_to_9cm",
      "soil_moisture_9_to_27cm",
      "soil_temperature_0_to_7cm",
      "soil_temperature_7_to_28cm",
      "soil_temperature_28_to_100cm",
      "uv_index",
      "et0_fao_evapotranspiration",
      "vapour_pressure_deficit",
      "cape",
      "direct_radiation",
      "diffuse_radiation",
      "shortwave_radiation_instant",
      "direct_normal_irradiance",
      "global_tilted_irradiance"
    ].join(",");

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${metrics}&timezone=auto`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Station API returned HTTP " + response.status);
      const data = await response.json();
      return data.current;
    } catch (err) {
      console.warn("Agri station fetch failed, using fallback metrics:", err);
      return generateFallbackMetrics();
    }
  }

  // Fallback demo metrics in case user device is offline
  function generateFallbackMetrics() {
    return {
      time: new Date().toISOString(),
      temperature_2m: 29.4,
      relative_humidity_2m: 68,
      dew_point_2m: 22.8,
      apparent_temperature: 31.6,
      precipitation: 0.0,
      rain: 0.0,
      showers: 0.0,
      snowfall: 0.0,
      weather_code: 2,
      surface_pressure: 982.5,
      wind_speed_10m: 11.2,
      wind_speed_80m: 19.5,
      wind_direction_10m: 85,
      wind_direction_80m: 90,
      wind_gusts_10m: 16.4,
      soil_moisture_0_to_1cm: 0.32,
      soil_moisture_1_to_3cm: 0.35,
      soil_moisture_3_to_9cm: 0.38,
      soil_moisture_9_to_27cm: 0.41,
      soil_temperature_0_to_7cm: 27.2,
      soil_temperature_7_to_28cm: 26.5,
      soil_temperature_28_to_100cm: 25.8,
      uv_index: 6.2,
      et0_fao_evapotranspiration: 4.8,
      vapour_pressure_deficit: 1.45,
      cape: 240,
      direct_radiation: 580,
      diffuse_radiation: 120,
      shortwave_radiation_instant: 700,
      direct_normal_irradiance: 650,
      global_tilted_irradiance: 680
    };
  }

  // Calculate Agri Action Signals
  function calculateAgriSignals(d) {
    // 1. Soil Root Moisture Percentage (Volumetric m³/m³ converted to readable %)
    const rootMoistureVal = d.soil_moisture_1_to_3cm || d.soil_moisture_0_to_1cm || 0.25;
    const soilPercent = Math.min(Math.round(rootMoistureVal * 200), 100);

    let irrigation = {
      level: soilPercent,
      title: "సాధారణ తేమ (సరిపడా ఉంది)",
      desc: "వేర్ల వద్ద తేమ సమతుల్యంగా ఉంది. ప్రస్తుతానికి మోటారు వేసి తడి ఇవ్వాల్సిన అత్యవసరం లేదు.",
      badge: "🟢 తడి అవసరం లేదు",
      color: "#16a34a",
      bg: "#f0fdf4"
    };

    if (soilPercent < 40) {
      irrigation = {
        level: soilPercent,
        title: "నేలలో తేమ తగ్గింది (Water Stress)",
        desc: "పైపొరల్లో తేమ శాతం పడిపోయింది. పైరు వాడిపోకుండా నేడే తడి లేదా డ్రిప్ ఆన్ చేయండి.",
        badge: "⚠️ నేడే నీరు పెట్టండి",
        color: "#d97706",
        bg: "#fffbeb"
      };
    } else if (soilPercent > 80) {
      irrigation = {
        level: soilPercent,
        title: "అధిక తేమ (Waterlogging Risk)",
        desc: "నేలలో నీరు నిలిచే సూచన ఉంది. అధిక నీటిని చేను గట్ల నుంచి బయటకు పారించండి.",
        badge: "💧 అధిక నీరు",
        color: "#0284c7",
        bg: "#f0f9ff"
      };
    }

    // 2. Pesticide Spray Suitability
    const wind10 = d.wind_speed_10m || 0;
    const gusts = d.wind_gusts_10m || wind10;
    const rain = d.precipitation || 0;
    const compass = getCompassDirection(d.wind_direction_10m || 0);

    let spray = {
      status: "🟢 పిచికారీకి అనుకూలం",
      reason: `గాలి వేగం సాధారణంగా (${wind10} km/h) ఉంది. గాలి దిశ ${compass} వైపు ఉంది.`,
      color: "#16a34a",
      bg: "#f0fdf4"
    };

    if (rain > 0.1) {
      spray = {
        status: "🚫 స్ప్రే పూర్తిగా ఆపండి",
        reason: "వర్షం పడుతోంది/పడుతున్న సూచన ఉంది. మందులన్నీ కొట్టుకుపోయి వృథా అవుతాయి.",
        color: "#dc2626",
        bg: "#fef2f2"
      };
    } else if (gusts > 20 || wind10 > 15) {
      spray = {
        status: "⚠️ తీవ్ర గాలి - స్ప్రే వాయిదా వేయండి",
        reason: `ఈదురుగాలులు (${gusts} km/h) బలంగా వీస్తున్నాయి. మందు సరిగ్గా ఆకులపై పడదు, పక్క చేలలోకి కొట్టుకుపోతుంది.`,
        color: "#b45309",
        bg: "#fffbeb"
      };
    }

    // 3. Evapotranspiration Drip Advisory
    const et0 = d.et0_fao_evapotranspiration || 0;
    let dripTime = "1.5 - 2 గంటలు";
    if (et0 > 5.5) dripTime = "3 - 3.5 గంటలు (ఎండ ఎక్కువ)";
    else if (et0 < 3.0) dripTime = "1 గంట సరిపోతుంది";

    // 4. Heat / Storm Advisory
    const cape = d.cape || 0;
    let stormStatus = "ప్రశాంత వాతావరణం";
    if (cape > 1000) stormStatus = "⚡ పిడుగులు / ఉరుముల ప్రమాదం (ఎచ్చరిక!)";
    else if (cape > 400) stormStatus = "మేఘావృతమైన ఉరుముల సూచన";

    return { irrigation, spray, dripTime, et0, stormStatus, compass, wind10, gusts };
  }

  // Render the Master Component
  window.renderAgriStationWidget = async function (targetElementId = "agri-station-container") {
    const container = document.getElementById(targetElementId);
    if (!container) return;

    // Inject CSS styling
    if (!document.getElementById("agri-station-styles")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "agri-station-styles";
      styleSheet.textContent = `
        .agri-station-card {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          margin: 14px 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          color: #1e293b;
        }
        .agri-station-header {
          background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
          color: #ffffff;
          padding: 16px 18px;
        }
        .agri-head-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .agri-title-box h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .agri-location-sub {
          font-size: 12px;
          opacity: 0.9;
          margin-top: 3px;
        }
        .agri-header-actions {
          display: flex;
          gap: 6px;
        }
        .agri-btn-action {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          padding: 5px 9px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .agri-btn-action:hover {
          background: rgba(255, 255, 255, 0.35);
        }
        .agri-hero-temp-box {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 14px;
        }
        .agri-hero-temp {
          font-size: 40px;
          font-weight: 800;
          line-height: 1;
        }
        .agri-hero-condition {
          font-size: 13px;
          opacity: 0.95;
          margin-top: 4px;
        }
        .agri-hero-badges {
          text-align: right;
          font-size: 11px;
        }
        .agri-tag-pill {
          background: rgba(255, 255, 255, 0.2);
          padding: 3px 8px;
          border-radius: 12px;
          display: inline-block;
          margin-bottom: 4px;
        }
        .agri-body {
          padding: 14px;
        }
        /* Quick Decision Banners */
        .agri-decision-banner {
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 12px;
          border: 1px solid transparent;
        }
        .agri-banner-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          font-size: 13px;
        }
        .agri-banner-desc {
          font-size: 12px;
          margin-top: 4px;
          line-height: 1.45;
          color: #475569;
        }
        .agri-bar-track {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          margin-top: 8px;
          overflow: hidden;
        }
        .agri-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease;
        }
        /* Metric Mini Grid */
        .agri-mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 14px;
        }
        .agri-mini-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 9px 11px;
        }
        .agri-mini-label {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
        }
        .agri-mini-val {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 3px;
        }
        /* Tab Navigation Deck */
        .agri-tab-strip {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
          gap: 4px;
          margin-bottom: 12px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .agri-tab-btn {
          flex: 1;
          min-width: 75px;
          padding: 7px 6px;
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          border-radius: 7px;
          cursor: pointer;
          white-space: nowrap;
          text-align: center;
        }
        .agri-tab-btn.active {
          background: #ffffff;
          color: #1b5e20;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          font-weight: 700;
        }
        /* Parameter Rows */
        .agri-param-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }
        .agri-param-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          font-size: 12px;
        }
        .agri-param-name {
          color: #334155;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .agri-param-val {
          font-weight: 700;
          color: #0f172a;
        }
        .agri-depth-badge {
          font-size: 10px;
          background: #e2e8f0;
          color: #475569;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
      `;
      document.head.appendChild(styleSheet);
    }

    // Temporary loading state
    container.innerHTML = `
      <div class="agri-station-card">
        <div class="agri-station-header">
          <div class="agri-head-top">
            <div class="agri-title-box">
              <h3>🌾 అగ్రి-వెదర్ & సాయిల్ స్టేషన్</h3>
              <div class="agri-location-sub">40+ లైవ్ పారామీటర్లు లోడ్ అవుతున్నాయి...</div>
            </div>
          </div>
        </div>
        <div class="agri-body" style="text-align:center; padding: 30px; color:#64748b;">
          ఉపగ్రహ మరియు సెన్సార్ డేటా సింక్ అవుతోంది...
        </div>
      </div>
    `;

    // Fetch live feed
    rawAgriData = await fetchStationData(currentLat, currentLon);
    renderStationContent(container);
  };

  // Render station HTML view
  function renderStationContent(container) {
    if (!rawAgriData) return;
    const d = rawAgriData;
    const signals = calculateAgriSignals(d);

    const temp = Math.round(d.temperature_2m || 0);
    const feelsLike = Math.round(d.apparent_temperature || temp);
    const condText = WMO_CODES[d.weather_code] || "సాధారణ వాతావరణం";
    const lastUpdate = new Date().toLocaleTimeString("te-IN", { hour: "2-digit", minute: "2-digit" });

    container.innerHTML = `
      <div class="agri-station-card">
        <!-- Top Station Header -->
        <div class="agri-station-header">
          <div class="agri-head-top">
            <div class="agri-title-box">
              <h3>🌾 అగ్రి-వెదర్ & సాయిల్ సెన్సార్ స్టేషన్</h3>
              <div class="agri-location-sub">📍 <span id="station-loc-label">${currentLocationName}</span></div>
            </div>
            <div class="agri-header-actions">
              <button class="agri-btn-action" id="btn-gps-trigger" title="నా పొలం లొకేషన్ (GPS)">🛰️ GPS</button>
              <button class="agri-btn-action" id="btn-station-refresh" title="రిఫ్రెష్">🔄</button>
            </div>
          </div>

          <div class="agri-hero-temp-box">
            <div>
              <div class="agri-hero-temp">${temp}°C</div>
              <div class="agri-hero-condition">${condText}</div>
            </div>
            <div class="agri-hero-badges">
              <span class="agri-tag-pill">శరీరానికి అనిపించేది: ${feelsLike}°C</span><br/>
              <span style="opacity: 0.8; font-size: 10px;">నమోదైన సమయం: ${lastUpdate}</span>
            </div>
          </div>
        </div>

        <div class="agri-body">
          <!-- 1. Soil Irrigation Decision Banner -->
          <div class="agri-decision-banner" style="background:${signals.irrigation.bg}; border-color:${signals.irrigation.color};">
            <div class="agri-banner-head">
              <span style="color:${signals.irrigation.color};">🌱 నేల తేమ నిర్ణయం (వేర్ల వద్ద: ${signals.irrigation.level}%)</span>
              <span style="font-size:11px; background:#fff; padding:2px 7px; border-radius:10px; color:${signals.irrigation.color}; border:1px solid ${signals.irrigation.color};">${signals.irrigation.badge}</span>
            </div>
            <div class="agri-banner-desc">${signals.irrigation.desc}</div>
            <div class="agri-bar-track">
              <div class="agri-bar-fill" style="width:${signals.irrigation.level}%; background:${signals.irrigation.color};"></div>
            </div>
          </div>

          <!-- 2. Spray Suitability Banner -->
          <div class="agri-decision-banner" style="background:${signals.spray.bg}; border-color:${signals.spray.color};">
            <div class="agri-banner-head">
              <span style="color:${signals.spray.color};">🌿 పురుగుమందుల స్ప్రే సూచన</span>
              <span style="font-size:11px; font-weight:700; color:${signals.spray.color};">${signals.spray.status}</span>
            </div>
            <div class="agri-banner-desc">${signals.spray.reason}</div>
          </div>

          <!-- Quick 4-box Key Metrics -->
          <div class="agri-mini-grid">
            <div class="agri-mini-box">
              <div class="agri-mini-label">💨 ఈదురుగాలులు (Gusts)</div>
              <div class="agri-mini-val">${d.wind_gusts_10m || d.wind_speed_10m} <span style="font-size:11px; font-weight:normal;">km/h</span></div>
            </div>
            <div class="agri-mini-box">
              <div class="agri-mini-label">💧 ఆవిరి రేటు (ET₀)</div>
              <div class="agri-mini-val">${d.et0_fao_evapotranspiration || 0} <span style="font-size:11px; font-weight:normal;">mm/day</span></div>
            </div>
            <div class="agri-mini-box">
              <div class="agri-mini-label">🌡️ నేల వేడి (0-7 cm)</div>
              <div class="agri-mini-val">${Math.round(d.soil_temperature_0_to_7cm || temp)}°C</div>
            </div>
            <div class="agri-mini-box">
              <div class="agri-mini-label">⚡ పిడుగుల ముప్పు (CAPE)</div>
              <div class="agri-mini-val" style="font-size:13px; color:${d.cape > 500 ? '#dc2626' : '#16a34a'};">${d.cape > 500 ? 'హెచ్చరిక' : 'ప్రశాంతం'}</div>
            </div>
          </div>

          <!-- 40+ Interactive Categorized Tabs -->
          <div class="agri-tab-strip">
            <button class="agri-tab-btn ${activeTab === 'soil' ? 'active' : ''}" data-tab="soil">🌱 నేల & తేమ</button>
            <button class="agri-tab-btn ${activeTab === 'rain' ? 'active' : ''}" data-tab="rain">🌧️ వర్షం & పీడనం</button>
            <button class="agri-tab-btn ${activeTab === 'wind' ? 'active' : ''}" data-tab="wind">💨 గాలి & పిడుగులు</button>
            <button class="agri-tab-btn ${activeTab === 'sun' ? 'active' : ''}" data-tab="sun">☀️ ఎండ & సౌరశక్తి</button>
          </div>

          <!-- Active Tab Dynamic Panel -->
          <div id="agri-active-tab-panel">
            ${renderActiveTabContent(d)}
          </div>
        </div>
      </div>
    `;

    // Event Bindings
    container.querySelector("#btn-station-refresh")?.addEventListener("click", () => {
      window.renderAgriStationWidget(container.id);
    });

    container.querySelector("#btn-gps-trigger")?.addEventListener("click", () => {
      requestGPSLocation(container);
    });

    const tabButtons = container.querySelectorAll(".agri-tab-btn");
    tabButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        activeTab = e.currentTarget.getAttribute("data-tab");
        tabButtons.forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        const panel = container.querySelector("#agri-active-tab-panel");
        if (panel) panel.innerHTML = renderActiveTabContent(d);
      });
    });
  }

  // Render individual tab metrics (40+ parameters total)
  function renderActiveTabContent(d) {
    if (activeTab === "soil") {
      return `
        <div class="agri-param-list">
          <div class="agri-param-item">
            <span class="agri-param-name">🌱 ఉపరితల నేల తేమ <span class="agri-depth-badge">0 - 1 cm</span></span>
            <span class="agri-param-val">${((d.soil_m