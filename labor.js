// ================= REAL-TIME LABOR & JOBS DIRECT MODULE =================

function initLaborDirectory() {
  const container = document.getElementById("labor-list");
  if (!container) return;

  // Firebase సిద్ధమయ్యే వరకు వేచి చూస్తుంది
  if (typeof firebase === "undefined" || !firebase.apps || !firebase.apps.length) {
    setTimeout(initLaborDirectory, 300);
    return;
  }

  const db = firebase.firestore();

  // 1. కూలీల సమాచారం
  db.collection("laborers").onSnapshot((laborSnap) => {
    // 2. రైతుల పనుల వివరాలు
    db.collection("jobs").onSnapshot((jobsSnap) => {
      let html = "";

      if (!laborSnap.empty) {
        html += "<div style='font-size:0.85rem; font-weight:bold; color:#1b5e20; margin-bottom:6px;'>👷 నమోదైన కూలీలు:</div>";
        laborSnap.forEach((doc) => {
          const l = doc.data();
          html += `
            <div style="background:#f1f8e9; padding:8px 12px; border-radius:6px; border-left:4px solid #2e7d32; margin-bottom:8px;">
              <div style="font-weight:bold; color:#1b5e20;">${l.name || "కూలీ"}</div>
              <div style="font-size:0.82rem; color:#444; margin-top:2px;">
                🌾 పని: <b>${l.skills || l.work || "వ్యవసాయ పనులు"}</b> | 📍 ఊరు: <b>${l.village || "వరంగల్"}</b>
              </div>
              ${l.phone ? `<div style="margin-top:3px; font-size:0.85rem;">📞 <a href="tel:${l.phone}" style="color:#2e7d32; font-weight:bold;">${l.phone}</a></div>` : ""}
            </div>
          `;
        });
      }

      if (!jobsSnap.empty) {
        html += "<div style='font-size:0.85rem; font-weight:bold; color:#e65100; margin:10px 0 6px 0;'>🌾 రైతుల పనుల అవసరాలు (Jobs):</div>";
        jobsSnap.forEach((doc) => {
          const j = doc.data();
          html += `
            <div style="background:#fff8e1; padding:8px 12px; border-radius:6px; border-left:4px solid #f57f17; margin-bottom:8px;">
              <div style="font-weight:bold; color:#d84315;">${j.farmer || "రైతు"} (అవసరం: ${j.count || 1} మంది)</div>
              <div style="font-size:0.82rem; color:#333; margin-top:2px;">పని: ${j.work || "కూలీ పనులు"}</div>
              ${j.phone ? `<div style="margin-top:3px; font-size:0.85rem;">📞 <a href="tel:${j.phone}" style="color:#d84315; font-weight:bold;">${j.phone}</a></div>` : ""}
            </div>
          `;
        });
      }

      if (laborSnap.empty && jobsSnap.empty) {
        container.innerHTML = "<p style='color:#666; font-size:0.85rem;'>👷 డేటా ఏదీ నమోదు కాలేదు.</p>";
      } else {
        container.innerHTML = html;
      }
    }, (err) => {
      container.innerHTML = `<small style='color:red;'>Jobs error: ${err.message}</small>`;
    });
  }, (err) => {
    container.innerHTML = `<small style='color:red;'>Labor error: ${err.message}</small>`;
  });
}

// పేజీ లోడ్ అయిన వెంటనే ఎగ్జిక్యూట్ చేయడం
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLaborDirectory);
} else {
  initLaborDirectory();
}
