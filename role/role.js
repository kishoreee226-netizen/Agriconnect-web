// role/role.js - AgriConnect Pure State, Modals & View Orchestrator

window.RoleController = {
  getFarmerContainer: function() {
    return document.getElementById("farmer-post-container");
  },

  getLabourContainer: function() {
    return document.getElementById("labour-jobs-container");
  },

  getProviderContainer: function() {
    return document.getElementById("provider-hub-container") || document.getElementById("provider-container");
  },

  getToolsAndUtilityElements: function() {
    // SMART Tools & Utilities సెక్షన్లను గుర్తించడం
    return document.querySelectorAll(
      ".tools-section, .utilities-section, #tools-container, #utilities-container, " +
      "[class*='power-tools'], [class*='smart-utilities'], " +
      ".container > div:has(h4:contains('SMART')), .container > div:has(span:contains('SMART'))"
    );
  },

  setToolsVisibility: function(show) {
    // టూల్స్ హెడ్డింగ్‌లు మరియు వాటి క్రింది గ్రిడ్ బాక్సులను కంట్రోల్ చేయడం
    const allDivs = document.querySelectorAll("body > div, .container > div, main > div");
    allDivs.forEach(el => {
      const txt = el.textContent || "";
      if (txt.includes("SMART సేవలు & Power Tools") || txt.includes("SMART Utilities & లింకులు")) {
        el.style.setProperty("display", show ? "block" : "none", "important");
      }
    });
  },

  applyUserRoleView: function() {
    const state = window.AppState;
    const farmerContainer = this.getFarmerContainer();
    const labourContainer = this.getLabourContainer();
    const providerContainer = this.getProviderContainer();
    const walletContainer = document.getElementById('wallet-container');
    const mandiContainer = document.getElementById('mandi-container') || document.querySelector('.mandi-card');
    const weatherContainer = document.getElementById('weather-container') || document.querySelector('.weather-card');

    // 1. ల్యాండింగ్ పేజీ (User Login కానప్పుడు)
    if (!state || !state.isLoggedIn) {
      this.removeProfileHeader();
      this.removeRoleSwitchBar();

      if (walletContainer) walletContainer.style.setProperty('display', 'none', 'important');
      if (mandiContainer) mandiContainer.style.setProperty('display', 'block', 'important');
      if (weatherContainer) weatherContainer.style.setProperty('display', 'block', 'important');

      // లాగిన్ కానప్పుడు SMART Tools & Utilities పూర్తిగా దాచిపెట్టాలి
      this.setToolsVisibility(false);

      if (farmerContainer) {
        farmerContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderFarmerLandingCard === 'function') window.renderFarmerLandingCard();
      }

      if (labourContainer) {
        labourContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderLabourLandingCard === 'function') window.renderLabourLandingCard();
      }

      if (providerContainer) {
        providerContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderProviderLandingCard === 'function') window.renderProviderLandingCard();
      }
      return;
    }

    // 2. యూజర్ లాగిన్ అయినప్పుడు
    this.renderUserProfileBanner();

    // A. కేవలం కూలీ లాగిన్ (LABOUR)
    if (state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY" || state.userType === "LABOUR") {
      this.removeRoleSwitchBar();
      this.setToolsVisibility(false); // కూలీకి టూల్స్ అవసరం లేదు

      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
      if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
      if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');

      if (labourContainer) {
        labourContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
      }
      if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
      if (typeof window.filterLabourJobsByLocation === 'function') window.filterLabourJobsByLocation();
    }
    // B. రైతు లాగిన్ (FARMER)
    else if (state.userType === "FARMER") {
      this.renderRoleSwitchBar();

      if (state.currentRole === 'LABOUR') {
        this.setToolsVisibility(false);
        if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
        if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
        if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
        if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');

        if (labourContainer) {
          labourContainer.style.setProperty('display', 'block', 'important');
          if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
        }
        if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
      } else if (state.currentRole === 'PROVIDER') {
        this.setToolsVisibility(false);
        if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
        if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
        if (providerContainer) {
          providerContainer.style.setProperty('display', 'block', 'important');
          if (typeof window.renderProviderDashboardView === 'function') {
            window.renderProviderDashboardView(providerContainer, state.providerType || 'equipment');
          }
        }
        if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
      } else {
        // అసలైన రైతు మోడ్: ఇక్కడ మాత్రమే SMART Tools కనిపిస్తాయి
        this.setToolsVisibility(true);

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
    // C. యజమాని లాగిన్ (PROVIDER)
    else if (state.userType === "PROVIDER") {
      this.removeRoleSwitchBar();
      this.setToolsVisibility(false); // యజమానికి SMART Tools దాచిపెట్టాలి!

      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
      if (walletContainer) walletContainer.style.setProperty('display', 'none', 'important');
      if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
      if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');

      if (providerContainer) {
        providerContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderProviderDashboardView === 'function') {
          window.renderProviderDashboardView(providerContainer, state.providerType || 'equipment');
        }
      }
    }
  },

  renderUserProfileBanner: function() {
    let banner = document.getElementById("user-profile-banner");
    const state = window.AppState;
    const user = state ? (state.userProfile || state.user) : null;
    if (!user) return;

    const tpl = document.getElementById("role-profile-banner-template");
    if (!tpl) return;

    if (!banner) {
      const fragment = tpl.content.cloneNode(true);
      banner = fragment.querySelector(".user-profile-banner");
      banner.id = "user-profile-banner";
      const header = document.querySelector(".header") || document.querySelector("header") || document.body.firstChild;
      if (header && header.parentNode) {
        header.parentNode.insertBefore(banner, header.nextSibling);
      } else {
        document.body.prepend(banner);
      }
    }

    let roleText = "రైతు (Farmer)";
    let badgeColor = "#16a34a";

    if (state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY" || state.currentRole === "LABOUR") {
      roleText = "కూలీ (Labour)";
      badgeColor = "#ea580c";
    } else if (state.userType === "PROVIDER" || state.currentRole === "PROVIDER") {
      const pType = state.providerType || (user && user.providerType) || 'equipment';
      if (pType === 'transport') {
        roleText = "🚚 రవాణా యజమాని";
        badgeColor = "#7c3aed";
      } else if (pType === 'seeds') {
        roleText = "🌱 విత్తనాల డీలర్";
        badgeColor = "#16a34a";
      } else {
        roleText = "🚜 పరికరాల యజమాని";
        badgeColor = "#f57c00";
      }
    }

    banner.style.setProperty('--badge-color', badgeColor);
    banner.querySelector(".user-name-text").textContent = user.name || 'వినియోగదారుడు';
    banner.querySelector(".profile-banner-badge").textContent = roleText;
    banner.querySelector(".user-phone-text").textContent = user.phone || '';
    banner.querySelector(".user-village-text").textContent = user.village || '';
  },

  removeProfileHeader: function() {
    const banner = document.getElementById("user-profile-banner");
    if (banner) banner.remove();
  },

  renderRoleSwitchBar: function() {
    const state = window.AppState;
    if (!state || !state.isLoggedIn || state.userType !== "FARMER") return;

    let switchContainer = document.getElementById("role-switch-container");
    const tpl = document.getElementById("role-dual-switch-template");
    if (!tpl) return;

    if (!switchContainer) {
      const fragment = tpl.content.cloneNode(true);
      switchContainer = fragment.querySelector(".role-switch-container");
      switchContainer.id = "role-switch-container";

      const userBanner = document.getElementById('user-profile-banner');
      if (userBanner && userBanner.parentNode) {
        userBanner.parentNode.insertBefore(switchContainer, userBanner.nextSibling);
      } else {
        document.body.prepend(switchContainer);
      }
    }

    const current = state.currentRole || 'FARMER';
    const farmerBtn = switchContainer.querySelector("#role-btn-farmer");
    const labourBtn = switchContainer.querySelector("#role-btn-labour");
    const providerBtn = switchContainer.querySelector("#role-btn-provider");

    if (farmerBtn) farmerBtn.className = `role-switch-btn role-switch-farmer ${current === 'FARMER' ? 'active' : ''}`;
    if (labourBtn) labourBtn.className = `role-switch-btn role-switch-labour ${current === 'LABOUR' ? 'active' : ''}`;
    if (providerBtn) providerBtn.className = `role-switch-btn role-switch-provider ${current === 'PROVIDER' ? 'active' : ''}`;
  },

  removeRoleSwitchBar: function() {
    const switchContainer = document.getElementById("role-switch-container");
    if (switchContainer) switchContainer.remove();
  },

  switchRoleMode: function(targetRole) {
    if (!window.AppState) window.AppState = {};
    window.AppState.currentRole = targetRole;
    this.applyUserRoleView();
  },

  logoutUser: function() {
    if (!window.AppState) window.AppState = {};
    window.AppState.isLoggedIn = false;
    window.AppState.userProfile = null;
    localStorage.removeItem("agri_user_profile");
    this.applyUserRoleView();
  }
};

