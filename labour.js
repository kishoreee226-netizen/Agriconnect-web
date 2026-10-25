// labour.js - Labour Mode Dashboard (Alerts, Duty Toggle, Auto Profile Sync & Acceptance)

let postedFarmerJobs = [];
let isJobsListenerActive = false;
let rejectedJobIds = [];

// Local rejected jobs read cheyadam
try {
  const rej = localStorage.getItem("agri_labour_rejected_jobs");
  rejectedJobIds = rej ? JSON.parse(rej) : [];
} catch (e) {
  rejectedJobIds = [];
}

// 1. Helper: Safe Labour Profile Getter
function getActiveLabourProfile() {
  if (typeof window.getLabourProfile === "function") {
    const prof = window.getLabourProfile();
    if (prof) return prof;
  }

  const appProf = window.AppState?.userProfile;
  let isDuty = true;
  try {
    const savedDuty = localStorage.getItem("agri_labour_duty_status");
    if (savedDuty !== null) isDuty = (savedDuty === "true");
  } catch (e) {}

  if (appProf) {
    return {
      name: appProf.name || "కూలీ",
      phone: appProf.phone || "9876543210",
      village: appProf.village || "",
      isDutyOn: isDuty
    };
  }

  return { name: "కూలీ", phone: "9876543210", village: "", isDutyOn: isDuty };
}

// 2. Duty Status Toggle Function (Missing Fix)
window.toggleLabourDutyStatus = function() {
  const prof = getActiveLabourProfile();
  const nextStatus = !prof.isDutyOn;

  try {
    localStorage.setItem("agri_labour_duty_status", String(nextStatus));
    const storedProf = localStorage.getItem("agri_labour_profile");
    if (storedProf) {
      const parsed = JSON.parse(storedProf);
      parsed.isDutyOn = nextStatus;
      localStorage.setItem("agri_labour_profile", JSON.stringify(parsed));
    }
  } catch (e) {}

  if (typeof speakTeluguText === "function") {
    speakTeluguText(nextStatus ? "డ్యూటీ ఆన్ చేయబడింది. పనుల అలర్ట్స్ లైవ్ లో ఉన్నాయి." : "డ్యూటీ ఆఫ్ చేయబడింది.");
  }

  renderLabourWidget();
};

// 3. Real-time Central AgriDB Listener
function initJobsListener() {
  if (isJobsListenerActive) return;

  // 1. సెంట్రల్ AgriDB ద్వారా సింక్ చేయడం
  if (window.AgriDB && typeof window.AgriDB.listenToLabourJobs === 'function') {
    isJobsListenerActive = true;
    window.AgriDB.listenToLabourJobs((list) => {
      postedFarmerJobs = list;
      localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(list));
      renderLabourWidget();
    });
  } 
  // 2. ఒకవేళ AgriDB లోడ్ అవ్వకపోతే డైరెక్ట్ ఫైర్‌స్టోర్ ఫాల్‌బ్యాక్
  else if (window.db) {
    isJobsListenerActive = true;
    window.db.collection("farmer_posted_jobs").onSnapshot(snapshot => {
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      postedFarmerJobs = list;
      localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(list));
      renderLabourWidget();
    });
  } 
  // 3. ఆఫ్‌లైన్ లోకల్ స్టోరేజ్
  else {
    try {
      const stored = localStorage.getItem("agri_farmer_posted_jobs");
      postedFarmerJobs = stored ? JSON.parse(stored) : [];
      renderLabourWidget();
    } catch (e) {}
  }
}

