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

// Micro-Precise Reverse Geocoding (Direct Colony -> Sub-locality -> Mandal/District)
async function fetchAccurateAreaName(lat, lon) {
  try {
    // 1. OpenStreetMap Reverse Search (Zoom level 17 - Colony/Locality precision)
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=17&format=json&addressdetails=1&accept-language=te,en`);
    if (res.ok) {
      const d = await res.json();
      const a = d.address || {};

      // కాలనీ, సబర్బ్, రెసిడెన్షియల్ లేదా లోకల్ ఏరియా
      const colony = a.neighbourhood || a.suburb || a.residential || a.quarter || a.hamlet || "";
      // గ్రామం లేదా పట్టణం
      const locality = a.village || a.town || a.city || a.municipality || "";
      // మండలం లేదా జిల్లా
      const district = a.county || a.state_district || a.district || "";

      let parts = [];
      if (colony) parts.push(colony);
      if (locality && !parts.some(p => p.toLowerCase() === locality.toLowerCase())) parts.push(locality);
      if (district && !parts.some(p => p.toLowerCase() === district.toLowerCase())) parts.push(district);

      if (parts.length > 0) {
        return `📍 ${parts.join(", ")} (లైవ్ GPS)`;
      }
    }
  } catch (e1) {
    // network fallback
  }

  // 2. క్లీన్ ఫాల్‌బ్యాక్
  try {
    const res2 = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`);
    if (res2.ok) {
      const data2 = await res2.json();
      const p = data2.features?.[0]?.properties || {};
      
      const loc = p.district || p.locality || p.village || p.town || p.city || "";
      const dist = p.county || p.state || "";

      let parts = [];
      if (loc) parts.push(loc);
      if (dist && !parts.includes(dist)) parts.push(dist);

      if (parts.length > 0) return `📍 ${parts.join(", ")} (లైవ్ GPS)`;
    }
  } catch (e2) {}

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
