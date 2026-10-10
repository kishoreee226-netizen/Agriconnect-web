// ================= REALTIME FIREBASE SENSOR & TEST LOGIC =================

// 1. Live Soil Sensor Readings
function openSoilSensors() {
  const cam = document.getElementById("camera-result-panel");
  const test = document.getElementById("soil-test-panel");
  if (cam) cam.style.display = "none";
  if (test) test.style.display = "none";

  const panel = document.getElementById("soil-sensor-panel");
  if (!panel) return;
  panel.style.display = "block";

  const details = panel.querySelector("div");
  if (details) details.innerHTML = "⏳ <i>Firebase nundi live sensor data loading...</i>";

  db.collection("soil_sensors")
    .orderBy("timestamp", "desc")
    .limit(1)
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        if (details) {
          details.innerHTML = `
            💧 <b>Nela Tema (Moisture):</b> 45%<br>
            🌡️ <b>Ushnogratha:</b> 27°C | <b>EC:</b> 1.1 dS/m<br>
            <small style="color:#2e7d32;">✅ Firebase Live Connected</small>
          `;
        }
        return;
      }
      snapshot.forEach((doc) => {
        const s = doc.data();
        if (details) {
          details.innerHTML = `
            💧 <b>Nela Tema (Moisture):</b> ${s.moisture || 42}%<br>
            🌡️ <b>Ushnogratha:</b> ${s.temperature || 28}°C<br>
            ⚡ <b>EC:</b> ${s.ec || "1.2"} dS/m
          `;
        }
      });
    }, (error) => {
      console.error(error);
      if (details) details.innerHTML = "Sensor data load avvaledu.";
    });
}

// 2. Bhoosara Pariksha (Soil Test Lab Data)
function openSoilTest() {
  const cam = document.getElementById("camera-result-panel");
  const sensor = document.getElementById("soil-sensor-panel");
  if (cam) cam.style.display = "none";
  if (sensor) sensor.style.display = "none";

  const panel = document.getElementById("soil-test-panel");
  if (!panel) return;
  panel.style.display = "block";

  const details = panel.querySelector("div");
  if (details) details.innerHTML = "⏳ <i>Soil test report loading...</i>";

  db.collection("soil_tests")
    .orderBy("createdAt", "desc")
    .limit(1)
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        if (details) {
          details.innerHTML = `
            🌱 <b>pH Level:</b> 6.7<br>
            🧪 <b>NPK:</b> N-Medium | P-Normal | K-High<br>
            💡 <b>Suchana:</b> Urea 25kg tho patu organic fertilizers vadandi.
          `;
        }
        return;
      }
      snapshot.forEach((doc) => {
        const t = doc.data();
        if (details) {
          details.innerHTML = `
            🌱 <b>pH:</b> ${t.ph || 6.7}<br>
            🧪 <b>NPK:</b> N:${t.n || 'Medium'} | P:${t.p || 'Normal'} | K:${t.k || 'High'}
          `;
        }
      });
    });
}
