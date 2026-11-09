// role/role.js - Pure Role Switcher & View Orchestrator (No Extra Work)

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

  // ఏకైక బాధ్యత: ట్రాఫిక్ సిగ్నల్ లా ఏది ఆన్ ఉండాలో, ఏది ఆఫ్ ఉండాలో నిర్ణయించడం
  applyUserRoleView: function() {
    const state = window.AppState;
    const farmerBox = this.getFarmerContainer();
    const labourBox = this.getLabourContainer();
    const providerBox = this.getProviderContainer();
    const walletBox = document.getElementById("wallet-container") || document.querySelector(".wallet-card");
    const mandiBox = document.getElementById("mandi-container") || document.querySelector(".mandi-card");
    const weatherBox = document.getElementById("weather-container") || document.querySelector(".weather-card");

    // 1. లాగిన్ కానప్పుడు (Public Landing View)
    if (!state || !state.isLoggedIn) {
      this.removeProfileHeader();
      this.removeRoleSwitchBar();

      if (farmerBox) {
        farmerBox.style.display = "block";
        if (typeof window.renderFarmerLandingCard === "function") window.renderFarmerLandingCard();
      }
      if (labourBox) {
        labourBox.style.display = "block";
        if (typeof window.renderLabourLandingCard === "function") window.renderLabourLandingCard();
      }
      if (providerBox) {
        providerBox.style.display = "block";
        if (typeof window.renderProviderLandingCard === "function") window.renderProviderLandingCard();
      }

      if (walletBox) walletBox.style.display = "none";
      if (mandiBox) mandiBox.style.display = "block";
      if (weatherBox) weatherBox.style.display = "block";
      return;
    }

    // 2. లాగిన్ అయినప్పుడు: పైన ప్రొఫైల్ బ్యానర్ చూపించడం
    this.renderUserProfileBanner();

    // A. కూలీ మోడ్ (LABOUR)
    if (state.currentRole === "LABOUR" || state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY") {
      if (state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY") {
        this.removeRoleSwitchBar();
      } else {
        this.renderRoleSwitchBar();
      }

      if (farmerBox) farmerBox.style.display = "none";
      if (providerBox) providerBox.style.display = "none";
      if (labourBox) {
        labourBox.style.display = "block";
        if (typeof window.renderLabourWidget === "function") window.renderLabourWidget();
      }

      if (walletBox) walletBox.style.display = "block";
      if (mandiBox) mandiBox.style.display = "none";
      if (weatherBox) weatherBox.style.display = "none";
    }

    // B. యజమాని మోడ్ (PROVIDER)
    else if (state.currentRole === "PROVIDER") {
      if (state.userType === "PROVIDER") {
        this.removeRoleSwitchBar();
      } else {
        this.renderRoleSwitchBar();
      }

      if (farmerBox) farmerBox.style.display = "none";
      if (labourBox) labourBox.style.display = "none";
      if (providerBox) {
        providerBox.style.display = "block";
        if (typeof window.renderProviderDashboardView === "function") {
          window.renderProviderDashboardView(providerBox, state.providerType || "equipment");
        }
      }

      if (walletBox) walletBox.style.display = "block";
      if (mandiBox) mandiBox.style.display = "none";
      if (weatherBox) weatherBox.style.display = "none";
    }

    // C. రైతు మోడ్ (FARMER)
    else {
      this.renderRoleSwitchBar();

      if (labourBox) labourBox.style.display = "none";
      if (providerBox) providerBox.style.display = "none";
      if (farmerBox) {
        farmerBox.style.display = "block";
        if (typeof window.renderFarmerWidget === "function") window.renderFarmerWidget();
      }

      if (walletBox) walletBox.style.display = "block";
      if (weatherBox) weatherBox.style.display = "block";
      if (mandiBox) mandiBox.style.display = "none";
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
      const mount = document.getElementById("role-container") || document.querySelector(".container") || document.body;
      mount.prepend(banner);
    }

    let roleText = "రైతు (Farmer)";
    let badgeColor = "#16a34a";

    if (state.currentRole === "LABOUR" || state.userType === "LABOURONLY" || state.userType === "LABOUR_ONLY") {
      roleText = "కూలీ (Labour)";
      badgeColor = "#ea580c";
    } else if (state.currentRole === "PROVIDER") {
      roleText = "🤝 యజమాని (Provider)";
      badgeColor = "#7c3aed";
    }

    banner.style.setProperty("--badge-color", badgeColor);
    banner.querySelector(".user-name-text").textContent = user.name || "వినియోగదారుడు";
    banner.querySelector(".profile-banner-badge").textContent = roleText;
    banner.querySelector(".user-phone-text").textContent = user.phone || "";
    banner.querySelector(".user-village-text").textContent = user.village || "";
  },

  removeProfileHeader: function() {
    const banner = document.getElementById("user-profile-banner");
    if (banner) banner.remove();
  },

  renderRoleSwitchBar: function() {
    const state = window.AppState;
    if (!state || !state.isLoggedIn || (state.userType !== "FARMER" && state.currentRole !== "FARMER")) return;

    let switchContainer = document.getElementById("role-switch-container");
    const tpl = document.getElementById("role-dual-switch-template");
    if (!tpl) return;

    if (!switchContainer) {
      const fragment = tpl.content.cloneNode(true);
      switchContainer = fragment.querySelector(".role-switch-container");
      switchContainer.id = "role-switch-container";

      const userBanner = document.getElementById("user-profile-banner");
      if (userBanner && userBanner.parentNode) {
        userBanner.parentNode.insertBefore(switchContainer, userBanner.nextSibling);
      } else {
        document.body.prepend(switchContainer);
      }
    }

    const current = state.currentRole || "FARMER";
    const farmerBtn = switchContainer.querySelector("#role-btn-farmer");
    const labourBtn = switchContainer.querySelector("#role-btn-labour");
    const providerBtn = switchContainer.querySelector("#role-btn-provider");

    if (farmerBtn) farmerBtn.className = `role-switch-btn role-switch-farmer ${current === "FARMER" ? "active" : ""}`;
    if (labourBtn) labourBtn.className = `role-switch-btn role-switch-labour ${current === "LABOUR" ? "active" : ""}`;
    if (providerBtn) providerBtn.className = `role-switch-btn role-switch-provider ${current === "PROVIDER" ? "active" : ""}`;
  },

  removeRoleSwitchBar: function() {
    const switchContainer = document.getElementById("role-switch-container");
    if (switchContainer) switchContainer.remove();
  },

  switchRoleMode: function(targetRole) {
    if (!window.AppState) window.AppState = {};
    window.AppState.currentRole = targetRole;
    localStorage.setItem("agri_current_active_role", targetRole);
    this.applyUserRoleView();
  },

  logoutUser: function() {
    if (!window.AppState) window.AppState = {};
    window.AppState.isLoggedIn = false;
    window.AppState.userProfile = null;
    window.AppState.currentRole = "GUEST";
    localStorage.removeItem("agri_user_profile");
    localStorage.removeItem("agri_current_active_role");
    this.applyUserRoleView();
  }
};

