function loadLaborers() {
  const container = document.getElementById("labor-list");
  if (!container) return;

  // Firebase ready ayyevaraku wait chesthundi
  if (typeof firebase === "undefined" || !firebase.apps || !firebase.apps.length) {
    setTimeout(loadLaborers, 250);
    return;
  }

  const db = firebase.firestore();

  // Firestore nundi direct ga laborers thesthunnam
  db.collection("laborers").onSnapshot(function(snapshot) {
    if (snapshot.empty) {
      container.innerHTML = "<p style='color:#666;'>👷 Koolila vivaralu emi levu.</p>";
      return;
    }

    let output = "<div style='font-weight:bold; color:#1b5e20; margin-bottom:6px;'>👷 Namodhaina Koolilu:</div>";
    snapshot.forEach(function(doc) {
      const data = doc.data();
      output += `
        <div style="background:#f1f8e9; padding:8px 10px; border-radius:6px; border-left:4px solid #2e7d32; margin-bottom:8px;">
          <div style="font-weight:bold; color:#1b5e20;">${data.name || "Kooli"}</div>
          <div style="font-size:0.85rem; color:#444;">🌾 Pani: <b>${data.skills || data.work || "Vyavasayam"}</b> | 📍 Ooru: <b>${data.village || "Warangal"}</b></div>
          ${data.phone ? `<div style="font-size:0.85rem; margin-top:3px;">📞 <a href="tel:${data.phone}" style="color:#2e7d32; font-weight:bold;">${data.phone}</a></div>` : ""}
        </div>
      `;
    });
    container.innerHTML = output;
  }, function(error) {
    container.innerHTML = "<span style='color:red;'>Firestore Error: " + error.message + "</span>";
  });
}

// Window load ayyaka run avvadaniki
window.addEventListener("load", loadLaborers);
