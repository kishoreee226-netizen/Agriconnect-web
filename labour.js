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

// 1. Helper: Safe Labour Profile Getter (No Dummy Phone)
function getActiveLabourProfile() {
  if (typeof window.getLabourProfile === "function") {
    const prof = window.getLabourProfile();
    if (prof && prof.phone) return prof;
  }

  const appProf = window.AppState?.userProfile;
  const activePhone = (typeof window.getActiveUserPhone === "function")
    ? window.getActiveUserPhone()
    : (appProf?.phone || "");

  let isDuty = true;
  try {
    const savedDuty = localStorage.getItem("agri_labour_duty_status");
    if (savedDuty !== null) isDuty = (savedDuty === "true");
  } catch (e) {}

  return {
    name: appProf?.name || "కూలీ",
    phone: activePhone,
    village: appProf?.village || "",
    isDutyOn: isDuty
  };
}

// 2. Duty Status Toggle Function
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
      postedFarmerJobs = list || [];
      localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(postedFarmerJobs));
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
    }, err => {
      console.warn("Labour jobs listener notice:", err);
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
    myProf.phone && j.confirmedLabours && j.confirmedLabours.some(l => l.phone === myProf.phone)
  );

  container.innerHTML = `
    <div class="labour-card">
      
      <!-- Duty Switch Bar -->
      <div class="labour-duty-bar">
        <div class="labour-duty-left">
          <span class="labour-duty-label">కూలీ డ్యూటీ:</span>
          <button type="button" onclick="window.toggleLabourDutyStatus()" class="btn-duty-toggle ${myProf.isDutyOn ? 'on' : 'off'}">
            ${myProf.isDutyOn ? '🟢 డ్యూటీ ON (లైవ్)' : '🔴 డ్యూటీ OFF'}
          </button>
        </div>
        <button type="button" onclick="if(typeof openLabourProfileModal === 'function') openLabourProfileModal();" class="btn-labour-skills">
          ⚙️ నా పనులు మార్చుకోండి
        </button>
      </div>

      <!-- 📢 Raithu Job Alerts -->
      <div class="labour-alerts-section">
        <div class="labour-alerts-header">
          <span>📢 సమీప రైతుల పనుల అలర్ట్స్:</span>
          <span class="labour-alerts-badge">${myProf.isDutyOn ? openJobs.length : 0} పనులు</span>
        </div>

        ${!myProf.isDutyOn ? `
          <div class="labour-duty-off-card">
            🛑 మీ డ్యూటీ <b>OFF</b> లో ఉంది.<br>పనుల అలర్ట్స్ అందుకోవడానికి మరియు రైతులకు లైవ్‌గా కనిపించడానికి పైన డ్యూటీ <b>ON</b> చేసుకోండి.
          </div>
        ` : openJobs.length === 0 ? `
          <div class="labour-empty-jobs-card">
            ప్రస్తుతం మీ ప్రాంతంలో కొత్త పనుల అలర్ట్స్ ఏవీ లేవు.
          </div>
        ` : openJobs.map(job => {
          const filledCount = job.confirmedLabours ? job.confirmedLabours.length : 0;
          const reqCount = parseInt(job.totalRequired || job.count || 1);
          const isAlreadyAccepted = Boolean(myProf.phone && job.confirmedLabours && job.confirmedLabours.some(l => l.phone === myProf.phone));

          return `
            <div class="labour-job-card">
              <div class="labour-job-card-top">
                <div>
                  <h4 class="labour-job-title">🌾 ${job.crop} - ${job.workType}</h4>
                  <div class="labour-job-farmer-info">
                    రైతు: <b>${job.farmerName}</b> | 📍 గ్రామం: <b>${job.village || 'సమీప గ్రామం'}</b>
                  </div>
                  <div class="labour-job-schedule">
                    📅 పని తేదీ: ${job.workDate || job.date || 'ఈ రోజు'} | 🛵 ${job.transportNote || 'రవాణా సదుపాయం కలదు'}
                  </div>
                  <div class="labour-job-quota">
                    👥 కూలీల కోటా: <b>${filledCount} / ${reqCount} భర్తీ అయ్యారు</b>
                  </div>
                </div>
                <div class="labour-job-wage">
                  <span>₹${job.wage}/రోజు</span>
                </div>
              </div>

              <!-- Accept / Reject Actions -->
              <div class="labour-job-actions">
                ${isAlreadyAccepted ? `
                  <button type="button" disabled class="btn-job-accepted-disabled">
                    ✅ మీరు ఇప్పటికే అంగీకరించారు
                  </button>
                ` : `
                  <button type="button" onclick="window.acceptFarmerJob('${job.id}')" class="btn-job-accept">
                    ✅ పని Accept చేయండి
                  </button>
                  <button type="button" onclick="window.rejectFarmerJob('${job.id}')" class="btn-job-reject">
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
        <div class="labour-confirmed-section">
          <h4 class="labour-confirmed-heading">🎉 మీరు ఒప్పుకున్న ఖరారైన పనులు:</h4>
          ${myConfirmedJobs.map(c => `
            <div class="labour-confirmed-card">
              <div class="labour-confirmed-title">${c.crop} - ${c.workType} (📅 ${c.workDate || c.date})</div>
              <div class="labour-confirmed-sub">రైతు: <b>${c.farmerName}</b> (${c.village || 'స్థానిక పరిధి'}) | వేతనం: ₹${c.wage}/రోజు</div>
              <div class="labour-confirmed-btn-row">
                <a href="tel:${c.farmerPhone}" class="labour-cbtn labour-cbtn-call">📞 రైతుకు కాల్</a>
                <a href="https://wa.me/91${c.farmerPhone}" target="_blank" class="labour-cbtn labour-cbtn-wa">💬 వాట్సాప్</a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.village || myProf.village || '')}" target="_blank" class="labour-cbtn labour-cbtn-map">🗺️ రూట్ Map</a>
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
  
  if (!myProf.phone) {
    alert("పనిని అంగీకరించడానికి దయచేసి ముందుగా మీ మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి.");
    return;
  }

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

// Initialize
window.renderLabourWidget = renderLabourWidget;

// Kevalam user login ayyi, Kooli role lo unnapudu matrame listener run avvali
if (window.AppState?.isLoggedIn && (window.AppState?.currentRole === "LABOUR" || window.AppState?.userType === "LABOUR_ONLY")) {
  initJobsListener();
}
