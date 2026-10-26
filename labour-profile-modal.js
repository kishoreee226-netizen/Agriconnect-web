// labour-profile-modal.js - Labour Profile, Skills Checkboxes, AppState Sync & Duty ON/OFF Toggle

function getLabourProfile() {
  const appProf = window.AppState?.userProfile;
  let stored = null;

  try {
    const p = localStorage.getItem("agri_labour_current_profile");
    if (p) stored = JSON.parse(p);
  } catch (e) {}

  const activePhone = (typeof window.getActiveUserPhone === "function")
    ? window.getActiveUserPhone()
    : (appProf?.phone || stored?.phone || "");

  const baseName = appProf?.name || stored?.name || "కూలీ";
  const baseVillage = appProf?.village || stored?.village || "స్థానిక పరిధి";

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
    phone: activePhone,
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
  if (window.db && profile.phone) {
    const docId = "profile_" + profile.phone;
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
    <div id="labourProfileModal" class="lpm-modal-overlay">
      <div class="lpm-modal-card">
        
        <div class="lpm-modal-header">
          <h4 class="lpm-modal-title">👷 నా కూలీ వివరాలు & పనులు</h4>
          <span onclick="window.closeLabourProfileModal()" class="lpm-close-btn">&times;</span>
        </div>

        <form id="labourProfileForm" onsubmit="window.handleLabourProfileSubmit(event)" class="lpm-form">
          <div>
            <label class="lpm-label">కూలీ / మేస్త్రీ పేరు:</label>
            <input type="text" id="lpf_name" required value="${prof.name}" class="lpm-input">
          </div>

          <div>
            <label class="lpm-label">ఫోన్ నంబర్:</label>
            <input type="tel" id="lpf_phone" required pattern="[0-9]{10}" value="${prof.phone}" class="lpm-input">
          </div>

          <div class="lpm-grid-2">
            <div>
              <label class="lpm-label">గ్రామం / ప్రాంతం:</label>
              <input type="text" id="lpf_village" required value="${prof.village}" class="lpm-input">
            </div>
            <div>
              <label class="lpm-label">బృందం సభ్యులు:</label>
              <input type="number" id="lpf_count" min="1" value="${prof.gangCount || 1}" required class="lpm-input">
            </div>
          </div>

          <div class="lpm-grid-2">
            <div>
              <label class="lpm-label">రోజు కూలీ (₹):</label>
              <input type="number" id="lpf_wage" min="100" step="50" value="${prof.wage || 450}" required class="lpm-input">
            </div>
            <div>
              <label class="lpm-label">సొంత బండి ఉందా?</label>
              <select id="lpf_trans" class="lpm-select">
                <option value="yes" ${prof.ownTransport ? 'selected' : ''}>🛵 ఉంది</option>
                <option value="no" ${!prof.ownTransport ? 'selected' : ''}>❌ లేదు (రవాణా కావాలి)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="lpm-label">మీకు వచ్చిన పనులు (టిక్ చేయండి):</label>
            <div class="lpm-skills-box">
              ${allSkills.map(s => {
                const checked = prof.skills && prof.skills.includes(s) ? 'checked' : '';
                return `
                  <label class="lpm-skill-item">
                    <input type="checkbox" name="labour_skills" value="${s}" ${checked}>${s}
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <div class="lpm-btn-row">
            <button type="button" onclick="window.closeLabourProfileModal()" class="lpm-btn-cancel">రద్దు</button>
            <button type="submit" class="lpm-btn-save">💾 వివరాలు సేవ్ చేయండి</button>
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
  if (modal) {
    modal.classList.add("is-active");
    modal.style.display = "flex";
  }
};

window.closeLabourProfileModal = function() {
  const modal = document.getElementById("labourProfileModal");
  if (modal) {
    modal.classList.remove("is-active");
    modal.style.display = "none";
  }
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
