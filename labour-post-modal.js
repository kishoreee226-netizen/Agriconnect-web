// labour-post-modal.js - Labour Job Posting Modal & Cloud Submission Logic

// Modal DOM ni body loki inject chese function
function ensureLabourPostModal() {
  if (document.getElementById("labourPostModal")) return;

  const modalHtml = `
    <div id="labourPostModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; padding:15px; box-sizing:border-box;">
      <div style="background:#fff; width:100%; max-width:380px; border-radius:12px; padding:16px; box-shadow:0 8px 24px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e0e0e0; padding-bottom:8px; margin-bottom:12px;">
          <h4 style="margin:0; color:#0277bd; font-size:15px;">➕ కొత్త పనిని క్లౌడ్‌లో పోస్ట్ చేయండి</h4>
          <span onclick="closeLabourPostModal()" style="font-size:20px; font-weight:bold; cursor:pointer; color:#777;">&times;</span>
        </div>

        <form id="newLabourJobForm" onsubmit="handleLabourJobSubmit(event)" style="display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-size:11px; font-weight:bold; color:#333;">రైతు / మేస్త్రీ పేరు:</label>
            <input type="text" id="lp_name" required placeholder="ఉదా: రామయ్య" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div>
            <label style="font-size:11px; font-weight:bold; color:#333;">ఫోన్ నంబర్:</label>
            <input type="tel" id="lp_phone" required pattern="[0-9]{10}" placeholder="10 అంకెల నంబర్" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">పంట రకం:</label>
              <select id="lp_crop" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px;">
                <option value="వరి (Paddy)">వరి</option>
                <option value="పత్తి (Cotton)">పత్తి</option>
                <option value="మిరప (Chilli)">మిరప</option>
                <option value="మొక్కజొన్న">మొక్కజొన్న</option>
                <option value="ఇతర">ఇతర పంట</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">పని రకం:</label>
              <select id="lp_work" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px;">
                <option value="నాట్లు">నాట్లు</option>
                <option value="కోత">కోత</option>
                <option value="కలుపు">కలుపు తీత</option>
                <option value="స్ప్రే">స్ప్రేయింగ్</option>
                <option value="ఏరడం">ఏరడం</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">కూలీల సంఖ్య:</label>
              <input type="number" id="lp_count" min="1" value="4" required style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">రోజు కూలీ (₹):</label>
              <input type="number" id="lp_wage" min="100" step="50" value="450" required style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">గ్రామం / లొకేషన్:</label>
              <input type="text" id="lp_village" required placeholder="గ్రామం పేరు" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">దూరం (కి.మీ):</label>
              <input type="number" id="lp_dist" step="0.5" value="2.0" required style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
          </div>

          <div>
            <label style="font-size:11px; font-weight:bold; color:#333;">రవాణా సౌకర్యం:</label>
            <select id="lp_trans" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px;">
              <option value="needed">🛺 రవాణా అవసరం</option>
              <option value="own">🛵 సొంత బండి ఉంది</option>
            </select>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
            <button type="button" onclick="closeLabourPostModal()" style="padding:6px 12px; border:1px solid #ccc; background:#f5f5f5; border-radius:6px; font-size:12px;">రద్దు</button>
            <button type="submit" style="padding:6px 14px; border:none; background:#0288d1; color:#fff; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">🚀 క్లౌడ్‌లో పోస్ట్ చేయండి</button>
          </div>
        </form>

      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

// Modal open/close controls
window.openLabourPostModal = function() {
  ensureLabourPostModal();
  const modal = document.getElementById("labourPostModal");
  if (modal) modal.style.display = "flex";
};

window.closeLabourPostModal = function() {
  const modal = document.getElementById("labourPostModal");
  if (modal) modal.style.display = "none";
};

// Form Submission logic
window.handleLabourJobSubmit = function(e) {
  e.preventDefault();

  const name = document.getElementById("lp_name").value.trim();
  const phone = document.getElementById("lp_phone").value.trim();
  const crop = document.getElementById("lp_crop").value;
  const work = document.getElementById("lp_work").value;
  const count = parseInt(document.getElementById("lp_count").value) || 1;
  const wage = parseFloat(document.getElementById("lp_wage").value) || 400;
  const village = document.getElementById("lp_village").value.trim();
  const dist = parseFloat(document.getElementById("lp_dist").value) || 2.5;
  const trans = document.getElementById("lp_trans").value;

  const newJobData = {
    crop: crop,
    workType: work,
    farmerName: name,
    farmerPhone: phone,
    count: count,
    wage: wage,
    distanceKm: dist,
    village: village,
    date: "ఈ రోజు",
    ownTransport: trans === "own",
    transportNote: trans === "own" ? "సొంత బండి ఉంది" : "రవాణా అవసరం",
    status: "Open",
    createdAt: Date.now()
  };

  if (window.db) {
    window.db.collection("labour_jobs").add(newJobData)
      .then(() => {
        closeLabourPostModal();
      })
      .catch((err) => {
        console.error("Cloud save failed, saving local:", err);
        fallbackLocalLabourSave(newJobData);
      });
  } else {
    fallbackLocalLabourSave(newJobData);
  }

  if (typeof speakTeluguText === "function") {
    speakTeluguText("కూలీల పని వివరాలు విజయవంతంగా క్లౌడ్‌లో పోస్ట్ చేయబడ్డాయి.");
  }
};

function fallbackLocalLabourSave(newJob) {
  const localJob = { id: "job_" + Date.now(), ...newJob };
  let currentList = [];
  try {
    const stored = localStorage.getItem("agri_jobs");
    currentList = stored ? JSON.parse(stored) : [];
  } catch (e) {
    currentList = [];
  }
  currentList.unshift(localJob);
  localStorage.setItem("agri_jobs", JSON.stringify(currentList));
  closeLabourPostModal();
  if (typeof window.renderLabourWidget === "function") {
    window.renderLabourWidget();
  }
}
