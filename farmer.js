// farmer.js - Complete Farmer Dashboard (All Legacy Features + Live Labour Slot Tracking + Escrow Logic & Real-time Cloud Sync)

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

// 2. Helper: Labour Form HTML (పని పోస్ట్ చేసే ఫారమ్)
function getLabourFormHTML() {
  const userVillage = window.AppState?.userProfile?.village || "హనుమకొండ";

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
        <button type="button" id="f-village-btn" class="btn-village">🏛️ ${userVillage}</button>
      </div>

      <div class="farmer-submit-row">
        <button type="submit" class="btn-farmer-post">
          📢 Submit కూలీల కోసం (Post Alert)
        </button>
      </div>
    </form>
  `;
}

// 3. Helper: Live Tracking & Confirmed Labours List HTML (Slots + Backward Compatibility)
function getAcceptedListHTML(jobs) {
  let postedJobs = [];
  try {
    const stored = localStorage.getItem("agri_farmer_posted_jobs");
    postedJobs = stored ? JSON.parse(stored) : [];
  } catch (e) {
    postedJobs = [];
  }

  return `
    <div class="accepted-section">
      
      <!-- 📋 Live Slot Tracker for Posted Jobs (స్క్రోలర్‌తో కూడిన బాక్స్) -->
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
                    📅 తేదీ: <b>${j.workDate || j.date || 'ఈ రోజు'}</b> | కోటా: <b>${confirmed.length} / ${reqCount} మంది ఖరారయ్యారు</b> | రేటు: ₹${j.wage}
                  </div>

                  <!-- ఒప్పుకున్న కూలీల వివరాలు, కాల్ & వాట్సాప్ -->
                  ${confirmed.length > 0 ? `
                    <div class="slot-labours-wrapper">
                      <span class="slot-labour-head">చేరిన కూలీలు:</span>
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

      <!-- Standard Accepted List -->
      <div class="accepted-header">
        <h4>👥 Confirm అయిన కూలీలు:</h4>
      </div>
      <div id="accepted-list" class="custom-scroll accepted-scroll-list">
        ${(() => {
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

          jobs.forEach(j => {
            allConfirmed.push(j);
          });

          if (allConfirmed.length === 0) {
            return '<div class="empty-labour-msg">కూలీలు accept చేయగానే వారి వివరాలు ఇక్కడ కనిపిస్తాయి.</div>';
          }

          return allConfirmed.map(j => `
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
          `).join('');
        })()}
      </div>

    </div>
  `;
}

// 4. Main Farmer Widget Renderer
window.renderFarmerWidget = function() {
  const container = document.getElementById("farmer-post-container");
  if (!container) return;

  let jobs = [];
  try {
    if (window.AgriState && typeof window.AgriState.getJobs === "function") {
      const res = window.AgriState.getJobs();
      jobs = Array.isArray(res) ? res : [];
    }
  } catch (err) {
    jobs = [];
  }

  const myAcceptedJobs = (Array.isArray(jobs) ? jobs : []).filter(j => j && j.status === "Confirmed");

  container.innerHTML = `
    <div class="farmer-card">

      <div class="farmer-card-header">
        <h3>👨‍🌾 రైతు Dashboard</h3>
        <span class="badge-live">Live</span>
      </div>

      <!-- 4 Compact Tabs (Colourful Buttons) -->
      <div class="eq-tabs-bar">
        <button id="tab-btn-labour" type="button" class="eq-tab-btn active" onclick="switchFarmerTab('labour')">
          👥 కూలీలు
        </button>
        <button id="tab-btn-equipment" type="button" class="eq-tab-btn" onclick="switchFarmerTab('equipment')">
          🚜 పరికరాలు
        </button>
        <button id="tab-btn-seeds" type="button" class="eq-tab-btn" onclick="switchFarmerTab('seeds')">
          🌱 విత్తనాలు
        </button>
        <button id="tab-btn-transport" type="button" class="eq-tab-btn" onclick="switchFarmerTab('transport')">
          🚚 రవాణా
        </button>
      </div>

      <div class="farmer-card-body">
        <!-- 4 Tab Panes -->
        <div id="farmer-pane-labour" class="farmer-pane">
          ${getLabourFormHTML()}${getAcceptedListHTML(myAcceptedJobs)}
        </div>
        <div id="farmer-pane-equipment" class="farmer-pane is-hidden" style="display: none;"></div>
        <div id="farmer-pane-seeds" class="farmer-pane is-hidden" style="display: none;"></div>
        <div id="farmer-pane-transport" class="farmer-pane is-hidden" style="display: none;"></div>

        <!-- బుకింగ్ రికార్డులు కనిపించే కంటైనర్ -->
        <div id="farmer-booking-records"></div>
      </div>
    </div>
  `;

  // బుకింగ్ రికార్డులను రెండర్ చేయడం
  if (typeof renderBookingRecords === "function") {
    renderBookingRecords();
  }

  if (typeof prefillFarmerFormDefaults === "function") {
    prefillFarmerFormDefaults();
  }

  let farmCoords = null;

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
          if (s) s.innerText = "స్థానిక గ్రామం వర్తిస్తుంది."; 
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  });

  document.getElementById("farmer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const villageText = document.getElementById("f-village-btn")?.textContent?.replace(/[🏛️🏘️\s]/g, '') || 
                        window.AppState?.userProfile?.village || "స్థానిక పరిధి";

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
      lat: farmCoords ? farmCoords.lat : null,
      lng: farmCoords ? farmCoords.lng : null,
      status: "Open",
      labourName: "",
      labourPhone: "",
      transportNote: "రైతు రవాణా ఏర్పాటు చేస్తారు",
      createdAt: Date.now()
    };

    // 1. Firebase Firestore Real-time Cloud Save
    if (window.db) {
      window.db.collection("farmer_posted_jobs").add(newJob).catch(err => {
        console.warn("Cloud save error, fallback to local:", err);
      });
    }

    // 2. Local Storage Sync
    let farmerPostedList = [];
    try {
      farmerPostedList = JSON.parse(localStorage.getItem("agri_farmer_posted_jobs") || "[]");
    } catch (err) {}
    farmerPostedList.unshift(newJob);
    localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(farmerPostedList));

    // 3. AgriState Legacy Compatibility
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

    // ఫారమ్ ఫీల్డ్స్ రీసెట్
    document.getElementById("f-crop").value = "";
    document.getElementById("f-work").value = "";
    document.getElementById("f-count").value = "";
    document.getElementById("f-wage").value = "";
    const dateInput = document.getElementById("f-date");
    if (dateInput) {
      dateInput.value = "";
      dateInput.type = "text";
    }

    window.renderFarmerWidget();
    if (typeof renderLabourWidget === "function") {
      renderLabourWidget();
    }

    if (typeof speakTeluguText === "function") {
      speakTeluguText("పని వివరాలు విజయవంతంగా పోస్ట్ చేయబడ్డాయి.");
    } else {
      alert("📢 పని కూలీల Dashboard లో live గా post చేయబడింది!");
    }
  });
};

