// role.js - AgriConnect Smart Role Cards & Dashboard Controller

// 1. రోల్స్ మరియు విడ్జెట్ల విజిబిలిటీ కంట్రోల్
function applyUserRoleView() {
  const state = window.AppState;
  const publicCardsContainer = document.getElementById("public-user-cards-container");
  const roleSwitchBar = document.getElementById("role-switch-container");

  // డాష్‌బోర్డ్ సెక్షన్‌లను గుర్తించడం
  const farmerContainer = document.getElementById("farmer-dashboard-container") || 
                          document.querySelector(".farmer-card") || 
                          document.querySelector(".farmer-section") ||
                          Array.from(document.querySelectorAll("div")).find(el => el.textContent && el.textContent.includes("రైతు Dashboard"));

  const labourContainer = document.getElementById("labour-jobs-container") || 
                          document.querySelector(".labour-section") ||
                          document.querySelector(".job-list-card");

  const mandiContainer = document.getElementById("mandi-container") || 
                         document.querySelector(".mandi-card") || 
                         Array.from(document.querySelectorAll("div")).find(el => el.textContent && el.textContent.includes("మండి / Market"));

  const walletContainer = document.getElementById("wallet-container") || 
                          document.querySelector(".wallet-card");

  // A. ఇంకా లాగిన్ కానప్పుడు (Public / Guest Landing Page)
  if (!state || !state.isLoggedIn) {
    if (publicCardsContainer) publicCardsContainer.style.display = "block";
    if (roleSwitchBar) roleSwitchBar.style.display = "none";
    if (farmerContainer) farmerContainer.style.display = "none";
    if (labourContainer) labourContainer.style.display = "none";
    if (walletContainer) walletContainer.style.display = "none";
    if (mandiContainer) mandiContainer.style.display = "block"; // మండి ధరలు పబ్లిక్‌గా కనిపిస్తాయి
    return;
  }

  // B. లాగిన్ అయిన తర్వాత ల్యాండింగ్ కార్డ్స్ దాచడం
  if (publicCardsContainer) publicCardsContainer.style.display = "none";

  // C. డైరెక్ట్ కూలీ లాగిన్ (LABOUR_ONLY)
  if (state.userType === "LABOUR_ONLY") {
    if (roleSwitchBar) roleSwitchBar.style.display = "none"; // రైతు స్విచ్ బటన్ ఉండదు
    if (farmerContainer) farmerContainer.style.display = "none";
    if (mandiContainer) mandiContainer.style.display = "none"; // కూలీకి మండి అవసరం లేదు

    if (labourContainer) labourContainer.style.display = "block"; // కూలీ పనుల లిస్ట్
    if (walletContainer) walletContainer.style.display = "block"; // కూలీ వాలెట్ మాత్రమే
  } 
  // D. రైతు లాగిన్ (FARMER - 2-in-1 Full Access)
  else if (state.userType === "FARMER") {
    if (roleSwitchBar) roleSwitchBar.style.display = "flex"; // స్మార్ట్ స్విచ్ బటన్ కనిపిస్తుంది
    if (mandiContainer) mandiContainer.style.display = "block";
    if (walletContainer) walletContainer.style.display = "block";

    // రైతు ఉన్న యాక్టివ్ రోల్ బట్టి
    if (state.currentRole === "LABOUR") {
      if (farmerContainer) farmerContainer.style.display = "none";
      if (labourContainer) labourContainer.style.display = "block";
    } else {
      if (farmerContainer) farmerContainer.style.display = "block";
      if (labourContainer) labourContainer.style.display = "none";
    }
  }
}

// 2. లాగిన్ యాక్షన్ ఫంక్షన్
window.loginAsRole = function(roleType) {
  const inputId = roleType === "FARMER" ? "farmer-phone" : "labour-phone";
  const phone = document.getElementById(inputId)?.value.trim();

  if (!phone || phone.length < 10) {
    alert("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.");
    return;
  }

  window.AppState.isLoggedIn = true;
  window.AppState.userType = roleType;
  window.AppState.currentRole = (roleType === "LABOUR_ONLY") ? "LABOUR" : "FARMER";

  applyUserRoleView();

  // లాగిన్ తర్వాత వాయిస్ వెల్‌కమ్
  if (typeof speakTeluguText === "function") {
    if (roleType === "LABOUR_ONLY") {
      speakTeluguText("కూలీ ఖాతాలోకి స్వాగతం. అందుబాటులో ఉన్న పనుల వివరాలు మరియు మీ వాలెట్ ఇక్కడ ఉన్నాయి.");
    } else {
      speakTeluguText("రైతు ఖాతాలోకి స్వాగతం. మీ పొలం పనులకు కూలీలను నమోదు చేయవచ్చు, అవసరమైతే కూలీ మోడ్‌కు కూడా మారవచ్చు.");
    }
  }
};

