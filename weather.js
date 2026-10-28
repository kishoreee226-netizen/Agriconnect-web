// weather.js - 100% Pure Dynamic Agri Weather & Soil Station (Zero Hardcoding)

function getDynamicWindDir(deg) {
  const dirs = [
    "ఉత్తరం (N)", "ఈశాన్యం (NE)", "తూర్పు (E)", "ఆగ్నేయం (SE)",
    "దక్షిణం (S)", "నైరుతి (SW)", "పడమర (W)", "వాయవ్యం (NW)"
  ];
  return dirs[Math.round(deg / 45) % 8];
}

function parseDynamicWMO(code, isDay) {
  const wmoMap = {
    0: { text: isDay ? "నిర్మలమైన ఎండ" : "నిర్మలమైన రాత్రి", icon: isDay ? "☀️" : "🌙" },
    1: { text: "తేలికపాటి మేఘాలు", icon: isDay ? "🌤️" : "🌤️" },
    2: { text: "మబ్బులతో కూడిన ఎండ", icon: "⛅" },
    3: { text: "పూర్తిగా మబ్బులు (Overcast)", icon: "☁️" },
    45: { text: "పొగమంచు (Fog)", icon: "🌫️" },
    48: { text: "చల్లని మంచు", icon: "🌫️" },
    51: { text: "తేలికపాటి చిరుజల్లులు", icon: "🌦️" },
    53: { text: "మధ్యస్థ చిరుజల్లులు", icon: "🌦️" },
    55: { text: "భారీ చిరుజల్లులు", icon: "🌧️" },
    56: { text: "చల్లని జల్లులు", icon: "🌧️" },
    61: { text: "తేలికపాటి వర్షం", icon: "🌧️" },
    63: { text: "వర్షం పడుతోంది", icon: "🌧️" },
    65: { text: "భారీ వర్షం", icon: "🌧️" },
    66: { text: "చల్లని వర్షం", icon: "🌧️" },
    80: { text: "వర్షపు జల్లులు", icon: "🌦️" },
    81: { text: "తీవ్రమైన వర్షపు జల్లులు", icon: "🌧️" },
    82: { text: "భారీ వర్షపు తుఫాను", icon: "⛈️" },
    95: { text: "ఉరుములు, మెరుపులతో వర్షం", icon: "⛈️" },
    96: { text: "ఉరుములు + వడగండ్ల వర్షం", icon: "⛈️" },
    99: { text: "భారీ వడగండ్ల తుఫాను", icon: "⛈️" }
  };
  return wmoMap[code] || { text: "సాధారణ వాతావరణం", icon: isDay ? "🌤️" : "🌙" };
}

let dynamicVoiceData = "";

