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
          window.AppState.currentRole = (window.AppState.userType === "LABOUR") ? "LABOUR" : "FARMER";
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

    // Case A: కూలీ మాత్రమే లాగిన్ అయినప్పుడు (LABOUR)
    if (state.userType === "LABOURONLY" || state.userType === "LABOUR") {
      this.removeRoleSwitchBar();
      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
      if (labourContainer) {
        labourContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
      }
      if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
      this.filterLabourJobsByLocation();
    }
    // Case B: రైతు లాగిన్ అయినప్పుడు (FARMER / Dual-role mode)
    else if (state.userType === "FARMER") {
      this.renderRoleSwitchBar();
      if (state.currentRole === 'LABOUR') {
        if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
        if (labourContainer) {
          labourContainer.style.setProperty('display', 'block', 'important');
          if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
          this.filterLabourJobsByLocation();
        }
      } else {
        if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
        if (farmerContainer) {
          farmerContainer.style.setProperty('display', 'block', 'important');
          if (typeof window.renderFarmerWidget === 'function') window.renderFarmerWidget();
        }
        if (typeof window.renderFarmerWidgetWithLiveProviders === 'function') {
          window.renderFarmerWidgetWithLiveProviders();
        }
      }
      if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
    }
    // Case C: ప్రొవైడర్ / యంత్రాల యజమాని (PROVIDER)
    else if (state.userType === "PROVIDER") {
      this.removeRoleSwitchBar();
      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
      if (walletContainer) walletContainer.style.setProperty('display', 'none', 'important');
      if (providerContainer && window.ProviderModule) {
        providerContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.ProviderModule.renderDashboard === 'function') {
          window.ProviderModule.renderDashboard(providerContainer, state.providerType || 'equipment');
        } else if (typeof window.ProviderModule.init === 'function') {
          window.ProviderModule.init();
        }
      }
    }
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
    if (state.userType === "LABOUR" || state.currentRole === "LABOUR") roleText = "కూలీ (Labour)";
    else if (state.userType === "PROVIDER") roleText = "🤝 యజమాని (Provider)";

    banner.querySelector(".user-name-text").textContent = `👤 ${user.name || 'వినియోగదారుడు'} `;
    banner.querySelector(".profile-banner-badge").textContent = roleText;
    banner.querySelector(".user-phone-text").textContent = `📞 ${user.phone || ''}`;
    banner.querySelector(".user-village-text").textContent = user.village || '';
  },

  removeProfileHeader: function() {
    const banner = document.getElementById("user-profile-banner");
    if (banner) banner.remove();
  },

  renderRoleSwitchBar: function() {
    const state = window.AppState;
    if (!state || !state.isLoggedIn || state.userType !== "FARMER") return;

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

    const isFarmerRole = (state.currentRole !== 'LABOUR');
    const farmerBtn = switchBar.querySelector("#role-btn-farmer");
    const labourBtn = switchBar.querySelector("#role-btn-labour");

    if (farmerBtn) farmerBtn.classList.toggle("active", isFarmerRole);
    if (labourBtn) labourBtn.classList.toggle("active", !isFarmerRole);
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
