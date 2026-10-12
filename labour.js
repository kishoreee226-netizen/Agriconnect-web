// labour.js - Labour Widget Module

function getLabourJobs() {
  return JSON.parse(localStorage.getItem("agri_jobs")) || [];
}

function renderLabourWidget(containerId = "labour-jobs-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const jobsData = getLabourJobs();

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #1565c0; border-radius: 10px; padding: 12px; max-width: 480px; margin: 10px auto; font-family: sans-serif; box-shadow: 0 3px 8px rgba(0,0,0,0.06);">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="margin: 0; color: #0d47a1; font-size: 14px; font-weight: 700;">
          👷 Koolila Dashboard (5-10 KM Jobs)
        </h3>
        <span style="font-size: 10px; background: #e3f2fd; color: #1565c0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Live Feed</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto;">
        ${jobsData.length === 0 ? `
          <div style="text-align: center; color: #888; font-size: 12px; padding: 16px;">
            Prasthutham kothha panulu levu. Farmer post cheyagane ikkada kanipisthayi.
          </div>
        ` : ''}

        ${jobsData.map(job => {
          const isConfirmed = job.status === "Confirmed";
          const lat = typeof job.lat === 'number' ? job.lat : 17.9784;
          const lng = typeof job.lng === 'number' ? job.lng : 79.5941;

          return `
            <div style="border: 1px solid ${isConfirmed ? '#81c784' : '#bbdefb'}; border-radius: 8px; padding: 10px; background: ${isConfirmed ? '#f9fdf9' : '#ffffff'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <strong style="color: #0d47a1; font-size: 13px;">${job.crop} -${job.workType}</strong>
                  <div style="font-size: 11px; color: #555; margin-top: 2px;">
                    Rithu: <b>${job.farmerName \vert{}\vert{} 'Farmer'}</b> \vert{} Kavalsinavaru: <b>${job.count || 1}</b>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 14px; font-weight: 700; color: #2e7d32;">₹${job.wage}/roju</span>
                  <div style="font-size: 10px; color: #e65100; font-weight: 600;">📍 ${job.distanceKm || '2.5'} km</div>
                </div>
              </div>

              ${!isConfirmed ? `
                <div style="margin-top: 8px;">
                  <button onclick="acceptJob('${job.id}')" style="width: 100%; background: #1976d2; color: #ffffff; border: none; border-radius: 5px; padding: 7px; font-size: 12px; font-weight: 700; cursor: pointer;">
                    ✅ Pani Accept Cheyandi
                  </button>
                </div>
              ` : `
                <div style="margin-top: 8px; border-top: 1px solid #e0e0e0; padding-top: 8px;">
                  <div style="font-size: 11px; color: #2e7d32; font-weight: 700; margin-bottom: 6px;">
                    🎉 Ee pani confirm aindi! Farmer tho matladandi:
                  </div>

                  <div style="display: flex; gap: 5px;">
                    <a href="tel:${job.farmerPhone || '9876543210'}" style="flex: 1; text-align: center; background: #e8f5e9; color: #2e7d32; text-decoration: none; border-radius: 4px; padding: 6px; font-size: 11px; font-weight: 600; border: 1px solid #a5d6a7;">
                      📞 Call
                    </a>
                    <a href="https://wa.me/91${job.farmerPhone || '9876543210'}?text=${encodeURIComponent('Namaste, nenu mee AgriConnect paniki confirm chesanu.')}" target="_blank" style="flex: 1; text-align: center; background: #e8f8f0; color: #075e54; text-decoration: none; border-radius: 4px; padding: 6px; font-size: 11px; font-weight: 600; border: 1px solid #25d366;">
                      💬 WhatsApp
                    </a>
                    <button onclick="toggleMapRoute('${job.id}')" id="map-btn-${job.id}" style="flex: 1.2; background: #fff3e0; color: #e65100; border: 1px solid #ffb74d; border-radius: 4px; padding: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      🗺️ Daari Map (ON)
                    </button>
                  </div>

                  <div id="map-box-${job.id}" style="display: none; margin-top: 8px; background: #f5f5f5; border: 1px dashed #bdbdbd; border-radius: 6px; padding: 8px; text-align: center;">
                    <div style="font-size: 11px; color: #333; margin-bottom: 6px;">
                      📍 Polam Location: (${lat.toFixed(4)}, ${lng.toFixed(4)})
                    </div>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" style="display: inline-block; background: #2e7d32; color: #ffffff; text-decoration: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                      🚀 Google Maps lo Daari Choodandi
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

window.acceptJob = function(jobId) {
  const labourName = prompt("Mee peru cheppandi (Labour Name):", "Ramu");
  if (!labourName) return;

  const labourPhone = prompt("Mee phone number ivvandi:", "9876543210");
  if (!labourPhone) return;

  const jobsData = getLabourJobs();
  const job = jobsData.find(j => j.id === jobId);
  if (!job) return;

  job.status = "Confirmed";
  job.labourName = labourName;
  job.labourPhone = labourPhone;

  localStorage.setItem("agri_jobs", JSON.stringify(jobsData));
  alert(`✅ Pani confirm aindi! Farmer ${job.farmerName} ki mee details vellayi.`);

  renderLabourWidget();
  if (typeof renderFarmerWidget === "function") {
    renderFarmerWidget();
  }
};

window.toggleMapRoute = function(jobId) {
  const mapBox = document.getElementById(`map-box-${jobId}`);
  const mapBtn = document.getElementById(`map-btn-${jobId}`);
  if (!mapBox || !mapBtn) return;

  if (mapBox.style.display === "none") {
    mapBox.style.display = "block";
    mapBtn.innerText = "✖️ Daari Map (OFF)";
    mapBtn.style.background = "#ffebee";
    mapBtn.style.color = "#c62828";
  } else {
    mapBox.style.display = "none";
    mapBtn.innerText = "🗺️ Daari Map (ON)";
    mapBtn.style.background = "#fff3e0";
    mapBtn.style.color = "#e65100";
  }
};

// Direct initialization
document.addEventListener("DOMContentLoaded", () => {
  renderLabourWidget();
});
