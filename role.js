// role.js - Smart Role Switcher & Dynamic UI Injection

function injectRoleSwitcher() {
  if (document.getElementById("role-switch-container")) return;

  // Header కింద UI ని ఇన్సర్ట్ చేయడానికి కంటైనర్
  const switchWrapper = document.createElement("div");
  switchWrapper.id = "role-switch-container";
  switchWrapper.innerHTML = `
    <div class="role-switch-bar">
      <button id="btn-role-farmer" class="role-btn active" onclick="switchUserRole('FARMER')">
        👨‍🌾 రైతు మోడ్
      </button>
      <button id="btn-role-labour" class="role-btn" onclick="switchUserRole('LABOUR')">
        👷 కూలీ మోడ్
      </button>
    </div>
  `;

  // App Header తర్వాత లేదా బాడీ ప్రారంభంలో ఇన్సర్ట్ చేయడం
  const header = document.querySelector(".header") || document.querySelector("header") || document.body.firstChild;
  if (header && header.parentNode) {
    header.parentNode.insertBefore(switchWrapper, header.nextSibling);
  } else {
    document.body.prepend(switchWrapper);
  }

  // మొదటిసారి డిఫాల్ట్‌గా రైతు మోడ్ యాక్టివేట్ చేయడం
  switchUserRole("FARMER");
}

// Global App State
window.AppState = window.AppState || {
  currentRole: "FARMER",
  autoVoice: false,
  user: { name: "Kishore", mobile: "9876543210" }
};

// రోల్ స్విచ్ ఫంక్షన్
window.switchUserRole = function(role) {
  window.AppState.currentRole = role;

  const farmerBtn = document.getElementById("btn-role-farmer");
  const labourBtn = document.getElementById("btn-role-labour");
  const farmerContainer = document.getElementById("farmer-post-container");
  const labourContainer = document.getElementById("labour-jobs-container");

  if (role === "FARMER") {
    farmerBtn?.classList.add("active");
    labourBtn?.classList.remove("active");

    if (farmerContainer) farmerContainer.style.display = "block";
    if (labourContainer) labourContainer.style.display = "none";

    if (typeof speakTeluguText === "function") {
      speakTeluguText("రైతు మోడ్ ఆన్ చేయబడింది. కూలీలు కావాలంటే వివరాలు చెప్పండి.");
    }
  } else {
    labourBtn?.classList.add("active");
    farmerBtn?.classList.remove("active");

    if (farmerContainer) farmerContainer.style.display = "none";
    if (labourContainer) labourContainer.style.display = "block";

    if (typeof speakTeluguText === "function") {
      speakTeluguText("కూలీ మోడ్ ఆన్ చేయబడింది. మీకు అనువైన పనుల వివరాలు ఇక్కడ ఉన్నాయి.");
    }
  }
};

// పేజీ లోడ్ కాగానే రన్ అవ్వడం
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", injectRoleSwitcher);
} else {
  injectRoleSwitcher();
}
if (window.AppState && window.AppState.autoVoice && typeof speakTeluguText === "function") {
  if (role === "LABOUR") {
    speakTeluguText("కూలీ మోడ్ కి మారారు. అందుబాటులో ఉన్న పనులను చూడవచ్చు.");
  } else {
    speakTeluguText("రైతు మోడ్ కి మారారు. కూలీల కోసం పని వివరాలు చెప్పండి.");
  }
}
// role.js - Smart Login and UI Visibility Control

