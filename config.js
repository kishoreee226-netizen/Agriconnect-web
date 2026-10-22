// ==================== COMPANY IMMUTABLE CONFIGURATION (TAMPER-PROOF) ====================
(function () {
  const companyData = Object.freeze({
    name: "AgriConnect Technologies",
    shortName: "AgriConnect",
    tagline: "The Voice of Smart Farming",
    udyamRegNo: "UDYAM-TS-31-0063048",
    location: "Hanamkonda, Warangal, Telangana, INDIA",
    copyrightYear: new Date().getFullYear(),
    appVersion: "v3.0.0",
    // బ్రాండింగ్ & లోగో వివరాలు
    branding: Object.freeze({
      headerLogo: "logo.png",
      icon192: "icon_192.png",
      icon512: "icon_512.png"
    })
  });

  Object.defineProperty(window, "COMPANY_CONFIG", {
    value: companyData,
    writable: false,
    configurable: false,
    enumerable: true
  });
})();

// HTML లో ఆటోమేటిక్‌గా అప్‌డేట్ అయ్యేలా చూసే ఫంక్షన్
function renderCompanyDetails() {
  const elName = document.getElementById("cmp-name");
  const elUdyam = document.getElementById("cmp-udyam");
  const elAddress = document.getElementById("cmp-address");
  const elCopyright = document.getElementById("cmp-copyright");

  if (window.COMPANY_CONFIG) {
    if (elName) elName.textContent = window.COMPANY_CONFIG.name;
    if (elUdyam) elUdyam.textContent = window.COMPANY_CONFIG.udyamRegNo;
    if (elAddress) elAddress.textContent = `📍 ${window.COMPANY_CONFIG.location}`;
    if (elCopyright) elCopyright.textContent = `© ${window.COMPANY_CONFIG.copyrightYear} ${window.COMPANY_CONFIG.name}. All rights reserved.`;

 // 1. Header Title, Logo & Tagline Setup
    let header = document.querySelector('header');
if (!header) {
  header = document.createElement('header');
  document.body.prepend(header);
}
// Header Compact Styling
header.style.cssText = "max-width: 480px; margin: 0 auto 10px auto; width: 100%; box-sizing: border-box;";

    if (!document.getElementById("header-tagline")) {
      const logoSrc = window.COMPANY_CONFIG.branding?.headerLogo || "logo.png";
      header.innerHTML = `
        <div class="header-brand">
          <img src="${logoSrc}" alt="${window.COMPANY_CONFIG.shortName}" class="header-logo" onerror="this.style.display='none'">
          <div class="brand-text">
            <h1>${window.COMPANY_CONFIG.shortName}</h1>
            <p id="header-tagline">${window.COMPANY_CONFIG.tagline}</p>
          </div>
        </div>
      `;
    }

    // 2. Footer ని dynamic గా create చేసి add చేయడం
    let footer = document.querySelector("footer");
    if (!footer) {
      footer = document.createElement("footer");
      footer.className = "app-footer";
      document.body.appendChild(footer);
    }

    footer.innerHTML = `
      <p style="color: #4caf50; font-size: 13px; font-weight: 700; margin: 0 0 4px 0; letter-spacing: 0.5px;">${window.COMPANY_CONFIG.name}</p>
      <p style="margin: 3px 0; font-size: 11px; color: #e0e0e0; font-weight: 500;">Udyam Reg: <span style="color: #ffffff;">${window.COMPANY_CONFIG.udyamRegNo}</span></p>
      <p style="margin: 3px 0; font-size: 11px; color: #cfd8dc;">📍 ${window.COMPANY_CONFIG.location}</p>
      <p style="margin-top: 8px; color: #90a4ae; font-size: 10px;">© ${window.COMPANY_CONFIG.copyrightYear} ${window.COMPANY_CONFIG.name}. All rights reserved.</p>
    `;
    
    footer.style.cssText =
      "max-width: 420px; margin: 20px auto 10px auto; text-align: center; border-top: 1px solid #333; padding: 14px 10px; line-height: 1.5;";
  }
}

// పేజీ లోడ్ అయినప్పుడు మరియు రెడీగా ఉన్నప్పుడు రన్ చేయడం
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderCompanyDetails);
} else {
  renderCompanyDetails();
}
