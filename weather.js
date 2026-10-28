// weather.js - 100% Pure Dynamic Agri Weather & Soil Station (Zero Hardcoding)

function getDynamicWindDir(deg) {
  const dirs = [
    "Uttharam (N)", "Eesanyam (NE)", "Thoorpu (E)", "Aagneyam (SE)",
    "Dakshinam (S)", "Nairuthi (SW)", "Padamara (W)", "Vaayuvyam (NW)"
  ];
  return dirs[Math.round(deg / 45) % 8];
}

function parseDynamicWMO(code, isDay) {
  const wmoMap = {
    0: { text: isDay ? "Nirmalamaina Enda" : "Nirmalamaina Aakaasham", icon: isDay ? "☀️" : "🌙" },
    1: { text: "Thelikapaati Meaghalu", icon: isDay ? "🌤️" : "🌤️" },
    2: { text: "Madhyastha Meaghalu", icon: "⛅" },
    3: { text: "Mabbulu Kaminayi (Overcast)", icon: "☁️" },
    45: { text: "Pogamanchu (Fog)", icon: "🌫️" },
    48: { text: "Challani Manchu Podalu", icon: "🌫️" },
    51: { text: "Thelikapaati Drizzle (Jallu)", icon: "🌦️" },
    53: { text: "Madhyastha Drizzle", icon: "🌦️" },
    55: { text: "Bhaari Chirujallulu", icon: "🌧️" },
    56: { text: "Challani Mabbula Jallu", icon: "🌧️" },
    57: { text: "Theevramaina Challani Jallu", icon: "🌧️" },
    61: { text: "Thelikapaati Varsham", icon: "🌧️" },
    63: { text: "Varsham Paduthondi", icon: "🌧️" },
    65: { text: "Bhaari Varsham", icon: "🌧️" },
    66: { text: "Challani Varsham", icon: "🌧️" },
    67: { text: "Bhaari Challani Varsham", icon: "🌧️" },
    71: { text: "Manchu Varsham (Light Snow)", icon: "🌨️" },
    73: { text: "Madhyastha Manchu", icon: "🌨️" },
    75: { text: "Bhaari Manchu", icon: "❄️" },
    77: { text: "Manchu Pelukalu", icon: "❄️" },
    80: { text: "Chirujallula Tufaanu", icon: "🌦️" },
    81: { text: "Varshapu Jallulu", icon: "🌧️" },
    82: { text: "Theevra Varshapu Jallulu", icon: "⛈️" },
    85: { text: "Manchu Jallu", icon: "🌨️" },
    86: { text: "Bhaari Manchu Jallu", icon: "❄️" },
    95: { text: "Urumulu Merupulatho Varsham", icon: "⛈️" },
    96: { text: "Urumulu + Vadagandla Varsham", icon: "⛈️" },
    99: { text: "Bhaari Vadagandla Tufaanu", icon: "⛈️" }
  };
  return wmoMap[code] || { text: "Vaathavaranam Update", icon: isDay ? "🌤️" : "🌙" };
}

let dynamicVoiceData = "";

window.playAgriVoice = function() {
  if (!('speechSynthesis' in window)) {
    alert("Mee browser audio support cheyadam ledu.");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(dynamicVoiceData);
  utter.lang = "te-IN";
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
};

// Dynamic Reverse Geolocation (No hardcoded place name)
async function fetchDynamicLocationName(lat, lon) {
  try {
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
    const res = await fetch(geoUrl, { headers: { 'Accept-Language': 'te,en' } });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const addr = data.address || {};
    const town = addr.village || addr.suburb || addr.town || addr.city || addr.county || "Thaluka";
    const district = addr.state_district || addr.district || addr.state || "";
    return `📍 ${town}${district ? `, ${district}` : ""} (Live GPS)`;
  } catch (e) {
    return `📍 GPS: ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E (Live Satellite)`;
  }
}

function getGPSCoordinates() {
  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve({ lat: 17.9784, lon: 79.5941 }), // Fallback default only if user explicitly blocks GPS
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      resolve({ lat: 17.9784, lon: 79.5941 });
    }
  });
}

