// weather.js - Upgraded Agri-Smart Weather Widget

function getTeluguWindDir(deg) {
  const dirs = ["ఉత్తరం (N)", "ఈశాన్యం (NE)", "తూర్పు (E)", "ఆగ్నేయం (SE)", "దక్షిణం (S)", "నైరుతి (SW)", "పడమర (W)", "వాయవ్యం (NW)"];
  return dirs[Math.round(deg / 45) % 8];
}

let agriVoiceText = "";

window.playAgriVoice = function() {
  if (!('speechSynthesis' in window)) {
    alert("మీ బ్రౌజర్ ఆడియోను సపోర్ట్ చేయడం లేదు.");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(agriVoiceText);
  utter.lang = "te-IN";
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
};

window.renderWeatherWidget = async function() {
  const container = document.getElementById("weather-container");
  if (!container) return;

  try {
    const lat = 17.9784;
    const lon = 79.5941;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,showers,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,soil_moisture_0_to_1cm,soil_moisture_3_to_9cm,soil_temperature_0_to_7cm,uv_index,dew_point_2m,et0_fao_evapotranspiration,vapour_pressure_deficit&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();
    const c = data.current;
    const d = data.daily;

    const temp = Math.round(c.temperature_2m);
    const humidity = c.relative_humidity_2m;
    const windSpeed = (c.wind_speed_10m).toFixed(1);
    const windGusts = (c.wind_gusts_10m || c.wind_speed_10m).toFixed(1);
    const windDir = getTeluguWindDir(c.wind_direction_10m || 0);

    const sMoistTop = Math.min(Math.round((c.soil_moisture_0_to_1cm || 0.20) * 200), 100);
    const sMoistDeep = Math.min(Math.round((c.soil_moisture_3_to_9cm || 0.25) * 200), 100);
    const soilTemp = Math.round(c.soil_temperature_0_to_7cm || temp);
    const et0 = c.et0_fao_evapotranspiration ? c.et0_fao_evapotranspiration.toFixed(1) : "0.0";
    const rainProb = (d && d.precipitation_probability_max) ? d.precipitation_probability_max[0] : 0;

    // Advisory logic
    let alertClass = "advisory-safe";
    let sprayText = `🟢 <strong>మందుల స్ప్రేకి అనుకూలం</strong>: గాలి అదుపులో ఉంది (${windSpeed} km/h). దిశ: <strong>${windDir}</strong>.`;
    let sprayVoice = `ప్రస్తుతం గాలి అదుపులో ఉంది, గాలి వీచే దిశ ${windDir}. మందుల స్ప్రే చేసుకోవడానికి మంచి సమయం.`;

    if (c.precipitation > 0 || c.rain > 0 || rainProb >= 60) {
      alertClass = "advisory-danger";
      sprayText = `🚫 <strong>మందులు స్ప్రే చేయవద్దు</strong>: వర్ష సూచన ఉంది (${rainProb}%). మందు కొట్టుకుపోతుంది!`;
      sprayVoice = `హెచ్చరిక. వర్ష సూచన ఉంది, దయచేసి ఇప్పుడు మందులు కొట్టకండి.`;
    } else if (windSpeed > 18 || windGusts > 25) {
      alertClass = "advisory-warning";
      sprayText = `⚠️ <strong>స్ప్రే కాసేపు ఆపండి</strong>: ఈదురుగాలులు అధికంగా ఉన్నాయి (${windGusts} km/h). మందు పక్కకు వెళ్లిపోతుంది!`;
      sprayVoice = `గమనిక. గాలి వేగం చాలా ఎక్కువగా ఉంది. కాసేపు మందుల స్ప్రే ఆపండి.`;
    }

    let soilVoice = "";
    let soilBadge = "";
    if (sMoistDeep >= 60) {
      soilBadge = `<span class="badge badge-success">💧 తడి బాగుంది</span>`;
      soilVoice = "వేర్ల దగ్గర తడి బాగుంది, ఇప్పుడే నీళ్లు పెట్టాల్సిన అవసరం లేదు.";
    } else if (sMoistDeep >= 35) {
      soilBadge = `<span class="badge badge-neutral">🌱 తేమ సాధారణం</span>`;
      soilVoice = "నేలలో తేమ సాధారణంగా ఉంది, పంట అవసరాన్ని బట్టి తడి ఇవ్వండి.";
    } else {
      soilBadge = `<span class="badge badge-danger">⚠️ నేల ఆరిపోయింది</span>`;
      soilVoice = "భూమి లోపల తేమ తగ్గింది, పంటకు వెంటనే తడి ఇవ్వండి.";
    }

    agriVoiceText = `నమస్కారం రైతు సోదరులారా. ${sprayVoice} ${soilVoice}`;
    let uvText = c.uv_index > 7 ? "ఎక్కువ" : "తక్కువ";

    // 3-Day Forecast Cards
    const dayNames = ["రేపు", "ఎల్లుండి", "శని"];
    let forecastHtml = "";
    if (d && d.time) {
      for (let i = 1; i <= 3; i++) {
        const maxT = Math.round(d.temperature_2m_max[i] || temp);
        const minT = Math.round(d.temperature_2m_min[i] || (temp - 5));
        const pProb = d.precipitation_probability_max[i] || 0;
        forecastHtml += `
          <div class="forecast-day-card">
            <div class="forecast-day-title">${dayNames[i-1]}</div>
            <div class="forecast-day-icon">🌤️</div>
            <div class="forecast-day-temp">${maxT}° / ${minT}°</div>
            <div class="forecast-day-rain">💧 ${pProb}%</div>
          </div>
        `;
      }
    }

    container.innerHTML = `
      <div class="weather-card">
        
        <div class="weather-header">
          <div class="weather-title">
            <span>🌦️</span> లైవ్ వాతావరణం & సాగు సలహా
          </div>
          <button onclick="window.renderWeatherWidget()" class="btn-refresh">
            🔄 రీఫ్రెష్
          </button>
        </div>

        <div class="weather-main-row">
          <div class="weather-temp-block">
            <div class="weather-temp-val">${temp}°C</div>
            <div class="weather-status-sub">తేలికపాటి వాతావరణం</div>
            <div class="weather-main-icon">🌤️</div>
          </div>
          <div class="weather-stats-list">
            <div>💨 గాలి వేగం: <strong>${windSpeed} km/h</strong></div>
            <div>🧭 గాలి దిశ: <strong>${windDir}</strong></div>
            <div>💧 గాలిలో తేమ: <strong>${humidity}%</strong></div>
            <div>🌧️ వర్ష సూచన: <strong>${rainProb}%</strong></div>
            <div>☀️ UV ఇండెక్స్: <strong>${c.uv_index} (${uvText})</strong></div>
          </div>
        </div>

        <!-- Voice Button -->
        <button onclick="window.playAgriVoice()" class="btn-voice-agri">
          <span>🔊</span> తెలుగులో వినండి (వాయిస్ సలహా)
        </button>

        <!-- Advisory Box -->
        <div class="advisory-box ${alertClass}">
          ${sprayText}
        </div>

        <!-- 3 Day Forecast -->
        <div class="forecast-section">
          <div class="forecast-header">📅 రాబోయే 3 రోజుల అంచనా:</div>
          <div class="forecast-row">
            ${forecastHtml}
          </div>
        </div>

        <!-- Deep Agri Details Drawer -->
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
              <div class="agri-metric-value text-blue">${sMoistDeep}% ${soilBadge}</div>
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
              <div class="agri-metric-label">ఈదురుగాలులు (Gusts)</div>
              <div class="agri-metric-value text-dark">${windGusts} km/h</div>
            </div>
            <div class="agri-metric-tile">
              <div class="agri-metric-label">మంచు బిందువు</div>
              <div class="agri-metric-value text-dark">${c.dew_point_2m || 0}°C</div>
            </div>
          </div>
        </details>

        <div class="weather-footer">
          📍 హనుమకొండ, హనుమకొండ జిల్లా (లైవ్ వాతావరణం)
        </div>

      </div>
    `;
  } catch (err) {
    console.error("Weather error:", err);
    container.innerHTML = `<div class="weather-error">వాతావరణ డేటా లోడ్ కాలేదు. రీఫ్రెష్ చేయండి.</div>`;
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.renderWeatherWidget);
} else {
  window.renderWeatherWidget();
}
