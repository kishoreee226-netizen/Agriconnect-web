// weather.js - Micro-Accurate GPS, Dynamic Moon Badge & Night/Day Themes

function getDynamicWindDir(deg) {
  const dirs = [
    "ఉత్తరం (N)", "ఈశాన్యం (NE)", "తూర్పు (E)", "ఆగ్నేయం (SE)",
    "దక్షిణం (S)", "నైరుతి (SW)", "పడమర (W)", "వాయవ్యం (NW)"
  ];
  return dirs[Math.round(deg / 45) % 8];
}

// Moon Phase Calculator
function getDynamicMoonPhase(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 3) {
    year--;
    month += 12;
  }
  let a = Math.floor(year / 100);
  let b = Math.floor(a / 4);
  let c = 2 - a + b;
  let e = Math.floor(365.25 * (year + 4716));
  let f = Math.floor(30.6001 * (month + 1));
  let jd = c + day + e + f - 1524.5;
  let cycles = (jd - 2451549.5) / 29.53058770576;
  let phase = cycles - Math.floor(cycles);

  if (phase < 0.03 || phase > 0.97) return { icon: "🌑", name: "అమావాస్య" };
  if (phase < 0.22) return { icon: "🌒", name: "శుక్ల పాడ్యమి / చంద్రకళ" };
  if (phase < 0.28) return { icon: "🌓", name: "శుక్ల అష్టమి" };
  if (phase < 0.47) return { icon: "🌔", name: "శుక్ల త్రయోదశి" };
  if (phase < 0.53) return { icon: "🌕", name: "పౌర్ణమి" };
  if (phase < 0.72) return { icon: "🌖", name: "కృష్ణ త్రయోదశి" };
  if (phase < 0.78) return { icon: "🌗", name: "కృష్ణ అష్టమి" };
  return { icon: "🌘", name: "కృష్ణ చతుర్దశి" };
}

function parseDynamicWMO(code, isDay) {
  const wmoMap = {
    0: { text: isDay ? "నిర్మలమైన ఎండ" : "నిర్మలమైన రాత్రి", icon: isDay ? "☀️" : "🌙" },
    1: { text: "తేలికపాటి మేఘాలు", icon: isDay ? "🌤️" : "☁️" },
    2: { text: "మబ్బులతో కూడిన ఎండ", icon: isDay ? "⛅" : "☁️" },
    3: { text: "పూర్తిగా మబ్బులు (Overcast)", icon: "☁️" },
    45: { text: "పొగమంచు (Fog)", icon: "🌫️" },
    48: { text: "చల్లని మంచు", icon: "🌫️" },
    51: { text: "తేలికపాటి చిరుజల్లులు", icon: "🌦️" },
    53: { text: "మధ్యస్థ చిరుజల్లులు", icon: "🌦️" },
    55: { text: "భారీ చిరుజల్లులు", icon: "🌧️" },
    61: { text: "తేలికపాటి వర్షం", icon: "🌧️" },
    63: { text: "వర్షం పడుతోంది", icon: "🌧️" },
    65: { text: "భారీ వర్షం", icon: "🌧️" },
    80: { text: "వర్షపు జల్లులు", icon: "🌦️" },
    81: { text: "తీవ్రమైన జల్లులు", icon: "🌧️" },
    82: { text: "భారీ వర్షపు తుఫాను", icon: "⛈️" },
    95: { text: "ఉరుములు, మెరుపులతో వర్షం", icon: "⛈️" }
  };
  return wmoMap[code] || { text: "సాధారణ వాతావరణం", icon: isDay ? "🌤️" : "🌙" };
}

// High Accuracy GPS Pinpointer
function getAccuratePhoneGPS() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("మొబైల్‌లో GPS సదుపాయం లేదు."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new Error("మొబైల్ లొకేషన్ (GPS) ఆన్ చేసి పర్మిషన్ ఇవ్వండి.")),
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
    );
  });
}

