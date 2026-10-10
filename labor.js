// ================= REAL-TIME LABOR & JOBS COMBINED MODULE =================

function loadLaborDirectory() {
  const container = document.getElementById("labor-list");
  if (!container) return;

  if (!navigator.onLine) {
    container.innerHTML = "<small style='color:#d32f2f;'>⚠️ ఇంటర్నెట్ కనెక్షన్ లేదు.</small>";
    return;
  }

  // Firebase ready ayye varaku wait chesthundi
  if (!window.db) {
    setTimeout(loadLaborDirectory, 300);
    return;
  }

  // Jobs collection nundi data thevadam (Meeru add chesina data idhe!)
  window.db.collection("jobs").onSnapshot((jobsSnap) => {
    // Laborers collection nundi data thevadam
    window.db.collection("laborers").onSnapshot((laborSnap) => {
      
      let html = "";

      // 1. Jobs List (రైతులు పెట్టిన రిక్వెస్ట్‌లు)
      if (!jobsSnap.empty) {
        html += "<div style='font-size:0.8rem; font-weight:bold; color:#e65100; margin-bottom:4px;'>🌾 రైతుల పనుల అవసరాలు (Jobs):</div>";
        jobsSnap.forEach((doc) => {
          const j = doc.data();
          html += `
            <div style="background:#fff8e1; padding:8px 10px; border-radius:6px; border-left:4px solid #f57f17; margin-bottom:8px;">
              <div style="font-weight:bold; color:#d84315;">${j.farmer || "రైతు"} (కూలీలు: ${j.count || 1} మంది)</div>
              <div style="font-size:0.82rem; color:#444;">పని: ${j.work || "వ్యవసాయ పని"} | ఊరు: ${j.location || "స్థానిక"}</div>
              <div style="margin-top:3px; font-size:0.85rem;">
                📞 <a href="tel:${j.phone}" style="color:#d84315; font-weight:bold; text-decoration:none;">${j.phone || "నంబర్ లేదు"}</a>
              </div>
            </div>
          `;
        });
      }

      // 2. Laborers List (కూలీల వివరాలు)
      if (!laborSnap.empty) {
        html += "<div style='font-size:0.8rem; font-weight:bold; color:#2e7d32; margin:8px 0 4px 0;'>👷 కూలీల జాబితా:</div>";
        laborSnap.forEach((doc) => {
          const l = doc.data();
          html += `
            <div style="background:#f1f8e9; padding:8px 10px; border-radius:6px; border-left:4px solid #2e7d32; margin-bottom:8px;">
              <div style="font-weight:bold; color:#1b5e20;">${l.name || "కూలీ పేరు"}</div>
              <div style="font-size:0.82rem; color:#444;">పని: ${l.workType || l.work || "వ్యవసాయ పనులు"} | ఊరు: ${l.village || l.location || "స్థానిక"}</div>
              <div style="margin-top:3px; font-size:0.85rem;">
                📞 <a href="tel:${l.phone}" style="color:#2e7d32; font-weight:bold; text-decoration:none;">${l.phone || "నంబర్ లేదు"}</a>
              </div>
            </div>
          `;
        });
      }

      // రెండింటిలోనూ డేటా లేకపోతే
      if (jobsSnap.empty && laborSnap.empty) {
        container.innerHTML = "<p style='color:#666; font-size:0.85rem;'>👷 ప్రస్తుతం ఎలాంటి వివరాలు నమోదు కాలేదు.</p>";
      } else {
        container.innerHTML = html;
      }

    }, (err) => {
      console.error("Laborers read error:", err);
    });
  }, (err) => {
    console.error("Jobs read error:", err);
    container.innerHTML = "<small style='color:#d32f2f;'>డేటా లోడ్ కాలేదు.</small>";
  });
}

// Start
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadLaborDirectory);
} else {
  loadLaborDirectory();
}
