window.renderFarmerWidget// role.js - AgriConnect Smart Role Cards, Registration Modal & Profile Dashboard Controller

// Helper: Rhythu Dashboard Container ni safe ga theesukovatam
function getFarmerDashboardElement() {
  let el = document.getElementById("farmer-post-container");

  // Oka vela container dorakakapothe wallet paina create chesthundhi
  if (!el) {
    const wallet = document.getElementById("wallet-container") || document.querySelector(".wallet-card");
    if (wallet && wallet.parentNode) {
      el = document.createElement("div");
      el.id = "farmer-post-container";
      wallet.parentNode.insertBefore(el, wallet);
    }
  }
  return el;
}

function getLabourDashboardElement() {
  let el = document.getElementById("labour-jobs-container");
  if (!el) {
    const wallet = document.getElementById("wallet-container") || document.querySelector(".wallet-card");
    if (wallet && wallet.parentNode) {
      el = document.createElement("div");
      el.id = "labour-jobs-container";
      wallet.parentNode.insertBefore(el, wallet);
    }
  }
  return el;
}

// 1. Roles & Widgets Visibility + Profile Banner Setup
function applyUserRoleView() {
  const state = window.AppState;
  const publicCardsContainer = document.getElementById("public-user-cards-container");
  const roleSwitchBar = document.getElementById("role-switch-container");

  const farmerContainer = getFarmerDashboardElement();
  const labourContainer = getLabourDashboardElement();
  const mandiContainer = document.getElementById("mandi-container") || 
                         document.querySelector(".mandi-card") || 
                         Array.from(document.querySelectorAll("div")).find(el => el.textContent && el.textContent.includes("మండి / Market"));
  const walletContainer = document.getElementById("wallet-container") || 
                          document.querySelector(".wallet-card");

  // A. Public Landing Page (Login Kaakunda Unte)
  if (!state || !state.isLoggedIn) {
    if (publicCardsContainer) publicCardsContainer.style.setProperty("display", "block", "important");
    if (roleSwitchBar) roleSwitchBar.style.setProperty("display", "none", "important");
    if (farmerContainer) farmerContainer.style.setProperty("display", "none", "important");
    if (labourContainer) labourContainer.style.setProperty("display", "none", "important");
    if (walletContainer) walletContainer.style.setProperty("display", "none", "important");
    if (mandiContainer) mandiContainer.style.setProperty("display", "block", "important");
    removeProfileHeader();
    removeRoleSwitchBar();
    return;
  }

  // B. Login Aina Taruvatha Public Cards Hide Cheyadam
  if (publicCardsContainer) publicCardsContainer.style.setProperty("display", "none", "important");

  // User profile banner render cheyadam
  renderUserProfileBanner();

  // C. Kooli Login (LABOUR_ONLY)
  if (state.userType === "LABOUR_ONLY") {
    removeRoleSwitchBar();
    if (farmerContainer) farmerContainer.style.setProperty("display", "none", "important");
    if (mandiContainer) mandiContainer.style.setProperty("display", "none", "important");

    if (labourContainer) {
      labourContainer.style.setProperty("display", "block", "important");
      if (typeof window.renderLabourWidget === "function") {
        window.renderLabourWidget();
      }
    }
    if (walletContainer) walletContainer.style.setProperty("display", "block", "important");

    filterLabourJobsByLocation();
  } 
  // D. Rhythu Login (FARMER)
  else if (state.userType === "FARMER") {
    renderRoleSwitchBar();

    if (mandiContainer) mandiContainer.style.setProperty("display", "block", "important");
    if (walletContainer) walletContainer.style.setProperty("display", "block", "important");

    if (state.currentRole === "LABOUR") {
      if (farmerContainer) farmerContainer.style.setProperty("display", "none", "important");
      if (labourContainer) {
        labourContainer.style.setProperty("display", "block", "important");
        if (typeof window.renderLabourWidget === "function") {
          window.renderLabourWidget();
        }
      }
      filterLabourJobsByLocation();
      } else {
      // Farmer Role Active ga unnappudu:
      if (labourContainer)
        labourContainer.style.setProperty("display", "none", "important");
      if (farmerContainer) {
        farmerContainer.style.setProperty("display", "block", "important");
      }

            // Mukhyam: Rhythu Widget ni render cheyadam (Direct + Fallback sync)
      function triggerFarmerRender() {
        const fBox = document.getElementById("farmer-post-container");
        if (fBox) {
          fBox.style.setProperty("display", "block", "important");
        }
        if (typeof window.renderFarmerWidget === "function") {
          window.renderFarmerWidget();
          if (typeof prefillFarmerFormDefaults === "function") {
            prefillFarmerFormDefaults();
          }
        } else if (typeof window.renderFarmerLabourPane === "function") {
          window.renderFarmerLabourPane();
        }
      }

 // Calls function bayata:
    triggerFarmerRender();
   setTimeout(triggerFarmerRender, 200);
   setTimeout(triggerFarmerRender, 800);
    }
  }
}

