// labour-profile-modal.js - Labour Profile, Skills Checkboxes & Duty ON/OFF Toggle

function getLabourProfile() {
  try {
    const p = localStorage.getItem("agri_labour_current_profile");
    if (p) return JSON.parse(p);
  } catch (e) {}

  return {
    name: "రాజు",
    phone: "9876543210",
    village: "వరంగల్",
    gangCount: 1,
    wage: 450,
    ownTransport: true,
    isDutyOn: true,
    skills: ["వరి నాట్లు", "కలుపు తీత", "పంట కోత"]
  };
}

function saveLabourProfile(profile) {
  localStorage.setItem("agri_labour_current_profile", JSON.stringify(profile));
  
  // Firebase lo sync cheyadam
  if (window.db) {
    const docId = "profile_" + (profile.phone || "user");
    window.db.collection("labour_profiles").doc(docId).set({
      ...profile,
      status: profile.isDutyOn ? "Available" : "Offline",
      updatedAt: Date.now()
    }, { merge: true });
  }

  if (typeof window.renderLabourWidget === "function") {
    window.renderLabourWidget();
  }
}

// Ensure Profile Modal HTML exists
function ensureLabourProfileModal() {
  if (document.getElementById("labourProfileModal")) return;

  const prof = getLabourProfile();
  const allSkills = ["వరి నాట్లు", "కలుపు తీత", "పంట కోత", "మందు స్ప్రేయింగ్", "పత్తి ఏరడం", "మొక్కజొన్న పనులు"];

  const modalHtml = `
    <div id="labourProfileModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; padding:15px; box-sizing:border-box;">
      <div style="background:#fff; width:100%; max-width:380px; border-radius:12px; padding:16px; box-shadow:0 8px 24px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e0e0e0; padding-bottom:8px; margin-bottom:12px;">
          <h4 style="margin:0; color:#0277bd; font-size:15px;">👷 నా కూలీ వివరాలు & పనులు</h4>
          <span onclick="closeLabourProfileModal()" style="font-size:20px; font-weight:bold; cursor:pointer; color:#777;">&times;</span>
        </div>

        <form id="labourProfileForm" onsubmit="handleLabourProfileSubmit(event)" style="display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-size:11px; font-weight:bold; color:#333;">కూలీ / మేస్త్రీ పేరు:</label>
            <input type="text" id="lpf_name" required value="${prof.name}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div>
            <label style="font-size:11px; font-weight:bold; color:#333;">ఫోన్ నంబర్:</label>
            <input type="tel" id="lpf_phone" required pattern="[0-9]{10}" value="${prof.phone}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">గ్రామం / ప్రాంతం:</label>
              <input type="text" id="lpf_village" required value="${prof.village}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">బృందం సభ్యులు:</label>
              <input type="number" id="lpf_count" min="1" value="${prof.gangCount || 1}" required style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">రోజు కూలీ (₹):</label>
              <input type="number" id="lpf_wage" min="100" step="50" value="${prof.wage || 450}" required style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333;">సొంత బండి ఉందా?</label>
              <select id="lpf_trans" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:12px;">
                <option value="yes" ${prof.ownTransport ? 'selected' : ''}>🛵 ఉంది</option>
                <option value="no" ${!prof.ownTransport ? 'selected' : ''}>❌ లేదు (రవాణా కావాలి)</option>
              </select>
            </div>
          </div>

          <!-- Skills Selection Checkboxes -->
          <div>
            <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:4px;">మీకు వచ్చిన పనులు (టిక్ చేయండి):</label>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:#f9fbe7; padding:8px; border-radius:6px; border:1px solid #e6ee9c;">
              ${allSkills.map(s => {
                const checked = prof.skills && prof.skills.includes(s) ? 'checked' : '';
                return `
                  <label style="font-size:11px; color:#33691e; display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" name="labour_skills" value="${s}" ${checked}>${s}
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
            <button type="button" onclick="closeLabourProfileModal()" style="padding:6px 12px; border:1px solid #ccc; background:#f5f5f5; border-radius:6px; font-size:12px;">రద్దు</button>
            <button type="submit" style="padding:6px 14px; border:none; background:#0288d1; color:#fff; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">💾 వివరాలు సేవ్ చేయండి</button>
          </div>
        </form>

      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

window.openLabourProfileModal = function() {
  ensureLabourProfileModal();
  const modal = document.getElementById("labourProfileModal");
  if (modal) modal.style.display = "flex";
};

window.closeLabourProfileModal = function() {
  const modal = document.getElementById("labourProfileModal");
  if (modal) modal.style.display = "none";
};

window.handleLabourProfileSubmit = function(e) {
  e.preventDefault();

  const name = document.getElementById("lpf_name").value.trim();
  const phone = document.getElementById("lpf_phone").value.trim();
  const village = document.getElementById("lpf_village").value.trim();
  const count = parseInt(document.getElementById("lpf_count").value) || 1;
  const wage = parseFloat(document.getElementById("lpf_wage").value) || 450;
  const trans = document.getElementById("lpf_trans").value === "yes";

  const checkboxes = document.querySelectorAll('input[name="labour_skills"]:checked');
  const selectedSkills = Array.from(checkboxes).map(cb => cb.value);

  const prev = getLabourProfile();
  const updatedProfile = {
    ...prev,
    name,
    phone,
    village,
    gangCount: count,
    wage,
    ownTransport: trans,
    skills: selectedSkills.length ? selectedSkills : ["వ్యవసాయ పనులు"]
  };

  saveLabourProfile(updatedProfile);
  closeLabourProfileModal();

  if (typeof speakTeluguText === "function") {
    speakTeluguText("మీ కూలీ వివరాలు విజయవంతంగా అప్‌డేట్ అయ్యాయి.");
  }
};

// Duty ON/OFF Toggle Handler
window.toggleLabourDutyStatus = function() {
  const prof = getLabourProfile();
  prof.isDutyOn = !prof.isDutyOn;
  saveLabourProfile(prof);

  const msg = prof.isDutyOn 
    ? "మీరు ఇప్పుడు లైవ్ డ్యూటీలో ఉన్నారు. రైతులకు మీ వివరాలు కనిపిస్తాయి." 
    : "డ్యూటీ ఆఫ్ చేయబడింది. రైతులకు మీ వివరాలు కనిపించవు.";

  if (typeof speakTeluguText === "function") {
    speakTeluguText(msg);
  }
};

window.getLabourProfile = getLabourProfile;
