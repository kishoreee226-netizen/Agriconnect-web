// role.js - AgriConnect Smart Role Cards, Module Bridge & Profile Dashboard Controller

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
        <div class="agri-landing-card farmer-border">
          <div class="agri-card-header">
            <span class="agri-icon">🌾</span>
            <strong class="agri-title-farmer">రైతు సోదరుల కోసం (Farmer)</strong>
          </div>
          <ul class="agri-card-desc-list">
            <li>మీ పొలం పనులకు కూలీలను వెంటనే బుక్ చేసుకోండి.</li>
            <li>ఉచిత జాబ్ పోస్టింగ్ & మార్కెట్ లైవ్ ధరల సమాచారం.</li>
            <li>స్మార్ట్ ఆటో-స్విచ్: సొంత పని లేనప్పుడు కూలీ మోడ్‌కి మారే సదుపాయం.</li>
          </ul>
          <button onclick="openLoginModal('FARMER')" class="agri-landing-btn farmer-btn-bg">
            రైతుగా Login / నమోదు అవ్వండి ➔
          </button>
        </div>
      `;
    }

    // 2. Kooli Login Card
    if (labourContainer) {
      labourContainer.style.setProperty('display', 'block', 'important');
      labourContainer.innerHTML = `
        <div class="agri-landing-card labour-border">
          <div class="agri-card-header">
            <span class="agri-icon">👷</span>
            <strong class="agri-title-labour">కూలీల కోసం (Labour)</strong>
          </div>
          <ul class="agri-card-desc-list">
            <li>మీ గ్రామం మరియు 5-10 కి.మీ పరిధిలోని రోజువారీ పనులను వెతుక్కోండి.</li>
            <li>రోజువారీ కూలీ వివరాలు, డైరెక్ట్ ఫోన్ / వాట్సాప్ కాలింగ్.</li>
            <li>మీ వేతనాల లెక్కల కోసం సులభమైన వ్యక్తిగత వాలెట్.</li>
          </ul>
          <button onclick="openLoginModal('LABOUR')" class="agri-landing-btn labour-btn-bg">
            కూలీగా Login / నమోదు అవ్వండి ➔
          </button>
        </div>
      `;
    }

    // 3. Yajamanula Seva Kendram Card
    if (providerContainer) {
      providerContainer.style.setProperty('display', 'block', 'important');
      providerContainer.innerHTML = `
        <div class="agri-landing-card provider-border">
          <div class="agri-card-header">
            <span class="agri-icon">🤝</span>
            <strong class="agri-title-provider">పరికరాలు, రవాణా & విత్తనాల యజమానుల సేవా కేంద్రం</strong>
          </div>
          <p class="agri-card-subtext">
            ట్రాక్టర్లు, హార్వెస్టర్లు, రవాణా వాహనాలు లేదా విత్తనాలు/ఎరువుల యజమానులు తమ సేవలను అద్దెకు/అమ్ముకానికి ఇక్కడ సులభంగా జోడించవచ్చు.
          </p>
          <ul class="agri-card-desc-list">
            <li>రైతుల నుండి నేరుగా బుకింగ్‌లు & ఆర్డర్‌లు పొందండి.</li>
            <li>మీ పరికరాలు, రవాణా రేట్లు మీరే నిర్ణయించుకోండి.</li>
            <li>కమిషన్ లేకుండా నేరుగా కస్టమర్‌తో ఫోన్ / వాట్సాప్ సంప్రదింపులు.</li>
          </ul>
          <button onclick="openLoginModal('PROVIDER')" class="agri-landing-btn provider-btn-bg">
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
  if (state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY" || state.userType === "LABOUR") {
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

      if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
      if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');
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

  if (state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY" || state.userType === "LABOUR" || state.currentRole === "LABOUR") {
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

  banner.className = 'user-profile-banner';
  banner.style.setProperty('--badge-color', badgeColor);

  banner.innerHTML = `
    <div>
      <div class="profile-banner-name">
        👤 ${user.name}
        <span class="profile-banner-badge">${roleText}</span>
      </div>
      <div class="profile-banner-details">
        📞 ${user.phone} &nbsp;|&nbsp; 📍 <b>${user.village}</b>
      </div>
    </div>
    <button onclick="logoutUser()" class="profile-banner-logout-btn">Logout</button>
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
    switchContainer.className = "role-switch-container";

    const userBanner = document.getElementById('user-profile-banner');
    if (userBanner && userBanner.parentNode) {
      userBanner.parentNode.insertBefore(switchContainer, userBanner.nextSibling);
    } else {
      document.body.prepend(switchContainer);
    }
  }

  const isFarmerRole = (state.currentRole !== 'LABOUR');

  switchContainer.innerHTML = `
    <button type="button" onclick="switchRoleMode('FARMER')" class="role-switch-btn role-switch-farmer ${isFarmerRole ? 'active' : ''}">
      🌾 Farmer mode (రైతు)
    </button>
    <button type="button" onclick="switchRoleMode('LABOUR')" class="role-switch-btn role-switch-labour ${!isFarmerRole ? 'active' : ''}">
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
    if (mandiContainer) mandiContainer.style.setProperty("display", "none", "important");
    if (weatherContainer) weatherContainer.style.setProperty("display", "none", "important");

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
  if (window.AuthModule && typeof window.AuthModule.close === 'function') {
    window.AuthModule.close();
  }
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
    nameInput.classList.add('input-autofilled');
  }

  if (phoneInput && !phoneInput.value) {
    phoneInput.value = profile.phone;
    phoneInput.classList.add('input-autofilled');
  }

  if (villageBtn && profile.village) {
    villageBtn.textContent = "🏛️ " + profile.village;
  }
}

