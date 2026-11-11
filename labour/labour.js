// labour/labour.js - Complete Pure Logic Controller

let postedFarmerJobs = [];
let isJobsListenerActive = false;
let rejectedJobIds = [];

try {
  const rej = localStorage.getItem("agri_labour_rejected_jobs");
  rejectedJobIds = rej ? JSON.parse(rej) : [];
} catch (e) {
  rejectedJobIds = [];
}

// 1. Landing Card Render (Guest View)
window.renderLabourLandingCard = function() {
  const mount = document.getElementById("labour-jobs-container");
  const tpl = document.getElementById("labour-landing-template");
  if (!mount || !tpl) return;

  mount.replaceChildren(tpl.content.cloneNode(true));
  mount.classList.remove("is-hidden");
};

// 2. Profile Helper
window.getLabourProfile = function() {
  const appProf = window.AppState?.userProfile;
  let stored = null;

  try {
    const p = localStorage.getItem("agri_labour_current_profile");
    if (p) stored = JSON.parse(p);
  } catch (e) {}

  const activePhone = (typeof window.getActiveUserPhone === "function")
    ? window.getActiveUserPhone()
    : (appProf?.phone || stored?.phone || "");

  const baseName = appProf?.name || stored?.name || "కూలీ";
  const baseVillage = appProf?.village || stored?.village || "స్థానిక పరిధి";

  let dutyStatus = true;
  try {
    const savedDuty = localStorage.getItem("agri_labour_duty_status");
    if (savedDuty !== null) {
      dutyStatus = (savedDuty === "true");
    } else if (stored && stored.isDutyOn !== undefined) {
      dutyStatus = stored.isDutyOn;
    }
  } catch (e) {}

  return {
    name: baseName,
    phone: activePhone,
    village: baseVillage,
    gangCount: stored?.gangCount || 1,
    wage: stored?.wage || 450,
    ownTransport: stored?.ownTransport !== undefined ? stored.ownTransport : true,
    isDutyOn: dutyStatus,
    skills: stored?.skills || ["వరి నాట్లు", "కలుపు తీత", "పంట కోత"]
  };
};

window.saveLabourProfile = function(profile) {
  localStorage.setItem("agri_labour_current_profile", JSON.stringify(profile));
  localStorage.setItem("agri_labour_duty_status", String(profile.isDutyOn));

  if (window.AppState && window.AppState.userProfile) {
    window.AppState.userProfile.name = profile.name;
    window.AppState.userProfile.phone = profile.phone;
    window.AppState.userProfile.village = profile.village;
    try {
      localStorage.setItem("agri_user_profile", JSON.stringify(window.AppState.userProfile));
    } catch (e) {}
  }

  if (window.db && profile.phone) {
    const docId = "profile_" + profile.phone;
    window.db.collection("labour_profiles").doc(docId).set({
      ...profile,
      status: profile.isDutyOn ? "Available" : "Offline",
      updatedAt: Date.now()
    }, { merge: true });
  }

  window.renderLabourWidget();
  if (typeof window.RoleController?.renderUserProfileBanner === "function") {
    window.RoleController.renderUserProfileBanner();
  }
};

// 3. Duty Toggle
window.toggleLabourDutyStatus = function() {
  const prof = window.getLabourProfile();
  prof.isDutyOn = !prof.isDutyOn;
  window.saveLabourProfile(prof);

  const msg = prof.isDutyOn 
    ? "మీరు ఇప్పుడు లైవ్ డ్యూటీలో ఉన్నారు. పనుల అలర్ట్స్ లైవ్‌లో ఉన్నాయి." 
    : "డ్యూటీ ఆఫ్ చేయబడింది. పనుల అలర్ట్స్ నిలిపివేయబడ్డాయి.";

  if (typeof speakTeluguText === "function") {
    speakTeluguText(msg);
  }
};

// 4. Cloud Listener
function initJobsListener() {
  if (isJobsListenerActive) return;

  if (window.AgriDB && typeof window.AgriDB.listenToLabourJobs === 'function') {
    isJobsListenerActive = true;
    window.AgriDB.listenToLabourJobs((list) => {
      postedFarmerJobs = list || [];
      localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(postedFarmerJobs));
      window.renderLabourWidget();
    });
  } else if (window.db) {
    isJobsListenerActive = true;
    window.db.collection("farmer_posted_jobs").onSnapshot(snapshot => {
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      postedFarmerJobs = list;
      localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(list));
      window.renderLabourWidget();
    }, err => console.warn("Labour jobs sync notice:", err));
  } else {
    try {
      const stored = localStorage.getItem("agri_farmer_posted_jobs");
      postedFarmerJobs = stored ? JSON.parse(stored) : [];
      window.renderLabourWidget();
    } catch (e) {}
  }
}

