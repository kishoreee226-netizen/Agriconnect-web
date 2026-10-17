// labour.js - Labour Mode Dashboard (Alerts & Acceptance Only)

let postedFarmerJobs = [];
let isJobsListenerActive = false;

function initJobsListener() {
  if (isJobsListenerActive) return;

  if (window.db) {
    isJobsListenerActive = true;
    window.db.collection("farmer_posted_jobs").onSnapshot(snapshot => {
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      postedFarmerJobs = list;
      renderLabourWidget();
    });
  } else {
    try {
      const stored = localStorage.getItem("agri_farmer_posted_jobs");
      postedFarmerJobs = stored ? JSON.parse(stored) : [];
    } catch (e) {}
    renderLabourWidget();
  }
}

function renderLabourWidget() {
  const container = document.getElementById("labour-jobs-container");
  if (!container) return;

  if (!isJobsListenerActive && window.db) {
    initJobsListener();
    return;
  }

  const myProf = (typeof getLabourProfile === "function") ? getLabourProfile() : { isDutyOn: true, name: "కూలీ" };

  // ఇంకా ఖాళీలు ఉన్న పనులు (Open Alerts)
  const openJobs = postedFarmerJobs.filter(j => j.status === "Open");

  // కూలీ ఒప్పుకున్న పనులు
  const myConfirmedJobs = postedFarmerJobs.filter(j => 
    j.confirmedLabours && j.confirmedLabours.some(l => l.phone === myProf.phone)
  );

  container.innerHTML = `
    <div class="labour-card">
      
      <!-- కూలీ కంట్రోల్ బార్: కేవలం డ్యూటీ స్విచ్ & ప్రొఫైల్ ఎడిట్ మాత్రమే -->
      <div style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:8px; padding:10px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:12px; font-weight:bold; color:#2e7d32;">కూలీ డ్యూటీ:</span>
          <button onclick="toggleLabourDutyStatus()" style="padding:4px 10px; border-radius:14px; border:none; font-size:11px; font-weight:bold; cursor:pointer; background:${myProf.isDutyOn ? '#2e7d32' : '#c62828'}; color:#fff;">
            ${myProf.isDutyOn ? '🟢 డ్యూటీ ON (లైవ్)' : '🔴 డ్యూటీ OFF'}
          </button>
        </div>
        <button onclick="openLabourProfileModal()" style="background:#0288d1; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">
          ⚙️ నా పనులు మార్చుకోండి
        </button>
      </div>

      <!-- 📢 రైతు పోస్ట్ చేసిన పనుల అలర్ట్స్ -->
      <div style="margin-bottom:14px;">
        <div style="font-size:13px; font-weight:bold; color:#0277bd; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <span>📢 సమీప రైతుల పనుల అలర్ట్స్:</span>
          <span style="font-size:11px; background:#e1f5fe; color:#0277bd; padding:2px 8px; border-radius:10px;">${openJobs.length} పనులు</span>
        </div>

        ${!myProf.isDutyOn ? `
          <div style="background:#ffebee; border:1px dashed #ef5350; border-radius:8px; padding:12px; text-align:center; font-size:12px; color:#c62828;">
            🛑 మీ డ్యూటీ <b>OFF</b> లో ఉంది. పనుల అలర్ట్స్ అందుకోవడానికి పైన డ్యూటీ <b>ON</b> చేసుకోండి.
          </div>
        ` : openJobs.length === 0 ? `
          <div style="background:#fff; border:1px dashed #b0bec5; border-radius:8px; padding:12px; text-align:center; font-size:12px; color:#607d8b;">
            ప్రస్తుతం మీ ప్రాంతంలో కొత్త పనుల అలర్ట్స్ ఏవీ లేవు.
          </div>
        ` : openJobs.map(job => {
          const filledCount = job.confirmedLabours ? job.confirmedLabours.length : 0;
          const isAlreadyAccepted = job.confirmedLabours && job.confirmedLabours.some(l => l.phone === myProf.phone);

          return `
            <div class="job-card" style="background:#fff; border:1px solid #e0e0e0; border-left:4px solid #0288d1; border-radius:8px; padding:10px; margin-bottom:10px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h4 style="margin:0; color:#0277bd; font-size:13px;">🌾 ${job.crop} -${job.workType}</h4>
                  <div style="font-size:11px; color:#424242; margin-top:2px;">
                    రైతు: <b>${job.farmerName}</b> \vert{} 📍 గ్రామం: <b>${job.village}</b>
                  </div>
                  <div style="font-size:11px; color:#d84315; margin-top:2px; font-weight:bold;">
                    📅 పని తేదీ: ${job.workDate} \vert{} 🛵 ${job.transportNote}
                  </div>
                  <div style="font-size:11px; color:#2e7d32; margin-top:3px;">
                    👥 కూలీల కోటా: <b>${filledCount} /${job.totalRequired} భర్తీ అయ్యారు</b>
                  </div>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:13px; font-weight:bold; color:#e65100;">₹${job.wage}/రోజు</span>
                </div>
              </div>

              <!-- Accept / Reject Actions -->
              <div style="margin-top:10px; display:flex; gap:8px;">
                ${isAlreadyAccepted ? `
                  <button disabled style="flex:1; background:#c8e6c9; color:#2e7d32; border:none; padding:7px; border-radius:6px; font-size:12px; font-weight:bold;">
                    ✅ మీరు ఇప్పటికే అంగీకరించారు
                  </button>
                ` : `
                  <button onclick="acceptFarmerJob('${job.id}')" style="flex:1; background:#2e7d32; color:#fff; border:none; padding:7px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">
                    ✅ పని Accept చేయండి
                  </button>
                  <button onclick="rejectFarmerJob('${job.id}')" style="background:#f5f5f5; color:#616161; border:1px solid #ccc; padding:7px 12px; border-radius:6px; font-size:12px; cursor:pointer;">
                    ❌ తిరస్కరించు
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- ఖరారైన పనుల జాబితా (కూలీ కోసం నావిగేషన్ & కాంటాక్ట్) -->
      ${myConfirmedJobs.length > 0 ? `
        <div style="background:#f1f8e9; border:1px solid #c5e1a5; border-radius:8px; padding:10px; margin-top:10px;">
          <h4 style="margin:0 0 8px 0; color:#33691e; font-size:12px;">🎉 మీరు ఒప్పుకున్న ఖరారైన పనులు:</h4>
          ${myConfirmedJobs.map(c => `
            <div style="background:#fff; padding:8px; border-radius:6px; margin-bottom:6px; border:1px solid #dcedc8;">
              <div style="font-size:12px; font-weight:bold; color:#1b5e20;">${c.crop} - ${c.workType} (📅 ${c.workDate})</div>
              <div style="font-size:11px; color:#555;">రైతు: ${c.farmerName} (${c.village}) | వేతనం: ₹${c.wage}/రోజు</div>
              <div style="display:flex; gap:6px; margin-top:6px;">
                <a href="tel:${c.farmerPhone}" style="flex:1; text-align:center; background:#0288d1; color:#fff; padding:5px; border-radius:4px; font-size:11px; text-decoration:none; font-weight:bold;">📞 రైతుకు కాల్</a>
                <a href="https://wa.me/91${c.farmerPhone}" target="_blank" style="flex:1; text-align:center; background:#25d366; color:#fff; padding:5px; border-radius:4px; font-size:11px; text-decoration:none; font-weight:bold;">💬 వాట్సాప్</a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.village)}" target="_blank" style="flex:1; text-align:center; background:#f57c00; color:#fff; padding:5px; border-radius:4px; font-size:11px; text-decoration:none; font-weight:bold;">🗺️ రూట్ Map</a>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

    </div>
  `;
}

window.acceptFarmerJob = function(jobId) {
  const myProf = (typeof getLabourProfile === "function") ? getLabourProfile() : { name: "కూలీ", phone: "9876543210" };
  const targetJob = postedFarmerJobs.find(j => j.id === jobId);
  if (!targetJob) return;

  const currentList = targetJob.confirmedLabours || [];
  if (currentList.some(l => l.phone === myProf.phone)) return;

  currentList.push({
    name: myProf.name,
    phone: myProf.phone,
    acceptedAt: Date.now()
  });

  const isFull = currentList.length >= targetJob.totalRequired;
  const updatePayload = {
    confirmedLabours: currentList,
    status: isFull ? "Filled" : "Open"
  };

  if (window.db && !jobId.startsWith("job_")) {
    window.db.collection("farmer_posted_jobs").doc(jobId).update(updatePayload);
  } else {
    Object.assign(targetJob, updatePayload);
    localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(postedFarmerJobs));
    renderLabourWidget();
  }

  if (typeof renderFarmerLabourPane === "function") renderFarmerLabourPane();
  alert("🎉 పని ఖరారైంది! రైతు వివరాలు క్రింద జతచేయబడ్డాయి.");
};

window.rejectFarmerJob = function(jobId) {
  alert("ఈ పని రిజెక్ట్ చేయబడింది.");
};

initJobsListener();
window.renderLabourWidget = renderLabourWidget;
