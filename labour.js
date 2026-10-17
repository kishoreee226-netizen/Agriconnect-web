// labour.js - Koolila Dashboard (Filters, List View & Escrow Actions)

const defaultLabourJobs = [
  {
    id: "job_def_1",
    crop: "వరి (Paddy)",
    workType: "కోత",
    farmerName: "కిషోర్",
    farmerPhone: "9876543210",
    count: 2,
    wage: 450,
    distanceKm: 2.4,
    village: "Wrafj",
    date: "రేపు",
    ownTransport: false,
    transportNote: "రవాణా అవసరం",
    status: "Confirmed",
    labourName: "రాము (టెస్ట్ కూలీ)"
  },
  {
    id: "job_def_2",
    crop: "పత్తి (Cotton)",
    workType: "ఏరడం",
    farmerName: "రమేష్",
    farmerPhone: "9876543211",
    count: 5,
    wage: 500,
    distanceKm: 4.2,
    village: "వరంగల్",
    date: "ఎల్లుండి",
    ownTransport: true,
    transportNote: "సొంత బండి ఉంది",
    status: "Open"
  }
];

let cachedLabourJobs = [];
let isFirebaseLabourSubscribed = false;

// Global Filter States
let activeSkillFilter = "all";
let activeLabourRangeFilter = "all";
let activeGangFilter = "all";
let activeWageFilter = "all";
let activeTransportFilterOpt = "all";

function initLabourDataListener() {
  if (isFirebaseLabourSubscribed) return;

  try {
    const local = localStorage.getItem("agri_jobs");
    cachedLabourJobs = local ? JSON.parse(local) : defaultLabourJobs;
  } catch (e) {
    cachedLabourJobs = defaultLabourJobs;
  }

  if (window.db) {
    isFirebaseLabourSubscribed = true;
    window.db.collection("labour_jobs")
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          const cloudJobs = [];
          snapshot.forEach(doc => {
            cloudJobs.push({ id: doc.id, ...doc.data() });
          });
          cachedLabourJobs = cloudJobs;
          localStorage.setItem("agri_jobs", JSON.stringify(cloudJobs));
        } else {
          defaultLabourJobs.forEach(job => {
            const { id, ...data } = job;
            window.db.collection("labour_jobs").doc(id).set(data);
          });
          cachedLabourJobs = defaultLabourJobs;
        }
        renderLabourWidget();
      }, (err) => {
        console.warn("Firestore error, local fallback active:", err);
        renderLabourWidget();
      });
  } else {
    renderLabourWidget();
  }
}

