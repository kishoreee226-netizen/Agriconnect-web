// ================= REAL-TIME LABOR & JOBS MODULE =================

function initLaborAndJobs() {
  listenLiveLaborList();
  listenLiveJobsList();
}

// 1. కూలీల లిస్ట్
function listenLiveLaborList() {
  const listEl = document.getElementById("labor-list");
  if (!listEl || !window.db) return;

  window.db.collection("laborers").onSnapshot((snapshot) => {
    if (snapshot.empty) {
      listEl.innerHTML = "<p style='color:#666; font-size:0.9rem;'>👷 <i>కూలీలు ఎవరూ ఇంకా నమోదు చేసుకోలేదు.</i></p>";
      return;
    }

    let html = "<div style='display:flex; flex-direction:column; gap:8px;'>";
    snapshot.forEach((doc) => {
      const l = doc.data();
      html += `
        <div style="background:#f1f8e9; padding:10px; border-radius:6px; border-left:4px solid #2e7d32;">
          <div style="font-weight:bold; color:#1b5e20;">${l.name || "కూలీ పేరు లేదు"}</div>
          <div style="font-size:0.85rem; color:#444;">పని: ${l.workType || l.work || "వ్యవసాయ పనులు"} | ఊరు: ${l.village || l.location || "వరంగల్"}</div>
          <div style="margin-top:4px;">
            📞 <a href="tel:${l.phone}" style="color:#2e7d32; font-weight:bold; text-decoration:none;">${l.phone || "నంబర్ లేదు"}</a>
          </div>
        </div>
      `;
    });
    html += "</div>";
    listEl.innerHTML = html;
  });
}

// 2. రైతులు పెట్టిన పనులు (Jobs Requests)
function listenLiveJobsList() {
  const jobsEl = document.getElementById("jobs-list");
  if (!jobsEl || !window.db) return;

  window.db.collection("jobs").onSnapshot((snapshot) => {
    if (snapshot.empty) {
      jobsEl.innerHTML = "<p style='color:#666; font-size:0.85rem;'>🌾 ప్రస్తుతానికి కొత్త పనుల రిక్వెస్ట్‌లు లేవు.</p>";
      return;
    }

    let html = "<div style='display:flex; flex-direction:column; gap:8px; margin-top:6px;'>";
    snapshot.forEach((doc) => {
      const j = doc.data();
      html += `
        <div style="background:#fff8e1; padding:10px; border-radius:6px; border-left:4px solid #f57f17;">
          <div style="font-weight:bold; color:#e65100;">${j.farmer || "రైతు"} (అవసరం: ${j.count || 1} మంది)</div>
          <div style="font-size:0.85rem; color:#333;">పని: ${j.work || "పని వివరాలు లేవు"} | ప్రాంతం: ${j.location || "స్థానిక"}</div>
          <div style="margin-top:4px;">
            📞 <a href="tel:${j.phone}" style="color:#e65100; font-weight:bold; text-decoration:none;">${j.phone || "నంబర్ లేదు"}</a>
          </div>
        </div>
      `;
    });
    html += "</div>";
    jobsEl.innerHTML = html;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLaborAndJobs);
} else {
  initLaborAndJobs();
}
