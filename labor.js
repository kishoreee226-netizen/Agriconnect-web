// ================= REAL-TIME LABOR & JOBS WITH TABS =================

let laborData = [];
let jobsData = [];
let currentTab = 'labor';

function renderTabs() {
  const container = document.getElementById("labor-list");
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex; gap:8px; margin-bottom:12px; border-bottom:2px solid #e0e0e0; padding-bottom:8px;">
      <button id="btn-tab-labor" style="flex:1; padding:8px; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:0.85rem; background:${currentTab === 'labor' ? '#2e7d32' : '#e8f5e9'}; color:${currentTab === 'labor' ? '#ffffff' : '#2e7d32'};">
        👷 కూలీలు (${laborData.length})
      </button>
      <button id="btn-tab-jobs" style="flex:1; padding:8px; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:0.85rem; background:${currentTab === 'jobs' ? '#e65100' : '#fff3e0'}; color:${currentTab === 'jobs' ? '#ffffff' : '#e65100'};">
        🌾 పనులు / Jobs (${jobsData.length})
      </button>
    </div>
    <div id="tab-content-area"></div>
  `;

  document.getElementById('btn-tab-labor').onclick = () => { currentTab = 'labor'; renderTabs(); };
  document.getElementById('btn-tab-jobs').onclick = () => { currentTab = 'jobs'; renderTabs(); };

  const contentArea = document.getElementById('tab-content-area');

  if (currentTab === 'labor') {
    if (!laborData.length) {
      contentArea.innerHTML = "<p style='color:#666; font-size:0.85rem;'>👷 నమోదైన కూలీలు ఎవరూ లేరు.</p>";
      return;
    }
    contentArea.innerHTML = laborData.map(d => `
      <div style="background:#f1f8e9; padding:10px 12px; border-radius:6px; border-left:4px solid #2e7d32; margin-bottom:8px;">
        <div style="font-weight:bold; color:#1b5e20;">${d.name || "కూలీ"}</div>
        <div style="font-size:0.82rem; color:#444; margin-top:2px;">
          🌾 పని: <b>${d.skills || d.work || "వ్యవసాయ పనులు"}</b> | 📍 ఊరు: <b>${d.village || d.location || "హనుమకొండ"}</b>
        </div>
        ${d.phone ? `<div style="margin-top:4px; font-size:0.85rem;">📞 <a href="tel:${d.phone}" style="color:#2e7d32; font-weight:bold; text-decoration:none;">${d.phone}</a></div>` : ""}
      </div>
    `).join('');
  } else {
    if (!jobsData.length) {
      contentArea.innerHTML = "<p style='color:#666; font-size:0.85rem;'>🌾 ప్రస్తుతం పనుల అవసరాలు (Jobs) ఏవీ లేవు.</p>";
      return;
    }
    contentArea.innerHTML = jobsData.map(j => `
      <div style="background:#fff8e1; padding:10px 12px; border-radius:6px; border-left:4px solid #f57f17; margin-bottom:8px;">
        <div style="font-weight:bold; color:#d84315;">${j.farmer || "రైతు"} <span style="font-size:0.8rem; background:#ffe082; color:#b71c1c; padding:2px 6px; border-radius:4px; margin-left:6px;">అవసరం: ${j.count || 1} మంది</span></div>
        <div style="font-size:0.82rem; color:#444; margin-top:4px;">
          🌾 పని: <b>${j.work || "కూలీ పనులు"}</b> | 📍 ప్రాంతం: <b>${j.location || "హనుమకొండ"}</b>
        </div>
        ${j.phone ? `<div style="margin-top:4px; font-size:0.85rem;">📞 <a href="tel:${j.phone}" style="color:#d84315; font-weight:bold; text-decoration:none;">${j.phone}</a></div>` : ""}
      </div>
    `).join('');
  }
}

function startSync() {
  const container = document.getElementById("labor-list");
  if (!container) return;

  // window.db సిద్ధమయ్యే వరకు 150ms వేచి చూస్తుంది
  if (!window.db) {
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
      window.db = firebase.firestore();
    } else {
      setTimeout(startSync, 150);
      return;
    }
  }

  // కూలీలు
  window.db.collection("laborers").onSnapshot(snap => {
    laborData = [];
    snap.forEach(doc => laborData.push(doc.data()));
    renderTabs();
  });

  // పనులు
  window.db.collection("jobs").onSnapshot(snap => {
    jobsData = [];
    snap.forEach(doc => jobsData.push(doc.data()));
    renderTabs();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startSync);
} else {
  startSync();
}