// Compatibility Alias
window.renderFarmerLabourPane = window.renderFarmerWidget;

// 5. Global Booking Pop-up Logic
window.openBookingModal = function(itemName, ownerName, rate, phone) {
  const oldModal = document.getElementById("booking-modal");
  if (oldModal) oldModal.remove();

  const modalHtml = `
    <div id="booking-modal" class="booking-modal-overlay">
      <div class="booking-modal-box">
        <div class="booking-modal-header">
          <h4>📋 బుకింగ్ అభ్యర్థన</h4>
          <button type="button" class="btn-modal-close" onclick="closeBookingModal()">✖</button>
        </div>
        <div class="booking-item-highlight">
          <strong>వస్తువు:</strong> ${itemName} <br>
          <strong>ధర:</strong> <span class="booking-rate-text">${rate}</span>
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
    <div class="booking-records-section">
      <div class="booking-records-header">
        <h4 class="booking-records-title">📋 Naa Bookinglu (${bookings.length}):</h4>
        <button type="button" onclick="clearFarmerBookings()" class="btn-clear-bookings">🗑️ Clear Cheyandi</button>
      </div>
      <div class="booking-records-scroll custom-scroll">
        ${bookings.map(b => {
          const isLocked = b.escrowLocked || (b.status && b.status.includes("Escrow"));
          const bookingMsg = `Namaste ${b.ownerName} gaaru, nenu mee ${b.itemName} nu ${b.date} theedhina (${b.duration}) kosam book chesukunanu. Dayachesi vivaralu confirm cheyagalaru.`;
          const waUrl = `https://wa.me/91${b.phone}?text=${encodeURIComponent(bookingMsg)}`;

          return `
            <div class="booking-record-card">
              <div class="rec-title-row">
                <span>🚜 ${b.itemName}</span>
                <span class="rec-status-tag ${isLocked ? 'is-locked' : ''}">${b.status}</span>
              </div>
              <div class="rec-details-row">
                👤 Yajamaani: <b>${b.ownerName}</b> (${b.phone})<br>
                📅 Theedhi: <b>${b.date}</b> | ⏱️ Parimaanam: <b>${b.duration}</b><br>
                💰 Dhara: <b>${b.rate}</b>
              </div>

              <!-- WhatsApp & Call బటన్లు -->
              <div class="rec-action-buttons">
                <a href="${waUrl}" target="_blank" class="rec-btn-wa">
                  💬 WhatsApp
                </a>
                <a href="tel:${b.phone}" class="rec-btn-call">
                  📞 Call
                </a>
              </div>

              <!-- Escrow Button / Badge -->
              ${isLocked ? `
                <div class="rec-escrow-badge">
                  ✅ ₹500 Escrow Bhadraparachabadindi
                </div>
              ` : `
                <button type="button" class="eq-btn-link rec-btn-escrow" onclick="lockBookingEscrow('${b.id}', 500, '${b.itemName}')">
                  🔒 ₹500 Advance Escrow Lock Cheyandi
                </button>
              `}
            </div>
          `;
        }).join('')}
      </div>
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

