// role/role.js - Pure Role Switcher & View Orchestrator

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

  // ఏకైక బాధ్యత: ఏది ఆన్ ఉండాలో, ఏది ఆఫ్ ఉండాలో నిర్ణయించడం
  applyUserRoleView: function() {
    const state = window.AppState;
    const farmerBox = this.getFarmerContainer();
    const labourBox = this.getLabourContainer();
    const providerBox = this.getProviderContainer();
    const walletBox = document.getElementById("wallet-container") || document.querySelector(".wallet-card");
    const mandiBox = document.getElementById("mandi-container") || document.querySelector(".mandi-card");
    const weatherBox = document.getElementById("weather-container") || document.querySelector(".weather-card");
    const toolsBox = document.getElementById("agri-tools-box");
    const utilsBox = document.getElementById("utilitiesMountSlot");

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
      if (toolsBox) toolsBox.style.display = "block";
      if (utilsBox) utilsBox.style.display = "block";
      return;
    }

    // 2. లాగిన్ అయినప్పుడు: ప్రొఫైల్ బ్యానర్ & రోల్ స్విచ్ బార్
    this.renderUserProfileBanner();
    this.renderRoleSwitchBar();

    // A. కూలీ మోడ్ (LABOUR)
    if (state.currentRole === "LABOUR") {
      if (farmerBox) farmerBox.style.display = "none";
      if (providerBox) providerBox.style.display = "none";
      if (labourBox) {
        labourBox.style.display = "block";
        if (typeof window.renderLabourWidget === "function") window.renderLabourWidget();
      }

      if (walletBox) walletBox.style.display = "block";
      if (mandiBox) mandiBox.style.display = "none";
      if (weatherBox) weatherBox.style.display = "none";
      if (toolsBox) toolsBox.style.display = "none";
      if (utilsBox) utilsBox.style.display = "none";
    }

    // B. యజమాని మోడ్ (PROVIDER) - రైతు, కూలీ కంటైనర్లు పూర్తిగా ఆఫ్
    else if (state.currentRole === "PROVIDER") {
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
      if (toolsBox) toolsBox.style.display = "none";
      if (utilsBox) utilsBox.style.display = "none";
    }

    // C. రైతు మోడ్ (FARMER)
    else {
      if (labourBox) labourBox.style.display = "none";
      if (providerBox) providerBox.style.display = "none";
      if (farmerBox) {
        farmerBox.style.display = "block";
        if (typeof window.renderFarmerWidget === "function") window.renderFarmerWidget();
      }

      if (walletBox) walletBox.style.display = "block";
      if (weatherBox) weatherBox.style.display = "block";
      if (mandiBox) mandiBox.style.display = "none";
      if (toolsBox) toolsBox.style.display = "block";
      if (utilsBox) utilsBox.style.display = "block";
    }

    if (window.WalletModule && typeof window.WalletModule.render === "function") {
      window.WalletModule.render();
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

      // పాత 'role-container' తో పనిలేదు, నేరుగా ప్రధాన కంటైనర్ లోనే చేరుతుంది
      const mount = document.querySelector(".container") || document.body;
      mount.prepend(banner);
    }

    let roleText = "రైతు (Farmer)";
    let badgeColor = "#16a34a";

    const activeRole = String(state.currentRole || 'FARMER').toUpperCase();
    if (activeRole === "LABOUR") {
      roleText = "కూలీ (Labour)";
      badgeColor = "#ea580c";
    } else if (activeRole === "PROVIDER") {
      const pType = state.providerType || "equipment";
      roleText = pType === "transport" ? "🚚 రవాణా యజమాని" : (pType === "seeds" ? "🌱 విత్తనాల డీలర్" : "🚜 పరికరాల యజమాని");
      badgeColor = pType === "transport" ? "#7b1fa2" : (pType === "seeds" ? "#2e7d32" : "#f57c00");
    }

    banner.style.setProperty("--badge-color", badgeColor);

    const nameEl = banner.querySelector(".user-name-text");
    const badgeEl = banner.querySelector(".profile-banner-badge");
    const phoneEl = banner.querySelector(".user-phone-text");
    const villageEl = banner.querySelector(".user-village-text");

    if (nameEl) nameEl.textContent = user.name || "వినియోగదారుడు";
    if (badgeEl) badgeEl.textContent = roleText;
    if (phoneEl) phoneEl.textContent = user.phone || "";
    if (villageEl) villageEl.textContent = user.village || "";
  },

  removeProfileHeader: function() {
    const banner = document.getElementById("user-profile-banner");
    if (banner) banner.remove();
  },

      renderRoleSwitchBar: function() {
    const state = window.AppState;
    if (!state || !state.isLoggedIn) {
      this.removeRoleSwitchBar();
      return;
    }

    const profile = state.userProfile || state.user || {};

    // లాగిన్ డేటాలో రోల్ ఏ ప్రాపర్టీలో ఉన్నా రీడ్ చేయడం
    const rawRole = String(
      profile.role || 
      profile.roleType || 
      profile.userType || 
      profile.type || 
      profile.accountType || 
      state.userType || 
      ''
    ).toUpperCase().trim();

    // కూలీ లేదా యజమాని డైరెక్ట్ లాగిన్ అయితే స్విచ్ బటన్లు దాగిపోతాయి
    const isDedicatedLabour = (
      rawRole === "LABOUR" || 
      rawRole === "LABOURONLY" || 
      rawRole === "LABOUR_ONLY" || 
      rawRole.includes("LABOUR")
    );
    
    const isDedicatedProvider = (
      rawRole === "PROVIDER" || 
      rawRole === "EQUIPMENT" || 
      rawRole === "TRANSPORT" || 
      rawRole === "SEEDS" || 
      rawRole.includes("PROVIDER")
    );

    if (isDedicatedLabour || isDedicatedProvider) {
      this.removeRoleSwitchBar();
      return;
    }

    let switchContainer = document.getElementById("role-switch-container");
    const tpl = document.getElementById("role-dual-switch-template");
    if (!tpl) return;

    if (!switchContainer) {
      const fragment = tpl.content.cloneNode(true);
      switchContainer = fragment.querySelector(".role-switch-container");
      switchContainer.id = "role-switch-container";

      // ప్రొఫైల్ బ్యానర్ కింద ఇన్సర్ట్ చేయడం
      const userBanner = document.getElementById("user-profile-banner");
      if (userBanner && userBanner.parentNode) {
        userBanner.parentNode.insertBefore(switchContainer, userBanner.nextSibling);
      } else {
        const mount = document.querySelector(".container") || document.body;
        mount.prepend(switchContainer);
      }
    }

    const current = String(state.currentRole || "FARMER").toUpperCase();
    const farmerBtn = switchContainer.querySelector("#role-btn-farmer");
    const labourBtn = switchContainer.querySelector("#role-btn-labour");
    const providerBtn = switchContainer.querySelector("#role-btn-provider");

    if (farmerBtn) {
      farmerBtn.className = `role-switch-btn role-switch-farmer ${current === "FARMER" ? "active" : ""}`;
      farmerBtn.onclick = () => window.switchRoleMode("FARMER");
    }
    if (labourBtn) {
      labourBtn.className = `role-switch-btn role-switch-labour ${current === "LABOUR" ? "active" : ""}`;
      labourBtn.onclick = () => window.switchRoleMode("LABOUR");
    }
    if (providerBtn) {
      providerBtn.className = `role-switch-btn role-switch-provider ${current === "PROVIDER" ? "active" : ""}`;
      providerBtn.onclick = () => window.switchRoleMode("PROVIDER");
    }
  },

  removeRoleSwitchBar: function() {
    const switchContainer = document.getElementById("role-switch-container");
    if (switchContainer) switchContainer.remove();
  },

    switchRoleMode: function(targetRole) {
    if (!window.AppState) window.AppState = {};
    window.AppState.currentRole = targetRole;

    // తాత్కాలిక మోడ్ మాత్రమే సేవ్ అవుతుంది, అసలు ప్రొఫైల్ మారదు
    localStorage.setItem("agri_current_active_role", targetRole);

    this.applyUserRoleView();

    // 🌾 రైతు డాష్‌బోర్డ్ బటన్ల యాక్టివ్ స్టేట్ అప్‌డేట్
    if (typeof window.updateFarmerSwitchBarActiveState === "function") {
      window.updateFarmerSwitchBarActiveState();
    }
  },

  logoutUser: function() {
    if (!window.AppState) window.AppState = {};
    window.AppState.isLoggedIn = false;
    window.AppState.userProfile = null;
    window.AppState.currentRole = "GUEST";
    localStorage.removeItem("agri_user_profile");
    localStorage.removeItem("agri_current_active_role");
    localStorage.removeItem("agri_user_role");
    this.applyUserRoleView();
  }
};

window.applyUserRoleView = () => window.RoleController.applyUserRoleView();
window.switchRoleMode = (r) => window.RoleController.switchRoleMode(r);
window.logoutUser = () => window.RoleController.logoutUser();

document.addEventListener("DOMContentLoaded", function() {
  window.RoleController.applyUserRoleView();
});