// Exact Micro-Location Parser (Extracts Colony / Street directly from Live GPS)
async function fetchAccurateAreaName(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=te,en`;
    const res = await fetch(url);
    if (res.ok) {
      const d = await res.json();
      
      // Nominatim ఇచ్చే పూర్తి చిరునామా నుండి భాగాలు
      const fullDisplay = d.display_name || "";
      const rawParts = fullDisplay.split(",").map(s => s.trim()).filter(Boolean);

      // చిరునామాలోని మొదటి 1-2 పదాలే కాలనీ / వీధి / గ్రామం అవుతాయి
      let cleanParts = [];
      for (const part of rawParts) {
        const lower = part.toLowerCase();
        // పిన్‌కోడ్, దేశం, రాష్ట్రం, బేసిన్ లాంటివి తీసివేయడం
        if (
          !/^\d{5,6}$/.test(part) &&
          !lower.includes("india") &&
          !lower.includes("తెలంగాణ") &&
          !lower.includes("telangana") &&
          !lower.includes("basin")
        ) {
          // ఒకే పదం మళ్లీ రాకుండా చూసుకోవడం
          if (!cleanParts.some(cp => cp.toLowerCase() === lower)) {
            cleanParts.push(part);
          }
        }
        if (cleanParts.length >= 3) break; // కేవలం కాలనీ, ఊరు, జిల్లా సరిపోతాయి
      }

      if (cleanParts.length > 0) {
        return `📍 ${cleanParts.join(", ")} (లైవ్ GPS)`;
      }
    }
  } catch (err) {
    // network issue
  }

  return `📍 GPS: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E (లైవ్ GPS)`;
}

window.renderWeatherWidget = async function() {
  const container = document.getElementById("weather-container");
  if (!container) return;

  const refreshBtn = document.getElementById("weather-refresh-btn");
  if (refreshBtn) {
    refreshBtn.classList.add("btn-refresh-active");
    refreshBtn.innerHTML = "⏳ లోడ్ అవుతోంది...";
  }

  try {
    const loc = await getAccuratePhoneGPS();
    const lat = loc.lat;
    const lon = loc.lon;

    const currentVars = [
      "temperature_2m",
      "relative_humidity_2m",
      "is_day",
      "precipitation",
      "rain",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "soil_moisture_0_to_1cm",
      "soil_moisture_3_to_9cm",
      "soil_moisture_9_to_27cm",
      "soil_temperature_0_to_7cm",
      "uv_index",
      "dew_point_2m",
      "et0_fao_evapotranspiration",
      "vapour_pressure_deficit",
      "shortwave_radiation_instant"
    ].join(",");

    const dailyVars = [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max"
    ].join(",");

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${currentVars}&daily=${dailyVars}&timezone=auto`;

    const [weatherRes, placeDisplay] = await Promise.all([
      fetch(apiUrl),
      fetchAccurateAreaName(lat, lon)
    ]);

    if (!weatherRes.ok) throw new Error("సర్వర్ నుంచి వాతావరణ సమాచారం రాలేదు.");
    const data = await weatherRes.json();

    const c = data.current;
    const d = data.daily;
    const isDay = c.is_day === 1;

    // Digital Time
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const liveClock = `${formattedHours}:${minutes} ${ampm}`;

    const moon = getDynamicMoonPhase(now);
    const weatherCond = parseDynamicWMO(c.weather_code, isDay);
    const temp = Math.round(c.temperature_2m);
    const humidity = Math.round(c.relative_humidity_2m);
    const windSpeed = Number(c.wind_speed_10m || 0).toFixed(1);
    const windGusts = Number(c.wind_gusts_10m || c.wind_speed_10m || 0).toFixed(1);
    const windDir = getDynamicWindDir(c.wind_direction_10m || 0);

    const sMoistTop = Math.min(Math.round((c.soil_moisture_0_to_1cm || 0) * 200), 100);
    const sMoistRoot = Math.min(Math.round((c.soil_moisture_3_to_9cm || 0) * 200), 100);
    const sMoistSub = Math.min(Math.round((c.soil_moisture_9_to_27cm || 0) * 200), 100);

    const soilTemp = Math.round(c.soil_temperature_0_to_7cm != null ? c.soil_temperature_0_to_7cm : temp);
    const et0 = c.et0_fao_evapotranspiration != null ? Number(c.et0_fao_evapotranspiration).toFixed(1) : "0.0";
    const vpd = c.vapour_pressure_deficit != null ? Number(c.vapour_pressure_deficit).toFixed(2) : "0.00";
    const solarPow = Math.round(c.shortwave_radiation_instant || 0);
    const rainProb = (d && d.precipitation_probability_max) ? d.precipitation_probability_max[0] : 0;
    const currentRainRate = Number(c.precipitation || c.rain || 0).toFixed(1);

    // Dynamic Advisory
    let alertClass = "advisory-safe";
    let sprayTitle = "రైతు సలహా: మందుల స్ప్రేకి అనుకూలం";
    let sprayDesc = `గాలి సాధారణంగా ఉంది (${windSpeed} km/h). దిశ: <strong>${windDir}</strong>. పిచికారీ పనులకు అనువైన సమయం.`;

    if (Number(currentRainRate) > 0 || c.weather_code >= 51 || rainProb >= 60) {
      alertClass = "advisory-danger";
      sprayTitle = "రైతు సలహా: మందులు స్ప్రే చేయవద్దు!";
      sprayDesc = `వర్షం పడే అవకాశం ఉంది (${rainProb}% - ${currentRainRate} mm). పిచికారీ వెంటనే ఆపండి.`;
    } else if (Number(windSpeed) > 18 || Number(windGusts) > 25) {
      alertClass = "advisory-warning";
      sprayTitle = "రైతు సలహా: స్ప్రే కాసేపు ఆపండి!";
      sprayDesc = `ఈదురుగాలులు అధికంగా ఉన్నాయి (${windGusts} km/h). మందు పక్కకు వెళ్లిపోతుంది.`;
    }

    let soilBadge = "";
    if (sMoistRoot >= 60) {
      soilBadge = `<span class="badge badge-success">💧 తడి పుష్కలం</span>`;
    } else if (sMoistRoot >= 35) {
      soilBadge = `<span class="badge badge-neutral">🌱 తేమ సాధారణం</span>`;
    } else {
      soilBadge = `<span class="badge badge-danger">⚠️ నేల ఆరిపోయింది</span>`;
    }

    const uvDesc = (c.uv_index || 0) >= 8 ? "చాలా ఎక్కువ" : ((c.uv_index || 0) >= 5 ? "మధ్యస్థం" : "తక్కువ");

    // 4 Days Forecast
    const teluguDays = ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"];
    let forecastHtml = "";
    if (d && d.time) {
      for (let i = 1; i <= 4; i++) {
        if (!d.time[i]) break;
        const targetDate = new Date(d.time[i]);
        const dayTitle = i === 1 ? "రేపు" : (i === 2 ? "ఎల్లుండి" : teluguDays[targetDate.getDay()]);
        const maxT = Math.round(d.temperature_2m_max[i] != null ? d.temperature_2m_max[i] : temp);
        const minT = Math.round(d.temperature_2m_min[i] != null ? d.temperature_2m_min[i] : (temp - 5));
        const pMax = d.precipitation_probability_max[i] || 0;
        const dayWmo = parseDynamicWMO(d.weather_code[i] || 0, true);

        forecastHtml += `
          <div class="forecast-day-card">
            <div class="forecast-day-title">${dayTitle}</div>
            <div class="forecast-day-icon">${dayWmo.icon}</div>
            <div class="forecast-day-temp">${maxT}° / ${minT}°</div>
            <div class="forecast-day-rain">💧 ${pMax}%</div>
          </div>
        `;
      }
    }

    container.innerHTML = `
      <div class="weather-card ${isDay ? 'weather-day-theme' : 'weather-night-theme'}">
        
        <div class="weather-header">
          <div class="weather-title">
            <span>🌦️</span> లైవ్ వాతావరణం & సాగు సలహా
          </div>
          <button id="weather-refresh-btn" onclick="window.renderWeatherWidget()" class="btn-refresh">
            🔄 రీఫ్రెష్
          </button>
        </div>

        <div class="weather-main-row">
          <div class="weather-temp-block">
            <div class="temp-clock-row">
              <span class="weather-temp-val">${temp}°C</span>
              <span class="weather-digital-clock">🕒 ${liveClock}</span>
            </div>
            <div class="weather-status-sub">${weatherCond.text}</div>
            <div class="weather-icons-combo">
              <span class="main-wmo-icon">${weatherCond.icon}</span>
              <div class="moon-phase-badge">
                <span>${moon.icon}</span>
                <span>${moon.name}</span>
              </div>
            </div>
          </div>
          <div class="weather-stats-list">
            <div>💨 గాలి వేగం: <strong>${windSpeed} km/h</strong></div>
            <div>🧭 గాలి దిశ: <strong>${windDir}</strong></div>
            <div>💧 గాలిలో తేమ: <strong>${humidity}%</strong></div>
            <div>🌧️ వర్ష సూచన: <strong>${rainProb}% (${currentRainRate} mm)</strong></div>
            <div>☀️ UV ఇండెక్స్: <strong>${c.uv_index || 0} (${uvDesc})</strong></div>
          </div>
        </div>

        <div class="advisory-box ${alertClass}">
          <div class="advisory-heading">💡 ${sprayTitle}</div>
          <div class="advisory-text">${sprayDesc}</div>
        </div>

        <div class="forecast-section">
          <div class="forecast-header">📅 రాబోయే 4 రోజుల అంచనా:</div>
          <div class="forecast-row">
            ${forecastHtml}
          </div>
        </div>

                <details class="agri-drawer">
          <summary class="agri-drawer-summary">
            <span>🌱 ప్రత్యేక నేల తేమ & వ్యవసాయ వివరాలు</span>
            <span class="drawer-arrow">వివరాలు ▼</span>
          </summary>
          
          <!-- ప్రస్తుత లైవ్ GPS 8 కార్డ్స్ (ఇవి మారవు) -->
          <div class="agri-drawer-grid">
            <div class="agri-metric-tile">
              <div class="agri-metric-label">పైనేల తేమ (0-1 cm)</div>
              <div class="agri-metric-value text-blue">${sMoistTop}%</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">వేర్ల వద్ద తేమ (3-9 cm)</div>
              <div class="agri-metric-value text-blue">${sMoistRoot}% ${soilBadge}</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">లోతు నేల తేమ (9-27 cm)</div>
              <div class="agri-metric-value text-blue">${sMoistSub}%</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">నేల ఉష్ణోగ్రత</div>
              <div class="agri-metric-value text-orange">${soilTemp}°C</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">నీటి ఆవిరి (ET₀)</div>
              <div class="agri-metric-value text-green">${et0} mm/రోజు</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">సౌరశక్తి (Solar Power)</div>
              <div class="agri-metric-value text-orange">${solarPow} W/m²</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">ఆకుల ఒత్తిడి (VPD)</div>
              <div class="agri-metric-value text-green">${vpd} kPa</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">ఈదురుగాలులు (Gusts)</div>
              <div class="agri-metric-value text-dark">${windGusts} km/h</div>
            </div>
          </div>

          <!-- కొత్త ఫీచర్: పొలాన్ని మ్యాప్‌లో ఎంచుకునే బటన్ -->
          <div style="margin-top: 15px; padding: 12px; background: #f0fdf4; border: 1.5px dashed #86efac; border-radius: 12px; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #166534; font-weight: 600;">
              🌾 మీరు మీ వ్యవసాయ భూమి వద్ద లేరా?
            </p>
            <button 
              type="button" 
              onclick="openFarmMapModal()" 
              style="background: #2e7d32; color: #ffffff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: bold; cursor: pointer;">
              📍 మ్యాప్‌లో పొలాన్ని ఎంచుకోండి
            </button>
          </div>

          <!-- ఎంచుకున్న పొలం తాలూకు 8 కార్డ్స్ (మ్యాప్‌లో పిన్ పెట్టినప్పుడు మాత్రమే కింద కనిపిస్తాయి) -->
          <div id="selectedFarmReportSection" style="display: none; margin-top: 15px; padding-top: 12px; border-top: 1px solid #bbf7d0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div>
                <span style="font-size: 13px; font-weight: bold; color: #15803d;">🌾 ఎంచుకున్న పొలం నివేదిక</span>
                <div id="selectedFarmLocationName" style="font-size: 11px; color: #4b5563; margin-top: 2px;"></div>
              </div>
              <button 
                type="button" 
                onclick="clearSelectedFarm()" 
                style="background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; border-radius: 6px; padding: 3px 8px; font-size: 11px; cursor: pointer;">
                ✖ తీసివేయి
              </button>
            </div>

            <div class="agri-drawer-grid">
              <div class="agri-metric-tile">
                <div class="agri-metric-label">పైనేల తేమ (0-1 cm)</div>
                <div id="farm_soil_0_1" class="agri-metric-value text-blue">--</div>
              </div>
              <div class="agri-metric-tile">
                <div class="agri-metric-label">వేర్ల వద్ద తేమ (3-9 cm)</div>
                <div id="farm_soil_3_9" class="agri-metric-value text-blue">--</div>
                <div id="farm_soil_status" style="font-size: 10px; color: #15803d; font-weight: bold; margin-top: 2px;">--</div>
              </div>
              <div class="agri-metric-tile">
                <div class="agri-metric-label">లోతు నేల తేమ (9-27 cm)</div>
                <div id="farm_soil_9_27" class="agri-metric-value text-blue">--</div>
              </div>
              <div class="agri-metric-tile">
                <div class="agri-metric-label">నేల ఉష్ణోగ్రత</div>
                <div id="farm_soil_temp" class="agri-metric-value text-orange">--</div>
              </div>
              <div class="agri-metric-tile">
                <div class="agri-metric-label">నీటి ఆవిరి (ET₀)</div>
                <div id="farm_et0" class="agri-metric-value text-green">--</div>
              </div>
              <div class="agri-metric-tile">
                <div class="agri-metric-label">సౌరశక్తి (Solar Power)</div>
                <div id="farm_solar" class="agri-metric-value text-orange">--</div>
              </div>
              <div class="agri-metric-tile">
                <div class="agri-metric-label">ఆకుల ఒత్తిడి (VPD)</div>
                <div id="farm_vpd" class="agri-metric-value text-green">--</div>
              </div>
              <div class="agri-metric-tile">
                <div class="agri-metric-label">ఈదురుగాలులు (Gusts)</div>
                <div id="farm_gusts" class="agri-metric-value text-dark">--</div>
              </div>
            </div>
          </div>

        </details>

        <div class="weather-footer">
          ${placeDisplay}
        </div>

      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div style="background:#ffffff; border-radius:18px; padding:20px; text-align:center; border:1px solid #fee2e2; max-width:480px; margin:12px auto;">
        <div style="font-size:13px; color:#ef4444; font-weight:700;">⚠️ ${err.message}</div>
        <div style="font-size:11px; color:#64748b; margin-top:4px;">ఫోన్ GPS పర్మిషన్ ఆన్ చేసి రీఫ్రెష్ చేయండి.</div>
        <button onclick="window.renderWeatherWidget()" class="btn-refresh" style="margin-top:10px;">🔄 మళ్లీ ప్రయత్నించండి</button>
      </div>
    `;
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.renderWeatherWidget);
} else {
  window.renderWeatherWidget();
}
// ==================== FARM PIN MAP & DETAILS LOGIC ==================== //
let farmMap = null;
let farmMarker = null;
let selectedFarmLat = null;
let selectedFarmLon = null;

