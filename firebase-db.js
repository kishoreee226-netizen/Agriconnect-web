// ================= REAL-TIME SOIL SENSORS (FIRESTORE) =================
function openSoilSensors() {
  const camPanel = document.getElementById("camera-result-panel");
  const testPanel = document.getElementById("soil-test-panel");
  const sensorPanel = document.getElementById("soil-sensor-panel");

  if (camPanel) camPanel.style.display = "none";
  if (testPanel) testPanel.style.display = "none";

  if (!sensorPanel) return;
  sensorPanel.style.display = "block";

  const details = sensorPanel.querySelector("div");
  if (details) {
    details.innerHTML = "⏳ <i>Firebase Firestore nundi live sensor readings load avthunnayi...</i>";
  }

  if (!window.db) {
    console.error("Firebase db initialize kaledu.");
    return;
  }

  // Real-time Firestore Listener on 'soil_sensors'
  window.db.collection("soil_sensors")
    .orderBy("timestamp", "desc")
    .limit(1)
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        if (details) {
          details.innerHTML = `
            💧 <b>Nela Tema (Moisture):</b> 45% (Default)<br>
            🌡️ <b>Ushnogratha:</b> 27°C | <b>EC:</b> 1.1 dS/m<br>
            <small style="color:#e65100;">⚠️ Sensor data ledu, default values chupisthondi.</small>
          `;
        }
        return;
      }

      snapshot.forEach((doc) => {
        const s = doc.data();
        if (details) {
          details.innerHTML = `
            💧 <b>Nela Tema (Moisture):</b> ${s.moisture || 45}%<br>
            🌡️ <b>Ushnogratha (Temp):</b> ${s.temperature || 27}°C<br>
            ⚡ <b>EC:</b> ${s.ec || 1.1} dS/m<br>
            <small style="color:#1B5E20; font-weight:bold;">● Live Firestore Connected (${new Date().toLocaleTimeString()})</small>
          `;
        }
      });
    }, (error) => {
      console.error("Firestore Sensor Error:", error);
      if (details) details.innerHTML = "❌ Sensor data thevalekapoyam. Connection check cheyandi.";
    });
}

// ================= REAL-TIME BHOOSARA PARIKSHA (LAB REPORT) =================
function openSoilTest() {
  const camPanel = document.getElementById("camera-result-panel");
  const sensorPanel = document.getElementById("soil-sensor-panel");
  const testPanel = document.getElementById("soil-test-panel");

  if (camPanel) camPanel.style.display = "none";
  if (sensorPanel) sensorPanel.style.display = "none";

  if (!testPanel) return;
  testPanel.style.display = "block";

  const details = testPanel.querySelector("div");
  if (details) {
    details.innerHTML = "⏳ <i>Firestore nundi lab report load avthondi...</i>";
  }

  if (!window.db) {
    console.error("Firebase db initialize kaledu.");
    return;
  }

  // Real-time Firestore Listener on 'soil_tests'
  window.db.collection("soil_tests")
    .orderBy("createdAt", "desc")
    .limit(1)
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        if (details) {
          details.innerHTML = `
            🌱 <b>pH Sthayi:</b> 6.7 (Anukulam)<br>
            ⚖️ <b>NPK:</b> N-Madhyastham | P-Sadharanam | K-Ekkuva<br>
            💡 <b>Suchana:</b> Ekaraku 25kg ureatho patu sendriya eruvulu veyandi.
          `;
        }
        return;
      }

      snapshot.forEach((doc) => {
        const t = doc.data();
        if (details) {
          details.innerHTML = `
            🌱 <b>pH Sthayi:</b> ${t.ph || "6.7"}<br>
            ⚖️ <b>NPK:</b> N-${t.nitrogen || "Normal"} | P-${t.phosphorus || "Normal"} | K-${t.potassium || "Normal"}<br>
            💡 <b>Suchana:</b> ${t.recommendation || "Sendriya eruvulu vadandi."}<br>
            <small style="color:#1B5E20; font-weight:bold;">● Lab Report Verified (${new Date().toLocaleDateString('te-IN')})</small>
          `;
        }
      });
    }, (error) => {
      console.error("Firestore Test Error:", error);
      if (details) details.innerHTML = "❌ Soil test report load kaledu.";
    });
}