window.playAgriVoice = function() {
  if (!('speechSynthesis' in window)) {
    alert("మీ బ్రౌజర్ ఆడియోను సపోర్ట్ చేయడం లేదు.");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(dynamicVoiceData);
  utter.lang = "te-IN";
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
};

// లైవ్ GPS పొజిషన్ మాత్రమే తీసుకుంటుంది (ఏ హార్డ్‌కోడెడ్ లొకేషన్ ఉండదు)
function getPureGPSLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("మీ పరికరంలో GPS సదుపాయం లేదు."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new Error("GPS లొకేషన్ పర్మిషన్ ఆన్ చేయండి.")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// లైవ్ కోఆర్డినేట్స్ ఆధారంగా లైవ్ ఊరు పేరు తెస్తుంది
async function fetchPureDynamicCity(lat, lon) {
  const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=te`);
  if (!res.ok) throw new Error("లొకేషన్ పేరు పొందడం వీలుకాలేదు.");
  const data = await res.json();
  const place = data.locality || data.city || data.principalSubdivision || "";
  return `📍 ${place} (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E) - లైవ్ GPS`;
}

window.renderWeatherWidget = async function() {
  const container = document.getElementById("weather-container");
  if (!container) return;

  const refreshBtn = document.getElementById("weather-refresh-btn");
  if (refreshBtn) {
    refreshBtn.classList.add("btn-refresh-active");
    refreshBtn.innerHTML = "⏳ అప్‌డేట్ అవుతోంది...";
  }

  try {
    // 1. ఫోన్ నుంచి మాత్రమే రియల్ GPS కోఆర్డినేట్స్
    const loc = await getPureGPSLocation();
    const lat = loc.lat;
    const lon = loc.lon;

    // 2. లైవ్ వెదర్ & సాయిల్ API కాల్
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,soil_moisture_0_to_1cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_temperature_0_to_7cm,uv_index,dew_point_2m,et0_fao_evapotranspiration,vapour_pressure_deficit,direct_radiation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,time&timezone=auto`;

    const [weatherRes, placeDisplay] = await Promise.all([
      fetch(apiUrl),
      fetchPureDynamicCity(lat, lon)
    ]);

    if (!weatherRes.ok) throw new Error("వాతావరణ API నుంచి డేటా రాలేదు.");
    const data = await weatherRes.json();

    const c = data.current;
    const d = data.daily;

    const weatherCond = parseDynamicWMO(c.weather_code, c.is_day === 1);
    const temp = Math.round(c.temperature_2m);
    const humidity = Math.round(c.relative_humidity_2m);
    const windSpeed = Number(c.wind_speed_10m).toFixed(1);
    const windGusts = Number(c.wind_gusts_10m).toFixed(1);
    const windDir = getDynamicWindDir(c.wind_direction_10m);

    // వాస్తవ శాటిలైట్ అబ్జల్యూట్ రీడింగ్ ఆధారంగా మాత్రమే కాలిక్యులేషన్ (డెఫాల్ట్ విలువలు లేవు)
    const sMoistTop = Math.min(Math.round(c.soil_moisture_0_to_1cm * 200), 100);
    const sMoistRoot = Math.min(Math.round(c.soil_moisture_3_to_9cm * 200), 100);
    const sMoistSub = Math.min(Math.round(c.soil_moisture_9_to_27cm * 200), 100);

    const soilTemp = Math.round(c.soil_temperature_0_to_7cm);
    const et0 = Number(c.et0_fao_evapotranspiration).toFixed(1);
    const vpd = Number(c.vapour_pressure_deficit).toFixed(2);
    const solarPow = Math.round(c.direct_radiation);
    const rainProb = d.precipitation_probability_max[0];
    const currentRainRate = Number(c.precipitation).toFixed(1);

    // డైనమిక్ స్ప్రే అడ్వైజరీ
    let alertClass = "advisory-safe";
    let sprayText = `🟢 <strong>మందుల స్ప్రేకి అనుకూలం</strong>: గాలి అదుపులో ఉంది (${windSpeed} km/h). దిశ: <strong>${windDir}</strong>.`;
    let sprayVoice = `ప్రస్తుతం గాలి అదుపులో ఉంది, దిశ ${windDir}. మందుల స్ప్రే చేసుకోవడానికి మంచి సమయం.`;

    if (Number(currentRainRate) > 0 || c.weather_code >= 51 || rainProb >= 60) {
      alertClass = "advisory-danger";
      sprayText = `🚫 <strong>మందులు స్ప్రే చేయవద్దు</strong>: వర్షం పడుతోంది / వర్ష సూచన ఉంది (${rainProb}% - ${currentRainRate} mm). మందు కొట్టుకుపోతుంది!`;
      sprayVoice = `హెచ్చరిక. వర్ష సూచన ఉంది, దయచేసి ఇప్పుడు మందులు కొట్టకండి.`;
    } else if (Number(windSpeed) > 18 || Number(windGusts) > 25) {
      alertClass = "advisory-warning";
      sprayText = `⚠️ <strong>స్ప్రే కాసేపు ఆపండి</strong>: ఈదురుగాలులు అధికంగా ఉన్నాయి (${windGusts} km/h). మందు పక్కకు వెళ్లిపోతుంది!`;
      sprayVoice = `గమనిక. గాలి వేగం ఎక్కువగా ఉంది. కాసేపు మందుల స్ప్రే ఆపండి.`;
    }

    // డైనమిక్ నేల తేమ సలహా
    let soilVoice = "";
    let soilBadge = "";
    if (sMoistRoot >= 60) {
      soilBadge = `<span class="badge badge-success">💧 తడి పుష్కలం</span>`;
      soilVoice = "వేర్ల దగ్గర తడి బాగుంది, ఇప్పుడే నీళ్లు పెట్టాల్సిన అవసరం లేదు.";
    } else if (sMoistRoot >= 35) {
      soilBadge = `<span class="badge badge-neutral">🌱 తేమ సాధారణం</span>`;
      soilVoice = "నేలలో తేమ సాధారణంగా ఉంది, పంట అవసరాన్ని బట్టి తడి ఇవ్వండి.";
    } else {
      soilBadge = `<span class="badge badge-danger">⚠️ నేల ఆరిపోయింది</span>`;
      soilVoice = "భూమి లోపల తేమ తగ్గింది, పంటకు వెంటనే తడి ఇవ్వండి.";
    }

    dynamicVoiceData = `నమస్కారం రైతు సోదరులారా. ప్రస్తుతం ${weatherCond.text}. ${sprayVoice} ${soilVoice}`;
    const uvDesc = c.uv_index >= 8 ? "చాలా ఎక్కువ" : (c.uv_index >= 5 ? "మధ్యస్థం" : "తక్కువ");

    // క్యాలెండర్ ప్రకారం రాబోయే 4 రోజుల డైనమిక్ కార్డులు
    const teluguDays = ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"];
    let forecastHtml = "";
    for (let i = 1; i <= 4; i++) {
      const targetDate = new Date(d.time[i]);
      const dayTitle = i === 1 ? "రేపు" : (i === 2 ? "ఎల్లుండి" : teluguDays[targetDate.getDay()]);
      const maxT = Math.round(d.temperature_2m_max[i]);
      const minT = Math.round(d.temperature_2m_min[i]);
      const pMax = d.precipitation_probability_max[i];
      const dayWmo = parseDynamicWMO(d.weather_code[i], true);

      forecastHtml += `
        <div class="forecast-day-card">
          <div class="forecast-day-title">${dayTitle}</div>
          <div class="forecast-day-icon">${dayWmo.icon}</div>
          <div class="forecast-day-temp">${maxT}° / ${minT}°</div>
          <div class="forecast-day-rain">💧 ${pMax}%</div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="weather-card">
        
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
            <div class="weather-temp-val">${temp}°C</div>
            <div class="weather-status-sub">${weatherCond.text}</div>
            <div class="weather-main-icon">${weatherCond.icon}</div>
          </div>
          <div class="weather-stats-list">
            <div>💨 గాలి వేగం: <strong>${windSpeed} km/h</strong></div>
            <div>🧭 గాలి దిశ: <strong>${windDir}</strong></div>
            <div>💧 గాలిలో తేమ: <strong>${humidity}%</strong></div>
            <div>🌧️ వర్ష సూచన: <strong>${rainProb}% (${currentRainRate} mm)</strong></div>
            <div>☀️ UV ఇండెక్స్: <strong>${c.uv_index} (${uvDesc})</strong></div>
          </div>
        </div>

        <button onclick="window.playAgriVoice()" class="btn-voice-agri">
          <span>🔊</span> తెలుగులో వినండి (వాయిస్ సలహా)
        </button>

        <div class="advisory-box ${alertClass}">
          ${sprayText}
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
        <div style="font-size:11px; color:#64748b; margin-top:4px;">ఫోన్ లొకేషన్ (GPS) ఆన్ చేసి రీఫ్రెష్ చేయండి.</div>
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