// 3. హోమ్‌పేజీ యూజర్ కార్డ్స్ (రైతు కార్డ్ & కూలీ కార్డ్ UI)
function renderPublicUserCards() {
  if (document.getElementById("public-user-cards-container")) return;

  const container = document.createElement("div");
  container.id = "public-user-cards-container";
  container.style.cssText = "max-width: 480px; margin: 12px auto; padding: 0 10px;";

  container.innerHTML = `
    <!-- 🌾 రైతు యూజర్ కార్డ్ -->
    <div style="background:#ffffff; border:2px solid #2e7d32; border-radius:14px; padding:16px; margin-bottom:14px; box-shadow:0 3px 10px rgba(0,0,0,0.08);">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <span style="font-size:24px;">🌾</span>
        <h3 style="margin:0; color:#2e7d32; font-size:18px;">రైతు సోదరుల కోసం (Farmer)</h3>
      </div>
      <p style="font-size:13px; color:#444; line-height:1.5; margin:6px 0 12px 0;">
        • మీ పొలం పనులకు కూలీలను వెంటనే బుక్ చేసుకోండి.<br>
        • ఉచిత జాబ్ పోస్టింగ్ & మార్కెట్ లైవ్ ధరల సమాచారం.<br>
        • <b>స్మార్ట్ ఆటో-స్విచ్:</b> సొంత పని లేనప్పుడు కూలీ మోడ్‌కి మారి ఇతర పనులకు వెళ్ళే సౌలభ్యం.
      </p>
      <div style="display:flex; gap:8px;">
        <input type="tel" id="farmer-phone" placeholder="మొబైల్ నంబర్ (10 అంకెలు)" maxlength="10" style="flex:1; padding:9px; border:1px solid #a5d6a7; border-radius:8px; font-size:14px; outline:none; text-align:center;">
        <button onclick="loginAsRole('FARMER')" style="background:#2e7d32; color:#fff; border:none; padding:9px 16px; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer;">
          రైతుగా లాగిన్
        </button>
      </div>
    </div>

    <!-- 👷 కూలీ యూజర్ కార్డ్ -->
    <div style="background:#ffffff; border:2px solid #f57c00; border-radius:14px; padding:16px; margin-bottom:14px; box-shadow:0 3px 10px rgba(0,0,0,0.08);">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <span style="font-size:24px;">👷</span>
        <h3 style="margin:0; color:#e65100; font-size:18px;">కూలీల కోసం (Labour)</h3>
      </div>
      <p style="font-size:13px; color:#444; line-height:1.5; margin:6px 0 12px 0;">
        • మీ ఊరిలో, సమీప పొలాల్లో రోజువారీ వ్యవసాయ పనులను వెతుక్కోండి.<br>
        • రోజువారీ కూలీ వివరాలు, డైరెక్ట్ ఫోన్ / వాట్సాప్ కాలింగ్.<br>
        • మీ వేతనాల లెక్కల కోసం సులభమైన <b>వ్యక్తిగత వాలెట్</b>.
      </p>
      <div style="display:flex; gap:8px;">
        <input type="tel" id="labour-phone" placeholder="మొబైల్ నంబర్ (10 అంకెలు)" maxlength="10" style="flex:1; padding:9px; border:1px solid #ffcc80; border-radius:8px; font-size:14px; outline:none; text-align:center;">
        <button onclick="loginAsRole('LABOUR_ONLY')" style="background:#f57c00; color:#fff; border:none; padding:9px 16px; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer;">
          కూలీగా లాగిన్
        </button>
      </div>
    </div>
  `;

  // ఆటో వాయిస్ టోగుల్ కింద మరియు మండి ధరల పైన కార్డ్స్‌ని అమర్చడం
  const voiceToggle = document.getElementById("auto-voice-toggle-container");
  const mandiContainer = document.getElementById("mandi-container") || document.querySelector(".mandi-card");

  if (voiceToggle && voiceToggle.parentNode) {
    voiceToggle.parentNode.insertBefore(container, voiceToggle.nextSibling);
  } else if (mandiContainer && mandiContainer.parentNode) {
    mandiContainer.parentNode.insertBefore(container, mandiContainer);
  } else {
    document.body.prepend(container);
  }
}

// పేజీ లోడ్ అయినప్పుడు ప్రారంభించడం
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => {
    renderPublicUserCards();
    applyUserRoleView();
  });
} else {
  renderPublicUserCards();
  applyUserRoleView();
}