// 5. Main Dashboard Renderer
window.renderLabourWidget = function() {
  const container = document.getElementById("labour-jobs-container");
  if (!container) return;

  if (!isJobsListenerActive && window.db) {
    initJobsListener();
  }

  // డాష్‌బోర్డ్ కార్డ్ లేకుంటే టెంప్లేట్ క్లోన్ చేయడం
  let dashboard = container.querySelector(".labour-card");
  if (!dashboard) {
    const tpl = document.getElementById("labour-dashboard-template");
    if (!tpl) return;
    container.replaceChildren(tpl.content.cloneNode(true));
  }

  const myProf = window.getLabourProfile();

  // Duty బటన్ అప్‌డేట్
  const dutyBtn = document.getElementById("btn-duty-toggle");
  const dutyText = document.getElementById("duty-toggle-text");
  if (dutyBtn && dutyText) {
    dutyBtn.className = `btn-duty-toggle ${myProf.isDutyOn ? 'on' : 'off'}`;
    dutyText.textContent = myProf.isDutyOn ? "🟢 డ్యూటీ ON (లైవ్)" : "🔴 డ్యూటీ OFF";
  }

  const dutyOffBox = document.getElementById("labour-duty-off-box");
  const emptyJobsBox = document.getElementById("labour-empty-jobs-box");
  const openJobsList = document.getElementById("labour-open-jobs-list");
  const alertsBadge = document.getElementById("labour-alerts-badge");
  const spotWrapper = document.getElementById("labour-spot-alerts-container");

  if (!myProf.isDutyOn) {
    if (dutyOffBox) dutyOffBox.classList.remove("is-hidden");
    if (emptyJobsBox) emptyJobsBox.classList.add("is-hidden");
    if (openJobsList) openJobsList.replaceChildren();
    if (spotWrapper) spotWrapper.classList.add("is-hidden");
    if (alertsBadge) alertsBadge.textContent = "0 పనులు";
    return;
  }

  if (dutyOffBox) dutyOffBox.classList.add("is-hidden");

  // ⚡ A. స్పాట్ అలర్ట్స్ రెండరింగ్ (రైతు SOS బుకింగ్స్)
  renderLabourSpotAlerts(spotWrapper);

  // B. సాధారణ ఓపెన్ పనులు
  const openJobs = postedFarmerJobs.filter(j => 
    j.status === "Open" && !rejectedJobIds.includes(j.id)
  );

  if (alertsBadge) alertsBadge.textContent = `${openJobs.length} పనులు`;

  const jobCardTpl = document.getElementById("labour-job-card-template");
  if (openJobsList && jobCardTpl) {
    openJobsList.replaceChildren();

    if (openJobs.length === 0) {
      if (emptyJobsBox) emptyJobsBox.classList.remove("is-hidden");
    } else {
      if (emptyJobsBox) emptyJobsBox.classList.add("is-hidden");

      openJobs.forEach(job => {
        const cardNode = jobCardTpl.content.cloneNode(true);
        const card = cardNode.querySelector(".labour-job-card");
        const filledCount = job.confirmedLabours ? job.confirmedLabours.length : 0;
        const reqCount = parseInt(job.totalRequired || job.count || 1);
        const isAlreadyAccepted = Boolean(myProf.phone && job.confirmedLabours && job.confirmedLabours.some(l => l.phone === myProf.phone));

        card.setAttribute("data-village", job.village || "");
        card.querySelector(".labour-job-title").textContent = `🌾 ${job.crop} - ${job.workType}`;
        card.querySelector(".labour-job-farmer-info").innerHTML = `రైతు: <b>${job.farmerName}</b> | 📍 గ్రామం: <b>${job.village || 'సమీప గ్రామం'}</b>`;
        card.querySelector(".labour-job-schedule").textContent = `📅 పని తేదీ: ${job.workDate || job.date || 'ఈ రోజు'} | 🛵 ${job.transportNote || 'రవాణా కలదు'}`;
        card.querySelector(".labour-job-quota").innerHTML = `👥 కూలీల కోటా: <b>${filledCount} / ${reqCount} భర్తీ అయ్యారు</b>`;
        card.querySelector(".labour-job-wage").textContent = `₹${job.wage}/రోజు`;

        const btnAccept = card.querySelector(".btn-job-accept");
        const btnReject = card.querySelector(".btn-job-reject");
        const btnDisabled = card.querySelector(".btn-job-accepted-disabled");

        if (isAlreadyAccepted) {
          btnAccept.remove();
          btnReject.remove();
          btnDisabled.classList.remove("is-hidden");
        } else {
          btnAccept.onclick = () => window.acceptFarmerJob(job.id);
          btnReject.onclick = () => window.rejectFarmerJob(job.id);
        }

        openJobsList.appendChild(card);
      });
    }
  }

  // C. ఖరారైన పనులు (Confirmed List)
  renderLabourConfirmedList(myProf);

  if (typeof window.filterLabourJobsByLocation === "function") {
    window.filterLabourJobsByLocation();
  }
};

