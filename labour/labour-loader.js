// labour/labour-loader.js - Dynamic Loader for Labour Templates & Styles

(function() {
  // 1. labour.css ఇంజెక్ట్ చేయడం
  if (!document.getElementById("labour-css-link")) {
    const link = document.createElement("link");
    link.id = "labour-css-link";
    link.rel = "stylesheet";
    link.href = "labour/labour.css";
    document.head.appendChild(link);
  }

  // 2. labour.html టెంప్లేట్లను DOM లోకి తీసుకురావడం
  fetch("labour/labour.html")
    .then(response => {
      if (!response.ok) throw new Error("labour.html లోడ్ కాలేదు");
      return response.text();
    })
    .then(html => {
      const div = document.createElement("div");
      div.id = "labour-templates-container";
      div.style.display = "none";
      div.innerHTML = html;
      document.body.appendChild(div);

      // లాగిన్ కాకపోతే ల్యాండింగ్ కార్డ్‌ను, లాగిన్ అయి కూలీ రోల్‌లో ఉంటే డాష్‌బోర్డ్‌ను చూపించడం
      if (!window.AppState || !window.AppState.isLoggedIn) {
        if (typeof window.renderLabourLandingCard === 'function') {
          window.renderLabourLandingCard();
        }
      } else if (window.AppState.currentRole === "LABOUR" || window.AppState.userType === "LABOURONLY" || window.AppState.userType === "LABOUR_ONLY") {
        if (typeof window.renderLabourWidget === 'function') {
          window.renderLabourWidget();
        }
      }
    })
    .catch(err => console.error("Labour loader error:", err));
})();
