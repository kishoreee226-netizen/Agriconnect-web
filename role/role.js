// role/role.js - AgriConnect Smart Role Controller & Orchestrator
window.RoleController = {
  init: function() {
    this.restoreSession();
    this.applyUserRoleView();
  },

  restoreSession: function() {
    const savedData = localStorage.getItem("agri_user_profile");
    if (savedData) {
      try {
        const user = JSON.parse(savedData);
        if (user && user.phone) {
          if (!window.AppState) window.AppState = {};
          window.AppState.isLoggedIn = true;
          window.AppState.userProfile = user;
          window.AppState.userType = user.roleType || user.userType || "FARMER";
          
          // రోల్ డిఫాల్ట్ సెట్ చేయడం
          if (!window.AppState.currentRole) {
            window.AppState.currentRole = (window.AppState.userType === "LABOUR" || window.AppState.userType === "LABOURONLY") ? "LABOUR" : (window.AppState.userType === "PROVIDER" ? "PROVIDER" : "FARMER");
          }
        }
      } catch (e) {
        console.warn("Session restore error:", e);
      }
    }
  },

  getContainer: function(id) {
    let el = document.getElementById(id);
    if (!el && (id === "farmer-post-container" || id === "labour-jobs-container")) {
      const wallet = document.getElementById("wallet-container") || document.querySelector(".wallet-card");
      if (wallet && wallet.parentNode) {
        el = document.createElement("div");
        el.id = id;
        wallet.parentNode.insertBefore(el, wallet);
      }
    }
    return el;
  },

  applyUserRoleView: function() {
    const state = window.AppState;
    const farmerContainer = this.getContainer("farmer-post-container");
    const labourContainer = this.getContainer("labour-jobs-container");
    const providerContainer = document.getElementById("provider-container") || document.getElementById("provider-hub-container");
    const walletContainer = document.getElementById('wallet-container');
    const mandiContainer = document.getElementById('mandi-container') || document.querySelector('.mandi-card');
    const weatherContainer = document.getElementById('weather-container') || document.querySelector('.weather-card');

    // 1. లాగిన్ కానప్పుడు (Landing View)
    if (!state || !state.isLoggedIn) {
      this.removeProfileHeader();
      this.removeRoleSwitchBar();

      if (walletContainer) walletContainer.style.setProperty('display', 'none', 'important');
      if (mandiContainer) mandiContainer.style.setProperty('display', 'block', 'important');
      if (weatherContainer) weatherContainer.style.setProperty('display', 'block', 'important');

      if (typeof window.injectProviderLandingCard === 'function') {
        window.injectProviderLandingCard();
      }
      return;
    }

    // 2. లాగిన్ అయినప్పుడు బ్యానర్ డిస్‌ప్లే
    this.renderUserProfileBanner();

    // Case A: కేవలం కూలీగా మాత్రమే రిజిస్టర్ అయినవారు (LABOUR ONLY)
    if (state.userType === "LABOURONLY") {
      this.removeRoleSwitchBar();
      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
      if (labourContainer) {
        labourContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
      }
      if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
      this.filterLabourJobsByLocation();
      return;
    }

    // Case B: రైతు లేదా యూనివర్సల్ ప్రొఫైల్ (FARMER / PROVIDER) - 3 మోడ్‌ల స్విచ్ బార్
    this.renderRoleSwitchBar();

    const currRole = state.currentRole || 'FARMER';

    // 1. కూలీ మోడ్ లో ఉన్నప్పుడు
    if (currRole === 'LABOUR') {
      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
      if (labourContainer) {
        labourContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
        this.filterLabourJobsByLocation();
      }
    } 
    // 2. ప్రొవైడర్ మోడ్ లో ఉన్నప్పుడు (ట్రాక్టర్, విత్తనాలు, రవాణా అద్దెకు ఇచ్చే మోడ్)
    else if (currRole === 'PROVIDER') {
      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
      if (providerContainer) {
        providerContainer.style.setProperty('display', 'block', 'important');
        if (window.ProviderModule) {
          if (typeof window.ProviderModule.renderDashboard === 'function') {
            window.ProviderModule.renderDashboard(providerContainer, state.providerType || 'equipment');
          } else if (typeof window.ProviderModule.init === 'function') {
            window.ProviderModule.init();
          }
        }
      }
    } 
    // 3. రైతు మోడ్ లో ఉన్నప్పుడు (డిఫాల్ట్)
    else {
      if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
      if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
      if (farmerContainer) {
        farmerContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderFarmerWidget === 'function') window.renderFarmerWidget();
        if (typeof window.renderFarmerWidgetWithLiveProviders === 'function') {
          window.renderFarmerWidgetWithLiveProviders();
        }
      }
    }

    if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
  },

  renderUserProfileBanner: function() {
    const state = window.AppState;
    const user = state ? (state.userProfile || state.user) : null;
    if (!user) return;

    const mount = document.getElementById("role-container") || document.body;
    let banner = document.getElementById("user-profile-banner");

    if (!banner) {
      const tpl = document.getElementById("role-profile-banner-template");
      if (!tpl) return;
      banner = tpl.content.cloneNode(true).querySelector(".user-profile-banner");
      banner.id = "user-profile-banner";
      mount.prepend(banner);
    }

    let roleText = "రైతు (Farmer)";
    const curr = state.currentRole || state.userType;
    if (curr === "LABOUR" || curr === "LABOURONLY") roleText = "👷 కూలీ (Labour)";
    else if (curr === "PROVIDER") roleText = "🤝 యజమాని (Provider)";

    const nameNode = banner.querySelector(".user-name-text");
    const badgeNode = banner.querySelector(".profile-banner-badge");
    const phoneNode = banner.querySelector(".user-phone-text");
    const villageNode = banner.querySelector(".user-village-text");

    if (nameNode) nameNode.textContent = `👤 ${user.name || 'వినియోగదారుడు'} `;
    if (badgeNode) badgeNode.textContent = roleText;
    if (phoneNode) phoneNode.textContent = `📞 ${user.phone || ''}`;
    if (villageNode) villageNode.textContent = user.village || '';
  },

  removeProfileHeader: function() {
    const banner = document.getElementById("user-profile-banner");
    if (banner) banner.remove();
  },

  renderRoleSwitchBar: function() {
    const state = window.AppState;
    if (!state || !state.isLoggedIn || state.userType === "LABOURONLY") return;

    let switchBar = document.getElementById("role-switch-container");
    if (!switchBar) {
      const tpl = document.getElementById("role-dual-switch-template");
      if (!tpl) return;
      switchBar = tpl.content.cloneNode(true).querySelector(".role-switch-container");
      switchBar.id = "role-switch-container";

      const userBanner = document.getElementById("user-profile-banner");
      if (userBanner && userBanner.parentNode) {
        userBanner.parentNode.insertBefore(switchBar, userBanner.nextSibling);
      } else {
        const mount = document.getElementById("role-container") || document.body;
        mount.appendChild(switchBar);
      }
    }

    const curr = state.currentRole || 'FARMER';
    const fBtn = switchBar.querySelector("#role-btn-farmer");
    const lBtn = switchBar.querySelector("#role-btn-labour");
    const pBtn = switchBar.querySelector("#role-btn-provider");

    if (fBtn) fBtn.classList.toggle("active", curr === 'FARMER');
    if (lBtn) lBtn.classList.toggle("active", curr === 'LABOUR');
    if (pBtn) pBtn.classList.toggle("active", curr === 'PROVIDER');
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
    if (window.AuthModule) window.AuthModule.close();
    if (window.AppState) {
      window.AppState.isLoggedIn = false;
      window.AppState.userProfile = null;
      window.AppState.currentRole = null;
    }
    localStorage.removeItem("agri_user_profile");
    this.applyUserRoleView();
  },

  filterLabourJobsByLocation: function() {
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
};

// Global Backwards Compatibility
window.applyUserRoleView = () => window.RoleController.applyUserRoleView();
window.switchRoleMode = (role) => window.RoleController.switchRoleMode(role);
window.logoutUser = () => window.RoleController.logoutUser();
window.openLoginModal = (roleType) => {
  if (window.AuthModule) window.AuthModule.open({ role: roleType || 'FARMER' });
};

// Auto Init on script load
window.RoleController.init();
