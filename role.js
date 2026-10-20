// role.js - AgriConnect Smart Role Cards, Registration Modal & Profile Dashboard Controller

// ===================================================
// Helper Functions: Containers for Dashboards
// ===================================================

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

// ===================================================
// Roles & Widgets Visibility Controller
// ===================================================
function applyUserRoleView() {
  const state = window.AppState;
  const roleSwitchBar = document.getElementById('role-switch-container');

  const farmerContainer = getFarmerDashboardElement();
  const labourContainer = getLabourDashboardElement();
  const providerContainer = getProviderDashboardElement();
  const walletContainer = document.getElementById('wallet-container');
  const mandiContainer = document.getElementById('mandi-container') || document.querySelector('.mandi-card');
  const weatherContainer = document.getElementById('weather-container') || document.querySelector('.weather-card');

  // ---------------------------------------------------
  // 1. Landing Page (User Login Kaani Samayam Lo)
  // ---------------------------------------------------
  if (!state || !state.isLoggedIn) {
    if (typeof removeProfileHeader === 'function') removeProfileHeader();
    if (typeof removeUserProfileBanner === 'function') removeUserProfileBanner();
    if (typeof removeRoleSwitchBar === 'function') removeRoleSwitchBar();

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
    return;
  }

  // ---------------------------------------------------
  // 2. User Login Ayyinappudu
  // ---------------------------------------------------
  renderUserProfileBanner();

  // A. Kevalam Kooli Login (LABOUR ONLY)
  if (state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY") {
    removeRoleSwitchBar();

    if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
    if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
    if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
    if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');

    if (labourContainer) {
      labourContainer.style.setProperty('display', 'block', 'important');
      if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
    }
    if (walletContainer) {
      walletContainer.style.setProperty('display', 'block', 'important');
    }

    if (typeof filterLabourJobsByLocation === 'function') filterLabourJobsByLocation();
  } 

  // B. Rithu Login (FARMER)
  else if (state.userType === "FARMER") {
    renderRoleSwitchBar();

    // Rithu "Kooli Mode" loki switch ayithe:
    if (state.currentRole === 'LABOUR') {
      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
      if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
      if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');

      if (labourContainer) {
        labourContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
        if (typeof filterLabourJobsByLocation === 'function') filterLabourJobsByLocation();
      }
      if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
    } 
    // Rithu "Rithu Mode" lo unnapudu:
    else {
      if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
      if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');

      if (farmerContainer) {
        farmerContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderFarmerWidget === 'function') window.renderFarmerWidget();
      }
      if (typeof window.renderFarmerWidgetWithLiveProviders === 'function') {
        window.renderFarmerWidgetWithLiveProviders();
      }

      if (mandiContainer) mandiContainer.style.setProperty('display', 'block', 'important');
      if (weatherContainer) weatherContainer.style.setProperty('display', 'block', 'important');
      if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
    }
  }
  // C. Yajamani Login (PROVIDER: Equipment / Transport / Seeds)
  else if (state.userType === "PROVIDER") {
    removeRoleSwitchBar();

    if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
    if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
    if (walletContainer) walletContainer.style.setProperty('display', 'none', 'important');

    if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
    if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');

    if (providerContainer) {
      providerContainer.style.setProperty('display', 'block', 'important');
      renderProviderDashboardView(providerContainer, state.providerType || 'equipment');
    }
  }
}

// ===================================================
// Profile Banner & Role Switch Bar
// ===================================================
function renderUserProfileBanner() {
  let banner = document.getElementById("user-profile-banner");
  const state = window.AppState;
  const user = state ? (state.userProfile || state.user) : null;
  if (!user) return;

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

  let roleText = "రైతు (Farmer)";
  let badgeColor = "#2e7d32";

  if (state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY" || state.currentRole === "LABOUR") {
    roleText = "కూలీ (Labour)";
    badgeColor = "#e65100";
  } else if (state.userType === "PROVIDER") {
    const pType = state.providerType || (user && user.providerType) || 'equipment';
    if (pType === 'transport') {
      roleText = "🚚 రవాణా యజమాని";
      badgeColor = "#7b1fa2";
    } else if (pType === 'seeds') {
      roleText = "🌱 విత్తనాల డీలర్";
      badgeColor = "#2e7d32";
    } else {
      roleText = "🚜 పరికరాల యజమాని";
      badgeColor = "#f57c00";
    }
  }

  banner.style.cssText = `max-width: 480px; margin: 10px auto; padding: 12px 16px; background: #ffffff; border-left: 5px solid ${badgeColor}; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center;`;

  banner.innerHTML = `
    <div>
      <div style="font-size: 15px; font-weight: bold; color: #333;">
        👤 ${user.name} 
        <span style="font-size: 11px; background: ${badgeColor}20; color: ${badgeColor}; padding: 2px 8px; border-radius: 12px; margin-left: 6px; font-weight:bold;">${roleText}</span>
      </div>
      <div style="font-size: 13px; color: #666; margin-top: 3px;">
        📞 ${user.phone} &nbsp;|&nbsp; 📍 గ్రామం: <b>${user.village}</b>
      </div>
    </div>
    <button onclick="logoutUser()" style="background: #f44336; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: bold;">Logout</button>
  `;
}

