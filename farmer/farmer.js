// farmer/farmer.js - Pure Logic & Template Orchestration

window.renderFarmerLandingCard = function() {
  const mount = document.getElementById("farmer-post-container");
  const tpl = document.getElementById("farmer-landing-template");
  if (!mount || !tpl) return;

  mount.replaceChildren(tpl.content.cloneNode(true));
  mount.classList.remove("is-hidden");
};

// 1. Tab Switcher
window.switchFarmerTab = function(tab) {
  const panes = ['labour', 'equipment', 'seeds', 'transport'];

  panes.forEach(t => {
    const pane = document.getElementById(`farmer-pane-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);

    if (pane) {
      if (t === tab) {
        pane.classList.remove('is-hidden');
      } else {
        pane.classList.add('is-hidden');
      }
    }
    if (btn) {
      btn.classList.toggle('active', t === tab);
    }
  });

  if (tab === 'equipment' && typeof window.renderEquipmentWidget === 'function') {
    window.renderEquipmentWidget('farmer-pane-equipment');
  } else if (tab === 'seeds' && typeof window.renderSeedsWidget === 'function') {
    window.renderSeedsWidget('farmer-pane-seeds');
  } else if (tab === 'transport' && typeof window.renderTransportWidget === 'function') {
    window.renderTransportWidget('farmer-pane-transport');
  }
};

// 2. శాశ్వత మోడ్ స్విచర్ మౌంట్ మరియు యాక్టివ్ స్టేట్ అప్‌డేట్
window.mountFarmerPersistentSwitchBar = function() {
  let switchBar = document.getElementById("persistent-role-switch-bar");

  // DOM లో ఇంకా బార్ లేకపోతే టెంప్లేట్ నుండి క్లోన్ చేసి ఇన్సర్ట్ చేస్తుంది
  if (!switchBar) {
    const tpl = document.getElementById("farmer-persistent-switch-template");
    if (!tpl) return;

    const clone = tpl.content.cloneNode(true);
    switchBar = clone.querySelector("#persistent-role-switch-bar");

    // ప్రొఫైల్ బ్యానర్ కింద, డాష్‌బోర్డ్ కంటైనర్ కంటే పైన ఇన్సర్ట్ చేయడం
    const banner = document.getElementById("user-profile-banner");
    const farmerContainer = document.getElementById("farmer-post-container");

    if (banner && banner.parentNode) {
      banner.parentNode.insertBefore(switchBar, banner.nextSibling);
    } else if (farmerContainer && farmerContainer.parentNode) {
      farmerContainer.parentNode.insertBefore(switchBar, farmerContainer);
    }
  }

  // బటన్ల రంగును ప్రస్తుత రోల్ ప్రకారం అప్‌డేట్ చేయడం
  const current = String(window.AppState?.currentRole || 'FARMER').toUpperCase();
  const fBtn = document.getElementById("f-btn-farmer");
  const lBtn = document.getElementById("f-btn-labour");
  const pBtn = document.getElementById("f-btn-provider");

      if (fBtn) {
      const isActive = (current === "FARMER");
      fBtn.classList.toggle("active", isActive);
      fBtn.classList.toggle("active-farmer", isActive);
    }
    if (lBtn) {
      const isActive = (current === "LABOUR");
      lBtn.classList.toggle("active", isActive);
      lBtn.classList.toggle("active-labour", isActive);
    }
    if (pBtn) {
      const isActive = (current === "PROVIDER");
      pBtn.classList.toggle("active", isActive);
      pBtn.classList.toggle("active-provider", isActive);
    }

// పాత ఫంక్షన్ కాల్స్ బ్రేక్ అవ్వకుండా అలియాస్
window.updateFarmerSwitchBarActiveState = window.mountFarmerPersistentSwitchBar;

// 3. Main Farmer Widget Renderer
window.renderFarmerWidget = function() {
  const container = document.getElementById("farmer-post-container");
  const tpl = document.getElementById("farmer-dashboard-template");
  if (!container || !tpl) return;

  container.replaceChildren(tpl.content.cloneNode(true));

  const formWrap = document.getElementById("farmer-labour-form-wrapper");
  const formTpl = document.getElementById("farmer-labour-form-template");
  if (formWrap && formTpl) {
    formWrap.replaceChildren(formTpl.content.cloneNode(true));
  }

  renderFarmerAcceptedList();

  if (typeof window.renderBookingRecords === 'function') {
    window.renderBookingRecords();
  }

  prefillFarmerFormDefaults();
  bindFarmerFormEvents();

  // డాష్‌బోర్డ్ పైన ఉన్న గ్యాప్‌లో 3 బటన్ల బార్‌ను ఫిక్స్ చేయడం
  if (typeof window.mountFarmerPersistentSwitchBar === "function") {
    window.mountFarmerPersistentSwitchBar();
  }
};

window.renderFarmerLabourPane = window.renderFarmerWidget;

// 4. Accepted List & Slot Tracking (Pure Template Cloning)
function renderFarmerAcceptedList() {
  const wrap = document.getElementById("farmer-accepted-section-wrapper");
  const shellTpl = document.getElementById("farmer-accepted-template");
  if (!wrap || !shellTpl) return;

  wrap.replaceChildren(shellTpl.content.cloneNode(true));

  let postedJobs = [];
  try {
    postedJobs = JSON.parse(localStorage.getItem("agri_farmer_posted_jobs") || "[]");
  } catch (e) {
    postedJobs = [];
  }

  const trackerBox = wrap.querySelector("#slot-tracker-container");
  const acceptedList = wrap.querySelector("#accepted-list");
  const countEl = wrap.querySelector("#confirmed-count");

  const jobCardTpl = document.getElementById("slot-job-card-template");
  const labourRowTpl = document.getElementById("slot-labour-row-template");

  // A. Slot Tracking Jobs Binding
  if (postedJobs.length === 0) {
    const emptyEl = document.createElement("div");
    emptyEl.className = "empty-state-text";
    emptyEl.textContent = "మీరు ఇంకా ఎలాంటి పనులు పోస్ట్ చేయలేదు.";
    trackerBox.appendChild(emptyEl);
  } else {
    postedJobs.forEach(j => {
      if (!jobCardTpl) return;
      const card = jobCardTpl.content.cloneNode(true);
      const confirmed = j.confirmedLabours || [];
      const reqCount = parseInt(j.totalRequired || j.count || 1);
      const isFull = confirmed.length >= reqCount;

      const cardRoot = card.querySelector(".slot-job-card");
      if (isFull) cardRoot.classList.add("is-full");

      card.querySelector(".slot-job-title").textContent = `🌾 ${j.crop} - ${j.workType}`;

      const badge = card.querySelector(".slot-status-badge");
      badge.textContent = isFull ? "✅ కోటా పూర్తయింది" : "⏳ కూలీల కోసం చూస్తున్నారు";
      if (isFull) badge.classList.add("is-full");

      card.querySelector(".slot-job-details").textContent = 
        `📅 తేదీ: ${j.workDate || j.date || 'ఈ రోజు'} | కోటా: ${confirmed.length} / ${reqCount} మంది | రేటు: ₹${j.wage}`;

      const laboursWrap = card.querySelector(".slot-labours-wrapper");
      if (confirmed.length > 0 && labourRowTpl) {
        confirmed.forEach(c => {
          const row = labourRowTpl.content.cloneNode(true);
          row.querySelector(".slot-labour-info").textContent = `👷 ${c.name} (${c.phone})`;
          row.querySelector(".slot-btn-call").href = `tel:${c.phone}`;
          row.querySelector(".slot-btn-whatsapp").href = `https://wa.me/91${c.phone}`;
          laboursWrap.appendChild(row);
        });
      } else {
        laboursWrap.remove();
      }

      trackerBox.appendChild(card);
    });
  }

  // B. Confirmed Labours List Binding
  let allConfirmed = [];
  postedJobs.forEach(pj => {
    (pj.confirmedLabours || []).forEach(c => {
      allConfirmed.push({
        labourName: c.name || "కూలీ",
        labourPhone: c.phone || "",
        crop: pj.crop,
        workType: pj.workType,
        wage: pj.wage
      });
    });
  });

  if (countEl) countEl.textContent = allConfirmed.length;

  const confCardTpl = document.getElementById("confirmed-labour-card-template");
  if (allConfirmed.length === 0) {
    const emptyEl = document.createElement("div");
    emptyEl.className = "empty-state-text";
    emptyEl.textContent = "కూలీలు పనిని accept చేయగానే వారి వివరాలు ఇక్కడ కనిపిస్తాయి.";
    acceptedList.appendChild(emptyEl);
  } else {
    allConfirmed.forEach(j => {
      if (!confCardTpl) return;
      const cCard = confCardTpl.content.cloneNode(true);
      cCard.querySelector(".labour-name-text").textContent = `👷 ${j.labourName}`;
      cCard.querySelector(".badge-wage").textContent = `₹${j.wage}`;
      cCard.querySelector(".labour-work-info").textContent = `పని: ${j.crop} (${j.workType})`;
      cCard.querySelector(".slot-btn-call").href = `tel:${j.labourPhone}`;
      cCard.querySelector(".slot-btn-whatsapp").href = `https://wa.me/91${j.labourPhone}`;
      acceptedList.appendChild(cCard);
    });
  }
}