// 8. Escrow Lock Handler (Completed)
window.lockBookingEscrow = function(bookingId, amount, itemName) {
  let bookings = [];
  try {
    bookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
  } catch (err) {}

  const b = bookings.find(x => x.id === bookingId);
  if (b) {
    b.escrowLocked = true;
    b.status = `₹${amount} Escrow Lock Aindi (Secure)`;
    localStorage.setItem("farmer_bookings", JSON.stringify(bookings));
    renderBookingRecords();

    // Wallet Sync
    if (window.renderWalletWidget) {
      window.renderWalletWidget();
    }
    alert(`🔒 ₹${amount} ఎస్క్రో లాక్ చేయబడింది (${itemName})! పని పూర్తయిన తర్వాత విడుదల అవుతుంది.`);
  }
};

// 9. Auto-Init & DOM Ready Listener
function initFarmerModule() {
  const fContainer = document.getElementById("farmer-post-container");
  
  // Login ayyi, alage currentRole FARMER ga unte mathrame render avvali
  if (fContainer && window.AppState?.isLoggedIn && window.AppState?.currentRole === "FARMER") {
    fContainer.classList.remove("app-section-hidden");
    fContainer.style.display = "block";
    window.renderFarmerWidget();
  } else if (fContainer && !window.AppState?.isLoggedIn) {
    fContainer.classList.add("app-section-hidden");
    fContainer.style.display = "none";
    fContainer.innerHTML = "";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFarmerModule);
} else {
  initFarmerModule();
}

// 10. Real-time Cloud Sync & Live Slot Listener (Firestore)
if (window.db) {
  try {
    window.db.collection("farmer_posted_jobs").orderBy("createdAt", "desc").limit(20)
      .onSnapshot((snapshot) => {
        let cloudJobs = [];
        snapshot.forEach((doc) => {
          cloudJobs.push({ id: doc.id, ...doc.data() });
        });

        if (cloudJobs.length > 0) {
          localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(cloudJobs));
          
          // Farmer Dashboard screen మీద ఉంటే లైవ్‌గా స్లాట్‌లను రీఫ్రెష్ చేయడం
          const paneLabour = document.getElementById("farmer-pane-labour");
          if (paneLabour && paneLabour.style.display !== "none") {
            const acceptedSec = paneLabour.querySelector(".accepted-section");
            if (acceptedSec) {
              const myAccepted = cloudJobs.filter(j => j.status === "Confirmed");
              acceptedSec.outerHTML = getAcceptedListHTML(myAccepted);
            }
          }
        }
      }, (err) => {
        console.warn("Real-time cloud sync notice:", err);
      });
  } catch (err) {
    console.warn("Firestore sync setup error:", err);
  }
}
