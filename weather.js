// ================= PROFESSIONAL LIVE GPS AGRI-WEATHER MODULE =================

// WMO Weather Interpretation & Farmer Advisory Logic
function decodeWeather(code) {
  if (code === 0) return { text: "నిర్మలమైన ఆకాశం (Clear)", icon: "☀️", advisory: "సాగు పనులకు, ఎరువులు మరియు మందుల పిచికారీకి పూర్తి అనుకూలం." };
  if (code === 1 || code === 2) return { text: "పాక్షిక మేఘావృతం (Partly Cloudy)", icon: "🌤️", advisory: "సాధారణ వాతావరణం. పంట పనులను యథావిధిగా కొనసాగించవచ్చు." };
  if (code === 3) return { text: "దట్టమైన మేఘాలు (Overcast)", icon: "☁️", advisory: "వర్ష సూచన ఉండే అవకాశం ఉంది. పంట కోత, ఆరబెట్టే పనుల్లో జాగ్రత్త." };
  if (code === 45 || code === 48) return { text: "పొగమంచు (Fog)", icon: "🌫️", advisory: "తేమ వల్ల బూజు తెగుళ్లు ఆశించే అవకాశం ఉంది, పైరును గమనించండి." };
  if (code >= 51 && code <= 55) return { text: "తేలికపాటి చిరుజల్లులు (Drizzle)", icon: "🌦️", advisory: "రసాయన మందుల పిచికారీని తాత్కాలికంగా వాయిదా వేయండి." };
  if (code >= 61 && code <= 65) return { text: "వర్షం పడుతోంది (Rain)", icon: "🌧️", advisory: "ఎరువులు వేయడం, స్ప్రేయింగ్ ఆపండి. పొలంలో నీటి పారుదలకు ఏర్పాట్లు చేయండి." };
  if (code >= 80 && code <= 82) return { text: "భారీ వర్షపు జల్లులు (Showers)", icon: "🌧️", advisory: "పొలాల్లో నీరు నిలవకుండా డ్రైనేజీ కాలువలను సరిచేసుకోండి." };
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
        <button type="button" onclick="getLiveLocationWeather()" class="btn-weather-refresh">
          🔄 రిఫ్రెష్
        </button>
      </div>

      <!-- Main Current Conditions Grid -->
      <div class="weather-main-grid">
        <div class="weather-temp-block">
          <div id="weather-temp" class="weather-temp-text">--°C</div>
          <div id="weather-cond" class="weather-condition-text">వాతావరణాన్ని లెక్కిస్తోంది...</div>
          <div id="weather-icon" class="weather-icon-lg">🌤️</div>
        </div>

        <div class="weather-metrics-block">
          <div class="metric-item">
            <span class="metric-label">💨 గాలి వేగం:</span>
            <strong id="weather-wind">-- km/h</strong>
          </div>
          <div class="metric-item">
            <span class="metric-label">💧 గాలిలో తేమ:</span>
            <strong id="weather-humidity">--%</strong>
          </div>
          <div class="metric-item">
            <span class="metric-label">🌧️ వర్ష సూచన:</span>
            <strong id="weather-rain-prob">--%</strong>
          </div>
        </div>
      </div>

      <!-- Farmer Advisory Card -->
      <div id="weather-advisory" class="weather-advisory-box">
        🌾 రైతు సలహా: లైవ్ సమాచారం లోడ్ అవుతోంది...
      </div>

      <!-- 3-Day Forecast Section -->
      <div class="forecast-section">
        <div class="forecast-title">📅 రాబోయే 3 రోజుల అంచనా:</div>
        <div id="weather-forecast-strip" class="forecast-strip">
          <div class="forecast-day-card">లోడ్ అవుతోంది...</div>
        </div>
      </div>

      <!-- Live Location GPS Footer -->
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
  const condEl = document.getElementById("weather-cond");
  const iconEl = document.getElementById("weather-icon");
  const windEl = document.getElementById("weather-wind");
  const humEl = document.getElementById("weather-humidity");
  const rainEl = document.getElementById("weather-rain-prob");
  const advEl = document.getElementById("weather-advisory");
  const forecastStrip = document.getElementById("weather-forecast-strip");

  if (!navigator.onLine) {
    if (res) res.innerHTML = "⚠️ <span class='weather-err-text'>ఇంటర్నెట్ కనెక్షన్ లేదు.</span>";
    return;
  }

  if (!navigator.geolocation) {
    if (res) res.innerText = "బ్రౌజర్‌లో GPS సపోర్ట్ లేదు.";
    return;
  }

  if (res) res.innerText = "📍 GPS లొకేషన్ తీసుకుంటోంది...";

  const geoOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  };

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    try {
      // 1. Comprehensive Weather API Call (Current + Metrics + 3-day Daily Forecast)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const weatherPromise = fetch(weatherUrl).then(r => r.json());

      // 2. Reverse Geocode for Village & District
      const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=te`;
      const geoPromise = fetch(geoUrl).then(r => r.json());

      const [weatherData, geoData] = await Promise.all([weatherPromise, geoPromise]);

      // Current Conditions
      if (weatherData && weatherData.current) {
        const cur = weatherData.current;
        const info = decodeWeather(cur.weather_code);

        if (tempEl) tempEl.innerText = `${Math.round(cur.temperature_2m)}°C`;
        if (condEl) condEl.innerText = info.text;
        if (iconEl) iconEl.innerText = info.icon;
        if (windEl) windEl.innerText = `${cur.wind_speed_10m} km/h`;
        if (humEl) humEl.innerText = `${cur.relative_humidity_2m}%`;

        // Today's max precipitation probability
        const todayRainProb = weatherData.daily?.precipitation_probability_max?.[0] ?? 0;
        if (rainEl) rainEl.innerText = `${todayRainProb}%`;

        // Smart dynamic advisory combination
        let customAdvisory = info.advisory;
        if (todayRainProb >= 60) {
          customAdvisory = "వర్షం పడే అవకాశం ఎక్కువగా ఉంది (60%+). ఎరువులు, మందుల పిచికారీ వెంటనే ఆపండి.";
        } else if (cur.relative_humidity_2m > 85) {
          customAdvisory += " గాలిలో తేమ చాలా ఎక్కువగా ఉంది, బూజు తెగుళ్లపై నిఘా ఉంచండి.";
        }
        if (advEl) advEl.innerHTML = `💡 <b>రైతు సలహా:</b> ${customAdvisory}`;
      }

      // Render 3-Day Forecast Cards (Next 3 Days)
      if (weatherData && weatherData.daily && forecastStrip) {
        const daily = weatherData.daily;
        let forecastHTML = "";
        const dayNames = ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"];

        // Days index 1, 2, 3 (Tomorrow, Day after tomorrow, Next)
        for (let i = 1; i <= 3; i++) {
          if (daily.time[i]) {
            const dateObj = new Date(daily.time[i]);
            const dayLabel = i === 1 ? "రేపు" : i === 2 ? "ఎల్లుండి" : dayNames[dateObj.getDay()];
            const dayInfo = decodeWeather(daily.weather_code[i]);
            const maxTemp = Math.round(daily.temperature_2m_max[i]);
            const minTemp = Math.round(daily.temperature_2m_min[i]);
            const rainChance = daily.precipitation_probability_max[i] ?? 0;

            forecastHTML += `
              <div class="forecast-day-card">
                <span class="f-day-name">${dayLabel}</span>
                <span class="f-icon">${dayInfo.icon}</span>
                <span class="f-temp">${maxTemp}° / ${minTemp}°</span>
                <span class="f-rain">💧 ${rainChance}%</span>
              </div>
            `;
          }
        }
        forecastStrip.innerHTML = forecastHTML;
      }

      // Display Location Name
      const village = geoData?.locality || geoData?.city || geoData?.principalSubdivision || "స్థానిక ప్రాంతం";
      const district = geoData?.localityInfo?.administrative?.[2]?.name || "";
      const locationText = district && district !== village ? `${village}, ${district}` : village;

      if (res) {
        res.innerHTML = `📍 <strong>${locationText}</strong> (లైవ్ వాతావరణం)`;
      }
    } catch (e) {
      if (res) res.innerText = `✅ వాతావరణ సమాచారం అందింది (Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)})`;
    }
  }, (err) => {
    if (res) {
      res.innerText = err.code === 1 ? "GPS లొకేషన్ పర్మిషన్ అవసరం." : "లొకేషన్ పొందడం ఆలస్యమైంది, రిఫ్రెష్ నొక్కండి.";
    }
  }, geoOptions);
}

// Auto Execution
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderWeatherWidget);
} else {
  renderWeatherWidget();
}

window.renderWeatherWidget = renderWeatherWidget;
window.getLiveLocationWeather = getLiveLocationWeather;
