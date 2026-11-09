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
  if (typeof window.renderBookingRecords === "function") {
    window.renderBookingRecords();
  }

  prefillFarmerFormDefaults();
  bindFarmerFormEvents();
};

window.renderFarmerLabourPane = window.renderFarmerWidget;

// 3. Accepted List & Slot Tracking
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

  let html = `
    <div class="accepted-section">
      ${postedJobs.length > 0 ? `
        <div class="slot-tracker-box">
          <h4 class="slot-tracker-title">📋 మీరు పోస్ట్ చేసిన పనులు (Live Slot Tracking):</h4>
          <div class="slot-tracker-scroll custom-scroll">
            ${postedJobs.map(j => {
              const confirmed = j.confirmedLabours || [];
              const reqCount = parseInt(j.totalRequired || j.count || 1);
              const isFull = confirmed.length >= reqCount;

              return `
                <div class="slot-job-card ${isFull ? 'is-full' : ''}">
                  <div class="slot-card-header">
                    <strong class="slot-job-title">🌾 ${j.crop} - ${j.workType}</strong>
                    <span class="slot-status-badge ${isFull ? 'is-full' : ''}">
                      ${isFull ? '✅ కోటా పూర్తయింది' : '⏳ కూలీల కోసం చూస్తున్నారు'}
                    </span>
                  </div>
                  <div class="slot-job-details">
                    📅 తేదీ: <b>${j.workDate || j.date || 'ఈ రోజు'}</b> | కోటా: <b>${confirmed.length} / ${reqCount} మంది</b> | రేటు: ₹${j.wage}
                  </div>
                  ${confirmed.length > 0 ? `
                    <div class="slot-labours-wrapper">
                      ${confirmed.map(c => `
                        <div class="slot-labour-row">
                          <span class="slot-labour-info">👷 <b>${c.name}</b> (${c.phone})</span>
                          <div class="slot-btn-group">
                            <a href="tel:${c.phone}" class="slot-btn-call">📞 కాల్</a>
                            <a href="https://wa.me/91${c.phone}" target="_blank" class="slot-btn-whatsapp">💬 వాట్సాప్</a>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
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

// 5. Job Posting Modal (Auto-Prefill & Handle)
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

window.renderBookingRecords = function() {
  const container = document.getElementById("farmer-booking-records");
  if (!container) return;

  let bookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
  if (bookings.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="booking-records-section">
      <h4>📋 Naa Bookinglu (${bookings.length}):</h4>
      ${bookings.map(b => `
        <div class="booking-record-card" style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-top: 8px;">
          <div>🚜 <b>${b.itemName}</b> | Status: <b>${b.status}</b></div>
          <div>👤 యజమాని: ${b.ownerName} (${b.phone}) | తేదీ: ${b.date}</div>
          <div style="margin-top: 6px;">
            <a href="tel:${b.phone}" style="padding: 4px 8px; background: #dbeafe; text-decoration: none; border-radius: 4px;">📞 కాల్</a>
            <a href="https://wa.me/91${b.phone}" target="_blank" style="padding: 4px 8px; background: #dcfce7; text-decoration: none; border-radius: 4px; margin-left: 6px;">💬 వాట్సాప్</a>
            ${!b.escrowLocked ? `
              <button onclick="lockBookingEscrow('${b.id}', 500, '${b.itemName}')" style="margin-left:6px; padding:4px 8px; background:#fef3c7; border:none; border-radius:4px; cursor:pointer;">
                🔒 ₹500 Escrow Lock
              </button>
            ` : '<span style="color:#16a34a; font-weight:bold; margin-left:6px;">✅ Escrow Locked</span>'}
          </div>
        </div>
      `).join('')}
    </div>
  `;
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
