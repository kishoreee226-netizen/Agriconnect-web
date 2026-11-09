// role/role.js - AgriConnect Pure State & View Orchestrator

window.RoleController = {
  getFarmerContainer: function() {
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
  },

  getLabourContainer: function() {
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
  },

  getProviderContainer: function() {
    let el = document.getElementById("provider-hub-container") || document.getElementById("provider-container");
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

      // మూడు మాడ్యూల్స్ వాటి సొంత ల్యాండింగ్ కార్డులను చూపిస్తాయి
      if (farmerContainer) {
        farmerContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderFarmerLandingCard === 'function') {
          window.renderFarmerLandingCard();
        }
      }

      if (labourContainer) {
        labourContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderLabourLandingCard === 'function') {
          window.renderLabourLandingCard();
        }
      }

      if (providerContainer) {
        providerContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderProviderLandingCard === 'function') {
          window.renderProviderLandingCard();
        } else if (typeof window.injectProviderLandingCard === 'function') {
          window.injectProviderLandingCard();
        }
      }
      return;
    }

    // 2. లాగిన్ అయినప్పుడు
    this.renderUserProfileBanner();

    // A. కేవలం కూలీ లాగిన్ (LABOUR ONLY)
    if (state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY" || state.userType === "LABOUR") {
      this.removeRoleSwitchBar();

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

      // రైతు "కూలీ మోడ్" లోకి స్విచ్ అయితే:
      if (state.currentRole === 'LABOUR') {
        if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
        if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
        if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
        if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');

        if (labourContainer) {
          labourContainer.style.setProperty('display', 'block', 'important');
          if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
          if (typeof window.filterLabourJobsByLocation === 'function') window.filterLabourJobsByLocation();
        }
        if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
      }
      // రైతు "యజమాని మోడ్" లోకి స్విచ్ అయితే:
      else if (state.currentRole === 'PROVIDER') {
        if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
        if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
        if (mandiContainer) mandiContainer.style.setProperty('display', 'none', 'important');
        if (weatherContainer) weatherContainer.style.setProperty('display', 'none', 'important');

        if (providerContainer) {
          providerContainer.style.setProperty('display', 'block', 'important');
          if (typeof window.renderProviderDashboardView === 'function') {
            window.renderProviderDashboardView(providerContainer, state.providerType || 'equipment');
          }
        }
        if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
      }
      // రైతు "రైతు మోడ్" లో ఉన్నప్పుడు:
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
    // C. యజమాని లాగిన్ (PROVIDER)
    else if (state.userType === "PROVIDER") {
      this.removeRoleSwitchBar();

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

    if (typeof speakTeluguText === "function") {
      if (targetRole === "LABOUR") {
        speakTeluguText("కూలీ మోడ్‌కి మారారు. మీ చుట్టుపక్కల పనుల వివరాలు ఇక్కడ కనిపిస్తాయి.");
      } else if (targetRole === "PROVIDER") {
        speakTeluguText("యజమాని మోడ్‌కి మారారు.");
      } else {
        speakTeluguText("రైతు మోడ్‌కి మారారు. మీ పొలం పనులకు కూలీలను పోస్ట్ చేయవచ్చు.");
      }
    }
  },

  logoutUser: function() {
    if (!window.AppState) window.AppState = {};
    window.AppState.isLoggedIn = false;
    window.AppState.userProfile = null;
    localStorage.removeItem("agri_user_profile");
    this.applyUserRoleView();
    if (typeof speakTeluguText === "function") {
      speakTeluguText("ఖాతా నుండి విజయవంతంగా లాగౌట్ అయ్యారు.");
    }
  }
};

// Global Exposure for HTML onclick handlers
window.applyUserRoleView = () => window.RoleController.applyUserRoleView();
window.switchRoleMode = (r) => window.RoleController.switchRoleMode(r);
window.logoutUser = () => window.RoleController.logoutUser();
window.removeProfileHeader = () => window.RoleController.removeProfileHeader();
window.removeUserProfileBanner = () => window.RoleController.removeProfileHeader();
window.removeRoleSwitchBar = () => window.RoleController.removeRoleSwitchBar();

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
    } catch (e) {
      console.error("Session restore error:", e);
    }
  }
  window.RoleController.applyUserRoleView();
});
