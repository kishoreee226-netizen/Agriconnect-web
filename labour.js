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
    <div style="background: #ffffff; border: 1.5px solid #64b5f6; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 8px rgba(0,0,0,0.06);">
      
      <!-- Light Blue Header -->
      <div style="background: #e3f2fd; border-bottom: 1.5px solid #90caf9; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #0d47a1; font-size: 14px; font-weight: 700;">
          👷 కూలీల Dashboard (5-10 KM Jobs)
        </h3>
        <span style="font-size: 10px; background: #bbdefb; color: #0d47a1; padding: 2px 7px; border-radius: 4px; font-weight: 700;">Live Feed</span>
      </div>

      <div class="labour-scroll" style="padding: 12px; display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
        ${jobsData.length > 2 ? '<div style="font-size: 10px; color: #1565c0; font-weight: 600; text-align: right; padding: 2px 6px;">👇 మరిన్ని పనుల కోసం scroll చేయండి</div>' : ''}

        ${jobsData.length === 0 ? `
          <div style="text-align: center; color: #666; font-size: 12px; padding: 16px; background: #fbfbfb; border-radius: 6px; border: 1px dashed #ddd;">
            📢 ప్రస్తుతం కొత్త పనులు లేవు. పై రైతు ఫారంలో post చేయగానే ఇక్కడ కనిపిస్తాయి.
          </div>
        ` : jobsData.map(j => {
          const isConf = j.status === "Confirmed";
          const lat = typeof j.lat === 'number' ? j.lat : 17.9784;
          const lng = typeof j.lng === 'number' ? j.lng : 79.5941;
          const villageName = j.village || "గ్రామం";
          const workDate = j.date ? `📅 ${j.date}` : "";

          return `
            <div class="job-card" data-village="${villageName}" style="border: 1px solid ${isConf ? '#81c784' : '#90caf9'}; border-radius: 8px; padding: 10px; background: ${isConf ? '#f9fdf9' : '#ffffff'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <strong style="color: #0d47a1; font-size: 13px;">🌾 ${j.crop} -${j.workType}</strong>
                  <div style="font-size: 11px; color: #555; margin-top: 2px;">
                    రైతు: <b>${j.farmerName}</b> \ కూలీలు: <b>${j.count}</b>
                  </div>
                  <div style="font-size: 10px; color: #455a64; margin-top: 3px; display: flex; gap: 6px; align-items: center;">
                    <span style="background: #e0f2f1; color: #00695c; padding: 1px 5px; border-radius: 4px;">🏛️ ${villageName}</span>${workDate ? `<span style="background: #ede7f6; color: #4527a0; padding: 1px 5px; border-radius: 4px;">${workDate}</span>` : ''}
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 14px; font-weight: 700; color: #2e7d32;">₹${j.wage}/రోజు</span>
                  <div style="font-size: 10px; color: #e65100; font-weight: 600; margin-top: 2px;">📍 ${j.distanceKm || '2.5'} కి.మీ</div>
                </div>
              </div>

              ${!isConf ? `
                <button onclick="acceptJob('${j.id}')" style="display: block; margin: 8px auto 0 auto; background: #1976d2; color: #ffffff; border: none; border-radius: 5px; padding: 6px 16px; font-size: 11px; font-weight: 700; cursor: pointer; width: fit-content; box-shadow: 0 1px 4px rgba(25,118,210,0.3);">
                  ✅ పని Accept చేయండి
                </button>
              ` : `
                <div style="margin-top: 8px; border-top: 1px solid #e0e0e0; padding-top: 8px;">
                  <div style="font-size: 11px; color: #2e7d32; font-weight: 700; margin-bottom: 6px;">🎉 పని ఖరారైంది (${j.labourName})! రైతుతో మాట్లాడండి:</div>
                  <div style="display: flex; gap: 4px;">
                    <a href="tel:${j.farmerPhone}" style="flex: 1; text-align: center; background: #e8f5e9; color: #2e7d32; text-decoration: none; border-radius: 4px; padding: 6px 2px; font-size: 11px; font-weight: 600; border: 1px solid #a5d6a7;">📞 కాల్</a>
                    <a href="sms:${j.farmerPhone}?body=నమస్తే" style="flex: 1; text-align: center; background: #fffde7; color: #f57f17; text-decoration: none; border-radius: 4px; padding: 6px 2px; font-size: 11px; font-weight: 600; border: 1px solid #fff59d;">✉️ SMS</a>
                    <a href="https://wa.me/91${j.farmerPhone}" target="_blank" style="flex: 1.1; text-align: center; background: #e8f8f0; color: #075e54; text-decoration: none; border-radius: 4px; padding: 6px 2px; font-size: 11px; font-weight: 600; border: 1px solid #25d366;">💬 వాట్సాప్</a>
                    <button onclick="toggleMap('${j.id}')" id="mb-${j.id}" style="flex: 1.2; background: #fff3e0; color: #e65100; border: 1px solid #ffb74d; border-radius: 4px; padding: 6px 2px; font-size: 11px; font-weight: 600; cursor: pointer;">🗺️ దారి Map (ON)</button>
                  </div>
                  <div id="m-${j.id}" style="display: none; margin-top: 8px; background: #f5f5f5; border: 1px dashed #bdbdbd; border-radius: 6px; padding: 8px; text-align: center;">
                    <div style="font-size: 11px; margin-bottom: 6px;">📍 Location: (${lat.toFixed(3)}, ${lng.toFixed(3)})</div>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" style="background: #2e7d32; color: #ffffff; text-decoration: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; display: inline-block;">🚀 Google Maps లో దారి చూడండి</a>
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

  // యూజర్ ఆల్రెడీ లాగిన్ అయి ఉంటే నేరుగా వివరాలు తీసుకోవడం
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

  // 1. AgriState లో అప్‌డేట్
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

  // 2. LocalStorage లో అప్‌డేట్
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

  // 3. Smart Escrow Wallet లోకి జాబ్‌ను లాక్ చేయడం
  if (acceptedJobObj && typeof window.lockJobToEscrow === "function") {
    window.lockJobToEscrow(acceptedJobObj, name);
  }

  // డాష్‌బోర్డ్‌లు మరియు వాలెట్‌ను లైవ్‌గా రీఫ్రెష్ చేయడం
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