// మ్యాప్ మోడల్ పాపప్‌ను డైనమిక్‌గా క్రియేట్ చేసే ఫంక్షన్
function ensureFarmModalExists() {
  if (document.getElementById("farmMapModal")) return;

  const modalHtml = `
    <div id="farmMapModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 99999; justify-content: center; align-items: center; padding: 15px;">
      <div style="background: #ffffff; width: 100%; max-width: 460px; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
        
        <!-- మోడల్ హెడర్ -->
        <div style="background: #2e7d32; color: #ffffff; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; font-size: 14px;">📍 మీ పొలాన్ని ఎంచుకోండి</span>
          <span onclick="closeFarmMapModal()" style="font-size: 24px; cursor: pointer; line-height: 1; font-weight: bold;">&times;</span>
        </div>

        <!-- ఊరి పేరు వెతికే సెర్చ్ బాక్స్ -->
        <div style="padding: 10px; display: flex; gap: 6px; background: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
          <input 
            type="text" 
            id="modalVillageInput" 
            placeholder="ఊరు / మండలం పేరు టైప్ చేయండి..." 
            style="flex: 1; padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 13px; outline: none;"
          />
          <button 
            type="button" 
            onclick="searchVillageOnMap()" 
            style="background: #2e7d32; color: #fff; border: none; border-radius: 6px; padding: 0 14px; font-size: 13px; font-weight: bold; cursor: pointer;">
            వెతుకు
          </button>
        </div>

        <div style="padding: 6px 12px; font-size: 11px; color: #166534; background: #e8f5e9;">
          💡 మ్యాప్‌లో మీ పొలం ఉన్న చోట వేలితో ట్యాప్ చేస్తే పిన్ పడుతుంది.
        </div>

        <!-- మ్యాప్ కంటైనర్ -->
        <div id="leafletMapContainer" style="height: 300px; width: 100%; background: #eaeaea;"></div>

        <!-- మోడల్ ఫుటర్ -->
        <div style="padding: 12px; background: #fafafa; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
          <span id="selectedPinNotice" style="font-size: 12px; color: #c62828; font-weight: bold;">పొలాన్ని ట్యాప్ చేయండి</span>
          <button 
            id="confirmFarmPinBtn" 
            type="button" 
            disabled 
            onclick="applySelectedFarmLocation()" 
            style="background: #9e9e9e; color: #fff; border: none; border-radius: 6px; padding: 8px 14px; font-size: 13px; font-weight: bold; cursor: not-allowed;">
            ఈ పొలం వివరాలు చూపించు
          </button>
        </div>

      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

// 1. మ్యాప్ మోడల్ ఓపెన్ చేయడం
window.openFarmMapModal = function() {
  ensureFarmModalExists();

  const modal = document.getElementById("farmMapModal");
  if (!modal) return;
  modal.style.display = "flex";

  setTimeout(() => {
    if (!farmMap) {
      // తెలంగాణ సెంటర్ లేదా ప్రస్తుత లొకేషన్ డీఫాల్ట్‌గా వస్తుంది
      const initialLat = 17.9689;
      const initialLon = 79.5941;

      farmMap = L.map("leafletMapContainer").setView([initialLat, initialLon], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(farmMap);

      farmMap.on("click", function(e) {
        setFarmPin(e.latlng.lat, e.latlng.lng);
      });
    } else {
      farmMap.invalidateSize();
    }
  }, 250);
};

// 2. పిన్ మార్కర్ సెట్ చేయడం
function setFarmPin(lat, lon) {
  selectedFarmLat = lat;
  selectedFarmLon = lon;

  if (farmMarker) {
    farmMarker.setLatLng([lat, lon]);
  } else {
    farmMarker = L.marker([lat, lon]).addTo(farmMap);
  }

  const notice = document.getElementById("selectedPinNotice");
  const confirmBtn = document.getElementById("confirmFarmPinBtn");

  if (notice) {
    notice.innerText = `పిన్ ఎంచుకున్నారు (${lat.toFixed(3)}, ${lon.toFixed(3)})`;
    notice.style.color = "#2e7d32";
  }

  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.style.background = "#2e7d32";
    confirmBtn.style.cursor = "pointer";
  }
}

// 3. ఊరి పేరు ద్వారా వెతకడం
window.searchVillageOnMap = async function() {
  const input = document.getElementById("modalVillageInput");
  const query = input ? input.value.trim() : "";
  if (!query) {
    alert("దయచేసి గ్రామం లేదా మండలం పేరు నమోదు చేయండి.");
    return;
  }

  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=te&format=json`);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const place = data.results[0];
      farmMap.setView([place.latitude, place.longitude], 14);
      setFarmPin(place.latitude, place.longitude);
    } else {
      alert("ఆ ప్రాంతం వివరాలు లభించలేదు. దయచేసి సరైన పేరు నమోదు చేయండి.");
    }
  } catch (err) {
    alert("నెట్‌వర్క్ సమస్య ఏర్పడింది.");
  }
};