// 2. Profile Banner
function renderUserProfileBanner() {
  let banner = document.getElementById("user-profile-banner");
  const state = window.AppState;
  if (!state || !state.userProfile) return;

  if (!banner) {
    banner = document.createElement("div");
    banner.id = "user-profile-banner";
    const header = document.querySelector(".header") || document.querySelector("header") || document.body.firstChild;
    if (header && header.parentNode) {
      header.parentNode.insertBefore(banner, header.nextSibling);
    } else {
      document.body.prepend(banner);
    }
  }

  const isFarmerNow = (state.currentRole === "FARMER" || (!state.currentRole && state.userType === "FARMER"));
  const roleText = isFarmerNow ? "రైతు (Farmer)" : "కూలీ (Labour)";
  const badgeColor = isFarmerNow ? "#2e7d32" : "#e65100";

  banner.style.cssText = `max-width: 480px; margin: 10px auto; padding: 12px 16px; background: #ffffff; border-left: 5px solid ${badgeColor}; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center;`;

  banner.innerHTML = `
    <div>
      <div style="font-size: 15px; font-weight: bold; color: #333;">
        👤 ${state.userProfile.name} 
        <span style="font-size: 11px; background: ${badgeColor}20; color: ${badgeColor}; padding: 2px 8px; border-radius: 12px; margin-left: 6px;">${roleText}</span>
      </div>
      <div style="font-size: 13px; color: #666; margin-top: 3px;">
        📞 ${state.userProfile.phone} &nbsp;|&nbsp; 📍 గ్రామం: <b>${state.userProfile.village}</b>
      </div>
    </div>
    <button onclick="logoutUser()" style="background: #f44336; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: bold;">Logout</button>
  `;
}

function removeProfileHeader() {
  const banner = document.getElementById("user-profile-banner");
  if (banner) banner.remove();
}

// 2.A Rhythu ⇄ Kooli Mode Switch Bar
function renderRoleSwitchBar() {
  const state = window.AppState;
  if (!state || !state.isLoggedIn || state.userType !== "FARMER") return;

  let switchContainer = document.getElementById("role-switch-container");
  if (!switchContainer) {
    switchContainer = document.createElement("div");
    switchContainer.id = "role-switch-container";
    switchContainer.style.cssText = "max-width: 480px; margin: 8px auto; padding: 4px; background: #e8f5e9; border-radius: 25px; display: flex; justify-content: space-between; border: 1px solid #c8e6c9; box-sizing: border-box;";

    const userBanner = document.getElementById("user-profile-banner");
    if (userBanner && userBanner.parentNode) {
      userBanner.parentNode.insertBefore(switchContainer, userBanner.nextSibling);
    } else {
      document.body.prepend(switchContainer);
    }
  }

  const isFarmerRole = (state.currentRole !== "LABOUR");

      switchContainer.innerHTML = `
      <button type="button" onclick="switchRoleMode('FARMER')" style="flex: 1; padding: 9px 8px; border-radius: 22px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 4px; border: 1.5px solid #2e7d32; ${isFarmerRole ? 'background: #2e7d32; color: #ffffff; box-shadow: 0 2px 5px rgba(46,125,50,0.3);' : 'background: #e8f5e9; color: #1b5e20;'}">
        🌾 Farmer mode (రైతు)
      </button>
      <button type="button" onclick="switchRoleMode('LABOUR')" style="flex: 1; padding: 9px 8px; border-radius: 22px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 4px; border: 1.5px solid #f57c00; ${!isFarmerRole ? 'background: #e65100; color: #ffffff; box-shadow: 0 2px 5px rgba(230,81,0,0.3);' : 'background: #fff3e0; color: #e65100;'}">
        👷 Labour mode (కూలీ)
      </button>
    `;
}

