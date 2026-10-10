// ================= REAL-TIME LABOR & JOBS MODULE =================

function listenLiveLaborList() {
  const listEl = document.getElementById("labor-list");
  if (!listEl || !window.db) return;

  if (!navigator.onLine) {
    listEl.innerHTML = "<small style='color:#d32f2f;'>⚠️ Internet ledu. Koolila vivaralu load kaaledu.</small>";
    return;
  }

  // Firestore 'laborers' collection listener
  window.db.collection("laborers").onSnapshot((snapshot) => {
    if (snapshot.empty) {
      listEl.innerHTML = "<i>Coolilu evaru inka register kaledu.</i>";
      return;
    }

    let html = "<ul style='padding-left:18px; line-height:1.6;'>";
    snapshot.forEach((doc) => {
      const l = doc.data();
      html += `
        <li style="margin-bottom:8px;">
          <b>${l.name || "Peru ledu"}</b> - ${l.workType || "Vyavasaya Panulu"} (${l.village || "Gramam"})<br>
          📞 <a href="tel:${l.phone}" style="color:#1B5E20; text-decoration:none; font-weight:bold;">${l.phone || "No phone"}</a>
        </li>
      `;
    });
    html += "</ul>";
    listEl.innerHTML = html;
  }, (error) => {
    console.error("Laborers fetch error:", error);
    listEl.innerHTML = "<small style='color:#d32f2f;'>Coolila data thevalekapoyam.</small>";
  });
}

window.addEventListener("online", listenLiveLaborList);
document.addEventListener("DOMContentLoaded", listenLiveLaborList);
