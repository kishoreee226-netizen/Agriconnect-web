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
    header.className = "app-header-container";

    if (!document.getElementById("header-tagline")) {
      const logoSrc = window.COMPANY_CONFIG.branding?.headerLogo || "logo.png";
      header.innerHTML = `
        <div class="header-brand">
          <img src="${logoSrc}" alt="${window.COMPANY_CONFIG.shortName}" class="header-logo" onerror="this.classList.add('is-hidden')">
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
      document.body.appendChild(footer);
    }
    footer.className = "app-footer";

    footer.innerHTML = `
      <p class="footer-company-name">${window.COMPANY_CONFIG.name}</p>
      <p class="footer-udyam-text">Udyam Reg: <span class="footer-udyam-val">${window.COMPANY_CONFIG.udyamRegNo}</span></p>
      <p class="footer-address-text">📍 ${window.COMPANY_CONFIG.location}</p>
      <p class="footer-copy-text">© ${window.COMPANY_CONFIG.copyrightYear} ${window.COMPANY_CONFIG.name}. All rights reserved.</p>
    `;
  }
}

// పేజీ లోడ్ అయినప్పుడు రన్ చేయడం
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderCompanyDetails);
} else {
  renderCompanyDetails();
}