// ===================================================
// Filter Jobs by Location & Unified Auth Bridge
// ===================================================
function filterLabourJobsByLocation() {
  const profile = window.AppState?.userProfile;
  if (!profile || !profile.village) return;

  const jobCards = document.querySelectorAll(".job-card, .job-item, [data-village]");
  jobCards.forEach(card => {
    const jobVillage = card.getAttribute("data-village") || card.textContent;
    if (jobVillage.toLowerCase().includes(profile.village.toLowerCase())) {
      card.classList.add("job-card-highlight");
    }
  });
}

// Dedicated AuthModule కి బ్రిడ్జ్ (పాత మోడల్ డ్రాప్‌లు తొలగించబడ్డాయి)
window.openLoginModal = function(roleType) {
  let normalizedRole = 'FARMER';
  if (roleType === 'LABOUR_ONLY' || roleType === 'LABOUR') normalizedRole = 'LABOUR';
  if (roleType === 'PROVIDER') normalizedRole = 'PROVIDER';

  if (window.AuthModule && typeof window.AuthModule.open === 'function') {
    window.AuthModule.open({ role: normalizedRole });
  } else {
    console.warn("AuthModule is loading or not initialized yet.");
  }
};

window.closeLoginModal = function() {
  if (window.AuthModule && typeof window.AuthModule.close === 'function') {
    window.AuthModule.close();
  }
};

// ===================================================
// Provider Dashboard View & Controller
// ===================================================
let selectedProviderType = 'equipment';

window.openProviderModal = function() {
  window.openLoginModal('PROVIDER');
};