// 5. Form Events & Submit
function bindFarmerFormEvents() {
  let farmCoords = null;

  document.getElementById("loc-btn")?.addEventListener("click", () => {
    const s = document.getElementById("loc-status");
    if (navigator.geolocation) {
      if (s) s.textContent = "GPS వెతుకుతోంది...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          farmCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (s) s.textContent = "✅ GPS set అయింది";
        },
        () => { if (s) s.textContent = "స్థానిక గ్రామం వర్తిస్తుంది."; },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  });

  document.getElementById("farmer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const villageText = document.getElementById("f-village-btn")?.textContent?.replace(/[🏛️🏘️\s]/g, '') || 
                        window.AppState?.userProfile?.village || "స్థానిక పరిధి";

    const countVal = parseInt(document.getElementById("f-count").value) || 1;
    const dateVal = document.getElementById("f-date").value;

    const newJob = {
      id: "JOB-" + Date.now(),
      farmerName: document.getElementById("f-name").value.trim(),
      farmerPhone: document.getElementById("f-phone").value.trim(),
      crop: document.getElementById("f-crop").value.trim(),
      workType: document.getElementById("f-work").value.trim(),
      count: countVal,
      totalRequired: countVal,
      confirmedLabours: [],
      wage: parseFloat(document.getElementById("f-wage").value) || 450,
      date: dateVal,
      workDate: dateVal,
      village: villageText,
      lat: farmCoords ? farmCoords.lat : null,
      lng: farmCoords ? farmCoords.lng : null,
      status: "Open",
      transportNote: "రైతు రవాణా ఏర్పాటు చేస్తారు",
      createdAt: Date.now()
    };

    if (window.db) {
      window.db.collection("farmer_posted_jobs").add(newJob).catch(err => console.warn("Cloud save error:", err));
    }

    let farmerPostedList = JSON.parse(localStorage.getItem("agri_farmer_posted_jobs") || "[]");
    farmerPostedList.unshift(newJob);
    localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(farmerPostedList));

    window.renderFarmerWidget();
    if (typeof window.renderLabourWidget === "function") window.renderLabourWidget();

    if (typeof speakTeluguText === "function") {
      speakTeluguText("పని వివరాలు విజయవంతంగా పోస్ట్ చేయబడ్డాయి.");
    } else {
      alert("📢 పని కూలీల Dashboard లో live గా post చేయబడింది!");
    }
  });
}

