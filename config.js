// ==================== COMPANY IMMUTABLE CONFIGURATION ====================
(function () {
  const companyData = Object.freeze({
    name: "AgriConnect Technologies",
    shortName: "AgriConnect",
    tagline: "The Voice of Smart Farming",
    udyamRegNo: "UDYAM-TS-31-0063048",
    location: "Maruthi Colony, Gopalpur, Hanamkonda, Telangana - 506370",
    copyrightYear: new Date().getFullYear(),
    appVersion: "v3.0.0"
  });

  Object.defineProperty(window, "COMPANY_CONFIG", {
    value: companyData,
    writable: false,
    configurable: false,
    enumerable: true
  });
})();

// Header & Footer render function
function renderCompanyDetails() {
  const config = window.COMPANY_CONFIG;
  if (!config) return;

  // 1. Header Tagline (Gold & Cursive)
  const header = document.querySelector("header");
  if (header && !document.getElementById("header-tagline")) {
    // Header flex column గా ఉండేలా సర్దుబాటు
    header.style.display = "flex";
    header.style.flexDirection = "column";
    header.style.justifyContent = "center";
    header.style.alignItems = "center";
    header.style.textAlign = "center";

    const p = document.createElement("p");
    p.id = "header-tagline";
    p.textContent = config.tagline;
    p.style.cssText = "margin: 2px 0 0 0; font-size: 11px; color: #FFD700; font-style: italic; font-family: 'Brush Script MT', 'Segoe Script', cursive, sans-serif; letter-spacing: 0.5px; font-weight: bold;";
    
    header.appendChild(p);
  }

  // 2. Footer
  let footer = document.querySelector("footer");
  if (!footer) {
    footer = document.createElement("footer");
    footer.className = "app-footer";
    document.body.appendChild(footer);
  }

  footer.innerHTML = `
    <p style="color: #4caf50; font-size: 13px; font-weight: 700; margin: 0 0 4px 0;">${config.name}</p>
    <p style="margin: 3px 0; font-size: 11px; color: #e0e0e0;">Udyam Reg: <span style="color: #ffffff;">${config.udyamRegNo}</span></p>
    <p style="margin: 3px 0; font-size: 11px; color: #cfd8dc;">📍 ${config.location}</p>
    <p style="margin-top: 8px; color: #90a4ae; font-size: 10px;">© ${config.copyrightYear} ${config.name}. All rights reserved.</p>
  `;
  footer.style.cssText = "max-width: 420px; margin: 20px auto 10px auto; text-align: center; border-top: 1px solid #333; padding: 14px 10px; line-height: 1.5;";
}

// Ensure execution
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderCompanyDetails);
} else {
  renderCompanyDetails();
}