// ⚡ స్పాట్ అలర్ట్స్ లాజిక్ (Farmer SOS ➔ Labour Live)
function renderLabourSpotAlerts(wrapper) {
  if (!wrapper) return;
  const spotTpl = document.getElementById("labour-spot-card-template");
  if (!spotTpl) return;

  let allSpotAlerts = [];
  try {
    allSpotAlerts = JSON.parse(localStorage.getItem("agri_spot_alerts") || "[]");
  } catch (e) { allSpotAlerts = []; }

  // కేవలం LABOUR కోసం పంపిన ఓపెన్ అలర్ట్‌లను మాత్రమే ఫిల్టర్ చేయడం
  const labourSpots = allSpotAlerts.filter(a => a.roleTarget === "LABOUR" && a.status === "URGENT_BROADCAST");

  if (labourSpots.length === 0) {
    wrapper.classList.add("is-hidden");
    wrapper.replaceChildren();
    return;
  }

  wrapper.classList.remove("is-hidden");
  wrapper.replaceChildren();

  labourSpots.forEach(spot => {
    const card = spotTpl.content.cloneNode(true);
    card.querySelector(".labour-spot-title").textContent = `⚡ అత్యవసర కూలీల అవసరం (${spot.quantity})`;
    card.querySelector(".labour-spot-farmer-info").textContent = `రైతు: ${spot.farmerName} (${spot.location}) | సమయం: ${spot.createdAt}`;
    card.querySelector(".labour-spot-desc").textContent = `📢 తక్షణమే పొలానికి చేరుకోవాలి!`;
    card.querySelector(".labour-spot-wage").textContent = `₹${spot.wage}`;

    card.querySelector(".btn-spot-accept").onclick = function() {
      spot.status = "ACCEPTED";
      localStorage.setItem("agri_spot_alerts", JSON.stringify(allSpotAlerts));
      alert(`🎉 మీరు రైతు ${spot.farmerName} అత్యవసర స్పాట్ బుకింగ్‌ను స్వీకరించారు!`);
      window.renderLabourWidget();
    };

    wrapper.appendChild(card);
  });
}

