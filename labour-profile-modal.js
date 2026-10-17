// labour-profile-modal.js - Labour Profile, Skills Checkboxes, AppState Sync & Duty ON/OFF Toggle

function getLabourProfile() {
  const appProf = window.AppState?.userProfile;
  let stored = null;

  try {
    const p = localStorage.getItem("agri_labour_current_profile");
    if (p) stored = JSON.parse(p);
  } catch (e) {}

  // AppState login profile tho sync cheyadam
  const baseName = appProf?.name || stored?.name || "కూలీ";
  const basePhone = appProf?.phone || stored?.phone || "9876543210";
  const baseVillage = appProf?.village || stored?.village || "సమీప గ్రామం";

  let dutyStatus = true;
  try {
    const savedDuty = localStorage.getItem("agri_labour_duty_status");
    if (savedDuty !== null) {
      dutyStatus = (savedDuty === "true");
    } else if (stored && stored.isDutyOn !== undefined) {
      dutyStatus = stored.isDutyOn;
    }
  } catch (e) {}

  return {
    name: baseName,
    phone: basePhone,
    village: baseVillage,
    gangCount: stored?.gangCount || 1,
    wage: stored?.wage || 450,
    ownTransport: stored?.ownTransport !== undefined ? stored.ownTransport : true,
    isDutyOn: dutyStatus,
    skills: stored?.skills || ["వరి నాట్లు", "కలుపు తీత", "పంట కోత"]
  };
}

function saveLabourProfile(profile) {
  localStorage.setItem("agri_labour_current_profile", JSON.stringify(profile));
  localStorage.setItem("agri_labour_duty_status", String(profile.isDutyOn));

  // AppState sync
  if (window.AppState && window.AppState.userProfile) {
    window.AppState.userProfile.name = profile.name;
    window.AppState.userProfile.phone = profile.phone;
    window.AppState.userProfile.village = profile.village;
    try {
      localStorage.setItem("agri_user_profile", JSON.stringify(window.AppState.userProfile));
    } catch (e) {}
  }

  // Firebase Real-time sync
  if (window.db) {
    const docId = "profile_" + (profile.phone || "user");
    window.db.collection("labour_profiles").doc(docId).set({
      ...profile,
      status: profile.isDutyOn ? "Available" : "Offline",
      updatedAt: Date.now()
    }, { merge: true });
  }

  // Live UI re-renders
  if (typeof window.renderLabourWidget === "function") {
    window.renderLabourWidget();
  }
  if (typeof renderUserProfileBanner === "function") {
    renderUserProfileBanner();
  }
}

// Modal HTML Create or Update
function ensureLabourProfileModal() {
  const prof = getLabourProfile();
  const allSkills = ["వరి నాట్లు", "కలుపు తీత", "పంట కోత", "మందు స్ప్రేయింగ్", "పత్తి ఏరడం", "మొక్కజొన్న పనులు"];

  const existingModal = document.getElementById("labourProfileModal");
  if (existingModal) {
    // Already DOM lo unte latest values inject cheyadam
    document.getElementById("lpf_name").value = prof.name;
    document.getElementById("lpf_phone").value = prof.phone;
    document.getElementById("lpf_village").value = prof.village;
    document.getElementById("lpf_count").value = prof.gangCount || 1;
    document.getElementById("lpf_wage").value = prof.wage || 450;
    document.getElementById("lpf_trans").value = prof.ownTransport ? "yes" : "no";

    const checkboxes = document.querySelectorAll('input[name="labour_skills"]');
    checkboxes.forEach(cb => {
      cb.checked = prof.skills && prof.skills.includes(cb.value);
    });
    return;
  }

  const modalHtml = `
    <div id="labourProfileModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.65); z-index:99999; justify-content:center; align-items:center; padding:15px; box-sizing:border-box;">
      <div style="background:#fff; width:100%; max-width:380px; border-radius:12px; padding:16px; box-shadow:0 8px 24px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto; box-sizing:border-box; font-family:sans-serif;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e0e0e0; padding-bottom:8px; margin-bottom:12px;">
          <h4 style="margin:0; color:#0277bd; font-size:15px;">👷 నా కూలీ వివరాలు & పనులు</h4>
          <span onclick="window.closeLabourProfileModal()" style="font-size:22px; font-weight:bold; cursor:pointer; color:#777; line-height:1;">&times;</span>
        </div>

        <form id="labourProfileForm" onsubmit="window.handleLabourProfileSubmit(event)" style="display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">కూలీ / మేస్త్రీ పేరు:</label>
            <input type="text" id="lpf_name" required value="${prof.name}" style="width:100%; padding:7px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div>
            <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">ఫోన్ నంబర్:</label>
            <input type="tel" id="lpf_phone" required pattern="[0-9]{10}" value="${prof.phone}" style="width:100%; padding:7px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">గ్రామం / ప్రాంతం:</label>
              <input type="text" id="lpf_village" required value="${prof.village}" style="width:100%; padding:7px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">బృందం సభ్యులు:</label>
              <input type="number" id="lpf_count" min="1" value="${prof.gangCount || 1}" required style="width:100%; padding:7px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">రోజు కూలీ (₹):</label>
              <input type="number" id="lpf_wage" min="100" step="50" value="${prof.wage || 450}" required style="width:100%; padding:7px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:bold; color:#333; display:block; margin-bottom:3px;">సొంత బండి ఉందా?</label>
              <select id="lpf_trans" style="width:100%; padding:7px; border:1px solid #ccc; border-radius:6px; font-size:12px; background:#fff;">
                <option value="yes" ${prof.ownTransport ? 'selected' : ''}>🛵 ఉంది</option>
                <option value="no" ${!prof.ownTransport ? 'selected' : ''}>❌ లేదు (రవాణా కావాలి)</option>
              </select>
            </div>
          </div>

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

          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
            <button type="button" onclick="window.closeLabourProfileModal()" style="padding:7px 14px; border:1px solid #ccc; background:#f5f5f5; border-radius:6px; font-size:12px; cursor:pointer;">రద్దు</button>
            <button type="submit" style="padding:7px 16px; border:none; background:#0288d1; color:#fff; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">💾 వివరాలు సేవ్ చేయండి</button>
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
  window.closeLabourProfileModal();

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
window.saveLabourProfile = saveLabourProfile;

// Initialize on DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ensureLabourProfileModal);
} else {
  ensureLabourProfileModal();
}