function removeProfileHeader() {
  const banner = document.getElementById("user-profile-banner");
  if (banner) banner.remove();
}

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
    if (mandiContainer) mandiContainer.style.setProperty("display", "none", "important");
    if (weatherContainer) weatherContainer.style.setProperty("display", "none", "important");

    if (typeof window.renderLabourWidget === "function") {
      window.renderLabourWidget();
    }
    if (typeof filterLabourJobsByLocation === 'function') filterLabourJobsByLocation();
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

// ===================================================
// Filter Jobs & Role Login Modal
// ===================================================
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
// Provider Modal: 3 Pill Tabs & Login Controller
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

function renderProviderDashboardView(container, type) {
  const titles = {
    equipment: { name: '🚜 పరికరాల నిర్వహణ డ్యాష్‌బోర్డ్', color: '#f57c00', desc: 'మీ ట్రాక్టర్లు, హార్వెస్టర్లు మొదలైన పరికరాలను జోడించండి' },
    transport: { name: '🚚 రవాణా వాహనాల డ్యాష్‌బోర్డ్', color: '#7b1fa2', desc: 'మీ రవాణా వాహనాలు, ట్రాలీలు, ఆటోలను అద్దెకు చేర్చండి' },
    seeds: { name: '🌱 విత్తనాలు & ఎరువుల డీలర్ డ్యాష్‌బోర్డ్', color: '#2e7d32', desc: 'మీ వద్ద ఉన్న స్టాక్ మరియు ధరల వివరాలను నమోదు చేయండి' }
  };
  const current = titles[type] || titles.equipment;

  container.innerHTML = `
    <div style="background:#fff; border:2px solid ${current.color}; border-radius:14px; padding:16px; margin:14px auto; max-width:480px; box-shadow:0 3px 8px rgba(0,0,0,0.08);">
      <h3 style="margin:0 0 6px 0; color:${current.color}; font-size:16px;">${current.name}</h3>
      <p style="font-size:12px; color:#555; margin:0 0 14px 0;">${current.desc}</p>
      
      <div onclick="openAddServiceModal('${type}')" style="background:#fcfcfc; padding:16px; border-radius:10px; border:2px dashed ${current.color}; text-align:center; cursor:pointer;">
        <span style="font-size:14px; font-weight:bold; color:${current.color};">➕ కొత్త వస్తువును / సేవను జోడించండి</span>
        <p style="font-size:12px; color:#777; margin:6px 0 0 0;">వివరాలు నమోదు చేయడానికి ఇక్కడ నొక్కండి</p>
      </div>

      <div id="provider-items-list" style="margin-top:16px;"></div>
      <div id="provider-incoming-requests"></div>
    </div>
  `;

  renderProviderItemsList(type);
  renderIncomingBookingsForProvider('provider-incoming-requests');
}

