// ================= REAL-TIME LABOR & JOBS MODULE =================

function listenLiveLaborList() {
  const listEl = document.getElementById("labor-list");
  if (!listEl) return;

  if (!navigator.onLine) {
    listEl.innerHTML = "<small style='color:#d32f2f;'>⚠️ ఇంటర్నెట్ లేదు.</small>";
    return;
  }

  if (!window.db) {
    console.error("Firebase db అందుబాటులో లేదు");
    listEl.innerHTML = "<small style='color:#777;'>కనెక్షన్ రాలేదు...</small>";
    return;
  }

  // Firestore 'laborers' collection listener
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
          <div style="font-size:0.85rem; color:#444;">పని: ${l.workType || l.work || "వ్యవసాయ పనులు"} | ఊరు: ${l.village || l.location || "స్థానిక"}</div>
          <div style="margin-top:4px;">
            📞 <a href="tel:${l.phone}" style="color:#2e7d32; font-weight:bold; text-decoration:none;">${l.phone || "ఫోన్ లేదు"}</a>
          </div>
        </div>
      `;
    });
    html += "</div>";
    listEl.innerHTML = html;
  }, (error) => {
    console.error("Labor fetch error:", error);
    listEl.innerHTML = "<small style='color:#d32f2f;'>కూలీల వివరాలు లోడ్ చేయలేకపోయాం.</small>";
  });
}

// పేజీ లోడ్ అవ్వగానే రన్ అవ్వడానికి
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", listenLiveLaborList);
} else {
  listenLiveLaborList();
}