window.applyUserRoleView = () => window.RoleController.applyUserRoleView();
window.switchRoleMode = (r) => window.RoleController.switchRoleMode(r);
window.logoutUser = () => window.RoleController.logoutUser();

// DOM సిద్ధమైనప్పుడు సెషన్ & మోడ్ పునరుద్ధరణ (ఒకే ఒక్క క్లీన్ లిజనర్)
document.addEventListener("DOMContentLoaded", function() {
  const savedData = localStorage.getItem("agri_user_profile");
  if (savedData) {
    try {
      const user = JSON.parse(savedData);
      if (user && user.phone) {
        if (!window.AppState) window.AppState = {};
        window.AppState.isLoggedIn = true;
        window.AppState.userProfile = user;

        // మీరు లాస్ట్ ఏ మోడ్‌లో ఉన్నారో (FARMER / LABOUR / PROVIDER) దాన్ని మాత్రమే ప్రాధాన్యతగా తీసుకోవడం
        const savedActiveRole = localStorage.getItem("agri_current_active_role");
        const activeRole = savedActiveRole || user.roleType || user.userType || "FARMER";

        window.AppState.currentRole = activeRole;
        // ఒకవేళ రైతు మోడ్ లేదా కూలీ మోడ్ లో ఉంటే userType ని కూడా అదే మోడ్ కి సెట్ చేసి లాక్ చేయడం
        window.AppState.userType = (activeRole === "PROVIDER") ? "PROVIDER" : (user.userType || "FARMER");
        window.AppState.providerType = user.providerType || "equipment";
      }
    } catch (e) {
      console.error(e);
    }
  }
  window.RoleController.applyUserRoleView();
});