function removeRoleSwitchBar() {
  const switchContainer = document.getElementById("role-switch-container");
  if (switchContainer) switchContainer.remove();
}

// Mode Switch Handler (Force execution without block)
window.switchRoleMode = function(targetRole) {
  if (!window.AppState) window.AppState = {};
  window.AppState.currentRole = targetRole;

  const fContainer = getFarmerDashboardElement();
  const lContainer = getLabourDashboardElement();

  if (targetRole === "FARMER") {
    if (fContainer) {
      fContainer.style.setProperty("display", "block", "important");
      fContainer.style.visibility = "visible";
    }
    if (lContainer) {
      lContainer.style.setProperty("display", "none", "important");
    }

    if (typeof window.renderFarmerWidget === "function") {
      window.renderFarmerWidget();
    } else if (typeof window.renderFarmerLabourPane === "function") {
      window.renderFarmerLabourPane();
    }
    setTimeout(prefillFarmerFormDefaults, 60);
  } else {
    if (fContainer) {
      fContainer.style.setProperty("display", "none", "important");
    }
    if (lContainer) {
      lContainer.style.setProperty("display", "block", "important");
      lContainer.style.visibility = "visible";
    }

    if (typeof window.renderLabourWidget === "function") {
      window.renderLabourWidget();
    }
    filterLabourJobsByLocation();
  }

  // Refresh controls
  renderRoleSwitchBar();
  renderUserProfileBanner();

  // Voice feedback
  if (typeof speakTeluguText === "function") {
    if (targetRole === "LABOUR") {
      speakTeluguText("కూలీ మోడ్‌కి మారారు. మీ చుట్టుపక్కల పనుల వివరాలు ఇక్కడ కనిపిస్తాయి.");
    } else {
      speakTeluguText("రైతు మోడ్‌కి మారారు. మీ పొలం పనులకు కూలీలను పోస్ట్ చేయవచ్చు.");
    }
  }
};

window.logoutUser = function() {
  window.AppState.isLoggedIn = false;
  window.AppState.userProfile = null;
  localStorage.removeItem("agri_user_profile");
  applyUserRoleView();
  if (typeof speakTeluguText === "function") {
    speakTeluguText("ఖాతా నుండి విజయవంతంగా లాగౌట్ అయ్యారు.");
  }
};

// 3. Form Auto-Fill Defaults
function prefillFarmerFormDefaults() {
  const profile = window.AppState?.userProfile;
  if (!profile) return;

  const nameInput = document.getElementById("f-name");
  const phoneInput = document.getElementById("f-phone");
  const villageBtn = document.getElementById("f-village-btn");

  if (nameInput && !nameInput.value) {
    nameInput.value = profile.name;
    nameInput.style.backgroundColor = "#e8f5e9";
    nameInput.style.fontWeight = "bold";
  }

  if (phoneInput && !phoneInput.value) {
    phoneInput.value = profile.phone;
    phoneInput.style.backgroundColor = "#e8f5e9";
    phoneInput.style.fontWeight = "bold";
  }

  if (villageBtn && profile.village) {
    villageBtn.textContent = "🏛️ " + profile.village;
  }
}

// 4. Filter Jobs by village
function filterLabourJobsByLocation() {
  const profile = window.AppState?.userProfile;
  if (!profile || !profile.village) return;

  const jobCards = document.querySelectorAll(".job-card, .job-item, [data-village]");
  jobCards.forEach(card => {
    const jobVillage = card.getAttribute("data-village") || card.textContent;
    if (jobVillage.toLowerCase().includes(profile.village.toLowerCase())) {
      card.style.display = "block";
      card.style.border = "2px solid #4caf50";
    }
  });
}