// ===================================================
// FARMER & LABOUR LOGIN / REGISTER MODAL ENGINE
// ===================================================
window.openLoginModal = function(roleType) {
  let modal = document.getElementById("role-login-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "role-login-modal";
    modal.className = "agri-modal-overlay";
    modal.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:99999; padding:16px;";
    document.body.appendChild(modal);
  }

  const isFarmer = (roleType === "FARMER");
  const themeColor = isFarmer ? "#16a34a" : "#ea580c";

  let savedUser = null;
  try {
    const saved = localStorage.getItem("agri_user_profile") || localStorage.getItem("agri_last_user");
    if (saved) savedUser = JSON.parse(saved);
  } catch (e) {}

  if (savedUser && savedUser.phone) {
    modal.innerHTML = `
      <div style="background:#fff; border-radius:14px; padding:20px; width:100%; max-width:380px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <div style="font-size:36px; margin-bottom:8px;">🔒</div>
        <h3 style="margin:0 0 6px; color:#1e293b;">స్వాగతం, ${savedUser.name || 'రైతు'} గారు!</h3>
        <p style="font-size:13px; color:#64748b; margin:0 0 16px;">మొబైల్: <b>${savedUser.phone}</b></p>

        <div style="margin-bottom:16px; text-align:left;">
          <label style="font-size:12px; font-weight:600; color:#334155; display:block; margin-bottom:6px;">మీ 4 అంకెల సెక్యూరిటీ పిన్ నమోదు చేయండి:</label>
          <input type="password" id="fast-login-pin" maxlength="4" placeholder="••••" inputmode="numeric" style="width:100%; padding:10px; font-size:18px; text-align:center; letter-spacing:8px; border:2px solid ${themeColor}; border-radius:8px; box-sizing:border-box;">
        </div>

        <div style="display:flex; gap:10px; margin-bottom:12px;">
          <button onclick="window.closeLoginModal()" style="flex:1; padding:10px; background:#f1f5f9; border:none; border-radius:8px; font-weight:600; cursor:pointer;">రద్దు</button>
          <button onclick="window.submitDirectPinLogin('${roleType}')" style="flex:2; padding:10px; background:${themeColor}; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">లాగిన్ ➔</button>
        </div>

        <a href="javascript:void(0)" onclick="window.switchToFullRegister('${roleType}')" style="font-size:12px; color:${themeColor}; text-decoration:none;">
          వేరే నంబర్‌తో నమోదు చేసుకోవాలా? క్లిక్ చేయండి
        </a>
      </div>
    `;
  } else {
    renderRegisterForm(modal, roleType, themeColor);
  }

  modal.style.display = "flex";
};

