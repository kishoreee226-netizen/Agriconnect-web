// ================= LIVE GPS WEATHER MODULE =================
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
      // Free Open-Meteo Real-time API
      const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await resp.json();
      if (data && data.current_weather) {
        if (tempEl) tempEl.innerText = `${Math.round(data.current_weather.temperature)}°C`;
        if (descEl) descEl.innerText = `Gaali vegam: ${data.current_weather.windspeed} km/h`;
        if (res) res.innerText = `✅ Live Weather (Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)})`;
      }
    } catch (e) {
      if (res) res.innerText = "Weather fetch cheyadam valla kaledu.";
    }
  }, () => {
    if (res) res.innerText = "GPS access ivvaledu.";
  });
}