function renderProviderDashboardView(container, type) {
  const titles = {
    equipment: { name: '🚜 పరికరాల నిర్వహణ డ్యాష్‌బోర్డ్', color: '#f57c00', desc: 'మీ ట్రాక్టర్లు, హార్వెస్టర్లు మొదలైన పరికరాలను జోడించండి' },
    transport: { name: '🚚 రవాణా వాహనాల డ్యాష్‌బోర్డ్', color: '#7b1fa2', desc: 'మీ రవాణా వాహనాలు, ట్రాలీలు, ఆటోలను అద్దెకు చేర్చండి' },
    seeds: { name: '🌱 విత్తనాలు & ఎరువుల డీలర్ డ్యాష్‌బోర్డ్', color: '#2e7d32', desc: 'మీ వద్ద ఉన్న స్టాక్ మరియు ధరల వివరాలను నమోదు చేయండి' }
  };
  const current = titles[type] || titles.equipment;

  container.innerHTML = `
    <div class="provider-dashboard-card" style="--provider-theme: ${current.color};">
      <h3 class="provider-dash-title">${current.name}</h3>
      <p class="provider-dash-desc">${current.desc}</p>
      
      <div onclick="openAddServiceModal('${type}')" class="provider-add-service-btn">
        <span class="provider-add-service-text">➕ కొత్త వస్తువును / సేవను జోడించండి</span>
        <p class="provider-add-service-subtext">వివరాలు నమోదు చేయడానికి ఇక్కడ నొక్కండి</p>
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
        <div class="provider-form-group">
          <label class="provider-form-label">పరికరం రకం / మోడల్:</label>
          <input type="text" id="item-field-1" placeholder="ఉదా: మహీంద్రా 575 ట్రాక్టర్ / రోటవేటర్" required class="provider-form-input" />
        </div>
        <div class="provider-form-group">
          <label class="provider-form-label">అద్దె ధర (గంటకు ₹):</label>
          <input type="number" id="item-field-2" placeholder="ఉదా: 900" required class="provider-form-input" />
        </div>
        <div class="provider-form-group last">
          <label class="provider-form-label">పని స్థితి (Availability):</label>
          <select id="item-field-3" class="provider-form-input">
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
        <div class="provider-form-group">
          <label class="provider-form-label">వాహనం రకం:</label>
          <input type="text" id="item-field-1" placeholder="ఉదా: బొలెరో పికప్ / 407 DCM / ట్రాక్టర్ ట్రాలీ" required class="provider-form-input" />
        </div>
        <div class="provider-form-group">
          <label class="provider-form-label">ఛార్జీ (కి.మీ / ట్రిప్ ₹):</label>
          <input type="text" id="item-field-2" placeholder="ఉదా: ₹35 / కి.మీ లేదా ₹1200 / ట్రిప్" required class="provider-form-input" />
        </div>
        <div class="provider-form-group last">
          <label class="provider-form-label">మోసే బరువు సామర్థ్యం:</label>
          <input type="text" id="item-field-3" placeholder="ఉదా: 2 టన్నులు / 50 బస్తాలు" required class="provider-form-input" />
        </div>
      `
    },
    seeds: {
      title: '🌱 విత్తనాలు / ఎరువుల వివరాలు జోడించండి',
      color: '#2e7d32',
      fields: `
        <div class="provider-form-group">
          <label class="provider-form-label">పంట రకం & బ్రాండ్:</label>
          <input type="text" id="item-field-1" placeholder="ఉదా: వరి BPT 5204 / కాటన్ సీడ్స్" required class="provider-form-input" />
        </div>
        <div class="provider-form-group">
          <label class="provider-form-label">ధర (బ్యాగ్ / ప్యాకెట్ ₹):</label>
          <input type="number" id="item-field-2" placeholder="ఉదా: 850" required class="provider-form-input" />
        </div>
        <div class="provider-form-group last">
          <label class="provider-form-label">స్టాక్ లభ్యత:</label>
          <input type="text" id="item-field-3" placeholder="ఉదా: 100 బ్యాగులు అందుబాటులో ఉన్నాయి" required class="provider-form-input" />
        </div>
      `
    }
  };

  const conf = configs[type] || configs.equipment;

  modal = document.createElement('div');
  modal.id = 'provider-item-modal';
  modal.className = 'pitem-modal-overlay';
  modal.style.setProperty('--pitem-color', conf.color);

  modal.innerHTML = `
    <div class="pitem-modal-card">
      <button onclick="closeAddServiceModal()" class="provider-close-btn">✕</button>
      
      <h3 class="pitem-modal-title">${conf.title}</h3>

      <form onsubmit="handleSaveProviderItem(event, '${type}')">
        ${conf.fields}
        <button type="submit" class="pitem-submit-btn">
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

window.handleSaveProviderItem = async function(e, type) {
  e.preventDefault();
  const val1 = document.getElementById('item-field-1').value.trim();
  const val2 = document.getElementById('item-field-2').value.trim();
  const val3 = document.getElementById('item-field-3').value.trim();

  if (!val1 || !val2 || !val3) {
    alert("దయచేసి అన్ని వివరాలు నమోదు చేయండి.");
    return;
  }

  const profile = window.AppState?.userProfile || 
                  JSON.parse(localStorage.getItem('agri_user_profile')) || 
                  JSON.parse(localStorage.getItem('agri_profile')) || {};

  const ownerName = profile.name || profile.ownerName || profile.userName || 'యజమాని';
  const ownerPhone = profile.phone || profile.mobile || '';
  const ownerVillage = profile.village || '';

  if (!ownerPhone) {
    alert("దయచేసి ముందుగా సరైన మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి.");
    return;
  }

  const newItem = {
    name: val1,
    rate: '₹' + val2 + ' / గంట',
    rawRate: val2,
    type: type || 'equipment',
    category: type || 'equipment',
    status: val3,
    owner: ownerName,
    phone: ownerPhone,
    village: ownerVillage,
    loc: ownerVillage ? `${ownerVillage} పరిధి` : 'స్థానిక పరిధి',
    createdAt: new Date().toISOString()
  };

  if (window.AgriDB) {
    try {
      await window.AgriDB.addProviderItem(newItem);
      alert("🎉 " + val1 + " విజయవంతంగా లైవ్ డేటాబేస్‌లో చేర్చబడింది!");
    } catch (error) {
      console.error("Save error:", error);
      alert("డేటాబేస్ లోపం: " + error.message);
    }
  }

  let items = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
  items.unshift(newItem);
  localStorage.setItem('agri_provider_items', JSON.stringify(items));

  closeAddServiceModal();
  renderProviderItemsList(type);
};

window.renderProviderItemsList = async function(type) {
  const container = document.getElementById('provider-items-list');
  if (!container) return;

  const profile = window.AppState?.userProfile || JSON.parse(localStorage.getItem('agri_user_profile')) || {};
  const currentUserPhone = String(profile.phone || '').trim();
  const currentType = type || profile.providerType || 'equipment';

  container.innerHTML = `<p class="pitem-loading-text">వివరాలు లోడ్ అవుతున్నాయి...</p>`;

  try {
    let items = [];

    if (typeof db !== 'undefined' && db.collection && currentUserPhone) {
      const snapshot = await db.collection("provider_items")
        .where("phone", "==", currentUserPhone)
        .get();

      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
    }

    if (items.length === 0) {
      const local = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
      items = local.filter(it => !currentUserPhone || it.phone === currentUserPhone);
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="pitem-empty-card">
          ఈ నంబర్ (${currentUserPhone || 'ప్రొఫైల్'}) పై ఇంకా ఏ వస్తువులు లేదా సేవలు జోడించలేదు.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="pitem-box">
        <div class="pitem-header">
          <div class="pitem-title-text">
            🚜 మీరు జోడించిన వస్తువులు <span class="pitem-count-badge">${items.length}</span>
          </div>
          <span class="pitem-live-badge">
            <span class="pitem-live-dot"></span> LIVE
          </span>
        </div>

        <div class="pitem-scroll-list">
          ${items.map(item => `
            <div class="pitem-card-row">
              <div>
                <div class="pitem-card-title">${item.name || item.title || 'పేరు లేదు'}</div>
                <div class="pitem-card-details">
                  ధర / అద్దె: <b class="pitem-price-text">${item.rate || item.price || 'N/A'}</b> | <span class="pitem-status-text">${item.extra || item.status || 'అందుబాటులో ఉంది'}</span>
                </div>
              </div>
              <button onclick="deleteProviderItem('${item.id}', '${currentType}')" class="pitem-delete-btn">
                తీసివేయి
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

  } catch (err) {
    console.error("Firestore Error:", err);
    container.innerHTML = `<p class="pitem-error-text">డేటా లోడ్ చేయడంలో సమస్య వచ్చింది.</p>`;
  }
};

