// role/role-loader.js - Dynamic Loader for Role Templates & Styles

(function() {
  // 1. role.css ఇంజెక్ట్ చేయడం
  if (!document.getElementById("role-css-link")) {
    const link = document.createElement("link");
    link.id = "role-css-link";
    link.rel = "stylesheet";
    link.href = "role/role.css";
    document.head.appendChild(link);
  }

  // 2. role.html టెంప్లేట్లను DOM లోకి ఫెచ్ చేయడం
  fetch("role/role.html")
    .then(response => {
      if (!response.ok) throw new Error("role.html లోడ్ కాలేదు");
      return response.text();
    })
    .then(html => {
      const div = document.createElement("div");
      div.id = "role-templates-container";
      div.style.display = "none";
      div.innerHTML = html;
      document.body.appendChild(div);

      // టెంప్లేట్లు సిద్ధమవగానే ఒకసారి వ్యూ రీ-అప్లై
      if (window.RoleController && typeof window.RoleController.applyUserRoleView === "function") {
        window.RoleController.applyUserRoleView();
      }
    })
    .catch(err => console.error("Role loader error:", err));
})();
