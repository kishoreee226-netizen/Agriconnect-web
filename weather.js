// ================= LIVE GPS WEATHER MODULE =================

function renderWeatherWidget() {
  const container = document.getElementById("weather-container");
  if (!container) return;

    container.innerHTML = `
    <div class="weather-card">
      <div class="weather-header">
        <strong>🌦️ లైవ్ వాతావరణం (Live Weather)</strong>
        <button onclick="getLiveLocationWeather()" class="btn-weather-refresh">
          🔄 రిఫ్రెష్
        </button>
      </div>

      <div class="weather-display-box">
        <div>
          <div id="weather-temp" class="weather-temp-text">--°C</div>
          <div id="weather-desc" class="weather-desc-text">గాలి వేగం: -- km/h</div>
        </div>
        <div class="weather-icon-lg">🌤️</div>
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

  if (!navigator.onLine) {
    if (res) res.innerHTML = "⚠️ <span style='color:#d32f2f;'>Internet లేదు. Weather అప్‌డేట్ కాలేదు.</span>";
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

      // 2. Village/City Name Reverse Geocoding (Free API)
      const geoPromise = fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`).then(r => r.json());

      const [weatherData, geoData] = await Promise.all([weatherPromise, geoPromise]);

      // Weather Update
      if (weatherData && weatherData.current_weather) {
        if (tempEl) tempEl.innerText = `${Math.round(weatherData.current_weather.temperature)}°C`;
        if (descEl) descEl.innerText = `గాలి వేగం: ${weatherData.current_weather.windspeed} km/h`;
      }

      // Location Name Update
      const village = geoData.locality || geoData.city || geoData.principalSubdivision || "మీ ప్రాంతం";
      const district = geoData.localityInfo?.administrative?.[2]?.name || "";
      const locationText = district && district !== village ? `${village}, ${district}` : village;

      if (res) {
        res.innerHTML = `📍 <strong>${locationText}</strong> (Live Weather)`;
      }
    } catch (e) {
      if (res) res.innerText = `✅ Live Weather (Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)})`;
    }
  }, () => {
    if (res) res.innerText = "GPS పర్మిషన్ ఇవ్వలేదు.";
  });
}

window.renderWeatherWidget = renderWeatherWidget;
window.getLiveLocationWeather = getLiveLocationWeather;
