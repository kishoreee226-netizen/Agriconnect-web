// ================= LABOR & JOBS DIRECT LOADER =================

(function() {
  const firebaseConfig = {
    apiKey: "AIzaSyAvev9rVOBx5xE1A993EtSD7FG9JxAmbyI",
    authDomain: "agriconnect-5fc39.firebaseapp.com",
    projectId: "agriconnect-5fc39",
    storageBucket: "agriconnect-5fc39.firebasestorage.app",
    messagingSenderId: "491716802186",
    appId: "1:491716802186:web:087ee5f6c30ec75ce75f73"
  };

  function startSync() {
    const el = document.getElementById("labor-list");
    if (!el) return;

    if (typeof firebase === "undefined") {
      setTimeout(startSync, 200);
      return;
    }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      const db = firebase.firestore();

      db.collection("laborers").onSnapshot(function(snap) {
        if (snap.empty) {
          el.innerHTML = "<p style='color:#666; font-size:0.9rem;'>👷 నమోదైన కూలీలు ఎవరూ లేరు.</p>";
          return;
        }

        let html = "<div style='font-size:0.85rem; font-weight:bold; color:#1b5e20; margin-bottom:6px;'>👷 నమోదైన కూలీలు:</div>";
        snap.forEach(function(doc) {
          const d = doc.data();
          html += `
            <div style="background:#f1f8e9; padding:8px 12px; border-radius:6px; border-left:4px solid #2e7d32; margin-bottom:8px;">
              <div style="font-weight:bold; color:#1b5e20;">${d.name || "కూలీ"}</div>
              <div style="font-size:0.82rem; color:#444; margin-top:2px;">
                🌾 పని: <b>${d.skills || d.work || "వ్యవసాయ పనులు"}</b> | 📍 ఊరు: <b>${d.village || "వరంగల్"}</b>
              </div>
              ${d.phone ? `<div style="margin-top:3px; font-size:0.85rem;">📞 <a href="tel:${d.phone}" style="color:#2e7d32; font-weight:bold; text-decoration:none;">${d.phone}</a></div>` : ""}
            </div>
          `;
        });
        el.innerHTML = html;
      }, function(err) {
        el.innerHTML = "<div style='color:red; font-size:0.85rem;'>⚠️ Firestore Error: " + err.message + "</div>";
      });

    } catch(e) {
      el.innerHTML = "<div style='color:red; font-size:0.85rem;'>⚠️ JS Error: " + e.message + "</div>";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSync);
  } else {
    startSync();
  }
})();
