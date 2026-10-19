// role.js - AgriConnect Smart Role Cards, Registration Modal & Profile Dashboard Controller

// Helper: Rhythu Dashboard Container
function getFarmerDashboardElement() {
  let el = document.getElementById("farmer-post-container");
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

// Helper: Kooli Dashboard Container
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

// Helper: Yajamanula Seva Kendram Dashboard Container
function getProviderDashboardElement() {
  let el = document.getElementById("provider-hub-container");
  if (!el) {
    const labour = document.getElementById("labour-jobs-container");
    const wallet = document.getElementById("wallet-container") || document.querySelector(".wallet-card");
    const parent = (labour && labour.parentNode) || (wallet && wallet.parentNode);
    if (parent) {
      el = document.createElement("div");
      el.id = "provider-hub-container";
      if (labour && labour.nextSibling) {
        parent.insertBefore(el, labour.nextSibling);
      } else {
        parent.appendChild(el);
      }
    }
  }
  return el;
}

// Roles & Widgets Visibility Controller
function applyUserRoleView() {
  const state = window.AppState;
  const roleSwitchBar = document.getElementById('role-switch-container');

  const farmerContainer = getFarmerDashboardElement();
  const labourContainer = getLabourDashboardElement();
  const providerContainer = getProviderDashboardElement();
  const walletContainer = document.getElementById('wallet-container');
  const mandiContainer = document.getElementById('mandi-container') || document.querySelector('.mandi-card');
  const weatherContainer = document.getElementById('weather-container') || document.querySelector('.weather-card');

  // ===================================================
  // 1. Landing Page (User Login Kaani Samayam Lo)
  // ===================================================
  if (!state || !state.isLoggedIn) {
    if (roleSwitchBar) roleSwitchBar.style.setProperty('display', 'none', 'important');
    if (walletContainer) walletContainer.style.setProperty('display', 'none', 'important');

    // Mandi mariyu Weather landing page lo kanipinchali
    if (mandiContainer) mandiContainer.style.setProperty('display', 'block', 'important');
    if (weatherContainer) weatherContainer.style.setProperty('display', 'block', 'important');

    // 1. Rithu Login Card
    if (farmerContainer) {
      farmerContainer.style.setProperty('display', 'block', 'important');
      farmerContainer.innerHTML = `
        <div class="farmer-card" style="background:#fff; border:2px solid #2e7d32; border-radius:14px; padding:16px; margin-bottom:14px; box-shadow:0 3px 8px rgba(0,0,0,0.08);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="font-size:24px;">🌾</span>
            <strong style="font-size:16px; color:#2e7d32;">రైతు సోదరుల కోసం (Farmer)</strong>
          </div>
          <ul style="font-size:12px; color:#444; line-height:1.6; margin:0 0 12px 18px; padding:0;">
            <li>మీ పొలం పనులకు కూలీలను వెంటనే బుక్ చేసుకోండి.</li>
            <li>ఉచిత జాబ్ పోస్టింగ్ & మార్కెట్ లైవ్ ధరల సమాచారం.</li>
            <li>స్మార్ట్ ఆటో-స్విచ్: సొంత పని లేనప్పుడు కూలీ మోడ్‌కి మారే సదుపాయం.</li>
          </ul>
          <button onclick="openLoginModal('FARMER')" style="width:100%; background:#2e7d32; color:#fff; border:none; border-radius:8px; padding:12px; font-size:14px; font-weight:bold; cursor:pointer;">
            రైతుగా Login / నమోదు అవ్వండి ➔
          </button>
        </div>
      `;
    }

    // 2. Kooli Login Card
    if (labourContainer) {
      labourContainer.style.setProperty('display', 'block', 'important');
      labourContainer.innerHTML = `
        <div class="labour-card" style="background:#fff; border:2px solid #f57c00; border-radius:14px; padding:16px; margin-bottom:14px; box-shadow:0 3px 8px rgba(0,0,0,0.08);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="font-size:24px;">👷</span>
            <strong style="font-size:16px; color:#e65100;">కూలీల కోసం (Labour)</strong>
          </div>
          <ul style="font-size:12px; color:#444; line-height:1.6; margin:0 0 12px 18px; padding:0;">
            <li>మీ గ్రామం మరియు 5-10 కి.మీ పరిధిలోని రోజువారీ పనులను వెతుక్కోండి.</li>
            <li>రోజువారీ కూలీ వివరాలు, డైరెక్ట్ ఫోన్ / వాట్సాప్ కాలింగ్.</li>
            <li>మీ వేతనాల లెక్కల కోసం సులభమైన వ్యక్తిగత వాలెట్.</li>
          </ul>
          <button onclick="openLoginModal('LABOUR_ONLY')" style="width:100%; background:#f57c00; color:#fff; border:none; border-radius:8px; padding:12px; font-size:14px; font-weight:bold; cursor:pointer;">
            కూలీగా Login / నమోదు అవ్వండి ➔
          </button>
        </div>
      `;
    }

    // 3. Yajamanula Seva Kendram Card
    if (providerContainer) {
      providerContainer.style.setProperty('display', 'block', 'important');
      providerContainer.innerHTML = `
        <div class="provider-card" style="background:#fff; border:2px solid #7b1fa2; border-radius:14px; padding:16px; margin-bottom:14px; box-shadow:0 3px 8px rgba(0,0,0,0.08);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="font-size:24px;">🤝</span>
            <strong style="font-size:16px; color:#7b1fa2;">పరికరాలు, రవాణా & విత్తనాల యజమానుల సేవా కేంద్రం</strong>
          </div>
          <p style="font-size:12px; color:#555; line-height:1.5; margin:0 0 10px 0;">
            ట్రాక్టర్లు, హార్వెస్టర్లు, రవాణా వాహనాలు లేదా విత్తనాలు/ఎరువుల యజమానులు తమ సేవలను అద్దెకు/అమ్మకానికి ఇక్కడ సులభంగా జోడించవచ్చు.
          </p>
          <ul style="font-size:12px; color:#444; line-height:1.6; margin:0 0 12px 18px; padding:0;">
            <li>రైతుల నుండి నేరుగా బుకింగ్‌లు & ఆర్డర్‌లు పొందండి.</li>
            <li>మీ పరికరాలు, రవాణా రేట్లు మీరే నిర్ణయించుకోండి.</li>
            <li>కమీషన్ లేకుండా నేరుగా కస్టమర్‌తో ఫోన్ / వాట్సాప్ సంప్రదింపులు.</li>
          </ul>
          <button onclick="openProviderModal()" style="width:100%; background:#7b1fa2; color:#fff; border:none; border-radius:8px; padding:12px; font-size:14px; font-weight:bold; cursor:pointer;">
            యజమానిగా Login / సేవలను జోడించండి ➔
          </button>
        </div>
      `;
    }

    removeProfileHeader();
    removeRoleSwitchBar();
    return;
  }

  // ===================================================
  // 2. User Login Ayyinappudu
  // ===================================================
  renderUserProfileBanner();

  // A. Kevalam Kooli Login (LABOUR ONLY)
  if (state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY") {
    removeRoleSwitchBar();

    // Rithu dashboard, Mandi, Weather kooli ki hide avvali
    if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
    if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
    if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');

    // Kooli Dashboard mariyu Wallet matrame kanipinchali
    if (labourContainer) {
      labourContainer.style.setProperty('display', 'block', 'important');
      if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
    }
    if (walletContainer) {
      walletContainer.style.setProperty('display', 'block', 'important');
    }

    filterLabourJobsByLocation();
  } 

  // B. Rithu Login (FARMER)
  else if (state.userType === "FARMER") {
    renderRoleSwitchBar();

    // Rithu "Kooli Mode" loki switch ayithe:
    if (state.currentRole === 'LABOUR') {
      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
      if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');

      if (labourContainer) {
        labourContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
        filterLabourJobsByLocation();
      }
      if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
    } 
    // Rithu "Rithu Mode" lo unnapudu:
    else {
      if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');

      if (farmerContainer) {
        farmerContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderFarmerWidget === 'function') window.renderFarmerWidget();
      }
      if (mandiContainer) mandiContainer.style.setProperty('display', 'block', 'important');
      if (weatherContainer) weatherContainer.style.setProperty('display', 'block', 'important');
      if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
    }
  }
  // C. Yajamani Login (PROVIDER: Equipment / Transport / Seeds)
  else if (state.userType === "PROVIDER") {
    removeRoleSwitchBar();

    // Landing cards mariyu wallet ni hide cheyali
    if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
    if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
    if (walletContainer) walletContainer.style.setProperty('display', 'none', 'important');
    
    // Mandi & Weather unchali
    if (mandiContainer) mandiContainer.style.setProperty('display', 'block', 'important');
    if (weatherContainer) weatherContainer.style.setProperty('display', 'block', 'important');

    if (providerContainer) {
      providerContainer.style.setProperty('display', 'block', 'important');
      renderProviderDashboardView(providerContainer, state.providerType || 'equipment');
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

// Mode Switch Handler
window.switchRoleMode = function(targetRole) {
  if (!window.AppState) window.AppState = {};
  window.AppState.currentRole = targetRole;

  const fContainer = getFarmerDashboardElement();
  const lContainer = getLabourDashboardElement();
  const mandiContainer = document.getElementById('mandi-container') || document.querySelector('.mandi-card');
  const weatherContainer = document.getElementById('weather-container') || document.querySelector('.weather-card');

  if (targetRole === "FARMER") {
    if (fContainer) {
      fContainer.style.setProperty("display", "block", "important");
      fContainer.style.visibility = "visible";
    }
    if (lContainer) {
      lContainer.style.setProperty("display", "none", "important");
    }
    // Farmer mode lo Mandi mariyu Weather chupinchali
    if (mandiContainer) mandiContainer.style.setProperty("display", "block", "important");
    if (weatherContainer) weatherContainer.style.setProperty("display", "block", "important");

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
    // Labour mode lo Mandi mariyu Weather hide cheyali
    if (mandiContainer) mandiContainer.style.setProperty("display", "none", "important");
    if (weatherContainer) weatherContainer.style.setProperty("display", "none", "important");

    if (typeof window.renderLabourWidget === "function") {
      window.renderLabourWidget();
    }
    filterLabourJobsByLocation();
  }

  renderRoleSwitchBar();
  renderUserProfileBanner();

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
// ===================================================
// 7. Provider Modal: 3 Pill Tabs & Login Controller
// ===================================================
let selectedProviderType = 'equipment';

window.openProviderModal = function() {
  let modal = document.getElementById('provider-auth-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'provider-auth-modal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; padding:14px; box-sizing:border-box;';
    
    modal.innerHTML = `
      <div style="background:#fff; border-radius:16px; width:100%; max-width:380px; padding:20px; box-shadow:0 8px 24px rgba(0,0,0,0.2); position:relative;">
        <button onclick="closeProviderModal()" style="position:absolute; top:12px; right:12px; background:none; border:none; font-size:20px; cursor:pointer; color:#777;">✕</button>
        
        <div style="text-align:center; margin-bottom:14px;">
          <h3 style="margin:0; font-size:17px; color:#4a148c;">🤝 యజమానుల సేవా కేంద్రం</h3>
          <p style="margin:4px 0 0 0; font-size:12px; color:#666;">మీ కేటగిరీని ఎంచుకొని వివరాలు నమోదు చేయండి</p>
        </div>

        <!-- 3 Pill Tabs -->
        <div style="display:flex; gap:6px; margin-bottom:16px;">
          <button id="p-tab-equipment" type="button" onclick="selectProviderTab('equipment')" style="flex:1; padding:8px 4px; font-size:11px; font-weight:bold; border-radius:18px; border:1.5px solid #f57c00; background:#f57c00; color:#fff; cursor:pointer;">
            🚜 పరికరాలు
          </button>
          <button id="p-tab-transport" type="button" onclick="selectProviderTab('transport')" style="flex:1; padding:8px 4px; font-size:11px; font-weight:bold; border-radius:18px; border:1.5px solid #7b1fa2; background:#f3e5f5; color:#7b1fa2; cursor:pointer;">
            🚚 రవాణా
          </button>
          <button id="p-tab-seeds" type="button" onclick="selectProviderTab('seeds')" style="flex:1; padding:8px 4px; font-size:11px; font-weight:bold; border-radius:18px; border:1.5px solid #2e7d32; background:#e8f5e9; color:#2e7d32; cursor:pointer;">
            🌱 విత్తనాలు
          </button>
        </div>

        <!-- Provider Login Form -->
        <form onsubmit="handleProviderLogin(event)">
          <div style="margin-bottom:10px;">
            <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">యజమాని / డీలర్ పేరు:</label>
            <input type="text" id="prov-name" placeholder="ఉదా: రామయ్య / బాలాజీ ఫెర్టిలైజర్స్" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
          </div>

          <div style="margin-bottom:10px;">
            <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">మొబైల్ నంబర్:</label>
            <input type="tel" id="prov-phone" pattern="[0-9]{10}" placeholder="10 అంకెల ఫోన్ నంబర్" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">గ్రామం / పట్టణం:</label>
            <input type="text" id="prov-village" placeholder="ఉదా: పరకాల, వరంగల్" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
          </div>

          <button id="prov-submit-btn" type="submit" style="width:100%; background:#f57c00; color:#fff; border:none; border-radius:8px; padding:11px; font-size:14px; font-weight:bold; cursor:pointer;">
            🚜 పరికరాల ఓనర్‌గా డాష్‌బోర్డ్‌కు వెళ్లండి ➔
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
  selectedProviderType = 'equipment';
  selectProviderTab('equipment');
  modal.style.display = 'flex';
};

window.closeProviderModal = function() {
  const modal = document.getElementById('provider-auth-modal');
  if (modal) modal.style.display = 'none';
};

window.selectProviderTab = function(type) {
  selectedProviderType = type;
  const eqBtn = document.getElementById('p-tab-equipment');
  const trBtn = document.getElementById('p-tab-transport');
  const sdBtn = document.getElementById('p-tab-seeds');
  const submitBtn = document.getElementById('prov-submit-btn');

  if (eqBtn) { eqBtn.style.background = '#fff3e0'; eqBtn.style.color = '#e65100'; }
  if (trBtn) { trBtn.style.background = '#f3e5f5'; trBtn.style.color = '#7b1fa2'; }
  if (sdBtn) { sdBtn.style.background = '#e8f5e9'; sdBtn.style.color = '#2e7d32'; }

  if (type === 'equipment') {
    if (eqBtn) { eqBtn.style.background = '#f57c00'; eqBtn.style.color = '#ffffff'; }
    if (submitBtn) { submitBtn.style.background = '#f57c00'; submitBtn.innerHTML = '🚜 పరికరాల ఓనర్‌గా డాష్‌బోర్డ్‌కు వెళ్లండి ➔'; }
  } else if (type === 'transport') {
    if (trBtn) { trBtn.style.background = '#7b1fa2'; trBtn.style.color = '#ffffff'; }
    if (submitBtn) { submitBtn.style.background = '#7b1fa2'; submitBtn.innerHTML = '🚚 రవాణా ఓనర్‌గా డాష్‌బోర్డ్‌కు వెళ్లండి ➔'; }
  } else if (type === 'seeds') {
    if (sdBtn) { sdBtn.style.background = '#2e7d32'; sdBtn.style.color = '#ffffff'; }
    if (submitBtn) { submitBtn.style.background = '#2e7d32'; submitBtn.innerHTML = '🌱 విత్తనాల డీలర్‌గా డాష్‌బోర్డ్‌కు వెళ్లండి ➔'; }
  }
};

window.handleProviderLogin = function(e) {
  e.preventDefault();
  const name = document.getElementById('prov-name').value.trim();
  const phone = document.getElementById('prov-phone').value.trim();
  const village = document.getElementById('prov-village').value.trim();

  if (!name || !phone || !village) return;

  const providerUser = {
    name: name,
    phone: phone,
    village: village,
    userType: 'PROVIDER',
    providerType: selectedProviderType,
    isLoggedIn: true
  };

  localStorage.setItem('agri_user_profile', JSON.stringify(providerUser));
  if (window.AppState) {
    window.AppState.userProfile = providerUser;
    window.AppState.userType = 'PROVIDER';
    window.AppState.providerType = selectedProviderType;
    window.AppState.isLoggedIn = true;
  }

  closeProviderModal();
  
  if (typeof applyUserRoleView === 'function') {
    applyUserRoleView();
  }
};
// Provider Logged In Dashboard View
function renderProviderDashboardView(container, type) {
  const titles = {
    equipment: { name: '🚜 పరికరాల నిర్వహణ డ్యాష్‌బోర్డ్', color: '#f57c00', desc: 'మీ ట్రాక్టర్లు, హార్వెస్టర్లు మొదలైన పరికరాలను జోడించండి' },
    transport: { name: '🚚 రవాణా వాహనాల డ్యాష్‌బోర్డ్', color: '#7b1fa2', desc: 'మీ రవాణా వాహనాలు, ట్రాలీలు, ఆటోలను అద్దెకు చేర్చండి' },
    seeds: { name: '🌱 విత్తనాలు & ఎరువుల డీలర్ డ్యాష్‌బోర్డ్', color: '#2e7d32', desc: 'మీ వద్ద ఉన్న స్టాక్ మరియు ధరల వివరాలను నమోదు చేయండి' }
  };
  const current = titles[type] || titles.equipment;

  container.innerHTML = `
    <div style="background:#fff; border:2px solid ${current.color}; border-radius:14px; padding:16px; margin:14px auto; box-shadow:0 3px 8px rgba(0,0,0,0.08);">
      <h3 style="margin:0 0 6px 0; color:${current.color}; font-size:16px;">${current.name}</h3>
      <p style="font-size:12px; color:#555; margin:0 0 14px 0;">${current.desc}</p>
      <div style="background:#f9f9f9; padding:16px; border-radius:10px; border:2px dashed ${current.color}; text-align:center;">
        <span style="font-size:14px; font-weight:bold; color:${current.color};">➕ కొత్త వస్తువును / సేవను జోడించండి</span>
        <p style="font-size:12px; color:#777; margin:6px 0 0 0;">మీ వద్ద ఉన్న పరికరాలు / వాహనాలు / విత్తనాల వివరాలను ఇక్కడ లిస్ట్ చేయవచ్చు.</p>
      </div>
    </div>
  `;
}


