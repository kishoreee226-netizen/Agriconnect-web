// ================= LIVE GPS WEATHER MODULE =================

function renderWeatherWidget() {
  const container = document.getElementById("weather-container");
  if (!container) return;

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #81c784; border-radius: 8px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong style="color: #2e7d32; font-size: 14px;">🌦️ లైవ్ వాతావరణం (Live Weather)</strong>
        <button onclick="getLiveLocationWeather()" style="background: #2e7d32; color: #ffffff; border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; font-weight: 600;">
          🔄 రిఫ్రెష్
        </button>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; background: #f1f8e9; padding: 10px; border-radius: 6px;">
        <div>
          <div id="weather-temp" style="font-size: 24px; font-weight: 700; color: #1b5e20;">--°C</div>
          <div id="weather-desc" style="font-size: 11px; color: #555; margin-top: 2px;">గాలి వేగం: -- km/h</div>
        </div>
        <div style="font-size: 28px;">🌤️</div>
      </div>

      <div id="gps-weather-res" style="font-size: 10px; color: #666; margin-top: 6px; text-align: center;">
        📍 GPS బటన్ నొక్కి లైవ్ వాతావరణం పొందండి
      </div>
    </div>
  `;

  // Page open avvagane weather auto fetch avvadaniki
  getLiveLocationWeather();
}

function getLiveLocationWeather() {
  const res = document.getElementById("gps-weather-res");
  const tempEl = document.getElementById("weather-temp");
  const descEl = document.getElementById("weather-desc");

  if (!navigator.onLine) {
    if (res) res.innerHTML = "⚠️ <span style='color:#d32f2f;'>Internet ledu. Weather update kaaledu.</span>";
    return;
  }

  if (!navigator.geolocation) {
    if (res) res.innerText = "GPS support ledu.";
    return;
  }

  if (res) res.innerText = "📍 GPS location theesukuntundi...";

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    try {
      const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await resp.json();
      if (data && data.current_weather) {
        if (tempEl) tempEl.innerText = `${Math.round(data.current_weather.temperature)}°C`;
        if (descEl) descEl.innerText = `గాలి వేగం: ${data.current_weather.windspeed} km/h`;
        if (res) res.innerText = `✅ Live Weather (Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)})`;
      }
    } catch (e) {
      if (res) res.innerText = "Weather fetch cheyadam valla kaledu.";
    }
  }, () => {
    if (res) res.innerText = "GPS permission ivvaledu.";
  });
}

// Global scope lo petadam
window.renderWeatherWidget = renderWeatherWidget;
window.getLiveLocationWeather = getLiveLocationWeather;