function prefillFarmerFormDefaults() {
  const profile = window.AppState?.userProfile;
  if (!profile) return;

  const nameInput = document.getElementById("f-name");
  const phoneInput = document.getElementById("f-phone");
  const villageBtn = document.getElementById("f-village-btn");

  if (nameInput && !nameInput.value) nameInput.value = profile.name || '';
  if (phoneInput && !phoneInput.value) phoneInput.value = profile.phone || '';
  if (villageBtn && profile.village) villageBtn.textContent = "🏛️ " + profile.village;
}

// 6. Job Posting Modal
window.openFarmerJobModal = function() {
  let modal = document.getElementById("farmerJobModal");
  if (!modal) {
    const tpl = document.getElementById("farmer-job-modal-template");
    if (tpl) {
      document.body.appendChild(tpl.content.cloneNode(true));
      modal = document.getElementById("farmerJobModal");
    }
  }

  const prof = window.AppState?.userProfile;
  if (prof) {
    const n = document.getElementById("fjm_name");
    const p = document.getElementById("fjm_phone");
    const v = document.getElementById("fjm_village");
    if (n && !n.value) n.value = prof.name || "";
    if (p && !p.value) p.value = prof.phone || "";
    if (v && !v.value) v.value = prof.village || "";
  }

  const today = new Date().toISOString().split('T')[0];
  const dateInp = document.getElementById("fjm_date");
  if (dateInp && !dateInp.value) dateInp.value = today;

  if (modal) modal.classList.remove("is-hidden");
};

window.closeFarmerJobModal = function() {
  const modal = document.getElementById("farmerJobModal");
  if (modal) modal.classList.add("is-hidden");
};

