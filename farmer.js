// farmer.js - Clean & Modular Farmer Dashboard

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

// 2. Helper: Labour Form HTML
function getLabourFormHTML() {
  return `
    <form id="farmer-form" class="farmer-form">
      <div class="form-row">
        <input type="text" id="f-name" class="farmer-input" placeholder="మీ పేరు" required />
        <input type="tel" id="f-phone" class="farmer-input" placeholder="ఫోన్ నంబర్" required />
      </div>

      <div class="form-row">
        <input type="text" id="f-crop" class="farmer-input" placeholder="పంట" required />
        <input type="text" id="f-work" class="farmer-input" placeholder="పని" required />
      </div>

      <div class="form-row-spaced">
        <input type="number" id="f-count" class="farmer-input" placeholder="కూలీల సంఖ్య" required />
        <input type="number" id="f-wage" class="farmer-input" placeholder="రోజు కూలీ (₹)" required />
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
        <button type="button" id="f-village-btn" class="btn-village">🏛️ Hyderabad</button>
      </div>

      <div class="form-submit-row">
        <button type="submit" class="btn-submit-farmer">📢 Submit కూలీల కోసం</button>
      </div>
    </form>
  `;
}

// 3. Helper: Accepted Labours List HTML
function getAcceptedListHTML(jobs) {
  return `
    <div class="accepted-section">
      <div class="accepted-header">
        <h4>👥 Confirm అయిన కూలీలు (${jobs.length}):</h4>${jobs.length > 2 ? '<span class="scroll-hint">👇 scroll చేయండి</span>' : ''}
      </div>
      <div id="accepted-list" class="custom-scroll accepted-scroll-list">
        ${jobs.length === 0 ? `
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

        <!-- బుకింగ్ రికార్డులు కనిపించే కంటైనర్ (Tabs kindhaki shift chesam) -->
        <div id="farmer-booking-records"></div>
      </div>
    </div>
  `;

  // Booking records ventane chupinchadaniki call
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

    const newJob = {
      id: "JOB-" + Date.now(),
      farmerName: document.getElementById("f-name").value,
      farmerPhone: document.getElementById("f-phone").value,
      crop: document.getElementById("f-crop").value,
      workType: document.getElementById("f-work").value,
      count: document.getElementById("f-count").value,
      wage: document.getElementById("f-wage").value,
      date: document.getElementById("f-date").value,
      village: villageText,
      distanceKm: "2.5",
      lat: farmCoords.lat,
      lng: farmCoords.lng,
      status: "Open",
      labourName: "",
      labourPhone: ""
    };

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

    const bookingMsg = `నమస్తే ${ownerName} గారు, నేను (${farmerName}) మీ ${itemName} ను ${dateVal} తేదీన (${durVal}) కోసం బుక్ చేసుకోవాలనుకుంటున్నాను. వివరాలు తెలియజేయగలరు.`;
    const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(bookingMsg)}`;

    closeBookingModal();
    alert(`✅ ${itemName} బుకింగ్ అభ్యర్థన నమోదు చేయబడింది!`);

    if (typeof renderBookingRecords === "function") {
      renderBookingRecords();
    }

    window.open(waUrl, '_blank');
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
        <h4 style="margin:0; font-size:13px; color:#2e7d32;">📋 నా బుకింగ్‌లు (${bookings.length}):</h4>
        <button type="button" onclick="clearFarmerBookings()" style="background:#ffebee; color:#c62828; border:1px solid #ffcdd2; font-size:11px; padding:3px 8px; border-radius:4px; cursor:pointer; font-weight:600;">🗑️ క్లియర్ చేయండి</button>
      </div>
      ${bookings.map(b => {
        const isLocked = b.escrowLocked || b.status.includes("Escrow");
        return `
          <div class="booking-record-card" style="background:#ffffff; border:1px solid #e0e0e0; border-radius:8px; padding:10px; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <div class="rec-title-row" style="display:flex; justify-content:space-between; font-size:13px; font-weight:bold; color:#1b5e20;">
              <span>🚜 ${b.itemName}</span>
              <span class="rec-status-tag" style="background:${isLocked ? '#e8f5e9' : '#fff8e1'}; color:${isLocked ? '#2e7d32' : '#f57f17'}; font-size:11px; padding:2px 6px; border-radius:4px;">${b.status}</span>
            </div>
            <div class="rec-details-row" style="font-size:12px; color:#555; margin-top:4px; line-height:1.4;">
              👤 యజమాని: <b>${b.ownerName}</b> (${b.phone})<br>
              📅 తేదీ: <b>${b.date}</b> \vert{} ⏱️ పరిమాణం: <b>${b.duration}</b><br>
              💰 ధర: <b>${b.rate}</b>
            </div>
            ${isLocked ? `
              <div style="margin-top:6px; font-size:11px; color:#2e7d32; font-weight:bold; text-align:center; background:#e8f5e9; padding:4px; border-radius:4px;">
                ✅ ₹500 Escrow భద్రపరచబడింది
              </div>
            ` : `
              <button type="button" class="eq-btn-link" style="background:#fff3e0; color:#e65100; border:1px solid #ffe082; margin-top:8px; width:100%; cursor:pointer; font-weight:bold; padding:6px 0; border-radius:6px; font-size:12px;" onclick="lockBookingEscrow('${b.id}', 500, '${b.itemName}')">
                🔒 ₹500 అడ్వాన్స్ Escrow లాక్ చేయండి
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