window.deleteProviderItem = async function(id, type) {
  if (!id) return;

  const confirmDelete = confirm("ఈ పరికరాన్ని / సేవను ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?");
  if (!confirmDelete) return;

  try {
    if (typeof db !== 'undefined' && db.collection) {
      await db.collection("provider_items").doc(id).delete();
    }

    try {
      let localItems = JSON.parse(localStorage.getItem('agri_provider_items')) || [];
      localItems = localItems.filter(item => item.id !== id);
      localStorage.setItem('agri_provider_items', JSON.stringify(localItems));
    } catch (e) {
      console.warn("LocalStorage delete error:", e);
    }

    alert("విజయవంతంగా తొలగించబడింది!");

    if (typeof window.renderProviderItemsList === 'function') {
      window.renderProviderItemsList(type);
    }

  } catch (error) {
    console.error("Delete error:", error);
    alert("తొలగించడంలో లోపం వచ్చింది: " + error.message);
  }
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
  modal.className = 'booking-modal-overlay';

  modal.innerHTML = `
    <div class="booking-modal-card">
      <button onclick="closeFarmerBookingModal()" class="booking-close-btn">✕</button>
      
      <div class="booking-modal-header">
        <h3 class="booking-modal-title">🚜 వాహనం / యంత్రం బుకింగ్</h3>
        <p class="booking-modal-subtitle">మీ పొలం వద్దకే నేరుగా వాహనాన్ని రప్పించుకోండి</p>
      </div>

      <div class="booking-mode-toggle">
        <button id="btn-mode-spot" type="button" onclick="setBookingMode('SPOT')" class="booking-mode-btn active">
          ⚡ వెంటనే కావాలి (Spot)
        </button>
        <button id="btn-mode-adv" type="button" onclick="setBookingMode('ADVANCE')" class="booking-mode-btn">
          📅 అడ్వాన్స్ బుకింగ్ (Advance)
        </button>
      </div>

      <div id="gps-status-box" class="gps-status-box">
        <span>📍 లైవ్ లొకేషన్: <b id="gps-text">గుర్తిస్తోంది...</b></span>
        <button type="button" onclick="fetchRhythuLiveGPS()" class="gps-refresh-btn">రీఫ్రెష్</button>
      </div>

      <form onsubmit="handleConfirmBookingRequest(event)">
        <div class="provider-form-group">
          <label class="provider-form-label">వాహనం / పరికరం ఎంచుకోండి:</label>
          <select id="book-veh-type" required class="provider-form-input">
            <option value="ట్రాక్టర్ (దుక్కి / రోటవేటర్)">ట్రాక్టర్ (దుక్కి / రోటవేటర్ / కల్టివేటర్)</option>
            <option value="హార్వెస్టర్ (వరి / మొక్కజొన్న కోత)">హార్వెస్టర్ (వరి / మొక్కజొన్న కోత మిషన్)</option>
            <option value="బొలెరో / DCM రవాణా వాహనం">బొలెరో / DCM రవాణా వాహనం</option>
            <option value="ట్రాక్టర్ ట్రాలీ (ధాన్యం రవాణా)">ట్రాక్టర్ ట్రాలీ (ధాన్యం రవాణా)</option>
            <option value="ఆటో ట్రాలీ (చిన్న లోడ్లు)">ఆటో ట్రాలీ (చిన్న లోడ్లు)</option>
            <option value="డ్రోన్ స్ప్రేయర్ (పురుగు మందుల పిచికారీ)">డ్రోన్ స్ప్రేయర్ (పురుగు మందుల పిచికారీ)</option>
          </select>
        </div>

        <div class="provider-form-group">
          <label class="provider-form-label">పని పరిమాణం (ఎకరాలు / ట్రిప్పులు / బస్తాలు):</label>
          <input type="text" id="book-work-size" placeholder="ఉదా: 2 ఎకరాలు దుక్కి లేదా 50 బస్తాల లోడ్" required class="provider-form-input" />
        </div>

        <div id="advance-fields-container" class="advance-fields-box">
          <div class="advance-field-group">
            <label class="advance-label">ఏ రోజున కావాలి (తేదీ):</label>
            <input type="date" id="book-date" class="advance-input" />
          </div>
          <div class="advance-field-group last">
            <label class="advance-label">సమయం (Time):</label>
            <input type="time" id="book-time" class="advance-input" />
          </div>
        </div>

        <button id="book-submit-btn" type="submit" class="booking-submit-btn">
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
    if (spotBtn) spotBtn.classList.add('active');
    if (advBtn) advBtn.classList.remove('active');
    if (advFields) advFields.style.display = 'none';
    if (submitBtn) submitBtn.innerHTML = '⚡ వెంటనే దగ్గరలోని వాహనాలకు రిక్వెస్ట్ పంపండి ➔';
  } else {
    if (advBtn) advBtn.classList.add('active');
    if (spotBtn) spotBtn.classList.remove('active');
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

  if (!farmerPhone) {
    alert("దయచేసి మీ మొబైల్ నంబర్‌తో ముందుగా లాగిన్ అవ్వండి.");
    return;
  }

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

// ===================================================
// Provider Incoming Bookings with Phone Isolation & Cloud Sync
// ===================================================
window.renderIncomingBookingsForProvider = function(containerId) {
  const box = document.getElementById(containerId);
  if (!box) return;

  const currentProviderPhone = (typeof window.getActiveUserPhone === 'function')
    ? window.getActiveUserPhone()
    : (window.AppState?.userProfile?.phone || "");

  function renderUI(rawBookings) {
    const bookings = (rawBookings || []).filter(b => {
      const bPhone = String(b.providerPhone || b.targetPhone || b.ownerPhone || "").trim();
      return !bPhone || (currentProviderPhone && bPhone === currentProviderPhone);
    });

    if (bookings.length === 0) {
      box.innerHTML = `<p class="pitem-loading-text">ప్రస్తుతం కొత్త ఆర్డర్‌లు లేవు.</p>`;
      return;
    }

    box.innerHTML = `
      <div class="porders-box">
          <div class="porders-header">
              <div class="porders-title">
                  🔔 రైతుల నుండి వచ్చిన రిక్వెస్ట్‌లు <span class="porders-count-badge">${bookings.length}</span>
              </div>
              <span class="porders-live-badge">
                  <span class="porders-live-dot"></span> LIVE
              </span>
          </div>

          <div class="porders-scroll-list">
              ${bookings.map(b => `
                  <div class="porders-card ${b.status === 'ACCEPTED' ? 'accepted' : ''}">
                      <div class="porders-card-top">
                          <span class="porders-type-tag ${b.type === 'SPOT' ? 'spot' : 'advance'}">
                              ${b.type === 'SPOT' ? '⚡ SPOT (వెంటనే కావాలి)' : '📅 ADVANCE బుకింగ్'}
                          </span>
                          <span class="porders-time-text">
                              ${b.createdAt || ''}
                          </span>
                      </div>

                      <div class="porders-veh-name">
                          ${b.vehicleType || b.itemName || ''}
                      </div>

                      <div class="porders-work-details">
                          <div>పని: <b>${b.workSize || ''}</b> &nbsp;|&nbsp; సమయం: <b>${b.schedule || ''}</b></div>
                          <div>రైతు: <b>${b.farmerName || ''}</b>, గ్రామం: <b>${b.village || ''}</b></div>
                      </div>

                      <div class="porders-btn-row">
                          <a href="tel:${b.farmerPhone || ''}" class="porders-action-btn porders-call-btn">
                              📞 రైతుకు కాల్
                          </a>

                          ${b.mapLink ? `
                              <a href="${b.mapLink}" target="_blank" class="porders-action-btn porders-map-btn">
                                  🗺️ పొలం మ్యాప్ రూట్
                              </a>
                          ` : ''}

                          ${b.status !== 'ACCEPTED' ? `
                              <button onclick="acceptBookingOrder('${b.id}')" class="porders-action-btn porders-accept-btn">
                                  ✅ ఒప్పుకోండి (Accept)
                              </button>
                          ` : `
                              <span class="porders-accepted-badge">
                                  ఆర్డర్ స్వీకరించబడింది
                              </span>
                          `}
                      </div>
                  </div>
              `).join('')}
          </div>
      </div>
    `;
  }

  if (window.AgriDB && typeof window.AgriDB.listenToBookings === 'function') {
    window.AgriDB.listenToBookings((liveBookings) => {
      renderUI(liveBookings);
    });
  } else {
    const localBookings = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');
    renderUI(localBookings);
  }
};

window.acceptBookingOrder = async function(bookingId) {
  if (!bookingId) return;

  const state = window.AppState;
  const user = state ? (state.userProfile || state.user) : null;
  const providerName = (user && user.name) || 'యజమాని';
  const providerPhone = (user && user.phone) || (typeof window.getActiveUserPhone === 'function' ? window.getActiveUserPhone() : '');

  try {
    if (typeof db !== 'undefined' && db.collection) {
      await db.collection("bookings").doc(bookingId).update({
        status: 'ACCEPTED',
        acceptedBy: `${providerName} (${providerPhone})`,
        acceptedAt: new Date().toISOString()
      });
    }

    let bookings = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      bookings[index].status = 'ACCEPTED';
      bookings[index].acceptedBy = `${providerName} (${providerPhone})`;
      localStorage.setItem('agri_active_bookings', JSON.stringify(bookings));
    }

    alert("ఆర్డర్ విజయవంతంగా స్వీకరించబడింది (Confirmed)!");

    if (typeof renderIncomingBookingsForProvider === 'function') {
      renderIncomingBookingsForProvider('provider-incoming-requests');
    }

  } catch (error) {
    console.error("Booking Accept Error:", error);
    alert("ఆర్డర్ స్వీకరించడంలో సమస్య వచ్చింది: " + error.message);
  }
};

// ===================================================
// Sync Provider Items into Farmer Dashboard & Live Requests
// ===================================================
window.renderFarmerWidgetWithLiveProviders = function() {
  const farmerContainer = document.getElementById("farmer-post-container") || document.getElementById("farmer-container") || document.getElementById("farmer-dashboard");
  if (!farmerContainer) return;

  let reqBanner = document.getElementById("farmer-quick-req-banner");
  if (!reqBanner) {
    reqBanner = document.createElement("div");
    reqBanner.id = "farmer-quick-req-banner";
    reqBanner.className = "farmer-quick-req-banner";
    reqBanner.innerHTML = `
      <div class="quick-banner-title">🚜 అత్యవసరంగా వాహనం / యంత్రం కావాలా?</div>
      <div class="quick-banner-subtitle">స్పాట్ లో లేదా అడ్వాన్స్ గా బుక్ చేసుకోండి (లైవ్ GPS నావిగేషన్)</div>
      <button onclick="openFarmerVehicleBookingModal()" class="quick-banner-btn">
        ⚡ వాహనం కోసం రిక్వెస్ట్ పెట్టండి ➔
      </button>
    `;
    if (farmerContainer.firstChild) {
      farmerContainer.insertBefore(reqBanner, farmerContainer.firstChild);
    } else {
      farmerContainer.appendChild(reqBanner);
    }
  }

  const savedItems = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
  let liveList = document.getElementById("farmer-live-provider-items");
  if (!liveList) {
    liveList = document.createElement("div");
    liveList.id = "farmer-live-provider-items";
    liveList.className = "farmer-live-items-container";
    farmerContainer.appendChild(liveList);
  }

  if (savedItems.length === 0) {
    liveList.innerHTML = '<div class="farmer-live-empty-card">యజమానులు ఇంకా కొత్త వాహనాలు జోడించలేదు.</div>';
    return;
  }

  let itemsHtml = '';
  for (let i = 0; i < savedItems.length; i++) {
    const item = savedItems[i];
    const pName = item.providerName || item.ownerName || 'యజమాని';
    const vName = (item.village || item.location) ? `(గ్రామం: ${item.village || item.location})` : '';
    const phone = item.providerPhone || item.phone || '';

    itemsHtml += `
      <div class="farmer-provider-card">
        <div class="fprov-card-top">
          <div>
            <div class="fprov-item-name">${item.name}</div>
            <div class="fprov-item-rate-text">ధర / అద్దె: <b class="fprov-item-rate-highlight">₹${item.rate}</b> &nbsp;|&nbsp; ${item.extra || 'అందుబాటులో ఉంది'}</div>
            <div class="fprov-owner-info">యజమాని: <b>${pName}</b> ${vName}</div>
          </div>
          <span class="fprov-available-badge">లభ్యం</span>
        </div>
        <div class="fprov-btn-row">
          ${phone ? `
            <a href="tel:${phone}" class="fprov-btn fprov-call-btn">📞 కాల్</a>
            <a href="https://wa.me/91${phone}" target="_blank" class="fprov-btn fprov-whatsapp-btn">వాట్సాప్</a>
          ` : `
            <button onclick="openFarmerVehicleBookingModal()" class="fprov-btn fprov-call-btn">బుక్ చేసుకోండి</button>
          `}
        </div>
      </div>
    `;
  }

  liveList.innerHTML = `
    <h4 class="farmer-live-heading">🤝 యజమానులు జోడించిన లైవ్ సేవలు (${savedItems.length}):</h4>
    <div class="farmer-live-scroll-box">
      ${itemsHtml}
    </div>
  `;
};

// ===================================================
// Initialization & Auto Session Restore on Refresh
// ===================================================
document.addEventListener("DOMContentLoaded", function() {
  const savedData = localStorage.getItem("agri_user_profile");
  if (savedData) {
    try {
      const user = JSON.parse(savedData);
      if (user && user.phone) {
        if (!window.AppState) window.AppState = {};
        window.AppState.isLoggedIn = true;
        window.AppState.userProfile = user;
        window.AppState.userType = user.userType || user.roleType || "PROVIDER";
        window.AppState.providerType = user.providerType || "equipment";
        window.AppState.currentRole = (window.AppState.userType === "LABOUR_ONLY" || window.AppState.userType === "LABOUR") ? "LABOUR" : "FARMER";
      }
    } catch (e) {
      console.error("Session restore error:", e);
    }
  }

  if (typeof applyUserRoleView === "function") {
    applyUserRoleView();
  }
});