// 4. Main Labour Widget Renderer
function renderLabourWidget() {
  const container = document.getElementById("labour-jobs-container");
  if (!container) return;

  if (!isJobsListenerActive && window.db) {
    initJobsListener();
    return;
  }

  const myProf = getActiveLabourProfile();

  // Open panulu (Reject chesinavi kakunda, status Open unnavi)
  const openJobs = postedFarmerJobs.filter(j => 
    j.status === "Open" && !rejectedJobIds.includes(j.id)
  );

  // Ee kooli confirm chesukuna panulu
  const myConfirmedJobs = postedFarmerJobs.filter(j => 
    j.confirmedLabours && j.confirmedLabours.some(l => l.phone === myProf.phone)
  );

  container.innerHTML = `
    <div class="labour-card">
      
      <!-- Duty Switch Bar -->
      <div style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:8px; padding:10px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:12px; font-weight:bold; color:#2e7d32;">కూలీ డ్యూటీ:</span>
          <button type="button" onclick="window.toggleLabourDutyStatus()" style="padding:5px 12px; border-radius:14px; border:none; font-size:11px; font-weight:bold; cursor:pointer; background:${myProf.isDutyOn ? '#2e7d32' : '#c62828'}; color:#fff; box-shadow:0 1px 3px rgba(0,0,0,0.15);">
            ${myProf.isDutyOn ? '🟢 డ్యూటీ ON (లైవ్)' : '🔴 డ్యూటీ OFF'}
          </button>
        </div>
        <button type="button" onclick="if(typeof openLabourProfileModal === 'function') openLabourProfileModal();" style="background:#0288d1; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">
          ⚙️ నా పనులు మార్చుకోండి
        </button>
      </div>

      <!-- 📢 Raithu Job Alerts -->
      <div style="margin-bottom:14px;">
        <div style="font-size:13px; font-weight:bold; color:#0277bd; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <span>📢 సమీప రైతుల పనుల అలర్ట్స్:</span>
          <span style="font-size:11px; background:#e1f5fe; color:#0277bd; padding:2px 8px; border-radius:10px; font-weight:bold;">${myProf.isDutyOn ? openJobs.length : 0} పనులు</span>
        </div>

        ${!myProf.isDutyOn ? `
          <div style="background:#ffebee; border:1px dashed #ef5350; border-radius:8px; padding:14px; text-align:center; font-size:12px; color:#c62828; line-height:1.5;">
            🛑 మీ డ్యూటీ <b>OFF</b> లో ఉంది.<br>పనుల అలర్ట్స్ అందుకోవడానికి మరియు రైతులకు లైవ్‌గా కనిపించడానికి పైన డ్యూటీ <b>ON</b> చేసుకోండి.
          </div>
        ` : openJobs.length === 0 ? `
          <div style="background:#fff; border:1px dashed #b0bec5; border-radius:8px; padding:14px; text-align:center; font-size:12px; color:#607d8b;">
            ప్రస్తుతం మీ ప్రాంతంలో కొత్త పనుల అలర్ట్స్ ఏవీ లేవు.
          </div>
        ` : openJobs.map(job => {
          const filledCount = job.confirmedLabours ? job.confirmedLabours.length : 0;
          const reqCount = parseInt(job.totalRequired || job.count || 1);
          const isAlreadyAccepted = job.confirmedLabours && job.confirmedLabours.some(l => l.phone === myProf.phone);

          return `
            <div class="job-card" style="background:#fff; border:1px solid #e0e0e0; border-left:4px solid #0288d1; border-radius:8px; padding:10px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h4 style="margin:0; color:#0277bd; font-size:13px;">🌾 ${job.crop} -${job.workType}</h4>
                  <div style="font-size:11px; color:#424242; margin-top:3px;">
                    రైతు: <b>${job.farmerName}</b> | 📍 గ్రామం: <b>${job.village || 'సమీప గ్రామం'}</b>
                  </div>
                  <div style="font-size:11px; color:#d84315; margin-top:2px; font-weight:bold;">
                    📅 పని తేదీ: ${job.workDate || job.date || 'ఈ రోజు'} | 🛵 ${job.transportNote || 'రవాణా సదుపాయం కలదు'}
                  </div>
                  <div style="font-size:11px; color:#2e7d32; margin-top:3px;">
                    👥 కూలీల కోటా: <b>${filledCount} /${reqCount} భర్తీ అయ్యారు</b>
                  </div>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:13px; font-weight:bold; color:#e65100;">₹${job.wage}/రోజు</span>
                </div>
              </div>

              <!-- Accept / Reject Actions -->
              <div style="margin-top:10px; display:flex; gap:8px;">
                ${isAlreadyAccepted ? `
                  <button type="button" disabled style="flex:1; background:#c8e6c9; color:#2e7d32; border:none; padding:7px; border-radius:6px; font-size:12px; font-weight:bold;">
                    ✅ మీరు ఇప్పటికే అంగీకరించారు
                  </button>
                ` : `
                  <button type="button" onclick="window.acceptFarmerJob('${job.id}')" style="flex:1; background:#2e7d32; color:#fff; border:none; padding:7px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">
                    ✅ పని Accept చేయండి
                  </button>
                  <button type="button" onclick="window.rejectFarmerJob('${job.id}')" style="background:#f5f5f5; color:#616161; border:1px solid #ccc; padding:7px 12px; border-radius:6px; font-size:12px; cursor:pointer;">
                    ❌ తిరస్కరించు
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 🎉 Confirmed Work Details -->
      ${myConfirmedJobs.length > 0 ? `
        <div style="background:#f1f8e9; border:1px solid #c5e1a5; border-radius:8px; padding:10px; margin-top:10px;">
          <h4 style="margin:0 0 8px 0; color:#33691e; font-size:12px;">🎉 మీరు ఒప్పుకున్న ఖరారైన పనులు:</h4>
          ${myConfirmedJobs.map(c => `
            <div style="background:#fff; padding:8px; border-radius:6px; margin-bottom:6px; border:1px solid #dcedc8;">
              <div style="font-size:12px; font-weight:bold; color:#1b5e20;">${c.crop} - ${c.workType} (📅 ${c.workDate || c.date})</div>
              <div style="font-size:11px; color:#555; margin-top:2px;">రైతు: <b>${c.farmerName}</b> (${c.village}) | వేతనం: ₹${c.wage}/రోజు</div>
              <div style="display:flex; gap:6px; margin-top:6px;">
                <a href="tel:${c.farmerPhone}" style="flex:1; text-align:center; background:#0288d1; color:#fff; padding:5px; border-radius:4px; font-size:11px; text-decoration:none; font-weight:bold;">📞 రైతుకు కాల్</a>
                <a href="https://wa.me/91${c.farmerPhone}" target="_blank" style="flex:1; text-align:center; background:#25d366; color:#fff; padding:5px; border-radius:4px; font-size:11px; text-decoration:none; font-weight:bold;">💬 వాట్సాప్</a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.village || 'Telangana')}" target="_blank" style="flex:1; text-align:center; background:#f57c00; color:#fff; padding:5px; border-radius:4px; font-size:11px; text-decoration:none; font-weight:bold;">🗺️ రూట్ Map</a>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

    </div>
  `;
}

// 5. Job Accept Logic
window.acceptFarmerJob = function(jobId) {
  const myProf = getActiveLabourProfile();
  const targetJob = postedFarmerJobs.find(j => j.id === jobId);
  if (!targetJob) return;

  const currentList = targetJob.confirmedLabours || [];
  if (currentList.some(l => l.phone === myProf.phone)) {
    alert("మీరు ఇప్పటికే ఈ పనిని ఒప్పుకున్నారు.");
    return;
  }

  currentList.push({
    name: myProf.name,
    phone: myProf.phone,
    acceptedAt: Date.now()
  });

  const reqCount = parseInt(targetJob.totalRequired || targetJob.count || 1);
  const isFull = currentList.length >= reqCount;
  const updatePayload = {
    confirmedLabours: currentList,
    status: isFull ? "Filled" : "Open"
  };

  // Firebase update
  if (window.db && !jobId.startsWith("job_") && !jobId.startsWith("JOB-")) {
    window.db.collection("farmer_posted_jobs").doc(jobId).update(updatePayload).catch(err => {
      console.warn("Cloud update failed, updating locally:", err);
    });
  }

  // Local storage sync
  Object.assign(targetJob, updatePayload);
  localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(postedFarmerJobs));

  // Render both screens
  renderLabourWidget();
  if (typeof window.renderFarmerWidget === "function") window.renderFarmerWidget();

  if (typeof speakTeluguText === "function") {
    speakTeluguText("పనిని విజయవంతంగా ఒప్పుకున్నారు. రైతు వివరాలు మీ స్క్రీన్‌లో చేర్చబడ్డాయి.");
  } else {
    alert("🎉 పని ఖరారైంది! రైతు వివరాలు క్రింద జతచేయబడ్డాయి.");
  }
};

// 6. Job Reject Logic
window.rejectFarmerJob = function(jobId) {
  if (!rejectedJobIds.includes(jobId)) {
    rejectedJobIds.push(jobId);
    try {
      localStorage.setItem("agri_labour_rejected_jobs", JSON.stringify(rejectedJobIds));
    } catch (e) {}
  }
  renderLabourWidget();
  alert("ఈ పని జాబితా నుండి తొలగించబడింది.");
};

// // Initialize
window.renderLabourWidget = renderLabourWidget;

// Kevalam user login ayyi, Kooli role lo unnapudu matrame listener run avvali
if (window.AppState?.isLoggedIn && (window.AppState?.currentRole === "LABOUR" || window.AppState?.userType === "LABOURONLY")) {
  initJobsListener();
}
