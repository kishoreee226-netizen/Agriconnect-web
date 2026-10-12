// labour.js - Labour Widget with Accept, Call, WhatsApp & GPS Map Toggle

function getStoredJobs() {
  return JSON.parse(localStorage.getItem("agri_jobs")) || [];
}

function saveStoredJobs(jobs) {
  localStorage.setItem("agri_jobs", JSON.stringify(jobs));
}

function renderLabourWidget(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const jobsData = getStoredJobs();

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #1565c0; border-radius: 10px; padding: 14px; max-width: 480px; margin: 10px auto; font-family: sans-serif; box-shadow: 0 3px 8px rgba(0,0,0,0.06);">
      
      <!-- Top Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; color: #0d47a1; font-size: 14px; font-weight: 700;">
          👷‍♂️ కూలీల డ్యాష్‌బోర్డ్ (5-10 KM Jobs)
        </h3>
        <span style="font-size: 10px; background: #e3f2fd; color: #1565c0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Live Feed</span>
      </div>

      <!-- Jobs List -->
      <div style="display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto;">
        ${jobsData.length === 0 ? `
          <div style="text-align: center; color: #888; font-size: 12px; padding: 16px;">
            ప్రస్తుతం కొత్త పనులు లేవు. రైతు పోస్ట్ చేయగానే ఇక్కడ కనిపిస్తాయి.
          </div>
        ` : ''}

        ${jobsData.map(job => {
          const isConfirmed = job.status === "Confirmed";
          return `
            <div style="border: 1px solid ${isConfirmed ? '#81c784' : '#bbdefb'}; border-radius: 8px; padding: 10px; background: ${isConfirmed ? '#f9fdf9' : '#ffffff'};">
              
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <strong style="color: #0d47a1; font-size: 13px;">${job.crop} -${job.workType}</strong>
                  <div style="font-size: 11px; color: #555; margin-top: 2px;">
                    రైతు: <b>${job.farmerName}</b> \vert{} కావాల్సిన వారు: <b>${job.count}</b>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 14px; font-weight: 700; color: #2e7d32;">₹${job.wage}/రోజు</span>
                  <div style="font-size: 10px; color: #e65100; font-weight: 600;">📍 ${job.distanceKm || '3.5'} కి.మీ</div>
                </div>
              </div>

              <!-- When NOT Confirmed: Show Accept Button -->
              ${!isConfirmed ? `
                <div style="margin-top: 8px;">
                  <button onclick="acceptJob('${job.id}')" style="width: 100%; background: #1976d2; color: #ffffff; border: none; border-radius: 5px; padding: 7px; font-size: 12px; font-weight: 700; cursor: pointer;">
                    ✅ పని యాక్సెప్ట్ చేయండి (Accept)
                  </button>
                </div>
              ` : `
                <!-- When Confirmed: Show Call, WhatsApp & GPS Map Toggle -->
                <div style="margin-top: 8px; border-top: 1px solid #e0e0e0; padding-top: 8px;">
                  <div style="font-size: 11px; color: #2e7d32; font-weight: 700; margin-bottom: 6px;">
                    🎉 మీరు ఈ పనిని ఒప్పుకున్నారు! రైతుతో మాట్లాడండి:
                  </div>

                  <div style="display: flex; gap: 5px;">
                    <!-- 1. Call Button -->
                    <a href="tel:${job.farmerPhone || '9876543210'}" style="flex: 1; text-align: center; background: #e8f5e9; color: #2e7d32; text-decoration: none; border-radius: 4px; padding: 6px; font-size: 11px; font-weight: 600; border: 1px solid #a5d6a7;">
                      📞 కాల్
                    </a>

                    <!-- 2. WhatsApp Button -->
                    <a href="https://wa.me/91${job.farmerPhone || '9876543210'}?text=${encodeURIComponent('నమస్తే, నేను మీ అగ్రీకనెక్ట్ పనిని యాక్సెప్ట్ చేసాను. పొలానికి బయలుదేరుతున్నాను.')}" target="_blank" style="flex: 1; text-align: center; background: #e8f8f0; color: #075e54; text-decoration: none; border-radius: 4px; padding: 6px; font-size: 11px; font-weight: 600; border: 1px solid #25d366;">
                      💬 వాట్సాప్
                    </a>

                    <!-- 3. GPS Map Toggle Button (On / Off) -->
                    <button onclick="toggleMapRoute('${job.id}')" id="map-btn-${job.id}" style="flex: 1.2; background: #fff3e0; color: #e65100; border: 1px solid #ffb74d; border-radius: 4px; padding: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      🗺️ దారి Map (ON)
                    </button>
                  </div>

                  <!-- Inline GPS Navigation Box (Default hidden, turns ON/OFF) -->
                  <div id="map-box-${job.id}" style="display: none; margin-top: 8px; background: #f5f5f5; border: 1px dashed #bdbdbd; border-radius: 6px; padding: 8px; text-align: center;">
                    <div style="font-size: 11px; color: #333; margin-bottom: 6px;">
                      📍 పొలం లొకేషన్: (${job.lat.toFixed(4)}, ${job.lng.toFixed(4)})
                    </div>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}" target="_blank" style="display: inline-block; background: #2e7d32; color: #ffffff; text-decoration: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                      🚀 Google Maps లో దారి చూడండి
                    </a>
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

// Accept Job Function
window.acceptJob = function(jobId) {
  const labourName = prompt("మీ పేరు నమోదు చేయండి (Labour Name):", "రాము");
  if (!labourName) return;

  const labourPhone = prompt("మీ ఫోన్ నంబర్ ఇవ్వండి (Phone Number):", "9876543210");
  if (!labourPhone) return;

  const jobsData = getStoredJobs();
  const job = jobsData.find(j => j.id === jobId);
  if (!job) return;

  job.status = "Confirmed";
  job.labourName = labourName;
  job.labourPhone = labourPhone;

  saveStoredJobs(jobsData);
  alert(`✅ పని ఖరారైంది! రైతు ${job.farmerName} గారికి మీ వివరాలు చేరాయి.`);

  renderLabourWidget("labour-jobs-container");
  if (typeof renderFarmerWidget === "function") {
    renderFarmerWidget("farmer-post-container");
  }
};

// GPS Map Route Toggle Function (ON / OFF)
window.toggleMapRoute = function(jobId) {
  const mapBox = document.getElementById(`map-box-${jobId}`);
  const mapBtn = document.getElementById(`map-btn-${jobId}`);
  if (!mapBox || !mapBtn) return;

  if (mapBox.style.display === "none") {
    mapBox.style.display = "block";
    mapBtn.innerText = "✖️ దారి Map (OFF)";
    mapBtn.style.background = "#ffebee";
    mapBtn.style.color = "#c62828";
  } else {
    mapBox.style.display = "none";
    mapBtn.innerText = "🗺️ దారి Map (ON)";
    mapBtn.style.background = "#fff3e0";
    mapBtn.style.color = "#e65100";
  }
};

window.addEventListener("DOMContentLoaded", () => {
  renderLabourWidget("labour-jobs-container");
});
