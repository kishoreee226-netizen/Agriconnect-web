// role.js - AgriConnect Smart Role Controller & Orchestrator

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

function getProviderDashboardElement() {
  return document.getElementById("provider-container") || document.getElementById("provider-hub-container");
}

function applyUserRoleView() {
  const state = window.AppState;
  const farmerContainer = getFarmerDashboardElement();
  const labourContainer = getLabourDashboardElement();
  const providerContainer = getProviderDashboardElement();
  const walletContainer = document.getElementById('wallet-container');
  const mandiContainer = document.getElementById('mandi-container') || document.querySelector('.mandi-card');
  const weatherContainer = document.getElementById('weather-container') || document.querySelector('.weather-card');

  // లాగిన్ కానప్పుడు (Landing Page View)
  if (!state || !state.isLoggedIn) {
    removeProfileHeader();
    removeRoleSwitchBar();

    if (walletContainer) walletContainer.style.setProperty('display', 'none', 'important');
    if (mandiContainer) mandiContainer.style.setProperty('display', 'block', 'important');
    if (weatherContainer) weatherContainer.style.setProperty('display', 'block', 'important');

    if (typeof window.injectProviderLandingCard === 'function') {
      window.injectProviderLandingCard();
    }
    return;
  }

  // లాగిన్ అయినప్పుడు యూజర్ ప్రొఫైల్ బ్యానర్ చూపించడం
  renderUserProfileBanner();

  // 1. కూలీ మాత్రమే లాగిన్ అయినప్పుడు (LABOUR)
  if (state.userType === "LABOURONLY" || state.userType === "LABOUR") {
    removeRoleSwitchBar();
    if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
    if (providerContainer) providerContainer.style.setProperty('display', 'none', 'important');
    if (labourContainer) {
      labourContainer.style.setProperty('display', 'block', 'important');
      if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
    }
    if (walletContainer) walletContainer.style.setProperty('display', 'block', 'important');
    filterLabourJobsByLocation();
  } 
  // 2. రైతు లాగిన్ అయినప్పుడు (FARMER / Dual-role mode)
  else if (state.userType === "FARMER") {
    renderRoleSwitchBar();
    if (state.currentRole === 'LABOUR') {
      if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
      if (labourContainer) {
        labourContainer.style.setProperty('display', 'block', 'important');
        if (typeof window.renderLabourWidget === 'function') window.renderLabourWidget();
        filterLabourJobsByLocation();
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
  // 3. యంత్రాలు / వాహనాల యజమాని లాగిన్ అయినప్పుడు (PROVIDER)
  else if (state.userType === "PROVIDER") {
    removeRoleSwitchBar();
    if (farmerContainer) farmerContainer.style.setProperty('display', 'none', 'important');
    if (labourContainer) labourContainer.style.setProperty('display', 'none', 'important');
    if (walletContainer) walletContainer.style.setProperty('display', 'none', 'important');
    if (providerContainer && window.ProviderModule) {
      providerContainer.style.setProperty('display', 'block', 'important');
      window.ProviderModule.renderDashboard(providerContainer, state.providerType || 'equipment');
    }
  }
}

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
  if (state.userType === "LABOUR" || state.currentRole === "LABOUR") roleText = "కూలీ (Labour)";
  else if (state.userType === "PROVIDER") roleText = "🤝 యజమాని (Provider)";

  banner.className = 'user-profile-banner';
  banner.replaceChildren();

  const detailsDiv = document.createElement('div');
  const nameDiv = document.createElement('div');
  nameDiv.className = 'profile-banner-name';
  nameDiv.textContent = `👤 ${user.name || 'వినియోగదారుడు'} `;

  const badgeSpan = document.createElement('span');
  badgeSpan.className = 'profile-banner-badge';
  badgeSpan.textContent = roleText;
  nameDiv.appendChild(badgeSpan);

  const contactDiv = document.createElement('div');
  contactDiv.className = 'profile-banner-details';
  contactDiv.innerHTML = `📞 ${user.phone || ''} &nbsp;|&nbsp; 📍 <b>${user.village || ''}</b>`;

  detailsDiv.appendChild(nameDiv);
  detailsDiv.appendChild(contactDiv);

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'profile-banner-logout-btn';
  logoutBtn.textContent = 'Logout';
  logoutBtn.onclick = () => window.logoutUser();

  banner.appendChild(detailsDiv);
  banner.appendChild(logoutBtn);
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
  switchContainer.replaceChildren();

  const farmerBtn = document.createElement('button');
  farmerBtn.type = 'button';
  farmerBtn.className = `role-switch-btn role-switch-farmer ${isFarmerRole ? 'active' : ''}`;
  farmerBtn.textContent = '🌾 Farmer mode';
  farmerBtn.onclick = () => window.switchRoleMode('FARMER');

  const labourBtn = document.createElement('button');
  labourBtn.type = 'button';
  labourBtn.className = `role-switch-btn role-switch-labour ${!isFarmerRole ? 'active' : ''}`;
  labourBtn.textContent = '👷 Labour mode';
  labourBtn.onclick = () => window.switchRoleMode('LABOUR');

  switchContainer.appendChild(farmerBtn);
  switchContainer.appendChild(labourBtn);
}

function removeRoleSwitchBar() {
  const switchContainer = document.getElementById("role-switch-container");
  if (switchContainer) switchContainer.remove();
}

window.switchRoleMode = function(targetRole) {
  if (!window.AppState) window.AppState = {};
  window.AppState.currentRole = targetRole;
  applyUserRoleView();
};

window.logoutUser = function() {
  if (window.AuthModule) window.AuthModule.close();
  window.AppState.isLoggedIn = false;
  window.AppState.userProfile = null;
  localStorage.removeItem("agri_user_profile");
  applyUserRoleView();
};

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

window.openLoginModal = function(roleType) {
  if (window.AuthModule) window.AuthModule.open({ role: roleType || 'FARMER' });
};

document.addEventListener("DOMContentLoaded", function() {
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
    } catch (e) {}
  }
  applyUserRoleView();
});
