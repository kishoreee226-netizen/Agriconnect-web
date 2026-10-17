// farmer-job-modal.js - Farmer Job Posting Modal (Count + Post-Dated Support)

function ensureFarmerJobModal() {
  if (document.getElementById("farmerJobModal")) return;

  const modalHtml = `
    <div id="farmerJobModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; padding:15px; box-sizing:border-box;">
      <div style="background:#fff; width:100%; max-width:380px; border-radius:12px; padding:16px; box-shadow:0 8px 24px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e0e0e0; padding-bottom:8px; margin-bottom:12px;">
          <h4 style="margin:0; color:#2e7d32; font-size:15px;">🌾 రైతు పనిని పోస్ట్ చేయండి</h4>
          <span onclick="closeFarmerJobModal()" style="font-size:20px; font-weight:bold; cursor:pointer; color:#777;">&times;</span>
        </div>

        <form id="farmerJobForm" onsubmit="handleFarmerJobSubmit(event)" style="display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-size:11px; font-weight:bold; color:#333;">రైతు పేరు:</label>
            <input type="text" id="fjm_name" required placeholder="మీ పేరు" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div>
            <label style="font-size:11px; font-weight:bold; color:#333;">ఫోన్ నంబర్:</label>
            <input type="tel" id="fjm_phone" required pattern="[0-9]{10}" placeholder="10 అంకెల నంబర్" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">పంట రకం:</label>
              <select id="fjm_crop" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px;">
                <option value="వరి (Paddy)">వరి</option>
                <option value="పత్తి (Cotton)">పత్తి</option>
                <option value="మిరప (Chilli)">మిరప</option>
                <option value="మొక్కజొన్న">మొక్కజొన్న</option>
                <option value="ఇతర">ఇతర పంట</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">పని రకం:</label>
              <select id="fjm_work" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px;">
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
              <label style="font-size:11px; font-weight:bold; color:#333;">ఎంతమంది కూలీలు కావాలి?:</label>
              <input type="number" id="fjm_required" min="1" max="50" value="5" required style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">రోజు కూలీ రేటు (₹):</label>
              <input type="number" id="fjm_wage" min="100" step="50" value="450" required style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">పని తేదీ (Post-Date):</label>
              <input type="date" id="fjm_date" required style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">గ్రామం / పొలం లొకేషన్:</label>
              <input type="text" id="fjm_village" required placeholder="ఊరి పేరు" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
          </div>

          <div>
            <label style="font-size:11px; font-weight:bold; color:#333;">రవాణా సదుపాయం:</label>
            <select id="fjm_trans" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px;">
              <option value="needed">🛺 రవాణా రైతు ఏర్పాటు చేస్తారు</option>
              <option value="own">🛵 కూలీల సొంత బండి ఉండాలి</option>
            </select>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
            <button type="button" onclick="closeFarmerJobModal()" style="padding:6px 12px; border:1px solid #ccc; background:#f5f5f5; border-radius:6px; font-size:12px;">రద్దు</button>
            <button type="submit" style="padding:6px 14px; border:none; background:#2e7d32; color:#fff; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">🚀 కూలీలకు అలర్ట్ పంపండి</button>
          </div>
        </form>

      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Default to today's date
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById("fjm_date");
  if (dateInput) {
    dateInput.value = today;
    dateInput.min = today;
  }
}

window.openFarmerJobModal = function() {
  ensureFarmerJobModal();
  const modal = document.getElementById("farmerJobModal");
  if (modal) modal.style.display = "flex";
};

window.closeFarmerJobModal = function() {
  const modal = document.getElementById("farmerJobModal");
  if (modal) modal.style.display = "none";
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
    totalRequired,
    confirmedLabours: [], // ఎవరెవరు ఒప్పుకున్నారో వారి లిస్ట్
    wage,
    workDate,
    village,
    transportNote: trans === "own" ? "కూలీల సొంత బండి ఉండాలి" : "రైతు రవాణా ఏర్పాటు చేస్తారు",
    status: "Open",
    createdAt: Date.now()
  };

  if (window.db) {
    window.db.collection("farmer_posted_jobs").add(newJob).then(() => {
      closeFarmerJobModal();
      alert(`🎉 పని పోస్ట్ చేయబడింది! సమీపంలోని కూలీలకు అలర్ట్ పంపబడింది.`);
    });
  } else {
    let list = [];
    try {
      const stored = localStorage.getItem("agri_farmer_posted_jobs");
      list = stored ? JSON.parse(stored) : [];
    } catch(err) {}
    list.unshift({ id: "job_" + Date.now(), ...newJob });
    localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(list));
    closeFarmerJobModal();
    if (typeof window.renderLabourWidget === "function") window.renderLabourWidget();
    alert(`🎉 పని పోస్ట్ చేయబడింది! సమీపంలోని కూలీలకు అలర్ట్ వెళ్ళింది.`);
  }

  if (typeof speakTeluguText === "function") {
    speakTeluguText("పని వివరాలు పోస్ట్ చేయబడ్డాయి. సమీప కూలీలకు అలర్ట్ పంపబడింది.");
  }
};
