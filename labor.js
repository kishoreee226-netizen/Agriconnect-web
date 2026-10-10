// ================= REAL-TIME LABOR & JOBS DIRECT MODULE =================

async function loadLaborDirectly() {
  const container = document.getElementById("labor-list");
  if (!container) return;

  // Firebase సిద్ధమయ్యే వరకు ప్రయత్నించడం
  if (typeof firebase === "undefined") {
    container.innerHTML = "<small style='color:#d32f2f;'>⚠️ Firebase లైబ్రరీ లోడ్ కాలేదు.</small>";
    setTimeout(loadLaborDirectly, 500);
    return;
  }

  try {
    const db = window.db || firebase.firestore();

    // 1. కూలీల సమాచారం (laborers)
    const laborSnap = await db.collection("laborers").get();

    // 2. రైతుల పనుల వివరాలు (jobs)
    const jobsSnap = await db.collection("jobs").get();

    let html = "";

    // కూలీల వివరాలు ఉంటే
    if (!laborSnap.empty) {
      html += "<div style='font-size:0.85rem; font-weight:bold; color:#1b5e20; margin-bottom:6px;'>👷 నమోదైన కూలీలు:</div>";
      laborSnap.forEach((doc) => {
        const l = doc.data();
        html += `
          <div style="background:#f1f8e9; padding:8px 10px; border-radius:6px; border-left:4px solid #2e7d32; margin-bottom:8px;">
            <div style="font-weight:bold; color:#1b5e20;">${l.name || "పేరు లేదు"}</div>
            <div style="font-size:0.82rem; color:#444;">పని: ${l.skills || l.work || "వ్యవసాయ పనులు"} | ఊరు: ${l.village || "హనుమకొండ"}</div>
            <div style="margin-top:3px; font-size:0.85rem;">
              📞 <a href="tel:${l.phone}" style="color:#2e7d32; font-weight:bold; text-decoration:none;">${l.phone || "నంబర్ లేదు"}</a>
            </div>
          </div>
        `;
      });
    }

    // రైతుల జాబ్స్ ఉంటే
    if (!jobsSnap.empty) {
      html += "<div style='font-size:0.85rem; font-weight:bold; color:#e65100; margin:10px 0 6px 0;'>🌾 రైతుల పనుల అవసరాలు:</div>";
      jobsSnap.forEach((doc) => {
        const j = doc.data();
        html += `
          <div style="background:#fff8e1; padding:8px 10px; border-radius:6px; border-left:4px solid #f57f17; margin-bottom:8px;">
            <div style="font-weight:bold; color:#d84315;">${j.farmer || "రైతు"} (అవసరం: ${j.count || 1} మంది)</div>
            <div style="font-size:0.82rem; color:#333;">పని: ${j.work || "కూలీ పనులు"}</div>
            <div style="margin-top:3px; font-size:0.85rem;">
              📞 <a href="tel:${j.phone}" style="color:#d84315; font-weight:bold;">${j.phone || ""}</a>
            </div>
          </div>
        `;
      });
    }

    if (laborSnap.empty && jobsSnap.empty) {
      container.innerHTML = "<p style='color:#666; font-size:0.85rem;'>👷 డేటాబేస్ ఖాళీగా ఉంది.</p>";
    } else {
      container.innerHTML = html;
    }

  } catch (err) {
    console.error("Firestore Error:", err);
    container.innerHTML = `<small style='color:#d32f2f;'>ఎర్రర్: ${err.message}</small>`;
  }
}

// వెంటనే రన్ అవ్వడానికి
loadLaborDirectly();
document.addEventListener("DOMContentLoaded", loadLaborDirectly);