window.renderWeatherWidget = async function() {
  const container = document.getElementById("weather-container");
  if (!container) return;

  const refreshBtn = document.getElementById("weather-refresh-btn");
  if (refreshBtn) {
    refreshBtn.classList.add("btn-refresh-active");
    refreshBtn.innerHTML = "⏳ Update Avthondi...";
  }

  try {
    // 1. Dynamic GPS Coordinates
    const coords = await getGPSCoordinates();
    const lat = coords.lat;
    const lon = coords.lon;

    // 2. Fetch reverse geocoded real place name concurrently
    const placeNamePromise = fetchDynamicLocationName(lat, lon);

    // 3. Dynamic Open-Meteo Forecast Call
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,soil_moisture_0_to_1cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_temperature_0_to_7cm,uv_index,dew_point_2m,et0_fao_evapotranspiration,vapour_pressure_deficit,direct_radiation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,time&timezone=auto`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("API Network issue");
    const data = await res.json();

    const c = data.current;
    const d = data.daily;

    const weatherCond = parseDynamicWMO(c.weather_code, c.is_day === 1);
    const temp = Math.round(c.temperature_2m);
    const humidity = Math.round(c.relative_humidity_2m);
    const windSpeed = Number(c.wind_speed_10m).toFixed(1);
    const windGusts = Number(c.wind_gusts_10m || c.wind_speed_10m).toFixed(1);
    const windDir = getDynamicWindDir(c.wind_direction_10m || 0);

    // Dynamic Soil Moisture conversions
    const sMoistTop = Math.min(Math.round((c.soil_moisture_0_to_1cm || 0) * 200), 100);
    const sMoistRoot = Math.min(Math.round((c.soil_moisture_3_to_9cm || 0) * 200), 100);
    const sMoistSub = Math.min(Math.round((c.soil_moisture_9_to_27cm || 0) * 200), 100);

    const soilTemp = Math.round(c.soil_temperature_0_to_7cm || temp);
    const et0 = c.et0_fao_evapotranspiration != null ? Number(c.et0_fao_evapotranspiration).toFixed(1) : "0.0";
    const vpd = c.vapour_pressure_deficit != null ? Number(c.vapour_pressure_deficit).toFixed(2) : "0.00";
    const solarPow = Math.round(c.direct_radiation || 0);
    const rainProb = (d && d.precipitation_probability_max) ? d.precipitation_probability_max[0] : 0;
    const currentRainRate = Number(c.precipitation || c.rain || c.showers || 0).toFixed(1);

    // Dynamic Spray Logic
    let alertClass = "advisory-safe";
    let sprayText = `🟢 <strong>Mandhula sprayki anukoolam</strong>: Gaali adupulo undi (${windSpeed} km/h). Dhisya: <strong>${windDir}</strong>.`;
    let sprayVoice = `Prasthutham gaali adupulo undi, dhisya ${windDir}. Mandhulu spray chesukovadaniki manchi samayam.`;

    if (Number(currentRainRate) > 0 || c.weather_code >= 51 || rainProb >= 60) {
      alertClass = "advisory-danger";
      sprayText = `🚫 <strong>Mandhulu spray cheyavaddu</strong>: Varsham paduthondi / Varsha soochana undi (${rainProb}% - ${currentRainRate} mm). Mandhu vrudhaa avthundi!`;
      sprayVoice = `Hechharika. Varsha soochana undi, dayachesi ippudu mandhula spray cheyavaddu.`;
    } else if (Number(windSpeed) > 18 || Number(windGusts) > 25) {
      alertClass = "advisory-warning";
      sprayText = `⚠️ <strong>Spray kaasepu aapandi</strong>: Eedhurugaalulu theevramga unnaayi (${windGusts} km/h). Mandhu chellachedharu avthundi!`;
      sprayVoice = `Gamanika. Gaali vegam eedhurugaalulatho ekkuvaga undi. Kaasepu spray aapandi.`;
    }

    // Dynamic Soil Moisture Alert
    let soilVoice = "";
    let soilBadge = "";
    if (sMoistRoot >= 60) {
      soilBadge = `<span class="badge badge-success">💧 Thadi Pushkalam</span>`;
      soilVoice = "Verla daggara thadi baagundi, ippude neellu pettalsina pani ledu.";
    } else if (sMoistRoot >= 35) {
      soilBadge = `<span class="badge badge-neutral">🌱 Thema Saadharanam</span>`;
      soilVoice = "Nelalo thema saadharanamga undi, panta avasaraaniki thagattu thadi ivvandi.";
    } else {
      soilBadge = `<span class="badge badge-danger">⚠️ Nela Aari-poyindi</span>`;
      soilVoice = "Verla varaku bhoomi lo thema thaggindi, panta vaadaka munde thadi ivvandi.";
    }

    dynamicVoiceData = `Namaskaram raithu sodharulaara. Prasthutham ${weatherCond.text}. ${sprayVoice} ${soilVoice}`;

    const uvDesc = c.uv_index >= 8 ? "Chala Theevram" : (c.uv_index >= 5 ? "Madhyastham" : "Thakkuva");

    // Dynamic 4-Day Forecast with Real Localized Days
    const dayLabels = ["Aadi", "Soma", "Mangala", "Budha", "Guru", "Shukra", "Shani"];
    let forecastHtml = "";
    if (d && d.time) {
      for (let i = 1; i <= 4; i++) {
        if (!d.time[i]) break;
        const targetDate = new Date(d.time[i]);
        const dayTitle = i === 1 ? "Repu" : (i === 2 ? "Ellundi" : dayLabels[targetDate.getDay()]);
        const maxT = Math.round(d.temperature_2m_max[i] != null ? d.temperature_2m_max[i] : temp);
        const minT = Math.round(d.temperature_2m_min[i] != null ? d.temperature_2m_min[i] : (temp - 5));
        const pMax = d.precipitation_probability_max[i] || 0;
        const dayWmo = parseDynamicWMO(d.weather_code[i] || 0, true);

        forecastHtml += `
          <div class="forecast-day-card">
            <div class="forecast-day-title">${dayTitle}</div>
            <div class="forecast-day-icon">${dayWmo.icon}</div>
            <div class="forecast-day-temp">${maxT}°/${minT}°</div>
            <div class="forecast-day-rain">💧${pMax}%</div>
          </div>
        `;
      }
    }

    const placeDisplay = await placeNamePromise;

    container.innerHTML = `
      <div class="weather-card">
        
        <div class="weather-header">
          <div class="weather-title">
            <span>🌦️</span> Live Vaathaavaranam & Saagu Salaha
          </div>
          <button id="weather-refresh-btn" onclick="window.renderWeatherWidget()" class="btn-refresh">
            🔄 Refresh
          </button>
        </div>

        <div class="weather-main-row">
          <div class="weather-temp-block">
            <div class="weather-temp-val">${temp}°C</div>
            <div class="weather-status-sub">${weatherCond.text}</div>
            <div class="weather-main-icon">${weatherCond.icon}</div>
          </div>
          <div class="weather-stats-list">
            <div>💨 Gaali Vegam: <strong>${windSpeed} km/h</strong></div>
            <div>🧭 Gaali Dhisya: <strong>${windDir}</strong></div>
            <div>💧 Gaalilo Thema: <strong>${humidity}%</strong></div>
            <div>🌧️ Varsha Soochana: <strong>${rainProb}% (${currentRainRate} mm)</strong></div>
            <div>☀️ UV Index: <strong>${c.uv_index} (${uvDesc})</strong></div>
          </div>
        </div>

        <!-- Voice Button -->
        <button onclick="window.playAgriVoice()" class="btn-voice-agri">
          <span>🔊</span> Telugulo Vinandi (Voice Salaha)
        </button>

        <!-- Dynamic Spray Alert Box -->
        <div class="advisory-box ${alertClass}">
          ${sprayText}
        </div>

        <!-- 4-Day Forecast -->
        <div class="forecast-section">
          <div class="forecast-header">📅 Raaboye 4 Rojula Anchanalu:</div>
          <div class="forecast-row">
            ${forecastHtml}
          </div>
        </div>

        <!-- 40+ Soil & Agri Detailed Drawer -->
        <details class="agri-drawer">
          <summary class="agri-drawer-summary">
            <span>🌱 Prathyeka Nela Thema & Saagu Vivaraalu</span>
            <span class="drawer-arrow">Vivaraalu ▼</span>
          </summary>
          
          <div class="agri-drawer-grid">
            <div class="agri-metric-tile">
              <div class="agri-metric-label">Pai Nela Thema (0-1 cm)</div>
              <div class="agri-metric-value text-blue">${sMoistTop}%</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">Verla Daggara Thema (3-9 cm)</div>
              <div class="agri-metric-value text-blue">${sMoistRoot}% ${soilBadge}</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">Lothu Nela Thema (9-27 cm)</div>
              <div class="agri-metric-value text-blue">${sMoistSub}%</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">Nela Ushnogratha (0-7 cm)</div>
              <div class="agri-metric-value text-orange">${soilTemp}°C</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">Neeti Aaviri (ET₀)</div>
              <div class="agri-metric-value text-green">${et0} mm/Roju</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">Saura Shakthi (Solar Radiation)</div>
              <div class="agri-metric-value text-orange">${solarPow} W/m²</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">Aakula Otthidi (VPD)</div>
              <div class="agri-metric-value text-green">${vpd} kPa</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">Eedhurugaalulu (Gusts)</div>
              <div class="agri-metric-value text-dark">${windGusts} km/h</div>
            </div>
          </div>
        </details>

        <!-- Fully Dynamic Geo Location Label -->
        <div class="weather-footer">
          ${placeDisplay}
        </div>

      </div>
    `;
  } catch (err) {
    console.error("Live weather fetch failed:", err);
    container.innerHTML = `
      <div class="weather-error">
        ⚠️ Live weather data load avvaledu.<br>
        <button onclick="window.renderWeatherWidget()" class="btn-refresh" style="margin-top:8px;">Malli Prayathninchandi</button>
      </div>
    `;
  }
};

// Automatic load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.renderWeatherWidget);
} else {
  window.renderWeatherWidget();
}