// ===================================================
// Provider Add Service Modal & Storage Controller
// ===================================================
window.openAddServiceModal = function(type) {
  let modal = document.getElementById('provider-item-modal');
  if (modal) modal.remove();

  const configs = {
    equipment: {
      title: '🚜 పరికరం వివరాలు జోడించండి',
      color: '#f57c00',
      fields: `
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">పరికరం రకం / మోడల్:</label>
          <input type="text" id="item-field-1" placeholder="ఉదా: మహీంద్రా 575 ట్రాక్టర్ / రోటవేటర్" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
        </div>
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">అద్దె ధర (గంటకు ₹):</label>
          <input type="number" id="item-field-2" placeholder="ఉదా: 900" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">పని స్థితి (Availability):</label>
          <select id="item-field-3" style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;">
            <option value="అందుబాటులో ఉంది (Available)">అందుబాటులో ఉంది (Available)</option>
            <option value="బిజీగా ఉంది (Busy)">బిజీగా ఉంది (Busy)</option>
          </select>
        </div>
      `
    },
    transport: {
      title: '🚚 రవాణా వాహనం వివరాలు జోడించండి',
      color: '#7b1fa2',
      fields: `
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">వాహనం రకం:</label>
          <input type="text" id="item-field-1" placeholder="ఉదా: బొలెరో పికప్ / 407 DCM / ట్రాక్టర్ ట్రాలీ" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
        </div>
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">ఛార్జీ (కి.మీ / ట్రిప్ ₹):</label>
          <input type="text" id="item-field-2" placeholder="ఉదా: ₹35 / కి.మీ లేదా ₹1200 / ట్రిప్" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">మోసే బరువు సామర్థ్యం:</label>
          <input type="text" id="item-field-3" placeholder="ఉదా: 2 టన్నులు / 50 బస్తాలు" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
        </div>
      `
    },
    seeds: {
      title: '🌱 విత్తనాలు / ఎరువుల వివరాలు జోడించండి',
      color: '#2e7d32',
      fields: `
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">పంట రకం & బ్రాండ్:</label>
          <input type="text" id="item-field-1" placeholder="ఉదా: వరి BPT 5204 / కాటన్ సీడ్స్" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
        </div>
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">ధర (బ్యాగ్ / ప్యాకెట్ ₹):</label>
          <input type="number" id="item-field-2" placeholder="ఉదా: 850" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">స్టాక్ లభ్యత:</label>
          <input type="text" id="item-field-3" placeholder="ఉదా: 100 బ్యాగులు అందుబాటులో ఉన్నాయి" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
        </div>
      `
    }
  };

  const conf = configs[type] || configs.equipment;

  modal = document.createElement('div');
  modal.id = 'provider-item-modal';
  modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; padding:14px; box-sizing:border-box;';

  modal.innerHTML = `
    <div style="background:#fff; border-radius:16px; width:100%; max-width:380px; padding:20px; box-shadow:0 8px 24px rgba(0,0,0,0.2); position:relative;">
      <button onclick="closeAddServiceModal()" style="position:absolute; top:12px; right:12px; background:none; border:none; font-size:20px; cursor:pointer; color:#777;">✕</button>
      
      <h3 style="margin:0 0 14px 0; font-size:16px; color:${conf.color}; text-align:center;">${conf.title}</h3>

      <form onsubmit="handleSaveProviderItem(event, '${type}')">
        ${conf.fields}
        <button type="submit" style="width:100%; background:${conf.color}; color:#fff; border:none; border-radius:8px; padding:12px; font-size:14px; font-weight:bold; cursor:pointer;">
          లిస్టింగ్‌ను సేవ్ చేయండి ➔
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
};

window.closeAddServiceModal = function() {
  const modal = document.getElementById('provider-item-modal');
  if (modal) modal.remove();
};

window.handleSaveProviderItem = function(e, type) {
  e.preventDefault();
  const val1 = document.getElementById('item-field-1').value.trim();
  const val2 = document.getElementById('item-field-2').value.trim();
  const val3 = document.getElementById('item-field-3').value.trim();

  if (!val1 || !val2 || !val3) return;

  const profile = window.AppState?.userProfile || JSON.parse(localStorage.getItem('agri_user_profile') || '{}');

  const newItem = {
    id: Date.now(),
    type: type,
    name: val1,
    rate: val2,
    extra: val3,
    providerName: profile.name || 'యజమాని',
    providerPhone: profile.phone || '',
    village: profile.village || ''
  };

  let items = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
  items.unshift(newItem);
  localStorage.setItem('agri_provider_items', JSON.stringify(items));

  closeAddServiceModal();
  renderProviderItemsList(type);
};

window.renderProviderItemsList = function(type) {
  const container = document.getElementById('provider-items-list');
  if (!container) return;

  const items = JSON.parse(localStorage.getItem('agri_provider_items') || '[]').filter(item => item.type === type);

  if (items.length === 0) {
    container.innerHTML = `<p style="font-size:12px; color:#888; text-align:center; margin:8px 0;">ఇంకా ఏవీ జోడించబడలేదు.</p>`;
    return;
  }

  container.innerHTML = `
    <h4 style="font-size:13px; color:#333; margin:0 0 8px 0;">మీరు జోడించిన సేవలు / వస్తువులు (${items.length}):</h4>
    <div style="display:flex; flex-direction:column; gap:8px;">
      ${items.map(item => `
        <div style="background:#f9f9f9; border:1px solid #e0e0e0; border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:13px; font-weight:bold; color:#333;">${item.name}</div>
            <div style="font-size:12px; color:#555;">ధర / అద్దె: <b>${item.rate}</b> &nbsp;\vert{}&nbsp; ${item.extra}</div>
          </div>
          <button onclick="deleteProviderItem(${item.id}, '${type}')" style="background:#ffebee; border:none; color:#c62828; padding:5px 8px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:bold;">తీసివేయి</button>
        </div>
      `).join('')}
    </div>
  `;
};

window.deleteProviderItem = function(id, type) {
  let items = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
  items = items.filter(item => item.id !== id);
  localStorage.setItem('agri_provider_items', JSON.stringify(items));
  renderProviderItemsList(type);
};

// ===================================================
// Rhythu Smart Vehicle Booking: Spot vs Advance
// ===================================================
let bookingMode = 'SPOT';
let userLiveCoords = null;

window.openFarmerVehicleBookingModal = function() {
  let modal = document.getElementById('farmer-booking-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'farmer-booking-modal';
  modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.65); display:flex; align-items:center; justify-content:center; z-index:9999; padding:12px; box-sizing:border-box;';

  modal.innerHTML = `
    <div style="background:#fff; border-radius:16px; width:100%; max-width:400px; padding:18px; box-shadow:0 10px 28px rgba(0,0,0,0.25); max-height:92vh; overflow-y:auto; position:relative;">
      <button onclick="closeFarmerBookingModal()" style="position:absolute; top:12px; right:12px; background:none; border:none; font-size:22px; cursor:pointer; color:#666;">✕</button>
      
      <div style="text-align:center; margin-bottom:12px;">
        <h3 style="margin:0; font-size:16px; color:#2e7d32;">🚜 వాహనం / యంత్రం బుకింగ్</h3>
        <p style="margin:4px 0 0 0; font-size:12px; color:#666;">మీ పొలం వద్దకే నేరుగా వాహనాన్ని రప్పించుకోండి</p>
      </div>

      <div style="display:flex; gap:8px; margin-bottom:14px; background:#f1f8e9; padding:4px; border-radius:24px;">
        <button id="btn-mode-spot" type="button" onclick="setBookingMode('SPOT')" style="flex:1; padding:8px 6px; font-size:12px; font-weight:bold; border:none; border-radius:20px; background:#2e7d32; color:#fff; cursor:pointer;">
          ⚡ వెంటనే కావాలి (Spot)
        </button>
        <button id="btn-mode-adv" type="button" onclick="setBookingMode('ADVANCE')" style="flex:1; padding:8px 6px; font-size:12px; font-weight:bold; border:none; border-radius:20px; background:transparent; color:#2e7d32; cursor:pointer;">
          📅 అడ్వాన్స్ బుకింగ్ (Advance)
        </button>
      </div>

      <div id="gps-status-box" style="background:#e8f5e9; border:1px solid #a5d6a7; border-radius:8px; padding:10px; margin-bottom:12px; font-size:12px; color:#2e7d32; display:flex; align-items:center; justify-content:space-between;">
        <span>📍 లైవ్ లొకేషన్: <b id="gps-text">గుర్తిస్తోంది...</b></span>
        <button type="button" onclick="fetchRhythuLiveGPS()" style="background:#2e7d32; color:#fff; border:none; padding:4px 8px; border-radius:6px; font-size:11px; cursor:pointer;">రీఫ్రెష్</button>
      </div>

      <form onsubmit="handleConfirmBookingRequest(event)">
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">వాహనం / పరికరం ఎంచుకోండి:</label>
          <select id="book-veh-type" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;">
            <option value="ట్రాక్టర్ (దుక్కి / రోటవేటర్)">ట్రాక్టర్ (దుక్కి / రోటవేటర్ / కల్టివేటర్)</option>
            <option value="హార్వెస్టర్ (వరి / మొక్కజొన్న కోత)">హార్వెస్టర్ (వరి / మొక్కజొన్న కోత మిషన్)</option>
            <option value="బొలెరో / DCM రవాణా వాహనం">బొలెరో / DCM రవాణా వాహనం</option>
            <option value="ట్రాక్టర్ ట్రాలీ (ధాన్యం రవాణా)">ట్రాక్టర్ ట్రాలీ (ధాన్యం రవాణా)</option>
            <option value="ఆటో ట్రాలీ (చిన్న లోడ్లు)">ఆటో ట్రాలీ (చిన్న లోడ్లు)</option>
            <option value="డ్రోన్ స్ప్రేయర్ (పురుగు మందుల పిచికారీ)">డ్రోన్ స్ప్రేయర్ (పురుగు మందుల పిచికారీ)</option>
          </select>
        </div>

        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:12px; font-weight:bold; color:#333; margin-bottom:4px;">పని పరిమాణం (ఎకరాలు / ట్రిప్పులు / బస్తాలు):</label>
          <input type="text" id="book-work-size" placeholder="ఉదా: 2 ఎకరాలు దుక్కి లేదా 50 బస్తాల లోడ్" required style="width:100%; padding:9px; font-size:13px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
        </div>

        <div id="advance-fields-container" style="display:none; margin-bottom:10px; background:#fff8e1; border:1px solid #ffe082; padding:10px; border-radius:8px;">
          <div style="margin-bottom:8px;">
            <label style="display:block; font-size:12px; font-weight:bold; color:#b78103; margin-bottom:4px;">ఏ రోజున కావాలి (తేదీ):</label>
            <input type="date" id="book-date" style="width:100%; padding:8px; font-size:13px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:bold; color:#b78103; margin-bottom:4px;">సమయం (Time):</label>
            <input type="time" id="book-time" style="width:100%; padding:8px; font-size:13px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box;" />
          </div>
        </div>

        <button id="book-submit-btn" type="submit" style="width:100%; background:#2e7d32; color:#fff; border:none; border-radius:8px; padding:12px; font-size:14px; font-weight:bold; cursor:pointer; margin-top:6px;">
          ⚡ వెంటనే దగ్గరలోని వాహనాలకు రిక్వెస్ట్ పంపండి ➔
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  fetchRhythuLiveGPS();
};

