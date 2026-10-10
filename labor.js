// ================= REAL-TIME LABOR & JOBS MODULE =================

function loadLaborDirectoryData() {
  const container = document.getElementById("labor-list");
  if (!container) return;

  // Firebase సిద్ధమయ్యే వరకు వేచి చూసే లూప్
  if (typeof firebase === "undefined" || !firebase.apps || !firebase.apps.length) {
    setTimeout(loadLaborDirectoryData, 250);
    return;
  }

  try {
    const db = firebase.firestore();

    // 1. కూలీల వివరాలు (laborers)
    db.collection("laborers").onSnapshot((laborSnap) => {
      // 2. రైతుల పనుల వివరాలు (jobs)
      db.collection("jobs").onSnapshot((jobsSnap) => {
        let html = "";

        // కూలీల లిస్ట్
        if (!laborSnap.empty) {
          html += "<div style='font-size:0.85rem; font-weight:bold; color:#1b5e20; margin-bottom:6px;'>👷 నమోదైన కూలీలు:</div>";
          laborSnap.forEach((doc) => {
            const l = doc.data();
            const pName = l.name || "కూలీ పేరు లేదు";
            const pSkills = l.skills || l.workType || l.work || "వ్యవసాయ పనులు";
            const pVillage = l.village || l.location || "హనుమకొండ / వరంగల్";
            const pPhone = l.phone || "";

            html += `
              <div style="background:#f1f8e9; padding:8px 12px; border-radius:6px; border-left:4px solid #2e7d32; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-weight:bold; color:#1b5e20;">${pName}</div>
                <div style="font-size:0.83rem; color:#444; margin-top:2px;">
                  🌾 పని: <b>${pSkills}</b> | 📍 ఊరు: <b>${pVillage}</b>
                </div>
                ${pPhone ? `
                  <div style="margin-top:4px; font-size:0.85rem;">
                    📞 <a href="tel:${pPhone}" style="color:#2e7d32; font-weight:bold; text-decoration:none;">${pPhone}</a>
                  </div>
                ` : ""}
              </div>
            `;
          });
        }

        // రైతుల జాబ్స్ లిస్ట్
        if (!jobsSnap.empty) {
          html += "<div style='font-size:0.85rem; font-weight:bold; color:#e65100; margin:10px 0 6px 0;'>🌾 రైతుల పనుల అవసరాలు (Jobs):</div>";
          jobsSnap.forEach((doc) => {
            const j = doc.data();
            html += `
              <div style="background:#fff8e1; padding:8px 12px; border-radius:6px; border-left:4px solid #f57f17; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-weight:bold; color:#d84315;">${j.farmer || "రైతు"} (అవసరం: ${j.count || 1} మంది)</div>
                <div style="font-size:0.83rem; color:#333; margin-top:2px;">పని: ${j.work || "కూలీ పనులు"} | ఊరు: ${j.location || "స్థానిక"}</div>
                ${j.phone ? `
                  <div style="margin-top:4px; font-size:0.85rem;">
                    📞 <a href="tel:${j.phone}" style="color:#d84315; font-weight:bold; text-decoration:none;">${j.phone}</a>
                  </div>
                ` : ""}
              </div>
            `;
          });
        }

        // రెండూ ఖాళీగా ఉంటే
        if (laborSnap.empty && jobsSnap.empty) {
          container.innerHTML = "<p style='color:#666; font-size:0.85rem; padding:8px 0;'>👷 ప్రస్తుతం ఎలాంటి వివరాలు నమోదు కాలేదు.</p>";
        } else {
          container.innerHTML = html;
        }

      }, (err) => {
        console.error("Jobs error:", err);
      });
    }, (err) => {
      console.error("Labor error:", err);
      container.innerHTML = "<small style='color:#d32f2f;'>కూలీల వివరాలు లోడ్ కాలేదు.</small>";
    });

  } catch (err) {
    console.error("Firestore Error:", err);
    container.innerHTML = `<small style='color:#d32f2f;'>ఎర్రర్: ${err.message}</small>`;
  }
}

// పేజీ లోడ్ అయిన వెంటనే ఎగ్జిక్యూట్ చేయడానికి
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadLaborDirectoryData);
} else {
  loadLaborDirectoryData();
}
