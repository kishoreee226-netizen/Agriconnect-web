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

    <div class="auto-voice-toggle">
      <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
        <input type="checkbox" id="auto-voice-check" onchange="toggleAutoVoice(this.checked)">
        🤖 ఆటోమేటిక్ వాయిస్ గైడెన్స్ (Auto Voice)
      </label>
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

// ఆటో వాయిస్ టోగుల్
window.toggleAutoVoice = function(isEnabled) {
  window.AppState.autoVoice = isEnabled;
  if (isEnabled && typeof speakTeluguText === "function") {
    speakTeluguText("ఆటోమేటిక్ వాయిస్ ఆన్ చేయబడింది.");
  }
};

// పేజీ లోడ్ కాగానే రన్ అవ్వడం
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", injectRoleSwitcher);
} else {
  injectRoleSwitcher();
}
