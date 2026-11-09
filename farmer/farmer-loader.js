// farmer/farmer-loader.js - Dynamic Loader for Farmer Templates & Styles

(function() {
  // 1. farmer.css ఇంజెక్ట్ చేయడం
  if (!document.getElementById("farmer-css-link")) {
    const link = document.createElement("link");
    link.id = "farmer-css-link";
    link.rel = "stylesheet";
    link.href = "farmer/farmer.css";
    document.head.appendChild(link);
  }

  // 2. farmer.html టెంప్లేట్లను DOM లోకి తీసుకురావడం
  fetch("farmer/farmer.html")
    .then(response => {
      if (!response.ok) throw new Error("farmer.html లోడ్ కాలేదు");
      return response.text();
    })
    .then(html => {
      const div = document.createElement("div");
      div.id = "farmer-templates-container";
      div.style.display = "none";
      div.innerHTML = html;
      document.body.appendChild(div);

      // లాగిన్ కాకపోతే ల్యాండింగ్ కార్డ్‌ను, లాగిన్ అయి రైతు రోల్‌లో ఉంటే డాష్‌బోర్డ్‌ను చూపించడం
      if (!window.AppState || !window.AppState.isLoggedIn) {
        if (typeof window.renderFarmerLandingCard === 'function') {
          window.renderFarmerLandingCard();
        }
      } else if (window.AppState.currentRole === "FARMER") {
        if (typeof window.renderFarmerWidget === 'function') {
          window.renderFarmerWidget();
        }
      }
    })
    .catch(err => console.error("Farmer loader error:", err));
})();
