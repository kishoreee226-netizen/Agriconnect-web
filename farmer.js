// farmer.js - Farmer Widget Module

function getFarmerJobs() {
  return JSON.parse(localStorage.getItem("agri_jobs")) || [];
}

function renderFarmerWidget(containerId = "farmer-post-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const jobs = getFarmerJobs();
  const myAcceptedJobs = jobs.filter(j => j.status === "Confirmed");

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #2e7d32; border-radius: 10px; padding: 12px; max-width: 480px; margin: 10px auto; font-family: sans-serif; box-shadow: 0 3px 8px rgba(0,0,0,0.06);">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="margin: 0; color: #1b5e20; font-size: 14px; font-weight: 700;">
          👨‍🌾 Rithu Dashboard (Farmer Widget)
        </h3>
        <span style="font-size: 10px; background: #e8f5e9; color: #2e7d32; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Active</span>
      </div>

      <form id="farmer-post-form" style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; gap: 6px;">
          <input type="text" id="f-name" placeholder="Mee Peru" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          <input type="tel" id="f-phone" placeholder="Phone Number" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
        </div>

        <div style="display: flex; gap: 6px;">
          <input type="text" id="f-crop" placeholder="Panta (Cotton, Paddy...)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          <input type="text" id="f-work" placeholder="Pani (Theetha, Kotha)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
        </div>

        <div style="display: flex; gap: 6px;">
          <input type="number" id="f-count" placeholder="Koolila Sankhya" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          <input type="number" id="f-wage" placeholder="Roju Kooli (₹)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
        </div>

        <button type="button" id="get-location-btn" style="background: #f1f8e9; color: #2e7d32; border: 1px dashed #2e7d32; border-radius: 6px; padding: 7px; font-size: 12px; font-weight: 600; cursor: pointer;">
          📍 Polam GPS Location Set Cheyandi
        </button>
        <span id="loc-status" style="font-size: 10px; color: #555; text-align: center;"></span>

        <button type="submit" style="background: #2e7d32; color: #ffffff; border: none; border-radius: 6px; padding: 9px; font-size: 13px; font-weight: 700; cursor: pointer;">
          📢 Koolila Kosam Post Cheyandi
        </button>
      </form>

      <div style="margin-top: 12px; border-top: 1.5px dashed #c8e6c9; padding-top: 8px;">
        <h4 style="margin: 0 0 6px 0; font-size: 12px; color: #1b5e20;">👥 Confirm Aina Koolilu (${myAcceptedJobs.length}):</h4>
        
        ${myAcceptedJobs.length === 0 ? `
          <div style="font-size: 11px; color: #777; text-align: center; padding: 6px;">Koolilu accept cheyagane vari details ikkada kanipisthayi.</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${myAcceptedJobs.map(job => `
              <div style="border: 1px solid #c8e6c9; border-radius: 6px; padding: 8px; background: #f9fbf9;">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <strong>👷 ${job.labourName || 'Kooli'}</strong>
                  <span style="color: #2e7d32; font-weight: bold;">₹${job.wage}</span>
                </div>
                <div style="font-size: 11px; color: #555; margin-top: 2px;">Pani: ${job.crop} (${job.workType})</div>
                
                <div style="display: flex; gap: 6px; margin-top: 6px;">
                  <a href="tel:${job.labourPhone || '9876543210'}" style="flex: 1; text-align: center; background: #e8f5e9; color: #2e7d32; text-decoration: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; border: 1px solid #a5d6a7;">
                    📞 Call
                  </a>
                  <a href="https://wa.me/91${job.labourPhone || '9876543210'}?text=${encodeURIComponent('Namaste, AgriConnect paniki eppudu vasthunnaru?')}" target="_blank" style="flex: 1; text-align: center; background: #e8f8f0; color: #075e54; text-decoration: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; border: 1px solid #25d366;">
                    💬 WhatsApp
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
      statusText.innerText = "GPS Location theesukuntundi...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          farmCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          statusText.innerText = `✅ GPS Set Aindi (${farmCoords.lat.toFixed(4)}, ${farmCoords.lng.toFixed(4)})`;
        },
        () => {
          statusText.innerText = "GPS dorakaledhu, default location set aindi.";
        }
      );
    }
  });

  document.getElementById("farmer-post-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const jobsList = getFarmerJobs();

    const newJob = {
      id: "JOB-" + Math.floor(100 + Math.random() * 900),
      farmerName: document.getElementById("f-name").value,
      farmerPhone: document.getElementById("f-phone").value,
      crop: document.getElementById("f-crop").value,
      workType: document.getElementById("f-work").value,
      count: parseInt(document.getElementById("f-count").value),
      wage: parseInt(document.getElementById("f-wage").value),
      distanceKm: (Math.random() * 4 + 1.2).toFixed(1),
      lat: farmCoords.lat,
      lng: farmCoords.lng,
      status: "Open"
    };

    jobsList.unshift(newJob);
    localStorage.setItem("agri_jobs", JSON.stringify(jobsList));
    alert("📢 Pani post aindi! Koolila widget lo ventane kanipisthundi.");
    e.target.reset();

    renderFarmerWidget();
    if (typeof renderLabourWidget === "function") {
      renderLabourWidget();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFarmerWidget();
});
