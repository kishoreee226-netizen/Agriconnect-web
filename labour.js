// labour.js - కూలీల Dashboard (Light Blue Header, SMS, Call, WhatsApp, Maps & Skill Filters)

function getLabourJobsList() {
  if (window.AgriState && typeof window.AgriState.getJobs === "function") {
    return window.AgriState.getJobs();
  }
  try {
    return JSON.parse(localStorage.getItem("agri_jobs") || "[]");
  } catch (e) {
    return [];
  }
}

// కూలీల నైపుణ్యం & దూరం గ్లోబల్ ఫిల్టర్ స్టేట్
let activeSkillFilter = "all";
let activeLabourRangeFilter = "all";

function renderLabourWidget() {
  const container = document.getElementById("labour-jobs-container");
  if (!container) return;

  const rawJobs = getLabourJobsList();

  // నైపుణ్యం (Work Type / Skill) మరియు దూరం (Radius) ఆధారంగా ఫిల్టరింగ్
  const jobsData = rawJobs.filter(j => {
    // 1. Skill Match Check
    let skillMatch = true;
    if (activeSkillFilter !== "all") {
      const fullWorkText = `${j.crop || ''} ${j.workType || ''}`.toLowerCase();
      skillMatch = fullWorkText.includes(activeSkillFilter.toLowerCase());
    }

    // 2. Range Match Check
    let rangeMatch = true;
    const dist = parseFloat(j.distanceKm || "2.5");
    if (activeLabourRangeFilter === "village") {
      rangeMatch = dist <= 2.5;
    } else if (activeLabourRangeFilter === "5") {
      rangeMatch = dist <= 5.0;
    } else if (activeLabourRangeFilter === "10") {
      rangeMatch = dist <= 10.0;
    }

    return skillMatch && rangeMatch;
  });

  container.innerHTML = `
    <div class="labour-card">
      
      <!-- Light Blue Header -->
      <div class="labour-card-header">
        <h3>👷 కూలీల Dashboard (Live Jobs)</h3>
        <span class="badge-live-blue">Live Feed</span>
      </div>

      <!-- నైపుణ్యాల & పరిధి లైవ్ ఫిల్టర్ బార్ -->
      <div class="labour-filter-bar" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; background:#e1f5fe; padding:8px 12px; border-radius:8px; margin:10px 0; border:1px solid #b3e5fc;">
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          <!-- నైపుణ్యం డ్రాప్‌డౌన్ -->
          <select id="skill-filter-select" onchange="filterLabourJobs('skill', this.value)" style="padding:4px 8px; border-radius:6px; border:1px solid #81d4fa; font-size:12px; background:#fff; font-weight:600; color:#0277bd; outline:none;">
            <option value="all" ${activeSkillFilter === 'all' ? 'selected' : ''}>🛠️ అన్ని నైపుణ్యాలు (All Skills)</option>
            <option value="నాట్లు" ${activeSkillFilter === 'నాట్లు' ? 'selected' : ''}>🌱 నాట్లు వేయడం (Transplantation)</option>
            <option value="కలుపు" ${activeSkillFilter === 'కలుపు' ? 'selected' : ''}>🌿 కలుపు తీత (Weeding)</option>
            <option value="కోత" ${activeSkillFilter === 'కోత' ? 'selected' : ''}>🌾 పంట కోత (Harvesting)</option>
            <option value="స్ప్రే" ${activeSkillFilter === 'స్ప్రే' ? 'selected' : ''}>🚜 స్ప్రేయింగ్ / మందు కొట్టడం</option>
            <option value="పత్తి" ${activeSkillFilter === 'పత్తి' ? 'selected' : ''}>☁️ పత్తి ఏరడం (Picking)</option>
          </select>

          <!-- పరిధి డ్రాప్‌డౌన్ -->
          <select id="range-filter-select" onchange="filterLabourJobs('range', this.value)" style="padding:4px 8px; border-radius:6px; border:1px solid #81d4fa; font-size:12px; background:#fff; font-weight:600; color:#0277bd; outline:none;">
            <option value="all" ${activeLabourRangeFilter === 'all' ? 'selected' : ''}>📍 అన్ని ప్రాంతాలు</option>
            <option value="village" ${activeLabourRangeFilter === 'village' ? 'selected' : ''}>🏡 నా గ్రామం (2.5 కి.మీ)</option>
            <option value="5" ${activeLabourRangeFilter === '5' ? 'selected' : ''}>⚡ 5 కి.మీ లోపు</option>
            <option value="10" ${activeLabourRangeFilter === '10' ? 'selected' : ''}>🚶 10 కి.మీ లోపు</option>
          </select>
        </div>

        <span style="font-size:11px; background:#0288d1; color:#fff; padding:3px 8px; border-radius:12px; font-weight:600;">
          ${jobsData.length} పనులు
        </span>
      </div>

      <div class="labour-scroll labour-scroll-container">
        ${jobsData.length > 2 ? '<div class="scroll-hint-blue">👇 మరిన్ని పనుల కోసం scroll చేయండి</div>' : ''}

        ${jobsData.length === 0 ? `
          <div class="no-jobs-msg" style="text-align:center; padding:18px; color:#555; font-size:13px; background:#fff; border-radius:8px; border:1px dashed #90caf9;">
            📢 ఈ నైపుణ్యం / పరిధిలో ప్రస్తుతం పనులు లేవు.
          </div>
        ` : jobsData.map(j => {
          const isConf = j.status === "Confirmed";
          const lat = typeof j.lat === 'number' ? j.lat : 17.9784;
          const lng = typeof j.lng === 'number' ? j.lng : 79.5941;
          const villageName = j.village || "గ్రామం";
          const workDate = j.date ? `📅 ${j.date}` : "";

          return `
            <div class="job-card job-item-card ${isConf ? 'is-confirmed' : ''}" data-village="${villageName}">
              <div class="job-item-top">
                <div style="flex: 1;">
                  <strong class="job-item-title">🌾 ${j.crop} -${j.workType}</strong>
                  <div class="job-farmer-meta">
                    రైతు: <b>${j.farmerName}</b> \vert{} కూలీలు: <b>${j.count}</b>
                  </div>
                  <div class="job-tags-row">
                    <span class="badge-village">🏛️ ${villageName}</span>${workDate ? `<span class="badge-date">${workDate}</span>` : ''}
                  </div>
                </div>
                <div class="job-item-pricing">
                  <span class="job-wage-amount">₹${j.wage}/రోజు</span>
                  <div class="job-distance-tag">📍 ${j.distanceKm || '2.5'} కి.మీ</div>
                </div>
              </div>

              ${!isConf ? `
                <button onclick="acceptJob('${j.id}')" class="btn-accept-job">
                  ✅ పని Accept చేయండి
                </button>
              ` : `
                <div class="confirmed-job-details">
                  <div class="confirmed-title-text">🎉 పని ఖరారైంది (${j.labourName})! రైతుతో మాట్లాడండి:</div>
                  <div class="job-action-buttons">
                    <a href="tel:${j.farmerPhone}" class="btn-job-action btn-call-farmer">📞 కాల్</a>
                    <a href="sms:${j.farmerPhone}?body=నమస్తే" class="btn-job-action btn-sms-farmer">✉️ SMS</a>
                    <a href="https://wa.me/91${j.farmerPhone}" target="_blank" class="btn-job-action btn-whatsapp-farmer">💬 వాట్సాప్</a>
                    <button onclick="toggleMap('${j.id}')" id="mb-${j.id}" class="btn-job-action btn-map-toggle">🗺️ దారి Map (ON)</button>
                  </div>
                  <div id="m-${j.id}" class="job-map-container">
                    <div class="map-coords-text">📍 Location: (${lat.toFixed(3)}, ${lng.toFixed(3)})</div>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="btn-google-maps">🚀 Google Maps లో దారి చూడండి</a>
                  </div>
                </div>
              `}
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

// ఫిల్టర్ ఈవెంట్ హ్యాండ్లర్
window.filterLabourJobs = function(type, value) {
  if (type === 'skill') {
    activeSkillFilter = value;
  } else if (type === 'range') {
    activeLabourRangeFilter = value;
  }
  renderLabourWidget();
};

window.acceptJob = function(id) {
  let name = "";
  let phone = "";

  if (window.AppState && window.AppState.userProfile) {
    name = window.AppState.userProfile.name;
    phone = window.AppState.userProfile.phone;
  }

  if (!name || !phone) {
    name = prompt("మీ పేరు:", "రాము");
    if (!name) return;
    phone = prompt("ఫోన్ నంబర్:", "9876543211");
    if (!phone) return;
  }

  let acceptedJobObj = null;

  if (window.AgriState && typeof window.AgriState.getJobs === "function") {
    const jobs = window.AgriState.getJobs();
    const j = jobs.find(x => x.id === id);
    if (j) {
      j.status = "Confirmed";
      j.labourName = name;
      j.labourPhone = phone;
      acceptedJobObj = j;
    }
  }

  try {
    let localJobs = JSON.parse(localStorage.getItem("agri_jobs") || "[]");
    const localJ = localJobs.find(x => x.id === id);
    if (localJ) {
      localJ.status = "Confirmed";
      localJ.labourName = name;
      localJ.labourPhone = phone;
      localStorage.setItem("agri_jobs", JSON.stringify(localJobs));
      if (!acceptedJobObj) acceptedJobObj = localJ;
    }
  } catch (e) {}

  if (acceptedJobObj && typeof window.lockJobToEscrow === "function") {
    window.lockJobToEscrow(acceptedJobObj, name);
  }

  renderLabourWidget();
  if (typeof renderFarmerWidget === "function") renderFarmerWidget();
  if (typeof renderWalletWidget === "function") renderWalletWidget();

  if (typeof speakTeluguText === "function") {
    speakTeluguText("పని విజయవంతంగా ఖరారైంది. రైతు ఖాతాలో కూలీ రక్షణ లాక్ చేయబడింది.");
  }
};

window.toggleMap = function(id) {
  const b = document.getElementById("m-" + id);
  const btn = document.getElementById("mb-" + id);
  if (!b || !btn) return;
  if (b.style.display === "none" || b.style.display === "") {
    b.style.display = "block";
    btn.innerText = "✖️ Map (OFF)";
    btn.style.background = "#ffebee";
  } else {
    b.style.display = "none";
    btn.innerText = "🗺️ దారి Map (ON)";
    btn.style.background = "#fff3e0";
  }
};

window.renderLabourWidget = renderLabourWidget;
