// labour/labour.js - Dedicated Labour Dashboard & Profile Engine
window.LabourModule = {
  postedFarmerJobs: [],
  rejectedJobIds: [],
  isJobsListenerActive: false,

  init: function() {
    try {
      const rej = localStorage.getItem("agri_labour_rejected_jobs");
      this.rejectedJobIds = rej ? JSON.parse(rej) : [];
    } catch (e) {
      this.rejectedJobIds = [];
    }

    try {
      const stored = localStorage.getItem("agri_farmer_posted_jobs");
      this.postedFarmerJobs = stored ? JSON.parse(stored) : [];
    } catch (e) {
      this.postedFarmerJobs = [];
    }

    this.initJobsListener();
  },

  getProfile: function() {
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
  },

  saveProfile: function(profile) {
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

    this.render();
    if (typeof renderUserProfileBanner === "function") renderUserProfileBanner();
  },

  toggleDutyStatus: function() {
    const prof = this.getProfile();
    prof.isDutyOn = !prof.isDutyOn;
    this.saveProfile(prof);

    const msg = prof.isDutyOn 
      ? "డ్యూటీ ఆన్ చేయబడింది. పనుల అలర్ట్స్ లైవ్ లో ఉన్నాయి." 
      : "డ్యూటీ ఆఫ్ చేయబడింది.";

    if (typeof speakTeluguText === "function") {
      speakTeluguText(msg);
    }
  },

  initJobsListener: function() {
    if (this.isJobsListenerActive) return;

    if (window.AgriDB && typeof window.AgriDB.listenToLabourJobs === 'function') {
      this.isJobsListenerActive = true;
      window.AgriDB.listenToLabourJobs((list) => {
        this.postedFarmerJobs = list || [];
        localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(this.postedFarmerJobs));
        this.render();
      });
    } else if (window.db) {
      this.isJobsListenerActive = true;
      window.db.collection("farmer_posted_jobs").onSnapshot(snapshot => {
        const list = [];
        snapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        this.postedFarmerJobs = list;
        localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(list));
        this.render();
      }, err => {
        console.warn("Labour jobs listener notice:", err);
      });
    }
  },

  render: function() {
    const container = document.getElementById("labour-jobs-container");
    if (!container) return;

    const tpl = document.getElementById("labour-dashboard-template");
    if (!tpl) return;

    container.replaceChildren();
    const clone = tpl.content.cloneNode(true);
    const prof = this.getProfile();

    // 1. Setup Duty Switch
    const dutyBtn = clone.querySelector("#btn-duty-toggle");
    const dutyText = clone.querySelector("#duty-toggle-text");
    dutyBtn.className = `btn-duty-toggle ${prof.isDutyOn ? 'on' : 'off'}`;
    dutyText.textContent = prof.isDutyOn ? '🟢 డ్యూటీ ON (లైవ్)' : '🔴 డ్యూటీ OFF';
    dutyBtn.onclick = () => this.toggleDutyStatus();

    // 2. Filter Jobs
    const openJobs = this.postedFarmerJobs.filter(j => 
      j.status === "Open" && !this.rejectedJobIds.includes(j.id)
    );

    const myConfirmedJobs = this.postedFarmerJobs.filter(j => 
      prof.phone && j.confirmedLabours && j.confirmedLabours.some(l => l.phone === prof.phone)
    );

    // 3. Alerts Header Badge
    clone.querySelector("#labour-alerts-badge").textContent = `${prof.isDutyOn ? openJobs.length : 0} పనులు`;

    // 4. Job Alert States
    const dutyOffBox = clone.querySelector("#labour-duty-off-box");
    const emptyJobsBox = clone.querySelector("#labour-empty-jobs-box");
    const jobsList = clone.querySelector("#labour-open-jobs-list");
    const jobItemTpl = document.getElementById("labour-job-item-template");

    if (!prof.isDutyOn) {
      dutyOffBox.classList.remove("is-hidden");
    } else if (openJobs.length === 0) {
      emptyJobsBox.classList.remove("is-hidden");
    } else if (jobItemTpl) {
      openJobs.forEach(job => {
        const itemClone = jobItemTpl.content.cloneNode(true);
        const filledCount = job.confirmedLabours ? job.confirmedLabours.length : 0;
        const reqCount = parseInt(job.totalRequired || job.count || 1);
        const isAlreadyAccepted = Boolean(prof.phone && job.confirmedLabours && job.confirmedLabours.some(l => l.phone === prof.phone));

        itemClone.querySelector(".labour-job-title").textContent = `🌾 ${job.crop} - ${job.workType}`;
        itemClone.querySelector(".labour-job-farmer-info").innerHTML = `రైతు: <b>${job.farmerName}</b> | 📍 గ్రామం: <b>${job.village || 'సమీప గ్రామం'}</b>`;
        itemClone.querySelector(".labour-job-schedule").textContent = `📅 పని తేదీ: ${job.workDate || job.date || 'ఈ రోజు'} | 🛵 ${job.transportNote || 'రవాణా సదుపాయం కలదు'}`;
        itemClone.querySelector(".labour-job-quota").innerHTML = `👥 కూలీల కోటా: <b>${filledCount} / ${reqCount} భర్తీ అయ్యారు</b>`;
        itemClone.querySelector(".wage-text").textContent = `₹${job.wage}/రోజు`;

        const acceptBtn = itemClone.querySelector(".btn-job-accept");
        const rejectBtn = itemClone.querySelector(".btn-job-reject");
        const disabledBtn = itemClone.querySelector(".btn-job-accepted-disabled");

        if (isAlreadyAccepted) {
          acceptBtn.classList.add("is-hidden");
          rejectBtn.classList.add("is-hidden");
          disabledBtn.classList.remove("is-hidden");
        } else {
          acceptBtn.onclick = () => this.acceptJob(job.id);
          rejectBtn.onclick = () => this.rejectJob(job.id);
        }

        jobsList.appendChild(itemClone);
      });
    }

    // 5. Confirmed Jobs Section
    const confSection = clone.querySelector("#labour-confirmed-section");
    const confList = clone.querySelector("#labour-confirmed-list");
    const confTpl = document.getElementById("labour-confirmed-card-template");

    if (myConfirmedJobs.length > 0 && confTpl) {
      confSection.classList.remove("is-hidden");
      myConfirmedJobs.forEach(c => {
        const cClone = confTpl.content.cloneNode(true);
        cClone.querySelector(".labour-confirmed-title").textContent = `${c.crop} - ${c.workType} (📅 ${c.workDate || c.date})`;
        cClone.querySelector(".labour-confirmed-sub").innerHTML = `రైతు: <b>${c.farmerName}</b> (${c.village || 'స్థానిక పరిధి'}) | వేతనం: ₹${c.wage}/రోజు`;

        cClone.querySelector(".labour-cbtn-call").href = `tel:${c.farmerPhone}`;
        cClone.querySelector(".labour-cbtn-wa").href = `https://wa.me/91${c.farmerPhone}`;
        cClone.querySelector(".labour-cbtn-map").href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.village || prof.village || '')}`;

        confList.appendChild(cClone);
      });
    }

    container.appendChild(clone);
  },

  acceptJob: async function(jobId) {
    const prof = this.getProfile();
    if (!prof.phone) {
      alert("పనిని అంగీకరించడానికి దయచేసి ముందుగా మీ మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి.");
      return;
    }

    const targetJob = this.postedFarmerJobs.find(j => j.id === jobId);
    if (!targetJob) return;

    const currentList = targetJob.confirmedLabours || [];
    if (currentList.some(l => l.phone === prof.phone)) {
      alert("మీరు ఇప్పటికే ఈ పనిని ఒప్పుకున్నారు.");
      return;
    }

    currentList.push({
      name: prof.name,
      phone: prof.phone,
      acceptedAt: Date.now()
    });

    const reqCount = parseInt(targetJob.totalRequired || targetJob.count || 1);
    const isFull = currentList.length >= reqCount;
    const updatePayload = {
      confirmedLabours: currentList,
      status: isFull ? "Filled" : "Open"
    };

    if (window.db && !jobId.startsWith("job_") && !jobId.startsWith("JOB-")) {
      try {
        await window.db.collection("farmer_posted_jobs").doc(jobId).update(updatePayload);
      } catch (err) {
        console.warn("Cloud update failed, updating locally:", err);
      }
    }

    Object.assign(targetJob, updatePayload);
    localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(this.postedFarmerJobs));

    this.render();
    if (typeof window.renderFarmerWidget === "function") window.renderFarmerWidget();

    if (typeof speakTeluguText === "function") {
      speakTeluguText("పనిని విజయవంతంగా ఒప్పుకున్నారు. రైతు వివరాలు మీ స్క్రీన్‌లో చేర్చబడ్డాయి.");
    } else {
      alert("🎉 పని ఖరారైంది! రైతు వివరాలు క్రింద జతచేయబడ్డాయి.");
    }
  },

  rejectJob: function(jobId) {
    if (!this.rejectedJobIds.includes(jobId)) {
      this.rejectedJobIds.push(jobId);
      try {
        localStorage.setItem("agri_labour_rejected_jobs", JSON.stringify(this.rejectedJobIds));
      } catch (e) {}
    }
    this.render();
    alert("ఈ పని జాబితా నుండి తొలగించబడింది.");
  },

  // Modal Methods
  openProfileModal: function() {
    let modal = document.getElementById("labourProfileModal");
    if (!modal) {
      const tpl = document.getElementById("labour-profile-modal-template");
      if (tpl) {
        document.body.appendChild(tpl.content.cloneNode(true));
        modal = document.getElementById("labourProfileModal");
      }
    }
    if (!modal) return;

    const prof = this.getProfile();
    const allSkills = ["వరి నాట్లు", "కలుపు తీత", "పంట కోత", "మందు స్ప్రేయింగ్", "పత్తి ఏరడం", "మొక్కజొన్న పనులు"];

    document.getElementById("lpf_name").value = prof.name;
    document.getElementById("lpf_phone").value = prof.phone;
    document.getElementById("lpf_village").value = prof.village;
    document.getElementById("lpf_count").value = prof.gangCount || 1;
    document.getElementById("lpf_wage").value = prof.wage || 450;
    document.getElementById("lpf_trans").value = prof.ownTransport ? "yes" : "no";

    const sBox = document.getElementById("lpm-skills-box");
    if (sBox) {
      sBox.innerHTML = allSkills.map(s => {
        const checked = prof.skills && prof.skills.includes(s) ? 'checked' : '';
        return `
          <label class="lpm-skill-item">
            <input type="checkbox" name="labour_skills" value="${s}" ${checked}>${s}
          </label>
        `;
      }).join('');
    }

    modal.classList.remove("is-hidden");
    modal.style.display = "flex";
  },

  closeProfileModal: function() {
    const modal = document.getElementById("labourProfileModal");
    if (modal) {
      modal.classList.add("is-hidden");
      modal.style.display = "none";
    }
  },

  handleProfileSubmit: function(e) {
    e.preventDefault();
    const name = document.getElementById("lpf_name").value.trim();
    const phone = document.getElementById("lpf_phone").value.trim();
    const village = document.getElementById("lpf_village").value.trim();
    const count = parseInt(document.getElementById("lpf_count").value) || 1;
    const wage = parseFloat(document.getElementById("lpf_wage").value) || 450;
    const trans = document.getElementById("lpf_trans").value === "yes";

    const checkboxes = document.querySelectorAll('input[name="labour_skills"]:checked');
    const selectedSkills = Array.from(checkboxes).map(cb => cb.value);

    const prev = this.getProfile();
    const updatedProfile = {
      ...prev,
      name,
      phone,
      village,
      gangCount: count,
      wage,
      ownTransport: trans,
      skills: selectedSkills.length ? selectedSkills : ["వ్యవసాయ పనులు"]
    };

    this.saveProfile(updatedProfile);
    this.closeProfileModal();

    if (typeof speakTeluguText === "function") {
      speakTeluguText("మీ కూలీ వివరాలు విజయవంతంగా అప్‌డేట్ అయ్యాయి.");
    }
  }
};

// -------------------------------------------------------------
// Global Bridges & Backward Compatibility
// -------------------------------------------------------------
window.renderLabourWidget = function() { window.LabourModule.render(); };
window.getLabourProfile = function() { return window.LabourModule.getProfile(); };
window.saveLabourProfile = function(p) { window.LabourModule.saveProfile(p); };
window.toggleLabourDutyStatus = function() { window.LabourModule.toggleDutyStatus(); };
window.acceptFarmerJob = function(id) { window.LabourModule.acceptJob(id); };
window.rejectFarmerJob = function(id) { window.LabourModule.rejectJob(id); };
window.openLabourProfileModal = function() { window.LabourModule.openProfileModal(); };
window.closeLabourProfileModal = function() { window.LabourModule.closeProfileModal(); };
window.handleLabourProfileSubmit = function(e) { window.LabourModule.handleProfileSubmit(e); };

// Initialize data cache
window.LabourModule.init();
