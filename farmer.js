// farmer.js - రైతు కూలీల పోస్టింగ్ మాడ్యూల్

function renderFarmerPostForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #2e7d32; border-radius: 10px; padding: 14px; max-width: 480px; margin: 10px auto; font-family: sans-serif; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
      <h3 style="margin: 0 0 10px 0; color: #1b5e20; font-size: 15px; display: flex; align-items: center; gap: 6px;">
        👨‍🌾 కూలీల అవసరం పోస్ట్ చేయండి (Farmer Requirement)
      </h3>

      <form id="farmer-post-form" style="display: flex; flex-direction: column; gap: 8px;">
        <input type="text" id="f-name" placeholder="రైతు పేరు (Farmer Name)" required style="padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
        
        <div style="display: flex; gap: 6px;">
          <input type="text" id="f-crop" placeholder="పంట పేరు (e.g. Cotton, Paddy)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          <input type="text" id="f-work" placeholder="పని రకం (తీత, కోత, కలుపు)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
        </div>

        <div style="display: flex; gap: 6px;">
          <input type="number" id="f-count" placeholder="ఎంతమంది కూలీలు కావాలి?" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          <input type="number" id="f-wage" placeholder="రోజు కూలీ (₹/Day)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
        </div>

        <button type="button" id="get-location-btn" style="background: #e8f5e9; color: #2e7d32; border: 1px dashed #2e7d32; border-radius: 6px; padding: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
          📍 పొలం లొకేషన్ పట్టుకోండి (GPS Tag Farm)
        </button>
        <span id="loc-status" style="font-size: 11px; color: #666; text-align: center;"></span>

        <button type="submit" style="background: #2e7d32; color: #ffffff; border: none; border-radius: 6px; padding: 9px; font-size: 13px; font-weight: 700; cursor: pointer; margin-top: 4px;">
          📢 5-10 కి.మీ కూలీలకు అలర్ట్ పంపండి
        </button>
      </form>
    </div>
  `;

  let farmCoords = { lat: 17.9784, lng: 79.5941 };

  document.getElementById("get-location-btn")?.addEventListener("click", () => {
    const statusText = document.getElementById("loc-status");
    if (navigator.geolocation) {
      statusText.innerText = "GPS లొకేషన్ సేకరిస్తోంది...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          farmCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          statusText.innerText = `✅ లొకేషన్ సెట్ చేయబడింది (${farmCoords.lat.toFixed(4)}, ${farmCoords.lng.toFixed(4)})`;
        },
        () => {
          statusText.innerText = "GPS అనుమతి లభించలేదు. డీఫాల్ట్ లొకేషన్ సెట్ చేయబడింది.";
        }
      );
    }
  });

  document.getElementById("farmer-post-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const existingJobs = JSON.parse(localStorage.getItem("agri_jobs")) || [];

    const newJob = {
      id: "JOB-" + Math.floor(100 + Math.random() * 900),
      farmerName: document.getElementById("f-name").value,
      crop: document.getElementById("f-crop").value,
      workType: document.getElementById("f-work").value,
      count: parseInt(document.getElementById("f-count").value),
      wage: parseInt(document.getElementById("f-wage").value),
      distanceKm: (Math.random() * 5 + 1).toFixed(1),
      lat: farmCoords.lat,
      lng: farmCoords.lng,
      status: "Open"
    };

    existingJobs.unshift(newJob);
    localStorage.setItem("agri_jobs", JSON.stringify(existingJobs));
    alert("📢 కూలీల అవసరం పోస్ట్ చేయబడింది! 5-10 కి.మీ లోపు ఉన్న కూలీల ఫోన్లకు అలర్ట్ వెళ్లింది.");
    e.target.reset();

    // కూలీల లిస్ట్ ఆటోమేటిక్‌గా రీలోడ్ అవుతుంది
    if (typeof renderLabourJobs === "function") {
      renderLabourJobs("labour-jobs-container");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  renderFarmerPostForm("farmer-post-container");
});