// 5. Login Modal
window.openLoginModal = function(roleType) {
  let modal = document.getElementById("role-login-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "role-login-modal";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:9999; padding:15px;";
    document.body.appendChild(modal);
  }

  const isFarmer = roleType === "FARMER";
  const title = isFarmer ? "🌾 రైతు ప్రొఫైల్ వివరాలు" : "👷 కూలీ ప్రొఫైల్ వివరాలు";
  const themeColor = isFarmer ? "#2e7d32" : "#e65100";

  modal.innerHTML = `
    <div style="background:#fff; width:100%; max-width:380px; border-radius:14px; padding:20px; box-shadow:0 8px 24px rgba(0,0,0,0.2);">
      <h3 style="margin:0 0 14px 0; color:${themeColor}; font-size:18px; text-align:center;">${title}</h3>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:bold; color:#555;">మీ పూర్తి పేరు:</label>
        <input type="text" id="reg-name" placeholder="ఉదా: కిషోర్ రెడ్డి" style="width:100%; padding:10px; margin-top:4px; border:1px solid #ccc; border-radius:8px; font-size:14px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:12px;">
        <label style="font-size:12px; font-weight:bold; color:#555;">మొబైల్ నంబర్ (10 అంకెలు):</label>
        <input type="tel" id="reg-phone" placeholder="9876543210" maxlength="10" style="width:100%; padding:10px; margin-top:4px; border:1px solid #ccc; border-radius:8px; font-size:14px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:16px;">
        <label style="font-size:12px; font-weight:bold; color:#555;">గ్రామం / ఊరు (Village):</label>
        <input type="text" id="reg-village" placeholder="ఉదా: హసన్‌పర్తి / గోపాల్‌పూర్" style="width:100%; padding:10px; margin-top:4px; border:1px solid #ccc; border-radius:8px; font-size:14px; box-sizing:border-box;">
      </div>

      <div style="display:flex; gap:10px;">
        <button onclick="closeLoginModal()" style="flex:1; background:#eee; border:none; padding:10px; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer; color:#555;">రద్దు</button>
        <button onclick="submitUserRegistration('${roleType}')" style="flex:1; background:${themeColor}; color:#fff; border:none; padding:10px; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer;">సమర్పించండి</button>
      </div>
    </div>
  `;

  modal.style.display = "flex";
};

window.closeLoginModal = function() {
  const modal = document.getElementById("role-login-modal");
  if (modal) modal.style.display = "none";
};

// 6. Registration Submission
window.submitUserRegistration = function(roleType) {
  const name = document.getElementById("reg-name")?.value.trim();
  const phone = document.getElementById("reg-phone")?.value.trim();
  const village = document.getElementById("reg-village")?.value.trim();

  if (!name) {
    alert("దయచేసి మీ పేరు నమోదు చేయండి.");
    return;
  }
  if (!phone || phone.length < 10) {
    alert("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.");
    return;
  }
  if (!village) {
    alert("దయచేసి మీ గ్రామం పేరు నమోదు చేయండి.");
    return;
  }

  const profile = { name, phone, village, roleType };
  window.AppState.isLoggedIn = true;
  window.AppState.userType = roleType;
  window.AppState.currentRole = (roleType === "LABOUR_ONLY") ? "LABOUR" : "FARMER";
  window.AppState.userProfile = profile;

  try {
    localStorage.setItem("agri_user_profile", JSON.stringify(profile));
  } catch (e) {}

  closeLoginModal();
  applyUserRoleView();

  if (typeof speakTeluguText === "function") {
    if (roleType === "LABOUR_ONLY") {
      speakTeluguText(`${name} గారు, కూలీ ఖాతాలోకి స్వాగతం. మీ గ్రామం ${village} మరియు చుట్టుపక్కల 5 నుండి 10 కిలోమీటర్ల పరిధిలోని పనుల వివరాలు ఇక్కడ ఉన్నాయి.`);
    } else {
      speakTeluguText(`${name} గారు, రైతు ఖాతాలోకి స్వాగతం. మీ వివరాలు నమోదు చేయబడ్డాయి. పంట, కూలీల సంఖ్య, తేదీ వివరాలతో పనిని సులభంగా పోస్ట్ చేయవచ్చు.`);
    }
  }
};

