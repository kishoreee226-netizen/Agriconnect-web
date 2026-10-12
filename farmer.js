// farmer.js - Farmer Widget with Post Form & Accepted Labour Communication Panel

function getStoredJobs() {
  return JSON.parse(localStorage.getItem("agri_jobs")) || [];
}

function saveStoredJobs(jobs) {
  localStorage.setItem("agri_jobs", JSON.stringify(jobs));
}

function renderFarmerWidget(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const jobs = getStoredJobs();
  const myAcceptedJobs = jobs.filter(j => j.status === "Confirmed");

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #2e7d32; border-radius: 10px; padding: 14px; max-width: 480px; margin: 10px auto; font-family: sans-serif; box-shadow: 0 3px 8px rgba(0,0,0,0.06);">
      
      <!-- Top Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; color: #1b5e20; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
          👨‍🌾 రైతు డ్యాష్‌బోర్డ్ (Farmer Widget)
        </h3>
        <span style="font-size: 10px; background: #e8f5e9; color: #2e7d32; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Active</span>
      </div>

      <!-- Farmer Requirement Form -->
      <form id="farmer-post-form" style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; gap: 6px;">
          <input type="text" id="f-name" placeholder="మీ పేరు (Farmer Name)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          <input type="tel" id="f-phone" placeholder="ఫోన్ నంబర్ (Phone)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
        </div>

        <div style="display: flex; gap: 6px;">
          <input type="text" id="f-crop" placeholder="పంట (Cotton, Paddy...)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          <input type="text" id="f-work" placeholder="పని (తీత, కోత, కలుపు)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
        </div>

        <div style="display: flex; gap: 6px;">
          <input type="number" id="f-count" placeholder="కూలీల సంఖ్య" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          <input type="number" id="f-wage" placeholder="రోజు కూలీ (₹/Day)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
        </div>

        <button type="button" id="get-location-btn" style="background: #f1f8e9; color: #2e7d32; border: 1px dashed #2e7d32; border-radius: 6px; padding: 7px; font-size: 12px; font-weight: 600; cursor: pointer;">
          📍 పొలం GPS లొకేషన్ సెట్ చేయండి
        </button>
        <span id="loc-status" style="font-size: 10px; color: #555; text-align: center;"></span>

        <button type="submit" style="background: #2e7d32; color: #ffffff; border: none; border-radius: 6px; padding: 9px; font-size: 13px; font-weight: 700; cursor: pointer;">
          📢 కూలీల కోసం పోస్ట్ చేయండి
        </button>
      </form>

      <!-- Confirmed Labours Box (Visible once Labour accepts) -->
      <div style="margin-top: 14px; border-top: 1.5px dashed #c8e6c9; padding-top: 10px;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #1b5e20;">👥 కన్ఫర్మ్ అయిన కూలీలు (${myAcceptedJobs.length}):</h4>
        
        ${myAcceptedJobs.length === 0 ? `
          <div style="font-size: 11px; color: #777; text-align: center; padding: 8px;">కూలీలు యాక్సెప్ట్ చేయగానే వారి వివరాలు ఇక్కడ కనిపిస్తాయి.</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${myAcceptedJobs.map(job => `
              <div style="border: 1px solid #c8e6c9; border-radius: 6px; padding: 8px; background: #f9fbf9;">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <strong>👷 ${job.labourName || 'కూలీ'}</strong>
                  <span style="color: #2e7d32; font-weight: bold;">₹${job.wage}</span>
                </div>
                <div style="font-size: 11px; color: #555; margin-top: 2px;">పని: ${job.crop} (${job.workType})</div>
                
                <!-- Action Buttons for Farmer: Call, WhatsApp, Pay -->
                <div style="display: flex; gap: 6px; margin-top: 6px;">
                  <a href="tel:${job.labourPhone || '9876543210'}" style="flex: 1; text-align: center; background: #e8f5e9; color: #2e7d32; text-decoration: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; border: 1px solid #a5d6a7;">
                    📞 కాల్
                  </a>
                  <a href="https://wa.me/91${job.labourPhone || '9876543210'}?text=${encodeURIComponent('నమస్తే, మీరు అగ్రీకనెక్ట్ లో పని ఒప్పుకున్నారు. ఎప్పుడు వస్తున్నారు?')}" target="_blank" style="flex: 1; text-align: center; background: #e8f8f0; color: #075e54; text-decoration: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; border: 1px solid #25d366;">
                    💬 వాట్సాప్
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;

  let farmCoords = { lat: 17.9784, lng: 79.5941 };

  document.getElementById("get-location-btn")?.addEventListener("click", () => {
    const statusText = document.getElementById("loc-status");
    if (navigator.geolocation) {
      statusText.innerText = "GPS లొకేషన్ గుర్తిస్తోంది...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          farmCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          statusText.innerText = `✅ GPS సెట్ చేయబడింది (${farmCoords.lat.toFixed(4)}, ${farmCoords.lng.toFixed(4)})`;
        },
        () => {
          statusText.innerText = "GPS దొరకలేదు. డీఫాల్ట్ లొకేషన్ తీసుకోబడింది.";
        }
      );
    }
  });

  document.getElementById("farmer-post-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const jobsList = getStoredJobs();

    const newJob = {
      id: "JOB-" + Math.floor(100 + Math.random() * 900),
      farmerName: document.getElementById("f-name").value,
      farmerPhone: document.getElementById("f-phone").value,
      crop: document.getElementById("f-crop").value,
      workType: document.getElementById("f-work").value,
      count: parseInt(document.getElementById("f-count").value),
      wage: parseInt(document.getElementById("f-wage").value),
      distanceKm: (Math.random() * 4 + 1.5).toFixed(1),
      lat: farmCoords.lat,
      lng: farmCoords.lng,
      status: "Open"
    };

    jobsList.unshift(newJob);
    saveStoredJobs(jobsList);
    alert("📢 మీ పని పోస్ట్ చేయబడింది! కూలీల విడ్జెట్‌లో అలర్ట్ కనిపిస్తుంది.");
    e.target.reset();

    renderFarmerWidget("farmer-post-container");
    if (typeof renderLabourWidget === "function") {
      renderLabourWidget("labour-jobs-container");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  renderFarmerWidget("farmer-post-container");
});