// 1. Screens ni Role batti set chese function
function applyUserRoleView() {
  const state = window.AppState;
  const loginCard = document.getElementById("auth-login-card");
  const roleSwitchBar = document.getElementById("role-switch-container");
  const farmerContainer = document.getElementById("farmer-dashboard-container");
  const labourContainer = document.getElementById("labour-jobs-container");
  const mandiContainer = document.getElementById("mandi-container");
  const weatherContainer = document.getElementById("weather-container");
  const walletContainer = document.getElementById("wallet-container");

  // Inka Login kani Public / Guest View
  if (!state || !state.isLoggedIn) {
    if (loginCard) loginCard.style.display = "block";
    if (roleSwitchBar) roleSwitchBar.style.display = "none";
    if (farmerContainer) farmerContainer.style.display = "none";
    if (labourContainer) labourContainer.style.display = "none";
    if (walletContainer) walletContainer.style.display = "none";
    if (mandiContainer) mandiContainer.style.display = "block";
    if (weatherContainer) weatherContainer.style.display = "block";
    return;
  }

  // Login ayyaka Login Card ni hide cheyali
  if (loginCard) loginCard.style.display = "none";

  // Case A: Direct Kooli Login (LABOUR_ONLY)
  if (state.userType === "LABOUR_ONLY") {
    if (roleSwitchBar) roleSwitchBar.style.display = "none";
    if (farmerContainer) farmerContainer.style.display = "none";
    if (mandiContainer) mandiContainer.style.display = "none";
    if (weatherContainer) weatherContainer.style.display = "none";

    if (labourContainer) labourContainer.style.display = "block";
    if (walletContainer) walletContainer.style.display = "block";
  } 
  // Case B: Raitu Login (FARMER)
  else if (state.userType === "FARMER") {
    if (roleSwitchBar) roleSwitchBar.style.display = "flex";
    if (mandiContainer) mandiContainer.style.display = "block";
    if (weatherContainer) weatherContainer.style.display = "block";
    if (walletContainer) walletContainer.style.display = "block";

    if (state.currentRole === "LABOUR") {
      if (farmerContainer) farmerContainer.style.display = "none";
      if (labourContainer) labourContainer.style.display = "block";
    } else {
      if (farmerContainer) farmerContainer.style.display = "block";
      if (labourContainer) labourContainer.style.display = "none";
    }
  }
}

// 2. Simple Login Action Function
window.performSmartLogin = function() {
  const selectedType = document.querySelector("input[name='userRoleType']:checked")?.value || "FARMER";
  const phone = document.getElementById("login-phone")?.value.trim();

  if (!phone || phone.length < 10) {
    alert("Dayachesi saraina 10 ankela mobile number enter cheyandi.");
    return;
  }

  window.AppState.isLoggedIn = true;
  window.AppState.userType = selectedType;
  window.AppState.currentRole = (selectedType === "LABOUR_ONLY") ? "LABOUR" : "FARMER";

  applyUserRoleView();

  // Voice dwara welcome message
  if (typeof speakTeluguText === "function") {
    if (selectedType === "LABOUR_ONLY") {
      speakTeluguText("కూలీ ఖాతాలోకి స్వాగతం. అందుబాటులో ఉన్న పనుల వివరాలు ఇక్కడ ఉన్నాయి.");
    } else {
      speakTeluguText("రైతు డాష్‌బోర్డ్‌కి స్వాగతం. మీ పొలం పనులకు కూలీలను నమోదు చేయవచ్చు.");
    }
  }
};

// 3. Login Box ni Page Top lo Insert cheyadam
function renderLoginCard() {
  if (document.getElementById("auth-login-card")) return;

  const card = document.createElement("div");
  card.id = "auth-login-card";
  card.style.cssText = "background:#ffffff; border:1px solid #c8e6c9; border-radius:12px; padding:16px; margin:12px auto; max-width:420px; box-shadow:0 2px 8px rgba(0,0,0,0.08); text-align:center;";
  
  card.innerHTML = `
    <h3 style="margin:0 0 10px 0; color:#2e7d32; font-size:18px;">AgriConnect Login</h3>
    <p style="font-size:13px; color:#555; margin-bottom:12px;">Meeku thagina option ni enchukoni mobile number tho login avvandi:</p>
    
    <div style="display:flex; justify-content:center; gap:16px; margin-bottom:12px; font-size:14px; font-weight:bold;">
      <label style="cursor:pointer; display:flex; align-items:center; gap:4px;">
        <input type="radio" name="userRoleType" value="LABOUR_ONLY" style="cursor:pointer;"> 👷 నేను కూలీని
      </label>
      <label style="cursor:pointer; display:flex; align-items:center; gap:4px;">
        <input type="radio" name="userRoleType" value="FARMER" checked style="cursor:pointer;"> 🌾 నేను రైతుని
      </label>
    </div>

    <input type="tel" id="login-phone" placeholder="Mobile Number (10 digits)" maxlength="10" style="width:85%; padding:9px; border:1px solid #ccc; border-radius:8px; font-size:14px; margin-bottom:10px; outline:none; text-align:center;">
    
    <button onclick="performSmartLogin()" style="width:90%; padding:10px; background:#2e7d32; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:bold; cursor:pointer;">
      ప్రవేశించండి (Login)
    </button>
  `;

  const container = document.getElementById("auto-voice-toggle-container") || document.body.firstChild;
  if (container && container.parentNode) {
    container.parentNode.insertBefore(card, container.nextSibling);
  } else {
    document.body.prepend(card);
  }
}

// Page load ayyaka setup cheyadam
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => {
    renderLoginCard();
    applyUserRoleView();
  });
} else {
  renderLoginCard();
  applyUserRoleView();
}