window.handleFarmerJobSubmit = function(e) {
  e.preventDefault();

  const countVal = parseInt(document.getElementById("fjm_required").value) || 1;
  const dateVal = document.getElementById("fjm_date").value;

  const newJob = {
    id: "job_" + Date.now(),
    farmerName: document.getElementById("fjm_name").value.trim(),
    farmerPhone: document.getElementById("fjm_phone").value.trim(),
    crop: document.getElementById("fjm_crop").value,
    workType: document.getElementById("fjm_work").value,
    count: countVal,
    totalRequired: countVal,
    confirmedLabours: [],
    wage: parseFloat(document.getElementById("fjm_wage").value) || 450,
    workDate: dateVal,
    date: dateVal,
    village: document.getElementById("fjm_village").value.trim(),
    transportNote: document.getElementById("fjm_trans").value === "own" ? "కూలీల సొంత బండి ఉండాలి" : "రైతు రవాణా ఏర్పాటు చేస్తారు",
    status: "Open",
    createdAt: Date.now()
  };

  if (window.db) {
    window.db.collection("farmer_posted_jobs").add(newJob).catch(err => console.warn(err));
  }

  let list = JSON.parse(localStorage.getItem("agri_farmer_posted_jobs") || "[]");
  list.unshift(newJob);
  localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(list));

  window.closeFarmerJobModal();
  if (typeof window.renderFarmerWidget === "function") window.renderFarmerWidget();
  if (typeof window.renderLabourWidget === "function") window.renderLabourWidget();

  alert("🎉 పని పోస్ట్ చేయబడింది!");
};

// 7. Booking Modal & Escrow Logic
window.openBookingModal = function(itemName, ownerName, rate, phone) {
  let modal = document.getElementById("booking-modal");
  if (!modal) {
    const tpl = document.getElementById("farmer-booking-modal-template");
    if (tpl) {
      document.body.appendChild(tpl.content.cloneNode(true));
      modal = document.getElementById("booking-modal");
    }
  }

  document.getElementById("b-item-name").textContent = itemName;
  document.getElementById("b-item-rate").textContent = rate;

  const form = document.getElementById("booking-request-form");
  form.onsubmit = function(e) {
    e.preventDefault();
    const newBooking = {
      id: "BK-" + Date.now(),
      itemName: itemName,
      ownerName: ownerName,
      rate: rate,
      phone: phone,
      date: document.getElementById('book-date').value,
      duration: document.getElementById('book-duration').value,
      status: "అభ్యర్థన పంపబడింది (Pending)",
      escrowLocked: false
    };

    let saved = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
    saved.unshift(newBooking);
    localStorage.setItem("farmer_bookings", JSON.stringify(saved));

    window.closeBookingModal();
    alert(`✅ ${itemName} బుకింగ్ అభ్యర్థన విజయవంతంగా నమోదైంది!`);
    window.renderBookingRecords();
  };

  modal.classList.remove("is-hidden");
};

window.closeBookingModal = function() {
  const modal = document.getElementById("booking-modal");
  if (modal) modal.classList.add("is-hidden");
};

// 8. పరికరాల బుకింగ్ రికార్డులు (Pure Template Rendering)
window.renderBookingRecords = function() {
  const container = document.getElementById("farmer-booking-records");
  const shellTpl = document.getElementById("farmer-booking-records-template");
  const itemTpl = document.getElementById("booking-record-item-template");
  if (!container || !shellTpl || !itemTpl) return;

  container.replaceChildren(shellTpl.content.cloneNode(true));

  let bookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
  const countEl = container.querySelector("#booking-count");
  const listEl = container.querySelector("#booking-records-list");
  const clearBtn = container.querySelector("#btn-clear-bookings");

  if (countEl) countEl.textContent = bookings.length;
  if (clearBtn && bookings.length === 0) clearBtn.classList.add("is-hidden");

  if (bookings.length === 0) {
    const emptyEl = document.createElement("div");
    emptyEl.className = "empty-state-text";
    emptyEl.textContent = "మీరు ఇంకా ఎలాంటి పరికరాలు లేదా వాహనాలు బుక్ చేసుకోలేదు.";
    listEl.appendChild(emptyEl);
    return;
  }

  bookings.forEach(b => {
    const card = itemTpl.content.cloneNode(true);
    const isLocked = b.escrowLocked || (b.status && b.status.includes("Escrow"));

    card.querySelector(".booking-item-title").textContent = `🚜 ${b.itemName}`;

    const tag = card.querySelector(".booking-status-tag");
    tag.textContent = b.status;
    tag.classList.add(isLocked ? "locked" : "pending");

    card.querySelector(".booking-record-details").textContent = 
      `👤 యజమాని: ${b.ownerName} (${b.phone}) | 📅 తేదీ: ${b.date} | ⏱️ పరిమాణం: ${b.duration} | 💰 ధర: ${b.rate}`;

    card.querySelector(".slot-btn-call").href = `tel:${b.phone}`;
    card.querySelector(".slot-btn-whatsapp").href = `https://wa.me/91${b.phone}`;

    const lockBtn = card.querySelector(".btn-escrow");
    const lockTxt = card.querySelector(".txt-escrow-locked");

    if (isLocked) {
      lockBtn.remove();
      lockTxt.classList.remove("is-hidden");
    } else {
      lockBtn.onclick = function() {
        window.lockBookingEscrow(b.id, 500, b.itemName);
      };
    }

    listEl.appendChild(card);
  });
};