window.closeFarmerBookingModal = function() {
  const modal = document.getElementById('farmer-booking-modal');
  if (modal) modal.remove();
};

window.setBookingMode = function(mode) {
  bookingMode = mode;
  const spotBtn = document.getElementById('btn-mode-spot');
  const advBtn = document.getElementById('btn-mode-adv');
  const advFields = document.getElementById('advance-fields-container');
  const submitBtn = document.getElementById('book-submit-btn');

  if (mode === 'SPOT') {
    if (spotBtn) { spotBtn.style.background = '#2e7d32'; spotBtn.style.color = '#fff'; }
    if (advBtn) { advBtn.style.background = 'transparent'; advBtn.style.color = '#2e7d32'; }
    if (advFields) advFields.style.display = 'none';
    if (submitBtn) submitBtn.innerHTML = '⚡ వెంటనే దగ్గరలోని వాహనాలకు రిక్వెస్ట్ పంపండి ➔';
  } else {
    if (advBtn) { advBtn.style.background = '#2e7d32'; advBtn.style.color = '#fff'; }
    if (spotBtn) { spotBtn.style.background = 'transparent'; spotBtn.style.color = '#2e7d32'; }
    if (advFields) advFields.style.display = 'block';
    if (submitBtn) submitBtn.innerHTML = '📅 అడ్వాన్స్ బుకింగ్ కన్ఫర్మ్ చేయండి ➔';
  }
};

