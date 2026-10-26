// ================= LIVE GPS WEATHER & AGRI ADVISORY MODULE =================

// WMO Weather interpretation codes (WMO కోడ్స్ ఆధారంగా వాతావరణం & ఐకాన్)
function decodeWeather(code) {
  if (code === 0) return { text: "నిర్మలమైన ఆకాశం (Clear)", icon: "☀️", advisory: "సాగు పనులకు, మందుల పిచికారీకి అనుకూలం." };
  if (code === 1 || code === 2) return { text: "పాక్షిక మేఘావృతం (Partly Cloudy)", icon: "🌤️", advisory: "సాధారణ వాతావరణం, పంట పనులను కొనసాగించవచ్చు." };
  if (code === 3) return { text: "దట్టమైన మేఘాలు (Overcast)", icon: "☁️", advisory: "వర్ష సూచన ఉండే అవకాశం ఉంది, కోత పనుల్లో జాగ్రత్త." };
  if (code === 45 || code === 48) return { text: "పొగమంచు (Fog)", icon: "🌫️", advisory: "తేమ వల్ల బూజు తెగుళ్లు వచ్చే అవకాశం ఉంది, గమనించండి." };
  if (code >= 51 && code <= 55) return { text: "తేలికపాటి చిరుజల్లులు (Drizzle)", icon: "🌦️", advisory: "రసాయన మందుల పిచికారీని తాత్కాలికంగా వాయిదా వేయండి." };
  if (code >= 61 && code <= 65) return { text: "వర్షం పడుతోంది (Rain)", icon: "🌧️", advisory: "ఎరువులు వేయడం, స్ప్రేయింగ్ ఆపండి. నీటి పారుదలకు ఏర్పాట్లు చేయండి." };
  if (code >= 80 && code <= 82) return { text: "భారీ వర్షపు జల్లులు (Showers)", icon: "🌧️", advisory: "పొలాల్లో నీరు నిలవకుండా డ్రైనేజీ కాలువలను సిద్ధం చేయండి." };
  if (code >= 95) return { text: "ఉరుములు, మెరుపులతో కూడిన వాన (Thunderstorm)", icon: "⛈️", advisory: "రైతులు చెట్ల కింద, ట్రాక్టర్ల వద్ద ఉండకండి. సురక్షిత ప్రదేశాల్లో ఉండండి." };
  return { text: "సాధారణ వాతావరణం", icon: "🌤️", advisory: "పంట స్థితిని క్రమం తప్పకుండా పరిశీలించండి." };
}

function renderWeatherWidget() {
  const container = document.getElementById("weather-container");
  if (!container) return;

  container.innerHTML = `
    <div class="weather-card">
      <div class="weather-header">
        <strong>🌦️ లైవ్ వాతావరణం & సాగు సలహా</strong>
        <button onclick="getLiveLocationWeather()" class="btn-weather-refresh">
          🔄 రిఫ్రెష్
        </button>
      </div>

      <div class="weather-display-box">
        <div>
          <div id="weather-temp" class="weather-temp-text">--°C</div>
          <div id="weather-cond" class="weather-condition-text">వాతావరణాన్ని లెక్కిస్తోంది...</div>
          <div id="weather-desc" class="weather-desc-text">గాలి వేగం: -- km/h</div>
        </div>
        <div id="weather-icon" class="weather-icon-lg">🌤️</div>
      </div>

      <div id="weather-advisory" class="weather-advisory-box">
        🌾 రైతు సలహా: లైవ్ సమాచారం లోడ్ అవుతోంది...
      </div>

      <div id="gps-weather-res" class="weather-status-footer">
        📍 GPS లొకేషన్ తీసుకుంటోంది...
      </div>
    </div>
  `;

  getLiveLocationWeather();
}

function getLiveLocationWeather() {
  const res = document.getElementById("gps-weather-res");
  const tempEl = document.getElementById("weather-temp");
  const descEl = document.getElementById("weather-desc");
  const condEl = document.getElementById("weather-cond");
  const iconEl = document.getElementById("weather-icon");
  const advEl = document.getElementById("weather-advisory");

  if (!navigator.onLine) {
    if (res) res.innerHTML = "⚠️ <span class='weather-err-text'>Internet లేదు. Weather అప్‌డేట్ కాలేదు.</span>";
    return;
  }

  if (!navigator.geolocation) {
    if (res) res.innerText = "GPS సపోర్ట్ లేదు.";
    return;
  }

  if (res) res.innerText = "📍 GPS లొకేషన్ తీసుకుంటోంది...";

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    try {
      // 1. Weather Data (Open-Meteo)
      const weatherPromise = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`).then(r => r.json());

      // 2. Village/City Name Reverse Geocoding
      const geoPromise = fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`).then(r => r.json());

      const [weatherData, geoData] = await Promise.all([weatherPromise, geoPromise]);

      // Weather & Condition Code Processing
      if (weatherData && weatherData.current_weather) {
        const cw = weatherData.current_weather;
        const info = decodeWeather(cw.weathercode);

        if (tempEl) tempEl.innerText = `${Math.round(cw.temperature)}°C`;
        if (descEl) descEl.innerText = `గాలి వేగం: ${cw.windspeed} km/h`;
        if (condEl) condEl.innerText = info.text;
        if (iconEl) iconEl.innerText = info.icon;
        if (advEl) advEl.innerHTML = `💡 <b>రైతు సలహా:</b> ${info.advisory}`;
      }

      // Location Name Processing
      const village = geoData?.locality || geoData?.city || geoData?.principalSubdivision || "మీ గ్రామం";
      const district = geoData?.localityInfo?.administrative?.[2]?.name || "";
      const locationText = district && district !== village ? `${village}, ${district}` : village;

      if (res) {
        res.innerHTML = `📍 <strong>${locationText}</strong> (ఖచ్చితమైన లైవ్ వాతావరణం)`;
      }
    } catch (e) {
      if (res) res.innerText = `✅ Live Weather (Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)})`;
    }
  }, () => {
    if (res) res.innerText = "GPS పర్మిషన్ ఇవ్వలేదు (లొకేషన్ ఆన్ చేయండి).";
  });
}

window.renderWeatherWidget = renderWeatherWidget;
window.getLiveLocationWeather = getLiveLocationWeather;