// 4. మోడల్ క్లోజ్ చేయడం
window.closeFarmMapModal = function() {
  const modal = document.getElementById("farmMapModal");
  if (modal) modal.style.display = "none";
};

// 5. పిన్ వివరాల ఆధారంగా డేటాను తెచ్చి కొత్త 8 కార్డ్స్‌లో చూపించడం
window.applySelectedFarmLocation = async function() {
  if (!selectedFarmLat || !selectedFarmLon) return;

  closeFarmMapModal();

  const section = document.getElementById("selectedFarmReportSection");
  if (section) section.style.display = "block";

  fetchAreaNameForFarm(selectedFarmLat, selectedFarmLon);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedFarmLat}&longitude=${selectedFarmLon}&current=soil_temperature_0cm,wind_gusts_10m&hourly=soil_temperature_0cm,soil_moisture_0_to_1cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,et0_fao_evapotranspiration,vapour_pressure_deficit&daily=shortwave_radiation_sum&timezone=auto`;
    const res = await fetch(url);
    const d = await res.json();

    if (d && d.hourly) {
      const h = d.hourly;
      const idx = 0;

      const sm0_1 = h.soil_moisture_0_to_1cm ? Math.round(h.soil_moisture_0_to_1cm[idx] * 100) : "--";
      const sm3_9 = h.soil_moisture_3_to_9cm ? Math.round(h.soil_moisture_3_to_9cm[idx] * 100) : "--";
      const sm9_27 = h.soil_moisture_9_to_27cm ? Math.round(h.soil_moisture_9_to_27cm[idx] * 100) : "--";
      const sTemp = d.current && d.current.soil_temperature_0cm ? Math.round(d.current.soil_temperature_0cm) : "--";
      const et0 = h.et0_fao_evapotranspiration ? h.et0_fao_evapotranspiration[idx].toFixed(1) : "--";
      const vpd = h.vapour_pressure_deficit ? h.vapour_pressure_deficit[idx].toFixed(2) : "--";
      const gusts = d.current && d.current.wind_gusts_10m ? Math.round(d.current.wind_gusts_10m) : "--";
      const solar = d.daily && d.daily.shortwave_radiation_sum ? Math.round(d.daily.shortwave_radiation_sum[0] / 3.6) : "410";

      document.getElementById("farm_soil_0_1").innerText = `${sm0_1}%`;
      document.getElementById("farm_soil_3_9").innerText = `${sm3_9}%`;
      document.getElementById("farm_soil_9_27").innerText = `${sm9_27}%`;
      document.getElementById("farm_soil_temp").innerText = `${sTemp}°C`;
      document.getElementById("farm_et0").innerText = `${et0} mm/రోజు`;
      document.getElementById("farm_vpd").innerText = `${vpd} kPa`;
      document.getElementById("farm_gusts").innerText = `${gusts} km/h`;
      document.getElementById("farm_solar").innerText = `${solar} W/m²`;

      const statusElem = document.getElementById("farm_soil_status");
      if (statusElem) {
        if (sm3_9 >= 60) statusElem.innerText = "💧 తడి పుష్కలం";
        else if (sm3_9 >= 35) statusElem.innerText = "🌱 సాగుకు అనుకూలం";
        else statusElem.innerText = "⚠️ నీరు అవసరం";
      }
    }
  } catch (err) {
    console.error("Farm soil fetch error:", err);
  }
};

// 6. పిన్ పెట్టిన ఊరు లేదా ప్రాంతం పేరును కనుగొనడం
async function fetchAreaNameForFarm(lat, lon) {
  const lbl = document.getElementById("selectedFarmLocationName");
  if (lbl) lbl.innerText = `లొకేషన్: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E సమాచారం లోడ్ అవుతోంది...`;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=te,en`);
    if (res.ok) {
      const d = await res.json();
      const a = d.address || {};
      const v = a.village || a.suburb || a.hamlet || "";
      const m = a.county || a.town || a.city || "";
      const dist = a.state_district || a.district || "";
      const nameParts = [v, m, dist].filter(Boolean);
      if (lbl && nameParts.length > 0) {
        lbl.innerText = `📍 ${nameParts.join(", ")}`;
      }
    }
  } catch (e) {}
}

// 7. ఎంచుకున్న పొలం నివేదికను తీసివేయడం
window.clearSelectedFarm = function() {
  const section = document.getElementById("selectedFarmReportSection");
  if (section) section.style.display = "none";
  selectedFarmLat = null;
  selectedFarmLon = null;
  if (farmMarker && farmMap) {
    farmMap.removeLayer(farmMarker);
    farmMarker = null;
  }
};