window.fetchRhythuLiveGPS = function() {
  const txt = document.getElementById('gps-text');
  if (!navigator.geolocation) {
    if (txt) txt.innerText = "GPS అందుబాటులో లేదు";
    return;
  }
  if (txt) txt.innerText = "లొకేషన్ తీసుకుంటోంది...";

  navigator.geolocation.getCurrentPosition(
    function(pos) {
      userLiveCoords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      if (txt) txt.innerText = "ఖచ్చితమైన లొకేషన్ దొరికింది ✅";
    },
    function(err) {
      if (txt) txt.innerText = "GPS ఆఫ్ చేయబడింది (డిఫాల్ట్ గ్రామం వర్తిస్తుంది)";
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
};

// ===================================================
// Booking Request Submission & Provider Inbox Controller
// ===================================================
window.handleConfirmBookingRequest = function(e) {
  e.preventDefault();
  const vehType = document.getElementById('book-veh-type').value;
  const workSize = document.getElementById('book-work-size').value.trim();
  const dateVal = document.getElementById('book-date') ? document.getElementById('book-date').value : '';
  const timeVal = document.getElementById('book-time') ? document.getElementById('book-time').value : '';

  const state = window.AppState;
  const user = state ? (state.userProfile || state.user) : null;
  const farmerName = (user && user.name) || 'రైతు';
  const farmerPhone = (user && user.phone) || '';
  const village = (user && user.village) || '';

  const mapLink = userLiveCoords ? `https://www.google.com/maps?q=${userLiveCoords.lat},${userLiveCoords.lng}` : '';

  const newBooking = {
    id: 'REQ_' + Date.now(),
    type: bookingMode,
    vehicleType: vehType,
    workSize: workSize,
    schedule: bookingMode === 'SPOT' ? 'తక్షణమే (Spot)' : `${dateVal} సమయం: ${timeVal}`,
    farmerName: farmerName,
    farmerPhone: farmerPhone,
    village: village,
    mapLink: mapLink,
    status: 'PENDING',
    acceptedBy: null,
    createdAt: new Date().toLocaleTimeString()
  };

  let allBookings = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');
  allBookings.unshift(newBooking);
  localStorage.setItem('agri_active_bookings', JSON.stringify(allBookings));

  closeFarmerBookingModal();

  const timingText = bookingMode === 'SPOT' ? '⚡ తక్షణమే (Emergency Spot Booking)' : `📅 తేది: ${dateVal} సమయం: ${timeVal}`;
  const alertMsg = `🌾 *AgriConnect రైతు వాహన రిక్వెస్ట్:*\n` +
    `👤 రైతు పేరు: ${farmerName} (${village})\n` +
    `📞 ఫోన్: ${farmerPhone}\n` +
    `🚜 కావాల్సిన వాహనం: ${vehType}\n` +
    `📐 పని పరిమాణం: ${workSize}\n` +
    `⏰ సమయం: ${timingText}\n` +
    (mapLink ? `📍 పొలం లైవ్ గూగుల్ మ్యాప్: ${mapLink}\n` : '') +
    `\nఈ వాహనం మీకు అందుబాటులో ఉంటే వెంటనే రైతుకు కాల్ చేసి కన్ఫర్మ్ చేయండి!`;

  const waShare = `https://wa.me/?text=${encodeURIComponent(alertMsg)}`;
  window.open(waShare, '_blank');

  alert('మీ రిక్వెస్ట్ నమోదు చేయబడింది! దగ్గరలోని యజమానుల డ్యాష్‌బోర్డ్‌కు పంపబడింది.');
  if (typeof window.renderFarmerWidgetWithLiveProviders === 'function') {
    window.renderFarmerWidgetWithLiveProviders();
  }
};

window.renderIncomingBookingsForProvider = function(containerId) {
  const box = document.getElementById(containerId);
  if (!box) return;

  const bookings = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');

  if (bookings.length === 0) {
    box.innerHTML = `<p style="font-size:12px; color:#888; text-align:center; margin:10px 0;">ప్రస్తుతం కొత్త ఆర్డర్‌లు లేవు.</p>`;
    return;
  }

  box.innerHTML = `
    <h4 style="font-size:13px; color:#e65100; margin:14px 0 8px 0;">🔔 రైతుల నుండి వచ్చిన రిక్వెస్ట్‌లు (${bookings.length}):</h4>
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${bookings.map(b => `
        <div style="background:#fff; border:1.5px solid ${b.status === 'ACCEPTED' ? '#2e7d32' : '#f57c00'}; border-radius:10px; padding:12px; box-shadow:0 2px 6px rgba(0,0,0,0.06);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:11px; background:${b.type === 'SPOT' ? '#ffebee' : '#fff8e1'}; color:${b.type === 'SPOT' ? '#c62828' : '#b78103'}; padding:3px 8px; border-radius:12px; font-weight:bold;">
              ${b.type === 'SPOT' ? '⚡ SPOT (వెంటనే కావాలి)' : '📅 ADVANCE బుకింగ్'}
            </span>
            <span style="font-size:11px; color:#777;">${b.createdAt}</span>
          </div>

          <div style="font-size:14px; font-weight:bold; color:#222;">${b.vehicleType}</div>
          <div style="font-size:12px; color:#444; margin:3px 0;">పని: <b>${b.workSize}</b> &nbsp;|&nbsp; సమయం: <b>${b.schedule}</b></div>
          <div style="font-size:12px; color:#555;">రైతు: <b>${b.farmerName}</b>, గ్రామం: <b>${b.village}</b></div>

          <div style="display:flex; gap:6px; margin-top:10px; flex-wrap:wrap;">
            <a href="tel:${b.farmerPhone}" style="flex:1; text-align:center; background:#2e7d32; color:#fff; text-decoration:none; padding:8px 6px; border-radius:6px; font-size:12px; font-weight:bold;">📞 రైతుకు కాల్</a>
            
            ${b.mapLink ? `
              <a href="${b.mapLink}" target="_blank" style="flex:1; text-align:center; background:#1976d2; color:#fff; text-decoration:none; padding:8px 6px; border-radius:6px; font-size:12px; font-weight:bold;">🗺️ పొలం మ్యాప్ రూట్</a>
            ` : ''}

            ${b.status !== 'ACCEPTED' ? `
              <button onclick="acceptBookingOrder('${b.id}')" style="flex:1; background:#f57c00; color:#fff; border:none; padding:8px 6px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">
                ✅ ఒప్పుకోండి (Accept)
              </button>
            ` : `
              <span style="flex:1; text-align:center; background:#e8f5e9; color:#2e7d32; padding:8px 6px; border-radius:6px; font-size:12px; font-weight:bold;">ఆర్డర్ స్వీకరించబడింది</span>
            `}
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

window.acceptBookingOrder = function(bookingId) {
  let bookings = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');
  const state = window.AppState;
  const user = state ? (state.userProfile || state.user) : null;
  const providerName = (user && user.name) || 'యజమాని';
  const providerPhone = (user && user.phone) || '';

  const index = bookings.findIndex(b => b.id === bookingId);
  if (index !== -1) {
    bookings[index].status = 'ACCEPTED';
    bookings[index].acceptedBy = `${providerName} (${providerPhone})`;
    localStorage.setItem('agri_active_bookings', JSON.stringify(bookings));

    const b = bookings[index];
    const confirmMsg = `✅ *ఆర్డర్ కన్ఫర్మ్ చేయబడింది (AgriConnect):*\n` +
      `నమస్తే ${b.farmerName} గారు, మీ ${b.vehicleType} బుకింగ్ ను యజమాని *${providerName}* స్వీకరించారు.\n` +
      `📞 యజమాని ఫోన్: ${providerPhone}\n` +
      `మీ లొకేషన్ ఆధారంగా బయలుదేరుతున్నాము.`;

    const waFarmer = `https://wa.me/91${b.farmerPhone}?text=${encodeURIComponent(confirmMsg)}`;
    window.open(waFarmer, '_blank');

    renderIncomingBookingsForProvider('provider-incoming-requests');
  }
};

// ===================================================
// Sync Provider Items into Farmer Dashboard & Live Requests (With Scroll & Font Fix)
// ===================================================
window.renderFarmerWidgetWithLiveProviders = function() {
  const farmerContainer = document.getElementById("farmer-post-container") || document.getElementById("farmer-container") || document.getElementById("farmer-dashboard");
  if (!farmerContainer) return;

  // 1. Quick Request Banner
  let reqBanner = document.getElementById("farmer-quick-req-banner");
  if (!reqBanner) {
    reqBanner = document.createElement("div");
    reqBanner.id = "farmer-quick-req-banner";
    reqBanner.style.cssText = "background: linear-gradient(135deg, #2e7d32, #1b5e20); color: #fff; padding: 14px; border-radius: 12px; margin: 10px 0 16px 0; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15);";
    reqBanner.innerHTML = `
      <div style="font-size:15px; font-weight:bold; margin-bottom:4px;">🚜 అత్యవసరంగా వాహనం / యంత్రం కావాలా?</div>
      <div style="font-size:12px; opacity:0.9; margin-bottom:10px;">స్పాట్ లో లేదా అడ్వాన్స్ గా బుక్ చేసుకోండి (లైవ్ GPS నావిగేషన్)</div>
      <button onclick="openFarmerVehicleBookingModal()" style="background:#fff; color:#1b5e20; border:none; padding:9px 18px; border-radius:20px; font-size:13px; font-weight:bold; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
        ⚡ వాహనం కోసం రిక్వెస్ట్ పెట్టండి ➔
      </button>
    `;
    if (farmerContainer.firstChild) {
      farmerContainer.insertBefore(reqBanner, farmerContainer.firstChild);
    } else {
      farmerContainer.appendChild(reqBanner);
    }
  }

  // 2. Real Items List from localStorage (Scrollable Box)
  const savedItems = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
  let liveList = document.getElementById("farmer-live-provider-items");
  if (!liveList) {
    liveList = document.createElement("div");
    liveList.id = "farmer-live-provider-items";
    // Fixed height + Scrolling add chesam
    liveList.style.cssText = "margin-top: 14px; max-height: 380px; overflow-y: auto; padding-right: 4px;";
    farmerContainer.appendChild(liveList);
  } else {
    liveList.style.maxHeight = "380px";
    liveList.style.overflowY = "auto";
    liveList.style.paddingRight = "4px";
  }

  if (savedItems.length === 0) {
    liveList.innerHTML = '<div style="background:#fff; padding:12px; border-radius:10px; border:1px dashed #ccc; text-align:center; font-size:12px; color:#777;">యజమానులు ఇంకా కొత్త వాహనాలు జోడించలేదు.</div>';
    return;
  }

  let itemsHtml = '';
  for (let i = 0; i < savedItems.length; i++) {
    const item = savedItems[i];
    const pName = item.providerName || item.ownerName || 'యజమాని';
    const vName = (item.village || item.location) ? `(గ్రామం: ${item.village || item.location})` : '';
    const phone = item.providerPhone || item.phone || '';

    itemsHtml += `
      <div style="background:#ffffff; border:1.5px solid #a5d6a7; border-radius:12px; padding:12px; margin-bottom:10px; box-shadow:0 2px 6px rgba(0,0,0,0.06);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:15px; font-weight:bold; color:#1b5e20;">${item.name}</div>
            <div style="font-size:12px; color:#555; margin-top:2px;">ధర / అద్దె: <b style="color:#e65100; font-size:13px;">₹${item.rate}</b> &nbsp;|&nbsp; ${item.extra || 'అందుబాటులో ఉంది'}</div>
            <div style="font-size:11px; color:#666; margin-top:4px;">యజమాని: <b>${pName}</b> ${vName}</div>
          </div>
          <span style="font-size:11px; background:#e8f5e9; color:#2e7d32; padding:3px 8px; border-radius:12px; font-weight:bold;">లభ్యం</span>
        </div>
        <div style="display:flex; gap:8px; margin-top:10px;">
          ${phone ? `
            <a href="tel:${phone}" style="flex:1; text-align:center; background:#2e7d32; color:#fff; text-decoration:none; padding:8px 0; border-radius:6px; font-size:12px; font-weight:bold;">📞 కాల్</a>
            <a href="https://wa.me/91${phone}" target="_blank" style="flex:1; text-align:center; background:#25d366; color:#fff; text-decoration:none; padding:8px 0; border-radius:6px; font-size:12px; font-weight:bold;">వాట్సాప్</a>
          ` : `
            <button onclick="openFarmerVehicleBookingModal()" style="flex:1; background:#2e7d32; color:#fff; border:none; padding:8px 0; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">బుక్ చేసుకోండి</button>
          `}
        </div>
      </div>
    `;
  }

  liveList.innerHTML = `
    <h4 style="font-size:14px; color:#2e7d32; margin:12px 0 8px 0;">🤝 యజమానులు జోడించిన లైవ్ సేవలు (${savedItems.length}):</h4>
    <div style="display:flex; flex-direction:column;">
      ${itemsHtml}
    </div>
  `;
};

// ===================================================
// Initialization
// ===================================================
document.addEventListener("DOMContentLoaded", function() {
  if (typeof applyUserRoleView === "function") {
    applyUserRoleView();
  }
});

if (typeof applyUserRoleView === "function") {
  applyUserRoleView();
}
