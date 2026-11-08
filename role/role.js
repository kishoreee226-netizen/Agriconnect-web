// role/role.js - AgriConnect Smart Role Controller & Orchestrator (Clean Modular)

window.RoleController = {
  getFarmerContainer: function() {
    return document.getElementById("farmer-post-container");
  },

  getLabourContainer: function() {
    return document.getElementById("labour-jobs-container");
  },

  getProviderContainer: function() {
    return document.getElementById("provider-container") || document.getElementById("provider-hub-container");
  },

  applyUserRoleView: function() {
    const state = window.AppState;
    const farmerContainer = this.getFarmerContainer();
    const labourContainer = this.getLabourContainer();
    const providerContainer = this.getProviderContainer();
    const walletContainer = document.getElementById('wallet-container');
    const mandiContainer = document.getElementById('mandi-container') || document.querySelector('.mandi-card');
    const weatherContainer = document.getElementById('weather-container') || document.querySelector('.weather-card');

    // 1. లాగిన్ కానప్పుడు (ఒరిజినల్ పబ్లిక్ ల్యాండింగ్ వ్యూ)
    if (!state || !state.isLoggedIn) {
      this.removeProfileHeader();
      this.removeRoleSwitchBar();

      // ల్యాండింగ్ పేజీలో రైతు పోస్టింగ్ ఫారమ్ మరియు వాలెట్ దాచాలి
      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (walletContainer) walletContainer.style.setProperty('display', 'none', 'important');

      // పబ్లిక్ పనులు, ప్రొవైడర్ కార్డ్, మార్కెట్, వెదర్ యథావిధిగా కనిపించాలి
      if (labourContainer) {
        labourContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
      }
      if (mandiContainer) mandiContainer.style.setProperty('display', 'block', 'important');
      if (weatherContainer) weatherContainer.style.setProperty('display', 'block', 'important');

      if (typeof window.injectProviderLandingCard === 'function') {
        window.injectProviderLandingCard();
      }
      return;
    }

    // 2. లాగిన్ అయినప్పుడు ప్రొఫైల్ బ్యానర్
    this.renderUserProfileBanner();

    // Case A: కూలీ మాత్రమే లాగిన్ అయినప్పుడు (LABOUR ONLY)
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
    // Case B: రైతు లాగిన్ అయినప్పుడు (FARMER - 3-in-1 Switcher Dashboard)
    else if (state.userType === "FARMER") {
      this.renderRoleSwitchBar();

      if (state.currentRole === 'LABOUR') {
        // కూలీ మోడ్
        if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
        if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
        if (labourContainer) {
          labourContainer.style.setProperty('display', 'block', 'important');
          if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
          this.filterLabourJobsByLocation();
        }
      } else if (state.currentRole === 'PROVIDER') {
        // యజమాని / ప్రొవైడర్ మోడ్
        if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
        if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
        if (providerContainer) {
          providerContainer.style.setProperty('display', 'block', 'important');
          if (window.ProviderModule) {
            window.ProviderModule.renderDashboard(providerContainer, state.providerType || 'equipment');
          }
        }
      } else {
        // డిఫాల్ట్: రైతు మోడ్
        if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
        if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
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
    // Case C: కేవలం ప్రొవైడర్ మాత్రమే లాగిన్ అయినప్పుడు
    else if (state.userType === "PROVIDER") {
      this.removeRoleSwitchBar();
      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
      if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
      if (providerContainer && window.ProviderModule) {
        providerContainer.style.setProperty('display', 'block', 'important');
        window.ProviderModule.renderDashboard(providerContainer, state.providerType || 'equipment');
      }
    }
  },

  renderUserProfileBanner: function() {
    const mount = document.getElementById("role-container") || document.body;
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
      mount.prepend(banner);
    }

    let roleText = "రైతు (Farmer)";
    if (state.userType === "LABOUR" || state.currentRole === "LABOUR") roleText = "కూలీ (Labour)";
    else if (state.userType === "PROVIDER" || state.currentRole === "PROVIDER") roleText = "🤝 యజమాని (Provider)";

    banner.querySelector(".user-name-text").textContent = user.name || 'వినియోగదారుడు';
    banner.querySelector(".profile-banner-badge").textContent = roleText;
    banner.querySelector(".user-phone-text").textContent = user.phone || '';
    banner.querySelector(".user-village-text").textContent = user.village || '';
  },

  removeProfileHeader: function() {
    const banner = document.getElementById("user-profile-banner");
    if (banner) banner.remove();
  },

  // రైతు డాష్‌బోర్డ్‌లో 3-ఇన్-1 మోడ్ స్విచర్ రెండరింగ్
  renderRoleSwitchBar: function() {
    const state = window.AppState;
    if (!state || !state.isLoggedIn || state.userType !== "FARMER") return;

    const mount = document.getElementById("role-container") || document.body;
    let bar = document.getElementById("role-switch-container");
    const tpl = document.getElementById("role-dual-switch-template");
    if (!tpl) return;

    if (!bar) {
      const fragment = tpl.content.cloneNode(true);
      bar = fragment.querySelector(".role-switch-container");
      bar.id = "role-switch-container";
      
      const banner = document.getElementById("user-profile-banner");
      if (banner && banner.nextSibling) {
        mount.insertBefore(bar, banner.nextSibling);
      } else {
        mount.appendChild(bar);
      }
    }

    const current = state.currentRole || 'FARMER';
    const farmerBtn = bar.querySelector("#role-btn-farmer");
    const labourBtn = bar.querySelector("#role-btn-labour");
    const providerBtn = bar.querySelector("#role-btn-provider");

    if (farmerBtn) farmerBtn.className = `role-switch-btn role-switch-farmer ${current === 'FARMER' ? 'active' : ''}`;
    if (labourBtn) labourBtn.className = `role-switch-btn role-switch-labour ${current === 'LABOUR' ? 'active' : ''}`;
    if (providerBtn) providerBtn.className = `role-switch-btn role-switch-provider ${current === 'PROVIDER' ? 'active' : ''}`;
  },

  removeRoleSwitchBar: function() {
    const bar = document.getElementById("role-switch-container");
    if (bar) bar.remove();
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
  },

  switchRoleMode: function(targetRole) {
    if (!window.AppState) window.AppState = {};
    window.AppState.currentRole = targetRole;
    if (typeof window.AppState.setCurrentRole === 'function') {
      window.AppState.setCurrentRole(targetRole);
    }
    this.applyUserRoleView();
  },

  logoutUser: function() {
    if (window.AuthModule) window.AuthModule.close();
    window.AppState.isLoggedIn = false;
    window.AppState.userProfile = null;
    window.AppState.user = null;
    window.AppState.currentRole = "GUEST";
    localStorage.removeItem("agri_user_profile");
    localStorage.removeItem("agri_user_role");
    this.applyUserRoleView();
  }
};

// Global Bridges for Event Handlers & Backward Compatibility
window.applyUserRoleView = () => window.RoleController.applyUserRoleView();
window.switchRoleMode = (r) => window.RoleController.switchRoleMode(r);
window.logoutUser = () => window.RoleController.logoutUser();
window.openLoginModal = (r) => {
  if (window.AuthModule) window.AuthModule.open({ role: r || 'FARMER' });
};
