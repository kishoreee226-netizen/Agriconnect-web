// farmer-job-modal.js - Farmer Job Posting Modal (Auto-Prefill, Live Sync & Bulletproof Injection)

function injectFarmerJobModal() {
  if (document.getElementById("farmerJobModal")) return;

  const today = new Date().toISOString().split('T')[0];

  const modalHtml = `
    <div id="farmerJobModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.65); z-index:99999; justify-content:center; align-items:center; padding:15px; box-sizing:border-box;">
      <div style="background:#ffffff; width:100%; max-width:400px; border-radius:14px; padding:18px; box-shadow:0 10px 30px rgba(0,0,0,0.3); max-height:90vh; overflow-y:auto; box-sizing:border-box; font-family:sans-serif;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e8f5e9; padding-bottom:10px; margin-bottom:14px;">
          <h4 style="margin:0; color:#2e7d32; font-size:16px; font-weight:bold;">🌾 రైతు పనిని పోస్ట్ చేయండి</h4>
          <span onclick="window.closeFarmerJobModal()" style="font-size:24px; font-weight:bold; cursor:pointer; color:#888; line-height:1;">&times;</span>
        </div>

        <form id="farmerJobForm" onsubmit="window.handleFarmerJobSubmit(event)" style="display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">రైతు పేరు:</label>
            <input type="text" id="fjm_name" required placeholder="మీ పేరు" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div>
            <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">ఫోన్ నంబర్:</label>
            <input type="tel" id="fjm_phone" required pattern="[0-9]{10}" placeholder="10 అంకెల నంబర్" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">పంట రకం:</label>
              <select id="fjm_crop" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box; background:#fff;">
                <option value="వరి (Paddy)">వరి</option>
                <option value="పత్తి (Cotton)">పత్తి</option>
                <option value="మిరప (Chilli)">మిరప</option>
                <option value="మొక్కజొన్న">మొక్కజొన్న</option>
                <option value="ఇతర">ఇతర పంట</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">పని రకం:</label>
              <select id="fjm_work" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box; background:#fff;">
                <option value="వరి నాట్లు">వరి నాట్లు</option>
                <option value="కలుపు తీత">కలుపు తీత</option>
                <option value="పంట కోత">పంట కోత</option>
                <option value="మందు స్ప్రేయింగ్">మందు స్ప్రేయింగ్</option>
                <option value="పత్తి ఏరడం">పత్తి ఏరడం</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">ఎంతమంది కూలీలు?:</label>
              <input type="number" id="fjm_required" min="1" max="50" value="5" required style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">రోజు కూలీ (₹):</label>
              <input type="number" id="fjm_wage" min="100" step="50" value="450" required style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">పని తేదీ:</label>
              <input type="date" id="fjm_date" value="${today}" min="${today}" required style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">గ్రామం / పొలం:</label>
              <input type="text" id="fjm_village" required placeholder="ఊరి పేరు" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
          </div>

          <div>
            <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">రవాణా సదుపాయం:</label>
            <select id="fjm_trans" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box; background:#fff;">
              <option value="needed">🛺 రైతు రవాణా ఏర్పాటు చేస్తారు</option>
              <option value="own">🛵 కూలీల సొంత బండి ఉండాలి</option>
            </select>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
            <button type="button" onclick="window.closeFarmerJobModal()" style="padding:8px 14px; border:1px solid #ccc; background:#f5f5f5; border-radius:6px; font-size:12px; cursor:pointer;">రద్దు</button>
            <button type="submit" style="padding:8px 16px; border:none; background:#2e7d32; color:#fff; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">🚀 అలర్ట్ పంపండి</button>
          </div>
        </form>

      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

// Auto-fill logged in farmer details
function prefillModalFarmerData() {
  const prof = window.AppState?.userProfile;
  if (!prof) return;

  const nameInput = document.getElementById("fjm_name");
  const phoneInput = document.getElementById("fjm_phone");
  const villageInput = document.getElementById("fjm_village");

  if (nameInput && !nameInput.value) nameInput.value = prof.name || "";
  if (phoneInput && !phoneInput.value) phoneInput.value = prof.phone || "";
  if (villageInput && !villageInput.value) villageInput.value = prof.village || "";
}

// Global Window Functions
window.openFarmerJobModal = function() {
  injectFarmerJobModal();
  prefillModalFarmerData();
  const modal = document.getElementById("farmerJobModal");
  if (modal) {
    modal.style.display = "flex";
  }
};

window.closeFarmerJobModal = function() {
  const modal = document.getElementById("farmerJobModal");
  if (modal) {
    modal.style.display = "none";
  }
};

window.handleFarmerJobSubmit = function(e) {
  e.preventDefault();

  const farmerName = document.getElementById("fjm_name").value.trim();
  const farmerPhone = document.getElementById("fjm_phone").value.trim();
  const crop = document.getElementById("fjm_crop").value;
  const workType = document.getElementById("fjm_work").value;
  const totalRequired = parseInt(document.getElementById("fjm_required").value) || 1;
  const wage = parseFloat(document.getElementById("fjm_wage").value) || 450;
  const workDate = document.getElementById("fjm_date").value;
  const village = document.getElementById("fjm_village").value.trim();
  const trans = document.getElementById("fjm_trans").value;

  const newJob = {
    farmerName,
    farmerPhone,
    crop,
    workType,
    count: totalRequired,
    totalRequired,
    confirmedLabours: [],
    wage,
    workDate,
    date: workDate,
    village,
    transportNote: trans === "own" ? "కూలీల సొంత బండి ఉండాలి" : "రైతు రవాణా ఏర్పాటు చేస్తారు",
    status: "Open",
    createdAt: Date.now()
  };

  if (window.db) {
    window.db.collection("farmer_posted_jobs").add(newJob).then(() => {
      saveLocalFarmerJob(newJob, true);
    }).catch(err => {
      console.warn("Firebase save error, falling back to local:", err);
      saveLocalFarmerJob(newJob, false);
    });
  } else {
    saveLocalFarmerJob(newJob, false);
  }

  if (typeof speakTeluguText === "function") {
    speakTeluguText("పని వివరాలు పోస్ట్ చేయబడ్డాయి. సమీప కూలీలకు అలర్ట్ పంపబడింది.");
  }
};

function saveLocalFarmerJob(job, fromCloud = false) {
  let list = [];
  try {
    const stored = localStorage.getItem("agri_farmer_posted_jobs");
    list = stored ? JSON.parse(stored) : [];
  } catch(err) {}

  list.unshift({ id: "job_" + Date.now(), ...job });
  localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(list));

  // Legacy compatibility sync
  if (window.AgriState && typeof window.AgriState.addJob === "function") {
    window.AgriState.addJob(job);
  }

  // Reset form fields
  const form = document.getElementById("farmerJobForm");
  if (form) form.reset();

  window.closeFarmerJobModal();

  // Refresh both UI widgets
  if (typeof window.renderFarmerWidget === "function") window.renderFarmerWidget();
  if (typeof window.renderLabourWidget === "function") window.renderLabourWidget();

  alert("🎉 పని పోస్ట్ చేయబడింది! సమీప కూలీలకు అలర్ట్ వెళ్ళింది.");
}

// Run immediately
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectFarmerJobModal);
} else {
  injectFarmerJobModal();
}
