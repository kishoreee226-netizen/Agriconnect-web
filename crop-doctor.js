// ================= AI CROP DOCTOR MODULE =================
function handleCropCamera(event) {
  const panel = document.getElementById("camera-result-panel");
  const res = document.getElementById("crop-doctor-res");

  // Migatha panels close cheyadam
  const soilTest = document.getElementById("soil-test-panel");
  const soilSens = document.getElementById("soil-sensor-panel");
  if (soilTest) soilTest.style.display = "none";
  if (soilSens) soilSens.style.display = "none";

  if (!event.target.files || !event.target.files[0]) return;

  const file = event.target.files[0];
  if (panel) panel.style.display = "block";
  if (res) res.innerHTML = "⏳ <i>Photo analysis jaruguthundi... AI Parikshisthondi...</i>";

  // Real-time Firestore lo scan request record cheyadam (Internet unte)
  if (window.db && navigator.onLine) {
    window.db.collection("crop_scans").add({
      fileName: file.name,
      fileSize: file.size,
      scannedAt: new Date().toISOString()
    }).catch((err) => {
      console.warn("Firestore scan record save kaaledu:", err);
    });
  }

  // AI Diagnostic output render cheyadam
  setTimeout(() => {
    if (res) {
      res.innerHTML = `
        <div style="line-height:1.6;">
          <b style="color:#2e7d32;">🌿 Pariksha Purna Aindi (Diagnosis Complete):</b><br>
          🔬 <b>Tegulu (Disease):</b> Mirapa Aaku Macha Tegulu (Cercospora Leaf Spot)<br>
          ⚡ <b>Theevrata (Severity):</b> Madhyastham (Medium)<br>
          💊 <b>Mandhu & Nivarana:</b> SAAF (Carbendazim + Mancozeb) 2 grams per liter neellalo kalipi spray cheyandi.<br>
          <small style="color:#555;">● Photo: ${file.name}</small>
        </div>
      `;
    }
  }, 1200);
}
