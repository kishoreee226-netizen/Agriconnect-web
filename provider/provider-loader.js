// provider/provider-loader.js - Dynamic Loader for Provider Templates & Styles

(function() {
  // 1. provider.css ఇంజెక్ట్ చేయడం
  if (!document.getElementById("provider-css-link")) {
    const link = document.createElement("link");
    link.id = "provider-css-link";
    link.rel = "stylesheet";
    link.href = "provider/provider.css";
    document.head.appendChild(link);
  }

  // 2. provider.html టెంప్లేట్లను DOM లోకి తీసుకురావడం
  fetch("provider/provider.html")
    .then(response => {
      if (!response.ok) throw new Error("provider.html లోడ్ కాలేదు");
      return response.text();
    })
    .then(html => {
      const div = document.createElement("div");
      div.id = "provider-templates-container";
      div.style.display = "none";
      div.innerHTML = html;
      document.body.appendChild(div);

      // లాగిన్ కాకపోతే ల్యాండింగ్ కార్డ్‌ను, లాగిన్ అయి ప్రొవైడర్ రోల్‌లో ఉంటే డాష్‌బోర్డ్‌ను చూపించడం
      if (!window.AppState || !window.AppState.isLoggedIn) {
        if (typeof window.renderProviderLandingCard === 'function') {
          window.renderProviderLandingCard();
        }
      } else if (window.AppState.userType === "PROVIDER" || window.AppState.currentRole === "PROVIDER") {
        if (typeof window.renderProviderDashboardView === 'function') {
          window.renderProviderDashboardView();
        }
      }
    })
    .catch(err => console.error("Provider loader error:", err));
})();