function renderLabourWidget() {
  const container = document.getElementById("labour-jobs-container");
  if (!container) return;

  if (!isFirebaseLabourSubscribed && window.db) {
    initLabourDataListener();
    return;
  }

  const jobsData = cachedLabourJobs.filter(j => {
    let skillMatch = true;
    if (activeSkillFilter !== "all") {
      const fullWorkText = `${j.crop || ''} ${j.workType || ''}`.toLowerCase();
      skillMatch = fullWorkText.includes(activeSkillFilter.toLowerCase());
    }

    let rangeMatch = true;
    const dist = parseFloat(j.distanceKm || "2.5");
    if (activeLabourRangeFilter === "village") {
      rangeMatch = dist <= 2.5;
    } else if (activeLabourRangeFilter === "5") {
      rangeMatch = dist <= 5.0;
    } else if (activeLabourRangeFilter === "10") {
      rangeMatch = dist <= 10.0;
    }

    let gangMatch = true;
    const count = parseInt(j.count || 1);
    if (activeGangFilter === "small") {
      gangMatch = count <= 5;
    } else if (activeGangFilter === "medium") {
      gangMatch = count >= 6 && count <= 10;
    } else if (activeGangFilter === "large") {
      gangMatch = count > 10;
    }

    let wageMatch = true;
    const wage = parseFloat(j.wage || 0);
    if (activeWageFilter === "low") {
      wageMatch = wage <= 400;
    } else if (activeWageFilter === "mid") {
      wageMatch = wage > 400 && wage <= 600;
    } else if (activeWageFilter === "high") {
      wageMatch = wage > 600;
    }

    let transMatch = true;
    const hasOwnTransport = j.ownTransport === true || (j.transportNote && j.transportNote.includes("సొంత"));
    if (activeTransportFilterOpt === "own") {
      transMatch = hasOwnTransport;
    } else if (activeTransportFilterOpt === "needed") {
      transMatch = !hasOwnTransport;
    }

    return skillMatch && rangeMatch && gangMatch && wageMatch && transMatch;
  });

  container.innerHTML = `
    <div class="labour-card">
      
      <!-- Top Header with Post Button -->
      <div class="labour-card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <h3 style="margin:0;">👷 కూలీల Dashboard (Live Jobs)</h3>
          <span class="badge-live-blue">Live Feed</span>
        </div>
        <button onclick="openLabourPostModal()" style="background:#0288d1; color:#fff; border:none; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:bold; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.15);">
          ➕ పనిని పోస్ట్ చేయండి
        </button>
      </div>

      <!-- Filters Section Container -->
      <div class="labour-filter-bar" style="background:#e1f5fe; padding:10px; border-radius:8px; margin:10px 0; border:1px solid #b3e5fc;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:bold; color:#0277bd; white-space:nowrap;">🎯 అడ్వాన్స్ ఫిల్టర్లు:</span>
          
          <div style="display:flex; align-items:center; gap:6px;">
            <select onchange="applyAdvLabourFilter('range', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #81d4fa; font-size:11px; background:#fff; font-weight:600; color:#0277bd; outline:none; max-width:140px;">
              <option value="all" ${activeLabourRangeFilter === 'all' ? 'selected' : ''}>📍 పరిధి (అన్నీ)</option>
              <option value="village" ${activeLabourRangeFilter === 'village' ? 'selected' : ''}>🏡 నా గ్రామం (2.5km)</option>
              <option value="5" ${activeLabourRangeFilter === '5' ? 'selected' : ''}>⚡ 5 కి.మీ లోపు</option>
              <option value="10" ${activeLabourRangeFilter === '10' ? 'selected' : ''}>🚶 10 కి.మీ లోపు</option>
            </select>

            <span style="font-size:11px; background:#0288d1; color:#fff; padding:3px 8px; border-radius:12px; font-weight:bold; white-space:nowrap;">
              ${jobsData.length} లభ్యం
            </span>
          </div>
        </div>

        <!-- 4 Advance Filters (2x2 Grid) -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
          <select onchange="applyAdvLabourFilter('skill', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #81d4fa; font-size:11px; background:#fff; font-weight:600; color:#0277bd; outline:none;">
            <option value="all" ${activeSkillFilter === 'all' ? 'selected' : ''}>🛠️ అన్ని పనులు</option>
            <option value="నాట్లు" ${activeSkillFilter === 'నాట్లు' ? 'selected' : ''}>🌱 నాట్లు వేయడం</option>
            <option value="కలుపు" ${activeSkillFilter === 'కలుపు' ? 'selected' : ''}>🌿 కలుపు తీత</option>
            <option value="కోత" ${activeSkillFilter === 'కోత' ? 'selected' : ''}>🌾 పంట కోత</option>
            <option value="స్ప్రే" ${activeSkillFilter === 'స్ప్రే' ? 'selected' : ''}>🚜 స్ప్రేయింగ్/మందు</option>
            <option value="పత్తి" ${activeSkillFilter === 'పత్తి' ? 'selected' : ''}>☁️ పత్తి ఏరడం</option>
          </select>

          <select onchange="applyAdvLabourFilter('gang', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #81d4fa; font-size:11px; background:#fff; font-weight:600; color:#0277bd; outline:none;">
            <option value="all" ${activeGangFilter === 'all' ? 'selected' : ''}>👥 బృందం (అన్నీ)</option>
            <option value="small" ${activeGangFilter === 'small' ? 'selected' : ''}>👤 1-5 మంది కూలీలు</option>
            <option value="medium" ${activeGangFilter === 'medium' ? 'selected' : ''}>👥 6-10 మంది బృందం</option>
            <option value="large" ${activeGangFilter === 'large' ? 'selected' : ''}>👨‍👩‍👧‍👦 10+ పెద్ద గ్యాంగ్</option>
          </select>

          <select onchange="applyAdvLabourFilter('wage', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #81d4fa; font-size:11px; background:#fff; font-weight:600; color:#0277bd; outline:none;">
            <option value="all" ${activeWageFilter === 'all' ? 'selected' : ''}>💰 కూలీ రేటు (అన్నీ)</option>
            <option value="low" ${activeWageFilter === 'low' ? 'selected' : ''}>₹400 లోపు</option>
            <option value="mid" ${activeWageFilter === 'mid' ? 'selected' : ''}>₹400 - ₹600</option>
            <option value="high" ${activeWageFilter === 'high' ? 'selected' : ''}>₹600 పైబడి</option>
          </select>

          <select onchange="applyAdvLabourFilter('trans', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #81d4fa; font-size:11px; background:#fff; font-weight:600; color:#0277bd; outline:none;">
            <option value="all" ${activeTransportFilterOpt === 'all' ? 'selected' : ''}>🛵 రవాణా (అన్నీ)</option>
            <option value="own" ${activeTransportFilterOpt === 'own' ? 'selected' : ''}>🏍️ సొంత బండి</option>
            <option value="needed" ${activeTransportFilterOpt === 'needed' ? 'selected' : ''}>🛺 రవాణా అవసరం</option>
          </select>
        </div>
      </div>

      <!-- Jobs List -->
      <div class="labour-scroll labour-scroll-container">
        ${jobsData.length > 2 ? '<div class="scroll-hint-blue">👇 మరిన్ని పనుల కోసం scroll చేయండి</div>' : ''}

        ${jobsData.length === 0 ? `
          <div class="no-jobs-msg" style="text-align:center; padding:18px; color:#555; font-size:13px; background:#fff; border-radius:8px; border:1px dashed #90caf9;">
            📢 మీరు ఎంచుకున్న పరిధి / ఫిల్టర్లకు సరిపడే పనులు ప్రస్తుతం లేవు.
          </div>
        ` : jobsData.map(j => {
          const isConf = j.status === "Confirmed";
          const lat = typeof j.lat === 'number' ? j.lat : 17.9784;
          const lng = typeof j.lng === 'number' ? j.lng : 79.5941;
          const villageName = j.village || "గ్రామం";
          const workDate = j.date ? `📅 ${j.date}` : "";
          const hasOwn = j.ownTransport === true || (j.transportNote && j.transportNote.includes("సొంత"));

          return `
            <div class="job-card job-item-card ${isConf ? 'is-confirmed' : ''}" data-village="${villageName}">
              <div class="job-item-top">
                <div style="flex: 1;">
                  <strong class="job-item-title">🌾 ${j.crop} -${j.workType}</strong>
                  <div class="job-farmer-meta">
                    రైతు/యజమాని: <b>${j.farmerName}</b> \vert{} కూలీలు: <b>${j.count}</b>
                  </div>
                  <div class="job-tags-row" style="margin-top:4px; display:flex; gap:4px; flex-wrap:wrap;">
                    <span class="badge-village">🏛️ ${villageName}</span>${workDate ? `<span class="badge-date">${workDate}</span>` : ''}
                    <span style="font-size:10px; background:#e0f2f1; color:#00695c; padding:2px 5px; border-radius:4px;">${hasOwn ? '🛵 సొంత బండి' : '🛺 రవాణా అవసరం'}</span>
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
                  <div class="confirmed-title-text">🎉 పని ఖరారైంది (${j.labourName || 'కూలీ'})! మాట్లాడండి:</div>
                  <div class="job-action-buttons">
                    <a href="tel:${j.farmerPhone}" class="btn-job-action btn-call-farmer">📞 కాల్</a>
                    <a href="sms:${j.farmerPhone}?body=నమస్తే" class="btn-job-action btn-sms-farmer">✉️ SMS</a>
                    <a href="https://wa.me/91${j.farmerPhone}" target="_blank" class="btn-job-action btn-whatsapp-farmer">💬 వాట్సాప్</a>
                    <button onclick="toggleMap('${j.id}')" id="mb-${j.id}" class="btn-job-action btn-map-toggle">🗺️ దారి Map (ON)</button>
                  </div>
                  <div id="m-${j.id}" class="job-map-container" style="display:none; margin-top:8px; padding:8px; background:#e8eaf6; border-radius:6px;">
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

// Filter Event Handler
window.applyAdvLabourFilter = function(key, val) {
  if (key === 'range') activeLabourRangeFilter = val;
  if (key === 'skill') activeSkillFilter = val;
  if (key === 'gang') activeGangFilter = val;
  if (key === 'wage') activeWageFilter = val;
  if (key === 'trans') activeTransportFilterOpt = val;
  renderLabourWidget();
};

// Accept Job -> Cloud Update
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

  const jobObj = cachedLabourJobs.find(x => x.id === id);

  if (window.db && id && !id.startsWith("job_def_")) {
    window.db.collection("labour_jobs").doc(id).update({
      status: "Confirmed",
      labourName: name,
      labourPhone: phone
    });
  } else {
    if (jobObj) {
      jobObj.status = "Confirmed";
      jobObj.labourName = name;
      jobObj.labourPhone = phone;
      localStorage.setItem("agri_jobs", JSON.stringify(cachedLabourJobs));
      renderLabourWidget();
    }
  }

  if (jobObj && typeof window.lockJobToEscrow === "function") {
    window.lockJobToEscrow(jobObj, name);
  }

  if (typeof renderFarmerWidget === "function") renderFarmerWidget();
  if (typeof renderWalletWidget === "function") renderWalletWidget();

  if (typeof speakTeluguText === "function") {
    speakTeluguText("పని ఖరారైంది. వివరాలు క్లౌడ్‌లో అప్‌డేట్ అయ్యాయి.");
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

initLabourDataListener();
window.renderLabourWidget = renderLabourWidget;
