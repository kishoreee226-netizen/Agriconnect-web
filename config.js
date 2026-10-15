// ==================== COMPANY IMMUTABLE CONFIGURATION (TAMPER-PROOF) ====================
(function () {
  const companyData = Object.freeze({
    name: "AgriConnect Technologies",
    shortName: "AgriConnect",
    tagline: "The Voice of Smart Farming",
    udyamRegNo: "UDYAM-TS-31-0063048",
    location: "Maruthi Colony, Gopalpur, Hanamkonda, Telangana - 506370",
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

        // 1. Header Title, Logo & Gold Cursive Tagline Setup
    const header = document.querySelector("header");
    if (header) {
      const headerTitle = header.querySelector("h1");
      if (headerTitle && !document.getElementById("header-tagline")) {
        const logoSrc = window.COMPANY_CONFIG.branding?.headerLogo || "logo.png";
        
                header.innerHTML = `
          <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
            <img src="${logoSrc}" alt="${window.COMPANY_CONFIG.shortName}" class="app-logo" style="width: 46px; height: 46px; object-fit: contain; flex-shrink: 0;" onerror="this.style.display='none'">
            <div style="display: flex; flex-direction: column; justify-content: center; text-align: left;">
              <h1 style="margin: 0; font-size: 23px; font-weight: 800; color: #ffffff; line-height: 1.1; letter-spacing: 0.4px;">
                ${window.COMPANY_CONFIG.shortName}
              </h1>
              <p id="header-tagline" style="
                margin: 4px 0 0 0;
                font-size: 13.5px;
                background: linear-gradient(135deg, #FFF176 0%, #FFD700 50%, #FFA000 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
                font-style: italic;
                font-family: 'Brush Script MT', 'Segoe Script', 'Great Vibes', cursive, sans-serif;
                letter-spacing: 0.8px;
                font-weight: 700;
                line-height: 1.2;
              ">
                ${window.COMPANY_CONFIG.tagline}
              </p>
            </div>
          </div>
        `;

      }
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