// ఖరారైన పనుల రెండరింగ్ (Pure Template)
function renderLabourConfirmedList(myProf) {
  const confSec = document.getElementById("labour-confirmed-section");
  const confList = document.getElementById("labour-confirmed-list");
  const confCardTpl = document.getElementById("labour-confirmed-card-template");
  if (!confSec || !confList || !confCardTpl) return;

  const myConfirmedJobs = postedFarmerJobs.filter(j => 
    myProf.phone && j.confirmedLabours && j.confirmedLabours.some(l => l.phone === myProf.phone)
  );

  if (myConfirmedJobs.length > 0) {
    confSec.classList.remove("is-hidden");
    confList.replaceChildren();

    myConfirmedJobs.forEach(c => {
      const card = confCardTpl.content.cloneNode(true);
      card.querySelector(".labour-confirmed-title").textContent = `${c.crop} - ${c.workType} (📅 ${c.workDate || c.date})`;
      card.querySelector(".labour-confirmed-sub").innerHTML = `రైతు: <b>${c.farmerName}</b> (${c.village || 'స్థానిక పరిధి'}) | వేతనం: ₹${c.wage}/రోజు`;
      card.querySelector(".labour-cbtn-call").href = `tel:${c.farmerPhone}`;
      card.querySelector(".labour-cbtn-wa").href = `https://wa.me/91${c.farmerPhone}`;
      card.querySelector(".labour-cbtn-map").href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.village || myProf.village || '')}`;

      confList.appendChild(card);
    });
  } else {
    confSec.classList.add("is-hidden");
    confList.replaceChildren();
  }
}

// 6. Accept / Reject Handlers
window.acceptFarmerJob = function(jobId) {
  const myProf = window.getLabourProfile();
  if (!myProf.phone) {
    alert("దయచేసి ముందుగా మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి.");
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

  if (window.db && !jobId.startsWith("job_") && !jobId.startsWith("JOB-")) {
    window.db.collection("farmer_posted_jobs").doc(jobId).update(updatePayload).catch(err => console.warn(err));
  }

  Object.assign(targetJob, updatePayload);
  localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(postedFarmerJobs));

  window.renderLabourWidget();
  if (typeof window.renderFarmerWidget === "function") window.renderFarmerWidget();

  if (typeof speakTeluguText === "function") {
    speakTeluguText("పని ఖరారైంది! రైతు వివరాలు మీ స్క్రీన్‌లో చేర్చబడ్డాయి.");
  } else {
    alert("🎉 పని ఖరారైంది!");
  }
};

window.rejectFarmerJob = function(jobId) {
  if (!rejectedJobIds.includes(jobId)) {
    rejectedJobIds.push(jobId);
    localStorage.setItem("agri_labour_rejected_jobs", JSON.stringify(rejectedJobIds));
  }
  window.renderLabourWidget();
};

window.filterLabourJobsByLocation = function() {
  const profile = window.AppState?.userProfile;
  if (!profile || !profile.village) return;

  const jobCards = document.querySelectorAll(".labour-job-card[data-village]");
  jobCards.forEach(card => {
    const jobVillage = card.getAttribute("data-village") || "";
    if (jobVillage.toLowerCase().includes(profile.village.toLowerCase())) {
      card.classList.add("job-card-highlight");
    }
  });
};

// 7. Profile Modal Handlers
window.openLabourProfileModal = function() {
  let modal = document.getElementById("labourProfileModal");
  if (!modal) {
    const tpl = document.getElementById("labour-profile-modal-template");
    if (tpl) {
      document.body.appendChild(tpl.content.cloneNode(true));
      modal = document.getElementById("labourProfileModal");
    }
  }

  const prof = window.getLabourProfile();
  document.getElementById("lpf_name").value = prof.name;
  document.getElementById("lpf_phone").value = prof.phone;
  document.getElementById("lpf_village").value = prof.village;
  document.getElementById("lpf_count").value = prof.gangCount || 1;
  document.getElementById("lpf_wage").value = prof.wage || 450;
  document.getElementById("lpf_trans").value = prof.ownTransport ? "yes" : "no";

  const allSkills = ["వరి నాట్లు", "కలుపు తీత", "పంట కోత", "మందు స్ప్రేయింగ్", "పత్తి ఏరడం", "మొక్కజొన్న పనులు"];
  const skillsBox = document.getElementById("lpm-skills-box");
  if (skillsBox) {
    skillsBox.replaceChildren();
    allSkills.forEach(s => {
      const label = document.createElement("label");
      label.className = "lpm-skill-item";
      
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "labour_skills";
      input.value = s;
      if (prof.skills && prof.skills.includes(s)) input.checked = true;

      label.appendChild(input);
      label.appendChild(document.createTextNode(s));
      skillsBox.appendChild(label);
    });
  }

  if (modal) modal.classList.remove("is-hidden");
};

window.closeLabourProfileModal = function() {
  const modal = document.getElementById("labourProfileModal");
  if (modal) modal.classList.add("is-hidden");
};

window.handleLabourProfileSubmit = function(e) {
  e.preventDefault();

  const checkboxes = document.querySelectorAll('input[name="labour_skills"]:checked');
  const selectedSkills = Array.from(checkboxes).map(cb => cb.value);

  const prev = window.getLabourProfile();
  const updated = {
    ...prev,
    name: document.getElementById("lpf_name").value.trim(),
    phone: document.getElementById("lpf_phone").value.trim(),
    village: document.getElementById("lpf_village").value.trim(),
    gangCount: parseInt(document.getElementById("lpf_count").value) || 1,
    wage: parseFloat(document.getElementById("lpf_wage").value) || 450,
    ownTransport: document.getElementById("lpf_trans").value === "yes",
    skills: selectedSkills.length ? selectedSkills : ["వ్యవసాయ పనులు"]
  };

  window.saveLabourProfile(updated);
  window.closeLabourProfileModal();

  if (typeof speakTeluguText === "function") {
    speakTeluguText("మీ కూలీ వివరాలు అప్‌డేట్ అయ్యాయి.");
  }
};
