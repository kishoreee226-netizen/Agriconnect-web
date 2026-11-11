// farmer/farmer.js - Comprehensive Farmer Orchestrator

window.renderFarmerLandingCard = function() {
  const mount = document.getElementById("farmer-post-container");
  if (!mount) return;

  const tpl = document.getElementById("farmer-landing-template");
  if (!tpl) return;

  mount.replaceChildren(tpl.content.cloneNode(true));
  mount.style.setProperty('display', 'block', 'important');
};

// 1. Tab Switcher Function
window.switchFarmerTab = function(tab) {
  const panes = ['labour', 'equipment', 'seeds', 'transport'];

  panes.forEach(t => {
    const pane = document.getElementById(`farmer-pane-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (pane) {
      if (t === tab) {
        pane.classList.remove('is-hidden');
        pane.style.display = 'block';
      } else {
        pane.classList.add('is-hidden');
        pane.style.display = 'none';
      }
    }
    if (btn) btn.classList.toggle('active', t === tab);
  });

  if (tab === 'equipment' && typeof window.renderEquipmentWidget === 'function') {
    window.renderEquipmentWidget('farmer-pane-equipment');
  } else if (tab === 'seeds' && typeof window.renderSeedsWidget === 'function') {
    window.renderSeedsWidget('farmer-pane-seeds');
  } else if (tab === 'transport' && typeof window.renderTransportWidget === 'function') {
    window.renderTransportWidget('farmer-pane-transport');
  }
};

// 2. Main Farmer Widget Renderer
window.renderFarmerWidget = function() {
  const container = document.getElementById("farmer-post-container");
  if (!container) return;

  const tpl = document.getElementById("farmer-dashboard-template");
  if (!tpl) return;

  container.replaceChildren(tpl.content.cloneNode(true));

  // Labour Form ని ఇన్సర్ట్ చేయడం
  const formWrap = document.getElementById("farmer-labour-form-wrapper");
  const formTpl = document.getElementById("farmer-labour-form-template");
  if (formWrap && formTpl) {
    formWrap.replaceChildren(formTpl.content.cloneNode(true));
  }

  // Accepted Labours లిస్ట్ రెండర్
  renderFarmerAcceptedList();

  // Booking Records రెండర్
  window.renderBookingRecords();

  prefillFarmerFormDefaults();
  bindFarmerFormEvents();
};

window.renderFarmerLabourPane = window.renderFarmerWidget;

// 3. Accepted List & Slot Tracking (Confirm అయిన కూలీల వివరాలతో సహా)
function renderFarmerAcceptedList() {
  const wrap = document.getElementById("farmer-accepted-section-wrapper");
  if (!wrap) return;

  let postedJobs = [];
  try {
    const stored = localStorage.getItem("agri_farmer_posted_jobs");
    postedJobs = stored ? JSON.parse(stored) : [];
  } catch (e) {
    postedJobs = [];
  }

  // కూలీల వివరాల సేకరణ
  let allConfirmed = [];
  postedJobs.forEach(pj => {
    if (pj.confirmedLabours && Array.isArray(pj.confirmedLabours)) {
      pj.confirmedLabours.forEach(c => {
        allConfirmed.push({
          labourName: c.name || "కూలీ",
          labourPhone: c.phone || "",
          crop: pj.crop,
          workType: pj.workType,
          wage: pj.wage
        });
      });
    }
  });

  let html = `
    <div class="accepted-section" style="margin-top: 14px;">
      <!-- A. Live Slot Tracking -->
      <div class="slot-tracker-box" style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px; margin-bottom:12px;">
        <h4 class="slot-tracker-title" style="margin:0 0 8px; font-size:13px; color:#166534;">📋 మీరు పోస్ట్ చేసిన పనులు (Live Slot Tracking):</h4>
        ${postedJobs.length === 0 ? `
          <div style="font-size:12px; color:#64748b; text-align:center; padding:8px;">మీరు ఇంకా ఎలాంటి పనులు పోస్ట్ చేయలేదు.</div>
        ` : `
          <div class="slot-tracker-scroll custom-scroll" style="max-height:220px; overflow-y:auto;">
            ${postedJobs.map(j => {
              const confirmed = j.confirmedLabours || [];
              const reqCount = parseInt(j.totalRequired || j.count || 1);
              const isFull = confirmed.length >= reqCount;

              return `
                <div class="slot-job-card ${isFull ? 'is-full' : ''}" style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:10px; margin-bottom:8px;">
                  <div class="slot-card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <strong class="slot-job-title" style="font-size:13px; color:#1e293b;">🌾 ${j.crop} - ${j.workType}</strong>
                    <span class="slot-status-badge ${isFull ? 'is-full' : ''}" style="font-size:10px; padding:2px 6px; border-radius:4px; background:${isFull ? '#dcfce7' : '#fef3c7'}; color:${isFull ? '#166534' : '#b45309'}; font-weight:bold;">
                      ${isFull ? '✅ కోటా పూర్తయింది' : '⏳ కూలీల కోసం చూస్తున్నారు'}
                    </span>
                  </div>
                  <div class="slot-job-details" style="font-size:11px; color:#64748b; margin:4px 0;">
                    📅 తేదీ: <b>${j.workDate || j.date || 'ఈ రోజు'}</b> | కోటా: <b>${confirmed.length} / ${reqCount} మంది</b> | రేటు: ₹${j.wage}
                  </div>
                  ${confirmed.length > 0 ? `
                    <div class="slot-labours-wrapper" style="margin-top:6px; padding-top:4px; border-top:1px dashed #e2e8f0;">
                      <span style="font-size:11px; font-weight:bold; color:#166534;">చేరిన కూలీలు:</span>
                      ${confirmed.map(c => `
                        <div class="slot-labour-row" style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                          <span class="slot-labour-info" style="font-size:11px;">👷 <b>${c.name}</b> (${c.phone})</span>
                          <div class="slot-btn-group">
                            <a href="tel:${c.phone}" class="slot-btn-call" style="padding:2px 6px; background:#dbeafe; color:#1e40af; border-radius:4px; text-decoration:none; font-size:10px; font-weight:bold;">📞 కాల్</a>
                            <a href="https://wa.me/91${c.phone}" target="_blank" class="slot-btn-whatsapp" style="padding:2px 6px; background:#dcfce7; color:#166534; border-radius:4px; text-decoration:none; font-size:10px; font-weight:bold; margin-left:4px;">💬 వాట్సాప్</a>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- B. Confirm అయిన కూలీల ప్రత్యేక కార్డ్స్ -->
      <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; padding:12px; margin-bottom:12px;">
        <h4 style="margin:0 0 10px; font-size:13px; color:#1e293b;">👥 Confirm అయిన కూలీలు (${allConfirmed.length}):</h4>
        <div id="accepted-list" class="custom-scroll" style="max-height:200px; overflow-y:auto;">
          ${allConfirmed.length === 0 ? `
            <div style="font-size:12px; color:#64748b; text-align:center; padding:8px;">
              కూలీలు పనిని accept చేయగానే వారి వివరాలు ఇక్కడ కనిపిస్తాయి.
            </div>
          ` : allConfirmed.map(j => `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-bottom:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>👷 ${j.labourName}</strong>
                <span style="background:#dcfce7; color:#166534; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:12px;">₹${j.wage}</span>
              </div>
              <div style="font-size:12px; color:#475569; margin:4px 0;">పని: ${j.crop} (${j.workType})</div>
              <div style="display:flex; gap:6px; margin-top:6px;">
                <a href="tel:${j.labourPhone}" style="padding:4px 8px; background:#dbeafe; color:#1e40af; border-radius:4px; text-decoration:none; font-size:11px; font-weight:bold;">📞 కాల్</a>
                <a href="https://wa.me/91${j.labourPhone}" target="_blank" style="padding:4px 8px; background:#dcfce7; color:#166534; border-radius:4px; text-decoration:none; font-size:11px; font-weight:bold;">💬 వాట్సాప్</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  wrap.innerHTML = html;
}

// 4. Form Events & Submit
function bindFarmerFormEvents() {
  let farmCoords = null;

  document.getElementById("loc-btn")?.addEventListener("click", () => {
    const s = document.getElementById("loc-status");
    if (navigator.geolocation) {
      if (s) s.innerText = "GPS వెతుకుతోంది...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          farmCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (s) s.innerText = `✅ GPS set అయింది`;
        },
        () => { if (s) s.innerText = "స్థానిక గ్రామం వర్తిస్తుంది."; },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  });

  document.getElementById("farmer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const villageText = document.getElementById("f-village-btn")?.textContent?.replace(/[🏛️🏘️\s]/g, '') || 
                        window.AppState?.userProfile?.village || "స్థానిక పరిధి";

    const newJob = {
      id: "JOB-" + Date.now(),
      farmerName: document.getElementById("f-name").value.trim(),
      farmerPhone: document.getElementById("f-phone").value.trim(),
      crop: document.getElementById("f-crop").value.trim(),
      workType: document.getElementById("f-work").value.trim(),
      count: parseInt(document.getElementById("f-count").value) || 1,
      totalRequired: parseInt(document.getElementById("f-count").value) || 1,
      confirmedLabours: [],
      wage: parseFloat(document.getElementById("f-wage").value) || 450,
      date: document.getElementById("f-date").value,
      workDate: document.getElementById("f-date").value,
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

// 5. Job Posting Modal
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

  if (modal) modal.style.display = "flex";
};

window.closeFarmerJobModal = function() {
  const modal = document.getElementById("farmerJobModal");
  if (modal) modal.style.display = "none";
};

window.handleFarmerJobSubmit = function(e) {
  e.preventDefault();

  const newJob = {
    id: "job_" + Date.now(),
    farmerName: document.getElementById("fjm_name").value.trim(),
    farmerPhone: document.getElementById("fjm_phone").value.trim(),
    crop: document.getElementById("fjm_crop").value,
    workType: document.getElementById("fjm_work").value,
    count: parseInt(document.getElementById("fjm_required").value) || 1,
    totalRequired: parseInt(document.getElementById("fjm_required").value) || 1,
    confirmedLabours: [],
    wage: parseFloat(document.getElementById("fjm_wage").value) || 450,
    workDate: document.getElementById("fjm_date").value,
    date: document.getElementById("fjm_date").value,
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

// 6. Booking Modal & Escrow Logic
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

  modal.style.display = "flex";
};

window.closeBookingModal = function() {
  const modal = document.getElementById("booking-modal");
  if (modal) modal.style.display = "none";
};

// 7. పరికరాల బుకింగ్ రికార్డులు (Naa Bookinglu)
window.renderBookingRecords = function() {
  const container = document.getElementById("farmer-booking-records");
  if (!container) return;

  let bookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");

  container.innerHTML = `
    <div class="booking-records-section" style="margin-top: 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h4 style="margin: 0; font-size: 13px; color: #1e293b;">📋 నా పరికరాల & వాహనాల బుకింగ్‌లు (${bookings.length}):</h4>
        ${bookings.length > 0 ? `
          <button type="button" onclick="window.clearFarmerBookings()" style="background: none; border: none; color: #ef4444; font-size: 11px; font-weight: bold; cursor: pointer;">🗑️ Clear</button>
        ` : ''}
      </div>
      
      ${bookings.length === 0 ? `
        <div style="font-size: 12px; color: #64748b; text-align: center; padding: 10px;">
          మీరు ఇంకా ఎలాంటి పరికరాలు లేదా వాహనాలు బుక్ చేసుకోలేదు.
        </div>
      ` : `
        <div class="booking-records-scroll custom-scroll" style="max-height: 250px; overflow-y: auto;">
          ${bookings.map(b => {
            const isLocked = b.escrowLocked || (b.status && b.status.includes("Escrow"));
            return `
              <div class="booking-record-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-top: 8px; background: #f8fafc;">
                <div style="display: flex; justify-content: space-between;">
                  <span>🚜 <b>${b.itemName}</b></span>
                  <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: ${isLocked ? '#dcfce7' : '#fef3c7'}; color: ${isLocked ? '#166534' : '#b45309'}; font-weight: bold;">${b.status}</span>
                </div>
                <div style="font-size: 12px; color: #475569; margin: 4px 0;">
                  👤 యజమాని: <b>${b.ownerName}</b> (${b.phone})<br>
                  📅 తేదీ: <b>${b.date}</b> | ⏱️ పరిమాణం: <b>${b.duration}</b> | 💰 ధర: <b>${b.rate}</b>
                </div>
                <div style="display: flex; gap: 6px; align-items: center; margin-top: 6px;">
                  <a href="tel:${b.phone}" style="padding: 4px 8px; background: #dbeafe; color: #1e40af; text-decoration: none; border-radius: 4px; font-size: 11px; font-weight: bold;">📞 కాల్</a>
                  <a href="https://wa.me/91${b.phone}" target="_blank" style="padding: 4px 8px; background: #dcfce7; color: #166534; text-decoration: none; border-radius: 4px; font-size: 11px; font-weight: bold;">💬 వాట్సాప్</a>
                  ${!isLocked ? `
                    <button onclick="lockBookingEscrow('${b.id}', 500, '${b.itemName}')" style="padding: 4px 8px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; color: #b45309;">
                      🔒 ₹500 Escrow Lock
                    </button>
                  ` : '<span style="color: #16a34a; font-weight: bold; font-size: 11px;">✅ Escrow Locked</span>'}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
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
// ⚡ 5. స్పాట్ బుకింగ్ ఫంక్షన్స్
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

  const spotAlertData = {
    id: "SPOT-" + Date.now(),
    roleTarget: selectedType,
    farmerName: "Kishor",
    location: "Warangal",
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

// మాడ్యూల్ ఆబ్జెక్ట్ కోసం లింక్
if (window.FarmerModule) {
  window.FarmerModule.openSpotModal = window.openSpotModal;
  window.FarmerModule.closeSpotModal = window.closeSpotModal;
  window.FarmerModule.submitSpotAlert = window.submitSpotAlert;
}