function renderRegisterForm(modal, roleType, themeColor) {
  const isFarmer = (roleType === "FARMER");
  const title = isFarmer ? "🌾 రైతు ప్రొఫైల్ నమోదు" : "👷 కూలీ ప్రొఫైల్ నమోదు";

  modal.innerHTML = `
    <div style="background:#fff; border-radius:14px; padding:20px; width:100%; max-width:400px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
      <h3 style="margin:0 0 16px; text-align:center; color:${themeColor};">${title}</h3>
      
      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:600; color:#334155; display:block; margin-bottom:4px;">మీ పూర్తి పేరు:</label>
        <input type="text" id="reg-name" placeholder="ఉదా: రామయ్య" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:600; color:#334155; display:block; margin-bottom:4px;">మొబైల్ నంబర్ (10 అంకెలు):</label>
        <input type="tel" id="reg-phone" placeholder="9876543210" maxlength="10" inputmode="numeric" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:10px;">
        <label style="font-size:12px; font-weight:600; color:#334155; display:block; margin-bottom:4px;">గ్రామం / ఊరు (Village):</label>
        <input type="text" id="reg-village" placeholder="ఉదా: హసన్‌పర్తి" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:16px;">
        <label style="font-size:12px; font-weight:600; color:#334155; display:block; margin-bottom:4px;">భద్రతా పిన్ సెట్ చేయండి (4-Digit PIN):</label>
        <input type="password" id="reg-pin" placeholder="1234" maxlength="4" inputmode="numeric" style="width:100%; padding:9px; border:2px solid ${themeColor}; border-radius:8px; letter-spacing:4px; text-align:center; box-sizing:border-box;">
      </div>

      <div style="display:flex; gap:10px;">
        <button onclick="window.closeLoginModal()" style="flex:1; padding:10px; background:#f1f5f9; border:none; border-radius:8px; font-weight:600; cursor:pointer;">రద్దు</button>
        <button onclick="window.submitUserRegistration('${roleType}')" style="flex:2; padding:10px; background:${themeColor}; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">నమోదు చేసుకోండి</button>
      </div>
    </div>
  `;
}

