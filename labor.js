// ================= REAL-TIME LABOR & JOBS WITH TABS =================

(function() {
  const firebaseConfig = {
    apiKey: "AIzaSyAvev9rVOBx5xE1A993EtSD7FG9JxAmbyI",
    authDomain: "agriconnect-5fc39.firebaseapp.com",
    projectId: "agriconnect-5fc39",
    storageBucket: "agriconnect-5fc39.firebasestorage.app",
    messagingSenderId: "491716802186",
    appId: "1:491716802186:web:087ee5f6c30ec75ce75f73"
  };

  let laborData = [];
  let jobsData = [];
  let currentTab = 'labor';

  function renderUI(container) {
    container.innerHTML = `
      <div style="display:flex; gap:8px; margin-bottom:12px; border-bottom:2px solid #e0e0e0; padding-bottom:6px;">
        <button id="btn-tab-labor" style="flex:1; padding:7px 10px; border:none; border-radius:6px; font-weight:bold; cursor:pointer; background:${currentTab === 'labor' ? '#2e7d32' : '#e8f5e9'}; color:${currentTab === 'labor' ? '#fff' : '#2e7d32'}; font-size:0.85rem;">
          👷 కూలీలు (${laborData.length})
        </button>
        <button id="btn-tab-jobs" style="flex:1; padding:7px 10px; border:none; border-radius:6px; font-weight:bold; cursor:pointer; background:${currentTab === 'jobs' ? '#e65100' : '#fff3e0'}; color:${currentTab === 'jobs' ? '#fff' : '#e65100'}; font-size:0.85rem;">
          🌾 పనులు / Jobs (${jobsData.length})
        </button>
      </div>
      <div id="tab-content-area"></div>
    `;

    document.getElementById('btn-tab-labor').onclick = () => {
      currentTab = 'labor';
      renderUI(container);
    };

    document.getElementById('btn-tab-jobs').onclick = () => {
      currentTab = 'jobs';
      renderUI(container);
    };

    const contentArea = document.getElementById('tab-content-area');

    if (currentTab === 'labor') {
      if (laborData.length === 0) {
        contentArea.innerHTML = "<p style='color:#666; font-size:0.85rem;'>👷 నమోదైన కూలీలు ఎవరూ లేరు.</p>";
      } else {
        let html = "";
        laborData.forEach(d => {
          html += `
            <div style="background:#f1f8e9; padding:8px 12px; border-radius:6px; border-left:4px solid #2e7d32; margin-bottom:8px;">
              <div style="font-weight:bold; color:#1b5e20;">${d.name || "కూలీ"}</div>
              <div style="font-size:0.82rem; color:#444; margin-top:2px;">
                🌾 పని: <b>${d.skills || d.work || "వ్యవసాయ పనులు"}</b> | 📍 ఊరు: <b>${d.village || "హనుమకొండ"}</b>
              </div>
              ${d.phone ? `<div style="margin-top:3px; font-size:0.85rem;">📞 <a href="tel:${d.phone}" style="color:#2e7d32; font-weight:bold; text-decoration:none;">${d.phone}</a></div>` : ""}
            </div>
          `;
        });
        contentArea.innerHTML = html;
      }
    } else {
      if (jobsData.length === 0) {
        contentArea.innerHTML = "<p style='color:#666; font-size:0.85rem;'>🌾 ప్రస్తుతం రైతుల పనుల అవసరాలు ఏవీ నమోదు కాలేదు.</p>";
      } else {
        let html = "";
        jobsData.forEach(j => {
          html += `
            <div style="background:#fff8e1; padding:8px 12px; border-radius:6px; border-left:4px solid #f57f17; margin-bottom:8px;">
              <div style="font-weight:bold; color:#d84315;">${j.farmer || j.farmerName || "రైతు"} (అవసరం: ${j.count || j.laborCount || 1} మంది)</div>
              <div style="font-size:0.82rem; color:#444; margin-top:2px;">
                🌾 పని: <b>${j.work || j.workType || "పని"}</b> | 📍 ప్రాంతం: <b>${j.location || j.village || "గ్రామం"}</b>
              </div>
              ${j.phone ? `<div style="margin-top:3px; font-size:0.85rem;">📞 <a href="tel:${j.phone}" style="color:#d84315; font-weight:bold; text-decoration:none;">${j.phone}</a></div>` : ""}
            </div>
          `;
        });
        contentArea.innerHTML = html;
      }
    }
  }

  function startSync() {
    const container = document.getElementById("labor-list");
    if (!container) return;

    if (typeof firebase === "undefined") {
      setTimeout(startSync, 200);
      return;
    }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      const db = firebase.firestore();

      // 1. కూలీల సమాచారం లైవ్ సింక్
      db.collection("laborers").onSnapshot(snap => {
        laborData = [];
        snap.forEach(doc => laborData.push(doc.data()));
        renderUI(container);
      }, err => console.error("Labor error:", err));

      // 2. రైతుల జాబ్స్ లైవ్ సింక్
      db.collection("jobs").onSnapshot(snap => {
        jobsData = [];
        snap.forEach(doc => jobsData.push(doc.data()));
        renderUI(container);
      }, err => console.error("Jobs error:", err));

    } catch (e) {
      container.innerHTML = "<div style='color:red;'>⚠️ Error: " + e.message + "</div>";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSync);
  } else {
    startSync();
  }
})();
