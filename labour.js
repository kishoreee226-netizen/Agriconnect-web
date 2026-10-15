// labour.js - కూలీల Dashboard (Light Blue Header, SMS, Call, WhatsApp, Maps)

function getLabourJobsList() {
  if (window.AgriState && typeof window.AgriState.getJobs === "function") {
    return window.AgriState.getJobs();
  }
  try {
    return JSON.parse(localStorage.getItem("agri_jobs") || "[]");
  } catch (e) {
    return [];
  }
}

function renderLabourWidget() {
  const container = document.getElementById("labour-jobs-container");
  if (!container) return;

  const jobsData = getLabourJobsList();

    container.innerHTML = `
    <div class="labour-card">
      
      <!-- Light Blue Header -->
      <div class="labour-card-header">
        <h3>👷 కూలీల Dashboard (5-10 KM Jobs)</h3>
        <span class="badge-live-blue">Live Feed</span>
      </div>

      <div class="labour-scroll labour-scroll-container">
        ${jobsData.length > 2 ? '<div class="scroll-hint-blue">👇 మరిన్ని పనుల కోసం scroll చేయండి</div>' : ''}

        ${jobsData.length === 0 ? `
          <div class="no-jobs-msg">
            📢 ప్రస్తుతం కొత్త పనులు లేవు. పై రైతు ఫారంలో post చేయగానే ఇక్కడ కనిపిస్తాయి.
          </div>
        ` : jobsData.map(j => {
          const isConf = j.status === "Confirmed";
          const lat = typeof j.lat === 'number' ? j.lat : 17.9784;
          const lng = typeof j.lng === 'number' ? j.lng : 79.5941;
          const villageName = j.village || "గ్రామం";
          const workDate = j.date ? `📅 ${j.date}` : "";

          return `
            <div class="job-card job-item-card ${isConf ? 'is-confirmed' : ''}" data-village="${villageName}">
              <div class="job-item-top">
                <div style="flex: 1;">
                  <strong class="job-item-title">🌾 ${j.crop} -${j.workType}</strong>
                  <div class="job-farmer-meta">
                    రైతు: <b>${j.farmerName}</b> \vert{} కూలీలు: <b>${j.count}</b>
                  </div>
                  <div class="job-tags-row">
                    <span class="badge-village">🏛️ ${villageName}</span>${workDate ? `<span class="badge-date">${workDate}</span>` : ''}
                  </div>
                </div>
                <div class="job-item-pricing">
                  <span class="job-wage-amount">₹${j.wage}/రోజు</span>
                  <div class="job-distance-tag">📍 ${j.distanceKm || '2.5'} కి.మీ</div>
                </div>
              </div>

              ${!isConf ? `
                <button onclick="acceptJob('${j.id}')" class="btn-accept-job">
                  ✅ పని Accept చేయండి
                </button>
              ` : `
                <div class="confirmed-job-details">
                  <div class="confirmed-title-text">🎉 పని ఖరారైంది (${j.labourName})! రైతుతో మాట్లాడండి:</div>
                  <div class="job-action-buttons">
                    <a href="tel:${j.farmerPhone}" class="btn-job-action btn-call-farmer">📞 కాల్</a>
                    <a href="sms:${j.farmerPhone}?body=నమస్తే" class="btn-job-action btn-sms-farmer">✉️ SMS</a>
                    <a href="https://wa.me/91${j.farmerPhone}" target="_blank" class="btn-job-action btn-whatsapp-farmer">💬 వాట్సాప్</a>
                    <button onclick="toggleMap('${j.id}')" id="mb-${j.id}" class="btn-job-action btn-map-toggle">🗺️ దారి Map (ON)</button>
                  </div>
                  <div id="m-${j.id}" class="job-map-container">
                    <div class="map-coords-text">📍 Location: (${lat.toFixed(3)}, ${lng.toFixed(3)})</div>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="btn-google-maps">🚀 Google Maps లో దారి చూడండి</a>
                  </div>
                </div>
              `}
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}


window.acceptJob = function(id) {
  let name = "";
  let phone = "";

  if (window.AppState && window.AppState.userProfile) {
    name = window.AppState.userProfile.name;
    phone = window.AppState.userProfile.phone;
  }

  if (!name || !phone) {
    name = prompt("మీ పేరు:", "రాము");
    if (!name) return;
    phone = prompt("ఫోన్ నంబర్:", "9876543211");
    if (!phone) return;
  }

  let acceptedJobObj = null;

  if (window.AgriState && typeof window.AgriState.getJobs === "function") {
    const jobs = window.AgriState.getJobs();
    const j = jobs.find(x => x.id === id);
    if (j) {
      j.status = "Confirmed";
      j.labourName = name;
      j.labourPhone = phone;
      acceptedJobObj = j;
    }
  }

  try {
    let localJobs = JSON.parse(localStorage.getItem("agri_jobs") || "[]");
    const localJ = localJobs.find(x => x.id === id);
    if (localJ) {
      localJ.status = "Confirmed";
      localJ.labourName = name;
      localJ.labourPhone = phone;
      localStorage.setItem("agri_jobs", JSON.stringify(localJobs));
      if (!acceptedJobObj) acceptedJobObj = localJ;
    }
  } catch (e) {}

  if (acceptedJobObj && typeof window.lockJobToEscrow === "function") {
    window.lockJobToEscrow(acceptedJobObj, name);
  }

  renderLabourWidget();
  if (typeof renderFarmerWidget === "function") renderFarmerWidget();
  if (typeof renderWalletWidget === "function") renderWalletWidget();

  if (typeof speakTeluguText === "function") {
    speakTeluguText("పని విజయవంతంగా ఖరారైంది. రైతు ఖాతాలో కూలీ రక్షణ లాక్ చేయబడింది.");
  }
};

window.toggleMap = function(id) {
  const b = document.getElementById("m-" + id);
  const btn = document.getElementById("mb-" + id);
  if (!b || !btn) return;
  if (b.style.display === "none" || b.style.display === "") {
    b.style.display = "block";
    btn.innerText = "✖️ Map (OFF)";
    btn.style.background = "#ffebee";
  } else {
    b.style.display = "none";
    btn.innerText = "🗺️ దారి Map (ON)";
    btn.style.background = "#fff3e0";
  }
};

window.renderLabourWidget = renderLabourWidget;
