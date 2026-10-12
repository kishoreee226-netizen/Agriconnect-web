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

    // Header Title & Logo ని dynamic గా సెట్ చేయడం
    const headerTitle = document.querySelector("header h1");
    if (headerTitle && window.COMPANY_CONFIG.branding?.headerLogo) {
      headerTitle.innerHTML = `<img src="${window.COMPANY_CONFIG.branding.headerLogo}" alt="${window.COMPANY_CONFIG.shortName}" class="app-logo"> ${window.COMPANY_CONFIG.shortName}`;
    }
    // Footer ని dynamic గా create చేసి add చేయడం
    let footer = document.querySelector("footer");
    if (!footer) {
      footer = document.createElement("footer");
      footer.className = "app-footer";
      document.body.appendChild(footer);
    }

    footer.innerHTML = `
      <p style="color: #1b5e20; font-size: 13px; font-weight: bold; margin: 0 0 2px 0;">${window.COMPANY_CONFIG.name}</p>
      <p style="margin: 2px 0; font-size: 11px; color: #555;">Udyam Reg: ${window.COMPANY_CONFIG.udyamRegNo}</p>
      <p style="margin: 2px 0; font-size: 11px; color: #555;">📍 ${window.COMPANY_CONFIG.location}</p>
      <p style="margin-top: 6px; color: #888; font-size: 10px;">© ${window.COMPANY_CONFIG.copyrightYear} ${window.COMPANY_CONFIG.name}. All rights reserved.</p>
    `;
    footer.style.cssText = "max-width: 420px; margin: 25px auto 15px auto; text-align: center; border-top: 1px solid #ddd; padding: 12px 10px; line-height: 1.6;";

  }
}

document.addEventListener("DOMContentLoaded", renderCompanyDetails);