// 7. Homepage Public Cards
function renderPublicUserCards() {
  if (document.getElementById("public-user-cards-container")) return;

  const container = document.createElement("div");
  container.id = "public-user-cards-container";
  container.style.cssText = "max-width: 480px; margin: 12px auto; padding: 0 10px;";

  container.innerHTML = `
    <div style="background:#ffffff; border:2px solid #2e7d32; border-radius:14px; padding:16px; margin-bottom:14px; box-shadow:0 3px 10px rgba(0,0,0,0.08);">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <span style="font-size:24px;">🌾</span>
        <h3 style="margin:0; color:#2e7d32; font-size:18px;">రైతు సోదరుల కోసం (Farmer)</h3>
      </div>
      <p style="font-size:13px; color:#444; line-height:1.5; margin:6px 0 14px 0;">
        • మీ పొలం పనులకు కూలీలను వెంటనే బుక్ చేసుకోండి.<br>
        • ఉచిత జాబ్ పోస్టింగ్ & మార్కెట్ లైవ్ ధరల సమాచారం.<br>
        • <b>స్మార్ట్ ఆటో-స్విచ్:</b> సొంత పని లేనప్పుడు కూలీ మోడ్‌కి మారే సదుపాయం.
      </p>
      <button onclick="openLoginModal('FARMER')" style="width:100%; background:#2e7d32; color:#fff; border:none; padding:11px; border-radius:8px; font-weight:bold; font-size:15px; cursor:pointer; box-shadow:0 2px 6px rgba(46,125,50,0.3);">
        రైతుగా Login / నమోదు అవ్వండి ➔
      </button>
    </div>

    <div style="background:#ffffff; border:2px solid #f57c00; border-radius:14px; padding:16px; margin-bottom:14px; box-shadow:0 3px 10px rgba(0,0,0,0.08);">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <span style="font-size:24px;">👷</span>
        <h3 style="margin:0; color:#e65100; font-size:18px;">కూలీల కోసం (Labour)</h3>
      </div>
      <p style="font-size:13px; color:#444; line-height:1.5; margin:6px 0 14px 0;">
        • మీ గ్రామం మరియు 5-10 కి.మీ పరిధిలోని రోజువారీ పనులను వెతుక్కోండి.<br>
        • రోజువారీ కూలీ వివరాలు, డైరెక్ట్ ఫోన్ / వాట్సాప్ కాలింగ్.<br>
        • మీ వేతనాల లెక్కల కోసం సులభమైన <b>వ్యక్తిగత వాలెట్</b>.
      </p>
      <button onclick="openLoginModal('LABOUR_ONLY')" style="width:100%; background:#f57c00; color:#fff; border:none; padding:11px; border-radius:8px; font-weight:bold; font-size:15px; cursor:pointer; box-shadow:0 2px 6px rgba(245,124,0,0.3);">
        కూలీగా Login / నమోదు అవ్వండి ➔
      </button>
    </div>
  `;

  const header = document.querySelector(".header") || document.querySelector("header") || document.body.firstChild;
  if (header && header.parentNode) {
    header.parentNode.insertBefore(container, header.nextSibling);
  } else {
    document.body.prepend(container);
  }
}

// 8. Init Role Flow
function initRoleFlow() {
  if (!window.AppState) window.AppState = {};

  try {
    const savedProfile = localStorage.getItem("agri_user_profile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      window.AppState.isLoggedIn = true;
      window.AppState.userProfile = parsed;
      window.AppState.userType = parsed.roleType || (parsed.isFarmer ? "FARMER" : "LABOUR_ONLY");
      window.AppState.currentRole = (window.AppState.userType === "LABOUR_ONLY") ? "LABOUR" : "FARMER";
    }
  } catch (e) {}

  if (typeof renderAutoVoiceToggle === "function") {
    renderAutoVoiceToggle();
  }
  renderPublicUserCards();
  applyUserRoleView();
  setTimeout(applyUserRoleView, 250);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRoleFlow);
} else {
  initRoleFlow();
}