window.clearFarmerBookings = function() {
  if (confirm("బుకింగ్ రికార్డులన్నింటినీ తీసివేయాలా?")) {
    localStorage.removeItem("farmer_bookings");
    window.renderBookingRecords();
  }
};

window.lockBookingEscrow = function(bookingId, amount, itemName) {
  let bookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
  const b = bookings.find(x => x.id === bookingId);
  if (b) {
    b.escrowLocked = true;
    b.status = `₹${amount} Escrow Lock Aindi (Secure)`;
    localStorage.setItem("farmer_bookings", JSON.stringify(bookings));
    window.renderBookingRecords();
    if (window.renderWalletWidget) window.renderWalletWidget();
    alert(`🔒 ₹${amount} ఎస్క్రో లాక్ చేయబడింది (${itemName})!`);
  }
};

// 9. ⚡ స్పాట్ బుకింగ్ ఫంక్షన్స్
window.openSpotModal = function() {
  const modal = document.getElementById("spot-booking-modal");
  if (modal) modal.style.display = "flex";
};

window.closeSpotModal = function() {
  const modal = document.getElementById("spot-booking-modal");
  if (modal) modal.style.display = "none";
};

window.submitSpotAlert = function() {
  const typeSelect = document.getElementById("spot-service-type");
  const qtyInput = document.getElementById("spot-quantity");
  const wageInput = document.getElementById("spot-wage");

  const selectedType = typeSelect ? typeSelect.value : "LABOUR";
  const qty = qtyInput ? qtyInput.value.trim() : "";
  const wage = wageInput ? wageInput.value.trim() : "";

  if (!qty || !wage) {
    alert("దయచేసి అవసరమైన పరిమాణం మరియు వేతనం వివరాలను నమోదు చేయండి!");
    return;
  }

  const farmerName = window.AppState?.userProfile?.name || "రైతు";
  const farmerVillage = window.AppState?.userProfile?.village || "స్థానిక ప్రాంతం";

  const spotAlertData = {
    id: "SPOT-" + Date.now(),
    roleTarget: selectedType,
    farmerName: farmerName,
    location: farmerVillage,
    quantity: qty,
    wage: Number(wage),
    status: "URGENT_BROADCAST",
    createdAt: new Date().toLocaleTimeString('te-IN')
  };

  let alerts = JSON.parse(localStorage.getItem("agri_spot_alerts") || "[]");
  alerts.unshift(spotAlertData);
  localStorage.setItem("agri_spot_alerts", JSON.stringify(alerts));

  window.closeSpotModal();
  if (qtyInput) qtyInput.value = "";
  if (wageInput) wageInput.value = "";

  let categoryName = selectedType === "LABOUR" ? "కూలీలకు" : (selectedType === "TRACTOR" ? "ట్రాక్టర్ యజమానులకు" : "రవాణా డ్రైవర్లకు");
  alert(`🚨 మీ అత్యవసర స్పాట్ అభ్యర్థన సమీపంలోని ${categoryName} మాత్రమే తక్షణ అలర్ట్‌గా పంపబడింది!`);
};

// 10. మాడ్యూల్ ఎక్స్‌పోర్ట్
window.FarmerModule = window.FarmerModule || {};
window.FarmerModule.openSpotModal = window.openSpotModal;
window.FarmerModule.closeSpotModal = window.closeSpotModal;
window.FarmerModule.submitSpotAlert = window.submitSpotAlert;
window.FarmerModule.switchFarmerTab = window.switchFarmerTab;
window.FarmerModule.renderFarmerWidget = window.renderFarmerWidget;
window.FarmerModule.mountFarmerPersistentSwitchBar = window.mountFarmerPersistentSwitchBar;
