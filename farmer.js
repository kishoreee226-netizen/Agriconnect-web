// farmer.js - Complete Farmer Dashboard (All Legacy Features + Live Labour Slot Tracking & Cloud Sync)

// 1. Tab Switcher Function
window.switchFarmerTab = function(tab) {
  const panes = ['labour', 'equipment', 'seeds', 'transport'];

  panes.forEach(t => {
    const pane = document.getElementById(`farmer-pane-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (pane) pane.style.display = (t === tab) ? 'block' : 'none';
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

// 2. Helper: Labour Form HTML (Pani Post Chese Form)
function getLabourFormHTML() {
  return `
    <form id="farmer-form" class="farmer-form">
      <div class="form-row">
        <input type="text" id="f-name" class="farmer-input" placeholder="మీ పేరు" required />
        <input type="tel" id="f-phone" class="farmer-input" placeholder="ఫోన్ నంబర్" required />
      </div>

      <div class="form-row">
        <input type="text" id="f-crop" class="farmer-input" placeholder="పంట (ఉదా: వరి, పత్తి)" required />
        <input type="text" id="f-work" class="farmer-input" placeholder="పని (ఉదా: నాట్లు, కోత)" required />
      </div>

      <div class="form-row-spaced">
        <input type="number" id="f-count" class="farmer-input" placeholder="కూలీల సంఖ్య" required min="1" />
        <input type="number" id="f-wage" class="farmer-input" placeholder="రోజు కూలీ (₹)" required min="100" />
      </div>

      <div class="form-action-row">
        <input 
          type="text" 
          id="f-date" 
          class="input-date-fixed"
          placeholder="📅 పని తేదీ" 
          onfocus="(this.type='date'); this.showPicker && this.showPicker();" 
          onblur="if(!this.value) this.type='text';" 
          required 
        />
        <div class="gps-wrapper">
          <button type="button" id="loc-btn" class="btn-gps">📍 పొలం GPS</button>
          <span id="loc-status" class="gps-status-text"></span>
        </div>
        <button type="button" id="f-village-btn" class="btn-village">🏛️ Hanamkonda</button>
      </div>

      <div class="form-submit-row">
        <button type="submit" class="btn-submit-farmer">📢 Submit కూలీల కోసం (Post Alert)</button>
      </div>
    </form>
  `;
}

// 3. Helper: Live Tracking & Confirmed Labours List HTML (Slots + Legacy Format)
function getAcceptedListHTML(jobs) {
  // Cloud / Local nundi posted jobs anni read cheyadam
  let postedJobs = [];
  try {
    const stored = localStorage.getItem("agri_farmer_posted_jobs");
    postedJobs = stored ? JSON.parse(stored) : [];
  } catch (e) {
    postedJobs = [];
  }

  return `
    <div class="accepted-section" style="margin-top:14px;">
      
      <!-- 📋 Live Slot Tracker for Posted Jobs -->
      ${postedJobs.length > 0 ? `
        <div style="background:#f1f8e9; border:1px solid #c5e1a5; border-radius:8px; padding:10px; margin-bottom:12px;">
          <h4 style="margin:0 0 8px 0; color:#2e7d32; font-size:13px;">📋 మీరు పోస్ట్ చేసిన పనులు (Live Slot Tracking):</h4>
          ${postedJobs.map(j => {
            const confirmed = j.confirmedLabours || [];
            const reqCount = parseInt(j.totalRequired || j.count || 1);
            const isFull = confirmed.length >= reqCount;

            return `
              <div style="background:#ffffff; border:1px solid #e0e0e0; border-left:4px solid ${isFull ? '#2e7d32' : '#f57c00'}; border-radius:6px; padding:8px; margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="color:#2e7d32; font-size:12px;">🌾 ${j.crop} -${j.workType}</strong>
                  <span style="font-size:10px; padding:2px 6px; border-radius:8px; font-weight:bold; background:${isFull ? '#e8f5e9' : '#fff3e0'}; color:${isFull ? '#2e7d32' : '#e65100'};">
                    ${isFull ? '✅ కోటా పూర్తయింది' : '⏳ కూలీల కోసం చూస్తున్నారు'}
                  </span>
                </div>
                <div style="font-size:11px; color:#555; margin-top:2px;">
                  📅 తేదీ: <b>${j.workDate \vert{}\vert{} j.date}</b> \vert{} కోటా: <b>${confirmed.length} / ${reqCount} మంది ఖరారయ్యారు</b> \vert{} రేటు: ₹${j.wage}
                </div>

                ${confirmed.length > 0 ? `
                  <div style="margin-top:6px; padding-top:6px; border-top:1px dashed #e0e0e0;">
                    <span style="font-size:10px; font-weight:bold; color:#0277bd;">చేరిన కూలీలు:</span>
                    ${confirmed.map(c => `
                      <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:3px 6px; border-radius:4px; margin-top:3px;">
                        <span style="font-size:11px; color:#333;">👷 <b>${c.name}</b> (${c.phone})</span>
                        <div style="display:flex; gap:4px;">
                          <a href="tel:${c.phone}" style="padding:2px 6px; background:#0288d1; color:#fff; border-radius:3px; font-size:10px; text-decoration:none;">📞 కాల్</a>
                          <a href="https://wa.me/91${c.phone}" target="_blank" style="padding:2px 6px; background:#25d366; color:#fff; border-radius:3px; font-size:10px; text-decoration:none;">💬 వాట్సాప్</a>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- Patha Standard Accepted List (Backward Compatibility) -->
      <div class="accepted-header">
        <h4>👥 Confirm అయిన కూలీలు (${jobs.length}):</h4>${jobs.length > 2 ? '<span class="scroll-hint">👇 scroll చేయండి</span>' : ''}
      </div>
      <div id="accepted-list" class="custom-scroll accepted-scroll-list">
        ${jobs.length === 0 && postedJobs.length === 0 ? `
          <div class="empty-labour-msg">కూలీలు accept చేయగానే వారి వివరాలు ఇక్కడ కనిపిస్తాయి.</div>
        ` : jobs.map(j => `
          <div class="labour-card-item">
            <div class="labour-card-header">
              <strong>👷 ${j.labourName}</strong>
              <span class="labour-wage">₹${j.wage}</span>
            </div>
            <div class="labour-work-info">పని: ${j.crop} (${j.workType})</div>
            <div class="labour-action-links">
              <a href="tel:${j.labourPhone}" class="labour-btn-link link-call">📞 కాల్</a>
              <a href="sms:${j.labourPhone}?body=నమస్తే" class="labour-btn-link link-sms">✉️ SMS</a>
              <a href="https://wa.me/91${j.labourPhone}" target="_blank" class="labour-btn-link link-whatsapp">💬 వాట్సాప్</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 4. Main Farmer Widget Renderer
function renderFarmerWidget() {
  const container = document.getElementById("farmer-post-container");
  if (!container) return;

  const jobs = window.AgriState ? window.AgriState.getJobs() : [];
  const myAcceptedJobs = jobs.filter(j => j.status === "Confirmed");

  container.innerHTML = `
    <div class="farmer-card">
      <div class="farmer-card-header">
        <h3>👨‍🌾 రైతు Dashboard</h3>
        <span class="badge-live">Live</span>
      </div>

      <!-- 4 Compact Tabs -->
      <div class="eq-tabs-bar">
        <button id="tab-btn-labour" type="button" class="eq-tab-btn active" onclick="switchFarmerTab('labour')">👥 కూలీలు</button>
        <button id="tab-btn-equipment" type="button" class="eq-tab-btn" onclick="switchFarmerTab('equipment')">🚜 పరికరాలు</button>
        <button id="tab-btn-seeds" type="button" class="eq-tab-btn" onclick="switchFarmerTab('seeds')">🌱 విత్తనాలు</button>
        <button id="tab-btn-transport" type="button" class="eq-tab-btn" onclick="switchFarmerTab('transport')">🚛 రవాణా</button>
      </div>

      <div class="farmer-card-body">
        <!-- 4 Tab Panes -->
        <div id="farmer-pane-labour">
          ${getLabourFormHTML()}${getAcceptedListHTML(myAcceptedJobs)}
        </div>
        <div id="farmer-pane-equipment" style="display: none;"></div>
        <div id="farmer-pane-seeds" style="display: none;"></div>
        <div id="farmer-pane-transport" style="display: none;"></div>

        <!-- బుకింగ్ రికార్డులు కనిపించే కంటైనర్ -->
        <div id="farmer-booking-records"></div>
      </div>
    </div>
  `;

  // Booking records ventane chupinchadam
  renderBookingRecords();

  if (typeof prefillFarmerFormDefaults === "function") {
    prefillFarmerFormDefaults();
  }

  let farmCoords = { lat: 17.9784, lng: 79.5941 };

  document.getElementById("loc-btn")?.addEventListener("click", () => {
    const s = document.getElementById("loc-status");
    if (navigator.geolocation) {
      if (s) s.innerText = "GPS వెతుకుతోంది...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          farmCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (s) s.innerText = `✅ GPS set అయింది (${farmCoords.lat.toFixed(3)},${farmCoords.lng.toFixed(3)})`;
        },
        () => { 
          if (s) s.innerText = "default GPS set అయింది."; 
        }
      );
    }
  });

  document.getElementById("farmer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const villageText = document.getElementById("f-village-btn")?.textContent?.replace(/[🏛️🏘️\s]/g, '') || 
                        window.AppState?.userProfile?.village || "సమీప గ్రామం";

    const fName = document.getElementById("f-name").value.trim();
    const fPhone = document.getElementById("f-phone").value.trim();
    const crop = document.getElementById("f-crop").value.trim();
    const work = document.getElementById("f-work").value.trim();
    const count = parseInt(document.getElementById("f-count").value) || 1;
    const wage = parseFloat(document.getElementById("f-wage").value) || 450;
    const dateVal = document.getElementById("f-date").value;

    const newJob = {
      id: "JOB-" + Date.now(),
      farmerName: fName,
      farmerPhone: fPhone,
      crop: crop,
      workType: work,
      count: count,
      totalRequired: count,
      confirmedLabours: [],
      wage: wage,
      date: dateVal,
      workDate: dateVal,
      village: villageText,
      distanceKm: "2.5",
      lat: farmCoords.lat,
      lng: farmCoords.lng,
      status: "Open",
      labourName: "",
      labourPhone: "",
      transportNote: "రైతు రవాణా ఏర్పాటు చేస్తారు",
      createdAt: Date.now()
    };

    // 1. Firebase Firestore lo cloud save
    if (window.db) {
      window.db.collection("farmer_posted_jobs").add(newJob).catch(err => {
        console.warn("Cloud save error, fallback to local:", err);
      });
    }

    // 2. Local Storage sync
    let farmerPostedList = [];
    try {
      farmerPostedList = JSON.parse(localStorage.getItem("agri_farmer_posted_jobs") || "[]");
    } catch (err) {}
    farmerPostedList.unshift(newJob);
    localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(farmerPostedList));

    // 3. Patha AgriState legacy compatibility
    if (window.AgriState && typeof window.AgriState.addJob === "function") {
      window.AgriState.addJob(newJob);
    } else {
      let savedJobs = [];
      try {
        savedJobs = JSON.parse(localStorage.getItem("agri_jobs") || "[]");
      } catch (err) {}
      savedJobs.unshift(newJob);
      localStorage.setItem("agri_jobs", JSON.stringify(savedJobs));
    }

    // Form Reset
    document.getElementById("f-crop").value = "";
    document.getElementById("f-work").value = "";
    document.getElementById("f-count").value = "";
    document.getElementById("f-wage").value = "";
    const dateInput = document.getElementById("f-date");
    if (dateInput) {
      dateInput.value = "";
      dateInput.type = "text";
    }

    renderFarmerWidget();
    if (typeof renderLabourWidget === "function") {
      renderLabourWidget();
    }

    if (typeof speakTeluguText === "function") {
      speakTeluguText("పని వివరాలు విజయవంతంగా పోస్ట్ చేయబడ్డాయి.");
    } else {
      alert("📢 పని కూలీల Dashboard లో live గా post చేయబడింది!");
    }
  });
}

window.renderFarmerWidget = renderFarmerWidget;

// 5. Global Booking Pop-up Logic
window.openBookingModal = function(itemName, ownerName, rate, phone) {
  const oldModal = document.getElementById("booking-modal");
  if (oldModal) oldModal.remove();

  const farmerName = document.getElementById("f-name")?.value || window.AppState?.userProfile?.name || "రైతు";

  const modalHtml = `
    <div id="booking-modal" class="booking-modal-overlay">
      <div class="booking-modal-box">
        <div class="booking-modal-header">
          <h4>📋 బుకింగ్ అభ్యర్థన</h4>
          <button type="button" class="btn-modal-close" onclick="closeBookingModal()">✖</button>
        </div>
        <div style="font-size: 13px; margin-bottom: 12px; color: #333;">
          <strong>వస్తువు:</strong> ${itemName} <br>
          <strong>ధర:</strong> <span style="color:#e65100; font-weight:bold;">${rate}</span>
        </div>
        <form id="booking-request-form">
          <div class="modal-form-group">
            <label>📅 కావలసిన తేదీ:</label>
            <input type="date" id="book-date" class="modal-input" required />
          </div>
          <div class="modal-form-group">
            <label>⏱️ వ్యవధి / విస్తీర్ణం (గంటలు / ఎకరాలు / ట్రిప్పులు):</label>
            <input type="text" id="book-duration" class="modal-input" placeholder="ఉదా: 3 గంటలు లేదా 2 ఎకరాలు" required />
          </div>
          <button type="submit" class="btn-confirm-booking">✅ అభ్యర్థన పంపండి</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('booking-request-form')?.addEventListener("submit", function(e) {
    e.preventDefault();
    const dateVal = document.getElementById('book-date').value;
    const durVal = document.getElementById('book-duration').value;

    const newBooking = {
      id: "BK-" + Date.now(),
      itemName: itemName,
      ownerName: ownerName,
      rate: rate,
      phone: phone,
      date: dateVal,
      duration: durVal,
      status: "అభ్యర్థన పంపబడింది (Pending)",
      escrowLocked: false
    };

    let savedBookings = [];
    try {
      savedBookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
    } catch (err) {}
    savedBookings.unshift(newBooking);
    localStorage.setItem("farmer_bookings", JSON.stringify(savedBookings));

    closeBookingModal();
    alert(`✅ ${itemName} బుకింగ్ అభ్యర్థన విజయవంతంగా నమోదైంది!`);

    if (typeof renderBookingRecords === "function") {
      renderBookingRecords();
    }
  });
};

window.closeBookingModal = function() {
  const modal = document.getElementById("booking-modal");
  if (modal) modal.remove();
};

// 6. Booking Records Rendering Function
window.renderBookingRecords = function() {
  const container = document.getElementById("farmer-booking-records");
  if (!container) return;

  let bookings = [];
  try {
    bookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
  } catch (err) {}

  if (bookings.length === 0) {
    container.innerHTML = ``;
    return;
  }

  container.innerHTML = `
    <div class="booking-records-section" style="margin-top: 15px; max-height: 280px; overflow-y: auto; border: 1px solid #c8e6c9; border-radius: 10px; padding: 10px; background: #fafdfa;">
      <div class="booking-records-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h4 style="margin:0; font-size:13px; color:#2e7d32;">📋 Naa Bookinglu (${bookings.length}):</h4>
        <button type="button" onclick="clearFarmerBookings()" style="background:#ffebee; color:#c62828; border:1px solid #ffcdd2; font-size:11px; padding:3px 8px; border-radius:4px; cursor:pointer; font-weight:600;">🗑️ Clear Cheyandi</button>
      </div>
      ${bookings.map(b => {
        const isLocked = b.escrowLocked || (b.status && b.status.includes("Escrow"));
        const bookingMsg = `Namaste ${b.ownerName} gaaru, nenu mee${b.itemName} nu ${b.date} theedhina (${b.duration}) kosam book chesukunanu. Dayachesi vivaralu confirm cheyagalaru.`;
        const waUrl = `https://wa.me/91${b.phone}?text=${encodeURIComponent(bookingMsg)}`;

        return `
          <div class="booking-record-card" style="background:#ffffff; border:1px solid #e0e0e0; border-radius:8px; padding:10px; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <div class="rec-title-row" style="display:flex; justify-content:space-between; font-size:13px; font-weight:bold; color:#1b5e20;">
              <span>🚜 ${b.itemName}</span>
              <span class="rec-status-tag" style="background:${isLocked ? '#e8f5e9' : '#fff8e1'}; color:${isLocked ? '#2e7d32' : '#f57f17'}; font-size:11px; padding:2px 6px; border-radius:4px;">${b.status}</span>
            </div>
            <div class="rec-details-row" style="font-size:12px; color:#555; margin-top:4px; line-height:1.4;">
              👤 Yajamaani: <b>${b.ownerName}</b> (${b.phone})<br>
              📅 Theedhi: <b>${b.date}</b>  \vert{} ⏱️ Parimaanam: <b>${b.duration}</b><br>
              💰 Dhara: <b>${b.rate}</b>
            </div>

            <!-- WhatsApp mariyu Call buttons -->
            <div style="display:flex; gap:6px; margin-top:8px;">
              <a href="${waUrl}" target="_blank" style="flex:1; text-align:center; background:#e8f5e9; color:#1b5e20; border:1px solid #c8e6c9; padding:5px 0; border-radius:6px; font-size:12px; text-decoration:none; font-weight:bold;">
                💬 WhatsApp
              </a>
              <a href="tel:${b.phone}" style="flex:1; text-align:center; background:#e3f2fd; color:#0d47a1; border:1px solid #bbdefb; padding:5px 0; border-radius:6px; font-size:12px; text-decoration:none; font-weight:bold;">
                📞 Call
              </a>
            </div>

            ${isLocked ? `
              <div style="margin-top:6px; font-size:11px; color:#2e7d32; font-weight:bold; text-align:center; background:#e8f5e9; padding:4px; border-radius:4px;">
                ✅ ₹500 Escrow Bhadraparachabadindi
              </div>
            ` : `
              <button type="button" class="eq-btn-link" style="background:#fff3e0; color:#e65100; border:1px solid #ffe082; margin-top:8px; width:100%; cursor:pointer; font-weight:bold; padding:6px 0; border-radius:6px; font-size:12px;" onclick="lockBookingEscrow('${b.id}', 500, '${b.itemName}')">
                🔒 ₹500 Advance Escrow Lock Cheyandi
              </button>
            `}
          </div>
        `;
      }).join('')}
    </div>
  `;
};

// 7. Helper: Clear All Bookings
window.clearFarmerBookings = function() {
  if (confirm("బుకింగ్ రికార్డులన్నింటినీ తీసివేయాలా?")) {
    localStorage.removeItem("farmer_bookings");
    renderBookingRecords();
  }
};
