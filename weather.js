// weather.js - Pure Dynamic Agri Weather Station with Moon Phase & Live Clock

function getDynamicWindDir(deg) {
  const dirs = [
    "Uttharam (N)", "Eesanyam (NE)", "Thoorpu (E)", "Aagneyam (SE)",
    "Dakshinam (S)", "Nairuthi (SW)", "Padamara (W)", "Vaayuvyam (NW)"
  ];
  return dirs[Math.round(deg / 45) % 8];
}

// Calculate Moon Phase (Amavasya to Pournami & Return)
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

  if (phase < 0.03 || phase > 0.97) return { icon: "🌑", name: "Amavasya (New Moon)" };
  if (phase < 0.22) return { icon: "🌒", name: "Shukla Pradhama - Chandrakala" };
  if (phase < 0.28) return { icon: "🌓", name: "Shukla Ashtami (First Qtr)" };
  if (phase < 0.47) return { icon: "🌔", name: "Shukla Thrayodashi" };
  if (phase < 0.53) return { icon: "🌕", name: "Pournami (Full Moon)" };
  if (phase < 0.72) return { icon: "🌖", name: "Krishna Thrayodashi" };
  if (phase < 0.78) return { icon: "🌗", name: "Krishna Ashtami (Last Qtr)" };
  return { icon: "🌘", name: "Krishna Chathurdashi - Amavasya Daggarlo" };
}

function parseDynamicWMO(code, isDay) {
  const wmoMap = {
    0: { text: isDay ? "Nirmalamaina Enda" : "Nirmalamaina Rathri", icon: isDay ? "☀️" : "🌙" },
    1: { text: "Thelikapaati Meaghalu", icon: isDay ? "🌤️" : "☁️" },
    2: { text: "Madhyastha Meaghalu", icon: isDay ? "⛅" : "☁️" },
    3: { text: "Mabbulu Kaminayi (Overcast)", icon: "☁️" },
    45: { text: "Pogamanchu (Fog)", icon: "🌫️" },
    48: { text: "Challani Manchu", icon: "🌫️" },
    51: { text: "Thelikapaati Chirujallulu", icon: "🌦️" },
    53: { text: "Madhyastha Drizzle", icon: "🌦️" },
    55: { text: "Bhaari Chirujallulu", icon: "🌧️" },
    61: { text: "Thelikapaati Varsham", icon: "🌧️" },
    63: { text: "Varsham Paduthondi", icon: "🌧️" },
    65: { text: "Bhaari Varsham", icon: "🌧️" },
    80: { text: "Varshapu Jallulu", icon: "🌦️" },
    81: { text: "Theevra Varshapu Jallulu", icon: "🌧️" },
    82: { text: "Bhaari Varshapu Tufaanu", icon: "⛈️" },
    95: { text: "Urumulu Merupulatho Varsham", icon: "⛈️" }
  };
  return wmoMap[code] || { text: "Saadharana Vaathavaranam", icon: isDay ? "🌤️" : "🌙" };
}

// Mobile GPS Location Promise
function getRealPhoneGPS() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Mee mobile lo GPS support ledu."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new Error("Phone lo Location (GPS) access on cheyandi.")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// Pure Dynamic Reverse Geocoding: Returns Exact Village / Mandal & District
async function fetchRealVillageAndDistrict(lat, lon) {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=te`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const village = data.locality || data.village || data.town || data.city || data.localityInfo?.administrative?.[3]?.name || "";
    const district = data.countrySubdivisionName || data.principalSubdivision || "";
    if (village && district) {
      return `📍 ${village}, ${district} (Live GPS)`;
    } else if (village || district) {
      return `📍 ${village || district} (Live GPS)`;
    }
    return `📍 Gurtimpu Jarigina Prantham (Live GPS)`;
  } catch (e) {
    return `📍 Live GPS Coords: ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
  }
}

window.renderWeatherWidget = async function() {
  const container = document.getElementById("weather-container");
  if (!container) return;

  const refreshBtn = document.getElementById("weather-refresh-btn");
  if (refreshBtn) {
    refreshBtn.classList.add("btn-refresh-active");
    refreshBtn.innerHTML = "⏳ Load Avthondi...";
  }

  try {
    const loc = await getRealPhoneGPS();
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
      fetchRealVillageAndDistrict(lat, lon)
    ]);

    if (!weatherRes.ok) throw new Error("API nundi data load avvaledu.");
    const data = await weatherRes.json();

    const c = data.current;
    const d = data.daily;
    const isDay = c.is_day === 1;

    // Time & Moon details
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
    let sprayDesc = `గాలి అదుపులో ఉంది (${windSpeed} km/h). దిశ: <strong>${windDir}</strong>. పిచికారీ పనులకు మంచి సమయం.`;

    if (Number(currentRainRate) > 0 || c.weather_code >= 51 || rainProb >= 60) {
      alertClass = "advisory-danger";
      sprayTitle = "రైతు సలహా: మందులు స్ప్రే చేయవద్దు!";
      sprayDesc = `వర్షం పడే అవకాశం ఉంది (${rainProb}% - ${currentRainRate} mm). మందుల పిచికారీ వెంటనే ఆపండి.`;
    } else if (Number(windSpeed) > 18 || Number(windGusts) > 25) {
      alertClass = "advisory-warning";
      sprayTitle = "రైతు సలహా: స్ప్రే కాసేపు ఆపండి!";
      sprayDesc = `ఈదురుగాలులు అధికంగా ఉన్నాయి (${windGusts} km/h). మందు పక్కకు వెళ్లిపోయే ప్రమాదం ఉంది.`;
    }

    let soilBadge = "";
    if (sMoistRoot >= 60) {
      soilBadge = `<span class="badge badge-success">💧 తడి బాగుంది</span>`;
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
      <div class="weather-card ${isDay ? 'weather-day' : 'weather-night'}">
        
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
              <span class="moon-phase-badge" title="${moon.name}">${moon.icon} ${moon.name}</span>
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
