// farmer.js - రైతు Dashboard (Light Green Header & Compact Submit + Equipment Tab)

// Global Tab Switcher Function (Labour, Equipment, Seeds)
window.switchFarmerTab = function(tab) {
  const panes = ['labour', 'equipment', 'seeds'];
  
  panes.forEach(t => {
    const pane = document.getElementById(`farmer-pane-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (pane) pane.style.display = (t === tab) ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });

  // ట్యాబ్ ప్రకారం సంబంధిత విడ్జెట్‌ను లోడ్ చేయడం
  if (tab === 'equipment' && typeof window.renderEquipmentWidget === 'function') {
    window.renderEquipmentWidget('farmer-pane-equipment');
  } else if (tab === 'seeds' && typeof window.renderSeedsWidget === 'function') {
    window.renderSeedsWidget('farmer-pane-seeds');
  }
};

function renderFarmerWidget() {
  const container = document.getElementById("farmer-post-container");
  if (!container) return;

  const jobs = window.AgriState ? window.AgriState.getJobs() : [];
  const myAcceptedJobs = jobs.filter(j => j.status === "Confirmed");

  container.innerHTML = `
    <div class="farmer-card">
      
      <!-- Light Green Header -->
      <div class="farmer-card-header">
        <h3>👨‍🌾 రైతు Dashboard</h3>
        <span class="badge-live">Live</span>
      </div>

      <!-- 2 Tabs: కూలీలు & పరికరాలు (Rent) -->
      <div class="eq-tabs-bar">
        <button id="tab-btn-labour" type="button" class="eq-tab-btn active" onclick="switchFarmerTab('labour')">👥 కూలీలను వెతకండి</button>
        <button id="tab-btn-equipment" type="button" class="eq-tab-btn" onclick="switchFarmerTab('equipment')">🚜 వ్యవసాయ పరికరాలు</button>
      </div>

      <div class="farmer-card-body">
        
        <!-- PANE 1: కూలీల ఫారం & లిస్ట్ -->
        <div id="farmer-pane-labour">
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

            <!-- Row 4: Stable Row (Date, GPS, Village) -->
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
                <button type="button" id="loc-btn" class="btn-gps">
                  📍 పొలం GPS
                </button>
                <span id="loc-status" class="gps-status-text"></span>
              </div>

              <button type="button" id="f-village-btn" class="btn-village">
                🏛️ Hyderabad
              </button>
            </div>

            <!-- Row 5: Compact Submit Button -->
            <div class="form-submit-row">
              <button type="submit" class="btn-submit-farmer">
                📢 Submit కూలీల కోసం
              </button>
            </div>
          </form>

          <!-- Accepted Labours Section -->
          <div class="accepted-section">
            <div class="accepted-header">
              <h4>👥 Confirm అయిన కూలీలు (${myAcceptedJobs.length}):</h4>
              ${myAcceptedJobs.length > 2 ? '<span class="scroll-hint">👇 scroll చేయండి</span>' : ''}
            </div>
            <div id="accepted-list" class="custom-scroll accepted-scroll-list">
              ${myAcceptedJobs.length === 0 ? `
                <div class="empty-labour-msg">కూలీలు accept చేయగానే వారి వివరాలు ఇక్కడ కనిపిస్తాయి.</div>
              ` : myAcceptedJobs.map(j => `
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
        </div>

        <!-- PANE 2: పరికరాల సెక్షన్ (equipment.js ద్వారా లోడ్ అవుతుంది) -->
        <div id="farmer-pane-equipment" style="display: none;"></div>

      </div>
    </div>
  `;

  // Profile data prefill cheyadam
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
          if (s) s.innerText = `✅ GPS set అయింది (${farmCoords.lat.toFixed(3)}, ${farmCoords.lng.toFixed(3)})`;
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

    // Global AgriState లేదా LocalStorage లో జాబ్ సేవ్ చేయడం
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

    // Input fields clear cheyadam (Name, Phone, Village thappinchi)
    document.getElementById("f-crop").value = "";
    document.getElementById("f-work").value = "";
    document.getElementById("f-count").value = "";
    document.getElementById("f-wage").value = "";
    const dateInput = document.getElementById("f-date");
    if (dateInput) {
      dateInput.value = "";
      dateInput.type = "text";
    }

    // Dashboards refresh cheyadam
    renderFarmerWidget();
    if (typeof renderLabourWidget === "function") {
      renderLabourWidget();
    }

    // Voice announcement (Optional)
    if (typeof speakTeluguText === "function") {
      speakTeluguText("పని వివరాలు విజయవంతంగా పోస్ట్ చేయబడ్డాయి.");
    } else {
      alert("📢 పని కూలీల Dashboard లో live గా post చేయబడింది!");
    }
  });
}

window.renderFarmerWidget = renderFarmerWidget;