window.switchToFullRegister = function(roleType) {
  const modal = document.getElementById("role-login-modal");
  const themeColor = (roleType === "FARMER") ? "#16a34a" : "#ea580c";
  if (modal) renderRegisterForm(modal, roleType, themeColor);
};

window.closeLoginModal = function() {
  const modal = document.getElementById("role-login-modal");
  if (modal) modal.style.display = "none";
};

window.submitDirectPinLogin = function(roleType) {
  const pin = document.getElementById("fast-login-pin")?.value.trim();
  if (!pin || pin.length !== 4) {
    alert("దయచేసి 4 అంకెల పిన్ ఎంటర్ చేయండి.");
    return;
  }

  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem("agri_user_profile") || localStorage.getItem("agri_last_user"));
  } catch(e) {}

  if (!window.AppState) window.AppState = {};
  window.AppState.isLoggedIn = true;
  window.AppState.userProfile = saved;
  window.AppState.userType = roleType;
  window.AppState.currentRole = (roleType === "LABOUR" || roleType === "LABOUR_ONLY") ? "LABOUR" : "FARMER";

  window.closeLoginModal();
  window.RoleController.applyUserRoleView();
};

window.submitUserRegistration = function(roleType) {
  const name = document.getElementById("reg-name")?.value.trim() || "";
  const phone = document.getElementById("reg-phone")?.value.trim() || "";
  const village = document.getElementById("reg-village")?.value.trim() || "";
  const pin = document.getElementById("reg-pin")?.value.trim() || "1234";

  if (!name) return alert("దయచేసి మీ పేరు నమోదు చేయండి.");
  if (!phone || phone.length !== 10) return alert("దయచేసి 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.");
  if (!village) return alert("దయచేసి మీ గ్రామం పేరు నమోదు చేయండి.");

  const profile = { name, phone, village, pin, roleType, userType: roleType };

  if (!window.AppState) window.AppState = {};
  window.AppState.isLoggedIn = true;
  window.AppState.userProfile = profile;
  window.AppState.userType = roleType;
  window.AppState.currentRole = (roleType === "LABOUR" || roleType === "LABOUR_ONLY") ? "LABOUR" : "FARMER";

  try {
    localStorage.setItem("agri_user_profile", JSON.stringify(profile));
    localStorage.setItem("agri_last_user", JSON.stringify(profile));
  } catch(e) {}

  window.closeLoginModal();
  window.RoleController.applyUserRoleView();
};

// Global Helpers
window.applyUserRoleView = () => window.RoleController.applyUserRoleView();
window.switchRoleMode = (r) => window.RoleController.switchRoleMode(r);
window.logoutUser = () => window.RoleController.logoutUser();

// Auto session restore & init
document.addEventListener("DOMContentLoaded", function() {
  const savedData = localStorage.getItem("agri_user_profile");
  if (savedData) {
    try {
      const user = JSON.parse(savedData);
      if (user && user.phone) {
        if (!window.AppState) window.AppState = {};
        window.AppState.isLoggedIn = true;
        window.AppState.userProfile = user;
        window.AppState.userType = user.userType || user.roleType || "FARMER";
        window.AppState.providerType = user.providerType || "equipment";
        window.AppState.currentRole = (window.AppState.userType === "LABOUR_ONLY" || window.AppState.userType === "LABOUR") ? "LABOUR" : "FARMER";
      }
    } catch (e) {}
  }
  window.RoleController.applyUserRoleView();
});
